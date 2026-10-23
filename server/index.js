import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDb } from './initDb.js';
import authRoutes from './routes/auth.js';
import reporterRoutes from './routes/reporters.js';
import newsRoutes from './routes/news.js';
import homeBuilderRoutes from './routes/homeBuilder.js';
import specialDaysRoutes from './routes/specialDays.js';
import socialMediaRoutes from './routes/socialMedia.js';
import tickerRoutes from './routes/ticker.js';
import livewireRoutes from './routes/livewire.js';
import epaperRoutes from './routes/epaper.js';
import shortsRoutes from './routes/shorts.js';
import audioRoutes from './routes/audio.js';
import pollRoutes from './routes/polls.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';
import marketRoutes from './routes/market.js';
import zodiacRoutes from './routes/zodiac.js';
import contentRoutes from './routes/content.js';
import magazineRoutes from './routes/magazines.js';
import ttsRoutes from './routes/ttsRoutes.js';

import fs from 'fs';
import { query } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// High capacity middleware: 100MB capacity for large e-papers and media
app.use(cors());

// Canonical URL & HTTPS 301 Permanent Redirection Middleware (SEO High Issue)
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const isWww = host.startsWith('www.');
  const proto = req.headers['x-forwarded-proto'] || req.protocol;

  // 1. Force apex non-www domain
  if (isWww) {
    const cleanHost = host.replace(/^www\./i, '');
    return res.redirect(301, `https://${cleanHost}${req.originalUrl || req.url}`);
  }

  // 2. Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && proto === 'http') {
    return res.redirect(301, `https://${host}${req.originalUrl || req.url}`);
  }

  next();
});

// Security & HSTS Headers (Resolves Strict-Transport-Security Test)
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', (req, res, next) => {
  req.url = '/users' + (req.url === '/' ? '' : req.url);
  authRoutes(req, res, next);
});
app.use('/api/reporters', reporterRoutes);

// Dual news & articles routing for full backwards and forward compatibility
app.use('/api/news', newsRoutes);
app.use('/api/articles', newsRoutes);

// Home Builder, Special Days & Social Media
app.use('/api/home-builder', homeBuilderRoutes);
app.use('/api/special-days', specialDaysRoutes);
app.use('/api/social-media', socialMediaRoutes);

// Other Content and Interactive Hub Routes
app.use('/api/ticker', tickerRoutes);
app.use('/api/livewire', livewireRoutes);
app.use('/api/epaper', epaperRoutes);
app.use('/api/shorts', shortsRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/zodiac', zodiacRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/magazines', magazineRoutes);
app.use('/api/tts', ttsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Amaze Times Neon API Engine',
    database: 'Neon PostgreSQL Resilient Pooler'
  });
});

// Centralized error handler (including 413 Payload Too Large)
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: 'பதிவேற்றப்படும் கோப்பின் அளவு அனுமதிக்கப்பட்ட வரம்பை தாண்டியுள்ளது (100MB Max Payload).'
    });
  }
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'உள் சேவையகப் பிழை (Internal Server Error)'
  });
});

// Dynamic XML Sitemap for Search Engine Crawlers & AI Bots
app.get('/sitemap.xml', async (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  try {
    const result = await query(
      `SELECT id, category, published_at FROM news WHERE status = 'published' ORDER BY published_at DESC LIMIT 500`
    );

    const baseUrl = 'https://amazetimes.com';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    // Core Categories
    const categories = ['tamilnadu', 'districts', 'business', 'cinema', 'sports', 'spiritual', 'editorial', 'magazine'];
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    categories.forEach(cat => {
      xml += `  <url>\n    <loc>${baseUrl}/?category=${cat}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    });

    if (result && result.rows) {
      result.rows.forEach(article => {
        const lastMod = article.published_at ? new Date(article.published_at).toISOString() : now;
        xml += `  <url>\n    <loc>${baseUrl}/?article=${article.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });
    }

    xml += `</urlset>`;
    return res.send(xml);
  } catch (err) {
    console.warn('⚠️ [Sitemap] Could not query database, serving fallback static sitemap:', err?.message || err);
    const staticSitemap = path.join(__dirname, '../public/sitemap.xml');
    if (fs.existsSync(staticSitemap)) {
      return res.sendFile(staticSitemap);
    }
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

// Explicit Favicon Routes with Exact MIME Types (Resolves Favicon Test)
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const icoPath = path.join(publicPath, 'favicon.ico');
  if (fs.existsSync(icoPath)) return res.sendFile(icoPath);
  res.status(204).end();
});

app.get('/favicon.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(publicPath, 'favicon.svg'));
});

app.get('/favicon.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(publicPath, 'favicon.png'));
});

app.get('/apple-touch-icon.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(publicPath, 'apple-touch-icon.png'));
});

// Explicit Robots.txt and Ads.txt Route Handlers with Correct MIME Types
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(publicPath, 'robots.txt'));
});

app.get('/ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(publicPath, 'ads.txt'));
});

// Serve static frontend in production (dist directory) with Far-Future Caching
const distPath = path.join(__dirname, '../dist');
const publicPath = path.join(__dirname, '../public');

const staticCacheOptions = {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (filePath.match(/\.(js|css|woff2|woff|ttf)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.match(/\.(jpg|jpeg|png|webp|svg|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }
  }
};

app.use(express.static(publicPath, staticCacheOptions));
app.use(express.static(distPath, staticCacheOptions));

// Valid known frontend routes (including categories and parameters)
const validStaticRoutes = new Set([
  '/',
  '/admin',
  '/login',
  '/robots.txt',
  '/sitemap.xml',
  '/ads.txt',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/manifest.json',
  '/sw.js',
  '/404',
  '/404.html'
]);

// SPA Routing & Custom 404 Status Handler (Eliminates Soft 404 Error)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/assets')) {
    return next();
  }

  const cleanPath = req.path.toLowerCase().replace(/\/$/, '') || '/';
  const isKnownRoute =
    validStaticRoutes.has(cleanPath) ||
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/category') ||
    cleanPath.startsWith('/news') ||
    cleanPath.startsWith('/article');

  if (isKnownRoute) {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.sendFile(path.join(__dirname, '../index.html'));
  }

  // Truly Unknown / Missing URL: Respond with genuine HTTP 404 and branded custom 404 template
  res.status(404);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const dist404 = path.join(distPath, '404.html');
  const custom404 = path.join(publicPath, '404.html');
  if (fs.existsSync(dist404)) {
    return res.sendFile(dist404);
  }
  if (fs.existsSync(custom404)) {
    return res.sendFile(custom404);
  }
  return res.send('<!DOCTYPE html><html lang="ta"><head><title>404 - பக்கம் கிடைக்கவில்லை | Amaze Times</title></head><body><h1>404 Not Found</h1></body></html>');
});

// Initialize database schema and start server on standard port 5000 bound to 0.0.0.0
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Amaze Times Express API Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Connected to Neon PostgreSQL pooler (auto-reconnect enabled)`);
    console.log(`📁 Uploads available at http://localhost:${PORT}/uploads`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database on startup:', err);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Amaze Times Express API Server running on http://0.0.0.0:${PORT} (fallback mode)`);
  });
});

export default app;
