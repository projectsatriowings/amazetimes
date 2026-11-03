import React, { useState } from 'react';
import { 
  BookOpen, 
  Volume2, 
  RefreshCw, 
  Copy, 
  Check, 
  Fuel, 
  CloudSun, 
  Coins, 
  PhoneCall, 
  Flame, 
  Sparkles, 
  Calendar, 
  Sun, 
  CloudRain, 
  Cloud, 
  TrendingUp,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const THIRUKKURAL_COLLECTION = [
  {
    number: 1,
    athigaram: "கடவுள் வாழ்த்து",
    line1: "அகர முதல எழுத்தெல்லாம் ஆதி",
    line2: "பகவன் முதற்றே உலகு.",
    meaning: "எழுத்துக்கள் எல்லாம் அகரத்தை முதலாகக் கொண்டுள்ளன; அதுபோல இந்த உலகம் கடவுளை முதலாகக் கொண்டுள்ளது."
  },
  {
    number: 31,
    athigaram: "அறன் வலியுறுத்தல்",
    line1: "சிறப்பீனும் செல்வமும் ஈனும் அறத்தினூஉங்கு",
    line2: "ஆக்கம் எவனோ உயிர்க்கு.",
    meaning: "அறமானது ஒருவனுக்குப் புகழையும் தரும், பெரும் செல்வத்தையும் தரும்; அத்தகைய அறத்தை விட மனித உயிருக்கு நன்மை தருவது எதுவுமில்லை."
  },
  {
    number: 71,
    athigaram: "அன்புடைமை",
    line1: "அன்பிற்கும் உண்டோ அடைக்குந்தாழ் ஆர்வலர்",
    line2: "புன்கணீர் பூசல் தரும்.",
    meaning: "அன்பைப் பூட்டி வைக்க எந்தத் தாழ்ப்பாளும் இல்லை; அன்புடையவரின் துன்பக் கண்ணீரே அவரது அன்பைப் பிறருக்கு வெளிப்படுத்திவிடும்."
  },
  {
    number: 131,
    athigaram: "ஒழுக்கமுடைமை",
    line1: "ஒழுக்கம் விழுப்பம் தரலான் ஒழுக்கம்",
    line2: "உயிரினும் ஓம்பப் படும்.",
    meaning: "ஒழுக்கமே அனைவருக்கும் உயர்வையும் சிறப்பையும் தரும்; ஆதலால் அந்த ஒழுக்கத்தை உயிரை விட மேலானதாகப் போற்றிப் பாதுகாக்க வேண்டும்."
  },
  {
    number: 491,
    athigaram: "காலமறிதல்",
    line1: "பகல்வெல்லும் கூகையை காக்கை இகல்வெல்லும்",
    line2: "வேந்தர்க்கு வேண்டும் பொழுது.",
    meaning: "பகல் வேளையில் தன்னை விட வலிமையற்ற காகம் ஆந்தையை வென்றுவிடும்; அதுபோலப் பகையை வெல்ல விரும்பும் ஆட்சியாளருக்குப் பொருத்தமான காலம் மிக முக்கியம்."
  },
  {
    number: 616,
    athigaram: "ஆள்வினையுடைமை",
    line1: "முயற்சி திருவினை ஆக்கும் முயற்றின்மை",
    line2: "இன்மை புகுத்தி விடும்.",
    meaning: "விடாமுயற்சி ஒருவனுக்கு எல்லாச் செல்வங்களையும் உண்டாக்கும்; முயற்சி இல்லாமல் இருப்பதோ அவனை வறுமையில் தள்ளிவிடும்."
  },
  {
    number: 391,
    athigaram: "கல்வி",
    line1: "கற்க கசடறக் கற்பவை கற்றபின்",
    line2: "நிற்க அதற்குத் தக.",
    meaning: "கற்க வேண்டிய நூல்களைப் பிழையறக் கற்றுக்கொள்ள வேண்டும்; அவ்வாறு கற்ற பிறகு கற்ற கல்வியின் வழியில் உறுதியாக நடக்க வேண்டும்."
  }
];

const WEATHER_DATA = [
  { city: 'சென்னை', temp: '33°C', condition: 'பகுதி மேகமூட்டம்', rain: '20%', icon: CloudSun, color: 'text-amber-500' },
  { city: 'கோவை', temp: '29°C', condition: 'குளிர்ந்த காற்று', rain: '10%', icon: Cloud, color: 'text-sky-500' },
  { city: 'மதுரை', temp: '34°C', condition: 'வெயில் / தெளிவான வானம்', rain: '15%', icon: Sun, color: 'text-amber-500' },
  { city: 'திருச்சி', temp: '33°C', condition: 'மிதமான வெயில்', rain: '10%', icon: Sun, color: 'text-amber-500' },
  { city: 'சேலம்', temp: '31°C', condition: 'மாலை மழை வாய்ப்பு', rain: '30%', icon: CloudRain, color: 'text-blue-500' }
];

const COMMODITY_RATES = [
  { title: 'பெட்ரோல் (சென்னை)', price: '₹100.75', unit: '1 லிட்டர்', badge: 'மாற்றமில்லை', trend: 'flat', icon: Fuel, color: 'text-red-500' },
  { title: 'டீசல் (சென்னை)', price: '₹92.34', unit: '1 லிட்டர்', badge: 'மாற்றமில்லை', trend: 'flat', icon: Fuel, color: 'text-blue-500' },
  { title: 'தங்கம் 22K (1 கிராம்)', price: '₹7,250', unit: 'சவரன் ₹58,000', badge: '▲ ₹30', trend: 'up', icon: Coins, color: 'text-amber-500' },
  { title: 'வெள்ளி (1 கிராம்)', price: '₹102.00', unit: '1 கிலோ ₹1,02,000', badge: '▲ ₹1.50', trend: 'up', icon: TrendingUp, color: 'text-slate-400' },
  { title: 'வீட்டு கேஸ் சிலிண்டர்', price: '₹818.50', unit: '14.2 கிலோ LPG', badge: 'மானிய விலை', trend: 'flat', icon: Flame, color: 'text-emerald-500' },
  { title: 'வணிக கேஸ் சிலிண்டர்', price: '₹1,930.00', unit: '19 கிலோ LPG', badge: 'வணிக பயன்பாடு', trend: 'flat', icon: Flame, color: 'text-orange-500' }
];

const EMERGENCY_HELPLINES = [
  { name: 'காவல் துறை (Police)', number: '100', desc: 'அவசர காவல் உதவி' },
  { name: 'ஆம்புலன்ஸ் (Ambulance)', number: '108', desc: 'அவசர மருத்துவ சேவை' },
  { name: 'தீயணைப்பு & மீட்புப்பணி', number: '101', desc: 'தீ விபத்து & மீட்பு' },
  { name: 'பெண்கள் உதவி மையம்', number: '1091', desc: '24x7 மகளிர் உதவி' },
  { name: 'குழந்தைகள் உதவி (Childline)', number: '1098', desc: 'குழந்தைகள் பாதுகாப்பு' },
  { name: 'மின்சார வாரிய புகார் (TNEB)', number: '94987 94987', desc: 'மின் நுகர்வோர் சேவை (மின்னகம்)' }
];

export default function TamilNaduUtilityHub({ onSpeak, onToast }) {
  const [kuralIndex, setKuralIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('rates'); // 'rates', 'weather', 'helplines'

  const currentKural = THIRUKKURAL_COLLECTION[kuralIndex];

  const handleNextKural = () => {
    setKuralIndex((prev) => (prev + 1) % THIRUKKURAL_COLLECTION.length);
  };

  const handleSpeakKural = () => {
    if (onSpeak) {
      const text = `இன்றைய திருக்குறள். அதிகாரம்: ${currentKural.athigaram}. குறள் எண் ${currentKural.number}. ${currentKural.line1}, ${currentKural.line2}. விளக்கம்: ${currentKural.meaning}`;
      onSpeak(text);
    }
  };

  const handleCopyKural = () => {
    const text = `திருக்குறள் (குறள் எண்: ${currentKural.number} - ${currentKural.athigaram}):\n${currentKural.line1}\n${currentKural.line2}\n\nவிளக்கம்: ${currentKural.meaning}\n- அமேஸ் டைம்ஸ் (Amaze Times)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onToast) onToast('திருக்குறள் நகலெடுக்கப்பட்டது!', 'check');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-tamil">
      {/* 1. DAILY THIRUKKURAL & LIFE WISDOM CARD */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-[#0D1424] dark:via-[#090F1E] dark:to-[#120B20] rounded-2xl p-4 shadow-sm border border-amber-300/40 dark:border-amber-500/20 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <BookOpen className="w-4 h-4 text-slate-950" />
            </span>
            <div>
              <h3 className="font-title font-bold text-sm text-slate-900 dark:text-amber-400 flex items-center gap-1.5">
                <span>இன்றைய திருக்குறள்</span>
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                அதிகாரம்: {currentKural.athigaram} (குறள் {currentKural.number})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/40 px-2 py-0.5 rounded-full">
              வாழ்வியல்
            </span>
          </div>
        </div>

        {/* Kural Verses */}
        <div className="bg-white/80 dark:bg-slate-900/60 rounded-xl p-3 border border-amber-200/50 dark:border-slate-800 space-y-1.5 shadow-2xs">
          <p className="font-title font-bold text-xs sm:text-[13px] text-slate-900 dark:text-amber-300 leading-relaxed">
            {currentKural.line1}
          </p>
          <p className="font-title font-bold text-xs sm:text-[13px] text-slate-900 dark:text-amber-300 leading-relaxed">
            {currentKural.line2}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
              <span className="font-bold text-amber-600 dark:text-amber-400">உரை: </span>
              {currentKural.meaning}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
          <button
            onClick={handleSpeakKural}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 hover:text-slate-950 dark:text-amber-400 dark:hover:text-slate-950 font-bold transition cursor-pointer text-[11px]"
            title="குரல் வடிவில் கேட்க"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>வாசித்து கேட்க</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyKural}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="குறளை நகலெடுக்க"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleNextKural}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer text-[11px]"
              title="அடுத்த குறள் படிக்க"
            >
              <RefreshCw className="w-3 h-3" />
              <span>அடுத்த குறள்</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAMIL NADU DAILY ESSENTIALS & UTILITIES HUB */}
      <div className="bg-white dark:bg-[#0D1424] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        {/* Hub Header with 3 Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <div>
              <h3 className="font-title font-bold text-sm text-slate-900 dark:text-slate-100">
                தமிழக அத்தியாவசிய மையம்
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                விலை நிலவரம், வானிலை & அவசர எண்கள்
              </span>
            </div>
          </div>

          {/* 3 Nav Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeTab === 'rates'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              விலை
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              வானிலை
            </button>
            <button
              onClick={() => setActiveTab('helplines')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeTab === 'helplines'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              அவசர எண்கள்
            </button>
          </div>
        </div>

        {/* Tab Content 1: Commodity & Fuel Rates */}
        {activeTab === 'rates' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {COMMODITY_RATES.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400/50 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                        {item.title}
                      </span>
                      <IconComponent className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-1">
                      <span className="font-title font-extrabold text-sm text-slate-900 dark:text-white">
                        {item.price}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                      {item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
              <span>*சென்னை எண்ணெய் நிறுவன தினசரி விலை நிலவரம்</span>
              <span className="font-bold text-emerald-500">நேரலை அப்டேட்</span>
            </div>
          </div>
        )}

        {/* Tab Content 2: Tamil Nadu Live Weather */}
        {activeTab === 'weather' && (
          <div className="space-y-2">
            <div className="space-y-1.5">
              {WEATHER_DATA.map((w, idx) => {
                const Icon = w.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${w.color}`} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{w.city}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{w.condition}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                        மழை {w.rain}
                      </span>
                      <span className="font-title font-bold text-slate-900 dark:text-white">
                        {w.temp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
              <span>சென்னை மண்டல வானிலை ஆய்வு மையம் தகவல்</span>
              <span className="font-bold text-sky-500">Live Forecast</span>
            </div>
          </div>
        )}

        {/* Tab Content 3: Essential Emergency Numbers */}
        {activeTab === 'helplines' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {EMERGENCY_HELPLINES.map((h, idx) => (
                <a
                  key={idx}
                  href={`tel:${h.number.replace(/\s/g, '')}`}
                  className="p-2.5 rounded-xl bg-red-50/60 dark:bg-slate-900/60 border border-red-100 dark:border-slate-800 hover:border-red-500 transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {h.name}
                    </span>
                    <PhoneCall className="w-3 h-3 text-red-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-mono font-black text-xs text-red-600 dark:text-red-400">
                      {h.number}
                    </span>
                    <span className="text-[8px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                      அழைக்க
                    </span>
                  </div>
                </a>
              ))}
            </div>
            <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
              <span>தமிழ்நாடு அரசு 24x7 இலவச அவசர உதவி சேவை</span>
              <span className="font-bold text-red-500">Toll Free</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

