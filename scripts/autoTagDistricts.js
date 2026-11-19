import db from '../server/db.js';

const TN_DISTRICT_KEYWORDS = [
  { name: 'சென்னை', keywords: ['சென்னை', 'சென்னையில்', 'chennai', 'கோயம்பேடு', 'கிண்டி', 'தாம்பரம்', 'மெரினா'] },
  { name: 'கோயம்புத்தூர்', keywords: ['கோயம்புத்தூர்', 'கோவை', 'கோவையில்', 'coimbatore', 'பொள்ளாச்சி', 'மேட்டுப்பாளையம்'] },
  { name: 'மதுரை', keywords: ['மதுரை', 'மதுரையில்', 'madurai', 'மீனாட்சி அம்மன்', 'உசிலம்பட்டி', 'திருமங்கலம்'] },
  { name: 'திருச்சிராப்பள்ளி', keywords: ['திருச்சிராப்பள்ளி', 'திருச்சி', 'திருச்சியில்', 'trichy', 'ஸ்ரீரங்கம்', 'மணப்பாறை'] },
  { name: 'சேலம்', keywords: ['சேலம்', 'சேலத்தில்', 'salem', 'மேட்டூர்', 'ஆத்தூர்', 'ஏற்காடு'] },
  { name: 'திருநெல்வேலி', keywords: ['திருநெல்வேலி', 'நெல்லை', 'நெல்லையில்', 'tirunelveli', 'தாமிரபரணி', 'பாளையங்கோட்டை'] },
  { name: 'திருப்பூர்', keywords: ['திருப்பூர்', 'திருப்பூரில்', 'tiruppur', 'அவிநாசி', 'பல்லடம்', 'தாராபுரம்'] },
  { name: 'வேலூர்', keywords: ['வேலூர்', 'வேலூரில்', 'vellore', 'காட்பாடி'] },
  { name: 'ஈரோடு', keywords: ['ஈரோடு', 'ஈரோட்டில்', 'erode', 'பவானி', 'கோபிசெட்டிபாளையம்', 'பெருந்துறை'] },
  { name: 'தூத்துக்குடி', keywords: ['தூத்துக்குடி', 'தூத்துக்குடியில்', 'thoothukudi', 'tuticorin', 'கோவில்பட்டி', 'திருச்செந்தூர்'] },
  { name: 'திண்டுக்கல்', keywords: ['திண்டுக்கல்', 'திண்டுக்கல்லில்', 'dindigul', 'பழனி', 'கொடைக்கானல்'] },
  { name: 'தஞ்சாவூர்', keywords: ['தஞ்சாவூர்', 'தஞ்சை', 'தஞ்சையில்', 'thanjavur', 'கும்பகோணம்', 'பட்டுக்கோட்டை'] },
  { name: 'விருதுநகர்', keywords: ['விருதுநகர்', 'விருதுநகரில்', 'virudhunagar', 'ஸ்ரீவில்லிபுத்தூர்', 'சிவகாசி', 'அருப்புக்கோட்டை', 'ராஜபாளையம்'] },
  { name: 'கன்னியாகுமரி', keywords: ['கன்னியாகுமரி', 'நாகர்கோவில்', 'kanyakumari', 'நாகர்கோவிலில்', 'குளச்சல்'] },
  { name: 'கடலூர்', keywords: ['கடலூர்', 'கடலூரில்', 'cuddalore', 'சிதம்பரம்', 'விருத்தாசலம்', 'நெய்வேலி'] },
  { name: 'திருவள்ளூர்', keywords: ['திருவள்ளூர்', 'திருவள்ளூரில்', 'tiruvallur', 'பொன்னேரி', 'ஆவடி'] },
  { name: 'காஞ்சிபுரம்', keywords: ['காஞ்சிபுரம்', 'காஞ்சியில்', 'kancheepuram', 'காஞ்சி'] },
  { name: 'செங்கல்பட்டு', keywords: ['செங்கல்பட்டு', 'செங்கல்பட்டில்', 'chengalpattu', 'மாமல்லபுரம்', 'மறைமலைநகர்'] },
  { name: 'விழுப்புரம்', keywords: ['விழுப்புரம்', 'விழுப்புரத்தில்', 'viluppuram', 'திண்டிவனம்'] },
  { name: 'கள்ளக்குறிச்சி', keywords: ['கள்ளக்குறிச்சி', 'கள்ளக்குறிச்சியில்', 'kallakurichi', 'உளுந்தூர்பேட்டை'] },
  { name: 'தருமபுரி', keywords: ['தருமபுரி', 'தர்மபுரி', 'dharmapuri', 'ஒகேனக்கல்', 'ஹரூர்'] },
  { name: 'கிருஷ்ணகிரி', keywords: ['கிருஷ்ணகிரி', 'krishnagiri', 'ஓசூர்', 'ஓசூரில்', 'பர்கூர்'] },
  { name: 'நாமக்கல்', keywords: ['நாமக்கல்', 'நாமக்கல்லில்', 'namakkal', 'திருச்செங்கோடு', 'ராசிபுரம்'] },
  { name: 'கரூர்', keywords: ['கரூர்', 'கரூரில்', 'karur', 'குளித்தலை'] },
  { name: 'புதுக்கோட்டை', keywords: ['புதுக்கோட்டை', 'புதுக்கோட்டையில்', 'pudukkottai', 'விராலிமலை', 'அறந்தாங்கி'] },
  { name: 'சிவகங்கை', keywords: ['சிவகங்கை', 'சிவகங்கையில்', 'sivaganga', 'காரைக்குடி', 'தேவகோட்டை'] },
  { name: 'ராமநாதபுரம்', keywords: ['ராமநாதபுரம்', 'ராமநாதபுரத்தில்', 'ramanathapuram', 'ராமேஸ்வரம்', 'பரமக்குடி'] },
  { name: 'தேனி', keywords: ['தேனி', 'தேனியில்', 'theni', 'போடிநாயக்கனூர்', 'பெரியகுளம்', 'கம்பம்'] },
  { name: 'நீலகிரி', keywords: ['நீலகிரி', 'நீலகிரியில்', 'nilgiris', 'ஊட்டி', 'உதகை', 'குன்னூர்', 'கோத்தகிரி'] },
  { name: 'அரியலூர்', keywords: ['அரியலூர்', 'அரியலூரில்', 'ariyalur', 'ஜெயங்கொண்டம்'] },
  { name: 'பெரம்பலூர்', keywords: ['பெரம்பலூர்', 'பெரம்பலூரில்', 'perambalur'] },
  { name: 'நாகப்பட்டினம்', keywords: ['நாகப்பட்டினம்', 'நாகை', 'nagapattinam', 'வேளாங்கண்ணி'] },
  { name: 'திருவாரூர்', keywords: ['திருவாரூர்', 'திருவாரூரில்', 'tiruvarur', 'மன்னார்குடி'] },
  { name: 'மயிலாடுதுறை', keywords: ['மயிலாடுதுறை', 'மயிலாடுதுறையில்', 'mayiladuthurai', 'சீர்காழி'] },
  { name: 'திருப்பத்தூர்', keywords: ['திருப்பத்தூர்', 'திருப்பத்தூரில்', 'tirupathur', 'ஆம்பூர்', 'வாணியம்பாடி'] },
  { name: 'தென்காசி', keywords: ['தென்காசி', 'தென்காசியில்', 'tenkasi', 'குற்றாலம்', 'சங்கரன்கோவில்'] },
  { name: 'ராணிப்பேட்டை', keywords: ['ராணிப்பேட்டை', 'ராணிப்பேட்டையில்', 'ranipet', 'ஆற்காடு', 'அரக்கோணம்'] }
];

async function main() {
  const res = await db.query('SELECT id, title, summary, content, district FROM news');
  let updatedCount = 0;

  for (const row of res.rows) {
    const textToScan = ((row.title || '') + ' ' + (row.summary || '') + ' ' + (row.content ? row.content.slice(0, 1000) : '')).toLowerCase();
    
    let matchedDistrict = null;
    for (const dist of TN_DISTRICT_KEYWORDS) {
      if (dist.keywords.some(kw => textToScan.includes(kw.toLowerCase()))) {
        matchedDistrict = dist.name;
        break;
      }
    }

    if (!matchedDistrict && row.district === 'chennai') {
      matchedDistrict = 'சென்னை';
    }

    if (matchedDistrict && (row.district === 'all' || row.district === 'chennai' || !row.district || row.district === '')) {
      await db.query('UPDATE news SET district = $1 WHERE id = $2', [matchedDistrict, row.id]);
      updatedCount++;
    }
  }

  console.log(`Successfully auto-tagged ${updatedCount} articles with districts!`);
  const newCounts = await db.query("SELECT district, count(*) FROM news WHERE district != 'all' GROUP BY district ORDER BY count DESC");
  console.log('District distribution now:');
  console.table(newCounts.rows);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
