import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Vote,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  BarChart2,
  HelpCircle,
  X
} from 'lucide-react';

export const AdminPollsManager = ({ showToast }) => {
  const [activePoll, setActivePoll] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // New Poll Form
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['ஆம் (Yes)', 'இல்லை (No)', 'கருத்தில்லை (Neutral)']);

  useEffect(() => {
    fetchPollData();
  }, []);

  const fetchPollData = async () => {
    setLoading(true);
    try {
      const res = await api.getActivePollAndQuiz();
      if (res && res.success) {
        setActivePoll(res.poll || null);
        setActiveQuiz(res.quiz || null);
      }
    } catch (err) {
      console.warn('Error fetching poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (options.length >= 6) {
      if (showToast) showToast('அதிகபட்சமாக 6 தெரிவுகள் மட்டுமே சேர்க்கலாம்');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (idx) => {
    if (options.length <= 2) {
      if (showToast) showToast('குறைந்தபட்சம் 2 தெரிவுகள் இருக்க வேண்டும்');
      return;
    }
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    const cleanOptions = options.map(o => o.trim()).filter(Boolean);

    if (!cleanQuestion) {
      if (showToast) showToast('கருத்துக்கணிப்பு கேள்வியை உள்ளிடவும்');
      return;
    }
    if (cleanOptions.length < 2) {
      if (showToast) showToast('குறைந்தபட்சம் 2 தெரிவுகளை நிரப்பவும்');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createPoll({
        question: cleanQuestion,
        options: cleanOptions
      });
      if (res && res.success) {
        if (showToast) showToast('புதிய நேரலை கருத்துக்கணிப்பு வெற்றிகரமாக வெளியிடப்பட்டது!');
        setQuestion('');
        setOptions(['ஆம் (Yes)', 'இல்லை (No)', 'கருத்தில்லை (Neutral)']);
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
        fetchPollData();
      } else {
        throw new Error(res?.message || 'Failed');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'கருத்துக்கணிப்பு உருவாக்குவதில் பிழை');
    } finally {
      setCreating(false);
    }
  };

  const totalVotes = activePoll?.total_votes || 0;

  return (
    <div className="space-y-6 max-w-5xl w-full font-tamil">
      {/* Header Banner */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                வாசகர் கருத்துக் கணிப்பு மேலாண்மை (Polls Manager)
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Manage Live Reader Opinion Polls & View Voting Results (Neon PostgreSQL Database Connected)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchPollData}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>முடிவுகளை புதுப்பி</span>
        </button>
      </div>

      {/* ACTIVE POLL CARD */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              தற்போது இயங்கும் நேரலை கருத்துக்கணிப்பு (Live Active Poll)
            </span>
          </div>

          <div className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs font-black px-3 py-1 rounded-full">
            மொத்த வாக்குகள்: {totalVotes.toLocaleString()}
          </div>
        </div>

        {activePoll ? (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-black text-white leading-relaxed">
              {activePoll.question}
            </h2>

            <div className="space-y-3 pt-1">
              {activePoll.options?.map((opt) => {
                const votes = opt.votes_count || 0;
                const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

                return (
                  <div key={opt.id} className="bg-[#050915] p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <span className="text-slate-200">{opt.option_text}</span>
                      <span className="text-amber-400 font-mono">
                        {votes} வாக்குகள் ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            தற்போது செயலில் கருத்துக்கணிப்பு எதுவும் இல்லை. கீழே புதிய கருத்துக்கணிப்பைத் தொடங்கவும்.
          </div>
        )}
      </div>

      {/* CREATE NEW POLL FORM */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="font-black text-amber-400 text-base flex items-center gap-2 border-b border-slate-800 pb-3">
          <Plus className="w-5 h-5 text-amber-400" />
          <span>புதிய கருத்துக்கணிப்பு துவக்குக (Start New Poll)</span>
        </h3>

        <form onSubmit={handleCreatePoll} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              கருத்துக்கணிப்பு கேள்வி (Poll Question) *
            </label>
            <textarea
              rows="2"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="எ.கா: 2026 தமிழ்நாடு பட்ஜெட்டில் அறிவிக்கப்பட்டுள்ள புதிய தொழில் முதலீடுகள் இளைஞர்களுக்கு வேலைவாய்ப்பை பெருக்குமா?"
              className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl p-3.5 text-white focus:outline-none font-medium leading-relaxed"
            ></textarea>
          </div>

          <div className="space-y-2.5">
            <label className="font-bold text-slate-300 block">
              வாக்களிக்கும் தெரிவுகள் (Options - Minimum 2, Maximum 6) *
            </label>

            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-center font-bold text-amber-400 text-xs">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  required
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`தெரிவு ${idx + 1}`}
                  className="flex-1 bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none font-medium text-xs sm:text-sm"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                    title="நீக்கு"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 pt-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ கூடுதல் தெரிவு சேர் (Add Another Option)</span>
              </button>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Vote className="w-4 h-4" />
              <span>{creating ? 'வெளியிடப்படுகிறது...' : 'புதிய கருத்துக்கணிப்பைத் தொடங்கு (Publish Live Poll)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPollsManager;
