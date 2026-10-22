import { Buffer } from 'node:buffer';
import { chunkTamilText, normalizeTamilSpeech } from '../src/utils/tamilSpeechNormalizer.js';

/**
 * LRU Cache for TTS audio buffers
 */
class TtsLRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    // Refresh position to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest entry (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const audioCache = new TtsLRUCache(100);

/**
 * Fetch a single audio chunk from Google Tamil TTS
 * @param {string} chunk - Text chunk (max ~150 chars)
 * @param {number|string} speed - Optional speed factor
 * @returns {Promise<Buffer>}
 */
async function fetchGoogleTamilChunk(chunk, speed = 1) {
  const numericSpeed = parseFloat(speed) || 1;
  const ttsSpeedParam = numericSpeed < 0.85 ? '0.24' : '1';
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encodeURIComponent(chunk)}&ttsspeed=${ttsSpeedParam}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Referer': 'https://translate.google.com/'
    }
  });

  if (!response.ok) {
    throw new Error(`Google TTS request failed with status ${response.status}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate concatenated Tamil TTS MP3 audio stream for any news article text
 * @param {string} text - Raw or normalized news article text
 * @param {number|string} speed - Playback speed (default 1)
 * @returns {Promise<Buffer>}
 */
export async function getTamilTtsAudio(text, speed = 1) {
  if (!text || typeof text !== 'string') {
    return Buffer.alloc(0);
  }

  const cleanText = text.trim();
  if (!cleanText) {
    return Buffer.alloc(0);
  }

  const speedVal = parseFloat(speed) || 1;
  const cacheKey = `${speedVal.toFixed(2)}_${cleanText}`;

  // Check LRU cache first
  const cached = audioCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Preprocess and chunk Tamil text into max ~150 char clauses
  const chunks = chunkTamilText(cleanText, 150);
  if (!chunks || chunks.length === 0) {
    return Buffer.alloc(0);
  }

  const buffers = [];
  for (const chunk of chunks) {
    try {
      const chunkBuf = await fetchGoogleTamilChunk(chunk, speedVal);
      if (chunkBuf && chunkBuf.length > 0) {
        buffers.push(chunkBuf);
      }
    } catch (err) {
      console.warn(`[TTS] Error fetching chunk "${chunk.slice(0, 30)}...":`, err.message);
      // Retry once after brief pause
      try {
        await new Promise(r => setTimeout(r, 200));
        const retryBuf = await fetchGoogleTamilChunk(chunk, speedVal);
        if (retryBuf && retryBuf.length > 0) {
          buffers.push(retryBuf);
        }
      } catch (retryErr) {
        console.error(`[TTS] Retry failed for chunk "${chunk.slice(0, 30)}...":`, retryErr.message);
      }
    }
  }

  if (buffers.length === 0) {
    throw new Error('குரல் செய்தி ஆடியோவை உருவாக்க முடியவில்லை (Failed to generate speech audio)');
  }

  // Concatenate MP3 frames into single unified stream
  const concatenatedMp3 = Buffer.concat(buffers);

  // Store in LRU cache
  audioCache.set(cacheKey, concatenatedMp3);

  return concatenatedMp3;
}

export { audioCache, normalizeTamilSpeech, chunkTamilText };
export default {
  getTamilTtsAudio,
  audioCache,
  normalizeTamilSpeech,
  chunkTamilText
};
