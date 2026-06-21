import { useStore } from '../../store/useStore'
import FilterPanelClima from '../Header/FilterPanelClima'
import FilterPanelNests from '../Header/FilterPanelNests'

const LAYER_COLORS = {
  clima: '#3b82f6',
  nidos: '#22c55e',
} as const

export default function SidebarFilterPanel() {
  const activeLayers = useStore((s) => s.activeLayers)
  const hasAny = activeLayers.clima || activeLayers.nidos

  return (
    <>
      <style>{`
        .sfp-root {
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .sfp-empty {
          padding: 10px 12px;
          font-size: 12px;
          color: var(--text-secondary);
          text-align: center;
          font-family: 'Exo 2', sans-serif;
        }

        .sfp-section {
          padding: 8px 12px;
        }

        .sfp-section + .sfp-section {
          border-top: 1px solid var(--border-default);
        }

        .sfp-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          font-family: 'Exo 2', sans-serif;
        }

        .sfp-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>

      <div className="sfp-root">
        {!hasAny && (
          <div className="sfp-empty">
            Activa una capa para ver filtros
          </div>
        )}

        {activeLayers.clima && (
          <div className="sfp-section">
            <div className="sfp-label" style={{ color: LAYER_COLORS.clima }}>
              <span className="sfp-dot" style={{ background: LAYER_COLORS.clima }} />
              Clima
            </div>
            <FilterPanelClima />
          </div>
        )}

        {activeLayers.nidos && (
          <div className="sfp-section">
            <div className="sfp-label" style={{ color: LAYER_COLORS.nidos }}>
              <span className="sfp-dot" style={{ background: LAYER_COLORS.nidos }} />
              Nidos
            </div>
            <FilterPanelNests />
          </div>
        )}
      </div>
    </>
  )
}
