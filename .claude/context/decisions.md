# 📚 Log de Decisiones de Arquitectura — Pokémon Weather Explorer

> Registro permanente de decisiones técnicas. Nunca borrar entradas, solo agregar.
> Más recientes primero.

---

### 2026-04-21 D-019 — Lectura Optimizada de Climas: IndexedDB Primero (US-1104)

**Contexto:** US-1104 implementada. Refactorizar flujo de lectura de climas para mejorar latencia.

**Decisión:** Implementar lectura en 2 capas sin sync background si caché está fresco
- **CAPA 1:** IndexedDB lookup por `accuLocationKey` (40ms)
- **CAPA 2:** Firestore fallback si caché expirado (300-500ms)
- **Diferencia vs antes:** Sin sincronización background cuando caché está fresco

**Motivo:**
1. Latencia crítica: 40ms vs 370ms promedio (antes)
2. Offline-first: funciona con caché stale
3. Simplifica lógica: cache fresco = mostrar y FIN

**Implementación:**
- Nueva función `getWeatherFromFirestore(cityId)` en firebaseWeatherService.ts
- Refactor `loadCitiesFromCache()` en useWeather.ts con lógica 2 capas
- Usa `accuLocationKey` como clave (no city.id ni s2Key)

**Consecuencias:**
- -100ms latencia promedio si caché fresco
- Zero sync background si datos frescos
- Fallback a Firestore si expirado

**US relacionada:** US-1104

---

### 2026-04-21 D-020 — Delta Sync Incremental para Tabla Predictiva (US-1105)

**Contexto:** US-1105 implementada. Optimizar lectura de tabla de predicciones.

**Decisión:** Implementar delta sync en background, solo si hay nuevos docs

**Lógica:**
- **Mostrar:** caché local inmediato (40ms)
- **Verificar:** query delta `WHERE created_at > lastSyncTime`
- **Sincronizar:** solo si `newDocs.length > 0` (evitar queries innecesarias)
- **Mergear:** dedup por `city_id + date_hour`

**Motivo:**
1. Ahorro Firestore: -99% reads si sin cambios (~15,700 reads evitados)
2. Latencia: 500-800ms → 40ms (92% mejora)
3. No bloqueante: delta sync en background

**Implementación:**
- Metadata helpers en cacheService.ts: `getPredictionsCacheMetadata()`, `setPredictionsCacheMetadata()`, `isPredictionsCacheValid()`
- Refactor PredictionAnalysisDemo.tsx con 2 capas + delta sync async
- Reusa `getRecentForecasts(timeRange, since)` con param `since` para delta

**Consecuencias:**
- Cache hit: 40ms
- Cache miss: <1s (primera carga)
- Delta sync: <300ms (silencioso)
- Storage IndexedDB: ~60min TTL para tabla

**US relacionada:** US-1105

---

### 2026-04-21 D-018 — Herramientas Autónomas para Consultar Datos (No guardar docs sin snapshots)

**Contexto:** US-1008 validación. Se detectó que 80 documentos (53%) se guardan con todos los campos NULL.

**Problema:**
- `firebaseWeatherService.ts` línea 99-101: guarda incluso cuando `snapshots.length === 0`
- Estos son "cache-hit geoespacial" — cuando múltiples ciudades comparten locationKey
- Ocupan 53% del espacio en Firestore sin valor útil
- Contaminan BigQuery y fuerzan a filtrar en cada query

**Opciones consideradas:**
- A: Guardar con flag `is_cache_hit: true` y filtrar en queries
- B: NO guardar si `snapshots.length === 0` ← **ELEGIDA**
- C: Guardar pero marcar como "transient" (TTL 1h en lugar de 7d)

**Decisión:** Opción B — NO guardar documentos sin snapshots

**Motivo:**
1. Si no hay snapshots, no hay predicción válida — datos sin valor
2. Simplifica queries (sin necesidad de filtrar)
3. Reduce Firestore writes (~50% menos)
4. Reduce BigQuery storage
5. Mantiene coherencia: documentos = predicciones válidas

