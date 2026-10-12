import React, { useState, useEffect } from 'react';
import { api, setToken, setCurrentUser } from '../../services/api';

export default function AdminDashboardModal({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onToast,
  onDataChanged,
  initialTab = 'overview',
  articleToEdit = null,
  onNavigateHome = null,
  isDedicatedPage = false
}) {
  if (!isOpen || !currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const isReporter = currentUser.role === 'reporter';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');

  // Shorts / Video State
  const [shortsList, setShortsList] = useState([]);
  const [isLoadingShorts, setIsLoadingShorts] = useState(false);
  const [isShortModalOpen, setIsShortModalOpen] = useState(false);
  const [editingShort, setEditingShort] = useState(null);
  const [shortHeadline, setShortHeadline] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [shortMediaUrl, setShortMediaUrl] = useState('');
  const [shortMediaType, setShortMediaType] = useState('video');
  const [isUploadingShortMedia, setIsUploadingShortMedia] = useState(false);

  // Zodiac / Astrology State
  const [zodiacList, setZodiacList] = useState([]);
  const [isLoadingZodiac, setIsLoadingZodiac] = useState(false);
  const [editingZodiac, setEditingZodiac] = useState(null);
  const [zodiacPrediction, setZodiacPrediction] = useState('');
  const [zodiacLuckyNum, setZodiacLuckyNum] = useState('');
  const [zodiacLuckyColor, setZodiacLuckyColor] = useState('');
  const [zodiacLuckyDir, setZodiacLuckyDir] = useState('');
  const [zodiacPlanet, setZodiacPlanet] = useState('');

  // Stats State
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Articles State
  const [articles, setArticles] = useState([]);
  const [articleStatusFilter, setArticleStatusFilter] = useState(isReporter ? 'all' : 'all');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');
  const [articleSearch, setArticleSearch] = useState('');
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  // Article Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState('tamilnadu');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIsLead, setFormIsLead] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);

  // Rejection Modal State
  const [rejectingArticleId, setRejectingArticleId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Reporters State (Admin only)
  const [reporters, setReporters] = useState([]);
  const [isLoadingReporters, setIsLoadingReporters] = useState(false);
  const [isAddReporterOpen, setIsAddReporterOpen] = useState(false);
  const [newRepUsername, setNewRepUsername] = useState('');
  const [newRepPassword, setNewRepPassword] = useState('');
  const [newRepFullName, setNewRepFullName] = useState('');
  const [newRepEmail, setNewRepEmail] = useState('');
  const [newRepPhone, setNewRepPhone] = useState('');
  const [newRepBio, setNewRepBio] = useState('');

  // Tickers & Live Wire State
  const [tickers, setTickers] = useState([]);
  const [newTickerText, setNewTickerText] = useState('');
  const [liveWireItems, setLiveWireItems] = useState([]);
  const [newLiveWireTitle, setNewLiveWireTitle] = useState('');
  const [newLiveWireHighlight, setNewLiveWireHighlight] = useState(false);

  // E-Paper State
  const [epaperTitle, setEpaperTitle] = useState('அமேஸ் டைம்ஸ் நாளிதழ் பிரதான பதிப்பு');
  const [epaperDate, setEpaperDate] = useState(new Date().toISOString().split('T')[0]);
  const [epaperPdfUrl, setEpaperPdfUrl] = useState('');
  const [epaperCoverImage, setEpaperCoverImage] = useState('/Amaze times.jpg');
  const [epaperPageCount, setEpaperPageCount] = useState(16);

  // Polls State
  const [activePoll, setActivePoll] = useState(null);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['ஆம், மிகச் சிறப்பு', 'இன்னும் மேம்படுத்தலாம்', 'கருத்தில்லை']);

  // Fetch initial data
  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchArticlesList = async () => {
    setIsLoadingArticles(true);
    try {
      const params = { limit: 100 };
      if (articleCategoryFilter && articleCategoryFilter !== 'all') {
        params.category = articleCategoryFilter;
      }
      if (articleSearch && articleSearch.trim()) {
        params.search = articleSearch.trim();
      }

      if (isReporter) {
        params.author_id = currentUser.id;
        if (articleStatusFilter && articleStatusFilter !== 'all') {
          params.status = articleStatusFilter;
        }
      } else {
        if (articleStatusFilter && articleStatusFilter !== 'all') {
          params.status = articleStatusFilter;
        }
      }

      const res = await api.getArticles(params);
      if (res.success) setArticles(res.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const fetchReportersList = async () => {
    if (!isAdmin) return;
    setIsLoadingReporters(true);
    try {
      const res = await api.getReporters();
      if (res.success) setReporters(res.reporters);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReporters(false);
    }
  };

  const fetchTickersAndLiveWire = async () => {
    try {
      const [tRes, lwRes, pollRes] = await Promise.all([
        api.getTickers(),
        api.getLiveWire(),
        api.getActivePollAndQuiz()
      ]);
      if (tRes.success) setTickers(tRes.tickers);
      if (lwRes.success) setLiveWireItems(lwRes.items);
      if (pollRes.success && pollRes.poll) setActivePoll(pollRes.poll);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Video Shorts
  const fetchShortsList = async () => {
    setIsLoadingShorts(true);
    try {
      const res = await api.getShortsAdmin();
      if (res.success) setShortsList(res.stories);
    } catch (err) {
      console.warn('Error fetching shorts:', err);
    } finally {
      setIsLoadingShorts(false);
    }
  };

  // Fetch 12 Zodiac signs
  const fetchZodiacList = async () => {
    setIsLoadingZodiac(true);
    try {
      const res = await api.getZodiacToday();
      if (res.success) setZodiacList(res.signs);
    } catch (err) {
      console.warn('Error fetching zodiac:', err);
    } finally {
      setIsLoadingZodiac(false);
    }
  };

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (articleToEdit) handleOpenEditor(articleToEdit);
  }, [isOpen, initialTab, articleToEdit]);

  useEffect(() => {
    fetchDashboardStats();
    fetchArticlesList();
    if (isAdmin) fetchReportersList();
    fetchTickersAndLiveWire();
    if (activeTab === 'videos') fetchShortsList();
    if (activeTab === 'zodiac') fetchZodiacList();
  }, [activeTab, articleStatusFilter, articleCategoryFilter]);

  // Real-time live analytics polling every 4 seconds for accurate viewer counts
  useEffect(() => {
    const liveStatsInterval = setInterval(() => {
      api.getDashboardStats().then(res => {
        if (res.success) setStats(res.data);
      }).catch(() => {});
    }, 4000);
    return () => clearInterval(liveStatsInterval);
  }, []);

  // Video Shorts Handlers
  const handleOpenShortEditor = (short = null) => {
    if (short) {
      setEditingShort(short);
      setShortHeadline(short.headline);
      setShortDesc(short.description || '');
      setShortMediaUrl(short.media_url);
      setShortMediaType(short.media_type || 'video');
    } else {
      setEditingShort(null);
      setShortHeadline('');
      setShortDesc('');
      setShortMediaUrl('');
      setShortMediaType('video');
    }
    setIsShortModalOpen(true);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingShortMedia(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success) {
        setShortMediaUrl(res.url);
        setShortMediaType(file.type.includes('video') ? 'video' : 'image');
        onToast('வீடியோ வெற்றிகரமாகப் பதிவேற்றப்பட்டது!', 'video_file');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsUploadingShortMedia(false);
    }
  };

  const handleSaveShort = async (e) => {
    e.preventDefault();
    if (!shortHeadline.trim() || !shortMediaUrl.trim()) {
      onToast('தயவுசெய்து தலைப்பு மற்றும் வீடியோ கோப்பை உள்ளிடவும்', 'error');
      return;
    }
    try {
      if (editingShort) {
        await api.updateShort(editingShort.id, {
          headline: shortHeadline.trim(),
          description: shortDesc.trim() || null,
          media_url: shortMediaUrl.trim(),
          media_type: shortMediaType
        });
        onToast('வீடியோ செய்தி புதுப்பிக்கப்பட்டது!', 'check_circle');
      } else {
        await api.createShort({
          headline: shortHeadline.trim(),
          description: shortDesc.trim() || null,
          media_url: shortMediaUrl.trim(),
          media_type: shortMediaType,
          duration_seconds: 60
        });
        onToast('புதிய வீடியோ செய்தி வெளியிடப்பட்டது!', 'verified');
      }
      setIsShortModalOpen(false);
      fetchShortsList();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleDeleteShort = async (id) => {
    if (!window.confirm('இந்த வீடியோ பதிவை நீக்க விரும்புகிறீர்களா?')) return;
    try {
      await api.deleteShort(id);
      onToast('வீடியோ செய்தி நீக்கப்பட்டது', 'delete');
      fetchShortsList();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Zodiac Handlers
  const handleOpenZodiacEditor = (sign) => {
    setEditingZodiac(sign);
    setZodiacPrediction(sign.prediction_text || '');
    setZodiacLuckyNum(sign.lucky_number || '7');
    setZodiacLuckyColor(sign.lucky_color || 'மஞ்சள்');
    setZodiacLuckyDir(sign.lucky_direction || 'கிழக்கு');
    setZodiacPlanet(sign.ruling_planet || '');
  };

  const handleSaveZodiac = async (e) => {
    e.preventDefault();
    if (!editingZodiac || !zodiacPrediction.trim()) return;
    try {
      await api.updateZodiac(editingZodiac.id, {
        prediction_text: zodiacPrediction.trim(),
        lucky_number: zodiacLuckyNum.trim(),
        lucky_color: zodiacLuckyColor.trim(),
        lucky_direction: zodiacLuckyDir.trim(),
        ruling_planet: zodiacPlanet.trim()
      });
      onToast(`${editingZodiac.name_ta} ராசி பலன் புதுப்பிக்கப்பட்டது!`, 'auto_awesome');
      setEditingZodiac(null);
      fetchZodiacList();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Open Article Editor
  const handleOpenEditor = (art = null, defaultCategory = 'tamilnadu') => {
    if (art) {
      setEditingArticle(art);
      setFormTitle(art.title);
      setFormSubtitle(art.subtitle || '');
      setFormCategory(art.category_id || defaultCategory);
      setFormCoverImage(art.cover_image_url || '');
      setFormContent(art.content || '');
      setFormTags(Array.isArray(art.tags) ? art.tags.join(', ') : '');
      setFormIsLead(Boolean(art.is_lead));
    } else {
      setEditingArticle(null);
      setFormTitle('');
      setFormSubtitle('');
      setFormCategory(defaultCategory);
      setFormCoverImage('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80');
      setFormContent('');
      setFormTags('');
      setFormIsLead(false);
    }
    setIsEditorOpen(true);
  };

  // Handle Cover Image Upload
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success) {
        setFormCoverImage(res.url);
        onToast('படம் வெற்றிகரமாகப் பதிவேற்றப்பட்டது!', 'image');
      }
    } catch (err) {
      onToast(err.message || 'படம் பதிவேற்றம் தோல்வியடைந்தது', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Article Form
  const handleSaveArticle = async (asDraft = false) => {
    if (!formTitle.trim() || !formContent.trim() || !formCoverImage.trim()) {
      onToast('தயவுசெய்து தலைப்பு, செய்தி மற்றும் முகப்பு படத்தை உள்ளிடவும்', 'error');
      return;
    }

    setIsSubmittingArticle(true);
    try {
      const payload = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || null,
        category_id: formCategory,
        content: formContent.trim(),
        cover_image_url: formCoverImage.trim(),
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        is_lead: formIsLead,
        save_as_draft: asDraft
      };

      if (editingArticle) {
        await api.updateArticle(editingArticle.id, payload);
        onToast('செய்தி வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது!', 'check_circle');
      } else {
        const res = await api.createArticle(payload);
        onToast(res.message, 'verified');
      }

      setIsEditorOpen(false);
      fetchArticlesList();
      fetchDashboardStats();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message || 'செய்தி சேமிப்பதில் பிழை', 'error');
    } finally {
      setIsSubmittingArticle(false);
    }
  };

  // Approve Article (Admin)
  const handleApproveArticle = async (id) => {
    try {
      const res = await api.updateArticleStatus(id, 'published');
      onToast(res.message, 'verified');
      fetchArticlesList();
      fetchDashboardStats();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Open Rejection Dialog (Admin)
  const handleOpenReject = (id) => {
    setRejectingArticleId(id);
    setRejectionReason('தயவுசெய்து செய்தியின் ஆதாரங்களை சரிபார்த்து தலைப்பைத் திருத்தி மீண்டும் சமர்ப்பிக்கவும்.');
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectingArticleId) return;
    try {
      const res = await api.updateArticleStatus(rejectingArticleId, 'rejected', rejectionReason);
      onToast(res.message, 'cancel');
      setRejectingArticleId(null);
      fetchArticlesList();
      fetchDashboardStats();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Delete Article (Admin)
  const handleDeleteArticle = async (id) => {
    if (!window.confirm('இச்செய்தியை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?')) return;
    try {
      await api.deleteArticle(id);
      onToast('செய்தி நீக்கப்பட்டது', 'delete');
      fetchArticlesList();
      fetchDashboardStats();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Create Reporter (Admin)
  const handleCreateReporter = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createReporter({
        username: newRepUsername.trim(),
        password: newRepPassword.trim(),
        full_name: newRepFullName.trim(),
        email: newRepEmail.trim(),
        phone: newRepPhone.trim(),
        bio: newRepBio.trim()
      });
      onToast(res.message, 'person_add');
      setIsAddReporterOpen(false);
      setNewRepUsername('');
      setNewRepPassword('');
      setNewRepFullName('');
      setNewRepEmail('');
      setNewRepPhone('');
      setNewRepBio('');
      fetchReportersList();
      fetchDashboardStats();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Delete Reporter (Admin)
  const handleDeleteReporter = async (id, name) => {
    if (!window.confirm(`நிருபர் "${name}" அவர்களின் கணக்கை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?`)) return;
    try {
      await api.deleteReporter(id);
      onToast('நிருபர் கணக்கு நீக்கப்பட்டது', 'delete');
      fetchReportersList();
      fetchDashboardStats();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Add Ticker (Admin)
  const handleAddTicker = async (e) => {
    e.preventDefault();
    if (!newTickerText.trim()) return;
    try {
      await api.createTicker({ content: newTickerText.trim() });
      setNewTickerText('');
      onToast('பிரேக்கிங் செய்தி சேர்க்கப்பட்டது!', 'campaign');
      fetchTickersAndLiveWire();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleDeleteTicker = async (id) => {
    try {
      await api.deleteTicker(id);
      onToast('பிரேக்கிங் செய்தி நீக்கப்பட்டது', 'delete');
      fetchTickersAndLiveWire();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Add Live Wire (Admin or Reporter)
  const handleAddLiveWire = async (e) => {
    e.preventDefault();
    if (!newLiveWireTitle.trim()) return;
    try {
      await api.createLiveWire({
        title: newLiveWireTitle.trim(),
        is_highlight: newLiveWireHighlight
      });
      setNewLiveWireTitle('');
      setNewLiveWireHighlight(false);
      onToast('நேரலைச் செய்தி சேர்க்கப்பட்டது!', 'bolt');
      fetchTickersAndLiveWire();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleDeleteLiveWire = async (id) => {
    try {
      await api.deleteLiveWire(id);
      onToast('நேரலை செய்தி நீக்கப்பட்டது', 'delete');
      fetchTickersAndLiveWire();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Upload E-Paper (Admin)
  const handleCreateEPaper = async (e) => {
    e.preventDefault();
    try {
      await api.createEPaper({
        title: epaperTitle,
        edition_date: epaperDate,
        pdf_url: epaperPdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        cover_image_url: epaperCoverImage,
        page_count: epaperPageCount
      });
      onToast('இ-பேப்பர் பதிப்பு வெற்றிகரமாகப் பதிவேற்றப்பட்டது!', 'newspaper');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  // Create Poll (Admin)
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPollQuestion.trim()) return;
    try {
      await api.createPoll({
        question: newPollQuestion.trim(),
        options: newPollOptions.filter(o => o.trim())
      });
      onToast('புதிய கருத்துக்கணிப்பு வெளியிடப்பட்டது!', 'how_to_vote');
      setNewPollQuestion('');
      fetchTickersAndLiveWire();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  return (
    <div class="fixed inset-0 z-50 modal-backdrop flex flex-col bg-slate-900/90 overflow-hidden">
      {/* TOP BAR */}
      <header class="bg-white dark:bg-[#090F1F] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-md">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-red via-red-600 to-amber-500 text-white flex items-center justify-center shadow-md">
            <span class="material-symbols-outlined text-[24px]">
              {isAdmin ? 'admin_panel_settings' : 'edit_document'}
            </span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-title font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {isAdmin ? 'அமேஸ் டைம்ஸ் முதன்மை கட்டுப்பாட்டகம் (Admin Console)' : 'நிருபர் செய்திப் பணிமனை (Reporter Workbench)'}
              </h2>
              <span class={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                isAdmin ? 'bg-red-500/20 text-brand-red border border-red-500/30' : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
              }`}>
                {currentUser.role}
              </span>
            </div>
            <p class="font-subtitle text-[11px] text-slate-500 dark:text-slate-400">
              பயனர்: <strong class="text-slate-800 dark:text-slate-200">{currentUser.full_name}</strong> • தரவுத்தளம்: <span class="text-emerald-500 font-bold">Neon PostgreSQL இணைக்கப்பட்டுள்ளது</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div class="flex items-center gap-2.5 font-subtitle text-xs">
          {/* Real-time Unique Visitors Live Badge */}
          {stats?.visitors && (
            <div class="hidden md:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl font-bold shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>இன்றைய வாசகர்கள்:</span>
              <strong class="font-black text-sm">{stats.visitors.today_uniques}</strong>
            </div>
          )}

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              class="bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-xl font-bold transition-all border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
              title="முதன்மை செய்தித் தளத்திற்குச் செல்க"
            >
              <span class="material-symbols-outlined text-[18px]">public</span>
              <span class="hidden sm:inline">செய்தி முகப்பு</span>
            </button>
          )}

          <button
            onClick={() => handleOpenEditor()}
            class="load-more-btn font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>புதிய செய்தி</span>
          </button>

          <button
            onClick={onLogout}
            class="bg-slate-100 dark:bg-slate-800 hover:bg-red-100 hover:text-brand-red text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
            title="வெளியேறு"
          >
            <span class="material-symbols-outlined text-[18px]">logout</span>
            <span class="hidden sm:inline">வெளியேறு</span>
          </button>

          <button
            onClick={onClose}
            class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="மூடுக"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD NAVIGATION RIBBON */}
      <div class="bg-white/80 dark:bg-[#0A1224]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 overflow-x-auto scrollbar-none flex-shrink-0">
        <nav class="flex items-center gap-2 py-2 text-xs font-subtitle font-bold whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            class={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span class="material-symbols-outlined text-[18px]">analytics</span>
            <span>புள்ளிவிவர மேலோட்டம்</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('approvals')}
              class={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer relative font-bold text-xs ${
                activeTab === 'approvals'
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span class={`material-symbols-outlined text-[18px] ${activeTab === 'approvals' ? 'text-white' : 'text-amber-500'}`}>
                verified
              </span>
              <span>ஒப்புதல் வரிசை</span>
              {stats?.articles?.pending > 0 && (
                <span
                  class={`text-[10px] font-black rounded-full px-2.5 py-0.5 shadow-sm inline-flex items-center justify-center leading-none tracking-wide ${
                    activeTab === 'approvals'
                      ? 'bg-white text-brand-red ring-1 ring-white/50'
                      : 'bg-amber-500 text-slate-950 ring-1 ring-amber-600/30'
                  }`}
                  style={{
                    color: activeTab === 'approvals' ? '#DC2626' : '#0F172A',
                    backgroundColor: activeTab === 'approvals' ? '#FFFFFF' : '#F59E0B'
                  }}
                >
                  {stats.articles.pending} நிலுவை
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('articles')}
            class={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span class="material-symbols-outlined text-[18px]">newspaper</span>
            <span>செய்திகள் மேலாண்மை ({articles.length})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('reporters')}
              class={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reporters'
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span class="material-symbols-outlined text-[18px]">group</span>
              <span>நிருபர்கள் பட்டியல் ({reporters.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('ticker_livewire')}
            class={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ticker_livewire'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span class="material-symbols-outlined text-[18px]">campaign</span>
            <span>பிரேக்கிங் & நேரலை</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            class={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span class="material-symbols-outlined text-[18px]">movie</span>
            <span>60வி வீடியோக்கள் ({shortsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('zodiac')}
            class={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'zodiac'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>12 ராசி பலன் (ஆன்மிகம்)</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('epaper_polls')}
              class={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'epaper_polls'
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span class="material-symbols-outlined text-[18px]">how_to_vote</span>
              <span>இ-பேப்பர் & கருத்துக்கணிப்பு</span>
            </button>
          )}
        </nav>
      </div>

      {/* DASHBOARD CONTENT BODY */}
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-[#060A14] text-slate-900 dark:text-white">
        
        {/* ========================================================
            TAB 1: OVERVIEW & ANALYTICS
            ======================================================== */}
        {activeTab === 'overview' && (
          <div class="space-y-6 max-w-7xl mx-auto">
            {/* Real-time Live Engine Status Banner */}
            <div class="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-500/30 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 font-subtitle text-xs">
              <div class="flex items-center gap-2">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span class="font-extrabold text-emerald-700 dark:text-emerald-400">நேரலை வாசகர்கள் கண்காணிப்பு (Real-Time Live Tracking)</span>
                <span class="hidden sm:inline text-slate-500 dark:text-slate-400">• சாதன முகவரி & தனித்துவ அடையாளம் மூலம் ஒவ்வொரு வாசகரும் துல்லியமாக கணக்கிடப்படுகிறார்</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">நேரலை புதுப்பிப்பு: 4வி</span>
                <button
                  onClick={fetchDashboardStats}
                  class="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <span class="material-symbols-outlined text-[14px] text-emerald-500">refresh</span>
                  <span>புதுப்பி</span>
                </button>
              </div>
            </div>

            {/* Top Metrics Cards */}
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Active Online Viewers Right Now (Real-Time) */}
              <div class="bg-white dark:bg-[#0D1424] p-4 rounded-2xl shadow-sm border-2 border-emerald-500/40 space-y-1 relative overflow-hidden">
                <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-subtitle font-bold">
                  <span>தற்போது நேரலையில்</span>
                  <span class="material-symbols-outlined text-[20px] text-emerald-500 animate-pulse">sensors</span>
                </div>
                <div class="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>{stats?.visitors?.active_now ?? 1}</span>
                  <span class="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    LIVE
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 font-semibold">
                  களத்தில் வாசிக்கும் வாசகர்கள்
                </div>
              </div>

              {/* Unique Visitors Today */}
              <div class="bg-white dark:bg-[#0D1424] p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
                <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-subtitle font-bold">
                  <span>இன்றைய தனித்துவ வாசகர்கள்</span>
                  <span class="material-symbols-outlined text-[20px] text-blue-500">person</span>
                </div>
                <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.visitors?.today_uniques ?? 0}
                </div>
                <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span>நேற்று: {stats?.visitors?.yesterday_uniques ?? 0}</span>
                  <span>• மொத்தம்: {stats?.visitors?.all_time_uniques ?? 0}</span>
                </div>
              </div>

              {/* All Time Unique Viewers */}
              <div class="bg-white dark:bg-[#0D1424] p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
                <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-subtitle font-bold">
                  <span>வாழ்நாள் தனித்துவ வாசகர்கள்</span>
                  <span class="material-symbols-outlined text-[20px] text-indigo-500">groups</span>
                </div>
                <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.visitors?.all_time_uniques ?? 0}
                </div>
                <div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                  நிரூபிக்கப்பட்ட தனித்துவ வாசகர்கள்
                </div>
              </div>

              {/* Published Articles */}
              <div class="bg-white dark:bg-[#0D1424] p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
                <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-subtitle font-bold">
                  <span>வெளியிடப்பட்ட செய்திகள்</span>
                  <span class="material-symbols-outlined text-[20px] text-brand-red">newspaper</span>
                </div>
                <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.articles?.published ?? 0}
                </div>
                <div class="text-[11px] text-emerald-500 font-bold">
                  நேரலை தளத்தில் உள்ளது
                </div>
              </div>

              {/* Pending Approval */}
              <div class="bg-white dark:bg-[#0D1424] p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
                <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-subtitle font-bold">
                  <span>ஒப்புதல் நிலுவை வரிசை</span>
                  <span class="material-symbols-outlined text-[20px] text-amber-500">pending_actions</span>
                </div>
                <div class="text-2xl sm:text-3xl font-extrabold text-amber-500">
                  {stats?.articles?.pending ?? 0}
                </div>
                <div class="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  {isAdmin ? 'நிர்வாகியின் பார்வைக்காக' : 'உங்கள் சமர்ப்பிப்பு'}
                </div>
              </div>
            </div>


            {/* Middle Section: Trends & Trending Articles */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Visitor Volume Bar Graph */}
              <div class="lg:col-span-2 bg-white dark:bg-[#0D1424] p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-subtitle font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px] text-emerald-500">trending_up</span>
                    <span>கடந்த 14 நாட்களின் வாசகர் வரத்து புள்ளிவிவரம்</span>
                  </h3>
                  <span class="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    Neon DB Live
                  </span>
                </div>

                <div class="space-y-3 pt-2">
                  {stats?.visitor_trend?.length > 0 ? (
                    stats.visitor_trend.map((row, idx) => {
                      const maxUniques = Math.max(...stats.visitor_trend.map(r => parseInt(r.unique_count || 1)), 10);
                      const pct = Math.min(100, Math.round((parseInt(row.unique_count) / maxUniques) * 100));
                      return (
                        <div key={idx} class="space-y-1 font-subtitle text-xs">
                          <div class="flex items-center justify-between text-slate-600 dark:text-slate-400 font-bold">
                            <span>{row.date_label}</span>
                            <span>{row.unique_count} தனித்துவ வாசகர்கள்</span>
                          </div>
                          <div class="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div
                              class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, 12)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div class="text-center py-8 text-xs text-slate-500">
                      புள்ளிவிவர தரவுகள் பதிவாகி வருகின்றன...
                    </div>
                  )}
                </div>
              </div>

              {/* Top Trending Articles */}
              <div class="bg-white dark:bg-[#0D1424] p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 class="font-subtitle font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-[20px] text-brand-red">local_fire_department</span>
                  <span>அதிகம் வாசிக்கப்பட்ட செய்திகள்</span>
                </h3>

                <div class="space-y-3">
                  {stats?.top_articles?.map((art, idx) => (
                    <div
                      key={art.id}
                      class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                    >
                      <span class="w-6 h-6 rounded-lg bg-brand-red/10 text-brand-red font-black text-xs flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-title font-bold text-xs line-clamp-1 text-slate-900 dark:text-white">
                          {art.title}
                        </h4>
                        <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-subtitle">
                          <span>{art.category_id}</span>
                          <span>•</span>
                          <span class="text-amber-500 font-bold">{art.view_count} பார்வைகள்</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Section: Category Share & Reporter Leaderboard */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section Strength Breakdown (Requested by user) */}
              <div class="bg-white dark:bg-[#0D1424] p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <h3 class="font-subtitle font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px] text-emerald-500">signal_cellular_alt</span>
                    <span>பிரிவு வாரியான செய்தி வலிமை (Section Strength)</span>
                  </h3>
                  <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                    🟢 அனைத்து பிரிவுகளும் வலிமையானவை
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-subtitle">
                  ஒவ்வொரு பிரிவிலும் வாசகர்களுக்கு போதுமான அளவு (5+ செய்திகள்) உள்ளடக்கம் உள்ளதா என்பதை உறுதி செய்யும் பகுதி:
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  {[
                    { id: 'tamilnadu', name_ta: 'தமிழ்நாடு', icon: 'location_on', color: 'text-red-500' },
                    { id: 'districts', name_ta: 'மாவட்டங்கள்', icon: 'location_city', color: 'text-amber-500' },
                    { id: 'india', name_ta: 'இந்தியா', icon: 'flag', color: 'text-blue-500' },
                    { id: 'world', name_ta: 'உலகம்', icon: 'public', color: 'text-indigo-500' },
                    { id: 'business', name_ta: 'வணிகம்', icon: 'trending_up', color: 'text-emerald-500' },
                    { id: 'sports', name_ta: 'விளையாட்டு', icon: 'sports_cricket', color: 'text-orange-500' },
                    { id: 'cinema', name_ta: 'சினிமா', icon: 'movie', color: 'text-purple-500' },
                    { id: 'spiritual', name_ta: 'ஆன்மிகம்', icon: 'auto_awesome', color: 'text-amber-600' },
                    { id: 'editorial', name_ta: 'தலையங்கம்', icon: 'edit_note', color: 'text-rose-600' }
                  ].map((sec) => {
                    const foundStat = stats?.categories?.find(c => c.id === sec.id);
                    const count = foundStat ? parseInt(foundStat.article_count || 0) : 0;
                    const strengthLabel = count >= 5 ? 'உயர் வலிமை' : count >= 3 ? 'நடுத்தரம்' : 'குறைவு';
                    const strengthBadge = count >= 5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' : count >= 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';

                    return (
                      <div
                        key={sec.id}
                        class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between gap-2 hover:border-slate-300 transition-all"
                      >
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-1.5 font-subtitle text-xs font-bold text-slate-800 dark:text-slate-200">
                            <span class={`material-symbols-outlined text-[18px] ${sec.color}`}>{sec.icon}</span>
                            <span>{sec.name_ta}</span>
                          </div>
                          <span class="w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-slate-700 font-extrabold text-[11px] flex items-center justify-center shadow-sm">
                            {count}
                          </span>
                        </div>
                        <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/40 text-[10px] font-subtitle">
                          <span class={`px-2 py-0.5 rounded-md font-extrabold border ${strengthBadge}`}>
                            {strengthLabel}
                          </span>
                          <button
                            onClick={() => handleOpenEditor(null, sec.id)}
                            class="text-brand-red hover:text-red-700 font-bold flex items-center gap-0.5 cursor-pointer"
                            title={`${sec.name_ta} பிரிவுக்கு புதிய செய்தி சேர்க்க`}
                          >
                            <span class="material-symbols-outlined text-[14px]">add</span>
                            <span>சேர்க்க</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reporters Leaderboard */}
              <div class="bg-white dark:bg-[#0D1424] p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <h3 class="font-subtitle font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px] text-indigo-500">military_tech</span>
                    <span>நிருபர்கள் செயல்திறன் பட்டியல்</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('reporters')}
                    class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>அனைத்து நிருபர்கள் ({reporters.length})</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
                <div class="space-y-2 pt-1">
                  {stats?.reporters_leaderboard?.map((rep) => (
                    <div
                      key={rep.id}
                      class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-subtitle"
                    >
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white">{rep.full_name}</div>
                        <div class="text-[10px] text-slate-500">@{rep.username}</div>
                      </div>
                      <div class="text-right">
                        <div class="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {rep.published} செய்திகள் வெளியீடு
                        </div>
                        <div class="text-[10px] text-slate-500">
                          {rep.total_views} மொத்த பார்வைகள்
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comprehensive Content Addition Workflow Guide (Requested by user) */}
            <div class="bg-white dark:bg-[#0D1424] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div>
                  <h3 class="font-title font-bold text-base md:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-[24px] text-brand-red">menu_book</span>
                    <span>அமேஸ் டைம்ஸ் உள்ளடக்க மேலாண்மை கையேடு (How to Add & Manage Content)</span>
                  </h3>
                  <p class="font-subtitle text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    தளத்தில் செய்திகள், காணொளிகள், ஆன்மிக பலன்கள், நேரலை அறிவிப்புகள் எவ்வாறு சேர்க்கப்பட்டு நிர்வகிக்கப்படுகின்றன என்பதற்கான முழு விளக்கம்:
                  </p>
                </div>
                <span class="hidden md:inline-flex bg-brand-red/10 text-brand-red font-black text-xs px-3 py-1 rounded-full border border-brand-red/20 font-subtitle">
                  முழு நிர்வாக அதிகாரம் (Full Admin Control)
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-subtitle">
                {/* 1. News Articles */}
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div class="flex items-center gap-2 text-brand-red font-bold text-sm">
                    <span class="material-symbols-outlined text-[20px]">newspaper</span>
                    <span>1. செய்திகள் சேர்க்க & நிர்வகிக்க</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    மேல் வலதுபுறத்தில் உள்ள <strong>'+ புதிய செய்தி'</strong> பொத்தானை அழுத்தவும். தலைப்பு, பிரிவு (தமிழ்நாடு, மாவட்டங்கள், வணிகம், முதலியன), முகப்பு படம் (பதிவேற்றம்/URL), மற்றும் முழு செய்தியை உள்ளிட்டு <strong>'உடனடி நேரலை'</strong> அல்லது <strong>'வரைவாக சேமி'</strong> அழுத்தவும்.
                  </p>
                  <div class="text-[11px] text-slate-500 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
                    💡 <strong>திருத்த & நீக்க:</strong> 'செய்திகள் மேலாண்மை' தாவலில் எந்த செய்தியையும் ஒரு கிளிக்கில் திருத்தலாம் அல்லது நீக்கலாம்.
                  </div>
                </div>

                {/* 2. 60-Sec Video Reels */}
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <span class="material-symbols-outlined text-[20px]">movie</span>
                    <span>2. 60-வினாடி வீடியோக்கள் (Shorts)</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>'60வி வீடியோக்கள்'</strong> தாவலைத் திறந்து <strong>'+ புதிய வீடியோ சேர்க்க'</strong> அழுத்தவும். வீடியோ தலைப்பு, சிறு விளக்கம் மற்றும் MP4 வீடியோ இணைப்பை உள்ளிட்டு சேமிக்கவும். வாசகர்களுக்கு முகப்புப் பக்கத்தின் வலது பத்தியில் ரீல்ஸ் வடிவத்தில் காண்பிக்கப்படும்.
                  </p>
                  <div class="text-[11px] text-slate-500 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
                    💡 <strong>அம்சங்கள்:</strong> வீடியோக்களை எப்போது வேண்டுமானாலும் திருத்தலாம் அல்லது நிரந்தரமாக நீக்கலாம்.
                  </div>
                </div>

                {/* 3. 12 Zodiac Signs */}
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <span class="material-symbols-outlined text-[20px]">auto_awesome</span>
                    <span>3. 12 ராசி பலன் (ஆன்மிகம்)</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>'12 ராசி பலன் (ஆன்மிகம்)'</strong> தாவலில் மேஷம் முதல் மீனம் வரையிலான 12 ராசிகளின் பட்டியல் இருக்கும். எந்த ராசியின் பக்கத்திலும் <strong>'பலனைத் திருத்து'</strong> அழுத்தி தினசரி பலன், அதிர்ஷ்ட எண், நிறம், திசையை மாற்றி சேமித்தால் தளத்தில் உடனே மாறும்.
                  </p>
                  <div class="text-[11px] text-slate-500 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
                    💡 <strong>காட்சி:</strong> முகப்பு பக்கத்திலும் புதிய 'ஆன்மிகம்' விரிவுப் பக்கத்திலும் ஒரே நேரத்தில் பிரதிபலிக்கும்.
                  </div>
                </div>

                {/* 4. Breaking Ticker & Live Wire */}
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <span class="material-symbols-outlined text-[20px]">campaign</span>
                    <span>4. பிரேக்கிங் & நேரலை மேலாண்மை</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>'பிரேக்கிங் & நேரலை'</strong> தாவலை அணுகி, மேல் ஓடும் சிவப்பு நிற தலைப்புச் செய்திகளுக்கான (Ticker) வரிகளை சேர்க்கலாம் மற்றும் நேரலை களச் செய்திகளுக்கான (Live Wire) துரித நிகழ்வுகளை உடனடியாக பதிவு செய்யலாம்.
                  </p>
                  <div class="text-[11px] text-slate-500 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
                    💡 <strong>நேரடி ஒளிபரப்பு:</strong> புதிய பிரேக்கிங் செய்தி சேர்க்கப்பட்ட அடுத்த நொடியே அனைத்து வாசகர்களுக்கும் சுழலும்.
                  </div>
                </div>

                {/* 5. E-Paper & Polls */}
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <span class="material-symbols-outlined text-[20px]">how_to_vote</span>
                    <span>5. இ-பேப்பர் & வாசகர் கருத்துக்கணிப்பு</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>'இ-பேப்பர் & கருத்துக்கணிப்பு'</strong> தாவலில் அன்றைய நாளிதழ் பிடிஎஃப் பதிவேற்றம் செய்யலாம். வாசகர்களுக்கான சமகால அரசியல்/சமூக கருத்துக்கணிப்பு கேள்விகளையும் 3 விடைக் குறிப்புகளையும் உருவாக்கி வாக்குகளை திரட்டலாம்.
                  </p>
                  <div class="text-[11px] text-slate-500 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
                    💡 <strong>ஊடாட்டம்:</strong> வாசகர்கள் தளத்தில் வாக்களித்தவுடன் சதவிகித முடிவுகள் வெளிப்படும்.
                  </div>
                </div>

                {/* 6. Main Page Cleanliness & Admin Access Security */}
                <div class="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2">
                  <div class="flex items-center gap-2 text-brand-red font-bold text-sm">
                    <span class="material-symbols-outlined text-[20px]">security</span>
                    <span>6. முதன்மைப் பக்க பாதுகாப்பு உறுதிமொழி</span>
                  </div>
                  <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    பொது வாசகர்களுக்கு முதன்மைப் பக்கத்தில் எந்தவொரு <strong>'திருத்து' (Edit)</strong> அல்லது <strong>'நீக்கு' (Delete)</strong> பொத்தான்களும் காட்டப்படாது. அவை அனைத்தும் முழுமையாக நீக்கப்பட்டு தூய நாளிதழ் தளமாக மாற்றப்பட்டுள்ளது.
                  </p>
                  <div class="text-[11px] text-brand-red bg-white dark:bg-slate-900/70 p-2 rounded-lg border border-red-200 dark:border-red-800 font-bold">
                    🛡️ <strong>நிர்வாகி அணுகல்:</strong> உள்நுழைவு (/login) வழியாக இந்த கட்டுப்பாட்டகத்திற்கு (/admin) வரும் நிர்வாகி மட்டுமே Add, Edit, Delete பணிகளை மேற்கொள்ள முடியும்.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: APPROVAL QUEUE (ADMIN ONLY)
            ======================================================== */}
        {activeTab === 'approvals' && isAdmin && (
          <div class="space-y-6 max-w-7xl mx-auto">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-[24px] text-amber-500">verified</span>
                  <span>நிருபர்களின் செய்திகள் ஒப்புதல் வரிசை (Editorial Review)</span>
                </h3>
                <p class="font-subtitle text-xs text-slate-500 dark:text-slate-400">
                  நிருபர்கள் சமர்ப்பித்த செய்திகளை சரிபார்த்து தளத்தில் வெளியிட அல்லது நிராகரிக்கவும்
                </p>
              </div>
              <button
                onClick={fetchArticlesList}
                class="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-xs font-bold font-subtitle flex items-center gap-1 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">refresh</span>
                <span>புதுப்பி</span>
              </button>
            </div>

            {/* Pending Articles List */}
            {articles.filter(a => a.status === 'pending_approval').length === 0 ? (
              <div class="bg-white dark:bg-[#0D1424] rounded-3xl p-12 text-center space-y-3 border border-slate-200 dark:border-slate-800">
                <span class="material-symbols-outlined text-emerald-500 text-[48px]">check_circle</span>
                <h4 class="font-title font-bold text-lg text-slate-900 dark:text-white">
                  ஒப்புதல் நிலுவையில் எந்த செய்தியும் இல்லை!
                </h4>
                <p class="font-subtitle text-xs text-slate-500">
                  அனைத்து நிருபர்களின் செய்திகளும் வெற்றிகரமாக மதிப்பாய்வு செய்யப்பட்டு வெளியிடப்பட்டுவிட்டன.
                </p>
              </div>
            ) : (
              <div class="grid grid-cols-1 gap-4">
                {articles.filter(a => a.status === 'pending_approval').map((art) => (
                  <div
                    key={art.id}
                    class="bg-white dark:bg-[#0D1424] rounded-2xl p-5 shadow-sm border-2 border-amber-400/40 space-y-4"
                  >
                    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div class="flex items-start gap-3">
                        <img
                          src={art.cover_image_url}
                          alt="Cover"
                          class="w-24 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="bg-amber-400/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] px-2 py-0.5 rounded">
                              நிலுவை (PENDING APPROVAL)
                            </span>
                            <span class="bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-[10px] px-2 py-0.5 rounded">
                              {art.category_name || art.category_id}
                            </span>
                          </div>
                          <h4 class="font-title font-bold text-base text-slate-900 dark:text-white leading-snug">
                            {art.title}
                          </h4>
                          {art.subtitle && (
                            <p class="font-subtitle text-xs text-slate-600 dark:text-slate-400">
                              {art.subtitle}
                            </p>
                          )}
                          <p class="text-[11px] text-slate-500 font-subtitle">
                            நிருபர்: <strong class="text-slate-800 dark:text-slate-200">{art.author_name}</strong> • சமர்ப்பிக்கப்பட்டது: {new Date(art.created_at).toLocaleString('ta-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div class="flex sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApproveArticle(art.id)}
                          class="bg-emerald-600 hover:bg-emerald-700 text-white font-subtitle font-bold text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-[18px]">done_all</span>
                          <span>அங்கீகரித்து வெளியிடு</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditor(art)}
                          class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-subtitle font-bold text-xs px-4 py-2 rounded-xl transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                          <span>திருத்து</span>
                        </button>
                        <button
                          onClick={() => handleOpenReject(art.id)}
                          class="bg-red-50 dark:bg-red-950/60 hover:bg-red-600 text-red-600 hover:text-white font-subtitle font-bold text-xs px-4 py-2 rounded-xl transition-all border border-red-200 dark:border-red-900 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-[18px]">block</span>
                          <span>நிராகரி</span>
                        </button>
                      </div>
                    </div>

                    {/* Excerpt preview */}
                    <div class="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-body">
                      {art.content.slice(0, 300)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: NEWS ARTICLES MANAGEMENT (ALL, UNLIMITED)
            ======================================================== */}
        {activeTab === 'articles' && (
          <div class="space-y-6 max-w-7xl mx-auto">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-[24px] text-brand-red">newspaper</span>
                  <span>செய்திகள் மேலாண்மை (Articles Management)</span>
                </h3>
                <p class="font-subtitle text-xs text-slate-500 dark:text-slate-400">
                  முழுமையான செய்தித் தொகுப்பு • நேரலை வெளியீடுகள் மற்றும் வரைவுகள்
                </p>
              </div>
              <button
                onClick={() => handleOpenEditor()}
                class="load-more-btn font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
              >
                <span class="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ புதிய செய்தி எழுதுக</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div class="flex flex-wrap items-center gap-3 bg-white dark:bg-[#0D1424] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-subtitle">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-slate-500">நிலை:</span>
                <select
                  value={articleStatusFilter}
                  onChange={(e) => setArticleStatusFilter(e.target.value)}
                  class="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold"
                >
                  <option value="all">அனைத்தும்</option>
                  <option value="published">வெளியிடப்பட்டவை (Published)</option>
                  <option value="pending_approval">ஒப்புதல் நிலுவை (Pending)</option>
                  <option value="rejected">நிராகரிக்கப்பட்டவை (Rejected)</option>
                  <option value="draft">வரைவுகள் (Draft)</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="font-bold text-slate-500">பிரிவு:</span>
                <select
                  value={articleCategoryFilter}
                  onChange={(e) => setArticleCategoryFilter(e.target.value)}
                  class="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold"
                >
                  <option value="all">அனைத்துப் பிரிவுகள்</option>
                  <option value="tamilnadu">தமிழ்நாடு</option>
                  <option value="india">இந்தியா</option>
                  <option value="world">உலகம்</option>
                  <option value="cinema">சினிமா</option>
                  <option value="business">வணிகம்</option>
                  <option value="sports">விளையாட்டு</option>
                  <option value="tech">தொழில்நுட்பம்</option>
                  <option value="spiritual">ஆன்மிகம்</option>
                </select>
              </div>

              <div class="flex-1 min-w-[180px]">
                <input
                  type="text"
                  placeholder="செய்தி தலைப்பைத் தேட..."
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchArticlesList()}
                  class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <button
                onClick={fetchArticlesList}
                class="bg-brand-red text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">search</span>
                <span>தேடு</span>
              </button>
            </div>

            {/* Articles Table */}
            <div class="bg-white dark:bg-[#0D1424] rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs font-subtitle">
                  <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th class="py-3 px-4">செய்தி விவரம்</th>
                      <th class="py-3 px-4">பிரிவு</th>
                      <th class="py-3 px-4">ஆசிரியர் / நிருபர்</th>
                      <th class="py-3 px-4">நிலை</th>
                      <th class="py-3 px-4">பார்வைகள்</th>
                      <th class="py-3 px-4">வெளியீடு</th>
                      <th class="py-3 px-4 text-right">செயல்கள்</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                    {isLoadingArticles ? (
                      <tr>
                        <td colSpan="7" class="py-12 text-center text-slate-500 font-subtitle">
                          <div class="flex items-center justify-center gap-2">
                            <span class="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin"></span>
                            <span>செய்திகள் ஏற்றப்படுகின்றன...</span>
                          </div>
                        </td>
                      </tr>
                    ) : articles.length === 0 ? (
                      <tr>
                        <td colSpan="7" class="py-12 text-center text-slate-500 font-subtitle">
                          <div class="flex flex-col items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[36px] text-slate-400">article</span>
                            <span>செய்திகள் எதுவும் கிடைக்கவில்லை (No articles found)</span>
                            <button
                              onClick={() => handleOpenEditor()}
                              class="mt-2 text-xs text-brand-red font-bold hover:underline"
                            >
                              + புதிய செய்தி எழுதுக
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      articles.map((art) => (
                        <tr key={art.id} class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td class="py-3.5 px-4 max-w-sm">
                            <div class="flex items-center gap-2.5">
                              <img
                                src={art.cover_image_url}
                                alt="thumb"
                                class="w-12 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                              />
                              <div>
                                <div class="font-title font-bold text-slate-900 dark:text-white line-clamp-1">
                                  {art.title}
                                </div>
                                {art.is_lead && (
                                  <span class="text-[9px] bg-red-100 dark:bg-red-950 text-brand-red font-black px-1.5 py-0.2 rounded">
                                    முக்கியத் தலைப்பு
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td class="py-3.5 px-4 font-bold text-slate-600 dark:text-slate-300">
                            {art.category_name || art.category_id}
                          </td>
                          <td class="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {art.author_name}
                          </td>
                          <td class="py-3.5 px-4">
                            <span class={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              art.status === 'published'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                : art.status === 'pending_approval'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                                : art.status === 'rejected'
                                ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {art.status === 'published' ? 'வெளியிடப்பட்டது' :
                               art.status === 'pending_approval' ? 'ஒப்புதல் நிலுவை' :
                               art.status === 'rejected' ? 'நிராகரிக்கப்பட்டது' : 'வரைவு'}
                            </span>
                          </td>
                          <td class="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                            {art.view_count}
                          </td>
                          <td class="py-3.5 px-4 text-slate-500 text-[11px]">
                            {art.published_at ? new Date(art.published_at).toLocaleDateString('ta-IN') : 'இல்லை'}
                          </td>
                          <td class="py-3.5 px-4 text-right">
                            <div class="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditor(art)}
                                class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                                title="திருத்து"
                              >
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteArticle(art.id)}
                                  class="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 text-red-500 cursor-pointer"
                                  title="நீக்கு"
                                >
                                  <span class="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: REPORTERS MANAGEMENT (ADMIN ONLY)
            ======================================================== */}
        {activeTab === 'reporters' && isAdmin && (
          <div class="space-y-6 max-w-7xl mx-auto">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-[24px] text-indigo-500">group</span>
                  <span>நிருபர்கள் நிர்வாகம் (Reporters Management)</span>
                </h3>
                <p class="font-subtitle text-xs text-slate-500 dark:text-slate-400">
                  செய்தி நிருபர்களை உருவாக்குங்கள், கடவுச்சொல் மாற்றவும், அணுகலை நிர்வகிக்கவும்
                </p>
              </div>
              <button
                onClick={() => setIsAddReporterOpen(true)}
                class="load-more-btn font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">person_add</span>
                <span>+ புதிய நிருபர் சேர்க்க</span>
              </button>
            </div>

            {/* Reporters Directory Grid */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reporters.map((rep) => (
                <div
                  key={rep.id}
                  class="bg-white dark:bg-[#0D1424] p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between"
                >
                  <div class="space-y-3">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg flex items-center justify-center border border-indigo-500/20">
                          {rep.full_name.charAt(0)}
                        </div>
                        <div>
                          <h4 class="font-title font-bold text-base text-slate-900 dark:text-white">
                            {rep.full_name}
                          </h4>
                          <p class="font-subtitle text-xs text-slate-500">
                            @{rep.username} • {rep.phone || 'எண் இல்லை'}
                          </p>
                        </div>
                      </div>
                      <span class={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rep.is_active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-600'
                      }`}>
                        {rep.is_active ? 'செயலில் உள்ளது' : 'முடக்கப்பட்டது'}
                      </span>
                    </div>

                    <p class="font-body text-xs text-slate-600 dark:text-slate-400">
                      {rep.bio || 'அமேஸ் டைம்ஸ் செய்திப் பிரிவு நிருபர்.'}
                    </p>

                    <div class="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl text-center font-subtitle text-xs">
                      <div>
                        <div class="font-black text-slate-900 dark:text-white">{rep.published_count || 0}</div>
                        <div class="text-[10px] text-slate-500">வெளியீடு</div>
                      </div>
                      <div>
                        <div class="font-black text-amber-500">{rep.pending_count || 0}</div>
                        <div class="text-[10px] text-slate-500">நிலுவை</div>
                      </div>
                      <div>
                        <div class="font-black text-slate-900 dark:text-white">{rep.total_articles || 0}</div>
                        <div class="text-[10px] text-slate-500">மொத்தம்</div>
                      </div>
                    </div>
                  </div>

                  <div class="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-subtitle">
                    <span class="text-[11px] text-slate-400">
                      மின்னஞ்சல்: {rep.email}
                    </span>
                    <button
                      onClick={() => handleDeleteReporter(rep.id, rep.full_name)}
                      class="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer p-1"
                      title="நீக்கு"
                    >
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                      <span>நீக்கு</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: BREAKING TICKER & LIVE WIRE
            ======================================================== */}
        {activeTab === 'ticker_livewire' && (
          <div class="space-y-8 max-w-7xl mx-auto">
            {/* Breaking News Ticker Manager */}
            <div class="bg-white dark:bg-[#0D1424] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-title font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-red text-[24px]">campaign</span>
                    <span>பிரேக்கிங் செய்தி ஓடை (Breaking Ticker)</span>
                  </h3>
                  <p class="font-subtitle text-xs text-slate-500">தளத்தின் தலைப்பில் சிவப்புக் கோட்டில் ஓடும் முக்கியத் தகவல்கள்</p>
                </div>
              </div>

              {isAdmin && (
                <form onSubmit={handleAddTicker} class="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newTickerText}
                    onChange={(e) => setNewTickerText(e.target.value)}
                    placeholder="புதிய பிரேக்கிங் செய்தி உரை உள்ளிடவும்..."
                    class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                  <button
                    type="submit"
                    class="bg-brand-red hover:bg-red-700 text-white font-subtitle font-bold text-xs px-5 py-2 rounded-xl transition-all shadow flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>+ சேர்க்க</span>
                  </button>
                </form>
              )}

              <div class="space-y-2 pt-2">
                {tickers.map((t) => (
                  <div
                    key={t.id}
                    class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-subtitle font-bold"
                  >
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
                      <span>{t.content}</span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTicker(t.id)}
                        class="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="நீக்கு"
                      >
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Wire Feed Manager */}
            <div class="bg-white dark:bg-[#0D1424] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-title font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-amber-500 text-[24px]">bolt</span>
                    <span>நேரலை செய்திகள் டைம்லைன் (Live Wire)</span>
                  </h3>
                  <p class="font-subtitle text-xs text-slate-500">24/7 நொடிக்கு நொடி நடக்கும் முக்கிய நிகழ்வுகள் பதிவு</p>
                </div>
              </div>

              <form onSubmit={handleAddLiveWire} class="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  required
                  value={newLiveWireTitle}
                  onChange={(e) => setNewLiveWireTitle(e.target.value)}
                  placeholder="நேரலை தலைப்பு (எ.கா: சென்னை மெரினாவில் மக்கள் உற்சாகம்)..."
                  class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none w-full"
                />
                <label class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLiveWireHighlight}
                    onChange={(e) => setNewLiveWireHighlight(e.target.checked)}
                    class="rounded text-brand-red"
                  />
                  <span>சிறப்பு முன்னிலை (Highlight)</span>
                </label>
                <button
                  type="submit"
                  class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-subtitle font-bold text-xs px-5 py-2 rounded-xl transition-all shadow flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>+ நேரலையில் இடுக</span>
                </button>
              </form>

              <div class="space-y-2 pt-2">
                {liveWireItems.map((lw) => (
                  <div
                    key={lw.id}
                    class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-subtitle"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class={`text-[11px] font-black px-2 py-0.5 rounded ${lw.is_highlight ? 'bg-red-100 text-brand-red' : 'bg-slate-200 text-slate-700'}`}>
                        {lw.time_badge}
                      </span>
                      <span class="font-bold text-slate-900 dark:text-white">{lw.title}</span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteLiveWire(lw.id)}
                        class="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="நீக்கு"
                      >
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: EPAPER & POLLS (ADMIN ONLY)
            ======================================================== */}
        {activeTab === 'epaper_polls' && isAdmin && (
          <div class="space-y-8 max-w-7xl mx-auto">
            {/* E-Paper Manager */}
            <div class="bg-white dark:bg-[#0D1424] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 class="font-title font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-red text-[24px]">newspaper</span>
                <span>அமேஸ் இ-பேப்பர் (E-Paper) பதிவேற்றம்</span>
              </h3>

              <form onSubmit={handleCreateEPaper} class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-subtitle">
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">பதிப்பின் தலைப்பு:</label>
                  <input
                    type="text"
                    required
                    value={epaperTitle}
                    onChange={(e) => setEpaperTitle(e.target.value)}
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-semibold"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">பதிப்புத் தேதி:</label>
                  <input
                    type="date"
                    required
                    value={epaperDate}
                    onChange={(e) => setEpaperDate(e.target.value)}
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-semibold"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">PDF பதிவிறக்க இணைப்பு (URL):</label>
                  <input
                    type="text"
                    value={epaperPdfUrl}
                    onChange={(e) => setEpaperPdfUrl(e.target.value)}
                    placeholder="https://.../amaze_times.pdf"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-semibold"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">பக்கங்களின் எண்ணிக்கை:</label>
                  <input
                    type="number"
                    value={epaperPageCount}
                    onChange={(e) => setEpaperPageCount(Number(e.target.value))}
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-semibold"
                  />
                </div>
                <div class="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    class="load-more-btn font-extrabold px-6 py-2.5 rounded-xl shadow cursor-pointer"
                  >
                    இ-பேப்பர் பதிப்பை வெளியிடு
                  </button>
                </div>
              </form>
            </div>

            {/* Polls Manager */}
            <div class="bg-white dark:bg-[#0D1424] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 class="font-title font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-500 text-[24px]">how_to_vote</span>
                <span>மக்களின் கருத்துக்கணிப்பு மேலாண்மை (Reader Polls)</span>
              </h3>

              {activePoll && (
                <div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-subtitle">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-500">தற்போதைய நேரலை கருத்துக்கணிப்பு:</span>
                    <span class="font-bold text-emerald-500">{activePoll.total_votes} மொத்த வாக்குகள்</span>
                  </div>
                  <h4 class="font-title font-bold text-sm text-slate-900 dark:text-white">
                    {activePoll.question}
                  </h4>
                  <div class="space-y-1.5 pt-1">
                    {activePoll.options?.map((opt) => (
                      <div key={opt.id} class="flex items-center justify-between bg-white dark:bg-slate-700/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span>{opt.option_text}</span>
                        <strong class="text-brand-red">{opt.votes_count} வாக்குகள்</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleCreatePoll} class="space-y-3 text-xs font-subtitle pt-2">
                <h4 class="font-bold text-slate-700 dark:text-slate-300">புதிய கருத்துக்கணிப்பு துவக்குக:</h4>
                <input
                  type="text"
                  required
                  value={newPollQuestion}
                  onChange={(e) => setNewPollQuestion(e.target.value)}
                  placeholder="கருத்துக்கணிப்பு கேள்வி உள்ளிடவும்..."
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-semibold"
                />
                <button
                  type="submit"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2 rounded-xl shadow cursor-pointer"
                >
                  புதிய கருத்துக்கணிப்பைத் தொடங்கு
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: 60-SEC VIDEOS & SHORTS MANAGEMENT
            ======================================================== */}
        {activeTab === 'videos' && (
          <div class="space-y-6 max-w-7xl mx-auto">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
              <div>
                <h3 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-brand-red text-[26px]">movie</span>
                  <span>60 வினாடி வீடியோக்கள் & ஷாட்ஸ் மேலாண்மை ({shortsList.length})</span>
                </h3>
                <p class="font-subtitle text-xs text-slate-500">
                  தளத்தின் முகப்பு பக்கத்தில் தோன்றும் 60 வினாடி ரீல்ஸ் மற்றும் வீடியோ செய்திகளைப் பதிவேற்றவும், திருத்தவும், நீக்கவும்
                </p>
              </div>

              <button
                onClick={() => handleOpenShortEditor()}
                class="load-more-btn font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105"
              >
                <span class="material-symbols-outlined text-[18px]">video_call</span>
                <span>+ புதிய வீடியோ பதிவேற்று</span>
              </button>
            </div>

            {/* Shorts Cards Grid */}
            {isLoadingShorts ? (
              <div class="p-12 text-center text-xs text-slate-500 font-bold">வீடியோக்கள் ஏற்றப்படுகின்றன...</div>
            ) : shortsList.length === 0 ? (
              <div class="p-12 text-center text-xs text-slate-400 bg-white dark:bg-[#0D1424] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                வீடியோக்கள் எதுவும் இல்லை. புதிய வீடியோவை மேலே உள்ள பொத்தானை அழுத்திப் பதிவேற்றவும்.
              </div>
            ) : (
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shortsList.map((st) => (
                  <div
                    key={st.id}
                    class="bg-white dark:bg-[#0D1424] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group"
                  >
                    <div>
                      <div class="relative aspect-[9/16] bg-slate-950 overflow-hidden">
                        {st.media_type === 'video' || st.media_url?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                          <video
                            src={st.media_url}
                            class="w-full h-full object-cover"
                            controls
                            playsInline
                          />
                        ) : (
                          <img
                            src={st.media_url}
                            alt={st.headline}
                            class="w-full h-full object-cover"
                          />
                        )}

                        <span class="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                          60 வினாடிகள்
                        </span>

                        <span class={`absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow ${
                          st.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'
                        }`}>
                          {st.status === 'published' ? 'நேரலை' : 'ஒப்புதலுக்கு'}
                        </span>
                      </div>

                      <div class="p-3 space-y-1">
                        <h4 class="font-title font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                          {st.headline}
                        </h4>
                        {st.description && (
                          <p class="font-subtitle text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {st.description}
                          </p>
                        )}
                        <p class="text-[10px] text-slate-400 font-medium pt-1">
                          பதிவேற்றியவர்: {st.author_name || 'நிர்வாகம்'}
                        </p>
                      </div>
                    </div>

                    <div class="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-subtitle">
                      <button
                        onClick={() => handleOpenShortEditor(st)}
                        class="text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-[15px]">edit</span>
                        <span>திருத்து</span>
                      </button>

                      <button
                        onClick={() => handleDeleteShort(st.id)}
                        class="text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 cursor-pointer"
                        title="நீக்கு"
                      >
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                        <span>நீக்கு</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 8: 12 ZODIAC SIGNS (AANMEGAM) MANAGEMENT
            ======================================================== */}
        {activeTab === 'zodiac' && (
          <div class="space-y-6 max-w-7xl mx-auto">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <div>
                <h3 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-500 text-[26px]">auto_awesome</span>
                  <span>12 ராசி பலன் மேலாண்மை (Aanmegam & Zodiac Desk)</span>
                </h3>
                <p class="font-subtitle text-xs text-slate-500">
                  மேஷம் முதல் மீனம் வரையிலான அனைத்து 12 ராசிகளின் தினசரி பலன்கள், அதிர்ஷ்ட எண், நிறம் மற்றும் அதிபதி கிரகம் திருத்தி சேமிக்கவும்
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  onClick={fetchZodiacList}
                  class="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">refresh</span>
                  <span>புதுப்பி</span>
                </button>
              </div>
            </div>

            {isLoadingZodiac ? (
              <div class="p-12 text-center text-xs text-slate-500 font-bold">ராசி பலன்கள் ஏற்றப்படுகின்றன...</div>
            ) : (
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zodiacList.map((z) => (
                  <div
                    key={z.id}
                    class="bg-white dark:bg-[#0D1424] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                          <span class="text-2xl font-black text-amber-500">{z.glyph}</span>
                          <div>
                            <h4 class="font-title font-extrabold text-sm text-slate-900 dark:text-white">
                              {z.name_ta} ({z.name_en})
                            </h4>
                            <span class="text-[10px] text-slate-400 font-medium">அதிபதி: {z.ruling_planet || '-'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenZodiacEditor(z)}
                          class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-subtitle font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-[14px]">edit</span>
                          <span>திருத்து</span>
                        </button>
                      </div>

                      <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 line-clamp-3 font-serif-reading leading-relaxed">
                        {z.prediction_text}
                      </div>
                    </div>

                    <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-subtitle text-slate-500 font-bold">
                      <span>எண்: <strong class="text-slate-900 dark:text-white">{z.lucky_number}</strong></span>
                      <span>நிறம்: <strong class="text-slate-900 dark:text-white">{z.lucky_color}</strong></span>
                      <span>திசை: <strong class="text-slate-900 dark:text-white">{z.lucky_direction}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================
          ARTICLE CREATE & EDIT MODAL
          ======================================================== */}
      {isEditorOpen && (
        <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div class="bg-white dark:bg-[#0D1424] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-300 dark:border-slate-800 p-6 space-y-5 relative">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 class="font-title font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-red text-[24px]">edit_document</span>
                <span>{editingArticle ? 'செய்தியைத் திருத்து' : 'புதிய செய்தி எழுதுக'}</span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-red hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div class="space-y-4 text-xs font-subtitle">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">செய்தித் தலைப்பு (Headline): *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="முக்கியச் செய்தித் தலைப்பை தமிழில் உள்ளிடவும்..."
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">துணைத் தலைப்பு (Subtitle):</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="செய்தியின் சுருக்கமான துணைத் தலைப்பு..."
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">செய்திப் பிரிவு (Category): *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-bold"
                  >
                    <option value="tamilnadu">தமிழ்நாடு</option>
                    <option value="districts">மாவட்டங்கள்</option>
                    <option value="india">இந்தியா</option>
                    <option value="world">உலகம்</option>
                    <option value="editorial">தலையங்கம் (Editorial)</option>
                    <option value="cinema">சினிமா</option>
                    <option value="business">வணிகம்</option>
                    <option value="sports">விளையாட்டு</option>
                    <option value="tech">தொழில்நுட்பம்</option>
                    <option value="spiritual">ஆன்மிகம்</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">குறிச்சொற்கள் (Tags, comma separated):</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="சென்னை, பட்ஜெட், முக்கியம்"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2"
                  />
                </div>
              </div>

              {/* Cover Image Upload & Preview */}
              <div class="space-y-2 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>முகப்பு படம் (Cover Image): *</span>
                  {isUploadingImage && <span class="text-amber-500 font-bold">பதிவேற்றப்படுகிறது...</span>}
                </label>

                <div class="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="படத்தின் முகவரி (https://... அல்லது கீழே உள்ள பதிவேற்று பொத்தானைப் பயன்படுத்தவும்)"
                    class="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs"
                  />
                  <label class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow">
                    <span class="material-symbols-outlined text-[16px]">cloud_upload</span>
                    <span>படம் பதிவேற்று</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} class="hidden" />
                  </label>
                </div>

                {formCoverImage && (
                  <div class="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 mt-2">
                    <img src={formCoverImage} alt="Preview" class="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Lead article toggle (Admin only) */}
              {isAdmin && (
                <label class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsLead}
                    onChange={(e) => setFormIsLead(e.target.checked)}
                    class="rounded text-brand-red w-4 h-4"
                  />
                  <div>
                    <span class="font-bold text-brand-red text-xs">தளத்தின் தலைப்புச் செய்தியாக (Hero Spotlight) ஆக்கு</span>
                    <p class="text-[10px] text-slate-500">இச்செய்தி முகப்புப் பக்கத்தின் பிரம்மாண்ட ஸ்பாட்லைட் பகுதியில் ஒளிரும்.</p>
                  </div>
                </label>
              )}

              {/* Full Content */}
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>முழு செய்தி விவரம் (Full Content Body): *</span>
                  <span class="text-[10px] text-slate-500">{formContent.length} எழுத்துக்கள்</span>
                </label>
                <textarea
                  rows="7"
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="செய்தியின் முழுமையான கள விவரங்களை இங்கு தட்டச்சு செய்யவும்..."
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 font-body text-sm text-slate-900 dark:text-white leading-relaxed focus:outline-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold cursor-pointer"
                >
                  ரத்து செய்
                </button>

                <button
                  type="button"
                  disabled={isSubmittingArticle}
                  onClick={() => handleSaveArticle(true)}
                  class="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold cursor-pointer"
                >
                  வரைவாக சேமி (Save Draft)
                </button>

                <button
                  type="button"
                  disabled={isSubmittingArticle}
                  onClick={() => handleSaveArticle(false)}
                  class="load-more-btn font-extrabold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer"
                >
                  {isAdmin ? 'நேரடியாக வெளியிடு (Publish Live)' : 'ஒப்புதலுக்கு சமர்ப்பி (Submit for Approval)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD NEW REPORTER MODAL (ADMIN ONLY)
          ======================================================== */}
      {isAddReporterOpen && isAdmin && (
        <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div class="bg-white dark:bg-[#0D1424] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-300 dark:border-slate-800 relative">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 class="font-title font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-500 text-[22px]">person_add</span>
                <span>புதிய செய்தி நிருபர் சேர்க்க</span>
              </h3>
              <button onClick={() => setIsAddReporterOpen(false)} class="p-1 cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateReporter} class="space-y-3 text-xs font-subtitle">
              <div class="space-y-1">
                <label class="font-bold">முழுப் பெயர் (Full Name): *</label>
                <input
                  type="text"
                  required
                  value={newRepFullName}
                  onChange={(e) => setNewRepFullName(e.target.value)}
                  placeholder="எ.கா: சு. ஆனந்தன்"
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-bold">பயனர்பெயர் (Username): *</label>
                  <input
                    type="text"
                    required
                    value={newRepUsername}
                    onChange={(e) => setNewRepUsername(e.target.value)}
                    placeholder="reporter2"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-bold">கடவுச்சொல் (Password): *</label>
                  <input
                    type="password"
                    required
                    value={newRepPassword}
                    onChange={(e) => setNewRepPassword(e.target.value)}
                    placeholder="••••••••"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-bold">மின்னஞ்சல் (Email): *</label>
                  <input
                    type="email"
                    required
                    value={newRepEmail}
                    onChange={(e) => setNewRepEmail(e.target.value)}
                    placeholder="reporter@amazetimes.com"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-bold">தொலைபேசி எண் (Phone):</label>
                  <input
                    type="text"
                    value={newRepPhone}
                    onChange={(e) => setNewRepPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="font-bold">நிருபர் குறிப்பு (Bio):</label>
                <textarea
                  rows="2"
                  value={newRepBio}
                  onChange={(e) => setNewRepBio(e.target.value)}
                  placeholder="மாவட்ட நிருபர் / சிறப்புச் செய்தியாளர்..."
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                ></textarea>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddReporterOpen(false)}
                  class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold cursor-pointer"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  class="load-more-btn font-extrabold px-5 py-2 rounded-xl shadow cursor-pointer"
                >
                  நிருபரைச் சேர்
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ARTICLE REJECTION FEEDBACK MODAL
          ======================================================== */}
      {rejectingArticleId && (
        <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div class="bg-white dark:bg-[#0D1424] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-500/40 relative">
            <h3 class="font-title font-bold text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
              <span class="material-symbols-outlined text-[24px]">block</span>
              <span>செய்தியை நிராகரித்தல் (Rejection Reason)</span>
            </h3>
            <p class="font-subtitle text-xs text-slate-600 dark:text-slate-300">
              நிருபருக்கு அனுப்ப வேண்டிய திருத்தக் குறிப்பு அல்லது நிராகரிப்பு காரணத்தை உள்ளிடவும்:
            </p>
            <textarea
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-subtitle focus:outline-none"
            ></textarea>

            <div class="flex justify-end gap-2 text-xs font-subtitle font-bold pt-2">
              <button
                type="button"
                onClick={() => setRejectingArticleId(null)}
                class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                ரத்து செய்
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                class="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl shadow cursor-pointer"
              >
                நிராகரிப்பை உறுதி செய்
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIDEO SHORT CREATE & EDIT MODAL
          ======================================================== */}
      {isShortModalOpen && (
        <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div class="bg-white dark:bg-[#0D1424] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-300 dark:border-slate-800 relative">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 class="font-title font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-red text-[22px]">video_call</span>
                <span>{editingShort ? 'வீடியோ செய்தியைத் திருத்து' : 'புதிய 60 வினாடி வீடியோ செய்தி'}</span>
              </h3>
              <button onClick={() => setIsShortModalOpen(false)} class="p-1 cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveShort} class="space-y-3.5 text-xs font-subtitle">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">வீடியோ தலைப்பு (Headline): *</label>
                <input
                  type="text"
                  required
                  value={shortHeadline}
                  onChange={(e) => setShortHeadline(e.target.value)}
                  placeholder="60 வினாடி வீடியோ முக்கியத் தலைப்பு..."
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">சுருக்கமான விவரம் (Description):</label>
                <textarea
                  rows="2"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="வீடியோ செய்தி சுருக்கம்..."
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              {/* Video File Upload & URL */}
              <div class="space-y-2 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>வீடியோ கோப்பு அல்லது முகவரி (Video File / URL): *</span>
                  {isUploadingShortMedia && <span class="text-amber-500 font-bold">வீடியோ பதிவேற்றப்படுகிறது...</span>}
                </label>

                <div class="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    required
                    value={shortMediaUrl}
                    onChange={(e) => setShortMediaUrl(e.target.value)}
                    placeholder="https://... அல்லது கோப்பைப் பதிவேற்றவும்"
                    class="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs w-full"
                  />
                  <label class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow w-full sm:w-auto justify-center">
                    <span class="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>MP4/WebM பதிவேற்று</span>
                    <input type="file" accept="video/mp4,video/webm,video/quicktime,image/*" onChange={handleVideoUpload} class="hidden" />
                  </label>
                </div>

                {shortMediaUrl && (
                  <div class="w-full h-40 rounded-xl overflow-hidden bg-black mt-2">
                    {shortMediaUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                      <video src={shortMediaUrl} controls class="w-full h-full object-contain" />
                    ) : (
                      <img src={shortMediaUrl} alt="Preview" class="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>

              <div class="flex items-center justify-between pt-2">
                <span class="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px]">timer</span>
                  அதிகபட்சம் 60 வினாடி ரீல்ஸ்
                </span>

                <div class="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsShortModalOpen(false)}
                    class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold cursor-pointer"
                  >
                    ரத்து செய்
                  </button>
                  <button
                    type="submit"
                    class="load-more-btn font-extrabold px-5 py-2 rounded-xl shadow cursor-pointer"
                  >
                    {editingShort ? 'புதுப்பி' : 'வெளியிடு'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ZODIAC SIGN PREDICTION EDIT MODAL
          ======================================================== */}
      {editingZodiac && (
        <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div class="bg-white dark:bg-[#0D1424] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-400/40 relative">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-2xl font-black text-amber-500">{editingZodiac.glyph}</span>
                <div>
                  <h3 class="font-title font-extrabold text-base text-slate-900 dark:text-white">
                    {editingZodiac.name_ta} ({editingZodiac.name_en})
                  </h3>
                  <span class="text-[10px] text-slate-400 font-medium">இன்றைய ராசி பலனைத் திருத்து</span>
                </div>
              </div>
              <button onClick={() => setEditingZodiac(null)} class="p-1 cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveZodiac} class="space-y-3.5 text-xs font-subtitle">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">ராசி பலன் உரை (Prediction Text): *</label>
                <textarea
                  rows="4"
                  required
                  value={zodiacPrediction}
                  onChange={(e) => setZodiacPrediction(e.target.value)}
                  placeholder="இன்றைய விரிவான ராசி பலனை உள்ளிடவும்..."
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-serif-reading text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">அதிபதி கிரகம்:</label>
                  <input
                    type="text"
                    value={zodiacPlanet}
                    onChange={(e) => setZodiacPlanet(e.target.value)}
                    placeholder="செவ்வாய்"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">அதிர்ஷ்ட எண்:</label>
                  <input
                    type="text"
                    value={zodiacLuckyNum}
                    onChange={(e) => setZodiacLuckyNum(e.target.value)}
                    placeholder="9"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">அதிர்ஷ்ட நிறம்:</label>
                  <input
                    type="text"
                    value={zodiacLuckyColor}
                    onChange={(e) => setZodiacLuckyColor(e.target.value)}
                    placeholder="சிவப்பு"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">அதிர்ஷ்ட திசை:</label>
                  <input
                    type="text"
                    value={zodiacLuckyDir}
                    onChange={(e) => setZodiacLuckyDir(e.target.value)}
                    placeholder="கிழக்கு"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingZodiac(null)}
                  class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold cursor-pointer"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-xl shadow cursor-pointer"
                >
                  ராசி பலனைச் சேமி
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
