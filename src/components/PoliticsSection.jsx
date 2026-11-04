import React, { useState } from 'react';
import { Vote, ChevronRight, Flame, Clock, Share2, Sparkles, Flag, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const FALLBACK_POLITICS = [
  {
    id: 'pol-lead-1',
    title: 'சட்டமன்ற தேர்தல் 2026: அனைத்து மாவட்டங்களிலும் களப்பணியை தீவிரப்படுத்த திமுக தலைமை உத்தரவு!',
    summary: '2026 சட்டமன்ற தேர்தலை முன்னிட்டு தொகுதி வாரியாக பூத் கமிட்டி அமைத்தல் மற்றும் அரசின் நலத்திட்டங்களை மக்களிடம் நேரடியாக கொண்டு சேர்க்கும் பணிகளை துரிதப்படுத்த மாவட்ட செயலாளர்களுக்கு முதல்வர் மு.க.ஸ்டாலின் அறிவுறுத்தல்.',
    image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    category: 'அரசியல்',
    subCategory: 'தேர்தல் 2026 சிறப்பு',
    date: '10 நிமிடங்களுக்கு முன்',
    author: 'அரசியல் செய்தியாளர் பிரிவு',
    views: '18.4K',
    tag: 'தேர்தல் 2026'
  },
  {
    id: 'pol-side-1',
    title: 'கூட்டணி வியூகம் & தொகுதிப் பங்கீடு: முக்கிய நிர்வாகிகளுடன் எடப்பாடி பழனிசாமி தீவிர ஆலோசனை',
    summary: 'அதிமுக தலைமையகத்தில் கட்சியின் மூத்த நிர்வாகிகள் மற்றும் மாவட்ட செயலாளர்களுடன் தேர்தல் கூட்டணி மற்றும் பிரச்சார வியூகம் குறித்து ஆலோசனை நடைபெற்றது.',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=600&q=80',
    category: 'அரசியல்',
    subCategory: 'அதிமுக & கூட்டணிக் களம்',
    date: '35 நிமிடங்களுக்கு முன்',
    author: 'சென்னை சிறப்பு நிருபர்',
    views: '12.1K',
    tag: 'அதிமுக'
  },
  {
    id: 'pol-side-2',
    title: 'விஜய்யின் தமிழக வெற்றிக் கழகம்: மாநிலம் தழுவிய சுற்றுப்பயணம் & உறுப்பினர் சேர்க்கை வேகம்',
    summary: 'தமிழகம் முழுவதும் இளைஞர்கள் மற்றும் மகளிரை அதிகளவில் தவெக-வில் இணைக்கும் இலக்குடன் தொகுதிப் பொறுப்பாளர்கள் நியமனம் இறுதிக்கட்டத்தை எட்டியுள்ளது.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
    category: 'அரசியல்',
    subCategory: 'விஜய் - தவெக அரசியல்',
    date: '1 மணி நேரத்திற்கு முன்',
    author: 'அரசியல் சிறப்புக் குழு',
    views: '24.9K',
    tag: 'தவெக'
  },
  {
    id: 'pol-side-3',
    title: 'தேசிய ஜனநாயக கூட்டணி மாநாடு: தமிழக தேர்தல் முடிவுகள் குறித்து தேசிய தலைவர்கள் திட்டம்',
    summary: 'டெல்லியில் நடைபெற்ற உயர்மட்ட ஆலோசனைக் கூட்டத்தில் தமிழக அரசியல் களம் மற்றும் தேர்தல் தயாரிப்புகள் குறித்து விரிவான ஆய்வு மேற்கொள்ளப்பட்டது.',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
    category: 'அரசியல்',
    subCategory: 'பாஜக & தேசிய அரசியல்',
    date: '2 மணி நேரத்திற்கு முன்',
    author: 'டெல்லி சிறப்பு பிரிவு',
    views: '9.8K',
    tag: 'தேசியம்'
  },
  {
    id: 'pol-side-4',
    title: 'சட்டமன்ற பட்ஜெட் கூட்டத்தொடர்: புதிய தொழில் முதலீடுகள் மற்றும் மக்கள் நலத் திட்டங்கள் அறிவிப்பு',
    summary: 'சட்டப்பேரவையில் கேள்வி நேரத்தின் போது அமைச்சர்கள் பல்வேறு முக்கிய கொள்கை முடிவுகள் மற்றும் மாவட்ட வளர்ச்சி திட்டங்களுக்கான நிதி ஒதுக்கீடுகளை அறிவித்தனர்.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    category: 'அரசியல்',
    subCategory: 'சட்டமன்ற நிகழ்வுகள்',
    date: '3 மணி நேரத்திற்கு முன்',
    author: 'செய்தியாளர் மன்றம்',
    views: '14.2K',
    tag: 'சட்டமன்றம்'
  }
];

const QUICK_TAGS = [
  'அனைத்து அரசியல்',
  'தேர்தல் 2026',
  'திமுக',
  'அதிமுக',
  'தவெக',
  'பாஜக',
  'நாம் தமிழர்',
  'சட்டமன்றம்'
];

export const PoliticsSection = ({ articles = [], onOpenArticle, onSelectCategory }) => {
  const [selectedTag, setSelectedTag] = useState('அனைத்து அரசியல்');

  // Filter politics articles from props or use rich defaults
  const politicsArticles = (articles || []).filter((art) => {
    const c = String(art.category || art.category_name || art.cat || '').toLowerCase();
    const sc = String(art.subCategory || art.sub_category || '').toLowerCase();
    const t = String(art.title || '').toLowerCase();
    return (
      c.includes('politics') ||
      c.includes('அரசியல்') ||
      sc.includes('politics') ||
      sc.includes('அரசியல்') ||
      t.includes('தேர்தல்') ||
      t.includes('முதல்வர்') ||
      t.includes('திமுக') ||
      t.includes('அதிமுக') ||
      t.includes('சட்டமன்ற')
    );
  });

  const displayList = politicsArticles.length > 0 ? politicsArticles : FALLBACK_POLITICS;

  // Filter by tag if selected
  const filteredList = displayList.filter((item) => {
    if (selectedTag === 'அனைத்து அரசியல்') return true;
    const text = `${item.title || ''} ${item.summary || ''} ${item.subCategory || ''} ${item.tag || ''}`.toLowerCase();
    return text.includes(selectedTag.toLowerCase());
  });

  const currentItems = filteredList.length > 0 ? filteredList : displayList;
  const leadStory = currentItems[0] || displayList[0];
  const sideStories = currentItems.slice(1, 5).length > 0 ? currentItems.slice(1, 5) : displayList.slice(1, 5);

  const handleArticleClick = (art) => {
    if (onOpenArticle) {
      onOpenArticle(art);
    } else if (onSelectCategory) {
      onSelectCategory('politics');
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#0a0f1d] via-[#111827] to-[#0a1122] rounded-3xl p-5 sm:p-7 border-2 border-red-600/30 shadow-2xl space-y-6 text-white font-tamil relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3 animate-pulse" /> HOT ELECTION PULSE
            </span>
            <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> தமிழ்நாடு அரசியல் களம்
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2">
            <Vote className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
            <span>அரசியல் களம் & தேர்தல் 2026 சிறப்புப் பார்வை</span>
          </h2>
          <p className="text-xs text-slate-300">
            தமிழகத்தின் தேர்தல் களம், கூட்டணிக் கணக்குகள், கட்சி அறிக்கைகள் மற்றும் பிரத்யேக களப் பார்வைகள்
          </p>
        </div>

        {/* View All Button */}
        <button
          onClick={() => onSelectCategory && onSelectCategory('politics')}
          className="self-start md:self-auto bg-slate-900/90 hover:bg-red-600 text-white border border-red-500/40 hover:border-red-500 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer group shadow-lg shrink-0"
        >
          <span>அனைத்து அரசியல் செய்திகள்</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Quick Tag Pills */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {QUICK_TAGS.map((tag) => {
          const isActive = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
              <span>{tag}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: 1 Hero Lead Card (Left) + 4 Side Cards (Right) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Lead Story */}
        <div className="lg:col-span-7">
          <div
            onClick={() => handleArticleClick(leadStory)}
            className="group relative bg-[#060b18] rounded-2xl border border-red-500/30 hover:border-red-500/70 overflow-hidden shadow-xl cursor-pointer transition-all duration-300 h-full flex flex-col justify-between"
          >
            <div className="relative h-64 sm:h-72 lg:h-80 w-full overflow-hidden">
              <img
                src={leadStory.image || leadStory.cover_image_url || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80'}
                alt={leadStory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060b18] via-[#060b18]/40 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase shadow">
                  முக்கிய அரசியல் செய்தி
                </span>
                {leadStory.subCategory && (
                  <span className="bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {leadStory.subCategory}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-red-400 transition-colors leading-snug">
                  {leadStory.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {leadStory.summary || leadStory.excerpt || leadStory.body}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {leadStory.date || leadStory.published_at || 'சமீபத்தியது'}
                </span>
                <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  முழுமையாகப் படிக்க <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Side Cards Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
          {sideStories.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => handleArticleClick(item)}
              className="group bg-[#060b18] hover:bg-[#0c1428] rounded-xl border border-slate-800 hover:border-red-500/40 p-3 sm:p-3.5 flex gap-3 transition-all cursor-pointer shadow-md"
            >
              <div className="relative w-24 sm:w-28 h-20 sm:h-22 rounded-lg overflow-hidden shrink-0">
                <img
                  src={item.image || item.cover_image_url || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.tag && (
                  <span className="absolute bottom-1 left-1 bg-red-600/90 text-[9px] font-black text-white px-1.5 py-0.2 rounded">
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.date || 'இன்று'}
                  </span>
                  <span className="text-red-400 font-bold flex items-center text-[11px] group-hover:translate-x-0.5 transition-transform">
                    வாசிக்க →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PoliticsSection;
