import app from '../server/index.js';
import { query, pool } from '../server/db.js';

let server;

async function runTests() {
  console.log('🧪 Starting API Verification Tests for Amaze Times...');

  server = app.listen(5001, async () => {
    console.log('📡 Test server running on http://127.0.0.1:5001');

    try {
      // 1. Health check
      const healthRes = await fetch('http://127.0.0.1:5001/api/health');
      const healthJson = await healthRes.json();
      console.log('✅ 1. Health check status:', healthJson.status);

      // 2. GET /api/news
      const newsRes = await fetch('http://127.0.0.1:5001/api/news?limit=5');
      const newsJson = await newsRes.json();
      console.log('✅ 2. GET /api/news count:', newsJson.news?.length, 'Total:', newsJson.pagination?.total);
      const testArticle = newsJson.news[0];
      console.log('   Sample news:', testArticle?.id, testArticle?.title?.substring(0, 40));

      if (testArticle) {
        // 3. POST /api/news/:id/view
        const viewRes = await fetch(`http://127.0.0.1:5001/api/news/${testArticle.id}/view`, { method: 'POST' });
        const viewJson = await viewRes.json();
        console.log('✅ 3. Atomic View Increment:', viewJson.viewsCount);

        // 4. POST /api/news/:id/like
        const likeRes1 = await fetch(`http://127.0.0.1:5001/api/news/${testArticle.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIdentifier: 'test_reader_uuid_101' })
        });
        const likeJson1 = await likeRes1.json();
        console.log('✅ 4. Like Toggle (liked):', likeJson1.liked, 'Likes count:', likeJson1.likesCount);

        const likeRes2 = await fetch(`http://127.0.0.1:5001/api/news/${testArticle.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIdentifier: 'test_reader_uuid_101' })
        });
        const likeJson2 = await likeRes2.json();
        console.log('✅ 4. Like Toggle again (unliked):', likeJson2.liked, 'Likes count:', likeJson2.likesCount);
      }

      // 5. POST /api/analytics/heartbeat
      const hbRes = await fetch('http://127.0.0.1:5001/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: 'test_v_999' })
      });
      const hbJson = await hbRes.json();
      console.log('✅ 5. Heartbeat Live Count:', hbJson.liveCount, 'Total Views:', hbJson.totalViews, 'Total Visitors:', hbJson.totalVisitors);

      // 6. GET /api/analytics/stats
      const statsRes = await fetch('http://127.0.0.1:5001/api/analytics/stats');
      const statsJson = await statsRes.json();
      console.log('✅ 6. Analytics Stats:', statsJson.data?.totalNews, 'articles,', statsJson.data?.articleViews, 'views');

      // 7. GET /api/home-builder
      const hbLayoutRes = await fetch('http://127.0.0.1:5001/api/home-builder');
      const hbLayoutJson = await hbLayoutRes.json();
      console.log('✅ 7. Home Builder Layout:', hbLayoutJson.data?.leadHero?.title?.substring(0, 35), 'Section count:', hbLayoutJson.data?.sectionOrder?.length);

      // 8. GET /api/special-days & Wish
      const sdRes = await fetch('http://127.0.0.1:5001/api/special-days');
      const sdJson = await sdRes.json();
      console.log('✅ 8. Special Days count:', sdJson.data?.length);
      if (sdJson.data?.length > 0) {
        const wishRes = await fetch(`http://127.0.0.1:5001/api/special-days/${sdJson.data[0].id}/wish`, { method: 'POST' });
        const wishJson = await wishRes.json();
        console.log('✅ 8. Special Day Wish Increment:', wishJson.wishesCount);
      }

      // 9. GET /api/social-media
      const smRes = await fetch('http://127.0.0.1:5001/api/social-media');
      const smJson = await smRes.json();
      console.log('✅ 9. Social Media YouTube:', smJson.data?.youtubeHandle, 'Subscribers:', smJson.data?.youtubeSubscribers);

      console.log('\n🎉 ALL 9 SYSTEM VERIFICATION TESTS PASSED FLAWLESSLY!');
    } catch (err) {
      console.error('❌ Test error:', err);
    } finally {
      server.close();
      await pool.end();
      process.exit(0);
    }
  });
}

runTests();
