import React, { useState, useEffect } from 'react';
import { X, BookOpen, Download, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function MagazinePromoModal({ onOpenEPaper }) {
  const [isOpen, setIsOpen] = useState(false);
  const [latestMag, setLatestMag] = useState(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('amaze_mag_promo_seen')) return;
    } catch (_) {}

    const checkMagazine = async () => {
      try {
        const res = await api.getMagazines();
        if (res && res.success && Array.isArray(res.magazines) && res.magazines.length > 0) {
          setLatestMag(res.magazines[0]);
          // Soft delay for promo
          setTimeout(() => setIsOpen(true), 4000);
        }
      } catch (_) {}
    };

    checkMagazine();
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('amaze_mag_promo_seen', 'true');
    } catch (_) {}
  };

  const handleRead = () => {
    handleDismiss();
    if (onOpenEPaper) onOpenEPaper();
  };

  if (!isOpen || !latestMag) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tamil">
      <div className="bg-gradient-to-b from-[#0c1630] via-[#091024] to-[#060a16] border border-amber-500/50 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 relative text-white space-y-4">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Promo Header */}
        <div className="text-center space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles size={12} /> புதிய பதிப்பு வெளியானது!
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {latestMag.title || 'அமேஸ் டைம்ஸ் மாதாந்திர சிறப்பிதழ்'}
          </h2>
          <p className="text-xs text-amber-400 font-semibold">
            {latestMag.month || latestMag.issue_month} {latestMag.year || '2026'}
          </p>
        </div>

        {/* Cover Mockup */}
        <div className="flex justify-center py-2">
          <div className="w-40 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/60 ring-4 ring-amber-400/20">
            <img
              src={latestMag.cover_image || latestMag.cover_image_url || '/Amaze times.jpg'}
              alt={latestMag.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleRead}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition"
          >
            <BookOpen size={16} />
            <span>இப்போது இலவசமாக வாசிக்க</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-1.5 text-center text-xs text-gray-400 hover:text-white transition"
          >
            பின்னர் வாசிக்கிறேன்
          </button>
        </div>
      </div>
    </div>
  );
}
