import React from 'react';
import { X, Play, Volume2, Radio, Tv } from 'lucide-react';

export default function LiveTVModal({ isOpen, onClose, onSpeak, onToast }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-slate-950 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
            <div className="flex items-center gap-2">
              <span className="font-subtitle font-bold text-sm text-white">அமேஸ் டைம்ஸ் 24x7 நேரலை (LIVE TV)</span>
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">LIVE HD</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Container */}
        <div className="relative w-full aspect-video bg-black flex flex-col justify-between p-4 overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80" 
            alt="Live TV Stream" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
          />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
              <img src="/Amaze times.jpg" alt="Logo" className="h-6 w-auto rounded"/>
              <span className="font-subtitle font-bold text-xs text-white">அமேஸ் 24x7</span>
            </div>
            <span className="bg-red-600 text-white text-xs font-subtitle font-bold px-2.5 py-1 rounded-lg animate-pulse flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-white" />
              <span>நேரலை ஒளிபரப்பு</span>
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button 
              onClick={() => onSpeak('அமேஸ் டைம்ஸ் நேரலை 24 மணி நேர செய்தி ஒளிபரப்பு சிக்னல் இயக்கப்படுகிறது.')} 
              className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </button>
          </div>

          <div className="relative z-10 space-y-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 rounded-xl">
            <h4 className="font-title font-bold text-base text-amber-300">நேரலை செய்தி: தமிழ்நாடு மற்றும் தேசிய முக்கியச் செய்திகள்</h4>
            <div className="flex items-center justify-between text-xs text-slate-300 font-subtitle">
              <div className="flex items-center gap-3">
                <button onClick={() => onToast('ஒலி இயக்கப்பட்டது', 'volume_up')} className="hover:text-amber-300 flex items-center gap-1.5 cursor-pointer">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>ஒலி</span>
                </button>
                <button onClick={() => onToast('HD தரம்: 1080p', 'check')} className="hover:text-amber-300 flex items-center gap-1.5 cursor-pointer">
                  <Tv className="w-4 h-4 text-sky-400" />
                  <span>1080p HD</span>
                </button>
              </div>
              <span className="text-slate-300 font-bold">34,290+ நேரலை பார்வையாளர்கள்</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>அமேஸ் டைம்ஸ் டிஜிட்டல் நேரலை மையம்</span>
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer transition-colors">
            மூடுக
          </button>
        </div>
      </div>
    </div>
  );
}
