import express from 'express';
import { query, ensureHttpsUrl } from '../db.js';
import { formatNewsRow } from './news.js';

const router = express.Router();

const TAMIL_MONTHS = {
  '01': 'ஜனவரி', '02': 'பிப்ரவரி', '03': 'மார்ச்', '04': 'ஏப்ரல்',
  '05': 'மே', '06': 'ஜூன்', '07': 'ஜூலை', '08': 'ஆகஸ்ட்',
  '09': 'செப்டம்பர்', '10': 'அக்டோபர்', '11': 'நவம்பர்', '12': 'டிசம்பர்'
};

const ENG_MONTHS = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December'
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
  } catch (e) {}
  return {
    gold22k: '₹7,250 / கி',
    silver: '₹102.00 / கி',
    petrol: '₹100.75 / லி',
    diesel: '₹92.34 / லி',
    sensex: '79,310 ▲',
    nifty: '24,536 ▲'
  };
}

async function getEditorialAndBlogStories() {
  const extras = [];
  try {
    const res = await query(`SELECT key, data FROM site_content WHERE key IN ('editorial_articles', 'blogs')`);
    for (const row of res.rows) {
      const arr = Array.isArray(row.data) ? row.data : [];
      if (row.key === 'editorial_articles') {
        arr.slice(0, 4).forEach((item, idx) => {
          extras.push({
            id: item.id || `editorial-${idx}`,
            title: item.title,
            subtitle: '',
            summary: cleanPlainText(item.desc || item.content),
            paragraphs: splitParagraphs(item.content || item.desc, 1300),
            category: 'தலையங்கம்',
            district: '',
            author: item.author || 'முதன்மையாசிரியர் தலையங்கக் குழு',
            image: item.image || '/Amaze times.jpg',
            publishedAt: item.date || new Date().toISOString(),
            publishedDateIst: formatDateDDMMYYYY(item.date || getIstDateStr()),
            viewsCount: 450,
            likesCount: 65
          });
        });
      } else if (row.key === 'blogs') {
        arr.slice(0, 4).forEach((item, idx) => {
          extras.push({
            id: item.id || `blog-${idx}`,
            title: item.title,
            subtitle: item.moral || '',
            summary: cleanPlainText(item.summary || item.content),
            paragraphs: splitParagraphs(item.content || item.summary, 1300),
            category: item.category || 'சிறுகதை',
            district: '',
            author: item.authorName || 'சிறப்பு எழுத்தாளர்',
            image: item.mainImage || '/Amaze times.jpg',
            publishedAt: item.createdAt || new Date().toISOString(),
            publishedDateIst: formatDateDDMMYYYY(item.createdAt || getIstDateStr()),
            viewsCount: 320,
            likesCount: item.likesCount || 50
          });
        });
      }
    }
  } catch (err) {
    console.warn('Extra site_content articles warning:', err.message);
  }
  return extras;
}

