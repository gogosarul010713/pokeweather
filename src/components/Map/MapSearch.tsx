import { useState, useEffect, useRef, useCallback, type RefObject } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { useStore } from '../../store/useStore'
import type { City } from '../../store/useStore'
import type { Nest } from '../../types/nest'

type Result =
  | { kind: 'city'; item: City }
  | { kind: 'nest'; item: Nest }
  | { kind: 'nominatim'; label: string; lat: number; lon: number }

interface MapSearchProps {
  cities: City[]
  mapRef: RefObject<LeafletMap | null>
  openTick?: number
}

const FLY_ZOOM = 13
const FLY_DURATION = 1.5

export default function MapSearch({ cities, mapRef, openTick }: MapSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [nomOption, setNomOption] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nomError, setNomError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const nests = useStore((s) => s.nests)
  const setSelectedCity = useStore((s) => s.setSelectedCity)
  const setSelectedNest = useStore((s) => s.setSelectedNest)
  const setNavPin = useStore((s) => s.setNavPin)
  const setHomeLocation = useStore((s) => s.setHomeLocation)
  const [fixedHome, setFixedHome] = useState<string | null>(null)

  // Boton Lupa en MapZoomControls
  useEffect(() => { if (openTick) setOpen(true) }, [openTick])

  // Shortcut / o Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setOpen(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      map?.dragging.disable()
      map?.scrollWheelZoom.disable()
    } else {
      setQuery('')
      setResults([])
      setNomOption(false)
      map?.dragging.enable()
      map?.scrollWheelZoom.enable()
    }
  }, [open, mapRef])

  const parseCoords = (q: string): { lat: number; lon: number } | null => {
    const parts = q.split(',').map(s => parseFloat(s.trim()))
    if (parts.length !== 2 || parts.some(isNaN)) return null
    const [lat, lon] = parts
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null
    return { lat, lon }
  }

  const search = useCallback((q: string) => {
    const lq = q.toLowerCase().trim()
    setNomError(false)
    if (!lq) { setResults([]); setNomOption(false); return }

    // Coordenadas directas
    const coords = parseCoords(q)
    if (coords) {
      setResults([{ kind: 'nominatim', label: `${coords.lat}, ${coords.lon}`, lat: coords.lat, lon: coords.lon }])
      setNomOption(false)
      return
    }

    const cityHits: Result[] = cities
      .filter(c => c.name.toLowerCase().includes(lq) || c.country?.toLowerCase().includes(lq))
      .slice(0, 5)
      .map(item => ({ kind: 'city', item }))

    const nestHits: Result[] = nests
      .filter(n => n.name.toLowerCase().includes(lq) || n.city?.toLowerCase().includes(lq))
      .slice(0, 5)
      .map(item => ({ kind: 'nest', item }))

    const combined = [...cityHits, ...nestHits].slice(0, 8)
    setResults(combined)
    setNomOption(combined.length === 0)
  }, [cities, nests])

  useEffect(() => { search(query) }, [query, search])

  async function searchNominatim() {
    if (!query.trim()) return
    setLoading(true)
    setNomError(false)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'PokeWeatherExplorer/1.0 (pokegoninjabob@gmail.com)',
        },
      })
      const data = await res.json()
      if (data.length === 0) { setNomError(true); return }
      const hits: Result[] = data.map((d: Record<string, string>) => ({
        kind: 'nominatim',
        label: d.display_name,
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon),
      }))
      setResults(hits)
      setNomOption(false)
    } catch {
      setNomError(true)
    } finally {
      setLoading(false)
    }
  }

  function fixHome(r: Extract<Result, { kind: 'nominatim' }>, e: React.MouseEvent) {
    e.stopPropagation()
    setHomeLocation({ lat: r.lat, lon: r.lon })
    setFixedHome(r.label)
    setTimeout(() => setFixedHome(null), 2000)
  }

  function selectResult(r: Result) {
    if (r.kind === 'city') {
      setSelectedCity(r.item)
    } else if (r.kind === 'nest') {
      setSelectedNest(r.item)
    } else {
      mapRef.current?.flyTo([r.lat, r.lon], FLY_ZOOM, { duration: FLY_DURATION })
      setNavPin({ lat: r.lat, lon: r.lon, type: 'search', label: r.label })
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <>
      <style>{`
        .ms-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 24px;
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          white-space: nowrap;
          transition: border-color 0.15s;
        }
        .ms-trigger:hover { border-color: var(--accent-primary); }
        .ms-trigger kbd {
          margin-left: auto;
          padding: 1px 5px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          font-size: 11px;
          font-family: monospace;
        }
        .ms-panel {
          width: 340px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          overflow: hidden;
        }
        .ms-input-row {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          gap: 8px;
          border-bottom: 1px solid var(--border-default);
        }
        .ms-input-row svg { flex-shrink: 0; color: var(--text-secondary); }
        .ms-input-row input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 14px;
        }
        .ms-input-row input::placeholder { color: var(--text-tertiary); }
        .ms-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 2px 4px;
          font-size: 16px;
          line-height: 1;
        }
        .ms-results { max-height: 260px; overflow-y: auto; }
        .ms-result {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-primary);
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          transition: background 0.1s;
        }
        .ms-result:hover { background: var(--bg-hover); }
        .ms-result-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ms-result-tag {
          font-size: 10px;
          color: var(--text-tertiary);
          background: var(--bg-tertiary);
          padding: 1px 5px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .ms-nominatim {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .ms-nominatim button {
          padding: 4px 10px;
          background: var(--accent-primary);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .ms-empty { padding: 14px; text-align: center; color: var(--text-tertiary); font-size: 13px; }
        .ms-section-label {
          padding: 5px 14px 3px;
          font-size: 10px;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          border-bottom: 1px solid var(--border-default);
        }
        .ms-osm-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-secondary);
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          transition: background 0.1s;
        }
        .ms-osm-row:hover { background: var(--bg-hover); color: var(--text-primary); }
        .ms-osm-row:disabled { opacity: 0.5; cursor: default; }
        .ms-osm-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(248,208,48,0.12);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 12px;
        }
        .ms-home-btn {
          flex-shrink: 0;
          background: none;
          border: 1px solid var(--home-glow);
          border-radius: 6px;
          color: var(--home);
          font-size: 11px;
          padding: 2px 7px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.1s;
          line-height: 1.6;
        }
        .ms-home-btn:hover { background: var(--home-dim); }
        .ms-home-btn.ms-home-done {
          border-color: var(--home);
          background: var(--home-dim);
          color: var(--home);
        }
        .ms-home-toast {
          padding: 8px 14px;
          font-size: 11px;
          color: var(--home);
          background: var(--home-dim);
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

      <div className="ms-panel">
        <div className="ms-input-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ciudad, nido o coordenadas"
            onKeyDown={e => {
              if (e.key === 'Escape') { setOpen(false); return }
              if (e.key === 'Enter') {
                if (results.length > 0) { selectResult(results[0]); return }
                if (nomOption) searchNominatim()
              }
            }}
          />
          <button className="ms-close" onClick={() => setOpen(false)}>×</button>
        </div>

        <div className="ms-results">
          {results.length > 0 && (
            <div className="ms-section-label">En el dataset</div>
          )}
          {results.map((r, i) => (
            <button key={i} className="ms-result" onClick={() => selectResult(r)}>
              <span className="ms-result-label">
                {r.kind === 'city' ? `${r.item.name}, ${r.item.country ?? ''}` :
                 r.kind === 'nest' ? `${r.item.name}${r.item.city ? ` — ${r.item.city}` : ''}` :
                 r.label}
              </span>
              <span className="ms-result-tag">
                {r.kind === 'city' ? 'ciudad' : r.kind === 'nest' ? 'nido' : 'coordenadas'}
              </span>
              {r.kind === 'nominatim' && (
                <button
                  className={`ms-home-btn${fixedHome === r.label ? ' ms-home-done' : ''}`}
                  onClick={(e) => fixHome(r, e)}
                  title="Fijar como mi zona"
                  type="button"
                >
                  {fixedHome === r.label ? '✓ fijado' : '⌂ mi zona'}
                </button>
              )}
            </button>
          ))}

          {nomOption && (
            <>
              <div className="ms-section-label">No encontrado localmente</div>
              <button className="ms-osm-row" onClick={searchNominatim} disabled={loading}>
                <span className="ms-osm-icon">🌐</span>
                <span>{loading ? 'Buscando en OpenStreetMap...' : `Buscar "${query}" en OpenStreetMap`}</span>
              </button>
            </>
          )}

          {nomError && (
            <div className="ms-empty">No se encontro "{query}" en OpenStreetMap</div>
          )}

          {fixedHome && (
            <div className="ms-home-toast">
              <span>🏠</span> Mi zona fijada
            </div>
          )}

          {query && results.length === 0 && !nomOption && !loading && !nomError && (
            <div className="ms-empty">Sin resultados</div>
          )}
        </div>
      </div>
    </>
  )
}