**Implementación (próximo):**
- Modificar `firebaseWeatherService.ts` línea 77-99
- Agregar early return: `if (snapshots.length === 0) return`
- Limpiar documentos viejos con: `npm run clean:firestore -- --only-null`

**Consecuencias:**
- No hay datos "fantasma" en Firestore
- Tablas y reportes solo muestran predicciones válidas
- Queries a BigQuery más rápidas (sin NULL filtering)

**US relacionada:** US-1008 (validación)

---

### 2026-04-20 D-017 — Arquitectura Delta Sync con IndexedDB (US-1008)

**Contexto:** Sprint 10. Optimización Firestore. Problema: Query 1 trae 100 docs, Query 2 con 10 nuevos vuelve a traer los 100 viejos.

**Problema:**
- getRecentForecasts('24h') sin filtro → 100 reads cada vez
- Pronósticos nuevos: ~100-200 docs/mes
- Siguiente consulta: re-descarga todos (ineficiente)

**Opciones consideradas:**
- A: Traer todo + deduplicar en cliente
  - Ventaja: Simple
  - Desventaja: Network O(n) siempre, ineficiente
- B: Delta sync inteligente ← **ELEGIDA**
  - Query: `where created_at > lastSyncTimestamp` en Firestore
  - IndexedDB con tabla `forecasts_index` (O(1) lookup)
  - TTL automático (7d+1h margin)
  - Ventaja: Network O(delta), O(1) deduplicación, sync incremental
  - Desventaja: +1 tabla IndexedDB, lógica merge más compleja (justificada)

**Decisión:** Opción B — Delta Sync

**Motivo:**
1. **Red eficiente:** Query delta reduce payload 90% (10 docs vs 100)
2. **Storage local:** IndexedDB índice = O(1) deduplicación vs O(n)
3. **TTL automático:** Similar a Firestore, eventual consistency OK
4. **Zero breaking changes:** Servicios existentes no se tocan

**Implementación (4 subtareas):**
- A: Agregar `since` param a getRecentForecasts()
- B: Expandir cacheService con forecasts_index
- C: syncFirestoreToCache() orquesta flujo completo
- D: Tests unitarios + integración + validación manual

**Decisiones sub-arquitectónicas:**
1. **Query field:** `created_at` (inmutable) vs `updated_at` → created_at
2. **IndexedDB:** tabla separada (permite índices) vs idb-keyval → tabla separada
3. **Timestamp lastSync:** localStorage vs IndexedDB → localStorage (lectura rápida)
4. **Sync trigger:** Automático en app load vs manual → Automático
5. **Conflictos:** TTL local respeta TTL Firestore + 1h margin → eventual consistency

**Consecuencias:**
- Firestore cost: reducido ~90% en consultas incrementales
- Latencia: <500ms sync (query ~200ms + IndexedDB ops ~100ms)
- Storage: <50MB IndexedDB (100 ciudades × 100 docs)
- Complexity: +~400 líneas de código (cacheService expandido + tests)

**US relacionada:** US-1008 (8 SP, 4 subtareas)

---

### 2026-04-19 D-016 — Guardar local_time_user en ForecastDoc (US-1007)

**Contexto:** US-1007. Tabla de predicciones necesitaba mostrar "¿A qué hora LOCAL del usuario se obtuvo el pronóstico?"

**Problema:** 
- getLocalMachineTime() calculaba en tiempo real → siempre mostraba hora actual
- Necesitábamos saber la hora EXACTA cuando se obtuvieron los datos

**Opciones consideradas:**
- A: Calcular dinámicamente en tabla (mostrar hora actual siempre) ← RECHAZADO
- B: Guardar hora local en Firestore cuando se obtienen datos ← **ELEGIDA**

**Decisión:** Opción B — Persistir local_time_user en ForecastDoc

**Motivo:**
1. Auditoría: saber exactamente cuándo (hora local) se obtuvo cada pronóstico
2. Análisis histórico: comparar patrones por hora del usuario
3. Consistencia: valor no cambia con el tiempo

