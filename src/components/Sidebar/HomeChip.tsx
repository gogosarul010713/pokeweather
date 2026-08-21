import { useStore } from '../../store/useStore'
import HomeModal from './HomeModal'
import { useEffect, useState } from 'react'

const HomeIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'es' } }
  )
  const data = await res.json()
  return data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.country || ''
}

export default function HomeChip() {
  const homeLocation = useStore((s) => s.homeLocation)
  const setHomeLocation = useStore((s) => s.setHomeLocation)
  const clearHomeLocation = useStore((s) => s.clearHomeLocation)
  const modalOpen = useStore((s) => s.homeModalOpen)
  const setModalOpen = useStore((s) => s.setHomeModalOpen)
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(null)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    if (homeLocation) return
    const t1 = setTimeout(() => setShowBanner(true), 0)
    const t2 = setTimeout(() => setShowBanner(false), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [homeLocation])

  useEffect(() => {
    if (!homeLocation) { setTimeout(() => setResolvedLabel(null), 0); return }
    if (homeLocation.label) { setTimeout(() => setResolvedLabel(homeLocation.label!), 0); return }
    setTimeout(() => setResolvedLabel(''), 0)
    reverseGeocode(homeLocation.lat, homeLocation.lon).then((name) => {
      setResolvedLabel(name)
      if (name) setHomeLocation({ ...homeLocation, label: name })
    })
  }, [homeLocation, homeLocation?.lat, homeLocation?.lon, setHomeLocation])

  return (
    <>
      <style>{`
        .hc-empty {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px dashed var(--home);
          border-radius: 17px;
          padding: 0 10px;
          height: 34px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          color: var(--home);
          background: var(--home-dim);
          font-family: 'Exo 2', sans-serif;
          transition: background 0.15s, opacity 0.15s;
          width: 100%;
          text-align: left;
          box-sizing: border-box;
          animation: hc-pulse 2.4s ease-in-out infinite;
        }
        .hc-empty:hover { opacity: 0.8; animation: none; }
        @keyframes hc-pulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--home-glow); }
          50%       { box-shadow: 0 0 0 4px transparent; }
        }

        .hc-active {
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--home-dim);
          border: 1px solid var(--home-glow);
          border-radius: 17px;
          padding: 0 10px;
          height: 34px;
          cursor: pointer;
          font-family: 'Exo 2', sans-serif;
          width: 100%;
          text-align: left;
          transition: opacity 0.15s;
          box-sizing: border-box;
        }
        .hc-active:hover { opacity: 0.85; }

        .hc-active-icon { color: var(--home); flex-shrink: 0; }

        .hc-active-coords {
          font-size: 11px;
          font-weight: 700;
          color: var(--home);
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .hc-sep {
          width: 1px;
          height: 14px;
          background: var(--border-strong);
          flex-shrink: 0;
          opacity: 0.5;
        }

        .hc-active-label {
          font-size: 11px;
          color: var(--text-secondary);
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hc-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          line-height: 1;
          transition: background 0.15s;
        }
        .hc-clear:hover { background: var(--bg-tertiary); }

      `}</style>

      {homeLocation ? (
        <button className="hc-active" onClick={() => setModalOpen(true)} type="button">
          <span className="hc-active-icon"><HomeIcon /></span>
          <span className="hc-active-coords">
            {homeLocation.lat.toFixed(2)}, {homeLocation.lon.toFixed(2)}
          </span>
          <span className="hc-sep" />
          <span className="hc-active-label">
            {resolvedLabel === '' ? '...' : (resolvedLabel ?? '')}
          </span>
          <button
            className="hc-clear"
            type="button"
            onClick={(e) => { e.stopPropagation(); clearHomeLocation() }}
            aria-label="Quitar zona"
          >x</button>
        </button>
      ) : (
        <button className="hc-empty" onClick={() => setModalOpen(true)} type="button">
          <HomeIcon />
          {showBanner
            ? <span style={{fontWeight: 500}}>Fija tu zona para ver que tan cerca estas de cada lugar</span>
            : 'Fijar mi zona...'}
        </button>
      )}

      {modalOpen && <HomeModal onClose={() => setModalOpen(false)} />}

    </>
  )
}
