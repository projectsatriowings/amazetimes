import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { defaultCompetitionsData } from '../../data/competitionsData';
import { api } from '../../services/api';
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
  Filter,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Clock,
  Check,
  AlertCircle,
  Eye,
  MessageCircle,
  FileText
} from 'lucide-react';

export const AdminCompetitionsManager = () => {
  const { showToast, competitionsData, saveCompetitionsData } = useApp();

  // Top Level View Switcher: 'applications' vs 'competitions'
  const [activeMainTab, setActiveMainTab] = useState('applications');

  // Competitions List State
  const competitionsList = (competitionsData && competitionsData.length > 0) ? competitionsData : defaultCompetitionsData;
  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State for Competitions Configuration
  const [competitionForm, setCompetitionForm] = useState({
    title: '',
    organizer: '',
    type: 'essay',
    eligibility: 'பள்ளி & கல்லூரி மாணவர்கள்',
    rewardBadge: 'மாநில சாதனையாளர் விருது & சான்றிதழ்',
    prizeDetails: 'முதல் நிலை: மாநில சாதனையாளர் விருது & தங்கப் பதக்கம் • இரண்டாம் நிலை: வெள்ளிப் பதக்கம் & பாராட்டுச் சான்றிதழ் • பங்கேற்பாளர்கள் அனைவருக்கும்: மின்னணு தகுதிச் சான்றிதழ்',
    deadline: '2026-12-15',
    venue: 'ஆன்லைன் சமர்ப்பிப்பு',
    summary: '',
    details: '',
    applyUrl: '',
    contactEmail: '',
    status: 'published'
  });

  // Applications Desk State
  const [applications, setApplications] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [appsStatusFilter, setAppsStatusFilter] = useState('all');
  const [appsCompFilter, setAppsCompFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [adminNoteDraft, setAdminNoteDraft] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch live applications from Neon PostgreSQL
  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const res = await api.getCompetitionApplications();
      if (res && res.success && Array.isArray(res.applications)) {
        setApplications(res.applications);
      } else {
        // Fallback to reader_submissions content blob if PostgreSQL table is empty
        try {
          const fallbackRes = await api.getContent('reader_submissions');
          if (fallbackRes && fallbackRes.found && Array.isArray(fallbackRes.data)) {
            const compSubs = fallbackRes.data
              .filter(s => s.type === 'competition' || s.competitionId)
              .map(s => ({
                id: s.id,
                competition_id: s.competitionId,
                competition_title: s.competitionTitle || 'போட்டி விண்ணப்பம்',
                applicant_name: s.authorName || s.participantName || s.name,
                phone: s.phone,
                email: s.email,
                institution: s.institution,
                district: s.district || 'தமிழ்நாடு',
                entry_title: s.title || s.entryTitle,
                entry_content: s.content || s.entryContent,
                entry_url: s.entryUrl || s.driveUrl,
                status: s.status || 'pending',
                admin_notes: s.adminNotes || '',
                created_at: s.createdAt || new Date().toISOString()
              }));
            setApplications(compSubs);
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Failed to fetch applications from server:', err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update application status in Neon DB
  const handleUpdateAppStatus = async (appId, newStatus, notes = null) => {
    setIsUpdatingStatus(true);
    try {
      const currentNotes = notes !== null ? notes : (selectedAppModal?.admin_notes || '');
      await api.updateCompetitionApplicationStatus(appId, newStatus, currentNotes);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus, admin_notes: currentNotes } : a));
      if (selectedAppModal && selectedAppModal.id === appId) {
        setSelectedAppModal(prev => ({ ...prev, status: newStatus, admin_notes: currentNotes }));
      }
      showToast && showToast(`விண்ணப்ப நிலை மாற்றப்பட்டது: ${getStatusLabel(newStatus)}`);
    } catch (err) {
      console.error('Failed to update application status:', err);
      showToast && showToast('நிலை மாற்றுவதில் பிழை ஏற்பட்டது');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete application
  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('இந்த விண்ணப்பத்தை நிச்சயமாக நீக்க வேண்டுமா?')) return;
    try {
      await api.deleteCompetitionApplication(appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
      if (selectedAppModal && selectedAppModal.id === appId) {
        setSelectedAppModal(null);
      }
      showToast && showToast('விண்ணப்பம் நீக்கப்பட்டது');
    } catch (err) {
      console.error('Failed to delete application:', err);
      showToast && showToast('நீக்குவதில் பிழை ஏற்பட்டது');
    }
  };

  // Save competition create/edit
  const handleSaveCompetition = (e) => {
    e.preventDefault();
    if (!competitionForm.title.trim() || !competitionForm.organizer.trim()) {
      showToast && showToast('தயவுசெய்து போட்டியின் தலைப்பு மற்றும் அமைப்பாளரை உள்ளிடவும்');
      return;
    }

    const typeNames = {
      poetry: 'கவிதைப் போட்டி',
      essay: 'சிறுகதை & கட்டுரைப் போட்டி',
      quiz: 'வினாடி வினா போட்டி',
      art: 'புகைப்படம் & ஓவியப் போட்டி'
    };

    const newItem = {
      id: editingItem ? editingItem.id : `comp-${Date.now()}`,
      title: competitionForm.title,
      organizer: competitionForm.organizer,
      type: competitionForm.type,
      typeName: typeNames[competitionForm.type] || 'மாணவர் போட்டி',
      eligibility: competitionForm.eligibility,
      rewardBadge: competitionForm.rewardBadge,
      prizeMoney: competitionForm.rewardBadge,
      prizeDetails: competitionForm.prizeDetails,
      deadline: competitionForm.deadline,
      venue: competitionForm.venue,
      summary: competitionForm.summary || competitionForm.title,
      details: competitionForm.details,
      applyUrl: competitionForm.applyUrl,
      contactEmail: competitionForm.contactEmail,
      status: competitionForm.status,
      createdAt: editingItem?.createdAt || new Date().toLocaleDateString('ta-IN')
    };

    let updated = [...competitionsList];
    if (editingItem) {
      updated = updated.map((c) => (c.id === editingItem.id ? newItem : c));
      showToast && showToast('போட்டி விவரங்கள் திருத்தப்பட்டன!');
    } else {
      updated = [newItem, ...updated];
      showToast && showToast('புதிய போட்டி அறிவிப்பு உருவாக்கப்பட்டது!');
    }
    saveCompetitionsData(updated);
    setShowCompetitionModal(false);
  };

  const handleOpenCompetitionModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setCompetitionForm({
        title: item.title || '',
        organizer: item.organizer || '',
        type: item.type || 'essay',
        eligibility: item.eligibility || 'பள்ளி & கல்லூரி மாணவர்கள்',
        rewardBadge: item.rewardBadge || item.prizeMoney || 'மாநில சாதனையாளர் விருது & சான்றிதழ்',
        prizeDetails: item.prizeDetails || '',
        deadline: item.deadline || '2026-12-15',
        venue: item.venue || 'ஆன்லைன் சமர்ப்பிப்பு',
        summary: item.summary || '',
        details: item.details || '',
        applyUrl: item.applyUrl || '',
        contactEmail: item.contactEmail || '',
        status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setCompetitionForm({
        title: '',
        organizer: '',
        type: 'essay',
        eligibility: 'பள்ளி & கல்லூரி மாணவர்கள்',
        rewardBadge: 'மாநில சாதனையாளர் விருது & சான்றிதழ்',
        prizeDetails: 'முதல் நிலை: மாநில சாதனையாளர் விருது & தங்கப் பதக்கம் • இரண்டாம் நிலை: வெள்ளிப் பதக்கம் & பாராட்டுச் சான்றிதழ் • பங்கேற்பாளர்கள் அனைவருக்கும்: மின்னணு தகுதிச் சான்றிதழ்',
        deadline: '2026-12-15',
        venue: 'ஆன்லைன் சமர்ப்பிப்பு',
        summary: '',
        details: '',
        applyUrl: '',
        contactEmail: '',
        status: 'published'
      });
    }
    setShowCompetitionModal(true);
  };

  const handleDeleteCompetition = (id) => {
    if (window.confirm('இந்த போட்டி அறிவிப்பை நிச்சயமாக நீக்க வேண்டுமா?')) {
      const updated = competitionsList.filter((c) => c.id !== id);
      saveCompetitionsData(updated);
      showToast && showToast('போட்டி அறிவிப்பு நீக்கப்பட்டது');
    }
  };

  const handleToggleCompetitionStatus = (id) => {
    const updated = competitionsList.map((c) => {
      if (c.id === id) {
        const newStatus = c.status === 'published' ? 'pending' : 'published';
        showToast && showToast(newStatus === 'published' ? 'போட்டி வெளியிடப்பட்டது!' : 'போட்டி நிலுவையில் வைக்கப்பட்டது');
        return { ...c, status: newStatus };
      }
      return c;
    });
    saveCompetitionsData(updated);
  };

  // Helper for status styling & Tamil labels
  const getStatusBadge = (status) => {
    switch (status) {
      case 'awarded':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Award className="w-3.5 h-3.5" /> சான்றிதழ் & விருது வழங்கப்பட்டது</span>;
      case 'shortlisted':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> தேர்வு செய்யப்பட்டது</span>;
      case 'under_review':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> பரிசீலனையில்</span>;
      case 'rejected':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> நிராகரிக்கப்பட்டது</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 border border-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> புதியது (நிலுவை)</span>;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'awarded': return 'விருது & சான்றிதழ்';
      case 'shortlisted': return 'தேர்வு செய்யப்பட்டது';
      case 'under_review': return 'பரிசீலனை';
      case 'rejected': return 'நிராகரிப்பு';
      default: return 'நிலுவை';
    }
  };

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      if (appsStatusFilter !== 'all' && app.status !== appsStatusFilter) return false;
      if (appsCompFilter !== 'all' && app.competition_id !== appsCompFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (app.applicant_name || '').toLowerCase().includes(q);
        const matchesTitle = (app.entry_title || '').toLowerCase().includes(q);
        const matchesPhone = (app.phone || '').includes(q);
        const matchesComp = (app.competition_title || '').toLowerCase().includes(q);
        const matchesInst = (app.institution || '').toLowerCase().includes(q);
        return matchesName || matchesTitle || matchesPhone || matchesComp || matchesInst;
      }
      return true;
    });
  }, [applications, appsStatusFilter, appsCompFilter, searchQuery]);

  // KPI metrics
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending' || !a.status).length,
      underReview: applications.filter(a => a.status === 'under_review').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      awarded: applications.filter(a => a.status === 'awarded').length
    };
  }, [applications]);

  return (
    <div className="space-y-6 font-tamil text-slate-100">
      
      {/* 1. TOP HEADER & PRIMARY NAVIGATION */}
      <div className="bg-[#0c1427] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-xl shadow-md">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              போட்டிகள் & விண்ணப்பங்கள் மேலாண்மை அரங்கம்
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            மாணவர், வாசகர் போட்டிகள், பெறப்பட்ட விண்ணப்பங்கள், சான்றிதழ்கள் & விருது வழங்கும் மையம்
          </p>
        </div>

        {/* Tab Switcher: Applications Desk vs Competitions List */}
        <div className="flex items-center bg-slate-900 border border-slate-700/80 p-1 rounded-xl shadow-inner shrink-0">
          <button
            onClick={() => setActiveMainTab('applications')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeMainTab === 'applications'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>விண்ணப்பங்கள் மேலாண்மை</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
              activeMainTab === 'applications' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-amber-400'
            }`}>
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('competitions')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeMainTab === 'competitions'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>போட்டிகள் பட்டியல்</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
              activeMainTab === 'competitions' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {competitionsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB A: APPLICATIONS DESK (USER FORM SUBMISSIONS)           */}
      {/* ============================================================== */}
      {activeMainTab === 'applications' && (
        <div className="space-y-6">
          
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#0b1224] border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold block">மொத்த விண்ணப்பங்கள்</span>
              <strong className="text-2xl font-black text-white">{stats.total}</strong>
            </div>
            <div className="bg-[#0b1224] border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-amber-400 font-bold block">நிலுவை (புதியது)</span>
              <strong className="text-2xl font-black text-amber-400">{stats.pending}</strong>
            </div>
            <div className="bg-[#0b1224] border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-blue-400 font-bold block">பரிசீலனையில்</span>
              <strong className="text-2xl font-black text-blue-400">{stats.underReview}</strong>
            </div>
            <div className="bg-[#0b1224] border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-purple-400 font-bold block">தேர்வு செய்யப்பட்டவை</span>
              <strong className="text-2xl font-black text-purple-400">{stats.shortlisted}</strong>
            </div>
            <div className="bg-[#0b1224] border border-emerald-500/30 p-4 rounded-2xl bg-emerald-950/20">
              <span className="text-xs text-emerald-400 font-bold block">சான்றிதழ் & விருது</span>
              <strong className="text-2xl font-black text-emerald-400">{stats.awarded} 🏆</strong>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-[#0c1427] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="பெயர், படைப்பு தலைப்பு, தொலைபேசி, கல்லூரி தேடுக..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
              {[
                { id: 'all', label: 'அனைத்தும்' },
                { id: 'pending', label: 'நிலுவை' },
                { id: 'under_review', label: 'பரிசீலனை' },
                { id: 'shortlisted', label: 'தேர்வு' },
                { id: 'awarded', label: 'விருது பெற்றவை' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setAppsStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    appsStatusFilter === f.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={fetchApplications}
                disabled={isLoadingApps}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 cursor-pointer transition shrink-0"
                title="புதுப்பிக்குக (Refresh)"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingApps ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Applications List View */}
          {isLoadingApps ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-bold">விண்ணப்பங்கள் ஏற்றப்படுகின்றன...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-[#0b1224] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-300">விண்ணப்பங்கள் எதுவும் கிடைக்கவில்லை</h4>
              <p className="text-xs text-slate-500">
                {searchQuery ? 'உங்கள் தேடலுக்கு ஏற்ற முடிவுகள் இல்லை.' : 'வாசகர்கள் மற்றும் மாணவர்கள் போட்டிகளுக்கு விண்ணப்பிக்கும் போது இங்கு பட்டியலிடப்படும்.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#0b1224] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 space-y-3 shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Competition Title & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-400/90 truncate max-w-[190px]">
                        {app.competition_title}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>

                    {/* Entry Title */}
                    <h3 className="text-base font-black text-white leading-snug line-clamp-2">
                      {app.entry_title || 'தலைப்பிடப்படாத படைப்பு'}
                    </h3>

                    {/* Applicant Info */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-bold">{app.applicant_name}</strong>
                        {app.district && (
                          <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {app.district}
                          </span>
                        )}
                      </div>
                      {app.institution && (
                        <div className="text-[11px] text-slate-400 truncate">
                          🏫 {app.institution}
                        </div>
                      )}
                      <div className="flex items-center gap-3 pt-1 text-[11px]">
                        {app.phone && (
                          <a
                            href={`https://wa.me/91${app.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            <MessageCircle className="w-3 h-3" /> {app.phone}
                          </a>
                        )}
                        {app.email && (
                          <a
                            href={`mailto:${app.email}`}
                            className="text-blue-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{app.email}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Snippet of content / drive link */}
                    {app.entry_content && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic bg-black/20 p-2 rounded-lg">
                        "{app.entry_content}"
                      </p>
                    )}

                    {app.entry_url && (
                      <a
                        href={app.entry_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20 font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>கூகுள் டிரைவ் கோப்பைத் திறக்க</span>
                      </a>
                    )}

                    {app.admin_notes && (
                      <div className="text-[11px] text-amber-300/90 bg-amber-500/5 border-l-2 border-amber-400 pl-2 py-1">
                        <strong>நடுவர் குறிப்பு:</strong> {app.admin_notes}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppModal(app);
                        setAdminNoteDraft(app.admin_notes || '');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer flex-1 justify-center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>விவரம் & ஆய்வு</span>
                    </button>

                    {/* Quick Award Certificate Button */}
                    <button
                      onClick={() => handleUpdateAppStatus(app.id, 'awarded')}
                      disabled={app.status === 'awarded'}
                      className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition cursor-pointer ${
                        app.status === 'awarded'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 opacity-70'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow'
                      }`}
                      title="விருது மற்றும் சான்றிதழ் வழங்க"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>விருது</span>
                    </button>

                    <button
                      onClick={() => handleDeleteApplication(app.id)}
                      className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition cursor-pointer"
                      title="விண்ணப்பத்தை நீக்கு"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* APPLICATION DETAIL & REVIEW MODAL */}
          {selectedAppModal && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
              <div className="bg-[#0b1224] border-2 border-amber-500/50 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">விண்ணப்ப ஆய்வு அரங்கம்</span>
                    <h3 className="font-black text-white text-base sm:text-lg">
                      {selectedAppModal.applicant_name} - {selectedAppModal.entry_title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAppModal(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
                  {/* Meta details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-xs">
                    <div><strong className="text-amber-400">போட்டி:</strong> {selectedAppModal.competition_title}</div>
                    <div><strong className="text-amber-400">பங்கேற்பாளர்:</strong> {selectedAppModal.applicant_name}</div>
                    <div><strong className="text-amber-400">தொலைபேசி:</strong> {selectedAppModal.phone}</div>
                    <div><strong className="text-amber-400">மின்னஞ்சல்:</strong> {selectedAppModal.email || 'இல்லை'}</div>
                    <div><strong className="text-amber-400">நிறுவனம்:</strong> {selectedAppModal.institution || 'குறிப்பிடப்படவில்லை'}</div>
                    <div><strong className="text-amber-400">மாவட்டம்:</strong> {selectedAppModal.district || 'தமிழ்நாடு'}</div>
                    <div><strong className="text-amber-400">விண்ணப்பித்த தேதி:</strong> {new Date(selectedAppModal.created_at).toLocaleString('ta-IN')}</div>
                    <div><strong className="text-amber-400">தற்போதைய நிலை:</strong> {getStatusBadge(selectedAppModal.status)}</div>
                  </div>

                  {/* Submission Content */}
                  <div className="space-y-2">
                    <strong className="text-white text-xs block">சமர்ப்பிக்கப்பட்ட படைப்பு (Content):</strong>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-slate-200 text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {selectedAppModal.entry_content || 'நேரடி உரை சமர்ப்பிக்கப்படவில்லை (டிரைவ் லிங்க் பார்க்கவும்)'}
                    </div>
                  </div>

                  {selectedAppModal.entry_url && (
                    <div className="pt-1">
                      <strong className="text-white text-xs block mb-1">கூகுள் டிரைவ் இணைப்பு:</strong>
                      <a
                        href={selectedAppModal.entry_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3.5 py-2 rounded-xl text-xs font-bold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{selectedAppModal.entry_url}</span>
                      </a>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-white text-xs font-bold block">நடுவர் மற்றும் நிர்வாகக் குறிப்புகள் (Admin Notes / Reviewer Feedback):</label>
                    <textarea
                      rows={3}
                      placeholder="சான்றிதழ் எண், மதிப்பெண் அல்லது நடுவர் கருத்துகளை இங்கு உள்ளிடவும்..."
                      value={adminNoteDraft}
                      onChange={(e) => setAdminNoteDraft(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Footer Review Status Controls */}
                <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-900/50">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-bold mr-1">நிலையை மாற்று:</span>
                    <button
                      onClick={() => handleUpdateAppStatus(selectedAppModal.id, 'under_review', adminNoteDraft)}
                      className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      பரிசீலனை
                    </button>
                    <button
                      onClick={() => handleUpdateAppStatus(selectedAppModal.id, 'shortlisted', adminNoteDraft)}
                      className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      தேர்வு செய்
                    </button>
                    <button
                      onClick={() => handleUpdateAppStatus(selectedAppModal.id, 'awarded', adminNoteDraft)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow cursor-pointer flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>சான்றிதழ் & விருது வழங்கு 🏆</span>
                    </button>
                    <button
                      onClick={() => handleUpdateAppStatus(selectedAppModal.id, 'rejected', adminNoteDraft)}
                      className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      நிராகரி
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedAppModal(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    மூடுக
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB B: COMPETITIONS LIST CONFIGURATION                      */}
      {/* ============================================================== */}
      {activeMainTab === 'competitions' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">போட்டிகள் கட்டமைப்பு (Competitions Setup)</h3>
              <p className="text-xs text-slate-400">புதிய போட்டிகளை உருவாக்கவும், விருது & சான்றிதழ் விவரங்களை மாற்றியமைக்கவும்</p>
            </div>

            <button
              onClick={() => handleOpenCompetitionModal(null)}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>புதிய போட்டி அறிவிப்பு</span>
            </button>
          </div>

          {/* Competitions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {competitionsList.map((comp) => (
              <div
                key={comp.id}
                className="bg-[#0b1224] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                      {comp.organizer}
                    </span>
                    <button
                      onClick={() => handleToggleCompetitionStatus(comp.id)}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                        comp.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {comp.status === 'published' ? 'நேரலை' : 'வரைவு'}
                    </button>
                  </div>

                  <h4 className="text-base font-black text-white leading-snug">
                    {comp.title}
                  </h4>

                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">விருது / சான்றிதழ்:</span>
                      <strong className="text-emerald-400 truncate max-w-[170px]">{comp.rewardBadge || comp.prizeMoney}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">கடைசி நாள்:</span>
                      <strong className="text-rose-400">{comp.deadline}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">தகுதி:</span>
                      <span className="text-white truncate max-w-[170px]">{comp.eligibility}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {comp.summary || comp.details}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenCompetitionModal(comp)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl border border-slate-800 transition cursor-pointer"
                    title="திருத்து (Edit)"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCompetition(comp.id)}
                    className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition cursor-pointer"
                    title="நீக்கு (Delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CREATE / EDIT COMPETITION MODAL */}
          {showCompetitionModal && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
              <div className="bg-[#0b1224] border-2 border-amber-500/50 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-black text-amber-400 text-base sm:text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>{editingItem ? 'போட்டி விவரங்களைத் திருத்து' : 'புதிய போட்டி அறிவிப்பு'}</span>
                  </h3>
                  <button
                    onClick={() => setShowCompetitionModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCompetition} className="p-6 space-y-4 overflow-y-auto text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">போட்டியின் தலைப்பு *</label>
                    <input
                      type="text"
                      required
                      placeholder="எ.கா: அமேஸ் டைம்ஸ் மாநில பாரதியார் கவிதைப் போட்டி 2026"
                      value={competitionForm.title}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">அமைப்பாளர் / பிரிவு *</label>
                      <input
                        type="text"
                        required
                        placeholder="எ.கா: அமேஸ் டைம்ஸ் இலக்கிய அரங்கம்"
                        value={competitionForm.organizer}
                        onChange={(e) => setCompetitionForm({ ...competitionForm, organizer: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">போட்டி வகை (Category)</label>
                      <select
                        value={competitionForm.type}
                        onChange={(e) => setCompetitionForm({ ...competitionForm, type: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="poetry">கவிதைப் போட்டி</option>
                        <option value="essay">சிறுகதை & கட்டுரைப் போட்டி</option>
                        <option value="quiz">வினாடி வினா போட்டி</option>
                        <option value="art">புகைப்படம் & ஓவியப் போட்டி</option>
                      </select>
                    </div>
                  </div>

                  {/* Reward & Certificate Field instead of Prize Money */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">விருது & சான்றிதழ் தலைப்பு *</label>
                      <input
                        type="text"
                        required
                        placeholder="எ.கா: பாரதி இலக்கிய விருது & தங்கச் சான்றிதழ்"
                        value={competitionForm.rewardBadge}
                        onChange={(e) => setCompetitionForm({ ...competitionForm, rewardBadge: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">கடைசி நாள் (Deadline) *</label>
                      <input
                        type="date"
                        required
                        value={competitionForm.deadline}
                        onChange={(e) => setCompetitionForm({ ...competitionForm, deadline: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">விருது & சான்றிதழ் முழு விபரம்</label>
                    <input
                      type="text"
                      placeholder="எ.கா: முதல் நிலை: பாரதி இலக்கிய விருது & தங்கப் பதக்கம் • இரண்டாம் நிலை: பாராட்டுச் சான்றிதழ்"
                      value={competitionForm.prizeDetails}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, prizeDetails: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">பங்கேற்பாளர் தகுதி</label>
                    <input
                      type="text"
                      placeholder="எ.கா: அனைத்து வயதுப் பிரிவினர் (பள்ளி, கல்லூரி & பொதுமக்கள்)"
                      value={competitionForm.eligibility}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, eligibility: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">சுருக்கமான விளக்கம் (Summary)</label>
                    <textarea
                      rows={2}
                      placeholder="போட்டி குறித்த சிறு அறிமுகம்..."
                      value={competitionForm.summary}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, summary: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">முக்கிய நிபந்தனைகள் & வழிகாட்டுதல் (Details)</label>
                    <textarea
                      rows={3}
                      placeholder="வரிகள் அளவு, விதிமுறைகள், சமர்ப்பிக்கும் வழிமுறைகள்..."
                      value={competitionForm.details}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, details: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCompetitionModal(false)}
                      className="bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      ரத்து செய்
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingItem ? 'மாற்றங்களைச் சேமி' : 'போட்டியை வெளியிடு'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AdminCompetitionsManager;
