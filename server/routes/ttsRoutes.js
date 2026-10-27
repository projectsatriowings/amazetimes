import express from 'express';
import {
  getTamilTtsAudio,
  getAudioHash,
  audioCache,
  normalizeTamilSpeech
} from '../ttsService.js';

const router = express.Router();

/**
 * Helper to stream MP3 binary data with HTTP 206 Partial Content (Range) support
 * Crucial for iOS Safari, Android Chrome, and seekable HTML5 audio
 */
function streamMp3Response(req, res, audioBuffer) {
  const totalLength = audioBuffer.length;
  const rangeHeader = req.headers.range;

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

    if (start >= totalLength || end >= totalLength) {
      res.status(416).set({
        'Content-Range': `bytes */${totalLength}`
      });
      return res.end();
    }

    const chunkSize = (end - start) + 1;
    const slicedChunk = audioBuffer.subarray(start, end + 1);

    res.status(206).set({
      'Content-Range': `bytes ${start}-${end}/${totalLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400'
    });

    return res.end(slicedChunk);
  }

  // Standard 200 response for entire MP3 stream
  res.status(200).set({
    'Content-Type': 'audio/mpeg',
    'Content-Length': totalLength,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400'
  });

  return res.end(audioBuffer);
}

/**
 * POST /api/tts/prepare
 * Prepares and caches the Tamil audio buffer on the server via POST (bypassing 414 Request-URI Too Large)
 * Returns a short, clean streaming URL with an MD5 hash ID (e.g., /api/tts/stream/a1b2c3d4)
 */
router.post('/prepare', async (req, res) => {
  try {
    const { text, speed = 1 } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'உரை (text parameter) தேவைப்படுகிறது'
      });
    }

    const speedVal = parseFloat(speed) || 1;
    const normalized = normalizeTamilSpeech(text);
    const audioId = getAudioHash(normalized, speedVal);

    // Retrieve from cache or generate in background
    let audioBuffer = audioCache.get(audioId);
    if (!audioBuffer) {
      audioBuffer = await getTamilTtsAudio(normalized, speedVal);
    }

    const streamUrl = `/api/tts/stream/${audioId}?speed=${speedVal}`;

    return res.json({
      success: true,
      audioId,
      streamUrl,
      size: audioBuffer.length
    });
  } catch (error) {
    console.error('[TTS] Prepare Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'குரல் ஆடியோ உருவாக்க பிழை'
    });
  }
});

/**
 * POST /api/tts/synthesize
 * Direct binary MP3 streaming via POST request body (no URL length limits)
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, speed = 1 } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'உரை (text parameter) தேவைப்படுகிறது'
      });
    }

    const speedVal = parseFloat(speed) || 1;
    const normalized = normalizeTamilSpeech(text);
    const audioBuffer = await getTamilTtsAudio(normalized, speedVal);

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'ஆடியோ உருவாக்க முடியவில்லை'
      });
    }

    return streamMp3Response(req, res, audioBuffer);
  } catch (error) {
    console.error('[TTS] Synthesize Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'குரல் ஆடியோ ஸ்ட்ரீமிங் பிழை'
    });
  }
});

/**
 * GET /api/tts/stream/:id
 * Streams cached audio by its short 32-character MD5 hash ID
 * Fully supports HTTP 206 Partial Content for instant seeking on iOS & Android
 */
router.get('/stream/:id', (req, res) => {
  try {
    const { id } = req.params;
    const audioBuffer = audioCache.get(id);

    if (!audioBuffer) {
      return res.status(404).json({
        success: false,
        message: 'ஆடியோ காலாவதியானது அல்லது கிடைக்கவில்லை (Audio not found or expired)'
      });
    }

    return streamMp3Response(req, res, audioBuffer);
  } catch (error) {
    console.error('[TTS] Stream ID Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'குரல் ஆடியோ ஸ்ட்ரீமிங் பிழை'
    });
  }
});

/**
 * GET /api/tts/stream?text=...&speed=...
 * Legacy endpoint for short text queries (headline previews, alerts)
 */
router.get('/stream', async (req, res) => {
  try {
    const rawText = req.query.text;
    const speed = parseFloat(req.query.speed) || 1;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'உரை (text parameter) தேவைப்படுகிறது'
      });
    }

    // Generate or fetch cached concatenated MP3 buffer
    const audioBuffer = await getTamilTtsAudio(rawText, speed);

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'ஆடியோ உருவாக்க முடியவில்லை'
      });
    }

    return streamMp3Response(req, res, audioBuffer);
  } catch (error) {
    console.error('[TTS] Streaming Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'குரல் ஆடியோ ஸ்ட்ரீமிங் பிழை'
    });
  }
});

/**
 * POST /api/tts/normalize
 * Helper endpoint to inspect how text is normalized for Tamil speech
 */
router.post('/normalize', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Text required' });
  }
  const normalized = normalizeTamilSpeech(text);
  res.json({ success: true, original: text, normalized });
});

export default router;
