# US-1105: Firebase as Cache — Tabla Predictiva (Delta Sync)

**Sprint:** 10 (Ampliación, Fase 3)  
**Story Points:** 3-4 SP (análisis + implementación)  
**Prioridad:** 🔵 Media (refactorización de arquitectura)  
**Estado:** ⏳ Documentación Fase 2 (Tabla Predictiva solamente)  
**Rama:** `sprint-10`

---

## 📋 Descripción

Refactorizar el flujo de **tabla predictiva** para que use **Delta Sync incremental** desde Firestore, manteniendo **IndexedDB como caché local**.

**Cambio arquitectónico:**
- **Antes:** Cargar TODA la tabla desde Firestore cada vez
- **Después:** Cargar SOLO documentos nuevos desde última sincronización, mergear con cache, mostrar tabla actualizada

**Objetivo:** Optimizar lectura de tabla (evitar cargar 264+ docs si solo hay 12 nuevos), mantener latencia aceptable.

---

## 🔄 Arquitectura Propuesta: Tabla Predictiva

### Estructura de Datos (Firestore)

```
/city_weather/{city_id}/
  └── forecasts/  (colección)
      ├── 2026-04-10-21  ← Documento (YYYY-MM-DD-HH)
      │   └── snapshots: ForecastSnapshot[] (12 elementos)
      │       └── created_at: Timestamp (2026-04-10 21:00)
      │
      ├── 2026-04-15-03  ← Documento nuevo
      │   └── snapshots: ForecastSnapshot[]
      │       └── created_at: Timestamp (2026-04-15 03:00)
      │
      └── 2026-04-21-14  ← Documento NUEVO (hoy)
          └── snapshots: ForecastSnapshot[]
              └── created_at: Timestamp (2026-04-21 14:00)
```

**Incremento típico:**
- Cada 60 minutos: AccuWeather → Firestore crea 1 nuevo documento por ciudad
- 94 ciudades → 94 nuevos documentos/hora
- En 7 días (TTL) → ~16,000 documentos totales en Firestore
- Tabla muestra: últimos X días (configurable, ej: 7 días)

---

### Diagrama de Flujo

```
┌────────────────────────────────────────────────────────┐
│ USUARIO ABRE TABLA PREDICTIVA                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Usuario hace click: "📊 Predicciones" en TestingTools│
│       ↓                                                │
│  ¿Hay datos en IndexedDB cache?                       │
│       ├─ SÍ (completo, <60 min)                       │
│       │     → Mostrar tabla INMEDIATO (40ms) ✅        │
│       │     → Verificar si hay NUEVOS en Firestore     │
│       │     → Si hay nuevos:                           │
│       │        - Obtener delta (WHERE created_at > ts)│
│       │        - Mergear con cache                     │
│       │        - Actualizar tabla (refresh silencioso) │
│       │                                                │
│       └─ NO (expirado o no existe)                    │
│             → Obtener TODOS de Firestore               │
│             → Guardar en cache                         │
│             → Mostrar tabla                            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Cambios Técnicos

### Cambio 1: Lectura Inicial (PredictionAnalysisTable.tsx)

**Antes:**
```typescript
// Carga tabla: obtiene TODOS los snapshots de Firestore
const predictions = await getRecentForecasts()  // Query sin filtro
// Retorna: todos los docs desde hace X días
```

**Después:**
```typescript
const loadPredictionTableWithDeltaSync = async (): Promise<PredictionRow[]> => {
  // CAPA 1: Caché local (40ms)
  const cached = await getCachedPredictions()
  
  if (cached && isValid(cached)) {
    // Mostrar tabla inmediato
    setPredictionRows(generateTableRows(cached.documents))
    
    // CAPA 2: Delta sync en background (no bloquea)
    loadDeltaAndUpdate(cached.lastSyncTime)
  } else {
    // CAPA 2: Primera carga o cache expirado
    const allDocs = await getRecentForecasts()
    const rows = generateTableRows(allDocs)
    
    // Guardar en cache
    await cachePredictions(allDocs)
    
    setPredictionRows(rows)
  }
}
```

---

### Cambio 2: Delta Sync (Background)

```typescript
const loadDeltaAndUpdate = async (lastSyncTime: number) => {
  // QUERY DELTA: solo documentos nuevos desde última sincronización
  const newDocs = await query(
    collectionGroup(db, 'forecasts'),
    where('created_at', '>', Timestamp.fromMillis(lastSyncTime)),
    orderBy('created_at', 'desc')
  )
  
  if (newDocs.length === 0) return  // Nada nuevo
  
  // MERGEAR: viejo + nuevo, deduplicar
  const cached = await getCachedPredictions()
  const merged = mergeAndDedup(cached.documents, newDocs)
  
  // ACTUALIZAR: cache + tabla
  await cachePredictions(merged)
  const rows = generateTableRows(merged)
  setPredictionRows(rows)  // Actualización silenciosa
  
  // Registrar nuevo timestamp
  saveLastSyncTime(Date.now())
}
```

---

## 🔧 Funciones Auxiliares

### Merge y Deduplicación

```typescript
interface CachedForecastDoc extends ForecastDoc {
  _cachedAt?: number  // Timestamp de cuándo se cachó
}

