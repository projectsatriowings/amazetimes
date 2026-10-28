import React, { useState, useEffect } from 'react';
import { X, Home, Grid, Radio, FileText, Bookmark, User, Building2, MapPin, Film, Trophy, TrendingUp, Sparkles, Flag, Globe, PenTool, Rss, BookOpen } from 'lucide-react';
import Header from './components/Header';
import Ticker from './components/Ticker';
import LiveWire from './components/LiveWire';
import HeroSpotlight from './components/HeroSpotlight';
import ShortsReels from './components/ShortsReels';
import AudioBrief from './components/AudioBrief';
import SecondaryNewsGrid from './components/SecondaryNewsGrid';
import QuizPoll from './components/QuizPoll';
import ZodiacWidget from './components/ZodiacWidget';
import EditorialView from './components/EditorialView';
import AanmegamView from './components/AanmegamView';
import BlogsView from './components/BlogsView';
import Footer from './components/Footer';
import ArticleModal from './components/ArticleModal';
import EPaperModal from './components/EPaperModal';
import LiveTVModal from './components/LiveTVModal';
import BookmarksDrawer from './components/BookmarksDrawer';
import DemoGuideModal from './components/DemoGuideModal';
import GoldCalculatorModal from './components/GoldCalculatorModal';
import GoldCalculatorBanner from './components/GoldCalculatorBanner';
import MagazineShowcase from './components/MagazineShowcase';
import MagazineHubSection from './components/MagazineHubSection';
import SpecialDaysFestivalCard from './components/SpecialDaysFestivalCard';
import CinemaAndSports from './components/CinemaAndSports';
import CinemaSportsHub from './components/CinemaSportsHub';
import CinemaSportsSpotlightBar from './components/CinemaSportsSpotlightBar';
import DistrictNewsHub from './components/DistrictNewsHub';
import GovernmentBirthdaySection from './components/GovernmentBirthdaySection';
import HomepageBirthdayPopup from './components/HomepageBirthdayPopup';
import { BirthdayWishModal } from './components/modals/BirthdayWishModal';
import VideoGallery from './components/VideoGallery';
import SearchModal from './components/SearchModal';
import RasiPalanModal from './components/RasiPalanModal';
import PWAInstallModal from './components/PWAInstallModal';
import MagazinePromoModal from './components/MagazinePromoModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import PushNotificationPrompt from './components/PushNotificationPrompt';
import SocialMediaPage from './pages/SocialMediaPage';
import ReporterDashboard from './pages/ReporterDashboard';
import CategoryPage from './pages/CategoryPage';
import { GoldMarketDashboard } from './components/GoldMarketDashboard';
import Toast from './components/Toast';
import NotFoundPage from './components/NotFoundPage';
import { normalizeTamilSpeech, chunkTamilText } from './utils/tamilSpeechNormalizer';

import AuthModal from './components/admin/AuthModal';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import LoginPage from './components/admin/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminErrorBoundary } from './components/admin/AdminErrorBoundary';
import UserAuthModal from './components/modals/UserAuthModal';
import UserProfileModal from './components/modals/UserProfileModal';

import { api, getCurrentUser, setCurrentUser as persistCurrentUser, setToken, getReaderUser, setReaderUser } from './services/api';
import { shortsStories as fallbackShorts } from './data/newsData';

