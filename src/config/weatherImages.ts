// Rutas centralizadas de imágenes de clima.
// Para cambiar todas las imágenes: editar solo este archivo.
// Los archivos deben existir en public/weather/{condition}.png

export type WeatherCondition = 'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy'

// Rutas de imágenes de clima (PNG)
export const WEATHER_IMAGES: Record<WeatherCondition, string> = {
  sunny:  '/weather/sunny.png',
  partly: '/weather/partly.png',
  cloudy: '/weather/cloudy.png',
  fog:    '/weather/fog.png',
  rain:   '/weather/rain.png',
  snow:   '/weather/snow.png',
  windy:  '/weather/windy.png',
}
