import React from 'react';
import { createRoot } from 'react-dom/client';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import AmazeTimesPageRenderer from '../components/amazetimes/AmazeTimesPageRenderer';

async function waitForImagesInContainer(container, timeoutMs = 2500) {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        const timer = setTimeout(resolve, timeoutMs);
        img.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
        img.addEventListener('error', () => { clearTimeout(timer); resolve(); }, { once: true });
      });
    })
  );
  // Allow two animation frames + brief settle for layout painting
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise(r => setTimeout(r, 80));
}

async function renderPageToJpegDataUrl({ page, publicationType, editionName, pixelRatio = 2, quality = 0.92 }) {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '794px';
  host.style.height = '1123px';
  host.style.overflow = 'hidden';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '-9999';
  host.style.opacity = '0.01';
  host.style.backgroundColor = '#ffffff';
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    root.render(
      React.createElement(AmazeTimesPageRenderer, {
        page,
        publicationType,
        editionName
      })
    );

    // Wait initial mount
    await new Promise(r => setTimeout(r, 90));
    await waitForImagesInContainer(host);

    const targetNode = host.firstElementChild || host;
    const dataUrl = await toJpeg(targetNode, {
      quality,
      pixelRatio,
      width: 794,
      height: 1123,
      backgroundColor: '#ffffff',
      skipFonts: true,
      cacheBust: false
    });

    return dataUrl;
  } finally {
    try {
      root.unmount();
    } catch (_) {}
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  }
}

export async function captureSinglePageSnapshot({ page, publicationType, editionName }) {
  return renderPageToJpegDataUrl({
    page,
    publicationType,
    editionName,
    pixelRatio: 2,
    quality: 0.94
  });
}

export async function exportPublicationToPdf({
  pages = [],
  publicationType = 'enewspaper',
  editionName = '',
  fileName = 'Amaze_Times_Edition.pdf',
  onProgress
}) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('பதிவிறக்க பக்கங்கள் எதுவும் இல்லை');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  for (let i = 0; i < pages.length; i++) {
    if (onProgress) onProgress(i + 1, pages.length);

    const imgDataUrl = await renderPageToJpegDataUrl({
      page: pages[i],
      publicationType,
      editionName,
      pixelRatio: 2,
      quality: 0.90
    });

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgDataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  pdf.save(safeName);
  return { success: true, pagesExported: pages.length, fileName: safeName };
}
