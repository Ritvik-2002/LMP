import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import QRCodes from './components/QRCodes.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/product/:productId" element={<App />} />
        <Route path="/qr-codes" element={<QRCodes />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
