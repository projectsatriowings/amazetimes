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

// 39 Selected Articles Mapping as requested by User
const SELECTED_ARTICLES_SPEC = [
  // A. Tamil Nadu – 5 articles
  {
    serial_no: 1,
    id: 321,
    category: 'தமிழ்நாடு',
    english_title: 'Transport Department Job Scam: Court Warns of Possible Bail Cancellation for Senthil Balaji and Others'
  },
  {
    serial_no: 2,
    id: 338,
    category: 'தமிழ்நாடு',
    english_title: 'Red Sanders Worth ₹7.72 Crore Seized at Chennai Port: International Smuggling Network Exposed'
  },
  {
    serial_no: 4,
    id: 318,
    category: 'தமிழ்நாடு',
    english_title: '₹635 Crore Highway Safety Project for Southern Tamil Nadu: 25 Accident-Prone Zones to Be Improved'
  },
  {
    serial_no: 7,
    id: 335,
    category: 'தமிழ்நாடு',
    english_title: 'Tamil Nadu Attracts ₹1.14 Lakh Crore in Investments: Potential for 1.42 Lakh Jobs'
  },
  {
    serial_no: 10,
    id: 299,
    category: 'தமிழ்நாடு',
    english_title: '₹22.1 Crore Fraud in Tamil Nadu Rural Development Bank Accounts: Cybercrime Investigation Underway'
  },

  // B. Politics – 5 articles
  {
    serial_no: 12,
    id: 326,
    category: 'அரசியல்',
    english_title: 'Overseas Education Scholarships for SC/ST Students: Funding Dispute Between the Tamil Nadu Government and Opposition'
  },
  {
    serial_no: 14,
    id: 364,
    category: 'அரசியல்',
    english_title: 'Vice-Chancellor Appointment Dispute: Tamil Nadu Government Seeks Resolution Through Governor'
  },
  {
    serial_no: 16,
    id: 363,
    category: 'அரசியல்',
    english_title: 'Thiruparankundram Deepam Dispute: Tamil Nadu Government Approaches Supreme Court'
  },
  {
    serial_no: 18,
    id: 403,
    category: 'அரசியல்',
    english_title: "Cauvery and Mekedatu Dam Dispute: Stalin Questions Chief Minister Vijay's Position"
  },
  {
    serial_no: 20,
    id: 404,
    category: 'அரசியல்',
    english_title: "Delimitation Debate: DMK Seeks Written Assurance from the Union Government on Tamil Nadu's Parliamentary Representation"
  },

  // C. India / National – 5 articles
  {
    serial_no: 22,
    id: 354,
    category: 'தேசியம்',
    english_title: 'India Ranks 10th in Global Climate Risk Index: 78,000 Deaths from Extreme Weather in Three Decades'
  },
  {
    serial_no: 23,
    id: 355,
    category: 'தேசியம்',
    english_title: 'CAG Plans AI-Powered Government Auditing to Detect Financial Irregularities'
  },
  {
    serial_no: 25,
    id: 353,
    category: 'தேசியம்',
    english_title: 'Missile Attack on LPG Vessel in Strait of Hormuz: Indian Sailor Missing and Two Injured'
  },
  {
    serial_no: 26,
    id: 416,
    category: 'தேசியம்',
    english_title: 'Interstate Child Trafficking Network Exposed in Chhattisgarh: Six Arrested'
  },
  {
    serial_no: 30,
    id: 312,
    category: 'தேசியம்',
    english_title: 'Delhi Air Pollution Crisis: AQI Crosses 400 in Several Areas'
  },

  // D. World – 5 articles
  {
    serial_no: 31,
    id: 356,
    category: 'உலகம்',
    english_title: 'QUAD Nations Announce New Maritime Security, Artificial Intelligence and Cybersecurity Initiatives'
  },
  {
    serial_no: 32,
    id: 393,
    category: 'உலகம்',
    english_title: 'COP31 Climate Negotiations Face Setback as Fossil Fuel Phase-Out Language Is Removed'
  },
  {
    serial_no: 34,
    id: 380,
    category: 'உலகம்',
    english_title: 'Historic California Rainfall Triggers Severe Flooding and Widespread Power Disruptions'
  },
  {
    serial_no: 35,
    id: 346,
    category: 'உலகம்',
    english_title: 'Vulcan Rocket Failure Destroys 40 Amazon Internet Satellites: Setback for Space Technology'
  },
  {
    serial_no: 36,
    id: 141,
    category: 'உலகம்',
    english_title: 'Cyberattacks Target Emergency Alert Applications: False Radiation Warnings Raise Security Concerns'
  },

  // E. Business – 5 articles
  {
    serial_no: 40,
    id: 315,
    category: 'வணிகம்',
    english_title: 'SpiceJet Faces December 7 Deadline: Financial Reporting Delays Threaten Stock Market Trading'
  },
  {
    serial_no: 44,
    id: 243,
    category: 'வணிகம்',
    english_title: 'Agricultural Solarisation Could Create 116 GW Solar Power Opportunity in India'
  },
  {
    serial_no: 45,
    id: 245,
    category: 'வணிகம்',
    english_title: 'Apollo Hospitals Reports 32% Quarterly Profit Growth Amid Expansion Costs'
  },
  {
    serial_no: 46,
    id: 239,
    category: 'வணிகம்',
    english_title: "Mandatory Electricity Storage for Power Companies: India's New Energy Management Initiative"
  },
  {
    serial_no: 47,
    id: 234,
    category: 'வணிகம்',
    english_title: "Shiprocket Records Its First Quarterly Profit as India's Digital Logistics Market Expands"
  },

  // F. Education – 5 articles
  {
    serial_no: 50,
    id: 186,
    category: 'கல்வி',
    english_title: 'NTA Plans 5,000-Member Expert Network to Strengthen JEE, NEET and CUET Examination Security'
  },
  {
    serial_no: 51,
    id: 216,
    category: 'கல்வி',
    english_title: "AICTE Introduces Four New Initiatives to Strengthen India's Technical Education System"
  },
  {
    serial_no: 52,
    id: 214,
    category: 'கல்வி',
    english_title: 'Nandan Nilekani-Led Examination Reform Committee Gets Extension Until January 2027'
  },
  {
    serial_no: 53,
    id: 185,
    category: 'கல்வி',
    english_title: "Coimbatore Launches 'Sigaram Nokki' Programme to Guide 13,563 Students Towards Higher Education"
  },
  {
    serial_no: 54,
    id: 215,
    category: 'கல்வி',
    english_title: 'National Means-cum-Merit Scholarship: Financial Support and Eligibility for Economically Disadvantaged Students'
  },

  // G. Cinema – 4 articles
  {
    serial_no: 60,
    id: 342,
    category: 'சினிமா',
    english_title: 'Ramayana Crosses ₹1,110 Crore Worldwide in Nine Days: A Major Indian Cinema Box Office Achievement'
  },
  {
    serial_no: 61,
    id: 178,
    category: 'சினிமா',
    english_title: "Suriya's Scene Trailer Creates Buzz: Jithu Madhavan's Crime Thriller Draws Attention"
  },
  {
    serial_no: 62,
    id: 344,
    category: 'சினிமா',
    english_title: 'IFFI 2026: Ramayana and Dhurandhar Gain Prominent Recognition at International Film Festival'
  },
  {
    serial_no: 65,
    id: 406,
    category: 'சினிமா',
    english_title: 'Godzilla Minus Zero Arrives in Indian Cinemas: Japanese Monster Franchise Returns'
  },

  // H. Sports – 5 articles
  {
    serial_no: 68,
    id: 414,
    category: 'விளையாட்டு',
    english_title: 'Australia Faces Injury Setback Ahead of England T20 Series as Two Fast Bowlers Withdraw'
  },
  {
    serial_no: 69,
    id: 412,
    category: 'விளையாட்டு',
    english_title: 'Glenn Phillips Creates Rare Cricket Record with Centuries Across All Three International Formats in One Year'
  },
  {
    serial_no: 71,
    id: 413,
    category: 'விளையாட்டு',
    english_title: 'IPL 2027 Auction: Teams Prepare for December Showdown as Lucknow Enters with Major Spending Power'
  },
  {
    serial_no: 72,
    id: 368,
    category: 'விளையாட்டு',
    english_title: 'Sandpaper Scandal Revisited: Cricket Australia Establishes New Advisory Process for Transparency'
  },
  {
    serial_no: 74,
    id: 369,
    category: 'விளையாட்டு',
    english_title: "Afghanistan's 20-Year-Old Nasir Khan Makes History with a Century and Seven Wickets on Test Debut"
  }
];

