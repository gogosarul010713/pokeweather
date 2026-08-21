# US-1205 — Unificar sunny/clear: iconos 33/34 -> `'sunny'` en clasificador (CF + frontend)

**Sprint:** 12
**Estado:** Completado ✅ 2026-07-14
**Prioridad:** Alta
**Estimacion:** 1h
**Depende de:** —
**Referencia:** D-051, INV-003

---

## Historia de usuario

Como desarrollador del sistema de clima PGO, quiero que los iconos nocturnos de cielo
despejado (AccuWeather 33 y 34) emitan `pgoCondition: 'sunny'` (no `'clear'`), y que
`'clear'` no exista como condicion interna, para mantener coherencia con el sistema
oficial de Pokemon GO donde Sunny/Clear es una sola condicion.

---

## Contexto tecnico

D-051 revierte D-050. `'clear'` no es una condicion PGO separada — es `'sunny'` de noche.
La distincion dia/noche es solo visual, no funcional en gameplay. Firestore almacena
solo `pgo_condition: 'sunny'` para todos los cielos despejados.

Hay dos copias del clasificador — ambas actualizadas atomicamente (BL-012 pendiente).

---

## Criterios de aceptacion

### CA-01 — Tipo `WeatherCondition` sin `'clear'` en ambas copias
- `functions/src/shared/weatherClassify.ts`: tipo NO incluye `'clear'`
- `src/services/weather/weatherClassify.ts`: tipo NO incluye `'clear'`

### CA-02 — Iconos 33 y 34 clasifican como `'sunny'`
- `WEATHER_TRANSLATIONS[33].pgoCondition === 'sunny'`
- `WEATHER_TRANSLATIONS[34].pgoCondition === 'sunny'`
- `resolveCondition(33, 0, 0) === 'sunny'`
- `resolveCondition(34, 0, 0) === 'sunny'`

### CA-03 — `'clear'` removido de mapas auxiliares
- `weatherCatalogService.ts`: `base_conditions_replaceable` no incluye `'clear'`

### CA-04 — Build TypeScript limpio

---

## Implementacion

Archivos modificados:
- `src/services/weather/weatherClassify.ts` — tipo + iconos 33/34
- `functions/src/shared/weatherClassify.ts` — idem (copia CF)
- `src/services/firebase/weatherCatalogService.ts:98` — `base_conditions_replaceable` sin `'clear'`
