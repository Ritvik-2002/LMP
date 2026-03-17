import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MerchantDashboard from './pages/MerchantDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MerchantDashboard />
  </StrictMode>,
)