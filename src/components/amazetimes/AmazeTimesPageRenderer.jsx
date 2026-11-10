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
      <span className="float-left text-[32px] font-black leading-[0.82] mr-1.5 mt-1 px-1.5 py-0.5 bg-slate-900 text-white rounded-sm select-none">
        {firstChar}
      </span>
      {rest}
    </p>
  );
}

// =========================================================================
// DAILY E-NEWSPAPER BROADSHEET RENDERER (D EDITION -> D-1 NEWS + FULL COVERAGE)
// =========================================================================
function DailyNewspaperPage({ page, editionName }) {
  const isFront = page.template === 'newspaper-front';
  const market = page.marketRates || {};

  if (isFront) {
    const lead = page.leadArticle;
    const secondary = page.secondaryArticles || [];
    const briefs = page.briefArticles || [];

    return (
      <div className="w-[794px] h-[1123px] bg-[#fdfcf7] text-[#111827] px-6 py-4 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Masthead Top Strip */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 border-b border-slate-400 pb-1">
            <span>தமிழ்நாட்டின் நம்பகமான டிஜிட்டல் நாளிதழ் • www.amazetimes.com</span>
            <span className="uppercase tracking-wider">{editionName || 'தமிழ்நாடு முதன்மைப் பதிப்பு'}</span>
          </div>

          {/* Monumental Broadsheet Title */}
          <div className="py-2 text-center border-b-2 border-slate-950 relative">
            <div className="flex items-center justify-center gap-3">
              <div className="w-9 h-9 bg-red-600 text-white font-black text-xl flex items-center justify-center rounded-md border-2 border-slate-950 shadow">
                அ
              </div>
              <h1 className="text-[34px] font-black tracking-tight text-slate-950 font-serif leading-none">
                அமேஸ் டைம்ஸ் <span className="text-red-600 text-xl font-sans">| AMAZE TIMES</span>
              </h1>
            </div>
            <p className="text-[10px] font-bold text-slate-700 mt-1 tracking-wide">
              உண்மையின் தீர்க்க குரல் • தமிழ்நாடு, அரசியல், தேசியம், வணிகம், கல்வி, விளையாட்டு &amp; உலகச் செய்திகள்
            </p>
          </div>

          {/* Issue Metadata Bar */}
          <div className="flex items-center justify-between text-[10px] font-black border-b-2 border-slate-950 py-1 px-2 bg-slate-100">
            <span>📅 பதிப்புத் தேதி: {page.editionDateFormatted}</span>
            <span className="text-red-700">
              📰 செய்தி நாள் (D-1): {page.sourceNewsDateFormatted}
              {page.isFallbackUsed && page.exactSourceCount === 0 ? ' (+ அனைத்துப் பிரிவு சமீபத்திய தொகுப்பு)' : ''}
            </span>
            <span>பக்கம் {page.pageNumber} • இலவச டிஜிட்டல் பதிப்பு</span>
          </div>

          {/* Lead Content Grid (12 Cols) */}
          <div className="grid grid-cols-12 gap-3.5 pt-2.5 flex-1 overflow-hidden">
            {/* Left/Main 8 Cols */}
            <div className="col-span-8 pr-3 border-r border-slate-400 flex flex-col overflow-hidden">
              {lead ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider">
                      முக்கியத் தலைப்புச் செய்தி
                    </span>
                    <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5">
                      {lead.category}
                    </span>
                    {lead.district && (
                      <span className="text-[9.5px] font-bold text-slate-600">📍 {lead.district}</span>
                    )}
                  </div>

                  <h2 className="text-[21px] font-black leading-[1.2] text-slate-950 mb-1.5">
                    {lead.title}
                  </h2>

                  <div className="grid grid-cols-12 gap-2.5 mb-2">
                    <div className="col-span-7 border border-slate-800 p-0.5 bg-white">
                      <img
                        src={getSafeRenderImageUrl(lead.image)}
                        alt={lead.title}
                        className="w-full h-44 object-cover block"
                        onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                      />
                    </div>
                    <div className="col-span-5 flex flex-col justify-between bg-slate-50 p-2 border border-slate-300">
                      <p className="text-[10.5px] font-bold leading-[1.45] text-slate-900 text-justify">
                        {lead.summary}
                      </p>
                      <div className="text-[9px] font-bold text-slate-600 border-t border-slate-300 pt-1 mt-1">
                        நிருபர்: {lead.author} • {lead.publishedDateIst}
                      </div>
                    </div>
                  </div>

                  <div className="columns-2 gap-3 text-[10.2px] leading-[1.52] text-slate-900 flex-1 overflow-hidden">
                    {(lead.paragraphs || []).slice(0, 4).map((p, idx) => (
                      <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">செய்திகள் ஏற்றப்படுகின்றன...</div>
              )}
            </div>

            {/* Right Sidebar 4 Cols: Market Box + 5 Briefs */}
            <div className="col-span-4 flex flex-col gap-2 overflow-hidden">
              <div className="border-2 border-slate-900 bg-amber-50/70 p-2">
                <div className="bg-slate-950 text-amber-300 text-center text-[9.5px] font-black py-0.5 mb-1.5 uppercase tracking-wide">
                  சந்தை &amp; அத்தியாவசிய நிலவரம்
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8px]">தங்கம் 22K (1கி)</span>
                    <b className="text-slate-950">{market.gold22k || '₹7,250'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8px]">வெள்ளி (1கி)</span>
                    <b className="text-slate-950">{market.silver || '₹102.00'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8px]">பெட்ரோல்</span>
                    <b className="text-slate-950">{market.petrol || '₹100.75'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8px]">டீசல்</span>
                    <b className="text-slate-950">{market.diesel || '₹92.34'}</b>
                  </div>
                </div>
              </div>

              <div className="border border-slate-800 p-2 bg-white flex-1 overflow-hidden flex flex-col">
                <div className="border-b-2 border-red-600 pb-0.5 mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-black text-red-700">முக்கியச் செய்தித் துளிகள்</span>
                  <span className="text-[8.5px] font-bold text-slate-500">உடனுக்குடன்</span>
                </div>
                <div className="space-y-1.5 divide-y divide-slate-200 overflow-hidden">
                  {briefs.slice(0, 5).map((b, i) => (
                    <div key={b.id || i} className={i > 0 ? 'pt-1.5' : ''}>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-blue-800 uppercase">{b.category}</span>
                        <span className="text-[8px] text-slate-400">{b.publishedDateIst}</span>
                      </div>
                      <h4 className="text-[10.5px] font-black leading-tight text-slate-950 line-clamp-2">{b.title}</h4>
                      <p className="text-[9px] leading-snug text-slate-700 line-clamp-2 text-justify">{b.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Secondary 3-Column News Strip */}
          {secondary.length > 0 && (
            <div className="border-t-2 border-slate-950 mt-2 pt-2 grid grid-cols-3 gap-3 divide-x divide-slate-400">
              {secondary.slice(0, 3).map((art, i) => (
                <div key={art.id || i} className={i > 0 ? 'pl-3' : ''}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-slate-900 text-amber-300 text-[8.5px] font-black px-1.5 py-0.5">
                      {art.category}
                    </span>
                    <span className="text-[8.5px] text-slate-500 font-bold">{art.publishedDateIst}</span>
                  </div>
                  <div className="flex gap-2 mb-1">
                    <img
                      src={getSafeRenderImageUrl(art.image)}
                      alt={art.title}
                      className="w-20 h-16 object-cover border border-slate-400 flex-shrink-0"
                      onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                    />
                    <h3 className="text-[11.5px] font-black leading-tight text-slate-950 line-clamp-3">
                      {art.title}
                    </h3>
                  </div>
                  <p className="text-[9.5px] leading-[1.38] text-slate-800 text-justify line-clamp-3">
                    {art.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-900 pt-1 mt-1.5 flex items-center justify-between text-[9px] font-bold text-slate-700">
          <span>அமேஸ் டைம்ஸ் (Amaze Times Daily E-Paper)</span>
          <span>பதிப்பு: {page.editionDateFormatted} (செய்தி நாள்: {page.sourceNewsDateFormatted})</span>
          <span>© 2026 Amaze Times • பக்கம் {page.pageNumber}</span>
        </div>
      </div>
    );
  }

  // INNER BROADSHEET PAGES: Rich Multi-Column 6-to-7 Story Section Pages!
  const lead = page.leadArticle;
  const middlePair = (page.articles || []).slice(1, 3);
  const bottomDigest = (page.articles || []).slice(3, 7);

  return (
    <div className="w-[794px] h-[1123px] bg-[#fdfcf7] text-[#111827] px-6 py-4 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Running Newspaper Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-950 pb-1.5 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-white text-xs font-black px-2.5 py-0.5">அமேஸ் டைம்ஸ்</span>
            <span className="text-sm font-black text-red-700 uppercase tracking-wide">{page.section}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-700 flex items-center gap-3">
            <span>பதிப்பு: {page.editionDateFormatted}</span>
            <span className="bg-slate-200 px-2 py-0.5 rounded font-black text-slate-950">பக்கம் {page.pageNumber}</span>
          </div>
        </div>

        {/* 1. Top Section Lead Story */}
        {lead && (
          <div className="border-b-2 border-slate-800 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-red-700 text-white text-[8.5px] font-black px-1.5 py-0.5 uppercase">
                {lead.category}
              </span>
              {lead.district && <span className="text-[9.5px] font-bold text-slate-600">• {lead.district}</span>}
              <span className="text-[9px] text-slate-500 ml-auto font-bold">{lead.publishedDateIst}</span>
            </div>
            <h2 className="text-[18px] font-black leading-tight text-slate-950 mb-1.5">
              {lead.title}
            </h2>
            <div className="grid grid-cols-12 gap-3.5">
              <div className="col-span-5">
                <div className="border border-slate-800 p-0.5 bg-white">
                  <img
                    src={getSafeRenderImageUrl(lead.image)}
                    alt={lead.title}
                    className="w-full h-36 object-cover block"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                </div>
                <p className="text-[8.5px] font-bold text-slate-600 mt-0.5">
                  நிருபர்: {lead.author}
                </p>
              </div>
              <div className="col-span-7 text-[10.5px] leading-[1.52] text-slate-900">
                <p className="font-bold text-slate-950 mb-1 text-justify">{lead.summary}</p>
                {(lead.paragraphs || []).slice(0, 2).map((p, idx) => (
                  <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Middle 2-Column Rich Stories */}
        {middlePair.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pb-2.5 mb-2.5 border-b border-slate-400">
            {middlePair.map((art, i) => (
              <div key={art.id || i} className={`bg-white border border-slate-300 p-2.5 flex flex-col overflow-hidden ${i === 1 ? '' : ''}`}>
                <div className="flex items-center justify-between mb-1 border-b border-slate-200 pb-0.5">
                  <span className="bg-slate-900 text-amber-300 text-[8px] font-black px-1.5 py-0.5">{art.category}</span>
                  <span className="text-[8.5px] font-bold text-slate-500">{art.publishedDateIst}</span>
                </div>
                <h3 className="text-[13px] font-black leading-snug text-slate-950 mb-1.5 line-clamp-2">{art.title}</h3>
                <div className="flex gap-2 mb-1.5">
                  <img
                    src={getSafeRenderImageUrl(art.image)}
                    alt={art.title}
                    className="w-24 h-18 object-cover border border-slate-400 flex-shrink-0"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                  <p className="text-[10px] font-bold leading-snug text-slate-800 text-justify line-clamp-4">{art.summary}</p>
                </div>
                <p className="text-[9.8px] leading-[1.45] text-slate-700 text-justify line-clamp-3">
                  {(art.paragraphs || [])[0] || ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 3. Bottom Multi-Column News Digest Strip (up to 4 extra stories per page!) */}
        {bottomDigest.length > 0 && (
          <div className={`grid gap-3 flex-1 overflow-hidden divide-x divide-slate-300 ${bottomDigest.length >= 3 ? 'grid-cols-4' : 'grid-cols-2'}`}>
            {bottomDigest.map((art, i) => (
              <div key={art.id || i} className={`flex flex-col overflow-hidden ${i > 0 ? 'pl-2.5' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-black text-red-700 uppercase">{art.category}</span>
                  <span className="text-[8px] text-slate-500">{art.publishedDateIst}</span>
                </div>
                <img
                  src={getSafeRenderImageUrl(art.image)}
                  alt={art.title}
                  className="w-full h-20 object-cover border border-slate-300 mb-1"
                  onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                />
                <h4 className="text-[11px] font-black leading-tight text-slate-950 mb-1 line-clamp-3">
                  {art.title}
                </h4>
                <p className="text-[9.2px] leading-[1.4] text-slate-700 text-justify line-clamp-4">
                  {art.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-slate-900 pt-1 mt-1.5 flex items-center justify-between text-[9px] font-bold text-slate-700">
        <span>அமேஸ் டைம்ஸ் | {page.section}</span>
        <span>பதிப்பு: {page.editionDateFormatted} ({page.articles?.length || 0} செய்திகள்)</span>
        <span>பக்கம் {page.pageNumber}</span>
      </div>
    </div>
  );
}

// =========================================================================
// MONTHLY MAGAZINE RENDERER:
// 1. FRONT COVER MATCHING UPLOADED SAMPLE FORMAT (BLUE HEADER + RED BAR + FULL COVER PHOTO + STROKED HEADLINE)
// 2. PAGE 2 EDITORIAL MASTHEAD + LEAD FEATURE ("அடுத்த தலைமுறை" TEMPLATE)
// 3. SPREADS ACROSS ALL SECTIONS + PILL FOOTERS
// =========================================================================
function MagazineFooterPill({ pageNumber, monthYearLabel }) {
  return (
    <div className="flex items-center gap-2 pt-2 mt-auto select-none">
      <span className="border-2 border-black rounded-full px-3 py-0.5 text-[10px] font-black bg-white text-black tracking-wide">
        அமேஸ் டைம்ஸ்
      </span>
      <div className="flex-1 h-[1.5px] bg-black" />
      <span className="border-2 border-black px-3 py-0.5 text-[10.5px] font-black bg-white text-black min-w-[32px] text-center">
        {pageNumber}
      </span>
      <div className="flex-1 h-[1.5px] bg-black" />
      <span className="border-2 border-black rounded-full px-3 py-0.5 text-[10px] font-black bg-white text-black">
        {monthYearLabel || 'நவம்பர்-2026'}
      </span>
    </div>
  );
}

function MagazineGlossyCoverPage({ page }) {
  // Split cover headline so the last word(s) pop in vibrant red with thick white outline!
  const fullHeadline = (page.coverHeadline || 'அமேஸ் டைம்ஸ் சிறப்பு மாத இதழ்!').trim();
  const words = fullHeadline.split(/\s+/);
  const splitIdx = words.length > 2 ? words.length - 1 : words.length;
  const mainPart = words.slice(0, splitIdx).join(' ');
  const punchWord = words.length > 2 ? words.slice(splitIdx).join(' ') : '';

  return (
    <div className="w-[794px] h-[1123px] bg-white text-white flex flex-col font-tamil border border-slate-300 shadow-inner overflow-hidden relative">
      {/* 1. TOP ROYAL BLUE MASTHEAD HEADER BAND */}
      <div className="bg-gradient-to-b from-[#072678] via-[#0b359c] to-[#082c88] px-6 pt-3 pb-2 relative z-10 flex flex-col items-center justify-center shadow-lg">
        <div className="flex items-center justify-center gap-4 w-full">
          <span
            className="text-[52px] font-black text-white leading-none tracking-tight"
            style={{
              textShadow: '0 4px 10px rgba(0,0,0,0.6), 2px 2px 0 #041442'
            }}
          >
            அமேஸ்
          </span>

          {/* Centered Emblem Crest */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-500 p-1 shadow-2xl border-2 border-white flex-shrink-0 -mb-2 z-20">
            <img
              src="/Amaze times.jpg"
              alt="Amaze Times Crest"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>

          <span
            className="text-[52px] font-black text-white leading-none tracking-tight"
            style={{
              textShadow: '0 4px 10px rgba(0,0,0,0.6), 2px 2px 0 #041442'
            }}
          >
            டைம்ஸ்
          </span>
        </div>

        <div className="w-full flex justify-end mt-0.5 pr-1">
          <span className="text-[11px] font-bold text-sky-200 tracking-wider uppercase">
            AMAZE TIMES Tamil Monthly
          </span>
        </div>
      </div>

      {/* 2. CRIMSON RED ISSUE METADATA BAR */}
      <div className="bg-[#dc2626] text-white py-1.5 px-4 border-y-2 border-white/60 grid grid-cols-5 text-center text-[10.5px] font-black leading-tight z-10 shadow-md">
        <div>
          <span className="block">மலர் - {page.volumeNo || '05'}</span>
          <span className="text-[9.5px] opacity-95 font-bold">Volume - {page.volumeNo || '05'}</span>
        </div>
        <div>
          <span className="block">இதழ் : {page.issueNo || '11'}</span>
          <span className="text-[9.5px] opacity-95 font-bold">Issue : {page.issueNo || '11'}</span>
        </div>
        <div>
          <span className="block">{page.monthTamil || 'நவம்பர்'} - {page.year || '2026'}</span>
          <span className="text-[9.5px] opacity-95 font-bold">{page.monthEng || 'November'} - {page.year || '2026'}</span>
        </div>
        <div>
          <span className="block">தமிழ் மாத இதழ்</span>
          <span className="text-[9.5px] opacity-95 font-bold">Tamil Monthly</span>
        </div>
        <div>
          <span className="block">{page.priceLabel || 'விலை : ரூ. 22/-'}</span>
          <span className="text-[9.5px] opacity-95 font-bold">Digital Edition</span>
        </div>
      </div>

      {/* 3. FULL-BLEED COVER PHOTOGRAPH WITH STROKED HEADLINE OVERLAY */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden">
        <img
          src={getSafeRenderImageUrl(page.coverImage || page.imageUrl)}
          alt={fullHeadline}
          className="w-full h-full object-cover block"
          onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
        />

        {/* Subtle Dark Vignette at Bottom for Headline Contrast */}
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(5, 10, 25, 0.88) 0%, rgba(5, 10, 25, 0.35) 55%, transparent 100%)'
          }}
        />

        {/* Category Pill Badge */}
        <div className="absolute bottom-8 left-7 right-12 z-20 flex flex-col items-start">
          <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full border-2 border-white shadow-xl mb-3 uppercase tracking-wider">
            ★ {page.coverCategory || 'மாதத்தின் சிறப்புப் பார்வை'}
          </span>

          {/* Bold Outlined White + Fiery Red Punch Cover Headline (Matches Sample Visual Format!) */}
          <h2
            className="text-[38px] font-black leading-[1.22] tracking-tight text-white"
            style={{
              WebkitTextStroke: '7px #071436',
              paintOrder: 'stroke fill',
              textShadow: '0 6px 18px rgba(0,0,0,0.9)'
            }}
          >
            {mainPart}
            {punchWord && (
              <>
                {' '}
                <span
                  className="text-[46px] font-black text-[#dc2626] inline-block mt-1"
                  style={{
                    WebkitTextStroke: '8px #ffffff',
                    paintOrder: 'stroke fill',
                    textShadow: '0 6px 20px rgba(0,0,0,0.95)'
                  }}
                >
                  {punchWord}
                </span>
              </>
            )}
          </h2>

          {/* Brand Web Address Footer Pill on Cover */}
          <div className="mt-4 flex items-center justify-between w-full pt-2 border-t border-white/25 text-xs font-bold text-amber-200">
            <span>www.amazetimes.com</span>
            <span>உண்மையின் தீர்க்க குரல் • {page.monthYearLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyMagazinePage({ page }) {
  // PAGE 1: GLOSSY COVER MATCHING UPLOADED COVER FORMAT
  if (page.template === 'magazine-front-cover') {
    return <MagazineGlossyCoverPage page={page} />;
  }

  // PAGE 2: EDITORIAL MASTHEAD TABLE + LEAD COVER STORY ("அடுத்த தலைமுறை" Page 1 Layout)
  if (page.template === 'magazine-editorial-masthead' || page.template === 'magazine-cover-page1') {
    const m = page.masthead || {};
    const lead = page.leadStory || {};

    return (
      <div className="w-[794px] h-[1123px] bg-white text-black px-8 py-6 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
        <div className="grid grid-cols-12 gap-5 flex-1 overflow-hidden">
          {/* LEFT 4 COLS: Editorial Credits & Masthead Table */}
          <div className="col-span-4 border-2 border-black flex flex-col bg-slate-50/40 overflow-hidden">
            <div className="bg-black text-white py-2.5 px-2 text-center">
              <h1 className="text-2xl font-black tracking-wide leading-tight">
                {m.brandTitle || 'அமேஸ் டைம்ஸ்'}
              </h1>
            </div>

            <div className="border-b-2 border-black py-1.5 px-2 text-center bg-slate-100">
              <p className="text-[11px] font-black text-black leading-tight">
                {m.subtitle || 'புலனாய்வு & செய்தி விழிப்புணர்வு மாத இதழ்'}
              </p>
            </div>

            <div className="flex-1 divide-y divide-black/75 flex flex-col justify-between text-center text-[10.5px] leading-snug">
              <div className="p-2">
                <span className="block text-[9.5px] text-slate-600 font-bold">அச்சிட்டு வெளியிடுபவர்</span>
                <b className="text-black font-black">{m.publisher || 'அமேஸ் டைம்ஸ் மீடியா நெட்வொர்க்'}</b>
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
                <b className="text-black font-bold">{m.districtReporters || 'தமிழ்நாடு அனைத்து மாவட்ட நிருபர்கள்'}</b>
              </div>

              <div className="p-2">
                <span className="block text-[9.5px] text-slate-600 font-bold">வடிவமைப்பு &amp; தணிக்கை</span>
                <b className="text-black font-bold">{m.designer || 'அமேஸ் டைம்ஸ் வடிவமைப்புப் பிரிவு'}</b>
              </div>

              <div className="p-2 bg-slate-100">
                <span className="block text-[9.5px] text-slate-700 font-black mb-0.5">நிர்வாக அலுவலக முகவரி</span>
                <p className="font-bold text-black text-[10px] mb-1">
                  {m.officeAddress || 'சென்னை, தமிழ்நாடு - 600 005.'}
                </p>
                <p className="font-black text-black text-[10.5px]">
                  தொடர்பு எண்: {m.contactPhone || '+91 99426 12398'}
                </p>
                <p className="font-bold text-slate-800 text-[9.5px] break-all">
                  E-mail: {m.contactEmail || 'editor@amazetimes.com'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT 8 COLS: Lead Cover Feature */}
          <div className="col-span-8 flex flex-col overflow-hidden">
            <h2 className="text-[24px] font-black text-center leading-[1.2] text-black mb-3 tracking-tight">
              {lead.title}
            </h2>

            <div className="border-2 border-black p-1 bg-white mb-3.5 shadow-sm">
              <div className="relative">
                <img
                  src={getSafeRenderImageUrl(lead.image)}
                  alt={lead.title}
                  className="w-full h-56 object-cover block"
                  onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                />
                <div className="bg-black text-white text-[10px] font-black px-2.5 py-1 flex items-center justify-between">
                  <span>முதன்மைப் பார்வை: {lead.category || 'சிறப்புச் செய்தி'}</span>
                  <span>{page.monthYearLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 text-[11.5px] leading-[1.66] text-black overflow-hidden">
              {(lead.paragraphs || [lead.summary]).slice(0, 5).map((p, idx) => (
                <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
              ))}
              <div className="text-right font-black text-xs mt-2 pr-2">
                - {lead.author || 'ஆசிரியர்'}
              </div>
            </div>
          </div>
        </div>

        <MagazineFooterPill pageNumber={page.pageNumber} monthYearLabel={page.monthYearLabel} />
      </div>
    );
  }

  // PAGES 3+: Inner Section Spreads & Back Page
  const primary = page.primaryStory;
  const secondary = page.secondaryStory;
  const isBackPage = page.template === 'magazine-back-page';
  const m = page.masthead || {};

  return (
    <div className="w-[794px] h-[1123px] bg-white text-black px-8 py-5 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
      <div className="flex-1 flex flex-col gap-3.5 overflow-hidden">
        {/* Top Section Header Pill */}
        {page.section && (
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 text-[10px] font-black text-slate-700 uppercase tracking-wider">
            <span>📖 பிரிவு: {page.section}</span>
            <span>{page.monthYearLabel}</span>
          </div>
        )}

        {/* PRIMARY TOP FEATURE STORY */}
        {primary && (
          <div className="flex flex-col overflow-hidden">
            <div className="bg-black text-white px-4 py-2 text-center mb-2.5">
              <h2 className="text-[17px] font-black leading-snug tracking-wide">
                {primary.title}
              </h2>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-6 text-[11.2px] leading-[1.62] text-black">
                {(primary.paragraphs || [primary.summary]).slice(0, 3).map((p, idx) => (
                  <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                ))}
              </div>

              <div className="col-span-6 flex flex-col gap-2">
                <div className="border-2 border-black p-0.5 bg-white">
                  <img
                    src={getSafeRenderImageUrl(primary.image)}
                    alt={primary.title}
                    className="w-full h-40 object-cover block"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                  <div className="bg-slate-100 border-t border-black px-2 py-1 text-[9px] font-black flex justify-between">
                    <span>{primary.category}</span>
                    <span>{primary.author}</span>
                  </div>
                </div>
                <div className="text-[11px] leading-[1.6] text-black text-justify">
                  {(primary.paragraphs || []).slice(3, 5).map((p, idx) => (
                    <p key={idx} className="mb-1.5">{p}</p>
                  ))}
                  {!primary.paragraphs?.[3] && primary.summary && (
                    <div className="border-2 border-black bg-amber-50/40 p-2 text-[10px] font-bold italic">
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
          <div className="border-t-2 border-black pt-2.5 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 text-white px-3.5 py-1.5 mb-2">
              <h3 className="text-[14.5px] font-black leading-snug">{secondary.title}</h3>
              <span className="bg-white text-black text-[8.5px] font-black px-2 py-0.5 flex-shrink-0 ml-2">
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
                <div className="border border-black bg-slate-100 p-1 text-[9px] font-black text-center">
                  அமேஸ் டைம்ஸ் சிறப்புத் தொகுப்பு • {secondary.publishedDateIst}
                </div>
              </div>

              <div className="col-span-7 text-[11px] leading-[1.58] text-black overflow-hidden">
                {(secondary.paragraphs || [secondary.summary]).slice(0, 4).map((p, idx) => (
                  <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                ))}
                <div className="text-right font-black text-[10px] mt-1">
                  - {secondary.author}
                </div>
              </div>
            </div>
          </div>
        )}

        {isBackPage && (
          <div className="border-2 border-black px-3 py-1.5 text-[9.5px] font-bold text-center bg-slate-50 mt-auto">
            {m.legalImprint || 'Printed, Published and Owned by Amaze Times Media Network. Chennai - 600 005. Editor: Chief Editorial Board.'}
          </div>
        )}
      </div>

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
