# US-1109: Cascade Delete incluye weather_reports y classification_reports

**Sprint:** 10 (Ampliacion — Session 17)
**Tipo:** Bug Fix + Feature
**Prioridad:** Media
**Estimacion:** 1-2 SP
**Status:** ✅ DOCUMENTADA — lista para implementacion

---

## Contexto

Cuando el usuario ejecuta "Cascade Delete" en Testing Tools, espera borrar todo el estado de predicciones
para comenzar desde cero. El cascade delete actual elimina `/city_weather` (ForecastDocs) pero
**no elimina** `weather_reports` ni `classification_reports`.

Al regenerar ForecastDocs (misma hora), el `reportIndex` en `fetchPredictions()` encuentra reportes
del ciclo anterior, contaminando los datos "frescos" con validaciones de sesiones anteriores.

Ver diagnostico completo: `bugfixes/BUG-011-reports-survive-cascade-delete.md`

---

## Criterios de Aceptacion

- [ ] Al ejecutar Cascade Delete, se eliminan tambien TODOS los docs de `weather_reports`
- [ ] Al ejecutar Cascade Delete, se eliminan tambien TODOS los docs de `classification_reports`
- [ ] El count en CleanupPanel muestra cuantos reports hay antes de limpiar
- [ ] El toast de confirmacion incluye cuantos reports se eliminaron
- [ ] Si no hay reports, el mensaje de confirmacion lo indica
- [ ] El cascade delete sigue siendo mutuamente exclusivo con opciones granulares (sin cambio)

---

## Plan de Implementacion

### 1. Cloud Function — `clearFirestoreData` en `functions/src/index.ts`

Agregar borrado de ambas colecciones cuando `cascadeDeleteAll = true`:

```typescript
// Dentro del bloque if (cascadeDeleteAll)
// Despues de borrar city_weather...

// Borrar weather_reports
const weatherReports = await db.collection('weather_reports').get()
let reportsDeleted = 0
const batch2 = db.batch()
weatherReports.docs.forEach(doc => batch2.delete(doc.ref))
if (weatherReports.size > 0) await batch2.commit()
reportsDeleted += weatherReports.size

// Borrar classification_reports
const classReports = await db.collection('classification_reports').get()
const batch3 = db.batch()
classReports.docs.forEach(doc => batch3.delete(doc.ref))
if (classReports.size > 0) await batch3.commit()
reportsDeleted += classReports.size
```

Agregar `reportsDeleted` al response:
```typescript
return res.json({ deletedCount, reportsDeleted })
```

### 2. cleanupService.ts — Interfaces y conteos

Agregar `reportsDocs` a `CleanupCounts`:
```typescript
export interface CleanupCounts {
  nullDocs: number
  oldDocs: number
  cacheSize: string
  cascadeDocs: number
  reportsDocs: number  // NUEVO
}
```

Agregar query de count en `fetchCleanupCounts()`:
```typescript
// Count weather_reports + classification_reports
let reportsCount = 0
try {
  const [wr, cr] = await Promise.all([
    getDocs(collection(db, 'weather_reports')),
    getDocs(collection(db, 'classification_reports')),
  ])
  reportsCount = wr.size + cr.size
} catch { reportsCount = 0 }

return { ..., reportsDocs: reportsCount }
```

Agregar `reportsDeleted` a `CleanupResults`:
```typescript
export interface CleanupResults {
  firestore: { deleted: number; reportsDeleted: number; error: string | null }
  // ...
}
```

Mapear respuesta de Cloud Function:
```typescript
results.firestore.reportsDeleted = data.reportsDeleted ?? 0
```

### 3. CleanupPanel.tsx — Mostrar count en descripcion y toast

Actualizar descripcion del Cascade Delete para incluir reports count:
```tsx
<p style={styles.description}>
  Elimina TODOS los documentos de city_weather, weather_reports y
  classification_reports ({counts.reportsDocs} reportes). Nuclear reset.
</p>
```

Actualizar toast para incluir reports:
```typescript
if (results.firestore.reportsDeleted > 0) {
  parts.push(`${results.firestore.reportsDeleted} reportes (Firestore)`)
}
```

---

## Archivos a Modificar

| Archivo | Tipo de Cambio |
|---------|---------------|
| `functions/src/index.ts` | Agregar borrado de `weather_reports` + `classification_reports` en cascade |
| `src/services/cleanup/cleanupService.ts` | Interfaces + count query + mapeo resultado |
| `src/components/TestingTools/CleanupPanel.tsx` | Descripcion count + toast mejorado |

**Total:** 3 archivos, ~40 lineas nuevas

---

## Notas de Implementacion

- Las colecciones `weather_reports` y `classification_reports` son **flat** (sin subcollections)
  → No requieren cascade delete, `batch.delete(doc.ref)` es suficiente
- El volumen es pequeño (~30 dias x pocas ciudades) → batch simple sin chunking critico
  (pero el chunking de 500 ops ya esta implementado en la Cloud Function, usar el mismo patron)
- Si cascade delete falla (error en Cloud Function), NO borrar reports como fallback
  → Las 3 operaciones deben ser atomicas o fallar juntas

---

## Criterio de Validacion

1. Ejecutar Cascade Delete + IndexedDB reset
2. Verificar en Firestore Console:
   - `/city_weather`: 0 documentos ✅
   - `/weather_reports`: 0 documentos ✅
   - `/classification_reports`: 0 documentos ✅
3. Refrescar app — nuevos ForecastDocs se crean
4. Verificar tabla: columna "Real" en BLANCO (sin reportes asociados) ✅
5. Toast muestra counts: "X docs (Firestore) + Y reportes (Firestore)"

---

**Rama:** sprint-10 | **Sesion:** 17