**Implementación:**
- `ForecastDoc.local_time_user: string` (formato DD/MM HH:MM)
- `getLocalTimeUser()` calcula en cliente cuando se guarda
- `PredictionRow.localTimeUser` usa valor persistente
- Tabla muestra valor guardado + permite filtro/ordenamiento

**Consecuencias:**
- Documentos viejos necesitan cleanup (no tienen `local_time_user`)
- Primer uso requiere: `npm run clean:firestore -- --only-city`
- Nuevos documentos tendrán valor persistente

**US relacionada:** US-1007

---

### 2026-04-19 D-015 — ForecastDoc: Guardar calculated_condition por separado

**Contexto:** US-1007. PredictionAnalysisTable necesitaba comparar predicción vs realidad. Decisión: cómo guardar la predicción para facilitar validación manual.

**Problema:** 
- ForecastDoc.snapshots[] contiene 12 horas
- snapshots[0] es la predicción "actual" (mostrada al usuario)
- Necesitábamos acceso rápido a qué se predijo (sin buscar en array)

**Opciones consideradas:**
- A: Guardar solo snapshots[0] (perder histórico de 12h)
- B: Guardar todos los snapshots + extraer snapshots[0] al leer (lento)
- C: Guardar calculated_condition por separado + todos los snapshots ← **ELEGIDA**

**Decisión:** Opción C — Campo `calculated_condition` redundante pero optimizado

**Motivo:**
1. Acceso O(1) a la predicción mostrada
2. Mantiene 12 snapshots para lookback histórico
3. Simplifica comparación: calculated_condition === report.should_be
4. BigQuery puede indexar rápidamente por precisión

**Implementación:**
- ForecastDoc: `calculated_condition: string` (de snapshots[0].classified)
- PredictionAnalysisTable: muestra 1 fila por ForecastDoc (no por snapshot)
- Lookback: busca snapshots anteriores para misma hora

**Consecuencias:**
- +1 campo en ForecastDoc (negligible storage)
- Tabla ahora muestra 2 filas/día en lugar de 24 (antes era 12 por snapshot)
- Validación manual más clara (calculated vs actual)

**US relacionada:** US-1007

---

---

### 2026-04-13 D-009 — Eliminación de tabs obsoletos en TestingTools (-120 KB bundle)

**Contexto:** US-902. TestingTools tenía 3 tabs que se volvieron obsoletos con Firebase Report + Metabase.

**Opciones consideradas:**
- A: Mantener tabs para backwards compatibility / debugging
- B: Eliminar tabs obsoletos y reducir bundle size
- C: Mover tabs a herramienta externa separada

**Decisión:** Opción B — Eliminar completamente

**Motivo:** 
1. Firebase Report reemplaza HistoryGrid (validación en Firestore)
2. Metabase Dashboard reemplaza PrecisionMetrics (análisis superior)
3. Firebase Console reemplaza CachePanel (debugging remoto)
4. Reducción de bundle: -120 KB (-8%)
5. Cero impacto en funcionalidad crítica (useWeather.ts mantiene funciones)

**Implementación:**
- Eliminados 8 archivos (5 componentes + 3 utilidades)
- Refactorizados 4 archivos (TestingTools, weatherHistoryService, Header, App)
- ~3,000 líneas de código muerto removido
- Build compila sin errores

**Consecuencias:** 
- TestingTools solo tiene tab "Reportes"
- Análisis de precisión migra a Dashboard Metabase (US-902-B)
- API weatherHistoryService simplificada (mantiene funciones críticas)

**US relacionada:** US-902

---

### 2026-04-08 D-005 — Eliminación de guardado duplicado en Firestore (-50% writes)

**Contexto:** US-801. Se detectó que `useWeather.ts` y `batchWeatherService.ts` guardaban el mismo forecast en Firestore, duplicando writes innecesariamente.

**Opciones consideradas:**
- A: Mantener ambos puntos de guardado con deduplicación por timestamp
- B: Centralizar guardado solo en `batchWeatherService.ts` y remover de `useWeather.ts`

**Decisión:** Opción B

**Motivo:** Centralizar en el batch service es más limpio y predecible. El hook no debe tener responsabilidad de persistencia, solo de estado UI. Resultado: 50% reducción de writes.

