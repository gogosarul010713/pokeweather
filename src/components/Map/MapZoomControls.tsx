import { useState, useRef, useCallback, useEffect, type RefObject } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { useStore } from '../../store/useStore'
import type { City } from '../../store/useStore'
import { calculateBadges } from '../../services/weather/weatherService'
import type { BadgeType } from '../../services/weather/weatherService'

type HlKey = BadgeType | 'spawn'

const HL_ROWS: { key: HlKey; icon: string; label: string; color: string; kind: 'clima' | 'nido' }[] = [
  { key: 'stops',     icon: '🎯', label: 'Pokestop Hub',     color: '#58A6FF', kind: 'clima' },
  { key: 'gyms',      icon: '💪', label: 'Gym Hub',          color: '#F85149', kind: 'clima' },
  { key: 'community', icon: '👥', label: 'Comunidad Activa', color: '#3FB950', kind: 'clima' },
  { key: 'spawn',     icon: '⭐', label: 'Mayor Spawn',      color: '#FB923C', kind: 'nido'  },
  { key: 'best',      icon: '🏆', label: 'Mejor Lugar',      color: '#FFD700', kind: 'clima' },
]

const FLY_DURATION = 1.2

interface MapZoomControlsProps {
  mapRef: RefObject<LeafletMap | null>
  cities: City[]
  onOpenSearch: () => void
}

