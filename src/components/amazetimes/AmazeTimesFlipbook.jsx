import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Scissors, ShieldAlert
} from 'lucide-react';
import AmazeTimesPageRenderer from './AmazeTimesPageRenderer';

export default function AmazeTimesFlipbook({
  pages = [],
  currentPage = 1,
  totalPages = 16,
  isDualPageMode = true,
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
  const [viewportSize, setViewportSize] = useState({ width: 1024, height: 700 });

  // Pan / Drag State for zoomed reading
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Touch Swipe State
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });

  // Flip Animation State
  const [flipDirection, setFlipDirection] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Measure container size dynamically for crisp auto-fit scaling of 794x1123 print pages
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setViewportSize({
        width: el.clientWidth || window.innerWidth,
        height: el.clientHeight || window.innerHeight - 140
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
  }, []);

  // Reset pan when page or zoom resets
  useEffect(() => {
    if (zoomScale <= 1.0) {
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomScale, currentPage]);

  // Determine visible pages (Dual-page vs Single-page)
  const isCover = currentPage === 1;
  let leftPage = null;
  let rightPage = null;

  if (isDualPageMode) {
    if (isCover) {
      rightPage = pages.find(p => p.pageNumber === 1) || pages[0];
    } else {
      const leftNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      const rightNum = leftNum + 1;
      leftPage = pages.find(p => p.pageNumber === leftNum) || pages[leftNum - 1];
      rightPage = rightNum <= totalPages
        ? (pages.find(p => p.pageNumber === rightNum) || pages[rightNum - 1])
        : null;
    }
  } else {
    rightPage = pages.find(p => p.pageNumber === currentPage) || pages[currentPage - 1];
  }

  const showingSpread = Boolean(isDualPageMode && leftPage && rightPage);
  const baseWidth = showingSpread ? 794 * 2 + 8 : 794;
  const baseHeight = 1123;

  // Compute responsive Fit-to-Screen scale
  const availW = Math.max(300, viewportSize.width - (viewportSize.width < 640 ? 20 : 88));
  const availH = Math.max(320, viewportSize.height - 28);
  const fitScale = Math.min(availW / baseWidth, availH / baseHeight, 0.95);
  const effectiveScale = fitScale * zoomScale;

  // Trigger page flip with animation
  const handlePageNavigation = (direction) => {
    if (isFlipping) return;
    setFlipDirection(direction);
    setIsFlipping(true);

    setTimeout(() => {
      if (direction === 'next') {
        const step = isDualPageMode && currentPage > 1 ? 2 : 1;
        onPageChange(Math.min(totalPages, currentPage + step));
      } else {
        const step = isDualPageMode && currentPage > 2 ? 2 : 1;
        onPageChange(Math.max(1, currentPage - step));
      }
      setIsFlipping(false);
      setFlipDirection(null);
    }, 240);
  };

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
    const maxPan = (zoomScale - 0.8) * 520;
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
      const maxPan = (zoomScale - 0.8) * 520;
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

      {/* Prev / Next Hot-Zone Navigation Arrows */}
      {currentPage > 1 && (
        <button
          onClick={() => handlePageNavigation('prev')}
          className="absolute left-2 sm:left-4 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/85 hover:bg-amber-500 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-amber-400 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer group"
          title="முந்தைய பக்கம் (Arrow Left)"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {currentPage < totalPages && (
        <button
          onClick={() => handlePageNavigation('next')}
          className="absolute right-2 sm:right-4 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/85 hover:bg-amber-500 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-amber-400 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer group"
          title="அடுத்த பக்கம் (Arrow Right)"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Zoom & Pan Container */}
      <div
        className="transition-transform duration-100 ease-out flex items-center justify-center"
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
          className={`relative flex items-center justify-center transition-all duration-200 ${
            isFlipping ? (flipDirection === 'next' ? 'animate-pageCurlNext' : 'animate-pageCurlPrev') : ''
          }`}
        >
          <div
            style={{
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left'
            }}
            className={`absolute top-0 left-0 flex items-stretch shadow-[0_25px_70px_rgba(0,0,0,0.85)] rounded overflow-hidden ${getFilterClass()}`}
          >
            {/* LEFT PAGE (Dual Spread) */}
            {isDualPageMode && leftPage && (
              <div className="relative w-[794px] h-[1123px] flex-shrink-0 group/left">
                <AmazeTimesPageRenderer
                  page={leftPage}
                  publicationType={publicationType}
                  editionName={editionName}
                />

                {/* Book Spine Curvature Shadow on Right Edge */}
                <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/30 via-black/10 to-transparent pointer-events-none" />

                {/* Subtle DRM Diagonal Watermark */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.045] flex items-center justify-center">
                  <div className="whitespace-nowrap font-black text-xl tracking-widest text-slate-900 uppercase rotate-[-35deg]">
                    {watermarkText} • {watermarkText}
                  </div>
                </div>

                {/* Quick Crop Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenClipper(leftPage);
                  }}
                  className="absolute top-4 left-4 opacity-0 group-hover/left:opacity-100 transition-opacity bg-slate-950/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-sm font-black px-3.5 py-2 rounded-xl shadow-2xl border border-amber-400/40 flex items-center gap-2 cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>செய்தி கத்தரி (Crop)</span>
                </button>
              </div>
            )}

            {/* CENTER SPINE SHADOW BAR */}
            {showingSpread && (
              <div className="w-[8px] h-[1123px] bg-gradient-to-r from-slate-800 via-slate-950 to-slate-800 flex-shrink-0 z-20" />
            )}

            {/* RIGHT / SINGLE PAGE */}
            {rightPage && (
              <div className="relative w-[794px] h-[1123px] flex-shrink-0 group/right">
                <AmazeTimesPageRenderer
                  page={rightPage}
                  publicationType={publicationType}
                  editionName={editionName}
                />

                {showingSpread && (
                  <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none" />
                )}

                {/* Subtle DRM Diagonal Watermark */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.045] flex items-center justify-center">
                  <div className="whitespace-nowrap font-black text-xl tracking-widest text-slate-900 uppercase rotate-[-35deg]">
                    {watermarkText} • {watermarkText}
                  </div>
                </div>

                {/* Quick Crop Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenClipper(rightPage);
                  }}
                  className="absolute top-4 right-4 opacity-0 group-hover/right:opacity-100 transition-opacity bg-slate-950/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-sm font-black px-3.5 py-2 rounded-xl shadow-2xl border border-amber-400/40 flex items-center gap-2 cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>செய்தி கத்தரி (Crop)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
