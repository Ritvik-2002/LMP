# AI-Powered E-Commerce Chatbot

A full-stack intelligent shopping assistant chatbot built with Node.js, Express, React, and OpenAI. Features product recommendations, discount optimization, cross-selling, and seamless checkout integration.

## ✨ Features

- 🤖 **AI-Powered Conversations**: Uses Juspay Grid AI (open-large model) for intelligent, context-aware interactions
- 🛍️ **Multi-Brand Inventory**: 25+ products from top brands including Apple, Samsung, Google, Sony, Microsoft, Dell, HP, ASUS, Lenovo, Bose, Garmin, OnePlus, Amazon, and Nintendo
- 📱 **Product Categories**: Smartphones, Laptops, Tablets, Audio, Smartwatches, Gaming Consoles, Smart Home
- 💰 **Smart Discounts**: Automatically suggests better deals and savings opportunities across all brands
- 💰 **Smart Discounts**: Automatically suggests better deals and savings opportunities
- 🎯 **Personalized Recommendations**: AI understands user needs and suggests perfect products
- 🔗 **Cross-Selling**: Intelligently recommends complementary products (e.g., AirPods with iPhone)
- 🛒 **Seamless Checkout**: Automatic redirect to checkout when user is ready to buy
- 💬 **Interactive UI**: Real-time chat with quick action buttons
- 📱 **Responsive Design**: Works beautifully on all devices
- 📊 **Session Management**: Maintains conversation history for better context

## 🎯 Key Capabilities

1. **Interactive Shopping Experience**
   - Engages with customers in natural conversation
   - Asks questions to understand needs
   - Provides personalized product recommendations

2. **Product Inventory Management**
   - **Smartphones**: iPhone 15 Pro, Samsung Galaxy S24 Ultra, Google Pixel 8 Pro, OnePlus 12
   - **Laptops**: MacBook Air M3, Dell XPS 15, HP Spectre x360, Lenovo ThinkPad X1, ASUS ROG Zephyrus
   - **Audio**: Sony WH-1000XM5, AirPods Pro 2, Bose QuietComfort Ultra, Samsung Galaxy Buds 2 Pro
   - **Tablets**: iPad Pro 11", Samsung Galaxy Tab S9, Microsoft Surface Pro 9
   - **Smartwatches**: Apple Watch Series 9, Samsung Galaxy Watch 6, Garmin Fenix 7
   - **Gaming**: PlayStation 5, Xbox Series X, Nintendo Switch OLED
   - **Smart Home**: Amazon Echo Dot, Google Nest Hub
   - All with pricing, discounts, and stock information
, needs, and brand preferences
   - Compares products across multiple brands
   - Highlights better deals proactively
   - AI understands different brand ecosystemset and needs
   - Highlights better deals proactively
   - Compares products intelligently

4. **Cross-Selling Intelligence** within brand ecosystems
   - Example: iPhone → AirPods, Galaxy S24 → Galaxy Buds, PlayStation 5 → PS5 Games
   - Example: Buying iPhone? Suggests AirPods Pro
   - Maximizes order value while adding customer value

5. **Checkout Integration**
   - Detects purchase intent
   - Shows order summary with discounts
   - Auto-redirects to checkout

## 📁 Project Structure

```
LMP/
├── backend/
│   ├── controllers/
│   │   └── chatController.js       # AI logic, product inventory, chat handling
│   ├── routes/
│   │   └── chatRoutes.js           # API endpoints
│   ├── server.js                   # Express server setup
│   ├── package.json
│   └── .env                        # Environment variables (API keys)
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Chatbot.js          # Chat interface component
    │   │   └── Chatbot.css         # Styling
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## 🚀 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Juspay Grid AI API Key (provided)

## 📦 Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
GRID_AI_API_KEY=sk-SJXkPiAZHPpzry_ddJridg
```

4. Start the backend server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend application will open in your browser at `http://localhost:3000`

## 💡 Usage

1. Once both servers are running, open your browser to `http://localhost:3000`
2. You'll see the AI Shopping Assistant chatbot interface
3. Start shopping by:
   - Asking about products you're interested in
   - Clicking on quick reply buttons
   - Letting the AI guide you through product selection
