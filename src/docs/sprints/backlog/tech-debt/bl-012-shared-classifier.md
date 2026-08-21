# BL-012: Extraccion del algoritmo de clasificacion a modulo puro compartido

**Prioridad:** 🔴 CRITICA | **Tipo:** Tech Debt + Arch | **Estimacion:** 4h | **Decision:** D-042
**Fecha:** 2026-05-11 | **Sprint:** 11 | **Estado:** PLAN LISTO — pendiente de ejecucion

---

## Resumen ejecutivo

El algoritmo `resolveCondition` (clasificacion clima → condicion PGO) vive solo en
`src/services/weather/weatherService.ts` por D-039 (2026-05-03). En la sesion de hoy
(2026-05-11) se introdujo una copia divergente en `functions/src/syncWeatherLogic.ts`
que reintroduce el drift que D-039 elimino.

**Esta US:**
1. Revierte los cambios de hoy en la CF
2. Extrae el algoritmo a archivo PURO `src/services/weather/weatherClassify.ts`
3. Re-exporta desde `weatherService.ts` (consumidores no cambian)
4. Genera copia automatica en `functions/src/shared/weatherClassify.ts` via script `prebuild`
5. La CF importa de la copia generada

Resultado: **un solo archivo** modifica el algoritmo en todos los lados.

---

## Contexto

### Estado actual (sin commit en `sprint-11`)

| Archivo | Estado | Problema |
|---|---|---|
| `src/services/weather/weatherService.ts` | Tiene `resolveCondition` original | OK (fuente de verdad) |
| `functions/src/syncWeatherLogic.ts` | Tiene `resolveCondition` LOCAL (agregada hoy) | Duplicidad. Tabla `CAN_WINDY` + `BASE_CONDITION` separadas vs `WEATHER_TRANSLATIONS` unificada del frontend |
| `src/services/firebase/firebaseWeatherService.ts` | Tiene `ForecastSnapshot.pgo_condition?: string` (agregado hoy) | Campo correcto para el flujo nuevo, mantener |
| `src/services/lookback/lookbackService.ts` | Lee `pgo_condition` primero, fallback a `resolveCondition` (agregado hoy) | Comportamiento correcto, mantener |

### Cambios sin commit a revertir

```
git diff --stat
  functions/src/syncWeatherLogic.ts    (eliminar resolveCondition local)
```

### Cambios sin commit a conservar

```
  src/services/firebase/firebaseWeatherService.ts  (ForecastSnapshot.pgo_condition?)
  src/services/lookback/lookbackService.ts         (getConditionFromSnapshot con fallback)
```

---

## Decision arquitectonica: D-042

Ver `src/docs/architecture/11-decision-log.md` entrada D-042.

**Principio:** archivo puro compartido + script de copia pre-build automatico.

---

## Estructura final

```
pokeweather/
├── src/
│   └── services/
│       └── weather/
│           ├── weatherClassify.ts        ← NUEVO. Fuente unica de verdad.
│           └── weatherService.ts          ← Re-exporta de weatherClassify.
├── functions/
│   ├── src/
│   │   ├── shared/
│   │   │   └── weatherClassify.ts        ← AUTOGENERADO. NO EDITAR.
│   │   └── syncWeatherLogic.ts            ← Importa de './shared/weatherClassify'
│   └── package.json                       ← Scripts: prebuild + build
├── scripts/
│   └── sync-classify.mjs                  ← NUEVO. Copia src → functions con header.
└── tests/
    └── unit/
        └── shared/
            └── classify-sync.test.ts      ← NUEVO. Verifica que copia == fuente.
```

---

## Pasos de implementacion

### Paso 1 — Revertir regresion en CF (2026-05-11 cambios sin commit)

```bash
git checkout HEAD -- functions/src/syncWeatherLogic.ts
```

Verificar que `syncWeatherLogic.ts` vuelve al estado pre-sesion:
- Schema raw (sin `pgo_condition`)
- Sin `resolveCondition` local
- Sin tablas `CAN_WINDY` y `BASE_CONDITION`

### Paso 2 — Crear `src/services/weather/weatherClassify.ts`

Extraer de `weatherService.ts` solo:
- `WeatherCondition` (tipo)
- `WEATHER_TRANSLATIONS` (constante)
- `WINDY_WIND_KMH`, `WINDY_GUST_KMH` (constantes)
- `getBaseCondition(iconId)` (funcion)
- `resolveCondition(iconId, windKmh, gustKmh)` (funcion)
- `WeatherTranslation` (interface)

**Restriccion:** cero imports de otros modulos del frontend. Solo tipos primitivos.
`WeatherCondition` se declara localmente o se importa solo si el archivo importado es
igualmente puro (`src/config/weatherImages.ts` solo si es puro — verificar).

### Paso 3 — Refactor `weatherService.ts`

```typescript
// Al inicio del archivo:
export * from './weatherClassify'

// Eliminar las declaraciones locales de:
//   WeatherTranslation, WEATHER_TRANSLATIONS, WINDY_WIND_KMH,
//   WINDY_GUST_KMH, getBaseCondition, resolveCondition
```

