const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/add', cartController.addToCart);
router.post('/remove', cartController.removeFromCart);
router.post('/update-qty', cartController.updateQty);
router.get('/:sessionId', cartController.getCart);
router.delete('/:sessionId', cartController.clearCart);

module.exports = router;
