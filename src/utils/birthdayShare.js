/**
 * Birthday Poster File Share Utility
 * Brand: Amaze Times
 */

/**
 * Converts image URLs or base64 data to native File objects
 * @param {string} url
 * @param {string} filename
 * @returns {Promise<File|null>}
 */
export async function urlToFile(url, filename = 'amaze-times-birthday-poster.jpg') {
  if (!url) return null;
  try {
    // 1. Base64 Data URI handling
    if (url.startsWith('data:')) {
      const arr = url.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }

    // 2. HTTP / Local URL handling
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error('Fetch failed');
    const blob = await res.blob();
    const type = blob.type || 'image/jpeg';
    return new File([blob], filename, { type });
  } catch (err) {
    console.warn('[BirthdayShare] urlToFile conversion notice:', err.message);
    return null;
  }
}

/**
 * Generates well-formatted greeting in English with name, designation, wish quote,
 * card URL, and official Amaze Times social links.
 * @param {object} item
 * @param {string} cardUrl
 * @returns {string}
 */
export function formatBirthdayShareText(item, cardUrl) {
  const name = item?.name || 'Respected Dignitary';
  const designation = item?.designation ? ` (${item.designation})` : '';
  const quote = item?.greeting_text || item?.greetingText || item?.quote || 'Wishing you a very Happy Birthday filled with good health, joy, and grand success!';
  const link = cardUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://amazetimes.in');

  return `🎂 *Warm Birthday Wishes to ${name}${designation}!* 💐\n\n"${quote}"\n\n📰 *Amaze Times - Daily Media & News Portal*\n👉 View Birthday Poster: ${link}\n\n📲 *Follow Amaze Times Official Channels:*\n📺 YouTube: https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g\n📸 Instagram: https://www.instagram.com/amazetimes/?hl=en\n📘 Facebook: https://www.facebook.com/amazetimes\n💬 WhatsApp Channel: https://whatsapp.com/channel/amazetimes`;
}

/**
 * Shares birthday item with poster attachment and English caption
 * @param {object} params
 * @param {object} params.item
 * @param {string} [params.cardUrl]
 * @param {function} [params.showToast]
 */
export async function shareBirthdayItem({ item, cardUrl, showToast }) {
  if (!item) return;

  const caption = formatBirthdayShareText(item, cardUrl);
  const imageUrl = item.photo_url || item.photoUrl || item.image || item.mainImage || '';

  // Attempt to convert poster image to native File object
  let file = null;
  if (imageUrl) {
    const filename = `${(item.name || 'birthday').toLowerCase().replace(/\s+/g, '-')}-poster.jpg`;
    file = await urlToFile(imageUrl, filename);
  }

  // Fallback 1: Web Share API with attached File
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Birthday Wishes - ${item.name}`,
        text: caption,
        files: [file]
      });
      if (showToast) showToast('வாழ்த்து அட்டை வெற்றிகரமாக பகிரப்பட்டது! 🎉');
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // User cancelled
      console.warn('File share failed, falling back to text share:', err.message);
    }
  }

  // Fallback 2: Web Share API text-only (DO NOT pass separate url parameter to prevent WhatsApp from dropping text caption!)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Birthday Wishes - ${item.name}`,
        text: caption
      });
      if (showToast) showToast('வாழ்த்து அட்டை பகிரப்பட்டது! 🎉');
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // User cancelled
      console.warn('Navigator share text failed:', err.message);
    }
  }

  // Fallback 3: Direct WhatsApp Web / API URL
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  if (showToast) showToast('WhatsApp வழியாக பகிர்கிறது...');
}

export default {
  urlToFile,
  formatBirthdayShareText,
  shareBirthdayItem
};
