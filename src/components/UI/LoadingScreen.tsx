// Pantalla de carga fullscreen mientras loadingStatus === 'loading'.
// Fade-out 0.4s al pasar a 'ready'.
// Reutilizable para: initial load (primer arranque) y refresh (auto-refresh cada hora)

import { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore'

type LoadingMode = 'initial' | 'refresh'

interface LoadingScreenProps {
  mode?: LoadingMode  // 'initial' (default) o 'refresh' (auto-refresh)
}

export default function LoadingScreen({ mode = 'initial' }: LoadingScreenProps) {
  const loadingStatus   = useStore((s) => s.loadingStatus)
  const loadingProgress = useStore((s) => s.loadingProgress)
  const [visible, setVisible] = useState(true)

  // Cuando loadingStatus cambia: mostrar si está 'loading', ocultar si está 'ready'
  useEffect(() => {
    if (loadingStatus === 'loading') {
      // Mostrar LoadingScreen
      setVisible(true)
    } else if (loadingStatus === 'ready') {
      // Fade-out 400ms antes de ocultar
      const t = setTimeout(() => setVisible(false), 400)
      return () => clearTimeout(t)
    }
  }, [loadingStatus])

  if (!visible) return null

  const { cityName, current, total, percent } = loadingProgress
  const isReady = loadingStatus === 'ready'

  return (
    <>
      <style>{`
        .ls-overlay {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          transition: opacity 0.4s ease;
        }

        .ls-overlay.ls-fading {
          opacity: 0;
          pointer-events: none;
        }

        /* PokéBall */
        .ls-ball {
          width: 72px;
          height: 72px;
          animation: pokeBallSpin 1.2s linear infinite;
        }

        /* Textos */
        .ls-city {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          font-size: 22px;
          color: var(--text-primary);
          text-align: center;
          min-height: 28px;
        }

        .ls-counter {
          font-family: 'Exo 2', sans-serif;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: -16px;
        }

        /* Barra de progreso */
        .ls-bar-track {
          width: 280px;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .ls-bar-fill {
          height: 100%;
          background: var(--ui-accent);
          border-radius: 2px;
          transition: width 0.15s ease;
        }

        .ls-percent {
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: -16px;
        }
      `}</style>

      <div className={`ls-overlay${isReady ? ' ls-fading' : ''}`}>
        {/* PokéBall animada */}
        <svg
          className="ls-ball"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 36 A31 31 0 0 1 67 36 Z" fill="var(--ui-error)" />
          <path d="M5 36 A31 31 0 0 0 67 36 Z" fill="var(--bg-tertiary)" />
          <circle cx="36" cy="36" r="31" stroke="var(--border-default)" strokeWidth="2" fill="none" />
          <line x1="5" y1="36" x2="67" y2="36" stroke="var(--border-default)" strokeWidth="2" />
          <circle cx="36" cy="36" r="10" fill="var(--bg-secondary)" stroke="var(--border-default)" strokeWidth="2" />
          <circle cx="36" cy="36" r="5" fill="var(--text-muted)" />
        </svg>

        {/* Nombre de la ciudad o mensaje contextual */}
        <div className="ls-city">
          {mode === 'refresh' ? (
            <>Actualizando ciudades</>
          ) : cityName ? (
            `Cargando ${cityName}...`
          ) : (
            'Iniciando...'
          )}
        </div>

        {/* Subtítulo contextual */}
        {mode === 'refresh' && (
          <div className="ls-counter" style={{ marginTop: '-8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Sincronización automática por cambio de hora
          </div>
        )}

        {/* Contador */}
        {total > 0 && (
          <div className="ls-counter">
            {mode === 'refresh' ? `Actualizando ${current}/${total}` : `ciudad ${current} de ${total}`}
          </div>
        )}

        {/* Barra de progreso */}
        <div className="ls-bar-track">
          <div className="ls-bar-fill" style={{ width: `${percent}%` }} />
        </div>

        {/* Porcentaje */}
        <div className="ls-percent">{percent}%</div>
      </div>
    </>
  )
}
