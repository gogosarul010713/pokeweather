# 🏗️ Estrategia Arquitectónica — Decisión de Versiones y Refactorización

**Contexto:** Sprint 8 — Punto de bifurcación hacia refactorización mayor  
**Autor:** Análisis SR (Arquitecto + Analista + Desarrollador)  
**Fecha:** 2026-04-08  
**Decisión crítica:** ¿Rama vs v2? ¿Cómo validar sin perder funcionalidad?

---

## 📊 Estado Actual del Proyecto

### Git Structure
```
main (origin)
  ├─ 107 commits atrás
  └─ No sincronizado con trabajo actual

develop (origin)
  ├─ 4 commits atrás de sprint-8
  └─ Parece ser staging/testing

sprint-8 (HEAD - actual)
  ├─ 54bd09f (US-804 completado)
  ├─ Firebase inicializado
  ├─ Bottom Sheet mobile ✅
  └─ 57+ US completadas (Sprint 1-7)

Tags: 1 solamente (v-sort-direction-complete)
  └─ Sin versionado semántico

package.json: version: "0.0.0"
  └─ Sin versionado semántico implementado
```

### Documentación
```
53 archivos .md en src/docs/
├─ 01-project.md (arquitectura base)
├─ 02-design.md (sistema de diseño)
├─ 20-weather-classification-algorithm.md (core)
├─ 21-refactor-weather-algorithm.md (análisis)
├─ Features por sprint (Sprint 5, 6, 7, 8)
├─ Análisis técnicos (caching, S2, debugging)
└─ Comentarios, TODOs, versiones antiguas (DEUDA)
```

---

## 🎯 3 Opciones Arquitectónicas

### OPCIÓN A: Feature Branch (Recomendada si refactorización es <2 sprints)

**Estructura:**
```
main (stable — v1.0.0)
  ├─ tag: v1.0.0-stable (current sprint-8)
  └─ tag: v1.1.0-release (próximo release)

develop (staging)
  └─ PR checks automáticos

refactor/firebase-v2 (rama feature — LA NUEVA)
  ├─ Cambios de cache a Firebase
  ├─ Limpieza de docs
  ├─ Nuevas features (nidos, cooldown, PVP)
  └─ Tests comparativos vs v1
  
feature/nidos (sub-rama de refactor/firebase-v2)
  ├─ Nidos específicos
  └─ Calculo cooldown

feature/pvp (sub-rama de refactor/firebase-v2)
  ├─ Cálculos PVP
  └─ Recomendaciones
```

**Ventajas:**
- ✅ Fácil revertar (`git reset`)
- ✅ CI/CD puede comparar branch vs main automáticamente
- ✅ Tests en paralelo
- ✅ PR integrado con código review

**Desventajas:**
- ❌ Si refactorización > 3 meses: merge conflicts masivos
- ❌ main se queda atrás (deuda técnica crece en main)
- ❌ Equipo sigue en main → cambios frecuentes en main

**Duración recomendada:** 1-3 sprints

---

### OPCIÓN B: Semantic Versioning + Release Branches (Recomendada si refactorización es >3 sprints)

**Estructura:**
```
main (stable)
  ├─ tag: v1.0.0 (stash actual = sprint-8)
  ├─ tag: v1.1.0 (bug fixes a v1.0)
  └─ tag: v1.2.0 (más bug fixes a v1.0)

develop (staging)
  ├─ Todos los sprints van aquí
  └─ Tests antes de release

release/v2.0.0 (rama de release — LA NUEVA)
  ├─ Merge de: refactor/firebase-v2
  ├─ Merge de: feature/nidos
  ├─ Merge de: feature/pvp
  ├─ Tests de integración completos
  ├─ Documentación final
  └─ Validación de "no regresiones"

hotfix/v1.0.1 (rama hotfix)
  └─ Si descubrimos bug CRÍTICO en v1.0
     (merge a main + develop)
```

**Ventajas:**
- ✅ Versionado claro y auditable
- ✅ Fácil rollback en producción
- ✅ Changelog automático
- ✅ SemVer = comunicación clara (v1 = stable, v2 = new features)
- ✅ Múltiples versiones en paralelo

**Desventajas:**
- ❌ Más overhead de proceso
- ❌ Requiere pipeline CI/CD robusto
- ❌ Merge conflicts siguen siendo problema

**Duración recomendada:** >3 sprints

---

### OPCIÓN C: Monorepo con Versioning (Advanced — si tienes múltiples equipos)

