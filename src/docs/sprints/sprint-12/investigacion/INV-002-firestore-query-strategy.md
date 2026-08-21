# INV-002 — Estrategia de query Firestore para weather_reports

**Fecha:** 2026-06-22
**Branch:** sprint-12
**Estado:** COMPLETADA
**Referencia US:** US-1201 (CA-06)

---

## Pregunta

Es correcto agregar `where('timestamp', '>=', minDate)` a la query de
`weather_reports`? Hay riesgo de romper algo o necesitar un indice nuevo?

---

## Contexto previo

En `firebaseWeatherService.ts:114` existe este comentario:

> "Firestore requiere indices COLLECTION_GROUP para where() en collectionGroup"

Por eso `getRecentForecasts` NO usa `where` y filtra en memoria. La pregunta
es si esa misma restriccion aplica a `weather_reports`.

---

## Hallazgo clave: coleccion raiz vs subcoleccion

| Tipo | Ejemplo en este proyecto | `where` sin indice |
|------|--------------------------|-------------------|
| Subcoleccion (collectionGroup) | `city_weather/{id}/forecasts` | NO — requiere indice COLLECTION_GROUP |
| Coleccion raiz plana | `weather_reports` | SI — Firestore lo soporta nativamente |

`weather_reports` es una coleccion raiz. Firestore soporta `where` en campos
simples de colecciones raiz **sin crear ningun indice manual**. El indice
automatico de `timestamp` ya existe por defecto.

**La restriccion del comentario en `getRecentForecasts` NO aplica aqui.**

---

## Impacto en costo (uso personal)

TTL de los documentos: 30 dias. Con uso personal, la coleccion nunca
acumula mas de `reportes_por_dia * 30` documentos.

| Consulta | Sin `where` | Con `where` |
|----------|------------|-------------|
| Panel 720h (30 dias) | Lee todos (~N docs), retorna ~N | Lee ~N, retorna ~N — igual |
| Tabla 24h con 300 docs acumulados | Lee 300, retorna ~10 | Lee ~10 — **30x menos** |

El beneficio real del `where` es para la consulta de **24h de la tabla**,
no para la de 720h del panel. Ambos casos son gratuitos con uso personal
(plan gratuito: 50k lecturas/dia).

---

## Conclusion

Agregar `where('timestamp', '>=', minDate)` a `getRecentWeatherReports`:

- **Es correcto** — coleccion raiz, sin restriccion de indice
- **No rompe nada** — el comportamiento es identico, solo mas eficiente
- **No requiere** crear indices en Firestore Console ni en `firestore.indexes.json`
- **Beneficio inmediato** bajo, pero es la practica correcta y protege el costo
  si el volumen crece o si se agrega multi-usuario en el futuro

**Decision:** incluir `where` en la implementacion de CA-06.

---

## Cambio concreto

```ts
// Antes (filtra en memoria — lee TODOS los docs)
const allReports = await getDocs(collection(db, 'weather_reports'))
const filtered = allReports.docs.filter(...)

// Despues (filtra en Firestore — lee solo los necesarios)
const q = query(
  collection(db, 'weather_reports'),
  where('timestamp', '>=', minDate)
)
const snapshot = await getDocs(q)
```

Requiere importar `query` y `where` junto con `getDocs` y `collection`.
