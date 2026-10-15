import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// GET all dynamic site content
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT key, data FROM site_content');
    const contentMap = {};
    result.rows.forEach(row => {
      contentMap[row.key] = row.data;
    });
    res.json({ success: true, data: contentMap });
  } catch (error) {
    console.error('Error fetching all site content:', error);
    res.status(500).json({ success: false, message: 'Server error fetching content', error: error.message });
  }
});

// GET content by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await query('SELECT data FROM site_content WHERE key = $1', [key]);
    if (result.rows.length === 0) {
      return res.json({ success: true, found: false, data: null });
    }
    res.json({ success: true, found: true, data: result.rows[0].data });
  } catch (error) {
    console.error(`Error fetching content for ${req.params.key}:`, error);
    res.status(500).json({ success: false, message: 'Server error fetching content', error: error.message });
  }
});

// PUT / UPDATE content by key
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { data } = req.body;

    const upsertQuery = `
      INSERT INTO site_content (key, data, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await query(upsertQuery, [key, JSON.stringify(data)]);
    res.json({ success: true, message: 'Content saved successfully', key, data: result.rows[0].data });
  } catch (error) {
    console.error(`Error saving content for ${req.params.key}:`, error);
    res.status(500).json({ success: false, message: 'Server error saving content', error: error.message });
  }
});

export default router;
