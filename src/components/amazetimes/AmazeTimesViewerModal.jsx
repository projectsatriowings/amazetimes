import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BookOpen, Newspaper, Calendar, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Scissors, 
  Layers, Sun, Moon, Coffee, X, Lock, CheckCircle, Shield,
  Home, CornerDownLeft, Sparkles, RefreshCw
} from 'lucide-react';

import AmazeTimesFlipbook from './AmazeTimesFlipbook';
import AmazeTimesThumbnailDrawer from './AmazeTimesThumbnailDrawer';
import AmazeTimesArticleClipper from './AmazeTimesArticleClipper';
import { exportPublicationToPdf, captureSinglePageSnapshot } from '../../utils/pdfExporter';

export default function AmazeTimesViewerModal({
  isOpen,
  onClose,
  initialPublication = 'enewspaper', // 'magazine' | 'enewspaper'
  initialDate = null,
  readerUser = null,
  onOpenAuth,
  onToast
}) {
  if (!isOpen) return null;

  // Active Publication Type: 'magazine' or 'enewspaper'
  const [publicationType, setPublicationType] = useState(initialPublication || 'enewspaper');

  // Publication Data
  const [publication, setPublication] = useState(null);
  const [pages, setPages] = useState([]);
  const [availableEditions, setAvailableEditions] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Magazine selectors
  const [selectedMagYear, setSelectedMagYear] = useState('2026');
  const [selectedMagMonth, setSelectedMagMonth] = useState('11');

  // Newspaper selectors (IST Today Default)
  const [selectedNewspaperDate, setSelectedNewspaperDate] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  const [selectedNewspaperEdition, setSelectedNewspaperEdition] = useState('main');
  const [pdfProgress, setPdfProgress] = useState(null);
  const [isCapturingClip, setIsCapturingClip] = useState(false);

  // Flipbook state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputVal, setPageInputVal] = useState('1');
  const [isDualPageMode, setIsDualPageMode] = useState(() => window.innerWidth >= 768);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [readingMode, setReadingMode] = useState('light'); // 'light', 'dark', 'sepia'

  // Modals & Drawers
  const [isThumbnailDrawerOpen, setIsThumbnailDrawerOpen] = useState(false);
  const [isClipperOpen, setIsClipperOpen] = useState(false);
  const [clipperTargetPage, setClipperTargetPage] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const containerRef = useRef(null);

  // Sync initialPublication & initialDate props
  useEffect(() => {
    if (initialPublication) {
      setPublicationType(initialPublication);
    }
  }, [initialPublication]);

  useEffect(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      setSelectedNewspaperDate(initialDate);
    }
  }, [initialDate]);

  // Load publication data from API
  const fetchPublication = useCallback(async () => {
    setIsLoading(true);
    try {
      if (publicationType === 'magazine') {
        const url = `/api/amazetimes/magazine?year=${selectedMagYear}&month=${selectedMagMonth}&_t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setPublication(data.publication);
          setPages(data.pages || []);
          setAvailableEditions(data.availableEditions || []);
        }
      } else {
        const url = `/api/amazetimes/enewspaper?date=${selectedNewspaperDate}&edition=${selectedNewspaperEdition}&_t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          let loadedPages = Array.isArray(data.pages) ? [...data.pages] : [];
          const edDateDisp = data.publication?.edition_date_display || selectedNewspaperDate;
          const srcNewsDateDisp = data.publication?.source_news_date_display || edDateDisp;

          // Keep Front Page + ALL News Sections FIRST; place Special Pages cleanly at the END of the newspaper
          const SPECIAL_TEMPLATES = new Set([
            'newspaper-horoscope',
            'newspaper-kural-kids',
            'newspaper-puzzles',
            'newspaper-fun-corner'
          ]);

          const existingHoroscope = loadedPages.find(p => p.template === 'newspaper-horoscope');
          const existingKuralKids = loadedPages.find(p => p.template === 'newspaper-kural-kids');
          const existingPuzzles = loadedPages.find(p => p.template === 'newspaper-puzzles');
          const newsCorePages = loadedPages.filter(p => !SPECIAL_TEMPLATES.has(p.template));

          // 1. Intact Full-Page 12-Rasi Horoscope & Panchangam (NEVER split across pages)
          let horoscopePage = existingHoroscope;
          if (!horoscopePage || !Array.isArray(horoscopePage.horoscopeSigns) || horoscopePage.horoscopeSigns.length < 12) {
            let zodiacSigns = Array.isArray(horoscopePage?.horoscopeSigns) ? horoscopePage.horoscopeSigns : [];
            if (zodiacSigns.length < 12) {
              try {
                const zRes = await fetch('/api/zodiac').then(r => r.json());
                if (zRes?.success && Array.isArray(zRes.signs)) zodiacSigns = zRes.signs;
              } catch (_) {}
            }
            horoscopePage = {
              ...(horoscopePage || {}),
              template: 'newspaper-horoscope',
              section: 'இன்றைய ராசிபலன் & ஆன்மிகப் பஞ்சாங்கம்',
              editionDateFormatted: edDateDisp,
              sourceNewsDateFormatted: srcNewsDateDisp,
              horoscopeSigns: zodiacSigns,
              panchangam: horoscopePage?.panchangam || {
                tamilDate: 'கார்த்திகை மாதம் • சுப தினம்',
                nallaNeram: 'காலை 09:30 – 10:30 | மாலை 04:30 – 05:30',
                rahuKalam: 'மதியம் 12:00 – 01:30',
                yemagandam: 'காலை 07:30 – 09:00',
                kuligai: 'காலை 10:30 – 12:00',
                soolam: 'வடக்கு • பரிகாரம்: பால்'
              },
              imageUrl: '/Amaze times.jpg',
              thumbnail: '/Amaze times.jpg'
            };
          }

          // Rich fallback interactive dataset (used if backend hasn't been restarted yet)
          const fallbackCorner = {
            kurals: [
              {
                number: '391',
                adhigaram: 'கல்வி',
                line1: 'கற்க கசடறக் கற்பவை கற்றபின்',
                line2: 'நிற்க அதற்குத் தக.',
                meaning: 'கற்க வேண்டிய நல்ல நூல்களைக் குற்றமறத் தெளிவாகக் கற்க வேண்டும்; அப்படிக் கற்ற பிறகு, அந்தக் கல்விக்குத் தக்கபடி நன்னெறியில் நடக்க வேண்டும்.',
                lifeLesson: 'படிப்பது மட்டும் போதாது — கற்ற நல்ல கருத்துகளை அன்றாட வாழ்க்கையில் கடைப்பிடிப்பதே உண்மையான கல்வி.'
              },
              {
                number: '611',
                adhigaram: 'ஆள்வினையுடைமை',
                line1: 'அருமை உடைத்தென்று அசாவாமை வேண்டும்',
                line2: 'பெருமை முயற்சி தரும்.',
                meaning: 'இச்செயல் செய்வதற்கு மிகவும் அரியது என்று மனம் தளராமல் இருக்க வேண்டும்; தளராத முயற்சியே ஒருவருக்குப் பெருமையைத் தரும்.',
                lifeLesson: 'பெரிய இலக்குகளைக் கண்டு பயப்படாமல் சிறிய அடிகளாகத் தொடர்ந்து முயன்றால் வெற்றி நிச்சயம்.'
              }
            ],
            proverb: {
              tamil: '«அகத்தின் அழகு முகத்தில் தெரியும்»',
              explanation: 'ஒருவரின் உள்ளத்தில் உள்ள அமைதி, அன்பு மற்றும் நேர்மை ஆகியவை அவரின் முக மலர்ச்சியிலும் பேச்சிலும் இயல்பாகவே வெளிப்படும்.'
            },
            quote: {
              text: '«கனவு காணுங்கள்! ஆனால் கனவு என்பது தூக்கத்தில் வருவதல்ல; உங்களைத் தூங்க விடாமல் செய்வதே உண்மையான கனவு.»',
              author: 'டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம்'
            },
            kidsStory: {
              title: 'புத்திசாலி குருவியும் தண்ணீர்ப் பானையும்',
              paragraphs: [
                'கொளுத்தும் கோடைக் காலத்தில் ஒரு சிறிய குருவிக்கு மிகவும் தாகம் எடுத்தது. குளங்கள், குட்டைகள் எல்லாம் வற்றிப் போயிருந்ததால், நீண்ட தூரம் பறந்து தேடியும் ஒரு சொட்டுத் தண்ணீர் கூடக் கிடைக்கவில்லை. சோர்ந்து போன குருவி ஒரு வீட்டின் தோட்டத்து மரக்கிளையில் அமர்ந்து சுற்றும் முற்றும் பார்த்தது.',
                'அப்போது மரத்தடியில் ஒரு பழைய மண்பானை இருப்பதைக் கவனித்தது. ஆவலுடன் பறந்து சென்று எட்டிப் பார்த்தபோது, பானையின் அடிப்பகுதியில் சிறிதளவு சுத்தமான தண்ணீர் இருந்தது. ஆனால் பானையின் கழுத்து குறுகலாக இருந்ததால் குருவியின் அலகு தண்ணீருக்கு எட்டவே இல்லை.',
                'குருவி நம்பிக்கையை இழக்காமல் யோசித்தது. அருகிலிருந்த சிறிய கூழாங்கற்களை ஒவ்வொன்றாகத் தன் அலகால் கொத்தி எடுத்துப் பானைக்குள் போடத் தொடங்கியது. முப்பதுக்கும் மேற்பட்ட கற்களைப் போட்டதும் தண்ணீர் மெல்ல மெல்ல மேலே உயர்ந்தது! குருவி மகிழ்ச்சியுடன் வயிறாரத் தண்ணீர் குடித்துவிட்டு நன்றியுடன் வானில் பறந்து சென்றது.'
              ],
              moral: 'விடாமுயற்சியும் புத்திசாலித்தனமும் இருந்தால் எந்தக் கடினமான பிரச்சனையையும் எளிதில் தீர்க்கலாம்!',
              reflection: 'சிந்தனைக் கேள்வி: இன்று நீங்கள் சந்திக்கும் ஒரு சவாலைப் பொறுமையாகவும் புத்திசாலித்தனமாகவும் எவ்வாறு தீர்ப்பீர்கள்?'
            },
            didYouKnowList: [
              'தேன் மட்டுமே ஆயிரக்கணக்கான ஆண்டுகள் ஆனாலும் கெட்டுப்போகாத ஒரே இயற்கை உணவுப் பொருள் — எகிப்து பிரமிடுகளில் 3,000 ஆண்டு பழமையான தேன் இன்றும் உண்ணக்கூடியதாகக் கிடைத்தது!',
              'தஞ்சாவூர் பெரிய கோயிலின் 80 டன் எடையுள்ள கலசக் கல் 6 கி.மீ. நீள சாய்தளப் பாதை அமைத்து யானைகள் மூலம் மேலே ஏற்றப்பட்டது.',
              'மனித மூளையில் சுமார் 8,600 கோடி நரம்பு செல்கள் உள்ளன; அவை ஒரு விநாடியில் மின்னல் வேகத்தில் ஆயிரக்கணக்கான தகவல்களைப் பரிமாறுகின்றன.'
            ],
            riddles: [
              { q: '1. கால் இல்லாமல் ஓடுவான், கழுத்து இல்லாமல் கத்துவான் — அவன் யார்?', a: 'ஆறு (நதி)' },
              { q: '2. பச்சைப் பெட்டிக்குள் வெள்ளை முத்துக்கள் — அது என்ன?', a: 'வெண்டைக்காய்' },
              { q: '3. இரவெல்லாம் பூத்திருக்கும், பகலில் உதிர்ந்துவிடும் — அது என்ன?', a: 'நட்சத்திரங்கள்' },
              { q: '4. வாய் உண்டு ஆனால் பேசாது, படுக்கை உண்டு ஆனால் தூங்காது — அது என்ன?', a: 'ஆறு (River Bed)' },
              { q: '5. எவ்வளவு எடுத்தாலும் இன்னும் பெரிதாகிக் கொண்டே போகும் — அது என்ன?', a: 'குழி (பள்ளம்)' },
              { q: '6. தலையில் கிரீடம் உண்டு ஆனால் அரசன் அல்ல; காலையில் கூவும் ஆனால் கடிகாரம் அல்ல — யார்?', a: 'சேவல்' }
            ],
            puzzles: [
              {
                title: 'எண் வரிசைப் புதிர் (Number Sequence)',
                question: 'வரிசை எண் கண்டுபிடியுங்கள்: 2, 6, 12, 20, 30, 42, ___ ?',
                answer: '56 (வேறுபாடு: +4, +6, +8, +10, +12, +14)'
              },
              {
                title: 'தர்க்கப் புதிர் (Logic Teaser)',
                question: 'ஒரு கூடைக்குள் 5 ஆப்பிள்கள் உள்ளன. 5 குழந்தைகளுக்கு ஆளுக்கு ஒரு ஆப்பிள் கொடுத்த பிறகும் கூடையில் 1 ஆப்பிள் இருக்க வேண்டும். எப்படி?',
                answer: '5-வது குழந்தைக்குக் கூடையோடு சேர்த்து அந்த கடைசி ஆப்பிளைக் கொடுக்க வேண்டும்!'
              }
            ],
            wordGames: [
              { clue: '1. மூன்று எழுத்துத் தமிழ் வார்த்தை — முதலும் கடைசியும் «க», நடுவில் «ட» = ?', answer: 'கடகம் / கடக்க' },
              { clue: '2. «தமிழ்» என்ற சொல்லின் முதல் மற்றும் கடைசி எழுத்துகளை இணைத்தால் வரும் சொல்?', answer: 'தழ் (தழை / தமிழ்)' },
              { clue: '3. தலைகீழாகப் படித்தாலும் மாறாத தமிழ் வார்த்தை (Palindrome) எது?', answer: 'விகடகவி / மாமா / கலக' },
              { clue: '4. «வானம் + வில்» சேர்த்தால் கிடைக்கும் அழகிய இயற்கை நிகழ்வு?', answer: 'வானவில்' }
            ],
            gkQuiz: [
              { q: '1. தமிழ்நாட்டின் மாநிலப் பறவை எது? (அ) மயில் (ஆ) மரகதப் புறா (இ) குயில் (ஈ) கிளி', a: '(ஆ) மரகதப் புறா' },
              { q: '2. உலகின் மிகப் பழமையான அணைகளில் ஒன்றான கல்லணையைக் கட்டிய மன்னர் யார்? (அ) ராஜராஜ சோழன் (ஆ) கரிகால சோழன் (இ) பாண்டியன் நெடுஞ்செழியன் (ஈ) சேரன் செங்குட்டுவன்', a: '(ஆ) கரிகால சோழன்' },
              { q: '3. இந்திய விண்வெளி ஆராய்ச்சி நிறுவனம் (ISRO) எந்த ஆண்டு தொடங்கப்பட்டது? (அ) 1962 (ஆ) 1969 (இ) 1975 (ஈ) 1983', a: '(ஆ) 1969' },
              { q: '4. மனித உடலில் உள்ள மிகப்பெரிய உறுப்பு எது? (அ) கல்லீரல் (ஆ) இதயம் (இ) தோல் (ஈ) நுரையீரல்', a: '(இ) தோல் (Skin)' },
              { q: '5. திருக்குறளில் மொத்தம் எத்தனை அதிகாரங்களும் குறள்களும் உள்ளன? (அ) 108 / 1080 (ஆ) 133 / 1330 (இ) 120 / 1200 (ஈ) 140 / 1400', a: '(ஆ) 133 அதிகாரங்கள் / 1330 குறள்கள்' }
            ],
            healthTips: [
              'தினமும் காலையில் வெறும் வயிற்றில் 2 டம்ளர் வெதுவெதுப்பான நீர் குடிப்பது செரிமானத்தை மேம்படுத்தி உடலைப் புத்துணர்ச்சியாக்கும்.',
              'திரையைத் தொடர்ந்து பார்ப்பவர்கள் 20 நிமிடங்களுக்கு ஒருமுறை 20 அடி தூரமுள்ள பொருளை 20 விநாடிகள் பார்ப்பது கண் சோர்வைத் தடுக்கும்.',
              'இரவு உணவைத் தூங்குவதற்கு குறைந்தது 2 மணி நேரத்திற்கு முன்பே எளிதாக ஜீரணமாகும் உணவாக எடுத்துக்கொள்வது ஆழ்ந்த தூக்கத்திற்கு உதவும்.'
            ]
          };

          // 2. Split Page A: Thirukkural (2 Kurals) + Proverb + Quote + Expanded Kids Story + 3 Science/Heritage Facts
          const kuralKidsPage = existingKuralKids || {
            template: 'newspaper-kural-kids',
            section: 'திருக்குறள், தமிழ் மரபு & சிறுவர் கதை உலகம்',
            editionDateFormatted: edDateDisp,
            sourceNewsDateFormatted: srcNewsDateDisp,
            interactiveCorner: fallbackCorner,
            imageUrl: '/Amaze times.jpg',
            thumbnail: '/Amaze times.jpg'
          };

          // 3. Split Page B: Brain Games — 6 Riddles + 2 Math/Logic Puzzles + 4 Word Clues + 5 GK Quiz + 3 Health Tips + Answers Key
          const puzzlesPage = existingPuzzles || {
            template: 'newspaper-puzzles',
            section: 'மூளைக்கு வேலை — விடுகதைகள், புதிர்கள் & வினாடி வினா',
            editionDateFormatted: edDateDisp,
            sourceNewsDateFormatted: srcNewsDateDisp,
            interactiveCorner: fallbackCorner,
            imageUrl: '/Amaze times.jpg',
            thumbnail: '/Amaze times.jpg'
          };

          // Assemble final E-Paper: Page 1 Front -> Pages 2..N-3 ALL News -> Page N-2 Horoscope (intact) -> Page N-1 Kural & Kids -> Page N Puzzles & Quiz
          const assembled = [...newsCorePages, horoscopePage, kuralKidsPage, puzzlesPage];
          loadedPages = assembled.map((p, idx) => {
            const num = idx + 1;
            let title = p.title;
            if (p.template === 'newspaper-horoscope') {
              title = `பக்கம் ${num}: இன்றைய ராசிபலன் & பஞ்சாங்கம் (Daily Horoscope)`;
            } else if (p.template === 'newspaper-kural-kids') {
              title = `பக்கம் ${num}: திருக்குறள், பழமொழி & சிறுவர் நீதிக் கதை`;
            } else if (p.template === 'newspaper-puzzles') {
              title = `பக்கம் ${num}: விடுகதைகள், புதிர்கள் & பொது அறிவு வினாடி வினா`;
            } else if (typeof title === 'string' && /^பக்கம்\s+\d+:/.test(title)) {
              title = title.replace(/^பக்கம்\s+\d+:/, `பக்கம் ${num}:`);
            }
            return { ...p, pageNumber: num, title };
          });

          // Ensure Front Page Market Box ALWAYS shows live up-to-date Gold/Silver/Petrol/Diesel rates
          if (loadedPages[0]?.template === 'newspaper-front' && (!loadedPages[0].marketRates?.updatedDate || String(loadedPages[0].marketRates?.gold22k || '').includes('7,250'))) {
            try {
              const gRes = await fetch('/api/gold/current').then(r => r.json());
              if (gRes?.success && gRes.data?.gold22k) {
                const live = gRes.data;
                loadedPages[0] = {
                  ...loadedPages[0],
                  marketRates: {
                    ...loadedPages[0].marketRates,
                    gold22k: `₹${Number(live.gold22k).toLocaleString('en-IN')} / கி`,
                    silver: `₹${Number(live.silver || 105).toLocaleString('en-IN')} / கி`,
                    petrol: `₹${live.petrol || '100.80'} / லி`,
                    diesel: `₹${live.diesel || '92.39'} / லி`,
                    updatedDate: loadedPages[0].editionDateFormatted
                  }
                };
              }
            } catch (_) {}
          }

          setPublication(data.publication);
          setPages(loadedPages);
          setAvailableDates(data.availableDates || []);
          setAvailableEditions(data.availableEditions || []);
        }
      }
    } catch (err) {
      console.error('Fetch publication error:', err);
      if (onToast) onToast('பதிப்பு விவரங்களை ஏற்றுவதில் பிழை', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [publicationType, selectedMagYear, selectedMagMonth, selectedNewspaperDate, selectedNewspaperEdition, onToast]);

  useEffect(() => {
    fetchPublication();
    setCurrentPage(1);
    setPageInputVal('1');
    setZoomScale(1.0);
  }, [fetchPublication]);

  // Keep page input in sync with currentPage
  useEffect(() => {
    setPageInputVal(String(currentPage));
  }, [currentPage]);

  // Anti-Screen Capture & Privacy Focus Detection
  useEffect(() => {
    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Keyboard Navigation & DRM Shortcut Interception
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Intercept Print & Save Shortcuts (DRM)
      if (e.key === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        if (onToast) onToast('டிஜிட்டல் பதிப்புரிமைப் பாதுகாப்பு (DRM): அச்சு எடுத்தல் மற்றும் சேமித்தல் முடக்கப்பட்டுள்ளது.');
        return;
      }

      // If user is typing in page jumper input, don't trigger hotkeys
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentPage(pages.length || 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, isDualPageMode, isFullscreen, onClose, onToast]);

  // Page Jump Handlers
  const totalPages = pages.length || (publicationType === 'magazine' ? 32 : 16);

  const handleNextPage = () => {
    const step = isDualPageMode && currentPage > 1 ? 2 : (currentPage === 1 ? 1 : 1);
    setCurrentPage(prev => Math.min(totalPages, prev + step));
  };

  const handlePrevPage = () => {
    const step = isDualPageMode && currentPage > 2 ? 2 : 1;
    setCurrentPage(prev => Math.max(1, prev - step));
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const target = parseInt(pageInputVal, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target);
    } else {
      setPageInputVal(String(currentPage));
    }
  };

  // Sync fullscreen state if user presses browser Escape
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Fullscreen Reading Toggle (enters native browser Fullscreen + hides toolbars for distraction-free edge-to-edge reading)
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      setIsThumbnailDrawerOpen(false);
      const el = containerRef.current;
      if (el && !document.fullscreenElement) {
        const reqFs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (reqFs) {
          Promise.resolve(reqFs.call(el)).catch(() => {
            // Even if native fullscreen is blocked (e.g. iOS Safari), immersive full-viewport mode stays active
          });
        }
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        const exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exitFs) {
          Promise.resolve(exitFs.call(document)).catch(() => {});
        }
      }
    }
  };

  // Open Article Clipper (Captures crisp live structured page snapshot)
  const handleOpenClipper = async (pageObj) => {
    const activeObj = pageObj || pages.find(p => p.pageNumber === currentPage) || pages[0] || {
      pageNumber: currentPage,
      imageUrl: publication?.cover_image_url || '/Amaze times.jpg'
    };

    try {
      setIsCapturingClip(true);
      const editionLabel = publication?.edition || publication?.edition_name || '';
      const snapshotDataUrl = await captureSinglePageSnapshot({
        page: activeObj,
        publicationType,
        editionName: editionLabel
      });
      setClipperTargetPage({ ...activeObj, imageUrl: snapshotDataUrl });
      setIsClipperOpen(true);
    } catch (err) {
      console.warn('Snapshot fallback:', err);
      setClipperTargetPage(activeObj);
      setIsClipperOpen(true);
    } finally {
      setIsCapturingClip(false);
    }
  };

  // Download Real Multi-Page PDF Edition (VIP Login check)
  const handleDownloadFullEdition = async () => {
    if (!readerUser) {
      if (onToast) onToast('மின்-இதழ் / நாளிதழை முழு PDF ஆக பதிவிறக்க வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (pdfProgress) return; // already exporting

    const editionLabel = publication?.edition || publication?.edition_name || '';
    const dateFormatted = publication?.edition_date_display || selectedNewspaperDate;
    const fileName = publicationType === 'magazine'
      ? `Amaze_Times_Magazine_${selectedMagYear}_${selectedMagMonth}.pdf`
      : `Amaze_Times_EPaper_${dateFormatted}_${selectedNewspaperEdition}.pdf`;

    try {
      if (onToast) onToast('உயர்-தெளிவு PDF கோப்பு உருவாக்கப்படுகிறது... காத்திருக்கவும்.');
      await exportPublicationToPdf({
        pages,
        publicationType,
        editionName: editionLabel,
        fileName,
        onProgress: (curr, tot) => setPdfProgress({ current: curr, total: tot })
      });
      if (onToast) onToast('PDF கோப்பு வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!', 'success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      if (onToast) onToast('PDF உருவாக்குவதில் பிழை: ' + err.message, 'error');
    } finally {
      setPdfProgress(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none font-tamil overflow-hidden animate-fadeIn"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ========================================================
          1. UNIFIED ULTRA-SLEEK TOP NAVIGATION (Single 46px Bar - Maximizes Reading Area)
      ======================================================== */}
      {!isFullscreen && (
      <header className="bg-slate-900/95 border-b border-amber-500/30 px-3 sm:px-5 py-2 flex items-center justify-between gap-2.5 flex-shrink-0 shadow-2xl z-30 backdrop-blur-md">
        
        {/* Left: Brand + Publication Switcher + Issue/Date Selector */}
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          {/* Brand Mark */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-300 p-0.5 shadow flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <span className="font-serif font-black text-amber-400 text-sm">அ</span>
              </div>
            </div>
            <span className="hidden sm:inline font-black text-sm lg:text-base text-white tracking-tight">
              அமேஸ் டைம்ஸ்
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block shrink-0" />

          {/* Segmented Switcher: Magazine vs E-Paper */}
          <div className="bg-slate-950/80 p-0.5 rounded-xl border border-slate-700/80 flex items-center shadow-inner shrink-0">
            <button
              onClick={() => {
                setPublicationType('magazine');
                setCurrentPage(1);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                publicationType === 'magazine'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>மாதாந்திர இதழ்</span>
            </button>

            <button
              onClick={() => {
                setPublicationType('enewspaper');
                setCurrentPage(1);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                publicationType === 'enewspaper'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>மின்-நாளிதழ்</span>
            </button>
          </div>

          {/* Date / Issue Selectors */}
          {publicationType === 'magazine' ? (
            <select
              value={`${selectedMagYear}-${selectedMagMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-');
                setSelectedMagYear(y);
                setSelectedMagMonth(m);
              }}
              className="bg-slate-800 text-amber-300 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 shrink-0"
            >
              {availableEditions.map(ed => (
                <option key={ed.id} value={`${ed.year}-${String(ed.month).padStart(2, '0')}`}>
                  {ed.title || ed.edition}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="date"
                value={selectedNewspaperDate}
                onChange={(e) => setSelectedNewspaperDate(e.target.value)}
                className="bg-slate-800 text-amber-300 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
              />

              {/* Quick Jumps */}
              {(() => {
                const hPage = pages.find(p => p.template === 'newspaper-horoscope');
                if (!hPage) return null;
                return (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(hPage.pageNumber)}
                    className={`hidden md:flex px-2 py-1 rounded-lg text-[11px] font-black items-center gap-1 transition cursor-pointer border ${
                      currentPage === hPage.pageNumber
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 border-amber-400/30'
                    }`}
                    title="ராசிபலன் & பஞ்சாங்கம்"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ராசிபலன்</span>
                  </button>
                );
              })()}

              {(() => {
                const kPage = pages.find(p => p.template === 'newspaper-kural-kids' || p.template === 'newspaper-fun-corner');
                if (!kPage) return null;
                return (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(kPage.pageNumber)}
                    className={`hidden lg:flex px-2 py-1 rounded-lg text-[11px] font-black items-center gap-1 transition cursor-pointer border ${
                      currentPage === kPage.pageNumber
                        ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-400 hover:text-slate-950 border-emerald-400/30'
                    }`}
                    title="திருக்குறள் & சிறுவர் கதை"
                  >
                    <span>📜 திருக்குறள்</span>
                  </button>
                );
              })()}

              {(() => {
                const pzPage = pages.find(p => p.template === 'newspaper-puzzles');
                if (!pzPage) return null;
                return (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(pzPage.pageNumber)}
                    className={`hidden lg:flex px-2 py-1 rounded-lg text-[11px] font-black items-center gap-1 transition cursor-pointer border ${
                      currentPage === pzPage.pageNumber
                        ? 'bg-indigo-400 text-slate-950 border-indigo-300'
                        : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-400 hover:text-slate-950 border-indigo-400/30'
                    }`}
                    title="புதிர்கள் & வினாடி வினா"
                  >
                    <span>🧩 புதிர்கள்</span>
                  </button>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right: Spread Mode, Reading Filter, Clipper, Download PDF, Fullscreen, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dual / Single Spread Toggle */}
          <div className="hidden md:flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setIsDualPageMode(true)}
              className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition ${
                isDualPageMode ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
              title="இரட்டைப் பக்கம் (Dual Spread)"
            >
              இரட்டை
            </button>
            <button
              onClick={() => setIsDualPageMode(false)}
              className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition ${
                !isDualPageMode ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
              title="ஒற்றைப் பக்கம் (Single Page)"
            >
              ஒற்றை
            </button>
          </div>

          {/* Reading Mode Switcher (Light / Dark / Sepia) */}
          <div className="hidden sm:flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setReadingMode('light')}
              className={`p-1 rounded transition ${readingMode === 'light' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="இயல்பு (Light)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReadingMode('dark')}
              className={`p-1 rounded transition ${readingMode === 'dark' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="இரவு (Dark)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReadingMode('sepia')}
              className={`p-1 rounded transition ${readingMode === 'sepia' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="பாரம்பரியம் (Sepia)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Crop Article Clipper Button */}
          <button
            onClick={() => handleOpenClipper()}
            disabled={isCapturingClip}
            className="hidden sm:flex bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 px-2 py-1 rounded-lg text-xs font-bold transition items-center gap-1 cursor-pointer disabled:opacity-60"
            title="செய்திக் கத்தரிப்பு (Article Clipper)"
          >
            <Scissors className={`w-3.5 h-3.5 ${isCapturingClip ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">{isCapturingClip ? 'தயாராகிறது...' : 'கத்தரி'}</span>
          </button>

          {/* Download Full Edition PDF */}
          <button
            onClick={handleDownloadFullEdition}
            disabled={Boolean(pdfProgress)}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer disabled:opacity-70"
            title="முழுமையான பதிப்பு பதிவிறக்கம் (PDF)"
          >
            <Download className={`w-3.5 h-3.5 ${pdfProgress ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">
              {pdfProgress ? `${pdfProgress.current}/${pdfProgress.total}` : 'PDF'}
            </span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 transition border border-slate-700 cursor-pointer"
            title="முழுத்திரை வாசிப்பு (Fullscreen - F)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Close Modal (Esc) */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-600/80 hover:bg-red-500 text-white flex items-center justify-center transition cursor-pointer shadow"
            title="வெளியேறு (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>
      )}

      {/* ========================================================
          3. MAIN INTERACTIVE FLIPBOOK READING ENGINE
      ======================================================== */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-slate-950">
        {/* FLOATING FULLSCREEN READING HUD (Unobtrusive glass bar that appears in Full Screen mode) */}
        {isFullscreen && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-2 bg-slate-900/75 hover:bg-slate-900/95 backdrop-blur-xl border border-amber-400/30 px-3 py-1.5 rounded-full shadow-2xl text-xs transition-opacity opacity-70 hover:opacity-100">
            <span className="font-black text-amber-300 px-1.5 hidden sm:inline">
              {publicationType === 'magazine' ? 'மாத இதழ்' : 'மின்-நாளிதழ்'}
            </span>
            <span className="text-slate-200 font-bold bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
              பக்கம் {currentPage} / {totalPages}
            </span>

            {/* Spread Toggle */}
            <button
              onClick={() => setIsDualPageMode(prev => !prev)}
              className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-bold transition cursor-pointer"
              title="இரட்டை / ஒற்றைப் பக்கம்"
            >
              {isDualPageMode ? 'இரட்டை' : 'ஒற்றை'}
            </button>

            {/* Quick Zoom */}
            <div className="flex items-center gap-1 bg-slate-800/90 px-1.5 py-0.5 rounded-full border border-slate-700">
              <button
                onClick={() => setZoomScale(prev => Math.max(0.75, prev - 0.25))}
                className="p-0.5 text-slate-300 hover:text-amber-300 cursor-pointer"
                title="சிறிதாக்கு"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(1.0)}
                className="text-[10px] font-mono font-bold text-amber-300 px-1 cursor-pointer"
                title="100% அளவு"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))}
                className="p-0.5 text-slate-300 hover:text-amber-300 cursor-pointer"
                title="பெரிதாக்கு"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Reading Mode */}
            <button
              onClick={() => setReadingMode(prev => prev === 'light' ? 'sepia' : (prev === 'sepia' ? 'dark' : 'light'))}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer"
              title="வாசிப்பு நிறம் (Light / Sepia / Dark)"
            >
              {readingMode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : (readingMode === 'sepia' ? <Coffee className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />)}
            </button>

            {/* Exit Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-full shadow transition cursor-pointer"
              title="முழுத்திரை வெளியேறு (Esc / F)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>வெளியேறு</span>
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400 animate-pulse">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="text-sm font-bold text-amber-300">
              {publicationType === 'magazine' ? 'அமேஸ் டைம்ஸ் மாதாந்திர இதழ்' : 'அமேஸ் டைம்ஸ் நாளிதழ்'} பக்கங்கள் ஏற்றப்படுகின்றன...
            </span>
          </div>
        ) : (
          <AmazeTimesFlipbook
            pages={pages}
            currentPage={currentPage}
            totalPages={totalPages}
            isDualPageMode={isDualPageMode}
            isFullscreen={isFullscreen}
            zoomScale={zoomScale}
            setZoomScale={setZoomScale}
            readingMode={readingMode}
            publicationType={publicationType}
            editionName={publication?.edition || publication?.edition_name || ''}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            onOpenClipper={(pageObj) => handleOpenClipper(pageObj)}
            readerUser={readerUser}
            isWindowBlurred={isWindowBlurred}
          />
        )}
      </main>

      {/* ========================================================
          4. BOTTOM FILMSTRIP THUMBNAIL DRAWER (Hidden in Fullscreen Read Mode)
      ======================================================== */}
      {!isFullscreen && (
      <AmazeTimesThumbnailDrawer
        isOpen={isThumbnailDrawerOpen}
        onToggle={() => setIsThumbnailDrawerOpen(prev => !prev)}
        pages={pages}
        currentPage={currentPage}
        isDualPageMode={isDualPageMode}
        onSelectPage={(pageNum) => {
          setCurrentPage(pageNum);
          setIsThumbnailDrawerOpen(false);
        }}
        publicationType={publicationType}
        editionName={publication?.edition || publication?.edition_name || ''}
      />
      )}

      {/* ========================================================
          5. BOTTOM MASTER NAVIGATION & TOOLBAR (Hidden in Fullscreen Read Mode)
      ======================================================== */}
      {!isFullscreen && (
      <footer className="bg-slate-900 border-t border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0 z-20 shadow-2xl">
        
        {/* Left: Previous / Next & Page Jumper */}
        <div className="flex items-center gap-2">
          {/* Cover Jump */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="முதல் பக்கம் (Cover)"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">முந்தைய பக்கம்</span>
          </button>

          {/* Page Jumper Form */}
          <form onSubmit={handleGoToPage} className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-medium">பக்கம்</span>
            <input
              type="text"
              value={pageInputVal}
              onChange={(e) => setPageInputVal(e.target.value)}
              className="w-10 bg-slate-800 text-amber-300 font-mono font-bold text-center rounded px-1 py-0.5 border border-slate-600 focus:outline-none focus:border-amber-400"
            />
            <span className="text-slate-400 font-medium">/ {totalPages}</span>
            <button type="submit" className="text-slate-400 hover:text-amber-400 ml-1" title="செல்க">
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
          >
            <span className="hidden sm:inline">அடுத்த பக்கம்</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setZoomScale(prev => Math.max(0.75, prev - 0.25))}
            className="p-1 hover:text-amber-400 text-slate-300 transition"
            title="சிறிதாக்கு (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono font-bold text-[11px] px-1.5 text-amber-300 min-w-[42px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>

          <button
            onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))}
            className="p-1 hover:text-amber-400 text-slate-300 transition"
            title="பெரிதாக்கு (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setZoomScale(1.0)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition"
            title="இயல்பு அளவு (Fit to Screen)"
          >
            பொருத்து
          </button>

          <button
            onClick={() => setZoomScale(1.4)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition hidden sm:inline"
            title="அகலத்திற்குப் பொருத்து (Fit to Width)"
          >
            அகலம்
          </button>
        </div>

        {/* Right: Thumbnails Toggle & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Thumbnails strip button */}
          <button
            onClick={() => setIsThumbnailDrawerOpen(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              isThumbnailDrawerOpen 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="அனைத்துப் பக்கங்களின் முன்னோட்டம்"
          >
            <Layers className="w-4 h-4" />
            <span>பக்கங்கள் ({totalPages})</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs transition border border-slate-700 hover:border-amber-400 flex items-center gap-1.5 cursor-pointer"
            title="முழுத்திரை வாசிப்பு (Fullscreen - F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">முழுத்திரை</span>
          </button>
        </div>
      </footer>
      )}

      {/* ========================================================
          6. ARTICLE CLIPPER & SHARE MODAL OVERLAY
      ======================================================== */}
      {isClipperOpen && clipperTargetPage && (
        <AmazeTimesArticleClipper
          isOpen={isClipperOpen}
          onClose={() => setIsClipperOpen(false)}
          pageImage={clipperTargetPage.imageUrl || clipperTargetPage.thumbnail || publication?.cover_image_url || '/Amaze times.jpg'}
          pageNumber={clipperTargetPage.pageNumber || currentPage}
          pageTitle={clipperTargetPage.title}
          pageSection={clipperTargetPage.section}
          publicationTitle={publication?.title || 'அமேஸ் டைம்ஸ்'}
          editionName={publication?.edition || publication?.edition_name || 'முதன்மைப் பதிப்பு'}
          issueDate={publication?.publishedDate || selectedNewspaperDate}
          onToast={onToast}
        />
      )}
    </div>
  );
}

