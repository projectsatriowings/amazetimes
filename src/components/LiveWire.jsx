import React, { useState, useEffect } from 'react';
import { Radio, Volume2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function LiveWire({ items = [], onOpenArticle, onSpeak }) {
  const defaultItems = [
    {
      id: 1,
      time: "10:15 IST",
      title: "சென்னை மெட்ரோ 2-ஆம் கட்டப் பணிகள்: புதிய சுரங்கம் அமைக்கும் பணி இன்று தொடக்கம்!",
      isHighlight: true
    },
    {
      id: 2,
      time: "09:30 IST",
      title: "தமிழகம் முழுவதும் நாளை பரவலாக மிதமான மழைக்கு வாய்ப்பு - வானிலை மையம்.",
      isHighlight: false
    },
    {
      id: 3,
      time: "08:50 IST",
      title: "சென்செக்ஸ் வர்த்தக துவக்கத்தில் 280 புள்ளிகள் உயர்வு: முதலீட்டாளர்கள் உற்சாகம்.",
      isHighlight: false
    },
    {
      id: 4,
      time: "07:45 IST",
      title: "மதுரை எய்ம்ஸ் கட்டுமானப் பணிகள் விறுவிறுப்பு: 2027 பயன்பாட்டுக்கு வரும்!",
      isHighlight: false
    }
  ];

  const [liveItems, setLiveItems] = useState(Array.isArray(items) && items.length > 0 ? items : []);

  useEffect(() => {
    if (Array.isArray(items) && items.length > 0) {
      setLiveItems(items);
    }
  }, [items]);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveUpdates = async () => {
      try {
        const res = await api.getLiveWire();
        const data = res?.items || res?.liveWire;
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveItems(data);
        }
      } catch (err) {
        console.warn('LiveWire fetch notice:', err);
      }
    };

    fetchLiveUpdates();

    const handleUpdate = () => {
      fetchLiveUpdates();
    };

    window.addEventListener('amaze:content_updated', handleUpdate);
    const interval = setInterval(fetchLiveUpdates, 20000); // 20-sec real-time live refresh

    return () => {
      isMounted = false;
      window.removeEventListener('amaze:content_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const feedItems = liveItems.length > 0 ? liveItems : defaultItems;

  return (
    <aside className="space-y-4 font-tamil">
      <div className="bg-white dark:bg-[#0D1424] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <h3 className="font-subtitle font-bold text-sm text-slate-900 dark:text-amber-400 flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>நேரடி செய்தி அலை</span>
          </h3>
          <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            <span>LIVE</span>
          </span>
        </div>

        {/* Vertical Timeline Feed */}
        <div className="space-y-3.5 text-xs">
          {feedItems.map((item) => {
            const isHighlighted = Boolean(item.is_highlight || item.isHighlight);
            const timeLabel = item.time_badge || item.time || (item.created_at ? new Date(item.created_at).toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit' }) : 'சிறிது நேரத்திற்கு முன்');
            return (
              <div
                key={item.id}
                className={`relative pl-4 border-l-2 space-y-1 transition-all ${
                  isHighlighted
                    ? 'border-red-600 bg-red-50/20 dark:bg-red-950/10 -ml-1 pl-5 py-1 rounded-r-xl'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full absolute -left-[5px] top-1.5 ${
                    isHighlighted ? 'bg-red-600 shadow-sm ring-2 ring-red-400/50' : 'bg-amber-400'
                  }`}
                ></span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-extrabold ${
                      isHighlighted ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-amber-400'
                    }`}
                  >
                    {timeLabel}
                  </span>
                  {isHighlighted && (
                    <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded uppercase">
                      முக்கியம்
                    </span>
                  )}
                </div>
                <h4
                  onClick={() => onOpenArticle && onOpenArticle(item.id)}
                  className={`font-title font-bold leading-snug line-clamp-2 transition-colors cursor-pointer ${
                    isHighlighted
                      ? 'text-red-700 dark:text-red-300 hover:text-red-600'
                      : 'text-slate-900 dark:text-slate-200 hover:text-red-600 dark:hover:text-amber-400'
                  }`}
                >
                  {item.title}
                </h4>
                {onSpeak && (
                  <button
                    onClick={() => onSpeak(item.title)}
                    className="text-[11px] font-subtitle font-bold text-[#0e2a7a] dark:text-amber-300 flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer pt-0.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>கேட்க</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
