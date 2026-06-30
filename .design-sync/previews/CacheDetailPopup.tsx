/**
 * Preview: CacheDetailPopup
 * Fuente: src/components/TestingTools/CacheDetailPopup.tsx
 *
 * Muestra el popup de detalle de cache con datos mock abierto por defecto.
 * Mock: entrada de tipo 'weather' con JSON de pronostico y metadatos.
 */

import { useState } from 'react'
import CacheDetailPopup from 'pokeweather'

const MOCK_WEATHER_VALUE = {
  cityId: 'city-paris',
  cityName: 'Paris',
  forecast: [
    { hour: '06:00', condition: 'cloudy', temp: 14 },
    { hour: '09:00', condition: 'sunny', temp: 17 },
    { hour: '12:00', condition: 'sunny', temp: 21 },
    { hour: '15:00', condition: 'windy', temp: 19 },
    { hour: '18:00', condition: 'rainy', temp: 15 },
  ],
  capturedAt: Date.now() - 45 * 60 * 1000,
}

const MOCK_ENTRY = {
  id: 'weather-city-paris',
  key: 'weather:city-paris:2026-06-29',
  type: 'weather' as const,
  value: MOCK_WEATHER_VALUE,
  savedAt: Date.now() - 45 * 60 * 1000,
  expiresAt: Date.now() + 3 * 3600 * 1000,
  size: JSON.stringify(MOCK_WEATHER_VALUE).length,
}

export function CacheDetailPopup() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      style={{
        width: '100%',
        minHeight: 400,
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        position: 'relative',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
        Inspector de entrada de cache — weather:city-paris:2026-06-29
      </p>

      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 16px',
          background: '#1F77E3',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Abrir CacheDetailPopup
      </button>

      <CacheDetailPopup
        entry={MOCK_ENTRY as any}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}
