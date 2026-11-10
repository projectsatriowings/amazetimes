import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Layers } from 'lucide-react';
import AmazeTimesPageRenderer from './AmazeTimesPageRenderer';

export default function AmazeTimesThumbnailDrawer({
  isOpen,
  onToggle,
  pages = [],
  currentPage,
  isDualPageMode,
  onSelectPage,
  publicationType = 'enewspaper',
  editionName = ''
}) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) return;
    const activeThumb = scrollContainerRef.current.querySelector(`[data-page="${currentPage}"]`);
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentPage, isOpen]);

  return (
    <div className="relative z-30 select-none font-tamil">
      {/* Toggle Tab Bar */}
      <div className="flex items-center justify-center -mb-px">
        <button
          onClick={onToggle}
          className="bg-slate-900/95 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-t border-x border-slate-700/80 rounded-t-xl px-4 py-1.5 text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-all backdrop-blur-md"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>பக்கங்கள் முன்னோட்டம் ({pages.length})</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Filmstrip Tray */}
      {isOpen && (
        <div className="bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] animate-slideUp">
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto py-1"
            style={{ scrollBehavior: 'smooth' }}
          >
            {pages.map((p, idx) => {
              const pageNum = p.pageNumber || idx + 1;
              const isCurrent = isDualPageMode
                ? (pageNum === currentPage || (currentPage > 1 && currentPage % 2 === 0 && pageNum === currentPage + 1) || (currentPage > 1 && currentPage % 2 === 1 && pageNum === currentPage - 1))
                : pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  data-page={pageNum}
                  onClick={() => onSelectPage(pageNum)}
                  className={`group relative flex-shrink-0 flex flex-col items-center rounded-xl overflow-hidden transition-all duration-200 cursor-pointer text-left ${
                    isCurrent
                      ? 'border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-xl scale-105 bg-slate-800'
                      : 'border border-slate-700/80 hover:border-amber-400/60 bg-slate-900 opacity-80 hover:opacity-100'
                  }`}
                  style={{ width: '104px' }}
                >
                  {/* Scaled Live Miniature Print Preview */}
                  <div className="w-[100px] h-[141px] bg-white relative overflow-hidden pointer-events-none">
                    <div
                      style={{
                        width: '794px',
                        height: '1123px',
                        transform: 'scale(0.1259)',
                        transformOrigin: 'top left'
                      }}
                    >
                      <AmazeTimesPageRenderer
                        page={p}
                        publicationType={publicationType}
                        editionName={editionName}
                      />
                    </div>

                    {isCurrent && (
                      <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                        தற்போது
                      </div>
                    )}

                    {p.section && (
                      <div className="absolute bottom-1 left-1 max-w-[92%] truncate bg-slate-950/90 text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                        {p.section}
                      </div>
                    )}
                  </div>

                  {/* Page Label */}
                  <div className="w-full p-1.5 bg-slate-900 border-t border-slate-800 text-center">
                    <span className={`text-[11px] font-bold block ${isCurrent ? 'text-amber-300' : 'text-slate-300'}`}>
                      பக்கம் {pageNum}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
