# 🔄 Sesión 3: Integración Final

**Duración:** ~2 horas  
**Objetivo:** Toggle Clima ⇄ Nidos + E2E testing  
**Prerequisitos:** Sesión 1 + 2 completadas ✅  

---

## 📋 Tareas por Completar

### 1️⃣ ModeToggle.tsx (Toggle Clima ⇄ Nidos)

**Archivo:** `src/components/Header/ModeToggle.tsx`  
**Size:** ~70 líneas

**Estructura:**
```tsx
export function ModeToggle() {
  const { currentMode, setCurrentMode } = useStore()

  return (
    <div className="mode-toggle">
      <button
        className={currentMode === 'clima' ? 'active' : ''}
        onClick={() => setCurrentMode('clima')}
      >
        🌞 CLIMA
      </button>
      <button
        className={currentMode === 'nests' ? 'active' : ''}
        onClick={() => setCurrentMode('nests')}
      >
        🏠 NIDOS
      </button>
    </div>
  )
}
```

**CSS:**
```css
.mode-toggle {
  display: flex;
  gap: 4px;
}

.mode-toggle button {
  padding: 6px 12px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 150ms;
}

.mode-toggle button.active {
  background: var(--accent);
  color: white;
}
```

---

### 2️⃣ Actualizar Header.tsx

**Archivo:** `src/components/Header/Header.tsx`

**Cambios:**
```tsx
// IMPORTAR
import { ModeToggle } from './ModeToggle'

// EN RENDER, agregar junto a otros componentes header:
<ModeToggle />
```

**Ubicación en header:** Típicamente al lado de ThemeToggle o en su propia sección.

---

### 3️⃣ Actualizar App.tsx

**Archivo:** `src/App.tsx`

**Cambios principales:**

```tsx
// IMPORTAR
import { useNests } from '@/hooks/useNests'
import { NestMapView } from '@/components/Nests/NestMapView'
import { NestFeed } from '@/components/Nests-Sidebar/NestFeed'

// EN COMPONENTE (dentro de useEffect):
useEffect(() => {
  const { run } = useNests()
  run(() => {
    console.log('[App] Nests initialized')
  })
}, [])

// EN RENDERIZADO (donde está MapView + LocationFeed):
// ANTES:
// <MapView />
// <LocationFeed />

// DESPUÉS (reemplazar):
{currentMode === 'clima' ? (
  <>
    <MapView />
    <LocationFeed />
  </>
) : (
  <>
    <NestMapView />
    <NestFeed />
  </>
)}
```

---

## ✅ E2E Testing

### Test 1: Rendimiento Inicial
- [ ] App carga sin errores
- [ ] Clima es modo por defecto
- [ ] MapView (pins naranja) visible
- [ ] LocationFeed (ciudades) visible

### Test 2: Toggle a Nidos
- [ ] Clic en ModeToggle → 🏠 NIDOS se activa
- [ ] MapView desaparece
- [ ] NestMapView aparece (5 pins púrpura)
- [ ] LocationFeed desaparece
- [ ] NestFeed aparece (5 cards)

### Test 3: Interacción Nidos
- [ ] Clic en pin → NestTooltip popup aparece
- [ ] Clic en card → NestDetail abre
- [ ] Favorito (⭐) → toggle funciona
- [ ] Botón X en detail → cierra panel

### Test 4: Toggle de Vuelta
- [ ] Clic en ModeToggle → 🌞 CLIMA se activa
- [ ] NestMapView desaparece
- [ ] MapView aparece nuevamente
- [ ] LocationFeed aparece

### Test 5: Persistencia
- [ ] Recargar página (F5)
- [ ] Modo anterior se mantiene (localStorage)
- [ ] Nidos cargan desde IndexedDB (rápido)

### Test 6: Responsive (Opcional)
- [ ] Abrir DevTools → iPhone 12
- [ ] ModeToggle visible en móvil
- [ ] NestMapView responsive
- [ ] NestFeed scrollable

---

## 🔨 Build & Validación

### TypeScript Check
```bash
npm run type-check
# ✅ ZERO errors
```

### Build Production
```bash
npm run build
# ✅ EXIT 0
# ✅ Bundle size < 5MB
# ✅ No warnings
```

### Lighthouse (opcional)
```bash
# En DevTools: Ctrl+Shift+P → "Lighthouse"
# Mínimo:
# - Performance: > 80
# - Accessibility: > 80
# - Best Practices: > 80
```

---

## 📝 Actualizar Documentación

### Progress.md
```markdown
## Sprint 8 — Nidos MVP ✅

### Fase 1: Nidos MVP (2026-04-10 → 2026-04-10)
- ✅ US-801 Carga estática (Sesión 1)
- ✅ US-802 Pins mapa (Sesión 2)
- ✅ US-803 Sidebar listado (Sesión 2)
- ✅ US-804 Panel detalle (Sesión 2)
- ✅ US-805 Toggle Clima ⇄ Nidos (Sesión 3)
- ✅ US-806 Caché IndexedDB (Sesión 1)
- ✅ US-807 Popup tooltip (Sesión 2)

**Metrics:**
- Story Points: 16 ✅
- Build: PASSED ✅
- TypeScript: 0 errors ✅
- E2E: 5/5 tests PASSED ✅
```

---

## 🎯 Commit Final

```bash
# Agregar todos los cambios
git add -A

# Commit con mensaje descriptivo
git commit -m "feat(nests): MVP Sprint 8 Fase 1 — Cargar, visualizar e interactuar

- US-801 a US-807 completadas (16 SP)
- 5 nidos desde JSON → IndexedDB → Zustand
- Componentes: Mapa (4) + Sidebar (3) + Header (1)
- Servicios: nestService + nestCacheService
- Toggle Clima ⇄ Nidos funcional
- Favoritos persistentes
- Build ✅ PASSED
- TypeScript: 0 errors ✅
- E2E: 5/5 tests PASSED ✅

Rama: feature/nests
Base: v1.0.0-stable (71a3932)"
```

---

## 🚀 Próximos Pasos (Sprint 9)

Una vez completada esta rama, planear:
- Filtros (región, tipo, rarity)
- Búsqueda (nombre, ciudad)
- Ordenamiento (nombre, tipo, país)
- Visualización de áreas (S2 geometry)

**Próximo Commit:** `git push origin feature/nests`

---

## 📊 Checklist Final

- [ ] TypeScript: 0 errors
- [ ] Build: PASSED
- [ ] E2E: 5/5 tests
- [ ] Documentación actualizada
- [ ] Commit realizado
- [ ] Rama pusheada
- [ ] Ready para PR review

---

**Última actualización:** 2026-04-10  
**Rama:** feature/nests  
**Sesión:** 3 de 3

