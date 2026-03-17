const axios = require('axios');
require('dotenv').config();

// Juspay Grid AI API Configuration
const GRID_AI_API_URL = 'https://grid.ai.juspay.net/v1/chat/completions';
const GRID_AI_API_KEY = process.env.GRID_AI_API_KEY;

// In-memory storage for chat history (in production, use a database)
const chatHistory = {};

// Product inventory with pricing, discounts, and complementary products
const PRODUCT_INVENTORY = {
  // Smartphones - Multiple Brands
  "iPhone 15 Pro": {
    price: 999,
    discount: 10,
    finalPrice: 899,
    stock: 25,
    category: "Smartphones",
    brand: "Apple",
    features: ["A17 Pro chip", "Titanium design", "48MP camera", "USB-C"],
    relatedProducts: ["AirPods Pro", "iPhone Case", "Wireless Charger"]
  },
  "Samsung Galaxy S24 Ultra": {
    price: 1199,
    discount: 12,
    finalPrice: 1055,
    stock: 30,
    category: "Smartphones",
    brand: "Samsung",
    features: ["Snapdragon 8 Gen 3", "200MP camera", "S Pen", "5000mAh battery"],
    relatedProducts: ["Galaxy Buds Pro", "Samsung Case", "Wireless Charger"]
  },
  "Google Pixel 8 Pro": {
    price: 899,
    discount: 15,
    finalPrice: 764,
    stock: 35,
    category: "Smartphones",
    brand: "Google",
    features: ["Tensor G3", "AI features", "50MP camera", "7 years updates"],
    relatedProducts: ["Pixel Buds Pro", "Pixel Case", "USB-C Cable"]
  },
  "OnePlus 12": {
    price: 799,
    discount: 18,
    finalPrice: 655,
    stock: 40,
    category: "Smartphones",
    brand: "OnePlus",
    features: ["Snapdragon 8 Gen 3", "120Hz display", "100W charging", "Hasselblad camera"],
    relatedProducts: ["OnePlus Buds Pro", "Phone Case", "Fast Charger"]
  },

  // Laptops - Multiple Brands
  "MacBook Air M3": {
    price: 1299,
    discount: 10,
    finalPrice: 1169,
    stock: 35,
    category: "Laptops",
    brand: "Apple",
    features: ["M3 chip", "15\" display", "8GB RAM", "256GB SSD", "Fanless design"],
    relatedProducts: ["USB-C Hub", "Laptop Sleeve", "Magic Mouse"]
  },
  "Dell XPS 15": {
    price: 1799,
    discount: 15,
    finalPrice: 1529,
    stock: 20,
    category: "Laptops",
    brand: "Dell",
    features: ["Intel i7-13700H", "16GB RAM", "512GB SSD", "RTX 4050", "OLED display"],
    relatedProducts: ["Dell Mouse", "Laptop Bag", "USB-C Dock"]
  },
  "HP Spectre x360": {
    price: 1399,
    discount: 12,
    finalPrice: 1231,
    stock: 25,
    category: "Laptops",
    brand: "HP",
    features: ["Intel i7", "16GB RAM", "1TB SSD", "2-in-1 convertible", "Thunderbolt 4"],
    relatedProducts: ["HP Pen", "Laptop Sleeve", "Wireless Mouse"]
  },
  "Lenovo ThinkPad X1": {
    price: 1599,
    discount: 10,
    finalPrice: 1439,
    stock: 18,
    category: "Laptops",
    brand: "Lenovo",
    features: ["Intel i7", "16GB RAM", "512GB SSD", "Business grade", "Military spec"],
    relatedProducts: ["ThinkPad Dock", "Laptop Bag", "USB Mouse"]
  },
  "ASUS ROG Zephyrus": {
    price: 1899,
    discount: 14,
    finalPrice: 1633,
    stock: 15,
    category: "Laptops",
    brand: "ASUS",
    features: ["AMD Ryzen 9", "32GB RAM", "1TB SSD", "RTX 4070", "Gaming laptop"],
    relatedProducts: ["Gaming Mouse", "Laptop Cooler", "Headset"]
  },

  // Tablets - Multiple Brands
  "iPad Pro 11\"": {
    price: 899,
    discount: 8,
    finalPrice: 827,
    stock: 30,
    category: "Tablets",
    brand: "Apple",
    features: ["M2 chip", "11\" display", "Face ID", "5G capable"],
    relatedProducts: ["Apple Pencil Pro", "iPad Case", "USB-C Hub"]
  },
  "Samsung Galaxy Tab S9": {
    price: 799,
    discount: 12,
    finalPrice: 703,
    stock: 35,
    category: "Tablets",
    brand: "Samsung",
    features: ["Snapdragon 8 Gen 2", "11\" AMOLED", "S Pen included", "IP68 waterproof"],
    relatedProducts: ["Book Cover", "S Pen Tips", "Fast Charger"]
  },
  "Microsoft Surface Pro 9": {
    price: 999,
    discount: 10,
    finalPrice: 899,
    stock: 25,
    category: "Tablets",
    brand: "Microsoft",
    features: ["Intel i7", "16GB RAM", "256GB SSD", "Runs Windows 11", "Detachable keyboard"],
    relatedProducts: ["Type Cover", "Surface Pen", "Surface Mouse"]
  },

  // Audio - Multiple Brands
  "AirPods Pro 2": {
    price: 249,
    discount: 15,
    finalPrice: 212,
    stock: 50,
    category: "Audio",
    brand: "Apple",
    features: ["Active Noise Cancellation", "Transparency mode", "Spatial audio", "USB-C charging"],
    relatedProducts: ["AirPods Case", "Wireless Charger", "Ear Tips"]
  },
  "Sony WH-1000XM5": {
    price: 399,
    discount: 20,
    finalPrice: 319,
    stock: 45,
    category: "Audio",
    brand: "Sony",
    features: ["Industry-leading ANC", "30hr battery", "LDAC support", "Premium comfort"],
    relatedProducts: ["Carrying Case", "Audio Cable", "Replacement Pads"]
  },
  "Bose QuietComfort Ultra": {
    price: 429,
    discount: 15,
    finalPrice: 365,
    stock: 40,
    category: "Audio",
    brand: "Bose",
    features: ["World-class ANC", "Spatial audio", "24hr battery", "CustomTune technology"],
    relatedProducts: ["Travel Case", "Audio Cable", "Ear Tips"]
  },
  "Samsung Galaxy Buds 2 Pro": {
    price: 229,
    discount: 18,
    finalPrice: 188,
    stock: 55,
    category: "Audio",
    brand: "Samsung",
    features: ["ANC", "360 audio", "Hi-Fi sound", "IPX7 waterproof"],
    relatedProducts: ["Ear Tips", "Wireless Charger", "Galaxy Phone"]
  },

  // Smartwatches - Multiple Brands
  "Apple Watch Series 9": {
    price: 399,
    discount: 12,
    finalPrice: 351,
    stock: 50,
    category: "Wearables",
    brand: "Apple",
    features: ["S9 chip", "Always-On display", "ECG app", "Crash Detection"],
    relatedProducts: ["Watch Band", "iPhone", "AirPods"]
  },
  "Samsung Galaxy Watch 6": {
    price: 299,
    discount: 15,
    finalPrice: 254,
    stock: 55,
    category: "Wearables",
    brand: "Samsung",
    features: ["Exynos W930", "AMOLED display", "Sleep tracking", "Wear OS"],
    relatedProducts: ["Watch Band", "Galaxy Phone", "Galaxy Buds"]
  },
  "Garmin Fenix 7": {
    price: 699,
    discount: 10,
    finalPrice: 629,
    stock: 30,
    category: "Wearables",
    brand: "Garmin",
    features: ["Multi-sport GPS", "Solar charging", "Sapphire lens", "Advanced metrics"],
    relatedProducts: ["Heart Rate Monitor", "Screen Protector", "Watch Band"]
  },

  // Gaming Consoles
  "PlayStation 5": {
    price: 499,
    discount: 8,
    finalPrice: 459,
    stock: 40,
    category: "Gaming",
    brand: "Sony",
    features: ["4K gaming", "Ray tracing", "Ultra-high speed SSD", "DualSense controller"],
    relatedProducts: ["PS5 Games", "Extra Controller", "Headset"]
  },
  "Xbox Series X": {
    price: 499,
    discount: 10,
    finalPrice: 449,
    stock: 35,
    category: "Gaming",
    brand: "Microsoft",
    features: ["4K 120fps", "1TB SSD", "Game Pass compatible", "Quick Resume"],
    relatedProducts: ["Xbox Games", "Wireless Controller", "Game Pass"]
  },
  "Nintendo Switch OLED": {
    price: 349,
    discount: 12,
    finalPrice: 307,
    stock: 60,
    category: "Gaming",
    brand: "Nintendo",
    features: ["7\" OLED screen", "Enhanced audio", "64GB storage", "Dock included"],
    relatedProducts: ["Switch Games", "Pro Controller", "Carrying Case"]
  },

  // Smart Home
  "Amazon Echo Dot": {
    price: 49,
    discount: 25,
    finalPrice: 37,
    stock: 100,
    category: "Smart Home",
    brand: "Amazon",
    features: ["Alexa built-in", "Smart speaker", "Voice control", "Music streaming"],
    relatedProducts: ["Smart Bulb", "Smart Plug", "Fire TV Stick"]
  },
  "Google Nest Hub": {
    price: 99,
    discount: 20,
    finalPrice: 79,
    stock: 70,
    category: "Smart Home",
    brand: "Google",
    features: ["7\" display", "Google Assistant", "Smart home control", "Photo frame"],
    relatedProducts: ["Nest Camera", "Smart Bulb", "Chromecast"]
  }
};

