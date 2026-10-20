import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Layers,
  Star,
  Zap,
  Flame,
  ArrowUp,
  ArrowDown,
  Save,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles
} from 'lucide-react';

const SECTION_LABELS = {
  hero: { name: 'முதன்மைச் செய்தி (Hero Spotlight)', icon: Star, color: 'text-amber-400' },
  ticker: { name: 'முக்கியச் செய்திகள் துரிதப் பட்டி (Breaking Ticker)', icon: Zap, color: 'text-rose-400' },
  cinema_sports: { name: 'சினிமா & விளையாட்டு மையம் (Cinema & Sports)', icon: Film, color: 'text-purple-400' },
  general: { name: 'மாவட்டங்கள் & பொதுச் செய்திகள் (Districts & General Grid)', icon: Layers, color: 'text-blue-400' },
  features: { name: 'சிறப்புக் கட்டுரைகள் & பத்திகள் (Features & Columns)', icon: Sparkles, color: 'text-emerald-400' },
  magazines: { name: 'டிஜிட்டல் இதழ்கள் & இ-பேப்பர் (Digital Magazines)', icon: Layers, color: 'text-cyan-400' },
  videos: { name: 'வீடியோக்கள் & சமூக ஊடக மையம் (Videos & Social Feed)', icon: Film, color: 'text-red-400' }
};

