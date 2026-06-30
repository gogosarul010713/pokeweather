import { ResponsiveImage } from 'pokeweather'

const WEATHER_AVIF = '/weather/sunny.avif'
const WEATHER_WEBP = '/weather/sunny.webp'

export function WeatherIcon() {
  return (
    <ResponsiveImage
      avifSrc={WEATHER_AVIF}
      webpSrc={WEATHER_WEBP}
      alt="Clima soleado"
      width={60}
      height={60}
    />
  )
}

export function LargeIcon() {
  return (
    <ResponsiveImage
      avifSrc={WEATHER_AVIF}
      webpSrc={WEATHER_WEBP}
      alt="Icono grande"
      width={120}
      height={120}
    />
  )
}

export function WithFallback() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 8 }}>
      <ResponsiveImage avifSrc="/weather/sunny.avif" webpSrc="/weather/sunny.webp" alt="Soleado" width={48} height={48} />
      <ResponsiveImage avifSrc="/weather/rain.avif" webpSrc="/weather/rain.webp" alt="Lluvia" width={48} height={48} />
      <ResponsiveImage avifSrc="/weather/snow.avif" webpSrc="/weather/snow.webp" alt="Nieve" width={48} height={48} />
    </div>
  )
}
