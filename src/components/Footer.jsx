import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, ArrowUp, FileText, Sparkles, ShieldCheck, Newspaper, MessageSquare, Video } from 'lucide-react';

export default function Footer({ onSelectCategory, onOpenEPaper, onOpenBookmarks, onSpeak, onToast, onNavigate }) {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email && email.includes('@')) {
      onToast(`நன்றி! உங்கள் மின்னஞ்சல் (${email}) வெற்றிகரமாகப் பதிவு செய்யப்பட்டது.`, 'check');
      setEmail('');
    } else {
      onToast('தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.', 'error');
    }
  };

  return (
    <footer className="bg-[#070d1e] text-slate-300 text-xs border-t border-slate-800 mt-12 sm:mt-16 transition-all shadow-2xl w-full max-w-full overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 pt-8 sm:pt-10 pb-24 sm:pb-8 space-y-8 sm:space-y-10 w-full min-w-0">
        
        {/* Newsletter & WhatsApp Community Subscription Ribbon */}
        <div className="bg-gradient-to-r from-[#0a1945] via-[#0e2a7a] to-[#0a1945] border border-amber-400/20 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 overflow-hidden">
          <div className="flex items-start sm:items-center gap-4 w-full min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
              <Newspaper className="w-6 h-6 text-slate-950" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="font-title font-black text-base sm:text-lg text-white flex flex-wrap items-center gap-2">
                <span>செய்திகளை உடனுக்குடன் பெற சந்தாதாரராகுங்கள்!</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  இலவசம்
                </span>
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                தமிழ்நாடு, வணிகம், தங்கம் விலை மற்றும் முக்கிய நிகழ்வுகள் உங்கள் மின்னஞ்சலுக்கு உடனுக்குடன் அனுப்பப்படும்.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="உங்கள் மின்னஞ்சல் முகவரி..."
              className="w-full sm:flex-1 lg:w-64 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleSubscribe}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>இணையுங்கள்</span>
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* 4-Column Editorial Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Registration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-2xl shadow-md border border-slate-700 flex items-center justify-center">
                <img src="/Amaze times.jpg" alt="அமேஸ் டைம்ஸ்" className="h-10 w-auto object-contain rounded-xl" />
              </div>
              <div className="flex flex-col">
                <span className="font-title font-black text-xl text-white">அமேஸ் டைம்ஸ்</span>
                <span className="text-[10px] text-amber-400 font-bold">உண்மையின் தீரக் குரல்</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              நம்பகமான, துல்லியமான மற்றும் நடுநிலையான செய்திகளை 24 மணி நேரமும் உடனுக்குடன் வழங்கும் முன்னணி தமிழ் டிஜிட்டல் நாளிதழ் தளம்.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>மத்திய அரசு பத்திரிகைப் பதிவு:</span>
              </p>
              <p className="font-mono text-slate-200">PRGI TNBIL/2023/88656</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all border border-emerald-500/30" title="WhatsApp">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="https://telegram.org" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-sky-950/80 text-sky-400 hover:bg-sky-600 hover:text-white flex items-center justify-center transition-all border border-sky-500/30" title="Telegram">
                <Send className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all border border-red-500/30" title="YouTube">
                <Video className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Major News Sections */}
          <div className="space-y-3">
            <h4 className="font-title font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-red-500" />
              <span>செய்திப் பிரிவுகள்</span>
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><button onClick={() => onSelectCategory('tamilnadu')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› தமிழ்நாடு செய்திகள்</button></li>
              <li><button onClick={() => onSelectCategory('districts')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› மாவட்டச் செய்திகள் (Districts)</button></li>
              <li><button onClick={() => onSelectCategory('business')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› வணிகம் & பங்குச்சந்தை</button></li>
              <li><button onClick={() => onSelectCategory('spiritual')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› ஆன்மிகம் & திருத்தலங்கள்</button></li>
              <li><button onClick={() => onSelectCategory('cinema')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› சினிமா & கலை உலகம்</button></li>
              <li><button onClick={() => onSelectCategory('sports')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› விளையாட்டு & ஐபிஎல்</button></li>
            </ul>
          </div>

          {/* Col 3: Special Services */}
          <div className="space-y-3">
            <h4 className="font-title font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>சிறப்பு சேவைகள்</span>
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><button onClick={onOpenEPaper} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› அமேஸ் இ-பேப்பர் (E-Paper)</button></li>
              <li><button onClick={() => onSelectCategory('magazine')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› மாதாந்திர டிஜிட்டல் இதழ்</button></li>
              <li><button onClick={() => onSpeak('அமேஸ் டைம்ஸ் குரல் செய்திகள் இயக்கப்படுகின்றன.')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› AI செய்தி வாசிப்பாளர் (Audio)</button></li>
              <li><button onClick={onOpenBookmarks} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› சேமித்த செய்திகள் (Bookmarks)</button></li>
              <li><button onClick={() => onSelectCategory('editorial')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer">› தலையங்கம் & பார்வை (Editorial)</button></li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-3">
            <h4 className="font-title font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>தலையங்க அலுவலகம்</span>
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>editor@amazetimes.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+91 44 2834 9000</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>தலைமை அலுவலகம், சென்னை, தமிழ்நாடு</span>
              </p>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Amaze Times (அமேஸ் டைம்ஸ்). அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. •{' '}
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/admin');
              }}
              className="text-slate-400 hover:text-amber-400 underline underline-offset-2 transition-colors cursor-pointer font-bold"
            >
              பணியாளர் & நிருபர் உள்நுழைவு (Admin / Reporter Portal)
            </a>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-slate-800 hover:bg-[#0e2a7a] text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <span>மேலே செல்ல</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
