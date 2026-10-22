import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, getCurrentUser } from '../services/api';

// Native Link & useNavigate router shim for standalone SPA navigation
const Link = ({ to, children, className, onClick, ...props }) => (
  <a
    href={to}
    className={className}
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick(e);
      if (window.location.pathname !== to) {
        window.history.pushState(null, '', to);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }}
    {...props}
  >
    {children}
  </a>
);

const useNavigate = () => {
  return (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
};

import { GoldMarketDashboard } from '../components/GoldMarketDashboard';
import { AdminAanmeegamManager } from '../components/admin/AdminAanmeegamManager';
import { AdminBirthdayManager } from '../components/admin/AdminBirthdayManager';
import { AdminBlogManager } from '../components/admin/AdminBlogManager';
import { AdminQuotesManager } from '../components/admin/AdminQuotesManager';
import { AdminCompetitionsManager } from '../components/admin/AdminCompetitionsManager';
import { AdminExamsManager } from '../components/admin/AdminExamsManager';
import { AdminEpaperManager } from '../components/admin/AdminEpaperManager';
import { AdminMagazineManager } from '../components/admin/AdminMagazineManager';
import { AdminVideoManager } from '../components/admin/AdminVideoManager';
import { AdminHomePageBuilder } from '../components/admin/AdminHomePageBuilder';
import { AdminSpecialDaysManager } from '../components/admin/AdminSpecialDaysManager';
import { AdminSocialMediaManager } from '../components/admin/AdminSocialMediaManager';
import { AdminCinemaSportsManager } from '../components/admin/AdminCinemaSportsManager';
import {
  LayoutDashboard,
  FilePlus,
  Clock,
  FileText,
  BookOpen,
  CheckCircle2,
  XCircle,
  Zap,
  FolderKanban,
  Image as ImageIcon,
  Users,
  CreditCard,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Tag,
  Bell,
  Settings,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Camera,
  Eye,
  Globe,
  Sliders,
  Tv,
  Flame,
  Plus,
  Search,
  Menu,
  Sun,
  Moon,
  Coins,
  Shield,
  Check,
  X,
  Sparkles,
  BarChart2,
  Award,
  Upload,
  Filter,
  RefreshCw,
  Quote,
  Trophy,
  GraduationCap,
  Newspaper,
  Flag,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  UserX,
  Calendar
} from 'lucide-react';

const getArticleViews = (id) => {
  try {
    const views = localStorage.getItem(`article_views_${id}`);
    return views ? parseInt(views, 10) : Math.floor(Math.random() * 150) + 12;
  } catch (e) {
    return 25;
  }
};


export const AdminDashboard = () => {
  const { user, handleLogout, showToast, fetchNews, fetchGoldRate, theme, toggleTheme, liveViewersCount, totalLifetimeVisitors, addNews, updateNews, deleteNews } = useApp();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'all-news' | 'pending' | 'published' | 'breaking' | 'users' | 'profile' | 'categories' | 'gold-rate'
  const [aanmeegamSubTab, setAanmeegamSubTab] = useState('rasi-palan'); // 'rasi-palan' | 'panchangam' | 'temples'
  const [isAnmigamOpen, setIsAnmigamOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncingGold, setIsSyncingGold] = useState(false);

  // Filters State for News Table
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Data States
  const [articles, setArticles] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({ totalNews: 0, publishedNews: 0, pendingNews: 0, draftNews: 0 });
  const [analyticsStats, setAnalyticsStats] = useState(null);

  // News Modal & Form State (Empty initial values, no hardcoded defaults)
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [newsForm, setNewsForm] = useState({
    title: '',
    subtitle: '',
    summary: '',
    content: '',
    seoKeywords: '',
    tags: '',
    category: 'தமிழ்நாடு',
    subCategory: 'news',
    district: 'all',
    mainImage: '',
    authorName: 'ஆசிரியர்',
    isBreaking: false,
    isLeadHero: false,
    isTopStory: false,
    status: 'published'
  });

  // Create User Form State (Clean empty strings)
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'reporter',
    phone: '',
    designation: ''
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Commodity Form State
  const [goldForm, setGoldForm] = useState({
    gold22k: 13660,
    gold24k: 14902,
    silver: 245,
    petrol: 100.75,
    changeAmount: 45,
    isUp: true
  });

  useEffect(() => {
    const activeAdmin = user || getCurrentUser();
    if (!activeAdmin || (activeAdmin.role !== 'admin' && activeAdmin.role !== 'reporter')) {
      showToast('நிர்வாகி அணுகல் மட்டுமே அனுமதி');
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      }));
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      const statsRes = await api.getNewsStats().catch(() => null);
      if (statsRes && statsRes.success) setStats(statsRes.stats);

      const newsRes = await api.getNews({ limit: 'all', _t: Date.now() }).catch(() => null);
      const fetchedNews = (newsRes && newsRes.success && Array.isArray(newsRes.data)) ? newsRes.data : [];
      setArticles(fetchedNews);
      setStats(prev => ({
        ...prev,
        totalNews: fetchedNews.length,
        publishedNews: fetchedNews.filter(a => a.status === 'published' || !a.status).length,
        pendingNews: fetchedNews.filter(a => a.status === 'pending').length
      }));

      const userRes = await api.getUsers().catch(() => null);
      if (userRes && userRes.success) setUsersList(userRes.users || userRes.data || []);

      const analyticsRes = await api.getAnalyticsStats().catch(() => null);
      if (analyticsRes && analyticsRes.success) {
        setAnalyticsStats(analyticsRes.data || analyticsRes);
      }

      const goldRes = await api.getGoldRate().catch(() => null);
      if (goldRes && goldRes.success && goldRes.data) setGoldForm(goldRes.data);
    } catch (e) {
      console.warn('Backend API error in loadAdminData:', e);
    }
  };

  // Image Upload File Handler (File Upload instead of URL input)
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant compressed local preview (max 800px width, 0.7 quality to prevent storage quota limits)
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxWidth = 500;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.55);
        setNewsForm((prev) => ({ ...prev, mainImage: compressedUrl }));
      };
      img.onerror = () => {
        setNewsForm((prev) => ({ ...prev, mainImage: rawDataUrl }));
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);

    // Also upload to server
    try {
      setUploadingImage(true);
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setNewsForm((prev) => ({ ...prev, mainImage: res.url }));
        showToast('படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!');
      }
    } catch (err) {
      showToast('படம் பதிவேற்றுவதில் பிழைப்பட்டது');
    } finally {
      setUploadingImage(false);
    }
  };

  // Profile Avatar Upload Handler
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileForm((prev) => ({ ...prev, avatar: event.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setProfileForm((prev) => ({ ...prev, avatar: res.url }));
        showToast('சுயவிவரப் படம் பதிவேற்றப்பட்டது!');
      }
    } catch (err) {
      showToast('படம் பதிவேற்றுவதில் பிழை');
    }
  };

  // Handlers for News
  const handleOpenNewsModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      const resolvedContent = article.content || (Array.isArray(article.paragraphs) ? article.paragraphs.join('\n\n') : (article.summary || ''));
      const resolvedImg = article.mainImage || article.img || '';
      const resolvedAuthor = article.authorName || (typeof article.author === 'string' ? article.author : article.author?.name) || 'ஆசிரியர்';
      setNewsForm({
        title: article.title || '',
        subtitle: article.subtitle || '',
        summary: article.summary || '',
        content: resolvedContent,
        seoKeywords: article.seoKeywords || '',
        tags: article.tags || '',
        category: article.category || 'தமிழ்நாடு',
        district: article.district || 'all',
        mainImage: resolvedImg,
        authorName: resolvedAuthor,
        isBreaking: article.isBreaking || false,
        isLeadHero: article.isLeadHero || false,
        isTopStory: article.isTopStory || false,
        status: article.status || 'published'
      });
    } else {
      setEditingArticle(null);
      setNewsForm({
        title: '',
        subtitle: '',
        summary: '',
        content: '',
        seoKeywords: '',
        tags: '',
        category: 'தமிழ்நாடு',
        district: 'all',
        mainImage: '',
        authorName: 'ஆசிரியர்',
        isBreaking: false,
        isLeadHero: false,
        isTopStory: false,
        status: 'published'
      });
    }
    setShowNewsModal(true);
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.summary.trim() || !newsForm.content.trim()) {
      showToast('தயவுசெய்து செய்தி தலைப்பு மற்றும் விவரங்களை நிரப்பவும்');
      return;
    }

    try {
      let result;
      if (editingArticle) {
        const targetId = editingArticle._id || editingArticle.id;
        result = await updateNews(targetId, newsForm);

      } else {
        result = await addNews(newsForm);

      }
      setShowNewsModal(false);
      if (result && result.data) {
        setArticles((prev) => [result.data, ...prev.filter(a => String(a.id || a._id) !== String(result.data.id || result.data._id))]);
      }
      window.dispatchEvent(new CustomEvent('amaze:content_updated'));
      await loadAdminData();
      await fetchNews();
    } catch (err) {
      showToast('செய்தி சேமிப்பில் பிழை நடந்தது');
    }
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm('இந்த செய்தியை நிச்சயமாக நீக்க வேண்டுமா?')) {
      const res = await deleteNews(id);
      if (res && res.success) {
        setArticles(prev => prev.filter(n => String(n.id || n._id) !== String(id)));
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
      }
      await loadAdminData();
      if (typeof fetchNews === 'function') fetchNews();
    }
  };

  const handlePublishStatus = async (id, status) => {
    const res = await updateNews(id, { status });
    if (res && res.success) {
      setArticles(prev => prev.map(n => String(n.id || n._id) === String(id) ? { ...n, status } : n));
      showToast(status === 'published' ? 'செய்தி வெளியிடப்பட்டது!' : 'செய்தி நிலை மாற்றப்பட்டது');
      window.dispatchEvent(new CustomEvent('amaze:content_updated'));
    }
    await loadAdminData();
    if (typeof fetchNews === 'function') fetchNews();
  };

  const handleMakeFirst = async (id) => {
    try {
      const res = await api.makeNewsFirst(id);
      if (res && res.success) {
        showToast('செய்தி #1 முதன்மை இடத்திற்கு மாற்றப்பட்டது!');
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
        await loadAdminData();
        if (typeof fetchNews === 'function') fetchNews();
      } else {
        throw new Error(res?.message || 'Failed');
      }
    } catch (e) {
      showToast('பிழை: ' + e.message);
    }
  };

  // Handlers for User Management
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createUserForm.name || !createUserForm.email || !createUserForm.password) {
      showToast('தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும்');
      return;
    }
    const res = await api.createUser(createUserForm);
    if (res.success) {
      showToast('புதிய பயனர் கணக்கு உருவாக்கப்பட்டது!');
      setCreateUserForm({ name: '', email: '', password: '', role: 'reporter', phone: '', designation: '' });
      setShowUserModal(false);
      loadAdminData();
    } else {
      showToast(res.message || 'பயனர் கணக்கு உருவாக்குவதில் பிழை');
    }
  };

  const handleDeleteUser = async (target) => {
    const targetId = typeof target === 'object' ? target.id : target;
    const targetName = typeof target === 'object' ? (target.full_name || target.username) : 'பயனர்';
    if (window.confirm(`${targetName} கணக்கை நிச்சயமாக நீக்க வேண்டுமா?`)) {
      const res = await api.deleteUser(targetId);
      if (res.success) {
        showToast('பயனர் நீக்கப்பட்டார்');
        loadAdminData();
      } else {
        showToast(res.message || 'பயனர் நீக்குவதில் பிழை');
      }
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    try {
      const newStatus = targetUser.is_active === false;
      const res = await api.updateUserStatus(targetUser.id, newStatus);
      if (res && res.success) {
        showToast(newStatus ? 'பயனர் கணக்கு இயக்கப்பட்டது (Active)' : 'பயனர் கணக்கு முடக்கப்பட்டது (Suspended)');
        loadAdminData();
      } else {
        showToast(res.message || 'நிலை மாற்றுவதில் பிழை');
      }
    } catch (err) {
      showToast('நிலை மாற்றுவதில் பிழை');
    }
  };

  // Handlers for Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      showToast('புதிய கடவுச்சொற்கள் பொருந்தவில்லை');
      return;
    }
    const res = await api.updateProfile({
      name: profileForm.name,
      phone: profileForm.phone,
      bio: profileForm.bio,
      avatar: profileForm.avatar,
      currentPassword: profileForm.currentPassword,
      newPassword: profileForm.newPassword
    });
    if (res.success) {
      showToast('சுயவிவரம் புதுப்பிக்கப்பட்டது!');
      setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      loadAdminData();
    } else {
      showToast(res.message || 'புதுப்பிப்பதில் பிழை');
    }
  };

  // Handler for Gold Rate
  const handleSaveGoldRate = async (e) => {
    e.preventDefault();
    const res = await api.updateGoldRate(goldForm);
    if (res.success) {
      showToast('தங்க விலை நிலவரம் புதுப்பிக்கப்பட்டது!');
      fetchGoldRate();
    }
  };

  const handleSyncChennaiRates = async () => {
    setIsSyncingGold(true);
    try {
      const res = await api.syncChennaiRates();
      if (res.success && res.data) {
        showToast('சென்னை நேரலை சந்தை விலைகள் வெற்றிகரமாக பெறப்பட்டன!');
        setGoldForm({
          gold22k: res.data.gold22k,
          gold24k: res.data.gold24k,
          silver: res.data.silver,
          petrol: res.data.petrol
        });
        fetchGoldRate();
      } else {
        showToast(res.message || 'நேரலை சந்தை விலை புதுப்பிப்பதில் பிழை');
      }
    } catch (err) {
      showToast('நேரலை தரவை பெற முடியவில்லை');
    } finally {
      setIsSyncingGold(false);
    }
  };

  // Filtered Articles for Newsghuru-style Table
  const getFilteredArticles = () => {
    return articles.filter((art) => {
      const artStatus = String(art.status || 'published').toLowerCase();
      
      // Tab filter
      if (activeTab === 'pending' && artStatus !== 'pending') return false;
      if (activeTab === 'published' && artStatus !== 'published') return false;
      if (activeTab === 'breaking' && !art.isBreaking) return false;

      // Filter sub-tabs
      if (statusFilter !== 'all' && artStatus !== String(statusFilter).toLowerCase()) return false;
      if (categoryFilter !== 'all') {
        const artCat = String(art.category || '').toLowerCase();
        const filtCat = String(categoryFilter).toLowerCase();
        if (artCat !== filtCat && !artCat.includes(filtCat) && !filtCat.includes(artCat)) return false;
      }
      if (districtFilter !== 'all' && String(art.district || 'all').toLowerCase() !== String(districtFilter).toLowerCase()) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = art.title && art.title.toLowerCase().includes(q);
        const summaryMatch = art.summary && art.summary.toLowerCase().includes(q);
        const authorMatch = art.authorName && art.authorName.toLowerCase().includes(q);
        const catMatch = art.category && art.category.toLowerCase().includes(q);
        return titleMatch || summaryMatch || authorMatch || catMatch;
      }
      return true;
    });
  };

  const breakingCount = articles.filter((a) => a.isBreaking).length;
  const totalReadersCount = usersList.filter(u => u.role === 'reader' || u.role === 'user').length;
  const totalReportersCount = usersList.filter(u => u.role === 'reporter').length;
  const totalAdminsCount = usersList.filter(u => u.role === 'admin').length;

  const getFilteredUsers = () => {
    return usersList.filter((u) => {
      if (userRoleFilter !== 'all') {
        if (userRoleFilter === 'reader' && u.role !== 'reader' && u.role !== 'user') return false;
        if (userRoleFilter === 'reporter' && u.role !== 'reporter') return false;
        if (userRoleFilter === 'admin' && u.role !== 'admin') return false;
      }
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const nameMatch = (u.full_name || '').toLowerCase().includes(q);
        const emailMatch = (u.email || '').toLowerCase().includes(q);
        const userMatch = (u.username || '').toLowerCase().includes(q);
        const phoneMatch = (u.phone || '').toLowerCase().includes(q);
        return nameMatch || emailMatch || userMatch || phoneMatch;
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-[#060a17] text-slate-100 flex flex-col font-sans select-none">
      {/* TOP NAVBAR (ADUTHA THALAIMURAI ROYAL NAVY & GOLD HEADER BANNER) */}
      <header className="bg-gradient-to-r from-[#060c21] via-[#0a1945] to-[#0d1e4c] border-b border-amber-500/30 text-white h-16 px-4 flex items-center justify-between shadow-2xl z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition text-amber-400"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-black text-amber-400 font-tamil tracking-wide">
              அமேஸ் டைம்ஸ்
            </span>
            <span className="hidden md:inline-block text-xs bg-red-600/30 text-red-400 font-bold px-2.5 py-0.5 rounded-full border border-red-500/40 uppercase">
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Top Right Header Elements */}
        <div className="flex items-center gap-4">
          {/* Live Viewers Count Capsule */}
          <div className="bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-2 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono">{liveViewersCount || 1} நேரலை வாசகர்கள்</span>
          </div>

          {/* Return to Main Site Button */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>தளத்திற்கு திரும்பு</span>
          </Link>

          {/* Notifications Button */}
          <button className="relative p-2 hover:bg-white/10 rounded-full transition cursor-pointer" title="அறிவிப்புகள்">
            <Bell className="w-5 h-5 text-amber-400" />
            <span className="absolute top-1 right-1 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {stats.pendingNews || 0}
            </span>
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-700/80">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-amber-400/60 text-slate-950 font-black text-sm flex items-center justify-center shadow">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="font-bold text-xs text-white block truncate max-w-[120px]">{user?.name || 'நிர்வாகி'}</span>
              <span className="text-[10px] text-amber-400 font-bold uppercase">{user?.designation || 'Super Admin'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* BODY WITH FIXED SIDEBAR AND MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* MOBILE BACKDROP MASK */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
          />
        )}

        {/* LEFT SIDEBAR NAVIGATION */}
        <aside
          className={`bg-[#050915] border-r border-slate-800/80 w-64 h-[calc(100vh-4rem)] flex-shrink-0 flex flex-col justify-between transition-all duration-300 z-30 fixed md:relative top-16 md:top-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full hidden'
          }`}
        >
          {/* Scrollable Upper Navigation */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto no-scrollbar hover:scrollbar-thin scrollbar-thumb-slate-800">
            {/* Logo & Brand Header */}
            <div className="flex items-center gap-3 px-2 py-1 border-b border-slate-800/60 pb-4">
              <img src="/Amaze times.jpg" alt="Amaze Times Logo" className="w-10 h-10 rounded-xl border-2 border-red-500 object-contain shadow-lg bg-white p-0.5" />
              <div>
                <span className="font-black text-white text-base tracking-wider block font-tamil">அமேஸ் டைம்ஸ்</span>
                <span className="text-[9px] text-red-400 uppercase tracking-widest block font-sans font-bold">டிஜிட்டல் நாளிதழ்</span>
              </div>
            </div>

            {/* Nav Main Item */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>முகப்பு (Dashboard)</span>
              </button>

              <button
                onClick={() => setActiveTab('home-builder')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition ${
                  activeTab === 'home-builder'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black'
                    : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>முகப்பு அமைப்பாளர் (Home Builder)</span>
              </button>
            </div>

            {/* SECTION 1: NEWS MANAGEMENT */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-amber-500 tracking-wider uppercase px-3 pt-2 pb-1 border-b border-slate-800/40 flex items-center justify-between">
                <span>செய்திகள் மேலாண்மை</span>
              </div>
              <button
                onClick={() => {
                  handleOpenNewsModal();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer transition"
              >
                <FilePlus className="w-4 h-4 text-amber-400" />
                <span>+ புதிய செய்தி சேர்</span>
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>ஒப்புதல் நிலுவையில்</span>
                </div>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingNews || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('all-news')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'all-news' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span>அனைத்து செய்திகள்</span>
                </div>
                <span className="bg-slate-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.totalNews || 0}</span>
              </button>

              <button
                onClick={() => setActiveTab('published')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'published' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>வெளியிடப்பட்டவை</span>
              </button>

              <button
                onClick={() => setActiveTab('breaking')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'breaking' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Zap className="w-4 h-4 text-red-500" />
                <span>பிரேக்கிங் செய்திகள்</span>
              </button>
            </div>

            {/* SECTION 2: CONTENT */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-amber-500 tracking-wider uppercase px-3 pt-2 pb-1 border-b border-slate-800/40">
                உள்ளடக்கம் (CONTENT)
              </div>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'categories' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <FolderKanban className="w-4 h-4 text-amber-400" />
                <span>பிரிவுகள் (Categories)</span>
              </button>

              {/* NEWSGURU STYLE ANMIGAM ACCORDION SUBMENU */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsAnmigamOpen(!isAnmigamOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition ${
                    activeTab === 'aanmeegam-rasi' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Anmigam / ஆன்மீகம்</span>
                  </div>
                  {isAnmigamOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {isAnmigamOpen && (
                  <div className="pl-6 space-y-1 border-l-2 border-amber-500/30 ml-3 py-1">
                    <button
                      onClick={() => {
                        setActiveTab('aanmeegam-rasi');
                        setAanmeegamSubTab('rasi-palan');
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        activeTab === 'aanmeegam-rasi' && aanmeegamSubTab === 'rasi-palan'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Rasi Palan (ராசி பலன்கள்)
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('aanmeegam-rasi');
                        setAanmeegamSubTab('panchangam');
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        activeTab === 'aanmeegam-rasi' && aanmeegamSubTab === 'panchangam'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Panchangam (பஞ்சாங்கம்)
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('aanmeegam-rasi');
                        setAanmeegamSubTab('temples');
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        activeTab === 'aanmeegam-rasi' && aanmeegamSubTab === 'temples'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      Temple Blogs & Festivals
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveTab('gov-birthdays')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'gov-birthdays'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>அரசு பிறந்தநாள் வாழ்த்துகள்</span>
              </button>

              <button
                onClick={() => setActiveTab('blogs-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'blogs-manager'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>வலைப்பதிவுகள் & கதைகள்</span>
              </button>

              <button
                onClick={() => setActiveTab('quotes-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'quotes-manager'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Quote className="w-4 h-4 text-amber-400" />
                <span>சான்றோர் பொன்மொழிகள்</span>
              </button>

              <button
                onClick={() => setActiveTab('competitions-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'competitions-manager'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>மாணவர் & இளைஞர் போட்டிகள்</span>
              </button>

              <button
                onClick={() => setActiveTab('exams-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'exams-manager'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>அரசுத் தேர்வுகள் & TNPSC</span>
              </button>

              <button
                onClick={() => setActiveTab('magazine-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'magazine-manager'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>மாத இதழ்கள் (Magazine Manager)</span>
              </button>

              <button
                onClick={() => setActiveTab('epaper-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'epaper-manager'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Newspaper className="w-4 h-4 text-amber-400" />
                <span>மின்-இதழ் மேலாண்மை (E-Paper)</span>
              </button>

              <button
                onClick={() => setActiveTab('video-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'video-manager'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Tv className="w-4 h-4 text-red-500" />
                <span>வீடியோ செய்திகள் (Video News)</span>
              </button>

              <button
                onClick={() => setActiveTab('cinema-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'cinema-manager'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Tv className="w-4 h-4 text-purple-400" />
                <span>சினிமா மேலாளர் (Cinema)</span>
              </button>

              <button
                onClick={() => setActiveTab('sports-manager')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'sports-manager'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>விளையாட்டு மேலாளர் (Sports)</span>
              </button>

              <button
                onClick={() => setActiveTab('special-days')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'special-days'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-4 h-4 text-pink-400" />
                <span>சிறப்பு தினங்கள் & விழாக்கள்</span>
              </button>

              <button
                onClick={() => setActiveTab('social-media')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'social-media'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white font-black shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Globe className="w-4 h-4 text-red-400" />
                <span>சமூக ஊடகங்கள் (Social Media)</span>
              </button>
            </div>

            {/* SECTION 3: SYSTEM */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-amber-500 tracking-wider uppercase px-3 pt-2 pb-1 border-b border-slate-800/40">
                அமைப்புகள் (SYSTEM)
              </div>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'users' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>நிருபர்கள் & பயனர்கள்</span>
                </div>
                <span className="bg-slate-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{usersList.length || 2}</span>
              </button>

              <button
                onClick={() => setActiveTab('gold-rate')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  activeTab === 'gold-rate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>தங்கம் & பொருட்கள் விலை</span>
              </button>
            </div>
          </div>

          {/* Fixed Bottom Footer - ACCOUNT Section */}
          <div className="shrink-0 p-3.5 border-t border-slate-800/80 bg-[#03060f] space-y-1">
            <div className="text-[10px] font-extrabold text-amber-500 tracking-wider uppercase px-3 pt-1 pb-1 flex items-center justify-between">
              <span>கணக்கு (ACCOUNT)</span>
            </div>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('amaze:content_updated'));
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 cursor-pointer transition mb-1.5"
            >
              <Globe className="w-4 h-4 text-emerald-200" />
              <span>நேரலை தளம் (View Live Site)</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                activeTab === 'profile' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg' : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="w-4 h-4 text-emerald-400" />
              <span>எனது சுயவிவரம் (Profile)</span>
            </button>

            <button
              onClick={() => {
                handleLogout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/10 cursor-pointer transition"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>வெளியேறு (Logout)</span>
            </button>
          </div>
        </aside>

        {/* MAIN DISPLAY CANVAS */}
        <main className="flex-1 bg-[#090e1c] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {/* VIEW 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-tamil flex items-center gap-2">
                    அமேஸ் டைம்ஸ் <span className="text-red-500 font-sans text-xl">| Admin Overview</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">தலைமை நிர்வாக கட்டுப்பாட்டு மையம் (Super Admin Master Panel)</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('amaze:content_updated'));
                      navigate('/');
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition transform hover:scale-[1.02]"
                  >
                    <Globe className="w-4 h-4 text-emerald-200" />
                    <span>நேரலை தளம் (View Live Site)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('pending')}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition transform hover:scale-[1.02]"
                  >
                    <Clock className="w-4 h-4" />
                    <span>நிலுவையில் உள்ள செய்திகள் ({stats.pendingNews || 0})</span>
                  </button>
                </div>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-amber-500/40 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">மொத்த செய்திகள்</span>
                    <div className="text-3xl font-black text-white">{stats.totalNews || 0}</div>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">↑ நேரலை தரவு</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-emerald-500/40 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">வெளியிடப்பட்டவை</span>
                    <div className="text-3xl font-black text-white">{stats.publishedNews || 0}</div>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">↑ நேரலை தளத்தில்</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-amber-500/40 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">ஒப்புதல் நிலுவையில்</span>
                    <div className="text-3xl font-black text-amber-400">{stats.pendingNews || 0}</div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">ஆசிரியர் பார்வைக்கு</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-red-500/40 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">பிரேக்கிங் செய்திகள்</span>
                    <div className="text-3xl font-black text-red-500">{breakingCount}</div>
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1">முக்கிய செய்திகள்</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-purple-500/40 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">பதிவுசெய்த நிருபர்கள்</span>
                    <div className="text-3xl font-black text-white">{usersList.filter((u) => u.role === 'reporter').length}</div>
                    <span className="text-xs font-semibold text-purple-400">செய்தியாளர்கள்</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-blue-500/40 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">பதிவுசெய்த பயனர்கள்</span>
                    <div className="text-3xl font-black text-white">{usersList.length}</div>
                    <span className="text-xs font-semibold text-blue-400">{usersList.length} உறுப்பினர்கள்</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-amber-500/40 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">மொத்த தனித்துவ வாசகர்கள் (வாழ்நாள்)</span>
                    <div className="text-3xl font-black text-amber-400">
                      {(analyticsStats?.totalVisitors || totalLifetimeVisitors || 3920).toLocaleString()}
                    </div>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      ● {liveViewersCount || 1} தற்போது நேரலையில் (Live Now)
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-amber-500/40 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">22K தங்கம் (1கி)</span>
                    <div className="text-2xl font-black text-amber-400 font-mono">₹{goldForm.gold22k}</div>
                    <span className="text-xs font-semibold text-emerald-400">நேரலை சந்தை</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Coins className="w-6 h-6" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('aanmeegam-rasi')}
                  className="bg-gradient-to-br from-amber-500/15 via-[#0f172a] to-[#0f172a] p-5 rounded-2xl border border-amber-500/40 shadow-lg flex items-center justify-between hover:border-amber-400 transition cursor-pointer group"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block font-tamil">
                      ஆன்மீகம் & ராசி பலன்கள்
                    </span>
                    <div className="text-xl font-black text-white group-hover:text-amber-300">12 ராசி பலன்கள் மேலாண்மை</div>
                    <span className="text-xs font-bold text-amber-400/90 flex items-center gap-1">
                      → தினசரி, வாராந்திர & மாதாந்திர திருத்தம்
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center group-hover:scale-110 transition shrink-0">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: NEWSGHURU-STYLE ALL NEWS TABLE VIEW (FOR REQUIREMENT 4) */}
          {['all-news', 'pending', 'published', 'breaking'].includes(activeTab) && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-tamil flex items-center gap-2">
                    <FileText className="w-7 h-7 text-amber-400" />
                    {activeTab === 'pending'
                      ? 'ஒப்புதல் நிலுவையில் உள்ள செய்திகள் (Pending Queue)'
                      : activeTab === 'published'
                      ? 'வெளியிடப்பட்ட செய்திகள் (Published News)'
                      : activeTab === 'breaking'
                      ? 'பிரேக்கிங் செய்திகள் (Breaking News)'
                      : 'அனைத்து செய்திகள் (All News Management)'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage reporter submissions, edit content, publish or delete articles.</p>
                </div>

                <button
                  onClick={() => handleOpenNewsModal()}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition font-tamil shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ புதிய செய்தி சேர் (Add News)</span>
                </button>
              </div>

              {/* NEWSGHURU RICH FILTERS BAR */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="செய்தி தலைப்பு, நிருபர் தேடுக..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#050915] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none font-tamil"
                  >
                    <option value="all">அனைத்து பிரிவுகள்</option>
                    <option value="தமிழ்நாடு">தமிழ்நாடு</option>
                    <option value="வணிகம்">வணிகம்</option>
                    <option value="ஆன்மிகம்">ஆன்மிகம்</option>
                    <option value="தொழில்நுட்பம்">தொழில்நுட்பம்</option>
                    <option value="விளையாட்டு">விளையாட்டு</option>
                    <option value="சினிமா">சினிமா</option>
                    <option value="தலையங்கம்">தலையங்கம்</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#050915] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="all">அனைத்து நிலைகள்</option>
                    <option value="published">Published</option>
                    <option value="pending">Pending Approval</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* RICH ALL NEWS TABLE */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-tamil">
                    மொத்த செய்திகள்: {getFilteredArticles().length} Items
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                    <thead className="bg-slate-900/90 text-amber-400 font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-800 font-tamil">
                      <tr>
                        <th className="p-4">படம்</th>
                        <th className="p-4">செய்தி தலைப்பு</th>
                        <th className="p-4">பிரிவு</th>
                        <th className="p-4">நிருபர்</th>
                        <th className="p-4">நிலை (Status)</th>
                        <th className="p-4">பார்வைகள்</th>
                        <th className="p-4 text-right">செயல்கள்</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-tamil">
                      {getFilteredArticles().length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-500 font-sans">
                            செய்திகள் எதுவும் காணப்படவில்லை.
                          </td>
                        </tr>
                      ) : (
                        getFilteredArticles().map((item) => (
                          <tr key={item._id || item.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-4">
                              <img
                                src={item.mainImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=200'}
                                alt="Thumbnail"
                                className="w-12 h-10 rounded-lg object-cover border border-slate-700 bg-slate-900"
                              />
                            </td>
                            <td className="p-4 font-bold text-white max-w-xs">
                              <div className="line-clamp-2">{item.title}</div>
                            </td>
                            <td className="p-4">
                              <span className="bg-slate-800 text-amber-400 px-2.5 py-1 rounded text-xs font-bold border border-slate-700">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400">{item.authorName || item.author?.name || 'ஆசிரியர்'}</td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                  item.status === 'published'
                                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
                                    : 'bg-amber-950/80 text-amber-300 border-amber-700'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-amber-400">{item.viewsCount || 0}</td>
                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleMakeFirst(item._id || item.id)}
                                title="முகப்புப் பக்கத்தில் #1 முதன்மை இடத்திற்கு மாற்று"
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs cursor-pointer transition shadow inline-flex items-center gap-1"
                              >
                                <Star className="w-3.5 h-3.5 fill-slate-950" />
                                <span>#1 முதன்மை</span>
                              </button>
                              {item.status !== 'published' && (
                                <button
                                  onClick={() => handlePublishStatus(item._id || item.id, 'published')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer transition"
                                >
                                  வெளியிடு
                                </button>
                              )}
                              {item.status !== 'rejected' && (
                                <button
                                  onClick={() => handlePublishStatus(item._id || item.id, 'rejected')}
                                  className="bg-slate-700 hover:bg-slate-600 text-rose-300 font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer transition"
                                >
                                  நிராகரி
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenNewsModal(item)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer transition"
                              >
                                திருத்து
                              </button>
                              <button
                                onClick={() => handleDeleteNews(item._id || item.id)}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer transition"
                              >
                                நீக்கு
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6 font-tamil">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  <Users className="w-7 h-7 text-amber-400" />
                  நிருபர்கள் &amp; வாசகர்கள் மேலாண்மை
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">Manage Reporters, Readers, and Admin Accounts for Amaze Times.</p>
              </div>

              {/* CREATE USER CARD FORM */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-amber-400 text-sm sm:text-base border-b border-slate-800 pb-3">
                  + புதிய பயனர் / நிருபர் கணக்கு உருவாக்கு
                </h3>

                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">பெயர் (Full Name)</label>
                    <input
                      type="text"
                      placeholder="எ.கா. கதிரவன்"
                      required
                      value={createUserForm.name}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                      className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">மின்னஞ்சல் (Email)</label>
                    <input
                      type="email"
                      placeholder="reporter@amazetimes.com"
                      required
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                      className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">கடவுச்சொல் (Password)</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      required
                      value={createUserForm.password}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                      className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">பதவி / பங்கு (System Role)</label>
                    <div className="flex gap-2">
                      <select
                        value={createUserForm.role}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                        className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                      >
                        <option value="reporter">நிருபர் (Reporter)</option>
                        <option value="editor">ஆசிரியர் (Editor)</option>
                        <option value="admin">நிர்வாகி (Admin)</option>
                        <option value="user">வாசகர் (Reader)</option>
                      </select>

                      <button
                        type="submit"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-red-600/30 whitespace-nowrap cursor-pointer transition"
                      >
                        உருவாக்கு
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* USERS TABLE */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/90 text-amber-400 font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">பயனர் பெயர்</th>
                      <th className="p-4">மின்னஞ்சல்</th>
                      <th className="p-4">பங்கு (ROLE)</th>
                      <th className="p-4">பதிவு முறை (PROVIDER)</th>
                      <th className="p-4">பதிவு செய்த தேதி</th>
                      <th className="p-4 text-right">செயல்கள்</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">
                          பயனர்கள் தரவு ஏற்றப்படுகிறது அல்லது காணப்படவில்லை...
                        </td>
                      </tr>
                    ) : (
                      usersList.map((usr) => {
                        const isReader = usr.role === 'reader' || usr.role === 'user';
                        const isReporter = usr.role === 'reporter';
                        const isAdmin = usr.role === 'admin';
                        const isEditor = usr.role === 'editor';
                        const displayName = usr.full_name || usr.name || usr.username || 'அநாமதேய வாசகர்';
                        const createdDate = usr.created_at ? new Date(usr.created_at).toLocaleDateString('ta-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

                        return (
                          <tr key={usr._id || usr.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-4 font-bold text-white text-sm flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-400 uppercase">
                                {displayName.charAt(0)}
                              </div>
                              <div>
                                <span className="block font-bold">{displayName}</span>
                                {usr.username && <span className="block text-[11px] text-slate-500 font-mono">@{usr.username}</span>}
                              </div>
                            </td>
                            <td className="p-4 text-slate-300 font-mono text-xs">{usr.email}</td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider border uppercase ${
                                  isAdmin
                                    ? 'bg-amber-950/60 text-amber-400 border-amber-500/50'
                                    : isReporter
                                    ? 'bg-blue-950/60 text-blue-300 border-blue-500/50'
                                    : isEditor
                                    ? 'bg-purple-950/60 text-purple-300 border-purple-500/50'
                                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50'
                                }`}
                              >
                                {isAdmin ? 'நிர்வாகி (Admin)' : isReporter ? 'நிருபர் (Reporter)' : isEditor ? 'ஆசிரியர் (Editor)' : 'வாசகர் (Reader)'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {usr.provider === 'google' ? 'Google கணக்கு' : 'வழக்கமான பதிவு'}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-400 font-mono">{createdDate}</td>
                            <td className="p-4 text-right space-x-3 font-bold text-xs">
                              <button onClick={() => handleDeleteUser(usr._id || usr.id)} className="text-red-500 hover:text-red-400 cursor-pointer">
                                நீக்கு
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 4: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 font-tamil">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  <UserIcon className="w-7 h-7 text-amber-400" />
                  எனது சுயவிவரம் (My Profile)
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">Manage personal profile details and security credentials.</p>
              </div>

              {/* AVATAR HERO FRAME */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center space-y-3 relative shadow-xl">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-1 shadow-xl overflow-hidden flex items-center justify-center bg-[#050915]">
                    {profileForm.avatar ? (
                      <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-3xl font-black text-amber-400 uppercase">{user?.name?.charAt(0) || 'A'}</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-full shadow-lg border-2 border-[#0f172a] cursor-pointer transition">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                  </label>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-4 py-1 rounded-full shadow">
                  {user?.designation || 'தலைமை நிர்வாகி (Chief Editor)'}
                </div>
              </div>

              {/* FORM GRID */}
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">தனிப்பட்ட தகவல்கள்</h3>

                  <div className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">முழு பெயர்</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white focus:outline-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1.5">மின்னஞ்சல் முகவரி</label>
                        <input
                          type="email"
                          disabled
                          value={profileForm.email}
                          className="w-full bg-[#050915]/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 font-medium cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1.5">தொலைபேசி எண்</label>
                        <input
                          type="text"
                          placeholder="+91 98765 43210"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">சுய அறிமுகம் (Bio)</label>
                      <textarea
                        rows="4"
                        placeholder="பத்திரிகையாளர் அனுபவங்களை உள்ளிடவும்..."
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white focus:outline-none font-medium"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-red-600/30 cursor-pointer transition"
                    >
                      விவரங்களை சேமி
                    </button>
                  </div>
                </div>

                <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 h-fit">
                  <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">பாதுகாப்பு & கடவுச்சொல்</h3>

                  <div className="space-y-4 text-xs sm:text-sm font-sans">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 font-tamil">தற்போதைய கடவுச்சொல்</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                        className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 font-tamil">புதிய கடவுச்சொல்</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 font-tamil">கடவுச்சொல்லை உறுதிசெய்</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white focus:outline-none font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-3 rounded-xl text-xs sm:text-sm border border-slate-700 shadow cursor-pointer transition font-tamil"
                    >
                      கடவுச்சொல் மாற்று
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* VIEW: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6 font-tamil max-w-6xl w-full">
              <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                    <FolderKanban className="w-7 h-7 text-amber-400" />
                    செய்தி பிரிவுகள் மேலாண்மை (Categories Manager)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 font-sans">
                    View total articles, active status, and manage main categories across the news portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenNewsModal()}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow cursor-pointer transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>புதிய செய்தி சேர்</span>
                </button>
              </div>

              {/* Categories Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'தமிழ்நாடு', key: 'தமிழ்நாடு', desc: 'தமிழகத்தின் முதன்மை செய்திகள், மாவட்ட செய்திகள் மற்றும் அரசியல் நிகழ்வுகள்.', icon: Globe, color: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30' },
                  { name: 'தேசியம் (இந்தியா)', key: 'தேசியம்', desc: 'இந்திய நாட்டின் முக்கிய தேசிய நிகழ்வுகள், மத்திய அரசு திட்டங்கள் & தலைநகர் செய்திகள்.', icon: Flag, color: 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/30' },
                  { name: 'உலகம் (சர்வதேசம்)', key: 'உலகம்', desc: 'உலகளாவிய அரசியல், சர்வதேச நிகழ்வுகள், விண்வெளி மற்றும் உலக வணிகம்.', icon: Globe, color: 'from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/30' },
                  { name: 'கல்வி & வேலைவாய்ப்பு', key: 'கல்வி', desc: 'TNPSC/UPSC தேர்வுகள், உயர்கல்வி வழிகாட்டுதல் & ஐடி/கார்ப்பரேட் வேலைவாய்ப்புகள்.', icon: GraduationCap, color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30' },
                  { name: 'வணிகம்', key: 'வணிகம்', desc: 'சென்னை தங்க விலை, பங்குச்சந்தை மற்றும் பொருளாதார சிறப்பு செய்திகள்.', icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30' },
                  { name: 'ஆன்மிகம்', key: 'ஆன்மிகம்', desc: '12 ராசி பலன்கள், தினசரி பஞ்சாங்கம், கோவில் திருவிழாக்கள் & ஆன்மீக செய்திகள்.', icon: Sparkles, color: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30' },
                  { name: 'தலையங்கம் & கதைகள்', key: 'தலையங்கம்', desc: 'தமிழ் இலக்கிய படைப்புகள், சிறுவர் கதைகள், இளைஞர் கட்டுரைகள் & தலையங்கம்.', icon: BookOpen, color: 'from-pink-500/20 to-pink-500/5 text-pink-400 border-pink-500/30' },
                  { name: 'சினிமா', key: 'சினிமா', desc: 'திரைப்பட விமர்சனங்கள், திரைத்துளி மற்றும் பிரபலங்களின் பேட்டிகள்.', icon: Flame, color: 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/30' },
                  { name: 'விளையாட்டு', key: 'விளையாட்டு', desc: 'கிரிக்கெட், டிஎன் பிஎல், சர்வதேச விளையாட்டு போட்டிகள் மற்றும் முடிவுகள்.', icon: TrendingUp, color: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30' },
                  { name: 'தொழில்நுட்பம்', key: 'தொழில்நுட்பம்', desc: 'புதிய மொபைல்கள், செயற்கை நுண்ணறிவு (AI) & தொழில்நுட்ப தகவல்கள்.', icon: Zap, color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30' }
                ].map((cat, idx) => {
                  const CatIcon = cat.icon;
                  const catCount = articles.filter(a => a.category === cat.key || (cat.key === 'தலையங்கம்' && (a.category === 'தலையங்கம்' || a.category === 'வலைப்பதிவு'))).length;

                  return (
                    <div
                      key={idx}
                      className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-slate-700 transition space-y-4 flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} border shadow-inner`}>
                            <CatIcon className="w-6 h-6" />
                          </div>
                          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase">
                            இயக்கத்தில் (Active)
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-lg text-white group-hover:text-amber-400 transition">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {cat.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold">
                          மொத்த செய்திகள்: <span className="text-amber-400 font-mono text-sm">{catCount}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat.key);
                            setActiveTab('all-news');
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>செய்திகளைப் பார் →</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 5: COMMODITIES & GOLD RATES MANAGER */}
          {activeTab === 'gold-rate' && (
            <div className="space-y-6 font-tamil max-w-5xl">
              {/* LIVE MARKET DASHBOARD WIDGET */}
              <GoldMarketDashboard isAdminView={true} />

              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                    <Coins className="w-6 h-6 text-amber-400" />
                    தங்கம் & பொருட்கள் நேரலை விலை மேலாளர்
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-sans">Update daily Chennai market prices automatically or manually for main news ticker.</p>
                </div>

                {/* AUTO-SYNC CHENNAI MARKET PRICE BANNER */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-300 text-sm">சென்னை சந்தை நேரலை புதுப்பிப்பு (Auto Chennai Market Sync)</h3>
                      <p className="text-xs text-slate-400">இன்றைய சென்னை தங்க, வெள்ளி & பெட்ரோல் நிலவரத்தை தானாக பெறுங்கள்.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncChennaiRates}
                    disabled={isSyncingGold}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-md shadow-red-600/30"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingGold ? 'animate-spin' : ''}`} />
                    <span>{isSyncingGold ? 'பெறப்படுகிறது...' : 'நேரலை விலை பெறு (Fetch Live)'}</span>
                  </button>
                </div>

                <form onSubmit={handleSaveGoldRate} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">22K தங்கம் (1 கிராமிற்கு ₹):</label>
                      <input
                        type="number"
                        value={goldForm.gold22k}
                        onChange={(e) => setGoldForm({ ...goldForm, gold22k: Number(e.target.value) })}
                        className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">24K தங்கம் (1 கிராமிற்கு ₹):</label>
                      <input
                        type="number"
                        value={goldForm.gold24k}
                        onChange={(e) => setGoldForm({ ...goldForm, gold24k: Number(e.target.value) })}
                        className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">வெள்ளி (1 கிராமிற்கு ₹):</label>
                      <input
                        type="number"
                        value={goldForm.silver}
                        onChange={(e) => setGoldForm({ ...goldForm, silver: Number(e.target.value) })}
                        className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">பெட்ரோல் (சென்னை லிட்டருக்கு ₹):</label>
                      <input
                        type="number"
                        value={goldForm.petrol}
                        onChange={(e) => setGoldForm({ ...goldForm, petrol: Number(e.target.value) })}
                        className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-lg shadow-red-600/30 cursor-pointer transition"
                  >
                    நேரலை விலைகளை சேமி (Save Live Rates)
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VIEW 6: AANMEEGAM & HOROSCOPE MANAGER */}
          {activeTab === 'aanmeegam-rasi' && (
            <div className="max-w-6xl w-full">
              <AdminAanmeegamManager initialSubTab={aanmeegamSubTab} />
            </div>
          )}

          {/* VIEW 7: GOVT OFFICIALS BIRTHDAY MANAGER */}
          {activeTab === 'gov-birthdays' && (
            <div className="max-w-6xl w-full">
              <AdminBirthdayManager />
            </div>
          )}

          {/* VIEW 8: BLOGS & LITERARY COMPOSITIONS MANAGER */}
          {activeTab === 'blogs-manager' && (
            <div className="max-w-6xl w-full">
              <AdminBlogManager />
            </div>
          )}

          {/* VIEW 9: FAMOUS PERSONS QUOTES MANAGER */}
          {activeTab === 'quotes-manager' && (
            <div className="max-w-6xl w-full">
              <AdminQuotesManager />
            </div>
          )}

          {/* VIEW 10: COMPETITIONS MANAGER */}
          {activeTab === 'competitions-manager' && (
            <div className="max-w-6xl w-full">
              <AdminCompetitionsManager />
            </div>
          )}

          {/* VIEW 11: GOVT EXAMS & TNPSC MANAGER */}
          {activeTab === 'exams-manager' && (
            <div className="max-w-6xl w-full">
              <AdminExamsManager />
            </div>
          )}

          {/* VIEW 12: MONTH-WISE E-PAPER MANAGER */}
          {activeTab === 'epaper-manager' && (
            <div className="max-w-6xl w-full">
              <AdminEpaperManager />
            </div>
          )}

          {/* VIEW 13: DIGITAL MAGAZINE MANAGER */}
          {activeTab === 'magazine-manager' && (
            <div className="max-w-6xl w-full">
              <AdminMagazineManager />
            </div>
          )}

          {/* VIEW 14: VIDEO GALLERY MANAGER */}
          {activeTab === 'video-manager' && (
            <div className="max-w-6xl w-full">
              <AdminVideoManager />
            </div>
          )}

          {/* VIEW: HOME PAGE BUILDER */}
          {activeTab === 'home-builder' && (
            <div className="max-w-6xl w-full">
              <AdminHomePageBuilder showToast={showToast} />
            </div>
          )}

          {/* VIEW: CINEMA MANAGER */}
          {activeTab === 'cinema-manager' && (
            <div className="max-w-6xl w-full">
              <AdminCinemaSportsManager showToast={showToast} defaultTab="cinema" />
            </div>
          )}

          {/* VIEW: SPORTS MANAGER */}
          {activeTab === 'sports-manager' && (
            <div className="max-w-6xl w-full">
              <AdminCinemaSportsManager showToast={showToast} defaultTab="sports" />
            </div>
          )}

          {/* VIEW: SPECIAL DAYS & FESTIVAL WISHES */}
          {activeTab === 'special-days' && (
            <div className="max-w-6xl w-full">
              <AdminSpecialDaysManager showToast={showToast} />
            </div>
          )}

          {/* VIEW: SOCIAL MEDIA SETTINGS */}
          {activeTab === 'social-media' && (
            <div className="max-w-6xl w-full">
              <AdminSocialMediaManager showToast={showToast} />
            </div>
          )}

          {/* VIEW 15: USERS & REPORTERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6 font-tamil max-w-6xl w-full">
              {/* Header Banner */}
              <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-white">
                        நிருபர்கள் & வாசகர்கள் மேலாண்மை
                      </h1>
                      <p className="text-xs text-slate-400 font-sans">
                        Users, Reporters & Admins Management (Neon PostgreSQL Live Database)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUserModal(true)}
                  className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-amber-300 border border-amber-400/40 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg cursor-pointer transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>புதிய நிருபர் / வாசகர் சேர்</span>
                </button>
              </div>

              {/* 4 Stat Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-lg hover:border-blue-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">மொத்தப் பயனர்கள்</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-2">
                    {usersList.length}
                  </div>
                  <span className="text-[10px] text-blue-400 font-bold mt-1 block">அனைத்து கணக்குகள்</span>
                </div>

                <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-lg hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">வாசகர்கள்</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-2">
                    {totalReadersCount}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold mt-1 block">பதிவு செய்த வாசகர்கள்</span>
                </div>

                <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-lg hover:border-purple-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">நிருபர்கள்</span>
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                      <Edit3 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-2">
                    {totalReportersCount}
                  </div>
                  <span className="text-[10px] text-purple-400 font-bold mt-1 block">செய்தி நிருபர்கள்</span>
                </div>

                <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-lg hover:border-amber-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">நிர்வாகிகள்</span>
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-2">
                    {totalAdminsCount}
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold mt-1 block">தள நிர்வாகிகள்</span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="பெயர், மின்னஞ்சல், பயனர் பெயர் அல்லது எண் தேடுங்கள்..."
                    className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
                  />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Role Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      userRoleFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    அனைத்தும் ({usersList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('reader')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      userRoleFilter === 'reader'
                        ? 'bg-emerald-600 text-white font-black shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    வாசகர்கள் ({totalReadersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('reporter')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      userRoleFilter === 'reporter'
                        ? 'bg-purple-600 text-white font-black shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    நிருபர்கள் ({totalReportersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      userRoleFilter === 'admin'
                        ? 'bg-red-600 text-white font-black shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    நிர்வாகிகள் ({totalAdminsCount})
                  </button>
                </div>
              </div>

              {/* Users Data Table */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#050915] text-slate-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">பயனர் பெயர் & விவரம்</th>
                        <th className="py-3 px-4">தொடர்பு தகவல்</th>
                        <th className="py-3 px-4">பங்கு (Role)</th>
                        <th className="py-3 px-4">இணைப்பு முறை</th>
                        <th className="py-3 px-4">பதிவு தேதி</th>
                        <th className="py-3 px-4">நிலை (Status)</th>
                        <th className="py-3 px-4 text-right">நடவடிக்கைகள்</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {getFilteredUsers().length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 font-tamil">
                            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                            <p className="text-base font-bold text-slate-300">பயனர்கள் எவரும் காணப்படவில்லை</p>
                            <p className="text-xs text-slate-500 mt-1">தேடல் அல்லது வடிகட்டியை மாற்றவும்</p>
                          </td>
                        </tr>
                      ) : (
                        getFilteredUsers().map((u) => {
                          const isCurrentUser = user && (String(user.id) === String(u.id) || user.email === u.email);
                          const roleName = u.role === 'admin' ? 'நிர்வாகி' : u.role === 'reporter' ? 'செய்தியாளர்' : 'வாசகர்';
                          const roleColor = u.role === 'admin'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : u.role === 'reporter'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40';

                          return (
                            <tr key={u.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {u.avatar_url ? (
                                    <img
                                      src={u.avatar_url}
                                      alt={u.full_name || u.username}
                                      className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-900 border border-blue-500/50 text-white font-bold flex items-center justify-center text-sm shadow">
                                      {(u.full_name || u.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="leading-tight">
                                    <span className="font-bold text-white block text-sm font-tamil">
                                      {u.full_name || u.username}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      @{u.username || 'user'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-0.5 text-xs text-slate-300">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[180px]">{u.email || '-'}</span>
                                  </div>
                                  {u.phone && (
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span className="font-mono">{u.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border font-tamil ${roleColor}`}>
                                  {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : u.role === 'reporter' ? <Edit3 className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                                  <span>{roleName}</span>
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                {u.provider === 'google' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-md">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    Google
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md font-tamil">
                                    மின்னஞ்சல்
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString('ta-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                              </td>

                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(u)}
                                  disabled={isCurrentUser}
                                  title={isCurrentUser ? 'உங்கள் சொந்த கணக்கை முடக்க முடியாது' : 'நிலையை மாற்ற கிளிக் செய்யவும்'}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer font-tamil ${
                                    isCurrentUser ? 'opacity-60 cursor-not-allowed' : ''
                                  } ${
                                    u.is_active !== false
                                      ? 'bg-emerald-950/70 text-emerald-400 border-emerald-600/60 hover:bg-emerald-900/60'
                                      : 'bg-red-950/70 text-red-400 border-red-600/60 hover:bg-red-900/60'
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${u.is_active !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                                  <span>{u.is_active !== false ? 'செயலில் (Active)' : 'முடக்கப்பட்டது'}</span>
                                </button>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={isCurrentUser}
                                  title={isCurrentUser ? 'உங்கள் சொந்த கணக்கை நீக்க முடியாது' : 'கணக்கை நீக்கு'}
                                  className={`p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition cursor-pointer ${
                                    isCurrentUser ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT NEWS MODAL (WITH FILE UPLOAD INPUT) */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-3xl max-w-2xl w-full p-6 border border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl font-tamil">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-amber-400 text-lg flex items-center gap-2">
                {editingArticle ? 'செய்தி திருத்துதல்' : 'புதிய செய்தி உருவாக்குதல்'}
              </h3>
              <button onClick={() => setShowNewsModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-300 block mb-1">1. செய்தி தலைப்பு (Title / Headline):</label>
                <input
                  type="text"
                  required
                  placeholder="செய்தி தலைப்பை உள்ளிடவும் (Title)..."
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">2. செய்தி துணைத் தலைப்பு (Subtitle):</label>
                <input
                  type="text"
                  placeholder="துணைத் தலைப்பை உள்ளிடவும் (Subtitle)..."
                  value={newsForm.subtitle || ''}
                  onChange={(e) => setNewsForm({ ...newsForm, subtitle: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">3. செய்தி குறுஞ்செய்தி / சுருக்கம் (Short Description):</label>
                <textarea
                  rows="2"
                  required
                  placeholder="செய்தியின் முக்கிய குறுஞ்செய்தி / சுருக்கத்தை உள்ளிடவும் (Short Description)..."
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">4. செய்தி முழு விவரம் (Detailed Description):</label>
                <textarea
                  rows="5"
                  required
                  placeholder="செய்தியின் முழுமையான விவரங்களை உள்ளிடவும் (Detailed Description)..."
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">5. SEO குறிச்சொற்கள் (SEO Keywords):</label>
                  <input
                    type="text"
                    placeholder="உதாரணம்: தமிழ்நாடு, அரசியல், சென்னை..."
                    value={newsForm.seoKeywords || ''}
                    onChange={(e) => setNewsForm({ ...newsForm, seoKeywords: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">6. குறிச்சொற்கள் & ஹேஷ்டேக்குகள் (Tags):</label>
                  <input
                    type="text"
                    placeholder="உதாரணம்: #TNNews, #Breaking, #Politics..."
                    value={newsForm.tags || ''}
                    onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">எழுத்தாளர் / ஆசிரியர் பெயர் (Writer / Author Name):</label>
                <input
                  type="text"
                  placeholder="எழுத்தாளர் பெயர் உள்ளிடவும் (இயல்புநிலை: ஆசிரியர்)..."
                  value={newsForm.authorName}
                  onChange={(e) => setNewsForm({ ...newsForm, authorName: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">பிரிவு (Category):</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-tamil"
                  >
                    <option value="தமிழ்நாடு">தமிழ்நாடு</option>
                    <option value="தேசியம்">தேசியம் (இந்தியா)</option>
                    <option value="உலகம்">உலகம் (சர்வதேசம்)</option>
                    <option value="கல்வி">கல்வி & வேலைவாய்ப்பு</option>
                    <option value="வணிகம்">வணிகம்</option>
                    <option value="ஆன்மிகம்">ஆன்மிகம்</option>
                    <option value="தொழில்நுட்பம்">தொழில்நுட்பம்</option>
                    <option value="விளையாட்டு">விளையாட்டு</option>
                    <option value="சினிமா">சினிமா</option>
                    <option value="தலையங்கம்">தலையங்கம்</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">மாவட்டம் (District):</label>
                  <select
                    value={newsForm.district}
                    onChange={(e) => setNewsForm({ ...newsForm, district: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-tamil"
                  >
                    <option value="all">அனைத்து மாவட்டங்கள்</option>
                    <option value="chennai">சென்னை</option>
                    <option value="madurai">மதுரை</option>
                    <option value="kovai">கோயம்புத்தூர்</option>
                    <option value="trichy">திருச்சி</option>
                    <option value="salem">சேலம்</option>
                    <option value="nellai">திருநெல்வேலி</option>
                  </select>
                </div>
              </div>

              {newsForm.category === 'ஆன்மிகம்' && (
                <div>
                  <label className="font-bold text-amber-400 block mb-1">ஆன்மீக உட்பிரிவு (Aanmeegam Sub-Category):</label>
                  <select
                    value={newsForm.subCategory || 'news'}
                    onChange={(e) => setNewsForm({ ...newsForm, subCategory: e.target.value })}
                    className="w-full bg-[#050915] border border-amber-500/50 rounded-xl p-3 text-amber-300 font-bold font-tamil"
                  >
                    <option value="news">ஆன்மீக செய்திகள் (Spiritual News)</option>
                    <option value="temple">கோவில் விழாக்கள் (Temple Festivals)</option>
                    <option value="astrology">ராசி பலன் & ஜோதிடம் (Horoscope & Astrology)</option>
                    <option value="remedies">பரிகாரங்கள் & யோகம் (Remedies & Yogas)</option>
                    <option value="panchangam">பஞ்சாங்கம் (Panchangam / Calendar)</option>
                  </select>
                </div>
              )}

              {/* IMAGE FILE UPLOAD INPUT (REQUIREMENT 2) */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">செய்தி படம் பதிவேற்றம் (Image File Upload):</label>
                
                {newsForm.mainImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-video max-h-48 bg-slate-900 group">
                    <img src={newsForm.mainImage} alt="Uploaded Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <label className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer flex items-center gap-1">
                        <Upload className="w-4 h-4" />
                        <span>மாற்று</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewsForm({ ...newsForm, mainImage: '' })}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        நீக்கு
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-amber-500 bg-[#050915] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center space-y-2">
                    <Upload className="w-8 h-8 text-amber-400 animate-bounce" />
                    <span className="font-bold text-slate-200 text-xs sm:text-sm">படக் கோப்பைத் தேர்ந்தெடுக்கவும் (Browse Image File)</span>
                    <span className="text-[10px] text-slate-500">JPG, PNG, WEBP (Maximum 10MB)</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                  </label>
                )}
                {uploadingImage && <span className="text-xs font-bold text-amber-400 mt-1 block">படம் பதிவேற்றப்படுகிறது...</span>}
              </div>

              <div className="flex flex-wrap gap-4 pt-2 font-bold text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsForm.isBreaking}
                    onChange={(e) => setNewsForm({ ...newsForm, isBreaking: e.target.checked })}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span>பிரேக்கிங் செய்தி (Breaking)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsForm.isLeadHero}
                    onChange={(e) => setNewsForm({ ...newsForm, isLeadHero: e.target.checked })}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span>முகப்பு தலைமைச் செய்தி (Lead Hero)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsForm.isTopStory}
                    onChange={(e) => setNewsForm({ ...newsForm, isTopStory: e.target.checked })}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span>முக்கியச் செய்தி (Top Story)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-red-600/30 cursor-pointer transition"
              >
                சேமி / வெளியிடு (Publish Article)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW USER / REPORTER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-3xl max-w-lg w-full p-6 border border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl font-tamil">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-amber-400 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>புதிய நிருபர் / வாசகர் கணக்கு உருவாக்குதல்</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-300 block mb-1">முழுப் பெயர் (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: சுந்தர் குமார்"
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">மின்னஞ்சல் முகவரி (Email) *</label>
                <input
                  type="email"
                  required
                  placeholder="user@amazetimes.com"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-sans font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">கடவுச்சொல் (Password) *</label>
                  <input
                    type="password"
                    required
                    placeholder="குறைந்தது 6 எழுத்துகள்"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-sans font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">தொலைபேசி எண் (Phone)</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-sans font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">பங்கு (Role) *</label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="reader">வாசகர் (Reader / Standard User)</option>
                    <option value="reporter">செய்தியாளர் (News Reporter)</option>
                    <option value="admin">நிர்வாகி (Portal Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">பதவி / பதவிப் பெயர் (Designation)</label>
                  <input
                    type="text"
                    placeholder="எ.கா: சிறப்பு நிருபர் / வாசகர்"
                    value={createUserForm.designation}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, designation: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  ரத்து செய் (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 rounded-xl shadow-lg cursor-pointer transition"
                >
                  கணக்கை உருவாக்கு
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};