Mantener en `weatherService.ts` todo lo que NO es algoritmo puro:
- `CONDITION_TO_TYPES` (mapeo Pokemon types — sigue siendo frontend)
- `CONDITION_COLORS`
- `CONDITION_LABEL`
- `fetchCityWeather()`, `getHourlyForecasts()`, `createForecastSnapshots()` (todo el codigo
  con dependencias de cache, geo, etc.)

Los consumidores que importan `resolveCondition` desde `weatherService.ts` siguen
funcionando sin cambios (via re-export).

### Paso 4 — Crear `scripts/sync-classify.mjs`

```javascript
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC = resolve(ROOT, 'src/services/weather/weatherClassify.ts')
const DST = resolve(ROOT, 'functions/src/shared/weatherClassify.ts')

const HEADER = `// ════════════════════════════════════════════════════════════════════════════
// AUTOGENERADO desde src/services/weather/weatherClassify.ts
// NO EDITAR ESTE ARCHIVO. Cualquier cambio aqui sera sobrescrito.
// Para modificar el algoritmo: editar el archivo fuente y ejecutar
//   npm run sync:classify   (o cualquier build de functions).
// Decision arquitectonica: D-042 (src/docs/architecture/11-decision-log.md)
// ════════════════════════════════════════════════════════════════════════════
`

const source = readFileSync(SRC, 'utf-8')
mkdirSync(dirname(DST), { recursive: true })
writeFileSync(DST, HEADER + '\n' + source, 'utf-8')

console.log(`[sync-classify] ${SRC} → ${DST}`)
```

### Paso 5 — Actualizar `functions/package.json`

```json
{
  "scripts": {
    "prebuild": "node ../scripts/sync-classify.mjs",
    "build": "tsc",
    ...
  }
}
```

Esto garantiza que cualquier `npm run build` en `functions/` (incluido el de Firebase
deploy) ejecuta `sync-classify.mjs` antes de `tsc`.

### Paso 6 — Refactor `functions/src/syncWeatherLogic.ts`

Eliminar las tablas locales `CAN_WINDY`, `BASE_CONDITION`, las constantes `WINDY_WIND_KMH`,
`WINDY_GUST_KMH`, y la funcion `resolveCondition` local.

Agregar al inicio:

```typescript
import { resolveCondition } from './shared/weatherClassify'
```

En `fetchAccuWeatherForecast()`, dentro del `.map`:

```typescript
return {
  hour: index,
  icon_code: item.WeatherIcon,
  icon_phrase: item.IconPhrase || '',
  temp_c: item.Temperature.Value,
  wind_kmh: windKmh,
  gust_kmh: gustKmh,
  humidity: item.RelativeHumidity || 0,
  has_precipitation: item.HasPrecipitation ?? false,
  pgo_condition: resolveCondition(item.WeatherIcon, windKmh, gustKmh),
}
```

### Paso 7 — Crear test de sincronizacion

`tests/unit/shared/classify-sync.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Sincronizacion de weatherClassify entre frontend y CF (D-042)', () => {
  const SRC = resolve(__dirname, '../../../src/services/weather/weatherClassify.ts')
  const DST = resolve(__dirname, '../../../functions/src/shared/weatherClassify.ts')

  it('la copia generada existe', () => {
    expect(existsSync(DST)).toBe(true)
  })

  it('el contenido de la copia coincide byte-a-byte con el source (mas header)', () => {
    const src = readFileSync(SRC, 'utf-8')
    const dst = readFileSync(DST, 'utf-8')

    // Quitar header autogenerado (todo hasta la primera linea no-comment despues del bloque)
    const dstNoHeader = dst.replace(/^\/\/[\s\S]*?\/\/ ═+\n\n?/, '')

    expect(dstNoHeader).toBe(src)
  })
})
```

### Paso 8 — Agregar gitignore (opcional pero recomendado)

`.gitignore`:

```
# Archivo generado por scripts/sync-classify.mjs
functions/src/shared/weatherClassify.ts
```

**O alternativa:** commitear el archivo generado para que CI/CD no requiera ejecutar el
script en el server. Decision a tomar en implementacion.

**Recomendacion:** NO ignorar — commitear para que `git blame` muestre el cambio y el
test de paridad se valide en CI sin requerir prebuild.

### Paso 9 — Validar localmente

```bash
# 1. Reverter CF
git checkout HEAD -- functions/src/syncWeatherLogic.ts

# 2. Crear weatherClassify.ts y refactorizar weatherService.ts
# (manual)

# 3. Crear script y test
# (manual)

# 4. Actualizar functions/package.json
# (manual)

# 5. Ejecutar
cd functions
npm install   # solo si necesario
npm run build  # debe disparar prebuild → sync-classify.mjs → tsc

# 6. Validar
cd ..
npm run test -- weatherService.test
npm run test -- classify-sync.test
```

### Paso 10 — Validar deploy CF (opcional, contra Firebase emulator)

```bash
cd functions
npm run serve   # Firebase emulator
# Verificar que la CF arranca sin error de import
```

### Paso 11 — Commit + deploy

