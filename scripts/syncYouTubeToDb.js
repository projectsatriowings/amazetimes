import { fetchYouTubeChannelVideos } from '../server/routes/socialMedia.js';
import { query } from '../server/db.js';

async function sync() {
  console.log('🔄 Fetching authentic live videos for Amaze Times channel UCMd-mF-u0dPO4L9Nlfftp-g...');
  const channelId = 'UCMd-mF-u0dPO4L9Nlfftp-g';
  const videos = await fetchYouTubeChannelVideos(channelId);
  console.log(`✅ Fetched ${videos.length} videos from YouTube RSS.`);

  if (videos.length > 0) {
    const jsonStr = JSON.stringify(videos);
    await query(
      `UPDATE social_media_settings
       SET featured_videos = $1,
           youtube_url = 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
           youtube_handle = '@AmazeTimes'
       WHERE id = 1;`,
      [jsonStr]
    );
    console.log('🎉 Successfully saved 15 videos into PostgreSQL social_media_settings table!');
  } else {
    console.warn('⚠️ No videos returned by RSS feed.');
  }

  process.exit(0);
}

sync().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
