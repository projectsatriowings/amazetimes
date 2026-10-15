import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { defaultCompetitionsData } from '../../data/competitionsData';
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Calendar,
  Award,
  ExternalLink,
  Users,
  X,
  Filter
} from 'lucide-react';

export const AdminCompetitionsManager = () => {
  const { showToast, competitionsData, saveCompetitionsData } = useApp();

  const competitionsList = (competitionsData && competitionsData.length > 0) ? competitionsData : defaultCompetitionsData;

  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    organizer: '',
    type: 'essay',
    eligibility: 'பள்ளி & கல்லூரி மாணவர்கள்',
    prizeMoney: 'ரூ. 1,00,000',
    deadline: '2026-10-30',
    venue: 'ஆன்லைன் / சென்னை',
    summary: '',
    details: '',
    applyUrl: '',
    contactEmail: '',
    status: 'published'
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        organizer: item.organizer || '',
        type: item.type || 'essay',
        eligibility: item.eligibility || 'பள்ளி & கல்லூரி மாணவர்கள்',
        prizeMoney: item.prizeMoney || 'ரூ. 1,00,000',
        deadline: item.deadline || '2026-10-30',
        venue: item.venue || 'ஆன்லைன்',
        summary: item.summary || '',
        details: item.details || '',
        applyUrl: item.applyUrl || '',
        contactEmail: item.contactEmail || '',
        status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        organizer: '',
        type: 'essay',
        eligibility: 'பள்ளி & கல்லூரி மாணவர்கள்',
        prizeMoney: 'ரூ. 1,00,000',
        deadline: '2026-10-30',
        venue: 'ஆன்லைன்',
        summary: '',
        details: '',
        applyUrl: '',
        contactEmail: '',
        status: 'published'
      });
    }
    setShowModal(true);
  };

  const handleSaveCompetition = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.organizer.trim()) {
      showToast('தயவுசெய்து போட்டியின் தலைப்பு மற்றும் அமைப்பாளரை உள்ளிடவும்');
      return;
    }

    const typeNames = {
      essay: 'கட்டுரைப் போட்டி',
      speech: 'பேச்சுப்போட்டி',
      quiz: 'வினாடி வினா போட்டி',
      coding: 'கணினி & கோடிங் போட்டி',
      art: 'ஓவியப் போட்டி'
    };

    const newItem = {
      id: editingItem ? editingItem.id : `comp-${Date.now()}`,
      title: form.title,
      organizer: form.organizer,
      type: form.type,
      typeName: typeNames[form.type] || 'மாணவர் போட்டி',
      eligibility: form.eligibility,
      prizeMoney: form.prizeMoney,
      deadline: form.deadline,
      venue: form.venue,
      summary: form.summary || form.title,
      details: form.details,
      applyUrl: form.applyUrl,
      contactEmail: form.contactEmail,
      status: form.status,
      createdAt: new Date().toLocaleDateString('ta-IN')
    };

    let updated = [...competitionsList];
    if (editingItem) {
      updated = updated.map((c) => (c.id === editingItem.id ? newItem : c));
      showToast('போட்டி விவரங்கள் திருத்தப்பட்டன!');
    } else {
      updated = [newItem, ...updated];
      showToast('புதிய போட்டி அறிவிப்பு உருவாக்கப்பட்டு வெளியானது!');
    }
    saveCompetitionsData(updated);

    setShowModal(false);
  };

  const handleToggleStatus = (id) => {
    const updated = competitionsList.map((c) => {
      if (c.id === id) {
        const newStatus = c.status === 'published' ? 'pending' : 'published';
        showToast(newStatus === 'published' ? 'போட்டி முகப்பில் வெளியிடப்பட்டது!' : 'போட்டி நிலுவையில் வைக்கப்பட்டது');
        return { ...c, status: newStatus };
      }
      return c;
    });
    saveCompetitionsData(updated);
  };

  const handleDelete = (id) => {
    if (window.confirm('இந்த போட்டி அறிவிப்பை நிச்சயமாக நீக்க வேண்டுமா?')) {
      const updated = competitionsList.filter((c) => c.id !== id);
      saveCompetitionsData(updated);
      showToast('போட்டி அறிவிப்பு நீக்கப்பட்டது');
    }
  };

  const filteredCompetitions = competitionsList.filter((c) => {
    if (activeTypeTab !== 'all' && c.type !== activeTypeTab) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-tamil">
      {/* HEADER CARD */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Trophy className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              மாணவர் & இளைஞர் போட்டிகள் மேலாளர் (Competitions Manager)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans">
            Announce essay writing, speech, quiz, hackathons & talent contests for Tamil Nadu students with prizes, deadlines and apply links.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>புதிய போட்டி சேர்</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: `அனைத்தும் (${competitionsList.length})` },
            { id: 'essay', label: 'கட்டுரைப் போட்டி' },
            { id: 'speech', label: 'பேச்சுப்போட்டி' },
            { id: 'quiz', label: 'வினாடி வினா' },
            { id: 'coding', label: 'கோடிங் போட்டி' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTypeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
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

      {/* COMPETITIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompetitions.map((c) => (
          <div
            key={c.id}
            className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[11px] px-3 py-1 rounded-full">
                  {c.typeName || 'போட்டி'}
                </span>
                <span className="text-emerald-400 font-black text-xs bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                  🏆 {c.prizeMoney}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-white text-base leading-snug">{c.title}</h3>
                <p className="text-xs text-amber-400 font-bold mt-1">அமைப்பாளர்: {c.organizer}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{c.summary}</p>

              <div className="bg-[#050915] p-3 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
                <div className="flex items-center justify-between">
                  <span>🎓 <strong>தகுதி:</strong> {c.eligibility}</span>
                </div>
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span>📅 <strong>கடைசி தேதி:</strong> {c.deadline}</span>
                  <span>📍 {c.venue}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              {c.applyUrl ? (
                <a
                  href={c.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> விண்ணப்பிக்கும் தளம்
                </a>
              ) : (
                <span className="text-slate-500">இணைப்பு இல்லை</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                    c.status === 'published'
                      ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{c.status === 'published' ? 'வெளியிடப்பட்டது' : 'ஒப்புதல் அளி'}</span>
                </button>

                <button
                  onClick={() => handleOpenModal(c)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(c.id)}
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
                <Trophy className="w-5 h-5 text-amber-400" />
                {editingItem ? 'போட்டி விவரம் திருத்துதல்' : 'புதிய போட்டி அறிவிப்பு சேர்'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveCompetition} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-300 block mb-1">போட்டியின் தலைப்பு:</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: மாநில அளவிலான பாரதியார் கவிதைப் போட்டி 2026..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">அமைப்பாளர் (Organizer):</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: தமிழ்நாடு கலை பண்பாட்டுத்துறை..."
                    value={form.organizer}
                    onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">போட்டி வகை (Type):</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  >
                    <option value="essay">கட்டுரைப் போட்டி</option>
                    <option value="speech">பேச்சுப்போட்டி</option>
                    <option value="quiz">வினாடி வினா போட்டி</option>
                    <option value="coding">கணினி & கோடிங் போட்டி</option>
                    <option value="art">ஓவியப் போட்டி</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-400 block mb-1">பரிசுத் தொகை (Prize Money):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: ரூ. 1,00,000..."
                    value={form.prizeMoney}
                    onChange={(e) => setForm({ ...form, prizeMoney: e.target.value })}
                    className="w-full bg-[#050915] border border-amber-500/40 rounded-xl p-3 text-amber-200 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">பங்கேற்பு தகுதி (Eligibility):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: பள்ளி & கல்லூரி மாணவர்கள்..."
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">கடைசி தேதி (Deadline):</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">நடைபெறும் இடம் / முறை:</label>
                  <input
                    type="text"
                    placeholder="எ.கா: ஆன்லைன் / சென்னை தமிழ் வளர்ச்சி வளாகம்..."
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">சிறுகுறிப்பு (Summary):</label>
                <textarea
                  rows="2"
                  required
                  placeholder="போட்டியின் முக்கிய சுருக்கம்..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">முழுமையான விதிகள் & விவரங்கள் (Details):</label>
                <textarea
                  rows="4"
                  placeholder="போட்டி தலைப்புகள், சமர்ப்பிக்கும் முறைகள்..."
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">விண்ணப்பிக்கும் இணைய முகவரி (Apply Link):</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.applyUrl}
                    onChange={(e) => setForm({ ...form, applyUrl: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">தொடர்பு மின்னஞ்சல் / போன்:</label>
                  <input
                    type="text"
                    placeholder="contest@tn.gov.in..."
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
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
