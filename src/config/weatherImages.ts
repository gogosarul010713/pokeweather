// Rutas centralizadas de imágenes de clima.
// Para cambiar todas las imágenes: editar solo este archivo.
// Los archivos deben existir en public/weather/{condition}.png

export type WeatherCondition = 'sunny' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'windy' | 'clear'

// Rutas de imágenes de clima (PNG)
export const WEATHER_IMAGES: Record<WeatherCondition, string> = {
  sunny:  '/weather/sunny.png',
  clear:  '/weather/clear.png',
  partly: '/weather/partly.png',
  cloudy: '/weather/cloudy.png',
  fog:    '/weather/fog.png',
  rain:   '/weather/rain.png',
  snow:   '/weather/snow.png',
  windy:  '/weather/windy.png',
}

// Etiquetas de condiciones climáticas (para UI)
export const CONDITION_LABEL: Record<WeatherCondition, string> = {
  sunny:  'Soleado',
  clear:  'Despejado',
  partly: 'Parcial',
  cloudy: 'Nublado',
  fog:    'Niebla',
  rain:   'Lluvia',
  snow:   'Nieve',
  windy:  'Ventoso',
}

// Colores para condiciones climáticas
export const CONDITION_COLORS: Record<WeatherCondition, string> = {
  sunny:  '#FFB347',  // Naranja
  clear:  '#4A5568',  // Azul grisaceo nocturno (US-1206)
  partly: '#87CEEB',  // Azul claro
  cloudy: '#9E9E9E',  // Gris
  fog:    '#C8C8C8',  // Gris claro
  rain:   '#5B9BD5',  // Azul oscuro
  snow:   '#B0E0E6',  // Azul pálido
  windy:  '#78C896',  // Verde
}
