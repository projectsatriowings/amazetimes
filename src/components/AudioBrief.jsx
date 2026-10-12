import React, { useState } from 'react';

export default function AudioBrief({ onSpeak }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    onSpeak("அமேஸ் டைம்ஸ் 3 நிமிட செய்தி ஆடியோ: தமிழக பட்ஜெட் அறிவிப்புகள், மெட்ரோ விரிவாக்கப் பணிகள் மற்றும் சர்வதேச பங்குச்சந்தை நிலவரங்கள்.");
  };

  return (
    <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-[#0B1226] dark:via-[#151D36] dark:to-[#090F20] text-white rounded-2xl p-4 shadow-xl space-y-3 border border-indigo-500/30">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 flex-shrink-0">
          <span class="material-symbols-outlined text-[22px]">headphones</span>
        </div>
        <div>
          <div class="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ஆடியோ செய்தி</span>
          </div>
          <div class="text-xs font-extrabold text-white leading-snug">3 நிமிட செய்திச் சுருக்கம்</div>
        </div>
      </div>

      <button
        onClick={handlePlayToggle}
        class="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 hover:text-red-600 font-extrabold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02]"
      >
        <span class="material-symbols-outlined text-[20px]">
          {isPlaying ? 'pause_circle' : 'play_arrow'}
        </span>
        <span>{isPlaying ? 'நிறுத்துக' : 'ஆடியோ கேட்க'}</span>
      </button>
    </div>
  );
}
