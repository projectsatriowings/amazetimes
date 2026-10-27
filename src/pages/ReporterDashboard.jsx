import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, CheckCircle, Clock, XCircle, LogOut, RefreshCw,
  Home, Image as ImageIcon, Send, AlertCircle, Eye, Tag, MapPin, ChevronRight
} from 'lucide-react';
import { api, getCurrentUser, logout } from '../services/api';

const DISTRICT_LIST = [
  'அனைத்து மாவட்டங்கள்', 'சென்னை', 'கோயம்புத்தூர்', 'மதுரை', 'திருச்சிராப்பள்ளி',
  'சேலம்', 'திருநெல்வேலி', 'திருப்பூர்', 'வேலூர்', 'ஈரோடு', 'தூத்துக்குடி',
  'திண்டுக்கல்', 'தஞ்சாவூர்', 'ராணிப்பேட்டை', 'சிவகங்கை', 'விருதுநகர்',
  'நாமக்கல்', 'கன்னியாகுமரி', 'கடலூர்', 'திருவள்ளூர்', 'காஞ்சிபுரம்',
  'விழுப்புரம்', 'திருப்பத்தூர்', 'கள்ளக்குறிச்சி', 'செங்கல்பட்டு', 'தென்காசி',
  'தருமபுரி', 'கிருஷ்ணகிரி', 'அரியலூர்', 'பெரம்பலூர்', 'புதுக்கோட்டை',
  'ராமநாதபுரம்', 'நீலகிரி', 'கரூர்', 'நாகப்பட்டினம்', 'திருவாரூர்', 'மயிலாடுதுறை'
];

const CATEGORIES = [
  { id: 'தமிழ்நாடு', name: 'தமிழ்நாடு' },
  { id: 'தேசியம்', name: 'தேசியம்' },
  { id: 'உலகம்', name: 'உலகம்' },
  { id: 'சினிமா', name: 'சினிமா' },
  { id: 'விளையாட்டு', name: 'விளையாட்டு' },
  { id: 'வணிகம்', name: 'வணிகம்' },
  { id: 'கல்வி', name: 'கல்வி & வேலைவாய்ப்பு' },
  { id: 'ஆன்மீகம்', name: 'ஆன்மீகம்' },
  { id: 'மாவட்டங்கள்', name: 'மாவட்டங்கள்' },
  { id: 'தலையங்கம்', name: 'தலையங்கம்' }
];

