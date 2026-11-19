import React, { useState, useEffect } from 'react';
import { Film, Trophy, Flame, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export default function CinemaSportsSpotlightBar({ onOpenSearch, onSelectCategory }) {
  const [cinemaTags, setCinemaTags] = useState([
    { label: '#அவெஞ்சர்ஸ்_டூம்ஸ்டே', query: 'அவெஞ்சர்ஸ்', subTab: 'boxoffice' },
    { label: '#சத்தியவான்_சாவித்திரி', query: 'சத்தியவான்', subTab: 'all' },
    { label: '#ராமாயணம்', query: 'ராமாயணம்', subTab: 'boxoffice' },
    { label: '#மின்னும்_ஓர்_இரவு', query: 'மின்னும்', subTab: 'all' },
    { label: '#யே_பிரேம்_மோல்', query: 'ஆயுஷ்மான்', subTab: 'all' },
    { label: '#சுபான்_நதியாட்வாலா', query: 'சுபான்', subTab: 'all' },
    { label: '#திரைவிமர்சனம்', query: 'விமர்சனம்', subTab: 'reviews' },
    { label: '#பாக்ஸ்_ஆபீஸ்', query: 'வசூல்', subTab: 'boxoffice' }
  ]);

  const [sportsTags, setSportsTags] = useState([
    { label: '#தோனி_சிஎஸ்கே_மென்டார்', query: 'தோனி', subTab: 'csk' },
    { label: '#நசீர்_கான்_சாதனை', query: 'நசீர் கான்', subTab: 'international' },
    { label: '#இந்தியா_நியூசிலாந்து', query: 'நியூசிலாந்து', subTab: 'international' },
    { label: '#பென்_டக்கெட்_சதம்', query: 'டக்கெட்', subTab: 'international' },
    { label: '#சிஎஸ்கே', query: 'சிஎஸ்கே', subTab: 'csk' },
    { label: '#சாண்ட்பேப்பர்_சர்ச்சை', query: 'சாண்ட்பேப்பர்', subTab: 'international' },
    { label: '#ஐபிஎல்_2027', query: 'ஐபிஎல்', subTab: 'csk' },
    { label: '#டெஸ்ட்_கிரிக்கெட்', query: 'டெஸ்ட்', subTab: 'achievers' }
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchTags = async () => {
      try {
        const cData = await api.getContent('cinema_buzz_settings');
        if (isMounted && cData && Array.isArray(cData.spotlightTags) && cData.spotlightTags.length > 0) {
          setCinemaTags(cData.spotlightTags);
        }
        const sData = await api.getContent('sports_buzz_settings');
        if (isMounted && sData && Array.isArray(sData.spotlightTags) && sData.spotlightTags.length > 0) {
          setSportsTags(sData.spotlightTags);
        }
      } catch (e) {
        // Fallbacks preserved
      }
    };
    fetchTags();
    return () => { isMounted = false; };
  }, []);

  const handleCinemaTag = (t) => {
    // 1. Dispatch custom filter event to CinemaAndSports component
    window.dispatchEvent(new CustomEvent('amaze:spotlight_filter', {
      detail: { type: 'cinema', subTab: t.subTab || 'all', query: t.query }
    }));

    // 2. Smoothly scroll into the cinema & sports hub
    const section = document.getElementById('cinema-and-sports');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onSelectCategory) {
      onSelectCategory('cinema');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSportsTag = (t) => {
    // 1. Dispatch custom filter event to CinemaAndSports component
    window.dispatchEvent(new CustomEvent('amaze:spotlight_filter', {
      detail: { type: 'sports', subTab: t.subTab || 'all', query: t.query }
    }));

    // 2. Smoothly scroll into the cinema & sports hub
    const section = document.getElementById('cinema-and-sports');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onSelectCategory) {
      onSelectCategory('sports');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleViewAllCinema = () => {
    if (onSelectCategory) onSelectCategory('cinema');
    if (onOpenSearch) onOpenSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllSports = () => {
    if (onSelectCategory) onSelectCategory('sports');
    if (onOpenSearch) onOpenSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#0d1630] via-[#1a0f2e] to-[#0c2420] text-white border-b border-amber-400/30 py-2.5 px-3 sm:px-6 shadow-md relative overflow-hidden font-tamil">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-72 h-16 bg-rose-600/10 blur-2xl pointer-events-none rounded-full"></div>
      <div className="absolute top-0 right-1/4 w-72 h-16 bg-emerald-600/10 blur-2xl pointer-events-none rounded-full"></div>

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* CINEMA SPOTLIGHT STRIP */}
        <div className="w-full lg:w-1/2 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-red-600 to-rose-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-black shadow-md border border-red-400/40">
            <Film className="w-3.5 h-3.5 text-white" />
            <span>சினிமா டிரெண்டிங்:</span>
            <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {cinemaTags.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCinemaTag(t)}
                className="bg-rose-950/60 hover:bg-rose-600 text-rose-200 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 border border-rose-800/60 hover:border-rose-400 cursor-pointer shadow-2xs active:scale-95"
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleViewAllCinema}
            className="text-[11px] font-black text-rose-400 hover:text-rose-300 flex items-center gap-0.5 shrink-0 ml-1 underline decoration-rose-500/50 hover:no-underline cursor-pointer"
          >
            <span>மேலும் பார்க்க</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Divider on desktop */}
        <div className="hidden lg:block w-px h-6 bg-slate-700/80"></div>

        {/* SPORTS SPOTLIGHT STRIP */}
        <div className="w-full lg:w-1/2 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-black shadow-md border border-emerald-400/40">
            <Trophy className="w-3.5 h-3.5 text-white" />
            <span>விளையாட்டு களம்:</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {sportsTags.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSportsTag(t)}
                className="bg-emerald-950/60 hover:bg-emerald-600 text-emerald-200 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 border border-emerald-800/60 hover:border-emerald-400 cursor-pointer shadow-2xs active:scale-95"
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleViewAllSports}
            className="text-[11px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 shrink-0 ml-1 underline decoration-emerald-500/50 hover:no-underline cursor-pointer"
          >
            <span>அட்டவணை / ஸ்கோர்</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
