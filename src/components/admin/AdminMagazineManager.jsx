import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api, getMediaUrl } from '../../services/api';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  Calendar,
  FileText,
  Sparkles,
  Download,
  Eye,
  X,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Award,
  Layers
} from 'lucide-react';
import { exportPublicationToPdf } from '../../utils/pdfExporter';
import AmazeTimesPageRenderer from '../amazetimes/AmazeTimesPageRenderer';

const MONTH_OPTIONS = [
  { code: '01', name: 'ஜனவரி' },
  { code: '02', name: 'பிப்ரவரி' },
  { code: '03', name: 'மார்ச்' },
  { code: '04', name: 'ஏப்ரல்' },
  { code: '05', name: 'மே' },
  { code: '06', name: 'ஜூன்' },
  { code: '07', name: 'ஜூலை' },
  { code: '08', name: 'ஆகஸ்ட்' },
  { code: '09', name: 'செப்டம்பர்' },
  { code: '10', name: 'அக்டோபர்' },
  { code: '11', name: 'நவம்பர்' },
  { code: '12', name: 'டிசம்பர்' }
];

const DEFAULT_MASTHEAD = {
  brandTitle: 'அமேஸ் டைம்ஸ்',
  subtitle: 'புலனாய்வு & செய்தி விழிப்புணர்வு மாத இதழ்',
  publisher: 'அமேஸ் டைம்ஸ் மீடியா நெட்வொர்க்',
  editor: 'தலைமை ஆசிரியர் குழு',
  specialEditors: 'அரசியல் & சமூகப் பிரிவு',
  associateEditors: 'செய்தித் தொகுப்புக் குழு',
  districtReporters: 'தமிழ்நாடு அனைத்து மாவட்ட நிருபர்கள்',
  designer: 'அமேஸ் டைம்ஸ் வடிவமைப்புப் பிரிவு',
  officeAddress: 'சென்னை, தமிழ்நாடு - 600 005.',
  contactPhone: '+91 99426 12398',
  contactEmail: 'editor@amazetimes.com',
  legalImprint: 'Printed, Published and Owned by Amaze Times Media Network. Chennai - 600 005.'
};

