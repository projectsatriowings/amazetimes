// Client API Service for Amaze Times

const API_BASE = '/api';

// Retrieve stored JWT token
export function getToken() {
  return localStorage.getItem('amaze_token') || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('amaze_token', token);
  } else {
    localStorage.removeItem('amaze_token');
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

  // Auth
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  getMe: () => request('/auth/me'),
  changePassword: (current_password, new_password) => request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password })
  }),

  // Articles
  getArticles: (params = {}) => {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'all') {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/articles${query ? `?${query}` : ''}`);
  },
  getArticle: (id) => request(`/articles/${id}`),
  createArticle: (articleData) => request('/articles', {
    method: 'POST',
    body: JSON.stringify(articleData)
  }),
  updateArticle: (id, articleData) => request(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(articleData)
  }),
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
  }
};
