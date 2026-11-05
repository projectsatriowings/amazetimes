import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Fallback high-quality curated magazines list
const sampleMagazines = [
  {
    id: 'mag-2026-11',
    title: 'அமேஸ் டைம்ஸ் மாதாந்திர மின்-இதழ் - நவம்பர் 2026',
    edition: 'நவம்பர் 2026 தீபாவளி சிறப்பு மலர்',
    month: '11',
    year: '2026',
    coverImage: '/Amaze times.jpg',
    pdfUrl: '/Amaze times.jpg',
    pageCount: 32,
    description: 'தீபாவளி பண்டிகை சிறப்பு மலர், தமிழகத் தொழில்துறை முன்னேற்றம், AI எதிர்காலம் மற்றும் புதிய சிறுகதைகள்.',
    publishedDate: '2026-11-01'
  },
  {
    id: 'mag-2026-10',
    title: 'அமேஸ் டைம்ஸ் மாதாந்திர மலர் - அக்டோபர் 2026',
    edition: 'அக்டோபர் 2026',
    month: '10',
    year: '2026',
    coverImage: '/Amaze times.jpg',
    pdfUrl: '/Amaze times.jpg',
    pageCount: 28,
    description: 'தமிழ்நாட்டின் உள்கட்டமைப்பு திட்டங்கள், வணிகம், தொழில்நுட்பம் மற்றும் ஆன்மிகச் சிறப்பிதழ்.',
    publishedDate: '2026-10-01'
  },
  {
    id: 'mag-2026-09',
    title: 'அமேஸ் டைம்ஸ் மாதாந்திர மலர் - செப்டம்பர் 2026',
    edition: 'செப்டம்பர் 2026',
    month: '09',
    year: '2026',
    coverImage: '/Amaze times.jpg',
    pdfUrl: '/Amaze times.jpg',
    pageCount: 24,
    description: 'கல்வி, வேலைவாய்ப்பு வழிகாட்டுதல் மற்றும் இளைய தலைமுறை சாதனையாளர்கள் சிறப்புப் பார்வை.',
    publishedDate: '2026-09-01'
  }
];

// Helper to generate realistic magazine pages
function generateMagazinePages(magazine) {
  const total = magazine.pageCount || 32;
  const sections = [
    { title: 'அட்டைப்படம் (Cover Story)', tag: 'முகப்பு' },
    { title: 'ஆசிரியர் பக்கம் & பொருளடக்கம்', tag: 'தலையங்கம்' },
    { title: 'தமிழகத்தின் புதிய உள்கட்டமைப்பு புரட்சி', tag: 'சிறப்புக் கட்டுரை' },
    { title: 'டிஜிட்டல் எதிர்காலம்: தமிழக AI மையங்கள்', tag: 'தொழில்நுட்பம்' },
    { title: 'பங்குச்சந்தை & சிறு முதலீட்டாளர் வழிகாட்டி', tag: 'வணிகம்' },
    { title: 'தீபாவளி பலகாரங்கள்: பாரம்பரியமும் ஆரோக்கியமும்', tag: 'வாழ்க்கைமுறை' },
    { title: 'நவம்பர் மாதப் பிரத்யேக சிறுகதை', tag: 'இலக்கியம்' },
    { title: 'பாரதியார் கவிதைத் தடம் - புதிய பார்வை', tag: 'கவிதை அரங்கம்' },
    { title: 'சினிமா பார்வை: இந்த மாதத் திரைப்படங்கள்', tag: 'சினிமா' },
    { title: 'இளைய தலைமுறை விளையாட்டு சாதனையாளர்கள்', tag: 'விளையாட்டு' },
    { title: 'கல்வி & உலகளாவிய வேலைவாய்ப்புகள் 2026', tag: 'கல்வி' },
    { title: 'ஆன்மிகப் பயணம்: திருக்குற்றால அருவிக் கோயில்கள்', tag: 'ஆன்மிகம்' },
    { title: 'சுற்றுச்சூழல் விழிப்புணர்வு & பசுமைத் தமிழகம்', tag: 'சமூகம்' },
    { title: 'அமேஸ் டைம்ஸ் குறுக்கெழுத்துப் புதிர் 108', tag: 'புதிர் அரங்கம்' },
    { title: 'சிறார் உலகம்: அறிவியல் சோதனைகளும் கதைகளும்', tag: 'சிறார் பகுதி' },
    { title: 'வாசகர் மேடை: வாசகர்களின் தேர்ந்தெடுக்கப்பட்ட படைப்புகள்', tag: 'வாசகர் வட்டம்' },
    { title: 'சமையல் கலை & உணவே மருந்து', tag: 'சமையல்' },
    { title: 'வாகன உலகம்: புதிய எலெக்ட்ரிக் கார்கள் & பைக்குகள்', tag: 'ஆட்டோமொபைல்' },
    { title: 'மனநலம் & யோகா: அன்றாட வாழ்வின் அமைதி', tag: 'நல்வாழ்வு' },
    { title: 'வரலாற்றுச் சுவடுகள்: சோழர்களின் கடற்படை ரகசியம்', tag: 'வரலாறு' },
    { title: 'நவீன விவசாயம்: இயற்கை உரம் தயாரிக்கும் எளிய முறை', tag: 'விவசாயம்' },
    { title: 'உலகச் சுவாரசியங்கள்: வியக்கவைக்கும் கண்டுபிடிப்புகள்', tag: 'சர்வதேசம்' },
    { title: 'புகைப்படக் கலைக்களஞ்சியம்: தமிழகத் திருவிழாக்கள்', tag: 'புகைப்படம்' },
    { title: 'பின் அட்டை & அடுத்த மாத முன்னோட்டம்', tag: 'பின் அட்டை' }
  ];

  return Array.from({ length: total }, (_, i) => {
    const pageNum = i + 1;
    const sec = sections[i % sections.length];
    return {
      pageNumber: pageNum,
      title: `பக்கம் ${pageNum}: ${sec.title}`,
      section: sec.tag,
      imageUrl: magazine.coverImage || '/Amaze times.jpg',
      thumbnail: magazine.coverImage || '/Amaze times.jpg'
    };
  });
}

