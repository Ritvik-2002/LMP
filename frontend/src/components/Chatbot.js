import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Toggle chatbot open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Send message to backend
  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message to chat
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
        sessionId: sessionId
      });

      // Add bot response to chat
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

      // Store session ID for future messages
      if (response.data.sessionId && !sessionId) {
        setSessionId(response.data.sessionId);
      }

      // Handle checkout redirect
      if (response.data.checkoutReady && response.data.checkoutUrl) {
        setTimeout(() => {
          window.open(response.data.checkoutUrl, '_blank');
        }, 2000); // Small delay to let user see the confirmation message
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input submit
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Handle option click
  const handleOptionClick = (option) => {
    sendMessage(option);
  };

  // Format timestamp
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
                <span className="status">Online • Ready to Help</span>
              </div>
            </div>
            <button 
              className="close-button" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              ✕
            </button>
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
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
