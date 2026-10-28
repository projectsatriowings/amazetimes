import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  Instagram, 
  Facebook, 
  Send, 
  Share2, 
  CheckCircle2, 
  ExternalLink, 
  Play, 
  MessageCircle, 
  Sparkles, 
  Bell, 
  Users, 
  Tv, 
  ArrowLeft,
  Flame,
  Award,
  Copy,
  Check,
  Filter,
  Eye,
  Heart,
  Calendar,
  Clock,
  Layers
} from 'lucide-react';
import { api, extractYouTubeId } from '../services/api';

const WhatsappIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function SocialMediaPage({ onNavigate, onToast }) {
  const [socialData, setSocialData] = useState({
    youtubeUrl: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    youtubeHandle: '@AmazeTimes',
    youtubeSubscribers: '250K',
    instagramUrl: 'https://www.instagram.com/amazetimes/?hl=en',
    instagramHandle: '@amazetimes_official',
    instagramFollowers: '180K',
    facebookUrl: 'https://www.facebook.com/amazetimes',
    facebookHandle: 'amazetimesnews',
    whatsappUrl: 'https://whatsapp.com/channel/amazetimes',
    whatsappTitle: 'Amaze Times News',
    featuredVideos: [],
    featuredReels: [],
    whatsappAnnouncements: []
  });

  const [loading, setLoading] = useState(true);
  const [activeFilterTab, setActiveFilterTab] = useState('all'); // 'all' | 'youtube' | 'instagram' | 'facebook' | 'whatsapp'
  const [activeVideoPlayer, setActiveVideoPlayer] = useState(null);
  const [copiedHandle, setCopiedHandle] = useState(null);

  // Fallback publication posts for rich Instagram & Facebook stream without broken iframes
  const customSocialPosts = [
    {
      id: 'ig-1',
      platform: 'instagram',
      author: 'Amaze Times',
      handle: '@amazetimes_official',
      time: '1 மணி நேரத்திற்கு முன்',
      title: 'மெட்ரோ ரயில் இரண்டாம் கட்டப் பணிகள்: அமேஸ் டைம்ஸ் நேரடிக் கள ஆய்வு!',
      caption: 'சென்னையின் முக்கிய போக்குவரத்து நெரிசலைக் குறைக்கும் மெட்ரோ ரயில் 2-ம் கட்ட சுரங்கப் பாதை பணிகள் விறுவிறுப்பாக நடைபெற்று வருகின்றன. #ChennaiMetro #AmazeTimes #TamilNaduNews',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
      views: '45.2K',
      likes: '3.8K',
      url: 'https://www.instagram.com/amazetimes/?hl=en'
    },
    {
      id: 'fb-1',
      platform: 'facebook',
      author: 'Amaze Times Official',
      handle: 'amazetimesnews',
      time: '2 மணி நேரத்திற்கு முன்',
      title: 'பட்ஜெட் 2026: பொதுமக்கள் மற்றும் சிறுதொழில் முனைவோரின் முக்கிய எதிர்பார்ப்புகள் என்ன?',
      caption: 'தமிழகத்தின் வளர்ச்சித் திட்டங்களுக்கான நிதி ஒதுக்கீடு மற்றும் புதிய தொழில் முதலீடுகள் குறித்த விரிவான கலந்துரையாடல். #AmazeTimesDebate #Budget2026 #TamilNadu',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
      views: '68.5K',
      likes: '5.2K',
      url: 'https://www.facebook.com/amazetimes'
    },
    {
      id: 'ig-2',
      platform: 'instagram',
      author: 'Amaze Times',
      handle: '@amazetimes_official',
      time: '4 மணி நேரத்திற்கு முன்',
      title: 'தளபதி 69 மற்றும் கூலி: கோலிவுட்டின் பாக்ஸ் ஆபீஸ் எதிர்பார்ப்பு அனல் பறக்கிறது!',
      caption: 'இந்த ஆண்டின் பிரம்மாண்ட வெளியீடுகளாக எதிர்பார்க்கப்படும் முன்னணி நட்சத்திரங்களின் திரைப்பட அப்டேட்டுகள். #Thalapathy69 #Coolie #CinemaBuzz #AmazeTimes',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
      views: '92.4K',
      likes: '12.1K',
      url: 'https://www.instagram.com/amazetimes/?hl=en'
    },
    {
      id: 'fb-2',
      platform: 'facebook',
      author: 'Amaze Times Official',
      handle: 'amazetimesnews',
      time: '6 மணி நேரத்திற்கு முன்',
      title: 'ஐபிஎல் 2026: சிஎஸ்கே அணியின் புதிய வெற்றி வியூகம் - தோனி சிறப்பு பேட்டி!',
      caption: 'சேப்பாக்கம் மைதானத்தில் சென்னை சூப்பர் கிங்ஸ் அணியின் தீவிர பயிற்சி முகாம். #CSK #MSDhoni #IPL2026 #AmazeTimesSports',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800',
      views: '74.1K',
      likes: '6.9K',
      url: 'https://www.facebook.com/amazetimes'
    }
  ];

  // Real-time WhatsApp Breaking Alerts
  const whatsappBreakingUpdates = [
    {
      id: 'wa-1',
      time: '15 நிமிடங்களுக்கு முன்',
      badge: 'பிரேக்கிங் நியூஸ்',
      title: 'தமிழகத்தில் புதிய 5 தொழில் முதலீட்டு திட்டங்களுக்கு அமைச்சரவைக் கூட்டத்தில் ஒப்புதல்!',
      desc: 'சுமார் 15,000 பேருக்கு புதிய வேலைவாய்ப்புகள் உருவாகும் என அரசு தரப்பில் அதிகாரப்பூர்வ அறிவிப்பு.'
    },
    {
      id: 'wa-2',
      time: '45 நிமிடங்களுக்கு முன்',
      badge: 'சந்தை நிலவரம்',
      title: 'தங்கம் விலை இன்று சவரனுக்கு ₹120 உயர்வு - இன்றைய நிலவரப்படி ஒரு பவுன் ₹58,400 ஆக விற்பனை.',
      desc: 'வெள்ளி விலையிலும் சிறிய அளவில் மாற்றம். முதலீட்டாளர்கள் கவனத்திற்கு.'
    },
    {
      id: 'wa-3',
      time: '1 மணி நேரத்திற்கு முன்',
      badge: 'விளையாட்டு',
      title: 'ஐபிஎல் 2026 அட்டவணை வெளியீடு: முதல் போட்டியில் சிஎஸ்கே - ஆர்சிபி பலப்பரீட்சை!',
      desc: 'சேப்பாக்கம் மைதானத்தில் மார்ச் 28 அன்று தொடக்க ஆட்டம் நடைபெறுகிறது.'
    }
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchSocialData = async () => {
      try {
        const [settingsRes, videosRes] = await Promise.allSettled([
          api.getSocialMediaSettings(),
          api.getSocialVideos()
        ]);

        if (!isMounted) return;

        let videos = [];
        if (videosRes.status === 'fulfilled' && videosRes.value?.success && Array.isArray(videosRes.value?.videos) && videosRes.value.videos.length > 0) {
          videos = videosRes.value.videos;
        }

        if (settingsRes.status === 'fulfilled' && settingsRes.value?.success && settingsRes.value?.data) {
          const d = settingsRes.value.data;
          const mergedVideos = videos.length > 0 ? videos : (Array.isArray(d.featuredVideos) ? d.featuredVideos : []);
          setSocialData({
            youtubeUrl: d.youtubeUrl || 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
            youtubeHandle: d.youtubeHandle || '@AmazeTimes',
            youtubeSubscribers: d.youtubeSubscribers || '250K',
            instagramUrl: d.instagramUrl || 'https://www.instagram.com/amazetimes/?hl=en',
            instagramHandle: d.instagramHandle || '@amazetimes_official',
            instagramFollowers: d.instagramFollowers || '180K',
            facebookUrl: d.facebookUrl || 'https://www.facebook.com/amazetimes',
            facebookHandle: d.facebookHandle || 'amazetimesnews',
            whatsappUrl: d.whatsappUrl || 'https://whatsapp.com/channel/amazetimes',
            whatsappTitle: 'Amaze Times News',
            featuredVideos: mergedVideos,
            featuredReels: Array.isArray(d.featuredReels) && d.featuredReels.length > 0 ? d.featuredReels : [],
            whatsappAnnouncements: Array.isArray(d.whatsappAnnouncements) && d.whatsappAnnouncements.length > 0 ? d.whatsappAnnouncements : []
          });

          if (mergedVideos.length > 0) {
            setActiveVideoPlayer(mergedVideos[0]);
          }
        } else if (videos.length > 0) {
          setSocialData(prev => ({ ...prev, featuredVideos: videos }));
          setActiveVideoPlayer(videos[0]);
        }
      } catch (err) {
        console.warn('Social media fetch warning:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSocialData();
    return () => { isMounted = false; };
  }, []);

  const handleCopy = (text, handleKey) => {
    navigator.clipboard.writeText(text);
    setCopiedHandle(handleKey);
    if (onToast) onToast(`📋 ${text} நகலெடுக்கப்பட்டது!`);
    setTimeout(() => setCopiedHandle(null), 2500);
  };

  const handleSharePage = async () => {
    const shareData = {
      title: 'அமேஸ் டைம்ஸ் சமூக ஊடக மையம் (Amaze Times Social Media Hub)',
      text: 'அமேஸ் டைம்ஸ் அதிகாரப்பூர்வ YouTube, Instagram, Facebook மற்றும் WhatsApp தளங்களில் இணையுங்கள்!',
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        if (onToast) onToast('இணைப்பு நகலெடுக்கப்பட்டது!');
      }
    } catch (_) {}
  };

  const videosList = socialData.featuredVideos || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060a16] text-slate-900 dark:text-slate-100 font-tamil pb-16 space-y-8">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#091538] via-[#0b1c4d] to-[#12286b] text-white py-8 sm:py-12 px-4 shadow-xl border-b border-amber-500/30 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative z-10 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => onNavigate ? onNavigate('/') : (window.location.href = '/')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition border border-white/15 cursor-pointer backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>முகப்புக்குத் திரும்பு</span>
            </button>

            <button
              onClick={handleSharePage}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-black transition shadow-md cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>பகிர்க (Share Hub)</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-2xl ring-2 ring-amber-400/60 shrink-0 flex items-center justify-center">
              <img src="/amaze-times-logo.webp" alt="Amaze Times" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-red-600/30 text-red-300 border border-red-500/40 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                <Tv className="w-3.5 h-3.5" />
                <span>அதிகாரப்பூர்வ சமூக ஊடக மையம் • AMAZE TIMES</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                அமேஸ் டைம்ஸ் சமூக ஊடக அரங்கம் (Social Media Hub)
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-2xl font-medium leading-relaxed">
                உடனுக்குடனான பிரேக்கிங் செய்திகள், உண்மை ஆய்வு வீடியோக்கள், ரீல்ஸ் மற்றும் விவாதங்களை எங்களின் அதிகாரப்பூர்வ சமூக வலைத்தள பக்கங்களில் கண்டு இணையுங்கள்!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 space-y-10">

        {/* 2. OFFICIAL CHANNELS SHOWCASE (Verified VIP Cards with 1-Click Copy) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-amber-500/40 pb-2.5">
            <h2 className="text-base sm:text-lg font-black text-[#0a1945] dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600 dark:text-amber-400" />
              <span>அதிகாரப்பூர்வ பக்கங்கள் (Official Channels)</span>
            </h2>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              சரிபார்க்கப்பட்ட பேட்ஜ்கள் (Verified)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* YouTube Channel */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                    <Youtube className="w-6 h-6" />
                  </div>
                  <span className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-black px-3 py-1 rounded-full border border-red-500/30">
                    {socialData.youtubeSubscribers} சந்தாதாரர்கள்
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">யூடியூப் (YouTube)</h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  <button
                    onClick={() => handleCopy(socialData.youtubeHandle, 'yt')}
                    className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                    title="Handle-ஐ நகலெடு"
                  >
                    <span>{socialData.youtubeHandle}</span>
                    {copiedHandle === 'yt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    நேரலைச் செய்தி ஒளிபரப்பு, சிறப்பு நேர்காணல்கள் மற்றும் உண்மை ஆய்வு விவாதங்கள்.
                  </p>
                </div>
              </div>
              <a
                href={socialData.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-red-600/30"
              >
                <Youtube className="w-4 h-4" />
                <span>சப்ஸ்கிரைப் செய்க (Subscribe)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* WhatsApp Channel */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <WhatsappIcon className="w-6 h-6" />
                  </div>
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30">
                    நேரலை பிரேக்கிங்
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">வாட்ஸ்அப் (WhatsApp)</h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white" />
                  </div>
                  <button
                    onClick={() => handleCopy('Amaze Times News', 'wa')}
                    className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{socialData.whatsappTitle}</span>
                    {copiedHandle === 'wa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    உங்கள் வாட்ஸ்அப்பிற்கே நேரடியாக வரும் உடனுக்குடன் பிரேக்கிங் நியூஸ் எச்சரிக்கைகள்.
                  </p>
                </div>
              </div>
              <a
                href={socialData.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-600/30"
              >
                <WhatsappIcon className="w-4 h-4" />
                <span>சேனலில் இணைக (Join Channel)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Instagram Profile */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 text-xs font-black px-3 py-1 rounded-full border border-pink-500/30">
                    {socialData.instagramFollowers} ஃபாலோயர்கள்
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">இன்ஸ்டாகிராம் (Instagram)</h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  <button
                    onClick={() => handleCopy(socialData.instagramHandle, 'ig')}
                    className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 hover:text-pink-500 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{socialData.instagramHandle}</span>
                    {copiedHandle === 'ig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    தினசரி இன்ஃபோகிராபிக்ஸ், வைரல் ரீல்ஸ், சினிமா அப்டேட்டுகள் மற்றும் சிறப்பு புகைப்படங்கள்.
                  </p>
                </div>
              </div>
              <a
                href={socialData.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Instagram className="w-4 h-4" />
                <span>ஃபாலோ செய்க (Follow)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Facebook Page */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-1 rounded-full border border-blue-500/30">
                    அதிகாரப்பூர்வ பக்கம்
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">பேஸ்புக் (Facebook)</h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  <button
                    onClick={() => handleCopy(socialData.facebookHandle, 'fb')}
                    className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 hover:text-blue-500 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{socialData.facebookHandle}</span>
                    {copiedHandle === 'fb' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    முழுமையான தலையங்க கட்டுரைகள், வீடியோ விவாதங்கள் மற்றும் வாசகர் கருத்துக்களம்.
                  </p>
                </div>
              </div>
              <a
                href={socialData.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Facebook className="w-4 h-4" />
                <span>பின்தொடர்க (Follow Page)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </section>

        {/* 3. INTERACTIVE FILTER TABS */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-[#0c1427] p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {[
              { id: 'all', label: 'அனைத்தும் (All Streams)', icon: Layers },
              { id: 'youtube', label: 'YouTube வீடியோக்கள்', icon: Youtube },
              { id: 'whatsapp', label: 'WhatsApp நேரலை எச்சரிக்கைகள்', icon: WhatsappIcon },
              { id: 'instagram', label: 'Instagram ரீல்ஸ்', icon: Instagram },
              { id: 'facebook', label: 'Facebook பதிவுகள்', icon: Facebook }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeFilterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. YOUTUBE RSS VIDEO FEED SECTION */}
        {(activeFilterTab === 'all' || activeFilterTab === 'youtube') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  யூடியூப் நேரலை & சிறப்பு வீடியோக்கள் (YouTube Video Feed)
                </h2>
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/20">
                  AUTO-SYNCED
                </span>
              </div>
              <a
                href={socialData.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <span>முழு சேனல் காண</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Featured Main Video Player */}
            {activeVideoPlayer && (
              <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideoPlayer.videoId || activeVideoPlayer.id}?autoplay=0&rel=0`}
                    title={activeVideoPlayer.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="lg:col-span-4 space-y-3 text-white">
                  <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-white" /> முக்கிய வீடியோ
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                    {activeVideoPlayer.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {activeVideoPlayer.description || 'அமேஸ் டைம்ஸ் ஆசிரியர் குழுவின் உண்மை ஆய்வு வீடியோ அறிக்கை.'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-amber-400 font-bold pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {activeVideoPlayer.timeAgo || 'சமீபத்தியது'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono">
                      {activeVideoPlayer.publishedAt ? new Date(activeVideoPlayer.publishedAt).toLocaleDateString('ta-IN') : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videosList.map((video) => {
                const vid = video.videoId || video.id;
                const thumb = video.thumbnailUrl || (vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : '/amaze-times-logo.webp');
                const isSelected = activeVideoPlayer && (activeVideoPlayer.videoId || activeVideoPlayer.id) === vid;

                return (
                  <div
                    key={vid || Math.random()}
                    onClick={() => {
                      setActiveVideoPlayer(video);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className={`bg-white dark:bg-[#0c1427] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl flex flex-col justify-between ${
                      isSelected ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={thumb}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </span>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {video.timeAgo || 'சமீபத்தில்'}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors">
                        {video.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                          <Youtube className="w-3.5 h-3.5" /> Amaze Times
                        </span>
                        <span>{video.views || '1.5K+ பார்வைகள்'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. WHATSAPP LIVE ALERTS STREAM */}
        {(activeFilterTab === 'all' || activeFilterTab === 'whatsapp') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/40 pb-2">
              <div className="flex items-center gap-2">
                <WhatsappIcon className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  வாட்ஸ்அப் நேரலை பிரேக்கிங் எச்சரிக்கைகள் (WhatsApp Live Broadcasts)
                </h2>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                  REAL-TIME
                </span>
              </div>
              <a
                href={socialData.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>வாட்ஸ்அப்பில் சேர</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {whatsappBreakingUpdates.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-emerald-950/20 dark:bg-[#071714] rounded-2xl p-4 sm:p-5 border border-emerald-500/30 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        {msg.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {msg.time}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {msg.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {msg.desc}
                    </p>
                  </div>

                  <a
                    href={socialData.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="pt-2 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 border-t border-emerald-500/20"
                  >
                    <span>சேனலில் பார்க்க / பகிர்க</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. INSTAGRAM & FACEBOOK SLEEK CUSTOM STREAM CARDS (Zero Broken Iframes) */}
        {(activeFilterTab === 'all' || activeFilterTab === 'instagram' || activeFilterTab === 'facebook') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-pink-500/40 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  இன்ஸ்டாகிராம் & பேஸ்புக் சிறப்புப் பதிவுகள் (Curated Social Media Stream)
                </h2>
                <span className="bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-pink-500/20">
                  VERIFIED FEED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {customSocialPosts
                .filter(p => activeFilterTab === 'all' || activeFilterTab === p.platform)
                .map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-[#0c1427] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Post Header */}
                      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                            post.platform === 'instagram' ? 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600' : 'bg-blue-600'
                          }`}>
                            {post.platform === 'instagram' ? <Instagram className="w-4 h-4" /> : <Facebook className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">{post.author}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{post.handle}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{post.time}</span>
                      </div>

                      {/* Post Image */}
                      <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-2">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {post.likes}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
                        </div>
                      </div>

                      {/* Post Caption */}
                      <div className="p-4 space-y-2">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {post.caption}
                        </p>
                      </div>
                    </div>

                    {/* View Original Action */}
                    <div className="p-3.5 pt-0">
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition text-white ${
                          post.platform === 'instagram'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <span>நேரடியாகப் பார்க்க (View Post)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
