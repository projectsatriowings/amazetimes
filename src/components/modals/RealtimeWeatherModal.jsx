import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { fetchRealtimeWeather, TAMIL_NADU_CITIES } from '../../services/weatherService';

export default function RealtimeWeatherModal({ isOpen, onClose }) {
  const [weatherList, setWeatherList] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('chennai');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadWeather = async (force = false) => {
    setIsLoading(true);
    try {
      const data = await fetchRealtimeWeather(force);
      setWeatherList(data);
      setLastUpdated(new Date().toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (_) {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWeather(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeCity = weatherList.find(c => c.id === selectedCityId) || weatherList[0] || {};

  const renderWeatherIcon = (iconName, className = "w-6 h-6") => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-amber-300`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-purple-400`} />;
      case 'cloud':
      default:
        return <Cloud className={`${className} text-slate-300`} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0b1329] border border-slate-700/80 text-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#091538] via-[#0e2a7a] to-[#1e3a8a] p-5 sm:p-6 border-b border-white/10 flex items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                நேரலை வானிலை செயற்கைக்கோள் தரவு
              </span>
              {lastUpdated && (
                <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">
                  • புதுப்பிக்கப்பட்டது: {lastUpdated}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-title text-white flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />
              <span>தமிழக நேரலை வானிலை நிலவர மையம் (Live Climate Radar)</span>
            </h2>
            <p className="text-xs text-slate-200">
              சென்னை, மதுரை, கோவை உட்பட தமிழகத்தின் அனைத்து முக்கிய மாவட்டங்களின் துல்லியமான நிகழ்நேர வானிலை
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => loadWeather(true)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer border border-white/10 disabled:opacity-50"
              title="வானிலை நிலவரத்தைப் புதுப்பிக்க"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-slate-200 hover:text-white transition cursor-pointer border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Active Featured City Spotlight Banner */}
          {activeCity.name_ta && (
            <div className="bg-gradient-to-br from-[#12224d] via-[#0d1a3a] to-[#070e24] border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>{activeCity.name_ta} ({activeCity.name_en})</span>
                    <span className="text-slate-400">• நேரலை வெப்பநிலை</span>
                  </div>
                  
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black font-title text-white tracking-tight">
                      {activeCity.temp}°C
                    </span>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-xl border border-white/15">
                      {renderWeatherIcon(activeCity.icon, "w-5 h-5")}
                      <span className="text-xs sm:text-sm font-bold text-amber-300">
                        {activeCity.condition}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    உணரும் வெப்பம் (Feels like): <strong className="text-white font-mono">{activeCity.feelsLike}°C</strong> • 
                    வானிலை குறியீடு: <span className="font-mono text-slate-400">WMO {activeCity.weatherCode}</span>
                  </p>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center min-w-[90px]">
                    <Droplets className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-bold">ஈரப்பதம்</span>
                    <span className="text-sm font-black text-white font-mono">{activeCity.humidity}%</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center min-w-[90px]">
                    <Wind className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-bold">காற்று</span>
                    <span className="text-sm font-black text-white font-mono">{activeCity.wind} km/h</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center min-w-[90px]">
                    <CloudRain className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-bold">மழை அளவு</span>
                    <span className="text-sm font-black text-white font-mono">{activeCity.precipitation} mm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regional Grid of Tamil Nadu Cities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>தமிழக முக்கிய நகரங்களின் தற்போதைய வானிலை</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                நகரத்தை கிளிக் செய்து விவரங்களை அறியலாம்
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {weatherList.map((city) => {
                const isSelected = city.id === selectedCityId;
                return (
                  <div
                    key={city.id}
                    onClick={() => setSelectedCityId(city.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border-amber-400/80 shadow-lg scale-[1.02]'
                        : 'bg-[#0f1a36]/80 hover:bg-[#142347] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-title font-black text-sm text-white">
                          {city.name_ta}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {city.name_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                        {renderWeatherIcon(city.icon, "w-3.5 h-3.5")}
                        <span>{city.condition}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>ஈரப்பதம்: {city.humidity}%</span>
                        <span>காற்று: {city.wind} km/h</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-white font-mono block">
                        {city.temp}°C
                      </span>
                      <span className="text-[10px] text-slate-400">
                        உணரும்: {city.feelsLike}°C
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meteorological Data Source & Health Advisory Footer */}
          <div className="bg-[#081024] p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                அமேஸ் டைம்ஸ் வானிலை தளம்: உலகளாவிய வானிலை செயற்கைக்கோள் தரவுத்தளத்துடன் நிகழ்நேரத்தில் ஒத்திசைக்கப்பட்டுள்ளது.
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shrink-0 border border-blue-500/30 shadow"
            >
              மூடுக (Close)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

