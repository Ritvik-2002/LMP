import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import catalogue from '../data/catalogue';
import './QRCodes.css';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const QRCodes = () => {
  const navigate = useNavigate();
  const [baseUrl] = useState('https://8cb3-103-159-11-202.ngrok-free.app');
  const [scanning, setScanning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const product = catalogue[currentIndex];
  const url = `${baseUrl}/product/${product.id}`;
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleScanSimulation = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      navigate('/chat');
    }, 1200);
  };

  const handleProductClick = (e) => {
    e.stopPropagation();
    setShowPopup(true);
  };

  const goPrev = () => setCurrentIndex((i) => (i - 1 + catalogue.length) % catalogue.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % catalogue.length);

  return (
    <div className="qr-page">
      {/* Scan overlay */}
      {scanning && (
        <div className="scan-overlay">
          <div className="scan-animation">
            <div className="scan-phone">
              <svg width="48" height="48" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <div className="scan-beam"></div>
            <p className="scan-text">QR Scanned — Loading product...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="qr-nav">
        <div className="qr-nav-inner">
          <div className="qr-nav-brand">
            <span className="qr-nav-logo">Croma</span>
            <span className="qr-nav-tag">Smart Shelf Display</span>
          </div>
          <div className="qr-nav-actions">
            <span className="qr-product-counter">{currentIndex + 1} / {catalogue.length}</span>
            <button className="qr-print-btn" onClick={() => window.print()}>
              Print Label
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="qr-hero">
        <h1 className="qr-hero-title">Scan to explore this product</h1>
        <p className="qr-hero-desc">Get full specs, AI-powered recommendations, comparisons & instant EMI options</p>
        <p className="qr-hero-demo">Demo: Click the QR code to simulate a scan</p>
      </div>

      {/* Single Product Card */}
      <div className="qr-single-wrapper">
        <button className="qr-arrow qr-arrow-left" onClick={goPrev}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div
          className={`qr-card ${scanning ? 'scanning' : ''}`}
        >
          <div className="qr-card-header" onClick={handleProductClick}>
            <div>
              <h3>{product.brand} {product.model}</h3>
              <span className="qr-card-specs">
                {product.hardware.ram_gb}GB | {product.display.size_inch}" | {product.hardware.battery_mah}mAh
              </span>
            </div>
            <div className="qr-card-pricing">
              <span className="qr-card-price">{formatPrice(product.price)}</span>
              {discount > 0 && <span className="qr-card-discount">{discount}% off</span>}
            </div>
          </div>
          <div className="qr-code-container" onClick={handleScanSimulation}>
            <QRCodeSVG
              value={url}
              size={240}
              level="M"
              includeMargin
              bgColor="#ffffff"
              fgColor="#1a1a2e"
            />
            <div className="qr-scan-hint">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3m4-3v7h-7"/></svg>
              <span>Scan or tap to explore</span>
            </div>
          </div>
          <div className="qr-card-features" onClick={handleProductClick}>
            {(product.highlights || []).slice(0, 3).map((h, i) => (
              <span key={i} className="qr-feature-tag">{h}</span>
            ))}
          </div>
        </div>

        <button className="qr-arrow qr-arrow-right" onClick={goNext}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Footer */}
      <div className="qr-footer">
        <p>Powered by <strong>Juspay</strong> — Scan to discover, compare & buy with instant EMI</p>
      </div>

      {/* Product Detail Popup */}
      {showPopup && (
        <div className="product-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="product-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowPopup(false)}>✕</button>

            <div className="popup-header">
              <h2>{product.brand} {product.model}</h2>
              <span className="popup-device-code">{product.device_code}</span>
            </div>

            <div className="popup-price-row">
              <span className="popup-price">{formatPrice(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="popup-mrp">{formatPrice(product.mrp)}</span>
                  <span className="popup-discount">{discount}% off</span>
                </>
              )}
            </div>

            <div className="popup-section">
              <h4>Key Specifications</h4>
              <div className="popup-specs-grid">
                <div className="popup-spec">
                  <span className="spec-label">Display</span>
                  <span className="spec-value">{product.display.size_inch}" {product.display.type}</span>
                </div>
                <div className="popup-spec">
                  <span className="spec-label">Processor</span>
                  <span className="spec-value">{product.hardware.chipset}</span>
                </div>
                <div className="popup-spec">
                  <span className="spec-label">RAM</span>
                  <span className="spec-value">{product.hardware.ram_gb} GB</span>
                </div>
                <div className="popup-spec">
                  <span className="spec-label">Storage</span>
                  <span className="spec-value">{product.default_storage} GB</span>
                </div>
                <div className="popup-spec">
                  <span className="spec-label">Battery</span>
                  <span className="spec-value">{product.hardware.battery_mah} mAh</span>
                </div>
                <div className="popup-spec">
                  <span className="spec-label">Camera</span>
                  <span className="spec-value">{product.camera}</span>
                </div>
              </div>
            </div>

            <div className="popup-section">
              <h4>Store Location</h4>
              <div className="location-card">
                <div className="location-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="location-details">
                  <div className="location-floor">{product.location?.floor || 'Ground Floor'}</div>
                  <div className="location-section">{product.location?.section || 'Mobile Zone'}</div>
                  <div className="location-aisle">
                    Aisle {product.location?.aisle || 'A1'} • {product.location?.shelf || 'Shelf 1'}
                  </div>
                  <div className="location-label">{product.location?.shelfLabel || 'Smartphones'}</div>
                </div>
              </div>
            </div>

            <div className="popup-actions">
              <button className="popup-btn-view" onClick={() => { setShowPopup(false); handleScanSimulation(); }}>
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodes;
