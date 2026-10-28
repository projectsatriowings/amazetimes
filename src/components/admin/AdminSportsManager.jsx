import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Trophy,
  Flame,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Radio,
  ExternalLink,
  Tag,
  Shield,
  Activity,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const AdminSportsManager = ({ showToast }) => {
  const { newsList = [], addNews, updateNews, deleteNews } = useApp();

  const [activeTab, setActiveTab] = useState('match'); // 'match' | 'articles' | 'hashtags'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Live Match / CSK Tracker State
  const [liveMatch, setLiveMatch] = useState({
    tournament: 'TATA IPL 2026 - லீக் ஆட்டம் 18',
    badge: 'CSK UPDATE',
    status: 'LIVE',
    title: 'சென்னை சூப்பர் கிங்ஸ் அதிரடி வெற்றி: தோனியின் கடைசி ஓவர் ஃபினிஷிங்!',
    venue: 'சேப்பாக்கம் எம்.ஏ. சிதம்பரம் மைதானம், சென்னை',
    summary: 'சிஎஸ்கே 204/3 (20.0) vs மும்பை இந்தியன்ஸ் 188/7 (20.0) • 16 ரன்கள் வித்தியாசத்தில் சிஎஸ்கே திரில் வெற்றி!',
    link: '/category/sports'
  });

  // Spotlight Hashtags
  const [spotlightTags, setSpotlightTags] = useState([
    { label: '#IPL2026', query: 'IPL' },
    { label: '#CSK', query: 'CSK' },
    { label: '#தோனி', query: 'தோனி' },
    { label: '#டி20உலகக்கோப்பை', query: 'டி20' },
    { label: '#ரோஹித்', query: 'ரோஹித் சர்மா' },
    { label: '#TNPL', query: 'TNPL' }
  ]);

  // Article Subcategory Filter
  const [articleSubFilter, setArticleSubFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Tag State
  const [newTag, setNewTag] = useState({ label: '', query: '' });

  // Quick Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [quickArticle, setQuickArticle] = useState({
    title: '',
    content: '',
    mainImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    category: 'விளையாட்டு',
    subCategory: 'கிரிக்கெட் & CSK',
    tags: 'விளையாட்டு, கிரிக்கெட், CSK'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getContent('sports_buzz_settings');
      if (data) {
        if (data.liveMatch && typeof data.liveMatch === 'object') {
          setLiveMatch(prev => ({ ...prev, ...data.liveMatch }));
        }
        if (Array.isArray(data.spotlightTags) && data.spotlightTags.length > 0) {
          setSpotlightTags(data.spotlightTags);
        }
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        liveMatch,
        spotlightTags
      };
      await api.saveContent('sports_buzz_settings', payload);
      if (showToast) showToast('✅ விளையாட்டு நேரலை & டிரெண்டிங் தகவல்கள் சேமிக்கப்பட்டன!');
    } catch (err) {
      if (showToast) showToast('❌ சேமிப்பதில் பிழை');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (!newTag.label.trim()) {
      if (showToast) showToast('டேக் பெயர் அவசியம்');
      return;
    }
    const tag = {
      label: newTag.label.startsWith('#') ? newTag.label.trim() : `#${newTag.label.trim()}`,
      query: newTag.query.trim() || newTag.label.replace('#', '').trim()
    };
    setSpotlightTags([...spotlightTags, tag]);
    setNewTag({ label: '', query: '' });
    if (showToast) showToast('ஹாஷ்டேக் சேர்க்கப்பட்டது');
  };

  const handleDeleteTag = (index) => {
    setSpotlightTags(spotlightTags.filter((_, i) => i !== index));
    if (showToast) showToast('ஹாஷ்டேக் நீக்கப்பட்டது');
  };

  const handleCreateQuickArticle = async (e) => {
    e.preventDefault();
    if (!quickArticle.title.trim()) {
      if (showToast) showToast('செய்தியின் தலைப்பு அவசியம்');
      return;
    }

    try {
      const articlePayload = {
        title: quickArticle.title.trim(),
        content: quickArticle.content.trim() || quickArticle.title.trim(),
        category: 'விளையாட்டு',
        subCategory: quickArticle.subCategory,
        mainImage: quickArticle.mainImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
        tags: quickArticle.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: 'published',
        publishedAt: new Date().toISOString()
      };

      if (addNews) {
        await addNews(articlePayload);
      } else {
        await api.createNews(articlePayload);
      }

      setIsArticleModalOpen(false);
      setQuickArticle({
        title: '',
        content: '',
        mainImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
        category: 'விளையாட்டு',
        subCategory: 'கிரிக்கெட் & CSK',
        tags: 'விளையாட்டு, கிரிக்கெட், CSK'
      });
      if (showToast) showToast('✅ புதிய விளையாட்டுச் செய்தி வெளியிடப்பட்டது!');
    } catch (err) {
      if (showToast) showToast('❌ செய்தி சேர்ப்பதில் பிழை');
    }
  };

  // Filter Sports Articles
  const sportsArticles = newsList.filter(art => {
    const cat = (art.category || '').toLowerCase();
    const tags = Array.isArray(art.tags) ? art.tags.join(' ').toLowerCase() : String(art.tags || '').toLowerCase();
    const title = (art.title || '').toLowerCase();
    return cat === 'sports' || cat === 'விளையாட்டு' || tags.includes('விளையாட்டு') || tags.includes('கிரிக்கெட்') || tags.includes('ipl') || title.includes('கிரிக்கெட்') || title.includes('csk') || title.includes('விளையாட்டு');
  });

  const filteredArticles = sportsArticles.filter(art => {
    // Search match
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (art.title || '').toLowerCase().includes(q);
      const matchContent = (art.content || '').toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }

    // Subcategory match
    if (articleSubFilter === 'csk') {
      const txt = `${art.title || ''} ${art.content || ''} ${Array.isArray(art.tags) ? art.tags.join(' ') : ''}`.toLowerCase();
      return txt.includes('csk') || txt.includes('சென்னை') || txt.includes('தோனி') || txt.includes('ipl');
    }
    if (articleSubFilter === 'football') {
      const txt = `${art.title || ''} ${art.content || ''} ${Array.isArray(art.tags) ? art.tags.join(' ') : ''}`.toLowerCase();
      return txt.includes('கால்பந்து') || txt.includes('football') || txt.includes('மெஸ்ஸி') || txt.includes('ரொனால்டோ');
    }
    if (articleSubFilter === 'international') {
      const txt = `${art.title || ''} ${art.content || ''} ${Array.isArray(art.tags) ? art.tags.join(' ') : ''}`.toLowerCase();
      return txt.includes('சர்வதேசம்') || txt.includes('உலகக்கோப்பை') || txt.includes('ஐசிசி') || txt.includes('ஒலிம்பிக்');
    }
    if (articleSubFilter === 'achievers') {
      const txt = `${art.title || ''} ${art.content || ''} ${Array.isArray(art.tags) ? art.tags.join(' ') : ''}`.toLowerCase();
      return txt.includes('சாதனை') || txt.includes('பதக்கம்') || txt.includes('விருது') || txt.includes('வெற்றி');
    }
    return true;
  });

  return (
    <div className="space-y-6 font-tamil">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071f1a] via-[#0d2e26] to-[#041713] rounded-3xl border border-emerald-500/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  விளையாட்டு அரங்கம்
                </span>
                <span className="text-xs text-slate-400">Sports & Live Match Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                விளையாட்டு மேலாளர் (Sports Manager)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsArticleModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              புதிய விளையாட்டுச் செய்தி
            </button>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              அனைத்தும் சேமி
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-emerald-500/15 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('match')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition whitespace-nowrap cursor-pointer ${
              activeTab === 'match'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            நேரலை மேட்ச் சென்டர் & CSK டிராக்கர்
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition whitespace-nowrap cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            விளையாட்டுச் செய்திகள் ({sportsArticles.length})
          </button>

          <button
            onClick={() => setActiveTab('hashtags')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition whitespace-nowrap cursor-pointer ${
              activeTab === 'hashtags'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            ஸ்பாட்லைட் ஹாஷ்டேக்குகள் ({spotlightTags.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE MATCH / CSK TRACKER BANNER */}
      {activeTab === 'match' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Editor Form */}
          <div className="lg:col-span-7 bg-[#0b1424] rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white">நேரலை மேட்ச் விவரங்களை திருத்து</h3>
              </div>
              <span className="text-xs text-slate-400">முகப்பில் உடனடியாக பிரதிபலிக்கும்</span>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-300">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  தொடர் / போட்டியின் பெயர் (Tournament)
                </label>
                <input
                  type="text"
                  value={liveMatch.tournament}
                  onChange={(e) => setLiveMatch({ ...liveMatch, tournament: e.target.value })}
                  placeholder="உதா: TATA IPL 2026 - லீக் ஆட்டம் 18"
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    நிலை பேட்ஜ் (Status Badge)
                  </label>
                  <input
                    type="text"
                    value={liveMatch.badge}
                    onChange={(e) => setLiveMatch({ ...liveMatch, badge: e.target.value })}
                    placeholder="CSK UPDATE / LIVE / FINAL"
                    className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    ஸ்டேட்டஸ் குறியீடு (Tag)
                  </label>
                  <select
                    value={liveMatch.status}
                    onChange={(e) => setLiveMatch({ ...liveMatch, status: e.target.value })}
                    className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LIVE">🔴 LIVE (நேரலை)</option>
                    <option value="FINAL">🏆 FINAL (முடிவு)</option>
                    <option value="UPCOMING">⏰ UPCOMING (விரைவில்)</option>
                    <option value="BREAKING">⚡ BREAKING (முக்கிய செய்தி)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  முக்கிய தலைப்பு (Headline)
                </label>
                <input
                  type="text"
                  value={liveMatch.title}
                  onChange={(e) => setLiveMatch({ ...liveMatch, title: e.target.value })}
                  placeholder="சென்னை சூப்பர் கிங்ஸ் அதிரடி வெற்றி..."
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  மைதானம் / இடம் (Venue)
                </label>
                <input
                  type="text"
                  value={liveMatch.venue}
                  onChange={(e) => setLiveMatch({ ...liveMatch, venue: e.target.value })}
                  placeholder="சேப்பாக்கம் எம்.ஏ. சிதம்பரம் மைதானம், சென்னை"
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  ஸ்கோர்கார்டு / சுருக்கம் (Scorecard Summary)
                </label>
                <textarea
                  rows={3}
                  value={liveMatch.summary}
                  onChange={(e) => setLiveMatch({ ...liveMatch, summary: e.target.value })}
                  placeholder="சிஎஸ்கே 204/3 (20.0) vs மும்பை இந்தியன்ஸ் 188/7 (20.0)..."
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  இணைப்பு முகவரி (Target Link)
                </label>
                <input
                  type="text"
                  value={liveMatch.link}
                  onChange={(e) => setLiveMatch({ ...liveMatch, link: e.target.value })}
                  placeholder="/category/sports"
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                நேரலை தகவலை சேமி (Save Live Match)
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0b1424] rounded-3xl border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  முகப்பு நேரலை முன்னோட்டம் (Live Preview)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Widget
                </span>
              </div>

              {/* Exact Home Match Banner Component Preview */}
              <div className="rounded-2xl bg-gradient-to-br from-[#0c2a20] via-[#091f18] to-[#05130f] border border-emerald-500/40 p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-yellow-400 text-slate-950 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
                      {liveMatch.badge || 'CSK UPDATE'}
                    </span>
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      {liveMatch.status || 'LIVE'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {liveMatch.tournament}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white leading-snug line-clamp-2 mb-2">
                  {liveMatch.title}
                </h4>

                <p className="text-xs text-emerald-200/90 font-medium leading-relaxed mb-3">
                  {liveMatch.summary}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-emerald-500/20 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    {liveMatch.venue}
                  </span>
                  <span className="text-emerald-300 font-bold hover:underline flex items-center gap-1">
                    முழு ஸ்கோர் <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 space-y-2">
              <div className="font-black flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                தகவல் குறிப்பு
              </div>
              <p className="leading-relaxed text-slate-300">
                இந்த நேரலை பேனர் முகப்புப் பக்கத்தின் விளையாட்டு பத்தியின் உச்சிப் பகுதியில் தோன்றும். ஐபிஎல் அல்லது முக்கிய போட்டிகளின் போது நேரடி ஸ்கோர் நிலவரங்களை வாசகர்களுக்கு உடனுக்குடன் வழங்கப் பயன்படுகிறது.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ARTICLES */}
      {activeTab === 'articles' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-[#0b1424] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Subcategory Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {[
                { id: 'all', label: 'அனைத்தும்' },
                { id: 'csk', label: 'கிரிக்கெட் & CSK' },
                { id: 'football', label: 'கால்பந்து' },
                { id: 'international', label: 'சர்வதேசம்' },
                { id: 'achievers', label: 'சாதனையாளர்கள்' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setArticleSubFilter(sub.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap ${
                    articleSubFilter === sub.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="விளையாட்டு செய்திகளில் தேடு..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#050b14] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Articles Table / List */}
          <div className="bg-[#0b1424] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-black text-white">
                விளையாட்டு செய்திகள் பட்டியல் ({filteredArticles.length})
              </span>
              <button
                onClick={() => setIsArticleModalOpen(true)}
                className="text-xs font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> புதிய செய்தி
              </button>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                செய்திகள் எதுவும் கண்டறியப்படவில்லை.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredArticles.map(article => (
                  <div
                    key={article.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <img
                        src={article.mainImage || article.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                            {article.subCategory || article.category || 'விளையாட்டு'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ta-IN') : 'இன்று'}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {article.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 px-2.5 py-1 rounded-lg bg-slate-800/60">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{article.viewsCount || article.views || 0}</span>
                      </div>

                      {deleteNews && (
                        <button
                          onClick={() => {
                            if (window.confirm('இந்த விளையாட்டுச் செய்தியை நிச்சயமாக நீக்க வேண்டுமா?')) {
                              deleteNews(article.id);
                              if (showToast) showToast('செய்தி நீக்கப்பட்டது');
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                          title="நீக்கு"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SPOTLIGHT HASHTAGS */}
      {activeTab === 'hashtags' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#0b1424] rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">புதிய ஸ்பாட்லைட் ஹாஷ்டேக் சேர்க்க</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                முகப்பு ரிப்பனில் தோன்றும் விளையாட்டு டிரெண்டிங் ஹாஷ்டேக்குகள்
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  ஹாஷ்டேக் பெயர் (Tag Label)
                </label>
                <input
                  type="text"
                  placeholder="#IPL2026, #CSK..."
                  value={newTag.label}
                  onChange={(e) => setNewTag({ ...newTag, label: e.target.value })}
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  தேடல் சொல் (Search Query)
                </label>
                <input
                  type="text"
                  placeholder="CSK, IPL, தோனி..."
                  value={newTag.query}
                  onChange={(e) => setNewTag({ ...newTag, query: e.target.value })}
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleAddTag}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                டேக் சேர்க்க
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0b1424] rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">செயலில் உள்ள ஹாஷ்டேக்குகள் ({spotlightTags.length})</h3>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="text-xs font-black text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> மாற்றங்களைச் சேமி
              </button>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {spotlightTags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#050b14] border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-black text-white">{tag.label}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({tag.query})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTag(idx)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="நீக்கு"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUICK SPORTS ARTICLE MODAL */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1424] border border-slate-700 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative font-tamil max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              புதிய விளையாட்டுச் செய்தி சேர்க்க
            </h2>

            <form onSubmit={handleCreateQuickArticle} className="space-y-4 text-xs font-bold text-slate-300">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  செய்தித் தலைப்பு *
                </label>
                <input
                  type="text"
                  required
                  placeholder="உதா: ஐபிஎல் 2026: சிஎஸ்கே அணியின் புதிய சாதனை வெற்றி..."
                  value={quickArticle.title}
                  onChange={(e) => setQuickArticle({ ...quickArticle, title: e.target.value })}
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    துணைப் பிரிவு (Subcategory)
                  </label>
                  <select
                    value={quickArticle.subCategory}
                    onChange={(e) => setQuickArticle({ ...quickArticle, subCategory: e.target.value })}
                    className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="கிரிக்கெட் & CSK">கிரிக்கெட் & CSK</option>
                    <option value="கால்பந்து">கால்பந்து</option>
                    <option value="சர்வதேசம்">சர்வதேசம்</option>
                    <option value="சாதனையாளர்கள்">சாதனையாளர்கள்</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    டேக்குகள் (Tags)
                  </label>
                  <input
                    type="text"
                    placeholder="விளையாட்டு, கிரிக்கெட், CSK"
                    value={quickArticle.tags}
                    onChange={(e) => setQuickArticle({ ...quickArticle, tags: e.target.value })}
                    className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  பட URL (Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={quickArticle.mainImage}
                  onChange={(e) => setQuickArticle({ ...quickArticle, mainImage: e.target.value })}
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  செய்தி விவரம் (Content)
                </label>
                <textarea
                  rows={4}
                  placeholder="செய்தியின் முழு விவரங்களை இங்கு பதிவிடவும்..."
                  value={quickArticle.content}
                  onChange={(e) => setQuickArticle({ ...quickArticle, content: e.target.value })}
                  className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  வெளியிடு
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
