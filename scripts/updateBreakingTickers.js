import { query } from '../server/db.js';

async function updateTickers() {
  try {
    console.log('Updating breaking tickers in PostgreSQL...');
    
    // Clear old 2025 static tickers
    await query('DELETE FROM breaking_tickers WHERE content LIKE \'%2025%\'');

    // Insert current authentic breaking news with direct links
    const newTickers = [
      {
        content: 'இஸ்ரேல் நிறுவனத்துடன் ரூ.1,976 கோடி மதிப்பிலான அதிரடி பாதுகாப்பு ஒப்பந்தம் மேற்கொண்ட இந்தியா!',
        priority: 1,
        link_url: '/news/377'
      },
      {
        content: 'வங்கக்கடலில் தீவிரப் புயலாக வலுப்பெற்ற அக்வான்: கடலோரப் பகுதிகளுக்கு தீவிர எச்சரிக்கை!',
        priority: 2,
        link_url: '/news/376'
      },
      {
        content: 'இந்தியாவில் ₹10 கோடியைக் கடந்த அவெஞ்சர்ஸ் டூம்ஸ்டே முன்பதிவு – வசூலில் புதிய சாதனை!',
        priority: 3,
        link_url: '/news/375'
      },
      {
        content: 'ஐபிஎல் போட்டிகளில் இருந்து வீரராக ஓய்வு பெற்றார் தோனி: சிஎஸ்கே அணியின் தலைமை வழிகாட்டியாக நியமனம்!',
        priority: 4,
        link_url: '/news/366'
      },
      {
        content: '20 வயதில் அறிமுக டெஸ்டில் சதம் மற்றும் 7 விக்கெட்டுகள் வீழ்த்தி ஆப்கானிஸ்தான் வீரர் நசீர் கான் உலக சாதனை!',
        priority: 5,
        link_url: '/news/369'
      }
    ];

    for (const t of newTickers) {
      await query(
        'INSERT INTO breaking_tickers (content, priority, link_url, is_active) VALUES ($1, $2, $3, true)',
        [t.content, t.priority, t.link_url]
      );
    }

    const check = await query('SELECT id, content, priority, link_url, is_active FROM breaking_tickers ORDER BY priority ASC');
    console.log('Updated breaking tickers count:', check.rows.length);
    console.log(JSON.stringify(check.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error updating tickers:', err);
    process.exit(1);
  }
}

updateTickers();
