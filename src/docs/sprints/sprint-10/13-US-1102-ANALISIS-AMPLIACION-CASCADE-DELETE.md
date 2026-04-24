# US-1102 AMPLIACIÓN — Análisis Tres Roles (Cascade Delete)

**Sesión:** 2026-04-22 (Análisis antes de implementación)  
**Sprint:** 10 (Fase 2)  
**Rama:** `sprint-10`  
**Estado:** ✅ Análisis completado — Listo para implementación  
**Story Points:** 6-7 SP (ampliado desde 3-4 SP)

---

## 📋 Resumen Ejecutivo

**Cambio de Scope:** US-1102 se amplia para incluir **cascade delete** de TODA la colección `/city_weather` en Firestore, no solo limpieza granular selectiva.

**Nueva Estructura de Limpieza:**
1. **Sección 1 (Granular):** D-018 (sin snapshots) + TTL manual (>7 días)
2. **Sección 2 (Visual):** Separador visual entre opciones
3. **Sección 3 (Nuclear):** Cascade delete + Reset local (RESET TOTAL de índices + localStorage)

**Impacto:**
- +700 líneas de código (Cloud Functions + orchestration)
- +15KB bundle (lazy-loaded cleanup module)
- Zero breaking changes (backward compatible)
- Permite validación completa con datos frescos desde Firestore
- Ideal para testing y debugging en contextos multi-usuario

---

## 🔍 ANÁLISIS ANALISTA SR

### 1. Descomposición de Requisitos

**US-1102 Original (3-4 SP):**
```
Limpieza granular selectiva:
  • Opción 1: Docs sin snapshots (D-018)
  • Opción 2: Docs > 7 días (TTL manual)
  • Opción 3: TODO IndexedDB (reset local)
  • Opción 4: TODO localStorage (reset config)
```

**US-1102 Ampliada (6-7 SP):**
```
Limpieza granular + cascade delete:
  • Opción 1: Docs sin snapshots (D-018) — Firestore granular
  • Opción 2: Docs > 7 días (TTL manual) — Firestore granular
  ────────────────── SEPARADOR VISUAL ──────────────────
  • Opción 3: RESET TODO IndexedDB — Local nuclear
  • Opción 4: RESET TODO localStorage — Local nuclear
  • Opción 5: CASCADE DELETE /city_weather — Firestore nuclear
```

### 2. Ambigüedades Detectadas

| Ambigüedad | Resolución |
|-----------|-----------|
| ¿Cascade delete de qué? | Toda la colección `/city_weather` (todos los docs de weather) |
| ¿Mantener subcollections? | Sí, cascade delete incluye `forecasts/` subcollections |
| ¿Confirmación preventiva? | SÍ — Modal 2 pasos (Opción A + confirmación "¿Estás seguro?") |
| ¿Qué sucede con metadata? | Se pierde — reset completo incluye `sync_state` + metadata |
| ¿Retorna al usuario? | Toast detallado (counts por layer: docs Firestore + size IDB + localStorage) |
| ¿Permite coexistencia? | NO — checkboxes de reset deben ser mutuamente excluyentes (Opción B) |

### 3. Datos a Eliminar (IndexedDB)

**Estructura actual (por user JSON):**
```
IndexedDB tables:
  ├─ forecasts
  │  ├─ sydney_2026-04-20_12:00
  │  ├─ tokyo_2026-04-20_14:30
  │  ├─ london_2026-04-20_10:15
  │  └─ ... (N forecasts)
  │
  ├─ forecasts_index
  │  ├─ lastIndexed: "2026-04-21T22:15:00Z"
  │  └─ syncState: { lastSyncTime: "2026-04-21T18:00:00Z" }
  │
  ├─ cities
  │  ├─ sydney, tokyo, london, ...
  │
  └─ sync_metadata
     └─ prediction_cache: { ttl, lastSync, ... }

localStorage keys (pwe-*):
  ├─ pwe-theme: "dark"
  ├─ pwe-lastSyncTimestamp: "1713787800000"
  ├─ pwe-lastSync: "2026-04-21T22:15:00Z"
  ├─ pwe-selectedCity: "sydney"
  └─ ... (N pwe-* keys)
```

