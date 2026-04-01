import { useEffect, useState, useCallback, useRef } from 'react'
import { useStore } from './store/useStore'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import MapView from './components/Map/MapView'
import LoadingScreen from './components/UI/LoadingScreen'
import LocationDetail from './components/Sidebar/LocationDetail'
import { Toast } from './components/UI/Toast'
import { useWeather } from './hooks/useWeather'
import type { City } from './store/useStore'

export default function App() {
  const [cities, setCities] = useState<City[]>([])
  const selectedCity = useStore((s) => s.selectedCity)
  const sidebarMode = useStore((s) => s.sidebarMode)
  const { run, toastMessage } = useWeather()

  // Ref para saber si es el primer load (initial) o auto-refresh posterior
  const isInitialLoadRef = useRef(true)

  // Ref para .app-map-area (para scroll automático en mobile)
  const mapAreaRef = useRef<HTMLDivElement>(null)

  // useCallback para garantizar que onReady sea la misma referencia
  const handleCitiesLoaded = useCallback((loaded: City[]) => {
    setCities(loaded)
    // Después del primer load, marcar que ya no es inicial
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
    }
  }, [])

  // Ejecutar una sola vez al montar el componente
  useEffect(() => {
    run(handleCitiesLoaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // En mobile: Visual feedback en mapa al seleccionar ciudad (sin scroll disruptivo)
  // El highlight visual ocurre en MapPin.tsx, aquí solo aseguramos que el mapa reciba focus
  useEffect(() => {
    if (!selectedCity || !mapAreaRef.current) return

    // Solo en mobile: agregar efecto visual temporal
    const isMobile = window.innerWidth < 768
    if (!isMobile) return

    // Pulse visual suave (sin scroll) — el highlight principal está en MapPin
    mapAreaRef.current.style.boxShadow = 'inset 0 0 12px rgba(88, 166, 255, 0.1)'
    const timer = setTimeout(() => {
      if (mapAreaRef.current) {
        mapAreaRef.current.style.boxShadow = 'none'
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [selectedCity?.id])

  return (
    <>
      <style>{`
        .app-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        /* BODY = sidebar + map, debajo del header */
        .app-body {
          display: flex;
          flex-direction: row;
          margin-top: 80px;
          height: calc(100vh - 80px);
          overflow: hidden;
        }

        /* MAP AREA */
        .app-map-area {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }

        /* ──────────────────────────────────────────────
           RESPONSIVE LAYOUTS
           ────────────────────────────────────────────── */

        /* MOBILE (<768px): Stack vertical — Map 60vh + List 40vh */
        @media (max-width: 767px) {
          .app-body {
            flex-direction: column;
            height: calc(100vh - 80px);
            overflow: hidden;
          }

          .app-map-area {
            height: 60vh;
            flex: none;
            overflow-y: auto;
          }

          /* List area will be positioned below map */
          .app-list-area {
            height: 40vh;
            flex: none;
            overflow-y: auto;
            background: var(--bg-primary);
            border-top: 1px solid var(--border-subtle);
          }
        }

        /* TABLET (768px - 1023px): Sidebar as drawer, map expands */
        @media (min-width: 768px) and (max-width: 1023px) {
          .app-body {
            flex-direction: row;
            height: calc(100vh - 80px);
            overflow: hidden;
          }

          .app-map-area {
            flex: 1;
            position: relative;
          }
        }

        /* DESKTOP (1024px+): Default layout */
        /* No changes needed, default styles apply */

      `}</style>

      <div className="app-root">
        {/* LoadingScreen: 'initial' al arrancar, 'refresh' durante auto-refresh */}
        <LoadingScreen mode={isInitialLoadRef.current ? 'initial' : 'refresh'} />

        {/* ── HEADER ── */}
        <Header cities={cities} />

        {/* ── BODY ── */}
        <div className="app-body">
          {/* SIDEBAR */}
          <Sidebar cities={cities} />

          {/* MAP AREA */}
          <main className="app-map-area" ref={mapAreaRef}>
            <MapView cities={cities} />
          </main>
        </div>

        {/* LOCATION DETAIL MODAL */}
        {sidebarMode === 'detail' && selectedCity && (
          <LocationDetail city={selectedCity} />
        )}

        {/* TOAST NOTIFICATIONS — Auto-refresh */}
        {toastMessage && (
          <Toast message={toastMessage} type="info" duration={3000} />
        )}
      </div>
    </>
  )
}
