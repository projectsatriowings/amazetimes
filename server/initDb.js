import { pool, query, ensureHttpsUrl } from './db.js';

export async function initDb() {
  console.log('⚡ Initializing Neon PostgreSQL Schema & Tables for Amaze Times...');

  try {
    // 1. EXTENSIONS
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. USERS TABLE
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(100) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'reader',
        designation VARCHAR(255) DEFAULT 'Reader',
        avatar_url TEXT DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        bio TEXT DEFAULT '',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure backwards compatibility with any existing users columns
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(255) DEFAULT 'Reader';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'reader';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);

    // 3. NEWS TABLE
    await query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT DEFAULT '',
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        district VARCHAR(100) DEFAULT 'all',
        main_image TEXT NOT NULL,
        seo_keywords TEXT DEFAULT '',
        tags TEXT DEFAULT '',
        is_breaking BOOLEAN DEFAULT FALSE,
        is_lead_hero BOOLEAN DEFAULT FALSE,
        is_top_story BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        author_name VARCHAR(255) DEFAULT 'Reporter',
        status VARCHAR(50) DEFAULT 'published',
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Safe column additions for pre-existing news table
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS summary TEXT DEFAULT '';`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT 'all';`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS seo_keywords TEXT DEFAULT '';`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '';`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS is_breaking BOOLEAN DEFAULT FALSE;`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS is_lead_hero BOOLEAN DEFAULT FALSE;`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS is_top_story BOOLEAN DEFAULT FALSE;`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS author_name VARCHAR(255) DEFAULT 'Reporter';`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);

    // News Indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_news_status_created ON news(status, created_at DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_news_category_created ON news(category, created_at DESC);` );
    await query(`CREATE INDEX IF NOT EXISTS idx_news_district ON news(district);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_news_display_order ON news(display_order);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_news_is_breaking ON news(is_breaking);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_news_is_lead_hero ON news(is_lead_hero);`);

    // 4. NEWS_LIKES TABLE (Permanent Unique Likes)
    await query(`
      CREATE TABLE IF NOT EXISTS news_likes (
        id SERIAL PRIMARY KEY,
        news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
        user_identifier VARCHAR(150) NOT NULL,
        ip_address VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(news_id, user_identifier)
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_news_likes_lookup ON news_likes(news_id, user_identifier);`);

    // 5. SITE_ANALYTICS & VISITOR_LOGS
    await query(`
      CREATE TABLE IF NOT EXISTS site_analytics (
        id SERIAL PRIMARY KEY,
        total_views BIGINT DEFAULT 0,
        total_visitors BIGINT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`
      INSERT INTO site_analytics (id, total_views, total_visitors)
      VALUES (1, 0, 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(100) NOT NULL,
        ip_address VARCHAR(100),
        user_agent TEXT,
        visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_visitor_logs_vid ON visitor_logs(visitor_id);`);

    // 6. HOME_BUILDER_SETTINGS
    await query(`
      CREATE TABLE IF NOT EXISTS home_builder_settings (
        id SERIAL PRIMARY KEY,
        lead_hero_id INTEGER,
        breaking_ids JSONB DEFAULT '[]',
        top_stories_ids JSONB DEFAULT '[]',
        section_order JSONB DEFAULT '["hero", "ticker", "cinema_sports", "general", "features", "magazines", "videos"]',
        highlight_category VARCHAR(100) DEFAULT 'cinema',
        settings JSONB DEFAULT '{}'
      );
    `);
    await query(`
      INSERT INTO home_builder_settings (id, section_order, highlight_category)
      VALUES (1, '["hero", "ticker", "cinema_sports", "general", "features", "magazines", "videos"]', 'cinema')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 7. SPECIAL_DAYS
    await query(`
      CREATE TABLE IF NOT EXISTS special_days (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT DEFAULT '',
        date_display VARCHAR(100) NOT NULL,
        event_date DATE,
        banner_image TEXT NOT NULL,
        greeting_message TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'festival',
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        wishes_count INTEGER DEFAULT 100
      );
    `);

    // 8. SOCIAL_MEDIA_SETTINGS
    await query(`
      CREATE TABLE IF NOT EXISTS social_media_settings (
        id SERIAL PRIMARY KEY,
        youtube_url TEXT DEFAULT 'https://www.youtube.com/@AmazeTimes',
        youtube_handle VARCHAR(100) DEFAULT '@AmazeTimes',
        youtube_subscribers VARCHAR(100) DEFAULT '250K',
        instagram_url TEXT DEFAULT 'https://www.instagram.com/amazetimes',
        instagram_handle VARCHAR(100) DEFAULT '@amazetimes_official',
        instagram_followers VARCHAR(100) DEFAULT '180K',
        facebook_url TEXT DEFAULT 'https://www.facebook.com/amazetimes',
        facebook_handle VARCHAR(100) DEFAULT 'Amaze Times Official',
        whatsapp_url TEXT DEFAULT 'https://whatsapp.com/channel/amazetimes',
        x_url TEXT DEFAULT 'https://twitter.com/AmazeTimes',
        x_handle VARCHAR(100) DEFAULT '@AmazeTimes',
        x_followers VARCHAR(100) DEFAULT '95K',
        telegram_url TEXT DEFAULT 'https://t.me/AmazeTimes',
        telegram_handle VARCHAR(100) DEFAULT 'Amaze Times Tamil',
        telegram_subscribers VARCHAR(100) DEFAULT '60K',
        whatsapp_announcements JSONB DEFAULT '[]',
        featured_videos JSONB DEFAULT '[]',
        featured_reels JSONB DEFAULT '[]'
      );
    `);
    await query(`ALTER TABLE social_media_settings ADD COLUMN IF NOT EXISTS x_url TEXT DEFAULT 'https://twitter.com/AmazeTimes';`);
    await query(`ALTER TABLE social_media_settings ADD COLUMN IF NOT EXISTS x_handle VARCHAR(100) DEFAULT '@AmazeTimes';`);
    await query(`ALTER TABLE social_media_settings ADD COLUMN IF NOT EXISTS x_followers VARCHAR(100) DEFAULT '95K';`);
    await query(`ALTER TABLE social_media_settings ADD COLUMN IF NOT EXISTS telegram_url TEXT DEFAULT 'https://t.me/AmazeTimes';`);
    await query(`ALTER TABLE social_media_settings ADD COLUMN IF NOT EXISTS telegram_handle VARCHAR(100) DEFAULT 'Amaze Times Tamil';`);
    await query(`ALTER TABLE social_media_settings ADD COLUMN IF NOT EXISTS telegram_subscribers VARCHAR(100) DEFAULT '60K';`);
    await query(`ALTER TABLE social_media_settings ADD COLUMN IF NOT EXISTS whatsapp_announcements JSONB DEFAULT '[]';`);
    await query(`
      INSERT INTO social_media_settings (id)
      VALUES (1)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 9. MAGAZINES
    await query(`
      CREATE TABLE IF NOT EXISTS magazines (
        id VARCHAR(100) PRIMARY KEY,
        title TEXT NOT NULL,
        issue_month VARCHAR(100),
        year VARCHAR(50),
        cover_image TEXT,
        pdf_url TEXT NOT NULL,
        file_size VARCHAR(50),
        pages_count INTEGER DEFAULT 32,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. GOLD_RATES TABLE (Realtime Gold, Silver, Petrol, Diesel Bullion Sync)
    await query(`
      CREATE TABLE IF NOT EXISTS gold_rates (
        id SERIAL PRIMARY KEY,
        gold22k NUMERIC NOT NULL,
        gold24k NUMERIC NOT NULL,
        gold18k NUMERIC NOT NULL,
        silver NUMERIC NOT NULL,
        platinum NUMERIC DEFAULT 2980,
        petrol NUMERIC DEFAULT 100.75,
        diesel NUMERIC DEFAULT 92.34,
        change_amount NUMERIC DEFAULT 0,
        is_up BOOLEAN DEFAULT FALSE,
        source VARCHAR(100) DEFAULT 'Gold-API / GoodReturns',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_gold_rates_created ON gold_rates(created_at DESC);`);

    // 11. BIRTHDAY_OFFICIALS TABLE (Government & VIP Birthday Felicitation Hub)
    await query(`
      CREATE TABLE IF NOT EXISTS birthday_officials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        birth_date DATE,
        date_display VARCHAR(100) NOT NULL,
        photo_url TEXT NOT NULL,
        greeting_text TEXT NOT NULL,
        wishes_count INTEGER DEFAULT 150,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. EPAPER_EDITIONS
    await query(`
      CREATE TABLE IF NOT EXISTS epaper_editions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        edition_date DATE NOT NULL UNIQUE,
        pdf_url TEXT NOT NULL,
        cover_image_url TEXT NOT NULL,
        page_count INT DEFAULT 16,
        file_size_mb NUMERIC(5,2),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 13. TICKERS & LIVE WIRES
    await query(`
      CREATE TABLE IF NOT EXISTS tickers (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        link_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS live_wires (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        time_badge VARCHAR(50) NOT NULL,
        category VARCHAR(50),
        is_highlight BOOLEAN DEFAULT FALSE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 14. SHORTS & REELS
    await query(`
      CREATE TABLE IF NOT EXISTS shorts_reels (
        id SERIAL PRIMARY KEY,
        headline VARCHAR(200) NOT NULL,
        description TEXT,
        media_url TEXT NOT NULL,
        media_type VARCHAR(20) DEFAULT 'image',
        duration_seconds INT DEFAULT 60,
        view_count BIGINT DEFAULT 0,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'published',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 15. POLLS & POLL_VOTES
    await query(`
      CREATE TABLE IF NOT EXISTS polls (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id SERIAL PRIMARY KEY,
        poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        option_index INTEGER NOT NULL,
        ip_hash VARCHAR(100),
        voter_token VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(poll_id, voter_token)
      );
    `);

    // 16. SITE_CONTENT
    await query(`
      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Schema and tables created / updated successfully!');

    // 11. Seed News if empty
    const newsCheck = await query(`SELECT COUNT(*) FROM news;`);
    const newsCount = parseInt(newsCheck.rows[0].count, 10);

    if (newsCount === 0) {
      console.log('🌱 Seeding rich default news into news table...');
      await seedDefaultNews();
    }

    // 12. Seed Special Days if empty
    const sdCheck = await query(`SELECT COUNT(*) FROM special_days;`);
    if (parseInt(sdCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding special days celebrations...');
      await query(`
        INSERT INTO special_days (title, subtitle, date_display, banner_image, greeting_message, category, is_active, is_featured, wishes_count)
        VALUES 
        (
          'தமிழ் புத்தாண்டு நல்வாழ்த்துகள் 2026!',
          'இனிய சித்திரை திருநாள் வாழ்த்துகள்',
          'சித்திரை 1',
          'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80',
          'அனைத்து உலகத் தமிழ் மக்களுக்கும் அமேஸ் டைம்ஸ் இதழின் மனமார்ந்த தமிழ் புத்தாண்டு நல்வாழ்த்துகள்! மங்கலமும் மகிழ்ச்சியும் பெருகட்டும்.',
          'festival',
          TRUE,
          TRUE,
          428
        ),
        (
          'பொங்கல் திருநாள் வாழ்த்துகள்',
          'உழவர் திருநாள் நல்வாழ்த்துகள்',
          'தை 1',
          'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
          'உழவுக்கும் தொழிலுக்கும் வந்தனை செய்வோம்! தை பிறந்தால் வழி பிறக்கும் என்ற நம்பிக்கையுடன் பொங்கல் நல்வாழ்த்துகள்.',
          'festival',
          TRUE,
          FALSE,
          310
        );
      `);
    }

    // 13. Ensure Home Builder Settings has lead_hero_id set
    const heroCheck = await query(`SELECT lead_hero_id FROM home_builder_settings WHERE id = 1;`);
    if (!heroCheck.rows[0]?.lead_hero_id) {
      const topNews = await query(`SELECT id FROM news ORDER BY display_order DESC, created_at DESC LIMIT 5;`);
      if (topNews.rows.length > 0) {
        const leadId = topNews.rows[0].id;
        const topIds = topNews.rows.slice(1, 4).map(r => r.id);
        const breakingIds = topNews.rows.slice(0, 3).map(r => r.id);

        await query(`
          UPDATE home_builder_settings 
          SET lead_hero_id = $1, top_stories_ids = $2::jsonb, breaking_ids = $3::jsonb
          WHERE id = 1;
        `, [leadId, JSON.stringify(topIds), JSON.stringify(breakingIds)]);

        await query(`UPDATE news SET is_lead_hero = TRUE WHERE id = $1;`, [leadId]);
      }
    }

    // 14. Seed Digital Magazines if empty
    const magCheck = await query(`SELECT COUNT(*) FROM magazines;`);
    if (parseInt(magCheck.rows[0].count, 10) === 0) {
      await query(`
        INSERT INTO magazines (id, title, issue_month, year, cover_image, pdf_url, file_size, pages_count)
        VALUES 
        ('amaze_2026_04', 'அமேஸ் டைம்ஸ் - ஏப்ரல் 2026 இதழ்', 'ஏப்ரல்', '2026', 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=600&q=80', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '14.2 MB', 48),
        ('amaze_2026_03', 'அமேஸ் டைம்ஸ் - மார்ச் 2026 இதழ்', 'மார்ச்', '2026', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '12.8 MB', 44),
        ('amaze_2026_02', 'அமேஸ் டைம்ஸ் - பிப்ரவரி 2026 இதழ்', 'பிப்ரவரி', '2026', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '15.1 MB', 52),
        ('amaze_2025_12', 'அமேஸ் டைம்ஸ் - டிசம்பர் 2025 ஆண்டு மலர்', 'டிசம்பர்', '2025', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '18.4 MB', 64)
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // 15. Seed Gold Rates if empty
    const goldCheck = await query(`SELECT COUNT(*) FROM gold_rates;`);
    if (parseInt(goldCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial Chennai & Tamil Nadu bullion gold rates...');
      await query(`
        INSERT INTO gold_rates 
          (gold22k, gold24k, gold18k, silver, platinum, petrol, diesel, change_amount, is_up, source)
        VALUES 
          (7288, 7950, 5965, 104, 2980, 100.75, 92.34, 120, TRUE, 'Tamil Nadu Bullion Association (Chennai)');
      `);
    }

    // 16. Seed Birthday Officials (Government & VIP Felicitation Hub) if empty
    const bdayCheck = await query(`SELECT COUNT(*) FROM birthday_officials;`);
    if (parseInt(bdayCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding government & VIP birthday felicitation officials...');
      await query(`
        INSERT INTO birthday_officials (name, designation, date_display, photo_url, greeting_text, wishes_count, is_active)
        VALUES
        (
          'மாண்புமிகு முதல்வர் மு.க. ஸ்டாலின்',
          'தமிழ்நாடு முதலமைச்சர்',
          'மார்ச் 1',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
          'தமிழ்நாட்டின் ஒப்பற்ற மக்கள் முதல்வர் அவர்களுக்கு அமேஸ் டைம்ஸ் வாசகர்களின் நெஞ்சார்ந்த பிறந்தநாள் வாழ்த்துகள்!',
          1840,
          TRUE
        ),
        (
          'மாண்புமிகு துணை முதல்வர் உதயநிதி ஸ்டாலின்',
          'தமிழ்நாடு துணை முதலமைச்சர் & இளைஞர் நலன், விளையாட்டு மேம்பாட்டுத்துறை அமைச்சர்',
          'நவம்பர் 27',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
          'இளைஞர்களின் எழுச்சி நாயகன் மற்றும் துணை முதல்வர் அவர்களுக்கு மனமார்ந்த பிறந்தநாள் நல்வாழ்த்துகள்!',
          1250,
          TRUE
        ),
        (
          'தளபதி விஜய்',
          'தமிழக வெற்றிக் கழக தலைவர் & முன்னணி நடிகர்',
          'ஜூன் 22',
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
          'கோடிக்கணக்கான ரசிகர்களின் இதயத் தளபதி விஜய் அவர்களுக்கு அமேஸ் டைம்ஸ் இதழின் இனிய பிறந்தநாள் வாழ்த்துகள்!',
          2950,
          TRUE
        );
      `);
    }

    // 17. Seed Tickers if empty
    const tickerCheck = await query(`SELECT COUNT(*) FROM tickers;`);
    if (parseInt(tickerCheck.rows[0].count, 10) === 0) {
      await query(`
        INSERT INTO tickers (text, link_url, is_active)
        VALUES
        ('தமிழகத்தில் மேலும் 5 புதிய தொழில் முதலீடுகளுக்கு அமைச்சரவை ஒப்புதல்!', '', TRUE),
        ('சென்னை மெட்ரோ ரயில் இரண்டாம் கட்டப் பணிகள் 85% நிறைவு: விரைவில் வெள்ளோட்டம்!', '', TRUE),
        ('IPL 2026: சென்னை சூப்பர் கிங்ஸ் அணி அபார வெற்றி - புள்ளிப்பட்டியலில் முதலிடம்!', '', TRUE),
        ('தங்கம் விலை இன்று சவரனுக்கு ₹120 உயர்வு: இன்றைய சந்தை நிலவரம்!', '', TRUE);
      `);
    }

    // 18. Seed E-Paper Editions if empty
    const epaperCheck = await query(`SELECT COUNT(*) FROM epaper_editions;`);
    if (parseInt(epaperCheck.rows[0].count, 10) === 0) {
      const todayIso = new Date().toISOString().split('T')[0];
      await query(`
        INSERT INTO epaper_editions (title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb)
        VALUES
        ('அமேஸ் டைம்ஸ் - இன்றைய நாளிதழ் (சென்னை பதிப்பு)', $1, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80', 16, 12.5)
        ON CONFLICT (edition_date) DO NOTHING;
      `, [todayIso]);
    }

    console.log('🎯 Database initialized and synchronized perfectly!');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
}

async function seedDefaultNews() {
  const seedArticles = [
    {
      title: "தமிழக பட்ஜெட் 2026: புதிய வளர்ச்சித் திட்டங்கள் மற்றும் உள்கட்டமைப்பு பணிகளுக்கான பிரம்மாண்ட நிதி ஒதுக்கீடு அறிவிப்பு!",
      subtitle: "கல்வித்துறைக்கு ₹44,000 கோடி நிதி ஒதுக்கீடு மற்றும் புதிய வேலைவாய்ப்புகள்",
      summary: "சட்டப்பேரவையில் 2026ஆம் ஆண்டுக்கான நிதிநிலை அறிக்கையை நிதியமைச்சர் தாக்கல் செய்தார். மெட்ரோ விரிவாக்கம், விண்வெளி பூங்கா மற்றும் உயர்கல்வி ஊக்கத்தொகை.",
      content: "சட்டப்பேரவையில் 2026-27ஆம் ஆண்டுக்கான முழுமையான நிதிநிலை அறிக்கையை நிதியமைச்சர் தாக்கல் செய்தார். சென்னை மெட்ரோ ரயில் 2-ஆம் கட்டப் பணிகள், கோயம்புத்தூர் மெட்ரோ திட்டங்கள், புதிய விண்வெளிப் பூங்கா மற்றும் உயர் கல்வி ஊக்கத் தொகை திட்டங்களுக்கு பிரம்மாண்டமாக நிதி ஒதுக்கீடு செய்யப்பட்டுள்ளது. மாநிலத்தில் வேலையில்லாத் திண்டாட்டத்தைக் குறைக்க 10 லட்சம் புதிய வேலைவாய்ப்புகள் உருவாக்கப்படும் என அறிவிக்கப்பட்டுள்ளது.",
      category: "தமிழ்நாடு",
      district: "சென்னை",
      main_image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
      tags: "பட்ஜெட்,தமிழகம்,மெட்ரோ",
      is_breaking: true,
      is_lead_hero: true,
      is_top_story: true,
      display_order: 100,
      author_name: "தலைமைச் செய்தியாளர்",
      views_count: 3420,
      likes_count: 245
    },
    {
      title: "சென்னையில் புதிய மெட்ரோ வழித்தடப் பணிகள் 85% நிறைவு: விரைவில் வெள்ளோட்டம் நடைபெறும்!",
      subtitle: "மாதவரம் - சோழிங்கநல்லூர் வழித்தடம்",
      summary: "சென்னையில் இரண்டாம்கட்ட மெட்ரோ ரயில் திட்டத்தின் கீழ் மாதவரம் முதல் சோழிங்கநல்லூர் வரையிலான பாதையில் 85% பணிகள் நிறைவு.",
      content: "சென்னையில் இரண்டாம்கட்ட மெட்ரோ ரயில் திட்டத்தின் கீழ் மாதவரம் முதல் சோழிங்கநல்லூர் வரையிலான பாதையில் 85% சுரங்கப் பாதை பணிகள் நிறைவடைந்துள்ளன. அடுத்த கட்டமாக தண்டவாளம் அமைக்கும் பணிகளும் மின்சார அமைப்புகளும் துரிதப்படுத்தப்பட்டுள்ளன. பொதுமக்கள் விரைவில் தடையற்ற போக்குவரத்து வசதியைப் பெறுவர்.",
      category: "தமிழ்நாடு",
      district: "சென்னை",
      main_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      tags: "சென்னை,மெட்ரோ,போக்குவரத்து",
      is_breaking: true,
      is_lead_hero: false,
      is_top_story: true,
      display_order: 95,
      author_name: "செய்தி ஆசிரியர்",
      views_count: 2150,
      likes_count: 184
    },
    {
      title: "பங்குச்சந்தை புதிய உச்சம்: சென்செக்ஸ் 81,000 புள்ளிகளைக் கடந்து வரலாற்று சாதனை!",
      subtitle: "முதலீட்டாளர்களுக்கு ஒரே நாளில் ₹3 லட்சம் கோடி லாபம்",
      summary: "இந்தியப் பொருளாதார வளர்ச்சி மற்றும் அந்நிய முதலீடுகள் அதிகரித்ததன் எதிரொலியாக இந்திய பங்குச்சந்தைகள் இன்று புதிய வரலாறு படைத்துள்ளன.",
      content: "மும்பை பங்குச் சந்தை குறியீட்டெண் சென்செக்ஸ் இன்று வரலாறு காணாத வகையில் 900 புள்ளிகள் உயர்ந்து 81,000 புள்ளிகளைக் கடந்தது. தேசிய பங்குச் சந்தை நிஃப்டி 24,500 புள்ளிகளைத் தொட்டது. வங்கி, ஆட்டோமொபைல் மற்றும் தகவல் தொழில்நுட்பப் பங்குகள் அதிக லாபத்தை ஈட்டின.",
      category: "வணிகம்",
      district: "all",
      main_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80",
      tags: "பங்குச்சந்தை,சென்செக்ஸ்,வணிகம்",
      is_breaking: false,
      is_lead_hero: false,
      is_top_story: true,
      display_order: 90,
      author_name: "நிதி ஆய்வாளர்",
      views_count: 1890,
      likes_count: 142
    },
    {
      title: "IPL 2026: சென்னை சூப்பர் கிங்ஸ் புதிய அதிரடி வியூகம் - சேப்பாக்கத்தில் தீவிர வலைப்பயிற்சி!",
      subtitle: "ருதுராஜ் கெய்க்வாட் தலைமையில் களமிறங்கும் புலிப்படை",
      summary: "ஐபிஎல் 2026 தொடருக்கான சென்னை சூப்பர் கிங்ஸ் அணி வீரர்கள் சேப்பாக்கம் மைதானத்தில் தீவிரப் பயிற்சியில் ஈடுபட்டு வருகின்றனர்.",
      content: "ஐபிஎல் 2026 சீசன் அடுத்த மாதம் தொடங்கவுள்ள நிலையில், சென்னை சூப்பர் கிங்ஸ் அணியின் பயிற்சி முகாம் சேப்பாக்கம் மைதானத்தில் விறுவிறுப்பாக நடைபெற்று வருகிறது. புதிய வேகப்பந்து வீச்சாளர்கள் மற்றும் ஆல்ரவுண்டர்களின் வருகை அணிக்கு புதிய பலம் சேர்த்துள்ளது. ரசிகர்கள் மைதானத்திற்கு வெளியே திரண்டு உற்சாக வரவேற்பு அளித்தனர்.",
      category: "விளையாட்டு",
      district: "சென்னை",
      main_image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80",
      tags: "IPL,CSK,கிரிக்கெட்",
      is_breaking: false,
      is_lead_hero: false,
      is_top_story: false,
      display_order: 85,
      author_name: "விளையாட்டு நிருபர்",
      views_count: 4210,
      likes_count: 389
    },
    {
      title: "தளபதி 69 மற்றும் சூப்பர்ஸ்டாரின் பிரம்மாண்ட புதிய திரைப்பட டிரெய்லர் ரிலீஸ் தேதி அறிவிப்பு!",
      subtitle: "திரையுலகில் புதிய வசூல் சாதனைக்கு தயாராகும் பான்-இந்தியா திரைப்படங்கள்",
      summary: "கோலிவுட்டின் முன்னணி நட்சத்திரங்களின் அடுத்தடுத்த திரைப்பட அறிவிப்புகள் ரசிகர்களிடையே பெரும் எதிர்பார்ப்பை ஏற்படுத்தியுள்ளன.",
      content: "தமிழ் திரையுலகில் இந்த ஆண்டின் மிகவும் எதிர்பார்க்கப்படும் முன்னணி திரைப்படங்களின் டீசர் மற்றும் இசை வெளியீட்டு விழாக்கள் குறித்த அதிகாரப்பூர்வ அறிவிப்புகள் வெளியாகியுள்ளன. பிரம்மாண்ட பொருட்செலவில் தயாராகும் இந்த படங்கள் உலகெங்கிலும் 10,000 திரையரங்குகளில் வெளியாகவுள்ளன.",
      category: "சினிமா",
      district: "all",
      main_image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80",
      tags: "சினிமா,கோலிவுட்,டிரெய்லர்",
      is_breaking: false,
      is_lead_hero: false,
      is_top_story: false,
      display_order: 80,
      author_name: "சினிமா செய்தியாளர்",
      views_count: 5630,
      likes_count: 520
    },
    {
      title: "மதுரை எய்ம்ஸ் மருத்துவமனை முதன்மைக் கட்டிடப் பணிகள் அதிவேகம்: 2027-ல் மக்கள் பயன்பாடு!",
      subtitle: "ரூ.1,900 கோடி மதிப்பீட்டில் அதிநவீன மருத்துவ வசதிகள்",
      summary: "தென் தமிழக மக்களின் நீண்ட நாள் கோரிக்கையான மதுரை எய்ம்ஸ் மருத்துவமனை பணிகள் துரிதப்படுத்தப்பட்டுள்ளன.",
      content: "மதுரை தோப்பூரில் 222 ஏக்கர் பரப்பளவில் அமையவுள்ள எய்ம்ஸ் மருத்துவமனையின் முதன்மை மருத்துவ வளாகக் கட்டுமானப் பணிகள் வேகமாக நடைபெற்று வருகின்றன. அதிநவீன தீவிர சிகிச்சைப் பிரிவு, ரோபோடிக் அறுவை சிகிச்சை அரங்கம் மற்றும் 750 படுக்கை வசதிகள் கொண்ட வளாகமாக இது உருவாகிறது.",
      category: "மாவட்டங்கள்",
      district: "மதுரை",
      main_image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80",
      tags: "மதுரை,எய்ம்ஸ்,மருத்துவம்",
      is_breaking: false,
      is_lead_hero: false,
      is_top_story: false,
      display_order: 75,
      author_name: "மாவட்டச் செய்தியாளர்",
      views_count: 1420,
      likes_count: 98
    },
    {
      title: "கோவை புதிய தகவல் தொழில்நுட்ப சிறப்பு பொருளாதார பூங்கா: 15,000 புதிய வேலைவாய்ப்புகள்!",
      subtitle: "பன்னாட்டு தகவல் தொழில்நுட்ப நிறுவனங்களின் புதிய முதலீடுகள்",
      summary: "கோயம்புத்தூரில் புதிதாக அமைக்கப்பட்டுள்ள ஐடி பார்க் மூலமாக இளம் பட்டதாரிகளுக்கு வேலைவாய்ப்புகள் பெருகுகின்றன.",
      content: "கோயம்புத்தூர் அவினாசி சாலையில் 25 லட்சம் சதுர அடி பரப்பளவில் உருவாக்கப்பட்டுள்ள புதிய சர்வதேச தகவல் தொழில்நுட்ப வளாகத்தில் உலகளாவிய மென்பொருள் நிறுவனங்கள் தங்கள் அலுவலகங்களைத் தொடங்கவுள்ளன. முதற்கட்டமாக 15,000 மென்பொருள் பொறியாளர்களுக்கு வேலைவாய்ப்புகள் வழங்கப்படும்.",
      category: "வணிகம்",
      district: "கோயம்புத்தூர்",
      main_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      tags: "கோவை,ஐடி,வேலைவாய்ப்பு",
      is_breaking: false,
      is_lead_hero: false,
      is_top_story: false,
      display_order: 70,
      author_name: "கொங்கு நிருபர்",
      views_count: 1680,
      likes_count: 115
    },
    {
      title: "திருச்சி சர்வதேச விமான நிலைய புதிய முனையத்தில் பயணிகள் எண்ணிக்கை இருமடங்காக உயர்வு!",
      subtitle: "தென் கிழக்கு ஆசிய நாடுகளுக்கு கூடுதல் நேரடி விமானச் சேவைகள் தொடக்கம்",
      summary: "திருச்சி விமான நிலையத்தின் புதிய முனையக் கட்டடம் திறக்கப்பட்ட பிறகு வான்வழிப் போக்குவரத்து அபார வளர்ச்சி கண்டுள்ளது.",
      content: "மத்திய தமிழகத்தின் முக்கிய சர்வதேச நுழைவாயிலாகத் திகழும் திருச்சி விமான நிலையத்திலிருந்து சிங்கப்பூர், மலேசியா, துபாய், இலங்கை உள்ளிட்ட நாடுகளுக்கு தினசரி 20-க்கும் மேற்பட்ட சர்வதேச விமானங்கள் இயக்கப்பட்டு வருகின்றன.",
      category: "மாவட்டங்கள்",
      district: "திருச்சி",
      main_image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80",
      tags: "திருச்சி,விமானம்,சுற்றுலா",
      is_breaking: false,
      is_lead_hero: false,
      is_top_story: false,
      display_order: 65,
      author_name: "மாவட்டச் செய்தியாளர்",
      views_count: 1320,
      likes_count: 87
    }
  ];

  for (const art of seedArticles) {
    await query(`
      INSERT INTO news (
        title, subtitle, summary, content, category, district, main_image,
        tags, is_breaking, is_lead_hero, is_top_story, display_order, author_name,
        views_count, likes_count, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'published')
    `, [
      art.title,
      art.subtitle,
      art.summary,
      art.content,
      art.category,
      art.district,
      art.main_image,
      art.tags,
      art.is_breaking,
      art.is_lead_hero,
      art.is_top_story,
      art.display_order,
      art.author_name,
      art.views_count,
      art.likes_count
    ]);
  }
}

export default initDb;
