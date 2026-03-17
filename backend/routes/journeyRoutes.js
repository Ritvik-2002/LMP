const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');

// Main chat endpoint (state-aware)
router.post('/message', journeyController.processMessage);

// Reconnect/restore session
router.get('/state/:sid', journeyController.getState);

// Overlay results (aadhaar verified, payment done, kfs accepted)
router.post('/action', journeyController.handleAction);

module.exports = router;
