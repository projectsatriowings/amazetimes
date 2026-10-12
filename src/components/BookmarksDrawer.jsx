import React from 'react';

export default function BookmarksDrawer({
  isOpen,
  onClose,
  savedBookmarks,
  onRemoveBookmark,
  onClearAll,
  onOpenArticle
}) {
  return (
    <div
      class={`fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white dark:bg-[#0D1424] border-l border-slate-300 dark:border-slate-800 shadow-2xl p-5 transform transition-transform duration-300 flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div class="space-y-4 overflow-y-auto flex-1">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-red text-[22px]">bookmark</span>
            <h3 class="font-subtitle font-bold text-base text-slate-900 dark:text-white">
              சேமித்த செய்திகள் ({savedBookmarks.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {savedBookmarks.length === 0 ? (
          <p class="font-body text-xs text-slate-400 text-center py-10">
            இன்னும் செய்திகள் எதுவும் சேமிக்கப்படவில்லை.
          </p>
        ) : (
          <div class="space-y-2">
            {savedBookmarks.map((b) => (
              <div
                key={b.id}
                class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs font-subtitle font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700/60"
              >
                <span
                  onClick={() => {
                    onClose();
                    onOpenArticle(b.id);
                  }}
                  class="line-clamp-2 cursor-pointer hover:text-brand-red font-title"
                >
                  {b.title}
                </span>
                <button
                  onClick={() => onRemoveBookmark(b.id)}
                  class="text-red-500 hover:text-red-700 p-1 flex-shrink-0 cursor-pointer"
                  title="நீக்குக"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {savedBookmarks.length > 0 && (
        <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClearAll}
            class="w-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white font-subtitle font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>அனைத்தையும் நீக்குக</span>
          </button>
        </div>
      )}
    </div>
  );
}