export default function MapZoomControls({ mapRef, cities, onOpenSearch }: MapZoomControlsProps) {
  const [worldLoading, setWorldLoading] = useState(false)
  const [hlOpen, setHlOpen] = useState(false)

  const favorites = useStore((s) => s.favorites)
  const setSelectedCity = useStore((s) => s.setSelectedCity)
  const homeLocation = useStore((s) => s.homeLocation)
  const highlightCategories = useStore((s) => s.highlightCategories)
  const highlightNestRow    = useStore((s) => s.highlightNestRow)
  const setHighlightCategories = useStore((s) => s.setHighlightCategories)
  const setHighlightNestRow    = useStore((s) => s.setHighlightNestRow)
  const nests = useStore((s) => s.nests)

  const activeHlKeys = new Set([...highlightCategories, ...(highlightNestRow ? [highlightNestRow] : [])] as HlKey[])

  const hlBtnRef = useRef<HTMLButtonElement>(null)
  const hlPopRef = useRef<HTMLDivElement>(null)

  // Conteos por fila
  const badgesByCity = useRef(new Map<string, string[]>())
  if (cities.length > 0) {
    const calc = calculateBadges(cities)
    cities.forEach(c => { badgesByCity.current.set(c.id, calc(c)) })
  }

  function getCount(row: typeof HL_ROWS[0]): number {
    if (row.kind === 'clima') {
      let n = 0
      badgesByCity.current.forEach(b => { if (b.includes(row.key)) n++ })
      return n
    }
    return nests.filter(n => (n.spawnRate ?? 0) > 60).length
  }

  function handleHlRow(key: HlKey) {
    const next = activeHlKeys.has(key)
      ? highlightCategories.filter(k => k !== key)
      : [...highlightCategories, key as string]
    setHighlightCategories(next)
    setHighlightNestRow(null)
  }

  // Cerrar con ESC o click fuera
  useEffect(() => {
    if (!hlOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setHlOpen(false) }
    function onOutside(e: MouseEvent) {
      if (
        !hlBtnRef.current?.contains(e.target as Node) &&
        !hlPopRef.current?.contains(e.target as Node)
      ) setHlOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [hlOpen])

  const totalPins = cities.length + nests.length
  const topN = Math.max(1, Math.ceil(totalPins * 0.1))

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
    if (!homeLocation) return
    mapRef.current?.flyTo([homeLocation.lat, homeLocation.lon], 13, { duration: FLY_DURATION })
  }, [homeLocation, mapRef])

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
          position: relative;
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
        .mzc-btn:disabled { color: var(--text-secondary); opacity: 0.42; cursor: default; }
        .mzc-btn:disabled:hover { background: none; }
        .mzc-btn svg { width: 16px; height: 16px; }
        .mzc-sep {
          height: 0;
          border: none;
          border-top: 2px solid var(--border-default);
          margin: 0;
        }
        .mzc-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 7px;
          background: rgba(125,133,144,0.09);
          border: 1px solid rgba(125,133,144,0.14);
          border-radius: 99px;
        }
        .mzc-pill svg { width: 9px; height: 9px; color: var(--text-secondary); opacity: 0.6; }
        .mzc-pill span { font-size: 10px; color: var(--text-secondary); opacity: 0.6; white-space: nowrap; }
        @keyframes mzc-spin { to { transform: rotate(360deg); } }

        .mzc-btn--hl { color: var(--text-secondary); position: relative; }
        .mzc-btn--hl.hl-active { color: var(--ui-accent); }
        .mzc-btn--hl.hl-active svg { filter: drop-shadow(0 0 4px rgba(88,166,255,0.5)); }
        .mzc-hl-dot {
          display: none;
          position: absolute;
          top: 5px; right: 5px;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--ui-accent);
          box-shadow: 0 0 5px rgba(88,166,255,0.9);
        }
        .mzc-btn--hl.hl-active .mzc-hl-dot { display: block; }

        .mzc-hl-pop {
          position: absolute;
          right: calc(100% + 8px);
          bottom: 0;
          /* mzc-root es position:static — el ancestro posicionado es mv-zoom-wrapper */
          width: 210px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.55);
          padding-bottom: 6px;
          opacity: 0;
          transform: translateX(8px) scale(0.96);
          pointer-events: none;
          transition: opacity 0.15s, transform 0.15s;
          transform-origin: right bottom;
          z-index: 50;
        }
        .mzc-hl-pop.open {
          opacity: 1;
          transform: translateX(0) scale(1);
          pointer-events: all;
        }
        .mzc-hl-pop::after {
          content: '';
          position: absolute;
          right: -5px; bottom: 11px;
          width: 8px; height: 8px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-default);
          border-top: 1px solid var(--border-default);
          transform: rotate(45deg);
        }
        .mzc-hl-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          border-bottom: 1px solid var(--border-default);
          margin-bottom: 4px;
        }
        .mzc-hl-title {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .mzc-hl-n {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: var(--ui-accent);
          background: rgba(88,166,255,0.1);
          border: 1px solid rgba(88,166,255,0.2);
          border-radius: 99px;
          padding: 1px 8px;
        }
        .mzc-hl-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 12px 7px 10px;
          cursor: pointer;
          position: relative;
          transition: background 0.1s;
        }
        .mzc-hl-row:hover { background: var(--bg-tertiary); }
        .mzc-hl-row::before {
          content: '';
          position: absolute;
          left: 0; top: 5px; bottom: 5px;
          width: 2px;
          border-radius: 0 2px 2px 0;
          background: transparent;
          transition: background 0.15s;
        }
        .mzc-hl-row.active::before { background: var(--hl-clr); }
        .mzc-hl-icon {
          font-size: 14px; width: 18px; text-align: center; flex-shrink: 0;
          transition: filter 0.15s, opacity 0.15s;
        }
        .mzc-hl-label {
          flex: 1;
          font-family: 'Exo 2', sans-serif;
          font-size: 12px; font-weight: 500;
          color: var(--text-primary);
          transition: color 0.15s;
        }
        .mzc-hl-row.active .mzc-hl-label { color: var(--text-primary); font-weight: 600; }
        .mzc-hl-count {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px; font-weight: 700;
          color: var(--text-tertiary);
          font-variant-numeric: tabular-nums;
          min-width: 16px; text-align: right;
          transition: color 0.15s;
        }
        .mzc-hl-row.active .mzc-hl-count { color: var(--hl-clr); }
      `}</style>

      <div className="mzc-root">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
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
          <button
            className="mzc-btn"
            onClick={handleHome}
            disabled={!homeLocation}
            title={homeLocation ? 'Ir a Mi Zona' : 'Sin Mi Zona fijada'}
            style={homeLocation ? { color: '#fff', background: 'var(--home)' } : { color: 'var(--home)', background: 'var(--home-dim)', opacity: 0.42, cursor: 'not-allowed' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
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

          <hr className="mzc-sep" />

          {/* Bloque 4: Resaltar — dentro del grupo, popover escapa via portal-like wrapper */}
          <button
            ref={hlBtnRef}
            className={`mzc-btn mzc-btn--hl${activeHlKeys.size > 0 ? ' hl-active' : ''}`}
            onClick={() => setHlOpen(o => !o)}
            title="Resaltar categoria"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            <span className="mzc-hl-dot" />
          </button>
        </div>

        {/* Popover fuera del grupo para no quedar clippeado por overflow:hidden */}
        <div ref={hlPopRef} className={`mzc-hl-pop${hlOpen ? ' open' : ''}`}>
          <div className="mzc-hl-head">
            <span className="mzc-hl-title">Resaltar</span>
            {activeHlKeys.size > 0 ? (
              <span
                className="mzc-hl-n"
                style={{ cursor: 'pointer' }}
                onClick={() => { setHighlightCategories([]); setHighlightNestRow(null) }}
                title="Limpiar seleccion"
              >
                Top {activeHlKeys.size} ×
              </span>
            ) : (
              <span className="mzc-hl-n" style={{ opacity: 0.5 }}>Top {topN}</span>
            )}
          </div>
          {HL_ROWS.map(row => (
            <div
              key={row.key}
              className={`mzc-hl-row${activeHlKeys.has(row.key) ? ' active' : ''}`}
              style={{ '--hl-clr': row.color } as React.CSSProperties}
              onClick={() => handleHlRow(row.key)}
            >
              <span className="mzc-hl-icon">{row.icon}</span>
              <span className="mzc-hl-label">{row.label}</span>
              <span className="mzc-hl-count">{getCount(row)}</span>
            </div>
          ))}
        </div>
        {(!hasBest || !hasFavs) && (
          <div className="mzc-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{!hasFavs ? 'Sin favoritos aun' : 'Sin destacados'}</span>
          </div>
        )}
        </div>
      </div>
    </>
  )
}
