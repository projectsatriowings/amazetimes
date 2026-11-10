import React, { useState, useEffect } from 'react';
import { BookOpen, Download } from 'lucide-react';
import { exportPublicationToPdf } from '../utils/pdfExporter';
import AmazeTimesPageRenderer from './amazetimes/AmazeTimesPageRenderer';

export default function MagazineShowcase({ onOpenEPaper, onOpenMagazine, onToast, readerUser = null, onOpenAuth }) {
  const [latestMag, setLatestMag] = useState(null);
  const [pdfProgress, setPdfProgress] = useState(null);

  useEffect(() => {
    fetch('/api/amazetimes/magazine')
      .then(r => r.json())
      .then(d => {
        if (d && d.success && d.publication) {
          setLatestMag(d);
        }
      })
      .catch(() => {});
  }, []);

  const coverPage = latestMag?.pages?.[0] || {
    pageNumber: 1,
    template: 'magazine-front-cover',
    monthYearLabel: 'நவம்பர்-2026',
    monthTamil: 'நவம்பர்',
    monthEng: 'November',
    year: '2026',
    volumeNo: '05',
    issueNo: '11',
    priceLabel: 'ரூ. 22/-',
    coverHeadline: 'தமிழகத்தின் வளர்ச்சித் திட்டங்கள் & மக்கள் பார்வை!',
    coverCategory: 'மாதத்தின் சிறப்புப் பார்வை',
    coverImage: '/Amaze times.jpg'
  };

  const editionTitle = latestMag?.publication?.title || 'நவம்பர் 2026 மாதாந்திர சிறப்பிதழ்';
  const editionDesc = latestMag?.publication?.description || 'தமிழ்நாட்டின் வளர்ச்சித் திட்டங்கள், அரசியல், வணிகம், கல்வி, விளையாட்டு மற்றும் சிறப்புப் பார்வைகள் அடங்கிய டிஜிட்டல் மாத இதழை உங்கள் மொபைல் மற்றும் கணினியில் வாசியுங்கள்.';

  const handleDownloadRealPdf = async () => {
    if (!readerUser) {
      if (onToast) onToast('மாத இதழ் PDF பதிவிறக்கம் செய்ய வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (pdfProgress) return;

    try {
      if (onToast) onToast('மாத இதழ் PDF உருவாக்கப்படுகிறது... காத்திருக்கவும்.');
      let magData = latestMag;
      if (!magData?.pages?.length) {
        const res = await fetch('/api/amazetimes/magazine');
        magData = await res.json();
      }
      if (!magData?.pages?.length) {
        if (onToast) onToast('இதழ் பக்கங்கள் கிடைக்கவில்லை', 'error');
        return;
      }

      const yr = magData.publication?.year || '2026';
      const mo = magData.publication?.month || '11';
      await exportPublicationToPdf({
        pages: magData.pages,
        publicationType: 'magazine',
        editionName: magData.publication?.edition || '',
        fileName: `Amaze_Times_Magazine_${yr}_${mo}.pdf`,
        onProgress: (curr, tot) => setPdfProgress({ current: curr, total: tot })
      });
      if (onToast) onToast('மாத இதழ் PDF வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!', 'success');
    } catch (err) {
      console.error('Magazine showcase PDF export error:', err);
      if (onToast) onToast('PDF உருவாக்குவதில் பிழை: ' + err.message, 'error');
    } finally {
      setPdfProgress(null);
    }
  };

  return (
    <section className="bg-gradient-to-r from-[#0a1945] via-[#0e2a7a] to-[#0a1945] rounded-3xl p-4 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-400/20 w-full max-w-full">
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
        
        {/* Left: Live Magazine Cover Render matching Official Format */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative group cursor-pointer" onClick={() => {
            if (!readerUser) {
              if (onToast) onToast('அமேஸ் டைம்ஸ் மாத இதழை வாசிக்க வாசகராக உள்நுழையவும்!', 'info');
              if (onOpenAuth) onOpenAuth();
              return;
            }
            if (onOpenMagazine) onOpenMagazine();
            else if (onOpenEPaper) onOpenEPaper();
          }}>
            <div className="w-[214px] h-[303px] bg-white rounded-xl shadow-2xl overflow-hidden ring-4 ring-amber-400/50 transform group-hover:-translate-y-2 transition-transform duration-300 relative pointer-events-none">
              <div style={{ width: '794px', height: '1123px', transform: 'scale(0.27)', transformOrigin: 'top left' }}>
                <AmazeTimesPageRenderer page={coverPage} publicationType="magazine" />
              </div>
            </div>

            {/* Floating Badge */}
            <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white">
              {readerUser ? 'வாசகர் பதிப்பு!' : '🔒 வாசகர் வட்டம் மட்டும்'}
            </span>
          </div>
        </div>

        {/* Right: Editorial Information & Actions */}
        <div className="md:col-span-8 space-y-4 text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">அமேஸ் டைம்ஸ் பிரத்யேக மின்-இதழ்</span>
            </div>

            <h2 className="font-title font-black text-xl sm:text-3xl text-white leading-tight">
              {editionTitle} இப்போது வாசிக்கக் கிடைக்கிறது!
            </h2>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              {editionDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-200 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-base">✓</span>
              <span>அனைத்துப் பிரிவுச் செய்திகள்</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-base">✓</span>
              <span>உடனடி PDF பதிவிறக்கம்</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-base">✓</span>
              <span>மொபைல் வாசிப்பு வசதி</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => {
                if (!readerUser) {
                  if (onToast) onToast('அமேஸ் டைம்ஸ் மாத இதழை வாசிக்க வாசகராக உள்நுழையவும்!', 'info');
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                if (onOpenMagazine) onOpenMagazine();
                else if (onOpenEPaper) onOpenEPaper();
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span>{readerUser ? 'மின்-இதழை வாசிக்க (Read Now)' : '🔒 வாசிக்க உள்நுழையவும்'}</span>
            </button>

            <button
              onClick={handleDownloadRealPdf}
              disabled={Boolean(pdfProgress)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Download className={`w-4 h-4 ${pdfProgress ? 'animate-bounce' : ''}`} />
              <span>
                {pdfProgress
                  ? `PDF தயாராகிறது (${pdfProgress.current}/${pdfProgress.total})...`
                  : (readerUser ? 'பதிவிறக்கம் (PDF)' : '🔒 PDF பெற உள்நுழைக')}
              </span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
