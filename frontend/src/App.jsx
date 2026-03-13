import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMerchantTheme } from './themes/merchantThemes';
import PaymentPage from './components/PaymentPage';
import Chatbot from './components/Chatbot';
import catalogue, { getProductById, getSimilarProducts, getSemanticRecommendations, compareSpecs } from './data/catalogue';
import './App.css';

const sampleData = {
  request_id: "REQ-CHR-20260313-0001",
  merchant: {
    merchant_id: "CHR_MKT_1001",
    merchant_name: "Croma",
    merchant_category: "online_marketplace",
    channel: "web",
    source: "chrome_browser"
  },
  product_id: 'samsung-galaxy-s26',
  loan_request: {
    amount: 129999,
    currency: "INR",
    tenure_months: 24,
    purpose: "electronics_purchase"
  },
  campaign: {
    campaign_id: "WEB_QR_2026",
    utm_source: "chrome",
    utm_medium: "qr",
    utm_campaign: "loan_marketplace"
  },
  timestamp: "2026-03-13T10:30:00Z"
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  Object.entries({
    '--primary': theme.primary,
    '--primary-dark': theme.primaryDark,
    '--secondary': theme.secondary,
    '--accent': theme.accent,
    '--error': theme.error,
    '--background': theme.background,
    '--surface': theme.surface,
    '--text': theme.text,
    '--text-secondary': theme.textSecondary,
    '--gradient': theme.gradient,
  }).forEach(([k, v]) => root.style.setProperty(k, v));
};

// Phone SVG illustration component
const PhoneImage = ({ color, brand, size = 'large' }) => {
  const w = size === 'large' ? 180 : 60;
  const h = size === 'large' ? 360 : 120;
  const r = size === 'large' ? 28 : 10;
  const p = size === 'large' ? 8 : 3;
  const ir = size === 'large' ? 22 : 8;
  const fs = size === 'large' ? 48 : 16;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`screen-${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={w} height={h} rx={r} fill="#1a1a2e" />
      <rect x={p} y={p} width={w-p*2} height={h-p*2} rx={ir} fill={`url(#screen-${color.replace('#','')})`} />
      <text x={w/2} y={h/2} textAnchor="middle" dominantBaseline="central"
        fontSize={fs} fontWeight="800" fill="rgba(255,255,255,0.25)" fontFamily="system-ui">
        {brand?.[0] || '?'}
      </text>
    </svg>
  );
};

