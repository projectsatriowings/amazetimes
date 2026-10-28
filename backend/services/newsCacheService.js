/**
 * In-Memory News Caching & Real-Time SSE Multi-Device Sync Engine
 * Brand: Amaze Times
 * 
 * Provides sub-5ms news queries for all clients while broadcasting
 * 0ms zero-reload cache invalidation signals via Server-Sent Events (SSE).
 */

let globalNewsCache = null;
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
 * Populate in-memory news cache
 * @param {object} data
 */
export const setCachedNews = (data) => {
  globalNewsCache = data;
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
  getNewsVersion,
  invalidateNewsCache,
  registerSseClient,
  getSseClientsCount
};
