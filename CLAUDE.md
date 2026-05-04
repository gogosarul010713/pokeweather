# CLAUDE.md - Pokemon Weather Explorer

> Memoria entre sesiones gestionada por **claude-mem** (automatico).
> Este archivo cubre solo reglas fijas del proyecto.

---

## Proyecto

Dashboard web interactivo: clima de ciudades del mundo -> tipos Pokemon potenciados (sistema Pokemon GO).

**Stack:** React 18 + Vite 5 + Leaflet + Zustand 4 + AccuWeather API + idb-keyval + s2-geometry
**Dev server:** port 5173
**Variables de entorno:** `VITE_ACCUWEATHER_KEY` (requerida)

**Documentacion:**
- [src/docs/ROADMAP.md](src/docs/ROADMAP.md) - Vision Sprints 8-12
- [src/docs/INDEX.md](src/docs/INDEX.md) - Indice completo
- [src/docs/architecture/11-decision-log.md](src/docs/architecture/11-decision-log.md) - Decisiones permanentes

---

## Reglas criticas

1. **Cero colores hardcodeados** - todo via `var(--x)` del design system
2. **Dataset dinamico** - nunca asumir numero fijo de ciudades
3. **Imagenes de clima** - siempre via `WEATHER_IMAGES[condition]` de `src/config/weatherImages.js`
4. **Cache** - verificar IndexedDB antes de llamar a AccuWeather
5. **Loading progresivo** - `LoadingScreen` ciudad por ciudad, obligatorio en carga inicial
6. **API** - AccuWeather pronostico horario. NO OpenWeatherMap. NO clima actual
7. **`lng` -> `lon`** - el JSON usa `lng`, el tipo `City` usa `lon`
8. **`region` en minusculas** - `'asia'`, `'europa'`, `'america'`, `'oceania'`, `'africa'`
9. **Un `<style>` por componente** - con prefijo de clase obligatorio
10. **WINDY** - reemplaza sunny/partly/cloudy pero NUNCA rain/snow/fog
11. **Archivos `.md`** - confirmar con el usuario antes de crear: que archivo, donde y por que

---

## Reglas de ejecucion

- **Git:** nunca `git push` ni `git merge` sin confirmacion explicita
- **Contexto:** no leas directorios completos si solo necesitas un archivo
- **Implementacion:** nunca implementes sin confirmacion explicita. Cada fase termina con checkpoint

---

## Override global

- Memoria entre sesiones: usar claude-mem (automatico). 

---

## Skills disponibles

| Cuando | Skill |
|--------|-------|
| Iniciar una US nueva | `us-start` |
| Analizar una US | `us-analyze` |
| Validar una US completada | `us-validate` |

---

## Estado Sprint 10 — COMPLETADO v2.1.0 (2026-05-04)

**Branch activa:** `sprint-10` | Tag: `v2.1.0` (stable) | Ultimo commit: `d381f9c`

### Sprint 10 — COMPLETADO 100%

✅ **17 US + 4 Features + 5 Bugs = 26 items, 44 SP entregados**
✅ **Documentación:** 51 archivos auditados, 100% sync código
✅ **Build:** v2.1.0 estable, 243.73 KB gzip, 0 TS errors
✅ **Linter:** 79 → 53 problemas (26 errores menos, tipos TS corregidos)
✅ **Deuda técnica:** 10 items identificados, categorizados, certificados

**Commits últimos:**
- `d381f9c` chore: bump version to v2.1.0 (stable release)
- `7e3f77e` refactor: fix typescript build errors
- `93a1cfd` refactor: fix linter errors
- `b38308c` docs(sprint-10): auditoría deuda técnica

### Pendiente Sprint 11 — Plan Ejecutable

📄 **Ver certificación completa:** `sprints/sprint-10/DEUDA-TECNICA-AUDITORIA.md`

**CRÍTICO (1.5 h):**
1. `firebase deploy --only functions` — CF schema raw OK, lista deploy ✅
2. Validar Firestore recibe icon_code (no condition) en docs nuevos
3. Test useFirestoreSync real-time en preview (Opcion A OK) ✅

**SEGURIDAD (2 h):**
4. Implementar `firestore.rules` — App Check o origin validation 🔴 CRÍTICO
5. Remover `VITE_ACCUWEATHER_KEY` de Vercel Dashboard

**TECH DEBT (2.5 h):**
6. Test unitario: `accuLocationKey = ''` regression
7. Eliminar `calculated_condition` de ForecastDoc tipo

### 🐛 BUG DETECTADO EN PREVIEW (2026-05-04)

**Componente afectado:** `PredictionAnalysisTable`
**Síntoma:** Al eliminar datos (Cleanup → TODO IndexedDB), tabla NO se actualiza
**Localización:** `src/components/Analytics/PredictionAnalysisTable.tsx` + `src/services/cleanup/cleanupService.ts`
**Root cause:** Cache se elimina pero tabla no refetch ni limpian state local
**Acción:** Crear BUG-008 en Sprint 11 (requiere re-fetch tras cleanup)

**Reproducir:**
1. Cargar app (tabla muestra datos)
2. Testing Tools → Cleanup → "TODO IndexedDB" → confirmar
3. Tabla sigue mostrando datos stale (debería vaciar)

### Arquitectura D-039 (clave)
- CF (`syncWeatherLogic.ts`) guarda raw: `icon_code`, `gust_kmh`, sin clasificacion
- `getWeatherFromFirestore()` clasifica con `resolveCondition(icon_code, wind_kmh, gust_kmh)`
- `weatherService.ts:resolveCondition` es el UNICO lugar de clasificacion
- Dev (localhost): frontend llama AccuWeather via proxy Vite con `VITE_ACCUWEATHER_KEY`
- Prod/preview: solo Firestore, `VITE_ACCUWEATHER_KEY` NO debe existir en Vercel

### Variables de entorno criticas
- `.env.local` (dev): `VITE_ACCUWEATHER_KEY` + todas `VITE_FIREBASE_*`
- Vercel (prod): solo `VITE_FIREBASE_*` — SIN `VITE_ACCUWEATHER_KEY`
- `functions/.env` (CF): `ACCUWEATHER_KEY` + `CLEANUP_SECRET`