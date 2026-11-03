import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUp, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Newspaper, 
  MessageSquare, 
  Video, 
  Share2, 
  Youtube, 
  Instagram, 
  Facebook, 
  ExternalLink 
} from 'lucide-react';

const WhatsappIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const XIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Footer({ onSelectCategory, onOpenEPaper, onOpenBookmarks, onSpeak, onToast, onNavigate }) {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email && email.includes('@')) {
      onToast(`நன்றி! உங்கள் மின்னஞ்சல் (${email}) வெற்றிகரமாகப் பதிவு செய்யப்பட்டது.`, 'check');
      setEmail('');
    } else {
      onToast('தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.', 'error');
    }
  };

  const socialLinks = [
    {
      name: 'YouTube',
      handle: '@AmazeTimes',
      stats: '250K+ சந்தாதாரர்கள்',
      url: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
      icon: Youtube,
      color: 'bg-red-600/15 hover:bg-red-600 text-red-500 hover:text-white border-red-500/30 hover:border-red-600'
    },
    {
      name: 'Instagram',
      handle: '@amazetimes_official',
      stats: 'ரீல்ஸ்கள் & வீடியோக்கள்',
      url: 'https://www.instagram.com/amazetimes/?hl=en',
      icon: Instagram,
      color: 'bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-500/15 hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-pink-400 hover:text-white border-pink-500/30 hover:border-transparent'
    },
    {
      name: 'Facebook',
      handle: 'amazetimes',
      stats: 'நேரலைப் பதிவுகள்',
      url: 'https://www.facebook.com/amazetimes',
      icon: Facebook,
      color: 'bg-blue-600/15 hover:bg-[#1877F2] text-blue-400 hover:text-white border-blue-500/30 hover:border-[#1877F2]'
    },
    {
      name: 'WhatsApp',
      handle: 'Amaze Times Channel',
      stats: 'உடனடிச் செய்திகள்',
      url: 'https://whatsapp.com/channel/amazetimes',
      icon: WhatsappIcon,
      color: 'bg-emerald-600/15 hover:bg-[#25D366] text-emerald-400 hover:text-white border-emerald-500/30 hover:border-[#25D366]'
    },
    {
      name: 'Telegram',
      handle: 'Amaze Times Tamil',
      stats: '60K+ வாசகர்கள்',
      url: 'https://t.me/AmazeTimes',
      icon: TelegramIcon,
      color: 'bg-sky-600/15 hover:bg-[#229ED9] text-sky-400 hover:text-white border-sky-500/30 hover:border-[#229ED9]'
    },
    {
      name: 'X (Twitter)',
      handle: '@AmazeTimes',
      stats: '95K+ ஃபாலோவர்ஸ்',
      url: 'https://twitter.com/AmazeTimes',
      icon: XIcon,
      color: 'bg-slate-800 hover:bg-black text-slate-300 hover:text-white border-slate-700 hover:border-slate-500'
    }
  ];

  return (
    <footer className="bg-[#070d1e] text-slate-300 text-xs border-t border-slate-800 mt-12 sm:mt-16 transition-all shadow-2xl w-full max-w-full overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 pt-8 sm:pt-10 pb-24 sm:pb-8 space-y-8 sm:space-y-10 w-full min-w-0">
        
        {/* Newsletter & WhatsApp Community Subscription Ribbon */}
        <div className="bg-gradient-to-r from-[#0a1945] via-[#0e2a7a] to-[#0a1945] border border-amber-400/20 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 overflow-hidden">
          <div className="flex items-start sm:items-center gap-4 w-full min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
              <Newspaper className="w-6 h-6 text-slate-950" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="font-title font-black text-base sm:text-lg text-white flex flex-wrap items-center gap-2">
                <span>செய்திகளை உடனுக்குடன் பெற சந்தாதாரராகுங்கள்!</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  இலவசம்
                </span>
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                தமிழ்நாடு, வணிகம், தங்கம் விலை மற்றும் முக்கிய நிகழ்வுகள் உங்கள் மின்னஞ்சலுக்கு உடனுக்குடன் அனுப்பப்படும்.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="உங்கள் மின்னஞ்சல் முகவரி..."
              className="w-full sm:flex-1 lg:w-64 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleSubscribe}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>இணையுங்கள்</span>
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* 4-Column Editorial Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand, Registration & High Visibility Social Icons */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-2xl shadow-md border border-slate-700 flex items-center justify-center">
                <img src="/amaze-times-logo.webp" alt="அமேஸ் டைம்ஸ்" width="48" height="64" className="h-10 w-auto object-contain rounded-xl" />
              </div>
              <div className="flex flex-col">
                <span className="font-title font-black text-xl text-white">அமேஸ் டைம்ஸ்</span>
                <span className="text-[10px] text-amber-400 font-bold">உண்மையின் தீரக் குரல்</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              நம்பகமான, துல்லியமான மற்றும் நடுநிலையான செய்திகளை 24 மணி நேரமும் உடனுக்குடன் வழங்கும் முன்னணி தமிழ் டிஜிட்டல் நாளிதழ் தளம்.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>மத்திய அரசு பத்திரிகைப் பதிவு:</span>
              </p>
              <p className="font-mono text-slate-200">பதிவு எண்: 2023/88656</p>
            </div>

            {/* High Visibility Social Media Network Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>சமூக ஊடகங்களில் பின்தொடரவும்:</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  Live
                </span>
              </div>

              {/* 6 High-Visibility Branded Social Media Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-sm hover:scale-110 active:scale-95 group relative cursor-pointer ${item.color}`}
                      title={`${item.name} - ${item.handle} (${item.stats})`}
                    >
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>

              {/* Main Social Media Hub Route Button */}
              <div className="pt-1">
                <button
                  onClick={() => onNavigate ? onNavigate('/social-media') : (window.location.href = '/social-media')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-950/40 cursor-pointer hover:scale-105 active:scale-95 border border-white/20"
                  title="அனைத்து அதிகாரப்பூர்வ சமூக ஊடகப் பதிவுகளையும் பார்க்க"
                >
                  <Share2 className="w-4 h-4 text-white animate-pulse" />
                  <span>சமூக ஊடக மையம் (Social Media Hub)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                </button>
              </div>
            </div>
          </div>

          {/* Col 2: Major News Sections */}
          <div className="space-y-3">
            <h4 className="font-title font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-red-500" />
              <span>செய்திப் பிரிவுகள்</span>
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><button onClick={() => onSelectCategory('tamilnadu')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› தமிழ்நாடு செய்திகள்</button></li>
              <li><button onClick={() => onSelectCategory('districts')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› மாவட்டச் செய்திகள்</button></li>
              <li><button onClick={() => onSelectCategory('business')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› வணிகம் & பங்குச்சந்தை</button></li>
              <li><button onClick={() => onSelectCategory('spiritual')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› ஆன்மிகம் & திருத்தலங்கள்</button></li>
              <li><button onClick={() => onSelectCategory('cinema')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› சினிமா & கலை உலகம்</button></li>
              <li><button onClick={() => onSelectCategory('sports')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› விளையாட்டு & ஐபிஎல்</button></li>
            </ul>
          </div>

          {/* Col 3: Special Services & Direct Social Route */}
          <div className="space-y-3">
            <h4 className="font-title font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>சிறப்பு சேவைகள்</span>
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate ? onNavigate('/social-media') : (window.location.href = '/social-media')} 
                  className="text-pink-400 hover:text-pink-300 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  › சமூக ஊடக மையம் (Social Hub 🚀)
                </button>
              </li>
              <li><button onClick={onOpenEPaper} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› அமேஸ் இ-பேப்பர் (E-Paper)</button></li>
              <li><button onClick={() => onSelectCategory('magazine')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› மாதாந்திர டிஜிட்டல் இதழ்</button></li>
              <li><button onClick={() => onSpeak('அமேஸ் டைம்ஸ் குரல் செய்திகள் இயக்கப்படுகின்றன.')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› AI செய்தி வாசிப்பாளர் (Audio)</button></li>
              <li><button onClick={onOpenBookmarks} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› சேமித்த செய்திகள் (Bookmarks)</button></li>
              <li><button onClick={() => onSelectCategory('editorial')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› தலையங்கம் & பார்வை</button></li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-3">
            <h4 className="font-title font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>தலையங்க அலுவலகம்</span>
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <button
                  type="button"
                  onClick={() => {
                    const u = 'editor';
                    const d = 'amazetimes.com';
                    window.location.href = `mailto:${u}@${d}`;
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left font-medium"
                  title="ஆசிரியரைத் தொடர்பு கொள்ள"
                >
                  ஆசிரியர் மின்னஞ்சல் (தொடர்புக்கு)
                </button>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+91 44 2834 9000</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>தலைமை அலுவலகம், சென்னை, தமிழ்நாடு</span>
              </p>
            </div>
          </div>

        </div>

        {/* Global Social Community Strip Across All 6 Channels */}
        <div className="bg-gradient-to-r from-blue-950/60 via-purple-950/40 to-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-title font-bold text-sm text-white flex items-center gap-2 justify-center sm:justify-start">
                <span>அமேஸ் டைம்ஸ் சமூக ஊடகக் குடும்பம்</span>
                <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase">Official</span>
              </h4>
              <p className="text-slate-400 text-xs">YouTube, Facebook, Instagram, WhatsApp, Telegram மற்றும் X பக்கங்களில் உடனடியாக இணைந்திருங்கள்.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold transition shadow-sm"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube 250K+</span>
            </a>
            <a
              href="https://www.instagram.com/amazetimes/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600/15 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 text-pink-400 hover:text-white border border-pink-500/30 text-xs font-bold transition shadow-sm"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Insta Reels</span>
            </a>
            <a
              href="https://whatsapp.com/channel/amazetimes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-[#25D366] text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition shadow-sm"
            >
              <WhatsappIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => onNavigate ? onNavigate('/social-media') : (window.location.href = '/social-media')}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-xs transition shadow cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>முழு தளம் காண்க →</span>
            </button>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Amaze Times (அமேஸ் டைம்ஸ்). அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. •{' '}
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/admin');
              }}
              className="text-slate-400 hover:text-amber-400 underline underline-offset-2 transition-colors cursor-pointer font-bold"
            >
              பணியாளர் & நிருபர் உள்நுழைவு (நிர்வாகம்)
            </a>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-slate-800 hover:bg-[#0e2a7a] text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <span>மேலே செல்ல</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
