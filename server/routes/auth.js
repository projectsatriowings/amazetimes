import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'amaze_times_super_secure_jwt_secret_key_2026_tamil_media_portal';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'பயனர்பெயர் மற்றும் கடவுச்சொல் தேவை (Username and password required)' });
    }

    const result = await query(
      'SELECT id, username, email, password_hash, full_name, role, is_active, avatar_url, bio, phone FROM users WHERE username = $1 OR email = $1',
      [username.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல் (Invalid credentials)' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'உங்கள் கணக்கு முடக்கப்பட்டுள்ளது. நிர்வாகியை அணுகவும். (Account suspended)' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'தவறான கடவுச்சொல் (Incorrect password)' });
    }

    // Sign JWT token valid for 7 days
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Record login activity
    query('INSERT INTO activity_logs (user_id, action, entity_type) VALUES ($1, $2, $3)', [
      user.id,
      `User ${user.username} (${user.role}) logged in`,
      'auth'
    ]).catch(() => {});

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        bio: user.bio,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'உள்நுழைவு பிழை (Server login error)' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, full_name, role, is_active, avatar_url, bio, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'பயனர் கிடைக்கவில்லை (User not found)' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'தற்போதைய மற்றும் புதிய கடவுச்சொல் தேவை' });
    }

    const userRes = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'தற்போதைய கடவுச்சொல் தவறானது' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    res.json({ success: true, message: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
