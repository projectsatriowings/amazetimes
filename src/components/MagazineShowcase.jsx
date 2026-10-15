import React from 'react';
import { BookOpen, Download } from 'lucide-react';

export default function MagazineShowcase({ onOpenEPaper, onToast }) {
  return (
    <section className="bg-gradient-to-r from-[#0a1945] via-[#0e2a7a] to-[#0a1945] rounded-3xl p-4 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-400/20 w-full max-w-full">
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
        
        {/* Left: Magazine 3D Cover Mockup */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative group cursor-pointer" onClick={onOpenEPaper}>
            <div className="w-40 sm:w-52 aspect-[3/4] bg-white rounded-2xl shadow-2xl overflow-hidden ring-4 ring-amber-400/40 transform group-hover:-translate-y-2 transition-transform duration-300 relative">
              <img
                src="/Amaze times.jpg"
                alt="அமேஸ் டைம்ஸ் மாத இதழ்"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-3 text-left">
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase w-fit mb-1 shadow">
                  சிறப்பு மலர்
                </span>
                <p className="font-title font-black text-sm text-amber-300 leading-tight">
                  அமேஸ் டைம்ஸ் டிஜிட்டல் மாத இதழ்
                </p>
                <span className="text-[10px] text-slate-300">அக்டோபர் 2026 பதிப்பு</span>
              </div>
            </div>

            {/* Floating Badge */}
            <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white">
              புதிய பதிப்பு!
            </span>
          </div>
        </div>

        {/* Right: Editorial Information & Actions */}
        <div className="md:col-span-8 space-y-4 text-left">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">அமேஸ் டைம்ஸ் பிரத்யேக மின்-இதழ்</span>
            </div>

            <h2 className="font-title font-black text-xl sm:text-3xl text-white leading-tight">
              அக்டோபர் 2026 மாதாந்திர சிறப்பிதழ் இப்போது வாசிக்கக் கிடைக்கிறது!
            </h2>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              தமிழ்நாட்டின் வளர்ச்சித் திட்டங்கள், வணிக முதலீடுகள், பங்குச்சந்தை கணிப்புகள், ஆன்மிகத் திருத்தலச் சிறப்புகள் மற்றும் பிரத்யேக பேட்டிகள் அடங்கிய 64 பக்க வண்ணமயமான டிஜிட்டல் மாத இதழை உங்கள் மொபைல் மற்றும் கணினியில் வாசியுங்கள்.
            </p>
          </div>

          {/* Highlights Checklist */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-200 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-base">✓</span>
              <span>உயர் தர வண்ணப் பக்கங்கள்</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-base">✓</span>
              <span>ஆஃப்லைன் PDF சேமிப்பு</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-base">✓</span>
              <span>மொபைல் வாசிப்பு வசதி</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={onOpenEPaper}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span>மின்-இதழை வாசிக்க (Read Now)</span>
            </button>

            <button
              onClick={() => {
                if (onToast) onToast('மாத இதழ் PDF பதிவிறக்கம் தொடங்குகிறது...', 'download');
                const link = document.createElement('a');
                link.href = '/Amaze times.jpg';
                link.download = 'Amaze_Times_October_2026_Edition.jpg';
                link.click();
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>பதிவிறக்கம் (PDF)</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
