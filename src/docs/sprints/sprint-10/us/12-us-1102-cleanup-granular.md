# US-1102: Limpieza de Firebase Granular + Cascade Delete

**Sprint:** 10 (Ampliación)  
**Story Points:** 6-7 SP (ampliado desde 3-4)  
**Prioridad:** Alta  
**Estado:** ✅ Análisis Completado — Ready to Implement  
**Rama:** `sprint-10`  
**Dependencia:** US-1101 (UI Testing Tools debe estar estable)  
**Análisis:** [13-US-1102-ANALISIS-AMPLIACION-CASCADE-DELETE.md](13-US-1102-ANALISIS-AMPLIACION-CASCADE-DELETE.md)

---

## 📋 Descripción

Agregar botón "Limpiar datos" en Testing Tools con **limpieza granular + cascade delete** en 3 secciones:

### SECCIÓN 1: Limpieza Granular (Firestore)
1. **Documentos sin snapshots** — refuerza D-018 (null snapshot cleanup)
2. **Documentos > 7 días** — TTL manual (limpieza antigua)

### SEPARADOR VISUAL

### SECCIÓN 2: Reset Total (Locales + Cascada)
3. **TODO IndexedDB** — eliminar TODAS las tablas de caché (reset completo local)
4. **TODO localStorage** — eliminar TODOS los datos pwe-* (reset configuración)
5. **Cascade Delete /city_weather** — eliminar TODA la colección city_weather en Firestore (nuclear reset)

**Propósito del Cascade Delete (Opción 5):**
- ✅ Testing: Validación con datos frescos desde AccuWeather
- ✅ Debugging: Reset completo para estado corrupto
- ✅ Performance testing: Baseline limpio
- ✅ Multi-user scenarios: Reset de sincronización compartida

---

## 🎯 Criterios de Aceptación

### Modal Structure (5 opciones en 3 secciones)
- [ ] **Sección 1 (Granular):** 
  - [ ] ☐ Documentos sin snapshots (D-018) — preview count
  - [ ] ☐ Documentos > 7 días (TTL) — preview count
- [ ] **Visual Separator:** línea horizontal (CSS)
- [ ] **Sección 2 (Nuclear):**
  - [ ] ☐ TODO IndexedDB — preview size (MB)
  - [ ] ☐ TODO localStorage — simple indicator
  - [ ] ☐ Cascade Delete /city_weather — preview count + warning

### Mutual Exclusion (Opción B)
- [ ] Si usuario selecciona algo de Sección 1 → Sección 2 se deshabilita (y vice versa)
- [ ] Visual feedback: disabled state con opacity 0.5
- [ ] Tooltip: "No se pueden combinar limpieza granular con reset total"

### Preview Counts (Query Precisa — Opción A)
- [ ] Docs sin snapshots: `collectionGroup('forecasts').where('snapshots', '==', []).count()`
- [ ] Docs > 7 días: `collectionGroup('forecasts').where('created_at', '<', sevenDaysAgo).count()`
- [ ] Cascade total: `collection('city_weather').count()` (previsualize)
- [ ] IndexedDB size: sumar tamaño aproximado de todas las tablas
- [ ] Latencia aceptable: <50ms para query preview

### Confirmation Dialog (2-Step)
- [ ] Primer paso: Modal con opciones + preview
- [ ] Segundo paso: Confirmación "¿Estás seguro?"
  ```
  Se eliminarán permanentemente:
  • X docs de Firestore
  • Y MB de IndexedDB
  • Z keys de localStorage
  ```
- [ ] Botones: [Cancelar] [CONFIRMAR]

### Toast Feedback (Opción C2 — Detallado)
- [ ] Éxito: `"✅ Eliminados: X docs (Firestore) + Y items (IndexedDB) + Z keys (localStorage)"`
- [ ] Error: `"❌ Limpieza fallida: [error específico]. Reintentar?"`
- [ ] Duración: 4-5 segundos
- [ ] Advertencia eventual consistency: "Limpieza puede tomar hasta 24h en Firestore"

### Cloud Function (Cascade Delete)
- [ ] `cascadeDeleteWeatherData()` callable function
- [ ] Autenticación: `context.auth` verificado
- [ ] Query: `collectionGroup('forecasts').get()` (obtiene TODO)
- [ ] Batch delete con chunking (500 ops per commit)
- [ ] Retorna: `{ success, deleted, duration_ms, timestamp }`
- [ ] Logging auditado: user, timestamp, counts, error if any

