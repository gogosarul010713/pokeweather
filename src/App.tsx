import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useStore } from './store/useStore'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import MapView from './components/Map/MapView'
import LocationFeed from './components/Sidebar/LocationFeed'
import LoadingScreen from './components/UI/LoadingScreen'
import LocationDetail from './components/Sidebar/LocationDetail'
import { BottomSheetPortal } from './components/BottomSheet/BottomSheetPortal'
import { Toast } from './components/UI/Toast'
import { useWeather } from './hooks/useWeather'
import { useIsMobile } from './hooks/useIsMobile'
import { syncForecastsOnLoad } from './services/firebase/forecastSyncService'
import type { City } from './store/useStore'

export default function App() {
  const [cities, setCities] = useState<City[]>([])
  const selectedCity = useStore((s) => s.selectedCity)
  const sidebarMode = useStore((s) => s.sidebarMode)
  const isMobile = useIsMobile()
  const getFilteredCities = useStore((s) => s.getFilteredCities)
  // Dependencias para recalcular filtro cuando cambian
  const regionFilter = useStore((s) => s.regionFilter)
  const conditionFilter = useStore((s) => s.conditionFilter)
  const typeFilter = useStore((s) => s.typeFilter)
  const searchQuery = useStore((s) => s.searchQuery)
  const sortMode = useStore((s) => s.sortMode)
  const sortDirection = useStore((s) => s.sortDirection)
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

  // Aplicar filtros a las ciudades cargadas — se recalcula cuando cambian filtros
  const filteredCities = useMemo(() => {
    console.log('📊 useMemo recalculando filtros:', {
      sortMode,
      sortDirection,
      citiesCount: cities.length,
      filteredCount: getFilteredCities(cities).length,
    })
    return getFilteredCities(cities)
  }, [cities, regionFilter, conditionFilter, typeFilter, searchQuery, sortMode, sortDirection])

  // Ejecutar una sola vez al montar el componente
  useEffect(() => {
    run(handleCitiesLoaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sincronizar pronósticos al montar la app (background, non-blocking)
  useEffect(() => {
    syncForecastsOnLoad()
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

        /* MOBILE (<768px): Full height, Map 100% + BottomSheet fixed overlay */
        @media (max-width: 767px) {
          .app-body {
            flex-direction: column;
            margin-top: 96px;
            height: calc(100vh - 96px);
            overflow: hidden;  /* BottomSheet is fixed, no body scroll */
            position: relative;  /* Positioning context for absolute children (Sidebar wrapper) */
          }

          .app-map-area {
            flex: 1;
            overflow: hidden;  /* Map container, no internal scroll */
          }

          /* LocationFeed now inside BottomSheet component */
          .app-list-area {
            display: none;  /* Hidden — moved to BottomSheet */
          }
        }

        /* TABLET (768px - 1023px): Sidebar colapsable, map expands */
        @media (min-width: 768px) and (max-width: 1023px) {
          .app-body {
            flex-direction: row;
            height: calc(100vh - 80px);
            overflow: hidden;
            transition: all 300ms ease;
          }

          .app-map-area {
            flex: 1;
            position: relative;
            transition: flex 300ms ease;
          }

          .app-list-area {
            display: none;
          }
        }

        /* DESKTOP (1024px+): Default layout */
        @media (min-width: 1024px) {
          .app-list-area {
            display: none;
          }
        }

      `}</style>

      <div className="app-root">
        {/* LoadingScreen: 'initial' al arrancar, 'refresh' durante auto-refresh */}
        <LoadingScreen mode={isInitialLoadRef.current ? 'initial' : 'refresh'} />

        {/* ── HEADER ── */}
        <Header />

        {/* ── BODY ── */}
        <div className="app-body">
          {/* SIDEBAR */}
          <Sidebar cities={filteredCities} />

          {/* MAP AREA */}
          <main className="app-map-area" ref={mapAreaRef}>
            <MapView cities={filteredCities} />
          </main>

          {/* LIST AREA — Mobile only (LocationFeed extracted from Sidebar) */}
          <div className="app-list-area">
            <LocationFeed cities={filteredCities} />
          </div>
        </div>

        {/* BOTTOM SHEET — Mobile only, rendered via portal outside #root */}
        {isMobile && (
          <BottomSheetPortal>
            <LocationFeed cities={filteredCities} />
          </BottomSheetPortal>
        )}

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
