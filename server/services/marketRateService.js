import { query } from '../db.js';

// Realistic Chennai Bullion Baseline Fallback
const CHENNAI_FALLBACK = {
  gold24k: 7950,
  gold22k: 7288,
  gold18k: 5965,
  silver: 104,
  platinum: 2980,
  petrol: 100.75,
  diesel: 92.34,
  change_amount: 120,
  is_up: true,
  source: 'Tamil Nadu Bullion Association (Chennai)'
};

/**
 * Fetch live metals from Gold-API with USD/INR currency conversion
 */
async function fetchFromGoldApi() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const [goldRes, silverRes, inrRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU', { signal: controller.signal }),
      fetch('https://api.gold-api.com/price/XAG', { signal: controller.signal }),
      fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal })
    ]);

    clearTimeout(timeout);

    if (!goldRes.ok || !silverRes.ok) {
      throw new Error(`Gold-API returned status ${goldRes.status}/${silverRes.status}`);
    }

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();
    let inrRate = 86.85; // Current USD to INR benchmark

    if (inrRes.ok) {
      const fxData = await inrRes.json();
      if (fxData?.rates?.INR) {
        inrRate = Number(fxData.rates.INR);
      }
    }

    // 1 Troy Ounce = 31.1034768 grams
    // Gold Indian import duty (~6%) + 3% GST = ~9% factor (1.09)
    const goldOunceUsd = Number(goldData.price);
    const silverOunceUsd = Number(silverData.price);

    const usdPerGramGold = goldOunceUsd / 31.1034768;
    const inrPerGram24k = Math.round(usdPerGramGold * inrRate * 1.09);
    const inrPerGram22k = Math.round(inrPerGram24k * 0.9167);
    const inrPerGram18k = Math.round(inrPerGram24k * 0.75);

    const usdPerGramSilver = silverOunceUsd / 31.1034768;
    const inrPerGramSilver = Math.round(usdPerGramSilver * inrRate * 1.10);

    return {
      gold24k: inrPerGram24k,
      gold22k: inrPerGram22k,
      gold18k: inrPerGram18k,
      silver: inrPerGramSilver || 104,
      platinum: Math.round(inrPerGram24k * 0.38),
      petrol: 100.75,
      diesel: 92.34,
      source: 'Gold-API (Live Market)'
    };
  } catch (err) {
    console.warn('⚠️ [Gold-API] Could not fetch primary rate:', err.message);
    return null;
  }
}

/**
 * Secondary Fallback: GoodReturns Chennai Scraper / Parser
 */
async function scrapeGoodReturnsChennai() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://www.goodreturns.in/gold-rates/chennai.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);
    if (!response.ok) throw new Error(`GoodReturns HTTP ${response.status}`);

    const html = await response.text();
    
    // Look for 22k and 24k Chennai price patterns (e.g., ₹ 7,xxx or ₹7xxx)
    const matches22k = html.match(/22\s*Carat.*?₹\s*([\d,]+)/i);
    const matches24k = html.match(/24\s*Carat.*?₹\s*([\d,]+)/i);

    let g22k = CHENNAI_FALLBACK.gold22k;
    let g24k = CHENNAI_FALLBACK.gold24k;

    if (matches22k && matches22k[1]) {
      const parsed = parseInt(matches22k[1].replace(/,/g, ''), 10);
      if (parsed > 4000 && parsed < 20000) g22k = parsed;
    }
    if (matches24k && matches24k[1]) {
      const parsed = parseInt(matches24k[1].replace(/,/g, ''), 10);
      if (parsed > 4000 && parsed < 25000) g24k = parsed;
    }

    return {
      gold24k: g24k,
      gold22k: g22k,
      gold18k: Math.round(g24k * 0.75),
      silver: 104,
      platinum: 2980,
      petrol: 100.75,
      diesel: 92.34,
      source: 'GoodReturns Chennai (Scraped)'
    };
  } catch (err) {
    console.warn('⚠️ [GoodReturns Scraper] Secondary fallback unavailable:', err.message);
    return null;
  }
}

/**
 * Fetch and sync market rates into PostgreSQL gold_rates table
 */
