import { IconCloud, IconLeaf, IconBuilding, IconMapPin, IconRoute } from '@tabler/icons-react'
import { useStore } from '../../store/useStore'
import type { LayerKey } from '../../store/useStore'

interface LayerConfig {
  key: LayerKey
  label: string
  color: string
  colorAlpha: string
  available: boolean
}

const LAYERS: LayerConfig[] = [
  { key: 'clima',  label: 'Clima',   color: '#58A6FF', colorAlpha: 'rgba(88,166,255,0.18)',  available: true  },
  { key: 'nidos',  label: 'Nidos',   color: '#3FB950', colorAlpha: 'rgba(63,185,80,0.18)',   available: true  },
  { key: 'gyms',   label: 'Gyms',    color: '#F97316', colorAlpha: 'rgba(249,115,22,0.18)',  available: false },
  { key: 'stops',  label: 'Paradas', color: '#A78BFA', colorAlpha: 'rgba(167,139,250,0.18)', available: false },
  { key: 'rutas',  label: 'Rutas',   color: '#F59E0B', colorAlpha: 'rgba(245,158,11,0.18)',  available: false },
]

const ICONS: Record<LayerKey, React.ReactElement> = {
  clima: <IconCloud  size={13} stroke={1.5} />,
  nidos: <IconLeaf   size={13} stroke={1.5} />,
  gyms:  <IconBuilding size={13} stroke={1.5} />,
  stops: <IconMapPin size={13} stroke={1.5} />,
  rutas: <IconRoute  size={13} stroke={1.5} />,
}

export function LayerToggles() {
  const activeLayers = useStore((s) => s.activeLayers)
  const toggleLayer  = useStore((s) => s.toggleLayer)

  return (
    <>
      <style>{`
        .lt-nav {
          display: flex;
          align-items: stretch;
          align-self: stretch;
          gap: 0;
          margin: 0 4px;
        }

        .lt-tab {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 12px;
          align-self: stretch;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          position: relative;
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap;
        }

        .lt-tab:hover:not(.lt-disabled) {
          color: var(--text-primary);
        }

        .lt-tab.lt-disabled {
          opacity: 0.35;
          cursor: default;
          pointer-events: none;
        }

        .lt-icon-wrap {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .lt-sep {
          width: 1px;
          background: var(--border-default);
          margin: 14px 4px;
          flex-shrink: 0;
        }

        .lt-badge {
          font-size: 9px;
          padding: 1px 5px;
          border-radius: 8px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          letter-spacing: 0.3px;
          font-weight: 500;
        }

        @media (max-width: 767px) {
          .lt-nav { display: none; }
        }
      `}</style>

      <nav className="lt-nav" aria-label="Capas del mapa">
        {LAYERS.map(({ key, label, color, colorAlpha, available }, index) => {
          const isActive  = activeLayers[key]
          const icon = ICONS[key]
          const showSep   = !available && index > 0 && LAYERS[index - 1].available

          const activeIconStyle: React.CSSProperties = isActive && available ? {
            background: colorAlpha,
            color: color,
          } : {}

          return (
            <div key={key} style={{ display: 'contents' }}>
              {showSep && <div className="lt-sep" aria-hidden="true" />}
              <button
                className={[
                  'lt-tab',
                  !available ? 'lt-disabled' : '',
                ].join(' ')}
                style={{
                  color: isActive && available ? color : undefined,
                  borderBottomColor: isActive && available ? color : 'transparent',
                }}
                onClick={() => available && toggleLayer(key)}
                aria-pressed={available ? isActive : undefined}
                type="button"
              >
                <span
                  className="lt-icon-wrap"
                  style={activeIconStyle}
                >
                  {icon}
                </span>
                {label}
                {!available && <span className="lt-badge">pronto</span>}
              </button>
            </div>
          )
        })}
      </nav>
    </>
  )
}