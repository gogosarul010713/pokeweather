# US-910 -- Diseno barra distancia + cooldown en items del sidebar

**Sprint:** 9
**Story Points:** (a estimar)
**Priority:** Baja
**Status:** Pendiente
**Dependencies:** US-909 (cooldown implementado), US-907 (homeLocation)

---

## User Story

> Como usuario de la app, quiero que la barra de distancia y cooldown en cada card del sidebar (climas y nidos) tenga un diseno visual claro y consistente, para leer la informacion de un vistazo sin esfuerzo.

---

## Problem

La barra actual (distancia | cooldown) fue implementada funcionalmente en US-909 pero el estilo visual no convence. Los iconos, tipografia, colores y layout de esa barra necesitan revision de diseno para mejorar legibilidad y coherencia con el resto del sistema de cards.

Aplica a:
- `LocationCard.tsx` (seccion Climas)
- `NestCard.tsx` (seccion Nidos)

---

## Acceptance Criteria

- [ ] La barra distancia + cooldown es legible en una sola pasada visual
- [ ] Los iconos de distancia y cooldown son reconocibles e intuitivos
- [ ] El estilo es consistente entre LocationCard y NestCard
- [ ] La barra no compite visualmente con el contenido principal de la card
- [ ] Funciona correctamente en tema claro y oscuro
- [ ] No se muestra cuando no hay homeLocation fijado (comportamiento actual preservado)

---

## Files to Modify

| Archivo | Accion |
|---|---|
| `src/components/Sidebar/LocationCard.tsx` | Rediseno de `.lc-bar` y sus items |
| `src/components/Nests/NestCard.tsx` | Rediseno de `.nc-bar` y sus items |

---

## Notes

- Usar `/dev designer validate` o `/dev designer explore` para definir la direccion visual antes de implementar
- Considerar: badge pill vs inline, iconos SVG vs emoji, color accent vs neutral
- La informacion mostrada (distancia formateada + cooldown string) no cambia — solo el tratamiento visual
- Prioridad baja: no bloquea ninguna otra US del sprint
