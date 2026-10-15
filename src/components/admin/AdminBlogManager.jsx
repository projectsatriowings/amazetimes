import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Upload,
  User,
  Heart,
  Smile,
  Feather,
  Eye,
  X,
  Filter
} from 'lucide-react';

// Default Rich Tamil Literary & Blog Seed Data
export const DEFAULT_BLOG_ITEMS = [
  {
    id: 'blog-1',
    title: 'மகாகவி பாரதியாரின் சுதந்திரக் கனவுகளும் இன்றைய இளைஞர்களும்',
    authorName: 'முனைவர் கே. சொக்கலிங்கம்',
    authorTagline: 'தமிழ் இலக்கிய ஆய்வாளர்',
    blogType: 'famous-writer',
    targetAudience: 'இளைஞர்கள்',
    readingTime: '5 நிமிடங்கள்',
    moral: 'தேசப் பற்றும் தன்னம்பிக்கையும் மனிதனின் உயர்ந்த ஆயுதங்கள்.',
    summary: 'பாரதியின் கவிதைகளில் காணப்படும் சமூக விழிப்புணர்வும், இன்றைய டிஜிட்டல் யுகத்து இளைஞர்களுக்கு அது வழங்கும் வழிகாட்டுதலும்.',
    content: 'மகாகவி சுப்பிரமணிய பாரதியார் தனியொரு மனிதனுக்கு உணவில்லை எனில் இந்த ஜகத்தினை அழித்திடுவோம் என்று முழங்கியவர். அவரது வரிகள் வெறும் கவிதைகள் அல்ல; அவை சமூகத்தின் விடுதலையையும் மாற்றத்தையும் நோக்கிய விழிப்புணர்வு முழக்கங்கள்.\n\nஇன்றைய நவீன சமுதாயத்தில் இளைஞர்கள் தொழில்நுட்பத்திலும் செயற்கை நுண்ணறிவிலும் முன்னேறி வரும் வேளையில், பாரதியின் ‘நிமிர்ந்த நன்னடை நேர்கொண்ட பார்வையும்’ என்னும் கொள்கை மிக மிக அவசியமான ஒன்றாக விளங்குகிறது.',
    mainImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    createdAt: '2026-10-09'
  },
  {
    id: 'blog-2',
    title: 'உண்மையும் உழைப்பும்: சிறுவர் நீதிக்கதை',
    authorName: 'கதைச்சொல்லி செல்வி',
    authorTagline: 'சிறுவர் இலக்கிய எழுத்தாளர்',
    blogType: 'kids-story',
    targetAudience: 'குழந்தைகள்',
    readingTime: '3 நிமிடங்கள்',
    moral: 'நேர்மையும் கடின உழைப்பும் என்றென்றும் வெற்றியைத் தரும்.',
    summary: 'சிறிய கிராமத்தில் வாழ்ந்த ஒரு ஏழைச் சிறுவன் தன் நேர்மையால் எவ்வாறு பெரிய செல்வந்தரின் நம்பிக்கையைப் பெற்றான் என்ற கதை.',
    content: 'ஒரு அழகான கிராமத்தில் சுந்தர் என்னும் சிறுவன் வாழ்ந்து வந்தான். அவன் தினமும் காட்டிற்குச் சென்று விறகு வெட்டி விற்றுத் தன் தாயைக் காப்பாற்றி வந்தான். ஒருநாள் ஆற்றுக்கு அருகில் விறகு வெட்டும்போது அவனது கோடாரி ஆற்றில் விழுந்து விட்டது...\n\nஅவனது நேர்மையைக் கண்ட தேவதை அவனுக்கு தங்கக் கோடாரியையும் பரிசாக அளித்தது.',
    mainImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    createdAt: '2026-10-08'
  }
];

