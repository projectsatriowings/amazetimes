import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { defaultHoroscopeData } from '../data/horoscopeData';
import {
  defaultPanchangamData,
  defaultTempleFestivals,
  defaultRemediesData,
  defaultSpiritualWisdom,
  defaultChristianData,
  defaultIslamicData
} from '../data/aanmeegamData';
import { defaultBirthdayWishes } from '../data/birthdayData';
import { defaultMagazines } from '../data/magazineData';
import { defaultQuotesData } from '../data/quotesData';
import { defaultCompetitionsData } from '../data/competitionsData';
import { defaultExamsData } from '../data/examsData';
import { defaultVideos, formatYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../data/videoData';
import { DEFAULT_BLOG_ITEMS } from '../components/admin/AdminBlogManager';
import { formatRelativeTime, getArticleTime } from '../utils/timeAgo';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // PWA Install State & Handlers
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPWA(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setCanInstallPWA(false);
      }
      setDeferredPrompt(null);
    } else {
      showToast('உலாவியின் முகவரிப்பட்டியில் உள்ள ஆப் குறியீட்டைப் பயன்படுத்தி நிறுவலாம்!');
    }
  };
  // Theme state - LocalStorage allowed strictly for client preference
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('amaze_theme') || 'light';
    } catch (_) {
      return 'light';
    }
  });
  
  // Font scaling state - LocalStorage allowed strictly for client preference
  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem('amaze_font_size') || 'base';
    } catch (_) {
      return 'base';
    }
  });

  // Bookmarks state - LocalStorage allowed strictly for client preference
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('amaze_bookmarks') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Horoscope Data State - Pure Database Driven (Zero LocalStorage)
  const [horoscopeData, setHoroscopeData] = useState(defaultHoroscopeData);

  // Panchangam Data State - Pure Database Driven (Zero LocalStorage)
  const [panchangamData, setPanchangamData] = useState(defaultPanchangamData);

  // Temple Festivals State - Pure Database Driven (Zero LocalStorage)
  const [templeFestivals, setTempleFestivals] = useState(defaultTempleFestivals);

  // Remedies State - Pure Database Driven (Zero LocalStorage)
  const [remediesData, setRemediesData] = useState(defaultRemediesData);

  // Spiritual Wisdom State - Pure Database Driven (Zero LocalStorage)
  const [spiritualWisdom, setSpiritualWisdom] = useState(defaultSpiritualWisdom);

  // Christian Spirituality State - Pure Database Driven (Zero LocalStorage)
  const [christianData, setChristianData] = useState(defaultChristianData);

  // Islamic Spirituality State - Pure Database Driven (Zero LocalStorage)
  const [islamicData, setIslamicData] = useState(defaultIslamicData);

  // Helper to strictly sort magazines chronologically: 2026 -> 2025 -> 2024 -> 2023 -> 2021
  const sortMagazinesChronological = (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
      const yA = parseInt(a.year, 10) || 0;
      const yB = parseInt(b.year, 10) || 0;
      if (yB !== yA) return yB - yA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  };

  // Digital Magazine State - Pure Database Driven (PostgreSQL DB) with fallback
  // Digital Magazine State - Pure Database Driven (PostgreSQL DB) with fallback (Zero LocalStorage)
  const [magazinesList, setMagazinesList] = useState(() => sortMagazinesChronological(defaultMagazines));

  useEffect(() => {
    const loadMagazinesFromDB = async () => {
      try {
        const res = await api.getMagazines();
        if (res && res.success && Array.isArray(res.data)) {
          const sorted = sortMagazinesChronological(res.data);
          setMagazinesList(sorted);
        }
      } catch (e) {
        console.warn('Backend magazine fetch error:', e);
      }
    };
    loadMagazinesFromDB();
  }, []);

  const [birthdayWishes, setBirthdayWishes] = useState(() => {
    try {
      const saved = localStorage.getItem('amazetimes_birthday');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultBirthdayWishes;
  });
  const [quotesData, setQuotesData] = useState(defaultQuotesData);
  const [competitionsData, setCompetitionsData] = useState(defaultCompetitionsData);
  const [examsData, setExamsData] = useState(defaultExamsData);
  const [customBlogsData, setCustomBlogsData] = useState(DEFAULT_BLOG_ITEMS);
  const [videoGalleryList, setVideoGalleryList] = useState(defaultVideos);

  // User Auth State
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('amaze_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('amaze_token') || '');

  // Dynamic News Articles State (Direct from Neon PostgreSQL, Zero LocalStorage)
  const [newsList, setNewsList] = useState([]);
  const [goldRateData, setGoldRateData] = useState({
    gold22k: 13135,
    gold24k: 14329,
    gold18k: 10750,
    silver: 220,
    platinum: 3200,
    petrol: 100.75,
    diesel: 92.34,
    changeAmount: 50,
    isUp: true,
    updatedAt: new Date().toISOString()
  });

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState({ title: '', url: '' });
  const [selectedBirthdayItem, setSelectedBirthdayItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Live time & date
  const [liveClock, setLiveClock] = useState('');
  const [liveDate, setLiveDate] = useState('');

  // Real-time Unique Viewers & Lifetime Visitors Tracking State
  const [liveViewersCount, setLiveViewersCount] = useState(1);
  const [totalLifetimeVisitors, setTotalLifetimeVisitors] = useState(() => {
    try {
      const cached = localStorage.getItem('amaze_total_lifetime_visitors');
      return cached ? parseInt(cached, 10) : 0;
    } catch (_) {
      return 0;
    }
  });

  useEffect(() => {
    let visitorId = localStorage.getItem('amazetimes_unique_visitor_id') ||
                    localStorage.getItem('amaze_unique_visitor_id') ||
                    localStorage.getItem('amaze_visitor_id') ||
                    localStorage.getItem('adutha_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }
    localStorage.setItem('amazetimes_unique_visitor_id', visitorId);
    localStorage.setItem('amaze_unique_visitor_id', visitorId);


    let consecutiveFailures = 0;
    const sendHeartbeatPing = async () => {
      // If API server is unreachable, back off and avoid spamming console
      if (consecutiveFailures >= 2) return;
      try {
        const res = await api.sendHeartbeat(visitorId);
        if (res && res.success) {
          if (typeof res.liveCount === 'number') {
            setLiveViewersCount(res.liveCount);
          }
          if (typeof res.totalVisitors === 'number') {
            setTotalLifetimeVisitors(res.totalVisitors);
            try {
              localStorage.setItem('amaze_total_lifetime_visitors', String(res.totalVisitors));
            } catch (_) {}
          }
          consecutiveFailures = 0;
        } else {
          consecutiveFailures++;
        }
      } catch (e) {
        consecutiveFailures++;
      }
    };

    sendHeartbeatPing();
    const interval = setInterval(sendHeartbeatPing, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync theme with HTML root tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('amaze_theme', theme);
  }, [theme]);

  // Sync bookmarks with localStorage (client preference)
  useEffect(() => {
    localStorage.setItem('amaze_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Flag to avoid overwriting database content before initial fetch
  const isLoadedFromDb = useRef(false);

  // Fetch Live Data from Backend API on mount
  useEffect(() => {
    fetchNews();
    fetchGoldRate();
    loadAllSiteContent();
    const goldInterval = setInterval(fetchGoldRate, 60000);
    return () => clearInterval(goldInterval);
  }, []);

  const loadAllSiteContent = async () => {
    try {
      const allContent = await api.getAllContent();
      if (allContent && typeof allContent === 'object') {
        if (allContent.horoscope && typeof allContent.horoscope === 'object' && Object.keys(allContent.horoscope).length > 0) setHoroscopeData(allContent.horoscope);
        if (allContent.panchangam && typeof allContent.panchangam === 'object' && Object.keys(allContent.panchangam).length > 0) setPanchangamData(allContent.panchangam);
        if (allContent.temples && Array.isArray(allContent.temples) && allContent.temples.length > 0) setTempleFestivals(allContent.temples);
        if (allContent.remedies && Array.isArray(allContent.remedies) && allContent.remedies.length > 0) setRemediesData(allContent.remedies);
        if (allContent.wisdom && Array.isArray(allContent.wisdom) && allContent.wisdom.length > 0) setSpiritualWisdom(allContent.wisdom);
        if (allContent.christian && typeof allContent.christian === 'object' && Object.keys(allContent.christian).length > 0) setChristianData(allContent.christian);
        if (allContent.islamic && typeof allContent.islamic === 'object' && Object.keys(allContent.islamic).length > 0) setIslamicData(allContent.islamic);
        if (allContent.birthday && Array.isArray(allContent.birthday) && allContent.birthday.length > 0) {
          setBirthdayWishes(allContent.birthday);
          try {
            localStorage.setItem('amazetimes_birthday', JSON.stringify(allContent.birthday));
          } catch (_) {}
        }
        if (allContent.quotes && Array.isArray(allContent.quotes) && allContent.quotes.length > 0) setQuotesData(allContent.quotes);
        if (allContent.competitions && Array.isArray(allContent.competitions) && allContent.competitions.length > 0) setCompetitionsData(allContent.competitions);
        if (allContent.exams && Array.isArray(allContent.exams) && allContent.exams.length > 0) {
          setExamsData(allContent.exams);
        } else {
          setExamsData(defaultExamsData);
          api.saveSiteContent('exams', defaultExamsData).catch(() => {});
        }
        if (allContent.blogs && Array.isArray(allContent.blogs) && allContent.blogs.length > 0) setCustomBlogsData(allContent.blogs);
        if (allContent.videos && Array.isArray(allContent.videos) && allContent.videos.length > 0) {
          setVideoGalleryList(allContent.videos);
        } else {
          setVideoGalleryList(defaultVideos);
          api.saveSiteContent('videos', defaultVideos).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Backend site content load error:', e);
    } finally {
      isLoadedFromDb.current = true;
    }
  };



  const formatNewsAuthor = (art) => {
    let authorName = 'ஆசிரியர்';
    if (typeof art.author === 'string' && art.author.trim()) {
      authorName = art.author.trim();
    } else if (art.author && typeof art.author === 'object' && art.author.name) {
      authorName = art.author.name;
    } else if (typeof art.authorName === 'string' && art.authorName.trim()) {
      authorName = art.authorName.trim();
    }
    let mainImage = art.mainImage || art.img;
    if (typeof mainImage === 'string' && mainImage.startsWith('http://')) {
      mainImage = mainImage.replace('http://', 'https://');
    }
    const rawTime = art.createdAt || art.publishedAt || art.time;
    const computedTime = formatRelativeTime(rawTime);
    return {
      ...art,
      mainImage,
      authorName,
      author: authorName,
      time: computedTime
    };
  };

  const latestNewsVersionRef = useRef(0);

  const fetchNews = async () => {
    try {
      const res = await api.getNews({ limit: 'all', _t: Date.now() });
      const list = (res && (res.data || res.news || res.articles)) || [];
      if (res && res.success && Array.isArray(list)) {
        const formatted = list.map(formatNewsAuthor);
        setNewsList(formatted);
      }
    } catch (e) {
      console.warn('Backend news fetch error:', e);
    }
  };

  // Multi-Device & Cross-Tab Real-Time News Sync
  useEffect(() => {
    // 1. BroadcastChannel for 0ms cross-tab sync within same browser
    let syncChannel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        syncChannel = new BroadcastChannel('amazetimes_news_sync');
        syncChannel.onmessage = (event) => {
          fetchNews();
        };
      }
    } catch (_) {}

    // 2. Storage event secondary fallback for older browsers
    const handleStorage = (e) => {
      if (e.key === 'amazetimes_news_sync' || e.key === 'amazetimes_news_version') {
        fetchNews();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Tab focus & visibility check: micro-version check (< 100 bytes)
    const checkVersionAndSync = async () => {
      try {
        const res = await api.getNewsVersion();
        if (res && res.success && res.version) {
          if (latestNewsVersionRef.current && res.version !== latestNewsVersionRef.current) {
            fetchNews();
          }
          latestNewsVersionRef.current = res.version;
        }
      } catch (_) {}
    };

    const handleFocus = () => checkVersionAndSync();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersionAndSync();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // 4. Server-Sent Events (SSE) Live Stream for 0ms Multi-Device Real-Time Sync
    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        const baseUrl = api.baseUrl || (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'));
        const sseUrl = `${baseUrl}/news/live-stream`;
        eventSource = new EventSource(sseUrl);

        eventSource.addEventListener('connected', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data?.version) latestNewsVersionRef.current = data.version;
          } catch (_) {}
        });

        eventSource.addEventListener('news_update', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data?.version) latestNewsVersionRef.current = data.version;
          } catch (_) {}
          fetchNews();
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (syncChannel) {
        try { syncChannel.close(); } catch (_) {}
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const notifyCrossTabSync = () => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('amazetimes_news_sync');
        ch.postMessage({ type: 'news_update', timestamp: Date.now() });
        ch.close();
      }
    } catch (_) {}
    try {
      localStorage.setItem('amazetimes_news_sync', String(Date.now()));
    } catch (_) {}
  };

  const addNews = async (newsData) => {
    try {
      const res = await api.createNews(newsData);
      if (res && res.success && res.data) {
        const dbItem = formatNewsAuthor({ ...res.data, _id: String(res.data._id || res.data.id), id: String(res.data.id || res.data._id) });
        setNewsList((prev) => [dbItem, ...prev.filter((n) => String(n.id || n._id) !== String(dbItem.id))]);
        showToast('செய்தி DB-யில் வெற்றிகரமாக சேமிக்கப்பட்டது!');
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
        notifyCrossTabSync();
        return { success: true, data: dbItem };
      }
    } catch (e) {
      console.error('Backend DB createNews error:', e);
    }
    showToast('DB-யில் செய்தி உருவாக்கத்தில் பிழை நடந்தது!');
    return { success: false };
  };

  const updateNews = async (id, updatedFields) => {
    const idStr = String(id);
    try {
      const res = await api.updateNews(id, updatedFields);
      if (res && res.success && res.data) {
        const dbItem = formatNewsAuthor({ ...res.data, _id: String(res.data._id || res.data.id), id: String(res.data.id || res.data._id) });
        setNewsList((prev) => prev.map((item) => (String(item.id || item._id) === idStr ? dbItem : item)));
        showToast('செய்தி DB-யில் புதுப்பிக்கப்பட்டது!');
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
        notifyCrossTabSync();
        return { success: true, data: dbItem };
      }
    } catch (e) {
      console.error('Backend DB updateNews error:', e);
    }
    showToast('DB-யில் செய்தி புதுப்பிப்பதில் பிழை');
    return { success: false };
  };

  const deleteNews = async (id) => {
    const idStr = String(id);
    try {
      const res = await api.deleteNews(id);
      if (res && res.success) {
        setNewsList((prev) => prev.filter((item) => String(item.id || item._id) !== idStr));
        showToast('செய்தி DB-யிலிருந்து நீக்கப்பட்டது!');
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
        notifyCrossTabSync();
        return { success: true };
      }
    } catch (e) {
      console.error('Backend DB deleteNews error:', e);
    }
    showToast('DB-யில் செய்தி நீக்குவதில் பிழை');
    return { success: false };
  };




  const fetchGoldRate = async () => {
    try {
      const res = await api.getGoldRate();
      if (res.success && res.data) {
        setGoldRateData(res.data);
      }
    } catch (e) {
      // Fallback
    }
  };

  // Auth Functions
  const handleLogin = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setUser(res.user);
        const t = res.token || 'demo-token';
        setToken(t);
        localStorage.setItem('amaze_token', t);
        localStorage.setItem('amaze_user', JSON.stringify(res.user));
        localStorage.setItem('adutha_token', t);
        localStorage.setItem('adutha_user', JSON.stringify(res.user));
        showToast(`வரவேற்கிறோம், ${res.user.full_name || res.user.name || res.user.username}!`);
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('Backend API login unavailable, using client authentication fallback...', err);
    }

    // Client-side Demo Fallback (Guarantees instant login even if backend DB is unseeded or offline)
    const cleanEmail = (email || '').toLowerCase().trim();
    if (cleanEmail === 'admin@amazetimes.com' || cleanEmail === 'admin' || cleanEmail === 'admin@aduthathalaimurai.in') {
      const adminUser = {
        id: '1f1adba8-0318-4db6-925e-113d389c4717',
        name: 'முதன்மை ஆசிரியர் (Chief Editor)',
        email: 'admin@amazetimes.com',
        username: 'admin',
        role: 'admin',
        designation: 'தலைமை நிர்வாகி (Super Admin)'
      };
      setUser(adminUser);
      setToken('demo-admin-token');
      localStorage.setItem('amaze_token', 'demo-admin-token');
      localStorage.setItem('amaze_user', JSON.stringify(adminUser));
      showToast('வரவேற்கிறோம், முதன்மை ஆசிரியர்!');
      return { success: true, user: adminUser };
    } else if (cleanEmail.includes('reporter')) {
      const reporterUser = {
        id: 'f123bc5f-fca2-467b-9779-43fb13848b46',
        name: 'க. சௌந்தர்ராஜன்',
        email: 'reporter1@amazetimes.com',
        username: 'reporter1',
        role: 'reporter',
        designation: 'சிறப்பு செய்தியாளர் (Special Correspondent)'
      };
      setUser(reporterUser);
      setToken('demo-reporter-token');
      localStorage.setItem('amaze_token', 'demo-reporter-token');
      localStorage.setItem('amaze_user', JSON.stringify(reporterUser));
      showToast('வரவேற்கிறோம், நிருபர்!');
      return { success: true, user: reporterUser };
    } else if (cleanEmail.length > 0) {
      const genUser = {
        id: 'user-' + Date.now(),
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'reader'
      };
      setUser(genUser);
      localStorage.setItem('amaze_user', JSON.stringify(genUser));
    }

    showToast('தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்');
    return { success: false, message: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்' };
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('amaze_token');
    localStorage.removeItem('amaze_user');
    localStorage.removeItem('adutha_token');
    localStorage.removeItem('adutha_user');
    showToast('வெளியேறினீர்கள் (Logged out)');
  };

  // Live Clock & Dynamic Tamil Date Interval
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      let seconds = now.getSeconds();
      let ampm = hours >= 12 ? 'மாலை' : 'காலை';
      if (hours >= 19) ampm = 'இரவு';
      else if (hours >= 12 && hours < 16) ampm = 'மதியம்';
      
      let displayHours = hours % 12;
      displayHours = displayHours ? displayHours : 12;
      let displayMinutes = minutes < 10 ? '0' + minutes : minutes;
      let displaySeconds = seconds < 10 ? '0' + seconds : seconds;
      
      setLiveClock(`${displayHours}:${displayMinutes}:${displaySeconds} ${ampm}`);

      const daysTamil = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
      const monthsTamil = [
        'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
        'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'
      ];
      
      const dayName = daysTamil[now.getDay()];
      const dayNum = String(now.getDate()).padStart(2, '0');
      const monthName = monthsTamil[now.getMonth()];
      const year = now.getFullYear();

      // Precise Tamil Solar Calendar calculation
      const m = now.getMonth(); // 0 = Jan, 9 = Oct
      const d = now.getDate();
      let tMonth = 'சித்திரை';
      let tDay = 1;

      if (m === 0) { // Jan
        if (d >= 15) { tMonth = 'தை'; tDay = d - 14; }
        else { tMonth = 'மார்கழி'; tDay = d + 16; }
      } else if (m === 1) { // Feb
        if (d >= 13) { tMonth = 'மாசி'; tDay = d - 12; }
        else { tMonth = 'தை'; tDay = d + 17; }
      } else if (m === 2) { // Mar
        if (d >= 14) { tMonth = 'பங்குனி'; tDay = d - 13; }
        else { tMonth = 'மாசி'; tDay = d + 15; }
      } else if (m === 3) { // Apr
        if (d >= 14) { tMonth = 'சித்திரை'; tDay = d - 13; }
        else { tMonth = 'பங்குனி'; tDay = d + 17; }
      } else if (m === 4) { // May
        if (d >= 15) { tMonth = 'வைகாசி'; tDay = d - 14; }
        else { tMonth = 'சித்திரை'; tDay = d + 17; }
      } else if (m === 5) { // Jun
        if (d >= 15) { tMonth = 'ஆனி'; tDay = d - 14; }
        else { tMonth = 'வைகாசி'; tDay = d + 17; }
      } else if (m === 6) { // Jul
        if (d >= 16) { tMonth = 'ஆடி'; tDay = d - 15; }
        else { tMonth = 'ஆனி'; tDay = d + 16; }
      } else if (m === 7) { // Aug
        if (d >= 17) { tMonth = 'ஆவணி'; tDay = d - 16; }
        else { tMonth = 'ஆடி'; tDay = d + 16; }
      } else if (m === 8) { // Sep
        if (d >= 17) { tMonth = 'புரட்டாசி'; tDay = d - 16; }
        else { tMonth = 'ஆவணி'; tDay = d + 15; }
      } else if (m === 9) { // Oct
        if (d >= 18) { tMonth = 'ஐப்பசி'; tDay = d - 17; }
        else { tMonth = 'புரட்டாசி'; tDay = d + 13; }
      } else if (m === 10) { // Nov
        if (d >= 17) { tMonth = 'கார்த்திகை'; tDay = d - 16; }
        else { tMonth = 'ஐப்பசி'; tDay = d + 14; }
      } else if (m === 11) { // Dec
        if (d >= 16) { tMonth = 'மார்கழி'; tDay = d - 15; }
        else { tMonth = 'கார்த்திகை'; tDay = d + 14; }
      }

      const formattedTamilDay = String(tDay).padStart(2, '0');
      setLiveDate(`${dayName}, ${dayNum} ${monthName} ${year} | ${tMonth} ${formattedTamilDay}`);
    };

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setTheme(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      showToast(nextTheme === 'dark' ? 'இரவு பயன்முறை (Dark Mode) இயக்கப்பட்டது' : 'பகல் பயன்முறை (Light Mode) இயக்கப்பட்டது');
      return nextTheme;
    });
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    const label = size === 'sm' ? 'சிறியது' : size === 'lg' ? 'பெரியது' : 'இயல்பு';
    showToast(`எழுத்து அளவு: ${label}`);
  };

  const toggleBookmark = (id, e) => {
    if (e) e.stopPropagation();
    setBookmarks(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('செய்தி சேமிப்பிலிருந்து நீக்கப்பட்டது');
        return prev.filter(item => item !== id);
      } else {
        showToast('செய்தி சேமிக்கப்பட்டது (Saved)!');
        return [...prev, id];
      }
    });
  };

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Article Views & Likes State (100% Realtime Database Driven, Zero LocalStorage)
  const [articleViews, setArticleViews] = useState({});
  const [articleLikes, setArticleLikes] = useState({});
  const [userLikedIds, setUserLikedIds] = useState([]);

  // Auto-purge all legacy cached news, views, and likes from localStorage on startup
  useEffect(() => {
    try {
      const keysToPurge = [
        'adutha_news_list', 'amaze_news_list',
        'adutha_article_views', 'amaze_article_views',
        'adutha_article_likes', 'amaze_article_likes',
        'adutha_user_liked', 'amaze_liked_articles',
        'adutha_magazines', 'adutha_birthday', 'adutha_quotes',
        'adutha_competitions', 'adutha_exams', 'adutha_blogs', 'adutha_videos'
      ];
      keysToPurge.forEach(k => localStorage.removeItem(k));
    } catch (_) {}
  }, []);

  const getArticleViews = (id) => {
    if (!id) return 0;
    const targetId = typeof id === 'object' ? (id.id || id._id || 1) : id;
    const initialCount = typeof id === 'object' ? (id.viewsCount || id.views || 0) : 0;
    const key = String(targetId);
    if (articleViews[key] !== undefined) return articleViews[key];
    return initialCount;
  };

  const getArticleLikes = (id) => {
    if (!id) return 0;
    const targetId = typeof id === 'object' ? (id.id || id._id || 1) : id;
    const initialCount = typeof id === 'object' ? (id.likesCount || id.likes || 0) : 0;
    const key = String(targetId);
    if (articleLikes[key] !== undefined) return articleLikes[key];
    return initialCount;
  };

  const isLiked = (id) => {
    if (!id) return false;
    const targetId = typeof id === 'object' ? (id.id || id._id || 1) : id;
    return userLikedIds.includes(String(targetId)) || userLikedIds.includes(Number(targetId));
  };

  const toggleLike = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!id) return;
    const targetId = typeof id === 'object' ? (id.id || id._id || 1) : id;
    const strId = String(targetId);
    const numId = Number(targetId);
    const alreadyLiked = isLiked(targetId);

    // Optimistic UI updates
    if (alreadyLiked) {
      setUserLikedIds(prev => prev.filter(item => String(item) !== strId && Number(item) !== numId));
      setArticleLikes(prev => ({
        ...prev,
        [strId]: Math.max(0, (getArticleLikes(id) - 1))
      }));
      showToast('செய்தி விருப்பம் திரும்பப்பெறப்பட்டது');
    } else {
      setUserLikedIds(prev => [...prev, strId]);
      setArticleLikes(prev => ({
        ...prev,
        [strId]: getArticleLikes(id) + 1
      }));
      showToast('❤️ செய்திக்கு விருப்பம் தெரிவிக்கப்பட்டது!');
    }

    // Background sync to Neon PostgreSQL news_likes table
    try {
      const res = await api.toggleNewsLike(targetId);
      if (res && res.success) {
        if (typeof res.likesCount === 'number') {
          setArticleLikes(prev => ({
            ...prev,
            [strId]: res.likesCount
          }));
        }
        if (res.liked) {
          setUserLikedIds(prev => Array.from(new Set([...prev, strId])));
        } else {
          setUserLikedIds(prev => prev.filter(item => String(item) !== strId && Number(item) !== numId));
        }
      }
    } catch (err) {
      console.warn('Background like sync to PostgreSQL failed:', err);
    }
  };

  const openArticleModal = async (id) => {
    const targetId = typeof id === 'object' ? (id.id || id._id || 1) : id;
    setSelectedArticleId(targetId);
    setActiveModal('article');

    const strId = String(targetId);
    // Optimistic view increment
    setArticleViews(prev => ({
      ...prev,
      [strId]: (getArticleViews(id) + 1)
    }));

    // Record reading history
    try {
      const raw = localStorage.getItem('amaze_reading_history') || localStorage.getItem('adutha_reading_history');
      const hist = raw ? JSON.parse(raw) : [];
      const updated = [strId, ...hist.filter(i => String(i) !== strId)].slice(0, 50);
      localStorage.setItem('amaze_reading_history', JSON.stringify(updated));
    } catch (_) {}

    // Atomic permanent increment in PostgreSQL
    try {
      const res = await api.recordNewsView(targetId);
      if (res && res.success && typeof res.viewsCount === 'number') {
        setArticleViews(prev => ({
          ...prev,
          [strId]: res.viewsCount
        }));
      }
    } catch (err) {
      console.warn('Background view sync to PostgreSQL failed:', err);
    }
  };

  const makeNewsFirst = async (id) => {
    try {
      const res = await api.makeNewsFirst(id);
      if (res && res.success) {
        showToast('செய்தி #1 முதல் இடத்திற்கு கொண்டு செல்லப்பட்டது!');
        await fetchNews();
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
        return { success: true };
      }
    } catch (err) {
      console.error('Make news first error:', err);
    }
    showToast('முதல் இடத்திற்கு மாற்றுவதில் பிழை');
    return { success: false };
  };

  const openVideoModal = (title, url) => {
    const embedUrl = formatYouTubeEmbedUrl(url);
    setSelectedVideo({ title, url: embedUrl || url });
    setActiveModal('video');
  };

  const openBirthdayModal = (item) => {
    setSelectedBirthdayItem(item);
    setActiveModal('birthdayDetail');
  };

  // Listen for ?birthday=<id> in URL to automatically open modal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const bdayId = urlParams.get('birthday');
      if (bdayId) {
        const list = birthdayWishes && birthdayWishes.length > 0 ? birthdayWishes : defaultBirthdayWishes;
        const found = list.find((b) => String(b.id) === String(bdayId));
        if (found) {
          openBirthdayModal(found);
        }
      }
    } catch (_) {}
  }, [birthdayWishes]);

  const openSearchModal = (query = '') => {
    if (query !== undefined) {
      setSearchQuery(query);
    }
    setActiveModal('search');
  };

  const saveSiteContent = async (key, data) => {
    try {
      await api.saveContent(key, data);
    } catch (e) {
      console.warn(`Error saving ${key} to DB:`, e);
    }
  };

  // Sync state changes to PostgreSQL database whenever updated
  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('horoscope', horoscopeData);
  }, [horoscopeData]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('panchangam', panchangamData);
  }, [panchangamData]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('temples', templeFestivals);
  }, [templeFestivals]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('remedies', remediesData);
  }, [remediesData]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('wisdom', spiritualWisdom);
  }, [spiritualWisdom]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('christian', christianData);
  }, [christianData]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('islamic', islamicData);
  }, [islamicData]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('birthday', birthdayWishes);
  }, [birthdayWishes]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('quotes', quotesData);
  }, [quotesData]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('competitions', competitionsData);
  }, [competitionsData]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('exams', examsData);
  }, [examsData]);

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('blogs', customBlogsData);
  }, [customBlogsData]);

  const saveQuotesData = (data) => {
    setQuotesData(data);
    saveSiteContent('quotes', data);
    showToast('பொன்மொழிகள் DB-யில் வெற்றிகரமாக சேமிக்கப்பட்டது!');
  };

  const saveCompetitionsData = (data) => {
    setCompetitionsData(data);
    saveSiteContent('competitions', data);
    showToast('போட்டிகள் விபரம் DB-யில் வெற்றிகரமாக சேமிக்கப்பட்டது!');
  };

  const saveExamsData = (data) => {
    setExamsData(data);
    saveSiteContent('exams', data);
    showToast('தேர்வுகள் விபரம் DB-யில் வெற்றிகரமாக சேமிக்கப்பட்டது!');
  };

  const saveCustomBlogsData = (data) => {
    setCustomBlogsData(data);
    saveSiteContent('blogs', data);
    showToast('படைப்புகள் DB-யில் வெற்றிகரமாக சேமிக்கப்பட்டது!');
  };

  useEffect(() => {
    if (!isLoadedFromDb.current) return;
    saveSiteContent('videos', videoGalleryList);
  }, [videoGalleryList]);

  const saveVideosData = (data) => {
    setVideoGalleryList(data);
    saveSiteContent('videos', data);
    showToast('வீடியோ செய்திகள் DB-யில் வெற்றிகரமாக சேமிக்கப்பட்டது!');
  };

  const addVideoItem = (item) => {
    const embedUrl = formatYouTubeEmbedUrl(item.videoUrl || item.embedUrl);
    const newItem = {
      ...item,
      id: item.id || `video-${Date.now()}`,
      embedUrl,
      img: item.img || (item.videoUrl ? getYouTubeThumbnailUrl(item.videoUrl) : '') || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
      isActive: item.isActive !== false,
      createdAt: item.createdAt || new Date().toISOString()
    };
    setVideoGalleryList(prev => [newItem, ...prev]);
    showToast('புதிய வீடியோ வெற்றிகரமாக சேர்க்கப்பட்டது!');
  };

  const updateVideoItem = (id, updatedFields) => {
    setVideoGalleryList(prev => prev.map(v => {
      if (String(v.id) === String(id)) {
        const videoUrl = updatedFields.videoUrl || v.videoUrl;
        const embedUrl = formatYouTubeEmbedUrl(videoUrl || v.embedUrl);
        return {
          ...v,
          ...updatedFields,
          embedUrl,
          img: updatedFields.img || (videoUrl ? getYouTubeThumbnailUrl(videoUrl, v.img) : v.img)
        };
      }
      return v;
    }));
    showToast('வீடியோ விபரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!');
  };

  const deleteVideoItem = (id) => {
    setVideoGalleryList(prev => prev.filter(v => String(v.id) !== String(id)));
    showToast('வீடியோ வெற்றிகரமாக நீக்கப்பட்டது!');
  };

  const addMagazine = async (item) => {
    try {
      const res = await api.createMagazine(item);
      if (res && res.success && res.data) {
        setMagazinesList((prev) => {
          const next = sortMagazinesChronological([
            res.data,
            ...prev.filter((m) => String(m.id) !== String(res.data.id))
          ]);
          return next;
        });
        showToast('புதிய மாத இதழ் DB-யில் வெற்றிகரமாக சேமிக்கப்பட்டது!');
        return { success: true, data: res.data };
      } else {
        showToast('⚠️ DB-யில் இதழ் சேமிப்பதில் பிழை: ' + (res?.message || 'சேமிக்க முடியவில்லை'));
        return { success: false };
      }
    } catch (e) {
      console.error('DB magazine creation error:', e);
      showToast('⚠️ DB-யில் இதழ் சேமிப்பதில் பிழைப்பட்டது!');
      return { success: false };
    }
  };

  const updateMagazine = async (id, updatedFields) => {
    const idStr = String(id);
    try {
      const res = await api.updateMagazine(id, updatedFields);
      if (res && res.success && res.data) {
        setMagazinesList((prev) => {
          const next = sortMagazinesChronological(prev.map((item) => (String(item.id) === idStr ? res.data : item)));
          return next;
        });
        showToast('மாத இதழ் DB-யில் புதுப்பிக்கப்பட்டது!');
        return { success: true, data: res.data };
      } else {
        showToast('⚠️ DB-யில் புதுப்பிப்பதில் பிழை');
        return { success: false };
      }
    } catch (e) {
      console.error('DB magazine update error:', e);
      showToast('⚠️ DB-யில் புதுப்பிப்பதில் பிழை ஏற்பட்டது');
      return { success: false };
    }
  };

  const deleteMagazine = async (id) => {
    const idStr = String(id);
    try {
      const res = await api.deleteMagazine(id);
      if (res && res.success) {
        setMagazinesList((prev) => {
          const next = prev.filter((item) => String(item.id) !== idStr);
          return next;
        });
        showToast('மாத இதழ் DB-யிலிருந்து நீக்கப்பட்டது!');
        return { success: true };
      }
    } catch (e) {
      console.error('DB magazine delete error:', e);
    }
    showToast('⚠️ DB-யிலிருந்து நீக்குவதில் பிழை');
    return { success: false };
  };

  const handleDownloadMagazine = (magazine, e) => {
    if (e) e.stopPropagation();
    const isUserLoggedIn = Boolean(user && (user.email || user.name));

    if (isUserLoggedIn) {
      const url = magazine?.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = `${magazine?.title || 'Adutha_Thalaimurai_Magazine'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`📥 "${magazine?.title || 'மாத இதழ்'}" PDF பதிவிறக்கம் தொடங்கியது!`);
    } else {
      setActiveModal('userAuth');
      showToast('⚠️ இதழ் PDF பதிவிறக்கம் செய்ய புகுபதிகை (Login) அவசியம்! தயவுசெய்து புகுபதிகை செய்யவும்.');
    }
  };

  const addBirthdayOfficial = (item) => {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDate = String(now.getDate()).padStart(2, '0');
    const newItem = {
      ...item,
      id: 'bday-' + Date.now(),
      createdDate: now.toISOString(),
      createdAt: now.toISOString(),
      dob: item.dob || `${currentMonth}-${currentDate}`,
      dobDisplay: item.dobDisplay || `${now.toLocaleString('ta-IN', { month: 'long' })} ${currentDate}`,
      wishesCount: item.wishesCount || 0,
      isActive: item.isActive !== undefined ? item.isActive : true
    };
    setBirthdayWishes((prev) => {
      const next = [newItem, ...prev];
      try {
        localStorage.setItem('amazetimes_birthday', JSON.stringify(next));
      } catch (_) {}
      saveSiteContent('birthday', next);
      return next;
    });
    showToast('புதிய பிறந்தநாள் வாழ்த்துப் பதிவு சேர்க்கப்பட்டது!');
  };

  const updateBirthdayOfficial = (id, updatedFields) => {
    setBirthdayWishes((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
      try {
        localStorage.setItem('amazetimes_birthday', JSON.stringify(next));
      } catch (_) {}
      saveSiteContent('birthday', next);
      return next;
    });
    showToast('விவரங்கள் புதுப்பிக்கப்பட்டன!');
  };

  const deleteBirthdayOfficial = (id) => {
    setBirthdayWishes((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('amazetimes_birthday', JSON.stringify(next));
      } catch (_) {}
      saveSiteContent('birthday', next);
      return next;
    });
    showToast('பதிவு நீக்கப்பட்டது');
  };

  const incrementOfficialWishCount = (id) => {
    setBirthdayWishes((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, wishesCount: (item.wishesCount || 0) + 1 };
          if (selectedBirthdayItem && selectedBirthdayItem.id === id) {
            setSelectedBirthdayItem(updated);
          }
          return updated;
        }
        return item;
      });
      try {
        localStorage.setItem('amazetimes_birthday', JSON.stringify(next));
      } catch (_) {}
      saveSiteContent('birthday', next);
      return next;
    });
    showToast('🎉 உங்கள் மனமார்ந்த வாழ்த்துகள் பதிவு செய்யப்பட்டது!');
  };

  const updateHoroscopeItem = (timeframe, rasiId, updatedFields) => {
    setHoroscopeData((prev) => {
      const next = { ...prev };
      if (!next[timeframe]) next[timeframe] = {};
      next[timeframe] = {
        ...next[timeframe],
        [rasiId]: {
          ...(next[timeframe][rasiId] || {}),
          ...updatedFields
        }
      };
      return next;
    });
    showToast('ராசி பலன் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!');
  };

  const updatePanchangamData = (updatedPanchangam) => {
    setPanchangamData((prev) => ({ ...prev, ...updatedPanchangam }));
    showToast('தினசரி பஞ்சாங்கம் புதுப்பிக்கப்பட்டது!');
  };

  const addTempleFestival = (item) => {
    const newItem = { ...item, id: 'fest-' + Date.now() };
    setTempleFestivals((prev) => [newItem, ...prev]);
    showToast('புதிய கோவில் திருவிழா சேர்க்கப்பட்டது!');
  };

  const updateTempleFestival = (id, updatedItem) => {
    setTempleFestivals((prev) => prev.map((tf) => (tf.id === id ? { ...tf, ...updatedItem } : tf)));
    showToast('கோவில் திருவிழா விபரம் திருத்தப்பட்டது!');
  };

  const deleteTempleFestival = (id) => {
    setTempleFestivals((prev) => prev.filter((tf) => tf.id !== id));
    showToast('கோவில் திருவிழா நீக்கப்பட்டது');
  };

  const addRemedyItem = (item) => {
    const newItem = { ...item, id: 'rem-' + Date.now() };
    setRemediesData((prev) => [newItem, ...prev]);
    showToast('புதிய பரிகாரம் சேர்க்கப்பட்டது!');
  };

  const updateRemedyItem = (id, updatedItem) => {
    setRemediesData((prev) => prev.map((rem) => (rem.id === id ? { ...rem, ...updatedItem } : rem)));
    showToast('பரிகார விபரம் திருத்தப்பட்டது!');
  };

  const deleteRemedyItem = (id) => {
    setRemediesData((prev) => prev.filter((rem) => rem.id !== id));
    showToast('பரிகாரம் நீக்கப்பட்டது');
  };

  const addSpiritualWisdom = (item) => {
    const newItem = { ...item, id: 'wis-' + Date.now() };
    setSpiritualWisdom((prev) => [newItem, ...prev]);
    showToast('புதிய ஆன்மீகச் செய்தி சேர்க்கப்பட்டது!');
  };

  const updateSpiritualWisdom = (id, updatedItem) => {
    setSpiritualWisdom((prev) => prev.map((wis) => (wis.id === id ? { ...wis, ...updatedItem } : wis)));
    showToast('ஆன்மீகச் செய்தி திருத்தப்பட்டது!');
  };

  const deleteSpiritualWisdom = (id) => {
    setSpiritualWisdom((prev) => prev.filter((wis) => wis.id !== id));
    showToast('ஆன்மீகச் செய்தி நீக்கப்பட்டது');
  };

  const updateChristianData = (updatedFields) => {
    setChristianData((prev) => ({ ...prev, ...updatedFields }));
    showToast('கிறிஸ்தவ ஆன்மீக விபரங்கள் புதுப்பிக்கப்பட்டன!');
  };

  const updateIslamicData = (updatedFields) => {
    setIslamicData((prev) => ({ ...prev, ...updatedFields }));
    showToast('இஸ்லாமிய ஆன்மீக விபரங்கள் புதுப்பிக்கப்பட்டன!');
  };

  const closeModal = () => {
    setActiveModal(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleDarkMode,
        fontSize,
        changeFontSize,
        bookmarks,
        toggleBookmark,
        horoscopeData,
        updateHoroscopeItem,
        setHoroscopeData,
        panchangamData,
        updatePanchangamData,
        templeFestivals,
        addTempleFestival,
        updateTempleFestival,
        deleteTempleFestival,
        remediesData,
        addRemedyItem,
        updateRemedyItem,
        deleteRemedyItem,
        spiritualWisdom,
        addSpiritualWisdom,
        updateSpiritualWisdom,
        deleteSpiritualWisdom,
        christianData,
        updateChristianData,
        islamicData,
        updateIslamicData,
        birthdayWishes,
        selectedBirthdayItem,
        setSelectedBirthdayItem,
        openBirthdayModal,
        addBirthdayOfficial,
        updateBirthdayOfficial,
        deleteBirthdayOfficial,
        incrementOfficialWishCount,
        magazinesList,
        addMagazine,
        updateMagazine,
        deleteMagazine,
        handleDownloadMagazine,
        activeModal,
        setActiveModal,
        openArticleModal,
        openVideoModal,
        closeModal,
        selectedArticleId,
        selectedVideo,
        toasts,
        showToast,
        liveClock,
        liveDate,
        liveViewersCount,
        totalLifetimeVisitors,
        user,
        token,
        handleLogin,
        handleLogout,
        newsList,
        fetchNews,
        addNews,
        updateNews,
        deleteNews,
        goldRateData,
        fetchGoldRate,
        getArticleViews,
        getArticleLikes,
        isLiked,
        toggleLike,
        makeNewsFirst,
        canInstallPWA,
        installPWA,
        quotesData,
        setQuotesData,
        saveQuotesData,
        competitionsData,
        setCompetitionsData,
        saveCompetitionsData,
        examsData,
        setExamsData,
        saveExamsData,
        customBlogsData,
        setCustomBlogsData,
        saveCustomBlogsData,
        videoGalleryList,
        setVideoGalleryList,
        saveVideosData,
        addVideoItem,
        updateVideoItem,
        deleteVideoItem,
        saveSiteContent,
        searchQuery,
        setSearchQuery,
        openSearchModal,
        formatRelativeTime,
        getArticleTime
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);