// ════════════════════════════════════════════════════════════════════════════
// AUTOGENERADO desde src/services/weather/weatherClassify.ts
// NO EDITAR ESTE ARCHIVO. Cualquier cambio aqui sera sobrescrito.
// Para modificar el algoritmo: editar el archivo fuente y ejecutar
//   npm run sync:classify   (o cualquier build de functions).
// Decision arquitectonica: D-042 (src/docs/architecture/11-decision-log.md)
// ════════════════════════════════════════════════════════════════════════════

export type WeatherCondition = 'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy'

export interface WeatherTranslation {
  id: number
  iconText: string
  canWindy: boolean
  pgoCondition: WeatherCondition
}

export const WEATHER_TRANSLATIONS: Record<number, WeatherTranslation> = {
  // ── Día (1-32) ──
  1:  { id: 1,  iconText: 'Sunny',                     canWindy: true,  pgoCondition: 'sunny' },
  2:  { id: 2,  iconText: 'Mostly Sunny',              canWindy: true,  pgoCondition: 'sunny' },
  3:  { id: 3,  iconText: 'Partly Sunny',              canWindy: true,  pgoCondition: 'partly' },
  4:  { id: 4,  iconText: 'Intermittent Clouds',       canWindy: true,  pgoCondition: 'partly' },
  5:  { id: 5,  iconText: 'Hazy Sunshine',             canWindy: true,  pgoCondition: 'cloudy' },
  6:  { id: 6,  iconText: 'Mostly Cloudy',             canWindy: true,  pgoCondition: 'cloudy' },
  7:  { id: 7,  iconText: 'Cloudy',                    canWindy: true,  pgoCondition: 'cloudy' },
  8:  { id: 8,  iconText: 'Dreary (Overcast)',         canWindy: true,  pgoCondition: 'cloudy' },
  11: { id: 11, iconText: 'Fog',                       canWindy: false, pgoCondition: 'fog' },
  12: { id: 12, iconText: 'Showers',                   canWindy: false, pgoCondition: 'rain' },
  13: { id: 13, iconText: 'Mostly Cloudy w/ Showers',  canWindy: false, pgoCondition: 'cloudy' },
  14: { id: 14, iconText: 'Partly Sunny w/ Showers',   canWindy: false, pgoCondition: 'partly' },
  15: { id: 15, iconText: 'T-Storms',                  canWindy: false, pgoCondition: 'rain' },
  16: { id: 16, iconText: 'Mostly Cloudy w/ T-Storms', canWindy: false, pgoCondition: 'cloudy' },
  17: { id: 17, iconText: 'Partly Sunny w/ T-Storms',  canWindy: false, pgoCondition: 'partly' },
  18: { id: 18, iconText: 'Rain',                      canWindy: false, pgoCondition: 'rain' },
  19: { id: 19, iconText: 'Flurries',                  canWindy: false, pgoCondition: 'snow' },
  20: { id: 20, iconText: 'Mostly Cloudy w/ Flurries', canWindy: false, pgoCondition: 'cloudy' },
  21: { id: 21, iconText: 'Partly Sunny w/ Flurries',  canWindy: false, pgoCondition: 'partly' },
  22: { id: 22, iconText: 'Snow',                      canWindy: false, pgoCondition: 'snow' },
  23: { id: 23, iconText: 'Mostly Cloudy w/ Snow',     canWindy: false, pgoCondition: 'cloudy' },
  24: { id: 24, iconText: 'Ice',                       canWindy: false, pgoCondition: 'snow' },
  25: { id: 25, iconText: 'Sleet',                     canWindy: false, pgoCondition: 'snow' },
  26: { id: 26, iconText: 'Freezing Rain',             canWindy: false, pgoCondition: 'rain' },
  29: { id: 29, iconText: 'Rain and Snow',             canWindy: false, pgoCondition: 'rain' },
  30: { id: 30, iconText: 'Hot',                       canWindy: true,  pgoCondition: 'sunny' },
  31: { id: 31, iconText: 'Cold',                      canWindy: true,  pgoCondition: 'snow' },
  32: { id: 32, iconText: 'Windy',                     canWindy: true,  pgoCondition: 'windy' },
  // ── Noche (33-44) ──
  33: { id: 33, iconText: 'Clear',                     canWindy: true,  pgoCondition: 'sunny' },
  34: { id: 34, iconText: 'Mostly Clear',              canWindy: true,  pgoCondition: 'sunny' },
  35: { id: 35, iconText: 'Partly Cloudy',             canWindy: true,  pgoCondition: 'partly' },
  36: { id: 36, iconText: 'Intermittent Clouds',       canWindy: true,  pgoCondition: 'partly' },
  37: { id: 37, iconText: 'Hazy Moonlight',            canWindy: true,  pgoCondition: 'cloudy' },
  38: { id: 38, iconText: 'Mostly Cloudy',             canWindy: true,  pgoCondition: 'cloudy' },
  39: { id: 39, iconText: 'Partly Cloudy w/ Showers',  canWindy: false, pgoCondition: 'partly' },
  40: { id: 40, iconText: 'Mostly Cloudy w/ Showers',  canWindy: false, pgoCondition: 'cloudy' },
  41: { id: 41, iconText: 'Partly Cloudy w/ T-Storms', canWindy: false, pgoCondition: 'partly' },
  42: { id: 42, iconText: 'Mostly Cloudy w/ T-Storms', canWindy: false, pgoCondition: 'cloudy' },
  43: { id: 43, iconText: 'Mostly Cloudy w/ Flurries', canWindy: false, pgoCondition: 'snow' },
  44: { id: 44, iconText: 'Mostly Cloudy w/ Snow',     canWindy: false, pgoCondition: 'snow' },
}

// Umbrales de viento para override a Windy (Doc 20)
export const WINDY_WIND_KMH = 29
export const WINDY_GUST_KMH = 31

export const getBaseCondition = (iconId: number): WeatherCondition => {
  const translation = WEATHER_TRANSLATIONS[iconId]
  if (!translation) {
    console.warn(`WeatherIcon ${iconId} no reconocido, fallback a cloudy`)
    return 'cloudy'
  }
  return translation.pgoCondition
}

export const resolveCondition = (
  iconId: number,
  windKmh: number,
  gustKmh: number
): WeatherCondition => {
  const base = getBaseCondition(iconId)
  const translation = WEATHER_TRANSLATIONS[iconId]

  if (translation && translation.canWindy) {
    const isWindy = windKmh > WINDY_WIND_KMH || gustKmh > WINDY_GUST_KMH
    if (isWindy) return 'windy'
  }

  return base
}
