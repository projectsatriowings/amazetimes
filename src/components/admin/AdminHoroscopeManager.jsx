import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Edit3, Save, Compass, Palette, Hash, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminHoroscopeManager = () => {
  const { horoscopeData, updateHoroscopeItem, showToast } = useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [selectedRasiKey, setSelectedRasiKey] = useState('aries');

  const currentMap = horoscopeData?.[selectedTimeframe] || {};
  const currentRasi = currentMap[selectedRasiKey] || {
    name: 'மேஷம்',
    englishName: 'Aries',
    symbol: '♈',
    starRange: '',
    prediction: '',
    luckyNumber: '',
    luckyColor: '',
    luckyDirection: '',
    remedy: ''
  };

  const [editForm, setEditForm] = useState({ ...currentRasi });

  // When selected sign changes, sync edit form
  const handleSelectRasi = (key) => {
    setSelectedRasiKey(key);
    if (currentMap[key]) {
      setEditForm({ ...currentMap[key] });
    }
  };

  const handleTimeframeChange = (tf) => {
    setSelectedTimeframe(tf);
    if (horoscopeData?.[tf]?.[selectedRasiKey]) {
      setEditForm({ ...horoscopeData[tf][selectedRasiKey] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateHoroscopeItem(selectedTimeframe, selectedRasiKey, editForm);
  };

  const timeframeNames = {
    daily: 'தினசரி பலன் (Daily Horoscope)',
    weekly: 'வாராந்திர பலன் (Weekly Horoscope)',
    monthly: 'மாதாந்திர பலன் (Monthly Horoscope)'
  };

  const rasiKeysList = [
    { key: 'aries', name: 'மேஷம்', symbol: '♈' },
    { key: 'taurus', name: 'ரிஷபம்', symbol: '♉' },
    { key: 'gemini', name: 'மிதுனம்', symbol: '♊' },
    { key: 'cancer', name: 'கடகம்', symbol: '♋' },
    { key: 'leo', name: 'சிம்மம்', symbol: '♌' },
    { key: 'virgo', name: 'கன்னி', symbol: '♍' },
    { key: 'libra', name: 'துலாம்', symbol: '♎' },
    { key: 'scorpio', name: 'விருச்சிகம்', symbol: '♏' },
    { key: 'sagittarius', name: 'தனுசு', symbol: '♐' },
    { key: 'capricorn', name: 'மகரம்', symbol: '♑' },
    { key: 'aquarius', name: 'கும்பம்', symbol: '♒' },
    { key: 'pisces', name: 'மீனம்', symbol: '♓' }
  ];

  return (
    <div className="space-y-6 font-tamil">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a1945] via-[#102359] to-[#0a1945] border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" /> ஆன்மீகம் மேலாண்மை
          </div>
          <h2 className="text-2xl font-black text-amber-400">12 ராசி பலன்கள் நிர்வாகம்</h2>
          <p className="text-xs text-slate-300 mt-1">
            தினசரி, வாராந்திர மற்றும் மாதாந்திர ராசி பலன் விவரங்களை உடனுக்குடன் புதுப்பிக்கவும்.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => handleTimeframeChange('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedTimeframe === 'daily'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold shadow-md shadow-red-600/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            தினசரி
          </button>
          <button
            onClick={() => handleTimeframeChange('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedTimeframe === 'weekly'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold shadow-md shadow-red-600/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            வாராந்திர
          </button>
          <button
            onClick={() => handleTimeframeChange('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedTimeframe === 'monthly'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold shadow-md shadow-red-600/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            மாதாந்திர
          </button>
        </div>
      </div>

      {/* Main Grid: 12 Rasi Selector Pills & Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 12 Rasi Pills (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a1633] border border-slate-800 rounded-3xl p-4 space-y-2">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider px-2 pb-2 border-b border-slate-800">
            ராசியைத் தேர்ந்தெடுக்க (12 ராசிகள்)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {rasiKeysList.map((r) => {
              const isSelected = selectedRasiKey === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleSelectRasi(r.key)}
                  className={`p-3 rounded-2xl border transition flex items-center gap-2.5 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 font-black shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-amber-400'
                  }`}>
                    {r.symbol}
                  </span>
                  <span className="truncate">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Edit Form for Selected Rasi (8 cols) */}
        <div className="lg:col-span-8 bg-[#0a1633] border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center">
                {editForm.symbol || '♈'}
              </span>
              <div>
                <h3 className="text-lg font-black text-amber-400">
                  {editForm.name} ({editForm.englishName}) — பலன்கள் திருத்தம்
                </h3>
                <span className="text-xs text-slate-400">
                  காலகட்டம்: {timeframeNames[selectedTimeframe]}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            {/* Star Range */}
            <div>
              <label className="block text-slate-300 mb-1">நட்சத்திர எல்லை / நட்சத்திரங்கள்:</label>
              <input
                type="text"
                value={editForm.starRange || ''}
                onChange={(e) => setEditForm({ ...editForm, starRange: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-medium"
                placeholder="எ.கா. அஸ்வினி, பரணி, கார்த்திகை 1-ம் பாதம்"
              />
            </div>

            {/* Main Prediction */}
            <div>
              <label className="block text-slate-300 mb-1">ராசி பலன் விரிவான விபரம் (Prediction Text):</label>
              <textarea
                rows={4}
                value={editForm.prediction || ''}
                onChange={(e) => setEditForm({ ...editForm, prediction: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3.5 text-xs focus:outline-none focus:border-amber-500 font-medium leading-relaxed"
                placeholder="ராசி பலன் வரிகளை உள்ளிடவும்..."
              />
            </div>

            {/* Lucky Traits Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-amber-400" /> அதிர்ஷ்ட எண்:
                </label>
                <input
                  type="text"
                  value={editForm.luckyNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, luckyNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="3, 9"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" /> அதிர்ஷ்ட நிறம்:
                </label>
                <input
                  type="text"
                  value={editForm.luckyColor || ''}
                  onChange={(e) => setEditForm({ ...editForm, luckyColor: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  placeholder="சிகப்பு (Red)"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-400" /> அதிர்ஷ்ட திசை:
                </label>
                <input
                  type="text"
                  value={editForm.luckyDirection || ''}
                  onChange={(e) => setEditForm({ ...editForm, luckyDirection: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  placeholder="கிழக்கு (East)"
                />
              </div>
            </div>

            {/* Remedy */}
            <div>
              <label className="block text-slate-300 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> ஆன்மீக பரிகாரம் & வழிபாடு:
              </label>
              <textarea
                rows={2}
                value={editForm.remedy || ''}
                onChange={(e) => setEditForm({ ...editForm, remedy: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                placeholder="பரிகாரம் வழிகாட்டல்..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl transition"
            >
              <Save className="w-4 h-4" /> ராசி பலன் தகவல்களைச் சேமிக்க (Save Updates)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
