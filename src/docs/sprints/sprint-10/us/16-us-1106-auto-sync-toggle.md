# US-1106: Auto-Sync HH:00 + Toggle Configurable

**Sprint:** 10 (Fase 4 — Ampliación)  
**Story Points:** 2 SP  
**Prioridad:** Media  
**Estado:** 🏗️ En implementación (2026-04-23)

---

## 📋 Descripción

**Objetivo:** Dar control total al usuario sobre cuándo se generan datos meteorológicos.

Actualmente:
- Cron en Firebase ejecuta automáticamente cada HH:15 (24h/día)
- Usuario no puede pausar la colección de datos

Nuevo:
- Cron ejecuta cada HH:00 (cambio menor de tiempo)
- Toggle en UI para activar/desactivar auto-sync
- **Auto-sync activado:** Cron ejecuta automáticamente HH:00 24h/día
- **Auto-sync desactivado:** Cron se pausea, solo ejecuta cuando usuario presiona "Sincronizar ahora"

**Propósito:** Permitir al usuario generar datasets de X días, limpiar, y repetir ciclos para análisis de precisión sin datos residuales.

---

## 🎯 Requisitos

1. **Cambiar cron HH:15 → HH:00**
   - Función scheduled se ejecuta a cada hora completa (HH:00)
   - Más predecible para usuario ("cada hora en punto")

2. **Flag de control en Firestore**
   - Documento: `/settings/app-config`
   - Campo: `autoSyncEnabled: boolean` (default `true`)
   - Cron chequea este flag antes de ejecutar
   - Si `false`, retorna `{ skipped: true }` sin hacer nada

3. **Toggle UI en app**
   - Visible en Header o Settings
   - Cambio actualiza Firestore en tiempo real
   - Estado persiste entre recargas

4. **Integración end-to-end**
   - Toggle ↔ Firestore ↔ Cron
   - Cuando desactivado: botón "Sincronizar ahora" es la única forma manual
   - Cuando activado: cron automático + botón manual disponible

---

## 🏗️ Arquitectura

### Flujo cuando auto-sync está ACTIVADO:

```
Zustand (autoSyncEnabled = true)
  ↓
Firestore (/settings/app-config, autoSyncEnabled: true)
  ↓
Firebase Scheduled Function (HH:00)
  ├─ Chequea /settings/app-config
  ├─ autoSyncEnabled === true → continúa
  ├─ Promise.all(5 ciudades)
  └─ Guarda en /city_weather/{city_id}/forecasts/...
       ↓
    useFirestoreSync (onSnapshot)
       ↓
    React state actualiza
       ↓
    UI re-renderiza
```

### Flujo cuando auto-sync está DESACTIVADO:

```
Zustand (autoSyncEnabled = false)
  ↓
Firestore (/settings/app-config, autoSyncEnabled: false)
  ↓
Firebase Scheduled Function (HH:00)
  ├─ Chequea /settings/app-config
  ├─ autoSyncEnabled === false → SKIP
  └─ Retorna { skipped: true }

[Solo cuando usuario presiona "Sincronizar ahora"]
  ↓
syncWeatherManual endpoint (HTTP + x-cron-secret)
  ├─ No chequea flag (forzado manual)
  └─ Ejecuta normalmente → guarda a Firestore
```

---

## 📝 Cambios de Código

### 1. Cloud Function (`functions/src/index.ts`)

**Cambio 1: Actualizar cron de HH:15 a HH:00**
```typescript
// ANTES:
export const syncWeatherScheduled = functions.pubsub
  .schedule('15 * * * *')
  .timeZone('UTC')

// DESPUÉS:
export const syncWeatherScheduled = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('UTC')
```

**Cambio 2: Agregar chequeo de flag (en onRun)**
```typescript
onRun(async (context) => {
  try {
    // Chequear si auto-sync está habilitado
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

**Cambio 3: NO modificar syncWeatherManual** (sigue disponible siempre, sin chequeo de flag)

---

### 2. Services — Settings (`src/services/firebase/settingsService.ts`)

Archivo NUEVO:

```typescript
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { getDb } from './firebaseConfig'

const SETTINGS_DOC = 'app-config'
const SETTINGS_COLLECTION = 'settings'

/**
 * Obtener setting auto-sync del usuario
 * Default: true (auto activado por defecto)
 */
export async function getAutoSyncSetting(): Promise<boolean> {
  try {
    const db = await getDb()
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
    const snapshot = await getDoc(settingsRef)

    if (!snapshot.exists()) {
      // Si no existe, inicializar con default true
      await initializeSettings()
      return true
    }

    return snapshot.data()?.autoSyncEnabled ?? true
  } catch (error) {
    console.error('[getAutoSyncSetting] Error:', error)
    return true // Default safe
  }
}

/**
 * Actualizar setting auto-sync
 */
export async function updateAutoSyncSetting(enabled: boolean): Promise<void> {
  try {
    const db = await getDb()
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)

    await updateDoc(settingsRef, {
      autoSyncEnabled: enabled,
      updatedAt: new Date(),
    })

    console.log(`[updateAutoSyncSetting] Updated to ${enabled}`)
  } catch (error) {
    console.error('[updateAutoSyncSetting] Error:', error)
    throw error
  }
}

/**
 * Inicializar documento settings si no existe
 */
