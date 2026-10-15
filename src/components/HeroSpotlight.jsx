import React, { useState } from 'react';
import { Eye, Clock, User, Heart, Bookmark, Share2, Volume2, ArrowRight, Flame } from 'lucide-react';

export default function HeroSpotlight({
  leadData,
  topArticles = [],
  onOpenArticle,
  onSpeak,
  onShareWhatsApp,
  onBookmark,
  savedBookmarks = [],
  onToggleLike,
  isLiked = false
}) {
  const [likesCount, setLikesCount] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);

  if (!leadData) return null;

  const userHasLiked = onToggleLike ? isLiked : hasLiked;

  const handleLike = () => {
    if (onToggleLike) {
      onToggleLike(leadData);
    } else {
      if (!hasLiked) {
        setLikesCount(prev => prev + 1);
        setHasLiked(true);
      } else {
        setLikesCount(prev => prev - 1);
        setHasLiked(false);
      }
    }
  };

  const isBookmarked = savedBookmarks.some(b => b.id === leadData.id);

  // Take top 5 ranked articles
  const topFive = (topArticles && topArticles.length > 0) 
    ? topArticles.slice(0, 5) 
    : [
        {
          id: 2,
          title: 'சென்னையில் புதிய மெட்ரோ வழித்தடப் பணிகள் 85% நிறைவு: விரைவில் வெள்ளோட்டம்!',
          category: 'தமிழ்நாடு',
          time: '15 நிமிடங்களுக்கு முன்',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 3,
          title: 'பங்குச்சந்தை புதிய உச்சம்: சென்செக்ஸ் 81,000 புள்ளிகளைக் கடந்து வரலாற்று சாதனை!',
          category: 'வணிகம்',
          time: '30 நிமிடங்களுக்கு முன்',
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 4,
          title: 'IPL 2026: சிஎஸ்கே அணியின் புதிய அதிரடி வியூகம் - சேப்பாக்கத்தில் தீவிர வலைப்பயிற்சி!',
          category: 'விளையாட்டு',
          time: '45 நிமிடங்களுக்கு முன்',
          image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 5,
          title: 'மதுரை எய்ம்ஸ் மருத்துவமனை முதன்மைக் கட்டிடப் பணிகள் அதிவேகம்: 2027-ல் மக்கள் பயன்பாடு!',
          category: 'மாவட்டங்கள்',
          time: '1 மணி நேரத்திற்கு முன்',
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 6,
          title: 'கோவை புதிய தகவல் தொழில்நுட்ப சிறப்பு பொருளாதார பூங்கா: 15,000 புதிய வேலைவாய்ப்புகள்!',
          category: 'வணிகம்',
          time: '2 மணி நேரத்திற்கு முன்',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
        }
      ];

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* =========================================================
            LEFT COLUMN (8 cols): PROMINENT LEAD STORY HERO CARD
            ========================================================= */}
        <div className="lg:col-span-8 flex flex-col">
          <article className="bg-white dark:bg-[#0d1627] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full group hover:shadow-md transition-all">
            
            {/* Visual Image Banner with 16:9 Aspect Ratio */}
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onOpenArticle(leadData.id)}>
              <img
                src={leadData.image || leadData.cover_image_url || '/Amaze times.jpg'}
                alt={leadData.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

              {/* Badges on Top */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 flex-wrap">
                <span className="bg-red-600 text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span>முக்கியச் செய்தி • {leadData.category || 'தமிழ்நாடு'}</span>
                </span>
                <span className="bg-[#0a1945]/90 backdrop-blur-md text-amber-300 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl border border-amber-400/30 shadow-xs">
                  PRGI TNBIL/2023/88656
                </span>
              </div>

              {/* View Count Overlay */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2 text-white text-xs font-semibold">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>1.4k பார்வைகள்</span>
                </span>
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{leadData.time || '10 நிமிடங்களுக்கு முன்'}</span>
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between space-y-3 sm:space-y-4">
              
              <div className="space-y-2.5 sm:space-y-3">
                {/* Author Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-[#0e2a7a] dark:text-amber-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{leadData.author || "அரசியல் நிருபர் குழு • சென்னை"}</span>
                  </span>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                    3 நிமிட வாசிப்பு
                  </span>
                </div>

                {/* Headline */}
                <h1
                  onClick={() => onOpenArticle(leadData.id)}
                  className="font-title font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                >
                  {leadData.title}
                </h1>

                {/* Summary */}
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {leadData.desc || leadData.content}
                </p>
              </div>

              {/* Engagement Toolbar & Read More Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                
                {/* Social & Reaction Buttons */}
                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      userHasLiked
                        ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-600'
                    }`}
                    title="விருப்பம் (Like)"
                  >
                    <Heart className={`w-3.5 h-3.5 ${userHasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{userHasLiked ? 'விருப்பமானது' : 'விருப்பம்'}</span>
                  </button>

                  {/* Bookmark Button */}
                  {onBookmark && (
                    <button
                      onClick={() => onBookmark(leadData)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-amber-500'
                      }`}
                      title="செய்தியைச் சேமி"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span className="hidden sm:inline">{isBookmarked ? 'சேமிக்கப்பட்டது' : 'சேமி'}</span>
                    </button>
                  )}

                  {/* WhatsApp Share */}
                  {onShareWhatsApp && (
                    <button
                      onClick={() => onShareWhatsApp(leadData.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                      title="பகிர்"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">பகிர்</span>
                    </button>
                  )}

                  {/* Voice News */}
                  {onSpeak && (
                    <button
                      onClick={() => onSpeak(leadData.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-[#0e2a7a] dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-[#0e2a7a] hover:text-white transition-all cursor-pointer"
                      title="குரல் வழி வாசிப்பு"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">கேட்க</span>
                    </button>
                  )}
                </div>

                {/* Primary Read Full Story Button */}
                <button
                  onClick={() => onOpenArticle(leadData.id)}
                  className="bg-[#0e2a7a] hover:bg-[#0a1f5c] text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span>முழுதாகப் படிக்க</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

            </div>
          </article>
        </div>

        {/* =========================================================
            RIGHT COLUMN (4 cols): TOP 5 RANKED READS (அதிகம் வாசிக்கப்பட்டவை)
            ========================================================= */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-[#fcfcfd] dark:bg-[#0d1627] rounded-3xl shadow-sm border border-red-500/20 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between h-full transition-all">
            
            {/* Widget Heading with Crimson Accent */}
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20 dark:border-slate-800 mb-3 bg-red-50/50 dark:bg-red-950/20 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 p-4 rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <Flame className="w-4 h-4 text-white fill-white" />
                </span>
                <div>
                  <h2 className="font-title font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-tight">
                    அதிகம் வாசிக்கப்பட்டவை
                  </h2>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    இன்றைய டாப் 5 முக்கியச் செய்திகள்
                  </p>
                </div>
              </div>
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                TOP 5
              </span>
            </div>

            {/* 5 Ranked Articles List - Compact & Evenly Proportioned */}
            <div className="flex-1 flex flex-col justify-around divide-y divide-slate-100 dark:divide-slate-800/80 my-1">
              {topFive.map((item, index) => {
                const rankNumber = `0${index + 1}`;
                const badgeColor = index === 0 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : index === 1 
                  ? 'bg-red-500 text-white' 
                  : index === 2 
                  ? 'bg-[#0e2a7a] text-white' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300';

                return (
                  <div
                    key={item.id || index}
                    onClick={() => onOpenArticle(item.id)}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 group cursor-pointer hover:bg-red-50/60 dark:hover:bg-slate-800/60 px-2 rounded-xl transition-all"
                  >
                    {/* Rank Badge */}
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${badgeColor}`}>
                      {rankNumber}
                    </span>

                    {/* Content & Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                        <span className="text-red-600 dark:text-red-400 font-extrabold">{item.category || 'செய்தி'}</span>
                        <span>•</span>
                        <span>{item.time || 'சிறிது நேரத்திற்கு முன்'}</span>
                      </div>
                      <h3 className="font-title font-bold text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Small Thumbnail */}
                    {item.image && (
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Link with Red Brand Button Styling */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 mt-2 text-center">
              <button
                onClick={() => {
                  const elem = document.getElementById('secondary-grid');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-600 text-red-600 dark:text-red-300 hover:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>அனைத்து முக்கியச் செய்திகளையும் காண்க</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
