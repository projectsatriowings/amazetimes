// Utility for Tamil and English month formatting and generation

export const TAMIL_MONTHS = [
  { index: 0, en: 'January', ta: 'ஜனவரி', shortEn: 'Jan' },
  { index: 1, en: 'February', ta: 'பிப்ரவரி', shortEn: 'Feb' },
  { index: 2, en: 'March', ta: 'மார்ச்', shortEn: 'Mar' },
  { index: 3, en: 'April', ta: 'ஏப்ரல்', shortEn: 'Apr' },
  { index: 4, en: 'May', ta: 'மே', shortEn: 'May' },
  { index: 5, en: 'June', ta: 'ஜூன்', shortEn: 'Jun' },
  { index: 6, en: 'July', ta: 'ஜூலை', shortEn: 'Jul' },
  { index: 7, en: 'August', ta: 'ஆகஸ்ட்', shortEn: 'Aug' },
  { index: 8, en: 'September', ta: 'செப்டம்பர்', shortEn: 'Sept' },
  { index: 9, en: 'October', ta: 'அக்டோபர்', shortEn: 'Oct' },
  { index: 10, en: 'November', ta: 'நவம்பர்', shortEn: 'Nov' },
  { index: 11, en: 'December', ta: 'டிசம்பர்', shortEn: 'Dec' },
];

/**
 * Returns month & year string in English format (e.g. "October 2026"), matching DB storage.
 */
export const getMonthYearString = (dateInput = new Date()) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return 'October 2026';
  const m = TAMIL_MONTHS[d.getMonth()];
  return `${m?.en || 'October'} ${d.getFullYear()}`;
};

/**
 * Converts a month string like "October 2026" or "அக்டோபர் 2026" into a bilingual label:
 * "அக்டோபர் 2026 (October 2026)"
 */
export const getMonthLabel = (monthYearStr) => {
  if (!monthYearStr) return '';
  const cleanStr = String(monthYearStr).trim();

  // If already formatted like "அக்டோபர் 2026 (October 2026)"
  if (cleanStr.includes('(') && cleanStr.includes(')')) {
    return cleanStr;
  }

  const parts = cleanStr.split(' ');
  if (parts.length >= 2) {
    const monthWord = parts[0];
    const yearWord = parts[1];

    const found = TAMIL_MONTHS.find(
      (m) =>
        m.en.toLowerCase() === monthWord.toLowerCase() ||
        m.shortEn.toLowerCase() === monthWord.toLowerCase() ||
        m.ta === monthWord
    );

    if (found) {
      return `${found.ta} ${yearWord} (${found.en} ${yearWord})`;
    }
  }

  return cleanStr;
};

/**
 * Parses monthYearStr (e.g. "October 2026") into numeric order weight for descending sort.
 */
const getMonthWeight = (monthYearStr) => {
  if (!monthYearStr) return 0;
  const parts = String(monthYearStr).trim().split(' ');
  if (parts.length >= 2) {
    const monthWord = parts[0];
    const yearNum = parseInt(parts[1], 10) || 2026;
    const found = TAMIL_MONTHS.find(
      (m) =>
        m.en.toLowerCase() === monthWord.toLowerCase() ||
        m.shortEn.toLowerCase() === monthWord.toLowerCase() ||
        m.ta === monthWord
    );
    const mIdx = found ? found.index : 0;
    return yearNum * 12 + mIdx;
  }
  return 0;
};

/**
 * Generates an array of month options { value, label } sorted newest first.
 * Strictly includes only current month and previous months/years (no future values).
 */
export const getAvailableMonths = (extraMonths = []) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const maxWeight = currentYear * 12 + currentMonthIndex;

  const monthMap = new Map();

  // 1. Generate months from current year down to 2021
  const minYear = 2021;
  for (let yr = currentYear; yr >= minYear; yr--) {
    // For current year, start strictly from current month index down to 0 (no future months!)
    // For past years, start from December (11) down to 0
    const startMIdx = yr === currentYear ? currentMonthIndex : 11;
    for (let mIdx = startMIdx; mIdx >= 0; mIdx--) {
      const m = TAMIL_MONTHS[mIdx];
      const val = `${m.en} ${yr}`;
      monthMap.set(val, {
        value: val,
        label: `${m.ta} ${yr} (${m.en} ${yr})`,
        weight: yr * 12 + mIdx
      });
    }
  }

  // 2. Include any extra months from DB records, STRICTLY filtering out any future months
  if (Array.isArray(extraMonths)) {
    extraMonths.forEach((item) => {
      const val = typeof item === 'string' ? item : item?.month;
      if (val) {
        const weight = getMonthWeight(val);
        // Only accept past or current months
        if (weight <= maxWeight && !monthMap.has(val)) {
          monthMap.set(val, {
            value: val,
            label: getMonthLabel(val),
            weight: weight
          });
        }
      }
    });
  }

  return Array.from(monthMap.values()).sort((a, b) => b.weight - a.weight);
};
