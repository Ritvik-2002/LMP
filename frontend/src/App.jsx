import { useEffect, useState } from 'react';
import { getMerchantTheme } from './themes/merchantThemes';
import PaymentPage from './components/PaymentPage';
import Chatbot from './components/Chatbot';
import './App.css';

// Sample data for demo - in production this would come from URL params or API
const sampleData = {
  request_id: "REQ-CHR-20260313-0001",
  merchant: {
    merchant_id: "CHR_MKT_1001",
    merchant_name: "Croma",
    merchant_category: "online_marketplace",
    channel: "web",
    source: "chrome_browser"
  },
  device: {
    brand: "Samsung",
    manufacturer: "Samsung Electronics",
    model: "Galaxy S26",
    device_code: "SM-S926B",
    device_type: "smartphone",
    release_year: 2026
  },
  hardware: {
    chipset: "Exynos 2600",
    cpu: "Octa-core",
    gpu: "Xclipse 960",
    ram_gb: 12,
    storage_gb: 256,
    battery_mah: 4800
  },
  display: {
    type: "Dynamic AMOLED",
    size_inch: 6.4,
    resolution: "3200x1440",
    refresh_rate_hz: 144
  },
  os: {
    platform: "Android",
    version: "16",
    ui: "One UI 8"
  },
  network: {
    sim_type: "Dual SIM",
    "5g_supported": true,
    wifi: "WiFi 7",
    bluetooth: "5.4",
    nfc: true
  },
  browser_context: {
    browser: "Chrome",
    browser_version: "145.0",
    user_agent: "Mozilla/5.0",
    ip_region: "IN",
    network_type: "5G"
  },
  loan_request: {
    amount: 150000,
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

// Format currency
const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Apply theme to CSS variables
const applyTheme = (theme) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-dark', theme.primaryDark);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--error', theme.error);
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--gradient', theme.gradient);
};

function App() {
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');

    if (encodedData) {
      try {
        const decoded = JSON.parse(atob(encodedData));
        setData(decoded);
      } catch (e) {
        console.error('Failed to parse data from URL', e);
        setData(sampleData);
      }
    } else {
      setData(sampleData);
    }
  }, []);

  useEffect(() => {
    if (data) {
      const merchantTheme = getMerchantTheme(data.merchant?.merchant_id);
      setTheme(merchantTheme);
      applyTheme(merchantTheme);
      setLoading(false);
    }
  }, [data]);

  const handleCompareWithAI = () => {
    console.log('Compare other options with AI clicked');
    alert('AI Comparison: This would show similar devices with pros/cons comparison!');
  };

  const handleAddToCart = () => {
    console.log('Add to Cart clicked');
    setShowPayment(true);
  };

  const handleBackFromPayment = () => {
    setShowPayment(false);
  };

  if (loading || !data || !theme) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // Show Payment Page
  if (showPayment) {
    return (
      <>
        <PaymentPage data={data} theme={theme} onBack={handleBackFromPayment} />
        <Chatbot />
      </>
    );
  }

  const { device, hardware, display, os, network, merchant } = data;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1 className="header-title">{merchant.merchant_name}</h1>
      </header>

      {/* Product Card */}
      <div className="product-card">
        {/* Product Hero */}
        <div className="product-hero">
          <h2 className="product-name">{device.model}</h2>
          <p className="product-brand">{device.brand} • {device.release_year}</p>
        </div>

        {/* Hardware Section */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">⚡</span>
            <h3 className="section-title">Hardware</h3>
          </div>
          <div className="specs-grid">
            <div className="spec-item">
              <div className="spec-label">Chipset</div>
              <div className="spec-value">{hardware.chipset}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">CPU</div>
              <div className="spec-value">{hardware.cpu}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">GPU</div>
              <div className="spec-value">{hardware.gpu}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">RAM</div>
              <div className="spec-value highlight">{hardware.ram_gb} GB</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Storage</div>
              <div className="spec-value highlight">{hardware.storage_gb} GB</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Battery</div>
              <div className="spec-value">{hardware.battery_mah} mAh</div>
            </div>
          </div>
        </div>

        {/* Display Section */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">📱</span>
            <h3 className="section-title">Display</h3>
          </div>
          <div className="specs-grid">
            <div className="spec-item">
              <div className="spec-label">Type</div>
              <div className="spec-value">{display.type}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Size</div>
              <div className="spec-value">{display.size_inch}"</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Resolution</div>
              <div className="spec-value">{display.resolution}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Refresh Rate</div>
              <div className="spec-value highlight">{display.refresh_rate_hz} Hz</div>
            </div>
          </div>
        </div>

        {/* OS & Network Section */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">🔧</span>
            <h3 className="section-title">Software & Connectivity</h3>
          </div>
          <div className="specs-grid">
            <div className="spec-item">
              <div className="spec-label">OS</div>
              <div className="spec-value">{os.platform} {os.version}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">UI</div>
              <div className="spec-value">{os.ui}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">WiFi</div>
              <div className="spec-value">{network.wifi}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Bluetooth</div>
              <div className="spec-value">{network.bluetooth}</div>
            </div>
          </div>
          <div className="feature-tags" style={{ marginTop: '12px' }}>
            {network['5g_supported'] && <span className="feature-tag">5G Ready</span>}
            {network.nfc && <span className="feature-tag">NFC</span>}
            <span className="feature-tag">{network.sim_type}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <div className="buttons-row">
          <button className="btn-primary" onClick={handleCompareWithAI}>
            🤖 Compare other options with AI
          </button>
          <button className="btn-secondary" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-request-id">{data.request_id}</div>
      </footer>

      <Chatbot />
    </div>
  );
}

export default App;
