/**
 * Preview: PrecisionMetrics
 * Fuente: src/components/TestingTools/PrecisionMetrics.tsx
 *
 * Panel de metricas de precision. Intenta cargar desde Firestore (fuente por defecto).
 * En preview: Firebase fallara por credenciales invalidas -> mostrara estado de error.
 * Eso es un estado UI valido y correcto para el preview.
 */

import PrecisionMetrics from 'pokeweather'

export function PrecisionMetrics() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: 400,
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        overflow: 'hidden',
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
        PrecisionMetrics -- Firestore fallara en preview (sin credenciales). Estado error es valido.
      </div>
      <PrecisionMetrics retentionDays={7} />
    </div>
  )
}
