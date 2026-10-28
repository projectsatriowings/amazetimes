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
  Radio, 
  ArrowLeft,
  Flame,
  Award
} from 'lucide-react';
import { api, getVisitorId } from '../services/api';

export default function SocialMediaPage({ onNavigate, onToast }) {
  const [socialData, setSocialData] = useState({
    youtubeUrl: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    youtubeHandle: '@AmazeTimes',
    youtubeSubscribers: '250K',
    instagramUrl: 'https://www.instagram.com/amazetimes/?hl=en',
    instagramHandle: '@amazetimes_official',
    instagramFollowers: '180K',
    facebookUrl: 'https://www.facebook.com/amazetimes',
    facebookHandle: 'Amaze Times Official',
    whatsappUrl: 'https://whatsapp.com/channel/amazetimes',
    xUrl: 'https://twitter.com/AmazeTimes',
    xHandle: '@AmazeTimes',
    xFollowers: '95K',
    telegramUrl: 'https://t.me/AmazeTimes',
    telegramHandle: 'Amaze Times Tamil',
    telegramSubscribers: '60K',
    whatsappAnnouncements: [
      {
        id: 1,
        time: '10 நிமிடங்களுக்கு முன்',
        title: 'பிரேக்கிங்: தமிழகத்தில் புதிய 5 தொழில் திட்டங்களுக்கு அமைச்சரவை ஒப்புதல்!',
        category: 'அரசியல்'
      },
      {
        id: 2,
        time: '35 நிமிடங்களுக்கு முன்',
        title: 'தங்கம் விலை இன்று சவரனுக்கு ₹120 உயர்வு - தற்போதைய சந்தை நிலவரம்!',
        category: 'வணிகம்'
      },
      {
        id: 3,
        time: '1 மணி நேரத்திற்கு முன்',
        title: 'ஐபிஎல் 2026: சிஎஸ்கே அணியின் புதிய வெற்றி வியூகம் - தோனி சிறப்பு பேட்டி!',
        category: 'விளையாட்டு'
      }
    ],
    featuredVideos: [],
    featuredReels: [
      {
        id: '1',
        title: 'மெட்ரோ ரயில் இரண்டாம் கட்டப் பணிகள் விறுவிறுப்பு!',
        url: 'https://www.instagram.com/amazetimes/?hl=en',
        views: '45K'
      },
      {
        id: '2',
        title: 'தளபதி 69 படப்பிடிப்பு தளத்திலிருந்து நேரடித் தகவல்கள்!',
        url: 'https://www.instagram.com/amazetimes/?hl=en',
        views: '92K'
      },
      {
        id: '3',
        title: 'சென்னை சூப்பர் கிங்ஸ் தீவிர பயிற்சி முகாம்!',
        url: 'https://www.instagram.com/amazetimes/?hl=en',
        views: '68K'
      }
    ]
  });

  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const [settingsRes, videosRes] = await Promise.allSettled([
          api.getSocialMediaSettings(),
          api.getSocialVideos()
        ]);

        if (isMounted) {
          let foundVideos = [];
          if (videosRes.status === 'fulfilled' && videosRes.value?.success && Array.isArray(videosRes.value?.videos)) {
            foundVideos = videosRes.value.videos;
          }

          if (settingsRes.status === 'fulfilled' && settingsRes.value?.success && settingsRes.value?.data) {
            const data = settingsRes.value.data;
            const mergedVideos = foundVideos.length > 0 ? foundVideos : (data.featuredVideos || []);
            setSocialData(prev => ({
              ...prev,
              ...data,
              featuredVideos: mergedVideos,
              whatsappAnnouncements: data.whatsappAnnouncements?.length > 0 
                ? data.whatsappAnnouncements 
                : prev.whatsappAnnouncements
            }));

            const topId = mergedVideos[0]?.videoId || mergedVideos[0]?.id;
            if (topId) setActiveVideoId(topId);
          } else if (foundVideos.length > 0) {
            setSocialData(prev => ({ ...prev, featuredVideos: foundVideos }));
            setActiveVideoId(foundVideos[0].videoId || foundVideos[0].id);
          }
        }
      } catch (err) {
        console.warn('Social media settings loaded fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, []);


  const handleShare = async () => {
    const shareData = {
      title: 'அமேஸ் டைம்ஸ் சமூக ஊடக மையம்',
      text: 'அமேஸ் டைம்ஸ் - அதிகாரப்பூர்வ வாட்ஸ்அப் சேனல், யூடியூப் மற்றும் இன்ஸ்டாகிராம் பக்கங்களில் இணையுங்கள்!',
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

  return (
    <div className="min-h-screen bg-[#f6f8fb] dark:bg-[#070d1e] text-slate-900 dark:text-slate-100 font-tamil pb-16">
      
      {/* Top Banner & Breadcrumb Header */}
      <div className="bg-gradient-to-r from-[#0a1945] via-[#0e2a7a] to-[#123896] text-white py-8 sm:py-12 px-4 shadow-lg border-b border-white/10 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative z-10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => onNavigate ? onNavigate('/') : (window.location.href = '/')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-white/15 cursor-pointer backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>முகப்புக்குத் திரும்பு</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>பகிர்க (Share Hub)</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-xl ring-2 ring-amber-400/50 shrink-0 flex items-center justify-center">
              <img src="/amaze-times-logo.webp" alt="Amaze Times Logo" className="w-full h-full object-contain" />
            </div>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-red-600/30 text-red-300 border border-red-500/40 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                <Tv className="w-3 h-3" />
                <span>அதிகாரப்பூர்வ சமூக ஊடக வலையமைப்பு</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                அமேஸ் டைம்ஸ் சமூக ஊடக மையம் (Social Media Hub)
              </h1>
              <p className="text-sm sm:text-base text-slate-200 mt-2 font-medium">
                உடனுக்குடனான முக்கியச் செய்திகள், வீடியோ அறிக்கைகள், நேரலை விவாதங்கள் மற்றும் ரீல்ஸ் வீடியோக்களை எங்களின் சரிபார்க்கப்பட்ட சமூக ஊடகத் தளங்களில் கண்டு மகிழுங்கள்!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        
        {/* 1. OFFICIAL CHANNELS GRID (Verified Cards) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h2 className="text-lg sm:text-xl font-black text-[#0a1945] dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600 dark:text-amber-400" />
              <span>அதிகாரப்பூர்வ பக்கங்கள் (Official Channels)</span>
            </h2>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              சரிபார்க்கப்பட்ட பேட்ஜ்கள் (Verified)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* YouTube Card */}
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{socialData.youtubeHandle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    24 மணி நேர நேரலைச் செய்தி ஒளிபரப்பு, சிறப்பு நேர்காணல்கள் மற்றும் உண்மை ஆய்வு விவாதங்கள்.
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

            {/* WhatsApp Channel Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30">
                    முக்கியச் செய்திகள் உடனுக்குடன்
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">வாட்ஸ்அப் சேனல் (WhatsApp)</h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Amaze Times Breaking Alert</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
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
                <MessageCircle className="w-4 h-4" />
                <span>சேனலில் இணைக (Join Channel)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Instagram Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{socialData.instagramHandle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    தினசரி இன்ஃபோகிராபிக்ஸ், வைரல் ரீல்ஸ், சினிமா கிளிப்புகள் மற்றும் விவாதக் கருத்துகள்.
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

            {/* Facebook Card */}
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{socialData.facebookHandle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    ஆழமான கட்டுரைகள், வாசகர்களின் கருத்துக்கள் மற்றும் முழுமையான செய்தித் தொகுப்புகள்.
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

            {/* X (Twitter) Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center border border-slate-500/20 group-hover:scale-110 transition-transform font-black">
                    𝕏
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700">
                    {socialData.xFollowers} ஃபாலோயர்கள்
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">எக்ஸ் / ட்விட்டர் (X)</h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{socialData.xHandle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    மின்னல் வேகத்தில் வெளிவரும் அதிகாரப்பூர்வ அரசு அறிக்கைகள் மற்றும் முக்கியச் செய்திகள்.
                  </p>
                </div>
              </div>
              <a
                href={socialData.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span className="font-bold">𝕏</span>
                <span>Follow on 𝕏</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Telegram Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform">
                    <Send className="w-6 h-6" />
                  </div>
                  <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-black px-3 py-1 rounded-full border border-sky-500/30">
                    {socialData.telegramSubscribers} உறுப்பினர்கள்
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">டெலிகிராம் (Telegram)</h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{socialData.telegramHandle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    தினசரி காலை இ-பேப்பர் PDF பதிவிறக்கங்கள் மற்றும் பிரேக்கிங் தலைப்புகள்.
                  </p>
                </div>
              </div>
              <a
                href={socialData.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>டெலிகிராமில் இணைக (Join)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </section>

        {/* 2. LIVE YOUTUBE BULLETIN & VIDEO PLAYER */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main YouTube Embedded Player (8 Cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0c1427] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  நேரலை செய்தி புல்லட்டின் & சிறப்பு வீடியோக்கள்
                </h3>
              </div>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
                🔴 நேரலை (Live Stream)
              </span>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId || socialData?.featuredVideos?.[0]?.videoId || ''}?autoplay=0&rel=0`}
                title="Amaze Times Live Bulletin"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>


            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  அமேஸ் டைம்ஸ் 24x7 டிவி டிஜிட்டல் செய்தி அரங்கம்
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  தமிழ்நாட்டின் உண்மைச் செய்திகளை உடனுக்குடன் வழங்கும் நம்பகமான ஊடகம்
                </p>
              </div>
              <a
                href={socialData.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>அனைத்து வீடியோக்களும்</span>
              </a>
            </div>
          </div>

          {/* WhatsApp Channel Live Stream Feed (4 Cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0c1427] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">வாட்ஸ்அப் சேனல் ஃபீட்</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">உடனுக்குடன் புதிய செய்திகள்</p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {socialData.whatsappAnnouncements.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-black px-2 py-0.5 rounded-md text-[10px]">
                      {item.category || 'செய்தி'}
                    </span>
                    <span className="text-slate-400">{item.time || 'இப்போது'}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>

            <a
              href={socialData.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>இப்போதே சேனலில் இணைக</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </section>

        {/* 3. INSTAGRAM REELS & SHORTS PREVIEW CAROUSEL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-pink-500 pb-2">
            <h2 className="text-lg sm:text-xl font-black text-[#0a1945] dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <span>இன்ஸ்டாகிராம் ரீல்ஸ் தொகுப்பு (Trending Reels)</span>
            </h2>
            <a
              href={socialData.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
            >
              <span>மேலும் காண்க</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {socialData.featuredReels.map((reel, idx) => (
              <div 
                key={reel.id || idx}
                className="bg-white dark:bg-[#0c1427] rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="aspect-[9/12] w-full rounded-2xl bg-gradient-to-tr from-purple-900 via-pink-900 to-amber-900 flex flex-col justify-between p-4 relative overflow-hidden text-white shadow-inner">
                    <div className="flex items-center justify-between z-10">
                      <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{reel.views || '50K'} பார்வைகள்</span>
                      </span>
                      <Instagram className="w-4 h-4 text-pink-300" />
                    </div>

                    <div className="z-10 space-y-1">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 group-hover:scale-125 transition-transform">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                      <p className="text-xs font-black line-clamp-2 leading-tight drop-shadow">
                        {reel.title}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={reel.url || socialData.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full bg-slate-100 hover:bg-pink-50 dark:bg-slate-900 dark:hover:bg-pink-950/40 text-slate-800 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-800"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>ரீல்ஸ் பார்க்க (Watch Reel)</span>
                </a>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
