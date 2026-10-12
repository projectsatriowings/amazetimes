import express from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/epaper/latest
router.get('/latest', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, created_at FROM epaper_editions ORDER BY edition_date DESC LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'இ-பேப்பர் பதிப்பு கிடைக்கவில்லை' });
    }
    res.json({ success: true, epaper: result.rows[0] });
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
    res.json({ success: true, editions: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/epaper - Upload / publish new edition
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, edition_date, pdf_url, cover_image_url, page_count = 16, file_size_mb = 14.0 } = req.body;
    if (!title || !edition_date || !pdf_url || !cover_image_url) {
      return res.status(400).json({ success: false, message: 'தலைப்பு, தேதி, PDF முகவரி மற்றும் அட்டைப்படம் தேவை' });
    }

    const result = await query(`
      INSERT INTO epaper_editions (title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (edition_date) DO UPDATE
      SET title = $1, pdf_url = $3, cover_image_url = $4, page_count = $5, file_size_mb = $6
      RETURNING *;
    `, [title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, req.user.id]);

    res.status(201).json({ success: true, message: 'இ-பேப்பர் பதிப்பு பதிவேற்றப்பட்டது', epaper: result.rows[0] });
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
