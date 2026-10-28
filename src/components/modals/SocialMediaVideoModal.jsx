import React, { useState } from 'react';
import {
  X,
  Instagram,
  Facebook,
  Share2,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Eye,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function SocialMediaVideoModal({ isOpen, onClose, video }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);

  if (!isOpen || !video) return null;

  const isInstagram = video.platform === 'instagram';
  const isFacebook = video.platform === 'facebook';

  const handleShare = () => {
    const text = encodeURIComponent(`*${video.title}*\n\nஅமேஸ் டைம்ஸ் ${isInstagram ? 'Instagram ரீல்' : 'Facebook வீடியோ'} காண்க: ${video.videoUrl || video.url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleOpenPlatform = () => {
    const targetUrl = video.videoUrl || video.url || (isInstagram ? 'https://www.instagram.com/amazetimes/?hl=en' : 'https://www.facebook.com/amazetimes');
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in font-tamil">
      <div
        className={`bg-[#0a0f1d] border border-slate-800 rounded-3xl w-full overflow-hidden shadow-2xl flex flex-col relative ${
          isInstagram ? 'max-w-md sm:max-w-lg' : 'max-w-3xl'
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#0e172d] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                isInstagram
                  ? 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600'
                  : 'bg-blue-600'
              }`}
            >
              {isInstagram ? <Instagram className="w-4 h-4" /> : <Facebook className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate">{video.author || 'Amaze Times'}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400 text-slate-900" />
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                  {isInstagram ? 'Reels' : 'Watch'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 transition cursor-pointer"
              title="வாட்ஸ்அப்பில் பகிர்"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition cursor-pointer"
              title="மூடுக"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Display Area */}
        <div
          className={`relative bg-black w-full overflow-hidden flex items-center justify-center ${
            isInstagram ? 'aspect-[9/14] sm:aspect-[9/15]' : 'aspect-video'
          }`}
        >
          {/* If video has direct playable MP4 video file */}
          {video.videoFile ? (
            <video
              src={video.videoFile}
              poster={video.image}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            /* High aesthetic responsive interactive video poster with preview */
            <div className="relative w-full h-full group">
              <img
                src={video.image}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 flex flex-col justify-between p-4">
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black text-white flex items-center gap-1.5 shadow-lg ${
                      isInstagram
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    {isInstagram ? 'அமேஸ் இன்ஸ்டா ரீல்ஸ்' : 'அமேஸ் பேஸ்புக் வீடியோ'}
                  </span>

                  <span className="bg-black/70 backdrop-blur-md text-amber-400 font-mono text-xs px-2.5 py-1 rounded-lg font-bold border border-white/10">
                    {video.duration || '01:00'}
                  </span>
                </div>

                {/* Big Center Play / External Link Action */}
                <div className="flex flex-col items-center justify-center gap-3 my-auto">
                  <button
                    onClick={handleOpenPlatform}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 cursor-pointer ${
                      isInstagram
                        ? 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 shadow-pink-600/50'
                        : 'bg-blue-600 shadow-blue-600/50'
                    }`}
                  >
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </button>
                  <span className="text-xs text-white/90 font-bold bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    {isInstagram ? 'முழு ரீல் காண கிளிக் செய்யவும்' : 'வீடியோவை முழுமையாகக் காண'}
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-black text-white leading-snug drop-shadow-md">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      {video.views || '50K+'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      {video.likes || '5K+'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {video.time || 'சமீபத்தியது'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer & Actions */}
        <div className="p-4 sm:p-5 bg-[#0b1326] border-t border-slate-800 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {video.caption || video.title}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleOpenPlatform}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer ${
                isInstagram
                  ? 'bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:opacity-95 shadow-pink-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
              }`}
            >
              {isInstagram ? <Instagram className="w-4 h-4" /> : <Facebook className="w-4 h-4" />}
              <span>
                {isInstagram ? 'அதிகாரப்பூர்வ Instagram-ல் பார்க்க' : 'அதிகாரப்பூர்வ Facebook-ல் பார்க்க'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setHasLiked(!hasLiked)}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                hasLiked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="லைக் செய்"
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
