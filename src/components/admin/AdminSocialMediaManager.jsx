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
  Play,
  Layers,
  Sparkles,
  MessageCircle,
  Clock,
  Eye,
  CheckCircle2
} from 'lucide-react';

const WhatsappIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const AdminSocialMediaManager = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'videos' | 'reels'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Form State
  const [channels, setChannels] = useState({
    youtubeUrl: 'https://www.youtube.com/channel/UCMd-mF-u0dPO4L9Nlfftp-g',
    youtubeHandle: '@AmazeTimes',
    youtubeSubscribers: '250K',
    instagramUrl: 'https://www.instagram.com/amazetimes/?hl=en',
    instagramHandle: '@amazetimes_official',
    instagramFollowers: '180K',
    facebookUrl: 'https://www.facebook.com/amazetimes',
    facebookHandle: 'amazetimesnews',
    whatsappUrl: 'https://whatsapp.com/channel/amazetimes'
  });

  const [videos, setVideos] = useState([]);
  const [reels, setReels] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Video Add Form State
  const [newVideo, setNewVideo] = useState({ title: '', url: '', category: 'செய்திகள்' });
  const [newReel, setNewReel] = useState({ platform: 'instagram', headline: '', url: '', duration: '00:58', coverImage: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', desc: '', time: 'இப்போது', badge: 'பிரேக்கிங்' });

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
        setAnnouncements(Array.isArray(d.whatsappAnnouncements) ? d.whatsappAnnouncements : []);
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
        featuredReels: reels,
        whatsappAnnouncements: announcements
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

  // YouTube Channel Auto-Sync via Backend RSS Endpoint
  const handleSyncYouTube = async () => {
    setSyncing(true);
    try {
      const res = await api.syncYouTubeVideos();
      if (res && res.success && Array.isArray(res.videos)) {
        setVideos(res.videos);
        if (showToast) showToast(`✅ ${res.videos.length} யூடியூப் வீடியோக்கள் வெற்றிகரமாக சின்க் செய்யப்பட்டன!`);
      } else {
        throw new Error(res?.message || 'Sync failed');
      }
    } catch (err) {
      console.error('YouTube sync error:', err);
      if (showToast) showToast('⚠️ யூடியூப் சின்க் செய்வதில் பிழை: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddVideo = () => {
    if (!newVideo.url.trim()) {
      if (showToast) showToast('YouTube வீடியோ URL அல்லது ID உள்ளிடவும்');
      return;
    }

    const videoId = extractYouTubeId(newVideo.url) || newVideo.url.trim();
    if (!videoId) {
      if (showToast) showToast('சரியான YouTube URL அல்ல');
      return;
    }

    const item = {
      id: videoId,
      videoId,
      title: newVideo.title.trim() || 'அமேஸ் டைம்ஸ் சிறப்பு வீடியோ',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      timeAgo: 'சமீபத்தியது',
      category: newVideo.category
    };

    setVideos([item, ...videos]);
    setNewVideo({ title: '', url: '', category: 'செய்திகள்' });
    if (showToast) showToast('வீடியோ பட்டியலில் சேர்க்கப்பட்டது');
  };

  const handleRemoveVideo = (index) => {
    setVideos(videos.filter((_, idx) => idx !== index));
    if (showToast) showToast('வீடியோ நீக்கப்பட்டது');
  };

  const handleAddReel = () => {
    if (!newReel.headline.trim() || !newReel.url.trim()) {
      if (showToast) showToast('தலைப்பு மற்றும் வீடியோ/ரீல் URL தேவை');
      return;
    }

    const isFb = newReel.platform === 'facebook';
    const item = {
      id: `social-vid-${Date.now()}`,
      platform: newReel.platform || 'instagram',
      type: isFb ? 'video' : 'reel',
      author: isFb ? 'Amaze Times Official' : 'Amaze Times',
      handle: isFb ? 'amazetimesnews' : '@amazetimes_official',
      title: newReel.headline.trim(),
      caption: newReel.headline.trim(),
      time: 'சமீபத்தியது',
      duration: newReel.duration.trim() || (isFb ? '03:00' : '00:58'),
      image: newReel.coverImage.trim() || (isFb ? 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800' : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800'),
      views: '50K+',
      likes: '4.5K',
      url: newReel.url.trim(),
      videoUrl: newReel.url.trim()
    };

    setReels([item, ...reels]);
    setNewReel({ platform: 'instagram', headline: '', url: '', duration: '00:58', coverImage: '' });
    if (showToast) showToast('ரீல்ஸ் / வீடியோ சேர்க்கப்பட்டது');
  };

  const handleRemoveReel = (index) => {
    setReels(reels.filter((_, idx) => idx !== index));
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title.trim()) {
      if (showToast) showToast('வாட்ஸ்அப் செய்தி தலைப்பு அவசியம்');
      return;
    }

    const item = {
      id: 'wa-' + Date.now(),
      title: newAnnouncement.title.trim(),
      desc: newAnnouncement.desc.trim() || 'அமேஸ் டைம்ஸ் அதிகாரப்பூர்வ எச்சரிக்கை.',
      badge: newAnnouncement.badge.trim() || 'பிரேக்கிங்',
      time: newAnnouncement.time.trim() || 'இப்போது'
    };

    setAnnouncements([item, ...announcements]);
    setNewAnnouncement({ title: '', desc: '', time: 'இப்போது', badge: 'பிரேக்கிங்' });
    if (showToast) showToast('வாட்ஸ்அப் ஒளிபரப்பு சேர்க்கப்பட்டது');
  };

  const handleRemoveAnnouncement = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-tamil">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#091538] via-[#0d225c] to-[#091538] text-white p-6 rounded-3xl border border-red-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
              <Share2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">சமூக ஊடக மேலாண்மை மையம் (Social Media Manager)</h2>
          </div>
          <p className="text-xs text-slate-300">
            அதிகாரப்பூர்வ YouTube RSS வீடியோ சின்க், Instagram, Facebook மற்றும் WhatsApp அறிவிப்புகளை நிர்வகிக்கவும்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncYouTube}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            title="யூடியூப் சேனல் வீடியோக்களை ஆட்டோ-சின்க் செய்க"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'சின்க் ஆகிறது...' : '🔄 யூடியூப் சின்க்'}</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'சேமிக்கப்படுகிறது...' : 'சேமி'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#0f172a] p-1.5 rounded-2xl border border-slate-800 self-start">
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'channels'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>சேனல்கள் (Official Channels)</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Youtube className="w-3.5 h-3.5" />
          <span>வீடியோக்கள் ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'reels'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ரீல்ஸ் & வாட்ஸ்அப் அறிவிப்புகள்</span>
        </button>
      </div>

      {/* 1. CHANNELS TAB */}
      {activeTab === 'channels' && (
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>அதிகாரப்பூர்வ பக்கங்களின் விபரங்கள் (Channel Profiles)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* YouTube Channel Config */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                <Youtube className="w-5 h-5" />
                <span>YouTube சேனல் விபரம்</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">சேனல் URL அல்லது Channel ID:</label>
                <input
                  type="text"
                  value={channels.youtubeUrl}
                  onChange={(e) => setChannels({ ...channels, youtubeUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">Handle (@AmazeTimes):</label>
                  <input
                    type="text"
                    value={channels.youtubeHandle}
                    onChange={(e) => setChannels({ ...channels, youtubeHandle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">சந்தாதாரர் எண்ணிக்கை:</label>
                  <input
                    type="text"
                    value={channels.youtubeSubscribers}
                    onChange={(e) => setChannels({ ...channels, youtubeSubscribers: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Instagram Profile Config */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-pink-500 font-bold text-sm">
                <Instagram className="w-5 h-5" />
                <span>Instagram பக்கம்</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">இன்ஸ்டாகிராம் URL:</label>
                <input
                  type="text"
                  value={channels.instagramUrl}
                  onChange={(e) => setChannels({ ...channels, instagramUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">Handle (@amazetimes_official):</label>
                  <input
                    type="text"
                    value={channels.instagramHandle}
                    onChange={(e) => setChannels({ ...channels, instagramHandle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">ஃபாலோயர்கள்:</label>
                  <input
                    type="text"
                    value={channels.instagramFollowers}
                    onChange={(e) => setChannels({ ...channels, instagramFollowers: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Channel Config */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <WhatsappIcon className="w-5 h-5" />
                <span>WhatsApp Channel</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">WhatsApp Channel URL:</label>
                <input
                  type="text"
                  value={channels.whatsappUrl}
                  onChange={(e) => setChannels({ ...channels, whatsappUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Facebook Page Config */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                <Facebook className="w-5 h-5" />
                <span>Facebook பக்கம்</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">Facebook URL:</label>
                <input
                  type="text"
                  value={channels.facebookUrl}
                  onChange={(e) => setChannels({ ...channels, facebookUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">பக்கம் பெயர் (Handle):</label>
                <input
                  type="text"
                  value={channels.facebookHandle}
                  onChange={(e) => setChannels({ ...channels, facebookHandle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIDEOS TAB */}
      {activeTab === 'videos' && (
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold text-white">YouTube வீடியோக்கள் & RSS மேலாண்மை</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncYouTube}
                disabled={syncing}
                className="px-3.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-500/30 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>சேனல் RSS ஆட்டோ-சின்க்</span>
              </button>
              <span className="text-xs text-slate-400 font-bold bg-slate-800 px-2.5 py-1 rounded-xl">
                {videos.length} வீடியோக்கள்
              </span>
            </div>
          </div>

          {/* Add Manual Video Form */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="text-xs text-slate-400 block mb-1 font-bold">வீடியோ தலைப்பு:</label>
              <input
                type="text"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="எ.கா: பட்ஜெட் 2026 முக்கிய அம்சங்கள் நேரலை விவாதம்"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="md:col-span-5">
              <label className="text-xs text-slate-400 block mb-1 font-bold">YouTube Video URL அல்லது 11-char Video ID:</label>
              <input
                type="text"
                value={newVideo.url}
                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                placeholder="https://youtu.be/... அல்லது https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleAddVideo}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
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
              const thumb = vid.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/amaze-times-logo.webp');

              return (
                <div key={idx} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between group">
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img src={thumb} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </span>
                    </div>
                    {videoId && (
                      <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 text-white px-2 py-0.5 rounded font-mono">
                        {videoId}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2">
                    <p className="text-xs font-bold text-white line-clamp-2 leading-snug">{vid.title}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <span>{vid.timeAgo || 'சமீபத்தியது'}</span>
                      <button
                        onClick={() => handleRemoveVideo(idx)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition"
                        title="நீக்கு"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. REELS & WHATSAPP TAB */}
      {activeTab === 'reels' && (
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-8">
          
          {/* WhatsApp Announcements */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <WhatsappIcon className="w-4 h-4" />
              <span>வாட்ஸ்அப் நேரலை அறிவிப்புகள் (WhatsApp Broadcast Stream)</span>
            </h3>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs">
              <div className="md:col-span-5">
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">செய்தி தலைப்பு:*</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="எ.கா: அமைச்சரவை முக்கிய முடிவு அறிவிப்பு"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="md:col-span-4">
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">விளக்கம்:*</label>
                <input
                  type="text"
                  value={newAnnouncement.desc}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, desc: e.target.value })}
                  placeholder="சுருக்கமான தகவல்..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  onClick={handleAddAnnouncement}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>அறிவிப்பு சேர்</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {announcements.map((a) => (
                <div key={a.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">{a.badge || 'Alert'}</span>
                      <span className="font-bold text-white">{a.title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{a.desc}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAnnouncement(a.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Reels & Videos */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-black text-pink-400 uppercase tracking-wider flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-500" />
              <span>இன்ஸ்டாகிராம் ரீல்ஸ் & பேஸ்புக் வீடியோக்கள் (Instagram Reels & Facebook Videos)</span>
            </h3>

            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs font-bold text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">தளம் (Platform):*</label>
                  <select
                    value={newReel.platform}
                    onChange={(e) => setNewReel({ ...newReel, platform: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="instagram">📸 Instagram (ரீல்ஸ்)</option>
                    <option value="facebook">📘 Facebook (வீடியோ)</option>
                  </select>
                </div>

                <div className="md:col-span-6">
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">வீடியோ / ரீல் தலைப்பு:*</label>
                  <input
                    type="text"
                    value={newReel.headline}
                    onChange={(e) => setNewReel({ ...newReel, headline: e.target.value })}
                    placeholder="எ.கா: மெட்ரோ ரயில் நேரடிக் கள ஆய்வு வீடியோ"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">வீடியோ கால அளவு (Duration):</label>
                  <input
                    type="text"
                    value={newReel.duration}
                    onChange={(e) => setNewReel({ ...newReel, duration: e.target.value })}
                    placeholder="00:58 அல்லது 03:15"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-6">
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">வீடியோ / ரீல் URL:*</label>
                  <input
                    type="text"
                    value={newReel.url}
                    onChange={(e) => setNewReel({ ...newReel, url: e.target.value })}
                    placeholder="https://www.instagram.com/reel/... அல்லது https://www.facebook.com/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">கவர் பட URL (Thumbnail):</label>
                  <input
                    type="text"
                    value={newReel.coverImage}
                    onChange={(e) => setNewReel({ ...newReel, coverImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={handleAddReel}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>வீடியோ சேர்</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of active Reels & Videos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {reels.map((r, idx) => {
                const isFb = r.platform === 'facebook';
                return (
                  <div key={idx} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                        isFb ? 'bg-blue-600' : 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600'
                      }`}>
                        {isFb ? <Facebook className="w-3.5 h-3.5" /> : <Instagram className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white truncate block max-w-[180px]">
                          {r.title || r.headline}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {r.duration || '01:00'} • {isFb ? 'Facebook Video' : 'Instagram Reel'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveReel(idx)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition shrink-0"
                      title="நீக்கு"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminSocialMediaManager;
