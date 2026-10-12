import crypto from 'crypto';
import { query } from '../db.js';

export const trackVisitor = async (req, res, next) => {
  try {
    // Generate visitor hash from IP, User-Agent, and client visitor id header
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const clientVisitorId = req.headers['x-visitor-id'] || '';

    const rawSignature = `${ip}|${userAgent}|${clientVisitorId}|amaze_salt_2026`;
    const visitorHash = crypto.createHash('sha256').update(rawSignature).digest('hex');

    // Detect device type
    const ua = userAgent.toLowerCase();
    let deviceType = 'desktop';
    if (/tablet|ipad/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|android/i.test(ua)) {
      deviceType = 'mobile';
    }

    // Detect browser
    let browser = 'Other';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edge')) browser = 'Edge';

    // Asynchronously upsert visitor row
    query(`
      INSERT INTO daily_visitors (visitor_hash, visit_date, device_type, browser, hit_count, last_seen_at)
      VALUES ($1, CURRENT_DATE, $2, $3, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (visitor_hash, visit_date) DO UPDATE
      SET hit_count = daily_visitors.hit_count + 1,
          last_seen_at = CURRENT_TIMESTAMP;
    `, [visitorHash, deviceType, browser]).catch((err) => {
      console.error('Visitor track query error:', err.message);
    });

    req.visitorHash = visitorHash;
  } catch (error) {
    // Analytics failure should never block request flow
    console.error('Visitor tracking error:', error.message);
  }
  next();
};
