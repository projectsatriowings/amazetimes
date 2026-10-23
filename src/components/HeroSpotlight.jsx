import React, { useState, useEffect } from 'react';
import {
  Eye,
  Clock,
  User,
  Heart,
  Bookmark,
  Share2,
  Volume2,
  ArrowRight,
  Flame,
  Newspaper,
  BookOpen,
  MapPin,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';
import { getResponsiveImageProps } from '../utils/imageHelper';

export default function HeroSpotlight({
  leadData,
  topArticles = [],
  onOpenArticle,
  onSpeak,
  onShareWhatsApp,
  onBookmark,
  savedBookmarks = [],
  onToggleLike,
  isLiked = false,
  onOpenEPaper,
  onSelectCategory
}) {
  const initialLikes = leadData?.likesCount ?? leadData?.likes_count ?? 0;
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (leadData?.likesCount !== undefined) {
      setLikesCount(leadData.likesCount);
    }
  }, [leadData?.likesCount]);

  if (!leadData) return null;

  const userHasLiked = onToggleLike ? isLiked : hasLiked;

  const handleLike = () => {
    if (onToggleLike) {
      onToggleLike(leadData);
    } else {
      if (!hasLiked) {
        setLikesCount((prev) => prev + 1);
        setHasLiked(true);
      } else {
        setLikesCount((prev) => prev - 1);
        setHasLiked(false);
      }
    }
  };

  const isBookmarked = savedBookmarks.some((b) => String(b.id) === String(leadData.id));

  // Lead image responsive props
  const leadImage = getResponsiveImageProps(leadData.image || leadData.img || leadData.cover_image_url, 1200, 675);

  // Split top articles: up to 4 for the central Top Stories, rest for live feed stream
  const candidateArticles = (topArticles || []).filter((a) => String(a.id) !== String(leadData.id));
  const topFour = candidateArticles.slice(0, 4);
  const liveFeeds = candidateArticles.slice(4, 7);

  return (
    <section className="w-full font-tamil">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* =========================================================
            COLUMN 1 (5 cols): CINEMATIC LEAD STORY CARD
            ========================================================= */}
        <article className="lg:col-span-12 xl:col-span-5 bg-white dark:bg-[#0f1b3d] rounded-3xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 group flex flex-col justify-between">
          <div
            className="relative overflow-hidden h-72 sm:h-96 2xl:h-[400px] w-full cursor-pointer flex flex-col justify-between p-4 sm:p-6"
            onClick={() => onOpenArticle && onOpenArticle(leadData)}
          >
            <img
              src={leadImage.src}
              srcSet={leadImage.srcSet}
              sizes="(max-width: 1024px) 100vw, 45vw"
              alt={leadData.title}
              width="800"
              height="450"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { e.target.src = '/og-image.webp'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20"></div>

            {/* Top Badges */}
            <div className="relative z-10 flex items-center gap-2 flex-wrap">
              <span className="bg-red-600 text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>முக்கியச் செய்தி</span>
              </span>
              <span className="bg-[#0a1945]/90 backdrop-blur-md text-amber-300 font-extrabold text-[11px] sm:text-xs px-2.5 py-1 rounded-xl border border-amber-400/30 shadow-xs">
                {leadData.category || 'தமிழ்நாடு'}
              </span>
            </div>

            {/* Bottom Content Over Image */}
            <div className="relative z-10 text-white space-y-2 pt-4">
              <span className="text-xs sm:text-sm text-amber-300 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span>{leadData.category || 'தமிழ்நாடு'}</span>
                <span>•</span>
                <span>{leadData.time || 'சிறிது நேரத்திற்கு முன்'}</span>
              </span>
              <h2 className="text-lg sm:text-2xl 2xl:text-3xl font-extrabold leading-snug sm:leading-tight hover:text-amber-300 transition-colors line-clamp-3">
                {leadData.title}
              </h2>
            </div>
          </div>

          {/* Card Body: Summary & Full Action Bar */}
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
              {leadData.summary || leadData.content || 'நம்பகமான, துல்லியமான மற்றும் நடுநிலையான முழு செய்தித் தகவல்களை உடனுக்குடன் தெரிந்துகொள்ள இங்கே கிளிக் செய்து வாசிக்கவும்.'}
            </p>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  ஆசிரியர்: {leadData.author || 'அமேஸ் டைம்ஸ் ஆசிரியர் குழு'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>{(leadData.views || 0).toLocaleString()} வாசிப்புகள்</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    userHasLiked
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-500'
                  }`}
                  title="செய்திக்கு விருப்பம் தெரிவிக்க"
                >
                  <Heart className={`w-3.5 h-3.5 ${userHasLiked ? 'fill-current text-white' : 'text-rose-500'}`} />
                  <span>{likesCount.toLocaleString()}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onBookmark && onBookmark(leadData)}
                  className={`p-2 rounded-xl transition cursor-pointer border ${
                    isBookmarked
                      ? 'bg-amber-400/20 text-amber-500 border-amber-400/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500 border-slate-200 dark:border-slate-700'
                  }`}
                  title="செய்தியைச் சேமிக்க"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => onShareWhatsApp && onShareWhatsApp(leadData)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="பகிர்க"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenArticle && onOpenArticle(leadData)}
                  className="bg-[#0e2a7a] hover:bg-[#153a9e] dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-extrabold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <span>வாசிக்க</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* =========================================================
            COLUMN 2 (4 cols): TOP STORIES & LIVE FRESH RADAR
            ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-4 space-y-5">
          <div className="bg-white dark:bg-[#0f1b3d] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-sm sm:text-base text-[#0a1945] dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span>அதிகம் வாசிக்கப்பட்டவை</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">நேரலை வரிசை</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-3">
              {topFour.map((item, idx) => {
                const thumb = getResponsiveImageProps(item.image || item.img, 160, 160);
                return (
                  <div
                    key={item.id || idx}
                    className="pt-3 first:pt-0 flex gap-3.5 cursor-pointer group"
                    onClick={() => onOpenArticle && onOpenArticle(item)}
                  >
                    <img
                      src={thumb.src}
                      srcSet={thumb.srcSet}
                      sizes="80px"
                      alt={item.title}
                      width="80"
                      height="80"
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-20 rounded-xl object-cover group-hover:scale-105 transition-transform shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-900"
                      onError={(e) => { e.target.src = '/og-image.webp'; }}
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                        {item.category || 'செய்தி'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-amber-300 leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                        <span>{item.time || 'சிறிது நேரத்திற்கு முன்'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-blue-500 font-medium">
                          <Eye className="w-3 h-3" /> {(item.views || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live News Feeds Stream (Quick pops from latest articles) */}
          {liveFeeds.length > 0 && (
            <div className="bg-white dark:bg-[#0f1b3d] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    உடனுக்குடன் (Live Radar)
                  </span>
                </div>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-extrabold px-2 py-0.5 rounded-full">
                  இன்றைய நிலவரம்
                </span>
              </div>

              <div className="space-y-2.5">
                {liveFeeds.map((feed, idx) => (
                  <div
                    key={feed.id || idx}
                    onClick={() => onOpenArticle && onOpenArticle(feed)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-amber-400 line-clamp-1 leading-snug">
                        {feed.title}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{feed.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            COLUMN 3 (3 cols): CONNECTED PUBLICATIONS & ACTIONS HUB
            ========================================================= */}
        <div className="lg:col-span-5 xl:col-span-3 space-y-4">
          
          {/* Connected E-Paper Feature Card */}
          <div className="bg-gradient-to-br from-[#0a1945] via-[#0d225c] to-[#08153b] rounded-3xl p-5 text-white border-2 border-amber-500/40 shadow-xl space-y-3 font-tamil relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
                <Newspaper className="w-4 h-4 text-amber-400" /> இன்றைய இ-பேப்பர்
              </span>
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                LIVE
              </span>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-extrabold leading-tight text-white group-hover:text-amber-300 transition">
                அமேஸ் டைம்ஸ் நாளிதழ் முழு மின்-பதிப்பு
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                இன்றைய அனைத்து முக்கியச் செய்திகள், மாவட்டப் பக்கங்கள் மற்றும் சிறப்பு இணைப்புகளை டிஜிட்டல் வடிவில் வாசிக்கலாம்.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenEPaper}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition active:scale-95"
            >
              <span>இ-பேப்பர் வாசிக்க (Read Paper)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Connected Monthly Magazine Feature Card */}
          <div className="bg-gradient-to-br from-[#062438] via-[#09324e] to-[#041a29] rounded-3xl p-5 text-white border border-emerald-500/40 shadow-xl space-y-3 font-tamil group">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-emerald-400" /> மாதாந்திர இதழ்
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                சிறப்பிதழ்
              </span>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-extrabold leading-tight text-white group-hover:text-emerald-300 transition">
                அமேஸ் டைம்ஸ் டிஜிட்டல் மாத இதழ்
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                அக்டோபர் 2026 பிரத்யேகச் சிறப்பிதழ்: அரசியல், இலக்கியம் & உலக நடப்புகள்.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('magazine')}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition active:scale-95"
            >
              <span>மாத இதழ் வாசிக்க</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Voice Reader Trigger Card */}
          <div className="bg-white dark:bg-[#0f1b3d] rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                  AI குரல் செய்தி வாசிப்பாளர்
                </h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">இன்றைய முக்கியச் செய்திகளைக் கேட்கலாம்</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSpeak && onSpeak(leadData.title)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
            >
              கேளுங்கள்
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
