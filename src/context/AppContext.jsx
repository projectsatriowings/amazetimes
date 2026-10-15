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
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('adutha_theme') || 'light');
  
  // Font scaling state
  const [fontSize, setFontSize] = useState('base');

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adutha_bookmarks') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Horoscope Data State
  const [horoscopeData, setHoroscopeData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_horoscope');
      return saved ? JSON.parse(saved) : defaultHoroscopeData;
    } catch (e) {
      return defaultHoroscopeData;
    }
  });

  // Panchangam Data State
  const [panchangamData, setPanchangamData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_panchangam');
      return saved ? JSON.parse(saved) : defaultPanchangamData;
    } catch (e) {
      return defaultPanchangamData;
    }
  });

  // Temple Festivals State
  const [templeFestivals, setTempleFestivals] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_temples');
      return saved ? JSON.parse(saved) : defaultTempleFestivals;
    } catch (e) {
      return defaultTempleFestivals;
    }
  });

  // Remedies State
  const [remediesData, setRemediesData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_remedies');
      return saved ? JSON.parse(saved) : defaultRemediesData;
    } catch (e) {
      return defaultRemediesData;
    }
  });

  // Spiritual Wisdom State
  const [spiritualWisdom, setSpiritualWisdom] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_wisdom');
      return saved ? JSON.parse(saved) : defaultSpiritualWisdom;
    } catch (e) {
      return defaultSpiritualWisdom;
    }
  });

  // Christian Spirituality State
  const [christianData, setChristianData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_christian');
      return saved ? JSON.parse(saved) : defaultChristianData;
    } catch (e) {
      return defaultChristianData;
    }
  });

  // Islamic Spirituality State
  const [islamicData, setIslamicData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_islamic');
      return saved ? JSON.parse(saved) : defaultIslamicData;
    } catch (e) {
      return defaultIslamicData;
    }
  });

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
  const [magazinesList, setMagazinesList] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_magazines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sortMagazinesChronological(parsed);
      }
    } catch (e) {}
    return sortMagazinesChronological(defaultMagazines);
  });

  useEffect(() => {
    const loadMagazinesFromDB = async () => {
      try {
        const res = await api.getMagazines();
        if (res && res.success && Array.isArray(res.data)) {
          const sorted = sortMagazinesChronological(res.data);
          setMagazinesList(sorted);
          try {
            localStorage.setItem('adutha_magazines', JSON.stringify(sorted));
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Backend magazine fetch error:', e);
      }
    };
    loadMagazinesFromDB();
  }, []);

  const [birthdayWishes, setBirthdayWishes] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_birthday');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultBirthdayWishes;
  });

  const [quotesData, setQuotesData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_quotes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultQuotesData;
  });

  const [competitionsData, setCompetitionsData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_competitions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultCompetitionsData;
  });

  const [examsData, setExamsData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_exams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultExamsData;
  });

  const [customBlogsData, setCustomBlogsData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_blogs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BLOG_ITEMS;
  });

  const [videoGalleryList, setVideoGalleryList] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultVideos;
  });

  // User Auth State
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('amaze_user') || localStorage.getItem('adutha_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('amaze_token') || localStorage.getItem('adutha_token') || '');

  // Dynamic News Articles State
  const [newsList, setNewsList] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_news_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [goldRateData, setGoldRateData] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_gold_rate');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const gold22k = Number(parsed.gold22k) || 13660;
          const gold24k = Number(parsed.gold24k) || 14902;
          const gold18k = Number(parsed.gold18k) || 11220;
          const silver = Number(parsed.silver) || 245;
          const updatedObj = {
            ...parsed,
            gold22k,
            gold24k,
            gold18k,
            silver,
            platinum: parsed.platinum || 3150,
            petrol: parsed.petrol || 100.75,
            diesel: parsed.diesel || 92.34
          };
          localStorage.setItem('adutha_gold_rate', JSON.stringify(updatedObj));
          return updatedObj;
        }
      }
    } catch (e) {}
    const defaultObj = {
      gold22k: 13660,
      gold24k: 14902,
      gold18k: 11220,
      silver: 245,
      platinum: 3450,
      petrol: 100.75,
      diesel: 92.34,
      changeAmount: 45,
      isUp: true,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('adutha_gold_rate', JSON.stringify(defaultObj));
    return defaultObj;
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

  // Real-time Unique Viewers Tracking State
  const [liveViewersCount, setLiveViewersCount] = useState(1);

  useEffect(() => {
    let visitorId = sessionStorage.getItem('adutha_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('adutha_visitor_id', visitorId);
    }

    let consecutiveFailures = 0;
    const sendHeartbeatPing = async () => {
      // If API server is unreachable, back off and avoid spamming console
      if (consecutiveFailures >= 2) return;
      try {
        const res = await api.sendHeartbeat(visitorId);
        if (res && res.success && typeof res.liveCount === 'number') {
          setLiveViewersCount(res.liveCount);
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
    localStorage.setItem('adutha_theme', theme);
  }, [theme]);

  // Sync bookmarks with localStorage
  useEffect(() => {
    localStorage.setItem('adutha_bookmarks', JSON.stringify(bookmarks));
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
        if (allContent.birthday && Array.isArray(allContent.birthday) && allContent.birthday.length > 0) setBirthdayWishes(allContent.birthday);
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

  const fetchNews = async () => {
    try {
      const res = await api.getNews({ limit: 500 });
      if (res && res.success && Array.isArray(res.data)) {
        const formatted = res.data.map(formatNewsAuthor);
        setNewsList(formatted);
        try {
          localStorage.setItem('adutha_news_list', JSON.stringify(formatted));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Backend news fetch error:', e);
    }
  };

  const addNews = async (newsData) => {
    try {
      const res = await api.createNews(newsData);
      if (res && res.success && res.data) {
        const dbItem = formatNewsAuthor({ ...res.data, _id: String(res.data._id || res.data.id), id: String(res.data.id || res.data._id) });
        setNewsList((prev) => {
          const next = [dbItem, ...prev.filter((n) => String(n.id || n._id) !== String(dbItem.id))];
          try {
            localStorage.setItem('adutha_news_list', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        showToast('செய்தி DB-யில் வெற்றிகரமாக சேமிக்கப்பட்டது!');
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
        setNewsList((prev) => {
          const next = prev.map((item) => (String(item.id || item._id) === idStr ? dbItem : item));
          try {
            localStorage.setItem('adutha_news_list', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        showToast('செய்தி DB-யில் புதுப்பிக்கப்பட்டது!');
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
        setNewsList((prev) => {
          const next = prev.filter((item) => String(item.id || item._id) !== idStr);
          try {
            localStorage.setItem('adutha_news_list', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        showToast('செய்தி DB-யிலிருந்து நீக்கப்பட்டது!');
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
      localStorage.setItem('adutha_token', 'demo-admin-token');
      localStorage.setItem('adutha_user', JSON.stringify(adminUser));
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
      localStorage.setItem('adutha_token', 'demo-reporter-token');
      localStorage.setItem('adutha_user', JSON.stringify(reporterUser));
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

  // Article Views & Likes State (100% Realtime, 0 Fake Seed Defaults)
  const [articleViews, setArticleViews] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_article_views');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed['1'] === 14280) {
          localStorage.removeItem('adutha_article_views');
          return {};
        }
        return parsed;
      }
      return {};
    } catch (e) {
      return {};
    }
  });

  const [articleLikes, setArticleLikes] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_article_likes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed['1'] === 1840) {
          localStorage.removeItem('adutha_article_likes');
          return {};
        }
        return parsed;
      }
      return {};
    } catch (e) {
      return {};
    }
  });

  const [userLikedIds, setUserLikedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_user_liked');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && (parsed.includes('1') || parsed.includes('5')) && parsed.length <= 2) {
          localStorage.removeItem('adutha_user_liked');
          return [];
        }
        return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('adutha_article_views', JSON.stringify(articleViews));
    } catch (e) {}
  }, [articleViews]);

  useEffect(() => {
    try {
      localStorage.setItem('adutha_article_likes', JSON.stringify(articleLikes));
    } catch (e) {}
  }, [articleLikes]);

  useEffect(() => {
    try {
      localStorage.setItem('adutha_user_liked', JSON.stringify(userLikedIds));
    } catch (e) {}
  }, [userLikedIds]);

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

  const toggleLike = (id, e) => {
    if (e) e.stopPropagation();
    if (!id) return;
    const targetId = typeof id === 'object' ? (id.id || id._id || 1) : id;
    const strId = String(targetId);
    const numId = Number(targetId);
    const alreadyLiked = isLiked(targetId);

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
  };

  const openArticleModal = (id) => {
    const targetId = typeof id === 'object' ? (id.id || id._id || 1) : id;
    setSelectedArticleId(targetId);
    setActiveModal('article');

    const strId = String(targetId);
    setArticleViews(prev => ({
      ...prev,
      [strId]: (getArticleViews(id) + 1)
    }));
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
    try {
      localStorage.setItem(`adutha_${key}`, JSON.stringify(data));
    } catch (e) {}
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
    try {
      localStorage.setItem('adutha_videos', JSON.stringify(videoGalleryList));
    } catch (e) {}
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
          try {
            localStorage.setItem('adutha_magazines', JSON.stringify(next));
          } catch (e) {}
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
          try {
            localStorage.setItem('adutha_magazines', JSON.stringify(next));
          } catch (e) {}
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
          try {
            localStorage.setItem('adutha_magazines', JSON.stringify(next));
          } catch (e) {}
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
      saveSiteContent('birthday', next);
      return next;
    });
    showToast('புதிய அரசு அதிகாரி பிறந்தநாள் வாழ்த்துப் பதிவு சேர்க்கப்பட்டது!');
  };

  const updateBirthdayOfficial = (id, updatedFields) => {
    setBirthdayWishes((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
      saveSiteContent('birthday', next);
      return next;
    });
    showToast('அதிகாரி விவரங்கள் புதுப்பிக்கப்பட்டன!');
  };

  const deleteBirthdayOfficial = (id) => {
    setBirthdayWishes((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveSiteContent('birthday', next);
      return next;
    });
    showToast('அதிகாரி பதிவு நீக்கப்பட்டது');
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
      saveSiteContent('birthday', next);
      return next;
    });
    showToast('🎉 உங்கள் மனமார்ந்த பிறந்தநாள் வாழ்த்துகள் பதிவு செய்யப்பட்டது!');
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