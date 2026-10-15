import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Sparkles,
  Edit3,
  Save,
  Compass,
  Palette,
  Hash,
  ShieldCheck,
  Calendar,
  Building2,
  BookOpen,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Sun,
  Moon,
  Upload,
  Heart,
  BookMarked,
  Filter,
  Eye,
  Check
} from 'lucide-react';

const getTodayISO = () => new Date().toISOString().split('T')[0];
const getTamilDayName = (dateStr) => {
  if (!dateStr) return 'திங்கள்';
  const days = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  const parts = String(dateStr).split('-');
  if (parts.length < 3) return 'திங்கள்';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return 'திங்கள்';
  const dt = new Date(y, m - 1, d);
  const dayIdx = isNaN(dt.getDay()) ? 0 : dt.getDay();
  return days[dayIdx];
};


export const AdminAanmeegamManager = ({ initialSubTab }) => {
  const {
    horoscopeData,
    updateHoroscopeItem,
    panchangamData,
    updatePanchangamData,
    templeFestivals,
    addTempleFestival,
    updateTempleFestival,
    deleteTempleFestival,
    remediesData,
    addRemedyItem,
    updateRemedyItem,
    deleteRemedyItem,
    spiritualWisdom,
    addSpiritualWisdom,
    updateSpiritualWisdom,
    deleteSpiritualWisdom,
    christianData,
    updateChristianData,
    islamicData,
    updateIslamicData,
    showToast
  } = useApp();

  // Primary Faith Section Tab: 'hindu' | 'christian' | 'islamic'
  const [activeReligionTab, setActiveReligionTab] = useState('hindu');

  // Hindu Sub-Tab: 'rasi' | 'panchangam' | 'temples' | 'remedies' | 'wisdom'
  const [activeHinduSubTab, setActiveHinduSubTab] = useState(() => {
    if (initialSubTab === 'panchangam') return 'panchangam';
    if (initialSubTab === 'temples') return 'temples';
    return 'rasi';
  });

  useEffect(() => {
    if (initialSubTab === 'panchangam') setActiveHinduSubTab('panchangam');
    else if (initialSubTab === 'temples') setActiveHinduSubTab('temples');
    else if (initialSubTab === 'rasi-palan' || initialSubTab === 'rasi') setActiveHinduSubTab('rasi');
  }, [initialSubTab]);

  // =========================================================
  // 🔮 NEWSGURU STYLE RASI PALAN SYSTEM STATE (MATCHING IMAGE 2 & 3)
  // =========================================================
  const [rasiViewMode, setRasiViewMode] = useState('list'); // 'list' | 'create'
  const [filterLang, setFilterLang] = useState('all'); // 'all' | 'Tamil' | 'English'
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all' | 'DAY' | 'WEEK' | 'MONTH'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'PUBLISHED' | 'DRAFT'

  const [editingRasiRecord, setEditingRasiRecord] = useState(null);

  // Initial Seed Records matching Image 2!
  const [rasiRecords, setRasiRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('adutha_newsghuru_rasi_records');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'rec-1',
        datePeriod: '10/31/2026 to 11/29/2026',
        type: 'MONTH',
        language: 'English',
        createdBy: 'Editor User',
        status: 'PUBLISHED',
        title: 'Monthly Horoscope Prediction',
        date: '2026-10-31',
        dayName: 'திங்கள்',
        predictions: {
          aries: 'Great opportunities for growth in career and finance.',
          taurus: 'Stability in health and positive developments in family.',
          gemini: 'New business ventures will bring fruitful results.',
          cancer: 'Financial gains expected from investments.',
          leo: 'Recognition at workplace for hard work.',
          virgo: 'Favorable month for students and academics.',
          libra: 'Harmonious relationship and mental peace.',
          scorpio: 'Career growth and long distance travels.',
          sagittarius: 'Spiritual inclination and success in endeavors.',
          capricorn: 'Debt clearance and business expansion.',
          aquarius: 'Promotion and new job offers.',
          pisces: 'Unexpected gains and happy family moments.'
        }
      },
      {
        id: 'rec-2',
        datePeriod: '10/31/2026 to 11/29/2026',
        type: 'MONTH',
        language: 'Tamil',
        createdBy: 'Editor User',
        status: 'PUBLISHED',
        title: 'மாதாந்திர ராசிபலன்',
        date: '2026-10-31',
        dayName: 'திங்கள்',
        predictions: {
          aries: 'தொழில் மற்றும் நிதித்துறையில் வளர்ச்சி பெற சிறந்த வாய்ப்புகள்.',
          taurus: 'குடும்பத்தில் மகிழ்ச்சியும் உடல் ஆரோக்கியத்தில் ஸ்திரத்தன்மையும் நிலவும்.',
          gemini: 'புதிய தொழில் முயற்சிகள் நல்ல பலனைத் தரும்.',
          cancer: 'முதலீடுகளில் இருந்து லாபம் கிடைக்கும்.',
          leo: 'பணியிடத்தில் உங்கள் உழைப்புக்கு உரிய அங்கீகாரம் கிடைக்கும்.',
          virgo: 'மாணவர்களுக்கு கல்வித்துறையில் சாதகமான மாதம்.',
          libra: 'குடும்பத்தில் அமைதியும் நல்லிணக்கமும் நிலவும்.',
          scorpio: 'தொழில் வளர்ச்சி மற்றும் தூரப் பயணங்கள் அனுகூலம் தரும்.',
          sagittarius: 'ஆன்மீக சிந்தனைகளும் காரிய வெற்றிகளும் உண்டாகும்.',
          capricorn: 'கடன் சுமைகள் குறையும், தொழில் விரிவாக்கம் சாத்தியமாகும்.',
          aquarius: 'பதவி உயர்வு மற்றும் புதிய வேலை வாய்ப்புகள் தேடி வரும்.',
          pisces: 'எதிர்பாராத பணவரவும் குடும்பத்தில் மகிழ்ச்சியும் பெருகும்.'
        }
      },
      {
        id: 'rec-3',
        datePeriod: getTodayPeriod(),
        type: 'DAY',
        language: 'English',
        createdBy: 'Admin User',
        status: 'PUBLISHED',
        title: 'Daily Horoscope',
        date: getTodayISO(),
        dayName: 'திங்கள்',
        predictions: {
          aries: 'Today all undertaken tasks will succeed. Appraisals at workplace expected.',
          taurus: 'Progress in business. Peace in family.',
          gemini: 'New career opportunities approaching.',
          cancer: 'Financial condition satisfactory.',
          leo: 'Competition reduces, success assured.',
          virgo: 'Auspicious news arriving soon.',
          libra: 'Favorable day for new investments.',
          scorpio: 'Support from father and elders.',
          sagittarius: 'Spiritual journey brings joy.',
          capricorn: 'Financial relief and debt clearance.',
          aquarius: 'Skills recognized by management.',
          pisces: 'Unexpected business profit.'
        }
      },
      {
        id: 'rec-4',
        datePeriod: '9/30/2026 புதன்',
        type: 'DAY',
        language: 'Tamil',
        createdBy: 'Admin User',
        status: 'PUBLISHED',
        title: 'இன்றைய ராசிபலன்',
        date: getTodayISO(),
        dayName: getTamilDayName(getTodayISO()),
        predictions: {
          aries: 'இன்று தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும். உத்தியோகத்தில் மேலதிகாரிகளின் பாராட்டு கிடைக்கும். நிதி நிலைமை திருப்திகரமாக இருக்கும்.',
          taurus: 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.',
          gemini: 'தொழில் தொடர்பான புதிய வாய்ப்புகள் தேடி வரும். ஆரோக்கியத்தில் கூடுதல் கவனம் தேவை.',
          cancer: 'பணவரவு திருப்திகரமாக இருக்கும். நண்பர்களின் ஆதரவு கிடைக்கும்.',
          leo: 'தொழில் போட்டிகள் குறையும். எடுத்த காரியங்களை வெற்றிகரமாக முடிப்பீர்கள்.',
          virgo: 'குடும்பத்தில் சுப நிகழ்வுகள் நடைபெறும். எதிர்பார்த்த நல்ல செய்தி வரும்.',
          libra: 'மன அமைதியும் மகிழ்ச்சியும் நிலவும். புதிய முதலீடுகளுக்கு சாதகமான நாள்.',
          scorpio: 'தொழிலில் அனுகூலமான சூழல் நிலவும். தந்தை வழியில் நன்மைகள் உண்டாகும்.',
          sagittarius: 'முயற்சிகள் யாவும் சித்தியடையும். ஆன்மீக பயணங்கள் மேற்கொள்ள நேரிடும்.',
          capricorn: 'தொழில் விரிவாக்கம் பற்றிய சிந்தனைகள் அதிகரிக்கும். கடன் சுமைகள் குறையும்.',
          aquarius: 'பணியிடத்தில் உங்கள் திறமைக்கு உரிய அங்கீகாரம் கிடைக்கும்.',
          pisces: 'தொழிலில் எதிர்பாராத லாபம் கிடைக்கும். நண்பர்களால் உதவி உண்டாகும்.'
        }
      },
      {
        id: 'rec-5',
        datePeriod: '9/30/2026 to 10/30/2026',
        type: 'MONTH',
        language: 'English',
        createdBy: 'Editor User',
        status: 'PUBLISHED',
        title: 'Monthly Overview',
        date: getTodayISO(),
        dayName: 'திங்கள்',
        predictions: {
          aries: 'Steady progress throughout the month.',
          taurus: 'Good health and financial stability.',
          gemini: 'Career growth opportunities.',
          cancer: 'Family harmony and peace.',
          leo: 'Success in new investments.',
          virgo: 'Academic excellence for students.',
          libra: 'Travel and new connections.',
          scorpio: 'Recognition and prosperity.',
          sagittarius: 'Spiritual bliss and harmony.',
          capricorn: 'Business growth and gains.',
          aquarius: 'Job promotions and praise.',
          pisces: 'Happiness and health gains.'
        }
      }
    ];
  });

  const isRasiLoaded = React.useRef(false);

  useEffect(() => {
    api.getContent('rasi_records')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setRasiRecords(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => { isRasiLoaded.current = true; }, 500);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adutha_newsghuru_rasi_records', JSON.stringify(rasiRecords));
    } catch (e) {}
    if (isRasiLoaded.current) {
      api.saveContent('rasi_records', rasiRecords).catch(() => {});
    }
  }, [rasiRecords]);

  // Form State for NewsGuru Rasi Palan Direct Creator (Image 3)
  const [directForm, setDirectForm] = useState({
    language: 'Tamil',
    periodType: 'Daily',
    date: getTodayISO(),
    dayName: getTamilDayName(getTodayISO()),
    title: 'இன்றைய ராசிபலன்',
    status: 'DRAFT',
    predictions: {
      aries: 'இன்று தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும். உத்தியோகத்தில் மேலதிகாரிகளின் பாராட்டு கிடைக்கும்.',
      taurus: 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.',
      gemini: 'தொழில் தொடர்பான புதிய வாய்ப்புகள் தேடி வரும். ஆரோக்கியத்தில் கூடுதல் கவனம் தேவை.',
      cancer: 'பணவரவு திருப்திகரமாக இருக்கும். நண்பர்களின் ஆதரவு கிடைக்கும்.',
      leo: 'தொழில் போட்டிகள் குறையும். எடுத்த காரியங்களை வெற்றிகரமாக முடிப்பீர்கள்.',
      virgo: 'குடும்பத்தில் சுப நிகழ்வுகள் நடைபெறும். எதிர்பார்த்த நல்ல செய்தி வரும்.',
      libra: 'மன அமைதியும் மகிழ்ச்சியும் நிலவும். புதிய முதலீடுகளுக்கு சாதகமான நாள்.',
      scorpio: 'தொழிலில் அனுகூலமான சூழல் நிலவும். தந்தை வழியில் நன்மைகள் உண்டாகும்.',
      sagittarius: 'முயற்சிகள் யாவும் சித்தியடையும். ஆன்மீக பயணங்கள் மேற்கொள்ள நேரிடும்.',
      capricorn: 'தொழில் விரிவாக்கம் பற்றிய சிந்தனைகள் அதிகரிக்கும். கடன் சுமைகள் குறையும்.',
      aquarius: 'பணியிடத்தில் உங்கள் திறமைக்கு உரிய அங்கீகாரம் கிடைக்கும்.',
      pisces: 'தொழிலில் எதிர்பாராத லாபம் கிடைக்கும். நண்பர்களால் உதவி உண்டாகும்.'
    }
  });

  const handleOpenDirectCreate = (record = null) => {
    if (typeof setRasiViewMode === 'function') {
      setRasiViewMode('create');
    }
    if (record) {
      setEditingRasiRecord(record);
      const selectedDate = record.date || getTodayISO();
      setDirectForm({
        language: record.language || 'Tamil',
        periodType: record.type === 'DAY' ? 'Daily' : record.type === 'WEEK' ? 'Weekly' : 'Monthly',
        date: selectedDate,
        dayName: getTamilDayName(selectedDate),
        title: record.title || 'இன்றைய ராசிபலன்',
        status: record.status || 'DRAFT',
        predictions: { ...record.predictions }
      });
    } else {
      setEditingRasiRecord(null);
      const selectedDate = getTodayISO();
      setDirectForm({
        language: 'Tamil',
        periodType: 'Daily',
        date: selectedDate,
        dayName: getTamilDayName(selectedDate),
        title: 'இன்றைய ராசிபலன்',
        status: 'DRAFT',
        predictions: {
          aries: '',
          taurus: '',
          gemini: '',
          cancer: '',
          leo: '',
          virgo: '',
          libra: '',
          scorpio: '',
          sagittarius: '',
          capricorn: '',
          aquarius: '',
          pisces: ''
        }
      });
    }
  };

  const handleSaveRasiRecord = (statusToSave = 'PUBLISHED') => {
    const periodTag = directForm.periodType === 'Daily' ? 'DAY' : directForm.periodType === 'Weekly' ? 'WEEK' : 'MONTH';
    const datePeriodText = directForm.periodType === 'Daily'
      ? `${directForm.date} ${directForm.dayName}`
      : `${directForm.date} to 10/30/2026`;

    const recordData = {
      id: editingRasiRecord ? editingRasiRecord.id : 'rec-' + Date.now(),
      datePeriod: datePeriodText,
      type: periodTag,
      language: directForm.language,
      createdBy: 'Admin User',
      status: statusToSave,
      title: directForm.title,
      date: directForm.date,
      dayName: getTamilDayName(directForm.date),
      predictions: directForm.predictions
    };

    if (editingRasiRecord) {
      setRasiRecords(prev => prev.map(r => r.id === editingRasiRecord.id ? recordData : r));
      showToast('ராசி பலன் பதிவு புதுப்பிக்கப்பட்டது!');
    } else {
      setRasiRecords(prev => [recordData, ...prev]);
      showToast('புதிய ராசி பலன் வெற்றியோடு உருவாக்கப்பட்டது!');
    }

    // Update global horoscopeData in AppContext so front-end reflects it
    const tfKey = directForm.periodType.toLowerCase();
    rasiKeysList.forEach(r => {
      const detailObj = getRasiObj(directForm.predictions, r);
      if (detailObj.prediction) {
        updateHoroscopeItem(tfKey, r.key, detailObj);
      }
    });

    setRasiViewMode('list');
  };

  const handleDeleteRasiRecord = (id) => {
    if (window.confirm('இந்த ராசி பலன் பதிவை நீக்க வேண்டுமா?')) {
      setRasiRecords(prev => prev.filter(r => r.id !== id));
      showToast('ராசி பலன் நீக்கப்பட்டது');
    }
  };

  const getFilteredRasiRecords = () => {
    return rasiRecords.filter(r => {
      if (filterLang !== 'all' && r.language !== filterLang) return false;
      if (filterPeriod !== 'all' && r.type !== filterPeriod) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      return true;
    });
  };

  const rasiKeysList = [
    { key: 'aries', name: 'மேஷம்', englishName: 'Aries', symbol: '♈', defaultStar: 'அஸ்வினி, பரணி, கார்த்திகை 1-ம் பாதம்', defaultLuckyNo: '3, 9', defaultLuckyColor: 'சிகப்பு (Red)', defaultLuckyDir: 'கிழக்கு (East)', defaultRemedy: 'முருகப்பெருமானுக்கு தீபம் ஏற்றி வழிபட நன்மைகள் பெருகும்.' },
    { key: 'taurus', name: 'ரிஷபம்', englishName: 'Taurus', symbol: '♉', defaultStar: 'கார்த்திகை 2,3,4, ரோகிணி, மிருகசீரிஷம் 1,2-ம் பாதம்', defaultLuckyNo: '2, 6', defaultLuckyColor: 'வெள்ளை (White)', defaultLuckyDir: 'தென்கிழக்கு (South-East)', defaultRemedy: 'மகாலட்சுமி தாயாரை வணங்கி வழிபட தனவரவு அதிகரிக்கும்.' },
    { key: 'gemini', name: 'மிதுனம்', englishName: 'Gemini', symbol: '♊', defaultStar: 'மிருகசீரிஷம் 3,4, திருவாதிரை, புனர்பூசம் 1,2,3-ம் பாதம்', defaultLuckyNo: '5, 8', defaultLuckyColor: 'பச்சை (Green)', defaultLuckyDir: 'வடக்கு (North)', defaultRemedy: 'விஷ்ணு சகஸ்ரநாமம் பாராயணம் செய்வது சிறப்பு.' },
    { key: 'cancer', name: 'கடகம்', englishName: 'Cancer', symbol: '♋', defaultStar: 'புனர்பூசம் 4, பூசம், ஆயில்யம்', defaultLuckyNo: '1, 4', defaultLuckyColor: 'முத்து வெள்ளை (Cream)', defaultLuckyDir: 'வடகிழக்கு (North-East)', defaultRemedy: 'சிவபெருமானுக்கு பால் அபிஷேகம் செய்து வழிபடுவது நலம்.' },
    { key: 'leo', name: 'சிம்மம்', englishName: 'Leo', symbol: '♌', defaultStar: 'மகம், பூரம், உத்திரம் 1-ம் பாதம்', defaultLuckyNo: '1, 5', defaultLuckyColor: 'தங்கம்/மஞ்சள் (Gold/Yellow)', defaultLuckyDir: 'கிழக்கு (East)', defaultRemedy: 'சூரிய பகவானுக்கு ஆதித்ய ஹ்ருதயம் யோசித்து வழிபடவும்.' },
    { key: 'virgo', name: 'கன்னி', englishName: 'Virgo', symbol: '♍', defaultStar: 'உத்திரம் 2,3,4, அஸ்தம், சித்திரை 1,2-ம் பாதம்', defaultLuckyNo: '5, 7', defaultLuckyColor: 'இளம்பச்சை (Light Green)', defaultLuckyDir: 'தெற்கு (South)', defaultRemedy: 'விநாயக பெருமானுக்கு அருகம்புல் சாற்றி வழிபடவும்.' },
    { key: 'libra', name: 'துலாம்', englishName: 'Libra', symbol: '♎', defaultStar: 'சித்திரை 3,4, சுவாதி, விசாகம் 1,2,3-ம் பாதம்', defaultLuckyNo: '2, 7', defaultLuckyColor: 'நீலம் (Blue)', defaultLuckyDir: 'மேற்கு (West)', defaultRemedy: 'துர்க்கை அம்மனுக்கு எலுமிச்சை தீபம் ஏற்றி வழிபடவும்.' },
    { key: 'scorpio', name: 'விருச்சிகம்', englishName: 'Scorpio', symbol: '♏', defaultStar: 'விசாகம் 4, அனுஷம், கேட்டை', defaultLuckyNo: '3, 9', defaultLuckyColor: 'கருஞ்சிவப்பு (Maroon)', defaultLuckyDir: 'வடமேற்கு (North-West)', defaultRemedy: 'ஆஞ்சநேய சுவாமிக்கு வெண்ணெய் காப்பு சாற்றி வழிபடவும்.' },
    { key: 'sagittarius', name: 'தனுசு', englishName: 'Sagittarius', symbol: '♐', defaultStar: 'மூலம், பூராடம், உத்திராடம் 1-ம் பாதம்', defaultLuckyNo: '3, 6', defaultLuckyColor: 'மஞ்சள் (Yellow)', defaultLuckyDir: 'வடகிழக்கு (North-East)', defaultRemedy: 'தட்சிணாமூர்த்திக்கு மஞ்சள் மலர் சாற்றி வழிபடவும்.' },
    { key: 'capricorn', name: 'மகரம்', englishName: 'Capricorn', symbol: '♑', defaultStar: 'உத்திராடம் 2,3,4, திருவோணம், அவிட்டம் 1,2-ம் பாதம்', defaultLuckyNo: '8, 9', defaultLuckyColor: 'கருநீலம் (Dark Blue)', defaultLuckyDir: 'தெற்கு (South)', defaultRemedy: 'சனீஸ்வர பகவானுக்கு எள் தீபம் ஏற்றி வழிபடவும்.' },
    { key: 'aquarius', name: 'கும்பம்', englishName: 'Aquarius', symbol: '♒', defaultStar: 'அவிட்டம் 3,4, சதயம், பூரட்டாதி 1,2,3-ம் பாதம்', defaultLuckyNo: '4, 8', defaultLuckyColor: 'நீலம் (Sky Blue)', defaultLuckyDir: 'மேற்கு (West)', defaultRemedy: 'பைரவருக்கு வடமாலை சாற்றி வணங்குவது சிறப்பு.' },
    { key: 'pisces', name: 'மீனம்', englishName: 'Pisces', symbol: '♓', defaultStar: 'பூரட்டாதி 4, உத்திரட்டாதி, ரேவதி', defaultLuckyNo: '3, 7', defaultLuckyColor: 'தங்க மஞ்சள் (Golden Yellow)', defaultLuckyDir: 'வடக்கு (North)', defaultRemedy: 'ஸ்ரீ ராகவேந்திரர் ஜீவ சமாதியை நினைத்து வழிபடவும்.' }
  ];

  const getRasiObj = (predictionsMap, rasiInfo) => {
    const val = predictionsMap ? predictionsMap[rasiInfo.key] : null;
    if (val && typeof val === 'object') {
      return {
        prediction: val.prediction || '',
        starRange: val.starRange || rasiInfo.defaultStar,
        luckyNumber: val.luckyNumber || rasiInfo.defaultLuckyNo,
        luckyColor: val.luckyColor || rasiInfo.defaultLuckyColor,
        luckyDirection: val.luckyDirection || rasiInfo.defaultLuckyDir,
        remedy: val.remedy || rasiInfo.defaultRemedy
      };
    } else if (typeof val === 'string') {
      return {
        prediction: val,
        starRange: rasiInfo.defaultStar,
        luckyNumber: rasiInfo.defaultLuckyNo,
        luckyColor: rasiInfo.defaultLuckyColor,
        luckyDirection: rasiInfo.defaultLuckyDir,
        remedy: rasiInfo.defaultRemedy
      };
    }
    return {
      prediction: '',
      starRange: rasiInfo.defaultStar,
      luckyNumber: rasiInfo.defaultLuckyNo,
      luckyColor: rasiInfo.defaultLuckyColor,
      luckyDirection: rasiInfo.defaultLuckyDir,
      remedy: rasiInfo.defaultRemedy
    };
  };

  const updateRasiSubField = (rasiKey, fieldName, fieldValue) => {
    setDirectForm(prev => {
      const rasiInfo = rasiKeysList.find(r => r.key === rasiKey);
      const currentObj = getRasiObj(prev.predictions, rasiInfo);
      return {
        ...prev,
        predictions: {
          ...prev.predictions,
          [rasiKey]: {
            ...currentObj,
            [fieldName]: fieldValue
          }
        }
      };
    });
  };

  // --- 2. PANCHANGAM STATE ---
  const [panchangamForm, setPanchangamForm] = useState({
    date: panchangamData?.date || new Date().toISOString().split('T')[0],
    month: panchangamData?.month || 'October 2026',
    tamilDate: panchangamData?.tamilDate || '',
    tithi: panchangamData?.tithi || '',
    natchathiram: panchangamData?.natchathiram || '',
    yogam: panchangamData?.yogam || '',
    karanam: panchangamData?.karanam || '',
    rahuKalam: panchangamData?.rahuKalam || '',
    yamagandam: panchangamData?.yamagandam || '',
    kuligai: panchangamData?.kuligai || '',
    nallaNeram: panchangamData?.nallaNeram || '',
    soolam: panchangamData?.soolam || 'மேற்கு',
    parigaram: panchangamData?.parigaram || 'வெல்லம்',
    sunrise: panchangamData?.sunrise || 'காலை 06:05',
    sunset: panchangamData?.sunset || 'மாலை 06:18',
    chandrashtamam: panchangamData?.chandrashtamam || '',
    specialNote: panchangamData?.specialNote || ''
  });

  const handlePanchangamSubmit = (e) => {
    e.preventDefault();
    updatePanchangamData(panchangamForm);
  };

  // --- 3. TEMPLE FESTIVALS MODAL STATE ---
  const [showTempleModal, setShowTempleModal] = useState(false);
  const [editingTemple, setEditingTemple] = useState(null);
  const [uploadingTempleImage, setUploadingTempleImage] = useState(false);
  const [templeForm, setTempleForm] = useState({
    title: '',
    templeName: '',
    dateRange: '',
    location: '',
    darshanTimings: '',
    details: '',
    image: ''
  });

  const handleTempleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempleForm((prev) => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      setUploadingTempleImage(true);
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setTempleForm((prev) => ({ ...prev, image: res.url }));
        showToast('கோவில் படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!');
      }
    } catch (err) {
      showToast('படம் பதிவேற்றுவதில் பிழைப்பட்டது');
    } finally {
      setUploadingTempleImage(false);
    }
  };

  const handleOpenTempleModal = (item = null) => {
    if (item) {
      setEditingTemple(item);
      setTempleForm({ ...item });
    } else {
      setEditingTemple(null);
      setTempleForm({
        title: '',
        templeName: '',
        dateRange: '',
        location: '',
        darshanTimings: '',
        details: '',
        image: ''
      });
    }
    setShowTempleModal(true);
  };

  const handleSaveTemple = (e) => {
    e.preventDefault();
    if (!templeForm.title || !templeForm.templeName) {
      showToast('விழா பெயர் மற்றும் கோவில் பெயரை நிரப்பவும்');
      return;
    }
    if (editingTemple) {
      updateTempleFestival(editingTemple.id, templeForm);
    } else {
      addTempleFestival(templeForm);
    }
    setShowTempleModal(false);
  };

  // --- 4. REMEDIES MODAL STATE ---
  const [showRemedyModal, setShowRemedyModal] = useState(false);
  const [editingRemedy, setEditingRemedy] = useState(null);
  const [uploadingRemedyImage, setUploadingRemedyImage] = useState(false);
  const [remedyForm, setRemedyForm] = useState({
    title: '',
    planet: '',
    temple: '',
    procedure: '',
    mantra: '',
    image: ''
  });

  const handleRemedyImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setRemedyForm((prev) => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      setUploadingRemedyImage(true);
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setRemedyForm((prev) => ({ ...prev, image: res.url }));
        showToast('பரிகார படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!');
      }
    } catch (err) {
      showToast('படம் பதிவேற்றுவதில் பிழைப்பட்டது');
    } finally {
      setUploadingRemedyImage(false);
    }
  };

  const handleOpenRemedyModal = (item = null) => {
    if (item) {
      setEditingRemedy(item);
      setRemedyForm({ ...item });
    } else {
      setEditingRemedy(null);
      setRemedyForm({
        title: '',
        planet: '',
        temple: '',
        procedure: '',
        mantra: '',
        image: ''
      });
    }
    setShowRemedyModal(true);
  };

  const handleSaveRemedy = (e) => {
    e.preventDefault();
    if (!remedyForm.title) {
      showToast('பரிகார தலைப்பை நிரப்பவும்');
      return;
    }
    if (editingRemedy) {
      updateRemedyItem(editingRemedy.id, remedyForm);
    } else {
      addRemedyItem(remedyForm);
    }
    setShowRemedyModal(false);
  };

  // --- 5. HINDU SPIRITUAL WISDOM MODAL STATE ---
  const [showWisdomModal, setShowWisdomModal] = useState(false);
  const [editingWisdom, setEditingWisdom] = useState(null);
  const [wisdomForm, setWisdomForm] = useState({
    title: '',
    category: '',
    description: ''
  });

  const handleOpenWisdomModal = (item = null) => {
    if (item) {
      setEditingWisdom(item);
      setWisdomForm({ ...item });
    } else {
      setEditingWisdom(null);
      setWisdomForm({
        title: '',
        category: 'ஆன்மீக அறிவியல்',
        description: ''
      });
    }
    setShowWisdomModal(true);
  };

  const handleSaveWisdom = (e) => {
    e.preventDefault();
    if (!wisdomForm.title || !wisdomForm.description) {
      showToast('தலைப்பு மற்றும் விவரங்களை நிரப்பவும்');
      return;
    }
    if (editingWisdom) {
      updateSpiritualWisdom(editingWisdom.id, wisdomForm);
    } else {
      addSpiritualWisdom(wisdomForm);
    }
    setShowWisdomModal(false);
  };

  // ==========================================
  // ✝️ CHRISTIAN SPIRITUALITY STATE & HANDLERS
  // ==========================================
  const [christianVerseForm, setChristianVerseForm] = useState({
    verse: christianData?.dailyVerse?.verse || '',
    reference: christianData?.dailyVerse?.reference || ''
  });

  const [christianPrayerForm, setChristianPrayerForm] = useState({
    title: christianData?.dailyPrayer?.title || '',
    prayer: christianData?.dailyPrayer?.prayer || ''
  });

  const handleSaveChristianVerseAndPrayer = (e) => {
    e.preventDefault();
    updateChristianData({
      dailyVerse: christianVerseForm,
      dailyPrayer: christianPrayerForm
    });
  };

  // Christian Festivals Modal
  const [showChristianFestModal, setShowChristianFestModal] = useState(false);
  const [editingChristianFest, setEditingChristianFest] = useState(null);
  const [uploadingChristianFestImage, setUploadingChristianFestImage] = useState(false);
  const [christianFestForm, setChristianFestForm] = useState({
    title: '',
    churchName: '',
    dateRange: '',
    location: '',
    details: '',
    image: ''
  });

  const handleChristianFestImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setChristianFestForm((prev) => ({ ...prev, image: event.target.result }));
    reader.readAsDataURL(file);

    try {
      setUploadingChristianFestImage(true);
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setChristianFestForm((prev) => ({ ...prev, image: res.url }));
        showToast('திருவிழா படம் பதிவேற்றப்பட்டது!');
      }
    } catch (err) {
      showToast('படம் பதிவேற்றுவதில் பிழை');
    } finally {
      setUploadingChristianFestImage(false);
    }
  };

  const handleSaveChristianFest = (e) => {
    e.preventDefault();
    const list = christianData?.festivals || [];
    let updatedList = [];
    if (editingChristianFest) {
      updatedList = list.map((item) => (item.id === editingChristianFest.id ? { ...christianFestForm, id: item.id } : item));
    } else {
      updatedList = [{ ...christianFestForm, id: 'c-fest-' + Date.now() }, ...list];
    }
    updateChristianData({ festivals: updatedList });
    setShowChristianFestModal(false);
  };

  const handleDeleteChristianFest = (id) => {
    if (window.confirm('இந்த கிறிஸ்தவ திருவிழா விபரத்தை நீக்க வேண்டுமா?')) {
      const updatedList = (christianData?.festivals || []).filter((item) => item.id !== id);
      updateChristianData({ festivals: updatedList });
    }
  };

  // ==========================================
  // ☪️ ISLAMIC SPIRITUALITY STATE & HANDLERS
  // ==========================================
  const [islamicVerseForm, setIslamicVerseForm] = useState({
    verse: islamicData?.dailyVerse?.verse || '',
    reference: islamicData?.dailyVerse?.reference || ''
  });

  const [islamicDuaForm, setIslamicDuaForm] = useState({
    title: islamicData?.dailyDua?.title || '',
    arabicText: islamicData?.dailyDua?.arabicText || '',
    tamilMeaning: islamicData?.dailyDua?.tamilMeaning || ''
  });

  const [islamicHijriForm, setIslamicHijriForm] = useState({
    hijriDate: islamicData?.hijriCalendar?.hijriDate || '',
    specialNotice: islamicData?.hijriCalendar?.specialNotice || ''
  });

  const handleSaveIslamicCore = (e) => {
    e.preventDefault();
    updateIslamicData({
      dailyVerse: islamicVerseForm,
      dailyDua: islamicDuaForm,
      hijriCalendar: islamicHijriForm
    });
  };

  // Islamic Important Days Modal
  const [showIslamicDayModal, setShowIslamicDayModal] = useState(false);
  const [editingIslamicDay, setEditingIslamicDay] = useState(null);
  const [uploadingIslamicDayImage, setUploadingIslamicDayImage] = useState(false);
  const [islamicDayForm, setIslamicDayForm] = useState({
    title: '',
    dateRange: '',
    location: '',
    details: '',
    image: ''
  });

  const handleIslamicDayImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setIslamicDayForm((prev) => ({ ...prev, image: event.target.result }));
    reader.readAsDataURL(file);

    try {
      setUploadingIslamicDayImage(true);
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setIslamicDayForm((prev) => ({ ...prev, image: res.url }));
        showToast('பெருநாள் படம் பதிவேற்றப்பட்டது!');
      }
    } catch (err) {
      showToast('படம் பதிவேற்றுவதில் பிழை');
    } finally {
      setUploadingIslamicDayImage(false);
    }
  };

  const handleSaveIslamicDay = (e) => {
    e.preventDefault();
    const list = islamicData?.importantDays || [];
    let updatedList = [];
    if (editingIslamicDay) {
      updatedList = list.map((item) => (item.id === editingIslamicDay.id ? { ...islamicDayForm, id: item.id } : item));
    } else {
      updatedList = [{ ...islamicDayForm, id: 'i-day-' + Date.now() }, ...list];
    }
    updateIslamicData({ importantDays: updatedList });
    setShowIslamicDayModal(false);
  };

  const handleDeleteIslamicDay = (id) => {
    if (window.confirm('இந்த இஸ்லாமிய முக்கிய நாள் விபரத்தை நீக்க வேண்டுமா?')) {
      const updatedList = (islamicData?.importantDays || []).filter((item) => item.id !== id);
      updateIslamicData({ importantDays: updatedList });
    }
  };

  return (
    <div className="space-y-6 font-tamil">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#0a1945] via-[#102359] to-[#0a1945] border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" /> ஆன்மீகம் அனைத்து மதங்கள் மேலாண்மை
          </div>
          <h2 className="text-2xl font-black text-amber-400">ஆன்மீகம் நிர்வாக மையம் (All Religions Aanmeegam Manager)</h2>
          <p className="text-xs text-slate-300 mt-1">
            இந்து, கிறிஸ்தவ மற்றும் இஸ்லாமிய ஆன்மீகப் பிரிவுகளுக்கான விபரங்களை உடனுக்குடன் புதுப்பிக்கவும்.
          </p>
        </div>
      </div>

      {/* PRIMARY FAITH SELECTION TABS: HINDU, CHRISTIAN, ISLAMIC */}
      <div className="flex items-center gap-3 bg-[#0a1633] p-2 rounded-2xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveReligionTab('hindu')}
          className={`flex-1 min-w-[180px] py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeReligionTab === 'hindu'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>🕉️ இந்து ஆன்மீகம் & ஜோதிடம்</span>
        </button>

        <button
          onClick={() => setActiveReligionTab('christian')}
          className={`flex-1 min-w-[180px] py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeReligionTab === 'christian'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>✝️ கிறிஸ்தவ ஆன்மீகம்</span>
        </button>

        <button
          onClick={() => setActiveReligionTab('islamic')}
          className={`flex-1 min-w-[180px] py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeReligionTab === 'islamic'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>☪️ இஸ்லாமிய ஆன்மீகம்</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 🕉️ SECTION 1: HINDU SPIRITUALITY & ASTROLOGY */}
      {/* ========================================================= */}
      {activeReligionTab === 'hindu' && (
        <div className="space-y-6">
          {/* Hindu Sub-Tabs Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            <button
              onClick={() => {
                setActiveHinduSubTab('rasi');
                setRasiViewMode('list');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeHinduSubTab === 'rasi'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> 12 ராசி பலன்கள் மேலாண்மை
            </button>
            <button
              onClick={() => setActiveHinduSubTab('panchangam')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeHinduSubTab === 'panchangam'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> தினசரி பஞ்சாங்கம்
            </button>
            <button
              onClick={() => setActiveHinduSubTab('temples')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeHinduSubTab === 'temples'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> கோவில் விழாக்கள் ({templeFestivals.length})
            </button>
            <button
              onClick={() => setActiveHinduSubTab('remedies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeHinduSubTab === 'remedies'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> பரிகாரங்கள் ({remediesData.length})
            </button>
            <button
              onClick={() => setActiveHinduSubTab('wisdom')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeHinduSubTab === 'wisdom'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> ஆன்மீகச் செய்திகள் ({spiritualWisdom.length})
            </button>
          </div>

          {/* ========================================================= */}
          {/* 1. NEWSGURU STYLE RASI PALAN TABLE VIEW (IMAGE 2) */}
          {/* ========================================================= */}
          {activeHinduSubTab === 'rasi' && rasiViewMode === 'list' && (
            <div className="space-y-6 font-tamil">
              {/* NewsGuru Top Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                    <Sparkles className="w-7 h-7 text-amber-400" />
                    Rasi Palan Management
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage daily, weekly and monthly horoscope predictions in Tamil and English with full date-wise controls.
                  </p>
                </div>

                {/* Action Buttons & Filters Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={filterLang}
                    onChange={(e) => setFilterLang(e.target.value)}
                    className="bg-[#050915] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans font-semibold"
                  >
                    <option value="all">All Languages</option>
                    <option value="Tamil">Tamil</option>
                    <option value="English">English</option>
                  </select>

                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="bg-[#050915] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans font-semibold"
                  >
                    <option value="all">All Periods</option>
                    <option value="DAY">Daily (DAY)</option>
                    <option value="WEEK">Weekly (WEEK)</option>
                    <option value="MONTH">Monthly (MONTH)</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#050915] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans font-semibold"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>

                  <button
                    onClick={() => handleOpenDirectCreate()}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md shadow-red-600/30 px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition whitespace-nowrap uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Rasi Palan (Direct)</span>
                  </button>
                </div>
              </div>

              {/* NewsGuru Rich Table */}
              <div className="bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                    <thead className="bg-[#070c1e] text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800 font-sans font-bold">
                      <tr>
                        <th className="p-4">DATE / PERIOD</th>
                        <th className="p-4">TYPE</th>
                        <th className="p-4">LANGUAGE</th>
                        <th className="p-4">CREATED BY</th>
                        <th className="p-4">STATUS</th>
                        <th className="p-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {getFilteredRasiRecords().map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4 font-bold text-white font-mono">{rec.datePeriod}</td>
                          <td className="p-4">
                            <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded text-[10px] font-black tracking-wider uppercase">
                              {rec.type}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 font-semibold">{rec.language}</td>
                          <td className="p-4">
                            <span className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded text-xs font-semibold">
                              {rec.createdBy}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                rec.status === 'PUBLISHED'
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-700'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-3 font-bold text-xs">
                            <button
                              onClick={() => handleOpenDirectCreate(rec)}
                              className="text-blue-400 hover:text-blue-300 cursor-pointer underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRasiRecord(rec.id)}
                              className="text-red-500 hover:text-red-400 cursor-pointer underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1B. NEWSGURU STYLE RASI PALAN DIRECT CREATOR FORM (IMAGE 3) */}
          {/* ========================================================= */}
          {activeHinduSubTab === 'rasi' && rasiViewMode === 'create' && (
            <div className="space-y-6 font-tamil">
              {/* NewsGuru Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a1633] p-4.5 rounded-2xl border border-slate-800 shadow-xl">
                <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                  {editingRasiRecord ? 'Rasi Palan - Edit Record' : 'Rasi Palan - Create New'}
                </h2>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSaveRasiRecord('DRAFT')}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition shadow"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveRasiRecord('PUBLISHED')}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md shadow-red-600/30 px-5 py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition uppercase tracking-wider"
                  >
                    Publish Directly
                  </button>

                  <button
                    type="button"
                    onClick={() => setRasiViewMode('list')}
                    className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer px-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* 3 COLUMN CREATOR GRID MATCHING IMAGE 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: Horoscope Details & 12 Rasi Inputs */}
                <div className="lg:col-span-5 bg-[#0a1633] border border-slate-800 rounded-3xl p-5 space-y-5 shadow-xl">
                  <h3 className="text-sm font-black text-amber-400 border-b border-slate-800 pb-2">
                    Horoscope Details
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1">Language *</label>
                      <select
                        value={directForm.language}
                        onChange={(e) => setDirectForm({ ...directForm, language: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Tamil">Tamil</option>
                        <option value="English">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Period Type *</label>
                      <select
                        value={directForm.periodType}
                        onChange={(e) => setDirectForm({ ...directForm, periodType: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1">Date *</label>
                      <input
                        type="date"
                        value={directForm.date} onChange={(e) => setDirectForm(prev => ({ ...prev, date: e.target.value, dayName: getTamilDayName(e.target.value) }))}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Day Name</label>
                      <input
                        type="text"
                        placeholder="புதன் / Wednesday"
                        value={directForm.dayName}
                        onChange={(e) => setDirectForm({ ...directForm, dayName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Title (Optional)</label>
                    <input
                      type="text"
                      placeholder="எ.கா. இன்றைய ராசிபலன்"
                      value={directForm.title}
                      onChange={(e) => setDirectForm({ ...directForm, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium"
                    />
                  </div>

                  {/* 12 Rasi Predictions Inputs */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                        Rasi Palan Predictions ({directForm.language})
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">12 Rasis</span>
                    </div>

                    {/* Quick Rasi Jump Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {rasiKeysList.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`input-rasi-${r.key}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }}
                          className="px-2 py-1 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-slate-700/80 rounded-lg text-[10px] font-extrabold transition shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          <span>{r.symbol}</span>
                          <span>{r.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Scrollable 12 Rasis Container */}
                    <div className="space-y-3 max-h-[calc(100vh-26rem)] min-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/40 hover:scrollbar-thumb-amber-500">
                      {rasiKeysList.map((r) => {
                        const rObj = getRasiObj(directForm.predictions, r);
                        return (
                          <div id={`input-rasi-${r.key}`} key={r.key} className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-3 scroll-mt-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 text-sm font-black flex items-center justify-center shadow">
                                  {r.symbol}
                                </span>
                                <div>
                                  <span className="font-extrabold text-xs text-white block">{r.name} ({r.englishName})</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {rObj.prediction.length} chars
                              </span>
                            </div>

                            {/* Main Prediction Textarea */}
                            <div>
                              <label className="block text-[11px] font-bold text-amber-400 mb-1">
                                ✨ பலன்கள் விவரம் (Prediction Details)
                              </label>
                              <textarea
                                rows={3}
                                placeholder={`${r.name} பலன்களை உள்ளிடவும்...`}
                                value={rObj.prediction}
                                onChange={(e) => updateRasiSubField(r.key, 'prediction', e.target.value)}
                                className="w-full bg-[#050915] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium leading-relaxed"
                              />
                            </div>

                            {/* Nakshatra / Star Range Input */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                                ⭐ நட்சத்திரம் / பாதம் (Star Range)
                              </label>
                              <input
                                type="text"
                                placeholder="எ.கா. அஸ்வினி, பரணி..."
                                value={rObj.starRange}
                                onChange={(e) => updateRasiSubField(r.key, 'starRange', e.target.value)}
                                className="w-full bg-[#050915] border border-slate-700/80 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                              />
                            </div>

                            {/* 3 Trait Inputs in Grid */}
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                                  # அதிர்ஷ்ட எண்
                                </label>
                                <input
                                  type="text"
                                  placeholder="3, 9"
                                  value={rObj.luckyNumber}
                                  onChange={(e) => updateRasiSubField(r.key, 'luckyNumber', e.target.value)}
                                  className="w-full bg-[#050915] border border-slate-700/80 rounded-xl p-1.5 text-xs text-amber-400 font-mono font-bold"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                                  🎨 நிறம்
                                </label>
                                <input
                                  type="text"
                                  placeholder="சிகப்பு"
                                  value={rObj.luckyColor}
                                  onChange={(e) => updateRasiSubField(r.key, 'luckyColor', e.target.value)}
                                  className="w-full bg-[#050915] border border-slate-700/80 rounded-xl p-1.5 text-xs text-slate-200 font-medium"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                                  🧭 திசை
                                </label>
                                <input
                                  type="text"
                                  placeholder="கிழக்கு"
                                  value={rObj.luckyDirection}
                                  onChange={(e) => updateRasiSubField(r.key, 'luckyDirection', e.target.value)}
                                  className="w-full bg-[#050915] border border-slate-700/80 rounded-xl p-1.5 text-xs text-slate-200 font-medium"
                                />
                              </div>
                            </div>

                            {/* Spiritual Remedy Input */}
                            <div>
                              <label className="block text-[10px] font-bold text-amber-400/90 mb-0.5">
                                🛡️ ஆன்மீக பரிகாரம் & வழிபாடு (Remedy)
                              </label>
                              <input
                                type="text"
                                placeholder="வழிபாடு விவரங்கள்..."
                                value={rObj.remedy}
                                onChange={(e) => updateRasiSubField(r.key, 'remedy', e.target.value)}
                                className="w-full bg-[#050915] border border-amber-500/30 rounded-xl p-2 text-xs text-amber-100 font-medium"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* MIDDLE COLUMN: Realtime Live Preview Panel (Image 3 & Image 1) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-widest text-center bg-slate-900/80 py-2 rounded-xl border border-slate-800">
                    LIVE PREVIEW - MAIN PAGE FORMAT
                  </div>

                  <div className="bg-[#070d1e] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                    <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 p-4 rounded-2xl border border-amber-500/30 text-center space-y-1">
                      <h3 className="text-xl font-black text-amber-300 font-tamil">
                        {directForm.title || 'இன்றைய ராசிபலன்'}
                      </h3>
                      <span className="text-xs text-slate-300 font-mono block">
                        📅 {directForm.date}, {directForm.dayName}
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[calc(100vh-26rem)] min-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/40 hover:scrollbar-thumb-amber-500">
                      {rasiKeysList.map((r) => {
                        const rObj = getRasiObj(directForm.predictions, r);
                        return (
                          <div key={r.key} className="bg-[#0b1736] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow-lg">
                            {/* Zodiac Header Symbol + Name + Star Range */}
                            <div className="flex items-center gap-3 border-b border-slate-800 pb-2.5">
                              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 text-xl font-black flex items-center justify-center shadow">
                                {r.symbol}
                              </span>
                              <div>
                                <h4 className="font-extrabold text-sm text-amber-300 flex items-center gap-1.5">
                                  {r.name} ({r.englishName})
                                </h4>
                                <p className="text-[11px] text-slate-400 italic line-clamp-1">{rObj.starRange}</p>
                              </div>
                            </div>

                            {/* Predictions Box */}
                            <div className="bg-[#0f2144] p-3 rounded-xl border border-slate-800 space-y-1">
                              <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" /> பலன்கள் விவரம்
                              </span>
                              <p className="text-xs text-slate-200 leading-relaxed italic">
                                {rObj.prediction || 'பலன்கள் இன்னும் சேர்க்கப்படவில்லை...'}
                              </p>
                            </div>

                            {/* 3 Trait Capsules */}
                            <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold">
                              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center space-y-0.5">
                                <span className="text-slate-400 block text-[9px]"># அதிர்ஷ்ட எண்</span>
                                <span className="text-amber-400 font-bold font-mono">{rObj.luckyNumber}</span>
                              </div>
                              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center space-y-0.5">
                                <span className="text-slate-400 block text-[9px]">🎨 நிறம்</span>
                                <span className="text-slate-200 font-bold truncate block">{rObj.luckyColor}</span>
                              </div>
                              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center space-y-0.5">
                                <span className="text-slate-400 block text-[9px]">🧭 திசை</span>
                                <span className="text-slate-200 font-bold truncate block">{rObj.luckyDirection}</span>
                              </div>
                            </div>

                            {/* Remedy Capsule */}
                            <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl space-y-0.5 text-[11px]">
                              <span className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> பரிகாரம் & வழிபாடு
                              </span>
                              <p className="text-amber-100/90 leading-tight">
                                {rObj.remedy}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Rasi Palan Status & Workflow Steps Card (Image 3) */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-[#0a1633] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                    <h3 className="text-sm font-black text-white border-b border-slate-800 pb-2">
                      Rasi Palan Status
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">Current Status:</span>
                        <span className="bg-amber-950/80 text-amber-300 border border-amber-700 px-3 py-1 rounded-full font-extrabold uppercase inline-block">
                          {directForm.status}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-1">Created By:</span>
                        <span className="text-white font-bold block">You (Admin User)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a1633] border border-slate-800 rounded-3xl p-5 space-y-4 text-xs font-semibold shadow-xl">
                    <h3 className="text-sm font-black text-white border-b border-slate-800 pb-2">
                      Workflow Steps:
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div>
                          <div className="font-bold text-white">Editor</div>
                          <div className="text-[10px] text-slate-400">Create & Save Draft</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div>
                          <div className="font-bold text-slate-300">Admin Review</div>
                          <div className="text-[10px] text-slate-500">Verify & Approve / Reject</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                          3
                        </span>
                        <div>
                          <div className="font-bold text-slate-300">Publish</div>
                          <div className="text-[10px] text-slate-500">Live on Website</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-[10px] text-amber-300 italic">
                      * Only Admin can approve and publish live on site.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PANCHANGAM MANAGER */}
          {activeHinduSubTab === 'panchangam' && (
            <div className="bg-[#0a1633] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <h3 className="text-lg font-black text-amber-400">தினசரி பஞ்சாங்கம் மேலாண்மை</h3>
              <form onSubmit={handlePanchangamSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1">ஆங்கில தேதி:</label>
                    <input
                      type="date"
                      value={panchangamForm.date}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">தமிழ் தேதி & கிழமை:</label>
                    <input
                      type="text"
                      value={panchangamForm.tamilDate}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, tamilDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1">திதி:</label>
                    <input
                      type="text"
                      value={panchangamForm.tithi}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, tithi: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">நட்சத்திரம்:</label>
                    <input
                      type="text"
                      value={panchangamForm.natchathiram}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, natchathiram: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-red-400 mb-1">ராகு காலம்:</label>
                    <input
                      type="text"
                      value={panchangamForm.rahuKalam}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, rahuKalam: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-400 mb-1">யமகண்டம்:</label>
                    <input
                      type="text"
                      value={panchangamForm.yamagandam}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, yamagandam: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-400 mb-1">குளிகை:</label>
                    <input
                      type="text"
                      value={panchangamForm.kuligai || ''}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, kuligai: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-400 mb-1">நல்ல நேரம்:</label>
                    <input
                      type="text"
                      value={panchangamForm.nallaNeram}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, nallaNeram: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-amber-400 mb-1">சூலம் (திசை):</label>
                    <input
                      type="text"
                      value={panchangamForm.soolam || ''}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, soolam: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-400 mb-1">பரிகாரம்:</label>
                    <input
                      type="text"
                      value={panchangamForm.parigaram || ''}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, parigaram: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sky-400 mb-1">சூரியோதயம்:</label>
                    <input
                      type="text"
                      value={panchangamForm.sunrise || ''}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, sunrise: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-400 mb-1">சூரியாஸ்தமனம்:</label>
                    <input
                      type="text"
                      value={panchangamForm.sunset || ''}
                      onChange={(e) => setPanchangamForm({ ...panchangamForm, sunset: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">சந்திராஷ்டமம் நட்சத்திரங்கள்:</label>
                  <input
                    type="text"
                    value={panchangamForm.chandrashtamam || ''}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, chandrashtamam: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-amber-200 rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">இன்றைய சிறப்பு / விரதக் குறிப்பு:</label>
                  <textarea
                    rows={3}
                    value={panchangamForm.specialNote}
                    onChange={(e) => setPanchangamForm({ ...panchangamForm, specialNote: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-amber-300 rounded-xl p-3"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold shadow-md shadow-red-600/30 py-3.5 rounded-2xl text-xs uppercase cursor-pointer shadow-lg transition"
                >
                  <Save className="w-4 h-4 inline mr-2" /> பஞ்சாங்கம் விபரங்களைச் சேமி
                </button>
              </form>
            </div>
          )}

          {/* 3. TEMPLE FESTIVALS MANAGER */}
          {activeHinduSubTab === 'temples' && (
            <div className="bg-[#0a1633] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-amber-400">கோவில் விழாக்கள் மேலாண்மை</h3>
                <button
                  onClick={() => handleOpenTempleModal()}
                  className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> புதிய விழா சேர்
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templeFestivals.map((t) => (
                  <div key={t.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-amber-300 text-sm">{t.title}</h4>
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                          {t.dateRange}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{t.templeName} ({t.location})</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{t.details}</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800 text-xs font-bold">
                      <button onClick={() => handleOpenTempleModal(t)} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                        திருத்து
                      </button>
                      <button onClick={() => deleteTempleFestival(t.id)} className="text-red-500 hover:text-red-400 cursor-pointer">
                        நீக்கு
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. REMEDIES MANAGER */}
          {activeHinduSubTab === 'remedies' && (
            <div className="bg-[#0a1633] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-amber-400">பரிகாரங்கள் & வழிபாட்டு முறைகள்</h3>
                <button
                  onClick={() => handleOpenRemedyModal()}
                  className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> புதிய பரிகாரம் சேர்
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {remediesData.map((r) => (
                  <div key={r.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-amber-300 text-sm">{r.title}</h4>
                      <p className="text-xs text-amber-400/90 font-mono">கிரகம்: {r.planet} | கோயில்: {r.temple}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{r.procedure}</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800 text-xs font-bold">
                      <button onClick={() => handleOpenRemedyModal(r)} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                        திருத்து
                      </button>
                      <button onClick={() => deleteRemedyItem(r.id)} className="text-red-500 hover:text-red-400 cursor-pointer">
                        நீக்கு
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. SPIRITUAL WISDOM MANAGER */}
          {activeHinduSubTab === 'wisdom' && (
            <div className="bg-[#0a1633] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-amber-400">ஆன்மீகச் செய்திகள் & கட்டுரைகள்</h3>
                <button
                  onClick={() => handleOpenWisdomModal()}
                  className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> புதிய செய்தி சேர்
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spiritualWisdom.map((w) => (
                  <div key={w.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                        {w.category}
                      </span>
                      <h4 className="font-extrabold text-white text-sm">{w.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{w.description}</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800 text-xs font-bold">
                      <button onClick={() => handleOpenWisdomModal(w)} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                        திருத்து
                      </button>
                      <button onClick={() => deleteSpiritualWisdom(w.id)} className="text-red-500 hover:text-red-400 cursor-pointer">
                        நீக்கு
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ✝️ SECTION 2: CHRISTIAN SPIRITUALITY */}
      {/* ========================================================= */}
      {activeReligionTab === 'christian' && (
        <div className="bg-[#0a1633] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-lg font-black text-blue-400 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-400" /> கிறிஸ்தவ தினசரி இறைவசனம் & ஜெபம்
          </h3>

          <form onSubmit={handleSaveChristianVerseAndPrayer} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-300 mb-1">இன்றைய திருவசனம் (Verse):</label>
              <textarea
                rows={3}
                value={christianVerseForm.verse}
                onChange={(e) => setChristianVerseForm({ ...christianVerseForm, verse: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">வேதாகம அதிகாரம் / வசனம் (Reference):</label>
              <input
                type="text"
                value={christianVerseForm.reference}
                onChange={(e) => setChristianVerseForm({ ...christianVerseForm, reference: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">இன்றைய ஜெபம் (Prayer):</label>
              <textarea
                rows={3}
                value={christianPrayerForm.prayer}
                onChange={(e) => setChristianPrayerForm({ ...christianPrayerForm, prayer: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-blue-200 rounded-xl p-3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black py-3.5 rounded-2xl text-xs uppercase cursor-pointer shadow-lg transition"
            >
              <Save className="w-4 h-4 inline mr-2" /> கிறிஸ்தவ தகவல்களைச் சேமி
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* ☪️ SECTION 3: ISLAMIC SPIRITUALITY */}
      {/* ========================================================= */}
      {activeReligionTab === 'islamic' && (
        <div className="bg-[#0a1633] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-lg font-black text-emerald-400 flex items-center gap-2">
            <Moon className="w-5 h-5 text-emerald-400" /> இஸ்லாமிய குர்ஆன் வசனம் & துஆ
          </h3>

          <form onSubmit={handleSaveIslamicCore} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-300 mb-1">அல்-குர்ஆன் வசனம் (Verse):</label>
              <textarea
                rows={3}
                value={islamicVerseForm.verse}
                onChange={(e) => setIslamicVerseForm({ ...islamicVerseForm, verse: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">அரபி துஆ (Arabic Dua):</label>
              <textarea
                rows={2}
                value={islamicDuaForm.arabicText}
                onChange={(e) => setIslamicDuaForm({ ...islamicDuaForm, arabicText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-300 rounded-xl p-3 font-serif dir-rtl"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">துஆ தமிழ் விளக்கம் (Tamil Meaning):</label>
              <textarea
                rows={2}
                value={islamicDuaForm.tamilMeaning}
                onChange={(e) => setIslamicDuaForm({ ...islamicDuaForm, tamilMeaning: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-emerald-200 rounded-xl p-3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase cursor-pointer shadow-lg transition"
            >
              <Save className="w-4 h-4 inline mr-2" /> இஸ்லாமிய தகவல்களைச் சேமி
            </button>
          </form>
        </div>
      )}
    </div>
  );
};