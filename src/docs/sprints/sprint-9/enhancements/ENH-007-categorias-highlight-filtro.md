# ENH-007 — Categorias: Highlight en MapLegend + Filtro en FilterPanel

**Tipo:** Enhancement / UX
**Sprint:** 9
**Estado:** Disenado, aprobado — pendiente implementacion
**Mockup aprobado:** https://claude.ai/code/artifact/b4bd63f4-3aac-480d-873d-28582a242009
**US derivadas:** US-827, US-828

---

## Contexto

Las categorias de lugar (Pokestops, Gym Hub, Comunidad Activa, Mejores Lugares) necesitan
dos controles con responsabilidades separadas:

- **Resaltar** (explorar visualmente sin perder contexto) -> MapLegend
- **Filtrar** (reducir resultados, ocultar lo que no aplica) -> FilterPanel

## Cambios

| Control | Comportamiento nuevo |
|---------|---------------------|
| MapLegend tab "Categorias" | Checkbox con color por categoria. Seleccionar resalta pines + sidebar, el resto se atenua. |
| FilterPanel seccion nueva | Chips multiples. Seleccionar filtra/oculta igual que Clima y Tipo Pokemon. |

## US derivadas

- **US-827** — Highlight por categoria en MapLegend
- **US-828** — Chips de categoria en FilterPanel

## Alcance

| Capa  | MapLegend highlight | FilterPanel filtro |
|-------|--------------------|--------------------|
| Clima | US-827             | US-828             |
| Nidos | pendiente spec     | pendiente spec     |
