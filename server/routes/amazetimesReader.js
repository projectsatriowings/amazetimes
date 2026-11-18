import express from 'express';
import { query, ensureHttpsUrl } from '../db.js';
import { formatNewsRow } from './news.js';
import { getLatestGoldRates } from '../services/marketRateService.js';

const router = express.Router();

// Lightweight SQL column projection that offloads megabyte base64 main_image strings to cached /api/news/:id/image
const PRINT_NEWS_COLUMNS_SQL = `
  id, title, subtitle, summary, content, category, district, author_name,
  CASE
    WHEN main_image IS NOT NULL AND main_image LIKE 'data:image%' THEN ('/api/news/' || id || '/image')
    ELSE main_image
  END AS main_image,
  is_breaking, is_lead_hero, is_top_story, views_count, likes_count, published_at, created_at
`;

const COVER_NEWS_COLUMNS_SQL = `
  id, title, category, district,
  CASE
    WHEN main_image IS NOT NULL AND main_image LIKE 'data:image%' THEN ('/api/news/' || id || '/image')
    ELSE main_image
  END AS main_image,
  is_breaking, is_lead_hero, is_top_story, views_count, published_at, created_at
`;

const CACHE_TTL_MS = 120 * 1000; // 2 minutes RAM cache for instant sub-2ms repeat loads
const enewspaperCache = new Map();
const magazineCache = new Map();
const archiveCoversCache = new Map();

function getCachedValue(map, key) {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    map.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedValue(map, key, data) {
  if (map.size > 30) {
    const oldestKey = map.keys().next().value;
    map.delete(oldestKey);
  }
  map.set(key, { ts: Date.now(), data });
}

const TAMIL_MONTHS = {
  '01': 'ஜனவரி', '02': 'பிப்ரவரி', '03': 'மார்ச்', '04': 'ஏப்ரல்',
  '05': 'மே', '06': 'ஜூன்', '07': 'ஜூலை', '08': 'ஆகஸ்ட்',
  '09': 'செப்டம்பர்', '10': 'அக்டோபர்', '11': 'நவம்பர்', '12': 'டிசம்பர்'
};

const ENG_MONTHS = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December'
};

function getIstDateStr(dateInput = new Date()) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(d.getTime() + istOffset);
  return ist.toISOString().split('T')[0];
}

function subtractOneDayStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() - 1);
  return utc.toISOString().split('T')[0];
}

function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function cleanPlainText(text) {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .trim();
}

function splitParagraphs(text, maxChars = 1400) {
  const cleaned = cleanPlainText(text);
  if (!cleaned) return [];
  const clipped = cleaned.length > maxChars ? cleaned.slice(0, maxChars).trim() + '...' : cleaned;
  return clipped.split(/\n+/).map(p => p.trim()).filter(Boolean);
}

async function getMarketSnapshot() {
  try {
    const live = await getLatestGoldRates();
    if (live && live.gold22k) {
      const updatedDate = live.updated_at ? formatDateDDMMYYYY(getIstDateStr(live.updated_at)) : formatDateDDMMYYYY(getIstDateStr());
      return {
        gold22k: `₹${Number(live.gold22k).toLocaleString('en-IN')} / கி`,
        gold24k: live.gold24k ? `₹${Number(live.gold24k).toLocaleString('en-IN')} / கி` : '',
        sovereign22k: live.sovereign22k ? `₹${Number(live.sovereign22k).toLocaleString('en-IN')}` : '',
        silver: `₹${Number(live.silver || 105).toLocaleString('en-IN')} / கி`,
        petrol: `₹${live.petrol || '100.80'} / லி`,
        diesel: `₹${live.diesel || '92.39'} / லி`,
        sensex: live.sensex || '79,310',
        nifty: live.nifty || '24,536',
        updatedDate
      };
    }
  } catch (e) {
    console.warn('Market snapshot live fetch notice:', e.message);
  }
  return {
    gold22k: '₹13,135 / கி',
    silver: '₹105.00 / கி',
    petrol: '₹100.80 / லி',
    diesel: '₹92.39 / லி',
    sensex: '79,310 ▲',
    nifty: '24,536 ▲',
    updatedDate: formatDateDDMMYYYY(getIstDateStr())
  };
}