function mergeAndDedup(
  cached: CachedForecastDoc[],
  newDocs: CachedForecastDoc[]
): CachedForecastDoc[] {
  // Map para deduplicar por city_id + date_hour
  const map = new Map<string, CachedForecastDoc>()
  
  // Agregar viejos primero
  cached.forEach(doc => {
    const key = `${doc.city_id}|${doc.date_hour}`
    map.set(key, doc)
  })
  
  // Sobrescribir con nuevos (más recientes)
  newDocs.forEach(doc => {
    const key = `${doc.city_id}|${doc.date_hour}`
    map.set(key, doc)
  })
  
  // Retornar como array, ordenado por fecha descendente
  return Array.from(map.values()).sort((a, b) => {
    return parseFloat(b.date_hour) - parseFloat(a.date_hour)
  })
}
```

### Cache Metadata

```typescript
interface PredictionsCacheMetadata {
  documents: ForecastDoc[]              // Array de docs
  lastSyncTime: number                  // Timestamp ms
  cachedAt: number                      // Cuándo se cachó
  expiresAt: number                     // TTL (cachedAt + 60 min)
}

async function cachePredictions(
  docs: ForecastDoc[],
  options?: { ttl?: number }
): Promise<void> {
  const ttl = options?.ttl || 60 * 60 * 1000  // 60 minutos por defecto
  const now = Date.now()
  
  const metadata: PredictionsCacheMetadata = {
    documents: docs,
    lastSyncTime: now,
    cachedAt: now,
    expiresAt: now + ttl
  }
  
  await idbKeyval.set('predictions_cache', metadata)
}

async function getCachedPredictions(): Promise<PredictionsCacheMetadata | null> {
  const cached = await idbKeyval.get('predictions_cache')
  return cached || null
}

function isValid(cached: PredictionsCacheMetadata): boolean {
  return cached && cached.expiresAt > Date.now()
}
```

---

## 📋 Criterios de Aceptación

### Funcionalidad
- [ ] Lectura tabla: cache local + delta sync en background
- [ ] Delta sync: query con `WHERE created_at > lastSyncTime`
- [ ] Merge: combina cache viejo + nuevos, deduplica por city_id + date_hour
- [ ] Cache metadata: guarda timestamp de última sincronización
- [ ] TTL cache: 60 minutos (respetado)
- [ ] Si cache fresco: mostrar inmediato (40ms)
- [ ] Si hay nuevos: actualizar tabla sin bloquear (background)
- [ ] Si cache expirado: obtener TODOS de Firestore

### Performance
- [ ] Cache hit (fresco): <50ms (IndexedDB lectura)
- [ ] Cache miss: <1s (Firestore query completa)
- [ ] Delta sync: <300ms (query + merge)
- [ ] Bundle size: sin impacto (reutilizar código existente)

### Testing
- [ ] Tests: cache fresco, cache expirado, sin cache, delta sync
- [ ] Dedup logic: confirma que no hay duplicados
- [ ] Firestore falla: mostrar cache stale (fallback)
- [ ] Cobertura: >85%

### Documentación
- [ ] Pseudocódigos claros
- [ ] Estructura de datos (ForecastDoc + metadata)
- [ ] Sin breaking changes

---

## 🎯 Pseudocódigo Completo

### Lectura en UI (Tabla Predictiva)

```pseudocode
ALGORITMO ObtenerTablaPredictiva_ConDeltaSync

