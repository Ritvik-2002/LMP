import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import catalogue from '../data/catalogue';
import './QRCodes.css';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const QRCodes = () => {
  const navigate = useNavigate();
  const [baseUrl] = useState(window.location.origin);
  const [scanning, setScanning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const product = catalogue[currentIndex];
  const url = `${baseUrl}/product/${product.id}`;
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleScanSimulation = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      navigate(`/product/${product.id}`);
    }, 1200);
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
          onClick={handleScanSimulation}
        >
          <div className="qr-card-header">
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
          <div className="qr-code-container">
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
          <div className="qr-card-features">
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
    </div>
  );
};

export default QRCodes;
