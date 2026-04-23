# 🎯 Sprint 10 — AMPLIADO: US-1102 AMPLIACIÓN EN IMPLEMENTACIÓN ⚙️

**Fecha Actualización:** 2026-04-23 (Session 6)  
**Sprint 10 Fase 1:** ✅ COMPLETADA (2026-04-16 → 2026-04-21) — 5 US
**Sprint 10 Fase 2:** ⚙️ EN IMPLEMENTACIÓN (2026-04-23) — US-1102 AMPLIADA (6-7 SP con Cascade Delete)
**Sprint 10 Fase 3:** ✅ IMPLEMENTADA (2026-04-21) — US-1104/1105

---

## ✅ Fase 1 Resumen (Completada)

**US Implementadas:**
- ✅ US-1001: Firebase Extension + BigQuery
- ✅ US-1002: SQL View snapshots_flat
- ✅ US-1003: Looker Studio Connection
- ✅ US-1007: Prediction Analysis Table (TanStack v8)
- ✅ US-1008: Caché Inteligente Delta Sync (65 docs validados)

**Resultado:** Dashboard analytics funcional + Caché optimizado en IndexedDB

---

## ⏳ Fase 2 — 3 Nuevas US (Ampliación Sprint 10)

### Estructura Documentada

**3 User Stories:**
1. **US-1103:** Fix D-018 — No guardar docs sin snapshots (1-2 SP)
2. **US-1101:** Sincronización Automática (Servidor HH:15) ✅ DOCUMENTADA (6-7 SP)
3. **US-1102:** Limpieza Firebase granular bajo demanda (3-4 SP)

**Timeline Total:** 5-7 horas

**Documentación Creada:**
```
src/docs/sprints/sprint-10/
  ├── 09-US-1101-SyncAutomatic.md       ✅ ACTUALIZADA (Arquitectura servidor)
  ├── AUTO-SYNC-ARCHITECTURE.md         ✅ NUEVA (Detalle técnico completo)
  ├── 10-US-1102-CleanupGranular.md     ✅ Documentada
  ├── 11-US-1103-FixNoSaveEmpty.md      ✅ Documentada
  └── 12-PlanImplementacionSyncCleanup.md ✅ Documentada (fase a fase)
```

---

## 📋 Detalles: US-1103 (Primero — Fix Base)

**Story Points:** 1-2 SP  
**Estimado:** 30-45 min  
**Bloqueador:** Ninguno (va primero)

### ¿Qué es?
Implementar Decisión D-018: NO guardar documentos en Firestore si `snapshots.length === 0`.

**Problema actual:**
- 80 docs (53% del total) se guardan SIN snapshots válidos
- Ocupan storage innecesariamente
- Contaminan BigQuery

**Solución:**
- Early return en `firebaseWeatherService.ts` si `snapshots.length === 0`
- Reduce writes ~50% desde ahora en adelante

### Cambio de Código (Mínimo)

**Archivo:** `src/services/firebase/firebaseWeatherService.ts` (línea ~77)

```typescript
if (snapshots.length === 0) return  // ← AGREGAR (3 líneas)
```

### Criterios de Aceptación
- [ ] firebaseWeatherService NO guarda si `snapshots.length === 0`
- [ ] Tests verdes (mock empty snapshots)
- [ ] Compilación sin errores
- [ ] Documentación data schema actualizada

---

## ✅ US-1102 — VALIDADA Y FUNCIONAL (2026-04-23 Session 7)

**Story Points:** 4 SP  
**Commits:** `c4afecf` + `ea7b414` + fixes de Session 7  
**Status:** ✅ FUNCIONAL — Cloud Function operativa, 85 docs eliminados en prueba

### ✅ Implementación Completa
- ✅ CleanupPanel.tsx — 4 checkboxes con descripciones y preview counts
- ✅ TestingTools.tsx refactorizado — pestaña "🗑️ Limpiar"
- ✅ cleanupService.ts — usa fetch() directo con x-api-key header
- ✅ Cloud Function `clearFirestoreData` — onRequest() + CORS + CLEANUP_SECRET
- ✅ Cascade delete elimina forecasts (subcolección) + city_weather (raíz)
- ✅ Bugfixes documentados en `src/docs/sprints/sprint-10/bugfixes/` (BUG-001 a BUG-005)

