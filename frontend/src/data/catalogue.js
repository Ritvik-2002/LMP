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
  },
  {
    id: 'oneplus-13',
    brand: 'OnePlus',
    model: 'OnePlus 13',
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
