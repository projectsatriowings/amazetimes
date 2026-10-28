import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Trophy, 
  Star, 
  Play, 
  ExternalLink, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ChevronRight,
  Award,
  Video,
  Heart,
  Eye,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import CinemaSportsSpotlightBar from './CinemaSportsSpotlightBar';

export default function CinemaAndSports({ onOpenArticle }) {
  const { 
    newsList = [], 
    openArticleModal, 
    getArticleViews, 
    getArticleLikes, 
    toggleLike, 
    isLiked 
  } = useApp();

  // Subcategory filters
  const [cinemaSubTab, setCinemaSubTab] = useState('all'); // 'all' | 'reviews' | 'trailers' | 'boxoffice'
  const [sportsSubTab, setSportsSubTab] = useState('all'); // 'all' | 'csk' | 'international' | 'achievers'

  // Dynamic Box Office Buzz Settings (from cinema_buzz_settings)
  const [boxOfficeBuzz, setBoxOfficeBuzz] = useState([
    {
      id: 1,
      title: 'தளபதி 69 (Thalapathy 69)',
      star: 'விஜய்',
      rating: '5.0',
      statusBadge: 'ரூ.1,000+ கோடி எதிர்பார்ப்பு',
      collection: 'படப்பிடிப்பில் • மெகா எதிர்பார்ப்பு',
      notes: 'அரசியல் களத்திற்கு செல்லும் முன் தளபதியின் கடைசி பிரம்மாண்ட படைப்பு',
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      title: 'கூலி (Coolie)',
      star: 'ரஜினிகாந்த்',
      rating: '4.9',
      statusBadge: 'மெகா பிளாக்பஸ்டர்',
      collection: 'ரூ.450+ கோடி வசூல் சாதனை',
      notes: 'லோகேஷ் கனகராஜ் இயக்கத்தில் சூப்பர்ஸ்டாரின் அதிரடி ஆக்ஷன் வேட்டை',
      poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      title: 'விடாமுயற்சி (Vidaamuyarchi)',
      star: 'அஜித் குமார்',
      rating: '4.8',
      statusBadge: 'சூப்பர் ஹிட் டிரெண்டிங்',
      collection: 'ரூ.300+ கோடி எதிர்பார்ப்பு',
      notes: 'மகிழ் திருமேனி இயக்கத்தில் அனிருத் இசையில் சர்வதேச கார் சேஸிங் காட்சிகள்',
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  // Dynamic Live Match / CSK Tracker Banner (from sports_buzz_settings)
  const [liveMatch, setLiveMatch] = useState({
    tournament: 'TATA IPL 2026 - லீக் ஆட்டம் 18',
    badge: 'CSK UPDATE',
    status: 'LIVE',
    title: 'சென்னை சூப்பர் கிங்ஸ் அதிரடி வெற்றி: தோனியின் கடைசி ஓவர் ஃபினிஷிங்!',
    venue: 'சேப்பாக்கம் எம்.ஏ. சிதம்பரம் மைதானம், சென்னை',
    summary: 'சிஎஸ்கே 204/3 (20.0) vs மும்பை இந்தியன்ஸ் 188/7 (20.0) • 16 ரன்கள் வித்தியாசத்தில் சிஎஸ்கே திரில் வெற்றி!',
    link: '/category/sports'
  });

  useEffect(() => {
    let isMounted = true;
    const loadBuzzSettings = async () => {
      try {
        const [cData, sData] = await Promise.allSettled([
          api.getContent('cinema_buzz_settings'),
          api.getContent('sports_buzz_settings')
        ]);

        if (!isMounted) return;

        if (cData.status === 'fulfilled' && cData.value && Array.isArray(cData.value.boxOfficeBuzz) && cData.value.boxOfficeBuzz.length > 0) {
          setBoxOfficeBuzz(cData.value.boxOfficeBuzz);
        }

        if (sData.status === 'fulfilled' && sData.value && sData.value.liveMatch) {
          setLiveMatch(prev => ({ ...prev, ...sData.value.liveMatch }));
        }
      } catch (_) {}
    };

    loadBuzzSettings();
    return () => { isMounted = false; };
  }, []);

  // Filter Cinema Articles from newsList
  const allCinemaArticles = newsList.filter(art => {
    const cat = (art.category || '').toLowerCase();
    const tags = Array.isArray(art.tags) ? art.tags.join(' ').toLowerCase() : String(art.tags || '').toLowerCase();
    const title = (art.title || '').toLowerCase();
    return cat === 'cinema' || cat === 'சினிமா' || cat.includes('விமர்சனம்') || tags.includes('சினிமா') || title.includes('சினிமா') || title.includes('திரைப்படம்');
  });

  const filteredCinemaArticles = allCinemaArticles.filter(art => {
    if (cinemaSubTab === 'all') return true;
    const text = ((art.title || '') + ' ' + (art.content || '') + ' ' + (art.category || '')).toLowerCase();
    if (cinemaSubTab === 'reviews') return text.includes('விமர்சனம்') || text.includes('review');
    if (cinemaSubTab === 'trailers') return text.includes('டிரெய்லர்') || text.includes('டீசர்') || text.includes('பாடல்') || text.includes('trailer');
    if (cinemaSubTab === 'boxoffice') return text.includes('வசூல்') || text.includes('பாக்ஸ் ஆபீஸ்') || text.includes('கோடி');
    return true;
  });

  // Filter Sports Articles from newsList
  const allSportsArticles = newsList.filter(art => {
    const cat = (art.category || '').toLowerCase();
    const tags = Array.isArray(art.tags) ? art.tags.join(' ').toLowerCase() : String(art.tags || '').toLowerCase();
    const title = (art.title || '').toLowerCase();
    return cat === 'sports' || cat === 'விளையாட்டு' || tags.includes('விளையாட்டு') || tags.includes('கிரிக்கெட்') || title.includes('கிரிக்கெட்') || title.includes('ஐபிஎல்') || title.includes('csk');
  });

  const filteredSportsArticles = allSportsArticles.filter(art => {
    if (sportsSubTab === 'all') return true;
    const text = ((art.title || '') + ' ' + (art.content || '') + ' ' + (art.tags || '')).toLowerCase();
    if (sportsSubTab === 'csk') return text.includes('csk') || text.includes('சென்னை') || text.includes('தோனி') || text.includes('ஐபிஎல்');
    if (sportsSubTab === 'international') return text.includes('சர்வதேசம்') || text.includes('உலகக்கோப்பை') || text.includes('இந்தியா');
    if (sportsSubTab === 'achievers') return text.includes('சாதனை') || text.includes('பதக்கம்') || text.includes('சாம்பியன்');
    return true;
  });

  // Fallbacks if database has few category news
  const fallbackCinema = [
    {
      id: 'fb-c-1',
      title: 'தளபதி 69 படப்பிடிப்பு சென்னையில் தீவிரம்: விஜய் - எச். வினோத் இணையும் கடைசி பிரம்மாண்டம்!',
      time: '15 நிமிடங்களுக்கு முன்',
      mainImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      category: 'சினிமா',
      views: 1840,
      likes: 340
    },
    {
      id: 'fb-c-2',
      title: 'கூலி திரைப்படத்தின் புதிய போஸ்டர் வெளியீடு: ரஜினியின் அசத்தல் லுக்குக்கு குவியும் லைக்குகள்!',
      time: '1 மணி நேரத்திற்கு முன்',
      mainImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
      category: 'சினிமா',
      views: 2420,
      likes: 512
    },
    {
      id: 'fb-c-3',
      title: 'விடாமுயற்சி டீசர் வெளியீட்டு தேதி உறுதியானது: அஜித் ரசிகர்கள் கொண்டாட்டம்!',
      time: '2 மணி நேரத்திற்கு முன்',
      mainImage: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
      category: 'சினிமா',
      views: 1690,
      likes: 290
    }
  ];

  const fallbackSports = [
    {
      id: 'fb-s-1',
      title: 'ஐபிஎல் 2026: சேப்பாக்கத்தில் சென்னை சூப்பர் கிங்ஸ் அணிக்கு தொடர் வெற்றி!',
      time: '20 நிமிடங்களுக்கு முன்',
      mainImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
      category: 'விளையாட்டு',
      views: 2890,
      likes: 670
    },
    {
      id: 'fb-s-2',
      title: 'தோனியின் கடைசி ஓவர் சிக்ஸர் சாதனை: இளம் வீரர்களுக்கு உத்வேகம் தரும் கேப்டன் கூல்!',
      time: '1 மணி நேரத்திற்கு முன்',
      mainImage: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=600&q=80',
      category: 'விளையாட்டு',
      views: 3120,
      likes: 890
    },
    {
      id: 'fb-s-3',
      title: 'டி20 உலகக்கோப்பை 2026: இந்திய அணியில் தமிழகத்தைச் சேர்ந்த 3 வீரர்களுக்கு வாய்ப்பு?',
      time: '3 மணி நேரத்திற்கு முன்',
      mainImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
      category: 'விளையாட்டு',
      views: 1980,
      likes: 410
    }
  ];

  const cinemaDisplayList = filteredCinemaArticles.length > 0 ? filteredCinemaArticles : fallbackCinema;
  const sportsDisplayList = filteredSportsArticles.length > 0 ? filteredSportsArticles : fallbackSports;

  const cinemaLead = cinemaDisplayList[0];
  const cinemaSecondary = cinemaDisplayList.slice(1, 5);

  const sportsLead = sportsDisplayList[0];
  const sportsSecondary = sportsDisplayList.slice(1, 5);

  const handleArticleClick = (art) => {
    if (onOpenArticle) onOpenArticle(art);
    else if (openArticleModal) openArticleModal(art);
  };

  return (
    <section id="cinema-and-sports" className="space-y-6 scroll-mt-20">
      
      {/* 1. TOP DUAL SPOTLIGHT RIBBON */}
      <CinemaSportsSpotlightBar
        onOpenSearch={(query) => {
          const el = document.getElementById('cinema-and-sports');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => {
          if (cat === 'cinema') window.location.href = '/category/cinema';
          if (cat === 'sports') window.location.href = '/category/sports';
        }}
      />

      {/* 2. DUAL COLUMN POWER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: CINEMA (திரை அரங்கு) */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between font-tamil">
          
          <div className="space-y-4">
            {/* Column Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-red-600 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shadow-md">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      திரை அரங்கு (Cinema Buzz)
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-500/30">
                      K-TOWN 🔥
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    கோலிவுட் மற்றும் முன்னணி நட்சத்திரங்களின் பிரத்யேக செய்திகள்
                  </p>
                </div>
              </div>

              <a
                href="/category/cinema"
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>அனைத்து சினிமா</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Subcategory Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'அனைத்தும்' },
                { id: 'reviews', label: 'திரைவிமர்சனம்' },
                { id: 'trailers', label: 'டீசர் & டிரெய்லர்' },
                { id: 'boxoffice', label: 'பாக்ஸ் ஆபீஸ்' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCinemaSubTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    cinemaSubTab === tab.id
                      ? 'bg-red-600 text-white font-black shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* DYNAMIC BOX OFFICE BUZZ TRACKER CARD */}
            <div className="bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent p-4 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    பாக்ஸ் ஆபீஸ் பஸ் & எதிர்பார்ப்பு (Box Office Buzz)
                  </span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  TOP 3 TRACKER
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {boxOfficeBuzz.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-white/80 dark:bg-[#091226]/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating || '5.0'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white">
                        {item.statusBadge || 'HOT'}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.title}</h4>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{item.collection || item.star}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAD CINEMA STORY */}
            {cinemaLead && (
              <div
                onClick={() => handleArticleClick(cinemaLead)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 transition-all hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  <img
                    src={cinemaLead.mainImage || cinemaLead.img || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
                    alt={cinemaLead.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow">
                    சினிமா ஸ்பெஷல்
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                    <h3 className="text-sm sm:text-base font-black leading-tight group-hover:text-amber-300 transition line-clamp-2">
                      {cinemaLead.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-300">
                      <span>{cinemaLead.time || 'சமீபத்தியது'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {getArticleViews ? getArticleViews(cinemaLead.id) : (cinemaLead.views || 1420)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECONDARY CINEMA STORIES LIST */}
            <div className="space-y-3 pt-2">
              {cinemaSecondary.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleArticleClick(art)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <img
                    src={art.mainImage || art.img || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=200&q=80'}
                    alt={art.title}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-amber-400 transition leading-snug">
                      {art.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{art.time || 'சமீபத்தில்'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-rose-500 font-bold">
                        <Heart className="w-3 h-3 fill-rose-500" /> {getArticleLikes ? getArticleLikes(art.id) : 240}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Action Link */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <a
              href="/category/cinema"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>அனைத்து சினிமா & திரைவிமர்சனச் செய்திகள்</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: SPORTS (விளையாட்டு அரங்கம்) */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between font-tamil">
          
          <div className="space-y-4">
            {/* Column Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-emerald-500 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      விளையாட்டு அரங்கம் (Sports Hub)
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      LIVE 🏏
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ஐபிஎல், சிஎஸ்கே மேட்ச் ஸ்கோர்போர்டு & சர்வதேச விளையாட்டு செய்திகள்
                  </p>
                </div>
              </div>

              <a
                href="/category/sports"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>அனைத்து விளையாட்டு</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Subcategory Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'அனைத்தும்' },
                { id: 'csk', label: 'கிரிக்கெட் & CSK' },
                { id: 'international', label: 'சர்வதேசம்' },
                { id: 'achievers', label: 'சாதனையாளர்கள்' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSportsSubTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    sportsSubTab === tab.id
                      ? 'bg-emerald-600 text-white font-black shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* LIVE MATCH / CSK TRACKER BANNER */}
            <div className="bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent p-4 rounded-2xl border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {liveMatch.badge || 'CSK MATCH TRACKER'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {liveMatch.tournament}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {liveMatch.title}
                </h4>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-snug">
                  {liveMatch.summary}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  📍 {liveMatch.venue}
                </p>
              </div>
            </div>

            {/* LEAD SPORTS STORY */}
            {sportsLead && (
              <div
                onClick={() => handleArticleClick(sportsLead)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 transition-all hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  <img
                    src={sportsLead.mainImage || sportsLead.img || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80'}
                    alt={sportsLead.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow">
                    ஸ்போர்ட்ஸ் ஸ்பெஷல்
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                    <h3 className="text-sm sm:text-base font-black leading-tight group-hover:text-amber-300 transition line-clamp-2">
                      {sportsLead.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-300">
                      <span>{sportsLead.time || 'சமீபத்தியது'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {getArticleViews ? getArticleViews(sportsLead.id) : (sportsLead.views || 2890)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECONDARY SPORTS STORIES LIST */}
            <div className="space-y-3 pt-2">
              {sportsSecondary.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleArticleClick(art)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <img
                    src={art.mainImage || art.img || 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=200&q=80'}
                    alt={art.title}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-teal-400 transition leading-snug">
                      {art.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{art.time || 'சமீபத்தில்'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-500 font-bold">
                        <Heart className="w-3 h-3 fill-emerald-500" /> {getArticleLikes ? getArticleLikes(art.id) : 310}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Action Link */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <a
              href="/category/sports"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>அனைத்து விளையாட்டு & ஐபிஎல் செய்திகள்</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>

    </section>
  );
}
