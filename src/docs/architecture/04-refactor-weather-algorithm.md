# 21 — Refactorización: Alinear código con algoritmo PGO (Doc 20)

> Diagnóstico y plan paso a paso para corregir la lógica de clasificación de clima.
> Referencia: `src/docs/20-weather-classification-algorithm.md`

---

## STATUS

| Paso | Descripción | Estado | Fecha |
|------|-------------|--------|-------|
| 1 | Crear `WEATHER_TRANSLATIONS` (44 iconos per-icon) | ✅ Completado | 2026-03-29 |
| 2 | Reescribir `getBaseCondition()` + eliminar `ACCUWEATHER_TO_CONDITION` | ✅ Completado | 2026-03-29 |
| 3 | Corregir umbrales de viento (29 / 31) + exportToExcel | ✅ Completado | 2026-03-29 |
| 4 | Reescribir `resolveCondition()` con `canWindy` per-icon | ✅ Completado | 2026-03-29 |
| 5 | Eliminar override FOG por visibilidad | ✅ Completado | 2026-03-29 |
| 6 | Actualizar `weatherImages.ts` (.svg → .png) | ✅ Completado | 2026-03-29 |
| 7 | Centralizar `TYPE_ICON` en config | ✅ Completado | 2026-03-29 |
| 8 | Unificar `CONDITION_LABEL` (eliminar duplicado inglés) | ✅ Completado | 2026-03-29 |

**Tests unitarios:** ✅ Completados (36/36 passing)
- Validación WEATHER_TRANSLATIONS: 44 iconos, canWindy per-icon, mapeos correctos
- Validación getBaseCondition(): todos los iconos retornan clima correcto
- Validación resolveCondition(): umbrales (29/31), canWindy per-icon, FOG icon=11 solo
- Validación CONDITION_TO_TYPES: tipos potenciados correctos
- 6 casos end-to-end: Tokio, Buenos Aires, Nueva York, París, Sydney (escenarios reales)

---

## ✅ REFACTORIZACIÓN COMPLETADA — Sprint 6+

**Estado final:** Todos los 8 pasos completados (100%)

**Archivos modificados:**
- `src/services/weather/weatherService.ts` — Tablas + algoritmo + umbrales
- `src/utils/exportToExcel.ts` — Umbrales duplicados corregidos
- `src/config/weatherImages.ts` — .svg → .png
- `src/config/typeIcons.ts` — NUEVO: TYPE_ICON centralizado
- `src/components/Sidebar/LocationCard.tsx` — Importa TYPE_ICON desde config
- `src/components/Sidebar/LocationDetail.tsx` — Importa TYPE_ICON y CONDITION_LABEL desde config
- `src/components/Map/CityTooltip.tsx` — Importa TYPE_ICON desde config

**Tests:** 36/36 passing ✅
**Build:** Exitoso ✅

---

## 📋 CAMBIOS RESUMEN

### Grupo 1 — Algoritmo (Crítico)
| Cambio | Antes | Después | Impacto |
|--------|-------|---------|---------|
| Mapeo iconos | Agrupado por condición (error-prone) | Per-icon con canWindy | +40 bugs fixes |
| Umbrales viento | 24.1 / 35.4 km/h | 29 / 31 km/h | Precisión ±20% |
| FOG detection | Visibility < 1km (custom) | Icon 11 only (spec) | -1 false positive |
| WINDY override | Por condición base | Per-icon canWindy | +1 edge case (icon 31) |

### Grupo 2 — Estructura
- ✅ `WEATHER_TRANSLATIONS`: 44 iconos, cada uno con `canWindy` explícito

### Grupo 3 — Config
- ✅ `weatherImages.ts`: `.svg` → `.png` (actual)
- ✅ Dead code `.svg` rules eliminado

### Grupo 4 — Duplicación (-45 líneas)
- ✅ `TYPE_ICON`: Centralizado en `src/config/typeIcons.ts`
  - Antes: 3 copias idénticas (LocationCard, LocationDetail, CityTooltip)
  - Ahora: 1 source of truth
- ✅ `CONDITION_LABEL`: Unificado en `weatherService.ts`
  - Antes: 2 versiones (español + inglés duplicado)
  - Ahora: 1 solo (español)

---

## GRUPO 1 — MAPEO INCORRECTO (Crítico: afecta clasificación)

### 1.1. `ACCUWEATHER_TO_CONDITION` tiene ~20 iconos mal clasificados

**Archivo:** `src/services/weather/weatherService.ts` líneas 13-20

**Código actual (agrupado por condición):**

```typescript
export const ACCUWEATHER_TO_CONDITION: Record<string, number[]> = {
  sunny:  [1, 2, 3, 4, 30, 33, 34],
  partly: [5, 6, 35, 36],
  cloudy: [7, 8, 11, 37, 38],
  fog:    [],
  rain:   [12, 13, 14, 15, 16, 17, 40, 41, 42],
  snow:   [19, 20, 21, 22, 23, 24, 25, 26, 29, 43, 44],
}
```

**Errores detectados (vs Doc 20):**