**Consecuencias:** `useWeather.ts` no guarda en Firestore. Toda persistencia pasa por `batchWeatherService.ts`.

**US relacionada:** US-801

---

### 2026-04-08 D-004 — Catálogo estático en Firestore con fallback hardcodeado

**Contexto:** US-802. El catálogo de condiciones climáticas (7 estados, mappings a tipos Pokémon, reglas WINDY) se necesitaba en un lugar centralizado y actualizable sin deploy.

**Opciones consideradas:**
- A: Mantener catálogo solo en código (constants.ts)
- B: Mover catálogo a Firestore con fallback hardcodeado si offline
- C: Mover catálogo a Firestore sin fallback

**Decisión:** Opción B

**Motivo:** Firestore permite actualizar el catálogo sin redeploy. El fallback garantiza que la app funcione offline o si Firestore tiene problemas. Singleton cache evita reads excesivos.

**Consecuencias:** `weatherCatalogService.ts` es el único punto de verdad para el catálogo. El catálogo hardcodeado en código es solo fallback de emergencia.

**US relacionada:** US-802

---

### 2026-04-08 D-003 — Schema Firestore: snapshots cada 12h con TTL 7 días

**Contexto:** US-801. Definición del schema de persistencia de pronósticos.

**Opciones consideradas:**
- A: Un documento por ciudad con array de forecasts
- B: Subcolección: `/city_weather/{city_id}/forecasts/{YYYY-MM-DD-HH}`
- C: Colección plana con city_id como campo

**Decisión:** Opción B (subcolección)

**Motivo:** Subcolecciones permiten queries eficientes por ciudad sin cargar todos los datos. El ID `YYYY-MM-DD-HH` garantiza idempotencia y facilita TTL por documento.

**Consecuencias:** Queries siempre filtran por `city_id` primero. TTL se implementa como campo `expires_at: Timestamp` (US-806 lo limpiará con auto-delete).

**US relacionada:** US-801, US-806

---

### 2026-04-08 D-002 — Firebase como backend de persistencia (v2.0.0-alpha)

**Contexto:** Inicio Sprint 8. La v1.0.0 usa solo IndexedDB + AccuWeather. Se evalúa agregar persistencia cloud para analytics y dashboard de precisión.

**Opciones consideradas:**
- A: Supabase (PostgreSQL)
- B: Firebase/Firestore
- C: Backend propio (Node + DB)

**Decisión:** Opción B — Firebase/Firestore

**Motivo:** Integración directa desde React sin backend propio. SDK bien soportado con Vite. Free tier suficiente para el volumen del proyecto (~2,256 writes/día = 11.3% quota). Real-time listeners útiles para dashboard.

**Consecuencias:** Dependencia de Firebase SDK. Credenciales en `.env.local` (nunca commitear). v1.0.0-stable en `main` no se toca — todo en rama `refactor/firebase-v2`.

**US relacionada:** US-804

---

### Sprint 7 D-001 — Bottom Sheet con Portal para escapar overflow:hidden del mapa

**Contexto:** US-706. El Bottom Sheet en mobile quedaba oculto por el `overflow:hidden` de `#root` necesario para Leaflet.

**Opciones consideradas:**
- A: Cambiar overflow de #root (rompería el mapa)
- B: Renderizar Bottom Sheet via React Portal fuera de #root
- C: Usar position:fixed con z-index muy alto sin portal

**Decisión:** Opción B — React Portal

**Motivo:** Portal escapa la jerarquía del DOM sin afectar el overflow del mapa. Z-index 1001 garantiza visibilidad sobre Leaflet (z-index 1000). Solución limpia sin efectos secundarios.

**Consecuencias:** El Bottom Sheet se renderiza en `document.body`. Z-index hierarchy: Leaflet=1000, BottomSheet=1001. Ver regla crítica en CLAUDE.md sobre z-index.

**US relacionada:** US-706

---

### 2026-04-12 D-007 — Plan Blaze obligatorio para TTL Policies en Firestore (US-806)

**Contexto:** US-806. Se necesitaba implementar auto-delete de documentos > 7 días usando TTL de Firestore.

