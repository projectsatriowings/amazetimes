/**
 * Tamil-to-Slug & Daily Thanthi Style URL Generator
 * Converts any news title into an SEO-friendly URL slug:
 * e.g. /news/cinema/veliyeettirku-munbe-105-kodi-munpathivu-vasool-ramayanam-thiraippadam-169
 */

const TAMIL_VOWELS = {
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
  'எ': 'e', 'ஏ': 'ae', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oa', 'ஔ': 'au', 'ஃ': 'k'
};

const TAMIL_CONSONANTS = {
  'க': 'ka', 'ங': 'nga', 'ச': 'sa', 'ஞ': 'nya', 'ட': 'ta', 'ண': 'na',
  'த': 'tha', 'ந': 'na', 'ப': 'pa', 'ம': 'ma', 'ய': 'ya', 'ர': 'ra',
  'ல': 'la', 'வ': 'va', 'ழ': 'zha', 'ள': 'la', 'ற': 'ra', 'ன': 'na',
  'ஜ': 'ja', 'ஷ': 'sha', 'ஸ': 'sa', 'ஹ': 'ha', 'க்ஷ': 'ksha'
};

const TAMIL_VOWEL_SIGNS = {
  'ா': 'aa', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
  'ெ': 'e', 'ே': 'ae', 'ை': 'ai', 'ொ': 'o', 'ோ': 'oa', 'ௌ': 'au'
};

const CATEGORY_MAP = {
  'all': 'news',
  'tamilnadu': 'tamilnadu',
  'தமிழ்நாடு': 'tamilnadu',
  'districts': 'districts',
  'மாவட்டங்கள்': 'districts',
  'மாவட்டம்': 'districts',
  'cinema': 'cinema',
  'சினிமா': 'cinema',
  'sports': 'sports',
  'விளையாட்டு': 'sports',
  'business': 'business',
  'வணிகம்': 'business',
  'spiritual': 'spiritual',
  'ஆன்மிகம்': 'spiritual',
  'india': 'india',
  'தேசியம்': 'india',
  'world': 'world',
  'உலகம்': 'world',
  'editorial': 'editorial',
  'தலையங்கம்': 'editorial',
  'blogs': 'blogs',
  'வலைப்பதிவுகள்': 'blogs',
  'magazine': 'magazine',
  'மாத இதழ்': 'magazine'
};

/**
 * Transliterates Tamil text into phonetic Latin/English
 */
export function transliterateTamil(text = '') {
  if (!text) return '';
  let clean = String(text)
    .replace(/ரூ\.?\s*(\d+)/gi, '$1-rupees-')
    .replace(/₹\s*(\d+)/g, '$1-rupees-')
    .replace(/%/g, '-percent-');

  let result = '';
  const len = clean.length;
  let i = 0;

  while (i < len) {
    const char = clean[i];
    const nextChar = i + 1 < len ? clean[i + 1] : '';

    // Check independent vowel
    if (TAMIL_VOWELS[char]) {
      result += TAMIL_VOWELS[char];
      i++;
      continue;
    }

    // Check consonant
    if (TAMIL_CONSONANTS[char]) {
      const baseSyl = TAMIL_CONSONANTS[char]; // e.g. "ka"
      const root = baseSyl.slice(0, -1);      // e.g. "k"

      if (nextChar === '்') {
        // Pulli (virama) -> consonant only
        result += root;
        i += 2;
        continue;
      }

      if (TAMIL_VOWEL_SIGNS[nextChar]) {
        // Combined vowel sign
        result += root + TAMIL_VOWEL_SIGNS[nextChar];
        i += 2;
        continue;
      }

      // Inherent 'a' vowel
      result += baseSyl;
      i++;
      continue;
    }

    // Standard English letters / digits
    if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
      i++;
      continue;
    }

    // Whitespace / punctuation
    if (/[\s\-_,.:;!?'"/\\()]+/.test(char)) {
      result += '-';
      i++;
      continue;
    }

    i++;
  }

  // Clean duplicate hyphens
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Normalizes category name into clean URL key (e.g. cinema, tamilnadu)
 */
export function getCategoryKey(cat = '') {
  const clean = String(cat || '').trim().toLowerCase();
  return CATEGORY_MAP[clean] || 'news';
}

/**
 * Generates Daily Thanthi style clean SEO slug
 * Format: /news/[category]/[transliterated-title]-[id]
 */
export function generateArticleUrl(article) {
  if (!article) return '/';
  const id = article.id || article._id || '';
  const categoryKey = getCategoryKey(article.category || article.category_name || article.category_id);
  
  const rawTitle = article.title || article.headline || 'news';
  let slug = transliterateTamil(rawTitle);
  
  // Truncate slug to reasonable length (up to 70 chars) without breaking words
  if (slug.length > 70) {
    slug = slug.substring(0, 70).replace(/-[^-]*$/, '');
  }
  
  if (!slug) slug = 'article';
  
  return `/news/${categoryKey}/${slug}-${id}`;
}

/**
 * Extracts article ID and category from URL path
 * Matches:
 * - /news/cinema/veliyeettirku-munbe-169
 * - /news/tamilnadu/169
 * - /news/169
 * - /article/169
 */
export function parseArticleUrl(pathname = '') {
  const clean = String(pathname || '').replace(/\/$/, '');
  const match = clean.match(/^\/news\/([a-zA-Z0-9_-]+)\/(.+)$/);
  if (match) {
    const category = match[1];
    const slugWithId = match[2];
    const idMatch = slugWithId.match(/-?(\d+)$/);
    return {
      category,
      slug: slugWithId,
      id: idMatch ? idMatch[1] : slugWithId
    };
  }

  const shortMatch = clean.match(/^\/(?:news|article)\/(\d+)$/);
  if (shortMatch) {
    return {
      category: 'news',
      slug: shortMatch[1],
      id: shortMatch[1]
    };
  }

  return null;
}

