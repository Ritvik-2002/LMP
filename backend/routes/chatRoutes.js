const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST route for sending messages to the chatbot
router.post('/message', chatController.handleMessage);

// GET route for getting chat history
router.get('/history/:sessionId?', chatController.getChatHistory);

// POST route for AI recommendation reasons
router.post('/recommendation-reasons', chatController.getRecommendationReasons);

// GET routes for products
router.get('/products', chatController.getProducts);
router.get('/products/:productName', chatController.getProduct);

module.exports = router;
