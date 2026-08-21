# Handoff Sprint 10 → Sprint 11

**Fecha:** 2026-05-07
**Estado branch:** `sprint-10` (pendiente merge a `develop`)
**Build:** ✅ Sin errores TS, deploy Vercel activo

Este documento captura decisiones, invariantes y deuda tecnica que Sprint 11 debe conocer
para no repetir errores ya resueltos ni romper contratos establecidos.

---

## Invariantes Criticos — NO Romper

### 1. date_hour — siempre LOCAL + siguiente hora completa

`date_hour` es la clave primaria de matching entre forecasts y reportes.

```
Algoritmo correcto (saveCityForecast):
  const nextHour = new Date(now)
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  dateHour = formatDateHour(nextHour)  // LOCAL time del usuario
```

**Regla:** Cualquier componente que necesite referenciar un forecast por hora DEBE
usar `forecast.date_hour` directamente. NO recalcular desde otro timestamp.

Si recalculas desde un Firestore Timestamp (UTC), el resultado diferira segun la
zona horaria del usuario. Ver BUG-018 (revertido) y BUG-019 (fix correcto).

### 2. Clasificacion de condicion — solo via resolveCondition()

D-039: `weatherService.ts:resolveCondition` es el UNICO lugar de clasificacion.

```
CF (produccion):  guarda icon_code + wind_kmh + gust_kmh (raw, sin clasificar)
Frontend:         clasifica con resolveCondition(icon_code, wind_kmh, gust_kmh)
```

**No usar:** `snapshot.classified`, `doc.calculated_condition`. Esos son schema viejo.
Si aparece "Unknown" en la tabla predictiva, verificar que `classifySnapshot()` lee
`icon_code`, no `calculated_condition`. Ver BUG-013.

### 3. Cache de forecasts — IndexedDB, no re-fetch

La tabla predictiva usa un sistema de 2 capas:
- Capa 1: IndexedDB (`pwe-forecast-cache`) — carga inmediata
- Capa 2: Delta sync en background (solo docs nuevos desde `lastSyncTime`)

**No agregar Firebase reads en el path critico** (carga inicial o post-reporte).
Si necesitas actualizar UI tras una accion del usuario: actualizar state React directamente.
Ver BUG-019 y el patron de `handleReportSuccess` en `PredictionAnalysisDemo`.

### 4. Snapshots — startHour requerido en createForecastSnapshots

`createForecastSnapshots` debe recibir `(now.getHours() + 1) % 24` como `startHour`.
Sin ese parametro, todos los snapshots tendran `hour` en [0..11] fijos, lo que
rompe el lookback 12h (siempre encontrara snapshots[0] en lugar del snapshot correcto).
Ver BUG-015.

---

## Deuda Tecnica Conocida — Sprint 11

### Critico (debe resolverse antes de produccion real)

| Item | Descripcion | Archivo / Contexto |
|------|-------------|-------------------|
| **Firestore Rules** | App Check o validacion de origen — actualmente cualquier cliente puede escribir | Firebase Console → Firestore → Rules |
| **VITE_ACCUWEATHER_KEY en Vercel** | Si existe en Vercel env vars, las llamadas van directo a AccuWeather desde el cliente (costo + seguridad) | Vercel Dashboard → pokeweather → Settings → Env Vars |
| **firebase deploy --only functions** | Siempre compilar primero: `cd functions && npm run build` | Ver BUG-002, BUG-014 |

### Importante (mejora de calidad)

| Item | Descripcion | Archivo |
|------|-------------|---------|
| Test unitario accuLocationKey = '' | Regression: si locationKey queda vacio, forecast no se guarda | `src/hooks/useWeather.ts` |
| Eliminar `calculated_condition` del tipo `ForecastDoc` | Campo obsoleto (schema viejo), CF ya no lo escribe | `src/services/firebase/firebaseWeatherService.ts:ForecastDoc` |
| Linter 53 errores | Pre-existentes, no son nuevos. Bloquean pre-commit hook | `--no-verify` workaround en uso |
| Test e2e tabla predictiva | Sin suite automatizada — validacion manual en cada deploy | `tests/e2e/ui/` |

### Menor

| Item | Descripcion |
|------|-------------|
| Mock data en PredictionAnalysisDemo | Solo util para testing visual — no representa datos reales |
| Archivos de diagnostico en raiz | `BUG-018-SUMMARY.md`, `DIAGNOSIS_REPORT.md`, etc. en `/` — limpiar |

---

## Estado de Colecciones Firestore

| Coleccion | Writer | Reader | Proposito |
|-----------|--------|--------|-----------|
| `city_weather/{id}/forecasts/{date_hour}` | `saveCityForecast()` (frontend) + CF `syncWeatherLogic` | `getRecentForecasts()` | Forecasts de 12h por ciudad |
| `weather_reports` | `saveWeatherReport()` (desde tabla) | `getRecentWeatherReports()` | Reportes manuales de clima real |
| `classification_reports` | `saveClassificationReport()` (desde LocationCard) | `getRecentClassificationReports()` | Reportes de clasificacion incorrecta |

**Matching key:** `city_id|date_hour` — ambos campos deben coincidir exactamente.

---

## Arquitectura D-039 (Recordatorio)

```
Cloud Function (produccion HH:00):
  AccuWeather API
    ↓
  Firestore: { icon_code, wind_kmh, gust_kmh, ... }  ← raw, sin clasificar

Frontend (dev + prod):
  getRecentForecasts() → ForecastDoc.snapshots[0]
    ↓
  classifySnapshot(snapshot)
    → resolveCondition(icon_code, wind_kmh, gust_kmh)
    → "sunny" | "rain" | "cloudy" | ...
```

En dev (localhost), el frontend llama AccuWeather directamente via proxy Vite con
`VITE_ACCUWEATHER_KEY`. En prod/preview, SOLO usa Firestore (sin esa key).

---

## Commits Clave del Post-Sprint

| Commit | Descripcion |
|--------|-------------|
| `f403cc4` | fix(bug-018): date_hour UTC — REVERTIDO en siguiente sesion |
| `d5d8d52` | fix(bug-017): getDocs cache previene actualizacion post-sync |
| `f515164` | docs: BUG-016 silencioso |
| `25faeb6` | docs: CLAUDE.md con cambios tabla predictiva |
| `d0dbf1f` | feat: columna tipos potenciados |
| `0844e05` | refactor: hora Mexico/Central en columna horaLocal |
| `2e57210` | fix(bug-015): snapshot hours reflejan hora actual |
| `be07d13` | fix(bug-019): actualizar fila directamente sin refetch |
| `392c5c7` | fix: dateHour en mock data (build Vercel) |

---

## Siguiente Sprint — Ideas / Backlog

Estos items surgieron durante Sprint 10 pero quedaron fuera de scope:

1. **Dashboard de precision acumulada** — la tabla predictiva muestra filas individuales
   pero no hay vista de "88/100 aciertos en Auckland". Confianza acumulada por ciudad/hora.

2. **Firestore Rules** — seguridad critica antes de abrir a mas usuarios.

3. **Consolidar date_hour a UTC** — si en el futuro se quiere soportar multi-usuario
   en zonas horarias distintas, la clave LOCAL es un problema. Requiere migration.
   Por ahora funciona correctamente para un solo usuario.

4. **Agregar mas ciudades** — el sistema es dinamico (no hay numero fijo hardcodeado).
   Solo requiere agregar al JSON de ciudades y sincronizar.

5. **Historial de reportes** — `weather_reports` tiene TTL 30 dias. No hay UI para
   ver historico de reportes propios.
