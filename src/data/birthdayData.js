// Default Repository for Tamil Nadu Government Officials & Leaders Birthday Wishes

export const checkIsTodayBirthday = (item) => {
  if (!item) return false;

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDate = String(now.getDate()).padStart(2, '0');
  const mmdd = `${currentMonth}-${currentDate}`; // e.g. "10-09"
  const mmddSlash = `${currentMonth}/${currentDate}`;

  // Explicit flag check
  if (item.isToday === true) return true;

  // DOB matching
  if (item.dob) {
    const cleanDob = String(item.dob).trim();
    if (cleanDob.includes(mmdd) || cleanDob.includes(mmddSlash)) return true;
    const parts = cleanDob.split(/[-/]/);
    if (parts.length >= 2) {
      if (
        (parts[0] === currentMonth && parts[1] === currentDate) ||
        (parts[1] === currentMonth && parts[2] === currentDate) ||
        (parts[0] === currentDate && parts[1] === currentMonth)
      ) {
        return true;
      }
    }
  }

  // Real-time date matching
  if (item.date) {
    const cleanDate = String(item.date).trim();
    if (cleanDate.includes(mmdd) || cleanDate.includes(mmddSlash)) return true;
  }

  // Created on present date check
  if (item.createdAt || item.createdDate) {
    const itemDate = new Date(item.createdAt || item.createdDate);
    if (
      !isNaN(itemDate.getTime()) &&
      itemDate.getDate() === now.getDate() &&
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear()
    ) {
      return true;
    }
  }

  return false;
};

export const defaultBirthdayWishes = [
  {
    id: 'bday-1',
    name: 'மாண்புமிகு மு.க. ஸ்டாலின்',
    designation: 'முதலமைச்சர்',
    department: 'தமிழ்நாடு அரசு',
    dob: '10-09',
    dobDisplay: 'அக்டோபர் 09',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    wishesMessage: 'தமிழ்நாட்டின் வளம், தொழில் முன்னேற்றம் மற்றும் சமூக நீதிப் பயணத்தில் வரலாற்றுச் சாதனை படைக்கும் மாண்புமிகு முதலமைச்சர் அவர்களுக்கு மனமார்ந்த பிறந்தநாள் நல்வாழ்த்துகள்!',
    district: 'சென்னை',
    isToday: true,
    wishesCount: 1420,
    isActive: true
  },
  {
    id: 'bday-ashish',
    name: 'திரு. ஆஷிஷ் புனியா IAS',
    designation: 'காரைக்குடி சார் ஆட்சியர் (Sub-Collector)',
    department: 'காரைக்குடி கோட்டம், சிவகங்கை மாவட்டம்',
    dob: '10-09',
    dobDisplay: 'அக்டோபர் 09',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    wishesMessage: 'இனிய பிறந்தநாள் நல்வாழ்த்துகள் ஐயா! 💐 🎂 தங்களின் இந்தச் சிறப்புமிக்க பிறந்தநாளில், தங்களுக்கு நல்ல உடல்நலம், அளவற்ற மகிழ்ச்சி, மென்மேலும் வெற்றி மற்றும் நாட்டிற்குத் தன்னலமற்ற அர்ப்பணிப்புடனும், கடமை உணர்வுடனும் தொடர்ந்து சேவையாற்றும் வலிமையும் கிடைக்க மனமார்ந்த வாழ்த்துகளைத் தெரிவித்துக் கொள்கிறோம். கடமைக்கான தங்களின் அர்ப்பணிப்பும், சிறந்த தலைமைப் பண்பும் உண்மையிலேயே போற்றத்தக்கவை.',
    district: 'காரைக்குடி, சிவகங்கை',
    isToday: true,
    wishesCount: 500,
    isActive: true
  },
  {
    id: 'bday-2',
    name: 'மாண்புமிகு உதயநிதி ஸ்டாலின்',
    designation: 'துணை முதலமைச்சர்',
    department: 'இளைஞர் நலன் மற்றும் விளையாட்டு மேம்பாட்டுத் துறை',
    dob: '11-27',
    dobDisplay: 'நவம்பர் 27',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    wishesMessage: 'விளையாட்டுத் துறையிலும் இளைஞர் நலனிலும் புதிய பொலிவை உருவாக்கி சர்வதேச சாதனைகள் படைக்க வழிகாட்டும் மாண்புமிகு துணை முதலமைச்சர் அவர்களுக்கு பிறந்தநாள் வாழ்த்துகள்!',
    district: 'சென்னை',
    isToday: false,
    wishesCount: 980,
    isActive: true
  },
  {
    id: 'bday-3',
    name: 'திருமதி. காகர்லா உஷா IAS',
    designation: 'முதன்மைச் செயலாளர்',
    department: 'பள்ளிக் கல்வித் துறை, தமிழ்நாடு',
    dob: '09-25',
    dobDisplay: 'செப்டம்பர் 25',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    wishesMessage: 'தமிழ்நாட்டின் கல்வித்துறை மேம்பாட்டிற்கும் அரசுப் பள்ளி மாணவர்கள் நல்வாழ்விற்கும் அயராது உழைக்கும் முதன்மைச் செயலாளர் அவர்களுக்கு இனிய பிறந்தநாள் வாழ்த்துகள்!',
    district: 'தமிழ்நாடு',
    isToday: false,
    wishesCount: 640,
    isActive: true
  }
];
