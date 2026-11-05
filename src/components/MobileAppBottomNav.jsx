import React, { useState } from 'react';
import {
  Home,
  LayoutGrid,
  Film,
  Bookmark,
  User,
  Sparkles,
  Trophy,
  Flame,
  BookOpen,
  X,
  ChevronRight,
  TrendingUp,
  LogIn
} from 'lucide-react';

export default function MobileAppBottomNav({
  currentPath = '/',
  activeCategory = 'all',
  onSelectCategory,
  onNavigate,
  onOpenBookmarks,
  savedBookmarksCount = 0,
  readerUser = null,
  onOpenProfileModal,
  onOpenUserAuth
}) {
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);

  const CATEGORIES = [
    { id: 'all', label: 'அனைத்து செய்திகள்', icon: '📰' },
    { id: 'tamilnadu', label: 'தமிழ்நாடு & மாவட்டங்கள்', icon: '📍' },
    { id: 'politics', label: 'அரசியல் மேடை', icon: '🏛️' },
    { id: 'cinema', label: 'சினிமா செய்திகள்', icon: '🎬' },
    { id: 'sports', label: 'விளையாட்டு அரங்கம்', icon: '🏏' },
    { id: 'business', label: 'வணிகம் & தங்கம் விலை', icon: '🪙' },
    { id: 'aanmeegam', label: 'ஆன்மிகம் & ராசிபலன்', icon: '🕉️' },
    { id: 'competitions', label: 'மாணவர் போட்டிகள்', icon: '🏆', path: '/competitions' },
    { id: 'magazine', label: 'மாத இதழ்', icon: '📖', path: '/magazine' },
    { id: 'thalaiyangam', label: 'தலையங்கம் & கட்டுரைகள்', icon: '✍️', path: '/thalaiyangam' },
    { id: 'social-media', label: 'ரீல்ஸ் & வீடியோ மையம்', icon: '📱', path: '/social-media' }
  ];

  const handleCategoryClick = (cat) => {
    setShowCategoryDrawer(false);
    if (cat.path) {
      if (onNavigate) onNavigate(cat.path);
    } else {
      if (onNavigate && currentPath !== '/') onNavigate('/');
      if (onSelectCategory) onSelectCategory(cat.id);
    }
  };

  const isHome = currentPath === '/' && activeCategory === 'all';
  const isMedia = currentPath === '/social-media';

  return (
    <>
      {/* NATIVE APP MOBILE BOTTOM NAVIGATION BAR */}
      <nav 
        aria-label="செயலி கீழ் வழிசெலுத்தல் பட்டை" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d1e]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] py-1 px-2 select-none font-tamil print:hidden"
      >
        <div className="grid grid-cols-5 items-center justify-around text-center max-w-lg mx-auto">
          
          {/* 1. HOME */}
          <button
            onClick={() => {
              if (onNavigate && currentPath !== '/') onNavigate('/');
              if (onSelectCategory) onSelectCategory('all');
            }}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              isHome ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className={`w-5 h-5 ${isHome ? 'scale-110 text-amber-400' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">முகப்பு</span>
            {isHome && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></span>}
          </button>

          {/* 2. CATEGORIES DRAWER TRIGGER */}
          <button
            onClick={() => setShowCategoryDrawer(true)}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              showCategoryDrawer ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">பிரிவுகள்</span>
          </button>

          {/* 3. MEDIA & REELS HUB */}
          <button
            onClick={() => onNavigate ? onNavigate('/social-media') : (window.location.href = '/social-media')}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              isMedia ? 'text-red-500 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Film className={`w-5 h-5 ${isMedia ? 'scale-110 text-red-500' : ''}`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">ரீல்ஸ்</span>
            {isMedia && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5"></span>}
          </button>

          {/* 4. SAVED BOOKMARKS */}
          <button
            onClick={onOpenBookmarks}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition cursor-pointer relative"
          >
            <div className="relative">
              <Bookmark className="w-5 h-5" />
              {savedBookmarksCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono shadow">
                  {savedBookmarksCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">சேமித்தவை</span>
          </button>

          {/* 5. USER PROFILE / LOGIN */}
          {readerUser ? (
            <button
              onClick={() => onOpenProfileModal ? onOpenProfileModal('profile') : null}
              className="flex flex-col items-center justify-center py-1 transition cursor-pointer text-amber-400 font-bold"
            >
              <div className="relative">
                {readerUser.avatar_url || readerUser.avatar ? (
                  <img
                    src={readerUser.avatar_url || readerUser.avatar}
                    alt={readerUser.full_name || readerUser.name}
                    className="w-5 h-5 rounded-full object-cover ring-1.5 ring-amber-400"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#0e2a7a] text-amber-300 font-black text-[10px] flex items-center justify-center ring-1.5 ring-amber-400">
                    {(readerUser.full_name || readerUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950"></span>
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-[55px] tracking-tight">கணக்கு</span>
            </button>
          ) : (
            <button
              onClick={onOpenUserAuth}
              className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] mt-0.5 tracking-tight">உள்நுழை</span>
            </button>
          )}

        </div>
      </nav>

      {/* MOBILE CATEGORIES QUICK DRAWER */}
      {showCategoryDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex flex-col justify-end animate-in fade-in">
          <div className="bg-[#0b1328] border-t-2 border-amber-400/50 rounded-t-3xl p-5 max-h-[80vh] flex flex-col shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-400 text-slate-950 rounded-xl">
                  <LayoutGrid className="w-4 h-4" />
                </span>
                <h3 className="font-title font-black text-base text-white">
                  செய்திப் பிரிவுகள் & அம்சங்கள்
                </h3>
              </div>
              <button
                onClick={() => setShowCategoryDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 py-1 pr-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 text-left transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-bold text-slate-200">{cat.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

