import SortDropdown from 'pokeweather'

export function SortDropdownIdle() {
  return (
    <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
      <SortDropdown
        sortMode=""
        sortDirection="asc"
        onSortChange={() => {}}
      />
    </div>
  )
}

export function SortDropdownByNameAsc() {
  return (
    <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
      <SortDropdown
        sortMode="name"
        sortDirection="asc"
        onSortChange={() => {}}
      />
    </div>
  )
}

export function SortDropdownByDensityDesc() {
  return (
    <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
      <SortDropdown
        sortMode="density"
        sortDirection="desc"
        onSortChange={() => {}}
      />
    </div>
  )
}

export function SortDropdownByRatingAsc() {
  return (
    <div style={{ padding: 16, background: 'var(--bg-primary)', display: 'inline-flex' }}>
      <SortDropdown
        sortMode="rating"
        sortDirection="asc"
        onSortChange={() => {}}
      />
    </div>
  )
}
