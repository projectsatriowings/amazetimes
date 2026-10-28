import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { defaultBirthdayWishes, checkIsTodayBirthday } from '../../data/birthdayData';
import { shareBirthdayItem } from '../../utils/birthdayShare';
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
  MapPin,
  Eye,
  Share2,
  Globe,
  Image as ImageIcon
} from 'lucide-react';

const YoutubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsappIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const AdminBirthdayManager = () => {
  const {
    birthdayWishes,
    addBirthdayOfficial,
    updateBirthdayOfficial,
    deleteBirthdayOfficial,
    openBirthdayModal,
    showToast
  } = useApp();

  const officialsList = birthdayWishes && birthdayWishes.length > 0 ? birthdayWishes : defaultBirthdayWishes;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingTarget, setUploadingTarget] = useState(null); // 'photo' | 'poster'

  // Form State
  const [form, setForm] = useState({
    name: '',
    englishName: '',
    designation: '',
    englishDesignation: '',
    department: '',
    district: 'தமிழ்நாடு',
    dob: '',
    dobDisplay: '',
    photo: '',
    posterImage: '',
    wishesMessage: '',
    englishWishMessage: '',
    socialYoutubeUrl: '',
    socialFacebookUrl: '',
    socialInstagramUrl: '',
    socialWhatsappUrl: '',
    wishesCount: 500,
    isToday: false,
    showInHomepagePopup: true,
    isActive: true
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name || '',
        englishName: item.englishName || '',
        designation: item.designation || '',
        englishDesignation: item.englishDesignation || '',
        department: item.department || '',
        district: item.district || 'தமிழ்நாடு',
        dob: item.dob || '',
        dobDisplay: item.dobDisplay || '',
        photo: item.photo || '',
        posterImage: item.posterImage || item.photo || '',
        wishesMessage: item.wishesMessage || '',
        englishWishMessage: item.englishWishMessage || '',
        socialYoutubeUrl: item.socialYoutubeUrl || '',
        socialFacebookUrl: item.socialFacebookUrl || '',
        socialInstagramUrl: item.socialInstagramUrl || '',
        socialWhatsappUrl: item.socialWhatsappUrl || '',
        wishesCount: item.wishesCount || 0,
        isToday: item.isToday || false,
        showInHomepagePopup: item.showInHomepagePopup !== false,
        isActive: item.isActive !== undefined ? item.isActive : true
      });
    } else {
      const now = new Date();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDate = String(now.getDate()).padStart(2, '0');
      setEditingItem(null);
      setForm({
        name: '',
        englishName: '',
        designation: '',
        englishDesignation: '',
        department: '',
        district: 'சென்னை',
        dob: `${currentMonth}-${currentDate}`,
        dobDisplay: `${now.toLocaleString('ta-IN', { month: 'long' })} ${currentDate}`,
        photo: '',
        posterImage: '',
        wishesMessage: '',
        englishWishMessage: '',
        socialYoutubeUrl: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
        socialFacebookUrl: 'https://www.facebook.com/amazetimes',
        socialInstagramUrl: 'https://www.instagram.com/amazetimes/?hl=en',
        socialWhatsappUrl: 'https://whatsapp.com/channel/amazetimes',
        wishesCount: 500,
        isToday: true,
        showInHomepagePopup: true,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
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

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadingTarget(fieldName);

    try {
      const res = await api.uploadImage(file);
      if (res && res.success && (res.imageUrl || res.url)) {
        const imgUrl = res.imageUrl || res.url;
        setForm((prev) => ({
          ...prev,
          [fieldName]: imgUrl,
          ...(fieldName === 'photo' && !prev.posterImage ? { posterImage: imgUrl } : {})
        }));
        showToast('படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!');
        setUploadingTarget(null);
        return;
      }
    } catch (_) {}

    try {
      const compressedDataUrl = await compressImage(file, 800, 0.8);
      setForm((prev) => ({
        ...prev,
        [fieldName]: compressedDataUrl,
        ...(fieldName === 'photo' && !prev.posterImage ? { posterImage: compressedDataUrl } : {})
      }));
      showToast('படம் சுருக்கப்பட்டு சேர்க்கப்பட்டது!');
    } catch (err) {
      showToast('படம் பதிவேற்றுவதில் பிழை');
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.designation.trim() || !form.wishesMessage.trim()) {
      showToast('தயவுசெய்து அதிகாரி பெயர், பதவி மற்றும் வாழ்த்துச் செய்தியை நிரப்பவும்');
      return;
    }

    const payload = {
      ...form,
      posterImage: form.posterImage || form.photo,
      photo: form.photo || form.posterImage
    };

    if (editingItem) {
      updateBirthdayOfficial(editingItem.id, payload);
    } else {
      addBirthdayOfficial(payload);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`'${name}' அதிகாரி பதிவை நீக்க நிச்சயமாக விரும்புகிறீர்களா?`)) {
      deleteBirthdayOfficial(id);
    }
  };

  const handleTestShare = (item) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amazetimes.in';
    const cardUrl = `${origin}/?birthday=${item.id}`;
    shareBirthdayItem({ item, cardUrl, showToast });
  };

  const filteredOfficials = officialsList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.englishName && item.englishName.toLowerCase().includes(q)) ||
      (item.designation && item.designation.toLowerCase().includes(q)) ||
      (item.englishDesignation && item.englishDesignation.toLowerCase().includes(q)) ||
      (item.district && item.district.toLowerCase().includes(q)) ||
      (item.department && item.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a1945] via-[#0d225c] to-[#0a1945] text-white p-6 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest">
            <Award className="w-4 h-4" /> தமிழ்நாடு அரசுத் தலைவர்கள் & பிரமுகர்கள்
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-tamil flex items-center gap-2">
            <span>VIP & தலைவர்கள் பிறந்தநாள் வாழ்த்து மேலாண்மை (Birthday Hub)</span>
            <Cake className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-300">
            முதலமைச்சர், அமைச்சர்கள், IAS/IPS அதிகாரிகள் மற்றும் சாதனையாளர்களின் வாழ்த்து அட்டைகளை நிர்வகிக்கவும்.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition transform hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ புதிய VIP பதிவு சேர்</span>
        </button>
      </div>

      {/* Filter & Stats Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="பெயர், பதவி, மாவட்டம் அல்லது துறை தேட..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 text-white pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
          <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            மொத்தம்: <strong className="text-amber-400">{officialsList.length}</strong>
          </span>
          <span className="bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
            <Cake className="w-3.5 h-3.5 text-amber-400" />
            இன்று பிறந்தநாள்: <strong className="text-amber-400">{officialsList.filter((o) => checkIsTodayBirthday(o)).length}</strong>
          </span>
        </div>
      </div>

      {/* Officials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOfficials.map((item) => {
          const isToday = checkIsTodayBirthday(item);
          return (
            <div
              key={item.id}
              className={`bg-[#0f172a] rounded-3xl border p-5 shadow-lg space-y-4 flex flex-col justify-between transition ${
                isToday ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/10 to-[#0f172a]' : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={item.posterImage || item.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
                      alt={item.name}
                      className="w-16 h-20 rounded-2xl object-cover border-2 border-amber-400/80 shadow"
                    />
                    {isToday && (
                      <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5 border border-slate-900 animate-pulse">
                        <Cake className="w-3 h-3 text-white" /> இன்று
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-white text-base leading-snug truncate">{item.name}</h3>
                    {item.englishName && (
                      <p className="text-xs font-bold text-amber-300 truncate">{item.englishName}</p>
                    )}
                    <p className="text-xs font-bold text-amber-400 truncate mt-0.5">{item.designation}</p>
                    {item.department && (
                      <p className="text-[11px] text-slate-400 truncate">{item.department}</p>
                    )}
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      {item.district && <span>📍 {item.district}</span>}
                      <span>•</span>
                      <span className="text-amber-300 font-mono">📅 {item.dobDisplay || item.dob}</span>
                    </div>
                  </div>
                </div>

                {/* English Wish Box */}
                {item.englishWishMessage && (
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/20 text-[11px] text-slate-200 italic line-clamp-2 font-sans">
                    "{item.englishWishMessage}"
                  </div>
                )}

                {/* Tamil Wishes Message Box */}
                {item.wishesMessage && (
                  <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 italic line-clamp-2 font-tamil">
                    "{item.wishesMessage}"
                  </div>
                )}

                {/* Social media indicator bar */}
                <div className="flex items-center gap-1.5 pt-1">
                  {item.socialYoutubeUrl && (
                    <span className="p-1 rounded bg-red-600/20 text-red-400 border border-red-500/30" title="YouTube Post Available">
                      <YoutubeIcon className="w-3 h-3" />
                    </span>
                  )}
                  {item.socialFacebookUrl && (
                    <span className="p-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30" title="Facebook Post Available">
                      <FacebookIcon className="w-3 h-3" />
                    </span>
                  )}
                  {item.socialInstagramUrl && (
                    <span className="p-1 rounded bg-pink-600/20 text-pink-400 border border-pink-500/30" title="Instagram Post Available">
                      <InstagramIcon className="w-3 h-3" />
                    </span>
                  )}
                  {item.socialWhatsappUrl && (
                    <span className="p-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" title="WhatsApp Channel Post Available">
                      <WhatsappIcon className="w-3 h-3" />
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-rose-400 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {item.wishesCount || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openBirthdayModal(item)}
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-bold cursor-pointer transition flex items-center gap-1"
                    title="முழு அட்டை முன்னோட்டம் (Preview Card)"
                  >
                    <Eye className="w-3.5 h-3.5" /> முன்னோட்டம்
                  </button>
                  <button
                    onClick={() => handleTestShare(item)}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-bold cursor-pointer transition flex items-center gap-1"
                    title="பகிர்வு சோதனை (Share Test)"
                  >
                    <Share2 className="w-3.5 h-3.5" /> பகிர்
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold cursor-pointer transition flex items-center gap-1"
                    title="திருத்து"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 text-xs font-bold cursor-pointer transition flex items-center gap-1"
                    title="நீக்கு"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Official Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-[#0f172a] shrink-0">
              <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {editingItem ? 'VIP பிறந்தநாள் விபரங்களை திருத்து' : 'புதிய VIP பிறந்தநாள் வாழ்த்து பதிவு'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs font-semibold overflow-y-auto flex-1">
              {/* Image Upload Row (Photo and Poster) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Portrait Photo */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">அதிகாரி உருவப்படம் (Portrait Photo):</label>
                  <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/90 rounded-2xl p-3 text-center space-y-2 relative transition">
                    {form.photo ? (
                      <div className="flex items-center gap-3">
                        <img src={form.photo} alt="Photo" className="w-14 h-16 rounded-xl object-cover border border-amber-400 shadow" />
                        <div className="text-left space-y-1">
                          <span className="text-emerald-400 font-bold block text-[11px]">✓ படம் உள்ளது</span>
                          <label className="text-[11px] text-amber-400 hover:underline cursor-pointer font-bold block">
                            மாற்று
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-1.5">
                        <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                        <span className="text-slate-300 text-[11px] font-bold block">படம் பதிவேற்றவும்</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="hidden" />
                      </label>
                    )}
                    {uploadingTarget === 'photo' && <div className="text-amber-400 text-[10px]">பதிவேற்றப்படுகிறது...</div>}
                  </div>
                </div>

                {/* Poster Image */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">முழு வாழ்த்து போஸ்டர் (Poster Image):</label>
                  <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/90 rounded-2xl p-3 text-center space-y-2 relative transition">
                    {form.posterImage ? (
                      <div className="flex items-center gap-3">
                        <img src={form.posterImage} alt="Poster" className="w-14 h-16 rounded-xl object-cover border border-amber-400 shadow" />
                        <div className="text-left space-y-1">
                          <span className="text-emerald-400 font-bold block text-[11px]">✓ போஸ்டர் உள்ளது</span>
                          <label className="text-[11px] text-amber-400 hover:underline cursor-pointer font-bold block">
                            மாற்று
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'posterImage')} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-1.5">
                        <ImageIcon className="w-6 h-6 text-amber-400 mx-auto" />
                        <span className="text-slate-300 text-[11px] font-bold block">போஸ்டர் பதிவேற்றவும்</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'posterImage')} className="hidden" />
                      </label>
                    )}
                    {uploadingTarget === 'posterImage' && <div className="text-amber-400 text-[10px]">பதிவேற்றப்படுகிறது...</div>}
                  </div>
                </div>
              </div>

              {/* Name Fields (Tamil & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">தமிழ் பெயர் (Tamil Name):*</label>
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
                  <label className="block text-slate-300 mb-1 font-bold">ஆங்கிலப் பெயர் (English Name):</label>
                  <input
                    type="text"
                    placeholder="e.g. Hon. Thiru. M.K. Stalin"
                    value={form.englishName}
                    onChange={(e) => setForm({ ...form, englishName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Designation Fields (Tamil & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">தமிழ் பதவி (Designation):*</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: முதலமைச்சர் / முதன்மைச் செயலாளர்"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">ஆங்கிலப் பதவி (English Designation):</label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Minister of Tamil Nadu"
                    value={form.englishDesignation}
                    onChange={(e) => setForm({ ...form, englishDesignation: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Department & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">துறை / நிறுவனம் (Department):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: தமிழ்நாடு அரசு / பள்ளிக் கல்வித் துறை"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">மாவட்டம் (District):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: சென்னை / சிவகங்கை / தமிழ்நாடு"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Date of Birth Fields (MM-DD and Display Text) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">பிறந்த தேதி (MM-DD):*</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: 10-28 அல்லது 03-01"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">காட்சிப்படுத்தும் தேதி (DOB Display):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: அக்டோபர் 28 / மார்ச் 01"
                    value={form.dobDisplay}
                    onChange={(e) => setForm({ ...form, dobDisplay: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* English Wish Message Quote */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">ஆங்கில வாழ்த்துச் செய்தி (English Wish Caption):</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Warmest Birthday Greetings to... Wishing you good health, joy, and grand success."
                  value={form.englishWishMessage}
                  onChange={(e) => setForm({ ...form, englishWishMessage: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              {/* Tamil Wishes Message Quote */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">தமிழ் வாழ்த்துச் செய்தி (Tamil Wishes Quote):*</label>
                <textarea
                  rows={3}
                  required
                  placeholder="அமேஸ் டைம்ஸ் ஆசிரியர் குழு வாழ்த்துச் செய்தி..."
                  value={form.wishesMessage}
                  onChange={(e) => setForm({ ...form, wishesMessage: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed font-tamil"
                />
              </div>

              {/* Social Media Post Links (YouTube, Facebook, Instagram, WhatsApp) */}
              <div className="space-y-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                  அதிகாரப்பூர்வ சமூக ஊடக பதிவுகள் (Official Social Post Links):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-bold">YouTube Video URL:</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={form.socialYoutubeUrl}
                      onChange={(e) => setForm({ ...form, socialYoutubeUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-bold">Facebook Post URL:</label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={form.socialFacebookUrl}
                      onChange={(e) => setForm({ ...form, socialFacebookUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-bold">Instagram Reel/Post URL:</label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/p/..."
                      value={form.socialInstagramUrl}
                      onChange={(e) => setForm({ ...form, socialInstagramUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-bold">WhatsApp Channel Post URL:</label>
                    <input
                      type="url"
                      placeholder="https://whatsapp.com/channel/..."
                      value={form.socialWhatsappUrl}
                      onChange={(e) => setForm({ ...form, socialWhatsappUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
                  <input
                    type="checkbox"
                    checked={form.isToday}
                    onChange={(e) => setForm({ ...form, isToday: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span>இன்று பிறந்தநாள்</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.showInHomepagePopup}
                    onChange={(e) => setForm({ ...form, showInHomepagePopup: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span>முகப்பு பாப்-அப்</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-400">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>செயலில் உள்ளது (Active)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 rounded-xl cursor-pointer"
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

export default AdminBirthdayManager;
