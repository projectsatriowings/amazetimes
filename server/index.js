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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// High capacity middleware: 100MB capacity for large e-papers and media
app.use(cors());
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

// Serve static frontend in production (dist directory)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For SPA routing, serve index.html for non-API and non-upload requests
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
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
