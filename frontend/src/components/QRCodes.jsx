import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import catalogue from '../data/catalogue';
import './QRCodes.css';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

// Rotating greetings (Indian languages in native scripts)
const GREETINGS = ['Welcome', 'नमस्ते', 'வணக்கம்', 'ನಮಸ್ಕಾರ', 'প্রণাম', 'నమస్కారం', 'नमस्कार', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ'];

const QRCodes = () => {
  const navigate = useNavigate();
  const [baseUrl] = useState('https://723b-106-51-64-60.ngrok-free.app');
  const [scanning, setScanning] = useState(false);
  const [greetingIdx, setGreetingIdx] = useState(0);

  // Display only the first product
  const product = catalogue[0];
  const url = `${baseUrl}/chat`;

  const handleScanSimulation = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      navigate('/chat');
    }, 1200);
  };

  // Rotate greetings
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIdx(prev => (prev + 1) % GREETINGS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
            <span className="qr-nav-logo">Shop Smart</span>
            <span className="qr-nav-tag">Scan & Explore</span>
          </div>
          <div className="qr-nav-actions">
            <button className="qr-print-btn" onClick={() => window.print()}>
              Print Label
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Storefront Display */}
      <div className="qr-storefront-content">
        {/* Welcome Section */}
        <div className="qr-welcome-section">
          <h1 className="qr-main-title" key={greetingIdx}>{GREETINGS[greetingIdx]}</h1>
          <p className="qr-subtitle">Scan the QR Code to Start Shopping</p>
        </div>

        {/* Large QR Code Display */}
        <div className="qr-display-card" onClick={handleScanSimulation}>
          <div className="qr-scan-corners">
            <span className="corner top-left"></span>
            <span className="corner top-right"></span>
            <span className="corner bottom-left"></span>
            <span className="corner bottom-right"></span>
          </div>
          
          <div className="qr-code-large">
            <QRCodeSVG
              value={url}
              size={320}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#0f0f1a"
            />
          </div>
          
          <div className="qr-scan-instruction">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            <p>Point your camera here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodes;
