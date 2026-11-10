import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BookOpen, Newspaper, Calendar, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Scissors, 
  Layers, Sun, Moon, Coffee, X, Lock, CheckCircle, Shield,
  Home, CornerDownLeft, Sparkles, RefreshCw
} from 'lucide-react';

import AmazeTimesFlipbook from './AmazeTimesFlipbook';
import AmazeTimesThumbnailDrawer from './AmazeTimesThumbnailDrawer';
import AmazeTimesArticleClipper from './AmazeTimesArticleClipper';
import { exportPublicationToPdf, captureSinglePageSnapshot } from '../../utils/pdfExporter';

export default function AmazeTimesViewerModal({
  isOpen,
  onClose,
  initialPublication = 'enewspaper', // 'magazine' | 'enewspaper'
  readerUser = null,
  onOpenAuth,
  onToast
}) {
  if (!isOpen) return null;

  // Active Publication Type: 'magazine' or 'enewspaper'
  const [publicationType, setPublicationType] = useState(initialPublication || 'enewspaper');

  // Publication Data
  const [publication, setPublication] = useState(null);
  const [pages, setPages] = useState([]);
  const [availableEditions, setAvailableEditions] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Magazine selectors
  const [selectedMagYear, setSelectedMagYear] = useState('2026');
  const [selectedMagMonth, setSelectedMagMonth] = useState('11');

  // Newspaper selectors (IST Today Default)
  const [selectedNewspaperDate, setSelectedNewspaperDate] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  const [selectedNewspaperEdition, setSelectedNewspaperEdition] = useState('main');
  const [pdfProgress, setPdfProgress] = useState(null);
  const [isCapturingClip, setIsCapturingClip] = useState(false);

  // Flipbook state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputVal, setPageInputVal] = useState('1');
  const [isDualPageMode, setIsDualPageMode] = useState(() => window.innerWidth >= 768);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [readingMode, setReadingMode] = useState('light'); // 'light', 'dark', 'sepia'

  // Modals & Drawers
  const [isThumbnailDrawerOpen, setIsThumbnailDrawerOpen] = useState(false);
  const [isClipperOpen, setIsClipperOpen] = useState(false);
  const [clipperTargetPage, setClipperTargetPage] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const containerRef = useRef(null);

  // Sync initialPublication prop
  useEffect(() => {
    if (initialPublication) {
      setPublicationType(initialPublication);
    }
  }, [initialPublication]);

  // Load publication data from API
  const fetchPublication = useCallback(async () => {
    setIsLoading(true);
    try {
      if (publicationType === 'magazine') {
        const url = `/api/amazetimes/magazine?year=${selectedMagYear}&month=${selectedMagMonth}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setPublication(data.publication);
          setPages(data.pages || []);
          setAvailableEditions(data.availableEditions || []);
        }
      } else {
        const url = `/api/amazetimes/enewspaper?date=${selectedNewspaperDate}&edition=${selectedNewspaperEdition}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setPublication(data.publication);
          setPages(data.pages || []);
          setAvailableDates(data.availableDates || []);
          setAvailableEditions(data.availableEditions || []);
        }
      }
    } catch (err) {
      console.error('Fetch publication error:', err);
      if (onToast) onToast('பதிப்பு விவரங்களை ஏற்றுவதில் பிழை', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [publicationType, selectedMagYear, selectedMagMonth, selectedNewspaperDate, selectedNewspaperEdition, onToast]);

  useEffect(() => {
    fetchPublication();
    setCurrentPage(1);
    setPageInputVal('1');
    setZoomScale(1.0);
  }, [fetchPublication]);

  // Keep page input in sync with currentPage
  useEffect(() => {
    setPageInputVal(String(currentPage));
  }, [currentPage]);

  // Anti-Screen Capture & Privacy Focus Detection
  useEffect(() => {
    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Keyboard Navigation & DRM Shortcut Interception
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Intercept Print & Save Shortcuts (DRM)
      if (e.key === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        if (onToast) onToast('டிஜிட்டல் பதிப்புரிமைப் பாதுகாப்பு (DRM): அச்சு எடுத்தல் மற்றும் சேமித்தல் முடக்கப்பட்டுள்ளது.');
        return;
      }

      // If user is typing in page jumper input, don't trigger hotkeys
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentPage(pages.length || 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, isDualPageMode, isFullscreen, onClose, onToast]);

  // Page Jump Handlers
  const totalPages = pages.length || (publicationType === 'magazine' ? 32 : 16);

  const handleNextPage = () => {
    const step = isDualPageMode && currentPage > 1 ? 2 : (currentPage === 1 ? 1 : 1);
    setCurrentPage(prev => Math.min(totalPages, prev + step));
  };

  const handlePrevPage = () => {
    const step = isDualPageMode && currentPage > 2 ? 2 : 1;
    setCurrentPage(prev => Math.max(1, prev - step));
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const target = parseInt(pageInputVal, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target);
    } else {
      setPageInputVal(String(currentPage));
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Exit fullscreen error:', err);
      });
      setIsFullscreen(false);
    }
  };

  // Open Article Clipper (Captures crisp live structured page snapshot)
  const handleOpenClipper = async (pageObj) => {
    const activeObj = pageObj || pages.find(p => p.pageNumber === currentPage) || pages[0] || {
      pageNumber: currentPage,
      imageUrl: publication?.cover_image_url || '/Amaze times.jpg'
    };

    try {
      setIsCapturingClip(true);
      const editionLabel = publication?.edition || publication?.edition_name || '';
      const snapshotDataUrl = await captureSinglePageSnapshot({
        page: activeObj,
        publicationType,
        editionName: editionLabel
      });
      setClipperTargetPage({ ...activeObj, imageUrl: snapshotDataUrl });
      setIsClipperOpen(true);
    } catch (err) {
      console.warn('Snapshot fallback:', err);
      setClipperTargetPage(activeObj);
      setIsClipperOpen(true);
    } finally {
      setIsCapturingClip(false);
    }
  };

  // Download Real Multi-Page PDF Edition (VIP Login check)
  const handleDownloadFullEdition = async () => {
    if (!readerUser) {
      if (onToast) onToast('மின்-இதழ் / நாளிதழை முழு PDF ஆக பதிவிறக்க வாசகராக உள்நுழையவும்!', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (pdfProgress) return; // already exporting

    const editionLabel = publication?.edition || publication?.edition_name || '';
    const dateFormatted = publication?.edition_date_display || selectedNewspaperDate;
    const fileName = publicationType === 'magazine'
      ? `Amaze_Times_Magazine_${selectedMagYear}_${selectedMagMonth}.pdf`
      : `Amaze_Times_EPaper_${dateFormatted}_${selectedNewspaperEdition}.pdf`;

    try {
      if (onToast) onToast('உயர்-தெளிவு PDF கோப்பு உருவாக்கப்படுகிறது... காத்திருக்கவும்.');
      await exportPublicationToPdf({
        pages,
        publicationType,
        editionName: editionLabel,
        fileName,
        onProgress: (curr, tot) => setPdfProgress({ current: curr, total: tot })
      });
      if (onToast) onToast('PDF கோப்பு வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!', 'success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      if (onToast) onToast('PDF உருவாக்குவதில் பிழை: ' + err.message, 'error');
    } finally {
      setPdfProgress(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none font-tamil overflow-hidden animate-fadeIn"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ========================================================
          1. TOP BRAND HEADER & PUBLICATION SWITCHER
      ======================================================== */}
      <header className="bg-gradient-to-r from-[#071330] via-[#0b1d4d] to-[#122e70] border-b border-amber-500/20 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-shrink-0 shadow-xl z-20">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-300 p-0.5 shadow-lg flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-serif font-black text-amber-400 text-lg">அ</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base lg:text-lg text-white tracking-wide">
                அமேஸ் டைம்ஸ் (Amaze Times)
              </h1>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                டிஜிட்டல் வாசகர் களம்
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              தமிழ்நாட்டின் முன்னணி நம்பகமான டிஜிட்டல் நாளிதழ் & மாதாந்திர இதழ்
            </p>
          </div>
        </div>

        {/* Brand Publication Switcher Tabs (Seamless Segmented Switcher) */}
        <div className="bg-slate-900/90 p-1 rounded-2xl border border-white/10 flex items-center shadow-inner">
          <button
            onClick={() => {
              setPublicationType('magazine');
              setCurrentPage(1);
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              publicationType === 'magazine'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>மாதாந்திர இதழ் (Magazine)</span>
          </button>

          <button
            onClick={() => {
              setPublicationType('enewspaper');
              setCurrentPage(1);
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              publicationType === 'enewspaper'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>தினசரி மின்-நாளிதழ் (E-Paper)</span>
          </button>
        </div>

        {/* Top Right Actions: Close, DRM Status, VIP */}
        <div className="flex items-center gap-2">
          {readerUser ? (
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{readerUser.name || 'VIP வாசகர்'}</span>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden md:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-xl text-xs transition shadow cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-950" />
              <span>வாசகர் உள்நுழைவு</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
            title="வெளியேறு (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. SECONDARY CONTROLS BAR: ARCHIVE / EDITION PICKER
      ======================================================== */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0 z-10 backdrop-blur-md">
        
        {/* Edition Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          {publicationType === 'magazine' ? (
            /* Magazine Year / Month Pickers */
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>இதழ் தேர்வு:</span>
              </span>

              <select
                value={`${selectedMagYear}-${selectedMagMonth}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-');
                  setSelectedMagYear(y);
                  setSelectedMagMonth(m);
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {availableEditions.map(ed => (
                  <option key={ed.id} value={`${ed.year}-${String(ed.month).padStart(2, '0')}`}>
                    {ed.title || ed.edition}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* E-Newspaper Date & Edition Pickers */
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-400">தேதி:</span>
                <input
                  type="date"
                  value={selectedNewspaperDate}
                  onChange={(e) => setSelectedNewspaperDate(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-300">மண்டலப் பதிப்பு:</span>
                <select
                  value={selectedNewspaperEdition}
                  onChange={(e) => setSelectedNewspaperEdition(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="main">தமிழ்நாடு முதன்மைப் பதிப்பு</option>
                  <option value="city">சென்னை பெருநகரப் பதிப்பு</option>
                  <option value="special">வாராந்திர சிறப்பு மலர்</option>
                </select>
              </div>
            </div>
          )}

          {/* Publication Metadata Badge */}
          {publication && (
            <div className="hidden lg:flex items-center gap-2 text-slate-400 border-l border-slate-700 pl-3">
              <span>பக்கங்கள்: <b className="text-amber-300">{totalPages}</b></span>
              <span>•</span>
              {publicationType === 'enewspaper' ? (
                <span className="text-emerald-400 font-bold">
                  செய்திகள் நாள்: {publication.source_news_date_display} ({publication.total_articles || 0} செய்திகள்)
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">
                  தொகுப்பு: {publication.sourceMonthLabel || publication.edition} ({publication.totalArticlesIncluded || 0} படைப்புகள்)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Tools: Dual/Single Spread Toggle & Reading Mode */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Dual / Single Spread Toggle (Desktop) */}
          <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setIsDualPageMode(true)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                isDualPageMode ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="இரட்டைப் பக்கம் (Dual Spread)"
            >
              இரட்டைப் பக்கம்
            </button>
            <button
              onClick={() => setIsDualPageMode(false)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                !isDualPageMode ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="ஒற்றைப் பக்கம் (Single Page)"
            >
              ஒற்றைப் பக்கம்
            </button>
          </div>

          {/* Reading Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setReadingMode('light')}
              className={`p-1 rounded transition ${readingMode === 'light' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="இயல்பான நிறம் (Light)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReadingMode('dark')}
              className={`p-1 rounded transition ${readingMode === 'dark' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="இரவுப் பார்வை (Dark)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReadingMode('sepia')}
              className={`p-1 rounded transition ${readingMode === 'sepia' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="பாரம்பரிய நாளிதழ் நிறம் (Sepia)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Crop Article Button in Header */}
          <button
            onClick={() => handleOpenClipper()}
            disabled={isCapturingClip}
            className="bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-60"
            title="செய்திக் கத்தரிப்பு (Article Clipper)"
          >
            <Scissors className={`w-3.5 h-3.5 ${isCapturingClip ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isCapturingClip ? 'தயாராகிறது...' : 'கத்தரித்து பகிர்க'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          3. MAIN INTERACTIVE FLIPBOOK READING ENGINE
      ======================================================== */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-slate-950">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400 animate-pulse">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="text-sm font-bold text-amber-300">
              {publicationType === 'magazine' ? 'அமேஸ் டைம்ஸ் மாதாந்திர இதழ்' : 'அமேஸ் டைம்ஸ் நாளிதழ்'} பக்கங்கள் ஏற்றப்படுகின்றன...
            </span>
          </div>
        ) : (
          <AmazeTimesFlipbook
            pages={pages}
            currentPage={currentPage}
            totalPages={totalPages}
            isDualPageMode={isDualPageMode}
            zoomScale={zoomScale}
            setZoomScale={setZoomScale}
            readingMode={readingMode}
            publicationType={publicationType}
            editionName={publication?.edition || publication?.edition_name || ''}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            onOpenClipper={(pageObj) => handleOpenClipper(pageObj)}
            readerUser={readerUser}
            isWindowBlurred={isWindowBlurred}
          />
        )}
      </main>

      {/* ========================================================
          4. BOTTOM FILMSTRIP THUMBNAIL DRAWER
      ======================================================== */}
      <AmazeTimesThumbnailDrawer
        isOpen={isThumbnailDrawerOpen}
        onToggle={() => setIsThumbnailDrawerOpen(prev => !prev)}
        pages={pages}
        currentPage={currentPage}
        isDualPageMode={isDualPageMode}
        onSelectPage={(pageNum) => {
          setCurrentPage(pageNum);
          setIsThumbnailDrawerOpen(false);
        }}
        publicationType={publicationType}
        editionName={publication?.edition || publication?.edition_name || ''}
      />

      {/* ========================================================
          5. BOTTOM MASTER NAVIGATION & TOOLBAR
      ======================================================== */}
      <footer className="bg-slate-900 border-t border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0 z-20 shadow-2xl">
        
        {/* Left: Previous / Next & Page Jumper */}
        <div className="flex items-center gap-2">
          {/* Cover Jump */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="முதல் பக்கம் (Cover)"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">முந்தைய பக்கம்</span>
          </button>

          {/* Page Jumper Form */}
          <form onSubmit={handleGoToPage} className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-medium">பக்கம்</span>
            <input
              type="text"
              value={pageInputVal}
              onChange={(e) => setPageInputVal(e.target.value)}
              className="w-10 bg-slate-800 text-amber-300 font-mono font-bold text-center rounded px-1 py-0.5 border border-slate-600 focus:outline-none focus:border-amber-400"
            />
            <span className="text-slate-400 font-medium">/ {totalPages}</span>
            <button type="submit" className="text-slate-400 hover:text-amber-400 ml-1" title="செல்க">
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
          >
            <span className="hidden sm:inline">அடுத்த பக்கம்</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setZoomScale(prev => Math.max(0.75, prev - 0.25))}
            className="p-1 hover:text-amber-400 text-slate-300 transition"
            title="சிறிதாக்கு (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono font-bold text-[11px] px-1.5 text-amber-300 min-w-[42px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>

          <button
            onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))}
            className="p-1 hover:text-amber-400 text-slate-300 transition"
            title="பெரிதாக்கு (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setZoomScale(1.0)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition"
            title="இயல்பு அளவு (Fit to Screen)"
          >
            பொருத்து
          </button>

          <button
            onClick={() => setZoomScale(1.4)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition hidden sm:inline"
            title="அகலத்திற்குப் பொருத்து (Fit to Width)"
          >
            அகலம்
          </button>
        </div>

        {/* Right: PDF Download, Thumbnails Toggle, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Thumbnails strip button */}
          <button
            onClick={() => setIsThumbnailDrawerOpen(prev => !prev)}
            className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
              isThumbnailDrawerOpen 
                ? 'bg-amber-500 text-slate-950 border-amber-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="அனைத்துப் பக்கங்களின் முன்னோட்டம்"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">பக்கங்கள்</span>
          </button>

          {/* Download Full Edition */}
          <button
            onClick={handleDownloadFullEdition}
            disabled={Boolean(pdfProgress)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
            title="முழுமையான இதழ் பதிவிறக்கம் (PDF)"
          >
            <Download className={`w-4 h-4 ${pdfProgress ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">
              {pdfProgress
                ? `PDF தயாராகிறது (${pdfProgress.current}/${pdfProgress.total})...`
                : 'PDF பதிவிறக்கம்'}
            </span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            title="முழுத்திரை (Fullscreen - F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </footer>

      {/* ========================================================
          6. ARTICLE CLIPPER & SHARE MODAL OVERLAY
      ======================================================== */}
      {isClipperOpen && clipperTargetPage && (
        <AmazeTimesArticleClipper
          isOpen={isClipperOpen}
          onClose={() => setIsClipperOpen(false)}
          pageImage={clipperTargetPage.imageUrl || clipperTargetPage.thumbnail || publication?.cover_image_url || '/Amaze times.jpg'}
          pageNumber={clipperTargetPage.pageNumber || currentPage}
          pageTitle={clipperTargetPage.title}
          pageSection={clipperTargetPage.section}
          publicationTitle={publication?.title || 'அமேஸ் டைம்ஸ்'}
          editionName={publication?.edition || publication?.edition_name || 'முதன்மைப் பதிப்பு'}
          issueDate={publication?.publishedDate || selectedNewspaperDate}
          onToast={onToast}
        />
      )}
    </div>
  );
}

