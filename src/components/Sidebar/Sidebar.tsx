import { useStore, type City } from '../../store/useStore'
import LocationFeed from './LocationFeed'
import FilterPanel from './FilterPanel'
import { Z } from '../../config/zIndex'

interface SidebarProps {
  cities: City[]
}

export default function Sidebar({ cities }: SidebarProps) {
  const activeLayers = useStore((s) => s.activeLayers)
  const hasActiveLayer = activeLayers.clima || activeLayers.nidos

  return (
    <>
      <style>{`
        .sb-wrapper {
          position: relative;
          height: 100%;
        }

        /* Sidebar visible solo cuando hay capa activa */
        .sb-root {
          width: 300px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-default);
          overflow: hidden;
          height: 100%;
          z-index: ${Z.sidebar};
          position: relative;
          transition: width 280ms ease, opacity 280ms ease;
        }

        .sb-root.sb-hidden {
          width: 0;
          opacity: 0;
          border-right: none;
          pointer-events: none;
        }

        /* ── Content ── */
        .sb-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sb-feed-badge {
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 400;
          color: var(--text-muted);
          flex-shrink: 0;
          white-space: nowrap;
        }

        .sb-detail-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font: Exo 2 400 13px;
          padding: 24px;
          text-align: center;
        }

        .sb-detail-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 8px;
        }

        /* ── TABLET ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sb-root {
            width: 280px;
          }
        }

        /* ── MOBILE: sidebar reemplazado por BottomSheet ── */
        @media (max-width: 767px) {
          .sb-root {
            display: none;
          }
        }
      `}</style>

      <div className="sb-wrapper">
        <aside className={`sb-root${hasActiveLayer ? '' : ' sb-hidden'}`}>
          <div className="sb-content" style={{ position: 'relative' }}>
            {/* Content Wrapper — posición relativa para Overlay */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* FilterPanel — filtros adaptativos por capa activa (US-821) */}
              <FilterPanel />

              {/* LocationFeed — lista unificada cuando al menos una capa activa */}
              {(activeLayers.clima || activeLayers.nidos) && (
                <LocationFeed cities={cities} />
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
