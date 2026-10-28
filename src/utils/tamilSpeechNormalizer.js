/**
 * Tamil Speech Normalizer & AI Voice Reader Preprocessor
 * Brand: Amaze Times
 * 
 * Ensures 100% natural, fluent Tamil speech synthesis by converting
 * numbers, currencies, percentages, acronyms, and abbreviations, while
 * strictly removing punctuation that would cause voice engines to pronounce "புள்ளி" (pulli).
 */

const ONES = ['', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது'];

const TEENS = [
  'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதின்மூன்று', 'பதினான்கு',
  'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'
];

const TENS_EXACT = [
  '', '', 'இருபது', 'முப்பது', 'நாற்பது', 'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'
];

const TENS_PREFIX = [
  '', '', 'இருபத்து', 'முப்பத்து', 'நாற்பத்து', 'ஐம்பத்து', 'அறுபத்து', 'எழுபத்து', 'எண்பத்து', 'தொண்ணூற்று'
];

const HUNDREDS_EXACT = [
  '', 'நூறு', 'இருநூறு', 'முந்நூறு', 'நானூறு', 'ஐந்நூறு', 'அறுநூறு', 'எழுநூறு', 'எண்நூறு', 'தொள்ளாயிரம்'
];

const HUNDREDS_PREFIX = [
  '', 'நூற்று', 'இருநூற்று', 'முந்நூற்று', 'நானூற்று', 'ஐந்நூற்று', 'அறுநூற்று', 'எழுநூற்று', 'எண்நூற்று', 'தொள்ளாயிரத்து'
];

function convertUnder100(n) {
  if (n === 0) return '';
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const tens = Math.floor(n / 10);
  const rem = n % 10;
  if (rem === 0) return TENS_EXACT[tens];
  return `${TENS_PREFIX[tens]} ${ONES[rem]}`;
}

function convertUnder1000(n) {
  if (n === 0) return '';
  if (n < 100) return convertUnder100(n);
  const h = Math.floor(n / 100);
  const rem = n % 100;
  if (rem === 0) return HUNDREDS_EXACT[h];
  return `${HUNDREDS_PREFIX[h]} ${convertUnder100(rem)}`.trim();
}

/**
 * Converts any integer (0 to 99,99,99,999) into fluent Tamil phonetic words
 * Handling tens, hundreds, thousands, lakhs, and crores.
 * @param {number|string} num
 * @returns {string}
 */
export function numberToTamilWords(num) {
  if (num === null || num === undefined || num === '') return '';
  let n = typeof num === 'string' ? parseInt(num.replace(/,/g, '').trim(), 10) : Math.floor(num);
  if (isNaN(n)) return '';
  if (n === 0) return 'பூஜ்ஜியம்';
  if (n < 0) return 'மைனஸ் ' + numberToTamilWords(-n);

  const parts = [];

  // Crores (கோடி: 1,00,00,000)
  if (n >= 10000000) {
    const cr = Math.floor(n / 10000000);
    n = n % 10000000;
    const crWords = cr === 1 ? 'ஒரு' : numberToTamilWords(cr);
    if (n === 0) {
      parts.push(`${crWords} கோடி`);
    } else {
      parts.push(`${crWords} கோடியே`);
    }
  }

  // Lakhs (லட்சம்: 1,00,000)
  if (n >= 100000) {
    const lk = Math.floor(n / 100000);
    n = n % 100000;
    const lkWords = lk === 1 ? 'ஒரு' : numberToTamilWords(lk);
    if (n === 0) {
      parts.push(`${lkWords} லட்சம்`);
    } else {
      parts.push(`${lkWords} லட்சத்து`);
    }
  }

  // Thousands (ஆயிரம்: 1,000)
  if (n >= 1000) {
    const th = Math.floor(n / 1000);
    n = n % 1000;
    const thWords = th === 1 ? '' : numberToTamilWords(th);
    if (n === 0) {
      parts.push(th === 1 ? 'ஆயிரம்' : `${thWords} ஆயிரம்`);
    } else {
      parts.push(th === 1 ? 'ஆயிரத்து' : `${thWords} ஆயிரத்து`);
    }
  }

  // Hundreds & below (0 - 999)
  if (n > 0) {
    parts.push(convertUnder1000(n));
  }

  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Convert decimal numbers (e.g., 4.5 -> "நான்கு புள்ளி ஐந்து")
 */
export function decimalToTamilWords(str) {
  if (!str) return '';
  const clean = String(str).replace(/,/g, '');
  const [whole, dec] = clean.split('.');
  const wholeWords = numberToTamilWords(whole);
  if (!dec) return wholeWords;
  const decWords = dec
    .split('')
    .map(d => {
      const idx = parseInt(d, 10);
      return isNaN(idx) ? '' : (ONES[idx] || 'பூஜ்ஜியம்');
    })
    .filter(Boolean)
    .join(' ');
  return `${wholeWords} புள்ளி ${decWords}`;
}

export const ACRONYMS = {
  'AI': 'ஏஐ',
  'ISRO': 'இஸ்ரோ',
  'IPL': 'ஐபிஎல்',
  'CM': 'சிஎம்',
  'PM': 'பிஎம்',
  'IT': 'ஐடி',
  'BJP': 'பாஜக',
  'DMK': 'திமுக',
  'ADMK': 'அதிமுக',
  'AIADMK': 'அதிமுக',
  'TV': 'டிவி',
  'CCTV': 'சிசிடிவி',
  'GPS': 'ஜிபிஎஸ்',
  'NASA': 'நாசா',
  'RBI': 'ஆர்பிஐ',
  'SBI': 'எஸ்பிஐ',
  'OTP': 'ஓடிபி',
  'SMS': 'எஸ்எம்எஸ்',
  'COVID-19': 'கோவிட்',
  'COVID': 'கோவிட்',
  'T20': 'டி20'
};

export const ABBREVIATIONS = [
  { pattern: /கி\.மீ\.?/g, replacement: 'கிலோமீட்டர் ' },
  { pattern: /செ\.மீ\.?/g, replacement: 'சென்டிமீட்டர் ' },
  { pattern: /மி\.மீ\.?/g, replacement: 'மில்லிமீட்டர் ' },
  { pattern: /பி\.ஜே\.பி\.?/g, replacement: 'பாஜக ' },
  { pattern: /டி\.வி\.?/g, replacement: 'டிவி ' },
  { pattern: /எ\.கா\.?/g, replacement: 'எடுத்துக்காட்டாக ' },
  { pattern: /மு\.ப\.?/g, replacement: 'முற்பகல் ' },
  { pattern: /பி\.ப\.?/g, replacement: 'பிற்பகல் ' },
  { pattern: /வ\.எண்\.?/g, replacement: 'வரிசை எண் ' },
  { pattern: /தொ\.பே\.?/g, replacement: 'தொலைபேசி ' },
  { pattern: /பக்\.?/g, replacement: 'பக்கம் ' },
  { pattern: /\bDr\.?/gi, replacement: 'டாக்டர் ' },
  { pattern: /\bMr\.?/gi, replacement: 'திரு ' },
  { pattern: /\bMrs\.?/gi, replacement: 'திருமதி ' }
];

/**
 * Normalizes raw Tamil news text for crystal-clear TTS pronunciation:
 * - Strips HTML tags, markdown, and URLs
 * - Normalizes currencies (ரூ./₹/Rs.) into {words} ரூபாய்
 * - Normalizes percentages (50% -> ஐம்பது சதவீதம்)
 * - Normalizes common abbreviations (கி.மீ. -> கிலோமீட்டர், செ.மீ. -> சென்டிமீட்டர், பி.ஜே.பி. -> பாஜக, டி.வி. -> டிவி)
 * - CRITICAL: Strips dots from Tamil initials (e.g., மு.க.ஸ்டாலின் -> மு க ஸ்டாலின், கே.செந்தில் -> கே செந்தில்) to prevent voice engines from vocalizing "புள்ளி"
 * - Replaces ellipses ... and colons/semicolons with commas for natural breathing pauses
 * - Phonetically expands English acronyms (AI -> ஏஐ, ISRO -> இஸ்ரோ, IPL -> ஐபிஎல், CM -> சிஎம், PM -> பிஎம்)
 * 
 * @param {string} rawText
 * @returns {string}
 */
export function normalizeTamilForSpeech(rawText) {
  if (!rawText) return '';
  let str = String(rawText);

  // 1. Strip URLs
  str = str.replace(/https?:\/\/[^\s]+/gi, ' ');

  // 2. Strip Markdown syntax
  str = str
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/^#+\s+/gm, '') // # Headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // **bold**
    .replace(/(\*|_)(.*?)\1/g, '$2') // *italic*
    .replace(/`([^`]+)`/g, '$1'); // `code`

  // 3. Strip HTML tags & decode common entities
  str = str.replace(/<[^>]+>/g, ' ');
  str = str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, ' மற்றும் ')
    .replace(/&quot;/g, ' ')
    .replace(/&#39;/g, ' ')
    .replace(/&lt;/g, ' ')
    .replace(/&gt;/g, ' ');

  // 4. Ellipses and colons/semicolons -> commas for natural breathing pauses
  str = str.replace(/\.{3,}/g, ' , ');
  str = str.replace(/…/g, ' , ');
  str = str.replace(/[:;]/g, ' , ');

  // 5. Common abbreviations (before dot stripping so abbreviations with dots match)
  for (const { pattern, replacement } of ABBREVIATIONS) {
    str = str.replace(pattern, replacement);
  }

  // 6. Phonetically expand English acronyms
  for (const [key, val] of Object.entries(ACRONYMS)) {
    const reg = new RegExp(`\\b${key}\\b`, 'g');
    str = str.replace(reg, val);
  }

  // 7. Currencies: "ரூ. 45,000", "ரூ.45,000", "₹45,000", "Rs. 45000"
  str = str.replace(/(?:ரூ\.?|₹|Rs\.?)\s*([\d,]+(?:\.\d+)?)/gi, (_, numStr) => {
    const cleanNum = numStr.replace(/,/g, '');
    const words = cleanNum.includes('.') ? decimalToTamilWords(cleanNum) : numberToTamilWords(cleanNum);
    return `${words} ரூபாய் `;
  });

  // Standalone "ரூ." without dot -> "ரூபாய் "
  str = str.replace(/ரூ\./g, 'ரூபாய் ');
  str = str.replace(/ரூ\b/g, 'ரூபாய் ');

  // 8. Percentages: 50% -> ஐம்பது சதவீதம், 4.5% -> நான்கு புள்ளி ஐந்து சதவீதம்
  str = str.replace(/([\d,]+(?:\.\d+)?)\s*%/g, (_, numStr) => {
    const cleanNum = numStr.replace(/,/g, '');
    const words = cleanNum.includes('.') ? decimalToTamilWords(cleanNum) : numberToTamilWords(cleanNum);
    return `${words} சதவீதம் `;
  });

  // 9. CRITICAL: Strip dots from Tamil initials (e.g. மு.க.ஸ்டாலின் -> மு க ஸ்டாலின், கே.செந்தில் -> கே செந்தில்)
  // Prevents voice engines from reading "புள்ளி" (pulli)
  str = str.replace(/((?:[\u0B80-\u0BFA][\u0BBE-\u0BCD]?){1,3})\./g, '$1 ');

  // English initials with dots: e.g. "M.K." -> "M K "
  str = str.replace(/\b([A-Za-z])\./g, '$1 ');

  // 10. Standalone numbers with commas or digits (0 to 99,99,99,999)
  str = str.replace(/\b[\d,]+(?:\.\d+)?\b/g, (match) => {
    const cleanNum = match.replace(/,/g, '');
    if (!/^\d+(\.\d+)?$/.test(cleanNum)) return match;
    if (cleanNum.includes('.')) {
      return decimalToTamilWords(cleanNum);
    }
    const val = parseInt(cleanNum, 10);
    if (isNaN(val)) return match;
    return numberToTamilWords(val);
  });

  // 11. Clean up symbols that cause literal punctuation reading or halts
  str = str.replace(/["'“”‘’]/g, '');
  str = str.replace(/[()\[\]{}]/g, ' , ');
  str = str.replace(/[-–—/\\|]/g, ' ');

  // 12. Normalize commas and excessive whitespace
  str = str.replace(/,\s*,+/g, ',');
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

// Full backwards-compatible alias
export const normalizeTamilSpeech = normalizeTamilForSpeech;

/**
 * Splits normalized Tamil text into chunks of max ~150 chars,
 * respecting sentence boundaries, commas, and word boundaries.
 */
export function chunkTamilText(text, maxChars = 150) {
  if (!text) return [];
  const normalized = normalizeTamilForSpeech(text);
  if (!normalized) return [];

  const rawSentences = normalized.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const s of rawSentences) {
    const sentence = s.trim();
    if (!sentence) continue;

    if (sentence.length <= maxChars) {
      if ((currentChunk + ' ' + sentence).trim().length <= maxChars) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      const clauses = sentence.split(/(?<=,)\s+/);
      for (const clause of clauses) {
        if (clause.length <= maxChars) {
          if ((currentChunk + ' ' + clause).trim().length <= maxChars) {
            currentChunk = (currentChunk + ' ' + clause).trim();
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = clause;
          }
        } else {
          if (currentChunk) {
            chunks.push(currentChunk);
            currentChunk = '';
          }
          const words = clause.split(/\s+/);
          for (const word of words) {
            if ((currentChunk + ' ' + word).trim().length <= maxChars) {
              currentChunk = (currentChunk + ' ' + word).trim();
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = word;
            }
          }
        }
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

export default {
  numberToTamilWords,
  decimalToTamilWords,
  normalizeTamilForSpeech,
  normalizeTamilSpeech,
  chunkTamilText,
  ACRONYMS,
  ABBREVIATIONS
};
