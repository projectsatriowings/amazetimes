import React, { useState, useMemo } from 'react';
import { MapPin, Clock, ArrowRight, Eye, Newspaper, Search, ChevronDown, Sparkles } from 'lucide-react';
import { getResponsiveImageProps } from '../utils/imageHelper';

export const TN_DISTRICTS = [
  { id: 'all', name: 'அனைத்து மாவட்டங்கள்' },
  { id: 'chennai', name: 'சென்னை', keywords: ['சென்னை', 'சென்னையில்', 'chennai', 'கோயம்பேடு', 'கிண்டி', 'தாம்பரம்', 'மெரினா'] },
  { id: 'coimbatore', name: 'கோயம்புத்தூர்', keywords: ['கோயம்புத்தூர்', 'கோவை', 'கோவையில்', 'coimbatore', 'பொள்ளாச்சி', 'மேட்டுப்பாளையம்'] },
  { id: 'madurai', name: 'மதுரை', keywords: ['மதுரை', 'மதுரையில்', 'madurai', 'மீனாட்சி அம்மன்', 'உசிலம்பட்டி', 'திருமங்கலம்'] },
  { id: 'trichy', name: 'திருச்சிராப்பள்ளி', keywords: ['திருச்சிராப்பள்ளி', 'திருச்சி', 'திருச்சியில்', 'trichy', 'ஸ்ரீரங்கம்', 'மணப்பாறை'] },
  { id: 'salem', name: 'சேலம்', keywords: ['சேலம்', 'சேலத்தில்', 'salem', 'மேட்டூர்', 'ஆத்தூர்', 'ஏற்காடு'] },
  { id: 'tirunelveli', name: 'திருநெல்வேலி', keywords: ['திருநெல்வேலி', 'நெல்லை', 'நெல்லையில்', 'tirunelveli', 'தாமிரபரணி', 'பாளையங்கோட்டை'] },
  { id: 'tiruppur', name: 'திருப்பூர்', keywords: ['திருப்பூர்', 'திருப்பூரில்', 'tiruppur', 'அவிநாசி', 'பல்லடம்', 'தாராபுரம்'] },
  { id: 'erode', name: 'ஈரோடு', keywords: ['ஈரோடு', 'ஈரோட்டில்', 'erode', 'பவானி', 'கோபிசெட்டிபாளையம்', 'பெருந்துறை'] },
  { id: 'vellore', name: 'வேலூர்', keywords: ['வேலூர்', 'வேலூரில்', 'vellore', 'காட்பாடி'] },
  { id: 'thanjavur', name: 'தஞ்சாவூர்', keywords: ['தஞ்சாவூர்', 'தஞ்சை', 'தஞ்சையில்', 'thanjavur', 'கும்பகோணம்', 'பட்டுக்கோட்டை'] },
  { id: 'dindigul', name: 'திண்டுக்கல்', keywords: ['திண்டுக்கல்', 'திண்டுக்கல்லில்', 'dindigul', 'பழனி', 'கொடைக்கானல்'] },
  { id: 'thoothukudi', name: 'தூத்துக்குடி', keywords: ['தூத்துக்குடி', 'தூத்துக்குடியில்', 'thoothukudi', 'tuticorin', 'கோவில்பட்டி', 'திருச்செந்தூர்'] },
  { id: 'kanyakumari', name: 'கன்னியாகுமரி', keywords: ['கன்னியாகுமரி', 'நாகர்கோவில்', 'kanyakumari', 'நாகர்கோவிலில்', 'குளச்சல்'] },
  { id: 'virudhunagar', name: 'விருதுநகர்', keywords: ['விருதுநகர்', 'விருதுநகரில்', 'virudhunagar', 'ஸ்ரீவில்லிபுத்தூர்', 'சிவகாசி', 'அருப்புக்கோட்டை', 'ராஜபாளையம்'] },
  { id: 'cuddalore', name: 'கடலூர்', keywords: ['கடலூர்', 'கடலூரில்', 'cuddalore', 'சிதம்பரம்', 'விருத்தாசலம்', 'நெய்வேலி'] },
  { id: 'tiruvallur', name: 'திருவள்ளூர்', keywords: ['திருவள்ளூர்', 'திருவள்ளூரில்', 'tiruvallur', 'பொன்னேரி', 'ஆவடி'] },
  { id: 'kanchipuram', name: 'காஞ்சிபுரம்', keywords: ['காஞ்சிபுரம்', 'காஞ்சியில்', 'kancheepuram', 'காஞ்சி'] },
  { id: 'chengalpattu', name: 'செங்கல்பட்டு', keywords: ['செங்கல்பட்டு', 'செங்கல்பட்டில்', 'chengalpattu', 'மாமல்லபுரம்', 'மறைமலைநகர்'] },
  { id: 'villupuram', name: 'விழுப்புரம்', keywords: ['விழுப்புரம்', 'விழுப்புரத்தில்', 'viluppuram', 'திண்டிவனம்'] },
  { id: 'kallakurichi', name: 'கள்ளக்குறிச்சி', keywords: ['கள்ளக்குறிச்சி', 'கள்ளக்குறிச்சியில்', 'kallakurichi', 'உளுந்தூர்பேட்டை'] },
  { id: 'dharmapuri', name: 'தருமபுரி', keywords: ['தருமபுரி', 'தர்மபுரி', 'dharmapuri', 'ஒகேனக்கல்', 'ஹரூர்'] },
  { id: 'krishnagiri', name: 'கிருஷ்ணகிரி', keywords: ['கிருஷ்ணகிரி', 'krishnagiri', 'ஓசூர்', 'ஓசூரில்', 'பர்கூர்'] },
  { id: 'namakkal', name: 'நாமக்கல்', keywords: ['நாமக்கல்', 'நாமக்கல்லில்', 'namakkal', 'திருச்செங்கோடு', 'ராசிபுரம்'] },
  { id: 'karur', name: 'கரூர்', keywords: ['கரூர்', 'கரூரில்', 'karur', 'குளித்தலை'] },
  { id: 'pudukkottai', name: 'புதுக்கோட்டை', keywords: ['புதுக்கோட்டை', 'புதுக்கோட்டையில்', 'pudukkottai', 'விராலிமலை', 'அறந்தாங்கி'] },
  { id: 'sivaganga', name: 'சிவகங்கை', keywords: ['சிவகங்கை', 'சிவகங்கையில்', 'sivaganga', 'காரைக்குடி', 'தேவகோட்டை'] },
  { id: 'ramanathapuram', name: 'ராமநாதபுரம்', keywords: ['ராமநாதபுரம்', 'ராமநாதபுரத்தில்', 'ramanathapuram', 'ராமேஸ்வரம்', 'பரமக்குடி'] },
  { id: 'theni', name: 'தேனி', keywords: ['தேனி', 'தேனியில்', 'theni', 'போடிநாயக்கனூர்', 'பெரியகுளம்', 'கம்பம்'] },
  { id: 'nilgiris', name: 'நீலகிரி', keywords: ['நீலகிரி', 'நீலகிரியில்', 'nilgiris', 'ஊட்டி', 'உதகை', 'குன்னூர்', 'கோத்தகிரி'] },
  { id: 'ariyalur', name: 'அரியலூர்', keywords: ['அரியலூர்', 'அரியலூரில்', 'ariyalur', 'ஜெயங்கொண்டம்'] },
  { id: 'perambalur', name: 'பெரம்பலூர்', keywords: ['பெரம்பலூர்', 'பெரம்பலூரில்', 'perambalur'] },
  { id: 'nagapattinam', name: 'நாகப்பட்டினம்', keywords: ['நாகப்பட்டினம்', 'நாகை', 'nagapattinam', 'வேளாங்கண்ணி'] },
  { id: 'tiruvarur', name: 'திருவாரூர்', keywords: ['திருவாரூர்', 'திருவாரூரில்', 'tiruvarur', 'மன்னார்குடி'] },
  { id: 'mayiladuthurai', name: 'மயிலாடுதுறை', keywords: ['மயிலாடுதுறை', 'மயிலாடுதுறையில்', 'mayiladuthurai', 'சீர்காழி'] },
  { id: 'tirupathur', name: 'திருப்பத்தூர்', keywords: ['திருப்பத்தூரில்', 'tirupathur', 'ஆம்பூர்', 'வாணியம்பாடி'] },
  { id: 'tenkasi', name: 'தென்காசி', keywords: ['தென்காசி', 'தென்காசியில்', 'tenkasi', 'குற்றாலம்', 'சங்கரன்கோவில்'] },
  { id: 'ranipet', name: 'ராணிப்பேட்டை', keywords: ['ராணிப்பேட்டை', 'ராணிப்பேட்டையில்', 'ranipet', 'ஆற்காடு', 'அரக்கோணம்'] }
];