const catColors = {
  'தமிழ்நாடு': '#1d4ed8',   // Blue
  'அரசியல்': '#b45309',     // Amber / Bronze
  'தேசியம்': '#4338ca',     // Indigo
  'உலகம்': '#0891b2',       // Cyan
  'வணிகம்': '#0f766e',     // Teal
  'கல்வி': '#7c3aed',       // Purple
  'சினிமா': '#be123c',      // Rose / Crimson
  'விளையாட்டு': '#15803d'  // Emerald Green
};

const catEnglish = {
  'தமிழ்நாடு': 'Tamil Nadu',
  'அரசியல்': 'Politics',
  'தேசியம்': 'India & National',
  'உலகம்': 'World & Global Affairs',
  'வணிகம்': 'Business & Economy',
  'கல்வி': 'Education & Careers',
  'சினிமா': 'Cinema & Entertainment',
  'விளையாட்டு': 'Sports & Cricket'
};

const catIcons = {
  'தமிழ்நாடு': '🌐',
  'அரசியல்': '🏛️',
  'தேசியம்': '🇮🇳',
  'உலகம்': '🌍',
  'வணிகம்': '📈',
  'கல்வி': '📚',
  'சினிமா': '🎬',
  'விளையாட்டு': '🏆'
};

const catTaglines = {
  'தமிழ்நாடு': 'மாநிலத்தின் வளர்ச்சி, நிர்வாக மாற்றங்கள், சமூக மற்றும் கள யதார்த்தங்கள்',
  'அரசியல்': 'தமிழக மற்றும் இந்திய அரசியல் களத்தின் முக்கிய திருப்புமுனைகள், கூர்மையான ஆய்வுகள்',
  'தேசியம்': 'நாட்டின் பாதுகாப்பு, பொருளாதாரக் கொள்கைகள் மற்றும் மத்திய அரசின் மைல்கல் முடிவுகள்',
  'உலகம்': 'சர்வதேச விவகாரங்கள், பூகோள அரசியல், அறிவியல் மற்றும் காலநிலை மாற்ற நிகழ்வுகள்',
  'வணிகம்': 'பங்குச்சந்தை, தொழில் முதலீடுகள், பொருளாதாரப் போக்குகள் மற்றும் பணவீக்கக் கணிப்புகள்',
  'கல்வி': 'புதிய கல்விக் கொள்கைகள், தேர்வு வழிகாட்டுதல்கள் மற்றும் மாணவர்கள் முன்னேற்றச் செய்திகள்',
  'சினிமா': 'திரைப்பட உலக சாதனைகள், பாக்ஸ் ஆபீஸ் வசூல் மற்றும் நட்சத்திரங்களின் ஆளுமைப் பதிவுகள்',
  'விளையாட்டு': 'கிரிக்கெட், தடகளம், ஐபிஎல் மாற்றங்கள் மற்றும் வரலாற்றுச் சிறப்புமிக்க விளையாட்டுத் தருணங்கள்'
};