// Daily Rotating Rich Reader's Engagement Content (Split across 2 full dedicated back pages: Kural+Kids & Puzzles+Quiz)
const DAILY_INTERACTIVE_SETS = [
  {
    kurals: [
      {
        number: '391',
        adhigaram: 'கல்வி (பொருட்பால்)',
        line1: 'கற்க கசடறக் கற்பவை கற்றபின்',
        line2: 'நிற்க அதற்குத் தக.',
        meaning: 'கற்க வேண்டிய நல்ல நூல்களைக் குற்றமறத் தெளிவாகக் கற்க வேண்டும்; அப்படிக் கற்ற பிறகு, அந்தக் கல்விக்குத் தக்கபடி நன்னெறியில் நடக்க வேண்டும்.',
        lifeLesson: 'வெறும் மதிப்பெண்ணுக்காக மட்டும் படிக்காமல், கற்ற அறிவை அன்றாட வாழ்க்கையில் ஒழுக்கமாகப் பின்பற்றுவதே உண்மையான கல்வி.'
      },
      {
        number: '397',
        adhigaram: 'கல்வி (பொருட்பால்)',
        line1: 'யாதானும் நாடாமால் ஊராமால் என்னொருவன்',
        line2: 'சாந்துணையுங் கல்லாத வாறு.',
        meaning: 'கல்வி கற்றவனுக்கு எந்த நாடும் தன் நாடாகும், எந்த ஊரும் தன் ஊராகும்; அப்படியிருக்க ஒருவன் சாகும் வரை கல்வி கற்காமல் இருப்பது ஏனோ?',
        lifeLesson: 'புதிய விஷயங்களைக் கற்றுக்கொள்ள வயது ஒரு தடையில்லை — வாழ்நாள் முழுவதும் கற்கும் பழக்கம் உலகம் முழுவதும் மதிப்பைத் தரும்.'
      }
    ],
    proverb: {
      tamil: '“அறிவுடையார் எல்லாம் உடையார்; அறிவிலார் என்னுடைய ரேனும் இலர்.”',
      explanation: 'பணம், பொருள் எவ்வளவு இருந்தாலும் அறிவும் விவேகமும் இருந்தால் மட்டுமே வாழ்க்கையில் உண்மையான வெற்றி நிலைக்கும்.'
    },
    quote: {
      text: '“கனவு காணுங்கள்; ஆனால் அந்தக் கனவுகள் உங்களைத் தூங்கவிடாமல் செய்ய வேண்டும்!”',
      author: 'டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம்'
    },
    kidsStory: {
      title: 'புத்திசாலி குருவியும் தண்ணீர்ப் பானையும்',
      paragraphs: [
        'கோடைக் காலத்தில் வெயில் கொளுத்திக் கொண்டிருந்தது. ஒரு சிறிய சிட்டுக்குருவிக்கு மிகுந்த தாகம் எடுத்தது. குளங்கள், குட்டைகள் எல்லாம் வற்றிப்போனதால், அது நீண்ட தூரம் பறந்து தண்ணீர் தேடியது. இறுதியாக ஒரு வீட்டின் தோட்டத்தில் இருந்த பழைய மண்பானையின் அடியில் சிறிதளவு தண்ணீர் இருப்பதைப் பார்த்தது.',
        'மகிழ்ச்சியுடன் பானையின் விளிம்பில் உட்கார்ந்த குருவி எட்டிப் பார்த்தது; ஆனால் தண்ணீர் மிகவும் ஆழத்தில் இருந்ததால் அதன் சிறிய அலகால் எட்ட முடியவில்லை. பானையைத் தள்ளவும் அதற்குப் பலம் இல்லை. சோர்வடையாத குருவி சுற்றிலும் பார்த்தபோது தோட்டத்தில் நிறைய சிறிய கூழாங்கற்கள் கிடந்தன.',
        'உடனே ஒரு அற்புதமான யோசனை தோன்றியது! ஒவ்வொரு கூழாங்கல்லாகத் தன் அலகில் கவ்வி எடுத்து பானைக்குள் போடத் தொடங்கியது. பத்து, இருபது, முப்பது கற்கள் விழுந்ததும், பானையின் அடியில் இருந்த தண்ணீர் மெல்ல மெல்ல மேலே எழும்பி விளிம்பு வரை வந்தது! குருவி வயிறாரக் குளிர்ந்த நீரைக் குடித்துவிட்டு உற்சாகமாகக் கூவிக்கொண்டே வானில் பறந்து சென்றது.'
      ],
      moral: 'எந்தச் சிக்கலான நேரத்திலும் மனம் தளராமல், புத்திசாலித்தனத்துடனும் விடாமுயற்சியுடனும் சிந்தித்தால் நிச்சயம் தீர்வு கிடைக்கும்!',
      reflection: 'குழந்தைகளே: நீங்கள் கடினமான ஒரு வீட்டுப்பாடத்தைச் செய்யும்போது சோர்வடையாமல் என்ன புதிய வழியில் சிந்திப்பீர்கள்?'
    },
    didYouKnowList: [
      'தேன் மட்டுமே ஆயிரக்கணக்கான ஆண்டுகள் ஆனாலும் கெட்டுப்போகாத ஒரே இயற்கை உணவுப் பொருள் — எகிப்து பிரமிடுகளில் 3,000 ஆண்டு பழமையான தேன் இன்னும் நல்ல நிலையில் கண்டெடுக்கப்பட்டது!',
      'தமிழ் மொழி உலகின் மிகத் தொன்மையான வாழும் செம்மொழிகளில் ஒன்றாகும்; சுமார் 2,500 ஆண்டுகளுக்கு முற்பட்ட சங்க இலக்கியங்கள் இன்றும் பயன்பாட்டில் உள்ளன.',
      'ஒரு மனிதனின் மூளையில் சுமார் 8,600 கோடி நரம்பு செல்கள் (Neurons) உள்ளன; அவை ஒரு நொடியில் கோடிக்கணக்கான தகவல்களைப் பரிமாறுகின்றன!'
    ],
    riddles: [
      { q: '1. கால் இல்லாமல் ஓடுவான், கழுத்து இல்லாமல் கத்துவான் — அவன் யார்?', a: 'ஆறு (நதி)' },
      { q: '2. பச்சைப் பெட்டிக்குள் வெள்ளை முத்துக்கள் — அது என்ன?', a: 'வெண்டைக்காய்' },
      { q: '3. இரவெல்லாம் பூத்திருக்கும், பகலில் உதிர்ந்துவிடும் — அது என்ன?', a: 'நட்சத்திரங்கள்' },
      { q: '4. வாய் இல்லாமல் பேசுவான், காது இல்லாமல் கேட்பான் — அவன் யார்?', a: 'தொலைபேசி' },
      { q: '5. எவ்வளவு எடுத்தாலும் குறையாமல் வளரும் செல்வம் எது?', a: 'கல்வி (அறிவு)' },
      { q: '6. மழை வந்தால் மலரும், வெயில் வந்தால் சுருங்கும் — அது என்ன?', a: 'குடை' }
    ],
    puzzles: [
      {
        title: 'எண் வரிசைப் புதிர் (Number Sequence)',
        question: 'அடுத்த எண் என்ன வரும்?  2, 6, 12, 20, 30, ___ ?',
        answer: '42 (ஒவ்வொரு எண்ணும் +4, +6, +8, +10, +12 எனக் கூடுகிறது)'
      },
      {
        title: 'கடிகாரத் தர்க்கப் புதிர் (Logic Teaser)',
        question: 'ஒரு கூடைக்குள் 10 ஆப்பிள்கள் உள்ளன. அதிலிருந்து நீங்கள் 3 ஆப்பிள்களை எடுத்துக் கொண்டீர்கள். இப்போது உங்களிடம் எத்தனை ஆப்பிள்கள் இருக்கும்?',
        answer: '3 ஆப்பிள்கள்! (நீங்கள் எடுத்த 3 ஆப்பிள்கள் தான் உங்களிடம் இருக்கும்!)'
      }
    ],
    wordGames: [
      { clue: '1. தமிழ்நாட்டின் தலைநகரம்: செ _ னை', answer: 'சென்னை' },
      { clue: '2. உலகப் பொதுமறை நூல்: தி _ க் கு _ ள்', answer: 'திருக்குறள்' },
      { clue: '3. சோழர் கட்டிய பழமையான அணை: க _ ல _ ணை', answer: 'கல்லணை' },
      { clue: '4. சூரியக் குடும்பத்தின் மிகப்பெரிய கோள்: வி _ ழ _ ன்', answer: 'வியாழன்' }
    ],
    gkQuiz: [
      { q: '1. தமிழ்நாட்டின் மாநிலப் பறவை எது? (அ) மயில் (ஆ) மரகதப் புறா (இ) குயில் (ஈ) கிளி', a: '(ஆ) மரகதப் புறா' },
      { q: '2. இந்தியாவின் முதல் செயற்கைக்கோள் எது? (அ) ரோகிணி (ஆ) ஆரியபட்டா (இ) பாஸ்கரா (ஈ) சந்திரயான்', a: '(ஆ) ஆரியபட்டா' },
      { q: '3. திருக்குறளில் உள்ள மொத்த அதிகாரங்கள் எத்தனை? (அ) 100 (ஆ) 120 (இ) 133 (ஈ) 144', a: '(இ) 133' },
      { q: '4. உலகிலேயே மிக நீளமான நதி எது? (அ) கங்கை (ஆ) அமேசான் (இ) நைல் (ஈ) காவிரி', a: '(இ) நைல்' },
      { q: '5. ‘மிசைல் மேன் ஆஃப் இந்தியா’ எனப் போற்றப்படுபவர் யார்? (அ) விக்ரம் சாராபாய் (ஆ) அப்துல் கலாம் (இ) சி.வி. ராமன் (ஈ) ஹோமி பாபா', a: '(ஆ) அப்துல் கலாம்' }
    ],
    healthTips: [
      'காலை வெறும் வயிற்றில் 2 டம்ளர் வெதுவெதுப்பான நீர் குடிப்பது செரிமானத்தையும் நோய் எதிர்ப்பு சக்தியையும் மேம்படுத்தும்.',
      'கணினி/மொபைல் பார்க்கும்போது 20 நிமிடத்திற்கு ஒருமுறை 20 அடி தூரத்தை 20 வினாடிகள் பார்ப்பது கண்களைக் காக்கும்.',
      'தினமும் குறைந்தது 30 நிமிட நடைப்பயிற்சி இதய ஆரோக்கியத்தையும் மன அமைதியையும் அதிகரிக்கும்.'
    ]
  },
  {
    kurals: [
      {
        number: '423',
        adhigaram: 'அறிவுடைமை (பொருட்பால்)',
        line1: 'எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள்',
        line2: 'மெய்ப்பொருள் காண்ப தறிவு.',
        meaning: 'எந்த ஒரு செய்தியை யார் சொல்லக் கேட்டாலும், அதை அப்படியே நம்பிவிடாமல், அதன் உண்மையான பொருள் எது என்பதை ஆராய்ந்து அறிவதே சிறந்த அறிவாகும்.',
        lifeLesson: 'சமூக ஊடகங்களில் வரும் எந்தச் செய்தியையும் பகிர்வதற்கு முன்பு அதன் உண்மைத் தன்மையைச் சரிபார்ப்பதே இன்றைய அறிவுடைமை.'
      },
      {
        number: '619',
        adhigaram: 'ஆள்வினையுடைமை (பொருட்பால்)',
        line1: 'தெய்வத்தான் ஆகா தெனினும் முயற்சிதன்',
        line2: 'மெய்வருத்தக் கூலி தரும்.',
        meaning: 'விதியால் ஒரு செயல் நடக்காமல் போனாலும் கூட, தளராத உழைப்பும் முயற்சியும் நம் உடல் உழைப்புக்குரிய பலனை நிச்சயமாகத் தந்தே தீரும்.',
        lifeLesson: 'அதிர்ஷ்டத்தை நம்பி காத்திருப்பதை விட, தினமும் தொடர்ந்து உழைப்பதே நீடித்த வெற்றியைத் தரும்.'
      }
    ],
    proverb: {
      tamil: '“சிறுதுளி பெருவெள்ளம்; சிறு முயற்சி பெரும் சாதனை.”',
      explanation: 'ஒவ்வொரு நாளும் செய்யும் சிறிய சேமிப்பும் சிறிய முயற்சியும் காலப்போக்கில் மாபெரும் வெற்றியாக உருவெடுக்கும்.'
    },
    quote: {
      text: '“உள்ளுவ தெல்லாம் உயர்வுள்ளல்; மற்றது தள்ளினுந் தள்ளாமை நீர்த்து.”',
      author: 'திருவள்ளுவர் (குறள் 596)'
    },
    kidsStory: {
      title: 'ஒற்றுமையே பலம் — நான்கு நண்பர் எருதுகள்',
      paragraphs: [
        'ஒரு பசுமையான காட்டின் ஓரத்தில் நான்கு எருதுகள் ஆழ்ந்த நட்புடன் வாழ்ந்து வந்தன. அவை எப்போதும் ஒன்றாகவே புல் மேயும்; ஒன்றாகவே ஆற்றில் தண்ணீர் குடிக்கும். அதே காட்டில் வாழ்ந்த ஒரு பசியுள்ள சிங்கம் பல நாட்களாக அவற்றை வேட்டையாடத் திட்டமிட்டது.',
        'சிங்கம் தாக்க வரும்போதெல்லாம் நான்கு எருதுகளும் வட்டமாக நின்று கூர்மையான கொம்புகளை வெளிக்காட்டி ஒன்றாக எதிர்த்தன. இதனால் பயந்த சிங்கம் ஒவ்வொரு முறையும் தோல்வியுடன் திரும்பிச் சென்றது. ஒருநாள் எருதுகளுக்குள் சிறிய வாக்குவாதம் ஏற்பட்டு, அவை கோபத்தில் ஆளுக்கொரு திசையாகப் பிரிந்து சென்றன.',
        'இந்த வாய்ப்பை எதிர்பார்த்துக் காத்திருந்த சிங்கம் தனியாக மேய்ந்த ஒரு எருதைத் துரத்தத் தொடங்கியது. அதன் அலறல் சத்தத்தைக் கேட்ட மற்ற மூன்று எருதுகளும் கோபத்தை மறந்து உடனே ஓடிவந்து நண்பனைக் காப்பாற்றி சிங்கத்தைக் காட்டை விட்டே விரட்டின. அன்றிலிருந்து அவை எப்போதும் பிரிவதில்லை என உறுதியேற்றன.'
      ],
      moral: 'நண்பர்கள் மற்றும் குடும்பத்திற்குள் ஒற்றுமையாக இருந்தால் எந்தப் பெரிய ஆபத்தையும் எளிதில் வெல்லலாம்!',
      reflection: 'குழந்தைகளே: நண்பர்களுடன் சிறிய சண்டை வந்தால் அதை எப்படி அன்பாகப் பேசித் தீர்த்துக்கொள்வீர்கள்?'
    },
    didYouKnowList: [
      'ஆக்டோபஸ் (Octopus) உயிரினத்திற்கு 3 இதயங்களும், 9 மூளைகளும், நீல நிற ரத்தமும் உள்ளன!',
      'பூமியிலிருந்து சூரிய ஒளி வந்து சேர சரியாக 8 நிமிடங்கள் 20 வினாடிகள் எடுத்துக்கொள்கிறது!',
      'தஞ்சை பெரிய கோயிலின் கோபுர உச்சியில் உள்ள 80 டன் எடையுள்ள கல்லை 1,000 ஆண்டுகளுக்கு முன்பே தமிழர்கள் சாய்வுதளப் பொறியியல் மூலம் ஏற்றினர்!'
    ],
    riddles: [
      { q: '1. தலையில் கிரீடம் இருக்கும், ஆனால் அரசன் அல்ல — அது என்ன?', a: 'அன்னாசிப்பழம்' },
      { q: '2. வெட்ட வெட்ட வளரும், ஆனால் மரம் அல்ல — அது என்ன?', a: 'தலைமுடி & நகம்' },
      { q: '3. பிறக்கும்போது பச்சை, வளரும்போது சிவப்பு — அது என்ன?', a: 'மிளகாய்' },
      { q: '4. கண் இருக்கும் ஆனால் பார்க்க முடியாது — அது என்ன?', a: 'ஊசி / தேங்காய்' },
      { q: '5. உயரமாக நிற்பான், ஆனால் நிழல் தர மாட்டான் — அவன் யார்?', a: 'பனை மரம் / சாலை' },
      { q: '6. ஓடாத குதிரைக்கு ஆறு கால்கள் — அது என்ன?', a: 'தராசு' }
    ],
    puzzles: [
      {
        title: 'எடைத் தர்க்கப் புதிர் (Weight Logic)',
        question: '1 கிலோ இரும்பு மற்றும் 1 கிலோ பஞ்சு — இதில் எது அதிக எடை கொண்டது?',
        answer: 'இரண்டும் சம எடை (இரண்டுமே 1 கிலோ தான்!)'
      },
      {
        title: 'கணிதக் கணக்கு (Quick Math)',
        question: 'ஒரு பண்ணையில் 5 கோழிகளும் 4 பசுக்களும் உள்ளன. மொத்தம் எத்தனை கால்கள் இருக்கும்?',
        answer: '26 கால்கள் (5×2 = 10 + 4×4 = 16)'
      }
    ],
    wordGames: [
      { clue: '1. தமிழகத்தின் நெற்களஞ்சியம்: த _ சா _ ர்', answer: 'தஞ்சாவூர்' },
      { clue: '2. இந்தியாவின் தேசிய மலர்: தா _ ரை', answer: 'தாமரை' },
      { clue: '3. ஒளியின் வேகத்தை விட மெதுவானது: ஒ _ லி (சத்தம்)', answer: 'ஒலி' },
      { clue: '4. தமிழ் இலக்கணப் பழநூல்: தொ _ கா _ பி _ ம்', answer: 'தொல்காப்பியம்' }
    ],
    gkQuiz: [
      { q: '1. கல்லணையைக் கட்டிய மன்னர் யார்? (அ) ராஜராஜ சோழன் (ஆ) கரிகாலச் சோழன் (இ) பாண்டிய நெடுஞ்செழியன் (ஈ) சேரன் செங்குட்டுவன்', a: '(ஆ) கரிகாலச் சோழன்' },
      { q: '2. இந்தியாவின் மிக உயரமான சிகரம் எது? (அ) எவரெஸ்ட் (ஆ) கஞ்சன்ஜங்கா (இ) தொட்டபெட்டா (ஈ) ஆனைமுடி', a: '(ஆ) கஞ்சன்ஜங்கா' },
      { q: '3. தமிழ்நாட்டில் உள்ள மொத்த மாவட்டங்கள் எத்தனை? (அ) 32 (ஆ) 36 (இ) 38 (ஈ) 40', a: '(இ) 38' },
      { q: '4. தாவரங்கள் ஒளிச்சேர்க்கைக்கு எந்த வாயுவை எடுத்துக்கொள்கின்றன? (அ) ஆக்ஸிஜன் (ஆ) கார்பன் டை ஆக்சைடு (இ) நைட்ரஜன் (ஈ) ஹைட்ரஜன்', a: '(ஆ) கார்பன் டை ஆக்சைடு' },
      { q: '5. தென்னிந்தியாவின் மான்செஸ்டர் என்று அழைக்கப்படும் நகரம் எது? (அ) மதுரை (ஆ) திருச்சி (இ) கோயம்புத்தூர் (ஈ) சேலம்', a: '(இ) கோயம்புத்தூர்' }
    ],
    healthTips: [
      'உணவில் கீரை, கேரட் மற்றும் நெல்லிக்காய் சேர்த்துக்கொள்வது கண் பார்வைக்கும் சருமப் பொலிவிற்கும் சிறந்தது.',
      'இரவு உணவைத் தூங்குவதற்கு 2 மணி நேரத்திற்கு முன்பு எளிமையாக முடிப்பது ஆரோக்கியமான தூக்கத்தைத் தரும்.',
      'சர்க்கரை அதிகம் உள்ள குளிர்பானங்களுக்குப் பதிலாக இளநீர், மோர் மற்றும் எலுமிச்சை சாறு அருந்துவது உடலுக்குக் குளிர்ச்சி தரும்.'
    ]
  }
];

