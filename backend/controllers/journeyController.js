require('dotenv').config();
const { products, getProductById, searchProducts } = require('../data/products');

// Lenders config
const LENDERS = [
  { id: 'fibe', name: 'Fibe', rates: [14, 14.5, 15], maxTenure: 24, noCost: [3, 6] },
  { id: 'tvs', name: 'TVS Credit', rates: [13, 13.5, 14], maxTenure: 24 },
  { id: 'dmi', name: 'DMI Finance', rates: [12.5, 13, 13.5], maxTenure: 18 },
];

const calculateEmi = (principal, months, rate) => {
  const r = rate / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
};

// ===== State Machine =====

const CATEGORIES = [
  { id: 'smartphones', name: 'Smartphones', desc: 'Flagships & budget picks' },
  { id: 'laptops', name: 'Laptops', desc: 'Ultrabooks & workstations' },
  { id: 'audio', name: 'Audio', desc: 'Headphones & earbuds' },
  { id: 'wearables', name: 'Wearables', desc: 'Smartwatches & bands' },
];

const STATES = [
  'welcome',
  'category_selection',
  'category_browsing',
  'product_selected',
  'collecting_details',
  'consent',
  'checking_eligibility',
  'showing_offers',
  'offer_review',
  'kyc',
  'final_offers',
  'downpayment',
  'repayment',
  'kfs',
  'success',
];

const VALID_TRANSITIONS = {
  welcome: ['category_selection'],
  category_selection: ['category_browsing'],
  category_browsing: ['category_selection', 'product_selected'],
  product_selected: ['category_browsing', 'collecting_details'],
  collecting_details: ['product_selected', 'consent', 'category_browsing'],
  consent: ['collecting_details', 'checking_eligibility'],
  checking_eligibility: ['showing_offers'],
  showing_offers: ['consent', 'offer_review'],
  offer_review: ['showing_offers', 'kyc'],
  kyc: ['offer_review', 'final_offers'],
  final_offers: ['kyc', 'downpayment'],
  downpayment: ['final_offers', 'repayment'],
  repayment: ['downpayment', 'kfs'],
  kfs: ['repayment', 'success'],
  success: ['category_selection'],
};

// ===== Session Store =====

const sessions = new Map();
const SESSION_TTL = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActive > SESSION_TTL) sessions.delete(id);
  }
}, 5 * 60 * 1000);

