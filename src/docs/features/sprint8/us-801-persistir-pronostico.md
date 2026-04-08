# US-801 — Persistir Pronóstico por Ciudad en Firestore

**Sprint:** 8 — Fase 2  
**Epic:** WDP (Weather Data Persistence)  
**Story Points:** 3 SP  
**Prioridad:** P1  
**Status:** ⏳ Pendiente  

---

## Historia de usuario

> Como sistema, quiero guardar el pronóstico horario de cada ciudad en Firestore para tener un historial centralizado y poder analizar la precisión de la clasificación a lo largo del tiempo.

---

## Criterios de aceptación

- [ ] Al terminar el ciclo de carga de cada ciudad, se escribe 1 documento en Firestore
- [ ] La escritura es **async/background** — no bloquea la UI ni el ciclo de carga de datos
- [ ] Si Firestore no está disponible (sin internet, config faltante), falla silenciosamente
- [ ] El documento incluye los campos definidos en el schema (ver abajo)
- [ ] Se usa batching: **1 doc por ciudad+hora**, con array de 12 snapshots horarios
- [ ] Verificado en Firestore Console: datos aparecen correctamente tras ciclo de carga
- [ ] No se generan errores en consola del browser en flujo normal
- [ ] Build: ✅ PASSED

---

## Schema del documento

**Path:** `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`

```typescript
interface ForecastDoc {
  city_id: string            // "san-francisco"
  city_name: string          // "San Francisco"
  country: string            // "EE.UU."
  region: string             // "america"
  lat: number
  lon: number
  date_hour: string          // "2026-04-08-14" (clave del doc)
  snapshots: ForecastSnapshot[]
  ttl: Timestamp             // Firestore Timestamp — now + 7 días
  created_at: Timestamp
}

interface ForecastSnapshot {
  hour: number               // 0-23
  raw_condition_code: number // IconCode AccuWeather
  raw_condition_text: string // "Partly Cloudy"
  classified: string         // "partly" (nuestra clasificación)
  types: string[]            // ["normal", "rock"]
  temperature_c: number
  wind_kmh: number
  precipitation_mm: number
  humidity_pct: number
  is_windy_override: boolean // true si WINDY reemplazó la condición base
}
```

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/services/firebase/firebaseWeatherService.ts` | Crear — lógica de escritura |
| `src/hooks/useWeather.ts` | Modificar — llamar a `firebaseWeatherService.saveForecast()` al final del ciclo |
| `src/services/firebase/index.ts` | Modificar — exportar `firebaseWeatherService` |

---

## Implementación propuesta

```typescript
// src/services/firebase/firebaseWeatherService.ts
import { db } from './firebaseConfig'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import type { City } from '../../store/useStore'

export async function saveCityForecast(city: City, snapshots: ForecastSnapshot[]): Promise<void> {
  if (!db) return  // Firestore no configurado

  const now = new Date()
  const dateHour = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}`
  const ttl = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const docRef = doc(db, 'city_weather', city.id, 'forecasts', dateHour)

  await setDoc(docRef, {
    city_id: city.id,
    city_name: city.name,
    country: city.country,
    region: city.region,
    lat: city.lat,
    lon: city.lon,
    date_hour: dateHour,
    snapshots,
    ttl: Timestamp.fromDate(ttl),
    created_at: Timestamp.now(),
  }, { merge: false })
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
```

### Integración en `useWeather.ts`

```typescript
// Al final del procesamiento de cada ciudad:
saveCityForecast(city, snapshots).catch((err) => {
  console.warn('[Firebase] Error guardando pronóstico:', city.id, err)
  // No re-throw — falla silenciosa
})
```

---

## Flujo de datos

```
AccuWeather API response
         ↓
  weatherService.ts (clasifica condición)
         ↓
  useWeather.ts (actualiza Zustand)
         ↓ (async, sin await)
  firebaseWeatherService.saveCityForecast()
         ↓
  Firestore /city_weather/{id}/forecasts/{date-hour}
```

---

## Criterios de performance

- Tiempo adicional en ciclo de carga: **0ms** (escritura async no bloqueante)
- Writes por ciclo completo: **94** (1 por ciudad)
- Writes por hora: **94** (ciclo horario)
- Writes por día: **~2,256** (dentro del free tier de 20k/día)

---

## Dependencias

- US-804 (Firebase setup)

## Bloqueante para

- US-803, US-805
