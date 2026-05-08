# BUG-011: Reportes Sobreviven al Cascade Delete (Session 17)

**Sprint:** 10 (Ampliacion)
**US Afectada:** US-1109 — Limpieza Cascade incluye Reports
**Fecha Descubierta:** 2026-04-25 (Session 17)
**Status:** ✅ RESUELTO — Documentado para implementacion en US-1109

---

## Sintoma Reportado

**Flujo Problematico:**
1. Usuario ejecuta Cascade Delete (`/city_weather`) + Reset IndexedDB
2. Firestore confirma: `city_weather` eliminado
3. App reconsulta AccuWeather — nuevos ForecastDocs creados correctamente
4. **PROBLEMA:** Tabla predictiva muestra columna "Real" con datos asociados en los nuevos docs
5. Se esperaba tabla limpia (sin reportes asociados a datos frescos)

**Verificacion Manual:**
- Cascade delete elimino `city_weather` completo ✅
- `weather_reports` y `classification_reports`: intactos en Firestore ❌ (no limpiados)
- Nuevos ForecastDocs generados con mismo `date_hour` que reportes existentes → match automatico

**Severidad:** Medio (confunde validacion — muestra datos como "confirmados" sin serlo)

---

## Root Cause Diagnostico (Analista SR)

### Flujo Tecnico del Problema

```
T1: User reporta clima
    → weather_reports.add({ city_id: "tokyo", date_hour: "2026-04-25-15", reported_condition: "rain" })

T2: Cascade Delete ejecutado
    → /city_weather ELIMINADO
    → weather_reports: INTACTO (no incluido en cascade delete)
    → classification_reports: INTACTO (no incluido en cascade delete)

T3: App reconsulta AccuWeather (misma hora)
    → saveCityForecast("tokyo") → date_hour = "2026-04-25-15"
       (mismo date_hour porque es la misma hora local actual)

T4: fetchPredictions()
    → weatherReports = getRecentWeatherReports(24)
    → reportIndex.get("tokyo|2026-04-25-15") = { should_be: "rain" }  ← del T1
    → Nuevo ForecastDoc en T3 asociado al reporte de T1
    → Columna "Real" aparece como "rain" en datos supuestamente frescos
```

### Por que Coinciden las Claves

La funcion `saveWeatherReport()` usa la misma formula de `date_hour` que `saveCityForecast()`:
```
date_hour = hora LOCAL actual + 1 (redondeo a hora siguiente)
```

Si el cleanup y la reconsulta ocurren en la misma hora del dia, ambos generan el mismo `date_hour`.
Resultado: el reporte del ciclo anterior "contamina" la nueva sesion de datos.

### Opciones de Solucion Evaluadas

| Opcion | Descripcion | Ventaja | Desventaja |
|--------|-------------|---------|------------|
| **A** | Agregar opcion separada para borrar reports | Control granular | UX mas compleja, user puede olvidar activarla |
| **B** | Incluir reports en Cascade Delete automaticamente | Simple, intuitivo | Elimina reportes sin aviso extra |
| **C** | Warning informativo en tabla (sin borrar) | No destructivo | No resuelve el problema, solo informa |

### Decision: Opcion B — Incluir en Cascade Delete

**Justificacion del usuario:** Sin la fuente de verdad (ForecastDoc), los reportes son datos huerfanos.
Un reporte que dice "el clima real era nublado" no sirve si no hay forecast contra el cual compararlo.
La relacion es: `report.city_id + report.date_hour` → debe existir un ForecastDoc equivalente.
Si el ForecastDoc no existe, el reporte pierde todo su valor analitico.

**Por tanto:** Cascade Delete de `/city_weather` incluye automaticamente el borrado de
`weather_reports` y `classification_reports`. Es la semantica correcta de "limpiar todo".

---

## Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `src/services/cleanup/cleanupService.ts` | `CleanupCounts` +`reportsDocs` + `fetchCleanupCounts()` query reports + `executeCleanup()` borrado reports |
| `src/components/TestingTools/CleanupPanel.tsx` | Count de reports en descripcion de Cascade Delete |
| `functions/src/index.ts` | Cloud Function `clearFirestoreData` + parametro `clearReports: boolean` + borrado de ambas colecciones |

---

## Solucion Implementada

Ver US-1109: `16-US-1109-ClearReportsOnCleanup.md`

---

**Sesion:** 17 | **US:** US-1109
**Usuario:** Geovanny M | **Rama:** sprint-10
