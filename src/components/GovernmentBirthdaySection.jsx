import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Share2, Award, Calendar, ChevronRight, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import BirthdayWishModal from './BirthdayWishModal';

export default function GovernmentBirthdaySection({ onToast }) {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOfficials = async () => {
      try {
        const res = await api.getBirthdayOfficials();
        if (isMounted && res && res.success && Array.isArray(res.officials)) {
          setOfficials(res.officials);
        }
      } catch (err) {
        console.warn('Birthday officials load fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOfficials();
    return () => { isMounted = false; };
  }, []);

  const handleQuickWish = async (id, e) => {
    e.stopPropagation();
    try {
      setOfficials(prev => prev.map(o => o.id === id ? { ...o, wishes_count: (o.wishes_count || 150) + 1 } : o));
      await api.wishBirthdayOfficial(id);
      if (onToast) onToast('உங்கள் மனமார்ந்த வாழ்த்து பதிவு செய்யப்பட்டது! 🎉');
    } catch (_) {}
  };

  const handleShareOfficial = (official, e) => {
    e.stopPropagation();
    const shareText = `🎂 *${official.name} அவர்களுக்கு இனிய பிறந்தநாள் நல்வாழ்த்துகள்!* 💐\n\n"${official.greeting_text || 'மக்கள் பணியில் தொடர வாழ்த்துகள்!'}"\n\n📰 *அமேஸ் டைம்ஸ் - தமிழ் செய்திகள் நாளிதழ்*\n👉 வாழ்த்துக் கார்டு: ${window.location.origin}\n📺 யூடியூப்: https://www.youtube.com/@AmazeTimes\n📸 இன்ஸ்டாகிராம்: https://www.instagram.com/amazetimes\n💬 வாட்ஸ்அப் சேனல்: https://whatsapp.com/channel/amazetimes`;
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  if (!officials || officials.length === 0) return null;

  return (
    <section className="w-full bg-white dark:bg-[#0c1427] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm font-tamil space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                தமிழக தலைவர்கள் & பிரமுகர்கள் பிறந்தநாள் வாழ்த்து அரங்கம்
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                சிறப்பு வாழ்த்துகள் 💐
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              மக்கள் தலைவர்கள் மற்றும் சாதனையாளர்களுக்கு அமேஸ் டைம்ஸ் வாசகர்களின் நெஞ்சார்ந்த வாழ்த்துகள்
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30 self-start sm:self-auto">
          வாசகர்கள் வாழ்த்து மையம்
        </span>
      </div>

      {/* Officials Celebration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {officials.map(official => (
          <div
            key={official.id}
            className="bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent rounded-3xl p-5 border border-amber-500/20 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Ambient Corner Sparkle */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="space-y-4">
              
              {/* Photo & Badge Row */}
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={official.photo_url || official.photoUrl}
                    alt={official.name}
                    width="80"
                    height="96"
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-24 rounded-2xl object-cover border-2 border-amber-500 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-xs px-1.5 py-0.5 rounded-full font-black shadow">
                    🎂
                  </span>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{official.date_display || official.dateDisplay}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {official.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {official.designation}
                  </p>
                </div>
              </div>

              {/* Greeting Quote */}
              <div className="bg-white/80 dark:bg-[#0c1427]/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{official.greeting_text || official.greetingText || 'மக்கள் சேவையில் மென்மேலும் சிறக்க மனமார்ந்த வாழ்த்துகள்!'}"
              </div>

            </div>

            {/* Actions Bar */}
            <div className="pt-4 mt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
              
              {/* Wish Button */}
              <button
                onClick={(e) => handleQuickWish(official.id, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-black text-xs hover:bg-red-100 transition-colors border border-red-500/30 cursor-pointer"
                title="வாழ்த்துகள் தெரிவிக்க"
              >
                <Heart className="w-3.5 h-3.5 fill-red-600" />
                <span>{official.wishes_count || 150} வாழ்த்துகள்</span>
              </button>

              <div className="flex items-center gap-1.5">
                {/* Custom Wish Modal Trigger */}
                <button
                  onClick={() => {
                    setSelectedOfficial(official);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer"
                >
                  வாழ்த்துக் கடிதம்
                </button>

                {/* Direct WhatsApp Share */}
                <button
                  onClick={(e) => handleShareOfficial(official, e)}
                  className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
                  title="வாட்ஸ்அப்பில் பகிர்க"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* Birthday Wish Modal */}
      {selectedOfficial && (
        <BirthdayWishModal
          official={selectedOfficial}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOfficial(null);
          }}
          onWishAdded={(id) => {
            setOfficials(prev => prev.map(o => o.id === id ? { ...o, wishes_count: (o.wishes_count || 150) + 1 } : o));
          }}
          onToast={onToast}
        />
      )}

    </section>
  );
}
