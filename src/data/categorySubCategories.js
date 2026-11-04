/**
 * Category & Sub-Categories Configuration
 * Amaze Times Digital News Portal
 * 
 * Rules:
 * 1. 'தமிழ்நாடு' and 'மாவட்டங்கள்' show DISTRICT dropdown (38 TN districts).
 * 2. All other categories show SUB-CATEGORY dropdown tailored for that category,
 *    with an optional empty state ("விருப்பத்தேர்வு / தேவையில்லை").
 */

export const DISTRICT_LIST = [
  'அனைத்து மாவட்டங்கள்',
  'சென்னை',
  'கோயம்புத்தூர்',
  'மதுரை',
  'திருச்சிராப்பள்ளி',
  'சேலம்',
  'திருநெல்வேலி',
  'திருப்பூர்',
  'வேலூர்',
  'ஈரோடு',
  'தூத்துக்குடி',
  'திண்டுக்கல்',
  'தஞ்சாவூர்',
  'ராணிப்பேட்டை',
  'சிவகங்கை',
  'விருதுநகர்',
  'நாமக்கல்',
  'கன்னியாகுமரி',
  'கடலூர்',
  'திருவள்ளூர்',
  'காஞ்சிபுரம்',
  'விழுப்புரம்',
  'திருப்பத்தூர்',
  'கள்ளக்குறிச்சி',
  'செங்கல்பட்டு',
  'தென்காசி',
  'தருமபுரி',
  'கிருஷ்ணகிரி',
  'அரியலூர்',
  'பெரம்பலூர்',
  'புதுக்கோட்டை',
  'ராமநாதபுரம்',
  'நீலகிரி',
  'கரூர்',
  'நாகப்பட்டினம்',
  'திருவாரூர்',
  'மயிலாடுதுறை',
  'தேனி'
];

