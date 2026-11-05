import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Bookmark,
  Heart,
  Clock,
  Sliders,
  LogOut,
  Save,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Moon,
  Sun,
  BookOpen,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Trophy,
  Award,
  PenTool,
  MapPin,
  Bell,
  Download,
  Share2,
  ChevronRight,
  Send
} from 'lucide-react';
import { api, setToken, setReaderUser } from '../../services/api';

const TN_DISTRICTS = [
  'அனைத்து மாவட்டங்கள்', 'சென்னை', 'கோயம்புத்தூர்', 'மதுரை', 'திருச்சிராப்பள்ளி',
  'சேலம்', 'திருநெல்வேலி', 'திருப்பூர்', 'ஈரோடு', 'வேலூர்', 'தஞ்சாவூர்',
  'திண்டுக்கல்', 'கன்னியாகுமரி', 'தூத்துக்குடி', 'நாமக்கல்', 'கரூர்',
  'விருதுநகர்', 'சிவகங்கை', 'ராமநாதபுரம்', 'தேனி', 'கிருஷ்ணகிரி',
  'தருமபுரி', 'விழுப்புரம்', 'கடலூர்', 'நாகப்பட்டினம்', 'திருவாரூர்',
  'மயிலாடுதுறை', 'புதுக்கோட்டை', 'அரியலூர்', 'பெரம்பலூர்', 'திருப்பத்தூர்',
  'ராணிப்பேட்டை', 'கள்ளக்குறிச்சி', 'செங்கல்பட்டு', 'காஞ்சிபுரம்', 'திருவள்ளூர்',
  'திருவண்ணாமலை', 'நீலகிரி'
];

const PREFERRED_CATEGORIES = [
  { id: 'tamilnadu', label: 'தமிழ்நாடு' },
  { id: 'politics', label: 'அரசியல்' },
  { id: 'cinema', label: 'சினிமா' },
  { id: 'sports', label: 'விளையாட்டு' },
  { id: 'business', label: 'வணிகம்' },
  { id: 'aanmeegam', label: 'ஆன்மிகம்' },
  { id: 'education', label: 'கல்வி & வேலைவாய்ப்பு' },
  { id: 'tech', label: 'தொழில்நுட்பம்' }
];

