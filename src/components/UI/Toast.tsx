import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'info' | 'error' | 'success'  // default: 'info'
  duration?: number  // ms, default: 3000
  onClose?: () => void
}

/**
 * Toast component — notificación discreta que desaparece automáticamente.
 * Se posiciona fija en la parte superior del screen.
 *
 * @example
 * <Toast message="Actualizando clima..." type="info" duration={5000} />
 */
export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (!duration || duration <= 0) return

    const timer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>

      <style>{`
        .toast {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
          z-index: 1000;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          animation: slideDown 150ms ease-out;
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: 90vw;
        }

        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .toast-info {
          border-color: var(--ui-accent);
          background: var(--bg-secondary);
        }

        .toast-success {
          border-color: var(--ui-success);
          background: var(--bg-secondary);
        }

        .toast-error {
          border-color: var(--ui-error);
          background: var(--bg-secondary);
        }
      `}</style>
    </div>
  )
}
