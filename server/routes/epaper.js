import express from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const formatEpaperRow = (r) => ({
  id: r.id,
  _id: String(r.id),
  title: r.title,
  edition_date: r.edition_date,
  editionDate: r.edition_date ? String(r.edition_date).split('T')[0] : '',
  pdf_url: r.pdf_url,
  pdfUrl: r.pdf_url,
  cover_image_url: r.cover_image_url,
  coverImage: r.cover_image_url,
  page_count: r.page_count,
  pagesCount: r.page_count,
  file_size_mb: r.file_size_mb,
  fileSize: r.file_size_mb ? `${r.file_size_mb} MB` : '12.4 MB',
  created_at: r.created_at
});

// GET /api/epaper - List all editions
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, created_at FROM epaper_editions ORDER BY edition_date DESC LIMIT 50'
    );
    const formatted = result.rows.map(formatEpaperRow);
    res.json({ success: true, data: formatted, editions: formatted, epapers: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/epaper/latest
router.get('/latest', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, created_at FROM epaper_editions ORDER BY edition_date DESC LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'இ-பேப்பர் பதிப்பு கிடைக்கவில்லை' });
    }
    res.json({ success: true, epaper: formatEpaperRow(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/epaper/archive
router.get('/archive', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb FROM epaper_editions ORDER BY edition_date DESC LIMIT 30'
    );
    res.json({ success: true, editions: result.rows.map(formatEpaperRow) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/epaper - Upload / publish new or auto-compiled edition
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const title = req.body.title;
    const edition_date = req.body.edition_date || req.body.editionDate;
    const pdf_url = req.body.pdf_url || req.body.pdfUrl || 'auto-compiled';
    const cover_image_url = req.body.cover_image_url || req.body.coverImage || '/Amaze times.jpg';
    const page_count = parseInt(req.body.page_count || req.body.pagesCount || 12, 10);
    const rawSize = req.body.file_size_mb || req.body.fileSize || '8.5';
    const file_size_mb = parseFloat(String(rawSize).replace(/[^0-9.]/g, '')) || 8.5;

    if (!title || !edition_date) {
      return res.status(400).json({ success: false, message: 'தலைப்பு மற்றும் தேதி தேவை' });
    }

    const result = await query(`
      INSERT INTO epaper_editions (title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (edition_date) DO UPDATE
      SET title = $1, pdf_url = $3, cover_image_url = $4, page_count = $5, file_size_mb = $6
      RETURNING *;
    `, [title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, req.user?.id || null]);

    const row = formatEpaperRow(result.rows[0]);
    res.status(201).json({ success: true, message: 'இ-பேப்பர் பதிப்பு வெளியிடப்பட்டது', epaper: row, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/epaper/:id
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body.title;
    const edition_date = req.body.edition_date || req.body.editionDate;
    const pdf_url = req.body.pdf_url || req.body.pdfUrl || 'auto-compiled';
    const cover_image_url = req.body.cover_image_url || req.body.coverImage || '/Amaze times.jpg';
    const page_count = parseInt(req.body.page_count || req.body.pagesCount || 12, 10);
    const rawSize = req.body.file_size_mb || req.body.fileSize || '8.5';
    const file_size_mb = parseFloat(String(rawSize).replace(/[^0-9.]/g, '')) || 8.5;

    const result = await query(`
      UPDATE epaper_editions
      SET title = COALESCE($1, title),
          edition_date = COALESCE($2, edition_date),
          pdf_url = COALESCE($3, pdf_url),
          cover_image_url = COALESCE($4, cover_image_url),
          page_count = COALESCE($5, page_count),
          file_size_mb = COALESCE($6, file_size_mb)
      WHERE id = $7
      RETURNING *;
    `, [title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'பதிப்பு கிடைக்கவில்லை' });
    }
    const row = formatEpaperRow(result.rows[0]);
    res.json({ success: true, message: 'இ-பேப்பர் பதிப்பு புதுப்பிக்கப்பட்டது', epaper: row, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/epaper/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM epaper_editions WHERE id = $1', [id]);
    res.json({ success: true, message: 'பதிப்பு நீக்கப்பட்டது' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
