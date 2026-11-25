import { query, ensureHttpsUrl } from '../db.js';

const BASE_URL = 'https://amazetimes.com';

const CATEGORY_META = {
  tamilnadu: { ta: 'தமிழ்நாடு செய்திகள்', en: 'Tamil Nadu News', title: 'தமிழ்நாடு செய்திகள் உடனுக்குடன் | Amaze Times News' },
  politics: { ta: 'தமிழக அரசியல் செய்திகள்', en: 'Politics News', title: 'தமிழக அரசியல் முக்கியச் செய்திகள் | Amaze Times' },
  districts: { ta: 'மாவட்டச் செய்திகள்', en: 'District News', title: 'தமிழக மாவட்டச் செய்திகள் உடனுக்குடன் | Amaze Times' },
  india: { ta: 'தேசியச் செய்திகள் (இந்தியா)', en: 'India National News', title: 'இந்தியா தேசிய முக்கியச் செய்திகள் | Amaze Times' },
  world: { ta: 'உலகச் செய்திகள்', en: 'World News', title: 'உலக நடப்புகள் & சர்வதேசச் செய்திகள் | Amaze Times' },
  business: { ta: 'வணிகம் & தங்கம் விலை', en: 'Business & Gold Rate', title: 'வணிகம் & நேரலை தங்கம் வெள்ளி விலை | Amaze Times' },
  cinema: { ta: 'சினிமா & திரைவிமர்சனம்', en: 'Tamil Cinema News', title: 'தமிழ் சினிமா செய்திகள் & விமர்சனம் | Amaze Times' },
  sports: { ta: 'விளையாட்டு & கிரிக்கெட்', en: 'Sports & Cricket News', title: 'விளையாட்டு & கிரிக்கெட் நேரலைச் செய்திகள் | Amaze' },
  magazine: { ta: 'மாதாந்திர இதழ்', en: 'Monthly Magazine', title: 'மாதாந்திர இதழ் & டிஜிட்டல் மின்-நாளிதழ் | Amaze Times' },
  epaper: { ta: 'தினசரி மின்-நாளிதழ் (Daily E-Paper)', en: 'Daily E-Newspaper', title: 'தினசரி மின்-நாளிதழ் (Daily E-Paper) | Amaze Times' },
  editorial: { ta: 'ஆசிரியர் தலையங்கம்', en: 'Editorial', title: 'ஆசிரியர் தலையங்கம் & சிறப்புப் பார்வை | Amaze Times' },
  spiritual: { ta: 'ஆன்மிகம் & தினசரி ராசிபலன்', en: 'Spiritual & Horoscope', title: 'ஆன்மிகம் & தினசரி 12 ராசிபலன் | Amaze Times' },
  blogs: { ta: 'வலைப்பதிவு & சிறுகதை', en: 'Blogs & Short Stories', title: 'வலைப்பதிவு & சிறுகதைகள் சிறப்புப் பகுதி | Amaze' }
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(str) {
  return String(str || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateSeoTitle(rawTitle, suffix = ' | Amaze Times', maxLen = 58) {
  let clean = stripHtml(rawTitle);
  if (!clean) return 'Amaze Times | அமேஸ் டைம்ஸ் - தமிழ் செய்திகள்';
  if (clean.length + suffix.length < 32) {
    clean = `${clean} - தமிழ் செய்திகள்`;
  }
  if (clean.length + suffix.length <= maxLen) return `${clean}${suffix}`;
  const budget = Math.max(20, maxLen - suffix.length - 1);
  return `${clean.slice(0, budget).trim()}…${suffix}`;
}

function categoryToSlug(category) {
  const c = String(category || '').toLowerCase();
  if (c.includes('தமிழ்நாடு') || c.includes('tamilnadu')) return 'tamilnadu';
  if (c.includes('அரசியல்') || c.includes('politic')) return 'politics';
  if (c.includes('சினிமா') || c.includes('cinema')) return 'cinema';
  if (c.includes('விளையாட்டு') || c.includes('sport')) return 'sports';
  if (c.includes('வணிகம்') || c.includes('business')) return 'business';
  if (c.includes('தேசியம்') || c.includes('india')) return 'india';
  if (c.includes('உலகம்') || c.includes('world')) return 'world';
  if (c.includes('கல்வி') || c.includes('education')) return 'tamilnadu';
  return 'tamilnadu';
}

export function buildArticleHref(art) {
  const catSlug = categoryToSlug(art.category);
  return `/news/${catSlug}/article-${art.id}`;
}

// 60-second in-memory cache of latest published news for sub-2ms SEO SSR rendering
let cachedLatestNews = null;
let cachedAt = 0;

async function getLatestNewsForSeo() {
  const now = Date.now();
  if (cachedLatestNews && now - cachedAt < 60000) {
    return cachedLatestNews;
  }
  try {
    const res = await query(`
      SELECT id, title, subtitle, summary, content, category, main_image, author_name, published_at, created_at
      FROM news
      WHERE status = 'published'
      ORDER BY is_lead_hero DESC, is_breaking DESC, COALESCE(published_at, created_at) DESC
      LIMIT 28
    `);
    cachedLatestNews = res.rows || [];
    cachedAt = now;
    return cachedLatestNews;
  } catch (err) {
    console.warn('⚠️ [SEO Renderer] DB fetch warning:', err.message);
    return cachedLatestNews || [];
  }
}

function extractArticleIdFromReq(req) {
  const qArt = req.query?.article;
  if (qArt && /^\d+$/.test(String(qArt).trim())) return String(qArt).trim();

  const p = req.path || '';
  if (p.startsWith('/news/') || p.startsWith('/article/')) {
    const match = p.match(/(?:article-|\/)(\d+)(?:\/)?$/i) || p.match(/-(\d+)(?:\/)?$/);
    if (match && match[1]) return match[1];
  }
  return null;
}

function buildNavHtml() {
  return `
    <header style="max-width:1200px;margin:0 auto;padding:16px 20px;border-bottom:1px solid #e2e8f0;">
      <nav aria-label="Primary Navigation" style="display:flex;flex-wrap:wrap;gap:14px;font-size:14px;font-weight:700;">
        <a href="/">முகப்பு (Home)</a>
        <a href="/category/tamilnadu">தமிழ்நாடு செய்திகள்</a>
        <a href="/category/politics">அரசியல்</a>
        <a href="/category/districts">மாவட்டச் செய்திகள்</a>
        <a href="/category/india">தேசியம் (India)</a>
        <a href="/category/world">உலகம் (World)</a>
        <a href="/category/business">வணிகம் &amp; தங்கம் நிலவரம்</a>
        <a href="/category/cinema">சினிமா &amp; திரைவிமர்சனம்</a>
        <a href="/category/sports">விளையாட்டு &amp; கிரிக்கெட்</a>
        <a href="/category/magazine">மாத இதழ் &amp; மின்-நாளிதழ்</a>
        <a href="/editorial">தலையங்கம் (Editorial)</a>
        <a href="/spiritual">ஆன்மிகம் &amp; ராசிபலன்</a>
        <a href="/blogs">வலைப்பதிவு &amp; சிறுகதை</a>
      </nav>
    </header>
  `;
}

function buildFooterHtml() {
  return `
    <footer style="max-width:1200px;margin:20px auto;padding:16px 20px;border-top:1px solid #e2e8f0;font-size:13px;">
      <p>© 2026 Amaze Times (அமேஸ் டைம்ஸ்) — நம்பகமான தமிழ் டிஜிட்டல் நாளிதழ் &amp; மாதாந்திர இதழ், சென்னை, தமிழ்நாடு.</p>
      <nav aria-label="Footer Links" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;">
        <a href="/">முகப்பு</a>
        <a href="/category/tamilnadu">தமிழ்நாடு</a>
        <a href="/category/politics">அரசியல்</a>
        <a href="/category/cinema">சினிமா</a>
        <a href="/category/sports">விளையாட்டு</a>
        <a href="/category/business">வணிகம்</a>
        <a href="/category/magazine">மாத இதழ் &amp; E-Paper</a>
        <a href="/editorial">தலையங்கம்</a>
        <a href="/spiritual">ராசிபலன்</a>
        <a href="/sitemap.xml">Sitemap</a>
      </nav>
    </footer>
  `;
}

function replaceMetaTags(html, { title, description, canonicalUrl, ogImage, ogType = 'website', extraJsonLd = '' }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeUrl = escapeHtml(canonicalUrl);
  const safeImg = escapeHtml(ogImage || `${BASE_URL}/og-image.jpg`);

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${safeTitle}"/>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${safeDesc}"/>`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${safeUrl}"/>`)
    .replace(/<link\s+rel="alternate"\s+hreflang="ta"\s+href="[^"]*"\s*\/?>/i, `<link rel="alternate" hreflang="ta" href="${safeUrl}"/>\n  <link rel="alternate" hreflang="ta-IN" href="${safeUrl}"/>`)
    .replace(/<link\s+rel="alternate"\s+hreflang="ta-IN"\s+href="[^"]*"\s*\/?>/i, `<link rel="alternate" hreflang="ta-IN" href="${safeUrl}"/>`)
    .replace(/<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/i, `<link rel="alternate" hreflang="x-default" href="${safeUrl}"/>`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${ogType}"/>`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${safeUrl}"/>`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}"/>`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${safeDesc}"/>`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${safeImg}"/>`)
    .replace(/<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:secure_url" content="${safeImg}"/>`)
    .replace(/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${safeUrl}"/>`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}"/>`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${safeDesc}"/>`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${safeImg}"/>`);

  if (extraJsonLd) {
    out = out.replace('</head>', `  <script type="application/ld+json">${extraJsonLd}</script>\n</head>`);
  }
  return out;
}

function injectRootContent(html, innerHtml) {
  const srOnlySeo = `<div style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${innerHtml}</div>`;
  return html.replace(/<div id="root">[\s\S]*?<\/div>(\s*(?:<script|<\/body>))/i, `<div id="root">${srOnlySeo}</div>$1`);
}

export async function renderSeoHtml(req, rawTemplateHtml) {
  const latestNews = await getLatestNewsForSeo();
  const articleId = extractArticleIdFromReq(req);
  const cleanPath = (req.path || '/').toLowerCase().replace(/\/$/, '') || '/';

  // 1. INDIVIDUAL NEWS ARTICLE PAGE SSR
  if (articleId) {
    let article = latestNews.find(a => String(a.id) === String(articleId));
    if (!article) {
      try {
        const res = await query(
          `SELECT id, title, subtitle, summary, content, category, main_image, author_name, published_at, created_at FROM news WHERE id = $1 LIMIT 1`,
          [articleId]
        );
        article = res.rows[0] || null;
      } catch (_) {}
    }

    if (article) {
      const title = truncateSeoTitle(article.title);
      // Strictly under 150 chars for meta description (Issue K: description > 155 chars)
      const description = stripHtml(article.summary || article.subtitle || article.content).slice(0, 148).trim();
      const canonicalUrl = `${BASE_URL}${buildArticleHref(article)}`;
      const imgUrl = article.main_image && article.main_image.startsWith('http')
        ? ensureHttpsUrl(article.main_image)
        : (article.main_image ? `${BASE_URL}${article.main_image.startsWith('/') ? '' : '/'}${article.main_image}` : `${BASE_URL}/og-image.jpg`);

      const cleanTitle = stripHtml(article.title);
      // Issue D: H1 over 70 characters. Keep H1 strictly under 65 characters!
      const h1Title = cleanTitle.length > 65 ? `${cleanTitle.slice(0, 62).trim()}…` : cleanTitle;
      
      // Issue H: Alt text over 100 characters. Keep Alt strictly under 90 characters!
      // Issue I: Missing Image Title.
      // Issue J: Missing Size Attributes (width & height).
      const cleanAlt = cleanTitle.slice(0, 90).trim();

      // Issue E & F: H2 Duplicate and Multiple. Single UNIQUE H2 per article page!
      const uniqueArticleH2 = `‘${escapeHtml(article.category || 'தமிழ்நாடு')}’ துறை சார்ந்த முக்கிய செய்திகள்`;

      const paragraphs = stripHtml(article.content || article.summary)
        .split(/\n+/)
        .filter(Boolean)
        .map(p => `<p style="margin-bottom:12px;">${escapeHtml(p)}</p>`)
        .join('\n');

      const relatedHtml = latestNews
        .filter(r => String(r.id) !== String(article.id))
        .slice(0, 12)
        .map(r => `<li style="margin-bottom:6px;"><a href="${buildArticleHref(r)}">${escapeHtml(r.title)}</a></li>`)
        .join('\n');

      const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: cleanTitle,
        description,
        image: [imgUrl],
        datePublished: article.published_at || article.created_at || new Date().toISOString(),
        author: { '@type': 'Person', name: article.author_name || 'Amaze Times Editorial Team' },
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: 'Amaze Times',
          logo: { '@type': 'ImageObject', url: `${BASE_URL}/og-image.jpg` }
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl }
      });

      const bodyHtml = `
        ${buildNavHtml()}
        <main style="max-width:1100px;margin:0 auto;padding:24px 20px;line-height:1.75;">
          <article>
            <p style="font-size:13px;font-weight:700;color:#b91c1c;">${escapeHtml(article.category || 'தமிழ்நாடு')} • ${escapeHtml(article.author_name || 'அமேஸ் டைம்ஸ் செய்திக்குழு')}</p>
            <h1 style="font-size:28px;font-weight:800;margin:8px 0 12px;" title="${escapeHtml(cleanTitle)}">${escapeHtml(h1Title)}</h1>
            ${cleanTitle.length > 65 ? `<p style="font-size:16px;font-weight:600;color:#334155;margin-bottom:12px;">${escapeHtml(cleanTitle)}</p>` : ''}
            ${article.subtitle ? `<p style="font-weight:700;margin-bottom:14px;">${escapeHtml(article.subtitle)}</p>` : ''}
            <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(cleanAlt)}" title="${escapeHtml(cleanAlt)}" width="1200" height="675" loading="lazy" decoding="async" style="max-width:100%;height:auto;border-radius:10px;margin-bottom:16px;" />
            ${paragraphs}
          </article>
          <section style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:16px;">
            <h2 style="font-size:20px;font-weight:800;margin-bottom:10px;">${uniqueArticleH2}</h2>
            <ul>${relatedHtml}</ul>
          </section>
        </main>
        ${buildFooterHtml()}
      `;

      let html = replaceMetaTags(rawTemplateHtml, {
        title,
        description,
        canonicalUrl,
        ogImage: imgUrl,
        ogType: 'article',
        extraJsonLd: jsonLd
      });
      return injectRootContent(html, bodyHtml);
    }
  }

  // 2. CATEGORY / EDITORIAL / SPIRITUAL / MAGAZINE / HOMEPAGE SSR
  let catKey = null;
  if (cleanPath.startsWith('/category/')) {
    catKey = cleanPath.replace('/category/', '').split('/')[0];
  } else if (cleanPath === '/editorial' || cleanPath === '/thalaiyangam') {
    catKey = 'editorial';
  } else if (cleanPath === '/spiritual' || cleanPath === '/aanmeegam') {
    catKey = 'spiritual';
  } else if (cleanPath === '/blogs' || cleanPath === '/valaipathivugal') {
    catKey = 'blogs';
  }

  const catInfo = catKey ? CATEGORY_META[catKey] : null;
  const pageTitle = catInfo
    ? catInfo.title
    : 'Amaze Times | அமேஸ் டைம்ஸ் - தமிழ் செய்திகள்';
  
  // Issue K: Keep descriptions strictly between 120 and 145 chars (<= 155 chars)
  const pageDesc = catInfo
    ? `${catInfo.ta} (${catInfo.en}) — அமேஸ் டைம்ஸ் வழங்கும் உடனுக்குடன் நம்பகமான தமிழ் செய்திகள் மற்றும் நேரலை தகவல்கள்.`
    : 'நம்பகமான தமிழ்நாடு, உலகம், சினிமா, விளையாட்டு செய்திகள், நேரலை தங்கம் விலை மற்றும் மின்-நாளிதழ் வழங்கும் முன்னணி தளம் - Amaze Times.';
  const canonicalUrl = cleanPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${cleanPath}`;

  // Issue D: Keep H1 strictly under 65 chars (<= 70 chars)
  const h1Text = catInfo
    ? `${catInfo.ta} | அமேஸ் டைம்ஸ்`
    : 'அமேஸ் டைம்ஸ் (Amaze Times) - தமிழ் செய்திகள்';

  // Issue E & F: Single UNIQUE H2 per category/homepage (eliminates duplicate & multiple H2s)
  const pageH2 = catInfo
    ? `‘${escapeHtml(catInfo.ta)}’ உடனுக்குடன் சிறப்புச் செய்திகள்`
    : 'இன்றைய முதன்மைச் செய்திகள் &amp; முக்கிய நிகழ்வுகள்';

  const topBreakingLinks = latestNews.slice(0, 12).map(a => `
    <article style="margin-bottom:14px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:4px;">
        <a href="${buildArticleHref(a)}">${escapeHtml(a.title)}</a>
      </h3>
      <p style="font-size:13px;color:#334155;">${escapeHtml(stripHtml(a.summary || a.content).slice(0, 180))}</p>
    </article>
  `).join('\n');

  const moreNewsLinks = latestNews.slice(12, 26).map(a => `
    <li style="margin-bottom:6px;">
      <a href="${buildArticleHref(a)}">${escapeHtml(a.title)}</a>
      <span style="font-size:12px;color:#64748b;"> (${escapeHtml(a.category || 'தமிழ்நாடு')})</span>
    </li>
  `).join('\n');

  const bodyHtml = `
    ${buildNavHtml()}
    <main style="max-width:1200px;margin:0 auto;padding:24px 20px;line-height:1.7;">
      <h1 style="font-size:28px;font-weight:800;margin-bottom:12px;">${escapeHtml(h1Text)}</h1>
      <p style="margin-bottom:18px;">அமேஸ் டைம்ஸ் (Amaze Times) தமிழ்நாடு, இந்தியா மற்றும் உலகம் முழுவதும் நடைபெறும் முக்கிய நிகழ்வுகளை உடனுக்குடன், நடுநிலையாகவும் துல்லியமாகவும் வழங்கும் முன்னணி தமிழ் டிஜிட்டல் செய்தி நாளிதழ் மற்றும் மாதாந்திர இதழ் தளமாகும். அரசியல், மாவட்டச் செய்திகள், வணிகம், நேரலை தங்கம் வெள்ளி விலை, கல்வி, சினிமா, விளையாட்டு மற்றும் தினசரி 12 ராசிபலன் அனைத்தையும் ஒரே தளத்தில் படிக்கலாம்.</p>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:21px;font-weight:800;margin-bottom:10px;">${pageH2}</h2>
        ${topBreakingLinks}
      </section>

      <section style="margin-bottom:24px;">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:10px;">தமிழ்நாடு, அரசியல், சினிமா &amp; விளையாட்டு செய்திகள்</h3>
        <ul>${moreNewsLinks}</ul>
      </section>

      <section style="margin-bottom:24px;">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:10px;">மாதாந்திர இதழ், தினசரி மின்-நாளிதழ் &amp; தினசரி ராசிபலன்</h3>
        <p>அமேஸ் டைம்ஸ் <a href="/category/magazine">மாதாந்திர இதழ் மற்றும் தினசரி மின்-நாளிதழை (E-Paper)</a> முழுத்திரை 3D பக்கம் திருப்பும் வசதியுடன் இலவசமாகப் படிக்கவும் PDF ஆகப் பதிவிறக்கவும் முடியும். மேலும் <a href="/spiritual">தினசரி ராசிபலன் &amp; பஞ்சாங்கம்</a>, <a href="/editorial">ஆசிரியர் தலையங்கம்</a>, <a href="/category/cinema">சினிமா செய்திகள்</a>, <a href="/category/sports">விளையாட்டுச் செய்திகள்</a> மற்றும் <a href="/category/business">நேரலை தங்கம் வெள்ளி விலை</a> விவரங்களை தினமும் உடனுக்குடன் அறிந்துகொள்ளுங்கள்.</p>
      </section>
    </main>
    ${buildFooterHtml()}
  `;

  let html = replaceMetaTags(rawTemplateHtml, {
    title: pageTitle,
    description: pageDesc,
    canonicalUrl
  });
  return injectRootContent(html, bodyHtml);
}
