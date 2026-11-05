import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Scissors, Check, X, Download, Share2, Copy, 
  RotateCcw, Sparkles, Move, Maximize2 
} from 'lucide-react';

export default function AmazeTimesArticleClipper({
  isOpen,
  onClose,
  pageImage,
  pageNumber,
  pageTitle,
  pageSection,
  publicationTitle,
  editionName,
  issueDate,
  onToast
}) {
  if (!isOpen) return null;

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Crop rectangle state in percentage of image (0 to 100)
  const [crop, setCrop] = useState({ x: 15, y: 15, width: 70, height: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null); // 'move' or handle position
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState({ ...crop });

  // Generated preview
  const [clippedImageUrl, setClippedImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset when opened
  useEffect(() => {
    setCrop({ x: 15, y: 15, width: 70, height: 45 });
    setClippedImageUrl(null);
  }, [isOpen, pageImage]);

  // Pointer drag start
  const handlePointerDown = (e, handleType) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setActiveHandle(handleType);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCrop({ ...crop });
  };

  // Pointer move handler
  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    if (activeHandle === 'move') {
      let newX = initialCrop.x + deltaXPercent;
      let newY = initialCrop.y + deltaYPercent;

      // Bound checks
      newX = Math.max(0, Math.min(newX, 100 - initialCrop.width));
      newY = Math.max(0, Math.min(newY, 100 - initialCrop.height));

      setCrop(prev => ({ ...prev, x: newX, y: newY }));
    } else if (activeHandle) {
      let { x, y, width, height } = initialCrop;

      if (activeHandle.includes('e')) {
        width = Math.max(10, Math.min(100 - x, initialCrop.width + deltaXPercent));
      }
      if (activeHandle.includes('s')) {
        height = Math.max(10, Math.min(100 - y, initialCrop.height + deltaYPercent));
      }
      if (activeHandle.includes('w')) {
        const potentialX = Math.max(0, Math.min(initialCrop.x + initialCrop.width - 10, initialCrop.x + deltaXPercent));
        width = initialCrop.width + (initialCrop.x - potentialX);
        x = potentialX;
      }
      if (activeHandle.includes('n')) {
        const potentialY = Math.max(0, Math.min(initialCrop.y + initialCrop.height - 10, initialCrop.y + deltaYPercent));
        height = initialCrop.height + (initialCrop.y - potentialY);
        y = potentialY;
      }

      setCrop({ x, y, width, height });
    }
  }, [isDragging, activeHandle, dragStart, initialCrop]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Generate Branded Clipping Canvas
  const generateClipping = async () => {
    try {
      setIsGenerating(true);
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = pageImage;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      // Calculate pixel coordinates from source image
      const srcX = (crop.x / 100) * image.naturalWidth;
      const srcY = (crop.y / 100) * image.naturalHeight;
      const srcW = (crop.width / 100) * image.naturalWidth;
      const srcH = (crop.height / 100) * image.naturalHeight;

      // Canvas dimensions
      const headerH = 110;
      const footerH = 60;
      const padding = 20;
      const canvasW = Math.max(800, srcW + padding * 2);
      const drawImgW = canvasW - padding * 2;
      const drawImgH = (srcH / srcW) * drawImgW;
      const canvasH = headerH + drawImgH + footerH + padding * 2;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#0f172a'; // Deep slate
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Header Gradient
      const grad = ctx.createLinearGradient(0, 0, canvasW, 0);
      grad.addColorStop(0, '#0a1945');
      grad.addColorStop(0.5, '#0e2a7a');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, headerH);

      // Header Brand Texts
      ctx.fillStyle = '#f59e0b'; // Amber
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('அமேஸ் டைம்ஸ் (Amaze Times)', padding, 42);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px sans-serif';
      ctx.fillText(`டிஜிட்டல் செய்திக் கத்தரிப்பு (Digital Clipping) • ${editionName || 'முக்கியப் பதிப்பு'}`, padding, 72);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(`தேதி: ${issueDate || 'இன்று'} | பக்கம்: ${pageNumber || '1'} (${pageSection || 'செய்தி'})`, padding, 94);

      // Web link on right
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('www.amazetimes.com', canvasW - padding, 45);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '12px sans-serif';
      ctx.fillText('🔒 சரிபார்க்கப்பட்ட செய்தி ஆவணம்', canvasW - padding, 72);
      ctx.textAlign = 'left';

      // Clip image container card
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(padding - 2, headerH + padding - 2, drawImgW + 4, drawImgH + 4);

      // Draw cropped portion
      ctx.drawImage(
        image,
        srcX, srcY, srcW, srcH,
        padding, headerH + padding, drawImgW, drawImgH
      );

      // Watermark Stamp overlay on clipping
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#000000';
      ctx.translate(canvasW / 2, headerH + padding + drawImgH / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.textAlign = 'center';
      ctx.fillText('AMAZE TIMES DIGITAL ARCHIVE', 0, 0);
      ctx.restore();

      // Footer
      const footerY = headerH + padding + drawImgH + padding;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, footerY, canvasW, footerH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText('© 2026 Amaze Times Media Network • அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', padding, footerY + 36);

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'right';
      ctx.fillText('செய்திகளை வாசிக்க: https://amazetimes.com', canvasW - padding, footerY + 36);

      const url = canvas.toDataURL('image/jpeg', 0.95);
      setClippedImageUrl(url);
      if (onToast) onToast('கத்தரிப்பு வெற்றிகரமாக உருவாக்கப்பட்டது! பகிர்வு செய்யலாம்.', 'success');
    } catch (err) {
      console.error('Clip generation error:', err);
      if (onToast) onToast('கத்தரிப்பு உருவாக்குவதில் பிழை ஏற்பட்டது', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Image
  const handleDownload = () => {
    if (!clippedImageUrl) return;
    const a = document.createElement('a');
    a.href = clippedImageUrl;
    a.download = `Amaze_Times_Clipping_Page_${pageNumber}_${Date.now()}.jpg`;
    a.click();
    if (onToast) onToast('செய்திக் கத்தரிப்பு பதிவிறக்கம் செய்யப்பட்டது!');
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📰 *அமேஸ் டைம்ஸ் - பிரத்யேக செய்திக் கத்தரிப்பு*\n\n` +
      `📌 *${publicationTitle || 'அமேஸ் டைம்ஸ்'}*\n` +
      `📅 தேதி: ${issueDate}\n` +
      `📄 பக்கம்: ${pageNumber} - ${pageSection || ''}\n\n` +
      `முழுமையான மின்-இதழ் மற்றும் தினசரி நாளிதழை வாசிக்க:\n` +
      `👉 https://amazetimes.com`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Copy Image to Clipboard
  const handleCopy = async () => {
    if (!clippedImageUrl) return;
    try {
      const res = await fetch(clippedImageUrl);
      const blob = await res.blob();
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        if (onToast) onToast('செய்திக் கத்தரிப்பு நகலெடுக்கப்பட்டது (Copied to Clipboard)!');
      } else {
        handleDownload();
      }
    } catch (e) {
      handleDownload();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none font-tamil"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 px-5 py-3.5 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-amber-200 flex items-center gap-2">
                <span>செய்திக் கத்தரிப்பு & பகிர்வு (Amaze Times Article Clipper)</span>
                <span className="text-[11px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                  பக்கம் {pageNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                விரும்பிய பகுதியைத் தேர்ந்தெடுத்து வாட்ஸ்அப் அல்லது சமூக வலைதளங்களில் பகிரலாம்
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-slate-950 relative min-h-[360px]">
          {!clippedImageUrl ? (
            <div 
              ref={containerRef}
              className="relative max-w-full max-h-[60vh] inline-block shadow-2xl border border-slate-700 rounded-lg overflow-hidden bg-black select-none"
            >
              <img 
                ref={imgRef}
                src={pageImage} 
                alt="Page Clipping Target"
                className="max-h-[60vh] w-auto object-contain block pointer-events-none"
                draggable={false}
              />

              {/* Shaded backdrop outside crop */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `rgba(0, 0, 0, 0.65)`
                }}
              />

              {/* Crop Box Window */}
              <div 
                className="absolute border-2 border-amber-400 bg-transparent cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                style={{
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`
                }}
                onPointerDown={(e) => handlePointerDown(e, 'move')}
              >
                {/* Center Move Indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 hover:opacity-90">
                  <Move className="w-6 h-6 text-amber-300 drop-shadow" />
                </div>

                {/* Resize Handles */}
                {['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'].map((h) => {
                  const getPosStyle = () => {
                    const size = 12;
                    const half = -size / 2;
                    switch(h) {
                      case 'nw': return { top: half, left: half, cursor: 'nwse-resize' };
                      case 'ne': return { top: half, right: half, cursor: 'nesw-resize' };
                      case 'se': return { bottom: half, right: half, cursor: 'nwse-resize' };
                      case 'sw': return { bottom: half, left: half, cursor: 'nesw-resize' };
                      case 'n': return { top: half, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' };
                      case 's': return { bottom: half, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' };
                      case 'w': return { left: half, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' };
                      case 'e': return { right: half, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' };
                      default: return {};
                    }
                  };

                  return (
                    <div 
                      key={h}
                      className="absolute w-3 h-3 bg-amber-400 border border-slate-900 rounded-sm hover:scale-125 transition-transform"
                      style={getPosStyle()}
                      onPointerDown={(e) => handlePointerDown(e, h)}
                    />
                  );
                })}

                {/* Dimension Pill */}
                <div className="absolute -top-7 left-0 bg-amber-500 text-slate-950 font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                  கத்தரிப்புத் தேர்வு: {Math.round(crop.width)}% × {Math.round(crop.height)}%
                </div>
              </div>
            </div>
          ) : (
            /* Generated Clipping Preview */
            <div className="flex flex-col items-center justify-center gap-3 w-full animate-scaleUp">
              <div className="max-h-[58vh] overflow-auto rounded-xl border-2 border-amber-400/50 shadow-2xl bg-slate-900">
                <img 
                  src={clippedImageUrl} 
                  alt="Generated Clipping" 
                  className="max-h-[55vh] w-auto object-contain block mx-auto"
                />
              </div>
              <p className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>அமேஸ் டைம்ஸ் அதிகாரப்பூர்வ வாட்டர்மார்க் மற்றும் தலைப்பு இணைக்கப்பட்டுள்ளது</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800/80 px-4 py-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          {!clippedImageUrl ? (
            <>
              <div className="text-xs text-slate-400 hidden sm:block">
                💡 பாக்ஸை நகர்த்தி அல்லது மூலைகளை இழுத்து தேவையான பகுதியைத் தேர்வு செய்யவும்.
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setCrop({ x: 10, y: 10, width: 80, height: 80 })}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition flex items-center gap-1.5"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>முழுப் பக்கம்</span>
                </button>
                <button
                  onClick={generateClipping}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span>உருவாகிறது...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>கத்தரிப்பை உருவாக்கு (Generate Clipping)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setClippedImageUrl(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>மறுபடி கத்தரிக்க (Re-crop)</span>
              </button>

              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 font-medium transition flex items-center gap-1.5"
                  title="நகலெடு"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>நகலெடு</span>
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp பகிர்வு</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>படத்தைப் பதிவிறக்கு</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