### Retry Logic (Opción D3 — Hybrid)
- [ ] Automático: 2 intentos con backoff exponencial (1s, 2s)
- [ ] Manual: Error modal con botón "Reintentar"
- [ ] No hay retry infinito (prevent UX blocking)

### Botón Principal
- [ ] "Limpiar datos" visible en Testing Tools tab (separado o integrado)
- [ ] Deshabilitado mientras hay carga climática en progreso (`isLoading === true`)
- [ ] Visible estado: tooltip "Cargando datos..." si deshabilitado

### Tests
- [ ] Mock Cloud Function: `cascadeDeleteWeatherData()`
- [ ] Test IndexedDB cleanup: `cleanupAllIndexedDb()` vacía todas las tablas
- [ ] Test localStorage cleanup: todos los keys pwe-* eliminados
- [ ] Test mutual exclusion: checkboxes Sección 1 deshabilitan Sección 2
- [ ] Test error handling: toast muestra error específico
- [ ] Test preview accuracy: counts coinciden con datos reales
- [ ] **Coverage:** >85% de cleanup logic

---

## 🏗️ Arquitectura

### Decisiones Confirmadas (Análisis Arquitecto)

| Decisión | Opción | Justificación |
|----------|--------|---------------|
| **A: Dryrun** | **A1 Query Precisa** | Preview +20ms, 100% accuracy (vs A2 dryrun 500ms slow) |
| **B: Coexistencia** | **B2 Mutual Exclusion** | Previene accidental double-delete (Sección 1 ↔ Sección 2 disabled) |
| **C: Toast** | **C2 Detallado** | User necesita saber qué se limpió (X docs + Y items + Z keys) |
| **D: Retry** | **D3 Hybrid** | 2 auto + manual fallback (vs D1 no-retry crash, vs D2 infinite loop) |
| **E: Security** | **E2 Pre-impl** | Checklist: auth, scope, rate limit, audit trail, rules |

**Trade-off:** 70% Safety + 80% Flexibility (Opción B configuration)

---

### Flujo Principal

```
┌────────────────────────────────────────────┐
│ User clicks "Limpiar datos"                │
│ en Testing Tools                           │
└────────────┬───────────────────────────────┘
             ↓
  ┌──────────────────────────────────┐
  │ MODAL: 5 opciones en 3 secciones │
  ├──────────────────────────────────┤
  │ SECCIÓN 1 (Granular):            │
  │ ☐ Docs sin snapshots (count)    │
  │ ☐ Docs > 7 días (count)         │
  ├──────────────────────────────────┤ ← Separador
  │ SECCIÓN 2 (Nuclear):             │
  │ ☐ TODO IndexedDB (size)         │
  │ ☐ TODO localStorage (simple)    │
  │ ☐ Cascade Delete /city_weather  │
  └──────────────────────────────────┘
             ↓
  ┌──────────────────────────────────┐
  │ CONFIRMACIÓN 2-STEP              │
  │ "¿Estás seguro?                  │
  │  Se eliminarán: X docs +Y items" │
  └──────────────────────────────────┘
             ↓
  ┌──────────────────────────────────┐
  │ EJECUTAR: Client + Server        │
  │ 1. cleanupAllIndexedDb()         │
  │ 2. cleanupAllLocalStorage()      │
  │ 3. cascadeDeleteWeatherData()    │
  └──────────────────────────────────┘
             ↓
  ┌──────────────────────────────────┐
  │ TOAST: "✅ Eliminados: X+Y+Z"   │
  └──────────────────────────────────┘
```

---

### Mutual Exclusion (Opción B2)

**Sección 1 ↔ Sección 2 Mutual Exclusion:**
```typescript
if (anySelectedInSection1()) {
  disableAllInSection2()  // opacity 0.5, disabled input
}
if (anySelectedInSection2()) {
  disableAllInSection1()  // opacity 0.5, disabled input
}
```

---

## 📋 Subtareas (6-7 SP)

### A: UI Modal Refactor (1.5 SP — 90 min)

**Archivo:** `src/components/UI/TestingTools.tsx`

