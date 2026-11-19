import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Zap, TrendingUp, Coins, Fuel, Calculator, BarChart3, Pause, Play } from 'lucide-react';

export default function Ticker({ tickers = [], onOpenArticle, onOpenGoldCalculator }) {
  const [isPaused, setIsPaused] = useState(false);
  const [marketRates, setMarketRates] = useState({
    gold22k: { label: 'தங்கம் (22K)', price: '₹13,135/கி', sovereign: '₹1,05,080', change: '+₹50', isPositive: true },
    gold24k: { label: 'தங்கம் (24K)', price: '₹14,329/கி', sovereign: '₹1,14,632', change: '+₹54', isPositive: true },
    silver: { label: 'வெள்ளி', price: '₹220/கி', kg: '₹2,20,000/கிலோ', change: '+₹0', isPositive: true },
    petrol: { label: 'பெட்ரோல்', price: '₹100.75/லி', change: '0.00', isPositive: true },
    diesel: { label: 'டீசல்', price: '₹92.34/லி', change: '0.00', isPositive: true },
    sensex: { label: 'சென்செக்ஸ்', price: '73,598.67', change: '▼ -0.01%', isPositive: false },
    nifty: { label: 'நிஃப்டி', price: '22,749.75', change: '▼ -0.02%', isPositive: false },
    updatedAt: 'GoodReturns சென்னை நேரலை'
  });
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMarketRates = async () => {
      try {
        setIsLiveUpdating(true);
        const res = await api.getMarketRates();
        if (isMounted && res.success && res.data) {
          setMarketRates(prev => ({
            ...prev,
            ...res.data
          }));
        }
      } catch (err) {
        console.warn('Market rates live fetch fallback:', err.message);
      } finally {
        if (isMounted) setIsLiveUpdating(false);
      }
    };

    loadMarketRates();
    const interval = setInterval(loadMarketRates, 3 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const defaultTickers = [
    { id: 377, article_id: 377, content: 'இஸ்ரேல் நிறுவனத்துடன் ரூ.1,976 கோடி மதிப்பிலான பாதுகாப்பு ஒப்பந்தம் மேற்கொண்ட இந்தியா!', link_url: '/news/377' },
    { id: 376, article_id: 376, content: 'வங்கக்கடலில் தீவிரப் புயலாக வலுப்பெற்ற அக்வான்: ஆந்திரா, ஒடிசா கடலோரப் பகுதிகளுக்கு எச்சரிக்கை!', link_url: '/news/376' },
    { id: 375, article_id: 375, content: 'இந்தியாவில் ₹10 கோடியைக் கடந்த அவெஞ்சர்ஸ் டூம்ஸ்டே முன்பதிவு – வசூலில் புதிய சாதனை வேகம்!', link_url: '/news/375' },
    { id: 366, article_id: 366, content: 'ஐபிஎல் போட்டிகளில் இருந்து வீரராக ஓய்வு பெற்றார் எம்.எஸ். தோனி: சிஎஸ்கே அணியின் தலைமை வழிகாட்டியாக நியமனம்!', link_url: '/news/366' },
    { id: 369, article_id: 369, content: '20 வயதில் அறிமுக டெஸ்டில் சதம் மற்றும் 7 விக்கெட்டுகள் வீழ்த்தி ஆப்கானிஸ்தான் வீரர் நசீர் கான் உலக சாதனை!', link_url: '/news/369' }
  ];

  const activeTickers = (tickers && tickers.length > 0) ? tickers : defaultTickers;

  const handleTickerClick = (t) => {
    if (!t) return;
    if (onOpenArticle) {
      const artId = t.article_id || (typeof t.id === 'number' ? t.id : null);
      if (artId) {
        onOpenArticle({ id: artId, title: t.title || t.content, category: t.category });
        return;
      }
      if (t.link_url && t.link_url.startsWith('/news/')) {
        const parts = t.link_url.split('/news/');
        if (parts[1] && !isNaN(parts[1])) {
          onOpenArticle({ id: parseInt(parts[1], 10), title: t.title || t.content });
          return;
        }
      }
      // If object itself
      onOpenArticle(t);
    } else if (t.link_url) {
      window.location.href = t.link_url;
    }
  };

  const durationSeconds = Math.max(80, activeTickers.length * 15);
  // Duplicate list once to achieve seamless 0% -> -50% infinite conveyor belt
  const marqueeList = [...activeTickers, ...activeTickers];

  return (
    <div className="space-y-2 max-w-[1400px] mx-auto px-2.5 sm:px-4 mt-2 mb-2 w-full max-w-full min-w-0 overflow-hidden font-tamil">
      
      {/* 1. BREAKING NEWS FLASH MARQUEE (Calm Reading Pace + Pause/Play + Clickable Live Links) */}
      <div className="bg-white dark:bg-[#0d1627] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-1 sm:p-1.5 flex items-center gap-2 overflow-hidden w-full max-w-full min-w-0 group/ticker">
        
        {/* Flash Badge & Play/Pause Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="bg-red-600 text-white font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 uppercase text-[10px] sm:text-[11px] shadow-sm tracking-wider">
            <Zap className="w-3.5 h-3.5 text-white fill-white animate-bounce" />
            <span>முக்கியச் செய்தி</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPaused(prev => !prev)}
            className="p-1 sm:p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center"
            title={isPaused ? "செய்தி ஓட்டத்தைத் தொடர்க (Play)" : "செய்தி ஓட்டத்தை நிறுத்து (Pause)"}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            )}
          </button>
        </div>

        {/* Marquee Ticker with Clickable Articles */}
        <div className="overflow-hidden relative flex-1 min-w-0">
          <div
            className="whitespace-nowrap inline-flex items-center animate-marquee group-hover/ticker:[animation-play-state:paused] text-[#0a1945] dark:text-amber-300 font-extrabold text-xs sm:text-[13px] py-0.5"
            style={{
              animationDuration: `${durationSeconds}s`,
              animationPlayState: isPaused ? 'paused' : undefined
            }}
          >
            {marqueeList.map((item, idx) => (
              <span key={`${item.id || item.article_id || 'ticker'}-${idx}`} className="inline-flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleTickerClick(item)}
                  className="hover:underline hover:text-red-600 dark:hover:text-amber-200 transition cursor-pointer text-left focus:outline-none"
                  title="செய்தியைப் படிக்க கிளிக் செய்யவும்"
                >
                  {item.content || item.title}
                </button>
                <span className="mx-3.5 text-red-500 font-bold select-none text-[11px]">✦</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* 2. REAL-TIME COMMODITIES & MARKET RIBBON */}
      <div className="bg-white dark:bg-[#0d1627] rounded-2xl px-3 sm:px-3.5 py-2 shadow-xs border border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-x-auto scrollbar-none gap-3 sm:gap-4 text-xs font-bold w-full max-w-full min-w-0 touch-pan-x">
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2 text-[#0e2a7a] dark:text-amber-400 whitespace-nowrap font-black text-xs flex-shrink-0">
          <span className={`w-2.5 h-2.5 rounded-full ${isLiveUpdating ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span>நேரலை வணிகம்:</span>
        </div>

        {/* Live Commodity Items */}
        <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap text-[11px] sm:text-xs">
          
          {/* Gold 22K */}
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">தங்கம் (22K):</span>
            <span className="font-black text-red-600 dark:text-amber-400">
              {marketRates.gold22k?.price || '₹13,135/கி'} ({marketRates.gold22k?.sovereign || '₹1,05,080'})
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Silver */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">வெள்ளி:</span>
            <span className="font-black text-slate-700 dark:text-slate-300">
              {marketRates.silver?.price || '₹220/கி'}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Fuel */}
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">பெட்ரோல்:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {marketRates.petrol?.price || '₹100.75/லி'}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Sensex */}
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">சென்செக்ஸ்:</span>
            <span className={`font-black flex items-center gap-0.5 ${marketRates.sensex?.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
              {marketRates.sensex?.price || '73,598.67'} {marketRates.sensex?.isPositive ? '▲' : '▼'}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Nifty */}
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">நிஃப்டி:</span>
            <span className={`font-black flex items-center gap-0.5 ${marketRates.nifty?.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
              {marketRates.nifty?.price || '22,749.75'} {marketRates.nifty?.isPositive ? '▲' : '▼'}
            </span>
          </div>

        </div>

        {/* Quick Calculator Launcher - Royal Blue with Yellow Text */}
        {onOpenGoldCalculator && (
          <button
            onClick={onOpenGoldCalculator}
            className="hidden md:flex items-center gap-1.5 bg-[#0e2a7a] hover:bg-[#0a1f5c] text-amber-300 border border-blue-400/40 font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 ml-auto hover:scale-105 active:scale-95"
            title="தங்கம் விலை கால்குலேட்டர்"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>கால்குலேட்டர்</span>
          </button>
        )}

      </div>

    </div>
  );
}
