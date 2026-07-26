# Mockups — MapLegend Tab Categorias

**Sprint:** 9
**Sesion:** 24 (2026-07-25)
**Contexto:** Rediseno del tab Categorias en MapLegend. Se exploran distintos patrones para controlar visibilidad de iconos en pines y filtrado de la lista del sidebar.

---

## Requerimiento

- **Checkbox** — muestra/oculta iconos en pines del mapa Y chips en sidebar
- **Boton Ver** — aplica filtro sobre la lista del sidebar (solo esa categoria)
- **Ver** aparece con fade suave (150ms opacity) solo cuando el checkbox esta activo
- Orden de columnas: `[emoji] [label] [checkbox] [ojo] [Ver]`

---

## Mockup 1 — Propuestas A / B / C (original)

**Artifact:** https://claude.ai/code/artifact/619374a0-9c06-4097-a85e-6222d4a0a188

Explora tres enfoques distintos para el tab:

| Propuesta | Concepto | Estado |
|-----------|----------|--------|
| A | Dos controles por fila: ojo (visibilidad mapa) + checkbox (filtro lista) | Descartada — orden y semantica revisados |
| B | Toggle global Vista/Filtro con color diferente por modo | Descartada — carga cognitiva alta |
| C | Un checkbox que hace todo (mapa + filtro simultaneamente) | Descartada — pierde flexibilidad |

---

## Mockup 2 — Propuestas 1 y 3 (nuevo orden, interactivo)

**Artifact:** https://claude.ai/code/artifact/ca3486b5-5227-477a-982b-1908a56a8f04

Orden de columnas corregido. Checkboxes son clickeables para ver el fade del boton Ver.

| Propuesta | Concepto | Notas |
|-----------|----------|-------|
| 1 | Checkbox + ojo de estado (abierto=sin filtro, cerrado=filtrando) + Ver | Mas feedback visual, semantica a aprender |
| 3 | Checkbox + Ver (sin ojo) | Mas limpio, sin feedback de estado de filtro |

---

## Decisiones tomadas en sesion

- `badgeFilter` controla solo visibilidad de iconos en pines (no filtra mapa ni sidebar)
- `MapView` ya no filtra ciudades por `badgeFilter` — mapa siempre muestra todos los pins
- `MapPin` usa `badgeFilter` internamente para decidir que iconos renderizar
- El ojo cerrado = filtro activo fue cuestionado por ir contra convencion universal (Google Maps, Figma, Photoshop donde ojo cerrado = oculto)

---

## Pendiente

- [ ] Elegir entre propuesta 1 o 3
- [ ] Implementar diseno elegido en `MapLegend.tsx`
