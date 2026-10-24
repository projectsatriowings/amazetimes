import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Trophy, 
  Star, 
  Play, 
  X, 
  ExternalLink, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ChevronRight,
  Award,
  Video
} from 'lucide-react';
import { api } from '../services/api';

export default function CinemaAndSports({ onOpenArticle }) {
  const [activeTab, setActiveTab] = useState('cinema'); // 'cinema' | 'sports'
  const [activeTeaser, setActiveTeaser] = useState(null); // Video modal URL / ID

  // Cinema Feature & Box Office Data (Fetched from DB /api/content/cinema_sports_data)
  const [cinemaData, setCinemaData] = useState({
    leadMovie: {
      id: 1,
      title: 'தளபதி 69 (Thalapathy 69) - அதிகாரப்பூர்வ அறிவிப்பு!',
      tagline: 'அரசியல் களத்திற்கு முன் தளபதியின் பிரம்மாண்ட கடைசி திரைப்படம்',
      director: 'எச். வினோத்',
      music: 'அனிருத் ரவிச்சந்தர்',
      production: 'கே.வி.என் புரொடக்ஷன்ஸ்',
      rating: '4.9/5',
      status: 'படப்பிடிப்பில்',
      releaseDate: 'அக்டோபர் 2026',
      bannerImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      teaserVideoId: 'dQw4w9WgXcQ',
      story: 'தளபதி விஜய்யின் 69வது மற்றும் கடைசி திரைப்படமான தளபதி 69-ன் படப்பிடிப்பு சென்னையில் பிரம்மாண்ட செட் அமைக்கப்பட்டு முழுவீச்சில் நடைபெற்று வருகிறது. அரசியல் களத்திற்கு செல்லும் முன் ரசிகர்களுக்கு மிகப்பெரிய விருந்தாக அமையும் என எதிர்பார்க்கப்படுகிறது.'
    },
    boxOffice: [
      {
        id: 1,
        title: 'கூலி (Coolie)',
        star: 'ரஜினிகாந்த்',
        collection: '₹420+ கோடி',
        verdict: 'மெகா பிளாக்பஸ்டர்',
        statusColor: 'bg-emerald-500',
        poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 2,
        title: 'விடாமுயற்சி (Vidaamuyarchi)',
        star: 'அஜித் குமார்',
        collection: '₹280+ கோடி',
        verdict: 'சூப்பர் ஹிட்',
        statusColor: 'bg-blue-500',
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 3,
        title: 'ஜெய்லர் 2 (Jailer 2)',
        star: 'ரஜினிகாந்த் & மோகன்லால்',
        collection: 'விரைவில் ரிலீஸ்',
        verdict: 'டிரெண்டிங் எதிர்பார்ப்பு',
        statusColor: 'bg-amber-500',
        poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
      }
    ],
    upcomingTrailers: [
      {
        id: 1,
        title: 'கங்குவா 2 பிரம்மாண்ட டீசர்',
        star: 'சூர்யா',
        duration: '2:15',
        videoId: 'dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 2,
        title: 'இந்தியன் 3 அனல் பறக்கும் டிரெய்லர்',
        star: 'கமல்ஹாசன்',
        duration: '2:40',
        videoId: 'dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80'
      }
    ]
  });

  // Sports & Match Tracker Data
  const [sportsData, setSportsData] = useState({
    liveMatch: {
      tournament: 'TATA IPL 2026 - லீக் ஆட்டம் 18',
      venue: 'சேப்பாக்கம் எம்.ஏ. சிதம்பரம் மைதானம், சென்னை',
      teamA: 'சென்னை சூப்பர் கிங்ஸ் (CSK)',
      teamAScore: '204/3 (20.0)',
      teamB: 'மும்பை இந்தியன்ஸ் (MI)',
      teamBScore: '188/7 (20.0)',
      status: 'சிஎஸ்கே அணி 16 ரன்கள் வித்தியாசத்தில் திரில் வெற்றி!',
      isLive: true,
      playerOfMatch: 'ருதுராஜ் கெய்க்வாட் (84 ரன்கள்)'
    },
    pointsTable: [
      { rank: 1, team: 'சென்னை சூப்பர் கிங்ஸ் (CSK)', played: 8, won: 6, lost: 2, nrr: '+0.842', pts: 12 },
      { rank: 2, team: 'கொல்கத்தா நைட் ரைடர்ஸ் (KKR)', played: 8, won: 5, lost: 3, nrr: '+0.510', pts: 10 },
      { rank: 3, team: 'ராஜஸ்தான் ராயல்ஸ் (RR)', played: 8, won: 5, lost: 3, nrr: '+0.340', pts: 10 },
      { rank: 4, team: 'சன்ரைசர்ஸ் ஹைதராபாத் (SRH)', played: 8, won: 4, lost: 4, nrr: '+0.120', pts: 8 }
    ],
    squadBuzz: [
      {
        id: 1,
        title: 'தோனியின் கடைசி ஓவர் ஹாட்ரிக் சிக்ஸர்: சேப்பாக்கம் மைதானத்தில் வெடித்த ரசிகர்கள் கரகோஷம்!',
        time: '15 நிமிடங்களுக்கு முன்'
      },
      {
        id: 2,
        title: 'டி20 உலகக்கோப்பை 2026: இந்திய அணியில் தமிழக வீரர்களுக்கு முன்னுரிமை!',
        time: '1 மணி நேரத்திற்கு முன்'
      }
    ]
  });

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        const data = await api.getContent('cinema_sports_data');
        if (isMounted && data) {
          if (data.cinemaData) setCinemaData(prev => ({ ...prev, ...data.cinemaData }));
          if (data.sportsData) setSportsData(prev => ({ ...prev, ...data.sportsData }));
        }
      } catch (_) {}
    };
    loadContent();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="w-full bg-white dark:bg-[#0c1427] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm font-tamil space-y-6">
      
      {/* 1. Header Bar with Category Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            {activeTab === 'cinema' ? <Film className="w-6 h-6" /> : <Trophy className="w-6 h-6 text-amber-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {activeTab === 'cinema' ? 'சினிமா & பொழுதுபோக்கு அரங்கம்' : 'விளையாட்டு & IPL நேரலை அரங்கம்'}
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                {activeTab === 'cinema' ? 'SPOTLIGHT 🔥' : 'LIVE 🏏'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === 'cinema' 
                ? 'பாக்ஸ் ஆபீஸ் வசூல் நிலவரம், புதிய டீசர்கள் & முன்னணி திரைச் செய்திகள்' 
                : 'CSK மேட்ச் நேரலை ஸ்கோர்போர்டு, ஐபிஎல் புள்ளிப்பட்டியல் & முக்கியப் போட்டிச் செய்திகள்'}
            </p>
          </div>
        </div>

        {/* Tab Switch Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('cinema')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cinema'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>சினிமா ஸ்பாட்லைட்</span>
          </button>

          <button
            onClick={() => setActiveTab('sports')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sports'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>கிரிக்கெட் & விளையாட்டு</span>
          </button>
        </div>
      </div>

      {/* 2. CINEMA TAB VIEW */}
      {activeTab === 'cinema' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Cols: Lead Feature Movie with Video Overlay */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/60 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between group">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={cinemaData.leadMovie.bannerImage}
                  alt={cinemaData.leadMovie.title}
                  width="640"
                  height="360"
                  decoding="async"
                  loading="lazy"
                  className="w-full h-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>{cinemaData.leadMovie.status}</span>
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{cinemaData.leadMovie.rating}</span>
                  </span>
                </div>

                {/* Play Teaser Button */}
                <button
                  onClick={() => setActiveTeaser(cinemaData.leadMovie.teaserVideoId)}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn"
                  title="டீசர் பார்க்க"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover/btn:scale-115 transition-transform border-2 border-white/40">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {cinemaData.leadMovie.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-bold mt-1">
                    {cinemaData.leadMovie.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {cinemaData.leadMovie.story}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="block text-[10px] text-slate-400">இயக்கம்:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cinemaData.leadMovie.director}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">இசை:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cinemaData.leadMovie.music}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">தயாரிப்பு:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cinemaData.leadMovie.production}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">வெளியீடு:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{cinemaData.leadMovie.releaseDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Box Office Buzz Tracker */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    பாக்ஸ் ஆபீஸ் வசூல் நிலவரம் (Box Office Tracker)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  தமிழ்நாடு
                </span>
              </div>

              <div className="space-y-3">
                {cinemaData.boxOffice.map((movie) => (
                  <div
                    key={movie.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      width="56"
                      height="72"
                      loading="lazy"
                      decoding="async"
                      className="w-14 h-18 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                          {movie.title}
                        </h4>
                        <span className={`text-[10px] text-white font-black px-2 py-0.5 rounded-full ${movie.statusColor} flex-shrink-0`}>
                          {movie.verdict}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        கதாநாயகன்: {movie.star}
                      </p>
                      <p className="text-xs font-black text-purple-600 dark:text-purple-400">
                        மொத்த வசூல்: {movie.collection}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming Teasers Preview */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  <span>சமீபத்திய டிரெய்லர்கள் & டீசர்கள்:</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {cinemaData.upcomingTrailers.map(trailer => (
                    <button
                      key={trailer.id}
                      onClick={() => setActiveTeaser(trailer.videoId)}
                      className="relative rounded-xl overflow-hidden aspect-video bg-black group/tr text-left cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <img src={trailer.thumbnail} alt={trailer.title} width="160" height="90" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover/tr:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white group-hover/tr:scale-125 transition-transform" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                        {trailer.duration}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. SPORTS TAB VIEW */}
      {activeTab === 'sports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Cols: Live Cricket Match Scoreboard Card */}
            <div className="lg:col-span-7 bg-gradient-to-br from-[#0a1945] via-[#0e2a7a] to-[#143282] text-white rounded-3xl p-5 sm:p-7 shadow-lg space-y-5 border border-white/10">
              
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                    {sportsData.liveMatch.tournament}
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium">
                  {sportsData.liveMatch.venue}
                </span>
              </div>

              {/* Match Score Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/15 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-300">சிஎஸ்கே (CSK)</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md">வெற்றி</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{sportsData.liveMatch.teamAScore}</p>
                  <p className="text-[11px] text-slate-300">ருதுராஜ் 84 (52) | தோனி 28* (9)</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-300">மும்பை இந்தியன்ஸ் (MI)</span>
                    <span className="text-[10px] bg-slate-700 text-white font-bold px-2 py-0.5 rounded-md">தோல்வி</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-200">{sportsData.liveMatch.teamBScore}</p>
                  <p className="text-[11px] text-slate-400">ரோஹித் 54 (36) | பும்ரா 2/28</p>
                </div>
              </div>

              {/* Match Result Banner */}
              <div className="bg-amber-400/20 border border-amber-400/30 rounded-2xl p-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-black">
                  <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{sportsData.liveMatch.status}</span>
                </div>
                <span className="text-[11px] text-slate-200 font-semibold">
                  ஆட்டநாயகன்: {sportsData.liveMatch.playerOfMatch}
                </span>
              </div>

              {/* Squad Buzz Feed */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide">
                  சிஎஸ்கே & ஐபிஎல் சுடச்சுட செய்திகள்:
                </h4>
                {sportsData.squadBuzz.map(buzz => (
                  <div key={buzz.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-100">{buzz.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{buzz.time}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right 5 Cols: IPL Points Table */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    IPL 2026 புள்ளிப்பட்டியல் (Points Table)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Top 4</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                      <th className="py-2">அணி</th>
                      <th className="py-2 text-center">போட்டி</th>
                      <th className="py-2 text-center">வெற்றி</th>
                      <th className="py-2 text-center">புள்ளிகள்</th>
                      <th className="py-2 text-right">NRR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {sportsData.pointsTable.map((team) => (
                      <tr 
                        key={team.rank}
                        className={team.rank === 1 ? 'bg-amber-500/10 font-black' : 'font-semibold text-slate-700 dark:text-slate-300'}
                      >
                        <td className="py-2.5 flex items-center gap-1.5">
                          <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                            team.rank === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {team.rank}
                          </span>
                          <span className="truncate max-w-[130px]">{team.team}</span>
                        </td>
                        <td className="py-2.5 text-center">{team.played}</td>
                        <td className="py-2.5 text-center">{team.won}</td>
                        <td className="py-2.5 text-center font-black text-emerald-600 dark:text-emerald-400">{team.pts}</td>
                        <td className="py-2.5 text-right font-mono text-[11px]">{team.nrr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                * முதல் 4 அணிகள் பிளே-ஆஃப் சுற்றுக்கு தகுதி பெறும்.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 4. MODAL: Video Teaser Overlay */}
      {activeTeaser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveTeaser(null)}
        >
          <div 
            className="bg-black rounded-3xl overflow-hidden w-full max-w-3xl aspect-video border border-slate-700 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveTeaser(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="மூடுக"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeTeaser}?autoplay=1&rel=0`}
              title="Movie Teaser"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </section>
  );
}
