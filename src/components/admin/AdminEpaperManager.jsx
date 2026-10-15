import React, { useState, useEffect } from 'react';
import { Newspaper, Upload, Plus, Trash2, Calendar, FileText, CheckCircle2, Lock, Sparkles, MapPin, Image as ImageIcon, Edit, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api, getMediaUrl } from '../../services/api';
import { getMonthYearString, getMonthLabel, getAvailableMonths } from '../../utils/monthUtils';

export const AdminEpaperManager = () => {
  const { showToast } = useApp();

  const [epapers, setEpapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [epaperForm, setEpaperForm] = useState(() => {
    const now = new Date();
    return {
      title: 'அடுத்த தலைமுறை தமிழ்நாடு பிரதான மின்-இதழ்',
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
      title: 'அடுத்த தலைமுறை தமிழ்நாடு பிரதான மின்-இதழ்',
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
                placeholder="உதாரணம்: அடுத்த தலைமுறை தமிழ்நாடு பிரதான மின்-இதழ்..."
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
    </div>
  );
};
