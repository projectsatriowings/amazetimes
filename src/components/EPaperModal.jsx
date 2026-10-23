import React, { useState, useEffect } from 'react';
import { Newspaper, X, Download, ZoomIn, ZoomOut, Calendar, ChevronLeft, ChevronRight, Lock, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function EPaperModal({ isOpen, onClose, onToast }) {
  if (!isOpen) return null;

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(1);
  const [totalPages] = useState(16);

  // Anti-Copy DRM Protection: Disable print shortcuts (Ctrl+P / Cmd+P) and context menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (onToast) onToast('டிஜிட்டல் உரிமப் பாதுகாப்பு (DRM): அச்சு எடுத்தல் மற்றும் நகலெடுத்தல் முடக்கப்பட்டுள்ளது.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToast]);

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.75));

  const handleDownload = () => {
    if (onToast) onToast('இ-பேப்பர் முழுமையான பதிப்பு (14 MB) பதிவிறக்கம் தொடங்குகிறது...');
    const link = document.createElement('a');
    link.href = '/Amaze times.jpg';
    link.download = `Amaze_Times_Epaper_${selectedDate}_Edition.jpg`;
    link.click();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div 
        className="bg-white dark:bg-[#0c1427] rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-tamil"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1945] via-[#0e2a7a] to-[#123896] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-lg">
              <Newspaper className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  அமேஸ் டைம்ஸ் - டிஜிட்டல் நாளிதழ் (E-Paper)
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-300" />
                  <span>DRM பாதுகாக்கப்பட்டது</span>
                </span>
              </div>
              <p className="text-xs text-amber-200">
                சென்னை & தமிழ்நாடு முழுமையான அச்சு நாளிதழ் வடிவம்
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
            title="மூடுக"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Date Picker, Zoom & Pagination */}
        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <label className="font-bold text-slate-700 dark:text-slate-300">பதிப்புத் தேதி:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (onToast) onToast(`${e.target.value} பதிப்பு ஏற்றப்படுகிறது...`);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-amber-500 text-slate-600 dark:text-slate-300 cursor-pointer"
              title="சிறிதாக்கு (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-[11px] px-1 text-slate-700 dark:text-slate-200">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-amber-500 text-slate-600 dark:text-slate-300 cursor-pointer"
              title="பெரிதாக்கு (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Page Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-black text-xs text-slate-800 dark:text-slate-200">
              பக்கம் <span className="text-red-600 dark:text-amber-400">{currentPage}</span> / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF பதிவிறக்கம் (14 MB)</span>
          </button>

        </div>

        {/* Newspaper Page Canvas Viewer (Zoomable with DRM Protection) */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-200 dark:bg-slate-950 flex justify-center items-start">
          <div 
            className="transition-transform duration-200 origin-top shadow-2xl rounded-2xl overflow-hidden bg-white max-w-3xl w-full border border-slate-300"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {/* Authentic Newspaper Replica Canvas */}
            <div className="p-6 space-y-4 text-slate-900 bg-white">
              
              {/* Masthead */}
              <div className="bg-red-600 p-4 rounded-xl text-center space-y-2 border-2 border-slate-900 shadow-md">
                <h1 className="text-4xl sm:text-5xl text-white tracking-wide font-black">
                  அமேஸ் டைம்ஸ்
                </h1>
                <div className="flex flex-wrap items-center justify-between gap-2 text-white text-xs sm:text-sm font-bold border-t border-white/30 pt-2 px-2">
                  <span>PRGI NO. TNBIL/2023/88659</span>
                  <span>நாள்: {selectedDate}</span>
                  <span>பக்கம் {currentPage}</span>
                  <span>விலை ₹5.00</span>
                </div>
              </div>

              {/* Lead Article in Newspaper */}
              <div className="border-2 border-slate-900 rounded-xl p-4 space-y-3 bg-slate-50">
                <div className="w-full h-56 sm:h-72 overflow-hidden rounded-lg border border-slate-900 shadow-inner">
                  <img src="/Amaze times.jpg" alt="Amaze Times Epaper" className="w-full h-full object-cover" />
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  தமிழகத்தில் மேலும் ₹75,000 கோடி புதிய தொழில் முதலீடுகளுக்கு அமைச்சரவை ஒப்புதல்!
                </h2>

                <p className="text-slate-800 text-sm leading-relaxed font-semibold text-justify">
                  மாநிலத்தில் இளைஞர்களுக்கு புதிய வேலைவாய்ப்புகளை உருவாக்கும் வகையில் பல சர்வதேச நிறுவனங்களுடன் புரிந்துணர்வு ஒப்பந்தங்கள் கையெழுத்தாகியுள்ளன. சென்னை, மதுரை, கோயம்புத்தூர் மற்றும் ஓசூரில் புதிய உற்பத்தி மையங்கள் அமையவுள்ளன.
                </p>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-t border-slate-300 pt-2">
                  <span>செய்தியாளர்: தலைமைச் செய்தியாளர் பிரிவு</span>
                  <span className="text-red-600 font-black">அமேஸ் டைம்ஸ் நாளிதழ்</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Page Thumbnail Carousel Footer */}
        <div className="bg-white dark:bg-[#0c1427] border-t border-slate-200 dark:border-slate-800 p-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                  currentPage === pageNum 
                    ? 'border-red-600 ring-2 ring-red-400 shadow-md bg-red-50 dark:bg-red-950/40' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">
                  {pageNum}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
