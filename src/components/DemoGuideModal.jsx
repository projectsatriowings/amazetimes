import React from 'react';
import { X, Volume2, Moon, MessageCircle, Bookmark } from 'lucide-react';

export default function DemoGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0D1424] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 relative">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img src="/amaze-times-logo.webp" alt="Logo" className="h-10 w-auto rounded-lg shadow-sm object-contain bg-white p-0.5"/>
            <div>
              <h3 className="font-subtitle font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>அமேஸ் டைம்ஸ் - தள வசதிகள்</span>
                <span className="bg-gradient-to-r from-brand-red to-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">EXCLUSIVE</span>
              </h3>
              <p className="font-body text-xs text-slate-500 dark:text-slate-400">வாசகர்களுக்காக பிரத்யேகமாக வடிவமைக்கப்பட்ட அதிநவீன அம்சங்கள்</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-subtitle">
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">குரல் வாசிப்பு</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">தமிழ் குரல் செய்தி (Text-to-Speech)</h4>
            <p className="font-body text-xs text-slate-600 dark:text-slate-400">செய்திகளை வாசிக்க சிரமமின்றி நேரடியாகத் தமிழில் குரலில் கேட்கலாம். "குரல் செய்தி" பொத்தானை அழுத்தவும்.</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">இருள் பார்வை</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Obsidian Dark Mode</h4>
            <p className="font-body text-xs text-slate-600 dark:text-slate-400">இரவில் வாசிக்க வசதியாக கண்களுக்குப் பாதிப்பில்லாத பிரத்யேக இருள் பார்வை அனுபவம்.</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">வாட்ஸ்அப்</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">நேரடி வாட்ஸ்அப் பகிர்வு</h4>
            <p className="font-body text-xs text-slate-600 dark:text-slate-400">முக்கிய செய்திகளை ஒரே க்ளிக்கில் தலைப்பு மற்றும் சுட்டியுடன் வாட்ஸ்அப்பில் பகிரலாம்.</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">சேமிப்புகள்</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">செய்தி சேமிப்புகள் (Offline Reading)</h4>
            <p className="font-body text-xs text-slate-600 dark:text-slate-400">உங்களுக்குப் பிடித்த செய்திகளைச் சேமித்து வைத்து பின்னர் அமைதியாக வாசிக்கலாம்.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="bg-gradient-to-r from-brand-red to-rose-600 text-white font-subtitle font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer">
            சரி, புரிந்தது!
          </button>
        </div>
      </div>
    </div>
  );
}