**Eliminación en hard reset:**
- Todas las tablas IndexedDB → limpieza completa
- Todos los keys pwe-* → limpieza completa

### 4. Dependencias

- **Bloqueador:** US-1101 debe estar estable (useFirestoreSync hook)
- **Coexistencia:** D-018 implementada (US-1103, aunque deprecated)
- **Prerequisito:** Cloud Functions setup (US-804 ✅ completada)

---

## 💻 ANÁLISIS DESARROLLADOR SR

### 1. Enriquecimiento Técnico

**Cascada Firestore (Query + Batch Delete):**
```typescript
// Patrón: collectionGroup query + batch delete con chunking
const query = db
  .collectionGroup('forecasts')  // Obtener TODA la subcollection
  .where(...)  // filtro si aplica

const batch = writeBatch(db)
let count = 0

for (const doc of querySnapshot.docs) {
  batch.delete(doc.ref)
  count++
  
  // Chunking: Firestore límite 500 operaciones por batch
  if (count % 500 === 0) {
    await batch.commit()
    batch = writeBatch(db)
  }
}
await batch.commit()  // Commit final
```

**Límites Técnicos:**
- Cloud Function max execution: 9 minutos
- Batch delete max: 500 operaciones por commit
- Firestore max writes/segundo: 1000 (para proyecto estándar)
- IndexedDB max storage: ~50MB (navegador)

**Estimación de Rendimiento:**
- Cascade delete 1000 docs: ~2-5 segundos (sin chunking issues)
- IndexedDB reset 1000 items: ~200-500ms
- localStorage reset 20 keys: ~10ms

### 2. Arquitectura de Cascada

```
OPCIÓN A (Query Precisa — Recomendado):
┌─────────────────────────────────────────┐
│ Cloud Function: clearAllWeatherData()   │
├─────────────────────────────────────────┤
│ 1. db.collectionGroup('forecasts')      │
│    .where(...filter if needed)          │
│    .get()                               │
│                                         │
│ 2. writeBatch() con chunking (500 ops)  │
│    ↓ commit() [per 500 docs]            │
│    ↓ commit() [final]                   │
│                                         │
│ 3. return { deleted: N, success: bool } │
└─────────────────────────────────────────┘
   ↑ Latencia: ~20ms query + N*2ms deletes
   ↑ Precisión: 100% (no deletes accidentales)
   ↑ Riesgo: bajo (query específica, no delete-all)
```

```
OPCIÓN B (Dryrun Preview — Alternativa):
Ejecutar query SIN delete para mostrar preview:
  count = querySnapshot.size
  toast: "Se eliminarán {count} documentos"
  [Usuario confirma]
  [THEN ejecuta batch delete]
```

### 3. Flujo de Orquestación

```
User clicks "RESET: Cascade Delete"
   ↓
Modal:
  ☐ Docs sin snapshots
  ☐ Docs > 7 días
  ─────────────────────────
  ☐ RESET: Todo IndexedDB
  ☐ RESET: Todo localStorage
  ✓ RESET: Cascade Delete /city_weather ← NUEVA
   ↓
Confirm Dialog (2-step):
  "¿Estás seguro? Se eliminarán:"
  • X docs de Firestore
  • Y MB de IndexedDB
  • Z keys de localStorage
  [Cancelar] [CONFIRMAR]
   ↓
executeCleanup(options):
  1. Client-side (paralelo):
     cleanupAllIndexedDb() → {deleted: N}
     cleanupAllLocalStorage() → {}
  
  2. Server-side (serial, auth):
     cascadeDeleteWeatherData() → {deleted: M}
   ↓
Toast Result:
  ✅ "Limpieza completada. Eliminados: X docs (Firestore) + Y items (IndexedDB) + Z keys (localStorage)"
```

