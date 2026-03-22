// Rutas centralizadas de imágenes de clima.
// Para cambiar todas las imágenes: editar solo este archivo.
// Los archivos deben existir en public/weather/{condition}.png

export type WeatherCondition = 'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy'

// Placeholders: .svg — reemplazar por .png cuando estén los assets finales
export const WEATHER_IMAGES: Record<WeatherCondition, string> = {
  sunny:  '/weather/sunny.svg',
  partly: '/weather/partly.svg',
  cloudy: '/weather/cloudy.svg',
  fog:    '/weather/fog.svg',
  rain:   '/weather/rain.svg',
  snow:   '/weather/snow.svg',
  windy:  '/weather/windy.svg',
}