**Cambios:**
- Refactor CleanupModal para 5 opciones en 3 secciones
- Agregar separador visual (CSS `<hr>`)
- Implementar mutual exclusion (Opción B2)
- Preview counts por tipo (Opción A1: Query Precisa)

```tsx
interface CleanupOptions {
  // SECCIÓN 1: Granular
  nullSnapshots: boolean    // Docs sin snapshots (D-018)
  olderThan7d: boolean      // Docs > 7 días (TTL manual)
  
  // SECCIÓN 2: Nuclear
  allIndexedDb: boolean     // TODO IndexedDB
  allLocalStorage: boolean  // TODO localStorage
  cascadeDeleteAll: boolean // Cascade Delete /city_weather ← NUEVA
}

// En TestingTools
const [showCleanupModal, setShowCleanupModal] = useState(false)
const [cleanupOptions, setCleanupOptions] = useState<CleanupOptions>({
  nullSnapshots: false,
  olderThan7d: false,
  allIndexedDb: false,
  allLocalStorage: false,
})

const handleCleanupClick = async () => {
  // 1. Mostrar modal
  setShowCleanupModal(true)
}

const handleConfirmCleanup = async () => {
  try {
    // Llamar a cleanup orchestration
    await cleanupData(cleanupOptions)
    showToast('Limpieza completada', 'success')
    setShowCleanupModal(false)
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error')
  }
}

// Renderizar
return (
  <div className="ttd-cleanup">
    <button 
      onClick={handleCleanupClick}
      disabled={isLoading}  // Deshabilitado si hay carga
    >
      Limpiar datos
    </button>
    
    {showCleanupModal && (
      <CleanupModal
        options={cleanupOptions}
        onChange={setCleanupOptions}
        onConfirm={handleConfirmCleanup}
        onCancel={() => setShowCleanupModal(false)}
      />
    )}
  </div>
)
```

**CleanupModal component:**

```tsx
interface CleanupModalProps {
  options: CleanupOptions
  onChange: (options: CleanupOptions) => void
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export const CleanupModal: React.FC<CleanupModalProps> = ({
  options,
  onChange,
  onConfirm,
  onCancel,
}) => {
  const [counts, setCounts] = useState({ nullDocs: 0, oldDocs: 0, cacheSize: '0 MB' })
  const [isLoading, setIsLoading] = useState(false)

  // Al montar, precargar counts (preview)
  useEffect(() => {
    fetchCleanupCounts().then(setCounts)
  }, [])

  return (
    <div className="cleanup-modal">
      <h3>Limpiar datos</h3>
      
      <label>
        <input
          type="checkbox"
          checked={options.nullSnapshots}
          onChange={(e) => onChange({ ...options, nullSnapshots: e.target.checked })}
        />
        Documentos sin snapshots ({counts.nullDocs})
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={options.olderThan7d}
          onChange={(e) => onChange({ ...options, olderThan7d: e.target.checked })}
        />
        Documentos > 7 días ({counts.oldDocs})
      </label>
      
      <hr className="cleanup-separator" />
      
      <label className="cleanup-reset">
        <input
          type="checkbox"
          checked={options.allIndexedDb}
          onChange={(e) => onChange({ ...options, allIndexedDb: e.target.checked })}
        />
        <strong>RESET: Todo IndexedDB</strong> ({counts.cacheSize})
      </label>
      
      <label className="cleanup-reset">
        <input
          type="checkbox"
          checked={options.allLocalStorage}
          onChange={(e) => onChange({ ...options, allLocalStorage: e.target.checked })}
        />
        <strong>RESET: Todo localStorage</strong>
      </label>
      
      <p className="warning">
        ⚠️ Esta acción no se puede deshacer. Se eliminarán permanentemente los datos seleccionados.
      </p>
      
      <div className="actions">
        <button onClick={onCancel}>Cancelar</button>
        <button onClick={onConfirm} disabled={isLoading || !Object.values(options).some(Boolean)}>
          {isLoading ? 'Limpiando...' : 'Confirmar limpieza'}
        </button>
      </div>
    </div>
  )
}
```

**Validación:**
- Modal muestra counts actualizados (fetch previo)
- Checkboxes funcionales
- Botón "Confirmar" deshabilitado si ninguna opción seleccionada
- Botón deshabilitado mientras hay carga

