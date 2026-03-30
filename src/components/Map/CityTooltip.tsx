// CityTooltip.tsx — Popup 3 líneas
// [emoji clima] Nombre, País | Condición
// Tipos Potenciados [tipo1 tipo2 tipo3]
// Coordenadas [Copiar coords]
// [Ver detalle →]

import { useState } from 'react'
import { useStore } from '../../store/useStore'
import type { City } from '../../store/useStore'
import { CONDITION_LABEL } from '../../services/weather/weatherService'
import { TYPE_ICON } from '../../config/typeIcons'

interface CityTooltipProps {
  city: City
}

export default function CityTooltip({ city }: CityTooltipProps) {
  const setSidebarMode = useStore((s) => s.setSidebarMode)
  const setSelectedCity = useStore((s) => s.setSelectedCity)
  const [copied, setCopied] = useState(false)

  const conditionLabel = CONDITION_LABEL[city.condition]

  const handleCopyCoords = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerDetalle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCity(city)
    setSidebarMode('detail')
  }

  return (
    <div style={{ fontFamily: "'Exo 2', sans-serif", minWidth: '240px', padding: '10px 12px' }}>

      {/* ── Línea 1: [emoji] Nombre, País | Condición ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        marginBottom: '8px', fontSize: '13px', fontWeight: '600',
      }}>
        <img
          src={`/weather/${city.condition}.png`}
          alt={city.condition}
          style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <span style={{ color: 'var(--text-primary)' }}>
          {city.name}, {city.country}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
          {conditionLabel}
        </span>
      </div>

      {/* ── Línea 2: Tipos Potenciados ── */}
      {city.boostedTypes.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '8px', fontSize: '11px',
          color: 'var(--text-secondary)',
        }}>
          <span>Tipos</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            {city.boostedTypes.slice(0, 3).map((type) => {
              const src = TYPE_ICON[type.toLowerCase()]
              if (!src) return null
              return (
                <img
                  key={type}
                  src={src}
                  alt={type}
                  title={type}
                  style={{ width: 18, height: 18, objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* ── Línea 3: Coordenadas ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        marginBottom: '8px', fontSize: '11px',
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          {city.lat.toFixed(4)}, {city.lon.toFixed(4)}
        </span>
        <button
          onClick={handleCopyCoords}
          type="button"
          title={copied ? 'Copiado' : 'Copiar coordenadas'}
          style={{
            padding: '2px 4px', borderRadius: '3px',
            border: `1px solid var(--border-default)`,
            background: copied ? 'rgba(88,166,255,0.1)' : 'transparent',
            color: copied ? 'var(--ui-accent)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '9px', fontWeight: '600',
            transition: 'all 150ms ease',
          }}
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>

      {/* ── Botón Ver detalle ── */}
      <div style={{ display: 'flex', marginTop: '4px' }}>
        <button
          onClick={handleVerDetalle}
          type="button"
          style={{
            width: '100%', padding: '6px', borderRadius: '4px',
            border: `1px solid var(--border-default)`,
            background: 'transparent', color: 'var(--ui-accent)',
            cursor: 'pointer', fontSize: '11px', fontWeight: '600',
            transition: 'all 150ms ease',
          }}
        >
          Ver detalle →
        </button>
      </div>
    </div>
  )
}
