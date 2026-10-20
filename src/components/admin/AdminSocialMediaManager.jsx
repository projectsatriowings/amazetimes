import React, { useState, useEffect } from 'react';
import { api, extractYouTubeId } from '../../services/api';
import {
  Share2,
  Youtube,
  Instagram,
  Facebook,
  PhoneCall,
  Video,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  ExternalLink,
  Play
} from 'lucide-react';

export const AdminSocialMediaManager = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [channels, setChannels] = useState({
    youtubeUrl: 'https://www.youtube.com/@AmazeTimes',
    youtubeHandle: '@AmazeTimes',
    youtubeSubscribers: '250K',
    instagramUrl: 'https://www.instagram.com/amazetimes',
    instagramHandle: '@amazetimes_official',
    instagramFollowers: '180K',
    facebookUrl: 'https://www.facebook.com/amazetimes',
    facebookHandle: 'Amaze Times Official',
    whatsappUrl: 'https://whatsapp.com/channel/amazetimes'
  });

  const [videos, setVideos] = useState([]);
  const [reels, setReels] = useState([]);

  // Video Add Form State
  const [newVideo, setNewVideo] = useState({ title: '', url: '', category: 'செய்திகள்' });
  const [newReel, setNewReel] = useState({ headline: '', url: '', coverImage: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSocialMediaSettings();
      if (res && res.success && res.data) {
        const d = res.data;
        setChannels({
          youtubeUrl: d.youtubeUrl || '',
          youtubeHandle: d.youtubeHandle || '',
          youtubeSubscribers: d.youtubeSubscribers || '',
          instagramUrl: d.instagramUrl || '',
          instagramHandle: d.instagramHandle || '',
          instagramFollowers: d.instagramFollowers || '',
          facebookUrl: d.facebookUrl || '',
          facebookHandle: d.facebookHandle || '',
          whatsappUrl: d.whatsappUrl || ''
        });
        setVideos(Array.isArray(d.featuredVideos) ? d.featuredVideos : []);
        setReels(Array.isArray(d.featuredReels) ? d.featuredReels : []);
      }
    } catch (err) {
      console.error('Error loading social media settings:', err);
      if (showToast) showToast('சமூக ஊடக அமைப்புகளை ஏற்றுவதில் பிழை');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        ...channels,
        featuredVideos: videos,
        featuredReels: reels
      };
      const res = await api.updateSocialMediaSettings(payload);
      if (res && res.success) {
        if (showToast) showToast('✅ சமூக ஊடக அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!');
      } else {
        throw new Error(res?.message || 'Failed');
      }
    } catch (err) {
      console.error('Save social media error:', err);
      if (showToast) showToast('❌ சேமிப்பதில் பிழை: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVideo = () => {
    if (!newVideo.url.trim()) {
      if (showToast) showToast('YouTube வீடியோ URL-ஐ உள்ளிடவும்');
      return;
    }

    const videoId = extractYouTubeId(newVideo.url);
    if (!videoId) {
      if (showToast) showToast('சரியான YouTube URL-ஐ உள்ளிடவும்');
      return;
    }

    const item = {
      id: Date.now(),
      title: newVideo.title.trim() || 'சிறப்பு வீடியோ',
      url: newVideo.url.trim(),
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      category: newVideo.category
    };

    setVideos([item, ...videos]);
    setNewVideo({ title: '', url: '', category: 'செய்திகள்' });
    if (showToast) showToast('வீடியோ பட்டியலில் சேர்க்கப்பட்டது');
  };

  const handleRemoveVideo = (index) => {
    setVideos(videos.filter((_, idx) => idx !== index));
  };

  const handleAddReel = () => {
    if (!newReel.headline.trim() || !newReel.url.trim()) {
      if (showToast) showToast('தலைப்பு மற்றும் ரீல் URL அவசியம்');
      return;
    }

    const item = {
      id: Date.now(),
      headline: newReel.headline.trim(),
      url: newReel.url.trim(),
      coverImage: newReel.coverImage.trim() || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=400&q=80'
    };

    setReels([item, ...reels]);
    setNewReel({ headline: '', url: '', coverImage: '' });
    if (showToast) showToast('ரீல் சேர்க்கப்பட்டது');
  };

  const handleRemoveReel = (index) => {
    setReels(reels.filter((_, idx) => idx !== index));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-tamil">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
              <Share2 className="w-6 h-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">சமூக ஊடக & வீடியோ மையம் (Social & Video Manager)</h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            யூடியூப், இன்ஸ்டாகிராம் சேனல்கள், சந்தாதாரர் எண்ணிக்கை மற்றும் சிறப்பு வீடியோக்களை நிர்வகிக்கவும்.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{saving ? 'சேமிக்கப்படுகிறது...' : 'அமைப்புகளைச் சேமி'}</span>
        </button>
      </div>

      {/* 1. Official Social Channels Configuration */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-6">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          <span>அதிகாரப்பூர்வ சமூக ஊடக இணைப்புகள் & சந்தாதாரர்கள்</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* YouTube */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <Youtube className="w-5 h-5" />
              <span>YouTube சேனல்</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">சேனல் URL</label>
              <input
                type="text"
                value={channels.youtubeUrl}
                onChange={(e) => setChannels({ ...channels, youtubeUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Handle</label>
                <input
                  type="text"
                  value={channels.youtubeHandle}
                  onChange={(e) => setChannels({ ...channels, youtubeHandle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">சந்தாதாரர்கள்</label>
                <input
                  type="text"
                  value={channels.youtubeSubscribers}
                  onChange={(e) => setChannels({ ...channels, youtubeSubscribers: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-pink-500 font-bold text-sm">
              <Instagram className="w-5 h-5" />
              <span>Instagram பக்கம்</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">இன்ஸ்டாகிராம் URL</label>
              <input
                type="text"
                value={channels.instagramUrl}
                onChange={(e) => setChannels({ ...channels, instagramUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Handle</label>
                <input
                  type="text"
                  value={channels.instagramHandle}
                  onChange={(e) => setChannels({ ...channels, instagramHandle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">பின்பற்றுபவர்கள்</label>
                <input
                  type="text"
                  value={channels.instagramFollowers}
                  onChange={(e) => setChannels({ ...channels, instagramFollowers: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp & Facebook */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <PhoneCall className="w-5 h-5" />
              <span>WhatsApp & Facebook</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">WhatsApp Channel URL</label>
              <input
                type="text"
                value={channels.whatsappUrl}
                onChange={(e) => setChannels({ ...channels, whatsappUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Facebook Page URL</label>
              <input
                type="text"
                value={channels.facebookUrl}
                onChange={(e) => setChannels({ ...channels, facebookUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Featured YouTube Videos with Automatic 11-char ID Extraction */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">சிறப்பு யூடியூப் வீடியோக்கள் (YouTube Video Gallery)</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">{videos.length} வீடியோக்கள் உள்ளன</span>
        </div>

        {/* Video Add Bar */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="text-xs text-slate-400 block mb-1">வீடியோ தலைப்பு</label>
            <input
              type="text"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              placeholder="எ.கா: பட்ஜெட் 2026 முக்கிய அம்சங்கள் நேரலை விவாதம்"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="md:col-span-5">
            <label className="text-xs text-slate-400 block mb-1">YouTube Video Link (Short / Embed / Watch URL)</label>
            <input
              type="text"
              value={newVideo.url}
              onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
              placeholder="https://youtu.be/... அல்லது https://www.youtube.com/watch?v=..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleAddVideo}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>சேர்</span>
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((vid, idx) => {
            const videoId = vid.videoId || extractYouTubeId(vid.url);
            const thumb = vid.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/Amaze times.jpg');

            return (
              <div key={idx} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
                <div className="relative aspect-video bg-black overflow-hidden group">
                  <img src={thumb} alt={vid.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </span>
                  </div>
                  {videoId && (
                    <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded font-mono">
                      ID: {videoId}
                    </span>
                  )}
                </div>

                <div className="p-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white line-clamp-1">{vid.title}</p>
                  <button
                    onClick={() => handleRemoveVideo(idx)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                    title="நீக்கு"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminSocialMediaManager;
