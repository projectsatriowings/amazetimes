import { query } from '../server/db.js';

const initialReels = [
  {
    id: 'ig-reel-1',
    platform: 'instagram',
    type: 'reel',
    author: 'Amaze Times',
    handle: '@amazetimes_official',
    time: '1 மணி நேரத்திற்கு முன்',
    duration: '00:58',
    title: 'சென்னை மெட்ரோ ரயில் இரண்டாம் கட்டப் பணிகள்: அமேஸ் டைம்ஸ் நேரடிக் கள ஆய்வு வீடியோ! 🚇🎥',
    caption: 'சென்னையின் முக்கிய போக்குவரத்து நெரிசலைக் குறைக்கும் மெட்ரோ ரயில் 2-ம் கட்ட சுரங்கப் பாதை பணிகள் விறுவிறுப்பாக நடைபெற்று வருகின்றன. #ChennaiMetro #AmazeTimes #TamilNaduNews #ReelsTamil #MetroUpdate',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    views: '145.2K',
    likes: '18.4K',
    url: 'https://www.instagram.com/amazetimes/?hl=en',
    videoUrl: 'https://www.instagram.com/amazetimes/?hl=en'
  },
  {
    id: 'fb-vid-1',
    platform: 'facebook',
    type: 'video',
    author: 'Amaze Times Official',
    handle: 'amazetimesnews',
    time: '2 மணி நேரத்திற்கு முன்',
    duration: '03:45',
    title: 'தமிழக பட்ஜெட் 2026: சாமானிய மக்களின் எதிர்பார்ப்புகளும் நேரடி விவாதமும்! 📊💼',
    caption: 'தமிழகத்தின் வளர்ச்சித் திட்டங்களுக்கான நிதி ஒதுக்கீடு மற்றும் புதிய தொழில் முதலீடுகள் குறித்த விரிவான கலந்துரையாடல். #AmazeTimesDebate #Budget2026 #TamilNadu #FBNews',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
    views: '86.5K',
    likes: '7.2K',
    url: 'https://www.facebook.com/amazetimes',
    videoUrl: 'https://www.facebook.com/amazetimes'
  },
  {
    id: 'ig-reel-2',
    platform: 'instagram',
    type: 'reel',
    author: 'Amaze Times',
    handle: '@amazetimes_official',
    time: '4 மணி நேரத்திற்கு முன்',
    duration: '01:15',
    title: 'தளபதி 69 மற்றும் கூலி: கோலிவுட்டின் பாக்ஸ் ஆபீஸ் எதிர்பார்ப்பு அனல் பறக்கிறது! 🎬🔥',
    caption: 'இந்த ஆண்டின் பிரம்மாண்ட வெளியீடுகளாக எதிர்பார்க்கப்படும் முன்னணி நட்சத்திரங்களின் திரைப்பட வீடியோ தொகுப்பு. #Thalapathy69 #Coolie #CinemaBuzz #AmazeTimes #Kollywood',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
    views: '210.8K',
    likes: '34.6K',
    url: 'https://www.instagram.com/amazetimes/?hl=en',
    videoUrl: 'https://www.instagram.com/amazetimes/?hl=en'
  },
  {
    id: 'fb-vid-2',
    platform: 'facebook',
    type: 'video',
    author: 'Amaze Times Official',
    handle: 'amazetimesnews',
    time: '5 மணி நேரத்திற்கு முன்',
    duration: '02:30',
    title: 'ஐபிஎல் 2026: சிஎஸ்கே அணியின் புதிய அதிரடி வியூகம் - தோனி சிறப்பு பேட்டி வீடியோ! 🏏⚡',
    caption: 'சேப்பாக்கம் மைதானத்தில் சென்னை சூப்பர் கிங்ஸ் அணியின் தீவிர பயிற்சி முகாம் மற்றும் வியூகம். #CSK #MSDhoni #IPL2026 #AmazeTimesSports #WhistlePodu',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800',
    views: '158.4K',
    likes: '14.9K',
    url: 'https://www.facebook.com/amazetimes',
    videoUrl: 'https://www.facebook.com/amazetimes'
  },
  {
    id: 'ig-reel-3',
    platform: 'instagram',
    type: 'reel',
    author: 'Amaze Times',
    handle: '@amazetimes_official',
    time: '6 மணி நேரத்திற்கு முன்',
    duration: '00:45',
    title: 'ஆவின் பொருட்களின் புதிய விலை நிலவரம்: பால் உற்பத்தியாளர்களின் நேரடி கருத்து! 🥛💰',
    caption: 'பால் உற்பத்தியாளர்களின் வாழ்வாதாரத்தை மேம்படுத்தும் நோக்கில் அரசு எடுத்துள்ள நடவடிக்கை குறித்த வீடியோ. #Aavin #DairyFarmers #TamilNaduNews #AmazeTimes',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800',
    views: '78.2K',
    likes: '8.1K',
    url: 'https://www.instagram.com/amazetimes/?hl=en',
    videoUrl: 'https://www.instagram.com/amazetimes/?hl=en'
  },
  {
    id: 'fb-vid-3',
    platform: 'facebook',
    type: 'video',
    author: 'Amaze Times Official',
    handle: 'amazetimesnews',
    time: '8 மணி நேரத்திற்கு முன்',
    duration: '04:15',
    title: 'தேனி மாவட்ட சிறை கைதிகள் தப்பியோட்ட விவகாரம்: 9 காவலர்கள் சஸ்பென்ட் பின்னணி! 🚨⚖️',
    caption: 'கடந்த 31 ஆண்டுகளில் இல்லாத பாதுகாப்பு வீழ்ச்சியாகக் கருதப்படும் இச்சம்பவத்தின் உண்மைப் பின்னணி வீடியோ ஆய்வு. #TheniPrison #CrimeNews #AmazeTimes #TamilNaduPolice',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    views: '112.5K',
    likes: '9.8K',
    url: 'https://www.facebook.com/amazetimes',
    videoUrl: 'https://www.facebook.com/amazetimes'
  }
];

async function syncReels() {
  console.log('🔄 Syncing Instagram Reels & Facebook Videos to PostgreSQL social_media_settings...');
  const jsonStr = JSON.stringify(initialReels);
  await query(
    `UPDATE social_media_settings
     SET featured_reels = $1,
         instagram_url = 'https://www.instagram.com/amazetimes/?hl=en',
         instagram_handle = '@amazetimes_official',
         facebook_url = 'https://www.facebook.com/amazetimes',
         facebook_handle = 'amazetimesnews'
     WHERE id = 1;`,
    [jsonStr]
  );
  console.log('🎉 Successfully saved 6 Instagram Reels and Facebook Videos into PostgreSQL!');
  process.exit(0);
}

syncReels().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
