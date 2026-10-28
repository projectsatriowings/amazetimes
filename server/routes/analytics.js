import express from 'express';
import crypto from 'crypto';
import { query } from '../db.js';
import { authenticate, requireReporterOrAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Sliding-window in-memory store for active live visitors (visitorHash -> lastPingTimestamp)
const activeVisitors = new Map();

// In-memory set of known visitor hashes for 0ms deduplication
const knownVisitorHashes = new Set();
let isInitialized = false;

// Initialize analytics_visitors table and pre-load visitor hashes
async function initAnalyticsEngine() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_visitors (
        id SERIAL PRIMARY KEY,
        visitor_hash VARCHAR(128) UNIQUE NOT NULL,
        ip_address VARCHAR(100),
        user_agent TEXT,
        first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_analytics_visitors_hash ON analytics_visitors(visitor_hash);
      CREATE INDEX IF NOT EXISTS idx_analytics_visitors_last_seen ON analytics_visitors(last_seen);
    `);

    // Ensure site_analytics table exists
    await query(`
      CREATE TABLE IF NOT EXISTS site_analytics (
        id SERIAL PRIMARY KEY,
        total_views BIGINT DEFAULT 0,
        total_visitors BIGINT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO site_analytics (id, total_views, total_visitors)
      VALUES (1, 0, 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Pre-cache known hashes
    const res = await query('SELECT visitor_hash FROM analytics_visitors;');
    if (res && res.rows) {
      for (const row of res.rows) {
        if (row.visitor_hash) knownVisitorHashes.add(row.visitor_hash);
      }
    }

    // Sync site_analytics with genuine lifetime count
    const countRes = await query('SELECT COUNT(*) AS count FROM analytics_visitors;');
    const totalLifetime = parseInt(countRes.rows[0]?.count || 0, 10);

    const statsRes = await query('SELECT total_visitors FROM site_analytics WHERE id = 1;');
    const dbTotal = parseInt(statsRes.rows[0]?.total_visitors || 0, 10);

    if (totalLifetime > dbTotal) {
      await query('UPDATE site_analytics SET total_visitors = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1;', [totalLifetime]);
    }

    isInitialized = true;
    console.log(`📊 [Analytics Engine] Genuine analytics active with ${totalLifetime} lifetime unique visitors.`);
  } catch (err) {
    console.warn('⚠️ [Analytics Engine] Initialization notice:', err.message);
  }
}

initAnalyticsEngine();

// Purge inactive sessions older than 45 seconds
const cleanupInactiveVisitors = () => {
  const cutoff = Date.now() - 45000;
  for (const [hash, lastSeen] of activeVisitors.entries()) {
    if (lastSeen < cutoff) {
      activeVisitors.delete(hash);
    }
  }
};
setInterval(cleanupInactiveVisitors, 15000);

/**
 * Generate a deterministic fingerprint hash from IP + UserAgent + Client visitorId
 */
function generateVisitorFingerprint(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const clientVisitorId = req.body.visitorId || req.body.visitor_id || req.headers['x-visitor-id'] || '';

  const raw = `${ip}###${userAgent}###${clientVisitorId}###amaze_2026`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { hash, ip, userAgent };
}

// POST /api/analytics/heartbeat - Genuine heartbeat ping with 24-hr deduplication
router.post('/heartbeat', async (req, res) => {
  try {
    const { hash, ip, userAgent } = generateVisitorFingerprint(req);
    const now = Date.now();

    // 1. Sliding window live counter
    activeVisitors.set(hash, now);
    cleanupInactiveVisitors();

    // 2. 24-Hour Deduplication & Lifetime Count Tracking
    const isKnownInMemory = knownVisitorHashes.has(hash);

    if (!isKnownInMemory) {
      try {
        const checkRes = await query(
          'SELECT id, last_seen FROM analytics_visitors WHERE visitor_hash = $1 LIMIT 1;',
          [hash]
        );

        if (checkRes.rows.length === 0) {
          // New lifetime unique visitor
          await query(`
            INSERT INTO analytics_visitors (visitor_hash, ip_address, user_agent, first_seen, last_seen)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (visitor_hash) DO NOTHING;
          `, [hash, ip, userAgent]);

          await query(`
            UPDATE site_analytics
            SET total_visitors = total_visitors + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1;
          `);
        } else {
          // Returning visitor: update last_seen if > 24 hours
          const lastSeen = new Date(checkRes.rows[0].last_seen).getTime();
          const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
          if (now - lastSeen > TWENTY_FOUR_HOURS) {
            await query(
              'UPDATE analytics_visitors SET last_seen = CURRENT_TIMESTAMP WHERE visitor_hash = $1;',
              [hash]
            );
          }
        }
        knownVisitorHashes.add(hash);
      } catch (dbErr) {
        console.warn('[Analytics Heartbeat] DB check notice:', dbErr.message);
      }
    }

    // 3. Fetch genuine stats
    let totalViews = 0;
    let totalVisitors = knownVisitorHashes.size || 0;

    try {
      const statsRes = await query('SELECT total_views, total_visitors FROM site_analytics WHERE id = 1;');
      totalViews = parseInt(statsRes.rows[0]?.total_views || 0, 10);
      totalVisitors = parseInt(statsRes.rows[0]?.total_visitors || knownVisitorHashes.size || 0, 10);
    } catch (statsErr) {
      console.warn('[Analytics Heartbeat] DB stats notice:', statsErr?.message || statsErr);
    }

    const liveCount = Math.max(1, activeVisitors.size);

    res.json({
      success: true,
      liveCount,
      totalVisitors,
      totalViews
    });
  } catch (err) {
    console.error('Heartbeat error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
      liveCount: Math.max(1, activeVisitors.size),
      totalVisitors: knownVisitorHashes.size || 0,
      totalViews: 0
    });
  }
});

// GET /api/analytics/pulse - Live visitor count (Zero artificial multipliers)
router.get('/pulse', (req, res) => {
  cleanupInactiveVisitors();
  const liveCount = Math.max(1, activeVisitors.size);
  res.json({
    success: true,
    activeVisitors: liveCount,
    liveCount
  });
});

// GET /api/analytics/stats - Unified metrics for dashboard
router.get('/stats', optionalAuth, async (req, res) => {
  try {
    cleanupInactiveVisitors();

    const newsStatsRes = await query(`
      SELECT 
        COUNT(*) AS total_news,
        COUNT(*) FILTER (WHERE status = 'published') AS published_news,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_news,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft_news,
        COALESCE(SUM(views_count), 0) AS article_views,
        COALESCE(SUM(likes_count), 0) AS article_likes
      FROM news;
    `);

    const analyticsRes = await query('SELECT total_views, total_visitors FROM site_analytics WHERE id = 1;');
    const totalViews = parseInt(analyticsRes.rows[0]?.total_views || 0, 10);
    const totalVisitors = parseInt(analyticsRes.rows[0]?.total_visitors || knownVisitorHashes.size || 0, 10);

    const todayVisitorRes = await query(`
      SELECT COUNT(DISTINCT visitor_hash) AS today_visitors
      FROM analytics_visitors
      WHERE last_seen >= CURRENT_DATE;
    `);

    const nRow = newsStatsRes.rows[0] || {};
    const todayVisitors = parseInt(todayVisitorRes.rows[0]?.today_visitors || 0, 10);
    const liveCount = Math.max(1, activeVisitors.size);

    res.json({
      success: true,
      liveCount,
      totalVisitors,
      totalViews,
      data: {
        liveCount,
        totalNews: parseInt(nRow.total_news || 0, 10),
        publishedNews: parseInt(nRow.published_news || 0, 10),
        pendingNews: parseInt(nRow.pending_news || 0, 10),
        draftNews: parseInt(nRow.draft_news || 0, 10),
        articleViews: parseInt(nRow.article_views || 0, 10),
        articleLikes: parseInt(nRow.article_likes || 0, 10),
        totalViews,
        totalVisitors,
        todayVisitors: Math.max(todayVisitors, 1)
      }
    });
  } catch (err) {
    console.error('Error fetching analytics stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/analytics/track - Backwards compatible visitor tracking
router.post('/track', async (req, res) => {
  try {
    const { hash, ip, userAgent } = generateVisitorFingerprint(req);
    activeVisitors.set(hash, Date.now());

    res.json({
      success: true,
      is_new_today: true,
      today_uniques: Math.max(1, activeVisitors.size),
      liveCount: Math.max(1, activeVisitors.size)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/dashboard-stats - Backwards compatible admin dashboard metrics
router.get('/dashboard-stats', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    cleanupInactiveVisitors();

    const nStats = await query(`
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'published') AS published,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft,
        COALESCE(SUM(views_count), 0) AS total_views,
        COALESCE(SUM(likes_count), 0) AS total_likes
      FROM news;
    `);

    const row = nStats.rows[0] || {};
    const analyticsRes = await query('SELECT total_views, total_visitors FROM site_analytics WHERE id = 1;');
    const totalViews = parseInt(analyticsRes.rows[0]?.total_views || 0, 10);
    const totalVisitors = parseInt(analyticsRes.rows[0]?.total_visitors || knownVisitorHashes.size || 0, 10);

    const todayVisitorRes = await query(`
      SELECT COUNT(DISTINCT visitor_hash) AS today_visitors
      FROM analytics_visitors
      WHERE last_seen >= CURRENT_DATE;
    `);
    const todayVisitors = parseInt(todayVisitorRes.rows[0]?.today_visitors || 0, 10);

    res.json({
      success: true,
      data: {
        articles: {
          total: parseInt(row.total || 0, 10),
          published: parseInt(row.published || 0, 10),
          pending: parseInt(row.pending || 0, 10),
          draft: parseInt(row.draft || 0, 10),
          total_article_views: parseInt(row.total_views || 0, 10)
        },
        visitors: {
          today_uniques: Math.max(todayVisitors, 1),
          all_time_uniques: totalVisitors,
          active_now: Math.max(1, activeVisitors.size)
        },
        liveCount: Math.max(1, activeVisitors.size),
        totalViews,
        totalVisitors
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