function getDailyInteractiveCorner(editionDateStr) {
  const parts = String(editionDateStr || getIstDateStr()).split('-').map(Number);
  const daySeed = (parts[0] || 2026) * 366 + (parts[1] || 11) * 31 + (parts[2] || 18);
  return DAILY_INTERACTIVE_SETS[Math.abs(daySeed) % DAILY_INTERACTIVE_SETS.length];
}

async function getEditorialAndBlogStories() {
  const extras = [];
  try {
    const res = await query(`SELECT key, data FROM site_content WHERE key IN ('editorial_articles', 'blogs')`);
    for (const row of res.rows) {
      const arr = Array.isArray(row.data) ? row.data : [];
      if (row.key === 'editorial_articles') {
        arr.slice(0, 4).forEach((item, idx) => {
          extras.push({
            id: item.id || `editorial-${idx}`,
            title: item.title,
            subtitle: '',
            summary: cleanPlainText(item.desc || item.content),
            paragraphs: splitParagraphs(item.content || item.desc, 1300),
            category: 'தலையங்கம்',
            district: '',
            author: item.author || 'முதன்மையாசிரியர் தலையங்கக் குழு',
            image: item.image || '/Amaze times.jpg',
            publishedAt: item.date || new Date().toISOString(),
            publishedDateIst: formatDateDDMMYYYY(item.date || getIstDateStr()),
            viewsCount: 450,
            likesCount: 65
          });
        });
      } else if (row.key === 'blogs') {
        arr.slice(0, 4).forEach((item, idx) => {
          extras.push({
            id: item.id || `blog-${idx}`,
            title: item.title,
            subtitle: item.moral || '',
            summary: cleanPlainText(item.summary || item.content),
            paragraphs: splitParagraphs(item.content || item.summary, 1300),
            category: item.category || 'சிறுகதை',
            district: '',
            author: item.authorName || 'சிறப்பு எழுத்தாளர்',
            image: item.mainImage || '/Amaze times.jpg',
            publishedAt: item.createdAt || new Date().toISOString(),
            publishedDateIst: formatDateDDMMYYYY(item.createdAt || getIstDateStr()),
            viewsCount: 320,
            likesCount: item.likesCount || 50
          });
        });
      }
    }
  } catch (err) {
    console.warn('Extra site_content articles warning:', err.message);
  }
  return extras;
}

