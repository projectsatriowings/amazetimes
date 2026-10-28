import express from 'express';
import { query } from '../db.js';
import { authenticate, requireReporterOrAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Robust 11-char YouTube ID extraction supporting:
 * standard (watch?v=), short (youtu.be/), embed (embed/), live (live/), shorts (shorts/)
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|.+[?&]v=))([\w-]{11})/i);
  return match ? match[1] : '';
}

/**
 * Format relative timestamps into fluent Tamil
 */
export function formatTamilRelativeTime(dateInput) {
  if (!dateInput) return 'சமீபத்தில்';
  const diffMs = Date.now() - new Date(dateInput).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'இப்போது';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} நிமிடங்களுக்கு முன்`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} மணி நேரத்திற்கு முன்`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} நாட்களுக்கு முன்`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} மாதங்களுக்கு முன்`;
}

/**
 * Automatically resolves handles like @AmazeTimes or channel URLs
 * to official 24-character YouTube Channel IDs (UC...)
 * @param {string} channelUrlOrHandle
 * @returns {Promise<string>}
 */
export async function resolveYouTubeChannelId(channelUrlOrHandle) {
  if (!channelUrlOrHandle || typeof channelUrlOrHandle !== 'string') return '';
  const raw = channelUrlOrHandle.trim();

  // If already a 24-char Channel ID starting with UC
  if (/^UC[\w-]{22}$/.test(raw)) {
    return raw;
  }

  // Check if channel URL contains /channel/UC...
  const directMatch = raw.match(/\/channel\/(UC[\w-]{22})/);
  if (directMatch) {
    return directMatch[1];
  }

  // Handle format: extract clean handle without @ or URL prefix
  let handle = raw;
  if (handle.includes('youtube.com/')) {
    handle = handle.split('youtube.com/')[1].replace(/^@/, '').split('/')[0].split('?')[0];
  } else {
    handle = handle.replace(/^@/, '');
  }

  if (!handle) return '';

  try {
    const targetUrl = `https://www.youtube.com/@${handle}`;
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (res.ok) {
      const html = await res.text();
      // Look for channelId pattern in HTML source
      const match =
        html.match(/itemprop="channelId"\s+content="(UC[\w-]{22})"/i) ||
        html.match(/"channelId":\s*"(UC[\w-]{22})"/i) ||
        html.match(/\/channel\/(UC[\w-]{22})/i);

      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (err) {
    console.warn('[YouTube Sync] Channel ID resolution notice:', err.message);
  }

  // Fallback to configured default channel ID from environment if available
  return process.env.YOUTUBE_CHANNEL_ID || 'UCMd-mF-u0dPO4L9Nlfftp-g';
}

/**
 * Fetches real-time video feeds via YouTube RSS Feed
 * with fallback to YouTube Data API v3 if YOUTUBE_API_KEY is present
 * @param {string} channelId
 * @returns {Promise<Array>}
 */
export async function fetchYouTubeChannelVideos(channelId) {
  if (!channelId) return [];

  // Strategy A: If YOUTUBE_API_KEY is present, query Data API v3
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=15&order=date&type=video&key=${process.env.YOUTUBE_API_KEY}`;
      const apiRes = await fetch(apiUrl);
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.items && Array.isArray(json.items)) {
          return json.items.map((it) => {
            const videoId = it.id?.videoId || '';
            const pub = it.snippet?.publishedAt || '';
            return {
              id: videoId,
              videoId,
              title: it.snippet?.title || '',
              description: it.snippet?.description || '',
              publishedAt: pub,
              timeAgo: formatTamilRelativeTime(pub),
              thumbnailUrl: it.snippet?.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              url: `https://www.youtube.com/watch?v=${videoId}`
            };
          });
        }
      }
    } catch (apiErr) {
      console.warn('[YouTube API v3 Error, falling back to RSS]:', apiErr.message);
    }
  }

  // Strategy B: Real-time RSS Feed
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AmazeTimesBot/2.0; +https://amazetimes.in)'
      }
    });

    if (!res.ok) {
      throw new Error(`YouTube RSS returned status ${res.status}`);
    }

    const xml = await res.text();
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const videos = [];
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);

      const videoId = videoIdMatch ? videoIdMatch[1].trim() : '';
      if (!videoId) continue;

      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';
      const publishedAt = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();
      const desc = descMatch ? descMatch[1].trim() : '';

      videos.push({
        id: videoId,
        videoId,
        title,
        description: desc,
        publishedAt,
        timeAgo: formatTamilRelativeTime(publishedAt),
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`
      });
    }

    return videos;
  } catch (err) {
    console.warn('[YouTube RSS Feed Warning]:', err.message);
    return [];
  }
}

// In-memory videos cache for sub-5ms responses (refreshed every 30 minutes)
let cachedVideos = [];
let lastSyncTime = 0;
const SYNC_TTL = 30 * 60 * 1000;

// GET /api/social-media/youtube/sync - Auto-crawl latest channel videos and cache in DB
router.get('/youtube/sync', async (req, res) => {
  try {
    const settingsRes = await query(`SELECT youtube_url, youtube_handle FROM social_media_settings WHERE id = 1;`);
    const settings = settingsRes.rows[0] || {};
    const channelId = await resolveYouTubeChannelId(settings.youtube_handle || settings.youtube_url || '@AmazeTimes');

    if (!channelId) {
      return res.status(400).json({ success: false, message: 'YouTube சேனல் அடையாளம் காண முடியவில்லை' });
    }

    const videos = await fetchYouTubeChannelVideos(channelId);

    if (videos.length > 0) {
      cachedVideos = videos;
      lastSyncTime = Date.now();

      await query(`
        UPDATE social_media_settings
        SET featured_videos = $1::jsonb
        WHERE id = 1;
      `, [JSON.stringify(videos)]);
    }

    res.json({
      success: true,
      channelId,
      count: videos.length,
      videos: videos.length > 0 ? videos : cachedVideos
    });
  } catch (err) {
    console.error('YouTube sync error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/social-media/videos - Returns latest active videos (auto-syncs if cache empty)
router.get('/videos', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedVideos.length > 0 && (now - lastSyncTime < SYNC_TTL)) {
      return res.json({ success: true, videos: cachedVideos, count: cachedVideos.length, source: 'cache' });
    }

    // Try DB first
    const dbRes = await query(`SELECT featured_videos, youtube_handle, youtube_url FROM social_media_settings WHERE id = 1;`);
    const row = dbRes.rows[0];
    let videos = Array.isArray(row?.featured_videos) ? row.featured_videos : [];

    if (videos.length === 0 || (now - lastSyncTime >= SYNC_TTL)) {
      const channelId = await resolveYouTubeChannelId(row?.youtube_handle || row?.youtube_url || '@AmazeTimes');
      if (channelId) {
        const fresh = await fetchYouTubeChannelVideos(channelId);
        if (fresh.length > 0) {
          videos = fresh;
          cachedVideos = fresh;
          lastSyncTime = now;
          await query(`UPDATE social_media_settings SET featured_videos = $1::jsonb WHERE id = 1;`, [JSON.stringify(fresh)]).catch(() => {});
        }
      }
    } else {
      cachedVideos = videos;
    }

    // Enrich video entries with timeAgo and high quality thumbnails
    const sanitized = videos.map(v => {
      const vid = v.videoId || extractYouTubeId(v.url || '');
      return {
        id: vid || v.id,
        videoId: vid,
        title: v.title || 'அமேஸ் டைம்ஸ் சிறப்பு வீடியோ',
        publishedAt: v.publishedAt || v.published_at || new Date().toISOString(),
        timeAgo: v.timeAgo || formatTamilRelativeTime(v.publishedAt || v.published_at),
        thumbnailUrl: v.thumbnailUrl || (vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : ''),
        url: v.url || `https://www.youtube.com/watch?v=${vid}`
      };
    });

    res.json({
      success: true,
      videos: sanitized,
      count: sanitized.length
    });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ success: false, message: err.message, videos: [] });
  }
});

