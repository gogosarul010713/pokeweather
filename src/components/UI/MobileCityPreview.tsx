import { useStore, type City } from '../../store/useStore'
import { TYPE_ICON } from '../../config/typeIcons'

interface MobileCityPreviewProps {
  city: City
}

export default function MobileCityPreview({ city }: MobileCityPreviewProps) {
  const setSelectedCity = useStore((s) => s.setSelectedCity)
  const setSidebarMode = useStore((s) => s.setSidebarMode)

  const handleVerDetalle = () => {
    setSidebarMode('detail')
  }

  const handleClose = () => {
    setSelectedCity(null)
  }

  return (
    <>
      <style>{`
        .mcp-root {
          display: none;
        }

        @media (max-width: 767px) {
          .mcp-root {
            display: flex;
            position: fixed;
            bottom: 56px; /* above MobileNavBar */
            left: 0;
            right: 0;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-default);
            padding: 12px 16px;
            z-index: 999;
            flex-direction: column;
            gap: 10px;
            animation: mcp-slide-up 200ms ease;
          }

          @keyframes mcp-slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }

          .mcp-header {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .mcp-weather-img {
            width: 36px;
            height: 36px;
            object-fit: contain;
            flex-shrink: 0;
          }

          .mcp-info {
            flex: 1;
            min-width: 0;
          }

          .mcp-name {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .mcp-meta {
            font-size: 11px;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 2px;
          }

          .mcp-types {
            display: flex;
            gap: 3px;
            align-items: center;
          }

          .mcp-type-img {
            width: 18px;
            height: 18px;
            object-fit: contain;
          }

          .mcp-close {
            width: 28px;
            height: 28px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-default);
            border-radius: 50%;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            flex-shrink: 0;
            transition: all 150ms ease;
          }

          .mcp-close:hover {
            color: var(--text-primary);
            border-color: var(--border-strong);
          }

          .mcp-detail-btn {
            width: 100%;
            padding: 9px;
            background: var(--ui-accent);
            color: var(--bg-primary);
            border: none;
            border-radius: 6px;
            font-family: 'Exo 2', sans-serif;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 150ms ease;
          }

          .mcp-detail-btn:hover {
            opacity: 0.85;
          }
        }
      `}</style>

      <div className="mcp-root">
        {/* Fila superior: clima + info + cerrar */}
        <div className="mcp-header">
          <img
            src={`/weather/${city.condition}.png`}
            alt={city.condition}
            className="mcp-weather-img"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />

          <div className="mcp-info">
            <div className="mcp-name">{city.name}</div>
            <div className="mcp-meta">
              <span>{city.flag} {city.country}</span>
              {city.boostedTypes.length > 0 && (
                <>
                  <span>·</span>
                  <div className="mcp-types">
                    {city.boostedTypes.slice(0, 4).map((type) => {
                      const src = TYPE_ICON[type.toLowerCase()]
                      if (!src) return null
                      return (
                        <img
                          key={type}
                          src={src}
                          alt={type}
                          title={type}
                          className="mcp-type-img"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <button className="mcp-close" onClick={handleClose} type="button" title="Cerrar">
            ✕
          </button>
        </div>

        {/* Botón Ver detalle */}
        <button className="mcp-detail-btn" onClick={handleVerDetalle} type="button">
          Ver detalle →
        </button>
      </div>
    </>
  )
}
