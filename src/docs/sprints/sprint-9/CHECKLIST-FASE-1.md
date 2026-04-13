# ✅ Checklist Maestro — Nidos Fase 1 (Sprint 8)

**Rama:** `feature/nests`  
**Total SP:** 16  
**Sesiones:** 3  
**Última actualización:** 2026-04-10  

---

## 🎯 Pre-Trabajo

### Lectura Obligatoria
- [ ] Leer `00-index.md` — navegación general
- [ ] Leer `01-arquitectura.md` — diseño de módulos
- [ ] Leer `20-estructura-proyecto.md` — archivos a crear
- [ ] Entender que Nidos y Clima son **completamente independientes**

---

## 🛠️ SESIÓN 1: Servicios, Hook, Store (2h)

### Paso 1: nestService.ts
- [ ] Crear `src/services/nests/` (carpeta)
- [ ] Crear `src/services/nests/nestService.ts`
- [ ] Implementar `getPokemonTypeColor(type)`
- [ ] Implementar `getBadgeIcon(badge)`
- [ ] Implementar `getBadgeLabel(badge)`
- [ ] Implementar `calculateDistance(lat1, lon1, lat2, lon2)`
- [ ] Implementar `formatDistance(meters)`
- [ ] Implementar `isValidNest(obj)`
- [ ] Validar que compila sin errores

### Paso 2: nestCacheService.ts
- [ ] Crear `src/services/nests/nestCacheService.ts`
- [ ] Implementar `getNest(nestId)`
- [ ] Implementar `setNest(nestId, nest)`
- [ ] Implementar `getAllNests()`
- [ ] Implementar `clearNestCache()`
- [ ] Validar que compila sin errores

### Paso 3: useNests Hook
- [ ] Crear `src/hooks/useNests.ts`
- [ ] Implementar `loadNests()` — fetch nests.json
- [ ] Implementar `setNestCache(nests)` — guardar en IndexedDB
- [ ] Implementar `loadFromCacheOrJson()` — caché o JSON
- [ ] Implementar `run(onReady?)` — entry point
- [ ] Implementar `useInitialize()` — hook auto-init
- [ ] Validar que compila sin errores

### Paso 4: Zustand Store (nests slice)
- [ ] Abrir `src/store/useStore.ts`
- [ ] Agregar imports de tipos Nest
- [ ] Agregar NestsSlice type
- [ ] Agregar state: `nests: Nest[]`
- [ ] Agregar state: `selectedNest: Nest | null`
- [ ] Agregar state: `nestFavorites: string[]`
- [ ] Agregar state: `currentMode: 'clima' | 'nests'`
- [ ] Agregar action: `setNests(nests)`
- [ ] Agregar action: `setSelectedNest(nest)`
- [ ] Agregar action: `toggleNestFavorite(nestId)`
- [ ] Agregar action: `setCurrentMode(mode)`
- [ ] Agregar derivada: `getFilteredNests()` (retorna todos por ahora)
- [ ] Validar que compila sin errores

### Validación S1
- [ ] `npm run build` → ✅ EXIT 0
- [ ] DevTools Console → 5 nidos logueados
- [ ] DevTools IndexedDB → nests_data con 5 documentos
- [ ] TypeScript → ❌ ZERO errors
- [ ] **Commit:** `feat(nests): Servicios, hook y store — Sesión 1`

---

## 🎨 SESIÓN 2: Componentes Principales (3h)

### Componentes Mapa (NestMapView.tsx + NestPin.tsx + NestTooltip.tsx + NestLegend.tsx)

#### NestMapView.tsx
- [ ] Crear `src/components/Nests/NestMapView.tsx`
- [ ] Importar useStore, NestPin, NestTooltip, NestLegend
- [ ] Renderizar `<MapContainer>` (reutilizar config de MapView)
- [ ] Renderizar `<TileLayer>` con tile configuration
- [ ] Map nests → `<NestPin>` (incluir key unique)
- [ ] Renderizar `<NestTooltip>` si hay selectedNest
- [ ] Renderizar `<NestLegend />`
- [ ] Implementar handlers para onClick pins
- [ ] Validar que no hay errores TS