**Estructura:**
```
root/
├─ packages/
│  ├─ pokeweather-v1/
│  │  ├─ package.json (version: 1.0.0)
│  │  └─ src/
│  │
│  └─ pokeweather-v2/
│     ├─ package.json (version: 2.0.0)
│     └─ src/
│
├─ docs/
│  ├─ v1/ (docs stable)
│  └─ v2/ (docs development)
│
└─ tests/
   ├─ v1-vs-v2/ (tests comparativos)
   └─ regression/ (detección de regresiones)
```

**Ventajas:**
- ✅ 2 versiones en paralelo, sin git merge
- ✅ Fácil comparación (mismo código base vs refactorizado)
- ✅ Usuarios pueden elegir versión

**Desventajas:**
- ❌ Duplicación de código (mantenimiento 2x)
- ❌ Overkill para un proyecto < 200k LOC
- ❌ Requiere tooling avanzado

**Recomendación:** NO para este proyecto (aún)

---

## 🎓 MI RECOMENDACIÓN (como SR)

### Estado Actual: ✅ **OPCIÓN B** (Semantic Versioning)

**Por qué:**

1. **Refactorización es GRANDE**
   - Cache a Firebase (impacto en 5+ servicios)
   - Documentación (53 archivos)
   - 3+ features nuevas (nidos, cooldown, PVP)
   - Estimado: 4-6 sprints mínimo

2. **Necesitas auditoría de cambios**
   - "¿Qué cambió entre v1 y v2?" → tag + changelog
   - "¿Puedo revertir a v1?" → git checkout v1.0.0
   - "¿Qué perdimos?" → changelog + metrics

3. **Equipo necesita estabilidad**
   - v1.0.0 = base confiable (57+ US testeadas)
   - v2.0.0 = experimental (nuevas features)
   - Hotfixes a v1 = independientes de v2

4. **Comparación de versiones es crítica**
   - Precisión de clima v1 vs v2
   - Regresiones automáticas (test suite)
   - A/B testing posible (mostrar ambas versiones)

---

## 🚀 PLAN RECOMENDADO (Paso-a-Paso)

### FASE 0: Hoy (Prep — 1-2 días)

**1. Crear tag v1.0.0-stable**
```bash
git tag -a v1.0.0-stable -m "Stable: 57 US, Firebase setup, Bottom Sheet mobile"
git push origin v1.0.0-stable
```

**2. Actualizar package.json**
```json
{
  "name": "pokeweather",
  "version": "1.0.0",
  "description": "Pokémon Weather Explorer v1 — Stable",
  "...": "..."
}
```

**3. Crear CHANGELOG.md** (raíz del proyecto)
```markdown
# Changelog — Pokémon Weather Explorer

## [1.0.0] — 2026-04-08 (STABLE)
- 57 US completadas (Sprints 1-7)
- Firebase + Firestore inicializado (US-804)
- Bottom Sheet mobile (US-706)
- Filtros + Ordenamiento (Sprint 7)
- Responsive design (Sprints 6-7)

## [2.0.0-beta] — TBD (IN DEVELOPMENT)
- [refactor/firebase-v2] Cache migrando a Firebase
- [feature/nidos] Nidos + cooldown
- [feature/pvp] Cálculos PVP
```

**4. Crear rama refactor/firebase-v2**
```bash
git checkout -b refactor/firebase-v2
```

---

### FASE 1: Refactorización Cache (Sprint 8-9)

**Branch:** `refactor/firebase-v2`

**Cambios:**
1. Migrar cache IndexedDB → Firestore (gradual)
2. Deprecate `cacheService.ts` → `firebaseWeatherService.ts`
3. Benchmarks: IndexedDB vs Firestore (latencia, espacio)
4. Tests comparativos

**Commits semánticos:**
```
refactor(cache): Migrate IndexedDB → Firestore
refactor(cacheService): Deprecate local cache logic
perf(firebaseService): Add cache benchmarks
test(firebase): Add regression tests vs IndexedDB
```

**Validación:**
- [ ] No hay regresión en tiempo de carga
- [ ] No hay regresión en precisión de clima
- [ ] Firebase reads/writes dentro de free tier

---

### FASE 2: Documentación Final (Sprint 9)

**Branch:** `refactor/firebase-v2` (misma rama)

**Cambios:**
1. Limpiar 53 .md (remover comentarios, versiones viejas)
2. Actualizar links internos (refactor/ paths)
3. Crear docs/ versioning (v1/ vs v2/)
4. ARCHITECTURE.md final

**Commits:**
```
docs(refactor): Clean up 53 MD files — remove legacy comments
docs(architecture): Final v2 architecture document
docs(changelog): Complete changelog v1.0.0 → v2.0.0-beta
```

