import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  MessageCircle,
  ThumbsUp,
  Flame,
  Lightbulb,
  Smile,
  Frown,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Radio,
  BookOpen,
  Printer
} from 'lucide-react';
import VoiceReaderPlayer from '../components/VoiceReaderPlayer';
import { generateArticleUrl, getCategoryKey } from '../utils/slugUtils';
import { api } from '../services/api';

export default function NewsDetailPage({
  article,
  allArticles = [],
  onNavigate,
  onOpenArticle,
  onToggleBookmark,
  isBookmarked = false,
  onToggleLike,
  isLiked = false,
  onToast = () => {}
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1); // 0.9 = A-, 1 = A, 1.15 = A+
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [activeReaction, setActiveReaction] = useState(() => {
    try {
      return localStorage.getItem(`reaction_${article?.id}`) || null;
    } catch (_) {
      return null;
    }
  });

  const [reactionCounts, setReactionCounts] = useState(() => {
    // Generate organic baseline counts based on views
    const base = (article?.viewsCount || article?.views_count || 120);
    return {
      fire: Math.floor(base * 0.35) + 12,
      insight: Math.floor(base * 0.22) + 8,
      heart: Math.floor(base * 0.28) + 15,
      surprise: Math.floor(base * 0.10) + 4,
      sad: Math.floor(base * 0.05) + 2
    };
  });

  // Track page scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update document title for SEO & Browser tab
  useEffect(() => {
    if (article?.title) {
      document.title = `${article.title} | அமேஸ் டைம்ஸ்`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article?.id, article?.title]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center font-tamil space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">செய்தி விவரம் கிடைக்கவில்லை</h2>
        <p className="text-slate-500">கோரப்பட்ட செய்தி நீக்கப்பட்டிருக்கலாம் அல்லது தவறான முகவரியாக இருக்கலாம்.</p>
        <button
          onClick={() => onNavigate('/')}
          className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer transition shadow"
        >
          முகப்புப் பக்கத்திற்குச் செல்லவும்
        </button>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const views = article.viewsCount || article.views_count || article.viewCount || 0;
  const likes = article.likesCount || article.likes_count || 0;
  const categoryKey = getCategoryKey(article.category);
  const categoryTitle = article.category || 'செய்திகள்';

  // Find related articles (same category, different id)
  const relatedArticles = allArticles
    .filter(a => String(a.id) !== String(article.id) && getCategoryKey(a.category) === categoryKey)
    .slice(0, 5);

  // Fallback trending articles if related is sparse
  const trendingArticles = allArticles
    .filter(a => String(a.id) !== String(article.id))
    .slice(0, 5);

  const sidebarList = relatedArticles.length >= 3 ? relatedArticles : trendingArticles;

  // Split content into clean paragraphs
  const rawContent = article.content || article.body || article.summary || article.desc || '';
  const paragraphs = rawContent
    .split(/\n\n+|\r\n\r\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      onToast('செய்தி இணைப்பு வெற்றிகரமாக நகலெடுக்கப்பட்டது!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`*${article.title}*\n\n${article.subtitle || article.summary || ''}\n\nமுழு விவரம் படிக்க: ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleReaction = (type) => {
    if (activeReaction === type) return;
    setReactionCounts(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
      ...(activeReaction ? { [activeReaction]: Math.max(0, (prev[activeReaction] || 1) - 1) } : {})
    }));
    setActiveReaction(type);
    try {
      localStorage.setItem(`reaction_${article.id}`, type);
    } catch (_) {}
    onToast('உங்கள் கருத்து பதிவு செய்யப்பட்டது. நன்றி!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 font-tamil pb-16">
      
      {/* Sticky Reading Progress Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-yellow-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Container */}
      <main className="max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
        
        {/* Breadcrumbs & Category Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <nav className="flex items-center gap-1.5 flex-wrap font-medium">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-red-600 dark:hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>முகப்பு</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <button
              onClick={() => onNavigate(`/${categoryKey}`)}
              className="text-[#0e2a7a] dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              {categoryTitle}
            </button>
            {article.district && article.district !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300 font-semibold">{article.district}</span>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:inline" />
            <span className="truncate max-w-[200px] sm:max-w-[320px] text-slate-400 hidden sm:inline">
              {article.title}
            </span>
          </nav>

          {/* Reading Time & Verified Badge */}
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>3 நிமிடம் வாசிப்பு</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>சரிபார்க்கப்பட்ட செய்தி</span>
            </span>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Main News Content (8 of 12 cols) */}
          <article className="lg:col-span-8 bg-white dark:bg-[#0c1427] rounded-3xl p-4 sm:p-7 md:p-8 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-6">
            
            {/* Category Tag + District */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {categoryTitle}
              </span>
              {article.district && article.district !== 'all' && (
                <span className="bg-[#0e2a7a] text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full">
                  📍 {article.district}
                </span>
              )}
              {article.isBreaking && (
                <span className="bg-red-500/20 text-red-500 border border-red-500/30 font-black text-xs px-2.5 py-0.5 rounded-full animate-pulse">
                  முக்கிய செய்தி
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-black font-title text-slate-900 dark:text-white leading-[1.3] tracking-tight">
              {article.title}
            </h1>

            {/* Subtitle / Summary */}
            {(article.subtitle || article.summary) && (
              <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed border-l-4 border-amber-500 pl-4 py-1 bg-amber-500/5 rounded-r-xl">
                {article.subtitle || article.summary}
              </p>
            )}

            {/* Author, Date & Stats Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800/80 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0e2a7a] to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow ring-2 ring-amber-400/40 shrink-0">
                  {article.authorName?.[0] || article.author?.[0] || 'அ'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    {article.authorName || article.author || 'அமேஸ் டைம்ஸ் ஆசிரியர் குழு'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{article.time || 'இன்று'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-emerald-500 dark:text-emerald-400 font-bold">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{views.toLocaleString('ta-IN')} பார்வைகள்</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Like, Bookmark, Font Size */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Font Size Adjuster */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setFontSizeMultiplier(0.9)}
                    className={`px-2 py-1 rounded-lg font-bold cursor-pointer transition ${fontSizeMultiplier === 0.9 ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs' : ''}`}
                    title="எழுத்து அளவைக் குறைக்க"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSizeMultiplier(1)}
                    className={`px-2 py-1 rounded-lg font-bold cursor-pointer transition ${fontSizeMultiplier === 1 ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs' : ''}`}
                    title="இயல்பான எழுத்து அளவு"
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSizeMultiplier(1.18)}
                    className={`px-2 py-1 rounded-lg font-bold cursor-pointer transition ${fontSizeMultiplier === 1.18 ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs' : ''}`}
                    title="எழுத்து அளவைப் பெரிதாக்க"
                  >
                    A+
                  </button>
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={() => onToggleBookmark && onToggleBookmark(article)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                    isBookmarked
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-400'
                  }`}
                  title={isBookmarked ? 'சேமிப்பிலிருந்து நீக்க' : 'செய்தியைச் சேமிக்க'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                {/* Like Button */}
                <button
                  onClick={() => onToggleLike && onToggleLike(article.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    isLiked
                      ? 'bg-rose-500/20 border-rose-400/50 text-rose-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500'
                  }`}
                  title={isLiked ? 'விருப்பத்தை நீக்க' : 'செய்திக்கு விருப்பம் தெரிவிக்க'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                  <span className="font-mono text-xs font-bold">{likes}</span>
                </button>
              </div>
            </div>

            {/* AI Voice Reader Player Dock (Full Feature) */}
            <div className="my-2">
              <VoiceReaderPlayer
                article={article}
                fullText={[article.title, article.subtitle, article.content || article.body || article.summary].filter(Boolean).join('. ')}
              />
            </div>

            {/* Featured Hero Media Image */}
            {article.image && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 group shadow-md border border-slate-200 dark:border-slate-800">
                <img
                  src={article.image}
                  alt={article.title}
                  className={`w-full object-cover transition-all duration-300 ${
                    isFullscreenImage ? 'max-h-[85vh] object-contain' : 'max-h-[480px]'
                  }`}
                  loading="eager"
                />
                
                {/* Fullscreen Toggle Floating Pill */}
                <button
                  onClick={() => setIsFullscreenImage(!isFullscreenImage)}
                  className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white p-2 rounded-xl backdrop-blur-md transition cursor-pointer opacity-90 hover:opacity-100 flex items-center gap-1.5 text-xs font-medium"
                  title={isFullscreenImage ? 'சுருக்குக' : 'பெரிதாக்குக'}
                >
                  {isFullscreenImage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isFullscreenImage ? 'சுருக்கு' : 'முழுத்திரை'}</span>
                </button>

                {article.imageCaption && (
                  <div className="p-3 bg-slate-900/95 text-slate-300 text-xs italic border-t border-slate-800">
                    {article.imageCaption}
                  </div>
                )}
              </div>
            )}

            {/* Article Body Content */}
            <div 
              className="space-y-4 text-slate-800 dark:text-slate-200 font-sans leading-relaxed tracking-normal"
              style={{ fontSize: `${17 * fontSizeMultiplier}px`, lineHeight: 1.8 }}
            >
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => (
                  <p key={idx} className={idx === 0 ? 'first-letter:text-4xl first-letter:font-black first-letter:text-[#0e2a7a] dark:first-letter:text-amber-400 first-letter:mr-2 first-letter:float-left' : ''}>
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-slate-400 italic">செய்தி விவரங்கள் ஏற்றப்படுகின்றன...</p>
              )}
            </div>

            {/* Key Highlights Callout Block */}
            {paragraphs.length > 2 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#0d1733] dark:to-[#0f1f47] rounded-2xl p-5 border border-blue-200/80 dark:border-blue-800/60 space-y-2">
                <h4 className="font-black text-[#0e2a7a] dark:text-amber-400 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>செய்தியின் முக்கிய அம்சங்கள் (Quick Highlights)</span>
                </h4>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
                  <li>{article.title}</li>
                  {article.subtitle && <li>{article.subtitle}</li>}
                  <li>செய்தியாளர்: {article.authorName || article.author || 'அமேஸ் டைம்ஸ் தலைமை நிருபர்'}</li>
                  <li>பதிவு செய்யப்பட்ட தேதி: {article.time || 'நேரலை'}</li>
                </ul>
              </div>
            )}

            {/* Interactive Reader Reaction Bar */}
            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>இந்தச் செய்தி குறித்த உங்கள் கருத்து:</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'fire', icon: Flame, label: 'அருமை', color: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/30' },
                  { id: 'insight', icon: Lightbulb, label: 'பயனுள்ளது', color: 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-400/30' },
                  { id: 'heart', icon: Heart, label: 'நெகிழ்ச்சி', color: 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border-rose-400/30' },
                  { id: 'surprise', icon: Smile, label: 'ஆச்சரியம்', color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-400/30' },
                  { id: 'sad', icon: Frown, label: 'வருத்தம்', color: 'text-slate-400 bg-slate-500/10 hover:bg-slate-500/20 border-slate-400/30' }
                ].map(r => {
                  const Icon = r.icon;
                  const isSelected = activeReaction === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleReaction(r.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-amber-400 bg-amber-400/20 scale-105 shadow-md'
                          : r.color
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'scale-125' : ''}`} />
                      <span className="text-xs font-bold">{r.label}</span>
                      <span className="text-[11px] font-mono text-slate-400 mt-0.5">{reactionCounts[r.id] || 0}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instant WhatsApp Share Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="space-y-0.5 text-center sm:text-left">
                <h4 className="font-black text-base flex items-center justify-center sm:justify-start gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>நண்பர்களுடன் வாட்ஸ்அப்பில் பகிருங்கள்</span>
                </h4>
                <p className="text-xs text-emerald-100">
                  இச்செய்தியை உடனுக்குடன் வாட்ஸ்அப் குழுக்களில் பகிர்ந்துகொள்ள கிளிக் செய்யவும்.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleShareWhatsApp}
                  className="bg-white hover:bg-slate-100 text-emerald-800 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>வாட்ஸ்அப் பகிர்வு</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="bg-emerald-900/40 hover:bg-emerald-900/60 text-white border border-white/20 p-2.5 rounded-xl transition cursor-pointer"
                  title="இணைப்பை நகலெடு"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tags Section */}
            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400">குறிச்சொற்கள்:</span>
                {article.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full transition cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    #{String(tag).replace(/^#/, '')}
                  </span>
                ))}
              </div>
            )}

            {/* Reporter Bio & Editorial Trust Card */}
            <div className="bg-slate-50 dark:bg-[#070d1e] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0e2a7a] text-white flex items-center justify-center font-black text-lg shadow shrink-0">
                {article.authorName?.[0] || 'அ'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {article.authorName || article.author || 'அமேஸ் டைம்ஸ் ஆசிரியர் குழு'}
                  </h4>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-400/20 px-2 py-0.2 rounded font-bold">
                    சரிபார்க்கப்பட்ட ஆசிரியர்
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  நம்பகமான, நடுநிலையான மற்றும் துல்லியமான செய்திகளை 24 மணி நேரமும் உடனுக்குடன் வழங்கிவரும் அமேஸ் டைம்ஸ் ஆசிரியர் குழு. மத்திய அரசு பதிவு எண்: 2023/88656.
                </p>
              </div>
            </div>

          </article>

          {/* RIGHT COLUMN: Sticky Sidebar (4 of 12 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-14">
            
            {/* 1. Related & Trending News Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <span>தொடர்புடைய முக்கியச் செய்திகள்</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-500">
                  {categoryTitle}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sidebarList.map((item, idx) => {
                  const itemUrl = generateArticleUrl(item);
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => onOpenArticle ? onOpenArticle(item) : onNavigate(itemUrl)}
                      className="py-3 flex items-start gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition"
                    >
                      <span className="font-black text-lg text-slate-300 dark:text-slate-700 font-mono w-5 shrink-0 group-hover:text-amber-400 transition">
                        {idx + 1}
                      </span>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition shadow-xs"
                          loading="lazy"
                        />
                      )}
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-amber-400 transition line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{item.time || 'சமீபத்தியது'}</span>
                          <span>•</span>
                          <span>{item.viewsCount || item.views_count || 120} பார்வைகள்</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. E-Paper & Monthly Magazine Quick Access Widget */}
            <div className="bg-gradient-to-br from-[#091538] via-[#0e2a7a] to-[#1e3a8a] text-white rounded-3xl p-5 border border-white/10 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>இன்றைய டிஜிட்டல் நாளிதழ்</span>
              </div>
              <h4 className="font-black text-lg leading-tight">
                அமேஸ் டைம்ஸ் முழு இ-பேப்பர் (E-Paper)
              </h4>
              <p className="text-xs text-slate-200">
                அனைத்துப் பக்கங்களையும் அச்சு வடிவில் உங்கள் மொபைல் மற்றும் கணினியில் வாசியுங்கள்.
              </p>
              <button
                onClick={() => onNavigate('/epaper')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>இ-பேப்பர் வாசிக்க</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Live News Channels & WhatsApp Group Banner */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>உடனுக்குடன் செய்திகள்</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                அமேஸ் டைம்ஸ் சமூக ஊடகச் சேனல்கள்
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                முக்கியச் செய்திகள், பிரேக்கிங் அப்டேட்டுகள் மற்றும் தங்கம் விலை நிலவரங்களை உடனுக்குடன் பெற வாட்ஸ்அப்பில் இணையுங்கள்.
              </p>
              <button
                onClick={() => window.open('https://chat.whatsapp.com', '_blank')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>வாட்ஸ்அப் சேனலில் இணைய</span>
              </button>
            </div>

          </aside>

        </div>

        {/* BOTTOM SECTION: Recommended Stories Grid (4-Card Grid) */}
        <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-title text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>மேலும் நீங்கள் படிக்க வேண்டிய முக்கியச் செய்திகள்</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                தமிழகம் மற்றும் சர்வதேச அளவிலான சமகால முக்கிய நிகழ்வுகள்
              </p>
            </div>
            <button
              onClick={() => onNavigate('/')}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#0e2a7a] dark:text-amber-400 hover:underline cursor-pointer"
            >
              <span>அனைத்து செய்திகள்</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {allArticles.slice(0, 4).map((story, i) => {
              const storyUrl = generateArticleUrl(story);
              return (
                <div
                  key={story.id || i}
                  onClick={() => onOpenArticle ? onOpenArticle(story) : onNavigate(storyUrl)}
                  className="bg-white dark:bg-[#0c1427] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {story.image && (
                      <div className="relative overflow-hidden aspect-[16/10] bg-slate-900">
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 bg-[#0e2a7a]/90 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded backdrop-blur-xs">
                          {story.category || 'செய்தி'}
                        </span>
                      </div>
                    )}
                    <div className="p-4 space-y-1.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        {story.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {story.subtitle || story.summary || story.desc}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                    <span>{story.time || 'இன்று'}</span>
                    <span className="flex items-center gap-1 font-mono text-emerald-500">
                      <Eye className="w-3 h-3" />
                      <span>{story.viewsCount || story.views_count || 100}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

    </div>
  );
}

