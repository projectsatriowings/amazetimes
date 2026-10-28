import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { defaultBirthdayWishes, checkIsTodayBirthday } from '../data/birthdayData';
import { Award, Heart, Sparkles, Calendar, ChevronRight, Building2, Cake, PartyPopper } from 'lucide-react';

export const GovernmentBirthdaySection = () => {
  const { birthdayWishes, incrementOfficialWishCount, openBirthdayModal, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('today');
  const [wishedIds, setWishedIds] = useState([]);

  const list = birthdayWishes && birthdayWishes.length > 0 ? birthdayWishes : defaultBirthdayWishes;
  const activeOfficials = list.filter((item) => item.isActive !== false);
  const todayOfficials = activeOfficials.filter((item) => checkIsTodayBirthday(item));
  const displayedList = activeTab === 'today' ? todayOfficials : activeOfficials;

  const handleSendWish = (id, e) => {
    e.stopPropagation();
    if (wishedIds.includes(id)) {
      showToast('நீங்கள் ஏற்கனவே உங்கள் வாழ்த்துகளைத் தெரிவித்துவிட்டீர்கள்!');
      return;
    }
    setWishedIds((prev) => [...prev, id]);
    incrementOfficialWishCount(id);
  };

  return (
    <section className="bg-gradient-to-r from-[#060c21] via-[#0a1945] to-[#0d1e4c] rounded-3xl p-5 sm:p-8 border-2 border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 blur-3xl pointer-events-none rounded-full"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/30 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest">
            <Award className="w-4 h-4 text-amber-400" /> தலைவர்கள் & அரசு அதிகாரிகள் வாழ்த்து அரங்கம்
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white font-tamil flex items-center gap-2.5">
            <span>பிறந்தநாள் நல்வாழ்த்துகள்</span>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Cake className="w-7 h-7 text-amber-400" />
              <PartyPopper className="w-6 h-6 text-amber-400" />
            </div>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-amber-500/30 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>இன்று பிறந்தநாள் ({todayOfficials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>அனைத்து தலைவர்கள் ({activeOfficials.length})</span>
          </button>
        </div>
      </div>

      {displayedList.length === 0 ? (
        <div className="relative z-10 text-center py-10 bg-black/30 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <Cake className="w-10 h-10 text-amber-500/50 mx-auto" />
          <p className="text-sm font-medium">இன்று பிறந்தநாள் பதிவுகள் ஏதுமில்லை. அனைத்துப் பதிவுகளைக் காண மேலே உள்ள பொத்தானைக் கிளிக் செய்யவும்.</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.map((item) => {
            const isToday = checkIsTodayBirthday(item);
            const isWished = wishedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => openBirthdayModal(item)}
                className="bg-[#04091a]/90 hover:bg-[#060e28] rounded-2xl p-4 border border-amber-500/30 hover:border-amber-400 transition-all duration-300 shadow-xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={item.posterImage || item.photo}
                      alt={item.name}
                      className="w-16 h-20 rounded-xl object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition duration-300"
                    />
                    {isToday && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse border border-slate-950">
                        இன்று!
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-sm sm:text-base font-black text-white font-tamil group-hover:text-amber-300 transition truncate">
                      {item.name}
                    </h3>
                    {item.englishName && item.englishName !== item.name && (
                      <p className="text-xs text-slate-300 font-sans truncate -mt-0.5">
                        {item.englishName}
                      </p>
                    )}
                    <p className="text-xs font-bold text-amber-400 truncate">{item.designation}</p>
                    {item.department && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-500 shrink-0" /> {item.department}
                      </p>
                    )}
                    <p className="text-[11px] text-amber-300/80 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-amber-400 shrink-0" /> {item.dobDisplay}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSendWish(item.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isWished
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-emerald-400 text-emerald-400' : 'fill-white text-white'}`} />
                    <span>{isWished ? 'வாழ்த்தப்பட்டது' : 'வாழ்த்துக்கள்'}</span>
                    <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono">{item.wishesCount || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openBirthdayModal(item)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
                  >
                    <span>முழு அட்டை</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default GovernmentBirthdaySection;
