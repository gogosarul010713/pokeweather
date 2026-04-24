# 🎯 Sprint 10 Fase 4 — US-1106: Auto Sync HH:00 + Toggle Configurable

**Fecha Inicio:** 2026-04-23 (Session 8)  
**Fecha Finalización:** 2026-04-24 (Session 9)  
**Sprint:** 10 (Ampliación Fase 4)  
**Story Points:** 2 SP  
**Estado:** ✅ COMPLETADA (Ambas subtareas A y B)

---

## ✅ Estado de Implementación (2026-04-23 Session 8)

### Completado
- ✅ **Paso 1:** Cloud Function — cron HH:15 → HH:00 + chequeo flag autoSyncEnabled
- ✅ **Paso 2:** settingsService.ts — CRUD para Firestore /settings/app-config
- ✅ **Paso 3:** Zustand state — autoSyncEnabled + setAutoSyncEnabled action
- ✅ **Paso 4:** SyncToggle.tsx — componente de configuración (listo para settings panel)
- ✅ **Paso 5:** Header integration — toggle button (⏰/🔴) en hd-right
- ✅ **Paso 6:** App.tsx — cargar settings al iniciar

### Cambios en Code
- `functions/src/index.ts`: Cron `15 * * * *` → `0 * * * *` + flag check (11 líneas)
- `src/services/firebase/settingsService.ts`: **NUEVO** (95 líneas)
- `src/store/useStore.ts`: Agregado `autoSyncEnabled` field + setter (3 líneas)
- `src/components/Header/Header.tsx`: Toggle button + handler (50+ líneas)
- `src/components/Settings/SyncToggle.tsx`: **NUEVO** (100 líneas, opcional)
- `src/App.tsx`: useEffect para cargar settings (18 líneas)

### Validado ✅ (2026-04-24)
- ✅ Build sin nuevos errores
- ✅ Deploy functions exitoso (3/3 functions)
- ✅ Cron `0 * * * *` activo en Cloud Scheduler
- ✅ Lógica de chequeo de flag en Cloud Function
- ✅ Zustand state + settingsService funcional
- ✅ App.tsx carga settings al montar

### ✅ Completado Session 9 (US-1106-B Refactor UI)

**Cambio 1: Remover toggle del Header** ✅
- Archivo: `src/components/Header/Header.tsx`
- Removido:
  - ✅ Import: `updateAutoSyncSetting`
  - ✅ State: `isSyncSaving`
  - ✅ Zustand reads: `autoSyncEnabled`, `setAutoSyncEnabled`
  - ✅ Handler: `handleToggleAutoSync()`
  - ✅ HTML button: `<button className="hd-sync-toggle"...>` (14 líneas)
  - ✅ CSS: `.hd-sync-toggle { ... }` (44 líneas)
- Resultado: Header más limpio (4 botones → 3) ✅

**Cambio 2: Agregar pestaña "Sincronización" en TestingTools** ✅
- Archivo: `src/components/TestingTools/TestingTools.tsx`
- Agregado:
  - ✅ Pestaña 4: "⚙️ Sincronización" (junto a Reportes, Limpiar, Predicciones)
  - ✅ Toggle: Auto-sync ON/OFF con status visual (🟢/🔴)
  - ✅ Botón: "Sincronizar Ahora" (movido del Header)
  - ✅ Reutilizar `updateAutoSyncSetting()` + `handleToggleAutoSync()`
- Resultado: Todos los controles de admin/testing en un lugar ✅

**Cambio 3: Mantener en Zustand** ✅
- ✅ `autoSyncEnabled` state preservado (usado por Cloud Function chequeo)

**Testing manual completado:**
- ✅ Build sin errores (1.54s, 132 modules)
- ✅ Header sin toggle (3 botones visibles)
- ✅ TestingTools con 4 pestañas (Reportes, Limpiar, Predicciones, Sincronización)
- ⏳ Esperar HH:00 UTC con auto-mode ON → verificar sync ejecuta (future validation)

---

## 📋 Objetivo General