// System prompt for the e-commerce chatbot
const SYSTEM_PROMPT = `You are a friendly shopping assistant at an electronics store. Be VERY concise — this is used in voice mode.

RULES:
- Keep replies to 1-3 short sentences MAX. No long paragraphs.
- No bullet lists, no markdown, no asterisks, no bold text.
- Talk like a helpful friend, not a brochure. Be natural and casual.
- Only mention 1-2 products at a time, not a full catalog dump.
- Use plain prices like "79,999 rupees" not formatted currencies.
- When comparing, keep it to one key difference per product.
- Ask ONE question at a time to narrow down what they need.
- Skip filler like "Great question!" or "Absolutely!" — just answer.

INVENTORY:
${Object.entries(PRODUCT_INVENTORY).map(([name, details]) =>
  `${name}: ${details.finalPrice} (${details.discount}% off), ${details.stock} left`
).join('\n')}

When they want to buy, confirm the product and guide to checkout.`;

// Function to generate quick action options based on context
const generateOptions = (userMessage, assistantResponse) => {
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = assistantResponse.toLowerCase();
  
  // Checkout/purchase intent detected
  if (lowerMessage.match(/\b(buy|checkout|purchase|order|get it|take it|i'll take|add to cart)\b/)) {
    return ["Proceed to Checkout", "Add Accessories", "View Cart", "Continue Shopping"];
  }
  
  // Product categories
  if (lowerMessage.includes('phone') || lowerMessage.includes('smartphone') || lowerResponse.includes('phone')) {
    return ["iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "Google Pixel 8 Pro", "OnePlus 12"];
  }
  
  if (lowerMessage.includes('headphone') || lowerMessage.includes('audio') || lowerMessage.includes('earbuds') || lowerResponse.includes('audio')) {
    return ["Sony WH-1000XM5", "AirPods Pro 2", "Bose QuietComfort Ultra", "Galaxy Buds 2 Pro"];
  }
  
  if (lowerMessage.includes('laptop') || lowerMessage.includes('notebook') || lowerResponse.includes('laptop')) {
    return ["MacBook Air M3", "Dell XPS 15", "HP Spectre x360", "ASUS ROG Zephyrus"];
  }
  
  if (lowerMessage.includes('tablet') || lowerResponse.includes('tablet')) {
    return ["iPad Pro 11\"", "Samsung Galaxy Tab S9", "Microsoft Surface Pro 9"];
  }
  
  if (lowerMessage.includes('watch') || lowerMessage.includes('smartwatch') || lowerMessage.includes('wearable')) {
    return ["Apple Watch Series 9", "Samsung Galaxy Watch 6", "Garmin Fenix 7"];
  }
  
  if (lowerMessage.includes('gaming') || lowerMessage.includes('console') || lowerMessage.includes('playstation') || lowerMessage.includes('xbox')) {
    return ["PlayStation 5", "Xbox Series X", "Nintendo Switch OLED"];
  }
  
  if (lowerMessage.includes('smart home') || lowerMessage.includes('alexa') || lowerMessage.includes('google home')) {
    return ["Amazon Echo Dot", "Google Nest Hub", "Smart Bulb", "Smart Plug"];
  }
  
  // Discount/deals inquiries
  if (lowerMessage.includes('deal') || lowerMessage.includes('discount') || lowerMessage.includes('sale') || lowerMessage.includes('offer')) {
    return ["Best Deals", "Laptop Deals", "Phone Deals", "Audio Deals"];
  }
  
  // Brand-specific
  if (lowerMessage.includes('apple')) {
    return ["iPhone 15 Pro", "MacBook Air M3", "AirPods Pro 2", "Apple Watch Series 9"];
  }
  
  if (lowerMessage.includes('samsung')) {
    return ["Galaxy S24 Ultra", "Galaxy Tab S9", "Galaxy Watch 6", "Galaxy Buds 2 Pro"];
  }
  
  if (lowerMessage.includes('sony')) {
    return ["WH-1000XM5", "PlayStation 5"];
  }
  
  // Budget-related
  if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable') || lowerMessage.includes('price')) {
    return ["Under $200", "Under $500", "Under $1000", "Premium Products"];
  }
  
  // Comparison requests
  if (lowerMessage.includes('compare') || lowerMessage.includes('difference') || lowerMessage.includes('versus') || lowerMessage.includes('vs')) {
    return ["Compare Phones", "Compare Laptops", "Compare Tablets", "Compare Audio"];
  }
  
  // Greeting context
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return ["Smartphones", "Laptops", "Gaming", "Best Deals"];
  }
  
  // Default shopping options
  return ["Smartphones", "Laptops", "Audio", "Best Deals"];
};

// Detect if user wants to checkout
const detectCheckoutIntent = (message) => {
  const checkoutKeywords = /\b(buy|checkout|purchase|order|get it|take it|i'll take|add to cart|proceed|pay now)\b/i;
  return checkoutKeywords.test(message);
};

// Extract product mentions from conversation
const extractProductMentions = (conversationHistory, currentMessage) => {
  const allText = conversationHistory.map(msg => msg.content).join(' ') + ' ' + currentMessage;
  const mentionedProducts = [];
  
  Object.keys(PRODUCT_INVENTORY).forEach(productName => {
    if (allText.toLowerCase().includes(productName.toLowerCase())) {
      mentionedProducts.push(productName);
    }
  });
  
  return mentionedProducts;
};

// Process message using Juspay Grid AI
const processMessage = async (message, conversationHistory = []) => {
  try {
    // Build messages array for Grid AI API
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call Juspay Grid AI API
    const response = await axios.post(GRID_AI_API_URL, {
      model: 'open-fast',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${GRID_AI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const assistantResponse = response.data.choices[0].message.content;
    const options = generateOptions(message, assistantResponse);

    return {
      text: assistantResponse,
      options: options
    };
  } catch (error) {
    console.error('Error calling Grid AI API:', error);
    if (error.response) {
      console.error('API Response Error:', error.response.data);
    }
    throw error;
  }
};

// Handle incoming messages
exports.handleMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate session ID if not provided
    const session = sessionId || `session_${Date.now()}`;

    // Initialize chat history for this session if it doesn't exist
    if (!chatHistory[session]) {
      chatHistory[session] = [];
    }

    // Get conversation history in OpenAI format (last 10 messages to keep context manageable)
    const conversationHistory = chatHistory[session]
      .slice(-10)
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.message
      }));

    // Detect checkout intent
    const isCheckout = detectCheckoutIntent(message);
    const mentionedProducts = extractProductMentions(conversationHistory, message);

    // Process message and get bot response using OpenAI
    const botResponse = await processMessage(message, conversationHistory);

    // Store user message
    chatHistory[session].push({
      type: 'user',
      message: message,
      timestamp: new Date()
    });

    // Store bot response
    chatHistory[session].push({
      type: 'bot',
      message: botResponse.text,
      options: botResponse.options,
      timestamp: new Date()
    });

    // Prepare response
    const responseData = {
      sessionId: session,
      response: botResponse.text,
      options: botResponse.options,
      timestamp: new Date()
    };

    // If checkout intent detected, include checkout URL
    if (isCheckout && mentionedProducts.length > 0) {
      responseData.checkoutUrl = 'https://www.google.com';
      responseData.checkoutReady = true;
      responseData.selectedProducts = mentionedProducts.map(name => ({
        name,
        price: PRODUCT_INVENTORY[name]?.finalPrice,
        discount: PRODUCT_INVENTORY[name]?.discount
      }));
    }

    // Return response
    res.json(responseData);

  } catch (error) {
    console.error('Error handling message:', error);
    
    // Return a fallback response if Grid AI API fails
    res.status(500).json({ 
      error: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our support team.',
      fallback: true
    });
  }
};

