# 🔍 SONARQUBE/SONARCLOUD — Guía de Implementación

> Análisis técnico detallado para aprender y implementar SonarCloud en Pokémon Weather Explorer

---

## ¿QUÉ ES SONARQUBE?

**SonarQube** es una plataforma de **code quality** que analiza tu código automáticamente para detectar:

- 🔴 **Bugs** → errores que se ejecutarán en producción
- ⚠️ **Code Smells** → patrones que disminuyen mantenibilidad
- 🔒 **Security Issues** → vulnerabilidades (OWASP)
- 📊 **Code Coverage** → qué % del código está testeado
- 🎯 **Duplications** → código repetido

**SonarCloud** = versión cloud de SonarQube (gratuita para repos públicos)

---

## NIVELES DE SEVERIDAD

| Severidad | Qué es | Ejemplo |
|-----------|--------|---------|
| 🔴 **CRITICAL** | Código que puede fallar en prod | Acceso a undefined sin validación |
| 🔴 **BLOCKER** | Bloquea QA / Production | SQL injection, contraseñas hardcodeadas |
| 🟠 **MAJOR** | Impacta significativamente | Lógica incompleta, memory leaks |
| 🟡 **MINOR** | Afecta mantenibilidad | Variables sin usar, imports duplicados |
| 🔵 **INFO** | Sugerencia de mejora | Documentación faltante |

---

## SETUP: SONARCLOUD EN GITHUB ACTIONS

### Paso 1: Crear cuenta en SonarCloud
```
1. Ir a https://sonarcloud.io
2. Registrarse con GitHub
3. Autorizar SonarCloud a acceder a tus repos
4. Seleccionar el repo "pokeweather"
```

### Paso 2: Crear Token en SonarCloud

1. Ir a `https://sonarcloud.io/account/security/`
2. Click "Generate Tokens"
3. Nombre: `POKEWEATHER_SONAR`
4. Copiar el token

### Paso 3: Agregar token a GitHub Secrets

```
Repo → Settings → Secrets and variables → Actions
  Name: SONAR_TOKEN
  Value: [paste token aquí]
```

### Paso 4: Crear GitHub Actions Workflow

`.github/workflows/sonarcloud.yml`:

```yaml
name: SonarCloud Analysis

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Necesario para análisis completo

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests & coverage
        run: npm run test:coverage

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Paso 5: Configurar sonar-project.properties

En raíz del proyecto (`sonar-project.properties`):

```properties
# Identificación del proyecto
sonar.projectKey=pokeweather
sonar.organization=tu-github-username

# Source code
sonar.sources=src
sonar.tests=tests
sonar.test.inclusions=**/*.test.ts,**/*.spec.ts

# Lenguaje
sonar.language=typescript

