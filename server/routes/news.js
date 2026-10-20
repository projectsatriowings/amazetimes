import express from 'express';
import { query, ensureHttpsUrl } from '../db.js';
import { authenticate, requireReporterOrAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to format an article row uniformly
const formatNewsRow = (r) => {
  return {
    id: r.id,
    _id: String(r.id),
    title: r.title,
    subtitle: r.subtitle || '',
    summary: r.summary || r.excerpt || (r.content ? r.content.substring(0, 160) + '...' : ''),
    desc: r.summary || r.excerpt || (r.content ? r.content.substring(0, 160) + '...' : ''),
    excerpt: r.summary || r.excerpt || '',
    content: r.content,
    category: r.category || r.category_name || 'தமிழ்நாடு',
    cat: r.category || r.category_name || 'தமிழ்நாடு',
    category_id: r.category || 'all',
    district: r.district || 'all',
    mainImage: ensureHttpsUrl(r.main_image || r.cover_image_url || '/Amaze times.jpg'),
    image: ensureHttpsUrl(r.main_image || r.cover_image_url || '/Amaze times.jpg'),
    img: ensureHttpsUrl(r.main_image || r.cover_image_url || '/Amaze times.jpg'),
    cover_image_url: ensureHttpsUrl(r.main_image || r.cover_image_url || '/Amaze times.jpg'),
    seoKeywords: r.seo_keywords || '',
    tags: Array.isArray(r.tags) ? r.tags : (r.tags ? String(r.tags).split(',').map(t => t.trim()) : []),
    tag: Array.isArray(r.tags) ? (r.tags[0] || 'செய்தி') : (r.tags ? String(r.tags).split(',')[0].trim() : 'செய்தி'),
    isBreaking: Boolean(r.is_breaking),
    is_breaking: Boolean(r.is_breaking),
    isLeadHero: Boolean(r.is_lead_hero || r.is_lead),
    is_lead_hero: Boolean(r.is_lead_hero || r.is_lead),
    isTopStory: Boolean(r.is_top_story),
    is_top_story: Boolean(r.is_top_story),
    displayOrder: r.display_order || 0,
    display_order: r.display_order || 0,
    authorName: r.author_name || 'செய்தி ஆசிரியர்',
    author: r.author_name || 'செய்தி ஆசிரியர்',
    status: r.status || 'published',
    viewsCount: parseInt(r.views_count || r.view_count || 0, 10),
    views_count: parseInt(r.views_count || r.view_count || 0, 10),
    view_count: parseInt(r.views_count || r.view_count || 0, 10),
    likesCount: parseInt(r.likes_count || 0, 10),
    likes_count: parseInt(r.likes_count || 0, 10),
    publishedAt: r.published_at || r.created_at,
    published_at: r.published_at || r.created_at,
    createdAt: r.created_at,
    created_at: r.created_at,
    time: r.published_at || r.created_at
  };
};

// GET /api/news & /api/articles - List news with pagination, category/district filters, search
router.get('/', optionalAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const {
      page = 1,
      limit = 50,
      category,
      district,
      status,
      search,
      is_breaking,
      is_lead_hero,
      is_top_story
    } = req.query;

    const isUnlimited = limit === 'all' || limit === '0' || limit === 'unlimited';
    const limitNum = isUnlimited ? 5000 : Math.min(5000, Math.max(1, parseInt(limit, 10) || 50));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const params = [];

    // Filter by status (public users can only view 'published')
    const isAdminOrReporter = req.user && (req.user.role === 'admin' || req.user.role === 'reporter');
    if (!isAdminOrReporter) {
      whereConditions.push(`status = 'published'`);
    } else if (status && status !== 'all' && status !== 'undefined') {
      params.push(status);
      whereConditions.push(`status = $${params.length}`);
    }

    // Filter by category
    if (category && category !== 'all' && category !== 'undefined') {
      params.push(category);
      whereConditions.push(`(category = $${params.length} OR category ILIKE $${params.length})`);
    }

    // Filter by district
    if (district && district !== 'all' && district !== 'undefined') {
      params.push(district);
      whereConditions.push(`(district = $${params.length} OR district ILIKE $${params.length})`);
    }

    // Search query
    if (search && search.trim() && search.trim() !== 'undefined') {
      params.push(`%${search.trim().toLowerCase()}%`);
      whereConditions.push(`(
        LOWER(title) LIKE $${params.length} OR 
        LOWER(summary) LIKE $${params.length} OR 
        LOWER(content) LIKE $${params.length} OR
        LOWER(tags) LIKE $${params.length}
      )`);
    }

    if (is_breaking === 'true') {
      whereConditions.push(`is_breaking = TRUE`);
    }
    if (is_lead_hero === 'true') {
      whereConditions.push(`is_lead_hero = TRUE`);
    }
    if (is_top_story === 'true') {
      whereConditions.push(`is_top_story = TRUE`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matches
    const countSql = `SELECT COUNT(*) AS total FROM news ${whereClause};`;
    const countRes = await query(countSql, params);
    const totalCount = parseInt(countRes.rows[0]?.total || 0, 10);

    // Fetch paginated results ordered by display_order DESC, created_at DESC
    params.push(limitNum);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const selectSql = `
      SELECT * FROM news
      ${whereClause}
      ORDER BY COALESCE(display_order, 0) DESC, created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const result = await query(selectSql, params);
    const formattedNews = result.rows.map(formatNewsRow);

    res.json({
      success: true,
      news: formattedNews,
      data: formattedNews,
      articles: formattedNews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      }
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ success: false, message: 'செய்திகளை ஏற்றுவதில் பிழை: ' + err.message });
  }
});

// GET /api/news/:id - Fetch single article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT * FROM news WHERE id = $1;`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    const formatted = formatNewsRow(result.rows[0]);
    res.json({ success: true, news: formatted, data: formatted, article: formatted });
  } catch (err) {
    console.error('Error fetching single news:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/news/:id/view - Atomically increment news views and site analytics
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    // Increment news views_count
    const updateNewsRes = await query(`
      UPDATE news
      SET views_count = COALESCE(views_count, 0) + 1
      WHERE id = $1
      RETURNING views_count;
    `, [id]);

    if (updateNewsRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    const updatedViews = updateNewsRes.rows[0].views_count;

    // Increment site_analytics total_views
    await query(`
      UPDATE site_analytics
      SET total_views = total_views + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1;
    `);

    // Sync articles table if present
    try {
      await query(`UPDATE articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1;`, [id]);
    } catch (_) {}

    res.json({
      success: true,
      viewsCount: updatedViews,
      views_count: updatedViews,
      message: 'பார்வை எண்ணிக்கை வெற்றிகரமாக பதிவு செய்யப்பட்டது'
    });
  } catch (err) {
    console.error('Error recording view:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/news/:id/like - Permanent unique likes engine
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userIdentifier = req.body.userIdentifier || req.headers['x-visitor-id'] || req.ip || 'anonymous';
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '';

    // Check if user already liked
    const existing = await query(`
      SELECT id FROM news_likes 
      WHERE news_id = $1 AND user_identifier = $2;
    `, [id, userIdentifier]);

    let liked = false;
    let newLikesCount = 0;

    if (existing.rows.length > 0) {
      // User has already liked -> Remove like & decrement
      await query(`DELETE FROM news_likes WHERE id = $1;`, [existing.rows[0].id]);
      const updateRes = await query(`
        UPDATE news
        SET likes_count = GREATEST(0, COALESCE(likes_count, 1) - 1)
        WHERE id = $1
        RETURNING likes_count;
      `, [id]);
      newLikesCount = updateRes.rows[0]?.likes_count || 0;
      liked = false;
    } else {
      // User hasn't liked -> Insert like & increment
      await query(`
        INSERT INTO news_likes (news_id, user_identifier, ip_address)
        VALUES ($1, $2, $3)
        ON CONFLICT (news_id, user_identifier) DO NOTHING;
      `, [id, userIdentifier, clientIp]);

      const updateRes = await query(`
        UPDATE news
        SET likes_count = COALESCE(likes_count, 0) + 1
        WHERE id = $1
        RETURNING likes_count;
      `, [id]);
      newLikesCount = updateRes.rows[0]?.likes_count || 1;
      liked = true;
    }

    res.json({
      success: true,
      liked,
      likesCount: newLikesCount,
      likes_count: newLikesCount
    });
  } catch (err) {
    console.error('Error toggling news like:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/news/:id/make-first - Priority #1 button to bump article to top of homepage
router.post('/:id/make-first', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE news
      SET display_order = (SELECT COALESCE(MAX(display_order), 0) + 1 FROM news),
          is_top_story = TRUE
      WHERE id = $1
      RETURNING *;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    const updated = formatNewsRow(result.rows[0]);
    res.json({
      success: true,
      message: 'செய்தி வெற்றிகரமாக முகப்புப் பக்கத்தின் முதல் இடத்திற்கு கொண்டு செல்லப்பட்டது (#1 Priority)',
      display_order: updated.display_order,
      news: updated,
      data: updated
    });
  } catch (err) {
    console.error('Error in make-first:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/news - Create news article (Admin / Reporter)
router.post('/', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const {
      title,
      subtitle = '',
      summary = '',
      desc = '',
      content = '',
      category = 'தமிழ்நாடு',
      district = 'all',
      mainImage = '',
      image = '',
      seoKeywords = '',
      tags = '',
      isBreaking = false,
      isLeadHero = false,
      isTopStory = false,
      authorName = 'செய்தி ஆசிரியர்',
      status = 'published'
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'செய்தித் தலைப்பு கட்டாயமானது' });
    }

    const cleanImage = ensureHttpsUrl(mainImage || image || '/Amaze times.jpg');
    const cleanSummary = summary || desc || (content ? content.substring(0, 160) + '...' : '');
    const cleanTags = Array.isArray(tags) ? tags.join(', ') : (tags || '');

    // Compute display order
    const maxOrderRes = await query(`SELECT COALESCE(MAX(display_order), 0) AS max_order FROM news;`);
    const nextOrder = (parseInt(maxOrderRes.rows[0]?.max_order, 10) || 0) + 1;

    const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    const authorId = isValidUUID(req.user?.id) ? req.user.id : null;
    const authorFullName = req.user?.full_name || req.user?.username || authorName;

    const insertSql = `
      INSERT INTO news (
        title, subtitle, summary, content, category, district, main_image,
        seo_keywords, tags, is_breaking, is_lead_hero, is_top_story,
        display_order, author_id, author_name, status, views_count, likes_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 0, 0)
      RETURNING *;
    `;

    const result = await query(insertSql, [
      title.trim(),
      subtitle.trim(),
      cleanSummary.trim(),
      content.trim() || cleanSummary.trim(),
      category,
      district,
      cleanImage,
      seoKeywords,
      cleanTags,
      Boolean(isBreaking),
      Boolean(isLeadHero),
      Boolean(isTopStory),
      nextOrder,
      authorId,
      authorFullName,
      status
    ]);

    const created = formatNewsRow(result.rows[0]);

    // If marked as lead hero, reset others
    if (isLeadHero) {
      await query(`UPDATE news SET is_lead_hero = FALSE WHERE id != $1;`, [created.id]);
      await query(`UPDATE home_builder_settings SET lead_hero_id = $1 WHERE id = 1;`, [created.id]);
    }

    res.status(201).json({
      success: true,
      message: 'செய்தி வெற்றிகரமாக உருவாக்கப்பட்டது',
      data: created,
      news: created
    });
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/news/:id - Update news article
router.put('/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      summary,
      desc,
      content,
      category,
      district,
      mainImage,
      image,
      seoKeywords,
      tags,
      isBreaking,
      isLeadHero,
      isTopStory,
      displayOrder,
      authorName,
      status
    } = req.body;

    const existingRes = await query(`SELECT * FROM news WHERE id = $1;`, [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    const current = existingRes.rows[0];

    const updatedTitle = title !== undefined ? title.trim() : current.title;
    const updatedSubtitle = subtitle !== undefined ? subtitle.trim() : current.subtitle;
    const updatedSummary = summary !== undefined ? summary.trim() : (desc !== undefined ? desc.trim() : current.summary);
    const updatedContent = content !== undefined ? content.trim() : current.content;
    const updatedCategory = category !== undefined ? category : current.category;
    const updatedDistrict = district !== undefined ? district : current.district;
    const updatedImage = (mainImage || image) ? ensureHttpsUrl(mainImage || image) : current.main_image;
    const updatedSeoKeywords = seoKeywords !== undefined ? seoKeywords : current.seo_keywords;
    const updatedTags = tags !== undefined ? (Array.isArray(tags) ? tags.join(', ') : tags) : current.tags;
    const updatedBreaking = isBreaking !== undefined ? Boolean(isBreaking) : current.is_breaking;
    const updatedLeadHero = isLeadHero !== undefined ? Boolean(isLeadHero) : current.is_lead_hero;
    const updatedTopStory = isTopStory !== undefined ? Boolean(isTopStory) : current.is_top_story;
    const updatedOrder = displayOrder !== undefined ? parseInt(displayOrder, 10) : current.display_order;
    const updatedAuthor = authorName !== undefined ? authorName : current.author_name;
    const updatedStatus = status !== undefined ? status : current.status;

    const updateSql = `
      UPDATE news
      SET title = $1, subtitle = $2, summary = $3, content = $4, category = $5,
          district = $6, main_image = $7, seo_keywords = $8, tags = $9,
          is_breaking = $10, is_lead_hero = $11, is_top_story = $12,
          display_order = $13, author_name = $14, status = $15
      WHERE id = $16
      RETURNING *;
    `;

    const result = await query(updateSql, [
      updatedTitle,
      updatedSubtitle,
      updatedSummary,
      updatedContent,
      updatedCategory,
      updatedDistrict,
      updatedImage,
      updatedSeoKeywords,
      updatedTags,
      updatedBreaking,
      updatedLeadHero,
      updatedTopStory,
      updatedOrder,
      updatedAuthor,
      updatedStatus,
      id
    ]);

    const updated = formatNewsRow(result.rows[0]);

    if (updatedLeadHero) {
      await query(`UPDATE news SET is_lead_hero = FALSE WHERE id != $1;`, [id]);
      await query(`UPDATE home_builder_settings SET lead_hero_id = $1 WHERE id = 1;`, [id]);
    }

    res.json({
      success: true,
      message: 'செய்தி வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது',
      data: updated,
      news: updated
    });
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/news/:id/status - Update article status (e.g. published, pending, rejected)
router.patch('/:id/status', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'நிலை (status) குறிப்பிடப்பட வேண்டும்' });
    }

    const result = await query(`
      UPDATE news
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    const updated = formatNewsRow(result.rows[0]);
    res.json({
      success: true,
      message: `செய்தி நிலை '${status}' என மாற்றப்பட்டது`,
      data: updated,
      news: updated
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/news/:id - Delete article
router.delete('/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM news WHERE id = $1 RETURNING id;`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'செய்தி கிடைக்கவில்லை' });
    }

    res.json({
      success: true,
      message: 'செய்தி வெற்றிகரமாக நீக்கப்பட்டது',
      deletedId: id
    });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
