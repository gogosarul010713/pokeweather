// FlyToCity preview — componente invisible (no renderiza nada)
// Solo muestra su funcion: observa selectedCity y llama map.flyTo()

import { useStore } from '../../src/store/useStore'

const MOCK_CITY = {
  id: 'tokyo',
  name: 'Tokyo',
  country: 'Japon',
  flag: '🇯🇵',
  region: 'asia' as const,
  lat: 35.6762,
  lon: 139.6503,
  density: 6158,
  stops: 480,
  gyms: 120,
  rating: 5 as const,
  tags: ['raid'] as any,
  tips: '',
  best: 'Shinjuku',
  evento: '',
  transporte: 'metro',
  condition: 'sunny' as const,
  isExtreme: false,
  boostedTypes: ['fire', 'ground'],
  tempC: 28,
  feelsLike: 31,
  humidity: 65,
  windKmh: 12,
  gustKmh: 18,
  visibilityKm: 10,
  localTime: '14:30',
  s2Key: '',
  accuLocationKey: '',
  weatherIcon: 1,
  timezone: 9,
  updatedAt: Date.now(),
  weatherImage: '',
}

export function FlyToCity() {
  const selectedCity = useStore((s) => s.selectedCity)
  const setSelectedCity = useStore((s) => s.setSelectedCity)

  const isActive = selectedCity !== null

  return (
    <>
      <style>{`
        .ftp-root {
          padding: 20px;
          font-family: 'Exo 2', sans-serif;
          background: var(--bg-primary);
          border-radius: 8px;
          border: 1px solid var(--border-default);
        }

        .ftp-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .ftp-invisible-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(255, 200, 0, 0.1);
          border: 1px dashed rgba(255, 200, 0, 0.4);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 200, 0, 0.9);
          margin-bottom: 20px;
          letter-spacing: 0.03em;
        }

        .ftp-description {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 480px;
        }

        .ftp-code {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          padding: 12px 14px;
          font-family: monospace;
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .ftp-code .kw { color: #cc99cd; }
        .ftp-code .fn { color: #6fb3d2; }
        .ftp-code .str { color: #7ec699; }
        .ftp-code .num { color: #f08d49; }

        .ftp-status-box {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .ftp-status-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }

        .ftp-state-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
        }

        .ftp-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ftp-dot.idle { background: var(--border-default); }

        .ftp-dot.flying {
          background: #58a6ff;
          animation: ftp-pulse 1s ease-in-out infinite;
        }

        @keyframes ftp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }

        .ftp-city-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ftp-city-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .ftp-city-coords {
          font-size: 10px;
          color: var(--text-secondary);
          font-family: monospace;
        }

        .ftp-controls {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ftp-btn {
          padding: 6px 14px;
          border-radius: 5px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 11px;
          font-weight: 600;
          font-family: 'Exo 2', sans-serif;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .ftp-btn:hover {
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .ftp-btn.primary {
          background: rgba(88,166,255,0.1);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .ftp-params {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .ftp-param {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ftp-param-key {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
        }

        .ftp-param-val {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: monospace;
        }
      `}</style>

      <div className="ftp-root">
        <div className="ftp-title">FlyToCity — Componente de navegacion de mapa</div>

        <div className="ftp-invisible-badge">
          Componente invisible — return null
        </div>

        <div className="ftp-description">
          FlyToCity se monta <em>dentro</em> del MapContainer y observa{' '}
          <code>selectedCity</code> en el store via Zustand. Cuando cambia a
          una ciudad distinta, llama <code>map.flyTo([lat, lon], zoom)</code>{' '}
          con animacion de {1.5}s. No renderiza ningun elemento DOM.
        </div>

        <div className="ftp-code">
          <span className="kw">const</span> selectedCity = useStore(<span className="str">s =&gt; s.selectedCity</span>)<br />
          <span className="kw">const</span> map = useMap()<br />
          <br />
          <span className="kw">if</span> (selectedCity && selectedCity.id !== prevId) {'{'}<br />
          &nbsp;&nbsp;map.<span className="fn">flyTo</span>([selectedCity.lat, selectedCity.lon], <span className="num">10</span>, {'{'}<br />
          &nbsp;&nbsp;&nbsp;&nbsp;duration: <span className="num">1.5</span><br />
          &nbsp;&nbsp;{'}'})<br />
          {'}'}
        </div>

        <div className="ftp-status-box">
          <div className="ftp-status-label">Estado actual del store</div>
          <div className="ftp-state-row">
            <div className={`ftp-dot ${isActive ? 'flying' : 'idle'}`} />
            {isActive ? (
              <div className="ftp-city-info">
                <div className="ftp-city-name">
                  Volando a: {selectedCity!.name}, {selectedCity!.country}
                </div>
                <div className="ftp-city-coords">
                  {selectedCity!.lat.toFixed(4)}, {selectedCity!.lon.toFixed(4)}
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                Esperando ciudad seleccionada...
              </span>
            )}
          </div>
        </div>

        <div className="ftp-params">
          <div className="ftp-param">
            <span className="ftp-param-key">FLY_ZOOM</span>
            <span className="ftp-param-val">10</span>
          </div>
          <div className="ftp-param">
            <span className="ftp-param-key">FLY_DURATION</span>
            <span className="ftp-param-val">1.5s</span>
          </div>
          <div className="ftp-param">
            <span className="ftp-param-key">Renderiza</span>
            <span className="ftp-param-val">null</span>
          </div>
        </div>

        <div style={{ height: 16 }} />
        <div className="ftp-controls">
          <button
            className="ftp-btn primary"
            onClick={() => setSelectedCity(MOCK_CITY)}
          >
            Simular: seleccionar Tokyo
          </button>
          <button
            className="ftp-btn"
            onClick={() => setSelectedCity(null)}
          >
            Limpiar ciudad
          </button>
        </div>
      </div>
    </>
  )
}
