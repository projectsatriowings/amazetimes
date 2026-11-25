import React, { useState, useEffect, useCallback } from 'react';
import {
  Newspaper,
  Upload,
  Plus,
  Trash2,
  Calendar,
  FileText,
  CheckCircle2,
  Lock,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Edit,
  X,
  Download,
  Eye,
  RefreshCw,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Star,
  Search,
  Check,
  Layers,
  Save,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api, getMediaUrl } from '../../services/api';
import { getMonthYearString, getMonthLabel, getAvailableMonths } from '../../utils/monthUtils';
import { exportPublicationToPdf } from '../../utils/pdfExporter';
import AmazeTimesPageRenderer from '../amazetimes/AmazeTimesPageRenderer';
import AmazeTimesViewerModal from '../amazetimes/AmazeTimesViewerModal';

export const AdminEpaperManager = () => {
  const { showToast } = useApp();

  const [epapers, setEpapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Auto Daily E-Newspaper Compiler State (D Date compiles D-1 News)
  const [autoDate, setAutoDate] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  const [autoEdition, setAutoEdition] = useState('main');
  const [autoData, setAutoData] = useState(null);
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [showAutoPreview, setShowAutoPreview] = useState(false);
  const [isLiveReaderOpen, setIsLiveReaderOpen] = useState(false);
  const [pdfExportProgress, setPdfExportProgress] = useState(null);

  // Story Sequence & Edition Customization States
  const [editionArticles, setEditionArticles] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isSavingEdition, setIsSavingEdition] = useState(false);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [availableNewsPool, setAvailableNewsPool] = useState([]);
  const [loadingNewsPool, setLoadingNewsPool] = useState(false);
  const [newsSearchTerm, setNewsSearchTerm] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('all');

  const fetchAutoCompiledEpaper = useCallback(async () => {
    try {
      setLoadingAuto(true);
      const res = await fetch(`/api/amazetimes/enewspaper?date=${autoDate}&edition=${autoEdition}`);
      const data = await res.json();
      if (data && data.success) {
        setAutoData(data);
      }
    } catch (err) {
      console.warn('Auto epaper preview fetch error:', err);
    } finally {
      setLoadingAuto(false);
    }
  }, [autoDate, autoEdition]);

  useEffect(() => {
    fetchAutoCompiledEpaper();
  }, [fetchAutoCompiledEpaper]);

  // Sync articles when autoData updates
  useEffect(() => {
    if (autoData?.articles && Array.isArray(autoData.articles)) {
      setEditionArticles(autoData.articles);
      setSelectedLeadId(autoData.publication?.lead_article_id || autoData.articles[0]?.id || null);
      setHasOrderChanges(false);
    }
  }, [autoData]);

  const moveArticleUp = (index) => {
    if (index <= 0) return;
    const nextList = [...editionArticles];
    const item = nextList[index];
    nextList[index] = nextList[index - 1];
    nextList[index - 1] = item;
    setEditionArticles(nextList);
    setHasOrderChanges(true);
  };

  const moveArticleDown = (index) => {
    if (index >= editionArticles.length - 1) return;
    const nextList = [...editionArticles];
    const item = nextList[index];
    nextList[index] = nextList[index + 1];
    nextList[index + 1] = item;
    setEditionArticles(nextList);
    setHasOrderChanges(true);
  };

  const handleMakeLead = (article) => {
    setSelectedLeadId(article.id);
    const others = editionArticles.filter(a => a.id !== article.id);
    setEditionArticles([article, ...others]);
    setHasOrderChanges(true);
    showToast(`'${article.title?.slice(0, 35)}...' முதல் பக்க முதன்மைச் செய்தியாக அமைக்கப்பட்டது!`);
  };

  const handleRemoveArticle = (articleId) => {
    if (editionArticles.length <= 1) {
      showToast('இதழில் குறைந்தபட்சம் ஒரு செய்தி இருக்க வேண்டும்');
      return;
    }
    const nextList = editionArticles.filter(a => a.id !== articleId);
    setEditionArticles(nextList);
    if (selectedLeadId === articleId) {
      setSelectedLeadId(nextList[0]?.id || null);
    }
    setHasOrderChanges(true);
  };

  const handleOpenAddModal = async () => {
    setShowAddArticleModal(true);
    if (availableNewsPool.length === 0) {
      try {
        setLoadingNewsPool(true);
        const res = await api.getNews({ limit: 120 });
        if (res && res.success && Array.isArray(res.data)) {
          setAvailableNewsPool(res.data);
        }
      } catch (e) {
        console.warn('Failed to load news pool for edition:', e);
      } finally {
        setLoadingNewsPool(false);
      }
    }
  };

  const handleAddArticleToEdition = (article) => {
    if (editionArticles.some(a => a.id === article.id)) {
      showToast('இந்தச் செய்தி ஏற்கனவே இதழில் சேர்க்கப்பட்டுள்ளது');
      return;
    }
    const formatted = {
      id: article.id,
      title: article.title,
      category: article.category,
      district: article.district,
      image_url: article.main_image || article.image_url,
      created_at: article.created_at,
      views_count: article.views_count,
      is_lead_hero: false,
      is_breaking: article.is_breaking,
      is_top_story: article.is_top_story
    };
    setEditionArticles(prev => [...prev, formatted]);
    setHasOrderChanges(true);
    showToast('செய்தி இதழில் சேர்க்கப்பட்டது!');
  };

  const handleSaveCustomOrderAndPublish = async () => {
    if (!autoData?.publication || editionArticles.length === 0) return;
    try {
      setIsSavingEdition(true);
      const pub = autoData.publication;
      const leadItem = editionArticles.find(a => a.id === selectedLeadId) || editionArticles[0];
      const res = await api.createEpaper({
        title: pub.title,
        edition_date: autoDate,
        edition: autoEdition,
        pdf_url: 'auto-compiled',
        cover_image_url: leadItem?.image_url || pub.cover_image_url || '/Amaze times.jpg',
        page_count: autoData.pages?.length || 14,
        file_size_mb: 6.5,
        article_order: editionArticles.map(a => a.id),
        lead_article_id: selectedLeadId || editionArticles[0]?.id
      });
      if (res && res.success) {
        showToast(`${autoDate} இதழின் புதிய வரிசை மற்றும் முதன்மைச் செய்தி சேமிக்கப்பட்டு வெளியிடப்பட்டது!`);
        setHasOrderChanges(false);
        await fetchAutoCompiledEpaper();
        fetchEpapers();
      } else {
        showToast(res?.message || 'சேமிப்பதில் பிழை');
      }
    } catch (err) {
      showToast('சேவையகப் பிழை: ' + err.message);
    } finally {
      setIsSavingEdition(false);
    }
  };

  const handleDownloadAutoPdf = async () => {
    if (!autoData || !Array.isArray(autoData.pages) || autoData.pages.length === 0) {
      showToast('பக்கங்கள் எதுவும் உருவாக்கப்படவில்லை');
      return;
    }
    try {
      showToast('தினசரி மின்-நாளிதழ் PDF உருவாக்கப்படுகிறது...');
      await exportPublicationToPdf({
        pages: autoData.pages,
        publicationType: 'enewspaper',
        editionName: autoData.publication?.edition_name || '',
        fileName: `Amaze_Times_EPaper_${autoData.publication?.edition_date_display || autoDate}_${autoEdition}.pdf`,
        onProgress: (curr, tot) => setPdfExportProgress({ current: curr, total: tot })
      });
      showToast('தினசரி இ-பேப்பர் PDF வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!');
    } catch (err) {
      showToast('PDF உருவாக்குவதில் பிழை: ' + err.message);
    } finally {
      setPdfExportProgress(null);
    }
  };

  const handlePublishAutoEdition = async () => {
    if (!autoData?.publication) return;
    try {
      const pub = autoData.publication;
      const res = await api.createEpaper({
        title: pub.title,
        edition_date: pub.edition_date,
        pdf_url: 'auto-compiled',
        cover_image_url: pub.cover_image_url || '/Amaze times.jpg',
        page_count: autoData.pages?.length || 12,
        file_size_mb: 6.5
      });
      if (res && res.success) {
        showToast(`${pub.edition_date_display} பதிப்பு தளத்தில் நேரலையாக வெளியிடப்பட்டது!`);
        fetchEpapers();
      } else {
        showToast(res?.message || 'வெளியிடுவதில் பிழை');
      }
    } catch (err) {
      showToast('சேவையக பிழை: ' + err.message);
    }
  };

  // Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [epaperForm, setEpaperForm] = useState(() => {
    const now = new Date();
    return {
      title: 'அமேஸ் டைம்ஸ் தமிழ்நாடு முதன்மை மின்-நாளிதழ்',
      edition: 'tamilnadu',
      month: getMonthYearString(now),
      editionDate: now.toISOString().split('T')[0],
      pdfUrl: '',
      coverImage: '',
      pagesCount: 16,
      fileSize: '12.4 MB'
    };
  });

  useEffect(() => {
    fetchEpapers();
  }, []);

  const fetchEpapers = async () => {
    try {
      setLoading(true);
      const res = await api.getEpapers();
      if (res && res.success && Array.isArray(res.data)) {
        setEpapers(res.data);
      }
    } catch (err) {
      console.warn('Epaper fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPdf(true);
      const res = await api.uploadFile(file);
      if (res && res.success && (res.url || res.fileUrl || res.imageUrl)) {
        const rawUrl = res.url || res.fileUrl || res.imageUrl;
        const url = getMediaUrl(rawUrl);
        const mbSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        setEpaperForm((prev) => ({ ...prev, pdfUrl: url, fileSize: mbSize }));
        showToast('PDF கோப்பு வெற்றிகரமாக பதிவேற்றப்பட்டது!');
      } else {
        showToast(res?.message || 'PDF கோப்பு பதிவேற்றத்தில் பிழை');
      }
    } catch (err) {
      showToast('PDF பதிவேற்றத்தில் பிழை: ' + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const res = await api.uploadImage(file);
      if (res && res.success && (res.url || res.imageUrl)) {
        const rawUrl = res.imageUrl || res.url;
        const url = getMediaUrl(rawUrl);
        setEpaperForm((prev) => ({ ...prev, coverImage: url }));
        showToast('அட்டைப் படம் (Cover Image) வெற்றிகரமாக பதிவேற்றப்பட்டது!');
      } else {
        showToast(res?.message || 'அட்டைப் படம் பதிவேற்றத்தில் பிழை');
      }
    } catch (err) {
      showToast('அட்டைப் படம் பதிவேற்றத்தில் பிழை: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const availableMonthOptions = getAvailableMonths(epapers);

  const handleEditEpaper = (item) => {
    setEditingId(item.id || item._id);
    const itemDate = item.editionDate ? String(item.editionDate).split('T')[0] : new Date().toISOString().split('T')[0];
    setEpaperForm({
      title: item.title || '',
      edition: item.edition || 'tamilnadu',
      month: item.month || getMonthYearString(itemDate),
      editionDate: itemDate,
      pdfUrl: item.pdfUrl || '',
      coverImage: item.coverImage || '',
      pagesCount: item.pagesCount || 16,
      fileSize: item.fileSize || '12.4 MB'
    });
    setShowUploadForm(true);
  };

  const handleCancelForm = () => {
    const today = new Date();
    setEditingId(null);
    setEpaperForm({
      title: 'அமேஸ் டைம்ஸ் தமிழ்நாடு முதன்மை மின்-நாளிதழ்',
      edition: 'tamilnadu',
      month: getMonthYearString(today),
      editionDate: today.toISOString().split('T')[0],
      pdfUrl: '',
      coverImage: '',
      pagesCount: 16,
      fileSize: '12.4 MB'
    });
    setShowUploadForm(false);
  };

  const handleDateChange = (newDate) => {
    const newMonth = getMonthYearString(newDate);
    setEpaperForm((prev) => ({
      ...prev,
      editionDate: newDate,
      month: newMonth || prev.month
    }));
  };

  const handleSaveEpaper = async (e) => {
    e.preventDefault();
    if (!epaperForm.title || !epaperForm.pdfUrl) {
      showToast('தயவுசெய்து மின்-இதழ் தலைப்பு மற்றும் PDF கோப்பை வழங்கவும்');
      return;
    }

    try {
      let res;
      if (editingId) {
        res = await api.updateEpaper(editingId, epaperForm);
      } else {
        res = await api.createEpaper(epaperForm);
      }

      if (res && res.success) {
        showToast(editingId ? 'மின்-இதழ் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!' : 'மாதாந்திர மின்-இதழ் வெற்றிகரமாக வெளியிடப்பட்டது!');
        handleCancelForm();
        fetchEpapers();
      } else {
        showToast(res?.message || 'மின்-இதழ் சேமிப்பதில் பிழை');
      }
    } catch (err) {
      showToast('சேவையக பிழை: ' + err.message);
    }
  };

  const handleDeleteEpaper = async (id) => {
    if (!window.confirm('இந்த மின்-இதழை நீக்க உறுதியாக விரும்புகிறீர்களா?')) return;

    try {
      const res = await api.deleteEpaper(id);
      if (res && res.success) {
        showToast('மின்-இதழ் நீக்கப்பட்டது!');
        fetchEpapers();
      } else {
        showToast(res?.message || 'நீக்குவதில் பிழை');
      }
    } catch (err) {
      showToast('நீக்குவதில் பிழை');
    }
  };

  return (
    <div className="space-y-6 font-tamil text-slate-100">
      {/* Header Banner */}
      <div className="bg-[#0b1936] border border-amber-500/30 p-6 rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
              மாதாந்திர மின்-இதழ் மேலாண்மை (Month-wise E-Paper Manager) <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              மாதந்தோறும் வெளியாகும் மின்-இதழ் PDF கோப்புகளை பதிவேற்றம் செய்து நிர்வகிக்கவும்.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          <span>{showUploadForm ? 'படிவத்தை மூடுக' : 'புதிய மின்-இதழ் பதிவேற்று'}</span>
        </button>
      </div>

      {/* DAILY AUTO-COMPILED E-NEWSPAPER STUDIO (D EDITION FROM D-1 NEWS) */}
      <div className="bg-gradient-to-br from-[#0e1e42] to-[#0a132c] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              D → D-1 தானியங்கி தொகுப்பு
            </span>
            <h3 className="text-lg font-black text-white mt-1.5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>தினசரி மின்-நாளிதழ் PDF உருவாக்கி (Auto-Compile Daily E-Newspaper PDF)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              நீங்கள் தேர்ந்தெடுக்கும் <b>தேதிக்கு (எ.கா. 10-11-2026)</b> முந்தைய நாள் <b>(09-11-2026)</b> வெளியான அனைத்துச் செய்திகளையும் கட்டமைக்கப்பட்ட செய்தித்தாள் வடிவில் உடனடியாக PDF-ஆக உருவாக்குகிறது.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">பதிப்புத் தேதி (Edition Date):</label>
              <input
                type="date"
                value={autoDate}
                onChange={(e) => setAutoDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">மண்டலப் பதிப்பு (Edition):</label>
              <select
                value={autoEdition}
                onChange={(e) => setAutoEdition(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="main">தமிழ்நாடு முதன்மைப் பதிப்பு</option>
                <option value="city">சென்னை பெருநகரப் பதிப்பு</option>
                <option value="special">வாராந்திர சிறப்பு மலர்</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Compilation Summary */}
        {loadingAuto ? (
          <div className="py-6 flex items-center justify-center gap-2 text-amber-300 text-xs font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>முந்தைய நாள் செய்திகள் தொகுக்கப்படுகின்றன...</span>
          </div>
        ) : autoData?.publication ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <span className="text-slate-400 block text-[10px]">பதிப்புத் தேதி (Issue)</span>
                <b className="text-amber-400 text-sm font-black">{autoData.publication.edition_date_display}</b>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <span className="text-slate-400 block text-[10px]">செய்தி நாள் (D-1 Source)</span>
                <b className="text-emerald-400 text-sm font-black">{autoData.publication.source_news_date_display}</b>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <span className="text-slate-400 block text-[10px]">தொகுக்கப்பட்ட செய்திகள்</span>
                <b className="text-white text-sm font-black">
                  {autoData.publication.total_articles} செய்திகள்
                  {autoData.publication.exact_source_count > 0 && (
                    <span className="text-[10px] text-emerald-400 ml-1">({autoData.publication.exact_source_count} D-1)</span>
                  )}
                </b>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <span className="text-slate-400 block text-[10px]">உருவான பக்கங்கள்</span>
                <b className="text-sky-400 text-sm font-black">{autoData.pages?.length || 0} பக்கங்கள் (A4 Broadsheet)</b>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLiveReaderOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-lg"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>வாசகர் 3D வாசிப்பு முன்னோட்டம் (Live Flipbook)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAutoPreview(prev => !prev)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 cursor-pointer transition"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>{showAutoPreview ? 'முன்னோட்டத்தை மூடு' : 'பக்கங்களின் தொகுப்பு (14 Pages)'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadAutoPdf}
                disabled={Boolean(pdfExportProgress)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition disabled:opacity-60"
              >
                <Download className={`w-4 h-4 ${pdfExportProgress ? 'animate-bounce' : ''}`} />
                <span>
                  {pdfExportProgress
                    ? `PDF தயாராகிறது (${pdfExportProgress.current}/${pdfExportProgress.total})...`
                    : 'PDF-ஆக உருவாக்கிப் பதிவிறக்கு (Download PDF)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePublishAutoEdition}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition ml-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>இதை இணையதளத்தில் வெளியிடு (Publish to Site)</span>
              </button>
            </div>

            {/* Inline Scrollable Live Broadsheet Preview */}
            {showAutoPreview && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-h-[650px] overflow-auto">
                <div className="flex flex-wrap justify-center gap-6">
                  {(autoData.pages || []).map((pg) => (
                    <div key={pg.pageNumber} className="shadow-2xl border border-slate-700 rounded overflow-hidden">
                      <div className="bg-slate-900 text-amber-300 text-[11px] font-bold px-3 py-1 flex justify-between">
                        <span>{pg.title}</span>
                        <span>பக்கம் {pg.pageNumber}</span>
                      </div>
                      <div style={{ width: '397px', height: '561px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '794px', height: '1123px' }}>
                          <AmazeTimesPageRenderer
                            page={pg}
                            publicationType="enewspaper"
                            editionName={autoData.publication?.edition_name}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTERACTIVE EDITION STORIES & PAGE ORDER MANAGEMENT STUDIO */}
            <div className="bg-[#050c1e] border border-amber-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-black text-white">
                      இன்றைய இதழின் செய்திகள் &amp; பக்க வரிசை மேலாண்மை (Edition Stories &amp; Page Order)
                    </h4>
                    {autoData.publication?.is_custom_edition && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                        நிர்வாகி தனிப்பயன் வரிசை (Custom Ordered)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    செய்திகளின் வரிசையை மாற்றலாம் (▲ / ▼), முதல் பக்க முதன்மைச் செய்தியைத் தேர்ந்தெடுக்கலாம் அல்லது கூடுதல் செய்திகளை இணைக்கலாம்.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer transition shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>கூடுதல் செய்தி சேர்</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCustomOrderAndPublish}
                    disabled={isSavingEdition}
                    className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-lg ${
                      hasOrderChanges
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 animate-pulse'
                        : 'bg-emerald-700/80 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingEdition ? 'சேமிக்கப்படுகிறது...' : hasOrderChanges ? 'வரிசையைச் சேமித்து வெளியிடு *' : 'வரிசையைச் சேமி'}</span>
                  </button>
                </div>
              </div>

              {hasOrderChanges && (
                <div className="bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
                  <span>⚠️ வரிசையில் மாற்றங்கள் செய்யப்பட்டுள்ளன. வாசகர்களுக்கும் PDF-க்கும் புதுப்பிக்க <b>'வரிசையைச் சேமித்து வெளியிடு'</b> அழுத்தவும்.</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (autoData?.articles) {
                        setEditionArticles(autoData.articles);
                        setSelectedLeadId(autoData.publication?.lead_article_id || autoData.articles[0]?.id);
                        setHasOrderChanges(false);
                      }
                    }}
                    className="text-[11px] underline text-slate-400 hover:text-white cursor-pointer ml-3 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> மாற்றங்களை ரத்து செய்
                  </button>
                </div>
              )}

              {/* STORIES LIST */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {editionArticles.map((art, idx) => {
                  const isLead = art.id === selectedLeadId || (!selectedLeadId && idx === 0);
                  let pageEstimate = '';
                  if (idx === 0) pageEstimate = 'பக்கம் 1 • முதன்மைச் செய்தி (Lead Hero)';
                  else if (idx === 1) pageEstimate = 'பக்கம் 1 • துணைச் செய்தி (Lead Secondary)';
                  else if (idx <= 3) pageEstimate = 'பக்கம் 2 • மாநிலச் செய்திகள்';
                  else if (idx <= 5) pageEstimate = 'பக்கம் 3 • மாவட்டச் செய்திகள்';
                  else if (idx <= 7) pageEstimate = 'பக்கம் 4 • அரசியல் & முக்கிய நிகழ்வுகள்';
                  else if (idx <= 9) pageEstimate = 'பக்கம் 5 • வணிகம் & பொருளாதாரம்';
                  else if (idx <= 11) pageEstimate = 'பக்கம் 6 • உலகச் செய்திகள் & அறிவியல்';
                  else if (idx <= 13) pageEstimate = 'பக்கம் 7 • சினிமா & கலாச்சாரம்';
                  else pageEstimate = `பக்கம் ${Math.min(14, Math.floor(idx / 2) + 1)} • பொதுச் செய்திகள்`;

                  return (
                    <div
                      key={art.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition ${
                        isLead
                          ? 'bg-amber-950/30 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-[#0a1428] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Order Number Badge */}
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          isLead ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>

                        {/* Thumbnail */}
                        <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                          <img
                            src={getMediaUrl(art.image_url)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                          />
                        </div>

                        {/* Article Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded">
                              {art.category || 'பொது'}
                            </span>
                            {art.district && art.district !== 'all' && (
                              <span className="text-[10px] bg-sky-950 text-sky-400 font-bold px-2 py-0.5 rounded border border-sky-800/40">
                                {art.district}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-400">
                              {pageEstimate}
                            </span>
                            {isLead && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> முதல் பக்க முதன்மை
                              </span>
                            )}
                          </div>
                          <h5 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1 leading-snug">
                            {art.title}
                          </h5>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => moveArticleUp(idx)}
                          disabled={idx === 0}
                          title="மேலே நகர்த்து"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition border border-slate-700"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveArticleDown(idx)}
                          disabled={idx === editionArticles.length - 1}
                          title="கீழே நகர்த்து"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition border border-slate-700"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMakeLead(art)}
                          title="முதல் பக்க முதன்மைச் செய்தியாக மாற்று"
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition border ${
                            isLead
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow'
                              : 'bg-slate-800 hover:bg-amber-500/20 text-amber-300 border-slate-700'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isLead ? 'fill-slate-950' : ''}`} />
                          <span>{isLead ? 'முதன்மை' : 'முதன்மை ஆக்கு'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveArticle(art.id)}
                          title="இதழிலிருந்து நீக்கு"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 cursor-pointer transition border border-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ADD ARTICLE TO CURRENT EDITION MODAL */}
            {showAddArticleModal && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0b162c] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in duration-150">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-amber-400" />
                        <span>இதழில் கூடுதல் செய்தி சேர்க்க (Add Article to Edition)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        தளத்தில் வெளியான செய்திகளைத் தேர்ந்தெடுத்து இந்த நாளிதழ் பதிப்பில் இணைக்கலாம்.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddArticleModal(false)}
                      className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="செய்தி தலைப்பில் தேட..."
                        value={newsSearchTerm}
                        onChange={(e) => setNewsSearchTerm(e.target.value)}
                        className="w-full bg-[#050c1e] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <select
                      value={newsCategoryFilter}
                      onChange={(e) => setNewsCategoryFilter(e.target.value)}
                      className="bg-[#050c1e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                    >
                      <option value="all">அனைத்து பிரிவுகள்</option>
                      <option value="தமிழ்நாடு">தமிழ்நாடு</option>
                      <option value="அரசியல்">அரசியல்</option>
                      <option value="இந்தியா">இந்தியா</option>
                      <option value="உலகம்">உலகம்</option>
                      <option value="வணிகம்">வணிகம்</option>
                      <option value="விளையாட்டு">விளையாட்டு</option>
                      <option value="சினிமா">சினிமா</option>
                    </select>
                  </div>

                  <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[450px]">
                    {loadingNewsPool ? (
                      <div className="py-8 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> செய்திகள் ஏற்றப்படுகின்றன...
                      </div>
                    ) : (
                      availableNewsPool
                        .filter((item) => {
                          if (newsCategoryFilter !== 'all' && item.category !== newsCategoryFilter) return false;
                          if (!newsSearchTerm.trim()) return true;
                          return (item.title || '').toLowerCase().includes(newsSearchTerm.toLowerCase());
                        })
                        .slice(0, 30)
                        .map((item) => {
                          const alreadyIn = editionArticles.some(a => a.id === item.id);
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border text-xs ${
                                alreadyIn
                                  ? 'bg-slate-900/50 border-slate-800 text-slate-500'
                                  : 'bg-[#050c1e] border-slate-800 hover:border-slate-700 text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-12 h-10 rounded bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                                  <img
                                    src={getMediaUrl(item.main_image || item.image_url)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[9.5px] bg-slate-800 text-amber-400 font-bold px-1.5 py-0.5 rounded mr-1.5">
                                    {item.category}
                                  </span>
                                  <span className="font-bold line-clamp-1">{item.title}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddArticleToEdition(item)}
                                disabled={alreadyIn}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition ${
                                  alreadyIn
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                                }`}
                              >
                                {alreadyIn ? 'சேர்க்கப்பட்டுள்ளது' : '+ இதழில் சேர்'}
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-900/40">
                    <button
                      type="button"
                      onClick={() => setShowAddArticleModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                    >
                      முடிந்தது
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* UPLOAD / ADD EPAPER FORM */}
      {showUploadForm && (
        <form onSubmit={handleSaveEpaper} className="bg-[#0c1633] border border-slate-800 p-6 rounded-3xl space-y-4 max-w-3xl shadow-2xl animate-in fade-in duration-200">
          <h3 className="text-base font-black text-amber-400 border-b border-slate-800 pb-2">
            புதிய மாதாந்திர மின்-இதழ் பதிவேற்றம்
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="sm:col-span-2">
              <label className="font-bold block mb-1">மின்-இதழ் தலைப்பு (E-Paper Title):</label>
              <input
                type="text"
                required
                value={epaperForm.title}
                onChange={(e) => setEpaperForm({ ...epaperForm, title: e.target.value })}
                placeholder="உதாரணம்: அமேஸ் டைம்ஸ் தமிழ்நாடு முதன்மை மின்-நாளிதழ்..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">பதிப்பு (Edition):</label>
              <select
                value={epaperForm.edition}
                onChange={(e) => setEpaperForm({ ...epaperForm, edition: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
              >
                <option value="tamilnadu">தமிழ்நாடு பதிப்பு (Tamil Nadu Edition)</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">மாதம் (Month & Year):</label>
              <select
                value={epaperForm.month}
                onChange={(e) => setEpaperForm({ ...epaperForm, month: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              >
                {availableMonthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">பதிப்பு தேதி (Edition Date):</label>
              <input
                type="date"
                required
                value={epaperForm.editionDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">பக்கங்கள் & கோப்பு அளவு (Pages & File Size):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={epaperForm.pagesCount}
                  onChange={(e) => setEpaperForm({ ...epaperForm, pagesCount: parseInt(e.target.value, 10) })}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                  placeholder="பக்கங்கள் (16)"
                />
                <input
                  type="text"
                  value={epaperForm.fileSize}
                  onChange={(e) => setEpaperForm({ ...epaperForm, fileSize: e.target.value })}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                  placeholder="12.4 MB"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold block mb-1">அட்டைப் படம் (Cover Image Upload or URL):</label>
              <div className="flex items-center gap-3">
                {epaperForm.coverImage && (
                  <div className="w-16 h-20 bg-slate-900 rounded-lg overflow-hidden border border-amber-500/40 shrink-0">
                    <img
                      src={getMediaUrl(epaperForm.coverImage)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={epaperForm.coverImage}
                    onChange={(e) => setEpaperForm({ ...epaperForm, coverImage: e.target.value })}
                    placeholder="https://... அல்லது அட்டைப் படத்தை பதிவேற்றவும்"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs"
                  />
                  <label className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-3 rounded-xl cursor-pointer transition shrink-0 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4" />
                    <span>{uploadingCover ? 'பதிவேறுகிறது...' : 'அட்டைப் படம் தேர்வு'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold block mb-1">PDF கோப்பு (PDF File Upload or URL):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={epaperForm.pdfUrl}
                  onChange={(e) => setEpaperForm({ ...epaperForm, pdfUrl: e.target.value })}
                  placeholder="https://... அல்லது PDF கோப்பை பதிவேற்றவும்"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs"
                />
                <label className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-3 rounded-xl cursor-pointer transition shrink-0 flex items-center gap-1.5 text-xs shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingPdf ? 'பதிவேறுகிறது...' : 'PDF தேர்வு'}</span>
                  <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handlePdfFileUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelForm}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl uppercase text-xs tracking-wider transition cursor-pointer"
              >
                ரத்து செய்
              </button>
            )}
            <button
              type="submit"
              className={`flex-1 ${editingId ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'} font-black py-3 rounded-xl uppercase text-xs tracking-wider shadow-lg cursor-pointer transition`}
            >
              {editingId ? 'மின்-இதழைப் புதுப்பி (Update E-Paper)' : 'மின்-இதழை வெளியிடு (Publish E-Paper)'}
            </button>
          </div>
        </form>
      )}

      {/* PUBLISHED EPAPERS LIST GRID */}
      <div className="bg-[#0a1626] border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>வெளியிடப்பட்ட மாதாந்திர மின்-இதழ்கள் ({epapers.length})</span>
          <span className="text-xs text-amber-400 font-semibold">வாசகர்கள் உள்நுழைந்து மட்டுமே பதிவிறக்க முடியும்</span>
        </h3>

        {epapers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            மின்-இதழ்கள் எதுவும் இல்லை. புதிய இதழை பதிவேற்றவும்.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {epapers.map((item) => (
              <div
                key={item.id}
                className="bg-[#0e2133] border border-slate-700/80 p-4 rounded-2xl space-y-3 relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {item.coverImage && (
                    <div className="w-full h-36 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                      <img
                        src={getMediaUrl(item.coverImage)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.edition}
                    </span>
                    <span className="text-slate-400 font-bold">{getMonthLabel(item.month) || item.month}</span>
                  </div>

                  <h4 className="font-extrabold text-sm text-white leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                    <span>{item.pagesCount || 16} பக்கங்கள்</span>
                    <span>•</span>
                    <span>{item.fileSize || '12.4 MB'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> வாசகர் பாதுகாப்பு
                  </span>

                  <div className="flex items-center gap-2">
                    {item.pdfUrl && (
                      <a
                        href={getMediaUrl(item.pdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-slate-950 rounded-xl transition cursor-pointer"
                        title="PDF முன்னோட்டம் / வாசிக்க"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleEditEpaper(item)}
                      className="p-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 rounded-xl transition cursor-pointer"
                      title="திருத்துக"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEpaper(item.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition cursor-pointer"
                      title="நீக்குக"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live 3D Reader Modal */}
      {isLiveReaderOpen && (
        <AmazeTimesViewerModal
          isOpen={isLiveReaderOpen}
          onClose={() => setIsLiveReaderOpen(false)}
          initialPublication="enewspaper"
          initialDate={autoDate}
        />
      )}
    </div>
  );
};