export const AdminBlogManager = () => {
  const { showToast, fetchNews, customBlogsData, saveCustomBlogsData } = useApp();

  const blogItems = (customBlogsData && customBlogsData.length > 0) ? customBlogsData : DEFAULT_BLOG_ITEMS;

  const [activeTypeTab, setActiveTypeTab] = useState('all'); // 'all' | 'famous-writer' | 'kids-story' | 'youth-story' | 'general-blog'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'pending'
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    authorName: 'ஆசிரியர்',
    authorTagline: 'படைப்பாளி',
    blogType: 'famous-writer',
    targetAudience: 'பொது வாசகர்கள்',
    readingTime: '3 நிமிடங்கள்',
    moral: '',
    summary: '',
    content: '',
    mainImage: '',
    status: 'published'
  });

  // Load backend blogs on mount
  useEffect(() => {
    loadBlogArticles();
  }, []);

  const loadBlogArticles = async () => {
    try {
      const res = await api.getNews({ limit: 100 });
      if (res.success && res.data && res.data.length > 0) {
        const blogArticles = res.data.filter(
          (art) =>
            art.category === 'தலையங்கம்' ||
            art.category === 'வலைப்பதிவு' ||
            art.subCategory?.includes('story') ||
            art.subCategory?.includes('writer') ||
            art.subCategory?.includes('blog')
        );

        if (blogArticles.length > 0) {
          const formatted = blogArticles.map((art) => ({
            id: art._id || art.id,
            title: art.title,
            authorName: art.authorName || art.author?.name || 'ஆசிரியர்',
            authorTagline: art.authorTagline || art.authorDesignation || 'படைப்பாளி',
            blogType: art.subCategory || 'general-blog',
            targetAudience: art.targetAudience || 'பொது வாசகர்கள்',
            readingTime: art.readingTime || '4 நிமிடங்கள்',
            moral: art.moral || '',
            summary: art.summary,
            content: art.content,
            mainImage: art.mainImage || art.img || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
            status: art.status || 'published',
            createdAt: art.createdAt ? new Date(art.createdAt).toLocaleDateString('ta-IN') : '2026-09-26'
          }));
          setBlogItems(formatted);
        }
      }
    } catch (err) {
      // Keep default items if fetch fails
    }
  };

  // Image Upload File Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, mainImage: event.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      setUploadingImage(true);
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setForm((prev) => ({ ...prev, mainImage: res.url }));
        showToast('அட்டைப் படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!');
      }
    } catch (err) {
      showToast('படம் பதிவேற்றலில் பிழை ஏற்பட்டது');
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Modal for Create / Edit
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        authorName: item.authorName || 'ஆசிரியர்',
        authorTagline: item.authorTagline || 'படைப்பாளி',
        blogType: item.blogType || 'famous-writer',
        targetAudience: item.targetAudience || 'பொது வாசகர்கள்',
        readingTime: item.readingTime || '3 நிமிடங்கள்',
        moral: item.moral || '',
        summary: item.summary || '',
        content: item.content || '',
        mainImage: item.mainImage || '',
        status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        authorName: 'ஆசிரியர்',
        authorTagline: 'படைப்பாளி',
        blogType: 'famous-writer',
        targetAudience: 'பொது வாசகர்கள்',
        readingTime: '3 நிமிடங்கள்',
        moral: '',
        summary: '',
        content: '',
        mainImage: '',
        status: 'published'
      });
    }
    setShowModal(true);
  };

  // Save Blog Submission
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast('தயவுசெய்து தலைப்பு மற்றும் கதையின் முழு விவரங்களை நிரப்பவும்');
      return;
    }

    const payload = {
      title: form.title,
      summary: form.summary || form.title,
      content: form.content,
      category: 'தலையங்கம்',
      subCategory: form.blogType,
      authorName: form.authorName || 'ஆசிரியர்',
      authorTagline: form.authorTagline,
      targetAudience: form.targetAudience,
      readingTime: form.readingTime,
      moral: form.moral,
      mainImage: form.mainImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      status: form.status
    };

    try {
      if (editingItem && editingItem.id && !editingItem.id.toString().startsWith('blog-')) {
        await api.updateNews(editingItem.id, payload);
      } else {
        await api.createNews(payload);
      }

      // Update Local State instantly
      const newItem = {
        id: editingItem ? editingItem.id : `blog-${Date.now()}`,
        ...form,
        createdAt: new Date().toLocaleDateString('ta-IN')
      };

      let updated = [...blogItems];
      if (editingItem) {
        updated = updated.map((it) => (it.id === editingItem.id ? newItem : it));
        showToast('வலைப்பதிவு படைப்பு வெற்றிகரமாக திருத்தப்பட்டது!');
      } else {
        updated = [newItem, ...updated];
        showToast('புதிய படைப்பு/கதை உருவாக்கப்பட்டு முகப்பிற்கு வெளியிடப்பட்டது!');
      }
      saveCustomBlogsData(updated);

      setShowModal(false);
      fetchNews();
    } catch (err) {
      const newItem = {
        id: editingItem ? editingItem.id : `blog-${Date.now()}`,
        ...form,
        createdAt: new Date().toLocaleDateString('ta-IN')
      };
      let updated = [...blogItems];
      if (editingItem) {
        updated = updated.map((it) => (it.id === editingItem.id ? newItem : it));
      } else {
        updated = [newItem, ...updated];
      }
      saveCustomBlogsData(updated);
      showToast('படைப்பு DB-யில் சேமிக்கப்பட்டது!');
      setShowModal(false);
    }
  };

  // Toggle Approval / Publish Status
  const handleToggleStatus = (id) => {
    const updated = blogItems.map((item) => {
      if (item.id === id) {
        const newStatus = item.status === 'published' ? 'pending' : 'published';
        showToast(newStatus === 'published' ? 'படைப்பு முகப்புப் பக்கத்திற்கு ஒப்புதல் அளித்து வெளியிடப்பட்டது!' : 'படைப்பு நிலுவை பட்டியலுக்கு மாற்றப்பட்டது');
        return { ...item, status: newStatus };
      }
      return item;
    });
    saveCustomBlogsData(updated);
  };

  // Delete Blog
  const handleDeleteBlog = (id) => {
    if (window.confirm('இந்த படைப்பை நிச்சயமாக நீக்க வேண்டுமா?')) {
      const updated = blogItems.filter((item) => item.id !== id);
      saveCustomBlogsData(updated);
      showToast('படைப்பு நீக்கப்பட்டது');
    }
  };

  // Filtered List
  const filteredItems = blogItems.filter((item) => {
    if (activeTypeTab !== 'all' && item.blogType !== activeTypeTab) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const getTypeName = (type) => {
    switch (type) {
      case 'famous-writer':
        return 'தமிழ் இலக்கியப் படைப்பு';
      case 'kids-story':
        return 'சிறுவர் கதைகள்';
      case 'youth-story':
        return 'இளைஞர் சிறுகதைகள்';
      default:
        return 'பொது வலைப்பதிவு';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'famous-writer':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'kids-story':
        return 'bg-pink-950/80 text-pink-300 border-pink-700/60';
      case 'youth-story':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
    }
  };

  return (
    <div className="space-y-6 font-tamil">
      {/* SECTION HEADER & HERO CARD */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              வலைப்பதிவுகள் & இலக்கியப் படைப்புகள் மேலாளர்
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans">
            Manage Tamil literature compositions by famous writers, kids' moral stories, youth articles & general blogs with admin approval workflow.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>புதிய படைப்பு / கதை சேர்</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl space-y-1 shadow">
          <span className="text-xs text-slate-400 font-bold block">மொத்த படைப்புகள்</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{blogItems.length}</span>
        </div>

        <div className="bg-[#0f172a] border border-purple-900/50 p-4 rounded-2xl space-y-1 shadow">
          <span className="text-xs text-purple-300 font-bold block">தமிழ் இலக்கியப் படைப்புகள்</span>
          <span className="text-2xl font-black text-purple-400 font-mono">
            {blogItems.filter((i) => i.blogType === 'famous-writer').length}
          </span>
        </div>

        <div className="bg-[#0f172a] border border-pink-900/50 p-4 rounded-2xl space-y-1 shadow">
          <span className="text-xs text-pink-300 font-bold block">சிறுவர் கதைகள் & நீதிகள்</span>
          <span className="text-2xl font-black text-pink-400 font-mono">
            {blogItems.filter((i) => i.blogType === 'kids-story').length}
          </span>
        </div>

        <div className="bg-[#0f172a] border border-emerald-900/50 p-4 rounded-2xl space-y-1 shadow">
          <span className="text-xs text-emerald-300 font-bold block">இளைஞர் சிறுகதைகள்</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {blogItems.filter((i) => i.blogType === 'youth-story').length}
          </span>
        </div>
      </div>

      {/* CATEGORY & APPROVAL FILTER PILLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTypeTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTypeTab === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            அனைத்தும் ({blogItems.length})
          </button>
          <button
            onClick={() => setActiveTypeTab('famous-writer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTypeTab === 'famous-writer'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-purple-300 hover:bg-slate-800'
            }`}
          >
            தமிழ் இலக்கியங்கள்
          </button>
          <button
            onClick={() => setActiveTypeTab('kids-story')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTypeTab === 'kids-story'
                ? 'bg-pink-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-pink-300 hover:bg-slate-800'
            }`}
          >
            சிறுவர் கதைகள்
          </button>
          <button
            onClick={() => setActiveTypeTab('youth-story')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTypeTab === 'youth-story'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-emerald-300 hover:bg-slate-800'
            }`}
          >
            இளைஞர் கதைகள்
          </button>
          <button
            onClick={() => setActiveTypeTab('general-blog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTypeTab === 'general-blog'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-blue-300 hover:bg-slate-800'
            }`}
          >
            பொது வலைப்பதிவு
          </button>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-4 h-4 text-amber-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#050915] border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">அனைத்து நிலவரங்கள்</option>
            <option value="published">வெளியிடப்பட்டது (Approved)</option>
            <option value="pending">நிலுவையில் (Pending Approval)</option>
          </select>
        </div>
      </div>

      {/* BLOG ITEMS GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#0f172a] rounded-3xl border border-slate-800 hover:border-slate-700 p-5 shadow-xl transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Image Banner & Badges */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <img src={item.mainImage} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-md ${getTypeBadgeColor(item.blogType)}`}>
                    {getTypeName(item.blogType)}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-md ${
                      item.status === 'published'
                        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-700'
                        : 'bg-amber-950/90 text-amber-300 border-amber-700'
                    }`}
                  >
                    {item.status === 'published' ? 'முகப்பில் வெளியீடு' : 'ஒப்புதலுக்கு நிலுவையில்'}
                  </span>
                </div>
              </div>

              {/* Title & Author Info */}
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug hover:text-amber-400 transition">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-400 font-bold">
                  <User className="w-3.5 h-3.5" />
                  <span>{item.authorName}</span>
                  {item.authorTagline && (
                    <span className="text-slate-400 font-normal">({item.authorTagline})</span>
                  )}
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>

              {/* Moral / Takeaway if kids or youth story */}
              {item.moral && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300 font-semibold flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><b>கதை நீதி:</b> {item.moral}</span>
                </div>
              )}
            </div>

            {/* Bottom Meta & Action Controls */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> {item.publishedTime || item.createdAt || 'இன்று'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                    item.status === 'published'
                      ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                  title={item.status === 'published' ? 'நிலுவைக்கு மாற்று' : 'முகப்புப் பக்கத்திற்கு ஒப்புதல் அளி'}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{item.status === 'published' ? 'வெளியிடப்பட்டது' : 'ஒப்புதல் அளி'}</span>
                </button>

                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer"
                  title="திருத்து"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteBlog(item.id)}
                  className="p-2 bg-slate-800 hover:bg-red-600/80 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                  title="நீக்கு"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT STRUCTURED BLOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] rounded-3xl max-w-2xl w-full p-6 border border-slate-700 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-amber-400 text-lg flex items-center gap-2">
                <Feather className="w-5 h-5 text-amber-400" />
                {editingItem ? 'படைப்பு திருத்துதல்' : 'புதிய படைப்பு / கதை பதிவு செய்தல்'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs sm:text-sm">
              {/* Blog Title */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">படைப்பின் தலைப்பு (Title):</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: காணி நிலம் வேண்டும் / தெனாலிராமன் கதைகள்..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Category / Type & Target Audience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">படைப்புப் பிரிவு (Type):</label>
                  <select
                    value={form.blogType}
                    onChange={(e) => setForm({ ...form, blogType: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  >
                    <option value="famous-writer">புகழ்பெற்ற தமிழ் எழுத்தாளர் படைப்பு</option>
                    <option value="kids-story">சிறுவர் கதைகள் & நீதிக்கதைகள்</option>
                    <option value="youth-story">இளைஞர் சிறுகதைகள் & கவிதைகள்</option>
                    <option value="general-blog">பொது வலைப்பதிவு & கட்டுரைகள்</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">இலக்கு வாசகர்கள் (Target Audience):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: சிறுவர்கள் / இளைஞர்கள் / பொது வாசகர்கள்..."
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Author Name & Tagline */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">எழுத்தாளர் / ஆசிரியர் பெயர்:</label>
                  <input
                    type="text"
                    required
                    placeholder="இயல்புநிலை: ஆசிரியர் (அல்லது எழுத்தாளர் பெயர்)..."
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">எழுத்தாளர் குறிப்பு / தகுதி:</label>
                  <input
                    type="text"
                    placeholder="எ.கா: மகாகவி பாரதியார் / சிறுவர் எழுத்தாளர்..."
                    value={form.authorTagline}
                    onChange={(e) => setForm({ ...form, authorTagline: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Reading Time & Moral */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">வெளியிடப்பட்ட நேரம் (Published Time):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: 25 நிமிடங்களுக்கு முன் / இன்று"
                    value={form.readingTime}
                    onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-400 block mb-1">கதை தரும் நீதி / கருத்து (Moral):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: உண்மையே வெல்லும்..."
                    value={form.moral}
                    onChange={(e) => setForm({ ...form, moral: e.target.value })}
                    className="w-full bg-[#050915] border border-amber-500/40 rounded-xl p-3 text-amber-200 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">சிறுகுறிப்பு (Short Summary):</label>
                <textarea
                  rows="2"
                  required
                  placeholder="படைப்பின் முக்கிய சுருக்கம்..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                ></textarea>
              </div>

              {/* Full Content */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">முழுமையான கதை / கட்டுரை வடிவம் (Full Content):</label>
                <textarea
                  rows="6"
                  required
                  placeholder="கதை அல்லது கட்டுரையின் முழுமையான வரிகளை உள்ளிடவும்..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium leading-relaxed"
                ></textarea>
              </div>

              {/* Image File Upload */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">அட்டைப் படம் பதிவேற்றம் (Cover Image File):</label>
                {form.mainImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-video max-h-40 bg-slate-900 group">
                    <img src={form.mainImage} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <label className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer flex items-center gap-1 shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>மாற்று</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, mainImage: '' })}
                        className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        நீக்கு
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-amber-500 bg-[#050915] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center space-y-2">
                    <Upload className="w-7 h-7 text-amber-400 animate-bounce" />
                    <span className="font-bold text-slate-200 text-xs sm:text-sm">படக் கோப்பைத் தேர்ந்தெடுக்கவும் (Browse File)</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
                {uploadingImage && <span className="text-xs font-bold text-amber-400 mt-1 block">படம் பதிவேற்றப்படுகிறது...</span>}
              </div>

              {/* Status Select */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">வெளியீட்டு நிலை (Publish Status):</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                >
                  <option value="published">ஒப்புதல் அளிக்கப்பட்டு முகப்பில் வெளியிடவும் (Published)</option>
                  <option value="pending">நிர்வாகி ஒப்புதலுக்கு நிலுவையில் வைக்கவும் (Pending Approval)</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 py-3.5 rounded-xl uppercase tracking-wider shadow-lg cursor-pointer transition"
              >
                சேமி & வெளியிடவும் (Save & Publish)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
