import express from 'express';
import crypto from 'crypto';
import { query } from '../db.js';
import { authenticate, requireReporterOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/analytics/track - Public heartbeat/ping to track unique visitors
router.post('/track', async (req, res) => {
  try {
    const { visitor_id, device_type } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const clientUuid = visitor_id || req.headers['x-visitor-id'] || 'anon';
    const rawSignature = `${ip}|${userAgent}|${clientUuid}|amaze_salt_2026`;
    const visitorHash = crypto.createHash('sha256').update(rawSignature).digest('hex');

    // Detect browser
    const ua = userAgent.toLowerCase();
    let browser = 'Other';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edge')) browser = 'Edge';

    // Insert or update visitor (tracks exact unique visitor without inflating hit counters)
    const insertRes = await query(`
      INSERT INTO daily_visitors (visitor_hash, visit_date, device_type, browser, hit_count, last_seen_at)
      VALUES ($1, CURRENT_DATE, $2, $3, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (visitor_hash, visit_date) DO UPDATE
      SET last_seen_at = CURRENT_TIMESTAMP
      RETURNING (xmax = 0) AS is_new_today;
    `, [visitorHash, device_type || 'desktop', browser]);

    const isNewToday = insertRes.rows[0]?.is_new_today || false;

    // Get current today unique count
    const countRes = await query(
      'SELECT COUNT(DISTINCT visitor_hash) AS today_uniques FROM daily_visitors WHERE visit_date = CURRENT_DATE'
    );

    res.json({
      success: true,
      is_new_today: isNewToday,
      today_uniques: parseInt(countRes.rows[0]?.today_uniques || 1)
    });
  } catch (error) {
    console.error('Track error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/dashboard-stats - Comprehensive Admin & Reporter metrics
router.get('/dashboard-stats', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    // 1. Unique visitors metrics
    const visitorStats = await query(`
      SELECT 
        (SELECT COUNT(DISTINCT visitor_hash) FROM daily_visitors WHERE visit_date = CURRENT_DATE) AS today_uniques,
        (SELECT COUNT(DISTINCT visitor_hash) FROM daily_visitors WHERE visit_date = CURRENT_DATE - 1) AS yesterday_uniques,
        (SELECT COUNT(DISTINCT visitor_hash) FROM daily_visitors) AS all_time_uniques,
        (SELECT COALESCE(SUM(hit_count), 0) FROM daily_visitors WHERE visit_date = CURRENT_DATE) AS today_total_hits,
        (SELECT COALESCE(SUM(hit_count), 0) FROM daily_visitors) AS all_time_hits,
        (SELECT COUNT(DISTINCT visitor_hash) FROM daily_visitors WHERE last_seen_at >= NOW() - INTERVAL '5 minutes' AND visit_date = CURRENT_DATE) AS active_now;
    `);

    // 2. Article counts by status
    const articleStats = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'published') AS published_count,
        COUNT(*) FILTER (WHERE status = 'pending_approval') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft_count,
        COUNT(*) AS total_articles,
        COALESCE(SUM(view_count), 0) AS total_article_views
      FROM articles;
    `);

    // 3. Reporters count
    const reportersCountRes = await query(
      `SELECT COUNT(*) AS active_reporters FROM users WHERE role = 'reporter' AND is_active = true`
    );

    // 4. Device breakdown
    const deviceRes = await query(`
      SELECT device_type, COUNT(*) AS count
      FROM daily_visitors
      WHERE visit_date >= CURRENT_DATE - 7
      GROUP BY device_type;
    `);

    // 5. Category breakdown
    const categoryRes = await query(`
      SELECT c.name_ta, c.id, COUNT(a.id) AS article_count
      FROM categories c
      LEFT JOIN articles a ON a.category_id = c.id AND a.status = 'published'
      GROUP BY c.id, c.name_ta
      ORDER BY article_count DESC;
    `);

    // 6. Top 5 viewed articles
    const topArticlesRes = await query(`
      SELECT id, title, category_id, view_count, cover_image_url, published_at
      FROM articles
      WHERE status = 'published'
      ORDER BY view_count DESC, published_at DESC
      LIMIT 5;
    `);

    // 7. Recent 14 days visitor trend
    const dailyTrendRes = await query(`
      SELECT 
        TO_CHAR(visit_date, 'DD Mon') AS date_label,
        visit_date,
        COUNT(DISTINCT visitor_hash) AS unique_count,
        SUM(hit_count) AS total_hits
      FROM daily_visitors
      WHERE visit_date >= CURRENT_DATE - 14
      GROUP BY visit_date
      ORDER BY visit_date ASC;
    `);

    // 8. Reporter productivity leaderboard
    const reporterLeaderboardRes = await query(`
      SELECT 
        u.id, u.full_name, u.username,
        COUNT(a.id) FILTER (WHERE a.status = 'published') AS published,
        COUNT(a.id) FILTER (WHERE a.status = 'pending_approval') AS pending,
        COALESCE(SUM(a.view_count), 0) AS total_views
      FROM users u
      LEFT JOIN articles a ON a.author_id = u.id
      WHERE u.role = 'reporter'
      GROUP BY u.id
      ORDER BY published DESC, total_views DESC
      LIMIT 6;
    `);

    res.json({
      success: true,
      data: {
        visitors: {
          today_uniques: parseInt(visitorStats.rows[0]?.today_uniques || 0),
          yesterday_uniques: parseInt(visitorStats.rows[0]?.yesterday_uniques || 0),
          all_time_uniques: parseInt(visitorStats.rows[0]?.all_time_uniques || 0),
          today_total_hits: parseInt(visitorStats.rows[0]?.today_total_hits || 0),
          all_time_hits: parseInt(visitorStats.rows[0]?.all_time_hits || 0),
          active_now: Math.max(1, parseInt(visitorStats.rows[0]?.active_now || 0))
        },
        articles: {
          published: parseInt(articleStats.rows[0]?.published_count || 0),
          pending: parseInt(articleStats.rows[0]?.pending_count || 0),
          rejected: parseInt(articleStats.rows[0]?.rejected_count || 0),
          draft: parseInt(articleStats.rows[0]?.draft_count || 0),
          total: parseInt(articleStats.rows[0]?.total_articles || 0),
          total_views: parseInt(articleStats.rows[0]?.total_article_views || 0)
        },
        active_reporters: parseInt(reportersCountRes.rows[0]?.active_reporters || 0),
        devices: deviceRes.rows,
        categories: categoryRes.rows,
        top_articles: topArticlesRes.rows,
        visitor_trend: dailyTrendRes.rows,
        reporters_leaderboard: reporterLeaderboardRes.rows
      }
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
