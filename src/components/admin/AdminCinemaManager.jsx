import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Film,
  Star,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Flame,
  Search,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Tag
} from 'lucide-react';

export const AdminCinemaManager = ({ showToast }) => {
  const { newsList = [], addNews, updateNews, deleteNews } = useApp();

  const [activeTab, setActiveTab] = useState('buzz'); // 'buzz' | 'articles' | 'hashtags'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Box Office Buzz Items
  const [boxOfficeBuzz, setBoxOfficeBuzz] = useState([
    {
      id: 1,
      title: 'தளபதி 69 (Thalapathy 69)',
      star: 'விஜய்',
      rating: '5.0',
      statusBadge: 'ரூ.1,000+ கோடி எதிர்பார்ப்பு',
      collection: 'படப்பிடிப்பில் • மெகா எதிர்பார்ப்பு',
      notes: 'அரசியல் களத்திற்கு செல்லும் முன் தளபதியின் கடைசி பிரம்மாண்ட படைப்பு'
    },
    {
      id: 2,
      title: 'கூலி (Coolie)',
      star: 'ரஜினிகாந்த்',
      rating: '4.9',
      statusBadge: 'மெகா பிளாக்பஸ்டர்',
      collection: 'ரூ.450+ கோடி வசூல் சாதனை',
      notes: 'லோகேஷ் கனகராஜ் இயக்கத்தில் சூப்பர்ஸ்டாரின் அதிரடி ஆக்ஷன் வேட்டை'
    },
    {
      id: 3,
      title: 'விடாமுயற்சி (Vidaamuyarchi)',
      star: 'அஜித் குமார்',
      rating: '4.8',
      statusBadge: 'சூப்பர் ஹிட் டிரெண்டிங்',
      collection: 'ரூ.300+ கோடி எதிர்பார்ப்பு',
      notes: 'மகிழ் திருமேனி இயக்கத்தில் அனிருத் இசையில் சர்வதேச கார் சேஸிங் காட்சிகள்'
    }
  ]);

  // Spotlight Hashtags
  const [spotlightTags, setSpotlightTags] = useState([
    { label: '#தளபதி69', query: 'தளபதி 69' },
    { label: '#விடாமுயற்சி', query: 'விடாமுயற்சி' },
    { label: '#Jailer2', query: 'Jailer 2' },
    { label: '#திரைவிமர்சனம்', query: 'திரைவிமர்சனம்' },
    { label: '#பாக்ஸ்ஆபீஸ்', query: 'பாக்ஸ் ஆபீஸ்' },
    { label: '#OTTவெளியீடு', query: 'OTT' }
  ]);

  // Article Subcategory Filter
  const [articleSubFilter, setArticleSubFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Form State
  const [newMovie, setNewMovie] = useState({
    title: '',
    star: '',
    rating: '5.0',
    statusBadge: 'ரூ.1,000+ கோடி எதிர்பார்ப்பு',
    collection: '',
    notes: ''
  });

  const [newTag, setNewTag] = useState({ label: '', query: '' });

  // Quick Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [quickArticle, setQuickArticle] = useState({
    title: '',
    content: '',
    mainImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    category: 'சினிமா',
    subCategory: 'திரைவிமர்சனம்',
    tags: 'சினிமா, கோலிவுட்'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getContent('cinema_buzz_settings');
      if (data) {
        if (Array.isArray(data.boxOfficeBuzz) && data.boxOfficeBuzz.length > 0) {
          setBoxOfficeBuzz(data.boxOfficeBuzz);
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
        boxOfficeBuzz,
        spotlightTags
      };
      await api.saveContent('cinema_buzz_settings', payload);
      if (showToast) showToast('✅ சினிமா பாக்ஸ் ஆபீஸ் & டிரெண்டிங் டேக்குகள் சேமிக்கப்பட்டன!');
    } catch (err) {
      if (showToast) showToast('❌ சேமிப்பதில் பிழை');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMovie = () => {
    if (!newMovie.title.trim()) {
      if (showToast) showToast('திரைப்படத்தின் பெயர் அவசியம்');
      return;
    }
    const item = {
      id: Date.now(),
      ...newMovie
    };
    setBoxOfficeBuzz([item, ...boxOfficeBuzz]);
    setNewMovie({
      title: '',
      star: '',
      rating: '5.0',
      statusBadge: 'ரூ.1,000+ கோடி எதிர்பார்ப்பு',
      collection: '',
      notes: ''
    });
    if (showToast) showToast('திரைப்படம் சேர்க்கப்பட்டது');
  };

  const handleDeleteMovie = (id) => {
    setBoxOfficeBuzz(boxOfficeBuzz.filter(m => m.id !== id));
    if (showToast) showToast('திரைப்படம் நீக்கப்பட்டது');
  };

  const handleAddTag = () => {
    if (!newTag.label.trim()) return;
    const tag = {
      label: newTag.label.startsWith('#') ? newTag.label.trim() : `#${newTag.label.trim()}`,
      query: newTag.query.trim() || newTag.label.replace(/^#/, '').trim()
    };
    setSpotlightTags([...spotlightTags, tag]);
    setNewTag({ label: '', query: '' });
    if (showToast) showToast('டிரெண்டிங் ஹேஷ்டேக் சேர்க்கப்பட்டது');
  };

  const handleDeleteTag = (index) => {
    setSpotlightTags(spotlightTags.filter((_, idx) => idx !== index));
  };

  const handleCreateQuickArticle = (e) => {
    e.preventDefault();
    if (!quickArticle.title.trim() || !quickArticle.content.trim()) {
      if (showToast) showToast('தலைப்பு மற்றும் செய்தி விவரம் அவசியம்');
      return;
    }
    addNews({
      title: quickArticle.title,
      content: quickArticle.content,
      mainImage: quickArticle.mainImage,
      category: 'சினிமா',
      tags: `${quickArticle.subCategory}, ${quickArticle.tags}`,
      createdAt: new Date().toISOString()
    });
    setIsArticleModalOpen(false);
    setQuickArticle({
      title: '',
      content: '',
      mainImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      category: 'சினிமா',
      subCategory: 'திரைவிமர்சனம்',
      tags: 'சினிமா, கோலிவுட்'
    });
    if (showToast) showToast('✅ புதிய சினிமா செய்தி வெற்றிகரமாக சேர்க்கப்பட்டது!');
  };

  // Cinema Articles Filtering
  const cinemaArticles = newsList.filter(art => {
    const cat = (art.category || '').toLowerCase();
    const tags = Array.isArray(art.tags) ? art.tags.join(' ').toLowerCase() : String(art.tags || '').toLowerCase();
    const title = (art.title || '').toLowerCase();
    const matchesCat = cat === 'cinema' || cat === 'சினிமா' || cat.includes('விமர்சனம்') || tags.includes('சினிமா') || title.includes('சினிமா');
    
    if (!matchesCat) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      if (!title.includes(q)) return false;
    }

    if (articleSubFilter === 'reviews') return title.includes('விமர்சனம்') || tags.includes('விமர்சனம்');
    if (articleSubFilter === 'trailers') return title.includes('டிரெய்லர்') || title.includes('டீசர்') || title.includes('பாடல்');
    if (articleSubFilter === 'boxoffice') return title.includes('வசூல்') || title.includes('பாக்ஸ் ஆபீஸ்');

    return true;
  });

  return (
    <div className="space-y-6 font-tamil">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1c0828] via-[#2d0e3e] to-[#1c0828] text-white p-6 rounded-3xl border border-red-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
              <Film className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">சினிமா & பாக்ஸ் ஆபீஸ் மேலாளர் (Cinema Manager)</h2>
          </div>
          <p className="text-xs text-slate-300">
            திரைவிமர்சனங்கள், பாக்ஸ் ஆபீஸ் எதிர்பார்ப்பு டிராக்கர் மற்றும் ஸ்பாட்லைட் ஹேஷ்டேக்குகளை நிர்வகிக்கவும்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsArticleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ சினிமா செய்தி சேர்க்க</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'சேமிக்கப்படுகிறது...' : 'சேமி'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#0f172a] p-1.5 rounded-2xl border border-slate-800 self-start">
        <button
          onClick={() => setActiveTab('buzz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'buzz'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>பாக்ஸ் ஆபீஸ் டிராக்கர் (Box Office Buzz)</span>
        </button>

        <button
          onClick={() => setActiveTab('hashtags')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'hashtags'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>ஸ்பாட்லைட் ஹேஷ்டேக்குகள் ({spotlightTags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'articles'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>சினிமா செய்திகள் ({cinemaArticles.length})</span>
        </button>
      </div>

      {/* 1. BOX OFFICE BUZZ TAB */}
      {activeTab === 'buzz' && (
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>பாக்ஸ் ஆபீஸ் எதிர்பார்ப்பு கார்டுகள் (Top Expected Movies)</span>
          </h3>

          {/* Add Movie Card */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">திரைப்படம் பெயர்:*</label>
              <input
                type="text"
                value={newMovie.title}
                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                placeholder="எ.கா: தளபதி 69 (Thalapathy 69)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">முன்னணி நட்சத்திரம் (Star):</label>
              <input
                type="text"
                value={newMovie.star}
                onChange={(e) => setNewMovie({ ...newMovie, star: e.target.value })}
                placeholder="எ.கா: விஜய் / ரஜினிகாந்த்"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">நிலவர பேட்ஜ் (Status Badge):</label>
              <input
                type="text"
                value={newMovie.statusBadge}
                onChange={(e) => setNewMovie({ ...newMovie, statusBadge: e.target.value })}
                placeholder="எ.கா: ரூ.1,000+ கோடி எதிர்பார்ப்பு"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">வசூல் எதிர்பார்ப்பு விவரம்:</label>
              <input
                type="text"
                value={newMovie.collection}
                onChange={(e) => setNewMovie({ ...newMovie, collection: e.target.value })}
                placeholder="எ.கா: படப்பிடிப்பில் • மெகா எதிர்பார்ப்பு"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">விளக்கக் குறிப்பு:</label>
              <input
                type="text"
                value={newMovie.notes}
                onChange={(e) => setNewMovie({ ...newMovie, notes: e.target.value })}
                placeholder="சுருக்கமான தகவல்கள்..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <button
                onClick={handleAddMovie}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>படத்தில் சேர்</span>
              </button>
            </div>
          </div>

          {/* Movies List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boxOfficeBuzz.map((m) => (
              <div key={m.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {m.rating || '5.0'}
                    </span>
                    <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
                      {m.statusBadge}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{m.title}</h4>
                  <p className="text-xs text-slate-300 font-semibold">{m.collection || m.star}</p>
                  {m.notes && <p className="text-[11px] text-slate-400 leading-relaxed italic">{m.notes}</p>}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleDeleteMovie(m.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    title="நீக்கு"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. HASHTAGS TAB */}
      {activeTab === 'hashtags' && (
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <span>சினிமா ஸ்பாட்லைட் ஹேஷ்டேக்குகள் (Trending Cinema Hashtags)</span>
          </h3>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs">
            <div className="md:col-span-5">
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">ஹேஷ்டேக் பெயர் (Label):*</label>
              <input
                type="text"
                value={newTag.label}
                onChange={(e) => setNewTag({ ...newTag, label: e.target.value })}
                placeholder="எ.கா: #தளபதி69"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="md:col-span-5">
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">தேடல் வினவல் (Query):</label>
              <input
                type="text"
                value={newTag.query}
                onChange={(e) => setNewTag({ ...newTag, query: e.target.value })}
                placeholder="எ.கா: தளபதி 69"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleAddTag}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>சேர்</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {spotlightTags.map((tag, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 bg-slate-900 text-rose-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2"
              >
                <span>{tag.label}</span>
                <button
                  onClick={() => handleDeleteTag(idx)}
                  className="hover:text-rose-500 cursor-pointer ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ARTICLES TAB */}
      {activeTab === 'articles' && (
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold text-white">சினிமா செய்திகள் & கட்டுரைகள்</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'all', label: 'அனைத்தும்' },
                { id: 'reviews', label: 'விமர்சனம்' },
                { id: 'trailers', label: 'டிரெய்லர்' },
                { id: 'boxoffice', label: 'பாக்ஸ் ஆபீஸ்' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setArticleSubFilter(sub.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    articleSubFilter === sub.id ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cinemaArticles.map(art => (
              <div key={art.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <img src={art.mainImage || art.img || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=80'} alt={art.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{art.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{art.content}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{art.time || 'சமீபத்தில்'}</span>
                    <span>•</span>
                    <span className="text-red-400 font-bold">{art.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Article Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-3xl max-w-xl w-full p-6 border border-red-500/40 text-white space-y-4">
            <h3 className="text-base font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Film className="w-5 h-5 text-red-500" />
              <span>புதிய சினிமா செய்தி சேர்க்க</span>
            </h3>

            <form onSubmit={handleCreateQuickArticle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">செய்தி தலைப்பு:*</label>
                <input
                  type="text"
                  required
                  value={quickArticle.title}
                  onChange={(e) => setQuickArticle({ ...quickArticle, title: e.target.value })}
                  placeholder="எ.கா: தளபதி 69 படப்பிடிப்பு சென்னையில் தொடக்கம்"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">துணைப் பிரிவு (Subcategory):</label>
                <select
                  value={quickArticle.subCategory}
                  onChange={(e) => setQuickArticle({ ...quickArticle, subCategory: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="திரைவிமர்சனம்">திரைவிமர்சனம் (Reviews)</option>
                  <option value="டீசர் & டிரெய்லர்">டீசர் & டிரெய்லர் (Trailers)</option>
                  <option value="பாக்ஸ் ஆபீஸ்">பாக்ஸ் ஆபீஸ் (Box Office)</option>
                  <option value="கிசுகிசு">கிசுகிசு & பிரத்யேகத் தகவல்கள்</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">செய்தி விவரம்:*</label>
                <textarea
                  rows="4"
                  required
                  value={quickArticle.content}
                  onChange={(e) => setQuickArticle({ ...quickArticle, content: e.target.value })}
                  placeholder="முழு செய்தி விளக்கம்..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">படம் URL:</label>
                <input
                  type="text"
                  value={quickArticle.mainImage}
                  onChange={(e) => setQuickArticle({ ...quickArticle, mainImage: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-xl cursor-pointer"
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

export default AdminCinemaManager;
