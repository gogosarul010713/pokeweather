# US-1206 — Distincion visual dia/noche en UI: icono/label desde `icon_id >= 33`

**Sprint:** 12
**Estado:** Pendiente
**Prioridad:** Alta
**Estimacion:** 1.5h
**Depende de:** US-1205 ✅
**Referencia:** D-051, INV-003

---

## Historia de usuario

Como usuario de la aplicacion, cuando una ciudad tenga cielo nocturno despejado (icon_id
33 o 34) quiero ver la imagen de luna (`/weather/clear.png`) y el label "Despejado", para
que la representacion visual sea coherente con el momento del dia, sin que esto afecte
la condicion PGO (que sigue siendo `sunny`).

---

## Contexto tecnico

`pgoCondition` es siempre `'sunny'` para iconos 33/34 (clasificador). La distincion
es exclusivamente visual: si `weatherIcon >= 33 && condition === 'sunny'`, el frontend
muestra imagen de luna y label "Despejado". El asset `/weather/clear.png` ya existe.

`'clear'` NO existe como condicion interna (`WeatherCondition`). Los mapas de display
(`weatherImages.ts`, `weatherService.ts`) tampoco lo tendran.

---

## Criterios de aceptacion

### CA-01 — Limpieza de `'clear'` como condicion en todos los mapas
- `weatherImages.ts`: `WeatherCondition` sin `'clear'`; `WEATHER_IMAGES`, `CONDITION_LABEL`, `CONDITION_COLORS` sin entrada `clear`
- `weatherService.ts`: `CONDITION_TO_TYPES`, `CONDITION_COLORS`, `CONDITION_LABEL` sin entrada `clear`
- `weatherCatalogService.ts`: catalogo fallback sin entrada `clear`
- `exportToExcel.ts`: `translateCondition` sin `clear`
- `FilterPanel.tsx` / `FilterPanelModal.tsx`: sin opcion `value: 'clear'`
- `MapLegend.tsx`: `CONDITIONS` array sin `'clear'`

### CA-02 — Distincion visual en componentes de render
- `CityTooltip`: si `city.weatherIcon >= 33 && city.condition === 'sunny'` → imagen `clear.png`, label "Despejado"
- `LocationDetail`: misma logica

### CA-03 — Sin imagenes rotas ni labels vacios
- Ciudades con `condition: 'sunny'` y `weatherIcon <= 32` muestran `sunny.png` / "Soleado"
- Ciudades con `condition: 'sunny'` y `weatherIcon >= 33` muestran `clear.png` / "Despejado"

### CA-04 — Build TypeScript limpio

---

## Diseno tecnico

Helper inline en CityTooltip y LocationDetail (no extraer a util — YAGNI):
```ts
const displayCondition = (condition === 'sunny' && weatherIcon >= 33) ? 'night-clear' : condition
// imagen: displayCondition === 'night-clear' ? '/weather/clear.png' : `/weather/${condition}.png`
// label:  displayCondition === 'night-clear' ? 'Despejado' : CONDITION_LABEL[condition]
```

O mas directo:
```ts
const isNightClear = condition === 'sunny' && weatherIcon >= 33
const img  = isNightClear ? '/weather/clear.png'  : `/weather/${condition}.png`
const label = isNightClear ? 'Despejado' : CONDITION_LABEL[condition]
```
