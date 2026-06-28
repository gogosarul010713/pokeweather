import { useStore, type City } from '../../store/useStore'
import LocationFeed from './LocationFeed'
import Overlay from '../UI/Overlay'
import { Z } from '../../config/zIndex'

interface SidebarProps {
  cities: City[]
}

export default function Sidebar({ cities }: SidebarProps) {
  const activeLayers = useStore((s) => s.activeLayers)

  return (
    <>
      <style>{`
        .sb-wrapper {
          position: relative;
          height: 100%;
        }

        /* Sidebar siempre visible en desktop/tablet — ver DEC-904 */
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
        <aside className="sb-root">
          <div className="sb-content" style={{ position: 'relative' }}>
            {/* Content Wrapper — posición relativa para Overlay */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Overlay cuando ninguna capa activa */}
              <Overlay
                isActive={!activeLayers.clima && !activeLayers.nidos}
                message="Activa Clima o Nidos para explorar la lista y mostrar los filtros"
                zIndex={Z.mapOverlay}
              />

              {/* LocationFeed — lista de ciudades (solo cuando capa clima activa) */}
              {activeLayers.clima && (
                <LocationFeed cities={cities} />
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
