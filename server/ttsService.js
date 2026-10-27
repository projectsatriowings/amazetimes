import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import { chunkTamilText, normalizeTamilSpeech } from '../src/utils/tamilSpeechNormalizer.js';

/**
 * High-capacity LRU Cache for TTS audio buffers
 */
class TtsLRUCache {
  constructor(maxSize = 200) {
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

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Level 1: Full article audio buffers (keyed by MD5 hash of speed_cleanText)
export const audioCache = new TtsLRUCache(200);

// Level 2: Individual clause/chunk audio buffers (keyed by speedParam_chunk)
export const chunkCache = new TtsLRUCache(1000);

/**
 * Generate a consistent MD5 hash ID for a given text and playback speed
 * Used to avoid 414 Request-URI Too Large errors on mobile and web proxies
 * @param {string} text - Normalized Tamil text
 * @param {number|string} speed - Playback speed factor
 * @returns {string} 32-character hex hash
 */
export function getAudioHash(text, speed = 1) {
  const speedVal = (parseFloat(speed) || 1).toFixed(2);
  const clean = (text || '').trim();
  return crypto.createHash('md5').update(`${speedVal}_${clean}`).digest('hex');
}

/**
 * Fetch a single audio chunk from Google Tamil TTS with multi-client fallback & retries
 * @param {string} chunk - Text chunk (max ~140 chars)
 * @param {number|string} speed - Playback speed factor
 * @returns {Promise<Buffer>}
 */
async function fetchGoogleTamilChunk(chunk, speed = 1) {
  const numericSpeed = parseFloat(speed) || 1;
  const ttsSpeedParam = numericSpeed < 0.85 ? '0.24' : '1';
  const cacheKey = `${ttsSpeedParam}_${chunk}`;

  // Check chunk-level cache
  const cachedChunk = chunkCache.get(cacheKey);
  if (cachedChunk) {
    return cachedChunk;
  }

  // Google TTS endpoint clients (tw-ob = Chrome translate, gtx = Google Translate extension)
  const clientEndpoints = ['tw-ob', 'gtx'];
  let lastError = null;

  for (const client of clientEndpoints) {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=${client}&q=${encodeURIComponent(chunk)}&ttsspeed=${ttsSpeedParam}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Referer': 'https://translate.google.com/'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buf = Buffer.from(arrayBuffer);
        if (buf.length > 0) {
          chunkCache.set(cacheKey, buf);
          return buf;
        }
      } else {
        lastError = new Error(`Google TTS (${client}) returned status ${response.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Final retry after a brief pause
  await new Promise(r => setTimeout(r, 200));
  try {
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=gtx&q=${encodeURIComponent(chunk)}&ttsspeed=${ttsSpeedParam}`;
    const retryRes = await fetch(fallbackUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': '*/*'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (retryRes.ok) {
      const buf = Buffer.from(await retryRes.arrayBuffer());
      if (buf.length > 0) {
        chunkCache.set(cacheKey, buf);
        return buf;
      }
    }
  } catch (retryErr) {
    lastError = retryErr;
  }

  console.warn(`[TTS] Failed to fetch chunk "${chunk.slice(0, 30)}...":`, lastError?.message);
  return Buffer.alloc(0);
}

/**
 * Generate concatenated Tamil TTS MP3 audio stream for any news article text
 * Uses 3-worker concurrency pool for 3x faster generation and dual-level caching
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
  const hashKey = getAudioHash(cleanText, speedVal);

  // Check LRU cache first (instant 0ms response)
  const cached = audioCache.get(hashKey);
  if (cached) {
    return cached;
  }

  // Preprocess and chunk Tamil text into max ~140 char clauses
  const chunks = chunkTamilText(cleanText, 140);
  if (!chunks || chunks.length === 0) {
    return Buffer.alloc(0);
  }

  // Parallel batch fetching with concurrency pool (3 concurrent workers)
  const results = new Array(chunks.length);
  let chunkIndex = 0;
  const concurrency = Math.min(3, chunks.length);

  const workers = Array.from({ length: concurrency }, async () => {
    while (chunkIndex < chunks.length) {
      const currentIdx = chunkIndex++;
      const chunk = chunks[currentIdx];
      try {
        const buf = await fetchGoogleTamilChunk(chunk, speedVal);
        results[currentIdx] = buf;
      } catch (err) {
        console.warn(`[TTS] Worker error on chunk index ${currentIdx}:`, err.message);
        results[currentIdx] = Buffer.alloc(0);
      }
    }
  });

  await Promise.all(workers);

  // Filter out any empty buffers while preserving exact chronological clause order
  const validBuffers = results.filter(b => b && b.length > 0);

  if (validBuffers.length === 0) {
    throw new Error('குரல் செய்தி ஆடியோவை உருவாக்க முடியவில்லை (Failed to generate speech audio)');
  }

  // Concatenate MP3 frames into single unified stream
  const concatenatedMp3 = Buffer.concat(validBuffers);

  // Store in LRU cache under the unique MD5 hash key
  audioCache.set(hashKey, concatenatedMp3);

  return concatenatedMp3;
}

export { normalizeTamilSpeech, chunkTamilText };
export default {
  getTamilTtsAudio,
  getAudioHash,
  audioCache,
  chunkCache,
  normalizeTamilSpeech,
  chunkTamilText
};
