import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Package,
  Map,
  Megaphone,
  Tag,
  Smile,
  Mic,
  Bell,
  Search,
  TrendingUp,
  ShoppingCart,
  Users,
  Percent,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  LogOut,
  Store,
  Calendar,
  Upload
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import './MerchantDashboard.css';
import ProductUpload from '../components/ProductUpload.jsx';
import {
  getOverviewKPIs,
  getTransactionData,
  getInventoryData,
  getSponsoredProducts,
  getDiscounts,
  getAIRecommendations,
  getSentimentData,
  getHeatmapData,
  getAlerts,
  getRevenueForecast,
  getDemographicsData
} from '../data/merchantMockData';
import { loadUploadedProducts, getCombinedInventory } from '../utils/productStorage';
import { storeZones, storeWidth, storeHeight } from '../data/storeLayout';

// Navigation items configuration
const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'upload', label: 'Product Upload', icon: Upload },
  { id: 'heatmap', label: 'Store Heatmap', icon: Map },
  { id: 'sponsored', label: 'Sponsored Products', icon: Megaphone },
  { id: 'discounts', label: 'Discounts & Promos', icon: Tag },
  { id: 'sentiment', label: 'Customer Sentiment', icon: Smile },
];

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// KPI Card Component
const KPICard = ({ title, value, change, trend, icon: Icon, color = 'default' }) => (
  <div className="kpi-card">
    <div className="kpi-header">
      <span className="kpi-label">{title}</span>
      <div className={`kpi-icon ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="kpi-value">{value}</div>
    <div className={`kpi-change ${trend}`}>
      {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {change > 0 ? '+' : ''}{change}%
      <span style={{ marginLeft: '4px', fontWeight: 400 }}>vs last period</span>
    </div>
  </div>
);

// Alert Item Component
const AlertItem = ({ alert }) => (
  <div className={`alert-item ${alert.severity}`}>
    <div className="alert-icon">
      {alert.severity === 'critical' ? <AlertTriangle size={18} /> :
       alert.severity === 'warning' ? <AlertTriangle size={18} /> :
       <Bell size={18} />}
    </div>
    <div className="alert-content">
      <h4 className="alert-title">{alert.title}</h4>
      <p className="alert-message">{alert.message}</p>
      <span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span>
    </div>
  </div>
);

// AI Recommendation Item
const AIRecItem = ({ rec }) => (
  <div className="ai-rec-item">
    <div className={`ai-rec-confidence ${rec.impact}`}>
      {Math.round(rec.confidence * 100)}%
    </div>
    <div className="ai-rec-content">
      <h4 className="ai-rec-title">
        {rec.title}
        <span className="ai-rec-type">{rec.type}</span>
      </h4>
      <p className="ai-rec-description">{rec.description}</p>
      <div className="ai-rec-action">
        <Sparkles size={14} />
        {rec.suggestedAction}
      </div>
    </div>
  </div>
);

// Voice Assistant Component
const VoiceAssistant = ({ onCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTranscript('');
      // Simulate voice recognition
      setTimeout(() => {
        setTranscript('Add 50 units to iPhone 16 Pro inventory');
        setIsListening(false);
      }, 3000);
    }
  };

  const quickCommands = [
    'Check iPhone stock',
    'Show low inventory',
    'Apply 10% discount',
    'Show today\'s sales',
    'Sponsor Galaxy S26',
  ];

  return (
    <div className="voice-assistant-container">
      {isOpen && (
        <div className="voice-assistant-panel">
          <div className="voice-status">
            <div className={`voice-status-icon ${isListening ? 'listening' : ''}`}>
              <Mic size={32} />
            </div>
            <h4>{isListening ? 'Listening...' : 'Voice Assistant'}</h4>
            <p>{isListening ? 'Speak your command' : 'Tap microphone to speak'}</p>
          </div>
          <div className="voice-transcript">
            <div className="voice-transcript-label">Transcript</div>
            <div className="voice-transcript-text">
              {transcript || 'No command yet...'}
            </div>
          </div>
          <div className="voice-commands">
            {quickCommands.map((cmd, idx) => (
              <button
                key={idx}
                className="voice-command-chip"
                onClick={() => { setTranscript(cmd); onCommand(cmd); }}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        className={`voice-assistant-btn ${isListening ? 'listening' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Voice Assistant"
      >
        <Mic size={28} />
      </button>
    </div>
  );
};

// Store Heatmap Component
const StoreHeatmap = () => {
  const heatmapData = getHeatmapData();
  const maxTraffic = Math.max(...heatmapData.zones.map(z => z.traffic));

  const getHeatColor = (traffic) => {
    const intensity = traffic / maxTraffic;
    if (intensity > 0.8) return '#ef4444';
    if (intensity > 0.6) return '#f97316';
    if (intensity > 0.4) return '#eab308';
    if (intensity > 0.2) return '#22c55e';
    return '#3b82f6';
  };

  return (
    <div className="heatmap-container">
      <svg
        viewBox={`0 0 ${storeWidth} ${storeHeight}`}
        className="heatmap-svg"
      >
        {/* Background */}
        <rect width={storeWidth} height={storeHeight} fill="#0f172a" rx="8" />

        {/* Grid lines */}
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={i * 50} y1={0} x2={i * 50} y2={storeHeight} stroke="#1e293b" strokeWidth="1" />
            <line x1={0} y1={i * 45} x2={storeWidth} y2={i * 45} stroke="#1e293b" strokeWidth="1" />
          </g>
        ))}

        {/* Zones */}
        {storeZones.map((zone) => {
          const zoneData = heatmapData.zones.find(z => z.id === zone.id);
          return (
            <g key={zone.id}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                fill={getHeatColor(zoneData?.traffic || 0)}
                opacity={0.6}
                rx="8"
                className="heatmap-zone"
              />
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                fill="none"
                stroke="#334155"
                strokeWidth="2"
                rx="8"
              />
              <text
                x={zone.x + zone.width / 2}
                y={zone.y + zone.height / 2 - 8}
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="600"
              >
                {zone.name}
              </text>
              <text
                x={zone.x + zone.width / 2}
                y={zone.y + zone.height / 2 + 10}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="10"
              >
                {zoneData?.traffic} visitors
              </text>
            </g>
          );
        })}

        {/* Entrance indicator */}
        <g transform="translate(200, 410)">
          <rect x="0" y="0" width="100" height="30" fill="#12DAA8" opacity="0.3" rx="4" />
          <text x="50" y="20" textAnchor="middle" fill="#12DAA8" fontSize="11" fontWeight="600">
            ENTRANCE
          </text>
        </g>
      </svg>

      <div className="heatmap-legend">
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-color" style={{ background: '#ef4444' }} />
          <span>Very High</span>
        </div>
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-color" style={{ background: '#f97316' }} />
          <span>High</span>
        </div>
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-color" style={{ background: '#eab308' }} />
          <span>Medium</span>
        </div>
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-color" style={{ background: '#22c55e' }} />
          <span>Low</span>
        </div>
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-color" style={{ background: '#3b82f6' }} />
          <span>Very Low</span>
        </div>
      </div>
    </div>
  );
};

