import React, { useState } from 'react';
import { CheckCircle2, BookOpen, Volume2, Bookmark, BookmarkCheck, UserCheck, Clock, ArrowRight, MessageSquare, ChevronRight, Mail, CheckCircle, Send } from 'lucide-react';

export default function EditorialView({
  articles = [],
  onOpenArticle,
  onSpeak,
  onBookmark,
  savedBookmarks = [],
  isAdmin,
  onEditArticle,
  onDeleteArticle,
  onNewEditorial
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [readerFeedback, setReaderFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Thirukkural of the Day for Editorial Page
  const dailyKural = {
    kural: 'எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள்\nமெய்ப்பொருள் காண்ப தறிவு.',
    meaning: 'எந்தவொரு கருத்தை யார் கூறினாலும், அதன் உண்மைத் தன்மையை ஆராய்ந்து அறிவதே உண்மையான அறிவாகும்.',
    number: 'குறள் 423 (அறிவுடைமை)'
  };

  // Find lead editorial or fallback
  const leadEditorial = articles.find(a => a.isLead || a.tag?.includes('தலையங்கம்')) || articles[0] || {
    id: 'editorial_lead',
    title: 'உள்கட்டமைப்பு திட்டங்களும் மாநிலங்களின் நிதி தன்னாட்சியும் - அமேஸ் டைம்ஸ் தலையங்கம்',
    desc: 'பட்ஜெட் ஒதுக்கீடுகள் வெறும் எண்களின் கணக்காக அமையாமல், அடித்தட்டு மக்களின் வாழ்க்கைத்தரத்தை உயர்த்தும் நடைமுறை திட்டங்களாக வடிவம் பெற வேண்டும். கூட்டாட்சி தத்துவத்தில் மாநிலங்களின் நிதிப்பங்கீடு மற்றும் உள்கட்டமைப்பு வளர்ச்சி குறித்த நடுநிலையான தலையங்க பார்வை...',
    content: 'பட்ஜெட் ஒதுக்கீடுகள் வெறும் எண்களின் கணக்காக அமையாமல், அடித்தட்டு மக்களின் வாழ்க்கைத்தரத்தை உயர்த்தும் நடைமுறை திட்டங்களாக வடிவம் பெற வேண்டும். கூட்டாட்சி தத்துவத்தில் மாநிலங்களின் நிதிப்பங்கீடு மற்றும் உள்கட்டமைப்பு வளர்ச்சி குறித்த நடுநிலையான தலையங்க பார்வை. தொழில் வளர்ச்சிக்கும் சமூக சமத்துவத்திற்கும் இடையிலான பாலத்தை உருவாக்குவதே உண்மையான மக்கள் நல அரசுகளின் தலையாய கடமையாகும்...',
    author: 'க. சுப்பிரமணியன் (முதன்மை ஆசிரியர்)',
    time: 'இன்று காலை 07:00 IST',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    category: 'தலையங்கம்',
    readTime: '6 நிமிடம் வாசிப்பு'
  };

  const columnistArticles = articles.filter(a => a.id !== leadEditorial?.id);

  const fallbackColumns = [
    {
      id: 'col_1',
      title: 'டிஜிட்டல் யுகத்தில் தமிழ் மொழி வளர்ச்சியும் புதிய வாய்ப்புகளும்',
      author: 'முனைவர் இரா. இளங்கோவன்',
      role: 'மூத்த மொழி ஆய்வாளர்',
      desc: 'செயற்கை நுண்ணறிவு (AI) தளங்களில் தமிழ் பயன்பாட்டை விரிவுபடுத்துவதும், அடுத்த தலைமுறைக்கு தாய்மொழிக் கல்வியை எளிதாக்குவதும் காலத்தின் கட்டாயம்.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      time: 'நேற்று',
      category: 'ஆய்வுக் கட்டுரை'
    },
    {
      id: 'col_2',
      title: 'தமிழகத்தின் நதிநீர் மேலாண்மையும் எதிர்கால குடிநீர் பாதுகாப்பும்',
      author: 'சு. பழனிவேல்',
      role: 'சுற்றுச்சூழல் ஆலோசகர்',
      desc: 'பருவமழை மாறுபாடுகளை எதிர்கொள்ள ஏரிகள் தூர்வாருதல் மற்றும் நீர்நிலைகள் புனரமைப்பு திட்டங்கள் போர்க்கால அடிப்படையில் செயல்படுத்தப்பட வேண்டும்.',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
      time: '2 நாட்களுக்கு முன்',
      category: 'சுற்றுச்சூழல் பார்வை'
    },
    {
      id: 'col_3',
      title: 'உலகளாவிய பணவீக்க சவால்களும் நடுத்தர குடும்பங்களின் சேமிப்பும்',
      author: 'ஆனந்த் நடராஜன்',
      role: 'பொருளாதார ஆய்வாளர்',
      desc: 'தங்கத்தின் விலை உயர்வு மற்றும் பங்குச்சந்தை ஏற்ற இறக்கங்களுக்கு மத்தியில் சாமானிய மக்கள் தங்களின் சேமிப்பை எவ்வாறு திட்டமிட வேண்டும்?',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
      time: '3 நாட்களுக்கு முன்',
      category: 'பொருளாதார விவாதம்'
    }
  ];

  const displayColumns = columnistArticles.length > 0 ? columnistArticles : fallbackColumns;

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!readerFeedback.trim()) return;
    setFeedbackSubmitted(true);
    setReaderFeedback('');
    setTimeout(() => setFeedbackSubmitted(false), 5000);
  };

  return (
    <div className="space-y-8 max-w-[1380px] mx-auto py-2">
      {/* 1. EDITORIAL MASTHEAD */}
      <section className="bg-gradient-to-r from-slate-900 via-[#1A2642] to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none select-none text-[220px] font-black text-white">
          ✍️
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#DC2626] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                EDITORIAL DESK
              </span>
              <span className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                நடுநிலைமை • சமூகப் பார்வை • சிந்தனைக் களம்
              </span>
            </div>

            <h1 className="font-title font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight text-white">
              அமேஸ் டைம்ஸ் தலையங்கம் & சிறப்புக் கட்டுரைகள்
            </h1>

            <p className="text-slate-300 font-subtitle text-xs sm:text-sm max-w-2xl leading-relaxed">
              சமூக நிகழ்வுகளின் ஆழமான பகுப்பாய்வு, நடுநிலையான தலையங்கக் கட்டுரைகள் மற்றும் பல்வேறு துறைகளின் முன்னணி சிந்தனையாளர்களின் கருத்துக்களம்.
            </p>
          </div>

          {/* Thirukkural Thought of the Day */}
          <div className="lg:col-span-4 bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 space-y-2">
            <div className="flex items-center justify-between text-amber-300 text-xs font-bold font-subtitle">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                இன்றைய குறள் சிந்தனை
              </span>
              <span className="text-[10px] opacity-80">{dailyKural.number}</span>
            </div>
            <p className="font-serif-reading text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed italic border-l-2 border-amber-400 pl-3">
              "{dailyKural.kural}"
            </p>
            <p className="text-[11px] text-slate-300 pt-1 font-subtitle">
              <strong>விளக்கம்:</strong> {dailyKural.meaning}
            </p>
          </div>
        </div>
      </section>

      {/* 2. LEAD EDITORIAL BROADSHEET FOCUS */}
      <section className="bg-white dark:bg-[#0D1424] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#DC2626]"></span>
            <span className="font-subtitle font-black text-sm uppercase text-[#DC2626] dark:text-red-400 tracking-wider">
              முதன்மைத் தலையங்கம் (Lead Editorial)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSpeak && (
              <button
                onClick={() => onSpeak(`${leadEditorial.title}. ${leadEditorial.desc || ''}`)}
                className="flex items-center gap-1.5 text-xs font-subtitle font-bold text-brand-blue dark:text-amber-300 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 cursor-pointer transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>குரல் வழி கேட்க</span>
              </button>
            )}

            {onBookmark && (
              <button
                onClick={() => onBookmark(leadEditorial)}
                className="flex items-center gap-1.5 text-xs font-subtitle font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
              >
                {savedBookmarks.some(b => b.id === leadEditorial.id) ? (
                  <BookmarkCheck className="w-4 h-4 text-brand-red" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                <span>சேமி</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <h2
              onClick={() => onOpenArticle(leadEditorial)}
              className="font-title font-black text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight hover:text-[#DC2626] cursor-pointer transition-colors"
            >
              {leadEditorial.title}
            </h2>

            <div className="flex items-center gap-3 text-xs font-subtitle text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <UserCheck className="w-4 h-4 text-[#DC2626]" />
                {leadEditorial.author || 'க. சுப்பிரமணியன் (முதன்மை ஆசிரியர்)'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {leadEditorial.time || 'இன்று காலை 07:00 IST'}
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {leadEditorial.readTime || '6 நிமிட வாசிப்பு'}
              </span>
            </div>

            {/* Editorial Pull-Quote Block */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border-l-4 border-[#DC2626] text-slate-800 dark:text-slate-200 font-serif-reading text-base leading-relaxed italic">
              "{leadEditorial.desc || leadEditorial.content?.slice(0, 220)}..."
            </div>

            {/* Lead Article Excerpt */}
            <p className="font-serif-reading text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-4">
              {leadEditorial.content || leadEditorial.desc}
            </p>

            <button
              onClick={() => onOpenArticle(leadEditorial)}
              className="bg-[#DC2626] hover:bg-red-700 text-white font-subtitle font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-2"
            >
              <span>முழுத் தலையங்கத்தை வாசிக்க</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 group cursor-pointer" onClick={() => onOpenArticle(leadEditorial)}>
              <img
                src={leadEditorial.image || leadEditorial.cover_image_url || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'}
                alt={leadEditorial.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center font-subtitle">
              அமேஸ் டைம்ஸ் நடுநிலைப் பார்வை • ஆசிரியர் குழு
            </p>
          </div>
        </div>
      </section>

      {/* 3. COLUMNISTS & SPECIAL OP-ED ARTICLES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-2">
          <h3 className="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <span>சிறப்புக் கட்டுரையாளர்களின் பார்வைகள் (Op-Ed Columns)</span>
          </h3>
          <span className="text-xs text-slate-500 font-subtitle font-bold">வல்லுநர்கள் ஆய்வுக்களம்</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayColumns.map((col, idx) => (
            <article
              key={col.id || idx}
              className="bg-white dark:bg-[#0D1424] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative group"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-700 font-black shadow-inner flex-shrink-0">
                    {col.author?.charAt(0) || 'ஆ'}
                  </div>
                  <div>
                    <h4 className="font-subtitle font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                      {col.author || 'சிறப்புக் கட்டுரையாளர்'}
                    </h4>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                      {col.role || col.category || 'ஆய்வாளர்'}
                    </span>
                  </div>
                </div>

                <h3
                  onClick={() => onOpenArticle(col)}
                  className="font-title font-extrabold text-base text-slate-900 dark:text-white leading-snug hover:text-[#DC2626] cursor-pointer line-clamp-2"
                >
                  {col.title}
                </h3>

                <p className="font-serif-reading text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {col.desc || col.content}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-subtitle">
                <span className="text-slate-400 text-[11px]">{col.time || 'இன்று'}</span>
                <button
                  onClick={() => onOpenArticle(col)}
                  className="text-[#DC2626] dark:text-amber-400 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>வாசிக்க</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. LETTERS TO THE EDITOR & READER FEEDBACK */}
      <section className="bg-gradient-to-r from-slate-100 to-amber-50 dark:from-[#090F1E] dark:to-[#131B2E] rounded-3xl p-6 sm:p-8 border border-slate-300 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-6 h-6 text-[#DC2626]" />
          <h3 className="font-title font-extrabold text-lg text-slate-900 dark:text-white">
            ஆசிரியருக்கு கடிதம் & வாசகர் கருத்துக்களம் (Letters to Editor)
          </h3>
        </div>

        <p className="font-subtitle text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
          தலையங்கம் மற்றும் கட்டுரைகள் குறித்த உங்கள் கருத்துக்கள், நடுநிலையான விமர்சனங்களை ஆசிரியருக்கு அனுப்பலாம். தேர்ந்தெடுக்கப்பட்ட வாசகர் கடிதங்கள் தளத்தில் வெளியிடப்படும்.
        </p>

        {feedbackSubmitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-subtitle font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span>நன்றி! உங்கள் கருத்து ஆசிரியரின் பரிசீலனைக்கு வெற்றிகரமாக அனுப்பப்பட்டது.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-3">
            <textarea
              rows={3}
              value={readerFeedback}
              onChange={(e) => setReaderFeedback(e.target.value)}
              placeholder="தலையங்கம் குறித்த உங்கள் ஆரோக்கியமான கருத்துக்களை இங்கு பதிவு செய்யுங்கள்..."
              className="w-full bg-white dark:bg-[#0D1424] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-red/40"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-[#DC2626] text-white font-subtitle font-bold text-xs px-5 py-2 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>ஆசிரியருக்கு அனுப்புக</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
