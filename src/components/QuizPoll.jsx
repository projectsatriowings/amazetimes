import React, { useState } from 'react';

export default function QuizPoll({ onToast }) {
  const [pollVoted, setPollVoted] = useState(false);
  const [votedPercent, setVotedPercent] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);

  const handleVote = (percent) => {
    setPollVoted(true);
    setVotedPercent(percent);
    onToast('வாக்களித்ததற்கு நன்றி!', 'check_circle');
  };

  const handleQuiz = (isCorrect) => {
    setQuizAnswered(true);
    setQuizCorrect(isCorrect);
    if (isCorrect) {
      onToast('சரியான விடை! +10 மதிப்பெண்கள்.', 'stars');
    } else {
      onToast('தவறான விடை. மீண்டும் முயற்சிக்கவும்.', 'info');
    }
  };

  return (
    <div class="space-y-4">
      {/* Daily Quiz */}
      <div class="bg-white dark:bg-[#0D1424] rounded-2xl p-4 shadow-sm border border-slate-300 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 class="font-subtitle font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-amber-400">quiz</span>
            <span>தினசரி செய்தி வினாடி வினா</span>
          </h3>
          <span class="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-subtitle">QUIZ</span>
        </div>

        {!quizAnswered ? (
          <div class="space-y-2.5 text-xs">
            <p class="font-title font-bold text-slate-900 dark:text-slate-100">
              கேள்வி: 2025-26 தமிழக பட்ஜெட்டில் உயர்கல்வி மற்றும் பாசன திட்டங்களுக்கு எவ்வளவு நிதி ஒதுக்கீடு செய்யப்பட்டுள்ளது?
            </p>
            <div class="space-y-1.5 font-subtitle font-semibold">
              <button
                onClick={() => handleQuiz(true)}
                class="w-full text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white transition-colors"
              >
                அ) ₹44,000 கோடி (சரியான விடை)
              </button>
              <button
                onClick={() => handleQuiz(false)}
                class="w-full text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white transition-colors"
              >
                ஆ) ₹20,000 கோடி
              </button>
              <button
                onClick={() => handleQuiz(false)}
                class="w-full text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white transition-colors"
              >
                இ) ₹10,000 கோடி
              </button>
            </div>
          </div>
        ) : (
          <div className={quizCorrect ? "bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl text-center text-xs font-bold text-emerald-300 space-y-1 font-subtitle" : "bg-red-950/80 border border-red-500/50 p-3 rounded-xl text-center text-xs font-bold text-red-300 space-y-1 font-subtitle"}>
            <span className="material-symbols-outlined text-[24px]">
              {quizCorrect ? 'stars' : 'help'}
            </span>
            <p>{quizCorrect ? 'சரி! சரியான விடை: ₹44,000 கோடி.' : 'தவறான விடை! சரியான விடை: ₹44,000 கோடி.'}</p>
          </div>
        )}
      </div>

      {/* Community Poll */}
      <div class="bg-white dark:bg-[#0D1424] rounded-2xl p-4 shadow-sm border border-slate-300 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 class="font-subtitle font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-brand-red">how_to_vote</span>
            <span>மக்களின் கருத்துக்கணிப்பு</span>
          </h3>
          <span class="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-subtitle">POLL</span>
        </div>

        {!pollVoted ? (
          <div class="space-y-2 text-xs">
            <p class="font-title font-bold text-slate-900 dark:text-slate-100">
              தமிழக பட்ஜெட்டில் உள்கட்டமைப்பு பணிகளுக்கு அளிக்கப்பட்ட முக்கியத்துவம் போதுமானதா?
            </p>
            <div class="space-y-1.5 font-subtitle font-semibold">
              <button
                onClick={() => handleVote(82)}
                class="w-full text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white transition-colors flex justify-between"
              >
                <span>ஆம், மிகவும் சிறப்பானது</span>
                <span class="text-emerald-500 font-bold">82%</span>
              </button>
              <button
                onClick={() => handleVote(18)}
                class="w-full text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white transition-colors flex justify-between"
              >
                <span>இல்லை, இன்னும் மேம்படுத்தலாம்</span>
                <span class="text-red-500 font-bold">18%</span>
              </button>
            </div>
          </div>
        ) : (
          <div class="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl text-center text-xs font-subtitle font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[20px]">check_circle</span>
            <span>வாக்கு பதிவானது! (தேர்ந்தெடுக்கப்பட்ட வாக்கு: {votedPercent}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
