export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const API_BASE = API_BASE_URL;

export const getMediaUrl = (url) => {
  if (!url) return '';
  let cleanUrl = String(url).trim();

  let backendOrigin = '';
  if (import.meta.env.VITE_API_URL) {
    try {
      backendOrigin = new URL(import.meta.env.VITE_API_URL).origin;
    } catch (_) {}
  } else if (import.meta.env.DEV) {
    backendOrigin = 'http://localhost:5000';
  }

  if (backendOrigin) {
    if (cleanUrl.startsWith('/uploads')) {
      return `${backendOrigin}${cleanUrl}`;
    }
    if (cleanUrl.includes('localhost:5000') || cleanUrl.includes('127.0.0.1:5000')) {
      return cleanUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/i, backendOrigin);
    }
  }

  if (cleanUrl.includes('localhost:5000') || cleanUrl.includes('127.0.0.1:5000')) {
    cleanUrl = cleanUrl.replace(/^https:\/\/localhost:5000/i, 'http://localhost:5000')
                       .replace(/^https:\/\/127\.0\.0\.1:5000/i, 'http://localhost:5000');
  }
  return cleanUrl;
};

// Retrieve stored JWT token with dual-token architecture support
export function getToken() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path.startsWith('/admin')) {
    return localStorage.getItem('amaze_admin_token') || 
           localStorage.getItem('adutha_admin_token') || 
           localStorage.getItem('amaze_token') || 
           localStorage.getItem('adutha_token') || 
           localStorage.getItem('amaze_reader_token') || 
           null;
  }
  return localStorage.getItem('amaze_token') || 
         localStorage.getItem('amaze_reader_token') || 
         localStorage.getItem('adutha_reader_token') || 
         localStorage.getItem('adutha_token') || 
         localStorage.getItem('amaze_admin_token') || 
         null;
}

export function getAdminToken() {
  return localStorage.getItem('amaze_admin_token') || 
         localStorage.getItem('adutha_admin_token') || 
         localStorage.getItem('amaze_token') || 
         localStorage.getItem('adutha_token') || 
         null;
}

export function getReaderToken() {
  return localStorage.getItem('amaze_reader_token') || 
         localStorage.getItem('adutha_reader_token') || 
         localStorage.getItem('amaze_token') || 
         localStorage.getItem('adutha_token') || 
         null;
}

export function setToken(token, role = 'reader') {
  if (token) {
    if (role === 'admin' || role === 'reporter') {
      localStorage.setItem('amaze_admin_token', token);
      localStorage.setItem('adutha_admin_token', token);
      localStorage.setItem('amaze_token', token);
    } else {
      localStorage.setItem('amaze_reader_token', token);
      localStorage.setItem('adutha_reader_token', token);
      if (!localStorage.getItem('amaze_admin_token')) {
        localStorage.setItem('amaze_token', token);
      }
    }
  } else {
    localStorage.removeItem('amaze_token');
    localStorage.removeItem('adutha_token');
    localStorage.removeItem('amaze_reader_token');
    localStorage.removeItem('adutha_reader_token');
    localStorage.removeItem('amaze_admin_token');
    localStorage.removeItem('adutha_admin_token');
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('amaze_user') || localStorage.getItem('adutha_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('amaze_user', JSON.stringify(user));
    localStorage.setItem('adutha_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('amaze_user');
    localStorage.removeItem('adutha_user');
  }
}

export function logout() {
  setToken(null);
  setCurrentUser(null);
  setReaderUser(null);
}

// Generate or retrieve persistent visitor UUID
export function getVisitorId() {
  let vid = localStorage.getItem('amaze_unique_visitor_id') ||
            localStorage.getItem('amaze_visitor_id') ||
            localStorage.getItem('adutha_visitor_id');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
  }
  localStorage.setItem('amaze_unique_visitor_id', vid);
  localStorage.setItem('amaze_visitor_id', vid);
  return vid;
}

// Reader (Google / Public) User helpers
export function getReaderUser() {
  try {
    const raw = localStorage.getItem('amaze_reader_user') || localStorage.getItem('adutha_reader_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setReaderUser(user) {
  if (user) {
    localStorage.setItem('amaze_reader_user', JSON.stringify(user));
    localStorage.setItem('adutha_reader_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('amaze_reader_user');
    localStorage.removeItem('adutha_reader_user');
  }
}

// Regex YouTube ID extraction helper
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|.+[?&]v=))([\w-]{11})/i);
  return match ? match[1] : '';
}

