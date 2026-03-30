# 08-GIT-WORKFLOW — Estrategia de Versionado y Control de Cambios
# Flujo Git, ramas, commits, deshacer cambios, versionado semántico

---

## MODELO DE RAMAS (Git Flow Adaptado)

```
main (producción, siempre estable)
  ↑
  └── develop (integración de sprints)
        ↑
        └── sprint-5 (rama de sprint actual)
              ↑
              ├── feature/us-501-mappin
              ├── feature/us-502-citytooltip
              └── feature/us-503-flyto
```

### Ramas Principales

| Rama | Propósito | Quién puede mergear |
|------|-----------|-------------------|
| `main` | Producción, releases | Solo desde develop (merge responsable) |
| `develop` | Integración de sprints completados | Sprint lead después de QA |
| `sprint-N` | Rama de trabajo del sprint actual | Solo este sprint |
| `feature/*` | Rama de una US específica | Al sprint-N cuando termina US |

---

## FLUJO DE TRABAJO POR SPRINT

### 1️⃣ INICIO DEL SPRINT

```bash
# 1. Actualizar develop desde remoto
git checkout develop
git pull origin develop

# 2. Crear rama del sprint desde develop
git checkout -b sprint-5
git push -u origin sprint-5

# Verificar que estás en sprint-5
git branch -v
```

### 2️⃣ TRABAJAR EN UNA US

```bash
# 1. Crear rama feature desde sprint-5
git checkout sprint-5
git checkout -b feature/us-501-mappin
git push -u origin feature/us-501-mappin

# 2. Trabajar normalmente (commits pequeños y descriptivos)
git add src/components/Map/MapPin.tsx
git commit -m "feat(map): implementar MapPin con badges"

# 3. Push regular (mantén sincronizado)
git push origin feature/us-501-mappin

# 4. Repetir paso 2-3 hasta terminar la US
```

### 3️⃣ TERMINAR UNA US (Merge a sprint-N)

```bash
# 1. Push final
git push origin feature/us-501-mappin

# 2. Verificar que compila
npm run build  # Debe estar sin errores

# 3. Merge a sprint-5
git checkout sprint-5
git pull origin sprint-5
git merge feature/us-501-mappin
git push origin sprint-5

# 4. Eliminar rama feature (local + remoto)
git push origin --delete feature/us-501-mappin
git branch -d feature/us-501-mappin

# 5. Verificar que sprint-5 sigue compilando
npm run build
```

### 4️⃣ TERMINAR EL SPRINT (Todas las US hechas)

```bash
# 1. Última verificación en sprint-5
git checkout sprint-5
git pull origin sprint-5
npm run build

# 2. Merge a develop
git checkout develop
git pull origin develop
git merge sprint-5
git push origin develop

# 3. Merge a main (producción)
git checkout main
git pull origin main
git merge develop
git push origin main

# 4. Crear tag de versión
git tag -a v2.3.0 -m "Sprint 5: Badges, filtros, auto-scroll, z-index fix"
git push origin v2.3.0

# 5. Eliminar rama sprint-5 (opcional, después de probar en main)
git push origin --delete sprint-5
git branch -d sprint-5
```

---

## CONVENCIÓN DE COMMITS

### Formato

```
<type>(<scope>): <subject>

<body (opcional)>

<footer (opcional)>
```

### Tipos

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva feature (US completa) | `feat(map): implementar MapPin` |
| `fix` | Bug fix | `fix(header): z-index dropdown visible` |
| `refactor` | Cambio sin cambiar funcionalidad | `refactor(store): optimizar selector` |
| `style` | CSS, visual, sin lógica | `style(legend): tabs en MapLegend` |
| `docs` | Documentación | `docs: agregar guía de testing` |
| `test` | Tests, QA | `test(map): validar filtro de badges` |
| `perf` | Performance | `perf(map): memoizar badgesByCity` |
| `chore` | Setup, deps, tooling | `chore: upgrade vite a v5.1` |

### Scope (el componente afectado)

- `map` — MapView, MapPin, MapLegend, etc.
- `header` — Header, FilterPanel, SearchInput
- `sidebar` — Sidebar, LocationFeed, LocationCard, LocationDetail
- `store` — useStore, estado global
- `data` — weatherService, cacheService, useWeather
- `ui` — CustomSelect, LoadingScreen, SyncBadge

### Ejemplos Reales

```bash
git commit -m "feat(map): implementar MapPin con badges

- Agregado soporte para 4 categorías (stops, gyms, community, best)
- Renderizado condicional según showBadgesOnPins
- Fixes z-index para visibility sobre mapa

Closes #15"

git commit -m "fix(header): z-index dropdown visible sobre mapa

El Header tenía z-index:100, incrementado a 1001 para que
los popups de CustomSelect estén por encima del mapa de Leaflet.

Fixes #12"

git commit -m "style(legend): tabs en MapLegend para compactar UI"

git commit -m "test(map): validar filtro de badges con OR logic"
```

---

## DESHACER CAMBIOS

### Escenario 1: Último commit (no pusheado)

```bash
# Deshacer commit pero mantener cambios en staging
git reset --soft HEAD~1

# O eliminar commit completamente
git reset --hard HEAD~1
```

### Escenario 2: Commit ya pusheado

```bash
# Opción A: Revert (SEGURO - crea commit nuevo)
git revert <commit-hash>
git push origin sprint-5

# Opción B: Reset (PELIGROSO - si nadie más ha basado trabajo)
git reset --hard <commit-hash>
git push origin sprint-5 --force-with-lease
```

### Escenario 3: Deshacer una US completa

```bash
# Si está en su rama (no mergeada)
git branch -D feature/us-501-mappin
git push origin --delete feature/us-501-mappin

# Si ya está mergeada a sprint-5
git checkout sprint-5
git revert -m 1 <merge-commit-hash>
git push origin sprint-5
```

