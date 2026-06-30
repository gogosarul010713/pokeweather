import ThemeToggle from 'pokeweather'
import { useStore } from '../../src/store/useStore'
import { useEffect } from 'react'

function SeedDark({ children }: { children: React.ReactNode }) {
  useStore.setState({ theme: 'dark' })
  return <>{children}</>
}

function SeedLight({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useStore.setState({ theme: 'light' })
    document.documentElement.classList.add('light')
    return () => {
      document.documentElement.classList.remove('light')
    }
  }, [])
  return <>{children}</>
}

export function ThemeToggleDark() {
  return (
    <SeedDark>
      <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
        <ThemeToggle />
      </div>
    </SeedDark>
  )
}

export function ThemeToggleLight() {
  return (
    <SeedLight>
      <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
        <ThemeToggle />
      </div>
    </SeedLight>
  )
}