function App() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(() => sessionStorage.getItem('checkout_active') === 'true');
  const [showChat, setShowChat] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [compareWith, setCompareWith] = useState(null);
  // Sync checkout state with sessionStorage
  const setShowPaymentPersisted = (val) => {
    setShowPayment(val);
    if (val) sessionStorage.setItem('checkout_active', 'true');
    else sessionStorage.removeItem('checkout_active');
  };

  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartSessionId, setCartSessionId] = useState(() => sessionStorage.getItem('cart_session_id'));
  const [showCart, setShowCart] = useState(false);

  const [aiReasons, setAiReasons] = useState({});
  const [reasonsLoading, setReasonsLoading] = useState(false);

  // Sync cart session ID to sessionStorage
  const updateCartState = useCallback((data) => {
    setCart(data.cart);
    setCartCount(data.cartCount);
    setCartTotal(data.cartTotal);
    if (data.sessionId) {
      setCartSessionId(data.sessionId);
      sessionStorage.setItem('cart_session_id', data.sessionId);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    if (cartSessionId) {
      fetch(`/api/cart/${cartSessionId}`)
        .then(r => r.json())
        .then(updateCartState)
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isInCart = (productId, colorName, storageVal) => {
    return cart.some(item => item.id === productId && item.color === colorName && item.storage === storageVal);
  };

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
  }, [cartSessionId, updateCartState]);

  const removeFromCart = useCallback(async (item) => {
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
    updateCartState(data);
  }, [cartSessionId, updateCartState]);

  const updateQty = useCallback(async (item, qty) => {
    const res = await fetch('/api/cart/update-qty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: cartSessionId,
        productId: item.id,
        storage: item.storage,
        color: item.color,
        qty,
      })
    });
    const data = await res.json();
    updateCartState(data);
  }, [cartSessionId, updateCartState]);

  useEffect(() => {
    // Reset selections when product changes
    setSelectedColor(0);
    setSelectedStorage(null);
    setCompareWith(null);
    setAiReasons({});
    window.scrollTo(0, 0);

    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    if (encodedData) {
      try { setData(JSON.parse(atob(encodedData))); } catch { setData(sampleData); }
    } else {
      // Use product ID from URL route, or fall back to default
      setData({ ...sampleData, product_id: productId || sampleData.product_id });
    }
  }, [productId]);

  useEffect(() => {
    if (data) {
      const merchantTheme = getMerchantTheme(data.merchant?.merchant_id);
      setTheme(merchantTheme);
      applyTheme(merchantTheme);
      setLoading(false);
    }
  }, [data]);

  // Fetch AI reasons for recommendations (lightweight call)
  useEffect(() => {
    if (loading || !data) return;
    const prod = catalogue.find(p => p.id === data.product_id) || catalogue[0];
    const recs = getSemanticRecommendations(prod.id, 4);
    if (!recs.length) return;

    setReasonsLoading(true);
    fetch('/api/chat/recommendation-reasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: `${prod.brand} ${prod.model}`,
        recommendations: recs.map(r => `${r.brand} ${r.model}`)
      })
    })
      .then(r => r.json())
      .then(d => { if (d.reasons) setAiReasons(d.reasons); })
      .catch(() => {})
      .finally(() => setReasonsLoading(false));
  }, [loading, data]);

  if (loading || !data || !theme) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // Get product from catalogue
  const product = catalogue.find(p => p.id === data.product_id) || catalogue[0];
  const similar = getSimilarProducts(product.id, 4);
  const aiRecs = getSemanticRecommendations(product.id, 4);
  const storage = selectedStorage || product.default_storage;
  const color = product.colors[selectedColor];
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const emi = Math.round(product.price / 24);

  if (showPayment) {
    return (
      <>
        <PaymentPage data={{ ...data, product_name: `${product.brand} ${product.model}`, loan_request: { ...data.loan_request, amount: product.price } }} theme={theme} onBack={() => setShowPaymentPersisted(false)} onOrderComplete={() => {
          // Clear cart on successful order
          if (cartSessionId) {
            fetch(`/api/cart/${cartSessionId}`, { method: 'DELETE' })
              .then(r => r.json())
              .then(updateCartState)
              .catch(() => {});
          }
        }} />
        {!showChat && (
          <button className="ai-fab" onClick={() => setShowChat(true)}>
            <span className="ai-fab-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </span>
            <span className="ai-fab-label">AI</span>
            <span className="ai-fab-pulse"></span>
          </button>
        )}
        <Chatbot isOpen={showChat} onClose={() => setShowChat(false)} />
      </>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Top Nav */}
      <nav className="top-nav">
        <div className="nav-inner">
          <div className="nav-logo">{data.merchant.merchant_name}</div>
          <div className="nav-actions">
            <button className="nav-icon-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            <button className="nav-icon-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button className="nav-icon-btn cart-btn" onClick={() => setShowCart(true)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Home</span> <span className="sep">/</span>
          <span>Mobiles</span> <span className="sep">/</span>
          <span>{product.brand}</span> <span className="sep">/</span>
          <span className="current">{product.model}</span>
        </div>

        <div className="product-layout">
          {/* Left: Product Image */}
          <div className="product-gallery">
            <div className="gallery-main" style={{ background: color.image_bg }}>
              <PhoneImage color={color.hex} brand={product.brand} size="large" />
            </div>
            <div className="gallery-thumbs">
              {product.colors.map((c, i) => (
                <div
                  key={i}
                  className={`thumb ${i === selectedColor ? 'active' : ''}`}
                  onClick={() => setSelectedColor(i)}
                  style={{ background: c.image_bg, cursor: 'pointer' }}
                >
                  <PhoneImage color={c.hex} brand={product.brand} size="small" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="product-details">
            <div className="product-title-section">
              <h1 className="product-title">{product.brand} {product.model}</h1>
              <p className="product-subtitle">{product.device_code} | {product.hardware.ram_gb}GB RAM | {storage}GB Storage</p>
              <div className="product-rating">
                <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
                <span className="rating-count">{product.rating} ({product.rating_count.toLocaleString()} ratings)</span>
              </div>
            </div>

            <div className="price-section">
              <div className="price-row">
                <span className="current-price">{formatCurrency(product.price)}</span>
                <span className="original-price">{formatCurrency(product.mrp)}</span>
                <span className="discount-badge">{discount}% OFF</span>
              </div>
              <p className="emi-info">EMI from {formatCurrency(emi)}/month</p>
              <p className="tax-info">Inclusive of all taxes</p>
            </div>

            {/* Highlights */}
            {product.highlights && (
              <div className="highlights-section">
                <h3 className="option-label">Highlights</h3>
                <ul className="highlights-list">
                  {product.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}

            {/* Color Options */}
            <div className="option-section">
              <h3 className="option-label">Colour — <span className="color-name">{color.name}</span></h3>
              <div className="color-options">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    className={`color-swatch ${i === selectedColor ? 'selected' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => setSelectedColor(i)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Storage Options */}
            <div className="option-section">
              <h3 className="option-label">Storage</h3>
              <div className="variant-options">
                {product.storage_options.map(s => (
                  <button
                    key={s}
                    className={`variant-btn ${s === storage ? 'selected' : ''}`}
                    onClick={() => setSelectedStorage(s)}
                  >
                    {s >= 1024 ? `${s/1024} TB` : `${s} GB`}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Specs */}
            <div className="key-specs">
              <h3 className="option-label">Key Specifications</h3>
              <div className="specs-grid">
                <div className="spec-card">
                  <div className="spec-card-icon">
                    <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  </div>
                  <div className="spec-card-label">Display</div>
                  <div className="spec-card-value">{product.display.size_inch}" {product.display.type}</div>
                </div>
                <div className="spec-card">
                  <div className="spec-card-icon">
                    <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <div className="spec-card-label">Processor</div>
                  <div className="spec-card-value">{product.hardware.chipset}</div>
                </div>
                <div className="spec-card">
                  <div className="spec-card-icon">
                    <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="6" width="22" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></svg>
                  </div>
                  <div className="spec-card-label">Battery</div>
                  <div className="spec-card-value">{product.hardware.battery_mah} mAh</div>
                </div>
                <div className="spec-card">
                  <div className="spec-card-icon">
                    <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-3.64-6.36l-1.42 1.42M6.34 17.66l-1.42 1.42m0-12.73l1.42 1.42m11.32 11.32l1.42 1.42"/></svg>
                  </div>
                  <div className="spec-card-label">Camera</div>
                  <div className="spec-card-value">{product.camera}</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="feature-tags">
              {product.network['5g_supported'] && <span className="feature-tag">5G</span>}
              {product.network.nfc && <span className="feature-tag">NFC</span>}
              <span className="feature-tag">{product.network.wifi}</span>
              <span className="feature-tag">{product.os.platform} {product.os.version}</span>
              <span className="feature-tag">{product.os.ui}</span>
            </div>

            {/* Action Buttons */}
            <div className="action-row">
              {isInCart(product.id, color.name, storage) ? (
                <button
                  className="btn-add-cart added"
                  onClick={() => removeFromCart({ id: product.id, color: color.name, storage })}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  Added — Remove
                </button>
              ) : (
                <button
                  className="btn-add-cart"
                  onClick={() => addToCart(product, color, storage)}
                >
                  Add to Cart
                </button>
              )}
              <button className="btn-buy-now" onClick={() => setShowPaymentPersisted(true)}>Buy Now</button>
            </div>

          </div>
        </div>

        {/* AI Recommendations */}
        <div className="ai-recs-section">
          <div className="ai-recs-header">
            <div>
              <h2 className="ai-recs-title">
                <span className="ai-recs-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4a2 2 0 01-2-2 4 4 0 014-4z"/><path d="M8 8v8a4 4 0 008 0V8"/><path d="M6 12h12"/></svg>
                </span>
                AI Picks for You
              </h2>
              <p className="ai-recs-subtitle">Recommended based on design, aesthetics & audience — powered by AI</p>
            </div>
          </div>
          <div className="ai-recs-grid">
            {aiRecs.map((rec, idx) => {
              const d = Math.round(((rec.mrp - rec.price) / rec.mrp) * 100);
              return (
                <div key={rec.id} className="ai-rec-card" onClick={() => navigate(`/product/${rec.id}`)}>
                  <div className="ai-rec-rank">#{idx + 1}</div>
                  <div className="ai-rec-image" style={{ background: rec.colors[0].image_bg }}>
                    <PhoneImage color={rec.colors[0].hex} brand={rec.brand} size="small" />
                  </div>
                  <div className="ai-rec-info">
                    <div className="ai-rec-name-row">
                      <h4 className="ai-rec-name">{rec.brand} {rec.model}</h4>
                      <span className="ai-rec-score">{rec.semanticScore}%</span>
                    </div>
                    <p className="ai-rec-reason">
                      {(() => {
                        const name = `${rec.brand} ${rec.model}`;
                        const exact = aiReasons[name];
                        if (exact) return exact;
                        // Fuzzy match — find key that contains brand or model
                        const fuzzy = Object.entries(aiReasons).find(([k]) =>
                          k.toLowerCase().includes(rec.model.toLowerCase()) ||
                          name.toLowerCase().includes(k.toLowerCase())
                        );
                        return fuzzy ? fuzzy[1] : rec.reason;
                      })()}
                      {reasonsLoading && !Object.keys(aiReasons).length && <span className="reason-loading"> ...</span>}
                    </p>
                    <div className="ai-rec-price-row">
                      <span className="ai-rec-price">{formatCurrency(rec.price)}</span>
                      {d > 0 && <span className="ai-rec-discount">{d}% off</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compare with Similar Products */}
        <div className="similar-section">
          <h2 className="similar-title">Similar Phones</h2>
          <p className="similar-subtitle">Ranked by spec similarity</p>
          <div className="similar-grid">
            {similar.map(p => {
              const d = Math.round(((p.mrp - p.price) / p.mrp) * 100);
              const isComparing = compareWith?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`similar-card ${isComparing ? 'active' : ''}`}
                >
                  <div
                    className="similar-image"
                    style={{ background: p.colors[0].image_bg, cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <PhoneImage color={p.colors[0].hex} brand={p.brand} size="small" />
                  </div>
                  <div className="similar-info">
                    <div className="similar-name-row">
                      <h4
                        className="similar-name"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${p.id}`)}
                      >
                        {p.brand} {p.model}
                      </h4>
                      <span className="similarity-badge">{p.similarity}% match</span>
                    </div>
                    <div className="similar-specs">
                      {p.hardware.ram_gb}GB | {p.display.size_inch}" | {p.hardware.battery_mah}mAh
                    </div>
                    <div className="similar-price-row">
                      <span className="similar-price">{formatCurrency(p.price)}</span>
                      {d > 0 && <span className="similar-discount">{d}% off</span>}
                    </div>
                    <div className="similar-rating">
                      <span className="stars-sm">{'★'.repeat(Math.floor(p.rating))}</span>
                      <span>{p.rating}</span>
                    </div>
                    <button className="compare-cta" onClick={() => setCompareWith(isComparing ? null : p)}>
                      {isComparing ? 'Hide comparison' : 'Compare specs'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spec Comparison Table */}
          {compareWith && (
            <div className="compare-table-wrapper">
              <div className="compare-table-header">
                <h3>Spec Comparison</h3>
                <button className="compare-close" onClick={() => setCompareWith(null)}>✕</button>
              </div>
              <div className="compare-table">
                <div className="compare-row compare-row-header">
                  <span className="compare-label">Spec</span>
                  <span className="compare-val-a">{product.brand} {product.model}</span>
                  <span className="compare-val-b">{compareWith.brand} {compareWith.model}</span>
                </div>
                {compareSpecs(product, compareWith).map(spec => (
                  <div key={spec.key} className={`compare-row ${spec.winner !== 'tie' ? 'has-winner' : ''}`}>
                    <span className="compare-label">{spec.label}</span>
                    <span className={`compare-val-a ${spec.winner === 'a' ? 'winner' : ''}`}>{spec.a}</span>
                    <span className={`compare-val-b ${spec.winner === 'b' ? 'winner' : ''}`}>{spec.b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Full Specifications */}
        <div className="full-specs">
          <h2 className="full-specs-title">All Specifications</h2>
          <div className="spec-table">
            <div className="spec-group">
              <h4 className="spec-group-title">Hardware</h4>
              <div className="spec-row"><span>Chipset</span><span>{product.hardware.chipset}</span></div>
              <div className="spec-row"><span>CPU</span><span>{product.hardware.cpu}</span></div>
              <div className="spec-row"><span>GPU</span><span>{product.hardware.gpu}</span></div>
              <div className="spec-row"><span>RAM</span><span>{product.hardware.ram_gb} GB</span></div>
              <div className="spec-row"><span>Storage</span><span>{storage} GB</span></div>
              <div className="spec-row"><span>Battery</span><span>{product.hardware.battery_mah} mAh</span></div>
            </div>
            <div className="spec-group">
              <h4 className="spec-group-title">Display</h4>
              <div className="spec-row"><span>Type</span><span>{product.display.type}</span></div>
              <div className="spec-row"><span>Size</span><span>{product.display.size_inch} inches</span></div>
              <div className="spec-row"><span>Resolution</span><span>{product.display.resolution}</span></div>
              <div className="spec-row"><span>Refresh Rate</span><span>{product.display.refresh_rate_hz} Hz</span></div>
            </div>
            <div className="spec-group">
              <h4 className="spec-group-title">Camera</h4>
              <div className="spec-row"><span>Rear Camera</span><span>{product.camera}</span></div>
            </div>
            <div className="spec-group">
              <h4 className="spec-group-title">Software & Connectivity</h4>
              <div className="spec-row"><span>OS</span><span>{product.os.platform} {product.os.version} ({product.os.ui})</span></div>
              <div className="spec-row"><span>SIM</span><span>{product.network.sim_type}</span></div>
              <div className="spec-row"><span>WiFi</span><span>{product.network.wifi}</span></div>
              <div className="spec-row"><span>Bluetooth</span><span>{product.network.bluetooth}</span></div>
              <div className="spec-row"><span>5G</span><span>{product.network['5g_supported'] ? 'Yes' : 'No'}</span></div>
              <div className="spec-row"><span>NFC</span><span>{product.network.nfc ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      <div className={`cart-backdrop ${showCart ? 'visible' : ''}`} onClick={() => setShowCart(false)} />
      <div className={`cart-drawer ${showCart ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Your Cart {cartCount > 0 && <span className="cart-header-count">{cartCount} item{cartCount > 1 ? 's' : ''}</span>}</h3>
          <button className="cart-drawer-close" onClick={() => setShowCart(false)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <p>Your cart is empty</p>
            <span>Browse products and add items to get started</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, i) => {
                const itemDiscount = item.mrp ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
                return (
                  <div key={`${item.id}-${item.storage}-${item.color}-${i}`} className="cart-item">
                    <div className="cart-item-image" style={{ background: item.image_bg || '#f0f0f0' }}>
                      <PhoneImage color={item.color_hex || '#888'} brand={item.brand} size="small" />
                    </div>
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <span className="cart-item-variant">{item.color} / {item.storage >= 1024 ? `${item.storage/1024} TB` : `${item.storage} GB`}</span>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price">{formatCurrency(item.price)}</span>
                        {itemDiscount > 0 && <span className="cart-item-discount">{itemDiscount}% off</span>}
                      </div>
                      <div className="cart-item-qty">
                        <button onClick={() => updateQty(item, item.qty - 1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item, item.qty + 1)}>+</button>
                      </div>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item)}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Total</span>
                <span className="cart-total-price">{formatCurrency(cartTotal)}</span>
              </div>
              <button className="cart-checkout-btn" onClick={() => { setShowCart(false); setShowPaymentPersisted(true); }}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      <footer className="site-footer">
        <p>{data.merchant.merchant_name} &copy; 2026. All rights reserved.</p>
      </footer>

      {/* Floating AI Chat Button */}
      {!showChat && (
        <button className="ai-fab" onClick={() => setShowChat(true)}>
          <span className="ai-fab-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </span>
          <span className="ai-fab-label">AI</span>
          <span className="ai-fab-pulse"></span>
        </button>
      )}

      {/* AI Chat Side Panel */}
      <Chatbot isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
}

export default App;
