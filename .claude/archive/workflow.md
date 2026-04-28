# 🔄 Workflow de Sprint & Branching

**Última actualización:** 2026-04-12  
**Versión:** 1.0

---

## 📋 Reglas de Oro

1. **Una rama por subtarea, máximo 2 sesiones/rama**
2. **PRs pequeñas (<200 líneas preferido)**
3. **Main = stable (v1.0.0-stable), Develop = working (v2.0.0-alpha)**
4. **Commit messages: tipo(scope): description**
5. **No merge directo a main (solo via tag release)**

---

## 🎯 Workflow Sprint Típico

### Fase 1: Preparación (Sesión 0 - Spike Técnico)

```bash
# Leer contexto
cat .claude/context/sprint.md
cat .claude/context/active-task.md

# Leer el sprint
cat src/docs/sprints/sprint-N/README.md
cat src/docs/sprints/sprint-N/us/US-XXX.md

# Si hay decisiones pendientes → spike técnico
# Resultado: decisión.md actualizado
```

### Fase 2: Desarrollo (Sesión 1+)

```bash
# Crear rama para subtarea
git checkout develop
git pull
git checkout -b feature/sprint-N-<feature>-session-<S>

# Ejemplo:
git checkout -b feature/sprint-9-code-split-session-1

# Desarrollar, hacer commits
git commit -m "feat(US-901): Dynamic imports setup [session 1/3]"

# Push y crear PR
git push -u origin feature/sprint-9-code-split-session-1
gh pr create --title "feat(US-901): Code Splitting Session 1/3"

# En PR description:
# - Qué se hizo
# - Tests realizados
# - Métricas (si aplica)
# - Blockers/próximos pasos
```

### Fase 3: Review & Merge

```bash
# Esperar review
# Si hay cambios, actualizar rama:
git commit -m "refactor(US-901): Address review feedback"
git push

# Merge cuando esté OK:
# Option A: Merge desde GitHub (recomendado)
# Option B: Local merge
git checkout develop
git pull
git merge feature/sprint-9-code-split-session-1
git push origin develop
```

### Fase 4: Update Contexto Vivo

```bash
# Actualizar estado vivo
.claude/context/active-task.md
  ├─ sesión: "1 de 3 completada"
  ├─ próximo: "Subtarea 2 (tree-shaking validation)"
  └─ blockers: (si hay)

# Actualizar decisions
src/docs/sprints/sprint-N/decisions.md
  ├─ D1: [decisión tomada en sesión]
  └─ Por qué: [razonamiento]
```

---

## 🌳 Branching Strategy

### Estructura de Ramas

```
main
  └─ v1.0.0-stable (tag)      ← Nunca desarrollar aquí
       └─ (cherry-pick solo)

develop
  ├─ feature/sprint-N-<feature>-session-1
  ├─ feature/sprint-N-<feature>-session-2
  ├─ feature/sprint-N-<feature>-session-3
  └─ feature/sprint-N-<other-feature>
```

### Naming Convention

```
feature/sprint-N-<feature-name>-session-<S>

Ejemplos:
✅ feature/sprint-9-code-split-session-1
✅ feature/sprint-9-lazy-load
❌ feature/my-changes
❌ feature/firebase-improvements
```

### Casos Especiales

**Para features muy grandes (8+ SP):**
```
feature/sprint-N-<feature>-session-1    (subtarea A)
feature/sprint-N-<feature>-session-2    (subtarea B)
feature/sprint-N-<feature>-session-3    (subtarea C)

Dependen en orden:
- Session-1 → merge primero
- Session-2 → depende de 1, merge segundo
- Session-3 → depende de 1+2, merge tercero
```

**Para hotfixes (si necesario):**
```
hotfix/sprint-N-<issue>    ← Branch temporalmente desde develop
                           ← Merge con PR
                           ← Luego cherry-pick a main (si needed)
```

---

## 📝 Commit Messages

**Formato:**
```
<type>(<scope>): <subject> [<metadata>]

<body>

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

**Types:**
- `feat` — Nueva funcionalidad
- `fix` — Bug fix
- `refactor` — Cambio de estructura (sin cambiar función)
- `docs` — Documentación
- `test` — Tests

**Scope:**
- `US-XXX` o solo número `(901)`
- o component: `(BottomSheet)`

**Metadata (opcional):**
- `[session 1/3]` — En feature grande
- `[WIP]` — Si no está listo para merge

**Ejemplos:**
```bash
✅ feat(US-901): Dynamic imports for Firebase SDK [session 1/3]
✅ fix(US-802): Handle missing catalog fallback
✅ refactor(PrecisionMetrics): Extract query logic
✅ docs(sprint-8): Add decisions.md
✅ test(US-903): Add Lighthouse audit tests
```

---

## ✅ PR Checklist

**Antes de hacer Push:**
```
- [ ] `npm run build` ← sin errors
- [ ] Tests pasando (si aplica)
- [ ] Cambios tested manualmente
- [ ] Commit messages claros
- [ ] No archivos temporales (.env, dist/)
```

**En PR Description:**
```markdown
## US-XXX: [Título]

