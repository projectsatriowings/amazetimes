import React from 'react';

export default function EPaperModal({ isOpen, onClose, onToast }) {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div class="bg-white dark:bg-[#0D1424] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 relative">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-brand-red text-white flex items-center justify-center shadow">
              <span class="material-symbols-outlined text-[24px]">newspaper</span>
            </span>
            <div>
              <h3 class="font-subtitle font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>அமேஸ் டைம்ஸ் - டிஜிட்டல் இ-பேப்பர்</span>
                <span class="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">இன்றைய பதிப்பு</span>
              </h3>
              <p class="font-body text-xs text-slate-500 dark:text-slate-400">7 அக்டோபர் 2026 • 16 பக்கங்கள் முழு அச்சு நாளிதழ் வடிவம்</p>
            </div>
          </div>
          <button onClick={onClose} class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Controls bar */}
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2 text-xs font-subtitle font-bold">
            <button onClick={() => onToast('முதல் பக்கம் காண்பிக்கப்படுகிறது', 'first_page')} class="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:border-brand-red text-slate-800 dark:text-slate-200 cursor-pointer">முந்தைய</button>
            <span class="px-2 text-slate-700 dark:text-slate-200">பக்கம் <strong class="text-brand-red">01</strong> / 16</span>
            <button onClick={() => onToast('அடுத்த பக்கம் 02 ஏற்றப்படுகிறது', 'navigate_next')} class="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:border-brand-red text-slate-800 dark:text-slate-200 cursor-pointer">அடுத்த</button>
          </div>
          <button onClick={() => onToast('இ-பேப்பர் PDF பதிவிறக்கம் தொடங்குகிறது...', 'download')} class="bg-gradient-to-r from-brand-red to-red-600 text-white font-subtitle font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:opacity-90 cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>PDF பதிவிறக்கம் (14 MB)</span>
          </button>
        </div>

        {/* Authentic 3-Tier Newspaper Poster Replica Canvas */}
        <div class="newspaper-print-box rounded-2xl overflow-hidden p-6 space-y-4 text-slate-900 bg-white">
          <div class="bg-brand-red p-4 rounded-xl text-center space-y-2 border-2 border-slate-900 shadow-md">
            <h1 class="font-title text-4xl sm:text-5xl text-white tracking-wide font-extrabold">
              அமேஸ் டைம்ஸ்
            </h1>
            <div class="flex flex-wrap items-center justify-between gap-2 text-white font-subtitle text-xs sm:text-sm font-bold border-t border-white/30 pt-2 px-2">
              <span>PRGI NO. TNBIL/2023/88659</span>
              <span>தமிழ் மாத இதழ்</span>
            </div>
          </div>

          <div class="border-2 border-slate-900 rounded-xl p-4 space-y-3 bg-slate-50">
            <div class="w-full h-48 sm:h-56 overflow-hidden rounded-lg border border-slate-900 shadow-inner">
              <img src="/Amaze times.jpg" alt="Bar Council News" class="w-full h-full object-cover"/>
            </div>

            <p class="font-body text-slate-900 text-sm sm:text-base leading-relaxed font-semibold text-justify">
              தமிழ்நாடு மற்றும் புதுச்சேரி பார் கவுன்சிலுக்கு 23 உறுப்பினர்களை தேர்ந்தெடுப்பதற்காக இன்று நடைபெற்ற தேர்தலில் சென்னையில் 19,351 வாக்குகளும், தமிழகத்தில் மொத்தம் 81,904 வாக்குகள் பதிவானது. ஏப்ரல் 3ம் தேதி வாக்கு எண்ணிக்கை துவங்குாகிறது.
            </p>

            <div class="text-right border-t border-slate-300 pt-2 font-subtitle text-xs sm:text-sm font-bold text-slate-800">
              செய்தியாளர் - <span class="font-title text-brand-red font-black">அமேஸ் டைம்ஸ்</span>
            </div>
          </div>

          <div class="bg-brand-red p-3 rounded-xl text-center border-2 border-slate-900 shadow-md">
            <h2 class="font-title-en text-3xl sm:text-4xl text-white font-black">
              Amaze Times
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
