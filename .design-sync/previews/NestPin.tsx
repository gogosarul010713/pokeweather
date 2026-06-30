// NestPin preview — hexagono SVG standalone (sin MapContainer)
// Muestra variantes por tipo Pokemon con popup de muestra

const TYPE_COLORS: Record<string, string> = {
  normal:   '#A8A878',
  fire:     '#F08030',
  water:    '#6890F0',
  grass:    '#78C850',
  electric: '#F8D030',
  ice:      '#98D8D8',
  fighting: '#C03028',
  poison:   '#A040A0',
  ground:   '#E0C068',
  flying:   '#A890F0',
  psychic:  '#F85888',
  bug:      '#A8B820',
  rock:     '#B8A038',
  ghost:    '#705898',
  dragon:   '#7038F8',
  dark:     '#705848',
  steel:    '#B8B8D0',
  fairy:    '#EE99AC',
}

function HexPin({ color, size = 32 }: { color: string; size?: number }) {
  const s = size
  const pts = [
    [s / 2,             s * 0.065],
    [s * 0.875,         s * 0.25],
    [s * 0.875,         s * 0.75],
    [s / 2,             s * 0.935],
    [s * 0.125,         s * 0.75],
    [s * 0.125,         s * 0.25],
  ].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <polygon points={pts} fill={color} stroke="white" strokeWidth="1.5" />
      <circle cx={s / 2} cy={s / 2} r={s * 0.094} fill="white" opacity="0.8" />
    </svg>
  )
}

const SAMPLE_NESTS = [
  { type: 'fire',     name: 'Charmander',  city: 'Tokyo',    country: 'Japon',  spawnRate: 85 },
  { type: 'water',    name: 'Squirtle',    city: 'Sydney',   country: 'Australia', spawnRate: 72 },
  { type: 'grass',    name: 'Bulbasaur',   city: 'Paris',    country: 'Francia', spawnRate: 68 },
  { type: 'electric', name: 'Pikachu',     city: 'Seoul',    country: 'Corea', spawnRate: 91 },
  { type: 'psychic',  name: 'Abra',        city: 'NYC',      country: 'EEUU',  spawnRate: 55 },
  { type: 'dragon',   name: 'Dratini',     city: 'London',   country: 'UK',    spawnRate: 42 },
  { type: 'ghost',    name: 'Gastly',      city: 'Prague',   country: 'Czechia', spawnRate: 78 },
  { type: 'fairy',    name: 'Clefairy',    city: 'Rome',     country: 'Italia', spawnRate: 63 },
  { type: 'ice',      name: 'Seel',        city: 'Helsinki', country: 'Finlandia', spawnRate: 70 },
]

export function NestPin() {
  return (
    <>
      <style>{`
        .npp-root {
          padding: 20px;
          font-family: 'Exo 2', sans-serif;
          background: var(--bg-primary);
          border-radius: 8px;
          border: 1px solid var(--border-default);
        }

        .npp-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .npp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .npp-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 6px;
          transition: border-color 150ms ease;
        }

        .npp-card:hover {
          border-color: var(--border-hover, var(--ui-accent));
        }

        .npp-info {
          flex: 1;
          min-width: 0;
        }

        .npp-pokemon {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .npp-city {
          font-size: 10px;
          color: var(--text-secondary);
          margin-top: 1px;
        }

        .npp-spawn {
          font-size: 9px;
          color: var(--text-muted, var(--text-secondary));
          margin-top: 2px;
        }

        .npp-popup-demo {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          padding: 12px 14px;
          max-width: 220px;
        }

        .npp-popup-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }

        .npp-popup-row {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 4px 0;
          line-height: 1.5;
        }

        .npp-popup-row strong {
          color: var(--text-primary);
        }

        .npp-section-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          margin: 20px 0 10px;
        }

        .npp-all-types {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .npp-type-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
        }
      `}</style>

      <div className="npp-root">
        <div className="npp-title">NestPin — Hexagono por tipo Pokemon</div>

        <div className="npp-grid">
          {SAMPLE_NESTS.map((n) => (
            <div key={n.type} className="npp-card">
              <HexPin color={TYPE_COLORS[n.type] ?? '#999'} />
              <div className="npp-info">
                <div className="npp-pokemon">{n.name}</div>
                <div className="npp-city">{n.city}, {n.country}</div>
                <div className="npp-spawn">Spawn: {n.spawnRate}%</div>
              </div>
            </div>
          ))}
        </div>

        <div className="npp-section-label">Popup al hacer click</div>
        <div className="npp-popup-demo">
          <h4 className="npp-popup-title">Parque Shinjuku</h4>
          <p className="npp-popup-row"><strong>Pokemon:</strong> Charmander</p>
          <p className="npp-popup-row"><strong>Tipo:</strong> fire</p>
          <p className="npp-popup-row"><strong>Ubicacion:</strong> Tokyo, Japon</p>
          <p className="npp-popup-row"><strong>Tasa de spawn:</strong> 85%</p>
        </div>

        <div className="npp-section-label">Todos los tipos disponibles</div>
        <div className="npp-all-types">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="npp-type-pill" style={{ background: color }}>
              <HexPin color={color} size={14} />
              {type}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
