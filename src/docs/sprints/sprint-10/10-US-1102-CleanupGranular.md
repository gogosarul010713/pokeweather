# US-1102: Limpieza de Firebase Granular bajo Demanda

**Sprint:** 10 (Ampliación)  
**Story Points:** 3-4 SP  
**Prioridad:** Alta  
**Estado:** ⏳ Ready to Implement  
**Rama:** `sprint-10`  
**Dependencia:** US-1101 (UI Testing Tools debe estar estable)

---

## 📋 Descripción

Agregar botón "Limpiar datos" en Testing Tools que permite eliminar selectivamente:

1. **Documentos NULL en Firestore** — docs con `snapshots.length === 0` (refuerza D-018)
2. **Documentos viejos** — docs con `created_at > 7 días` (manual TTL)
3. **Todo IndexedDB** — eliminar TODAS las tablas de caché (reset completo)
4. **Todo localStorage** — eliminar TODOS los datos de configuración local (reset completo)

La limpieza es **granular** (usuario selecciona qué limpiar con checkboxes) y **bidireccional** (Firestore + IndexedDB).

**Opciones 3+4 de reset total:** Permiten limpiar completamente todos los datos locales para:
- ✅ Validar la app con datos frescos desde Firestore
- ✅ Resetear estado corrupto o de testing
- ✅ Forzar resincronización desde cero

---

## 🎯 Criterios de Aceptación

- [ ] **Botón "Limpiar datos"** visible en Testing Tools (tab Configuración o Reportes)
- [ ] **Modal de confirmación** muestra 4 opciones con checkboxes + preview:
  - [ ] Documentos sin snapshots (count preview)
  - [ ] Documentos > 7 días (count preview)
  - [ ] Todo IndexedDB (size preview — todas las tablas)
  - [ ] Todo localStorage (simple reset — timestamps + config)
- [ ] **Confirmación:** "¿Estás seguro? Se eliminarán X documentos y Y MB."
- [ ] **Ejecución atomic:**
  - IndexedDB: `forecasts` + `forecasts_index` se limpian
  - LocalStorage: `pwe-lastSyncTimestamp` se resetea (força resync)
  - Firestore: Cloud Function elimina docs según criterios
- [ ] **Botón deshabilitado** mientras hay carga climática en progreso
- [ ] **Toast feedback:** Éxito ("Limpieza completada") o error con detalles
- [ ] **Cloud Function protegida:** Solo autenticada desde app (token verificado)
- [ ] **Tests:** Cobertura de cleanup logic (IndexedDB + mock Cloud Function)

---

## 🏗️ Arquitectura

### Opción Elegida: TTL Auto (Firestore) + Forzar Limpieza (Manual)

**Contexto:**
- D-007: TTL Policy Firestore automática elimina docs > 7d (eventual, hasta 24h)
- US-1102 agrega: Limpieza manual bajo demanda (inmediata + selectiva)

**Flujo:**
```
┌─────────────────────────────────────┐
│ User clicks "Limpiar datos"         │
└─────────────────┬───────────────────┘
                  ↓
        ┌────────────────────┐
        │ Modal con opciones │
        │ ☐ NULL-snapshots   │
        │ ☐ > 7 días         │
        │ ☐ Caché local      │
        └────────────────────┘
                  ↓
        ┌────────────────────┐
        │ Confirmar          │
        │ "¿Estás seguro?"   │
        └────────────────────┘
                  ↓
        ┌────────────────────────────────┐
        │ Ejecutar limpieza              │
        ├────────────────────────────────┤
        │ 1. IndexedDB cleanup (local)   │
        │ 2. Cloud Function (Firestore)  │
        │ 3. LocalStorage reset          │
        └────────────────────────────────┘
                  ↓
        ┌────────────────────┐
        │ Toast: Éxito/Error │
        └────────────────────┘
```

---

## 📋 Subtareas

### A: UI Modal en TestingTools

**Archivo:** `src/components/UI/TestingTools.tsx`

**Agregar componente CleanupModal:**

