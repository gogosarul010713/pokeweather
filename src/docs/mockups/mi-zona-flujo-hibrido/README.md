# Mockup — Mi Zona: Flujo Hibrido

**Fecha:** 2026-08-04
**Sprint:** 9 — branch `sprint-9-nests`
**Estado:** Aprobado — listo para implementar
**US:** US-907
**Artifact:** https://claude.ai/code/artifact/e308638e-055d-4898-b459-4005675dbef2

---

## Concepto

Flujo hibrido con dos caminos independientes que llegan al mismo resultado:
el usuario fija un punto base ("mi zona") y la lista del sidebar se ordena por distancia desde ese punto.

---

## Camino A — Jugador casual (GPS)

1. Toca chip vacio "Fijar mi zona..." en sidebar O boton Home en zoom controls
2. Modal abre con GPS como accion primaria + campo lat,lon como alternativa
3. Browser pide permiso de geolocalizacion
4. Al confirmar: pin naranja aparece en mapa con radar ~3s, lista se ordena por distancia

---

## Camino B — Spoofer (coordenadas manuales)

1. Pega coords en MapSearch (flujo existente — sin cambios en MapSearch)
2. Pin azul aparece con popup — se agrega boton "Fijar como mi zona"
3. Al tocar: pin azul se convierte en naranja, lista se ordena

---

## Elementos visuales

| Elemento | Estado sin zona | Estado con zona fijada |
|---|---|---|
| Chip sidebar | Borde punteado, texto gris | Fondo naranja dim, coords + ciudad |
| Pin mapa | (ninguno) | Naranja `--home` (#FF6B35) |
| Radar | (ninguno) | Activo ~3s al fijar, luego para |
| Nidos cercanos | Normal (azul) | Borde naranja pulsante durante radar |
| Sort sidebar | "Nombre" (default) | "Distancia" activado |
| Columna distancia | — | "1.2 km" por fila |
| Boton Home zoom | Naranja outline | Naranja filled |

---

## Decisiones

- `homeLocation` es estado separado de `navPin` — persiste en localStorage (`pwe-home-location`)
- `navPin` (busqueda) sigue siendo efimero — no se toca su logica de reset
- Color `--home`: reusar `--type-fire` (#FF6B35) — ya existe en el design system, no se agrega token nuevo
- Haversine sin libreria (`src/utils/distance.ts`)
- GPS con timeout 10000ms, aviso si accuracy > 5000m, error visible si se deniega

---

## Archivos de referencia

- `mockup-v2.html` — mockup interactivo con ambos flujos
- `src/docs/mockups/mi-zona-home/` — exploración original y validate UX (2026-08-01)