// Overview Section
const OverviewSection = () => {
  const kpis = getOverviewKPIs();
  const transactionData = getTransactionData('daily');
  const forecastData = getRevenueForecast();
  const alerts = getAlerts();
  const aiRecs = getAIRecommendations().slice(0, 4);

  const [chartPeriod, setChartPeriod] = useState('daily');
  const chartData = getTransactionData(chartPeriod);

  const COLORS = ['#12DAA8', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e'];

  return (
    <>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Total Revenue"
          value={kpis.totalRevenue.formatted}
          change={kpis.totalRevenue.change}
          trend={kpis.totalRevenue.trend}
          icon={TrendingUp}
          color="default"
        />
        <KPICard
          title="Total Orders"
          value={kpis.totalOrders.value.toLocaleString()}
          change={kpis.totalOrders.change}
          trend={kpis.totalOrders.trend}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Avg. Ticket Size"
          value={kpis.avgTicketSize.formatted}
          change={kpis.avgTicketSize.change}
          trend={kpis.avgTicketSize.trend}
          icon={Store}
          color="purple"
        />
        <KPICard
          title="Conversion Rate"
          value={`${kpis.conversionRate.value}%`}
          change={kpis.conversionRate.change}
          trend={kpis.conversionRate.trend}
          icon={Percent}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Revenue & Orders</h3>
              <p className="chart-subtitle">Track your sales performance over time</p>
            </div>
            <div className="chart-tabs">
              {['daily', 'weekly', 'monthly'].map(period => (
                <button
                  key={period}
                  className={`chart-tab ${chartPeriod === period ? 'active' : ''}`}
                  onClick={() => setChartPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#12DAA8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#12DAA8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  stroke="#334155"
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  stroke="#334155"
                />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#12DAA8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">AI Alerts</h3>
              <p className="chart-subtitle">Actionable insights for your store</p>
            </div>
          </div>
          <div className="alerts-list">
            {alerts.slice(0, 4).map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="section-card full-width">
        <div className="section-header">
          <h3 className="section-title">
            <Sparkles size={20} color="#12DAA8" />
            AI Recommendations
          </h3>
          <button className="section-action secondary">View All</button>
        </div>
        <div className="ai-recs-list">
          {aiRecs.map(rec => (
            <AIRecItem key={rec.id} rec={rec} />
          ))}
        </div>
      </div>
    </>
  );
};

// Inventory Section
const InventorySection = () => {
  const [inventory, setInventory] = useState(getInventoryData());
  const [uploadedProducts, setUploadedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const loaded = loadUploadedProducts();
    setUploadedProducts(loaded);
  }, []);

  const formatUploadedPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const allProducts = [
    ...inventory.products.map(p => ({ ...p, source: 'catalogue' })),
    ...uploadedProducts.map(p => ({ ...p, source: 'uploaded' }))
  ];

  const filteredProducts = activeTab === 'all' 
    ? allProducts 
    : activeTab === 'uploaded' 
      ? uploadedProducts.map(p => ({ ...p, source: 'uploaded' }))
      : inventory.products.map(p => ({ ...p, source: 'catalogue' }));

  return (
    <>
      <div className="section-card full-width">
        <div className="section-header">
          <h3 className="section-title">
            <Package size={20} color="#12DAA8" />
            Inventory Management
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="inventory-tabs">
              {['all', 'catalogue', 'uploaded'].map(tab => (
                <button
                  key={tab}
                  className={`inventory-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'uploaded' && uploadedProducts.length > 0 && (
                    <span className="tab-badge">{uploadedProducts.length}</span>
                  )}
                </button>
              ))}
            </div>
            <button className="section-action">
              <Mic size={16} style={{ marginRight: '8px' }} />
              Voice Update
            </button>
          </div>
        </div>
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Source</th>
                <th>Status</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={`${product.source}-${product.id}`}>
                  <td>
                    <div className="inventory-product">
                      {product.source === 'catalogue' ? (
                        <div className="inventory-product-image" style={{ background: product.colors?.[0]?.image_bg || '#334155' }}>
                          <span style={{ fontSize: '0.7rem', color: '#fff' }}>{product.brand?.[0]}</span>
                        </div>
                      ) : (
                        <div className="inventory-product-image uploaded-image">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Package size={20} color="#64748b" />
                          )}
                        </div>
                      )}
                      <div className="inventory-product-info">
                        <h4>{product.source === 'catalogue' ? `${product.brand} ${product.model}` : product.name}</h4>
                        <span>{product.source === 'catalogue' ? product.device_code : 'Uploaded Product'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`source-badge ${product.source}`}>
                      {product.source === 'catalogue' ? 'Catalogue' : 'Uploaded'}
                    </span>
                  </td>
                  <td>
                    <span className={`stock-badge ${product.status || 'active'}`}>
                      <span className="stock-dot" />
                      {(product.status || 'active').replace('-', ' ')}
                    </span>
                  </td>
                  <td>{product.stock !== undefined ? product.stock : 'N/A'}</td>
                  <td>{formatUploadedPrice(product.price)}</td>
                  <td>{product.category || 'Uncategorized'}</td>
                  <td>
                    <button className="merchant-header-btn" style={{ width: '32px', height: '32px' }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="inventory-empty">
              <Package size={48} color="#64748b" />
              <p>No products found in this category</p>
            </div>
          )}
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">
              <TrendingUp size={20} color="#12DAA8" />
              Top Sellers
            </h3>
          </div>
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {inventory.topSellers.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="inventory-product-info">
                        <h4>{product.brand} {product.model}</h4>
                      </div>
                    </td>
                    <td>{product.sold}</td>
                    <td>{formatCurrency(product.sold * product.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">
              <AlertTriangle size={20} color="#f59e0b" />
              Low Performers
            </h3>
          </div>
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.bottomSellers.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="inventory-product-info">
                        <h4>{product.brand} {product.model}</h4>
                      </div>
                    </td>
                    <td>{product.sold}</td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

// Heatmap Section
const HeatmapSection = () => {
  const heatmapData = getHeatmapData();

  return (
    <>
      <div className="section-card full-width">
        <div className="section-header">
          <h3 className="section-title">
            <Map size={20} color="#12DAA8" />
            Store Traffic Heatmap
          </h3>
          <button className="section-action secondary">
            <Calendar size={16} style={{ marginRight: '8px' }} />
            Change Time Range
          </button>
        </div>
        <StoreHeatmap />
      </div>

      <div className="section-grid">
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">Zone Analytics</h3>
          </div>
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Traffic</th>
                  <th>Dwell Time</th>
                  <th>Conversions</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.zones.map(zone => (
                  <tr key={zone.id}>
                    <td>
                      <div className="inventory-product-info">
                        <h4>{zone.name}</h4>
                      </div>
                    </td>
                    <td>{zone.traffic}</td>
                    <td>{zone.dwellTime} min</td>
                    <td>{zone.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">Traffic by Time Slot</h3>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData.timeSlots}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#334155" />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} stroke="#334155" />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="zones.entrance" stackId="a" fill="#12DAA8" name="Entrance" />
                <Bar dataKey="zones.smartphones" stackId="a" fill="#3b82f6" name="Smartphones" />
                <Bar dataKey="zones.checkout" stackId="a" fill="#8b5cf6" name="Checkout" />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

// Sponsored Products Section
const SponsoredSection = () => {
  const products = getSponsoredProducts();

  return (
    <>
      <div className="section-card full-width">
        <div className="section-header">
          <h3 className="section-title">
            <Megaphone size={20} color="#12DAA8" />
            Sponsored Products Management
          </h3>
          <button className="section-action">Create Campaign</button>
        </div>
        <div className="sponsored-grid">
          {products.map(product => (
            <div key={product.id} className={`sponsored-card ${product.isSponsored ? 'sponsored' : ''}`}>
              <div className="sponsored-header">
                {product.isSponsored && <span className="sponsored-badge">Sponsored</span>}
                <div className={`sponsored-toggle ${product.isSponsored ? 'active' : ''}`}>
                  <div className="sponsored-toggle-thumb" />
                </div>
              </div>
              <div className="sponsored-product">
                <div className="sponsored-product-image" style={{ background: product.colors?.[0]?.image_bg }}>
                  <span style={{ fontSize: '1rem', color: '#fff' }}>{product.brand?.[0]}</span>
                </div>
                <div className="sponsored-product-info">
                  <h4>{product.brand} {product.model}</h4>
                  <span>{formatCurrency(product.price)}</span>
                </div>
              </div>
              <div className="sponsored-metrics">
                <div className="sponsored-metric">
                  <div className="sponsored-metric-value">{product.impressions?.toLocaleString()}</div>
                  <div className="sponsored-metric-label">Impressions</div>
                </div>
                <div className="sponsored-metric">
                  <div className="sponsored-metric-value">{product.clicks}</div>
                  <div className="sponsored-metric-label">Clicks</div>
                </div>
                <div className="sponsored-metric">
                  <div className="sponsored-metric-value">{product.ctr}%</div>
                  <div className="sponsored-metric-label">CTR</div>
                </div>
                <div className="sponsored-metric">
                  <div className="sponsored-metric-value">{formatCurrency(product.spend || 0)}</div>
                  <div className="sponsored-metric-label">Spend</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const DiscountAIChat = ({ onSuggestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hi! I can help you with discount strategies. Ask me anything about pricing, promotions, or bulk discounts!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    'Suggest discount for slow moving stock',
    'Best discount for iPhone 16 Pro',
    'Weekend flash sale strategy',
    'Clearance sale recommendations',
    'Competitive pricing analysis',
  ];

  const generateAIResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('iphone') && lowerMsg.includes('pro')) {
      return {
        text: 'Based on current market analysis, I recommend a 5-8% discount on iPhone 16 Pro. This maintains margin while staying competitive. Competitors are offering 3-5%, so this positions you attractively.',
        suggestion: { product: 'iPhone 16 Pro', discount: 7, reason: 'Competitive positioning' }
      };
    } else if (lowerMsg.includes('slow') || lowerMsg.includes('moving') || lowerMsg.includes('stock')) {
      return {
        text: 'For slow-moving inventory, I suggest a tiered approach: 10% for items 30+ days old, 15% for 60+ days, and 20%+ for 90+ days. This creates urgency while maximizing recovery.',
        suggestion: { type: 'tiered', discount: 15, reason: 'Inventory aging strategy' }
      };
    } else if (lowerMsg.includes('weekend') || lowerMsg.includes('flash')) {
      return {
        text: 'Weekend flash sales work best with 12-15% discounts on popular items. Time it for Friday 6 PM - Sunday 10 PM. Promote via push notifications 2 hours before launch.',
        suggestion: { type: 'flash', discount: 15, reason: 'Weekend traffic optimization' }
      };
    } else if (lowerMsg.includes('clearance')) {
      return {
        text: 'For clearance, start with 20% and increase by 5% weekly. Bundle slow movers with fast sellers at 25% off combined. This clears inventory faster than flat discounts.',
        suggestion: { type: 'clearance', discount: 25, reason: 'Inventory liquidation' }
      };
    } else if (lowerMsg.includes('competitive') || lowerMsg.includes('pricing')) {
      return {
        text: 'Your Galaxy S26 pricing is 3% above market average. Consider a 5% discount to match competitors. iPhone 16 Pro is competitively priced - maintain current pricing.',
        suggestion: { product: 'Samsung Galaxy S26', discount: 5, reason: 'Price matching' }
      };
    } else {
      return {
        text: 'I can help you optimize discounts based on inventory age, competitor pricing, and sales velocity. Try asking about specific products or strategies like "weekend flash sales" or "clearance recommendations".',
        suggestion: null
      };
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(userMsg);
      setMessages(prev => [...prev, { type: 'ai', text: response.text, suggestion: response.suggestion }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickPrompt = (prompt) => {
    setMessages(prev => [...prev, { type: 'user', text: prompt }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(prompt);
      setMessages(prev => [...prev, { type: 'ai', text: response.text, suggestion: response.suggestion }]);
      setIsTyping(false);
    }, 800);
  };

  const handleApplySuggestion = (suggestion) => {
    onSuggestion(suggestion);
    setMessages(prev => [...prev, { type: 'system', text: 'Discount applied successfully!' }]);
  };

  return (
    <div className="discount-ai-chat">
      {!isOpen ? (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <Sparkles size={20} />
          Ask AI for Discount Help
        </button>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <h4>
              <Sparkles size={18} color="#f59e0b" />
              AI Discount Assistant
            </h4>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <XCircle size={20} />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.type}`}>
                {msg.type === 'ai' && <div className="chat-avatar ai">AI</div>}
                <div className="chat-bubble">
                  <p>{msg.text}</p>
                  {msg.suggestion && (
                    <button 
                      className="apply-suggestion-btn"
                      onClick={() => handleApplySuggestion(msg.suggestion)}
                    >
                      <CheckCircle size={14} />
                      Apply {msg.suggestion.discount}% Discount
                    </button>
                  )}
                </div>
                {msg.type === 'user' && <div className="chat-avatar user">You</div>}
              </div>
            ))}
            {isTyping && (
              <div className="chat-message ai typing">
                <div className="chat-avatar ai">AI</div>
                <div className="chat-bubble typing">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-quick-prompts">
            {quickPrompts.map((prompt, idx) => (
              <button key={idx} className="quick-prompt-btn" onClick={() => handleQuickPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about discounts, pricing strategies..."
              className="chat-input"
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={!inputText.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Discounts Section
const CreateDiscountModal = ({ isOpen, onClose, onCreate }) => {
  const [productName, setProductName] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(nextMonth);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !discountValue) return;

    onCreate({
      id: `manual-${Date.now()}`,
      productName,
      type: discountType,
      value: parseFloat(discountValue),
      startDate,
      endDate,
      reason: reason || 'Manual discount created by merchant',
      usageCount: 0,
      isManual: true
    });

    setProductName('');
    setDiscountValue('');
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content discount-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Discount</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="discount-form">
          <div className="form-group">
            <label className="form-label">
              Product Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <select
                className="form-select"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Discount Value <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? 'e.g., 15' : 'e.g., 5000'}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Notes</label>
            <textarea
              className="form-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you creating this discount?"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="section-action secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="section-action">
              <CheckCircle size={16} style={{ marginRight: '8px' }} />
              Create Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DiscountsSection = () => {
  const { active: initialActive, agingSuggestions } = getDiscounts();
  const [active, setActive] = useState(initialActive);
  const [suggestions, setSuggestions] = useState(agingSuggestions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAISuggestion = (suggestion) => {
    if (suggestion.product) {
      const newSuggestion = {
        productId: `ai-${Date.now()}`,
        productName: suggestion.product,
        suggestedDiscount: suggestion.discount,
        reason: suggestion.reason,
        currentStock: 10,
        daysSinceRestock: 0,
        isAIChat: true
      };
      setSuggestions(prev => [newSuggestion, ...prev]);
    }
  };

  const handleCreateDiscount = (discount) => {
    setActive(prev => [discount, ...prev]);
  };

  const handleDeleteDiscount = (id) => {
    setActive(prev => prev.filter(d => d.id !== id));
  };

  const handleApplySuggestion = (suggestion) => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const newDiscount = {
      id: `ai-applied-${Date.now()}`,
      productId: suggestion.productId || `ai-${Date.now()}`,
      productName: suggestion.productName,
      type: 'percentage',
      value: suggestion.suggestedDiscount,
      startDate: today,
      endDate: nextMonth,
      usageCount: 0,
      reason: suggestion.reason,
      isAIApplied: true
    };
    
    setActive(prev => [newDiscount, ...prev]);
    setSuggestions(prev => prev.filter((_, i) => i !== suggestions.indexOf(suggestion)));
  };

  const handleApplyAllSuggestions = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const newDiscounts = suggestions.map(suggestion => ({
      id: `ai-applied-${Date.now()}-${Math.random()}`,
      productId: suggestion.productId || `ai-${Date.now()}-${Math.random()}`,
      productName: suggestion.productName,
      type: 'percentage',
      value: suggestion.suggestedDiscount,
      startDate: today,
      endDate: nextMonth,
      usageCount: 0,
      reason: suggestion.reason,
      isAIApplied: true
    }));
    
    setActive(prev => [...newDiscounts, ...prev]);
    setSuggestions([]);
  };

  return (
    <>
      <div className="section-card full-width">
        <div className="section-header">
          <h3 className="section-title">
            <Tag size={20} color="#12DAA8" />
            Active Discounts ({active.length})
          </h3>
          <div className="header-actions">
            <button className="section-action secondary" onClick={() => setIsModalOpen(true)}>
              <Tag size={16} style={{ marginRight: '8px' }} />
              Create Discount
            </button>
          </div>
        </div>
        <div className="discounts-list">
          {active.length === 0 ? (
            <div className="discounts-empty">
              <Tag size={48} color="#64748b" />
              <p>No active discounts</p>
              <span>Create your first discount to get started</span>
            </div>
          ) : (
            active.map(discount => (
              <div key={discount.id} className={`discount-item ${discount.isManual ? 'manual-discount' : ''} ${discount.isAIApplied ? 'ai-applied' : ''}`}>
                <div className={`discount-badge ${discount.type}`}>
                  <span className="discount-badge-value">
                    {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                  </span>
                  <span className="discount-badge-type">{discount.type}</span>
                </div>
                <div className="discount-content">
                  <h4>
                    {discount.productName}
                    {discount.isManual && <span className="manual-badge">Manual</span>}
                    {discount.isAIApplied && <span className="ai-applied-badge">AI Applied</span>}
                  </h4>
                  <p>Valid from {new Date(discount.startDate).toLocaleDateString()} to {new Date(discount.endDate).toLocaleDateString()}</p>
                </div>
                <div className="discount-stats">
                  <div className="discount-stat">
                    <div className="discount-stat-value">{discount.usageCount}</div>
                    <div className="discount-stat-label">Used</div>
                  </div>
                  <button 
                    className="delete-discount-btn"
                    onClick={() => handleDeleteDiscount(discount.id)}
                    title="Delete discount"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateDiscountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateDiscount}
      />

      <div className="section-card full-width">
        <div className="section-header">
          <h3 className="section-title">
            <Sparkles size={20} color="#f59e0b" />
            AI Discount Suggestions ({suggestions.length})
          </h3>
          <button 
            className="section-action secondary" 
            onClick={handleApplyAllSuggestions}
            disabled={suggestions.length === 0}
          >
            Apply All
          </button>
        </div>
        
        <DiscountAIChat onSuggestion={handleAISuggestion} />
        
        <div className="ai-recs-list">
          {suggestions.map((suggestion, idx) => (
            <div key={idx} className={`ai-rec-item ${suggestion.isAIChat ? 'ai-chat-suggestion' : ''}`}>
              <div className={`ai-rec-confidence ${suggestion.isAIChat ? 'high' : 'medium'}`}>
                {suggestion.suggestedDiscount}%
              </div>
              <div className="ai-rec-content">
                <h4 className="ai-rec-title">
                  Discount for {suggestion.productName}
                  <span className={`ai-rec-type ${suggestion.isAIChat ? 'ai-chat' : ''}`}>
                    {suggestion.isAIChat ? 'AI Chat Suggested' : 'AI Suggested'}
                  </span>
                </h4>
                <p className="ai-rec-description">{suggestion.reason}</p>
                <div 
                  className="ai-rec-action clickable"
                  onClick={() => handleApplySuggestion(suggestion)}
                  role="button"
                  tabIndex={0}
                >
                  <CheckCircle size={14} />
                  Apply {suggestion.suggestedDiscount}% discount
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Sentiment Section
const SentimentSection = () => {
  const sentiment = getSentimentData();
  const demographics = getDemographicsData();

  const sentimentData = [
    { name: 'Happy', value: sentiment.overall.happy, color: '#22c55e' },
    { name: 'Neutral', value: sentiment.overall.neutral, color: '#94a3b8' },
    { name: 'Sad', value: sentiment.overall.sad, color: '#f59e0b' },
    { name: 'Angry', value: sentiment.overall.angry, color: '#ef4444' },
  ];

  return (
    <>
      <div className="section-card full-width">
        <div className="section-header">
          <h3 className="section-title">
            <Smile size={20} color="#12DAA8" />
            Customer Sentiment Analysis
          </h3>
          <button className="section-action secondary">View Detailed Report</button>
        </div>
        <div className="sentiment-overview">
          <div className="sentiment-stat">
            <div className="sentiment-stat-value happy">{sentiment.overall.happy}%</div>
            <div className="sentiment-stat-label">Happy</div>
          </div>
          <div className="sentiment-stat">
            <div className="sentiment-stat-value neutral">{sentiment.overall.neutral}%</div>
            <div className="sentiment-stat-label">Neutral</div>
          </div>
          <div className="sentiment-stat">
            <div className="sentiment-stat-value sad">{sentiment.overall.sad}%</div>
            <div className="sentiment-stat-label">Sad</div>
          </div>
          <div className="sentiment-stat">
            <div className="sentiment-stat-value angry">{sentiment.overall.angry}%</div>
            <div className="sentiment-stat-label">Angry</div>
          </div>
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">Sentiment Distribution</h3>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">Sentiment by Zone</h3>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentiment.byZone} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#334155" />
                <YAxis dataKey="zone" type="category" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#334155" width={100} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="#12DAA8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Dashboard Component
const MerchantDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [unreadAlerts, setUnreadAlerts] = useState(5);

  const handleVoiceCommand = (command) => {
    console.log('Voice command:', command);
    // Handle voice commands here
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'inventory':
        return <InventorySection />;
      case 'upload':
        return <ProductUpload />;
      case 'heatmap':
        return <HeatmapSection />;
      case 'sponsored':
        return <SponsoredSection />;
      case 'discounts':
        return <DiscountsSection />;
      case 'sentiment':
        return <SentimentSection />;
      default:
        return <OverviewSection />;
    }
  };

  const activeNavItem = navItems.find(item => item.id === activeSection);

  return (
    <div className="merchant-dashboard">
      {/* Sidebar */}
      <aside className="merchant-sidebar">
        <div className="merchant-brand">
          <h1>Merchant Hub</h1>
          <span>Croma - Malad Store</span>
        </div>

        <nav className="merchant-nav">
          <div className="merchant-nav-section">
            <div className="merchant-nav-section-title">Main</div>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`merchant-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="merchant-nav-icon" size={20} />
                {item.label}
                {item.id === 'inventory' && unreadAlerts > 0 && (
                  <span className="merchant-nav-badge">{unreadAlerts}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="merchant-user">
          <div className="merchant-user-avatar">SK</div>
          <div className="merchant-user-info">
            <div className="merchant-user-name">Store Manager</div>
            <div className="merchant-user-role">Croma Malad</div>
          </div>
          <button className="merchant-header-btn">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="merchant-main">
        <header className="merchant-header">
          <h2>{activeNavItem?.label || 'Overview'}</h2>
          <div className="merchant-header-actions">
            <div className="merchant-search">
              <Search className="merchant-search-icon" size={18} />
              <input type="text" placeholder="Search products, orders..." />
            </div>
            <button className="merchant-header-btn">
              <Bell size={20} />
              {unreadAlerts > 0 && <span className="badge">{unreadAlerts}</span>}
            </button>
          </div>
        </header>

        <div className="merchant-content">
          {renderSection()}
        </div>
      </main>

      {/* Voice Assistant */}
      <VoiceAssistant onCommand={handleVoiceCommand} />
    </div>
  );
};

export default MerchantDashboard;
