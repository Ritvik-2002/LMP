const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

router.post('/init', voiceController.initSession);
router.post('/process', voiceController.processAudio);
router.post('/interrupt', voiceController.interrupt);
router.post('/end', voiceController.endSession);

module.exports = router;
