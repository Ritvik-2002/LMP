// Product catalogue for TechMart / Croma store
// Each product has full specs, pricing, colors, and image config

const catalogue = [
  {
    id: 'samsung-galaxy-s26',
    brand: 'Samsung',
    model: 'Galaxy S26',
    device_code: 'SM-S926B',
    category: 'smartphone',
    release_year: 2026,
    price: 129999,
    mrp: 149999,
    colors: [
      { name: 'Phantom Black', hex: '#1a1a2e', image_bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
      { name: 'Marble White', hex: '#e8e8e8', image_bg: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' },
      { name: 'Icy Blue', hex: '#b8d4e3', image_bg: 'linear-gradient(135deg, #b8d4e3, #8bbbd4)' },
      { name: 'Peach Gold', hex: '#f5e6cc', image_bg: 'linear-gradient(135deg, #f5e6cc, #e8d5b8)' },
    ],
    storage_options: [128, 256, 512],
    default_storage: 256,
    rating: 4.2,
    rating_count: 2847,
    hardware: {
      chipset: 'Exynos 2600',
      cpu: 'Octa-core (1x3.5 GHz & 3x3.0 GHz & 4x2.3 GHz)',
      gpu: 'Xclipse 960',
      ram_gb: 12,
      battery_mah: 4800,
    },
    display: {
      type: 'Dynamic AMOLED 2X',
      size_inch: 6.4,
      resolution: '3200 x 1440 (Quad HD+)',
      refresh_rate_hz: 144,
    },
    os: { platform: 'Android', version: '16', ui: 'One UI 8' },
    network: {
      sim_type: 'Dual SIM (Nano + eSIM)',
      '5g_supported': true,
      wifi: 'WiFi 7 (802.11be)',
      bluetooth: '5.4',
      nfc: true,
    },
    camera: '200MP + 50MP + 12MP',
    highlights: ['AI-powered camera', 'Titanium frame', 'IP68 water resistant'],
    // Semantic tags for AI recommendation engine
    semantic: {
      design: ['premium', 'minimalist', 'metal-frame', 'titanium'],
      color_tone: ['neutral', 'muted', 'pastel'],
      audience: ['professional', 'premium-buyer', 'camera-enthusiast'],
      use_case: ['daily-driver', 'photography', 'productivity'],
      vibe: ['refined', 'flagship', 'sophisticated'],
      material: 'titanium',
      price_tier: 'premium',  // budget, mid, upper-mid, premium, ultra-premium
    },
  },
  {
    id: 'iphone-16-pro',
    brand: 'Apple',
    model: 'iPhone 16 Pro',
    device_code: 'A3101',
    category: 'smartphone',
    release_year: 2025,
    price: 134900,
    mrp: 139900,
    colors: [
      { name: 'Natural Titanium', hex: '#8a8578', image_bg: 'linear-gradient(135deg, #8a8578, #6b6560)' },
      { name: 'Desert Titanium', hex: '#c4a882', image_bg: 'linear-gradient(135deg, #c4a882, #a8906e)' },
      { name: 'White Titanium', hex: '#f0ede8', image_bg: 'linear-gradient(135deg, #f0ede8, #d9d5ce)' },
      { name: 'Black Titanium', hex: '#3c3c3c', image_bg: 'linear-gradient(135deg, #3c3c3c, #1a1a1a)' },
    ],
    storage_options: [256, 512, 1024],
    default_storage: 256,
    rating: 4.5,
    rating_count: 5210,
    hardware: {
      chipset: 'Apple A18 Pro',
      cpu: 'Hexa-core (2x4.05 GHz + 4x2.42 GHz)',
      gpu: 'Apple GPU (6-core)',
      ram_gb: 8,
      battery_mah: 3582,
    },
    display: {
      type: 'Super Retina XDR OLED',
      size_inch: 6.3,
      resolution: '2622 x 1206',
      refresh_rate_hz: 120,
    },
    os: { platform: 'iOS', version: '18', ui: 'iOS 18' },
    network: {
      sim_type: 'Nano SIM + eSIM',
      '5g_supported': true,
      wifi: 'WiFi 7 (802.11be)',
      bluetooth: '5.3',
      nfc: true,
    },
    camera: '48MP + 48MP + 12MP',
    highlights: ['Camera Control button', 'A18 Pro chip', 'Titanium design'],
    semantic: {
      design: ['premium', 'minimalist', 'metal-frame', 'titanium'],
      color_tone: ['neutral', 'earthy', 'muted'],
      audience: ['professional', 'premium-buyer', 'apple-ecosystem'],
      use_case: ['daily-driver', 'photography', 'productivity'],
      vibe: ['refined', 'flagship', 'elegant'],
      material: 'titanium',
      price_tier: 'premium',
    },
  },
  {
    id: 'google-pixel-10-pro',
    brand: 'Google',
    model: 'Pixel 10 Pro',
    device_code: 'GP-10P',
    category: 'smartphone',
    release_year: 2026,
    price: 99999,
    mrp: 109999,
    colors: [
      { name: 'Obsidian', hex: '#2d2d2d', image_bg: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)' },
      { name: 'Porcelain', hex: '#f5f0eb', image_bg: 'linear-gradient(135deg, #f5f0eb, #e0d8cf)' },
      { name: 'Wintergreen', hex: '#a8c5b8', image_bg: 'linear-gradient(135deg, #a8c5b8, #8aad9e)' },
    ],
    storage_options: [128, 256, 512],
    default_storage: 256,
    rating: 4.3,
    rating_count: 1892,
    hardware: {
      chipset: 'Google Tensor G5',
      cpu: 'Octa-core',
      gpu: 'Immortalis-G720',
      ram_gb: 16,
      battery_mah: 5050,
    },
    display: {
      type: 'LTPO OLED',
      size_inch: 6.7,
      resolution: '2992 x 1344 (Quad HD+)',
      refresh_rate_hz: 120,
    },
    os: { platform: 'Android', version: '16', ui: 'Stock Android' },
    network: {
      sim_type: 'Dual SIM (Nano + eSIM)',
      '5g_supported': true,
      wifi: 'WiFi 7 (802.11be)',
      bluetooth: '5.4',
      nfc: true,
    },
    camera: '50MP + 48MP + 48MP',
    highlights: ['7 years of updates', 'AI photo editing', 'Best-in-class HDR'],
    semantic: {
      design: ['clean', 'distinctive', 'camera-bar'],
      color_tone: ['neutral', 'earthy', 'soft'],
      audience: ['camera-enthusiast', 'ai-enthusiast', 'android-purist'],
      use_case: ['photography', 'ai-features', 'daily-driver'],
      vibe: ['intelligent', 'understated', 'practical'],
      material: 'aluminum',
      price_tier: 'upper-mid',
    },
  },
  {
    id: 'oneplus-13',
    brand: 'OnePlus',
    model: '13',
    device_code: 'CPH2655',
    category: 'smartphone',
    release_year: 2025,
    price: 69999,
    mrp: 74999,
    colors: [
      { name: 'Midnight Ocean', hex: '#1a3a5c', image_bg: 'linear-gradient(135deg, #1a3a5c, #0d2137)' },
      { name: 'Arctic Dawn', hex: '#e8edf2', image_bg: 'linear-gradient(135deg, #e8edf2, #c8d0d8)' },
      { name: 'Black Eclipse', hex: '#1a1a1a', image_bg: 'linear-gradient(135deg, #1a1a1a, #000)' },
    ],
    storage_options: [256, 512],
    default_storage: 256,
    rating: 4.4,
    rating_count: 3105,
    hardware: {
      chipset: 'Snapdragon 8 Elite',
      cpu: 'Octa-core (2x4.32 GHz + 6x3.53 GHz)',
      gpu: 'Adreno 830',
      ram_gb: 12,
      battery_mah: 6000,
    },
    display: {
      type: 'LTPO AMOLED',
      size_inch: 6.82,
      resolution: '3168 x 1440 (Quad HD+)',
      refresh_rate_hz: 120,
    },
    os: { platform: 'Android', version: '15', ui: 'OxygenOS 15' },
    network: {
      sim_type: 'Dual SIM (Nano)',
      '5g_supported': true,
      wifi: 'WiFi 7 (802.11be)',
      bluetooth: '5.4',
      nfc: true,
    },
    camera: '50MP + 50MP + 50MP',
    highlights: ['6000mAh battery', '100W fast charging', 'Hasselblad camera'],
    semantic: {
      design: ['bold', 'feature-packed', 'curved-display'],
      color_tone: ['cool', 'dark', 'monochrome'],
      audience: ['power-user', 'value-seeker', 'performance-enthusiast'],
      use_case: ['gaming', 'fast-charging', 'photography'],
      vibe: ['aggressive', 'flagship-killer', 'tech-forward'],
      material: 'glass',
      price_tier: 'upper-mid',
    },
  },
  {
    id: 'samsung-galaxy-s26-fe',
    brand: 'Samsung',
    model: 'Galaxy S26 FE',
    device_code: 'SM-S726B',
    category: 'smartphone',
    release_year: 2026,
    price: 54999,
    mrp: 64999,
    colors: [
      { name: 'Graphite', hex: '#4a4a4a', image_bg: 'linear-gradient(135deg, #4a4a4a, #2d2d2d)' },
      { name: 'Mint', hex: '#a8e6cf', image_bg: 'linear-gradient(135deg, #a8e6cf, #88d4b5)' },
      { name: 'Lavender', hex: '#c8b8db', image_bg: 'linear-gradient(135deg, #c8b8db, #a898c8)' },
    ],
    storage_options: [128, 256],
    default_storage: 128,
    rating: 4.1,
    rating_count: 1423,
    hardware: {
      chipset: 'Exynos 2500',
      cpu: 'Octa-core',
      gpu: 'Xclipse 940',
      ram_gb: 8,
      battery_mah: 4700,
    },
    display: {
      type: 'Dynamic AMOLED 2X',
      size_inch: 6.6,
      resolution: '2340 x 1080 (FHD+)',
      refresh_rate_hz: 120,
    },
    os: { platform: 'Android', version: '16', ui: 'One UI 8' },
    network: {
      sim_type: 'Dual SIM (Nano + eSIM)',
      '5g_supported': true,
      wifi: 'WiFi 6E',
      bluetooth: '5.3',
      nfc: true,
    },
    camera: '50MP + 12MP + 8MP',
    highlights: ['Fan Edition value', 'Galaxy AI built-in', 'IP67 rated'],
    semantic: {
      design: ['familiar', 'samsung-dna', 'flat-display'],
      color_tone: ['playful', 'pastel', 'vibrant'],
      audience: ['value-seeker', 'samsung-loyalist', 'young-professional'],
      use_case: ['daily-driver', 'social-media', 'ai-features'],
      vibe: ['accessible', 'cheerful', 'practical'],
      material: 'aluminum',
      price_tier: 'mid',
    },
  },
  {
    id: 'nothing-phone-3',
    brand: 'Nothing',
    model: 'Phone (3)',
    device_code: 'A063',
    category: 'smartphone',
    release_year: 2025,
    price: 39999,
    mrp: 42999,
    colors: [
      { name: 'White', hex: '#f5f5f5', image_bg: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' },
      { name: 'Dark Grey', hex: '#3a3a3a', image_bg: 'linear-gradient(135deg, #3a3a3a, #222)' },
    ],
    storage_options: [128, 256],
    default_storage: 256,
    rating: 4.2,
    rating_count: 987,
    hardware: {
      chipset: 'Snapdragon 8s Gen 4',
      cpu: 'Octa-core',
      gpu: 'Adreno 735',
      ram_gb: 12,
      battery_mah: 5200,
    },
    display: {
      type: 'LTPO AMOLED',
      size_inch: 6.5,
      resolution: '2772 x 1240 (FHD+)',
      refresh_rate_hz: 120,
    },
    os: { platform: 'Android', version: '15', ui: 'Nothing OS 3.0' },
    network: {
      sim_type: 'Dual SIM (Nano)',
      '5g_supported': true,
      wifi: 'WiFi 7 (802.11be)',
      bluetooth: '5.4',
      nfc: true,
    },
    camera: '50MP + 50MP',
    highlights: ['Glyph Interface LED', 'Transparent design', 'Clean software'],
    semantic: {
      design: ['unique', 'transparent', 'statement-piece'],
      color_tone: ['monochrome', 'minimal'],
      audience: ['trend-setter', 'design-lover', 'minimalist'],
      use_case: ['daily-driver', 'style-statement', 'clean-software'],
      vibe: ['disruptive', 'artistic', 'counter-culture'],
      material: 'glass-transparent',
      price_tier: 'budget',
    },
  },
];

export default catalogue;

// Helper: get product by ID
export const getProductById = (id) => catalogue.find(p => p.id === id);

// ===== Similarity Engine =====

// Normalize a value to 0–1 range given min/max across catalogue
const normalize = (value, min, max) => {
  if (max === min) return 0;
  return (value - min) / (max - min);
};

// Compute numeric similarity (1 = identical, 0 = maximally different)
const numericSimilarity = (a, b, min, max) => {
  return 1 - Math.abs(normalize(a, min, max) - normalize(b, min, max));
};

// Chipset tier mapping for categorical comparison
const chipsetTier = (chipset) => {
  const c = chipset.toLowerCase();
  if (c.includes('a18') || c.includes('exynos 2600') || c.includes('8 elite')) return 5;
  if (c.includes('tensor g5') || c.includes('exynos 2500') || c.includes('8s gen 4')) return 4;
  if (c.includes('a17') || c.includes('8 gen 3') || c.includes('dimensity 9300')) return 3;
  if (c.includes('8 gen 2') || c.includes('a16')) return 2;
  return 1;
};

// Spec weights — higher = more important for similarity
const WEIGHTS = {
  price: 0.20,
  ram: 0.12,
  battery: 0.10,
  display_size: 0.08,
  refresh_rate: 0.10,
  storage: 0.08,
  chipset: 0.15,
  os: 0.07,
  has_5g: 0.05,
  has_nfc: 0.03,
  camera_mp: 0.02,
};

// Extract primary camera MP from string like "200MP + 50MP + 12MP"
const primaryCameraMP = (cameraStr) => {
  const match = cameraStr.match(/(\d+)MP/);
  return match ? parseInt(match[1]) : 0;
};

// Precompute catalogue ranges for normalization
const computeRanges = () => {
  const fields = {
    price: catalogue.map(p => p.price),
    ram: catalogue.map(p => p.hardware.ram_gb),
    battery: catalogue.map(p => p.hardware.battery_mah),
    display_size: catalogue.map(p => p.display.size_inch),
    refresh_rate: catalogue.map(p => p.display.refresh_rate_hz),
    storage: catalogue.map(p => p.default_storage),
    chipset: catalogue.map(p => chipsetTier(p.hardware.chipset)),
    camera_mp: catalogue.map(p => primaryCameraMP(p.camera)),
  };
  const ranges = {};
  for (const [key, values] of Object.entries(fields)) {
    ranges[key] = { min: Math.min(...values), max: Math.max(...values) };
  }
  return ranges;
};

const ranges = computeRanges();

// Compute similarity score between two products (0–100)
const computeSimilarity = (a, b) => {
  let score = 0;

  score += WEIGHTS.price * numericSimilarity(a.price, b.price, ranges.price.min, ranges.price.max);
  score += WEIGHTS.ram * numericSimilarity(a.hardware.ram_gb, b.hardware.ram_gb, ranges.ram.min, ranges.ram.max);
  score += WEIGHTS.battery * numericSimilarity(a.hardware.battery_mah, b.hardware.battery_mah, ranges.battery.min, ranges.battery.max);
  score += WEIGHTS.display_size * numericSimilarity(a.display.size_inch, b.display.size_inch, ranges.display_size.min, ranges.display_size.max);
  score += WEIGHTS.refresh_rate * numericSimilarity(a.display.refresh_rate_hz, b.display.refresh_rate_hz, ranges.refresh_rate.min, ranges.refresh_rate.max);
  score += WEIGHTS.storage * numericSimilarity(a.default_storage, b.default_storage, ranges.storage.min, ranges.storage.max);
  score += WEIGHTS.chipset * numericSimilarity(chipsetTier(a.hardware.chipset), chipsetTier(b.hardware.chipset), ranges.chipset.min, ranges.chipset.max);
  score += WEIGHTS.camera_mp * numericSimilarity(primaryCameraMP(a.camera), primaryCameraMP(b.camera), ranges.camera_mp.min, ranges.camera_mp.max);

  // Boolean/categorical
  score += WEIGHTS.os * (a.os.platform === b.os.platform ? 1 : 0);
  score += WEIGHTS.has_5g * (a.network['5g_supported'] === b.network['5g_supported'] ? 1 : 0);
  score += WEIGHTS.has_nfc * (a.network.nfc === b.network.nfc ? 1 : 0);

  return Math.round(score * 100);
};

// Get spec-by-spec comparison between two products
export const compareSpecs = (a, b) => {
  const specs = [
    { label: 'Price', a: `₹${a.price.toLocaleString('en-IN')}`, b: `₹${b.price.toLocaleString('en-IN')}`, winner: a.price < b.price ? 'a' : a.price > b.price ? 'b' : 'tie', key: 'price' },
    { label: 'Chipset', a: a.hardware.chipset, b: b.hardware.chipset, winner: chipsetTier(a.hardware.chipset) > chipsetTier(b.hardware.chipset) ? 'a' : chipsetTier(a.hardware.chipset) < chipsetTier(b.hardware.chipset) ? 'b' : 'tie', key: 'chipset' },
    { label: 'RAM', a: `${a.hardware.ram_gb} GB`, b: `${b.hardware.ram_gb} GB`, winner: a.hardware.ram_gb > b.hardware.ram_gb ? 'a' : a.hardware.ram_gb < b.hardware.ram_gb ? 'b' : 'tie', key: 'ram' },
    { label: 'Battery', a: `${a.hardware.battery_mah} mAh`, b: `${b.hardware.battery_mah} mAh`, winner: a.hardware.battery_mah > b.hardware.battery_mah ? 'a' : a.hardware.battery_mah < b.hardware.battery_mah ? 'b' : 'tie', key: 'battery' },
    { label: 'Display', a: `${a.display.size_inch}" ${a.display.type}`, b: `${b.display.size_inch}" ${b.display.type}`, winner: 'tie', key: 'display' },
    { label: 'Refresh Rate', a: `${a.display.refresh_rate_hz} Hz`, b: `${b.display.refresh_rate_hz} Hz`, winner: a.display.refresh_rate_hz > b.display.refresh_rate_hz ? 'a' : a.display.refresh_rate_hz < b.display.refresh_rate_hz ? 'b' : 'tie', key: 'refresh' },
    { label: 'Camera', a: a.camera, b: b.camera, winner: primaryCameraMP(a.camera) > primaryCameraMP(b.camera) ? 'a' : primaryCameraMP(a.camera) < primaryCameraMP(b.camera) ? 'b' : 'tie', key: 'camera' },
    { label: 'OS', a: `${a.os.platform} ${a.os.version}`, b: `${b.os.platform} ${b.os.version}`, winner: 'tie', key: 'os' },
    { label: 'Storage', a: `${a.default_storage} GB`, b: `${b.default_storage} GB`, winner: a.default_storage > b.default_storage ? 'a' : a.default_storage < b.default_storage ? 'b' : 'tie', key: 'storage' },
    { label: '5G', a: a.network['5g_supported'] ? 'Yes' : 'No', b: b.network['5g_supported'] ? 'Yes' : 'No', winner: 'tie', key: '5g' },
  ];
  return specs;
};

// ===== Semantic / AI Recommendation Engine =====

// Jaccard similarity between two arrays of tags
const tagOverlap = (a, b) => {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const intersection = b.filter(t => setA.has(t)).length;
  return intersection / new Set([...a, ...b]).size;
};

// Color similarity via hex distance (perceptual)
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const colorDistance = (hex1, hex2) => {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

// Average color similarity across palettes (0-1, 1=identical)
const paletteSimilarity = (colorsA, colorsB) => {
  const maxDist = 441.67; // sqrt(255^2 * 3)
  let totalSim = 0;
  let count = 0;
  for (const cA of colorsA) {
    let bestSim = 0;
    for (const cB of colorsB) {
      const sim = 1 - (colorDistance(cA.hex, cB.hex) / maxDist);
      if (sim > bestSim) bestSim = sim;
    }
    totalSim += bestSim;
    count++;
  }
  return count > 0 ? totalSim / count : 0;
};

// Price tier distance (0=same, 1=max distance)
const PRICE_TIERS = ['budget', 'mid', 'upper-mid', 'premium', 'ultra-premium'];
const priceTierSimilarity = (a, b) => {
  const idxA = PRICE_TIERS.indexOf(a);
  const idxB = PRICE_TIERS.indexOf(b);
  if (idxA === -1 || idxB === -1) return 0;
  return 1 - Math.abs(idxA - idxB) / (PRICE_TIERS.length - 1);
};

const SEMANTIC_WEIGHTS = {
  design: 0.20,
  color_tone: 0.10,
  audience: 0.20,
  use_case: 0.15,
  vibe: 0.10,
  color_palette: 0.10,
  price_tier: 0.10,
  material: 0.05,
};

const computeSemanticScore = (a, b) => {
  const sA = a.semantic;
  const sB = b.semantic;
  if (!sA || !sB) return 0;

  let score = 0;
  score += SEMANTIC_WEIGHTS.design * tagOverlap(sA.design, sB.design);
  score += SEMANTIC_WEIGHTS.color_tone * tagOverlap(sA.color_tone, sB.color_tone);
  score += SEMANTIC_WEIGHTS.audience * tagOverlap(sA.audience, sB.audience);
  score += SEMANTIC_WEIGHTS.use_case * tagOverlap(sA.use_case, sB.use_case);
  score += SEMANTIC_WEIGHTS.vibe * tagOverlap(sA.vibe, sB.vibe);
  score += SEMANTIC_WEIGHTS.color_palette * paletteSimilarity(a.colors, b.colors);
  score += SEMANTIC_WEIGHTS.price_tier * priceTierSimilarity(sA.price_tier, sB.price_tier);
  score += SEMANTIC_WEIGHTS.material * (sA.material === sB.material ? 1 : 0);

  return Math.round(score * 100);
};

// Generate a human-readable reason from the tag overlap
const generateReason = (product, candidate) => {
  const sA = product.semantic;
  const sB = candidate.semantic;
  if (!sA || !sB) return 'Similar product';

  const reasons = [];

  // Design overlap
  const designMatch = sA.design.filter(t => sB.design.includes(t));
  if (designMatch.length > 0) reasons.push(`shared ${designMatch[0]} design`);

  // Material
  if (sA.material === sB.material) reasons.push(`same ${sA.material} build`);

  // Audience overlap
  const audMatch = sA.audience.filter(t => sB.audience.includes(t));
  if (audMatch.length > 0) {
    const label = audMatch[0].replace(/-/g, ' ');
    reasons.push(`both target ${label}s`);
  }

  // Use case
  const useMatch = sA.use_case.filter(t => sB.use_case.includes(t));
  if (useMatch.length > 0 && reasons.length < 3) {
    reasons.push(`great for ${useMatch[0].replace(/-/g, ' ')}`);
  }

  // Color tone
  const colorMatch = sA.color_tone.filter(t => sB.color_tone.includes(t));
  if (colorMatch.length > 0 && reasons.length < 3) {
    reasons.push(`${colorMatch[0]} color palette`);
  }

  // Vibe
  const vibeMatch = sA.vibe.filter(t => sB.vibe.includes(t));
  if (vibeMatch.length > 0 && reasons.length < 2) {
    reasons.push(`${vibeMatch[0]} feel`);
  }

  // Price tier
  if (sA.price_tier === sB.price_tier && reasons.length < 3) {
    reasons.push(`same ${sA.price_tier} segment`);
  }

  if (reasons.length === 0) return 'Alternative option with different approach';
  // Capitalize first letter
  const text = reasons.join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Get AI-style recommendations ranked by semantic similarity
export const getSemanticRecommendations = (id, limit = 5) => {
  const product = getProductById(id);
  if (!product) return [];

  return catalogue
    .filter(p => p.id !== id)
    .map(p => ({
      ...p,
      semanticScore: computeSemanticScore(product, p),
      reason: generateReason(product, p),
    }))
    .sort((a, b) => b.semanticScore - a.semanticScore)
    .slice(0, limit);
};

// Get similar products ranked by spec similarity
export const getSimilarProducts = (id, limit = 4) => {
  const product = getProductById(id);
  if (!product) return catalogue.slice(0, limit);

  return catalogue
    .filter(p => p.id !== id)
    .map(p => ({
      ...p,
      similarity: computeSimilarity(product, p),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};

// ===== Additional Product Categories =====

export const laptopCatalogue = [
  {
    id: 'macbook-air-m4',
    brand: 'Apple',
    model: 'MacBook Air M4',
    category: 'laptops',
    price: 119900,
    mrp: 119900,
    colors: [
      { name: 'Midnight', hex: '#1d1d2c' },
      { name: 'Starlight', hex: '#f0e6d3' },
      { name: 'Silver', hex: '#d1d1d6' },
      { name: 'Space Gray', hex: '#7d7e80' },
    ],
    highlights: ['M4 chip', '18hr battery', 'Liquid Retina'],
  },
  {
    id: 'dell-xps-16',
    brand: 'Dell',
    model: 'XPS 16 9640',
    category: 'laptops',
    price: 149990,
    mrp: 169990,
    colors: [
      { name: 'Platinum', hex: '#c0c0c0' },
      { name: 'Graphite', hex: '#4a4a4a' },
    ],
    highlights: ['Intel Ultra 9', 'OLED 4K touch', '32GB RAM'],
  },
  {
    id: 'hp-spectre-x360',
    brand: 'HP',
    model: 'Spectre x360 16',
    category: 'laptops',
    price: 134990,
    mrp: 149990,
    colors: [
      { name: 'Nightfall Black', hex: '#1a1a2e' },
      { name: 'Nocturne Blue', hex: '#1b3a5c' },
    ],
    highlights: ['2-in-1 convertible', '3K OLED', 'Intel Core Ultra 7'],
  },
  {
    id: 'lenovo-thinkpad-x1',
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon Gen 12',
    category: 'laptops',
    price: 164990,
    mrp: 179990,
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
    ],
    highlights: ['1.08kg ultralight', 'MIL-STD tested', '14" 2.8K OLED'],
  },
  {
    id: 'asus-zenbook-14',
    brand: 'ASUS',
    model: 'ZenBook 14 OLED',
    category: 'laptops',
    price: 79990,
    mrp: 94990,
    colors: [
      { name: 'Ponder Blue', hex: '#2b4570' },
      { name: 'Jasper Gray', hex: '#7a7a7a' },
    ],
    highlights: ['AMD Ryzen 7', '14" 2.8K OLED', '1.2kg light'],
  },
];

export const audioCatalogue = [
  {
    id: 'airpods-pro-3',
    brand: 'Apple',
    model: 'AirPods Pro 3',
    category: 'audio',
    price: 24900,
    mrp: 24900,
    colors: [
      { name: 'White', hex: '#f5f5f5' },
    ],
    highlights: ['Adaptive ANC', 'Spatial Audio', 'USB-C MagSafe'],
  },
  {
    id: 'sony-wh1000xm6',
    brand: 'Sony',
    model: 'WH-1000XM6',
    category: 'audio',
    price: 29990,
    mrp: 34990,
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Platinum Silver', hex: '#c8c8c8' },
      { name: 'Midnight Blue', hex: '#1a2744' },
    ],
    highlights: ['Best-in-class ANC', '40hr battery', 'LDAC Hi-Res'],
  },
  {
    id: 'samsung-buds4-pro',
    brand: 'Samsung',
    model: 'Galaxy Buds4 Pro',
    category: 'audio',
    price: 18999,
    mrp: 22999,
    colors: [
      { name: 'Graphite', hex: '#4a4a4a' },
      { name: 'White', hex: '#f0f0f0' },
      { name: 'Violet', hex: '#8b6fc0' },
    ],
    highlights: ['360 Audio', 'AI noise control', 'IPX7 waterproof'],
  },
  {
    id: 'jbl-tour-one-m3',
    brand: 'JBL',
    model: 'Tour One M3',
    category: 'audio',
    price: 24999,
    mrp: 29999,
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Champagne', hex: '#d4c5a9' },
    ],
    highlights: ['True Adaptive ANC', '50hr battery', 'Spatial sound'],
  },
  {
    id: 'bose-qc-ultra',
    brand: 'Bose',
    model: 'QuietComfort Ultra',
    category: 'audio',
    price: 32990,
    mrp: 37990,
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'White Smoke', hex: '#e8e8e8' },
      { name: 'Sandstone', hex: '#c4a882' },
    ],
    highlights: ['Immersive Audio', 'CustomTune ANC', 'Premium comfort'],
  },
];

export const wearableCatalogue = [
  {
    id: 'apple-watch-ultra-3',
    brand: 'Apple',
    model: 'Watch Ultra 3',
    category: 'wearables',
    price: 89900,
    mrp: 89900,
    colors: [
      { name: 'Natural Titanium', hex: '#8a8578' },
      { name: 'Black Titanium', hex: '#3c3c3c' },
    ],
    highlights: ['Titanium case', 'Dual GPS L1/L5', '72hr battery'],
  },
  {
    id: 'samsung-galaxy-watch7',
    brand: 'Samsung',
    model: 'Galaxy Watch7',
    category: 'wearables',
    price: 29999,
    mrp: 34999,
    colors: [
      { name: 'Green', hex: '#5c7a5e' },
      { name: 'Cream', hex: '#f0e6d3' },
      { name: 'Silver', hex: '#c0c0c0' },
    ],
    highlights: ['BioActive sensor', 'Wear OS 5', 'Sapphire crystal'],
  },
  {
    id: 'garmin-venu-4',
    brand: 'Garmin',
    model: 'Venu 4',
    category: 'wearables',
    price: 44990,
    mrp: 49990,
    colors: [
      { name: 'Black/Slate', hex: '#2d2d2d' },
      { name: 'White/Gold', hex: '#f5f0eb' },
    ],
    highlights: ['AMOLED display', '10-day battery', 'Advanced fitness'],
  },
  {
    id: 'google-pixel-watch3',
    brand: 'Google',
    model: 'Pixel Watch 3',
    category: 'wearables',
    price: 32999,
    mrp: 38999,
    colors: [
      { name: 'Obsidian', hex: '#2d2d2d' },
      { name: 'Porcelain', hex: '#f5f0eb' },
      { name: 'Hazel', hex: '#8a8578' },
    ],
    highlights: ['Fitbit integration', 'Wear OS 5', 'AI health insights'],
  },
  {
    id: 'noise-colorfit-pro6',
    brand: 'Noise',
    model: 'ColorFit Pro 6',
    category: 'wearables',
    price: 4999,
    mrp: 7999,
    colors: [
      { name: 'Jet Black', hex: '#1a1a1a' },
      { name: 'Silver Grey', hex: '#a0a0a0' },
      { name: 'Rose Gold', hex: '#d4a882' },
    ],
    highlights: ['1.96" AMOLED', 'Bluetooth calling', '7-day battery'],
  },
];

const allCatalogueMap = {
  smartphones: catalogue,
  laptops: laptopCatalogue,
  audio: audioCatalogue,
  wearables: wearableCatalogue,
};

export const getProductsByCategory = (categoryId) => allCatalogueMap[categoryId] || [];
