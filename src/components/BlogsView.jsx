import React, { useState } from 'react';
import { 
  BookOpen, 
  Feather, 
  Sparkles, 
  Heart, 
  Share2, 
  Clock, 
  User, 
  Send, 
  CheckCircle2, 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  Filter, 
  ArrowRight, 
  ChevronRight, 
  Smile, 
  Award,
  PenTool
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_BLOG_ITEMS } from './admin/AdminBlogManager';

export default function BlogsView({
  onOpenArticle,
  onSpeak,
  onBookmark,
  savedBookmarks = [],
  onToast
}) {
  const { customBlogsData } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedBlogIds, setLikedBlogIds] = useState(new Set());
  const [submissionForm, setSubmissionForm] = useState({
    authorName: '',
    email: '',
    category: 'story',
    title: '',
    content: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const rawBlogs = (customBlogsData && customBlogsData.length > 0) ? customBlogsData : DEFAULT_BLOG_ITEMS;

  // Filter blogs
  const filteredBlogs = rawBlogs.filter((blog) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'famous-writer') return blog.blogType === 'famous-writer' || blog.category === 'famous-writer';
    if (selectedCategory === 'kids-story') return blog.blogType === 'kids-story' || blog.category === 'kids-story';
    if (selectedCategory === 'literature') return blog.blogType === 'literature' || blog.category === 'literature' || !blog.blogType;
    return true;
  });

  const featuredBlog = filteredBlogs[0] || rawBlogs[0];
  const listBlogs = filteredBlogs.slice(1);

  const handleLike = (id, e) => {
    e.stopPropagation();
    setLikedBlogIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (onToast) onToast('உங்கள் விருப்பம் பதிவு செய்யப்பட்டது! ❤️');
      }
      return next;
    });
  };

  const handleShare = (blog, e) => {
    e.stopPropagation();
    const text = encodeURIComponent(`📖 *அமேஸ் டைம்ஸ் வலைப்பதிவு:* "${blog.title}"\n✍️ ஆசிரியர்: ${blog.authorName || 'அமேஸ் டைம்ஸ் வாசகர்'}\n\nபடிக்க: ${window.location.origin}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleBlogClick = (blog) => {
    if (onOpenArticle) {
      onOpenArticle({
        id: blog.id,
        title: blog.title,
        content: blog.content || blog.summary,
        summary: blog.summary,
        author: blog.authorName,
        category: 'வலைப்பதிவு',
        image: blog.mainImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        cover_image_url: blog.mainImage,
        time: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('ta-IN') : 'இன்று',
        readTime: blog.readingTime || '4 நிமிட வாசிப்பு'
      });
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!submissionForm.title || !submissionForm.content || !submissionForm.authorName) {
      if (onToast) onToast('தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும்.');
      return;
    }
    setIsSubmitted(true);
    if (onToast) onToast('உங்கள் படைப்பு ஆசிரியரின் பார்வைக்கு வெற்றிகரமாக அனுப்பப்பட்டது! 🎉');
    setTimeout(() => {
      setSubmissionForm({ authorName: '', email: '', category: 'story', title: '', content: '' });
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-8 max-w-[1380px] mx-auto py-2 font-tamil">
      {/* 1. BLOGS MASTHEAD */}
      <section className="bg-gradient-to-r from-[#0a1945] via-[#1a1438] to-[#0a2520] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none select-none text-[200px] font-black text-amber-400">
          ✍️
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-sm tracking-wider flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5" />
              <span>வலைப்பதிவுகள் & இலக்கிய அரங்கம்</span>
            </span>
            <span className="text-amber-300 font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>படைப்பாளர்களுக்கான சிறப்புக் களம்</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            சிந்தனைக் களம், சிறுகதைகள் & இலக்கியப் பதிவுகள்
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            முன்னணி தமிழ் எழுத்தாளர்கள், சிந்தனையாளர்கள் மற்றும் அமேஸ் டைம்ஸ் வாசகர்களின் பிரத்யேக படைப்புகள், சிறுகதைகள், வாழ்க்கை வழிகாட்டிகள் மற்றும் ஆய்வுக் கட்டுரைகள்.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-2 flex-wrap text-xs font-bold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              அனைத்து படைப்புகள் ({rawBlogs.length})
            </button>
            <button
              onClick={() => setSelectedCategory('famous-writer')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'famous-writer'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              பிரபல எழுத்தாளர்கள் ✍️
            </button>
            <button
              onClick={() => setSelectedCategory('kids-story')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'kids-story'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              சிறுவர் நீதிக்கதைகள் 🧒
            </button>
            <button
              onClick={() => setSelectedCategory('literature')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'literature'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              கட்டுரைகள் & சிந்தனை 💡
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURED SPOTLIGHT BLOG */}
      {featuredBlog && (
        <section className="bg-white dark:bg-[#0c1427] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-black text-xs uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                வாரத்தின் சிறப்புப் படைப்பு (Featured Blog)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onSpeak && (
                <button
                  onClick={() => onSpeak(`${featuredBlog.title}. ${featuredBlog.summary || featuredBlog.content || ''}`)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0e2a7a] dark:text-amber-300 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-slate-700 cursor-pointer transition-all"
                  title="ஆடியோ மூலம் கேட்க"
                >
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  <span>குரல் வழி கேட்க</span>
                </button>
              )}

              <button
                onClick={(e) => handleShare(featuredBlog, e)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-all"
                title="பகிர்க"
              >
                <Share2 className="w-4 h-4 text-emerald-500" />
                <span>பகிர்</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Cover Image */}
            <div 
              className="lg:col-span-5 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 group cursor-pointer relative"
              onClick={() => handleBlogClick(featuredBlog)}
            >
              <img
                src={featuredBlog.mainImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'}
                alt={featuredBlog.title}
                className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-amber-300 text-[11px] font-black px-3 py-1 rounded-full border border-amber-400/30">
                {featuredBlog.readingTime || '5 நிமிட வாசிப்பு'}
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full">
                  {featuredBlog.targetAudience ? `இலக்கு: ${featuredBlog.targetAudience}` : 'இலக்கியக் கட்டுரை'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredBlog.createdAt || 'இன்று'}
                </span>
              </div>

              <h2
                onClick={() => handleBlogClick(featuredBlog)}
                className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight hover:text-red-600 dark:hover:text-amber-300 cursor-pointer transition-colors"
              >
                {featuredBlog.title}
              </h2>

              {/* Author Strip */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0e2a7a] to-blue-600 text-white flex items-center justify-center font-black text-sm shadow">
                  {featuredBlog.authorName?.charAt(0) || 'எ'}
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                    {featuredBlog.authorName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {featuredBlog.authorTagline || 'எழுத்தாளர் & ஆய்வாளர்'}
                  </p>
                </div>
              </div>

              {/* Moral or Summary Highlight */}
              {featuredBlog.moral && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3.5 rounded-r-xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-bold leading-relaxed">
                  💡 <strong>நீதிக்கருத்து:</strong> {featuredBlog.moral}
                </div>
              )}

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                {featuredBlog.summary || featuredBlog.content}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleBlogClick(featuredBlog)}
                  className="bg-[#0e2a7a] hover:bg-red-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-2"
                >
                  <span>முழுப் பதிவை வாசிக்க</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleLike(featuredBlog.id, e)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    likedBlogIds.has(featuredBlog.id)
                      ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="விருப்பம்"
                >
                  <Heart className={`w-4 h-4 ${likedBlogIds.has(featuredBlog.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{likedBlogIds.has(featuredBlog.id) ? 'விரும்பப்பட்டது' : 'விருப்பம்'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. BLOGS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>அனைத்து வலைப்பதிவுகள் & படைப்புகள் ({filteredBlogs.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">வாசகர் அரங்கம்</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(listBlogs.length > 0 ? listBlogs : filteredBlogs).map((blog) => {
            const isLiked = likedBlogIds.has(blog.id);
            return (
              <article
                key={blog.id}
                onClick={() => handleBlogClick(blog)}
                className="bg-white dark:bg-[#0c1427] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Thumbnail Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={blog.mainImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {blog.readingTime || '3 நிமிடம்'}
                    </div>
                    {blog.targetAudience && (
                      <div className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        {blog.targetAudience}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{blog.authorName}</span>
                      <span>•</span>
                      <span>{blog.createdAt || 'இன்று'}</span>
                    </div>

                    <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-amber-300 transition-colors">
                      {blog.title}
                    </h4>

                    {blog.moral && (
                      <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-lg line-clamp-1 border border-amber-200 dark:border-amber-900/40">
                        💡 {blog.moral}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {blog.summary || blog.content}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleLike(blog.id, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'
                      }`}
                      title="விருப்பம்"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleShare(blog, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      title="பகிர்க"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs font-black text-[#0e2a7a] dark:text-amber-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>வாசிக்க</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. SUBMIT YOUR BLOG / ARTICLE CALL TO ACTION */}
      <section className="bg-gradient-to-r from-slate-100 to-amber-50 dark:from-[#090f1e] dark:to-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-300 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              எழுத்தாளர் களம்: உங்கள் படைப்பை அமேஸ் டைம்ஸில் வெளியிட வேண்டுமா?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              உங்கள் கவிதைகள், சிறுகதைகள், கட்டுரைகள் அல்லது நீதிக்கதைகளை எங்களுக்கு அனுப்பி வைக்கலாம்.
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>நன்றி! உங்கள் படைப்பு ஆசிரியரின் பரிசீலனைக்கு வெற்றிகரமாகப் பதிவு செய்யப்பட்டது. தகுதியான படைப்புகள் தளத்தில் வெளியிடப்படும்.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="உங்கள் பெயர் *"
                value={submissionForm.authorName}
                onChange={(e) => setSubmissionForm(prev => ({ ...prev, authorName: e.target.value }))}
                required
                className="bg-white dark:bg-[#0c1427] border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2a7a]"
              />
              <input
                type="email"
                placeholder="மின்னஞ்சல் முகவரி"
                value={submissionForm.email}
                onChange={(e) => setSubmissionForm(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white dark:bg-[#0c1427] border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2a7a]"
              />
              <select
                value={submissionForm.category}
                onChange={(e) => setSubmissionForm(prev => ({ ...prev, category: e.target.value }))}
                className="bg-white dark:bg-[#0c1427] border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2a7a]"
              >
                <option value="story">சிறுகதை / நீதிக்கதை</option>
                <option value="poem">கவிதை</option>
                <option value="essay">சிந்தனைக் கட்டுரை</option>
                <option value="opinion">கருத்துக்களம்</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="படைப்பின் தலைப்பு *"
              value={submissionForm.title}
              onChange={(e) => setSubmissionForm(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full bg-white dark:bg-[#0c1427] border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2a7a]"
            />

            <textarea
              rows={4}
              placeholder="உங்கள் படைப்பின் முழு விவரம் / வரிகளை இங்கு உள்ளிடவும்... *"
              value={submissionForm.content}
              onChange={(e) => setSubmissionForm(prev => ({ ...prev, content: e.target.value }))}
              required
              className="w-full bg-white dark:bg-[#0c1427] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2a7a]"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#0e2a7a] hover:bg-red-600 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>படைப்பை ஆசிரியருக்கு அனுப்புக</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
