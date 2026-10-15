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

// Retrieve stored JWT token with role-aware separation
export function getToken() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path.startsWith('/admin')) {
    return localStorage.getItem('amaze_admin_token') || localStorage.getItem('amaze_token') || localStorage.getItem('amaze_reader_token') || null;
  }
  return localStorage.getItem('amaze_token') || localStorage.getItem('amaze_reader_token') || localStorage.getItem('amaze_admin_token') || null;
}

export function getAdminToken() {
  return localStorage.getItem('amaze_admin_token') || localStorage.getItem('amaze_token') || null;
}

export function getReaderToken() {
  return localStorage.getItem('amaze_reader_token') || localStorage.getItem('amaze_token') || null;
}

export function setToken(token, role = 'reader') {
  if (token) {
    if (role === 'admin' || role === 'reporter') {
      localStorage.setItem('amaze_admin_token', token);
      localStorage.setItem('amaze_token', token);
    } else {
      localStorage.setItem('amaze_reader_token', token);
      if (!localStorage.getItem('amaze_admin_token')) {
        localStorage.setItem('amaze_token', token);
      }
    }
  } else {
    localStorage.removeItem('amaze_token');
    localStorage.removeItem('amaze_reader_token');
    localStorage.removeItem('amaze_admin_token');
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('amaze_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('amaze_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('amaze_user');
  }
}

// Generate or retrieve persistent visitor UUID
export function getVisitorId() {
  let vid = localStorage.getItem('amaze_visitor_id');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    localStorage.setItem('amaze_visitor_id', vid);
  }
  return vid;
}

// Reader (Google / Public) User helpers
export function getReaderUser() {
  try {
    const raw = localStorage.getItem('amaze_reader_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setReaderUser(user) {
  if (user) {
    localStorage.setItem('amaze_reader_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('amaze_reader_user');
  }
}

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
      // Clear stale/expired token to avoid spamming 401 errors
      setToken(null);
      setCurrentUser(null);
      window.dispatchEvent(new CustomEvent('amaze:auth_expired'));
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Visitor Tracking
  trackVisitor: (deviceType) => request('/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ visitor_id: getVisitorId(), device_type: deviceType })
  }),

  // Analytics Stats (Admin / Reporter)
  getDashboardStats: () => request('/analytics/dashboard-stats'),

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

  // Articles & News Aliases
  getArticles: async (params = {}) => {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'all') {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    const res = await request(`/articles${query ? `?${query}` : ''}`);
    if (res && res.articles && !res.data) {
      res.data = res.articles;
    }
    return res;
  },
  getNews: function(params = {}) { return this.getArticles(params); },
  getNewsStats: async function() {
    try {
      const res = await this.getDashboardStats();
      if (res && res.success && res.data) {
        return {
          success: true,
          stats: {
            totalNews: res.data.articles?.total || 0,
            publishedNews: res.data.articles?.published || 0,
            pendingNews: res.data.articles?.pending || 0,
            draftNews: res.data.articles?.draft || 0
          },
          data: res.data
        };
      }
    } catch (_) {}
    return { success: false, stats: { totalNews: 0, publishedNews: 0, pendingNews: 0, draftNews: 0 } };
  },
  getGoldRate: async function() {
    try {
      const res = await request('/market');
      if (res && res.rates) {
        return {
          success: true,
          data: {
            gold22k_1g: res.rates.gold_22k || 7280,
            gold22k_8g: (res.rates.gold_22k || 7280) * 8,
            gold24k_1g: res.rates.gold_24k || 7940,
            gold24k_8g: (res.rates.gold_24k || 7940) * 8,
            silver1g: res.rates.silver_1g || 98.5,
            silver1kg: res.rates.silver_1kg || 98500
          }
        };
      }
    } catch (_) {}
    return { success: false, data: null };
  },
  getArticle: (id) => request(`/articles/${id}`),
  createArticle: (articleData) => request('/articles', {
    method: 'POST',
    body: JSON.stringify(articleData)
  }),
  addNews: function(data) { return this.createArticle(data); },
  updateArticle: (id, articleData) => request(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(articleData)
  }),
  updateNews: function(id, data) { return this.updateArticle(id, data); },
  deleteArticle: (id) => request(`/articles/${id}`, {
    method: 'DELETE'
  }),
  deleteNews: function(id) { return this.deleteArticle(id); },
  updateArticleStatus: (id, status, rejection_reason = '') => request(`/articles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejection_reason })
  }),
  deleteArticle: (id) => request(`/articles/${id}`, {
    method: 'DELETE'
  }),

  // Reporters (Admin only)
  getReporters: () => request('/reporters'),
  createReporter: (reporterData) => request('/reporters', {
    method: 'POST',
    body: JSON.stringify(reporterData)
  }),
  updateReporter: (id, reporterData) => request(`/reporters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reporterData)
  }),
  deleteReporter: (id) => request(`/reporters/${id}`, {
    method: 'DELETE'
  }),

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
  createEPaper: (epaperData) => request('/epaper', {
    method: 'POST',
    body: JSON.stringify(epaperData)
  }),
  deleteEPaper: (id) => request(`/epaper/${id}`, {
    method: 'DELETE'
  }),

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

  // Market Rates (Sensex, Nifty, Gold)
  getMarketRates: () => request('/market'),

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

  // File Upload
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
    if (!res.ok) throw new Error(data.message || 'File upload failed');
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

  // Epaper APIs
  getEpapers: () => request('/epaper').catch(() => ({ epapers: [] })),
  createEpaper: (data) => request('/epaper', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  updateEpaper: (id, data) => request(`/epaper/${id}`, { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  deleteEpaper: (id) => request(`/epaper/${id}`, { method: 'DELETE' }).catch(() => ({ success: true })),

  // Magazine APIs
  getMagazines: () => request('/magazines').catch(() => ({ magazines: [] })),
  createMagazine: (data) => request('/magazines', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  updateMagazine: (id, data) => request(`/magazines/${id}`, { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  deleteMagazine: (id) => request(`/magazines/${id}`, { method: 'DELETE' }).catch(() => ({ success: true })),

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
  }
};

