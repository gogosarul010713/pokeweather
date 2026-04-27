# 🎭 Playwright Testing (Autonomous)

> Claude puede automatizar el navegador sin pedir permiso al usuario.

---

## ✅ Acceso Verificado (2026-04-21)

```bash
npx playwright --version
→ Version 1.59.1
```

**Configuración del proyecto:** `playwright.config.ts` (ver en root)

---

## 🚀 Comandos Útiles

### Ejecutar todos los tests
```bash
npx playwright test
```

### Ejecutar un test específico
```bash
npx playwright test tests/e2e/analytics.spec.ts
```

### Modo headed (ver navegador)
```bash
npx playwright test --headed
```

### Modo debug (pausar en breakpoints)
```bash
npx playwright test --debug
```

### Ejecutar solo en Chromium
```bash
npx playwright test --project=chromium
```

---

## 🔧 Script Rápido para Inspección

Para extraer datos del navegador sin escribir un test formal:

```javascript
// scripts/inspect-cache.mjs
import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage()

// Capturar logs de la consola
page.on('console', msg => console.log('[Browser]', msg.text()))

await page.goto('http://localhost:5180/analytics')
await page.waitForTimeout(5000) // Esperar sincronización

// Ejecutar función expuesta en window
const data = await page.evaluate(async () => {
  return await window.pweCache.exportForecastCacheJSON()
})

console.log(JSON.stringify(data, null, 2))
await browser.close()
```

Ejecutar con:
```bash
node scripts/inspect-cache.mjs
```

---

## 🎯 Cuándo Usar Playwright vs bq

| Escenario | Usar |
|-----------|------|
| Ver datos en Firestore/BigQuery | **bq** (instantáneo) |
| Validar que la tabla renderiza | **Playwright** (simula usuario) |
| Testear flujo de sincronización | **Playwright** |
| Validar interacciones UI (clicks, filtros) | **Playwright** |
| Exportar datos para análisis | **bq** |
| Debuggear errores visuales | **Playwright headed** |

---

## 📋 Tests Existentes (esperado)

Ubicación: `tests/e2e/` (si existe) o `playwright-tests/`

Tipos de tests que puede haber:
- Smoke tests (carga de app, navegación)
- Tests de sincronización (US-1008)
- Tests de UI (tabla de predicciones, filtros)

---

## 🔐 Setup Necesario (primera vez)

Si el usuario reporta error al ejecutar Playwright:

```bash
npx playwright install        # Descargar navegadores
npx playwright install chrome # Solo Chrome
```

---

## ⚠️ Notas

- Siempre iniciar `npm run dev` antes de correr tests que usen `localhost:5180`
- Los tests headless son más rápidos; usar `--headed` solo para debugging visual
- Si el dev server está caído, Playwright fallará con timeout
