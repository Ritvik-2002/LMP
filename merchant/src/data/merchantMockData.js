// Merchant Dashboard Mock Data
// All data is deterministic (no Math.random) for consistent rendering.
// Revenue and prices are in Indian Rupees (INR).

import catalogue from './catalogue.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const products = catalogue; // 6 smartphones

const productById = (id) => products.find((p) => p.id === id);

/** Simple seeded pseudo-random (mulberry32). Same seed => same sequence. */
function seededRandom(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Format a date as YYYY-MM-DD */
const fmtDate = (d) => d.toISOString().slice(0, 10);

/** Subtract N days from a date */
const subDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
};

/** Subtract N months from a date */
const subMonths = (d, n) => {
  const r = new Date(d);
  r.setMonth(r.getMonth() - n);
  return r;
};

const TODAY = new Date('2026-03-17');

// ---------------------------------------------------------------------------
// 1. Overview KPIs
// ---------------------------------------------------------------------------

export function getOverviewKPIs() {
  const totalRevenue = 2453000; // ~24.5L
  const totalOrders = 342;
  const avgTicketSize = Math.round(totalRevenue / totalOrders);
  const conversionRate = 3.2;
  const totalVisitors = Math.round(totalOrders / (conversionRate / 100));

  return {
    totalRevenue: {
      value: totalRevenue,
      formatted: '\u20B924,53,000',
      change: 12.5,
      trend: 'up',
    },
    totalOrders: {
      value: totalOrders,
      change: 8.3,
      trend: 'up',
    },
    avgTicketSize: {
      value: avgTicketSize,
      formatted: `\u20B9${avgTicketSize.toLocaleString('en-IN')}`,
      change: 3.8,
      trend: 'up',
    },
    conversionRate: {
      value: conversionRate,
      change: 0.4,
      trend: 'up',
    },
    totalVisitors: {
      value: totalVisitors,
      change: 5.1,
      trend: 'up',
    },
    returnRate: {
      value: 4.2,
      change: -0.6,
      trend: 'down',
    },
    avgRating: {
      value: 4.3,
      change: 0.1,
      trend: 'up',
    },
    activeListings: {
      value: products.length,
      change: 0,
      trend: 'up',
    },
  };
}

// ---------------------------------------------------------------------------
// 2. Transaction / Revenue Data
// ---------------------------------------------------------------------------

export function getTransactionData(period = 'daily') {
  const rand = seededRandom(42);

  if (period === 'daily') {
    // Last 30 days
    return Array.from({ length: 30 }, (_, i) => {
      const date = fmtDate(subDays(TODAY, 29 - i));
      const dayOfWeek = subDays(TODAY, 29 - i).getDay();
      // Weekends get a 30-40 % boost
      const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.35 : 1;
      const base = 80000 + rand() * 120000; // 80K - 200K
      const revenue = Math.round(base * weekendBoost);
      const orders = Math.round(revenue / (65000 + rand() * 15000));
      return {
        date,
        revenue,
        orders,
        avgOrderValue: Math.round(revenue / Math.max(orders, 1)),
      };
    });
  }

  if (period === 'weekly') {
    // Last 12 weeks
    return Array.from({ length: 12 }, (_, i) => {
      const weekEnd = subDays(TODAY, (11 - i) * 7);
      const date = fmtDate(weekEnd);
      const revenue = Math.round(550000 + rand() * 750000); // 5.5L - 13L
      const orders = Math.round(revenue / (68000 + rand() * 12000));
      return {
        date,
        revenue,
        orders,
        avgOrderValue: Math.round(revenue / Math.max(orders, 1)),
      };
    });
  }

  // monthly – last 12 months
  return Array.from({ length: 12 }, (_, i) => {
    const monthDate = subMonths(TODAY, 11 - i);
    const date = fmtDate(monthDate);
    const revenue = Math.round(2000000 + rand() * 3000000); // 20L - 50L
    const orders = Math.round(revenue / (70000 + rand() * 10000));
    return {
      date,
      revenue,
      orders,
      avgOrderValue: Math.round(revenue / Math.max(orders, 1)),
    };
  });
}

