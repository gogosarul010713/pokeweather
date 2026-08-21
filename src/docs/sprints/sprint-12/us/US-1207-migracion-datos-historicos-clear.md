# US-1207 — Migracion de datos historicos `sunny` → `clear` en Firestore

**Sprint:** 12
**Estado:** Pendiente
**Prioridad:** Media
**Estimacion:** 1h
**Depende de:** US-1205 (clasificador actualizado), US-1206 (UI preparada)
**Referencia:** D-050, INV-003

---

## Historia de usuario

Como desarrollador del sistema de analytics, quiero corregir los documentos historicos
de Firestore donde cielos nocturnos despejados fueron clasificados como `sunny`, para
que las metricas de precision del panel no incluyan datos mal etiquetados.

---

## Contexto tecnico

Antes de US-1205, los iconos AccuWeather 33 y 34 (noche despejada) se clasificaban
como `pgo_condition: "sunny"`. Firestore tiene documentos en
`city_weather/{cityId}/forecasts` con `snapshots[].pgo_condition: "sunny"` y
`snapshots[].icon_code: 33` o `34` — clasificacion incorrecta.

El sync natural de la CF corregira los **documentos nuevos** a partir de US-1205.
Esta US corrige los **documentos historicos** existentes.

Los `weather_reports` con `predicted_condition: "sunny"` que corresponden a iconos
33/34 no son autocorregibles (no guardan el `icon_code` — ver INV-001 seccion 2.2).
Se documentan como deuda de datos pero no se migran.

---

## Criterios de aceptacion

### CA-01 — Script de migracion implementado
- Script `scripts/migrate-clear-condition.ts` que:
  - Lee todos los documentos de `city_weather/{cityId}/forecasts`
  - Por cada snapshot donde `icon_code IN [33, 34]` y `pgo_condition === 'sunny'`
  - Actualiza `pgo_condition` a `'clear'`
  - Loguea cuantos documentos y snapshots fueron actualizados

### CA-02 — Dry-run disponible
- El script acepta flag `--dry-run` que imprime los cambios sin ejecutarlos
- Util para verificar el alcance antes de ejecutar en prod

### CA-03 — Ejecucion exitosa en DEV
- Ejecutar en proyecto `weather-app-dev-f28ce` sin errores
- Verificar en Firestore console que los snapshots corregidos tienen `pgo_condition: "clear"`

### CA-04 — Ejecucion exitosa en PROD (con confirmacion previa)
- Ejecutar en proyecto `weather-app-prod-ef50d` con confirmacion explicita del usuario
- Documentar cuantos snapshots fueron migrados

---

## Diseno tecnico

```ts
// scripts/migrate-clear-condition.ts
// Patron: similar a scripts/clean-firestore.ts

const ICONS_TO_MIGRATE = [33, 34]
const DRY_RUN = process.argv.includes('--dry-run')

async function migrateClearCondition() {
  // 1. Obtener todas las ciudades (collectionGroup 'forecasts')
  // 2. Por cada documento, iterar snapshots
  // 3. Si snapshot.icon_code IN [33, 34] && snapshot.pgo_condition === 'sunny'
  //    → actualizar a 'clear'
  // 4. Si hay cambios y !DRY_RUN → batch write
  // 5. Loguear estadisticas finales
}
```

### Estimacion de documentos afectados

- Ciudades: ~104
- Forecasts por ciudad: 1 documento activo (TTL 30d)
- Snapshots por documento: 12 (12h de pronostico)
- Porcentaje nocturno despejado: variable segun ciudad y temporada
- Estimado conservador: < 500 snapshots en total

---

## Limitaciones conocidas

### weather_reports no son migrables automaticamente

Los documentos en `weather_reports` tienen:
- `predicted_condition: "sunny"` — podria ser dia o noche
- `reported_condition: string` — lo que el usuario observo
- **NO tienen `icon_code`** — no hay forma de distinguir si el `sunny` era icono 1/2
  (dia real) o 33/34 (noche mal clasificada)

Por tanto, los reportes historicos quedan con posibles datos incorrectos en
`predicted_condition`. El impacto en metricas de precision es marginal y no bloquea.
Registrado como deuda de datos — no se migra en esta US.

---

## Notas de implementacion

- Ejecutar SIEMPRE `--dry-run` primero para confirmar alcance
- Seguir el patron de scripts existentes en `scripts/clean-firestore.ts`
- Requiere credenciales de Firebase Admin (mismas que otros scripts)
- Ejecutar en DEV primero, luego PROD con confirmacion del usuario
- No es urgente ejecutar en prod si el sync natural ya esta corriendo —
  los documentos nuevos ya llegaran con `'clear'` correcto
