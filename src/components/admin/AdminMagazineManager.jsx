import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api, getMediaUrl } from '../../services/api';
import { defaultMagazines } from '../../data/magazineData';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Sparkles,
  Download,
  Eye,
  Star,
  X,
  Layers
} from 'lucide-react';

export const AdminMagazineManager = () => {
  const {
    magazinesList,
    addMagazine,
    updateMagazine,
    deleteMagazine,
    handleDownloadMagazine,
    showToast
  } = useApp();

  const list = magazinesList || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

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
        const errorMsg = res?.message || 'PDF பதிவேற்றுவதில் பிழை ஏற்பட்டது. தயவுசெய்து கோப்பை சரிபார்க்கவும்.';
        if (showToast) showToast(errorMsg);
      }
    } catch (err) {
      if (showToast) showToast('PDF பதிவேற்றுவதில் பிழை: ' + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  // Form State
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    issueMonth: 'அக்டோபர் 2026',
    year: '2026',
    coverImage: '',
    pdfUrl: '',
    fileSize: '18.4 MB',
    pagesCount: 52,
    category: 'special',
    isFeatured: true,
    highlightsText: ''
  });

  // Image Compression helper
  const compressImage = (file, maxWidth = 400, quality = 0.75) => {
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
    } catch (err) {}

    try {
      const compressedDataUrl = await compressImage(file, 400, 0.75);
      setForm((prev) => ({ ...prev, coverImage: compressedDataUrl }));
      if (showToast) showToast('இதழ் படம் சுருக்கப்பட்டு சேமிக்கப்பட்டது!');
    } catch (err) {
      if (showToast) showToast('படம் பதிவேற்றுவதில் பிழை');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        subtitle: item.subtitle || '',
        issueMonth: item.issueMonth || 'அக்டோபர் 2026',
        year: item.year || '2026',
        coverImage: item.coverImage || '',
        pdfUrl: item.pdfUrl || '',
        pdfFileName: item.pdfFileName || (item.pdfUrl ? 'சேமிக்கப்பட்ட PDF கோப்பு' : ''),
        fileSize: item.fileSize || '18.4 MB',
        pagesCount: item.pagesCount || 48,
        category: item.category || 'special',
        isFeatured: item.isFeatured || false,
        highlightsText: Array.isArray(item.highlights) ? item.highlights.join('\n') : (item.highlights || '')
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        subtitle: '',
        issueMonth: 'அக்டோபர் 2026',
        year: '2026',
        coverImage: '',
        pdfUrl: '',
        pdfFileName: '',
        fileSize: '18.4 MB',
        pagesCount: 52,
        category: 'special',
        isFeatured: true,
        highlightsText: 'தமிழகத்தின் 2030 தொழில் பார்வை & செமிகண்டக்டர் திட்டம்\nAI செயற்கை நுண்ணறிவு - புதிய வேலை வாய்ப்புகள்\nகோயில் சிற்பங்களின் கட்டிடக்கலை ரகசியங்கள்'
      });
    }
    setShowModal(true);
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
      highlights,
      coverImage: form.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      pdfUrl: form.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      previewPages: editingItem?.previewPages || [
        {
          pageNumber: 1,
          title: 'அட்டைப் படம் & தலையங்கம்',
          image: form.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
          content: `${form.title} இதழின் சிறப்புப் பார்வை.`
        }
      ]
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

  const filteredList = list
    .filter((m) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.issueMonth.toLowerCase().includes(q);
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
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              டிஜிட்டல் மாத இதழ்கள் மேலாண்மை (Magazine Manager)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans">
            Upload & manage digital PDF magazine issues, set featured editions, page counts, and reader download links.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>+ புதிய மாத இதழ் சேர்</span>
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
        {filteredList.map((item) => (
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
                    e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                {item.isFeatured && (
                  <span className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold shadow-md shadow-red-600/30 text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" /> சிறப்பு இதழ்
                  </span>
                )}
                <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-amber-300 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-amber-500/30">
                  {item.issueMonth}
                </span>
              </div>

              <div>
                <h3 className="font-black text-white text-base leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-300 bg-[#050915] p-3 rounded-xl border border-slate-800">
                <div>📖 பக்கங்கள்: <span className="text-amber-400">{item.pagesCount}</span></div>
                <div>💾 அளவு: <span className="text-amber-400">{item.fileSize}</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={(e) => handleDownloadMagazine(item, e)}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 text-xs font-extrabold cursor-pointer transition flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>

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
                  onClick={() => handleOpenModal(item)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
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
          <div className="bg-[#0f172a] rounded-3xl max-w-xl w-full max-h-[90vh] border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center border-b border-slate-800 p-4 sm:p-5 bg-[#0f172a] shrink-0">
              <h3 className="font-black text-amber-400 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                {editingItem ? 'மாத இதழ் திருத்துதல்' : 'புதிய டிஜிட்டல் மாத இதழ் பதிவு'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
              {/* Cover Upload */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">இதழ் அட்டைப் படம் (Cover Image):</label>
                <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/90 rounded-2xl p-4 text-center space-y-2 relative transition cursor-pointer">
                  {form.coverImage ? (
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={getMediaUrl(form.coverImage)}
                        alt="Preview"
                        className="w-16 h-20 rounded-xl object-cover border-2 border-amber-400 shadow"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="text-left space-y-1">
                        <span className="text-emerald-400 font-bold block">✓ அட்டைப் படம் சேர்க்கப்பட்டது</span>
                        <label className="text-[11px] text-amber-400 hover:underline cursor-pointer font-bold block">
                          படத்தை மாற்று (Change Cover)
                          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2">
                      <Upload className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                      <span className="text-slate-300 font-bold block">அட்டைப் படத்தை பதிவேற்ற கிளிக் செய்யவும்</span>
                      <span className="text-[10px] text-slate-500 block">PNG, JPG, WEBP (Max 5MB)</span>
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    </label>
                  )}
                  {uploadingImage && <div className="text-amber-400 text-[10px] font-bold">பதிவேற்றப்படுகிறது...</div>}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">இதழ் தலைப்பு (Magazine Title):*</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: அடுத்த தலைமுறை - அக்டோபர் 2026 சிறப்பு மாத இதழ்"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">துணைத் தலைப்பு / கருப்பொருள்:</label>
                <input
                  type="text"
                  placeholder="எ.கா: தமிழகத்தின் தொழில் வளர்ச்சி & AI வழிகாட்டி..."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">வெளியீட்டு மாதம் & ஆண்டு:</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: அக்டோபர் 2026"
                    value={form.issueMonth}
                    onChange={(e) => setForm({ ...form, issueMonth: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">ஆண்டு (Year):</label>
                  <input
                    type="text"
                    required
                    placeholder="2026"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">பக்கங்கள் (Pages Count):</label>
                  <input
                    type="number"
                    required
                    value={form.pagesCount}
                    onChange={(e) => setForm({ ...form, pagesCount: parseInt(e.target.value, 10) || 48 })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">கோப்பு அளவு (File Size):</label>
                  <input
                    type="text"
                    placeholder="எ.கா: 18.4 MB"
                    value={form.fileSize}
                    onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                    className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white font-bold"
                  />
                </div>
              </div>

              {/* PDF File Upload Dropzone */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">PDF இதழ் கோப்பு பதிவேற்றம் (Upload PDF File):*</label>
                <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/90 rounded-2xl p-4 text-center space-y-2 relative transition cursor-pointer">
                  {form.pdfUrl ? (
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3 text-left overflow-hidden">
                        <span className="p-2 bg-red-600/20 text-red-400 rounded-lg shrink-0">
                          <FileText className="w-5 h-5" />
                        </span>
                        <div className="truncate">
                          <span className="text-emerald-400 font-bold text-xs block">✓ PDF கோப்பு இணைக்கப்பட்டது</span>
                          <span className="text-slate-300 font-mono text-[11px] truncate block">{form.pdfFileName || form.pdfUrl}</span>
                        </div>
                      </div>
                      <label className="text-[11px] bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-black cursor-pointer shrink-0 transition shadow-sm">
                        மாற்று (Change PDF)
                        <input type="file" accept=".pdf,application/pdf" onChange={handlePdfFileUpload} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2">
                      <Upload className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                      <span className="text-slate-300 font-bold block">PDF இதழ் கோப்பை பதிவேற்ற கிளிக் செய்யவும்</span>
                      <span className="text-[10px] text-slate-500 block">PDF Format (.pdf files, max 50MB)</span>
                      <input type="file" accept=".pdf,application/pdf" onChange={handlePdfFileUpload} className="hidden" />
                    </label>
                  )}
                  {uploadingPdf && <div className="text-amber-400 text-[10px] font-bold">PDF கோப்பு பதிவேற்றப்படுகிறது...</div>}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">இதழின் முக்கிய சிறப்பம்சங்கள் (Highlights - line by line):</label>
                <textarea
                  rows="3"
                  placeholder="ஒவ்வொரு சிறப்பம்சத்தையும் தனித்தனி வரியில் உள்ளிடவும்..."
                  value={form.highlightsText}
                  onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
                  className="w-full bg-[#050915] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium leading-relaxed"
                ></textarea>
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
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold shadow-md shadow-red-600/30 py-3.5 rounded-xl uppercase tracking-wider shadow-lg cursor-pointer transition"
              >
                {editingItem ? 'புதுப்பித்து வெளியிடவும்' : 'சேமித்து வெளியிடவும்'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
