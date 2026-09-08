# PLAN-2026-09-08 -- radar-data-integration

**Date:** 2026-09-08
**Status:** Draft
**Ref:** DEC-001 (docs/architecture/decision-log.md)

---

## Objetivo

Integrar datos de Pokemon GO en tiempo real (pokeparadas, gimnasios, raids, 100IV) a la app existente (React + Leaflet + Zustand).

---

## Fase 1 -- Pokeparadas y Gimnasios (sin escaner, cobertura mundial)

**Fuente:** `nileplumb/PokemonStopAndGymData` -- dumps JSON de comunidad, actualizados periodicamente.

**Por que esta opcion:** no requiere escaner ni costo mensual. Los datos son estaticos (pokeparadas y gimnasios no cambian seguido). Cobertura mundial desde el dia 1.

**Flujo:**
```
GitHub repo (JSON dump) --> Firebase/backend --> Leaflet markers en la app
```

**Pasos tecnicos:**
1. Descargar dump JSON del repo de nileplumb (o hacer fetch periodico via Cloud Function)
2. Cargar los datos a Firestore o Realtime DB (ya tienes Firebase en el proyecto)
3. En la app: query por bounding box del mapa visible (lat/lng actual +/- delta)
4. Renderizar markers en el mapa Leaflet existente con iconos de pokeparada/gimnasio

**Consideraciones:**
- El dump es grande (millones de puntos globales) -- cargar solo lo visible en el viewport, nunca todo el JSON
- Filtrar por zoom minimo para no saturar el mapa con millones de markers
- Actualizacion del dump: 1 vez por mes es suficiente (los POIs cambian poco)

---

## Fase 2 -- Raids y 100IV via PoGoMapper (cobertura parcial)

**Fuente:** PoGoMapper -- servicio de escaner con suscripcion, API webhook.

**Limitacion conocida:** cobertura activa solo en Europa, USA, Canada, Australia. Mexico no cubierto aun. Se puede solicitar via `pogomapper.com/area-requests/new`.

**Flujo:**
```
PoGoMapper escaner --> POST webhook a tu Cloud Function --> Firestore --> app React (realtime listener)
```

**Pasos tecnicos:**
1. Crear cuenta en PoGoMapper (login con Discord en pogomapper.com)
2. Confirmar precio de suscripcion (requiere login -- no verificado aun)
3. En Firebase: crear Cloud Function con endpoint publico que reciba POST de PoGoMapper
4. La Cloud Function valida el payload y escribe en Firestore coleccion `raids` / `hundos`
5. La app React usa `onSnapshot` de Firestore para recibir datos en tiempo real
6. Mostrar raids y 100IV en el mapa con TTL (raids expiran, Pokemon desaparecen)

**Payload esperado de PoGoMapper (formato webhook estandar):**
```json
{
  "type": "pokemon" | "raid",
  "message": {
    "latitude": 0.0,
    "longitude": 0.0,
    "pokemon_id": 149,
    "individual_attack": 15,
    "individual_defense": 15,
    "individual_stamina": 15,
    "disappear_time": 1234567890
  }
}
```

---

## Fase 3 -- Golbat: escaner propio (cobertura donde nadie mas llega)

**Cuando activar esta fase:** cuando PoGoMapper no tenga cobertura en una zona prioritaria y haya presupuesto para hardware + VPS.

**Stack requerido:**
```
Dispositivos Android (3-5 minimo) con Pokemon GO
        |
   Dragonite (github.com/UnownHash/Dragonite) -- controlador de dispositivos
        |
   Golbat (github.com/UnownHash/Golbat) -- procesador de datos crudos
        |
   PostgreSQL -- base de datos local en el VPS
        |
   API REST de Golbat --> tu app React
```

**API REST de Golbat (endpoints utiles):**
- `GET /api/pokemon?lat=&lon=&distance=` -- Pokemon activos en radio
- `GET /api/raids?lat=&lon=&distance=` -- Raids activas
- `GET /api/gyms?lat=&lon=&distance=` -- Gimnasios con estado
- Webhooks salientes configurables a tu Cloud Function (mismo formato que PoGoMapper)

**Costos estimados (MXN):**
| Item | Costo | Frecuencia |
|------|-------|------------|
| VPS 4GB RAM (Hetzner, DigitalOcean) | $300-500 | Mensual |
| Dispositivos Android viejos (3-5 unidades) | $1,500-3,000 | Una vez |
| Cuentas Pokemon GO de sacrificio | $0 (pero riesgo de ban constante) | Recurrente |

**Riesgo principal:** Niantic detecta escaners y banea cuentas. Las comunidades que lo mantienen bien tienen rotacion constante de cuentas y dispositivos. No es un sistema de "instalar y olvidar".

**Configuracion minima para empezar:**
1. Rentar VPS con Ubuntu 22.04, 4GB RAM, 40GB disco
2. Instalar PostgreSQL + Golbat siguiendo `github.com/UnownHash/Golbat/wiki`
3. Instalar Dragonite para controlar los dispositivos Android
4. Configurar webhook saliente de Golbat hacia tu Cloud Function de Firebase
5. La app React consume los mismos listeners de Firestore -- sin cambios en frontend

---

## Orden de implementacion recomendado

| Fase | Esfuerzo | Costo | Cobertura |
|------|----------|-------|-----------|
| 1 -- Pokeparadas/Gimnasios (nileplumb dump) | 1-2 dias | Gratis | Mundial |
| 2 -- Raids/100IV (PoGoMapper webhook) | 2-3 dias | Suscripcion mensual | Europa/USA/etc |
| 3 -- Golbat escaner propio | 1 semana+ | $300-500/mes + hardware | Donde tu decidas |

**Empezar por Fase 1** -- es el unico que da valor inmediato sin costo ni dependencia de terceros.
