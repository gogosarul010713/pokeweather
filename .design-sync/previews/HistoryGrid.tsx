/**
 * Preview: HistoryGrid
 * Fuente: src/components/TestingTools/HistoryGrid.tsx
 *
 * Grid de historial de snapshots. Llama a getSnapshots (IndexedDB) en useEffect.
 * En preview: mostrara loading luego estado vacio o los datos reales del browser.
 * Se proveen cities mock para que el componente no crashee con array vacio.
 */

import { useState } from 'react'
import HistoryGrid from 'pokeweather'

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
]

export function HistoryGrid() {
  const [retentionDays, setRetentionDays] = useState<7 | 14 | 30>(7)

  return (
    <div
      style={{
        width: '100%',
        minHeight: 400,
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          fontSize: 11,
          color: 'var(--text-secondary)',
        }}
      >
        HistoryGrid -- carga snapshots desde IndexedDB (mostrara vacio si no hay datos)
      </div>
      <div
        style={{
          flex: 1,
          padding: 16,
          minHeight: 0,
        }}
      >
        <HistoryGrid
          cities={MOCK_CITIES as any}
          retentionDays={retentionDays}
          onRetentionChange={setRetentionDays}
        />
      </div>
    </div>
  )
}
