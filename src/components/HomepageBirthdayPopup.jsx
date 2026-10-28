import React, { useState, useEffect } from 'react';
import { X, Heart, Share2, Sparkles, ChevronDown, ChevronUp, Cake } from 'lucide-react';
import { api } from '../services/api';
import { shareBirthdayItem } from '../utils/birthdayShare';

export default function HomepageBirthdayPopup({ onOpenWishModal, onToast }) {
  const [activeOfficial, setActiveOfficial] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasWished, setHasWished] = useState(false);

  useEffect(() => {
    // Check localStorage cooldown (12 hours)
    try {
      const dismissedUntil = localStorage.getItem('amaze_birthday_popup_dismissed_until');
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }
    } catch (_) {}

    const checkTodayBirthdays = async () => {
      try {
        const res = await api.getBirthdayOfficials();
        if (res && res.success && Array.isArray(res.officials) && res.officials.length > 0) {
          const todayISO = new Date().toISOString().split('T')[0];
          const todayMMDD = todayISO.substring(5); // e.g., '10-28'

          // Filter for today's active birthdays only
          const todaysBirthdays = res.officials.filter((off) => {
            if (!off.is_active && off.is_active !== undefined) return false;
            const bDate = String(off.birth_date || off.birthDate || off.event_date || '');
            return bDate.includes(todayISO) || bDate.endsWith(todayMMDD);
          });

          // If officials found for today, use today's; otherwise fallback to primary active VIP
          const candidate = todaysBirthdays.length > 0 ? todaysBirthdays[0] : res.officials[0];
          if (candidate) {
            setActiveOfficial(candidate);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.warn('Birthday popup check notice:', err);
      }
    };

    const timer = setTimeout(checkTodayBirthdays, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      // 12-hour cooldown so repeating visitors are not annoyed
      const cooldownUntil = Date.now() + 12 * 60 * 60 * 1000;
      localStorage.setItem('amaze_birthday_popup_dismissed_until', String(cooldownUntil));
    } catch (_) {}
  };

  const handleShare = async () => {
    if (!activeOfficial) return;
    await shareBirthdayItem({
      item: activeOfficial,
      showToast: onToast || ((msg) => console.log(msg))
    });
  };

  const handleWish = async () => {
    if (!activeOfficial || hasWished) return;
    try {
      await api.wishBirthdayOfficial(activeOfficial.id);
      setHasWished(true);
      if (onToast) onToast('உங்கள் பிறந்தநாள் வாழ்த்து வெற்றிகரமாக பதிவு செய்யப்பட்டது! 🎉');
    } catch (_) {
      setHasWished(true);
      if (onToast) onToast('இனிய பிறந்தநாள் நல்வாழ்த்துகள்! 💐');
    }
  };

  if (!isOpen || !activeOfficial) return null;

  // Minimized Floating Bubble
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-5 right-4 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black p-3 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-all flex items-center gap-2 border-2 border-white/50 animate-bounce-short"
        title="இன்றைய சிறப்புப் பிறந்தநாள் வாழ்த்து அட்டை"
      >
        <span className="text-xl">🎂</span>
        <span className="text-xs font-tamil hidden sm:inline">{activeOfficial.name}</span>
        <ChevronUp className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-4 right-3 sm:right-6 z-40 max-w-sm w-[92vw] sm:w-full bg-white dark:bg-[#0c1427] rounded-3xl p-4 border-2 border-amber-500 shadow-2xl font-tamil text-slate-900 dark:text-slate-100 transition-all duration-300 animate-slideUp"
      onClick={e => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 border-b border-amber-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg">
            🎂
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              இன்றைய சிறப்புப் பிறந்தநாள்!
            </span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight line-clamp-1">
              {activeOfficial.name}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Minimize toggle */}
          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
            title="குறைக்க (Minimize)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer transition-colors"
            title="மூடுக"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Details & Poster Thumbnail */}
      <div className="flex items-center gap-3 py-3">
        <div className="relative shrink-0">
          <img
            src={activeOfficial.photo_url || activeOfficial.photoUrl || '/Amaze times.jpg'}
            alt={activeOfficial.name}
            className="w-16 h-18 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
            loading="lazy"
            width="64"
            height="72"
          />
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1 rounded-full shadow">
            🎉
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <p className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold line-clamp-1">
            {activeOfficial.designation}
          </p>
          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs italic line-clamp-2">
            "{activeOfficial.greeting_text || activeOfficial.greetingText || 'மக்கள் பணியில் தொடர வாழ்த்துகள்!'}"
          </p>
        </div>
      </div>

      {/* Action Buttons: Wish & Share */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <button
          onClick={handleWish}
          disabled={hasWished}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all ${
            hasWished
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 hover:shadow-amber-500/20'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${hasWished ? 'fill-emerald-500 text-emerald-500' : 'fill-slate-950 text-slate-950'}`} />
          <span>{hasWished ? 'வாழ்த்தப்பட்டது! ❤️' : 'வாழ்த்துகள்'}</span>
        </button>

        <button
          onClick={handleShare}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
          title="வாழ்த்துக் கார்டைப் பகிர்க"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>பகிர்</span>
        </button>

        <button
          onClick={handleDismiss}
          className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white text-xs font-bold cursor-pointer transition-colors"
        >
          மூடுக
        </button>
      </div>
    </div>
  );
}
