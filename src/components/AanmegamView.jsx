import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AanmegamView({ onOpenArticle, onSpeak, onBookmark, savedBookmarks = [] }) {
  // 12 Zodiac signs state
  const [signs, setSigns] = useState([]);
  const [activeSignIndex, setActiveSignIndex] = useState(0);
  const [isLoadingZodiac, setIsLoadingZodiac] = useState(false);

  // Reader prayer/experience form state
  const [prayerText, setPrayerText] = useState('');
  const [prayerName, setPrayerName] = useState('');
  const [isPrayerSubmitted, setIsPrayerSubmitted] = useState(false);

  // Selected temple tab
  const [activeTempleCategory, setActiveTempleCategory] = useState('all');

  const fallbackSigns = [
    { id: 1, sign_key: 'aries', name_ta: 'மேஷம்', symbol: '♈', planet_ta: 'செவ்வாய்', prediction_text: 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். குடும்பத்தில் மகிழ்ச்சி நிலவும். பொருளாதார நிலை சீராக இருக்கும். இறை வழிபாட்டால் கூடுதல் நன்மை உண்டாகும்.', lucky_number: '9', lucky_color: 'சிகப்பு', lucky_direction: 'கிழக்கு' },
    { id: 2, sign_key: 'taurus', name_ta: 'ரிஷபம்', symbol: '♉', planet_ta: 'சுக்கிரன்', prediction_text: 'நண்பர்கள் மூலம் எதிர்பாராத உதவிகள் கிடைக்கும். நீண்ட நாள் பணப் பாக்கிகள் வசூலாகும். ஆரோக்கியத்தில் கூடுதல் கவனம் தேவை.', lucky_number: '6', lucky_color: 'வெள்ளை', lucky_direction: 'தெற்கு' },
    { id: 3, sign_key: 'gemini', name_ta: 'மிதுனம்', symbol: '♊', planet_ta: 'புதன்', prediction_text: 'புதிய திட்டங்களை செயல்படுத்த நல்ல நாள். சுபச் செய்திகள் வந்து சேரும். உத்தியோகத்தில் மேலதிகாரிகளின் பாராட்டு கிடைக்கும்.', lucky_number: '5', lucky_color: 'பச்சை', lucky_direction: 'வடக்கு' },
    { id: 4, sign_key: 'cancer', name_ta: 'கடகம்', symbol: '♋', planet_ta: 'சந்திரன்', prediction_text: 'மனக்குழப்பங்கள் நீங்கி தெளிவு பிறக்கும். தாயாரின் உடல்நலத்தில் முன்னேற்றம் ஏற்படும். ஆன்மிகப் பயணங்களுக்கான வாய்ப்பு கூடும்.', lucky_number: '2', lucky_color: 'வெள்ளி', lucky_direction: 'வடமேற்கு' },
    { id: 5, sign_key: 'leo', name_ta: 'சிம்மம்', symbol: '♌', planet_ta: 'சூரியன்', prediction_text: 'சுயமுயற்சியால் காரியங்கள் வெற்றியாகும். உத்தியோகத்தில் பதவி உயர்வுக்கான வாய்ப்புகள் அமையும். வாக்குவாதங்களைத் தவிர்க்கவும்.', lucky_number: '1', lucky_color: 'தங்கம் / மஞ்சள்', lucky_direction: 'கிழக்கு' },
    { id: 6, sign_key: 'virgo', name_ta: 'கன்னி', symbol: '♍', planet_ta: 'புதன்', prediction_text: 'திட்டமிட்ட காரியங்கள் தடையின்றி நடக்கும். உறவினர்கள் வருகையால் வீடு உற்சாகமடையும். செலவுகளைக் கட்டுப்படுத்துவது நல்லது.', lucky_number: '5', lucky_color: 'பச்சை', lucky_direction: 'வடக்கு' },
    { id: 7, sign_key: 'libra', name_ta: 'துலாம்', symbol: '♎', planet_ta: 'சுக்கிரன்', prediction_text: 'வியாபாரத்தில் எதிர்பார்த்த லாபம் கிடைக்கும். கூட்டுத் தொழிலில் சுமுகமான நிலை இருக்கும். கலைத்துறையினருக்கு புதிய அங்கீகாரம்.', lucky_number: '7', lucky_color: 'நீலம்', lucky_direction: 'மேற்கு' },
    { id: 8, sign_key: 'scorpio', name_ta: 'விருச்சிகம்', symbol: '♏', planet_ta: 'செவ்வாய்', prediction_text: 'எதிர்பாராத பணவரவு உண்டு. தைரியத்துடன் எடுக்கும் முடிவுகள் சாதகமான பலன் தரும். சுப காரிய பேச்சுவார்த்தைகள் தொடங்கும்.', lucky_number: '9', lucky_color: 'சிவப்பு', lucky_direction: 'தெற்கு' },
    { id: 9, sign_key: 'sagittarius', name_ta: 'தனுசு', symbol: '♐', planet_ta: 'குரு', prediction_text: 'குருவருளால் நன்மைகள் பெருகும். உயர்கல்வி மற்றும் வெளிநாட்டு வாய்ப்புகள் கைகூடும். ஆன்மிகப் பணிகளில் மனம் லயிக்கும்.', lucky_number: '3', lucky_color: 'மஞ்சள்', lucky_direction: 'வடகிழக்கு' },
    { id: 10, sign_key: 'capricorn', name_ta: 'மகரம்', symbol: '♑', planet_ta: 'சனி', prediction_text: 'கடின உழைப்பிற்கு ஏற்ற நற்பலன்கள் கிட்டும். பழைய கடன்கள் அடைபடும். குடும்ப பெரியவர்களின் ஆசியைப் பெற்று மகிழ்வீர்கள்.', lucky_number: '8', lucky_color: 'கருநீலம்', lucky_direction: 'மேற்கு' },
    { id: 11, sign_key: 'aquarius', name_ta: 'கும்பம்', symbol: '♒', planet_ta: 'சனி', prediction_text: 'சமூகத்தில் மதிப்பு கூடும். எதிர்பாராத பயணம் உண்டாகலாம். வாகனப் பராமரிப்பில் சிறு கவனம் தேவை. இஷ்ட தெய்வ வழிபாடு பலன் தரும்.', lucky_number: '4', lucky_color: 'சாம்பல்', lucky_direction: 'தென்மேற்கு' },
    { id: 12, sign_key: 'pisces', name_ta: 'மீனம்', symbol: '♓', planet_ta: 'குரு', prediction_text: 'எடுத்த காரியங்களில் வெற்றி நிச்சயம். ஆன்மிகத் திருத்தலங்களுக்குச் செல்லும் யோகம் உண்டாகும். பொருளாதார வளம் பெருகும்.', lucky_number: '3', lucky_color: 'வெளிர் மஞ்சள்', lucky_direction: 'வடக்கு' }
  ];

  useEffect(() => {
    const fetchZodiac = async () => {
      setIsLoadingZodiac(true);
      try {
        const res = await api.getZodiacToday();
        if (res.success && res.signs?.length > 0) {
          setSigns(res.signs);
        } else {
          setSigns(fallbackSigns);
        }
      } catch (err) {
        setSigns(fallbackSigns);
      } finally {
        setIsLoadingZodiac(false);
      }
    };
    fetchZodiac();
  }, []);

  const activeSignsList = signs.length > 0 ? signs : fallbackSigns;
  const activeSign = activeSignsList[activeSignIndex] || activeSignsList[0];

  // Panchangam Data
  const panchangamData = {
    year: 'குரோதி வருடம்',
    ayanam: 'தட்சிணாயனம்',
    month: 'புரட்டாசி 26',
    tithi: 'சுக்ல பக்ஷ தசமி (இரவு 08:42 வரை)',
    nakshatra: 'திருவோணம் (பிற்பகல் 03:15 வரை)',
    yogam: 'சித்த யோகம்',
    nallaNeram: 'காலை 09:15 - 10:15 | மாலை 04:45 - 05:45',
    gowriNeram: 'காலை 10:45 - 11:45 | இரவு 07:30 - 08:30',
    rahuKalam: 'பிற்பகல் 01:30 - 03:00',
    yamakandam: 'காலை 06:00 - 07:30',
    kuligai: 'காலை 09:00 - 10:30',
    chandrashtamam: 'அஸ்வினி, பரணி'
  };

  // Famous Temples Directory
  const templesList = [
    {
      id: 'temple_1',
      title: 'மதுரை மீனாட்சி சுந்தரேஸ்வரர் திருக்கோயில்',
      category: 'அம்மன் தலம்',
      location: 'மதுரை மாவட்டம்',
      image: 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80',
      desc: 'உலகப் புகழ்பெற்ற பாண்டிய நாட்டின் அஷ்டசக்தி மண்டபம், ஆயிரங்கால் மண்டபம் மற்றும் பொற்றாமரைக் குளம் கொண்ட மகோன்னத ஆன்மிகத் திருத்தலம்.',
      deity: 'அருள்மிகு மீனாட்சி அம்மன், சுந்தரேஸ்வரர்',
      history: 'மன்னர் திருமலை நாயக்கரால் திருப்பணிகள் செய்யப்பட்டு, நான்கு பிரம்மாண்ட கோபுரங்களுடன் வானுயர நிமிர்ந்து நிற்கும் தமிழர்களின் கட்டிடக்கலை அதிசயம்.'
    },
    {
      id: 'temple_2',
      title: 'தஞ்சாவூர் பிரகதீஸ்வரர் பெரிய கோயில்',
      category: 'சிவன் தலம்',
      location: 'தஞ்சாவூர் மாவட்டம்',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      desc: 'மாமன்னன் முதலாம் ராஜராஜ சோழனால் கட்டப்பட்ட ஆயிரம் ஆண்டுகள் பழமையான யுனெஸ்கோ உலகப் பாரம்பரியச் சின்னம்.',
      deity: 'அருள்மிகு பெருவுடையார், பெரியநாயகி',
      history: '80 டன் எடையுள்ள ஒரே கல்லால் செதுக்கப்பட்ட விமான உச்சி கலசமும், அணைக்க முடியாத வாஸ்து நுணுக்கங்களும் சோழப் பேரரசின் பெருமையைப் பறைசாற்றுகின்றன.'
    },
    {
      id: 'temple_3',
      title: 'திருச்செந்தூர் சுப்பிரமணிய சுவாமி திருக்கோயில்',
      category: 'முருகன் தலம்',
      location: 'தூத்துக்குடி மாவட்டம்',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      desc: 'அறுபடை வீடுகளில் இரண்டாம் படை வீடும், அலைகடல் கரையில் அமைந்துள்ள ஒரே முருகன் திருத்தலமும் ஆகும்.',
      deity: 'அருள்மிகு ஜெயந்திநாதர் (செந்திலாண்டவர்)',
      history: 'சூரபத்மனை வதம் செய்து தேவர்களைக் காத்த வரலாற்று சிறப்புமிக்க தலம். கடலின் உப்புக்காற்றிலும் சிதையாமல் கம்பீரமாக நிற்கும் 9 நிலை ராஜகோபுரம்.'
    },
    {
      id: 'temple_4',
      title: 'திருவண்ணாமலை அருணாசலேஸ்வரர் திருக்கோயில்',
      category: 'சிவன் தலம்',
      location: 'திருவண்ணாமலை',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      desc: 'பஞ்சபூத தலங்களில் அக்னி தலம். நினைத்தாலே முக்தி தரும் புண்ணிய பூமி மற்றும் பௌர்ணமி கிரிவல மகிமை.',
      deity: 'அருள்மிகு அருணாசலேஸ்வரர், உண்ணாமுலையம்மன்',
      history: 'கார்த்திகை தீபத் திருநாளில் மலை உச்சியில் மகா தீபம் ஏற்றப்படும் மகத்தான ஜோதி தலம். ரமண மகரிஷி மற்றும் சேஷாத்ரி சுவாமிகள் தவமிருந்த தலம்.'
    },
    {
      id: 'temple_5',
      title: 'ஸ்ரீரங்கம் ரங்கநாதசுவாமி திருக்கோயில்',
      category: 'பெருமாள் தலம்',
      location: 'திருச்சி மாவட்டம்',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
      desc: '108 வைணவ திவ்ய தேசங்களின் முதன்மை தலமும், பூலோக வைகுண்டம் என்று போற்றப்படும் காவேரி நதிக்கரை தலம்.',
      deity: 'அருள்மிகு ஸ்ரீரங்கநாதர், ரங்கநாயகி தாயார்',
      history: '7 பிரகாரங்கள், 21 கோபுரங்கள் மற்றும் ஆசியாவின் மிகப்பெரிய ராஜகோபுரத்தைக் கொண்ட பிரம்மாண்ட கோயில் வளாகம்.'
    },
    {
      id: 'temple_6',
      title: 'ராமேஸ்வரம் ராமநாதசுவாமி திருக்கோயில்',
      category: 'சிவன் தலம்',
      location: 'ராமநாதபுரம் மாவட்டம்',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      desc: '12 ஜோதிர்லிங்க தலங்களில் தமிழ்நாட்டில் அமைந்துள்ள ஒரே தலம் மற்றும் 22 புனித தீர்த்தங்களின் புண்ணிய பூமி.',
      deity: 'அருள்மிகு ராமநாதசுவாமி, பர்வதவர்த்தினி',
      history: 'ஸ்ரீராமபிரானால் மணலால் சிவலிங்கம் பிரதிஷ்டை செய்யப்பட்டு வணங்கப்பட்ட திருத்தலம். உலகப் புகழ்பெற்ற நீண்ட 1000 தூண்கள் கொண்ட பிரகாரம்.'
    }
  ];

  // Daily Slokas & Mantras
  const mantrasList = [
    {
      title: 'காயத்ரி மகா மந்திரம்',
      sanskrit: 'ஓம் பூர் புவஸ்ஸுவ: தத் ஸவிதுர் வரேண்யம் | பர்கோ தேவஸ்ய தீமஹி தியோ யோந: ப்ரசோதயாத் ||',
      meaning: 'ஒளிரும் சூரியனைப் போல பிரபஞ்சத்தை இயக்கும் பரம்பொருளை வணங்குகிறோம். அந்த தெய்வீக ஒளி நமது அறிவை நல்வழியில் வழிநடத்தட்டும்.',
      benefits: 'மன அமைதி, நினைவாற்றல், நேர்மறை ஆற்றல் பெருகும்.'
    },
    {
      title: 'மகா மிருத்யுஞ்சய மந்திரம்',
      sanskrit: 'ஓம் த்ரியம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்தனம் | உர்வாருகமிவ பந்தனான் ம்ருத்யோர் முக்ஷீய மாம்ருதாத் ||',
      meaning: 'முக்கண்ணனான சிவபெருமானை போற்றுகிறோம். வெள்ளரிப் பழம் காம்பிலிருந்து இயல்பாக விடுபடுவது போல, நம்மை மரண பயத்திலிருந்தும் நோய்களிலிருந்தும் விடுவித்து முக்தியளிக்க வேண்டுகிறோம்.',
      benefits: 'உடல் ஆரோக்கியம், தீய சக்திகள் நீங்கும், ஆயுள் பலம் கூடும்.'
    },
    {
      title: 'கந்த சஷ்டி கவச முக்கிய வரிகள்',
      sanskrit: 'துதிப்போர்க்கு வல்வினைபோம் துன்பம்போம் நெஞ்சில் பதிப்போர்க்குச் செல்வம் பலித்துக் கதித்தோங்கும்!',
      meaning: 'முருகப்பெருமானின் கவசத்தைத் துதிப்பவர்களுக்கு தீவினைகளும் துன்பங்களும் நீங்கி, சகல செல்வங்களும் கைகூடும்.',
      benefits: 'பயம் நீங்குதல், கடன் தொல்லை தீர்தல், எடுத்த காரியங்களில் வெற்றி.'
    }
  ];

  // Spiritual Q&A Advice
  const spiritualQa = [
    {
      q: 'வீட்டில் விளக்கேற்றும் சரியான நேரம் எது? எந்த திசையில் தீபம் ஏற்ற வேண்டும்?',
      a: 'காலை பிரம்ம முகூர்த்தமான 04:30 முதல் 06:00 மணி வரையிலும், மாலை 05:30 முதல் 06:30 மணி வரையிலும் தீபம் ஏற்றுவது சிறந்தது. கிழக்கு திசை நோக்கி தீபம் ஏற்றினால் துன்பங்கள் நீங்கும், வடக்கு திசை நோக்கி ஏற்றினால் தனலாபம் பெருகும். மேற்கு நோக்கி ஏற்றினால் கடன் சுமை தீரும். தெற்கு நோக்கி தீபம் ஏற்றக் கூடாது.'
    },
    {
      q: 'பூஜை அறையில் வைக்கக் கூடாத படங்கள் மற்றும் வழிபாட்டுப் பொருட்கள் எவை?',
      a: 'உடைந்த சிலைகள், கிழிந்த படங்கள், ருத்ர தாண்டவ அல்லது உக்கிர கோப வடிவப் படங்கள், மற்றும் போர்க்களக் காட்சிகளை வீட்டில் வைக்கக் கூடாது. அதேபோல் உலர்ந்த மலர்களை உடனுக்குடன் அகற்றி தூய்மையாக வைத்திருக்க வேண்டும்.'
    },
    {
      q: 'துளசி மாட வழிபாட்டின் மகத்துவம் என்ன? எப்போது நீர் ஊற்ற வேண்டும்?',
      a: 'துளசி விஷ்ணு பிரியை. தினமும் காலையில் குளித்து முடித்து துளசிக்கு நீர் ஊற்றி மூன்று முறை வலம் வந்தால் தோஷங்கள் நீங்கும். செவ்வாய், வெள்ளி மற்றும் ஞாயிற்றுக்கிழமைகளில் துளசி இலையை பறிக்கக் கூடாது.'
    }
  ];

  const handlePrayerSubmit = (e) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    setIsPrayerSubmitted(true);
    setPrayerText('');
    setPrayerName('');
    setTimeout(() => setIsPrayerSubmitted(false), 5000);
  };

  const filteredTemples = activeTempleCategory === 'all'
    ? templesList
    : templesList.filter(t => t.category.includes(activeTempleCategory));

  return (
    <div class="space-y-8 max-w-[1380px] mx-auto py-2 selection:bg-amber-500 selection:text-slate-950 font-subtitle">
      
      {/* 1. SACRED TRADITIONAL MASTHEAD */}
      <section class="bg-gradient-to-r from-[#2B0E14] via-[#4A1525] to-[#1F0A10] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-500/30 relative overflow-hidden">
        {/* Subtle Ornamental Diya / Om Watermark */}
        <div class="absolute -right-8 -bottom-8 opacity-10 pointer-events-none select-none text-[200px] font-black text-amber-300">
          🕉️
        </div>

        <div class="relative z-10 space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-500/20 pb-3">
            <span class="text-amber-300 font-extrabold text-xs sm:text-sm tracking-wider flex items-center gap-1.5">
              <span>🪔</span>
              <span>ஓம் நமச்சிவாய • ஓம் நமோ நாராயணாய • வெற்றிவேல் முருகனுக்கு அரோகரா</span>
            </span>
            <span class="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold px-3 py-0.5 rounded-full">
              தினசரி பக்தி மலர்
            </span>
          </div>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 class="font-title font-extrabold text-2xl sm:text-3xl md:text-4xl text-amber-300 flex items-center gap-3">
                <span>அமேஸ் டைம்ஸ் ஆன்மிக மலர்</span>
                <span class="bg-brand-red text-white text-xs font-subtitle font-black px-2.5 py-1 rounded-md tracking-wider">
                  பக்தி &amp; பண்பாடு
                </span>
              </h1>
              <p class="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
                தினசரி பஞ்சாங்கம், 12 ராசி பலன்கள், பிரசித்தி பெற்ற திருக்கோயில்கள், தல வரலாறுகள் மற்றும் சக்திவாய்ந்த மந்திரங்களின் புண்ணியக் களம்.
              </p>
            </div>

            {/* Quick Audio Chant Player */}
            {onSpeak && (
              <button
                onClick={() => onSpeak('ஓம் நமச்சிவாய. அமேஸ் டைம்ஸ் ஆன்மிக மலர் தங்களை அன்புடன் வரவேற்கிறது. இன்றைய பஞ்சாங்கம் மற்றும் ராசி பலன்களை அறிந்துகொள்ளுங்கள்.')}
                class="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 flex-shrink-0"
              >
                <span class="material-symbols-outlined text-[18px]">volume_up</span>
                <span>ஆன்மிகக் குரல் கேட்க</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. DAILY PANCHANGAM & AUSPICIOUS TIMES RIBBON */}
      <section class="bg-white dark:bg-[#0E1628] rounded-3xl p-5 sm:p-6 shadow-md border border-amber-200 dark:border-amber-950/60 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <h2 class="font-title font-extrabold text-lg text-slate-900 dark:text-amber-300 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-500 text-[22px]">calendar_today</span>
            <span>இன்றைய பஞ்சாங்கம் &amp; சுப நேரங்கள் ({panchangamData.month})</span>
          </h2>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">
            {panchangamData.year} • {panchangamData.ayanam}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="bg-amber-50/70 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/30 text-center">
            <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold block uppercase">திதி</span>
            <span class="font-title font-extrabold text-xs text-slate-900 dark:text-white block mt-0.5">{panchangamData.tithi}</span>
          </div>

          <div class="bg-amber-50/70 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/30 text-center">
            <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold block uppercase">நட்சத்திரம்</span>
            <span class="font-title font-extrabold text-xs text-slate-900 dark:text-white block mt-0.5">{panchangamData.nakshatra}</span>
          </div>

          <div class="bg-emerald-50/70 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/30 text-center">
            <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block uppercase">நல்ல நேரம்</span>
            <span class="font-title font-extrabold text-xs text-slate-900 dark:text-white block mt-0.5">{panchangamData.nallaNeram}</span>
          </div>

          <div class="bg-emerald-50/70 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/30 text-center">
            <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block uppercase">கௌரி நல்ல நேரம்</span>
            <span class="font-title font-extrabold text-xs text-slate-900 dark:text-white block mt-0.5">{panchangamData.gowriNeram}</span>
          </div>

          <div class="bg-rose-50/70 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 text-center">
            <span class="text-[10px] text-rose-700 dark:text-rose-400 font-bold block uppercase">ராகு காலம்</span>
            <span class="font-title font-extrabold text-xs text-slate-900 dark:text-white block mt-0.5">{panchangamData.rahuKalam}</span>
          </div>

          <div class="bg-rose-50/70 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 text-center">
            <span class="text-[10px] text-rose-700 dark:text-rose-400 font-bold block uppercase">எமகண்டம்</span>
            <span class="font-title font-extrabold text-xs text-slate-900 dark:text-white block mt-0.5">{panchangamData.yamakandam}</span>
          </div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 flex-wrap gap-2">
          <span>⚡ குளிகை: <strong class="text-slate-900 dark:text-white">{panchangamData.kuligai}</strong></span>
          <span>🌙 யோகம்: <strong class="text-slate-900 dark:text-white">{panchangamData.yogam}</strong></span>
          <span>⚠️ சந்திராஷ்டமம்: <strong class="text-rose-600 dark:text-rose-400">{panchangamData.chandrashtamam}</strong></span>
        </div>
      </section>

      {/* 3. INTERACTIVE 12 RASI PALAN (ராசி பலன்கள்) WIDGET */}
      <section class="bg-white dark:bg-[#0E1628] rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 flex-wrap gap-3">
          <div>
            <h2 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500 text-[24px]">auto_awesome</span>
              <span>இன்றைய 12 ராசி பலன்கள் (Daily Horoscope)</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              உங்கள் ராசியைத் தேர்ந்தெடுத்து இன்றைய துல்லியமான பலன்களை வாசித்து அறியுங்கள்
            </p>
          </div>

          {onSpeak && activeSign && (
            <button
              onClick={() => onSpeak(`${activeSign.name_ta} ராசி பலன்: ${activeSign.prediction_text}`)}
              class="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl border border-amber-300/60 transition-all cursor-pointer shadow-sm"
            >
              <span class="material-symbols-outlined text-[16px]">volume_up</span>
              <span>ராசி பலன் கேட்க</span>
            </button>
          )}
        </div>

        {/* 12 Signs Icon Selector Bar */}
        <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {activeSignsList.map((s, idx) => {
            const isSelected = idx === activeSignIndex;
            return (
              <button
                key={s.sign_key || idx}
                onClick={() => setActiveSignIndex(idx)}
                class={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-t from-brand-red to-rose-600 text-white border-brand-red shadow-lg shadow-brand-red/30 scale-105'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span class="text-xl sm:text-2xl mb-1">{s.symbol}</span>
                <span class="font-title font-extrabold text-xs whitespace-nowrap">{s.name_ta}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Sign Detailed Card */}
        {activeSign && (
          <div class="bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border border-amber-300/40 dark:border-amber-800/40 rounded-3xl p-6 sm:p-8 space-y-5 animate-in fade-in">
            <div class="flex items-center justify-between flex-wrap gap-4 border-b border-amber-200 dark:border-amber-900/40 pb-4">
              <div class="flex items-center gap-3">
                <span class="text-4xl sm:text-5xl">{activeSign.symbol}</span>
                <div>
                  <h3 class="font-title font-black text-2xl text-slate-900 dark:text-white">
                    {activeSign.name_ta} ராசி
                  </h3>
                  <p class="text-xs text-amber-700 dark:text-amber-400 font-bold">
                    ராசி அதிபதி: {activeSign.planet_ta}
                  </p>
                </div>
              </div>

              {/* Lucky Indicators */}
              <div class="flex items-center gap-2 flex-wrap text-xs font-bold">
                <span class="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-xl border border-amber-300/50">
                  அதிர்ஷ்ட எண்: <strong>{activeSign.lucky_number}</strong>
                </span>
                <span class="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-3 py-1 rounded-xl border border-rose-300/50">
                  அதிர்ஷ்ட நிறம்: <strong>{activeSign.lucky_color}</strong>
                </span>
                <span class="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-xl border border-indigo-300/50">
                  அதிர்ஷ்ட திசை: <strong>{activeSign.lucky_direction}</strong>
                </span>
              </div>
            </div>

            <p class="font-serif-reading text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
              "{activeSign.prediction_text}"
            </p>
          </div>
        )}
      </section>

      {/* 4. FAMOUS TEMPLES & SACRED HERITAGE (பிரசித்தி பெற்ற திருக்கோயில்கள்) */}
      <section class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 class="font-title font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500 text-[26px]">temple_hindu</span>
              <span>பிரசித்தி பெற்ற தமிழகத் திருக்கோயில்கள் &amp; தல வரலாறு</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              தமிழ்நாட்டின் வரலாற்றுப் பெருமைமிக்க ஆலயங்களின் மகத்துவங்களும் விசேஷங்களும்
            </p>
          </div>

          {/* Filter Pills */}
          <div class="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['all', 'சிவன் தலம்', 'அம்மன் தலம்', 'முருகன் தலம்', 'பெருமாள் தலம்'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTempleCategory(cat)}
                class={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTempleCategory === cat
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat === 'all' ? 'அனைத்தும்' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Temple Cards Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemples.map((temple) => (
            <article
              key={temple.id}
              class="bg-white dark:bg-[#0E1628] rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div class="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={temple.image}
                    alt={temple.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div class="absolute top-3 left-3 flex items-center gap-1.5">
                    <span class="bg-brand-red text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
                      {temple.category}
                    </span>
                    <span class="bg-black/60 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      {temple.location}
                    </span>
                  </div>
                </div>

                <div class="p-5 space-y-3">
                  <h3 class="font-title font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-red dark:group-hover:text-amber-400 transition-colors leading-snug">
                    {temple.title}
                  </h3>
                  <p class="text-xs text-amber-700 dark:text-amber-400 font-bold">
                    மூலவர்: {temple.deity}
                  </p>
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {temple.desc}
                  </p>
                  <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {temple.history}
                  </div>
                </div>
              </div>

              <div class="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  onClick={() => onOpenArticle({
                    id: temple.id,
                    title: temple.title,
                    category: temple.category,
                    desc: `${temple.desc} மூலவர்: ${temple.deity}. தல வரலாறு: ${temple.history}`,
                    image: temple.image
                  })}
                  class="text-xs font-bold text-brand-red dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>முழு தல வரலாறு வாசிக்க</span>
                  <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. DAILY MANTRAS & SLOKAS (தினசரி பக்தி மலர் & மந்திரங்கள்) */}
      <section class="bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border border-amber-300/50 dark:border-amber-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-3 border-b border-amber-200 dark:border-amber-900/40 pb-4">
          <div>
            <h2 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500 text-[24px]">menu_book</span>
              <span>தினசரி காயத்ரி &amp; சக்திவாய்ந்த மந்திரங்கள்</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              தினசரி வழிபாட்டில் உச்சரிக்க வேண்டிய புனித மந்திரங்களும் அவற்றின் தமிழ்ப் பொருளும்
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mantrasList.map((mantra, idx) => (
            <div
              key={idx}
              class="bg-white dark:bg-[#0E1628] rounded-2xl p-5 shadow-sm border border-amber-200 dark:border-amber-950/80 space-y-3 flex flex-col justify-between"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="font-title font-black text-sm text-brand-red dark:text-amber-400">
                    {mantra.title}
                  </h4>
                  {onSpeak && (
                    <button
                      onClick={() => onSpeak(`${mantra.title}: ${mantra.sanskrit}. இதன் விளக்கம்: ${mantra.meaning}`)}
                      class="text-slate-500 hover:text-amber-500 cursor-pointer p-1 rounded-lg"
                      title="மந்திரம் கேட்க"
                    >
                      <span class="material-symbols-outlined text-[18px]">volume_up</span>
                    </button>
                  )}
                </div>

                <p class="font-serif-reading text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  {mantra.sanskrit}
                </p>

                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>பொருள்:</strong> {mantra.meaning}
                </p>
              </div>

              <div class="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                ✨ பலன்: {mantra.benefits}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SPIRITUAL Q&A & ADVICE (குருஜி ஆன்மிக கேள்வி-பதில்) */}
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Guruji Q&A Accordion */}
        <div class="lg:col-span-8 bg-white dark:bg-[#0E1628] rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
          <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500 text-[24px]">psychology_alt</span>
              <span>ஆன்மிக சந்தேகங்களும் விளக்கங்களும் (Spiritual Q&amp;A)</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              வீட்டு வழிபாடு, தோஷ பரிகாரங்கள் மற்றும் ஆன்மிக சாஸ்திர விளக்கங்கள்
            </p>
          </div>

          <div class="space-y-4">
            {spiritualQa.map((qa, idx) => (
              <div
                key={idx}
                class="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <h4 class="font-title font-bold text-sm text-slate-900 dark:text-white flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-brand-red text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                    கே
                  </span>
                  <span>{qa.q}</span>
                </h4>
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-7">
                  {qa.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Reader Prayer Request Form */}
        <div class="lg:col-span-4 bg-gradient-to-b from-[#240A10] to-[#120508] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-amber-500/30 space-y-4">
          <div class="space-y-1">
            <h3 class="font-title font-extrabold text-base text-amber-300 flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">prayer_times</span>
              <span>பிரார்த்தனை &amp; அனுபவப் பகிர்வு</span>
            </h3>
            <p class="text-xs text-slate-300">
              உங்கள் வேண்டுதல்கள் அல்லது திருக்கோயில் அனுபவங்களை ஆன்மிகப் பிரிவுக்கு அனுப்பலாம்.
            </p>
          </div>

          {isPrayerSubmitted ? (
            <div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center space-y-1">
              <p>🪔 உங்கள் வேண்டுதல் பதிவு செய்யப்பட்டது!</p>
              <p class="text-[10px] text-emerald-400 font-normal">இறைவன் திருவருளால் உங்கள் கோரிக்கை நிறைவேற வாழ்த்துகிறோம்.</p>
            </div>
          ) : (
            <form onSubmit={handlePrayerSubmit} class="space-y-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">
                  உங்கள் பெயர் / ஊர்
                </label>
                <input
                  type="text"
                  value={prayerName}
                  onChange={(e) => setPrayerName(e.target.value)}
                  placeholder="உதாரணம்: சீனிவாசன், மதுரை"
                  class="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">
                  வேண்டுதல் / பக்தி அனுபவம்
                </label>
                <textarea
                  rows="4"
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  required
                  placeholder="உங்கள் பிரார்த்தனைக் குறிப்பை இங்கே எழுதுங்கள்..."
                  class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <button
                type="submit"
                class="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow cursor-pointer transition-all hover:scale-105"
              >
                சமர்ப்பிக்க (Submit Prayer)
              </button>
            </form>
          )}

          <div class="pt-2 border-t border-white/10 text-[10px] text-slate-400 space-y-1">
            <p>🕉️ வாரந்தோறும் சிறப்பான ஆன்மிக அனுபவங்கள் அமேஸ் டைம்ஸ் நாளிதழில் வெளியிடப்படும்.</p>
          </div>
        </div>

      </section>

    </div>
  );
}