// POST /api/social-media/youtube/curate - Allows admin to feature manual YouTube URLs or Shorts
router.post('/youtube/curate', authenticate, requireReporterOrAdmin, async (req, res) => {
  try {
    const { url, title, duration = '05:00', category = 'செய்தி' } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'வீடியோ URL தேவை' });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'சரியான YouTube URL அல்ல' });
    }

    const newVideo = {
      id: videoId,
      videoId,
      title: title || 'அமேஸ் டைம்ஸ் சிறப்பு வீடியோ',
      category,
      duration,
      publishedAt: new Date().toISOString(),
      timeAgo: 'இப்போது',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      isCurated: true
    };

    const currentRes = await query(`SELECT featured_videos FROM social_media_settings WHERE id = 1;`);
    let currentVideos = Array.isArray(currentRes.rows[0]?.featured_videos) ? currentRes.rows[0].featured_videos : [];

    // Filter out duplicate and prepend to top
    currentVideos = [newVideo, ...currentVideos.filter(v => (v.videoId || v.id) !== videoId)].slice(0, 30);
    cachedVideos = currentVideos;
    lastSyncTime = Date.now();

    await query(`
      UPDATE social_media_settings
      SET featured_videos = $1::jsonb
      WHERE id = 1;
    `, [JSON.stringify(currentVideos)]);

    res.json({
      success: true,
      message: 'வீடியோ வெற்றிகரமாக சிறப்புப் பட்டியலில் சேர்க்கப்பட்டது!',
      video: newVideo,
      videos: currentVideos
    });
  } catch (err) {
    console.error('Error curating video:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

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
        youtubeUrl: data.youtube_url || 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
        youtubeHandle: data.youtube_handle || '@AmazeTimes',
        youtubeSubscribers: data.youtube_subscribers || '250K',
        instagramUrl: data.instagram_url || 'https://www.instagram.com/amazetimes/?hl=en',
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

    cachedVideos = processedVideos || [];
    lastSyncTime = Date.now();

    res.json({
      success: true,
      message: 'சமூக ஊடக அமைப்புகள் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டன!'
    });
  } catch (err) {
    console.error('Error updating social media settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

router.put('/', authenticate, requireReporterOrAdmin, updateSocialMediaSettings);
router.post('/', authenticate, requireReporterOrAdmin, updateSocialMediaSettings);

export default router;
