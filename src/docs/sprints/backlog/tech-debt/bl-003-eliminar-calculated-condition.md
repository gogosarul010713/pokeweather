# BL-003: Eliminar `calculated_condition` del Tipo ForecastDoc

**Prioridad:** 🟡 IMPORTANTE | **Tipo:** Tech Debt | **Estimación:** 1h | **Bloqueador:** D-039 Limpieza

---

## Problema

`calculated_condition` es un campo obsoleto del schema viejo en `ForecastDoc`. 

**Situación:**
- **CF (`syncWeatherLogic.ts`):** Escribe RAW (`icon_code`, `wind_kmh`, `gust_kmh`)
- **Frontend:** Lee raw y clasifica con `classifySnapshot()` → `resolveCondition()` (D-039)
- **Tipo `ForecastDoc`:** Aún contiene `calculated_condition: string` (línea 42)

**Confusión resultante:** 
- Nuevo dev ve `calculated_condition` en el tipo y piensa "este es el campo clasificado"
- Busca dónde se calcula y se pierde (no se calcula en CF, solo en frontend)
- BUG-013 fue causado por alguien usando `calculated_condition` en lugar de `classifySnapshot()`

---

## Solución

### Plan de Eliminación

1. **Auditar referencias** — Grep `calculated_condition` en toda la base de código
2. **Eliminar del tipo** — `ForecastDoc` interface en `firebaseWeatherService.ts:42`
3. **Actualizar docs** — D-039 en `decision-log.md` para enfatizar D-039

---

## Impacto

**Campos afectados:**
- `firebaseWeatherService.ts` line 42 — interface `ForecastDoc`

**Referencias esperadas (de Grep anterior):** 61 matches

**Desglose:**
- ~45 matches en docs (comentarios, explicaciones, archivos .md)
- ~16 matches en código

---

## Pasos de Implementación

### 1. Auditar Referencias en Código

```bash
grep -r "calculated_condition" src/ --include="*.ts" --include="*.tsx"
```

**Ubicaciones esperadas:**
- `firebaseWeatherService.ts` — definición en tipo
- `predictionAnalyticsService.ts` — si lo usaba (debería estar limpio)
- Posibles comentarios en otros archivos

### 2. Eliminar del Tipo

**Archivo:** `src/services/firebase/firebaseWeatherService.ts`

**Antes (línea 31-51):**
```typescript
export interface ForecastDoc {
  city_id: string
  // ...
  calculated_condition: string  // ← ELIMINAR
  timezone: number
  local_time_user: string
  ttl: Timestamp
  created_at: Timestamp
}
```

**Después:**
```typescript
export interface ForecastDoc {
  city_id: string
  // ...
  timezone: number
  local_time_user: string
  ttl: Timestamp
  created_at: Timestamp
}
```

### 3. Eliminar Valores que se Asignan

**Búsqueda:** `calculated_condition: ` en archivo de servicios

**Ubicación esperada:** `firebaseWeatherService.ts` línea ~120 en `saveCityForecast()`

```typescript
// ANTES
const forecastDoc: ForecastDoc = {
  // ...
  calculated_condition: classifySnapshot(snapshots[0]),  // ← ELIMINAR
  timezone,
  // ...
}

// DESPUÉS
const forecastDoc: ForecastDoc = {
  // ...
  timezone,
  // ...
}
```

### 4. Actualizar `predictionAnalyticsService.ts`

**Verificar que usa `classifySnapshot()`:**

```typescript
// CORRECTO (actual):
const classifiedCondition = classifySnapshot(forecast.snapshots[0])

// INCORRECTO (viejo):
const classifiedCondition = forecast.calculated_condition  // ← NO debe estar
```

Si encuentra la versión vieja, cambiar a `classifySnapshot()`.

### 5. Actualizar Decision Log

**Archivo:** `src/docs/architecture/11-decision-log.md`

Agregar entrada:

```markdown
### 2026-05-08 D-039.1 — Limpieza de Schema: Eliminar calculated_condition

**Contexto:** Campo obsoleto en ForecastDoc causaba confusión (BUG-013).

**Decisión:** Eliminar `calculated_condition` del tipo. CF escribe RAW, frontend clasifica.

**Cambio:** 
- Removido campo de `ForecastDoc` interface
- Enfatizado: `classifySnapshot()` es el ÚNICO lugar de clasificación
- Docs actualizadas

**Impacto:** Cero (campo no se usaba en prod, solo en tipo)
```

---

## Validación

### Grep Final

```bash
grep -r "calculated_condition" src/ --include="*.ts" --include="*.tsx"
# Resultado esperado: 0 matches en código
```

### TypeScript Compilation

```bash
npm run build
# Resultado esperado: 0 errores TS
```

### Tests Existentes

```bash
npm test
# Resultado esperado: todos pasan (sin cambios de lógica)
```

---

## Riesgos

🟢 **BAJO**

- Campo no se asigna en CF (solo en frontend)
- No se usa en lógica crítica
- Cambio es puramente de tipo

---

## Timeline

**Ejecución:** ~1 hora total
- Auditoría: 10 min
- Cambio código: 10 min
- Actualizar docs: 15 min
- Tests + validación: 15 min
- Buffer: 10 min

---

## Archivos Modificados

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `src/services/firebase/firebaseWeatherService.ts` | 42 | Eliminar field |
| `src/services/firebase/firebaseWeatherService.ts` | ~120 | Eliminar asignación |
| `src/docs/architecture/11-decision-log.md` | EOL | Agregar entrada D-039.1 |

---

## Referencias

- BUG-013: [bug-013-prediction-table-unknown-condition.md](../../sprint-10/bugfixes/bug-013-prediction-table-unknown-condition.md)
- D-039: [decision-log.md](../../architecture/11-decision-log.md) — clasificación
- Handoff: [07-handoff-sprint-11.md#2-clasificacion-de-condicion-solo-via-resolvecondition](../../sprint-10/07-handoff-sprint-11.md)

---

**Después completar:** Commit con `fix(schema): eliminar calculated_condition obsoleto`

