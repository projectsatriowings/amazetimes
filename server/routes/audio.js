import express from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/audio - Latest audio brief
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, audio_url, duration_minutes, transcript, created_at FROM audio_briefs WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ஆடியோ செய்தி கிடைக்கவில்லை' });
    }
    res.json({ success: true, audio: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/audio - Admin upload audio brief
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, audio_url, duration_minutes = '3 நிமிடம்', transcript } = req.body;
    if (!title || !audio_url) {
      return res.status(400).json({ success: false, message: 'தலைப்பு மற்றும் ஆடியோ முகவரி தேவை' });
    }

    const result = await query(
      'INSERT INTO audio_briefs (title, audio_url, duration_minutes, transcript, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title.trim(), audio_url, duration_minutes, transcript || null, req.user.id]
    );

    res.status(201).json({ success: true, message: 'ஆடியோ செய்தி சேர்க்கப்பட்டது', audio: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
