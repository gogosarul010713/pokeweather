import { useEffect, useState, useCallback } from 'react'
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

  // useCallback para garantizar que onReady sea la misma referencia
  const handleCitiesLoaded = useCallback((loaded: City[]) => {
    setCities(loaded)
  }, [])

  // Ejecutar una sola vez al montar el componente
  useEffect(() => {
    run(handleCitiesLoaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

      `}</style>

      <div className="app-root">
        {/* LoadingScreen cubre todo hasta que useWeather termina */}
        <LoadingScreen />

        {/* ── HEADER ── */}
        <Header />

        {/* ── BODY ── */}
        <div className="app-body">
          {/* SIDEBAR */}
          <Sidebar cities={cities} />

          {/* MAP AREA */}
          <main className="app-map-area">
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
