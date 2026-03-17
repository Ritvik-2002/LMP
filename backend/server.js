const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const cartRoutes = require('./routes/cartRoutes');
const journeyRoutes = require('./routes/journeyRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

// Use routes
app.use('/api/chat', chatRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/voice', voiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Loan Marketplace Chatbot API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
