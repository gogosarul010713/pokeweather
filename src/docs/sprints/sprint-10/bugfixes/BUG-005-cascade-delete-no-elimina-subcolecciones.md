---
bug_id: BUG-005
fecha: 2026-04-23
us: US-1102
severidad: Alto
estado: RESUELTO
---

# BUG-005 — Cascade Delete no eliminaba subcolecciones forecasts

## Sintoma

Despues de ejecutar "Cascade Delete" desde TestingTools → Limpiar:
- La UI reportaba "eliminados: 0" o un numero bajo
- Firebase Console seguia mostrando documentos en city_weather → [ciudad] → forecasts
- Los datos persistian visualmente aunque el delete "exitoso"

## Causa Raiz

Firestore NO hace cascade delete automatico. Al eliminar un documento padre,
sus subcolecciones quedan como "huerfanas" — siguen existiendo y son visibles
en Firebase Console aunque el padre ya no exista.

El codigo original solo eliminaba los documentos raiz de `city_weather`:

```typescript
// INCOMPLETO — solo borra padres, forecasts quedan huerfanos
const allDocs = await db.collection('city_weather').get()
totalDeleted = await executeBatchDelete(allDocs.docs)
// forecasts siguen existiendo en Firestore
```

## Solucion Aplicada

Eliminar subcolecciones ANTES de eliminar los documentos padre:

```typescript
// 1. Primero: eliminar todos los forecasts (subcoleccion)
const allForecasts = await db.collectionGroup('forecasts').get()
const forecastsDeleted = await executeBatchDelete(allForecasts.docs)

// 2. Luego: eliminar documentos raiz city_weather
const allCityDocs = await db.collection('city_weather').get()
const cityDocsDeleted = await executeBatchDelete(allCityDocs.docs)

totalDeleted = forecastsDeleted + cityDocsDeleted
```

Resultado verificado: 85 documentos eliminados (forecasts + raices).

## Regla General de Firestore

Nunca asumir cascade delete. Para eliminar un documento con subcolecciones:
1. Obtener y eliminar todas las subcolecciones con `collectionGroup()`
2. Luego eliminar el documento padre

El orden importa: si eliminas el padre primero, los hijos quedan huerfanos
pero siguen siendo accesibles via collectionGroup.

## Si Vuelve a Aparecer

1. Ejecutar cascade delete
2. Verificar en Firebase Console que `city_weather` este vacio
3. Si sigue habiendo datos en `forecasts`, es porque collectionGroup no se ejecuto
4. Verificar que `functions/lib/` este actualizado (ver BUG-002)
