import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Scissors, ShieldAlert, 
  ZoomIn, ZoomOut, Maximize, RotateCcw, Eye 
} from 'lucide-react';

export default function AmazeTimesFlipbook({
  pages = [],
  currentPage = 1,
  totalPages = 16,
  isDualPageMode = true,
  zoomScale = 1.0,
  setZoomScale,
  readingMode = 'light', // 'light' | 'dark' | 'sepia'
  onPageChange,
  onOpenClipper,
  readerUser = null,
  isWindowBlurred = false
}) {
  const containerRef = useRef(null);

  // Pan / Drag State for zoomed reading
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Touch Swipe State
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });

  // Flip Animation State
  const [flipDirection, setFlipDirection] = useState(null); // 'next' | 'prev' | null
  const [isFlipping, setIsFlipping] = useState(false);

  // Reset pan when page or zoom changes back to 1.0
  useEffect(() => {
    if (zoomScale <= 1.0) {
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomScale, currentPage]);

  // Determine current active pages to display
  // In dual-page mode:
  // Page 1 is Cover (single centered right or spread), Page 2-3 are spread, 4-5 are spread, etc.
  const isCover = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  let leftPage = null;
  let rightPage = null;

  if (isDualPageMode) {
    if (isCover) {
      // Cover page shown individually on the right side of the book spine
      rightPage = pages.find(p => p.pageNumber === 1) || pages[0];
    } else {
      // If even page, it is left side (e.g. 2, 4, 6)
      const leftNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      const rightNum = leftNum + 1;

      leftPage = pages.find(p => p.pageNumber === leftNum) || pages[leftNum - 1];
      rightPage = rightNum <= totalPages ? (pages.find(p => p.pageNumber === rightNum) || pages[rightNum - 1]) : null;
    }
  } else {
    // Single page mode (mobile or user selected)
    rightPage = pages.find(p => p.pageNumber === currentPage) || pages[currentPage - 1];
  }

  // Trigger page flip with animation
  const handlePageNavigation = (direction) => {
    if (isFlipping) return;
    setFlipDirection(direction);
    setIsFlipping(true);

    setTimeout(() => {
      if (direction === 'next') {
        const step = isDualPageMode ? (currentPage === 1 ? 2 : (currentPage % 2 === 0 ? 2 : 2)) : 1;
        const target = Math.min(totalPages, currentPage + (isDualPageMode && currentPage > 1 ? 2 : (currentPage === 1 ? 1 : 1)));
        onPageChange(Math.min(totalPages, target));
      } else {
        const target = Math.max(1, currentPage - (isDualPageMode && currentPage > 2 ? 2 : 1));
        onPageChange(Math.max(1, target));
      }
      setIsFlipping(false);
      setFlipDirection(null);
    }, 280);
  };

  // Double click / Double tap to Zoom
  const handleDoubleClick = (e) => {
    if (zoomScale > 1.0) {
      setZoomScale(1.0);
      setPanPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(1.75);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = (rect.width / 2 - (e.clientX - rect.left)) * 0.8;
        const offsetY = (rect.height / 2 - (e.clientY - rect.top)) * 0.8;
        setPanPosition({ x: offsetX, y: offsetY });
      }
    }
  };

  // Mouse Pan Start
  const handleMouseDown = (e) => {
    if (zoomScale > 1.0) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  // Mouse Pan Move
  const handleMouseMove = (e) => {
    if (!isPanning || zoomScale <= 1.0) return;
    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    // Cap pan limits based on zoom
    const maxPan = (zoomScale - 1) * 450;
    setPanPosition({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch Swipe Handlers for mobile & tablet
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
      if (zoomScale > 1.0) {
        setIsPanning(true);
        setPanStart({ x: touch.clientX - panPosition.x, y: touch.clientY - panPosition.y });
      }
    }
  };

  const handleTouchMove = (e) => {
    if (zoomScale > 1.0 && isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - panStart.x;
      const newY = touch.clientY - panStart.y;
      const maxPan = (zoomScale - 1) * 450;
      setPanPosition({
        x: Math.max(-maxPan, Math.min(maxPan, newX)),
        y: Math.max(-maxPan, Math.min(maxPan, newY))
      });
    }
  };

  const handleTouchEnd = (e) => {
    setIsPanning(false);
    if (zoomScale <= 1.0 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const duration = Date.now() - touchStart.time;

      // Horizontal swipe detected (min 50px, under 400ms)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 60 && duration < 400) {
        if (deltaX < 0 && currentPage < totalPages) {
          handlePageNavigation('next');
        } else if (deltaX > 0 && currentPage > 1) {
          handlePageNavigation('prev');
        }
      }
    }
  };

  // Reading mode filter class
  const getFilterStyle = () => {
    switch (readingMode) {
      case 'dark':
        return 'filter invert-[0.88] hue-rotate-180 contrast-125 brightness-95 bg-slate-900';
      case 'sepia':
        return 'filter sepia-[0.45] contrast-[1.08] brightness-[0.96] bg-[#fbf0d9]';
      default:
        return 'bg-white';
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        cursor: zoomScale > 1.0 ? (isPanning ? 'grabbing' : 'grab') : 'default'
      }}
    >
      {/* Privacy Shield Overlay when window loses focus / Snipping Tool active */}
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
          <span className="mt-4 text-xs font-mono text-amber-400/80 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            Click anywhere on this screen to resume reading
          </span>
        </div>
      )}

      {/* Floating Flip Navigation Arrows (Large clickable hot-zones) */}
      {currentPage > 1 && (
        <button
          onClick={() => handlePageNavigation('prev')}
          className="absolute left-2 sm:left-4 z-40 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-slate-900/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700/80 hover:border-amber-400 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer group"
          title="முந்தைய பக்கம் (Arrow Left)"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {currentPage < totalPages && (
        <button
          onClick={() => handlePageNavigation('next')}
          className="absolute right-2 sm:right-4 z-40 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-slate-900/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700/80 hover:border-amber-400 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer group"
          title="அடுத்த பக்கம் (Arrow Right)"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Flipbook Stage Container */}
      <div 
        className="transition-transform duration-100 ease-out flex items-center justify-center"
        style={{
          transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
          transformOrigin: 'center center'
        }}
      >
        <div 
          className={`relative flex items-center justify-center transition-all duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden ${
            isFlipping ? (flipDirection === 'next' ? 'animate-pageCurlNext' : 'animate-pageCurlPrev') : ''
          }`}
          style={{
            perspective: '1400px'
          }}
        >
          {/* Dual-Page Mode: LEFT PAGE */}
          {isDualPageMode && leftPage && (
            <div 
              className={`relative max-h-[82vh] w-auto flex-shrink-0 border-r border-slate-900/30 overflow-hidden shadow-2xl group/left ${getFilterStyle()}`}
              style={{
                boxShadow: 'inset -20px 0 25px -10px rgba(0, 0, 0, 0.45)'
              }}
            >
              <img
                src={leftPage.imageUrl || leftPage.thumbnail || '/Amaze times.jpg'}
                alt={leftPage.title || `Page ${leftPage.pageNumber}`}
                className="max-h-[82vh] w-auto object-contain block pointer-events-none"
                draggable={false}
              />

              {/* Realistic Book Spine Shadow on Right Edge */}
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/50 via-black/20 to-transparent pointer-events-none" />

              {/* DRM Repeating Diagonal Watermark */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06] flex items-center justify-center">
                <div 
                  className="whitespace-nowrap font-black text-sm tracking-widest text-slate-900 uppercase rotate-[-35deg]"
                  style={{ transform: 'scale(1.4)' }}
                >
                  {watermarkText} • {watermarkText} • {watermarkText}
                </div>
              </div>

              {/* Page Number & Section Ribbon */}
              <div className="absolute bottom-2 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow border border-white/10 flex items-center gap-1.5">
                <span>பக். {leftPage.pageNumber}</span>
                {leftPage.section && <span className="opacity-70">| {leftPage.section}</span>}
              </div>

              {/* Crop Article Button for Left Page */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenClipper(leftPage);
                }}
                className="absolute top-3 left-3 opacity-0 group-hover/left:opacity-100 transition-opacity bg-slate-900/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700/80 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                title="இந்த பக்கத்தின் செய்தியைக் கத்தரிக்கவும்"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>கத்தரி (Crop)</span>
              </button>
            </div>
          )}

          {/* Dual-Page Spine Crease (Only in dual-page when left page exists) */}
          {isDualPageMode && leftPage && rightPage && (
            <div 
              className="w-1.5 self-stretch bg-gradient-to-r from-black/60 via-slate-800 to-black/60 shadow-inner z-20 flex-shrink-0"
              style={{
                boxShadow: '0 0 10px rgba(0,0,0,0.8)'
              }}
            />
          )}

          {/* RIGHT PAGE (or Single Page) */}
          {rightPage && (
            <div 
              className={`relative max-h-[82vh] w-auto flex-shrink-0 overflow-hidden shadow-2xl group/right ${getFilterStyle()}`}
              style={{
                boxShadow: isDualPageMode && leftPage 
                  ? 'inset 20px 0 25px -10px rgba(0, 0, 0, 0.45)' 
                  : '0 10px 40px rgba(0,0,0,0.5)'
              }}
            >
              <img
                src={rightPage.imageUrl || rightPage.thumbnail || '/Amaze times.jpg'}
                alt={rightPage.title || `Page ${rightPage.pageNumber}`}
                className="max-h-[82vh] w-auto object-contain block pointer-events-none"
                draggable={false}
              />

              {/* Realistic Book Spine Shadow on Left Edge in Dual Page */}
              {isDualPageMode && leftPage && (
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
              )}

              {/* DRM Repeating Diagonal Watermark */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06] flex items-center justify-center">
                <div 
                  className="whitespace-nowrap font-black text-sm tracking-widest text-slate-900 uppercase rotate-[-35deg]"
                  style={{ transform: 'scale(1.4)' }}
                >
                  {watermarkText} • {watermarkText} • {watermarkText}
                </div>
              </div>

              {/* Page Number & Section Ribbon */}
              <div className="absolute bottom-2 right-3 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow border border-white/10 flex items-center gap-1.5">
                <span>பக். {rightPage.pageNumber}</span>
                {rightPage.section && <span className="opacity-70">| {rightPage.section}</span>}
              </div>

              {/* Crop Article Button for Right Page */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenClipper(rightPage);
                }}
                className="absolute top-3 right-3 opacity-0 group-hover/right:opacity-100 transition-opacity bg-slate-900/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700/80 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                title="இந்த பக்கத்தின் செய்தியைக் கத்தரிக்கவும்"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>கத்தரி (Crop)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