const FALLBACK_HOROSCOPE_SIGNS = [
  { id: 1, sign_code: 'aries', name_ta: 'மேஷம்', name_en: 'Aries', glyph: '♈', ruling_planet: 'செவ்வாய்', prediction_text: 'இன்று புதிய முயற்சிகளில் வெற்றி கிட்டும். உத்தியோகத்தில் சக ஊழியர்களின் ஆதரவு கிடைக்கும். நிதி நிலைமை சீராக இருக்கும்.', lucky_number: '9', lucky_color: 'சிவப்பு', lucky_direction: 'கிழக்கு' },
  { id: 2, sign_code: 'taurus', name_ta: 'ரிஷபம்', name_en: 'Taurus', glyph: '♉', ruling_planet: 'சுக்கிரன்', prediction_text: 'குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும். வியாபாரத்தில் எதிர்பாராத லாபம் கிடைக்கும். ஆரோக்கியத்தில் கவனம் தேவை.', lucky_number: '6', lucky_color: 'வெள்ளை', lucky_direction: 'தெற்கு' },
  { id: 3, sign_code: 'gemini', name_ta: 'மிதுனம்', name_en: 'Gemini', glyph: '♊', ruling_planet: 'புதன்', prediction_text: 'பேச்சுத்திறமையால் காரியங்களைச் சாதிப்பீர்கள். பயணங்கள் அனுகூலமாக அமையும். நண்பர்கள் மூலம் சுபச்செய்தி வரும்.', lucky_number: '5', lucky_color: 'பச்சை', lucky_direction: 'வடக்கு' },
  { id: 4, sign_code: 'cancer', name_ta: 'கடகம்', name_en: 'Cancer', glyph: '♋', ruling_planet: 'சந்திரன்', prediction_text: 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். தாய்வழி உறவினர்களால் ஆதாயம் உண்டு. சுபகாரிய முயற்சிகள் கைகூடும்.', lucky_number: '2', lucky_color: 'வெள்ளி', lucky_direction: 'வடமேற்கு' },
  { id: 5, sign_code: 'simmam', name_ta: 'சிம்மம்', name_en: 'Leo', glyph: '♌', ruling_planet: 'சூரியன்', prediction_text: 'அரசு வழி காரியங்கள் தடையின்றி முடியும். சமூகத்தில் மதிப்பும் மரியாதையும் உயரும். தந்தையாரின் ஆசி கிட்டும்.', lucky_number: '1', lucky_color: 'தங்கம்', lucky_direction: 'கிழக்கு' },
  { id: 6, sign_code: 'virgo', name_ta: 'கன்னி', name_en: 'Virgo', glyph: '♍', ruling_planet: 'புதன்', prediction_text: 'தொழிலில் புதிய ஒப்பந்தங்கள் கையெழுத்தாகும். செலவுகளைக் கட்டுப்படுத்துவது நல்லது. ஆன்மிக சிந்தனை மேலோங்கும்.', lucky_number: '5', lucky_color: 'பச்சை', lucky_direction: 'தெற்கு' },
  { id: 7, sign_code: 'libra', name_ta: 'துலாம்', name_en: 'Libra', glyph: '♎', ruling_planet: 'சுக்கிரன்', prediction_text: 'கூட்டுத் தொழிலில் நல்ல முன்னேற்றம் ஏற்படும். வாழ்க்கைத் துணையின் ஆதரவு உற்சாகம் தரும். பணவரவு திருப்திகரமாக இருக்கும்.', lucky_number: '6', lucky_color: 'வெளிர் நீலம்', lucky_direction: 'மேற்கு' },
  { id: 8, sign_code: 'scorpio', name_ta: 'விருச்சிகம்', name_en: 'Scorpio', glyph: '♏', ruling_planet: 'செவ்வாய்', prediction_text: 'கடின உழைப்பிற்கு ஏற்ற அங்கீகாரம் கிடைக்கும். எதிரிகள் விலகிச் செல்வர். பூர்வீக சொத்து விவகாரங்கள் சுமுகமாகும்.', lucky_number: '9', lucky_color: 'மெரூன்', lucky_direction: 'வடக்கு' },
  { id: 9, sign_code: 'sagittarius', name_ta: 'தனுசு', name_en: 'Sagittarius', glyph: '♐', ruling_planet: 'குரு', prediction_text: 'பெரியோர்களின் வழிகாட்டுதல் நற்பலன் தரும். ஆன்மிக தலங்களுக்குச் சென்று வரும் வாய்ப்பு அமையும். சுபச்செலவுகள் கூடும்.', lucky_number: '3', lucky_color: 'மஞ்சள்', lucky_direction: 'வடகிழக்கு' },
  { id: 10, sign_code: 'capricorn', name_ta: 'மகரம்', name_en: 'Capricorn', glyph: '♑', ruling_planet: 'சனி', prediction_text: 'பொறுமையுடன் செயல்பட்டால் வெற்றி நிச்சயம். புதிய முதலீடுகளைத் திட்டமிடுவீர்கள். வாகனப் பயணத்தில் கவனம் தேவை.', lucky_number: '8', lucky_color: 'நீலம்', lucky_direction: 'மேற்கு' },
  { id: 11, sign_code: 'aquarius', name_ta: 'கும்பம்', name_en: 'Aquarius', glyph: '♒', ruling_planet: 'சனி', prediction_text: 'நண்பர்கள் மற்றும் உடன் பிறந்தோரின் உதவி கிட்டும். நீண்ட நாள் ஆசைகள் நிறைவேறும். தொழிலில் லாபம் அதிகரிக்கும்.', lucky_number: '8', lucky_color: 'கருநீலம்', lucky_direction: 'வடக்கு' },
  { id: 12, sign_code: 'pisces', name_ta: 'மீனம்', name_en: 'Pisces', glyph: '♓', ruling_planet: 'குரு', prediction_text: 'எடுத்த காரியங்கள் இனிதே நிறைவேறும். பணவரவு தாராளமாக இருக்கும். குடும்பத்தில் சுபகாரியப் பேச்சுவார்த்தைகள் தொடங்கும்.', lucky_number: '3', lucky_color: 'பொன்மஞ்சள்', lucky_direction: 'கிழக்கு' }
];

async function getDailyHoroscopeSnapshot() {
  let signs = FALLBACK_HOROSCOPE_SIGNS;
  let panchangam = {
    tamilDate: 'கார்த்திகை மாதம் • சுப தினம்',
    nallaNeram: 'காலை 09:30 – 10:30 | மாலை 04:30 – 05:30',
    rahuKalam: 'மதியம் 12:00 – 01:30',
    yemagandam: 'காலை 07:30 – 09:00',
    kuligai: 'காலை 10:30 – 12:00',
    soolam: 'வடக்கு • பரிகாரம்: பால்'
  };

  try {
    const zRes = await query('SELECT * FROM zodiac_horoscopes ORDER BY id ASC');
    if (zRes.rows && zRes.rows.length >= 12) {
      signs = zRes.rows;
    }
  } catch (_) {}

  try {
    const scRes = await query(`SELECT key, data FROM site_content WHERE key IN ('horoscope', 'rasi_records', 'panchangam')`);
    for (const row of scRes.rows) {
      if ((row.key === 'horoscope' || row.key === 'rasi_records') && row.data) {
        if (Array.isArray(row.data) && row.data.length >= 12 && signs === FALLBACK_HOROSCOPE_SIGNS) {
          signs = row.data.map((item, idx) => ({
            ...FALLBACK_HOROSCOPE_SIGNS[idx],
            name_ta: item.name_ta || item.rasi || item.name || FALLBACK_HOROSCOPE_SIGNS[idx].name_ta,
            prediction_text: item.prediction_text || item.daily || item.prediction || item.desc || FALLBACK_HOROSCOPE_SIGNS[idx].prediction_text,
            lucky_number: item.lucky_number || item.luckyNumber || FALLBACK_HOROSCOPE_SIGNS[idx].lucky_number,
            lucky_color: item.lucky_color || item.luckyColor || FALLBACK_HOROSCOPE_SIGNS[idx].lucky_color,
            lucky_direction: item.lucky_direction || item.luckyDirection || FALLBACK_HOROSCOPE_SIGNS[idx].lucky_direction
          }));
        } else if (row.data.panchangam && typeof row.data.panchangam === 'object') {
          panchangam = { ...panchangam, ...row.data.panchangam };
        }
      } else if (row.key === 'panchangam' && row.data && typeof row.data === 'object') {
        panchangam = { ...panchangam, ...row.data };
      }
    }
  } catch (_) {}

  return { signs, panchangam };
}

const formatForPrint = (art) => ({
  id: art.id,
  title: art.title,
  subtitle: art.subtitle || '',
  summary: cleanPlainText(art.summary || art.desc),
  paragraphs: splitParagraphs(art.content || art.summary, 2200),
  category: art.category || 'தமிழ்நாடு',
  district: art.district && art.district !== 'all' ? art.district : '',
  author: art.authorName || art.author || 'அமேஸ் டைம்ஸ் செய்திக்குழு',
  image: ensureHttpsUrl(art.mainImage || art.image || '/Amaze times.jpg'),
  publishedAt: art.publishedAt || art.createdAt,
  publishedDateIst: formatDateDDMMYYYY(getIstDateStr(art.publishedAt || art.createdAt)),
  viewsCount: art.viewsCount || 0,
  likesCount: art.likesCount || 0
});

// =========================================================================
// SAFE IMAGE PROXY FOR CROSS-ORIGIN PDF EXPORT & CLIPPER CANVAS
// =========================================================================
router.get('/proxy-image', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
      return res.status(400).send('Invalid image URL');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(404).send('Image not available');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return res.status(400).send('Not an image');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Proxy error');
  }
});

