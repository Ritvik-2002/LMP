import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import QRCodes from './components/QRCodes.jsx'
import ChatScreen from './components/ChatScreen.jsx'
import VoiceChatScreen from './components/voice/VoiceChatScreen.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QRCodes />} />
        <Route path="/product/:productId" element={<App />} />
        <Route path="/qr-codes" element={<QRCodes />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/chat/:productId" element={<ChatScreen />} />
        <Route path="/voice-chat" element={<VoiceChatScreen />} />
        <Route path="/voice-chat/:productId" element={<VoiceChatScreen />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