---

### B: Limpieza IndexedDB (Client-Side)

**Archivo:** `src/services/cache/cacheService.ts`

**Agregar función cleanup:**

```typescript
export const cleanupLocalCache = async (): Promise<{ deletedRecords: number }> => {
  try {
    // Opción selectiva: solo forecasts + forecasts_index
    const allForecasts = await idb.keys('forecasts')
    await Promise.all(allForecasts.map(key => idb.del('forecasts', key)))
    
    const allIndexes = await idb.keys('forecasts_index')
    await Promise.all(allIndexes.map(key => idb.del('forecasts_index', key)))
    
    await idb.del('sync_state', 'lastSyncTimestamp')
    
    return { deletedRecords: allForecasts.length + allIndexes.length }
  } catch (error) {
    console.error('IndexedDB cleanup failed:', error)
    throw new Error(`Cleanup IndexedDB failed: ${error.message}`)
  }
}

export const cleanupAllIndexedDb = async (): Promise<{ deletedRecords: number }> => {
  // RESET COMPLETO: eliminar TODO IndexedDB
  try {
    const db = await openDB('pwe-cache')
    const storeNames = Array.from(db.objectStoreNames)
    let totalDeleted = 0
    
    for (const storeName of storeNames) {
      const allKeys = await idb.keys(storeName)
      await Promise.all(allKeys.map(key => idb.del(storeName, key)))
      totalDeleted += allKeys.length
    }
    
    return { deletedRecords: totalDeleted }
  } catch (error) {
    console.error('Full IndexedDB cleanup failed:', error)
    throw new Error(`Full cleanup failed: ${error.message}`)
  }
}

export const cleanupLocalStorage = (): void => {
  // Limpieza selectiva: solo timestamps (forced resync)
  localStorage.removeItem('pwe-lastSyncTimestamp')
  localStorage.removeItem('pwe-lastSync')
}

export const cleanupAllLocalStorage = (): void => {
  // RESET COMPLETO: eliminar TODO localStorage
  const keysToKeep = [] // Ninguna clave debe sobrevivir
  const allKeys = Object.keys(localStorage)
  
  for (const key of allKeys) {
    if (key.startsWith('pwe-') || key.startsWith('pw-')) {
      localStorage.removeItem(key)
    }
  }
}
```

**Validación:**
- `cleanupLocalCache()` retorna count de records eliminados
- `cleanupLocalStorage()` limpia timestamps (força resync)
- Sin errores si tablas están vacías

---

### B: Cloud Function Cleanup (2 SP — 120 min)

**Archivo:** `functions/src/index.ts` (agregar función)

**Nueva Cloud Function:** `cascadeDeleteWeatherData()`

```typescript
interface CascadeDeleteRequest {
  nullSnapshots?: boolean   // D-018
  olderThan7d?: boolean     // TTL manual
  cascadeDeleteAll?: boolean // NUEVA: eliminate TODO
}

export const cascadeDeleteWeatherData = functions.https.onCall(
  async (data: CascadeDeleteRequest, context) => {
    // E2: Autenticación verificada
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Auth required')
    }

    const db = getFirestore()
    let totalDeleted = 0
    const startTime = Date.now()

    try {
      // OPCIÓN 1: Cascade Delete TODO /city_weather (NUEVA)
      if (data.cascadeDeleteAll) {
        const allQuery = db.collectionGroup('forecasts').get()
        const snapshot = await allQuery
        
        // Batch delete con chunking (500 ops per commit)
        let batch = writeBatch(db)
        let batchCount = 0
        
        for (const doc of snapshot.docs) {
          batch.delete(doc.ref)
          batchCount++
          totalDeleted++
          
          // Commit every 500 operations (Firestore limit)
          if (batchCount >= 500) {
            await batch.commit()
            batch = writeBatch(db)
            batchCount = 0
          }
        }
        
        // Final commit
        if (batchCount > 0) {
          await batch.commit()
        }
      }

      // OPCIÓN 2: Eliminar docs sin snapshots (D-018)
      else if (data.nullSnapshots) {
        const nullDocs = await db
          .collectionGroup('forecasts')
          .where('snapshots', '==', [])
          .get()

        let batch = writeBatch(db)
        nullDocs.docs.forEach((doc, idx) => {
          batch.delete(doc.ref)
          totalDeleted++
          if ((idx + 1) % 500 === 0) {
            batch.commit()
            batch = writeBatch(db)
          }
        })
        await batch.commit()
      }

      // OPCIÓN 3: Eliminar docs > 7 días (TTL)
      else if (data.olderThan7d) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const ts = admin.firestore.Timestamp.fromDate(sevenDaysAgo)

        const oldDocs = await db
          .collectionGroup('forecasts')
          .where('created_at', '<', ts)
          .get()

        let batch = writeBatch(db)
        oldDocs.docs.forEach((doc, idx) => {
          batch.delete(doc.ref)
          totalDeleted++
          if ((idx + 1) % 500 === 0) {
            batch.commit()
            batch = writeBatch(db)
          }
        })
        await batch.commit()
      }

      const duration = Date.now() - startTime
      
      // Logging auditado (E2: Audit Trail)
      console.log('[CLEANUP_SUCCESS]', {
        user: context.auth.uid,
        type: data.cascadeDeleteAll ? 'cascade' : data.nullSnapshots ? 'null' : 'ttl',
        deleted: totalDeleted,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      })

      return {
        success: true,
        deleted: totalDeleted,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('[CLEANUP_ERROR]', {
        user: context.auth.uid,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
      
      throw new functions.https.HttpsError(
        'internal',
        `Cleanup failed: ${error.message}`
      )
    }
  }
)
```

