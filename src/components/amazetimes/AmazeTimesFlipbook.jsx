import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Scissors, ShieldAlert, Sparkles, Newspaper, BookOpen, Calendar, ShieldCheck, RotateCcw
} from 'lucide-react';
import AmazeTimesPageRenderer from './AmazeTimesPageRenderer';

function getSpreadForPage(pages, pageNum, totalPages, isDualPageMode) {
  if (!pages || pages.length === 0) {
    return { leftPage: null, rightPage: null, showingSpread: false, isCover: false, isBackCover: false };
  }
  const safeNum = Math.max(1, Math.min(totalPages, pageNum));
  if (isDualPageMode) {
    if (safeNum === 1) {
      const cover = pages.find(p => p.pageNumber === 1) || pages[0];
      return { leftPage: null, rightPage: cover, showingSpread: false, isCover: true, isBackCover: false };
    }
    const leftNum = safeNum % 2 === 0 ? safeNum : safeNum - 1;
    const rightNum = leftNum + 1;
    const leftPage = pages.find(p => p.pageNumber === leftNum) || pages[leftNum - 1] || null;
    const rightPage = rightNum <= totalPages
      ? (pages.find(p => p.pageNumber === rightNum) || pages[rightNum - 1] || null)
      : null;
    return {
      leftPage,
      rightPage,
      showingSpread: Boolean(leftPage && rightPage),
      isCover: false,
      isBackCover: Boolean(leftPage && !rightPage)
    };
  }
  const single = pages.find(p => p.pageNumber === safeNum) || pages[safeNum - 1] || null;
  return { leftPage: null, rightPage: single, showingSpread: false, isCover: safeNum === 1, isBackCover: safeNum === totalPages };
}