**Hallazgo:** Spark (free tier) no permite crear TTL Policies. Solo Blaze (pago por uso) lo permite.

**Opciones consideradas:**
- A: No usar TTL, documentos se quedan indefinidamente
- B: TTL manual en código con Cloud Functions (requiere Blaze igual)
- C: Activar Blaze y usar TTL nativo de Firestore

**Decisión:** Opción C — Blaze + TTL Firestore

**Motivo:** TTL nativo es más eficiente que código custom. Blaze en free tier mantiene costo en $0 si uso se mantiene bajo (estamos en 11.3% de quota). TTL automático es "set and forget".

**Impacto financiero:** $0 adicionales (free tier Blaze incluye 1M reads, 1M writes, 100GB storage). Nuestro uso: ~68K writes/mes = bien dentro del límite.

**Consecuencias:** Facturación habilitada pero sin cargo. TTL Policy activa en Firestore. Documentos con `ttl <= now()` se eliminan automáticamente (eventual, hasta 24h de demora).

**US relacionada:** US-806

---

### 2026-04-11 D-006 — Omitir campos undefined en ClassificationReport para evitar Firestore error

**Contexto:** US-805. Al guardar reporte de clasificación, Firestore rechazaba campos con valor `undefined`.

**Problema:** Intentaba guardar `raw_condition_code: (city as any).conditionCode` → undefined. Firestore no permite `undefined` en documentos.

**Opciones consideradas:**
- A: Asignar valores por defecto (0, "", null)
- B: Omitir campos que no existen en City interface
- C: Cambiar la interface ClassificationReport para hacerlos opcionales

**Decisión:** Opción B — Omitir campos

**Motivo:** `City` interface no tiene `conditionCode`, `conditionText`, `precipitationMm`. No tiene sentido agregar valores ficticios. Mejor removerlos de la estructura.

**Consecuencias:** ClassificationReport solo guarda campos que realmente existen en City: `temperature_c` (tempC), `wind_kmh` (windKmh). Interface actualizada para reflejar campos reales.

**US relacionada:** US-805

---

### 2026-04-13 D-008 — Lazy Singleton + Dynamic Imports para Firebase SDK (US-901)

**Contexto:** US-901. Firebase SDK agregaba 890 KB al bundle principal (15% de 1.7 MB). Se necesitaba optimización sin perder funcionalidad.

**Opciones consideradas:**
- A: Code-splitting per-service (3 dynamic imports separados)
- B: Lazy Singleton in firebaseConfig (1 entry point) ← **ELEGIDA**
- C: Component-level lazy load (máxima laziness)

**Decisión:** Opción B — Lazy Singleton Pattern

**Motivo:** 
1. Un único punto de entrada (`getDb()`) evita race conditions
2. Firebase se carga en primer acceso, no al módulo load
3. Interfaz de exports mantiene compatibilidad
4. Vite/Rollup auto-optimiza sin cambios de config

**Implementación:**
- `firebaseConfig.ts`: `ensureInitialized()` + `getDb()` helpers
- Todos los servicios: `await getDb()` antes de usar db
- Dynamic imports de funciones Firestore dentro de cada función async
- Tipos importados estáticamente (no afectan bundle)

**Resultado:** 
- Bundle: 1,771 KB → 1,501 KB (15% reducción)
- Gzip: 489 KB → 411 KB (16% reducción)
- Zero regressions (validado con Playwright)
- Firebase lazy-loads en primer uso (esperado)

**Consecuencias:** Funciones Firebase ahora son async. Callers deben `await`. No afecta a `batchWeatherService` (ya era async-friendly).

**US relacionada:** US-901

---

### 2026-04-19 D-014 — Timestamp Forecast: Redondear a siguiente hora completa

**Contexto:** US-1007 validación de datos. Usuario reportó que los timestamps guardados eran la "siguiente hora", no la hora de consulta.

**Problema:** 
- App consulta AccuWeather a las 9:34 PM → guardaba timestamp como "21:00"
- Pero AccuWeather pronósticos son PARA la siguiente hora (10:00 PM, 11:00 PM, ..., 10:00 AM)
- Mismatch: documento "21:00" contiene pronósticos que son para "22:00-09:00"

