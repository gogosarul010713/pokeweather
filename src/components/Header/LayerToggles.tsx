import { useStore } from '../../store/useStore'
import type { LayerKey } from '../../types/layers'

interface LayerConfig {
  key: LayerKey
  label: string
  icon: string
  color: string
  available: boolean
}

const LAYERS: LayerConfig[] = [
  { key: 'clima',  label: 'Clima',       icon: '\u{1F324}',  color: '#3b82f6', available: true },
  { key: 'nidos',  label: 'Nidos',       icon: '\u{1FAA3}',  color: '#22c55e', available: true },
  { key: 'gyms',   label: 'Gimnasios',   icon: '\u{1F3DF}',  color: '#f97316', available: false },
  { key: 'stops',  label: 'PokéParadas', icon: '\u{1F535}',  color: '#a78bfa', available: false },
  { key: 'rutas',  label: 'Rutas',       icon: '\u{1F5FA}',  color: '#f59e0b', available: false },
]

export default function LayerToggles() {
  const activeLayers = useStore((s) => s.activeLayers)
  const toggleLayer  = useStore((s) => s.toggleLayer)

  return (
    <>
      <style>{`
        .lt-root {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .lt-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 20px;
          border: 1px solid;
          font-size: 12px;
          font-family: 'Exo 2', sans-serif;
          font-weight: 500;
          transition: all 0.15s;
          white-space: nowrap;
          background: none;
        }

        .lt-btn:not(:disabled) {
          cursor: pointer;
        }

        .lt-btn:disabled {
          opacity: 0.45;
          cursor: default;
        }

        .lt-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .lt-label {
            display: none;
          }
          .lt-btn {
            padding: 5px 7px;
          }
        }
      `}</style>

      <div className="lt-root">
        {LAYERS.map(({ key, label, icon, color, available }) => {
          const isActive = activeLayers[key]

          const activeStyle: React.CSSProperties = isActive && available
            ? { borderColor: color + '60', background: color + '20', color }
            : { borderColor: 'var(--border-default)', background: 'transparent', color: 'var(--text-secondary)' }

          return (
            <button
              key={key}
              className="lt-btn"
              style={activeStyle}
              onClick={() => available && toggleLayer(key)}
              disabled={!available}
              title={available ? undefined : 'Proximamente'}
              aria-pressed={isActive}
              type="button"
            >
              <span
                className="lt-dot"
                style={{
                  background: isActive && available ? color : 'currentColor',
                  opacity: isActive && available ? 1 : 0.4,
                }}
              />
              <span className="lt-label">{icon} {label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
