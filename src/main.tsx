import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// US-103: Init tema desde localStorage antes de renderizar (evita FOUC)
const savedTheme = localStorage.getItem('pwe-theme') || 'dark'
document.documentElement.classList.toggle('light', savedTheme === 'light')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
