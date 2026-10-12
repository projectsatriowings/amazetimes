import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'amaze_times_super_secure_jwt_secret_key_2026_tamil_media_portal';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'அங்கீகாரம் தேவை (Authentication required)' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user is still active in database
    const userRes = await query('SELECT id, username, email, full_name, role, is_active FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      return res.status(403).json({ success: false, message: 'பயனர் கணக்கு முடக்கப்பட்டுள்ளது (Account inactive or suspended)' });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'செல்லுபடியாகாத அனுமதிச் சான்று (Invalid or expired token)' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'நிர்வாகி அனுமதி மட்டுமே தேவை (Admin access only)' });
  }
  next();
};

export const requireReporterOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'reporter' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'நிருபர் அல்லது நிர்வாகி அனுமதி தேவை (Reporter or Admin access required)' });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRes = await query('SELECT id, username, email, full_name, role, is_active FROM users WHERE id = $1', [decoded.id]);
      if (userRes.rows.length > 0 && userRes.rows[0].is_active) {
        req.user = userRes.rows[0];
      }
    } catch (_) {
      // Ignore token failure for public requests
    }
  }
  next();
};
