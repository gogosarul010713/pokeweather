import Brand from 'pokeweather'
import { useStore } from '../../src/store/useStore'

function Seed({ children }: { children: React.ReactNode }) {
  useStore.setState({ theme: 'dark' })
  return <>{children}</>
}

export function BrandDefault() {
  return (
    <Seed>
      <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
        <Brand />
      </div>
    </Seed>
  )
}

export function BrandOnSecondaryBg() {
  return (
    <Seed>
      <div style={{ padding: 16, background: 'var(--bg-secondary)', display: 'inline-flex' }}>
        <Brand />
      </div>
    </Seed>
  )
}

export function BrandOnHeaderBar() {
  return (
    <Seed>
      <div
        style={{
          padding: '0 16px',
          height: 56,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          width: 360,
        }}
      >
        <Brand />
      </div>
    </Seed>
  )
}
