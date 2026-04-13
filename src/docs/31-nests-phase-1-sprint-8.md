# 📋 Sprint 8 Fase 1 — Nidos MVP

**Objetivo:** Cargar, visualizar e interactuar con 5 nidos estáticos sin afectar Clima.

**Timeline:** 3 sesiones (3 días aproximados)  
**Total SP:** 16 SP  
**Rama:** `feature/nests`  

---

## 📊 User Stories Detalladas

### **US-801: Carga Estática de Nidos**
```
Título: Como usuario, quiero que los nidos se carguen al iniciar
Criterios:
  ✅ 5 nidos cargados desde src/data/nests.json
  ✅ Datos guardados en IndexedDB (nests_data)
  ✅ Tiempo de carga < 1 segundo
  ✅ Tipos TypeScript 100% (no any)
  ✅ Sin afectar carga de ciudades (clima)

Archivos:
  - src/hooks/useNests.ts (hook orquestación)
  - src/services/nests/nestCacheService.ts (IndexedDB)
  - src/store/useStore.ts (nests slice)

SP: 2
```

### **US-802: Pins de Nidos en Mapa**
```
Título: Como usuario, quiero ver nidos como pins en el mapa
Criterios:
  ✅ NestPin.tsx renderiza SVG gota púrpura
  ✅ Icono diferenciado de ciudades (naranja vs púrpura)
  ✅ Hover: Grow + glow visual
  ✅ Clic: abre NestTooltip
  ✅ Responsive: visible en 768px+
  ✅ Z-index correcto (1000+)

Archivos:
  - src/components/Nests/NestMapView.tsx (contenedor)
  - src/components/Nests/NestPin.tsx (pin SVG)

SP: 3
```

### **US-803: Sidebar Listado Nidos**
```
Título: Como usuario, quiero ver lista de nidos en sidebar
Criterios:
  ✅ NestFeed.tsx: scroll list con 5 nidos
  ✅ Cada card muestra: nombre + país + tipo Pokémon
  ✅ Clic en card → abre NestDetail
  ✅ Auto-scroll al seleccionar pin en mapa
  ✅ Favoritos: ⭐ toggle activo/inactivo
  ✅ 3 modos: 📋 (list) | 📍 (detalle) | ⭐ (favoritos)

Archivos:
  - src/components/Nests-Sidebar/NestFeed.tsx
  - src/components/Nests-Sidebar/NestCard.tsx

SP: 2
```

### **US-804: Panel Detalle Nido**
```
Título: Como usuario, quiero ver información completa del nido
Criterios:
  ✅ Nombre + país + región + ciudad
  ✅ Coordenadas copiables (copy to clipboard feedback)
  ✅ Pokémon nidificado: nombre + tipo + % spawn + IV mín
  ✅ Fecha descubierto + última verificación
  ✅ Radio cobertura + exactitud
  ✅ Badges: verified ✓ | hot 🔥 | new ⭐ | common_spawn ➕
  ✅ Botón favorito (⭐)
  ✅ Panel deslizante desde derecha (modal overlay)

Archivos:
  - src/components/Nests-Sidebar/NestDetail.tsx
  - Estilos: <style> con prefijo .nest-detail

SP: 3
```

### **US-805: Toggle Clima ⇄ Nidos**
```
Título: Como usuario, quiero cambiar entre Clima y Nidos
Criterios:
  ✅ ModeToggle.tsx en header: 🌞 CLIMA | 🏠 NIDOS
  ✅ Botones toggle (uno activo, otro inactivo)
  ✅ Clic cambia entre MapView (clima) y NestMapView (nidos)
  ✅ Sidebar se adapta: LocationFeed (clima) vs NestFeed (nidos)
  ✅ Filtros se resetean al cambiar modo
  ✅ Estado persistente en localStorage (pwe-currentMode)

Archivos:
  - src/components/Header/ModeToggle.tsx (nuevo)
  - src/App.tsx (actualizar renderizado)
  - src/store/useStore.ts (currentMode state)

SP: 2
```

