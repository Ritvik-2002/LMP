import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './Chatbot.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognition;
const synthSupported = !!window.speechSynthesis;

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [micError, setMicError] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const conversationModeRef = useRef(false);
  const sessionIdRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { conversationModeRef.current = conversationMode; }, [conversationMode]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start listening (used internally)
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      // recognition may already be started
    }
  }, []);

  // Speak text and optionally auto-listen after
  const speakText = useCallback((text) => {
    if (!synthSupported) return;
    window.speechSynthesis.cancel();
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const lastIndex = sentences.length - 1;
    sentences.forEach((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        // Only on the last sentence finishing
        if (i === lastIndex) {
          setIsSpeaking(false);
          // Auto-listen again if conversation mode is still on
          if (conversationModeRef.current) {
            setTimeout(() => startListening(), 300);
          }
        }
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    });
  }, [startListening]);

  // Send message to backend
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      type: 'user',
      text: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat/message', {
        message: messageText,
        sessionId: sessionIdRef.current
      });

      const botMessage = {
        type: 'bot',
        text: response.data.response,
        options: response.data.options,
        timestamp: new Date(),
        checkoutUrl: response.data.checkoutUrl,
        checkoutReady: response.data.checkoutReady,
        selectedProducts: response.data.selectedProducts
      };
      setMessages(prev => [...prev, botMessage]);

      // Speak bot response if in conversation mode
      if (conversationModeRef.current && synthSupported) {
        speakText(response.data.response);
      }

      if (response.data.sessionId && !sessionIdRef.current) {
        setSessionId(response.data.sessionId);
      }

      if (response.data.checkoutReady && response.data.checkoutUrl) {
        setTimeout(() => {
          window.open(response.data.checkoutUrl, '_blank');
        }, 2000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      // Re-listen even on error if in conversation mode
      if (conversationModeRef.current) {
        setTimeout(() => startListening(), 300);
      }
    } finally {
      setIsLoading(false);
    }
  }, [speakText, startListening]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!speechSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        sendMessage(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setMicError('Microphone access denied. Please allow mic permission.');
        setConversationMode(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
    };
  }, [sendMessage]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (synthSupported) window.speechSynthesis.cancel();
    };
  }, []);

  // Toggle conversation mode on/off
  const toggleConversationMode = () => {
    setMicError('');
    if (conversationMode) {
      // Turn off
      setConversationMode(false);
      if (recognitionRef.current) recognitionRef.current.abort();
      setIsListening(false);
      if (synthSupported) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Turn on — start listening immediately
      setConversationMode(true);
      if (synthSupported) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      startListening();
    }
  };

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage = {
      type: 'bot',
      text: "Hello! Welcome to TechMart Electronics! 🎉 I'm your personal shopping assistant. We carry top brands like Apple, Samsung, Google, Sony, Dell, Microsoft, and more - all with amazing discounts! What are you looking for today?",
      options: ["Smartphones", "Laptops", "Gaming", "Best Deals"],
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleOptionClick = (option) => {
    sendMessage(option);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`chat-bubble ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        <span className="chat-icon">💬</span>
        <span className="chat-notification">1</span>
      </button>

      {/* Chatbot Widget */}
      <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="bot-avatar">🛍️</div>
              <div className="header-text">
                <h3>Shopping Assistant</h3>
                <span className="status">
                  {conversationMode
                    ? (isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : 'Voice Active')
                    : 'Online • Ready to Help'}
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="close-button"
                onClick={toggleChat}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
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
                            {product.discount > 0 && (
                              <span className="product-discount">({product.discount}% off)</span>
                            )}
                          </div>
                        ))}
                        <p className="redirect-notice">🚀 Redirecting to checkout...</p>
                      </div>
                    )}
                    {message.options && message.options.length > 0 && (
                      <div className="message-options">
                        {message.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            className="option-button"
                            onClick={() => handleOptionClick(option)}
                          >
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
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chatbot-input"
              placeholder={conversationMode ? 'Voice mode active — speak or type...' : 'Type your message...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            {speechSupported && synthSupported && (
              <button
                type="button"
                className={`mic-button ${conversationMode ? 'active' : ''} ${isListening ? 'listening' : ''}`}
                onClick={toggleConversationMode}
                disabled={isLoading}
                aria-label={conversationMode ? 'End voice conversation' : 'Start voice conversation'}
                title={conversationMode ? 'End voice conversation' : 'Start voice conversation'}
              >
                {conversationMode ? (isListening ? '🎤' : '🔊') : '🎙️'}
              </button>
            )}
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
            </button>
          </form>
          {micError && <div className="mic-error">{micError}</div>}
        </div>
      </div>
    </>
  );
};

export default Chatbot;
