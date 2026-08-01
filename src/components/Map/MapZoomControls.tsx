import { useState, useRef, useCallback, type RefObject } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { useStore } from '../../store/useStore'
import type { City } from '../../store/useStore'

const FLY_DURATION = 1.2

interface MapZoomControlsProps {
  mapRef: RefObject<LeafletMap | null>
  cities: City[]
  onOpenSearch: () => void
}

export default function MapZoomControls({ mapRef, cities, onOpenSearch }: MapZoomControlsProps) {
  const [worldLoading, setWorldLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)

  const favorites = useStore((s) => s.favorites)
  const setSelectedCity = useStore((s) => s.setSelectedCity)

  // Indices de rotacion para Mejores y Favoritos
  const bestIdxRef = useRef(0)
  const favIdxRef = useRef(0)

  const bestCities = cities.filter(c => c.rating >= 4)

  const handleWorld = useCallback(() => {
    if (worldLoading) return
    setWorldLoading(true)
    setTimeout(() => {
      mapRef.current?.setView([20, 0], 2)
      setWorldLoading(false)
    }, 1200)
  }, [worldLoading, mapRef])

  const handleHome = useCallback(() => {
    if (!navigator.geolocation || gpsLoading) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 13, { duration: FLY_DURATION })
        setGpsLoading(false)
      },
      () => setGpsLoading(false)
    )
  }, [gpsLoading, mapRef])

  const handleBest = useCallback(() => {
    if (bestCities.length === 0) return
    const city = bestCities[bestIdxRef.current % bestCities.length]
    bestIdxRef.current = (bestIdxRef.current + 1) % bestCities.length
    setSelectedCity(city)
    mapRef.current?.flyTo([city.lat, city.lon], 13, { duration: FLY_DURATION })
  }, [bestCities, mapRef, setSelectedCity])

  const handleFavorites = useCallback(() => {
    const favCities = cities.filter(c => favorites.includes(c.id))
    if (favCities.length === 0) return
    const city = favCities[favIdxRef.current % favCities.length]
    favIdxRef.current = (favIdxRef.current + 1) % favCities.length
    setSelectedCity(city)
    mapRef.current?.flyTo([city.lat, city.lon], 13, { duration: FLY_DURATION })
  }, [cities, favorites, mapRef, setSelectedCity])

  const spinnerSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'mzc-spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="9" strokeDasharray="40 20" strokeLinecap="round"/>
    </svg>
  )

  const hasBest = bestCities.length > 0
  const hasFavs = favorites.length > 0

  return (
    <>
      <style>{`
        .mzc-root {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
        }
        .mzc-group {
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .mzc-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-bottom: 1px solid var(--border-default);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          transition: background 0.12s;
        }
        .mzc-btn:last-child { border-bottom: none; }
        .mzc-btn:hover { background: var(--bg-hover); }
        .mzc-btn:disabled { color: var(--text-tertiary); cursor: default; }
        .mzc-btn:disabled:hover { background: none; }
        .mzc-btn svg { width: 16px; height: 16px; }
        .mzc-sep {
          height: 0;
          border: none;
          border-top: 2px solid var(--border-default);
          margin: 0;
        }
        @keyframes mzc-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="mzc-root">
        <div className="mzc-group">
          {/* Bloque 1: Mundo + Casa */}
          <button className="mzc-btn" onClick={handleWorld} title="Vista mundial" disabled={worldLoading}>
            {worldLoading ? spinnerSvg : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            )}
          </button>
          <button className="mzc-btn" onClick={handleHome} title="Mi ubicacion (GPS)" disabled={gpsLoading}>
            {gpsLoading ? spinnerSvg : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            )}
          </button>

          <hr className="mzc-sep" />

          {/* Bloque 2: Mejores + Favoritos */}
          <button
            className="mzc-btn"
            onClick={handleBest}
            disabled={!hasBest}
            title={hasBest ? `Mejores lugares (${bestCities.length})` : 'Sin lugares destacados'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <button
            className="mzc-btn"
            onClick={handleFavorites}
            disabled={!hasFavs}
            title={hasFavs ? `Mis favoritos (${favorites.length})` : 'Sin favoritos guardados'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          <hr className="mzc-sep" />

          {/* Bloque 3: Lupa (busqueda) */}
          <button className="mzc-btn" onClick={onOpenSearch} title="Buscar ciudad, nido o coordenadas (/)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
