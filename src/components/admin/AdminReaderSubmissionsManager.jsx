import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Inbox,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Eye,
  Plus,
  Send,
  BookOpen,
  Feather,
  PenTool,
  Upload,
  Clock,
  Sparkles,
  Users,
  Search,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';

export const AdminReaderSubmissionsManager = () => {
  const { showToast, customBlogsData, saveCustomBlogsData } = useApp();

  // Active Main Tab: 'submissions' | 'blogs' | 'editorials'
  const [activeTab, setActiveTab] = useState('submissions');

  // Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [subFilter, setSubFilter] = useState('all'); // 'all' | 'blog' | 'editorial' | 'competition'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [subSearch, setSubSearch] = useState('');
  const [viewingSub, setViewingSub] = useState(null);

  // Editorials State (stored in DB 'editorial_articles')
  const [editorialsList, setEditorialsList] = useState([]);

  // Modals & Edit States
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    authorName: '',
    authorTagline: 'எழுத்தாளர்',
    category: 'சிறுகதை',
    readingTime: '5 நிமிடங்கள்',
    moral: '',
    summary: '',
    content: '',
    mainImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200'
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEditorial, setEditingEditorial] = useState(null);
  const [editorialForm, setEditorialForm] = useState({
    title: '',
    author: 'தலையங்கக் குழு',
    authorRole: 'முதன்மை ஆசிரியர்',
    category: 'தலையங்கம்',
    desc: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 நிமிடங்கள்'
  });

  // Load from PostgreSQL DB on mount
  useEffect(() => {
    loadSubmissions();
    loadEditorials();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await api.getContent('reader_submissions');
      if (res && res.found && Array.isArray(res.data)) {
        setSubmissions(res.data);
      }
    } catch (e) {
      console.warn('Error loading submissions:', e);
    }
  };

  const loadEditorials = async () => {
    try {
      const res = await api.getContent('editorial_articles');
      if (res && res.found && Array.isArray(res.data)) {
        setEditorialsList(res.data);
      }
    } catch (e) {
      console.warn('Error loading editorials:', e);
    }
  };

  // --- SUBMISSIONS ACTIONS ---
  const handleApproveAndPublish = async (sub) => {
    try {
      if (sub.type === 'blog') {
        // Publish to blogs in DB
        const newBlog = {
          id: `blog-pub-${Date.now()}`,
          title: sub.title,
          authorName: sub.authorName,
          authorTagline: 'வாசகர் படைப்பாளர்',
          blogType: 'reader-story',
          category: sub.category || 'சிறுகதை',
          readingTime: '4 நிமிடங்கள்',
          summary: sub.content.slice(0, 150) + '...',
          content: sub.content,
          mainImage: sub.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
          status: 'published',
          createdAt: new Date().toISOString().slice(0, 10),
          likesCount: 1
        };
        const currentBlogs = customBlogsData || [];
        const nextBlogs = [newBlog, ...currentBlogs];
        if (saveCustomBlogsData) saveCustomBlogsData(nextBlogs);
        await api.saveContent('blogs', nextBlogs);
      } else if (sub.type === 'editorial') {
        // Publish to editorials in DB
        const newEditorial = {
          id: `edit-pub-${Date.now()}`,
          title: sub.title || 'வாசகர் தலையங்கம்',
          author: sub.authorName,
          authorRole: 'வாசகர் கட்டுரையாளர்',
          category: 'வாசகர் தலையங்கம்',
          desc: sub.content.slice(0, 150) + '...',
          content: sub.content,
          image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
          date: new Date().toISOString().slice(0, 10),
          readTime: '4 நிமிடங்கள்'
        };
        const nextEditorials = [newEditorial, ...editorialsList];
        setEditorialsList(nextEditorials);
        await api.saveContent('editorial_articles', nextEditorials);
      }

      // Mark submission as approved
      const updatedSubs = submissions.map((s) =>
        s.id === sub.id ? { ...s, status: 'approved', publishedAt: new Date().toLocaleString('ta-IN') } : s
      );
      setSubmissions(updatedSubs);
      await api.saveContent('reader_submissions', updatedSubs);

      showToast('படைப்பு அங்கீகரிக்கப்பட்டு தளத்தில் வெற்றிகரமாக வெளியிடப்பட்டது! 🎉');
      if (viewingSub?.id === sub.id) setViewingSub(null);
    } catch (e) {
      console.error('Error approving submission:', e);
      showToast('வெளியிடுவதில் பிழை ஏற்பட்டது');
    }
  };

  const handleRejectSubmission = async (id) => {
    const updated = submissions.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s));
    setSubmissions(updated);
    await api.saveContent('reader_submissions', updated);
    showToast('படைப்பு நிராகரிக்கப்பட்டது');
    if (viewingSub?.id === id) setViewingSub(null);
  };

  const handleDeleteSubmission = async (id) => {
    if (window.confirm('இந்த வாசகர் சமர்ப்பிப்பை நீக்க நிச்சயமாக விரும்புகிறீர்களா?')) {
      const updated = submissions.filter((s) => s.id !== id);
      setSubmissions(updated);
      await api.saveContent('reader_submissions', updated);
      showToast('சமர்ப்பிப்பு நீக்கப்பட்டது');
      if (viewingSub?.id === id) setViewingSub(null);
    }
  };

  // --- BLOGS (SHORT STORIES) ACTIONS ---
  const handleOpenBlogModal = (item = null) => {
    if (item) {
      setEditingBlog(item);
      setBlogForm({
        title: item.title || '',
        authorName: item.authorName || '',
        authorTagline: item.authorTagline || 'எழுத்தாளர்',
        category: item.category || 'சிறுகதை',
        readingTime: item.readingTime || '5 நிமிடங்கள்',
        moral: item.moral || '',
        summary: item.summary || '',
        content: item.content || '',
        mainImage: item.mainImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200'
      });
    } else {
      setEditingBlog(null);
      setBlogForm({
        title: '',
        authorName: '',
        authorTagline: 'எழுத்தாளர்',
        category: 'சிறுகதை',
        readingTime: '5 நிமிடங்கள்',
        moral: '',
        summary: '',
        content: '',
        mainImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200'
      });
    }
    setShowBlogModal(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content || !blogForm.authorName) {
      showToast('தயவுசெய்து தலைப்பு, ஆசிரியர் மற்றும் உள்ளடக்கத்தை நிரப்பவும்');
      return;
    }

    try {
      let currentBlogs = [...(customBlogsData || [])];
      if (editingBlog) {
        currentBlogs = currentBlogs.map((b) => (b.id === editingBlog.id ? { ...b, ...blogForm } : b));
        showToast('சிறுகதை வெற்றிகரமாக திருத்தப்பட்டது!');
      } else {
        const newBlog = {
          id: `blog-db-${Date.now()}`,
          ...blogForm,
          status: 'published',
          createdAt: new Date().toISOString().slice(0, 10),
          likesCount: 10
        };
        currentBlogs = [newBlog, ...currentBlogs];
        showToast('புதிய சிறுகதை/படைப்பு சேர்க்கப்பட்டது!');
      }

      if (saveCustomBlogsData) saveCustomBlogsData(currentBlogs);
      await api.saveContent('blogs', currentBlogs);
      setShowBlogModal(false);
    } catch (err) {
      console.error('Error saving blog:', err);
      showToast('சேமிப்பதில் பிழை');
    }
  };

  const handleDeleteBlog = async (id, title) => {
    if (window.confirm(`'${title}' கதையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) {
      const nextBlogs = (customBlogsData || []).filter((b) => b.id !== id);
      if (saveCustomBlogsData) saveCustomBlogsData(nextBlogs);
      await api.saveContent('blogs', nextBlogs);
      showToast('படைப்பு நீக்கப்பட்டது');
    }
  };

  // --- EDITORIALS ACTIONS ---
  const handleOpenEditorialModal = (item = null) => {
    if (item) {
      setEditingEditorial(item);
      setEditorialForm({
        title: item.title || '',
        author: item.author || 'தலையங்கக் குழு',
        authorRole: item.authorRole || 'முதன்மை ஆசிரியர்',
        category: item.category || 'தலையங்கம்',
        desc: item.desc || '',
        content: item.content || '',
        image: item.image || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        readTime: item.readTime || '5 நிமிடங்கள்'
      });
    } else {
      setEditingEditorial(null);
      setEditorialForm({
        title: '',
        author: 'தலையங்கக் குழு',
        authorRole: 'முதன்மை ஆசிரியர்',
        category: 'தலையங்கம்',
        desc: '',
        content: '',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        readTime: '5 நிமிடங்கள்'
      });
    }
    setShowEditModal(true);
  };

  const handleSaveEditorial = async (e) => {
    e.preventDefault();
    if (!editorialForm.title || !editorialForm.content) {
      showToast('தயவுசெய்து தலைப்பு மற்றும் உள்ளடக்கத்தை நிரப்பவும்');
      return;
    }

    try {
      let currentEdits = [...editorialsList];
      if (editingEditorial) {
        currentEdits = currentEdits.map((item) =>
          item.id === editingEditorial.id ? { ...item, ...editorialForm } : item
        );
        showToast('தலையங்கக் கட்டுரை திருத்தப்பட்டது!');
      } else {
        const newEditorial = {
          id: `edit-db-${Date.now()}`,
          ...editorialForm,
          date: new Date().toISOString().slice(0, 10)
        };
        currentEdits = [newEditorial, ...currentEdits];
        showToast('புதிய தலையங்கக் கட்டுரை சேர்க்கப்பட்டது!');
      }

      setEditorialsList(currentEdits);
      await api.saveContent('editorial_articles', currentEdits);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error saving editorial:', err);
      showToast('சேமிப்பதில் பிழை');
    }
  };

  const handleDeleteEditorial = async (id, title) => {
    if (window.confirm(`'${title}' தலையங்கக் கட்டுரையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) {
      const nextEdits = editorialsList.filter((item) => item.id !== id);
      setEditorialsList(nextEdits);
      await api.saveContent('editorial_articles', nextEdits);
      showToast('தலையங்கம் நீக்கப்பட்டது');
    }
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (subFilter !== 'all' && s.type !== subFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (subSearch.trim()) {
      const q = subSearch.toLowerCase();
      const match =
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.authorName && s.authorName.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-tamil text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0c1429] via-[#1a1438] to-[#0a2520] p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
            <Feather className="w-4 h-4 text-amber-400" /> வாசகர் அரங்கம் & தலையங்க மேலாண்மை
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>படைப்பாளர் களம் & வாசகர் படைப்புகள் மேலாண்மை</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-300">
            வலைப்பதிவுகள் மற்றும் தலையங்க பக்கங்களில் வாசகர்கள் சமர்ப்பிக்கும் கதைகள், கட்டுரைகளை பரிசீலித்து தளத்தில் வெளியிடவும்.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>வாசகர் சமர்ப்பிப்புகள்</span>
            {submissions.filter((s) => s.status === 'pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {submissions.filter((s) => s.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'blogs'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>வலைப்பதிவு & சிறுகதைகள் ({customBlogsData?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('editorials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'editorials'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>தலையங்கக் கட்டுரைகள் ({editorialsList.length})</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: READER SUBMISSIONS INBOX ================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="தலைப்பு, வாசகர் பெயர் அல்லது மின்னஞ்சல் தேட..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full bg-slate-900 text-white pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
              <select
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="all">அனைத்துப் பிரிவுகள்</option>
                <option value="blog">வலைப்பதிவு / சிறுகதை</option>
                <option value="editorial">தலையங்கம் / வாசகர் கடிதம்</option>
                <option value="competition">போட்டி விண்ணப்பம்</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="all">அனைத்து நிலைகள்</option>
                <option value="pending">நிலுவையில் (Pending)</option>
                <option value="approved">வெளியிடப்பட்டது (Published)</option>
                <option value="rejected">நிராகரிக்கப்பட்டது (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Submissions Table / Cards */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-10 text-center space-y-2">
              <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-white font-bold text-sm">சமர்ப்பிப்புகள் எதுவும் இல்லை</h4>
              <p className="text-xs text-slate-400">வாசகர்கள் சமர்ப்பிக்கும் படைப்புகள் இங்கு வரிசைப்படுத்தப்படும்.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredSubmissions.map((sub) => {
                const isPending = sub.status === 'pending';
                const isApproved = sub.status === 'approved';
                return (
                  <div
                    key={sub.id}
                    className="bg-[#0f172a] rounded-2xl border border-slate-800 hover:border-slate-700 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            sub.type === 'blog'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : sub.type === 'editorial'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {sub.type === 'blog' ? 'வலைப்பதிவு' : sub.type === 'editorial' ? 'தலையங்கம்' : 'போட்டி'}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                              : isApproved
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {isPending ? '⏳ நிலுவையில்' : isApproved ? '✓ வெளியிடப்பட்டது' : '✕ நிராகரிக்கப்பட்டது'}
                        </span>

                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {sub.createdAt}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white truncate">{sub.title}</h3>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {sub.content}
                      </p>

                      <div className="text-xs text-slate-400 flex items-center gap-3 pt-1 flex-wrap">
                        <span><strong>எழுத்தாளர்:</strong> {sub.authorName}</span>
                        {sub.email && <span><strong>மின்னஞ்சல்:</strong> {sub.email}</span>}
                        {sub.phone && <span><strong>தொலைபேசி:</strong> {sub.phone}</span>}
                        {sub.institution && <span><strong>நிறுவனம்:</strong> {sub.institution}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => setViewingSub(sub)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="முழு விவரம் காண்க"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>பார்வை</span>
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleApproveAndPublish(sub)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-600/30 cursor-pointer"
                          title="அங்கீகரித்து தளத்தில் வெளியிடு"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>அங்கீகரித்து வெளியிடு</span>
                        </button>
                      )}

                      {isPending && (
                        <button
                          onClick={() => handleRejectSubmission(sub.id)}
                          className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                          title="நிராகரி"
                        >
                          நிராகரி
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl cursor-pointer"
                        title="நீக்கு"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: BLOGS & SHORT STORIES MANAGEMENT ================= */}
      {activeTab === 'blogs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">வலைப்பதிவு & சிறுகதைகள் பட்டியல்</h3>
              <p className="text-xs text-slate-400">இங்கு உருவாக்கப்படும் கதைகள் நேரடியாக வாசகர் வலைப்பதிவு பக்கத்தில் தோன்றும்.</p>
            </div>
            <button
              onClick={() => handleOpenBlogModal()}
              className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ புதிய சிறுகதை / படைப்பு சேர்</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(customBlogsData || []).map((blog) => (
              <div
                key={blog.id}
                className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full">
                    <img
                      src={blog.mainImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {blog.category || 'சிறுகதை'}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">{blog.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {blog.summary || blog.content}
                    </p>
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span><strong>ஆசிரியர்:</strong> {blog.authorName}</span>
                      <span>{blog.readingTime || '5 நிமிடங்கள்'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenBlogModal(blog)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    title="திருத்து"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.id, blog.title)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold cursor-pointer"
                    title="நீக்கு"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 3: EDITORIAL ARTICLES MANAGEMENT ================= */}
      {activeTab === 'editorials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">தலையங்கக் கட்டுரைகள் பட்டியல்</h3>
              <p className="text-xs text-slate-400">இங்கு உருவாக்கப்படும் கட்டுரைகள் தலையங்கம் பக்கத்தில் உடனடியாகத் தோன்றும்.</p>
            </div>
            <button
              onClick={() => handleOpenEditorialModal()}
              className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ புதிய தலையங்கம் சேர்</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editorialsList.map((item) => (
              <div
                key={item.id}
                className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {item.category || 'தலையங்கம்'}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {item.desc || item.content}
                    </p>
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span><strong>எழுதியவர்:</strong> {item.author}</span>
                      <span>{item.readTime || '5 நிமிடங்கள்'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditorialModal(item)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    title="திருத்து"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEditorial(item.id, item.title)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold cursor-pointer"
                    title="நீக்கு"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW SUBMISSION DETAIL MODAL */}
      {viewingSub && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0f172a] border-2 border-amber-500/50 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">வாசகர் படைப்பு விவரம்</span>
                <h3 className="font-bold text-white text-base truncate max-w-md">{viewingSub.title}</h3>
              </div>
              <button onClick={() => setViewingSub(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-1">
                <div><strong>எழுத்தாளர்:</strong> {viewingSub.authorName}</div>
                {viewingSub.email && <div><strong>மின்னஞ்சல்:</strong> {viewingSub.email}</div>}
                {viewingSub.phone && <div><strong>தொலைபேசி:</strong> {viewingSub.phone}</div>}
                <div><strong>தேதி:</strong> {viewingSub.createdAt}</div>
                {viewingSub.entryUrl && (
                  <div>
                    <strong>இணைப்பு:</strong>{' '}
                    <a href={viewingSub.entryUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">
                      {viewingSub.entryUrl}
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <strong className="block text-white">உள்ளடக்கம்:</strong>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed text-xs">
                  {viewingSub.content}
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              {viewingSub.status === 'pending' && (
                <button
                  onClick={() => handleApproveAndPublish(viewingSub)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow"
                >
                  <Check className="w-3.5 h-3.5" /> அங்கீகரித்து வெளியிடு
                </button>
              )}
              <button
                onClick={() => setViewingSub(null)}
                className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold"
              >
                மூடுக
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOG / SHORT STORY ADD/EDIT MODAL */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0f172a] border-2 border-amber-500/50 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-amber-400 text-base">
                {editingBlog ? 'சிறுகதை / படைப்பை திருத்து' : 'புதிய சிறுகதை / படைப்பு சேர்'}
              </h3>
              <button onClick={() => setShowBlogModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveBlog} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">கதை / படைப்பின் தலைப்பு *</label>
                <input
                  type="text"
                  required
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  placeholder="எ.கா: வானத்து நிலவும் வசந்தத்தின் கதையும்..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">எழுத்தாளர் பெயர் *</label>
                  <input
                    type="text"
                    required
                    value={blogForm.authorName}
                    onChange={(e) => setBlogForm({ ...blogForm, authorName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">பிரிவு (Category)</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="சிறுகதை">சிறுகதை</option>
                    <option value="நீதிக்கதை">சிறுவர் நீதிக்கதை</option>
                    <option value="இலக்கிய ஆய்வு">இலக்கிய ஆய்வு</option>
                    <option value="கவிதை அரங்கம்">கவிதை அரங்கம்</option>
                    <option value="தன்னம்பிக்கை">தன்னம்பிக்கை</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">படம் (Image URL)</label>
                <input
                  type="url"
                  value={blogForm.mainImage}
                  onChange={(e) => setBlogForm({ ...blogForm, mainImage: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">முக்கிய கருத்து / நீதி (Moral / Tagline)</label>
                <input
                  type="text"
                  value={blogForm.moral}
                  onChange={(e) => setBlogForm({ ...blogForm, moral: e.target.value })}
                  placeholder="கதையின் சாராம்ச நீதி..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">கதையின் முழு உள்ளடக்கம் *</label>
                <textarea
                  rows={6}
                  required
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  placeholder="முழு சிறுகதையை இங்கு பதிவிடவும்..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold px-6 py-2 rounded-xl text-xs shadow"
                >
                  சேமித்து வெளியிடு
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDITORIAL ADD/EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0f172a] border-2 border-amber-500/50 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-amber-400 text-base">
                {editingEditorial ? 'தலையங்கக் கட்டுரையை திருத்து' : 'புதிய தலையங்கக் கட்டுரை சேர்'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveEditorial} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">தலையங்கத் தலைப்பு *</label>
                <input
                  type="text"
                  required
                  value={editorialForm.title}
                  onChange={(e) => setEditorialForm({ ...editorialForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">எழுதியவர் / ஆசிரியர் குழு</label>
                  <input
                    type="text"
                    value={editorialForm.author}
                    onChange={(e) => setEditorialForm({ ...editorialForm, author: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">பிரிவு (Category)</label>
                  <input
                    type="text"
                    value={editorialForm.category}
                    onChange={(e) => setEditorialForm({ ...editorialForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">படம் (Image URL)</label>
                <input
                  type="url"
                  value={editorialForm.image}
                  onChange={(e) => setEditorialForm({ ...editorialForm, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">கட்டுரையின் முழு உரை *</label>
                <textarea
                  rows={6}
                  required
                  value={editorialForm.content}
                  onChange={(e) => setEditorialForm({ ...editorialForm, content: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold px-6 py-2 rounded-xl text-xs shadow"
                >
                  சேமித்து வெளியிடு
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReaderSubmissionsManager;
