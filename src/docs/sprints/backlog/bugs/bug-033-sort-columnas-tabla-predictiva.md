# BUG-033 — Sort de columnas rompe agrupamiento en tabla predictiva

**Estado:** Pendiente  
**Prioridad:** 🟡 IMPORTANTE  
**Sprint:** Sprint-12  
**Estimacion:** 1h

---

## Descripcion

Al hacer click en los headers de columna de la tabla predictiva para ordenar, en vez de ordenar dentro de los grupos, mezcla o deshace el agrupamiento. Solo la columna "Hora MX" funciona correctamente porque su sort coincide con el sort primario del grupo por hora.

## Root Cause

El agrupamiento es manual en el render (lineas 1130-1201 de `PredictionAnalysisTable.tsx`): se itera `table.getRowModel().rows` detectando cambios de bucket. El sort lo hace TanStack Table sobre la lista plana completa.

Cuando el usuario clickea un header, TanStack reemplaza el `sorting` state con solo ese campo, perdiendo el sort primario del grupo. Las filas se reordenan globalmente sin respetar la estructura de buckets, por lo que el render agrupa de forma incorrecta.

Ejemplo: grupo "hora" requiere sort primario `horaLocal`. Si el usuario clickea "ciudad", TanStack pone `[{ id: 'ciudad', desc: false }]` — el sort de hora desaparece, las filas se reordenan por ciudad globalmente, y el render detecta "cambio de bucket de hora" en posiciones incorrectas.

Problema adicional en `horaCiudad`: su `sortingFn` usa `localeCompare` sobre strings `DD/MM HH:MM`, que ordena lexicograficamente bien dentro de un mismo mes pero no garantiza orden temporal correcto entre fechas distintas.

## Deber Ser

### Grupo por Hora activo

| Header clickeado | Comportamiento esperado |
|------------------|------------------------|
| Hora MX / Hora Local Ciudad | Ordena los grupos de hora asc/desc (las cabeceras de grupo cambian posicion) |
| Ciudad | Dentro de cada grupo hora, ciudades alfabetico asc/desc |
| Condicion | Dentro de cada grupo hora, condicion alfabetico asc/desc |
| Real | Dentro de cada grupo hora, clima real alfabetico asc/desc |
| Resultado | Dentro de cada grupo hora, resultado asc/desc |

### Grupo por Ciudad activo

| Header clickeado | Comportamiento esperado |
|------------------|------------------------|
| Hora Local Ciudad | Dentro de cada grupo ciudad, ordenar por hora asc/desc |
| Ciudad | Ordena los grupos de ciudad asc/desc |
| Condicion | Dentro de cada grupo ciudad, condicion alfabetico asc/desc |
| Real | Dentro de cada grupo ciudad, clima real alfabetico asc/desc |
| Resultado | Dentro de cada grupo ciudad, resultado asc/desc |

## Solucion Propuesta

Reemplazar el sorting de TanStack por un sort manual en `useMemo` que:

1. Determina que campo es la **clave del grupo** segun `groupBy` activo
2. Determina que campo es el **sort secundario** segun el header clickeado
3. Ordena la lista completa por `[clave_grupo asc/desc, campo_secundario asc/desc]`
4. El render consume la lista pre-ordenada — el agrupamiento por cambio de bucket sigue funcionando igual

El `sorting` state de TanStack se mantiene solo para mostrar el icono activo en el header. El sort real lo hace el `useMemo`.

## Archivos Afectados

- `src/components/Analytics/PredictionAnalysisTable.tsx`