// Quick featured district pills for the primary scroll bar
const FEATURED_DISTRICT_KEYS = [
  'all',
  'chennai',
  'coimbatore',
  'madurai',
  'trichy',
  'salem',
  'tirunelveli',
  'erode',
  'tiruppur',
  'thanjavur',
  'dindigul',
  'thoothukudi',
  'kanyakumari',
  'virudhunagar'
];

export default function DistrictNewsHub({ articles = [], onOpenArticle, onOpenEPaper }) {
  const [activeDistrictKey, setActiveDistrictKey] = useState('all');
  const [searchDistrict, setSearchDistrict] = useState('');

  // Normalize articles to attach recognized district
  const normalizedArticles = useMemo(() => {
    return (articles || []).map((a, idx) => {
      let matchedDistName = a.district && a.district !== 'all' ? a.district : null;
      let matchedDistKey = null;

      // Match against 38 districts
      if (matchedDistName) {
        const found = TN_DISTRICTS.find(d => 
          d.name === matchedDistName || 
          d.id === String(matchedDistName).toLowerCase() ||
          (d.keywords && d.keywords.includes(matchedDistName))
        );
        if (found) {
          matchedDistName = found.name;
          matchedDistKey = found.id;
        }
      }

      // If untagged, detect from title & summary
      if (!matchedDistName) {
        const text = `${a.title || ''} ${a.summary || ''} ${a.desc || ''}`.toLowerCase();
        for (const dist of TN_DISTRICTS.slice(1)) {
          if (dist.keywords && dist.keywords.some(kw => text.includes(kw.toLowerCase()))) {
            matchedDistName = dist.name;
            matchedDistKey = dist.id;
            break;
          }
        }
      }

      return {
        id: a.id || a._id || `art-${idx}`,
        title: a.title,
        summary: a.summary || a.desc || '',
        districtName: matchedDistName || 'தமிழ்நாடு',
        districtKey: matchedDistKey || 'tamilnadu',
        isDistrictSpecific: Boolean(matchedDistName),
        time: a.time || new Date(a.published_at || a.created_at || Date.now()).toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit' }),
        img: a.image || a.main_image || a.mainImage || a.img || '/Amaze times.jpg',
        views: a.views || a.viewsCount || a.views_count || 0,
        raw: a
      };
    });
  }, [articles]);

  // Filter articles based on active district selection
  const { directMatches, relatedMatches } = useMemo(() => {
    if (activeDistrictKey === 'all') {
      return {
        directMatches: normalizedArticles,
        relatedMatches: []
      };
    }

    const selectedDistObj = TN_DISTRICTS.find(d => d.id === activeDistrictKey);
    const targetName = selectedDistObj?.name;
    const targetKeywords = selectedDistObj?.keywords || [];

    const direct = [];
    const others = [];

    normalizedArticles.forEach(item => {
      const isKeyMatch = item.districtKey === activeDistrictKey;
      const isNameMatch = targetName && item.districtName === targetName;
      const textMatch = targetKeywords.some(kw => 
        (item.title && item.title.includes(kw)) || 
        (item.summary && item.summary.includes(kw))
      );

      if (isKeyMatch || isNameMatch || textMatch) {
        direct.push(item);
      } else {
        others.push(item);
      }
    });

    return {
      directMatches: direct,
      relatedMatches: others
    };
  }, [normalizedArticles, activeDistrictKey]);

  // Final cards to display: direct matches first. If fewer than 4, append related TN news so grid is always complete
  const displayList = useMemo(() => {
    if (activeDistrictKey === 'all') {
      return directMatches;
    }
    if (directMatches.length >= 4) {
      return directMatches;
    }
    // Blend with related state news to guarantee minimum 4 cards with clear badges
    const needed = Math.max(0, 4 - directMatches.length);
    return [...directMatches, ...relatedMatches.slice(0, needed)];
  }, [directMatches, relatedMatches, activeDistrictKey]);

  const activeDistrictObj = TN_DISTRICTS.find(d => d.id === activeDistrictKey) || TN_DISTRICTS[0];

  return (
    <section className="space-y-6 font-tamil" id="districts">
      {/* 1. Header Bar: Title, Active Status & Total Count */}
      <div className="bg-gradient-to-r from-[#07153b] via-[#0c2464] to-[#123080] p-5 sm:p-6 rounded-3xl text-white shadow-lg border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              தமிழ்நாடு 38 மாவட்டங்கள் விரிவான களச் செய்திகள்
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-amber-400 shrink-0" />
            <span>மாவட்டச் செய்திகள் (District News Hub)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            சென்னை, கோவை, மதுரை, திருச்சி உள்ளிட்ட அனைத்து மாவட்டங்களின் உடனுக்குடனான நிகழ்வுகள்
          </p>
        </div>

        {/* 38 Districts Quick Dropdown Selector */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <select
              value={activeDistrictKey}
              onChange={(e) => setActiveDistrictKey(e.target.value)}
              className="w-full appearance-none bg-slate-900/90 text-amber-300 font-bold text-xs sm:text-sm py-2.5 pl-4 pr-9 rounded-2xl border border-amber-400/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {TN_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.id === 'all' ? `(${normalizedArticles.length})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {onOpenEPaper && (
            <button
              onClick={onOpenEPaper}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow transition cursor-pointer shrink-0"
            >
              <Newspaper className="w-4 h-4" />
              <span>மாவட்ட இ-பேப்பர்</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Fast Filter Horizontal Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {FEATURED_DISTRICT_KEYS.map((key) => {
          const dist = TN_DISTRICTS.find(d => d.id === key);
          if (!dist) return null;
          const isActive = activeDistrictKey === key;
          return (
            <button
              key={key}
              onClick={() => setActiveDistrictKey(key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#0a1945] dark:bg-amber-500 text-amber-400 dark:text-slate-950 shadow-md font-black scale-102 border-b-2 border-amber-400 dark:border-slate-950'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-500'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 dark:text-slate-950' : 'text-slate-400'}`} />
              <span>{dist.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section Title with Count Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            {activeDistrictKey === 'all' ? 'அனைத்து மாவட்டங்களின் முதன்மைச் செய்திகள்' : `${activeDistrictObj.name} மாவட்டச் செய்திகள்`}
          </span>
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
            {displayList.length} செய்திகள்
          </span>
        </div>

        {activeDistrictKey !== 'all' && directMatches.length === 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg">
            இம்மாவட்டத்திற்குரிய கூடுதல் செய்திகளுடன் மாநிலச் செய்திகளும் சேர்க்கப்பட்டுள்ளன
          </span>
        )}
      </div>

      {/* 4. Responsive Broadsheet News Grid (Zero Crop + Balanced Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {displayList.map((item, idx) => {
          const imgProps = getResponsiveImageProps(item.img, 450, 260);
          const isRelatedFallback = activeDistrictKey !== 'all' && !directMatches.some(d => String(d.id) === String(item.id));

          return (
            <article
              key={item.id || idx}
              onClick={() => onOpenArticle && onOpenArticle(item.raw || item)}
              className="bg-white dark:bg-[#0f1b3d] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              {/* Media Photo Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={imgProps.src}
                  srcSet={imgProps.srcSet}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  alt={item.title}
                  width="450"
                  height="260"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.removeAttribute('srcset');
                    e.target.src = '/Amaze times.jpg';
                  }}
                />

                {/* District Pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-md border flex items-center gap-1 ${
                    isRelatedFallback
                      ? 'bg-slate-900/90 text-amber-300 border-amber-400/30'
                      : 'bg-[#0a1945]/95 text-amber-400 border-amber-400/40 backdrop-blur-xs'
                  }`}>
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{item.districtName}</span>
                  </span>

                  {isRelatedFallback && (
                    <span className="bg-emerald-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                      மாநிலச் செய்தி
                    </span>
                  )}
                </div>

                {item.views > 0 && (
                  <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>{item.views.toLocaleString()}</span>
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{item.time}</span>
                    </span>
                    <span className="text-slate-500">அமேஸ் டைம்ஸ்</span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-[#0e2a7a] dark:group-hover:text-amber-400 leading-snug line-clamp-3">
                    {item.title}
                  </h3>

                  {item.summary && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#0e2a7a] dark:text-amber-400">
                  <span>முழு செய்தி வாசிக்க</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
