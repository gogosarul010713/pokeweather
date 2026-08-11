# 01 — Pin System v3 (Mi Zona)

**Fecha:** 2026-08-11
**Sprint:** 9 — branch `sprint-9-nests`
**Mockup:** `01-pin-system-v3.html`
**US relacionada:** US-907

---

## Decision de diseno

Sistema de 2 pines (antes habia 3 con ambiguedad entre PIN 1 y PIN 3).

### PIN 1 — HomePin (Mi Zona fijada)

- **Color:** cian `--home` (`#22D3EE` dark / `#0891B2` light)
- **Radar:** activo 3s al fijar zona, luego se apaga
- **Estado estatico:** circulo cian 12px + border blanco + label callout de 3 renglones
- **Label callout:**
  - Renglon 1: "Mi Zona" — cian 9px/700 + icono casa
  - Renglon 2: Lugar, Ciudad — blanco 8px/600
  - Renglon 3: lat, lon — gris tabular 7.5px
- **NestPins nearby:** stroke y fill cian (antes naranja hardcodeado `#FF6B35`)

### PIN 2 — NavPin Search (resultado de busqueda)

- Sin cambios respecto a v2
- Gota azul `--ui-accent` + popup con boton "Fijar como mi zona"
- Temporal: desaparece al cerrar busqueda o seleccionar otro resultado

---

## Comportamiento del boton Home (MapZoomControls)

| Estado | Apariencia | Accion |
|--------|-----------|--------|
| Sin Mi Zona | `--home-dim` bg, opacity 0.42, cursor not-allowed | Ninguna |
| Con Mi Zona | `--home` solido bg, blanco | `flyTo(homeLocation)` |

---

## Que se elimina

- **NavPin tipo `radar`** — el boton Home ya no crea un pin decorativo efimero
- **Radar permanente en HomePin** — el radar ahora es solo el feedback de 3s al fijar

---

## Tokens usados

Todos via `var(--home)` / `var(--home-dim)` / `var(--home-glow)` — sin hardcodear.
El cambio de naranja a cian requiere actualizar estos tokens en `src/index.css`.

---

## Archivos a modificar

- `src/components/Map/HomePin.tsx` — radar 3s + pin estatico + label 3 renglones
- `src/components/Map/MapZoomControls.tsx` — boton disabled sin zona / flyTo con zona
- `src/components/Map/NavPin.tsx` — eliminar logica de tipo `radar` (o dejarlo si se usa en otro lado)
- `src/index.css` — cambiar tokens `--home*` de naranja a cian
