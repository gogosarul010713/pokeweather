import { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'

interface Props {
  x: number
  y: number
  lat: number
  lon: number
  onClose: () => void
}

export default function MapContextMenu({ x, y, lat, lon, onClose }: Props) {
  const homeLocation = useStore((s) => s.homeLocation)
  const setHomeLocation = useStore((s) => s.setHomeLocation)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  function handleFijar() {
    setHomeLocation({ lat, lon })
    onClose()
  }

  const label = homeLocation ? 'Mover zona aqui' : 'Fijar zona aqui'

  return (
    <>
      <style>{`
        .map-ctx-menu {
          position: fixed;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.45);
          padding: 4px 0;
          z-index: 2000;
          min-width: 170px;
          font-size: 13px;
        }
        .map-ctx-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          cursor: pointer;
          color: var(--text-primary);
          transition: background 0.1s;
        }
        .map-ctx-item:hover {
          background: rgba(var(--ui-accent-rgb), 0.1);
        }
        .map-ctx-icon {
          font-size: 15px;
          line-height: 1;
        }
      `}</style>
      <div
        ref={ref}
        className="map-ctx-menu"
        style={{ top: y, left: x }}
      >
        <div className="map-ctx-item" onClick={handleFijar}>
          <span className="map-ctx-icon">📍</span>
          {label}
        </div>
      </div>
    </>
  )
}