### **US-806: Caché IndexedDB de Nidos**
```
Título: Como sistema, cachear nidos para sesiones posteriores
Criterios:
  ✅ nestCacheService.ts implementado:
    - getNest(nestId): Promise<Nest | null>
    - setNest(nestId, nest): Promise<void>
    - getAllNests(): Promise<Nest[]>
    - clearCache(): Promise<void>
  ✅ Colección "nests_data" separada de "weather_data"
  ✅ Segunda sesión: carga desde caché (0 JSON reads)
  ✅ Persistencia entre recargas de página

Archivos:
  - src/services/nests/nestCacheService.ts
  - src/hooks/useNests.ts (integrar getNest/setNest)

SP: 2
```

### **US-807: Popup Información Nido**
```
Título: Como usuario, quiero info rápida al hacer clic en pin
Criterios:
  ✅ NestTooltip.tsx: 3-4 líneas comprimidas
    Línea 1: 🟣 Nombre Nido | País
    Línea 2: Pokémon (tipo) | Spawn Rate (%)
    Línea 3: Badges (verified, hot, etc)
  ✅ Botón "Ver detalle →" abre NestDetail
  ✅ Botón "Copiar coords" con feedback visual
  ✅ Dark mode aware (CSS variables)
  ✅ Posicionamiento correcto (no sale del viewport)

Archivos:
  - src/components/Nests/NestTooltip.tsx

SP: 2
```

---

## 🗓️ Sesiones Estimadas

### Sesión 1: Servicios y Store
**Duración:** ~2 horas

- [ ] Leer 30-nests-architecture.md completo
- [ ] Crear `src/services/nests/nestService.ts`
  - Mapeos color tipo → Pokémon
  - Helper: `getPokemonTypeColor(type)`
  - Helper: `getNestBadgeIcon(badge)`
- [ ] Crear `src/services/nests/nestCacheService.ts`
  - IndexedDB schema
  - Crud operations
- [ ] Crear `src/hooks/useNests.ts`
  - `loadNests()` desde JSON
  - `setNestCache()` en IndexedDB
  - `run(onReady)` entry point
- [ ] Extender `src/store/useStore.ts`
  - Slice: nests, selectedNest, nestFavorites, currentMode
  - Acciones: setNests, setSelectedNest, toggleNestFavorite, setCurrentMode
  - Derivada: getFilteredNests (mock, sin filtros aún)

**Tests:**
- `console.log` 5 nidos cargados
- Verificar IndexedDB en DevTools

### Sesión 2: Componentes Principales
**Duración:** ~3 horas

- [ ] Crear `src/components/Nests/NestMapView.tsx`
  - Contenedor con MapContainer (Leaflet)
  - Renderizar [NestPin] con filtered nests
  - Integrar NestTooltip
- [ ] Crear `src/components/Nests/NestPin.tsx`
  - SVG gota púrpura
  - Props: nest, isSelected, onClick
  - Hover/selected states
- [ ] Crear `src/components/Nests/NestTooltip.tsx`
  - 3 líneas info
  - Botones: copiar coords, ver detalle
- [ ] Crear `src/components/Nests-Sidebar/NestFeed.tsx`
  - Scroll list, map nests
  - Cada card: NestCard (nombre + país + tipo)
  - onClick → setSelectedNest + auto-scroll
- [ ] Crear `src/components/Nests-Sidebar/NestDetail.tsx`
  - Panel modal lado derecho
  - 4 secciones: header, pokémon, metadata, badges
  - Botón cerrar (X)

**Tests:**
- Visualizar 5 pins en mapa
- Sidebar muestra 5 cards
- Clic pin → tooltip aparece
- Clic card → detail abre

### Sesión 3: Integración y Testing
**Duración:** ~2 horas

- [ ] Crear `src/components/Header/ModeToggle.tsx`
  - 2 botones: 🌞 CLIMA | 🏠 NIDOS
  - Estado activo/inactivo
  - onClick → setCurrentMode
- [ ] Actualizar `src/App.tsx`
  - Renderización condicional (currentMode)
  - Si clima → MapView + LocationFeed
  - Si nests → NestMapView + NestFeed
- [ ] Crear `src/components/Nests/NestLegend.tsx`
  - Leyenda con colores tipo Pokémon
  - Badges explanation
  - Pestaña "Nidos" en MapLegend
- [ ] Testing E2E
  - 5 nidos visible en mapa
  - Toggle Clima ⇄ Nidos funcional
  - Seleccionar nido → detail abre
  - Favorito ⭐ persiste
- [ ] Build validation
  - `npm run build` exitoso
  - Sin TypeErrors
  - Size < 5MB (Vite bundle)
