/**
 * Preview: CachePanel
 * Fuente: src/components/TestingTools/CachePanel.tsx
 *
 * Panel de gestion de cache. Hace llamadas IndexedDB en useEffect.
 * En preview: mostrara estado de carga seguido de vacio (IndexedDB sin datos)
 * o error si la API del browser no esta disponible. Ambos son estados UI validos.
 */

import CachePanel from 'pokeweather'

export function CachePanel() {
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
        CachePanel -- cargara IndexedDB del browser (puede mostrar estado vacio)
      </div>
      <CachePanel />
    </div>
  )
}
