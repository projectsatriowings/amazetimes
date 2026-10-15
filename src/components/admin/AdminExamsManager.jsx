import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { defaultExamsData } from '../../data/examsData';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Calendar,
  Award,
  ExternalLink,
  FileText,
  Flame,
  X,
  Filter
} from 'lucide-react';

export const AdminExamsManager = () => {
  const { showToast, examsData, saveExamsData } = useApp();

  const examsList = (examsData && examsData.length > 0) ? examsData : defaultExamsData;

  useEffect(() => {
    if ((!examsData || examsData.length === 0) && defaultExamsData && defaultExamsData.length > 0) {
      if (typeof saveExamsData === 'function') {
        saveExamsData(defaultExamsData);
      }
    }
  }, [examsData]);

  const [activeCategoryTab, setActiveCategoryTab] = useState('all'); // 'all' | 'tnpsc' | 'state' | 'central'
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    conductingBody: 'TNPSC',
    examCategory: 'tnpsc',
    vacancies: '5,000 காலிப் பணியிடங்கள்',
    qualification: '10th / Degree',
    ageLimit: '18 - 35 வயது',
    startDate: '2026-09-26',
    lastDate: '2026-10-30',
    examDate: '2026-12-15',
    salary: '₹19,500 - ₹71,900',
    summary: '',
    details: '',
    officialUrl: '',
    pdfUrl: '',
    isHot: true,
    status: 'published'
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        conductingBody: item.conductingBody || 'TNPSC',
        examCategory: item.examCategory || 'tnpsc',
        vacancies: item.vacancies || '5,000 காலிப் பணியிடங்கள்',
        qualification: item.qualification || '10th / Degree',
        ageLimit: item.ageLimit || '18 - 35 வயது',
        startDate: item.startDate || '2026-09-26',
        lastDate: item.lastDate || '2026-10-30',
        examDate: item.examDate || '2026-12-15',
        salary: item.salary || '',
        summary: item.summary || '',
        details: item.details || '',
        officialUrl: item.officialUrl || '',
        pdfUrl: item.pdfUrl || '',
        isHot: item.isHot || false,
        status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        conductingBody: 'TNPSC',
        examCategory: 'tnpsc',
        vacancies: '5,000 காலிப் பணியிடங்கள்',
        qualification: '10th / Degree',
        ageLimit: '18 - 35 வயது',
        startDate: '2026-09-26',
        lastDate: '2026-10-30',
        examDate: '2026-12-15',
        salary: '₹19,500 - ₹71,900',
        summary: '',
        details: '',
        officialUrl: '',
        pdfUrl: '',
        isHot: true,
        status: 'published'
      });
    }
    setShowModal(true);
  };

  const handleSaveExam = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.conductingBody.trim()) {
      showToast('தயவுசெய்து தேர்வு தலைப்பு மற்றும் தேர்வாணையத்தை உள்ளிடவும்');
      return;
    }

    const categoryNames = {
      tnpsc: 'TNPSC தேர்வுகள்',
      state: 'தமிழக அரசுத் தேர்வுகள்',
      central: 'மத்திய அரசுத் தேர்வுகள்'
    };

    const newItem = {
      id: editingItem ? editingItem.id : `exam-${Date.now()}`,
      title: form.title,
      conductingBody: form.conductingBody,
      examCategory: form.examCategory,
      categoryName: categoryNames[form.examCategory] || 'அரசுத் தேர்வு',
      vacancies: form.vacancies,
      qualification: form.qualification,
      ageLimit: form.ageLimit,
      startDate: form.startDate,
      lastDate: form.lastDate,
      examDate: form.examDate,
      salary: form.salary,
      summary: form.summary || form.title,
      details: form.details,
      officialUrl: form.officialUrl,
      pdfUrl: form.pdfUrl,
      isHot: form.isHot,
      status: form.status,
      createdAt: new Date().toLocaleDateString('ta-IN')
    };

    let updated = [...examsList];
    if (editingItem) {
      updated = updated.map((ex) => (ex.id === editingItem.id ? newItem : ex));
      showToast('அரசு தேர்வு விவரம் திருத்தப்பட்டது!');
    } else {
      updated = [newItem, ...updated];
      showToast('புதிய அரசு தேர்வு அறிவிப்பு சேமிக்கப்பட்டு வெளியானது!');
    }
    saveExamsData(updated);

    setShowModal(false);
  };

  const handleToggleStatus = (id) => {
    const updated = examsList.map((ex) => {
      if (ex.id === id) {
        const newStatus = ex.status === 'published' ? 'pending' : 'published';
        showToast(newStatus === 'published' ? 'தேர்வு அறிவிப்பு முகப்பில் வெளியிடப்பட்டது!' : 'தேர்வு அறிவிப்பு நிலுவையில் வைக்கப்பட்டது');
        return { ...ex, status: newStatus };
      }
      return ex;
    });
    saveExamsData(updated);
  };

  const handleDelete = (id) => {
    if (window.confirm('இந்த அரசு தேர்வு அறிவிப்பை நிச்சயமாக நீக்க வேண்டுமா?')) {
      const updated = examsList.filter((ex) => ex.id !== id);
      saveExamsData(updated);
      showToast('தேர்வு அறிவிப்பு நீக்கப்பட்டது');
    }
  };

  const filteredExams = examsList.filter((ex) => {
    if (activeCategoryTab !== 'all' && ex.examCategory !== activeCategoryTab) return false;
    if (statusFilter !== 'all' && ex.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-tamil">
      {/* HEADER CARD */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Building2 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              அரசுத் தேர்வுகள் & TNPSC மேலாளர் (Government Exams & Jobs)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans">
            Manage TNPSC Group 1, 2, 4, VAO notifications, State Govt exams (Police, TRB) & Central exams (UPSC, SSC, RRB) with dates, vacancies & apply links.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>புதிய தேர்வு அறிவிப்பு சேர்</span>
        </button>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl space-y-1 shadow">
          <span className="text-xs text-slate-400 font-bold block">மொத்த தேர்வுகள்</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{examsList.length}</span>
        </div>

        <div className="bg-[#0f172a] border border-amber-900/50 p-4 rounded-2xl space-y-1 shadow">
          <span className="text-xs text-amber-300 font-bold block">TNPSC தேர்வுகள்</span>
          <span className="text-2xl font-black text-amber-400 font-mono">
            {examsList.filter((e) => e.examCategory === 'tnpsc').length}
          </span>
        </div>

        <div className="bg-[#0f172a] border border-blue-900/50 p-4 rounded-2xl space-y-1 shadow">
          <span className="text-xs text-blue-300 font-bold block">தமிழக அரசுத் தேர்வுகள்</span>
          <span className="text-2xl font-black text-blue-400 font-mono">
            {examsList.filter((e) => e.examCategory === 'state').length}
          </span>
        </div>

        <div className="bg-[#0f172a] border border-emerald-900/50 p-4 rounded-2xl space-y-1 shadow">
          <span className="text-xs text-emerald-300 font-bold block">மத்திய அரசுத் தேர்வுகள்</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {examsList.filter((e) => e.examCategory === 'central').length}
          </span>
        </div>
      </div>

      {/* CATEGORY & APPROVAL FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategoryTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeCategoryTab === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            அனைத்தும் ({examsList.length})
          </button>
          <button
            onClick={() => setActiveCategoryTab('tnpsc')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryTab === 'tnpsc'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-slate-800'
            }`}
          >
            ⭐ TNPSC தேர்வுகள்
          </button>
          <button
            onClick={() => setActiveCategoryTab('state')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeCategoryTab === 'state'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-blue-300 hover:bg-slate-800'
            }`}
          >
            தமிழக அரசுத் தேர்வுகள்
          </button>
          <button
            onClick={() => setActiveCategoryTab('central')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeCategoryTab === 'central'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-emerald-300 hover:bg-slate-800'
            }`}
          >
            மத்திய அரசுத் தேர்வுகள் (UPSC/SSC/RRB)
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-4 h-4 text-amber-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#050915] border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">அனைத்து நிலவரங்கள்</option>
            <option value="published">வெளியிடப்பட்டது (Published)</option>
            <option value="pending">நிலுவையில் (Pending)</option>
          </select>
        </div>
      </div>

      {/* EXAMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.map((ex) => (
          <div
            key={ex.id}
            className={`bg-[#0f172a] rounded-3xl border ${
              ex.examCategory === 'tnpsc' ? 'border-amber-500/50 shadow-amber-950/20' : 'border-slate-800'
            } p-6 shadow-xl space-y-4 flex flex-col justify-between`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`font-extrabold text-[11px] px-3 py-1 rounded-full ${
                    ex.examCategory === 'tnpsc'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : ex.examCategory === 'state'
                      ? 'bg-blue-950 text-blue-300 border border-blue-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {ex.examCategory === 'tnpsc' ? '⭐ TNPSC' : ex.categoryName || 'அரசு தேர்வு'}
                </span>

                <span className="text-amber-400 font-black text-xs bg-amber-950/80 border border-amber-700/60 px-3 py-1 rounded-full">
                  🔥 {ex.vacancies}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-white text-base leading-snug">{ex.title}</h3>
                <p className="text-xs text-amber-400 font-bold mt-1">அமைப்பாளர்: {ex.conductingBody}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{ex.summary}</p>

              <div className="bg-[#050915] p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>🎓 <strong>கல்வித் தகுதி:</strong></span>
                  <span className="font-bold text-white">{ex.qualification}</span>
                </div>
                <div className="flex justify-between">
                  <span>📅 <strong>கடைசி தேதி:</strong></span>
                  <span className="font-mono font-bold text-red-400">{ex.lastDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>📝 <strong>தேர்வு நாள்:</strong></span>
                  <span className="font-mono font-bold text-emerald-400">{ex.examDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {ex.officialUrl && (
                  <a
                    href={ex.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> விண்ணப்பிக்க
                  </a>
                )}
                {ex.pdfUrl && (
                  <a
                    href={ex.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> அறிவிப்பு PDF
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(ex.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                    ex.status === 'published'
                      ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{ex.status === 'published' ? 'வெளியிடப்பட்டது' : 'ஒப்புதல் அளி'}</span>
                </button>

                <button
                  onClick={() => handleOpenModal(ex)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(ex.id)}
                  className="p-2 bg-slate-800 hover:bg-red-600/80 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0f172a] rounded-3xl max-w-2xl w-full max-h-[90vh] border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center border-b border-slate-800 p-4 sm:p-5 bg-[#0f172a] shrink-0">
              <h3 className="font-black text-amber-400 text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                {editingItem ? 'தேர்வு அறிவிப்பு திருத்துதல்' : 'புதிய அரசுத் தேர்வு / TNPSC அறிவிப்பு சேர்'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveExam} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-300 block mb-1">தேர்வின் தலைப்பு (Exam Title):</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: TNPSC குரூப் 4 (Group IV & VAO) தேர்வு 2026..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">தேர்வுத் துறை / பிரிவு (Category):</label>
                  <select
                    value={form.examCategory}
                    onChange={(e) => setForm({ ...form, examCategory: e.target.value })}
                    className="w-full bg-[#050915] border border-amber-500/50 rounded-xl p-3 text-amber-300 font-bold"
                  >
                    <option value="tnpsc">⭐ TNPSC தேர்வுகள் (Group 1, 2, 4, VAO)</option>
                    <option value="state">தமிழக அரசுத் தேர்வுகள் (Police/TRB/TNEB)</option>
                    <option value="central">மத்திய அரசுத் தேர்வுகள் (UPSC/SSC/RRB/Banking)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">தேர்வாணையத்தின் பெயர் (Conducting Body):</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: TNPSC / TNUSRB / SSC / RRB..."
                    value={form.conductingBody}
                    onChange={(e) => setForm({ ...form, conductingBody: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-400 block mb-1">காலிப் பணியிடங்கள் (Vacancies):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: 8,950 காலிப் பணியிடங்கள்..."
                    value={form.vacancies}
                    onChange={(e) => setForm({ ...form, vacancies: e.target.value })}
                    className="w-full bg-[#050915] border border-amber-500/40 rounded-xl p-3 text-amber-200 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">கல்வித் தகுதி (Qualification):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: 10th Pass / Degree..."
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">விண்ணப்ப தொடக்கம்:</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-red-400 block mb-1">கடைசி தேதி:</label>
                  <input
                    type="date"
                    value={form.lastDate}
                    onChange={(e) => setForm({ ...form, lastDate: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-400 block mb-1">தேர்வு நாள்:</label>
                  <input
                    type="date"
                    value={form.examDate}
                    onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">முக்கிய சுருக்கம் (Summary):</label>
                <textarea
                  rows="2"
                  required
                  placeholder="தேர்வு அறிவிப்பின் முக்கிய சிறப்பம்சங்கள்..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">தேர்வு முறை & பாடத்திட்டம் (Details & Syllabus):</label>
                <textarea
                  rows="4"
                  placeholder="தேர்வுத் தாள்கள், மதிப்பெண்கள், வயது வரம்பு வரிகள்..."
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">விண்ணப்பிக்கும் அதிகாரப்பூர்வ தளம் (Apply Link):</label>
                  <input
                    type="url"
                    placeholder="https://www.tnpsc.gov.in..."
                    value={form.officialUrl}
                    onChange={(e) => setForm({ ...form, officialUrl: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">அறிவிப்பு PDF இணைப்பு (Notification PDF):</label>
                  <input
                    type="url"
                    placeholder="https://...pdf"
                    value={form.pdfUrl}
                    onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">வெளியீட்டு நிலை:</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                >
                  <option value="published">வெளியிடவும் (Published)</option>
                  <option value="pending">நிலுவையில் வைக்கவும் (Pending Approval)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 py-3.5 rounded-xl uppercase tracking-wider shadow-lg cursor-pointer transition"
              >
                சேமி & வெளியிடவும்
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
