import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  ArrowRight,
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
  Printer,
  CloudSun,
  Coins,
  BarChart3,
  CheckCircle2,
  Wind,
  Droplets,
  Lock,
  User,
  Send
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
  onToast = () => {},
  onOpenEPaper = () => {},
  readerUser = null,
  onOpenAuth = () => {}
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1); // 0.9 = A-, 1 = A, 1.15 = A+
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [fallbackArticles, setFallbackArticles] = useState([]);

  // Instant Interactive Opinion Poll state
  const [pollVoted, setPollVoted] = useState(() => {
    try {
      return localStorage.getItem('amaze_poll_news_voted') === 'true';
    } catch (_) {
      return false;
    }
  });
  const [pollChoice, setPollChoice] = useState(() => {
    try {
      return localStorage.getItem('amaze_poll_news_choice') || null;
    } catch (_) {
      return null;
    }
  });
  const [pollCounts, setPollCounts] = useState({ yes: 488, no: 112 });

  const [activeReaction, setActiveReaction] = useState(() => {
    try {
      return localStorage.getItem(`reaction_${article?.id}`) || null;
    } catch (_) {
      return null;
    }
  });

  // Real reaction counts from database
  const [reactionCounts, setReactionCounts] = useState(() => {
    if (article?.reactions && typeof article.reactions === 'object') {
      return {
        fire: Number(article.reactions.fire) || 0,
        insight: Number(article.reactions.insight) || 0,
        heart: Number(article.reactions.heart) || 0,
        surprise: Number(article.reactions.surprise) || 0,
        sad: Number(article.reactions.sad) || 0,
      };
    }
    return { fire: 0, insight: 0, heart: 0, surprise: 0, sad: 0 };
  });

  // Reader Interactive Comments Forum
  const [comments, setComments] = useState(() => {
    try {
      const saved = localStorage.getItem(`comments_${article?.id}`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: '1',
        name: 'கார்த்திகேயன் M',
        avatar: '',
        text: 'மிகவும் அவசியமான செய்தி! அமேஸ் டைம்ஸின் துல்லியமான தகவல்களுக்கு வாழ்த்துகள்.',
        time: '15 நிமிடங்களுக்கு முன்',
        likes: 12,
        isLiked: false
      },
      {
        id: '2',
        name: 'பிரியா சுந்தர்',
        avatar: '',
        text: 'இந்த திட்டத்தால் இளைஞர்களுக்கு நல்ல வேலைவாய்ப்பு கிடைக்கும் என நம்புகிறேன்.',
        time: '1 மணி நேரத்திற்கு முன்',
        likes: 8,
        isLiked: false
      }
    ];
  });
  const [newCommentText, setNewCommentText] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!readerUser) {
      if (onToast) onToast('கருத்துக்களைப் பகிர அமேஸ் டைம்ஸ் வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const commentObj = {
      id: String(Date.now()),
      name: readerUser.full_name || readerUser.name || 'அன்பு வாசகர்',
      avatar: readerUser.avatar_url || readerUser.avatar || '',
      text: newCommentText.trim(),
      time: 'சற்று முன்',
      likes: 1,
      isLiked: true
    };
    const updated = [commentObj, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(`comments_${article?.id}`, JSON.stringify(updated));
    } catch (_) {}
    setNewCommentText('');
    if (onToast) onToast('உங்கள் கருத்து வெற்றிகரமாக பகிரப்பட்டது! +5 வாசகர் புள்ளிகள்.', 'success');
  };

  const handleLikeComment = (commentId) => {
    if (!readerUser) {
      if (onToast) onToast('கருத்தை விரும்ப அமேஸ் டைம்ஸ் வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          likes: c.isLiked ? c.likes - 1 : c.likes + 1,
          isLiked: !c.isLiked
        };
      }
      return c;
    }));
  };

  // Real views and likes count states synced with database
  const [realViews, setRealViews] = useState(
    Number(article?.views_count ?? article?.viewsCount ?? article?.viewCount ?? 0)
  );
  const [realLikes, setRealLikes] = useState(
    Number(article?.likes_count ?? article?.likesCount ?? 0)
  );

  // Synchronize and record real view on mount / article ID change
  useEffect(() => {
    if (!article?.id) return;
    setRealViews(Number(article.views_count ?? article.viewsCount ?? article.viewCount ?? 0));
    setRealLikes(Number(article.likes_count ?? article.likesCount ?? 0));

    if (article.reactions && typeof article.reactions === 'object') {
      setReactionCounts({
        fire: Number(article.reactions.fire) || 0,
        insight: Number(article.reactions.insight) || 0,
        heart: Number(article.reactions.heart) || 0,
        surprise: Number(article.reactions.surprise) || 0,
        sad: Number(article.reactions.sad) || 0,
      });
    }

    try {
      const stored = localStorage.getItem(`reaction_${article.id}`);
      setActiveReaction(stored || null);
    } catch (_) {}

    // Record real view in Neon PostgreSQL
    if (/^\d+$/.test(String(article.id).trim())) {
      api.recordNewsView(article.id)
        .then(res => {
          if (res && res.success && typeof res.viewsCount === 'number') {
            setRealViews(res.viewsCount);
          }
        })
        .catch(err => console.warn('Failed to record news view in database:', err));
    }
  }, [article?.id]);

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

  // Guarantee sidebar articles are populated even on direct cold page load
  useEffect(() => {
    if (!allArticles || allArticles.length < 5) {
      api.getArticles({ limit: 20, status: 'published' })
        .then(res => {
          const list = res?.data || res?.articles || res?.news || [];
          if (Array.isArray(list) && list.length > 0) {
            setFallbackArticles(list.map(a => ({
              id: a.id,
              title: a.title,
              category: a.category || 'செய்தி',
              subCategory: a.sub_category || a.subCategory || '',
              district: a.district || 'all',
              subtitle: a.subtitle || '',
              summary: a.summary || a.desc || '',
              image: a.main_image || a.image || '/Amaze times.jpg',
              time: new Date(a.published_at || a.created_at || Date.now()).toLocaleDateString('ta-IN', { hour: '2-digit', minute: '2-digit' }),
              viewsCount: a.views_count ?? a.viewsCount ?? 0,
              likesCount: a.likes_count ?? a.likesCount ?? 0
            })));
          }
        })
        .catch(err => console.warn('Could not load fallback articles for sidebar:', err));
    }
  }, [allArticles]);

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

  // Article pool: prioritize prop allArticles, fallback to internally fetched articles
  const pool = (allArticles && allArticles.length >= 5)
    ? allArticles
    : (fallbackArticles.length > 0 ? fallbackArticles : allArticles);

  // Find related articles (same category, different id)
  const relatedArticles = pool
    .filter(a => String(a.id) !== String(article.id) && getCategoryKey(a.category) === categoryKey)
    .slice(0, 5);

  // Fallback trending articles if related is sparse
  const trendingArticles = pool
    .filter(a => String(a.id) !== String(article.id))
    .slice(0, 6);

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

  const handleReaction = async (type) => {
    if (!readerUser) {
      if (onToast) onToast('உங்கள் உணர்வைப் பதிவு செய்ய அமேஸ் டைம்ஸ் வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!article?.id) return;
    const prevActive = activeReaction;
    const isTogglingOff = (prevActive === type);
    const newActive = isTogglingOff ? null : type;

    // Optimistically update active state
    setActiveReaction(newActive);
    try {
      if (newActive) {
        localStorage.setItem(`reaction_${article.id}`, newActive);
      } else {
        localStorage.removeItem(`reaction_${article.id}`);
      }
    } catch (_) {}

    // Optimistically update counts
    setReactionCounts(prev => ({
      ...prev,
      [type]: isTogglingOff ? Math.max(0, (prev[type] || 1) - 1) : (prev[type] || 0) + 1,
      ...(prevActive && !isTogglingOff ? { [prevActive]: Math.max(0, (prev[prevActive] || 1) - 1) } : {})
    }));

    // Sync with Neon PostgreSQL permanent reaction table
    try {
      const res = await api.submitNewsReaction(article.id, type);
      if (res && res.success && res.reactions) {
        setReactionCounts(res.reactions);
        if (res.userReaction !== undefined) {
          setActiveReaction(res.userReaction);
        }
      }
    } catch (err) {
      console.warn('Failed to record reaction on server:', err);
    }

    onToast && onToast('உங்கள் கருத்து பதிவு செய்யப்பட்டது. நன்றி!', 'success');
  };

  const handleLikeClick = () => {
    if (!article?.id) return;
    if (onToggleLike) {
      onToggleLike(article);
    }
    setRealLikes(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
  };

  const handleVotePoll = (choice) => {
    if (!readerUser) {
      if (onToast) onToast('கருத்துக் கணிப்பில் வாக்களிக்க வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (pollVoted) return;
    setPollCounts(prev => ({
      ...prev,
      [choice]: prev[choice] + 1
    }));
    setPollVoted(true);
    setPollChoice(choice);
    try {
      localStorage.setItem('amaze_poll_news_voted', 'true');
      localStorage.setItem('amaze_poll_news_choice', choice);
    } catch (_) {}
    onToast('உங்கள் வாக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது!');
  };

  const totalPollVotes = pollCounts.yes + pollCounts.no;
  const yesPercent = Math.round((pollCounts.yes / totalPollVotes) * 100);
  const noPercent = 100 - yesPercent;

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
            {article.subCategory && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-amber-600 dark:text-amber-300 font-bold">{article.subCategory}</span>
              </>
            )}
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
            
            {/* Category Tag + Sub-Category + District */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {categoryTitle}
              </span>
              {article.subCategory && (
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-xs">
                  ✨ {article.subCategory}
                </span>
              )}
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
                      <span>{realViews.toLocaleString('ta-IN')} பார்வைகள்</span>
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
                  onClick={handleLikeClick}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    isLiked
                      ? 'bg-rose-500/20 border-rose-400/50 text-rose-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500'
                  }`}
                  title={isLiked ? 'விருப்பத்தை நீக்க' : 'செய்திக்கு விருப்பம் தெரிவிக்க'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                  <span className="font-mono text-xs font-bold">{realLikes}</span>
                </button>
              </div>
            </div>

            {/* AI Voice Reader Player Dock (Full Feature) */}
            <div className="my-2">
              <VoiceReaderPlayer
                article={article}
                text={[article.title, article.subtitle, article.content || article.body || article.summary].filter(Boolean).join('. ')}
                fullText={[article.title, article.subtitle, article.content || article.body || article.summary].filter(Boolean).join('. ')}
                title={article.title}
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

            {/* 6. READER COMMUNITY COMMENTS & DISCUSSION FORUM */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-red-600/10 text-red-600 rounded-xl">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-title font-black text-base text-slate-900 dark:text-white">
                      வாசகர் கருத்துக்களம் (Reader Comments)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      உங்கள் கருத்துக்களை நாகரிகமாகப் பகிர்ந்து உரையாடுங்கள்
                    </p>
                  </div>
                </div>
                <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full font-mono">
                  {comments.length}
                </span>
              </div>

              {/* Add Comment Input Box */}
              {readerUser ? (
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={readerUser.avatar_url || readerUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(readerUser.full_name || readerUser.name || 'User')}&background=0E2A7A&color=fff&size=128&bold=true`}
                      alt={readerUser.full_name || readerUser.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400 shrink-0 mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {readerUser.full_name || readerUser.name}
                        </span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                          உள்நுழைந்த வாசகர் ✓
                        </span>
                      </div>
                      <textarea
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="இச்செய்தி குறித்த உங்கள் ஆரோக்கியமான கருத்தை எழுதுங்கள்..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-body"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:pl-13">
                    <span className="text-[10px] text-slate-400">கருத்துப் பதிவிற்கு +5 வாசகர் புள்ளிகள்</span>
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>கருத்து அனுப்பு</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        கருத்துக்களைப் பகிர அமேஸ் டைம்ஸ் வாசகராக உள்நுழையவும்!
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        சக வாசகர்களுடன் விவாதிக்க மற்றும் உரையாட Google மூலம் உடனடியாக உள்நுழையுங்கள்.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenAuth}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow transition shrink-0 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    இலவசமாக உள்நுழைக
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 transition hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0e2a7a] text-amber-300 font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            c.name?.[0] || 'வ'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</span>
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-400/20 px-1 py-0.2 rounded font-sans">வாசகர்</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{c.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLikeComment(c.id)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                          c.isLiked
                            ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-100 dark:bg-slate-800 border-transparent'
                        }`}
                        title="கருத்தை விரும்பு"
                      >
                        <Heart className={`w-3.5 h-3.5 ${c.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{c.likes}</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-body sm:pl-10.5">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </article>

          {/* RIGHT COLUMN: Full-Featured Multi-Widget Sidebar (4 of 12 cols) */}
          <aside className="lg:col-span-4 space-y-5 self-start w-full">
            
            {/* 1. Related & Category News Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <span>தொடர்புடைய செய்திகள்</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {categoryTitle}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sidebarList.slice(0, 4).map((item, idx) => {
                  const itemUrl = generateArticleUrl(item);
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => onOpenArticle ? onOpenArticle(item) : onNavigate(itemUrl)}
                      className="py-3 flex items-start gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition"
                    >
                      <span className="font-black text-base text-slate-300 dark:text-slate-700 font-mono w-5 shrink-0 group-hover:text-amber-400 transition">
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
                          <span className="text-emerald-500 font-mono font-semibold">{Number(item.views_count ?? item.viewsCount ?? 0).toLocaleString('ta-IN')} பார்வைகள்</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Trending Top 5 Headlines Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>அதிகம் வாசிக்கப்பட்டவை</span>
                </h3>
                <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  TOP 5
                </span>
              </div>

              <div className="space-y-2.5">
                {trendingArticles.slice(0, 5).map((item, idx) => {
                  const itemUrl = generateArticleUrl(item);
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => onOpenArticle ? onOpenArticle(item) : onNavigate(itemUrl)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition group"
                    >
                      <div className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-xs'
                          : idx === 1
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-amber-400 line-clamp-2 leading-snug transition">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">{item.category || 'செய்தி'}</span>
                          <span>•</span>
                          <span>{Number(item.views_count ?? item.viewsCount ?? 0).toLocaleString('ta-IN')} பார்வைகள்</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STICKY BOTTOM CONTAINER: Pins dynamically as user scrolls down long articles */}
            <div className="sticky top-20 space-y-5">
            {/* MONTHLY MAGAZINE (மாத இதழ்) PROMINENT WIDGET */}
            <div className="bg-gradient-to-br from-[#071330] via-[#0d2258] to-[#143282] text-white rounded-3xl p-5 border border-amber-400/30 shadow-xl space-y-4 relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-amber-400/20 blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>அமேஸ் டைம்ஸ் மாத இதழ்</span>
                </div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  புதிய மலர்!
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                {/* 3D Magazine Cover Mockup */}
                <div 
                  onClick={() => onOpenEPaper ? onOpenEPaper() : onNavigate('/magazine')}
                  className="w-20 aspect-[3/4] rounded-xl overflow-hidden shadow-lg border-2 border-amber-400/40 shrink-0 cursor-pointer group-hover:scale-105 transition-transform duration-300 relative bg-slate-900"
                >
                  <img
                    src="/Amaze times.webp"
                    alt="அமேஸ் டைம்ஸ் மாத இதழ்"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/og-image.webp'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[8px] font-bold text-amber-300 leading-tight">நவம்பர் 2026</span>
                  </div>
                </div>

                {/* Magazine Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors leading-snug">
                    அமேஸ் டைம்ஸ் பிரத்யேக சிறப்பு மாத இதழ்
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    அரசியல், சமூகம், சினிமா & தொழில் நுட்பம் - 64 வண்ணப் பக்கங்கள்.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-amber-300/90 font-semibold pt-0.5">
                    <span>64 பக்கங்கள்</span>
                    <span>•</span>
                    <span>முழு டிஜிட்டல் இதழ்</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenEPaper ? onOpenEPaper() : onNavigate('/magazine')}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>மாத இதழை வாசிக்க (Read Monthly Magazine)</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            {/* THALAIYANGAM (தலையங்கம் / EDITORIAL) NAVIGATION WIDGET */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-3.5 group">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-[#0e2a7a] dark:text-amber-400">
                  <PenTool className="w-4 h-4 text-red-600" />
                  <span>ஆசிரியர் தலையங்கம் (Editorial)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  தினசரி பார்வை
                </span>
              </div>

              {/* Daily Thirukkural Quote Card */}
              <div className="bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl p-3 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  📜 இன்றைய குறள் சிந்தனை
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 italic leading-relaxed">
                  "எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள் மெய்ப்பொருள் காண்ப தறிவு."
                </p>
              </div>

              {/* Featured Column Preview */}
              <div 
                onClick={() => onNavigate('/thalaiyangam')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition space-y-1 border border-slate-100 dark:border-slate-800"
              >
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">தலையங்க கட்டுரை</span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                  உள்கட்டமைப்பு திட்டங்களும் மாநிலங்களின் நிதி தன்னாட்சியும் - அமேஸ் டைம்ஸ் தலையங்கம்
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>க. சுப்பிரமணியன் (முதன்மை ஆசிரியர்)</span>
                  <span className="text-[#0e2a7a] dark:text-amber-400 font-bold flex items-center gap-0.5">
                    <span>முழு கட்டுரை</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Navigation Button */}
              <button
                onClick={() => onNavigate('/thalaiyangam')}
                className="w-full bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-bold text-xs py-2.5 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>தலையங்கம் பகுதிக்குச் செல்க (Thalaiyangam)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>


              {/* 3. Live Climate Radar & Gold Rate Mini-Hub */}
              <div className="bg-gradient-to-br from-[#071330] via-[#0b1e4c] to-[#0e2a7a] text-white rounded-3xl p-5 border border-white/10 shadow-md space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                    <CloudSun className="w-4 h-4 text-amber-400" />
                    <span>நேரலை வானிலை & சந்தை</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    நிகழ்நேரம்
                  </span>
                </div>

                {/* Weather grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-[11px] text-slate-300 block font-bold">சென்னை</span>
                    <span className="text-base font-black text-amber-300 font-mono">31°C</span>
                    <span className="text-[9px] text-emerald-300 block">வெயில்</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-[11px] text-slate-300 block font-bold">மதுரை</span>
                    <span className="text-base font-black text-amber-300 font-mono">33°C</span>
                    <span className="text-[9px] text-amber-200 block">தெளிவான வானம்</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-[11px] text-slate-300 block font-bold">கோவை</span>
                    <span className="text-base font-black text-amber-300 font-mono">29°C</span>
                    <span className="text-[9px] text-blue-200 block">மிதமான காற்று</span>
                  </div>
                </div>

                {/* Gold & Silver quick rates */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-slate-200">22K தங்கம் (கி):</span>
                  </div>
                  <span className="font-black font-mono text-amber-300">₹12,800</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">வெள்ளி (கிராம்):</span>
                  <span className="font-black font-mono text-slate-100">₹200</span>
                </div>
              </div>

              {/* 4. Live News Wire Timeline Feed */}
              <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-black text-red-600">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>நேரலை செய்தி அலை (Live Wire)</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                </div>

                <div className="space-y-3 pt-1">
                  {pool.slice(0, 3).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => onOpenArticle ? onOpenArticle(item) : onNavigate(generateArticleUrl(item))}
                      className="border-l-2 border-red-500 pl-3 py-0.5 space-y-0.5 cursor-pointer hover:border-amber-400 transition group"
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="text-red-500 font-bold">{idx === 0 ? '5 நிமிடங்களுக்கு முன்' : `${(idx + 1) * 15} நிமிடங்களுக்கு முன்`}</span>
                        <span>•</span>
                        <span>{item.category || 'முக்கிய செய்தி'}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-amber-400 line-clamp-2 transition leading-snug">
                        {item.title}
                      </h5>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Reader Quick Opinion Poll Widget */}
              <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                  <BarChart3 className="w-4 h-4" />
                  <span>வாசகர் கருத்துக்கணிப்பு</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-relaxed">
                  2026-ஆம் ஆண்டு தமிழகத்தின் தொழில் முதலீடுகள் மற்றும் வேலைவாய்ப்புகள் வளர்ச்சி அடையும் என நம்புகிறீர்களா?
                </h4>

                {!pollVoted ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleVotePoll('yes')}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                    >
                      👍 ஆம்
                    </button>
                    <button
                      onClick={() => handleVotePoll('no')}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                    >
                      👎 இல்லை
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 animate-fade-in text-xs font-semibold">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>ஆம் ({yesPercent}%)</span>
                        <span className="font-mono">{pollCounts.yes} வாக்குகள்</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${yesPercent}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>இல்லை ({noPercent}%)</span>
                        <span className="font-mono">{pollCounts.no} வாக்குகள்</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${noPercent}%` }} />
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-500 font-bold text-center pt-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>உங்கள் கருத்து பதிவு செய்யப்பட்டது!</span>
                    </p>
                  </div>
                )}
              </div>

              {/* 6. Digital E-Paper Preview Card */}
              <div className="bg-gradient-to-br from-[#091538] via-[#0e2a7a] to-[#1e3a8a] text-white rounded-3xl p-5 border border-white/10 shadow-md space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>டிஜிட்டல் இ-பேப்பர்</span>
                </div>
                <h4 className="font-black text-sm leading-snug">
                  அமேஸ் டைம்ஸ் நாளிதழ் முழு மின்-பதிப்பு
                </h4>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  இன்றைய அனைத்து பக்கங்களையும் அச்சு வடிவில் ஆன்லைனில் வாசியுங்கள்.
                </p>
                <button
                  onClick={() => onNavigate('/epaper')}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>இ-பேப்பர் வாசிக்க</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 7. WhatsApp Community CTA */}
              <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>வாட்ஸ்அப் சேனல்</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  பிரேக்கிங் செய்திகளை உடனுக்குடன் உங்கள் வாட்ஸ்அப்பில் பெற இப்போதே இணையுங்கள்.
                </p>
                <button
                  onClick={() => window.open('https://chat.whatsapp.com', '_blank')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>வாட்ஸ்அப்பில் இணைய</span>
                </button>
              </div>

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
            {pool.slice(0, 4).map((story, i) => {
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
                      <span>{Number(story.views_count ?? story.viewsCount ?? 0).toLocaleString('ta-IN')}</span>
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
