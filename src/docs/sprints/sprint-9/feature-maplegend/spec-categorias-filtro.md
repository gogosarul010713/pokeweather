# Spec: Categorias — Highlight (MapLegend) + Filtro (FilterPanel)

**Sprint:** 9
**Tipo:** spec
**Status:** disenado / pendiente implementacion
**Relacionado:** US-815
**Mockup aprobado:** https://claude.ai/code/artifact/b4bd63f4-3aac-480d-873d-28582a242009

---

## Resumen

Las categorias tienen dos controles con responsabilidades separadas:

| Control | Responsabilidad | Efecto |
|---------|----------------|--------|
| MapLegend tab "Categorias" | Resaltar visualmente | Highlight en pines + sidebar, el resto se atenua |
| FilterPanel seccion "Categoria del lugar" | Filtrar / ocultar | Muestra solo ciudades con esa categoria (AND con otros filtros) |

---

## 1. MapLegend — Resaltar

### Comportamiento
- **Default:** todos los checkboxes desmarcados. Pines y sidebar se ven normales.
- **Seleccionar una categoria:** los pines e items del sidebar con esa categoria se resaltan (highlight + glow). El resto reduce contraste (opacidad baja + desaturado).
- **Seleccionar varias:** todas las categorias marcadas se resaltan simultaneamente.
- **Desmarcar:** quita el highlight, vuelve a normal.

### Visual del checkbox (aprobado)
- Checkbox inactivo: borde sutil, label en `--text-secondary`
- Checkbox activo: fondo + borde del color de la categoria, label del color de la categoria
  - Pokestops → `#58A6FF`
  - Gym Hub → `#F85149`
  - Comunidad Activa → `#3FB950`
  - Mejores Lugares → `#FFD700`
- Fondo del item activo: tinte suave del color de la categoria (8% opacidad)
- Contador en el header de la leyenda muestra cuantas categorias estan activas

### Categorias (capa Clima)
- Pokestops
- Gym Hub
- Comunidad Activa
- Mejores Lugares

### Notas
- No filtra ni oculta — solo resalta visualmente
- Compatible con FilterPanel: se pueden usar ambos al mismo tiempo
- El estado de highlight NO resetea al cambiar de capa

---

## 2. FilterPanel — Filtrar

### Comportamiento
- Se agrega una seccion "Categoria del lugar" con chips multiples (igual que Clima y Tipo Pokemon)
- **Default:** ningun chip seleccionado = todo visible
- **Seleccionar uno o mas:** muestra solo ciudades/items con esa(s) categoria(s)
- Se combina con otros filtros en AND (debe cumplir todos los filtros activos)
- El contador de "filtros activos" del header incluye categorias seleccionadas
- "Limpiar todo" resetea tambien las categorias

### Layout en FilterPanel
```
Categoria del lugar
[ Pokestops ] [ Gym Hub ]
[ Comunidad ] [ Mejores ]
```
Mismo patron visual que los chips de Clima y Tipo Pokemon existentes.

### Categorias disponibles (capa Clima)
- Pokestops
- Gym Hub
- Comunidad Activa
- Mejores Lugares

### Capa Nidos (futuro)
- Spawn Rate, Pokestops, Gyms, Comunidad — pendiente de spec propio

---

## Alcance

| Capa  | MapLegend highlight | FilterPanel filtro | Estado |
|-------|--------------------|--------------------|--------|
| Clima | pendiente          | pendiente          | disenado, aprobado |
| Nidos | pendiente          | pendiente          | sin spec aun |
