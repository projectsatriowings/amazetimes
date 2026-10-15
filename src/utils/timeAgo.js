/**
 * Smart Relative Time Formatter for News Articles in Tamil
 *
 * Requirements:
 * - Shows exact time difference from when the news was added.
 * - Under 1 minute: "சற்றுமுன்" (Just now)
 * - Under 60 minutes: "X நிமிடங்களுக்கு முன்" (e.g. 15 நிமிடங்களுக்கு முன்)
 * - Under 23 hours: "X மணி நேரத்திற்கு முன்" (e.g. 4 மணி நேரத்திற்கு முன்)
 * - After 23 hours reach: "1 நாள் முன்பு" (1 day ago)
 * - 2 to 6 days: "X நாட்களுக்கு முன்" (e.g. 2 நாட்களுக்கு முன்)
 * - 1 to 4 weeks: "X வாரங்களுக்கு முன்" (e.g. 1 வாரம் முன்பு)
 * - 1 to 12 months: "X மாதங்களுக்கு முன்" (e.g. 1 மாதம் முன்பு)
 * - 1+ years: "X வருடங்களுக்கு முன்"
 */

export const formatRelativeTime = (rawDate) => {
  if (!rawDate) return 'சற்றுமுன்';

  let dateObj = null;

  if (rawDate instanceof Date) {
    dateObj = rawDate;
  } else if (typeof rawDate === 'number') {
    dateObj = new Date(rawDate < 1e12 ? rawDate * 1000 : rawDate);
  } else if (typeof rawDate === 'string' && rawDate.trim()) {
    const trimmed = rawDate.trim();

    // Check if it's already a relative Tamil phrase (e.g., '10 நிமிடங்களுக்கு முன்')
    if (
      trimmed.includes('நிமிட') ||
      trimmed.includes('மணி') ||
      trimmed.includes('நாள்') ||
      trimmed.includes('வாரம்') ||
      trimmed.includes('மாதம்') ||
      trimmed.includes('சற்றுமுன்')
    ) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  // Fallback if parsing fails
  if (!dateObj || isNaN(dateObj.getTime())) {
    return typeof rawDate === 'string' && rawDate.trim() ? rawDate.trim() : 'சற்றுமுன்';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();

  // If added in the future or under 1 minute ago
  if (diffMs < 60 * 1000) {
    return 'சற்றுமுன்';
  }

  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  // Under 60 minutes
  if (diffMins < 60) {
    return `${diffMins} நிமிடங்களுக்கு முன்`;
  }

  // Under 23 hours
  if (diffHours < 23) {
    return `${diffHours} மணி நேரத்திற்கு முன்`;
  }

  // After 23 hours reach up to 47 hours -> "1 நாள் முன்பு"
  if (diffHours >= 23 && diffHours < 48) {
    return '1 நாள் முன்பு';
  }

  // 2 to 6 days
  if (diffDays >= 2 && diffDays < 7) {
    return `${diffDays} நாட்களுக்கு முன்`;
  }

  // 1 to 4 weeks
  if (diffDays >= 7 && diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 வாரம் முன்பு' : `${weeks} வாரங்களுக்கு முன்`;
  }

  // 1 to 11 months
  if (diffDays >= 30 && diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 மாதம் முன்பு' : `${months} மாதங்களுக்கு முன்`;
  }

  // 1+ years
  const years = Math.max(1, Math.floor(diffDays / 365));
  return years === 1 ? '1 வருடம் முன்பு' : `${years} வருடங்களுக்கு முன்`;
};

/**
 * Convenience helper to extract date and format relative time for any article object
 */
export const getArticleTime = (article) => {
  if (!article) return 'சற்றுமுன்';
  if (typeof article === 'string') return formatRelativeTime(article);
  const raw = article.createdAt || article.publishedAt || article.time || article.date;
  return formatRelativeTime(raw);
};
