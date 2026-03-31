# 04-API — Pokémon Weather Explorer v2
# Referencia completa de la integración con AccuWeather.
# Leer cuando trabajas en: weatherService.js (funciones de fetch), useWeather.js, variables de entorno.

---

## PROVEEDOR

**AccuWeather** — pronóstico horario (hourly forecast).

> ⚠ NO usar OpenWeatherMap.
> ⚠ NO usar el endpoint de "current conditions" — Pokémon GO usa el pronóstico horario.

---

## VARIABLE DE ENTORNO

```
VITE_ACCUWEATHER_KEY=tu_api_key_aqui
```


---

## ENDPOINTS

### 1. Geoposición → Location Key

```
GET https://dataservice.accuweather.com/locations/v1/cities/geoposition/search
  ?apikey={KEY}
  &q={lat},{lng}
  &toplevel=true
```

**Propósito:** Obtener el `Key` de AccuWeather para una coordenada.
**TTL de caché:** permanente (se guarda en localStorage, no cambia).
**Campo a usar:** `response.Key` (string, ej: `"347625"`)

```js
export const getAccuWeatherLocationKey = async (lat, lng, apiKey) => {
  const cached = getCachedLocationKey(getS2Key(lat, lng))
  if (cached) return cached

  const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search`
            + `?apikey=${apiKey}&q=${lat},${lng}&toplevel=true`
  const res  = await fetch(url)
  if (!res.ok) throw new Error(`AccuWeather location error: ${res.status}`)
  const data = await res.json()
  const key  = data.Key

  setCachedLocationKey(getS2Key(lat, lng), key)
  return key
}
```

---

### 2. Pronóstico horario (12 horas)

```
GET https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/{locationKey}
  ?apikey={KEY}
  &details=true
  &metric=true
```

**Propósito:** Obtener el pronóstico de la hora actual para calcular condición Pokémon GO.
**TTL de caché:** 60 minutos (IndexedDB).
**Campos críticos del primer elemento del array:**

| Campo | Tipo | Uso |
|-------|------|-----|
| `WeatherIcon` | int 1–44 | Input para `resolveCondition()` |
| `Wind.Speed.Value` | float km/h | Input para lógica WINDY |
| `WindGust.Speed.Value` | float km/h | Input para lógica WINDY |
| `HasPrecipitation` | boolean | Validación secundaria lluvia/nieve |
| `Temperature.Value` | float °C | `tempC` (metric=true) |
| `RealFeelTemperature.Value` | float °C | `feelsLike` |
| `RelativeHumidity` | int % | `humidity` |

```js
export const getHourlyForecast = async (locationKey, apiKey) => {
  const url = `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationKey}`
            + `?apikey=${apiKey}&details=true&metric=true`
  const res  = await fetch(url)
  if (!res.ok) throw new Error(`AccuWeather forecast error: ${res.status}`)
  const data = await res.json()
  return data[0]   // primer slot = hora actual
}
```

---

### 3. Alertas de clima extremo

```
GET https://dataservice.accuweather.com/alerts/v1/{locationKey}
  ?apikey={KEY}
  &details=true