4. The chatbot can help you with:
   - Finding the perfect product based on your needs
   - Comparing different products
   - Getting the best discounts
   - Understanding product features
   - Recommending complementary accessories
   - Completing your purchase

## 🗣️ Example Conversations

**Budget-Conscious Shopper:**
```700"
AI: "Great! I have some excellent options with amazing discounts:
     • Google Pixel 8 Pro - $764 (15% OFF from $899)
     • OnePlus 12 - $655 (18% OFF from $799)
     The OnePlus 12 offers the best value with Snapdragon 8 Gen 3!
     Would you like to see more details?"
```

**Brand Preference:**
```Best laptop for gaming?"
AI: "For gaming, I'd recommend the ASUS ROG Zephyrus!
     Features: AMD Ryzen 9, 32GB RAM, RTX 4070, 1TB SSD
     Price: $1,633 (14% OFF from $1,899)
     
     Also great: Dell XPS 15 with RTX 4050 - $1,529 (15% OFF)
     Would you like gaming accessories to go with it
     • Galaxy Watch 6 - $254 (15% OFF) - Feature-rich smartwatch
     • Galaxy Buds 2 Pro - $188 (18% OFF) - Premium earbuds
     Which category Samsung Galaxy S24 Ultra"
AI: "Excellent choice! Let me also suggest Galaxy Buds 2 Pro - they're perfect with your S24...
     🛒 Your Selection:
     • Samsung Galaxy S24 Ultra - $1,055 (12% off)
     Ready to checkout?"
You: "Yes, add the buds and checkout"
AI: "Perfect! 
     🛒 Your Order:
     • Samsung Galaxy S24 Ultra - $1,055 (12% off)
     • Galaxy Buds 2 Pro - $188 (18% off)
     🚀 Redirecting to checkout now...
AI: "For photography enthusiasts, I'd recommend the iPhone 15 Pro!
     Features: 48MP camera, A17 Pro chip, advanced photo capabilities
     Price: $899 (10% OFF from $999) - 25 in stock
     Would you like to add AirPods Pro for an even better experience?"
```

**Ready to Buy:**
```
You: "I'll take the iPhone 15 Pro"
AI: "Excellent choice! Let me also suggest AirPods Pro to complement your new iPhone...
     🛒 Your Selection:
     • iPhone 15 Pro - $899 (10% off)
     Ready to checkout?"
You: "Yes, checkout"
AI: "Perfect! Redirecting you to checkout now... 🚀"
[Auto-redirects to checkout page]
```

## 🔌 API Endpoints

### POST /api/chat/message
Send a message to the chatbot and get AI-powered response

