import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const catColors = {
  'அரசியல்': '#b45309',
  'தமிழ்நாடு': '#1d4ed8',
  'சினிமா': '#b91c1c',
  'விளையாட்டு': '#047857',
  'தேசியம்': '#4338ca',
  'கல்வி': '#6d28d9',
  'உலகம்': '#0891b2',
  'வணிகம்': '#334155'
};

const catIcons = {
  'அரசியல்': '🏛️',
  'தமிழ்நாடு': '🌐',
  'சினிமா': '🎬',
  'விளையாட்டு': '🏆',
  'தேசியம்': '🇮🇳',
  'கல்வி': '📚',
  'உலகம்': '🌍',
  'வணிகம்': '📈'
};

async function generateMasterPdf() {
  console.log('Loading 307 news dataset...');
  const datasetPath = path.resolve('scripts/news_307_dataset.json');
  if (!fs.existsSync(datasetPath)) {
    throw new Error('news_307_dataset.json not found!');
  }

  const articles = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  console.log(`Loaded ${articles.length} articles.`);

  const imgDir = path.resolve('public/news_images_pdf');
  const fallbackImg = path.resolve('public/apple-touch-icon.png');

  console.log('Building HTML document with Large Full-Width Hero Images...');

  const html = `<!DOCTYPE html>
<html lang="ta">
<head>
<meta charset="utf-8">
<title>அமேஸ் டைம்ஸ் - 307 செய்திகள் முழுமையான தொகுப்பு</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

@page {
  size: A4 portrait;
  margin: 8mm 12mm 10mm 12mm;
  @bottom-center {
    content: "அமேஸ் டைம்ஸ் • பக்கம் " counter(page);
    font-size: 7.5pt;
    font-family: 'Anek Tamil', 'Nirmala UI', sans-serif;
    color: #64748b;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Anek Tamil', 'Nirmala UI', 'Latha', 'Inter', sans-serif;
  color: #1e293b;
  background: #ffffff;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ================= FRONT COVER PAGE ================= */
.cover-page {
  page-break-after: always;
  break-after: page;
  height: 270mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 4px double #d97706;
  border-radius: 8px;
  padding: 16mm 14mm;
  background: linear-gradient(135deg, #07153b 0%, #0d2157 50%, #050c1e 100%);
  color: #ffffff;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cover-header-tag {
  font-size: 11pt;
  font-weight: 700;
  letter-spacing: 3px;
  color: #fbbf24;
  text-transform: uppercase;
  margin-bottom: 8mm;
}

.cover-brand-title {
  font-size: 38pt;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -1px;
  line-height: 1.1;
  text-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.cover-brand-title span {
  color: #ef4444;
}

.cover-english-brand {
  font-size: 14pt;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 4px;
  margin-top: 2mm;
  text-transform: uppercase;
}

.cover-divider {
  width: 140px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  margin: 6mm auto;
}

.cover-edition-box {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 10px;
  padding: 6mm 8mm;
  margin: 4mm 0;
  backdrop-filter: blur(10px);
}

.cover-edition-title {
  font-size: 20pt;
  font-weight: 800;
  color: #fef08a;
  margin-bottom: 2mm;
}

.cover-edition-sub {
  font-size: 12pt;
  color: #e2e8f0;
  font-weight: 500;
  line-height: 1.4;
}

.cover-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 6mm 0;
}

.cover-stat-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 8px 4px;
  text-align: center;
}

.cover-stat-num {
  font-size: 16pt;
  font-weight: 800;
  color: #f59e0b;
}

.cover-stat-label {
  font-size: 8pt;
  color: #cbd5e1;
  font-weight: 600;
}

.cover-highlights {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 9.5pt;
  color: #f1f5f9;
  font-weight: 600;
  margin: 4mm 0;
}

.cover-highlights span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cover-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 4mm;
  font-size: 9pt;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ================= TABLE OF CONTENTS ================= */
.toc-page {
  page-break-after: always;
  break-after: page;
  padding-bottom: 10mm;
}

.toc-header {
  border-bottom: 3px solid #0f172a;
  padding-bottom: 4mm;
  margin-bottom: 6mm;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.toc-title {
  font-size: 20pt;
  font-weight: 800;
  color: #0f172a;
}

.toc-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.toc-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 10px;
  background: #f8fafc;
}

.toc-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding-bottom: 3px;
  border-bottom: 1px solid #e2e8f0;
}

.toc-card-title {
  font-size: 10pt;
  font-weight: 700;
  color: #0f172a;
}

.toc-card-count {
  font-size: 8pt;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  color: #ffffff;
  background: #0f172a;
}

.toc-items-list {
  font-size: 7.5pt;
  color: #475569;
  line-height: 1.45;
}

.toc-items-list li {
  list-style: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1px 0;
}

/* ================= ARTICLE PAGES ================= */
.article-page {
  page-break-after: always;
  break-after: page;
  padding-bottom: 12px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.logo-brand {
  font-size: 12.5pt;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo-brand .red {
  color: #dc2626;
}

.cat-pill {
  font-size: 8pt;
  font-weight: 700;
  padding: 2.5px 9px;
  border-radius: 4px;
  color: #ffffff;
  background: #0f172a;
}

.article-seq {
  font-size: 8pt;
  font-weight: 700;
  color: #64748b;
}

.headline {
  font-size: 14pt;
  font-weight: 800;
  line-height: 1.3;
  color: #091e42;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 9pt;
  font-weight: 600;
  color: #334155;
  line-height: 1.4;
  border-left: 3px solid #d97706;
  background: #fffbeb;
  padding: 4px 8px;
  margin-bottom: 6px;
  border-radius: 0 4px 4px 0;
}

.byline-bar {
  display: flex;
  justify-content: space-between;
  font-size: 7pt;
  color: #64748b;
  padding-bottom: 3px;
  margin-bottom: 8px;
  border-bottom: 1px dashed #cbd5e1;
}

/* PROMINENT FULL-WIDTH HERO IMAGE (ZERO CROP - PERFECT FIT WITHOUT ANY CUT) */
.hero-image-container {
  width: 100%;
  margin-bottom: 8px;
}

.hero-image-frame {
  width: 100%;
  max-height: 280px;
  min-height: 180px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  background: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image {
  max-width: 100%;
  max-height: 280px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: 0 auto;
  display: block;
}

.hero-image-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f5f9;
  padding: 3px 8px;
  font-size: 6.5pt;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
  font-weight: 500;
}

/* EXECUTIVE SUMMARY HIGHLIGHTS BANNER */
.summary-banner-box {
  width: 100%;
  background: #f0fdf4;
  border-left: 3px solid #16a34a;
  border-right: 1px solid #dcfce7;
  border-top: 1px solid #dcfce7;
  border-bottom: 1px solid #dcfce7;
  padding: 5px 10px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 8px;
}

.summary-tag {
  font-size: 7pt;
  font-weight: 800;
  color: #15803d;
  text-transform: uppercase;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
}

.summary-body {
  font-size: 8.5pt;
  line-height: 1.45;
  color: #14532d;
  font-weight: 500;
}

.story-columns {
  column-count: 2;
  column-gap: 14px;
  text-align: justify;
  font-size: 8pt;
  line-height: 1.5;
  color: #1e293b;
}

.story-columns p {
  margin-bottom: 5px;
  text-indent: 10px;
}

.story-columns p:first-of-type::first-letter {
  font-size: 19pt;
  font-weight: 800;
  float: left;
  line-height: 0.9;
  padding-right: 5px;
  padding-top: 2px;
  color: #0f172a;
}

.article-footer {
  margin-top: 10px;
  padding-top: 4px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  font-size: 7pt;
  color: #94a3b8;
}
</style>
</head>
<body>

<!-- FRONT COVER -->
<div class="cover-page">
  <div class="cover-header-tag">★ அமேஸ் டைம்ஸ் ஊடக வலையமைப்பு சிறப்பு வெளியீடு ★</div>
  
  <div>
    <h1 class="cover-brand-title">அமேஸ் <span>டைம்ஸ்</span></h1>
    <div class="cover-english-brand">AMAZE TIMES MEDIA NETWORK</div>
    <div class="cover-divider"></div>
  </div>

  <div class="cover-edition-box">
    <div class="cover-edition-title">முழுமையான செய்திக் களஞ்சியம் 2026</div>
    <div class="cover-edition-sub">
      தமிழ்நாடு, அரசியல், சினிமா, விளையாட்டு, தேசியம், கல்வி, உலகம் மற்றும் வணிகச் செய்திகள்<br>
      <b>307 விரிவான சிறப்புக் கட்டுரைகள் & வண்ணப் புகைப்படங்களின் தொகுப்பு</b>
    </div>
  </div>

  <div class="cover-stats-grid">
    <div class="cover-stat-card">
      <div class="cover-stat-num">307</div>
      <div class="cover-stat-label">செய்திக் கட்டுரைகள்</div>
    </div>
    <div class="cover-stat-card">
      <div class="cover-stat-num">8</div>
      <div class="cover-stat-label">முதன்மைப் பகுதிகள்</div>
    </div>
    <div class="cover-stat-card">
      <div class="cover-stat-num">100%</div>
      <div class="cover-stat-label">வண்ணப் படங்கள்</div>
    </div>
    <div class="cover-stat-card">
      <div class="cover-stat-num">2026</div>
      <div class="cover-stat-label">ஆவணப் பதிப்பு</div>
    </div>
  </div>

  <div class="cover-highlights">
    <span>🌐 தமிழ்நாடு (75)</span>
    <span>🏛️ அரசியல் (64)</span>
    <span>🎬 சினிமா (49)</span>
    <span>🏆 விளையாட்டு (45)</span>
    <span>🇮🇳 தேசியம் (35)</span>
    <span>📚 கல்வி (15)</span>
    <span>🌍 உலகம் (13)</span>
    <span>📈 வணிகம் (11)</span>
  </div>

  <div class="cover-footer">
    <span>🔒 Amaze Times Digital Press & Publication</span>
    <span>பதிப்பு: நவம்பர் 2026 • முதன்மை ஆசிரியர் குழு</span>
    <span>இணையதளம்: www.amazetimes.com</span>
  </div>
</div>

<!-- TABLE OF CONTENTS (PAGE 1) -->
<div class="toc-page">
  <div class="toc-header">
    <div>
      <div style="font-size:8pt;font-weight:700;color:#dc2626;letter-spacing:1px;">அமேஸ் டைம்ஸ் செய்திக் களஞ்சியம்</div>
      <h2 class="toc-title">பொருளடக்கம் (Table of Contents - பகுதி 1)</h2>
    </div>
    <div style="font-size:8pt;color:#64748b;">மொத்தம் 307 கட்டுரைகள்</div>
  </div>

  <div class="toc-grid">
    ${['தமிழ்நாடு', 'அரசியல்', 'சினிமா', 'விளையாட்டு'].map(cat => {
      const items = articles.filter(a => (a.category || 'பொது') === cat);
      const color = catColors[cat] || '#0f172a';
      const icon = catIcons[cat] || '📰';
      return `
      <div class="toc-card">
        <div class="toc-card-header">
          <span class="toc-card-title">${icon} ${escapeHtml(cat)}</span>
          <span class="toc-card-count" style="background:${color};">${items.length} கட்டுரைகள்</span>
        </div>
        <ul class="toc-items-list">
          ${items.slice(0, 15).map((it, i) => `<li>• ${escapeHtml(it.title)}</li>`).join('')}
          ${items.length > 15 ? `<li style="font-style:italic;color:#94a3b8;">... மேலும் ${items.length - 15} கட்டுரைகள் உள்ளே</li>` : ''}
        </ul>
      </div>
      `;
    }).join('')}
  </div>
</div>

<!-- TABLE OF CONTENTS (PAGE 2) -->
<div class="toc-page">
  <div class="toc-header">
    <div>
      <div style="font-size:8pt;font-weight:700;color:#dc2626;letter-spacing:1px;">அமேஸ் டைம்ஸ் செய்திக் களஞ்சியம்</div>
      <h2 class="toc-title">பொருளடக்கம் (Table of Contents - பகுதி 2)</h2>
    </div>
    <div style="font-size:8pt;color:#64748b;">மொத்தம் 307 கட்டுரைகள்</div>
  </div>

  <div class="toc-grid">
    ${['தேசியம்', 'கல்வி', 'உலகம்', 'வணிகம்'].map(cat => {
      const items = articles.filter(a => (a.category || 'பொது') === cat);
      const color = catColors[cat] || '#0f172a';
      const icon = catIcons[cat] || '📰';
      return `
      <div class="toc-card">
        <div class="toc-card-header">
          <span class="toc-card-title">${icon} ${escapeHtml(cat)}</span>
          <span class="toc-card-count" style="background:${color};">${items.length} கட்டுரைகள்</span>
        </div>
        <ul class="toc-items-list">
          ${items.map((it, i) => `<li>• ${escapeHtml(it.title)}</li>`).join('')}
        </ul>
      </div>
      `;
    }).join('')}
  </div>
</div>

<!-- 307 ARTICLES -->
${articles.map((item, idx) => {
  let imgFile = path.join(imgDir, `news_${item.id}.jpg`);
  if (!fs.existsSync(imgFile) || fs.statSync(imgFile).size < 500) {
    imgFile = fallbackImg;
  }
  const imgUrl = pathToFileURL(imgFile).href;

  const paragraphs = (item.content || item.summary || '')
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const dateStr = item.published_at
    ? new Date(item.published_at).toLocaleDateString('ta-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '10 நவம்பர் 2026';

  const catColor = catColors[item.category] || '#0f172a';
  const catIcon = catIcons[item.category] || '📰';

  return `
  <article class="article-page" id="article-${item.id}">
    <div class="top-bar">
      <div class="logo-brand">
        அமேஸ் <span class="red">டைம்ஸ்</span>
        <span style="font-size:7.5pt;font-weight:600;color:#64748b;margin-left:6px;">AMAZE TIMES DIGITAL</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="cat-pill" style="background:${catColor};">${catIcon} ${escapeHtml(item.category || 'செய்தி')}</span>
        <span class="article-seq">கட்டுரை #${idx + 1} / ${articles.length}</span>
      </div>
    </div>

    <h1 class="headline">${escapeHtml(item.title)}</h1>

    ${item.subtitle ? `<div class="subtitle">${escapeHtml(item.subtitle)}</div>` : ''}

    <div class="byline-bar">
      <span>✍️ ஆசிரியர்: <b>${escapeHtml(item.author_name || 'முதன்மை செய்தியாளர்')}</b></span>
      <span>📅 ${escapeHtml(dateStr)}</span>
      <span>📍 ${escapeHtml(item.district && item.district !== 'all' ? item.district : 'தமிழ்நாடு / இந்தியா')}</span>
      <span>📰 பதிவு எண்: #AT-${item.id}</span>
    </div>

    <!-- PROMINENT FULL-WIDTH LARGE NEWS IMAGE -->
    <div class="hero-image-container">
      <div class="hero-image-frame">
        <img src="${imgUrl}" class="hero-image" alt="செய்தி படம்" />
        <div class="hero-image-caption">
          <span>📸 அமேஸ் டைம்ஸ் பிரத்யேக செய்திப் புகைப்படம் | Amaze Times Photo</span>
          <span>வட்டாரம்: ${escapeHtml(item.district && item.district !== 'all' ? item.district : 'தமிழ்நாடு')}</span>
        </div>
      </div>
    </div>

    <!-- EXECUTIVE SUMMARY HIGHLIGHTS BANNER -->
    <div class="summary-banner-box">
      <div class="summary-tag">📌 செய்திச் சுருக்கம் (Executive Summary)</div>
      <p class="summary-body">${escapeHtml(item.summary || item.subtitle || item.title)}</p>
    </div>

    <!-- 2-COLUMN FULL STORY -->
    <div class="story-columns">
      ${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
    </div>

    <div class="article-footer">
      <span>🔒 அமேஸ் டைம்ஸ் ஊடக வெளியீடு • பதிப்புரிமை பெற்றது</span>
      <span>அதிகாரப்பூர்வ இணையதளம்: www.amazetimes.com</span>
    </div>
  </article>
  `;
}).join('\n')}

</body>
</html>`;

  const outHtml = path.resolve('public/Amaze_Times_307_News_Articles.html');
  console.log(`Writing HTML file to: ${outHtml}`);
  fs.writeFileSync(outHtml, html, 'utf8');
  console.log(`HTML generated successfully (${(fs.statSync(outHtml).size / (1024 * 1024)).toFixed(2)} MB).`);

  const outPdf = path.resolve('Amaze_Times_307_News_Articles_Complete_Compilation.pdf');
  const publicPdf = path.resolve('public/Amaze_Times_307_News_Articles_Complete_Compilation.pdf');

  console.log('Rendering Master PDF with Large Images via Google Chrome (Headless)...');
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const startTime = Date.now();
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${outPdf}`,
    pathToFileURL(outHtml).href
  ], {
    maxBuffer: 1024 * 1024 * 150 // 150MB buffer
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Chrome PDF rendering finished in ${durationSec}s!`);

  if (fs.existsSync(outPdf)) {
    const sizeMb = (fs.statSync(outPdf).size / (1024 * 1024)).toFixed(2);
    console.log(`\n🎉 MASTER PDF WITH LARGE IMAGES CREATED SUCCESSFULLY!`);
    console.log(`File: ${outPdf}`);
    console.log(`Size: ${sizeMb} MB`);

    // Copy to public/ for instant client download via browser
    fs.copyFileSync(outPdf, publicPdf);
    console.log(`Public download link ready at: /Amaze_Times_307_News_Articles_Complete_Compilation.pdf`);
  } else {
    throw new Error('PDF output file was not created by Chrome!');
  }
}

generateMasterPdf().catch(err => {
  console.error('PDF generation error:', err);
  process.exit(1);
});
