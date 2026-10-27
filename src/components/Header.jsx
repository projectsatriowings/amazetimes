import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  Calendar,
  Clock,
  CloudSun,
  Sun,
  Moon,
  Calculator,
  Bookmark,
  Search,
  X,
  Radio,
  FileText,
  Sparkles,
  Headphones,
  Home,
  Building2,
  MapPin,
  TrendingUp,
  BookOpen,
  Rss,
  Flag,
  Globe,
  Film,
  Trophy,
  PenTool,
  LogOut,
  User,
  ChevronDown,
  Download,
  Flame,
  Coins,
  Heart,
  Sliders,
  Share2
} from 'lucide-react';

export default function Header({
  activeCategory,
  onSelectCategory,
  onToggleDarkMode,
  isDark,
  fontSizeClass,
  onChangeFontSize,
  savedBookmarksCount = 0,
  likedArticlesCount = 0,
  onOpenBookmarks,
  onOpenProfileModal,
  onOpenEPaper,
  onOpenLiveTV,
  onOpenDemoGuide,
  onOpenGoldCalculator,
  onOpenPWAInstall,
  onSpeak,
  searchQuery,
  onSearchChange,
  articles = [],
  onOpenArticle,
  readerUser = null,
  onGoogleLogin,
  onOpenUserAuth,
  onReaderLogout,
  onNavigate
}) {
  const [currentTamilDate, setCurrentTamilDate] = useState('புதன், 14 அக்டோபர் 2026');
  const [currentTamilTime, setCurrentTamilTime] = useState('');
  const [panchangamDate, setPanchangamDate] = useState('புரட்டாசி 28');
  const [activeReaders, setActiveReaders] = useState(148);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isReaderDropdownOpen, setIsReaderDropdownOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsReaderDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Tamil Clock and Calendar updater
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      try {
        const dateStr = now.toLocaleDateString('ta-IN', options);
        if (dateStr) setCurrentTamilDate(dateStr);
      } catch (e) {}

      // Tamil Time formatting
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const period = hours >= 12 ? (hours >= 18 ? 'இரவு' : 'மாலை') : (hours < 6 ? 'அதிகாலை' : 'காலை');
      hours = hours % 12 || 12;
      setCurrentTamilTime(`${hours}:${minutes}:${seconds} ${period}`);
    };

    updateTimeAndDate();
    const timer = setInterval(updateTimeAndDate, 1000);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Live visitor pulse updater
  useEffect(() => {
    let isMounted = true;
    const fetchPulse = async () => {
      try {
        const res = await api.getLiveVisitorPulse();
        if (isMounted && res && res.success && typeof res.activeVisitors === 'number') {
          setActiveReaders(res.activeVisitors);
        }
      } catch (_) {}
    };
    fetchPulse();
    const pulseInterval = setInterval(fetchPulse, 25000);
    return () => {
      isMounted = false;
      clearInterval(pulseInterval);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstallModalOpen(false);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else if (onOpenPWAInstall) {
      onOpenPWAInstall();
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const categories = [
    { id: 'all', label: 'முகப்பு', icon: Home },
    { id: 'tamilnadu', label: 'தமிழ்நாடு', icon: Building2 },
    { id: 'districts', label: 'மாவட்டங்கள்', icon: MapPin, badge: 'HOT', badgeColor: 'bg-red-600' },
    { id: 'cinema', label: 'சினிமா', icon: Film, badge: 'HOT 🔥', badgeColor: 'bg-gradient-to-r from-red-600 to-rose-600' },
    { id: 'sports', label: 'விளையாட்டு', icon: Trophy, badge: 'LIVE 🏏', badgeColor: 'bg-gradient-to-r from-emerald-500 to-green-600 animate-pulse' },
    { id: 'business', label: 'வணிகம்', icon: TrendingUp, badge: 'HOT', badgeColor: 'bg-amber-500 text-slate-950 font-black' },
    { id: 'spiritual', label: 'ஆன்மிகம்', icon: Sparkles, badge: 'சிறப்பு', badgeColor: 'bg-amber-500' },
    { id: 'magazine', label: 'மாத இதழ்', icon: BookOpen, badge: 'புதியது', badgeColor: 'bg-emerald-600' },
    { id: 'blogs', label: 'வலைப்பதிவுகள்', icon: Rss },
    { id: 'india', label: 'தேசியம்', icon: Flag },
    { id: 'world', label: 'உலகம்', icon: Globe },
    { id: 'editorial', label: 'தலையங்கம்', icon: PenTool },
    { id: 'social', label: 'சமூக ஊடகங்கள்', icon: Share2, badge: 'HOT 🚀', badgeColor: 'bg-red-600' }
  ];

  const trendingTags = [
    '#தமிழக_செய்திகள்',
    '#தங்கம்_விலை_நிலவரம்',
    '#சென்னை_மெட்ரோ',
    '#ஐபிஎல்_2026',
    '#தொழில்_முதலீடு',
    '#ஆன்மிக_சிறப்பு',
    '#மாவட்ட_செய்திகள்'
  ];

  return (
    <>
      {/* 1. TOP UTILITY STRIP */}
      <div className="bg-[#091538] text-slate-100 text-xs py-1.5 px-2.5 sm:px-4 border-b border-white/10 shadow-sm transition-colors w-full max-w-full relative z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-1.5 sm:gap-3 flex-nowrap min-w-0">
          
          {/* Left: Tamil Panchangam Date, Clock, Registration & Weather */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-slate-300 text-[11px] min-w-0 shrink">
            {/* Government Verified Badge (Desktop & Tablet) */}
            <span className="hidden sm:inline-flex items-center gap-1.5 font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>மத்திய அரசு பதிவு: 2023/88656</span>
            </span>

            {/* Mobile Compact Date */}
            <span className="inline-flex sm:hidden items-center gap-1 font-bold text-amber-300 text-[10px] truncate max-w-[110px]">
              <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{panchangamDate || 'அமேஸ் டைம்ஸ்'}</span>
            </span>

            <span className="hidden sm:inline text-white/20">|</span>

            {/* Tamil Date & Panchangam (Desktop) */}
            <span className="hidden md:inline-flex items-center gap-1.5 font-medium text-slate-200 truncate">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{currentTamilDate}</span>
              <span className="text-amber-300 font-bold">({panchangamDate})</span>
            </span>

            {/* Running Clock */}
            {currentTamilTime && (
              <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentTamilTime}</span>
              </span>
            )}

            {/* Live Visitor Pulse */}
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[11px] shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-300 font-bold">{activeReaders} வாசகர்கள்</span>
              <span className="text-emerald-400/80 text-[10px]">நேரலை</span>
            </div>

            <span className="hidden xl:inline text-white/20">|</span>

            {/* Multi-City Weather Pills */}
            <div className="hidden xl:flex items-center gap-2 text-[11px] font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                <span>சென்னை:</span>
                <span className="text-amber-300 font-black">31°C</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>மதுரை:</span>
                <span className="text-amber-300 font-black">33°C</span>
              </span>
            </div>
          </div>

          {/* Right: Gold Rate Ticker with Calculator Button + Accessibility & Google User Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs shrink-0 ml-auto">
            
            {/* Live Gold Rate + Calculator Trigger */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-500/20 text-amber-300 px-1.5 sm:px-2.5 py-0.5 rounded-lg border border-amber-400/30 text-[10px] sm:text-[11px] font-bold shrink-0">
              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">தங்கம்:</span>
              <span className="text-white font-black whitespace-nowrap">₹7,280</span>
              <button
                onClick={onOpenGoldCalculator}
                className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-amber-300 border border-amber-400/40 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold transition-all cursor-pointer shadow-sm flex items-center gap-0.5"
                title="தங்கம் விலை கணக்கீட்டுக் கருவி"
              >
                <Calculator className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
                <span className="hidden xs:inline">கணக்கிடு</span>
              </button>
            </div>

            <span className="hidden sm:inline text-white/20">|</span>

            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-lg px-2 py-0.5 gap-1 border border-white/20 text-[11px] text-slate-200" title="எழுத்து அளவு">
              <button onClick={() => onChangeFontSize('font-size-sm')} className={`hover:text-amber-300 font-bold px-1 cursor-pointer ${fontSizeClass === 'font-size-sm' ? 'text-amber-300' : ''}`}>A-</button>
              <button onClick={() => onChangeFontSize('font-size-md')} className={`hover:text-amber-300 font-bold px-1 cursor-pointer ${fontSizeClass === 'font-size-md' || !fontSizeClass ? 'text-amber-300' : ''}`}>A</button>
              <button onClick={() => onChangeFontSize('font-size-lg')} className={`hover:text-amber-300 font-bold px-1 cursor-pointer ${fontSizeClass === 'font-size-lg' ? 'text-amber-300' : ''}`}>A+</button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button 
              onClick={onToggleDarkMode} 
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 hover:text-amber-300 px-1.5 sm:px-2.5 py-0.5 rounded-lg transition-all border border-white/20 text-slate-200 cursor-pointer text-[10px] sm:text-[11px] font-bold shrink-0"
              title={isDark ? 'பகல் பார்வைக்கு மாறுக' : 'இரவு பார்வைக்கு மாறுக'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                  <span className="hidden md:inline">பகல்</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                  <span className="hidden md:inline">இரவு</span>
                </>
              )}
            </button>

            {/* PWA App Install Button */}
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-[10px] sm:text-[11px] shadow-sm transition shrink-0 cursor-pointer"
              title="மொபைல் / கணினியில் ஆப் நிறுவுக"
            >
              <Download className="w-3 h-3 text-white shrink-0" />
              <span className="hidden sm:inline">ஆப் நிறுவுக</span>
            </button>

            {/* Saved Bookmarks (Desktop / Tablet) - Royal Blue with Yellow Text */}
            <button 
              onClick={onOpenBookmarks} 
              className="hidden sm:flex bg-[#0e2a7a] hover:bg-[#0a1f5c] text-amber-300 border border-blue-400/40 px-2.5 py-0.5 rounded-lg font-extrabold text-[11px] transition-all shadow-sm items-center gap-1.5 cursor-pointer shrink-0" 
              title="சேமித்த செய்திகள்"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">சேமித்தவை</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {savedBookmarksCount}
              </span>
            </button>

            {/* Google Reader User Sign-In / Profile - Royal Blue with Yellow Text */}
            <div className="relative shrink-0 z-50" ref={dropdownRef}>
              {readerUser ? (
                <div>
                  <button
                    onClick={() => setIsReaderDropdownOpen(!isReaderDropdownOpen)}
                    className="flex items-center gap-1 sm:gap-1.5 bg-[#0e2a7a] hover:bg-[#0a1f5c] text-amber-300 font-extrabold text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-blue-400/40 transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <img
                      src={readerUser.avatar_url || readerUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(readerUser.full_name || readerUser.name || 'User')}&background=DC2626&color=fff&size=128&bold=true`}
                      alt={readerUser.full_name || readerUser.name}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover ring-1 ring-amber-400 shrink-0"
                    />
                    <span className="font-extrabold max-w-[70px] sm:max-w-[120px] truncate">{readerUser.full_name || readerUser.name}</span>
                    <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300/80 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isReaderDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0c1427] text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-[9999] animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {readerUser.full_name || readerUser.name}
                          </p>
                          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-600/60 text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                            செயலில்
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate">{readerUser.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsReaderDropdownOpen(false);
                            if (onOpenProfileModal) onOpenProfileModal('profile');
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition"
                        >
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <span>எனது சுயவிவரம் (My Profile)</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsReaderDropdownOpen(false);
                            if (onOpenProfileModal) onOpenProfileModal('saved');
                            else if (onOpenBookmarks) onOpenBookmarks();
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                            <span>சேமித்த செய்திகள்</span>
                          </div>
                          <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                            {savedBookmarksCount}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setIsReaderDropdownOpen(false);
                            if (onOpenProfileModal) onOpenProfileModal('liked');
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            <span>விருப்பமான செய்திகள்</span>
                          </div>
                          <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                            {likedArticlesCount}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setIsReaderDropdownOpen(false);
                            if (onOpenProfileModal) onOpenProfileModal('history');
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition"
                        >
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>படித்த வரலாறு (History)</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsReaderDropdownOpen(false);
                            if (onOpenProfileModal) onOpenProfileModal('preferences');
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition"
                        >
                          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                          <span>வாசகர் விருப்பங்கள்</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 my-1"></div>

                      <button
                        onClick={() => {
                          setIsReaderDropdownOpen(false);
                          if (onReaderLogout) onReaderLogout();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 cursor-pointer transition"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>வெளியேறு (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenUserAuth || onGoogleLogin}
                  className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-amber-300 font-extrabold text-[10px] sm:text-[11px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-blue-400/40 transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0"
                  title="உள்நுழைவு / புதிய வாசகர் பதிவு"
                >
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span className="font-extrabold hidden xs:inline">உள்நுழைவு / பதிவு</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* 2. MAIN BRAND HEADER */}
      <header className="bg-white dark:bg-[#070d1e] border-b border-slate-200 dark:border-slate-800 transition-colors w-full max-w-full overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-1.5 sm:gap-6 min-w-0">
            
            {/* Brand Logo & Editorial Title */}
            <div 
              className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group shrink-0"
              onClick={() => {
                if (onSelectCategory) onSelectCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="bg-white p-1 rounded-xl sm:rounded-2xl shadow-sm ring-1 sm:ring-2 ring-[#0e2a7a]/40 group-hover:ring-amber-400 transition-all border border-slate-200 flex items-center justify-center shrink-0">
                <img src="/amaze-times-logo.webp" alt="அமேஸ் டைம்ஸ்" width="48" height="64" className="h-8 sm:h-11 md:h-13 w-auto object-contain rounded-lg sm:rounded-xl" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
                  <h1 className="font-title font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#0a1945] dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap leading-tight m-0 inline">
                    அமேஸ் டைம்ஸ்
                    <span className="sr-only"> - தமிழ் செய்திகள், தமிழ்நாடு, உலகம் &amp; நேரலை நிலவரம்</span>
                  </h1>
                  <span className="bg-red-600 text-white text-[8px] sm:text-[10px] font-black px-1 sm:px-2 py-0.5 rounded uppercase tracking-wider shadow-sm shrink-0">
                    DIGITAL
                  </span>
                </div>
                <span className="text-slate-600 dark:text-slate-300 text-[9px] sm:text-xs font-semibold hidden sm:flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-red-600 dark:text-amber-400">உண்மையின் தீரக் குரல்</span>
                  <span className="hidden xl:inline">• தமிழ்நாடு, உலகம் &amp; தங்கம் நிலவரம்</span>
                </span>
              </div>
            </div>

            {/* Center/Right Toolbar & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 justify-end shrink-0">
              
              {/* Desktop Search Bar with Instant Live Dropdown */}
              <div className="relative hidden md:block w-36 lg:w-48 xl:w-64 2xl:w-72 transition-all" ref={searchContainerRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="செய்திகளைத் தேடுக..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 lg:pl-9 pr-7 py-1.5 lg:py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0e2a7a] dark:focus:ring-amber-400 transition-all shadow-inner"
                />
                <Search className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400 absolute left-2.5 top-2 lg:top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setShowSearchDropdown(false);
                    }}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Instant Live Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 md:w-96 max-w-[90vw] bg-white dark:bg-[#0c1633] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden text-xs font-tamil divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
                    {searchQuery.trim() ? (
                      <div>
                        {(() => {
                          const q = searchQuery.toLowerCase();
                          const matches = (articles || []).filter(
                            (a) =>
                              a.title?.toLowerCase().includes(q) ||
                              a.category?.toLowerCase().includes(q) ||
                              a.summary?.toLowerCase().includes(q)
                          ).slice(0, 4);

                          if (matches.length === 0) {
                            return (
                              <div className="p-3 text-center text-slate-400 text-xs">
                                செய்திகள் எதுவும் கிடைக்கவில்லை.
                              </div>
                            );
                          }

                          return (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {matches.map((art) => (
                                <div
                                  key={art.id || art._id}
                                  onClick={() => {
                                    setShowSearchDropdown(false);
                                    if (onOpenArticle) onOpenArticle(art);
                                  }}
                                  className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer flex items-center gap-2.5 group"
                                >
                                  <img
                                    src={art.image || art.img || '/og-image.webp'}
                                    alt={art.title}
                                    width="48"
                                    height="48"
                                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-900"
                                    onError={(e) => { e.target.src = '/og-image.webp'; }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[9px] bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.2 rounded uppercase">
                                      {art.category || 'செய்தி'}
                                    </span>
                                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-red-600 dark:group-hover:text-amber-300 transition text-[11px] mt-0.5">
                                      {art.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      {art.time || 'சிறிது நேரத்திற்கு முன்'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                          <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                          <span>பிரபலமான தலைப்புகள்:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['தங்கம்', 'சென்னை', 'ஐபிஎல்', 'சினிமா', 'பட்ஜெட்', 'வானிலை'].map((kw, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                onSearchChange(kw);
                                setShowSearchDropdown(true);
                              }}
                              className="bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              #{kw}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors cursor-pointer shrink-0"
                title="தேடுக"
              >
                {isMobileSearchOpen ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
              </button>

              {/* AI Voice Anchor Button (Desktop) */}
              <button 
                onClick={() => onSpeak('அமேஸ் டைம்ஸ் நேரலைச் செய்தி: தமிழ்நாடு மற்றும் வணிக உலக நிகழ்வுகள் உடனுக்குடன் வழங்கப்படுகின்றன.')} 
                className="hidden xl:flex items-center gap-1.5 bg-blue-50 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-[#0e2a7a] dark:text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-blue-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm hover:scale-105" 
                title="AI குரல் செய்திகள் கேட்க"
              >
                <Headphones className="w-4 h-4 text-amber-500" />
                <span>AI செய்தி வாசிப்பாளர்</span>
              </button>

              {/* Live 24x7 Broadcast Button */}
              <button 
                onClick={onOpenLiveTV} 
                className="flex items-center gap-1 bg-red-50 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-red-200 dark:border-red-900/40 transition-all cursor-pointer shadow-sm shrink-0"
                title="24x7 நேரலை ஒளிபரப்பு"
              >
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                <span className="font-extrabold">24x7</span>
                <span className="font-extrabold hidden md:inline"> நேரலை</span>
              </button>

              {/* E-Paper Digital Edition Button */}
              <button 
                onClick={onOpenEPaper} 
                className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-bold text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all shadow-md flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
                title="டிஜிட்டல் இ-பேப்பர் படிக்க"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden xs:inline">மின்-இதழ்</span>
              </button>

              {/* Social Media Hub Link Button */}
              <button
                onClick={() => onNavigate ? onNavigate('/social-media') : (window.location.href = '/social-media')}
                className="hidden xl:flex items-center gap-1.5 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer hover:scale-105"
                title="அதிகாரப்பூர்வ சமூக ஊடக மையம்"
              >
                <Share2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span>சமூக ஊடகம்</span>
              </button>

              {/* Feature Guide Showcase - Royal Blue with Yellow Text */}
              <button 
                onClick={onOpenDemoGuide} 
                className="hidden 2xl:flex items-center gap-1.5 bg-[#0e2a7a] hover:bg-[#0a1f5c] text-amber-300 font-extrabold text-xs px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer hover:scale-105 border border-blue-400/40"
                title="தளத்தின் புதிய சிறப்பம்சங்கள்"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>தள வசதிகள்</span>
              </button>

            </div>

          </div>

          {/* Expandable Mobile Search Bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden pt-2 pb-1 animate-in slide-in-from-top-1 duration-200 w-full min-w-0">
              <div className="relative w-full">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="செய்திகளைத் தேடுக... (எ.கா. தங்கம், சென்னை)"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 shadow-inner"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </header>

      {/* 3. TRENDING HASHTAGS STRIP */}
      <div className="bg-slate-100 dark:bg-[#0a1630] border-b border-slate-200 dark:border-slate-800/80 py-1.5 px-2.5 sm:px-4 text-xs font-bold w-full max-w-full overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none touch-pan-x min-w-0">
          <div className="flex items-center gap-1 text-red-600 dark:text-amber-400 uppercase text-[11px] font-black shrink-0 tracking-wider">
            <Flame className="w-3.5 h-3.5 text-red-600 dark:text-amber-400" />
            <span>டிரெண்டிங்:</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs font-semibold">
            {trendingTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onSearchChange(tag.replace('#', '').replace(/_/g, ' '))}
                className="hover:text-red-600 dark:hover:text-amber-300 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow transition-all cursor-pointer shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. STICKY CATEGORY NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#070d1e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors w-full max-w-full overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 overflow-x-auto scrollbar-none touch-pan-x min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold whitespace-nowrap min-w-max py-1.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === 'social') {
                      if (onNavigate) onNavigate('/social-media');
                      else window.location.href = '/social-media';
                      return;
                    }
                    if (onNavigate && window.location.pathname !== '/') {
                      onNavigate('/');
                    }
                    onSelectCategory(cat.id);
                  }}
                  className={`relative px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0e2a7a] text-white shadow-md'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0e2a7a] dark:hover:text-amber-300'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full text-white uppercase ml-0.5 ${cat.badgeColor || 'bg-red-600'}`}>
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* PWA INSTALLATION POPUP MODAL */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setIsInstallModalOpen(false)}>
          <div 
            className="bg-white dark:bg-[#0d1627] rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-xl ring-2 ring-[#0e2a7a]/40 flex items-center justify-center">
                <img src="/amaze-times-logo.webp" alt="Amaze Times" width="64" height="64" className="w-full h-full object-contain rounded-xl" />
              </div>
            </div>

            <div>
              <h3 className="font-title font-bold text-lg text-slate-900 dark:text-white">
                அமேஸ் டைம்ஸ் செயலியை நிறுவுக!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                தமிழ்நாட்டின் முதன்மை டிஜிட்டல் நாளிதழ் நேரலைச் செயலி (PWA)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
                <span className="text-amber-500 text-base">⚡</span>
                <span>அதிவேக பக்க ஏற்றம்</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
                <span className="text-emerald-500 text-base">📶</span>
                <span>ஆஃப்லைன் வாசிப்பு</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
                <span className="text-red-500 text-base">🔔</span>
                <span>பிரேக்கிங் செய்திகள்</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
                <span className="text-sky-500 text-base">📱</span>
                <span>முழுத்திரை அனுபவம்</span>
              </div>
            </div>

            <button
              onClick={handleInstallApp}
              className="w-full bg-[#0e2a7a] hover:bg-navy-800 text-white font-bold text-sm py-3 rounded-xl shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
            >
              இப்போதே நிறுவு (Install Now)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
