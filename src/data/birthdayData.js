// Default Repository for Dignitaries & Leaders Birthday Wishes - Amaze Times

export const checkIsTodayBirthday = (item) => {
  if (!item || item.isActive === false) return false;

  // Explicit admin override flag
  if (item.isToday === true) return true;

  const now = new Date();
  const currentMonthNum = now.getMonth() + 1; // 1-12
  const currentDateNum = now.getDate(); // 1-31
  const currentMonthStr = String(currentMonthNum).padStart(2, '0');
  const currentDateStr = String(currentDateNum).padStart(2, '0');
  const mmdd = `${currentMonthStr}-${currentDateStr}`; // e.g. "10-28"
  const mmddSlash = `${currentMonthStr}/${currentDateStr}`;

  // 1. Strict numeric match (MM-DD, DD-MM, YYYY-MM-DD)
  if (item.dob) {
    const cleanDob = String(item.dob).trim();
    if (cleanDob === mmdd || cleanDob === mmddSlash) return true;
    const parts = cleanDob.split(/[-/]/);
    if (parts.length === 2) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      if ((p1 === currentMonthNum && p2 === currentDateNum) || (p1 === currentDateNum && p2 === currentMonthNum)) {
        return true;
      }
    } else if (parts.length === 3) {
      const yearIndex = parts[0].length === 4 ? 0 : 2;
      const m = parseInt(parts[1], 10);
      const d = parseInt(yearIndex === 0 ? parts[2] : parts[0], 10);
      if (m === currentMonthNum && d === currentDateNum) return true;
    }
  }

  // 2. Parse text display date (Tamil and English month names)
  const textDate = String(item.dobDisplay || item.date || '').toLowerCase();
  if (textDate) {
    const monthNames = [
      { num: 1, keys: ['ஜனவரி', 'january', 'jan'] },
      { num: 2, keys: ['பிப்ரவரி', 'february', 'feb'] },
      { num: 3, keys: ['மார்ச்', 'march', 'mar'] },
      { num: 4, keys: ['ஏப்ரல்', 'april', 'apr'] },
      { num: 5, keys: ['மே', 'may'] },
      { num: 6, keys: ['ஜூன்', 'june', 'jun'] },
      { num: 7, keys: ['ஜூலை', 'july', 'jul'] },
      { num: 8, keys: ['ஆகஸ்ட்', 'august', 'aug'] },
      { num: 9, keys: ['செப்டம்பர்', 'september', 'sep'] },
      { num: 10, keys: ['அக்டோபர்', 'october', 'oct'] },
      { num: 11, keys: ['நவம்பர்', 'november', 'nov'] },
      { num: 12, keys: ['டிசம்பர்', 'december', 'dec'] }
    ];

    for (const m of monthNames) {
      if (m.keys.some(k => textDate.includes(k))) {
        const dayMatch = textDate.match(/\b([0-3]?[0-9])\b/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1], 10);
          if (m.num === currentMonthNum && day === currentDateNum) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

export const defaultBirthdayWishes = [
  {
    id: 'bday-1',
    name: 'மாண்புமிகு மு.க. ஸ்டாலின்',
    englishName: 'Hon. Thiru. M.K. Stalin',
    designation: 'முதலமைச்சர்',
    englishDesignation: 'Chief Minister of Tamil Nadu',
    department: 'தமிழ்நாடு அரசு',
    dob: '03-01',
    dobDisplay: 'மார்ச் 01',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    posterImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    wishesMessage: 'தமிழ்நாட்டின் வளம், தொழில் முன்னேற்றம் மற்றும் சமூக நீதிப் பயணத்தில் வரலாற்றுச் சாதனை படைக்கும் மாண்புமிகு முதலமைச்சர் அவர்களுக்கு அமேஸ் டைம்ஸ் ஆசிரியர் குழுவின் மனமார்ந்த பிறந்தநாள் நல்வாழ்த்துகள்!',
    englishWishMessage: 'Wishing our visionary Chief Minister a very Happy Birthday! May you be blessed with good health, long life, and enduring strength to lead Tamil Nadu towards greater heights of progress and prosperity.',
    district: 'சென்னை',
    isToday: false,
    showInHomepagePopup: true,
    socialYoutubeUrl: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    socialFacebookUrl: 'https://www.facebook.com/amazetimes',
    socialInstagramUrl: 'https://www.instagram.com/amazetimes/?hl=en',
    socialWhatsappUrl: 'https://whatsapp.com/channel/amazetimes',
    wishesCount: 1540,
    isActive: true
  },
  {
    id: 'bday-today-dignitary',
    name: 'திரு. ஆஷிஷ் புனியா IAS',
    englishName: 'Thiru. Ashish Punia IAS',
    designation: 'காரைக்குடி சார் ஆட்சியர் (Sub-Collector)',
    englishDesignation: 'Sub-Collector & Sub-Divisional Magistrate, Karaikudi',
    department: 'காரைக்குடி கோட்டம், சிவகங்கை மாவட்டம்',
    dob: '10-28',
    dobDisplay: 'அக்டோபர் 28',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    posterImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    wishesMessage: 'தங்களின் இந்தச் சிறப்புமிக்க பிறந்தநாளில், தங்களுக்கு நல்ல உடல்நலம், அளவற்ற மகிழ்ச்சி, மென்மேலும் வெற்றி மற்றும் பொது மக்களுக்குத் தன்னலமற்ற அர்ப்பணிப்புடன் தொடர்ந்து சேவையாற்றும் வலிமையும் கிடைக்க அமேஸ் டைம்ஸ் ஆசிரியர் குழுவின் மனமார்ந்த வாழ்த்துகள்!',
    englishWishMessage: 'Warmest Birthday Greetings to Thiru. Ashish Punia IAS! Wishing you robust health, unbounded happiness, and continued excellence in public administration and dedicated community service.',
    district: 'சிவகங்கை',
    isToday: true,
    showInHomepagePopup: true,
    socialYoutubeUrl: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    socialFacebookUrl: 'https://www.facebook.com/amazetimes',
    socialInstagramUrl: 'https://www.instagram.com/amazetimes/?hl=en',
    socialWhatsappUrl: 'https://whatsapp.com/channel/amazetimes',
    wishesCount: 680,
    isActive: true
  },
  {
    id: 'bday-2',
    name: 'மாண்புமிகு உதயநிதி ஸ்டாலின்',
    englishName: 'Hon. Thiru. Udhayanidhi Stalin',
    designation: 'துணை முதலமைச்சர்',
    englishDesignation: 'Deputy Chief Minister of Tamil Nadu',
    department: 'இளைஞர் நலன் மற்றும் விளையாட்டு மேம்பாட்டுத் துறை',
    dob: '11-27',
    dobDisplay: 'நவம்பர் 27',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    posterImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    wishesMessage: 'விளையாட்டுத் துறையிலும் இளைஞர் நலனிலும் புதிய பொலிவை உருவாக்கி சர்வதேச சாதனைகள் படைக்க வழிகாட்டும் மாண்புமிகு துணை முதலமைச்சர் அவர்களுக்கு அமேஸ் டைம்ஸ் ஆசிரியர் குழுவின் பிறந்தநாள் வாழ்த்துகள்!',
    englishWishMessage: 'Wishing Hon. Deputy Chief Minister Thiru. Udhayanidhi Stalin a very Happy Birthday! May you continue to inspire the youth and elevate sports and governance in Tamil Nadu to global standards.',
    district: 'சென்னை',
    isToday: false,
    showInHomepagePopup: true,
    socialYoutubeUrl: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    socialFacebookUrl: 'https://www.facebook.com/amazetimes',
    socialInstagramUrl: 'https://www.instagram.com/amazetimes/?hl=en',
    socialWhatsappUrl: 'https://whatsapp.com/channel/amazetimes',
    wishesCount: 1120,
    isActive: true
  },
  {
    id: 'bday-3',
    name: 'திருமதி. காகர்லா உஷா IAS',
    englishName: 'Tmt. Kakarla Usha IAS',
    designation: 'முதன்மைச் செயலாளர்',
    englishDesignation: 'Principal Secretary to Government of Tamil Nadu',
    department: 'பள்ளிக் கல்வித் துறை, தமிழ்நாடு',
    dob: '09-25',
    dobDisplay: 'செப்டம்பர் 25',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    posterImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    wishesMessage: 'தமிழ்நாட்டின் கல்வித்துறை மேம்பாட்டிற்கும் அரசுப் பள்ளி மாணவர்கள் நல்வாழ்விற்கும் அயராது உழைக்கும் முதன்மைச் செயலாளர் அவர்களுக்கு அமேஸ் டைம்ஸ் வாசகர்கள் மற்றும் ஆசிரியர் குழுவின் இனிய பிறந்தநாள் வாழ்த்துகள்!',
    englishWishMessage: 'Heartiest birthday greetings to Tmt. Kakarla Usha IAS. Wishing you good health, joy, and grand success in transforming school education and student welfare across Tamil Nadu.',
    district: 'சென்னை',
    isToday: false,
    showInHomepagePopup: true,
    socialYoutubeUrl: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    socialFacebookUrl: 'https://www.facebook.com/amazetimes',
    socialInstagramUrl: 'https://www.instagram.com/amazetimes/?hl=en',
    socialWhatsappUrl: 'https://whatsapp.com/channel/amazetimes',
    wishesCount: 890,
    isActive: true
  }
];