### 4. Retry Logic

**Automático (Transient Failures):**
```typescript
const retry = async (fn, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await sleep(1000 * (i + 1))  // Exponential backoff
    }
  }
}

// Use:
try {
  await retry(() => cascadeDelete(...))
} catch (error) {
  // Manual fallback: show error + "Retry" button
}
```

**Manual (Persistent Failures):**
- Toast muestra error específico (network, auth, etc.)
- Botón "Reintentar" disponible en modal
- No reintentos automáticos infinitos (UX blocking)

### 5. Cloud Function Signature

```typescript
interface CascadeDeleteRequest {
  cascadeDeleteAll?: boolean  // TRUE para eliminar TODO /city_weather
  onlyNullSnapshots?: boolean  // TRUE para solo D-018
  onlyOlderThan7d?: boolean    // TRUE para solo TTL
}

interface CascadeDeleteResponse {
  success: boolean
  deleted: number        // docs eliminados
  duration_ms: number    // latencia
  timestamp: string      // when executed
  warnings?: string[]    // eventual consistency, etc
}

export const cascadeDeleteWeatherData = functions.https.onCall(
  async (data: CascadeDeleteRequest, context) => {
    // Implementation: query → batch delete con chunking
  }
)
```

---

## 🏛️ ANÁLISIS ARQUITECTO SR

### 1. Decisiones Críticas

#### **Decisión A: Dryrun Preview (Query Precisa)**

| Opción | Detalles | Impacto |
|--------|----------|--------|
| **A1: Query Precisa** | Mostrar count SIN ejecutar delete | +20ms latencia, preview 100% preciso |
| **A2: Dryrun Completo** | Ejecutar delete en write-emulator, rollback | +500ms, muy lento |
| **A3: Sin Preview** | Solo mostrar "Se eliminarán muchos docs" | -20ms, menos visual |

**RECOMENDACIÓN: A1 (Query Precisa)**
- Razón: 20ms es imperceptible, usuario ve números reales
- Trade-off: +20ms por mejor UX
- Implementación: `fetchCascadeDeleteCounts()` → query sin delete

---

#### **Decisión B: Coexistencia (Mutual Exclusion)**

| Opción | Detalles | Impacto |
|--------|----------|--------|
| **B1: Permitir Todos** | User puede seleccionar D-018 + Cascade simultáneamente | Ambigüedad: ¿cuál ejecuta primero? |
| **B2: Grupos Separados** | 2 secciones (Granular + Nuclear), reset sibling = deshabilitado | Previene accidental nuke |
| **B3: Deshabilitar Todo** | Solo 1 opción por modal abierta | UX pobre (multiple modales) |

**RECOMENDACIÓN: B2 (Grupos Separados)**
- Razón: Previene accidental double-delete
- Implementación: Si user selecciona ANY "Opción 3-5", deshabilitar opciones 1-2 sibling (y viceversa)
- Modal UX:
```
┌────────────────────────────────────────┐
│ GRANULAR CLEANUP (Opciones 1-2)        │
│ ☐ Docs sin snapshots (D-018)          │
│ ☐ Docs > 7 días (TTL)                 │
├────────────────────────────────────────┤ ← Separador visual
│ RESET TOTAL (Opciones 3-5)             │
│ ☐ TODO IndexedDB                       │
│ ☐ TODO localStorage                    │
│ ☐ Cascade Delete /city_weather         │
└────────────────────────────────────────┘
```
- Si selecciona algo de Sección 1 → Sección 2 deshabilita
- Si selecciona algo de Sección 2 → Sección 1 deshabilita

---

#### **Decisión C: Toast Feedback (Detalle Level)**

