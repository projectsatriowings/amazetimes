import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { api, setToken, setReaderUser } from '../../services/api';

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
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'saved' | 'liked' | 'history' | 'preferences'
  const [profileData, setProfileData] = useState({
    name: readerUser?.full_name || readerUser?.name || '',
    email: readerUser?.email || '',
    phone: readerUser?.phone || '',
    bio: readerUser?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Sync state if readerUser changes
  React.useEffect(() => {
    if (readerUser) {
      setProfileData({
        name: readerUser.full_name || readerUser.name || '',
        email: readerUser.email || '',
        phone: readerUser.phone || '',
        bio: readerUser.bio || ''
      });
    }
  }, [readerUser]);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
        bio: profileData.bio.trim()
      };

      // Try backend update if logged in
      try {
        await api.updateProfile({
          name: updatedUser.name,
          phone: updatedUser.phone,
          bio: updatedUser.bio
        });
      } catch (_) {}

      setReaderUser(updatedUser);
      if (onUpdateUser) onUpdateUser(updatedUser);
      if (onToast) onToast('சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது!', 'success');
    } catch (err) {
      if (onToast) onToast('சேமிப்பதில் பிழை ஏற்பட்டது.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      if (onToast) onToast('அனைத்து கடவுச்சொல் கட்டங்களையும் நிரப்பவும்.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      if (onToast) onToast('புதிய கடவுச்சொற்கள் பொருந்தவில்லை.', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (res.success) {
        if (onToast) onToast('கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        if (onToast) onToast(res.message || 'கடவுச்சொல் மாற்றுவதில் பிழை.', 'error');
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'கடவுச்சொல் மாற்றுவதில் பிழை.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const userInitial = (readerUser.full_name || readerUser.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-tamil">
      <div className="bg-gradient-to-b from-[#0c1633] via-[#091228] to-[#060a17] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-blue-500/30 text-white relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Trim Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-indigo-600"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-slate-700/60 shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Profile Summary */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-800/80 shrink-0">
          {readerUser.avatar_url || readerUser.avatar ? (
            <img
              src={readerUser.avatar_url || readerUser.avatar}
              alt={readerUser.full_name || readerUser.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shadow-lg shrink-0 bg-slate-800"
              onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0e2a7a] to-blue-600 text-amber-300 ring-2 ring-amber-400 text-xl font-black flex items-center justify-center shadow-lg shrink-0 font-sans">
              {userInitial}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white truncate">
                {readerUser.full_name || readerUser.name}
              </h2>
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-600/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>உறுதிசெய்யப்பட்டது</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans truncate">{readerUser.email}</p>
            <span className="inline-block bg-[#0e2a7a]/60 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 border border-amber-400/30">
              {readerUser.role === 'admin' ? 'நிர்வாகி (Admin)' : readerUser.role === 'reporter' ? 'செய்தியாளர் (Reporter)' : 'பதிவு செய்த வாசகர் (Reader)'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>சுயவிவரம்</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>சேமித்தவை</span>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {savedBookmarks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'liked'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>விருப்பங்கள்</span>
            <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {likedArticles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>வரலாறு</span>
            <span className="bg-slate-700 text-slate-300 font-bold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {readingHistory.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-[#0e2a7a] text-amber-300 border border-amber-400/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>விருப்பத் தேர்வுகள்</span>
          </button>
        </div>

        {/* Tab Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">முழுப் பெயர் (Full Name):</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full bg-[#050915] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">மின்னஞ்சல் முகவரி (Email):</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-400 font-sans cursor-not-allowed text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">தொலைபேசி எண் (Phone):</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full bg-[#050915] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400 font-sans font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">வாசகர் குறிப்பு / சுருக்கம் (Bio):</label>
                  <textarea
                    rows={2}
                    placeholder="உங்களைப் பற்றிய குறிப்பு..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-[#0e2a7a] hover:bg-[#0a1f5c] text-amber-300 border border-amber-400/40 font-bold py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{savingProfile ? 'சேமிக்கப்படுகிறது...' : 'சுயவிவரத்தை சேமி'}</span>
                </button>
              </form>

              {/* Password Change Box */}
              <div className="bg-[#050915] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>கடவுச்சொல் மாற்றுதல் (Change Password)</span>
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">தற்போதைய கடவுச்சொல்:</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-slate-400 block mb-1">புதிய கடவுச்சொல்:</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">உறுதி செய்க:</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
                  >
                    {changingPassword ? 'மாற்றப்படுகிறது...' : 'கடவுச்சொல்லை மாற்று'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: SAVED ARTICLES / BOOKMARKS */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-bold">
                  மொத்தம் {savedBookmarks.length} சேமித்த செய்திகள்
                </span>
                {savedBookmarks.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAllBookmarks}
                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>அனைத்தையும் நீக்கு</span>
                  </button>
                )}
              </div>

              {savedBookmarks.length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="font-bold text-sm text-slate-400">சேமித்த செய்திகள் எதுவும் இல்லை</p>
                  <p className="text-xs">செய்தி அட்டைகளில் உள்ள Bookmark பொத்தானை அழுத்தி செய்திகளை இங்கே சேமிக்கலாம்.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedBookmarks.map((art) => (
                    <div
                      key={art.id}
                      className="bg-[#050915] p-3 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition group"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          if (onOpenArticle) onOpenArticle(art.id);
                        }}
                        className="flex-1 cursor-pointer min-w-0"
                      >
                        <span className="text-[10px] bg-[#0e2a7a] text-amber-300 font-bold px-2 py-0.5 rounded-md inline-block mb-1">
                          {art.category || art.cat || 'செய்தி'}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 line-clamp-2 transition leading-snug">
                          {art.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onOpenArticle) onOpenArticle(art.id);
                          }}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer transition"
                          title="செய்தியைப் படிக்க"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveBookmark(art.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition"
                          title="சேமிப்பிலிருந்து நீக்கு"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIKED ARTICLES */}
          {activeTab === 'liked' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-bold">
                  மொத்தம் {likedArticles.length} விரும்பிய செய்திகள்
                </span>
                {likedArticles.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAllLiked}
                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>அனைத்தையும் நீக்கு</span>
                  </button>
                )}
              </div>

              {likedArticles.length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <Heart className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="font-bold text-sm text-slate-400">விருப்பமான செய்திகள் எதுவும் இல்லை</p>
                  <p className="text-xs">செய்திகளுக்கு Heart ஐகானை அழுத்தி விருப்பம் தெரிவித்து இங்கே தொகுத்துக் கொள்ளலாம்.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {likedArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-[#050915] p-3 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition group"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          if (onOpenArticle) onOpenArticle(art.id);
                        }}
                        className="flex-1 cursor-pointer min-w-0"
                      >
                        <span className="text-[10px] bg-rose-950/80 text-rose-400 border border-rose-800/40 font-bold px-2 py-0.5 rounded-md inline-block mb-1">
                          {art.category || art.cat || 'செய்தி'}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-rose-300 line-clamp-2 transition leading-snug">
                          {art.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onOpenArticle) onOpenArticle(art.id);
                          }}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer transition"
                          title="செய்தியைப் படிக்க"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveLikedArticle(art.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition"
                          title="விருப்பத்தை நீக்கு"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: READING HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-bold">
                  சமீபத்தில் படித்த {readingHistory.length} செய்திகள்
                </span>
                {readingHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearReadingHistory}
                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>வரலாற்றை அழி</span>
                  </button>
                )}
              </div>

              {readingHistory.length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="font-bold text-sm text-slate-400">படித்த செய்திகள் எதுவும் இல்லை</p>
                  <p className="text-xs">நீங்கள் படிக்கும் செய்திகள் தானாகவே இங்கே பட்டியலிடப்படும்.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {readingHistory.map((art, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onClose();
                        if (onOpenArticle) onOpenArticle(art.id);
                      }}
                      className="bg-[#050915] p-3 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-md">
                            {art.category || 'செய்தி'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            {art.readAt ? new Date(art.readAt).toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 line-clamp-1 transition">
                          {art.title}
                        </h4>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-[#050915] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-amber-400" />
                  <span>தளத்தின் பார்வை முறை (Theme Mode):</span>
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { if (!isDark && onToggleDarkMode) onToggleDarkMode(); }}
                    className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition ${
                      isDark ? 'bg-[#0e2a7a] text-amber-300 border-amber-400/50 shadow' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-amber-400" />
                    <span>இரவுப் பார்வை (Dark Mode)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { if (isDark && onToggleDarkMode) onToggleDarkMode(); }}
                    className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition ${
                      !isDark ? 'bg-[#0e2a7a] text-amber-300 border-amber-400/50 shadow' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>பகல் பார்வை (Light Mode)</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#050915] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>எழுத்து அளவு (Font Size):</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'font-size-sm', label: 'சிறியது (A-)' },
                    { id: 'font-size-md', label: 'இயல்பு (A)' },
                    { id: 'font-size-lg', label: 'பெரியது (A+)' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onChangeFontSize && onChangeFontSize(f.id)}
                      className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition text-xs ${
                        fontSizeClass === f.id
                          ? 'bg-[#0e2a7a] text-amber-300 border-amber-400/50 shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Clean Logout Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>கணக்கிலிருந்து வெளியேறு (Logout)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            மூடு (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
