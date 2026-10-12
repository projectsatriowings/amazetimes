import React, { useState, useEffect } from 'react';
import { api, setToken, setCurrentUser, getCurrentUser } from '../../services/api';

export default function LoginPage({ onLoginSuccess, onNavigateHome, onToast }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@12345');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, automatically inform parent to route to /admin
  useEffect(() => {
    const existingUser = getCurrentUser();
    if (existingUser && (existingUser.role === 'admin' || existingUser.role === 'reporter')) {
      onLoginSuccess(existingUser);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const data = await api.login(username, password);
      if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        if (onToast) {
          onToast(`வணக்கம் ${data.user.full_name}! வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்.`, 'verified_user');
        }
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || 'உள்நுழைவு தோல்வியடைந்தது');
      }
    } catch (err) {
      setErrorMsg(err.message || 'சேவையக இணைப்பு பிழை (Network Error)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('Admin@12345');
    } else {
      setUsername('reporter1');
      setPassword('Reporter@12345');
    }
    setErrorMsg('');
  };

  return (
    <div class="min-h-screen bg-[#070C18] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-subtitle selection:bg-brand-red selection:text-white">
      {/* Background Glows */}
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-red/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header class="max-w-6xl w-full mx-auto flex items-center justify-between py-2 z-10">
        <div
          onClick={onNavigateHome}
          class="flex items-center gap-3 cursor-pointer group"
          title="முதன்மை செய்தித் தளம்"
        >
          <img
            src="/Amaze times.jpg"
            alt="Amaze Times"
            class="h-10 w-auto rounded-xl shadow-md border border-white/10 group-hover:border-amber-400 transition-all"
          />
          <div>
            <span class="font-title font-extrabold text-xl text-white group-hover:text-amber-400 transition-colors">
              அமேஸ் டைம்ஸ்
            </span>
            <span class="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              டிஜிட்டல் நாளிதழ்
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateHome}
          class="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>செய்தி முகப்பு</span>
        </button>
      </header>

      {/* CENTER LOGIN CARD */}
      <main class="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div class="bg-[#0E1628]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          
          {/* Card Icon & Title */}
          <div class="text-center space-y-2">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red via-red-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-brand-red/30">
              <span class="material-symbols-outlined text-[36px]">shield_person</span>
            </div>
            <h1 class="font-title font-extrabold text-2xl text-white tracking-tight">
              செய்தி அறை உள்நுழைவு
            </h1>
            <p class="text-xs text-slate-400 leading-relaxed">
              அமேஸ் டைம்ஸ் முதன்மை கட்டுப்பாட்டகம் (Admin Console) அணுகவும்
            </p>
          </div>

          {/* Role Quick Selector */}
          <div class="bg-black/40 p-1.5 rounded-2xl flex items-center gap-1.5 border border-white/5">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              class={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                username === 'admin'
                  ? 'bg-gradient-to-r from-brand-red to-red-600 text-white shadow-lg shadow-brand-red/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>முதன்மை நிர்வாகி</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('reporter')}
              class={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                username === 'reporter1'
                  ? 'bg-gradient-to-r from-brand-red to-red-600 text-white shadow-lg shadow-brand-red/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span class="material-symbols-outlined text-[16px]">edit_note</span>
              <span>செய்தி நிருபர்</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div class="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-red-400">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                பயனர் பெயர் (Username)
              </label>
              <div class="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin அல்லது reporter"
                  class="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30 transition-all placeholder-slate-600"
                />
                <span class="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[18px]">
                  person
                </span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                கடவுச்சொல் (Password)
              </label>
              <div class="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="கடவுச்சொல்"
                  class="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30 transition-all placeholder-slate-600"
                />
                <span class="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[18px]">
                  lock
                </span>
              </div>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                class="w-full bg-gradient-to-r from-brand-red via-red-600 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-extrabold text-sm py-3 rounded-xl transition-all shadow-xl shadow-brand-red/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>உள்நுழைகிறது...</span>
                  </>
                ) : (
                  <>
                    <span>கட்டுப்பாட்டகம் உள்நுழைக</span>
                    <span class="material-symbols-outlined text-[18px]">login</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Footer */}
          <div class="bg-white/5 rounded-xl p-3 border border-white/5 text-[11px] text-slate-400 space-y-1">
            <p class="font-bold text-slate-300">💡 மாதிரி அணுகல் விபரம்:</p>
            <p>• Admin: <span class="font-mono text-amber-300 font-bold">admin</span> / <span class="font-mono text-amber-300 font-bold">Admin@12345</span></p>
            <p>• Reporter: <span class="font-mono text-amber-300 font-bold">reporter1</span> / <span class="font-mono text-amber-300 font-bold">Reporter@12345</span></p>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer class="text-center text-xs text-slate-500 py-2 z-10">
        © 2026 Amaze Times (அமேஸ் டைம்ஸ்) • பாதுகாக்கப்பட்ட செய்தி நிர்வாக தளம்
      </footer>
    </div>
  );
}