```tsx
interface CleanupOptions {
  nullSnapshots: boolean    // Docs sin snapshots (Firestore)
  olderThan7d: boolean      // Docs > 7 días (Firestore)
  allIndexedDb: boolean     // TODO IndexedDB (reset completo)
  allLocalStorage: boolean  // TODO localStorage (reset completo)
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

### C: Cloud Function para Firestore Cleanup

**Archivo:** `functions/cleanup.ts` (NUEVO)

```typescript
import * as functions from 'firebase-functions'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import * as admin from 'firebase-admin'

admin.initializeApp()

interface CleanupRequest {
  nullSnapshots: boolean
  olderThan7d: boolean
  // allIndexedDb y allLocalStorage NO se envían (client-side only)
}

export const cleanupFirestore = functions.https.onCall(
  async (data: CleanupRequest, context) => {
    // Verificar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      )
    }

    const db = getFirestore()
    let totalDeleted = 0

    try {
      // 1. Eliminar docs sin snapshots (D-018)
      if (data.nullSnapshots) {
        const nullDocsQuery = await db
          .collectionGroup('forecasts')
          .where('snapshots', '==', [])
          .get()

        for (const doc of nullDocsQuery.docs) {
          await doc.ref.delete()
          totalDeleted++
        }
      }

      // 2. Eliminar docs > 7 días
      if (data.olderThan7d) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const timestamp = admin.firestore.Timestamp.fromDate(sevenDaysAgo)

        const oldDocsQuery = await db
          .collectionGroup('forecasts')
          .where('created_at', '<', timestamp)
          .get()

        for (const doc of oldDocsQuery.docs) {
          await doc.ref.delete()
          totalDeleted++
        }
      }

      return {
        success: true,
        deletedCount: totalDeleted,
        message: `Successfully deleted ${totalDeleted} documents`,
      }
    } catch (error) {
      console.error('Firestore cleanup error:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Cleanup failed: ${error.message}`
      )
    }
  }
)
```

**Validación:**
- Solo ejecuta si usuario autenticado (context.auth)
- Queries no índices necesarios (collectionGroup + where)
- Retorna count de docs eliminados

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

## ✅ Checklist de Implementación

- [ ] Subtarea A: UI Modal
  - [ ] CleanupModal component creado
  - [ ] 4 Checkboxes funcionales (D-018, TTL, reset IndexedDB, reset localStorage)
  - [ ] Preview counts correctos (3 categorías Firestore/IndexedDB/localStorage)
  - [ ] Separador visual entre opciones granulares y RESET
  - [ ] Integración en TestingTools
  - [ ] Botón deshabilitado si hay carga
  
- [ ] Subtarea B: IndexedDB + localStorage Cleanup
  - [ ] `cleanupLocalCache()` — limpieza selectiva (forecasts + forecasts_index)
  - [ ] `cleanupAllIndexedDb()` — RESET TOTAL (todas las tablas)
  - [ ] `cleanupLocalStorage()` — limpieza selectiva (timestamps)
  - [ ] `cleanupAllLocalStorage()` — RESET TOTAL (todos los datos pwe-*)
  - [ ] Retorna count de registros eliminados
  - [ ] Sin errores si tablas vacías
  
- [ ] Subtarea C: Cloud Function
  - [ ] `cleanupFirestore` callable function
  - [ ] Verificación de autenticación
  - [ ] Query NULL-snapshots funciona
  - [ ] Query > 7 días funciona
  - [ ] Retorna count de docs eliminados
  
- [ ] Subtarea D: Orquestación
  - [ ] `executeCleanup()` orquesta todo
  - [ ] Manejo de errores por layer
  - [ ] Transaccionalidad (al menos uno debe éxito)
  - [ ] Returns detailed results
  
- [ ] Final:
  - [ ] Toast feedback (éxito/error)
  - [ ] Tests: mock Cloud Function
  - [ ] Tests: IndexedDB cleanup
  - [ ] Build sin warnings
  - [ ] Branch ready
