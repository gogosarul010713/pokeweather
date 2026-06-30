import { useState } from 'react'
import { Toast } from 'pokeweather'

export function Info() {
  return <Toast message="Datos actualizados correctamente" duration={999999} />
}

export function Success() {
  return <Toast message="Ciudad agregada a favoritos ❤️" duration={999999} />
}

export function Warning() {
  return <Toast message="Conexion lenta — usando datos en cache" duration={999999} />
}

export function WithDismiss() {
  const [visible, setVisible] = useState(true)
  if (!visible)
    return (
      <button
        style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer' }}
        onClick={() => setVisible(true)}
      >
        Mostrar toast
      </button>
    )
  return <Toast message="Haz clic en X para cerrar" duration={999999} onDismiss={() => setVisible(false)} />
}
