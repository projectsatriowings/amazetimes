import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { defaultBirthdayWishes } from '../../data/birthdayData';
import {
  Award,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  User,
  Heart,
  Sparkles,
  RefreshCw,
  X,
  Cake,
  PartyPopper,
  Star,
  MapPin
} from 'lucide-react';

export const AdminBirthdayManager = () => {
  const {
    birthdayWishes,
    addBirthdayOfficial,
    updateBirthdayOfficial,
    deleteBirthdayOfficial,
    showToast
  } = useApp();

  const officialsList = (birthdayWishes && birthdayWishes.length > 0) ? birthdayWishes : defaultBirthdayWishes;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    designation: '',
    department: '',
    district: 'தமிழ்நாடு',
    dobDisplay: '',
    photo: '',
    wishesMessage: '',
    wishesCount: 500,
    isToday: false,
    isActive: true
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name || '',
        designation: item.designation || '',
        department: item.department || '',
        district: item.district || 'தமிழ்நாடு',
        dobDisplay: item.dobDisplay || '',
        photo: item.photo || '',
        wishesMessage: item.wishesMessage || '',
        wishesCount: item.wishesCount || 0,
        isToday: item.isToday || false,
        isActive: item.isActive !== undefined ? item.isActive : true
      });
    } else {
      setEditingItem(null);
      setForm({
        name: '',
        designation: '',
        department: '',
        district: 'தமிழ்நாடு',
        dobDisplay: 'செப்டம்பர் 25',
        photo: '',
        wishesMessage: '',
        wishesCount: 500,
        isToday: true,
        isActive: true
      });
    }
    setShowModal(true);
  };

  // Image Upload Dropzone Handler
    const compressImage = (file, maxWidth = 350, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadingImage(true);

    try {
      const res = await api.uploadImage(file);
      if (res && res.success && (res.imageUrl || res.url)) {
        const imgUrl = res.imageUrl || res.url;
        setForm(prev => ({ ...prev, photo: imgUrl }));
        if (showToast) showToast('அதிகாரி படம் பதிவேற்றப்பட்டது!');
        setUploadingImage(false);
        return;
      }
    } catch (err) {}

    try {
      const compressedDataUrl = await compressImage(file, 350, 0.7);
      setForm(prev => ({ ...prev, photo: compressedDataUrl }));
      if (showToast) showToast('அதிகாரி படம் சுருக்கப்பட்டு சேமிக்கப்பட்டது!');
    } catch (err) {
      if (showToast) showToast('படம் பதிவேற்றுவதில் பிழை');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.designation.trim() || !form.wishesMessage.trim()) {
      showToast('தயவுசெய்து அதிகாரி பெயர், பதவி மற்றும் வாழ்த்துச் செய்தியை நிரப்பவும்');
      return;
    }

    if (editingItem) {
      updateBirthdayOfficial(editingItem.id, form);
    } else {
      addBirthdayOfficial(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`'${name}' அதிகாரி பதிவை நீக்க நிச்சயமாக விரும்புகிறீர்களா?`)) {
      deleteBirthdayOfficial(id);
    }
  };

  const filteredOfficials = officialsList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.designation.toLowerCase().includes(q) ||
      (item.department && item.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a1945] via-[#0d225c] to-[#0a1945] text-white p-6 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest">
            <Award className="w-4 h-4" /> தமிழ்நாடு அரசுத் தலைவர்கள் & அதிகாரிகள்
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-tamil flex items-center gap-2">
            <span>பிறந்தநாள் வாழ்த்து மேலாண்மை (Govt Birthday Manager)</span>
            <Cake className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-300">
            தமிழக முதலமைச்சர், அமைச்சர்கள் மற்றும் IAS/IPS அதிகாரிகளின் பிறந்தநாள் வாழ்த்து அட்டைகளை நிர்வகிக்கவும்.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition transform hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ புதிய அதிகாரி சேர்</span>
        </button>
      </div>

      {/* Filter & Stats Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="அதிகாரி பெயர் அல்லது பதவி தேட..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 text-white pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
          <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            மொத்தம்: <strong className="text-amber-400">{officialsList.length}</strong> அதிகாரிகள்
          </span>
          <span className="bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
            <Cake className="w-3.5 h-3.5 text-amber-400" />
            இன்றைய பிறந்தநாள்: <strong className="text-amber-400">{officialsList.filter((o) => o.isToday).length}</strong>
          </span>
        </div>
      </div>

      {/* Officials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOfficials.map((item) => (
          <div
            key={item.id}
            className={`bg-[#0f172a] rounded-3xl border p-5 shadow-lg space-y-4 flex flex-col justify-between transition ${
              item.isToday ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/10 to-[#0f172a]' : 'border-slate-800'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={item.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/80 shadow"
                    />
                    {item.isToday && (
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5">
                        <Cake className="w-3 h-3 text-slate-950" /> TODAY
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base leading-snug">{item.name}</h3>
                    <p className="text-xs font-bold text-amber-400 mt-0.5">{item.designation}</p>
                    <p className="text-[11px] text-slate-400">{item.department}</p>
                  </div>
                </div>
              </div>

              {/* Wishes Message Box */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
                "{item.wishesMessage}"
              </div>

              {/* Details Row */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-semibold">
                <span className="flex items-center gap-1 text-amber-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> {item.dobDisplay || 'பிறந்தநாள்'}
                </span>
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {item.wishesCount || 0} வாழ்த்துகள்
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleOpenModal(item)}
                className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 text-xs font-bold cursor-pointer transition flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> திருத்து
              </button>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 text-xs font-bold cursor-pointer transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> நீக்கு
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Official Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-[#0f172a] shrink-0">
              <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {editingItem ? 'அதிகாரி விவரங்களை திருத்து' : 'புதிய அரசு அதிகாரி சேர்'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs font-semibold overflow-y-auto flex-1">
              {/* Photo File Upload Dropzone */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">அதிகாரி படம் (Photo File Upload):</label>
                <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/90 rounded-2xl p-4 text-center space-y-2 relative transition cursor-pointer">
                  {form.photo ? (
                    <div className="flex items-center justify-center gap-4">
                      <img src={form.photo} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow" />
                      <div className="text-left space-y-1">
                        <span className="text-emerald-400 font-bold block">✓ படம் தேர்ந்தெடுக்கப்பட்டது</span>
                        <label className="text-[11px] text-amber-400 hover:underline cursor-pointer font-bold block">
                          மாற்று (Change Photo)
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2">
                      <Upload className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                      <span className="text-slate-300 font-bold block">படத்தை இங்கே கிளிக் செய்து பதிவேற்றவும்</span>
                      <span className="text-[10px] text-slate-500 block">PNG, JPG, WEBP (Max 5MB)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  {uploadingImage && <div className="text-amber-400 text-[10px] font-bold">பதிவேற்றப்படுகிறது...</div>}
                </div>
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">அதிகாரி / தலைவர் பெயர்:*</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: மாண்புமிகு மு.க. ஸ்டாலின்"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">பதவி (Designation):*</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: முதலமைச்சர் / முதன்மைச் செயலாளர்"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Department & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">துறை / அலுவலகம்:</label>
                  <input
                    type="text"
                    placeholder="எ.கா: தமிழ்நாட்டின் பள்ளிக் கல்வித் துறை"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">பிறந்த தேதி (காட்சிப்படுத்துதல்):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: செப்டம்பர் 25 / மார்ச் 01"
                    value={form.dobDisplay}
                    onChange={(e) => setForm({ ...form, dobDisplay: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Wishes Message Quote */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">பிறந்தநாள் வாழ்த்துச் செய்தி (Wishes Quote):*</label>
                <textarea
                  rows={3}
                  required
                  placeholder="அதிகாரிக்கு வழங்கும் உத்தியோகபூர்வ பிறந்தநாள் வாழ்த்துச் செய்தி..."
                  value={form.wishesMessage}
                  onChange={(e) => setForm({ ...form, wishesMessage: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Checkbox Options */}
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
                  <input
                    type="checkbox"
                    checked={form.isToday}
                    onChange={(e) => setForm({ ...form, isToday: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <Cake className="w-4 h-4 text-amber-400" />
                  <span>இன்றைய பிறந்தநாளாக முன்னிலைப்படுத்து (Is Today's Birthday)</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {editingItem ? 'புதுப்பி' : 'சேமி'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
