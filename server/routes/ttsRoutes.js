import express from 'express';
import { getTamilTtsAudio, normalizeTamilSpeech } from '../ttsService.js';

const router = express.Router();

/**
 * GET /api/tts/stream?text=...&speed=...
 * Streams concatenated MP3 audio with Google Tamil TTS pronunciation,
 * preprocessed text normalization, and LRU memory caching.
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

    const totalLength = audioBuffer.length;
    const rangeHeader = req.headers.range;

    // Support HTTP Range requests (crucial for iOS Safari, Chrome, and seekable HTML5 audio)
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
  } catch (error) {
    console.error('TTS Streaming Error:', error);
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