**Request Body:**
```json
{
  "message": "I want to buy an iPhone",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "sessionId": "session_1234567890",
  "response": "Great choice! I have several iPhone models with amazing discounts...",
  "options": ["iPhone 15 Pro", "iPhone 15", "iPhone 14", "Compare Models"],
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

**Response (when checkout is triggered):**
```json
{
  "sessionId": "session_1234567890",
  "response": "Perfect! Processing your order...",
  "options": ["Proceed to Checkout", "Add Accessories"],
  "checkoutUrl": "https://www.google.com",
  "checkoutReady": true,
  "selectedProducts": [
    {
      "name": "iPhone 15 Pro",
      "price": 899,
      "discount": 10
    }
  ],
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

### GET /api/chat/history/:sessionId
Get chat history for a specific session

**Response:**
```json
{
  "history": [
    {
      "type": "user",
      "message": "I want to buy an iPhone",
      "timestamp": "2026-03-13T10:30:00.000Z"
    },
    {
      "type": "bot",
      "message": "Great choice! I have several iPhone models...",
      "options": ["iPhone 15 Pro", "iPhone 15", "iPhone 14"],
      "timestamp": "2026-03-13T10:30:01.000Z"
    }
  ]
}
```

### GET /api/chat/products
Get all available products in inventory

**Response:**
```json
{
  "products": {
    "iPhone 15 Pro": {
      "price": 999,
      "discount": 10,
      "finalPrice": 899,
      "stock": 25,
      "category": "Smartphones",
      "features": ["A17 Pro chip", "Titanium design", "48MP camera", "USB-C"],
      "relatedProducts": ["AirPods Pro", "iPhone 15 Pro Case", "MagSafe Charger"]
    }
    // ... more products
  },
  "totalProducts": 12
}
```

### GET /api/chat/products/:productName
Get details of a specific product

**Response:**
```json
{
  "name": "iPhone 15 Pro",
  "price": 999,
  "discount": 10,
  "finalPrice": 899,
  "stock": 25,
  "category": "Smartphones",
  "features": ["A17 Pro chip", "Titanium design", "48MP camera", "USB-C"],
  "relatedProducts": ["AirPods Pro", "iPhone 15 Pro Case", "MagSafe Charger"]
}
```

## 🛠️ Technologies Used

**Backend:**
- Node.js
- Express.js
- Juspay Grid AI API (open-large model)
- Axios
- dotenv
- CORS

**Frontend:**
- React.js
- Axios
- CSS3 (with animations and gradients)

## 🎨 Customization

### Adding New Products

Edit `PRODUCT_INVENTORY` in `backend/controllers/chatController.js`:

```javascript
"New Product": {
  price: 999,
  discount: 15,
  finalPrice: 849,
  stock: 50,
  category: "Category Name",
  features: ["Feature 1", "Feature 2", "Feature 3"],
  relatedProducts: ["Related Product 1", "Related Product 2"]
}
```

### Modifying AI Behavior

Update the `SYSTEM_PROMPT` in `backend/controllers/chatController.js` to change how the AI interacts with customers, what it emphasizes, or its personality.

### Changing Checkout URL

In `backend/controllers/chatController.js`, update the checkout URL:

```javascript
if (isCheckout && mentionedProducts.length > 0) {
  responseData.checkoutUrl = 'https://your-checkout-url.com';
  // ...
}
```

### Customizing UI Theme

Modify colors and styles in `frontend/src/components/Chatbot.css`:
- Change gradient colors in `.chatbot-header` and `.option-button`
- Adjust border-radius for different rounded corners
- Modify animations and transitions

## 🐛 Troubleshooting

### Grid AI API Errors

**Problem:** "Error calling Grid AI API"  
**Solution:** 
- Check that your Grid AI API key is correctly set in `.env`
- Verify the API endpoint is accessible
- Check the API response in console logs for detailed error messages

### Port Already in Use

**Problem:** "Port 5000 already in use"  
**Solution:**
```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### CORS Errors

**Problem:** "CORS policy blocked"  
**Solution:** The backend is configured for `http://localhost:3000`. If using different ports, update `backend/server.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:YOUR_PORT'
}));
```

### Products Not Showing

**Problem:** AI doesn't suggest products correctly  
**Solution:**
- Check that product names in `PRODUCT_INVENTORY` match exactly what the AI mentions
- Review the system prompt for clarity
- Test with explicit product requests first

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway)

1. Set environment variables:
   - `NODE_ENV=production`
   - `OPENAI_API_KEY=your_key`
   - `PORT=5000` (or as required)

2. Update CORS to allow your frontend domain

### Frontend Deployment (e.g., Vercel, Netlify)

1. Update API endpoint in frontend code
2. Build the production version: `npm run build`
3. Deploy the `build` folder

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using AI and modern web technologies**

### Styling

- Frontend styles are in `frontend/src/App.css` and `frontend/src/components/Chatbot.css`
- Colors, fonts, and layouts can be customized in these files

## Technologies Used

### Backend
- Node.js
- Express.js
- CORS
- Body Parser
- Dotenv

### Frontend
- React
- Axios
- CSS3

## Future Enhancements

- [ ] Integration with actual loan providers' APIs
- [ ] User authentication and profiles
- [ ] Persistent chat history with database
- [ ] Real-time EMI calculator with live updates
- [ ] Document upload functionality
- [ ] Email notifications
- [ ] Multi-language support
- [ ] AI/ML integration for smarter responses
- [ ] Live chat with human agents
- [ ] Mobile app version

## Troubleshooting

### Backend not starting
- Check if port 5000 is available
- Ensure all dependencies are installed (`npm install`)
- Check for any errors in the console

### Frontend not connecting to backend
- Verify backend is running on port 5000
- Check the proxy setting in `frontend/package.json`
- Clear browser cache and restart

### CORS errors
- Ensure CORS is properly configured in `backend/server.js`
- Check that the frontend proxy is correctly set

## License

MIT

## Contact

For questions or support, contact: support@loanmarketplace.com
