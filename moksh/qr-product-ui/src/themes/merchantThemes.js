// Merchant-specific themes based on merchant_id prefix
export const merchantThemes = {
  // Croma theme
  CHR: {
    name: 'Croma',
    primary: '#12DAA8',
    primaryDark: '#0EB892',
    secondary: '#0A9A78',
    accent: '#FFD700',
    error: '#E53935',
    background: '#F5FFFB',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    gradient: 'linear-gradient(135deg, #12DAA8 0%, #0A9A78 100%)',
    logo: '/chroma.png',
  },

  // Reliance Digital theme
  REL: {
    name: 'Reliance Digital',
    primary: '#E32729',
    primaryDark: '#C41E1F',
    secondary: '#FF5722',
    accent: '#FFC107',
    error: '#D32F2F',
    background: '#FFF5F5',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    gradient: 'linear-gradient(135deg, #E32729 0%, #FF5722 100%)',
    logo: '/reliance-digital.png',
  },

  // Amazon theme
  AMZ: {
    name: 'Amazon',
    primary: '#FF9900',
    primaryDark: '#E68A00',
    secondary: '#232F3E',
    accent: '#FF9900',
    error: '#CC0C39',
    background: '#F7F7F7',
    surface: '#FFFFFF',
    text: '#0F1111',
    textSecondary: '#565959',
    gradient: 'linear-gradient(135deg, #FF9900 0%, #232F3E 100%)',
    logo: '📦',
  },

  // Flipkart theme
  FLK: {
    name: 'Flipkart',
    primary: '#2874F0',
    primaryDark: '#1E56E0',
    secondary: '#FFE500',
    accent: '#FF9F00',
    error: '#E74C3C',
    background: '#F1F3F6',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#878787',
    gradient: 'linear-gradient(135deg, #2874F0 0%, #FFE500 100%)',
    logo: '🛍️',
  },

  // Default fallback theme
  DEFAULT: {
    name: 'Marketplace',
    primary: '#12DAA8',
    primaryDark: '#0EB892',
    secondary: '#0A9A78',
    accent: '#FFD700',
    error: '#EF4444',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    gradient: 'linear-gradient(135deg, #12DAA8 0%, #0A9A78 100%)',
    logo: '🏪',
  },
};

// Get theme based on merchant_id
export const getMerchantTheme = (merchantId) => {
  if (!merchantId) return merchantThemes.DEFAULT;

  // Extract prefix from merchant_id (e.g., "CHR_MKT_1001" -> "CHR")
  const prefix = merchantId.split('_')[0].toUpperCase();

  return merchantThemes[prefix] || merchantThemes.DEFAULT;
};
