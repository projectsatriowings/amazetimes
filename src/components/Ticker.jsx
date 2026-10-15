import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Zap, TrendingUp, Coins, Fuel, Calculator, BarChart3 } from 'lucide-react';

export default function Ticker({ tickers = [], onOpenGoldCalculator }) {
  const [marketRates, setMarketRates] = useState({
    gold22k: { label: 'தங்கம் (22K)', price: '₹7,280/கி', sovereign: '₹58,240', change: '+₹40', isPositive: true },
    gold24k: { label: 'தங்கம் (24K)', price: '₹7,942/கி', change: '+₹45', isPositive: true },
    silver: { label: 'வெள்ளி', price: '₹98.50/கி', kg: '₹98,500/கிலோ', change: '+₹1.20', isPositive: true },
    petrol: { label: 'பெட்ரோல்', price: '₹100.75/லி', change: '0.00', isPositive: true },
    diesel: { label: 'டீசல்', price: '₹92.34/லி', change: '0.00', isPositive: true },
    sensex: { label: 'சென்செக்ஸ்', price: '81,224.75', change: '+340.15', isPositive: true },
    nifty: { label: 'நிஃப்டி', price: '24,785.30', change: '+95.40', isPositive: true },
    updatedAt: 'இன்று காலை 10:00'
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

  const tickerText = tickers && tickers.length > 0
    ? tickers.map(t => t.content).join('  ✦  ')
    : 'தமிழகத்தில் ரூ.75,000 கோடி புதிய தொழில் முதலீடுகள் ஒப்பந்தம்  ✦  சென்னை மெட்ரோ ரயில் 2-ஆம் கட்ட சுரங்கப் பணிகள் 85% நிறைவு  ✦  தங்கம் விலை சவரனுக்கு ₹58,240 ஆக வர்த்தகம்  ✦  ஐபிஎல் 2026: சிஎஸ்கே புதிய தீவிர பயிற்சி முகாம்  ✦  மதுரை எய்ம்ஸ் முதன்மை வளாகப் பணிகள் துரிதம்';

  return (
    <div className="space-y-2 max-w-[1400px] mx-auto px-2.5 sm:px-4 mt-2 mb-2 w-full max-w-full min-w-0 overflow-hidden">
      
      {/* 1. BREAKING NEWS FLASH MARQUEE */}
      <div className="bg-white dark:bg-[#0d1627] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-1 sm:p-1.5 flex items-center gap-2 overflow-hidden w-full max-w-full min-w-0">
        
        {/* Flash Badge */}
        <div className="bg-red-600 text-white font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 uppercase text-[10px] sm:text-[11px] shadow-sm tracking-wider">
          <Zap className="w-3.5 h-3.5 text-white fill-white animate-bounce" />
          <span>முக்கியச் செய்தி</span>
        </div>

        {/* Marquee Ticker */}
        <div className="overflow-hidden relative flex-1 min-w-0">
          <div className="whitespace-nowrap inline-block animate-marquee text-[#0a1945] dark:text-amber-300 font-extrabold text-xs sm:text-[13px] py-0.5">
            {tickerText}
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
              {marketRates.gold22k?.price || '₹7,280/கி'} ({marketRates.gold22k?.sovereign || '₹58,240'})
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Silver */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">வெள்ளி:</span>
            <span className="font-black text-slate-700 dark:text-slate-300">
              {marketRates.silver?.price || '₹98.50/கி'}
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
              {marketRates.sensex?.price || '81,224'} {marketRates.sensex?.isPositive ? '▲' : '▼'}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Nifty */}
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">நிஃப்டி:</span>
            <span className={`font-black flex items-center gap-0.5 ${marketRates.nifty?.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
              {marketRates.nifty?.price || '24,785'} {marketRates.nifty?.isPositive ? '▲' : '▼'}
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
