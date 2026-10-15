import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { defaultQuotesData } from '../../data/quotesData';
import {
  Quote,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Upload,
  User,
  Heart,
  X,
  Filter,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminQuotesManager = () => {
  const { showToast, quotesData, saveQuotesData } = useApp();

  const quotesList = (quotesData && quotesData.length > 0) ? quotesData : defaultQuotesData;

  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Image Compression helper
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
        setForm((prev) => ({ ...prev, image: imgUrl }));
        if (showToast) showToast('சான்றோர் படம் பதிவேற்றப்பட்டது!');
        setUploadingImage(false);
        return;
      }
    } catch (err) {}

    try {
      const compressedDataUrl = await compressImage(file, 350, 0.7);
      setForm((prev) => ({ ...prev, image: compressedDataUrl }));
      if (showToast) showToast('சான்றோர் படம் சுருக்கப்பட்டு சேமிக்கப்பட்டது!');
    } catch (err) {
      if (showToast) showToast('படம் பதிவேற்றுவதில் பிழை');
    } finally {
      setUploadingImage(false);
    }
  };

  // Form State
  const [form, setForm] = useState({
    author: '',
    authorTitle: '',
    category: 'leadership',
    quote: '',
    quoteEnglish: '',
    image: '',
    status: 'published',
    isQuoteOfTheDay: false
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingQuote(item);
      setForm({
        author: item.author || '',
        authorTitle: item.authorTitle || item.authorRole || '',
        category: item.category || 'leadership',
        quote: item.quote || item.quoteTamil || '',
        quoteEnglish: item.quoteEnglish || '',
        image: item.image || item.authorImg || '',
        status: item.status || 'published',
        isQuoteOfTheDay: item.isQuoteOfTheDay || false
      });
    } else {
      setEditingQuote(null);
      setForm({
        author: '',
        authorTitle: '',
        category: 'leadership',
        quote: '',
        quoteEnglish: '',
        image: '',
        status: 'published',
        isQuoteOfTheDay: false
      });
    }
    setShowModal(true);
  };

  const handleSaveQuote = (e) => {
    e.preventDefault();
    if (!form.author.trim() || !form.quote.trim()) {
      showToast('தயவுசெய்து சான்றோர் பெயர் மற்றும் பொன்மொழியை உள்ளிடவும்');
      return;
    }

    const categoryNames = {
      leadership: 'தலைவர் சிந்தனைகள்',
      youth: 'கல்வி & இளைஞர்',
      wisdom: 'வாழ்க்கை தத்துவம்',
      spiritual: 'ஆன்மீகம் & தத்துவம்',
      patriotism: 'தேச பக்தி'
    };

    const newItem = {
      id: editingQuote ? editingQuote.id : `quote-${Date.now()}`,
      author: form.author,
      authorTitle: form.authorTitle || 'சான்றோர்',
      authorRole: form.authorTitle || 'சான்றோர்',
      category: form.category,
      categoryName: categoryNames[form.category] || 'சான்றோர் சிந்தனைகள்',
      quote: form.quote,
      quoteTamil: form.quote,
      quoteEnglish: form.quoteEnglish || '',
      image: form.image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
      authorImg: form.image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
      likes: editingQuote ? editingQuote.likes : Math.floor(Math.random() * 500) + 100,
      status: form.status,
      isQuoteOfTheDay: form.isQuoteOfTheDay,
      createdAt: new Date().toLocaleDateString('ta-IN')
    };

    let updated = [...quotesList];
    if (form.isQuoteOfTheDay) {
      updated = updated.map((q) => ({ ...q, isQuoteOfTheDay: false }));
    }
    if (editingQuote) {
      updated = updated.map((q) => (q.id === editingQuote.id ? newItem : q));
    } else {
      updated = [newItem, ...updated];
    }
    saveQuotesData(updated);

    showToast(
      editingQuote
        ? 'பொன்மொழி திருத்தப்பட்டது!'
        : form.isQuoteOfTheDay
        ? '🌟 இன்றைய சிந்தனைத் துளியாக சேமிக்கப்பட்டு வெளியிடப்பட்டது!'
        : 'புதிய பொன்மொழி வெளியிடப்பட்டது!'
    );

    setShowModal(false);
  };

  const handleSetQuoteOfTheDay = (id) => {
    const updated = quotesList.map((q) => {
      if (q.id === id) {
        const nextState = !q.isQuoteOfTheDay;
        showToast(
          nextState
            ? '🌟 இந்த பொன்மொழி "இன்றைய சிந்தனைத் துளி (Quote of the Day)" ஆக அமைந்தது!'
            : 'சிந்தனைத் துளி நிலை நீக்கப்பட்டது'
        );
        return { ...q, isQuoteOfTheDay: nextState, status: 'published' };
      }
      return { ...q, isQuoteOfTheDay: false };
    });
    saveQuotesData(updated);
  };

  const handleToggleStatus = (id) => {
    const updated = quotesList.map((q) => {
      if (q.id === id) {
        const newStatus = q.status === 'published' ? 'pending' : 'published';
        showToast(newStatus === 'published' ? 'பொன்மொழி முகப்பில் வெளியிடப்பட்டது!' : 'பொன்மொழி நிலுவையில் வைக்கப்பட்டது');
        return { ...q, status: newStatus };
      }
      return q;
    });
    saveQuotesData(updated);
  };

  const handleDeleteQuote = (id) => {
    if (window.confirm('இந்த பொன்மொழியை நிச்சயமாக நீக்க வேண்டுமா?')) {
      const updated = quotesList.filter((q) => q.id !== id);
      saveQuotesData(updated);
      showToast('பொன்மொழி நீக்கப்பட்டது');
    }
  };

  const filteredQuotes = quotesList.filter((q) => {
    if (activeCategoryTab !== 'all' && q.category !== activeCategoryTab) return false;
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-tamil">
      {/* HEADER CARD */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Quote className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              சான்றோர் பொன்மொழிகள் மேலாளர் (Quotes Manager)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans">
            Manage inspiring quotes by Dr. APJ Abdul Kalam, Bharathiyar, Thiruvalluvar, Kamarajar & set Quote of the Day (இன்றைய சிந்தனைத் துளி).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>புதிய பொன்மொழி சேர்</span>
        </button>
      </div>

      {/* CATEGORY & APPROVAL FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: `அனைத்தும் (${quotesList.length})` },
            { id: 'leadership', label: 'தலைவர் சிந்தனைகள்' },
            { id: 'youth', label: 'கல்வி & இளைஞர்' },
            { id: 'wisdom', label: 'வாழ்க்கை தத்துவம்' },
            { id: 'spiritual', label: 'ஆன்மீகம்' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeCategoryTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-4 h-4 text-amber-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#050915] border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">அனைத்து நிலவரங்கள்</option>
            <option value="published">வெளியிடப்பட்டது (Published)</option>
            <option value="pending">நிலுவையில் (Pending)</option>
          </select>
        </div>
      </div>

      {/* QUOTES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuotes.map((q) => (
          <div
            key={q.id}
            className={`bg-[#0f172a] rounded-3xl border p-6 shadow-xl space-y-4 flex flex-col justify-between ${
              q.isQuoteOfTheDay ? 'border-amber-500 ring-2 ring-amber-500/30 bg-gradient-to-br from-[#131c36] to-[#0f172a]' : 'border-slate-800'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[11px] px-3 py-1 rounded-full">
                  {q.categoryName || 'பொன்மொழி'}
                </span>
                
                <div className="flex items-center gap-2">
                  {q.isQuoteOfTheDay && (
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold shadow-md shadow-red-600/30 text-[10px] px-3 py-1 rounded-full shadow-md flex items-center gap-1 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" /> Quote of the Day
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-md ${
                      q.status === 'published'
                        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-700'
                        : 'bg-amber-950/90 text-amber-300 border-amber-700'
                    }`}
                  >
                    {q.status === 'published' ? 'வெளியிடப்பட்டது' : 'நிலுவையில்'}
                  </span>
                </div>
              </div>

              <div className="bg-[#050915] p-5 rounded-2xl border border-slate-800 relative space-y-2">
                <Quote className="w-8 h-8 text-amber-500/20 absolute top-3 right-3" />
                <p className="text-sm sm:text-base font-semibold text-amber-300 italic leading-relaxed">
                  "{q.quote || q.quoteTamil}"
                </p>
                {q.quoteEnglish && (
                  <p className="text-xs text-slate-400 font-sans italic opacity-80">
                    "{q.quoteEnglish}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-900 border-2 border-amber-500/40 shrink-0">
                  <img src={q.image || q.authorImg} alt={q.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">{q.author}</h3>
                  <span className="text-xs text-slate-400">{q.authorTitle || q.authorRole}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs gap-2 flex-wrap">
              <button
                onClick={() => handleSetQuoteOfTheDay(q.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  q.isQuoteOfTheDay
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${q.isQuoteOfTheDay ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
                <span>{q.isQuoteOfTheDay ? 'இன்றைய சிந்தனைத் துளி' : 'Quote of the Day ஆக்கு'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(q.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                    q.status === 'published'
                      ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{q.status === 'published' ? 'வெளியிடப்பட்டது' : 'ஒப்புதல் அளி'}</span>
                </button>

                <button
                  onClick={() => handleOpenModal(q)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteQuote(q.id)}
                  className="p-2 bg-slate-800 hover:bg-red-600/80 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0f172a] rounded-3xl max-w-xl w-full max-h-[90vh] border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center border-b border-slate-800 p-4 sm:p-5 bg-[#0f172a] shrink-0">
              <h3 className="font-black text-amber-400 text-lg flex items-center gap-2">
                <Quote className="w-5 h-5 text-amber-400" />
                {editingQuote ? 'பொன்மொழி திருத்துதல்' : 'புதிய சான்றோர் பொன்மொழி பதிவு'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveQuote} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
              {/* Photo Upload Dropzone */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">சான்றோர் புகைப்படம் (Photo Upload):</label>
                <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/90 rounded-2xl p-4 text-center space-y-2 relative transition cursor-pointer">
                  {form.image ? (
                    <div className="flex items-center justify-center gap-4">
                      <img src={form.image} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow" />
                      <div className="text-left space-y-1">
                        <span className="text-emerald-400 font-bold block">✓ படம் சேர்க்கப்பட்டது</span>
                        <label className="text-[11px] text-amber-400 hover:underline cursor-pointer font-bold block">
                          படத்தை மாற்று (Change Photo)
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2">
                      <Upload className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                      <span className="text-slate-300 font-bold block">படத்தை பதிவேற்ற கிளிக் செய்யவும்</span>
                      <span className="text-[10px] text-slate-500 block">PNG, JPG, WEBP (Max 5MB)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  {uploadingImage && <div className="text-amber-400 text-[10px] font-bold">பதிவேற்றப்படுகிறது...</div>}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">சான்றோர் / தலைவர் பெயர்:*</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம் / பாரதியார்..."
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">சான்றோர் தகுதி / பட்டப்பெயர்:</label>
                <input
                  type="text"
                  placeholder="எ.கா: முன்னாள் குடியரசுத் தலைவர் / தேசியக் கவிஞர்..."
                  value={form.authorTitle}
                  onChange={(e) => setForm({ ...form, authorTitle: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">பொன்மொழிப் பிரிவு (Category):</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                >
                  <option value="leadership">தலைவர் சிந்தனைகள் & வழிகாட்டுதல்</option>
                  <option value="youth">கல்வி & இளைஞர் எழுச்சி</option>
                  <option value="wisdom">வாழ்க்கை தத்துவம் & ஒழுக்கம்</option>
                  <option value="spiritual">ஆன்மீகம் & தத்துவம்</option>
                  <option value="patriotism">தேச பக்தி & மொழிப் பற்று</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">தமிழ் பொன்மொழி (Quote Text Tamil):*</label>
                <textarea
                  rows="3"
                  required
                  placeholder="தமிழ் பொன்மொழியை உள்ளிடவும்..."
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium leading-relaxed"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ஆங்கில பொன்மொழி (Quote Text English - optional):</label>
                <input
                  type="text"
                  placeholder="English translation if any..."
                  value={form.quoteEnglish}
                  onChange={(e) => setForm({ ...form, quoteEnglish: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-between bg-[#050915] p-3 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
                  <input
                    type="checkbox"
                    checked={form.isQuoteOfTheDay}
                    onChange={(e) => setForm({ ...form, isQuoteOfTheDay: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>இன்றைய சிந்தனைத் துளியாக அமை (Set as Quote of the Day)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 py-3.5 rounded-xl uppercase tracking-wider shadow-lg cursor-pointer transition"
              >
                சேமி & வெளியிடவும்
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
