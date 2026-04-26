# US-1108: Agrupacion Dinamica en Tabla Predictiva

**Sprint:** 10 (Ampliacion — Session 16)
**Story Points:** 2
**Estado:** 📋 Especificacion — Pendiente confirmacion
**Roles:** 🔍 Analista SR | 🏛️ Arquitecto SR | 💻 Desarrollador SR

---

## 📋 Descripcion

Agregar un toggle en la tabla predictiva para cambiar dinamicamente el criterio de agrupacion de filas entre tres modos:

| Modo | Agrupa por | Sort por defecto |
|------|-----------|-----------------|
| **⏰ Hora** | Bucket hora local del usuario (DD/MM HH:00) | horaLocal desc |
| **🏙️ Ciudad** | Nombre de ciudad | ciudad asc + horaLocal desc |
| **🌤️ Clima** | Condicion climatica predicha | prediccion asc + horaLocal desc |

El modo activo se refleja visualmente en el header del grupo y en el toggle UI.

---

## 🔍 Analisis (Rol Analista SR)

### Datos fuente disponibles en PredictionRow (sin cambios de schema)

```typescript
interface PredictionRow {
  localTimeUser: string;  // "25/04 16:30" → bucket "25/04 16:00"
  cityName: string;       // "Auckland"
  prediction: string;     // "sunny" → label "☀️ Soleado"
  // ...resto sin cambio
}
```

Todos los campos necesarios ya existen. Sin impacto en data layer ni Firebase.

### Comportamiento por modo

**Modo Hora (default actual):**
```
⏰ 25/04 16:00 — 5 predicciones
  Auckland     | Soleado  | ...
  San Francisco| Nublado  | ...
  ...

⏰ 25/04 15:00 — 4 predicciones
  Auckland     | Lluvioso | ...
```

**Modo Ciudad:**
```
🏙️ Auckland — 8 predicciones
  25/04 16:30 | Soleado  | ✓ Acierto
  25/04 15:30 | Lluvioso | No confirmado
  ...

🏙️ San Francisco — 6 predicciones
  ...
```

**Modo Clima:**
```
🌤️ Soleado — 12 predicciones
  25/04 16:30 | Auckland        | ✓ Acierto
  25/04 15:00 | Tokyo           | ✓ Acierto
  ...

🌧️ Lluvia — 7 predicciones
  ...
```

### Edge cases
- Rows con `localTimeUser = 'N/A'` → bucket "Sin fecha"
- `prediction` sin label en CONDITION_LABEL → usar el valor raw
- Al cambiar modo: volver a pagina 1 automaticamente
- Al cambiar modo: resetear filtros de columna (potencialmente confuso)

---

## 🏛️ Arquitectura (Rol Arquitecto SR)

### Decision: Estado local + render custom (sin TanStack Grouping API)

**Razon:** TanStack Table v8 grouping API agrega complejidad (subrows, expanded rows) que no encaja con nuestro patron actual de "group header como `<tr>` inyectado". Ya tenemos el patron funcionando — simplemente generalizamos la funcion `getHourBucket`.

### Nueva funcion: `getGroupKey(row, groupBy)`

```typescript
type GroupBy = 'hora' | 'ciudad' | 'clima';

function getGroupKey(row: PredictionRow, groupBy: GroupBy): string {
  switch (groupBy) {
    case 'hora':
      return getHourBucket(row.localTimeUser);  // ya existe
    case 'ciudad':
      return row.cityName;
    case 'clima': {
      const cond = row.prediction.toLowerCase() as WeatherCondition;
      return CONDITION_LABEL[cond] || row.prediction;
    }
  }
}
```

### Sorting dinamico al cambiar groupBy

```typescript
const GROUP_SORTS: Record<GroupBy, SortingState> = {
  hora:   [{ id: 'horaLocal',  desc: true  }],
  ciudad: [{ id: 'ciudad',     desc: false }, { id: 'horaLocal', desc: true }],
  clima:  [{ id: 'prediccion', desc: false }, { id: 'horaLocal', desc: true }],
};
```

Al cambiar el toggle:
```typescript
const handleGroupByChange = (mode: GroupBy) => {
  setGroupBy(mode);
  setSorting(GROUP_SORTS[mode]);
  table.setPageIndex(0);  // volver a pagina 1
};
```

### Label del header de grupo

```typescript
function getGroupLabel(key: string, groupBy: GroupBy): string {
  switch (groupBy) {
    case 'hora':   return `⏰ ${key}`;
    case 'ciudad': return `🏙️ ${key}`;
    case 'clima':  return `🌤️ ${key}`;  // TODO: icono segun condicion
  }
}
```

Para clima, el icono puede venir de `WEATHER_IMAGES` renderizado como `<img>` en lugar de emoji estatico.

### UI Toggle

Ubicacion: dentro de `.pat-header`, despues del contador de predicciones.

```
AGRUPAR POR: [⏰ Hora] [🏙️ Ciudad] [🌤️ Clima]
```

CSS: clase `.pat-group-toggle` con botones `.pat-group-btn` y `.pat-group-btn.active`.

---

## 📊 Impacto (Cambios por Archivo)

| Archivo | Cambio | Lineas estimadas |
|---------|--------|-----------------|
| `PredictionAnalysisTable.tsx` | +estado groupBy, +getGroupKey, +toggle UI, +CSS | +~60 |

**Sin cambios en:**
- Data layer (Firebase, IndexedDB, predictionAnalyticsService)
- Interfaces PredictionRow / LookbackItem
- Logica de lookback
- Export CSV/JSON

---

## ✅ Criterios de Aceptacion

1. Toggle con 3 botones visible en header de tabla
2. Click en "Hora" → agrupa por hora local desc (comportamiento actual)
3. Click en "Ciudad" → agrupa por ciudad asc, cada ciudad con header
4. Click en "Clima" → agrupa por condicion predicha asc, cada condicion con header
5. Al cambiar modo → vuelve a pagina 1 automaticamente
6. Header de grupo muestra: icono + label + "N predicciones"
7. Modo "Hora" activo por defecto (estado inicial)
8. Build sin errores TypeScript

---

## 🎨 Mockup CSS (referencia)

```
AGRUPAR POR:  ┌──────────┐ ┌──────────┐ ┌──────────┐
              │⏰ Hora ✓│ │🏙️ Ciudad │ │🌤️ Clima  │
              └──────────┘ └──────────┘ └──────────┘
              (active=azul)(inactive)   (inactive)
```

---

**Responsable:** Claude Code | **Fecha:** 2026-04-25
**Status:** 📋 Especificacion — Esperando confirmacion del usuario
