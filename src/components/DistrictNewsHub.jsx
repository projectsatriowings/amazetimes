import React, { useState } from 'react';
import { MapPin, Clock, ArrowRight, Eye, Newspaper, BookOpen, Flame } from 'lucide-react';
import { getResponsiveImageProps } from '../utils/imageHelper';

const districtNameMap = {
  chennai: 'சென்னை',
  madurai: 'மதுரை',
  kovai: 'கோயம்புத்தூர்',
  trichy: 'திருச்சி',
  salem: 'சேலம்',
  nellai: 'திருநெல்வேலி'
};

const defaultDistrictArticles = [
  {
    id: 'dist-1',
    district: 'chennai',
    name: 'சென்னை',
    title: 'சென்னை மெட்ரோ ரயில் 2-ம் கட்ட விரிவாக்கப் பணிகள்: சுரங்கப்பாதை அமைக்கும் பணி தீவிரம்',
    time: '20 நிமிடங்களுக்கு முன்',
    img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fm=webp&fit=crop&q=80&w=800'
  },
  {
    id: 'dist-2',
    district: 'madurai',
    name: 'மதுரை',
    title: 'மதுரை மீனாட்சி அம்மன் கோவில் திருவிழா: பல்லாயிரக்கணக்கான பக்தர்கள் குவிந்தனர்',
    time: '45 நிமிடங்களுக்கு முன்',
    img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fm=webp&fit=crop&q=80&w=800'
  },
  {
    id: 'dist-3',
    district: 'kovai',
    name: 'கோயம்புத்தூர்',
    title: 'கோவை சர்வதேச தொழில் கண்காட்சி: ரூ.5,000 கோடி முதலீட்டு ஒப்பந்தங்கள் கையெழுத்து',
    time: '1 மணி நேரத்திற்கு முன்',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fm=webp&fit=crop&q=80&w=800'
  },
  {
    id: 'dist-4',
    district: 'trichy',
    name: 'திருச்சி',
    title: 'திருச்சி சர்வதேச விமான நிலையத்தில் புதிய முனையம்: விமான சேவைகள் இருமடங்காக உயர்வு',
    time: '2 மணி நேரத்திற்கு முன்',
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fm=webp&fit=crop&q=80&w=800'
  },
  {
    id: 'dist-5',
    district: 'salem',
    name: 'சேலம்',
    title: 'சேலம் உருக்காலை நவீனமயமாக்கல்: 1,200 இளைஞர்களுக்குப் புதிய வேலைவாய்ப்புகள்',
    time: '3 மணி நேரத்திற்கு முன்',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fm=webp&fit=crop&q=80&w=800'
  },
  {
    id: 'dist-6',
    district: 'nellai',
    name: 'திருநெல்வேலி',
    title: 'தாமிரபரணி ஆற்றுப்படுகை புனரமைப்பு: நெல்லை, தூத்துக்குடி விவசாயிகள் மகிழ்ச்சி',
    time: '4 மணி நேரத்திற்கு முன்',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fm=webp&fit=crop&q=80&w=800'
  }
];

export default function DistrictNewsHub({ articles = [], onOpenArticle, onOpenEPaper }) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Extract any published news from backend with district metadata, or merge with rich defaults
  const backendDistricts = (articles || []).filter(
    (a) => a.district && a.district !== 'all' && (a.status === 'published' || !a.status)
  ).map((a) => ({
    id: a.id || a._id,
    district: a.district.toLowerCase(),
    name: districtNameMap[a.district.toLowerCase()] || a.district,
    title: a.title,
    time: a.time || 'சிறிது நேரத்திற்கு முன்',
    img: a.mainImage || a.img || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fm=webp&fit=crop&q=80&w=800',
    raw: a
  }));

  const combinedArticles = backendDistricts.length >= 4 ? backendDistricts : [...backendDistricts, ...defaultDistrictArticles];

  const filteredArticles = activeFilter === 'all'
    ? combinedArticles
    : combinedArticles.filter((item) => item.district === activeFilter);

  const filters = [
    { key: 'all', label: 'அனைத்தும்' },
    { key: 'chennai', label: 'சென்னை' },
    { key: 'madurai', label: 'மதுரை' },
    { key: 'kovai', label: 'கோயம்புத்தூர்' },
    { key: 'trichy', label: 'திருச்சி' },
    { key: 'salem', label: 'சேலம்' },
    { key: 'nellai', label: 'திருநெல்வேலி' }
  ];

  return (
    <section className="space-y-5" id="districts">
      {/* Header with Title & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0e2a7a] dark:border-amber-400 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#0e2a7a] dark:bg-amber-400"></span>
          <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold text-[#0a1945] dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600 dark:text-amber-400" />
            <span>மாவட்டச் செய்திகள் & நகரப் பதிப்புகள்</span>
          </h3>
        </div>

        {/* District Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs sm:text-sm font-bold no-scrollbar py-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-full transition shrink-0 cursor-pointer ${
                activeFilter === f.key
                  ? 'bg-[#0a1945] text-amber-400 font-extrabold shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-400 hover:text-slate-950'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* District News Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredArticles.slice(0, 8).map((item) => {
          const imgProps = getResponsiveImageProps(item.img, 400, 225);
          return (
            <div
              key={item.id}
              onClick={() => onOpenArticle && onOpenArticle(item.raw || item)}
              className="bg-white dark:bg-[#0f1b3d] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={imgProps.src}
                  srcSet={imgProps.srcSet}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  alt={item.title}
                  width="400"
                  height="250"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { 
                    e.target.removeAttribute('srcset');
                    e.target.src = '/Amaze times.jpg'; 
                  }}
                />
                <span className="absolute top-3 left-3 bg-[#0a1945]/90 backdrop-blur-xs text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-amber-400/30 shadow">
                  {item.name}
                </span>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-amber-500" /> {item.time}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-[#0e2a7a] dark:group-hover:text-amber-300 leading-snug line-clamp-3">
                    {item.title}
                  </h4>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-red-600 dark:text-amber-400 font-bold">
                  <span>செய்தி வாசிக்க</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
