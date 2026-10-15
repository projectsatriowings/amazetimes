import React, { useState } from 'react';
import { ArrowRight, Bookmark, ChevronDown, Heart } from 'lucide-react';

export default function SecondaryNewsGrid({
  categoryTitle,
  categorySubtitle,
  cards = [],
  onOpenArticle,
  onBookmark,
  savedBookmarks = [],
  onToggleLike,
  likedArticles = [],
  onLoadMore
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const districts = [
    { id: 'all', label: 'அனைத்தும்' },
    { id: 'chennai', label: 'சென்னை' },
    { id: 'madurai', label: 'மதுரை' },
    { id: 'coimbatore', label: 'கோவை' },
    { id: 'trichy', label: 'திருச்சி' },
    { id: 'salem', label: 'சேலம்' },
    { id: 'nellai', label: 'திருநெல்வேலி' },
    { id: 'thanjavur', label: 'தஞ்சாவூர்' }
  ];

  // Filter cards based on selected district if in district view or general view
  const filteredCards = selectedDistrict === 'all'
    ? cards
    : cards.filter(c => {
        const textToMatch = `${c.title || ''} ${c.desc || ''} ${c.category || ''} ${c.author || ''}`.toLowerCase();
        const districtObj = districts.find(d => d.id === selectedDistrict);
        return districtObj ? textToMatch.includes(districtObj.label.toLowerCase()) : true;
      });

  const cardsToRender = filteredCards.length > 0 ? filteredCards : cards;

  return (
    <section className="space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      
      {/* Category & District Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 w-full min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-7 bg-red-600 rounded-full flex-shrink-0"></span>
          <div>
            <h2 className="font-title font-black text-xl sm:text-2xl text-slate-900 dark:text-slate-100 leading-tight">
              {categoryTitle || 'சமீபத்திய செய்திகள்'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {categorySubtitle || 'நம்பகமான உடனுக்குடன் செய்திகள்'}
            </p>
          </div>
        </div>

        {/* District Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 w-full md:w-auto touch-pan-x min-w-0">
          {districts.map(dist => (
            <button
              key={dist.id}
              onClick={() => setSelectedDistrict(dist.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedDistrict === dist.id
                  ? 'bg-[#0e2a7a] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#0e2a7a]'
              }`}
            >
              {dist.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid: Clean 3-Column Editorial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cardsToRender.map((c) => {
          const isSaved = savedBookmarks.some((b) => b.id === c.id);
          return (
            <article
              key={c.id}
              className="bg-white dark:bg-[#0d1627] rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800/80 overflow-hidden group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div 
                  className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer"
                  onClick={() => onOpenArticle(c.id)}
                >
                  <img
                    src={c.img || c.image || c.cover_image_url || '/Amaze times.jpg'}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                  <span className="absolute top-2.5 left-2.5 bg-[#0e2a7a]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm">
                    {c.cat || c.category || 'செய்தி'}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{c.author || 'அமேஸ் டைம்ஸ் நிருபர்'}</span>
                    <span>{c.time || '1 மணி நேரத்திற்கு முன்'}</span>
                  </div>

                  <h3
                    onClick={() => onOpenArticle(c.id)}
                    className="font-title font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-amber-400 cursor-pointer line-clamp-2 leading-snug transition-colors"
                  >
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {c.desc || c.content}
                  </p>
                </div>
              </div>

              {/* Bottom Engagement Bar */}
              <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenArticle(c.id)}
                  className="text-[#0e2a7a] dark:text-amber-400 hover:text-red-600 font-bold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  <span>முழுதாகப் படிக்க</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {onToggleLike && (
                    <button
                      onClick={() => onToggleLike(c)}
                      className={`p-1 transition-colors cursor-pointer ${
                        likedArticles.some(a => String(a.id) === String(c.id))
                          ? 'text-rose-500 hover:text-rose-600'
                          : 'text-slate-400 hover:text-rose-500'
                      }`}
                      title={likedArticles.some(a => String(a.id) === String(c.id)) ? 'விருப்பமானவை' : 'விருப்பம் (Like)'}
                    >
                      <Heart className={`w-4 h-4 ${likedArticles.some(a => String(a.id) === String(c.id)) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  )}

                  {onBookmark && (
                    <button
                      onClick={() => onBookmark(c)}
                      className="hover:text-amber-500 transition-colors cursor-pointer text-slate-400 p-1"
                      title={isSaved ? 'சேமிக்கப்பட்டது' : 'செய்தியைச் சேமிக்க'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'text-amber-500 fill-amber-500 font-bold' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Load More Button */}
      {onLoadMore && (
        <div className="pt-6 pb-2 flex justify-center">
          <button
            onClick={onLoadMore}
            className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>கூடுதல் செய்திகள் ஏற்றுக</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

    </section>
  );
}
