import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sun, Moon, Bookmark, Download, Users, Sliders } from 'lucide-react';
import { api } from '../services/api';

export default function TopBar({
  isDark,
  onToggleDarkMode,
  fontSizeClass,
  onChangeFontSize,
  savedBookmarksCount = 0,
  onOpenBookmarks,
  onOpenPWAInstall
}) {
  const [currentTamilDate, setCurrentTamilDate] = useState('');
  const [currentTamilTime, setCurrentTamilTime] = useState('');
  const [activeReaders, setActiveReaders] = useState(148);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Tamil Date & Clock Updater
    const updateTime = () => {
      const now = new Date();
      try {
        const dateStr = now.toLocaleDateString('ta-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        setCurrentTamilDate(dateStr);

        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const period = hours >= 12 ? (hours >= 18 ? 'இரவு' : 'மாலை') : (hours < 6 ? 'அதிகாலை' : 'காலை');
        hours = hours % 12 || 12;
        setCurrentTamilTime(`${hours}:${minutes}:${seconds} ${period}`);
      } catch (_) {}
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live reader pulse
  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const res = await api.getLiveVisitorPulse();
        if (res && res.success && typeof res.activeVisitors === 'number') {
          setActiveReaders(res.activeVisitors);
        }
      } catch (_) {}
    };
    fetchPulse();
    const pulseInterval = setInterval(fetchPulse, 25000);
    return () => clearInterval(pulseInterval);
  }, []);

  // PWA Prompt Detection
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (onOpenPWAInstall) {
      onOpenPWAInstall();
    }
  };

  return (
    <div className="w-full bg-[#060c21] text-gray-200 border-b border-gray-800 text-xs px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 z-40 select-none">
      {/* Left: Tamil Clock & Live Readers Pulse */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-gray-300">
          <Calendar size={13} className="text-amber-400 flex-shrink-0" />
          <span className="font-medium tracking-tight text-[11px] sm:text-xs">{currentTamilDate || 'புரட்டாசி நன்னாள்'}</span>
        </div>

        <span className="text-gray-700 hidden sm:inline">|</span>

        <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px] sm:text-xs">
          <Clock size={13} className="text-amber-400 flex-shrink-0" />
          <span>{currentTamilTime}</span>
        </div>

        <span className="text-gray-700 hidden md:inline">|</span>

        {/* Live Visitor Pulse */}
        <div className="hidden md:flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 font-bold">{activeReaders} வாசகர்கள்</span>
          <span className="text-emerald-500/80 text-[10px]">நேரலை</span>
        </div>
      </div>

      {/* Right: Font Scaling, Dark/Light Mode, PWA Install, Bookmarks */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Font Scaling (A-, A, A+) */}
        <div className="flex items-center bg-gray-900/80 border border-gray-700/60 rounded-lg p-0.5">
          <button
            onClick={() => onChangeFontSize && onChangeFontSize('font-size-sm')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
              fontSizeClass === 'font-size-sm' ? 'bg-amber-400 text-slate-950' : 'text-gray-400 hover:text-white'
            }`}
            title="சிறிய எழுத்து (14px)"
          >
            A-
          </button>
          <button
            onClick={() => onChangeFontSize && onChangeFontSize('font-size-md')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition ${
              fontSizeClass === 'font-size-md' || !fontSizeClass ? 'bg-amber-400 text-slate-950' : 'text-gray-400 hover:text-white'
            }`}
            title="நடுத்தர எழுத்து (16px)"
          >
            A
          </button>
          <button
            onClick={() => onChangeFontSize && onChangeFontSize('font-size-lg')}
            className={`px-1.5 py-0.5 rounded text-[12px] font-bold transition ${
              fontSizeClass === 'font-size-lg' ? 'bg-amber-400 text-slate-950' : 'text-gray-400 hover:text-white'
            }`}
            title="பெரிய எழுத்து (18px)"
          >
            A+
          </button>
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-lg bg-gray-900/80 border border-gray-700/60 text-amber-300 hover:text-white transition cursor-pointer"
          title={isDark ? "பகல் பார்வைக்கு மாற்றுக (Light Mode)" : "இரவுப் பார்வைக்கு மாற்றுக (Dark Mode)"}
        >
          {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-300" />}
        </button>

        {/* PWA App Install Button */}
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-[11px] shadow-sm transition"
          title="மொபைல் / கணினியில் ஆப் நிறுவுக"
        >
          <Download size={12} />
          <span className="hidden sm:inline">ஆப் நிறுவுக</span>
        </button>

        {/* Bookmarks Drawer Button */}
        {onOpenBookmarks && (
          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900/80 border border-gray-700/60 hover:bg-gray-800 text-gray-200 transition"
            title="சேமிக்கப்பட்ட செய்திகள்"
          >
            <Bookmark size={12} className="text-amber-400" />
            <span className="text-[11px] font-bold">{savedBookmarksCount}</span>
          </button>
        )}
      </div>
    </div>
  );
}
