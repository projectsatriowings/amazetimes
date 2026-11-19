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

export default function CinemaAndSports({ onOpenArticle, onSelectCategory, articles = [] }) {
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

  // Dedicated Category Fetches (guarantees Cinema & Sports ALWAYS have full 5+ articles on Home even if top-50 latest news has few)
  const [dedicatedCinema, setDedicatedCinema] = useState([]);
  const [dedicatedSports, setDedicatedSports] = useState([]);

  // Dynamic Box Office Buzz Settings (from cinema_buzz_settings)
  const [boxOfficeBuzz, setBoxOfficeBuzz] = useState([
    {
      id: 1,
      title: 'அவெஞ்சர்ஸ்: டூம்ஸ்டே (Avengers: Doomsday)',
      star: 'ராபர்ட் டவுனி ஜூனியர் • மார்வெல்',
      rating: '5.0',
      statusBadge: '₹10+ கோடி முன்பதிவு',
      collection: 'இந்தியாவில் வசூல் சாதனை வேகம்',
      notes: 'முன்பதிவு தொடங்கிய சில மணி நேரங்களிலேயே இந்தியாவில் ₹10 கோடியைத் தாண்டி டிக்கெட்டுகள் விற்றுத் தீர்ந்தன',
      poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      title: 'ராமாயணம் (Ramayana)',
      star: 'ரன்பீர் கபூர் • சாய் பல்லவி • யாஷ்',
      rating: '4.9',
      statusBadge: 'ரூ.1,110+ கோடி வசூல்',
      collection: 'நிதேஷ் திவாரி பிரம்மாண்ட இயக்கம்',
      notes: '9 நாட்களில் உலக அளவில் ரூ.1,110 கோடியைத் தாண்டி பாக்ஸ் ஆபீஸில் புதிய சாதனை படைத்த ரன்பீர் கபூர் படம்',
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      title: 'சத்தியவான் சாவித்திரி',
      star: 'கீர்த்தி சுரேஷ்',
      rating: '4.8',
      statusBadge: 'நவம்பர் 20 ரிலீஸ்',
      collection: 'யு/ஏ சான்றிதழ் பெற்றது',
      notes: 'கீர்த்தி சுரேஷின் மாறுபட்ட நடிப்பில் உருவாகியுள்ள திரைப்படம் யு/ஏ சான்றிதழுடன் திரையரங்குகளில் ரிலீஸ்',
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  // Dynamic Live Match / CSK Tracker Banner (from sports_buzz_settings)
  const [liveMatch, setLiveMatch] = useState({
    tournament: 'இந்தியா vs நியூசிலாந்து டெஸ்ட் தொடர் 2026',
    badge: 'CSK & CRICKET LIVE',
    status: 'LIVE',
    title: 'தோனி சிஎஸ்கே புதிய வழிகாட்டியாக நியமனம் • இந்தியா - நியூசிலாந்து முதல் டெஸ்ட் விறுவிறுப்பு!',
    venue: 'சேப்பாக்கம் & கான்பூர் சர்வதேச கிரிக்கெட் மைதானங்கள்',
    summary: 'எம்.எஸ். தோனி வீரராக ஓய்வு பெற்று சிஎஸ்கே வழிகாட்டியாக பொறுப்பேற்பு • ஆப்கானிஸ்தான் வீரர் நசீர் கான் அறிமுக டெஸ்டில் சதம் + 7 விக்கெட்டுகள் எடுத்து உலக சாதனை!',
    link: '/category/sports'
  });

  // Spotlight Filter Listener (Connected with top spotlight hashtags)
  useEffect(() => {
    const handleSpotlightFilter = (e) => {
      const { type, subTab } = e.detail || {};
      if (type === 'cinema' && subTab) {
        setCinemaSubTab(subTab);
      }
      if (type === 'sports' && subTab) {
        setSportsSubTab(subTab);
      }
    };
    window.addEventListener('amaze:spotlight_filter', handleSpotlightFilter);
    return () => window.removeEventListener('amaze:spotlight_filter', handleSpotlightFilter);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const formatApiArt = (a) => ({
      ...a,
      id: a.id,
      _id: a._id || String(a.id),
      title: a.title,
      category: a.category || a.category_name || a.category_id || 'செய்தி',
      mainImage: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
      image: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
      img: a.mainImage || a.cover_image_url || a.image || a.img || '/Amaze times.jpg',
      time: a.time || new Date(a.publishedAt || a.published_at || a.createdAt || a.created_at || Date.now()).toLocaleDateString('ta-IN', { hour: '2-digit', minute: '2-digit' }),
      publishedAt: a.publishedAt || a.published_at || a.createdAt || a.created_at || ''
    });

    const loadBuzzAndCategoryNews = async () => {
      try {
        const [cData, sData, cinemaRes, sportsRes] = await Promise.allSettled([
          api.getContent('cinema_buzz_settings'),
          api.getContent('sports_buzz_settings'),
          api.getArticles({ category: 'cinema', limit: 15, status: 'published' }),
          api.getArticles({ category: 'sports', limit: 15, status: 'published' })
        ]);

        if (!isMounted) return;

        if (cData.status === 'fulfilled' && cData.value && Array.isArray(cData.value.boxOfficeBuzz) && cData.value.boxOfficeBuzz.length > 0) {
          setBoxOfficeBuzz(cData.value.boxOfficeBuzz);
        }

        if (sData.status === 'fulfilled' && sData.value && sData.value.liveMatch) {
          setLiveMatch(prev => ({ ...prev, ...sData.value.liveMatch }));
        }

        if (cinemaRes.status === 'fulfilled' && cinemaRes.value) {
          const arr = cinemaRes.value.articles || cinemaRes.value.data || cinemaRes.value.news || [];
          if (Array.isArray(arr) && arr.length > 0) {
            setDedicatedCinema(arr.map(formatApiArt));
          }
        }

        if (sportsRes.status === 'fulfilled' && sportsRes.value) {
          const arr = sportsRes.value.articles || sportsRes.value.data || sportsRes.value.news || [];
          if (Array.isArray(arr) && arr.length > 0) {
            setDedicatedSports(arr.map(formatApiArt));
          }
        }
      } catch (_) {}
    };

    loadBuzzAndCategoryNews();
    return () => { isMounted = false; };
  }, []);

  // Merge all available article pools (dedicated category fetches + passed articles + full AppContext newsList) & deduplicate newest-first
  const mergeAndDedupe = (...pools) => {
    const map = new Map();
    pools.forEach(pool => {
      if (!Array.isArray(pool)) return;
      pool.forEach(art => {
        if (!art) return;
        const key = String(art.id || art._id || art.title);
        if (!map.has(key)) map.set(key, art);
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const tA = new Date(a.publishedAt || a.published_at || a.createdAt || a.created_at || 0).getTime() || 0;
      const tB = new Date(b.publishedAt || b.published_at || b.createdAt || b.created_at || 0).getTime() || 0;
      if (tB !== tA) return tB - tA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  };

  const combinedPool = mergeAndDedupe(articles, newsList);

  // Filter Cinema Articles
  const allCinemaArticles = mergeAndDedupe(
    dedicatedCinema,
    combinedPool.filter(art => {
      const cat = (art.category || art.category_id || '').toLowerCase();
      const tags = Array.isArray(art.tags) ? art.tags.join(' ').toLowerCase() : String(art.tags || '').toLowerCase();
      const title = (art.title || '').toLowerCase();
      return cat === 'cinema' || cat === 'சினிமா' || cat.includes('விமர்சனம்') || tags.includes('சினிமா') || title.includes('சினிமா') || title.includes('திரைப்படம்') || tags.includes('கூலி') || tags.includes('தளபதி');
    })
  );

  const filteredCinemaArticles = allCinemaArticles.filter(art => {
    if (cinemaSubTab === 'all') return true;
    const text = ((art.title || '') + ' ' + (art.content || '') + ' ' + (art.category || '')).toLowerCase();
    if (cinemaSubTab === 'reviews') return text.includes('விமர்சனம்') || text.includes('review');
    if (cinemaSubTab === 'trailers') return text.includes('டிரெய்லர்') || text.includes('டீசர்') || text.includes('பாடல்') || text.includes('trailer');
    if (cinemaSubTab === 'boxoffice') return text.includes('வசூல்') || text.includes('பாக்ஸ் ஆபீஸ்') || text.includes('கோடி');
    return true;
  });

  // Filter Sports Articles
  const allSportsArticles = mergeAndDedupe(
    dedicatedSports,
    combinedPool.filter(art => {
      const cat = (art.category || art.category_id || '').toLowerCase();
      const tags = Array.isArray(art.tags) ? art.tags.join(' ').toLowerCase() : String(art.tags || '').toLowerCase();
      const title = (art.title || '').toLowerCase();
      return (
        cat === 'sports' ||
        cat === 'விளையாட்டு' ||
        cat.includes('விளையாட்டு') ||
        cat.includes('sport') ||
        tags.includes('விளையாட்டு') ||
        tags.includes('கிரிக்கெட்') ||
        title.includes('கிரிக்கெட்') ||
        title.includes('ஐபிஎல்') ||
        title.includes('பேட்மிண்டன்') ||
        title.includes('ஒலிம்பிக்') ||
        title.includes('சாம்பியன்') ||
        title.includes('csk') ||
        tags.includes('csk')
      );
    })
  );

  const filteredSportsArticles = allSportsArticles.filter(art => {
    if (sportsSubTab === 'all') return true;
    const text = ((art.title || '') + ' ' + (art.content || '') + ' ' + (art.tags || '')).toLowerCase();
    if (sportsSubTab === 'csk') return text.includes('csk') || text.includes('சென்னை') || text.includes('தோனி') || text.includes('ஐபிஎல்');
    if (sportsSubTab === 'international') return text.includes('சர்வதேசம்') || text.includes('உலகக்கோப்பை') || text.includes('இந்தியா');
    if (sportsSubTab === 'achievers') return text.includes('சாதனை') || text.includes('பதக்கம்') || text.includes('சாம்பியன்');
    return true;
  });

  // Fallbacks matching latest 2026 releases & records
  const fallbackCinema = [
    {
      id: 375,
      title: 'இந்தியாவில் ₹10 கோடியைக் கடந்த அவெஞ்சர்ஸ் டூம்ஸ்டே முன்பதிவு – வெளியீட்டிற்கு முன்பே வசூலில் சாதனை வேகம்!',
      time: 'இன்று',
      mainImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
      category: 'சினிமா',
      views: 2450,
      likes: 620
    },
    {
      id: 371,
      title: 'கீர்த்தி சுரேஷின் சத்தியவான் சாவித்திரி படத்திற்கு யு/ஏ சான்றிதழ் – நவம்பர் 20ஆம் தேதி திரையரங்குகளில் வெளியீடு!',
      time: 'இன்று',
      mainImage: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
      category: 'சினிமா',
      views: 1890,
      likes: 410
    },
    {
      id: 372,
      title: 'சென்னையில் மின்னும் ஓர் இரவு திரைப்படத்தின் இசை மற்றும் முன்னோட்டம் வெளியீடு – நவம்பர் 27ஆம் தேதி வெளியீடு!',
      time: 'நேற்று',
      mainImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      category: 'சினிமா',
      views: 1540,
      likes: 380
    }
  ];

  const fallbackSports = [
    {
      id: 366,
      title: 'ஐபிஎல் போட்டிகளில் இருந்து வீரராக ஓய்வு பெற்றார் எம்.எஸ். தோனி – சிஎஸ்கே அணியின் புதிய வழிகாட்டியாக நியமனம்!',
      time: 'இன்று',
      mainImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
      category: 'விளையாட்டு',
      views: 3120,
      likes: 890
    },
    {
      id: 369,
      title: '20 வயதில் டெஸ்ட் கிரிக்கெட்டில் வரலாறு படைத்த ஆப்கானிஸ்தான் வீரர் நசீர் கான் – அறிமுகப் போட்டியில் சதம், 7 விக்கெட்டுகள்!',
      time: 'இன்று',
      mainImage: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=600&q=80',
      category: 'விளையாட்டு',
      views: 1980,
      likes: 470
    },
    {
      id: 367,
      title: 'நியூசிலாந்துக்கு எதிரான முதல் டெஸ்டில் நான்கு வேகப்பந்து வீச்சாளர்கள் – சுப்மன் கில்லுக்கு அணி தேர்வில் சவால்!',
      time: 'நேற்று',
      mainImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
      category: 'விளையாட்டு',
      views: 1420,
      likes: 310
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
      {/* DUAL COLUMN POWER GRID */}
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

              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cinema')}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>அனைத்து சினிமா</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
                        <Eye className="w-3 h-3" /> {getArticleViews ? getArticleViews(cinemaLead.id) : (cinemaLead.views_count ?? cinemaLead.viewsCount ?? cinemaLead.views ?? 0)}
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
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('cinema')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>அனைத்து சினிமா & திரைவிமர்சனச் செய்திகள்</span>
              <ChevronRight className="w-4 h-4" />
            </button>
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

              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('sports')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>அனைத்து விளையாட்டு</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
                    src={sportsLead.mainImage || sportsLead.image || sportsLead.img || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80'}
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
                        <Eye className="w-3 h-3" /> {getArticleViews ? getArticleViews(sportsLead.id) : (sportsLead.views_count ?? sportsLead.viewsCount ?? sportsLead.views ?? 0)}
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
                    src={art.mainImage || art.image || art.img || 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=200&q=80'}
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
                        <Heart className="w-3 h-3 fill-emerald-500" /> {getArticleLikes ? getArticleLikes(art.id) : (art.likesCount ?? art.likes_count ?? art.likes ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Action Link */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('sports')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>அனைத்து விளையாட்டு & ஐபிஎல் செய்திகள்</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}
