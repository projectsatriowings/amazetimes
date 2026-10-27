import React, { useRef, useState, useEffect } from 'react';
import {
  X, Volume2, VolumeX, Share2, Heart, Bookmark, Eye, Maximize, Minimize,
  Copy, Check, MessageSquare, Send, ExternalLink
} from 'lucide-react';
import VoiceReaderPlayer from './VoiceReaderPlayer';

/**
 * ArticleReaderModal
 * 
 * Features:
 * - Top reading progress bar tracking modal scroll
 * - High-res image with fullscreen toggle
 * - Tamil AI TTS Voice Reader Player with synchronized control
 * - Author information, view count, like count
 * - Multi-platform social sharing (WhatsApp, Telegram, Twitter/X, Facebook, Copy Link)
 * - Auto-addition to reading history
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
  const scrollContainerRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Stop audio whenever modal closes or article changes
  const handleClose = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsFullscreenImage(false);
    setShowShareMenu(false);
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

  // Track reading progress on scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const windowHeight = scrollHeight - clientHeight;
    if (windowHeight <= 0) {
      setScrollProgress(100);
    } else {
      const progress = Math.min(100, Math.max(0, (scrollTop / windowHeight) * 100));
      setScrollProgress(progress);
    }
  };

  if (!isOpen || !articleData) return null;

  // Combine title and body for complete reading experience
  const fullArticleContent = [
    articleData.title,
    articleData.content || articleData.body || articleData.desc || ''
  ].filter(Boolean).join('. ');

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/?article=${articleData.id}` : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSharePlatform = (platform) => {
    const text = encodeURIComponent(`*${articleData.title}*\n\nமுழு விவரம் படிக்க: ${currentUrl}`);
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(articleData.title)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleData.title)}&url=${encodeURIComponent(currentUrl)}`;
        break;
      default:
        break;
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const views = articleData.viewsCount || articleData.views_count || articleData.viewCount || 0;
  const likes = articleData.likesCount || articleData.likes_count || 0;

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto font-tamil animate-fade-in">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="bg-white dark:bg-[#0D1424] rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 md:p-8 space-y-5 relative"
      >
        {/* Sticky Reading Progress Bar */}
        <div className="sticky top-0 left-0 right-0 -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 z-30">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-yellow-500 transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#0e2a7a] text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-md">
              {articleData.category || "செய்தி"}
            </span>
            {articleData.district && articleData.district !== 'all' && (
              <span className="bg-red-950/40 text-red-300 border border-red-800/50 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                {articleData.district}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Image Button */}
            {articleData.image && (
              <button
                onClick={() => setIsFullscreenImage(!isFullscreenImage)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title={isFullscreenImage ? "படத்தை சுருக்குக" : "படத்தை பெரிதாக்குக (Fullscreen)"}
              >
                {isFullscreenImage ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="மூடுக (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-title font-bold text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-slate-100 leading-tight">
          {articleData.title}
        </h1>

        {/* Subtitle if available */}
        {articleData.subtitle && (
          <h2 className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400">
            {articleData.subtitle}
          </h2>
        )}

        {/* Meta Info & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-subtitle text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800 py-3">
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {articleData.author || articleData.authorName || "செய்தி ஆசிரியர்"}
            </span>
            <span>•</span>
            <span>{articleData.time || "இன்று"}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{views} பார்வைகள்</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Like Button */}
            {onToggleLike && (
              <button
                onClick={() => onToggleLike(articleData)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isLiked
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 dark:border-rose-700 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-500'
                }`}
                title="விருப்பம் (Like)"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{likes > 0 ? likes : (isLiked ? '1' : 'விருப்பம்')}</span>
              </button>
            )}

            {/* Bookmark Button */}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(articleData)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isBookmarked
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 shadow-sm'
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
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isAudioPlaying
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-amber-400 hover:bg-blue-600 hover:text-white border-blue-200 dark:border-slate-700'
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

            {/* Social Share Menu Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="பகிர்வு விருப்பங்கள்"
              >
                <Share2 className="w-4 h-4" />
                <span>பகிர்</span>
              </button>

              {/* Share Popover Menu */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#121c33] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-40 space-y-1 animate-fade-in text-xs">
                  <button
                    onClick={() => { handleSharePlatform('whatsapp'); setShowShareMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition"
                  >
                    <span>🟢</span> <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => { handleSharePlatform('telegram'); setShowShareMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-500 transition"
                  >
                    <span>✈️</span> <span>Telegram</span>
                  </button>
                  <button
                    onClick={() => { handleSharePlatform('facebook'); setShowShareMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition"
                  >
                    <span>📘</span> <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => { handleSharePlatform('twitter'); setShowShareMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <span>🐦</span> <span>Twitter / X</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'நகலெடுக்கப்பட்டது!' : 'இணைப்பை நகலெடு'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Embedded AI Voice Reader Player Component */}
        <VoiceReaderPlayer
          ref={playerRef}
          text={fullArticleContent}
          title={articleData.title}
          onPlayStateChange={setIsAudioPlaying}
        />

        {/* Article Image with Fullscreen capability */}
        {articleData.image && (
          <div className={`transition-all duration-300 rounded-2xl overflow-hidden bg-slate-900 shadow-md ${isFullscreenImage ? 'max-h-[70vh]' : 'aspect-video'}`}>
            <img 
              src={articleData.image} 
              alt={articleData.title} 
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
            />
          </div>
        )}

        {/* Summary Block */}
        {articleData.desc && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-amber-500 text-slate-800 dark:text-amber-200 text-sm font-semibold italic">
            {articleData.desc}
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

          {/* Tags */}
          {Array.isArray(articleData.tags) && articleData.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-4">
              <span className="text-xs text-slate-400 font-semibold">குறிச்சொற்கள்:</span>
              {articleData.tags.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 italic pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>அமேஸ் டைம்ஸ் நாளிதழின் பிரத்யேக கள நிலவரப்படி இச்செய்தி உறுதி செய்யப்பட்டுள்ளது.</span>
            <span>ID: {articleData.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
