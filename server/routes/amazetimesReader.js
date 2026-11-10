import express from 'express';
import { query, ensureHttpsUrl } from '../db.js';
import { formatNewsRow } from './news.js';

const router = express.Router();

const TAMIL_MONTHS = {
  '01': 'ஜனவரி', '02': 'பிப்ரவரி', '03': 'மார்ச்', '04': 'ஏப்ரல்',
  '05': 'மே', '06': 'ஜூன்', '07': 'ஜூலை', '08': 'ஆகஸ்ட்',
  '09': 'செப்டம்பர்', '10': 'அக்டோபர்', '11': 'நவம்பர்', '12': 'டிசம்பர்'
};

function getIstDateStr(dateInput = new Date()) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(d.getTime() + istOffset);
  return ist.toISOString().split('T')[0];
}

function subtractOneDayStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() - 1);
  return utc.toISOString().split('T')[0];
}

function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function cleanPlainText(text) {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .trim();
}

function splitParagraphs(text, maxChars = 1400) {
  const cleaned = cleanPlainText(text);
  if (!cleaned) return [];
  const clipped = cleaned.length > maxChars ? cleaned.slice(0, maxChars).trim() + '...' : cleaned;
  return clipped.split(/\n+/).map(p => p.trim()).filter(Boolean);
}

async function getMarketSnapshot() {
  try {
    const res = await query('SELECT data FROM site_content WHERE key = $1', ['market_rates']);
    if (res.rows.length > 0 && res.rows[0].data) {
      return res.rows[0].data;
    }
  } catch (e) {
    // ignore fallback
  }
  return {
    gold22k: '₹7,250 / கி',
    silver: '₹102.00 / கி',
    petrol: '₹100.75 / லி',
    diesel: '₹92.34 / லி',
    sensex: '79,310 ▲',
    nifty: '24,536 ▲'
  };
}

// =========================================================================
// SAFE IMAGE PROXY FOR CROSS-ORIGIN PDF EXPORT & CLIPPER CANVAS
// =========================================================================
router.get('/proxy-image', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
      return res.status(400).send('Invalid image URL');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(404).send('Image not available');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return res.status(400).send('Not an image');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Proxy error');
  }
});