**Decisión:** Redondear timestamp a siguiente hora completa ANTES de guardar

**Motivo:** Los pronósticos de AccuWeather son inherentemente para "las próximas 12 horas" desde una hora puntual. Para coherencia:
- Consulta 9:34 PM → guardar como 2026-04-19-22 (siguiente hora)
- Snapshots: [22:00, 23:00, 00:00, ..., 09:00] ahora tienen sentido

**Implementación:** `firebaseWeatherService.ts` línea 81-86
```typescript
const nextHour = new Date(now)
nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
const dateHour = formatDateHour(nextHour)
```

**Validación pendiente:** Después de 1 ciclo de datos con fix, ejecutar `npm run validate:forecast-schema` para confirmar estructura.

**US relacionada:** US-1007, commit 93bf4b2

---

### 2026-04-18 D-013 — PredictionAnalysisTable: Adopción TanStack Table v8 (US-1007 v3)

**Contexto:** La tabla custom de US-1007 tenía bug de paginación (botones [1,1,1,2,3]) y carecía de features críticas: filtrado por columna, búsqueda global, page size configurable, navegación primera/última página.

**Problema con tabla custom:**
- Bug paginación: `Math.max(1, safePage - 2 + i)` → generaba páginas duplicadas en inicio
- Ordenamiento solo dentro de la página actual (no del dataset completo)
- Sin filtros por columna ni búsqueda global
- Paginación fija en 20 filas sin opción de cambio
- Sin botones primera / última página

**Opciones evaluadas:**

| Librería | Bundle | Headless | React 19 | Features | Veredicto |
|----------|--------|----------|----------|----------|-----------|
| TanStack Table v8 | ~15KB | ✅ | ✅ | Todas | ✅ ELEGIDA |
| AG Grid Community | ~300KB | ❌ | Parcial | Todas | ❌ Bundle regresión |
| Material React Table | +300KB | ❌ | ❌ | Todas | ❌ Trae MUI |
| react-data-grid | ~37KB | Parcial | ✅ | Sin paginación | ❌ Incompleta |

**Decisión:** TanStack Table v8 (`@tanstack/react-table@8.21.3`)

**Motivo:**
1. **Headless:** cero estilos propios → 100% compatible con el design system del proyecto (CSS vars, prefijo `.pat-`)
2. **Bundle minimal:** ~15KB vs Sprint 9 que ya optimizó el bundle (-15%). No regresar.
3. **React 19 compatible:** verificado con Vite 8 build sin warnings
4. **Features completas con una sola librería:** `getFilteredRowModel` (global + columna), `getSortedRowModel`, `getPaginationRowModel`
5. **TypeScript first:** tipos perfectos, sin casteos

**Implementación:**
- `src/components/Analytics/PredictionAnalysisTable.tsx` — reescrito con `useReactTable`
- Columnas definidas con `createColumnHelper<PredictionRow>()`
- `filterFn` custom en columnas con condiciones climáticas (busca por label legible, no por clave interna)
- `sortingFn` custom en columna `correct` (null < false < true)
- Lookback expandible preservado intacto via `columnHelper.display`
- CSS mantenido en `<style>` tag (regla del proyecto)

**Resultado:**
- Build: ✅ 979ms, sin errores TS
- Features: búsqueda global, filtros por columna, sort completo, pageSize 10/20/50/100, `««` primera y `»»` última
- Export CSV/JSON ahora exporta filas **filtradas** (mejora UX)

**Consecuencias:**
- `@tanstack/react-table` en `dependencies` (runtime, no devDep)
- Tabla custom eliminada (~380 líneas) → nueva implementación (~350 líneas)
- Mismo API público: `<PredictionAnalysisTable rows={...} title="..." />`

**US relacionada:** US-1007 v3

---

### 2026-04-18 D-012 — PredictionAnalysisTable: Restructure con condiciones climáticas (US-1007 Revisión)

**Contexto:** Revisión de observaciones de tabla. Clarificación crítica: `prediction` y `actual` son **condiciones climáticas**, no tipos Pokémon.

