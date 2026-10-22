import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sparkles, Volume2 } from 'lucide-react';

export default function ZodiacWidget({ onSpeak }) {
  const [signs, setSigns] = useState([]);
  const [selectedSignId, setSelectedSignId] = useState('mesham');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchZodiac = async () => {
      try {
        const res = await api.getZodiacToday();
        if (isMounted && res.success && res.signs && res.signs.length > 0) {
          setSigns(res.signs);
          setSelectedSignId(res.signs[0].id);
        }
      } catch (err) {
        console.warn('Zodiac live fetch fallback:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchZodiac();

    const handleUpdated = () => {
      if (isMounted) fetchZodiac();
    };
    window.addEventListener('amaze:content_updated', handleUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('amaze:content_updated', handleUpdated);
    };
  }, []);

  const activeSign = signs.find(s => s.id === selectedSignId) || signs[0];

  if (!activeSign && !isLoading) return null;

  return (
    <section className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-[#0D1424] dark:via-[#090F1E] dark:to-[#120B20] rounded-2xl p-4 sm:p-5 border border-amber-300/40 dark:border-amber-500/20 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/50 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-title font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                இன்றைய 12 ராசி பலன் (தினசரி பலன்கள்)
              </h2>
              <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-400/30">
                ஆன்மிகம்
              </span>
            </div>
            <p className="font-subtitle text-xs text-slate-600 dark:text-slate-400">
              கிரக நிலைகளின் படி மேஷம் முதல் மீனம் வரையிலான இன்றைய ராசி பலன்கள்
            </p>
          </div>
        </div>

        {/* Listen voice */}
        <div className="flex items-center gap-2">
          {activeSign && onSpeak && (
            <button
              onClick={() => onSpeak(`${activeSign.name_ta} ராசி பலன்: ${activeSign.prediction_text}`)}
              className="flex items-center gap-1.5 text-[11px] font-subtitle font-bold text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/50 px-2.5 py-1 rounded-xl border border-amber-300/60 dark:border-amber-800 transition-all cursor-pointer shadow-xs"
              title="ராசி பலன் கேட்க"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>வாசித்துக் கேட்க</span>
            </button>
          )}
        </div>
      </div>

      {/* 12 Zodiac Sign Glyphs Carousel / Selector */}
      <div className="overflow-x-auto scrollbar-none pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {signs.map((sign) => {
            const isSelected = sign.id === selectedSignId;
            return (
              <button
                key={sign.id}
                onClick={() => setSelectedSignId(sign.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-subtitle font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md scale-105 border border-amber-300'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="text-sm">{sign.glyph}</span>
                <span>{sign.name_ta}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Zodiac Sign Detail Box */}
      {activeSign && (
        <div className="bg-white dark:bg-[#080D1A] rounded-2xl p-4 border border-amber-200/60 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-black border border-amber-400/30">
                {activeSign.glyph}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-title font-extrabold text-lg text-slate-900 dark:text-slate-100">
                    {activeSign.name_ta} ({activeSign.name_en})
                  </h3>
                  {activeSign.ruling_planet && (
                    <span className="text-[11px] font-subtitle font-bold text-slate-600 dark:text-slate-400">
                      அதிபதி: <strong className="text-amber-600 dark:text-amber-400 font-black">{activeSign.ruling_planet}</strong>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">இன்றைய நாள் சிறப்புப் பலன்</p>
              </div>
            </div>

            {/* Lucky Attributes Pill Badges */}
            <div className="flex items-center gap-2 text-[11px] font-subtitle font-bold flex-wrap">
              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                அதிர்ஷ்ட எண்: <strong className="font-black">{activeSign.lucky_number || '7'}</strong>
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                அதிர்ஷ்ட நிறம்: <strong className="font-black">{activeSign.lucky_color || 'மஞ்சள்'}</strong>
              </span>
              <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                திசை: <strong className="font-black">{activeSign.lucky_direction || 'கிழக்கு'}</strong>
              </span>
            </div>
          </div>

          {/* Detailed Tamil Prediction Text */}
          <div className="p-3.5 bg-amber-500/5 dark:bg-slate-900/60 rounded-xl border border-amber-300/20 text-slate-800 dark:text-slate-200 font-serif-reading text-sm sm:text-base leading-relaxed">
            {activeSign.prediction_text}
          </div>
        </div>
      )}
    </section>
  );
}
