import React, { useState, useEffect } from 'react';
import { Youtube, Instagram, Facebook, Play, Eye, Heart, Share2, ExternalLink, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function VideoGallery({ onOpenVideoPlayer }) {
  const [activeTab, setActiveTab] = useState('youtube');
  const [socialData, setSocialData] = useState(null);
  const [liveVideos, setLiveVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSocialAndVideos = async () => {
      try {
        const [socialRes, videosRes] = await Promise.allSettled([
          api.getSocialMedia(),
          api.getSocialVideos()
        ]);

        if (isMounted) {
          if (socialRes.status === 'fulfilled' && socialRes.value?.success && socialRes.value?.data) {
            setSocialData(socialRes.value.data);
          }
          if (videosRes.status === 'fulfilled' && videosRes.value?.success && Array.isArray(videosRes.value?.videos)) {
            setLiveVideos(videosRes.value.videos);
          }
        }
      } catch (err) {
        console.warn('VideoGallery fetch notice:', err);
      } finally {
        if (isMounted) setLoadingVideos(false);
      }
    };

    fetchSocialAndVideos();
    return () => { isMounted = false; };
  }, []);

  // Use live videos from server API; fallback to featured videos in settings
  const youtubeVideos = liveVideos.length > 0
    ? liveVideos
    : (Array.isArray(socialData?.featuredVideos) && socialData.featuredVideos.length > 0 ? socialData.featuredVideos : []);

  const instaReels = Array.isArray(socialData?.featuredReels) && socialData.featuredReels.length > 0
    ? socialData.featuredReels
    : [];

  const handleVideoClick = (vid) => {
    if (onOpenVideoPlayer) {
      onOpenVideoPlayer(vid);
    } else {
      setSelectedVideo(vid);
    }
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-2.5 sm:px-4 my-8 font-tamil">
      <div className="bg-[#0b1326] rounded-3xl p-5 sm:p-7 border border-gray-800 shadow-xl space-y-6">
        {/* Header with 3 Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/30">
              <Play size={20} className="fill-white" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">வீடியோ & சமூக ஊடக மையம்</h2>
              <p className="text-xs text-gray-400">உண்மையான செய்தி வீடியோக்கள், ரீல்ஸ்கள் மற்றும் அதிகாரப்பூர்வ சமூக ஊடகத் தொகுப்புகள்</p>
            </div>
          </div>

          {/* 3 Tabs */}
          <div className="flex items-center gap-1.5 bg-[#070b18] p-1 rounded-2xl border border-gray-800">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Youtube size={15} />
              <span>YouTube வீடியோக்கள்</span>
            </button>

            <button
              onClick={() => setActiveTab('reels')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'reels'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Instagram size={15} />
              <span>Insta ரீல்ஸ்</span>
            </button>

            <button
              onClick={() => setActiveTab('facebook')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'facebook'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Facebook size={15} />
              <span>Facebook பக்கம்</span>
            </button>
          </div>
        </div>

        {/* Tab 1: YouTube Videos */}
        {activeTab === 'youtube' && (
          <div className="space-y-4">
            {youtubeVideos.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="text-sm">வீடியோக்கள் ஏற்றப்படுகின்றன அல்லது யூடியூப் நேரலை ஃபீட் புதுப்பிக்கப்படுகிறது...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {youtubeVideos.map((vid, idx) => {
                  const videoId = vid.videoId || vid.id;
                  const thumb = vid.thumbnailUrl || vid.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/Amaze times.jpg');
                  return (
                    <div
                      key={videoId || idx}
                      onClick={() => handleVideoClick(vid)}
                      className="bg-[#0f1a33] rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-gray-900 overflow-hidden">
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          width="380"
                          height="214"
                          onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition">
                          <span className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={20} className="fill-white ml-0.5" />
                          </span>
                        </div>
                        {vid.duration && (
                          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 space-y-2">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-100 group-hover:text-red-400 transition line-clamp-2">
                          {vid.title}
                        </h3>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800/60">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {vid.timeAgo || 'சமீபத்தியது'}
                          </span>
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <Play size={10} className="fill-current" /> வீடியோவைக் காண்க
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 text-center">
              <a
                href={socialData?.youtubeUrl || 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950 transition cursor-pointer"
              >
                <Youtube size={16} />
                <span>YouTube-ல் கூடுதல் வீடியோக்களைப் பார்க்க & Subscribe செய்க</span>
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Instagram Reels */}
        {activeTab === 'reels' && (
          <div className="space-y-4">
            {instaReels.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="text-sm">இன்ஸ்டாகிராம் ரீல்ஸ் தொகுப்பு விரைவில் இணையும்...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {instaReels.map((reel, idx) => (
                  <a
                    key={reel.id || idx}
                    href={reel.url || socialData?.instagramUrl || 'https://www.instagram.com/amazetimes/?hl=en'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0f1a33] rounded-2xl overflow-hidden border border-gray-800 hover:border-pink-500/50 transition group flex flex-col justify-between"
                  >
                    <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
                      <img
                        src={reel.thumbnail || '/Amaze times.jpg'}
                        alt={reel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        width="240"
                        height="426"
                        onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-2.5">
                        <span className="self-end p-1 rounded-full bg-black/40 text-pink-400">
                          <Instagram size={14} />
                        </span>
                        <p className="text-[11px] font-bold text-white line-clamp-2">
                          {reel.title}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 flex items-center justify-between text-[10px] text-gray-300 border-t border-gray-800">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Eye size={11} /> {reel.views || 'ரீல்ஸ்'}
                      </span>
                      <span className="flex items-center gap-1 text-pink-400 font-bold">
                        <Heart size={11} className="fill-pink-500" /> பார்க்க
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div className="pt-2 text-center">
              <a
                href={socialData?.instagramUrl || 'https://www.instagram.com/amazetimes/?hl=en'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg transition cursor-pointer"
              >
                <Instagram size={16} />
                <span>Instagram பக்கத்தில் பின்தொடர (Follow on Instagram)</span>
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: Verified Facebook Social Badge Cards (Eliminates Empty Iframe Voids) */}
        {activeTab === 'facebook' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Facebook Verified Official Page Badge Card */}
              <div className="bg-[#0f1a33] rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 transition flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-500 flex items-center justify-center border border-blue-500/30">
                    <Facebook size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-white text-base">Amaze Times Facebook Page</h3>
                      <CheckCircle2 size={16} className="text-blue-500 fill-blue-500 text-white" />
                    </div>
                    <p className="text-xs text-blue-400 font-semibold">{socialData?.facebookHandle || 'Amaze Times Official'}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  அமேஸ் டைம்ஸ் நாளிதழின் அதிகாரப்பூர்வ பேஸ்புக் பக்கத்தில் தமிழ்நாடு அரசியல், மாவட்டச் செய்திகள், நேரலை விவாதங்கள் மற்றும் வாசகர் கருத்துப் பதிவுகளைக் காணலாம்.
                </p>

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">அதிகாரப்பூர்வ பக்கம் • உடனுக்குடன் அப்டேட்டுகள்</span>
                  <a
                    href={socialData?.facebookUrl || 'https://www.facebook.com/amazetimes'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
                  >
                    <span>பக்கத்திற்குச் செல்க</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Facebook Community & Groups Card */}
              <div className="bg-[#0f1a33] rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 transition flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center border border-blue-400/30">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">வாசகர் கலந்துரையாடல் களம்</h3>
                    <p className="text-xs text-indigo-400 font-semibold">நம்பகமான தமிழ் சமூக வலைத்தள வலையமைப்பு</p>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  நடுநிலையான உண்மைச் செய்திகளை சமூக ஊடகங்களில் பகிருங்கள். உண்மைத் தகவல்களை அறிந்துகொள்ள எங்கள் அதிகாரப்பூர்வ கணக்குகளைப் பின்தொடருங்கள்.
                </p>

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">நம்பகமான ஊடகம் • நடுநிலை விவாதம்</span>
                  <a
                    href={socialData?.facebookUrl || 'https://www.facebook.com/amazetimes'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700"
                  >
                    <span>Follow on Facebook</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* In-App Video Modal Player */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-[#0c1427] rounded-3xl p-4 sm:p-5 border border-slate-700 shadow-2xl max-w-3xl w-full text-white space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm sm:text-base line-clamp-1">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId || selectedVideo.id}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
