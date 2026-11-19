import React, { useState, useMemo } from 'react';
import { 
  MapPin, Search, Plus, Filter, Sparkles, RefreshCw, 
  CheckCircle2, Edit3, Trash2, Eye, ArrowRight, Layers 
} from 'lucide-react';
import { DISTRICT_LIST } from '../../data/categorySubCategories';
import { api } from '../../services/api';

export default function AdminDistrictNewsManager({ 
  articles = [], 
  onRefresh, 
  onOpenEditModal, 
  onDeleteNews,
  showToast 
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingId, setIsUpdatingId] = useState(null);
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  // Filtered District News
  const filteredList = useMemo(() => {
    return (articles || []).filter((art) => {
      const artDist = art.district || 'all';
      
      // District filter
      if (selectedDistrict !== 'all') {
        if (selectedDistrict === 'untagged') {
          if (artDist !== 'all' && artDist !== '') return false;
        } else {
          if (String(artDist).toLowerCase() !== String(selectedDistrict).toLowerCase()) {
            return false;
          }
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (art.title || '').toLowerCase().includes(q);
        const distMatch = (artDist || '').toLowerCase().includes(q);
        const catMatch = (art.category || '').toLowerCase().includes(q);
        return titleMatch || distMatch || catMatch;
      }

      return true;
    });
  }, [articles, selectedDistrict, searchQuery]);

  // Statistics
  const taggedCount = articles.filter(a => a.district && a.district !== 'all' && a.district !== '').length;
  const untaggedCount = articles.length - taggedCount;
  const uniqueDistricts = new Set(
    articles
      .map(a => a.district)
      .filter(d => d && d !== 'all' && d !== '')
  ).size;

  // Handle inline district reassignment
  const handleDistrictChange = async (articleId, newDistrict) => {
    try {
      setIsUpdatingId(articleId);
      const res = await api.updateNews(articleId, { district: newDistrict });
      if (res && res.success) {
        showToast(`செய்தியின் மாவட்டம் '${newDistrict}' என மாற்றப்பட்டது!`);
        if (onRefresh) onRefresh();
      } else {
        showToast(res?.message || 'மாவட்டம் மாற்றுவதில் பிழை');
      }
    } catch (err) {
      showToast('பிழை: ' + err.message);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Run Auto-Tagger from client for instant background alignment
  const handleRunAutoTag = async () => {
    try {
      setIsAutoTagging(true);
      showToast('மாவட்டக் குறியீடுகள் ஆய்வு செய்யப்படுகின்றன...');

      const TN_KEYWORDS = [
        { name: 'சென்னை', kws: ['சென்னை', 'சென்னையில்', 'chennai', 'கோயம்பேடு', 'கிண்டி', 'தாம்பரம்', 'மெரினா'] },
        { name: 'கோயம்புத்தூர்', kws: ['கோயம்புத்தூர்', 'கோவை', 'கோவையில்', 'coimbatore', 'பொள்ளாச்சி'] },
        { name: 'மதுரை', kws: ['மதுரை', 'மதுரையில்', 'madurai', 'மீனாட்சி அம்மன்'] },
        { name: 'திருச்சிராப்பள்ளி', kws: ['திருச்சிராப்பள்ளி', 'திருச்சி', 'திருச்சியில்', 'trichy', 'ஸ்ரீரங்கம்'] },
        { name: 'சேலம்', kws: ['சேலம்', 'சேலத்தில்', 'salem', 'மேட்டூர்', 'ஏற்காடு'] },
        { name: 'திருநெல்வேலி', kws: ['திருநெல்வேலி', 'நெல்லை', 'நெல்லையில்', 'tirunelveli', 'தாமிரபரணி'] },
        { name: 'திருப்பூர்', kws: ['திருப்பூர்', 'திருப்பூரில்', 'tiruppur'] },
        { name: 'வேலூர்', kws: ['வேலூர்', 'வேலூரில்', 'vellore'] },
        { name: 'ஈரோடு', kws: ['ஈரோடு', 'ஈரோட்டில்', 'erode', 'பவானி'] },
        { name: 'தூத்துக்குடி', kws: ['தூத்துக்குடி', 'தூத்துக்குடியில்', 'thoothukudi'] },
        { name: 'திண்டுக்கல்', kws: ['திண்டுக்கல்', 'திண்டுக்கல்லில்', 'dindigul', 'பழனி'] },
        { name: 'தஞ்சாவூர்', kws: ['தஞ்சாவூர்', 'தஞ்சை', 'தஞ்சையில்', 'thanjavur', 'கும்பகோணம்'] },
        { name: 'விருதுநகர்', kws: ['விருதுநகர்', 'ஸ்ரீவில்லிபுத்தூர்', 'சிவகாசி', 'virudhunagar'] },
        { name: 'கன்னியாகுமரி', kws: ['கன்னியாகுமரி', 'நாகர்கோவில்', 'kanyakumari'] },
        { name: 'கடலூர்', kws: ['கடலூர்', 'கடலூரில்', 'cuddalore', 'சிதம்பரம்'] },
        { name: 'கள்ளக்குறிச்சி', kws: ['கள்ளக்குறிச்சி', 'kallakurichi'] },
        { name: 'தருமபுரி', kws: ['தருமபுரி', 'dharmapuri', 'ஒகேனக்கல்'] },
        { name: 'கிருஷ்ணகிரி', kws: ['கிருஷ்ணகிரி', 'krishnagiri', 'ஓசூர்'] },
        { name: 'நீலகிரி', kws: ['நீலகிரி', 'nilgiris', 'ஊட்டி', 'உதகை'] },
        { name: 'தென்காசி', kws: ['தென்காசி', 'tenkasi', 'குற்றாலம்'] }
      ];

      let updated = 0;
      for (const art of articles) {
        if (!art.district || art.district === 'all') {
          const text = `${art.title || ''} ${art.summary || ''} ${art.content || ''}`.toLowerCase();
          for (const item of TN_KEYWORDS) {
            if (item.kws.some(k => text.includes(k.toLowerCase()))) {
              await api.updateNews(art._id || art.id, { district: item.name });
              updated++;
              break;
            }
          }
        }
      }

      showToast(`தானியங்கி முறையில் ${updated} செய்திகளுக்கு மாவட்டக் குறியீடு இடப்பட்டது!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('பிழை: ' + err.message);
    } finally {
      setIsAutoTagging(false);
    }
  };

  return (
    <div className="space-y-6 font-tamil">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#07153b] via-[#0c2464] to-[#123080] p-6 rounded-3xl text-white shadow-xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              தமிழ்நாடு 38 மாவட்டச் செய்திகள் மேலாண்மை தளம்
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-amber-400 shrink-0" />
            <span>மாவட்டச் செய்திகள் மேலாண்மை (District News)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            ஒவ்வொரு மாவட்டத்திற்கும் உரிய செய்திகளைத் தேர்ந்தெடுத்து நிருவாகம் செய்தல் மற்றும் குறியிடுதல்
          </p>
        </div>

        {/* Action Button: Auto-Tag */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAutoTag}
            disabled={isAutoTagging}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-60"
          >
            <Sparkles className={`w-4 h-4 ${isAutoTagging ? 'animate-spin' : ''}`} />
            <span>{isAutoTagging ? 'குறியிடப்படுகிறது...' : 'தானியங்கி மாவட்டக் குறியீடு'}</span>
          </button>
        </div>
      </div>

      {/* 2. District News Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-bold">மாவட்டக் குறியீடு உள்ளவை</span>
            <h3 className="text-2xl font-black text-white">{taggedCount} செய்திகள்</h3>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-bold">செய்திகள் உள்ள மாவட்டங்கள்</span>
            <h3 className="text-2xl font-black text-emerald-400">{uniqueDistricts} / 38 மாவட்டங்கள்</h3>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-bold">பொது / மாநில அளவிலானவை</span>
            <h3 className="text-2xl font-black text-blue-300">{untaggedCount} செய்திகள்</h3>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="செய்தி தலைப்பு, மாவட்டம் தேடுக..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        {/* 38 Districts Select Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 shrink-0">மாவட்டம்:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#050915] border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
          >
            <option value="all">அனைத்து மாவட்டச் செய்திகள் ({articles.length})</option>
            <option value="untagged">குறியிடப்படாதவை / பொதுச் செய்திகள் ({untaggedCount})</option>
            {DISTRICT_LIST.filter(d => d !== 'அனைத்து மாவட்டங்கள்').map((d) => {
              const count = articles.filter(a => a.district === d).length;
              return (
                <option key={d} value={d}>
                  {d} {count > 0 ? `(${count})` : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 4. District Articles Table with 1-Click Inline District Reassignment */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            பட்டியலில் உள்ளவை: {filteredList.length} செய்திகள்
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-amber-400 font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">படம்</th>
                <th className="p-4">செய்தி தலைப்பு</th>
                <th className="p-4">பிரிவு</th>
                <th className="p-4">ஒதுக்கப்பட்ட மாவட்டம்</th>
                <th className="p-4">நிலை (Status)</th>
                <th className="p-4 text-right">செயல்கள்</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-sans">
                    தேடலுக்குரிய மாவட்டச் செய்திகள் எதுவும் காணப்படவில்லை.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <img
                        src={item.mainImage || item.image || '/Amaze times.jpg'}
                        alt="Thumbnail"
                        className="w-12 h-10 rounded-lg object-cover border border-slate-700 bg-slate-900"
                        onError={(e) => { e.target.src = '/Amaze times.jpg'; }}
                      />
                    </td>
                    <td className="p-4 font-bold text-white max-w-sm">
                      <div className="line-clamp-2">{item.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.authorName || 'செய்தி ஆசிரியர்'} • {item.viewsCount || 0} பார்வைகள்
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-800 text-amber-400 px-2.5 py-1 rounded text-xs font-bold border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    
                    {/* Inline Quick District Dropdown */}
                    <td className="p-4">
                      <select
                        value={item.district || 'all'}
                        disabled={isUpdatingId === (item._id || item.id)}
                        onChange={(e) => handleDistrictChange(item._id || item.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-none transition cursor-pointer ${
                          item.district && item.district !== 'all'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="all">பொது / மாநிலச் செய்தி</option>
                        {DISTRICT_LIST.filter(d => d !== 'அனைத்து மாவட்டங்கள்').map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          item.status === 'published'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
                            : 'bg-amber-950/80 text-amber-300 border-amber-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {onOpenEditModal && (
                        <button
                          onClick={() => onOpenEditModal(item)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer transition"
                        >
                          திருத்து
                        </button>
                      )}
                      {onDeleteNews && (
                        <button
                          onClick={() => onDeleteNews(item._id || item.id)}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer transition"
                        >
                          நீக்கு
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
