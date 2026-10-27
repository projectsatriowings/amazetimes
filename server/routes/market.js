import express from 'express';
import { getLatestGoldRates, fetchAndSyncMarketRates } from '../services/marketRateService.js';

const router = express.Router();

// 3-minute memory cache
let cachedData = null;
let lastFetchTime = 0;
const CACHE_TTL = 3 * 60 * 1000;

router.get('/', async (req, res) => {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL) {
    return res.json({ success: true, data: cachedData, cached: true });
  }

  try {
    let latest = await getLatestGoldRates();

    // Initial sync or cache renewal
    if (!cachedData || now - lastFetchTime >= CACHE_TTL) {
      try {
        const synced = await fetchAndSyncMarketRates();
        if (synced) latest = await getLatestGoldRates();
      } catch (e) {
        console.warn('Background sync warning:', e.message);
      }
    }

    const sensexIsPos = !latest.sensexChange?.includes('-') && !latest.sensexChange?.includes('▼');
    const niftyIsPos = !latest.niftyChange?.includes('-') && !latest.niftyChange?.includes('▼');

    const formattedSensex = {
      label: 'சென்செக்ஸ்',
      price: latest.sensex || '73,598.67',
      change: latest.sensexChange || '▼ -0.01%',
      percent: latest.sensexChange || '-0.01%',
      isPositive: sensexIsPos
    };

    const formattedNifty = {
      label: 'நிஃப்டி',
      price: latest.nifty || '22,749.75',
      change: latest.niftyChange || '▼ -0.02%',
      percent: latest.niftyChange || '-0.02%',
      isPositive: niftyIsPos
    };

    const formattedGold22k = {
      label: 'தங்கம் (22K)',
      price: `₹${latest.gold22k.toLocaleString('en-IN')}/கி`,
      sovereign: `₹${latest.sovereign22k.toLocaleString('en-IN')}`,
      change: `${latest.is_up ? '+' : '-'}₹${Math.abs(latest.change_amount)}`,
      isPositive: latest.is_up
    };

    const formattedGold24k = {
      label: 'தங்கம் (24K)',
      price: `₹${latest.gold24k.toLocaleString('en-IN')}/கி`,
      sovereign: `₹${latest.sovereign24k.toLocaleString('en-IN')}`,
      change: `${latest.is_up ? '+' : '-'}₹${Math.abs(latest.change_amount)}`,
      isPositive: latest.is_up
    };

    const formattedSilver = {
      label: 'வெள்ளி',
      price: `₹${latest.silver.toLocaleString('en-IN')}/கி`,
      kg: `₹${(latest.silver * 1000).toLocaleString('en-IN')}/கிலோ`,
      change: '+₹0',
      isPositive: true
    };

    const formattedPetrol = {
      label: 'பெட்ரோல்',
      price: `₹${latest.petrol}/லி`,
      change: '0.00',
      isPositive: true
    };

    const formattedDiesel = {
      label: 'டீசல்',
      price: `₹${latest.diesel}/லி`,
      change: '0.00',
      isPositive: true
    };

    const formattedGold = {
      label: 'தங்கம் (பவுன்)',
      price: `₹${latest.sovereign22k.toLocaleString('en-IN')}`,
      gramPrice: `₹${latest.gold22k.toLocaleString('en-IN')}/கி`,
      change: `${latest.is_up ? '+' : '-'}₹${Math.abs(latest.change_amount)}`,
      isPositive: latest.is_up
    };

    cachedData = {
      gold22k: formattedGold22k,
      gold24k: formattedGold24k,
      silver: formattedSilver,
      petrol: formattedPetrol,
      diesel: formattedDiesel,
      sensex: formattedSensex,
      nifty: formattedNifty,
      gold: formattedGold,
      rates: {
        gold_22k: latest.gold22k,
        gold_24k: latest.gold24k,
        gold_18k: latest.gold18k,
        silver_1g: latest.silver,
        silver_1kg: latest.silver * 1000,
        sensex: latest.sensex,
        nifty: latest.nifty
      },
      source: latest.source || 'GoodReturns Chennai (Live)',
      updatedAt: new Date().toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    lastFetchTime = now;

    res.json({ success: true, data: cachedData, cached: false });
  } catch (error) {
    console.error('Market rates endpoint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
