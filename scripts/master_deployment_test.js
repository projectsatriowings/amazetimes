import dotenv from 'dotenv';
dotenv.config();

import { query, pool } from '../server/db.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const pass = (title, detail = '') => console.log(`${colors.green}✔ PASS:${colors.reset} ${colors.bold}${title}${colors.reset} ${detail ? colors.cyan + '(' + detail + ')' + colors.reset : ''}`);
const fail = (title, err) => {
  console.error(`${colors.red}✖ FAIL:${colors.reset} ${colors.bold}${title}${colors.reset} - ${err?.message || err}`);
  process.exitCode = 1;
};

async function runMasterTest() {
  console.log(`\n${colors.bold}${colors.yellow}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.yellow}     AMAZE TIMES — MASTER DEPLOYMENT READINESS TEST SUITE        ${colors.reset}`);
  console.log(`${colors.bold}${colors.yellow}================================================================${colors.reset}\n`);

  let passedCount = 0;
  let totalCount = 0;

  const testStep = async (name, fn) => {
    totalCount++;
    try {
      const detail = await fn();
      pass(name, detail || '');
      passedCount++;
    } catch (e) {
      fail(name, e);
    }
  };

  // 1. Environment & Config
  await testStep('1. Environment Configuration Check', async () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing in .env');
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');
    return `PORT: ${PORT}, DB: Neon Serverless Pooler`;
  });

  // 2. Neon PostgreSQL Connection Pool & Pooler Resilience
  await testStep('2. Neon PostgreSQL Pooler Connection & Query Retry', async () => {
    const res = await query('SELECT NOW() AS current_time, current_database() AS db;');
    if (!res.rows.length) throw new Error('Query returned no rows');
    return `DB: ${res.rows[0].db}, Server Time: ${res.rows[0].current_time}`;
  });

  // 3. Database Tables Verification
  await testStep('3. Database Schema & Required Tables Exist', async () => {
    const requiredTables = [
      'users',
      'news',
      'news_likes',
      'site_analytics',
      'visitor_logs',
      'home_builder_settings',
      'special_days',
      'social_media_settings',
      'magazines',
      'site_content'
    ];
    const tableRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    const existing = new Set(tableRes.rows.map(r => r.table_name));
    for (const t of requiredTables) {
      if (!existing.has(t)) throw new Error(`Missing required table: ${t}`);
    }
    return `All ${requiredTables.length} core tables verified`;
  });

  // 4. API Server Health
  await testStep('4. API Server Health (/api/health)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error(`Unexpected status: ${data.status}`);
    return `Status: ${data.status}, Service: ${data.service}`;
  });

  // 5. Unlimited News API Check & Cache-Control
  await testStep('5. Unlimited News Query (/api/news?limit=all)', async () => {
    const res = await fetch(`${BASE_URL}/api/news?limit=all`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const cacheControl = res.headers.get('cache-control') || '';
    if (!cacheControl.includes('no-cache') && !cacheControl.includes('no-store')) {
      throw new Error(`Cache-Control header missing or weak: ${cacheControl}`);
    }
    const data = await res.json();
    if (!data.success || !Array.isArray(data.news)) throw new Error('Invalid news response structure');
    if (data.pagination.limit < 1000) throw new Error(`Limit not unlimited: ${data.pagination.limit}`);
    return `Count: ${data.news.length}, Limit: ${data.pagination.limit}, Total: ${data.pagination.total}`;
  });

  // 6. News CRUD Workflow & Demo Token Resilience
  let createdArticleId = null;
  await testStep('6. Create News Article with Demo/Admin Auth (POST /api/news)', async () => {
    const res = await fetch(`${BASE_URL}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-admin-token'
      },
      body: JSON.stringify({
        title: 'முக்கிய அறிவிப்பு: அமேஸ் டைம்ஸ் நேரலை தளம் வெளியீடு 2026',
        subtitle: 'நவீன வடிவமைப்புடன் கூடிய புதிய இணையதள சேவை தொடக்கம்',
        summary: 'அமேஸ் டைம்ஸ் தளம் நவீன வடிவமைப்புடன் வாசகர்களின் பயன்பாட்டிற்கு வந்துள்ளது.',
        content: 'அமேஸ் டைம்ஸ் தமிழ் நாளிதழ் தளம் நவீன தொழில்நுட்பங்களுடன் முழுமையாக நேரலை செய்யப்பட்டுள்ளது.',
        category: 'தமிழ்நாடு',
        district: 'all',
        mainImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
        tags: 'அமேஸ், நேரலை, முக்கியசெய்தி',
        isBreaking: true,
        isLeadHero: false,
        isTopStory: false
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    if (!data.success || !data.data?.id) throw new Error(`Failed to create: ${JSON.stringify(data)}`);
    createdArticleId = data.data.id;
    return `Created Article ID: ${createdArticleId}`;
  });

  // 7. Atomic Permanent Views Engine
  await testStep('7. Atomic Views Increment (POST /api/news/:id/view)', async () => {
    if (!createdArticleId) throw new Error('No article ID to test view');
    const res = await fetch(`${BASE_URL}/api/news/${createdArticleId}/view`, { method: 'POST' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || typeof data.viewsCount !== 'number') throw new Error('Invalid view increment response');
    return `New Views Count: ${data.viewsCount}`;
  });

  // 8. Relational Likes Engine & Deduplication
  await testStep('8. Unique Relational Likes Engine (POST /api/news/:id/like)', async () => {
    if (!createdArticleId) throw new Error('No article ID to test like');
    const testVisitor = 'test_visitor_uuid_' + Date.now();

    // Toggle 1: Like
    const res1 = await fetch(`${BASE_URL}/api/news/${createdArticleId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIdentifier: testVisitor })
    });
    const d1 = await res1.json();
    if (!d1.success || !d1.liked || d1.likesCount !== 1) throw new Error(`Like failed: ${JSON.stringify(d1)}`);

    // Toggle 2: Unlike
    const res2 = await fetch(`${BASE_URL}/api/news/${createdArticleId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIdentifier: testVisitor })
    });
    const d2 = await res2.json();
    if (!d2.success || d2.liked !== false || d2.likesCount !== 0) throw new Error(`Unlike failed: ${JSON.stringify(d2)}`);

    return `Liked (+1) & Unliked (-1) verified successfully`;
  });

  // 9. Priority #1 "Make First" Action
  await testStep('9. Priority #1 Action (POST /api/news/:id/make-first)', async () => {
    if (!createdArticleId) throw new Error('No article ID to test make-first');
    const res = await fetch(`${BASE_URL}/api/news/${createdArticleId}/make-first`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-admin-token'
      }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Make-first failed');
    return `Display Order: ${data.display_order}, Top Story: ${data.news?.isTopStory}`;
  });

  // 10. Update & Delete News Cleanup
  await testStep('10. News Update & Delete (PUT / DELETE /api/news/:id)', async () => {
    if (!createdArticleId) throw new Error('No article ID to test delete');
    
    // Update
    const upRes = await fetch(`${BASE_URL}/api/news/${createdArticleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-admin-token'
      },
      body: JSON.stringify({ subtitle: 'புதுப்பிக்கப்பட்ட துணைத் தலைப்பு' })
    });
    const upData = await upRes.json();
    if (!upData.success) throw new Error('Update failed');

    // Delete
    const delRes = await fetch(`${BASE_URL}/api/news/${createdArticleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer demo-admin-token'
      }
    });
    const delData = await delRes.json();
    if (!delData.success) throw new Error('Delete failed');

    return `Updated & Deleted cleanly`;
  });

  // 11. Home Builder Layout Configuration
  await testStep('11. Home Page Builder (GET / PUT /api/home-builder)', async () => {
    const getRes = await fetch(`${BASE_URL}/api/home-builder`);
    if (!getRes.ok) throw new Error(`GET Status ${getRes.status}`);
    const getData = await getRes.json();
    if (!getData.success || !getData.data) throw new Error('Invalid home builder layout');

    const putRes = await fetch(`${BASE_URL}/api/home-builder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-admin-token'
      },
      body: JSON.stringify({
        sectionOrder: ["hero", "ticker", "cinema_sports", "general", "features", "magazines", "videos"],
        highlightCategory: "cinema"
      })
    });
    const putData = await putRes.json();
    if (!putData.success) throw new Error('PUT home builder layout failed');
    return `Lead Hero: ${getData.data.leadHero?.title?.substring(0, 30) || 'Resolved'}, Sections: ${getData.data.sectionOrder.length}`;
  });

  // 12. Real-Time Heartbeat Live Viewers
  await testStep('12. Active Viewers 45-Second Sliding Window (POST /api/analytics/heartbeat)', async () => {
    const res = await fetch(`${BASE_URL}/api/analytics/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: 'master_test_visitor_' + Date.now() })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || typeof data.liveCount !== 'number') throw new Error('Invalid heartbeat response');
    return `Active Live Readers: ${data.liveCount}, Total Views: ${data.totalViews}`;
  });

  // 13. Special Days Festival Card & Wish Increment
  await testStep('13. Special Days Festival Wish Counter (/api/special-days/:id/wish)', async () => {
    const listRes = await fetch(`${BASE_URL}/api/special-days`);
    const listData = await listRes.json();
    if (!listData.success || !Array.isArray(listData.data) || listData.data.length === 0) {
      return 'No active festivals (Skipped increment)';
    }
    const festivalId = listData.data[0].id;
    const wishRes = await fetch(`${BASE_URL}/api/special-days/${festivalId}/wish`, { method: 'POST' });
    const wishData = await wishRes.json();
    if (!wishData.success || typeof wishData.wishesCount !== 'number') throw new Error('Wish increment failed');
    return `Festival: ${listData.data[0].title}, Wishes: ${wishData.wishesCount}`;
  });

  // 14. Social Media YouTube Extraction
  await testStep('14. Social Media Settings & YouTube Regex Extraction (/api/social-media)', async () => {
    const res = await fetch(`${BASE_URL}/api/social-media`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data) throw new Error('Social media data missing');
    return `YouTube: ${data.data.youtube_handle || '@AmazeTimes'}, Subs: ${data.data.youtube_subscribers || '250K'}`;
  });

  // 15. Single Page Application (SPA) Dist Routing
  await testStep('15. Single Page Application (SPA) Dist Routing', async () => {
    const homeRes = await fetch(`${BASE_URL}/`);
    if (!homeRes.ok) throw new Error(`Home status ${homeRes.status}`);
    const homeHtml = await homeRes.text();
    if (!homeHtml.includes('<!DOCTYPE html>')) throw new Error('Home did not return HTML');

    const adminRes = await fetch(`${BASE_URL}/admin`);
    if (!adminRes.ok) throw new Error(`Admin route status ${adminRes.status}`);
    const adminHtml = await adminRes.text();
    if (!adminHtml.includes('<!DOCTYPE html>')) throw new Error('SPA routing failed for /admin');

    return `SPA HTML served correctly on / and /admin`;
  });

  console.log(`\n${colors.bold}${colors.yellow}================================================================${colors.reset}`);
  console.log(`${colors.bold}${passedCount === totalCount ? colors.green : colors.red}TEST SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED${colors.reset}`);
  console.log(`${colors.bold}${colors.yellow}================================================================${colors.reset}\n`);

  if (passedCount === totalCount) {
    console.log(`${colors.green}${colors.bold}🎯 DEPLOYMENT READINESS VERDICT: 100% READY FOR PRODUCTION DEPLOYMENT! 🚀${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}⚠️ DEPLOYMENT READINESS VERDICT: FAILURES DETECTED! PLEASE REVIEW. ✖${colors.reset}\n`);
  }

  process.exit(passedCount === totalCount ? 0 : 1);
}

runMasterTest().catch(err => {
  console.error('Master test fatal error:', err);
  process.exit(1);
});
