import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Ticker({ tickers = [] }) {
  const [marketRates, setMarketRates] = useState({
    sensex: { label: 'சென்செக்ஸ்', price: '81,224.75', change: '+340.15', isPositive: true },
    nifty: { label: 'நிஃப்டி', price: '24,785.30', change: '+95.40', isPositive: true },
    gold: { label: 'தங்கம் (பவுன்)', price: '₹58,240', change: '-₹120', isPositive: false },
    updatedAt: ''
  });
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMarketRates = async () => {
      try {
        setIsLiveUpdating(true);
        const res = await api.getMarketRates();
        if (isMounted && res.success && res.data) {
          setMarketRates(res.data);
        }
      } catch (err) {
        console.warn('Real-time market fetch fallback:', err.message);
      } finally {
        if (isMounted) setIsLiveUpdating(false);
      }
    };

    loadMarketRates();
    const interval = setInterval(loadMarketRates, 3 * 60 * 1000); // 3-minute refresh

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const tickerText = tickers && tickers.length > 0
    ? tickers.map(t => t.content).join(' • ')
    : 'தமிழக பட்ஜெட் கூட்டத்தொடர் நாளை தொடக்கம்: புதிய உள்கட்டமைப்பு திட்டங்கள் அறிவிப்பு • சென்னை மெட்ரோ விரிவாக்கப் பணிகள் 85% நிறைவு • தங்கம் விலை சவரனுக்கு ₹120 சரிவு • ஐபிஎல் 2025: சிஎஸ்கே தீவிர தீவிர பயிற்சி!';

  return (
    <div class="space-y-3">
      {/* CYBER NEON BREAKING NEWS TICKER HUB */}
      <div class="max-w-[1380px] mx-auto px-4 mt-3 mb-2">
        <div class="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 dark:from-red-950/80 dark:via-slate-900 dark:to-slate-950 text-white rounded-2xl text-xs font-medium p-2 shadow-lg flex items-center gap-3 border border-red-500/30">
          <div class="bg-gradient-to-r from-brand-red to-rose-600 text-white font-black px-3 py-1 rounded-xl flex items-center gap-1.5 flex-shrink-0 uppercase text-[10px] shadow-md tracking-wider">
            <span class="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
            <span>⚡ நேரடி செய்தி அலை</span>
          </div>
          <div class="overflow-hidden relative flex-1">
            <div class="whitespace-nowrap inline-block animate-marquee transition-all text-amber-300 font-bold text-xs">
              {tickerText}
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME LIVE MARKET TICKER RIBBON */}
      <div class="max-w-[1380px] mx-auto px-4">
        <div class="bg-white dark:bg-[#0D1424] rounded-xl p-2.5 shadow-sm border border-slate-300 dark:border-slate-800 flex items-center justify-between overflow-x-auto gap-4 text-xs font-bold">
          
          <div class="flex items-center gap-2 text-[#DC2626] dark:text-amber-400 whitespace-nowrap font-subtitle font-extrabold flex-shrink-0">
            <span class={`w-2.5 h-2.5 rounded-full ${isLiveUpdating ? 'bg-amber-500 animate-spin' : 'bg-red-600 animate-pulse'}`}></span>
            <span>நேரலை சந்தை நிலவரங்கள்:</span>
            {marketRates.updatedAt && (
              <span class="hidden sm:inline text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                ({marketRates.updatedAt})
              </span>
            )}
          </div>

          <div class="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
            {/* Sensex */}
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-slate-900 dark:text-slate-100">{marketRates.sensex?.label || 'சென்செக்ஸ்'}:</span>
              <span class={`font-black flex items-center gap-0.5 ${marketRates.sensex?.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {marketRates.sensex?.price} ({marketRates.sensex?.change}) {marketRates.sensex?.isPositive ? '▲' : '▼'}
              </span>
            </div>

            <span class="text-slate-300 dark:text-slate-700">|</span>

            {/* Nifty */}
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-slate-900 dark:text-slate-100">{marketRates.nifty?.label || 'நிஃப்டி'}:</span>
              <span class={`font-black flex items-center gap-0.5 ${marketRates.nifty?.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {marketRates.nifty?.price} ({marketRates.nifty?.change}) {marketRates.nifty?.isPositive ? '▲' : '▼'}
              </span>
            </div>

            <span class="text-slate-300 dark:text-slate-700">|</span>

            {/* Gold */}
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-slate-900 dark:text-slate-100">{marketRates.gold?.label || 'தங்கம் (பவுன்)'}:</span>
              <span class={`font-black flex items-center gap-0.5 ${marketRates.gold?.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {marketRates.gold?.price} ({marketRates.gold?.change}) {marketRates.gold?.isPositive ? '▲' : '▼'}
              </span>
              {marketRates.gold?.gramPrice && (
                <span class="hidden md:inline text-[10px] text-slate-500 dark:text-slate-400">
                  [{marketRates.gold.gramPrice}]
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
