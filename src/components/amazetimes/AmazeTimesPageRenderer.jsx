import React from 'react';

export function getSafeRenderImageUrl(url) {
  if (!url) return '/Amaze times.jpg';
  if (url.startsWith('data:') || url.startsWith('/')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (typeof window !== 'undefined' && url.startsWith(window.location.origin)) {
      return url;
    }
    return `/api/amazetimes/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return '/Amaze times.jpg';
}

function DropCapParagraph({ text, isFirst = false, className = '' }) {
  if (!text) return null;
  if (!isFirst || text.length < 2) {
    return <p className={`mb-2 text-justify ${className}`}>{text}</p>;
  }

  // Extract first grapheme cleanly for Tamil Unicode Drop Cap
  let firstChar = text[0];
  let rest = text.slice(1);
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter('ta', { granularity: 'grapheme' });
    const iterator = seg.segment(text)[Symbol.iterator]();
    const firstSeg = iterator.next().value;
    if (firstSeg) {
      firstChar = firstSeg.segment;
      rest = text.slice(firstChar.length);
    }
  }

  return (
    <p className={`mb-2 text-justify ${className}`}>
      <span className="float-left text-[34px] font-black leading-[0.82] mr-1.5 mt-1 px-1.5 py-0.5 bg-slate-900 text-white rounded-sm select-none">
        {firstChar}
      </span>
      {rest}
    </p>
  );
}

// =========================================================================
// DAILY E-NEWSPAPER BROADSHEET RENDERER (FRONT & SECTION PAGES)
// =========================================================================
function DailyNewspaperPage({ page, editionName }) {
  const isFront = page.template === 'newspaper-front';
  const market = page.marketRates || {};

  if (isFront) {
    const lead = page.leadArticle;
    const secondary = page.secondaryArticles || [];
    const briefs = page.briefArticles || [];

    return (
      <div className="w-[794px] h-[1123px] bg-[#fdfcf7] text-[#111827] px-7 py-5 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Masthead Top Strip */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 border-b border-slate-400 pb-1">
            <span>தமிழ்நாட்டின் நம்பகமான டிஜிட்டல் நாளிதழ் • www.amazetimes.com</span>
            <span className="uppercase tracking-wider">{editionName || 'தமிழ்நாடு முதன்மைப் பதிப்பு'}</span>
          </div>

          {/* Monumental Broadsheet Title */}
          <div className="py-2.5 text-center border-b-2 border-slate-950 relative">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-red-600 text-white font-black text-2xl flex items-center justify-center rounded-md border-2 border-slate-950 shadow">
                அ
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif">
                அமேஸ் டைம்ஸ் <span className="text-red-600 text-2xl font-sans">| AMAZE TIMES</span>
              </h1>
            </div>
            <p className="text-[10.5px] font-bold text-slate-700 mt-0.5 tracking-wide">
              உண்மையின் தீர்க்க குரல் • தமிழ்நாடு, தேசியம், வணிகம், உலகம் &amp; மாவட்டச் செய்திகள்
            </p>
          </div>

          {/* Issue Metadata Bar (Highlights D Edition -> D-1 News Rule) */}
          <div className="flex items-center justify-between text-[10.5px] font-black border-b-2 border-slate-950 py-1 px-2 bg-slate-100">
            <span>📅 பதிப்புத் தேதி: {page.editionDateFormatted}</span>
            <span className="text-red-700">
              📰 செய்தித் தொகுப்பு நாள்: {page.sourceNewsDateFormatted}
              {page.isFallbackUsed && page.exactSourceCount === 0 ? ' (சமீபத்திய செய்திகள் இணைப்பு)' : ''}
            </span>
            <span>பக்கம் {page.pageNumber} • ₹ இலவச டிஜிட்டல் பதிப்பு</span>
          </div>

          {/* Lead Content Grid (12 Cols) */}
          <div className="grid grid-cols-12 gap-3.5 pt-3 flex-1 overflow-hidden">
            {/* Left/Main 8 Cols */}
            <div className="col-span-8 pr-3 border-r border-slate-400 flex flex-col overflow-hidden">
              {lead ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-600 text-white text-[9.5px] font-black px-2 py-0.5 uppercase tracking-wider">
                      முக்கியத் தலைப்புச் செய்தி
                    </span>
                    <span className="bg-slate-900 text-white text-[9.5px] font-bold px-2 py-0.5">
                      {lead.category}
                    </span>
                    {lead.district && (
                      <span className="text-[10px] font-bold text-slate-600">📍 {lead.district}</span>
                    )}
                  </div>

                  <h2 className="text-[22px] font-black leading-[1.2] text-slate-950 mb-2">
                    {lead.title}
                  </h2>

                  <div className="grid grid-cols-12 gap-3 mb-2">
                    <div className="col-span-7 border border-slate-800 p-0.5 bg-white">
                      <img
                        src={getSafeRenderImageUrl(lead.image)}
                        alt={lead.title}
                        className="w-full h-44 object-cover block"
                        onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                      />
                    </div>
                    <div className="col-span-5 flex flex-col justify-between bg-slate-50 p-2 border border-slate-300">
                      <p className="text-[11px] font-bold leading-[1.45] text-slate-900 text-justify">
                        {lead.summary}
                      </p>
                      <div className="text-[9.5px] font-bold text-slate-600 border-t border-slate-300 pt-1 mt-1">
                        நிருபர்: {lead.author} • தேதி: {lead.publishedDateIst}
                      </div>
                    </div>
                  </div>

                  <div className="columns-2 gap-3.5 text-[10.5px] leading-[1.52] text-slate-900 flex-1 overflow-hidden">
                    {(lead.paragraphs || []).slice(0, 4).map((p, idx) => (
                      <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">செய்திகள் ஏற்றப்படுகின்றன...</div>
              )}
            </div>

            {/* Right Sidebar 4 Cols: Market Box + Quick Briefs */}
            <div className="col-span-4 flex flex-col gap-2.5 overflow-hidden">
              {/* Daily Market & Gold Box */}
              <div className="border-2 border-slate-900 bg-amber-50/70 p-2">
                <div className="bg-slate-950 text-amber-300 text-center text-[10px] font-black py-1 mb-1.5 uppercase tracking-wide">
                  சந்தை &amp; அத்தியாவசிய நிலவரம்
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8.5px]">தங்கம் 22K (1கி)</span>
                    <b className="text-slate-950">{market.gold22k || '₹7,250'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8.5px]">வெள்ளி (1கி)</span>
                    <b className="text-slate-950">{market.silver || '₹102.00'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8.5px]">பெட்ரோல்</span>
                    <b className="text-slate-950">{market.petrol || '₹100.75'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8.5px]">டீசல்</span>
                    <b className="text-slate-950">{market.diesel || '₹92.34'}</b>
                  </div>
                </div>
              </div>

              {/* Brief Headlines Stack */}
              <div className="border border-slate-800 p-2 bg-white flex-1 overflow-hidden flex flex-col">
                <div className="border-b-2 border-red-600 pb-0.5 mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-black text-red-700">விரைவுச் செய்திகள்</span>
                  <span className="text-[9px] font-bold text-slate-500">சுருக்கம்</span>
                </div>
                <div className="space-y-2 divide-y divide-slate-200 overflow-hidden">
                  {briefs.map((b, i) => (
                    <div key={b.id || i} className={i > 0 ? 'pt-1.5' : ''}>
                      <span className="text-[8.5px] font-black text-blue-800 uppercase">{b.category}</span>
                      <h4 className="text-[11px] font-black leading-tight text-slate-950 mb-0.5">{b.title}</h4>
                      <p className="text-[9.5px] leading-snug text-slate-700 line-clamp-2 text-justify">{b.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Secondary 3-Column News Strip */}
          {secondary.length > 0 && (
            <div className="border-t-2 border-slate-950 mt-2.5 pt-2.5 grid grid-cols-3 gap-3 divide-x divide-slate-400">
              {secondary.slice(0, 3).map((art, i) => (
                <div key={art.id || i} className={i > 0 ? 'pl-3' : ''}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-slate-900 text-amber-300 text-[8.5px] font-black px-1.5 py-0.5">
                      {art.category}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">{art.publishedDateIst}</span>
                  </div>
                  <div className="flex gap-2 mb-1">
                    <img
                      src={getSafeRenderImageUrl(art.image)}
                      alt={art.title}
                      className="w-20 h-16 object-cover border border-slate-400 flex-shrink-0"
                      onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                    />
                    <h3 className="text-[12px] font-black leading-tight text-slate-950 line-clamp-3">
                      {art.title}
                    </h3>
                  </div>
                  <p className="text-[10px] leading-[1.42] text-slate-800 text-justify line-clamp-4">
                    {art.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Newspaper Footer */}
        <div className="border-t-2 border-slate-900 pt-1.5 mt-2 flex items-center justify-between text-[9.5px] font-bold text-slate-700">
          <span>அமேஸ் டைம்ஸ் (Amaze Times Daily E-Paper)</span>
          <span>பதிப்பு: {page.editionDateFormatted} (செய்தி நாள்: {page.sourceNewsDateFormatted})</span>
          <span>© 2026 Amaze Times • பக்கம் {page.pageNumber}</span>
        </div>
      </div>
    );
  }

  // INNER BROADSHEET PAGES (SECTIONS)
  const lead = page.leadArticle;
  const items = (page.articles || []).slice(1);

  return (
    <div className="w-[794px] h-[1123px] bg-[#fdfcf7] text-[#111827] px-7 py-5 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Running Newspaper Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-950 pb-1.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-white text-xs font-black px-2.5 py-0.5">அமேஸ் டைம்ஸ்</span>
            <span className="text-sm font-black text-red-700 uppercase tracking-wide">{page.section}</span>
          </div>
          <div className="text-[10.5px] font-bold text-slate-700 flex items-center gap-3">
            <span>பதிப்பு: {page.editionDateFormatted}</span>
            <span className="bg-slate-200 px-2 py-0.5 rounded font-black text-slate-950">பக்கம் {page.pageNumber}</span>
          </div>
        </div>

        {/* Top Spotlight Story of the Page */}
        {lead && (
          <div className="border-b-2 border-slate-800 pb-3 mb-3">
            <span className="text-[9.5px] font-black text-red-700 uppercase block mb-0.5">
              {lead.category} {lead.district ? `• ${lead.district}` : ''}
            </span>
            <h2 className="text-xl font-black leading-tight text-slate-950 mb-2">
              {lead.title}
            </h2>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5">
                <div className="border border-slate-800 p-0.5 bg-white">
                  <img
                    src={getSafeRenderImageUrl(lead.image)}
                    alt={lead.title}
                    className="w-full h-44 object-cover block"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-600 mt-1">
                  நிருபர்: {lead.author} | தேதி: {lead.publishedDateIst}
                </p>
              </div>
              <div className="col-span-7 text-[11px] leading-[1.58] text-slate-900">
                <p className="font-bold text-slate-950 mb-1.5 text-justify">{lead.summary}</p>
                {(lead.paragraphs || []).slice(0, 3).map((p, idx) => (
                  <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Multi-Column Newspaper Articles Below */}
        <div className="grid grid-cols-2 gap-5 flex-1 overflow-hidden">
          {items.map((art, i) => (
            <div key={art.id || i} className="border border-slate-300 bg-white p-3 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-1 border-b border-slate-200 pb-1">
                <span className="bg-slate-900 text-amber-300 text-[8.5px] font-black px-1.5 py-0.5">
                  {art.category}
                </span>
                <span className="text-[9px] font-bold text-slate-500">{art.publishedDateIst}</span>
              </div>

              <h3 className="text-[14px] font-black leading-snug text-slate-950 mb-2">
                {art.title}
              </h3>

              <div className="flex gap-2.5 mb-2">
                <img
                  src={getSafeRenderImageUrl(art.image)}
                  alt={art.title}
                  className="w-28 h-20 object-cover border border-slate-400 flex-shrink-0"
                  onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                />
                <p className="text-[10.5px] font-bold leading-snug text-slate-800 text-justify line-clamp-4">
                  {art.summary}
                </p>
              </div>

              <div className="text-[10.5px] leading-[1.55] text-slate-800 overflow-hidden flex-1">
                {(art.paragraphs || []).slice(0, 2).map((p, idx) => (
                  <p key={idx} className="mb-1.5 text-justify">{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-slate-900 pt-1.5 mt-2 flex items-center justify-between text-[9.5px] font-bold text-slate-700">
        <span>அமேஸ் டைம்ஸ் | {page.section}</span>
        <span>தேதி: {page.editionDateFormatted}</span>
        <span>பக்கம் {page.pageNumber}</span>
      </div>
    </div>
  );
}

// =========================================================================
// MONTHLY MAGAZINE RENDERER ("அடுத்த தலைமுறை" TEMPLATE STRUCTURE FOR AMAZE TIMES)
// =========================================================================
function MagazineFooterPill({ pageNumber, monthYearLabel }) {
  return (
    <div className="flex items-center gap-2 pt-2.5 mt-auto select-none">
      <span className="border-2 border-black rounded-full px-3 py-0.5 text-[10.5px] font-black bg-white text-black tracking-wide">
        அமேஸ் டைம்ஸ்
      </span>
      <div className="flex-1 h-[1.5px] bg-black" />
      <span className="border-2 border-black px-3 py-0.5 text-[11px] font-black bg-white text-black min-w-[34px] text-center">
        {pageNumber}
      </span>
      <div className="flex-1 h-[1.5px] bg-black" />
      <span className="border-2 border-black rounded-full px-3 py-0.5 text-[10.5px] font-black bg-white text-black">
        {monthYearLabel || 'நவம்பர்-2026'}
      </span>
    </div>
  );
}

function MonthlyMagazinePage({ page }) {
  // PAGE 1: Left Editorial Masthead Table + Right Lead Cover Feature
  if (page.template === 'magazine-cover-page1') {
    const m = page.masthead || {};
    const lead = page.leadStory || {};

    return (
      <div className="w-[794px] h-[1123px] bg-white text-black px-8 py-6 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
        {/* Main 2-Part Grid matching Sample Page 1 */}
        <div className="grid grid-cols-12 gap-5 flex-1 overflow-hidden">
          {/* LEFT 4 COLS: Editorial Credits & Masthead Table */}
          <div className="col-span-4 border-2 border-black flex flex-col bg-slate-50/40 overflow-hidden">
            {/* Solid Black Title Box */}
            <div className="bg-black text-white py-2.5 px-2 text-center">
              <h1 className="text-2xl font-black tracking-wide leading-tight">
                {m.brandTitle || 'அமேஸ் டைம்ஸ்'}
              </h1>
            </div>

            {/* Subtitle Row */}
            <div className="border-b-2 border-black py-1.5 px-2 text-center bg-slate-100">
              <p className="text-[11px] font-black text-black leading-tight">
                {m.subtitle || 'புலனாய்வு & செய்தி விழிப்புணர்வு மாத இதழ்'}
              </p>
            </div>

            {/* Structured Credential Rows */}
            <div className="flex-1 divide-y divide-black/75 flex flex-col justify-between text-center text-[10.5px] leading-snug">
              <div className="p-2">
                <span className="block text-[9.5px] text-slate-600 font-bold">அச்சிட்டு வெளியிடுபவர்</span>
                <b className="text-black font-black">{m.publisher || 'அமேஸ் டைம்ஸ் மீடியா'}</b>
              </div>

              <div className="p-2">
                <span className="block text-[9.5px] text-slate-600 font-bold">ஆசிரியர்</span>
                <b className="text-black font-black text-xs">{m.editor || 'தலைமை ஆசிரியர் குழு'}</b>
              </div>

              <div className="p-2">
                <span className="block text-[9.5px] text-slate-600 font-bold">சிறப்பு ஆசிரியர்கள்</span>
                <b className="text-black font-bold">{m.specialEditors || 'அரசியல் & சமூகப் பிரிவு'}</b>
              </div>

              <div className="p-2">
                <span className="block text-[9.5px] text-slate-600 font-bold">இணை ஆசிரியர்கள்</span>
                <b className="text-black font-bold">{m.associateEditors || 'செய்தித் தொகுப்புக் குழு'}</b>
              </div>

              <div className="p-2">
                <span className="block text-[9.5px] text-slate-600 font-bold">மாவட்ட நிருபர்கள்</span>
                <b className="text-black font-bold">{m.districtReporters || 'தமிழ்நாடு அனைத்து மாவட்டங்கள்'}</b>
              </div>

              <div className="p-2">
                <span className="block text-[9.5px] text-slate-600 font-bold">வடிவமைப்பு &amp; தணிக்கை</span>
                <b className="text-black font-bold">{m.designer || 'அமேஸ் டைம்ஸ் வடிவமைப்பு'}</b>
              </div>

              <div className="p-2 bg-slate-100">
                <span className="block text-[9.5px] text-slate-700 font-black mb-0.5">நிர்வாக அலுவலக முகவரி</span>
                <p className="font-bold text-black text-[10px] mb-1">
                  {m.officeAddress || 'சென்னை, தமிழ்நாடு - 600 005.'}
                </p>
                <p className="font-black text-black text-[10.5px]">
                  தொடர்பு எண்: {m.contactPhone || '9942612398'}
                </p>
                <p className="font-bold text-slate-800 text-[9.5px] break-all">
                  E-mail: {m.contactEmail || 'editor@amazetimes.com'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT 8 COLS: Lead Cover Story & Chosen Cover Image */}
          <div className="col-span-8 flex flex-col overflow-hidden">
            {/* Impact Cover Headline */}
            <h2 className="text-[26px] font-black text-center leading-[1.2] text-black mb-3 tracking-tight">
              {lead.title}
            </h2>

            {/* Framed Cover Photograph (From Best News or Custom Upload) */}
            <div className="border-2 border-black p-1 bg-white mb-3.5 shadow-sm">
              <div className="relative">
                <img
                  src={getSafeRenderImageUrl(lead.image)}
                  alt={lead.title}
                  className="w-full h-60 object-cover block"
                  onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                />
                <div className="bg-black text-white text-[10px] font-black px-2.5 py-1 flex items-center justify-between">
                  <span>சிறப்புப் பார்வை: {lead.category || 'முக்கியச் செய்தி'}</span>
                  <span>{page.monthYearLabel}</span>
                </div>
              </div>
            </div>

            {/* Cover Story Editorial Text with Drop-Cap */}
            <div className="flex-1 text-[12px] leading-[1.68] text-black overflow-hidden">
              {(lead.paragraphs || [lead.summary]).slice(0, 5).map((p, idx) => (
                <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
              ))}
              <div className="text-right font-black text-xs mt-2 pr-2">
                - {lead.author || 'ஆசிரியர்'}
              </div>
            </div>
          </div>
        </div>

        {/* Consistent Pill Footer */}
        <MagazineFooterPill pageNumber={page.pageNumber} monthYearLabel={page.monthYearLabel} />
      </div>
    );
  }

  // PAGES 2+: Inner Spread Pages & Back Page (Sample PDF Template Style!)
  const primary = page.primaryStory;
  const secondary = page.secondaryStory;
  const isBackPage = page.template === 'magazine-back-page';
  const m = page.masthead || {};

  return (
    <div className="w-[794px] h-[1123px] bg-white text-black px-8 py-6 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* PRIMARY TOP FEATURE STORY */}
        {primary && (
          <div className="flex flex-col overflow-hidden">
            {/* Iconic Inverted Solid Black Pull-Headline Banner (Sample PDF Signature!) */}
            <div className="bg-black text-white px-4 py-2 text-center mb-3">
              <h2 className="text-[18px] font-black leading-snug tracking-wide">
                {primary.title}
              </h2>
            </div>

            {/* 2-Column Article Body with Embedded Framed Photo */}
            <div className="grid grid-cols-12 gap-4 items-start">
              {/* Text Left Column */}
              <div className="col-span-6 text-[11.5px] leading-[1.64] text-black">
                {(primary.paragraphs || [primary.summary]).slice(0, 3).map((p, idx) => (
                  <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                ))}
              </div>

              {/* Photo + Continuation Right Column */}
              <div className="col-span-6 flex flex-col gap-2">
                <div className="border-2 border-black p-0.5 bg-white">
                  <img
                    src={getSafeRenderImageUrl(primary.image)}
                    alt={primary.title}
                    className="w-full h-40 object-cover block"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                  <div className="bg-slate-100 border-t border-black px-2 py-1 text-[9.5px] font-black flex justify-between">
                    <span>{primary.category}</span>
                    <span>{primary.author}</span>
                  </div>
                </div>
                <div className="text-[11.5px] leading-[1.64] text-black text-justify">
                  {(primary.paragraphs || []).slice(3, 5).map((p, idx) => (
                    <p key={idx} className="mb-1.5">{p}</p>
                  ))}
                  {!primary.paragraphs?.[3] && primary.summary && (
                    <div className="border-2 border-black bg-amber-50/40 p-2 text-[10.5px] font-bold italic">
                      “{primary.summary.slice(0, 180)}”
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECONDARY BOTTOM FEATURE STORY */}
        {secondary && (
          <div className="border-t-2 border-black pt-3 flex-1 flex flex-col overflow-hidden">
            {/* Solid Black Ribbon or Boxed Title */}
            <div className="flex items-center justify-between bg-slate-900 text-white px-3.5 py-1.5 mb-2.5">
              <h3 className="text-[15px] font-black leading-snug">{secondary.title}</h3>
              <span className="bg-white text-black text-[9px] font-black px-2 py-0.5 flex-shrink-0 ml-2">
                {secondary.category}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start flex-1 overflow-hidden">
              <div className="col-span-5">
                <div className="border-2 border-black p-0.5 bg-white mb-1.5">
                  <img
                    src={getSafeRenderImageUrl(secondary.image)}
                    alt={secondary.title}
                    className="w-full h-36 object-cover block"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                </div>
                <div className="border border-black bg-slate-100 p-1.5 text-[9.5px] font-black text-center">
                  அமேஸ் டைம்ஸ் சிறப்புத் தொகுப்பு • {secondary.publishedDateIst}
                </div>
              </div>

              <div className="col-span-7 text-[11px] leading-[1.62] text-black overflow-hidden">
                {(secondary.paragraphs || [secondary.summary]).slice(0, 4).map((p, idx) => (
                  <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                ))}
                <div className="text-right font-black text-[10.5px] mt-1">
                  - {secondary.author}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Imprint Strip on Back Page matching Page 32 of Sample PDF */}
        {isBackPage && (
          <div className="border-2 border-black px-3 py-1.5 text-[9.5px] font-bold text-center bg-slate-50 mt-auto">
            {m.legalImprint || 'Printed, Published and Owned by Amaze Times Media Network. Chennai - 600 005. Editor: Chief Editorial Board.'}
          </div>
        )}
      </div>

      {/* Consistent Pill Footer */}
      <MagazineFooterPill pageNumber={page.pageNumber} monthYearLabel={page.monthYearLabel} />
    </div>
  );
}

// =========================================================================
// MASTER EXPORTED PAGE RENDERER
// =========================================================================
export default function AmazeTimesPageRenderer({
  page,
  publicationType = 'enewspaper',
  editionName = '',
  className = ''
}) {
  if (!page) return null;

  const isNewspaper = publicationType === 'enewspaper' || String(page.template || '').startsWith('newspaper');

  return (
    <div className={`inline-block bg-white ${className}`}>
      {isNewspaper ? (
        <DailyNewspaperPage page={page} editionName={editionName} />
      ) : (
        <MonthlyMagazinePage page={page} />
      )}
    </div>
  );
}
