/**
 * Search and Keyword Utility for Adutha Thalaimurai
 *
 * Provides curated trending keywords, clean search normalization,
 * multi-term Tamil relevance scoring, and keyword matching.
 */

export const TRENDING_KEYWORDS = [
  {
    id: 'kw-1',
    tag: '#தமிழக_தொழில்_முதலீடு',
    label: 'தமிழக தொழில் முதலீடு',
    searchTerms: ['தொழில்', 'முதலீடு', 'தொழிற்பேட்டை'],
    primaryQuery: 'தொழில் முதலீடு',
    category: 'வணிகம்',
    badge: 'Trending 🔥'
  },
  {
    id: 'kw-2',
    tag: '#தங்கம்_விலை_நிலவரம்',
    label: 'தங்கம் விலை நிலவரம்',
    searchTerms: ['தங்கம்', 'விலை', 'வெள்ளி', 'பவுன்'],
    primaryQuery: 'தங்கம் விலை',
    category: 'வணிகம்',
    badge: 'Live 💰'
  },
  {
    id: 'kw-3',
    tag: '#செமிகண்டக்டர்_மிஷன்',
    label: 'செமிகண்டக்டர் மிஷன்',
    searchTerms: ['செமிகண்டக்டர்', 'உற்பத்தி', 'தொழில்நுட்பம்'],
    primaryQuery: 'செமிகண்டக்டர்',
    category: 'வணிகம்',
    badge: 'Hot ⚡'
  },
  {
    id: 'kw-4',
    tag: '#மதுரை_மீனாட்சி_கோயில்',
    label: 'மதுரை மீனாட்சி கோயில்',
    searchTerms: ['மீனாட்சி', 'மதுரை', 'கோயில்', 'திருவிழா'],
    primaryQuery: 'மீனாட்சி கோயில்',
    category: 'ஆன்மிகம்',
    badge: 'Spiritual 🪔'
  },
  {
    id: 'kw-5',
    tag: '#மாவட்ட_செய்திகள்',
    label: 'மாவட்டச் செய்திகள்',
    searchTerms: ['மாவட்டம்', 'சென்னை', 'மதுரை', 'கோவை', 'திருச்சி', 'சேலம்'],
    primaryQuery: 'மாவட்டம்',
    category: 'மாவட்டங்கள்',
    badge: 'Local 📍'
  },
  {
    id: 'kw-6',
    tag: '#சினிமா_விமர்சனம்',
    label: 'சினிமா விமர்சனம்',
    searchTerms: ['சினிமா', 'படம்', 'தளபதி', 'நடிகர்', 'விமர்சனம்'],
    primaryQuery: 'சினிமா',
    category: 'சினிமா',
    badge: 'Entertainment 🎬'
  }
];

/**
 * Normalizes Tamil/English search terms (removes hashtags, underscores, extra spaces)
 */
export const normalizeQuery = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/^#+/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();
};

/**
 * Extracts searchable tokens from a query string
 */
export const tokenizeQuery = (query) => {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];
  return normalized
    .split(/\s+/)
    .filter((token) => token.length > 0);
};

/**
 * Searches and ranks news articles based on title, tags, SEO keywords, summary, category, district
 */
export const searchNewsArticles = (articles = [], rawQuery = '', categoryFilter = 'all') => {
  if (!Array.isArray(articles) || articles.length === 0) return [];

  const query = normalizeQuery(rawQuery);
  const tokens = tokenizeQuery(query);

  let filtered = articles.filter((a) => a.status === 'published' || !a.status);

  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter(
      (a) => a.category?.toLowerCase() === categoryFilter.toLowerCase()
    );
  }

  // If no query, return articles sorted by latest
  if (!query || tokens.length === 0) {
    return filtered;
  }

  // Score and rank articles
  const scored = [];

  for (const article of filtered) {
    const title = (article.title || '').toLowerCase();
    const summary = (article.summary || (Array.isArray(article.paragraphs) ? article.paragraphs[0] : '') || '').toLowerCase();
    const content = (article.content || '').toLowerCase();
    const category = (article.category || '').toLowerCase();
    const district = (article.district || '').toLowerCase();
    const tags = (typeof article.tags === 'string' ? article.tags : Array.isArray(article.tags) ? article.tags.join(' ') : '').toLowerCase();
    const seoKeywords = (typeof article.seoKeywords === 'string' ? article.seoKeywords : '').toLowerCase();

    let score = 0;
    let matchedTerms = new Set();

    // 1. Exact full query match
    if (title.includes(query)) {
      score += 30;
      matchedTerms.add(query);
    }
    if (tags.includes(query) || seoKeywords.includes(query)) {
      score += 25;
      matchedTerms.add(query);
    }
    if (summary.includes(query)) {
      score += 15;
      matchedTerms.add(query);
    }

    // 2. Token-by-token matches
    for (const token of tokens) {
      if (token.length < 2) continue;

      if (title.includes(token)) {
        score += 12;
        matchedTerms.add(token);
      }
      if (tags.includes(token) || seoKeywords.includes(token)) {
        score += 10;
        matchedTerms.add(token);
      }
      if (summary.includes(token)) {
        score += 6;
        matchedTerms.add(token);
      }
      if (category.includes(token) || district.includes(token)) {
        score += 5;
        matchedTerms.add(token);
      }
      if (content.includes(token)) {
        score += 2;
        matchedTerms.add(token);
      }
    }

    // Check against curated trending keyword synonyms
    for (const kw of TRENDING_KEYWORDS) {
      const isKwMatch =
        query.includes(normalizeQuery(kw.tag)) ||
        query.includes(normalizeQuery(kw.label)) ||
        tokens.some((t) => kw.searchTerms.some((st) => st.includes(t) || t.includes(st)));

      if (isKwMatch) {
        for (const st of kw.searchTerms) {
          if (title.includes(st) || tags.includes(st) || summary.includes(st)) {
            score += 8;
            matchedTerms.add(st);
          }
        }
      }
    }

    if (score > 0) {
      scored.push({
        ...article,
        searchScore: score,
        matchedTermsCount: matchedTerms.size
      });
    }
  }

  // Sort by highest score first, then by latest createdAt/id
  return scored.sort((a, b) => {
    if (b.searchScore !== a.searchScore) {
      return b.searchScore - a.searchScore;
    }
    const timeA = new Date(a.createdAt || a.publishedAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.publishedAt || 0).getTime();
    return timeB - timeA;
  });
};