// Get chat history for a session
exports.getChatHistory = (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.json({ history: [] });
    }

    const history = chatHistory[sessionId] || [];
    res.json({ history });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get product inventory
exports.getProducts = (req, res) => {
  try {
    res.json({ 
      products: PRODUCT_INVENTORY,
      totalProducts: Object.keys(PRODUCT_INVENTORY).length
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// AI-powered recommendation reasons (lightweight — only generates "why" text)
const reasonsCache = {};

exports.getRecommendationReasons = async (req, res) => {
  try {
    const { product, recommendations } = req.body;
    // product: "Samsung Galaxy S26"
    // recommendations: ["iPhone 16 Pro", "Pixel 10 Pro", ...]

    if (!product || !recommendations || !recommendations.length) {
      return res.status(400).json({ error: 'product and recommendations are required' });
    }

    const cacheKey = `${product}:${recommendations.join(',')}`;
    if (reasonsCache[cacheKey]) {
      return res.json(reasonsCache[cacheKey]);
    }

    const names = recommendations.slice(0, 4);
    const prompt = `Viewing: ${product}. For each phone, write max 8 words on why it's similar (design/style/audience).
${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}
Reply ONLY as JSON: {"phone name":"8 word reason"}`;

    const response = await axios.post(GRID_AI_API_URL, {
      model: 'open-fast',
      messages: [
        { role: 'system', content: 'JSON only. No markdown. Max 8 words per value.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${GRID_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    });

    const choice = response.data?.choices?.[0];
    const rawContent = choice?.message?.content || choice?.text || '';
    console.log('Grid AI raw response:', JSON.stringify(response.data).slice(0, 500));

    if (!rawContent) {
      return res.json({ reasons: {}, error: 'empty_response' });
    }

    let text = rawContent.trim();
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    let reasons;
    try {
      reasons = JSON.parse(text);
    } catch (parseErr) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { reasons = JSON.parse(jsonMatch[0]); } catch (e) {
          console.error('Parse failed:', text);
          return res.json({ reasons: {}, error: 'parse_failed' });
        }
      } else {
        console.error('No JSON found:', text);
        return res.json({ reasons: {}, error: 'parse_failed' });
      }
    }

    const result = { reasons };
    reasonsCache[cacheKey] = result;
    res.json(result);
  } catch (error) {
    console.error('Recommendation reasons error:', error.response?.data || error.message);
    res.status(500).json({ reasons: {}, error: 'api_failed' });
  }
};

// Get specific product details
exports.getProduct = (req, res) => {
  try {
    const { productName } = req.params;
    const product = PRODUCT_INVENTORY[productName];
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ 
      name: productName,
      ...product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
