# BUG-029 — Auto-sync desactivado no persiste entre sesiones

**Sprint:** 12
**Fecha de deteccion:** 2026-06-22
**Fecha de fix:** 2026-06-22
**Estado:** FIXED + VALIDADO 2026-06-22
**Branch:** `sprint-12`

---

## Sintoma

Cuando el usuario desactivaba auto-sync via `SyncToggle`, la UI respondía
correctamente y el sync se detenía. Pero al recargar la app, el toggle
aparecía activado de nuevo — ignorando la preferencia guardada.

---

## Root Cause

`initializeSettings()` en `settingsService.ts` ejecutaba `setDoc` con
`{ autoSyncEnabled: true }` + `{ merge: true }` en cada arranque de la app.

El malentendido: `merge: true` en Firestore preserva campos del doc existente
que estan **ausentes** en el nuevo objeto. Pero `autoSyncEnabled: true` estaba
**presente y explicito**, por lo que **siempre sobreescribía** el valor guardado.

Flujo del bug:
1. Usuario desactiva sync → `updateAutoSyncSetting(false)` → Firestore: `false`
2. App recarga → `initializeSettings()` → `setDoc({ autoSyncEnabled: true }, merge)` → Firestore: `true`
3. `getAutoSyncSetting()` lee `true` → toggle aparece activado

---

## Fix

**Archivo:** `src/services/firebase/settingsService.ts` — funcion `initializeSettings`

Antes de escribir, verificar si el doc ya existe. Si existe, retornar sin tocar nada.

```ts
// ANTES — sobreescribia autoSyncEnabled en cada arranque
await setDoc(settingsRef, { autoSyncEnabled: true, ... }, { merge: true })

// DESPUES — solo escribe si el doc no existe
const snapshot = await getDoc(settingsRef)
if (snapshot.exists()) return
await setDoc(settingsRef, { autoSyncEnabled: true, ... })
```

Se eliminó `merge: true` porque ya no es necesario — el `setDoc` solo se
ejecuta cuando el doc no existe.

---

## Validacion

- Desactivar auto-sync en UI
- Recargar la app
- Toggle debe aparecer desactivado
- `getAutoSyncSetting()` debe retornar `false`
