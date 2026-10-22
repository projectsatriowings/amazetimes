import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Zap,
  Radio,
  Plus,
  Trash2,
  Clock,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminTickerLiveWireManager = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('ticker'); // 'ticker' | 'livewire'
  const [tickers, setTickers] = useState([]);
  const [liveWireItems, setLiveWireItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ticker form
  const [newTickerText, setNewTickerText] = useState('');
  const [isAddingTicker, setIsAddingTicker] = useState(false);

  // LiveWire form
  const [newLiveWireTitle, setNewLiveWireTitle] = useState('');
  const [newLiveWireHighlight, setNewLiveWireHighlight] = useState(false);
  const [isAddingLiveWire, setIsAddingLiveWire] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tickerRes, lwRes] = await Promise.all([
        api.getTickers().catch(() => ({ tickers: [] })),
        api.getLiveWire().catch(() => ({ liveWire: [] }))
      ]);

      if (tickerRes && Array.isArray(tickerRes.tickers)) {
        setTickers(tickerRes.tickers);
      }
      if (lwRes && Array.isArray(lwRes.liveWire)) {
        setLiveWireItems(lwRes.liveWire);
      }
    } catch (err) {
      console.warn('Error fetching ticker/livewire:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicker = async (e) => {
    e.preventDefault();
    if (!newTickerText.trim()) return;
    setIsAddingTicker(true);
    try {
      const res = await api.createTicker({ content: newTickerText.trim() });
      if (res && res.success) {
        setNewTickerText('');
        if (showToast) showToast('பிரேக்கிங் செய்தி ஓடையில் சேர்க்கப்பட்டது!');
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
        fetchData();
      } else {
        throw new Error(res?.message || 'Failed');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'சேர்ப்பதில் பிழை');
    } finally {
      setIsAddingTicker(false);
    }
  };

  const handleDeleteTicker = async (id) => {
    if (!window.confirm('இந்த பிரேக்கிங் செய்தியை நீக்க விரும்புகிறீர்களா?')) return;
    try {
      await api.deleteTicker(id);
      if (showToast) showToast('பிரேக்கிங் செய்தி நீக்கப்பட்டது');
      window.dispatchEvent(new CustomEvent('amaze:content_updated'));
      fetchData();
    } catch (err) {
      if (showToast) showToast('நீக்குவதில் பிழை');
    }
  };

  const handleAddLiveWire = async (e) => {
    e.preventDefault();
    if (!newLiveWireTitle.trim()) return;
    setIsAddingLiveWire(true);
    try {
      const res = await api.createLiveWire({
        title: newLiveWireTitle.trim(),
        is_highlight: newLiveWireHighlight
      });
      if (res && res.success) {
        setNewLiveWireTitle('');
        setNewLiveWireHighlight(false);
        if (showToast) showToast('நேரலை செய்தி சேர்க்கப்பட்டது!');
        window.dispatchEvent(new CustomEvent('amaze:content_updated'));
        fetchData();
      } else {
        throw new Error(res?.message || 'Failed');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'சேர்ப்பதில் பிழை');
    } finally {
      setIsAddingLiveWire(false);
    }
  };

  const handleDeleteLiveWire = async (id) => {
    if (!window.confirm('இந்த நேரலை செய்தியை நீக்க விரும்புகிறீர்களா?')) return;
    try {
      await api.deleteLiveWire(id);
      if (showToast) showToast('நேரலை செய்தி நீக்கப்பட்டது');
      window.dispatchEvent(new CustomEvent('amaze:content_updated'));
      fetchData();
    } catch (err) {
      if (showToast) showToast('நீக்குவதில் பிழை');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl w-full font-tamil">
      {/* Header Banner */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                பிரேக்கிங் டிக்கர் & நேரலைச் செய்தி மேலாண்மை
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Real-Time Ticker & LiveWire Timeline Feed Manager (Neon PostgreSQL Live Connected)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>புதுப்பி (Refresh)</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ticker')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            activeTab === 'ticker'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>பிரேக்கிங் செய்தி ஓடை (Breaking Ticker) ({tickers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('livewire')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            activeTab === 'livewire'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>நேரலை டைம்லைன் (LiveWire Feed) ({liveWireItems.length})</span>
        </button>
      </div>

      {/* VIEW 1: TICKER MANAGEMENT */}
      {activeTab === 'ticker' && (
        <div className="space-y-6">
          {/* Add Ticker Card */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>புதிய பிரேக்கிங் செய்தி சேர்க்கவும் (தளத்தின் உச்சியில் சிவப்புக் கோட்டில் ஓடும் உரை)</span>
            </h3>

            <form onSubmit={handleAddTicker} className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="text"
                required
                value={newTickerText}
                onChange={(e) => setNewTickerText(e.target.value)}
                placeholder="எ.கா: சென்னை மெரினாவில் சர்வதேச பட்டத் திருவிழா கோலாகலமாக துவக்கம்..."
                className="flex-1 bg-[#050915] border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAddingTicker}
                className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-rose-600/30 cursor-pointer transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingTicker ? 'சேர்க்கப்படுகிறது...' : 'ஓடையில் சேர் (Add Ticker)'}</span>
              </button>
            </form>
          </div>

          {/* Current Ticker List */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                தற்போது நேரலைத் தளத்தில் ஓடும் பிரேக்கிங் செய்திகள்: {tickers.length}
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {tickers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  தற்போது பிரேக்கிங் செய்திகள் எதுவும் இல்லை. புதிய செய்தியை மேலே சேர்க்கவும்.
                </div>
              ) : (
                tickers.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                      <span className="text-white font-bold text-xs sm:text-sm leading-relaxed">
                        {t.content}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTicker(t.id)}
                      className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition cursor-pointer shrink-0"
                      title="நீக்கு"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVEWIRE MANAGEMENT */}
      {activeTab === 'livewire' && (
        <div className="space-y-6">
          {/* Add LiveWire Card */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span>புதிய நேரலைச் செய்தி பதிவு (LiveWire Timeline Entry)</span>
            </h3>

            <form onSubmit={handleAddLiveWire} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <input
                  type="text"
                  required
                  value={newLiveWireTitle}
                  onChange={(e) => setNewLiveWireTitle(e.target.value)}
                  placeholder="எ.கா: தமிழ்நாடு சட்டப்பேரவை கூட்டத்தொடர் நாளை கூடுகிறது - சபாநாயகர் அறிவிப்பு..."
                  className="flex-1 bg-[#050915] border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingLiveWire}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/30 cursor-pointer transition flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingLiveWire ? 'பதிவிடப்படுகிறது...' : 'நேரலையில் இடுக (Post Live)'}</span>
                </button>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newLiveWireHighlight}
                  onChange={(e) => setNewLiveWireHighlight(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span>முக்கிய முன்னிலைப்படுத்தப்பட்ட செய்தி (Highlight Badge)</span>
              </label>
            </form>
          </div>

          {/* Current LiveWire List */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                தற்போது நேரலை டைம்லைனில் உள்ள பதிவுகள்: {liveWireItems.length}
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {liveWireItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  தற்போது நேரலைப் பதிவுகள் எதுவும் இல்லை. மேலே உள்ள படிவத்தில் சேர்க்கவும்.
                </div>
              ) : (
                liveWireItems.map((lw) => (
                  <div
                    key={lw.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                        lw.is_highlight
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {lw.time_badge || 'நேரலை'}
                      </span>
                      <span className="text-white font-bold text-xs sm:text-sm leading-relaxed">
                        {lw.title}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteLiveWire(lw.id)}
                      className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition cursor-pointer shrink-0"
                      title="நீக்கு"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickerLiveWireManager;
