import bcrypt from 'bcryptjs';
import { pool } from './db.js';

async function runMigration() {
  console.log('🚀 Connecting to Neon PostgreSQL and initiating schema migration...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. EXTENSIONS
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. USERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'reporter')),
        avatar_url TEXT,
        bio TEXT,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. CATEGORIES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name_ta VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        icon VARCHAR(50) NOT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. NEWS ARTICLES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        subtitle VARCHAR(400),
        slug VARCHAR(350) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        category_id VARCHAR(50) REFERENCES categories(id) ON DELETE RESTRICT,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(25) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected', 'archived')),
        rejection_reason TEXT,
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        cover_image_url TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        is_lead BOOLEAN DEFAULT FALSE,
        is_breaking BOOLEAN DEFAULT FALSE,
        view_count BIGINT DEFAULT 0,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);`);

    // 5. BREAKING TICKER TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS breaking_tickers (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        priority INT DEFAULT 1,
        link_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // 6. LIVE WIRE TIMELINE
    await client.query(`
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

    // 7. E-PAPER EDITIONS
    await client.query(`
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

    // 8. SHORTS / REELS
    await client.query(`
      CREATE TABLE IF NOT EXISTS shorts_reels (
        id SERIAL PRIMARY KEY,
        headline VARCHAR(200) NOT NULL,
        description TEXT,
        media_url TEXT NOT NULL,
        media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
        duration_seconds INT DEFAULT 60,
        view_count BIGINT DEFAULT 0,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'pending_approval', 'published')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. AUDIO BRIEFS
    await client.query(`
      CREATE TABLE IF NOT EXISTS audio_briefs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(250) NOT NULL,
        audio_url TEXT NOT NULL,
        duration_minutes VARCHAR(20) DEFAULT '3 நிமிடம்',
        transcript TEXT,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. POLLS & QUIZZES
    await client.query(`
      CREATE TABLE IF NOT EXISTS polls (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        total_votes BIGINT DEFAULT 0,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id SERIAL PRIMARY KEY,
        poll_id INT REFERENCES polls(id) ON DELETE CASCADE,
        option_text VARCHAR(200) NOT NULL,
        votes_count BIGINT DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        explanation TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_options (
        id SERIAL PRIMARY KEY,
        quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
        option_text VARCHAR(200) NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE
      );
    `);

    // 11. UNIQUE VISITORS ANALYTICS ENGINE
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_visitors (
        id BIGSERIAL PRIMARY KEY,
        visitor_hash VARCHAR(64) NOT NULL,
        visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
        device_type VARCHAR(20) DEFAULT 'desktop',
        browser VARCHAR(50),
        hit_count INT DEFAULT 1,
        first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_visitor_date UNIQUE(visitor_hash, visit_date)
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_daily_visitors_date ON daily_visitors(visit_date);`);

    // 12. ACTIVITY / AUDIT LOGS
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ==========================================
    // SEEDING DATA
    // ==========================================

    // Categories
    const categories = [
      { id: 'all', name_ta: 'அனைத்தும்', name_en: 'All', icon: 'apps', sort_order: 1 },
      { id: 'tamilnadu', name_ta: 'தமிழ்நாடு', name_en: 'Tamil Nadu', icon: 'location_on', sort_order: 2 },
      { id: 'india', name_ta: 'இந்தியா', name_en: 'India', icon: 'flag', sort_order: 3 },
      { id: 'world', name_ta: 'உலகம்', name_en: 'World', icon: 'public', sort_order: 4 },
      { id: 'cinema', name_ta: 'சினிமா', name_en: 'Cinema', icon: 'movie', sort_order: 5 },
      { id: 'business', name_ta: 'வணிகம்', name_en: 'Business', icon: 'trending_up', sort_order: 6 },
      { id: 'sports', name_ta: 'விளையாட்டு', name_en: 'Sports', icon: 'sports_cricket', sort_order: 7 },
      { id: 'tech', name_ta: 'தொழில்நுட்பம்', name_en: 'Technology', icon: 'memory', sort_order: 8 },
      { id: 'spiritual', name_ta: 'ஆன்மிகம்', name_en: 'Spiritual', icon: 'temple_hindu', sort_order: 9 },
      { id: 'districts', name_ta: 'மாவட்டங்கள்', name_en: 'Districts', icon: 'location_city', sort_order: 10 },
      { id: 'editorial', name_ta: 'தலையங்கம்', name_en: 'Editorial', icon: 'edit_note', sort_order: 11 }
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (id, name_ta, name_en, icon, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET name_ta = $2, name_en = $3, icon = $4, sort_order = $5;
      `, [cat.id, cat.name_ta, cat.name_en, cat.icon, cat.sort_order]);
    }

    // Default Admin & Reporter Accounts
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const reporterPasswordHash = await bcrypt.hash('Reporter@12345', 10);

    const adminRes = await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, bio)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO UPDATE
      SET password_hash = $3, role = $5, full_name = $4
      RETURNING id;
    `, ['admin', 'admin@amazetimes.com', adminPasswordHash, 'முதன்மை ஆசிரியர் (Chief Editor)', 'admin', 'அமேஸ் டைம்ஸ் தலைமை நிர்வாகம்']);

    const adminId = adminRes.rows[0].id;

    const reporterRes = await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, phone, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO UPDATE
      SET password_hash = $3, role = $5, full_name = $4
      RETURNING id;
    `, ['reporter1', 'reporter1@amazetimes.com', reporterPasswordHash, 'க. சௌந்தர்ராஜன் (Special Correspondent)', 'reporter', '+91 98401 23456', 'சென்னை தலைமை நிருபர்']);

    const reporterId = reporterRes.rows[0].id;

    // Seed Articles
    const initialArticles = [
      {
        title: "தமிழக பட்ஜெட் 2025: புதிய வளர்ச்சித் திட்டங்கள் மற்றும் உள்கட்டமைப்பு பணிகளுக்கான பிரம்மாண்ட நிதி ஒதுக்கீடு அறிவிப்பு!",
        subtitle: "கல்வித்துறைக்கு ₹44,000 கோடி நிதி ஒதுக்கீடு மற்றும் புதிய வேலைவாய்ப்புகள்",
        slug: "tamil-nadu-budget-2025-massive-infrastructure-funds",
        content: "சட்டப்பேரவையில் 2025-26ஆம் ஆண்டுக்கான முழுமையான நிதிநிலை அறிக்கையை நிதியமைச்சர் தாக்கல் செய்தார். சென்னை மெட்ரோ ரயில் 2-ஆம் கட்டப் பணிகள், கோயம்புத்தூர் மெட்ரோ திட்டங்கள், புதிய விண்வெளிப் பூங்கா மற்றும் உயர் கல்வி ஊக்கத் தொகை திட்டங்களுக்கு பிரம்மாண்டமாக நிதி ஒதுக்கீடு செய்யப்பட்டுள்ளது. மாநிலத்தில் வேலையில்லாத் திண்டாட்டத்தைக் குறைக்க 10 லட்சம் புதிய வேலைவாய்ப்புகள் உருவாக்கப்படும் என அறிவிக்கப்பட்டுள்ளது.",
        excerpt: "சட்டப்பேரவையில் 2025-26ஆம் ஆண்டுக்கான நிதிநிலை அறிக்கையை நிதியமைச்சர் தாக்கல் செய்தார். தொழில் துறை வளர்ச்சி, மெட்ரோ ரயில் விரிவாக்கம்...",
        category_id: "tamilnadu",
        author_id: adminId,
        status: "published",
        is_lead: true,
        cover_image_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
        tags: ["பட்ஜெட்2025", "தமிழகம்", "மெட்ரோ"]
      },
      {
        title: "சென்னையில் புதிய மெட்ரோ வழித்தடப் பணிகள் 85% நிறைவு: விரைவில் வெள்ளோட்டம் நடைபெறும்!",
        subtitle: "மாதவரம் - சோழிங்கநல்லூர் வழித்தடம்",
        slug: "chennai-metro-phase-2-85-percent-complete",
        content: "சென்னையில் இரண்டாம்கட்ட மெட்ரோ ரயில் திட்டத்தின் கீழ் மாதவரம் முதல் சோழிங்கநல்லூர் வரையிலான பாதையில் 85% சுரங்கப் பாதை பணிகள் நிறைவடைந்துள்ளன. அடுத்த கட்டமாக தண்டவாளம் அமைக்கும் பணிகளும் மின்சார அமைப்புகளும் துரிதப்படுத்தப்பட்டுள்ளன.",
        excerpt: "மாதவரம் - சோழிங்கநல்லூர் இடையேயான சுரங்கப்பாதை பணிகள் விறுவிறுப்பாக நடைபெற்று வருகின்றன.",
        category_id: "tamilnadu",
        author_id: reporterId,
        status: "published",
        is_lead: false,
        cover_image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
        tags: ["சென்னை", "மெட்ரோ"]
      },
      {
        title: "பங்குச்சந்தை புதிய உச்சம்: சென்செக்ஸ் 78,400 புள்ளிகளைக் கடந்து வரலாற்று சாதனை!",
        subtitle: "வங்கி மற்றும் ஐடி துறைகளில் முதலீடு அதிகரிப்பு",
        slug: "sensex-touches-historic-record-high-78400",
        content: "மும்பை பங்குச்சந்தை குறியீட்டு எண் சென்செக்ஸ் 340 புள்ளிகள் உயர்ந்து 78,412 என்ற வரலாற்று சாதனை நிலையை எட்டியுள்ளது. நிஃப்டி 95 புள்ளிகள் உயர்ந்து 23,890 ல் வர்த்தகமாகி வருகிறது.",
        excerpt: "தகவல் தொழில்நுட்பம் மற்றும் வங்கித்துறை பங்குகளின் ஏற்றத்தால் இந்திய பங்குச்சந்தை எழுச்சி.",
        category_id: "business",
        author_id: reporterId,
        status: "published",
        is_lead: false,
        cover_image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80",
        tags: ["பங்குச்சந்தை", "சென்செக்ஸ்"]
      },
      {
        title: "IPL 2025: சென்னை சூப்பர் கிங்ஸ் அணியின் அதிரடி வியூகம்! சேப்பாக்கத்தில் தீவிர பயிற்சி",
        subtitle: "தோனி தலைமையிலான ஆலோசனை கூட்டம்",
        slug: "csk-ipl-2025-chepauk-stadium-intense-training",
        content: "சென்னை சேப்பாக்கம் மைதானத்தில் சிஎஸ்கே அணியினர் தீவிர வலைப்பயிற்சியில் ஈடுபட்டனர். சுழற்பந்து வீச்சுக்கு ஏற்றவாறு புதிய பேட்டிங் உத்திகளைப் பயிற்சி செய்து வருகின்றனர்.",
        excerpt: "சேப்பாக்கம் மைதானத்தில் சிஎஸ்கே வீரர்கள் தீவிர வலைப்பயிற்சியில் ஈடுபட்டு வருகின்றனர்.",
        category_id: "sports",
        author_id: reporterId,
        status: "published",
        is_lead: false,
        cover_image_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80",
        tags: ["IPL2025", "CSK", "கிரிக்கெட்"]
      },
      {
        title: "மதுரை எய்ம்ஸ் மருத்துவமனை கட்டுமானப் பணிகள் வேகம் பெற்றது: 2027-ல் பயன்பாட்டுக்கு வரும்!",
        subtitle: "தோப்பூரில் புதிய மருத்துவ வளாகம்",
        slug: "madurai-aiims-construction-progress-2027-opening",
        content: "தோப்பூரில் அமையவிருக்கும் எய்ம்ஸ் மருத்துவமனை வளாகத்தில் உலகத் தரம் வாய்ந்த முதன்மை மருத்துவக் கட்டிடப் பணிகள் மிக வேகமான முறையில் நடைபெற்று வருகின்றன.",
        excerpt: "தோப்பூரில் எய்ம்ஸ் மருத்துவமனையின் முதன்மை விசேஷ கட்டிடங்களுக்கான அஸ்திவாரம் அமைக்கும் பணி நிறைவடைந்தது.",
        category_id: "tamilnadu",
        author_id: reporterId,
        status: "published",
        is_lead: false,
        cover_image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80",
        tags: ["மதுரை", "எய்ம்ஸ்"]
      },
      {
        title: "இந்திய பொருளாதார வளர்ச்சி 7.2% ஆக உயரும்: உலக வங்கி பிரம்மாண்ட கணிப்பு!",
        subtitle: "உள்நாட்டு உற்பத்தி வேகமான வளர்ச்சி",
        slug: "india-economic-growth-world-bank-7-point-2-percent",
        content: "உலக வங்கி வெளியிட்டுள்ள புதிய பொருளாதார அறிக்கையில், இந்திய உற்பத்தித் துறையும் சேவைத் துறையும் தொடர்ந்து பலமான வளர்ச்சியைப் பதிவு செய்து வருவதாகத் தெரிவிக்கப்பட்டுள்ளது.",
        excerpt: "உள்நாட்டு உற்பத்தி மற்றும் டிஜிட்டல் பணப்பரிவர்த்தனைகளின் வேகமான வளர்ச்சி காரணமாக இந்திய பொருளாதாரம் பலமடைந்துள்ளது.",
        category_id: "india",
        author_id: reporterId,
        status: "published",
        is_lead: false,
        cover_image_url: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1000&q=80",
        tags: ["இந்தியா", "பொருளாதாரம்"]
      },
      {
        title: "சர்வதேச பருவநிலை மாநாடு: பசுமை ஆற்றல் மாற்றத்துக்கு $100 பில்லியன் நிதி ஒப்படைப்பு!",
        subtitle: "ஐக்கிய நாடுகள் சபையின் ஒப்பந்தம்",
        slug: "un-climate-summit-100-billion-green-energy-pledge",
        content: "சர்வதேச பருவநிலை மாற்றத்தைக் கட்டுப்படுத்தும் முயற்சியில் சூரிய ஆற்றல் மற்றும் காற்று ஆற்றல் உள்கட்டமைப்பை மேம்படுத்த உலக நாடுகள் கூட்டு நிதியை அறிவித்துள்ளன.",
        excerpt: "ஐக்கிய நாடுகள் சபையின் பருவநிலை மாநாட்டில் இயற்கை ஆற்றல் உள்கட்டமைப்புக்காக உலக நாடுகள் ஒப்பந்தம்.",
        category_id: "world",
        author_id: reporterId,
        status: "published",
        is_lead: false,
        cover_image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
        tags: ["உலகம்", "பருவநிலை"]
      },
      {
        title: "மணிரத்னத்தின் பிரம்மாண்ட அடுத்த திரைப்படம்: ஃபர்ஸ்ட் லுக் போஸ்டர் வெளியீடு!",
        subtitle: "இணையதளங்களில் வைரல் வரவேற்பு",
        slug: "maniratnam-next-mega-movie-first-look-released",
        content: "இயக்குநர் மணிரத்னத்தின் பிரம்மாண்ட படைப்பில் உருவாகும் புதிய திரைப்படத்தின் ஃபர்ஸ்ட் லுக் மற்றும் இசை அமைப்பாளர் அறிவிப்பு இணையதளங்களில் பெரும் வரவேற்பைப் பெற்றுள்ளது.",
        excerpt: "மணிரத்னம் இயக்கத்தில் உருவாகும் புதிய திரைப்படத்தின் ஃபர்ஸ்ட் லுக் போஸ்டர் சமூக வலைத்தளங்களில் வைராலாகி வருகிறது.",
        category_id: "cinema",
        author_id: reporterId,
        status: "published",
        is_lead: false,
        cover_image_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80",
        tags: ["சினிமா", "மணிரத்னம்"]
      },
      {
        title: "செயற்கை நுண்ணறிவு புரட்சி: தமிழ் மொழியிலும் இயங்கும் புதிய AI தளம் அறிமுகம்!",
        subtitle: "நிருபரின் புதிய வரைவு செய்தி (ஒப்புதல் நிலுவையில்)",
        slug: "tamil-ai-language-platform-launch-pending-sample",
        content: "தமிழ் மொழி இலக்கியம் மற்றும் நாளிதழ் தரவுகளின் அடிப்படையில் பயிற்சி அளிக்கப்பட்ட அதிநவீன செயற்கை நுண்ணறிவு மாதிரி இன்று சென்னையில் அறிமுகம் செய்யப்பட்டுள்ளது.",
        excerpt: "தமிழ் மொழிக்கான பிரத்யேக AI தளம் சென்னையில் வெற்றிகரமாக அறிமுகப்படுத்தப்பட்டது.",
        category_id: "tech",
        author_id: reporterId,
        status: "pending_approval", // Sample pending submission to test approval flow!
        is_lead: false,
        cover_image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
        tags: ["தொழில்நுட்பம்", "AI", "தமிழ்"]
      }
    ];

    for (const art of initialArticles) {
      await client.query(`
        INSERT INTO articles (
          title, subtitle, slug, content, excerpt, category_id, author_id,
          status, is_lead, cover_image_url, tags
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO UPDATE
        SET title = $1, subtitle = $2, content = $4, excerpt = $5,
            category_id = $6, status = $8, is_lead = $9, cover_image_url = $10, tags = $11;
      `, [
        art.title, art.subtitle, art.slug, art.content, art.excerpt,
        art.category_id, art.author_id, art.status, art.is_lead,
        art.cover_image_url, art.tags
      ]);
    }

    // Seed Breaking Tickers
    await client.query(`DELETE FROM breaking_tickers;`);
    const tickers = [
      "தமிழக பட்ஜெட் 2025: கல்வித்துறைக்கு ₹44,000 கோடி ஒதுக்கீடு!",
      "சென்னை மெட்ரோ இரண்டாம் கட்டப் பணிகள் 85% நிறைவு பெற்றது.",
      "மும்பை பங்குச்சந்தை சென்செக்ஸ் 78,400 புள்ளிகளைக் கடந்து புதிய சாதனை!",
      "ஐபிஎல் 2025: சென்னை சேப்பாக்கத்தில் சிஎஸ்கே வீரர்கள் தீவிர வலைப்பயிற்சி."
    ];
    for (let i = 0; i < tickers.length; i++) {
      await client.query(`
        INSERT INTO breaking_tickers (content, priority, created_by)
        VALUES ($1, $2, $3);
      `, [tickers[i], i + 1, adminId]);
    }

    // Seed Live Wire
    await client.query(`DELETE FROM live_wires;`);
    const liveItems = [
      { title: "தமிழக சட்டப்பேரவையில் பட்ஜெட் உரை தொடக்கம்", time_badge: "09:00 AM", is_highlight: true },
      { title: "சென்னை மெட்ரோ திட்ட விரிவாக்கத்திற்கான நிதி ஒதுக்கீடு உறுதி", time_badge: "09:25 AM", is_highlight: true },
      { title: "தங்கத்தின் விலை சவரனுக்கு ₹240 குறைந்தது: நகைப்பிரியர்கள் மகிழ்ச்சி", time_badge: "10:10 AM", is_highlight: false },
      { title: "மும்பை பங்குச்சந்தை புதிய உச்சம் தொட்டது", time_badge: "11:00 AM", is_highlight: false },
      { title: "சென்னையில் மாலை நேரங்களில் இடியுடன் கூடிய மழைக்கு வாய்ப்பு", time_badge: "11:45 AM", is_highlight: false }
    ];
    for (const lw of liveItems) {
      await client.query(`
        INSERT INTO live_wires (title, time_badge, is_highlight, created_by)
        VALUES ($1, $2, $3, $4);
      `, [lw.title, lw.time_badge, lw.is_highlight, adminId]);
    }

    // Seed E-Paper Edition
    await client.query(`
      INSERT INTO epaper_editions (title, edition_date, pdf_url, cover_image_url, page_count, file_size_mb, created_by)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
      ON CONFLICT (edition_date) DO NOTHING;
    `, [
      "அமேஸ் டைம்ஸ் - தமிழ் நாளிதழ் பிரதான பதிப்பு",
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      "/Amaze times.jpg",
      16,
      14.2,
      adminId
    ]);

    // Seed Shorts Stories
    await client.query(`DELETE FROM shorts_reels;`);
    const shorts = [
      {
        headline: "மெட்ரோ ரயில் சோதனை ஓட்டம் வெற்றி!",
        description: "சென்னை மெட்ரோ புதிய தடத்தில் தானியங்கி சோதனை ஓட்டம் வெற்றிகரமாக நடத்தப்பட்டது.",
        media_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"
      },
      {
        headline: "சிஎஸ்கே தீவிர வலைப்பயிற்சி!",
        description: "சேப்பாக்கம் மைதானத்தில் தோனி, ருதுராஜ் அதிரடி பேட்டிங் பயிற்சி.",
        media_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80"
      },
      {
        headline: "பங்குச்சந்தை வரலாற்று உச்சம்!",
        description: "சென்செக்ஸ் 78,400 புள்ளிகளைக் கடந்து புதிய மைல்கல் சாதனை.",
        media_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80"
      }
    ];
    for (const sh of shorts) {
      await client.query(`
        INSERT INTO shorts_reels (headline, description, media_url, author_id)
        VALUES ($1, $2, $3, $4);
      `, [sh.headline, sh.description, sh.media_url, adminId]);
    }

    // Seed Audio Brief
    await client.query(`DELETE FROM audio_briefs;`);
    await client.query(`
      INSERT INTO audio_briefs (title, audio_url, duration_minutes, transcript, author_id)
      VALUES ($1, $2, $3, $4, $5);
    `, [
      "3 நிமிட முக்கிய காலைச் செய்திச் சுருக்கம்",
      "https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg",
      "3 நிமிடம்",
      "அமேஸ் டைம்ஸ் 3 நிமிட செய்தி ஆடியோ: தமிழக பட்ஜெட் அறிவிப்புகள், மெட்ரோ விரிவாக்கப் பணிகள் மற்றும் சர்வதேச பங்குச்சந்தை நிலவரங்கள்.",
      adminId
    ]);

    // Seed Poll & Quiz
    await client.query(`DELETE FROM poll_options; DELETE FROM polls;`);
    const pollRes = await client.query(`
      INSERT INTO polls (question, total_votes, created_by)
      VALUES ($1, $2, $3) RETURNING id;
    `, ["தமிழக பட்ஜெட்டில் உள்கட்டமைப்பு பணிகளுக்கு அளிக்கப்பட்ட முக்கியத்துவம் போதுமானதா?", 142, adminId]);
    const pollId = pollRes.rows[0].id;
    await client.query(`
      INSERT INTO poll_options (poll_id, option_text, votes_count) VALUES
      ($1, 'ஆம், மிகச் சிறப்பு', 116),
      ($1, 'இன்னும் மேம்படுத்தலாம்', 18),
      ($1, 'கருத்தில்லை', 8);
    `, [pollId]);

    await client.query(`DELETE FROM quiz_options; DELETE FROM quizzes;`);
    const quizRes = await client.query(`
      INSERT INTO quizzes (question, explanation, created_by)
      VALUES ($1, $2, $3) RETURNING id;
    `, ["கேள்வி: 2025-26 தமிழக பட்ஜெட்டில் உயர்கல்வி மற்றும் பாசன திட்டங்களுக்கு எவ்வளவு நிதி ஒதுக்கீடு செய்யப்பட்டுள்ளது?", "சரியான விடை: ₹44,000 கோடி.", adminId]);
    const quizId = quizRes.rows[0].id;
    await client.query(`
      INSERT INTO quiz_options (quiz_id, option_text, is_correct) VALUES
      ($1, 'அ) ₹44,000 கோடி (சரியான விடை)', true),
      ($1, 'ஆ) ₹20,000 கோடி', false),
      ($1, 'இ) ₹10,000 கோடி', false);
    `, [quizId]);

    // Seed initial daily visitors
    await client.query(`
      INSERT INTO daily_visitors (visitor_hash, visit_date, device_type, hit_count)
      VALUES 
      ('seed_hash_visitor_01', CURRENT_DATE, 'desktop', 12),
      ('seed_hash_visitor_02', CURRENT_DATE, 'mobile', 8),
      ('seed_hash_visitor_03', CURRENT_DATE, 'mobile', 5),
      ('seed_hash_visitor_04', CURRENT_DATE, 'desktop', 15),
      ('seed_hash_visitor_05', CURRENT_DATE, 'tablet', 3)
      ON CONFLICT (visitor_hash, visit_date) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('✅ Neon PostgreSQL Migration and Database Seeding Completed Successfully!');
    console.log('👤 Admin Account: username = "admin", password = "Admin@12345"');
    console.log('✍️ Reporter Account: username = "reporter1", password = "Reporter@12345"');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
