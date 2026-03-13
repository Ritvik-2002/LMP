# Quick Setup Guide 🚀

Follow these steps to get your AI-powered e-commerce chatbot up and running in minutes!

## Step 1: API Configuration 🔑

The chatbot uses **Juspay Grid AI API** for intelligent conversations. The API key is already configured in the `.env` file:

```env
GRID_AI_API_KEY=sk-SJXkPiAZHPpzry_ddJridg
```

⚠️ **Important**: This key is pre-configured. Keep it secret and never commit it to public repositories!

## Step 2: Install Dependencies 📦

### Backend

```bash
cd backend
npm install
```

This installs:
- Express (server framework)
- Axios (for HTTP requests to Grid AI)
- CORS (for cross-origin requests)
- dotenv (for environment variables)

### Frontend

```bash
cd ../frontend
npm install
```

This installs:
- React (UI framework)
- Axios (HTTP client)
- React Scripts (build tools)

## Step 3: Start the Application 🚀

### Terminal 1 - Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Server running on port 5000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

Your browser should automatically open to `http://localhost:3000`

## Step 4: Test the Chatbot 🧪

Try these conversations:

1. **Basic greeting:**
   ```
   "Hi"
   → AI welcomes you and offers options: Smartphones, Laptops, Gaming, Best Deals
   ```

2. **Product inquiry:**
   ```
   "I need a new laptop"
   → AI asks about budget, usage, and brand preference, then suggests from Dell, HP, ASUS, Apple, Lenovo
   ```

3. **Brand preference:**
   ```
   "Show me Samsung products"
   → AI lists Galaxy S24 Ultra, Galaxy Tab S9, Galaxy Watch 6, Galaxy Buds 2 Pro
   ```

4. **Budget shopping:**
   ```
   "Best phone under $700"
   → AI suggests Google Pixel 8 Pro ($764) and OnePlus 12 ($655) with discounts
   ```

5. **Purchase:**
   ```
   "I'll buy the Dell XPS 15"
   → AI suggests accessories (Dell Mouse, Laptop Bag)
   "Add mouse, then checkout"
   → AI shows order summary and redirects to checkout
   ```

## Troubleshooting 🔧

### "Module not found" Error
```bash
# In the folder showing the error:
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### Grid AI API Error
- ✅ Check API key is correct in `.env`
- ✅ Verify the Grid AI service is accessible
- ✅ Check console logs for detailed error messages

### CORS Error
Make sure backend is running before starting frontend

## Customization Ideas 💡

### Change Products

Edit `backend/controllers/chatController.js` → `PRODUCT_INVENTORY`

Add your products with this structure:
```javascript
"Product Name": {
  price: 999,
  discount: 15,
  finalPrice: 849,
  stock: 50,
  category: "Category",
  brand: "Brand Name",
  features: ["Feature 1", "Feature 2", "Feature 3"],
  relatedProducts: ["Related 1", "Related 2", "Related 3"]
}
```

### Change Checkout URL

Edit `backend/controllers/chatController.js` line ~210:
```javascript
responseData.checkoutUrl = 'https://your-checkout-url.com';
```

### Change AI Personality

Edit `backend/controllers/chatController.js` → `SYSTEM_PROMPT`

### Change Theme Colors

Edit `frontend/src/components/Chatbot.css`:
```css
/* Header gradient */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

## Next Steps 📚

- Read full [README.md](README.md) for detailed documentation
- Explore the code in `backend/controllers/chatController.js`
- Customize the product inventory for your needs
- Deploy to production (Heroku, Vercel, etc.)

## Need Help? 🆘

- Check the [README.md](README.md) troubleshooting section
- Review your console for error messages
- Open an issue in the repository
- Check OpenAI documentation

---

**Happy coding! 🎉**
