import { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function Brand() {
  const resetToHome = useStore((s) => s.resetToHome)
  const [spinning, setSpinning] = useState(false)

  const handleClick = () => {
    resetToHome()
    setSpinning(true)
    setTimeout(() => setSpinning(false), 600)
  }

  return (
    <>
      <style>{`
        .br-root {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          background: none;
          border: none;
          padding: 4px;
          margin: -4px;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 150ms ease;
        }

        .br-root:hover { opacity: 0.85; }
        .br-root:active { opacity: 0.65; }

        .br-ball {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          animation: pokeBallSpin 8s linear infinite;
          animation-play-state: paused;
        }

        .br-root:hover .br-ball { animation-play-state: running; }

        .br-ball.spinning {
          animation-play-state: running;
          animation-duration: 0.6s;
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

      <button className="br-root" onClick={handleClick} title="Inicio" type="button">
        <svg
          className={`br-ball${spinning ? ' spinning' : ''}`}
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M2.5 17 A14.5 14.5 0 0 1 31.5 17 Z" fill="var(--ui-error)" />
          <path d="M2.5 17 A14.5 14.5 0 0 0 31.5 17 Z" fill="var(--bg-tertiary)" />
          <circle cx="17" cy="17" r="14.5" stroke="var(--border-default)" strokeWidth="1.5" fill="none" />
          <line x1="2.5" y1="17" x2="31.5" y2="17" stroke="var(--border-default)" strokeWidth="1.5" />
          <circle cx="17" cy="17" r="5" fill="var(--bg-secondary)" stroke="var(--border-default)" strokeWidth="1.5" />
          <circle cx="17" cy="17" r="2.5" fill="var(--text-muted)" />
        </svg>
        <div className="br-text">
          <span className="br-name">PokéWeather</span>
          <span className="br-sub">Map Tracker</span>
        </div>
      </button>
    </>
  )
}
