import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { CONDITION_COLORS, CONDITION_LABEL, BADGE_ICONS } from '../../services/weather/weatherService'
import { WEATHER_IMAGES, type WeatherCondition } from '../../config/weatherImages'
import type { BadgeType } from '../../services/weather/weatherService'
import { POKEMON_TYPES, TYPE_IMAGES } from '../../config/pokemonTypes'

const CONDITIONS: WeatherCondition[] = ['sunny', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'windy']

const BADGE_LABELS: Record<BadgeType, string> = {
  stops: 'Pokestop Hub',
  gyms: 'Gym Hub',
  community: 'Comunidad Activa',
  best: 'Mejores Lugares',
}
const BADGE_ORDER: BadgeType[] = ['stops', 'gyms', 'community', 'best']

// US-827: colores oficiales de highlight por categoria
const CATEGORY_COLORS: Record<BadgeType, string> = {
  stops:     '#58A6FF',
  gyms:      '#F85149',
  community: '#3FB950',
  best:      '#FFD700',
}

const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', grass: 'Planta',
  electric: 'Electrico', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psiquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragon', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada',
}

type MainTab = 'clima' | 'nidos'
type ClimaSubtab = 'tipo' | 'categoria'
type NidosSubtab = 'tipos' | 'estado'

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768)
  const [mainTab, setMainTab] = useState<MainTab>('clima')
  const [climaSubtab, setClimaSubtab] = useState<ClimaSubtab>('tipo')
  const [nidosSubtab, setNidosSubtab] = useState<NidosSubtab>('tipos')

  const highlightCategories = useStore((s) => s.highlightCategories)
  const toggleHighlightCategory = useStore((s) => s.toggleHighlightCategory)

  return (
    <>
      <style>{`
        .ml-root {
          position: absolute;
          bottom: 28px;
          right: 12px;
          z-index: 1000;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          overflow: hidden;
          width: 188px;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
        }

        .ml-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid var(--border-default);
          flex-shrink: 0;
        }
        .ml-header:hover { background: var(--bg-tertiary); }

        .ml-title {
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
        }

        .ml-chevron {
          font-size: 9px;
          color: var(--text-secondary);
          transition: transform 200ms ease;
        }
        .ml-chevron.open { transform: rotate(180deg); }

        /* tabs principales */
        .ml-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-default);
          background: var(--bg-primary);
          flex-shrink: 0;
        }

        .ml-tab {
          flex: 1;
          padding: 7px 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: 'Exo 2', sans-serif;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          border-bottom: 2px solid transparent;
          transition: all 150ms ease;
        }
        .ml-tab:hover { color: var(--text-primary); background: var(--bg-tertiary); }
        .ml-tab.active { color: var(--ui-accent); border-bottom-color: var(--ui-accent); }

        /* subtabs */
        .ml-subtabs {
          display: flex;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-tertiary);
          flex-shrink: 0;
        }

        .ml-subtab {
          flex: 1;
          padding: 5px 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: 'Exo 2', sans-serif;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 2px solid transparent;
          transition: all 150ms ease;
        }
        .ml-subtab:hover { color: var(--text-primary); }
        .ml-subtab.active { color: var(--ui-accent); border-bottom-color: var(--ui-accent); }

        /* body */
        .ml-body {
          overflow-y: auto;
          flex: 1;
          padding: 6px 0;
        }

        /* clima: sprite + label */
        .ml-clima-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
        }

        .ml-sprite {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ml-sprite img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ml-label {
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
        }

        /* categoria: icono + label */
        .ml-cat-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px;
          cursor: pointer;
          transition: background 150ms ease;
        }
        .ml-cat-row:hover { background: var(--bg-tertiary); }

        .ml-cat-icon {
          font-size: 14px;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .ml-checkbox {
          width: 14px;
          height: 14px;
          border: 1.5px solid var(--border-default);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 150ms ease;
          margin-left: auto;
        }
        .ml-checkbox.checked {
          background: var(--ui-accent);
          border-color: var(--ui-accent);
        }
        .ml-checkbox.checked::after {
          content: '✓';
          color: white;
          font-size: 10px;
          font-weight: bold;
        }

        /* tipos grid 3col */
        .ml-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          padding: 8px;
        }

        .ml-type-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 5px 3px;
          border-radius: 6px;
          cursor: default;
        }

        .ml-type-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ml-type-icon img {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }

        .ml-type-name {
          font-family: 'Exo 2', sans-serif;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--text-secondary);
          text-align: center;
          line-height: 1;
        }

        /* estado badges */
        .ml-estado-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
        }

        .ml-badge {
          font-size: 15px;
          width: 22px;
          text-align: center;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .ml-root {
            bottom: 75px;
            right: 8px;
            max-width: 90vw;
            max-height: 50vh;
          }
        }
      `}</style>

      <div className="ml-root">
        {/* Header colapsable */}
        <div className="ml-header" onClick={() => setCollapsed((c) => !c)}>
          <span className="ml-title">Leyenda</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {highlightCategories.length > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 700, fontFamily: "'Exo 2', sans-serif",
                background: 'var(--ui-accent)', color: '#fff',
                borderRadius: 8, padding: '1px 5px', lineHeight: 1.4,
              }}>
                {highlightCategories.length}
              </span>
            )}
            <span className={`ml-chevron ${collapsed ? '' : 'open'}`}>▼</span>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Tabs principales */}
            <div className="ml-tabs">
              <button
                className={`ml-tab ${mainTab === 'clima' ? 'active' : ''}`}
                onClick={() => setMainTab('clima')}
                type="button"
              >
                Clima
              </button>
              <button
                className={`ml-tab ${mainTab === 'nidos' ? 'active' : ''}`}
                onClick={() => setMainTab('nidos')}
                type="button"
              >
                Nidos
              </button>
            </div>

            {/* Tab Clima */}
            {mainTab === 'clima' && (
              <>
                <div className="ml-subtabs">
                  <button
                    className={`ml-subtab ${climaSubtab === 'tipo' ? 'active' : ''}`}
                    onClick={() => setClimaSubtab('tipo')}
                    type="button"
                  >
                    Tipo Clima
                  </button>
                  <button
                    className={`ml-subtab ${climaSubtab === 'categoria' ? 'active' : ''}`}
                    onClick={() => setClimaSubtab('categoria')}
                    type="button"
                  >
                    Categoria
                  </button>
                </div>

                <div className="ml-body">
                  {climaSubtab === 'tipo' && CONDITIONS.map((cond) => (
                    <div key={cond} className="ml-clima-row">
                      <div
                        className="ml-sprite"
                        style={{ background: `${CONDITION_COLORS[cond]}30` }}
                      >
                        <img src={WEATHER_IMAGES[cond]} alt={cond} />
                      </div>
                      <span className="ml-label">{CONDITION_LABEL[cond]}</span>
                    </div>
                  ))}

                  {climaSubtab === 'categoria' && BADGE_ORDER.map((badge) => {
                    const active = highlightCategories.includes(badge)
                    const color = CATEGORY_COLORS[badge]
                    return (
                      <div
                        key={badge}
                        className="ml-cat-row"
                        onClick={() => toggleHighlightCategory(badge)}
                        style={active ? { background: `${color}18` } : undefined}
                      >
                        <span className="ml-cat-icon">{BADGE_ICONS[badge]}</span>
                        <span className="ml-label" style={active ? { color, fontWeight: 600 } : undefined}>
                          {BADGE_LABELS[badge]}
                        </span>
                        <div
                          className={`ml-checkbox ${active ? 'checked' : ''}`}
                          style={active ? { background: color, borderColor: color } : undefined}
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Tab Nidos */}
            {mainTab === 'nidos' && (
              <>
                <div className="ml-subtabs">
                  <button
                    className={`ml-subtab ${nidosSubtab === 'tipos' ? 'active' : ''}`}
                    onClick={() => setNidosSubtab('tipos')}
                    type="button"
                  >
                    Tipos
                  </button>
                  <button
                    className={`ml-subtab ${nidosSubtab === 'estado' ? 'active' : ''}`}
                    onClick={() => setNidosSubtab('estado')}
                    type="button"
                  >
                    Estado
                  </button>
                </div>

                <div className="ml-body">
                  {nidosSubtab === 'tipos' && (
                    <div className="ml-types-grid">
                      {POKEMON_TYPES.map((type) => (
                        <div key={type} className="ml-type-chip" title={TYPE_LABELS[type]}>
                          <div
                            className="ml-type-icon"
                            style={{ background: `var(--type-${type}, #888)` }}
                          >
                            <img src={TYPE_IMAGES[type]} alt={type} />
                          </div>
                          <span className="ml-type-name">{TYPE_LABELS[type]}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {nidosSubtab === 'estado' && (
                    <>
                      <div className="ml-estado-row">
                        <span className="ml-badge">✅</span>
                        <span className="ml-label">Verificado</span>
                      </div>
                      <div className="ml-estado-row">
                        <span className="ml-badge">⭐</span>
                        <span className="ml-label">Mayor Spawn</span>
                      </div>
                      <div className="ml-estado-row">
                        <span className="ml-badge">✨</span>
                        <span className="ml-label">Mayor Polvo</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
