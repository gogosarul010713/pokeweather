# US-1101: Modo Manual de Sincronización Climática

**Sprint:** 10 (Ampliación)  
**Story Points:** 3-4 SP  
**Prioridad:** Alta  
**Estado:** ⏳ Ready to Implement  
**Rama:** `sprint-10`

---

## 📋 Descripción

Hoy la app sincroniza el pronóstico climático **automáticamente cada hora** via `scheduleNextRefresh()` en `useWeather.ts`. Esta US agrega un **modo manual** donde el usuario (via Testing Tools) controla cuándo sincroniza.

**Cambio de comportamiento:**
- 🟢 Automático (default): Hoy — sincroniza cada HH:00:00 (actual)
- 🔴 Manual: Sync solo cuando usuario hace click en botón "Sincronizar ahora"

El toggle persiste en localStorage, permitiendo que el usuario "apague" la sincronización automática si lo desea.

---

## 🎯 Criterios de Aceptación

- [ ] **Flag en Zustand:** `useStore.state.syncAutomatic` (boolean, default `true`)
- [ ] **Persistencia:** Flag se guarda en localStorage (`pwe-sync-automatic`)
- [ ] **Botón "Sincronizar ahora":** Disponible en TestingTools cuando `syncAutomatic === false`
- [ ] **Comportamiento automático:**
  - Si `syncAutomatic === true`: `scheduleNextRefresh()` funciona (hoy)
  - Si `syncAutomatic === false`: `scheduleNextRefresh()` NO ejecuta
- [ ] **Dinámico:** Cambiar toggle (sin reload) actualiza el comportamiento al instante
  - Ej: User cambia a manual a las 09:55, timer programado para 10:00 se cancela
- [ ] **Testing Tools UI:**
  - Toggle: "Sincronización automática: ON/OFF"
  - Botón: "Sincronizar ahora" (habilitado solo si manual)
- [ ] **Tests unitarios:** Cobertura de flag transitions y callback execution

---

## 🏗️ Arquitectura

### Opción Elegida: Zustand + LocalStorage + Manual Callback (Opción C)

**Razón:** Simple, dinámico, compatible con D-017 (Delta Sync).

```typescript
// En useStore.ts
{
  syncAutomatic: boolean  // Flag de control
  setSyncAutomatic: (enabled: boolean) => void  // Setter
  triggerManualSync: async () => Promise<void>  // Callback para sync manual
}
```

### Integración en App

```typescript
// En App.tsx
useEffect(() => {
  if (useStore.state.syncAutomatic) {
    // Sync automático al montar
    syncForecastsOnLoad({ automatic: true })
  }
  // Si es manual, NO hace nada aquí
  // El usuario triggerará manualmente via botón
}, [])

// En useWeather.ts
const scheduleNextRefresh = () => {
  if (!useStore.state.syncAutomatic) {
    return  // Early exit si es manual
  }
  // ... rest de lógica de scheduling
}
```

### Callback Manual

```typescript
// En useStore.ts (action)
triggerManualSync: async () => {
  // Orquesta el sync manualmente (sin esperar próxima hora)
  await syncForecastsOnLoad({ automatic: false })
}
```

---

## 📋 Subtareas

### A: Agregar Flag a Zustand + LocalStorage Persistence

**Archivo:** `src/data/useStore.ts`

```typescript
// Agregar a store
export const useStore = create<Store & StoreMethods>(
  persist(
    (set, get) => ({
      // ... existing state
      syncAutomatic: true,  // ← NUEVO
      setSyncAutomatic: (enabled: boolean) =>
        set({ syncAutomatic: enabled }),
      
      triggerManualSync: async () => {  // ← NUEVO
        // Se implementa en subtarea C
      },
    }),
    {
      name: 'pwe-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // ... existing fields
        syncAutomatic: state.syncAutomatic,  // ← Persistir
      }),
    }
  )
)
```

**Validación:**
- localStorage `pwe-store` contiene `"syncAutomatic": true/false`
- Al recargar página, flag se recupera (comportamiento no reseteado)

---

### B: Integración en forecastSyncService + useWeather

**Archivos:**
- `src/services/forecast/forecastSyncService.ts`
- `src/hooks/useWeather.ts`

**Cambios en `forecastSyncService.ts`:**

```typescript
export const syncForecastsOnLoad = async (options: {
  automatic: boolean  // ← NUEVO param
}) => {
  if (!options.automatic && !useStore.getState().syncAutomatic) {
    // Si es manual y el flag NO está en manual, no ejecutar
    return
  }
  // ... rest de lógica
}
```

**Cambios en `useWeather.ts`:**

```typescript
const scheduleNextRefresh = () => {
  // ← NUEVO: Early exit si manual
  if (!useStore.state.syncAutomatic) {
    return
  }
  
  // ... existing scheduling logic
}

// Callback manual (llama directamente sin timer)
export const doManualRefresh = async () => {
  const { syncAutomatic } = useStore.state
  if (syncAutomatic) {
    return  // En automático, no hacer refresh manual (usa timer)
  }
  // Ejecutar sync Delta directamente
  await syncForecastsOnLoad({ automatic: false })
}
```