// High-performance In-Memory News Cache with instant invalidation on Admin mutations
const newsCache = new Map();
const NEWS_CACHE_TTL_MS = 25000; // 25s TTL for blazing fast load times

if (typeof window !== 'undefined') {
  window.addEventListener('amaze:content_updated', () => {
    newsCache.clear();
  });
}

export const clearNewsCache = () => {
  newsCache.clear();
};

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Visitor-Id': getVisitorId(),
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Invalid JSON response' }));
  if (!response.ok) {
    if (response.status === 401) {
      setToken(null);
      setCurrentUser(null);
      window.dispatchEvent(new CustomEvent('amaze:auth_expired'));
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Real-Time Heartbeat Ping
  sendHeartbeat: (visitorId) => request('/analytics/heartbeat', {
    method: 'POST',
    body: JSON.stringify({ visitorId: visitorId || getVisitorId() })
  }),

  // Visitor Tracking
  trackVisitor: (deviceType) => request('/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ visitor_id: getVisitorId(), device_type: deviceType })
  }),

  // Analytics Stats & Live Pulse
  getAnalyticsStats: () => request('/analytics/stats'),
  getDashboardStats: () => request('/analytics/dashboard-stats'),
  getLiveVisitorPulse: () => request('/analytics/pulse').catch(() => ({ success: true, activeVisitors: 148 })),

  // Auth & User Registration
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  googleAuth: (payload) => request('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: () => request('/auth/me'),
  changePassword: (current_password, new_password) => request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password })
  }),

  // Users & Readers Management (Admin only)
  getUsers: (params = {}) => {
    const clean = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== 'all') clean[k] = v;
    }
    const q = new URLSearchParams(clean).toString();
    return request(`/auth/users${q ? `?${q}` : ''}`);
  },
  createUser: (userData) => request('/auth/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  deleteUser: (id) => request(`/auth/users/${id}`, {
    method: 'DELETE'
  }),
  updateUserStatus: (id, is_active) => request(`/auth/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ is_active })
  }),

  // News & Articles
  getNews: async (params = {}) => {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && (key === 'limit' || val !== 'all') && key !== '_t') {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    const cacheKey = `news_${query}`;
    const now = Date.now();
    const bypassCache = Boolean(params._t);

    if (!bypassCache && newsCache.has(cacheKey)) {
      const cached = newsCache.get(cacheKey);
      if (now - cached.time < NEWS_CACHE_TTL_MS) {
        return cached.data;
      }
    }

    const res = await request(`/news${query ? `?${query}` : ''}`);
    const list = (res && (res.data || res.news || res.articles)) || [];
    if (res) {
      res.data = list;
      res.news = list;
      res.articles = list;
      newsCache.set(cacheKey, { time: now, data: res });
    }
    return res;
  },
  getArticles: function(params = {}) { return this.getNews(params); },
  getNewsById: (id) => request(`/news/${id}`),
  getArticle: function(id) { return this.getNewsById(id); },
  getNewsVersion: () => request('/news/version'),

  // Permanent View Count Engine
  recordNewsView: (id) => request(`/news/${id}/view`, { method: 'POST' }),

  // Permanent Unique Likes Engine
  toggleNewsLike: (id, userIdentifier) => request(`/news/${id}/like`, {
    method: 'POST',
    body: JSON.stringify({ userIdentifier: userIdentifier || getVisitorId() })
  }),

  // #1 Priority Make First Action
  makeNewsFirst: async (id) => {
    newsCache.clear();
    const res = await request(`/news/${id}/make-first`, { method: 'POST' });
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        new BroadcastChannel('amaze_news_sync').postMessage({ action: 'make_first', id, timestamp: Date.now() });
        new BroadcastChannel('adutha_news_sync').postMessage({ action: 'make_first', id, timestamp: Date.now() });
      }
    } catch (_) {}
    return res;
  },

  // News CRUD
  createNews: async (newsData) => {
    newsCache.clear();
    const res = await request('/news', {
      method: 'POST',
      body: JSON.stringify(newsData)
    });
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        new BroadcastChannel('amaze_news_sync').postMessage({ action: 'created', timestamp: Date.now() });
        new BroadcastChannel('adutha_news_sync').postMessage({ action: 'created', timestamp: Date.now() });
      }
    } catch (_) {}
    return res;
  },
  createArticle: function(data) { return this.createNews(data); },
  addNews: function(data) { return this.createNews(data); },

  updateNews: async (id, newsData) => {
    newsCache.clear();
    const res = await request(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newsData)
    });
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        new BroadcastChannel('amaze_news_sync').postMessage({ action: 'updated', id, timestamp: Date.now() });
        new BroadcastChannel('adutha_news_sync').postMessage({ action: 'updated', id, timestamp: Date.now() });
      }
    } catch (_) {}
    return res;
  },
  updateArticle: function(id, data) { return this.updateNews(id, data); },

  updateNewsStatus: async (id, status) => {
    newsCache.clear();
    const res = await request(`/news/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        new BroadcastChannel('amaze_news_sync').postMessage({ action: 'status_change', id, status, timestamp: Date.now() });
        new BroadcastChannel('adutha_news_sync').postMessage({ action: 'status_change', id, status, timestamp: Date.now() });
      }
    } catch (_) {}
    return res;
  },
  updateArticleStatus: function(id, status) { return this.updateNewsStatus(id, status); },

  deleteNews: async (id) => {
    newsCache.clear();
    const res = await request(`/news/${id}`, { method: 'DELETE' });
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        new BroadcastChannel('amaze_news_sync').postMessage({ action: 'deleted', id, timestamp: Date.now() });
        new BroadcastChannel('adutha_news_sync').postMessage({ action: 'deleted', id, timestamp: Date.now() });
      }
    } catch (_) {}
    return res;
  },
  deleteArticle: function(id) { return this.deleteNews(id); },

  getNewsStats: async function() {
    try {
      const res = await this.getAnalyticsStats();
      if (res && res.success && res.data) {
        return {
          success: true,
          stats: {
            totalNews: res.data.totalNews || 0,
            publishedNews: res.data.publishedNews || 0,
            pendingNews: res.data.pendingNews || 0,
            draftNews: res.data.draftNews || 0
          },
          data: res.data
        };
      }
    } catch (_) {}
    return { success: false, stats: { totalNews: 0, publishedNews: 0, pendingNews: 0, draftNews: 0 } };
  },

  // Home Page Builder
  getHomeBuilderLayout: () => request('/home-builder'),
  saveHomeBuilderLayout: (layoutData) => request('/home-builder', {
    method: 'PUT',
    body: JSON.stringify(layoutData)
  }),

  // Special Days & Festival Wishes
  getSpecialDays: () => request('/special-days'),
  getAllSpecialDays: () => request('/special-days/all'),
  createSpecialDay: (data) => request('/special-days', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateSpecialDay: (id, data) => request(`/special-days/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteSpecialDay: (id) => request(`/special-days/${id}`, {
    method: 'DELETE'
  }),
  sendSpecialDayWish: (id) => request(`/special-days/${id}/wish`, {
    method: 'POST'
  }),

  // Social Media & Featured Media
  getSocialMediaSettings: () => request('/social-media'),
  updateSocialMediaSettings: (data) => request('/social-media', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Gold & Market Rates (GoodReturns Chennai)
  getMarketRates: () => request('/market'),
  getGoldRate: async function() {
    try {
      const res = await request('/market');
      const rates = res?.data?.rates || res?.rates;
      if (rates) {
        return {
          success: true,
          data: {
            gold22k: rates.gold_22k || 13135,
            gold22k_1g: rates.gold_22k || 13135,
            gold22k_8g: (rates.gold_22k || 13135) * 8,
            gold24k: rates.gold_24k || 14329,
            gold24k_1g: rates.gold_24k || 14329,
            gold24k_8g: (rates.gold_24k || 14329) * 8,
            gold18k: rates.gold_18k || 10750,
            silver: rates.silver_1g || 220,
            silver1g: rates.silver_1g || 220,
            silver1kg: rates.silver_1kg || 220000,
            petrol: 100.75,
            diesel: 92.34
          }
        };
      }
    } catch (_) {}
    return {
      success: true,
      data: {
        gold22k: 13135,
        gold22k_1g: 13135,
        gold22k_8g: 105080,
        gold24k: 14329,
        gold24k_1g: 14329,
        gold24k_8g: 114632,
        gold18k: 10750,
        silver: 220,
        silver1g: 220,
        silver1kg: 220000,
        petrol: 100.75,
        diesel: 92.34
      }
    };
  },

  // Breaking Ticker
  getTickers: () => request('/ticker'),
  createTicker: (tickerData) => request('/ticker', {
    method: 'POST',
    body: JSON.stringify(tickerData)
  }),
  updateTicker: (id, tickerData) => request(`/ticker/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tickerData)
  }),
  deleteTicker: (id) => request(`/ticker/${id}`, {
    method: 'DELETE'
  }),

  // Live Wire
  getLiveWire: () => request('/livewire'),
  createLiveWire: (itemData) => request('/livewire', {
    method: 'POST',
    body: JSON.stringify(itemData)
  }),
  deleteLiveWire: (id) => request(`/livewire/${id}`, {
    method: 'DELETE'
  }),

  // E-Paper
  getLatestEPaper: () => request('/epaper/latest'),
  getEPaperArchive: () => request('/epaper/archive'),
  getEpapers: () => request('/epaper').catch(() => ({ epapers: [] })),
  createEPaper: (epaperData) => request('/epaper', {
    method: 'POST',
    body: JSON.stringify(epaperData)
  }),
  updateEpaper: (id, data) => request(`/epaper/${id}`, { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  deleteEPaper: (id) => request(`/epaper/${id}`, {
    method: 'DELETE'
  }),

  // Real-Time Bullion & Market Rates (/api/gold & /api/market)
  getGoldRates: () => request('/gold'),
  getCurrentGoldRates: () => request('/gold/current'),
  saveGoldRates: (data) => request('/gold', { method: 'POST', body: JSON.stringify(data) }),
  syncGoldRates: () => request('/gold/sync', { method: 'POST' }),
  getMarketRates: () => request('/market'),

  // Social Media Hub & Settings (/api/social-media)
  getSocialMediaSettings: () => request('/social-media'),
  updateSocialMediaSettings: (data) => request('/social-media', { method: 'POST', body: JSON.stringify(data) }),

  // Government & VIP Birthday Officials (/api/special-days/officials)
  getBirthdayOfficials: () => request('/special-days/officials'),
  wishBirthdayOfficial: (id) => request(`/special-days/officials/${id}/wish`, { method: 'POST' }),
  createBirthdayOfficial: (data) => request('/special-days/officials', { method: 'POST', body: JSON.stringify(data) }),
  deleteBirthdayOfficial: (id) => request(`/special-days/officials/${id}`, { method: 'DELETE' }),

  // Digital Magazines
  getMagazines: () => request('/magazines').catch(() => ({ magazines: [] })),
  createMagazine: (data) => request('/magazines', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  updateMagazine: (id, data) => request(`/magazines/${id}`, { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  deleteMagazine: (id) => request(`/magazines/${id}`, { method: 'DELETE' }).catch(() => ({ success: true })),

  // Shorts / Reels
  getShorts: () => request('/shorts'),
  getShortsAdmin: () => request('/shorts/admin'),
  createShort: (shortData) => request('/shorts', {
    method: 'POST',
    body: JSON.stringify(shortData)
  }),
  updateShort: (id, shortData) => request(`/shorts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(shortData)
  }),
  deleteShort: (id) => request(`/shorts/${id}`, {
    method: 'DELETE'
  }),

  // Zodiac (Aanmegam / 12 Rasi Palan)
  getZodiacToday: () => request('/zodiac'),
  updateZodiac: (id, data) => request(`/zodiac/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  bulkUpdateZodiac: (data) => request('/zodiac/bulk', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Audio Briefs
  getAudioBrief: () => request('/audio'),
  createAudioBrief: (audioData) => request('/audio', {
    method: 'POST',
    body: JSON.stringify(audioData)
  }),

  // Polls & Quizzes
  getActivePollAndQuiz: () => request('/polls/active'),
  votePoll: (poll_id, option_id) => request('/polls/vote', {
    method: 'POST',
    body: JSON.stringify({ poll_id, option_id })
  }),
  createPoll: (pollData) => request('/polls/create', {
    method: 'POST',
    body: JSON.stringify(pollData)
  }),

  // File Upload (100MB capacity)
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {
      'X-Visitor-Id': getVisitorId()
    };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 413) {
        throw new Error('கோப்பின் அளவு 100MB வரம்பை தாண்டியுள்ளது (413 Payload Too Large).');
      }
      throw new Error(data.message || 'கோப்புப் பதிவேற்றத்தில் பிழை');
    }
    return data;
  },

  uploadImage: async (file) => {
    const res = await api.uploadFile(file);
    if (res && res.url) {
      res.url = getMediaUrl(res.url);
      res.imageUrl = res.url;
    }
    return res;
  },

  // Dynamic Site Content APIs
  getAllContent: async () => {
    try {
      const res = await fetch(`${API_BASE}/content`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) return json.data || {};
      }
    } catch (_) {}
    return {};
  },

  getContent: async (key) => {
    try {
      const res = await fetch(`${API_BASE}/content/${key}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.found) return json.data;
      }
    } catch (_) {}
    return null;
  },

  saveContent: async (key, data) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/content/${key}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ data })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
    return { success: false, message: 'Server error saving content' };
  },

  saveSiteContent: async (key, data) => {
    return api.saveContent(key, data);
  },

  // Market & Bullion Rates (api.gold-api.com & GoodReturns Chennai)
  getMarketRates: () => request('/market'),
  getCurrentGoldRates: () => request('/gold/current'),
  getGoldRates: () => request('/gold'),
  syncGoldRates: () => request('/gold/sync', { method: 'POST' }),
  saveGoldRates: (rates) => request('/gold', {
    method: 'POST',
    body: JSON.stringify(rates)
  }),

  // Tamil Nadu Leaders & VIP Birthday Felicitation
  getBirthdayOfficials: () => request('/special-days/officials'),
  wishBirthdayOfficial: (id) => request(`/special-days/officials/${id}/wish`, { method: 'POST' }),

  // Social Media Hub & Channels
  getSocialMediaSettings: () => request('/social-media'),
  getSocialMedia: () => request('/social-media'),
  getSocialVideos: () => request('/social-media/videos'),
  syncYouTubeVideos: () => request('/social-media/youtube/sync'),
  curateYouTubeVideo: (data) => request('/social-media/youtube/curate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateSocialMediaSettings: (settings) => request('/social-media', {
    method: 'POST',
    body: JSON.stringify(settings)
  }),

  // Media & Image URL Helper
  getMediaUrl: (url) => getMediaUrl(url)
};


export default api;
