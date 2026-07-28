# Spec: Filtro por Categorias en MapLegend

**Sprint:** 9
**Tipo:** spec
**Status:** implementado (clima) / pendiente (nidos)
**Relacionado:** US-815

---

## Descripcion

La MapLegend tiene una tab llamada "Categorias". Cada categoria representa un tipo de lugar (ej: gyms, stops, rutas).

### Comportamiento actual (capa Clima)

1. Al abrir la app, todas las categorias aparecen **seleccionadas por default**.
2. **Deseleccionar** una categoria:
   - Oculta los items del sidebar que tienen esa categoria asignada.
   - Oculta los pines del mapa que corresponden a esa categoria.
3. **Seleccionar** de nuevo:
   - Muestra los items del sidebar nuevamente.
   - Muestra los pines del mapa nuevamente.

### Alcance actual

| Capa  | Filtro sidebar | Filtro pines | Estado       |
|-------|---------------|--------------|--------------|
| Clima | si            | si           | implementado |
| Nidos | no            | no           | sin desarrollar |

### Ejemplo

Si el usuario desselecciona "gyms":
- Desaparecen del sidebar los items de clima que tenian la categoria "gyms".
- Desaparecen del mapa los pines de "gyms".
- Al seleccionar "gyms" de nuevo, vuelven a aparecer.

---

## Notas

- Las categorias NO resetean al cambiar de capa activa.
- El filtro de categorias es independiente del filtro de texto/busqueda del sidebar.
- Nidos no tiene categorias desarrolladas aun -- pendiente de spec propio.
