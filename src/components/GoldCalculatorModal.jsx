import React, { useState, useEffect, useId } from 'react';
import { Calculator, X, Coins, Sparkles, MapPin, Receipt, Scale, Percent, Info } from 'lucide-react';
import { api } from '../services/api';

export default function GoldCalculatorModal({ isOpen, onClose }) {
  const [karat, setKarat] = useState('22'); // '22', '24', '18', 'silver'
  const [weightGrams, setWeightGrams] = useState(8); // Default 1 Sovereign / சவரன்
  const [makingChargesPct, setMakingChargesPct] = useState(8); // 8% default
  const [wastagePct, setWastagePct] = useState(2); // 2% wastage default
  const [selectedCity, setSelectedCity] = useState('chennai');
  const [liveBullion, setLiveBullion] = useState(null);

  const weightInputId = useId();
  const makingChargesInputId = useId();
  const wastageInputId = useId();

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const fetchCurrentRates = async () => {
        try {
          const res = await api.getCurrentGoldRates();
          if (isMounted && res && res.success && res.data) {
            setLiveBullion(res.data);
          }
        } catch (_) {}
      };
      fetchCurrentRates();
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Base rates per gram in Tamil Nadu cities with live DB override for Chennai
  const cityRates = {
    chennai: { 
      k22: liveBullion?.gold22k || 7288, 
      k24: liveBullion?.gold24k || 7950, 
      k18: liveBullion?.gold18k || 5965, 
      silver: liveBullion?.silver || 104 
    },
    madurai: { 
      k22: (liveBullion?.gold22k ? liveBullion.gold22k + 5 : 7293), 
      k24: (liveBullion?.gold24k ? liveBullion.gold24k + 5 : 7955), 
      k18: (liveBullion?.gold18k ? liveBullion.gold18k + 4 : 5969), 
      silver: (liveBullion?.silver ? liveBullion.silver + 0.2 : 104.2) 
    },
    coimbatore: { 
      k22: liveBullion?.gold22k || 7288, 
      k24: liveBullion?.gold24k || 7950, 
      k18: liveBullion?.gold18k || 5965, 
      silver: liveBullion?.silver || 104 
    },
    trichy: { 
      k22: (liveBullion?.gold22k ? liveBullion.gold22k + 5 : 7293), 
      k24: (liveBullion?.gold24k ? liveBullion.gold24k + 5 : 7955), 
      k18: (liveBullion?.gold18k ? liveBullion.gold18k + 4 : 5969), 
      silver: (liveBullion?.silver ? liveBullion.silver + 0.1 : 104.1) 
    }
  };

  const currentRates = cityRates[selectedCity] || cityRates.chennai;

  let baseRatePerGram = currentRates.k22;
  let titleLabel = '22K ஆபரணத் தங்கம் (916)';
  if (karat === '24') {
    baseRatePerGram = currentRates.k24;
    titleLabel = '24K சுத்தத் தங்கம் (999)';
  } else if (karat === '18') {
    baseRatePerGram = currentRates.k18;
    titleLabel = '18K தங்கம்';
  } else if (karat === 'silver') {
    baseRatePerGram = currentRates.silver;
    titleLabel = 'வெள்ளி (Silver 999)';
  }

  const basePrice = Math.round(weightGrams * baseRatePerGram);
  const wastageAmount = Math.round((basePrice * wastagePct) / 100);
  const makingCharges = Math.round((basePrice * makingChargesPct) / 100);
  const subtotal = basePrice + wastageAmount + makingCharges;
  const gstAmount = Math.round((subtotal * 3) / 100);
  const grandTotal = subtotal + gstAmount;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#0c1427] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/80 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Fixed) */}
        <div className="bg-gradient-to-r from-[#0a1945] via-[#0e2a7a] to-[#123896] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/20">
              <Coins className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-title font-extrabold text-base sm:text-lg text-white tracking-wide">
                தங்கம் & வெள்ளி விலை கணக்கீடு
              </h2>
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>தமிழ்நாடு இன்றைய நேரடி சந்தை மதிப்பீடு</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
            title="மூடுக"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable with crisp contrast) */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          
          {/* City Selection */}
          <div className="bg-slate-100/90 dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-300/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>மண்டலம் / நகரம் தேர்வு:</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'chennai', name: 'சென்னை' },
                { id: 'madurai', name: 'மதுரை' },
                { id: 'coimbatore', name: 'கோவை' },
                { id: 'trichy', name: 'திருச்சி' }
              ].map(city => {
                const isSelected = selectedCity === city.id;
                return (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCity(city.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      isSelected 
                        ? 'bg-[#0e2a7a] text-white shadow-md ring-2 ring-amber-400' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {city.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metal / Karat Selection Tabs */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-2">
              காரட் / உலோகம் தேர்வு செய்க:
            </label>
            <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-300/80 dark:border-slate-800">
              {[
                { id: '22', label: '22K (916)' },
                { id: '24', label: '24K (999)' },
                { id: '18', label: '18K' },
                { id: 'silver', label: 'வெள்ளி' }
              ].map(item => {
                const isSelected = karat === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setKarat(item.id)}
                    className={`py-2 rounded-xl text-xs font-black transition-all text-center cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300' 
                        : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weight Controls */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <label htmlFor={weightInputId} className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-500" />
                <span>எடை (கிராம்):</span>
              </label>
              
              {/* Quick Weight Presets */}
              <div className="flex gap-1.5 text-xs font-bold">
                <button 
                  type="button"
                  onClick={() => setWeightGrams(1)} 
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                    weightGrams === 1
                      ? 'bg-amber-400 text-slate-950 border-amber-500'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  1 கி
                </button>
                <button 
                  type="button"
                  onClick={() => setWeightGrams(8)} 
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                    weightGrams === 8
                      ? 'bg-amber-400 text-slate-950 border-amber-500'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  1 பவுன் (8கி)
                </button>
                <button 
                  type="button"
                  onClick={() => setWeightGrams(16)} 
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                    weightGrams === 16
                      ? 'bg-amber-400 text-slate-950 border-amber-500'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  2 பவுன் (16கி)
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                id={weightInputId}
                type="number"
                min="0.1"
                step="0.5"
                value={weightGrams}
                onChange={(e) => setWeightGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-base font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/15 px-2 py-0.5 rounded-lg border border-amber-400/30">
                {weightGrams >= 8 ? `${(weightGrams / 8).toFixed(2)} பவுன்` : `${weightGrams} கிராம்`}
              </span>
            </div>
          </div>

          {/* Making Charges Slider */}
          {karat !== 'silver' && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-3">
              {/* Making Charges % */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor={makingChargesInputId} className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-500" />
                    <span>செய்கூலி (Making Charges):</span>
                  </label>
                  <span className="text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow-xs">
                    {makingChargesPct}%
                  </span>
                </div>
                <input
                  id={makingChargesInputId}
                  type="range"
                  min="0"
                  max="20"
                  value={makingChargesPct}
                  onChange={(e) => setMakingChargesPct(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Wastage % */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <label htmlFor={wastageInputId} className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-orange-500" />
                    <span>சேதாரம் (Wastage %):</span>
                  </label>
                  <span className="text-xs font-black bg-orange-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                    {wastagePct}%
                  </span>
                </div>
                <input
                  id={wastageInputId}
                  type="range"
                  min="0"
                  max="15"
                  value={wastagePct}
                  onChange={(e) => setWastagePct(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          )}

          {/* Calculation Breakdown Receipt Box */}
          <div className="bg-gradient-to-br from-slate-50 to-amber-50/20 dark:from-slate-900 dark:to-[#101b33] rounded-2xl p-4 border border-slate-300 dark:border-slate-700/80 space-y-2.5 shadow-sm text-xs">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-black text-xs uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>விலை விவரக் கணக்கீடு</span>
            </div>

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
              <span>{titleLabel} (1 கி):</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">₹{baseRatePerGram.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
              <span>அடிப்படை மதிப்பு ({weightGrams} கிராம்):</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">₹{basePrice.toLocaleString('en-IN')}</span>
            </div>

            {karat !== 'silver' && (
              <>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                  <span>செய்கூலி ({makingChargesPct}%):</span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400">+ ₹{makingCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                  <span>சேதாரம் ({wastagePct}%):</span>
                  <span className="font-extrabold text-orange-600 dark:text-orange-400">+ ₹{wastageAmount.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>சரக்கு & சேவை வரி (GST 3%):</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">+ ₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Total Highlight */}
            <div className="pt-2.5 mt-1 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">மொத்த உத்தேச விலை:</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">(அனைத்து வரிகளும் உட்பட்டது)</span>
              </div>
              <span className="font-black text-2xl text-emerald-700 dark:text-amber-400 tracking-tight">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
            * குறிப்பு: தங்க நகைக் கடைகளுக்கு ஏற்ப செய்கூலி மற்றும் சேதாரம் மாறுபடலாம். இது வழிகாட்டுதலுக்கான உத்தேச கணக்கீடு மட்டுமே.
          </p>
        </div>

        {/* Footer (Fixed) */}
        <div className="bg-slate-100 dark:bg-slate-900/90 p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>அமேஸ் டைம்ஸ் நேரலை வணிகக் குழு</span>
          </span>
          <button
            onClick={onClose}
            className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            சரி, நன்றி
          </button>
        </div>
      </div>
    </div>
  );
}
