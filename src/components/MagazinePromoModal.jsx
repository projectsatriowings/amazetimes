import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import AmazeTimesPageRenderer from './amazetimes/AmazeTimesPageRenderer';

const TAMIL_MONTHS = {
  '1': 'ஜனவரி', '01': 'ஜனவரி',
  '2': 'பிப்ரவரி', '02': 'பிப்ரவரி',
  '3': 'மார்ச்', '03': 'மார்ச்',
  '4': 'ஏப்ரல்', '04': 'ஏப்ரல்',
  '5': 'மே', '05': 'மே',
  '6': 'ஜூன்', '06': 'ஜூன்',
  '7': 'ஜூலை', '07': 'ஜூலை',
  '8': 'ஆகஸ்ட்', '08': 'ஆகஸ்ட்',
  '9': 'செப்டம்பர்', '09': 'செப்டம்பர்',
  '10': 'அக்டோபர்',
  '11': 'நவம்பர்',
  '12': 'டிசம்பர்'
};

const ENG_MONTHS = {
  '1': 'January', '01': 'January',
  '2': 'February', '02': 'February',
  '3': 'March', '03': 'March',
  '4': 'April', '04': 'April',
  '5': 'May', '05': 'May',
  '6': 'June', '06': 'June',
  '7': 'July', '07': 'July',
  '8': 'August', '08': 'August',
  '9': 'September', '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December'
};

// Keep dismissed state for the current SPA page load only (fresh reload shows the magazine promo cleanly)
let dismissedInCurrentLoad = false;

function buildInstantCoverFromNews(newsList, currentMonthNum, currentYearStr) {
  const tamilMonth = TAMIL_MONTHS[currentMonthNum] || 'நவம்பர்';
  const engMonth = ENG_MONTHS[currentMonthNum] || 'November';

  const validStories = Array.isArray(newsList)
    ? newsList.filter(a => {
        const img = a?.mainImage || a?.main_image || a?.image || '';
        return typeof img === 'string' && img.trim() && img.trim() !== '/Amaze times.jpg';
      })
    : [];

  const lead =
    validStories.find(a => a.isBreaking || a.is_breaking || a.isLeadHero || a.is_lead_hero) ||
    validStories[0] ||
    null;

  const coverImage = lead ? (lead.mainImage || lead.main_image || lead.image) : '/og-image.jpg';
  const coverHeadline = lead?.title || `அமேஸ் டைம்ஸ் ${tamilMonth} ${currentYearStr} மாதாந்திரச் சிறப்புப் பதிப்பு!`;
  const coverCategory = lead?.category || 'மாதத்தின் சிறப்புப் பார்வை';

  return {
    pageNumber: 1,
    template: 'magazine-front-cover',
    monthYearLabel: `${tamilMonth} ${currentYearStr}`,
    monthTamil: tamilMonth,
    monthEng: engMonth,
    year: currentYearStr,
    volumeNo: '05',
    issueNo: currentMonthNum,
    priceLabel: 'விலை : இலவசம்',
    coverHeadline,
    coverCategory,
    coverImage
  };
}