export const AdminHomePageBuilder = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishedArticles, setPublishedArticles] = useState([]);

  // Layout State
  const [leadHeroId, setLeadHeroId] = useState(null);
  const [breakingIds, setBreakingIds] = useState([]);
  const [topStoriesIds, setTopStoriesIds] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([
    'hero',
    'ticker',
    'cinema_sports',
    'general',
    'features',
    'magazines',
    'videos'
  ]);
  const [highlightCategory, setHighlightCategory] = useState('cinema');

  useEffect(() => {
    loadBuilderData();
  }, []);

  const loadBuilderData = async () => {
    setLoading(true);
    try {
      const [layoutRes, newsRes] = await Promise.all([
        api.getHomeBuilderLayout().catch(() => null),
        api.getNews({ limit: 100, status: 'published' }).catch(() => null)
      ]);

      if (newsRes && newsRes.success && Array.isArray(newsRes.data)) {
        setPublishedArticles(newsRes.data);
      }

      if (layoutRes && layoutRes.success && layoutRes.data) {
        const d = layoutRes.data;
        if (d.leadHeroId) setLeadHeroId(Number(d.leadHeroId));
        if (Array.isArray(d.breakingIds)) setBreakingIds(d.breakingIds.map(Number));
        if (Array.isArray(d.topStoriesIds)) setTopStoriesIds(d.topStoriesIds.map(Number));
        if (Array.isArray(d.sectionOrder) && d.sectionOrder.length > 0) setSectionOrder(d.sectionOrder);
        if (d.highlightCategory) setHighlightCategory(d.highlightCategory);
      }
    } catch (err) {
      console.error('Home builder load error:', err);
      if (showToast) showToast('முகப்பு அமைப்புகளை ஏற்றுவதில் பிழை');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLayout = async () => {
    setSaving(true);
    try {
      const payload = {
        leadHeroId: leadHeroId ? Number(leadHeroId) : null,
        breakingIds: breakingIds.map(Number),
        topStoriesIds: topStoriesIds.map(Number),
        sectionOrder,
        highlightCategory
      };

      const res = await api.saveHomeBuilderLayout(payload);
      if (res && res.success) {
        if (showToast) showToast('✅ முகப்புப் பக்க வடிவமைப்பு வெற்றிகரமாக சேமிக்கப்பட்டது!');
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
      } else {
        throw new Error(res?.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save layout error:', err);
      if (showToast) showToast('❌ சேமிப்பதில் பிழை: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setSectionOrder(newOrder);
  };

  const toggleBreakingId = (id) => {
    const numId = Number(id);
    if (breakingIds.includes(numId)) {
      setBreakingIds(breakingIds.filter(i => i !== numId));
    } else {
      setBreakingIds([...breakingIds, numId]);
    }
  };

  const toggleTopStoryId = (id) => {
    const numId = Number(id);
    if (topStoriesIds.includes(numId)) {
      setTopStoriesIds(topStoriesIds.filter(i => i !== numId));
    } else {
      setTopStoriesIds([...topStoriesIds, numId]);
    }
  };

  const selectedHeroArticle = publishedArticles.find(a => Number(a.id) === Number(leadHeroId));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm">முகப்புப் பக்க அமைப்பாளர் ஏற்றப்படுகிறது...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-tamil">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Layers className="w-6 h-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">முகப்புப் பக்க அமைப்பாளர் (Home Page Builder)</h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            முதன்மைச் செய்தி (Lead Hero), முக்கியச் செய்திகள் (Breaking), மற்றும் முகப்புப் பிரிவு வரிசைகளை உடனடியாகக் கட்டுப்படுத்தவும்.
          </p>
        </div>

        <button
          onClick={handleSaveLayout}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{saving ? 'சேமிக்கப்படுகிறது...' : 'அமைப்புகளைச் சேமி'}</span>
        </button>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Lead Hero & Breaking Selectors */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Lead Hero Selector */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">#1 முதன்மைச் செய்தி (Lead Hero Article)</h3>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                1st Slot
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-slate-400 block font-medium">
                வெளியான செய்திகளிலிருந்து முதன்மைச் செய்தியைத் தேர்ந்தெடுக்கவும்:
              </label>
              <select
                value={leadHeroId || ''}
                onChange={(e) => setLeadHeroId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- தானியங்கி முன்னணி செய்தி (Auto Latest Lead) --</option>
                {publishedArticles.map((art) => (
                  <option key={art.id} value={art.id}>
                    [{art.category || 'பொது'}] {art.title.substring(0, 75)}...
                  </option>
                ))}
              </select>

              {/* Selected Lead Hero Preview Card */}
              {selectedHeroArticle && (
                <div className="mt-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex gap-4 items-center">
                  <img
                    src={selectedHeroArticle.mainImage || selectedHeroArticle.image || '/Amaze times.jpg'}
                    alt={selectedHeroArticle.title}
                    className="w-24 h-20 object-cover rounded-lg border border-slate-800 flex-shrink-0"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {selectedHeroArticle.category}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate mt-1">{selectedHeroArticle.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{selectedHeroArticle.summary}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Breaking News Ticker Selector */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">முக்கியச் செய்திகள் துரிதப் பட்டி (Breaking News Ticker)</h3>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                தேர்ந்தெடுக்கப்பட்டது: {breakingIds.length} செய்திகள்
              </span>
            </div>

            <p className="text-xs text-slate-400">
              டிக் செய்யப்பட்ட செய்திகள் முகப்புப் பக்கத்தின் மேலே ஓடும் செய்திப்பட்டியில் (Breaking Marquee) காட்டப்படும்.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {publishedArticles.map((art) => {
                const isChecked = breakingIds.includes(Number(art.id));
                return (
                  <div
                    key={art.id}
                    onClick={() => toggleBreakingId(art.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-5 h-5 rounded flex items-center justify-center border text-xs font-bold ${
                        isChecked ? 'bg-rose-500 border-rose-400 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isChecked && '✓'}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400">[{art.category}]</span>
                        <p className="text-xs font-medium truncate">{art.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Top Stories Grid Selector */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">டிரெண்டிங் & டாப் ஸ்டோரிஸ் (Top Stories Slots)</h3>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                தேர்ந்தெடுக்கப்பட்டது: {topStoriesIds.length}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {publishedArticles.map((art) => {
                const isChecked = topStoriesIds.includes(Number(art.id));
                return (
                  <div
                    key={art.id}
                    onClick={() => toggleTopStoryId(art.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-5 h-5 rounded flex items-center justify-center border text-xs font-bold ${
                        isChecked ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isChecked && '✓'}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400">[{art.category}]</span>
                        <p className="text-xs font-medium truncate">{art.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Section Reordering */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>முகப்புப் பிரிவு வரிசை (Section Ordering)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                பிரிவுகளின் இடத்தை மாற்ற மேல் / கீழ் அம்புக்குறிகளைப் பயன்படுத்தவும்.
              </p>
            </div>

            <div className="space-y-2.5">
              {sectionOrder.map((secKey, index) => {
                const info = SECTION_LABELS[secKey] || { name: secKey, icon: Layers, color: 'text-slate-400' };
                const IconComponent = info.icon;
                return (
                  <div
                    key={secKey}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 shadow-sm hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <IconComponent className={`w-5 h-5 ${info.color} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                        {info.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                        title="மேலே நகர்த்து"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sectionOrder.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                        title="கீழே நகர்த்து"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Highlight category selector */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="text-xs text-slate-400 block font-medium">
                மையப் பகுதி சிறப்புப் பிரிவு (Highlight Spotlight):
              </label>
              <select
                value={highlightCategory}
                onChange={(e) => setHighlightCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="cinema">சினிமா & பொழுதுபோக்கு (Cinema)</option>
                <option value="sports">விளையாட்டு அரங்கம் (Sports)</option>
                <option value="business">வணிகம் & பொருளாதாரம் (Business)</option>
                <option value="spiritual">ஆன்மிகம் (Spiritual)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePageBuilder;
