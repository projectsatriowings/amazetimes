import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Sanitize connection string to enforce libpq compatibility and prevent SSL warnings
const sanitizeDatabaseUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let url = rawUrl.trim();
  // Neon serverless pooler URL fix for pg-connection-string
  if (url.includes('sslmode=require') && !url.includes('uselibpqcompat')) {
    url = url.replace('sslmode=require', 'sslmode=require&uselibpqcompat=true');
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
  connectionTimeoutMillis: 10000, // 10s connection timeout for cold-start serverless compute
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
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
    errorString.includes('client has encountered a connection error');

  if (isHarmlessDrop) {
    // Harmless serverless PgBouncer pooler recycling notice - pg automatically discards dead client from pool
    return;
  }
  console.error('⚠️ [Neon DB Pool] Unexpected error on PostgreSQL client:', err?.message || err);
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Wrapped query function with exponential backoff retry on serverless pooler drops/timeouts
export const query = async (text, params, maxRetries = 2) => {
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
        errorString.includes('client has encountered a connection error');

      if (isConnectionError && attempt <= maxRetries) {
        const delayMs = attempt * 350; // 350ms on first retry, 700ms on second retry
        console.warn(`🔄 [Neon DB Retry] Connection dropped (${err?.code || err?.message}). Backing off ${delayMs}ms before retry ${attempt}/${maxRetries}...`);
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

