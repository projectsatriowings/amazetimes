import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Calendar, Sparkles, ChevronRight, FileText } from 'lucide-react';
import { api } from '../services/api';
import MagazineShowcase from './MagazineShowcase';

export default function MagazineHubSection({ onOpenEPaper, onToast }) {
  const [magazines, setMagazines] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2026');
  const years = ['2026', '2025', '2024', '2023', '2021'];

  useEffect(() => {
    const fetchMags = async () => {
      try {
        const res = await api.getMagazines();
        if (res && res.success && Array.isArray(res.magazines)) {
          setMagazines(res.magazines);
        }
      } catch (_) {}
    };
    fetchMags();
  }, []);

  const filteredMagazines = magazines.filter(m => String(m.year) === selectedYear);

  return (
    <div className="space-y-6 w-full max-w-[1400px] mx-auto px-2.5 sm:px-4 my-6">
      {/* Primary Showcase Card */}
      <MagazineShowcase onOpenEPaper={onOpenEPaper} onToast={onToast} />

      {/* Year Archive Filter & Magazine Grid */}
      <div className="bg-[#0b1325] rounded-3xl p-5 sm:p-6 border border-gray-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <BookOpen size={18} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">டிஜிட்டல் மாத இதழ் காப்பகம் (Magazine Archives)</h3>
              <p className="text-xs text-gray-400">முந்தைய வருடங்களின் அனைத்து மாத இதழ்களை வாசிக்க மற்றும் பதிவிறக்க</p>
            </div>
          </div>

          {/* Year Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {years.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Magazine Grid */}
        {filteredMagazines.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredMagazines.map(mag => (
              <div
                key={mag.id}
                className="bg-[#0f1a33] rounded-2xl p-2.5 border border-gray-800 hover:border-amber-500/50 transition group flex flex-col justify-between"
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 mb-2 relative">
                  <img
                    src={mag.cover_image || mag.cover_image_url || '/Amaze times.jpg'}
                    alt={mag.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
                  />
                  <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    {mag.month || mag.issue_month}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-200 line-clamp-1 mb-1">{mag.title}</h4>
                  <div className="text-[10px] text-gray-400 flex items-center justify-between mb-2">
                    <span>{mag.pages_count || mag.pagesCount || 36} பக்கங்கள்</span>
                    <span>{mag.file_size || '12 MB'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={onOpenEPaper}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[10px] font-bold text-center transition"
                    >
                      வாசிக்க
                    </button>
                    {mag.pdf_url && (
                      <a
                        href={mag.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
                        title="PDF பதிவிறக்க"
                      >
                        <Download size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 space-y-1">
            <p className="text-xs">{selectedYear}-ஆம் ஆண்டின் இதழ்கள் விரைவில் பதிவேற்றப்படும்.</p>
            <p className="text-[11px] text-gray-500">தற்போதைய பதிப்பை மேலே உள்ள அட்டைப்படத்தில் கிளிக் செய்து வாசிக்கலாம்.</p>
          </div>
        )}
      </div>
    </div>
  );
}
