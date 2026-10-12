import express from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/ticker - Public active tickers
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, content, priority, link_url, is_active FROM breaking_tickers WHERE is_active = true ORDER BY priority ASC, created_at DESC'
    );
    res.json({ success: true, tickers: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ticker - Admin add ticker
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { content, priority = 1, link_url } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'செய்தி உரை தேவை' });
    }

    const result = await query(
      'INSERT INTO breaking_tickers (content, priority, link_url, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [content.trim(), priority, link_url || null, req.user.id]
    );

    res.status(201).json({ success: true, message: 'பிரேக்கிங் செய்தி சேர்க்கப்பட்டது', ticker: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/ticker/:id - Admin update ticker
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, priority, is_active, link_url } = req.body;

    const result = await query(`
      UPDATE breaking_tickers
      SET content = COALESCE($1, content),
          priority = COALESCE($2, priority),
          is_active = COALESCE($3, is_active),
          link_url = COALESCE($4, link_url)
      WHERE id = $5 RETURNING *;
    `, [content, priority, is_active, link_url, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticker not found' });
    }

    res.json({ success: true, message: 'புதுப்பிக்கப்பட்டது', ticker: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/ticker/:id - Admin delete ticker
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM breaking_tickers WHERE id = $1', [id]);
    res.json({ success: true, message: 'நீக்கப்பட்டது' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
