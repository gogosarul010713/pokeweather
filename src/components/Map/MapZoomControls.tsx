import { useState, useRef, type RefObject } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { useStore } from '../../store/useStore'

const FLY_DURATION = 1.2

interface MapZoomControlsProps {
  mapRef: RefObject<LeafletMap | null>
}

export default function MapZoomControls({ mapRef }: MapZoomControlsProps) {
  const [coordsOpen, setCoordsOpen] = useState(false)
  const [coordsValue, setCoordsValue] = useState('')
  const [coordsError, setCoordsError] = useState('')
  const coordInputRef = useRef<HTMLInputElement>(null)

  const selectedCity = useStore((s) => s.selectedCity)
  const selectedNest = useStore((s) => s.selectedNest)

  function handleWorld() {
    mapRef.current?.setView([20, 0], 2)
  }

  function handleHome() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 13, { duration: FLY_DURATION })
    })
  }

  function handleFlyToActive() {
    const map = mapRef.current
    if (!map) return
    if (selectedNest) {
      map.flyTo([selectedNest.lat, selectedNest.lng], 13, { duration: FLY_DURATION })
    } else if (selectedCity) {
      map.flyTo([selectedCity.lat, selectedCity.lon], 13, { duration: FLY_DURATION })
    }
  }

  function handleCoordsOpen() {
    setCoordsOpen(v => !v)
    setCoordsError('')
    setTimeout(() => coordInputRef.current?.focus(), 50)
  }

  function handleGo() {
    const parts = coordsValue.split(',').map(s => parseFloat(s.trim()))
    if (parts.length !== 2 || parts.some(isNaN)) {
      setCoordsError('Formato invalido. Ejemplo: 35.6762,139.6503')
      return
    }
    const [lat, lon] = parts
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setCoordsError('Coordenadas fuera de rango')
      return
    }
    mapRef.current?.flyTo([lat, lon], 15, { duration: FLY_DURATION })
    setCoordsOpen(false)
    setCoordsValue('')
    setCoordsError('')
  }

  const hasActive = !!(selectedCity || selectedNest)

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
          font-size: 18px;
          font-weight: 500;
          line-height: 1;
          transition: background 0.12s;
        }
        .mzc-btn:last-child { border-bottom: none; }
        .mzc-btn:hover { background: var(--bg-hover); }
        .mzc-btn:disabled { color: var(--text-tertiary); cursor: default; }
        .mzc-btn:disabled:hover { background: none; }
        .mzc-btn svg { width: 16px; height: 16px; }
        .mzc-btn--active { color: var(--accent-primary); }
        .mzc-coords-popup {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          padding: 10px 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          min-width: 210px;
        }
        .mzc-coords-popup input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          padding: 6px 8px;
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .mzc-coords-popup input:focus { border-color: var(--accent-primary); }
        .mzc-coords-hint { font-size: 11px; color: var(--text-tertiary); margin: 4px 0 8px; }
        .mzc-coords-error { font-size: 11px; color: var(--color-error, #e05); margin: 4px 0; }
        .mzc-go-btn {
          width: 100%;
          padding: 6px;
          background: var(--accent-primary);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }
        .mzc-go-btn:hover { opacity: 0.9; }
      `}</style>

      <div className="mzc-root">
        {/* Grupo 1: zoom estandar leaflet (solo visual, Leaflet los provee nativo) */}
        {/* Grupo 2: navegacion */}
        <div className="mzc-group">
          <button className="mzc-btn" onClick={handleWorld} title="Vista mundial">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </button>
          <button className="mzc-btn" onClick={handleHome} title="Mi ubicacion (GPS)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>
          <button
            className={`mzc-btn${hasActive ? ' mzc-btn--active' : ''}`}
            onClick={handleFlyToActive}
            disabled={!hasActive}
            title={hasActive ? 'Ir a ciudad/nido activo' : 'Sin ciudad o nido seleccionado'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button
            className={`mzc-btn${coordsOpen ? ' mzc-btn--active' : ''}`}
            onClick={handleCoordsOpen}
            title="Ir a coordenadas"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </button>
        </div>

        {/* Popup de coordenadas */}
        {coordsOpen && (
          <div className="mzc-coords-popup">
            <input
              ref={coordInputRef}
              value={coordsValue}
              onChange={e => { setCoordsValue(e.target.value); setCoordsError('') }}
              placeholder="lat,lon"
              onKeyDown={e => { if (e.key === 'Enter') handleGo(); if (e.key === 'Escape') setCoordsOpen(false) }}
            />
            <div className="mzc-coords-hint">Ej: 35.6762,139.6503</div>
            {coordsError && <div className="mzc-coords-error">{coordsError}</div>}
            <button className="mzc-go-btn" onClick={handleGo}>Ir</button>
          </div>
        )}
      </div>
    </>
  )
}
