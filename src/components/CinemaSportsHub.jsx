import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Film, Trophy, Star, Play, ExternalLink, Activity, Flame, ChevronRight } from 'lucide-react';
import { getResponsiveImageProps } from '../utils/imageHelper';

export default function CinemaSportsHub({ onOpenArticle }) {
  const [activeTab, setActiveTab] = useState('cinema'); // 'cinema' | 'sports'
  const [cinemaMovies, setCinemaMovies] = useState([
    {
      id: 1,
      title: 'தளபதி 69 (Thalapathy 69)',
      director: 'எச். வினோத்',
      music: 'அனிருத் ரவிச்சந்தர்',
      rating: '4.8',
      releaseDate: 'அக்டோபர் 2026',
      status: 'படப்பிடிப்பில்',
      bannerImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 2,
      title: 'கூலி (Coolie) - ரஜினிகாந்த்',
      director: 'லோகேஷ் கனகராஜ்',
      music: 'அனிருத் ரவிச்சந்தர்',
      rating: '4.9',
      releaseDate: 'தீபாவளி 2026',
      status: 'டீசர் வெளியானது',
      bannerImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  ]);

  const [scorecard, setScorecard] = useState({
    tournament: 'IPL 2026 - லீக் ஆட்டம் 14',
    teamA: 'சென்னை சூப்பர் கிங்ஸ் (CSK)',
    teamAScore: '198/4 (20.0)',
    teamB: 'மும்பை இந்தியன்ஸ் (MI)',
    teamBScore: '182/8 (20.0)',
    matchStatus: 'சிஎஸ்கே அணி 16 ரன்கள் வித்தியாசத்தில் அபார வெற்றி!',
    venue: 'சேப்பாக்கம் எம்.ஏ. சிதம்பரம் மைதானம், சென்னை',
    isLive: true
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await api.getContent('cinema_sports_data');
        if (data) {
          if (Array.isArray(data.movies) && data.movies.length > 0) setCinemaMovies(data.movies);
          if (data.scorecard) setScorecard(data.scorecard);
        }
      } catch (_) {}
    };
    loadContent();
  }, []);

  return (
    <section className="w-full bg-white dark:bg-[#0c1427] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm font-tamil space-y-6">
      {/* Header bar with Tab toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            {activeTab === 'cinema' ? <Film className="w-6 h-6" /> : <Trophy className="w-6 h-6 text-amber-500" />}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {activeTab === 'cinema' ? 'சினிமா & பொழுதுபோக்கு அரங்கம்' : 'விளையாட்டு & IPL நேரலை அரங்கம்'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === 'cinema' ? 'திரைப்பட விமர்சனங்கள், டிரெய்லர்கள் & நட்சத்திர செய்திகள்' : 'கிரிக்கெட் நேரலை ஸ்கோர்கார்டு & போட்டி நிலவரங்கள்'}
            </p>
          </div>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('cinema')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cinema'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>சினிமா</span>
          </button>

          <button
            onClick={() => setActiveTab('sports')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sports'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>விளையாட்டு</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Cinema Movies Grid */}
      {activeTab === 'cinema' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cinemaMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-slate-50 dark:bg-[#070e1e] rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row gap-4 items-center group shadow-sm"
            >
              <div className="relative w-full sm:w-32 aspect-[3/4] sm:aspect-auto sm:h-40 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                {(() => {
                  const mImg = getResponsiveImageProps(movie.bannerImage, 300, 400);
                  return (
                    <img
                      src={mImg.src}
                      srcSet={mImg.srcSet}
                      sizes="(max-width: 640px) 100vw, 128px"
                      width="300"
                      height="400"
                      loading="lazy"
                      decoding="async"
                      alt={movie.title}
                      className="w-full h-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { 
                        e.target.removeAttribute('srcset');
                        e.target.src = '/Amaze times.jpg'; 
                      }}
                    />
                  );
                })()}
                <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white shadow">
                  {movie.status}
                </span>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div className="flex items-center justify-center sm:justify-between gap-2">
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{movie.rating}/5.0</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {movie.releaseDate}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
                  {movie.title}
                </h3>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                  <p><span className="text-slate-400">இயக்கம்:</span> {movie.director}</p>
                  <p><span className="text-slate-400">இசை:</span> {movie.music}</p>
                </div>

                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline pt-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>டிரெய்லர் பார்க்க (Watch Trailer)</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tab 2: Sports Scorecard */
        <div className="bg-gradient-to-br from-amber-500/5 via-slate-50 dark:via-[#070e1e] to-blue-500/5 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-inner space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-amber-500" />
              {scorecard.tournament}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              நேரலை முடிவு (Live Result)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-500/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">அணி 1</p>
                <h4 className="text-base font-black text-amber-600 dark:text-amber-400">{scorecard.teamA}</h4>
              </div>
              <span className="text-xl font-mono font-black text-slate-900 dark:text-white">{scorecard.teamAScore}</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-blue-500/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">அணி 2</p>
                <h4 className="text-base font-black text-blue-600 dark:text-blue-400">{scorecard.teamB}</h4>
              </div>
              <span className="text-xl font-mono font-black text-slate-900 dark:text-white">{scorecard.teamBScore}</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{scorecard.matchStatus}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{scorecard.venue}</p>
          </div>
        </div>
      )}
    </section>
  );
}
