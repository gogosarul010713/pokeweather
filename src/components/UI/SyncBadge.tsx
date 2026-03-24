import { useEffect, useState } from 'react'
import { useStore } from '../../data/useStore'

export default function SyncBadge() {
  const status = useStore((s) => s.loadingStatus)
  const lastUpdated = useStore((s) => s.lastUpdated)
  const [timeago, setTimeago] = useState<string>('')

  useEffect(() => {
    if (!lastUpdated) {
      setTimeago('')
      return
    }

    const updateTimeago = () => {
      const minutes = Math.floor((Date.now() - lastUpdated) / 1000 / 60)
      if (minutes === 0) {
        setTimeago('Ahora')
      } else if (minutes === 1) {
        setTimeago('Hace 1 min')
      } else {
        setTimeago(`Hace ${minutes} min`)
      }
    }

    updateTimeago()
    const interval = setInterval(updateTimeago, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [lastUpdated])

  if (status === 'loading') {
    return (
      <>
        <style>{`
          .ui-sync {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 28px;
            padding: 0 10px;
            border-radius: 14px;
            border: 1px solid var(--ui-warning);
            background: rgba(var(--ui-warning-rgb), 0.10);
            font-family: 'Exo 2', sans-serif;
            font-size: 11px;
            font-weight: 500;
            color: var(--ui-warning);
            white-space: nowrap;
            flex-shrink: 0;
          }
          .ui-sync-spinner {
            width: 10px;
            height: 10px;
            border: 1.5px solid rgba(var(--ui-warning-rgb), 0.3);
            border-top-color: var(--ui-warning);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            flex-shrink: 0;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="ui-sync">
          <span className="ui-sync-spinner" />
          <span>Sincronizando...</span>
        </div>
      </>
    )
  }

  if (status === 'error') {
    return (
      <>
        <style>{`
          .ui-sync-error {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            height: 28px;
            padding: 0 10px;
            border-radius: 14px;
            border: 1px solid var(--ui-error);
            background: rgba(var(--ui-error-rgb), 0.10);
            font-family: 'Exo 2', sans-serif;
            font-size: 11px;
            font-weight: 500;
            color: var(--ui-error);
            white-space: nowrap;
            cursor: pointer;
            flex-shrink: 0;
            transition: background 0.15s;
          }
          .ui-sync-error:hover {
            background: rgba(var(--ui-error-rgb), 0.18);
          }
        `}</style>
        <div className="ui-sync-error" title="Reintentar">
          ✕ Error · Reintentar
        </div>
      </>
    )
  }

  // ready
  return (
    <>
      <style>{`
        .ui-sync-ok {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 10px;
          border-radius: 14px;
          border: 1px solid var(--ui-success);
          background: rgba(var(--ui-success-rgb), 0.10);
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: var(--ui-success);
          white-space: nowrap;
          flex-shrink: 0;
        }
      `}</style>
      <div className="ui-sync-ok">
        ✓ {timeago || 'Actualizado'}
      </div>
    </>
  )
}
