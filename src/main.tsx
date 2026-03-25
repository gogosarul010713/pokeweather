import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Debug tools (solo en desarrollo)
if (import.meta.env.DEV) {
  // Importar herramientas de debugging de caché
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  import('./services/cache/debugCaching').catch(() => {})

  // 🧹 LIMPIEZA DE CACHE VIEJO (primera carga en dev)
  console.log('🧹 Limpiando caché de desarrollo...')
  localStorage.removeItem('pwe-lastUpdateHour')
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('pwe-loc-')) localStorage.removeItem(key)
  })
  indexedDB.databases().then((dbs) => {
    dbs.forEach((db) => {
      if (db.name === 'keyval') {
        indexedDB.deleteDatabase('keyval')
        console.log('✅ Cache limpiado: listo para cargar datos frescos')
      }
    })
  })
}

// US-103: Init tema desde localStorage antes de renderizar (evita FOUC)
const savedTheme = localStorage.getItem('pwe-theme') || 'dark'
document.documentElement.classList.toggle('light', savedTheme === 'light')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
