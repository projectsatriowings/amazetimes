import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Film,
  Trophy,
  Star,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Video,
  Activity
} from 'lucide-react';

export const AdminCinemaSportsManager = ({ showToast, defaultTab = 'cinema' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'cinema' | 'sports'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cinema Spotlight State
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

  // Sports Scorecards State
  const [matchScorecard, setMatchScorecard] = useState({
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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getContent('cinema_sports_data');
      if (data) {
        if (Array.isArray(data.movies)) setCinemaMovies(data.movies);
        if (data.scorecard) setMatchScorecard(data.scorecard);
      }
    } catch (err) {
      console.warn('Load cinema sports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        movies: cinemaMovies,
        scorecard: matchScorecard
      };
      await api.saveSiteContent('cinema_sports_data', payload);
      if (showToast) showToast('✅ சினிமா & விளையாட்டு தகவல்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!');
    } catch (err) {
      if (showToast) showToast('சேமிப்பதில் பிழை');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMovie = () => {
    const newMovie = {
      id: Date.now(),
      title: 'புதிய திரைப்படம்',
      director: 'இயக்குனர் பெயர்',
      music: 'இசையமைப்பாளர்',
      rating: '4.5',
      releaseDate: 'விரைவில்',
      status: 'அறிவிப்பு',
      bannerImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      trailerUrl: ''
    };
    setCinemaMovies([newMovie, ...cinemaMovies]);
    if (showToast) showToast('புதிய படம் சேர்க்கப்பட்டது, விவரங்களை உள்ளிடவும்');
  };

  const handleRemoveMovie = (id) => {
    setCinemaMovies(cinemaMovies.filter(m => m.id !== id));
  };

  const handleUpdateMovie = (id, field, value) => {
    setCinemaMovies(cinemaMovies.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-tamil">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              {activeTab === 'cinema' ? <Film className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeTab === 'cinema' ? 'சினிமா & பொழுதுபோக்கு நிர்வாகம் (Cinema Spotlight)' : 'விளையாட்டு அரங்கம் & ஸ்கோர்கார்டு (Sports Arena)'}
            </h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            திரைப்பட விமர்சனங்கள், டிரெய்லர்கள் மற்றும் கிரிக்கெட்/IPL நேரலை ஸ்கோர்களை நிர்வகிக்கவும்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('cinema')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cinema' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              சினிமா
            </button>
            <button
              onClick={() => setActiveTab('sports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sports' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              விளையாட்டு
            </button>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? '...' : 'சேமி'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Cinema Movies Spotlight */}
      {activeTab === 'cinema' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-400" />
              <span>பிரபல திரைப்படங்கள் & விமர்சனங்கள் ({cinemaMovies.length})</span>
            </h3>
            <button
              onClick={handleAddMovie}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>புதிய படம் சேர்</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cinemaMovies.map((movie) => (
              <div key={movie.id} className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
                <div className="flex gap-4 items-start">
                  <img
                    src={movie.bannerImage}
                    alt={movie.title}
                    className="w-24 h-32 object-cover rounded-xl border border-slate-800 flex-shrink-0"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={movie.title}
                      onChange={(e) => handleUpdateMovie(movie.id, 'title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-bold text-white"
                      placeholder="படத்தின் தலைப்பு"
                    />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={movie.director}
                        onChange={(e) => handleUpdateMovie(movie.id, 'director', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300"
                        placeholder="இயக்குனர்"
                      />
                      <input
                        type="text"
                        value={movie.music}
                        onChange={(e) => handleUpdateMovie(movie.id, 'music', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300"
                        placeholder="இசை"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={movie.rating}
                        onChange={(e) => handleUpdateMovie(movie.id, 'rating', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-amber-400 font-bold"
                        placeholder="மதிப்பீடு (எ.கா: 4.8)"
                      />
                      <input
                        type="text"
                        value={movie.releaseDate}
                        onChange={(e) => handleUpdateMovie(movie.id, 'releaseDate', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300"
                        placeholder="வெளியீட்டு தேதி"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">போஸ்டர் படம் URL</label>
                  <input
                    type="text"
                    value={movie.bannerImage}
                    onChange={(e) => handleUpdateMovie(movie.id, 'bannerImage', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                    {movie.status}
                  </span>
                  <button
                    onClick={() => handleRemoveMovie(movie.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>நீக்கு</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Sports Scorecard & Match Highlights */}
      {activeTab === 'sports' && (
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>நேரலை கிரிக்கெட் ஸ்கோர்கார்டு (Live Cricket Scorecard)</span>
            </h3>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE ON AIR
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">தொடர் / போட்டி விவரம்</label>
              <input
                type="text"
                value={matchScorecard.tournament}
                onChange={(e) => setMatchScorecard({ ...matchScorecard, tournament: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">மைதானம் (Venue)</label>
              <input
                type="text"
                value={matchScorecard.venue}
                onChange={(e) => setMatchScorecard({ ...matchScorecard, venue: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
            {/* Team A */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-400 block">அணி 1 பெயர்</label>
              <input
                type="text"
                value={matchScorecard.teamA}
                onChange={(e) => setMatchScorecard({ ...matchScorecard, teamA: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-bold"
              />
              <label className="text-xs font-bold text-slate-400 block">ரன்கள் / விக்கெட்டுகள் (ஓவர்கள்)</label>
              <input
                type="text"
                value={matchScorecard.teamAScore}
                onChange={(e) => setMatchScorecard({ ...matchScorecard, teamAScore: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-base text-amber-400 font-mono font-black"
              />
            </div>

            {/* Team B */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-400 block">அணி 2 பெயர்</label>
              <input
                type="text"
                value={matchScorecard.teamB}
                onChange={(e) => setMatchScorecard({ ...matchScorecard, teamB: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-bold"
              />
              <label className="text-xs font-bold text-slate-400 block">ரன்கள் / விக்கெட்டுகள் (ஓவர்கள்)</label>
              <input
                type="text"
                value={matchScorecard.teamBScore}
                onChange={(e) => setMatchScorecard({ ...matchScorecard, teamBScore: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-base text-blue-400 font-mono font-black"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">ஆட்டத்தின் நிலை / முடிவு வாசகம் (Match Result/Status)</label>
            <input
              type="text"
              value={matchScorecard.matchStatus}
              onChange={(e) => setMatchScorecard({ ...matchScorecard, matchStatus: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-bold"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCinemaSportsManager;
