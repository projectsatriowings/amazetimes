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
// DAILY E-NEWSPAPER BROADSHEET RENDERER (FULL NEWS STRUCTURE + LARGE IMAGES + HOROSCOPE)
// =========================================================================
function DailyNewspaperPage({ page, editionName }) {
  const isFront = page.template === 'newspaper-front';
  const isHoroscope = page.template === 'newspaper-horoscope';
  const isKuralKids = page.template === 'newspaper-kural-kids' || page.template === 'newspaper-fun-corner';
  const isPuzzles = page.template === 'newspaper-puzzles';
  const market = page.marketRates || {};

  // SPLIT PAGE A: RICH THIRUKKURAL (2 FULL KURALS + LIFE LESSONS) + PROVERB/QUOTE + EXPANDED KIDS MORAL STORY + 3 SCIENCE FACTS
  if (isKuralKids) {
    const c = page.interactiveCorner || {};
    const kurals = Array.isArray(c.kurals) && c.kurals.length > 0
      ? c.kurals
      : (c.kural ? [c.kural] : []);
    const proverb = c.proverb || {};
    const quote = c.quote || {};
    const story = c.kidsStory || {};
    const storyParas = Array.isArray(story.paragraphs) && story.paragraphs.length > 0
      ? story.paragraphs
      : (story.body ? [story.body] : []);
    const facts = Array.isArray(c.didYouKnowList) && c.didYouKnowList.length > 0
      ? c.didYouKnowList
      : (c.didYouKnow ? [c.didYouKnow] : []);

    return (
      <div className="w-[794px] h-[1123px] bg-[#fdfbf4] text-[#111827] px-6 py-4 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Running Newspaper Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-slate-950 text-white text-xs font-black px-2.5 py-0.5">அமேஸ் டைம்ஸ்</span>
              <span className="text-sm font-black text-amber-800 uppercase tracking-wide">
                📜 திருக்குறள், தமிழ் மரபு &amp; சிறுவர் கதை உலகம்
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap shrink-0">
              <span>பதிப்பு: {page.editionDateFormatted}</span>
              <span className="bg-amber-200 px-2 py-0.5 rounded font-black text-slate-950">பக்கம் {page.pageNumber}</span>
            </div>
          </div>

          {/* 1. TWO DAILY THIRUKKURALS WITH DETAILED MEANING & LIFE LESSON */}
          <section className="bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fffbeb] border-2 border-amber-700 rounded-lg p-3 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-amber-600/40 pb-1">
              <span className="bg-amber-800 text-amber-100 text-[10.5px] font-black px-3 py-0.5 rounded-full">
                📜 இன்றைய திருக்குறள் சிந்தனைகள் (Daily Thirukkural)
              </span>
              <span className="text-[10px] font-bold text-amber-950">உலகப் பொதுமறை • திருவள்ளுவர் அருளியது</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {kurals.slice(0, 2).map((k, idx) => (
                <div key={idx} className="bg-white/95 border border-amber-600/50 rounded-md p-2.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between text-[9.5px] font-black text-amber-900 mb-1.5 border-b border-amber-200 pb-1">
                      <span>அதிகாரம்: {k.adhigaram}</span>
                      <span className="bg-amber-100 px-1.5 py-0.5 rounded">குறள் #{k.number}</span>
                    </div>
                    <div className="border-l-4 border-amber-700 bg-amber-50/70 px-2.5 py-1.5 rounded-r mb-2">
                      <p className="text-[12.8px] font-black text-slate-950 leading-snug">{k.line1}</p>
                      <p className="text-[12.8px] font-black text-slate-950 leading-snug">{k.line2}</p>
                    </div>
                    <p className="text-[10.2px] leading-[1.48] text-slate-900 text-justify mb-1.5">
                      <b className="text-amber-900">விளக்கம்:</b> {k.meaning}
                    </p>
                  </div>
                  {k.lifeLesson && (
                    <div className="bg-slate-900 text-amber-200 px-2 py-1 rounded text-[9.3px] font-bold leading-snug">
                      ✨ வாழ்க்கைப் பாடம்: {k.lifeLesson}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 2. TAMIL PROVERB + INSPIRATIONAL QUOTE STRIP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-rose-50/80 border-2 border-rose-700/60 rounded-lg p-2.5">
              <span className="bg-rose-700 text-white text-[9.5px] font-black px-2 py-0.5 rounded inline-block mb-1">
                💎 இன்றைய தமிழ் பழமொழி
              </span>
              <p className="text-[11.5px] font-black text-rose-950 leading-snug mb-1">{proverb.tamil}</p>
              <p className="text-[9.8px] text-slate-800 leading-snug">{proverb.explanation}</p>
            </div>
            <div className="bg-indigo-50/80 border-2 border-indigo-700/60 rounded-lg p-2.5 flex flex-col justify-between">
              <div>
                <span className="bg-indigo-800 text-amber-200 text-[9.5px] font-black px-2 py-0.5 rounded inline-block mb-1">
                  🌟 இன்றைய பொன்மொழி (Quote of the Day)
                </span>
                <p className="text-[11.8px] font-black text-indigo-950 leading-snug italic">{quote.text}</p>
              </div>
              <p className="text-right text-[10px] font-black text-indigo-800 mt-1">— {quote.author}</p>
            </div>
          </div>

          {/* 3. EXPANDED KIDS MORAL SHORT STORY SECTION */}
          <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-700 rounded-lg p-3.5 shadow-sm flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-600/30 pb-1 mb-2">
                <span className="bg-emerald-700 text-white text-[10.5px] font-black px-3 py-0.5 rounded-full">
                  🧒 சிறுவர் நீதிக் கதை உலகம் (Kids Story Corner)
                </span>
                <span className="text-[10px] font-bold text-emerald-800">குழந்தைகள் &amp; குடும்ப வாசிப்புச் சிறப்பு</span>
              </div>
              <h3 className="text-[17px] font-black text-emerald-950 mb-2 leading-snug">
                ★ {story.title}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-[11px] leading-[1.6] text-slate-900 text-justify">
                <div>
                  {storyParas.slice(0, Math.ceil(storyParas.length / 2)).map((para, idx) => (
                    <DropCapParagraph key={idx} text={para} isFirst={idx === 0} />
                  ))}
                </div>
                <div className="space-y-1.5">
                  {storyParas.slice(Math.ceil(storyParas.length / 2)).map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="bg-emerald-800 text-white px-3 py-1.5 rounded-md text-[10.8px] font-black flex items-center gap-2">
                <span>🌟 கதையின் நீதி:</span>
                <span className="font-bold text-amber-200">{story.moral}</span>
              </div>
              {story.reflection && (
                <div className="bg-emerald-100/90 border border-emerald-400 text-emerald-950 px-3 py-1 rounded-md text-[10px] font-bold">
                  🤔 {story.reflection}
                </div>
              )}
            </div>
          </section>

          {/* 4. THREE "DID YOU KNOW?" SCIENCE & TAMIL HERITAGE FACTS */}
          <section className="bg-sky-50 border-2 border-sky-800/60 rounded-lg p-2.5">
            <div className="text-[10.5px] font-black text-sky-950 mb-1.5 flex items-center justify-between">
              <span>🔬 உங்களுக்குத் தெரியுமா? — இன்றைய அறிவியல் &amp; தமிழ் மரபு அதிசயங்கள்</span>
              <span className="text-[9px] text-sky-700">Did You Know?</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {facts.slice(0, 3).map((fact, idx) => (
                <div key={idx} className="bg-white border border-sky-300 rounded p-2 text-[9.8px] leading-[1.45] text-slate-900 font-semibold text-justify">
                  <span className="text-sky-700 font-black mr-1">#{idx + 1}</span>
                  {fact}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-900 pt-1 mt-1.5 flex items-center justify-between text-[9px] font-bold text-slate-700 whitespace-nowrap flex-nowrap">
          <span className="shrink-0">அமேஸ் டைம்ஸ் | திருக்குறள், தமிழ் மரபு &amp; சிறுவர் உலகம்</span>
          <span className="shrink-0">பதிப்பு: {page.editionDateFormatted}</span>
          <span className="shrink-0">© 2026 Amaze Times • பக்கம் {page.pageNumber}</span>
        </div>
      </div>
    );
  }

  // SPLIT PAGE B: RICH BRAIN GAMES, 6 TAMIL RIDDLES, 2 MATH/LOGIC PUZZLES, 4 WORD GAMES, 5 GK QUIZ, 3 HEALTH TIPS & COMPLETE ANSWERS
  if (isPuzzles) {
    const c = page.interactiveCorner || {};
    const riddles = Array.isArray(c.riddles) ? c.riddles : [];
    const puzzles = Array.isArray(c.puzzles) ? c.puzzles : (c.puzzle ? [c.puzzle] : []);
    const wordGames = Array.isArray(c.wordGames) ? c.wordGames : [];
    const gkQuiz = Array.isArray(c.gkQuiz) ? c.gkQuiz : (c.quiz ? [c.quiz] : []);
    const healthTips = Array.isArray(c.healthTips) ? c.healthTips : (c.healthTip ? [c.healthTip] : []);

    return (
      <div className="w-[794px] h-[1123px] bg-[#fdfbf4] text-[#111827] px-6 py-4 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          {/* Running Newspaper Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-slate-950 text-white text-xs font-black px-2.5 py-0.5">அமேஸ் டைம்ஸ்</span>
              <span className="text-sm font-black text-indigo-800 uppercase tracking-wide">
                🧩 மூளைக்கு வேலை — விடுகதைகள், புதிர்கள் &amp; வினாடி வினா
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap shrink-0">
              <span>பதிப்பு: {page.editionDateFormatted}</span>
              <span className="bg-indigo-200 px-2 py-0.5 rounded font-black text-slate-950">பக்கம் {page.pageNumber}</span>
            </div>
          </div>

          {/* 1. SIX TAMIL RIDDLES (2-Column Balanced Grid) */}
          <section className="bg-white border-2 border-indigo-900/75 rounded-lg p-2 shadow-sm">
            <div className="bg-indigo-900 text-amber-300 text-[10.5px] font-black px-2.5 py-0.5 rounded mb-1.5 flex items-center justify-between">
              <span>🎭 இன்றைய 6 சுவாரசியமான தமிழ் விடுகதைகள் (Tamil Riddles)</span>
              <span className="text-[9px] text-indigo-100">விடைகள் கீழே!</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {riddles.slice(0, 6).map((r, idx) => (
                <div key={idx} className="p-1.5 bg-indigo-50/80 border-l-4 border-indigo-700 rounded-r text-[10px] font-bold text-slate-950 leading-tight">
                  {r.q}
                </div>
              ))}
            </div>
          </section>

          {/* 2. TWO MATH & LOGIC BRAIN PUZZLES + FOUR WORD CLUES */}
          <div className="grid grid-cols-12 gap-2">
            {/* Left 7 Cols: 2 Math & Logic Puzzles */}
            <div className="col-span-7 bg-white border-2 border-rose-800/75 rounded-lg p-2 flex flex-col gap-1.5">
              <div className="bg-rose-700 text-white text-[10px] font-black px-2 py-0.5 rounded inline-block self-start">
                🔢 கணித &amp; தர்க்கப் புதிர்கள் (Math &amp; Logic Teasers)
              </div>
              {puzzles.slice(0, 2).map((pz, idx) => (
                <div key={idx} className="bg-rose-50/70 border border-rose-200 rounded p-1.5">
                  <span className="text-[9px] font-black text-rose-800 block mb-0.5">புதிர் #{idx + 1}: {pz.title}</span>
                  <p className="text-[10px] font-extrabold text-slate-950 leading-tight">{pz.question}</p>
                </div>
              ))}
            </div>

            {/* Right 5 Cols: 4 Tamil Word Games */}
            <div className="col-span-5 bg-white border-2 border-amber-700/75 rounded-lg p-2 flex flex-col justify-between">
              <div>
                <div className="bg-amber-700 text-white text-[10px] font-black px-2 py-0.5 rounded inline-block mb-1.5">
                  🔤 தமிழ் வார்த்தை விளையாட்டு
                </div>
                <div className="space-y-1">
                  {wordGames.slice(0, 4).map((wg, idx) => (
                    <div key={idx} className="bg-amber-50 border border-amber-300 rounded px-1.5 py-1 text-[9.8px] font-bold text-slate-950 leading-tight">
                      {wg.clue}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. FIVE DAILY GK QUIZ QUESTIONS (TNPSC & School Students Special!) */}
          <section className="bg-white border-2 border-purple-800/75 rounded-lg p-2 shadow-sm flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-purple-800 text-amber-200 text-[10.2px] font-black px-2.5 py-0.5 rounded mb-1.5 flex items-center justify-between">
                <span>🎯 இன்றைய பொது அறிவு வினாடி வினா (Daily GK &amp; TNPSC Quiz — 5 கேள்விகள்)</span>
                <span className="text-[8.5px] text-purple-100">மாணவர் சிறப்பு</span>
              </div>
              <div className="space-y-1">
                {gkQuiz.slice(0, 5).map((q, idx) => (
                  <div key={idx} className="bg-purple-50/70 border-l-3 border-purple-700 px-2 py-1 rounded-r text-[10px] font-extrabold text-slate-950 leading-tight">
                    {q.q || q.question}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. THREE DAILY HEALTH & LIFESTYLE TIPS */}
            <div className="mt-1.5 pt-1.5 border-t border-lime-300 bg-lime-50 rounded-md p-1.5 border border-lime-500/50">
              <span className="text-[9.5px] font-black text-lime-900 block mb-0.5">
                🌿 இன்றைய ஆரோக்கியம் &amp; வாழ்வியல் குறிப்புகள் (Daily Health Tips)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {healthTips.slice(0, 3).map((tip, idx) => (
                  <div key={idx} className="bg-white border border-lime-300 rounded p-1 text-[9px] leading-tight text-slate-800 font-semibold">
                    • {tip}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. COMPLETE ANSWERS KEY BOX AT BOTTOM */}
          <div className="bg-slate-900 text-white rounded-lg px-3 py-1.5 border-2 border-amber-400">
            <div className="text-[9px] font-black text-amber-300 uppercase tracking-wider mb-0.5">
              ✅ இன்றைய முழுமையான விடைகள் பெட்டி (Complete Answers Key):
            </div>
            <div className="space-y-0.5 text-[8.5px] text-slate-100 leading-tight">
              <div>
                <b className="text-amber-300">விடுகதைகள்:</b>{' '}
                {riddles.map((r, i) => `(${i + 1}) ${r.a}`).join(' • ')}
              </div>
              <div>
                <b className="text-rose-300">புதிர்கள்:</b>{' '}
                {puzzles.map((p, i) => `(#${i + 1}) ${p.answer}`).join(' | ')}{' '}
                <b className="text-yellow-300 ml-1">வார்த்தை:</b>{' '}
                {wordGames.map((w, i) => `(${i + 1}) ${w.answer}`).join(', ')}
              </div>
              <div>
                <b className="text-emerald-300">பொது அறிவு வினாடி வினா:</b>{' '}
                {gkQuiz.map((q, i) => `(${i + 1}) ${q.a || q.answer}`).join(' • ')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-900 pt-1 mt-1.5 flex items-center justify-between text-[9px] font-bold text-slate-700 whitespace-nowrap flex-nowrap">
          <span className="shrink-0">அமேஸ் டைம்ஸ் | மூளைக்கு வேலை — புதிர்கள் &amp; பொது அறிவு</span>
          <span className="shrink-0">பதிப்பு: {page.editionDateFormatted}</span>
          <span className="shrink-0">© 2026 Amaze Times • பக்கம் {page.pageNumber}</span>
        </div>
      </div>
    );
  }

  // DEDICATED DAILY HOROSCOPE & PANCHANGAM PAGE (இன்றைய ராசிபலன் & பஞ்சாங்கம்)
  if (isHoroscope) {
    const signs = Array.isArray(page.horoscopeSigns) ? page.horoscopeSigns : [];
    const p = page.panchangam || {};

    return (
      <div className="w-[794px] h-[1123px] bg-[#fdfbf4] text-[#111827] px-6 py-4 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Running Newspaper Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-slate-950 text-white text-xs font-black px-2.5 py-0.5">அமேஸ் டைம்ஸ்</span>
              <span className="text-sm font-black text-amber-800 uppercase tracking-wide">
                ✨ இன்றைய ராசிபலன் &amp; ஆன்மிகப் பஞ்சாங்கம்
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap shrink-0">
              <span>பதிப்பு: {page.editionDateFormatted}</span>
              <span className="bg-amber-200 px-2 py-0.5 rounded font-black text-slate-950">பக்கம் {page.pageNumber}</span>
            </div>
          </div>

          {/* Traditional Tamil Almanac Banner */}
          <div className="bg-gradient-to-r from-[#7c1d1d] via-[#991b1b] to-[#7c1d1d] text-white px-4 py-2.5 rounded-md border-2 border-amber-500/80 mb-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[19px] font-black tracking-wide leading-tight text-amber-300 mb-1">
                  தினசரி 12 ராசி பலன்கள் (Daily Horoscope)
                </h2>
                <p className="text-[10.5px] text-amber-100 font-bold leading-normal">
                  {p.tamilDate || 'இன்றைய சுப தினப் பஞ்சாங்கம் & நட்சத்திரப் பலன்கள்'} • தேதி: {page.editionDateFormatted}
                </p>
              </div>
              <div className="text-right text-[9.5px] font-bold bg-black/25 px-2.5 py-1 rounded border border-amber-400/40">
                <div>சூலம்: {p.soolam || 'வடக்கு • பரிகாரம்: பால்'}</div>
              </div>
            </div>

            {/* Panchangam Timings Strip */}
            <div className="grid grid-cols-4 gap-1.5 mt-2 pt-2 border-t border-amber-400/35 text-[9.5px] text-center">
              <div className="bg-black/20 rounded px-1.5 py-1">
                <span className="block text-amber-300 text-[8.5px] font-black">நல்ல நேரம்</span>
                <b className="text-white">{p.nallaNeram || 'காலை 09:30 – 10:30'}</b>
              </div>
              <div className="bg-black/20 rounded px-1.5 py-1">
                <span className="block text-amber-300 text-[8.5px] font-black">ராகு காலம்</span>
                <b className="text-white">{p.rahuKalam || 'மதியம் 12:00 – 01:30'}</b>
              </div>
              <div className="bg-black/20 rounded px-1.5 py-1">
                <span className="block text-amber-300 text-[8.5px] font-black">எமகண்டம்</span>
                <b className="text-white">{p.yemagandam || 'காலை 07:30 – 09:00'}</b>
              </div>
              <div className="bg-black/20 rounded px-1.5 py-1">
                <span className="block text-amber-300 text-[8.5px] font-black">குளிகை</span>
                <b className="text-white">{p.kuligai || 'காலை 10:30 – 12:00'}</b>
              </div>
            </div>
          </div>

          {/* 12 Zodiac Signs Grid (3 columns x 4 rows) */}
          <div className="grid grid-cols-3 gap-2.5 flex-1 overflow-hidden">
            {signs.slice(0, 12).map((s, idx) => (
              <div
                key={s.id || s.sign_code || idx}
                className="bg-white border-2 border-amber-900/35 rounded-md p-2.5 flex flex-col justify-between shadow-sm overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-amber-200 pb-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-red-800 text-amber-300 flex items-center justify-center text-sm font-black shadow-sm">
                        {s.glyph || '★'}
                      </span>
                      <div>
                        <h3 className="text-[13px] font-black text-slate-950 leading-none">{s.name_ta}</h3>
                        <span className="text-[8.5px] font-bold text-slate-500 uppercase">{s.name_en}</span>
                      </div>
                    </div>
                    {s.ruling_planet && (
                      <span className="bg-amber-100 text-amber-950 text-[8.5px] font-black px-1.5 py-0.5 rounded border border-amber-300">
                        {s.ruling_planet}
                      </span>
                    )}
                  </div>

                  <p className="text-[10.2px] leading-[1.46] text-slate-900 text-justify font-medium line-clamp-5">
                    {s.prediction_text}
                  </p>
                </div>

                <div className="mt-1.5 pt-1 border-t border-slate-200 flex items-center justify-between text-[8.8px] font-bold text-slate-700 bg-amber-50/70 -mx-2.5 -mb-2.5 px-2.5 py-1">
                  <span>🎨 நிறம்: <b className="text-red-800">{s.lucky_color || 'மஞ்சள்'}</b></span>
                  <span>🔢 எண்: <b className="text-blue-900">{s.lucky_number || '7'}</b></span>
                  <span>🧭 {s.lucky_direction || 'கிழக்கு'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-900 pt-1 mt-2 flex items-center justify-between text-[9px] font-bold text-slate-700 whitespace-nowrap flex-nowrap">
          <span className="shrink-0">அமேஸ் டைம்ஸ் | தினசரி ராசிபலன் &amp; ஆன்மிகப் பகுதி</span>
          <span className="shrink-0">பதிப்பு: {page.editionDateFormatted}</span>
          <span className="shrink-0">© 2026 Amaze Times • பக்கம் {page.pageNumber}</span>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-center gap-3 whitespace-nowrap flex-nowrap">
              <div className="w-8 h-8 bg-red-600 text-white font-black text-lg flex items-center justify-center rounded-md border-2 border-slate-950 shadow shrink-0">
                அ
              </div>
              <h1 className="text-[28px] font-black tracking-tight text-slate-950 leading-none">
                அமேஸ் டைம்ஸ் <span className="text-red-600 text-base font-black font-sans uppercase tracking-widest">| AMAZE TIMES</span>
              </h1>
            </div>
            <p className="text-[9.5px] font-bold text-slate-700 mt-1 tracking-wide">
              உண்மையின் தீர்க்க குரல் • தமிழ்நாடு, அரசியல், தேசியம், வணிகம், கல்வி, விளையாட்டு, சினிமா &amp; தினசரி ராசிபலன்
            </p>
          </div>

          {/* Issue Metadata Bar */}
          <div className="flex items-center justify-between text-[10px] font-black border-b-2 border-slate-950 py-1.5 px-2 bg-slate-100 whitespace-nowrap flex-nowrap">
            <span className="shrink-0">📅 பதிப்புத் தேதி: {page.editionDateFormatted}</span>
            <span className="text-red-700 shrink-0">
              📰 செய்தி நாள்: {page.sourceNewsDateFormatted}
            </span>
            <span className="shrink-0">பக்கம் {page.pageNumber} • இலவச டிஜிட்டல் பதிப்பு</span>
          </div>

          {/* Lead Content Grid (12 Cols) */}
          <div className="grid grid-cols-12 gap-3.5 pt-2.5 flex-1 overflow-hidden">
            {/* Left/Main 8 Cols: Full Lead Story with LARGE zero-crop photo */}
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

                  <h2 className="text-[20px] font-black leading-[1.2] text-slate-950 mb-2">
                    {lead.title}
                  </h2>

                  {/* LARGE FULL-WIDTH ZERO-CROP LEAD PHOTO */}
                  <div className="border-2 border-slate-900 p-1 bg-slate-100 mb-2">
                    <img
                      src={getSafeRenderImageUrl(lead.image)}
                      alt={lead.title}
                      className="w-full h-[195px] object-contain bg-slate-100 block mx-auto"
                      onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                    />
                    <div className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 mt-0.5 flex items-center justify-between">
                      <span>நிருபர்: {lead.author}</span>
                      <span>{lead.publishedDateIst}</span>
                    </div>
                  </div>

                  <div className="columns-2 gap-3.5 text-[10.5px] leading-[1.55] text-slate-900 flex-1 overflow-hidden">
                    {(lead.paragraphs?.length ? lead.paragraphs : [lead.summary]).slice(0, 4).map((p, idx) => (
                      <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">செய்திகள் ஏற்றப்படுகின்றன...</div>
              )}
            </div>

            {/* Right Sidebar 4 Cols: Market Box + Briefs */}
            <div className="col-span-4 flex flex-col gap-2 overflow-hidden">
              <div className="border-2 border-slate-900 bg-amber-50/70 p-2">
                <div className="bg-slate-950 text-amber-300 text-center text-[9.5px] font-black py-0.5 mb-1 uppercase tracking-wide flex items-center justify-between px-2">
                  <span>சந்தை &amp; விலை நிலவரம்</span>
                  <span className="text-[8px] text-emerald-300">{market.updatedDate || page.editionDateFormatted}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8px]">தங்கம் 22K (1கி)</span>
                    <b className="text-slate-950">{market.gold22k || '₹13,135 / கி'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8px]">வெள்ளி (1கி)</span>
                    <b className="text-slate-950">{market.silver || '₹105 / கி'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8px]">பெட்ரோல்</span>
                    <b className="text-slate-950">{market.petrol || '₹100.80 / லி'}</b>
                  </div>
                  <div className="bg-white border border-slate-300 p-1">
                    <span className="text-slate-500 block text-[8px]">டீசல்</span>
                    <b className="text-slate-950">{market.diesel || '₹92.39 / லி'}</b>
                  </div>
                </div>
              </div>

              <div className="border border-slate-800 p-2 bg-white flex-1 overflow-hidden flex flex-col">
                <div className="border-b-2 border-red-600 pb-0.5 mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-black text-red-700">முக்கியச் செய்தித் துளிகள்</span>
                  <span className="text-[8.5px] font-bold text-slate-500">உடனுக்குடன்</span>
                </div>
                <div className="space-y-2 divide-y divide-slate-200 overflow-hidden">
                  {briefs.slice(0, 5).map((b, i) => (
                    <div key={b.id || i} className={i > 0 ? 'pt-1.5' : ''}>
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-black text-blue-800 uppercase">{b.category}</span>
                        <span className="text-[8px] text-slate-400">{b.publishedDateIst}</span>
                      </div>
                      <h4 className="text-[10.8px] font-black leading-snug text-slate-950 line-clamp-2">{b.title}</h4>
                      <p className="text-[9.5px] leading-snug text-slate-700 line-clamp-2 text-justify">{b.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Secondary 2-Column FULL News Strip with Bigger Images */}
          {secondary.length > 0 && (
            <div className="border-t-2 border-slate-950 mt-2.5 pt-2.5 grid grid-cols-2 gap-4 divide-x divide-slate-400">
              {secondary.slice(0, 2).map((art, i) => (
                <div key={art.id || i} className={i > 0 ? 'pl-4' : ''}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-slate-900 text-amber-300 text-[8.5px] font-black px-2 py-0.5">
                      {art.category}
                    </span>
                    <span className="text-[8.5px] text-slate-500 font-bold">{art.publishedDateIst}</span>
                  </div>
                  <h3 className="text-[13px] font-black leading-snug text-slate-950 mb-1.5 line-clamp-2">
                    {art.title}
                  </h3>
                  <div className="grid grid-cols-12 gap-2.5 items-start">
                    <div className="col-span-5 border border-slate-500 p-0.5 bg-slate-100">
                      <img
                        src={getSafeRenderImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-[118px] object-contain bg-slate-100 block"
                        onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                      />
                    </div>
                    <p className="col-span-7 text-[10px] leading-[1.45] text-slate-800 text-justify line-clamp-6">
                      {art.summary || (art.paragraphs || [])[0] || ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-900 pt-1 mt-1.5 flex items-center justify-between text-[9px] font-bold text-slate-700 whitespace-nowrap flex-nowrap">
          <span className="shrink-0">அமேஸ் டைம்ஸ் (Amaze Times Daily E-Paper)</span>
          <span className="shrink-0">பதிப்பு: {page.editionDateFormatted} • இன்றைய ராசிபலன் உள்ளே!</span>
          <span className="shrink-0">© 2026 Amaze Times • பக்கம் {page.pageNumber}</span>
        </div>
      </div>
    );
  }

  // INNER BROADSHEET PAGES: AUTHENTIC FULL-NEWS STRUCTURE (2 Full Stories Per Page + Large Crisp Zero-Crop Images!)
  const storyOne = page.leadArticle || (page.articles || [])[0];
  const storyTwo = page.secondaryArticle || (page.articles || [])[1] || null;

  return (
    <div className="w-[794px] h-[1123px] bg-[#fdfcf7] text-[#111827] px-7 py-4 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Running Newspaper Broadsheet Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-white text-xs font-black px-2.5 py-0.5">அமேஸ் டைம்ஸ்</span>
            <span className="text-sm font-black text-red-700 uppercase tracking-wide">{page.section}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-700 flex items-center gap-3 whitespace-nowrap shrink-0">
            <span>பதிப்பு: {page.editionDateFormatted}</span>
            <span className="bg-slate-200 px-2 py-0.5 rounded font-black text-slate-950">பக்கம் {page.pageNumber}</span>
          </div>
        </div>

        {/* STORY 1: TOP FULL BROADSHEET NEWS ARTICLE WITH LARGE CRISP PHOTO */}
        {storyOne && (
          <article className={`flex flex-col overflow-hidden ${storyTwo ? 'border-b-2 border-slate-900 pb-2.5' : 'flex-1'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-700 text-white text-[9px] font-black px-2 py-0.5 uppercase">
                {storyOne.category}
              </span>
              {storyOne.district && <span className="text-[9.5px] font-bold text-slate-600">📍 {storyOne.district}</span>}
              <span className="text-[9.5px] font-bold text-slate-600 ml-auto whitespace-nowrap">
                நிருபர்: {storyOne.author} • {storyOne.publishedDateIst}
              </span>
            </div>

            <h2 className="text-[18px] font-black leading-[1.22] text-slate-950 mb-1.5">
              {storyOne.title}
            </h2>

            <div className="grid grid-cols-12 gap-3.5 items-start">
              {/* Large Prominent Zero-Crop Editorial Photo (6 Cols!) */}
              <div className="col-span-6">
                <div className="border-2 border-slate-900 p-1 bg-slate-100 shadow-sm">
                  <img
                    src={getSafeRenderImageUrl(storyOne.image)}
                    alt={storyOne.title}
                    className={`w-full ${storyTwo ? 'h-[165px]' : 'h-[280px]'} object-contain bg-slate-100 block mx-auto`}
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                </div>
                {storyOne.subtitle && (
                  <p className="text-[9.5px] font-bold text-slate-700 bg-slate-100 border-x border-b border-slate-400 px-2 py-0.5 leading-snug">
                    {storyOne.subtitle}
                  </p>
                )}
              </div>

              {/* Lead Paragraphs beside photo */}
              <div className="col-span-6 text-[10.5px] leading-[1.52] text-slate-900 overflow-hidden">
                {storyOne.summary && (
                  <p className="font-bold text-slate-950 bg-amber-50/70 border-l-3 border-red-700 pl-2 py-1 mb-1.5 text-[10.5px] leading-snug text-justify">
                    {storyOne.summary}
                  </p>
                )}
                {(storyOne.paragraphs || []).slice(0, 2).map((p, idx) => (
                  <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                ))}
              </div>
            </div>

            {/* Continuation Full Broadsheet 2-Column Body */}
            {(storyOne.paragraphs || []).length > 2 && (
              <div className="grid grid-cols-2 gap-3.5 text-[10.5px] leading-[1.52] text-slate-900 mt-1.5 overflow-hidden">
                <div>
                  {(storyOne.paragraphs || []).slice(2, 3).map((p, idx) => (
                    <p key={idx} className="text-justify">{p}</p>
                  ))}
                </div>
                <div>
                  {(storyOne.paragraphs || []).slice(3, 4).map((p, idx) => (
                    <p key={idx} className="text-justify">{p}</p>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}

        {/* STORY 2: BOTTOM FULL BROADSHEET NEWS ARTICLE WITH LARGE CRISP PHOTO */}
        {storyTwo && (
          <article className="flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-slate-900 text-amber-300 text-[9px] font-black px-2 py-0.5 uppercase">
                  {storyTwo.category}
                </span>
                {storyTwo.district && <span className="text-[9.5px] font-bold text-slate-600">📍 {storyTwo.district}</span>}
                <span className="text-[9.5px] font-bold text-slate-600 ml-auto whitespace-nowrap">
                  நிருபர்: {storyTwo.author} • {storyTwo.publishedDateIst}
                </span>
              </div>

              <h3 className="text-[17px] font-black leading-[1.24] text-slate-950 mb-1.5">
                {storyTwo.title}
              </h3>

              <div className="grid grid-cols-12 gap-3.5 items-start overflow-hidden">
                {/* Full Text Left 6 Cols */}
                <div className="col-span-6 text-[10.5px] leading-[1.52] text-slate-900 overflow-hidden space-y-1">
                  {(storyTwo.paragraphs?.length ? storyTwo.paragraphs : [storyTwo.summary]).slice(0, 3).map((p, idx) => (
                    <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                  ))}
                </div>

                {/* Large Prominent Zero-Crop Editorial Photo Right 6 Cols */}
                <div className="col-span-6 flex flex-col gap-1.5 overflow-hidden">
                  <div className="border-2 border-slate-900 p-1 bg-slate-100 shadow-sm">
                    <img
                      src={getSafeRenderImageUrl(storyTwo.image)}
                      alt={storyTwo.title}
                      className="w-full h-[155px] object-contain bg-slate-100 block mx-auto"
                      onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                    />
                  </div>
                  <div className="text-[10.5px] leading-[1.52] text-slate-900 text-justify overflow-hidden space-y-1">
                    {(storyTwo.paragraphs || []).slice(3, 5).map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                    {!(storyTwo.paragraphs || [])[3] && storyTwo.summary && (
                      <p className="font-bold text-slate-800 bg-slate-100 border-l-3 border-slate-900 pl-2 py-0.5 text-[10px]">
                        {storyTwo.summary}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-slate-900 pt-1 mt-1.5 flex items-center justify-between text-[9px] font-bold text-slate-700 whitespace-nowrap flex-nowrap">
        <span className="shrink-0">அமேஸ் டைம்ஸ் | {page.section}</span>
        <span className="shrink-0">பதிப்பு: {page.editionDateFormatted} (முழு செய்தி வடிவம்)</span>
        <span className="shrink-0">பக்கம் {page.pageNumber}</span>
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

            <div className="border-2 border-black p-1 bg-slate-100 mb-3 shadow-sm">
              <div className="relative">
                <img
                  src={getSafeRenderImageUrl(lead.image)}
                  alt={lead.title}
                  className="w-full h-[265px] object-contain bg-slate-100 block mx-auto"
                  onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                />
                <div className="bg-black text-white text-[10px] font-black px-2.5 py-1 flex items-center justify-between">
                  <span>முதன்மைப் பார்வை: {lead.category || 'சிறப்புச் செய்தி'}</span>
                  <span>{page.monthYearLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 text-[11.2px] leading-[1.62] text-black overflow-hidden">
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

  // PAGES 3+: Inner Section Spreads & Back Page (LARGE ZERO-CROP IMAGES + FULL ARTICLE FLOW)
  const primary = page.primaryStory;
  const secondary = page.secondaryStory;
  const isBackPage = page.template === 'magazine-back-page';
  const m = page.masthead || {};

  return (
    <div className="w-[794px] h-[1123px] bg-white text-black px-7 py-5 flex flex-col justify-between font-tamil border border-slate-300 shadow-inner overflow-hidden">
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
          <div className={`flex flex-col overflow-hidden ${!secondary ? 'flex-1' : ''}`}>
            <div className="bg-black text-white px-4 py-2 text-center mb-2.5">
              <h2 className="text-[17px] font-black leading-snug tracking-wide">
                {primary.title}
              </h2>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-5 text-[11px] leading-[1.6] text-black overflow-hidden">
                {(primary.paragraphs || [primary.summary]).slice(0, 3).map((p, idx) => (
                  <DropCapParagraph key={idx} text={p} isFirst={idx === 0} />
                ))}
              </div>

              <div className="col-span-7 flex flex-col gap-2">
                <div className="border-2 border-black p-1 bg-slate-100 shadow-sm">
                  <img
                    src={getSafeRenderImageUrl(primary.image)}
                    alt={primary.title}
                    className={`w-full ${secondary ? 'h-[195px]' : 'h-[330px]'} object-contain bg-slate-100 block mx-auto`}
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                  <div className="bg-slate-900 text-white border-t border-black px-2.5 py-1 text-[9.5px] font-black flex justify-between mt-0.5">
                    <span>{primary.category}</span>
                    <span>{primary.author}</span>
                  </div>
                </div>
                <div className="text-[10.8px] leading-[1.58] text-black text-justify">
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
              <div className="col-span-6">
                <div className="border-2 border-black p-1 bg-slate-100 mb-1.5 shadow-sm">
                  <img
                    src={getSafeRenderImageUrl(secondary.image)}
                    alt={secondary.title}
                    className="w-full h-[175px] object-contain bg-slate-100 block mx-auto"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                </div>
                <div className="border border-black bg-slate-100 p-1 text-[9px] font-black text-center">
                  அமேஸ் டைம்ஸ் சிறப்புத் தொகுப்பு • {secondary.publishedDateIst}
                </div>
              </div>

              <div className="col-span-6 text-[10.8px] leading-[1.56] text-black overflow-hidden">
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