#### NestPin.tsx
- [ ] Crear `src/components/Nests/NestPin.tsx`
- [ ] Importar getPokemonTypeColor, getBadgeIcon
- [ ] Props: nest, isSelected, onClick
- [ ] Crear SVG gota púrpura (copiar estructura de MapPin.tsx)
- [ ] Aplicar color dinámico (nestPokemon[0].type)
- [ ] Implementar state: normal, hover, selected
- [ ] Agregar <style> con clases `.nest-pin` y `.nest-pin.selected`
- [ ] Validar que renderiza sin errores

#### NestTooltip.tsx
- [ ] Crear `src/components/Nests/NestTooltip.tsx`
- [ ] Props: nest
- [ ] Renderizar 3 líneas:
  - [ ] Línea 1: Nombre + país
  - [ ] Línea 2: Pokémon (tipo) + spawn rate
  - [ ] Línea 3: Badges (con iconos)
- [ ] Agregar botones: "Copiar coords" + "Ver detalle"
- [ ] Implementar copy-to-clipboard feedback
- [ ] Agregar <style> con clase `.nest-tooltip`
- [ ] Validar posicionamiento en viewport

#### NestLegend.tsx
- [ ] Crear `src/components/Nests/NestLegend.tsx`
- [ ] Renderizar colores por tipo Pokémon (usar 18 tipos)
- [ ] Mostrar badge icons + labels
- [ ] Agregar <style> con clase `.nest-legend`
- [ ] Validar que es visible en mapa

### Componentes Sidebar (NestFeed.tsx + NestCard.tsx + NestDetail.tsx)

#### NestFeed.tsx
- [ ] Crear `src/components/Nests-Sidebar/NestFeed.tsx`
- [ ] Importar useStore, NestCard
- [ ] Renderizar scroll list (div with overflow-y)
- [ ] Map nests → `<NestCard>` (incluir key unique)
- [ ] Implementar onClick → setSelectedNest
- [ ] Implementar auto-scroll al seleccionar
- [ ] Agregar <style> con clase `.nest-feed`
- [ ] Validar scroll funciona

#### NestCard.tsx
- [ ] Crear `src/components/Nests-Sidebar/NestCard.tsx`
- [ ] Props: nest, isSelected, onClick
- [ ] Renderizar:
  - [ ] Nombre nido
  - [ ] País + ciudad
  - [ ] Tipo Pokémon (con color)
  - [ ] Spawn rate (%)
- [ ] Implementar hover state
- [ ] Agregar <style> con clase `.nest-card`
- [ ] Validar que es seleccionable

#### NestDetail.tsx
- [ ] Crear `src/components/Nests-Sidebar/NestDetail.tsx`
- [ ] Props: nest, onClose
- [ ] Renderizar secciones:
  - [ ] Header: Nombre + cerrar (X)
  - [ ] Ubicación: Coordenadas (copiables) + país/ciudad
  - [ ] Pokémon: Nombre + tipo + spawn + minIV
  - [ ] Metadatos: Descubierto + verificado + radio + exactitud
  - [ ] Badges: Mostrar todos con iconos
- [ ] Agregar botón: ⭐ Favorito (toggle)
- [ ] Renderizar como modal panel (position: fixed, right: 0)
- [ ] Agregar <style> con clase `.nest-detail`
- [ ] Validar que abre/cierra correctamente

### Validación S2
- [ ] Navegador (localhost:5174) — 5 pins púrpura visibles en mapa
- [ ] Pins están en coordenadas correctas
- [ ] Hover en pin → glow visible
- [ ] Clic en pin → NestTooltip aparece
- [ ] NestTooltip tiene botones funcionales
- [ ] NestFeed muestra 5 cards
- [ ] Clic en card → abre NestDetail
- [ ] NestDetail muestra toda la info
- [ ] Favorito (⭐) toggle funciona
- [ ] NestLegend visible en mapa
- [ ] TypeScript → ❌ ZERO errors
- [ ] **Commit:** `feat(nests): Componentes principales — Sesión 2`

---

## 🔄 SESIÓN 3: Integración Final (2h)

### ModeToggle.tsx
- [ ] Crear `src/components/Header/ModeToggle.tsx`
- [ ] Props: (ninguna, lee del store)
- [ ] Renderizar 2 botones:
  - [ ] 🌞 CLIMA (estado activo/inactivo)
  - [ ] 🏠 NIDOS (estado activo/inactivo)
