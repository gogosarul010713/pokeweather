/**
 * Preview: SnapshotPopover
 * Fuente: src/components/TestingTools/SnapshotPopover.tsx
 *
 * Muestra el modal de verificacion de snapshots con datos mock.
 * Incluye snapshots en distintos estados: verificado correcto, incorrecto, sin verificar.
 */

import { useState } from 'react'
import SnapshotPopover from 'pokeweather'

const NOW = Date.now()

const MOCK_ENTRY = {
  fecha: '29/06/2026',
  ciudad: {
    id: 'city-tokyo',
    name: 'Tokyo',
    country: 'JP',
    region: 'asia',
  },
  snapshots: [
    {
      snapshotId: 'snap-001',
      cityId: 'city-tokyo',
      condition: 'rainy',
      capturedAt: NOW - 3 * 3600 * 1000,
      actualCondition: 'rainy',
      isCorrect: true,
    },
    {
      snapshotId: 'snap-002',
      cityId: 'city-tokyo',
      condition: 'sunny',
      capturedAt: NOW - 2 * 3600 * 1000,
      actualCondition: 'cloudy',
      isCorrect: false,
    },
    {
      snapshotId: 'snap-003',
      cityId: 'city-tokyo',
      condition: 'cloudy',
      capturedAt: NOW - 1 * 3600 * 1000,
      actualCondition: null,
      isCorrect: undefined,
    },
    {
      snapshotId: 'snap-004',
      cityId: 'city-tokyo',
      condition: 'windy',
      capturedAt: NOW - 0.5 * 3600 * 1000,
      actualCondition: null,
      isCorrect: undefined,
    },
  ],
  precisionPercentage: 50,
}

export function SnapshotPopover() {
  const [open, setOpen] = useState(true)

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
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        position: 'relative',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
        Modal de verificacion de snapshots para Tokyo — 29/06/2026
      </p>

      <button
        onClick={() => setOpen(true)}
        style={{
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
        Abrir SnapshotPopover
      </button>

      {open && (
        <SnapshotPopover
          entry={MOCK_ENTRY as any}
          onClose={() => setOpen(false)}
          onUpdated={() => console.log('Updated')}
          isMaximized={false}
        />
      )}
    </div>
  )
}
