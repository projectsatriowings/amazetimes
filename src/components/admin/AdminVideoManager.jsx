import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  defaultVideos,
  extractYouTubeId,
  formatYouTubeEmbedUrl,
  getYouTubeThumbnailUrl
} from '../../data/videoData';
import {
  Tv,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Play,
  ExternalLink,
  Search,
  RotateCcw,
  Upload,
  X,
  Eye,
  Clock,
  Sparkles,
  Tag,
  Check
} from 'lucide-react';

const CATEGORY_PRESETS = [
  'சிறப்பு நேர்காணல்',
  'சந்தை பார்வை',
  'வரலாற்றுப் பார்வை',
  'சினிமா பஸ்',
  'அரசியல் களம்',
  'தமிழ்நாடு',
  'தொழில்நுட்பம்',
  'விளையாட்டு'
];

const COLOR_OPTIONS = [
  { label: 'சிவப்பு (Red)', value: 'text-red-600 dark:text-red-400', border: 'border-red-500', bg: 'bg-red-500' },
  { label: 'தங்கம் (Amber)', value: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500', bg: 'bg-amber-500' },
  { label: 'பச்சை (Emerald)', value: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500', bg: 'bg-emerald-500' },
  { label: 'ஊதா (Purple)', value: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500', bg: 'bg-purple-500' },
  { label: 'நீலம் (Blue)', value: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500', bg: 'bg-blue-500' },
  { label: 'ரோஸ் (Rose)', value: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500', bg: 'bg-rose-500' }
];

export const AdminVideoManager = () => {
  const {
    videoGalleryList,
    saveVideosData,
    addVideoItem,
    updateVideoItem,
    deleteVideoItem,
    openVideoModal,
    showToast
  } = useApp();

  const videos = (videoGalleryList && videoGalleryList.length > 0) ? videoGalleryList : defaultVideos;

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'சிறப்பு நேர்காணல்',
    videoUrl: '',
    time: '05:00',
    img: '',
    color: 'text-red-600 dark:text-red-400',
    isActive: true
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        category: item.category || 'சிறப்பு நேர்காணல்',
        videoUrl: item.videoUrl || item.embedUrl || '',
        time: item.time || '05:00',
        img: item.img || '',
        color: item.color || 'text-red-600 dark:text-red-400',
        isActive: item.isActive !== false
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        category: 'சிறப்பு நேர்காணல்',
        videoUrl: '',
        time: '05:00',
        img: '',
        color: 'text-red-600 dark:text-red-400',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('படக் கோப்புகளை மட்டுமே பதிவேற்ற முடியும்');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('படத்தின் அளவு 5MB-க்குள் இருக்க வேண்டும்');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, img: event.target.result }));
      setUploadingImage(false);
      showToast('முகப்புப் படம் தயாரானது');
    };
    reader.onerror = () => {
      setUploadingImage(false);
      showToast('படம் ஏற்றுவதில் பிழை ஏற்பட்டது');
    };
    reader.readAsDataURL(file);
  };

  const handleUseYouTubeThumbnail = () => {
    if (!form.videoUrl) {
      showToast('முதலில் YouTube URL-ஐ உள்ளிடவும்');
      return;
    }
    const autoThumb = getYouTubeThumbnailUrl(form.videoUrl);
    if (autoThumb) {
      setForm((prev) => ({ ...prev, img: autoThumb }));
      showToast('YouTube Thumbnail பெறப்பட்டது!');
    } else {
      showToast('செல்லுபடியாகும் YouTube இணைப்பைக் காணவில்லை');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('தயவுசெய்து வீடியோ செய்தியின் தலைப்பை உள்ளிடவும்');
      return;
    }
    if (!form.videoUrl.trim()) {
      showToast('தயவுசெய்து YouTube வீடியோ URL-ஐ உள்ளிடவும்');
      return;
    }

    const videoId = extractYouTubeId(form.videoUrl);
    const finalThumb = form.img || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600');

    if (editingItem) {
      updateVideoItem(editingItem.id, {
        ...form,
        img: finalThumb
      });
    } else {
      addVideoItem({
        ...form,
        img: finalThumb
      });
    }

    setShowModal(false);
  };

  const handleDelete = (item) => {
    if (window.confirm(`"${item.title}" வீடியோவை நீக்க விரும்புகிறீர்களா?`)) {
      deleteVideoItem(item.id);
    }
  };

  const handleToggleActive = (item) => {
    updateVideoItem(item.id, { isActive: !item.isActive });
  };

  const handleResetDefaults = () => {
    if (window.confirm('அனைத்து வீடியோக்களையும் இயல்புநிலைக்கு மீட்டமைக்க விரும்புகிறீர்களா?')) {
      saveVideosData(defaultVideos);
      showToast('இயல்புநிலை வீடியோக்கள் மீட்டமைக்கப்பட்டன');
    }
  };

  // Filtered List
  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.category && v.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || v.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && v.isActive !== false) ||
      (statusFilter === 'inactive' && v.isActive === false);

    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalCount = videos.length;
  const activeCount = videos.filter((v) => v.isActive !== false).length;
  const categoriesCount = new Set(videos.map((v) => v.category)).size;

  return (
    <div className="space-y-6 font-tamil">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a1945] via-[#0d2259] to-[#071336] rounded-3xl p-6 border border-amber-500/30 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest">
            <Tv className="w-4 h-4 text-amber-400" /> மல்டிமீடியா பிரிவு
          </div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            வீடியோ செய்திகள் மேலாண்மை (Video Gallery)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            முகப்புப் பக்கத்தில் தோன்றும் வீடியோ செய்திகள், YouTube இணைப்புகள் மற்றும் காட்சிக் கூடத்தை நிர்வகிக்கவும்.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> புதிய வீடியோ சேர்க்க
          </button>
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            title="இயல்புநிலைக்கு மீட்டமை"
          >
            <RotateCcw className="w-3.5 h-3.5" /> மீட்டமை
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">மொத்த வீடியோக்கள்</span>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">நேரலையில் உள்ளவை</span>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">பிரிவுகள்</span>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{categoriesCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="வீடியோ தலைப்பு அல்லது பிரிவு மூலம் தேடுக..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-red-500"
          >
            <option value="all">அனைத்துப் பிரிவுகள்</option>
            {CATEGORY_PRESETS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-red-500"
          >
            <option value="all">அனைத்து நிலைகளும்</option>
            <option value="active">நேரலை (Active)</option>
            <option value="inactive">முடக்கப்பட்டவை (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Videos List Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Tv className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">வீடியோக்கள் எதுவும் காணப்படவில்லை</h4>
          <p className="text-xs text-slate-500">தேடல் வடிகட்டியை மாற்றவும் அல்லது புதிய வீடியோவை சேர்க்கவும்.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredVideos.map((item) => {
            const thumb = item.img || getYouTubeThumbnailUrl(item.videoUrl) || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600';
            const targetUrl = item.embedUrl || item.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
            const isItemActive = item.isActive !== false;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-[#0f1b3d] rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-card-hover flex flex-col justify-between group ${
                  isItemActive ? 'border-slate-200 dark:border-slate-800' : 'border-slate-300 dark:border-slate-800/50 opacity-60'
                }`}
              >
                <div>
                  {/* Thumbnail & Play Overlay */}
                  <div className="relative h-44 sm:h-48 overflow-hidden bg-black">
                    <img
                      src={thumb}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                    />
                    <div
                      onClick={() => openVideoModal(item.title, targetUrl)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center group-hover:scale-110 shadow-lg transition">
                        <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Time Badge */}
                    {item.time && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {item.time}
                      </span>
                    )}

                    {/* Active Pill Badge */}
                    <span
                      className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow ${
                        isItemActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isItemActive ? 'நேரலை (Live)' : 'மறைக்கப்பட்டது'}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold uppercase ${item.color || 'text-red-500'}`}>
                        {item.category || 'பொது'}
                      </span>
                      {item.views && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {item.views.toLocaleString()} பார்வைகள்
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 truncate font-mono">
                      {item.videoUrl || item.embedUrl}
                    </p>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      isItemActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {isItemActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {isItemActive ? 'முடக்கு' : 'செயல்படுத்து'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openVideoModal(item.title, targetUrl)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="இயக்கிப் பார்"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-500 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="திருத்துக"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="நீக்குக"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5" />
                <h3 className="font-extrabold text-base">
                  {editingItem ? 'வீடியோ விபரத்தை திருத்துக' : 'புதிய வீடியோ செய்தி சேர்க்க'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  செய்தித் தலைப்பு <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="எ.கா: தமிழகத்தில் புதிய தொழில் முதலீடுகள்: அரசு அறிவிப்பு"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500"
                />
              </div>

              {/* YouTube URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  YouTube வீடியோ URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... அல்லது https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  YouTube முழு URL, குறுகிய இணைப்பு (youtu.be), Shorts, அல்லது Embed link அனைத்தையும் ஏற்கிறது.
                </span>
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">பிரிவு (Category)</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="எ.கா: சிறப்பு நேர்காணல்"
                    list="category-suggestions"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">கால அளவு (Duration)</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="05:42"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Thumbnail Image */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    முகப்புப் படம் (Thumbnail)
                  </label>
                  <button
                    type="button"
                    onClick={handleUseYouTubeThumbnail}
                    className="text-[10px] text-red-600 dark:text-red-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> YouTube-லிருந்து தானாக எடு
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.img}
                    onChange={(e) => setForm({ ...form, img: e.target.value })}
                    placeholder="படத்தின் இணைய இணைப்பு (URL) அல்லது கீழே பதிவேற்றவும்"
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500"
                  />
                  <label className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0 text-slate-700 dark:text-slate-300">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? 'ஏற்றுகிறது...' : 'பதிவேற்று'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {/* Preview Thumbnail */}
                {form.img && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden bg-black border border-slate-700">
                    <img src={form.img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, img: '' })}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">பிரிவுக் குறிப்பான் நிறம்</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setForm({ ...form, color: opt.value })}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        form.color === opt.value
                          ? `${opt.border} bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white`
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-full ${opt.bg}`}></span>
                        <span className="text-[11px]">{opt.label.split(' ')[0]}</span>
                      </span>
                      {form.color === opt.value && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">நேரலை நிலை (Active Status)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  ரத்து செய்க
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition cursor-pointer"
                >
                  {editingItem ? 'மாற்றங்களைச் சேமி' : 'வீடியோவைச் சேமி'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
