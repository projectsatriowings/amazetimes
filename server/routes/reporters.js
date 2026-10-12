import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All reporter management routes require Admin authorization
router.use(authenticate, requireAdmin);

// GET /api/reporters - List all reporters with article counts
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.username, u.email, u.full_name, u.phone, u.bio, u.avatar_url, u.is_active, u.created_at,
        COUNT(a.id) FILTER (WHERE a.status = 'published') AS published_count,
        COUNT(a.id) FILTER (WHERE a.status = 'pending_approval') AS pending_count,
        COUNT(a.id) FILTER (WHERE a.status = 'rejected') AS rejected_count,
        COUNT(a.id) AS total_articles
      FROM users u
      LEFT JOIN articles a ON a.author_id = u.id
      WHERE u.role = 'reporter'
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `);

    res.json({ success: true, reporters: result.rows });
  } catch (error) {
    console.error('Fetch reporters error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reporters - Add new reporter
router.post('/', async (req, res) => {
  try {
    const { username, password, full_name, email, phone, bio } = req.body;

    if (!username || !password || !full_name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'பயனர்பெயர், கடவுச்சொல், பெயர் மற்றும் மின்னஞ்சல் அவசியம் தேவை (Required fields missing)' 
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if username or email already exists
    const existing = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [cleanUsername, cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'இந்த பயனர்பெயர் அல்லது மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது (Username or email already exists)' 
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(`
      INSERT INTO users (username, password_hash, full_name, email, phone, bio, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, 'reporter', true)
      RETURNING id, username, full_name, email, phone, bio, role, is_active, created_at;
    `, [cleanUsername, passwordHash, full_name.trim(), cleanEmail, phone || '', bio || '']);

    // Log action
    query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)', [
      req.user.id,
      `Admin created reporter account: ${cleanUsername}`,
      'reporter',
      result.rows[0].id
    ]).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'நிருபர் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது (Reporter created successfully)',
      reporter: result.rows[0]
    });
  } catch (error) {
    console.error('Create reporter error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/reporters/:id - Update reporter details & optional password reset
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, bio, is_active, password } = req.body;

    // Check if reporter exists
    const reporterRes = await query('SELECT id, username FROM users WHERE id = $1 AND role = $2', [id, 'reporter']);
    if (reporterRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'நிருபர் கணக்கு கிடைக்கவில்லை (Reporter not found)' });
    }

    let updateQuery = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          bio = COALESCE($4, bio),
          is_active = COALESCE($5, is_active),
          updated_at = NOW()
    `;
    const params = [
      full_name ? full_name.trim() : null,
      email ? email.trim().toLowerCase() : null,
      phone ? phone.trim() : null,
      bio ? bio.trim() : null,
      typeof is_active === 'boolean' ? is_active : null
    ];

    if (password && password.trim().length > 0) {
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      params.push(passwordHash);
      updateQuery += `, password_hash = $${params.length}`;
    }

    params.push(id);
    updateQuery += ` WHERE id = $${params.length} RETURNING id, username, full_name, email, phone, bio, is_active, updated_at;`;

    const updated = await query(updateQuery, params);

    // Log action
    query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)', [
      req.user.id,
      `Admin updated reporter account: ${reporterRes.rows[0].username}`,
      'reporter',
      id
    ]).catch(() => {});

    res.json({
      success: true,
      message: 'நிருபர் விவரங்கள் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டன (Reporter updated)',
      reporter: updated.rows[0]
    });
  } catch (error) {
    console.error('Update reporter error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/reporters/:id - Delete reporter
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const reporterRes = await query('SELECT id, username FROM users WHERE id = $1 AND role = $2', [id, 'reporter']);
    if (reporterRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'நிருபர் கணக்கு கிடைக்கவில்லை' });
    }

    // Unlink articles from author before deletion
    await query('UPDATE articles SET author_id = NULL WHERE author_id = $1', [id]);
    await query('DELETE FROM users WHERE id = $1', [id]);

    query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)', [
      req.user.id,
      `Admin deleted reporter account: ${reporterRes.rows[0].username}`,
      'reporter',
      id
    ]).catch(() => {});

    res.json({
      success: true,
      message: 'நிருபர் கணக்கு வெற்றிகரமாக நீக்கப்பட்டது (Reporter deleted)'
    });
  } catch (error) {
    console.error('Delete reporter error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
