import { useState, useEffect, useRef, useCallback } from 'react';
import './Chatbot.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognition;
const synthSupported = !!window.speechSynthesis;

const Chatbot = ({ isOpen = false, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [micError, setMicError] = useState('');
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const conversationModeRef = useRef(false);
  const sessionIdRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { conversationModeRef.current = conversationMode; }, [conversationMode]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.start(); setIsListening(true); } catch (e) { /* already started */ }
  }, []);

  const speakText = useCallback((text) => {
    if (!synthSupported) return;
    window.speechSynthesis.cancel();
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const lastIndex = sentences.length - 1;
    sentences.forEach((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        if (i === lastIndex) {
          setIsSpeaking(false);
          if (conversationModeRef.current) setTimeout(() => startListening(), 300);
        }
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    });
  }, [startListening]);

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: messageText, timestamp: new Date() }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, sessionId: sessionIdRef.current })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        type: 'bot', text: data.response, options: data.options, timestamp: new Date(),
        checkoutUrl: data.checkoutUrl, checkoutReady: data.checkoutReady, selectedProducts: data.selectedProducts
      }]);
      if (conversationModeRef.current && synthSupported) speakText(data.response);
      if (data.sessionId && !sessionIdRef.current) setSessionId(data.sessionId);
      if (data.checkoutReady && data.checkoutUrl) setTimeout(() => window.open(data.checkoutUrl, '_blank'), 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I'm having trouble connecting. Please try again.", timestamp: new Date() }]);
      if (conversationModeRef.current) setTimeout(() => startListening(), 300);
    } finally {
      setIsLoading(false);
    }
  }, [speakText, startListening]);

  useEffect(() => {
    if (!speechSupported) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) sendMessage(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') { setMicError('Microphone access denied.'); setConversationMode(false); }
    };
    recognitionRef.current = recognition;
    return () => recognitionRef.current?.abort();
  }, [sendMessage]);

  useEffect(() => { return () => { if (synthSupported) window.speechSynthesis.cancel(); }; }, []);

  const toggleConversationMode = () => {
    setMicError('');
    if (conversationMode) {
      setConversationMode(false);
      recognitionRef.current?.abort();
      setIsListening(false);
      if (synthSupported) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      setConversationMode(true);
      if (synthSupported) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      startListening();
    }
  };

  useEffect(() => {
    setMessages([{
      type: 'bot',
      text: "Hi! I'm your AI shopping assistant. Ask me anything about this product — specs, comparisons, deals, or help deciding!",
      options: ["Compare phones", "Is this worth it?", "Best deals today"],
      timestamp: new Date()
    }]);
  }, []);

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(inputMessage); };
  const handleOptionClick = (option) => sendMessage(option);
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Backdrop */}
      <div className={`panel-backdrop ${isOpen ? 'visible' : ''}`} onClick={onClose} />

      {/* Side Panel */}
      <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
        {/* Panel Header */}
        <div className="panel-header">
          <div className="panel-header-left">
            <div className="panel-ai-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div>
              <h3 className="panel-title">AI Assistant</h3>
              <span className="panel-status">
                {conversationMode
                  ? (isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : 'Voice active')
                  : 'Ask me anything'}
              </span>
            </div>
          </div>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="panel-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">
                <div className="message-bubble">
                  <p>{message.text}</p>
                  {message.checkoutReady && message.selectedProducts && (
                    <div className="checkout-info">
                      <h4>🛒 Your Selection:</h4>
                      {message.selectedProducts.map((product, pIndex) => (
                        <div key={pIndex} className="product-item">
                          <span>{product.name}</span>
                          <span className="product-price">${product.price}</span>
                          {product.discount > 0 && <span className="product-discount">({product.discount}% off)</span>}
                        </div>
                      ))}
                      <p className="redirect-notice">🚀 Redirecting to checkout...</p>
                    </div>
                  )}
                  {message.options && message.options.length > 0 && (
                    <div className="message-options">
                      {message.options.map((option, optIndex) => (
                        <button key={optIndex} className="option-button" onClick={() => handleOptionClick(option)}>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-content">
                <div className="message-bubble">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="panel-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="panel-input"
            placeholder={conversationMode ? 'Voice mode — speak or type...' : 'Ask about this product...'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          {speechSupported && synthSupported && (
            <button
              type="button"
              className={`panel-mic ${conversationMode ? 'active' : ''} ${isListening ? 'listening' : ''}`}
              onClick={toggleConversationMode}
              disabled={isLoading}
              title={conversationMode ? 'Stop voice mode' : 'Start voice mode'}
            >
              {conversationMode ? (isListening ? '🎤' : '🔊') : '🎙️'}
            </button>
          )}
          <button type="submit" className="panel-send" disabled={isLoading || !inputMessage.trim()}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
        {micError && <div className="mic-error">{micError}</div>}
      </div>
    </>
  );
};

export default Chatbot;
