import TestingButton from 'pokeweather'
import { useState } from 'react'

export function TestingButtonClosed() {
  return (
    <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
      <TestingButton onClick={() => {}} />
    </div>
  )
}

export function TestingButtonInteractive() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
      <TestingButton onClick={() => setOpen((v) => !v)} />
      {open && (
        <div
          style={{
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            fontSize: 12,
          }}
        >
          Panel de testing abierto
        </div>
      )}
    </div>
  )
}