export const CATEGORY_SUB_CATEGORIES = {
  // District-based categories (sub-categories = null -> show District selector)
  'தமிழ்நாடு': null,
  'tamilnadu': null,
  'மாவட்டங்கள்': null,
  'districts': null,

  // Politics
  'அரசியல்': [
    'அனைத்து அரசியல் செய்திகள்',
    'தமிழக அரசியல் களம் (TN Politics)',
    'தேர்தல் 2026 சிறப்பு (Election 2026 Special)',
    'திமுக & கூட்டணிக் களம்',
    'அதிமுக & கூட்டணிக் களம்',
    'பாஜக & தேசிய அரசியல்',
    'விஜய் - தவெக அரசியல் (TVK Politics)',
    'நாம் தமிழர் & பிற கட்சிகள்',
    'சட்டமன்ற நிகழ்வுகள் & கொள்கை முடிவுகள்'
  ],
  'politics': [
    'அனைத்து அரசியல் செய்திகள்',
    'தமிழக அரசியல் களம் (TN Politics)',
    'தேர்தல் 2026 சிறப்பு (Election 2026 Special)',
    'திமுக & கூட்டணிக் களம்',
    'அதிமுக & கூட்டணிக் களம்',
    'பாஜக & தேசிய அரசியல்',
    'விஜய் - தவெக அரசியல் (TVK Politics)',
    'நாம் தமிழர் & பிற கட்சிகள்',
    'சட்டமன்ற நிகழ்வுகள் & கொள்கை முடிவுகள்'
  ],

  // Cinema
  'சினிமா': [
    'அனைத்து சினிமா செய்திகள்',
    'கோலிவுட் (Kollywood)',
    'பாலிவுட் (Bollywood)',
    'ஹாலிவுட் (Hollywood)',
    'திரைப்பட விமர்சனம் (Movie Reviews)',
    'ஓடிடி & வெப் சீரிஸ் (OTT Releases)',
    'டிரெய்லர் & டீசர் (Trailers & Teasers)',
    'பிரபலங்கள் & பேட்டி (Celebrities & Interviews)',
    'இசை & பாடல் வெளியீடு (Music Releases)'
  ],
  'cinema': [
    'அனைத்து சினிமா செய்திகள்',
    'கோலிவுட் (Kollywood)',
    'பாலிவுட் (Bollywood)',
    'ஹாலிவுட் (Hollywood)',
    'திரைப்பட விமர்சனம் (Movie Reviews)',
    'ஓடிடி & வெப் சீரிஸ் (OTT Releases)',
    'டிரெய்லர் & டீசர் (Trailers & Teasers)',
    'பிரபலங்கள் & பேட்டி (Celebrities & Interviews)',
    'இசை & பாடல் வெளியீடு (Music Releases)'
  ],

  // Sports
  'விளையாட்டு': [
    'அனைத்து விளையாட்டுகள்',
    'கிரிக்கெட் & ஐபிஎல் (Cricket & IPL)',
    'சிஎஸ்கே & தோனி ஸ்பெஷல் (CSK Special)',
    'டி20 உலகக்கோப்பை (T20 World Cup)',
    'கால்பந்து (Football)',
    'செஸ் (Chess)',
    'தடகளம் & ஒலிம்பிக் (Athletics)',
    'டென்னிஸ் (Tennis)',
    'கபடி (Pro Kabaddi)',
    'பிற விளையாட்டுகள் (Other Sports)'
  ],
  'sports': [
    'அனைத்து விளையாட்டுகள்',
    'கிரிக்கெட் & ஐபிஎல் (Cricket & IPL)',
    'சிஎஸ்கே & தோனி ஸ்பெஷல் (CSK Special)',
    'டி20 உலகக்கோப்பை (T20 World Cup)',
    'கால்பந்து (Football)',
    'செஸ் (Chess)',
    'தடகளம் & ஒலிம்பிக் (Athletics)',
    'டென்னிஸ் (Tennis)',
    'கபடி (Pro Kabaddi)',
    'பிற விளையாட்டுகள் (Other Sports)'
  ],

  // Business
  'வணிகம்': [
    'அனைத்து வணிகச் செய்திகள்',
    'பங்குச்சந்தை & சென்செக்ஸ் (Stock Market)',
    'தங்கம் & வெள்ளி நிலவரம் (Gold & Silver Rate)',
    'தொழில் முதலீடு & ஸ்டார்ட்அப் (Startups)',
    'வங்கி & தனிநபர் நிதி (Banking & Personal Finance)',
    'ஆட்டோமொபைல் & வாகனங்கள் (Automobile)',
    'ரியல் எஸ்டேட் & மனை வணிகம் (Real Estate)',
    'கிரிப்டோ & டிஜிட்டல் நாணயம் (Crypto)'
  ],
  'business': [
    'அனைத்து வணிகச் செய்திகள்',
    'பங்குச்சந்தை & சென்செக்ஸ் (Stock Market)',
    'தங்கம் & வெள்ளி நிலவரம் (Gold & Silver Rate)',
    'தொழில் முதலீடு & ஸ்டார்ட்அப் (Startups)',
    'வங்கி & தனிநபர் நிதி (Banking & Personal Finance)',
    'ஆட்டோமொபைல் & வாகனங்கள் (Automobile)',
    'ரியல் எஸ்டேட் & மனை வணிகம் (Real Estate)',
    'கிரிப்டோ & டிஜிட்டல் நாணயம் (Crypto)'
  ],

  // Spiritual
  'ஆன்மிகம்': [
    'அனைத்து ஆன்மிகம்',
    'திருக்கோயில் விழாக்கள் (Temple Festivals)',
    'ராசி பலன் & தினசரி ஜோதிடம் (Horoscope)',
    'பரிகாரங்கள் & வழிபாட்டு முறைகள் (Remedies)',
    'பஞ்சாங்கம் & விசேஷ தினங்கள் (Panchangam)',
    'ஆன்மிக வரலாறு & தலபுராணம் (Spiritual History)',
    'திருமுறை & பக்தி பாடல்கள் (Devotional)'
  ],
  'ஆன்மீகம்': [
    'அனைத்து ஆன்மிகம்',
    'திருக்கோயில் விழாக்கள் (Temple Festivals)',
    'ராசி பலன் & தினசரி ஜோதிடம் (Horoscope)',
    'பரிகாரங்கள் & வழிபாட்டு முறைகள் (Remedies)',
    'பஞ்சாங்கம் & விசேஷ தினங்கள் (Panchangam)',
    'ஆன்மிக வரலாறு & தலபுராணம் (Spiritual History)',
    'திருமுறை & பக்தி பாடல்கள் (Devotional)'
  ],
  'spiritual': [
    'அனைத்து ஆன்மிகம்',
    'திருக்கோயில் விழாக்கள் (Temple Festivals)',
    'ராசி பலன் & தினசரி ஜோதிடம் (Horoscope)',
    'பரிகாரங்கள் & வழிபாட்டு முறைகள் (Remedies)',
    'பஞ்சாங்கம் & விசேஷ தினங்கள் (Panchangam)',
    'ஆன்மிக வரலாறு & தலபுராணம் (Spiritual History)',
    'திருமுறை & பக்தி பாடல்கள் (Devotional)'
  ],

  // National
  'தேசியம்': [
    'அனைத்து தேசியம்',
    'புதுடெல்லி & மத்திய அரசு (Central Govt)',
    'அரசியல் களம் & தேர்தல் (Politics & Elections)',
    'உச்சநீதிமன்றம் & சட்டங்கள் (Supreme Court)',
    'பாதுகாப்பு & முப்படைகள் (Defense & Military)',
    'பிற மாநில நிகழ்வுகள் (Other States)',
    'பாராளுமன்ற விவாதங்கள் (Parliament)'
  ],
  'india': [
    'அனைத்து தேசியம்',
    'புதுடெல்லி & மத்திய அரசு (Central Govt)',
    'அரசியல் களம் & தேர்தல் (Politics & Elections)',
    'உச்சநீதிமன்றம் & சட்டங்கள் (Supreme Court)',
    'பாதுகாப்பு & முப்படைகள் (Defense & Military)',
    'பிற மாநில நிகழ்வுகள் (Other States)',
    'பாராளுமன்ற விவாதங்கள் (Parliament)'
  ],

  // World
  'உலகம்': [
    'அனைத்து உலகச் செய்திகள்',
    'அமெரிக்கா & ஐரோப்பிய நாடுகள் (USA & Europe)',
    'இலங்கை & தெற்காசியா (Sri Lanka & South Asia)',
    'மத்திய கிழக்கு & வளைகுடா நாடுகள் (Middle East)',
    'விண்வெளி & அறிவியல் உலகம் (Space & Science)',
    'சர்வதேச தூதரகம் & ஒப்பந்தங்கள் (Diplomacy)',
    'சீனா & ரஷ்யா நிலவரம் (China & Russia)'
  ],
  'world': [
    'அனைத்து உலகச் செய்திகள்',
    'அமெரிக்கா & ஐரோப்பிய நாடுகள் (USA & Europe)',
    'இலங்கை & தெற்காசியா (Sri Lanka & South Asia)',
    'மத்திய கிழக்கு & வளைகுடா நாடுகள் (Middle East)',
    'விண்வெளி & அறிவியல் உலகம் (Space & Science)',
    'சர்வதேச தூதரகம் & ஒப்பந்தங்கள் (Diplomacy)',
    'சீனா & ரஷ்யா நிலவரம் (China & Russia)'
  ],

  // Education & Jobs
  'கல்வி': [
    'அனைத்து கல்விச் செய்திகள்',
    'அரசுத் தேர்வுகள் (TNPSC, UPSC, SSC, TRB)',
    'பள்ளி & பொதுத் தேர்வுகள் (School Boards)',
    'கல்லூரி & பல்கலைக்கழகங்கள் (Colleges)',
    'வேலைவாய்ப்பு அறிவிப்புகள் (Job Alerts)',
    'நுழைவுத் தேர்வுகள் (NEET, JEE, CUET)',
    'கல்வி உதவித்தொகை (Scholarships)'
  ],
  'education': [
    'அனைத்து கல்விச் செய்திகள்',
    'அரசுத் தேர்வுகள் (TNPSC, UPSC, SSC, TRB)',
    'பள்ளி & பொதுத் தேர்வுகள் (School Boards)',
    'கல்லூரி & பல்கலைக்கழகங்கள் (Colleges)',
    'வேலைவாய்ப்பு அறிவிப்புகள் (Job Alerts)',
    'நுழைவுத் தேர்வுகள் (NEET, JEE, CUET)',
    'கல்வி உதவித்தொகை (Scholarships)'
  ],

  // Technology
  'தொழில்நுட்பம்': [
    'அனைத்து தொழில்நுட்பம்',
    'ஸ்மார்ட்போன் & கேஜெட்டுகள் (Smartphones)',
    'செயற்கை நுண்ணறிவு (AI & Future Tech)',
    'சைபர் பாதுகாப்பு & விழிப்புணர்வு (Cyber Security)',
    'ஆப்ஸ் & மொபைல் மென்பொருள் (Apps)',
    'எலெக்ட்ரிக் வாகனங்கள் (EV Tech)'
  ],
  'tech': [
    'அனைத்து தொழில்நுட்பம்',
    'ஸ்மார்ட்போன் & கேஜெட்டுகள் (Smartphones)',
    'செயற்கை நுண்ணறிவு (AI & Future Tech)',
    'சைபர் பாதுகாப்பு & விழிப்புணர்வு (Cyber Security)',
    'ஆப்ஸ் & மொபைல் மென்பொருள் (Apps)',
    'எலெக்ட்ரிக் வாகனங்கள் (EV Tech)'
  ],

  // Editorial / Columns
  'தலையங்கம்': [
    'ஆசிரியர் தலையங்கம் (Editorials)',
    'சிறப்புக் கட்டுரைகள் (Special Features)',
    'பிரபலங்களின் சிறப்பு நேர்காணல் (Interviews)',
    'வாசகர் கடிதங்கள் (Letters to Editor)',
    'வரலாற்று நினைவுகள் (Historical Rewind)'
  ],
  'editorial': [
    'ஆசிரியர் தலையங்கம் (Editorials)',
    'சிறப்புக் கட்டுரைகள் (Special Features)',
    'பிரபலங்களின் சிறப்பு நேர்காணல் (Interviews)',
    'வாசகர் கடிதங்கள் (Letters to Editor)',
    'வரலாற்று நினைவுகள் (Historical Rewind)'
  ]
};

/**
 * Check if category requires Tamil Nadu district selector
 */
export function isDistrictCategory(category) {
  if (!category) return false;
  const normalized = String(category).trim().toLowerCase();
  return (
    normalized === 'தமிழ்நாடு' ||
    normalized === 'tamilnadu' ||
    normalized === 'tamil nadu' ||
    normalized === 'மாவட்டங்கள்' ||
    normalized === 'districts'
  );
}

/**
 * Get available subcategories for a category (or empty array if not applicable)
 */
export function getSubCategoriesForCategory(category) {
  if (!category || isDistrictCategory(category)) return [];
  const clean = String(category).trim();
  return CATEGORY_SUB_CATEGORIES[clean] || CATEGORY_SUB_CATEGORIES[clean.toLowerCase()] || [];
}