---

### FASE 3: Nuevas Features (Sprint 10-11)

**Branches separadas:**
- `feature/nidos` (basada en refactor/firebase-v2)
- `feature/pvp` (basada en refactor/firebase-v2)
- `feature/cooldown` (basada en refactor/firebase-v2)

**Pattern:**
```bash
git checkout refactor/firebase-v2
git checkout -b feature/nidos

# Hacer cambios, commits

# Luego: PR a refactor/firebase-v2 (no a main/develop)
```

---

### FASE 4: Testing Comparativo (Sprint 12)

**Branch:** `release/v2.0.0` (nueva rama de release)

```bash
# Merge todas las ramas feature
git checkout -b release/v2.0.0
git merge refactor/firebase-v2
git merge feature/nidos
git merge feature/pvp
```

**Tests:**
1. E2E suite (Playwright) — validar sin regresiones
2. Performance benchmarks (v1 vs v2)
3. Precisión clima (comparar iconos AccuWeather clasificación)
4. Manual testing (UI/UX)

**Métricas a comparar:**
```
v1.0.0 Metrics:
├─ Load time: ~3.5s (94 ciudades)
├─ Cache hit rate: 85%
├─ Memory: ~45 MB
├─ Precision clima: X%
└─ API calls/hora: 94

v2.0.0-beta Metrics:
├─ Load time: ? (esperado: <3s)
├─ Cache hit rate: ? (esperado: >90%)
├─ Memory: ? (esperado: <50 MB)
├─ Precision clima: ? (esperado: >95%)
└─ API calls/hora: 94 (igual)
```

---

### FASE 5: Release (Sprint 13)

**Merge a main:**
```bash
git checkout main
git merge release/v2.0.0
git tag -a v2.0.0 -m "Release: Firebase migration, nidos, PVP, cooldown"
git push origin main v2.0.0
```

**Update package.json:**
```json
{
  "version": "2.0.0"
}
```

**Update CHANGELOG.md:**
```markdown
## [2.0.0] — 2026-05-XX (STABLE)
- ✨ Nidos + cooldown calculation
- ✨ PVP recommendations
- ♻️ Cache migrated to Firebase
- 📚 Documentation refactored (clean, no legacy)
```

---

## 🔍 Cómo Comparar Versiones (Métricas)

### 1. Precisión de Clima

```typescript
// Script de testing
function compareClassification(iconCode: number, windKmh: number) {
  const v1_condition = classifyWeather_v1(iconCode, windKmh)
  const v2_condition = classifyWeather_v2(iconCode, windKmh)
  
  return {
    iconCode,
    windKmh,
    v1: v1_condition,
    v2: v2_condition,
    match: v1_condition === v2_condition ? '✅' : '❌'
  }
}

// Ejecutar contra 1000+ casos de test
// Reportar diferencias
```

**Métricas:**
- Porcentaje de coincidencia (v1 vs v2)
- Iconos problemáticos (si los hay)
- Casos edge (viento > 29 km/h, FOG + viento, etc)

---

### 2. Performance

```bash
# v1.0.0
npm run build
npm run preview
# Chrome DevTools: Lighthouse → Load time, Memory, FCP, LCP

# v2.0.0
git checkout release/v2.0.0
npm run build
npm run preview
# Chrome DevTools: mismas métricas

# Comparar:
# v1 Load: 3.5s vs v2 Load: 2.8s → 20% mejora ✅
```

---

### 3. Regresiones (Test Suite)

```bash
# Test suite debe pasar en AMBAS versiones
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run test:coverage

# Resultado esperado:
# v1.0.0: 95 tests PASSED ✅
# v2.0.0: 95 tests PASSED ✅
# (No hay nuevos failures)
```

---

### 4. Git Diff Estadísticas

```bash
# Comparar ramas
git diff v1.0.0 release/v2.0.0 --stat

# Ejemplo output:
#  src/services/cache/cacheService.ts          | -250 (removed - deprecate)
#  src/services/firebase/firebaseWeatherService.ts | +300 (new)
#  src/docs/ (53 files) | -1500 (legacy comments removed)
#  src/features/nidos/... | +2000 (new feature)
#  src/features/pvp/... | +2500 (new feature)
```

---

### 5. Firestore Metrics

```typescript
// Durante v2.0.0 testing:
// Monitorear en Firebase Console:
//
// Writes/day: 2,256 (in free tier ✅)
// Reads/day: < 10,000 (in free tier ✅)
// Storage: < 100 MB (in free tier ✅)
// Latency: < 200ms (acceptable ✅)
//
// Si alguno sale de límites → refactorizar query patterns
```

