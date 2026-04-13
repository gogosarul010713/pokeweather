# 🔄 US-805 — Toggle Clima ⇄ Nidos

**Sprint:** 8 (Fase 1) | **SP:** 2 | **Prioridad:** P0 | **Status:** ⏳ Pendiente | **Dep:** US-801 a US-804

---

## Historia

> Como usuario, quiero cambiar entre Clima y Nidos para ver ambos modos de contenido.

---

## Criterios

- [ ] ModeToggle.tsx en header: 🌞 CLIMA | 🏠 NIDOS
- [ ] Botones toggle (uno activo, otro inactivo)
- [ ] Clic cambia entre MapView y NestMapView
- [ ] Sidebar se adapta: LocationFeed vs NestFeed
- [ ] Filtros se resetean al cambiar modo
- [ ] Estado persistente en localStorage (pwe-currentMode)

---

## Archivos a Crear/Modificar

### ModeToggle.tsx (CREAR - ~70 líneas)

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
  align-items: center;
}

.mode-toggle button {
  padding: 6px 12px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 150ms;
  font-weight: 500;
}

.mode-toggle button.active {
  background: var(--nest-primary);
  color: white;
  border-color: var(--nest-primary);
}

.mode-toggle button:hover {
  border-color: var(--nest-primary);
}
```

**Ubicación:** `src/components/Header/ModeToggle.tsx`

---

### Header.tsx (MODIFICAR)

**Agregar:**
```tsx
import { ModeToggle } from './ModeToggle'

// En render:
<ModeToggle />
```

---

### App.tsx (MODIFICAR)

**Agregar en renderización:**
```tsx
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

## Validación

- [ ] ModeToggle visible en header
- [ ] Botón clima/nidos responde a clic
- [ ] MapView/NestMapView cambia
- [ ] Sidebar cambia LocationFeed/NestFeed
- [ ] Estado persiste en reload

---

**Última actualización:** 2026-04-12 | **Sesión:** 3 (Integración)

