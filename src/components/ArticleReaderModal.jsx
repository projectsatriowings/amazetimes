import React, { useRef, useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Share2, Heart, Bookmark } from 'lucide-react';
import VoiceReaderPlayer from './VoiceReaderPlayer';

/**
 * ArticleReaderModal
 * 
 * Features:
 * - Top bar button wired to VoiceReaderPlayer ref for synchronous play/pause
 * - Automatic stop on modal close / unmount
 * - Full article speech normalization (title + body)
 * - Interactive like, bookmark, WhatsApp share controls
 */
export default function ArticleReaderModal({
  isOpen,
  onClose,
  articleData,
  onSpeak,
  onShareWhatsApp,
  onToggleBookmark,
  isBookmarked = false,
  onToggleLike,
  isLiked = false
}) {
  const playerRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Stop audio whenever modal closes or article changes
  const handleClose = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [articleData?.id]);

  if (!isOpen || !articleData) return null;

  // Combine title and body for complete reading experience
  const fullArticleContent = [
    articleData.title,
    articleData.content || articleData.body || articleData.desc || ''
  ].filter(Boolean).join('. ');

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-tamil">
      <div className="bg-white dark:bg-[#0D1424] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="bg-[#0e2a7a] text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-md">
            {articleData.category || "செய்தி"}
          </span>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="மூடுக (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <h2 className="font-title font-bold text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-slate-100 leading-tight">
          {articleData.title}
        </h2>

        {/* Meta Info & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-subtitle text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800 py-2.5">
          <span>{articleData.time || "இன்று காலை"}</span>
          <div className="flex items-center gap-2">
            {onToggleLike && (
              <button
                onClick={() => onToggleLike(articleData)}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isLiked
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 dark:border-rose-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-500'
                }`}
                title="விருப்பம் (Like)"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isLiked ? 'விருப்பமானது' : 'விருப்பம்'}</span>
              </button>
            )}

            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(articleData)}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isBookmarked
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-amber-500'
                }`}
                title="சேமிக்க (Bookmark)"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{isBookmarked ? 'சேமிக்கப்பட்டது' : 'சேமிக்க'}</span>
              </button>
            )}

            {/* Top Bar Voice Reader Toggle Button */}
            <button
              onClick={() => {
                if (playerRef.current) {
                  playerRef.current.togglePlay();
                } else if (onSpeak) {
                  onSpeak(fullArticleContent);
                }
              }}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isAudioPlaying
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-amber-400 px-3 py-1 hover:bg-blue-600 hover:text-white border-blue-200 dark:border-slate-700'
              }`}
              title={isAudioPlaying ? 'ஆடியோவை நிறுத்துக' : 'குரலில் முழுச் செய்தியைக் கேட்க'}
            >
              {isAudioPlaying ? (
                <>
                  <VolumeX className="w-4 h-4 text-slate-950" />
                  <span>நிறுத்துக</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>குரலில் கேட்க</span>
                </>
              )}
            </button>

            {onShareWhatsApp && (
              <button
                onClick={() => onShareWhatsApp(articleData.title)}
                className="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>பகிர்</span>
              </button>
            )}
          </div>
        </div>

        {/* Embedded AI Voice Reader Player Component */}
        <VoiceReaderPlayer
          ref={playerRef}
          text={fullArticleContent}
          title={articleData.title}
          onPlayStateChange={setIsAudioPlaying}
        />

        {/* Article Image */}
        {articleData.image && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow">
            <img 
              src={articleData.image} 
              alt={articleData.title} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="font-body text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
          {articleData.content ? (
            articleData.content.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))
          ) : (
            <p>{articleData.body || articleData.desc}</p>
          )}
          <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100 dark:border-slate-800">
            அமேஸ் டைம்ஸ் நாளிதழின் பிரத்யேக கள நிலவரப்படி இச்செய்தி உறுதி செய்யப்பட்டுள்ளது.
          </p>
        </div>
      </div>
    </div>
  );
}
