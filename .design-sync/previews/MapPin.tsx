// MapPin preview — pin teardrop SVG standalone (sin MapContainer)
// Muestra variantes: sunny, rain, cloudy, snow, selected, con badges

const CONDITION_COLORS: Record<string, string> = {
  sunny:   '#F5A623',
  partly:  '#A0C4FF',
  cloudy:  '#8A9BB5',
  fog:     '#9EADBD',
  rain:    '#5B8CDB',
  snow:    '#B0D4F1',
  windy:   '#6EC6CA',
}

const CONDITION_LABEL: Record<string, string> = {
  sunny:  'Soleado',
  partly: 'Parcialmente nublado',
  cloudy: 'Nublado',
  fog:    'Niebla',
  rain:   'Lluvia',
  snow:   'Nieve',
  windy:  'Ventoso',
}

const BADGE_ICONS: Record<string, string> = {
  stops:     '🔵',
  gyms:      '⚔️',
  community: '👥',
  best:      '⭐',
}

function PinSVG({
  color,
  selected = false,
  badges = [],
  showBadges = true,
}: {
  color: string
  selected?: boolean
  badges?: string[]
  showBadges?: boolean
}) {
  const w = selected ? 28 : 22
  const h = selected ? 37 : 29
  const cx = w / 2
  const cy = Math.round(w * 0.46)
  const r  = Math.round(w * 0.42)
  const path = `M${cx},1 A${r},${r} 0 1,1 ${cx - 0.01},1 L${cx},${h - 1} Z`

  const badgePositions = [
    { top: -6, left: -6 },
    { top: -6, left: w - 8 },
    { top: h - 10, left: w - 8 },
  ]

  return (
    <div style={{ position: 'relative', width: w, height: h, filter: selected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,255,255,0.6))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <path d={path} fill={color} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={Math.round(r * 0.42)} fill="rgba(255,255,255,0.9)" />
      </svg>
      {showBadges && badges.map((badge, i) => (
        <div
          key={badge}
          style={{
            position: 'absolute',
            top: badgePositions[i]?.top ?? 0,
            left: badgePositions[i]?.left ?? 0,
            fontSize: 12,
            lineHeight: 1,
            zIndex: 10,
          }}
        >
          {BADGE_ICONS[badge] ?? badge}
        </div>
      ))}
    </div>
  )
}

const VARIANTS: Array<{ condition: string; badges?: string[]; selected?: boolean; label: string }> = [
  { condition: 'sunny',  label: 'Soleado' },
  { condition: 'rain',   label: 'Lluvia', badges: ['stops', 'gyms'] },
  { condition: 'cloudy', label: 'Nublado', badges: ['community'] },
  { condition: 'snow',   label: 'Nieve' },
  { condition: 'fog',    label: 'Niebla' },
  { condition: 'windy',  label: 'Ventoso' },
  { condition: 'sunny',  selected: true, label: 'Seleccionado', badges: ['stops', 'gyms', 'best'] },
]

export function MapPin() {
  return (
    <>
      <style>{`
        .mpp-root {
          padding: 20px;
          font-family: 'Exo 2', sans-serif;
          background: var(--bg-primary);
          border-radius: 8px;
          border: 1px solid var(--border-default);
        }

        .mpp-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .mpp-grid {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
          align-items: flex-end;
          margin-bottom: 24px;
        }

        .mpp-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .mpp-label {
          font-size: 10px;
          color: var(--text-secondary);
          text-align: center;
          line-height: 1.3;
        }

        .mpp-color-swatch {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 4px;
        }

        .mpp-divider {
          border: none;
          border-top: 1px solid var(--border-default);
          margin: 16px 0;
        }

        .mpp-badges-note {
          font-size: 10px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>

      <div className="mpp-root">
        <div className="mpp-title">MapPin — Variantes por condicion climatica</div>

        <div className="mpp-grid">
          {VARIANTS.map((v, i) => (
            <div key={i} className="mpp-cell">
              <PinSVG
                color={CONDITION_COLORS[v.condition]}
                selected={v.selected}
                badges={v.badges}
              />
              <div className="mpp-label">
                <span
                  className="mpp-color-swatch"
                  style={{ background: CONDITION_COLORS[v.condition] }}
                />
                {v.label}
              </div>
            </div>
          ))}
        </div>

        <hr className="mpp-divider" />

        <div className="mpp-badges-note">
          <strong>Badges:</strong>&nbsp;
          {Object.entries(BADGE_ICONS).map(([key, icon]) => (
            <span key={key} style={{ marginRight: 12 }}>
              {icon} {key}
            </span>
          ))}
          <br />
          Se muestran hasta 3 badges por pin. Controlado por <code>showBadgesOnPins</code> en store.
        </div>
      </div>
    </>
  )
}
