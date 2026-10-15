import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'amaze_times_super_secure_jwt_secret_key_2026_tamil_media_portal';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// =========================================================================
// 1. POST /api/auth/register (Reader & User Registration into Neon Database)
// =========================================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'பெயர், மின்னஞ்சல் மற்றும் கடவுச்சொல் அவசியம் தேவை (Name, email, and password required)' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் கொண்டிருக்க வேண்டும் (Password must be at least 6 characters)' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (Email already registered)' 
      });
    }

    // Generate clean unique username
    let baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30) || 'reader';
    let finalUsername = baseUsername;
    let suffix = 1;
    while (true) {
      const checkUser = await query('SELECT id FROM users WHERE username = $1', [finalUsername]);
      if (checkUser.rows.length === 0) break;
      finalUsername = `${baseUsername}${suffix}`;
      suffix++;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Default avatar based on name initials
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=DC2626&color=fff&size=128&bold=true`;

    // Insert user into PostgreSQL database
    const insertResult = await query(
      `INSERT INTO users (username, email, password_hash, full_name, role, provider, avatar_url, phone, is_active)
       VALUES ($1, $2, $3, $4, 'reader', 'local', $5, $6, TRUE)
       RETURNING id, username, email, full_name, role, provider, avatar_url, phone, created_at`,
      [finalUsername, cleanEmail, passwordHash, cleanName, avatarUrl, phone || null]
    );

    const newUser = insertResult.rows[0];
    const token = generateToken(newUser);

    // Record activity
    query('INSERT INTO activity_logs (user_id, action, entity_type) VALUES ($1, $2, $3)', [
      newUser.id,
      `New reader ${newUser.full_name} registered`,
      'auth'
    ]).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'வாசகர் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! (Account registered successfully)',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'பதிவு செய்வதில் பிழை ஏற்பட்டது: ' + error.message });
  }
});

// =========================================================================
// 2. POST /api/auth/google (Google One-Click Sign-In & DB Persistence)
// =========================================================================
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar_url, google_id } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google மின்னஞ்சல் தேவை (Email required)' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name || cleanEmail.split('@')[0];

    // Check if user exists
    const existing = await query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      // If user exists, update avatar if provided
      if (avatar_url && !user.avatar_url) {
        await query('UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2', [avatar_url, user.id]);
        user.avatar_url = avatar_url;
      }
    } else {
      // Create new reader from Google
      let baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30) || 'reader';
      let finalUsername = baseUsername;
      let suffix = 1;
      while (true) {
        const checkUser = await query('SELECT id FROM users WHERE username = $1', [finalUsername]);
        if (checkUser.rows.length === 0) break;
        finalUsername = `${baseUsername}${suffix}`;
        suffix++;
      }

      // Random hashed password for oauth user
      const randomPass = Math.random().toString(36).slice(-12) + 'Amaze2026!';
      const passwordHash = await bcrypt.hash(randomPass, 10);
      const userAvatar = avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0A1945&color=fff&size=128&bold=true`;

      const insertResult = await query(
        `INSERT INTO users (username, email, password_hash, full_name, role, provider, avatar_url, is_active)
         VALUES ($1, $2, $3, $4, 'reader', 'google', $5, TRUE)
         RETURNING id, username, email, full_name, role, provider, avatar_url, created_at`,
        [finalUsername, cleanEmail, passwordHash, cleanName, userAvatar]
      );
      user = insertResult.rows[0];
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'உங்கள் கணக்கு முடக்கப்பட்டுள்ளது (Account disabled)' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        provider: user.provider || 'google',
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ success: false, message: 'Google உள்நுழைவு பிழை: ' + error.message });
  }
});

// =========================================================================
// 3. POST /api/auth/login (Standard Login for Readers, Reporters & Admins)
// =========================================================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'பயனர்பெயர் மற்றும் கடவுச்சொல் தேவை (Username and password required)' });
    }

    const cleanInput = username.trim().toLowerCase();
    const result = await query(
      'SELECT id, username, email, password_hash, full_name, role, is_active, avatar_url, bio, phone, provider FROM users WHERE username = $1 OR email = $1',
      [cleanInput]
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

    const token = generateToken(user);

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
        provider: user.provider || 'local',
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

// =========================================================================
// 4. GET /api/auth/me (Current Authenticated User Info)
// =========================================================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, full_name, role, is_active, avatar_url, bio, phone, provider, created_at FROM users WHERE id = $1',
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

// =========================================================================
// 5. GET /api/auth/users (ADMIN & Public View: List all registered readers, reporters & admins)
// =========================================================================
router.get('/users', optionalAuth, async (req, res) => {
  try {
    const { role, search } = req.query;
    let sql = `
      SELECT id, username, email, full_name, role, provider, avatar_url, phone, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'all') {
      params.push(role);
      sql += ` AND role = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(full_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(username) LIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);

    // Get stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'reader' OR role = 'user') as total_readers,
        COUNT(*) FILTER (WHERE role = 'reporter') as total_reporters,
        COUNT(*) FILTER (WHERE role = 'admin') as total_admins
      FROM users
    `);

    res.json({
      success: true,
      users: result.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 6. POST /api/auth/users (ADMIN: Create new User / Reporter / Reader)
// =========================================================================
router.post('/users', optionalAuth, async (req, res) => {
  try {
    const { name, email, password, role = 'reader', phone, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'பெயர், மின்னஞ்சல் மற்றும் கடவுச்சொல் அவசியம் தேவை' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'இந்த மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது' });
    }

    let baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30) || 'user';
    let finalUsername = baseUsername;
    let suffix = 1;
    while (true) {
      const checkUser = await query('SELECT id FROM users WHERE username = $1', [finalUsername]);
      if (checkUser.rows.length === 0) break;
      finalUsername = `${baseUsername}${suffix}`;
      suffix++;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=DC2626&color=fff&size=128&bold=true`;

    const insertResult = await query(
      `INSERT INTO users (username, email, password_hash, full_name, role, provider, avatar_url, phone, bio, is_active)
       VALUES ($1, $2, $3, $4, $5, 'local', $6, $7, $8, TRUE)
       RETURNING id, username, email, full_name, role, provider, avatar_url, phone, created_at`,
      [finalUsername, cleanEmail, passwordHash, name.trim(), role, avatarUrl, phone || null, designation || null]
    );

    res.status(201).json({
      success: true,
      message: 'பயனர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
      user: insertResult.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 7. DELETE /api/auth/users/:id (ADMIN: Delete User)
// =========================================================================
router.delete('/users/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user && id === req.user.id) {
      return res.status(400).json({ success: false, message: 'நீங்கள் தற்போது உள்நுழைந்துள்ள நிர்வாகி கணக்கை நீக்க முடியாது' });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'பயனர் வெற்றிகரமாக நீக்கப்பட்டார்' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 8. PUT /api/auth/users/:id/status (ADMIN: Toggle User Active Status)
// =========================================================================
router.put('/users/:id/status', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_active',
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'பயனர் கிடைக்கவில்லை' });
    }

    res.json({ success: true, is_active: result.rows[0].is_active });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 9. POST /api/auth/change-password
// =========================================================================
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