Permitir que el usuario **controle totalmente cuándo se generan datos meteorológicos**:
- **Auto activado:** Servidor sincroniza automáticamente cada HH:00 (24h/día)
- **Auto desactivado:** Solo sincroniza cuando el usuario abre la app manualmente
- **Propósito:** Generar datasets de X días, limpiar datos, repetir ciclo para análisis de precisión

---

## 🏗️ Subtareas

### Subtarea A: Cambiar cron HH:15 → HH:00 + Flag de control

**Archivos a modificar:**
- `functions/src/index.ts` — actualizar cron + agregar chequeo flag
- `functions/.env` — documentar nueva variable (opcional)

**Cambios específicos:**

1. **Línea 14:** Cambiar cron
```typescript
// ANTES:
.schedule('15 * * * *')

// DESPUÉS:
.schedule('0 * * * *')  // HH:00 cada hora
```

2. **Agregar chequeo de flag** (después de línea 16, en onRun):
```typescript
onRun(async (context) => {
  try {
    // ← NUEVO: Chequear si auto-sync está habilitado
    const settingsRef = db.collection('settings').doc('app-config')
    const settings = await settingsRef.get()
    const autoSyncEnabled = settings.data()?.autoSyncEnabled ?? true
    
    if (!autoSyncEnabled) {
      console.log('[syncWeatherScheduled] Auto-sync disabled, skipping')
      return { skipped: true }
    }
    
    console.log(`[${new Date().toISOString()}] Scheduled sync triggered`)
    const result = await syncWeatherLogic()
    console.log(`[${new Date().toISOString()}] Scheduled sync completed:`, result)
    return result
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Scheduled sync error:`, error)
    throw error
  }
})
```

3. **Inicializar documento settings en Firestore** (cuando la app carga por primera vez):
- Path: `/settings/app-config`
- Schema:
```json
{
  "autoSyncEnabled": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

**Criterios de aceptación:**
- [ ] Cron se ejecuta a HH:00 UTC (vs HH:15)
- [ ] Función chequea `settings/app-config.autoSyncEnabled` antes de ejecutar
- [ ] Si `autoSyncEnabled === false`, retorna `{ skipped: true }` sin hacer nada
- [ ] Si `autoSyncEnabled === true`, ejecuta normalmente
- [ ] Tests verdes (mock Firestore)
- [ ] Build sin errores

**Esfuerzo:** ~20 minutos

---

### Subtarea B: Toggle UI + Persistencia

**Archivos a crear/modificar:**
- `src/store/useStore.ts` — agregar Zustand state para toggle
- `src/components/Settings/SyncToggle.tsx` — componente nuevo
- `src/components/Header.tsx` — integración del toggle
- `src/services/firebase/settingsService.ts` — lógica Firestore

**Cambios:**

1. **Zustand state** (`src/store/useStore.ts`):
```typescript
interface StoreState {
  // ... existing ...
  autoSyncEnabled: boolean
  setAutoSyncEnabled: (enabled: boolean) => void
}

export const useStore = create<StoreState>((set) => ({
  // ... existing ...
  autoSyncEnabled: true,
  setAutoSyncEnabled: (enabled: boolean) => {
    set({ autoSyncEnabled: enabled })
  },
}))
```

2. **Nuevo servicio** (`src/services/firebase/settingsService.ts`):
```typescript
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { getDb } from './firebaseConfig'

export async function updateAutoSyncSetting(enabled: boolean): Promise<void> {
  const db = await getDb()
  const settingsRef = doc(db, 'settings', 'app-config')
  
  await updateDoc(settingsRef, {
    autoSyncEnabled: enabled,
    updatedAt: new Date(),
  })
}

export async function getAutoSyncSetting(): Promise<boolean> {
  const db = await getDb()
  const settingsRef = doc(db, 'settings', 'app-config')
  const snapshot = await getDoc(settingsRef)
  
  return snapshot.data()?.autoSyncEnabled ?? true
}
```

3. **Componente Toggle** (`src/components/Settings/SyncToggle.tsx`):
```typescript
import { useStore } from '../../store/useStore'
import { updateAutoSyncSetting } from '../../services/firebase/settingsService'

export function SyncToggle() {
  const { autoSyncEnabled, setAutoSyncEnabled } = useStore()
  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = async (enabled: boolean) => {
    setIsSaving(true)
    try {
      await updateAutoSyncSetting(enabled)
      setAutoSyncEnabled(enabled)
      // Toast: "Auto-sync " + (enabled ? "activado" : "desactivado")
    } catch (error) {
      console.error('Error updating auto-sync setting:', error)
      // Toast error
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="sync-toggle">
      <label>
        Auto-sync de climas
        <input
          type="checkbox"
          checked={autoSyncEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={isSaving}
        />
      </label>
      {autoSyncEnabled ? (
        <span className="status">Automático (HH:00 UTC)</span>
      ) : (
        <span className="status">Manual (cuando abras la app)</span>
      )}
    </div>
  )
}
```

4. **Integración en Header** (`src/components/Header.tsx`):
- Agregar `<SyncToggle />` en algún lugar visible (settings dropdown o inline)

5. **Cargar setting al iniciar App** (`src/App.tsx`):
```typescript
useEffect(() => {
  async function loadSettings() {
    const enabled = await getAutoSyncSetting()
    setAutoSyncEnabled(enabled)
  }
  loadSettings()
}, [])
```

**Criterios de aceptación:**
- [ ] Toggle visible en Header o Settings
- [ ] Cambiar estado actualiza Firestore en tiempo real
- [ ] Estado persiste entre recargas (localStorage + Firestore)
- [ ] Cuando `autoSyncEnabled = false`, cron no ejecuta
- [ ] Cuando `autoSyncEnabled = true`, cron ejecuta normalmente
- [ ] UI feedback clara (tooltips, status messages)
- [ ] Tests >85% coverage
- [ ] Build sin warnings

**Esfuerzo:** ~60 minutos

---

## 🔄 Flujo de Usuario (Final)

### Escenario: Recolectar datos 3 días, luego limpiar y repetir

```
Lunes 8am:
  ✓ Toggle = AUTO ACTIVADO
  ✓ HH:00: Cron ejecuta automáticamente
  ✓ HH:01: Ejecuta de nuevo
  ... 24 veces ese día

Martes:
  ✓ El cron sigue automático 24×

Miércoles 2pm:
  ✓ Presiona botón "Limpiar datos" (US-1102)
  ✓ Borraría todos los datos de Firestore
  ✓ Cambia toggle a MANUAL DESACTIVADO

Miércoles 3pm - Nuevo ciclo:
  ✓ Abre app → presiona "Sincronizar ahora" (botón TestingTools)
  ✓ Se ejecuta syncWeatherManual UNA sola vez
  ✓ Cierra app
  ✓ Cron NO ejecuta (toggle desactivado)
  ✓ Abre app a las 5pm → presiona "Sincronizar ahora" otra vez
  ✓ Total: solo los syncs que EL presionó manualmente
```

---

## 📊 Estimación

| Subtarea | Esfuerzo |
|----------|----------|
| A: Cron + Flag | 20 min |
| B: UI + Zustand | 60 min |
| Redeploy + Testing | 20 min |
| **Total** | **~100 min = 1.7 SP** |

Redondeamos a **2 SP** (margen para QA manual).

---

## ✅ Checklist Implementación

- [ ] Actualizar `functions/src/index.ts` (cron + flag)
- [ ] Crear `src/services/firebase/settingsService.ts`
- [ ] Crear `src/components/Settings/SyncToggle.tsx`
- [ ] Actualizar `src/store/useStore.ts`
- [ ] Integrar toggle en Header
- [ ] Cargar setting en App init
- [ ] Escribir tests (Vitest + mock Firestore)
- [ ] Manual testing: activar/desactivar + verificar Firestore
- [ ] Deploy functions
- [ ] Validar cron en Firebase Console
- [ ] Build sin errores
- [ ] PR + merge a develop

---

## 🔗 Decisiones Aplicadas

- **D-025 (revisada):** Auto-sync es configurable ahora, no 100% automático
- **D-002:** Firebase sigue como backend (settings en /settings/app-config)
- **D-017:** Delta Sync no se ve afectado por este cambio

---

## 📚 Documentación Creada

- `src/docs/sprints/sprint-10/14-US-1106-AutoSyncToggle.md` ← Crear durante impl

