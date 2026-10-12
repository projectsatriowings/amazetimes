import React from 'react';

export default function HeroSpotlight({
  leadData,
  onOpenArticle,
  onSpeak,
  onShareWhatsApp,
  isAdmin,
  onEditArticle,
  onDeleteArticle
}) {
  if (!leadData) return null;

  return (
    <article class="bg-white dark:bg-[#0D1424] rounded-2xl shadow-sm border border-slate-300 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all relative">
      {/* Visual Image Banner with Badges */}
      <div class="relative w-full aspect-[16/9] overflow-hidden bg-slate-900">
        <img
          src={leadData.image}
          alt={leadData.title}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute top-4 left-4 flex items-center gap-2">
          <span class="bg-brand-red text-white text-xs font-subtitle font-bold px-3 py-1 rounded-md shadow-md flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>சிறப்புப் பார்வை • {leadData.category}</span>
          </span>
          <span class="bg-amber-400 text-slate-950 font-subtitle font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
            PRGI NO. TNBIL/2023/88656
          </span>
        </div>

        {/* Floating Actions */}
        <div class="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={() => onSpeak(leadData.title)}
            class="bg-slate-900/80 hover:bg-brand-red backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-subtitle font-bold flex items-center gap-1 transition-all shadow"
            title="குரல் வாசிப்பு"
          >
            <span class="material-symbols-outlined text-[18px]">volume_up</span>
            <span>கேட்க</span>
          </button>
          <button
            onClick={() => onShareWhatsApp(leadData.title)}
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-subtitle font-bold flex items-center gap-1 transition-all shadow"
            title="வாட்ஸ்அப்பில் பகிர"
          >
            <span class="material-symbols-outlined text-[18px]">share</span>
            <span>பகிர்</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div class="p-5 md:p-6 space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span class="font-subtitle font-bold text-brand-red dark:text-red-400 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">edit_note</span>
            <span>{leadData.author || "அரசியல் நிருபர் குழு • சென்னை"}</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">schedule</span>
            <span>{leadData.time || "இன்று காலை 09:15 IST • 3 நிமிட வாசிப்பு"}</span>
          </span>
        </div>

        <h1
          onClick={() => onOpenArticle(leadData.id)}
          class="font-title font-extrabold text-xl md:text-2xl lg:text-3xl text-slate-900 dark:text-white group-hover:text-brand-red transition-colors cursor-pointer leading-tight"
        >
          {leadData.title}
        </h1>

        <p class="font-body text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
          {leadData.desc}
        </p>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-xs font-semibold text-brand-blue dark:text-slate-300">
            <span class="bg-blue-50 dark:bg-slate-800 text-brand-blue dark:text-amber-400 px-2.5 py-1 rounded-md border border-blue-100 dark:border-slate-700 font-subtitle">
              {leadData.tag || "சிறப்புச் செய்தி"}
            </span>
          </div>
          <button
            onClick={() => onOpenArticle(leadData.id)}
            class="text-brand-red hover:text-brand-redHover font-subtitle font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
          >
            <span>முழு செய்தி வாசிக்க</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        <div class="text-[10px] text-slate-400 dark:text-slate-500 italic border-t border-slate-100 dark:border-slate-800/50 pt-2 flex items-center justify-between">
          <span>மறுப்பு: அமேஸ் டைம்ஸ் (PRGI NO. TNBIL/2023/88656) சரிபார்க்கப்பட்ட செய்தி • பதிப்புரிமை பாதுகாக்கப்பட்டது</span>
        </div>
      </div>
    </article>
  );
}