// =========================================================================
// DAILY E-NEWSPAPER AGGREGATOR (D EDITION CONTAINS ALL NEWS FROM D-1)
// =========================================================================
router.get('/enewspaper', async (req, res) => {
  try {
    const todayIst = getIstDateStr();
    const editionDate = (req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
      ? req.query.date
      : todayIst;
    const editionParam = req.query.edition || 'main';
    const sourceNewsDate = subtractOneDayStr(editionDate);

    // 1. Query articles strictly published on D-1 (sourceNewsDate in IST)
    const exactRes = await query(`
      SELECT * FROM news 
      WHERE status = 'published' 
        AND (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date = $1::date
      ORDER BY is_lead_hero DESC, is_top_story DESC, is_breaking DESC, COALESCE(views_count, 0) DESC, COALESCE(published_at, created_at) DESC
    `, [sourceNewsDate]);

    let articles = exactRes.rows.map(formatNewsRow);
    const exactSourceCount = articles.length;
    let isFallbackUsed = false;
    let effectiveSourceDate = sourceNewsDate;

    // 2. If exact D-1 has fewer than 4 articles (e.g. quiet day), pull recent published news up to D-1 (so broadsheet is rich & complete)
    if (articles.length < 4) {
      isFallbackUsed = true;
      const fallbackRes = await query(`
        SELECT * FROM news 
        WHERE status = 'published' 
          AND (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date <= $1::date
        ORDER BY (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date DESC,
                 is_lead_hero DESC, is_top_story DESC, is_breaking DESC, COALESCE(views_count, 0) DESC
        LIMIT 32
      `, [sourceNewsDate]);

      const existingIds = new Set(articles.map(a => a.id));
      for (const row of fallbackRes.rows) {
        if (!existingIds.has(row.id)) {
          articles.push(formatNewsRow(row));
        }
      }

      if (articles.length > 0 && exactSourceCount === 0) {
        effectiveSourceDate = getIstDateStr(articles[0].publishedAt || articles[0].createdAt);
      }

      // If still empty (e.g. editionDate earlier than any news), pull latest published news overall
      if (articles.length === 0) {
        const anyRes = await query(`
          SELECT * FROM news 
          WHERE status = 'published' 
          ORDER BY COALESCE(published_at, created_at) DESC 
          LIMIT 28
        `);
        articles = anyRes.rows.map(formatNewsRow);
      }
    }

    // Optional edition customization: City Edition puts Chennai / Districts forward
    if (editionParam === 'city') {
      articles.sort((a, b) => {
        const aCity = (a.district === 'சென்னை' || a.category === 'தமிழ்நாடு') ? 1 : 0;
        const bCity = (b.district === 'சென்னை' || b.category === 'தமிழ்நாடு') ? 1 : 0;
        return bCity - aCity;
      });
    } else if (editionParam === 'special') {
      articles.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

    // Check saved manual/custom epaper metadata in epaper_editions
    let dbEdition = null;
    let archiveDates = [];
    try {
      const edRes = await query('SELECT * FROM epaper_editions WHERE edition_date = $1 LIMIT 1', [editionDate]);
      if (edRes.rows.length > 0) dbEdition = edRes.rows[0];

      const datesRes = await query(`
        SELECT DISTINCT ((COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date + INTERVAL '1 day')::date::text as ed_date
        FROM news
        WHERE status = 'published'
        ORDER BY ed_date DESC
        LIMIT 30
      `);
      archiveDates = datesRes.rows.map(r => r.ed_date);
    } catch (e) {
      console.warn('Archive dates query warning:', e.message);
    }

    const marketRates = await getMarketSnapshot();

    const editionsMap = {
      main: 'தமிழ்நாடு முதன்மைப் பதிப்பு (Main Edition)',
      city: 'சென்னை பெருநகரப் பதிப்பு (City Edition)',
      special: 'சிறப்புத் தொகுப்புப் பதிப்பு (Special Issue)'
    };

    const currentEditionName = editionsMap[editionParam] || editionsMap.main;

    // Group & build structured multi-column newspaper pages
    const formatForPaper = (art) => ({
      id: art.id,
      title: art.title,
      subtitle: art.subtitle || '',
      summary: cleanPlainText(art.summary || art.desc),
      paragraphs: splitParagraphs(art.content || art.summary, 950),
      category: art.category || 'தமிழ்நாடு',
      district: art.district && art.district !== 'all' ? art.district : '',
      author: art.authorName || 'அமேஸ் டைம்ஸ் செய்திக்குழு',
      image: art.mainImage || '/Amaze times.jpg',
      publishedAt: art.publishedAt || art.createdAt,
      publishedDateIst: formatDateDDMMYYYY(getIstDateStr(art.publishedAt || art.createdAt))
    });

    const formattedArticles = articles.map(formatForPaper);
    const pages = [];

    // PAGE 1: Broadsheet Front Page
    const frontLead = formattedArticles[0] || null;
    const frontSecondary = formattedArticles.slice(1, 5);
    const frontBriefs = formattedArticles.slice(5, 9);

    pages.push({
      pageNumber: 1,
      template: 'newspaper-front',
      title: `பக்கம் 1: தலைமைச் செய்திகள் (${formatDateDDMMYYYY(editionDate)})`,
      section: 'முதல் பக்கம் (Front Page)',
      editionDateFormatted: formatDateDDMMYYYY(editionDate),
      sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
      exactSourceCount,
      isFallbackUsed,
      leadArticle: frontLead,
      secondaryArticles: frontSecondary,
      briefArticles: frontBriefs,
      marketRates,
      imageUrl: frontLead?.image || '/Amaze times.jpg',
      thumbnail: frontLead?.image || '/Amaze times.jpg'
    });

    // PAGES 2+: Categorized Broadsheet Pages (4 to 5 articles per page)
    const remaining = formattedArticles.slice(9);
    const sectionOrder = [
      { key: 'tn_politics', label: 'தமிழ்நாடு & அரசியல்', cats: ['தமிழ்நாடு', 'அரசியல்', 'தமிழகம்'] },
      { key: 'districts', label: 'மாவட்டச் செய்திகள்', cats: ['மாவட்டங்கள்', 'சென்னை', 'கோவை', 'மதுரை'] },
      { key: 'biz_edu', label: 'வணிகம், கல்வி & தொழில்நுட்பம்', cats: ['வணிகம்', 'கல்வி', 'தொழில்நுட்பம்', 'வேலைவாய்ப்பு'] },
      { key: 'nat_world', label: 'தேசியம் & சர்வதேசம்', cats: ['தேசியம்', 'இந்தியா', 'உலகம்'] },
      { key: 'sports_cine', label: 'விளையாட்டு, சினிமா & ஆன்மிகம்', cats: ['விளையாட்டு', 'சினிமா', 'ஆன்மிகம்', 'தலையங்கம்'] }
    ];

    const usedIds = new Set(formattedArticles.slice(0, 9).map(a => a.id));
    let pageCounter = 2;

    for (const sec of sectionOrder) {
      const secArticles = formattedArticles.filter(
        a => !usedIds.has(a.id) && sec.cats.some(c => (a.category || '').includes(c))
      );

      for (let i = 0; i < secArticles.length; i += 4) {
        const chunk = secArticles.slice(i, i + 4);
        chunk.forEach(a => usedIds.add(a.id));
        pages.push({
          pageNumber: pageCounter++,
          template: 'newspaper-section',
          title: `பக்கம் ${pageCounter - 1}: ${sec.label}`,
          section: sec.label,
          editionDateFormatted: formatDateDDMMYYYY(editionDate),
          sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
          leadArticle: chunk[0],
          articles: chunk,
          imageUrl: chunk[0]?.image || '/Amaze times.jpg',
          thumbnail: chunk[0]?.image || '/Amaze times.jpg'
        });
      }
    }

    // Put any remaining uncategorized articles into clean continuation pages
    const leftover = formattedArticles.filter(a => !usedIds.has(a.id));
    for (let i = 0; i < leftover.length; i += 4) {
      const chunk = leftover.slice(i, i + 4);
      pages.push({
        pageNumber: pageCounter++,
        template: 'newspaper-section',
        title: `பக்கம் ${pageCounter - 1}: சிறப்புச் செய்திகள் & தொடர்ச்சி`,
        section: 'சிறப்புச் செய்திகள்',
        editionDateFormatted: formatDateDDMMYYYY(editionDate),
        sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
        leadArticle: chunk[0],
        articles: chunk,
        imageUrl: chunk[0]?.image || '/Amaze times.jpg',
        thumbnail: chunk[0]?.image || '/Amaze times.jpg'
      });
    }

    const publication = {
      id: dbEdition?.id || `epaper-${editionDate}-${editionParam}`,
      title: dbEdition?.title || `அமேஸ் டைம்ஸ் தினசரி மின்-நாளிதழ் (${formatDateDDMMYYYY(editionDate)})`,
      edition_date: editionDate,
      edition_date_display: formatDateDDMMYYYY(editionDate),
      source_news_date: sourceNewsDate,
      source_news_date_display: formatDateDDMMYYYY(sourceNewsDate),
      effective_source_date: effectiveSourceDate,
      exact_source_count: exactSourceCount,
      total_articles: formattedArticles.length,
      is_fallback_used: isFallbackUsed,
      edition_name: currentEditionName,
      edition_code: editionParam,
      pdf_url: dbEdition?.pdf_url || '',
      cover_image_url: frontLead?.image || dbEdition?.cover_image_url || '/Amaze times.jpg',
      page_count: pages.length
    };

    res.json({
      success: true,
      publication,
      pages,
      availableDates: archiveDates.length > 0 ? archiveDates : [todayIst],
      availableEditions: [
        { code: 'main', label: 'தமிழ்நாடு முதன்மைப் பதிப்பு (Main Edition)' },
        { code: 'city', label: 'சென்னை பெருநகரப் பதிப்பு (City Edition)' },
        { code: 'special', label: 'சிறப்புத் தொகுப்புப் பதிப்பு (Special Issue)' }
      ]
    });
  } catch (err) {
    console.error('AmazeTimes enewspaper endpoint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// MONTHLY MAGAZINE AGGREGATOR ("அடுத்த தலைமுறை" TEMPLATE STRUCTURE + LAST MONTH TOP NEWS)
// =========================================================================
const DEFAULT_MASTHEAD = {
  brandTitle: 'அமேஸ் டைம்ஸ்',
  subtitle: 'புலனாய்வு & செய்தி விழிப்புணர்வு மாத இதழ்',
  publisher: 'அமேஸ் டைம்ஸ் மீடியா நெட்வொர்க்',
  editor: 'தலைமை ஆசிரியர் குழு',
  specialEditors: 'அரசியல் & சமூகப் பிரிவு',
  associateEditors: 'செய்தித் தொகுப்புக் குழு',
  districtReporters: 'தமிழ்நாடு அனைத்து மாவட்ட நிருபர்கள்',
  designer: 'அமேஸ் டைம்ஸ் வடிவமைப்புப் பிரிவு',
  officeAddress: 'சென்னை, தமிழ்நாடு - 600 005.',
  contactPhone: '+91 99426 12398',
  contactEmail: 'editor@amazetimes.com',
  legalImprint: 'Printed, Published and Owned by Amaze Times Media Network. Chennai - 600 005.'
};

router.get('/magazine/candidates', async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const month = parseInt(req.query.month || (new Date().getMonth() + 1), 10);

    // Previous month window (or last 45 days up to current month end)
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const r = await query(`
      SELECT * FROM news 
      WHERE status = 'published'
      ORDER BY 
        CASE WHEN EXTRACT(YEAR FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $1 
              AND EXTRACT(MONTH FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $2 THEN 0 ELSE 1 END,
        is_lead_hero DESC,
        is_top_story DESC,
        is_breaking DESC,
        (COALESCE(views_count, 0) * 2 + COALESCE(likes_count, 0) * 5) DESC,
        COALESCE(published_at, created_at) DESC
      LIMIT 40
    `, [prevYear, prevMonth]);

    const candidates = r.rows.map(formatNewsRow).map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      summary: cleanPlainText(a.summary),
      mainImage: a.mainImage,
      viewsCount: a.viewsCount,
      likesCount: a.likesCount,
      isLeadHero: a.isLeadHero,
      isBreaking: a.isBreaking,
      publishedAt: a.publishedAt
    }));

    res.json({ success: true, candidates, targetSourceMonth: `${TAMIL_MONTHS[String(prevMonth).padStart(2, '0')] || ''} ${prevYear}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/magazine', async (req, res) => {
  try {
    const now = new Date();
    const defaultYear = String(now.getFullYear());
    const defaultMonth = String(now.getMonth() + 1).padStart(2, '0');

    const reqYear = req.query.year || defaultYear;
    const reqMonth = req.query.month ? String(req.query.month).padStart(2, '0') : defaultMonth;
    const reqId = req.query.id;

    // 1. Load stored magazines from DB
    let storedMagazines = [];
    try {
      const dbRes = await query('SELECT data FROM site_content WHERE key = $1', ['magazines']);
      if (dbRes.rows.length > 0 && Array.isArray(dbRes.rows[0].data)) {
        storedMagazines = dbRes.rows[0].data;
      }
    } catch (e) {
      console.warn('Magazines DB query error:', e.message);
    }

    // 2. Match active magazine config
    let activeMag = null;
    if (reqId) {
      activeMag = storedMagazines.find(m => String(m.id) === String(reqId));
    }
    if (!activeMag) {
      activeMag = storedMagazines.find(
        m => String(m.year) === String(reqYear) && String(m.month || '').padStart(2, '0') === reqMonth
      );
    }

    const tamilMonthName = TAMIL_MONTHS[reqMonth] || 'நவம்பர்';
    if (!activeMag) {
      activeMag = storedMagazines[0] || {
        id: `mag-${reqYear}-${reqMonth}`,
        title: `அமேஸ் டைம்ஸ் மாதாந்திர மலர் - ${tamilMonthName} ${reqYear}`,
        edition: `${tamilMonthName}-${reqYear}`,
        month: reqMonth,
        year: reqYear,
        coverImage: '',
        pdfUrl: '',
        description: `${tamilMonthName} ${reqYear} சிறப்புப் பதிப்பு — கடந்த மாதத்தின் முக்கியச் செய்திகள், புலனாய்வுக் கட்டுரைகள் மற்றும் சிறப்புப் பார்வைகள்.`
      };
    }

    const targetMonthLabel = activeMag.edition || `${TAMIL_MONTHS[String(activeMag.month || reqMonth).padStart(2, '0')] || tamilMonthName}-${activeMag.year || reqYear}`;

    // 3. Query important news from previous month + selected articles
    let prevMonthNum = parseInt(activeMag.month || reqMonth, 10) - 1;
    let prevYearNum = parseInt(activeMag.year || reqYear, 10);
    if (prevMonthNum <= 0) {
      prevMonthNum = 12;
      prevYearNum -= 1;
    }

    const newsRes = await query(`
      SELECT * FROM news 
      WHERE status = 'published'
      ORDER BY 
        CASE WHEN EXTRACT(YEAR FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $1 
              AND EXTRACT(MONTH FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $2 THEN 0 ELSE 1 END,
        is_lead_hero DESC,
        is_top_story DESC,
        is_breaking DESC,
        (COALESCE(views_count, 0) * 2 + COALESCE(likes_count, 0) * 5) DESC,
        COALESCE(published_at, created_at) DESC
      LIMIT 32
    `, [prevYearNum, prevMonthNum]);

    let rankedArticles = newsRes.rows.map(formatNewsRow);

    // Prioritize Admin's selectedArticleIds if present
    if (Array.isArray(activeMag.selectedArticleIds) && activeMag.selectedArticleIds.length > 0) {
      const selectedSet = new Set(activeMag.selectedArticleIds.map(String));
      const picked = rankedArticles.filter(a => selectedSet.has(String(a.id)));
      const rest = rankedArticles.filter(a => !selectedSet.has(String(a.id)));
      rankedArticles = [...picked, ...rest];
    }

    const bestNewsCandidates = rankedArticles.slice(0, 12).map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      mainImage: a.mainImage,
      viewsCount: a.viewsCount
    }));

    // Choose lead cover story and cover image
    const formatForMagazine = (art) => ({
      id: art.id,
      title: art.title,
      subtitle: art.subtitle || '',
      summary: cleanPlainText(art.summary || art.desc),
      paragraphs: splitParagraphs(art.content || art.summary, 1450),
      category: art.category || 'சிறப்புக் கட்டுரை',
      author: art.authorName || 'செய்தி ஆசிரியர்',
      image: art.mainImage || '/Amaze times.jpg',
      publishedDateIst: formatDateDDMMYYYY(getIstDateStr(art.publishedAt || art.createdAt))
    });

    const magStories = rankedArticles.map(formatForMagazine);
    const leadStory = magStories[0] || {
      id: 'default-lead',
      title: 'தமிழகத்தின் வளர்ச்சித் திட்டங்கள் & மக்கள் பார்வை!',
      paragraphs: ['கடந்த மாதத்தின் முக்கிய நிகழ்வுகள் மற்றும் மக்கள் நலத் திட்டங்களின் விரிவான தொகுப்பு.'],
      image: '/Amaze times.jpg',
      author: 'ஆசிரியர்'
    };

    // Custom admin cover image OR best news cover image!
    const chosenCoverImage = (activeMag.coverImage && activeMag.coverImage !== '/Amaze times.jpg')
      ? ensureHttpsUrl(activeMag.coverImage)
      : (leadStory.image || '/Amaze times.jpg');

    const masthead = {
      ...DEFAULT_MASTHEAD,
      ...(activeMag.mastheadConfig || {})
    };

    const pages = [];

    // PAGE 1: Authentic Magazine Page 1 Template (Left Masthead Table + Right Lead Story)
    pages.push({
      pageNumber: 1,
      template: 'magazine-cover-page1',
      title: `பக்கம் 1: அட்டைப்படம் & தலையங்கம்`,
      section: 'முகப்பு',
      monthYearLabel: targetMonthLabel,
      masthead,
      leadStory: {
        ...leadStory,
        image: chosenCoverImage
      },
      imageUrl: chosenCoverImage,
      thumbnail: chosenCoverImage
    });

    // PAGES 2..N-1: Two-Column Magazine Spread Pages (1-2 rich stories per page, Black Banner Pull-Headlines, Drop-caps!)
    const innerStories = magStories.slice(1, 21); // up to 20 inner articles -> 10-12 crisp magazine pages
    let pageNum = 2;

    for (let i = 0; i < innerStories.length; i += 2) {
      const pair = innerStories.slice(i, i + 2);
      const isLastBatch = i + 2 >= innerStories.length;

      pages.push({
        pageNumber: pageNum++,
        template: isLastBatch ? 'magazine-back-page' : 'magazine-spread-page',
        title: `பக்கம் ${pageNum - 1}: ${pair[0]?.category || 'சிறப்புக் கட்டுரை'}`,
        section: pair[0]?.category || 'சிறப்புப் பார்வை',
        monthYearLabel: targetMonthLabel,
        primaryStory: pair[0],
        secondaryStory: pair[1] || null,
        masthead: isLastBatch ? masthead : undefined,
        imageUrl: pair[0]?.image || '/Amaze times.jpg',
        thumbnail: pair[0]?.image || '/Amaze times.jpg'
      });
    }

    // Build available editions list including default current month if not in DB
    const editionsList = storedMagazines.length > 0
      ? storedMagazines.map(m => ({
          id: m.id,
          title: m.title,
          edition: m.edition || `${m.year} - ${m.month}`,
          month: String(m.month || '11').padStart(2, '0'),
          year: String(m.year || '2026'),
          coverImage: m.coverImage || chosenCoverImage,
          pageCount: pages.length,
          publishedDate: m.publishedDate
        }))
      : [{
          id: activeMag.id,
          title: activeMag.title,
          edition: targetMonthLabel,
          month: reqMonth,
          year: reqYear,
          coverImage: chosenCoverImage,
          pageCount: pages.length,
          publishedDate: now.toISOString()
        }];

    res.json({
      success: true,
      publication: {
        ...activeMag,
        edition: targetMonthLabel,
        coverImage: chosenCoverImage,
        pageCount: pages.length,
        sourceMonthLabel: `${TAMIL_MONTHS[String(prevMonthNum).padStart(2, '0')]} ${prevYearNum}`,
        totalArticlesIncluded: Math.min(magStories.length, 21)
      },
      pages,
      bestNewsCandidates,
      availableEditions: editionsList
    });
  } catch (err) {
    console.error('AmazeTimes magazine reader endpoint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