```

**Propósito:** Detectar clima extremo para el flag `isExtreme`.
**Respuesta:** Array de alertas. Array vacío = sin alertas = `isExtreme: false`.

```js
export const getAlerts = async (locationKey, apiKey) => {
  try {
    const url = `https://dataservice.accuweather.com/alerts/v1/${locationKey}`
              + `?apikey=${apiKey}&details=true`
    const res  = await fetch(url)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []   // alertas no críticas — no romper la carga
  }
}
```

---

## FLUJO COMPLETO — weatherService.js

```js
// Función principal que orquesta los tres endpoints por ciudad
export const fetchCityWeather = async (city, apiKey) => {
  const s2Key = getS2Key(city.lat, city.lon)

  // 1. Verificar caché
  const cached = await getCachedWeather(s2Key)
  if (cached) return cached

  // 2. Obtener location key
  const locationKey = await getAccuWeatherLocationKey(city.lat, city.lon, apiKey)

  // 3. Obtener forecast y alertas en paralelo
  const [forecast, alerts] = await Promise.all([
    getHourlyForecast(locationKey, apiKey),
    getAlerts(locationKey, apiKey),
  ])

  // 4. Calcular condición y tipos
  const windKmh  = forecast.Wind.Speed.Value
  const gustKmh  = forecast.WindGust.Speed.Value
  const condition = resolveCondition(forecast.WeatherIcon, windKmh, gustKmh)

  // 5. Construir payload de clima
  const weatherData = {
    condition,
    isExtreme:       isExtremeWeather(alerts),
    boostedTypes:    CONDITION_TO_TYPES[condition],
    tempC:           Math.round(forecast.Temperature.Value),
    feelsLike:       Math.round(forecast.RealFeelTemperature.Value),
    humidity:        forecast.RelativeHumidity,
    windKmh:         Math.round(windKmh),
    gustKmh:         Math.round(gustKmh),
    weatherIcon:     forecast.WeatherIcon,
    accuLocationKey: locationKey,
    s2Key,
    updatedAt:       Date.now(),
    weatherImage:    WEATHER_IMAGES[condition],
  }

  // 6. Guardar en caché
  await setCachedWeather(s2Key, weatherData)

  return weatherData
}
```

---

## MANEJO DE ERRORES

| Error | Estrategia |
|-------|-----------|
| 401 Unauthorized | API key inválida → fallback a mock |
| 403 Forbidden | Límite de plan superado → fallback a caché o mock |
| 503 / timeout | Red caída → fallback a caché (si existe) o mock |
| JSON inválido | try/catch → fallback a mock |
| locationKey no encontrado | Log de warning, city ignorada |

```js
// Patrón de fallback en useWeather.js
try {
  const weather = await fetchCityWeather(city, apiKey)
  return { ...city, ...weather }
} catch (err) {
  console.warn(`[PWE] Error cargando ${city.name}:`, err.message)
  // Retornar ciudad con datos mock para no romper el render
  return getMockCityWeather(city)
}
```

---

## RATE LIMITS — plan gratuito AccuWeather

| Endpoint | Límite gratuito |
|----------|----------------|
| Geoposición | 50 calls/día |
| Hourly forecast | 50 calls/día |
| Alertas | 50 calls/día |

Con 94 ciudades y caché de 60 min, el consumo diario es:
- Primera carga: 94 × 3 = **282 calls** (supera el plan gratuito)
- Con caché: 0 calls por 60 min, luego 94 × 2 = **188 calls/hora**

> ⚠ El plan gratuito no es suficiente para 94+ ciudades en producción.
> Para desarrollo: usar mock mode (sin API key).
> Para producción: plan de pago o reducir frecuencia de refresh.

```js
// Warning en consola si se detecta probable límite superado
if (err.status === 403) {
  console.warn('[PWE] AccuWeather rate limit posiblemente superado. Usando caché/mock.')
}
```

---

## CADENCIA DE REFRESH

```
Inicio app
  └── carga todos los datos (con caché o API)
        └── setTimeout(refetch, msUntilNextHour())

msUntilNextHour():
  now  = Date.now()
  next = próxima HH:00:00.000
  return next - now
```

Esto garantiza que el refresh ocurre en el mismo momento que Pokémon GO
actualiza el clima en el juego (cada hora en punto).

---

## NOTAS IMPORTANTES

- `metric=true` en el endpoint de forecast retorna temperaturas en °C y vientos en km/h.
- El campo `Wind.Speed.Value` en el pronóstico horario puede estar en m/s dependiendo del plan — verificar con `Wind.Speed.Unit`.
- AccuWeather retorna arrays para el forecast — siempre tomar `data[0]` (hora actual).
- El `locationKey` de AccuWeather es estable para una coordenada — se puede cachear indefinidamente.
