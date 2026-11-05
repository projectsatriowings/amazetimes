import express from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/competitions/apply
 * Public submission endpoint for participants
 */
router.post('/apply', async (req, res) => {
  try {
    const {
      competitionId,
      competitionTitle,
      applicantName,
      phone,
      email,
      institution,
      district,
      entryTitle,
      entryContent,
      entryUrl
    } = req.body;

    if (!applicantName || !phone || !entryTitle) {
      return res.status(400).json({
        success: false,
        message: 'பெயர், தொலைபேசி எண் மற்றும் படைப்பின் தலைப்பு ஆகியவை கட்டாயம் தேவை.'
      });
    }

    const insertRes = await query(`
      INSERT INTO competition_applications (
        competition_id,
        competition_title,
        applicant_name,
        phone,
        email,
        institution,
        district,
        entry_title,
        entry_content,
        entry_url,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', CURRENT_TIMESTAMP)
      RETURNING *;
    `, [
      competitionId || 'general',
      competitionTitle || 'மாநிலப் போட்டி',
      applicantName.trim(),
      phone.trim(),
      email ? email.trim() : null,
      institution ? institution.trim() : null,
      district ? district.trim() : null,
      entryTitle.trim(),
      entryContent ? entryContent.trim() : null,
      entryUrl ? entryUrl.trim() : null
    ]);

    const created = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'உங்கள் விண்ணப்பம் வெற்றிகரமாகப் பெறப்பட்டது! அமேஸ் டைம்ஸ் நடுவர் குழு ஆய்வு செய்யும்.',
      application: created
    });
  } catch (err) {
    console.error('Error submitting competition application:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/competitions/applications
 * Admin endpoint to list, filter, search all submitted applications
 */
router.get('/applications', async (req, res) => {
  try {
    const {
      competitionId,
      status,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (competitionId && competitionId !== 'all') {
      conditions.push(`competition_id = $${paramIndex++}`);
      params.push(competitionId);
    }

    if (status && status !== 'all') {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      conditions.push(`(
        LOWER(applicant_name) LIKE $${paramIndex} OR
        LOWER(entry_title) LIKE $${paramIndex} OR
        LOWER(phone) LIKE $${paramIndex} OR
        LOWER(COALESCE(institution, '')) LIKE $${paramIndex} OR
        LOWER(COALESCE(competition_title, '')) LIKE $${paramIndex}
      )`);
      params.push(q);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch total matching count
    const countRes = await query(`
      SELECT COUNT(*) AS total
      FROM competition_applications
      ${whereClause};
    `, params);

    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    // Fetch rows
    const listRes = await query(`
      SELECT *
      FROM competition_applications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `, [...params, limitNum, offset]);

    // Fetch quick stats
    const statsRes = await query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'shortlisted') AS shortlisted,
        COUNT(*) FILTER (WHERE status = 'awarded') AS awarded,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
      FROM competition_applications;
    `);

    const stats = {
      total: parseInt(statsRes.rows[0]?.total || 0, 10),
      pending: parseInt(statsRes.rows[0]?.pending || 0, 10),
      shortlisted: parseInt(statsRes.rows[0]?.shortlisted || 0, 10),
      awarded: parseInt(statsRes.rows[0]?.awarded || 0, 10),
      rejected: parseInt(statsRes.rows[0]?.rejected || 0, 10)
    };

    res.json({
      success: true,
      applications: listRes.rows,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats
    });
  } catch (err) {
    console.error('Error fetching competition applications:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/competitions/applications/:id/status
 * Update review status and admin notes
 */
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const allowedStatuses = ['pending', 'under_review', 'shortlisted', 'awarded', 'rejected'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'தவறான நிலை (Invalid status)' });
    }

    const updates = [];
    const params = [id];
    let pIdx = 2;

    if (status) {
      updates.push(`status = $${pIdx++}`);
      params.push(status);
    }

    if (adminNotes !== undefined) {
      updates.push(`admin_notes = $${pIdx++}`);
      params.push(adminNotes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'புதுப்பிக்க வேண்டிய தகவல்கள் இல்லை' });
    }

    const updateRes = await query(`
      UPDATE competition_applications
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *;
    `, params);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'விண்ணப்பம் கிடைக்கவில்லை' });
    }

    res.json({
      success: true,
      message: 'விண்ணப்பத்தின் நிலை வெற்றிகரமாக மாற்றப்பட்டது',
      application: updateRes.rows[0]
    });
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/competitions/applications/:id
 * Delete application
 */
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const delRes = await query(`
      DELETE FROM competition_applications
      WHERE id = $1
      RETURNING id;
    `, [id]);

    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'விண்ணப்பம் கிடைக்கவில்லை' });
    }

    res.json({
      success: true,
      message: 'விண்ணப்பம் வெற்றிகரமாக நீக்கப்பட்டது'
    });
  } catch (err) {
    console.error('Error deleting competition application:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
