import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../store/useStore'
import { Z } from '../../config/zIndex'

interface HomeModalProps {
  onClose: () => void
}

type GpsState = 'idle' | 'loading' | 'error' | 'approximate'

const HomeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const GpsIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
)

export default function HomeModal({ onClose }: HomeModalProps) {
  const setHomeLocation = useStore((s) => s.setHomeLocation)
  const clearHomeLocation = useStore((s) => s.clearHomeLocation)
  const homeLocation = useStore((s) => s.homeLocation)

  const [gpsState, setGpsState] = useState<GpsState>('idle')
  const [gpsError, setGpsError] = useState('')
  // FIX 2: precarga coords actuales si ya hay una zona fijada
  const [coordsInput, setCoordsInput] = useState(
    homeLocation ? `${homeLocation.lat}, ${homeLocation.lon}` : ''
  )
  const [coordsError, setCoordsError] = useState('')
  const [gpsDisabled, setGpsDisabled] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  // FIX 1: flag de montaje para cancelar callback GPS si el modal se cerro
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Verificar si GPS ya fue denegado previamente
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') setGpsDisabled(true)
      }).catch(() => {})
    }
  }, [])

  // FIX 3: Escape cierra el modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  function handleGps() {
    setGpsState('loading')
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mountedRef.current) return // modal cerrado durante la espera
        const { latitude, longitude, accuracy } = pos.coords
        setHomeLocation({ lat: latitude, lon: longitude })
        if (accuracy > 5000) {
          setGpsState('approximate')
        } else {
          onClose()
        }
      },
      (err) => {
        if (!mountedRef.current) return
        setGpsState('error')
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Permiso denegado. Usa coordenadas manuales.')
          setGpsDisabled(true)
        } else if (err.code === err.TIMEOUT) {
          setGpsError('Tiempo agotado. Intenta de nuevo.')
        } else {
          setGpsError('No se pudo obtener la ubicacion.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  function handleCoordsConfirm() {
    setCoordsError('')
    const parts = coordsInput.split(',').map((s) => s.trim())
    if (parts.length !== 2) { setCoordsError('Formato: lat, lon'); return }
    const lat = parseFloat(parts[0])
    const lon = parseFloat(parts[1])
    if (isNaN(lat) || isNaN(lon)) { setCoordsError('Numeros invalidos'); return }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) { setCoordsError('Coordenadas fuera de rango'); return }
    setHomeLocation({ lat, lon })
    onClose()
  }

  function handleClear() {
    clearHomeLocation()
    onClose()
  }

  return (
    <>
      <style>{`
        .hm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: ${Z.modal};
        }
        .hm-modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: 14px;
          padding: 20px;
          width: 260px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }
        .hm-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--home);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Exo 2', sans-serif;
        }
        .hm-gps-btn {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--home-glow);
          background: var(--home-dim);
          color: var(--home);
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.15s;
        }
        .hm-gps-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .hm-spin {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--ui-accent);
          margin-top: 8px;
          font-family: 'Exo 2', sans-serif;
        }
        .hm-spinner {
          width: 11px;
          height: 11px;
          border: 2px solid rgba(88,166,255,0.2);
          border-top-color: var(--ui-accent);
          border-radius: 50%;
          animation: hm-spin .8s linear infinite;
          flex-shrink: 0;
        }
        @keyframes hm-spin { to { transform: rotate(360deg); } }
        .hm-error {
          font-size: 11px;
          color: var(--ui-error);
          margin-top: 7px;
          font-family: 'Exo 2', sans-serif;
        }
        .hm-approx {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 7px;
          font-family: 'Exo 2', sans-serif;
        }
        .hm-divider {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 11px;
          letter-spacing: .05em;
          margin: 12px 0;
          font-family: 'Exo 2', sans-serif;
        }
        .hm-divider::before, .hm-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-default);
        }
        .hm-input {
          width: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 7px;
          padding: 8px 10px;
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          color: var(--text-primary);
          outline: none;
          box-sizing: border-box;
        }
        .hm-input::placeholder { color: var(--text-muted, var(--text-secondary)); }
        .hm-input:focus { border-color: var(--home); }
        .hm-coords-error {
          font-size: 11px;
          color: var(--ui-error);
          margin-top: 5px;
          font-family: 'Exo 2', sans-serif;
        }
        .hm-confirm {
          width: 100%;
          margin-top: 8px;
          padding: 9px 12px;
          border-radius: 7px;
          border: none;
          background: var(--home);
          color: #fff;
          font-family: 'Exo 2', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .hm-confirm:hover { opacity: 0.88; }
        .hm-clear {
          width: 100%;
          margin-top: 6px;
          padding: 7px 12px;
          border-radius: 7px;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          font-family: 'Exo 2', sans-serif;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .hm-clear:hover { background: var(--bg-tertiary); }
      `}</style>

      {createPortal(
        <div className="hm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
          <div className="hm-modal">
            <div className="hm-title"><HomeIcon /> Fijar mi zona</div>

            <button
              className="hm-gps-btn"
              onClick={handleGps}
              disabled={gpsDisabled || gpsState === 'loading'}
              type="button"
            >
              <GpsIcon />
              Usar GPS
            </button>

            {gpsState === 'loading' && (
              <div className="hm-spin"><div className="hm-spinner" />Detectando...</div>
            )}
            {gpsState === 'error' && (
              <div className="hm-error">{gpsError}</div>
            )}
            {gpsState === 'approximate' && (
              <div className="hm-approx">Ubicacion aproximada (precision baja). Puedes confirmar o ingresar coords.</div>
            )}

            <div className="hm-divider">o ingresa</div>

            <input
              className="hm-input"
              placeholder="lat, lon — ej: 19.4326, -99.1332"
              value={coordsInput}
              onChange={(e) => { setCoordsInput(e.target.value); setCoordsError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleCoordsConfirm()}
            />
            {coordsError && <div className="hm-coords-error">{coordsError}</div>}

            <button className="hm-confirm" onClick={handleCoordsConfirm} type="button">
              Fijar ubicacion
            </button>

            {homeLocation && (
              <button className="hm-clear" onClick={handleClear} type="button">
                Quitar mi zona
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
