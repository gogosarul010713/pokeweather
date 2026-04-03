# 09-CICD — Estrategia de Integración y Despliegue Continuo
# Pokémon Weather Explorer v2
# Referencia cuando trabajas en: .github/workflows/, scripts de calidad, deployments

---

## RESUMEN EJECUTIVO

| Dimensión | Decisión |
|-----------|----------|
| CI / Integración | GitHub Actions |
| CD / Deployment | Vercel (zero-config para Vite) |
| Tests unitarios | Vitest v4 + happy-dom |
| Tests E2E | Playwright v1.58 |
| Linting | ESLint v9 + TypeScript-ESLint |
| Cobertura mínima | 50% líneas (incrementar sprint a sprint) |
| Node.js | 20.x (LTS) |
| Entornos | **staging** (develop → URL fija) · **production** (main → manual/deliberado) |

---

## MODELO DE ENTORNOS

```
feature/* ──► sprint-N ──► develop ──► main
                                │         │
                            STAGING    PRODUCTION
                          (automático) (deliberado)
                          URL fija     URL canónica
```

| Rama | Deploy | URL | Cuándo |
|------|--------|-----|--------|
| `develop` | Auto (staging) | `staging-pokeweather.vercel.app` | Cada push a develop |
| `main` | Auto (production) | `pokeweather.vercel.app` | Solo cuando haces merge a main |
| `feature/*`, `sprint-N` | Solo CI | — | Pull Requests |

---

## MODELO DE PIPELINES

```
developer push
      │
      ▼
┌─────────────────────────────────────────────────┐
│              CI — ci.yml (todas las ramas)       │
│                                                  │
│  [quality]        [build]          [e2e]         │
│  lint             tsc -b           playwright    │
│  typecheck   ──►  vite build  ──►  (PRs a main/  │
│  vitest                             develop)     │
│                                                  │
└─────────────────────────────────────────────────┘
      │                        │
      │ push a develop         │ push a main
      ▼                        ▼
┌──────────────────┐   ┌──────────────────────────┐
│ deploy-staging   │   │  cd.yml (production)      │
│ .yml             │   │                           │
│ Vercel Preview   │   │  Vercel Production         │
│ + alias fijo     │   │  (solo cuando tú decides) │
│ 🧪 staging URL   │   │  ✅ production URL         │
└──────────────────┘   └──────────────────────────┘
```

---

## PIPELINE CI — Detalle de Jobs

### Job 1: `quality` (siempre se ejecuta)

| Step | Comando | Falla si... |
|------|---------|-------------|
| Checkout | `actions/checkout@v4` | — |
| Setup Node | `actions/setup-node@v4` (20.x) | — |
| Install deps | `npm ci` | Error en install |
| Lint | `npm run lint` | Hay warnings/errors de ESLint |
| Typecheck | `npx tsc --noEmit` | Errores TypeScript |
| Unit tests | `npm run test -- --run` | Tests rojos |
| Coverage | `npm run test:coverage` | Cobertura < umbral |

### Job 2: `build` (depende de `quality`)

| Step | Comando | Falla si... |
|------|---------|-------------|
| Build prod | `npm run build` | Error compilación |
| Upload artifact | `actions/upload-artifact@v4` | — |

### Job 3: `e2e` (solo en PR a main o develop)

| Step | Comando | Falla si... |
|------|---------|-------------|
| Install Playwright | `npx playwright install --with-deps` | — |
| Run E2E | `npm run test:e2e` | Test E2E rojo |

---

## PIPELINE CD — Vercel

### Flujo de Deployment

```
Push a main
    │
    ▼
CI pasa ✅
    │
    ▼
CD despliega a Vercel Production
    │
    └── URL: https://tu-proyecto.vercel.app
```

### PR Deployments (automáticos por Vercel)

Vercel también crea **preview deployments** automáticos en cada PR sin configuración adicional. El bot de Vercel comenta la URL de preview en el PR.

```
PR abierto → Vercel Preview Deploy → URL única por PR
PR cerrado → Preview destruido automáticamente
```

---

## SECRETS REQUERIDOS (GitHub → Settings → Secrets)

### Para CI (build)

| Secret | Descripción | Cómo obtener |
|--------|-------------|--------------|
| `VITE_ACCUWEATHER_KEY` | API key AccuWeather para build y E2E | accuweather.com developer portal |

### Para CD (Vercel)

| Secret | Descripción | Cómo obtener |
|--------|-------------|--------------|
| `VERCEL_TOKEN` | Access token personal de Vercel | vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | ID de tu organización Vercel | `cat .vercel/project.json` |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel | `cat .vercel/project.json` |
| `VERCEL_STAGING_ALIAS` | Subdominio fijo para staging | Ej: `staging-pokeweather.vercel.app` |

### Cómo obtener Vercel IDs

```bash
# 1. Instalar Vercel CLI (solo una vez)
npm install -g vercel

# 2. Linkear el proyecto al repo local
vercel link

# 3. Los IDs quedan en .vercel/project.json
cat .vercel/project.json
# { "projectId": "prj_xxx", "orgId": "org_xxx" }
```

---

## ESTRATEGIA DE BRANCHES Y QUALITY GATES

```
feature/* ──► sprint-N  (CI completo, sin deploy)
sprint-N  ──► develop   (CI completo, Vercel Preview)
develop   ──► main      (CI completo + E2E + Deploy Production)
```

### Branch Protection Rules (configurar en GitHub)

