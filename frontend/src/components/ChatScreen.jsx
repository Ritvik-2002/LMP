import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProgressIndicator from './ProgressIndicator';
import ProductCarousel from './cards/ProductCarousel';
import ProductCard from './cards/ProductCard';
import OfferCard from './cards/OfferCard';
import AadhaarOTPOverlay from './overlays/AadhaarOTPOverlay';
import UPIPaymentOverlay from './overlays/UPIPaymentOverlay';
import KFSPreviewOverlay from './overlays/KFSPreviewOverlay';
import ConsentOverlay from './overlays/ConsentOverlay';
import MandateOverlay from './overlays/MandateOverlay';
import {
  speechSupported, synthSupported, initRecognition, updateCallbacks,
  listen, stopListening, speak, stopSpeaking, destroy,
} from '../utils/voice';
import { getProductsByCategory, getSemanticRecommendations } from '../data/catalogue';
import './ChatScreen.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const API_BASE = '/api/journey';

// Rotating greetings for the welcome screen (Indian languages in native scripts)
const GREETINGS = ['Welcome', 'नमस्ते', 'வணக்கம்', 'ನಮಸ್ಕಾರ', 'প্রণাম', 'నమస్కారం', 'नमस्कार', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ'];

const CATEGORIES = [
  { id: 'smartphones', label: 'Smartphones', desc: 'Flagships & budget picks', available: true },
  { id: 'laptops', label: 'Laptops', desc: 'Ultrabooks & workstations', available: true },
  { id: 'audio', label: 'Audio', desc: 'Headphones & earbuds', available: true },
  { id: 'wearables', label: 'Wearables', desc: 'Smartwatches & bands', available: true },
];

const getCategorySuggestions = (categoryId) => {
  const products = getProductsByCategory(categoryId);
  const brands = [...new Set(products.map(p => p.brand))];
  const extras = {
    smartphones: ['Under 50,000', 'Best camera', '5G phones'],
    laptops: ['Under 1,00,000', 'Ultrabook', 'For coding'],
    audio: ['Under 25,000', 'Noise cancelling', 'Earbuds'],
    wearables: ['Under 30,000', 'Fitness', 'Premium'],
  };
  return [...brands, ...(extras[categoryId] || [])];
};

const filterCategoryProducts = (categoryId, query) => {
  const products = getProductsByCategory(categoryId);
  const q = query.toLowerCase().replace(/[₹,]/g, '');

  const priceMatch = q.match(/under\s*(\d[\d,]*)/);
  if (priceMatch) {
    const maxPrice = parseInt(priceMatch[1].replace(/,/g, ''));
    return products.filter(p => p.price <= maxPrice);
  }

  return products.filter(p =>
    p.brand.toLowerCase().includes(q) ||
    p.model.toLowerCase().includes(q) ||
    p.highlights?.some(h => h.toLowerCase().includes(q))
  );
};

const ChatScreen = () => {
  const { productId } = useParams();
  const location = useLocation();

  // Welcome screen state
  const [screen, setScreen] = useState('welcome'); // welcome | chat
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [welcomeFading, setWelcomeFading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('journey_session') || null);

  // Browse state — when set, interactions are handled locally (no AI)
  const [browseCategory, setBrowseCategory] = useState(null);
  const browseCategoryRef = useRef(null);

  // Journey state
  const [journeyState, setJourneyState] = useState('browsing');
  const [progress, setProgress] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Product popup state
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState(null);

  // Cart state
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSessionId, setCartSessionId] = useState(() => sessionStorage.getItem('cart_session_id'));
  const [showCartModal, setShowCartModal] = useState(false);

  // Voice state
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Overlay state
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [loanData, setLoanData] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const sessionIdRef = useRef(sessionId);
  const voiceModeRef = useRef(false);

  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { browseCategoryRef.current = browseCategory; }, [browseCategory]);

  // Drive overlays from journey state — source of truth
  useEffect(() => {
    if (journeyState === 'consent') setActiveOverlay('consent');
    else if (journeyState === 'kyc') setActiveOverlay('aadhaar');
    else if (journeyState === 'downpayment') setActiveOverlay('payment');
    else if (journeyState === 'repayment') setActiveOverlay('mandate');
    else if (journeyState === 'kfs') setActiveOverlay('kfs');
  }, [journeyState]);

  // Rotate greetings on welcome screen
  useEffect(() => {
    if (screen !== 'welcome') return;
    const interval = setInterval(() => {
      setGreetingIdx(prev => (prev + 1) % GREETINGS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [screen]);

  // If productId is passed, skip welcome
  useEffect(() => {
    if (productId) {
      setScreen('chat');
    }
  }, [productId]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Persist session ID
  useEffect(() => {
    if (sessionId) sessionStorage.setItem('journey_session', sessionId);
  }, [sessionId]);

  // Handle navigation state from voice chat
  useEffect(() => {
    if (location.state?.action) {
      // Skip welcome screen when coming from voice chat
      setScreen('chat');

      const actionMap = {
        'open_consent': 'consent',
        'open_aadhaar_otp': 'aadhaar',
        'open_upi_payment': 'payment',
        'open_kfs_preview': 'kfs',
      };
      setActiveOverlay(actionMap[location.state.action]);
      if (location.state.sessionId) {
        setSessionId(location.state.sessionId);
        // Fetch session state to restore context
        fetch(`${API_BASE}/state/${location.state.sessionId}`)
          .then(r => r.json())
          .then(data => {
            if (data.journeyState) {
              setJourneyState(data.journeyState);
              setProgress(data.progress);
              if (data.selectedProduct) setSelectedProduct(data.selectedProduct);
              // Restore chat history
              if (data.chatHistory?.length > 0) {
                setMessages(data.chatHistory.map(h => ({
                  role: h.role,
                  content: h.content,
                  timestamp: Date.now(),
                })));
              }
            }
          })
          .catch(console.error);
      }
    }
  }, [location.state]);

  // Send message handler
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: Date.now() }]);
    setInput('');

    // Local browse mode — filter products client-side
    if (browseCategoryRef.current) {
      const filtered = filterCategoryProducts(browseCategoryRef.current, text);
      setTimeout(() => {
        if (filtered.length > 0) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Found ${filtered.length} result${filtered.length > 1 ? 's' : ''}`,
            richCards: [{ type: 'product_grid', products: filtered }],
            timestamp: Date.now(),
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `No products match "${text}". Try a different search.`,
            richCards: [{ type: 'suggestion_chips', suggestions: getCategorySuggestions(browseCategoryRef.current) }],
            timestamp: Date.now(),
          }]);
        }
      }, 200);
      return;
    }

    // API mode — loan journey
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionIdRef.current }),
      });
      const data = await res.json();

      if (data.sessionId && !sessionIdRef.current) {
        setSessionId(data.sessionId);
      }

      // Simulate eligibility check with loader before showing offers
      if (data.journeyState === 'showing_offers' && data.richCards?.some(c => c.type === 'offer_cards')) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Checking your eligibility with lenders, hang tight...',
          richCards: [{ type: 'eligibility_loader' }],
          timestamp: Date.now(),
        }]);
        setProgress(3);
        await new Promise(resolve => setTimeout(resolve, 2500));
        // Remove loader message and show actual offers
        setMessages(prev => [
          ...prev.slice(0, -1),
          {
            role: 'assistant',
            content: data.text,
            richCards: data.richCards || [],
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text,
          richCards: data.richCards || [],
          timestamp: Date.now(),
        }]);
      }

      setJourneyState(data.journeyState);
      setProgress(data.progress);
      if (data.selectedProduct) setSelectedProduct(data.selectedProduct);

      // Overlays are driven by journeyState useEffect above

      if (data.richCards) {
        const loanSummary = data.richCards.find(c => c.type === 'loan_summary');
        if (loanSummary) setLoanData(loanSummary);
      }

      if (voiceModeRef.current && synthSupported) {
        speak(data.text, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => {
            setIsSpeaking(false);
            if (voiceModeRef.current) setTimeout(() => listen(), 300);
          },
        });
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Handle action (from overlays)
  const handleAction = useCallback(async (action, actionData = {}) => {
    try {
      const res = await fetch(`${API_BASE}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current, action, data: actionData }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        richCards: data.richCards || [],
        timestamp: Date.now(),
      }]);

      setJourneyState(data.journeyState);
      setProgress(data.progress);
      if (data.selectedProduct) setSelectedProduct(data.selectedProduct);

      // Overlays are driven by journeyState useEffect above

      if (data.richCards) {
        const loanSummary = data.richCards.find(c => c.type === 'loan_summary');
        if (loanSummary) setLoanData(loanSummary);
      }

      if (voiceModeRef.current && synthSupported) {
        speak(data.text, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }
    } catch (err) {
      console.error('Handle action error:', err);
    }
  }, []);

  // Initialize voice
  useEffect(() => {
    if (speechSupported) {
      initRecognition({
        onResult: (transcript) => {
          if (transcript.trim()) sendMessage(transcript);
        },
        onEnd: () => setIsListening(false),
        onError: (error) => {
          setIsListening(false);
          if (error === 'not-allowed') setVoiceMode(false);
        },
      });
    }
    return () => destroy();
  }, [sendMessage]);

  useEffect(() => {
    updateCallbacks({
      onResult: (transcript) => {
        if (transcript.trim()) sendMessage(transcript);
      },
    });
  }, [sendMessage]);

  // Load initial chat content when entering chat screen
  const startChat = () => {
    setWelcomeFading(true);
    setTimeout(() => {
      setScreen('chat');
      setMessages([{
        role: 'assistant',
        content: 'What are you looking to buy today?',
        richCards: [{ type: 'category_grid', categories: CATEGORIES }],
        timestamp: Date.now(),
      }]);
    }, 500);
  };

  // Auto-load for productId
  useEffect(() => {
    if (productId && screen === 'chat' && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Finding that for you...', timestamp: Date.now() }]);
      setTimeout(() => sendMessage(`I'd like to know about the product with ID ${productId}`), 300);
    }
  }, [screen, productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Voice toggle
  const toggleVoice = () => {
    if (voiceMode) {
      setVoiceMode(false);
      stopListening();
      setIsListening(false);
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setVoiceMode(true);
      stopSpeaking();
      setIsSpeaking(false);
      setIsListening(true);
      listen();
    }
  };

  // Cart functions
  const updateCartState = useCallback((data) => {
    setCart(data.cart);
    setCartCount(data.cartCount);
    if (data.sessionId) {
      setCartSessionId(data.sessionId);
      sessionStorage.setItem('cart_session_id', data.sessionId);
    }
  }, []);

  const addToCart = useCallback(async (product, color, storage) => {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: cartSessionId,
        product: {
          id: product.id,
          name: `${product.brand} ${product.model}`,
          brand: product.brand,
          price: product.price,
          mrp: product.mrp,
          color: color.name,
          color_hex: color.hex,
          image_bg: color.image_bg,
          storage,
        }
      })
    });
    const data = await res.json();
    updateCartState(data);
    return data;
  }, [cartSessionId, updateCartState]);

  const fetchCart = useCallback(async () => {
    if (!cartSessionId) return;
    try {
      const res = await fetch(`/api/cart/${cartSessionId}`);
      const data = await res.json();
      updateCartState(data);
    } catch (err) {
      console.error('Fetch cart error:', err);
    }
  }, [cartSessionId, updateCartState]);

  const handleViewCart = () => {
    fetchCart();
    setShowCartModal(true);
  };

  const handleProductTap = (product) => {
    // Show product popup with details and location
    setPopupProduct(product);
    setShowProductPopup(true);
  };

  const handleExploreEMI = () => {
    // Close popup and start EMI journey directly
    setShowProductPopup(false);
    const product = popupProduct;
    setPopupProduct(null);

    if (!product) return;

    setSelectedProduct(product);
    setBrowseCategory(null);
    browseCategoryRef.current = null;
    sendMessage(`I want to buy the ${product.brand} ${product.model} on EMI`);
  };

  const handleCategoryTap = (category) => {
    if (!category.available) return;
    const products = getProductsByCategory(category.id);
    setBrowseCategory(category.id);
    browseCategoryRef.current = category.id;

    setMessages(prev => [...prev,
      { role: 'user', content: category.label, timestamp: Date.now() },
    ]);

    setTimeout(() => {
      setMessages(prev => [...prev,
        {
          role: 'assistant',
          content: `Here's our ${category.label.toLowerCase()} collection`,
          richCards: [{ type: 'product_grid', products }],
          timestamp: Date.now(),
        },
        {
          role: 'assistant',
          content: 'Looking for a specific brand or feature?',
          richCards: [{ type: 'suggestion_chips', suggestions: getCategorySuggestions(category.id) }],
          timestamp: Date.now(),
        },
      ]);
    }, 300);
  };

  const handleSuggestionTap = (suggestion) => {
    if (suggestion === 'Explore EMI options' && selectedProduct) {
      // Exit local browse, start API-driven loan journey
      setBrowseCategory(null);
      browseCategoryRef.current = null;
      sendMessage(`I want to buy the ${selectedProduct.brand} ${selectedProduct.model} on EMI`);
      return;
    }
    if (suggestion === 'Back to browsing') {
      setBrowseCategory(null);
      browseCategoryRef.current = null;
      setMessages(prev => [...prev,
        { role: 'user', content: 'Back to browsing', timestamp: Date.now() },
        {
          role: 'assistant',
          content: 'What are you looking to buy today?',
          richCards: [{ type: 'category_grid', categories: CATEGORIES }],
          timestamp: Date.now(),
        },
      ]);
      return;
    }
    sendMessage(suggestion);
  };

  const handleOfferSelect = (offer) => {
    handleAction('offer_selected', offer);
  };

  const downloadLoanAgreement = (card) => {
    const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Loan Agreement — ${card.orderId}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #111; font-size: 14px; line-height: 1.6; }
    h1 { font-size: 22px; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 6px; }
    h2 { font-size: 15px; margin: 24px 0 8px; color: #333; }
    .meta { font-size: 12px; color: #555; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { text-align: left; padding: 8px 10px; border: 1px solid #ddd; font-size: 13px; }
    th { background: #f5f5f5; font-weight: 600; }
    .highlight { background: #f0f7ff; font-weight: 700; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 12px; }
    .sig-block { display: flex; justify-content: space-between; margin-top: 60px; }
    .sig-line { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 4px; font-size: 12px; color: #555; }
  </style>
</head>
<body>
  <h1>Loan Agreement</h1>
  <div class="meta">Order ID: <strong>${card.orderId}</strong> &nbsp;|&nbsp; Date: ${date}</div>

  <h2>Borrower & Product Details</h2>
  <table>
    <tr><th>Product</th><td>${card.product?.brand || ''} ${card.product?.model || ''}</td></tr>
    <tr><th>Estimated Delivery</th><td>${card.estimatedDelivery || '—'}</td></tr>
  </table>

  <h2>Loan Details</h2>
  <table>
    <tr><th>Lender</th><td>${card.lenderName}</td></tr>
    <tr><th>Loan Amount</th><td>${fmt(card.loanAmount)}</td></tr>
    <tr><th>Down Payment</th><td>${fmt(card.downpayment)}</td></tr>
    <tr><th>Tenure</th><td>${card.tenure} months</td></tr>
    <tr class="highlight"><th>Monthly EMI</th><td>${fmt(card.emi)}</td></tr>
    <tr><th>Total Amount Payable</th><td>${fmt(card.emi * card.tenure + card.downpayment)}</td></tr>
  </table>

  <h2>Terms & Conditions</h2>
  <p>This agreement is entered into between the borrower and ${card.lenderName} ("Lender") for the financing of the above product. The borrower agrees to repay the loan amount in equal monthly instalments (EMIs) as specified above. Late payment charges may apply as per the Lender's schedule of charges. The borrower authorises the Lender to initiate auto-debit via UPI AutoPay (e-NACH) for EMI collection. This agreement is governed by the laws of India and subject to jurisdiction of competent courts.</p>

  <div class="sig-block">
    <div class="sig-line">Borrower Signature</div>
    <div class="sig-line">${card.lenderName} Authorised Signatory</div>
  </div>

  <div class="footer">
    This is a system-generated loan agreement. For queries, contact support with Order ID ${card.orderId}.
    Powered by LMP &mdash; Lending Marketplace Platform.
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Loan_Agreement_${card.orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderRichCard = (card, idx) => {
    switch (card.type) {
      case 'category_grid':
        return (
          <div key={idx} className="rich-category-grid">
            {card.categories?.map(cat => (
              <button
                key={cat.id}
                className={`category-card ${!cat.available ? 'disabled' : ''}`}
                onClick={() => handleCategoryTap(cat)}
                disabled={!cat.available}
              >
                <div className="cat-icon">
                  {cat.id === 'smartphones' && (
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2.5"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  )}
                  {cat.id === 'laptops' && (
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 17h20m-14 4h8"/></svg>
                  )}
                  {cat.id === 'audio' && (
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z"/></svg>
                  )}
                  {cat.id === 'wearables' && (
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 2h6v4H9zM9 18h6v4H9z"/></svg>
                  )}
                </div>
                <span className="cat-label">{cat.label}</span>
                <span className="cat-desc">{cat.desc}</span>
              </button>
            ))}
          </div>
        );

      case 'product_grid':
        return (
          <div key={idx} className="rich-product-grid">
            {card.products?.map(product => (
              <ProductCard key={product.id} product={product} onTap={handleProductTap} />
            ))}
          </div>
        );

      case 'suggestion_chips':
        return (
          <div key={idx} className="rich-suggestion-chips">
            {card.suggestions?.map(s => (
              <button key={s} className="suggestion-chip" onClick={() => handleSuggestionTap(s)}>
                {s}
              </button>
            ))}
          </div>
        );

      case 'product_carousel':
        return card.products?.length > 0 ? (
          <ProductCarousel key={idx} products={card.products} onProductTap={handleProductTap} />
        ) : null;

      case 'product_detail':
        return card.product ? (
          <div key={idx} className="rich-detail-wrapper">
            <ProductCard product={card.product} />
          </div>
        ) : null;

      case 'offer_cards':
        return <OfferCard key={idx} offerData={card} onSelect={handleOfferSelect} />;

      case 'offer_detail_card': {
        const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
        const LENDER_COLORS = { fibe: '#6C5CE7', tvs: '#E74C3C', dmi: '#2980B9' };
        return (
          <div key={idx} className="rich-offer-detail-card">
            <div className="odc-header">
              <span className="odc-lender-logo" style={{ background: LENDER_COLORS[card.lenderId] || '#666' }}>
                {card.lenderName?.charAt(0)}
              </span>
              <div>
                <p className="odc-lender-name">{card.lenderName}</p>
                {card.noCost && <span className="odc-nocost-badge">No Cost EMI</span>}
              </div>
            </div>

            <div className="odc-grid">
              <div className="odc-cell"><span>Loan Amount</span><span>{fmt(card.loanAmount)}</span></div>
              <div className="odc-cell"><span>Down Payment</span><span>{fmt(card.downpayment)}</span></div>
              <div className="odc-cell odc-highlight"><span>Monthly EMI</span><span>{fmt(card.emi)}/mo</span></div>
              <div className="odc-cell"><span>Tenure</span><span>{card.tenure} months</span></div>
              <div className="odc-cell"><span>Interest Rate</span><span>{card.rate === 0 ? '0% (No Cost)' : `${card.rate}% p.a.`}</span></div>
              <div className="odc-cell"><span>Total Interest</span><span>{fmt(card.totalInterest)}</span></div>
              <div className="odc-cell odc-full"><span>Total Payable</span><span>{fmt(card.totalPayable + card.downpayment)}</span></div>
            </div>

            <button className="odc-proceed-btn" onClick={() => handleAction('confirm_offer')}>
              Proceed to KYC →
            </button>
          </div>
        );
      }

      case 'loan_summary': {
        const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
        return (
          <div key={idx} className="rich-loan-summary">
            <div className="rls-header">
              <span className="rls-lender">{card.lender}</span>
              <span className="rls-verified">Approved</span>
            </div>
            <div className="rls-grid">
              <div><span>Loan Amount</span><span>{fmt(card.loanAmount)}</span></div>
              <div><span>Monthly EMI</span><span>{fmt(card.emi)}/mo</span></div>
              <div><span>Tenure</span><span>{card.tenure} months</span></div>
              <div><span>Interest Rate</span><span>{card.rate === 0 ? 'No Cost EMI' : `${card.rate}% p.a.`}</span></div>
              <div><span>Down Payment</span><span>{fmt(card.downpayment)}</span></div>
              <div><span>Total Payable</span><span>{fmt(card.totalPayable)}</span></div>
            </div>
            <button
              className="rls-pay-btn"
              onClick={() => handleAction('initiate_payment')}
            >
              Pay Down Payment — {fmt(card.downpayment)}
            </button>
          </div>
        );
      }

      case 'eligibility_loader':
        return (
          <div key={idx} className="rich-eligibility-loader">
            <div className="rel-spinner"></div>
            <span>Checking eligibility with lenders...</span>
          </div>
        );

      case 'success_card': {
        const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
        return (
          <div key={idx} className="rich-success-card">
            <div className="rsc-confetti">
              <div className="rsc-checkmark">
                <svg width="36" height="36" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="rsc-title">Order Confirmed!</h2>
              <p className="rsc-order-id">Order ID: <strong>{card.orderId}</strong></p>
            </div>

            <div className="rsc-product">
              <div className="rsc-product-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2.5"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </div>
              <div>
                <p className="rsc-product-name">{card.product?.brand} {card.product?.model}</p>
                <p className="rsc-delivery">Estimated delivery: <strong>{card.estimatedDelivery}</strong></p>
              </div>
            </div>

            <div className="rsc-loan-grid">
              <div><span>Lender</span><span>{card.lenderName}</span></div>
              <div><span>Loan Amount</span><span>{fmt(card.loanAmount)}</span></div>
              <div><span>Monthly EMI</span><span>{fmt(card.emi)}</span></div>
              <div><span>Tenure</span><span>{card.tenure} months</span></div>
            </div>

            <button
              className="rsc-download-btn"
              onClick={() => downloadLoanAgreement(card)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Loan Agreement
            </button>

            <p className="rsc-support">For queries, quote <strong>{card.orderId}</strong> to support.</p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const downpaymentAmount = selectedProduct ? Math.round(selectedProduct.price * 0.1) : 0;

  // ===== Welcome Screen =====
  if (screen === 'welcome') {
    return (
      <div className={`welcome-screen ${welcomeFading ? 'fading' : ''}`}>
        <div className="welcome-bg-orbs">
          <div className="welcome-orb orb-1" />
          <div className="welcome-orb orb-2" />
          <div className="welcome-orb orb-3" />
        </div>

        <div className="welcome-content">
          <div className="welcome-greeting-container">
            <h1 className="welcome-greeting" key={greetingIdx}>
              {GREETINGS[greetingIdx]}
            </h1>
          </div>

          <p className="welcome-subtitle">
            Your personal store assistant
          </p>

          <div className="welcome-features">
            <div className="welcome-feature">
              <div className="wf-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
              </div>
              <div className="wf-text">
                <span className="wf-title">Browse Products</span>
                <span className="wf-desc">Latest products at best prices</span>
              </div>
            </div>
            <div className="welcome-feature">
              <div className="wf-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div className="wf-text">
                <span className="wf-title">Conversational EMIs</span>
                <span className="wf-desc">No forms, just a conversation</span>
              </div>
            </div>
            <div className="welcome-feature">
              <div className="wf-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="wf-text">
                <span className="wf-title">Instant Approval</span>
                <span className="wf-desc">Get loan offers in minutes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-bottom">
          <button className="welcome-start-btn" onClick={startChat}>
            <span>Get Started</span>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
          </button>
          <p className="welcome-hint">Powered by Juspay</p>
        </div>
      </div>
    );
  }

  // ===== Chat Screen =====
  return (
    <div className="chat-screen">
      <div className="chat-bg-orbs">
        <div className="welcome-orb orb-1" />
        <div className="welcome-orb orb-2" />
        <div className="welcome-orb orb-3" />
      </div>

      {/* Header */}
      <header className="cs-header">
        <div className="cs-header-left">
          <div className="cs-logo">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10a10 10 0 01-8.7-5"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9.5" r="0.5" fill="currentColor"/><circle cx="15" cy="9.5" r="0.5" fill="currentColor"/></svg>
          </div>
          <span className="cs-title">Store</span>
        </div>
        <div className="cs-header-center">
          <ProgressIndicator current={progress} />
        </div>
        <div className="cs-header-right">
          <button
            className="cs-cart-btn"
            onClick={handleViewCart}
            title="View Cart"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          {speechSupported && synthSupported && (
            <button
              className={`cs-voice-toggle ${voiceMode ? 'active' : ''}`}
              onClick={toggleVoice}
              title={voiceMode ? 'Turn off voice' : 'Turn on voice'}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={messagesContainerRef} className="cs-messages">
        {messages.map((msg, i) => {
          const isBrowseMsg = msg.richCards?.some(c => c.type === 'category_grid' || c.type === 'product_grid');
          return (
            <div key={i} className={`cs-message ${msg.role} ${isBrowseMsg ? 'browse-layout' : ''}`}>
              <div className={`cs-bubble ${isBrowseMsg ? 'browse-heading' : ''}`}>
                <p>{msg.content}</p>
              </div>
              {msg.role === 'assistant' && msg.richCards?.map((card, ci) => renderRichCard(card, ci))}
            </div>
          );
        })}
        {isLoading && (
          <div className="cs-message assistant">
            <div className="cs-bubble">
              <div className="cs-typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form className="cs-input-bar" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="cs-input"
          placeholder={browseCategory ? `Search ${browseCategory}...` : voiceMode ? 'Voice mode active — speak or type...' : 'Message...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
        />
        {speechSupported && synthSupported && (
          <button
            type="button"
            className={`cs-mic ${voiceMode ? 'active' : ''} ${isListening ? 'listening' : ''}`}
            onClick={toggleVoice}
            disabled={isLoading}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        )}
        <button type="submit" className="cs-send" disabled={isLoading || !input.trim()}>
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9 22 2z"/></svg>
        </button>
      </form>

      {/* Overlays */}
      <ConsentOverlay
        isOpen={activeOverlay === 'consent'}
        onClose={null}
        lenders={['Fibe', 'TVS Credit', 'DMI Finance']}
        onConsented={async (consents) => {
          setActiveOverlay(null);
          // Show eligibility loader in chat
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Checking your eligibility with lenders, hang tight...',
            richCards: [{ type: 'eligibility_loader' }],
            timestamp: Date.now(),
          }]);
          setProgress(3);
          // Call backend with consent_given action
          try {
            const res = await fetch(`${API_BASE}/action`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: sessionIdRef.current, action: 'consent_given', data: { consents } }),
            });
            const data = await res.json();
            // Wait for visual effect then replace loader with offers
            await new Promise(resolve => setTimeout(resolve, 2500));
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: data.text, richCards: data.richCards || [], timestamp: Date.now() },
            ]);
            setJourneyState(data.journeyState);
            setProgress(data.progress);
            if (data.selectedProduct) setSelectedProduct(data.selectedProduct);
          } catch (err) {
            console.error('Consent action error:', err);
          }
        }}
      />
      <AadhaarOTPOverlay
        isOpen={activeOverlay === 'aadhaar'}
        onClose={() => setActiveOverlay(null)}
        onVerified={(data) => {
          setActiveOverlay(null);
          handleAction('aadhaar_verified', data);
        }}
      />
      <UPIPaymentOverlay
        isOpen={activeOverlay === 'payment'}
        onClose={() => setActiveOverlay(null)}
        onPaymentDone={() => {
          setActiveOverlay(null);
          handleAction('payment_done');
        }}
        amount={downpaymentAmount}
        productName={selectedProduct ? `${selectedProduct.brand} ${selectedProduct.model}` : 'Product'}
      />
      <MandateOverlay
        isOpen={activeOverlay === 'mandate'}
        onClose={() => setActiveOverlay(null)}
        emi={loanData?.emi}
        lenderName={loanData?.lender}
        onMandateSet={() => {
          setActiveOverlay(null);
          handleAction('repayment_setup');
        }}
      />
      <KFSPreviewOverlay
        isOpen={activeOverlay === 'kfs'}
        onClose={() => setActiveOverlay(null)}
        onAccepted={() => {
          setActiveOverlay(null);
          handleAction('kfs_accepted');
        }}
        loanData={loanData}
      />

      {/* Product Detail Popup with Location */}
      {showProductPopup && popupProduct && (
        <ProductDetailPopup
          product={popupProduct}
          onClose={() => setShowProductPopup(false)}
          onExploreEMI={handleExploreEMI}
          onProductTap={(p) => {
            setPopupProduct(p);
          }}
          onAddToCart={addToCart}
          cartCount={cartCount}
          onViewCart={handleViewCart}
        />
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <CartModal
          cart={cart}
          cartSessionId={cartSessionId}
          onClose={() => setShowCartModal(false)}
          onUpdate={updateCartState}
        />
      )}
    </div>
  );
};

// ===== Product Detail Popup Component =====
const ProductDetailPopup = ({ product, onClose, onExploreEMI, onProductTap, onAddToCart, cartCount, onViewCart }) => {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(product.default_storage || product.storage_options?.[0]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const color = product.colors[selectedColor];
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  // Get recommended products
  const recommendations = getSemanticRecommendations(product.id, 3);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await onAddToCart(product, color, selectedStorage);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="chat-product-popup-overlay" onClick={onClose}>
      <div className="chat-product-popup" onClick={(e) => e.stopPropagation()}>
        <button className="cpp-close" onClick={onClose}>✕</button>

        {/* Cart Button */}
        <button className="cpp-cart-button" onClick={onViewCart} title="View Cart">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && <span className="cpp-cart-badge">{cartCount}</span>}
        </button>

        <div className="cpp-header">
          <h2>{product.brand} {product.model}</h2>
          <span className="cpp-device-code">{product.device_code}</span>
        </div>

        <div className="cpp-price-row">
          <span className="cpp-price">{formatCurrency(product.price)}</span>
          {discount > 0 && (
            <>
              <span className="cpp-mrp">{formatCurrency(product.mrp)}</span>
              <span className="cpp-discount">{discount}% off</span>
            </>
          )}
        </div>

        {/* Color Selection */}
        <div className="cpp-section">
          <h4>Colour — <span className="cpp-color-name">{color.name}</span></h4>
          <div className="cpp-color-options">
            {product.colors.map((c, i) => (
              <button
                key={i}
                className={`cpp-color-swatch ${i === selectedColor ? 'selected' : ''}`}
                style={{ background: c.hex }}
                onClick={() => setSelectedColor(i)}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Storage Selection */}
        <div className="cpp-section">
          <h4>Storage</h4>
          <div className="cpp-storage-options">
            {product.storage_options?.map(s => (
              <button
                key={s}
                className={`cpp-storage-btn ${s === selectedStorage ? 'selected' : ''}`}
                onClick={() => setSelectedStorage(s)}
              >
                {s >= 1024 ? `${s/1024} TB` : `${s} GB`}
              </button>
            ))}
          </div>
        </div>

        <div className="cpp-section">
          <h4>Key Specifications</h4>
          <div className="cpp-specs-grid">
            {product.display && (
              <div className="cpp-spec">
                <span className="spec-label">Display</span>
                <span className="spec-value">{product.display.size_inch}" {product.display.type}</span>
              </div>
            )}
            {product.hardware?.chipset && (
              <div className="cpp-spec">
                <span className="spec-label">Processor</span>
                <span className="spec-value">{product.hardware.chipset}</span>
              </div>
            )}
            {product.hardware?.ram_gb && (
              <div className="cpp-spec">
                <span className="spec-label">RAM</span>
                <span className="spec-value">{product.hardware.ram_gb} GB</span>
              </div>
            )}
            {selectedStorage && (
              <div className="cpp-spec">
                <span className="spec-label">Storage</span>
                <span className="spec-value">{selectedStorage} GB</span>
              </div>
            )}
            {product.hardware?.battery_mah && (
              <div className="cpp-spec">
                <span className="spec-label">Battery</span>
                <span className="spec-value">{product.hardware.battery_mah} mAh</span>
              </div>
            )}
            {product.camera && (
              <div className="cpp-spec">
                <span className="spec-label">Camera</span>
                <span className="spec-value">{product.camera}</span>
              </div>
            )}
          </div>
        </div>

        <div className="cpp-section">
          <h4>Store Location</h4>
          <div className="cpp-location-card">
            <div className="cpp-location-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="cpp-location-details">
              <div className="cpp-location-floor">{product.location?.floor || 'Ground Floor'}</div>
              <div className="cpp-location-section">{product.location?.section || 'Mobile Zone'}</div>
              <div className="cpp-location-aisle">
                Aisle {product.location?.aisle || 'A1'} • {product.location?.shelf || 'Shelf 1'}
              </div>
              <div className="cpp-location-label">{product.location?.shelfLabel || 'Smartphones'}</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="cpp-section cpp-recommendations">
            <h4>You May Also Like</h4>
            <div className="cpp-rec-grid">
              {recommendations.map((rec) => {
                const recDiscount = rec.mrp ? Math.round(((rec.mrp - rec.price) / rec.mrp) * 100) : 0;
                return (
                  <div
                    key={rec.id}
                    className="cpp-rec-card"
                    onClick={() => onProductTap(rec)}
                  >
                    <div className="cpp-rec-image" style={{ background: rec.colors[0]?.image_bg || '#f0f0f0' }}>
                      <span className="cpp-rec-brand">{rec.brand}</span>
                    </div>
                    <div className="cpp-rec-info">
                      <span className="cpp-rec-name">{rec.brand} {rec.model}</span>
                      <span className="cpp-rec-price">{formatCurrency(rec.price)}</span>
                      {recDiscount > 0 && <span className="cpp-rec-discount">{recDiscount}% off</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="cpp-highlights">
          {(product.highlights || []).slice(0, 3).map((h, i) => (
            <span key={i} className="cpp-highlight-tag">{h}</span>
          ))}
        </div>

        <div className="cpp-actions">
          <button
            className={`cpp-btn-cart ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <span className="cpp-btn-spinner"></span>
            ) : addedToCart ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Added to Cart
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Add to Cart
              </>
            )}
          </button>
          <button className="cpp-btn-primary" onClick={onExploreEMI}>
            Explore EMI Options
          </button>
          <button className="cpp-btn-secondary" onClick={onClose}>
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Cart Modal Component =====
const CartModal = ({ cart, cartSessionId, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState({});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRemove = async (item) => {
    setUpdating({ [item.id]: true });
    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: cartSessionId,
          productId: item.id,
          storage: item.storage,
          color: item.color,
        })
      });
      const data = await res.json();
      onUpdate(data);
    } catch (err) {
      console.error('Remove item error:', err);
    }
    setUpdating({});
  };

  const handleUpdateQty = async (item, newQty) => {
    if (newQty < 1) {
      handleRemove(item);
      return;
    }
    setUpdating({ [item.id]: true });
    try {
      const res = await fetch('/api/cart/update-qty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: cartSessionId,
          productId: item.id,
          storage: item.storage,
          color: item.color,
          qty: newQty,
        })
      });
      const data = await res.json();
      onUpdate(data);
    } catch (err) {
      console.error('Update quantity error:', err);
    }
    setUpdating({});
  };

  const total = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const savings = cart.reduce((sum, item) => sum + ((item.mrp - item.price) * (item.qty || 1)), 0);

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Your Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h2>
          <button className="cart-close-btn" onClick={onClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              {cart.map((item, idx) => (
                <div key={idx} className="cart-item">
                  <div 
                    className="cart-item-image" 
                    style={{ background: item.image_bg || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    <span className="cart-item-brand">{item.brand}</span>
                  </div>
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <div className="cart-item-specs">
                      <span className="cart-item-color">
                        <span className="color-dot" style={{ background: item.color_hex }}></span>
                        {item.color}
                      </span>
                      {item.storage && <span className="cart-item-storage">{item.storage}GB</span>}
                    </div>
                    <div className="cart-item-pricing">
                      <span className="cart-item-price">{formatCurrency(item.price)}</span>
                      {item.mrp > item.price && (
                        <span className="cart-item-mrp">{formatCurrency(item.mrp)}</span>
                      )}
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-item-qty-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => handleUpdateQty(item, (item.qty || 1) - 1)}
                        disabled={updating[item.id]}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                      <span className="qty-display">{item.qty || 1}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => handleUpdateQty(item, (item.qty || 1) + 1)}
                        disabled={updating[item.id]}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {savings > 0 && (
                  <div className="cart-summary-row savings">
                    <span>You Save</span>
                    <span>-{formatCurrency(savings)}</span>
                  </div>
                )}
                <div className="cart-summary-row total">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button className="cart-continue-btn" onClick={onClose}>
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
