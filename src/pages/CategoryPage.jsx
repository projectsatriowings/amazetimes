import React, { useMemo } from 'react';
import { ArrowLeft, Clock, Eye, Heart, Bookmark, Share2, Tag, ChevronRight, FileText } from 'lucide-react';
import SecondaryNewsGrid from '../components/SecondaryNewsGrid';

/**
 * CategoryPage
 * Dedicated category page view with deduplication by article ID
 * Ensures zero duplicated cards when combining primary/lead news with paginated lists.
 */
export default function CategoryPage({
  category = 'all',
  categoryConfig = null,
  articles = [],
  leadArticle = null,
  onOpenArticle,
  onBookmark,
  savedBookmarks = [],
  onToggleLike,
  likedArticles = [],
  onNavigateHome,
  onLoadMore,
  hasMore = false,
  isLoading = false
}) {
  // Deduplicate articles by id to prevent ghost duplication across paginated feeds
  const uniqueArticles = useMemo(() => {
    const list = Array.isArray(articles) ? articles : [];
    // If a lead article is present, filter it out from the grid cards to avoid repetition
    const pool = leadArticle 
      ? list.filter(a => String(a.id) !== String(leadArticle.id))
      : list;
    return Array.from(new Map(pool.map(a => [String(a.id || a._id), a])).values());
  }, [articles, leadArticle]);

  const title = categoryConfig?.title || `${category} செய்திகள்`;
  const subtitle = categoryConfig?.subtitle || 'அமேஸ் டைம்ஸ் நடுநிலையான உடனுக்குடன் தமிழ் செய்திகள்';
  const badge = categoryConfig?.badge || category;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Category Header Banner */}
      <div className="bg-gradient-to-r from-[#091538] via-[#0e2a7a] to-[#1e3a8a] text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <button 
                onClick={onNavigateHome} 
                className="hover:underline flex items-center gap-1 cursor-pointer transition text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>முகப்பு</span>
              </button>
              <span>›</span>
              <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
                {badge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-title text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="bg-white/10 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-white/15">
              {uniqueArticles.length + (leadArticle ? 1 : 0)} செய்திகள்
            </span>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="bg-white hover:bg-slate-100 text-[#0e2a7a] font-extrabold text-xs px-4 py-1.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                அனைத்து முதன்மைச் செய்திகள்
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!leadArticle && uniqueArticles.length === 0 && (
        <div className="bg-white dark:bg-[#0f1b3d] rounded-3xl p-8 sm:p-14 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            இப்பிரிவில் கூடுதல் செய்திகள் விரைவில் சேர்க்கப்படும். நிர்வாகம் அல்லது நிருபர் மூலம் புதிய செய்திகள் உடனுக்குடன் பதிவேற்றப்படும்.
          </p>
          {onNavigateHome && (
            <div className="pt-2">
              <button
                onClick={onNavigateHome}
                className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition cursor-pointer"
              >
                அனைத்து முதன்மைச் செய்திகளைப் படிக்கவும்
              </button>
            </div>
          )}
        </div>
      )}

      {/* Primary / Lead Article (if present) */}
      {leadArticle && (
        <div 
          onClick={() => onOpenArticle && onOpenArticle(leadArticle)}
          className="group cursor-pointer bg-white dark:bg-[#0f1b3d] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          <div className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden bg-slate-900">
            <img
              src={leadArticle.image || leadArticle.img || leadArticle.cover_image_url || '/Amaze times.jpg'}
              alt={leadArticle.title}
              width="800"
              height="450"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
            />
            <div className="absolute top-4 left-4 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
              முதன்மைச் செய்தி
            </div>
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-md border border-amber-400/30">
                  {leadArticle.category || category}
                </span>
                {leadArticle.time && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {leadArticle.time}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                {leadArticle.title}
              </h2>
              {leadArticle.desc && (
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {leadArticle.desc}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span>{leadArticle.author || 'ஆசிரியர் குழு'}</span>
              <span className="text-red-600 dark:text-amber-400 font-bold group-hover:underline flex items-center gap-1">
                முழு விவரம் படிக்க <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Deduplicated Articles Grid */}
      {uniqueArticles.length > 0 && (
        <SecondaryNewsGrid
          categoryTitle={title}
          categorySubtitle={subtitle}
          cards={uniqueArticles}
          onOpenArticle={onOpenArticle}
          onBookmark={onBookmark}
          savedBookmarks={savedBookmarks}
          onToggleLike={onToggleLike}
          likedArticles={likedArticles}
          onLoadMore={onLoadMore}
        />
      )}
    </div>
  );
}

export { CategoryPage };
