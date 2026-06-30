import OverlayFilterPanel from 'pokeweather/src/components/UI/OverlayFilterPanel'

export function OverlayFilterPanelActive() {
  return (
    <div style={{ position: 'relative', width: 280, height: 160, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 12 }}>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, width: '70%' }} />
      </div>
      <OverlayFilterPanel
        isActive={true}
        message="Activa la capa de nidos para usar estos filtros"
      />
    </div>
  )
}

export function OverlayFilterPanelInactive() {
  return (
    <div style={{ position: 'relative', width: 280, height: 160, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 12 }}>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, width: '70%', marginBottom: 8 }} />
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, width: '50%' }} />
      </div>
      <OverlayFilterPanel
        isActive={false}
        message="No se muestra"
      />
    </div>
  )
}
