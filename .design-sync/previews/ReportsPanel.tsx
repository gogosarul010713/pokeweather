/**
 * Preview: ReportsPanel
 * Fuente: src/components/TestingTools/ReportsPanel.tsx
 *
 * Panel de reportes de clasificacion. Llama a getRecentClassificationReports (Firebase).
 * En preview: Firebase fallara sin credenciales -> mostrara "Cargando reportes..."
 * seguido de estado de error. Ambos son estados UI validos para el preview.
 */

import ReportsPanel from 'pokeweather'

export function ReportsPanel() {
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
        ReportsPanel -- Firebase fallara en preview. Mostrara loading/error (estado valido).
      </div>
      <div style={{ padding: 16 }}>
        <ReportsPanel />
      </div>
    </div>
  )
}
