/**
 * Sarvam AI Client for Speech-to-Text (STT) and Text-to-Speech (TTS)
 */

const axios = require('axios');
const FormData = require('form-data');

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE_URL = 'https://api.sarvam.ai';

// Model selection - v2.5 is the current stable model
const DEFAULT_STT_MODEL = process.env.SARVAM_STT_MODEL || 'saarika:v2.5';
// Bulbul v3 speakers: aditya, ritu, priya, neha, rahul, pooja, rohan, simran,
// kavya, amit, dev, ishita, shreya, ratan, varun, manan, sumit, roopa, kabir,
// aayan, shubh, ashutosh, advait, amelia, sophia
const DEFAULT_TTS_VOICE = process.env.SARVAM_TTS_VOICE || 'advait';

// TTS cache to avoid regenerating same audio
const ttsCache = new Map();
const MAX_CACHE_SIZE = 100;

/**
 * Convert audio buffer to text using Sarvam STT
 */
async function speechToText(audioBuffer, options = {}) {
  if (!SARVAM_API_KEY) {
    console.warn('SARVAM_API_KEY not set');
    return { text: '', confidence: 0 };
  }

  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm',
    });
    formData.append('model', options.model || DEFAULT_STT_MODEL);
    formData.append('language_code', options.language || 'hi-IN');

    const response = await axios.post(
      `${SARVAM_BASE_URL}/speech-to-text`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'api-subscription-key': SARVAM_API_KEY,
        },
        timeout: 30000,
      }
    );

    return {
      text: response.data.transcript || '',
      confidence: response.data.confidence || 0.9,
    };
  } catch (error) {
    console.error('Sarvam STT error:', error.response?.data || error.message);
    return { text: '', confidence: 0 };
  }
}

/**
 * Convert text to speech using Sarvam TTS
 * Uses caching to avoid regenerating same audio
 */
async function textToSpeech(text, options = {}) {
  if (!SARVAM_API_KEY) {
    console.warn('SARVAM_API_KEY not set');
    return Buffer.from([]);
  }

  // Skip TTS for very short or empty text
  if (!text || text.length < 2) {
    return Buffer.from([]);
  }

  // Create cache key from text + voice + language
  const voice = options.voice || DEFAULT_TTS_VOICE;
  const language = options.language || 'hi-IN';
  const cacheKey = `${language}:${voice}:${text}`;

  // Check cache
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey);
  }

  const model = options.model || 'bulbul:v3';
  const speaker = voice;

  try {
    const response = await axios.post(
      `${SARVAM_BASE_URL}/text-to-speech`,
      {
        text: text,
        target_language_code: language,
        speaker: speaker,
        pace: options.pace || 0.9,
        model: model,
        speech_sample_rate: 22050,
      },
      {
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Response contains base64 audio in audios array
    const audioBase64 = response.data?.audios?.[0];
    if (!audioBase64) {
      console.warn('TTS response missing audio');
      return Buffer.from([]);
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Cache the result
    if (ttsCache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = ttsCache.keys().next().value;
      ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, audioBuffer);

    return audioBuffer;
  } catch (error) {
    console.error('Sarvam TTS error:', error.response?.data || error.message);
    return Buffer.from([]);
  }
}

/**
 * Clear TTS cache
 */
function clearTTSCache() {
  ttsCache.clear();
}

/**
 * Get cache stats
 */
function getTTSCacheStats() {
  return {
    size: ttsCache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}

module.exports = {
  speechToText,
  textToSpeech,
  clearTTSCache,
  getTTSCacheStats,
  DEFAULT_STT_MODEL,
  DEFAULT_TTS_VOICE,
};
