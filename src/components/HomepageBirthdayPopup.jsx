import React, { useState, useEffect } from 'react';
import { X, Heart, Sparkles, MessageCircle, PartyPopper } from 'lucide-react';
import { api } from '../services/api';

export default function HomepageBirthdayPopup({ onOpenWishModal, onToast }) {
  const [activeOfficial, setActiveOfficial] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    try {
      if (sessionStorage.getItem('amaze_birthday_popup_seen')) return;
    } catch (_) {}

    const checkBirthdays = async () => {
      try {
        const res = await api.getBirthdayOfficials();
        if (res && res.success && Array.isArray(res.officials) && res.officials.length > 0) {
          // Highlight first active VIP official
          setActiveOfficial(res.officials[0]);
          setIsOpen(true);
        }
      } catch (_) {}
    };

    const timer = setTimeout(checkBirthdays, 2500); // Trigger softly after 2.5s
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('amaze_birthday_popup_seen', 'true');
    } catch (_) {}
  };

  if (!isOpen || !activeOfficial) return null;

  return (
    <div 
      className="fixed bottom-5 right-4 sm:right-6 z-40 max-w-sm w-full bg-white dark:bg-[#0c1427] rounded-3xl p-4 border-2 border-amber-500 shadow-2xl animate-bounce-short font-tamil text-slate-900 dark:text-slate-100"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2 border-b border-amber-500/20 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎂</span>
          <div>
            <h4 className="font-black text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              இன்றைய சிறப்புப் பிறந்தநாள்!
            </h4>
            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              {activeOfficial.name}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
          title="மூடுக"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 py-3">
        <img
          src={activeOfficial.photo_url || activeOfficial.photoUrl}
          alt={activeOfficial.name}
          className="w-14 h-16 rounded-xl object-cover border border-amber-500 shadow-xs flex-shrink-0"
        />
        <div className="space-y-1 text-xs">
          <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1">
            {activeOfficial.designation}
          </p>
          <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] line-clamp-2 italic">
            "{activeOfficial.greeting_text || 'மக்கள் பணியில் தொடர வாழ்த்துகள்!'}"
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={async () => {
            try {
              await api.wishBirthdayOfficial(activeOfficial.id);
              if (onToast) onToast('உங்கள் வாழ்த்து பதிவு செய்யப்பட்டது! 🎉');
              handleDismiss();
            } catch (_) {}
          }}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
        >
          <Heart className="w-3.5 h-3.5 fill-slate-950" />
          <span>வாழ்த்துகள் தெரிவிக்க</span>
        </button>

        <button
          onClick={handleDismiss}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
        >
          மூடுக
        </button>
      </div>
    </div>
  );
}
