import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, Calendar, Clock, Moon, Sun, Shield } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_RASIS = [
  { id: 'mesham', name: 'மேஷம்', symbol: '♈', luck: '9', color: 'சிவப்பு', prediction: 'தொழிலில் எதிர்பாராத நல்ல திருப்பம் ஏற்படும். குடும்பத்தினருடன் மகிழ்ச்சியான தருணங்கள் அமையும்.' },
  { id: 'rishabam', name: 'ரிஷபம்', symbol: '♉', luck: '6', color: 'வெள்ளை', prediction: 'நிதி நிலைமை சீராக இருக்கும். புதிய சேமிப்பு திட்டங்களில் ஈடுபட சாதகமான நாள்.' },
  { id: 'mithunam', name: 'மிதுனம்', symbol: '♊', luck: '5', color: 'பச்சை', prediction: 'நண்பர்கள் வழியில் உதவி கிட்டும். பேச்சில் நிதானம் தேவை. பயணங்கள் அனுகூலம் தரும்.' },
  { id: 'kadagam', name: 'கடகம்', symbol: '♋', luck: '2', color: 'வெள்ளி', prediction: 'உடல் ஆரோக்கியத்தில் நல்ல முன்னேற்றம் உண்டு. தடைபட்ட சுபகாரியங்கள் கைகூடும்.' },
  { id: 'simmam', name: 'சிம்மம்', symbol: '♌', luck: '1', color: 'தங்கம்', prediction: 'அரசு வழி காரியங்கள் வெற்றிகரமாக முடியும். உயர் அதிகாரிகளின் பாராட்டு கிடைக்கும்.' },
  { id: 'kanni', name: 'கன்னி', symbol: '♍', luck: '5', color: 'பச்சை', prediction: 'எடுத்த காரியங்களில் கூடுதல் கவனம் தேவை. பிற்பகலுக்கு மேல் நன்மைகள் பெருகும்.' },
  { id: 'thulam', name: 'துலாம்', symbol: '♎', luck: '6', color: 'வெள்ளை', prediction: 'வியாபாரத்தில் புதிய வாடிக்கையாளர்கள் வருகை தருவர். பணவரவு திருப்திகரமாக இருக்கும்.' },
  { id: 'viruchigam', name: 'விருச்சிகம்', symbol: '♏', luck: '9', color: 'சிவப்பு', prediction: 'குடும்பத்தில் ஏற்பட்ட மனக்கசப்புகள் நீங்கும். புதிய வாய்ப்புகள் தேடி வரும்.' },
  { id: 'dhanusu', name: 'தனுசு', symbol: '♐', luck: '3', color: 'மஞ்சள்', prediction: 'ஆன்மீக சிந்தனைகள் மேலோங்கும். ஆலயம் சென்று வழிபடுவது மன அமைதியைத் தரும்.' },
  { id: 'magaram', name: 'மகரம்', symbol: '♑', luck: '8', color: 'நீலம்', prediction: 'உழைப்புக்கு ஏற்ற ஊதியம் கிடைக்கும். உறவினர்களின் வருகையால் மகிழ்ச்சி உண்டாகும்.' },
  { id: 'kumbam', name: 'கும்பம்', symbol: '♒', luck: '8', color: 'நீலம்', prediction: 'திட்டமிட்ட காரியங்கள் தடையின்றி நடக்கும். முதலீடுகளில் நல்ல லாபம் கிடைக்கும்.' },
  { id: 'meenam', name: 'மீனம்', symbol: '♓', luck: '3', color: 'மஞ்சள்', prediction: 'கல்வி மற்றும் ஆராய்ச்சித் துறையில் உள்ளவர்களுக்கு சிறப்பான அங்கீகாரம் கிட்டும்.' }
];

export default function RasiPalanModal({ isOpen, onClose, onSpeak }) {
  const [selectedRasi, setSelectedRasi] = useState(DEFAULT_RASIS[0]);
  const [rasis, setRasis] = useState(DEFAULT_RASIS);

  const panchangam = {
    date: 'புரட்டாசி 28 (அக்டோபர் 14)',
    thithi: 'சுக்ல பட்ச பஞ்சமி (இரவு 09:24 வரை)',
    natchathiram: 'அனுஷம் (மாலை 04:15 வரை)',
    yogam: 'சோபனம்',
    nallaNeram: 'காலை 09:15 - 10:15 | மாலை 04:45 - 05:45',
    rahuKalam: 'பிற்பகல் 01:30 - 03:00',
    emagandam: 'காலை 06:00 - 07:30',
    kuligai: 'காலை 09:00 - 10:30'
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchZodiac = async () => {
      try {
        const res = await api.getZodiacToday();
        if (res && res.success && Array.isArray(res.signs) && res.signs.length > 0) {
          setRasis(res.signs);
          setSelectedRasi(res.signs[0]);
        }
      } catch (_) {}
    };
    fetchZodiac();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in font-tamil">
      <div className="bg-[#0b1326] border border-amber-500/40 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d162c]/95 backdrop-blur-md px-5 py-4 border-b border-gray-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">இன்றைய ராசிபலன் & தினசரி பஞ்சாங்கம்</h2>
              <p className="text-xs text-amber-400/90">{panchangam.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6 flex-1">
          {/* Panchangam Timings Widget */}
          <div className="bg-gradient-to-r from-amber-950/30 via-[#0f1933] to-amber-950/30 p-4 rounded-2xl border border-amber-500/20 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} /> தினசரி பஞ்சாங்கக் குறிப்புகள்
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[10px]">நல்ல நேரம்:</span>
                <span className="font-bold text-emerald-300">{panchangam.nallaNeram}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[10px]">ராகு காலம்:</span>
                <span className="font-bold text-rose-300">{panchangam.rahuKalam}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[10px]">எமகண்டம்:</span>
                <span className="font-bold text-amber-300">{panchangam.emagandam}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[10px]">குளிகை:</span>
                <span className="font-bold text-blue-300">{panchangam.kuligai}</span>
              </div>
            </div>
          </div>

          {/* 12 Rasis Selector */}
          <div>
            <h3 className="text-xs font-bold text-gray-300 mb-2.5">உங்கள் ராசியைத் தேர்ந்தெடுக்கவும்:</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {rasis.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRasi(r)}
                  className={`p-2 rounded-xl text-center transition flex flex-col items-center gap-1 border ${
                    selectedRasi.id === r.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                      : 'bg-gray-900/80 text-gray-300 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <span className="text-lg">{r.symbol || '✦'}</span>
                  <span className="text-xs">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Rasi Details */}
          {selectedRasi && (
            <div className="bg-[#0f1933] p-5 rounded-2xl border border-gray-800 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    {selectedRasi.symbol || '✦'}
                  </span>
                  <div>
                    <h4 className="text-base font-extrabold text-white">{selectedRasi.name} ராசி பலன்</h4>
                    <span className="text-xs text-gray-400">இன்றைய பலன்கள்</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedRasi.luck && (
                    <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-[11px] text-amber-300 font-bold">
                      அதிர்ஷ்ட எண்: {selectedRasi.luck}
                    </span>
                  )}
                  {onSpeak && (
                    <button
                      onClick={() => onSpeak(`${selectedRasi.name} ராசி இன்றைய பலன்: ${selectedRasi.prediction || selectedRasi.desc}`)}
                      className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition"
                      title="குரலில் கேட்க"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-200 leading-relaxed font-normal">
                {selectedRasi.prediction || selectedRasi.desc || 'இன்றைய நாள் உங்களுக்கு நன்மைகள் தரும் நன்னாளாக அமையும்.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
