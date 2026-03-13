import React from 'react';
import './App.css';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>�️ TechMart Electronics</h1>
        <p>Your one-stop shop for the latest tech from top brands</p>
      </header>
      <main className="App-main">
        <div className="hero-section">
          <h2>Welcome to TechMart!</h2>
          <p>Discover amazing deals on smartphones, laptops, tablets, audio devices, and more from brands like Apple, Samsung, Google, Sony, Microsoft, and many others.</p>
          
          <div className="features">
            <div className="feature-card">
              <span className="feature-icon">📱</span>
              <h3>Latest Smartphones</h3>
              <p>iPhone, Samsung Galaxy, Google Pixel, OnePlus</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💻</span>
              <h3>Powerful Laptops</h3>
              <p>MacBook, Dell XPS, HP Spectre, ASUS ROG</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎮</span>
              <h3>Gaming Consoles</h3>
              <p>PlayStation 5, Xbox Series X, Nintendo Switch</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎧</span>
              <h3>Premium Audio</h3>
              <p>Sony, Bose, AirPods, Samsung Buds</p>
            </div>
          </div>

          <div className="cta-section">
            <h3>Need help finding the perfect product?</h3>
            <p>👇 Click the chat button below to talk to our AI shopping assistant!</p>
          </div>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
