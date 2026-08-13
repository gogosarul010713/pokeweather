# 01 — HomeChip sin zona

**Sprint:** 9  
**Componente:** `HomeChip` (sidebar)  
**Estado:** en diseno

## Problema

Cuando el usuario no tiene zona fijada, el chip no comunica que al fijarlo aparecen distancias y ETA en cada card.

## Variantes exploradas

| ID | Nombre | Descripcion | Trade-off |
|----|--------|-------------|-----------|
| A | Subtexto en chip | Chip crece con segunda linea "Ver distancias y ETA en cada card" | Simple; chip mas alto que el estado activo |
| B | Banner one-shot | Chip discreto + mini-banner cerrable (localStorage) | Mas explicito la primera vez; requiere localStorage |
| C | Chip expandido temporal | Chip completo al abrir sidebar, colapsa a 4 seg | Dinamico; puede perderse si no lo ven a tiempo |
| D | Banner auto ⭐ | Chip discreto + mini-banner siempre visible hasta fijar zona | 0 localStorage; desaparece solo al fijar zona |

## Recomendacion

**Opcion D** — menor complejidad de estado, sin persistencia, feedback claro.

## Artifact

[Ver mockup interactivo](https://claude.ai/code/artifact/ea7c2a5b-f133-4694-9c29-b4b9e98ea5c2)
