import { useStore, type City } from '../../store/useStore'
import { TYPE_ICON } from '../../config/typeIcons'
import { calculateDistance, formatDistance } from '../../utils/distance'

interface LocationCardProps {
  city: City
  isActive: boolean
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hours12 = h % 12 || 12
  return `${String(hours12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

function getLocalDate(timezone: number): string {
  const now = new Date()
  const d = new Date(now.getTime() + timezone * 60 * 60 * 1000)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

export default function LocationCard({ city, isActive }: LocationCardProps) {
  const setSelectedCity = useStore((s) => s.setSelectedCity)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const favorites = useStore((s) => s.favorites)
  const homeLocation = useStore((s) => s.homeLocation)

  const isFavorite = favorites.includes(city.id)

  const handleCardClick = () => {
    setSelectedCity(city)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(city.id)
  }

  const localDate = getLocalDate(city.timezone)
  const localTime = formatTime(city.localTime)

  const distInfo = homeLocation
    ? (() => {
        const m = calculateDistance(homeLocation.lat, homeLocation.lon, city.lat, city.lon)
        const eta = Math.ceil(m / 1000 / 40 * 60)
        return { dist: formatDistance(m), eta }
      })()
    : null

  return (
    <>
      <style>{`
        .lc-root {
          position: relative;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          cursor: pointer;
          transition: all 200ms ease;
          user-select: none;
          overflow: hidden;
        }

        .lc-root:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        .lc-root.active {
          background: rgba(var(--ui-accent-rgb, 88, 166, 255), 0.08);
          border-color: var(--ui-accent);
          border-left: 3px solid var(--ui-accent);
        }

        .lc-main {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          position: relative;
        }
        .lc-root.active .lc-main { padding-left: 10px; }

        /* Barra inferior */
        .lc-bar {
          display: flex;
          align-items: center;
          padding: 5px 12px 5px 54px;
          border-top: 1px solid var(--radar-dim);
          background: var(--home-dim);
          gap: 10px;
        }
        .lc-root.active .lc-bar { padding-left: 52px; }
        .lc-bar-item { display: flex; align-items: center; gap: 5px; }
        .lc-bar-val {
          font-size: 11px;
          font-weight: 700;
          color: var(--radar);
          font-variant-numeric: tabular-nums;
        }
        .lc-bar-divider {
          width: 1px;
          height: 11px;
          background: var(--radar-dim);
        }
        .lc-radar-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--radar);
          box-shadow: 0 0 0 0 var(--radar-glow);
          animation: radar-pulse 2s ease-out infinite;
          flex-shrink: 0;
        }
        @keyframes radar-pulse {
          0%   { box-shadow: 0 0 0 0 var(--radar-glow); }
          60%  { box-shadow: 0 0 0 5px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }

        .lc-weather {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          object-fit: contain;
        }

        .lc-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-right: 24px;
        }

        .lc-row1 {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lc-name {
          flex: 1;
          min-width: 0;
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lc-types-row {
          display: flex;
          gap: 2px;
          flex-shrink: 0;
          align-items: center;
        }

        .lc-type-icon {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }

        .lc-favorite {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          transition: transform 150ms ease;
        }

        .lc-favorite:hover {
          transform: scale(1.2);
        }

        .lc-favorite.active {
          color: #ff4757;
        }

        .lc-favorite:not(.active) {
          color: #9ca3af;
        }

        .lc-row2 {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .lc-country {
          font-family: 'Exo 2', sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .lc-datetime {
          font-family: 'Exo 2', sans-serif;
          font-weight: 400;
          font-size: 10px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

      `}</style>

      <div className={`lc-root ${isActive ? 'active' : ''}`} onClick={handleCardClick}>

        <div className="lc-main">
          <img
            className="lc-weather"
            src={`/weather/${city.condition}.png`}
            alt={city.condition}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />

          <div className="lc-body">
            <div className="lc-row1">
              <span className="lc-name" title={city.name}>{city.name}</span>
              <div className="lc-types-row">
                {city.boostedTypes.slice(0, 4).map((type) => {
                  const src = TYPE_ICON[type.toLowerCase()]
                  if (!src) return null
                  return (
                    <img
                      key={type}
                      className="lc-type-icon"
                      src={src}
                      alt={type}
                      title={type}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )
                })}
              </div>
              <button
                className={`lc-favorite ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                type="button"
                title={isFavorite ? 'Quitar favorito' : 'Agregar favorito'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>

            <div className="lc-row2">
              <span className="lc-country">{city.country}</span>
              <span className="lc-datetime">{localDate} · {localTime}</span>
            </div>
          </div>
        </div>

        {distInfo && (
          <div className="lc-bar">
            <div className="lc-radar-dot"/>
            <div className="lc-bar-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--radar)" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
              <span className="lc-bar-val">{distInfo.dist}</span>
            </div>
            <div className="lc-bar-divider"/>
            <div className="lc-bar-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--radar)" strokeWidth="2.5" style={{opacity:.8}}>
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
              </svg>
              <span className="lc-bar-val">~{distInfo.eta} min</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
