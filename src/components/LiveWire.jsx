import React from 'react';

export default function LiveWire({ onOpenArticle, onSpeak, items = [] }) {
  const feedItems = items && items.length > 0 ? items.map(item => ({
    id: item.id,
    time: item.time_badge || item.time || 'நேரலை',
    title: item.title,
    isHighlight: Boolean(item.is_highlight || item.isHighlight)
  })) : [
    {
      id: 1,
      time: "09:15 IST",
      title: "தமிழக பட்ஜெட் 2025: உள்கட்டமைப்பு பணிகளுக்கு பிரம்மாண்ட நிதி ஒதுக்கீடு!",
      isHighlight: true
    },
    {
      id: 2,
      time: "08:50 IST",
      title: "சென்னையில் புதிய மெட்ரோ சுரங்கப் பாதை பணிகள் 85% பூர்த்தி!",
      isHighlight: false
    },
    {
      id: 3,
      time: "08:25 IST",
      title: "மும்பை பங்குச்சந்தை புதிய சாதனை: சென்செக்ஸ் 78,400 புள்ளிகளைக் கடந்தது!",
      isHighlight: false
    },
    {
      id: 5,
      time: "07:45 IST",
      title: "மதுரை எய்ம்ஸ் கட்டுமானப் பணிகள் விறுவிறுப்பு: 2027 பயன்பாட்டுக்கு வரும்!",
      isHighlight: false
    }
  ];

  return (
    <aside class="space-y-4">
      <div class="bg-white dark:bg-[#0D1424] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <h3 class="font-subtitle font-bold text-sm text-slate-900 dark:text-amber-400 flex items-center gap-2">
            <span class="w-2.5 h-4 bg-brand-red rounded-full"></span>
            <span>நேரடி செய்தி அலை</span>
          </h3>
          <span class="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            <span>LIVE</span>
          </span>
        </div>

        {/* Vertical Timeline Feed */}
        <div class="space-y-3.5 text-xs">
          {feedItems.map((item) => (
            <div
              key={item.id}
              class={`relative pl-4 border-l-2 space-y-1 ${
                item.isHighlight
                  ? 'border-brand-red'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <span
                class={`w-2 h-2 rounded-full absolute -left-[5px] top-1 ${
                  item.isHighlight ? 'bg-brand-red shadow-sm' : 'bg-amber-400'
                }`}
              ></span>
              <span
                class={`text-[11px] font-extrabold ${
                  item.isHighlight ? 'text-brand-red dark:text-red-400' : 'text-slate-500 dark:text-amber-400'
                }`}
              >
                {item.time}
              </span>
              <h4
                onClick={() => onOpenArticle(item.id)}
                class="font-title font-bold text-slate-900 dark:text-slate-100 hover:text-brand-red dark:hover:text-red-400 cursor-pointer leading-snug line-clamp-2 transition-colors"
              >
                {item.title}
              </h4>
              <button
                onClick={() => onSpeak(item.title)}
                class="text-[11px] font-subtitle font-bold text-brand-blue dark:text-amber-300 flex items-center gap-1 hover:text-brand-red transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[15px] text-amber-400">volume_up</span>
                <span>கேட்க</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
