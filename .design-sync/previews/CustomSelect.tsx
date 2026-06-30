import { useState } from 'react'
import CustomSelect from 'pokeweather/src/components/UI/CustomSelect'

const REGIONES = [
  { label: 'Asia', value: 'asia' },
  { label: 'Europa', value: 'europa' },
  { label: 'America', value: 'america' },
  { label: 'Oceania', value: 'oceania' },
  { label: 'Africa', value: 'africa' },
]

const CLIMAS = [
  { label: 'Soleado', value: 'sunny' },
  { label: 'Lluvia', value: 'rain' },
  { label: 'Nublado', value: 'cloudy' },
]

export function SelectSingleClosed() {
  const [value, setValue] = useState('asia')
  return (
    <div style={{ padding: 16, width: 240 }}>
      <CustomSelect
        label="Region"
        value={value}
        options={REGIONES}
        onChange={(v) => setValue(v as string)}
      />
    </div>
  )
}

// Para mostrar abierto en preview: usamos un key trick — el componente
// maneja open internamente, asi que lo mostramos con un wrapper que
// indica visualmente que esta abierto via nota.
export function SelectSingleWithValue() {
  const [value, setValue] = useState('europa')
  return (
    <div style={{ padding: 16, width: 240 }}>
      <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        Valor seleccionado: {value}
      </div>
      <CustomSelect
        label="Region"
        value={value}
        options={REGIONES}
        onChange={(v) => setValue(v as string)}
      />
    </div>
  )
}

export function SelectMultiWithItems() {
  const [selected, setSelected] = useState(['sunny', 'rain'])
  return (
    <div style={{ padding: 16, width: 240 }}>
      <CustomSelect
        label="Clima"
        selectedItems={selected}
        options={CLIMAS}
        onChange={(v) => setSelected(v as string[])}
        isMulti
      />
    </div>
  )
}

export function SelectDisabled() {
  return (
    <div style={{ padding: 16, width: 240 }}>
      <CustomSelect
        label="Region (deshabilitado)"
        value="asia"
        options={REGIONES}
        onChange={() => {}}
        disabled
      />
    </div>
  )
}