export const AdminMagazineManager = () => {
  const {
    magazinesList,
    addMagazine,
    updateMagazine,
    deleteMagazine,
    showToast
  } = useApp();

  const list = magazinesList || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Best News Candidates for Cover Image & Story Curation
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [targetSourceMonthLabel, setTargetSourceMonthLabel] = useState('');

  // Structured Template Preview & PDF Export States
  const [previewMagazineData, setPreviewMagazineData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [pdfExportProgress, setPdfExportProgress] = useState(null);

  const now = new Date();
  const currentMonthCode = String(now.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(now.getFullYear());

  // Form State
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    month: currentMonthCode,
    year: currentYearStr,
    issueMonth: `${MONTH_OPTIONS.find(m => m.code === currentMonthCode)?.name || 'நவம்பர்'} ${currentYearStr}`,
    coverImage: '',
    pdfUrl: '',
    pdfFileName: '',
    fileSize: '8.4 MB',
    pagesCount: 12,
    category: 'special',
    isFeatured: true,
    highlightsText: '',
    selectedArticleIds: [],
    mastheadConfig: { ...DEFAULT_MASTHEAD }
  });

  // Load Last Month Best News Candidates
  const fetchBestNewsCandidates = useCallback(async (yr, mo) => {
    try {
      setLoadingCandidates(true);
      const res = await fetch(`/api/amazetimes/magazine/candidates?year=${yr}&month=${mo}`);
      const data = await res.json();
      if (data && data.success) {
        setCandidates(data.candidates || []);
        setTargetSourceMonthLabel(data.targetSourceMonth || '');
        return data.candidates || [];
      }
    } catch (e) {
      console.warn('Candidates fetch error:', e);
    } finally {
      setLoadingCandidates(false);
    }
    return [];
  }, []);

  useEffect(() => {
    if (showModal) {
      fetchBestNewsCandidates(form.year, form.month);
    }
  }, [showModal, form.year, form.month, fetchBestNewsCandidates]);

  // Image Compression fallback
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadingImage(true);

    try {
      const res = await api.uploadImage(file);
      if (res && res.success && (res.imageUrl || res.url)) {
        const imgUrl = getMediaUrl(res.imageUrl || res.url);
        setForm((prev) => ({ ...prev, coverImage: imgUrl }));
        if (showToast) showToast('இதழ் அட்டைப் படம் பதிவேற்றப்பட்டது!');
        setUploadingImage(false);
        return;
      }
    } catch (_) {}

    try {
      const compressedDataUrl = await compressImage(file, 800, 0.8);
      setForm((prev) => ({ ...prev, coverImage: compressedDataUrl }));
      if (showToast) showToast('இதழ் அட்டைப் படம் சேர்க்கப்பட்டது!');
    } catch (_) {
      if (showToast) showToast('படம் பதிவேற்றுவதில் பிழை');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadingPdf(true);
    const mbSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    try {
      const res = await api.uploadFile(file);
      if (res && res.success && (res.url || res.fileUrl || res.imageUrl)) {
        const fileUrl = getMediaUrl(res.url || res.fileUrl || res.imageUrl);
        setForm((prev) => ({
          ...prev,
          pdfUrl: fileUrl,
          pdfFileName: file.name,
          fileSize: mbSize
        }));
        if (showToast) showToast('PDF இதழ் கோப்பு வெற்றிகரமாக பதிவேற்றப்பட்டது!');
      } else {
        if (showToast) showToast(res?.message || 'PDF பதிவேற்றத்தில் பிழை');
      }
    } catch (err) {
      if (showToast) showToast('PDF பதிவேற்றுவதில் பிழை: ' + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleOpenModal = async (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        subtitle: item.subtitle || item.description || '',
        month: String(item.month || currentMonthCode).padStart(2, '0'),
        year: String(item.year || currentYearStr),
        issueMonth: item.issueMonth || item.edition || `${MONTH_OPTIONS.find(m => m.code === String(item.month || currentMonthCode).padStart(2, '0'))?.name || 'நவம்பர்'} ${item.year || currentYearStr}`,
        coverImage: item.coverImage || '',
        pdfUrl: item.pdfUrl || '',
        pdfFileName: item.pdfFileName || (item.pdfUrl && item.pdfUrl !== 'auto-compiled' ? 'சேமிக்கப்பட்ட PDF கோப்பு' : ''),
        fileSize: item.fileSize || '8.4 MB',
        pagesCount: item.pagesCount || item.pageCount || 12,
        category: item.category || 'special',
        isFeatured: item.isFeatured ?? true,
        highlightsText: Array.isArray(item.highlights) ? item.highlights.join('\n') : (item.highlights || ''),
        selectedArticleIds: Array.isArray(item.selectedArticleIds) ? item.selectedArticleIds : [],
        mastheadConfig: item.mastheadConfig ? { ...DEFAULT_MASTHEAD, ...item.mastheadConfig } : { ...DEFAULT_MASTHEAD }
      });
    } else {
      setEditingItem(null);
      const loaded = await fetchBestNewsCandidates(currentYearStr, currentMonthCode);
      const topIds = loaded.slice(0, 15).map(a => a.id);
      const topCover = loaded[0]?.mainImage || '/Amaze times.jpg';
      const monthTamil = MONTH_OPTIONS.find(m => m.code === currentMonthCode)?.name || 'நவம்பர்';

      setForm({
        title: `அமேஸ் டைம்ஸ் மாதாந்திர மலர் - ${monthTamil} ${currentYearStr}`,
        subtitle: `${monthTamil} ${currentYearStr} சிறப்புப் பதிப்பு — கடந்த மாதத்தின் முக்கியச் செய்திகள் மற்றும் சிறப்புக் கட்டுரைகள்.`,
        month: currentMonthCode,
        year: currentYearStr,
        issueMonth: `${monthTamil}-${currentYearStr}`,
        coverImage: topCover,
        pdfUrl: '',
        pdfFileName: '',
        fileSize: '8.4 MB',
        pagesCount: Math.max(8, Math.ceil(topIds.length / 2) + 1),
        category: 'special',
        isFeatured: true,
        highlightsText: loaded.slice(0, 4).map(a => a.title).join('\n'),
        selectedArticleIds: topIds,
        mastheadConfig: { ...DEFAULT_MASTHEAD }
      });
    }
    setShowModal(true);
  };

  const toggleArticleSelection = (artId) => {
    setForm(prev => {
      const exists = prev.selectedArticleIds.includes(artId);
      const nextIds = exists
        ? prev.selectedArticleIds.filter(id => id !== artId)
        : [...prev.selectedArticleIds, artId];
      return {
        ...prev,
        selectedArticleIds: nextIds,
        pagesCount: Math.max(2, Math.ceil(Math.max(1, nextIds.length - 1) / 2) + 1)
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('தயவுசெய்து இதழின் தலைப்பை உள்ளிடவும்');
      return;
    }

    const highlights = form.highlightsText
      .split('\n')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const payload = {
      ...form,
      edition: form.issueMonth,
      description: form.subtitle,
      pageCount: form.pagesCount,
      highlights,
      coverImage: form.coverImage || candidates[0]?.mainImage || '/Amaze times.jpg',
      pdfUrl: form.pdfUrl || 'auto-compiled'
    };

    if (editingItem) {
      updateMagazine(editingItem.id, payload);
    } else {
      addMagazine(payload);
    }

    setShowModal(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`'${title}' மாத இதழை நிச்சயமாக நீக்க வேண்டுமா?`)) {
      deleteMagazine(id);
    }
  };

  // Preview Live Structured Magazine Template from DB & Last Month Top News
  const handlePreviewMagazineTemplate = async (item) => {
    try {
      setLoadingPreview(true);
      const yr = item.year || currentYearStr;
      const mo = String(item.month || currentMonthCode).padStart(2, '0');
      const res = await fetch(`/api/amazetimes/magazine?id=${encodeURIComponent(item.id)}&year=${yr}&month=${mo}`);
      const data = await res.json();
      if (data && data.success) {
        setPreviewMagazineData(data);
      } else {
        showToast('இதழ் முன்னோட்டத்தை ஏற்ற முடியவில்லை');
      }
    } catch (e) {
      showToast('முன்னோட்டப் பிழை: ' + e.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Export Any Magazine to Neat Multi-Page PDF matching Uploaded Sample Template
  const handleDownloadTemplatePdf = async (item) => {
    if (pdfExportProgress) return;
    try {
      const yr = item.year || currentYearStr;
      const mo = String(item.month || currentMonthCode).padStart(2, '0');
      showToast('இதழ் பக்கங்கள் தொகுக்கப்படுகின்றன...');
      const res = await fetch(`/api/amazetimes/magazine?id=${encodeURIComponent(item.id)}&year=${yr}&month=${mo}`);
      const data = await res.json();
      if (!data?.success || !Array.isArray(data.pages) || data.pages.length === 0) {
        showToast('இதழ் பக்கங்கள் கிடைக்கவில்லை');
        return;
      }

      await exportPublicationToPdf({
        pages: data.pages,
        publicationType: 'magazine',
        editionName: data.publication?.edition || item.issueMonth || '',
        fileName: `Amaze_Times_Magazine_${yr}_${mo}.pdf`,
        onProgress: (curr, tot) => setPdfExportProgress({ current: curr, total: tot, id: item.id })
      });
      showToast('மாத இதழ் PDF வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!');
    } catch (e) {
      showToast('PDF உருவாக்குவதில் பிழை: ' + e.message);
    } finally {
      setPdfExportProgress(null);
    }
  };

  const filteredList = list
    .filter((m) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (m.title || '').toLowerCase().includes(q) || (m.issueMonth || m.edition || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const yA = parseInt(a.year, 10) || 0;
      const yB = parseInt(b.year, 10) || 0;
      if (yB !== yA) return yB - yA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

  return (
    <div className="space-y-6 font-tamil">
      {/* HEADER CARD */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              டிஜிட்டல் மாத இதழ்கள் உருவாக்கி &amp; மேலாண்மை (Magazine Studio)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            கடந்த மாதத்தின் சிறந்த செய்திகளைத் தொகுத்து, சிறந்த செய்திப் படம் அல்லது உங்கள் சொந்த அட்டைப்படத்துடன் நேர்த்தியான இதழ் வார்ப்புருவில் (Magazine Template) PDF இதழ்களை உருவாக்கி வெளியிடுங்கள்.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>புதிய மாத இதழ் உருவாக்கு</span>
        </button>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="இதழ் தலைப்பு அல்லது மாதம் தேட..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050915] text-white pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        <div className="text-xs font-bold text-slate-300 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          மொத்தம்: <strong className="text-amber-400">{list.length}</strong> இதழ்கள் வெளியிடப்பட்டுள்ளன
        </div>
      </div>

      {/* MAGAZINES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item) => {
          const isExportingThis = pdfExportProgress?.id === item.id;
          return (
            <div
              key={item.id}
              className={`bg-[#0f172a] rounded-3xl border p-5 shadow-xl space-y-4 flex flex-col justify-between transition ${
                item.isFeatured ? 'border-amber-500/80 ring-2 ring-amber-500/30 bg-gradient-to-b from-[#131c36] to-[#0f172a]' : 'border-slate-800'
              }`}
            >
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 h-52 border border-slate-800">
                  <img
                    src={getMediaUrl(item.coverImage)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/Amaze times.jpg';
                    }}
                  />
                  {item.isFeatured && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> சிறப்பு இதழ்
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 bg-black/85 backdrop-blur-md text-amber-300 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-amber-500/30">
                    {item.issueMonth || item.edition || `${item.year}-${item.month}`}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-white text-base leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.subtitle || item.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-300 bg-[#050915] p-3 rounded-xl border border-slate-800">
                  <div>📖 பக்கங்கள்: <span className="text-amber-400">{item.pagesCount || item.pageCount || 12}</span></div>
                  <div>📰 செய்திகள்: <span className="text-emerald-400">{Array.isArray(item.selectedArticleIds) && item.selectedArticleIds.length > 0 ? item.selectedArticleIds.length : 'தானியங்கி'}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => handleDownloadTemplatePdf(item)}
                  disabled={Boolean(pdfExportProgress)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black cursor-pointer transition flex items-center gap-1.5 shadow disabled:opacity-60"
                  title="இதழ் வார்ப்புருவில் PDF உருவாக்கி பதிவிறக்கவும்"
                >
                  <Download className={`w-3.5 h-3.5 ${isExportingThis ? 'animate-bounce' : ''}`} />
                  <span>
                    {isExportingThis
                      ? `(${pdfExportProgress.current}/${pdfExportProgress.total})...`
                      : 'PDF பதிவிறக்கம்'}
                  </span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePreviewMagazineTemplate(item)}
                    className="p-2 bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-slate-950 rounded-xl transition cursor-pointer"
                    title="இதழ் வார்ப்புரு முன்னோட்டம் (Template Preview)"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer"
                    title="திருத்துக"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 bg-slate-800 hover:bg-red-600/80 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                    title="நீக்குக"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TEMPLATE LIVE PREVIEW MODAL */}
      {previewMagazineData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col p-3 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3 mb-4 flex-shrink-0">
            <div>
              <h3 className="text-base font-black text-amber-400">{previewMagazineData.publication?.title}</h3>
              <p className="text-xs text-slate-400">
                இதழ் வார்ப்புரு முன்னோட்டம் • {previewMagazineData.pages?.length || 0} பக்கங்கள்
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownloadTemplatePdf(previewMagazineData.publication)}
                disabled={Boolean(pdfExportProgress)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {pdfExportProgress
                    ? `PDF (${pdfExportProgress.current}/${pdfExportProgress.total})...`
                    : 'PDF-ஆகப் பதிவிறக்கு'}
                </span>
              </button>
              <button
                onClick={() => setPreviewMagazineData(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-wrap justify-center gap-6 pb-8">
            {(previewMagazineData.pages || []).map((pg) => (
              <div key={pg.pageNumber} className="shadow-2xl border border-slate-700 rounded overflow-hidden">
                <div className="bg-slate-900 text-amber-300 text-xs font-bold px-3 py-1.5 flex justify-between">
                  <span>{pg.title}</span>
                  <span>பக்கம் {pg.pageNumber}</span>
                </div>
                <div style={{ width: '437px', height: '618px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '794px', height: '1123px' }}>
                    <AmazeTimesPageRenderer page={pg} publicationType="magazine" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT MAGAZINE BUILDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-5">
          <div className="bg-[#0f172a] rounded-3xl max-w-4xl w-full max-h-[92vh] border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center border-b border-slate-800 p-4 sm:p-5 bg-[#0f172a] shrink-0">
              <h3 className="font-black text-amber-400 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                {editingItem ? 'மாத இதழ் & வார்ப்புரு திருத்துதல்' : 'புதிய மாதாந்திர இதழ் உருவாக்கம்'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm overflow-y-auto flex-1">
              {/* Month & Year Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">வெளியீட்டு மாதம்:</label>
                  <select
                    value={form.month}
                    onChange={(e) => {
                      const code = e.target.value;
                      const name = MONTH_OPTIONS.find(m => m.code === code)?.name || '';
                      setForm(prev => ({
                        ...prev,
                        month: code,
                        issueMonth: `${name}-${prev.year}`,
                        title: editingItem ? prev.title : `அமேஸ் டைம்ஸ் மாதாந்திர மலர் - ${name} ${prev.year}`
                      }));
                    }}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">ஆண்டு (Year):</label>
                  <input
                    type="text"
                    required
                    value={form.year}
                    onChange={(e) => setForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">பக்கத் தலைப்பு முத்திரை:</label>
                  <input
                    type="text"
                    required
                    value={form.issueMonth}
                    onChange={(e) => setForm(prev => ({ ...prev, issueMonth: e.target.value }))}
                    placeholder="எ.கா: நவம்பர்-2026"
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-2.5 text-amber-300 font-bold"
                  />
                </div>
              </div>

              {/* BEST NEWS COVER IMAGE PICKER + CUSTOM UPLOAD */}
              <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-amber-300 flex items-center gap-1.5 text-sm">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>சிறந்த செய்தியிலிருந்து அட்டைப்படம் தேர்வு செய்க (Choose Cover from Best News)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {targetSourceMonthLabel ? `${targetSourceMonthLabel} மாதத்தின் சிறந்த செய்திகளின் படங்கள்` : 'சிறந்த செய்திகளின் படங்கள்'} — அல்லது உங்கள் சொந்தப் படத்தை பதிவேற்றலாம்.
                    </p>
                  </div>

                  {/* Custom Cover Upload Button */}
                  <label className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'ஏற்றப்படுகிறது...' : 'சொந்தப் படம் சேர்'}</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>

                {/* Selected Cover Preview + Custom URL Input */}
                <div className="flex items-center gap-4 bg-[#050915] p-3 rounded-xl border border-slate-800">
                  <img
                    src={getMediaUrl(form.coverImage || '/Amaze times.jpg')}
                    alt="Chosen Cover"
                    className="w-16 h-20 object-cover rounded-lg border-2 border-amber-400 flex-shrink-0"
                    onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                  />
                  <div className="flex-1 space-y-1.5">
                    <span className="text-emerald-400 font-bold text-xs block">✓ தேர்ந்தெடுக்கப்பட்ட அட்டைப்படம் (Page 1 Cover Image)</span>
                    <input
                      type="text"
                      placeholder="அட்டைப்பட URL முகவரி அல்லது கீழே இருந்து தேர்வு செய்க..."
                      value={form.coverImage}
                      onChange={(e) => setForm(prev => ({ ...prev, coverImage: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Visual Carousel of Best News Images */}
                {loadingCandidates ? (
                  <div className="py-3 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> சிறந்த செய்திகள் ஏற்றப்படுகின்றன...
                  </div>
                ) : (
                  <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                    {candidates.slice(0, 12).map((cand) => {
                      const isPicked = form.coverImage === cand.mainImage;
                      return (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, coverImage: cand.mainImage }))}
                          className={`relative flex-shrink-0 w-28 rounded-xl overflow-hidden border-2 text-left transition cursor-pointer ${
                            isPicked
                              ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.03]'
                              : 'border-slate-700 hover:border-amber-500/70 opacity-85 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={getMediaUrl(cand.mainImage)}
                            alt={cand.title}
                            className="w-full h-16 object-cover bg-slate-950"
                            onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                          />
                          {isPicked && (
                            <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow">
                              <Check className="w-3 h-3 font-black" />
                            </div>
                          )}
                          <div className="p-1.5 bg-slate-950">
                            <p className="text-[9.5px] font-bold text-slate-200 line-clamp-2 leading-tight">{cand.title}</p>
                            <span className="text-[8.5px] text-amber-400 font-bold">👁 {cand.viewsCount || 0}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">இதழ் தலைப்பு (Magazine Title):*</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">துணைத் தலைப்பு / கருப்பொருள்:</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* CURATE LAST MONTH IMPORTANT NEWS FOR TEMPLATE */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-white flex items-center gap-2 text-sm">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>இதழில் இடம்பெறும் முக்கியச் செய்திகள் ({form.selectedArticleIds.length} தேர்வு செய்யப்பட்டது)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      selectedArticleIds: prev.selectedArticleIds.length > 0 ? [] : candidates.slice(0, 15).map(c => c.id)
                    }))}
                    className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    {form.selectedArticleIds.length > 0 ? 'அனைத்தையும் நீக்கு' : 'சிறந்த 15 செய்திகளைத் தேர்ந்தெடு'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                  {candidates.map((cand) => {
                    const checked = form.selectedArticleIds.includes(cand.id);
                    return (
                      <label
                        key={cand.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition text-xs ${
                          checked
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                            : 'bg-[#050915] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArticleSelection(cand.id)}
                          className="mt-1 accent-emerald-500 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold line-clamp-2 leading-snug">{cand.title}</p>
                          <span className="text-[10px] text-amber-400/90 font-semibold">
                            {cand.category} • 👁 {cand.viewsCount || 0}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* PAGE 1 MASTHEAD TEMPLATE SETTINGS ("அடுத்த தலைமுறை" Style Box) */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="font-black text-amber-300 text-xs uppercase tracking-wider">
                  பக்கம் 1 ஆசிரியர் குழு விவரம் (Page 1 Editorial Masthead Box)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-0.5">ஆசிரியர் (Editor):</label>
                    <input
                      type="text"
                      value={form.mastheadConfig?.editor || ''}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        mastheadConfig: { ...prev.mastheadConfig, editor: e.target.value }
                      }))}
                      className="w-full bg-[#050915] border border-slate-700 rounded-lg px-2.5 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">அச்சிட்டு வெளியிடுபவர் (Publisher):</label>
                    <input
                      type="text"
                      value={form.mastheadConfig?.publisher || ''}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        mastheadConfig: { ...prev.mastheadConfig, publisher: e.target.value }
                      }))}
                      className="w-full bg-[#050915] border border-slate-700 rounded-lg px-2.5 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">தொடர்பு எண் &amp; E-mail:</label>
                    <input
                      type="text"
                      value={form.mastheadConfig?.contactPhone || ''}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        mastheadConfig: { ...prev.mastheadConfig, contactPhone: e.target.value }
                      }))}
                      className="w-full bg-[#050915] border border-slate-700 rounded-lg px-2.5 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Manual PDF Override */}
              <div className="bg-[#050915] border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-300 text-xs block">விருப்பத் தேர்வு: சொந்த PDF கோப்பு இணைக்க (Optional Custom PDF)</span>
                  <span className="text-[10px] text-slate-500">பதிவேற்றாவிட்டால் தானாகவே அழகிய இதழ் வார்ப்புருவில் PDF உருவாகும்.</span>
                </div>
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{uploadingPdf ? 'ஏற்றப்படுகிறது...' : (form.pdfFileName || 'PDF பதிவேற்று')}</span>
                  <input type="file" accept=".pdf,application/pdf" onChange={handlePdfFileUpload} className="hidden" />
                </label>
              </div>

              <div className="flex items-center justify-between bg-[#050915] p-3 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>சிறப்பு இதழாக முன்னிலைப்படுத்து (Is Featured Edition)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 py-3.5 rounded-xl uppercase tracking-wider cursor-pointer transition"
              >
                {editingItem ? 'புதுப்பித்து வெளியிடவும்' : 'சேமித்து வெளியிடவும் (Publish Magazine)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