**Decisiones tomadas:**

1. **Campos son condiciones climáticas:** `prediction` y `actual` = "sunny", "rain", "cloudy", etc. (no tipos Pokémon)
   - Mapeo: condición → icono + label desde `WEATHER_IMAGES`, `CONDITION_LABEL`, `CONDITION_COLORS`
   - Impacto: Cambio en `PredictionRow` interface (strings climáticos)

2. **Confianza removida de tabla (por ahora):**
   - Razón: Confianza significativa es por acumulación (88/100 en Auckland), no por row individual
   - Confianza acumulada: future dashboard
   - Actual: Quitar columna "Confianza" de tabla
   - Documentación: Agregar nota en US-1007 para future work

3. **Lookback 3-filas con solo verde en aciertos:**
   - Fila 1: Hora (HH:MM UTC)
   - Fila 2: Cuánto hace (-Xh)
   - Fila 3: Icono clima + label + ✓ (solo si wouldBeCorrect=true)
   - Color: Verde solo si acierto, gris/sin cambio si fallo

4. **Ordenamiento por página (20 filas cliente-side):**
   - Alcance: Sort de la página actual (20 filas), no tabla completa
   - Evento: Click en header columna → alterna asc ↔ desc
   - Performance: O(20 log 20) ≈ 86 ops, negligible
   - Columnas ordenables: Hora, Ciudad, Predicción, Real, Resultado
   - No ordenable: Lookback (siempre igual)

5. **Validación Firestore (gcloud):**
   - R1: Usar `bq query` para verificar estructura real en BigQuery
   - Si estructura ≠ esperada: Proponer cambio de esquema
   - Punto crítico: ¿`classified_condition` es confiable como "condición climática"?

**Motivo:**
- Condiciones climáticas son la fuente real de datos (AccuWeather)
- Tipos Pokémon son derivados (mapping posterior)
- Tabla es para debugging/análisis de predicción de clima, no de tipos

**Consecuencias:**
- Interface `PredictionRow`: `prediction: string` (condición) + `actual: string | null` (condición o "Sin datos")
- `LookbackItem`: `condition: string` (condición climática), no `pokemonType`
- Columna "Confianza" desaparece (será reintroducida en dashboard agregado)
- Renderizado: Requiere helpers `WEATHER_IMAGES[condition]`, `CONDITION_LABEL[condition]`, `CONDITION_COLORS[condition]`

**US relacionada:** US-1007

---

### 2026-04-18 D-011 — PredictionAnalysisTable: Debugging vs. BI Tools (US-1007)

**Contexto:** Sprint 10. Dashboard Looker Studio MVP en progreso. Necesidad paralela: análisis táctico de predicciones fallidas con "lookback 12h".

**Opción A:** Agregar a Looker Studio (mismo BI tool)
- Ventaja: Consistencia visual
- Desventaja: Lookback complejo en Looker, UX mejor en React

**Opción B:** Componente React custom (elegida ← **ELEGIDA**)
- Ventaja: Lookup expandible, UX óptima, sin nuevas librerías
- Desventaja: Separate from BI dashboards, pero cumple propósito diferente

**Decisión:** Opción B — Componente React

**Motivo:**
1. Propósito diferente: Looker = estratégico (métricas), React = táctico (debugging)
2. UX lookback inline mejor que Looker
3. Sin nuevas deps (solo React built-in)
4. Datos ya en BigQuery (snapshots_flat)
5. Mock HTML referencia facilita implementación rápida

**Implementación:**
- `src/components/Analytics/PredictionAnalysisTable.tsx` (360 líneas, self-contained)
- Tipos Pokémon: uso de vars CSS existentes (--type-X)
- Paginación nativa (20/page)
- Export CSV + Copy JSON
- Filas expandibles con lookback panel

**Consecuencias:**
- Dos dashboards en App: Looker (BI) + React (debugging)
- Lookback es feature única, no competidor a Looker
- Próximo: Integración en TestingTools o ruta `/analytics`

**US relacionada:** US-1007

---

<!-- Agrega nuevas decisiones aquí, más recientes primero -->
