# 🎭 E2E Tests — Playwright

Tests end-to-end que validan flujos completos de usuario.

---

## 📋 Tests Actuales

| Test | Propósito | Archivo |
|------|-----------|---------|
| smoke-test | Carga básica de app | `ui/smoke-test.spec.ts` |
| debug-bottomsheet-visibility | BottomSheet visible en mobile | `ui/debug-bottomsheet-visibility.spec.ts` |
| validate-prediction-table | Tabla de predicciones renderiza | `ui/validate-prediction-table.spec.ts` |
| sort-direction-toggle | Toggle dirección de sort (asc/desc) | `ui/sort-direction-toggle.spec.ts` |
| sort-dropdown-dynamic | Dropdown de sort con labels dinámicos | `ui/sort-dropdown-dynamic.spec.ts` |
| test-sort-dynamic-labels | Labels de columnas se actualizan | `ui/test-sort-dynamic-labels.spec.ts` |

---

## ✍️ Cómo Escribir E2E Tests

### 1. Estructura Básica

```typescript
import { test, expect } from '@playwright/test'

test('debería cargar la app', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page).toHaveTitle('Pokémon Weather')
})
```

### 2. Selectores Recomendados

```typescript
// Por data-testid (mejor práctica)
page.locator('[data-testid="map"]')

// Por clase CSS
page.locator('.map-container')

// Por role (accessibility)
page.locator('button', { hasText: 'Click me' })

// Por texto exacto
page.locator('text="Export CSV"')
```

### 3. Acciones Comunes

```typescript
// Navegación
await page.goto('http://localhost:5173')

// Inputs
await page.locator('input[type="search"]').fill('Sydney')

// Clicks
await page.locator('button').click()

// Esperas
await expect(page.locator('.table')).toBeVisible()
await page.waitForLoadState('networkidle')

// Verificaciones
expect(await page.locator('td').count()).toBeGreaterThan(0)
```

### 4. Estructura de Carpetas

```
tests/e2e/
├── ui/                    ← Tests de UI (componentes, interacciones)
│   ├── smoke-test.spec.ts
│   ├── sort-*.spec.ts
│   └── ...
└── api/                   ← Tests de API (endpoints) — si necesario
    └── ...
```

### 5. Naming Convention

- Archivo: `[feature].spec.ts`
- Test: `test('debería [comportamiento esperado]')`
- Describe: N/A (Playwright no usa describe, usa test directamente)

---

## 🚀 Ejecutar

```bash
npm run test:e2e                    # Headless mode
npm run test:e2e -- --headed        # Ver navegador
npm run test:e2e -- --debug         # Debugger
npx playwright test --ui            # UI dashboard
npx playwright test --headed --debug sort-  # Filtrar + debug
```

---

## 📚 Ejemplos por Patrón

### Test de Carga (Smoke Test)

```typescript
test('debería cargar la app', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page.locator('.map')).toBeVisible()
  await expect(page.locator('header')).toContainText('Pokémon')
})
```

### Test de Click + Espera

```typescript
test('debería abrir modal al clickear ciudad', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.locator('[data-testid="city-sydney"]').click()
  await expect(page.locator('.modal')).toBeVisible()
  await expect(page.locator('.modal')).toContainText('Sydney')
})
```

### Test de Tabla

```typescript
test('debería mostrar tabla con datos', async ({ page }) => {
  await page.goto('http://localhost:5173')
  const rows = await page.locator('table tbody tr')
  expect(await rows.count()).toBeGreaterThan(0)
})
```

### Test de Sort

```typescript
test('debería cambiar dirección de sort', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Click en header de columna
  await page.locator('th:has-text("Hora")').click()
  
  // Verificar orden (primeira row debe cambiar)
  const firstRow = await page.locator('tbody tr').first()
  await expect(firstRow).toContainText('22:00')
})
```

---

## ⚠️ Reglas

1. **Esperas explícitas:** Usa `expect()` o `waitForLoadState()`, no `setTimeout`
2. **Selectores estables:** Evita selectores por índice (`nth-child(3)`), usa `data-testid`
3. **Fixtures:** Para dados compartidos, usa `tests/fixtures/`
4. **Lentos:** E2E tests son 10-100x más lentos que unitarios; minimiza cantidad
5. **Reproducibles:** Tests deben pasar siempre (no depender de estado previo)

---

## 🐛 Debugging

```bash
# Modo debug interactivo
npx playwright test --debug

# Ver video de ejecución
npx playwright test --headed --headed

# Inspeccionar selectores
npx playwright codegen http://localhost:5173

# Logs detallados
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Dentro del Test

```typescript
// Pausa ejecución
await page.pause()

// Inspeccionar DOM
console.log(await page.content())

// Screenshot
await page.screenshot({ path: 'screenshot.png' })

// Trace
await context.tracing.start({ screenshots: true, snapshots: true })
```

---

## 📊 Convenciones

| Patrón | Ejemplo |
|--------|---------|
| Data-testid | `<button data-testid="sort-btn">` |
| Locator | `page.locator('[data-testid="sort-btn"]')` |
| Rol | `page.locator('button'){ hasText: 'Sort' }` |
| Texto | `page.locator('text="Export"')` |

---

**Última actualización:** 2026-04-26
