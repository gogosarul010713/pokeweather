# US-805 — Reporte de Clasificación Incorrecta

**Sprint:** 8 — Fase 2  
**Epic:** WDP (Weather Data Persistence)  
**Story Points:** 5 SP  
**Prioridad:** P3  
**Status:** ⏳ Pendiente  

---

## Historia de usuario

> Como analista, quiero poder marcar una clasificación climática como incorrecta y registrar la correcta, para construir un dataset de casos de fallo que permita mejorar el algoritmo de clasificación.

---

## Criterios de aceptación

### Reporte
- [ ] En `LocationDetail`, botón "Reportar clasificación" (icono de flag o ⚠️)
- [ ] Al presionar, abre modal/drawer con:
  - Clasificación actual mostrada (condición + tipos)
  - Dropdown para seleccionar la condición correcta (7 opciones)
  - Campo de texto opcional: "¿Por qué es incorrecto?" (max 200 chars)
  - Botón "Enviar reporte"
- [ ] Al enviar, guarda en Firestore colección `classification_reports`
- [ ] Modal se cierra con feedback visual (toast: "Reporte enviado ✓")
- [ ] El botón es accesible solo cuando la ciudad tiene datos climáticos cargados

### Visualización en Testing Tools
- [ ] Badge contador en TestingTools si hay reportes en las últimas 24h
- [ ] Panel "Reportes" en TestingTools mostrando lista de reportes con: ciudad, clasificado_como, debería_ser, fecha
- [ ] Opción de exportar reportes como CSV

### Data quality
- [ ] No se permiten reportes duplicados para la misma ciudad+hora en la misma sesión
- [ ] Reportes se almacenan con TTL de 30 días

---

## Schema del reporte

**Path:** `/classification_reports/{report_id}`

```typescript
interface ClassificationReport {
  report_id: string          // auto-generado por Firestore
  city_id: string            // "san-francisco"
  city_name: string          // "San Francisco"
  timestamp: Timestamp       // momento del reporte
  date_hour: string          // "2026-04-08-14" — la hora que se está reportando

  // Clasificación actual (lo que el sistema dice)
  classified_as: string      // "partly"
  classified_types: string[] // ["normal", "rock"]

  // Clasificación correcta (lo que el usuario dice)
  should_be: string          // "sunny"
  should_be_types: string[]  // ["fire", "ground", "grass"]

  // Contexto de la clasificación
  raw_condition_code: number // código AccuWeather original
  raw_condition_text: string // "Partly Cloudy"
  temperature_c: number
  wind_kmh: number
  precipitation_mm: number

  // Metadata del reporte
  comment: string            // comentario opcional del usuario (max 200 chars)
  reporter: 'user'           // origen (futuro: 'algorithm', 'admin')
  ttl: Timestamp             // +30 días
}
```

---

## UI — Flujo del reporte

```
┌─────────────────────────────────────┐
│  LocationDetail — San Francisco      │
│                                      │
│  🌤️ Parcialmente nublado   [⚠️]     │  ← botón reporte
│  Tipos: Normal  Rock                 │
│                                      │
└─────────────────────────────────────┘
                    ↓ click ⚠️
┌─────────────────────────────────────┐
│  Reportar clasificación incorrecta   │
│                                      │
│  Clasificado como: Parcialmente nublado │
│  Tipos: Normal, Rock                 │
│                                      │
│  ¿Cuál es la condición correcta?     │
│  [Seleccionar ▼]                     │
│  ○ Soleado ☀️                        │
│  ○ Nublado ☁️                        │
│  ○ Lluvia 🌧️                         │
│  ○ Nieve ❄️                           │
│  ○ Niebla 🌫️                          │
│  ○ Ventoso 💨                         │
│                                      │
│  Comentario (opcional):              │
│  [                              ]    │
│                                      │
│  [Cancelar]    [Enviar reporte]      │
└─────────────────────────────────────┘
                    ↓ enviar
         Toast: "Reporte enviado ✓"
```

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/components/Sidebar/ClassificationReportModal.tsx` | Crear — modal del reporte |
| `src/components/Sidebar/LocationDetail.tsx` | Modificar — agregar botón + integrar modal |
| `src/services/firebase/classificationReportService.ts` | Crear — write/read de reportes |
| `src/components/TestingTools/ReportsPanel.tsx` | Crear — panel de reportes en TestingTools |
| `src/components/TestingTools/TestingTools.tsx` | Modificar — agregar tab de reportes |

---

## Consideraciones de UX

- El botón de reporte solo aparece cuando `city.condition` está presente (datos climáticos cargados)
- No debe interrumpir el flujo principal — es acción secundaria discreta
- En mobile: el modal usa el mismo patrón de bottom drawer que `FilterPanelModal`
- Texto del botón en desktop: "Reportar" | En mobile: solo icono

---

## Valor de negocio

Este es el **dataset de entrenamiento** para mejorar el algoritmo de clasificación:
- Identifica qué condiciones AccuWeather generan más confusión
- Revela si los umbrales de WINDY (40 km/h) son correctos
- Permite detectar patrones geográficos (¿ciudades costeras clasifican diferente?)
- Base para una futura US de "sugerencia automática de mejora de reglas"

---

## Dependencias

- US-804 (Firebase setup)
- US-801 (datos base del pronóstico disponibles)

## Bloqueante para

- Ninguna (es el paso final del ciclo de feedback)
