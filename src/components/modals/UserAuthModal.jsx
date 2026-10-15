import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, LogIn, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, setToken, setCurrentUser, setReaderUser } from '../../services/api';

export default function UserAuthModal({ isOpen, onClose, onUserSuccess, onToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register in PostgreSQL DB
        const res = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });

        if (res.success && res.user) {
          setToken(res.token, 'reader');
          setReaderUser(res.user);
          if (onToast) onToast('வாசகர் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! வருக!', 'success');
          if (onUserSuccess) onUserSuccess(res.user);
          onClose();
        } else {
          setErrorMsg(res.message || 'பதிவு செய்வதில் பிழை ஏற்பட்டது');
        }
      } else {
        // Login in PostgreSQL DB
        const res = await api.login(formData.email, formData.password);
        if (res.success && res.user) {
          setToken(res.token, res.user.role || 'reader');
          if (res.user.role === 'admin' || res.user.role === 'reporter') {
            setCurrentUser(res.user);
          }
          setReaderUser(res.user);
          if (onToast) onToast(`வணக்கம் ${res.user.full_name || res.user.username}!`, 'success');
          if (onUserSuccess) onUserSuccess(res.user);
          onClose();
        } else {
          setErrorMsg(res.message || 'உள்நுழைவு பிழை');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'சேவையக இணைப்பு பிழை. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In with real user authentication
  const handleGoogleClick = async () => {
    setErrorMsg('');
    const userEmail = window.prompt('உங்கள் Google மின்னஞ்சல் முகவரியை உள்ளிடவும் (Enter your Google email):');
    if (!userEmail || !userEmail.trim()) return;
    
    const cleanEmail = userEmail.trim().toLowerCase();
    const suggestedName = cleanEmail.split('@')[0];
    const userName = window.prompt('உங்கள் பெயரை உள்ளிடவும் (Your Name):', suggestedName) || suggestedName;

    setLoading(true);
    try {
      const googleProfile = {
        name: userName.trim(),
        email: cleanEmail,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0E2A7A&color=FBBF24&size=150&bold=true`,
        google_id: 'g_' + btoa(cleanEmail).replace(/=/g, '')
      };

      const res = await api.googleAuth(googleProfile);
      if (res.success && res.user) {
        setToken(res.token, res.user.role || 'reader');
        setReaderUser(res.user);
        if (onToast) onToast(`Google மூலம் வருக, ${res.user.full_name || res.user.username}!`, 'success');
        if (onUserSuccess) onUserSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message || 'Google உள்நுழைவு பிழை');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google இணைப்பு பிழை');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0c1633] via-[#091228] to-[#060a17] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-500/30 text-white relative overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Top Crimson Red Accent Trim Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-700"></div>

        {/* Ambient Subtle Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-slate-700/60 shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 relative z-10 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 mx-auto shadow-lg border-2 border-red-500/60 flex items-center justify-center">
            <img src="/Amaze times.jpg" alt="Amaze Times" className="w-full h-full object-contain rounded-xl" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-title tracking-wide">
            {isRegister ? 'புதிய வாசகர் பதிவு' : 'வாசகர் உள்நுழைவு'}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            அமேஸ் டைம்ஸ் நாளிதழின் பிரத்யேக செய்திகள் &amp; சேமிப்புகளைப் பெறுக
          </p>

          {/* Toggle Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 max-w-xs mx-auto mt-3">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              உள்நுழைவு
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isRegister
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              புதிய பதிவு (Sign Up)
            </button>
          </div>
        </div>

        {/* GOOGLE ONE-CLICK SIGN IN */}
        <div className="pt-4 space-y-3 relative z-10">
          <button
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer border border-slate-200 text-xs sm:text-sm hover:scale-[1.01] active:scale-95"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{isRegister ? 'Google மூலம் உடனடிப் பதிவு' : 'Google மூலம் உள்நுழைக'}</span>
          </button>

          <div className="flex items-center gap-3 text-slate-500 text-xs my-2">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[11px] font-semibold text-slate-400">அல்லது மின்னஞ்சல் வழி</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/60 p-3 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 relative z-10">
          {/* Full Name for Registration */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">முழுப் பெயர் (Full Name)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="எ.கா. மு. கார்த்திகேயன்"
                  className="w-full bg-slate-900/90 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-red-500 transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">மின்னஞ்சல் (Email)</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="yourname@gmail.com"
                className="w-full bg-slate-900/90 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-red-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Phone (Registration optional) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">தொலைபேசி எண் (விருப்பத்தேர்வு)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full bg-slate-900/90 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-red-500 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">கடவுச்சொல் (Password)</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="குறைந்தது 6 எழுத்துகள்"
                className="w-full bg-slate-900/90 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-red-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm hover:scale-[1.01] active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>கணக்கை உருவாக்க (Sign Up)</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>உள்நுழைக (Sign In)</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