async function main() {
  console.log('========================================================================');
  console.log(' AMAZE TIMES - CURATED 39 ARTICLES MAGAZINE GENERATOR (NOVEMBER 2026)  ');
  console.log('========================================================================\n');

  // Directories
  const outputImagesDir = path.resolve('Amaze_Times_Curated_Magazine_39_Images');
  const publicDir = path.resolve('public/magazine_content_november_2026');
  const publicImagesDir = path.join(publicDir, 'images_curated_39');

  [outputImagesDir, publicDir, publicImagesDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Load manifest
  const manifestPath = path.resolve('Amaze_Times_November_2026_Magazine_Content/magazine_articles_manifest.json');
  const fullManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const manifestMap = new Map(fullManifest.map(m => [m.id, m]));

  // Load master HTML
  const masterHtmlPath = path.resolve('public/magazine_content_november_2026/Amaze_Times_November_2026_Magazine.html');
  const masterHtml = fs.readFileSync(masterHtmlPath, 'utf8');

  // Extract each article block
  const articlesList = [];
  SELECTED_ARTICLES_SPEC.forEach((spec, idx) => {
    const manItem = manifestMap.get(spec.id);
    const regex = new RegExp(`<article class="article-page" id="article-${spec.id}">[\\s\\S]*?<\\/article>`);
    const match = masterHtml.match(regex);
    if (!match) {
      console.warn(`Warning: HTML article missing for ID ${spec.id}`);
      return;
    }

    // Resolve and copy image
    let imageFile = manItem?.image_file || `news_${spec.id}.jpg`;
    let srcImg = path.resolve(`Amaze_Times_November_2026_Magazine_Content/images/${imageFile}`);
    if (!fs.existsSync(srcImg)) {
      srcImg = path.resolve(`public/news_images_pdf/news_${spec.id}.jpg`);
    }
    if (!fs.existsSync(srcImg)) {
      srcImg = path.resolve('public/Amaze times.jpg');
    }

    const targetFile = `${String(idx + 1).padStart(2, '0')}_${spec.category}_ID${spec.id}.jpg`;
    const targetPath1 = path.join(outputImagesDir, targetFile);
    const targetPath2 = path.join(publicImagesDir, targetFile);
    fs.copyFileSync(srcImg, targetPath1);
    fs.copyFileSync(srcImg, targetPath2);

    articlesList.push({
      curated_index: idx + 1,
      orig_serial_no: spec.serial_no,
      id: spec.id,
      category: spec.category,
      english_title: spec.english_title,
      tamil_title: manItem?.title || '',
      manItem,
      rawHtml: match[0],
      imageFile: targetFile,
      imageLocalPath: targetPath1
    });
  });

  console.log(`Successfully compiled all ${articlesList.length} articles and copied images!\n`);

  // Group by category for TOC
  const categoryGroups = [
    { key: 'தமிழ்நாடு', label: 'A. தமிழ்நாடு (Tamil Nadu)', count: 5 },
    { key: 'அரசியல்', label: 'B. அரசியல் (Politics)', count: 5 },
    { key: 'தேசியம்', label: 'C. தேசியம் (India & National)', count: 5 },
    { key: 'உலகம்', label: 'D. உலகம் (World)', count: 5 },
    { key: 'வணிகம்', label: 'E. வணிகம் (Business)', count: 5 },
    { key: 'கல்வி', label: 'F. கல்வி (Education)', count: 5 },
    { key: 'சினிமா', label: 'G. சினிமா (Cinema)', count: 4 },
    { key: 'விளையாட்டு', label: 'H. விளையாட்டு (Sports)', count: 5 }
  ];

  // Generate ZIP file of the 39 images
  console.log('Generating ZIP archive for the 39 curated images...');
  const zipPathRoot = path.resolve('Amaze_Times_Curated_Magazine_39_Images.zip');
  const zipPathPublic = path.join(publicDir, 'Amaze_Times_Curated_Magazine_39_Images.zip');
  try {
    execFileSync('powershell', [
      '-Command',
      `Compress-Archive -Path '${outputImagesDir}\\*' -DestinationPath '${zipPathRoot}' -Force`
    ]);
    fs.copyFileSync(zipPathRoot, zipPathPublic);
    console.log(`✓ Zip package created: ${zipPathRoot} (${(fs.statSync(zipPathRoot).size / (1024 * 1024)).toFixed(2)} MB)\n`);
  } catch (zErr) {
    console.warn('Zip creation warning:', zErr.message);
  }

  // Cover Lead image
  const coverHeroImgUrl = pathToFileURL(articlesList[0].imageLocalPath).href;

  // BUILD HTML
  console.log('Building Luxury 39-Article Magazine HTML...');
  const html = `<!DOCTYPE html>
<html lang="ta">
<head>
<meta charset="utf-8">
<title>அமேஸ் டைம்ஸ் - நவம்பர் 2026 மாதாந்திர சிறப்பிதழ் (Amaze Times Monthly Special Edition)</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

@page {
  size: A4 portrait;
  margin: 10mm 12mm 12mm 12mm;
  @bottom-center {
    content: "அமேஸ் டைம்ஸ் மாதாந்திர இதழ் • நவம்பர் 2026 • பக்கம் " counter(page);
    font-size: 8pt;
    font-family: 'Anek Tamil', 'Nirmala UI', sans-serif;
    color: #64748b;
    font-weight: 500;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Anek Tamil', 'Nirmala UI', 'Latha', 'Inter', sans-serif;
  color: #0f172a;
  background: #ffffff;
  line-height: 1.6;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ================= FRONT COVER PAGE ================= */
.cover-page {
  page-break-after: always;
  break-after: page;
  height: 272mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 4px double #d97706;
  border-radius: 8px;
  padding: 12mm 12mm 14mm 12mm;
  background: linear-gradient(135deg, #051026 0%, #0c204a 50%, #030814 100%);
  color: #ffffff;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cover-gold-badge {
  display: inline-block;
  background: linear-gradient(90deg, #d97706, #fbbf24, #d97706);
  color: #051026;
  padding: 4px 18px;
  font-size: 9pt;
  font-weight: 800;
  letter-spacing: 1.5px;
  border-radius: 20px;
  text-transform: uppercase;
  margin-bottom: 3mm;
  box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);
}

.cover-brand-title {
  font-size: 40pt;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.cover-brand-title span.red {
  color: #ef4444;
}

.cover-sub-title {
  font-size: 11pt;
  font-weight: 700;
  letter-spacing: 4px;
  color: #f59e0b;
  text-transform: uppercase;
  margin-top: 1mm;
}

.cover-issue-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding: 2.5mm 0;
  margin-top: 4mm;
  font-size: 9pt;
  font-weight: 600;
  color: #cbd5e1;
}

.cover-hero-card {
  margin: 5mm 0;
  text-align: left;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #f59e0b;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
  background: #0b1528;
}

.cover-hero-img-wrap {
  position: relative;
  height: 98mm;
  overflow: hidden;
}

.cover-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(5, 16, 38, 0.95) 75%);
  padding: 6mm 7mm 5mm 7mm;
}

.cover-hero-pill {
  display: inline-block;
  background: #ef4444;
  color: #ffffff;
  font-size: 8pt;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 4px;
  margin-bottom: 2mm;
  text-transform: uppercase;
}

.cover-hero-headline {
  font-size: 16pt;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.35;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.cover-hero-en {
  font-size: 9pt;
  font-weight: 600;
  color: #fbbf24;
  margin-top: 1mm;
}

.cover-grid-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3mm;
  margin-top: 2mm;
  text-align: left;
}

.cover-highlight-box {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  padding: 3mm 3.5mm;
}

.cover-highlight-cat {
  font-size: 7.5pt;
  font-weight: 800;
  color: #f59e0b;
  text-transform: uppercase;
  margin-bottom: 1mm;
}

.cover-highlight-text {
  font-size: 8.5pt;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cover-footer {
  margin-top: 4mm;
  padding-top: 3mm;
  border-top: 1px solid rgba(255,255,255,0.15);
  display: flex;
  justify-content: space-between;
  font-size: 7.5pt;
  color: #94a3b8;
}

/* ================= EDITORIAL / TOC PAGE ================= */
.toc-page {
  page-break-after: always;
  break-after: page;
  padding: 4mm 0;
}

.editorial-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 3px solid #0f172a;
  padding-bottom: 3mm;
  margin-bottom: 4mm;
}

.editorial-title {
  font-size: 22pt;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.editorial-meta {
  font-size: 9pt;
  font-weight: 600;
  color: #64748b;
}

.publisher-note {
  background: #f8fafc;
  border-left: 4px solid #d97706;
  padding: 4mm 5mm;
  border-radius: 0 8px 8px 0;
  margin-bottom: 5mm;
  font-size: 9pt;
  color: #334155;
  line-height: 1.55;
}

.publisher-note h4 {
  font-size: 10.5pt;
  color: #0f172a;
  font-weight: 800;
  margin-bottom: 1.5mm;
}

.toc-pillars-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4mm;
}

.toc-pillar-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}

.toc-pillar-header {
  padding: 2.5mm 4mm;
  color: #ffffff;
  font-weight: 800;
  font-size: 9.5pt;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toc-pillar-list {
  list-style: none;
  padding: 2mm 3.5mm;
  font-size: 8pt;
}

.toc-pillar-list li {
  padding: 1.5mm 0;
  border-bottom: 1px dotted #e2e8f0;
  line-height: 1.35;
}

.toc-pillar-list li:last-child {
  border-bottom: none;
}

.toc-pillar-list li b {
  color: #0f172a;
}

.toc-pillar-list li span.en-hint {
  display: block;
  font-size: 7.5pt;
  color: #475569;
  font-weight: 700;
  margin-top: 0.5mm;
}

/* ================= CATEGORY DIVIDER PAGE ================= */
.cat-divider-page {
  page-break-after: always;
  break-after: page;
  height: 260mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 3px solid #0f172a;
  border-radius: 8px;
  padding: 15mm;
  background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
}

.cat-divider-badge {
  font-size: 40pt;
  margin-bottom: 3mm;
}

.cat-divider-title {
  font-size: 26pt;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 2mm;
}

.cat-divider-en {
  font-size: 13pt;
  font-weight: 700;
  color: #475569;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 5mm;
}

.cat-divider-desc {
  font-size: 11pt;
  color: #334155;
  max-width: 140mm;
  line-height: 1.6;
  margin-bottom: 8mm;
}

.cat-divider-count {
  display: inline-block;
  background: #0f172a;
  color: #ffffff;
  padding: 3mm 8mm;
  border-radius: 30px;
  font-size: 9.5pt;
  font-weight: 700;
}

/* ================= ARTICLE PAGES ================= */
.article-page {
  page-break-after: always;
  break-after: page;
  height: 270mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3mm 0 4mm 0;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.5px solid #0f172a;
  padding-bottom: 2mm;
  margin-bottom: 3mm;
}

.brand-badge {
  font-size: 11pt;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.5px;
}

.brand-badge span.red {
  color: #ef4444;
}

.brand-badge span.tag {
  font-size: 7.5pt;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 1px 6px;
  border-radius: 3px;
  margin-left: 2mm;
  font-weight: 600;
}

.cat-pill {
  font-size: 8pt;
  font-weight: 800;
  color: #ffffff;
  padding: 2px 10px;
  border-radius: 4px;
  text-transform: uppercase;
}

.article-kicker-en {
  font-size: 9pt;
  font-weight: 800;
  color: #b45309;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1.5mm;
  border-left: 3px solid #d97706;
  padding-left: 2.5mm;
  line-height: 1.3;
}

.article-headline {
  font-size: 15pt;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.35;
  margin-bottom: 2mm;
}

.article-subtitle {
  font-size: 9pt;
  font-weight: 600;
  color: #475569;
  line-height: 1.45;
  margin-bottom: 2.5mm;
  background: #f8fafc;
  padding: 2mm 3mm;
  border-radius: 4px;
}

.article-byline {
  display: flex;
  flex-wrap: wrap;
  gap: 3mm 4mm;
  font-size: 7.5pt;
  color: #64748b;
  border-top: 1px dotted #cbd5e1;
  border-bottom: 1px dotted #cbd5e1;
  padding: 1.5mm 0;
  margin-bottom: 3.5mm;
}

.article-byline span b {
  color: #0f172a;
}

.hero-image-wrap {
  margin-bottom: 3.5mm;
}

.hero-image-box {
  width: 100%;
  height: 68mm;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #f1f5f9;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-caption {
  font-size: 7pt;
  color: #64748b;
  margin-top: 1mm;
  display: flex;
  justify-content: space-between;
}

.story-columns {
  column-count: 2;
  column-gap: 5mm;
  column-rule: 1px solid #e2e8f0;
  font-size: 8.2pt;
  line-height: 1.55;
  text-align: justify;
  color: #1e293b;
  max-height: 125mm;
  overflow: hidden;
}

.story-columns p {
  margin-bottom: 2mm;
  text-indent: 3mm;
}

.story-columns p:first-of-type {
  text-indent: 0;
  font-weight: 500;
}

.story-columns p:first-of-type::first-letter {
  font-size: 24pt;
  float: left;
  line-height: 0.85;
  margin-right: 1.5mm;
  font-weight: 800;
  color: #0f172a;
}

.article-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 2mm;
  display: flex;
  justify-content: space-between;
  font-size: 7pt;
  color: #94a3b8;
}
</style>
</head>
<body>

<!-- ================= COVER PAGE ================= -->
<div class="cover-page">
  <div>
    <div class="cover-gold-badge">மாதாந்திர பிரத்யேக சிறப்பிதழ் • MONTHLY SPECIAL EDITION</div>
    <div class="cover-brand-title">அமேஸ் <span class="red">டைம்ஸ்</span></div>
    <div class="cover-sub-title">AMAZE TIMES MEDIA NETWORK</div>
    <div class="cover-issue-bar">
      <span>நவம்பர் 2026 (NOVEMBER 2026)</span>
      <span>தொகுதி: 02 • இதழ்: 11</span>
      <span>39 பிரத்யேக உயர் வாசிப்பு கட்டுரைகள் (39 Curated Special Articles)</span>
      <span>www.amazetimes.com</span>
    </div>
  </div>

  <div class="cover-hero-card">
    <div class="cover-hero-img-wrap">
      <img src="${coverHeroImgUrl}" class="cover-hero-img" alt="Cover Story" />
      <div class="cover-hero-overlay">
        <span class="cover-hero-pill">மாதத்தின் முதன்மை புலனாய்வு ஆய்வு</span>
        <div class="cover-hero-headline">${escapeHtml(articlesList[0].tamil_title)}</div>
        <div class="cover-hero-en">${escapeHtml(articlesList[0].english_title)}</div>
      </div>
    </div>
  </div>

  <div>
    <div class="cover-grid-highlights">
      ${articlesList.slice(1, 7).map(a => `
        <div class="cover-highlight-box">
          <div class="cover-highlight-cat">${catIcons[a.category] || '📰'} ${escapeHtml(a.category)}</div>
          <div class="cover-highlight-text">${escapeHtml(a.tamil_title)}</div>
        </div>
      `).join('')}
    </div>

    <div class="cover-footer">
      <span>🔒 பதிப்புரிமை © 2026 அமேஸ் டைம்ஸ் மீடியா நெட்வொர்க். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</span>
      <span>ஆசிரியர் குழு: அமிர்தராஜ் & முதன்மை செய்தியாளர்கள்</span>
    </div>
  </div>
</div>

<!-- ================= EDITORIAL & TABLE OF CONTENTS ================= -->
<div class="toc-page">
  <div class="editorial-header">
    <div>
      <h1 class="editorial-title">பொருளடக்கம் & ஆசிரியர் உரை</h1>
      <div class="editorial-meta">நவம்பர் 2026 பிரத்யேக மாதாந்திர இதழ் • தொகுப்பு வழிகாட்டி</div>
    </div>
    <div class="editorial-meta">
      <b>39</b> உயர் மதிப்புக் கட்டுரைகள் • <b>8</b> பிரதான துறைகள்
    </div>
  </div>

  <div class="publisher-note">
    <h4>அமேஸ் டைம்ஸ் வாசகர்களுக்கும் வாடிக்கையாளர்களுக்கும் அன்பு வணக்கம்,</h4>
    <p>தினசரி செய்திகளிலிருந்து மாத இதழ் என்பது அடிப்படையில் மாறுபட்டது. ஒரு மாதத்தில் நடந்த அரசியல் நகர்வுகள், தமிழ்நாடு மற்றும் இந்திய அளவிலான கொள்கை மாற்றங்கள், உலகளாவிய புவிசார் அரசியல் திருப்பங்கள், வணிகப் பொருளாதார எழுச்சிகள், கல்வி முன்னேற்றங்கள் மற்றும் சினிமா, விளையாட்டுத் துறை வரலாற்றுச் சாதனைகளை வெறும் தினசரித் துணுக்குகளாக அன்றி, <b>ஆழமான வாசிப்பு மதிப்புடனும் (High Read Value) தொலைநோக்கு வரலாற்றுப் பார்வையுடனும்</b> ஆவணப்படுத்துவதே இந்த மாதாந்திரச் சிறப்பிதழின் நோக்கமாகும்.</p>
    <p style="margin-top:1.5mm;">2026 நவம்பர் மாதத்தில் எங்கள் செய்தியாளர்கள் மற்றும் ஆசிரியர் குழுவால் உருவாக்கப்பட்ட 268-க்கும் மேற்பட்ட செய்திகளிலிருந்து, மிக விரிவான, நம்பகமான மற்றும் நீண்டகால வாசிப்பு மதிப்பு கொண்ட <b>39 தலைசிறந்த ஆய்வுக் கட்டுரைகள் (8 முக்கியத் துறைகள்)</b> இத்தொகுப்பிற்காகத் தேர்ந்தெடுக்கப்பட்டு வடிவமைக்கப்பட்டுள்ளன.</p>
  </div>

  <div class="toc-pillars-grid">
    ${categoryGroups.map(group => {
      const items = articlesList.filter(a => a.category === group.key);
      const color = catColors[group.key] || '#0f172a';
      const icon = catIcons[group.key] || '📰';
      return `
      <div class="toc-pillar-card">
        <div class="toc-pillar-header" style="background:${color};">
          <span>${icon} ${group.label}</span>
          <span>${items.length} கட்டுரைகள்</span>
        </div>
        <ul class="toc-pillar-list">
          ${items.map((it) => `
            <li>
              <b>#${it.curated_index}</b> ${escapeHtml(it.tamil_title)}
              <span class="en-hint">${escapeHtml(it.english_title)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      `;
    }).join('')}
  </div>
</div>

<!-- ================= 39 MAGAZINE ARTICLES ================= -->
${(() => {
  let renderedHtml = '';
  let currentCategory = '';

  for (let i = 0; i < articlesList.length; i++) {
    const it = articlesList[i];
    const color = catColors[it.category] || '#0f172a';
    const icon = catIcons[it.category] || '📰';
    const en = catEnglish[it.category];

    // If new category, add category divider page
    if (it.category !== currentCategory) {
      currentCategory = it.category;
      const catItems = articlesList.filter(a => a.category === it.category);
      renderedHtml += `
      <div class="cat-divider-page">
        <div class="cat-divider-badge">${icon}</div>
        <div class="cat-divider-title">${escapeHtml(it.category)}</div>
        <div class="cat-divider-en">${en}</div>
        <div class="cat-divider-desc">${catTaglines[it.category] || ''}</div>
        <div class="cat-divider-count">இப்பிரிவில் ${catItems.length} பிரத்யேக ஆய்வுக் கட்டுரைகள்</div>
      </div>
      `;
    }

    // Enhance rawHtml with curated index and english kicker
    let articleBlock = it.rawHtml;

    // Replace 75 with 39 in article counter
    articleBlock = articleBlock.replace(
      /கட்டுரை #\d+ \/ 75/,
      `கட்டுரை #${it.curated_index} / 39`
    );

    // Insert English kicker right before <h1 class="article-headline">
    const kickerHtml = `<div class="article-kicker-en">${escapeHtml(it.english_title)}</div>\n        <h1 class="article-headline">`;
    articleBlock = articleBlock.replace('<h1 class="article-headline">', kickerHtml);

    // Update image src to point to local file URL
    const localImgUrl = pathToFileURL(it.imageLocalPath).href;
    articleBlock = articleBlock.replace(/src="file:\/\/\/[^"]+"/i, `src="${localImgUrl}"`);

    renderedHtml += articleBlock + '\n';
  }

  return renderedHtml;
})()}

</body>
</html>`;

  const htmlPath = path.join(publicDir, 'Amaze_Times_November_2026_Curated_Magazine.html');
  console.log(`Writing Magazine HTML to: ${htmlPath}`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`HTML generated successfully (${(fs.statSync(htmlPath).size / (1024 * 1024)).toFixed(2)} MB).`);

  // Render PDF with Headless Chrome
  console.log('\n--- Rendering Print-Ready PDF with Google Chrome Headless ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const pdfOutRoot = path.resolve('Amaze_Times_November_2026_Curated_Magazine.pdf');
  const pdfOutPublic = path.join(publicDir, 'Amaze_Times_November_2026_Curated_Magazine.pdf');

  const startTime = Date.now();
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfOutRoot}`,
    pathToFileURL(htmlPath).href
  ], {
    maxBuffer: 1024 * 1024 * 200 // 200MB buffer
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Chrome PDF rendering finished in ${durationSec}s!`);

  if (fs.existsSync(pdfOutRoot)) {
    const sizeMb = (fs.statSync(pdfOutRoot).size / (1024 * 1024)).toFixed(2);
    console.log(`\n🎉 CURATED MAGAZINE PDF CREATED SUCCESSFULLY!`);
    console.log(`File: ${pdfOutRoot}`);
    console.log(`Size: ${sizeMb} MB`);

    // Copy to public directory for instant download
    fs.copyFileSync(pdfOutRoot, pdfOutPublic);
    console.log(`Public download copy ready at: ${pdfOutPublic}`);
  } else {
    throw new Error('PDF output file was not created by Chrome!');
  }

  // Create Manifest for the 39 articles
  const curatedManifest = articlesList.map(a => ({
    curated_no: a.curated_index,
    original_catalog_no: a.orig_serial_no,
    id: a.id,
    category: a.category,
    category_en: catEnglish[a.category],
    english_title: a.english_title,
    tamil_title: a.tamil_title,
    subtitle: a.manItem?.subtitle || '',
    author: a.manItem?.author || 'முதன்மை செய்தியாளர்',
    date: a.manItem?.date,
    district: a.manItem?.district || 'தமிழ்நாடு / இந்தியா',
    content_length: a.manItem?.content_length,
    word_count: a.manItem?.word_count,
    image_file: a.imageFile
  }));

  fs.writeFileSync(
    path.join(publicDir, 'curated_39_articles_manifest.json'),
    JSON.stringify(curatedManifest, null, 2),
    'utf8'
  );

  // Build Markdown Directory
  let md = `# அமேஸ் டைம்ஸ் - நவம்பர் 2026 பிரத்யேக மாதாந்திர இதழ் (39 Curated Special Articles)\n\n`;
  md += `**வெளியீடு:** அமேஸ் டைம்ஸ் மீடியா நெட்வொர்க் (Amaze Times Media Network)\n`;
  md += `**மாதம்:** நவம்பர் 2026 | **தேர்ந்தெடுக்கப்பட்ட பிரத்யேக கட்டுரைகள்:** 39\n`;
  md += `**PDF ஆவணம்:** \`Amaze_Times_November_2026_Curated_Magazine.pdf\`\n`;
  md += `**புகைப்படங்கள் தொகுப்பு (Zip):** \`Amaze_Times_Curated_Magazine_39_Images.zip\`\n\n`;
  md += `---\n\n`;

  for (const group of categoryGroups) {
    const items = articlesList.filter(a => a.category === group.key);
    const icon = catIcons[group.key];
    md += `## ${icon} ${group.label} (${items.length} கட்டுரைகள்)\n\n`;
    md += `| எண் | தமிழ் தலைப்பு | ஆங்கில தலைப்பு | புகைப்படம் |\n`;
    md += `|:---:|:---|:---|:---|\n`;

    items.forEach((it) => {
      md += `| **#${it.curated_index}** | ${it.tamil_title.replace(/\|/g, '-')} | ${it.english_title.replace(/\|/g, '-')} | \`${it.imageFile}\` |\n`;
    });
    md += `\n`;
  }

  const mdPath = path.resolve('Amaze_Times_Curated_Magazine_Content/CONTENTS_DIRECTORY_39.md');
  const mdDir = path.dirname(mdPath);
  if (!fs.existsSync(mdDir)) fs.mkdirSync(mdDir, { recursive: true });
  fs.writeFileSync(mdPath, md, 'utf8');

  console.log('\n========================================================================');
  console.log(' ALL 39-ARTICLE MAGAZINE DELIVERABLES ARE READY:');
  console.log(` 1. Curated Magazine PDF: ${pdfOutRoot}`);
  console.log(` 2. Separate 39 Images Folder: ${outputImagesDir}`);
  console.log(` 3. 39 Images ZIP: ${zipPathRoot}`);
  console.log(` 4. Public Web Download: ${pdfOutPublic}`);
  console.log(` 5. Curated Directory: ${mdPath}`);
  console.log('========================================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during curated magazine export:', err);
  process.exit(1);
});
