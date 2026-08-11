import { useStore } from '../../store/useStore'
import HomeModal from './HomeModal'
import { useState } from 'react'

const HomeIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

export default function HomeChip() {
  const homeLocation = useStore((s) => s.homeLocation)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <style>{`
        .hc-empty {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px dashed var(--border-strong);
          border-radius: 17px;
          padding: 0 10px;
          height: 34px;
          cursor: pointer;
          font-size: 11px;
          color: var(--text-secondary);
          background: transparent;
          font-family: 'Exo 2', sans-serif;
          transition: background 0.15s;
          width: 100%;
          text-align: left;
          box-sizing: border-box;
        }
        .hc-empty:hover { background: var(--bg-tertiary); }

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
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hc-active-sub {
          font-size: 10px;
          color: var(--text-secondary);
          white-space: nowrap;
          flex-shrink: 0;
        }
      `}</style>

      {homeLocation ? (
        <button className="hc-active" onClick={() => setModalOpen(true)} type="button">
          <span className="hc-active-icon"><HomeIcon /></span>
          <span className="hc-active-coords">
            {homeLocation.lat.toFixed(4)}, {homeLocation.lon.toFixed(4)}
          </span>
          <span className="hc-active-sub">
            {homeLocation.label ? `${homeLocation.label} · ` : ''}Tap editar
          </span>
        </button>
      ) : (
        <button className="hc-empty" onClick={() => setModalOpen(true)} type="button">
          <HomeIcon />
          Fijar mi zona...
        </button>
      )}

      {modalOpen && <HomeModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
