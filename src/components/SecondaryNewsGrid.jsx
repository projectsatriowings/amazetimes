import React from 'react';

export default function SecondaryNewsGrid({
  categoryTitle,
  categorySubtitle,
  cards,
  onOpenArticle,
  onBookmark,
  savedBookmarks,
  onLoadMore,
  isAdmin,
  onEditArticle,
  onDeleteArticle,
  onNewArticle
}) {
  return (
    <div class="space-y-4">
      {/* Category Section Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300 dark:border-slate-800 pb-3">
        <div>
          <h2 class="font-title font-bold text-xl md:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <span class="w-3 h-6 bg-brand-red rounded-full"></span>
            <span>{categoryTitle}</span>
          </h2>
          <p class="font-body text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {categorySubtitle}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => {
          const isSaved = savedBookmarks.some((b) => b.id === c.id);
          return (
            <article
              key={c.id}
              class="bg-white dark:bg-[#0D1424] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between relative"
            >
              <div>
                <div class="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={c.img || c.image}
                    alt={c.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span class="absolute top-2 left-2 bg-brand-blue text-white text-[10px] font-subtitle font-bold px-2 py-0.5 rounded">
                    {c.cat || c.category || "செய்தி"}
                  </span>
                  <span class="absolute top-2 right-2 bg-amber-400 text-slate-950 font-subtitle font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow">
                    PRGI NO. TNBIL/2023/88656
                  </span>
                </div>
                <div class="p-3.5 space-y-2">
                  <h4
                    onClick={() => onOpenArticle(c.id)}
                    class="font-title font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-red cursor-pointer line-clamp-2 leading-snug"
                  >
                    {c.title}
                  </h4>
                  <p class="font-body text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {c.desc}
                  </p>
                </div>
              </div>

              <div>
                <div class="p-3.5 pt-0 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800/50 mt-2 font-subtitle">
                  <span>{c.time}</span>
                  <button
                    onClick={() => onBookmark(c)}
                    class="hover:text-brand-red transition-colors cursor-pointer"
                    title={isSaved ? "சேமிக்கப்பட்டது" : "சேமிக்க"}
                  >
                    <span class={`material-symbols-outlined text-[18px] ${isSaved ? 'text-brand-red font-bold' : ''}`}>
                      {isSaved ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>
                </div>
                <div class="px-3.5 pb-2.5 text-[9px] text-slate-400 dark:text-slate-500 italic border-t border-slate-100 dark:border-slate-800/50 pt-1 flex items-center justify-between font-subtitle">
                  <span>மறுப்பு: சரிபார்க்கப்பட்ட செய்தி</span>
                  <span class="font-bold text-amber-500">PRGI</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Load More Feed Button */}
      <div class="pt-6 pb-2 flex justify-center">
        <button
          onClick={onLoadMore}
          class="load-more-btn font-subtitle font-extrabold text-sm px-8 py-3 rounded-2xl transition-all duration-200 flex items-center gap-2.5 cursor-pointer group border border-white/30"
        >
          <span class="tracking-wide text-white drop-shadow-sm">கூடுதல் செய்திகள் ஏற்றுக</span>
          <span class="material-symbols-outlined text-[18px] text-white group-hover:translate-y-0.5 transition-transform duration-200">arrow_downward</span>
        </button>
      </div>
    </div>
  );
}