// =========================================================================
// DAILY E-NEWSPAPER ARCHIVE COVERS (FAST UNIQUE COVER PHOTO + HEADLINE PER DAY)
// =========================================================================
router.get('/enewspaper/archive-covers', async (req, res) => {
  try {
    const days = Math.min(30, Math.max(1, parseInt(req.query.days || '14', 10) || 14));
    const todayIst = getIstDateStr();
    const cacheKey = `${todayIst}_${days}`;
    const cached = getCachedValue(archiveCoversCache, cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const newsRes = await query(`
      SELECT ${COVER_NEWS_COLUMNS_SQL}
      FROM news
      WHERE status = 'published'
        AND main_image IS NOT NULL
        AND TRIM(main_image) != ''
        AND main_image != '/Amaze times.jpg'
      ORDER BY
        (CASE WHEN is_lead_hero = true OR is_breaking = true THEN 1 ELSE 0 END) DESC,
        COALESCE(published_at, created_at) DESC
      LIMIT 80
    `);

    const pool = newsRes.rows.map(r => ({
      id: String(r.id),
      title: cleanPlainText(r.title),
      category: r.category || 'தமிழ்நாடு',
      image: ensureHttpsUrl(r.main_image || '/og-image.jpg'),
      dateIst: getIstDateStr(r.published_at || r.created_at)
    }));

    const [y, m, d] = todayIst.split('-').map(Number);
    const baseUtc = new Date(Date.UTC(y, m - 1, d));
    const usedIds = new Set();
    const covers = {};

    for (let i = 0; i < days; i++) {
      const dt = new Date(baseUtc.getTime() - i * 86400000);
      const iso = dt.toISOString().split('T')[0];
      const sourceDate = subtractOneDayStr(iso);

      // Prefer a story from that edition's source day (D-1) or edition day (D), never duplicating an image across cards
      let pick = pool.find(a => !usedIds.has(a.id) && (a.dateIst === sourceDate || a.dateIst === iso));
      if (!pick) {
        pick = pool.find(a => !usedIds.has(a.id) && a.dateIst <= iso);
      }
      if (!pick) {
        pick = pool.find(a => !usedIds.has(a.id));
      }
      if (!pick && pool.length > 0) {
        pick = pool[i % pool.length];
      }

      if (pick) {
        usedIds.add(pick.id);
        covers[iso] = {
          articleId: pick.id,
          headline: pick.title,
          category: pick.category,
          coverImage: pick.image
        };
      }
    }

    const payload = { success: true, todayIst, covers };
    setCachedValue(archiveCoversCache, cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('Archive covers endpoint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// DAILY E-NEWSPAPER AGGREGATOR (D EDITION -> D-1 NEWS + FULL SECTION COVERAGE)
// =========================================================================
router.get('/enewspaper', async (req, res) => {
  try {
    const todayIst = getIstDateStr();
    const editionDate = (req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
      ? req.query.date
      : todayIst;
    const editionParam = req.query.edition || 'main';
    const sourceNewsDate = subtractOneDayStr(editionDate);

    const cacheKey = `${editionDate}_${editionParam}`;
    const cachedPaper = getCachedValue(enewspaperCache, cacheKey);
    if (cachedPaper) {
      return res.json(cachedPaper);
    }

    // 1. All news published strictly on D-1 (sourceNewsDate in IST) — lightweight image URL projection
    const exactRes = await query(`
      SELECT ${PRINT_NEWS_COLUMNS_SQL} FROM news
      WHERE status = 'published'
        AND (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date = $1::date
      ORDER BY is_lead_hero DESC, is_top_story DESC, is_breaking DESC, COALESCE(views_count, 0) DESC, COALESCE(published_at, created_at) DESC
    `, [sourceNewsDate]);

    const exactArticles = exactRes.rows.map(formatNewsRow).map(formatForPrint);
    const exactSourceCount = exactArticles.length;

    // 2. Partitioned Query up to D-1: Ensures recent news items from EVERY SINGLE category without megabyte base64!
    const diverseRes = await query(`
      WITH ranked AS (
        SELECT ${PRINT_NEWS_COLUMNS_SQL},
               ROW_NUMBER() OVER (
                 PARTITION BY category
                 ORDER BY (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date DESC,
                          is_lead_hero DESC, is_top_story DESC, COALESCE(views_count, 0) DESC
               ) as cat_rank
        FROM news
        WHERE status = 'published'
          AND (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date <= $1::date
      )
      SELECT * FROM ranked
      WHERE cat_rank <= 10
      ORDER BY (COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date DESC,
               is_lead_hero DESC, is_top_story DESC, COALESCE(views_count, 0) DESC
    `, [sourceNewsDate]);

    let allPool = [...exactArticles];
    const seenIds = new Set(exactArticles.map(a => String(a.id)));

    for (const row of diverseRes.rows) {
      const formatted = formatForPrint(formatNewsRow(row));
      if (!seenIds.has(String(formatted.id))) {
        seenIds.add(String(formatted.id));
        allPool.push(formatted);
      }
    }

    // If completely empty (future/early edge case), load across whole published pool partitioned by category
    if (allPool.length < 15) {
      const anyRes = await query(`
        WITH ranked AS (
          SELECT ${PRINT_NEWS_COLUMNS_SQL},
                 ROW_NUMBER() OVER (
                   PARTITION BY category
                   ORDER BY COALESCE(published_at, created_at) DESC
                 ) as cat_rank
          FROM news WHERE status = 'published'
        )
        SELECT * FROM ranked WHERE cat_rank <= 6
        ORDER BY COALESCE(published_at, created_at) DESC
      `);
      for (const row of anyRes.rows) {
        const formatted = formatForPrint(formatNewsRow(row));
        if (!seenIds.has(String(formatted.id))) {
          seenIds.add(String(formatted.id));
          allPool.push(formatted);
        }
      }
    }

    // Also include Editorials & Blogs/Stories for the Editorial Section Page
    const editorialAndBlogs = await getEditorialAndBlogStories();

    // City Edition puts Chennai/TN first, Special highlights highest views
    if (editionParam === 'city') {
      allPool.sort((a, b) => {
        const aCity = (a.district === 'சென்னை' || a.category === 'தமிழ்நாடு') ? 1 : 0;
        const bCity = (b.district === 'சென்னை' || b.category === 'தமிழ்நாடு') ? 1 : 0;
        return bCity - aCity;
      });
    } else if (editionParam === 'special') {
      allPool.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

    let dbEdition = null;
    let archiveDates = [];
    try {
      const edRes = await query('SELECT * FROM epaper_editions WHERE edition_date = $1 LIMIT 1', [editionDate]);
      if (edRes.rows.length > 0) dbEdition = edRes.rows[0];

      const datesRes = await query(`
        SELECT DISTINCT ((COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata')::date + INTERVAL '1 day')::date::text as ed_date
        FROM news
        WHERE status = 'published'
        ORDER BY ed_date DESC
        LIMIT 30
      `);
      archiveDates = datesRes.rows.map(r => r.ed_date);
    } catch (e) {}

    const marketRates = await getMarketSnapshot();
    const editionsMap = {
      main: 'தமிழ்நாடு முதன்மைப் பதிப்பு (Main Edition)',
      city: 'சென்னை பெருநகரப் பதிப்பு (City Edition)',
      special: 'சிறப்புத் தொகுப்புப் பதிப்பு (Special Issue)'
    };
    const currentEditionName = editionsMap[editionParam] || editionsMap.main;

    const pages = [];
    const usedOnPages = new Set();

    // PAGE 1: Broadsheet Front Page (1 Lead + 3 Secondary Bottom + 5 Briefs = 9 articles!)
    const frontLead = allPool[0] || null;
    const frontSecondary = allPool.slice(1, 4);
    const frontBriefs = allPool.slice(4, 9);
    [frontLead, ...frontSecondary, ...frontBriefs].forEach(a => a && usedOnPages.add(String(a.id)));

    pages.push({
      pageNumber: 1,
      template: 'newspaper-front',
      title: `பக்கம் 1: தலைமைச் செய்திகள் (${formatDateDDMMYYYY(editionDate)})`,
      section: 'முதல் பக்கம் (Front Page)',
      editionDateFormatted: formatDateDDMMYYYY(editionDate),
      sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
      exactSourceCount,
      isFallbackUsed: exactSourceCount < 4,
      leadArticle: frontLead,
      secondaryArticles: frontSecondary,
      briefArticles: frontBriefs,
      marketRates,
      imageUrl: frontLead?.image || '/Amaze times.jpg',
      thumbnail: frontLead?.image || '/Amaze times.jpg'
    });

    // Helper to collect remaining stories for each category (full-news broadsheet structure: 2 full stories per page!)
    const pullCategoryStories = (cats, limit = 4) => {
      const picked = [];
      for (const a of allPool) {
        if (picked.length >= limit) break;
        if (!usedOnPages.has(String(a.id)) && cats.some(c => (a.category || '').includes(c))) {
          picked.push(a);
          usedOnPages.add(String(a.id));
        }
      }
      return picked;
    };

    const sectionDefinitions = [
      { label: 'தமிழ்நாடு முதன்மைச் செய்திகள்', cats: ['தமிழ்நாடு', 'தமிழகம்'], limit: 4 },
      { label: 'தமிழக அரசியல் களம்', cats: ['அரசியல்'], limit: 4 },
      { label: 'தேசியம் (இந்தியா)', cats: ['தேசியம்', 'இந்தியா'], limit: 2 },
      { label: 'சர்வதேசம் & உலக நிகழ்வுகள்', cats: ['உலகம்'], limit: 2 },
      { label: 'வணிகம், கல்வி & தொழில்நுட்பம்', cats: ['வணிகம்', 'கல்வி', 'தொழில்நுட்பம்'], limit: 2 },
      { label: 'விளையாட்டு அரங்கம்', cats: ['விளையாட்டு'], limit: 2 },
      { label: 'சினிமா & கலை உலகம்', cats: ['சினிமா'], limit: 2 }
    ];

    let pageCounter = 2;
    let totalRenderedArticles = [frontLead, ...frontSecondary, ...frontBriefs].filter(Boolean).length;

    // 1. ALL FULL BROADSHEET NEWS SECTIONS FIRST (Pages 2..N-3)
    for (const sec of sectionDefinitions) {
      let chunk = pullCategoryStories(sec.cats, sec.limit);
      // Ensure every category gets full coverage even if used earlier on front page
      if (chunk.length < 2) {
        const extraSameCat = allPool.filter(a => sec.cats.some(c => (a.category || '').includes(c)) && !chunk.includes(a));
        chunk = [...chunk, ...extraSameCat.slice(0, Math.max(2, sec.limit) - chunk.length)];
      }
      // Paginate strictly 2 FULL NEWS STORIES per broadsheet page (large crisp images + full multi-column articles!)
      for (let idx = 0; idx < chunk.length; idx += 2) {
        const pair = chunk.slice(idx, idx + 2);
        if (pair.length === 0) continue;
        totalRenderedArticles += pair.length;
        pages.push({
          pageNumber: pageCounter++,
          template: 'newspaper-section',
          title: `பக்கம் ${pageCounter - 1}: ${sec.label}`,
          section: sec.label,
          editionDateFormatted: formatDateDDMMYYYY(editionDate),
          sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
          leadArticle: pair[0],
          secondaryArticle: pair[1] || null,
          articles: pair,
          imageUrl: pair[0]?.image || '/Amaze times.jpg',
          thumbnail: pair[0]?.image || '/Amaze times.jpg'
        });
      }
    }

    // Add Dedicated Editorial, Opinions & Literature Page (2 full articles)!
    if (editorialAndBlogs.length > 0) {
      const edChunk = editorialAndBlogs.slice(0, 2);
      totalRenderedArticles += edChunk.length;
      pages.push({
        pageNumber: pageCounter++,
        template: 'newspaper-section',
        title: `பக்கம் ${pageCounter - 1}: தலையங்கம், வலைப்பதிவு & சிறுகதை`,
        section: 'தலையங்கம் & சிறப்புப் பார்வை',
        editionDateFormatted: formatDateDDMMYYYY(editionDate),
        sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
        leadArticle: edChunk[0],
        secondaryArticle: edChunk[1] || null,
        articles: edChunk,
        imageUrl: edChunk[0]?.image || '/Amaze times.jpg',
        thumbnail: edChunk[0]?.image || '/Amaze times.jpg'
      });
    }

    // 2. BACK ENGAGEMENT PAGES (AFTER ALL NEWS PAGES!)
    // Dedicated Intact Full Page: Daily 12-Rasi Horoscope & Panchangam (NEVER split!)
    const horoscopeSnapshot = await getDailyHoroscopeSnapshot();
    pages.push({
      pageNumber: pageCounter++,
      template: 'newspaper-horoscope',
      title: `பக்கம் ${pageCounter - 1}: இன்றைய ராசிபலன் & பஞ்சாங்கம் (Daily Horoscope)`,
      section: 'இன்றைய ராசிபலன் & ஆன்மிகப் பஞ்சாங்கம்',
      editionDateFormatted: formatDateDDMMYYYY(editionDate),
      sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
      horoscopeSigns: horoscopeSnapshot.signs,
      panchangam: horoscopeSnapshot.panchangam,
      imageUrl: '/Amaze times.jpg',
      thumbnail: '/Amaze times.jpg'
    });

    const interactiveCorner = getDailyInteractiveCorner(editionDate);

    // Split Page A: Rich Thirukkural (2 Kurals + Life Lessons), Proverb/Quote, Expanded Kids Moral Story & 3 Science Facts!
    pages.push({
      pageNumber: pageCounter++,
      template: 'newspaper-kural-kids',
      title: `பக்கம் ${pageCounter - 1}: திருக்குறள், தமிழ் மரபு & சிறுவர் கதை உலகம்`,
      section: 'திருக்குறள், தமிழ் மரபு & சிறுவர் உலகம்',
      editionDateFormatted: formatDateDDMMYYYY(editionDate),
      sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
      interactiveCorner,
      imageUrl: '/Amaze times.jpg',
      thumbnail: '/Amaze times.jpg'
    });

    // Split Page B: Rich Brain Games & Puzzles (6 Riddles + 2 Math/Logic Puzzles + 4 Word Clues + 5 GK Quiz + 3 Health Tips + Complete Answers!)
    pages.push({
      pageNumber: pageCounter++,
      template: 'newspaper-puzzles',
      title: `பக்கம் ${pageCounter - 1}: மூளைக்கு வேலை — விடுகதைகள், புதிர்கள் & வினாடி வினா`,
      section: 'மூளைக்கு வேலை — புதிர்கள் & பொது அறிவு வினாடி வினா',
      editionDateFormatted: formatDateDDMMYYYY(editionDate),
      sourceNewsDateFormatted: formatDateDDMMYYYY(sourceNewsDate),
      interactiveCorner,
      imageUrl: '/Amaze times.jpg',
      thumbnail: '/Amaze times.jpg'
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    const publication = {
      id: dbEdition?.id || `epaper-${editionDate}-${editionParam}`,
      title: dbEdition?.title || `அமேஸ் டைம்ஸ் தினசரி மின்-நாளிதழ் (${formatDateDDMMYYYY(editionDate)})`,
      edition_date: editionDate,
      edition_date_display: formatDateDDMMYYYY(editionDate),
      source_news_date: sourceNewsDate,
      source_news_date_display: formatDateDDMMYYYY(sourceNewsDate),
      exact_source_count: exactSourceCount,
      total_articles: totalRenderedArticles,
      is_fallback_used: exactSourceCount < 4,
      edition_name: currentEditionName,
      edition_code: editionParam,
      pdf_url: dbEdition?.pdf_url || '',
      cover_image_url: frontLead?.image || dbEdition?.cover_image_url || '/Amaze times.jpg',
      page_count: pages.length
    };

    const responsePayload = {
      success: true,
      publication,
      pages,
      availableDates: archiveDates.length > 0 ? archiveDates : [todayIst],
      availableEditions: [
        { code: 'main', label: 'தமிழ்நாடு முதன்மைப் பதிப்பு (Main Edition)' },
        { code: 'city', label: 'சென்னை பெருநகரப் பதிப்பு (City Edition)' },
        { code: 'special', label: 'சிறப்புத் தொகுப்புப் பதிப்பு (Special Issue)' }
      ]
    };
    setCachedValue(enewspaperCache, cacheKey, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    console.error('AmazeTimes enewspaper endpoint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// MONTHLY MAGAZINE AGGREGATOR (GLOSSY COVER TEMPLATE + FULL SECTION COVERAGE)
// =========================================================================
const DEFAULT_MASTHEAD = {
  brandTitle: 'அமேஸ் டைம்ஸ்',
  subtitle: 'புலனாய்வு & செய்தி விழிப்புணர்வு மாத இதழ்',
  publisher: 'அமேஸ் டைம்ஸ் மீடியா நெட்வொர்க்',
  editor: 'தலைமை ஆசிரியர் குழு',
  specialEditors: 'அரசியல் & சமூகப் பிரிவு',
  associateEditors: 'செய்தித் தொகுப்புக் குழு',
  districtReporters: 'தமிழ்நாடு அனைத்து மாவட்ட நிருபர்கள்',
  designer: 'அமேஸ் டைம்ஸ் வடிவமைப்புப் பிரிவு',
  officeAddress: 'சென்னை, தமிழ்நாடு - 600 005.',
  contactPhone: '+91 99426 12398',
  contactEmail: 'editor@amazetimes.com',
  legalImprint: 'Printed, Published and Owned by Amaze Times Media Network. Chennai - 600 005.'
};

router.get('/magazine/candidates', async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const month = parseInt(req.query.month || (new Date().getMonth() + 1), 10);

    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    // Fetch top best stories balanced across ALL categories from last month / top pool
    const r = await query(`
      WITH ranked AS (
        SELECT ${COVER_NEWS_COLUMNS_SQL}, summary,
               ROW_NUMBER() OVER (
                 PARTITION BY category
                 ORDER BY CASE WHEN EXTRACT(YEAR FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $1 
                                AND EXTRACT(MONTH FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $2 THEN 0 ELSE 1 END,
                          is_lead_hero DESC, is_top_story DESC,
                          (COALESCE(views_count, 0) * 2 + COALESCE(likes_count, 0) * 5) DESC,
                          COALESCE(published_at, created_at) DESC
               ) as cat_rank
        FROM news WHERE status = 'published'
      )
      SELECT * FROM ranked WHERE cat_rank <= 6
      ORDER BY is_lead_hero DESC, is_top_story DESC, is_breaking DESC,
               (COALESCE(views_count, 0) * 2 + COALESCE(likes_count, 0) * 5) DESC,
               COALESCE(published_at, created_at) DESC
      LIMIT 48
    `, [prevYear, prevMonth]);

    const candidates = r.rows.map(formatNewsRow).map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      summary: cleanPlainText(a.summary),
      mainImage: ensureHttpsUrl(a.mainImage),
      viewsCount: a.viewsCount,
      likesCount: a.likesCount,
      isLeadHero: a.isLeadHero,
      isBreaking: a.isBreaking,
      publishedAt: a.publishedAt
    }));

    res.json({ success: true, candidates, targetSourceMonth: `${TAMIL_MONTHS[String(prevMonth).padStart(2, '0')] || ''} ${prevYear}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/magazine', async (req, res) => {
  try {
    const now = new Date();
    const defaultYear = String(now.getFullYear());
    const defaultMonth = String(now.getMonth() + 1).padStart(2, '0');

    const reqYear = req.query.year || defaultYear;
    const reqMonth = req.query.month ? String(req.query.month).padStart(2, '0') : defaultMonth;
    const reqId = req.query.id;

    const magCacheKey = `${reqYear}_${reqMonth}_${reqId || 'default'}`;
    const cachedMag = getCachedValue(magazineCache, magCacheKey);
    if (cachedMag) {
      return res.json(cachedMag);
    }

    let storedMagazines = [];
    try {
      const dbRes = await query('SELECT data FROM site_content WHERE key = $1', ['magazines']);
      if (dbRes.rows.length > 0 && Array.isArray(dbRes.rows[0].data)) {
        storedMagazines = dbRes.rows[0].data;
      }
    } catch (e) {}

    let activeMag = null;
    if (reqId) {
      activeMag = storedMagazines.find(m => String(m.id) === String(reqId));
    }
    if (!activeMag) {
      activeMag = storedMagazines.find(
        m => String(m.year) === String(reqYear) && String(m.month || '').padStart(2, '0') === reqMonth
      );
    }

    const useYear = String(activeMag?.year || reqYear);
    const useMonth = String(activeMag?.month || reqMonth).padStart(2, '0');
    const tamilMonthName = TAMIL_MONTHS[useMonth] || 'நவம்பர்';
    const engMonthName = ENG_MONTHS[useMonth] || 'November';

    if (!activeMag) {
      activeMag = {
        id: `mag-${useYear}-${useMonth}`,
        title: `அமேஸ் டைம்ஸ் மாதாந்திர மலர் - ${tamilMonthName} ${useYear}`,
        edition: `${tamilMonthName}-${useYear}`,
        month: useMonth,
        year: useYear,
        volumeNo: '05',
        issueNo: useMonth,
        priceLabel: 'ரூ. 22/-',
        coverImage: '',
        coverHeadline: '',
        pdfUrl: '',
        description: `${tamilMonthName} ${useYear} சிறப்புப் பதிப்பு — கடந்த மாதத்தின் முக்கிய அரசியல், தமிழ்நாடு, வணிகம், கல்வி, விளையாட்டு மற்றும் சிறப்புப் பார்வைகள்.`
      };
    }

    const targetMonthLabel = activeMag.edition || `${tamilMonthName}-${useYear}`;

    const useYearNum = parseInt(useYear, 10);
    const useMonthNum = parseInt(useMonth, 10);

    // Prevent stale browser/CDN caching when new breaking news is published
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    // 1. Always fetch the absolute latest Breaking News / Lead Hero with a valid image for the Magazine Cover!
    const latestCoverRes = await query(`
      SELECT ${PRINT_NEWS_COLUMNS_SQL} FROM news
      WHERE status = 'published'
        AND main_image IS NOT NULL
        AND TRIM(main_image) != ''
        AND main_image != '/Amaze times.jpg'
      ORDER BY
        (CASE WHEN is_breaking = true OR is_lead_hero = true THEN 1 ELSE 0 END) DESC,
        COALESCE(published_at, created_at) DESC
      LIMIT 1
    `);

    // 2. Partitioned Query across ALL categories prioritizing the active issue month & latest Breaking / Lead stories!
    const newsRes = await query(`
      WITH ranked AS (
        SELECT ${PRINT_NEWS_COLUMNS_SQL},
               ROW_NUMBER() OVER (
                 PARTITION BY category
                 ORDER BY CASE WHEN EXTRACT(YEAR FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $1 
                                AND EXTRACT(MONTH FROM COALESCE(published_at, created_at) AT TIME ZONE 'Asia/Kolkata') = $2 THEN 0 ELSE 1 END,
                          (CASE WHEN is_breaking = true OR is_lead_hero = true THEN 1 ELSE 0 END) DESC,
                          is_top_story DESC,
                          COALESCE(published_at, created_at) DESC
               ) as cat_rank
        FROM news WHERE status = 'published'
      )
      SELECT * FROM ranked WHERE cat_rank <= 4
      ORDER BY (CASE WHEN is_breaking = true OR is_lead_hero = true THEN 1 ELSE 0 END) DESC,
               COALESCE(published_at, created_at) DESC,
               is_top_story DESC
      LIMIT 40
    `, [useYearNum, useMonthNum]);

    let rankedArticles = newsRes.rows.map(formatNewsRow).map(formatForPrint);

    // Ensure the absolute latest Breaking News / Lead Hero is always #1 unless admin pinned specific stories
    if (latestCoverRes.rows.length > 0) {
      const latestCoverStory = formatForPrint(formatNewsRow(latestCoverRes.rows[0]));
      rankedArticles = [
        latestCoverStory,
        ...rankedArticles.filter(a => String(a.id) !== String(latestCoverStory.id))
      ];
    }

    // Append Editorials & Short Stories for literature/opinion pages in the magazine!
    const extraContent = await getEditorialAndBlogStories();
    rankedArticles = [...rankedArticles, ...extraContent];

    // If Admin specifically selected stories, prioritize them first
    if (Array.isArray(activeMag.selectedArticleIds) && activeMag.selectedArticleIds.length > 0) {
      const selectedSet = new Set(activeMag.selectedArticleIds.map(String));
      const picked = rankedArticles.filter(a => selectedSet.has(String(a.id)));
      const rest = rankedArticles.filter(a => !selectedSet.has(String(a.id)));
      rankedArticles = [...picked, ...rest];
    }

    const bestNewsCandidates = rankedArticles.slice(0, 15).map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      mainImage: a.image,
      viewsCount: a.viewsCount
    }));

    const leadStory = rankedArticles[0] || {
      id: 'default-lead',
      title: 'தமிழகத்தின் வளர்ச்சித் திட்டங்கள் & மக்கள் பார்வை!',
      paragraphs: ['கடந்த மாதத்தின் முக்கிய நிகழ்வுகள் மற்றும் மக்கள் நலத் திட்டங்களின் விரிவான தொகுப்பு.'],
      image: '/og-image.jpg',
      author: 'ஆசிரியர்',
      category: 'அரசியல் & சிறப்புப் பார்வை'
    };

    const chosenCoverImage = (activeMag.coverImage && activeMag.coverImage !== '/Amaze times.jpg')
      ? ensureHttpsUrl(activeMag.coverImage)
      : ((leadStory.image && leadStory.image !== '/Amaze times.jpg') ? leadStory.image : '/og-image.jpg');

    const masthead = {
      ...DEFAULT_MASTHEAD,
      ...(activeMag.mastheadConfig || {})
    };

    const pages = [];

    // PAGE 1: GLOSSY FRONT COVER MATCHING UPLOADED SAMPLE FORMAT (Blue Header + Red Strip + Full Bleed Photo + Stroked Headline!)
    pages.push({
      pageNumber: 1,
      template: 'magazine-front-cover',
      title: `பக்கம் 1: சிறப்பு அட்டைப்படம் (${targetMonthLabel})`,
      section: 'அட்டைப்படம் (Cover)',
      monthYearLabel: targetMonthLabel,
      monthTamil: tamilMonthName,
      monthEng: engMonthName,
      year: useYear,
      volumeNo: activeMag.volumeNo || '05',
      issueNo: activeMag.issueNo || useMonth,
      priceLabel: activeMag.priceLabel || 'விலை : இலவசம்',
      coverHeadline: activeMag.coverHeadline || leadStory.title,
      coverCategory: leadStory.category || 'சிறப்புப் பார்வை',
      coverImage: chosenCoverImage,
      imageUrl: chosenCoverImage,
      thumbnail: chosenCoverImage
    });

    // PAGE 2: EDITORIAL MASTHEAD TABLE + LEAD COVER FEATURE ("அடுத்த தலைமுறை" Page 1 Layout!)
    pages.push({
      pageNumber: 2,
      template: 'magazine-editorial-masthead',
      title: `பக்கம் 2: ஆசிரியர் பக்கம் & முதன்மைக் கட்டுரை`,
      section: 'தலையங்கம் & முகப்பு',
      monthYearLabel: targetMonthLabel,
      masthead,
      leadStory: {
        ...leadStory,
        image: chosenCoverImage
      },
      imageUrl: chosenCoverImage,
      thumbnail: chosenCoverImage
    });

    // PAGES 3..N: BALANCED SECTION-WISE SPREADS COVERING ALL CATEGORIES (4 stories per bucket!)
    const innerStories = rankedArticles.slice(1);
    let pageNum = 3;

    // Order by meaningful magazine flow: தமிழ்நாடு -> அரசியல் -> தேசியம் -> உலகம் -> வணிகம்/கல்வி -> விளையாட்டு/சினிமா -> தலையங்கம்/சிறுகதை
    const secBuckets = [
      { label: 'தமிழ்நாடு சிறப்புச் செய்திகள்', cats: ['தமிழ்நாடு'] },
      { label: 'அரசியல் அலசல்', cats: ['அரசியல்'] },
      { label: 'தேசியம் & உலகப் பார்வை', cats: ['தேசியம்', 'உலகம்'] },
      { label: 'வணிகம், கல்வி & வளர்ச்சி', cats: ['வணிகம்', 'கல்வி'] },
      { label: 'விளையாட்டு & சினிமா ரசனை', cats: ['விளையாட்டு', 'சினிமா'] },
      { label: 'தலையங்கம் & சிறுகதை அரங்கம்', cats: ['தலையங்கம்', 'சிறுகதை', 'நிதி'] }
    ];

    const sortedInner = [];
    const seenInner = new Set();
    for (const b of secBuckets) {
      let countForBucket = 0;
      for (const s of innerStories) {
        if (countForBucket >= 4) break;
        if (!seenInner.has(String(s.id)) && b.cats.some(c => (s.category || '').includes(c))) {
          sortedInner.push({ ...s, magazineSectionLabel: b.label });
          seenInner.add(String(s.id));
          countForBucket++;
        }
      }
    }

    for (let i = 0; i < sortedInner.length; i += 2) {
      const pair = sortedInner.slice(i, i + 2);
      const isLastBatch = i + 2 >= sortedInner.length;

      pages.push({
        pageNumber: pageNum++,
        template: isLastBatch ? 'magazine-back-page' : 'magazine-spread-page',
        title: `பக்கம் ${pageNum - 1}: ${pair[0]?.magazineSectionLabel || pair[0]?.category || 'சிறப்புக் கட்டுரை'}`,
        section: pair[0]?.magazineSectionLabel || pair[0]?.category || 'சிறப்புப் பார்வை',
        monthYearLabel: targetMonthLabel,
        primaryStory: pair[0],
        secondaryStory: pair[1] || null,
        masthead: isLastBatch ? masthead : undefined,
        imageUrl: pair[0]?.image || '/Amaze times.jpg',
        thumbnail: pair[0]?.image || '/Amaze times.jpg'
      });
    }

    const editionsList = storedMagazines.length > 0
      ? storedMagazines.map(m => ({
          id: m.id,
          title: m.title,
          edition: m.edition || `${m.year} - ${m.month}`,
          month: String(m.month || useMonth).padStart(2, '0'),
          year: String(m.year || useYear),
          coverImage: (m.coverImage && m.coverImage !== '/Amaze times.jpg') ? m.coverImage : chosenCoverImage,
          pageCount: pages.length,
          publishedDate: m.publishedDate
        }))
      : [{
          id: activeMag.id,
          title: activeMag.title,
          edition: targetMonthLabel,
          month: useMonth,
          year: useYear,
          coverImage: chosenCoverImage,
          pageCount: pages.length,
          publishedDate: now.toISOString()
        }];

    const magPayload = {
      success: true,
      publication: {
        ...activeMag,
        edition: targetMonthLabel,
        coverImage: chosenCoverImage,
        coverHeadline: activeMag.coverHeadline || leadStory.title,
        pageCount: pages.length,
        sourceMonthLabel: `${tamilMonthName} ${useYear}`,
        totalArticlesIncluded: sortedInner.length + 1
      },
      pages,
      bestNewsCandidates,
      availableEditions: editionsList
    };
    setCachedValue(magazineCache, magCacheKey, magPayload);
    res.json(magPayload);
  } catch (err) {
    console.error('AmazeTimes magazine reader endpoint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
