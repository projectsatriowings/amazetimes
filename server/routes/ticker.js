import express from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/ticker - Public active tickers (Combines real-time breaking news + custom tickers)
router.get('/', async (req, res) => {
  try {
    // 1. Fetch live breaking articles from news table
    const breakingNewsRes = await query(
      `SELECT id, title, category, main_image, created_at, true as is_breaking
       FROM news
       WHERE is_breaking = true AND status = 'published'
       ORDER BY created_at DESC
       LIMIT 8`
    );

    const liveBreaking = (breakingNewsRes.rows || []).map(r => ({
      id: `news-${r.id}`,
      article_id: r.id,
      content: r.title,
      title: r.title,
      category: r.category,
      main_image: r.main_image,
      link_url: `/news/${r.id}`,
      is_breaking: true,
      created_at: r.created_at
    }));

    // 2. Fetch custom breaking tickers
    const tickerRes = await query(
      'SELECT id, content, priority, link_url, is_active, created_at FROM breaking_tickers WHERE is_active = true ORDER BY priority ASC, created_at DESC'
    );

    const customTickers = (tickerRes.rows || []).map(t => {
      // Extract numeric article ID if link_url is /news/:id
      let artId = null;
      if (t.link_url && t.link_url.startsWith('/news/')) {
        const parts = t.link_url.split('/news/');
        if (parts[1] && !isNaN(parts[1])) artId = parseInt(parts[1], 10);
      }
      return {
        id: t.id,
        article_id: artId,
        content: t.content,
        title: t.content,
        priority: t.priority,
        link_url: t.link_url,
        is_breaking: true,
        created_at: t.created_at
      };
    });

    // 3. Combine: live breaking news first, followed by active custom tickers (deduping by content)
    const seen = new Set();
    const combined = [];

    for (const item of [...liveBreaking, ...customTickers]) {
      const key = (item.content || item.title || '').trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    // 4. Fallback if empty: fetch latest 5 published news
    if (combined.length === 0) {
      const latestNewsRes = await query(
        `SELECT id, title, category, created_at FROM news WHERE status = 'published' ORDER BY created_at DESC LIMIT 5`
      );
      latestNewsRes.rows.forEach(r => {
        combined.push({
          id: `news-${r.id}`,
          article_id: r.id,
          content: r.title,
          title: r.title,
          category: r.category,
          link_url: `/news/${r.id}`,
          is_breaking: true,
          created_at: r.created_at
        });
      });
    }

    res.json({ success: true, tickers: combined });
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