**Validación:**
- ✅ Auth verificado (context.auth)
- ✅ Batch chunking (500 ops/commit)
- ✅ Logging auditado (user, type, counts)
- ✅ Error handling con detalles

---

### D: Orquestación + Integración (cleanupService.ts)

**Archivo:** `src/services/cleanup/cleanupService.ts` (NUEVO)

```typescript
import { httpsCallable, Functions } from 'firebase/functions'
import * as cacheService from '../cache/cacheService'
import { getDb } from '../firebase'

interface CleanupOptions {
  nullSnapshots: boolean    // Docs sin snapshots (Firestore)
  olderThan7d: boolean      // Docs > 7 días (Firestore)
  allIndexedDb: boolean     // TODO IndexedDB (reset completo)
  allLocalStorage: boolean  // TODO localStorage (reset completo)
}

export const executeCleanup = async (options: CleanupOptions) => {
  const results = {
    firestore: { deleted: 0, error: null as string | null },
    indexedDb: { deleted: 0, error: null as string | null },
    localStorage: { cleared: false, error: null as string | null },
  }

  try {
    // 1. Limpieza IndexedDB (local, paralelo)
    if (options.allIndexedDb) {
      try {
        const { deletedRecords } = await cacheService.cleanupAllIndexedDb()
        results.indexedDb.deleted = deletedRecords
      } catch (error) {
        results.indexedDb.error = (error as Error).message
      }
    }

    // 2. Limpieza localStorage (local, paralelo)
    if (options.allLocalStorage) {
      try {
        cacheService.cleanupAllLocalStorage()
        results.localStorage.cleared = true
      } catch (error) {
        results.localStorage.error = (error as Error).message
      }
    }

    // 3. Limpieza Firestore (cloud)
    if (options.nullSnapshots || options.olderThan7d) {
      try {
        const functions = await getDb().functions
        const cleanup = httpsCallable(functions, 'cleanupFirestore')
        const response = await cleanup({
          nullSnapshots: options.nullSnapshots,
          olderThan7d: options.olderThan7d,
        })
        results.firestore.deleted = response.data.deletedCount
      } catch (error) {
        results.firestore.error = (error as Error).message
      }
    }

    // Validar que al menos uno fue exitoso
    const hadErrors =
      results.firestore.error ||
      results.indexedDb.error ||
      results.localStorage.error
    const hadSuccess =
      results.firestore.deleted > 0 ||
      results.indexedDb.deleted > 0 ||
      results.localStorage.cleared

    if (hadErrors && !hadSuccess) {
      throw new Error('Cleanup failed completely. Please try again.')
    }

    return results
  } catch (error) {
    throw new Error(`Cleanup failed: ${(error as Error).message}`)
  }
}
```

