// s2Service.ts
// US-206: Genera la S2 cell key (nivel 10) para una coordenada lat/lon.
// Usado en Sprint 6 (AccuWeather) para cachear datos por celda S2.
// Nivel 10 es el especificado por Pokémon GO (200 km² por celda).

// @ts-ignore — s2-geometry no tiene tipos TS
import S2lib from 's2-geometry'

const S2 = S2lib?.S2 ?? S2lib

const S2_LEVEL = 10

/**
 * Retorna el S2 cell ID (string) para la coordenada dada al nivel 10.
 * Ciudades dentro de la misma celda comparten locationKey en AccuWeather.
 */
export function getS2Key(lat: number, lon: number): string {
  try {
    const key = S2.latLngToKey(lat, lon, S2_LEVEL)
    return S2.keyToId(key).toString()
  } catch {
    // Fallback si la lib no carga correctamente
    return `${lat.toFixed(4)},${lon.toFixed(4)}`
  }
}

/**
 * Retorna el S2 cell token (string corto) — alternativa más legible.
 */
export function getS2Token(lat: number, lon: number): string {
  try {
    const key = S2.latLngToKey(lat, lon, S2_LEVEL)
    return key
  } catch {
    return `${lat.toFixed(4)},${lon.toFixed(4)}`
  }
}
