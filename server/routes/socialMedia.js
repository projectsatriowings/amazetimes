import express from 'express';
import { query } from '../db.js';
import { authenticate, requireReporterOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Robust 11-char YouTube ID extraction supporting:
// standard (watch?v=), short (youtu.be/), embed (embed/), live (live/), shorts (shorts/)
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|.+[?&]v=))([\w-]{11})/i);
  return match ? match[1] : '';
}

// GET /api/social-media - Fetch social channels and featured media
router.get('/', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM social_media_settings WHERE id = 1;`);
    let data = result.rows[0];

    if (!data) {
      await query(`
        INSERT INTO social_media_settings (id)
        VALUES (1)
        ON CONFLICT (id) DO NOTHING;
      `);
      const retryRes = await query(`SELECT * FROM social_media_settings WHERE id = 1;`);
      data = retryRes.rows[0];
    }

    res.json({
      success: true,
      data: {
        id: data.id,
        youtubeUrl: data.youtube_url || 'https://www.youtube.com/@AmazeTimes',
        youtubeHandle: data.youtube_handle || '@AmazeTimes',
        youtubeSubscribers: data.youtube_subscribers || '250K',
        instagramUrl: data.instagram_url || 'https://www.instagram.com/amazetimes',
        instagramHandle: data.instagram_handle || '@amazetimes_official',
        instagramFollowers: data.instagram_followers || '180K',
        facebookUrl: data.facebook_url || 'https://www.facebook.com/amazetimes',
        facebookHandle: data.facebook_handle || 'Amaze Times Official',
        whatsappUrl: data.whatsapp_url || 'https://whatsapp.com/channel/amazetimes',
        xUrl: data.x_url || 'https://twitter.com/AmazeTimes',
        xHandle: data.x_handle || '@AmazeTimes',
        xFollowers: data.x_followers || '95K',
        telegramUrl: data.telegram_url || 'https://t.me/AmazeTimes',
        telegramHandle: data.telegram_handle || 'Amaze Times Tamil',
        telegramSubscribers: data.telegram_subscribers || '60K',
        whatsappAnnouncements: Array.isArray(data.whatsapp_announcements) ? data.whatsapp_announcements : [],
        featuredVideos: Array.isArray(data.featured_videos) ? data.featured_videos : [],
        featuredReels: Array.isArray(data.featured_reels) ? data.featured_reels : []
      }
    });
  } catch (err) {
    console.error('Error fetching social media settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update handler function for PUT & POST
const updateSocialMediaSettings = async (req, res) => {
  try {
    const {
      youtubeUrl,
      youtube_url,
      youtubeHandle,
      youtube_handle,
      youtubeSubscribers,
      youtube_subscribers,
      instagramUrl,
      instagram_url,
      instagramHandle,
      instagram_handle,
      instagramFollowers,
      instagram_followers,
      facebookUrl,
      facebook_url,
      facebookHandle,
      facebook_handle,
      whatsappUrl,
      whatsapp_url,
      xUrl,
      x_url,
      xHandle,
      x_handle,
      xFollowers,
      x_followers,
      telegramUrl,
      telegram_url,
      telegramHandle,
      telegram_handle,
      telegramSubscribers,
      telegram_subscribers,
      whatsappAnnouncements,
      whatsapp_announcements,
      featuredVideos,
      featured_videos,
      featuredReels,
      featured_reels
    } = req.body;

    const existing = await query(`SELECT * FROM social_media_settings WHERE id = 1;`);
    const curr = existing.rows[0] || {};

    const ytUrl = (youtubeUrl !== undefined ? youtubeUrl : youtube_url) ?? curr.youtube_url;
    const ytHandle = (youtubeHandle !== undefined ? youtubeHandle : youtube_handle) ?? curr.youtube_handle;
    const ytSubs = (youtubeSubscribers !== undefined ? youtubeSubscribers : youtube_subscribers) ?? curr.youtube_subscribers;

    const igUrl = (instagramUrl !== undefined ? instagramUrl : instagram_url) ?? curr.instagram_url;
    const igHandle = (instagramHandle !== undefined ? instagramHandle : instagram_handle) ?? curr.instagram_handle;
    const igFollowers = (instagramFollowers !== undefined ? instagramFollowers : instagram_followers) ?? curr.instagram_followers;

    const fbUrl = (facebookUrl !== undefined ? facebookUrl : facebook_url) ?? curr.facebook_url;
    const fbHandle = (facebookHandle !== undefined ? facebookHandle : facebook_handle) ?? curr.facebook_handle;
    const waUrl = (whatsappUrl !== undefined ? whatsappUrl : whatsapp_url) ?? curr.whatsapp_url;

    const twUrl = (xUrl !== undefined ? xUrl : x_url) ?? curr.x_url;
    const twHandle = (xHandle !== undefined ? xHandle : x_handle) ?? curr.x_handle;
    const twFollowers = (xFollowers !== undefined ? xFollowers : x_followers) ?? curr.x_followers;

    const tgUrl = (telegramUrl !== undefined ? telegramUrl : telegram_url) ?? curr.telegram_url;
    const tgHandle = (telegramHandle !== undefined ? telegramHandle : telegram_handle) ?? curr.telegram_handle;
    const tgSubs = (telegramSubscribers !== undefined ? telegramSubscribers : telegram_subscribers) ?? curr.telegram_subscribers;

    // Process videos: automatically extract 11-char YouTube ID if url provided
    let processedVideos = (featuredVideos !== undefined ? featuredVideos : featured_videos) ?? curr.featured_videos;
    if (Array.isArray(processedVideos)) {
      processedVideos = processedVideos.map(v => {
        const videoId = v.videoId || extractYouTubeId(v.url || '');
        return {
          ...v,
          videoId: videoId || v.videoId || '',
          thumbnailUrl: v.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '')
        };
      });
    }

    const processedReels = (featuredReels !== undefined ? featuredReels : featured_reels) ?? curr.featured_reels;
    const processedAnnouncements = (whatsappAnnouncements !== undefined ? whatsappAnnouncements : whatsapp_announcements) ?? curr.whatsapp_announcements;

    await query(`
      UPDATE social_media_settings
      SET youtube_url = $1,
          youtube_handle = $2,
          youtube_subscribers = $3,
          instagram_url = $4,
          instagram_handle = $5,
          instagram_followers = $6,
          facebook_url = $7,
          facebook_handle = $8,
          whatsapp_url = $9,
          x_url = $10,
          x_handle = $11,
          x_followers = $12,
          telegram_url = $13,
          telegram_handle = $14,
          telegram_subscribers = $15,
          whatsapp_announcements = $16::jsonb,
          featured_videos = $17::jsonb,
          featured_reels = $18::jsonb
      WHERE id = 1;
    `, [
      ytUrl,
      ytHandle,
      ytSubs,
      igUrl,
      igHandle,
      igFollowers,
      fbUrl,
      fbHandle,
      waUrl,
      twUrl,
      twHandle,
      twFollowers,
      tgUrl,
      tgHandle,
      tgSubs,
      JSON.stringify(processedAnnouncements || []),
      JSON.stringify(processedVideos || []),
      JSON.stringify(processedReels || [])
    ]);

    res.json({
      success: true,
      message: 'சமூக ஊடக அமைப்புகள் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டன!'
    });
  } catch (err) {
    console.error('Error updating social media settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Both PUT and POST endpoints supported
router.put('/', authenticate, requireReporterOrAdmin, updateSocialMediaSettings);
router.post('/', authenticate, requireReporterOrAdmin, updateSocialMediaSettings);

export default router;
