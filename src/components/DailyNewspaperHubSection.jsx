import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Calendar, BookOpen, Download, Sparkles, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import AmazeTimesPageRenderer from './amazetimes/AmazeTimesPageRenderer';
import { exportPublicationToPdf } from '../utils/pdfExporter';

const TAMIL_DAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
const TAMIL_MONTHS = [
  'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
  'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'
];

function getIstTodayStr() {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function toIstDateStr(rawDate) {
  if (!rawDate) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(rawDate));
  } catch {
    return String(rawDate).split('T')[0];
  }
}

function getValidNewsImage(art) {
  const img = art?.mainImage || art?.main_image || art?.image || art?.img || art?.cover_image_url || '';
  if (!img || typeof img !== 'string') return '';
  const trimmed = img.trim();
  if (!trimmed || trimmed === '/Amaze times.jpg' || trimmed === '/og-image.jpg') return '';
  return trimmed;
}

function buildPastDaysList(count = 14) {
  const todayStr = getIstTodayStr();
  const [y, m, d] = todayStr.split('-').map(Number);
  const baseUtc = new Date(Date.UTC(y, m - 1, d));
  const list = [];

  for (let i = 0; i < count; i++) {
    const dt = new Date(baseUtc.getTime() - i * 86400000);
    const iso = dt.toISOString().split('T')[0];
    const [yy, mm, dd] = iso.split('-');
    const dayName = TAMIL_DAYS[dt.getUTCDay()] || '';
    const monthName = TAMIL_MONTHS[parseInt(mm, 10) - 1] || '';
    const shortMonth = monthName.slice(0, 4);
    list.push({
      iso,
      dayNum: dd,
      displayDate: `${dd}-${mm}-${yy}`,
      tamilLabel: `${parseInt(dd, 10)} ${monthName} ${yy}`,
      shortLabel: `${parseInt(dd, 10)} ${shortMonth}`,
      monthYear: `${monthName} ${yy}`,
      dayName,
      isToday: i === 0,
      isYesterday: i === 1
    });
  }
  return list;
}

function buildUniqueCoversFromPool(pool, pastDays) {
  const map = {};
  if (!Array.isArray(pool) || pool.length === 0) return map;

  const candidates = pool
    .filter(a => Boolean(getValidNewsImage(a)))
    .map(a => ({
      id: String(a.id || a._id || a.title || ''),
      headline: String(a.title || '').trim(),
      category: a.category || 'தமிழ்நாடு',
      coverImage: getValidNewsImage(a),
      dateIst: toIstDateStr(a.publishedAt || a.published_at || a.createdAt || a.created_at),
      priority: (a.isBreaking || a.is_breaking || a.isLeadHero || a.is_lead_hero) ? 1 : 0
    }))
    .sort((a, b) => (b.dateIst || '').localeCompare(a.dateIst || '') || b.priority - a.priority);

  const usedIds = new Set();
  const usedImages = new Set();
  pastDays.forEach((day, idx) => {
    const isFresh = (c) => !usedIds.has(c.id) && !usedImages.has(c.coverImage);
    let pick = candidates.find(c => isFresh(c) && c.dateIst === day.iso);
    if (!pick) {
      pick = candidates.find(c => isFresh(c) && c.dateIst && c.dateIst <= day.iso);
    }
    if (!pick) {
      pick = candidates.find(c => isFresh(c));
    }
    if (!pick) {
      pick = candidates.find(c => !usedIds.has(c.id));
    }
    if (!pick && candidates.length > 0) {
      pick = candidates[idx % candidates.length];
    }
    if (pick) {
      usedIds.add(pick.id);
      usedImages.add(pick.coverImage);
      map[day.iso] = pick;
    }
  });
  return map;
}

