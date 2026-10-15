import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, ChevronDown, ArrowUpRight, ArrowDownRight, Calculator, Coins, Sparkles, RefreshCw, Fuel } from 'lucide-react';

export const GoldMarketDashboard = ({ isAdminView = false }) => {
  const { goldRateData, fetchGoldRate, showToast } = useApp();

  // Active Metal & City State
  const [activeMetal, setActiveMetal] = useState('gold'); // 'gold' | 'silver' | 'platinum' | 'fuel'
  const [selectedCity, setSelectedCity] = useState('Chennai');
  
  // Calculator State
  const [selectedPurity, setSelectedPurity] = useState('22K'); // '24K' | '22K' | '18K'
  const [weightGrams, setWeightGrams] = useState(10);
  const [makingPercent, setMakingPercent] = useState(12);
  const [gstPercent, setGstPercent] = useState(3);

  // Budget Calculator ("Know your money's worth") State
  const [budgetAmount, setBudgetAmount] = useState('10000');

  // Live Rate Values from AppContext or exact defaults
  const g24 = goldRateData?.gold24k || 15017;
  const g22 = goldRateData?.gold22k || 13765;
  const g18 = goldRateData?.gold18k || 11535;
  const silver1g = (goldRateData?.silver && goldRateData.silver >= 150) ? goldRateData.silver : 205;
  const platinum1g = goldRateData?.platinum || 3450;
  const petrol1L = goldRateData?.petrol || 100.75;
  const diesel1L = goldRateData?.diesel || 92.34;

  const change24 = goldRateData?.change24k || 256;
  const change22 = goldRateData?.change22k || 235;
  const change18 = goldRateData?.change18k || 235;
  const isRateUp = goldRateData?.isUp === true;

  // Dynamic Date Formatting (Shows actual last updated / live date)
  const formattedDate = React.useMemo(() => {
    const rawDate = goldRateData?.updatedAt ? new Date(goldRateData.updatedAt) : new Date();
    return rawDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [goldRateData?.updatedAt]);

  // Selected Rate per gram for main calculator
  const currentRatePerGram =
    selectedPurity === '24K' ? g24 : selectedPurity === '22K' ? g22 : g18;

  // Calculations
  const baseValue = Math.round(weightGrams * currentRatePerGram);
  const makingCharges = Math.round((baseValue * makingPercent) / 100);
  const gstValue = Math.round(((baseValue + makingCharges) * gstPercent) / 100);
  const totalAmount = baseValue + makingCharges + gstValue;

  // Dynamic Budget Calculation ("Know your money's worth")
  const numBudget = parseFloat(budgetAmount);
  const calculatedWeight = React.useMemo(() => {
    if (!numBudget || numBudget <= 0) return null;
    const netAmountAfterGst = numBudget / (1 + gstPercent / 100);
    const baseAmount = netAmountAfterGst / (1 + makingPercent / 100);
    return (baseAmount / currentRatePerGram).toFixed(3);
  }, [numBudget, gstPercent, makingPercent, currentRatePerGram]);

  // Budget Calculator Form Submit Action
  const handleCalculateWorth = (e) => {
    if (e) e.preventDefault();
    if (!numBudget || numBudget <= 0) return;

    if (calculatedWeight && showToast) {
      showToast(`₹${Number(numBudget).toLocaleString('en-IN')} க்கு ${calculatedWeight}g (${selectedPurity}) தங்கம் பெறலாம்!`);
    }
  };

  return (
    <div className="w-full bg-[#0d1627] text-slate-100 rounded-3xl border border-emerald-950/60 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* TOP CONTROLS ROW: Date, Metal Switcher Tabs, City Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 text-slate-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>{formattedDate}</span>
        </div>

        {/* Metal Switcher Pills (Gold | Silver | Platinum | Petrol & Diesel) */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-center sm:self-auto flex-wrap justify-center">
          <button
            onClick={() => setActiveMetal('gold')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
              activeMetal === 'gold'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gold
          </button>
          <button
            onClick={() => setActiveMetal('silver')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
              activeMetal === 'silver'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Silver
          </button>
          <button
            onClick={() => setActiveMetal('platinum')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
              activeMetal === 'platinum'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Platinum
          </button>
          <button
            onClick={() => setActiveMetal('fuel')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 ${
              activeMetal === 'fuel'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" /> Fuel (எரிபொருள்)
          </button>
        </div>

        {/* City Selector */}
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold px-4 py-2 pr-8 rounded-xl focus:outline-none cursor-pointer appearance-none"
          >
            <option value="Chennai">Chennai (சென்னை)</option>
            <option value="Madurai">Madurai (மதுரை)</option>
            <option value="Coimbatore">Coimbatore (கோவை)</option>
            <option value="Trichy">Trichy (திருச்சி)</option>
            <option value="Salem">Salem (சேலம்)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* PURITY RATE CARDS ROW */}
      {activeMetal === 'gold' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 24K Gold */}
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs text-slate-400 font-bold block">24K Gold /g</span>
              <span className="text-2xl font-black text-white font-mono">₹{g24.toLocaleString('en-IN')}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isRateUp
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                  : 'bg-red-950/90 text-red-400 border-red-700/60'
              }`}
            >
              <span>{isRateUp ? `+${change24}` : `- ${change24}`}</span>
              <span className="text-xs">{isRateUp ? '↗' : '▼'}</span>
            </div>
          </div>

          {/* 22K Gold */}
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs text-slate-400 font-bold block">22K Gold /g</span>
              <span className="text-2xl font-black text-white font-mono">₹{g22.toLocaleString('en-IN')}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isRateUp
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                  : 'bg-red-950/90 text-red-400 border-red-700/60'
              }`}
            >
              <span>{isRateUp ? `+${change22}` : `- ${change22}`}</span>
              <span className="text-xs">{isRateUp ? '↗' : '▼'}</span>
            </div>
          </div>

          {/* 18K Gold */}
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs text-slate-400 font-bold block">18K Gold /g</span>
              <span className="text-2xl font-black text-white font-mono">₹{g18.toLocaleString('en-IN')}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isRateUp
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                  : 'bg-red-950/90 text-red-400 border-red-700/60'
              }`}
            >
              <span>{isRateUp ? `+${change18}` : `- ${change18}`}</span>
              <span className="text-xs">{isRateUp ? '↗' : '▼'}</span>
            </div>
          </div>
        </div>
      )}

      {activeMetal === 'silver' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold block">1 Gram Silver</span>
              <span className="text-2xl font-black text-white font-mono">₹{silver1g}</span>
            </div>
          </div>
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold block">10 Gram Silver</span>
              <span className="text-2xl font-black text-white font-mono">₹{(silver1g * 10).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold block">1 Kg Silver</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">₹{(silver1g * 1000).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {activeMetal === 'platinum' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold block">24K Platinum /g</span>
              <span className="text-2xl font-black text-white font-mono">₹{platinum1g.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {activeMetal === 'fuel' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-400 font-bold block flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5" /> Petrol Price (சென்னை பெட்ரோல்)
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">₹{petrol1L} / லிட்டர்</span>
            </div>
            <span className="text-xs bg-slate-800 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-slate-700">
              நேரலை
            </span>
          </div>
          <div className="bg-[#122238] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-400 font-bold block flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5" /> Diesel Price (சென்னை டீசல்)
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">₹{diesel1L} / லிட்டர்</span>
            </div>
            <span className="text-xs bg-slate-800 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-slate-700">
              நேரலை
            </span>
          </div>
        </div>
      )}

      {/* CALCULATOR CONTROLS */}
      <div className="pt-2 space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Calculator</h3>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          {/* Purity selector */}
          <div>
            <label className="block text-slate-400 mb-1.5">Purity</label>
            <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setSelectedPurity('24K')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs cursor-pointer transition ${
                  selectedPurity === '24K' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                24K
              </button>
              <button
                type="button"
                onClick={() => setSelectedPurity('22K')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs cursor-pointer transition ${
                  selectedPurity === '22K' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                22K
              </button>
              <button
                type="button"
                onClick={() => setSelectedPurity('18K')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs cursor-pointer transition ${
                  selectedPurity === '18K' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                18K
              </button>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-slate-400 mb-1.5">Weight (gm)</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setWeightGrams(8)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs border border-slate-700 shrink-0 cursor-pointer"
                title="1 சவரன் (8g)"
              >
                8g (சவரன்)
              </button>
            </div>
          </div>

          {/* Making % */}
          <div>
            <label className="block text-slate-400 mb-1.5">Making (%)</label>
            <input
              type="number"
              min="0"
              max="30"
              value={makingPercent}
              onChange={(e) => setMakingPercent(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* GST Dropdown */}
          <div>
            <label className="block text-slate-400 mb-1.5">GST</label>
            <select
              value={gstPercent}
              onChange={(e) => setGstPercent(parseFloat(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-bold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value={3}>Incl. 3% GST</option>
              <option value={0}>0% (No GST)</option>
              <option value={5}>5% GST</option>
            </select>
          </div>
        </div>
      </div>

      {/* TWO COLUMN BREAKDOWN & MONEY'S WORTH CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Breakdown Box */}
        <div className="lg:col-span-8 bg-[#0a1626] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="divide-y divide-slate-800 text-xs sm:text-sm">
            <div className="py-2.5 flex justify-between items-center text-slate-300">
              <span>Base value</span>
              <span className="font-bold text-white font-mono">₹{baseValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-slate-300">
              <span>Making charges ({makingPercent}%)</span>
              <span className="font-bold text-white font-mono">₹{makingCharges.toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-slate-300">
              <span>GST ({gstPercent}%)</span>
              <span className="font-bold text-white font-mono">₹{gstValue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Total Amount</span>
              <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 italic">Incl. all charges</span>
          </div>
        </div>

        {/* Right "Know your money's worth!" Box */}
        <div className="lg:col-span-4 bg-[#0e2133] border border-emerald-900/60 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-extrabold text-sm text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Know your money's worth!
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Enter any amount to see how much gold you can get
            </p>
          </div>

          <form onSubmit={handleCalculateWorth} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                step="any"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                placeholder="1000"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0 cursor-pointer shadow transition"
              >
                Try now
              </button>
            </div>

            {calculatedWeight ? (
              <div className="bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 p-2.5 rounded-xl text-xs text-center font-bold font-mono shadow-inner">
                ₹{Number(numBudget).toLocaleString('en-IN')} = <span className="text-white font-extrabold text-sm">{calculatedWeight}g</span> ({selectedPurity})
              </div>
            ) : (
              <div className="text-slate-500 text-xs italic text-center p-2">
                Enter any value to calculate exact gold weight
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
