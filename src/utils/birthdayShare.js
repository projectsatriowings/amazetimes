// Comprehensive Birthday Card Sharing Utility - Amaze Times
// Attaches Image File + English Caption + Direct Website Link

export async function urlToFile(url, filename = 'amazetimes-birthday-poster.jpg') {
  try {
    if (!url) return null;
    if (url.startsWith('data:')) {
      const arr = url.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    const blob = await res.blob();
    const mime = blob.type || 'image/jpeg';
    return new File([blob], filename, { type: mime });
  } catch (e) {
    console.warn('urlToFile error:', e);
    return null;
  }
}

export function formatBirthdayShareText(item, cardUrl) {
  const englishName = item.englishName || item.name;
  const whoHeIs = item.englishDesignation || item.designation || 'Dignitary';
  const englishWish =
    item.englishWishMessage ||
    `Warmest Birthday Greetings to ${englishName}, ${whoHeIs}! Wishing you good health, happiness, peace, and continued success.`;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amazetimes.in';
  const targetUrl = cardUrl || `${origin}/?birthday=${item.id}`;

  const instagramUrl = item.socialInstagramUrl || 'https://www.instagram.com/amazetimes/?hl=en';
  const facebookUrl = item.socialFacebookUrl || 'https://www.facebook.com/amazetimes';
  const youtubeUrl = item.socialYoutubeUrl || 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g';
  const whatsappUrl = item.socialWhatsappUrl || 'https://whatsapp.com/channel/amazetimes';

  let text = `🎂 *HAPPY BIRTHDAY WISHES!* 🎂\n\n🌟 *${englishName}*\n📌 *${whoHeIs}*\n\n"${englishWish}"\n\n👉 *View Birthday Card on Amaze Times:*\n${targetUrl}`;

  const socialLinks = [];
  if (instagramUrl) socialLinks.push(`📸 *Instagram Post / Reel:*\n${instagramUrl}`);
  if (facebookUrl) socialLinks.push(`👥 *Facebook Post:*\n${facebookUrl}`);
  if (youtubeUrl) socialLinks.push(`📺 *YouTube Video:*\n${youtubeUrl}`);
  if (whatsappUrl) socialLinks.push(`💬 *WhatsApp Channel:*\n${whatsappUrl}`);

  if (socialLinks.length > 0) {
    text += `\n\n✨ *Watch & Share on Social Media:*\n` + socialLinks.join('\n\n');
  }

  return text;
}

export async function shareBirthdayItem({ item, cardUrl, showToast }) {
  if (!item) return { success: false };

  const englishName = item.englishName || item.name;
  const posterImg = item.posterImage || item.photo;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amazetimes.in';
  const targetUrl = cardUrl || `${origin}/?birthday=${item.id}`;
  const shareText = formatBirthdayShareText(item, targetUrl);
  const filename = `${(englishName || 'birthday').toLowerCase().replace(/[^a-z0-9]/g, '-')}-amazetimes-poster.jpg`;

  // 1. Try Native Web Share API with File Attachment
  if (typeof navigator !== 'undefined' && navigator.share && posterImg) {
    try {
      const file = await urlToFile(posterImg, filename);
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Birthday Wish - ${englishName}`,
          text: shareText
        });
        if (showToast) showToast('வாழ்த்து அட்டை வெற்றிகரமாக பகிரப்பட்டது! 🎉');
        return { success: true, method: 'files' };
      }
    } catch (err) {
      if (err.name === 'AbortError') return { success: false, cancelled: true };
      console.warn('Native file share failed, falling back to text share:', err);
    }
  }

  // 2. Try Native Web Share API without files (Do NOT pass separate url parameter!)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Birthday Wish - ${englishName}`,
        text: shareText
      });
      if (showToast) showToast('வாழ்த்து அட்டை பகிரப்பட்டது! 🎉');
      return { success: true, method: 'text' };
    } catch (err) {
      if (err.name === 'AbortError') return { success: false, cancelled: true };
      console.warn('Native text share skipped, falling back to WhatsApp Web:', err);
    }
  }

  // 3. Fallback: Direct WhatsApp Web / App Link
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  if (showToast) showToast('WhatsApp-ல் வாழ்த்துப் செய்தி திறக்கப்படுகிறது...');
  return { success: true, method: 'whatsapp-web' };
}

export function downloadPosterImage(imageUrl, filename = 'amazetimes-birthday-poster.jpg') {
  try {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.warn('download error:', e);
  }
}

export default {
  urlToFile,
  formatBirthdayShareText,
  shareBirthdayItem,
  downloadPosterImage
};