### Bugs Resueltos en Session 7 (todos documentados)
- ✅ BUG-001: 401 UNAUTHENTICATED — onCall() reemplazado por onRequest() + x-api-key
- ✅ BUG-002: Deploy sin compilar lib/ — script `npm run deploy:functions` creado
- ✅ BUG-003: VITE_* no existe en servidor — functions/.env con CLEANUP_SECRET
- ✅ BUG-004: CORS preflight bloqueado — OPTIONS manejado antes de auth check
- ✅ BUG-005: Cascade delete incompleto — collectionGroup('forecasts') eliminado primero

### Arquitectura Final Cloud Function
- Endpoint: `POST https://us-central1-weather-app-prod-ef50d.cloudfunctions.net/clearFirestoreData`
- Auth: header `x-api-key: CLEANUP_SECRET` (valor = VITE_CRON_SECRET del cliente)
- CORS: Access-Control-Allow-Origin: * para localhost y producción
- Cascade: elimina forecasts (collectionGroup) → luego city_weather raíz

### Pendiente
- ⬜ Validación manual completa desde UI (TestingTools → Limpiar → todas las opciones)
- ⬜ Commit final de sesión
- ⬜ Merge US-1102 → develop
- ✅ Dev server: Funcionando (localhost:5176)
- ✅ Observaciones aplicadas: Pestaña separada + maximizado default

---

## ✅ US-1101 IMPLEMENTADA (2026-04-21 Session 4)

**Story Points:** 6-7 SP (actualizado desde 3-4)  
**Commit:** `a6ef397` feat(US-1101): Sincronización Automática Servidor-side (HH:15)  
**Completado:** 7/7 subtareas

### ¿Qué fue implementado?

**Servidor (Firebase Cloud Functions):**
- ✅ Scheduled Function: `syncWeatherScheduled` (HH:15 UTC daily)
- ✅ HTTP endpoint: `syncWeatherManual` (manual testing + CRON_SECRET auth)
- ✅ `syncWeatherLogic()` — Promise.all() 5 ciudades en paralelo (~500ms)
- ✅ Mapeo AccuWeather → condiciones climáticas
- ✅ Guardado en Firestore `/city_weather/{cityId}`

**Cliente (React):**
- ✅ Hook `useFirestoreSync()` — onSnapshot listener real-time (~100ms latencia)
- ✅ Integración en App.tsx — Merge Firestore data con state local
- ✅ Botón "Sincronizar ahora" en TestingTools con feedback (success/error)
- ✅ Configuración .env.local (VITE_CRON_SECRET)

### Arquitectura

```
HH:15 UTC → Firebase Scheduled Function
  ↓ [Parallel Promise.all()]
  ├─ Sydney (AccuWeather → Firestore)
  ├─ Tokyo
  ├─ London
  ├─ New York
  └─ São Paulo
         ↓ [Escribe en /city_weather/{cityId}]
         ↓ [Cliente escucha onSnapshot]
  → useFirestoreSync detects cambios (~100ms)
  → React state actualiza automáticamente
  → UI re-renderiza con datos frescos
```

### Testing
- ✅ Build: 126 modules transformed, 619ms
- ⏳ Manual testing: Esperar HH:15 UTC o usar botón "Sincronizar ahora"
- ⏳ Firebase Console: Validar executions en Cloud Functions

---

---

## 📋 Próximas US — Fase 2 (Si continúan)

### ⏳ US-1103 (Primero — Fix Base)

**Story Points:** 1-2 SP  
**Estimado:** 30-45 min  
**Prioridad:** ALTA (bloqueador para US-1102)

Implementar Decisión D-018: NO guardar documentos en Firestore si `snapshots.length === 0`.

**Cambio mínimo:** `src/services/firebase/firebaseWeatherService.ts` línea ~77
```typescript
if (snapshots.length === 0) return  // ← AGREGAR
```

**Impacto:** -50% Firestore writes desde ahora

### ⏳ US-1102 (Cleanup)

**Story Points:** 3-4 SP  
**Estimado:** 2-3 h  
**Dependencia:** US-1101 estable

### ¿Qué es?
Botón "Limpiar datos" en Testing Tools que permite eliminar selectivamente:
1. Documentos sin snapshots (D-018)
2. Documentos > 7 días (TTL manual)
3. **Todo IndexedDB** (reset caché completo)
4. **Todo localStorage** (reset configuración local)

**Usuario elige** qué limpiar via checkboxes en modal.