// Helper to generate realistic e-newspaper broadsheet pages
function generateNewspaperPages(date, editionName, pageCount = 16) {
  const sections = [
    { title: 'தலைமைச் செய்தி & தமிழ்நாடு முக்கிய நிகழ்வுகள்', tag: 'சென்னை & தமிழ்நாடு' },
    { title: 'சென்னை பெருநகர வளர்ச்சி & மாநகராட்சி செய்திகள்', tag: 'சென்னை' },
    { title: 'தமிழக அரசியல் & சட்டமன்ற நடவடிக்கைகள்', tag: 'அரசியல்' },
    { title: 'வணிக முரசு: பங்குச்சந்தை, தங்கம் & வர்த்தகம்', tag: 'வணிகம்' },
    { title: 'தேசியச் செய்திகள் & புதுதில்லி நடப்புகள்', tag: 'தேசியம்' },
    { title: 'தலையங்கம், சிறப்புப் பார்வை & வாசகர் கடிதங்கள்', tag: 'தலையங்கம்' },
    { title: 'சர்வதேச அரசியல் & உலக நாட்டு நடப்புகள்', tag: 'சர்வதேசம்' },
    { title: 'விளையாட்டுக் களம்: கிரிக்கெட் & உள்ளூர் போட்டிகள்', tag: 'விளையாட்டு' },
    { title: 'வட மாவட்டங்கள்: வேலூர், திருவண்ணாமலை, காஞ்சிபுரம்', tag: 'மண்டலம் 1' },
    { title: 'மேற்கு மண்டலம்: கோயம்புத்தூர், திருப்பூர், ஈரோடு', tag: 'கொங்கு மண்டலம்' },
    { title: 'தென் மாவட்டங்கள்: மதுரை, திருநெல்வேலி, கன்னியாகுமரி', tag: 'தென் மண்டலம்' },
    { title: 'டெல்டா பாசனம்: தஞ்சாவூர், திருவாரூர், நாகப்பட்டினம்', tag: 'டெல்டா' },
    { title: 'கல்விச் சுடர் & அரசு வேலைவாய்ப்பு அறிவிப்புகள்', tag: 'கல்வி & வேலை' },
    { title: 'அறிவியல், தகவல் தொழில்நுட்பம் & புதுமைகள்', tag: 'தொழில்நுட்பம்' },
    { title: 'சினிமா ரசனை: கோலிவுட் படப்பிடிப்புத் தகவல்கள்', tag: 'சினிமா' },
    { title: 'கடைசிப் பக்கம்: சுவாரசிய நிகழ்வுகள் & காலநிலை நிலவரம்', tag: 'சிறப்புப் பார்வை' }
  ];

  return Array.from({ length: pageCount }, (_, i) => {
    const pageNum = i + 1;
    const sec = sections[i % sections.length];
    return {
      pageNumber: pageNum,
      title: `பக்கம் ${pageNum} - ${sec.title}`,
      section: sec.tag,
      imageUrl: '/Amaze times.jpg',
      thumbnail: '/Amaze times.jpg'
    };
  });
}

