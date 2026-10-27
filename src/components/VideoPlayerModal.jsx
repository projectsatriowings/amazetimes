import React from 'react';
import { X, Youtube, Share2, ExternalLink } from 'lucide-react';

export default function VideoPlayerModal({ isOpen, onClose, video }) {
  if (!isOpen || !video) return null;

  // Extract clean YouTube embed ID
  let videoId = video.youtubeId || video.id;
  if (video.url) {
    const match = video.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match) videoId = match[1];
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  const handleShare = () => {
    const shareUrl = `https://youtu.be/${videoId}`;
    const text = encodeURIComponent(`*${video.title}*\n\nவீடியோவைக் காண்க: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-tamil">
      <div className="bg-[#0b1326] border border-gray-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0e172d] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Youtube size={20} className="text-red-500" />
            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
              {video.title || 'நேரலை செய்தி வீடியோ'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-emerald-600/30 text-gray-300 hover:text-emerald-300 transition"
              title="பகிர்"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white transition"
              title="மூடுக"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Embed */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={video.title || 'YouTube video player'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#080d1b] flex items-center justify-between text-xs text-gray-400">
          <span>அமேஸ் டைம்ஸ் பிரத்யேக வீடியோ ஒளிபரப்பு</span>
          <a
            href={`https://youtu.be/${videoId}`}
            target="_blank"
            rel="noreferrer"
            className="text-red-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>YouTube-ல் திறக்க</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
