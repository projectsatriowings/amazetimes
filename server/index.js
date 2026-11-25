import compression from 'compression';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sharp from 'sharp';

import { initDb } from './initDb.js';
import authRoutes from './routes/auth.js';
import reporterRoutes from './routes/reporters.js';
import newsRoutes, { warmNewsCache } from './routes/news.js';
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
import goldRoutes from './routes/gold.js';
import competitionRoutes from './routes/competitions.js';
import amazetimesReaderRoutes from './routes/amazetimesReader.js';
import { fetchAndSyncMarketRates } from './services/marketRateService.js';
import { renderSeoHtml, buildArticleHref } from './services/seoRenderer.js';

import fs from 'fs';
import { query, closeDb } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const HOST = '0.0.0.0';
const PORT = parseInt(process.env.PORT || '5000', 10);
let server = null;

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down Amaze Times cleanly...`);
  try {
    await closeDb();
  } catch (err) {
    console.warn('Error during closeDb:', err);
  }
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Prevent unhandled rejections and socket aborts from crashing Node into PM2 restart loops
process.on('unhandledRejection', (reason) => {
  console.warn('⚠️ [Process] Unhandled Rejection intercepted:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ [Process] Uncaught Exception intercepted:', err?.message || err);
});

// High capacity middleware: 100MB capacity for large e-papers and media
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Canonical URL & HTTPS 301 Permanent Redirection Middleware (SEO High Issue)
app.use(async (req, res, next) => {
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
app.use(async (req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://pagead2.googlesyndication.com https://www.youtube.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
    "connect-src 'self' https: wss: http://localhost:* http://127.0.0.1:*",
    "media-src 'self' data: blob: https: http:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.instagram.com https://www.facebook.com https://platform.twitter.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'"
  ];
  if (process.env.NODE_ENV === 'production') {
    cspDirectives.push('upgrade-insecure-requests');
  }
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  next();
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
app.get('/uploads/:filename', async (req, res) => {
  try {
    const filename = path.basename(req.params.filename || '');
    if (!filename) return res.status(404).end();
    const remoteUrl = `https://amazetimes.com/uploads/${encodeURIComponent(filename)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const r = await fetch(remoteUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (r.ok) {
      let ct = r.headers.get('content-type') || 'image/png';
      let buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 95000 && ct.startsWith('image/') && !ct.includes('svg')) {
        try {
          buf = await sharp(buf)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
          ct = 'image/webp';
        } catch (_) {}
      }
      res.setHeader('Content-Type', ct);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buf);
    }
  } catch (_) {}
  const fallbackImg = path.join(__dirname, '../public/Amaze times.jpg');
  if (fs.existsSync(fallbackImg)) {
    res.setHeader('Content-Type', 'image/jpeg');
    return res.sendFile(fallbackImg);
  }
  return res.status(404).end();
});

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
app.use('/api/gold', goldRoutes);
app.use('/api/zodiac', zodiacRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/magazines', magazineRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/amazetimes', amazetimesReaderRoutes);

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
    const categories = ['tamilnadu', 'politics', 'districts', 'business', 'cinema', 'sports', 'india', 'world', 'spiritual', 'editorial', 'epaper', 'magazine'];
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    categories.forEach(cat => {
      xml += `  <url>\n    <loc>${baseUrl}/category/${cat}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    });

    if (result && result.rows) {
      result.rows.forEach(article => {
        const lastMod = article.published_at ? new Date(article.published_at).toISOString() : now;
        xml += `  <url>\n    <loc>${baseUrl}${buildArticleHref(article)}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
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
app.get(['/Amaze times.jpg', '/Amaze%20times.jpg'], (req, res) => {
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(publicPath, 'Amaze times.jpg'));
});

app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const icoPath = path.join(publicPath, 'favicon.ico');
  if (fs.existsSync(icoPath)) return res.sendFile(icoPath);
  res.status(204).end();
});