export default function DailyNewspaperHubSection({
  news = [],
  defaultShowAll = false,
  onOpenEPaperDate,
  onToast,
  readerUser = null,
  onOpenAuth
}) {
  const [todayPaper, setTodayPaper] = useState(null);
  const [archiveCovers, setArchiveCovers] = useState({});
  const [fetchedNewsPool, setFetchedNewsPool] = useState([]);
  const [showAllDays, setShowAllDays] = useState(defaultShowAll);
  const [customDate, setCustomDate] = useState(() => getIstTodayStr());
  const [downloadingDate, setDownloadingDate] = useState(null);

  const pastDays = useMemo(() => buildPastDaysList(14), []);

  // Build instant zero-latency unique daily cover map from props OR fetched news pool
  const localCoversMap = useMemo(() => {
    const combinedPool = [
      ...(Array.isArray(news) ? news : []),
      ...(Array.isArray(fetchedNewsPool) ? fetchedNewsPool : [])
    ];
    return buildUniqueCoversFromPool(combinedPool, pastDays);
  }, [news, fetchedNewsPool, pastDays]);

  useEffect(() => {
    let mounted = true;

    // 1. Try fast dedicated archive-covers endpoint; if unavailable (e.g. older backend process), fall back to /api/news immediately!
    const loadCovers = async () => {
      try {
        const res = await fetch('/api/amazetimes/enewspaper/archive-covers?days=14');
        if (res.ok) {
          const d = await res.json();
          if (mounted && d?.success && d.covers && Object.keys(d.covers).length > 0) {
            setArchiveCovers(d.covers);
            return;
          }
        }
      } catch (_) {}

      // Guaranteed fallback: load latest published Amaze Times stories directly from /api/news
      try {
        const newsRes = await fetch('/api/news?limit=50&status=published');
        if (newsRes.ok) {
          const nd = await newsRes.json();
          const list = Array.isArray(nd?.articles) ? nd.articles : (Array.isArray(nd?.news) ? nd.news : (Array.isArray(nd) ? nd : []));
          if (mounted && list.length > 0) {
            setFetchedNewsPool(list);
          }
        }
      } catch (_) {}
    };

    loadCovers();

    // 2. Fetch today's live A4 Front Page preview
    fetch(`/api/amazetimes/enewspaper?_t=${Date.now()}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (mounted && d?.success) {
          setTodayPaper(d);
        }
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  const handleOpenPaper = (dateIso) => {
    if (onOpenEPaperDate) {
      onOpenEPaperDate(dateIso);
    }
  };

  const handleDownloadPdf = async (dateIso) => {
    if (!readerUser) {
      if (onToast) onToast('தினசரி மின்-நாளிதழ் PDF பதிவிறக்கம் செய்ய வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (downloadingDate) return;
    try {
      setDownloadingDate(dateIso);
      if (onToast) onToast(`${dateIso} நாளிதழ் PDF உருவாக்கப்படுகிறது...`);
      const res = await fetch(`/api/amazetimes/enewspaper?date=${encodeURIComponent(dateIso)}&_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && data.pages?.length) {
        await exportPublicationToPdf({
          pages: data.pages,
          publicationType: 'enewspaper',
          editionName: data.publication?.edition_name || 'தமிழ்நாடு முதன்மைப் பதிப்பு',
          fileName: `Amaze_Times_Daily_EPaper_${dateIso}.pdf`
        });
        if (onToast) onToast('தினசரி மின்-நாளிதழ் PDF வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!', 'success');
      } else {
        if (onToast) onToast('நாளிதழ் பக்கங்கள் கிடைக்கவில்லை', 'error');
      }
    } catch (err) {
      if (onToast) onToast('PDF உருவாக்கத்தில் பிழை: ' + err.message, 'error');
    } finally {
      setDownloadingDate(null);
    }
  };

  const todayFrontPage = todayPaper?.pages?.[0] || null;
  const todayInfo = pastDays[0];
  const todayCover = archiveCovers[todayInfo.iso] || localCoversMap[todayInfo.iso] || null;
  const visibleDays = showAllDays ? pastDays : pastDays.slice(0, 8);

  return (
    <div className="space-y-6 w-full max-w-[1400px] mx-auto px-2.5 sm:px-4 my-6 font-tamil">
      {/* 1. TODAY'S FEATURED DAILY E-NEWSPAPER SHOWCASE */}
      <section className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-amber-400/25 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Today's Live Broadsheet Front-Page Preview */}
          <div className="md:col-span-4 flex justify-center">
            <div
              onClick={() => handleOpenPaper(todayInfo.iso)}
              className="relative group cursor-pointer"
              title="இன்றைய நாளிதழை வாசிக்க கிளிக் செய்யவும்"
            >
              <div className="w-[230px] h-[325px] bg-[#fdfcf7] rounded-xl shadow-2xl overflow-hidden ring-4 ring-amber-400/70 transform group-hover:-translate-y-2 transition-transform duration-300 relative">
                {todayFrontPage ? (
                  <div className="pointer-events-none" style={{ width: '794px', height: '1123px', transform: 'scale(0.2896)', transformOrigin: 'top left' }}>
                    <AmazeTimesPageRenderer page={todayFrontPage} publicationType="enewspaper" />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col justify-between bg-[#fdfcf7] text-slate-950 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0c1a3a] via-[#991b1b] to-[#0c1a3a] px-3 py-2 text-white border-b-2 border-amber-400">
                      <div className="flex items-center justify-between">
                        <span className="bg-white text-red-700 font-black text-[10px] px-1.5 py-0.5 rounded-sm">அ</span>
                        <span className="font-black text-[14px] tracking-wide text-amber-300">அமேஸ் டைம்ஸ்</span>
                        <span className="text-[8px] font-bold bg-black/35 px-1.5 py-0.5 rounded">{todayInfo.shortLabel}</span>
                      </div>
                      <div className="text-[8px] text-center text-amber-100 font-bold mt-1 border-t border-white/20 pt-0.5">
                        தினசரி தமிழ் மின்-நாளிதழ் • {todayInfo.tamilLabel} ({todayInfo.dayName})
                      </div>
                    </div>

                    <div className="relative flex-1 bg-slate-900 overflow-hidden">
                      <img
                        src={todayCover?.coverImage || '/og-image.jpg'}
                        alt={todayCover?.headline || 'அமேஸ் டைம்ஸ் இன்றைய நாளிதழ்'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = '/og-image.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                      <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                        {todayCover?.category || 'முக்கியச் செய்தி'}
                      </span>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <h4 className="text-[12.5px] font-black leading-snug line-clamp-3 drop-shadow">
                          {todayCover?.headline || 'தமிழ்நாடு, இந்தியா & உலக முக்கியச் செய்திகள் முழுப் பதிப்பு'}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-[#fdf8e8] px-3 py-2 border-t-2 border-slate-900 space-y-1">
                      <div className="flex items-center justify-between text-[8.5px] font-black text-slate-800">
                        <span>📰 14 முழுப் பக்கங்கள்</span>
                        <span className="text-red-700">✨ 12 ராசிபலன்</span>
                      </div>
                      <div className="bg-slate-900 text-amber-300 text-[8px] font-black text-center py-0.5 rounded">
                        திருக்குறள் • சிறுவர் கதை • விடுகதைகள் &amp; புதிர்கள்
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white">
                இன்றைய பதிப்பு!
              </span>
            </div>
          </div>

          {/* Right: Editorial Highlights & Actions */}
          <div className="md:col-span-8 space-y-4 text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-red-600/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-red-500/40">
                <Newspaper className="w-4 h-4 shrink-0" />
                <span>தினசரி மின்-நாளிதழ் (Daily E-Newspaper) • {todayInfo.tamilLabel} ({todayInfo.dayName})</span>
              </div>

              <h2 className="font-title font-black text-xl sm:text-3xl text-white leading-tight">
                அமேஸ் டைம்ஸ் இன்றைய தினசரி மின்-நாளிதழ் வாசிக்கத் தயார்!
              </h2>

              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
                முழு செய்தி வடிவம், பெரிய தெளிவான புகைப்படங்கள், 12 ராசிபலன் &amp; பஞ்சாங்கம், இன்றைய திருக்குறள், சிறுவர் நீதிக் கதை, விடுகதைகள் &amp; அறிவுப் புதிர்கள் மற்றும் நேரலை தங்கம் - சந்தை நிலவரத்துடன் ஒவ்வொரு நாளின் மின்-நாளிதழையும் 3D பக்கம் திருப்பும் அனுபவத்துடன் வாசியுங்கள்!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-slate-200 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">✓</span>
                <span>முழு நாளிதழ் அமைப்பு</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">✓</span>
                <span>12 ராசிபலன் &amp; பஞ்சாங்கம்</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">✓</span>
                <span>திருக்குறள் &amp; சிறுவர் கதை</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">✓</span>
                <span>புதிர்கள் &amp; முழுத்திரை வாசிப்பு</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenPaper(todayInfo.iso)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>இன்றைய நாளிதழை வாசிக்க (Read Today)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPdf(todayInfo.iso)}
                disabled={Boolean(downloadingDate)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Download className={`w-4 h-4 ${downloadingDate === todayInfo.iso ? 'animate-bounce' : ''}`} />
                <span>{downloadingDate === todayInfo.iso ? 'PDF தயாராகிறது...' : 'இன்றைய PDF பதிவிறக்கம்'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BIG SPACIOUS EVERY-DAY DAILY NEWSPAPER ARCHIVE GRID (4 Large Cards per Row!) */}
      <div className="bg-[#0b1325] rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-red-600/20 text-amber-400 border border-red-500/30">
              <Calendar size={22} />
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                தினசரி மின்-நாளிதழ் காப்பகம் (Every-Day E-Paper Editions)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                ஒவ்வொரு நாளின் அமேஸ் டைம்ஸ் நாளிதழையும் அட்டைப்படம் &amp; தேதி வாரியாகத் தேர்ந்தெடுத்து வாசியுங்கள்
              </p>
            </div>
          </div>

          {/* Direct Date Picker to jump to ANY past date */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
            <input
              type="date"
              value={customDate}
              max={todayInfo.iso}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleOpenPaper(customDate)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <span>தேதி வாசிக்க</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BIG 4-Column Broadsheet Edition Cover Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleDays.map((day) => {
            const cover = archiveCovers[day.iso] || localCoversMap[day.iso] || null;
            const coverImg = cover?.coverImage || '/og-image.jpg';
            const headline = cover?.headline || `${day.tamilLabel} — இன்றைய முக்கியச் செய்திகள்`;
            const categoryLabel = cover?.category || 'முக்கியச் செய்தி';

            return (
              <div
                key={day.iso}
                onClick={() => handleOpenPaper(day.iso)}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  day.isToday
                    ? 'bg-gradient-to-b from-[#1e1222] to-[#0f1a33] border-amber-400 ring-2 ring-amber-400/50 shadow-2xl shadow-amber-950/40'
                    : 'bg-[#0f1a33] border-slate-700/80 hover:border-amber-400 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60'
                }`}
              >
                {/* LARGE ATTRACTIVE BROADSHEET COVER DESIGN */}
                <div className="flex flex-col flex-1">
                  {/* 1. Newspaper Masthead Header Strip */}
                  <div className={`px-3 py-2 flex items-center justify-between border-b-2 ${
                    day.isToday
                      ? 'bg-gradient-to-r from-red-700 via-red-600 to-amber-600 border-amber-300 text-white'
                      : 'bg-gradient-to-r from-[#0d1c3d] via-[#1c2f59] to-[#7f1d1d] border-amber-400/80 text-white'
                  }`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="bg-white text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded-sm leading-none shrink-0 shadow-sm">அ</span>
                      <span className="font-black text-xs tracking-tight truncate">அமேஸ் டைம்ஸ்</span>
                    </div>
                    <span className="text-[10.5px] font-black bg-black/35 px-2 py-0.5 rounded text-amber-200 shrink-0">
                      {day.tamilLabel}
                    </span>
                  </div>

                  {/* 2. Tall Vivid Full-Bleed News Cover Photograph */}
                  <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={`${day.tamilLabel} - ${headline}`}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/og-image.jpg';
                      }}
                    />
                    {/* Editorial gradient scrim for crisp readable overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-black/15" />

                    {/* Top-Left Day Badge (Today / Yesterday / Day) */}
                    <span className={`absolute top-2.5 left-2.5 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md ${
                      day.isToday
                        ? 'bg-amber-400 text-slate-950'
                        : day.isYesterday
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-950/85 text-amber-200 border border-white/20'
                    }`}>
                      {day.isToday ? '★ இன்று' : (day.isYesterday ? 'நேற்று' : day.dayName)}
                    </span>

                    {/* Top-Right Calendar Date Stamp */}
                    <div className="absolute top-2.5 right-2.5 bg-white/95 text-slate-950 rounded-lg px-2 py-1 text-center shadow-md leading-none border border-slate-200">
                      <span className="block text-sm font-black text-red-700">{day.dayNum}</span>
                      <span className="block text-[8.5px] font-bold text-slate-600 uppercase mt-0.5">{day.displayDate.slice(3, 5)}/{day.displayDate.slice(8)}</span>
                    </div>

                    {/* Bottom Category + Bold Lead Headline over image */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <span className="inline-block bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded mb-1.5 shadow">
                        {categoryLabel}
                      </span>
                      <h4 className="text-[13.5px] font-black text-white leading-[1.35] line-clamp-2 drop-shadow-md">
                        {headline}
                      </h4>
                    </div>
                  </div>

                  {/* 3. Authentic Newsprint Highlights Ribbon */}
                  <div className="bg-[#fdfaf0] text-slate-900 px-3 py-2 border-t border-amber-400/70 flex items-center justify-between text-[11px] font-black">
                    <span className="flex items-center gap-1 text-amber-950 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>12 ராசிபலன் • திருக்குறள் • புதிர்கள்</span>
                    </span>
                    <span className="text-red-700 shrink-0 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">14 பக்.</span>
                  </div>
                </div>

                {/* 4. Tactile Action Buttons Row */}
                <div className="p-2.5 bg-[#0b1325]/95 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPaper(day.iso);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      day.isToday
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                        : 'bg-amber-500/20 group-hover:bg-amber-400 text-amber-300 group-hover:text-slate-950'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>நாளிதழ் வாசிக்க</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPdf(day.iso);
                    }}
                    disabled={Boolean(downloadingDate)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-amber-400 text-slate-200 hover:text-slate-950 transition cursor-pointer disabled:opacity-50 border border-slate-700"
                    title="PDF பதிவிறக்க"
                  >
                    <Download size={15} className={downloadingDate === day.iso ? 'animate-bounce' : ''} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toggle Button to Expand / Collapse Remaining Days (8 <-> 14 Days) */}
        {pastDays.length > 8 && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowAllDays(prev => !prev)}
              className="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-400/40 font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow"
            >
              {showAllDays ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>குறைவாகக் காட்டு (Show Recent 8 Days)</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>மேலும் {pastDays.length - 8} பழைய நாளிதழ்களைக் காண்க (View All 14 Days)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
