import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import QRCodes from './components/QRCodes.jsx'
import MerchantDashboard from './merchant/pages/MerchantDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QRCodes />} />
        <Route path="/product/:productId" element={<App />} />
        <Route path="/qr-codes" element={<QRCodes />} />
        <Route path="/merchant/*" element={<MerchantDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