export async function initializeSettings(): Promise<void> {
  try {
    const db = await getDb()
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)

    await setDoc(settingsRef, {
      autoSyncEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true })

    console.log('[initializeSettings] Settings initialized')
  } catch (error) {
    console.error('[initializeSettings] Error:', error)
    // Non-fatal, can ignore
  }
}
```

---

### 3. Store — Zustand (`src/store/useStore.ts`)

Agregar a la interface y state:

```typescript
interface StoreState {
  // ... existing fields ...
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

---

### 4. Componente Toggle (`src/components/Settings/SyncToggle.tsx`)

Archivo NUEVO:

```typescript
import { useState } from 'react'
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
      
      // Toast feedback
      const message = enabled
        ? '✓ Auto-sync activado (HH:00 UTC)'
        : '✓ Auto-sync desactivado (solo manual)'
      console.log(message)
    } catch (error) {
      console.error('Error updating auto-sync:', error)
      // Toast error
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="sync-toggle">
      <label>
        <input
          type="checkbox"
          checked={autoSyncEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={isSaving}
        />
        <span className="label-text">
          {autoSyncEnabled ? '🟢 Automático (HH:00 UTC)' : '🔴 Manual (bajo demanda)'}
        </span>
      </label>
      <span className="help-text">
        {autoSyncEnabled
          ? 'Sincronización automática cada hora en punto'
          : 'Solo sincroniza cuando presionas "Sincronizar ahora"'}
      </span>
    </div>
  )
}

// CSS
const styles = `
.sync-toggle {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.sync-toggle label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.sync-toggle input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.label-text {
  font-weight: 500;
}

.help-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}
`
```

---

### 5. Integración en Header (`src/components/Header.tsx`)

Agregar import y componente:

```typescript
import { SyncToggle } from './Settings/SyncToggle'

export function Header() {
  // ... existing code ...
  
  return (
    <header className="app-header">
      {/* ... logo, title, etc ... */}
      
      {/* Settings dropdown o panel */}
      <div className="header-settings">
        <SyncToggle />
      </div>
    </header>
  )
}
```

---

### 6. Cargar settings en App init (`src/App.tsx`)

```typescript
import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { getAutoSyncSetting, initializeSettings } from './services/firebase/settingsService'

function App() {
  const { setAutoSyncEnabled } = useStore()

  useEffect(() => {
    // Cargar configuración de auto-sync al iniciar
    async function loadSettings() {
      try {
        await initializeSettings()
        const enabled = await getAutoSyncSetting()
        setAutoSyncEnabled(enabled)
        console.log(`[App] Auto-sync loaded: ${enabled}`)
      } catch (error) {
        console.error('[App] Error loading settings:', error)
        // Default true (auto-sync activado)
        setAutoSyncEnabled(true)
      }
    }

    loadSettings()
  }, [setAutoSyncEnabled])

  // ... rest of App ...
}
```

---

## ✅ Criterios de Aceptación

- [ ] Cron ejecuta a HH:00 UTC (verificar en Firebase Console)
- [ ] Función chequea `settings/app-config.autoSyncEnabled` antes de sincronizar
- [ ] Si `autoSyncEnabled = false`, retorna `{ skipped: true }` sin realizar sync
- [ ] Si `autoSyncEnabled = true`, ejecuta `syncWeatherLogic()` normalmente
- [ ] Toggle visible en Header/Settings
- [ ] Cambiar toggle actualiza Firestore en real-time
- [ ] Estado persiste después de recargar la página
- [ ] Botón "Sincronizar ahora" funciona independientemente del toggle
- [ ] Documentos `settings/app-config` se crean automáticamente en Firestore
- [ ] Tests >85% coverage (mock Firestore, mock Cloud Function)
- [ ] Build sin errores TS
- [ ] Manual testing: activar/desactivar + verificar logs en Firebase Console

---

## 🧪 Manual Testing Plan

1. **Activar auto-sync:**
   - [ ] Toggle = ON
   - [ ] Esperar HH:00 UTC
   - [ ] Verificar en Firebase Console: Cloud Functions → syncWeatherScheduled → logs
   - [ ] Confirmar documentos creados en `/city_weather`

2. **Desactivar auto-sync:**
   - [ ] Toggle = OFF
   - [ ] Esperar HH:00 UTC
   - [ ] Verificar en Firebase Console: logs muestran `{ skipped: true }`
   - [ ] Confirmar que NO se crean nuevos documentos

3. **Manual trigger con auto desactivado:**
   - [ ] Auto-sync = OFF
   - [ ] Presionar "Sincronizar ahora"
   - [ ] Confirmar que se ejecuta y crea documentos (ignorando toggle)

4. **Persistencia:**
   - [ ] Auto-sync = ON
   - [ ] Recargar página
   - [ ] Confirmar que toggle se mantiene = ON
   - [ ] Cambiar a OFF, recargar
   - [ ] Confirmar que toggle se mantiene = OFF

---

## 📊 Sprint Impact

- **Firestore calls:** Reducción ~50% cuando auto = OFF (cron no ejecuta)
- **AccuWeather quota:** Flexible (0 en manual, 120/día en auto)
- **Bundle size:** Sin cambios (solo Zustand state + servicio)
- **Performance:** Sin impacto (chequeo de flag es <5ms)

---

## 🔗 Decisiones

- **D-029:** Auto-sync configurable mediante Firestore flag
- **D-002:** Settings guardado en `/settings/app-config`
- **D-025:** Cron se pausa, no se detiene permanentemente

---

## 📚 Referencias

- [US-1101: Sincronización Automática (Servidor HH:15)](09-US-1101-SyncAutomatic.md)
- [US-1102: Limpieza Granular de Firebase](10-US-1102-CleanupGranular.md)
- [Arquitectura Backend Firebase](../../architecture/09-weather-persistence-backend.md)