export default function MagazinePromoModal({ news = [], onOpenEPaper, onOpenMagazine }) {
  const [isOpen, setIsOpen] = useState(false);
  const [latestMag, setLatestMag] = useState(null);
  const [coverPage, setCoverPage] = useState(() => {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = String(now.getFullYear());
    return buildInstantCoverFromNews(news, m, y);
  });
  const serverCoverLoadedRef = useRef(false);

  // If news array populates shortly after mount (before magazine API responds), upgrade cover immediately
  useEffect(() => {
    if (serverCoverLoadedRef.current) return;
    if (!Array.isArray(news) || news.length === 0) return;
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = String(now.getFullYear());
    setCoverPage(buildInstantCoverFromNews(news, m, y));
  }, [news]);

  useEffect(() => {
    if (dismissedInCurrentLoad) return;

    const now = new Date();
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
    const currentYearStr = String(now.getFullYear());

    // Open reliably within 900ms — never blocked waiting 10+ seconds on cold DB queries!
    const openTimer = setTimeout(() => {
      if (!dismissedInCurrentLoad) {
        setIsOpen(true);
      }
    }, 900);

    let active = true;
    const fetchMagazineCover = async () => {
      try {
        const res = await fetch(`/api/amazetimes/magazine?_t=${Date.now()}`, { cache: 'no-store' })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null);

        if (!active) return;

        if (res && res.success && res.publication) {
          serverCoverLoadedRef.current = true;
          setLatestMag(res.publication);
          if (res.pages && res.pages.length > 0 && res.pages[0].template === 'magazine-front-cover') {
            setCoverPage(res.pages[0]);
          } else {
            setCoverPage({
              pageNumber: 1,
              template: 'magazine-front-cover',
              monthYearLabel: `${TAMIL_MONTHS[currentMonthNum] || 'நவம்பர்'} ${currentYearStr}`,
              monthTamil: TAMIL_MONTHS[currentMonthNum] || 'நவம்பர்',
              monthEng: ENG_MONTHS[currentMonthNum] || 'November',
              year: currentYearStr,
              volumeNo: '05',
              issueNo: currentMonthNum,
              priceLabel: 'விலை : இலவசம்',
              coverHeadline: res.publication.coverHeadline || 'அமேஸ் டைம்ஸ் மாதாந்திரச் சிறப்புப் பதிப்பு!',
              coverCategory: 'மாதத்தின் சிறப்புப் பார்வை',
              coverImage: (res.publication.coverImage && res.publication.coverImage !== '/Amaze times.jpg')
                ? res.publication.coverImage
                : '/og-image.jpg'
            });
          }
          return;
        }

        // Secondary fallback to /api/magazines
        const magRes = await api.getMagazines().catch(() => null);
        if (!active) return;
        if (magRes && magRes.success && Array.isArray(magRes.magazines) && magRes.magazines.length > 0) {
          const m = magRes.magazines[0];
          serverCoverLoadedRef.current = true;
          setLatestMag(m);
          const mMonth = String(m.month || currentMonthNum).padStart(2, '0');
          const mYear = String(m.year || currentYearStr);
          const tamilMonth = TAMIL_MONTHS[mMonth] || 'நவம்பர்';
          const engMonth = ENG_MONTHS[mMonth] || 'November';
          const coverImg = (m.coverImage && m.coverImage !== '/Amaze times.jpg')
            ? m.coverImage
            : (m.cover_image && m.cover_image !== '/Amaze times.jpg' ? m.cover_image : '/og-image.jpg');

          setCoverPage({
            pageNumber: 1,
            template: 'magazine-front-cover',
            monthYearLabel: `${tamilMonth} ${mYear}`,
            monthTamil: tamilMonth,
            monthEng: engMonth,
            year: mYear,
            volumeNo: m.volumeNo || '05',
            issueNo: m.issueNo || mMonth,
            priceLabel: m.priceLabel || 'விலை : இலவசம்',
            coverHeadline: m.coverHeadline || m.title || 'அமேஸ் டைம்ஸ் மாதாந்திரச் சிறப்புப் பதிப்பு!',
            coverCategory: 'மாதத்தின் சிறப்புப் பார்வை',
            coverImage: coverImg
          });
        }
      } catch (_) {}
    };

    fetchMagazineCover();

    return () => {
      active = false;
      clearTimeout(openTimer);
    };
  }, []);

  const handleDismiss = () => {
    dismissedInCurrentLoad = true;
    setIsOpen(false);
  };

  const handleRead = () => {
    dismissedInCurrentLoad = true;
    setIsOpen(false);
    if (onOpenMagazine) {
      onOpenMagazine();
    } else if (onOpenEPaper) {
      onOpenEPaper();
    }
  };

  if (!isOpen) return null;

  const now = new Date();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(now.getFullYear());

  const monthCode = String(latestMag?.month || currentMonthNum).padStart(2, '0');
  const displayMonthTamil = TAMIL_MONTHS[monthCode] || 'நவம்பர்';
  const displayYear = latestMag?.year || currentYearStr;
  const displayEdition = `${displayMonthTamil} ${displayYear}`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tamil"
      onClick={handleDismiss}
    >
      <div
        className="bg-gradient-to-b from-[#0c1630] via-[#091024] to-[#060a16] border border-amber-500/50 rounded-3xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl p-5 sm:p-6 relative text-white space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer z-20"
        >
          <X size={18} />
        </button>

        {/* Promo Header */}
        <div className="text-center space-y-1.5 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles size={12} /> {displayEdition} புதிய பதிப்பு வெளியானது!
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
            {latestMag?.title || `அமேஸ் டைம்ஸ் மாதாந்திர மலர் - ${displayEdition}`}
          </h2>
          <p className="text-xs text-amber-400 font-bold tracking-wide">
            {displayEdition} பிரத்யேக டிஜிட்டல் சிறப்பிதழ்
          </p>
        </div>

        {/* Live Magazine Cover Render Mockup */}
        <div className="flex justify-center py-1">
          <div
            onClick={handleRead}
            className="group cursor-pointer relative transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            title="இதழை வாசிக்க கிளிக் செய்யவும்"
          >
            <div className="w-[196px] h-[277px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden ring-4 ring-amber-400/50 border border-amber-400/70 relative pointer-events-none">
              {coverPage ? (
                <div style={{ width: '794px', height: '1123px', transform: 'scale(0.247)', transformOrigin: 'top left' }}>
                  <AmazeTimesPageRenderer page={coverPage} publicationType="magazine" />
                </div>
              ) : (
                <img
                  src={
                    (latestMag?.coverImage && latestMag.coverImage !== '/Amaze times.jpg')
                      ? latestMag.coverImage
                      : '/og-image.jpg'
                  }
                  alt={latestMag?.title || 'அமேஸ் டைம்ஸ் மாத இதழ்'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/og-image.jpg'; }}
                />
              )}
            </div>

            {/* Floating Live Badge */}
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg border-2 border-white">
              மாத இதழ்
            </span>

            {/* Subtle gloss hover reflex */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleRead}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition cursor-pointer active:scale-95"
          >
            <BookOpen size={16} />
            <span>இப்போது இலவசமாக வாசிக்க ({displayEdition})</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-1.5 text-center text-xs text-gray-400 hover:text-white transition cursor-pointer"
          >
            பின்னர் வாசிக்கிறேன்
          </button>
        </div>
      </div>
    </div>
  );
}
