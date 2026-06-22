# BUG-029 — Auto-sync desactivado no persiste entre sesiones

**Reportado:** 2026-06-22
**Prioridad:** Alta
**Estimacion:** 0.5h
**Estado:** Pendiente

---

## Descripcion

Cuando el usuario desactiva auto-sync via `SyncToggle`, la UI responde
correctamente y el sync se detiene. Pero al recargar la app (o navegar
y volver), el toggle aparece activado de nuevo.

---

## Causa raiz

`initializeSettings()` en `settingsService.ts` siempre ejecuta:

```ts
await setDoc(
  settingsRef,
  { autoSyncEnabled: true, createdAt: new Date(), updatedAt: new Date() },
  { merge: true }
)
```

`merge: true` NO preserva campos que estan presentes en el objeto nuevo.
Solo omite campos del doc existente que NO estan en el objeto nuevo.
Como `autoSyncEnabled: true` esta explicito, **sobreescribe el valor
guardado** en cada arranque de la app.

Flujo del bug:
1. Usuario desactiva sync → `updateAutoSyncSetting(false)` → Firestore: `false`
2. App recarga → `initializeSettings()` → `setDoc({ autoSyncEnabled: true }, merge)` → Firestore: `true`
3. `getAutoSyncSetting()` lee `true` → toggle aparece activado

---

## Archivos involucrados

| Archivo | Linea | Problema |
|---------|-------|---------|
| `src/services/firebase/settingsService.ts` | 17-38 | `initializeSettings` sobreescribe `autoSyncEnabled` siempre |
| `src/App.tsx` | 65-80 | Llama `initializeSettings()` + `getAutoSyncSetting()` en cada mount |

---

## Fix propuesto

En `initializeSettings`, verificar primero si el doc ya existe.
Solo escribir los defaults si el doc NO existe:

```ts
export async function initializeSettings(): Promise<void> {
  const db = await getDb()
  const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
  const snapshot = await getDoc(settingsRef)

  if (snapshot.exists()) return  // ya existe, no sobreescribir

  await setDoc(settingsRef, {
    autoSyncEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}
```

Alternativa: eliminar `initializeSettings()` del flujo de startup
(es redundante — `getAutoSyncSetting` ya hace `initializeSettings`
internamente si el doc no existe).

---

## Comportamiento esperado

- Usuario desactiva auto-sync
- Recarga la app
- Toggle sigue desactivado
- `getAutoSyncSetting()` retorna `false`
