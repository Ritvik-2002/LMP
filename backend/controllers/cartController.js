const crypto = require('crypto');

// In-memory session store (swap with Redis/DB in production)
const sessions = new Map();

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

const getOrCreateSession = (sessionId) => {
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    session.lastActive = Date.now();
    return session;
  }
  const id = `sess_${crypto.randomBytes(8).toString('hex')}`;
  const session = {
    id,
    cart: [],
    createdAt: Date.now(),
    lastActive: Date.now(),
  };
  sessions.set(id, session);
  return session;
};

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActive > SESSION_TTL) sessions.delete(id);
  }
}, 5 * 60 * 1000);

// POST /api/cart/add
exports.addToCart = (req, res) => {
  const { sessionId, product } = req.body;
  if (!product || !product.id) {
    return res.status(400).json({ error: 'Product with id is required' });
  }

  const session = getOrCreateSession(sessionId);
  const existing = session.cart.find(item => item.id === product.id && String(item.storage) === String(product.storage) && item.color === product.color);

  if (existing) {
    // Already in cart, don't duplicate
  } else {
    session.cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      mrp: product.mrp,
      color: product.color,
      storage: product.storage,
      image_bg: product.image_bg,
      color_hex: product.color_hex,
      qty: 1,
    });
  }

  res.json({
    sessionId: session.id,
    cart: session.cart,
    cartCount: session.cart.reduce((sum, i) => sum + i.qty, 0),
    cartTotal: session.cart.reduce((sum, i) => sum + i.price * i.qty, 0),
  });
};

// POST /api/cart/remove
exports.removeFromCart = (req, res) => {
  const { sessionId, productId, storage, color } = req.body;
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessions.get(sessionId);
  session.cart = session.cart.filter(item => !(item.id === productId && String(item.storage) === String(storage) && item.color === color));
  session.lastActive = Date.now();

  res.json({
    sessionId: session.id,
    cart: session.cart,
    cartCount: session.cart.reduce((sum, i) => sum + i.qty, 0),
    cartTotal: session.cart.reduce((sum, i) => sum + i.price * i.qty, 0),
  });
};

// POST /api/cart/update-qty
exports.updateQty = (req, res) => {
  const { sessionId, productId, storage, color, qty } = req.body;
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessions.get(sessionId);
  const item = session.cart.find(i => i.id === productId && String(i.storage) === String(storage) && i.color === color);

  if (!item) return res.status(404).json({ error: 'Item not in cart' });

  if (qty <= 0) {
    session.cart = session.cart.filter(i => i !== item);
  } else {
    item.qty = qty;
  }
  session.lastActive = Date.now();

  res.json({
    sessionId: session.id,
    cart: session.cart,
    cartCount: session.cart.reduce((sum, i) => sum + i.qty, 0),
    cartTotal: session.cart.reduce((sum, i) => sum + i.price * i.qty, 0),
  });
};

// GET /api/cart/:sessionId
exports.getCart = (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId || !sessions.has(sessionId)) {
    return res.json({ sessionId: null, cart: [], cartCount: 0, cartTotal: 0 });
  }

  const session = sessions.get(sessionId);
  session.lastActive = Date.now();

  res.json({
    sessionId: session.id,
    cart: session.cart,
    cartCount: session.cart.reduce((sum, i) => sum + i.qty, 0),
    cartTotal: session.cart.reduce((sum, i) => sum + i.price * i.qty, 0),
  });
};

// DELETE /api/cart/:sessionId
exports.clearCart = (req, res) => {
  const { sessionId } = req.params;
  if (sessionId && sessions.has(sessionId)) {
    sessions.get(sessionId).cart = [];
  }
  res.json({ sessionId, cart: [], cartCount: 0, cartTotal: 0 });
};