### Cambios
- Qué se implementó
- Cómo funciona
- Archivos modificados

### Testing
- [ ] Feature testeada localmente
- [ ] Casos edge considerados
- [ ] Regresiones validadas

### Métricas (si aplica)
- Bundle size antes/después
- Performance impact
- Coverage de tests

### Próximos Pasos
- Si subtarea, qué sigue
- Blockers identificados
- Notas para reviewers
```

---

## 🔄 Subtareas & Dependencias

**Cuando una feature es grande (5+ SP):**

### Ejemplo: US-901 (5 SP)

```
US-901 = 3 subtareas

Subtarea 1: Dynamic imports setup (1.5 SP)
  └─ feature/sprint-9-code-split-session-1
     └─ PR → merge

Subtarea 2: Tree-shaking validation (2 SP) [depende de 1]
  └─ feature/sprint-9-code-split-session-2
     └─ Local: git pull (include S1), develop off 1
     └─ PR → merge

Subtarea 3: Integration & optimization (1.5 SP) [depende de 1+2]
  └─ feature/sprint-9-code-split-session-3
     └─ Local: git pull (include S1+S2)
     └─ PR → merge
```

**Workflow local con dependencias:**
```bash
# Después de Sesión 1 mergeada
git checkout develop
git pull  # Ahora tiene Sesión 1

# Crear rama para Sesión 2 (automáticamente incluye Sesión 1)
git checkout -b feature/sprint-9-code-split-session-2

# Desarrollar, commit, push, PR, merge
# ... (mismo proceso)

# Repetir para Sesión 3
```

---

## 🛠️ Tools & Commands

### Build & Tests
```bash
npm run dev       # Dev server
npm run build     # Build bundle
npm run test      # Unit tests
npm run test:e2e  # E2E tests
npm run lint      # Lint code
```

### Git Útiles
```bash
# Ver commits desde main
git log main..develop --oneline

# Ver cambios en rama actual
git diff develop...HEAD

# Ver qué está uncommitted
git status

# Deshacer último commit (sin perder código)
git reset --soft HEAD~1

# Rebase interactivo (limpiar commits)
git rebase -i develop
```

### GitHub CLI
```bash
# Crear PR
gh pr create --title "..." --body "..."

# Ver PRs
gh pr list --state open

# Merge PR
gh pr merge <number>

# Ver checks (tests, lint)
gh pr checks <number>
```

---

## 📊 Estado Vivo

Actualizar estos archivos según progresa el sprint:

```
.claude/context/
├── sprint.md         ← Sprint actual (no cambia mucho)
├── active-task.md    ← US en progreso (actualizar cada sesión)
├── decisions.md      ← Decisiones tomadas (actualizar si hay)
└── workflow.md       ← Este archivo (referencia, no cambia frecuente)
```

**Qué actualizar cada sesión:**
```markdown
# .claude/context/active-task.md

## Estado Actual
- Sprint: 9
- US Actual: US-901
- Sesión: 2/3 completada
- Próxima: Sesión 3 (integration)

## Blockers
- (si hay)

## Para la próxima sesión:
- Lee US-901/Subtarea 3
- Verifica que rama anterior esté merged
```

---

## 🚨 Troubleshooting

### Problema: Merge Conflict
```bash
# Si hay conflicto al hacer merge:
git merge feature/...   # Falla
# Editar archivos conflictivos (buscar <<<<<<< >>>>>>>)
git add .
git commit -m "Merge conflict resolution"
```

### Problema: Rama desactualizada
```bash
git fetch origin
git rebase origin/develop
# o
git merge origin/develop
```

### Problema: Commit mal mensaje
```bash
# Último commit:
git commit --amend -m "nuevo mensaje"

# Commits anteriores:
git rebase -i HEAD~3  # Ver y editar últimos 3
```

---

## ✨ Best Practices

1. **PRs pequeñas:** 50-200 líneas preferido
2. **Commits frecuentes:** 1 feature = 3-5 commits
3. **Tests primero:** Escribir test case antes de código (cuando sea práctico)
4. **Documentación:** Actualizar docs cuando cambias código
5. **Linting:** Arreglar warnings antes de push
6. **Branch limpio:** Deletear rama después de merge (`git branch -d`)

---

## 📚 Referencias

- [Git Workflow Oficial](https://git-scm.com/docs)
- [GitHub CLI](https://cli.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