const formatForPrint = (art) => ({
  id: art.id,
  title: art.title,
  subtitle: art.subtitle || '',
  summary: cleanPlainText(art.summary || art.desc),
  paragraphs: splitParagraphs(art.content || art.summary, 1300),
  category: art.category || 'தமிழ்நாடு',
  district: art.district && art.district !== 'all' ? art.district : '',
  author: art.authorName || art.author || 'அமேஸ் டைம்ஸ் செய்திக்குழு',
  image: ensureHttpsUrl(art.mainImage || art.image || '/Amaze times.jpg'),
  publishedAt: art.publishedAt || art.createdAt,
  publishedDateIst: formatDateDDMMYYYY(getIstDateStr(art.publishedAt || art.createdAt)),
  viewsCount: art.viewsCount || 0,
  likesCount: art.likesCount || 0
});

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
// DAILY E-NEWSPAPER AGGREGATOR (D EDITION -> D-1 NEWS + FULL SECTION COVERAGE)
// =========================================================================
router.get('/enewspaper', async (req, res) => {
  try {
    const todayIst = getIstDateStr();
    const editionDate = (req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
      ? req.query.date
      : todayIst;
    const editionParam = req.query.edition || 'main';
    const sourceNewsDate = subtractOneDayStr(editionDate);

    // 1. All news published strictly on D-1 (sourceNewsDate in IST)
    const exactRes = await query(`
      SELECT * FROM news
      WHERE status = 'published'
        AND (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date = $1::date
      ORDER BY is_lead_hero DESC, is_top_story DESC, is_breaking DESC, COALESCE(views_count, 0) DESC, COALESCE(published_at, created_at) DESC
    `, [sourceNewsDate]);

    const exactArticles = exactRes.rows.map(formatNewsRow).map(formatForPrint);
    const exactSourceCount = exactArticles.length;

    // 2. Partitioned Query up to D-1: Ensures up to 7 recent news items from EVERY SINGLE category!
    const diverseRes = await query(`
      WITH ranked AS (
        SELECT *,
               ROW_NUMBER() OVER (
                 PARTITION BY category
                 ORDER BY (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date DESC,
                          is_lead_hero DESC, is_top_story DESC, COALESCE(views_count, 0) DESC
               ) as cat_rank
        FROM news
        WHERE status = 'published'
          AND (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date <= $1::date
      )
      SELECT * FROM ranked
      WHERE cat_rank <= 14
      ORDER BY (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date DESC,
               is_lead_hero DESC, is_top_story DESC, COALESCE(views_count, 0) DESC
    `, [sourceNewsDate]);

    let allPool = [...exactArticles];
    const seenIds = new Set(exactArticles.map(a => String(a.id)));

    for (const row of diverseRes.rows) {
      const formatted = formatForPrint(formatNewsRow(row));
      if (!seenIds.has(String(formatted.id))) {
        seenIds.add(String(formatted.id));
        allPool.push(formatted);
      }
    }

    // If completely empty (future/early edge case), load across whole published pool partitioned by category
    if (allPool.length < 15) {
      const anyRes = await query(`
        WITH ranked AS (
          SELECT *,
                 ROW_NUMBER() OVER (
                   PARTITION BY category
                   ORDER BY COALESCE(published_at, created_at) DESC
                 ) as cat_rank
          FROM news WHERE status = 'published'
        )
        SELECT * FROM ranked WHERE cat_rank <= 8
        ORDER BY COALESCE(published_at, created_at) DESC
      `);
      for (const row of anyRes.rows) {
        const formatted = formatForPrint(formatNewsRow(row));
        if (!seenIds.has(String(formatted.id))) {
          seenIds.add(String(formatted.id));
          allPool.push(formatted);
        }
      }
    }

    // Also include Editorials & Blogs/Stories for the Editorial Section Page
    const editorialAndBlogs = await getEditorialAndBlogStories();

    // City Edition puts Chennai/TN first, Special highlights highest views
    if (editionParam === 'city') {
      allPool.sort((a, b) => {
        const aCity = (a.district === 'சென்னை' || a.category === 'தமிழ்நாடு') ? 1 : 0;
        const bCity = (b.district === 'சென்னை' || b.category === 'தமிழ்நாடு') ? 1 : 0;
        return bCity - aCity;
      });
    } else if (editionParam === 'special') {
      allPool.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

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
    } catch (e) {}

    const marketRates = await getMarketSnapshot();
    const editionsMap = {
      main: 'தமிழ்நாடு முதன்மைப் பதிப்பு (Main Edition)',
      city: 'சென்னை பெருநகரப் பதிப்பு (City Edition)',
      special: 'சிறப்புத் தொகுப்புப் பதிப்பு (Special Issue)'
    };
    const currentEditionName = editionsMap[editionParam] || editionsMap.main;

    const pages = [];
    const usedOnPages = new Set();

    // PAGE 1: Broadsheet Front Page (1 Lead + 3 Secondary Bottom + 5 Briefs = 9 articles!)
    const frontLead = allPool[0] || null;
    const frontSecondary = allPool.slice(1, 4);
    const frontBriefs = allPool.slice(4, 9);
    [frontLead, ...frontSecondary, ...frontBriefs].forEach(a => a && usedOnPages.add(String(a.id)));

    pages.push({
      pageNumber: 1,
      template: 'newspaper-front',
      title: `பக்கம் 1: தலைமைச் செய்திகள் (${formatDateDDMMYYYY(editionDate)})`,
      section: 'முதல் பக்கம் (Front Page)',
      editionDateFormatted: formatDateDDMMYYYY(editionDate),
      sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
      exactSourceCount,
      isFallbackUsed: exactSourceCount < 4,
      leadArticle: frontLead,
      secondaryArticles: frontSecondary,
      briefArticles: frontBriefs,
      marketRates,
      imageUrl: frontLead?.image || '/Amaze times.jpg',
      thumbnail: frontLead?.image || '/Amaze times.jpg'
    });

    // Helper to collect remaining stories for each category (up to 7 per page = rich full newspaper page!)
    const pullCategoryStories = (cats, limit = 7) => {
      const picked = [];
      for (const a of allPool) {
        if (picked.length >= limit) break;
        if (!usedOnPages.has(String(a.id)) && cats.some(c => (a.category || '').includes(c))) {
          picked.push(a);
          usedOnPages.add(String(a.id));
        }
      }
      return picked;
    };

    const sectionDefinitions = [
      { label: 'தமிழ்நாடு முதன்மைச் செய்திகள்', cats: ['தமிழ்நாடு', 'தமிழகம்'], limit: 7 },
      { label: 'தமிழக அரசியல் களம்', cats: ['அரசியல்'], limit: 7 },
      { label: 'மாவட்டச் செய்திகள் (Districts)', cats: ['மாவட்ட', 'தமிழ்நாடு'], limit: 7 },
      { label: 'தேசியம் (இந்தியா)', cats: ['தேசியம்', 'இந்தியா'], limit: 7 },
      { label: 'சர்வதேசம் & உலக நிகழ்வுகள்', cats: ['உலகம்'], limit: 7 },
      { label: 'வணிகம், கல்வி & தொழில்நுட்பம்', cats: ['வணிகம்', 'கல்வி', 'தொழில்நுட்பம்'], limit: 7 },
      { label: 'விளையாட்டு அரங்கம்', cats: ['விளையாட்டு'], limit: 7 },
      { label: 'சினிமா & கலை உலகம்', cats: ['சினிமா'], limit: 7 }
    ];

    let pageCounter = 2;
    let totalRenderedArticles = [frontLead, ...frontSecondary, ...frontBriefs].filter(Boolean).length;

    for (const sec of sectionDefinitions) {
      let chunk = pullCategoryStories(sec.cats, sec.limit);
      // Ensure every category gets full coverage even if used earlier on front page
      if (chunk.length < 3) {
        const extraSameCat = allPool.filter(a => sec.cats.some(c => (a.category || '').includes(c)) && !chunk.includes(a));
        chunk = [...chunk, ...extraSameCat.slice(0, sec.limit - chunk.length)];
      }
      if (chunk.length > 0) {
        totalRenderedArticles += chunk.length;
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

    // Add Dedicated Editorial, Opinions & Literature Page!
    if (editorialAndBlogs.length > 0) {
      const edChunk = editorialAndBlogs.slice(0, 6);
      totalRenderedArticles += edChunk.length;
      pages.push({
        pageNumber: pageCounter++,
        template: 'newspaper-section',
        title: `பக்கம் ${pageCounter - 1}: தலையங்கம், வலைப்பதிவு & சிறுகதை`,
        section: 'தலையங்கம் & சிறப்புப் பார்வை',
        editionDateFormatted: formatDateDDMMYYYY(editionDate),
        sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
        leadArticle: edChunk[0],
        articles: edChunk,
        imageUrl: edChunk[0]?.image || '/Amaze times.jpg',
        thumbnail: edChunk[0]?.image || '/Amaze times.jpg'
      });
    }

    const publication = {
      id: dbEdition?.id || `epaper-${editionDate}-${editionParam}`,
      title: dbEdition?.title || `அமேஸ் டைம்ஸ் தினசரி மின்-நாளிதழ் (${formatDateDDMMYYYY(editionDate)})`,
      edition_date: editionDate,
      edition_date_display: formatDateDDMMYYYY(editionDate),
      source_news_date: sourceNewsDate,
      source_news_date_display: formatDateDDMMYYYY(sourceNewsDate),
      exact_source_count: exactSourceCount,
      total_articles: totalRenderedArticles,
      is_fallback_used: exactSourceCount < 4,
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
// MONTHLY MAGAZINE AGGREGATOR (GLOSSY COVER TEMPLATE + FULL SECTION COVERAGE)
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

    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    // Fetch top best stories balanced across ALL categories from last month / top pool
    const r = await query(`
      WITH ranked AS (
        SELECT *,
               ROW_NUMBER() OVER (
                 PARTITION BY category
                 ORDER BY CASE WHEN EXTRACT(YEAR FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $1 
                                AND EXTRACT(MONTH FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $2 THEN 0 ELSE 1 END,
                          is_lead_hero DESC, is_top_story DESC,
                          (COALESCE(views_count, 0) * 2 + COALESCE(likes_count, 0) * 5) DESC,
                          COALESCE(published_at, created_at) DESC
               ) as cat_rank
        FROM news WHERE status = 'published'
      )
      SELECT * FROM ranked WHERE cat_rank <= 6
      ORDER BY is_lead_hero DESC, is_top_story DESC, is_breaking DESC,
               (COALESCE(views_count, 0) * 2 + COALESCE(likes_count, 0) * 5) DESC,
               COALESCE(published_at, created_at) DESC
      LIMIT 48
    `, [prevYear, prevMonth]);

    const candidates = r.rows.map(formatNewsRow).map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      summary: cleanPlainText(a.summary),
      mainImage: ensureHttpsUrl(a.mainImage),
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

    let storedMagazines = [];
    try {
      const dbRes = await query('SELECT data FROM site_content WHERE key = $1', ['magazines']);
      if (dbRes.rows.length > 0 && Array.isArray(dbRes.rows[0].data)) {
        storedMagazines = dbRes.rows[0].data;
      }
    } catch (e) {}

    let activeMag = null;
    if (reqId) {
      activeMag = storedMagazines.find(m => String(m.id) === String(reqId));
    }
    if (!activeMag) {
      activeMag = storedMagazines.find(
        m => String(m.year) === String(reqYear) && String(m.month || '').padStart(2, '0') === reqMonth
      );
    }

    const useYear = String(activeMag?.year || reqYear);
    const useMonth = String(activeMag?.month || reqMonth).padStart(2, '0');
    const tamilMonthName = TAMIL_MONTHS[useMonth] || 'நவம்பர்';
    const engMonthName = ENG_MONTHS[useMonth] || 'November';

    if (!activeMag) {
      activeMag = {
        id: `mag-${useYear}-${useMonth}`,
        title: `அமேஸ் டைம்ஸ் மாதாந்திர மலர் - ${tamilMonthName} ${useYear}`,
        edition: `${tamilMonthName}-${useYear}`,
        month: useMonth,
        year: useYear,
        volumeNo: '05',
        issueNo: useMonth,
        priceLabel: 'ரூ. 22/-',
        coverImage: '',
        coverHeadline: '',
        pdfUrl: '',
        description: `${tamilMonthName} ${useYear} சிறப்புப் பதிப்பு — கடந்த மாதத்தின் முக்கிய அரசியல், தமிழ்நாடு, வணிகம், கல்வி, விளையாட்டு மற்றும் சிறப்புப் பார்வைகள்.`
      };
    }

    const targetMonthLabel = activeMag.edition || `${tamilMonthName}-${useYear}`;

    let prevMonthNum = parseInt(useMonth, 10) - 1;
    let prevYearNum = parseInt(useYear, 10);
    if (prevMonthNum <= 0) {
      prevMonthNum = 12;
      prevYearNum -= 1;
    }

    // Partitioned Query across ALL categories ensuring 4 top stories from every section!
    const newsRes = await query(`
      WITH ranked AS (
        SELECT *,
               ROW_NUMBER() OVER (
                 PARTITION BY category
                 ORDER BY CASE WHEN EXTRACT(YEAR FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $1 
                                AND EXTRACT(MONTH FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $2 THEN 0 ELSE 1 END,
                          is_lead_hero DESC, is_top_story DESC,
                          (COALESCE(views_count, 0) * 2 + COALESCE(likes_count, 0) * 5) DESC,
                          COALESCE(published_at, created_at) DESC
               ) as cat_rank
        FROM news WHERE status = 'published'
      )
      SELECT * FROM ranked WHERE cat_rank <= 4
      ORDER BY is_lead_hero DESC, is_top_story DESC, is_breaking DESC,
               (COALESCE(views_count, 0) * 2 + COALESCE(likes_count, 0) * 5) DESC,
               COALESCE(published_at, created_at) DESC
      LIMIT 40
    `, [prevYearNum, prevMonthNum]);

    let rankedArticles = newsRes.rows.map(formatNewsRow).map(formatForPrint);

    // Append Editorials & Short Stories for literature/opinion pages in the magazine!
    const extraContent = await getEditorialAndBlogStories();
    rankedArticles = [...rankedArticles, ...extraContent];

    // If Admin specifically selected stories, prioritize them first
    if (Array.isArray(activeMag.selectedArticleIds) && activeMag.selectedArticleIds.length > 0) {
      const selectedSet = new Set(activeMag.selectedArticleIds.map(String));
      const picked = rankedArticles.filter(a => selectedSet.has(String(a.id)));
      const rest = rankedArticles.filter(a => !selectedSet.has(String(a.id)));
      rankedArticles = [...picked, ...rest];
    }

    const bestNewsCandidates = rankedArticles.slice(0, 15).map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      mainImage: a.image,
      viewsCount: a.viewsCount
    }));

    const leadStory = rankedArticles[0] || {
      id: 'default-lead',
      title: 'தமிழகத்தின் வளர்ச்சித் திட்டங்கள் & மக்கள் பார்வை!',
      paragraphs: ['கடந்த மாதத்தின் முக்கிய நிகழ்வுகள் மற்றும் மக்கள் நலத் திட்டங்களின் விரிவான தொகுப்பு.'],
      image: '/Amaze times.jpg',
      author: 'ஆசிரியர்',
      category: 'அரசியல் & சிறப்புப் பார்வை'
    };

    const chosenCoverImage = (activeMag.coverImage && activeMag.coverImage !== '/Amaze times.jpg')
      ? ensureHttpsUrl(activeMag.coverImage)
      : (leadStory.image || '/Amaze times.jpg');

    const masthead = {
      ...DEFAULT_MASTHEAD,
      ...(activeMag.mastheadConfig || {})
    };

    const pages = [];

    // PAGE 1: GLOSSY FRONT COVER MATCHING UPLOADED SAMPLE FORMAT (Blue Header + Red Strip + Full Bleed Photo + Stroked Headline!)
    pages.push({
      pageNumber: 1,
      template: 'magazine-front-cover',
      title: `பக்கம் 1: சிறப்பு அட்டைப்படம் (${targetMonthLabel})`,
      section: 'அட்டைப்படம் (Cover)',
      monthYearLabel: targetMonthLabel,
      monthTamil: tamilMonthName,
      monthEng: engMonthName,
      year: useYear,
      volumeNo: activeMag.volumeNo || '05',
      issueNo: activeMag.issueNo || useMonth,
      priceLabel: activeMag.priceLabel || 'விலை : இலவசம்',
      coverHeadline: activeMag.coverHeadline || leadStory.title,
      coverCategory: leadStory.category || 'சிறப்புப் பார்வை',
      coverImage: chosenCoverImage,
      imageUrl: chosenCoverImage,
      thumbnail: chosenCoverImage
    });

    // PAGE 2: EDITORIAL MASTHEAD TABLE + LEAD COVER FEATURE ("அடுத்த தலைமுறை" Page 1 Layout!)
    pages.push({
      pageNumber: 2,
      template: 'magazine-editorial-masthead',
      title: `பக்கம் 2: ஆசிரியர் பக்கம் & முதன்மைக் கட்டுரை`,
      section: 'தலையங்கம் & முகப்பு',
      monthYearLabel: targetMonthLabel,
      masthead,
      leadStory: {
        ...leadStory,
        image: chosenCoverImage
      },
      imageUrl: chosenCoverImage,
      thumbnail: chosenCoverImage
    });

    // PAGES 3..N: BALANCED SECTION-WISE SPREADS COVERING ALL CATEGORIES (4 stories per bucket!)
    const innerStories = rankedArticles.slice(1);
    let pageNum = 3;

    // Order by meaningful magazine flow: தமிழ்நாடு -> அரசியல் -> தேசியம் -> உலகம் -> வணிகம்/கல்வி -> விளையாட்டு/சினிமா -> தலையங்கம்/சிறுகதை
    const secBuckets = [
      { label: 'தமிழ்நாடு சிறப்புச் செய்திகள்', cats: ['தமிழ்நாடு'] },
      { label: 'அரசியல் அலசல்', cats: ['அரசியல்'] },
      { label: 'தேசியம் & உலகப் பார்வை', cats: ['தேசியம்', 'உலகம்'] },
      { label: 'வணிகம், கல்வி & வளர்ச்சி', cats: ['வணிகம்', 'கல்வி'] },
      { label: 'விளையாட்டு & சினிமா ரசனை', cats: ['விளையாட்டு', 'சினிமா'] },
      { label: 'தலையங்கம் & சிறுகதை அரங்கம்', cats: ['தலையங்கம்', 'சிறுகதை', 'நிதி'] }
    ];

    const sortedInner = [];
    const seenInner = new Set();
    for (const b of secBuckets) {
      let countForBucket = 0;
      for (const s of innerStories) {
        if (countForBucket >= 4) break;
        if (!seenInner.has(String(s.id)) && b.cats.some(c => (s.category || '').includes(c))) {
          sortedInner.push({ ...s, magazineSectionLabel: b.label });
          seenInner.add(String(s.id));
          countForBucket++;
        }
      }
    }

    for (let i = 0; i < sortedInner.length; i += 2) {
      const pair = sortedInner.slice(i, i + 2);
      const isLastBatch = i + 2 >= sortedInner.length;

      pages.push({
        pageNumber: pageNum++,
        template: isLastBatch ? 'magazine-back-page' : 'magazine-spread-page',
        title: `பக்கம் ${pageNum - 1}: ${pair[0]?.magazineSectionLabel || pair[0]?.category || 'சிறப்புக் கட்டுரை'}`,
        section: pair[0]?.magazineSectionLabel || pair[0]?.category || 'சிறப்புப் பார்வை',
        monthYearLabel: targetMonthLabel,
        primaryStory: pair[0],
        secondaryStory: pair[1] || null,
        masthead: isLastBatch ? masthead : undefined,
        imageUrl: pair[0]?.image || '/Amaze times.jpg',
        thumbnail: pair[0]?.image || '/Amaze times.jpg'
      });
    }

    const editionsList = storedMagazines.length > 0
      ? storedMagazines.map(m => ({
          id: m.id,
          title: m.title,
          edition: m.edition || `${m.year} - ${m.month}`,
          month: String(m.month || useMonth).padStart(2, '0'),
          year: String(m.year || useYear),
          coverImage: m.coverImage || chosenCoverImage,
          pageCount: pages.length,
          publishedDate: m.publishedDate
        }))
      : [{
          id: activeMag.id,
          title: activeMag.title,
          edition: targetMonthLabel,
          month: useMonth,
          year: useYear,
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
        coverHeadline: activeMag.coverHeadline || leadStory.title,
        pageCount: pages.length,
        sourceMonthLabel: `${TAMIL_MONTHS[String(prevMonthNum).padStart(2, '0')]} ${prevYearNum}`,
        totalArticlesIncluded: sortedInner.length + 1
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
