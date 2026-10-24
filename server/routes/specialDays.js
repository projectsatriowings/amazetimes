import express from 'express';
import { query, ensureHttpsUrl } from '../db.js';
import { authenticate, requireReporterOrAdmin } from '../middleware/auth.js';

const router = express.Router();

const formatSpecialDay = (r) => ({
  id: r.id,
  title: r.title,
  subtitle: r.subtitle || '',
  dateDisplay: r.date_display,
  date_display: r.date_display,
  eventDate: r.event_date,
  event_date: r.event_date,
  bannerImage: ensureHttpsUrl(r.banner_image),
  banner_image: ensureHttpsUrl(r.banner_image),
  greetingMessage: r.greeting_message,
  greeting_message: r.greeting_message,
  category: r.category || 'festival',
  isActive: Boolean(r.is_active),
  is_active: Boolean(r.is_active),
  isFeatured: Boolean(r.is_featured),
  is_featured: Boolean(r.is_featured),
  wishesCount: parseInt(r.wishes_count || 0, 10),
  wishes_count: parseInt(r.wishes_count || 0, 10)
});

// GET /api/special-days - Public active list
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM special_days 
      WHERE is_active = TRUE 
      ORDER BY is_featured DESC, id DESC;
    `);
    const formatted = result.rows.map(formatSpecialDay);
    res.json({ success: true, specialDays: formatted, data: formatted });
  } catch (err) {
    console.error('Error fetching special days:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/special-days/all - Admin list
router.get('/all', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM special_days ORDER BY id DESC;`);
    const formatted = result.rows.map(formatSpecialDay);
    res.json({ success: true, specialDays: formatted, data: formatted });
  } catch (err) {
    console.error('Error fetching all special days:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/special-days/:id/wish - Atomic reader celebration wish counter
router.post('/:id/wish', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      UPDATE special_days
      SET wishes_count = COALESCE(wishes_count, 0) + 1
      WHERE id = $1
      RETURNING wishes_count;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'சிறப்பு தினம் கிடைக்கவில்லை' });
    }

    res.json({
      success: true,
      message: 'உங்கள் வாழ்த்துகள் பதிவு செய்யப்பட்டது!',
      wishesCount: result.rows[0].wishes_count,
      wishes_count: result.rows[0].wishes_count
    });
  } catch (err) {
    console.error('Error recording wish:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/special-days - Create special day
router.post('/', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const {
      title,
      subtitle = '',
      dateDisplay = '',
      date_display = '',
      eventDate = null,
      event_date = null,
      bannerImage = '',
      banner_image = '',
      greetingMessage = '',
      greeting_message = '',
      category = 'festival',
      isActive = true,
      is_active = true,
      isFeatured = false,
      is_featured = false
    } = req.body;

    const cleanTitle = (title || '').trim();
    if (!cleanTitle) {
      return res.status(400).json({ success: false, message: 'தலைப்பு கட்டாயமானது' });
    }

    const cleanBanner = ensureHttpsUrl(bannerImage || banner_image || 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80');
    const cleanDate = dateDisplay || date_display || 'இன்று';
    const cleanGreeting = greetingMessage || greeting_message || 'இனிய வாழ்த்துகள்!';

    const result = await query(`
      INSERT INTO special_days (
        title, subtitle, date_display, event_date, banner_image,
        greeting_message, category, is_active, is_featured, wishes_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 100)
      RETURNING *;
    `, [
      cleanTitle,
      subtitle,
      cleanDate,
      eventDate || event_date || null,
      cleanBanner,
      cleanGreeting,
      category,
      isActive !== undefined ? Boolean(isActive) : Boolean(is_active),
      isFeatured !== undefined ? Boolean(isFeatured) : Boolean(is_featured)
    ]);

    res.status(201).json({
      success: true,
      message: 'சிறப்பு தின பதாகை வெற்றிகரமாக உருவாக்கப்பட்டது',
      data: formatSpecialDay(result.rows[0])
    });
  } catch (err) {
    console.error('Error creating special day:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/special-days/:id - Update special day
router.put('/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      dateDisplay,
      date_display,
      eventDate,
      event_date,
      bannerImage,
      banner_image,
      greetingMessage,
      greeting_message,
      category,
      isActive,
      is_active,
      isFeatured,
      is_featured
    } = req.body;

    const existing = await query(`SELECT * FROM special_days WHERE id = $1;`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'சிறப்பு தினம் கிடைக்கவில்லை' });
    }
    const curr = existing.rows[0];

    const updatedTitle = title !== undefined ? title : curr.title;
    const updatedSubtitle = subtitle !== undefined ? subtitle : curr.subtitle;
    const updatedDate = (dateDisplay || date_display) !== undefined ? (dateDisplay || date_display) : curr.date_display;
    const updatedEventDate = (eventDate || event_date) !== undefined ? (eventDate || event_date) : curr.event_date;
    const updatedBanner = (bannerImage || banner_image) !== undefined ? ensureHttpsUrl(bannerImage || banner_image) : curr.banner_image;
    const updatedGreeting = (greetingMessage || greeting_message) !== undefined ? (greetingMessage || greeting_message) : curr.greeting_message;
    const updatedCat = category !== undefined ? category : curr.category;
    const updatedActive = (isActive !== undefined ? isActive : is_active) !== undefined ? Boolean(isActive !== undefined ? isActive : is_active) : curr.is_active;
    const updatedFeatured = (isFeatured !== undefined ? isFeatured : is_featured) !== undefined ? Boolean(isFeatured !== undefined ? isFeatured : is_featured) : curr.is_featured;

    const result = await query(`
      UPDATE special_days
      SET title = $1, subtitle = $2, date_display = $3, event_date = $4,
          banner_image = $5, greeting_message = $6, category = $7,
          is_active = $8, is_featured = $9
      WHERE id = $10
      RETURNING *;
    `, [
      updatedTitle,
      updatedSubtitle,
      updatedDate,
      updatedEventDate,
      updatedBanner,
      updatedGreeting,
      updatedCat,
      updatedActive,
      updatedFeatured,
      id
    ]);

    res.json({
      success: true,
      message: 'சிறப்பு தின பதாகை புதுப்பிக்கப்பட்டது',
      data: formatSpecialDay(result.rows[0])
    });
  } catch (err) {
    console.error('Error updating special day:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/special-days/:id
router.delete('/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM special_days WHERE id = $1 RETURNING id;`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'சிறப்பு தினம் கிடைக்கவில்லை' });
    }
    res.json({ success: true, message: 'சிறப்பு தினம் நீக்கப்பட்டது' });
  } catch (err) {
    console.error('Error deleting special day:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- BIRTHDAY OFFICIALS (Government & VIP Birthday Felicitation Hub) ---

// GET /api/special-days/officials - List VIP & government birthday officials
router.get('/officials', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM birthday_officials 
      WHERE is_active = TRUE 
      ORDER BY id ASC;
    `);
    res.json({
      success: true,
      officials: result.rows,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching birthday officials:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/special-days/officials/:id/wish - Atomic wish counter for VIP official
router.post('/officials/:id/wish', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      UPDATE birthday_officials 
      SET wishes_count = COALESCE(wishes_count, 0) + 1 
      WHERE id = $1 
      RETURNING wishes_count;
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'பிரமுகர் விவரம் கிடைக்கவில்லை' });
    }
    res.json({
      success: true,
      message: 'உங்கள் வாழ்த்து பதிவு செய்யப்பட்டது!',
      wishes_count: result.rows[0].wishes_count
    });
  } catch (err) {
    console.error('Error wishing official:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/special-days/officials - Create VIP birthday official
router.post('/officials', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { name, designation, date_display, photo_url, greeting_text } = req.body;
    if (!name || !designation || !date_display || !photo_url) {
      return res.status(400).json({ success: false, message: 'பெயர், பதவி, பிறந்தநாள் மற்றும் புகைப்படம் தேவை' });
    }
    const result = await query(`
      INSERT INTO birthday_officials (name, designation, date_display, photo_url, greeting_text, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING *;
    `, [name, designation, date_display, photo_url, greeting_text || '']);
    res.status(201).json({ success: true, message: 'பிரமுகர் விவரம் சேர்க்கப்பட்டது', data: result.rows[0] });
  } catch (err) {
    console.error('Error creating official:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/special-days/officials/:id
router.delete('/officials/:id', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM birthday_officials WHERE id = $1;`, [id]);
    res.json({ success: true, message: 'பிரமுகர் விவரம் நீக்கப்பட்டது' });
  } catch (err) {
    console.error('Error deleting official:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

