import React, { useState } from 'react';
import { Home, Search, ArrowLeft, Newspaper, Compass, AlertCircle, RefreshCw } from 'lucide-react';

export default function NotFoundPage({ onNavigate, onSelectCategory }) {
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim() && onNavigate) {
      onNavigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else if (onNavigate) {
      onNavigate('/');
    }
  };

  const categories = [
    { id: 'tamilnadu', label: 'தமிழ்நாடு' },
    { id: 'districts', label: 'மாவட்டங்கள்' },
    { id: 'business', label: 'வணிகம்' },
    { id: 'cinema', label: 'சினிமா' },
    { id: 'sports', label: 'விளையாட்டு' },
    { id: 'spiritual', label: 'ஆன்மிகம்' },
  ];

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-xl w-full text-center space-y-8 bg-white dark:bg-[#0d1627] p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          <span>பிழை 404 • பக்கம் கிடைக்கவில்லை</span>
        </div>

        {/* 404 Large Visual Typography */}
        <div className="space-y-3">
          <h1 className="text-6xl sm:text-8xl font-black font-title tracking-tight bg-gradient-to-r from-red-600 via-amber-500 to-[#0e2a7a] bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-title">
            மன்னிக்கவும்! நீங்கள் தேடும் பக்கம் கிடைக்கவில்லை
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            நீங்கள் குறிப்பிட்ட இணைய முகவரி (URL) மாற்றப்பட்டிருக்கலாம் அல்லது நீக்கப்பட்டிருக்கலாம். கீழ்வரும் இணைப்புகள் மூலம் முக்கியச் செய்திகளைத் தொடரலாம்.
          </p>
        </div>

        {/* Integrated Quick Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="செய்திகளைத் தேடுங்கள் (எ.கா. பட்ஜெட், தேர்தல்)..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl pl-11 pr-24 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
          >
            தேடுக
          </button>
        </form>

        {/* Popular Categories Shortcut */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>முக்கிய செய்திப் பிரிவுகள்:</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat.id);
                  if (onNavigate) onNavigate('/');
                }}
                className="bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-400 transition-all cursor-pointer"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Back to Home Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-3">
          <button
            onClick={() => {
              if (onNavigate) onNavigate('/');
              else window.location.href = '/';
            }}
            className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>முகப்புப் பக்கத்திற்குச் செல்க</span>
          </button>
        </div>

      </div>
    </main>
  );
}
