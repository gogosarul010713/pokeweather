import { useStore, type City } from '../../store/useStore'
import { TYPE_ICON } from '../../config/typeIcons'

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

  return (
    <>
      <style>{`
        .lc-root {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          cursor: pointer;
          transition: all 200ms ease;
          user-select: none;
        }

        .lc-root:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        .lc-root.active {
          background: rgba(var(--ui-accent-rgb, 88, 166, 255), 0.08);
          border-color: var(--ui-accent);
          border-left: 3px solid var(--ui-accent);
          padding-left: 10px;
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

        {/* Weather icon */}
        <img
          className="lc-weather"
          src={`/weather/${city.condition}.png`}
          alt={city.condition}
          loading="lazy"
          width={36}
          height={36}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        <div className="lc-body">
          {/* Row 1: nombre | tipos | ❤️ */}
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
                    loading="lazy"
                    width={22}
                    height={22}
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

          {/* Row 2: país | fecha·hora */}
          <div className="lc-row2">
            <span className="lc-country">{city.country}</span>
            <span className="lc-datetime">{localDate} · {localTime}</span>
          </div>
        </div>
      </div>
    </>
  )
}
