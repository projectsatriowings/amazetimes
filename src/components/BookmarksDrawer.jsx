import React from 'react';
import { Bookmark, X, Trash2, BookOpen } from 'lucide-react';

export default function BookmarksDrawer({
  isOpen,
  onClose,
  savedBookmarks,
  onRemoveBookmark,
  onClearAll,
  onOpenArticle
}) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[320px] sm:max-w-sm bg-white dark:bg-[#0D1424] border-l border-slate-300 dark:border-slate-800 shadow-2xl p-5 transform transition-transform duration-300 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-red-600 fill-red-600" />
              <h3 className="font-subtitle font-bold text-base text-slate-900 dark:text-white">
                சேமித்த செய்திகள் ({savedBookmarks.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {savedBookmarks.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-body text-xs text-slate-400">
                இன்னும் செய்திகள் எதுவும் சேமிக்கப்படவில்லை.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedBookmarks.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs font-subtitle font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700/60"
                >
                  <span
                    onClick={() => {
                      onClose();
                      onOpenArticle(b.id);
                    }}
                    className="line-clamp-2 cursor-pointer hover:text-red-600 dark:hover:text-amber-400 font-title transition-colors"
                  >
                    {b.title}
                  </span>
                  <button
                    onClick={() => onRemoveBookmark(b.id)}
                    className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 cursor-pointer"
                    title="நீக்குக"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {savedBookmarks.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClearAll}
              className="w-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white font-subtitle font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>அனைத்தையும் நீக்குக</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