### Escenario 4: Deshacer cambios en archivo específico

```bash
# Restaurar a versión anterior
git checkout <commit-hash> -- src/components/Map/MapPin.tsx
git commit -m "fix: revert MapPin.tsx a versión anterior"
git push origin sprint-5
```

### Escenario 5: Cambios en rama sincronizada con develop

```bash
# Si develop tiene cambios nuevos
git fetch origin
git rebase origin/develop

# Si hay conflictos
git status  # Ver conflictos
# Resuelves manualmente en VS Code
git add <archivos-resueltos>
git rebase --continue
git push origin sprint-5 --force-with-lease
```

---

## VERSIONADO SEMÁNTICO

### Formato: MAJOR.MINOR.PATCH

```
v2.3.0
├─ MAJOR (2): cambios que rompen compatibilidad
├─ MINOR (3): feature nueva (es este sprint)
└─ PATCH (0): bug fix, hotfix
```

### Histórico del Proyecto

| Versión | Sprint | Descripción |
|---------|--------|------------|
| v2.0.0 | Sprint 1-2 | Layout + Data Layer |
| v2.1.0 | Sprint 3 | Header completo |
| v2.2.0 | Sprint 4 | Sidebar completa |
| v2.3.0 | Sprint 5 | Badges, filtros, auto-scroll ← Actual |
| v2.4.0 | Sprint 6 | AccuWeather API real (próximo) |
| v2.5.0 | Sprint 7 | Responsive (próximo) |

### Crear Release

```bash
# 1. Asegurar que main está actualizado
git checkout main
git pull origin main

# 2. Crear tag anotado (con mensaje)
git tag -a v2.3.0 -m "Sprint 5: Badges, filtros, auto-scroll, z-index fix

Features:
- 4 categorías de badges (Pokeparadas, Gimnasios, Comunidad, Mejores Lugares)
- Filtro por categorías con lógica OR
- MapLegend con pestañas (Clima / Categorías)
- Toggle mostrar/ocultar badges en pines
- Persistencia de preferencias en localStorage
- Auto-scroll en LocationFeed al seleccionar pin
- Fix z-index Header para popups visibles sobre mapa"

# 3. Push tag a remoto
git push origin v2.3.0

# 4. Ver todos los tags
git tag -l
git show v2.3.0
```

---

## OPERACIONES ÚTILES

### Ver cambios sin pusheados

```bash
# Commits locales que no están en remoto
git log origin/sprint-5..sprint-5 --oneline

# Cambios sin commitear
git status
git diff

# Cambios staged
git diff --staged
```

### Historial limpio

```bash
# Ver commits de sprint-5 vs main
git log main..sprint-5 --oneline --graph

# Ver todos los cambios
git diff main..sprint-5 --stat

# Ver quién cambió qué
git blame src/components/Map/MapPin.tsx
```

### Gestión de ramas

```bash
# Ver todas las ramas
git branch -a

# Ver ramas merged (seguras de eliminar)
git branch --merged

# Ver ramas no merged
git branch --no-merged

# Renombrar rama local
git branch -m old-name new-name

# Sincronizar (eliminar refs a ramas eliminadas en remoto)
git fetch --prune
```

### Cherry-pick (tomar un commit de otra rama)

```bash
# Aplicar un commit específico a tu rama
git cherry-pick <commit-hash>

# Si hay conflictos
git cherry-pick --abort
```

---

## BUENAS PRÁCTICAS

### ✅ HACER

- ✅ Commits pequeños y enfocados (1 cambio = 1 commit)
- ✅ Mensajes de commit descriptivos
- ✅ Push frecuente (evita perder trabajo)
- ✅ Compilar antes de merge
- ✅ Un feature branch = una US
- ✅ Rebase en lugar de merge (historial más limpio)
- ✅ Usar `--force-with-lease` en lugar de `--force`
- ✅ Crear tags para releases importantes

### ❌ NO HACER

- ❌ Commits gigantes con múltiples cambios
- ❌ Mensajes genéricos ("fix", "cambios", "update")
- ❌ Trabajar directamente en main
- ❌ Mergear sin verificar que compila
- ❌ Usar `--force` (usa `--force-with-lease`)
- ❌ Revertir commits públicos sin revert (usa revert, no reset)
- ❌ Dejar ramas feature viejas sin mergear

---

## RECUPERACIÓN DE EMERGENCIA

### Recuperar cambios perdidos

```bash
# Ver todos los commits (incluso eliminados)
git reflog

# Recuperar a un commit específico
git reset --hard <commit-hash>
```

### Recuperar rama eliminada

```bash
# Ver historial de deleciones
git reflog

# Recuperar
git checkout -b sprint-5 <commit-hash>
```

---

## CHECKLIST: Terminar Sprint Correctamente

- [ ] Todas las US mergeadas a sprint-N
- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin errores
- [ ] `npm run test -- --run` pasa localmente
- [ ] Probar funcionalidades principales en navegador
- [ ] Mergear sprint-N a develop
- [ ] Mergear develop a main → **CI/CD se activa automáticamente**
- [ ] Crear tag `v2.x.0` con descripción (ver VERSIONADO SEMÁNTICO)
- [ ] Push tag a remoto
- [ ] Verificar en GitHub que CI verde ✅
- [ ] Verificar en Vercel que deploy production OK ✅
- [ ] Eliminar rama sprint-N (opcional, después de probar en main)

> CI/CD workflow: ver `docs/09-cicd.md` para configuración inicial y detalle de pipelines.

---

**Mantén este documento actualizado** después de cada sprint para reflejar nuevas prácticas o cambios en el flujo.