ENTRADA: (ninguna — usuario abre tab "Predicciones")
SALIDA: rows[] para TanStack Table

VARIABLES
    cached: PredictionsCacheMetadata
    allDocs: ForecastDoc[]
    newDocs: ForecastDoc[]
    merged: ForecastDoc[]
    time_inicio: timestamp

INICIO
    time_inicio ← AHORA()
    
    // CAPA 1: Caché Local (40ms esperado)
    cached ← ObtenerDelCache(IndexedDB, "predictions_cache")
    
    SI cached EXISTE Y ES_VALIDO(cached) ENTONCES
        LogDebug("Cache hit (tabla): ${AHORA()-time_inicio}ms")
        rows ← GenerarFilasTabla(cached.documents)
        MostrarTabla(rows)
        
        // CAPA 2: Delta Sync en Background (no bloquea)
        CargarDeltaYActualizarAsync(cached.lastSyncTime)
        
        RETORNAR rows
    
    FIN SI
    
    // CAPA 2: Primera carga o cache expirado (300-500ms esperado)
    allDocs ← ObtenerTodosDeFirestore()  // Query completa
    
    SI allDocs.length > 0 ENTONCES
        // Guardar en cache
        GuardarCache(
          IndexedDB, 
          "predictions_cache",
          { documents: allDocs, lastSyncTime: AHORA() }
        )
        
        rows ← GenerarFilasTabla(allDocs)
        LogDebug("Firestore fetch (tabla): ${AHORA()-time_inicio}ms")
        MostrarTabla(rows)
        
        RETORNAR rows
    
    FIN SI
    
    // FALLBACK: Sin datos
    LogError("Sin datos para tabla predictiva")
    MostrarMensajeVacio()
    RETORNAR []
    
FIN ALGORITMO


ALGORITMO CargarDeltaYActualizarAsync

ENTRADA: lastSyncTime (timestamp ms)

VARIABLES
    newDocs: ForecastDoc[]
    merged: ForecastDoc[]
    cached: PredictionsCacheMetadata

INICIO
    
    TRY
        // QUERY DELTA: obtener SOLO docs nuevos desde última sync
        newDocs ← ObtenerDeFirestore(
            WHERE created_at > Timestamp.fromMillis(lastSyncTime),
            ORDERBY created_at DESC
        )
        
        SI newDocs.length === 0 ENTONCES
            LogDebug("Delta sync: sin cambios")
            RETORNAR
        FIN SI
        
        // MERGEAR: viejo + nuevo
        cached ← ObtenerDelCache(IndexedDB, "predictions_cache")
        merged ← MergearYDedup(cached.documents, newDocs)
        
        // ACTUALIZAR: cache + UI
        GuardarCache(
          IndexedDB,
          "predictions_cache",
          { documents: merged, lastSyncTime: AHORA() }
        )
        
        rows ← GenerarFilasTabla(merged)
        ActualizarTabla(rows)  // Actualización silenciosa en background
        
        LogDebug("Delta sync completado: ${newDocs.length} nuevos docs")
    
    CATCH error
        LogWarn("Delta sync fallido (no crítico): ${error}")
        // Continuar — tabla sigue visible con cache viejo
    
    FIN TRY
    
FIN ALGORITMO


ALGORITMO MergearYDedup

ENTRADA: cached (ForecastDoc[]), newDocs (ForecastDoc[])
SALIDA: merged (ForecastDoc[])

VARIABLES
    map: Map<string, ForecastDoc>
    key: string

INICIO
    
    map ← Map vacío
    
    // Agregar viejos primero
    PARA CADA doc EN cached HACER
        key ← doc.city_id + "|" + doc.date_hour
        map[key] ← doc
    FIN PARA
    
    // Sobrescribir con nuevos (más recientes)
    PARA CADA doc EN newDocs HACER
        key ← doc.city_id + "|" + doc.date_hour
        map[key] ← doc
    FIN PARA
    
    // Retornar como array ordenado DESC
    merged ← Array.from(map.values())
    Ordenar(merged, BY date_hour DESC)
    
    RETORNAR merged
    
