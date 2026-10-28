import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback
} from 'react';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Sparkles,
  WifiOff,
  Radio,
  Loader2
} from 'lucide-react';
import {
  normalizeTamilForSpeech,
  normalizeTamilSpeech,
  chunkTamilText
} from '../utils/tamilSpeechNormalizer';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

// 100ms silent WAV audio to prime and unlock iOS Safari media engine synchronously on user touch
const SILENT_AUDIO_DATA_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

/**
 * VoiceReaderPlayer
 * 
 * Primary Engine: Universal HTML5 Audio streaming from backend Google Tamil TTS (/api/tts/prepare & /api/tts/stream/:id)
 * Features:
 * - Eliminates 414 Request-URI Too Large & net::ERR_CONNECTION_RESET by using POST /prepare with short MD5 hash streaming
 * - iOS Safari & mobile Android autoplay gesture priming for instant multi-device playback
 * - Supports HTTP 206 Partial Content for instant scrubbing/seeking
 * - Fallback Engine: Web Speech API with sentence chunking & Chrome 15s keepalive
 * - Full imperative control via forwardRef (togglePlay, play, pause, stop).
 */
const VoiceReaderPlayer = forwardRef(function VoiceReaderPlayer(
  {
    text = '',
    title = '',
    autoPlay = false,
    onPlayStateChange,
    className = ''
  },
  ref
) {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('இணைக்கிறது...');
  const [engine, setEngine] = useState('stream'); // 'stream' | 'webspeech'
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [chunks, setChunks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs
  const audioRef = useRef(null);
  const keepAliveIntervalRef = useRef(null);
  const activeChunkIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const chunksRef = useRef([]);
  const currentStreamUrlRef = useRef('');

  // Pre-normalize text and prepare chunks using normalizeTamilForSpeech
  const normalizedText = React.useMemo(() => {
    return normalizeTamilForSpeech(text || title || '');
  }, [text, title]);


  useEffect(() => {
    const generatedChunks = chunkTamilText(normalizedText, 140);
    setChunks(generatedChunks);
    chunksRef.current = generatedChunks;
  }, [normalizedText]);

  // Preload synthesis voices for mobile browsers (Android Chrome, iOS Safari)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      };
    }
  }, []);

  // Keep state and ref synchronized
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  useEffect(() => {
    activeChunkIndexRef.current = activeChunkIndex;
  }, [activeChunkIndex]);

  // Cleanup Chrome keepalive timer
  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  // Web Speech API Fallback: speak chunk at index
  const speakWebSpeechChunk = useCallback((index) => {
    if (!window.speechSynthesis) {
      setErrorMessage('உங்கள் உலாவியில் குரல் வசதி ஆதரிக்கப்படவில்லை.');
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    const currentChunks = chunksRef.current;
    if (index >= currentChunks.length) {
      // Completed all chunks
      setIsPlaying(false);
      setIsLoading(false);
      setActiveChunkIndex(0);
      stopKeepAlive();
      return;
    }

    window.speechSynthesis.cancel();

    const chunkText = currentChunks[index];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = 'ta-IN';
    utterance.rate = speed;
    utterance.volume = isMuted ? 0 : volume;

    // Detect Tamil voice if installed on device
    const voices = window.speechSynthesis.getVoices() || [];
    const tamilVoice =
      voices.find(v => v.lang === 'ta-IN' || v.lang === 'ta_IN') ||
      voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ta')) ||
      voices.find(v => v.name && v.name.toLowerCase().includes('tamil'));

    if (tamilVoice) {
      utterance.voice = tamilVoice;
    }

    utterance.onstart = () => {
      setActiveChunkIndex(index);
      setIsPlaying(true);
      setIsLoading(false);
    };

    utterance.onend = () => {
      if (isPlayingRef.current) {
        speakWebSpeechChunk(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Web Speech error on chunk', index, e);
      if (isPlayingRef.current && index + 1 < currentChunks.length) {
        speakWebSpeechChunk(index + 1);
      } else {
        setIsPlaying(false);
        setIsLoading(false);
        stopKeepAlive();
      }
    };

    // Chrome 15s timeout prevention: periodically pause and resume
    stopKeepAlive();
    keepAliveIntervalRef.current = setInterval(() => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 9000);

    window.speechSynthesis.speak(utterance);
  }, [speed, volume, isMuted, stopKeepAlive]);

  // Synchronously prime the HTML5 Audio on user tap to unlock iOS Safari & Android mobile autoplay
  const primeAudioOnUserGesture = useCallback(() => {
    const audio = audioRef.current;
    if (audio && (!audio.src || audio.src === '')) {
      audio.src = SILENT_AUDIO_DATA_URI;
      audio.play().catch(() => {});
    }
  }, []);

  // Primary HTML5 Stream Playback using POST /api/tts/prepare & short hash streaming
  const playStreamAudio = useCallback(async () => {
    if (!normalizedText) return;
    setIsLoading(true);
    setLoadingText('ஆடியோ தயாராகிறது...');
    setErrorMessage('');

    // If device is offline, jump directly to Web Speech fallback
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.info('[VoiceReader] Device offline, using Web Speech fallback');
      setEngine('webspeech');
      speakWebSpeechChunk(activeChunkIndexRef.current);
      return;
    }

    try {
      const audio = audioRef.current;
      if (!audio) return;

      // 1. Request audio preparation via POST (avoids 414 Request-URI Too Large & ERR_CONNECTION_RESET)
      const prepRes = await fetch(`${API_BASE}/tts/prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: normalizedText,
          speed: speed
        })
      });

      if (!prepRes.ok) {
        throw new Error(`TTS server responded with status ${prepRes.status}`);
      }

      const prepData = await prepRes.json();
      if (!prepData.success || !prepData.streamUrl) {
        throw new Error(prepData.message || 'Failed to prepare audio stream');
      }

      // Format clean absolute or relative stream URL
      const streamPath = prepData.streamUrl;
      const cleanStreamUrl = streamPath.startsWith('http')
        ? streamPath
        : `${API_BASE.replace(/\/api$/, '')}${streamPath}`;

      currentStreamUrlRef.current = cleanStreamUrl;

      // Only assign src and load if changed
      if (audio.src !== cleanStreamUrl) {
        audio.src = cleanStreamUrl;
        audio.load();
      }

      audio.playbackRate = speed;
      audio.volume = isMuted ? 0 : volume;

      setLoadingText('ஒலிபரப்பப்படுகிறது...');
      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
      setEngine('stream');
    } catch (err) {
      console.warn('[VoiceReader] Stream playback failed, attempting synthesize blob fallback:', err);
      
      // Fallback 1: Try direct POST synthesize blob
      try {
        const audio = audioRef.current;
        const synthRes = await fetch(`${API_BASE}/tts/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: normalizedText, speed: speed })
        });

        if (synthRes.ok) {
          const blob = await synthRes.blob();
          if (blob && blob.size > 0 && audio) {
            const blobUrl = URL.createObjectURL(blob);
            audio.src = blobUrl;
            audio.playbackRate = speed;
            audio.volume = isMuted ? 0 : volume;
            await audio.play();
            setIsPlaying(true);
            setIsLoading(false);
            setEngine('stream');
            return;
          }
        }
      } catch (blobErr) {
        console.warn('[VoiceReader] Synthesize blob fallback failed:', blobErr);
      }

      // Fallback 2: Device Web Speech API
      console.warn('[VoiceReader] Switching to device Web Speech engine');
      setEngine('webspeech');
      setIsLoading(false);
      speakWebSpeechChunk(activeChunkIndexRef.current);
    }
  }, [normalizedText, speed, volume, isMuted, speakWebSpeechChunk]);

  // Master Play handler
  const handlePlay = useCallback(() => {
    // Synchronously prime audio element on user tap to unlock mobile autoplay
    primeAudioOnUserGesture();

    if (engine === 'stream') {
      const audio = audioRef.current;
      if (
        audio &&
        audio.src &&
        !audio.src.startsWith('data:') &&
        !audio.ended &&
        audio.currentTime > 0
      ) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {
          playStreamAudio();
        });
      } else {
        playStreamAudio();
      }
    } else {
      speakWebSpeechChunk(activeChunkIndexRef.current);
    }
  }, [engine, primeAudioOnUserGesture, playStreamAudio, speakWebSpeechChunk]);

  // Pause handler
  const handlePause = useCallback(() => {
    if (engine === 'stream' && audioRef.current) {
      audioRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopKeepAlive();
    setIsPlaying(false);
    setIsLoading(false);
  }, [engine, stopKeepAlive]);

  // Stop handler (resets position to start)
  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopKeepAlive();
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setActiveChunkIndex(0);
    activeChunkIndexRef.current = 0;
  }, [stopKeepAlive]);

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePause, handlePlay]);

  // Seek HTML5 stream
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Jump forwards or backwards
  const handleSkip = (seconds) => {
    if (engine === 'stream' && audioRef.current) {
      const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration || 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else if (engine === 'webspeech') {
      const step = seconds > 0 ? 1 : -1;
      const nextIndex = Math.min(Math.max(activeChunkIndex + step, 0), chunks.length - 1);
      setActiveChunkIndex(nextIndex);
      if (isPlaying) {
        speakWebSpeechChunk(nextIndex);
      }
    }
  };

  // Speed change: update playbackRate in real time without reloading audio
  const handleChangeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
    if (engine === 'webspeech' && isPlaying) {
      speakWebSpeechChunk(activeChunkIndex);
    }
  };

  // Mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  // Expose methods via ref for parent modal top-bar button
  useImperativeHandle(ref, () => ({
    togglePlay: handleTogglePlay,
    play: handlePlay,
    pause: handlePause,
    stop: handleStop,
    isPlaying,
    engine
  }), [handleTogglePlay, handlePlay, handlePause, handleStop, isPlaying, engine]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentTime(0);
      setActiveChunkIndex(0);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Estimate which chunk is active based on time
      if (audio.duration && chunks.length > 0) {
        const fraction = audio.currentTime / audio.duration;
        const estimatedIdx = Math.min(
          Math.floor(fraction * chunks.length),
          chunks.length - 1
        );
        setActiveChunkIndex(estimatedIdx);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onError = () => {
      // Ignore errors on the silent priming data-uri
      if (audio.src && audio.src.startsWith('data:')) return;

      console.warn('[VoiceReader] Audio stream error event, switching to Web Speech');
      if (engine === 'stream') {
        setEngine('webspeech');
        setIsLoading(false);
        if (isPlayingRef.current) {
          speakWebSpeechChunk(activeChunkIndexRef.current);
        }
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };
  }, [chunks.length, engine, speakWebSpeechChunk]);

  // Cleanup on unmount or article change
  useEffect(() => {
    if (autoPlay) {
      handlePlay();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopKeepAlive();
    };
  }, [autoPlay, handlePlay, stopKeepAlive]);

  // Reset audio source if article text changes
  useEffect(() => {
    if (audioRef.current && currentStreamUrlRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      currentStreamUrlRef.current = '';
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveChunkIndex(0);
    }
  }, [normalizedText]);

  // Format mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentDisplayChunk = chunks[activeChunkIndex] || (normalizedText ? normalizedText.slice(0, 100) : '');

  return (
    <div className={`w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-indigo-500/30 transition-all ${className}`}>
      {/* Universal Cross-Device HTML5 Audio Element with Inline Mobile Playback */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        webkit-playsinline="true"
        crossOrigin="anonymous"
      />

      {/* Top Bar: Engine info & Equalizer */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-title font-extrabold text-amber-300 text-xs sm:text-sm">
                AI தமிழ் செய்தி வாசிப்பாளர்
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                engine === 'stream'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {engine === 'stream' ? (
                  <>
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>HD ஸ்டுடியோ குரல்</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>ஆஃப்லைன் குரல்</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">தூய தமிழ் உச்சரிப்பு • எண் & சுருக்கங்கள் தானியங்கி சீரமைப்பு</p>
          </div>
        </div>

        {/* Dynamic Sound Wave Animation */}
        <div className="flex items-end gap-1 h-5 px-2">
          {[40, 75, 100, 60, 90, 45].map((height, i) => (
            <span
              key={i}
              className={`w-1 bg-amber-400 rounded-full transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : 'opacity-40'
              }`}
              style={{
                height: isPlaying ? `${height}%` : '20%',
                animationDelay: `${i * 120}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Spoken Text Snippet Highlight */}
      {currentDisplayChunk && (
        <div className="my-3 p-3 bg-slate-950/60 rounded-xl border border-indigo-500/20 text-xs text-slate-200 leading-relaxed font-body">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
            தற்போது வாசிக்கப்படும் பகுதி {chunks.length > 0 && `(${activeChunkIndex + 1}/${chunks.length})`}:
          </span>
          <p className="line-clamp-2 italic text-slate-100">
            "{currentDisplayChunk}"
          </p>
        </div>
      )}

      {/* Progress Bar (Stream or Chunks) */}
      <div className="space-y-1.5 my-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 min-w-[36px]">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={engine !== 'stream' || !duration}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-50"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 min-w-[36px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Playback action buttons */}
        <div className="flex items-center gap-2">
          {/* Rewind 10s */}
          <button
            onClick={() => handleSkip(-10)}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
            title="10 வினாடிகள் பின்னோக்கி"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Master Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            disabled={isLoading}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            title={isPlaying ? 'இடைநிறுத்து' : 'செய்தியைக் கேட்க'}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-slate-950 text-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950 text-slate-950 ml-0.5" />
            )}
            <span>{isLoading ? loadingText : isPlaying ? 'நிறுத்துக' : 'கேட்க'}</span>
          </button>

          {/* Forward 10s */}
          <button
            onClick={() => handleSkip(10)}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
            title="10 வினாடிகள் முன்னோக்கி"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer"
            title="முழுமையாக நிறுத்துக"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-indigo-900/40">
          <span className="text-[10px] text-slate-400 font-bold px-1.5">வேகம்:</span>
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleChangeSpeed(rate)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                speed === rate
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Mute / Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
            title={isMuted ? 'ஒலி இயக்கு' : 'ஒலி அடக்கு'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Error / Fallback message if any */}
      {errorMessage && (
        <div className="mt-2 text-[11px] text-rose-400 bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-900/50">
          {errorMessage}
        </div>
      )}
    </div>
  );
});

export default VoiceReaderPlayer;
