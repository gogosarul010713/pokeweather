# 📚 EVIDENCIA: Por qué eliminar TAB "Historial" (HistoryGrid)

**Fecha:** 2026-04-13  
**Analista SR**

---

## 🎯 Conclusión

✅ **SEGURO ELIMINAR** — La funcionalidad de Historial fue un puente transitorio (Sprint 6) para validar snapshots manualmente. Ahora **Firebase Report es la verdad oficial** y hace el mismo trabajo de forma mejor.

---

## 📊 Antes vs Después

### ANTES (Sprint 6 — IndexedDB local)

**Historial:** Mostraba snapshots guardados en IndexedDB
```
HistoryGrid.tsx
├─ Carga snapshots desde IndexedDB (weatherHistoryService.getSnapshots)
├─ Agrupa por fecha + ciudad
├─ Permite llenar manualmente "actualCondition" (lo que viste en Pokémon GO)
├─ Calcula precisión local (predicted vs actual)
├─ Exporta a Excel (exportHistory.ts)
└─ Componente: SnapshotPopover (edita snapshots individuales)
```

**¿Quién lo usaba?**
- Desarrollador debuggeando clasificación local
- Usuario experimentando con correcciones manuales

---

### AHORA (Sprint 8+ — Firebase + Report Modal)

**Report Modal:** Guarda reportes en Firestore
```
ClassificationReportModal.tsx → ReportsPanel.tsx
├─ Usuario abre interfaz clara: "¿Cuál fue el clima real?"
├─ Selecciona condición + tipos Pokémon
├─ Escribe comentario
└─ Guarda en Firestore (/classification_reports)
   {
     city_id, city_name,
     date_hour: "2026-04-08-14",
     classified_as: "sunny",     ← Sistema dijo
     should_be: "cloudy",         ← Usuario verifica (LA VERDAD)
     timestamp, reporter, ttl
   }
```

**¿Quién lo usa?**
- Usuario final en producción
- Sistema de validación en Firebase

---

## 🔍 Comparativa Técnica

| Aspecto | Historial (IndexedDB) | Report (Firestore) | Ganador |
|--------|----------------------|-------------------|---------|
| **Persistencia** | Local (pierde datos al limpiar IDB) | Cloud (permanente 30 días TTL) | ✅ Report |
| **Scope** | Solo snapshots clasificados | Reportes de error únicamente | ✅ Report (Más relevante) |
| **Validación** | Manual en tabla fea | Modal hermosa con guía | ✅ Report |
| **Acceso** | Solo en app local | Desde cualquier dispositivo | ✅ Report |
| **Analytics** | Cálculos en React | Queries en Metabase | ✅ Report |
| **TTL** | Manual (setRetentionDays) | Automático en Firestore | ✅ Report |
| **Multi-dispositivo** | ❌ NO | ✅ SÍ | ✅ Report |

---

## 💾 Datos que se Pierden

### HistoryGrid almacenaba:
```typescript
// WeatherSnapshot (IndexedDB)
{
  snapshotId: "tokyo-202604081400",
  cityId, cityName, cityCountry, cityRegion,
  capturedAt: timestamp,
  condition: "sunny",  ← Predicción
  actualCondition?: "cloudy",  ← Validación manual
  isCorrect?: boolean,
  ...tempC, windKmh, etc
}
```

### ¿Se pierde algo importante al eliminar?

| Campo | ¿Lo necesitamos? | ¿Dónde está ahora? | Veredicto |
|-------|-----------------|-------------------|----------|
| Snapshots históricos | ⚠️ Parcialmente | Firestore `city_weather` | ✅ Disponible |
| Validaciones manuales | ✅ SÍ | Firestore `classification_reports` | ✅ Mejor |
| Cálculos de precisión | ✅ SÍ | Dashboard Metabase | ✅ Mejor |
| Exportación a Excel | ❌ No crítico | No planeado | ✅ OK |

**Conclusión:** Nada importante se pierde. Report de Firestore es superior.

---

## 🔗 Funciones Afectadas en weatherHistoryService

```typescript
// Usar en: HistoryGrid.tsx + SnapshotPopover.tsx
export async function getSnapshots(options: HistoryOptions): Promise<WeatherSnapshot[]>
export async function updateActualCondition(snapshotId: string, condition: string | null): Promise<boolean>

// Resultado al eliminar HistoryGrid + SnapshotPopover:
→ CERO referencias. Estas funciones quedan huérfanas.
→ ACCIÓN: Eliminar también estas funciones.
```

---

## ⚙️ Dependencias Eliminadas

```
HistoryGrid.tsx (450 líneas)
├─ Importa: getSnapshots, setRetentionDays
├─ Importa: SnapshotPopover
├─ Importa: exportHistoryToExcel
└─ Renderiza: <HistoryGrid />

SnapshotPopover.tsx (200+ líneas)
└─ Importa: updateActualCondition

exportHistory.ts (120 líneas)
└─ Exporta: exportHistoryToExcel
```

**Total a eliminar:** ~770 líneas + tipos, interfaces

---

## ✅ Verification Checklist

- [x] HistoryGrid solo usado en TestingTools
- [x] SnapshotPopover solo usado en HistoryGrid
- [x] exportHistory solo usado en HistoryGrid
- [x] getSnapshots solo usado en HistoryGrid + PrecisionMetrics (que se elimina)
- [x] updateActualCondition solo usado en SnapshotPopover
- [x] Report Modal en Firestore es la alternativa
- [x] Cero impacto en useWeather.ts
- [x] Cero impacto en otros componentes

---

## 📝 Conclusión Final

✅ **SEGURO ELIMINAR TODO ESTO**

**Razones:**
1. **Redundancia:** Report de Firestore hace lo mismo, pero mejor
2. **Deuda técnica:** Historial es "old way" pre-Firebase
3. **Bundle size:** -~770 líneas de código muerto
4. **UX mejora:** Users usan Report modal (más clara)
5. **Analytics mejora:** Metabase es mejor para investigación que HistoryGrid

**Impacto:** CERO en funcionalidad crítica
