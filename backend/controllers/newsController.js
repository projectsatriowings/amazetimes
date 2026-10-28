/**
 * News Controller - Amaze Times Core News Engine
 * Provides standard controller methods wired into newsCacheService
 */

import { query } from '../config/db.js';
import { formatNewsRow } from '../../server/routes/news.js';
import {
  getCachedNews,
  setCachedNews,
  getNewsVersion,
  invalidateNewsCache,
  registerSseClient
} from '../services/newsCacheService.js';

export const getLiveStream = (req, res) => {
  registerSseClient(req, res);
};

export const getVersion = (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.json({
    success: true,
    version: getNewsVersion(),
    timestamp: Date.now()
  });
};

export const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, district, status, search } = req.query;
    const isDefaultQuery = (!category || category === 'all') && (!district || district === 'all') && (!search || !search.trim()) && page == 1;

    if (isDefaultQuery) {
      const cached = getCachedNews();
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }
    }

    const result = await query(`
      SELECT * FROM news 
      WHERE status = 'published'
      ORDER BY COALESCE(display_order, 0) DESC, created_at DESC 
      LIMIT 100;
    `);
    const articles = result.rows.map(formatNewsRow);
    const payload = { success: true, news: articles, data: articles, articles };

    if (isDefaultQuery) {
      setCachedNews(payload);
      res.setHeader('X-Cache', 'MISS');
    }

    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const makeNewsFirst = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(String(id).trim())) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }
    const result = await query(`
      UPDATE news
      SET display_order = (SELECT COALESCE(MAX(display_order), 0) + 1 FROM news),
          is_top_story = TRUE
      WHERE id = $1
      RETURNING *;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    const updated = formatNewsRow(result.rows[0]);
    invalidateNewsCache('update', updated);

    res.json({ success: true, message: '#1 Priority Updated', news: updated, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const recordNewsView = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(String(id).trim())) {
      await query(`UPDATE site_analytics SET total_views = total_views + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1;`).catch(() => {});
      return res.json({ success: true, viewsCount: 1 });
    }
    const updateRes = await query(`
      UPDATE news
      SET views_count = COALESCE(views_count, 0) + 1
      WHERE id = $1
      RETURNING views_count;
    `, [id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    await query(`UPDATE site_analytics SET total_views = total_views + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1;`).catch(() => {});
    res.json({ success: true, viewsCount: updateRes.rows[0].views_count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleNewsLike = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(String(id).trim())) {
      return res.json({ success: true, likesCount: 1 });
    }
    const updateRes = await query(`
      UPDATE news
      SET likes_count = COALESCE(likes_count, 0) + 1
      WHERE id = $1
      RETURNING likes_count;
    `, [id]);
    res.json({ success: true, likesCount: updateRes.rows[0]?.likes_count || 1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getLiveStream,
  getVersion,
  getAllNews,
  makeNewsFirst,
  recordNewsView,
  toggleNewsLike
};
