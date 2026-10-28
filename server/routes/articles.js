import express from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin, requireReporterOrAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate URL slug from Tamil or English title
function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0B80-\u0BFF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const timestamp = Date.now().toString().slice(-6);
  return `${base.slice(0, 80)}-${timestamp}`;
}

// GET /api/articles - List articles with pagination & filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, status, author_id, lead_only } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [];
    let params = [];

    const validStatus = status && status !== 'all' && status !== 'undefined' ? status : null;
    const validCategory = category && category !== 'all' && category !== 'undefined' ? category : null;
    const validAuthorId = author_id && author_id !== 'undefined' ? author_id : null;
    const validSearch = search && search.trim() && search.trim() !== 'undefined' ? search.trim() : null;

    // Access control on status:
    // Unauthenticated readers can ONLY see 'published'
    if (!req.user || req.user.role === 'public') {
      whereConditions.push(`a.status = 'published'`);
    } else if (req.user.role === 'reporter') {
      if (validStatus === 'mine') {
        params.push(req.user.id);
        whereConditions.push(`a.author_id = $${params.length}`);
      } else if (validStatus) {
        params.push(validStatus);
        whereConditions.push(`a.status = $${params.length}`);
      } else {
        whereConditions.push(`a.status = 'published'`);
      }
    } else if (req.user.role === 'admin') {
      if (validStatus) {
        params.push(validStatus);
        whereConditions.push(`a.status = $${params.length}`);
      }
    }

    if (validCategory) {
      params.push(validCategory);
      whereConditions.push(`a.category_id = $${params.length}`);
    }

    if (validAuthorId) {
      params.push(validAuthorId);
      whereConditions.push(`a.author_id = $${params.length}`);
    }

    if (validSearch) {
      params.push(`%${validSearch.toLowerCase()}%`);
      whereConditions.push(`(LOWER(a.title) LIKE $${params.length} OR LOWER(a.content) LIKE $${params.length})`);
    }

    if (lead_only === 'true') {
      whereConditions.push(`a.is_lead = true`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    params.push(parseInt(limit));
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const sql = `
      SELECT 
        a.id, a.title, a.subtitle, a.slug, a.content, a.excerpt, a.category_id,
        c.name_ta AS category_name, c.icon AS category_icon,
        a.author_id, u.full_name AS author_name, u.role AS author_role,
        a.status, a.rejection_reason, a.cover_image_url, a.tags,
        a.is_lead, a.is_breaking, a.view_count, a.published_at, a.created_at,
        COUNT(*) OVER() AS total_count
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
      LEFT JOIN users u ON u.id = a.author_id
      ${whereClause}
      ORDER BY a.is_lead DESC, a.published_at DESC NULLS LAST, a.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const result = await query(sql, params);
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    res.json({
      success: true,
      articles: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Fetch articles error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/articles/:id - Get single article & increment views
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(String(id).trim())) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை (Article not found)' });
    }

    // Increment view count asynchronously
    query('UPDATE articles SET view_count = view_count + 1 WHERE id = $1', [id]).catch(() => {});

    const result = await query(`
      SELECT 
        a.id, a.title, a.subtitle, a.slug, a.content, a.excerpt, a.category_id,
        c.name_ta AS category_name,
        a.author_id, u.full_name AS author_name, u.bio AS author_bio, u.avatar_url AS author_avatar,
        a.status, a.rejection_reason, a.cover_image_url, a.tags,
        a.is_lead, a.is_breaking, a.view_count, a.published_at, a.created_at
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
      LEFT JOIN users u ON u.id = a.author_id
      WHERE a.id = $1;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை (Article not found)' });
    }

    res.json({ success: true, article: result.rows[0] });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/articles - Create article (Admin can publish directly; Reporter needs approval)
router.post('/', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const {
      title, subtitle, content, excerpt, category_id,
      cover_image_url, tags = [], is_lead = false, is_breaking = false,
      save_as_draft = false
    } = req.body;

    if (!title || !content || !category_id || !cover_image_url) {
      return res.status(400).json({ 
        success: false, 
        message: 'தலைப்பு, செய்தி விவரம், பிரிவு மற்றும் முகப்பு படம் ஆகியவை கட்டாயம் தேவை' 
      });
    }

    const slug = generateSlug(title);
    const author_id = req.user.id;

    // Workflow rule:
    // If Admin: can directly publish or save draft
    // If Reporter: ALWAYS 'pending_approval' unless explicitly saved as 'draft'
    let status = 'pending_approval';
    let published_at = null;

    if (req.user.role === 'admin') {
      if (save_as_draft) {
        status = 'draft';
      } else {
        status = 'published';
        published_at = new Date();
      }
    } else if (req.user.role === 'reporter') {
      status = save_as_draft ? 'draft' : 'pending_approval';
    }

    // If marked as lead, unmark any previous lead in that category
    if (is_lead && req.user.role === 'admin') {
      await query('UPDATE articles SET is_lead = false WHERE category_id = $1', [category_id]);
    }

    const result = await query(`
      INSERT INTO articles (
        title, subtitle, slug, content, excerpt, category_id, author_id,
        status, cover_image_url, tags, is_lead, is_breaking, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `, [
      title.trim(), subtitle ? subtitle.trim() : null, slug, content,
      excerpt ? excerpt.trim() : content.slice(0, 160), category_id, author_id,
      status, cover_image_url, Array.isArray(tags) ? tags : [],
      req.user.role === 'admin' ? is_lead : false,
      req.user.role === 'admin' ? is_breaking : false,
      published_at
    ]);

    const createdArticle = result.rows[0];

    query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)', [
      req.user.id,
      `${req.user.username} created article "${title}" with status ${status}`,
      'article',
      createdArticle.id
    ]).catch(() => {});

    res.status(201).json({
      success: true,
      message: status === 'published' 
        ? 'செய்தி வெற்றிகரமாக வெளியிடப்பட்டது! (Article published live)'
        : 'செய்தி நிர்வாகியின் ஒப்புதலுக்காக சமர்ப்பிக்கப்பட்டது (Submitted for admin approval)',
      article: createdArticle
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/articles/:id - Update article
router.put('/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, subtitle, content, excerpt, category_id,
      cover_image_url, tags, is_lead, is_breaking, status
    } = req.body;

    const existingRes = await query('SELECT * FROM articles WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    const existing = existingRes.rows[0];

    // Reporters can only edit their own articles, and only if not yet published
    if (req.user.role === 'reporter') {
      if (existing.author_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'உங்கள் செய்திகளை மட்டுமே நீங்கள் திருத்த முடியும்' });
      }
    }

    let finalStatus = existing.status;
    let published_at = existing.published_at;

    if (req.user.role === 'admin') {
      if (status) {
        finalStatus = status;
        if (status === 'published' && !published_at) {
          published_at = new Date();
        }
      }
    } else if (req.user.role === 'reporter') {
      // Re-editing sends back to pending_approval
      finalStatus = 'pending_approval';
    }

    if (is_lead && req.user.role === 'admin') {
      await query('UPDATE articles SET is_lead = false WHERE category_id = $1 AND id != $2', [category_id || existing.category_id, id]);
    }

    const updateRes = await query(`
      UPDATE articles
      SET title = COALESCE($1, title),
          subtitle = COALESCE($2, subtitle),
          content = COALESCE($3, content),
          excerpt = COALESCE($4, excerpt),
          category_id = COALESCE($5, category_id),
          cover_image_url = COALESCE($6, cover_image_url),
          tags = COALESCE($7, tags),
          is_lead = COALESCE($8, is_lead),
          is_breaking = COALESCE($9, is_breaking),
          status = $10,
          published_at = $11,
          updated_at = NOW()
      WHERE id = $12
      RETURNING *;
    `, [
      title ? title.trim() : null,
      subtitle ? subtitle.trim() : null,
      content || null,
      excerpt ? excerpt.trim() : null,
      category_id || null,
      cover_image_url || null,
      tags || null,
      typeof is_lead === 'boolean' ? is_lead : null,
      typeof is_breaking === 'boolean' ? is_breaking : null,
      finalStatus,
      published_at,
      id
    ]);

    res.json({
      success: true,
      message: 'செய்தி வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது',
      article: updateRes.rows[0]
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/articles/:id/status - Admin Approval or Rejection
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['published', 'rejected', 'archived', 'draft'].includes(status)) {
      return res.status(400).json({ success: false, message: 'செல்லுபடியாகாத நிலை (Invalid status)' });
    }

    let published_at = null;
    if (status === 'published') {
      published_at = new Date();
    }

    const result = await query(`
      UPDATE articles
      SET status = $1,
          rejection_reason = $2,
          reviewed_by = $3,
          reviewed_at = NOW(),
          published_at = COALESCE(published_at, $4),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `, [status, rejection_reason || null, req.user.id, published_at, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    const message = status === 'published'
      ? 'செய்தி அங்கீகரிக்கப்பட்டு வெளியிடப்பட்டது! (Approved & Published)'
      : status === 'rejected'
      ? 'செய்தி நிராகரிக்கப்பட்டது (Article Rejected with feedback)'
      : 'செய்தி நிலை மாற்றப்பட்டது';

    res.json({ success: true, message, article: result.rows[0] });
  } catch (error) {
    console.error('Status change error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/articles/:id - Admin Delete Article
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const delRes = await query('DELETE FROM articles WHERE id = $1 RETURNING id, title', [id]);
    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    res.json({ success: true, message: 'செய்தி வெற்றிகரமாக நீக்கப்பட்டது (Article deleted)' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
