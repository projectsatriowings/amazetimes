import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../../services/api';
import {
  Calendar,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Upload,
  RefreshCw,
  Eye,
  Star
} from 'lucide-react';

export const AdminSpecialDaysManager = ({ showToast }) => {
  const [specialDays, setSpecialDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    dateDisplay: '',
    bannerImage: '',
    greetingMessage: '',
    category: 'festival',
    isActive: true,
    isFeatured: false
  });

  useEffect(() => {
    loadSpecialDays();
  }, []);

  const loadSpecialDays = async () => {
    setLoading(true);
    try {
      const res = await api.getAllSpecialDays();
      if (res && res.success && Array.isArray(res.data)) {
        setSpecialDays(res.data);
      }
    } catch (err) {
      console.error('Error loading special days:', err);
      if (showToast) showToast('சிறப்பு தினங்களை ஏற்றுவதில் பிழை');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      subtitle: '',
      dateDisplay: '',
      bannerImage: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80',
      greetingMessage: 'அனைத்து உலகத் தமிழ் மக்களுக்கும் அமேஸ் டைம்ஸ் இதழின் இனிய திருநாள் நல்வாழ்த்துகள்!',
      category: 'festival',
      isActive: true,
      isFeatured: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      dateDisplay: item.dateDisplay || item.date_display || '',
      bannerImage: item.bannerImage || item.banner_image || '',
      greetingMessage: item.greetingMessage || item.greeting_message || '',
      category: item.category || 'festival',
      isActive: Boolean(item.isActive !== undefined ? item.isActive : item.is_active),
      isFeatured: Boolean(item.isFeatured !== undefined ? item.isFeatured : item.is_featured)
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadFile(file);
      if (res && res.url) {
        setFormData(prev => ({ ...prev, bannerImage: getMediaUrl(res.url) }));
        if (showToast) showToast('பதாகைப் படம் வெற்றிகரமாகப் பதிவேற்றப்பட்டது!');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (showToast) showToast('படம் பதிவேற்றுவதில் பிழை: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      if (showToast) showToast('தலைப்பு கட்டாயமானது');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const res = await api.updateSpecialDay(editingItem.id, formData);
        if (res && res.success) {
          if (showToast) showToast('சிறப்பு தினம் புதுப்பிக்கப்பட்டது!');
          setShowModal(false);
          loadSpecialDays();
        }
      } else {
        const res = await api.createSpecialDay(formData);
        if (res && res.success) {
          if (showToast) showToast('புதிய சிறப்பு தினம் உருவாக்கப்பட்டது!');
          setShowModal(false);
          loadSpecialDays();
        }
      }
    } catch (err) {
      console.error('Save special day error:', err);
      if (showToast) showToast('சேமிப்பதில் பிழை: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('இந்த சிறப்பு தின பதாகையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?')) return;
    try {
      const res = await api.deleteSpecialDay(id);
      if (res && res.success) {
        if (showToast) showToast('சிறப்பு தினம் நீக்கப்பட்டது!');
        loadSpecialDays();
      }
    } catch (err) {
      if (showToast) showToast('நீக்குவதில் பிழை');
    }
  };

  const handleToggleActive = async (item) => {
    const newStatus = !item.isActive;
    try {
      await api.updateSpecialDay(item.id, { isActive: newStatus });
      setSpecialDays(prev => prev.map(s => s.id === item.id ? { ...s, isActive: newStatus, is_active: newStatus } : s));
      if (showToast) showToast(newStatus ? 'பதாகை இயக்கப்பட்டது' : 'பதாகை முடக்கப்பட்டது');
    } catch (err) {
      if (showToast) showToast('நிலை மாற்றுவதில் பிழை');
    }
  };

  return (
    <div className="space-y-8 font-tamil">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-pink-500/10 text-pink-400 rounded-lg border border-pink-500/20">
              <Calendar className="w-6 h-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">சிறப்பு தினங்கள் & விழா வாழ்த்துகள் (Special Days Manager)</h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            பண்டிகைகள், அரசு விழாக்கள் மற்றும் வாசகர்களுக்கான வாழ்த்து பதாகைகளை நிர்வகிக்கவும்.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>புதிய சிறப்பு தினம் சேர்</span>
        </button>
      </div>

      {/* Grid of Special Days */}
      {loading ? (
        <div className="flex justify-center p-12 text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin text-pink-500" />
        </div>
      ) : specialDays.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
          <Sparkles className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="font-bold text-base text-slate-300">சிறப்பு தினங்கள் எதுவும் இல்லை</p>
          <p className="text-xs mt-1">புதிய விழா பதாகையைச் சேர்க்க மேலே உள்ள பொத்தானைக் கிளிக் செய்யவும்.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialDays.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col"
            >
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={item.bannerImage || item.banner_image || '/Amaze times.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 border border-slate-700 backdrop-blur-md">
                    {item.dateDisplay || item.date_display || 'இன்று'}
                  </span>
                  {item.isFeatured && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-slate-950" /> முகப்பு
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer border ${
                      item.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {item.isActive ? 'இயக்கத்தில்' : 'முடக்கப்பட்டது'}
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-sm sm:text-base leading-snug drop-shadow">{item.title}</h3>
                  {item.subtitle && <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{item.subtitle}</p>}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-400 line-clamp-2 italic">
                  "{item.greetingMessage || item.greeting_message}"
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{item.wishesCount || item.wishes_count || 0} வாசகர் வாழ்த்துகள்</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="திருத்து (Edit)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                      title="நீக்கு (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              {editingItem ? 'சிறப்பு தின பதாகையைத் திருத்து' : 'புதிய சிறப்பு தினம் உருவாக்கு'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">முதன்மைத் தலைப்பு *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="எ.கா: தமிழ் புத்தாண்டு நல்வாழ்த்துகள் 2026!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">துணைத் தலைப்பு</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="எ.கா: இனிய சித்திரை திருநாள் வாழ்த்துகள்"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">நாள் / தேதி</label>
                  <input
                    type="text"
                    value={formData.dateDisplay}
                    onChange={(e) => setFormData({ ...formData, dateDisplay: e.target.value })}
                    placeholder="எ.கா: சித்திரை 1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">வகை (Category)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="festival">திருவிழா / பண்டிகை</option>
                    <option value="national">தேசிய விழா</option>
                    <option value="memorial">நினைவு நாள்</option>
                    <option value="birthday">பிறந்த நாள்</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">பதாகைப் படம் (Banner Image)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1 border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? '...' : 'ஏற்று'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">வாழ்த்துச் செய்தி</label>
                <textarea
                  rows={3}
                  value={formData.greetingMessage}
                  onChange={(e) => setFormData({ ...formData, greetingMessage: e.target.value })}
                  placeholder="வாசகர்களுக்குக் காண்பிக்கப்படும் வாழ்த்து வாசகம்..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-500"
                  />
                  <span>இயக்கத்தில் வைக்கவும் (Is Active)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>முகப்புச் சிறப்பு (Featured)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold cursor-pointer"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'சேமிக்கப்படுகிறது...' : 'சேமி'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialDaysManager;
