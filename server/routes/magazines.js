import express from 'express';
import { query, ensureHttpsUrl } from '../db.js';

const router = express.Router();

const defaultMagazinesList = [
  {
    id: 'mag-2026-11',
    title: 'அமேஸ் டைம்ஸ் மாதாந்திர மலர் - நவம்பர் 2026',
    edition: 'நவம்பர் 2026',
    month: '11',
    year: '2026',
    coverImage: '',
    coverHeadline: '',
    pdfUrl: '',
    pageCount: 14,
    description: 'தமிழ்நாட்டின் வளர்ச்சித் திட்டங்கள், வணிகம், தொழில்நுட்பம், அரசியல் மற்றும் இலக்கியச் சிறப்பிதழ்.',
    publishedDate: '2026-11-01'
  },
  {
    id: 'mag-2026-10',
    title: 'அமேஸ் டைம்ஸ் மாதாந்திர மலர் - அக்டோபர் 2026',
    edition: 'அக்டோபர் 2026',
    month: '10',
    year: '2026',
    coverImage: '',
    coverHeadline: '',
    pdfUrl: '',
    pageCount: 14,
    description: 'தமிழ்நாட்டின் வளர்ச்சித் திட்டங்கள், வணிகம், தொழில்நுட்பம் மற்றும் ஆன்மிகச் சிறப்பிதழ்.',
    publishedDate: '2026-10-01'
  }
];

// Dynamically resolve authentic Amaze Times cover photo & headline from OUR OWN published news articles
async function enrichMagazinesWithOwnCovers(magList) {
  try {
    const res = await query(`
      SELECT id, title, category,
             CASE WHEN main_image LIKE 'data:%' THEN '/api/news/' || id || '/image' ELSE main_image END AS main_image,
             EXTRACT(YEAR FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::int AS yr,
             EXTRACT(MONTH FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::int AS mo
      FROM news
      WHERE status = 'published'
        AND main_image IS NOT NULL
        AND TRIM(main_image) != ''
        AND main_image != '/Amaze times.jpg'
      ORDER BY (CASE WHEN is_breaking = true OR is_lead_hero = true THEN 1 ELSE 0 END) DESC,
               COALESCE(published_at, created_at) DESC
      LIMIT 40
    `);
    const rows = res.rows || [];
    return magList.map((m, idx) => {
      const hasCustomOwnCover =
        m.coverImage &&
        m.coverImage !== '/Amaze times.jpg' &&
        !String(m.coverImage).includes('magazine-cover-sample') &&
        !String(m.coverImage).includes('adutha');

      const yNum = parseInt(m.year, 10);
      const mNum = parseInt(m.month, 10);
      const matchMonth = rows.find(r => r.yr === yNum && r.mo === mNum);
      const fallbackRow = rows[idx % Math.max(1, rows.length)] || rows[0];
      const chosen = matchMonth || fallbackRow;

      return {
        ...m,
        coverImage: hasCustomOwnCover
          ? ensureHttpsUrl(m.coverImage)
          : (chosen?.main_image ? ensureHttpsUrl(chosen.main_image) : '/og-image.jpg'),
        coverHeadline: m.coverHeadline || chosen?.title || m.title,
        coverCategory: m.coverCategory || chosen?.category || 'சிறப்புப் பார்வை'
      };
    });
  } catch (err) {
    console.warn('Enrich magazines cover warning:', err.message);
    return magList.map(m => ({
      ...m,
      coverImage: (m.coverImage && !String(m.coverImage).includes('magazine-cover-sample')) ? m.coverImage : '/og-image.jpg'
    }));
  }
}

// Helper to get magazines from site_content table
async function getStoredMagazines() {
  try {
    const res = await query('SELECT data FROM site_content WHERE key = $1', ['magazines']);
    if (res.rows.length > 0 && Array.isArray(res.rows[0].data) && res.rows[0].data.length > 0) {
      return res.rows[0].data;
    }
  } catch (err) {
    console.warn('Error reading magazines from DB:', err.message);
  }
  return defaultMagazinesList;
}

// Helper to save magazines to site_content table
async function saveStoredMagazines(data) {
  try {
    await query(`
      INSERT INTO site_content (key, data, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
    `, ['magazines', JSON.stringify(data)]);
    return true;
  } catch (err) {
    console.error('Error saving magazines to DB:', err);
    return false;
  }
}

// GET /api/magazines
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const rawMagazines = await getStoredMagazines();
    const magazines = await enrichMagazinesWithOwnCovers(rawMagazines);
    res.json({
      success: true,
      data: magazines,
      magazines: magazines
    });
  } catch (err) {
    console.error('Fetch magazines error:', err);
    res.status(500).json({ success: false, message: err.message, data: defaultMagazinesList });
  }
});

// POST /api/magazines
router.post('/', async (req, res) => {
  try {
    const newMag = {
      ...req.body,
      id: req.body.id || 'mag-' + Date.now(),
      title: req.body.title || 'அமேஸ் டைம்ஸ் மின்-இதழ்',
      edition: req.body.edition || req.body.issueMonth || req.body.monthYear || '2026 பதிப்பு',
      month: String(req.body.month || '11').padStart(2, '0'),
      year: String(req.body.year || '2026'),
      coverImage: (req.body.coverImage && req.body.coverImage !== '/Amaze times.jpg')
        ? req.body.coverImage
        : (req.body.coverImageUrl && req.body.coverImageUrl !== '/Amaze times.jpg' ? req.body.coverImageUrl : ''),
      pdfUrl: req.body.pdfUrl || req.body.fileUrl || '',
      pageCount: parseInt(req.body.pageCount) || 24,
      description: req.body.description || req.body.subtitle || '',
      selectedArticleIds: Array.isArray(req.body.selectedArticleIds) ? req.body.selectedArticleIds : [],
      mastheadConfig: req.body.mastheadConfig || null,
      publishedDate: req.body.publishedDate || new Date().toISOString()
    };

    const currentList = await getStoredMagazines();
    const updated = [newMag, ...currentList.filter(m => m.id !== newMag.id)];
    await saveStoredMagazines(updated);

    res.json({ success: true, message: 'இதழ் வெற்றிகரமாக சேர்க்கப்பட்டது', data: newMag });
  } catch (err) {
    console.error('Create magazine error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/magazines/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentList = await getStoredMagazines();
    let updatedItem = null;
    const updated = currentList.map(item => {
      if (String(item.id) === String(id)) {
        updatedItem = { ...item, ...req.body, id: item.id };
        return updatedItem;
      }
      return item;
    });
    await saveStoredMagazines(updated);
    res.json({ success: true, message: 'இதழ் விவரம் புதுப்பிக்கப்பட்டது', data: updatedItem });
  } catch (err) {
    console.error('Update magazine error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/magazines/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentList = await getStoredMagazines();
    const updated = currentList.filter(item => String(item.id) !== String(id));
    await saveStoredMagazines(updated);
    res.json({ success: true, message: 'இதழ் நீக்கப்பட்டது' });
  } catch (err) {
    console.error('Delete magazine error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