// ---------------------------------------------------------------------------
// 3. Inventory Data
// ---------------------------------------------------------------------------

const INVENTORY_ENRICHMENT = [
  { id: 'samsung-galaxy-s26', stock: 45, sold: 82, turnoverRate: 1.82, lastRestocked: '2026-03-10', status: 'in-stock' },
  { id: 'iphone-16-pro', stock: 12, sold: 105, turnoverRate: 2.63, lastRestocked: '2026-03-05', status: 'low-stock' },
  { id: 'google-pixel-10-pro', stock: 38, sold: 54, turnoverRate: 1.42, lastRestocked: '2026-03-12', status: 'in-stock' },
  { id: 'oneplus-13', stock: 60, sold: 67, turnoverRate: 1.12, lastRestocked: '2026-03-08', status: 'in-stock' },
  { id: 'samsung-galaxy-s26-fe', stock: 5, sold: 22, turnoverRate: 0.73, lastRestocked: '2026-02-18', status: 'low-stock' },
  { id: 'nothing-phone-3', stock: 0, sold: 12, turnoverRate: 0.40, lastRestocked: '2026-01-25', status: 'out-of-stock' },
];

export function getInventoryData() {
  const enrichedProducts = products.map((p) => {
    const inv = INVENTORY_ENRICHMENT.find((e) => e.id === p.id);
    return { ...p, ...inv };
  });

  const totalSold = enrichedProducts.reduce((s, p) => s + p.sold, 0);

  const categoryBreakdown = enrichedProducts.map((p) => ({
    name: `${p.brand} ${p.model}`,
    value: p.sold,
    percentage: Math.round((p.sold / totalSold) * 1000) / 10,
  }));

  const sorted = [...enrichedProducts].sort((a, b) => b.sold - a.sold);
  const topSellers = sorted.slice(0, 3);
  const bottomSellers = sorted.slice(-3).reverse();

  return {
    products: enrichedProducts,
    categoryBreakdown,
    topSellers,
    bottomSellers,
  };
}

// ---------------------------------------------------------------------------
// 4. Sponsored Products
// ---------------------------------------------------------------------------

export function getSponsoredProducts() {
  const sponsorData = [
    { id: 'samsung-galaxy-s26', isSponsored: true, boostLevel: 4, impressions: 18500, clicks: 740, ctr: 4.0, spend: 12500 },
    { id: 'iphone-16-pro', isSponsored: true, boostLevel: 5, impressions: 22300, clicks: 1115, ctr: 5.0, spend: 18000 },
    { id: 'google-pixel-10-pro', isSponsored: true, boostLevel: 3, impressions: 12800, clicks: 448, ctr: 3.5, spend: 8500 },
    { id: 'oneplus-13', isSponsored: false, boostLevel: 0, impressions: 6200, clicks: 186, ctr: 3.0, spend: 0 },
    { id: 'samsung-galaxy-s26-fe', isSponsored: true, boostLevel: 2, impressions: 9400, clicks: 282, ctr: 3.0, spend: 5000 },
    { id: 'nothing-phone-3', isSponsored: false, boostLevel: 0, impressions: 4100, clicks: 123, ctr: 3.0, spend: 0 },
  ];

  return products.map((p) => {
    const sd = sponsorData.find((s) => s.id === p.id);
    return { ...p, ...sd };
  });
}

// ---------------------------------------------------------------------------
// 5. Discounts
// ---------------------------------------------------------------------------

