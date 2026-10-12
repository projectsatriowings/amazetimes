import express from 'express';
import { query } from '../db.js';
import { authenticate, requireReporterOrAdmin, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/livewire - Public list of timeline items
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, time_badge, category, is_highlight, created_at FROM live_wires ORDER BY created_at DESC LIMIT 15'
    );
    res.json({ success: true, items: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/livewire - Add new live wire update (Reporter or Admin)
router.post('/', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { title, time_badge, category, is_highlight = false } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'செய்தி தலைப்பு தேவை' });
    }

    const defaultBadge = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const result = await query(
      'INSERT INTO live_wires (title, time_badge, category, is_highlight, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title.trim(), time_badge || defaultBadge, category || 'நேரலை', is_highlight, req.user.id]
    );

    res.status(201).json({ success: true, message: 'நேரலைச் செய்தி சேர்க்கப்பட்டது', item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/livewire/:id - Delete item (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM live_wires WHERE id = $1', [id]);
    res.json({ success: true, message: 'நேரலை செய்தி நீக்கப்பட்டது' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
