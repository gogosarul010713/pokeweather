import { useEffect, useState } from 'react'
import { useStore, type City } from '../../store/useStore'

const TYPE_ICON: Record<string, string> = {
  normal:   '/types/ico_0_normal.webp',
  fighting: '/types/ico_1_fighting.webp',
  flying:   '/types/ico_2_flying.webp',
  poison:   '/types/ico_3_poison.webp',
  ground:   '/types/ico_4_ground.webp',
  rock:     '/types/ico_5_rock.webp',
  bug:      '/types/ico_6_bug.webp',
  ghost:    '/types/ico_7_ghost.webp',
  steel:    '/types/ico_8_steel.webp',
  fire:     '/types/ico_9_fire.webp',
  water:    '/types/ico_10_water.webp',
  grass:    '/types/ico_11_grass.webp',
  electric: '/types/ico_12_electric.webp',
  psychic:  '/types/ico_13_psychic.webp',
  ice:      '/types/ico_14_ice.webp',
  dragon:   '/types/ico_15_dragon.webp',
  dark:     '/types/ico_16_dark.webp',
  fairy:    '/types/ico_17_fairy.webp',
}

const CONDITION_LABEL: Record<string, string> = {
  sunny: 'Sunny', partly: 'Partly Cloudy', cloudy: 'Cloudy',
  fog: 'Fog', rain: 'Rain', snow: 'Snow', windy: 'Windy',
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

const ClipboardSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  </svg>
)

const CheckSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

interface LocationDetailProps {
  city: City
}

