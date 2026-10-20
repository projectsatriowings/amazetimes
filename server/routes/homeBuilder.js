import express from 'express';
import { query, ensureHttpsUrl } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const formatNewsCard = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    _id: String(r.id),
    title: r.title,
    subtitle: r.subtitle || '',
    summary: r.summary || (r.content ? r.content.substring(0, 160) + '...' : ''),
    desc: r.summary || (r.content ? r.content.substring(0, 160) + '...' : ''),
    category: r.category || 'தமிழ்நாடு',
    cat: r.category || 'தமிழ்நாடு',
    district: r.district || 'all',
    mainImage: ensureHttpsUrl(r.main_image || '/Amaze times.jpg'),
    image: ensureHttpsUrl(r.main_image || '/Amaze times.jpg'),
    img: ensureHttpsUrl(r.main_image || '/Amaze times.jpg'),
    authorName: r.author_name || 'செய்தி ஆசிரியர்',
    viewsCount: parseInt(r.views_count || 0, 10),
    likesCount: parseInt(r.likes_count || 0, 10),
    isBreaking: Boolean(r.is_breaking),
    isLeadHero: Boolean(r.is_lead_hero),
    isTopStory: Boolean(r.is_top_story),
    displayOrder: r.display_order || 0,
    time: r.published_at || r.created_at
  };
};

// GET /api/home-builder - Get layout settings and resolved news sections
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const configRes = await query(`SELECT * FROM home_builder_settings WHERE id = 1;`);
    let config = configRes.rows[0];

    if (!config) {
      await query(`
        INSERT INTO home_builder_settings (id, section_order, highlight_category)
        VALUES (1, '["hero", "ticker", "cinema_sports", "general", "features", "magazines", "videos"]', 'cinema')
        ON CONFLICT (id) DO NOTHING;
      `);
      const retryRes = await query(`SELECT * FROM home_builder_settings WHERE id = 1;`);
      config = retryRes.rows[0];
    }

    const leadHeroId = config.lead_hero_id;
    const breakingIds = Array.isArray(config.breaking_ids) ? config.breaking_ids : [];
    const topStoriesIds = Array.isArray(config.top_stories_ids) ? config.top_stories_ids : [];

    // Resolve Lead Hero
    let leadHero = null;
    if (leadHeroId) {
      const heroRes = await query(`SELECT * FROM news WHERE id = $1;`, [leadHeroId]);
      if (heroRes.rows.length > 0) {
        leadHero = formatNewsCard(heroRes.rows[0]);
      }
    }
    if (!leadHero) {
      const fallbackHeroRes = await query(`
        SELECT * FROM news 
        WHERE status = 'published' 
        ORDER BY is_lead_hero DESC, display_order DESC, created_at DESC 
        LIMIT 1;
      `);
      if (fallbackHeroRes.rows.length > 0) {
        leadHero = formatNewsCard(fallbackHeroRes.rows[0]);
      }
    }

    // Resolve Breaking News
    let breakingNews = [];
    if (breakingIds.length > 0) {
      const breakingRes = await query(`
        SELECT * FROM news 
        WHERE id = ANY($1::int[]) AND status = 'published'
        ORDER BY display_order DESC, created_at DESC;
      `, [breakingIds]);
      breakingNews = breakingRes.rows.map(formatNewsCard);
    }
    if (breakingNews.length === 0) {
      const fallbackBreakingRes = await query(`
        SELECT * FROM news 
        WHERE is_breaking = TRUE AND status = 'published'
        ORDER BY display_order DESC, created_at DESC 
        LIMIT 8;
      `);
      breakingNews = fallbackBreakingRes.rows.map(formatNewsCard);
    }

    // Resolve Top Stories
    let topStories = [];
    if (topStoriesIds.length > 0) {
      const topRes = await query(`
        SELECT * FROM news 
        WHERE id = ANY($1::int[]) AND status = 'published'
        ORDER BY display_order DESC, created_at DESC;
      `, [topStoriesIds]);
      topStories = topRes.rows.map(formatNewsCard);
    }
    if (topStories.length === 0) {
      const fallbackTopRes = await query(`
        SELECT * FROM news 
        WHERE status = 'published' AND id != COALESCE($1, -1)
        ORDER BY is_top_story DESC, display_order DESC, created_at DESC 
        LIMIT 6;
      `, [leadHero?.id || null]);
      topStories = fallbackTopRes.rows.map(formatNewsCard);
    }

    res.json({
      success: true,
      data: {
        leadHeroId: leadHero?.id || null,
        leadHero,
        breakingIds,
        breakingNews,
        topStoriesIds,
        topStories,
        sectionOrder: config.section_order || ["hero", "ticker", "cinema_sports", "general", "features", "magazines", "videos"],
        highlightCategory: config.highlight_category || 'cinema',
        settings: config.settings || {}
      }
    });
  } catch (err) {
    console.error('Error fetching home builder settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/home-builder - Update layout configuration and synchronize news flags
router.put('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      lead_hero_id,
      leadHeroId,
      breaking_ids,
      breakingIds,
      top_stories_ids,
      topStoriesIds,
      section_order,
      sectionOrder,
      highlight_category,
      highlightCategory,
      settings
    } = req.body;

    const heroId = lead_hero_id !== undefined ? lead_hero_id : leadHeroId;
    const bIds = breaking_ids !== undefined ? breaking_ids : (breakingIds || []);
    const tsIds = top_stories_ids !== undefined ? top_stories_ids : (topStoriesIds || []);
    const secOrder = section_order !== undefined ? section_order : (sectionOrder || ["hero", "ticker", "cinema_sports", "general", "features", "magazines", "videos"]);
    const hlCat = highlight_category !== undefined ? highlight_category : (highlightCategory || 'cinema');
    const extraSettings = settings || {};

    // 1. Update home_builder_settings
    await query(`
      UPDATE home_builder_settings
      SET lead_hero_id = $1,
          breaking_ids = $2::jsonb,
          top_stories_ids = $3::jsonb,
          section_order = $4::jsonb,
          highlight_category = $5,
          settings = $6::jsonb
      WHERE id = 1;
    `, [
      heroId || null,
      JSON.stringify(bIds),
      JSON.stringify(tsIds),
      JSON.stringify(secOrder),
      hlCat,
      JSON.stringify(extraSettings)
    ]);

    // 2. Synchronize news flags
    if (heroId) {
      await query(`UPDATE news SET is_lead_hero = FALSE WHERE is_lead_hero = TRUE;`);
      await query(`UPDATE news SET is_lead_hero = TRUE WHERE id = $1;`, [heroId]);
    }

    if (Array.isArray(bIds) && bIds.length > 0) {
      await query(`UPDATE news SET is_breaking = FALSE WHERE is_breaking = TRUE;`);
      await query(`UPDATE news SET is_breaking = TRUE WHERE id = ANY($1::int[]);`, [bIds]);
    }

    if (Array.isArray(tsIds) && tsIds.length > 0) {
      await query(`UPDATE news SET is_top_story = FALSE WHERE is_top_story = TRUE;`);
      await query(`UPDATE news SET is_top_story = TRUE WHERE id = ANY($1::int[]);`, [tsIds]);
    }

    res.json({
      success: true,
      message: 'முகப்புப் பக்க வடிவமைப்பு வெற்றிகரமாகப் புதுப்பிக்கப்பட்டு செய்திகளுடன் ஒருங்கிணைக்கப்பட்டது!'
    });
  } catch (err) {
    console.error('Error updating home builder settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
