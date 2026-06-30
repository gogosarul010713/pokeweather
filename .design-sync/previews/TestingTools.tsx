/**
 * Preview: TestingTools
 * Fuente: src/components/TestingTools/TestingTools.tsx
 *
 * Componente orquestador con tabs: Historial, Cache, Metricas, Reportes.
 * Se renderiza abierto por defecto con isOpen=true.
 * Los sub-paneles con Firebase/IndexedDB mostraran sus estados de carga/error.
 *
 * Store seed minimo para que City[] no sea undefined.
 */

import { useState } from 'react'
import TestingTools from 'pokeweather'

const MOCK_CITIES = [
  {
    id: 'city-tokyo',
    name: 'Tokyo',
    country: 'JP',
    region: 'asia',
    lat: 35.6762,
    lon: 139.6503,
  },
  {
    id: 'city-paris',
    name: 'Paris',
    country: 'FR',
    region: 'europa',
    lat: 48.8566,
    lon: 2.3522,
  },
  {
    id: 'city-buenos-aires',
    name: 'Buenos Aires',
    country: 'AR',
    region: 'america',
    lat: -34.6037,
    lon: -58.3816,
  },
  {
    id: 'city-sydney',
    name: 'Sydney',
    country: 'AU',
    region: 'oceania',
    lat: -33.8688,
    lon: 151.2093,
  },
]

export function TestingTools() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      style={{
        width: '100%',
        height: 600,
        background: 'var(--bg-secondary)',
        overflow: 'auto',
        position: 'relative',
        borderRadius: 8,
      }}
    >
      {/* Fondo de app simulado */}
      <div
        style={{
          padding: 24,
          color: 'var(--text-secondary)',
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0 }}>
          Fondo de la app. TestingTools se renderiza como drawer lateral (position: fixed,
          right: 0).
        </p>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: '#1F77E3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Abrir Testing Tools
          </button>
        )}
      </div>

      <TestingTools
        cities={MOCK_CITIES as any}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}
