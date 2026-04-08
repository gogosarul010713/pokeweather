# Changelog — Pokémon Weather Explorer

Todas las versiones y cambios notables serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/).

---

## [1.0.0] — 2026-04-08 (STABLE)

### 🎉 Release Stable Inicial

**Status:** Production-ready  
**Build:** ✅ PASSED  
**Tests:** ✅ PASSED (95+ tests)

#### ✨ Features Completas (Sprint 1-7)
- **Sprint 1-3:** Core climate data, Pokémon type mapping, AccuWeather integration
- **Sprint 4:** Weather classification algorithm (Doc 20)
- **Sprint 5:** Quality scoring, badges, tile system + dark mode
- **Sprint 6:** Auto-refresh, weather history snapshots, S2 geohashing
- **Sprint 7:** Filters + sorting (region, condition, types), responsive design

#### ✅ Características Principales
- 94 ciudades en mapa interactivo (Leaflet)
- Clima clasificado a tipos Pokémon GO
- Filtros dinámicos (región, clima, tipos)
- Ordenamiento (nombre, densidad, rating, hora local)
- Responsive: desktop, tablet, mobile
- Dark mode + light mode
- Bottom Sheet mobile (US-706)
- Firebase + Firestore inicializado (US-804)

#### 📊 Métricas
- Load time: ~3.5s (94 ciudades, 5 paralelo)
- Cache hit rate: ~85% (IndexedDB)
- Memory: ~45 MB
- API calls/hora: 94 (1 por ciudad)
- Firestore free tier: 11% reads, 3% storage

#### 📚 Documentación
- 53 archivos .md
- Architecture decisions documented
- Weather classification algorithm documented
- Git workflow + CI/CD documented

#### 🔧 Stack
- React 18 + Vite 5
- TypeScript
- Zustand (state management)
- Leaflet + react-leaflet (maps)
- AccuWeather API (forecast)
- Firebase Firestore (backend — US-804)
- idb-keyval (IndexedDB wrapper)
- s2-geometry (geohashing)

#### 🏷️ Git
- Commits: 54bd09f ... (desde inception)
- Branches: sprint-5, sprint-6, sprint-7, sprint-8
- Tag: v1.0.0-stable

#### ⚠️ Known Limitations
- Cache still in IndexedDB (migration planned v2.0.0)
- No nidos system yet
- No PVP calculations
- No cooldown calculations
- Documentation has legacy comments (cleanup planned v2.0.0)

---

## [2.0.0-beta] — TBD (IN DEVELOPMENT)

### 🔄 Major Refactoring

**Status:** In progress (refactor/firebase-v2 branch)  
**Estimated:** Sprint 8-13 (6 sprints)

#### 🚀 Planned Features
- **US-801:** Persistir pronóstico en Firestore (async/background)
- **US-802:** Catálogo estático (weather_catalog collection)
- **US-803:** Dashboard Firestore (analytics + queries)
- **US-805:** Reportes de clasificación clima

#### 📦 Major Changes
- ♻️ Cache migration: IndexedDB → Firestore (gradual)
- 📚 Documentation refactor: Clean legacy comments
- 🏘️ Nidos system (locations + cooldown calculation)
- 🥊 PVP calculations (CP, IV, matchups)

#### 🎯 Goals
- Improve precision: 95%+ vs Pokémon GO official
- Reduce API calls via smarter caching
- Add community features (nidos, PVP)
- Clean, maintainable codebase

#### 📋 Sub-branches
- `refactor/firebase-v2` — Cache migration + docs cleanup
- `feature/nidos` — Nidos system
- `feature/pvp` — PVP system
- `release/v2.0.0` — Final release testing

---

## [Unreleased]

### Upcoming Sprints
- Sprint 8 (current): Firebase weather persistence
- Sprint 9-10: Nidos system
- Sprint 11: PVP system
- Sprint 12: Testing + validation
- Sprint 13: Release v2.0.0

---

## Git References

- **v1.0.0-stable** — Current production release
- **sprint-8** — Active development branch
- **main** — Stable releases (currently v1.0.0)
- **develop** — Staging area

## How to Compare Versions

```bash
# Compare v1.0.0 vs v2.0.0
git diff v1.0.0-stable refactor/firebase-v2 --stat

# View changelog from v1.0.0
git log v1.0.0-stable.. --oneline

# Checkout v1.0.0 if needed
git checkout v1.0.0-stable
```

---

**Last updated:** 2026-04-08  
**Maintained by:** Team Pokémon Weather Explorer
