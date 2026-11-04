import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { defaultCompetitionsData } from '../data/competitionsData';
import { api } from '../services/api';
import {
  Trophy,
  Award,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  X,
  Send,
  FileText,
  Mail,
  Phone,
  BookOpen,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const CompetitionsPage = ({ onNavigate }) => {
  const { competitionsData, showToast } = useApp();
  const list = (competitionsData && competitionsData.length > 0) ? competitionsData : defaultCompetitionsData;

  const [activeTab, setActiveTab] = useState('all');
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    participantName: '',
    email: '',
    phone: '',
    institution: '',
    entryTitle: '',
    entryContent: '',
    entryUrl: ''
  });

  const filterTabs = [
    { id: 'all', label: 'அனைத்து போட்டிகள்', count: list.length },
    { id: 'poetry', label: 'கவிதைப் போட்டி', count: list.filter(c => c.type === 'poetry').length },
    { id: 'essay', label: 'சிறுகதை & கட்டுரை', count: list.filter(c => c.type === 'essay').length },
    { id: 'quiz', label: 'வினாடி வினா', count: list.filter(c => c.type === 'quiz').length },
    { id: 'art', label: 'புகைப்படம் & ஓவியம்', count: list.filter(c => c.type === 'art').length }
  ];

  const filteredCompetitions = list.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const handleOpenApply = (comp) => {
    setSelectedCompetition(comp);
    setApplySuccess(false);
    setShowApplyModal(true);
  };

  const handleOpenDetails = (comp) => {
    setSelectedCompetition(comp);
    setShowDetailsModal(true);
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    if (!formData.participantName || !formData.phone || !formData.entryTitle) {
      if (showToast) showToast('தயவுசெய்து உங்கள் பெயர், தொலைபேசி மற்றும் தலைப்பை நிரப்பவும்');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save entry to reader_submissions in DB
      let currentSubmissions = [];
      try {
        const res = await api.getContent('reader_submissions');
        if (res && res.found && Array.isArray(res.data)) {
          currentSubmissions = res.data;
        }
      } catch (_) {}

      const newSubmission = {
        id: `comp-sub-${Date.now()}`,
        type: 'competition',
        competitionId: selectedCompetition?.id,
        competitionTitle: selectedCompetition?.title,
        authorName: formData.participantName,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        title: formData.entryTitle,
        content: formData.entryContent || formData.entryUrl,
        entryUrl: formData.entryUrl,
        status: 'pending',
        createdAt: new Date().toLocaleString('ta-IN')
      };

      const updated = [newSubmission, ...currentSubmissions];
      await api.saveContent('reader_submissions', updated);

      setApplySuccess(true);
      if (showToast) showToast('உங்கள் பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! வாழ்த்துகள்!');
      setTimeout(() => {
        setFormData({
          participantName: '',
          email: '',
          phone: '',
          institution: '',
          entryTitle: '',
          entryContent: '',
          entryUrl: ''
        });
        setIsSubmitting(false);
        setShowApplyModal(false);
      }, 2500);
    } catch (err) {
      console.error('Error submitting competition entry:', err);
      if (showToast) showToast('பதிவு செய்வதில் சிறு பிழை. மீண்டும் முயற்சிக்கவும்.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1380px] mx-auto py-4 px-3 sm:px-6 space-y-8 font-tamil text-slate-100">
      {/* 1. HERO MASTHEAD */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0c1429] via-[#1a1c38] to-[#0f2838] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none select-none text-[220px] font-black text-amber-400">
          🏆
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>மாநில அளவிலான திறமைத் திருவிழா 2026</span>
            </span>
            <span className="bg-red-600/90 text-white font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>மொத்தப் பரிசுத்தொகை ₹2,50,000+</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            அமேஸ் டைம்ஸ் மாணவர் & வாசகர் போட்டிகள் அரங்கம்
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            கவிதை, சிறுகதை, கட்டுரை, வினாடி வினா மற்றும் புகைப்படக் கலை! உங்கள் படைப்பாற்றலை வெளிப்படுத்தி மாநில அளவிலான ரொக்கப் பரிசுகள், வெற்றிக் கோப்பைகள் மற்றும் சான்றிதழ்களை வெல்லுங்கள்.
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-amber-300 pt-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> நேரடி இணையவழி விண்ணப்பம்
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <Award className="w-4 h-4 text-amber-400" /> அரசு & முன்னணி எழுத்தாளர்கள் நடுவர் குழு
            </span>
          </div>
        </div>
      </section>

      {/* 2. FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. COMPETITION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetitions.map((item) => (
          <div
            key={item.id}
            className="group bg-[#0b1224] rounded-3xl border border-slate-800 hover:border-amber-500/60 overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              {/* Card Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1224] via-transparent to-transparent" />
                
                {/* Prize Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-lg flex items-center gap-1 border border-yellow-300">
                  <Trophy className="w-3.5 h-3.5 text-slate-950" />
                  <span>{item.prizeMoney}</span>
                </div>

                {/* Organizer pill */}
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                  {item.organizer}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-3">
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {item.summary || item.details}
                </p>

                {/* Meta details */}
                <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> தகுதி:
                    </span>
                    <strong className="text-white truncate max-w-[180px]">{item.eligibility}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" /> கடைசி நாள்:
                    </span>
                    <strong className="text-rose-400">{item.deadline}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-5 sm:p-6 pt-0 flex items-center gap-2">
              <button
                onClick={() => handleOpenDetails(item)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>விதிமுறைகள்</span>
              </button>
              <button
                onClick={() => handleOpenApply(item)}
                className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-red-600/30 cursor-pointer"
              >
                <span>விண்ணப்பி</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. DETAILS / GUIDELINES MODAL */}
      {showDetailsModal && selectedCompetition && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0b1224] border-2 border-amber-500/50 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-amber-400 text-base sm:text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                போட்டி விதிமுறைகள் & வழிகாட்டுதல்
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <h4 className="text-base font-black text-white">{selectedCompetition.title}</h4>
              <p className="text-slate-300 leading-relaxed">{selectedCompetition.summary}</p>

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                <div><strong className="text-amber-400">பரிசு விபரம்:</strong> {selectedCompetition.prizeDetails || selectedCompetition.prizeMoney}</div>
                <div><strong className="text-amber-400">பங்கேற்பாளர் தகுதி:</strong> {selectedCompetition.eligibility}</div>
                <div><strong className="text-amber-400">சமர்ப்பிக்கும் முறை:</strong> {selectedCompetition.venue}</div>
                <div><strong className="text-amber-400">கடைசி நாள்:</strong> {selectedCompetition.deadline}</div>
                {selectedCompetition.contactEmail && (
                  <div><strong className="text-amber-400">தொடர்பு மின்னஞ்சல்:</strong> {selectedCompetition.contactEmail}</div>
                )}
              </div>

              <div className="space-y-2">
                <strong className="text-white text-xs block">முக்கிய நிபந்தனைகள்:</strong>
                <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed">
                  {selectedCompetition.details}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold"
              >
                மூடுக
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowApplyModal(true);
                }}
                className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <span>இப்போதே விண்ணப்பி</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBMIT ENTRY MODAL */}
      {showApplyModal && selectedCompetition && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0b1224] border-2 border-amber-500/50 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">விண்ணப்பப் படிவம்</span>
                <h3 className="font-black text-white text-base sm:text-lg truncate max-w-md">
                  {selectedCompetition.title}
                </h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-white">உங்கள் படைப்பு பெறப்பட்டது!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  உங்கள் விண்ணப்பம் அமேஸ் டைம்ஸ் நடுவர் குழுவிற்கு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. ஆய்வு முடிவுகள் பின்னர் அறிவிக்கப்படும்.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEntry} className="p-6 space-y-4 overflow-y-auto text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">பங்கேற்பாளர் முழுப் பெயர் *</label>
                  <input
                    type="text"
                    required
                    placeholder="உங்கள் பெயர்..."
                    value={formData.participantName}
                    onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">தொலைபேசி எண் (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">மின்னஞ்சல் முகவரி</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">பள்ளி / கல்லூரி / தொழில் விபரம்</label>
                  <input
                    type="text"
                    placeholder="எ.கா: பாரதிதாசன் கல்லூரி, திருச்சி"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">படைப்பின் தலைப்பு *</label>
                  <input
                    type="text"
                    required
                    placeholder="உங்கள் கவிதை / கதை / கட்டுரையின் தலைப்பு..."
                    value={formData.entryTitle}
                    onChange={(e) => setFormData({ ...formData, entryTitle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">படைப்பின் உரை (கவிதை / கதை வரிகள்)</label>
                  <textarea
                    rows={4}
                    placeholder="உங்கள் படைப்பை இங்கு தட்டச்சு செய்யவும் அல்லது கீழே கூகுள் டிரைவ் லிங்க் இணைக்கவும்..."
                    value={formData.entryContent}
                    onChange={(e) => setFormData({ ...formData, entryContent: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">புகைப்படம் / ஆவண கூகுள் டிரைவ் இணைப்பு (Google Drive / Doc Link)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.entryUrl}
                    onChange={(e) => setFormData({ ...formData, entryUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">புகைப்படப் போட்டிக்கு டிரைவ் லிங்க் பகிரவும் (Anyone with link view permission).</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold"
                  >
                    ரத்து செய்
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'சமர்ப்பிக்கப்படுகிறது...' : 'படைப்பைச் சமர்ப்பி'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionsPage;