export async function fetchAndSyncMarketRates() {
  console.log('🔄 [MarketRateService] Fetching Chennai & Tamil Nadu bullion rates...');

  let rates = await fetchFromGoldApi();
  if (!rates) {
    rates = await scrapeGoodReturnsChennai();
  }
  if (!rates) {
    // If external APIs are unreachable, query latest stored in DB or fallback
    try {
      const lastDb = await query(`SELECT * FROM gold_rates ORDER BY created_at DESC LIMIT 1;`);
      if (lastDb.rows.length > 0) {
        rates = {
          gold24k: Number(lastDb.rows[0].gold24k),
          gold22k: Number(lastDb.rows[0].gold22k),
          gold18k: Number(lastDb.rows[0].gold18k),
          silver: Number(lastDb.rows[0].silver),
          platinum: Number(lastDb.rows[0].platinum || 2980),
          petrol: Number(lastDb.rows[0].petrol || 100.75),
          diesel: Number(lastDb.rows[0].diesel || 92.34),
          source: 'Database Cached'
        };
      }
    } catch (_) {}
  }

  if (!rates) {
    rates = CHENNAI_FALLBACK;
  }

  // Calculate change vs previous record in database
  let changeAmount = 0;
  let isUp = false;

  try {
    const prevRes = await query(`SELECT gold22k FROM gold_rates ORDER BY created_at DESC LIMIT 1;`);
    if (prevRes.rows.length > 0) {
      const prev22k = Number(prevRes.rows[0].gold22k);
      changeAmount = Math.abs(rates.gold22k - prev22k);
      isUp = rates.gold22k >= prev22k;
    } else {
      changeAmount = 120;
      isUp = true;
    }

    // Persist new snapshot in PostgreSQL
    const insertRes = await query(`
      INSERT INTO gold_rates 
        (gold22k, gold24k, gold18k, silver, platinum, petrol, diesel, change_amount, is_up, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [
      rates.gold22k,
      rates.gold24k,
      rates.gold18k,
      rates.silver,
      rates.platinum,
      rates.petrol,
      rates.diesel,
      changeAmount,
      isUp,
      rates.source
    ]);

    console.log(`✅ [MarketRateService] Successfully synced gold rates: 22K ₹${rates.gold22k}/g, 24K ₹${rates.gold24k}/g, Silver ₹${rates.silver}/g`);
    return insertRes.rows[0];
  } catch (err) {
    console.error('❌ [MarketRateService] Database persist failed:', err);
    return {
      ...rates,
      change_amount: changeAmount,
      is_up: isUp,
      created_at: new Date().toISOString()
    };
  }
}

/**
 * Get the latest gold and commodity rates from DB
 */
export async function getLatestGoldRates() {
  try {
    const res = await query(`SELECT * FROM gold_rates ORDER BY created_at DESC LIMIT 1;`);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      const g22k = Number(row.gold22k);
      return {
        ...row,
        gold22k: g22k,
        gold24k: Number(row.gold24k),
        gold18k: Number(row.gold18k),
        silver: Number(row.silver),
        sovereign22k: Math.round(g22k * 8),
        sovereign24k: Math.round(Number(row.gold24k) * 8),
        platinum: Number(row.platinum || 2980),
        petrol: Number(row.petrol || 100.75),
        diesel: Number(row.diesel || 92.34),
        change_amount: Number(row.change_amount || 0),
        is_up: Boolean(row.is_up)
      };
    }
  } catch (err) {
    console.warn('⚠️ [MarketRateService] Error querying latest gold rates:', err.message);
  }

  // Fallback if DB is empty
  const g22k = CHENNAI_FALLBACK.gold22k;
  return {
    ...CHENNAI_FALLBACK,
    sovereign22k: Math.round(g22k * 8),
    sovereign24k: Math.round(CHENNAI_FALLBACK.gold24k * 8),
    created_at: new Date().toISOString()
  };
}

/**
 * Get gold rate history (last N records)
 */
export async function getGoldRateHistory(limit = 10) {
  try {
    const res = await query(`
      SELECT * FROM gold_rates 
      ORDER BY created_at DESC 
      LIMIT $1;
    `, [limit]);
    return res.rows.map(row => ({
      ...row,
      gold22k: Number(row.gold22k),
      gold24k: Number(row.gold24k),
      gold18k: Number(row.gold18k),
      silver: Number(row.silver),
      sovereign22k: Math.round(Number(row.gold22k) * 8)
    }));
  } catch (err) {
    console.error('Error fetching gold history:', err);
    return [];
  }
}

/**
 * Admin manual override for gold and commodity rates
 */
export async function saveManualGoldRates(rateData) {
  const {
    gold22k,
    gold24k,
    gold18k = Math.round(gold24k * 0.75),
    silver,
    platinum = 2980,
    petrol = 100.75,
    diesel = 92.34,
    change_amount = 0,
    is_up = true
  } = rateData;

  const res = await query(`
    INSERT INTO gold_rates 
      (gold22k, gold24k, gold18k, silver, platinum, petrol, diesel, change_amount, is_up, source)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Admin Manual Override')
    RETURNING *;
  `, [
    Number(gold22k),
    Number(gold24k),
    Number(gold18k),
    Number(silver),
    Number(platinum),
    Number(petrol),
    Number(diesel),
    Number(change_amount),
    Boolean(is_up)
  ]);

  return res.rows[0];
}

export default {
  fetchAndSyncMarketRates,
  getLatestGoldRates,
  getGoldRateHistory,
  saveManualGoldRates
};
