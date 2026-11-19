import { query } from '../server/db.js';

async function seedBuzzSettings() {
  try {
    console.log('Upserting cinema_buzz_settings and sports_buzz_settings into site_content...');

    const cinemaSettings = {
      boxOfficeBuzz: [
        {
          id: 1,
          title: 'அவெஞ்சர்ஸ்: டூம்ஸ்டே (Avengers: Doomsday)',
          star: 'ராபர்ட் டவுனி ஜூனியர் • மார்வெல்',
          rating: '5.0',
          statusBadge: '₹10+ கோடி முன்பதிவு',
          collection: 'இந்தியாவில் வசூல் சாதனை வேகம்',
          notes: 'முன்பதிவு தொடங்கிய சில மணி நேரங்களிலேயே இந்தியாவில் ₹10 கோடியைத் தாண்டி டிக்கெட்டுகள் விற்றுத் தீர்ந்தன',
          poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 2,
          title: 'ராமாயணம் (Ramayana)',
          star: 'ரன்பீர் கபூர் • சாய் பல்லவி • யாஷ்',
          rating: '4.9',
          statusBadge: 'ரூ.1,110+ கோடி வசூல்',
          collection: 'நிதேஷ் திவாரி பிரம்மாண்ட இயக்கம்',
          notes: '9 நாட்களில் உலக அளவில் ரூ.1,110 கோடியைத் தாண்டி பாக்ஸ் ஆபீஸில் புதிய சாதனை படைத்த ரன்பீர் கபூர் படம்',
          poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 3,
          title: 'சத்தியவான் சாவித்திரி',
          star: 'கீர்த்தி சுரேஷ்',
          rating: '4.8',
          statusBadge: 'நவம்பர் 20 ரிலீஸ்',
          collection: 'யு/ஏ சான்றிதழ் பெற்றது',
          notes: 'கீர்த்தி சுரேஷின் மாறுபட்ட நடிப்பில் உருவாகியுள்ள திரைப்படம் யு/ஏ சான்றிதழுடன் திரையரங்குகளில் ரிலீஸ்',
          poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80'
        }
      ],
      spotlightTags: [
        { label: '#அவெஞ்சர்ஸ்_டூம்ஸ்டே', query: 'அவெஞ்சர்ஸ்', subTab: 'boxoffice' },
        { label: '#சத்தியவான்_சாவித்திரி', query: 'சத்தியவான்', subTab: 'all' },
        { label: '#ராமாயணம்', query: 'ராமாயணம்', subTab: 'boxoffice' },
        { label: '#மின்னும்_ஓர்_இரவு', query: 'மின்னும்', subTab: 'all' },
        { label: '#யே_பிரேம்_மோல்', query: 'ஆயுஷ்மான்', subTab: 'all' },
        { label: '#சுபான்_நதியாட்வாலா', query: 'சுபான்', subTab: 'all' },
        { label: '#திரைவிமர்சனம்', query: 'விமர்சனம்', subTab: 'reviews' },
        { label: '#பாக்ஸ்_ஆபீஸ்', query: 'வசூல்', subTab: 'boxoffice' }
      ]
    };

    const sportsSettings = {
      liveMatch: {
        tournament: 'இந்தியா vs நியூசிலாந்து டெஸ்ட் தொடர் 2026',
        badge: 'CSK & CRICKET LIVE',
        status: 'LIVE',
        title: 'தோனி சிஎஸ்கே புதிய வழிகாட்டியாக நியமனம் • இந்தியா - நியூசிலாந்து முதல் டெஸ்ட் விறுவிறுப்பு!',
        venue: 'சேப்பாக்கம் & கான்பூர் சர்வதேச கிரிக்கெட் மைதானங்கள்',
        summary: 'எம்.எஸ். தோனி வீரராக ஓய்வு பெற்று சிஎஸ்கே வழிகாட்டியாக பொறுப்பேற்பு • ஆப்கானிஸ்தான் வீரர் நசீர் கான் அறிமுக டெஸ்டில் சதம் + 7 விக்கெட்டுகள் எடுத்து உலக சாதனை!',
        link: '/category/sports'
      },
      spotlightTags: [
        { label: '#தோனி_சிஎஸ்கே_மென்டார்', query: 'தோனி', subTab: 'csk' },
        { label: '#நசீர்_கான்_சாதனை', query: 'நசீர் கான்', subTab: 'international' },
        { label: '#இந்தியா_நியூசிலாந்து', query: 'நியூசிலாந்து', subTab: 'international' },
        { label: '#பென்_டக்கெட்_சதம்', query: 'டக்கெட்', subTab: 'international' },
        { label: '#சிஎஸ்கே', query: 'சிஎஸ்கே', subTab: 'csk' },
        { label: '#சாண்ட்பேப்பர்_சர்ச்சை', query: 'சாண்ட்பேப்பர்', subTab: 'international' },
        { label: '#ஐபிஎல்_2027', query: 'ஐபிஎல்', subTab: 'csk' },
        { label: '#டெஸ்ட்_கிரிக்கெட்', query: 'டெஸ்ட்', subTab: 'achievers' }
      ]
    };

    await query(`
      INSERT INTO site_content (key, data, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
    `, ['cinema_buzz_settings', JSON.stringify(cinemaSettings)]);

    await query(`
      INSERT INTO site_content (key, data, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
    `, ['sports_buzz_settings', JSON.stringify(sportsSettings)]);

    console.log('Successfully saved cinema and sports buzz settings to site_content!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding buzz settings:', err);
    process.exit(1);
  }
}

seedBuzzSettings();
