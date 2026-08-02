# Mockup — NavPin Dinamico

**Estado:** Disenado ✅ — pendiente implementacion
**Branch:** `sprint-9-nests`
**Artifact:** https://claude.ai/code/artifact/c629a492-5fc4-4030-82fe-47e81de70335
**Sesion:** 34 (2026-08-01)

---

## Concepto

Dos pines distintos segun el flujo que origine la navegacion en el mapa.
Un solo pin activo a la vez — el nuevo reemplaza al anterior. Se limpia al cambiar de ciudad.

---

## Caso 1 — Teardrop (Busqueda texto)

**Cuando:** usuario escribe en MapSearch y elige un lugar del dropdown (resultado OSM o coordenadas lat,lon directas).

**Visual:**
- Forma: teardrop clasica (gota/marcador)
- Color: `var(--ui-accent)` — `#58A6FF`
- Borde: `rgba(255,255,255,0.85)` stroke 1.5px
- Punto interior blanco opacity 0.92
- Animacion: cae desde arriba con rebote (`cubic-bezier(0.34,1.2,0.64,1)`) + sombra eliptica al aterrizar
- Mini-popup con el nombre del lugar aparece 0.5s despues

**Distincion de nidos:** forma diferente (teardrop vs hexagono) + color unico en el mapa

---

## Caso 2 — Circulo + Halo Radar (Home / Cercanos)

**Cuando:** usuario presiona boton Home (geolocalizacion) o activa modo "detectar mas cercanos" / radar.

**Visual:**
- Punto central: circulo 14px `#58A6FF`, borde blanco 2.5px, glow `rgba(88,166,255,0.3)`
- Anillo pulsante: `rgba(88,166,255,0.45)`, pulsa de scale(1) a scale(1.35)
- Halo expansivo: ripple que escala de 0.6x a 3.2x y desaparece (loop infinito)
- Barrido radar: arco SVG rotando 360deg en 3s (indica que esta buscando)
- Nidos dentro del rango: resaltados con anillo azul + etiqueta de distancia (ej: "320m")
- Nidos fuera del rango: opacity 0.25

**Semantica:** identico al lenguaje de Google Maps para "mi ubicacion actual"

---

## Regla de uso

| Flujo | Pin |
|-------|-----|
| Busqueda texto / OSM | Teardrop azul |
| Coordenadas lat,lon en MapSearch | Teardrop azul |
| Boton Home (geolocation) | Circulo + halo |
| Modo radar / detectar cercanos | Circulo + halo |

---

## Implementacion sugerida

- Estado: `navPin: { lat: number, lon: number, type: 'search' | 'radar', label?: string } | null` en Zustand
- Componente: `src/components/Map/NavPin.tsx` (clonar patron de `NestPin.tsx`)
- Icono: `L.divIcon` custom — cero dependencias nuevas
- z-index: `zIndexOffset={2000}` (sobre nidos seleccionados que usan 1000)
- Limpiar: al cambiar `selectedCity` o nueva busqueda

---

## Tokens usados

```
--ui-accent:   #58A6FF   (teardrop + circulo)
--bg-overlay:  #252D3D   (popup label)
--text-primary: #E6EDF3  (texto popup)
```