export default function ReporterDashboard() {
  const [user, setUser] = useState(getCurrentUser());
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'தமிழ்நாடு',
    district: 'அனைத்து மாவட்டங்கள்',
    summary: '',
    content: '',
    mainImage: '',
    tags: '',
    seoKeywords: ''
  });

  const fetchMyArticles = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const currentUser = getCurrentUser();
      const res = await api.getNews({
        limit: 'all',
        author_id: currentUser?.id,
        author_name: currentUser?.full_name || currentUser?.username
      });
      const items = res?.news || res?.data || res?.articles || [];
      setArticles(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Fetch reporter articles error:', err);
      setErrorMsg('செய்திகளை ஏற்றுவதில் பிழை ஏற்பட்டது.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyArticles();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('செய்தித் தலைப்பை உள்ளிடவும்');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await api.createNews({
        ...formData,
        district: formData.district === 'அனைத்து மாவட்டங்கள்' ? 'all' : formData.district,
        authorName: user?.full_name || user?.username || 'செய்தியாளர்',
        status: 'pending' // Enforced for reporter review
      });

      setSuccessMsg('உங்கள் செய்தி நிர்வாகியின் பார்வைக்கு (Pending Approval) வெற்றிகரமாக அனுப்பப்பட்டது!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        subtitle: '',
        category: 'தமிழ்நாடு',
        district: 'அனைத்து மாவட்டங்கள்',
        summary: '',
        content: '',
        mainImage: '',
        tags: '',
        seoKeywords: ''
      });
      fetchMyArticles();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Submit news error:', err);
      alert('செய்தி அனுப்புவதில் பிழை: ' + (err.message || 'தெரியாத பிழை'));
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const totalCount = articles.length;
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const pendingCount = articles.filter(a => a.status === 'pending' || a.status === 'pending_approval' || !a.status).length;
  const rejectedCount = articles.filter(a => a.status === 'rejected').length;

  const filteredArticles = articles.filter(a => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'published') return a.status === 'published';
    if (filterStatus === 'pending') return a.status === 'pending' || a.status === 'pending_approval' || !a.status;
    if (filterStatus === 'rejected') return a.status === 'rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070b19] text-gray-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#0d1527]/90 backdrop-blur-md border-b border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 group text-gray-300 hover:text-white transition">
            <span className="p-1.5 rounded-lg bg-gray-800/80 group-hover:bg-red-600/30 text-red-400 group-hover:text-red-300">
              <Home size={18} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">முகப்புக்குச் செல்க</span>
          </a>
          <span className="text-gray-700">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-red-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              நிருபர் கட்டுப்பாட்டு மையம் (Reporter Portal)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-gray-200">{user?.full_name || user?.username || 'செய்தியாளர்'}</div>
            <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">செய்தியாளர் கணக்கு</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-medium transition"
          >
            <LogOut size={14} />
            <span>வெளியேறு</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/50 flex items-center gap-3 text-emerald-300 text-sm animate-fade-in">
            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats Section */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#0f192e] border border-gray-800/80 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">மொத்தச் செய்திகள்</span>
              <FileText size={18} className="text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalCount}</div>
            <div className="text-[10px] text-gray-500 mt-1">நீங்கள் சமர்ப்பித்தவை</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f192e] border border-gray-800/80 shadow-lg">
            <div className="flex items-center justify-between text-emerald-400/80 mb-2">
              <span className="text-xs font-medium">வெளியிடப்பட்டவை</span>
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{publishedCount}</div>
            <div className="text-[10px] text-emerald-500/80 mt-1">நேரலையில் உள்ளவை</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f192e] border border-gray-800/80 shadow-lg">
            <div className="flex items-center justify-between text-amber-400/80 mb-2">
              <span className="text-xs font-medium">ஒப்புதலுக்கு உள்ளவை</span>
              <Clock size={18} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingCount}</div>
            <div className="text-[10px] text-amber-500/80 mt-1">நிர்வாகி பார்வைக்காக</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f192e] border border-gray-800/80 shadow-lg">
            <div className="flex items-center justify-between text-red-400/80 mb-2">
              <span className="text-xs font-medium">நிராகரிக்கப்பட்டவை</span>
              <XCircle size={18} className="text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-400">{rejectedCount}</div>
            <div className="text-[10px] text-red-500/80 mt-1">மறுஆய்வு தேவை</div>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0f192e]/80 p-3 sm:p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'அனைத்தும்', count: totalCount },
              { id: 'pending', label: 'நிலுவையில் உள்ளவை', count: pendingCount },
              { id: 'published', label: 'வெளியிடப்பட்டவை', count: publishedCount },
              { id: 'rejected', label: 'நிராகரிக்கப்பட்டவை', count: rejectedCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterStatus === tab.id ? 'bg-red-800 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMyArticles}
              disabled={loading}
              className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-gray-300 transition"
              title="புதுப்பிக்க"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-red-900/30 transition"
            >
              <Plus size={16} />
              <span>புதிய செய்தி எழுதுக</span>
            </button>
          </div>
        </div>

        {/* Article List Table / Cards */}
        <section className="bg-[#0f192e] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
              <RefreshCw size={28} className="animate-spin text-red-500" />
              <p className="text-xs">செய்திகள் ஏற்றப்படுகின்றன...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-20 text-center text-gray-400 space-y-2">
              <FileText size={40} className="mx-auto text-gray-600" />
              <p className="text-sm font-semibold">செய்திகள் எதுவும் காணப்படவில்லை</p>
              <p className="text-xs text-gray-500">புதிய செய்திகளை எழுதி நிர்வாகி பார்வைக்கு அனுப்பவும்.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 px-4 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>முதல் செய்தியை எழுதுக</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {filteredArticles.map(art => {
                const isPending = art.status === 'pending' || art.status === 'pending_approval' || !art.status;
                const isPub = art.status === 'published';
                const isRej = art.status === 'rejected';

                return (
                  <div key={art.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 flex-shrink-0">
                        <img
                          src={art.mainImage || art.image || '/Amaze times.jpg'}
                          alt={art.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300">
                            {art.category || 'பொது'}
                          </span>
                          {art.district && art.district !== 'all' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950/60 text-blue-300 border border-blue-900/50">
                              {art.district}
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                              <Clock size={10} /> நிலுவையில் (Pending Review)
                            </span>
                          )}
                          {isPub && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                              <CheckCircle size={10} /> வெளியிடப்பட்டது (Published)
                            </span>
                          )}
                          {isRej && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-300 border border-red-800/60">
                              <XCircle size={10} /> நிராகரிக்கப்பட்டது (Rejected)
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-gray-100 line-clamp-2 hover:text-red-400 transition">
                          {art.title}
                        </h3>

                        {art.summary && (
                          <p className="text-xs text-gray-400 line-clamp-1">{art.summary}</p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                          <span>{art.date || art.time || (art.created_at ? new Date(art.created_at).toLocaleDateString('ta-IN') : 'இன்று')}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {art.views_count || art.viewsCount || 0} பார்வைகள்
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Write News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e1628] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-[#0e1628]/95 backdrop-blur-md px-5 py-4 border-b border-gray-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <FileText className="text-red-500" size={20} />
                <h2 className="text-base font-bold text-white">புதிய செய்தி உருவாக்குதல்</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
              {/* Notice */}
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-700/50 flex items-start gap-2.5 text-xs text-amber-200">
                <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>கவனிக்க:</strong> செய்தியாளர்கள் சமர்ப்பிக்கும் அனைத்து செய்திகளும் தலைமை ஆசிரியர் / நிர்வாகியின் பார்வைக்கு அனுப்பப்பட்டு சரிபார்க்கப்பட்ட பின்னரே தளத்தில் நேரலையாக வெளியிடப்படும்.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">செய்தித் தலைப்பு *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="கவர்ச்சிகரமான தலைப்பை உள்ளிடவும்..."
                  className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">துணைத் தலைப்பு (விருப்பத்தேர்வு)</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="செய்தியின் கூடுதல் துணைத் தலைப்பு..."
                  className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Category & District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">பிரிவு (Category)</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">மாவட்டம்</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    {DISTRICT_LIST.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">பட URL (Image URL)</label>
                <input
                  type="url"
                  name="mainImage"
                  value={formData.mainImage}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                />
                {formData.mainImage && (
                  <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={formData.mainImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
                    />
                  </div>
                )}
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">செய்தி சுருக்கம் (Short Summary)</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="செய்தியின் 2 வரி முக்கிய சுருக்கம்..."
                  className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">முழு செய்தி விவரம் (Full Content) *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={5}
                  required
                  placeholder="செய்தியின் முழு விவரங்களை பத்தி பத்தியாக எழுதவும்..."
                  className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 resize-y"
                />
              </div>

              {/* Tags & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">குறிச்சொற்கள் (Tags)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="உ.ம்: தேர்தல், தமிழகம், முக்கிய செய்தி"
                    className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">SEO தேடல் சொற்கள்</label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    placeholder="tamil news, breaking news"
                    className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-950 transition disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>சமர்ப்பிக்கப்படுகிறது...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>ஒப்புதலுக்கு அனுப்புக</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
