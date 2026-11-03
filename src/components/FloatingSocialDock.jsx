import React, { useState } from 'react';
import { 
  Youtube, 
  Instagram, 
  Facebook, 
  Share2, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink,
  MessageCircle,
  Flame,
  Sparkles
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

const SIDE_SOCIAL_ITEMS = [
  {
    id: 'whatsapp',
    title: 'வாட்ஸ்அப் சேனல்',
    stat: 'உடனடிச் செய்தி',
    url: 'https://whatsapp.com/channel/amazetimes',
    icon: WhatsappIcon,
    bgColor: 'bg-[#25D366]',
    hoverBg: 'hover:bg-[#20ba5a]',
    textColor: 'text-white',
    hasPulse: true,
    shadow: 'shadow-emerald-500/30'
  },
  {
    id: 'youtube',
    title: 'YouTube நேரலை',
    stat: '250K+ சப்ஸ்கிரைபர்ஸ்',
    url: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    icon: Youtube,
    bgColor: 'bg-[#FF0000]',
    hoverBg: 'hover:bg-[#cc0000]',
    textColor: 'text-white',
    hasPulse: false,
    shadow: 'shadow-red-500/30'
  },
  {
    id: 'instagram',
    title: 'Instagram ரீல்ஸ்',
    stat: '@amazetimes_official',
    url: 'https://www.instagram.com/amazetimes/?hl=en',
    icon: Instagram,
    bgColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
    hoverBg: 'hover:opacity-95',
    textColor: 'text-white',
    hasPulse: false,
    shadow: 'shadow-pink-500/30'
  },
  {
    id: 'facebook',
    title: 'Facebook பக்கம்',
    stat: '120K+ வாசகர்கள்',
    url: 'https://www.facebook.com/amazetimes',
    icon: Facebook,
    bgColor: 'bg-[#1877F2]',
    hoverBg: 'hover:bg-[#1464cc]',
    textColor: 'text-white',
    hasPulse: false,
    shadow: 'shadow-blue-500/30'
  },
  {
    id: 'telegram',
    title: 'Telegram குழு',
    stat: '60K+ உறுப்பினர்கள்',
    url: 'https://t.me/AmazeTimes',
    icon: TelegramIcon,
    bgColor: 'bg-[#229ED9]',
    hoverBg: 'hover:bg-[#1c82b3]',
    textColor: 'text-white',
    hasPulse: false,
    shadow: 'shadow-sky-500/30'
  },
  {
    id: 'twitter',
    title: 'X (Twitter)',
    stat: '@AmazeTimes',
    url: 'https://twitter.com/AmazeTimes',
    icon: XIcon,
    bgColor: 'bg-black',
    hoverBg: 'hover:bg-slate-900',
    textColor: 'text-white',
    hasPulse: false,
    shadow: 'shadow-slate-900/30'
  }
];

export default function FloatingSocialDock({ onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      aria-label="சமூக ஊடக நேரடிப் பட்டை" 
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center select-none font-tamil print:hidden"
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-5 h-9 bg-slate-900/90 hover:bg-slate-800 text-amber-400 rounded-l-md flex items-center justify-center border-y border-l border-slate-700/80 shadow-md cursor-pointer transition -mr-0.5"
        title={isCollapsed ? "சமூக ஊடகப் பட்டையைக் காட்டு" : "மறை"}
      >
        {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* Dock Column */}
      <div 
        className={`flex flex-col items-end gap-1.5 transition-all duration-300 ${
          isCollapsed ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}
      >
        {/* Full Hub Navigator Pill at Top of Dock */}
        <button
          onClick={() => onNavigate ? onNavigate('/social-media') : (window.location.href = '/social-media')}
          className="group relative flex items-center bg-gradient-to-l from-red-600 via-pink-600 to-purple-600 text-white rounded-l-2xl shadow-xl hover:shadow-pink-500/30 cursor-pointer overflow-hidden transition-all duration-300 hover:pr-4 pr-2.5 pl-3 py-2 border-y border-l border-white/20"
          title="அதிகாரப்பூர்வ சமூக ஊடக மையம்"
        >
          {/* Slide-out tooltip label */}
          <div className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap mr-2 flex flex-col text-right">
            <span className="text-[11px] font-black leading-tight text-white">சமூக ஊடக மையம்</span>
            <span className="text-[9px] text-pink-200 font-bold">அனைத்து வீடியோக்கள் 🚀</span>
          </div>

          <div className="flex items-center justify-center w-7 h-7 shrink-0">
            <Share2 className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          </div>
        </button>

        {/* 6 Branded Social Channel Links */}
        {SIDE_SOCIAL_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center ${item.bgColor} ${item.hoverBg} ${item.textColor} rounded-l-2xl shadow-lg ${item.shadow} cursor-pointer transition-all duration-200 hover:-translate-x-1.5 pr-2.5 pl-3 py-2 border-y border-l border-white/15`}
            >
              {/* Pulsing Beacon for WhatsApp */}
              {item.hasPulse && (
                <span className="absolute -top-1 -left-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                </span>
              )}

              {/* Slide-out label on hover */}
              <div className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap mr-2 flex flex-col text-right">
                <span className="text-[11px] font-black leading-tight text-white">{item.title}</span>
                <span className="text-[9px] text-white/80 font-bold">{item.stat}</span>
              </div>

              {/* Icon Container */}
              <div className="flex items-center justify-center w-7 h-7 shrink-0">
                <Icon className="w-4 h-4 text-white group-hover:scale-115 transition-transform" />
              </div>
            </a>
          );
        })}
      </div>
    </aside>
  );
}

