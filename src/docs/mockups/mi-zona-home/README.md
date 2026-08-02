# Mockup — Mi Zona (Home Location)

**Fecha:** 2026-08-01
**Sprint:** 9 — branch `sprint-9-nests`
**Estado:** Explorado + validado UX. Pendiente decision de implementacion.

---

## Archivos

| Archivo | Descripcion |
|---------|-------------|
| `mockup-flow.html` | Flujo completo en 3 pasos: sin home → modal setup → home activo |
| `mockup-radar-map.html` | Efecto radar (ondas pulsantes) sobre el mapa |
| `mockup-combined.html` | Vista final: sidebar con lista + radar en mapa juntos |

---

## Concepto

El jugador fija una posicion base ("home") via GPS o coordenadas manuales `lat,lon`.
Una vez fijada, todo el contenido (nidos, ciudades) se ordena por distancia desde ese punto.

**Color semantico nuevo:** `--home: #FF6B35` (naranja) — exclusivo para home, no se mezcla con `--text-accent` (clima) ni `--ui-accent` (nidos).

---

## Componentes visuales propuestos

- **Chip en sidebar** — muestra coords + nombre de ciudad. Tap abre modal.
- **Modal setup** — boton GPS (Geolocation API) + campo manual lat,lon.
- **Pin naranja en mapa** — con 3 ondas concentricas pulsantes (CSS animation sobre DivIcon de Leaflet).
- **Circulo de radio** — area de cobertura (~5 km configurable).
- **Lista ordenada** en sidebar — tabs Nidos / Ciudades / Todo, ordenados por distancia.
- **Boton 🏠** en zoom controls — fly-to al home.

---

## Observaciones del validate UX (2026-08-01)

### Problemas identificados
1. **GPS del dispositivo no sirve para spoofers** — juegan desde coords falsas, su GPS real es irrelevante. Esa opcion puede eliminarse o moverse a secundaria.
2. **Demasiadas piezas de UI** compitiendo en el mapa (ondas + circulo + barra inferior + chip + tabs). Evaluar que se puede simplificar.
3. **Radio fijo de 5 km es arbitrario** — un spoofer se mueve 50 km facilmente. Hacerlo configurable o eliminarlo.
4. **Coords duplicadas** — chip en sidebar y barra inferior del mapa muestran lo mismo. Uno sobra.

### Lo que si tiene sentido
- Ordenar lista por distancia al home es el estandar en trackers de PoGO (PoGoMap, Pokecoord, LocaChange).
- Pin naranja fijo como referencia visual en el mapa.
- Campo manual de coordenadas — formato identico al que ya acepta MapSearch.

### Alternativa minima sugerida
Usar `selectedCity` del store como home implicito + boton "Anclar aqui" que persista en localStorage. Sin estado nuevo, sin modal complejo. Si el uso lo justifica, se agrega el pin y el radar despues.

### Libreria recomendada
`geolib` — `getDistance` / `orderByDistance`. Mas liviano que turf.js.

### Bug conocido de Leaflet
Los circulos `<Circle>` se deforman visualmente durante `map.flyTo()`. Issue: leaflet/leaflet#6050.

---

## Proximos pasos sugeridos

1. Decidir: home fijo (pin anclado) vs. centro del mapa dinamico.
2. Si se elige home fijo: agregar `homeLocation: LatLng | null` al store + persistir en `localStorage`.
3. Implementar orden por distancia en la lista del sidebar usando `geolib`.
4. Pin simple primero — radar/ondas como mejora opcional posterior.
