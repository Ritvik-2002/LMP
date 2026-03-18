/**
 * Voice Controller for Real-time Voice Conversational Loan Journey
 */

const sarvam = require('../utils/sarvamClient');
const journeyController = require('./journeyController');

// Voice session store
const voiceSessions = new Map();
const VOICE_SESSION_TTL = 30 * 60 * 1000;

// Simple UUID generator for CommonJS
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of voiceSessions) {
    if (now - session.lastActivity > VOICE_SESSION_TTL) {
      voiceSessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

const createVoiceSession = (journeySessionId) => {
  const voiceSessionId = `voice_${generateId()}`;
  const session = {
    voiceSessionId,
    journeySessionId,
    state: 'idle',
    lastActivity: Date.now(),
    interruptRequested: false,
  };
  voiceSessions.set(voiceSessionId, session);
  return session;
};

const getVoiceSession = (voiceSessionId) => {
  const session = voiceSessions.get(voiceSessionId);
  if (session) session.lastActivity = Date.now();
  return session;
};

/**
 * Initialize voice session
 */
exports.initSession = async (req, res) => {
  try {
    const { journeySessionId } = req.body;
    const voiceSession = createVoiceSession(journeySessionId);

    const welcomeText = "Welcome to the store. I'm your voice assistant. What would you like to explore today?";

    // TTS is cached automatically by sarvamClient
    let welcomeAudio = null;
    try {
      const audioBuffer = await sarvam.textToSpeech(welcomeText);
      welcomeAudio = audioBuffer.toString('base64');
    } catch (err) {
      console.error('TTS error:', err.message);
    }

    res.json({
      voiceSessionId: voiceSession.voiceSessionId,
      journeySessionId: voiceSession.journeySessionId,
      state: voiceSession.state,
      welcomeText,
      welcomeAudio,
    });
  } catch (error) {
    console.error('Voice init error:', error);
    res.status(500).json({ error: 'Failed to initialize voice session' });
  }
};

/**
 * Process audio and return response
 */
exports.processAudio = async (req, res) => {
  try {
    const { voiceSessionId, audioBase64 } = req.body;

    if (!voiceSessionId || !audioBase64) {
      console.error('Missing voiceSessionId or audio');
      return res.status(400).json({ error: 'Missing voiceSessionId or audio' });
    }

    const voiceSession = getVoiceSession(voiceSessionId);
    if (!voiceSession) {
      console.error('Voice session not found:', voiceSessionId);
      return res.status(404).json({ error: 'Voice session not found' });
    }

    voiceSession.state = 'processing';

    // Decode and transcribe
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    console.log('Processing audio, size:', audioBuffer.length, 'bytes');

    const sttResult = await sarvam.speechToText(audioBuffer);
    console.log('STT result:', sttResult);

    const userText = sttResult.text.trim();
    const MIN_STT_CONFIDENCE = 0.5;

    if (!userText || sttResult.confidence < MIN_STT_CONFIDENCE) {
      console.log('Rejecting STT result - empty or low confidence:', sttResult.confidence);
      voiceSession.state = 'idle';
      return res.json({
        voiceSessionId,
        state: 'idle',
        userText: '',
        assistantText: "I didn't catch that. Could you please repeat?",
        audioBase64: null,
      });
    }

    // Process through journey
    const journeyResult = await processThroughJourney(
      voiceSession.journeySessionId,
      userText
    );

    const assistantText = journeyResult.text;
    voiceSession.journeySessionId = journeyResult.sessionId;

    // Generate TTS
    let responseAudio = null;
    try {
      const audioBuffer = await sarvam.textToSpeech(assistantText);
      responseAudio = audioBuffer.toString('base64');
    } catch (err) {
      console.error('TTS error:', err.message);
    }

    voiceSession.state = responseAudio ? 'speaking' : 'idle';

    res.json({
      voiceSessionId,
      sessionId: journeyResult.sessionId, // journey session ID for navigation
      state: voiceSession.state,
      journeyState: journeyResult.journeyState,
      progress: journeyResult.progress,
      userText,
      assistantText,
      audioBase64: responseAudio,
      richCards: journeyResult.richCards,
      action: journeyResult.action,
    });
  } catch (error) {
    console.error('Voice process error:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
};

async function processThroughJourney(sessionId, message) {
  const req = {
    body: { message, sessionId },
  };

  let result = null;
  const res = {
    json: (data) => { result = data; },
    status: () => ({ json: (data) => { result = { error: data.error }; } }),
  };

  await journeyController.processMessage(req, res);
  return result;
}

exports.interrupt = async (req, res) => {
  const { voiceSessionId } = req.body;
  const voiceSession = getVoiceSession(voiceSessionId);
  if (!voiceSession) return res.status(404).json({ error: 'Session not found' });

  voiceSession.interruptRequested = true;
  voiceSession.state = 'idle';
  res.json({ voiceSessionId, interrupted: true });
};

exports.endSession = async (req, res) => {
  const { voiceSessionId } = req.body;
  voiceSessions.delete(voiceSessionId);
  res.json({ voiceSessionId, ended: true });
};
