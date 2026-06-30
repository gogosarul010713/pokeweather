import { useStore } from '../../src/store/useStore'

useStore.setState({
  activeLayers: { clima: true, nidos: false, gyms: false, stops: false, rutas: false },
  nests: [],
})

export function MapView() {
  return (
    <>
      <style>{`
        .mvp-root {
          width: 100%;
          height: 420px;
          position: relative;
          background: #1a1f2e;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-default);
        }

        .mvp-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .mvp-center {
          position: relative;
          z-index: 1;
          text-align: center;
          color: var(--text-secondary);
          font-family: 'Exo 2', sans-serif;
        }

        .mvp-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.4;
        }

        .mvp-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .mvp-subtitle {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .mvp-layers {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .mvp-layer-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          font-family: 'Exo 2', sans-serif;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .mvp-layer-badge.active {
          background: rgba(88,166,255,0.15);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        /* Pins de muestra en esquinas */
        .mvp-pin-demo {
          position: absolute;
          bottom: 20px;
          left: 20px;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .mvp-pin-sample {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .mvp-pin-label {
          font-size: 9px;
          font-family: 'Exo 2', sans-serif;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .mvp-legend-demo {
          position: absolute;
          bottom: 20px;
          right: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 9px;
          font-family: 'Exo 2', sans-serif;
          color: var(--text-secondary);
        }

        .mvp-zoom-controls {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .mvp-zoom-btn {
          width: 26px;
          height: 26px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: var(--text-primary);
          font-weight: 300;
        }
      `}</style>

      <div className="mvp-root">
        <div className="mvp-grid" />

        {/* Controles zoom (decorativos) */}
        <div className="mvp-zoom-controls">
          <div className="mvp-zoom-btn">+</div>
          <div className="mvp-zoom-btn">-</div>
        </div>

        <div className="mvp-center">
          <div className="mvp-icon">🗺️</div>
          <div className="mvp-title">MapView</div>
          <div className="mvp-subtitle">
            Mapa interactivo Leaflet + CartoDB tiles<br />
            Requiere app completa para renderizar
          </div>
          <div className="mvp-layers">
            <span className="mvp-layer-badge active">Clima ON</span>
            <span className="mvp-layer-badge">Nidos OFF</span>
            <span className="mvp-layer-badge">Gyms OFF</span>
            <span className="mvp-layer-badge">Stops OFF</span>
            <span className="mvp-layer-badge">Rutas OFF</span>
          </div>
        </div>

        {/* Pins de muestra decorativos */}
        <div className="mvp-pin-demo">
          <div className="mvp-pin-sample">
            <svg width="22" height="29" viewBox="0 0 22 29">
              <path d="M11,1 A9,9 0 1,1 10.99,1 L11,28 Z" fill="#F08030" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
              <circle cx="11" cy="10" r="3.8" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <span className="mvp-pin-label">MapPin</span>
          </div>
          <div className="mvp-pin-sample">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,2 28,8 28,24 16,30 4,24 4,8" fill="#78C850" stroke="white" strokeWidth="1.5"/>
              <circle cx="16" cy="16" r="3" fill="white" opacity="0.8"/>
            </svg>
            <span className="mvp-pin-label">NestPin</span>
          </div>
        </div>

        {/* Legend (decorativa) */}
        <div className="mvp-legend-demo">
          Leyenda ▼
        </div>
      </div>
    </>
  )
}
