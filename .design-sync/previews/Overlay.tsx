import Overlay from 'pokeweather/src/components/UI/Overlay'

export function OverlayVisible() {
  return (
    <div style={{ position: 'relative', width: 320, height: 200, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 16, color: 'var(--text-primary)', fontSize: 14 }}>
        Contenido debajo del overlay
      </div>
      <Overlay
        isActive={true}
        message="Activa la capa de clima para ver el contenido"
      />
    </div>
  )
}

export function OverlayHidden() {
  return (
    <div style={{ position: 'relative', width: 320, height: 200, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 16, color: 'var(--text-primary)', fontSize: 14 }}>
        Contenido visible (overlay inactivo)
      </div>
      <Overlay
        isActive={false}
        message="No se muestra"
      />
    </div>
  )
}

export function OverlayCustomZIndex() {
  return (
    <div style={{ position: 'relative', width: 320, height: 200, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 16, color: 'var(--text-primary)', fontSize: 14 }}>
        Overlay con zIndex personalizado (200)
      </div>
      <Overlay
        isActive={true}
        message="Capa desactivada"
        zIndex={200}
      />
    </div>
  )
}