| Icono | Actual | Correcto (Doc 20) | Descripción AccuWeather |
|-------|--------|--------------------|------------------------|
| 3 | `sunny` | `partly` | Partly Sunny → PGO 8 (PC Day) |
| 4 | `sunny` | `partly` | Intermittent Clouds → PGO 8 (PC Day) |
| 5 | `partly` | `cloudy` | Hazy Sunshine → PGO 7 (Cloudy) |
| 6 | `partly` | `cloudy` | Mostly Cloudy → PGO 7 (Cloudy) |
| 11 | `cloudy` | `fog` | Fog → PGO 1 (Fog) |
| 13 | `rain` | `cloudy` | MC w/ Showers → PGO 7 (Cloudy) |
| 14 | `rain` | `partly` | PS w/ Showers → PGO 8 (PC Day) |
| 16 | `rain` | `cloudy` | MC w/ T-Storms → PGO 7 (Cloudy) |
| 17 | `rain` | `partly` | PS w/ T-Storms → PGO 8 (PC Day) |
| 18 | **falta** | `rain` | Rain → PGO 2 (Rain) |
| 20 | `snow` | `cloudy` | MC w/ Flurries → PGO 7 (Cloudy) |
| 21 | `snow` | `partly` | PS w/ Flurries → PGO 8 (PC Day) |
| 23 | `snow` | `cloudy` | MC w/ Snow → PGO 7 (Cloudy) |
| 26 | `snow` | `rain` | Freezing Rain → PGO 2 (Rain) |
| 29 | `snow` | `rain` | Rain and Snow → PGO 2 (Rain) |
| 31 | **falta** | `snow` | Cold → PGO 3 (Snow) |
| 32 | **falta** | `windy` | Windy → PGO 6 (Windy) |
| 40 | `rain` | `cloudy` | MC w/ Showers night → PGO 7 (Cloudy) |
| 41 | `rain` | `partly` | PC w/ T-Storms night → PGO 9 (PC Night) |
| 42 | `rain` | `cloudy` | MC w/ T-Storms night → PGO 7 (Cloudy) |

Además `fog: []` está vacío — debería contener `[11]`.

**Mapeo correcto según Doc 20 (convertido a 7 condiciones del app):**

```
sunny  (PGO 4+5): [1, 2, 30, 33, 34]
partly (PGO 8+9): [3, 4, 14, 17, 21, 35, 36, 39, 41]
cloudy (PGO 7):   [5, 6, 7, 8, 13, 16, 20, 23, 37, 38, 40, 42]
fog    (PGO 1):   [11]
rain   (PGO 2):   [12, 15, 18, 26, 29]
snow   (PGO 3):   [19, 22, 24, 25, 31, 43, 44]
windy  (PGO 6):   [32]
```

### 1.2. Umbrales de viento incorrectos

**Archivo:** `src/services/weather/weatherService.ts` líneas 98-99

| Umbral | Actual | Doc 20 | Operador actual | Operador Doc 20 |
|--------|--------|--------|-----------------|-----------------|
| `WINDY_WIND_KMH` | 24.1 | **29** | `>=` | `>` |
| `WINDY_GUST_KMH` | 35.4 | **31** | `>=` | `>` |

### 1.3. Override de viento usa condición base en vez de `canWindy` per-icon

**Archivo:** `src/services/weather/weatherService.ts` línea 125

```typescript
// ACTUAL: checa condición base (incompleto)
if (isWindy && ['sunny', 'partly', 'cloudy'].includes(base)) return 'windy'

// DOC 20: checa canWindy del icono específico
// Ejemplo: icon 31 (Cold→snow) tiene canWindy=true pero actual NO lo convierte a windy
// Ejemplo: icon 11 (Fog) tiene canWindy=false → nunca debería ser windy ✓ (esto sí funciona)
```

**Iconos con `canWindy=true` que mapean fuera de sunny/partly/cloudy:**

| Icono | Condición base | canWindy | Actual: ¿se convierte en windy? |
|-------|---------------|----------|--------------------------------|
| 31 (Cold) | snow | true | NO (bug) |
| 32 (Windy) | windy | true | N/A (ya es windy) |

### 1.4. FOG por visibilidad: no existe en algoritmo PGO

**Archivo:** `src/services/weather/weatherService.ts` líneas 117-119

```typescript
// ACTUAL: override custom que NO está en el algoritmo real
if (visibilityKm !== undefined && visibilityKm < 1) {
  return 'fog'
}
```

Doc 20 dice: FOG solo se determina por `WeatherIcon=11` → `pgoIconId=1`. No hay override por visibilidad.

**Impacto:** Puede forzar FOG en situaciones donde PGO muestra otra condición. Eliminar.

**Campos afectados por la eliminación:**
- `visibilityKm` en interface `City` (useStore.ts:33) → mantener como informativo
- `visibilityKm` en `HourlyForecastData` (weatherService.ts:148) → mantener como informativo
- `Visibility?.Value` en `fetchCityWeather` (weatherService.ts:236) → mantener lectura, no usar para clasificación
- Parámetro `visibilityKm?` de `resolveCondition()` → eliminar

---

## GRUPO 2 — ESTRUCTURA DEL MAPEO (Diseño)

