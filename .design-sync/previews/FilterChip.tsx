import { useState } from 'react'
import { FilterChip } from 'pokeweather'

export function Inactive() {
  return <FilterChip label="Lluvia" active={false} onClick={() => {}} />
}

export function Active() {
  return <FilterChip label="Soleado" active={true} onClick={() => {}} />
}

export function MultipleChips() {
  const [active, setActive] = useState<string[]>(['soleado'])
  const chips = ['Soleado', 'Lluvia', 'Nublado', 'Nieve', 'Viento', 'Niebla']
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 12 }}>
      {chips.map((c) => (
        <FilterChip
          key={c}
          label={c}
          active={active.includes(c.toLowerCase())}
          onClick={() =>
            setActive((prev) =>
              prev.includes(c.toLowerCase())
                ? prev.filter((x) => x !== c.toLowerCase())
                : [...prev, c.toLowerCase()]
            )
          }
        />
      ))}
    </div>
  )
}
