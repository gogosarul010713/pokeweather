/**
 * Preview: BottomSheetPortal
 * Fuente: src/components/BottomSheet/BottomSheetPortal.tsx
 *
 * BottomSheetPortal necesita que exista un div#bottom-sheet-root en el DOM.
 * Lo creamos dinamicamente en el preview para que el portal tenga destino.
 */

import { useEffect, useRef } from 'react'
import { BottomSheetPortal } from 'pokeweather'

const MOCK_CITIES = [
  { name: 'Tokyo', country: 'JP', region: 'asia' },
  { name: 'Paris', country: 'FR', region: 'europa' },
  { name: 'Buenos Aires', country: 'AR', region: 'america' },
  { name: 'Sydney', country: 'AU', region: 'oceania' },
]

export function BottomSheetPortal() {
  const portalRootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Crear el div#bottom-sheet-root que requiere el portal
    let el = document.getElementById('bottom-sheet-root')
    if (!el) {
      el = document.createElement('div')
      el.id = 'bottom-sheet-root'
      document.body.appendChild(el)
      portalRootRef.current = el as HTMLDivElement
    }

    return () => {
      // Limpiar solo si lo creamos nosotros
      if (portalRootRef.current && document.body.contains(portalRootRef.current)) {
        document.body.removeChild(portalRootRef.current)
      }
    }
  }, [])

  return (
    <div
      style={{
        width: '100%',
        minHeight: 400,
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
      }}
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
        El BottomSheetPortal renderiza via <code>createPortal</code> hacia
        <code>#bottom-sheet-root</code>. La hoja aparece abajo de la pantalla.
      </p>

      <BottomSheetPortal>
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Ciudades ({MOCK_CITIES.length})
          </p>
          {MOCK_CITIES.map((city) => (
            <div
              key={city.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 6,
                fontSize: 13,
                color: 'var(--text-primary)',
              }}
            >
              <span>
                {city.name}, {city.country}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                {city.region}
              </span>
            </div>
          ))}
        </div>
      </BottomSheetPortal>
    </div>
  )
}