export const DOMAINS_CONFIG = {
  all: {
    id: 'all',
    name: 'முதன்மைச் செய்திகள்',
    title: 'சமீபத்திய முக்கிய செய்திகள்',
    subtitle: 'நம்பகமான உடனுக்குடன் செய்திகள் • அமேஸ் டைம்ஸ்',
    badge: 'முதன்மை'
  },
  tamilnadu: {
    id: 'tamilnadu',
    name: 'தமிழ்நாடு',
    title: 'தமிழ்நாடு செய்திகள்',
    subtitle: 'தமிழகத்தின் முதன்மை அரசியல், சமூகம், நிர்வாகம் மற்றும் சமகால நிகழ்வுகள்',
    badge: 'மாநிலம்'
  },
  districts: {
    id: 'districts',
    name: 'மாவட்டங்கள்',
    title: 'மாவட்டச் செய்திகள்',
    subtitle: 'சென்னை, மதுரை, கோவை, திருச்சி உள்ளிட்ட அனைத்து மாவட்டங்களின் உள்ளூர் செய்திகள்',
    badge: 'மாவட்டங்கள்'
  },
  cinema: {
    id: 'cinema',
    name: 'சினிமா',
    title: 'திரை உலகம் & சினிமா செய்திகள்',
    subtitle: 'கோலிவுட் மற்றும் சர்வதேச திரைத்துறை நிகழ்வுகள், திரைப்பட விமர்சனங்கள்',
    badge: 'சினிமா'
  },
  sports: {
    id: 'sports',
    name: 'விளையாட்டு',
    title: 'விளையாட்டு களம்',
    subtitle: 'கிரிக்கெட், ஐபிஎல், தடகளம் மற்றும் சர்வதேச விளையாட்டுப் போட்டிகள்',
    badge: 'விளையாட்டு'
  },
  business: {
    id: 'business',
    name: 'வணிகம்',
    title: 'வணிகம் & பொருளாதாரம்',
    subtitle: 'பங்குச்சந்தை, தங்கம் விலை நிலவரம், தொழில் முதலீடுகள் மற்றும் நிதி செய்திகள்',
    badge: 'வணிகம்'
  },
  spiritual: {
    id: 'spiritual',
    name: 'ஆன்மிகம்',
    title: 'ஆன்மிகம் & பண்பாடு',
    subtitle: 'கோயில்கள், திருவிழாக்கள், வழிபாடு மற்றும் ஆன்மிக கட்டுரைகள்',
    badge: 'ஆன்மிகம்'
  },
  india: {
    id: 'india',
    name: 'தேசியம்',
    title: 'தேசியச் செய்திகள்',
    subtitle: 'இந்தியாவின் முதன்மை அரசியல் மற்றும் மாநிலங்களின் முக்கிய நிகழ்வுகள்',
    badge: 'தேசியம்'
  },
  world: {
    id: 'world',
    name: 'உலகம்',
    title: 'உலகச் செய்திகள்',
    subtitle: 'சர்வதேச அரசியல் மற்றும் முக்கிய உலக நிகழ்வுகள்',
    badge: 'சர்வதேசம்'
  },
  editorial: {
    id: 'editorial',
    name: 'தலையங்கம்',
    title: 'தலையங்கம் & சிறப்புப் பார்வை',
    subtitle: 'அமேஸ் டைம்ஸின் ஆழமான தலையங்கப் பார்வைகள் மற்றும் கட்டுரைகள்',
    badge: 'தலையங்கம்'
  },
  blogs: {
    id: 'blogs',
    name: 'வலைப்பதிவுகள்',
    title: 'வலைப்பதிவுகள்',
    subtitle: 'எழுத்தாளர்கள் மற்றும் வாசகர்களின் சிந்தனைக் களஞ்சியம்',
    badge: 'வலைப்பதிவு'
  },
  magazine: {
    id: 'magazine',
    name: 'மாத இதழ்',
    title: 'மாத இதழ்',
    subtitle: 'பிரத்யேக சிறப்பு கட்டுரைகள் மற்றும் மாத இதழ் பதிப்புகள்',
    badge: 'மாத இதழ்'
  }
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isDark, setIsDark] = useState(false);
  const [fontSizeClass, setFontSizeClass] = useState('font-size-md');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persistent Bookmarks State
  const [savedBookmarks, setSavedBookmarks] = useState(() => {
    try {
      const raw = localStorage.getItem('amaze_saved_bookmarks');
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('amaze_saved_bookmarks', JSON.stringify(savedBookmarks));
  }, [savedBookmarks]);

  // Realtime Liked Articles State (Database synced, Zero LocalStorage)
  const [likedArticles, setLikedArticles] = useState([]);

  // Reading History State
  const [readingHistory, setReadingHistory] = useState(() => {
    try {
      const raw = localStorage.getItem('amaze_reading_history');
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('amaze_reading_history', JSON.stringify(readingHistory));
  }, [readingHistory]);
  
  // User / Reader Auth Modal State
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  
  // URL Routing State (/ , /login , /admin)
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync category state with direct URL paths
  useEffect(() => {
    const p = (window.location.pathname || '').toLowerCase().replace(/\/$/, '');
    if (p === '/editorial' || p === '/thalaiyangam') {
      setActiveCategory('editorial');
    } else if (p === '/blogs' || p === '/valaipathivugal') {
      setActiveCategory('blogs');
    } else if (p === '/spiritual' || p === '/aanmeegam') {
      setActiveCategory('spiritual');
    }
  }, [currentPath]);

  // Reader (Authentication & Profile) State - Auto Purge temporary/mock users
  const [readerUser, setReaderUserState] = useState(() => {
    const u = getReaderUser();
    // Auto purge any stale temporary mock accounts from previous sessions
    if (u && (u.name === 'வாசகர் கண்ணன்' || u.full_name === 'வாசகர் கண்ணன்' || u.email?.includes('kannan') || u.id === 'goog_12345' || (typeof u.id === 'string' && u.id.startsWith('goog_')))) {
      setReaderUser(null);
      return null;
    }
    return u;
  });

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalInitialTab, setProfileModalInitialTab] = useState('profile');

  const handleOpenProfileModal = (tab = 'profile') => {
    setProfileModalInitialTab(tab);
    setIsProfileModalOpen(true);
  };

  const handleGoogleLogin = () => {
    setIsUserAuthOpen(true);
  };

  const handleReaderLogout = () => {
    setReaderUser(null);
    setReaderUserState(null);
    setToken(null);
    addToast('கணக்கிலிருந்து வெற்றிகரமாக வெளியேறிவிட்டீர்கள்.', 'logout');
  };

  // Authentication & Admin Console State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Listen to 401 auth-expired event from API service
  useEffect(() => {
    const onAuthExpired = () => {
      setCurrentUser(null);
      if (currentPath === '/admin') {
        navigateTo('/login');
      }
      addToast('அனுமதிச் சான்று காலாவதியாகிவிட்டது. மீண்டும் உள்நுழையவும்.', 'warning');
    };
    window.addEventListener('amaze:auth_expired', onAuthExpired);
    return () => window.removeEventListener('amaze:auth_expired', onAuthExpired);
  }, [currentPath]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [dashboardInitialTab, setDashboardInitialTab] = useState('overview');
  const [dashboardTargetArticle, setDashboardTargetArticle] = useState(null);

  // Dynamic PostgreSQL Backend Data State
  const [backendArticles, setBackendArticles] = useState([]);
  const [backendLeadArticle, setBackendLeadArticle] = useState(null);
  const [backendTickers, setBackendTickers] = useState([]);
  const [backendLiveWire, setBackendLiveWire] = useState([]);
  const [backendShorts, setBackendShorts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);

  // Modals state
  const [activeModalArticle, setActiveModalArticle] = useState(null);
  const [isEPaperOpen, setIsEPaperOpen] = useState(false);
  const [isLiveTVOpen, setIsLiveTVOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isGoldCalculatorOpen, setIsGoldCalculatorOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRasiModalOpen, setIsRasiModalOpen] = useState(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);

  // Extra loaded cards state for "Load More"
  const [extraCards, setExtraCards] = useState([]);

  // Toast state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, icon = 'info') => {
    const newToast = { id: Date.now() + Math.random(), message, icon };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Track unique visitor and continuous 20s heartbeat to keep live reader stats accurate
  useEffect(() => {
    const device = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    api.trackVisitor(device).catch(() => {});

    const sendPing = () => {
      api.sendHeartbeat().catch(() => {});
    };
    sendPing();
    const heartbeatInterval = setInterval(sendPing, 20000);
    return () => clearInterval(heartbeatInterval);
  }, []);

  // Fetch live content from Neon PostgreSQL (Unlimited News, Home Builder Layout, Zero Cache Delay)
  const fetchBackendContent = async (category = activeCategory, resetPage = true) => {
    try {
      const pageToFetch = resetPage ? 1 : currentPage;
      const params = {
        page: pageToFetch,
        limit: 'all', // Unlimited news - displays every published article from PostgreSQL!
        status: 'published',
        _t: Date.now() // Cache-busting timestamp ensures instant updates
      };
      if (category !== 'all') {
        params.category = category;
      }

      const [artRes, tickerRes, lwRes, shortsRes, layoutRes] = await Promise.all([
        api.getArticles(params),
        api.getTickers().catch(() => ({ success: false })),
        api.getLiveWire().catch(() => ({ success: false })),
        api.getShorts().catch(() => ({ success: false })),
        api.getHomeBuilderLayout().catch(() => ({ success: false }))
      ]);

      const articlesArr = (artRes && (artRes.articles || artRes.data || artRes.news)) || [];
      if (artRes?.success && Array.isArray(articlesArr) && articlesArr.length > 0) {
        const formattedArticles = articlesArr.map(a => ({
          id: a.id,
          _id: a._id || String(a.id),
          title: a.title,
          category: a.category || a.category_name || a.category_id || 'செய்தி',
          cat: a.category || a.category_name || a.category_id || 'செய்தி',
          category_id: a.category_id || a.category || 'all',
          subtitle: a.subtitle || '',
          desc: a.summary || a.desc || a.excerpt || a.subtitle || (a.content ? a.content.substring(0, 160) + '...' : ''),
          content: a.content || a.body || a.summary || '',
          body: a.content || a.body || a.summary || '',
          image: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
          img: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
          cover_image_url: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
          author: a.authorName || a.author || a.author_name || 'செய்தி ஆசிரியர்',
          authorName: a.authorName || a.author || a.author_name || 'செய்தி ஆசிரியர்',
          time: new Date(a.publishedAt || a.published_at || a.createdAt || a.created_at || Date.now()).toLocaleDateString('ta-IN', { hour: '2-digit', minute: '2-digit' }),
          tags: Array.isArray(a.tags) ? a.tags : (a.tags ? String(a.tags).split(',').map(t => t.trim()) : []),
          tag: (Array.isArray(a.tags) && a.tags[0]) || 'செய்தி',
          isLead: Boolean(a.isLeadHero || a.is_lead_hero || a.isLead || a.is_lead),
          isBreaking: Boolean(a.isBreaking || a.is_breaking),
          isTopStory: Boolean(a.isTopStory || a.is_top_story),
          displayOrder: a.displayOrder || a.display_order || 0,
          viewCount: a.viewsCount || a.views_count || a.view_count || 0,
          viewsCount: a.viewsCount || a.views_count || a.view_count || 0,
          likesCount: a.likesCount || a.likes_count || 0,
          likes_count: a.likesCount || a.likes_count || 0
        }));

        // Determine Lead Hero (Priority: Home Builder setting if on homepage -> isLeadHero flag -> first article)
        let lead = null;
        if (category === 'all' && layoutRes && layoutRes.success && layoutRes.data?.leadHero) {
          const heroMatch = formattedArticles.find(a => String(a.id) === String(layoutRes.data.leadHero.id));
          if (heroMatch) lead = heroMatch;
        }
        if (!lead) {
          lead = formattedArticles.find(a => a.isLead) || formattedArticles[0];
        }
        const cards = formattedArticles.filter(a => String(a.id) !== String(lead?.id));

        setBackendLeadArticle(lead);
        setBackendArticles(cards);
        setHasMoreArticles(false);
      } else {
        setBackendLeadArticle(null);
        setBackendArticles([]);
        setHasMoreArticles(false);
      }

      if (tickerRes?.success) setBackendTickers(tickerRes.tickers);
      if (lwRes?.success) setBackendLiveWire(lwRes.items);
      if (shortsRes?.success && Array.isArray(shortsRes.stories)) {
        setBackendShorts(shortsRes.stories.map(s => ({
          id: s.id,
          headline: s.headline,
          desc: s.description,
          img: s.media_url,
          media_type: s.media_type
        })));
      }
    } catch (err) {
      console.warn('Backend fetch error:', err.message);
    }
  };

  // Re-fetch whenever activeCategory or currentPath changes to '/' (instant return from Admin)
  useEffect(() => {
    if (currentPath === '/') {
      fetchBackendContent(activeCategory, true);
      setExtraCards([]);
      setCurrentPage(1);
    }
  }, [activeCategory, currentPath]);

  // Live listener: Instantly refresh homepage when admin modifies any content
  useEffect(() => {
    const handleLiveContentUpdate = () => {
      fetchBackendContent(activeCategory, true);
    };
    window.addEventListener('amaze:content_updated', handleLiveContentUpdate);
    return () => window.removeEventListener('amaze:content_updated', handleLiveContentUpdate);
  }, [activeCategory]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      addToast('இரவுப் பார்வை (Dark Mode) செயல்படுத்தப்பட்டது.', 'dark_mode');
    } else {
      document.documentElement.classList.remove('dark');
      addToast('பகல் பார்வை (Light Mode) செயல்படுத்தப்பட்டது.', 'light_mode');
    }
  };

  // Font size change
  const handleChangeFontSize = (sizeClass) => {
    setFontSizeClass(sizeClass);
    addToast('எழுத்து அளவு மாற்றப்பட்டது.', 'format_size');
  };

  // Speech synthesis with normalization & sentence chunking
  const speakTamilText = (text) => {
    if (!text) return;
    const normalized = normalizeTamilSpeech(text);

    // Try HTML5 Audio Stream if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const streamUrl = `/api/tts/stream?text=${encodeURIComponent(normalized)}`;
        const audio = new Audio(streamUrl);
        audio.play().then(() => {
          addToast('குரல் செய்தி வாசிக்கப்படுகிறது...', 'volume_up');
        }).catch(() => {
          speakFallback(normalized);
        });
        return;
      } catch (_) {}
    }
    speakFallback(normalized);
  };

  const speakFallback = (normalized) => {
    if (!window.speechSynthesis) {
      addToast('உங்கள் உலாவியில் குரல் வசதி ஆதரிக்கப்படவில்லை.', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const chunks = chunkTamilText(normalized, 140);
    let idx = 0;
    const speakNext = () => {
      if (idx >= chunks.length) return;
      const utterance = new SpeechSynthesisUtterance(chunks[idx]);
      utterance.lang = 'ta-IN';
      utterance.rate = 0.95;
      utterance.onend = () => {
        idx++;
        speakNext();
      };
      utterance.onerror = () => {
        idx++;
        speakNext();
      };
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
    addToast('குரல் செய்தி வாசிக்கப்படுகிறது...', 'volume_up');
  };

  // Bookmark toggle
  const handleBookmark = (article) => {
    if (!article || !article.id) return;
    const exists = savedBookmarks.some((b) => String(b.id) === String(article.id));
    if (!exists) {
      setSavedBookmarks(prev => [
        ...prev,
        {
          id: article.id,
          title: article.title,
          category: article.category || article.cat || 'செய்தி',
          image: article.image || article.img || article.cover_image_url || '/Amaze times.jpg',
          savedAt: new Date().toISOString()
        }
      ]);
      addToast('செய்தி வெற்றியோடு சேமிக்கப்பட்டது! 🔖', 'bookmark_added');
    } else {
      setSavedBookmarks(prev => prev.filter((b) => String(b.id) !== String(article.id)));
      addToast('சேமிப்பிலிருந்து நீக்கப்பட்டது.', 'delete');
    }
  };

  const handleRemoveBookmark = (id) => {
    setSavedBookmarks(prev => prev.filter((b) => String(b.id) !== String(id)));
    addToast('சேமிப்பிலிருந்து நீக்கப்பட்டது.', 'delete');
  };

  const handleClearAllBookmarks = () => {
    setSavedBookmarks([]);
    addToast('அனைத்து சேமிப்புகளும் அழிக்கப்பட்டன.', 'delete_sweep');
  };

  // Liked Articles Handlers with PostgreSQL persistence
  const handleToggleLike = async (article) => {
    if (!article || !article.id) return;
    const artId = article.id;
    const exists = likedArticles.some(a => String(a.id) === String(artId));

    // Optimistic UI updates
    setLikedArticles((prev) => {
      let updated;
      if (exists) {
        updated = prev.filter(a => String(a.id) !== String(artId));
        addToast('விருப்பப் பட்டியலிலிருந்து நீக்கப்பட்டது.', 'favorite_border');
      } else {
        updated = [{
          id: article.id,
          title: article.title,
          category: article.category || article.cat || 'செய்தி',
          image: article.image || article.img || article.cover_image_url || '/Amaze times.jpg',
          likedAt: new Date().toISOString()
        }, ...prev];
        addToast('செய்திக்கு விருப்பம் தெரிவிக்கப்பட்டது! ❤️', 'favorite');
      }
      return updated;
    });

    // Sync to PostgreSQL database
    try {
      const res = await api.toggleNewsLike(artId);
      if (res && res.success && typeof res.likesCount === 'number') {
        setBackendArticles(prev => prev.map(a => String(a.id) === String(artId) ? { ...a, likesCount: res.likesCount, likes_count: res.likesCount } : a));
        setBackendLeadArticle(prev => prev && String(prev.id) === String(artId) ? { ...prev, likesCount: res.likesCount, likes_count: res.likesCount } : prev);
        setActiveModalArticle(prev => prev && String(prev.id) === String(artId) ? { ...prev, likesCount: res.likesCount, likes_count: res.likesCount } : prev);
      }
    } catch (e) {
      console.warn('Background like sync to PostgreSQL failed:', e);
    }
  };

  const handleRemoveLikedArticle = (id) => {
    setLikedArticles(prev => prev.filter(a => String(a.id) !== String(id)));
    addToast('விருப்பப் பட்டியலிலிருந்து நீக்கப்பட்டது.', 'delete');
  };

  const handleClearAllLiked = () => {
    setLikedArticles([]);
    addToast('அனைத்து விருப்பங்களும் அழிக்கப்பட்டன.', 'delete_sweep');
  };

  // Reading History Handlers
  const addToReadingHistory = (art) => {
    if (!art || !art.id) return;
    setReadingHistory((prev) => {
      const filtered = prev.filter(item => String(item.id) !== String(art.id));
      return [{
        id: art.id,
        title: art.title,
        category: art.category || art.cat || 'செய்தி',
        image: art.image || art.img || article?.cover_image_url || '/Amaze times.jpg',
        readAt: new Date().toISOString()
      }, ...filtered].slice(0, 50);
    });
  };

  const handleClearReadingHistory = () => {
    setReadingHistory([]);
    addToast('வாசிப்பு வரலாறு அழிக்கப்பட்டது.', 'delete_sweep');
  };

  // Category select
  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    if (currentPath !== '/') {
      navigateTo('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load More Articles
  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    try {
      const params = {
        page: nextPage,
        limit: 6,
        status: 'published'
      };
      if (activeCategory !== 'all') params.category = activeCategory;

      const artRes = await api.getArticles(params);
      const moreArticles = (artRes && (artRes.articles || artRes.data || artRes.news)) || [];
      if (artRes?.success && Array.isArray(moreArticles) && moreArticles.length > 0) {
        const moreFormatted = moreArticles.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category || a.category_name || a.category_id || 'செய்தி',
          cat: a.category || a.category_name || a.category_id || 'செய்தி',
          category_id: a.category_id || a.category || 'all',
          subtitle: a.subtitle || '',
          desc: a.summary || a.desc || a.excerpt || a.subtitle || (a.content ? a.content.substring(0, 150) + '...' : ''),
          content: a.content || a.body || a.summary || '',
          body: a.content || a.body || a.summary || '',
          image: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
          img: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
          cover_image_url: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
          author: a.authorName || a.author || a.author_name || 'செய்தி ஆசிரியர்',
          time: new Date(a.created_at).toLocaleDateString('ta-IN', { hour: '2-digit', minute: '2-digit' }),
          tags: a.tags || [],
          tag: (a.tags && a.tags[0]) || 'செய்தி',
          isLead: false
        }));

        setExtraCards(prev => [...prev, ...moreFormatted]);
        addToast(`${moreFormatted.length} கூடுதல் செய்திகள் ஏற்றப்பட்டன!`, 'refresh');
      } else {
        addToast('மேலும் செய்திகள் இல்லை.', 'info');
      }
    } catch (err) {
      addToast('செய்திகள் ஏற்றுவதில் பிழை.', 'error');
    }
  };

  // Share to WhatsApp
  const handleShareWhatsApp = (title) => {
    const text = encodeURIComponent(`*அமேஸ் டைம்ஸ் செய்தி:* ${title}\n\nமேலும் படிக்க: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Open Full Article Modal & Record History with permanent atomic view increment
  const openArticleModal = async (articleOrId) => {
    let target = null;
    if (typeof articleOrId === 'object' && articleOrId !== null) {
      target = articleOrId;
    } else {
      const id = articleOrId;
      target = backendArticles.find(a => a.id === id) || (backendLeadArticle?.id === id ? backendLeadArticle : null) || extraCards.find(a => a.id === id) || fallbackArticlesData[id] || Object.values(fallbackArticlesData).find(a => a.id === id) || {
        id,
        title: `செய்தி விவரம்`,
        desc: 'செய்தி விவரங்கள் ஏற்றப்படுகின்றன...',
        category: 'செய்தி'
      };
    }
    setActiveModalArticle(target);
    addToReadingHistory(target);

    // Atomically increment views in Neon PostgreSQL
    if (target && target.id) {
      try {
        const res = await api.recordNewsView(target.id);
        if (res && res.success && typeof res.viewsCount === 'number') {
          setActiveModalArticle(prev => prev ? { ...prev, viewCount: res.viewsCount, viewsCount: res.viewsCount } : prev);
          setBackendArticles(prev => prev.map(a => String(a.id) === String(target.id) ? { ...a, viewCount: res.viewsCount, viewsCount: res.viewsCount } : a));
          setBackendLeadArticle(prev => prev && String(prev.id) === String(target.id) ? { ...prev, viewCount: res.viewsCount, viewsCount: res.viewsCount } : prev);
        }
      } catch (e) {
        console.warn('Background view increment failed:', e);
      }
    }
  };

  // Protect /admin: if visited while not logged in, route to /login
  useEffect(() => {
    if (currentPath === '/admin' && (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'reporter'))) {
      navigateTo('/login');
    }
  }, [currentPath, currentUser]);

  // Auth & Admin Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    persistCurrentUser(user);
    setDashboardInitialTab('overview');
    setDashboardTargetArticle(null);
    navigateTo('/admin');
  };

  const handleLogout = () => {
    setToken(null);
    persistCurrentUser(null);
    setCurrentUser(null);
    setIsDashboardOpen(false);
    addToast('வெற்றிகரமாக வெளியேறிவிட்டீர்கள்.', 'logout');
    navigateTo('/login');
  };

  // Direct In-Context Admin Handlers
  const handleAdminEditArticle = (article) => {
    setDashboardTargetArticle(article);
    setDashboardInitialTab('articles');
    navigateTo('/admin');
  };

  const handleAdminDeleteArticle = async (id) => {
    if (!window.confirm('இச்செய்தியை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?')) return;
    try {
      await api.deleteArticle(id);
      addToast('செய்தி நீக்கப்பட்டது', 'delete');
      fetchBackendContent(activeCategory, true);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAdminNewArticle = () => {
    setDashboardTargetArticle(null);
    setDashboardInitialTab('articles');
    navigateTo('/admin');
  };

  const handleAdminNewVideo = () => {
    setDashboardInitialTab('videos');
    navigateTo('/admin');
  };

  const handleAdminEditVideo = (video) => {
    setDashboardInitialTab('videos');
    navigateTo('/admin');
  };

  const handleAdminDeleteVideo = async (id) => {
    if (!window.confirm('இந்த வீடியோ பதிவை நீக்க விரும்புகிறீர்களா?')) return;
    try {
      await api.deleteShort(id);
      addToast('வீடியோ செய்தி நீக்கப்பட்டது', 'delete');
      fetchBackendContent(activeCategory, true);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAdminOpenZodiac = () => {
    setDashboardInitialTab('zodiac');
    navigateTo('/admin');
  };

  const isAdmin = currentUser?.role === 'admin';

  // Domain Importance Metadata Configuration
  const currentDomain = DOMAINS_CONFIG[activeCategory] || {
    id: activeCategory,
    name: activeCategory,
    title: `${activeCategory} செய்திகள்`,
    subtitle: 'அமேஸ் டைம்ஸ் சிறப்பு செய்திப் பிரிவு',
    badge: 'செய்தி'
  };

  // 100% Authentic Database News — Real Lead Hero & Display Cards directly from PostgreSQL
  const leadData = backendLeadArticle;
  const rawCards = [...backendArticles, ...extraCards];
  // Deduplicate by id to prevent duplicated cards when combining primary news with paginated lists
  let displayCards = Array.from(new Map(rawCards.map(a => [String(a.id || a._id), a])).values());

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayCards = displayCards.filter(
      (c) => c.title?.toLowerCase().includes(q) || c.desc?.toLowerCase().includes(q)
    );
  }

  const storiesToDisplay = backendShorts.length > 0 ? backendShorts : fallbackShorts;
  const activeStory = activeStoryIndex !== null ? storiesToDisplay[activeStoryIndex] : null;

  // ROUTE 1: Dedicated Login Page (/login)
  if (currentPath === '/login') {
    return (
      <div className={`min-h-screen ${fontSizeClass}`}>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => navigateTo('/')}
          onToast={addToast}
        />
        <Toast toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  // ROUTE 2: Dedicated Admin Console (/admin)
  if (currentPath === '/admin') {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'reporter')) {
      return (
        <div className={`min-h-screen ${fontSizeClass}`}>
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => navigateTo('/')}
            onToast={addToast}
          />
          <Toast toasts={toasts} onRemoveToast={removeToast} />
        </div>
      );
    }

    return (
      <div className={`min-h-screen ${fontSizeClass}`}>
        <AdminErrorBoundary sectionName="அமேஸ் டைம்ஸ் நிர்வாக மையம் (Admin Dashboard)" onResetTab={() => navigateTo('/')}>
          <AdminDashboard />
        </AdminErrorBoundary>
        <Toast toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  // ROUTE 3: Dedicated Reporter Portal (/reporter)
  if (currentPath === '/reporter') {
    if (!currentUser || (currentUser.role !== 'reporter' && currentUser.role !== 'admin')) {
      return (
        <div className={`min-h-screen ${fontSizeClass}`}>
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => navigateTo('/')}
            onToast={addToast}
          />
          <Toast toasts={toasts} onRemoveToast={removeToast} />
        </div>
      );
    }

    return (
      <div className={`min-h-screen ${fontSizeClass}`}>
        <ReporterDashboard />
        <Toast toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col w-full max-w-full overflow-x-hidden min-w-0 ${fontSizeClass}`}>
      {/* Newspaper Header with Unified Top Utility Strip */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onToggleDarkMode={toggleDarkMode}
        isDark={isDark}
        fontSizeClass={fontSizeClass}
        onChangeFontSize={handleChangeFontSize}
        savedBookmarksCount={savedBookmarks.length}
        likedArticlesCount={likedArticles.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenProfileModal={handleOpenProfileModal}
        onOpenEPaper={() => setIsEPaperOpen(true)}
        onOpenLiveTV={() => setIsLiveTVOpen(true)}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onOpenGoldCalculator={() => setIsGoldCalculatorOpen(true)}
        onOpenPWAInstall={() => setIsPWAInstallModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onSpeak={speakTamilText}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        articles={backendArticles.length > 0 ? backendArticles : displayCards}
        onOpenArticle={openArticleModal}
        readerUser={readerUser}
        onGoogleLogin={handleGoogleLogin}
        onOpenUserAuth={() => setIsUserAuthOpen(true)}
        onReaderLogout={handleReaderLogout}
        onNavigate={navigateTo}
      />

      {/* Ticker Ribbons (Connected to Live Data & Neon DB) */}
      <Ticker 
        tickers={backendTickers} 
        onOpenGoldCalculator={() => setIsGoldCalculatorOpen(true)}
      />

      {/* Dina Thanthi-style High Visibility Cinema & Sports Spotlight Bar */}
      <CinemaSportsSpotlightBar
        onOpenSearch={(query) => {
          setSearchQuery(query);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-2.5 sm:px-4 py-3 sm:py-6 flex-1 w-full max-w-full min-w-0 overflow-x-hidden space-y-8 sm:space-y-12 pb-20 sm:pb-8">
        
        {/* Route Handlers: Social Media Hub, Editorial, Blogs, Aanmeegam, Known Routes & 404 Error Page */}
        {(currentPath !== '/' && currentPath !== '/editorial' && currentPath !== '/blogs' && currentPath !== '/spiritual' && currentPath !== '/thalaiyangam' && currentPath !== '/valaipathivugal' && currentPath !== '/aanmeegam') ? (
          currentPath === '/social-media' ? (
            <SocialMediaPage onNavigate={navigateTo} onToast={addToast} />
          ) : (
            <NotFoundPage onNavigate={navigateTo} onSelectCategory={handleSelectCategory} />
          )
        ) : (activeCategory === 'editorial' || currentPath === '/editorial' || currentPath === '/thalaiyangam') ? (
          <EditorialView
            articles={backendArticles.length > 0 ? backendArticles : (currentFallback.cards || [])}
            onOpenArticle={openArticleModal}
            onSpeak={speakTamilText}
            onBookmark={handleBookmark}
            savedBookmarks={savedBookmarks}
          />
        ) : (activeCategory === 'blogs' || currentPath === '/blogs' || currentPath === '/valaipathivugal') ? (
          <BlogsView
            onOpenArticle={openArticleModal}
            onSpeak={speakTamilText}
            onBookmark={handleBookmark}
            savedBookmarks={savedBookmarks}
            onToast={addToast}
          />
        ) : (activeCategory === 'spiritual' || currentPath === '/spiritual' || currentPath === '/aanmeegam') ? (
          /* Dedicated Aanmegam Broadsheet View */
          <AanmegamView
            onOpenArticle={openArticleModal}
            onSpeak={speakTamilText}
            onBookmark={handleBookmark}
            savedBookmarks={savedBookmarks}
          />
        ) : (
          <>
            {/* DOMAIN IMPORTANCE HEADER (Displayed when a specific category/domain is chosen) */}
            {activeCategory !== 'all' && currentDomain && (
              <div className="bg-gradient-to-r from-[#091538] via-[#0e2a7a] to-[#1e3a8a] text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-white/10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <button 
                        onClick={() => handleSelectCategory('all')} 
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>முகப்பு</span>
                      </button>
                      <span>›</span>
                      <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
                        {currentDomain.badge}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black font-title text-white tracking-tight">
                      {currentDomain.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl">
                      {currentDomain.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="bg-white/10 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-white/15">
                      {leadData ? 1 + displayCards.length : displayCards.length} செய்திகள்
                    </span>
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="bg-white hover:bg-slate-100 text-[#0e2a7a] font-extrabold text-xs px-4 py-1.5 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      அனைத்து முதன்மைச் செய்திகள்
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DOMAIN EMPTY STATE: Shown when category has no database articles yet */}
            {(!leadData && displayCards.length === 0) ? (
              <div className="bg-white dark:bg-[#0f1b3d] rounded-3xl p-8 sm:p-14 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto my-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentDomain?.title || 'செய்திகள்'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  இப்பிரிவில் கூடுதல் செய்திகள் விரைவில் சேர்க்கப்படும். நிர்வாகம் அல்லது நிருபர் மூலம் புதிய செய்திகள் உடனுக்குடன் பதிவேற்றப்படும்.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition cursor-pointer"
                  >
                    அனைத்து முதன்மைச் செய்திகளைப் படிக்கவும்
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 1. HERO SPOTLIGHT: 3-Column Power Layout (Lead 5-cols + Top Reads/Radar 4-cols + Publications 3-cols) */}
                {leadData && (
                  <HeroSpotlight
                    leadData={leadData}
                    topArticles={displayCards}
                    onOpenArticle={openArticleModal}
                    onSpeak={speakTamilText}
                    onShareWhatsApp={handleShareWhatsApp}
                    onBookmark={handleBookmark}
                    savedBookmarks={savedBookmarks}
                    onToggleLike={handleToggleLike}
                    isLiked={likedArticles.some(a => String(a.id) === String(leadData?.id))}
                    onOpenEPaper={() => setIsEPaperOpen(true)}
                    onSelectCategory={handleSelectCategory}
                  />
                )}

                {/* 2. DOMAIN-SPECIFIC HUBS (Scoped to active category) */}
                {activeCategory === 'districts' && (
                  <DistrictNewsHub
                    articles={displayCards}
                    onOpenArticle={openArticleModal}
                    onOpenEPaper={() => setIsEPaperOpen(true)}
                  />
                )}

                {(activeCategory === 'cinema' || activeCategory === 'sports') && (
                  <div id="cinema-and-sports">
                    <CinemaAndSports onOpenArticle={openArticleModal} />
                  </div>
                )}

                {activeCategory === 'business' && (
                  <>
                    <GoldCalculatorBanner onOpenCalculator={() => setIsGoldCalculatorOpen(true)} />
                    <section className="space-y-4" id="business-commodity">
                      <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-2">
                        <h2 className="text-xl sm:text-2xl font-black text-[#0a1945] dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
                          <span>நேரலை தங்கம் & வெள்ளி சந்தை நிலவரம் (Live Commodity Dashboard)</span>
                        </h2>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                          நேரலை விலை
                        </span>
                      </div>
                      <GoldMarketDashboard />
                    </section>
                  </>
                )}

                {/* 3. GENERAL HOMEPAGE SHOWCASES (Only rendered on 'all' / Main Frontpage) */}
                {activeCategory === 'all' && (
                  <>
                    <GoldCalculatorBanner onOpenCalculator={() => setIsGoldCalculatorOpen(true)} />

                    <section className="space-y-4" id="business-commodity">
                      <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-2">
                        <h2 className="text-xl sm:text-2xl font-black text-[#0a1945] dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
                          <span>நேரலை தங்கம் & வெள்ளி சந்தை நிலவரம் (Live Commodity Dashboard)</span>
                        </h2>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                          நேரலை விலை
                        </span>
                      </div>
                      <GoldMarketDashboard />
                    </section>

                    <div id="cinema-and-sports">
                      <CinemaAndSports onOpenArticle={openArticleModal} />
                    </div>

                    <DistrictNewsHub
                      articles={displayCards}
                      onOpenArticle={openArticleModal}
                      onOpenEPaper={() => setIsEPaperOpen(true)}
                    />

                    <GovernmentBirthdaySection onToast={addToast} />
                    <SpecialDaysFestivalCard onToast={addToast} />
                    <MagazineHubSection
                      onOpenEPaper={() => setIsEPaperOpen(true)}
                      onToast={addToast}
                    />
                  </>
                )}

                {/* 4. STATEWIDE & CATEGORY NEWS GRID */}
                <SecondaryNewsGrid
                  categoryTitle={currentDomain?.title}
                  categorySubtitle={currentDomain?.subtitle}
                  cards={displayCards}
                  onOpenArticle={openArticleModal}
                  onBookmark={handleBookmark}
                  savedBookmarks={savedBookmarks}
                  onToggleLike={handleToggleLike}
                  likedArticles={likedArticles}
                  onLoadMore={handleLoadMore}
                />
              </>
            )}

            {/* 9. MULTIMEDIA, COMMUNITY & LIVE FEEDS BAND */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start pt-2">
              {/* Col A (4 cols): Live Wire Feed + Audio Brief */}
              <div className="lg:col-span-4 space-y-6">
                <LiveWire
                  onOpenArticle={openArticleModal}
                  onSpeak={speakTamilText}
                  items={backendLiveWire}
                />
                <AudioBrief onSpeak={speakTamilText} />
              </div>

              {/* Col B (4 cols): Video Shorts & Reels */}
              <div className="lg:col-span-4">
                <ShortsReels
                  stories={storiesToDisplay}
                  onOpenStory={(idx) => setActiveStoryIndex(idx)}
                />
              </div>

              {/* Col C (4 cols): Zodiac Widget (12 Signs) & Reader Opinion Poll */}
              <div className="lg:col-span-4 space-y-6">
                <ZodiacWidget onSpeak={speakTamilText} />
                <QuizPoll onToast={addToast} />
              </div>
            </div>

            {/* 10. VIDEO & SOCIAL MEDIA HUB (YouTube, Instagram Reels, Facebook) */}
            <VideoGallery onOpenVideoPlayer={(vid) => setActiveVideoPlayer(vid)} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenEPaper={() => setIsEPaperOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onSpeak={speakTamilText}
        onToast={addToast}
        onNavigate={navigateTo}
      />

      {/* 5. STICKY MOBILE BOTTOM NAVIGATION BAR */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070d1e]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-2 py-1.5 flex items-center justify-around safe-bottom">
        
        {/* Home Tab */}
        <button
          onClick={() => {
            handleSelectCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'text-red-600 dark:text-red-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">முகப்பு</span>
        </button>

        {/* Categories Tab */}
        <button
          onClick={() => {
            const navEl = document.querySelector('nav');
            if (navEl) {
              navEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-all cursor-pointer"
        >
          <Grid className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">பிரிவுகள்</span>
        </button>

        {/* Live 24x7 Tab */}
        <button
          onClick={() => setIsLiveTVOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-red-600 dark:text-red-400 font-extrabold transition-all cursor-pointer relative"
        >
          <div className="relative">
            <Radio className="w-4 h-4 mb-0.5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          </div>
          <span className="text-[10px] tracking-tight">24x7 நேரலை</span>
        </button>

        {/* E-Paper Tab */}
        <button
          onClick={() => setIsEPaperOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#0e2a7a] dark:hover:text-amber-400 font-semibold transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">மின்-இதழ்</span>
        </button>

        {/* Bookmarks / Account Tab */}
        <button
          onClick={() => {
            if (readerUser) {
              setIsBookmarksOpen(true);
            } else {
              setIsUserAuthOpen(true);
            }
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-all cursor-pointer relative"
        >
          <div className="relative">
            {readerUser ? <Bookmark className="w-4 h-4 mb-0.5 text-amber-500" /> : <User className="w-4 h-4 mb-0.5" />}
            {savedBookmarks.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {savedBookmarks.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{readerUser ? 'சேமித்தவை' : 'கணக்கு'}</span>
        </button>

      </div>

      {/* Modals & Overlays */}
      <ArticleModal
        isOpen={Boolean(activeModalArticle)}
        onClose={() => {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          setActiveModalArticle(null);
        }}
        articleData={activeModalArticle}
        onSpeak={speakTamilText}
        onShareWhatsApp={handleShareWhatsApp}
        onToggleBookmark={handleBookmark}
        isBookmarked={savedBookmarks.some(b => String(b.id) === String(activeModalArticle?.id))}
        onToggleLike={handleToggleLike}
        isLiked={likedArticles.some(a => String(a.id) === String(activeModalArticle?.id))}
      />

      <EPaperModal
        isOpen={isEPaperOpen}
        onClose={() => setIsEPaperOpen(false)}
        onToast={addToast}
      />

      <LiveTVModal
        isOpen={isLiveTVOpen}
        onClose={() => {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          setIsLiveTVOpen(false);
        }}
        onSpeak={speakTamilText}
        onToast={addToast}
      />

      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />

      {/* Gold & Silver Rate Calculator Modal */}
      <GoldCalculatorModal
        isOpen={isGoldCalculatorOpen}
        onClose={() => setIsGoldCalculatorOpen(false)}
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedBookmarks={savedBookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onClearAll={handleClearAllBookmarks}
        onOpenArticle={openArticleModal}
      />

      {/* Reader Profile Management Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        readerUser={readerUser}
        onUpdateUser={(updated) => {
          setReaderUserState(updated);
          setReaderUser(updated);
        }}
        onLogout={handleReaderLogout}
        savedBookmarks={savedBookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onClearAllBookmarks={handleClearAllBookmarks}
        likedArticles={likedArticles}
        onRemoveLikedArticle={handleRemoveLikedArticle}
        onClearAllLiked={handleClearAllLiked}
        readingHistory={readingHistory}
        onClearReadingHistory={handleClearReadingHistory}
        onOpenArticle={openArticleModal}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
        fontSizeClass={fontSizeClass}
        onChangeFontSize={handleChangeFontSize}
        onToast={addToast}
        initialTab={profileModalInitialTab}
      />

      {/* Reader User Sign-In & Sign-Up Modal */}
      <UserAuthModal
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        onUserSuccess={(user) => {
          setReaderUserState(user);
          setReaderUser(user);
          if (user.role === 'admin' || user.role === 'reporter') {
            setCurrentUser(user);
            persistCurrentUser(user);
          }
        }}
        onToast={addToast}
      />

      {/* Admin / Reporter Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onToast={addToast}
      />

      {/* Full Admin & Reporter Dashboard Console */}
      <AdminDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => {
          setIsDashboardOpen(false);
          setDashboardTargetArticle(null);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onToast={addToast}
        onDataChanged={() => fetchBackendContent(activeCategory, true)}
        initialTab={dashboardInitialTab}
        articleToEdit={dashboardTargetArticle}
      />

      {/* Shorts Reel Story Video Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 text-white space-y-4 p-5">
            <button
              onClick={() => setActiveStoryIndex(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer z-20 hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {activeStory.media_type === 'video' || activeStory.img?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
              <video
                src={activeStory.img}
                autoPlay
                controls
                playsInline
                loop
                className="w-full aspect-[9/16] object-cover rounded-2xl bg-black"
              />
            ) : (
              <img
                src={activeStory.img}
                alt={activeStory.headline}
                className="w-full aspect-[9/16] object-cover rounded-2xl"
              />
            )}

            <div>
              <h3 className="font-title font-bold text-lg text-amber-300">
                {activeStory.headline}
              </h3>
              <p className="font-body text-xs text-slate-300">
                {activeStory.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Homepage VIP Birthday Alert Popup (Session Based) */}
      <HomepageBirthdayPopup onToast={addToast} />

      {/* High-Impact Dignitary Birthday Wish Modal */}
      <BirthdayWishModal />

      {/* 2. Interactive Modals & Popups from Master Inventory */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onOpenArticle={openArticleModal}
      />

      <RasiPalanModal
        isOpen={isRasiModalOpen}
        onClose={() => setIsRasiModalOpen(false)}
        onSpeak={speakTamilText}
      />

      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
      />

      <MagazinePromoModal
        onOpenEPaper={() => setIsEPaperOpen(true)}
      />

      <VideoPlayerModal
        isOpen={Boolean(activeVideoPlayer)}
        video={activeVideoPlayer}
        onClose={() => setActiveVideoPlayer(null)}
      />

      {/* Breaking News Push Notification Permission Prompt */}
      <PushNotificationPrompt />

      {/* Dynamic Toast Container */}
      <Toast toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
