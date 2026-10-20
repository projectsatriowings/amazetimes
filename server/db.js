import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Neon PostgreSQL connection pool with serverless pooler resilience
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
});

// Prevent idle connection drops from crashing the Node.js server
pool.on('error', (err) => {
  console.error('⚠️ [Neon DB Pool] Unexpected error on idle PostgreSQL client:', err?.message || err);
});

// Wrapped query function with automatic one-time retry on pooler drops/timeouts
export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    const errorMsg = (err?.message || '').toLowerCase();
    const isConnectionError =
      errorMsg.includes('timeout') ||
      errorMsg.includes('terminated') ||
      errorMsg.includes('connection reset') ||
      errorMsg.includes('closed') ||
      errorMsg.includes('client has encountered a connection error');

    if (isConnectionError) {
      console.warn('🔄 [Neon DB Retry] Pooler connection interrupted. Retrying query once...', errorMsg);
      try {
        return await pool.query(text, params);
      } catch (retryErr) {
        console.error('❌ [Neon DB Retry Failed]:', retryErr?.message || retryErr);
        throw retryErr;
      }
    }
    throw err;
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

export default { pool, query, ensureHttpsUrl };