export default function AmazeTimesFlipbook({
  pages = [],
  currentPage = 1,
  totalPages = 16,
  isDualPageMode = true,
  isFullscreen = false,
  zoomScale = 1.0,
  setZoomScale,
  readingMode = 'light', // 'light' | 'dark' | 'sepia'
  publicationType = 'enewspaper',
  editionName = '',
  onPageChange,
  onOpenClipper,
  readerUser = null,
  isWindowBlurred = false
}) {
  const containerRef = useRef(null);
  const flipTimerRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 1024, height: 700 });

  // Pan / Drag State for zoomed reading
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Touch Swipe State
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });

  // 3D Page-Turn Animation State
  const [displayedPage, setDisplayedPage] = useState(currentPage);
  const [flipState, setFlipState] = useState(null);
  // flipState: { direction: 'next'|'prev', mode: 'spread'|'single', fromSpread, toSpread, targetPage, key }

  // Sync displayedPage if publication switches or pages reload
  useEffect(() => {
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
    setFlipState(null);
    setDisplayedPage(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicationType, pages.length, isDualPageMode]);

  // Trigger 3D realistic page turn whenever `currentPage` changes from ANY control (arrows, keyboard, footer, swipe, corner click)
  useEffect(() => {
    if (currentPage === displayedPage) return;

    const fromSpread = getSpreadForPage(pages, displayedPage, totalPages, isDualPageMode);
    const toSpread = getSpreadForPage(pages, currentPage, totalPages, isDualPageMode);

    // If both resolve to the exact same dual-page spread, just sync without flipping
    if (
      isDualPageMode &&
      fromSpread.leftPage?.pageNumber === toSpread.leftPage?.pageNumber &&
      fromSpread.rightPage?.pageNumber === toSpread.rightPage?.pageNumber
    ) {
      setDisplayedPage(currentPage);
      return;
    }

    const direction = currentPage > displayedPage ? 'next' : 'prev';
    const duration = isDualPageMode ? 620 : 560;

    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
    }

    setFlipState({
      direction,
      mode: isDualPageMode ? 'spread' : 'single',
      fromSpread,
      toSpread,
      targetPage: currentPage,
      key: `${displayedPage}-${currentPage}-${Date.now()}`
    });

    flipTimerRef.current = setTimeout(() => {
      setDisplayedPage(currentPage);
      setFlipState(null);
      flipTimerRef.current = null;
    }, duration);
  }, [currentPage, displayedPage, pages, totalPages, isDualPageMode]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, []);

  // Measure container size dynamically for crisp auto-fit scaling of 794x1123 print pages
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setViewportSize({
        width: el.clientWidth || window.innerWidth,
        height: el.clientHeight || window.innerHeight - (isFullscreen ? 12 : 140)
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [isFullscreen]);

  // Reset pan when page or zoom resets
  useEffect(() => {
    if (zoomScale <= 1.0) {
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomScale, currentPage]);

  // Active static spread (when not flipping)
  const activeSpread = getSpreadForPage(pages, displayedPage, totalPages, isDualPageMode);

  // Stage dimensions: In dual mode, stage is always 1596px dual-page; in single mode, 794px
  const stageIsSpread = isDualPageMode;
  const baseWidth = stageIsSpread ? 794 * 2 + 8 : 794;
  const baseHeight = 1123;

  // Compute responsive Fit-to-Screen scale: GUARANTEE 100% complete view of frontpage & all pages
  const padW = isFullscreen ? (viewportSize.width < 640 ? 8 : 24) : (viewportSize.width < 640 ? 12 : 36);
  const padH = isFullscreen ? 12 : 24;
  const availW = Math.max(280, viewportSize.width - padW);
  const availH = Math.max(300, viewportSize.height - padH);

  // Strict complete fit: scales to fit BOTH width and height so masthead, headlines, and footer are fully visible
  const fitScale = Math.min(availW / baseWidth, availH / baseHeight);
  const maxAutoScale = isFullscreen ? 1.6 : 1.3;
  const clampedFitScale = Math.min(Math.max(fitScale, 0.25), maxAutoScale);
  const effectiveScale = clampedFitScale * zoomScale;

  // Navigation triggers (simply update parent currentPage; effect runs the 3D flip!)
  const handlePageNavigation = useCallback((direction) => {
    if (flipState) return;
    if (direction === 'next') {
      if (currentPage >= totalPages) return;
      if (isDualPageMode) {
        if (currentPage === 1) {
          onPageChange(2);
        } else {
          onPageChange(Math.min(totalPages, currentPage + 2));
        }
      } else {
        onPageChange(Math.min(totalPages, currentPage + 1));
      }
    } else {
      if (currentPage <= 1) return;
      if (isDualPageMode) {
        if (currentPage <= 3) {
          onPageChange(1);
        } else {
          onPageChange(Math.max(1, currentPage - 2));
        }
      } else {
        onPageChange(Math.max(1, currentPage - 1));
      }
    }
  }, [flipState, currentPage, totalPages, isDualPageMode, onPageChange]);

  // Double click / Double tap to Zoom
  const handleDoubleClick = (e) => {
    if (zoomScale > 1.05) {
      setZoomScale(1.0);
      setPanPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(1.8);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = (rect.width / 2 - (e.clientX - rect.left)) * 0.75;
        const offsetY = (rect.height / 2 - (e.clientY - rect.top)) * 0.75;
        setPanPosition({ x: offsetX, y: offsetY });
      }
    }
  };

  // Mouse Pan handlers
  const handleMouseDown = (e) => {
    if (zoomScale > 1.05) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning || zoomScale <= 1.05) return;
    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    const maxPan = (zoomScale - 0.8) * 560;
    setPanPosition({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      setTouchStart({ x: t.clientX, y: t.clientY, time: Date.now() });
      if (zoomScale > 1.05) {
        setIsPanning(true);
        setPanStart({ x: t.clientX - panPosition.x, y: t.clientY - panPosition.y });
      }
    }
  };

  const handleTouchMove = (e) => {
    if (zoomScale > 1.05 && isPanning && e.touches.length === 1) {
      const t = e.touches[0];
      const maxPan = (zoomScale - 0.8) * 560;
      setPanPosition({
        x: Math.max(-maxPan, Math.min(maxPan, t.clientX - panStart.x)),
        y: Math.max(-maxPan, Math.min(maxPan, t.clientY - panStart.y))
      });
    }
  };

  const handleTouchEnd = (e) => {
    setIsPanning(false);
    if (zoomScale <= 1.05 && e.changedTouches.length === 1) {
      const t = e.changedTouches[0];
      const deltaX = t.clientX - touchStart.x;
      const deltaY = t.clientY - touchStart.y;
      const duration = Date.now() - touchStart.time;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaY) < 70 && duration < 450) {
        if (deltaX < 0 && currentPage < totalPages) handlePageNavigation('next');
        else if (deltaX > 0 && currentPage > 1) handlePageNavigation('prev');
      }
    }
  };

  // Reading mode filter
  const getFilterClass = () => {
    switch (readingMode) {
      case 'dark':
        return 'filter invert-[0.9] hue-rotate-180 contrast-110 brightness-95';
      case 'sepia':
        return 'filter sepia-[0.42] contrast-[1.05] brightness-[0.97]';
      default:
        return '';
    }
  };

  const watermarkText = `🔒 அமேஸ் டைம்ஸ் டிஜிட்டல் பதிப்பு • ${readerUser?.email || readerUser?.name || 'Amaze Times Reader VIP'}`;

  // Reusable page surface renderer
  const renderPageSurface = (pageObj, side = 'right', interactive = true) => {
    if (!pageObj) {
      return <div className="w-[794px] h-[1123px] bg-slate-900/90 flex-shrink-0" />;
    }
    return (
      <div className={`relative w-[794px] h-[1123px] flex-shrink-0 bg-white ${side === 'left' ? 'group/left' : 'group/right'}`}>
        <AmazeTimesPageRenderer
          page={pageObj}
          publicationType={publicationType}
          editionName={editionName}
        />

        {/* Book Spine Curvature Shadow */}
        {stageIsSpread && side === 'left' && (
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/35 via-black/12 to-transparent pointer-events-none" />
        )}
        {stageIsSpread && side === 'right' && (
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/35 via-black/12 to-transparent pointer-events-none" />
        )}

        {/* Subtle DRM Diagonal Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.045] flex items-center justify-center">
          <div className="whitespace-nowrap font-black text-xl tracking-widest text-slate-900 uppercase rotate-[-35deg]">
            {watermarkText} • {watermarkText}
          </div>
        </div>

        {/* Interactive Controls (Crop + Peeling Corner Page Turn) */}
        {interactive && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenClipper(pageObj);
              }}
              className={`absolute top-4 ${side === 'left' ? 'left-4 opacity-0 group-hover/left:opacity-100' : 'right-4 opacity-0 group-hover/right:opacity-100'} transition-opacity bg-slate-950/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-sm font-black px-3.5 py-2 rounded-xl shadow-2xl border border-amber-400/40 flex items-center gap-2 cursor-pointer z-30`}
            >
              <Scissors className="w-4 h-4" />
              <span>செய்தி கத்தரி (Crop)</span>
            </button>

            {/* Bottom-Left Peeling Corner -> Prev Page */}
            {(side === 'left' || !stageIsSpread) && currentPage > 1 && zoomScale <= 1.05 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePageNavigation('prev');
                }}
                title="முந்தைய பக்கம் திருப்ப கிளிக் செய்க"
                className="absolute bottom-0 left-0 w-24 h-24 z-30 cursor-pointer group/cornerL overflow-hidden"
              >
                <div
                  className="absolute bottom-0 left-0 w-0 h-0 group-hover/cornerL:w-20 group-hover/cornerL:h-20 transition-all duration-300 ease-out"
                  style={{
                    background: 'linear-gradient(45deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.5) 48%, #f8fafc 50%, #e2e8f0 100%)',
                    boxShadow: '4px -4px 14px rgba(0,0,0,0.35)',
                    borderTopRightRadius: '6px'
                  }}
                />
              </button>
            )}

            {/* Bottom-Right Peeling Corner -> Next Page */}
            {(side === 'right' || !stageIsSpread) && currentPage < totalPages && zoomScale <= 1.05 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePageNavigation('next');
                }}
                title="அடுத்த பக்கம் திருப்ப கிளிக் செய்க"
                className="absolute bottom-0 right-0 w-24 h-24 z-30 cursor-pointer group/cornerR overflow-hidden"
              >
                <div
                  className="absolute bottom-0 right-0 w-0 h-0 group-hover/cornerR:w-20 group-hover/cornerR:h-20 transition-all duration-300 ease-out"
                  style={{
                    background: 'linear-gradient(315deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.5) 48%, #f8fafc 50%, #e2e8f0 100%)',
                    boxShadow: '-4px -4px 14px rgba(0,0,0,0.35)',
                    borderTopLeftRadius: '6px'
                  }}
                />
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  // Prestigious Hardcover Board for closed front cover (left side on Page 1) and back cover (right side on last page)
  const renderCoverBoard = (side = 'front') => {
    const dateLabel = pages[0]?.editionDateFormatted || new Date().toLocaleDateString('ta-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const isFront = side === 'front';

    return (
      <div
        className={`w-[794px] h-[1123px] flex-shrink-0 bg-gradient-to-b from-[#070b14] via-[#0d1527] to-[#060a12] flex flex-col items-center justify-between p-12 text-center select-none relative overflow-hidden ${
          isFront ? 'border-r-2 border-slate-800/90' : 'border-l-2 border-slate-800/90'
        }`}
      >
        {/* Elegant Broadsheet Double Gold Border */}
        <div className="absolute inset-5 border-2 border-amber-500/25 rounded-2xl pointer-events-none" />
        <div className="absolute inset-7 border border-amber-500/15 rounded-xl pointer-events-none" />

        {/* Ornate Corner Accents */}
        <div className="absolute top-8 left-8 text-amber-400/40 text-base select-none pointer-events-none font-serif">❖</div>
        <div className="absolute top-8 right-8 text-amber-400/40 text-base select-none pointer-events-none font-serif">❖</div>
        <div className="absolute bottom-8 left-8 text-amber-400/40 text-base select-none pointer-events-none font-serif">❖</div>
        <div className="absolute bottom-8 right-8 text-amber-400/40 text-base select-none pointer-events-none font-serif">❖</div>

        {/* Subtle Watermark Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <div className="w-[580px] h-[580px] rounded-full border-[36px] border-amber-400" />
        </div>

        {/* 1. TOP HEADER RIBBON */}
        <div className="relative z-10 w-full pt-3 flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/30 text-[11px] font-bold text-amber-300 tracking-wider uppercase shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>அமேஸ் டைம்ஸ் அதிகாரப்பூர்வ டிஜிட்டல் பதிப்பு</span>
          </div>
          <div className="text-[11px] text-slate-400 font-tamil mt-2">
            {editionName || 'தமிழ்நாடு முதன்மைப் பதிப்பு'} • {dateLabel}
          </div>
        </div>

        {/* 2. HERO BRAND CENTERPIECE (PROPER AMAZE TIMES LOGO) */}
        <div className="relative z-10 w-full flex flex-col items-center my-auto">
          {/* Logo Card with Glow */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-red-600/15 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative px-6 py-4 rounded-2xl bg-slate-900/95 border-2 border-amber-400/35 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex items-center justify-center backdrop-blur-md">
              <img
                src="/amaze-times-logo.webp"
                alt="அமேஸ் டைம்ஸ்"
                className="h-24 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
                onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
              />
            </div>
          </div>

          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-wide font-tamil mb-1 drop-shadow-md">
            அமேஸ் டைம்ஸ்
          </h1>
          <p className="text-xs font-black tracking-[0.22em] text-slate-300 uppercase mb-3 font-sans">
            AMAZE TIMES MEDIA NETWORK
          </p>

          <div className="flex items-center justify-center gap-3 w-full max-w-xs mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <span className="text-amber-400 text-xs">❖</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 border border-amber-400/40 text-amber-300 font-bold text-xs mb-7 shadow-lg backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{publicationType === 'magazine' ? 'மாதாந்திர இதழ் • Monthly Magazine' : 'தினசரி மின்-நாளிதழ் • Daily E-Paper'}</span>
            <span className="text-amber-400/60">•</span>
            <span>{totalPages} பக்கங்கள்</span>
          </div>

          {/* 3. FOUR HIGHLIGHTS CARDS (NEAT FILLED 2x2 GRID) */}
          {isFront ? (
            <div className="grid grid-cols-2 gap-3.5 w-full max-w-lg mb-7 text-left">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100 font-tamil">{totalPages} சிறப்புப் பக்கங்கள்</div>
                  <div className="text-[11px] text-slate-400 font-tamil leading-tight mt-0.5">முக்கிய அரசியல், தமிழ்நாடு & வணிகச் செய்திகள்</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100 font-tamil">இன்றைய ராசிபலன்</div>
                  <div className="text-[11px] text-slate-400 font-tamil leading-tight mt-0.5">12 ராசிகளின் பலன்கள் & பஞ்சாங்கம்</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100 font-tamil">திருக்குறள் & சிறுகதை</div>
                  <div className="text-[11px] text-slate-400 font-tamil leading-tight mt-0.5">அதிகார உரை, பழமொழிகள் & சிறுவர் கதை</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100 font-tamil">புதிர்கள் & விடுகதைகள்</div>
                  <div className="text-[11px] text-slate-400 font-tamil leading-tight mt-0.5">மூளைக்கு வேலை, பொது அறிவு வினாடி வினா</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl mb-7 text-center">
              <div className="text-amber-400 font-black text-base font-tamil mb-1.5">
                வாசிப்புக்கு நன்றி! (Thank You)
              </div>
              <p className="text-xs text-slate-300 font-tamil leading-relaxed max-w-sm mx-auto">
                இன்றைய பதிப்பின் அனைத்து 14 பக்கங்கள், பிரத்யேக சிறப்புச் செய்திகள், ராசிபலன் மற்றும் புதிர்கள் இத்துடன் நிறைவு பெறுகின்றன.
              </p>
            </div>
          )}

          {/* 4. PRIMARY ACTION BUTTON */}
          {isFront ? (
            <div className="w-full max-w-sm flex flex-col items-center">
              <button
                onClick={() => handlePageNavigation('next')}
                className="group/cta flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide transition-all shadow-[0_10px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_15px_35px_rgba(245,158,11,0.5)] hover:scale-[1.02] cursor-pointer mb-2.5"
              >
                <span className="font-tamil">வாசிக்கத் தொடங்குக (பக்கம் 2)</span>
                <ChevronRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
              </button>
              <div className="text-[11px] text-slate-400 font-tamil">
                விசைப்பலகையின் ➔ (Right Arrow) அல்லது சுட்டியைப் பயன்படுத்தி பக்கத்தைத் திருப்பலாம்.
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm flex flex-col items-center">
              <button
                onClick={() => onPageChange(1)}
                className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-amber-500 text-slate-100 hover:text-slate-950 font-black text-xs transition-colors shadow-xl cursor-pointer mb-2.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="font-tamil">முதல் பக்கத்திற்குத் திரும்புக (Front Cover)</span>
              </button>
              <div className="text-[11px] text-slate-400 font-tamil">
                அமேஸ் டைம்ஸ் மின்-நாளிதழை தினமும் வாசிக்க amazetimes.com தளத்தைப் பார்வையிடவும்.
              </div>
            </div>
          )}
        </div>

        {/* 5. FOOTER AUTHENTIC IMPRINT */}
        <div className="relative z-10 w-full max-w-lg pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-tamil">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>அங்கீகரிக்கப்பட்ட டிஜிட்டல் மின்-நாளிதழ்</span>
          </div>
          <div className="text-slate-400">© 2026 அமேஸ் டைம்ஸ் மீடியா நெட்வொர்க்</div>
        </div>
      </div>
    );
  };

  // Compute Base Layer Left/Right Pages (what sits flat beneath any flipping sheet)
  let baseLeftPage = activeSpread.leftPage;
  let baseRightPage = activeSpread.rightPage;

  if (flipState) {
    if (flipState.mode === 'spread') {
      if (flipState.direction === 'next') {
        // Outgoing right page is turning to the left -> keep old left flat on left, reveal NEW right flat on right!
        baseLeftPage = flipState.fromSpread.leftPage;
        baseRightPage = flipState.toSpread.rightPage;
      } else {
        // Outgoing left page is turning to the right -> reveal NEW left flat on left, keep old right flat on right!
        baseLeftPage = flipState.toSpread.leftPage;
        baseRightPage = flipState.fromSpread.rightPage;
      }
    } else {
      // Single-page mode
      baseLeftPage = null;
      baseRightPage = flipState.direction === 'next' ? flipState.toSpread.rightPage : flipState.fromSpread.rightPage;
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden select-none bg-slate-950 font-tamil"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
      style={{ cursor: zoomScale > 1.05 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Privacy Shield Overlay when window loses focus */}
      {isWindowBlurred && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-4 shadow-2xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-amber-300 mb-2">
            டிஜிட்டல் உள்ளடக்கப் பாதுகாப்பு (DRM Privacy Protection)
          </h3>
          <p className="text-sm text-slate-300 max-w-md">
            அமேஸ் டைம்ஸ் இதழ்கள் மற்றும் நாளிதழ்கள் பிரத்யேக பதிப்புரிமை பெற்றவை. வாசிப்பைத் தொடர இந்த சாளரத்தைக் கிளிக் செய்யவும்.
          </p>
        </div>
      )}

      {/* Prev / Next Floating Navigation Arrows */}
      {currentPage > 1 && (
        <button
          onClick={() => handlePageNavigation('prev')}
          className={`absolute left-2 sm:left-4 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
            isFullscreen ? 'bg-slate-900/55 hover:bg-amber-500' : 'bg-slate-900/85 hover:bg-amber-500'
          } text-slate-200 hover:text-slate-950 border border-slate-700/80 hover:border-amber-400 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer group`}
          title="முந்தைய பக்கம் (Arrow Left)"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {currentPage < totalPages && (
        <button
          onClick={() => handlePageNavigation('next')}
          className={`absolute right-2 sm:right-4 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
            isFullscreen ? 'bg-slate-900/55 hover:bg-amber-500' : 'bg-slate-900/85 hover:bg-amber-500'
          } text-slate-200 hover:text-slate-950 border border-slate-700/80 hover:border-amber-400 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer group`}
          title="அடுத்த பக்கம் (Arrow Right)"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Zoom & Pan Container */}
      <div
        className="transition-transform duration-100 ease-out flex items-center justify-center my-auto"
        style={{
          transform: `translate(${panPosition.x}px, ${panPosition.y}px)`
        }}
      >
        {/* Sized Box matching scaled 794x1123 pages cleanly */}
        <div
          style={{
            width: `${baseWidth * effectiveScale}px`,
            height: `${baseHeight * effectiveScale}px`
          }}
          className="relative flex items-center justify-center"
        >
          {/* 3D Perspective Stage */}
          <div
            style={{
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left'
            }}
            className={`absolute top-0 left-0 flipbook-stage shadow-[0_25px_75px_rgba(0,0,0,0.9)] rounded ${getFilterClass()}`}
          >
            {/* 1. STATIC BASE BOOK LAYER */}
            <div className="relative w-full h-full flex items-stretch rounded overflow-hidden">
              {/* LEFT PAGE (in dual mode) */}
              {isDualPageMode && (
                baseLeftPage
                  ? renderPageSurface(baseLeftPage, 'left', !flipState)
                  : renderCoverBoard('front')
              )}

              {/* CENTER BOOK SPINE */}
              {isDualPageMode && (
                <div className="w-[8px] h-[1123px] bg-gradient-to-r from-slate-800 via-slate-950 to-slate-800 flex-shrink-0 z-20 shadow-inner" />
              )}

              {/* RIGHT / SINGLE PAGE */}
              {baseRightPage
                ? renderPageSurface(baseRightPage, 'right', !flipState)
                : (isDualPageMode ? renderCoverBoard('back') : null)}
            </div>

            {/* 2. DYNAMIC 3D TURNING LEAF OVERLAY (DUAL-PAGE SPREAD FLIP) */}
            {flipState && flipState.mode === 'spread' && (
              <div
                key={flipState.key}
                className={`absolute top-0 w-[794px] h-[1123px] z-30 flipbook-sheet-3d pointer-events-none ${
                  flipState.direction === 'next' ? 'animate-flipSpreadNext' : 'animate-flipSpreadPrev'
                }`}
                style={{
                  left: flipState.direction === 'next' ? '802px' : '0px'
                }}
              >
                {/* FRONT FACE (Outgoing turning page) */}
                <div className="absolute inset-0 flipbook-face overflow-hidden">
                  {flipState.direction === 'next'
                    ? (flipState.fromSpread.rightPage
                        ? renderPageSurface(flipState.fromSpread.rightPage, 'right', false)
                        : renderCoverBoard('back'))
                    : (flipState.fromSpread.leftPage
                        ? renderPageSurface(flipState.fromSpread.leftPage, 'left', false)
                        : renderCoverBoard('front'))}
                  {/* Realistic Paper Curl Shadow Gradient */}
                  <div
                    className="absolute inset-0 animate-flipShadow pointer-events-none"
                    style={{
                      background: flipState.direction === 'next'
                        ? 'linear-gradient(to left, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.18) 35%, rgba(0,0,0,0.28) 100%)'
                        : 'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.18) 35%, rgba(0,0,0,0.28) 100%)'
                    }}
                  />
                </div>

                {/* BACK FACE (Incoming page landing on the opposite side) */}
                <div className="absolute inset-0 flipbook-face-back overflow-hidden">
                  {flipState.direction === 'next'
                    ? (flipState.toSpread.leftPage
                        ? renderPageSurface(flipState.toSpread.leftPage, 'left', false)
                        : renderCoverBoard('front'))
                    : (flipState.toSpread.rightPage
                        ? renderPageSurface(flipState.toSpread.rightPage, 'right', false)
                        : renderCoverBoard('back'))}
                  {/* Subtle Paper Sheen as Leaf Lands */}
                  <div
                    className="absolute inset-0 animate-flipShadow pointer-events-none"
                    style={{
                      background: flipState.direction === 'next'
                        ? 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(255,255,255,0.15) 40%, transparent 100%)'
                        : 'linear-gradient(to left, rgba(0,0,0,0.35) 0%, rgba(255,255,255,0.15) 40%, transparent 100%)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* 3. DYNAMIC 3D TURNING SHEET OVERLAY (SINGLE-PAGE MODE) */}
            {flipState && flipState.mode === 'single' && (
              <div
                key={flipState.key}
                className={`absolute top-0 left-0 w-[794px] h-[1123px] z-30 flipbook-sheet-3d pointer-events-none ${
                  flipState.direction === 'next' ? 'animate-flipSingleNext' : 'animate-flipSinglePrev'
                }`}
              >
                <div className="w-full h-full overflow-hidden rounded shadow-2xl bg-white">
                  {renderPageSurface(
                    flipState.direction === 'next' ? flipState.fromSpread.rightPage : flipState.toSpread.rightPage,
                    'right',
                    false
                  )}
                  {/* Curling Paper Shadow */}
                  <div
                    className="absolute inset-0 animate-flipShadow pointer-events-none"
                    style={{
                      background: 'linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.18) 38%, rgba(0,0,0,0.22) 100%)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