```bash
git add src/services/weather/weatherClassify.ts
git add src/services/weather/weatherService.ts  # refactor
git add functions/src/shared/weatherClassify.ts  # generado
git add functions/src/syncWeatherLogic.ts        # importa del shared
git add functions/package.json                   # prebuild script
git add scripts/sync-classify.mjs                # script
git add tests/unit/shared/classify-sync.test.ts  # test
git add src/docs/architecture/11-decision-log.md  # D-042
git add src/docs/sprints/backlog/deuda-tecnica/bl-012-shared-classifier.md  # este archivo

git commit -m "feat(bl-012): algoritmo de clasificacion en modulo puro compartido (D-042)"

# Deploy CF a Firebase
cd functions && npm run deploy
```

---

## Criterios de aceptacion

1. ✅ `functions/src/syncWeatherLogic.ts` NO contiene tablas locales `CAN_WINDY` o `BASE_CONDITION`
2. ✅ `functions/src/syncWeatherLogic.ts` importa `resolveCondition` de `./shared/weatherClassify`
3. ✅ `src/services/weather/weatherService.ts` re-exporta de `./weatherClassify` (no duplica el algoritmo)
4. ✅ `npm run build` en `functions/` ejecuta `prebuild` automaticamente
5. ✅ Test `classify-sync.test.ts` pasa (copia == fuente byte-a-byte)
6. ✅ Tests existentes `weatherService.test.ts` siguen pasando sin modificacion
7. ✅ TypeScript compila sin errores en `tsc --noEmit` (frontend y CF)
8. ✅ `npm run build` (frontend + CF) sin errores
9. ✅ Firebase emulator arranca la CF sin error de import
10. ✅ Doc D-042 agregada al decision log
11. ✅ Nuevo snapshot escrito por la CF en Firestore tiene campo `pgo_condition`

---

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigacion |
|---|---|---|
| Alguien edita la copia autogenerada y se sobrescribe en proximo build | Media | Header explicito + test de paridad falla si byte-a-byte difieren |
| El script falla en CI/CD (Vercel build, Firebase deploy) | Baja | Script usa Node built-ins (`node:fs`, `node:path`) — disponibles en cualquier runtime Node 18+ |
| Cambio futuro al algoritmo se olvida de re-ejecutar build de functions | Baja | `prebuild` se ejecuta automatico en `npm run build` que es prerequisito de `firebase deploy` |
| Archivo fuente referencia un tipo de otro lugar del frontend que rompe la pureza | Media | Verificar en Paso 2 que `WeatherCondition` no arrastra deps. Si lo hace, declarar localmente. |
| Firebase deploy desde rama distinta a main no ejecuta prebuild | Baja | Documentar en CLAUDE.md que CF deploy siempre via `cd functions && npm run deploy` |

---

## Archivos afectados

| Archivo | Accion | Lineas estimadas |
|---|---|---|
| `src/services/weather/weatherClassify.ts` | CREAR | ~80 |
| `src/services/weather/weatherService.ts` | MODIFICAR (eliminar ~80 lineas, agregar re-export) | -70 |
| `functions/src/shared/weatherClassify.ts` | CREAR (autogenerado) | ~85 (con header) |
| `functions/src/syncWeatherLogic.ts` | MODIFICAR (revertir cambios de hoy + import) | -40 |
| `functions/package.json` | MODIFICAR (prebuild script) | +1 |
| `scripts/sync-classify.mjs` | CREAR | ~20 |
| `tests/unit/shared/classify-sync.test.ts` | CREAR | ~30 |
| `src/docs/architecture/11-decision-log.md` | MODIFICAR (D-042 agregada) | YA APLICADO |
| `src/docs/sprints/backlog/deuda-tecnica/bl-012-shared-classifier.md` | CREAR | YA APLICADO |
| `src/docs/sprints/BACKLOG.md` | MODIFICAR (BL-012 en matriz) | +1 |

---

## Decisiones tomadas en este analisis

1. **NO usar `tsconfig` paths o `references`** — la diferencia de `moduleResolution` (bundler vs node) hace inviable un import directo. Script de copia es mas simple y compatible.

2. **NO usar npm workspaces** — overhead innecesario para un solo archivo compartido. Para mas archivos compartidos en el futuro, evaluar workspaces.

3. **NO publicar como paquete npm interno** — requeriria registry privado o publicar como `@scope/name`. Demasiado peso para un archivo.

4. **SI commitear `functions/src/shared/weatherClassify.ts`** — `git blame` muestra historia y el test de paridad valida sin requerir prebuild en CI.

5. **NO ejecutar el script en pre-commit hook** — confia en que `npm run build` lo dispare. Si alguien commitea solo `weatherClassify.ts` sin rebuildar, el test de paridad falla en CI.

---

## Referencias

- **D-039** (2026-05-03): CF guarda raw, frontend clasifica — base de esta decision
- **D-042** (2026-05-11): Esta decision — extension de D-039 con CF persistiendo `pgo_condition`
- Bug original 2026-05-11: lookback muestra Ventoso fijo (secundario a la duplicidad)
- Archivo de analisis: conversacion 2026-05-11 con agente arquitecto
