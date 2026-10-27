import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, ArrowRight, Tag, MapPin, Eye, FileText } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'அனைத்தும்', 'தமிழ்நாடு', 'தேசியம்', 'உலகம்', 'சினிமா', 'விளையாட்டு',
  'வணிகம்', 'கல்வி & வேலைவாய்ப்பு', 'ஆன்மீகம்', 'மாவட்டங்கள்'
];

const DISTRICTS = [
  'அனைத்து மாவட்டங்கள்', 'சென்னை', 'கோயம்புத்தூர்', 'மதுரை', 'திருச்சிராப்பள்ளி',
  'சேலம்', 'திருநெல்வேலி', 'திருப்பூர்', 'வேலூர்', 'ஈரோடு', 'தூத்துக்குடி'
];

export default function SearchModal({ isOpen, onClose, onOpenArticle }) {
  const [queryText, setQueryText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('அனைத்தும்');
  const [selectedDistrict, setSelectedDistrict] = useState('அனைத்து மாவட்டங்கள்');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const raw = localStorage.getItem('amaze_recent_searches');
      return raw ? JSON.parse(raw) : ['சென்னை', 'தங்கம் விலை', 'தேர்தல்', 'ஐபிஎல்'];
    } catch (_) {
      return ['சென்னை', 'தங்கம் விலை'];
    }
  });

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('amaze_recent_searches', JSON.stringify(recentSearches));
    } catch (_) {}
  }, [recentSearches]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    if (!queryText.trim() && selectedCategory === 'அனைத்தும்' && selectedDistrict === 'அனைத்து மாவட்டங்கள்') {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = {
          limit: 30,
          search: queryText.trim()
        };
        if (selectedCategory !== 'அனைத்தும்') params.category = selectedCategory;
        if (selectedDistrict !== 'அனைத்து மாவட்டங்கள்') params.district = selectedDistrict;

        const res = await api.getNews(params);
        const items = res?.news || res?.data || res?.articles || [];
        setResults(Array.isArray(items) ? items : []);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [queryText, selectedCategory, selectedDistrict, isOpen]);

  const handleSelectRecent = (term) => {
    setQueryText(term);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  const handleArticleClick = (art) => {
    // Add query to recent searches
    if (queryText.trim() && !recentSearches.includes(queryText.trim())) {
      setRecentSearches(prev => [queryText.trim(), ...prev.slice(0, 7)]);
    }
    onClose();
    if (onOpenArticle) onOpenArticle(art);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-tamil">
      <div className="bg-[#0b1326] border border-gray-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden mt-6 sm:mt-12">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center gap-3 bg-[#0d162c]">
          <Search size={22} className="text-red-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="செய்திகள், தலைப்புகள், நிகழ்வுகளைத் தேடுக..."
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm sm:text-base font-medium focus:outline-none"
          />
          {queryText && (
            <button
              onClick={() => setQueryText('')}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-bold transition"
          >
            மூடுக (ESC)
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="px-4 sm:px-5 py-3 bg-[#080d1a] border-b border-gray-800 flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Tag size={13} />
            <span>பிரிவு:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-gray-200 focus:outline-none"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400">
            <MapPin size={13} />
            <span>மாவட்டம்:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-gray-200 focus:outline-none"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Recent Searches */}
          {!queryText && results.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                  <History size={14} /> சமீபத்திய தேடல்கள்
                </span>
                {recentSearches.length > 0 && (
                  <button
                    onClick={handleClearRecent}
                    className="hover:text-red-400 transition"
                  >
                    அனைத்தையும் நீக்கு
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectRecent(term)}
                    className="px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-red-600/30 text-gray-300 hover:text-red-300 border border-gray-700/60 text-xs transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              செய்திகள் தேடப்படுகின்றன...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 pb-1">
                கண்டறியப்பட்ட செய்திகள் ({results.length}):
              </div>
              <div className="divide-y divide-gray-800/60">
                {results.map(art => (
                  <div
                    key={art.id}
                    onClick={() => handleArticleClick(art)}
                    className="py-3 flex items-start gap-3 hover:bg-white/[0.03] rounded-xl px-2 transition cursor-pointer group"
                  >
                    <img
                      src={art.mainImage || art.image || '/Amaze times.jpg'}
                      alt={art.title}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-900 border border-gray-800 flex-shrink-0"
                      onError={(e) => { e.currentTarget.src = '/Amaze times.jpg'; }}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-amber-300">
                          {art.category || 'செய்தி'}
                        </span>
                        {art.district && art.district !== 'all' && (
                          <span className="text-[10px] text-gray-400">
                            {art.district}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 ml-auto">
                          {art.date || (art.created_at ? new Date(art.created_at).toLocaleDateString('ta-IN') : '')}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-100 group-hover:text-red-400 transition line-clamp-2">
                        {art.title}
                      </h4>
                      {art.summary && (
                        <p className="text-[11px] text-gray-400 line-clamp-1">{art.summary}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : queryText ? (
            <div className="py-12 text-center text-gray-400 space-y-1">
              <p className="text-sm font-semibold">"{queryText}" என்ற சொல்லுக்கு செய்திகள் எதுவும் கிடைக்கவில்லை.</p>
              <p className="text-xs text-gray-500">வேறு முக்கிய வார்த்தைகளைப் பயன்படுத்தி மீண்டும் தேடவும்.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