app.get(['/favicon.svg', '/icon.svg'], (req, res) => {
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

app.get(['/og-image.jpg', '/og-image.png'], (req, res) => {
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(publicPath, 'og-image.jpg'));
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

app.use(express.static(publicPath, { ...staticCacheOptions, index: false }));
app.use(express.static(distPath, { ...staticCacheOptions, index: false }));

// Valid known frontend routes (including categories and parameters)
const validStaticRoutes = new Set([
  '/',
  '/admin',
  '/login',
  '/social-media',
  '/robots.txt',
  '/sitemap.xml',
  '/ads.txt',
  '/googled830f38830b0a3b5.html',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/manifest.json',
  '/sw.js',
  '/404',
  '/404.html'
]);

// Google Search Console Site Verification File (Direct Route)
app.get('/google:id.html', (req, res) => {
  const fileName = `google${req.params.id}.html`;
  const filePathPublic = path.join(publicPath, fileName);
  const filePathDist = path.join(distPath, fileName);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  if (fs.existsSync(filePathPublic)) {
    return res.sendFile(filePathPublic);
  }
  if (fs.existsSync(filePathDist)) {
    return res.sendFile(filePathDist);
  }
  res.send(`google-site-verification: ${fileName}`);
});

// SPA Routing & Custom 404 Status Handler (Eliminates Soft 404 Error)
app.use(async (req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/assets')) {
    return next();
  }

  const cleanPath = req.path.toLowerCase().replace(/\/$/, '') || '/';
  const isKnownRoute =
    validStaticRoutes.has(cleanPath) ||
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/login') ||
    cleanPath.startsWith('/social-media') ||
    cleanPath.startsWith('/editorial') ||
    cleanPath.startsWith('/thalaiyangam') ||
    cleanPath.startsWith('/blogs') ||
    cleanPath.startsWith('/valaipathivugal') ||
    cleanPath.startsWith('/spiritual') ||
    cleanPath.startsWith('/aanmeegam') ||
    cleanPath.startsWith('/category') ||
    cleanPath.startsWith('/epaper') ||
    cleanPath.startsWith('/magazine') ||
    cleanPath.startsWith('/news') ||
    cleanPath.startsWith('/article');

  if (isKnownRoute) {
    const indexPath = fs.existsSync(path.join(distPath, 'index.html'))
      ? path.join(distPath, 'index.html')
      : path.join(__dirname, '../index.html');
    try {
      const rawHtml = fs.readFileSync(indexPath, 'utf-8');
      const seoHtml = await renderSeoHtml(req, rawHtml);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      return res.send(seoHtml);
    } catch (seoErr) {
      console.warn('⚠️ [SEO SSR] Fallback to static index.html:', seoErr.message);
      return res.sendFile(indexPath);
    }
    if (false) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.sendFile(path.join(__dirname, '../index.html'));
    }
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

const attachServerErrorHandler = (srv) => {
  if (!srv) return;
  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ [Server] Port ${PORT} is already in use. Please check running PM2 processes or free port ${PORT}.`);
    } else {
      console.error('❌ [Server] HTTP server error:', err?.message || err);
    }
  });
};

// Start HTTP server immediately on standard port 5000 bound to 0.0.0.0 (standalone process; skip inside Vercel serverless)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  server = app.listen(PORT, HOST, () => {
    console.log(`🌐 Amaze Times Express API Server running on http://${HOST}:${PORT}`);
    console.log(`📁 Uploads available at http://localhost:${PORT}/uploads`);
    attachServerErrorHandler(server);

    // Background Database Verification & Cache Pre-warming
    initDb().then(() => {
      console.log(`📡 Connected to Neon PostgreSQL pooler (auto-reconnect enabled)`);

      // 1. Pre-warm news cache for 0ms sub-millisecond response times
      warmNewsCache().catch(err => {
        console.warn('⚠️ [NewsCache] Notice on warming cache:', err?.message || err);
      });

      // 2. Initial market rate auto-sync on server boot
      fetchAndSyncMarketRates().catch(err => {
        console.warn('⚠️ [MarketRateService] Initial startup sync notice:', err.message);
      });

      // 3. Schedule recurring market rate sync every 6 hours
      const SIX_HOURS = 6 * 60 * 60 * 1000;
      setInterval(() => {
        fetchAndSyncMarketRates().catch(err => {
          console.warn('⚠️ [MarketRateService] Recurring 6-hr sync notice:', err.message);
        });
      }, SIX_HOURS);

      // 4. Neon DB compute keep-alive ping every 4 minutes (prevents serverless suspension & cold-start delays)
      const FOUR_MINUTES = 4 * 60 * 1000;
      setInterval(() => {
        query('SELECT 1;').catch(() => {});
      }, FOUR_MINUTES);
    }).catch(err => {
      console.error('❌ Failed to verify database on startup:', err);
    });
  });
}

export default app;
