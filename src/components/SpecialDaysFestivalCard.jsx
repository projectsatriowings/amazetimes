import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../services/api';
import { Sparkles, Heart, Gift, Calendar, Share2, PartyPopper } from 'lucide-react';
import { getResponsiveImageProps } from '../utils/imageHelper';

export default function SpecialDaysFestivalCard({ onToast }) {
  const [specialDay, setSpecialDay] = useState(null);
  const [hasWished, setHasWished] = useState(false);
  const [wishesCount, setWishesCount] = useState(428);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadFeaturedSpecialDay();
  }, []);

  const loadFeaturedSpecialDay = async () => {
    try {
      const res = await api.getSpecialDays();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const item = res.data[0];
        setSpecialDay(item);
        setWishesCount(item.wishesCount || item.wishes_count || 428);
      } else {
        // High aesthetic default fallback
        setSpecialDay({
          id: 1,
          title: 'தமிழ் புத்தாண்டு நல்வாழ்த்துகள் 2026!',
          subtitle: 'இனிய சித்திரை திருநாள் நல்வாழ்த்துகள்',
          dateDisplay: 'சித்திரை 1',
          bannerImage: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80',
          greetingMessage: 'அனைத்து உலகத் தமிழ் மக்களுக்கும் அமேஸ் டைம்ஸ் இதழின் மனமார்ந்த தமிழ் புத்தாண்டு நல்வாழ்த்துகள்! மங்கலமும் மகிழ்ச்சியும் பெருகட்டும்.',
          wishesCount: 428
        });
      }
    } catch (_) {
      setSpecialDay({
        id: 1,
        title: 'தமிழ் புத்தாண்டு நல்வாழ்த்துகள் 2026!',
        subtitle: 'இனிய சித்திரை திருநாள் நல்வாழ்த்துகள்',
        dateDisplay: 'சித்திரை 1',
        bannerImage: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80',
        greetingMessage: 'அனைத்து உலகத் தமிழ் மக்களுக்கும் அமேஸ் டைம்ஸ் இதழின் மனமார்ந்த தமிழ் புத்தாண்டு நல்வாழ்த்துகள்!',
        wishesCount: 428
      });
    }
  };

  const handleSendWish = async () => {
    if (hasWished) {
      if (onToast) onToast('நீங்கள் ஏற்கனவே உங்கள் வாழ்த்துகளைப் பதிவு செய்துவிட்டீர்கள்! நன்றி.');
      return;
    }

    // Optimistic UI updates
    setWishesCount(prev => prev + 1);
    setHasWished(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    if (onToast) onToast('🎉 உங்கள் வாழ்த்துகள் பதிவு செய்யப்பட்டது! நன்றி.');

    // Database persistent increment in Neon PostgreSQL
    if (specialDay && specialDay.id) {
      try {
        const res = await api.sendSpecialDayWish(specialDay.id);
        if (res && res.success && typeof res.wishesCount === 'number') {
          setWishesCount(res.wishesCount);
        }
      } catch (err) {
        console.warn('Special day wish sync error:', err);
      }
    }
  };

  if (!specialDay) return null;

  return (
    <section className="w-full relative overflow-hidden rounded-3xl shadow-xl border border-amber-500/30 font-tamil bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/80">
      {/* Background Image with Ambient Glow */}
      <div className="absolute inset-0 z-0">
        {(() => {
          const rawUrl = getMediaUrl(specialDay.bannerImage || specialDay.banner_image);
          const bannerImg = getResponsiveImageProps(rawUrl, 1200, 400);
          return (
            <img
              src={bannerImg.src}
              srcSet={bannerImg.srcSet}
              sizes="100vw"
              width="1200"
              height="400"
              loading="lazy"
              decoding="async"
              alt={specialDay.title}
              className="w-full h-full object-cover opacity-25 scale-105 filter blur-xs"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fm=webp&fit=crop&w=1200&q=80'; }}
            />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/90"></div>
      </div>

      {/* Confetti animation effects */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="text-4xl animate-bounce">🎉 ✨ 🎊 🌟 💖</div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left Side: Festive Badge, Title & Greeting */}
        <div className="space-y-3 sm:space-y-4 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{specialDay.dateDisplay || specialDay.date_display || 'சிறப்புத் திருநாள்'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>அமேஸ் டைம்ஸ் வாழ்த்து மடல்</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-rose-300 bg-clip-text text-transparent">
              {specialDay.title}
            </span>
          </h2>

          {specialDay.subtitle && (
            <p className="text-amber-200/90 font-bold text-sm sm:text-base">
              {specialDay.subtitle}
            </p>
          )}

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {specialDay.greetingMessage || specialDay.greeting_message}
          </p>
        </div>

        {/* Right Side: Interactive Reader Wish Action Card */}
        <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-3 flex-shrink-0">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 p-5 rounded-2xl shadow-2xl flex flex-col items-center text-center space-y-3 min-w-[260px]">
            <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
              <Heart className="w-5 h-5 fill-rose-500 animate-pulse text-rose-500" />
              <span>{wishesCount.toLocaleString('ta-IN')} வாசகர் வாழ்த்துகள்</span>
            </div>

            <button
              onClick={handleSendWish}
              className={`w-full py-3 px-6 rounded-xl font-black text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                hasWished
                  ? 'bg-emerald-600/90 text-white border border-emerald-400 shadow-emerald-900/30'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-slate-950 font-black shadow-amber-500/25 hover:scale-102'
              }`}
            >
              <PartyPopper className="w-4 h-4" />
              <span>{hasWished ? 'வாழ்த்துகள் தெரிவிக்கப்பட்டது! ✓' : 'விழா வாழ்த்து தெரிவிக்க (Wish)'}</span>
            </button>

            <span className="text-[11px] text-slate-400">
              வாசகர்கள் தங்கள் வாழ்த்துகளை ஒரே கிளிக்கில் தெரிவிக்கலாம்
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
