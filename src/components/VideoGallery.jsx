import React, { useState, useEffect } from 'react';
import { Youtube, Instagram, Facebook, Play, Eye, Heart, Share2, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function VideoGallery({ onOpenVideoPlayer }) {
  const [activeTab, setActiveTab] = useState('youtube');
  const [socialData, setSocialData] = useState(null);

  useEffect(() => {
    const fetchSocial = async () => {
      try {
        const res = await api.getSocialMedia();
        if (res && res.success && res.data) {
          setSocialData(res.data);
        }
      } catch (_) {}
    };
    fetchSocial();
  }, []);

  const youtubeVideos = socialData?.featuredVideos || [
    {
      id: 1,
      title: 'தமிழகத்தில் புதிய தொழில் புரட்சி - சிறப்பு கள ஆய்வு அறிக்கை',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
      views: '45K',
      duration: '08:42'
    },
    {
      id: 2,
      title: 'சென்னை மெட்ரோ 2-ஆம் கட்ட பணிகள் - நேரடி வீடியோ',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
      views: '32K',
      duration: '05:15'
    },
    {
      id: 3,
      title: 'ஐபிஎல் 2026: சிஎஸ்கே அணியின் புதிய திட்டங்கள்!',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
      views: '78K',
      duration: '12:04'
    }
  ];

  const instaReels = socialData?.featuredReels || [
    {
      id: 1,
      title: 'இன்றைய தங்கம் விலை சவரனுக்கு ₹120 உயர்வு! 🪙',
      url: 'https://instagram.com',
      thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&auto=format&fit=crop&q=80',
      views: '120K',
      likes: '8.4K'
    },
    {
      id: 2,
      title: 'மதுரை மீனாட்சி அம்மன் கோவில் சிறப்பு திருவிழா காட்சி! 🛕',
      url: 'https://instagram.com',
      thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&auto=format&fit=crop&q=80',
      views: '95K',
      likes: '11.2K'
    },
    {
      id: 3,
      title: 'கலைஞர் நூற்றாண்டு நூலகம் - மாணவர்கள் குவிந்தனர்! 📚',
      url: 'https://instagram.com',
      thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
      views: '64K',
      likes: '5.1K'
    }
  ];

  const fbPosts = socialData?.featuredFacebookPosts || [
    {
      id: 1,
      title: 'தமிழக அரசு அறிவித்துள்ள புதிய கல்வி உதவித்தொகை திட்டங்கள் பற்றிய முழு விவரம்.',
      url: 'https://facebook.com',
      likes: '1.2K',
      shares: '450',
      date: '2 மணி நேரத்திற்கு முன்'
    },
    {
      id: 2,
      title: 'தென் மாவட்டங்களில் பெய்த கனமழை: அணைகளின் நீர்மட்டம் உயர்வு.',
      url: 'https://facebook.com',
      likes: '890',
      shares: '210',
      date: '5 மணி நேரத்திற்கு முன்'
    }
  ];

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
              <p className="text-xs text-gray-400">செய்தி வீடியோக்கள், ரீல்ஸ்கள் மற்றும் சமூக வலைதள நேரலை பதிவுகள்</p>
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
              <span>YouTube</span>
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
              <span>Facebook</span>
            </button>
          </div>
        </div>

        {/* Tab 1: YouTube Videos */}
        {activeTab === 'youtube' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {youtubeVideos.map(vid => (
                <div
                  key={vid.id}
                  onClick={() => onOpenVideoPlayer && onOpenVideoPlayer(vid)}
                  className="bg-[#0f1a33] rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        <Eye size={12} /> {vid.views} பார்வைகள்
                      </span>
                      <span className="text-red-400 font-semibold">வீடியோவைக் காண்க</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <a
                href={socialData?.youtubeUrl || 'https://youtube.com/@AmazeTimes'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950 transition"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {instaReels.map(reel => (
                <a
                  key={reel.id}
                  href={reel.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0f1a33] rounded-2xl overflow-hidden border border-gray-800 hover:border-pink-500/50 transition group flex flex-col justify-between"
                >
                  <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
                    <img
                      src={reel.thumbnail}
                      alt={reel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <Eye size={11} /> {reel.views}
                    </span>
                    <span className="flex items-center gap-1 text-pink-400 font-bold">
                      <Heart size={11} className="fill-pink-500" /> {reel.likes}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-2 text-center">
              <a
                href={socialData?.instagramUrl || 'https://instagram.com/amazetimes'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg transition"
              >
                <Instagram size={16} />
                <span>Instagram பக்கத்தில் பின்தொடர (Follow Us)</span>
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: Facebook Feed */}
        {activeTab === 'facebook' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fbPosts.map(post => (
                <a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0f1a33] rounded-2xl p-4 border border-gray-800 hover:border-blue-500/50 transition group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
                    <Facebook size={16} />
                    <span>Amaze Times முகநூல் பதிவு</span>
                    <span className="text-gray-500 text-[10px] ml-auto">{post.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                    {post.title}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[11px] text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-blue-300">
                        <Heart size={12} /> {post.likes} விருப்பங்கள்
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Share2 size={12} /> {post.shares} பகிர்வுகள்
                      </span>
                    </div>
                    <span className="text-blue-400 flex items-center gap-1 font-semibold group-hover:underline">
                      <span>தொடர்க</span> <ExternalLink size={12} />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-2 text-center">
              <a
                href={socialData?.facebookUrl || 'https://facebook.com/amazetimes'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-950 transition"
              >
                <Facebook size={16} />
                <span>Facebook பக்கத்தில் லைக் செய்க (Like on Facebook)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
