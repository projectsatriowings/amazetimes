import React, { useState } from 'react';
import { Headphones, Play, Pause, Lock } from 'lucide-react';

export default function AudioBrief({ onSpeak, readerUser = null, onOpenAuth, onToast }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayToggle = () => {
    if (!readerUser) {
      if (onToast) onToast('🎙️ AI ஆடியோ செய்தியைக் கேட்க அமேஸ் டைம்ஸ் வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setIsPlaying(!isPlaying);
    onSpeak("அமேஸ் டைம்ஸ் 3 நிமிட செய்தி ஆடியோ: தமிழக பட்ஜெட் அறிவிப்புகள், மெட்ரோ விரிவாக்கப் பணிகள் மற்றும் சர்வதேச பங்குச்சந்தை நிலவரங்கள்.");
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-[#0B1226] dark:via-[#151D36] dark:to-[#090F20] text-white rounded-2xl p-4 shadow-xl space-y-3 border border-indigo-500/30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 flex-shrink-0">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ஆடியோ செய்தி {readerUser ? '• VIP வாசகர்' : '• வாசகர்களுக்கு மட்டும்'}</span>
          </div>
          <div className="text-xs font-extrabold text-white leading-snug">3 நிமிட செய்திச் சுருக்கம்</div>
        </div>
      </div>

      <button
        onClick={handlePlayToggle}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02]"
      >
        {!readerUser ? (
          <>
            <Lock className="w-4 h-4 text-amber-300" />
            <span>🔒 ஆடியோ கேட்க (உள்நுழைக)</span>
          </>
        ) : (
          <>
            {isPlaying ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white" />}
            <span>{isPlaying ? 'நிறுத்துக' : 'ஆடியோ கேட்க'}</span>
          </>
        )}
      </button>
    </div>
  );
}
