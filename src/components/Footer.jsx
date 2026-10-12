import React, { useState } from 'react';

export default function Footer({ onSelectCategory, onOpenEPaper, onOpenBookmarks, onSpeak, onToast, onNavigate }) {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email && email.includes('@')) {
      onToast(`நன்றி! உங்கள் மின்னஞ்சல் (${email}) பதிவு செய்யப்பட்டது.`, 'verified');
      setEmail('');
    } else {
      onToast('தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.', 'error');
    }
  };

  return (
    <footer class="bg-[#050811] dark:bg-[#03050B] text-slate-300 text-xs border-t border-slate-800 mt-16 transition-all shadow-2xl">
      <div class="max-w-[1340px] mx-auto px-4 pt-10 pb-8 space-y-10">
        
        {/* Newsletter & Social Community Banner */}
        <div class="bg-gradient-to-r from-[#0C152B] via-[#142242] to-[#0A1124] border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-red via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-red/30 flex-shrink-0">
              <span class="material-symbols-outlined text-[26px]">mark_email_unread</span>
            </div>
            <div>
              <h3 class="font-subtitle font-bold text-base text-white flex items-center gap-2">
                <span>செய்திகளை உடனுக்குடன் பெற சந்தாதாரராகுங்கள்!</span>
                <span class="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">இலவசம்</span>
              </h3>
              <p class="font-body text-xs text-slate-400">தினசரி முக்கிய செய்திகள் நேரடியாக உங்கள் மின்னஞ்சல் அல்லது வாட்ஸ்அப் எண்ணிற்கு உடனுக்குடன் வந்து சேரும்.</p>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full lg:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="உங்கள் மின்னஞ்சல் முகவரி..."
              class="bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-red flex-1 lg:w-64"
            />
            <button
              onClick={handleSubscribe}
              class="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-subtitle font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>இணையுங்கள்</span>
              <span class="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </div>

        {/* 4-Column Footer Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="space-y-4">
            <div class="flex items-center gap-2.5">
              <img src="/Amaze times.jpg" alt="அமேஸ் டைம்ஸ்" class="h-10 w-auto object-contain rounded-lg shadow-sm"/>
              <div class="flex flex-col">
                <span class="font-title font-extrabold text-xl text-white tracking-tight">அமேஸ் டைம்ஸ்</span>
                <span class="font-subtitle text-[10px] text-amber-400 font-bold -mt-1">உண்மை உடனுக்குடன்</span>
              </div>
            </div>
            <p class="font-body text-slate-400 text-xs leading-relaxed">
              நம்பகமான, துல்லியமான மற்றும் நடுநிலையான செய்திகளை 24 மணி நேரமும் உடனுக்குடன் வழங்கும் முன்னணி தமிழ் டிஜிட்டல் நாளிதழ் தளம்.
            </p>
            
            <div class="space-y-2 font-subtitle">
              <span class="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">சமூக வலைத்தளங்கள்:</span>
              <div class="flex flex-wrap items-center gap-2">
                <a href="https://whatsapp.com" target="_blank" rel="noreferrer" class="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-all text-xs font-bold shadow-sm">
                  <span class="material-symbols-outlined text-[16px]">chat</span>
                  <span>வாட்ஸ்அப்</span>
                </a>
                <a href="https://telegram.org" target="_blank" rel="noreferrer" class="flex items-center gap-1.5 bg-sky-950/60 hover:bg-sky-600 text-sky-400 hover:text-white px-3 py-1.5 rounded-xl border border-sky-500/30 transition-all text-xs font-bold shadow-sm">
                  <span class="material-symbols-outlined text-[16px]">send</span>
                  <span>டெலிகிராம்</span>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" class="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-xl border border-red-500/30 transition-all text-xs font-bold shadow-sm">
                  <span class="material-symbols-outlined text-[16px]">smart_display</span>
                  <span>யூடியூப்</span>
                </a>
              </div>
            </div>
          </div>

          <div class="space-y-3 font-subtitle">
            <h4 class="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-brand-red">newspaper</span>
              <span>செய்திப் பிரிவுகள்</span>
            </h4>
            <ul class="space-y-2 text-slate-400">
              <li><button onClick={() => onSelectCategory('tamilnadu')} class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>தமிழ்நாடு செய்திகள்</button></li>
              <li><button onClick={() => onSelectCategory('districts')} class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>மாவட்டச் செய்திகள்</button></li>
              <li><button onClick={() => onSelectCategory('business')} class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>வணிகம் &amp; பங்குச்சந்தை</button></li>
              <li><button onClick={() => onSelectCategory('cinema')} class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>சினிமா &amp; பொழுதுபோக்கு</button></li>
              <li><button onClick={() => onSelectCategory('sports')} class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-[14px] text-slate-500">chevron_right</span>விளையாட்டு செய்திகள்</button></li>
            </ul>
          </div>

          <div class="space-y-3 font-subtitle">
            <h4 class="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-amber-400">auto_awesome</span>
              <span>சிறப்பு சேவைகள்</span>
            </h4>
            <ul class="space-y-2 text-slate-400">
              <li><button onClick={onOpenEPaper} class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-[14px] text-brand-red">newspaper</span>அமேஸ் இ-பேப்பர் (E-Paper)</button></li>
              <li><button onClick={() => onSpeak('அமேஸ் டைம்ஸ் குரல் செய்திகள் வசதி தயார் நிலையில் உள்ளது.')} class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-[14px] text-sky-400">volume_up</span>தமிழ் குரல் செய்திகள்</button></li>
              <li><button onClick={onOpenBookmarks} class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-[14px] text-emerald-400">bookmark</span>சேமித்த செய்திகள்</button></li>
            </ul>
          </div>

          <div class="space-y-3 font-body">
            <h4 class="font-subtitle font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-sky-400">contact_support</span>
              <span>தொடர்புக்கு &amp; உதவி</span>
            </h4>
            <div class="space-y-2 text-slate-400">
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-brand-red">mail</span>editor@amazetimes.com</p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-emerald-400">call</span>+91 44 2834 9000</p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-amber-400">location_on</span>சென்னை தலைமைச் செயலகம் அருகாமையில்</p>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-body">
          <div>
            © 2026 Amaze Times (அமேஸ் டைம்ஸ்). அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. •{' '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/login');
              }}
              class="text-slate-400 hover:text-amber-400 underline underline-offset-2 transition-colors cursor-pointer"
            >
              ஆசிரியர் &amp; நிருபர் உள்நுழைவு (Staff Login)
            </a>
          </div>
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} class="bg-slate-800 hover:bg-brand-red text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1 font-subtitle font-bold cursor-pointer">
            <span>மேலே செல்ல</span>
            <span class="material-symbols-outlined text-[14px]">arrow_upward</span>
          </button>
        </div>

      </div>
    </footer>
  );
}
