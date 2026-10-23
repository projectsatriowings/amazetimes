import React, { useState } from 'react';
import { X, Heart, Share2, Sparkles, Send, CheckCircle2, MessageCircle } from 'lucide-react';

export default function BirthdayWishModal({ official, isOpen, onClose, onWishAdded, onToast }) {
  if (!isOpen || !official) return null;

  const [readerName, setReaderName] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [hasWished, setHasWished] = useState(false);
  const [wishesCount, setWishesCount] = useState(official.wishes_count || official.wishesCount || 150);

  const handleWishSubmit = (e) => {
    e.preventDefault();
    setWishesCount(prev => prev + 1);
    setHasWished(true);
    if (onWishAdded) onWishAdded(official.id);
    if (onToast) onToast('உங்கள் மனமார்ந்த வாழ்த்து பதிவு செய்யப்பட்டது! 🎉');
  };

  const generateWhatsAppShare = () => {
    const greeting = customMsg.trim() || official.greeting_text || official.greetingText || 'இனிய பிறந்தநாள் நல்வாழ்த்துகள்!';
    const sender = readerName.trim() ? `\nவாழ்த்துபவர்: ${readerName}` : '';
    const shareText = `🎂 *${official.name} அவர்களுக்கு இனிய பிறந்தநாள் நல்வாழ்த்துகள்!* 💐\n\n"${greeting}"${sender}\n\n📰 *அமேஸ் டைம்ஸ் - தமிழ் செய்திகள் நாளிதழ்*\n👉 வாழ்த்துக் கார்டு: ${window.location.origin}\n📺 யூடியூப்: https://www.youtube.com/@AmazeTimes\n📸 இன்ஸ்டாகிராம்: https://www.instagram.com/amazetimes\n💬 வாட்ஸ்அப் சேனல்: https://whatsapp.com/channel/amazetimes`;

    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#0c1427] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl w-full max-w-lg text-slate-900 dark:text-slate-100 relative font-tamil animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 p-4 sm:p-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-2.5 z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">பிறந்தநாள் வாழ்த்து அட்டை</h3>
              <p className="text-xs text-amber-100">அமேஸ் டைம்ஸ் வாசகர்கள் வாழ்த்து மையம்</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* VIP Card Preview */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-2xl p-4 border border-amber-500/20 flex items-center gap-4">
            <div className="relative">
              <img
                src={official.photo_url || official.photoUrl}
                alt={official.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                🎂
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                {official.name}
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                {official.designation}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>தேதி: {official.date_display || official.dateDisplay}</span>
                <span>•</span>
                <span className="text-red-600 dark:text-red-400 font-black flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-red-600" />
                  {wishesCount} வாழ்த்துகள்
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          {!hasWished ? (
            <form onSubmit={handleWishSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  உங்கள் பெயர் (விருப்பப்பட்டால்):
                </label>
                <input
                  type="text"
                  value={readerName}
                  onChange={e => setReaderName(e.target.value)}
                  placeholder="உதாரணம்: க. அன்பரசன், சென்னை"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  உங்கள் வாழ்த்துச் செய்தி:
                </label>
                <textarea
                  rows="3"
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  placeholder={official.greeting_text || official.greetingText || 'மனமார்ந்த பிறந்தநாள் நல்வாழ்த்துகள்!'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-slate-950" />
                <span>வாழ்த்து தெரிவிக்க (Send Birthday Wish)</span>
              </button>
            </form>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                வாழ்த்து வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                உங்கள் வாழ்த்து அமேஸ் டைம்ஸ் வாழ்த்துப் பலகையில் சேர்க்கப்பட்டது.
              </p>
            </div>
          )}

          {/* Social Share Formatter Bar */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center">
              வாட்ஸ்அப் மற்றும் சமூக ஊடகங்களில் பகிருங்கள்:
            </p>
            <button
              type="button"
              onClick={generateWhatsAppShare}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>வாட்ஸ்அப்பில் பகிர்க (WhatsApp Formatted Card)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