| Opción | Contenido | Claridad |
|--------|-----------|----------|
| **C1: Simple** | "✅ Limpieza completada" | ⭐ Vague |
| **C2: Detallado** | "✅ Eliminados: 42 docs (Firestore) + 156 items (IndexedDB) + 18 keys (localStorage)" | ⭐⭐⭐⭐⭐ Clear |
| **C3: Metrizado** | "+ Duración: 2.3s, Ahorro: 5.2MB, TTL aviso: eventual (24h)" | ⭐ Sobrecargo |

**RECOMENDACIÓN: C2 (Detallado)**
- Razón: User necesita saber qué se limpió exactamente
- Implementación: `toast(${deleted.firestore} docs + ${deleted.indexedDb} items + ...)`

---

#### **Decisión D: Retry Strategy (Transient vs Persistent)**

| Opción | Estrategia | Impacto |
|--------|-----------|--------|
| **D1: Sin Retry** | Fallo = error inmediato | ❌ Network glitches → UX breaking |
| **D2: Automático Infinito** | Reintentar hasta éxito | ❌ Bad: loop infinito, timeout |
| **D3: Hybrid (2+Manual)** | 2 automáticos (backoff), luego manual "Reintentar" | ✅ Resilient + UX friendly |

**RECOMENDACIÓN: D3 (Hybrid)**
- Automático: 2 intentos con exponential backoff (1s, 2s)
- Manual: Error dialog + "Reintentar" button
- Implementación:
```typescript
try {
  await cascadeDelete()
} catch (error) {
  if (isTransient(error)) {
    // Auto-retry 2x
    const success = await retry(cascadeDelete, 2)
    if (!success) throw error
  }
  // Show manual retry button
  showErrorModal(error, { onRetry: ... })
}
```

---

#### **Decisión E: Security Validation (Pre-Implementation Checklist)**

| Item | Validación | Criticidad |
|------|-----------|-----------|
| **E1: Auth Check** | Cloud Function verifica `context.auth` | 🔴 CRÍTICA |
| **E2: User Scope** | No elimina docs de OTROS usuarios (si aplica multi-tenant) | 🔴 CRÍTICA |
| **E3: Rate Limiting** | Max 1 cleanup/5 min por usuario (previene abuse) | 🟡 IMPORTANTE |
| **E4: Audit Trail** | Log: user, timestamp, counts, success/error | 🟡 IMPORTANTE |
| **E5: Security Rules** | Firestore rules: Solo admin o self-auth puede cascade-delete | 🔴 CRÍTICA |

**RECOMENDACIÓN: E2 (Pre-Implementation Checklist)**
- Antes de implementar, validar:
  - [ ] Firestore security rules bloquean cascade-delete para non-admin
  - [ ] Cloud Function verifica `context.auth.uid` (user scope)
  - [ ] Logging auditado en Cloud Function (¿quién? ¿cuándo?)
  - [ ] Rate limiting: max 1/5 min
  - [ ] Test: malicious user no puede eliminar datos de otros

---

### 2. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-----------|--------|-----------|
| **R1: Data Consistency** | 🟡 Media | 🔴 Alto (eventual 24h) | Toast: "Limpieza puede tomar hasta 24h" |
| **R2: Batch Timeout** | 🟢 Baja | 🔴 Alto (>500 docs crash) | Chunking: batch 500 per commit |
| **R3: UX Overload** | 🟡 Media | 🟠 Medio (confusión modal) | Opción B: mutual exclusion (2 secciones) |
| **R4: Firestore Cost** | 🟢 Baja | 🟡 Bajo (~$0.01/1M deletes) | Acceptable cost |
| **R5: Incomplete Cleanup** | 🟡 Media | 🔴 Alto (inconsistent state) | Transactional orchestration + detailed error logging |
| **R6: Accidental Reset** | 🟡 Media | 🔴 Alto (data loss) | Opción B (mutual exclusion) + 2-step confirmation |

---

### 3. Mejoras Opcionales (No Blocking)

