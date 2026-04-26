# 🐛 BUG-010: Copiar Coords — Checkmark en Todas las Filas

**Fase:** 7 (Session 16)  
**US Related:** US-1108  
**Status:** ✅ FIXED  
**Commit:** `aa977c2`  

---

## Problema

Botón "Copiar Coords" (📋) en tabla de predicciones mostraba checkmark ✓ en TODAS las filas después de hacer click en una sola fila.

**UX esperado:** Checkmark solo en la fila que copiaste  
**UX real:** Checkmark en todas las filas

---

## Causa Raíz

Estado compartido a nivel de tabla en lugar de por row:
```typescript
// INCORRECTO:
const [copiedCityId, setCopiedCityId] = useState<string | null>(null)
// Cuando copias city X, setCopiedCityId(X)
// Render: Si row.cityId === copiedCityId → muestra checkmark
// PERO: Múltiples rows pueden tener mismo cityId (misma ciudad, horas diferentes)

// CORRECTO:
const [copiedRowId, setCopiedRowId] = useState<string | null>(null)
// rowId = `${city.id}-${date_hour}` (unique per row)
```

---

## Implementación

**Archivos modificados:**
- `src/components/Analytics/PredictionAnalysisTable.tsx`
  - Cambiar estado de `copiedCityId` a `copiedRowId`
  - Generar `rowId` único por fila: `[city.id, dateHour].join('|')`
  - Comparar `row.rowId === copiedRowId` en render

**Cambio:**
```typescript
// Handler al hacer click en 📋
const handleCopyCoords = (row: PredictionRow) => {
  const rowId = `${row.city.id}|${row.dateHour}`
  navigator.clipboard.writeText(`${row.city.lat},${row.city.lon}`)
  setCopiedRowId(rowId)
  
  // Reset checkmark después de 2s
  setTimeout(() => setCopiedRowId(null), 2000)
}

// En render:
{row.rowId === copiedRowId && <span>✓</span>}
```

---

## Validación

✅ Checkmark aparece solo en fila clickeada  
✅ Coords se copian al clipboard  
✅ Checkmark desaparece después de 2 segundos  
✅ Multiple rows de misma ciudad funcionan independently  

---

## Lección

**Regla:** State que parece único a nivel de tabla (cityId) pero puede ser duplicado en datos (múltiples rows/ciudad) → necesita key único por row.
