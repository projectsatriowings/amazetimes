import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Sanitize connection string to enforce libpq compatibility and eliminate SSL warnings
const sanitizeDatabaseUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let url = rawUrl.trim();
  if (url.includes('localhost') || url.includes('127.0.0.1')) return url;

  // Neon serverless URL fix for pg / pg-connection-string libpq warning
  // Converting to sslmode=verify-full eliminates all security warnings across pg v8 and v9
  if (url.includes('sslmode=require') || url.includes('sslmode=prefer') || url.includes('sslmode=verify-ca')) {
    url = url.replace(/sslmode=(require|prefer|verify-ca)/, 'sslmode=verify-full');
  } else if (!url.includes('sslmode=')) {
    url += (url.includes('?') ? '&' : '?') + 'sslmode=verify-full';
  }
  return url;
};

const dbUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);

// Neon PostgreSQL connection pool with serverless pooler resilience
export const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10, // Optimal pool size for serverless PgBouncer pooler
  idleTimeoutMillis: 10000, // 10s idle timeout: prunes idle clients BEFORE Neon pooler drops them (prevents ECONNRESET)
  connectionTimeoutMillis: 25000, // 25s connection timeout allows cold-start serverless compute wake up
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  allowExitOnIdle: true,
});

// Prevent idle connection drops from crashing the Node.js server
pool.on('error', (err) => {
  const errorString = ((err?.message || '') + ' ' + (err?.code || '') + ' ' + String(err || '')).toLowerCase();
  const isHarmlessDrop =
    errorString.includes('connection reset') ||
    errorString.includes('econnreset') ||
    errorString.includes('terminated unexpectedly') ||
    errorString.includes('connection terminated') ||
    errorString.includes('closed') ||
    errorString.includes('timeout') ||
    errorString.includes('broken pipe') ||
    errorString.includes('epipe') ||
    errorString.includes('57p01') ||
    errorString.includes('57p02') ||
    errorString.includes('57p03') ||
    errorString.includes('client has encountered a connection error');

  if (isHarmlessDrop) {
    // Harmless serverless PgBouncer pooler recycling notice - pg automatically discards dead client from pool
    return;
  }
  console.error('⚠️ [Neon DB Pool] Unexpected error on PostgreSQL client:', err?.message || err);
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Wrapped query function with exponential backoff retry on serverless pooler drops/timeouts
export const query = async (text, params, maxRetries = 3) => {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      attempt++;
      const errorString = ((err?.message || '') + ' ' + (err?.code || '') + ' ' + String(err || '')).toLowerCase();
      const isConnectionError =
        errorString.includes('timeout') ||
        errorString.includes('terminated') ||
        errorString.includes('connection reset') ||
        errorString.includes('econnreset') ||
        errorString.includes('closed') ||
        errorString.includes('broken pipe') ||
        errorString.includes('epipe') ||
        errorString.includes('57p01') ||
        errorString.includes('57p02') ||
        errorString.includes('57p03') ||
        errorString.includes('client has encountered a connection error');

      if (isConnectionError && attempt <= maxRetries) {
        // Neon compute cold-starts require 1-3 seconds to wake up from suspension
        const delayMs = attempt * 1000;
        console.warn(`🔄 [Neon DB Retry] Database waking or pooler reconnecting (${err?.code || err?.message}). Backing off ${delayMs}ms before retry ${attempt}/${maxRetries}...`);
        await sleep(delayMs);
        continue;
      }
      throw err;
    }
  }
};

// URL Sanitizer: Force HTTPS and fix broken legacy domains
export const ensureHttpsUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  if (clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://');
  }
  // Fallback for broken legacy domains or 404s
  if (clean.includes('aduthathalaimurai.org') || clean.includes('aduthathalaimurai.in')) {
    clean = clean.replace(/https?:\/\/(www\.)?aduthathalaimurai\.(org|in)[^"'\s]*/i, 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80');
  }
  return clean;
};

// Clean shutdown handler for process termination
export const closeDb = async () => {
  try {
    await pool.end();
    console.log('🔌 [Neon DB Pool] Connection pool closed cleanly.');
  } catch (err) {
    console.warn('⚠️ [Neon DB Pool] Notice on closing pool:', err?.message || err);
  }
};

export default { pool, query, ensureHttpsUrl, closeDb };
