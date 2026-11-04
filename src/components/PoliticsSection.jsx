import React, { useState } from 'react';
import {
  Vote,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Share2,
  Eye,
  TrendingUp,
  Landmark,
  ShieldAlert,
  Radio
} from 'lucide-react';

const FALLBACK_POLITICS = [
  {
    id: 'pol-lead-1',
    title: 'சட்டமன்ற தேர்தல் 2026: அனைத்து மாவட்டங்களிலும் தேர்தல் பணிகளை தீவிரப்படுத்த திமுக தலைமை உத்தரவு!',
    summary: '2026 சட்டமன்ற தேர்தலை முன்னிட்டு தொகுதி வாரியாக பூத் கமிட்டி அமைத்தல், வாக்காளர் பட்டியல் சரிபார்ப்பு மற்றும் அரசின் சாதனை திட்டங்களை பொதுமக்களிடம் நேரடியாக கொண்டு சேர்க்கும் பணிகளை துரிதப்படுத்த மாவட்ட செயலாளர்களுக்கு திமுக தலைமை அறிவுறுத்தியுள்ளது.',
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
    summary: 'அதிமுக தலைமையகத்தில் கட்சியின் மூத்த நிர்வாகிகள் மற்றும் மாவட்ட செயலாளர்களுடன் தேர்தல் கூட்டணி மற்றும் பிரச்சார வியூகம் குறித்து தீவிர ஆலோசனை நடைபெற்றது.',
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

const PARTY_PULSE_ITEMS = [
  { party: 'திமுக', text: 'மாநிலம் முழுவதும் 234 தொகுதிகளிலும் கள ஆய்வுக் குழுக்கள் தீவிரப் பணி', color: 'border-red-500/50 bg-red-500/10 text-red-300' },
  { party: 'அதிமுக', text: 'கூட்டணிக் கட்சிகளுடன் முதல் கட்ட பேச்சுவார்த்தை விரைவில் தொடக்கம்', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
  { party: 'தவெக', text: 'விஜய்யின் தமிழக சுற்றுப்பயண திட்டம் மற்றும் மாவட்ட மாநாடுகள் தயார்', color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300' },
  { party: 'பாஜக', text: 'மத்திய அரசின் திட்டங்களை விளக்கி தமிழகம் தழுவிய பொதுக்கூட்டங்கள்', color: 'border-orange-500/50 bg-orange-500/10 text-orange-300' }
];

export const PoliticsSection = ({ articles = [], onOpenArticle, onSelectCategory }) => {
  const [selectedTag, setSelectedTag] = useState('அனைத்து அரசியல்');

  // Filter political articles from live props
  const livePolitics = (articles || []).filter((art) => {
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
      t.includes('சட்டமன்ற') ||
      t.includes('அமைச்சர்') ||
      t.includes('பாஜக') ||
      t.includes('தவெக')
    );
  });

  // CRITICAL FIX: Merge live articles with fallbacks so the right column is NEVER half-empty!
  // Deduplicate by title to ensure clean, distinct news
  const mergedList = [...livePolitics];
  const existingTitles = new Set(livePolitics.map((a) => (a.title || '').trim().toLowerCase()));

  for (const fallback of FALLBACK_POLITICS) {
    if (mergedList.length >= 5) break;
    const fbTitle = (fallback.title || '').trim().toLowerCase();
    if (!existingTitles.has(fbTitle)) {
      mergedList.push(fallback);
      existingTitles.add(fbTitle);
    }
  }

  // Filter by tag if selected
  let currentDisplay = mergedList;
  if (selectedTag !== 'அனைத்து அரசியல்') {
    const filtered = mergedList.filter((item) => {
      const text = `${item.title || ''} ${item.summary || ''} ${item.subCategory || ''} ${item.tag || ''}`.toLowerCase();
      return text.includes(selectedTag.toLowerCase());
    });
    // If filtered items are fewer than 3, keep them at top and pad with rest so design never breaks
    if (filtered.length > 0) {
      const remaining = mergedList.filter((item) => !filtered.includes(item));
      currentDisplay = [...filtered, ...remaining];
    }
  }

  const leadStory = currentDisplay[0] || FALLBACK_POLITICS[0];
  const sideStories = currentDisplay.slice(1, 5);

  const handleArticleClick = (art) => {
    if (onOpenArticle) {
      onOpenArticle(art);
    } else if (onSelectCategory) {
      onSelectCategory('politics');
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#070d1d] via-[#0f172a] to-[#071026] rounded-3xl p-4 sm:p-6 lg:p-7 border-2 border-red-500/30 shadow-2xl space-y-6 text-white font-tamil relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Flame className="w-3.5 h-3.5 animate-pulse" /> ELECTION 2026 SPECIAL
            </span>
            <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> தமிழ்நாடு அரசியல் களம்
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2">
            <Vote className="w-7 h-7 text-red-500 shrink-0" />
            <span>அரசியல் களம் & தேர்தல் 2026 சிறப்புப் பார்வை</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            தமிழகத்தின் அனல் பறக்கும் தேர்தல் களம், கூட்டணிக் கணக்குகள், கட்சி அறிக்கைகள் மற்றும் பிரத்யேக களப் பார்வைகள்
          </p>
        </div>

        {/* View All Button */}
        <button
          onClick={() => onSelectCategory && onSelectCategory('politics')}
          className="self-start md:self-auto bg-slate-900 hover:bg-red-600 text-white border border-red-500/40 hover:border-red-500 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer group shadow-lg shrink-0"
        >
          <span>அனைத்து அரசியல் செய்திகள்</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Quick Filter Tags */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {QUICK_TAGS.map((tag) => {
          const isActive = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
              <span>{tag}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Balanced News Grid (Hero Lead on Left + 4 Full Side Cards on Right) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Hero Lead Story (Span 7) */}
        <div className="lg:col-span-7 flex flex-col">
          <div
            onClick={() => handleArticleClick(leadStory)}
            className="group relative bg-[#050b18] rounded-2xl border border-red-500/30 hover:border-red-500/70 overflow-hidden shadow-xl cursor-pointer transition-all duration-300 flex-1 flex flex-col justify-between"
          >
            {/* Top Image Banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              <img
                src={leadStory.image || leadStory.cover_image_url || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80'}
                alt={leadStory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050b18] via-[#050b18]/50 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-lg uppercase shadow-md flex items-center gap-1">
                  <Flame className="w-3 h-3 text-white" /> முதன்மை அரசியல் செய்தி
                </span>
                {leadStory.subCategory && (
                  <span className="bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                    {leadStory.subCategory}
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors leading-snug">
                  {leadStory.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {leadStory.summary || leadStory.desc || leadStory.excerpt || leadStory.content}
                </p>
              </div>

              {/* Meta Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-300 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {leadStory.date || leadStory.time || 'சமீபத்தியது'}
                  </span>
                  {leadStory.author && (
                    <span className="hidden sm:inline text-slate-400">• {leadStory.author}</span>
                  )}
                </div>
                <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  முழுமையாகப் படிக்க <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Side Stories Cards (Span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {sideStories.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => handleArticleClick(item)}
              className="group bg-[#050b18] hover:bg-[#0c1428] rounded-2xl border border-slate-800 hover:border-red-500/50 p-3 sm:p-3.5 flex gap-3.5 transition-all cursor-pointer shadow-md flex-1 items-center"
            >
              {/* Thumbnail */}
              <div className="relative w-28 sm:w-32 h-20 sm:h-22 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-800">
                <img
                  src={item.image || item.cover_image_url || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 left-1 bg-red-600/90 text-[9px] font-black text-white px-1.5 py-0.2 rounded shadow">
                  {item.tag || item.subCategory || 'அரசியல்'}
                </span>
              </div>

              {/* Title & Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0 h-full py-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.date || item.time || 'இன்று'}
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

      {/* 4. Bottom Election Pulse & Party Ticker Bar */}
      <div className="relative z-10 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            2026 தேர்தல் களம் & கட்சிப் பார்வைகள்
          </span>
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
            நேரலை அரசியல் கள நிலவரம்
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {PARTY_PULSE_ITEMS.map((pulse, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedTag(pulse.party)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] flex items-start gap-2 ${pulse.color}`}
            >
              <span className="bg-black/50 font-black px-1.5 py-0.5 rounded text-[10px] shrink-0">
                {pulse.party}
              </span>
              <p className="line-clamp-2 text-[11px] leading-snug font-medium text-slate-200">
                {pulse.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PoliticsSection;
