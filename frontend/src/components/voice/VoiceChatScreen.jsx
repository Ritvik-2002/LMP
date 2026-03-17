import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressIndicator from '../ProgressIndicator';
import './VoiceChatScreen.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Rotating greetings
const GREETINGS = ['Namaste', 'Hello', 'Hola', 'Bonjour', 'Ciao', 'Hej'];

// Audio recorder hook
function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef = useRef([]);
  const rafRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);

      // Monitor audio levels
      const monitor = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;
        setAudioLevel(avg / 255);
        rafRef.current = requestAnimationFrame(monitor);
      };
      monitor();

      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      return false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      setAudioLevel(0);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return { isRecording, audioLevel, startRecording, stopRecording };
}

// Audio player hook with onEnd callback
function useAudioPlayer(onPlaybackEnd) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const playAudio = useCallback(async (base64Audio) => {
    if (!base64Audio) {
      onPlaybackEnd?.();
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        onPlaybackEnd?.();
      };
      audio.onerror = () => {
        setIsPlaying(false);
        onPlaybackEnd?.();
      };

      setIsPlaying(true);
      await audio.play();
    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsPlaying(false);
      onPlaybackEnd?.();
    }
  }, [onPlaybackEnd]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, playAudio, stopAudio };
}

// Voice Orb Component with macOS-style subtle animation
function VoiceOrb({ state, audioLevel }) {
  const [rippleScale, setRippleScale] = useState(1);

  useEffect(() => {
    if (state !== 'speaking') {
      setRippleScale(1 + audioLevel * 0.4);
      return;
    }

    let animationId;
    const animate = () => {
      const scale = 1 + Math.sin(Date.now() / 250) * 0.08;
      setRippleScale(scale);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [state, audioLevel]);

  const getOrbClass = () => {
    switch (state) {
      case 'listening': return 'orb-listening';
      case 'processing': return 'orb-processing';
      case 'speaking': return 'orb-speaking';
      default: return 'orb-idle';
    }
  };

  return (
    <div className={`voice-orb ${getOrbClass()}`}>
      <div className="orb-core" />
      <div
        className="orb-ripple"
        style={{ transform: `scale(${rippleScale})` }}
      />
      <div className="orb-ripple orb-ripple-2" />
    </div>
  );
}

// Welcome Screen Component
function WelcomeScreen({ onStart }) {
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setGreetingIdx(i => (i + 1) % GREETINGS.length);
        setFading(false);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="voice-welcome-screen">
      {/* Background Orbs */}
      <div className="voice-welcome-bg">
        <div className="voice-welcome-orb orb-1" />
        <div className="voice-welcome-orb orb-2" />
        <div className="voice-welcome-orb orb-3" />
      </div>

      <div className="voice-welcome-content">
        <div className="voice-greeting-container">
          <h1 className={`voice-greeting ${fading ? 'fading' : ''}`}>
            {GREETINGS[greetingIdx]}
          </h1>
        </div>
        <p className="voice-subtitle">Your voice-powered loan assistant</p>

        <div className="voice-features">
          <div className="voice-feature">
            <div className="voice-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <div className="voice-feature-text">
              <span className="voice-feature-title">Just talk naturally</span>
              <span className="voice-feature-desc">Ask about products, EMI, or eligibility</span>
            </div>
          </div>
          <div className="voice-feature">
            <div className="voice-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="voice-feature-text">
              <span className="voice-feature-title">Quick responses</span>
              <span className="voice-feature-desc">Get instant answers to your questions</span>
            </div>
          </div>
          <div className="voice-feature">
            <div className="voice-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="voice-feature-text">
              <span className="voice-feature-title">Secure & private</span>
              <span className="voice-feature-desc">Bank-grade encryption for your data</span>
            </div>
          </div>
        </div>
      </div>

      <div className="voice-welcome-bottom">
        <button className="voice-start-btn" onClick={onStart}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          Start Voice Chat
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <p className="voice-hint">Tap to begin your loan journey</p>
      </div>
    </div>
  );
}

// Main Voice Chat Screen
export default function VoiceChatScreen() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState('welcome');
  const [voiceSessionId, setVoiceSessionId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [currentState, setCurrentState] = useState('idle');
  const [error, setError] = useState(null);
  const [autoListenAfterSpeak, setAutoListenAfterSpeak] = useState(true);
  const [richCards, setRichCards] = useState(null);

  const { isRecording, audioLevel, startRecording, stopRecording } = useAudioRecorder();

  const silenceStartTimeRef = useRef(null);
  const maxDurationTimerRef = useRef(null);
  const toggleListeningRef = useRef(null);
  const audioLevelRef = useRef(0);

  // Audio player hook - callback triggers auto-listen
  const { playAudio, stopAudio } = useAudioPlayer(useCallback(() => {
    setCurrentState('idle');
    if (autoListenAfterSpeak) {
      setTimeout(() => {
        toggleListeningRef.current?.('start');
      }, 300);
    }
  }, [autoListenAfterSpeak]));

  // Initialize voice session when entering chat
  const initVoiceSession = async () => {
    try {
      const res = await fetch(`${API_URL}/api/voice/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.voiceSessionId) {
        setVoiceSessionId(data.voiceSessionId);
        setTranscript([{ role: 'assistant', text: data.welcomeText }]);
        if (data.welcomeAudio) {
          playAudio(data.welcomeAudio);
          setCurrentState('speaking');
        } else {
          // No audio, start listening immediately
          setTimeout(() => {
            toggleListeningRef.current?.('start');
          }, 100);
        }
      }
    } catch (err) {
      setError('Failed to initialize voice session');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceSessionId) {
        fetch(`${API_URL}/api/voice/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voiceSessionId }),
        }).catch(console.error);
      }
    };
  }, [voiceSessionId]);

  // Combined handler that can start or stop listening
  const toggleListening = useCallback(async (action) => {
    if (action === 'start') {
      // Start listening
      stopAudio();
      setCurrentState('listening');
      setError(null);
      silenceStartTimeRef.current = null;

      const started = await startRecording();
      if (!started) {
        setError('Microphone access denied');
        setCurrentState('idle');
        return;
      }

      maxDurationTimerRef.current = setTimeout(() => {
        toggleListeningRef.current?.('stop');
      }, 30000);
    } else if (action === 'stop' || currentState === 'listening') {
      // Stop listening and process
      clearTimeout(maxDurationTimerRef.current);
      silenceStartTimeRef.current = null;
      setCurrentState('processing');

      const audioBlob = await stopRecording();
      if (!audioBlob || audioBlob.size < 1000) {
        setError('No audio detected. Please try again.');
        setCurrentState('idle');
        // Auto-retry
        setTimeout(() => toggleListeningRef.current?.('start'), 500);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];

        try {
          const res = await fetch(`${API_URL}/api/voice/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              voiceSessionId,
              audioBase64: base64,
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }

          const data = await res.json();

          setTranscript(prev => [
            ...prev,
            { role: 'user', text: data.userText },
            { role: 'assistant', text: data.assistantText },
          ]);

          setProgress(data.progress);
          // Backend returns array of cards, use first one
          const cards = Array.isArray(data.richCards) ? data.richCards[0] : data.richCards;
          setRichCards(cards || null);

          if (data.audioBase64) {
            setCurrentState('speaking');
            await playAudio(data.audioBase64);
            // handlePlaybackEnd will auto-trigger listening
          } else {
            setCurrentState('idle');
            // No audio, auto-start listening after short delay
            setTimeout(() => toggleListening('start'), 500);
          }

          // Handle overlay actions - navigate to chat with proper session
          if (['open_consent', 'open_aadhaar_otp', 'open_upi_payment', 'open_kfs_preview'].includes(data.action)) {
            setTimeout(() => {
              const journeySessionId = data.sessionId || voiceSessionId?.replace('voice_', 'journey_');
              navigate('/chat', { state: { sessionId: journeySessionId, action: data.action } });
            }, 2000);
          }
        } catch (err) {
          console.error('Process audio error:', err);
          setError('Failed to process audio: ' + (err.message || 'Unknown error'));
          setCurrentState('idle');
          // Auto-retry listening after error
          setTimeout(() => toggleListeningRef.current?.('start'), 1000);
        }
      };
    }
  }, [currentState, voiceSessionId, stopAudio, startRecording, playAudio, navigate]);

  // Store reference for callbacks
  toggleListeningRef.current = toggleListening;

  // Update audioLevel ref whenever it changes
  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  // VAD - Auto stop on silence
  useEffect(() => {
    if (currentState !== 'listening' || !isRecording) return;

    const SILENCE_THRESHOLD = 0.08;
    const SILENCE_DURATION = 1800;
    const MIN_SPEECH_TIME = 1000;

    const listenStartTime = Date.now();
    let frameId = null;

    const checkSilence = () => {
      if (currentState !== 'listening' || !isRecording) return;

      const speakingTime = Date.now() - listenStartTime;
      const level = audioLevelRef.current;

      // Debug
      if (silenceStartTimeRef.current) {
        const silenceTime = Date.now() - silenceStartTimeRef.current;
        console.log('VAD:', { level, speakingTime, silenceTime });
      }

      // Only check after minimum speech time
      if (speakingTime > MIN_SPEECH_TIME) {
        if (level < SILENCE_THRESHOLD) {
          if (!silenceStartTimeRef.current) {
            silenceStartTimeRef.current = Date.now();
          } else {
            const silenceTime = Date.now() - silenceStartTimeRef.current;
            if (silenceTime > SILENCE_DURATION) {
              console.log('VAD triggered - stopping');
              toggleListeningRef.current?.('stop');
              return;
            }
          }
        } else {
          silenceStartTimeRef.current = null;
        }
      }

      frameId = requestAnimationFrame(checkSilence);
    };

    frameId = requestAnimationFrame(checkSilence);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [currentState, isRecording]);

  const handleInterrupt = () => {
    stopAudio();
    setCurrentState('idle');
    fetch(`${API_URL}/api/voice/interrupt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceSessionId }),
    }).catch(console.error);
    // Auto-start listening after interrupt
    setTimeout(() => toggleListening('start'), 300);
  };

  const handleStart = async () => {
    setScreen('chat');
    await initVoiceSession();
  };

  if (screen === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <div className="voice-chat-screen">
      {/* macOS-style Frosted Glass Header */}
      <header className="voice-header">
        <div className="voice-header-left">
          <button className="voice-back" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="voice-logo">V</div>
          <span className="voice-title">Voice Assistant</span>
        </div>
        <div className="voice-header-center">
          <ProgressIndicator progress={progress} />
        </div>
        <div className="voice-header-right">
          <button className="voice-text-toggle" onClick={() => navigate('/chat')} title="Switch to text chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="voice-content">
        {/* Voice Orb */}
        <div className="voice-orb-container" onClick={currentState === 'speaking' ? handleInterrupt : undefined}>
          <VoiceOrb state={currentState} audioLevel={audioLevel} />
          {currentState === 'speaking' && (
            <span className="voice-tap-hint">Tap to interrupt</span>
          )}
        </div>

        {/* Transcript */}
        <div className="voice-transcript">
          {transcript.slice(-3).map((t, i) => (
            <div key={i} className={`voice-message ${t.role}`}>
              {t.text}
            </div>
          ))}
        </div>

        {/* Rich Cards - Categories */}
        {richCards?.type === 'category_list' && (
          <div className="voice-categories">
            {richCards.categories.map(cat => (
              <div key={cat.id} className="voice-category-card">
                <span className="voice-category-name">{cat.name}</span>
                <span className="voice-category-desc">{cat.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rich Cards - Products */}
        {richCards?.type === 'product_carousel' && (
          <div className="voice-products">
            {richCards.products.slice(0, 4).map(p => (
              <div key={p.id} className="voice-product-card">
                <span className="voice-product-brand">{p.brand}</span>
                <span className="voice-product-model">{p.model}</span>
                <span className="voice-product-price">₹{p.price?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* State Hint */}
        <div className="voice-state-hint">
          {currentState === 'idle' && 'Tap the mic and speak'}
          {currentState === 'listening' && (
            <>
              <div className="voice-audio-meter">
                <div className="voice-audio-bar" style={{ width: `${Math.min(audioLevel * 500, 100)}%` }} />
              </div>
              <span>Listening... (stop speaking to process)</span>
            </>
          )}
          {currentState === 'processing' && 'Processing...'}
          {currentState === 'speaking' && 'Speaking...'}
        </div>

        {error && <div className="voice-error">{error}</div>}
      </div>

      {/* Controls */}
      <div className="voice-controls">
        <button
          className={`voice-mic-button ${currentState === 'listening' ? 'recording' : ''} ${currentState === 'processing' ? 'disabled' : ''}`}
          onClick={() => toggleListening(currentState === 'listening' ? 'stop' : 'start')}
          disabled={currentState === 'processing'}
        >
          {currentState === 'listening' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
