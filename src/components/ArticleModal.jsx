import React from 'react';

export default function ArticleModal({ isOpen, onClose, articleData, onSpeak, onShareWhatsApp }) {
  if (!isOpen || !articleData) return null;

  return (
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div class="bg-white dark:bg-[#0D1424] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 relative">
        {/* Header */}
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span class="bg-brand-red text-white text-xs font-subtitle font-bold px-3 py-1 rounded-md">
            {articleData.category || "செய்தி"}
          </span>
          <button
            onClick={onClose}
            class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Title */}
        <h2 class="font-title font-bold text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white leading-tight">
          {articleData.title}
        </h2>

        {/* Meta Info & Actions */}
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-subtitle text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800 py-2">
          <span>{articleData.time || "இன்று காலை"}</span>
          <div class="flex items-center gap-2">
            <button
              onClick={() => onSpeak(articleData.title)}
              class="bg-blue-50 dark:bg-slate-800 text-brand-blue dark:text-amber-400 px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-brand-blue hover:text-white transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[16px]">volume_up</span>
              <span>குரலில் கேட்க</span>
            </button>
            <button
              onClick={() => onShareWhatsApp(articleData.title)}
              class="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[16px]">share</span>
              <span>பகிர்</span>
            </button>
          </div>
        </div>

        {/* Image */}
        {articleData.image && (
          <div class="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow">
            <img src={articleData.image} alt={articleData.title} class="w-full h-full object-cover"/>
          </div>
        )}

        {/* Article Body Content */}
        <div class="font-body text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-3">
          <p>{articleData.body || articleData.desc}</p>
          <p class="text-xs text-slate-500 italic pt-2 border-t border-slate-100 dark:border-slate-800">
            அமேஸ் டைம்ஸ் நாளிதழின் பிரத்யேக கள நிலவரப்படி இச்செய்தி உறுதி செய்யப்பட்டுள்ளது.
          </p>
        </div>
      </div>
    </div>
  );
}
