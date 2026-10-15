// Default Repository for Tamil Video News & Live Gallery (வீடியோ செய்திகள் & நேரலை காட்சிக் கூடம்)

export const extractYouTubeId = (url) => {
  if (!url) return '';
  const str = String(url).trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = str.match(regExp);
  return match && match[1] ? match[1] : '';
};

export const formatYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('/embed/')) return url;
  return url;
};

export const getYouTubeThumbnailUrl = (url, fallback = '') => {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return fallback;
};

export const defaultVideos = [
  {
    id: 'video-1',
    title: 'தமிழகத்தில் உருவாகும் அடுத்த தலைமுறை எலக்ட்ரானிக்ஸ் பார்க்: தொழில் துறை அமைச்சர் சிறப்புப் பேட்டி',
    category: 'சிறப்பு நேர்காணல்',
    time: '05:42',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    color: 'text-red-600 dark:text-red-400',
    isActive: true,
    views: 1240,
    createdAt: '2026-10-10T10:00:00.000Z'
  },
  {
    id: 'video-2',
    title: 'தங்கம் விலை உயர்வுக்கான முக்கிய காரணங்கள் என்ன? நகைக்கடை உரிமையாளர்கள் சொல்லும் ரகசியம்!',
    category: 'சந்தை பார்வை',
    time: '08:15',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600',
    color: 'text-amber-600 dark:text-amber-400',
    isActive: true,
    views: 3410,
    createdAt: '2026-10-11T12:00:00.000Z'
  },
  {
    id: 'video-3',
    title: 'மதுரை மாநகரத்தின் 2500 ஆண்டு தொன்மை வரலாறு: அழகிய வீடியோ ஆவணத் தொகுப்பு',
    category: 'வரலாற்றுப் பார்வை',
    time: '12:30',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    img: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&q=80&w=600',
    color: 'text-emerald-600 dark:text-emerald-400',
    isActive: true,
    views: 5820,
    createdAt: '2026-10-12T09:30:00.000Z'
  },
  {
    id: 'video-4',
    title: 'இந்த வார வெளியீடுகள்: கோலிவுட் பாக்ஸ் ஆபிஸ் நிலவரம் மற்றும் ரசிகர்களின் விமர்சனங்கள்',
    category: 'சினிமா பஸ்',
    time: '04:10',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600',
    color: 'text-purple-600 dark:text-purple-400',
    isActive: true,
    views: 2190,
    createdAt: '2026-10-13T08:00:00.000Z'
  }
];