**`main`:**
- ✅ Requiere PR (no push directo)
- ✅ Requiere CI verde (`quality` + `build` jobs)
- ✅ Requiere 1 review (opcional, recomendado)
- ✅ Dismiss stale reviews si hay nuevos commits

**`develop`:**
- ✅ Requiere PR (no push directo)
- ✅ Requiere `quality` job verde

---

## COBERTURA DE TESTS — Roadmap

| Sprint | Cobertura mínima | Qué testear |
|--------|-----------------|-------------|
| Sprint 6 (actual) | 50% | weatherService.ts — WEATHER_TRANSLATIONS, resolveCondition, calculateBadges |
| Sprint 7 | 60% | useStore.ts — getFilteredCities, filtros |
| Sprint 8+ | 70%+ | Hooks + componentes críticos |

### Tests prioritarios (Sprint 6)

Los primeros tests a escribir en `tests/`:

```
tests/
├── weatherService.test.ts    ← WEATHER_TRANSLATIONS (44 iconos)
│                                resolveCondition (canWindy, umbrales)
│                                getBaseCondition (fallback cloudy)
├── calculateBadges.test.ts   ← top 25% stops/gyms, rating, best
└── cacheService.test.ts      ← TTL 60min, localStorage keys
```

---

## VARIABLES DE ENTORNO POR ENTORNO

| Variable | Dev local | CI | Vercel Preview | Vercel Production |
|----------|-----------|-----|----------------|-------------------|
| `VITE_ACCUWEATHER_KEY` | `.env.local` | GitHub Secret | Vercel Env (preview) | Vercel Env (production) |
| `NODE_ENV` | `development` | `test` | `production` | `production` |

### Configurar en Vercel

```bash
# Agregar variable a todos los entornos Vercel
vercel env add VITE_ACCUWEATHER_KEY
# Selecciona: Production + Preview + Development
```

---

## CHECKLIST: Configuración inicial (una sola vez)

### GitHub
- [ ] Push repo a GitHub (si no está hecho)
- [ ] Crear secreto `VITE_ACCUWEATHER_KEY` en GitHub Secrets
- [ ] Crear secreto `VERCEL_TOKEN`
- [ ] Crear secreto `VERCEL_ORG_ID`
- [ ] Crear secreto `VERCEL_PROJECT_ID`
- [ ] Crear secreto `VERCEL_STAGING_ALIAS` (ej: `staging-pokeweather.vercel.app`)
- [ ] Activar branch protection en `main` (requiere CI verde + PR)
- [ ] Activar branch protection en `develop` (requiere CI verde)

### Vercel
- [ ] `vercel login`
- [ ] `vercel link` (desde el directorio del proyecto)
- [ ] `vercel env add VITE_ACCUWEATHER_KEY` (Production + Preview)
- [ ] Verificar primer deploy manual: `vercel --prod`
- [ ] Anotar staging alias (ej: `staging-pokeweather.vercel.app`) → agregarlo como secret `VERCEL_STAGING_ALIAS`

### Archivos
- [ ] `.github/workflows/ci.yml` ← creado
- [ ] `.github/workflows/deploy-staging.yml` ← creado
- [ ] `.github/workflows/cd.yml` ← creado (production)
- [ ] `.gitignore` incluye `.vercel/`
- [ ] Primer `npm test` pasa localmente

---

## MAINTENANCE

### Versionar los workflows

Al actualizar dependencias en `package.json`, revisar:
- `node-version` en los workflows (mantener LTS)
- Versiones de actions de GitHub (`@v4` etc)

### Costo estimado

| Recurso | Tier Gratuito |
|---------|--------------|
| GitHub Actions | 2,000 min/mes (public repos: ilimitado) |
| Vercel | Hobby: ilimitado deployments, 100GB bandwidth |
| AccuWeather | 15,000 calls/mes |

---

## FLUJO COMPLETO (día a día)

```bash
# 1. Trabajo en feature
git checkout sprint-N
git checkout -b feature/us-604-lazy-load
# ... commits ...
git push origin feature/us-604-lazy-load
# → CI corre (quality + build)

# 2. Merge a sprint-N (US lista)
git checkout sprint-N
git merge feature/us-604-lazy-load
git push origin sprint-N

# 3. Merge sprint-N a develop (sprint completo, todo testeado)
git checkout develop
git merge sprint-N
git push origin develop
# → CI corre
# → STAGING se despliega automáticamente 🧪
# → Bot comenta URL: https://staging-pokeweather.vercel.app

# 4. Probar en staging (tú validas que todo funciona)
# → Abrir https://staging-pokeweather.vercel.app
# → Verificar funcionalidades del sprint
# → Solo cuando estás conforme, continúas al paso 5

# 5. Merge develop a main (decisión deliberada tuya)
git checkout main
git merge develop
git push origin main
# → CI full (con E2E en el PR previo)
# → PRODUCTION se despliega automáticamente ✅
# → Bot comenta URL de producción

# 6. Tag de versión
git tag -a v2.x.0 -m "Sprint N: descripción"
git push origin v2.x.0
```

### Flujo visual

```
feature → sprint-N → develop → [TÚ PRUEBAS EN STAGING] → main
                         │                                   │
                     🧪 Staging                         ✅ Production
                     (auto)                              (tu decisión)
```

---

## REFERENCIAS

- Workflows: `.github/workflows/ci.yml` y `cd.yml`
- Git strategy: `docs/08-git-workflow.md`
- Versiones: `docs/08-git-workflow.md` sección VERSIONADO SEMÁNTICO
- Tests prioritarios: `tests/` (a crear en Sprint 6 cierre)