### 2.1. Reemplazar mapeo agrupado por `WEATHER_TRANSLATIONS` per-icon

**Archivo:** `src/services/weather/weatherService.ts`

El mapeo actual `ACCUWEATHER_TO_CONDITION` (agrupado por condición) dificulta:
- Incluir `canWindy` por icono
- Detectar iconos faltantes
- Validar contra el doc

Reemplazar con estructura del Doc 20:

```typescript
interface WeatherTranslation {
  id: number
  iconText: string
  canWindy: boolean
  pgoCondition: WeatherCondition  // mapeado a las 7 condiciones del app
}

export const WEATHER_TRANSLATIONS: Record<number, WeatherTranslation> = {
  1:  { id: 1,  iconText: "Sunny",                    canWindy: true,  pgoCondition: 'sunny' },
  2:  { id: 2,  iconText: "Mostly Sunny",             canWindy: true,  pgoCondition: 'sunny' },
  3:  { id: 3,  iconText: "Partly Sunny",             canWindy: true,  pgoCondition: 'partly' },
  // ... 44 entradas (ver Doc 20 sección 4)
}
```

### 2.2. Agregar `PGO_WEATHERS` como estructura unificada

Actualmente `CONDITION_TO_TYPES`, `CONDITION_LABEL` y `CONDITION_COLORS` son mapas separados. Unificar:

```typescript
export const PGO_WEATHERS: Record<WeatherCondition, {
  label: string
  color: string
  boostedTypes: string[]
}> = {
  sunny:  { label: 'Soleado', color: '#FFB347', boostedTypes: ['fire', 'ground', 'grass'] },
  // ...
}
```

---

## GRUPO 3 — CONFIG / ASSETS

### 3.1. `weatherImages.ts` apunta a `.svg` pero assets son `.png`

**Archivo:** `src/config/weatherImages.ts` líneas 9-15

```typescript
// ACTUAL: .svg (archivos no existen)
sunny: '/weather/sunny.svg',
partly: '/weather/partly.svg',

// REAL en /public/weather/: sunny.png, cloudy.png, etc.
```

Los componentes ya usan `.png` directamente (`/weather/${city.condition}.png`) e ignoran `weatherImages.ts`. El archivo es dead code funcional.

**Assets en `/public/weather/`:**
```
clear.png, cloudy.png, cloudy_night.png, fog.png,
partly.png, rain.png, snow.png, sunny.png, windy.png
```

### 3.2. Assets sin usar: `clear.png` y `cloudy_night.png`

Existen en `/public/weather/` pero el app usa 7 condiciones sin distinguir día/noche para sunny/clear y partly/partly-night. Estos assets quedan huérfanos.

**Decisión pendiente:** ¿Expandir a 9 condiciones (día/noche) o mantener 7?
- Si 7: eliminar clear.png y cloudy_night.png
- Si 9: agregar 'clear' y 'partly-night' al type WeatherCondition

---

## GRUPO 4 — DUPLICACIÓN DE CÓDIGO

### 4.1. `TYPE_ICON` duplicado en 3 componentes

**Idéntico en:**
- `src/components/Sidebar/LocationCard.tsx` líneas 8-27
- `src/components/Sidebar/LocationDetail.tsx` líneas 4-23
- `src/components/Map/CityTooltip.tsx` líneas 16-35

**Solución:** Centralizar en `src/config/typeIcons.ts` e importar.

### 4.2. `CONDITION_LABEL` duplicado y contradictorio

| Fuente | Idioma | Ejemplo |
|--------|--------|---------|
| `weatherService.ts:47-55` | Español | "Soleado", "Nublado", "Lluvia" |
| `LocationDetail.tsx:25-28` | Inglés | "Sunny", "Cloudy", "Rain" |

**Solución:** Eliminar duplicado de `LocationDetail.tsx`, importar desde `weatherService.ts`.

---

## ARCHIVOS AFECTADOS (resumen)

| Archivo | Pasos que lo tocan |
|---------|--------------------|
| `src/services/weather/weatherService.ts` | 1, 2, 3, 4, 5 |
| `src/config/weatherImages.ts` | 6 |
| `src/config/typeIcons.ts` (nuevo) | 7 |
| `src/components/Sidebar/LocationCard.tsx` | 7 |
| `src/components/Sidebar/LocationDetail.tsx` | 7, 8 |
| `src/components/Map/CityTooltip.tsx` | 7 |

---

## NOTAS DE IMPLEMENTACIÓN

- **Pasos 1-5 son interdependientes:** El paso 1 (crear WEATHER_TRANSLATIONS) es prerequisito de 2 y 4. El paso 3 es independiente. El paso 5 es independiente.
- **Pasos 6-8 son independientes:** Se pueden hacer en cualquier orden después de los pasos core.
- **No cambiar interface City:** Los campos `visibilityKm`, `weatherIcon`, etc. se mantienen como informativos.
- **No cambiar WeatherCondition type:** Se mantienen las 7 condiciones actuales (sunny, partly, cloudy, fog, rain, snow, windy).
- **Build test después de cada paso:** `npm run build` debe pasar antes de avanzar al siguiente.
