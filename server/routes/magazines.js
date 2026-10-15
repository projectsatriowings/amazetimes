import express from 'express';
import { query } from '../db.js';

const router = express.Router();

const defaultMagazinesList = [
  {
    id: 'mag-2026-10',
    title: 'அமேஸ் டைம்ஸ் மாதாந்திர மலர் - அக்டோபர் 2026',
    edition: 'அக்டோபர் 2026',
    month: '10',
    year: '2026',
    coverImage: '/Amaze times.jpg',
    pdfUrl: '/Amaze times.jpg',
    pageCount: 64,
    description: 'தமிழ்நாட்டின் வளர்ச்சித் திட்டங்கள், வணிகம், தொழில்நுட்பம் மற்றும் ஆன்மிகச் சிறப்பிதழ்.',
    publishedDate: '2026-10-01'
  }
];

// Helper to get magazines from site_content table
async function getStoredMagazines() {
  try {
    const res = await query('SELECT data FROM site_content WHERE key = $1', ['magazines']);
    if (res.rows.length > 0 && Array.isArray(res.rows[0].data)) {
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
    const magazines = await getStoredMagazines();
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
      id: req.body.id || 'mag-' + Date.now(),
      title: req.body.title || 'அமேஸ் டைம்ஸ் மின்-இதழ்',
      edition: req.body.edition || req.body.monthYear || '2026 பதிப்பு',
      month: req.body.month || '10',
      year: req.body.year || '2026',
      coverImage: req.body.coverImage || req.body.coverImageUrl || '/Amaze times.jpg',
      pdfUrl: req.body.pdfUrl || req.body.fileUrl || '/Amaze times.jpg',
      pageCount: parseInt(req.body.pageCount) || 64,
      description: req.body.description || '',
      publishedDate: new Date().toISOString()
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
    const updated = currentList.map(item => {
      if (String(item.id) === String(id)) {
        return { ...item, ...req.body, id: item.id };
      }
      return item;
    });
    await saveStoredMagazines(updated);
    res.json({ success: true, message: 'இதழ் விவரம் புதுப்பிக்கப்பட்டது' });
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