**Validación:**
- `syncAutomatic === true` → scheduleNextRefresh() ejecuta normalmente
- `syncAutomatic === false` → scheduleNextRefresh() hace early return
- Manual callback ejecuta incluso si hay carga en progreso

---

### C: UI en TestingTools

**Archivo:** `src/components/UI/TestingTools.tsx`

**Agregar nuevo tab "Configuración" o agregar a tab "Reportes":**

```tsx
// Dentro de TestingTools
const [syncMode, setSyncMode] = useState<'automatic' | 'manual'>(
  useStore.state.syncAutomatic ? 'automatic' : 'manual'
)

const handleToggleSyncMode = (mode: 'automatic' | 'manual') => {
  useStore.setState({ syncAutomatic: mode === 'automatic' })
  setSyncMode(mode)
}

const handleManualSync = async () => {
  setIsLoading(true)
  try {
    await useStore.state.triggerManualSync()
    showToast('Sincronización completada', 'success')
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error')
  } finally {
    setIsLoading(false)
  }
}

// Renderizar
return (
  <div className="ttd-config">
    <label>
      <input
        type="checkbox"
        checked={syncMode === 'automatic'}
        onChange={(e) => handleToggleSyncMode(e.target.checked ? 'automatic' : 'manual')}
      />
      Sincronización automática
    </label>
    
    {syncMode === 'manual' && (
      <button onClick={handleManualSync} disabled={isLoading}>
        {isLoading ? 'Sincronizando...' : 'Sincronizar ahora'}
      </button>
    )}
  </div>
)
```

**Validación:**
- Toggle visible en Testing Tools
- Cambiar toggle actualiza el comportamiento al tiro
- Botón solo visible en manual, disabled mientras carga

---

### D: Tests Unitarios

**Archivo:** `src/data/useStore.test.ts` (expandir)

```typescript
describe('useStore - Sync Control', () => {
  it('should initialize syncAutomatic as true', () => {
    const store = useStore.getState()
    expect(store.syncAutomatic).toBe(true)
  })

  it('should persist syncAutomatic to localStorage', () => {
    const store = useStore.getState()
    store.setSyncAutomatic(false)
    
    const saved = JSON.parse(localStorage.getItem('pwe-store') || '{}')
    expect(saved.syncAutomatic).toBe(false)
  })

  it('should recover syncAutomatic from localStorage on init', () => {
    localStorage.setItem(
      'pwe-store',
      JSON.stringify({ syncAutomatic: false })
    )
    
    const store = useStore.getState()
    expect(store.syncAutomatic).toBe(false)
  })

  it('should toggle syncAutomatic dynamically', () => {
    const store = useStore.getState()
    store.setSyncAutomatic(true)
    expect(store.syncAutomatic).toBe(true)
    
    store.setSyncAutomatic(false)
    expect(store.syncAutomatic).toBe(false)
  })

  it('triggerManualSync should call syncForecastsOnLoad', async () => {
    const spy = jest.spyOn(forecastSyncService, 'syncForecastsOnLoad')
    const store = useStore.getState()
    
    await store.triggerManualSync()
    
    expect(spy).toHaveBeenCalledWith({ automatic: false })
  })
})
```

---

## 🔄 Integración con D-017 (Delta Sync)

**D-017:** Delta Sync — Query Firestore solo docs creados después del `lastSyncTimestamp`

**Cómo US-1101 respeta D-017:**
- D-017 maneja *cómo* sincronizar (query delta inteligente)
- US-1101 maneja *cuándo* sincronizar (automático vs manual)
- **Ambos son ortogonales:** Sea automático o manual, siempre usa Delta Sync

```typescript
// Pseudocódigo
if (syncAutomatic) {
  scheduleNextRefresh()  // Timer automático
} else {
  // Usuario presiona botón
  triggerManualSync()  // Manual, bajo demanda
}

// En ambos casos, dentro de doRefresh():
await syncForecastsOnLoad({ automatic: ... })
  // ↓ Usa Delta Sync (D-017)
  // ↓ Query: where created_at > lastSyncTimestamp
```

---

## ✅ Checklist de Implementación

- [ ] Subtarea A: Zustand flag + localStorage
  - [ ] `syncAutomatic: boolean` declarado
  - [ ] `setSyncAutomatic()` setter funcional
  - [ ] Persistencia a localStorage verif
  - [ ] Test localStorage coverage
  
- [ ] Subtarea B: forecastSyncService + useWeather
  - [ ] `forecastSyncService` respeta flag
  - [ ] `scheduleNextRefresh()` early return si manual
  - [ ] `triggerManualSync()` implementado
  - [ ] Sin breaking changes en callers
  
- [ ] Subtarea C: TestingTools UI
  - [ ] Toggle visible y funcional
  - [ ] Botón "Sincronizar ahora" visible si manual
  - [ ] Dinámico (sin reload)
  - [ ] Toast feedback
  
- [ ] Subtarea D: Tests
  - [ ] 100% cobertura de nuevo código
  - [ ] Integration test: toggle + manual sync
  
- [ ] Final:
  - [ ] Build sin warnings
  - [ ] No regresiones en sync automático
  - [ ] Branch ready para merge
