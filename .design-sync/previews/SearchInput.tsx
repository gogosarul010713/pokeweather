import SearchInput from 'pokeweather'
import { useStore } from '../../src/store/useStore'
import { useEffect } from 'react'

function SeedEmpty({ children }: { children: React.ReactNode }) {
  useStore.setState({ searchQuery: '' })
  return <>{children}</>
}

function SeedWithText({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useStore.setState({ searchQuery: 'Tokyo' })
  }, [])
  return <>{children}</>
}

export function SearchInputEmpty() {
  return (
    <SeedEmpty>
      <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
        <SearchInput />
      </div>
    </SeedEmpty>
  )
}

export function SearchInputWithQuery() {
  return (
    <SeedWithText>
      <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
        <SearchInput />
      </div>
    </SeedWithText>
  )
}

export function SearchInputInHeader() {
  return (
    <SeedEmpty>
      <div
        style={{
          padding: '0 16px',
          height: 56,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: 400,
        }}
      >
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Header</span>
        <SearchInput />
      </div>
    </SeedEmpty>
  )
}