const createSession = (sessionId) => {
  const session = {
    sessionId,
    journeyState: 'welcome',
    selectedCategory: null,
    selectedProduct: null,
    collectedFields: { name: '', mobile: '', email: '', employment: '', salary: '' },
    consents: { bureau: false, tnc: false, lenderShare: false, privacy: false, aadhaarKyc: false, communication: false },
    consentTimestamp: null,
    selectedOffer: null,
    selectedTenure: null,
    kycData: { aadhaar: '', aadhaarVerified: false },
    chatHistory: [],
    lastActive: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
};

const getSession = (sessionId) => {
  const session = sessions.get(sessionId);
  if (session) session.lastActive = Date.now();
  return session;
};

// ===== Field Extraction =====

const extractFields = (message, session) => {
  const extracted = {};
  const msg = message.trim();

  // Phone: 10 digits starting with 6-9
  const phoneMatch = msg.match(/\b([6-9]\d{9})\b/);
  if (phoneMatch && !session.collectedFields.mobile) {
    extracted.mobile = phoneMatch[1];
  }

  // Salary: number with optional k/lakh/lpa suffixes
  const salaryMatch = msg.match(/(\d+(?:\.\d+)?)\s*(k|lakh|lakhs|lpa|l)\b/i);
  if (salaryMatch) {
    let amount = parseFloat(salaryMatch[1]);
    const unit = salaryMatch[2].toLowerCase();
    if (unit === 'k') amount *= 1000;
    else if (['lakh', 'lakhs', 'l', 'lpa'].includes(unit)) amount *= 100000;
    if (unit === 'lpa') amount = Math.round(amount / 12);
    extracted.salary = String(Math.round(amount));
  } else {
    // Strip commas (handles Indian formats like 1,00,000 or 10,00,000)
    const stripped = msg.replace(/,/g, '');
    const plainSalary = stripped.match(/\b(\d{4,8})\b/);
    if (plainSalary && !phoneMatch) {
      const val = parseInt(plainSalary[1]);
      if (val >= 5000 && val <= 50000000) {
        extracted.salary = String(val);
      }
    }
  }

  // Employment type
  const empKeywords = {
    'salaried': 'Salaried',
    'self-employed': 'Self-Employed',
    'self employed': 'Self-Employed',
    'business': 'Business',
    'freelance': 'Freelancer',
    'freelancer': 'Freelancer',
  };
  for (const [keyword, value] of Object.entries(empKeywords)) {
    if (msg.toLowerCase().includes(keyword)) {
      extracted.employment = value;
      break;
    }
  }

  // Name extraction
  if (!session.collectedFields.name) {
    const nonNames = new Set(['salaried', 'self', 'business', 'freelance', 'employed', 'looking', 'interested', 'here', 'yes', 'no', 'okay', 'ok', 'sure', 'hi', 'hello']);
    // Prefixed: "my name is Prakhar", "I'm Prakhar"
    const prefixMatch = msg.match(/(?:i'?m|my name is|name is|this is|call me)\s+([A-Za-z][a-z]{1,}(?:\s+[A-Za-z][a-z]+)*)/i);
    if (prefixMatch) {
      const candidate = prefixMatch[1].trim();
      if (!nonNames.has(candidate.toLowerCase())) extracted.name = candidate;
    } else if (session.journeyState === 'collecting_details') {
      // Bare name: message is 1-3 words, all letters, no digits — treat as name
      const words = msg.trim().split(/\s+/);
      if (words.length >= 1 && words.length <= 3 && words.every(w => /^[a-zA-Z]{2,}$/.test(w))) {
        const candidate = words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (!nonNames.has(candidate.toLowerCase())) extracted.name = candidate;
      }
    }
  }

  // Aadhaar: 12 digits
  const aadhaarMatch = msg.match(/\b(\d{12})\b/);
  if (aadhaarMatch && session.journeyState === 'kyc') {
    extracted.aadhaar = aadhaarMatch[1];
  }

  // Email
  const emailMatch = msg.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
  if (emailMatch) {
    extracted.email = emailMatch[1];
  }

  return extracted;
};

// ===== Product Detection =====

const detectProductMention = (message) => {
  const msg = message.toLowerCase();

  for (const p of products) {
    const fullName = `${p.brand} ${p.model}`.toLowerCase();
    if (msg.includes(fullName)) return p;
    if (msg.includes(p.model.toLowerCase()) && p.model.length > 2) return p;
  }

  const results = searchProducts(msg);
  if (results.length === 1) return results[0];

  return null;
};

// ===== Intent Detection =====

const detectBackIntent = (message) => {
  return /\b(go back|back|previous|change phone|different phone|change product|start over|restart|different model)\b/i.test(message);
};

const detectConsents = (message) => {
  const msg = message.toLowerCase();
  const consents = {};
  if (/\b(yes|agree|i agree|accept|okay|ok|sure|fine|go ahead|proceed|i consent|approved?)\b/i.test(msg)) {
    consents.bureau = true;
    consents.tnc = true;
    consents.lenderShare = true;
  }
  return consents;
};

// ===== Template Response Engine =====

const formatPrice = (price) => {
  if (!price) return '';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);
};

const generateResponse = (session, extracted) => {
  const { journeyState, selectedCategory, selectedProduct: p, collectedFields: f } = session;

  // Build acknowledgment for fields just extracted in this message
  const acks = [];
  if (extracted.name) acks.push(`Hi ${f.name}`);
  if (extracted.mobile) acks.push('got your number');
  if (extracted.employment) acks.push(`${f.employment}, noted`);
  if (extracted.salary) acks.push(`${formatPrice(parseInt(f.salary))}/month, got it`);
  const ack = acks.length > 0 ? acks.join(', ') + '. ' : '';

  switch (journeyState) {
    case 'welcome':
      return "Welcome! I can help you explore our products. We have smartphones, laptops, audio devices, and wearables. Which category interests you?";

    case 'category_selection':
      return "Which category would you like to explore? You can say smartphones, laptops, audio, or wearables.";

    case 'category_browsing':
      const catName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'products';
      return `Great! Here are our ${catName}. You can filter by brand, price range, or features. Just tell me what you're looking for!`;

    case 'product_selected':
      return `${p?.brand} ${p?.model} at ${formatPrice(p?.price)} — great pick! Would you like to explore EMI options for this product?`;

    case 'collecting_details': {
      if (!f.name) return ack + "Let's set up your EMI. What's your full name?";
      if (!f.mobile) return ack + `What's your 10-digit mobile number?`;
      if (!f.employment) return ack + 'What do you do — salaried, self-employed, or business?';
      if (!f.salary) return ack + "And what's your monthly income?";
      return ack + 'I have all your details!';
    }

    case 'consent':
      return ack + "Before we check your eligibility, I need your consent to run a credit check and share your details with our lending partners.";

    case 'checking_eligibility':
      return 'Checking your eligibility with lenders, hang tight...';

    case 'showing_offers':
      return "Here are your EMI options! Pick a lender and tenure that works for you.";

    case 'kyc':
      return "Almost there! Quick Aadhaar verification needed — takes less than a minute.";

    case 'final_offers':
      return "Here's your final loan summary. Ready to pay the down payment and confirm?";

    case 'downpayment':
      return 'Complete the UPI payment to lock in your order.';

    case 'repayment':
      return "Now let's set up auto-debit for your monthly EMIs.";

    case 'kfs':
      return 'Please review the Key Fact Statement and accept to finalize your loan.';

    case 'success':
      return 'Congratulations! Your loan is approved and your order is confirmed! Delivery is on the way.';

    default:
      return 'How can I help you?';
  }
};

// ===== Rich Card Generation =====

const generateRichCards = (session) => {
  const { journeyState, selectedCategory, selectedProduct } = session;

  switch (journeyState) {
    case 'welcome':
    case 'category_selection':
      return [{
        type: 'category_list',
        categories: CATEGORIES.map(c => ({ id: c.id, name: c.name, desc: c.desc })),
      }];

    case 'category_browsing':
      const categoryProducts = selectedCategory
        ? products.filter(p => p.category === selectedCategory)
        : products;
      return [{
        type: 'product_carousel',
        category: selectedCategory,
        products: categoryProducts.slice(0, 10).map(p => ({
          id: p.id, brand: p.brand, model: p.model,
          price: p.price, mrp: p.mrp,
          highlights: p.highlights.slice(0, 3), colors: p.colors,
        })),
      }];

    case 'product_selected':
      if (!selectedProduct) return [];
      const product = getProductById(selectedProduct.id);
      if (!product) return [];
      return [{
        type: 'product_detail',
        product: {
          id: product.id, brand: product.brand, model: product.model,
          price: product.price, mrp: product.mrp, specs: product.specs,
          highlights: product.highlights, colors: product.colors,
          storage_options: product.storage_options,
        },
      }];

    case 'checking_eligibility':
      return [{ type: 'eligibility_loader' }];

    case 'showing_offers': {
      const amount = selectedProduct?.price || 129999;
      const downpayment = Math.round(amount * 0.1);
      const loanAmount = amount - downpayment;
      return [{
        type: 'offer_cards',
        loanAmount, downpayment,
        lenders: LENDERS.map(l => ({
          id: l.id, name: l.name, rate: l.rates[0],
          maxTenure: l.maxTenure, noCost: l.noCost || [],
          tenures: [3, 6, 9, 12, 18, 24].filter(t => t <= l.maxTenure).map(t => {
            const rate = l.noCost?.includes(t) ? 0 : l.rates[Math.min(Math.floor(t / 12), l.rates.length - 1)];
            return { months: t, emi: calculateEmi(loanAmount, t, rate), rate, noCost: l.noCost?.includes(t) || false };
          }),
        })),
      }];
    }

    case 'offer_review': {
      if (!session.selectedOffer || !session.selectedTenure) return [];
      const lender = LENDERS.find(l => l.id === session.selectedOffer);
      if (!lender) return [];
      const amt = selectedProduct?.price || 129999;
      const dp = Math.round(amt * 0.1);
      const loan = amt - dp;
      const rate = lender.noCost?.includes(session.selectedTenure)
        ? 0 : lender.rates[Math.min(Math.floor(session.selectedTenure / 12), lender.rates.length - 1)];
      const emi = calculateEmi(loan, session.selectedTenure, rate);
      const totalPayable = emi * session.selectedTenure;
      const totalInterest = totalPayable - loan;
      return [{
        type: 'offer_detail_card',
        lenderId: lender.id,
        lenderName: lender.name,
        loanAmount: loan,
        downpayment: dp,
        tenure: session.selectedTenure,
        rate,
        emi,
        totalPayable,
        totalInterest,
        noCost: lender.noCost?.includes(session.selectedTenure) || false,
      }];
    }

    case 'repayment':
      return [{ type: 'suggestion_chips', suggestions: ['Set Up Auto-debit'] }];

    case 'success': {
      if (!session.selectedProduct) return [];
      const lender = LENDERS.find(l => l.id === session.selectedOffer);
      const amt = session.selectedProduct.price;
      const dp = Math.round(amt * 0.1);
      const loan = amt - dp;
      const rate = lender?.noCost?.includes(session.selectedTenure) ? 0
        : lender?.rates[Math.min(Math.floor((session.selectedTenure || 0) / 12), (lender?.rates.length || 1) - 1)] || 0;
      const emi = lender ? calculateEmi(loan, session.selectedTenure, rate) : 0;
      return [{
        type: 'success_card',
        orderId: session.orderId || 'LMP00000000',
        product: session.selectedProduct,
        lenderName: lender?.name || '',
        tenure: session.selectedTenure,
        emi,
        loanAmount: loan,
        downpayment: dp,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      }];
    }

    case 'final_offers': {
      if (!session.selectedOffer || !session.selectedTenure) return [];
      const lender = LENDERS.find(l => l.id === session.selectedOffer);
      if (!lender) return [];
      const amt = selectedProduct?.price || 129999;
      const dp = Math.round(amt * 0.1);
      const loan = amt - dp;
      const rate = lender.noCost?.includes(session.selectedTenure)
        ? 0 : lender.rates[Math.min(Math.floor(session.selectedTenure / 12), lender.rates.length - 1)];
      const emi = calculateEmi(loan, session.selectedTenure, rate);
      return [{
        type: 'loan_summary', lender: lender.name, lenderId: lender.id,
        loanAmount: loan, downpayment: dp, tenure: session.selectedTenure,
        rate, emi, totalPayable: emi * session.selectedTenure + dp,
      }];
    }

    default:
      return [];
  }
};

// ===== Progress Calculation =====

const getProgress = (state) => {
  const map = {
    browsing: 0, product_selected: 1,
    collecting_details: 2, consent: 2,
    checking_eligibility: 3, showing_offers: 3,
    offer_review: 3, kyc: 4, final_offers: 4,
    downpayment: 5, repayment: 5, kfs: 5,
    success: 6,
  };
  return map[state] || 0;
};

// ===== State Transition Logic =====

const autoTransition = (session) => {
  const { journeyState, collectedFields, consents } = session;

  // Auto-advance from welcome to category selection only once
  if (journeyState === 'welcome') {
    return 'category_selection';
  }

  if (journeyState === 'collecting_details') {
    if (collectedFields.name && collectedFields.mobile && collectedFields.employment && collectedFields.salary) {
      return 'consent';
    }
  }

  if (journeyState === 'consent') {
    if (consents.bureau && consents.tnc && consents.lenderShare) {
      return 'checking_eligibility';
    }
  }

  // Auto-advance past checking_eligibility (no real lender API)
  if (journeyState === 'checking_eligibility') {
    return 'showing_offers';
  }

  return null;
};

// ===== Main Handler =====

exports.processMessage = async (req, res) => {
  try {
    const { message, sessionId: reqSessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const sessionId = reqSessionId || `journey_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let session = getSession(sessionId) || createSession(sessionId);

    // 1. Detect back intent
    if (detectBackIntent(message)) {
      const currentIdx = STATES.indexOf(session.journeyState);
      if (currentIdx > 0) {
        if (session.journeyState === 'collecting_details' || session.journeyState === 'consent') {
          session.journeyState = 'product_selected';
        } else if (session.journeyState === 'product_selected') {
          session.journeyState = 'browsing';
          session.selectedProduct = null;
        } else {
          session.journeyState = STATES[currentIdx - 1];
        }
      }
    }

    // 2. Detect category selection with flexible matching
    if (session.journeyState === 'welcome' || session.journeyState === 'category_selection') {
      const msg = message.toLowerCase().replace(/\s+/g, ''); // Remove spaces
      console.log('Checking category. State:', session.journeyState, 'Message:', msg);

      // Category aliases for flexible matching
      const categoryAliases = {
        'smartphones': ['smartphone', 'smartphones', 'phone', 'phones', 'mobile', 'mobiles'],
        'laptops': ['laptop', 'laptops', 'computer', 'computers', 'notebook', 'notebooks'],
        'audio': ['audio', 'headphones', 'earbuds', 'earphone', 'earphones', 'speaker', 'speakers', 'sound'],
        'wearables': ['wearable', 'wearables', 'watch', 'watches', 'smartwatch', 'smartwatches', 'band', 'bands', 'fitness'],
      };

      for (const cat of CATEGORIES) {
        const aliases = categoryAliases[cat.id] || [cat.id];
        const catName = cat.name.toLowerCase().replace(/\s+/g, '');

        if (aliases.some(a => msg.includes(a)) || msg.includes(catName)) {
          console.log('Category detected:', cat.id);
          session.selectedCategory = cat.id;
          session.journeyState = 'category_browsing';
          break;
        }
      }

      // Transition to category selection if asking for products
      if (session.journeyState === 'welcome' && /\b(show|browse|see|view|what|products|categories)\b/i.test(message)) {
        console.log('Transitioning to category_selection');
        session.journeyState = 'category_selection';
      }
    }

    // 3. Detect product mention
    if (session.journeyState === 'welcome' || session.journeyState === 'category_selection' || session.journeyState === 'category_browsing' || session.journeyState === 'product_selected') {
      const product = detectProductMention(message);
      if (product) {
        session.selectedProduct = { id: product.id, brand: product.brand, model: product.model, price: product.price };
        if (!session.selectedCategory && product.category) {
          session.selectedCategory = product.category;
        }
        session.journeyState = 'product_selected';
      }
    }

    // 3. Extract fields
    let extracted = {};
    let stored = {};
    if (session.journeyState === 'collecting_details' || session.journeyState === 'product_selected') {
      extracted = extractFields(message, session);
      for (const [key, value] of Object.entries(extracted)) {
        if (key === 'aadhaar') {
          session.kycData.aadhaar = value;
          stored[key] = value;
        } else if (session.collectedFields.hasOwnProperty(key) && !session.collectedFields[key]) {
          session.collectedFields[key] = value;
          stored[key] = value;
        }
      }

      // Proceed with loan if user says yes at product_selected
      if (session.journeyState === 'product_selected') {
        if (/\b(yes|proceed|emi|loan|buy|finance|installment|apply|let'?s go|sure|okay|ok)\b/i.test(message)) {
          session.journeyState = 'collecting_details';
        }
      }
    }

    // 4. Consent — handled via overlay action (consent_given), not text

    // 5. Offer/tenure selection
    if (session.journeyState === 'showing_offers') {
      const msg = message.toLowerCase();
      for (const lender of LENDERS) {
        if (msg.includes(lender.name.toLowerCase()) || msg.includes(lender.id)) {
          session.selectedOffer = lender.id;
        }
      }
      const tenureMatch = msg.match(/(\d+)\s*(?:month|mo)/i);
      if (tenureMatch) session.selectedTenure = parseInt(tenureMatch[1]);
    }

    // 6. Auto-transition (loop until stable)
    let autoTarget;
    while ((autoTarget = autoTransition(session))) {
      console.log('Auto-transition:', session.journeyState, '→', autoTarget);
      session.journeyState = autoTarget;
    }

    console.log('Final state:', session.journeyState, 'Category:', session.selectedCategory);

    // 7. Generate deterministic response
    const responseText = generateResponse(session, stored);

    // 8. Store chat history
    session.chatHistory.push({ role: 'user', content: message });
    session.chatHistory.push({ role: 'assistant', content: responseText });
    if (session.chatHistory.length > 20) {
      session.chatHistory = session.chatHistory.slice(-20);
    }

    // 9. Determine overlay action
    let action = null;
    if (session.journeyState === 'consent') action = 'open_consent';
    else if (session.journeyState === 'kyc' && !session.kycData.aadhaarVerified) action = 'open_aadhaar_otp';
    else if (session.journeyState === 'downpayment') action = 'open_upi_payment';
    else if (session.journeyState === 'kfs') action = 'open_kfs_preview';

    // 10. Respond
    res.json({
      sessionId,
      text: responseText,
      richCards: generateRichCards(session),
      action,
      journeyState: session.journeyState,
      progress: getProgress(session.journeyState),
      selectedProduct: session.selectedProduct,
      collectedFields: session.collectedFields,
    });

  } catch (error) {
    console.error('Journey processMessage error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.', fallback: true });
  }
};

// ===== Get Session State (reconnect) =====

exports.getState = (req, res) => {
  const { sid } = req.params;
  const session = getSession(sid);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    sessionId: session.sessionId,
    journeyState: session.journeyState,
    selectedProduct: session.selectedProduct,
    collectedFields: session.collectedFields,
    progress: getProgress(session.journeyState),
    chatHistory: session.chatHistory.slice(-20),
  });
};

// ===== Handle Action (overlay results) =====

exports.handleAction = async (req, res) => {
  try {
    const { sessionId, action, data } = req.body;

    if (!sessionId || !action) {
      return res.status(400).json({ error: 'sessionId and action are required' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let responseText = '';
    let nextState = session.journeyState;

    switch (action) {
      case 'consent_given': {
        const givenConsents = data?.consents || [];
        const required = ['bureau', 'lenderShare', 'aadhaarKyc', 'tnc', 'privacy', 'communication'];
        const allGiven = required.every(c => givenConsents.includes(c));
        if (!allGiven) {
          return res.status(400).json({ error: 'All consents are required to proceed.' });
        }
        session.consents = { bureau: true, tnc: true, lenderShare: true, privacy: true, aadhaarKyc: true, communication: true };
        session.consentTimestamp = new Date().toISOString();
        session.journeyState = 'checking_eligibility';
        // Auto-advance through checking_eligibility → showing_offers
        let autoTarget;
        while ((autoTarget = autoTransition(session))) {
          session.journeyState = autoTarget;
        }
        nextState = session.journeyState;
        responseText = "Here are your EMI options! Pick a lender and tenure that works for you.";
        break;
      }

      case 'aadhaar_verified': {
        session.kycData.aadhaarVerified = true;
        session.kycData.aadhaar = data?.aadhaar || session.kycData.aadhaar;
        nextState = 'final_offers';
        const maskedAadhaar = session.kycData.aadhaar
          ? 'XXXX XXXX ' + session.kycData.aadhaar.slice(-4)
          : 'XXXX XXXX XXXX';
        const name = session.collectedFields.name || 'Customer';
        responseText = `KYC Verified ✓\n\nName: ${name}\nAadhaar: ${maskedAadhaar}\nStatus: Identity confirmed`;
        break;
      }

      case 'offer_selected':
        session.selectedOffer = data?.lenderId;
        session.selectedTenure = data?.tenure;
        nextState = 'offer_review';
        responseText = `Great choice! Here are the full details for your ${data?.lenderName} loan. Please review before we proceed to KYC.`;
        break;

      case 'confirm_offer':
        nextState = 'kyc';
        responseText = `Perfect! Let's verify your identity now. Please complete Aadhaar KYC to proceed.`;
        break;

      case 'initiate_payment':
        nextState = 'downpayment';
        responseText = 'Opening payment...';
        break;

      case 'payment_done':
        nextState = 'repayment';
        responseText = "Down payment received! Now let's set up your EMI auto-debit.";
        break;

      case 'repayment_setup':
        nextState = 'kfs';
        responseText = 'Mandate set up successfully! Please review the Key Fact Statement.';
        break;

      case 'kfs_accepted':
        session.orderId = 'LMP' + Date.now().toString().slice(-8).toUpperCase();
        nextState = 'success';
        responseText = `Your loan is approved and order confirmed! Order ID: ${session.orderId}`;
        break;

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    session.journeyState = nextState;
    session.chatHistory.push({ role: 'assistant', content: responseText });

    res.json({
      sessionId,
      text: responseText,
      journeyState: nextState,
      progress: getProgress(nextState),
      richCards: generateRichCards(session),
      action: nextState === 'kyc' ? 'open_aadhaar_otp' : nextState === 'downpayment' ? 'open_upi_payment' : nextState === 'kfs' ? 'open_kfs_preview' : null,
      selectedProduct: session.selectedProduct,
    });

  } catch (error) {
    console.error('Journey handleAction error:', error);
    res.status(500).json({ error: 'Failed to process action' });
  }
};

// Export for voice controller
module.exports = {
  processMessage: exports.processMessage,
  handleAction: exports.handleAction,
  getState: exports.getState,
};
