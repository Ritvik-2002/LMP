// Voice utilities — extracted from Chatbot.jsx for reuse
// Uses Web Speech API (SpeechRecognition + SpeechSynthesis)

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
export const speechSupported = !!SpeechRecognition;
export const synthSupported = !!window.speechSynthesis;

let recognitionInstance = null;
let onResultCallback = null;
let onEndCallback = null;
let onErrorCallback = null;

// Initialize speech recognition (call once)
export const initRecognition = ({ onResult, onEnd, onError }) => {
  if (!speechSupported) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript.trim() && onResultCallback) onResultCallback(transcript);
  };

  recognition.onend = () => {
    if (onEndCallback) onEndCallback();
  };

  recognition.onerror = (event) => {
    if (onErrorCallback) onErrorCallback(event.error);
  };

  onResultCallback = onResult;
  onEndCallback = onEnd;
  onErrorCallback = onError;
  recognitionInstance = recognition;
  return recognition;
};

// Update callbacks (for when React refs change)
export const updateCallbacks = ({ onResult, onEnd, onError }) => {
  if (onResult) onResultCallback = onResult;
  if (onEnd) onEndCallback = onEnd;
  if (onError) onErrorCallback = onError;
};

// Start listening
export const listen = () => {
  if (!recognitionInstance) return;
  try {
    recognitionInstance.start();
  } catch (e) {
    // Already started
  }
};

// Stop listening
export const stopListening = () => {
  if (!recognitionInstance) return;
  try {
    recognitionInstance.abort();
  } catch (e) {
    // Not started
  }
};

// Speak text via TTS, returns promise that resolves when done
export const speak = (text, { onStart, onEnd } = {}) => {
  if (!synthSupported) return Promise.resolve();

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const lastIndex = sentences.length - 1;

    sentences.forEach((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      if (i === 0 && onStart) utterance.onstart = onStart;
      utterance.onend = () => {
        if (i === lastIndex) {
          if (onEnd) onEnd();
          resolve();
        }
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  });
};

// Stop speaking
export const stopSpeaking = () => {
  if (synthSupported) window.speechSynthesis.cancel();
};

// Cleanup
export const destroy = () => {
  stopListening();
  stopSpeaking();
  recognitionInstance = null;
};
