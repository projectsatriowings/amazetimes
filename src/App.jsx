import React, { useState, useEffect } from 'react';
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
import Toast from './components/Toast';

import AuthModal from './components/admin/AuthModal';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import LoginPage from './components/admin/LoginPage';

import { api, getCurrentUser, setCurrentUser as persistCurrentUser, setToken } from './services/api';
import { articlesData as fallbackArticlesData, categoryNewsMap, shortsStories as fallbackShorts } from './data/newsData';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isDark, setIsDark] = useState(false);
  const [fontSizeClass, setFontSizeClass] = useState('font-size-md');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedBookmarks, setSavedBookmarks] = useState([]);
  
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

  // Authentication & Admin Console State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
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

  // Track unique visitor on site load
  useEffect(() => {
    const device = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    api.trackVisitor(device).catch(() => {});
  }, []);

  // Fetch live content from Neon PostgreSQL
  const fetchBackendContent = async (category = activeCategory, resetPage = true) => {
    try {
      const pageToFetch = resetPage ? 1 : currentPage;
      const params = {
        page: pageToFetch,
        limit: 10,
        status: 'published'
      };
      if (category !== 'all') {
        params.category = category;
      }

      const [artRes, tickerRes, lwRes, shortsRes] = await Promise.all([
        api.getArticles(params),
        api.getTickers(),
        api.getLiveWire(),
        api.getShorts()
      ]);

      if (artRes.success && artRes.articles.length > 0) {
        const formattedArticles = artRes.articles.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category_name || a.category_id || 'செய்தி',
          cat: a.category_name || a.category_id || 'செய்தி',
          category_id: a.category_id,
          subtitle: a.subtitle,
          desc: a.excerpt || a.subtitle || (a.content ? a.content.substring(0, 150) + '...' : ''),
          content: a.content,
          image: a.cover_image_url || '/Amaze times.jpg',
          img: a.cover_image_url || '/Amaze times.jpg',
          cover_image_url: a.cover_image_url,
          author: a.author_name || 'செய்தி ஆசிரியர்',
          time: new Date(a.created_at).toLocaleDateString('ta-IN', { hour: '2-digit', minute: '2-digit' }),
          tags: a.tags || [],
          tag: (a.tags && a.tags[0]) || 'செய்தி',
          isLead: Boolean(a.is_lead),
          viewCount: a.view_count || 0
        }));

        const lead = formattedArticles.find(a => a.isLead) || formattedArticles[0];
        const cards = formattedArticles.filter(a => a.id !== lead?.id);

        setBackendLeadArticle(lead);
        setBackendArticles(cards);
        setHasMoreArticles(artRes.pagination.page < artRes.pagination.totalPages);
      } else {
        setBackendLeadArticle(null);
        setBackendArticles([]);
        setHasMoreArticles(false);
      }

      if (tickerRes.success) setBackendTickers(tickerRes.tickers);
      if (lwRes.success) setBackendLiveWire(lwRes.items);
      if (shortsRes.success && shortsRes.stories.length > 0) {
        setBackendShorts(shortsRes.stories.map(s => ({
          id: s.id,
          headline: s.headline,
          desc: s.description,
          img: s.media_url,
          media_type: s.media_type
        })));
      }
    } catch (err) {
      console.warn('Backend fetch fallback to local cache:', err.message);
    }
  };

  useEffect(() => {
    fetchBackendContent(activeCategory, true);
    setExtraCards([]);
    setCurrentPage(1);
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

  // Speech synthesis
  const speakTamilText = (text) => {
    if (!window.speechSynthesis) {
      addToast('உங்கள் உலாவியில் குரல் வசதி ஆதரிக்கப்படவில்லை.', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    addToast('குரல் செய்தி வாசிக்கப்படுகிறது...', 'volume_up');
  };

  // Bookmark toggle
  const handleBookmark = (article) => {
    if (!savedBookmarks.some((b) => b.id === article.id)) {
      setSavedBookmarks([...savedBookmarks, { id: article.id, title: article.title }]);
      addToast('செய்தி வெற்றியோடு சேமிக்கப்பட்டது!', 'bookmark_added');
    } else {
      addToast('இச்செய்தி ஏற்கனவே சேமிக்கப்பட்டுள்ளது.', 'info');
    }
  };

  const handleRemoveBookmark = (id) => {
    setSavedBookmarks(savedBookmarks.filter((b) => b.id !== id));
    addToast('சேமிப்பிலிருந்து நீக்கப்பட்டது.', 'delete');
  };

  const handleClearAllBookmarks = () => {
    setSavedBookmarks([]);
    addToast('அனைத்து சேமிப்புகளும் அழிக்கப்பட்டன.', 'delete_sweep');
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
      if (artRes.success && artRes.articles.length > 0) {
        const moreFormatted = artRes.articles.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category_name || a.category_id || 'செய்தி',
          cat: a.category_name || a.category_id || 'செய்தி',
          category_id: a.category_id,
          subtitle: a.subtitle,
          desc: a.excerpt || a.subtitle || (a.content ? a.content.substring(0, 150) + '...' : ''),
          content: a.content,
          image: a.cover_image_url || '/Amaze times.jpg',
          img: a.cover_image_url || '/Amaze times.jpg',
          cover_image_url: a.cover_image_url,
          author: a.author_name || 'செய்தி ஆசிரியர்',
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

  // Open Full Article Modal
  const openArticleModal = (articleOrId) => {
    if (typeof articleOrId === 'object' && articleOrId !== null) {
      setActiveModalArticle(articleOrId);
      return;
    }

    const id = articleOrId;
    const fromBackend = backendArticles.find(a => a.id === id) || (backendLeadArticle?.id === id ? backendLeadArticle : null);
    if (fromBackend) {
      setActiveModalArticle(fromBackend);
      return;
    }

    const fromExtra = extraCards.find(a => a.id === id);
    if (fromExtra) {
      setActiveModalArticle(fromExtra);
      return;
    }

    const fallback = fallbackArticlesData[id] || Object.values(fallbackArticlesData).find(a => a.id === id) || {
      id,
      title: `செய்தி விவரம்`,
      desc: 'செய்தி விவரங்கள் ஏற்றப்படுகின்றன...',
      category: 'செய்தி'
    };
    setActiveModalArticle(fallback);
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
    ...(backendList.length < 6 ? fallbackList : []),
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
      <div class={`min-h-screen ${fontSizeClass}`}>
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
        <div class={`min-h-screen ${fontSizeClass}`}>
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
      <div class={`min-h-screen ${fontSizeClass}`}>
        <AdminDashboardModal
          isOpen={true}
          isDedicatedPage={true}
          currentUser={currentUser}
          onClose={() => navigateTo('/')}
          onNavigateHome={() => navigateTo('/')}
          onLogout={handleLogout}
          onToast={addToast}
          onDataChanged={() => fetchBackendContent(activeCategory, true)}
          initialTab={dashboardInitialTab}
          articleToEdit={dashboardTargetArticle}
        />
        <Toast toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  return (
    <div class={`min-h-screen flex flex-col ${fontSizeClass}`}>
      {/* Newspaper Top Bar & Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onToggleDarkMode={toggleDarkMode}
        isDark={isDark}
        fontSizeClass={fontSizeClass}
        onChangeFontSize={handleChangeFontSize}
        savedBookmarksCount={savedBookmarks.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenEPaper={() => setIsEPaperOpen(true)}
        onOpenLiveTV={() => setIsLiveTVOpen(true)}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onSpeak={speakTamilText}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onNavigate={navigateTo}
      />

      {/* Ticker Ribbons (Connected to Live Data & Neon DB) */}
      <Ticker tickers={backendTickers} />

      {/* Main Container */}
      <main class="max-w-[1380px] mx-auto px-4 py-4 flex-1 w-full space-y-6">
        
        {/* If category is 'editorial', show dedicated prestigious Thalaiyangam Broadsheet View */}
        {activeCategory === 'editorial' ? (
          <EditorialView
            articles={backendArticles.length > 0 ? backendArticles : (currentFallback.cards || [])}
            onOpenArticle={openArticleModal}
            onSpeak={speakTamilText}
            onBookmark={handleBookmark}
            savedBookmarks={savedBookmarks}
          />
        ) : activeCategory === 'spiritual' ? (
          /* Dedicated Aanmegam Broadsheet View (Requested by user like Thalaiyangam) */
          <AanmegamView
            onOpenArticle={openArticleModal}
            onSpeak={speakTamilText}
            onBookmark={handleBookmark}
            savedBookmarks={savedBookmarks}
          />
        ) : (
          /* Standard 3-Column Command Grid */
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COL 1: Live Wire Sidebar (Connected to Neon DB) */}
            <div class="lg:col-span-3">
              <LiveWire
                onOpenArticle={openArticleModal}
                onSpeak={speakTamilText}
                items={backendLiveWire}
              />
            </div>

            {/* COL 2: Broadsheet Hero Spotlight, Zodiac Widget & News Grid (Clean - Admin actions only in /admin) */}
            <div class="lg:col-span-6 space-y-6">
              <HeroSpotlight
                leadData={leadData}
                onOpenArticle={openArticleModal}
                onSpeak={speakTamilText}
                onShareWhatsApp={handleShareWhatsApp}
              />

              {/* 12 Zodiac Signs Widget (Displayed on Home tab) */}
              {activeCategory === 'all' && (
                <ZodiacWidget
                  onSpeak={speakTamilText}
                />
              )}

              <SecondaryNewsGrid
                categoryTitle={currentFallback.title}
                categorySubtitle={currentFallback.subtitle}
                cards={displayCards}
                onOpenArticle={openArticleModal}
                onBookmark={handleBookmark}
                savedBookmarks={savedBookmarks}
                onLoadMore={handleLoadMore}
              />
            </div>

            {/* COL 3: Shorts Reels, Audio & Quiz/Poll */}
            <div class="lg:col-span-3 space-y-6">
              <ShortsReels
                stories={storiesToDisplay}
                onOpenStory={(idx) => setActiveStoryIndex(idx)}
              />

              <AudioBrief onSpeak={speakTamilText} />

              <QuizPoll onToast={addToast} />
            </div>

          </div>
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

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedBookmarks={savedBookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onClearAll={handleClearAllBookmarks}
        onOpenArticle={openArticleModal}
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
        <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div class="relative max-w-sm w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 text-white space-y-4 p-5">
            <button
              onClick={() => setActiveStoryIndex(null)}
              class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer z-20"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
            
            {activeStory.media_type === 'video' || activeStory.img?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
              <video
                src={activeStory.img}
                autoPlay
                controls
                playsInline
                loop
                class="w-full aspect-[9/16] object-cover rounded-2xl bg-black"
              />
            ) : (
              <img
                src={activeStory.img}
                alt={activeStory.headline}
                class="w-full aspect-[9/16] object-cover rounded-2xl"
              />
            )}

            <div>
              <h3 class="font-title font-bold text-lg text-amber-300">
                {activeStory.headline}
              </h3>
              <p class="font-body text-xs text-slate-300">
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