- [ ] Commit feature/nests

**Tests:**
- E2E: completo Sprint 8
- Build: sin errores
- Commit: "feat(nests): MVP Sprint 8 — Cargar, visualizar e interactuar"

---

## 🎨 Estilos y Tema

### CSS Variables (reutilizar index.css)

```css
/* Colores Nidos */
--nest-primary: #9C27B0  /* Púrpura */
--nest-hover: #7B1FA2    /* Púrpura oscuro */

/* Tipos Pokémon */
--type-fire:   #FF6B35
--type-water:  #6890F0
--type-grass:  #78C850
--type-ground: #E0C068
/* ... etc (18 tipos totales) */

/* Badges */
--badge-verified: #3FB950  /* Verde */
--badge-hot: #D29922       /* Naranja */
--badge-new: #58A6FF       /* Azul */
```

### Componentes <style>

**NestPin.tsx:**
```css
<style>
  .nest-pin {
    fill: var(--nest-primary);
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  }

  .nest-pin.selected {
    fill: var(--nest-hover);
    filter: drop-shadow(8px 8px 16px rgba(0, 0, 0, 0.5));
  }
</style>
```

---

## ✅ Checklist Sesión 1

- [ ] Leer arquitectura doc
- [ ] nestService.ts creado
- [ ] nestCacheService.ts creado
- [ ] useNests.ts creado
- [ ] Store nests slice extendido
- [ ] 5 nidos en consola
- [ ] IndexedDB visible en DevTools

---

## ✅ Checklist Sesión 2

- [ ] NestMapView renderiza
- [ ] 5 pins púrpura visibles
- [ ] NestPin interactivo
- [ ] NestTooltip funciona
- [ ] NestFeed renderiza
- [ ] NestDetail modal funciona

---

## ✅ Checklist Sesión 3

- [ ] ModeToggle creado
- [ ] App.tsx renderiza condicional
- [ ] Toggle Clima ⇄ Nidos funciona
- [ ] NestLegend integrada
- [ ] E2E tests PASSED
- [ ] Build exitoso
- [ ] Commit feature/nests

---

## 📝 Notas Importantes

### Separación: Nidos ≠ Clima
- ✅ Diferentes carpetas componentes
- ✅ Diferentes servicios
- ✅ Diferentes slices en store (pero mismo Zustand)
- ✅ Diferentes archivos datos (nests.json vs pokedensity-cities.json)

### IndexedDB Schema
```
Database: pokeweather
├── ObjectStore: weather_data (clima)
│   └── Key: locationKey
└── ObjectStore: nests_data (nidos) ✨ NEW
    └── Key: nestId
```

### TypeScript Strict
- ✅ No `any`
- ✅ Todas interfaces definidas (nest.ts)
- ✅ Props tipadas en componentes
- ✅ Return types en funciones

### Colores: Por Tipo Pokémon
- **Fire:** #FF6B35 (naranja)
- **Water:** #6890F0 (azul)
- **Grass:** #78C850 (verde)
- **Ground:** #E0C068 (amarillo/marrón)
- **etc** (18 tipos totales)

Pin color = color type Pokémon del nido principal

---

## 🚀 Siguiente Sprint (Sprint 9)

Fases 2 no implementar en Sprint 8:
- Filtros (región, tipo, rarity)
- Búsqueda (nombre, ciudad, país)
- Ordenamiento
- Leyenda mejorada

---

## 📞 Dudas Comunes

**P: ¿Cómo cambio el color del pin?**  
R: `src/services/nests/nestService.ts` → `getPokemonTypeColor(type)` → inyecta en `<circle fill={color}>`

**P: ¿Dónde guardo los favoritos?**  
R: Store Zustand `nestFavorites: string[]` → auto-persiste en localStorage vía Zustand.

**P: ¿Cómo hago el toggle Clima ⇄ Nidos?**  
R: `setCurrentMode('nidos')` en store → App renderiza `currentMode === 'nidos' ? <NestMapView /> : <MapView />`

**P: ¿El caché de nidos interfiere con clima?**  
R: No. `nests_data` está en colección diferente de `weather_data`.

---

**Última actualización:** 2026-04-09  
**Rama:** feature/nests  
**Sesiones:** 3 (Est. 7 horas totales)
