import React from 'react';
import { 
  Youtube, 
  Instagram, 
  Facebook, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  Users, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flame
} from 'lucide-react';

const WhatsappIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SOCIAL_CHANNELS = [
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@AmazeTimes',
    stat: '250K+ சப்ஸ்கிரைபர்கள்',
    badge: 'வீடியோ & நேரலை',
    color: 'from-red-600 to-rose-700',
    iconBg: 'bg-red-600',
    hoverBorder: 'hover:border-red-500/60',
    url: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    cta: 'சந்தாதாரராகுக',
    icon: Youtube
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@amazetimes_official',
    stat: 'ரீல்ஸ்கள் & புகைப்படங்கள்',
    badge: 'வைரல் ரீல்ஸ்',
    color: 'from-purple-600 via-pink-600 to-amber-500',
    iconBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
    hoverBorder: 'hover:border-pink-500/60',
    url: 'https://www.instagram.com/amazetimes/?hl=en',
    cta: 'பின்தொடர்க',
    icon: Instagram
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'amazetimes',
    stat: '120K+ வாசகர்கள்',
    badge: 'அதிகாரப்பூர்வ பக்கம்',
    color: 'from-blue-600 to-blue-800',
    iconBg: 'bg-[#1877F2]',
    hoverBorder: 'hover:border-blue-500/60',
    url: 'https://www.facebook.com/amazetimes',
    cta: 'லைக் செய்க',
    icon: Facebook
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    handle: 'Amaze Times Channel',
    stat: 'உடனடிச் செய்தி எச்சரிக்கை',
    badge: 'நேரடி அப்டேட்',
    color: 'from-emerald-500 to-green-700',
    iconBg: 'bg-[#25D366]',
    hoverBorder: 'hover:border-emerald-500/60',
    url: 'https://whatsapp.com/channel/amazetimes',
    cta: 'இணைந்திடுக',
    icon: WhatsappIcon
  },
  {
    id: 'telegram',
    name: 'Telegram',
    handle: 'Amaze Times Tamil',
    stat: '60K+ உறுப்பினர்கள்',
    badge: 'அதிவேக செய்திகள்',
    color: 'from-sky-500 to-blue-600',
    iconBg: 'bg-[#229ED9]',
    hoverBorder: 'hover:border-sky-500/60',
    url: 'https://t.me/AmazeTimes',
    cta: 'குழுவில் இணைக',
    icon: TelegramIcon
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    handle: '@AmazeTimes',
    stat: '95K+ ஃபாலோயர்ஸ்',
    badge: 'டிரெண்டிங் தலைப்புகள்',
    color: 'from-slate-700 to-slate-900',
    iconBg: 'bg-slate-900',
    hoverBorder: 'hover:border-slate-500/60',
    url: 'https://twitter.com/AmazeTimes',
    cta: 'ஃபாலோ செய்க',
    icon: XIcon
  }
];

export default function SocialMediaStrip({ onNavigate }) {
  const handleRouteToHub = () => {
    if (onNavigate) {
      onNavigate('/social-media');
    } else {
      window.location.href = '/social-media';
    }
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-2.5 sm:px-4 my-6 font-tamil">
      <div className="bg-gradient-to-br from-[#0c162e] via-[#0b1326] to-[#070b18] rounded-3xl p-5 sm:p-7 border border-slate-800/80 shadow-xl relative overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-red-900/30 shrink-0">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-title font-bold text-white tracking-wide">
                  அமேஸ் டைம்ஸ் சமூக வலைப்பின்னல்
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                  <Flame className="w-3 h-3 text-red-500" /> 500K+ சமூகம்
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                உடனடி பிரேக்கிங் செய்திகள், நேரலை வீடியோக்கள் மற்றும் ரீல்ஸ்களை எங்கள் அதிகாரப்பூர்வ தளங்களில் காண்க.
              </p>
            </div>
          </div>

          <button
            onClick={handleRouteToHub}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-pink-500 text-white font-extrabold text-xs transition shadow-lg hover:shadow-pink-900/30 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <span>முழு சமூக ஊடக மையம் காண்க</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Social Channels Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          {SOCIAL_CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.id}
                className={`bg-[#0f1c38]/70 hover:bg-[#132244] border border-slate-800/90 ${ch.hoverBorder} rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group text-center relative`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl ${ch.iconBg} text-white flex items-center justify-center shadow-md mb-2.5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">{ch.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-full">
                    {ch.handle}
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 mt-1">
                    {ch.stat}
                  </span>
                </div>

                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-1.5 px-2 rounded-xl bg-slate-800/90 group-hover:bg-slate-700 text-white text-[11px] font-bold inline-flex items-center justify-center gap-1 transition shadow-xs"
                >
                  <span>{ch.cta}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Hub Strip */}
        <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>அனைத்து அதிகாரப்பூர்வ சமூக ஊடகக் கணக்குகளும் சரிபார்க்கப்பட்டவை (Official & Verified).</span>
          </div>
          <button
            onClick={handleRouteToHub}
            className="text-pink-400 hover:text-pink-300 font-bold inline-flex items-center gap-1 text-xs cursor-pointer transition hover:underline"
          >
            <span>வீடியோக்கள், ரீல்ஸ்கள் & நேரலைப் பதிவுகள் பார்க்க சமூக ஊடக மையத்திற்குச் செல்லவும் →</span>
          </button>
        </div>
      </div>
    </section>
  );
}