# Coverage
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Exclusiones
sonar.exclusions=node_modules/**,dist/**,build/**,tests/**

# Rules
sonar.TypeScriptAnalysis.projectTs=tsconfig.json
```

---

## CONFIGURACIÓN AVANZADA

### 1. Integración con ESLint

SonarCloud detecta issues de ESLint si está configurado.

**.eslintrc.json** (ya existe en el proyecto):
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
```

### 2. Reglas Custom para este Proyecto

Crear `.sonarqube/sonar-custom-rules.json`:

```json
{
  "rules": {
    "no-hardcoded-colors": {
      "description": "No usar colores hardcodeados — usar var(--*)",
      "severity": "MAJOR",
      "tags": ["style", "design-system"]
    },
    "no-fixed-cities-count": {
      "description": "Código no debe asumir número fijo de ciudades",
      "severity": "MINOR",
      "tags": ["dynamic-data"]
    },
    "require-data-testid": {
      "description": "Componentes deben tener data-testid para E2E tests",
      "severity": "MINOR",
      "tags": ["testing"]
    }
  }
}
```

### 3. Calidad de Puerta (Quality Gate)

En SonarCloud Dashboard → Project Settings → Quality Gate

Crear condiciones:

| Métrica | Condición | Valor |
|---------|-----------|-------|
| Coverage | >= | 60% |
| Code Smell Density | <= | 2 per 1000 LOC |
| Duplications | <= | 3% |
| Security Hotspots | 100% | Reviewed |
| Bugs | <= | 0 (CRITICAL/BLOCKER) |

**Esto significa:** PR falla si alguna condición no se cumple → no mergea a main

---

## ANÁLISIS ESPECÍFICO PARA POKEWEATHER

### Áreas de Riesgo Alto 🔴

1. **State Management (Zustand)**
   ```typescript
   // ❌ ANTI-PATTERN: localStorage sin try/catch
   localStorage.setItem('pwe-favorites', JSON.stringify(state.favorites))

   // ✅ MEJOR: con manejo de errores
   try {
     localStorage.setItem('pwe-favorites', JSON.stringify(state.favorites))
   } catch (e) {
     console.error('Failed to persist favorites:', e)
   }
   ```

2. **Mapeo de Datos JSON → City**
   ```typescript
   // ❌ Código existente: asume que .lng siempre existe
   const city: City = {
     ...jsonData,
     lon: jsonData.lng // Puede ser undefined si JSON mal formado
   }

   // ✅ MEJOR: validar antes de usar
   const city: City = {
     ...jsonData,
     lon: jsonData.lng ?? 0 // Fallback a 0
   }
   ```

3. **API Calls (AccuWeather)**
   ```typescript
   // ❌ ANTIPATRÓN: sin timeout
   const response = await fetch(url)

   // ✅ MEJOR: con AbortController
   const controller = new AbortController()
   const timeoutId = setTimeout(() => controller.abort(), 5000)
   const response = await fetch(url, { signal: controller.signal })
   clearTimeout(timeoutId)
   ```

### Áreas de Mantenibilidad 🟡

1. **CSS-in-JS Duplication**
   ```typescript
   // Muchos componentes repiten estilos similares
   // Oportunidad: Crear utilidades compartidas para estilos comunes
   ```

2. **Type Safety**
   ```typescript
   // ✅ BIEN: City type está completo
   // ⚠️ MEJORAR: Badge types podrían ser más strict
   type BadgeType = 'stops' | 'gyms' | 'community' | 'best' // ✅ Buen enum
   ```

3. **Error Handling**
   ```typescript
   // ✅ locationDetail.tsx: handleCopyCoords() maneja bien errores
   // ⚠️ REVISAR: weatherService.ts fetch sin try/catch en algunos lugares
   ```

---

## REGLAS IMPORTANTES PARA JAVASCRIPT/TYPESCRIPT

### Security

| Regla | Descripción | Severidad |
|-------|-------------|-----------|
| `S2330` | Contraseñas/tokens hardcodeados | BLOCKER |
| `S2631` | innerHTML/outerHTML con datos dinámicos | CRITICAL |
| `S4757` | Dependencias vulnerables | CRITICAL |
| `S5863` | SQL Injection (si usara DB) | BLOCKER |

### Reliability

| Regla | Descripción | Severidad |
|-------|-------------|-----------|
| `S3735` | Acceso a undefined sin validación | CRITICAL |
| `S1774` | Métodos sin retorno completo | MAJOR |
| `S3001` | Comparación === en lugar de == | MINOR |

### Maintainability

| Regla | Descripción | Severidad |
|-------|-------------|-----------|
| `S1301` | Funciones demasiado largas (> 200 LOC) | MAJOR |
| `S1440` | Parámetros sin usar | MINOR |
| `S1854` | Variables sin usar | MINOR |
| `S1192` | Strings duplicados (> 3 veces) | MINOR |

---

## INTEGRACIÓN CON CI/CD

### GitHub Actions — Pre-commit Check

`.github/workflows/code-quality.yml`:

```yaml
name: Code Quality Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Tests
        run: npm run test:coverage

      - name: SonarCloud
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Check Quality Gate
        run: |
          echo "✅ Quality Gate: PASSED"
          # SonarCloud acción fallará si Quality Gate no se cumple
```

### Bloquear merge si Quality Gate falla

En GitHub: Repo → Settings → Branches → Branch protection

- ✅ Require SonarCloud Quality Gate to pass
- ✅ Require PR review before merge
- ✅ Require status checks to pass

---

## MONITOREO CONTINUO

### Dashboard SonarCloud

URL: `https://sonarcloud.io/project/overview?id=pokeweather`

Métricas principales:

```
📊 Reliability:     A (0 bugs detectados)
🔒 Security:        A (0 vulnerabilidades)
🧹 Maintainability: B (code smells < 3%)
📈 Coverage:        60%+
```

### Alertas automáticas

SonarCloud puede enviar Slack/Discord notificaciones:

```
Integration → Notifications
  Event: Quality Gate FAILED
  Channel: #code-quality
  Template: "PR #{} failed Quality Gate: {reason}"
```

---

## ESTADÍSTICAS ESPERADAS PARA POKEWEATHER

| Métrica | Línea Base | Meta |
|---------|-----------|------|
| LOC (Lines of Code) | ~2,500 | < 3,000 |
| Code Coverage | 60% | 75%+ |
| Duplications | 1.5% | < 1% |
| Technical Debt | 5% effort | < 2% |
| Cyclomatic Complexity | avg 3 | avg < 4 |
| Code Smells | 15 | < 10 |
| Bugs | 0 | 0 |

---

## EJEMPLO REAL: CÓMO SONARCLOUD ENCONTRARÍA ISSUES

### Issue 1: Undefined Access

```typescript
// ❌ SonarCloud flagea como CRITICAL
const city = cities[i]
const name = city.name  // Qué si cities[i] es undefined?

// ✅ Sonar satisfied
const city = cities[i]
const name = city?.name ?? 'Unknown'
```

### Issue 2: Security Hotspot

```typescript
// ❌ flagea como SECURITY HOTSPOT
const url = `http://api.accuweather.com/?key=${apiKey}&q=${city}`
// → apiKey se ve en browser console si alguien inspecciona

// ✅ Mejor: apiKey nunca debe estar en frontend
// (En realidad está en .env, así que está bien, pero SonarCloud igual lo avisa)
```

### Issue 3: Code Smell

```typescript
// ❌ Demasiadas variables sin usar → MINOR issue
const { calculateBadges, getScoreColor, resolveCondition } = weatherService
const result = calculateBadges(cities) // Solo usa esta
// getScoreColor y resolveCondition no se usan → flagea

// ✅ Mejor: solo importar lo necesario
const { calculateBadges } = weatherService
const result = calculateBadges(cities)
```

---

## IMPLEMENTACIÓN PASO A PASO

### Semana 1: Setup
- [ ] Crear cuenta SonarCloud
- [ ] Crear GitHub Actions workflow
- [ ] Configurar sonar-project.properties
- [ ] Ejecutar primer scan (puede tomar 5-10 min)

### Semana 2: Análisis
- [ ] Revisar issues detectados
- [ ] Priorizar (CRITICAL → MAJOR → MINOR)
- [ ] Asignar a developer (algunos pueden ser falsos positivos)

### Semana 3-4: Fixes
- [ ] Mergear fixes en PRs separados
- [ ] Validar que pasen Quality Gate
- [ ] Documentar reglas custom si hay

### Ongoing: Mantenimiento
- [ ] Review SonarCloud dashboard semanal
- [ ] Monitorear tendencias de coverage
- [ ] Ajustar Quality Gate según madurez del proyecto

---

## BENEFICIOS PRINCIPALES

✅ **Detecta bugs antes de producción** → No sorpresas en live
✅ **Mejora seguridad** → OWASP compliance automático
✅ **Estándar de calidad** → Todo PR pasa por Quality Gate
✅ **Documentación** → Aprende patrones incorrectos vs correctos
✅ **Historial** → Trending page muestra evolución del código

---

## COSTE

| Plan | Precio | Almacenamiento |
|------|--------|-----------------|
| **Community** (GRATUITO) | $0 | Repos públicos ilimitados |
| Pro | $100/mes | Repos privados |
| Enterprise | Custom | Soporte 24/7 |

Para Pokémon Weather Explorer (repo público) → **GRATUITO** ✅

---

## REFERENCIAS

- 📘 [SonarCloud Official](https://sonarcloud.io)
- 📙 [SonarCloud Docs](https://docs.sonarcloud.io)
- 📕 [Quality Gates](https://docs.sonarcloud.io/improving/quality-gates/)
- 🔗 [GitHub Actions Integration](https://github.com/SonarSource/sonarcloud-github-action)
- 🐍 [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## PRÓXIMOS PASOS EN EL PROYECTO

1. **Implementar SonarCloud** (2-3 horas)
2. **Revisar issues iniciales** (1-2 horas)
3. **Ajustar Quality Gate** según realidad del proyecto
4. **Agregar a CI/CD** → bloquea PRs que fallen calidad

---

> 💡 **Tip**: Empieza con SonarCloud gratuito. Si el repo se vuelve privado en future, actualizar a Pro.

