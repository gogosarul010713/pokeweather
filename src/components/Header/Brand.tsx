export default function Brand() {
  return (
    <>
      <style>{`
        .br-root {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          text-decoration: none;
        }

        .br-ball {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          animation: pokeBallSpin 8s linear infinite;
          animation-play-state: paused;
        }

        .br-root:hover .br-ball {
          animation-play-state: running;
        }

        .br-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .br-name {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: var(--text-primary);
          letter-spacing: 0.01em;
        }

        .br-sub {
          font-family: 'Exo 2', sans-serif;
          font-weight: 400;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 1px;
        }
      `}</style>

      <div className="br-root">
        {/* PokéBall SVG 34px */}
        <svg
          className="br-ball"
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Top half — rojo */}
          <path
            d="M2.5 17 A14.5 14.5 0 0 1 31.5 17 Z"
            fill="var(--ui-error)"
          />
          {/* Bottom half — blanco/gris */}
          <path
            d="M2.5 17 A14.5 14.5 0 0 0 31.5 17 Z"
            fill="var(--bg-tertiary)"
          />
          {/* Outer circle */}
          <circle cx="17" cy="17" r="14.5" stroke="var(--border-default)" strokeWidth="1.5" fill="none" />
          {/* Banda central */}
          <line x1="2.5" y1="17" x2="31.5" y2="17" stroke="var(--border-default)" strokeWidth="1.5" />
          {/* Botón centro — aro exterior */}
          <circle cx="17" cy="17" r="5" fill="var(--bg-secondary)" stroke="var(--border-default)" strokeWidth="1.5" />
          {/* Botón centro — punto interior */}
          <circle cx="17" cy="17" r="2.5" fill="var(--text-muted)" />
        </svg>

        <div className="br-text">
          <span className="br-name">PokéWeather</span>
          <span className="br-sub">Map Tracker</span>
        </div>
      </div>
    </>
  )
}
