import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { checkIsTodayBirthday } from '../../data/birthdayData';
import { shareBirthdayItem, downloadPosterImage } from '../../utils/birthdayShare';
import {
  Cake,
  PartyPopper,
  Sparkles,
  Heart,
  Share2,
  X,
  MapPin,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Globe,
  Download
} from 'lucide-react';

const YoutubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsappIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const BirthdayWishModal = () => {
  const {
    activeModal,
    closeModal,
    selectedBirthdayItem,
    incrementOfficialWishCount,
    showToast
  } = useApp();

  const [wished, setWished] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(false);
  const [copied, setCopied] = useState(false);

  if (activeModal !== 'birthdayDetail' || !selectedBirthdayItem) return null;

  const item = selectedBirthdayItem;
  const isTodayMatch = checkIsTodayBirthday(item);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amazetimes.in';
  const cardUrl = `${origin}/?birthday=${item.id}`;
  const posterImg = item.posterImage || item.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';
  const personName = item.name;
  const englishName = item.englishName || item.name;
  const whoHeIs = item.englishDesignation || item.designation || 'Dignitary';
  const englishWish =
    item.englishWishMessage ||
    `Warmest Birthday Greetings to ${englishName}, ${whoHeIs}! Wishing you good health, happiness, peace, and continued success.`;

  const handleWish = () => {
    if (wished) {
      showToast('நீங்கள் ஏற்கனவே உங்கள் வாழ்த்துகளைப் பதிவு செய்துவிட்டீர்கள்!');
      return;
    }
    setWished(true);
    incrementOfficialWishCount(item.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    showToast('📋 பிறந்தநாள் அட்டை இணைப்பு நகலெடுக்கப்பட்டது!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-b from-[#091538] via-[#09122c] to-[#040917] rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl border-2 border-amber-500/50 text-white space-y-5 max-h-[92vh] overflow-y-auto relative my-auto">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 blur-3xl pointer-events-none rounded-full"></div>

        {/* Modal Top Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider shadow">
              <Award className="w-3.5 h-3.5" />
              <span>பிறந்தநாள் வாழ்த்து அட்டை (Amaze Times Card)</span>
            </span>
            {isTodayMatch && (
              <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> இன்று பிறந்தநாள்!
              </span>
            )}
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Poster & Identity */}
        <div className="relative z-10 bg-[#040917]/90 p-4 sm:p-6 rounded-3xl border border-amber-500/30 flex flex-col items-center text-center space-y-4">
          <div
            className="relative group cursor-pointer max-w-full"
            onClick={() => setZoomedImage(!zoomedImage)}
            title={zoomedImage ? 'சுருக்குக (Click to minimize)' : 'பெரிதாக்குக (Click to expand)'}
          >
            <img
              src={posterImg}
              alt={personName}
              className={`rounded-2xl object-cover border-4 border-amber-400 shadow-2xl transition-all duration-300 mx-auto ${
                zoomedImage
                  ? 'max-h-[65vh] w-auto scale-100 shadow-[0_0_50px_rgba(251,191,36,0.3)]'
                  : 'w-48 h-64 sm:w-60 sm:h-80 group-hover:scale-[1.02]'
              }`}
            />
            <div className="absolute bottom-2 left-2 bg-black/80 hover:bg-black/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-amber-300 text-[10px] font-bold flex items-center gap-1.5 border border-amber-500/40 shadow-lg transition">
              {zoomedImage ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>சுருக்கு</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>முழு போஸ்டர் காண்க</span>
                </>
              )}
            </div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-full shadow-lg border border-slate-900">
              <Cake className="w-5 h-5 text-slate-950" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-lg">
            <h2 className="text-xl sm:text-3xl font-black text-amber-300 font-tamil leading-tight">
              {personName}
            </h2>
            {item.englishName && item.englishName !== personName && (
              <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                {item.englishName}
              </h3>
            )}
            <p className="text-sm sm:text-base font-bold text-amber-400 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{item.designation}</span>
            </p>
            {item.englishDesignation && (
              <p className="text-xs sm:text-sm text-slate-300 font-semibold font-sans italic">
                {item.englishDesignation}
              </p>
            )}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-300">
              {item.department && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-amber-400/80" /> {item.department}
                </span>
              )}
              {item.district && (
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400/80" /> {item.district}
                </span>
              )}
              <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> {item.dobDisplay || 'Birthday'}
              </span>
            </div>
          </div>
        </div>

        {/* English Wish Quote */}
        {englishWish && (
          <div className="relative z-10 bg-gradient-to-br from-[#0c1b47] to-[#07112f] p-4 sm:p-5 rounded-2xl border-2 border-amber-400/50 shadow-xl space-y-2">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>English Birthday Wish Caption</span>
              </span>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div className="text-slate-100 font-medium text-xs sm:text-sm leading-relaxed italic pl-3 border-l-2 border-amber-400 font-sans">
              "{englishWish}"
            </div>
          </div>
        )}

        {/* Tamil Wish Message */}
        {item.wishesMessage && (
          <div className="relative z-10 bg-[#050c22] p-4 rounded-2xl border border-amber-500/20 space-y-2">
            <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <PartyPopper className="w-3.5 h-3.5" /> தமிழ் வாழ்த்துச் செய்தி:
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed italic font-tamil">
              “{item.wishesMessage}”
            </p>
            <div className="pt-2 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-amber-200/80">
              <span>ஆசிரியர் குழு வாழ்த்துகள், அமேஸ் டைம்ஸ் (Amaze Times)</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> அதிகாரப்பூர்வ பதிவு
              </span>
            </div>
          </div>
        )}

        {/* Social Media Post Links Bar */}
        <div className="relative z-10 bg-[#060d24] p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="text-xs font-black text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>சமூக வலைத்தள பதிவுகள் (Official Social Posts):</span>
            </div>
            <p className="text-[11px] text-slate-300">இவரது பிறந்தநாள் தொடர்பாக வெளியிட்ட பதிவுகள்:</p>
          </div>
          <div className="flex items-center gap-2">
            {item.socialYoutubeUrl && (
              <a href={item.socialYoutubeUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow">
                <YoutubeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">YouTube</span>
              </a>
            )}
            {item.socialFacebookUrl && (
              <a href={item.socialFacebookUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow">
                <FacebookIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
            )}
            {item.socialInstagramUrl && (
              <a href={item.socialInstagramUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 transition shadow">
                <InstagramIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Instagram</span>
              </a>
            )}
            {item.socialWhatsappUrl && (
              <a href={item.socialWhatsappUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow">
                <WhatsappIcon className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Copy Link Bar */}
        <div className="relative z-10 bg-black/40 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left min-w-0 flex-1">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
              வாழ்த்து அட்டை நேரடி இணையதள முகவரி (Website Card Link):
            </span>
            <span className="text-xs text-slate-300 font-mono truncate block">{cardUrl}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'நகலெடுக்கப்பட்டது!' : 'இணைப்பை நகலெடு'}</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleWish}
            className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 ${
              wished
                ? 'bg-emerald-600/30 text-emerald-300 border-2 border-emerald-500/60'
                : 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/30'
            }`}
          >
            <Heart className={`w-4 h-4 ${wished ? 'fill-emerald-400 text-emerald-400' : 'fill-white text-white'}`} />
            <span>{wished ? 'வாழ்த்துகள் பதிவு செய்யப்பட்டது!' : 'வாழ்த்துகள் தெரிவிக்க'}</span>
            <span className="bg-black/40 text-amber-300 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
              {item.wishesCount || 0}
            </span>
          </button>

          <button
            onClick={() => shareBirthdayItem({ item, cardUrl, showToast })}
            className="py-3 px-4 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 cursor-pointer transition shadow"
            title="வாட்ஸ்அப்பில் பகிர்க"
          >
            <WhatsappIcon className="w-4 h-4" />
            <span>WhatsApp-ல் பகிர்க</span>
          </button>

          <button
            onClick={() => shareBirthdayItem({ item, cardUrl, showToast })}
            className="py-3 px-4 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition"
          >
            <Share2 className="w-4 h-4" />
            <span>பகிரவும்</span>
          </button>

          <button
            type="button"
            onClick={() => {
              downloadPosterImage(posterImg, `${(englishName || 'birthday').toLowerCase().replace(/[^a-z0-9]/g, '-')}-amazetimes-poster.jpg`);
              showToast('📥 போஸ்டர் படம் பதிவிறக்கப்படுகிறது!');
            }}
            className="py-3 px-4 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition shadow"
            title="போஸ்டர் படம் பதிவிறக்கு"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">போஸ்டர் பதிவிறக்கு</span>
          </button>

          <button
            onClick={closeModal}
            className="py-3 px-4 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center cursor-pointer transition"
          >
            மூடுக
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayWishModal;
