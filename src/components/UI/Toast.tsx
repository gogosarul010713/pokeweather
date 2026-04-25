import { useState, useEffect } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onDismiss?: () => void
  type?: 'info' | 'success' | 'error' | 'warning'
}

function Toast({ message, duration = 3000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  if (!isVisible) return null

  return (
    <>
      <style>{`
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 2000;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .toast p {
          margin: 0;
          font-size: 14px;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .toast button {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          font-size: 16px;
          line-height: 1;
          transition: color 0.12s;
          flex-shrink: 0;
        }

        .toast button:hover {
          color: var(--text-primary);
        }
      `}</style>

      <div className="toast">
        <p>{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          type="button"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </>
  )
}

export default Toast
export { Toast }
