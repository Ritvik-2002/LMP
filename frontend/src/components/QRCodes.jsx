import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import catalogue from '../data/catalogue';
import './QRCodes.css';

const QRCodes = () => {
  const navigate = useNavigate();
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [size, setSize] = useState(200);

  const getProductUrl = (productId) => `${baseUrl}/product/${productId}`;

  return (
    <div className="qr-page">
      <nav className="qr-nav">
        <div className="qr-nav-inner">
          <button className="qr-back" onClick={() => navigate('/')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          </button>
          <h1 className="qr-nav-title">QR Codes — Shelf Labels</h1>
        </div>
      </nav>

      <div className="qr-controls">
        <label className="qr-control">
          <span>Base URL</span>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://your-domain.com"
          />
        </label>
        <label className="qr-control">
          <span>QR Size</span>
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            <option value={150}>Small (150px)</option>
            <option value={200}>Medium (200px)</option>
            <option value={300}>Large (300px)</option>
          </select>
        </label>
        <button className="qr-print-btn" onClick={() => window.print()}>
          🖨️ Print All
        </button>
      </div>

      <div className="qr-grid">
        {catalogue.map(product => {
          const url = getProductUrl(product.id);
          const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
          return (
            <div key={product.id} className="qr-card">
              <div className="qr-card-header">
                <h3>{product.brand} {product.model}</h3>
                <span className="qr-card-price">
                  ₹{product.price.toLocaleString('en-IN')}
                  {discount > 0 && <span className="qr-card-discount"> ({discount}% off)</span>}
                </span>
              </div>
              <div className="qr-code-container">
                <QRCodeSVG
                  value={url}
                  size={size}
                  level="M"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                />
              </div>
              <div className="qr-card-footer">
                <p className="qr-card-specs">
                  {product.hardware.ram_gb}GB RAM | {product.display.size_inch}" | {product.hardware.battery_mah}mAh
                </p>
                <p className="qr-card-url">{url}</p>
                <p className="qr-card-hint">Scan to view full specs, compare & get AI assistance</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QRCodes;