export function getDiscounts() {
  const active = [
    {
      id: 'disc-001',
      productId: 'samsung-galaxy-s26',
      productName: 'Samsung Galaxy S26',
      type: 'percentage',
      value: 8,
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      usageCount: 34,
    },
    {
      id: 'disc-002',
      productId: 'iphone-16-pro',
      productName: 'iPhone 16 Pro',
      type: 'flat',
      value: 5000,
      startDate: '2026-03-10',
      endDate: '2026-03-20',
      usageCount: 18,
    },
    {
      id: 'disc-003',
      productId: 'oneplus-13',
      productName: 'OnePlus 13',
      type: 'percentage',
      value: 5,
      startDate: '2026-02-15',
      endDate: '2026-04-15',
      usageCount: 47,
    },
  ];

  const agingSuggestions = [
    {
      productId: 'nothing-phone-3',
      productName: 'Nothing Phone (3)',
      currentStock: 0,
      daysSinceRestock: 51,
      suggestedDiscount: 15,
      reason: 'Out of stock for 51 days. Offer discount on restock to drive demand.',
    },
    {
      productId: 'samsung-galaxy-s26-fe',
      productName: 'Samsung Galaxy S26 FE',
      currentStock: 5,
      daysSinceRestock: 27,
      suggestedDiscount: 10,
      reason: 'Low stock with slow turnover (0.73). Discount may accelerate sell-through before next restock.',
    },
    {
      productId: 'google-pixel-10-pro',
      productName: 'Google Pixel 10 Pro',
      currentStock: 38,
      daysSinceRestock: 5,
      suggestedDiscount: 5,
      reason: 'High stock after recent restock. A small discount can boost initial movement.',
    },
  ];

  return { active, agingSuggestions };
}

// ---------------------------------------------------------------------------
// 6. AI Recommendations
// ---------------------------------------------------------------------------

export function getAIRecommendations() {
  return [
    {
      id: 'rec-001',
      type: 'pricing',
      title: 'Reduce iPhone 16 Pro price by 3%',
      description:
        'Competitor stores have dropped pricing. A 3% reduction (\u20B94,047) could increase conversion by ~18% based on price-elasticity modeling.',
      impact: 'high',
      product: productById('iphone-16-pro'),
      suggestedAction: 'Reduce price to \u20B91,30,853',
      confidence: 0.87,
    },
    {
      id: 'rec-002',
      type: 'stocking',
      title: 'Restock Nothing Phone (3) immediately',
      description:
        'Out of stock for 51 days. Search interest is trending up (+22% WoW). You are losing an estimated 8 sales/week.',
      impact: 'high',
      product: productById('nothing-phone-3'),
      suggestedAction: 'Order 30 units',
      confidence: 0.92,
    },
    {
      id: 'rec-003',
      type: 'promotion',
      title: 'Bundle Galaxy S26 FE with accessories',
      description:
        'Pairing the FE with a case + earbuds at \u20B92,999 extra could improve margin by 12% and clear low stock.',
      impact: 'medium',
      product: productById('samsung-galaxy-s26-fe'),
      suggestedAction: 'Create bundle listing',
      confidence: 0.78,
    },
    {
      id: 'rec-004',
      type: 'pricing',
      title: 'Increase OnePlus 13 margin',
      description:
        'OnePlus 13 has strong demand with 67 units sold. A \u20B91,000 price bump is unlikely to affect volume at current conversion rates.',
      impact: 'medium',
      product: productById('oneplus-13'),
      suggestedAction: 'Increase price to \u20B970,999',
      confidence: 0.72,
    },
    {
      id: 'rec-005',
      type: 'stocking',
      title: 'Increase iPhone 16 Pro stock',
      description:
        'Only 12 units left with sell-through rate of 2.63x. At current velocity you will run out in ~5 days.',
      impact: 'high',
      product: productById('iphone-16-pro'),
      suggestedAction: 'Order 50 units',
      confidence: 0.94,
    },
    {
      id: 'rec-006',
      type: 'promotion',
      title: 'Run flash sale on Pixel 10 Pro',
      description:
        'High stock (38 units) with moderate demand. A weekend flash sale (7% off) could move 10-15 units.',
      impact: 'medium',
      product: productById('google-pixel-10-pro'),
      suggestedAction: 'Schedule weekend flash sale at \u20B992,999',
      confidence: 0.74,
    },
    {
      id: 'rec-007',
      type: 'pricing',
      title: 'Galaxy S26 discount is performing well',
      description:
        'The current 8% discount has driven 34 sales. Consider extending it beyond March 31.',
      impact: 'low',
      product: productById('samsung-galaxy-s26'),
      suggestedAction: 'Extend discount to April 30',
      confidence: 0.81,
    },
  ];
}

