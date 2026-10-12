import React, { useState } from 'react';
import { api, setToken, setCurrentUser } from '../../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, onToast }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@12345');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const data = await api.login(username, password);
      if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        onLoginSuccess(data.user);
        onToast(`வணக்கம் ${data.user.full_name}! வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்.`, 'verified_user');
        onClose();
      } else {
        setErrorMsg(data.message || 'உள்நுழைவு தோல்வியடைந்தது');
      }
    } catch (err) {
      setErrorMsg(err.message || 'சேவையக இணைப்பு பிழை');
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
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div class="bg-white dark:bg-[#0D1424] rounded-3xl max-w-md w-full shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden transform transition-all p-6 sm:p-8 space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header */}
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-red via-red-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-red/30">
            <span class="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <h2 class="font-title font-extrabold text-2xl text-slate-900 dark:text-white">
            செய்தி அறை உள்நுழைவு
          </h2>
          <p class="font-subtitle text-xs text-slate-500 dark:text-slate-400">
            நிர்வாகி (Admin) & நிருபர்கள் (Reporters) பிரத்யேக அணுகல்
          </p>
        </div>

        {/* Demo Fast Account Switcher */}
        <div class="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl flex items-center gap-1.5 text-xs font-subtitle font-bold">
          <button
            type="button"
            onClick={() => handleQuickFill('admin')}
            class={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              username === 'admin'
                ? 'bg-brand-red text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span class="material-symbols-outlined text-[15px]">shield_person</span>
            <span>முதன்மை நிர்வாகி</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('reporter')}
            class={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              username === 'reporter1'
                ? 'bg-brand-red text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span class="material-symbols-outlined text-[15px]">edit_note</span>
            <span>செய்தி நிருபர்</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div class="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-subtitle font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-4 text-xs font-subtitle">
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-brand-red">person</span>
              <span>பயனர்பெயர் (Username / Email):</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin அல்லது reporter1"
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-brand-red">lock</span>
              <span>கடவுச்சொல் (Password):</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            class="w-full load-more-btn font-extrabold text-sm py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>சரிபார்க்கப்படுகிறது...</span>
            ) : (
              <>
                <span>உள்நுழைக (Sign In)</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div class="text-[11px] text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-800 pt-3">
          <span>பாதுகாக்கப்பட்ட Neon PostgreSQL தரவுத்தளம் • 256-Bit SSL என்க்ரிப்ஷன்</span>
        </div>
      </div>
    </div>
  );
}