export default function LocationDetail({ city }: LocationDetailProps) {
  const setSidebarMode = useStore((s) => s.setSidebarMode)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const favorites = useStore((s) => s.favorites)

  const isFavorite = favorites.includes(city.id)
  const [copied, setCopied] = useState(false)

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarMode('list')
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [setSidebarMode])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  const localDate = getLocalDate(city.timezone)
  const localTime = formatTime(city.localTime)
  const region = city.region.charAt(0).toUpperCase() + city.region.slice(1)

  return (
    <>
      <style>{`
        .ld-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 499;
          animation: fadeIn 200ms ease;
        }

        .ld-modal {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-height: 72vh;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-default);
          border-radius: 16px 16px 0 0;
          z-index: 500;
          display: flex;
          flex-direction: column;
          animation: slideUp 250ms ease;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); } to { transform: translateY(0); }
        }

        /* ── Header ── */
        .ld-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .ld-weather-icon {
          width: 48px;
          height: 48px;
          object-fit: contain;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ld-city-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ld-city-name {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ld-city-sub {
          font-family: 'Exo 2', sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .ld-coords-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .ld-coords {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
          letter-spacing: 0.2px;
        }

        .ld-copy-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 3px 5px;
          transition: all 150ms ease;
          flex-shrink: 0;
        }

        .ld-copy-icon-btn:hover {
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .ld-copy-icon-btn.copied {
          background: rgba(var(--ui-accent-rgb, 88, 166, 255), 0.1);
          border-color: var(--ui-accent);
          color: var(--ui-accent);
        }

        .ld-header-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .ld-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 150ms ease;
          font-size: 18px;
          line-height: 1;
        }

        .ld-btn:hover { color: var(--text-primary); }
        .ld-btn.active { color: #ff4757; }

        /* ── Content ── */
        .ld-content {
          flex: 1;
          overflow-y: auto;
          padding: 14px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ld-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ld-section-title {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .ld-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Exo 2', sans-serif;
          font-size: 13px;
          color: var(--text-primary);
        }

        .ld-info-label { color: var(--text-secondary); }

        .ld-datetime-value {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        /* Stat chips */
        .ld-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }

        .ld-stat-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 4px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
        }

        .ld-stat-value {
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: var(--text-primary);
        }

        .ld-stat-label {
          font-family: 'Exo 2', sans-serif;
          font-weight: 400;
          font-size: 9px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        /* Clima */
        .ld-climate-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
        }

        .ld-climate-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .ld-climate-label {
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        .ld-climate-temp {
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 1px;
        }

        /* Tipos */
        .ld-types-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ld-type-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
        }

        /* Scrollbar */
        .ld-content::-webkit-scrollbar { width: 4px; }
        .ld-content::-webkit-scrollbar-track { background: transparent; }
        .ld-content::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 2px;
        }
        .ld-content::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

        /* Footer */
        .ld-footer {
          padding: 10px 20px;
          border-top: 1px solid var(--border-default);
          flex-shrink: 0;
        }

        .ld-footer-btn {
          width: 100%;
          padding: 9px;
          border-radius: 6px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-primary);
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .ld-footer-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        @media (max-width: 600px) {
          .ld-modal { max-height: 82vh; border-radius: 12px 12px 0 0; }
        }
      `}</style>

      <div className="ld-backdrop" onClick={() => setSidebarMode('list')} />

      <div className="ld-modal">
        {/* ── Header ── */}
        <div className="ld-header">
          <img
            className="ld-weather-icon"
            src={`/weather/${city.condition}.png`}
            alt={city.condition}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />

          <div className="ld-city-info">
            <div className="ld-city-name" title={city.name}>{city.name}</div>
            <div className="ld-city-sub">{city.country} · {region}</div>
            <div className="ld-coords-row">
              <span className="ld-coords">{city.lat.toFixed(4)}, {city.lon.toFixed(4)}</span>
              <button
                className={`ld-copy-icon-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyCoords}
                type="button"
                title={copied ? 'Copiado' : 'Copiar coordenadas'}
              >
                {copied ? <CheckSVG /> : <ClipboardSVG />}
              </button>
            </div>
          </div>

          <div className="ld-header-actions">
            <button
              className={`ld-btn ${isFavorite ? 'active' : ''}`}
              onClick={() => toggleFavorite(city.id)}
              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              type="button"
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
            <button
              className="ld-btn"
              onClick={() => setSidebarMode('list')}
              title="Cerrar"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="ld-content">

          {/* Clima */}
          <div className="ld-section">
            <div className="ld-section-title">Clima</div>
            <div className="ld-climate-row">
              <img
                className="ld-climate-img"
                src={`/weather/${city.condition}.png`}
                alt={city.condition}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div>
                <div className="ld-climate-label">{CONDITION_LABEL[city.condition] ?? city.condition}</div>
                <div className="ld-climate-temp">{city.tempC}°C · Sensación {city.feelsLike}°C</div>
              </div>
            </div>
          </div>

          {/* Tipos potenciados */}
          {city.boostedTypes.length > 0 && (
            <div className="ld-section">
              <div className="ld-section-title">Tipos Potenciados</div>
              <div className="ld-types-row">
                {city.boostedTypes.map((type) => {
                  const src = TYPE_ICON[type.toLowerCase()]
                  if (!src) return null
                  return (
                    <img
                      key={type}
                      className="ld-type-img"
                      src={src}
                      alt={type}
                      title={type}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Hora local */}
          <div className="ld-section">
            <div className="ld-section-title">Hora Local</div>
            <div className="ld-datetime-value">{localDate} · {localTime}</div>
          </div>

          {/* Datos Pokémon GO */}
          <div className="ld-section">
            <div className="ld-section-title">Datos Pokémon GO</div>
            <div className="ld-stats-grid">
              <div className="ld-stat-chip">
                <span className="ld-stat-value">{city.density}</span>
                <span className="ld-stat-label">Densidad</span>
              </div>
              <div className="ld-stat-chip">
                <span className="ld-stat-value">{city.stops}</span>
                <span className="ld-stat-label">Stops</span>
              </div>
              <div className="ld-stat-chip">
                <span className="ld-stat-value">{city.gyms}</span>
                <span className="ld-stat-label">Gyms</span>
              </div>
              <div className="ld-stat-chip">
                <span className="ld-stat-value">⭐ {city.rating}</span>
                <span className="ld-stat-label">Rating</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          {city.tips && (
            <div className="ld-section">
              <div className="ld-section-title">Tips</div>
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-primary)' }}>{city.tips}</div>
            </div>
          )}

          {/* Evento */}
          {city.evento && (
            <div className="ld-section">
              <div className="ld-section-title">Evento</div>
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-primary)' }}>{city.evento}</div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="ld-footer">
          <button className="ld-footer-btn" onClick={() => setSidebarMode('list')} type="button">
            Ver en lista
          </button>
        </div>
      </div>
    </>
  )
}
