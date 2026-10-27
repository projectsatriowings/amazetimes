import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Fuel, Calculator, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function GoldCalculatorBanner({ onOpenCalculator }) {
  const [rates, setRates] = useState({
    gold22k: { price: '₹13,135', sovereign: '₹1,05,080', change: '+₹50', isPositive: true },
    gold24k: { price: '₹14,329', sovereign: '₹1,14,632', change: '+₹54', isPositive: true },
    silver: { price: '₹220', kg: '₹2,20,000', change: '+₹0', isPositive: true },
    petrol: { price: '₹100.75' },
    diesel: { price: '₹92.34' }
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.getMarketRates();
        if (res && res.success && res.data) {
          setRates(prev => ({ ...prev, ...res.data }));
        }
      } catch (_) {}
    };
    fetchRates();
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-2.5 sm:px-4 my-3">
      <div className="bg-gradient-to-r from-[#0c1630] via-[#101e42] to-[#0d162d] rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Gold & Silver Live Ticker */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap flex-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coins size={20} />
            </span>
            <div>
              <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider block">சென்னை சந்தை விலை</span>
              <h3 className="text-sm sm:text-base font-extrabold text-white">தங்கம் & வெள்ளி நிலவரம்</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* 22K Gold */}
            <div className="bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
              <div className="text-[10px] text-gray-400 font-semibold">22K தங்கம் (1 சவரன்)</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-amber-300">{rates.gold22k.sovereign}</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <TrendingUp size={10} /> {rates.gold22k.change}
                </span>
              </div>
            </div>

            {/* 24K Pure Gold */}
            <div className="bg-white/5 rounded-xl px-3 py-1.5 border border-white/5 hidden sm:block">
              <div className="text-[10px] text-gray-400 font-semibold">24K சுத்த தங்கம் (1கி)</div>
              <div className="text-xs sm:text-sm font-extrabold text-yellow-200">{rates.gold24k.price}</div>
            </div>

            {/* Silver */}
            <div className="bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
              <div className="text-[10px] text-gray-400 font-semibold">வெள்ளி (1 கிலோ)</div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-200">{rates.silver.kg}</div>
            </div>

            {/* Petrol */}
            <div className="bg-white/5 rounded-xl px-3 py-1.5 border border-white/5 hidden lg:block">
              <div className="text-[10px] text-gray-400 font-semibold">பெட்ரோல் (லி)</div>
              <div className="text-xs sm:text-sm font-extrabold text-rose-300">{rates.petrol.price}</div>
            </div>
          </div>
        </div>

        {/* Right: Calculator Launch Button */}
        <button
          onClick={onOpenCalculator}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex-shrink-0"
        >
          <Calculator size={16} className="text-slate-950" />
          <span>தங்க நகை கால்குலேட்டர்</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
