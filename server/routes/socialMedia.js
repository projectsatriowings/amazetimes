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
        featuredVideos: Array.isArray(data.featured_videos) ? data.featured_videos : [],
        featuredReels: Array.isArray(data.featured_reels) ? data.featured_reels : []
      }
    });
  } catch (err) {
    console.error('Error fetching social media settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/social-media - Update social media settings
router.put('/', authenticate, requireReporterOrAdmin, async (req, res) => {
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
          featured_videos = $10::jsonb,
          featured_reels = $11::jsonb
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
});

export default router;
