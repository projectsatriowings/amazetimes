import express from 'express';
import { query } from '../db.js';
import { authenticate, requireReporterOrAdmin, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to determine media type
function detectMediaType(url, explicitType) {
  if (explicitType === 'video' || explicitType === 'image') return explicitType;
  if (!url) return 'image';
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.match(/\.(mp4|webm|mov|mkv|m4v)(\?.*)?$/)) return 'video';
  return 'image';
}

// GET /api/shorts - Public feed
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, headline, description, media_url, media_type, duration_seconds, view_count, created_at 
       FROM shorts_reels 
       WHERE status = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      ['published']
    );
    res.json({ success: true, stories: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/shorts/admin - Full list for Admin/Reporter Console
router.get('/admin', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, u.full_name as author_name, u.role as author_role
      FROM shorts_reels s
      LEFT JOIN users u ON s.author_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 100
    `);
    res.json({ success: true, stories: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/shorts - Create new short/video
router.post('/', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { headline, description, media_url, media_type, duration_seconds = 60 } = req.body;
    if (!headline || !media_url) {
      return res.status(400).json({ success: false, message: 'தலைப்பு மற்றும் ஊடக முகவரி (Media URL/File) தேவை' });
    }

    const calculatedType = detectMediaType(media_url, media_type);
    const status = req.user.role === 'admin' ? 'published' : 'pending_approval';

    const result = await query(
      `INSERT INTO shorts_reels (headline, description, media_url, media_type, duration_seconds, author_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [headline.trim(), description || null, media_url, calculatedType, duration_seconds || 60, req.user.id, status]
    );

    res.status(201).json({
      success: true,
      message: status === 'published' ? 'வீடியோ செய்தி வெளியிடப்பட்டது' : 'நிர்வாகியின் ஒப்புதலுக்காக சமர்ப்பிக்கப்பட்டது',
      story: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/shorts/:id - Edit existing short/video
router.put('/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { headline, description, media_url, media_type, duration_seconds, status } = req.body;

    // Check ownership or admin
    const checkRes = await query('SELECT * FROM shorts_reels WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'வீடியோ பதிவு கிடைக்கவில்லை' });
    }

    const existing = checkRes.rows[0];
    if (req.user.role !== 'admin' && existing.author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'இப்பதிவைத் திருத்த உங்களுக்கு அனுமதி இல்லை' });
    }

    const newMediaUrl = media_url || existing.media_url;
    const calculatedType = detectMediaType(newMediaUrl, media_type || existing.media_type);
    const newStatus = (req.user.role === 'admin' && status) ? status : existing.status;

    const result = await query(
      `UPDATE shorts_reels
       SET headline = COALESCE($1, headline),
           description = COALESCE($2, description),
           media_url = COALESCE($3, media_url),
           media_type = $4,
           duration_seconds = COALESCE($5, duration_seconds),
           status = $6
       WHERE id = $7
       RETURNING *`,
      [
        headline ? headline.trim() : null,
        description !== undefined ? description : null,
        newMediaUrl,
        calculatedType,
        duration_seconds || existing.duration_seconds,
        newStatus,
        id
      ]
    );

    res.json({
      success: true,
      message: 'வீடியோ செய்தி வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது',
      story: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/shorts/:id - Delete short/video
router.delete('/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const checkRes = await query('SELECT * FROM shorts_reels WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'வீடியோ பதிவு கிடைக்கவில்லை' });
    }

    const existing = checkRes.rows[0];
    if (req.user.role !== 'admin' && existing.author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'இப்பதிவை நீக்க உங்களுக்கு அனுமதி இல்லை' });
    }

    await query('DELETE FROM shorts_reels WHERE id = $1', [id]);
    res.json({ success: true, message: 'வீடியோ செய்தி நீக்கப்பட்டது' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