---

## ❌ Cómo Detectar Regresiones

### Checklist de No-Regresiones

```
UI/UX:
□ Mapa carga (Leaflet)
□ Pins visibles con colores correctos
□ Popup abre al hacer click en pin
□ Sidebar abre (list/detail)
□ Filtros funcionan (region, condition, types)
□ Ordenamiento funciona (asc/desc)
□ Dark mode funciona
□ Bottom Sheet mobile visible (z-index 1001)
□ Responsive: mobile/tablet/desktop

Data:
□ 94 ciudades cargadas
□ Clima clasificado correctamente (v1 vs v2 match)
□ Tipos Pokémon correctos (e.g., "partly" → ["normal", "rock"])
□ Temperatura mostrada en Celsius
□ Hora local correcta (timezone offset)
□ Badges (gyms, stops, community) visibles

API:
□ AccuWeather API llamado 1x/hora
□ Cache hit rate > 80%
□ No hay 5xx errors
□ Rate limit respetado

Firestore (v2 only):
□ Documentos guardados en /city_weather
□ TTL correcto (7 días)
□ Snapshots[12] llenos
□ No hay duplicados
```

---

## 📋 Tabla Decisión: Opción A vs B vs C

| Criterio | Opción A (Branch) | Opción B (SemVer) | Opción C (Monorepo) |
|----------|-------------------|------------------|-------------------|
| Duración refactorización | 1-3 sprints ✅ | >3 sprints ✅ | N/A |
| Complejidad setup | Baja ✅ | Media 🟡 | Alta ❌ |
| Facilidad revertar | Muy fácil ✅ | Fácil ✅ | Media 🟡 |
| Auditoría cambios | Media 🟡 | Excelente ✅ | Excelente ✅ |
| Comparación v1 vs v2 | Difícil ❌ | Fácil ✅ | Muy fácil ✅ |
| Validación regresiones | Manual 🟡 | Automática ✅ | Automática ✅ |
| Hotfixes a v1 | Difícil ❌ | Fácil ✅ | Muy fácil ✅ |
| CI/CD required | No ✅ | Sí 🟡 | Sí 🟡 |
| **Recomendación** | Si < 3m | **✅ ELEGIR** | Si 2+ equipos |

---

## ✅ PLAN FINAL (Recomendado)

### Hoy:
```bash
# 1. Tag v1.0.0-stable
git tag -a v1.0.0-stable -m "Stable release: 57 US, Sprint 1-7 complete"

# 2. Update package.json version
"version": "1.0.0"

# 3. Create branch
git checkout -b refactor/firebase-v2

# 4. Update CLAUDE.md
# Documentar que estamos en refactorización v2.0.0
```

### Sprints 8-9:
- Refactorización cache (Firebase migration)
- Limpieza de documentación
- Tests comparativos

### Sprint 10-12:
- Feature branches: nidos, PVP, cooldown
- Testing integración
- Métricas vs v1

### Sprint 13:
- Release v2.0.0
- Merge a main
- Tag + CHANGELOG

---

## 🎯 Ventajas de Este Plan

✅ **Estabilidad garantizada:** v1.0.0 queda intacta en main  
✅ **Auditoría clara:** Commit history + tags = rastreable  
✅ **Comparación fácil:** `git diff v1.0.0 v2.0.0`  
✅ **Rollback simple:** `git checkout v1.0.0` si necesario  
✅ **Hotfixes posibles:** Bug en v1 = rama `hotfix/v1.0.1`  
✅ **Documentación versionada:** docs/v1/ vs docs/v2/  
✅ **Métricas claras:** Precisión, performance, regresiones  
✅ **Comunicación clara:** "Estamos en v2.0.0-beta" (no ambigüedad)

---

## ⚠️ Riesgos Si No Seguimos Este Plan

❌ **Sin tags:** "¿Cuál fue la version antes de refactorizar?" (no sabrás)  
❌ **Sin branch:** main se contamina → cambios principales + refactor juntos  
❌ **Sin versionado:** "¿Regresar a qué commit?" (confusión)  
❌ **Sin documentación:** 53 archivos .md siguen con comentarios legacy  
❌ **Sin métricas:** "¿Mejoró?" (no sabrás si precisión subió o bajó)  
❌ **Sin rollback:** Si v2 tiene problemas → dolor de revertir

---

**Siguiente paso:** ¿Confirmamos este plan? ¿Cambios?

Una vez confirmado → empezamos con FASE 0 (crear tag + branch).