// ---------------------------------------------------------------------------
// 7. Sentiment Data
// ---------------------------------------------------------------------------

export function getSentimentData() {
  const overall = {
    happy: 58,
    neutral: 24,
    sad: 12,
    angry: 6,
  };

  // Last 14 days trend
  const trend = Array.from({ length: 14 }, (_, i) => {
    const date = fmtDate(subDays(TODAY, 13 - i));
    // Slight variations around overall
    const happyBase = [55, 57, 60, 58, 56, 62, 59, 57, 61, 58, 54, 56, 59, 58];
    const neutralBase = [25, 24, 22, 24, 26, 21, 23, 25, 22, 24, 27, 25, 23, 24];
    const sadBase = [13, 12, 11, 12, 12, 11, 12, 12, 11, 12, 13, 13, 12, 12];
    const angryBase = [7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    return {
      date,
      happy: happyBase[i],
      neutral: neutralBase[i],
      sad: sadBase[i],
      angry: angryBase[i],
    };
  });

  const byZone = [
    { zone: 'Smartphones', dominant: 'happy', score: 72 },
    { zone: 'Accessories', dominant: 'happy', score: 65 },
    { zone: 'Laptops', dominant: 'neutral', score: 55 },
    { zone: 'TVs & Audio', dominant: 'happy', score: 68 },
    { zone: 'Gaming', dominant: 'happy', score: 78 },
    { zone: 'Checkout', dominant: 'neutral', score: 48 },
    { zone: 'Service Desk', dominant: 'sad', score: 38 },
    { zone: 'Demo Area', dominant: 'happy', score: 82 },
    { zone: 'Entrance', dominant: 'neutral', score: 50 },
  ];

  return { overall, trend, byZone };
}

// ---------------------------------------------------------------------------
// 8. Demographics Data
// ---------------------------------------------------------------------------

export function getDemographicsData() {
  const ageGroups = [
    { range: '18-24', male: 28, female: 22, other: 3 },
    { range: '25-34', male: 35, female: 30, other: 4 },
    { range: '35-44', male: 22, female: 18, other: 2 },
    { range: '45-54', male: 12, female: 10, other: 1 },
    { range: '55+', male: 7, female: 5, other: 1 },
  ];

  const totalMale = ageGroups.reduce((s, g) => s + g.male, 0);
  const totalFemale = ageGroups.reduce((s, g) => s + g.female, 0);
  const totalOther = ageGroups.reduce((s, g) => s + g.other, 0);
  const total = totalMale + totalFemale + totalOther;

  const genderSplit = [
    { name: 'Male', value: Math.round((totalMale / total) * 100) },
    { name: 'Female', value: Math.round((totalFemale / total) * 100) },
    { name: 'Other', value: Math.round((totalOther / total) * 100) },
  ];

  return {
    ageGroups,
    genderSplit,
    peakAgeGroup: '25-34',
  };
}

// ---------------------------------------------------------------------------
// 9. Revenue Forecast
// ---------------------------------------------------------------------------

export function getRevenueForecast() {
  const rand = seededRandom(99);
  const data = [];

  // Past 30 days – actual revenue
  for (let i = 29; i >= 0; i--) {
    const date = fmtDate(subDays(TODAY, i));
    const base = 75000 + rand() * 130000;
    const dayOfWeek = subDays(TODAY, i).getDay();
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
    const actual = Math.round(base * weekendBoost);
    data.push({
      date,
      actual,
      predicted: null,
      upperBound: null,
      lowerBound: null,
    });
  }

  // Next 14 days – predicted with confidence bands
  for (let i = 1; i <= 14; i++) {
    const futureDate = new Date(TODAY);
    futureDate.setDate(futureDate.getDate() + i);
    const date = fmtDate(futureDate);
    const dayOfWeek = futureDate.getDay();
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
    const base = 85000 + rand() * 120000;
    const predicted = Math.round(base * weekendBoost);
    // Confidence band widens as we go further out
    const bandWidth = 10000 + i * 5000;
    data.push({
      date,
      actual: null,
      predicted,
      upperBound: predicted + bandWidth,
      lowerBound: Math.max(predicted - bandWidth, 0),
    });
  }

  return data;
}

// ---------------------------------------------------------------------------
// 10. Alerts
// ---------------------------------------------------------------------------

export function getAlerts() {
  return [
    {
      id: 'alert-001',
      type: 'low-stock',
      severity: 'critical',
      title: 'iPhone 16 Pro critically low',
      message: 'Only 12 units remaining. At current sell-through (2.63x), stock will deplete in ~5 days.',
      timestamp: '2026-03-17T09:15:00',
      dismissed: false,
      productId: 'iphone-16-pro',
    },
    {
      id: 'alert-002',
      type: 'low-stock',
      severity: 'critical',
      title: 'Nothing Phone (3) out of stock',
      message: 'Product has been out of stock for 51 days. Customer search queries for this product are up 22%.',
      timestamp: '2026-03-17T08:00:00',
      dismissed: false,
      productId: 'nothing-phone-3',
    },
    {
      id: 'alert-003',
      type: 'low-stock',
      severity: 'warning',
      title: 'Galaxy S26 FE low stock',
      message: 'Only 5 units remaining with slow turnover. Consider restocking or running a clearance promotion.',
      timestamp: '2026-03-16T14:30:00',
      dismissed: false,
      productId: 'samsung-galaxy-s26-fe',
    },
    {
      id: 'alert-004',
      type: 'anomaly',
      severity: 'warning',
      title: 'Unusual spike in returns',
      message: 'Galaxy S26 returns increased 40% this week. Top reason: "Display not as expected". Investigate display demo units.',
      timestamp: '2026-03-16T11:20:00',
      dismissed: false,
      productId: 'samsung-galaxy-s26',
    },
    {
      id: 'alert-005',
      type: 'sentiment',
      severity: 'warning',
      title: 'Negative sentiment at Service Desk',
      message: 'Customer satisfaction at the Service Desk dropped to 38%. Average wait time has increased to 12 minutes.',
      timestamp: '2026-03-15T16:45:00',
      dismissed: false,
      productId: null,
    },
    {
      id: 'alert-006',
      type: 'price',
      severity: 'info',
      title: 'Competitor price drop detected',
      message: 'Flipkart has reduced iPhone 16 Pro price by \u20B93,000. Consider matching to stay competitive.',
      timestamp: '2026-03-15T10:00:00',
      dismissed: false,
      productId: 'iphone-16-pro',
    },
    {
      id: 'alert-007',
      type: 'anomaly',
      severity: 'info',
      title: 'Weekend traffic surge expected',
      message: 'Based on historical data and local events, this weekend traffic is projected to be 25% above average.',
      timestamp: '2026-03-14T17:30:00',
      dismissed: false,
      productId: null,
    },
  ];
}

// ---------------------------------------------------------------------------
// 11. Product Comparison
// ---------------------------------------------------------------------------

export function getProductComparison(productIds) {
  // Radar chart metrics: 0-100 scale
  const metricsMap = {
    'samsung-galaxy-s26': { price: 35, performance: 88, camera: 95, battery: 72, display: 90, value: 60 },
    'iphone-16-pro': { price: 30, performance: 92, camera: 88, battery: 55, display: 88, value: 55 },
    'google-pixel-10-pro': { price: 55, performance: 82, camera: 90, battery: 80, display: 85, value: 72 },
    'oneplus-13': { price: 70, performance: 90, camera: 82, battery: 95, display: 87, value: 88 },
    'samsung-galaxy-s26-fe': { price: 80, performance: 68, camera: 65, battery: 70, display: 75, value: 85 },
    'nothing-phone-3': { price: 90, performance: 72, camera: 70, battery: 82, display: 78, value: 92 },
  };

  const ids = productIds || products.map((p) => p.id);
  const selectedProducts = ids.map((id) => {
    const product = productById(id);
    const radar = metricsMap[id] || { price: 50, performance: 50, camera: 50, battery: 50, display: 50, value: 50 };
    return { ...product, radar };
  });

  const metricNames = ['price', 'performance', 'camera', 'battery', 'display', 'value'];
  const metricLabels = {
    price: 'Price (lower is better)',
    performance: 'Performance',
    camera: 'Camera',
    battery: 'Battery',
    display: 'Display',
    value: 'Value for Money',
  };

  const metrics = metricNames.map((name) => {
    const row = { name, label: metricLabels[name] };
    selectedProducts.forEach((p) => {
      row[p.id] = p.radar[name];
    });
    return row;
  });

  return { products: selectedProducts, metrics };
}

// ---------------------------------------------------------------------------
// 12. Return Data
// ---------------------------------------------------------------------------

export function getReturnData() {
  const returnRate = 4.2;

  const returns = [
    { month: '2025-04', count: 8, amount: 412000 },
    { month: '2025-05', count: 11, amount: 589000 },
    { month: '2025-06', count: 9, amount: 467000 },
    { month: '2025-07', count: 14, amount: 785000 },
    { month: '2025-08', count: 10, amount: 534000 },
    { month: '2025-09', count: 12, amount: 648000 },
    { month: '2025-10', count: 7, amount: 362000 },
    { month: '2025-11', count: 15, amount: 892000 },
    { month: '2025-12', count: 18, amount: 1120000 },
    { month: '2026-01', count: 13, amount: 710000 },
    { month: '2026-02', count: 10, amount: 545000 },
    { month: '2026-03', count: 6, amount: 328000 },
  ];

  const reasons = [
    { reason: 'Defective/Faulty', count: 42, percentage: 31.6 },
    { reason: 'Not as described', count: 28, percentage: 21.1 },
    { reason: 'Changed mind', count: 25, percentage: 18.8 },
    { reason: 'Better price elsewhere', count: 18, percentage: 13.5 },
    { reason: 'Wrong product received', count: 12, percentage: 9.0 },
    { reason: 'Other', count: 8, percentage: 6.0 },
  ];

  const byProduct = [
    { productName: 'Samsung Galaxy S26', returns: 14, rate: 5.1 },
    { productName: 'iPhone 16 Pro', returns: 8, rate: 3.2 },
    { productName: 'Google Pixel 10 Pro', returns: 6, rate: 3.8 },
    { productName: 'OnePlus 13', returns: 5, rate: 2.9 },
    { productName: 'Samsung Galaxy S26 FE', returns: 3, rate: 4.5 },
    { productName: 'Nothing Phone (3)', returns: 2, rate: 5.6 },
  ];

  return { returnRate, returns, reasons, byProduct };
}

// ---------------------------------------------------------------------------
// 13. Peak Hours Data
// ---------------------------------------------------------------------------

export function getPeakHoursData() {
  // Traffic intensity by hour and day (0=Sun, 6=Sat in JS but we use Mon-Sun labels)
  // Values represent approximate customer count per hour
  const hourly = [
    { hour: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    { hour: 1, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    { hour: 2, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    { hour: 3, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    { hour: 4, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    { hour: 5, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    { hour: 6, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    { hour: 7, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    { hour: 8, mon: 2, tue: 1, wed: 2, thu: 1, fri: 3, sat: 5, sun: 4 },
    { hour: 9, mon: 5, tue: 4, wed: 5, thu: 4, fri: 6, sat: 12, sun: 10 },
    { hour: 10, mon: 12, tue: 10, wed: 11, thu: 10, fri: 14, sat: 22, sun: 20 },
    { hour: 11, mon: 18, tue: 16, wed: 17, thu: 15, fri: 20, sat: 30, sun: 28 },
    { hour: 12, mon: 22, tue: 20, wed: 21, thu: 19, fri: 25, sat: 35, sun: 32 },
    { hour: 13, mon: 20, tue: 18, wed: 19, thu: 17, fri: 22, sat: 33, sun: 30 },
    { hour: 14, mon: 16, tue: 15, wed: 16, thu: 14, fri: 18, sat: 28, sun: 26 },
    { hour: 15, mon: 14, tue: 13, wed: 14, thu: 12, fri: 16, sat: 25, sun: 23 },
    { hour: 16, mon: 18, tue: 17, wed: 18, thu: 16, fri: 22, sat: 30, sun: 27 },
    { hour: 17, mon: 24, tue: 22, wed: 23, thu: 21, fri: 28, sat: 34, sun: 25 },
    { hour: 18, mon: 28, tue: 26, wed: 27, thu: 25, fri: 32, sat: 38, sun: 22 },
    { hour: 19, mon: 25, tue: 23, wed: 24, thu: 22, fri: 30, sat: 32, sun: 18 },
    { hour: 20, mon: 18, tue: 16, wed: 17, thu: 15, fri: 22, sat: 25, sun: 12 },
    { hour: 21, mon: 8, tue: 7, wed: 8, thu: 6, fri: 12, sat: 15, sun: 6 },
    { hour: 22, mon: 2, tue: 1, wed: 2, thu: 1, fri: 4, sat: 5, sun: 2 },
    { hour: 23, mon: 0, tue: 0, wed: 0, thu: 0, fri: 1, sat: 2, sun: 0 },
  ];

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dailyTotals = days.map((day) => ({
    day,
    total: hourly.reduce((s, h) => s + h[day], 0),
  }));

  return {
    hourly,
    dailyTotals,
    peakHour: 18,
    peakDay: 'sat',
  };
}

// ---------------------------------------------------------------------------
// 14. Heatmap Data (Store Zone Traffic)
// ---------------------------------------------------------------------------

export function getHeatmapData() {
  const zones = [
    { id: 'entrance', name: 'Entrance', traffic: 950, dwellTime: 1.2, conversions: 0 },
    { id: 'smartphones', name: 'Smartphones', traffic: 680, dwellTime: 8.5, conversions: 82 },
    { id: 'accessories', name: 'Accessories', traffic: 520, dwellTime: 4.2, conversions: 145 },
    { id: 'laptops', name: 'Laptops', traffic: 410, dwellTime: 12.3, conversions: 28 },
    { id: 'tvs', name: 'TVs & Audio', traffic: 340, dwellTime: 6.8, conversions: 15 },
    { id: 'gaming', name: 'Gaming', traffic: 290, dwellTime: 14.5, conversions: 22 },
    { id: 'checkout', name: 'Checkout', traffic: 380, dwellTime: 5.6, conversions: 342 },
    { id: 'service', name: 'Service Desk', traffic: 180, dwellTime: 9.2, conversions: 0 },
    { id: 'demo', name: 'Demo Area', traffic: 450, dwellTime: 11.8, conversions: 0 },
  ];

  // Time-slot based traffic distribution (simplified: 4 time slots)
  const timeSlots = [
    {
      time: 'Morning (9-12)',
      zones: { entrance: 280, smartphones: 150, accessories: 120, laptops: 90, tvs: 70, gaming: 50, checkout: 80, service: 40, demo: 110 },
    },
    {
      time: 'Afternoon (12-15)',
      zones: { entrance: 260, smartphones: 200, accessories: 160, laptops: 120, tvs: 100, gaming: 85, checkout: 110, service: 55, demo: 130 },
    },
    {
      time: 'Evening (15-18)',
      zones: { entrance: 220, smartphones: 180, accessories: 140, laptops: 110, tvs: 95, gaming: 90, checkout: 100, service: 50, demo: 120 },
    },
    {
      time: 'Night (18-21)',
      zones: { entrance: 190, smartphones: 150, accessories: 100, laptops: 90, tvs: 75, gaming: 65, checkout: 90, service: 35, demo: 90 },
    },
  ];

  return { zones, timeSlots };
}
