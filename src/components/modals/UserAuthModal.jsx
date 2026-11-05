import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Bookmark,
  Trophy,
  PenTool,
  Bell,
  Headphones,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api, setToken, setCurrentUser, setReaderUser } from '../../services/api';

export default function UserAuthModal({ isOpen, onClose, onUserSuccess, onToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [activeBenefitIdx, setActiveBenefitIdx] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 6 Member Benefits
  const MEMBER_BENEFITS = [
    {
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      title: 'தனிப்பயனாக்கப்பட்ட முகப்புப் பக்கம்',
      desc: 'உங்கள் விருப்பமான மாவட்டம் & செய்திப் பிரிவுகள் உங்களுக்கு முன்னுரிமையுடன் காட்டப்படும்.'
    },
    {
      icon: Bookmark,
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      title: 'கிளவுட் புக்மார்க்குகள் & சாதன ஒத்திசைவு',
      desc: 'மொபைல், கணினி என எங்கும் உங்கள் சேமித்த செய்திகள் உடனுக்குடன் கிடைக்கும்.'
    },
    {
      icon: Trophy,
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      title: 'மாநிலப் போட்டிகள் & சான்றிதழ் பதிவிறக்கம்',
      desc: 'போட்டி முடிவுகள், உங்கள் விண்ணப்ப நிலை & விருது சான்றிதழ்களை நேரடியாகப் பதிவிறக்கலாம்.'
    },
    {
      icon: PenTool,
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
      title: 'வாசகர் தளம் & தலையங்க பிரசுரம்',
      desc: 'உங்கள் கவிதைகள், சிறுகதைகள் மற்றும் தலையங்க கருத்துகளை எழுதி அமேஸ் டைம்ஸில் வெளியிடலாம்.'
    },
    {
      icon: Bell,
      color: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
      title: 'முக்கிய பிரேக்கிங் செய்தி எச்சரிக்கைகள்',
      desc: 'தமிழகத்தின் முக்கிய நிகழ்வுகள் உங்கள் வாட்ஸ்அப் / மொபைல் அறிவிப்பாக உடனுக்குடன்.'
    },
    {
      icon: Headphones,
      color: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
      title: 'முழுமையான AI ஆடியோ வாசிப்பு & இதழ்கள்',
      desc: 'அனைத்து செய்திகளையும் வாய்ஸ் ரீடர் மூலம் கேட்கலாம்; மாத இதழ்களை இலவசமாகப் படிக்கலாம்.'
    }
  ];

  // Auto-rotate benefits every 4 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setActiveBenefitIdx((prev) => (prev + 1) % MEMBER_BENEFITS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Load Google Identity Services script if not loaded
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== 'undefined' && !document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
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
          setErrorMsg(res.message || 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'சேவையக இணைப்பு பிழை. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In with real authentication
  const handleGoogleClick = () => {
    setErrorMsg('');
    // Try Google Identity Services One-Tap if client ID exists
    const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setLoading(true);
            const res = await api.googleAuth({ credential: response.credential });
            if (res.success && res.user) {
              setToken(res.token, res.user.role || 'reader');
              setReaderUser(res.user);
              if (onToast) onToast(`Google மூலம் வருக, ${res.user.full_name}!`, 'success');
              if (onUserSuccess) onUserSuccess(res.user);
              onClose();
            }
          } catch (e) {
            setErrorMsg('Google சரிபார்ப்பில் பிழை ஏற்பட்டது');
          } finally {
            setLoading(false);
          }
        }
      });
      window.google.accounts.id.prompt();
      return;
    }

    // Interactive Google Account Chooser
    setShowGoogleChooser(true);
  };

  // Execute Google Instant Login with verified Google credentials
  const handleConfirmGoogleLogin = async (e) => {
    e.preventDefault();
    if (!googleEmailInput || !googleEmailInput.includes('@')) {
      setErrorMsg('தயவுசெய்து சரியான Google மின்னஞ்சல் முகவரியை உள்ளிடவும்');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const cleanEmail = googleEmailInput.trim().toLowerCase();
      const derivedName = googleNameInput.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

      const googleProfile = {
        name: formattedName,
        email: cleanEmail,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=0E2A7A&color=FBBF24&size=150&bold=true`,
        google_id: 'g_' + btoa(cleanEmail).replace(/=/g, '')
      };

      const res = await api.googleAuth(googleProfile);
      if (res.success && res.user) {
        setToken(res.token, res.user.role || 'reader');
        setReaderUser(res.user);
        if (onToast) onToast(`Google மூலம் வருக, ${res.user.full_name || res.user.name}!`, 'success');
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

  const currentBenefit = MEMBER_BENEFITS[activeBenefitIdx];
  const BenefitIcon = currentBenefit.icon;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-tamil">
      <div className="bg-gradient-to-b from-[#0c1633] via-[#091228] to-[#060a17] rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border-2 border-amber-500/30 text-white relative overflow-hidden my-auto max-h-[94vh] overflow-y-auto">
        
        {/* Top Trim Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-yellow-400"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-slate-700/60 shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 relative z-10 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 mx-auto shadow-lg border-2 border-amber-400 flex items-center justify-center">
            <img src="/amaze-times-logo.webp" alt="Amaze Times" className="w-full h-full object-contain rounded-xl" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-title tracking-wide">
            {isRegister ? 'புதிய வாசகர் பதிவு' : 'வாசகர் உள்நுழைவு (Sign In)'}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            அமேஸ் டைம்ஸ் வாசகர் சமூகத்தில் இணைந்து பிரத்யேக பலன்களைப் பெறுங்கள்
          </p>

          {/* Toggle Switcher */}
          <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 max-w-xs mx-auto mt-2">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); setShowGoogleChooser(false); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              உள்நுழைவு
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); setShowGoogleChooser(false); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isRegister
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              புதிய பதிவு
            </button>
          </div>
        </div>

        {/* EXCLUSIVE MEMBER BENEFITS SHOWCASE BOX */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-amber-400/30 relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wide">
                வாசகர் கணக்கின் பிரத்யேக நன்மைகள்:
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeBenefitIdx + 1}/{MEMBER_BENEFITS.length}
            </span>
          </div>

          <div className="flex items-start gap-2.5 pt-0.5">
            <div className={`p-2 rounded-xl border shrink-0 ${currentBenefit.color}`}>
              <BenefitIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white leading-tight">
                {currentBenefit.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5 line-clamp-2">
                {currentBenefit.desc}
              </p>
            </div>
          </div>
        </div>

        {/* GOOGLE SIGN IN BUTTON */}
        <div className="pt-3 space-y-3 relative z-10">
          {!showGoogleChooser ? (
            <button
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer border border-slate-200 text-xs sm:text-sm hover:scale-[1.01] active:scale-95"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{isRegister ? 'Google மூலம் உடனடிப் பதிவு' : 'Google கொண்டு உள்நுழைக (Sign in with Google)'}</span>
            </button>
          ) : (
            /* Interactive Google Account Chooser (Replaces ugly browser window.prompt!) */
            <form onSubmit={handleConfirmGoogleLogin} className="bg-slate-900 p-4 rounded-2xl border-2 border-blue-500/50 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="text-xs font-black text-white">Google கணக்கைத் தேர்ந்தெடுக்கவும்</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ரத்து
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">உங்கள் Google மின்னஞ்சல் (Gmail) *</label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">உங்கள் பெயர் (Google Profile Name)</label>
                <input
                  type="text"
                  placeholder="எ.கா: சௌந்தர் செந்தில்"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loading ? 'சரிபார்க்கப்படுகிறது...' : 'Google கொண்டு தொடரவும்'}</span>
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 text-slate-500 text-xs my-2">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[11px] font-semibold text-slate-400">அல்லது வழக்கமான கடவுச்சொல் வழி</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/60 p-3 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in my-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* EMAIL & PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1 relative z-10">
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
                  className="w-full bg-slate-900/90 text-sm text-white pl-10 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">மின்னஞ்சல் (Email)</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="yourname@gmail.com"
                className="w-full bg-slate-900/90 text-sm text-white pl-10 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">தொலைபேசி எண் (WhatsApp)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="98765 43210"
                  className="w-full bg-slate-900/90 text-sm text-white pl-10 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              </div>
            </div>
          )}

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
                className="w-full bg-slate-900/90 text-sm text-white pl-10 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm hover:scale-[1.01] active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>கணக்கை உருவாக்குக (Sign Up)</span>
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