**Validación:**
- Ejecuta IndexedDB y localStorage en paralelo (fast)
- Firestore en serie (respeta autorización)
- Retorna detailed results (error per-layer si hay)
- Transaccional: si todo falla, lanza error; si algunos éxito, retorna results

---

## 🔄 Integración con D-018 (No Guardar Sin Snapshots)

**D-018:** NO guardar documentos si `snapshots.length === 0`

**Relación US-1102 → D-018:**
- D-018 **previene** que se guarden docs inútiles (desde ahora)
- US-1102 **limpia** docs inútiles ya existentes (retrospectivo)

```typescript
// Timeline
2026-04-21: D-018 implementado (US-1103)
           ↓ Nuevos docs guardados solo si snapshots.length > 0

Hoy:       80 docs NULL ya existen en Firestore
           ↓ US-1102 botón "Limpiar datos"
           ↓ User selecciona "Documentos sin snapshots"
           ↓ Cloud Function elimina los 80 docs
           ↓ Firestore limpio
```

---

## ✅ Checklist de Implementación (6-7 SP)

### Subtarea A: Modal UI Refactor (1.5 SP — 90 min)
- [ ] Refactor CleanupModal: 5 opciones en 3 secciones
- [ ] Sección 1: D-018 + TTL (2 checkboxes)
- [ ] Sección 2: Nuclear (3 checkboxes) — Opción 5: Cascade Delete ← NUEVA
- [ ] Separador visual (CSS `<hr>`)
- [ ] Mutual Exclusion (Opción B2): Sección 1 ↔ Sección 2 disabled
- [ ] Preview counts (Opción A1: Query Precisa)
- [ ] 2-Step confirmation modal
- [ ] Integración en TestingTools
- [ ] Botón deshabilitado si hay carga (`isLoading`)

### Subtarea B: Cloud Function Cascade Delete (2 SP — 120 min)
- [ ] `cascadeDeleteWeatherData()` callable (tres opciones: cascade, null, ttl)
- [ ] Autenticación: `context.auth` verificado (E2)
- [ ] Query: `collectionGroup('forecasts').get()` (obtiene TODO)
- [ ] Batch delete con chunking (500 ops/commit)
- [ ] Logging auditado (user, type, counts, duration) (E2: Audit)
- [ ] Retorna: `{ success, deleted, duration_ms, timestamp }`
- [ ] Error handling con detalles

### Subtarea C: IndexedDB + localStorage Reset (1 SP — 60 min)
- [ ] `cleanupAllIndexedDb()` — RESET TOTAL (todas las tablas)
- [ ] `cleanupAllLocalStorage()` — RESET TOTAL (todos los keys pwe-*)
- [ ] `getIndexedDbSize()` — estimación de tamaño
- [ ] Retorna counts / size
- [ ] Sin errores si vacías
- [ ] Funciones en cacheService.ts

### Subtarea D: Orquestación + Error Handling (1 SP — 60 min)
- [ ] `executeCleanup()` orquesta: IndexedDB + localStorage + Cloud Function
- [ ] Retry logic (Opción D3: Hybrid — 2 auto + manual)
- [ ] Manejo de errores por layer (detailed error messages)
- [ ] Toast detallado (Opción C2): "✅ Eliminados: X docs + Y items + Z keys"
- [ ] Toast error: muestra error específico + "Reintentar" button

### Subtarea E: Testing + Validation (0.5 SP — 30 min)
- [ ] Mock Cloud Function: `cascadeDeleteWeatherData()`
- [ ] Test mutual exclusion: checkboxes Sección 1 ↔ Sección 2
- [ ] Test preview accuracy: counts = datos reales
- [ ] Test IndexedDB cleanup: tablas vacías post-cleanup
- [ ] Test localStorage cleanup: keys pwe-* eliminados
- [ ] Test error handling: toast muestra error
- [ ] **Coverage:** >85% de cleanup logic
- [ ] Build sin warnings
- [ ] Branch ready para merge

---

## 🔄 Integración con D-018

**Recordatorio:** D-018 (no guardar sin snapshots) debe estar implementado ANTES de US-1102 para que "Docs sin snapshots" query tenga efecto.

**Timeline:**
```
[D-018 implementada] → [nuevos docs solo si snapshots.length > 0]
[US-1102] → [user puede limpiar los 80 docs NULL ya existentes]
```
