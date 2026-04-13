# 🎨 Sesión 2: Componentes Principales

**Duración:** ~3 horas  
**Objetivo:** Renderizar 5 pins en mapa + sidebar interactivo  
**Prerequisitos:** Sesión 1 completada ✅  

---

## 📋 Tareas por Completar

### 1️⃣ NestMapView.tsx (Contenedor Mapa)

**Archivo:** `src/components/Nests/NestMapView.tsx`  
**Size:** ~80 líneas  
**Dependencias:** useStore, NestPin, NestTooltip, NestLegend

**Puntos clave:**
- MapContainer con config de MapView (copiar TileLayer + config)
- Map nests → `<NestPin>` con key y props
- Renderizar `<NestTooltip>` si selectedNest
- Renderizar `<NestLegend />`

---

### 2️⃣ NestPin.tsx (Marcador en Mapa)

**Archivo:** `src/components/Nests/NestPin.tsx`  
**Size:** ~100 líneas (con SVG)  
**Dependencias:** getPokemonTypeColor, Marker

**Puntos clave:**
- SVG gota púrpura (copiar estructura de MapPin.tsx)
- Color dinámico: `getPokemonTypeColor(nest.nestPokemon[0].type)`
- States: normal, hover, selected
- CSS: `.nest-pin`, `.nest-pin.selected`

---

### 3️⃣ NestTooltip.tsx (Popup Información)

**Archivo:** `src/components/Nests/NestTooltip.tsx`  
**Size:** ~120 líneas  
**Dependencias:** getBadgeIcon, Popup

**Puntos clave:**
- Renderizar dentro de `<Popup>` (Leaflet)
- 3 líneas: nombre+país, pokémon+spawn, badges
- Botones: "Copiar coords", "Ver detalle"
- Copy-to-clipboard feedback

---

### 4️⃣ NestLegend.tsx (Leyenda Mapa)

**Archivo:** `src/components/Nests/NestLegend.tsx`  
**Size:** ~100 líneas  
**Dependencias:** getPokemonTypeColor, getBadgeLabel

**Puntos clave:**
- Mostrar 18 tipos de Pokémon con colores
- Badge icons + labels
- Posicionarse igual que MapLegend (arriba-derecha)

---

### 5️⃣ NestFeed.tsx (Listado Sidebar)

**Archivo:** `src/components/Nests-Sidebar/NestFeed.tsx`  
**Size:** ~100 líneas  
**Dependencias:** useStore, NestCard

**Puntos clave:**
- Scroll list con 5 cards
- Map nests → `<NestCard>`
- onClick → setSelectedNest + auto-scroll
- CSS: `.nest-feed` con overflow-y: auto

---

### 6️⃣ NestCard.tsx (Card Individual)

**Archivo:** `src/components/Nests-Sidebar/NestCard.tsx`  
**Size:** ~80 líneas  
**Dependencias:** getPokemonTypeColor

**Puntos clave:**
- Nombre, país, ciudad
- Tipo Pokémon (con color)
- Spawn rate (%)
- Hover state + selection highlight

---

### 7️⃣ NestDetail.tsx (Panel Modal)

**Archivo:** `src/components/Nests-Sidebar/NestDetail.tsx`  
**Size:** ~150 líneas  
**Dependencias:** getBadgeIcon, getBadgeLabel

**Puntos clave:**
- Panel modal: `position: fixed; right: 0;`
- Secciones: header, ubicación, pokémon, metadatos, badges
- Botón cerrar (X)
- Botón favorito (⭐ toggle)
- Copy-to-clipboard para coords

---

## ✅ Validación Sesión 2

### Visual Checks
- [ ] 5 pins púrpura visibles en mapa
- [ ] Pins en coordenadas correctas (verificar en DevTools)
- [ ] Hover en pin → efecto visual (glow/grow)
- [ ] Clic pin → NestTooltip aparece en popup

### Interacción
- [ ] NestTooltip → "Ver detalle" abre NestDetail
- [ ] NestFeed muestra 5 cards en scroll
- [ ] Clic card → NestDetail abre
- [ ] NestDetail → ⭐ favorito toggle funciona
- [ ] NestDetail → botón X cierra panel

### Código
- [ ] TypeScript: ❌ ZERO errors
- [ ] Build: ✅ PASSED
- [ ] No hay console.errors

---

## 📝 Notas Importantes

**Reutilizar de Clima:**
- MapContainer config (TileLayer, bounds, etc)
- Estructura de Marker (Leaflet)
- CSS variables para colores
- Portal para popups/modals

**Evitar:**
- No compartir estado con Clima
- No modificar MapView.tsx
- No modificar LocationFeed.tsx

---

## 🚀 Commit

Una vez completado:
```bash
git add -A
git commit -m "feat(nests): Componentes principales — Sesión 2"
```

---

**Última actualización:** 2026-04-10  
**Rama:** feature/nests  
**Sesión:** 2 de 3

