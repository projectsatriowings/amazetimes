import React, { useState, useEffect, useRef } from 'react';

export default function Header({
  activeCategory,
  onSelectCategory,
  onToggleDarkMode,
  isDark,
  fontSizeClass,
  onChangeFontSize,
  savedBookmarksCount,
  onOpenBookmarks,
  onOpenEPaper,
  onOpenLiveTV,
  onOpenDemoGuide,
  onSpeak,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAuthModal,
  onOpenAdminConsole,
  onLogout,
  onOpenArticleEditor,
  onOpenVideoUploader,
  onOpenZodiacDesk,
  onNavigate
}) {
  const [currentTamilDate, setCurrentTamilDate] = useState('புதன், 7 அக்டோபர் 2026');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isInstallBannerVisible, setIsInstallBannerVisible] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
      const dateStr = now.toLocaleDateString('ta-IN', options);
      if (dateStr) setCurrentTamilDate(dateStr);
    } catch (e) {}

    // Check if app is already running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsAppInstalled(true);
    }

    // Capture PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto-trigger custom banner if not previously dismissed in session
      if (!sessionStorage.getItem('amaze_install_banner_dismissed')) {
        setIsInstallBannerVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      setIsInstallBannerVisible(false);
      setIsInstallModalOpen(false);
    });

    // Close user menu on outside click
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsAppInstalled(true);
          setIsInstallModalOpen(false);
          setIsInstallBannerVisible(false);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const categories = [
    { id: 'all', label: 'முகப்பு', icon: 'home' },
    { id: 'tamilnadu', label: 'தமிழ்நாடு', icon: 'account_balance' },
    { id: 'districts', label: 'மாவட்டங்கள்', icon: 'location_city' },
    { id: 'india', label: 'இந்தியா', icon: 'flag' },
    { id: 'world', label: 'உலகம்', icon: 'public' },
    { id: 'business', label: 'வணிகம்', icon: 'trending_up' },
    { id: 'sports', label: 'விளையாட்டு', icon: 'sports_cricket' },
    { id: 'cinema', label: 'சினிமா', icon: 'movie' },
    { id: 'spiritual', label: 'ஆன்மிகம்', icon: 'auto_awesome' },
    { id: 'editorial', label: 'தலையங்கம்', icon: 'edit_note' }
  ];

  return (
    <>
      {/* TOP COMPACT STRIP */}
      <div class="bg-gradient-to-r from-slate-900 via-brand-blue to-slate-900 dark:from-[#03060C] dark:via-[#091124] dark:to-[#03060C] text-slate-200 text-xs py-1 px-3 sm:px-4 border-b border-white/10 dark:border-amber-500/20 shadow-sm">
        <div class="max-w-[1380px] mx-auto flex items-center justify-between gap-2">
          
          {/* Left: Tamil Date & Registration Badge */}
          <div class="flex items-center gap-2 text-slate-300 text-[10px] sm:text-[11px] min-w-0">
            <span class="inline-flex items-center gap-1 font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded border border-white/15 flex-shrink-0">
              <span class="material-symbols-outlined text-[12px] sm:text-[13px]">verified</span>
              <span>PRGI TNBIL/2023/88656</span>
            </span>
            <span class="hidden sm:inline text-white/20">|</span>
            <span class="hidden xs:inline-flex items-center gap-1 truncate">
              <span class="material-symbols-outlined text-[13px] sm:text-[14px] text-red-400 flex-shrink-0">calendar_month</span>
              <span class="truncate">{currentTamilDate}</span>
            </span>
          </div>

          {/* Right: Accessibility & App Controls */}
          <div class="flex items-center gap-1.5 sm:gap-2 font-subtitle text-xs flex-shrink-0">
            {/* Text Size Resizer */}
            <div class="flex items-center bg-white/10 rounded-lg px-1.5 sm:px-2 py-0.5 gap-0.5 sm:gap-1 border border-white/20 text-[10px] sm:text-[11px] text-slate-200" title="எழுத்து அளவு மாற்றம்">
              <span class="hidden sm:inline text-[10px] text-slate-300 font-bold pr-0.5">எழுத்து:</span>
              <button onClick={() => onChangeFontSize('font-size-sm')} class="hover:text-amber-300 font-bold px-1 rounded transition-colors cursor-pointer">A-</button>
              <button onClick={() => onChangeFontSize('font-size-md')} class="hover:text-amber-300 font-bold px-1 rounded transition-colors cursor-pointer">A</button>
              <button onClick={() => onChangeFontSize('font-size-lg')} class="hover:text-amber-300 font-bold px-1 rounded transition-colors cursor-pointer">A+</button>
            </div>

            {/* Dark Mode Toggle */}
            <button onClick={onToggleDarkMode} class="flex items-center gap-1 bg-white/10 hover:bg-white/20 hover:text-amber-300 px-2 sm:px-2.5 py-0.5 rounded-lg transition-all border border-white/20 text-slate-200 cursor-pointer text-[10px] sm:text-[11px] font-bold shadow-sm" title="இருள் / பகல் பார்வை">
              <span class="material-symbols-outlined text-[15px] sm:text-[16px] text-amber-300">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
              <span class="hidden md:inline font-medium">
                {isDark ? 'பகல் பார்வை' : 'இரவுப் பார்வை'}
              </span>
            </button>

            {/* Saved Articles Launcher with Star Icon */}
            <button onClick={onOpenBookmarks} class="bg-[#DC2626] hover:bg-red-700 text-white px-2 sm:px-2.5 py-0.5 rounded-lg font-subtitle font-bold text-[10px] sm:text-[11px] transition-all shadow flex items-center gap-1 sm:gap-1.5 cursor-pointer" title="சேமித்த செய்திகள்">
              <span class="material-symbols-outlined text-[14px] sm:text-[15px]">star</span>
              <span class="hidden sm:inline">சேமிப்புகள்</span>
              <span class="bookmark-count-badge text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-inner flex-shrink-0">
                {savedBookmarksCount}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* COMPACT SINGLE-LINE BRAND HEADER */}
      <header class="sticky top-0 z-50 bg-white/98 dark:bg-[#0D1424]/98 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div class="max-w-[1380px] mx-auto px-3 sm:px-4 py-1.5 space-y-1 sm:space-y-1.5">
          
          {/* BRAND EMBLEM & TOOLBAR ROW */}
          <div class="flex items-center justify-between gap-2 sm:gap-3">
            
            {/* Left: Compact Logo & Title */}
            <div class="flex items-center gap-2 sm:gap-2.5 cursor-pointer group flex-shrink-0" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              <div class="bg-white p-1 rounded-xl shadow-md ring-2 ring-brand-red/50 group-hover:ring-amber-400 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <img src="/Amaze times.jpg" alt="அமேஸ் டைம்ஸ்" class="h-8 sm:h-9 md:h-11 w-auto object-contain rounded-lg"/>
              </div>
              <div class="flex flex-col text-left">
                <div class="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
                  <span class="font-title brand-title-text font-extrabold text-lg sm:text-2xl md:text-3xl text-slate-900 dark:text-red-500 group-hover:text-brand-red dark:group-hover:text-yellow-400 transition-colors whitespace-nowrap leading-none">
                    அமேஸ் டைம்ஸ்
                  </span>
                  <span class="bg-[#DC2626] text-white text-[8px] sm:text-[10px] font-subtitle font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 shadow-sm">
                    DIGITAL
                  </span>
                </div>
                <span class="text-slate-600 dark:text-slate-300 text-[9px] sm:text-xs font-subtitle font-bold flex items-center gap-1 mt-0.5 whitespace-nowrap group-hover:text-brand-red dark:group-hover:text-amber-400 transition-colors">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>உண்மை உடனுக்குடன்</span>
                  <span class="hidden md:inline">• தமிழ்நாட்டின் முதன்மை டிஜிட்டல் நாளிதழ்</span>
                </span>
              </div>
            </div>

            {/* Right: Action Bar */}
            <div class="flex items-center gap-1 sm:gap-1.5 flex-nowrap justify-end flex-shrink-0">
              
              {/* Mobile Search Toggle Button */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                class="md:hidden w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors cursor-pointer"
                title="செய்திகளைத் தேடுக"
              >
                <span class="material-symbols-outlined text-[18px]">
                  {isMobileSearchOpen ? 'close' : 'search'}
                </span>
              </button>

              {/* Desktop Search Bar */}
              <div class="relative hidden md:block w-36 lg:w-52">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="செய்திகளைத் தேடுக..."
                  class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-red/40 transition-all"
                />
                <span class="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-[16px]">search</span>
              </div>

              {/* TTS Voice News Button */}
              <button onClick={() => onSpeak('அமேஸ் டைம்ஸ் தலைப்புச் செய்தி: தமிழக பட்ஜெட் 2025 தாக்கல் செய்யப்பட்டது.')} class="voice-news-btn hidden lg:flex items-center gap-1 bg-blue-50 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 hover:border-amber-400 text-brand-blue dark:text-amber-300 text-xs font-subtitle font-bold px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-105" title="குரல் செய்திகள் கேட்க">
                <span class="material-symbols-outlined text-[16px]">volume_up</span>
                <span class="hidden xl:inline">குரல் செய்தி</span>
              </button>

              {/* Demo Showcase Button */}
              <button onClick={onOpenDemoGuide} class="bg-amber-500 hover:bg-amber-400 text-slate-950 hover:text-red-600 font-subtitle font-extrabold text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all shadow flex items-center gap-1 whitespace-nowrap cursor-pointer" title="தள வசதிகள் பார்க்க">
                <span class="material-symbols-outlined text-[15px] sm:text-[16px]">auto_awesome</span>
                <span class="hidden sm:inline">தள வசதிகள்</span>
              </button>

              {/* Solid Red E-Paper Button */}
              <button onClick={onOpenEPaper} class="bg-[#DC2626] hover:bg-red-700 text-white font-subtitle text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all shadow flex items-center gap-1 whitespace-nowrap cursor-pointer">
                <span class="material-symbols-outlined text-[15px] sm:text-[16px]">newspaper</span>
                <span>இ-பேப்பர்</span>
              </button>

              {/* Live TV Button */}
              <button onClick={onOpenLiveTV} class="flex items-center gap-1 text-[11px] sm:text-xs font-subtitle font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-slate-800 hover:bg-amber-500 hover:text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-amber-300/50 transition-all cursor-pointer">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span class="hidden sm:inline">நேரலை TV</span>
                <span class="sm:hidden">Live</span>
              </button>

              {/* Admin / Staff Login Button */}
              {currentUser ? (
                <button
                  onClick={() => onNavigate ? onNavigate('/admin') : (window.location.href = '/admin')}
                  class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-subtitle font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shadow flex items-center gap-1 whitespace-nowrap cursor-pointer hover:scale-105"
                  title="நிர்வாகக் குழு பக்கம்"
                >
                  <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  <span>{currentUser.role === 'admin' ? 'நிர்வாகம் (Admin)' : 'செய்தியாளர் (Desk)'}</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate ? onNavigate('/login') : (window.location.href = '/login')}
                  class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-subtitle font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  title="ஆசிரியர் & நிருபர் உள்நுழைவு"
                >
                  <span class="material-symbols-outlined text-[15px] text-amber-500">lock</span>
                  <span class="hidden xl:inline">உள்நுழைவு</span>
                </button>
              )}
            </div>

          </div>

          {/* Expandable Mobile Search Bar */}
          {isMobileSearchOpen && (
            <div class="md:hidden pt-1 pb-0.5 animate-in slide-in-from-top-1 duration-200">
              <div class="relative w-full">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="செய்திகளைத் தேடுக... (எ.கா. பட்ஜெட், சென்னை)"
                  class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-red/50 shadow-inner"
                />
                <span class="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">search</span>
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MASTER CATEGORY NAVIGATION RIBBON */}
          <div class="border-t border-slate-200 dark:border-slate-800 pt-1 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto scrollbar-none">
            <nav class="flex items-center gap-1 text-xs font-bold whitespace-nowrap min-w-max py-0.5">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    class={
                      isActive
                        ? "px-2.5 sm:px-3 py-1 rounded-lg bg-[#DC2626] text-white shadow-sm transition-all flex items-center gap-1 font-bold text-xs flex-shrink-0"
                        : "px-2 sm:px-2.5 py-1 rounded-lg text-slate-800 dark:text-slate-200 hover:text-amber-400 hover:bg-slate-900/90 dark:hover:bg-slate-800 transition-all flex items-center gap-1 font-bold text-xs cursor-pointer flex-shrink-0"
                    }
                  >
                    <span class="material-symbols-outlined text-[14px] sm:text-[15px]">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

        </div>
      </header>

      {/* PWA INSTALLATION POPUP MODAL (Requested with 'Install Now' button) */}
      {isInstallModalOpen && (
        <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-in fade-in">
          <div class="bg-white dark:bg-[#0E1628] rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsInstallModalOpen(false)}
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors cursor-pointer text-slate-500"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* App Emblem */}
            <div class="flex items-center justify-center gap-3">
              <div class="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-xl ring-2 ring-brand-red/40 flex items-center justify-center">
                <img src="/Amaze times.jpg" alt="Amaze Times" class="w-full h-full object-contain rounded-xl" />
              </div>
            </div>

            <div>
              <h3 class="font-title font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                அமேஸ் டைம்ஸ் செயலியை நிறுவுக!
              </h3>
              <p class="font-subtitle text-xs text-slate-500 dark:text-slate-400 mt-1">
                தமிழ்நாட்டின் முதன்மை டிஜிட்டல் நாளிதழ் நேரலைச் செயலி (PWA)
              </p>
            </div>

            {/* Feature Highlights */}
            <div class="grid grid-cols-2 gap-2 text-left text-[11px] font-subtitle font-bold text-slate-700 dark:text-slate-300">
              <div class="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-500 text-[18px]">bolt</span>
                <span>அதிவேக பக்க ஏற்றம்</span>
              </div>
              <div class="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-500 text-[18px]">wifi_off</span>
                <span>ஆஃப்லைன் வாசிப்பு</span>
              </div>
              <div class="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-red text-[18px]">notifications_active</span>
                <span>பிரேக்கிங் செய்திகள்</span>
              </div>
              <div class="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
                <span class="material-symbols-outlined text-sky-500 text-[18px]">devices</span>
                <span>முழுத்திரை அனுபவம்</span>
              </div>
            </div>

            {/* Primary Action: INSTALL NOW BUTTON */}
            <button
              onClick={handleInstallApp}
              class="w-full bg-gradient-to-r from-brand-red via-red-600 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-subtitle font-black text-sm py-3 rounded-2xl shadow-xl shadow-brand-red/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M12 7v6m-3-3 3 3 3-3"/>
                <path d="M8 21h8m-4-4v4"/>
              </svg>
              <span>இப்போதே நிறுவு (Install Now)</span>
            </button>

            {/* Device-Specific Direct Instructions */}
            <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/40 p-3 rounded-xl text-left text-[11px] text-slate-700 dark:text-slate-300 space-y-1 font-semibold">
              <p class="font-bold text-amber-700 dark:text-amber-300">💡 நேரடி நிறுவல் வழிகாட்டி:</p>
              <p>💻 <strong>PC / Laptop (Chrome / Edge):</strong> உலாவி முகவரிப் பட்டையின் வலதுபுறத்தில் உள்ள <strong>(⊕)</strong> குறியீட்டை அழுத்தவும்.</p>
              <p>📱 <strong>Android (Chrome):</strong> மெனு (⋮) ➔ <strong>"Install app"</strong> தேர்ந்தெடுக்கவும்.</p>
              <p>🍎 <strong>iPhone (Safari):</strong> பகிர் (Share) ➔ <strong>"Add to Home Screen"</strong> அழுத்தவும்.</p>
            </div>

            <button
              onClick={() => setIsInstallModalOpen(false)}
              class="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              பிறகு செய்கிறேன் (Maybe Later)
            </button>

          </div>
        </div>
      )}

      {/* PWA FLOATING PROMPT BANNER (Triggers when beforeinstallprompt is captured or ready) */}
      {isInstallBannerVisible && !isAppInstalled && (
        <div class="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-white/95 dark:bg-[#0E1628]/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-brand-red/30 p-4 animate-in slide-in-from-bottom duration-300">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
              <img src="/icon-192.png" alt="Amaze Times" class="w-full h-full object-contain rounded-lg" onError={(e) => { e.target.src = '/Amaze times.jpg'; }} />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <h4 class="font-title font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                  அமேஸ் டைம்ஸ் செயலியை நிறுவுக!
                </h4>
                <button
                  onClick={() => {
                    setIsInstallBannerVisible(false);
                    sessionStorage.setItem('amaze_install_banner_dismissed', 'true');
                  }}
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="மூடுக"
                >
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <p class="font-subtitle text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                டெஸ்க்டாப் அல்லது மொபைல் முகப்பில் சேமித்து அதிவேகமாக செய்திகளை வாசிக்கலாம்.
              </p>
              <div class="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleInstallApp}
                  class="bg-brand-red hover:bg-red-700 text-white font-subtitle font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M12 7v6m-3-3 3 3 3-3"/>
                    <path d="M8 21h8m-4-4v4"/>
                  </svg>
                  <span>இப்போதே நிறுவு (Install Now)</span>
                </button>
                <button
                  onClick={() => {
                    setIsInstallBannerVisible(false);
                    sessionStorage.setItem('amaze_install_banner_dismissed', 'true');
                  }}
                  class="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 cursor-pointer"
                >
                  பிறகு
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
