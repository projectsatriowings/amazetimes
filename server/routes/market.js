import express from 'express';
import { getLatestGoldRates } from '../services/marketRateService.js';

const router = express.Router();

// 5-minute memory cache
let cachedData = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchIndexData(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error('Invalid structure');

    const regularMarketPrice = meta.regularMarketPrice || meta.chartPreviousClose;
    const previousClose = meta.previousClose || meta.chartPreviousClose;
    const change = regularMarketPrice - previousClose;
    const percentChange = (change / previousClose) * 100;

    return {
      price: regularMarketPrice,
      change,
      percentChange,
      isPositive: change >= 0
    };
  } catch (err) {
    console.warn(`Could not fetch live data for ${symbol}:`, err.message);
    return null;
  }
}
async function fetchGoldData() {
  try {
    const latest = await getLatestGoldRates();
    return {
      gram22k: latest.gold22k,
      sovereign22k: latest.sovereign22k,
      change: latest.change_amount,
      isPositive: latest.is_up
    };
  } catch (err) {
    console.warn('Could not read synchronized gold rate:', err.message);
    return {
      gram22k: 7288,
      sovereign22k: 58304,
      change: 120,
      isPositive: true
    };
  }
}

router.get('/', async (req, res) => {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL) {
    return res.json({ success: true, data: cachedData, cached: true });
  }

  try {
    const [sensex, nifty, gold] = await Promise.all([
      fetchIndexData('^BSESN'),
      fetchIndexData('^NSEI'),
      fetchGoldData()
    ]);

    const formattedSensex = sensex ? {
      label: 'சென்செக்ஸ்',
      price: sensex.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      change: `${sensex.isPositive ? '+' : ''}${sensex.change.toFixed(2)}`,
      percent: `${sensex.isPositive ? '+' : ''}${sensex.percentChange.toFixed(2)}%`,
      isPositive: sensex.isPositive
    } : {
      label: 'சென்செக்ஸ்',
      price: '81,224.75',
      change: '+340.15',
      percent: '+0.42%',
      isPositive: true
    };

    const formattedNifty = nifty ? {
      label: 'நிஃப்டி',
      price: nifty.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      change: `${nifty.isPositive ? '+' : ''}${nifty.change.toFixed(2)}`,
      percent: `${nifty.isPositive ? '+' : ''}${nifty.percentChange.toFixed(2)}%`,
      isPositive: nifty.isPositive
    } : {
      label: 'நிஃப்டி',
      price: '24,785.30',
      change: '+95.40',
      percent: '+0.39%',
      isPositive: true
    };

    const formattedGold = {
      label: 'தங்கம் (பவுன்)',
      price: `₹${gold.sovereign22k.toLocaleString('en-IN')}`,
      gramPrice: `₹${gold.gram22k.toLocaleString('en-IN')}/கி`,
      change: `${gold.isPositive ? '+' : ''}₹${Math.abs(gold.change)}`,
      isPositive: gold.isPositive
    };

    cachedData = {
      sensex: formattedSensex,
      nifty: formattedNifty,
      gold: formattedGold,
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
