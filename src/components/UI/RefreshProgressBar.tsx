import { useStore } from '../../store/useStore'

/**
 * RefreshProgressBar — Barra de progreso visible en top durante auto-refresh.
 * Muestra contador de ciudades actualizadas (X/94).
 * Solo visible cuando loadingStatus === 'loading' durante auto-refresh.
 */
export default function RefreshProgressBar() {
  const loadingStatus = useStore((s) => s.loadingStatus)
  const loadingProgress = useStore((s) => s.loadingProgress)

  // Solo visible si está cargando
  if (loadingStatus !== 'loading') {
    return null
  }

  const { current, total } = loadingProgress
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <>
      <style>{`
        .refresh-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--ui-warning), var(--ui-accent));
          z-index: 999;
          animation: slideDown 250ms ease-out;
        }

        .refresh-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FFA500, #1F77E3);
          width: ${percentage}%;
          transition: width 300ms ease-out;
          box-shadow: 0 0 8px rgba(255, 165, 0, 0.6);
        }

        .refresh-progress-text {
          position: fixed;
          top: 8px;
          right: 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          z-index: 1000;
          animation: fadeInDown 250ms ease-out;
          font-family: 'Exo 2', sans-serif;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="refresh-progress-bar">
        <div className="refresh-progress-fill" />
      </div>

      <div className="refresh-progress-text">
        🌍 {current}/{total}
      </div>
    </>
  )
}
