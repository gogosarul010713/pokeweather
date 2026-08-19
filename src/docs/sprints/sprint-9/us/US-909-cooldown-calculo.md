# US-909 -- Calculo de Cooldown de Pokemon GO por nido

**Sprint:** 9
**Story Points:** (a estimar)
**Priority:** Alta
**Status:** Pendiente
**Dependencies:** US-907 (Mi Zona / punto base), US-908 (Sort chips Distancia/Cooldown)

---

## User Story

> Como jugador de Pokemon GO que usa la app para planear que nidos visitar,
> quiero ver el tiempo de cooldown requerido antes de poder cazar en cada nido,
> para saber cuanto tiempo tengo que esperar antes de actuar en esa ubicacion y evitar un softban.

---

## Problem

La app ya muestra distancia entre el punto base del usuario y cada nido (US-907). Sin embargo, la distancia sola no es suficiente: en Pokemon GO, saltar de ubicacion requiere esperar un tiempo de cooldown antes de realizar acciones como catchear o girar un PokeStop. Sin este dato, el usuario puede ir a un nido y actuar demasiado pronto, arriesgando un softban.

---

## Tabla de referencia (fuente: pgsharp.com/cooldown-rules)

| Distancia (km) | Cooldown |
|---|---|
| < 1 | 30 seg |
| 1 - 5 | 2 min |
| 5 - 10 | 8 min |
| 10 - 25 | 12 min |
| 25 - 65 | 15 min |
| 65 - 80 | 16 min |
| 80 - 100 | 22 min |
| 100 - 250 | 25 min |
| 250 - 500 | 35 min |
| 500 - 750 | 45 min |
| 750 - 1000 | 52 min |
| 1000 - 1500 | 56 min |
| >= 1500 | 2 h |

Limites: inferior inclusivo, superior exclusivo. Ultimo tramo cubre > 10000 km (maximo geografico real).

---

## Acceptance Criteria

### Escenario 1 -- Calculo basico desde punto base

```gherkin
Given el usuario tiene homeLocation fijado (lat/lng)
And la distancia entre homeLocation y un nido esta calculada
When se muestra la informacion de ese nido
Then se muestra el cooldown segun la tabla oficial
And el valor es el tiempo minimo de espera ("30 seg", "8 min", "2 h", etc.)
```

### Escenario 2 -- Distancia < 1 km

```gherkin
Given el punto base esta a menos de 1 km del nido
When se calcula el cooldown
Then se muestra "30 seg" (no "0 min")
```

### Escenario 3 -- Sin punto base

```gherkin
Given el usuario NO tiene homeLocation fijado
When se ve la lista o detalle de nidos
Then NO se muestra dato de cooldown
And el sort por Cooldown (US-908) NO es accesible
```

### Escenario 4 -- Sort por Cooldown

```gherkin
Given el usuario tiene homeLocation fijado
And el chip activo es "Cooldown asc"
When se renderiza la lista de nidos
Then los nidos se ordenan de menor a mayor cooldown
And nidos con igual cooldown se desempatan por distancia
```

### Escenario 5 -- Limite exacto de tramo

```gherkin
Given la distancia calculada es exactamente 65 km
When se evalua el tramo de cooldown
Then el cooldown es 16 min (tramo 65-80 km, limite inferior inclusivo)
```

---

## Files to Modify

| Archivo | Accion |
|---|---|
| `src/utils/cooldown.ts` | Nuevo -- funcion pura `getCooldown(km: number): string` |
| `src/components/Nests/NestCard.tsx` | Mostrar cooldown si hay homeLocation |
| `src/components/Nests/NestFeed.tsx` | Conectar sort Cooldown (depende de US-908) |
| `tests/unit/cooldown.test.ts` | Nuevo -- tabla completa + casos edge |

---

## Notes

**Funcion pura:** `getCooldown(distanceKm: number): string` en `src/utils/`. Sin estado, sin dependencias de store.

**No es un timer en vivo.** Muestra el tiempo de espera estatico, no un countdown.

**Distancia existente:** reutiliza el calculo de Haversine ya implementado en geo service (US-907). No reescribir.

**Casos edge:**

| Caso | Comportamiento |
|---|---|
| Distancia = 0 | "30 seg" |
| Coordenadas null / NaN | No mostrar cooldown, sin crash |
| Distancia > 10000 km | "2 h" (mismo tramo >= 1500 km) |
| Cooldown 2 horas | "2 h", no "120 min" |

---

## Fuera de scope

- Timer/countdown en tiempo real
- Registro de ultima accion del usuario
- Distincion entre tipos de accion (raid vs catch vs PokeStop)
- Notificaciones al expirar el cooldown
- Historico de cooldowns
- Cooldown entre dos nidos (no el punto base)
- Seccion de Climas (Ciudades): aplica solo a Nidos
