import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Scissors, ShieldAlert
} from 'lucide-react';
import AmazeTimesPageRenderer from './AmazeTimesPageRenderer';

function getSpreadForPage(pages, pageNum, totalPages, isDualPageMode) {
  if (!pages || pages.length === 0) {
    return { leftPage: null, rightPage: null, showingSpread: false };
  }
  const safeNum = Math.max(1, Math.min(totalPages, pageNum));
  if (isDualPageMode) {
    if (safeNum === 1) {
      const cover = pages.find(p => p.pageNumber === 1) || pages[0];
      return { leftPage: null, rightPage: cover, showingSpread: false };
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
      showingSpread: Boolean(leftPage && rightPage)
    };
  }
  const single = pages.find(p => p.pageNumber === safeNum) || pages[safeNum - 1] || null;
  return { leftPage: null, rightPage: single, showingSpread: false };
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

    // If both are the exact same dual-page spread (e.g. jumping between page 4 & 5 in dual mode), just sync without flipping
    if (
      fromSpread.leftPage?.pageNumber === toSpread.leftPage?.pageNumber &&
      fromSpread.rightPage?.pageNumber === toSpread.rightPage?.pageNumber
    ) {
      setDisplayedPage(currentPage);
      return;
    }

    const direction = currentPage > displayedPage ? 'next' : 'prev';
    const isTrueSpreadFlip = fromSpread.showingSpread && toSpread.showingSpread;
    const duration = isTrueSpreadFlip ? 620 : 560;

    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
    }

    setFlipState({
      direction,
      mode: isTrueSpreadFlip ? 'spread' : 'single',
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

  // Determine stage dimensions (if flipping between cover & spread, use target dimensions for smooth landing)
  const stageIsSpread = flipState
    ? (flipState.mode === 'spread' ? true : flipState.toSpread.showingSpread)
    : activeSpread.showingSpread;

  const baseWidth = stageIsSpread ? 794 * 2 + 8 : 794;
  const baseHeight = 1123;

  // Compute responsive Fit-to-Screen scale (full edge-to-edge fill in Fullscreen mode!)
  const padW = isFullscreen ? (viewportSize.width < 640 ? 8 : 32) : (viewportSize.width < 640 ? 20 : 88);
  const padH = isFullscreen ? 16 : 28;
  const availW = Math.max(280, viewportSize.width - padW);
  const availH = Math.max(300, viewportSize.height - padH);
  const maxAutoScale = isFullscreen ? 1.45 : 0.98;
  const fitScale = Math.min(availW / baseWidth, availH / baseHeight, maxAutoScale);
  const effectiveScale = fitScale * zoomScale;

  // Navigation triggers (simply update parent currentPage; effect runs the 3D flip!)
  const handlePageNavigation = useCallback((direction) => {
    if (flipState) return;
    if (direction === 'next') {
      if (currentPage >= totalPages) return;
      const step = isDualPageMode && currentPage > 1 ? 2 : 1;
      onPageChange(Math.min(totalPages, currentPage + step));
    } else {
      if (currentPage <= 1) return;
      const step = isDualPageMode && currentPage > 2 ? 2 : 1;
      onPageChange(Math.max(1, currentPage - step));
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
      // Single-page or Cover<->Spread transition
      if (flipState.direction === 'next') {
        baseLeftPage = flipState.toSpread.leftPage;
        baseRightPage = flipState.toSpread.rightPage;
      } else {
        baseLeftPage = flipState.fromSpread.leftPage;
        baseRightPage = flipState.fromSpread.rightPage;
      }
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
              {/* LEFT PAGE */}
              {stageIsSpread && renderPageSurface(baseLeftPage, 'left', !flipState)}

              {/* CENTER BOOK SPINE */}
              {stageIsSpread && (
                <div className="w-[8px] h-[1123px] bg-gradient-to-r from-slate-800 via-slate-950 to-slate-800 flex-shrink-0 z-20 shadow-inner" />
              )}

              {/* RIGHT / SINGLE PAGE */}
              {renderPageSurface(baseRightPage || baseLeftPage, 'right', !flipState)}
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
                  {renderPageSurface(
                    flipState.direction === 'next' ? flipState.fromSpread.rightPage : flipState.fromSpread.leftPage,
                    flipState.direction === 'next' ? 'right' : 'left',
                    false
                  )}
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
                  {renderPageSurface(
                    flipState.direction === 'next' ? flipState.toSpread.leftPage : flipState.toSpread.rightPage,
                    flipState.direction === 'next' ? 'left' : 'right',
                    false
                  )}
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

            {/* 3. DYNAMIC 3D TURNING SHEET OVERLAY (SINGLE-PAGE OR COVER <-> SPREAD FLIP) */}
            {flipState && flipState.mode === 'single' && (
              <div
                key={flipState.key}
                className={`absolute top-0 left-0 w-full h-full z-30 flipbook-sheet-3d pointer-events-none ${
                  flipState.direction === 'next' ? 'animate-flipSingleNext' : 'animate-flipSinglePrev'
                }`}
              >
                <div className="w-full h-full flex items-stretch overflow-hidden rounded shadow-2xl bg-white">
                  {flipState.direction === 'next' ? (
                    <>
                      {flipState.fromSpread.showingSpread && renderPageSurface(flipState.fromSpread.leftPage, 'left', false)}
                      {flipState.fromSpread.showingSpread && (
                        <div className="w-[8px] h-[1123px] bg-slate-900 flex-shrink-0" />
                      )}
                      {renderPageSurface(flipState.fromSpread.rightPage || flipState.fromSpread.leftPage, 'right', false)}
                    </>
                  ) : (
                    <>
                      {flipState.toSpread.showingSpread && renderPageSurface(flipState.toSpread.leftPage, 'left', false)}
                      {flipState.toSpread.showingSpread && (
                        <div className="w-[8px] h-[1123px] bg-slate-900 flex-shrink-0" />
                      )}
                      {renderPageSurface(flipState.toSpread.rightPage || flipState.toSpread.leftPage, 'right', false)}
                    </>
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
