import React from 'react';

export default function LiveTVModal({ isOpen, onClose, onSpeak, onToast }) {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div class="bg-slate-950 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative">
        <div class="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
            <span class="font-subtitle font-bold text-sm text-white flex items-center gap-1.5">
              <span>அமேஸ் டைம்ஸ் 24x7 நேரலை (LIVE TV)</span>
              <span class="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded">LIVE HD</span>
            </span>
          </div>
          <button onClick={onClose} class="w-8 h-8 rounded-full bg-slate-800 hover:bg-brand-red text-white flex items-center justify-center transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Player Container */}
        <div class="relative w-full aspect-video bg-black flex flex-col justify-between p-4 overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80" alt="Live TV Stream" class="absolute inset-0 w-full h-full object-cover opacity-60"/>
          
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
              <img src="/Amaze times.jpg" alt="Logo" class="h-6 w-auto rounded"/>
              <span class="font-subtitle font-bold text-xs text-white">அமேஸ் 24x7</span>
            </div>
            <span class="bg-red-600 text-white text-xs font-subtitle font-bold px-2.5 py-1 rounded-lg animate-pulse flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">sensors</span>
              <span>நேரலை ஒளிபரப்பு</span>
            </span>
          </div>

          <div class="absolute inset-0 flex items-center justify-center z-10">
            <button onClick={() => onSpeak('அமேஸ் டைம்ஸ் நேரலை 24 மணி நேர செய்தி ஒளிபரப்பு சிக்னல் இயக்கப்படுகிறது.')} class="w-16 h-16 rounded-full bg-brand-red/90 hover:bg-brand-red text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[36px]">play_arrow</span>
            </button>
          </div>

          <div class="relative z-10 space-y-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 rounded-xl">
            <h4 class="font-title font-bold text-base text-amber-300">நேரலை செய்தி: தமிழக பட்ஜெட் விவாதம் மற்றும் நேரடி செய்தி நிலவரங்கள்</h4>
            <div class="flex items-center justify-between text-xs text-slate-300 font-subtitle">
              <div class="flex items-center gap-3">
                <button onClick={() => onToast('ஒலி இயக்கப்பட்டது', 'volume_up')} class="hover:text-amber-300 flex items-center gap-1 cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">volume_up</span>
                  <span>ஒலி</span>
                </button>
                <button onClick={() => onToast('HD தரம்: 1080p', 'high_quality')} class="hover:text-amber-300 flex items-center gap-1 cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">high_quality</span>
                  <span>1080p HD</span>
                </button>
              </div>
              <span>34,290+ நேரலை பார்வையாளர்கள்</span>
            </div>
          </div>
        </div>

        {/* Ticker Footer */}
        <div class="bg-brand-red text-white text-xs font-bold py-2 px-4 flex items-center gap-2">
          <span class="bg-black text-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase font-subtitle">LIVE TICKER</span>
          <marquee scrollamount="6" class="font-subtitle font-semibold">சென்னையில் புதிய மெட்ரோ வழித்தடப் பணிகள் 85% நிறைவு • தங்கத்தின் விலை சவரனுக்கு ₹120 சரிந்து விற்பனை • ஐபிஎல் 2025 சேப்பாக்கத்தில் சிஎஸ்கே தீவிர பயிற்சி!</marquee>
        </div>
      </div>
    </div>
  );
}
