import React, { useState, useEffect } from 'react';
import { X, Home, Grid, Radio, FileText, Bookmark, User } from 'lucide-react';
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
import Footer from './components/Footer';
import ArticleModal from './components/ArticleModal';
import EPaperModal from './components/EPaperModal';
import LiveTVModal from './components/LiveTVModal';
import BookmarksDrawer from './components/BookmarksDrawer';
import DemoGuideModal from './components/DemoGuideModal';
import GoldCalculatorModal from './components/GoldCalculatorModal';
import MagazineShowcase from './components/MagazineShowcase';
import SpecialDaysFestivalCard from './components/SpecialDaysFestivalCard';
import CinemaSportsHub from './components/CinemaSportsHub';
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
import { articlesData as fallbackArticlesData, categoryNewsMap, shortsStories as fallbackShorts } from './data/newsData';

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

        // Determine Lead Hero (Priority: Home Builder setting -> isLeadHero flag -> first article)
        let lead = null;
        if (layoutRes && layoutRes.success && layoutRes.data?.leadHero) {
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

  // Current Lead & Display Cards (Dynamic PostgreSQL data with rich fallback complement)
  const currentFallback = categoryNewsMap[activeCategory] || categoryNewsMap.all;
  const leadData = backendLeadArticle || currentFallback.lead;
  
  const backendList = backendArticles.length > 0 ? backendArticles : [];
  const fallbackList = (currentFallback.cards || []).filter(
    fc => !backendList.some(ba => ba.title === fc.title || ba.id === fc.id) && fc.id !== leadData?.id
  );

  let displayCards = [
    ...backendList,
    ...(backendList.length === 0 ? fallbackList : []),
    ...extraCards
  ];

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

  return (
    <div className={`min-h-screen flex flex-col w-full max-w-full overflow-x-hidden min-w-0 ${fontSizeClass}`}>
      {/* Newspaper Top Bar & Header */}
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
        onSpeak={speakTamilText}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-2.5 sm:px-4 py-3 sm:py-6 flex-1 w-full max-w-full min-w-0 overflow-x-hidden space-y-6 sm:space-y-10 pb-20 sm:pb-8">
        
        {/* Route Fallback: Custom 404 Error Page for Unknown URLs */}
        {currentPath !== '/' ? (
          <NotFoundPage onNavigate={navigateTo} onSelectCategory={handleSelectCategory} />
        ) : activeCategory === 'editorial' ? (
          <EditorialView
            articles={backendArticles.length > 0 ? backendArticles : (currentFallback.cards || [])}
            onOpenArticle={openArticleModal}
            onSpeak={speakTamilText}
            onBookmark={handleBookmark}
            savedBookmarks={savedBookmarks}
          />
        ) : activeCategory === 'spiritual' ? (
          /* Dedicated Aanmegam Broadsheet View */
          <AanmegamView
            onOpenArticle={openArticleModal}
            onSpeak={speakTamilText}
            onBookmark={handleBookmark}
            savedBookmarks={savedBookmarks}
          />
        ) : (
          <>
            {/* 1. HERO SPOTLIGHT: Lead Story + Top 5 Reads (Exact Adutha Thalaimurai 2-Column Split) */}
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
            />

            {/* 2. SPECIAL DAYS FESTIVAL CARD WITH LIVE CONFETTI & WISHES */}
            <SpecialDaysFestivalCard onToast={addToast} />

            {/* 3. CINEMA & ENTERTAINMENT HUB / SPORTS ACTION ARENA */}
            <CinemaSportsHub onOpenArticle={openArticleModal} />

            {/* 4. DIGITAL MONTHLY MAGAZINE & E-PAPER BANNER */}
            <MagazineShowcase
              onOpenEPaper={() => setIsEPaperOpen(true)}
              onToast={addToast}
            />

            {/* 3. DISTRICTS & CATEGORY NEWS GRID (With City Filter Tabs) */}
            <SecondaryNewsGrid
              categoryTitle={currentFallback.title}
              categorySubtitle={currentFallback.subtitle}
              cards={displayCards}
              onOpenArticle={openArticleModal}
              onBookmark={handleBookmark}
              savedBookmarks={savedBookmarks}
              onToggleLike={handleToggleLike}
              likedArticles={likedArticles}
              onLoadMore={handleLoadMore}
            />

            {/* 4. MULTIMEDIA, COMMUNITY & LIVE FEEDS BAND */}
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

      {/* Dynamic Toast Container */}
      <Toast toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
