import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { checkIsTodayBirthday, defaultBirthdayWishes } from '../data/birthdayData';
import { shareBirthdayItem } from '../utils/birthdayShare';
import { Cake, Sparkles, X, ChevronRight, PartyPopper, Share2, Gift } from 'lucide-react';

const YoutubeIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsappIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const useCurrentPathname = () => {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLocationChange = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);
  return pathname;
};

export const HomepageBirthdayPopup = () => {
  const { birthdayWishes, openBirthdayModal, showToast } = useApp();
  const pathname = useCurrentPathname();
  const [minimized, setMinimized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const list = birthdayWishes && birthdayWishes.length > 0 ? birthdayWishes : defaultBirthdayWishes;

  // Auto-expiry check: only render today's active birthdays
  const activeItems = list.filter(
    (item) => item.isActive !== false && checkIsTodayBirthday(item)
  );

  useEffect(() => {
    if (activeItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [activeItems.length]);

  if ((pathname !== '/' && pathname !== '') || activeItems.length === 0) return null;

  const item = activeItems[currentIndex] || activeItems[0];
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amazetimes.in';
  const cardUrl = `${origin}/?birthday=${item.id}`;
  const posterImg = item.posterImage || item.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
  const personName = item.name;
  const whoHeIs = item.englishDesignation || item.designation || 'Dignitary';
  const englishWish = item.englishWishMessage || `Warmest Birthday Greetings to ${item.englishName || personName}! Wishing you health, peace, and success.`;

  if (minimized) {
    return (
      <div className="fixed bottom-5 right-4 sm:right-6 z-40 pointer-events-auto">
        <button
          onClick={() => setMinimized(false)}
          className="group relative bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-slate-950 font-black p-3 rounded-2xl shadow-2xl border-2 border-amber-300 flex items-center gap-2 transition-all transform hover:scale-110 cursor-pointer"
          title="பிறந்தநாள் வாழ்த்து பாப்-அப் திறக்க"
        >
          <Gift className="w-5 h-5 text-slate-950 animate-bounce" />
          <span className="hidden sm:inline text-xs font-black">பிறந்தநாள் வாழ்த்து!</span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full border-2 border-slate-950 animate-ping"></span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="இன்றைய பிறந்தநாள் வாழ்த்து"
      className="fixed bottom-4 right-3 sm:bottom-5 sm:right-5 z-40 max-w-[310px] sm:max-w-[330px] w-full pointer-events-auto select-none"
    >
      <div
        onClick={() => openBirthdayModal(item)}
        className="bg-gradient-to-b from-[#091538] via-[#07112d] to-[#04091a] rounded-2xl p-3 sm:p-3.5 border-2 border-amber-400/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] text-white relative overflow-hidden cursor-pointer hover:border-amber-300 transition-all group"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/15 blur-2xl pointer-events-none rounded-full"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-400">
            <Cake className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="tracking-wide">பிறந்தநாள் வாழ்த்து!</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </div>
          <div className="flex items-center gap-1.5">
            {activeItems.length > 1 && (
              <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                {currentIndex + 1}/{activeItems.length}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(true);
              }}
              className="w-5 h-5 rounded-full bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700"
              title="சுருக்குக (Minimize)"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Body Thumbnail & Info */}
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <img
              src={posterImg}
              alt={personName}
              width="64"
              height="80"
              loading="lazy"
              decoding="async"
              className="w-14 h-18 sm:w-16 sm:h-20 rounded-xl object-cover border border-amber-400 shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 p-0.5 rounded-full shadow border border-slate-950">
              <PartyPopper className="w-2.5 h-2.5 text-slate-950" />
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-black text-white font-tamil leading-tight truncate">
              {personName}
            </h4>
            {item.englishName && item.englishName !== personName && (
              <p className="text-[10px] font-bold text-amber-300 font-sans truncate -mt-0.5">
                {item.englishName}
              </p>
            )}
            <p className="text-[10px] font-bold text-amber-400 font-sans truncate">
              {whoHeIs}
            </p>
            <p className="text-[10px] text-slate-300 italic font-sans line-clamp-2 leading-tight bg-black/40 p-1 rounded border border-amber-500/20">
              "{englishWish}"
            </p>
          </div>
        </div>

        {/* Social Links Bar */}
        <div className="mt-2.5 pt-1.5 border-t border-amber-500/20 flex items-center justify-between gap-1.5">
          <span className="text-[9px] font-bold text-amber-300/80">பதிவுகள்:</span>
          <div className="flex items-center gap-1.5">
            {item.socialYoutubeUrl && (
              <a
                href={item.socialYoutubeUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow transform hover:scale-110"
                title="YouTube"
              >
                <YoutubeIcon className="w-3 h-3" />
              </a>
            )}
            {item.socialFacebookUrl && (
              <a
                href={item.socialFacebookUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition shadow transform hover:scale-110"
                title="Facebook"
              >
                <FacebookIcon className="w-3 h-3" />
              </a>
            )}
            {item.socialInstagramUrl && (
              <a
                href={item.socialInstagramUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white flex items-center justify-center transition shadow transform hover:scale-110"
                title="Instagram"
              >
                <InstagramIcon className="w-3 h-3" />
              </a>
            )}
            {item.socialWhatsappUrl && (
              <a
                href={item.socialWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition shadow transform hover:scale-110"
                title="WhatsApp"
              >
                <WhatsappIcon className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              shareBirthdayItem({ item, cardUrl, showToast });
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-[11px] font-bold flex items-center gap-1 border border-amber-500/30 transition cursor-pointer"
            title="பகிர்"
          >
            <Share2 className="w-3 h-3" />
            <span>பகிர்</span>
          </button>
          <button
            type="button"
            onClick={() => openBirthdayModal(item)}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 shadow transition transform group-hover:scale-[1.02] cursor-pointer"
          >
            <span>வாழ்த்து அட்டை</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default HomepageBirthdayPopup;
