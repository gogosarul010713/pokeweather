/**
 * Mapeo de condiciones climáticas a emojis
 * Se usa en la tabla de historial para mostrar visualmente la condición
 */

export const CONDITION_EMOJIS = {
  sunny: '☀️',
  partly: '🌤️',
  cloudy: '☁️',
  fog: '🌫️',
  rain: '🌧️',
  snow: '❄️',
  windy: '💨',
} as const

export const CONDITIONS = Object.keys(CONDITION_EMOJIS) as Array<keyof typeof CONDITION_EMOJIS>

export const CONDITION_NAMES: Record<keyof typeof CONDITION_EMOJIS, string> = {
  sunny: 'Soleado',
  partly: 'Parcialmente nublado',
  cloudy: 'Nublado',
  fog: 'Niebla',
  rain: 'Lluvia',
  snow: 'Nieve',
  windy: 'Ventoso',
}
