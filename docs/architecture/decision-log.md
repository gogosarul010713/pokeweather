# Decision Log

---

## DEC-001 -- radar-data-source-strategy

**Date:** 2026-09-08
**Status:** Accepted

## Context

Se investigo como obtener datos en tiempo real de Pokemon GO (raids, 100IV, pokeparadas, gimnasios, nidos) para integrarlos en la app. El objetivo es cobertura mundial, no solo una ciudad. Se evaluaron 4 opciones: ingenieria inversa de PGSharp, modificar PGSharp, partir de repos publicos (WeCatch), y usar servicios de terceros.

Hallazgos clave de la investigacion (evidencia visual verificada en browser):

- **WeCatch** no existe como escaner real. El repo original (wecatch/wecatch.github.io) tiene su ultimo commit hace 9 anos y es una landing page estatica. El sitio wecatch.org es un clon no oficial.
- **PogoMap.info** funciona y tiene datos reales de pokeparadas y gimnasios para Toluca/Metepec y el mundo. No tiene API publica. Los datos vienen de dumps de comunidad compatibles con OpenStreetMap.
- **PoGoMapper** es un servicio activo con escaner propio, 859 areas cubiertas, 54,746 hundos encontrados. Cobertura concentrada en Europa, USA, Australia, Canada. Mexico no esta incluido aun. Tiene suscripciones (precio requiere login con Discord).
- **Golbat (UnownHash/Golbat)** es el escaner open source mas activo en 2026 (ultimo commit la semana pasada, 941 commits). Es la base tecnica que usan las comunidades grandes. Requiere VPS + dispositivos Android + cuentas Pokemon GO de sacrificio.
- **Ingenieria inversa de PGSharp** es tecnica pero legalmente riesgosa (DMCA, EULA). PGSharp usa ofuscacion y trafico cifrado. No viable como base del proyecto.

## Decision

Adoptar estrategia en 3 capas segun el tipo de dato:

1. **Pokeparadas y gimnasios:** usar dumps publicos de comunidad (repo `nileplumb/PokemonStopAndGymData`) -- cobertura mundial, gratis, integracion directa con Leaflet existente.
2. **Raids y 100IV en zonas con cobertura:** conectarse a PoGoMapper via webhooks cuando haya suscripcion activa.
3. **Cobertura propia en zonas sin servicio:** instalar Golbat en VPS propio con dispositivos Android dedicados -- decision futura, requiere inversion.

## Consequences

- Pokeparadas y gimnasios disponibles mundialmente desde el primer sprint sin costo adicional.
- Raids y 100IV limitados a las zonas que PoGoMapper ya cubre (Europa, USA, etc.) hasta que Mexico sea agregado o se monte Golbat propio.
- Montar Golbat propio requiere ~$300-500 MXN/mes de VPS + hardware Android de una sola vez + mantenimiento continuo de cuentas.
- No dependencia de PGSharp ni de sitios falsos como wecatch.org.
