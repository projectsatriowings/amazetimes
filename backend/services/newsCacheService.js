/**
 * In-Memory News Caching & Real-Time SSE Multi-Device Sync Engine
 * Brand: Amaze Times
 * 
 * Provides sub-5ms news queries for all clients while broadcasting
 * 0ms zero-reload cache invalidation signals via Server-Sent Events (SSE).
 */

let globalNewsCache = null;
const categoryNewsCache = new Map();
let newsVersion = Date.now();
const sseClients = new Set();

/**
 * Retrieve cached default news feed
 * @returns {object|null}
 */
export const getCachedNews = () => {
  return globalNewsCache;
};

/**
 * Populate in-memory default news cache
 * @param {object} data
 */
export const setCachedNews = (data) => {
  globalNewsCache = data;
};

/**
 * Retrieve cached category news feed
 * @param {string} categoryKey
 * @returns {object|null}
 */
export const getCategoryCachedNews = (categoryKey) => {
  if (!categoryKey) return null;
  const entry = categoryNewsCache.get(categoryKey);
  if (!entry) return null;
  // 5-minute memory cache per category
  if (Date.now() - entry.time > 5 * 60 * 1000) {
    categoryNewsCache.delete(categoryKey);
    return null;
  }
  return entry.data;
};

/**
 * Populate in-memory category news cache
 * @param {string} categoryKey
 * @param {object} data
 */
export const setCategoryCachedNews = (categoryKey, data) => {
  if (!categoryKey) return;
  categoryNewsCache.set(categoryKey, { time: Date.now(), data });
};

/**
 * Get current news version timestamp
 * @returns {number}
 */
export const getNewsVersion = () => {
  return newsVersion;
};

/**
 * Invalidate in-memory news cache and notify all connected SSE clients
 * @param {'create'|'update'|'delete'|string} action
 * @param {object|null} article
 */
export const invalidateNewsCache = (action = 'update', article = null) => {
  globalNewsCache = null;
  categoryNewsCache.clear();
  newsVersion = Date.now();

  const payload = JSON.stringify({
    action,
    articleId: article ? (article.id || article._id) : null,
    article: article || null,
    version: newsVersion,
    timestamp: Date.now()
  });

  const message = `event: news_update\ndata: ${payload}\n\n`;

  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (_) {
      sseClients.delete(client);
    }
  });
};

/**
 * Register a client for live Server-Sent Events (SSE) streaming
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const registerSseClient = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (Nginx)

  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  // Initial handshake with current version
  const handshakeData = JSON.stringify({
    version: newsVersion,
    timestamp: Date.now(),
    connectedClients: sseClients.size + 1
  });
  res.write(`event: connected\ndata: ${handshakeData}\n\n`);

  sseClients.add(res);

  // Keep connection alive with heartbeat ping every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (_) {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
};

/**
 * Return number of connected SSE clients
 */
export const getSseClientsCount = () => {
  return sseClients.size;
};

export default {
  getCachedNews,
  setCachedNews,
  getCategoryCachedNews,
  setCategoryCachedNews,
  getNewsVersion,
  invalidateNewsCache,
  registerSseClient,
  getSseClientsCount
};
