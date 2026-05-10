# US-1114: TestingTools visible en Preview y Produccion

**Sprint:** 11
**Story Points:** 1 SP
**Prioridad:** Alta
**Estado:** Ready for Implementation
**Rama:** `sprint-11`

---

## Descripcion

Hacer visible el panel TestingTools en entornos Vercel (preview y produccion) mediante
una variable de entorno `VITE_ENABLE_TESTING_TOOLS=true`. En localhost sigue apareciendo
via `import.meta.env.DEV`. En produccion estable (main) bastara con no setear la variable.

Contexto: BL-011 aislo los proyectos Firebase por entorno. Ahora es seguro tener
TestingTools en preview/prod porque cada entorno escribe a su propio Firestore y no
hay contaminacion cruzada de datos.

---

## Contexto Tecnico

### Arquitectura de entornos (post BL-011)

| Entorno | Firebase Project | AccuWeather | CF sync | TestingTools |
|---------|------------------|-------------|---------|--------------|
| localhost (`npm run dev`) | `weather-app-dev-f28ce` | activa | no (escribe directo) | via `import.meta.env.DEV` |
| Vercel preview/prod | `weather-app-prod-ef50d` | ausente | si (CF cron) | via `VITE_ENABLE_TESTING_TOOLS` |
| Vercel main (futuro estable) | `weather-app-prod-ef50d` | ausente | si | oculto (var ausente) |

### Gate actual (BUG-020 Fix C1)

```tsx
// Header.tsx — estado actual
{import.meta.env.DEV && <TestingButton />}
{import.meta.env.DEV && <TestingTools />}
```

`import.meta.env.DEV` es `true` solo en `npm run dev`. En cualquier build de Vercel
(preview o prod) es `false`, por lo que TestingTools queda oculto.

### Por que no usar solo `!import.meta.env.PROD`

`import.meta.env.PROD` es `true` en todos los builds de Vercel (preview Y main).
No distingue entre ambos entornos. La variable `VITE_ENABLE_TESTING_TOOLS` da control
granular: se setea en Vercel para preview/prod activo, se omite cuando se quiera ocultar.

---

## Objetivo

Cambiar el gate en `Header.tsx` para evaluar:

```
DEV  OR  VITE_ENABLE_TESTING_TOOLS === 'true'
```

Y agregar `VITE_ENABLE_TESTING_TOOLS=true` en Vercel Dashboard (tarea manual del usuario).

---

## Cambios de Codigo

### `src/components/Header/Header.tsx`

Unica modificacion: reemplazar el gate `import.meta.env.DEV` por la expresion combinada.

```tsx
// ANTES
{import.meta.env.DEV && <TestingButton />}
// ...
{import.meta.env.DEV && <TestingTools />}

// DESPUES
{(import.meta.env.DEV || import.meta.env.VITE_ENABLE_TESTING_TOOLS === 'true') && <TestingButton />}
// ...
{(import.meta.env.DEV || import.meta.env.VITE_ENABLE_TESTING_TOOLS === 'true') && <TestingTools />}
```

### `.env.local.example`

Agregar comentario documentando la variable (valor ausente por defecto en localhost):

```
# Testing Tools en Vercel preview/prod (no necesario en localhost — usa import.meta.env.DEV)
# VITE_ENABLE_TESTING_TOOLS=true
```

Sin cambios en: `TestingTools.tsx`, `firebaseConfig.ts`, CF, ni ningún otro archivo.

---

## Tarea Manual del Usuario (Vercel Dashboard)

1. Vercel Dashboard → proyecto pokeweather → Settings → Environment Variables
2. Agregar: `VITE_ENABLE_TESTING_TOOLS` = `true`
3. Scope: Preview + Production (NO marcar Production si se quiere ocultar en main)
4. Redeploy del branch activo para que tome efecto

---

## Criterios de Aceptacion

- [ ] `npm run dev` → TestingTools visible (comportamiento sin cambio)
- [ ] Build Vercel con `VITE_ENABLE_TESTING_TOOLS=true` → TestingTools visible en preview
- [ ] Build Vercel sin `VITE_ENABLE_TESTING_TOOLS` → TestingTools oculto
- [ ] `npm run build` sin errores TS nuevos
- [ ] TestingTools "Sincronizar ahora" en preview → llama CF `weather-app-prod-ef50d` correctamente

---

## Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/Header/Header.tsx` | Gate `import.meta.env.DEV` → expresion combinada (2 lineas) |
| `.env.local.example` | Comentario documentando `VITE_ENABLE_TESTING_TOOLS` |

---

## Dependencias

- **BL-011** (completado 2026-05-09): Dual Firebase Projects — prerequisito. Sin el aislamiento
  de proyectos Firebase, habilitar TestingTools en preview contaminaria Firestore prod.
- **BUG-020 Fix C1**: introdujo el gate `import.meta.env.DEV`. Esta US lo extiende, no lo revierte.

---

## Decision Arquitectonica

Ver `src/docs/architecture/11-decision-log.md` — D-040.

---

## Definition of Done

- [ ] `npm run build` sin errores ni warnings nuevos
- [ ] Gate funciona en los 3 escenarios: DEV local, Vercel con var, Vercel sin var
- [ ] `.env.local.example` actualizado
- [ ] Commit en `sprint-11` (sin push)

---

**Creado:** 2026-05-10
**Tipo:** Feature — visibilidad por entorno
**Relacionada con:** BL-011, BUG-020 (Fix C1), D-040
