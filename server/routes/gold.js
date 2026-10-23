import express from 'express';
import {
  getLatestGoldRates,
  getGoldRateHistory,
  saveManualGoldRates,
  fetchAndSyncMarketRates
} from '../services/marketRateService.js';
import { authenticate, requireReporterOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/gold/current - Latest live Chennai / Tamil Nadu bullion snapshot
router.get('/current', async (req, res) => {
  try {
    const data = await getLatestGoldRates();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error in /api/gold/current:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/gold - Latest snapshot + recent rate history
router.get('/', async (req, res) => {
  try {
    const [latest, history] = await Promise.all([
      getLatestGoldRates(),
      getGoldRateHistory(15)
    ]);
    res.json({
      success: true,
      latest,
      history,
      data: latest // Backwards compatibility for any consumers expecting data
    });
  } catch (err) {
    console.error('Error in /api/gold:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/gold/sync - Trigger on-demand sync from market sources
router.post('/sync', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const synced = await fetchAndSyncMarketRates();
    res.json({ success: true, message: 'சந்தை நிலவரம் புதுப்பிக்கப்பட்டது', data: synced });
  } catch (err) {
    console.error('Error syncing gold rates:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/gold - Admin manual override of rates
router.post('/', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { gold22k, gold24k, silver } = req.body;
    if (!gold22k || !gold24k || !silver) {
      return res.status(400).json({
        success: false,
        message: '22K தங்கம், 24K தங்கம் மற்றும் வெள்ளி விலைகள் கட்டாயம் தேவை'
      });
    }

    const saved = await saveManualGoldRates(req.body);
    res.status(201).json({
      success: true,
      message: 'தங்கம்/வெள்ளி சந்தை விலை சேமிக்கப்பட்டது',
      data: saved
    });
  } catch (err) {
    console.error('Error saving manual gold rates:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
