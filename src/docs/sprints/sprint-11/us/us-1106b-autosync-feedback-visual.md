# US-1106b: Feedback visual al togglear auto-sync

**Sprint:** 11
**Story Points:** 0.5 SP
**Prioridad:** Media
**Estado:** Implementado 2026-06-14
**Rama:** `sprint-11`
**Extiende:** [US-1106](../../sprint-10/us/16-us-1106-auto-sync-toggle.md) (implementacion base en Sprint 10)

---

## Descripcion

Al activar o desactivar el toggle de auto-sync en TestingTools > Sincronizacion, mostrar
un mensaje contextual que confirme el nuevo estado y oriente al usuario sobre que esperar.

**Motivacion:** El usuario hace pruebas manuales — abre la app, observa el clima en
Pokemon GO, compara con PokeWeather y reporta. Si la CF corre mientras el usuario no
puede hacer pruebas, los snapshots acumulados no tendran reporte y habra que borrarlos.
El toggle pausa la CF, pero sin feedback el usuario no sabe si el cambio se guardo o
cuando va a ocurrir el proximo ciclo.

---

## Mensajes

**Al ACTIVAR** (`false -> true`):
> "Auto-sync activado. Proxima ejecucion: HH:MM."

La hora se calcula desde la hora local de la app: `new Date()` + 1 hora, truncada a HH:00.

**Al DESACTIVAR** (`true -> false`):
> "Auto-sync desactivado. Ultima ejecucion: HH:MM. La CF no correra hasta que lo reactives."

La hora se calcula truncando `new Date()` a HH:00 — la CF siempre corre en punto, asi que
`now.setMinutes(0,0,0)` da la hora exacta de la ultima ejecucion sin necesidad de fetch.

**Persistencia:** `localStorage` key `pwe-autosync-msg`. El mensaje sobrevive recargas y se
sobreescribe en cada toggle. Se carga via lazy initializer de `useState` — sin useEffect adicional.

---

## Decision de arquitectura — persistencia local

El mensaje es UI feedback, no dato de negocio. `localStorage` es la solucion correcta:
- Sin fetch a Firestore
- Sin IndexedDB (overkill para un string)
- Sobrevive recargas, se borra solo si el usuario limpia storage del browser

---

## Cambios de Codigo

| Archivo | Cambio |
|---------|--------|
| `src/components/TestingTools/TestingTools.tsx` | Constante `AUTOSYNC_MSG_KEY`, lazy init de `toggleMessage` desde localStorage, `handleToggleAutoSync` calcula y persiste el mensaje, render debajo del checkbox |

Sin cambios en: `settingsService.ts`, `App.tsx`, `useFirestoreSync.ts`, CF.

---

## Criterios de Aceptacion

- [x] Toggle `false -> true`: aparece mensaje verde con proxima hora de ejecucion (HH:00 local)
- [x] Toggle `true -> false`: aparece mensaje azul con hora de ultima ejecucion (HH:00 truncado)
- [x] Mensaje persiste al recargar la pagina (localStorage)
- [x] Nuevo toggle sobreescribe el mensaje anterior
- [x] Durante `isSyncSaving`, checkbox deshabilitado (sin cambio)
- [ ] Sin errores TS en build — pendiente verificacion

---

## Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/TestingTools/TestingTools.tsx` | Nuevo estado `toggleMessage` + logica en `handleToggleAutoSync` + render |

---

**Creado:** 2026-06-14
**Tipo:** Feature — UX / feedback visual
**Relacionada con:** US-1106 (base), D-029 (auto-sync toggle)
