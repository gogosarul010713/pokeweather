# 🐛 Bug Summary — Sprint 10

Índice de todos los bugs encontrados y resueltos durante Sprint 10.

## Bugs por Fase

### Fase 2 — Sincronización Automática + Cleanup

| Bug | Descripción | Causa Raíz | Status | Commit |
|-----|-------------|-----------|--------|--------|
| [BUG-001](bug-001-clearfirestoredata-401-unauthenticated.md) | clearFirestoreData: 401 UNAUTHENTICATED | Falta Anonymous Auth en cliente | ✅ FIXED | D-026 |
| [BUG-002](bug-002-deploy-sin-compilar-functions.md) | Deploy Cloud Functions sin compilar | `npm run deploy:functions` no compilaba | ✅ FIXED | Session 7 |
| [BUG-003](bug-003-env-var-vite-prefix-no-existe-servidor.md) | Env var VITE-prefix no existe en servidor | `VITE_*` es exclusivo de Vite/frontend | ✅ FIXED | D-026 |
| [BUG-004](bug-004-cors-preflight-bloqueado-por-auth.md) | CORS preflight bloqueado por auth | Falta `Access-Control-*` headers | ✅ FIXED | Session 7 |
| [BUG-005](bug-005-cascade-delete-no-elimina-subcolecciones.md) | Cascade delete no elimina subcolecciones | Firestore no cascadea automático | ✅ FIXED | D-027 |
| [BUG-006](bug-006-usefirestoresync-callback-remount-infinito.md) | useFirestoreSync callback remount infinito | Missing dependency array | ✅ FIXED | Session 7 |

### Fase 6 — Validación + Features

| Bug | Descripción | Causa Raíz | Status | Commit |
|-----|-------------|-----------|--------|--------|
| [BUG-007](bug-007-forecasts-desaparecen.md) | Tabla vacía, docs sin snapshots | D-018 no implementada | ✅ FIXED | `a44958e` |
| [BUG-008](bug-008-reporte-no-actualiza-tabla.md) | Columna "Real" nunca se actualiza (v1-v3) | date_hour LOCAL vs UTC mismatch | ✅ FIXED | D-032 |
| [BUG-010](bug-010-copiar-coords.md) | Copiar coords: checkmark en todas filas | cityId→rowId mapping | ✅ FIXED | `aa977c2` |

### Fase 8 — Cleanup Cascade Delete

| Bug | Descripción | Causa Raíz | Status | Commit |
|-----|-------------|-----------|--------|--------|
| [BUG-009](bug-009-lookback-vacio.md) | Lookback 12h siempre vacío (3 causas) | Timestamp serialización + gate if(report) | ✅ FIXED | D-033 |
| [BUG-011](bug-011-reports-survive-cascade-delete.md) | Reportes sobreviven cascade delete | Cascade no incluye subcolecciones | ✅ FIXED | US-1109 |

---

## Patrones Comunes

### 1. Auth + Deploy (BUG-001 a 006)
- **Contexto:** Fase 2 — Cloud Function primeras implementaciones
- **Patrón:** Auth token falta, env vars mal configurados, headers CORS
- **Lección:** Verificar Firebase Console settings ANTES de testear

### 2. Data Integrity (BUG-007 a 010)
- **Contexto:** Fase 6-7 — Validación de datos después de persistencia
- **Patrón:** Timestamp mismatch (LOCAL vs UTC), serialización incompleta, índices corrupto
- **Lección:** Firestore requiere manejo explícito de tipos (Timestamp vs number)

### 3. Cascade Delete (BUG-011)
- **Contexto:** Fase 8 — Cleanup + cascade delete
- **Patrón:** Firestore no cascadea automático, subcolecciones quedan huérfanas
- **Lección:** Siempre eliminar subcolecciones ANTES del documento padre

---

## Si un Bug Vuelve a Aparecer

### BUG-001/003/006 (Auth)
→ Verificar: `firebaseConfig.ts` `signInAnonymously()`, `.env.local` vars, Cloud Function headers

### BUG-002 (Deploy)
→ Ejecutar: `cd functions && npm install && npm run build && firebase deploy --only functions`

### BUG-004 (CORS)
→ Verificar: Cloud Function `response.set('Access-Control-Allow-Origin', '*')`

### BUG-005/011 (Cascade)
→ Regla: Query subcolecciones ANTES, delete en orden inverso de dependencia

### BUG-007/008/009 (Data)
→ Verificar: `saveCityForecast()` → `getHours()+1` (LOCAL), `created_at` tipo (Timestamp vs number)

---

**Total Bugs Resueltos:** 11 (BUG-001 a BUG-011, sin BUG-010 en primera iteración)  
**Sprint Duration:** 10 días (2026-04-16 → 2026-04-26)  
**Resolution Rate:** 100% ✅
