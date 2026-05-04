# BUG-012 — Cleanup deja mock data en tabla y placeholders en sidebar (UX engañoso)

**Detectado:** 2026-05-04 (preview Vercel sprint-10)
**Reportado por:** usuario en preview
**Severidad:** Media (UX engañoso, no funcional)
**Status:** ✅ Fixed

## Síntomas

1. **PredictionAnalysisTable:** tras Limpiar (IndexedDB + localStorage + cascade delete Firestore),
   la tabla sigue mostrando 72 predicciones (3 ciudades × 24 h). Indicador dice "📊 Mock data".
2. **Sidebar:** las ciudades favoritas muestran TODAS clima ☀️ Soleado y NO renderizan
   `boostedTypes` (íconos de tipos potenciados).

## Root cause

### Bug 1 — Tabla cae a mock automático

`PredictionAnalysisDemo.tsx` (línea 142-159 pre-fix):
```tsx
const realData = await fetchPredictions();
if (realData.length > 0) {
  setRows(realData);
} else {
  // No hay datos, usar mock
  setRows(generateMockData());  // ← 72 filas siempre
}
```

Tras cleanup completo (`cascadeDeleteAll`), Firestore queda vacío → `fetchPredictions()` retorna `[]`
→ fallback automático a `generateMockData()` → tabla muestra 72 filas mock con etiqueta
"📊 Mock data" minúscula que el usuario no asocia con "datos falsos".

### Bug 2 — Sidebar muestra placeholders del transformer

`useWeather.ts` (línea 100-135) construye `City` con valores placeholder cuando el JSON estático
se transforma:
```ts
condition: 'sunny',
boostedTypes: [],
tempC: 0,
weatherIcon: 0,
```

Si `getWeatherFromFirestore(cityId)` retorna `null` (Firestore vacío post-cleanup) Y el cache
local está limpio, el flujo cae al fallback final (línea 92):
```ts
const withTime = { ...city, localTime: calculateLocalTime(city.timezone) }
result.push(withTime)
```

→ `city.condition === 'sunny'` y `city.boostedTypes === []` se renderizan en `LocationCard` como
si fueran reales.

## Decisión de fix

**Opción descartada:** Reintentar fetch con backoff (no soluciona; Firestore está vacío
intencionalmente tras cleanup).

**Opción descartada:** Auto-disparar sync tras cleanup (riesgo de loops + costos AccuWeather).

**Opción aplicada:** Estado vacío explícito en ambas superficies. El usuario debe ver "no hay
datos" claramente y decidir si sincronizar o cargar mock manualmente.

## Implementación

### Fix 1 — `PredictionAnalysisDemo.tsx`

- Nuevo estado `dataSource: 'firestore' | 'mock' | 'empty'` para etiquetar el origen real.
- Eliminado fallback automático a `generateMockData()` cuando Firestore retorna vacío.
- Si `refreshKey > 0` (post-cleanup), bypass del cache local — leer Firestore directo
  (evita que cache stale enmascare estado real).
- Nuevo empty state visual con call-to-action: "Sincroniza desde la pestaña Sincronización"
  + botón opcional "Cargar datos mock (testing)".
- Indicador "📊 Mock data" actualizado a texto explícito:
  *"📊 Mock data (datos simulados — no representan estado real)"*.

### Fix 2 — `LocationCard.tsx`

- Nueva heurística `hasNoWeatherData`: detecta placeholder (tempC=0 + boostedTypes vacío +
  weatherIcon ausente).
- Si `hasNoWeatherData`, render alternativo:
  - Ícono ⏳ en `lc-weather-empty` (en lugar de soleado falso).
  - Etiqueta "sin datos" con borde dashed (en lugar de ausencia silenciosa de tipos).
- Tooltip "Sin datos sincronizados" en ambos elementos.

## Archivos tocados

- `src/components/Analytics/PredictionAnalysisDemo.tsx`
- `src/components/Sidebar/LocationCard.tsx`
- `src/docs/sprints/sprint-10/bugfixes/bug-012-cleanup-mock-fallback-engagnoso.md` (nuevo)

## Validación

### Local

- ✅ `npm run build` — 0 TS errors, bundle 244 KB gzip (sin regresión).
- ✅ `npm run lint` — 0 errores nuevos en archivos tocados (49 errores preexistentes intactos).
- ✅ Re-render manual: cleanup → tabla muestra empty state, sidebar muestra ⏳ + "sin datos".

### Preview Vercel (post-deploy)

Reproducción esperada:
1. Abrir `https://pokeweather-git-sprint-10-*.vercel.app/`
2. Testing Tools → Limpiar → marcar "TODO IndexedDB" + "TODO localStorage" + cascade delete
   → confirmar cleanup
3. Tab "Predicciones" → debe mostrar empty state "📭 Sin predicciones disponibles"
   (NO "📊 Mock data" + 72 filas).
4. Refresh página → sidebar debe mostrar ⏳ + "sin datos" en cada ciudad
   (NO ☀️ Soleado falso).
5. Sync manual → ambas superficies se rellenan con datos reales.

## Lecciones

- **Fallbacks "amistosos" pueden engañar:** cuando un sistema cae a mock por defecto, el
  usuario lo interpreta como bug (datos que no se borran). Mejor estado vacío explícito.
- **Placeholders en transformers:** valores default (`condition: 'sunny'`, `tempC: 0`)
  son útiles para tipo, pero requieren un flag de "no sincronizado" para distinguir de
  datos reales que coincidan accidentalmente.
- **Cleanup completo debe ser idempotente desde la UI:** después de borrar, las superficies
  deben reflejar el estado real (vacío) sin acción adicional del usuario.

## Relación con otros bugs

- **BUG-008** (reporte no actualiza tabla): mismo síntoma superficial pero causa distinta.
  Aquel se resolvió con `refreshKey`. Éste va más profundo: el `refreshKey` SÍ disparaba
  refetch, pero el código caía a mock cuando Firestore retornaba vacío.
- **D-039** (CF guarda raw, frontend clasifica): no afectado. La clasificación funciona
  cuando hay datos. El problema era qué hacer cuando NO hay datos.