// GET /api/amazetimes/magazine
router.get('/magazine', async (req, res) => {
  try {
    const { year, month, id } = req.query;

    let storedMagazines = sampleMagazines;
    try {
      const dbRes = await query('SELECT data FROM site_content WHERE key = $1', ['magazines']);
      if (dbRes.rows.length > 0 && Array.isArray(dbRes.rows[0].data) && dbRes.rows[0].data.length > 0) {
        storedMagazines = dbRes.rows[0].data;
      }
    } catch (e) {
      console.warn('Fallback to sample magazines:', e.message);
    }

    let activeMag = storedMagazines[0];
    if (id) {
      activeMag = storedMagazines.find(m => String(m.id) === String(id)) || activeMag;
    } else if (year && month) {
      activeMag = storedMagazines.find(m => String(m.year) === String(year) && String(m.month).padStart(2, '0') === String(month).padStart(2, '0')) || activeMag;
    }

    const pages = generateMagazinePages(activeMag);

    res.json({
      success: true,
      publication: activeMag,
      pages,
      availableEditions: storedMagazines.map(m => ({
        id: m.id,
        title: m.title,
        edition: m.edition || `${m.year} - ${m.month}`,
        month: m.month,
        year: m.year,
        coverImage: m.coverImage || '/Amaze times.jpg',
        pageCount: m.pageCount || 32,
        publishedDate: m.publishedDate
      }))
    });
  } catch (err) {
    console.error('AmazeTimes magazine reader endpoint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/amazetimes/enewspaper
router.get('/enewspaper', async (req, res) => {
  try {
    const dateQuery = req.query.date || new Date().toISOString().split('T')[0];
    const editionParam = req.query.edition || 'main';

    let dbEdition = null;
    let archiveEditions = [];

    try {
      const dbRes = await query(
        'SELECT id, title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb FROM epaper_editions WHERE edition_date = $1 LIMIT 1',
        [dateQuery]
      );
      if (dbRes.rows.length > 0) {
        dbEdition = dbRes.rows[0];
      }

      const archiveRes = await query(
        'SELECT id, title, edition_date, page_count, file_size_mb FROM epaper_editions ORDER BY edition_date DESC LIMIT 30'
      );
      archiveEditions = archiveRes.rows;
    } catch (e) {
      console.warn('Epaper DB query fallback:', e.message);
    }

    const editionsMap = {
      main: 'தமிழ்நாடு முதன்மைப் பதிப்பு (Main Edition)',
      city: 'சென்னை பெருநகரப் பதிப்பு (City Edition)',
      special: 'வாராந்திர ஞாயிறு சிறப்பு மலர் (Special Issue)'
    };

    const currentEditionTitle = editionsMap[editionParam] || editionsMap.main;
    const pageCount = dbEdition?.page_count || 16;
    const publication = {
      id: dbEdition?.id || `epaper-${dateQuery}-${editionParam}`,
      title: dbEdition?.title || `அமேஸ் டைம்ஸ் நாளிதழ் - ${dateQuery}`,
      edition_date: dateQuery,
      edition_name: currentEditionTitle,
      edition_code: editionParam,
      pdf_url: dbEdition?.pdf_url || '/Amaze times.jpg',
      cover_image_url: dbEdition?.cover_image_url || '/Amaze times.jpg',
      page_count: pageCount,
      file_size_mb: dbEdition?.file_size_mb || 14.5
    };

    const pages = generateNewspaperPages(dateQuery, currentEditionTitle, pageCount);

    // Generate recent 14 calendar dates if DB archive is small
    const availableDates = archiveEditions.length > 0 
      ? archiveEditions.map(a => a.edition_date)
      : Array.from({ length: 14 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        });

    res.json({
      success: true,
      publication,
      pages,
      availableDates,
      availableEditions: [
        { code: 'main', label: 'தமிழ்நாடு முதன்மைப் பதிப்பு (Main Edition)' },
        { code: 'city', label: 'சென்னை பெருநகரப் பதிப்பு (City Edition)' },
        { code: 'special', label: 'ஞாயிறு சிறப்பு மலர் (Sunday Special Issue)' }
      ]
    });
  } catch (err) {
    console.error('AmazeTimes enewspaper reader endpoint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