export default function UserProfileModal({
  isOpen,
  onClose,
  readerUser,
  onUpdateUser,
  onLogout,
  savedBookmarks = [],
  onRemoveBookmark,
  onClearAllBookmarks,
  likedArticles = [],
  onRemoveLikedArticle,
  onClearAllLiked,
  readingHistory = [],
  onClearReadingHistory,
  onOpenArticle,
  isDark,
  onToggleDarkMode,
  fontSizeClass,
  onChangeFontSize,
  onToast,
  initialTab = 'profile'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'competitions' | 'submissions' | 'saved' | 'liked' | 'history' | 'settings'
  
  const [profileData, setProfileData] = useState({
    name: readerUser?.full_name || readerUser?.name || '',
    email: readerUser?.email || '',
    phone: readerUser?.phone || '',
    bio: readerUser?.bio || '',
    preferredDistrict: readerUser?.preferred_district || 'சென்னை',
    preferredCategories: Array.isArray(readerUser?.preferred_categories) ? readerUser.preferred_categories : ['tamilnadu', 'politics']
  });

  const [savingProfile, setSavingProfile] = useState(false);
  
  // User Competitions Applications state
  const [userApplications, setUserApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Sync state if readerUser changes
  useEffect(() => {
    if (readerUser) {
      setProfileData({
        name: readerUser.full_name || readerUser.name || '',
        email: readerUser.email || '',
        phone: readerUser.phone || '',
        bio: readerUser.bio || '',
        preferredDistrict: readerUser.preferred_district || 'சென்னை',
        preferredCategories: Array.isArray(readerUser.preferred_categories) ? readerUser.preferred_categories : ['tamilnadu', 'politics']
      });
    }
  }, [readerUser]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load user's live competition submissions
  useEffect(() => {
    if (isOpen && (activeTab === 'competitions' || activeTab === 'profile')) {
      fetchUserCompetitions();
    }
  }, [isOpen, activeTab, readerUser]);

  const fetchUserCompetitions = async () => {
    if (!readerUser) return;
    setLoadingApps(true);
    try {
      const res = await api.getCompetitionApplications();
      if (res && res.success && Array.isArray(res.applications)) {
        // Filter by user's email or phone or name
        const userEmail = (readerUser.email || '').toLowerCase().trim();
        const userPhone = (readerUser.phone || '').replace(/\D/g, '');
        const userName = (readerUser.full_name || readerUser.name || '').toLowerCase().trim();

        const filtered = res.applications.filter(app => {
          const appEmail = (app.email || '').toLowerCase().trim();
          const appPhone = (app.phone || '').replace(/\D/g, '');
          const appName = (app.applicant_name || '').toLowerCase().trim();
          return (userEmail && appEmail === userEmail) || 
                 (userPhone && appPhone && userPhone === appPhone) || 
                 (userName && appName === userName);
        });

        setUserApplications(filtered);
      }
    } catch (e) {
      console.warn('Failed to load user applications:', e);
    } finally {
      setLoadingApps(false);
    }
  };

  // Reader Club Tier & Engagement Engine
  const readerPoints = 50 + (savedBookmarks.length * 10) + (likedArticles.length * 10) + (readingHistory.length * 5) + (userApplications.length * 50);
  const getReaderTier = (pts) => {
    if (pts >= 300) return { name: 'முதன்மை வாசகர் (Champion)', badge: '🥇', level: 'VIP Tier 4', color: 'text-amber-400 bg-amber-500/20 border-amber-400/40' };
    if (pts >= 150) return { name: 'செயல்மிகு வாசகர் (Gold)', badge: '🥈', level: 'Tier 3', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-400/40' };
    if (pts >= 80) return { name: 'தொடர் வாசகர் (Active)', badge: '🥉', level: 'Tier 2', color: 'text-blue-400 bg-blue-500/20 border-blue-400/40' };
    return { name: 'புதிய வாசகர் (Member)', badge: '🌟', level: 'Tier 1', color: 'text-indigo-400 bg-indigo-500/20 border-indigo-400/40' };
  };
  const tier = getReaderTier(readerPoints);

  // Reader Submissions State (Citizen Journalist)
  const [submissions, setSubmissions] = useState(() => {
    try {
      const saved = localStorage.getItem(`user_submissions_${readerUser?.id || readerUser?.email}`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'sub-1',
        title: 'நமது ஊர் ஏரிகளை காப்போம் - விழிப்புணர்வு பார்வை',
        category: 'தலையங்கம் பார்வை',
        status: 'under_review',
        date: 'நேற்று',
        content: 'கிராமப்புற நீர்நிலைகள் பாதுகாப்பு குறித்து வாசகர் பார்வை.'
      }
    ];
  });
  const [subForm, setSubForm] = useState({ title: '', category: 'சிறுகதை', content: '' });
  const [submittingArticle, setSubmittingArticle] = useState(false);

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    if (!subForm.title.trim() || !subForm.content.trim()) return;
    setSubmittingArticle(true);
    try {
      const newSub = {
        id: `sub-${Date.now()}`,
        title: subForm.title.trim(),
        category: subForm.category,
        content: subForm.content.trim(),
        author: readerUser.full_name || readerUser.name,
        email: readerUser.email,
        date: 'இன்று',
        status: 'under_review'
      };
      const updated = [newSub, ...submissions];
      setSubmissions(updated);
      try {
        localStorage.setItem(`user_submissions_${readerUser?.id || readerUser?.email}`, JSON.stringify(updated));
      } catch (_) {}
      setSubForm({ title: '', category: 'சிறுகதை', content: '' });
      if (onToast) onToast('உங்கள் படைப்பு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! ஆசிரியர் குழு பரிசீலித்து வெளியிடும்.', 'success');
    } catch (_) {}
    finally {
      setSubmittingArticle(false);
    }
  };

  if (!isOpen || !readerUser) return null;

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updatedUser = {
        ...readerUser,
        name: profileData.name.trim(),
        full_name: profileData.name.trim(),
        phone: profileData.phone.trim(),
        bio: profileData.bio.trim(),
        preferred_district: profileData.preferredDistrict,
        preferred_categories: profileData.preferredCategories
      };

      try {
        await api.updateProfile({
          name: updatedUser.name,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
          preferred_district: updatedUser.preferred_district,
          preferred_categories: updatedUser.preferred_categories
        });
      } catch (_) {}

      setReaderUser(updatedUser);
      if (onUpdateUser) onUpdateUser(updatedUser);
      if (onToast) onToast('உங்கள் சுயவிவரம் மற்றும் தேர்வுகள் சேமிக்கப்பட்டன!', 'success');
    } catch (err) {
      if (onToast) onToast('சேமிப்பதில் பிழை ஏற்பட்டது.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleCategoryPreference = (catId) => {
    setProfileData(prev => {
      const exists = prev.preferredCategories.includes(catId);
      const updated = exists 
        ? prev.preferredCategories.filter(c => c !== catId)
        : [...prev.preferredCategories, catId];
      return { ...prev, preferredCategories: updated };
    });
  };

  const userInitial = (readerUser.full_name || readerUser.name || 'U').charAt(0).toUpperCase();

  const getCompStatusBadge = (status) => {
    switch (status) {
      case 'awarded':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Award className="w-3 h-3" /> விருது & சான்றிதழ் வழங்கப்பட்டது 🏆</span>;
      case 'shortlisted':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Trophy className="w-3 h-3" /> தேர்வு செய்யப்பட்டது</span>;
      case 'under_review':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> பரிசீலனையில்</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> பெறப்பட்டது (நிலுவை)</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto font-tamil">
      <div className="bg-gradient-to-b from-[#0c1633] via-[#091228] to-[#060a17] rounded-3xl max-w-3xl w-full p-4 sm:p-7 shadow-2xl border-2 border-blue-500/30 text-white relative overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Top Trim Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-indigo-600"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-slate-700/60 shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Profile Summary */}
        <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-slate-800/80 shrink-0 pr-8">
          {readerUser.avatar_url || readerUser.avatar ? (
            <img
              src={readerUser.avatar_url || readerUser.avatar}
              alt={readerUser.full_name || readerUser.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-amber-400 shadow-lg shrink-0 bg-slate-800"
              onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#0e2a7a] to-blue-600 text-amber-300 ring-2 ring-amber-400 text-xl font-black flex items-center justify-center shadow-lg shrink-0 font-sans">
              {userInitial}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-white truncate">
                {readerUser.full_name || readerUser.name}
              </h2>
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-600/60 text-[10px] font-bold px-2 py-0.2 rounded-full shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>செயலில் (Active)</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-sans truncate">{readerUser.email}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="inline-block bg-[#0e2a7a]/80 text-amber-300 text-[10px] font-bold px-2 py-0.2 rounded border border-amber-400/30">
                {readerUser.role === 'admin' ? 'முதன்மை நிர்வாகி' : readerUser.role === 'reporter' ? 'செய்தியாளர்' : 'பதிவு செய்த வாசகர்'}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.2 rounded-full border flex items-center gap-1 ${tier.color}`}>
                <span>{tier.badge}</span>
                <span>{tier.name}</span>
                <span className="font-mono">({readerPoints} pts)</span>
              </span>
              {profileData.preferredDistrict && (
                <span className="text-[10px] text-slate-300 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span>{profileData.preferredDistrict}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar (Horizontal Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 py-2.5 border-b border-slate-800/80 overflow-x-auto scrollbar-none shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>சுயவிவரம் & தேர்வுகள்</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('competitions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'competitions'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>என் போட்டிகள் & சான்றிதழ்கள்</span>
            {userApplications.length > 0 && (
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {userApplications.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            <span>சேமித்தவை</span>
            <span className="bg-blue-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {savedBookmarks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'liked'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>விருப்பங்கள் ({likedArticles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>வரலாறு ({readingHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>என் படைப்புகள் ({submissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>செயலி அமைப்புகள்</span>
          </button>
        </div>

        {/* Tab Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs sm:text-sm">
          
          {/* ============================================================== */}
          {/* TAB 1: PROFILE & PERSONALIZATION PREFERENCES                  */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">முழுப் பெயர்</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full bg-slate-900 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">மின்னஞ்சல் முகவரி</label>
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full bg-slate-950 text-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">தொலைபேசி எண் (WhatsApp)</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="98765 43210"
                      className="w-full bg-slate-900 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">விருப்பமான மாவட்டம் (Home District)</label>
                    <select
                      value={profileData.preferredDistrict}
                      onChange={(e) => setProfileData({ ...profileData, preferredDistrict: e.target.value })}
                      className="w-full bg-slate-900 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {TN_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* News Preferences Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    செய்தி விருப்பத் தேர்வுகள் (Personalized Categories):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREFERRED_CATEGORIES.map(cat => {
                      const isSelected = profileData.preferredCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategoryPreference(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <span>{cat.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingProfile ? 'சேமிக்கப்படுகிறது...' : 'மாற்றங்களைச் சேமி'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MY COMPETITIONS & CERTIFICATES                          */}
          {/* ============================================================== */}
          {activeTab === 'competitions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>என் போட்டி விண்ணப்பங்கள் & விருதுகள்</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    நீங்கள் விண்ணப்பித்த போட்டிகளின் நேரலை ஆய்வு நிலை & தகுதிச் சான்றிதழ்கள்
                  </p>
                </div>
                <button
                  onClick={fetchUserCompetitions}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  புதுப்பி
                </button>
              </div>

              {loadingApps ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 font-bold">விண்ணப்பங்கள் சரிபார்க்கப்படுகின்றன...</p>
                </div>
              ) : userApplications.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">போட்டி விண்ணப்பங்கள் எதுவும் இல்லை</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    நீங்கள் இன்னும் எந்த மாநிலப் போட்டியிலும் விண்ணப்பிக்கவில்லை. இப்போதே கவிதை, சிறுகதை, வினாடி வினா போட்டிகளில் பங்கேற்று மாநில விருதுகளை வெல்லுங்கள்!
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/competitions';
                    }}
                    className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold px-5 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow"
                  >
                    <span>போட்டிகள் அரங்கம் செல்க</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-400">{app.competition_title}</span>
                        {getCompStatusBadge(app.status)}
                      </div>

                      <h4 className="text-sm font-black text-white">{app.entry_title}</h4>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span>விண்ணப்பித்த நாள்: {new Date(app.created_at).toLocaleDateString('ta-IN')}</span>
                        {app.status === 'awarded' && (
                          <span className="text-emerald-400 font-black flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            <span>மின்-சான்றிதழ் தகுதி பெற்றது!</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: SAVED BOOKMARKS                                         */}
          {/* ============================================================== */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">
                  மொத்தம் {savedBookmarks.length} சேமித்த செய்திகள்
                </span>
                {savedBookmarks.length > 0 && (
                  <button
                    onClick={onClearAllBookmarks}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>அனைத்தையும் நீக்குக</span>
                  </button>
                )}
              </div>

              {savedBookmarks.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">சேமித்த செய்திகள் எதுவும் இல்லை.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {savedBookmarks.map((art) => (
                    <div
                      key={art.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-amber-400/50 transition"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          if (onOpenArticle) onOpenArticle(art);
                        }}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <h4 className="text-xs font-bold text-white hover:text-amber-400 line-clamp-1">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">{art.category || 'செய்தி'}</span>
                      </div>
                      <button
                        onClick={() => onRemoveBookmark && onRemoveBookmark(art.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                        title="நீக்கு"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: LIKED ARTICLES                                          */}
          {/* ============================================================== */}
          {activeTab === 'liked' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">
                  விருப்பம் தெரிவித்தவை ({likedArticles.length})
                </span>
                {likedArticles.length > 0 && (
                  <button
                    onClick={onClearAllLiked}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>அனைத்தையும் நீக்குக</span>
                  </button>
                )}
              </div>

              {likedArticles.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Heart className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">விருப்பமான செய்திகள் எதுவும் இல்லை.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {likedArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-rose-400/50 transition"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          if (onOpenArticle) onOpenArticle(art);
                        }}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <h4 className="text-xs font-bold text-white hover:text-rose-400 line-clamp-1">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">{art.category || 'செய்தி'}</span>
                      </div>
                      <button
                        onClick={() => onRemoveLikedArticle && onRemoveLikedArticle(art.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                        title="நீக்கு"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: READING HISTORY                                         */}
          {/* ============================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">
                  சமீபத்தில் படித்த செய்திகள் ({readingHistory.length})
                </span>
                {readingHistory.length > 0 && (
                  <button
                    onClick={onClearReadingHistory}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>வரலாற்றை அழிக்க</span>
                  </button>
                )}
              </div>

              {readingHistory.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Clock className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">வாசிப்பு வரலாறு எதுவும் இல்லை.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {readingHistory.map((art, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onClose();
                        if (onOpenArticle) onOpenArticle(art);
                      }}
                      className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 hover:bg-slate-800 cursor-pointer transition flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-200 hover:text-amber-400 line-clamp-1">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">{art.category || 'செய்தி'}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: CITIZEN WRITER & MY SUBMISSIONS                           */}
          {/* ============================================================== */}
          {activeTab === 'submissions' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Writer Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border border-amber-400/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                    <PenTool className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      அமேஸ் டைம்ஸ் வாசகர் எழுத்து மேடை (Citizen Journalism)
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      உங்கள் சிறுகதைகள், கவிதைகள், தலையங்கப் பார்வைகளை நேரடியாக ஆசிரியருக்கு அனுப்புங்கள்.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shrink-0">
                  +50 புள்ளிகள்
                </span>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleArticleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>புதிய படைப்பைச் சமர்ப்பிக்க:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">படைப்பின் தலைப்பு *</label>
                    <input
                      type="text"
                      required
                      value={subForm.title}
                      onChange={(e) => setSubForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="எ.கா: ஊருக்குள் ஒரு புதிய வெளிச்சம்"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">பிரிவு *</label>
                    <select
                      value={subForm.category}
                      onChange={(e) => setSubForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="சிறுகதை">சிறுகதை (Short Story)</option>
                      <option value="கவிதை">கவிதை (Poem)</option>
                      <option value="தலையங்கம் பார்வை">தலையங்கம் பார்வை (Editorial View)</option>
                      <option value="உள்ளூர் செய்தி">உள்ளூர் செய்தி / சமூகப் பிரச்சனை</option>
                      <option value="கட்டுரை">பொதுக் கட்டுரை</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">படைப்பின் முழு விவரம் *</label>
                  <textarea
                    required
                    rows={4}
                    value={subForm.content}
                    onChange={(e) => setSubForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="உங்கள் கதை, கவிதை அல்லது கருத்துக்களை தெளிவாக இங்கே எழுதவும்..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none font-body leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">ஆசிரியர் குழு சரிபார்த்து 'வலைப்பதிவுகள்' அல்லது 'தலையங்கம்' பகுதியில் வெளியிடும்.</span>
                  <button
                    type="submit"
                    disabled={submittingArticle || !subForm.title.trim() || !subForm.content.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingArticle ? 'அனுப்பப்படுகிறது...' : 'ஆசிரியருக்கு அனுப்பு'}</span>
                  </button>
                </div>
              </form>

              {/* Submissions History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide flex items-center justify-between">
                  <span>என் சமர்ப்பிப்புகள் & ஆசிரியர் நிலை ({submissions.length})</span>
                </h4>

                <div className="space-y-2">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-xs text-white">{sub.title}</h5>
                            <span className="text-[9px] bg-slate-800 text-amber-300 px-2 py-0.2 rounded border border-slate-700">
                              {sub.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">தேதி: {sub.date}</span>
                        </div>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>ஆசிரியர் பரிசீலனையில் ⏳</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 italic font-body">
                        "{sub.content}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: APP SETTINGS & CUSTOMIZATION                           */}
          {/* ============================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wide">
                  பார்வை அமைப்புகள் (Appearance):
                </h4>

                {/* Dark / Light Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <strong className="text-white text-xs block">இரவு / பகல் பார்வை (Dark Mode)</strong>
                    <span className="text-[11px] text-slate-400">கண்களுக்கு இதமான வண்ணத் திட்டம்</span>
                  </div>
                  <button
                    onClick={onToggleDarkMode}
                    className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-400" />}
                    <span>{isDark ? 'பகல் பார்வை' : 'இரவு பார்வை'}</span>
                  </button>
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <strong className="text-white text-xs block">எழுத்து அளவு (Font Size)</strong>
                    <span className="text-[11px] text-slate-400">செய்தி வாசிப்பின் எழுத்துரு அளவு</span>
                  </div>
                  <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
                    <button
                      onClick={() => onChangeFontSize && onChangeFontSize('font-size-sm')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSizeClass === 'font-size-sm' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => onChangeFontSize && onChangeFontSize('font-size-md')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${fontSizeClass === 'font-size-md' || !fontSizeClass ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => onChangeFontSize && onChangeFontSize('font-size-lg')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSizeClass === 'font-size-lg' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-500">அமேஸ் டைம்ஸ் பதிப்பு 2.4 (App Edition)</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onLogout) onLogout();
                  }}
                  className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>கணக்கிலிருந்து வெளியேறு (Sign Out)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>பாதுகாக்கப்பட்ட வாசகர் கணக்கு &bull; Amaze Times</span>
          <button
            onClick={onClose}
            className="text-amber-400 hover:underline font-bold"
          >
            மூடுக (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