**Propósito 3+4:** Reset total de datos locales para validación con datos nuevos o cleanup radical.

### Cambios Principales

**1. Cloud Function (NUEVO):**
- `functions/cleanup.ts`
- Callable: elimina docs Firestore según criterios
- Autenticada (solo desde app)

**2. Client Service:**
- `src/services/cleanup/cleanupService.ts` (NUEVO)
- Orquesta: IndexedDB + LocalStorage + Cloud Function
- Manejo granular de errores

**3. TestingTools UI:**
- Botón "Limpiar datos"
- Modal con 3 checkboxes + preview counts
- Confirmación: "¿Estás seguro? Se eliminarán X docs"

### Criterios de Aceptación
- [ ] Modal muestra 3 opciones con checkboxes
- [ ] Preview counts correctos (query antes de eliminar)
- [ ] Limpieza IndexedDB funciona (client-side)
- [ ] Cloud Function funciona (Firestore)
- [ ] Toast feedback (éxito/error)
- [ ] Tests >85% coverage

---

## 🔄 Decisiones Arquitectónicas Aplicadas

| Decisión | Detalles |
|----------|----------|
| **D-018** | No guardar docs sin snapshots (US-1103) |
| **D-017** | Delta Sync respetado (US-1101 no lo afecta) |
| **US-1101 Arch:** | Zustand flag + LocalStorage persistence |
| **US-1102 Arch:** | TTL automático + Forzar Limpieza manual |
| **Cloud Function** | Autenticada solo desde app (seguridad) |

---

## 📊 Impacto Esperado

### Firestore (US-1103)
- **Antes:** 2,400 writes/día, 53% inútiles
- **Después:** ~1,128 writes/día, 0% inútiles
- **Ahorro:** -645 writes/día (-53%)

### Funcionalidad (US-1101)
- User control sobre sync frequency
- Compatible con batch processing

### Data Hygiene (US-1102)
- Usuario puede limpiar data histórica
- Refuerza D-018 (elimina docs viejos sin snapshots)

---

## 📚 Documentación Referencia

**Plan Completo:**
- `src/docs/sprints/sprint-10/12-PlanImplementacionSyncCleanup.md`

**Documentación Individual:**
- `09-US-1101-SyncManual.md` — Detalles + subtareas
- `10-US-1102-CleanupGranular.md` — Detalles + Cloud Function
- `11-US-1103-FixNoSaveEmpty.md` — Fix D-018 + justificación

**README Sprint 10:**
- `src/docs/sprints/sprint-10/README.md` — Actualizado con Fase 2

---

## ✅ FASE 3 — Firebase como Caché Único (Implementada 2026-04-21)

### Estructura Documentada

**2 User Stories:**
1. **US-1104:** Firebase as Cache — Climas (TTL simple, 3-4 SP)
2. **US-1105:** Firebase as Cache — Tabla Predictiva (Delta Sync, 3-4 SP)

**Timeline Total:** 6-8 horas

**Documentación Creada:**
```
src/docs/sprints/sprint-10/
  ├── US-1104-FirebaseAsCache-Climas.md        ✅ Documentada (pseudocódigos, diagramas)
  └── US-1105-FirebaseAsCache-Tabla.md         ✅ Documentada (Delta Sync 3 algoritmos)
```

**Arquitectura Clarificada:**
- **Firestore:** Source of truth (AccuWeather → Firestore)
- **IndexedDB:** Caché local dual-layer (latencia crítica 40ms)
- **Climas:** TTL simple (cache fresco = mostrar + FIN, sin sync background)
- **Tabla Predictiva:** Delta Sync (query WHERE created_at > lastSyncTime, merge + dedup)

---

## ⏭️ Próximas Acciones

### Fase 2 (Si se implementa):
1. **Implementación:** US-1103 (30-45 min)
2. **Implementación:** US-1101 (2-3 h)
3. **Implementación:** US-1102 (2-3 h)

### Fase 3 (Si se implementa):
1. **Implementación:** US-1104 Climas (3-4 h)
2. **Implementación:** US-1105 Tabla (3-4 h)

### Validación Final:
- Tests >85% coverage
- Build sin warnings
- Manual QA (UI + Firebase + IndexedDB)
- Merge `sprint-10` → `develop`

---

**Estado Actual:** ✅ Fases 1/2/3 documentadas, arquitectura definida, **listo para implementación en próxima sesión**.