- [ ] Implementar onClick → `setCurrentMode()`
- [ ] Agregar <style> con clase `.mode-toggle`
- [ ] Validar visual y funcionalidad

### Actualizar Header.tsx
- [ ] Abrir `src/components/Header/Header.tsx`
- [ ] Importar ModeToggle
- [ ] Renderizar `<ModeToggle />` en header
- [ ] Validar que aparece correctamente

### Actualizar App.tsx
- [ ] Abrir `src/App.tsx`
- [ ] Importar useNests, useStore
- [ ] Importar NestMapView, NestFeed
- [ ] Agregar useEffect → `useNests().run()`
- [ ] Agregar renderización condicional:
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
- [ ] Validar que no hay errores

### E2E Testing
- [ ] Abre app en navegador
- [ ] **Test 1:** Verificar que renderiza Clima por defecto
  - [ ] MapView visible (pins naranja)
  - [ ] LocationFeed visible (ciudades)
  - [ ] ModeToggle visible en header
- [ ] **Test 2:** Hacer clic en ModeToggle → 🏠 NIDOS
  - [ ] MapView desaparece
  - [ ] NestMapView aparece (pins púrpura)
  - [ ] LocationFeed desaparece
  - [ ] NestFeed aparece
- [ ] **Test 3:** Interacción con Nidos
  - [ ] Clic en pin → NestTooltip aparece
  - [ ] Clic en "Ver detalle" → NestDetail abre
  - [ ] Favorito (⭐) → toggle visible
  - [ ] Cerrar NestDetail (X) → cierra
- [ ] **Test 4:** Toggle vuelta a Clima
  - [ ] Clic ModeToggle → 🌞 CLIMA
  - [ ] NestMapView desaparece
  - [ ] MapView aparece nuevamente
- [ ] **Test 5:** Recargar página
  - [ ] Modo se mantiene (localStorage)
  - [ ] Nidos cargan desde IndexedDB (rápido)

### Build & Validación
- [ ] `npm run build`
  - [ ] ✅ EXIT 0
  - [ ] ✅ Bundle size aceptable
- [ ] TypeScript check
  - [ ] ❌ ZERO errors
  - [ ] ❌ ZERO warnings
- [ ] Lighthouse (opcional)
  - [ ] Performance > 80
  - [ ] Accessibility > 80

### Documentación
- [ ] Actualizar `src/docs/progress.md` — agregar Nidos Fase 1 completada
- [ ] Comentarios en código donde sea necesario
- [ ] Verificar que no hay TODOs pendientes

### Commit Final
- [ ] `git add -A`
- [ ] Commit: `feat(nests): MVP Sprint 8 Fase 1 — Cargar, visualizar e interactuar`
- [ ] Mensaje commit explica:
  - [ ] 7 US completadas (801-807)
  - [ ] 5 nidos cargables
  - [ ] Toggle Clima ⇄ Nidos
  - [ ] Favoritos + caché

### Validación S3
- [ ] TypeScript → ❌ ZERO errors
- [ ] Build → ✅ PASSED
- [ ] E2E → ✅ 5/5 tests
- [ ] Commit → ✅ DONE

---

## 📊 Métricas Finales

| Métrica | Esperado | Obtenido |
|---------|----------|----------|
| **Story Points** | 16 | \_\_\_ |
| **Archivos creados** | 14+ | \_\_\_ |
| **Componentes nuevos** | 7 | \_\_\_ |
| **Servicios nuevos** | 2 | \_\_\_ |
| **TypeErrors** | 0 | \_\_\_ |
| **Lighthouse Performance** | > 80 | \_\_\_ |
| **Build time** | < 30s | \_\_\_ |

---

## 🔗 Referencias

- **Arquitectura:** [01-arquitectura.md](01-arquitectura.md)
- **Estructura:** [20-estructura-proyecto.md](20-estructura-proyecto.md)
- **Sesión 1:** [10-sesion-1-servicios.md](10-sesion-1-servicios.md)
- **Sesión 2:** [11-sesion-2-componentes.md](11-sesion-2-componentes.md)
- **Sesión 3:** [12-sesion-3-integracion.md](12-sesion-3-integracion.md)

---

**Última actualización:** 2026-04-10  
**Rama:** feature/nests  
**Status:** Listo para iniciar