#### **Mejora 1: Audit Trail Metadata**
```typescript
// localStorage persistence
interface CleanupRecord {
  timestamp: string
  user: string
  options: CleanupOptions
  results: CleanupResults
  duration_ms: number
}

const cleanupHistory: CleanupRecord[] = JSON.parse(
  localStorage.getItem('pwe-cleanup-history') || '[]'
)
cleanupHistory.push(record)
localStorage.setItem('pwe-cleanup-history', JSON.stringify(cleanupHistory))
```
- Impacto: +2KB localStorage, visible en DevTools
- Beneficio: Debugging traces
- Effort: 30-60 min

#### **Mejora 2: Dry-Run Visual Mode**
```typescript
// Show what WOULD be deleted without executing
<CleanupModal isDryRun={true} />
// renderiza: "Preview: Se eliminarían X docs (sin ejecutar)"
```
- Impacto: +50 líneas de código
- Beneficio: Extra safety layer
- Effort: 1-2 horas

#### **Mejora 3: Enhanced Cloud Function Logging**
```typescript
console.log('[CLEANUP_START]', {
  user: context.auth.uid,
  timestamp: new Date().toISOString(),
  options: data,
})
// ... execution ...
console.log('[CLEANUP_END]', {
  deleted: totalDeleted,
  duration_ms,
  success: true,
})
```
- Impacto: Visible en Cloud Function logs
- Beneficio: Production debugging + metrics
- Effort: 30 min

---

### 4. Trade-offs Analysis

| Decisión | Option A | Option B (Seleccionado) | Trade-off |
|----------|----------|--------|-----------|
| **Dryrun** | Sin preview (rápido) | Query preview (+20ms) | +UX accuracy / +20ms latencia |
| **Mutual Exclusion** | Permitir todos (flexible) | Grupos separados (bloqueador) | +Safety / -Flexibility |
| **Toast** | Simple | Detallado | +Clarity / +Characters |
| **Retry** | Sin retry (simple) | Hybrid 2+manual | +Resilience / +UX complexity |
| **Security** | Basic auth | Pre-impl checklist | +Coverage / +Setup time |

**Suma:** 70% Safety + 80% Flexibility (Opción B configuration)

---

### 5. Estimación Final

| Subtarea | SP | Effort | Blockers |
|----------|-----|--------|----------|
| A: Modal UI refactor | 1.5 | 90 min | Ninguno |
| B: Cloud Function (cascade) | 2 | 120 min | Schema validation |
| C: IndexedDB + localStorage reset | 1 | 60 min | Existing cacheService |
| D: Orchestration + error handling | 1 | 60 min | A+B+C complete |
| E: Testing + validation | 0.5 | 30 min | D complete |
| **TOTAL** | **6-7** | **360 min (6h)** | **Sequential** |

---

## ✅ RECOMENDACIÓN FINAL

### Estado: **LISTO PARA IMPLEMENTACION**

**Decisiones Confirmadas:**
- ✅ **A1:** Query Precisa (preview counts)
- ✅ **B2:** Mutual Exclusion (2 secciones)
- ✅ **C2:** Detallado Toast
- ✅ **D3:** Hybrid Retry (2 auto + manual)
- ✅ **E2:** Security Checklist pre-impl

**Impacto:**
- +700 líneas de código
- +15KB bundle (lazy-loaded)
- +0 breaking changes
- 100% backward compatible

**Mejoras No Bloqueantes:**
- Mejora 1 (Audit Trail) — post-launch
- Mejora 2 (Dry-run Visual) — post-launch
- Mejora 3 (Enhanced Logging) — post-launch

**Próximos Pasos:**
1. Confirmar pre-implementation security checklist (E2)
2. Iniciar Subtarea A (Modal UI)
3. Subtareas B-E en secuencia

---

**Documentación Completada:** 2026-04-22  
**Análisis Técnico:** Analista SR + Desarrollador SR + Arquitecto SR  
**Aprobación:** Pending user confirmation