FIN ALGORITMO
```

---

## 📊 Comparativa: Climas vs Tabla Predictiva

| Aspecto | Climas (US-1104) | Tabla Predictiva (US-1105) |
|---------|------------------|--------------------------|
| **Datos** | 1 record por ciudad/hora | N records por ciudad (histórico) |
| **Incremento** | Reemplazo total (cada hora) | Adición incremental (nuevos docs) |
| **Cache strategy** | TTL simple (expiró = obtener TODO) | Delta Sync (obtener DELTA) |
| **Lectura** | Si fresco → mostrar, FIN | Si fresco → mostrar + delta en bg |
| **Query Firestore** | Sin filtro | Con filtro: WHERE created_at > ts |
| **Merge** | N/A | Dedup por city_id + date_hour |
| **Latencia esperada** | 40ms (hit) o 300-500ms (miss) | 40ms (hit) o 1s (miss inicial) |

---

## 🔀 Impacto Esperado

### Firestore Reads (Reducción esperada)

```
ANTES (sin Delta Sync):
  Usuario abre tabla → Query TODAS las predicciones
  Cantidad docs: 7 días × 94 ciudades × 24 horas = ~15,792 docs
  Firestore reads: 1 query grande = 1 documento + N subcolecciones

DESPUÉS (con Delta Sync):
  Usuario abre tabla (cache fresco):
    - Lectura IndexedDB: 1 (caché)
    - Firestore reads: 0 (hasta expiración)
  
  Usuario abre tabla (cache expirado, primer refresh):
    - Lectura IndexedDB: 1 (cache viejo)
    - Firestore reads: ~15,792 docs (pero solo primera vez)
  
  Siguientes 60 min (delta sync background):
    - Firestore reads: solo nuevos desde última sync (~94 docs)
    - AHORRO: 15,792 - 94 = 15,698 reads (~99% reducción)

RESULTADO: Cada hora en cache activo ahorramos ~15,700 reads
```

### Latencia (Mejora esperada)

```
Escenario: Usuario abre tabla a los 10 min de última carga

ANTES (sin cache):
  → Query Firestore: 300-500ms
  → Procesar 15,792 docs: 200-300ms
  → Mostrar tabla: 500-800ms TOTAL ❌

DESPUÉS (con cache + delta):
  → Lectura IndexedDB cache: 40ms
  → Mostrar tabla: 40ms ✅
  → Delta sync background: 100-200ms (silencioso)
  → Actualización tabla (si hay nuevos): 50ms más después
  
  MEJORA: 500-800ms → 40ms = 92% más rápido
```

---

## ⚠️ Consideraciones

### ¿Qué pasa si Firestore está caído?
- Tabla muestra cache existente (stale pero visible)
- Delta sync en background falla silenciosamente
- Próxima carga mostrará cache viejo (mejor que error)

### ¿Qué pasa si caché se corrompe?
- Query completa de Firestore se ejecuta (fallback)
- Caché se regenera
- Tabla se actualiza

### ¿Impacta en Climas?
- NO — cada flujo es independiente
- Climas usa caché simple (US-1104)
- Tabla predictiva usa Delta Sync (US-1105)

### ¿Y si usuario tiene 100+ predicciones filtradas?
- TanStack Table maneja paginación (20/50/100 filas)
- Delta sync actualiza source data (merge)
- TanStack recalcula filas filtradas
- Performance sigue OK (cliente-side filtering)

---

## 📝 Archivos Afectados

### Modificar:
1. **`src/components/Analytics/PredictionAnalysisTable.tsx`** — Lógica de lectura con delta sync
2. **`src/services/firebase/firebaseWeatherService.ts`** — Query delta (WHERE created_at > ts)
3. **`src/services/cache/cacheService.ts`** — Cache metadata (lastSyncTime)

### Crear:
1. **`src/services/cache/predictionsCacheService.ts`** (opcional) — Lógica de merge/dedup

### Documentar:
1. **`src/docs/architecture/10-firestore-data-schema.md`** — Agregar sección "Flujo de Caché: Tabla Predictiva"

---

## ✅ Status

- ✅ Análisis completado
- ✅ Pseudocódigos definidos
- ✅ Estructura de datos clarificada (city_weather → forecasts → snapshots)
- ⏳ Implementación pendiente
- ⏳ Testing pendiente

---

**Creado:** 2026-04-21  
**Tipo:** Documentación Arquitectónica (Fase 2 — Tabla Predictiva)  
**Relacionada:** US-1104 (Climas — TTL simple)
