# 09-TESTING — Estrategia de Testing Funcional

> **Estado**: 🟡 Parcialmente Implementado (Sprint 5)
> **Deuda Técnica**: Tests E2E + integración documentados pero no ejecutados aún
> **Plan**: Agregar tests conforme avanzan funcionalidades (Sprints 6-7)

## Filosofía

**Funcionalidad-driven, no coverage-driven.**

- Tests prácticos y rápidos de ejecutar
- Detectar si algo **que ya funcionaba se rompió**
- Fácil de entender y mantener
- Enfoque en módulos críticos

---

## ESTADO ACTUAL (Sprint 5)

### ✅ IMPLEMENTADO

- [x] Vitest + vitest.config.ts
- [x] Fixtures (mock-cities.ts)
- [x] Unit tests: `weatherService.calculateBadges()` (8 tests)
- [x] Unit tests: `useStore` (14 tests)
- [x] E2E smoke tests básicos (Playwright estructura)
- [x] Scripts en package.json (`npm run test`, `npm run test:ui`, etc)

### 🟡 DEUDA TÉCNICA

Los siguientes tests están **documentados pero NO implementados** (se agregan conforme avanzan funcionalidades):

- [ ] E2E: Filtrado de badges con lógica OR
- [ ] E2E: Auto-scroll en LocationFeed
- [ ] E2E: Z-index fix (popups sobre mapa)
- [ ] E2E: CityTooltip 3 líneas
- [ ] E2E: MapLegend con pestañas y toggle
- [ ] Integration: AccuWeather API real vs mock (Sprint 6)
- [ ] Integration: Refresh automático horario (Sprint 6)
- [ ] Integration: isExtreme flag y alertas (Sprint 6)
- [ ] E2E: Responsive layout (Sprint 7)

### 📊 COBERTURA ACTUAL

```
├── Unit Tests:    2 módulos ✅
├── E2E Tests:     1 smoke test ✅
├── Integration:   0 (Sprint 6)
└── Coverage:      ~5% (Deuda técnica)
```

---

## ESTRUCTURA DE TESTS

```
tests/
├── unit/
│   ├── weatherService.test.ts    (calculateBadges, cuartiles)
│   └── useStore.test.ts          (state mutations, persistencia)
├── e2e/
│   ├── badges-filter.spec.ts     (filtrado OR logic)
│   ├── map-interaction.spec.ts   (pin select, fly to)
│   ├── auto-scroll.spec.ts       (LocationFeed scroll smooth)
│   └── z-index-fix.spec.ts       (popups visible above map)
└── fixtures/
    └── mock-cities.ts            (datos de prueba)
```

---

## CONFIGURACIÓN

### 1. Instalar Vitest
```bash
npm install -D vitest @vitest/ui happy-dom
```

### 2. vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    }
  }
})
```

### 3. package.json scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## MÓDULOS CRÍTICOS A TESTEAR

### 1. weatherService.ts — `calculateBadges()`

**Qué testear:**
- Cálculo correcto de cuartiles (top 25%)
- Badge assignments según criterios
- Lógica exclusiva de 'best'
- Edge cases (datos inconsistentes)

**Ejemplo de test:**
```typescript
// tests/unit/weatherService.test.ts

import { describe, it, expect } from 'vitest'
import { calculateBadges, BADGE_ICONS } from '../../src/data/weatherService'
import { type City } from '../../src/data/useStore'

describe('calculateBadges', () => {
  it('debería asignar 🎯 stops si está en top 25% densidad', () => {
    // Mock: 4 ciudades
    const cities: City[] = [
      { ...mockCity, id: 'a', density: 10 },  // bottom 25%
      { ...mockCity, id: 'b', density: 50 },  // mid-upper
      { ...mockCity, id: 'c', density: 100 }, // top 25%
      { ...mockCity, id: 'd', density: 110 }, // top 25%
    ]

    const badgeCalc = calculateBadges(cities)
    const badgesC = badgeCalc(cities[2])

    expect(badgesC).toContain('stops')
  })

  it('debería retornar SOLO "best" si tiene todas 3 categorías', () => {
    const cities: City[] = [
      {
        ...mockCity,
        id: 'super',
        density: 150,    // top 25%
        gyms: 100,       // top 25%
        rating: 4.5      // >= 4.0
      }
    ]

    const badgeCalc = calculateBadges([...cities])
    const badgesSuper = badgeCalc(cities[0])

    expect(badgesSuper).toEqual(['best'])
    expect(badgesSuper).not.toContain('stops')
    expect(badgesSuper).not.toContain('gyms')
  })

  it('debería combinar badges si tiene 1-2 categorías', () => {
    const cities: City[] = [
      {
        ...mockCity,
        id: 'mixed',
        density: 120,   // top 25%
        gyms: 10,       // bottom 25%
        rating: 2.0     // < 4.0
      }
    ]

    const badgeCalc = calculateBadges([...cities])
    const badgesMixed = badgeCalc(cities[0])

    expect(badgesMixed).toEqual(['stops'])
    expect(badgesMixed).not.toContain('best')
  })
})
```

### 2. useStore.ts — State Management

**Qué testear:**
- `setBadgeFilter()` actualiza estado
- `setShowBadgesOnPins()` persiste en localStorage
- `toggleFavorite()` con localStorage sync
- Derived state (`getFilteredCities`)

**Ejemplo:**
```typescript
// tests/unit/useStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../../src/data/useStore'

describe('useStore', () => {
  beforeEach(() => {
    // Limpiar estado antes de cada test
    useStore.setState({
      badgeFilter: ['stops', 'gyms', 'community', 'best'],
      showBadgesOnPins: true,
      favorites: []
    })
    localStorage.clear()
  })

  it('debería actualizar badgeFilter y filtrar ciudades', () => {
    const { setBadgeFilter, badgeFilter } = useStore.getState()

    setBadgeFilter(['stops']) // Solo pokeparadas

    expect(useStore.getState().badgeFilter).toEqual(['stops'])
  })

  it('debería persistir showBadgesOnPins en localStorage', () => {
    const { setShowBadgesOnPins } = useStore.getState()

    setShowBadgesOnPins(false)

    expect(localStorage.getItem('pwe-showBadgesOnPins')).toBe('false')
    expect(useStore.getState().showBadgesOnPins).toBe(false)
  })

  it('debería agregar/quitar favoritos con persistencia', () => {
    const { toggleFavorite } = useStore.getState()

    toggleFavorite('shibuya')
    expect(useStore.getState().favorites).toContain('shibuya')

    toggleFavorite('shibuya')
    expect(useStore.getState().favorites).not.toContain('shibuya')
  })
})
```

---

## E2E TESTS CON PLAYWRIGHT

### Flujo 1: Filtrado de Badges (OR Logic)

```typescript
// tests/e2e/badges-filter.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Badge Filtering', () => {
  test('debería filtrar ciudades con lógica OR', async ({ page }) => {
    await page.goto('http://localhost:5173')

    // Esperar a que cargue
    await page.waitForSelector('[data-testid="map-container"]')

    // Abrir MapLegend → Tab CATEGORÍAS
    await page.click('[data-testid="legend-tab-categories"]')

    // Seleccionar SOLO "Pokeparadas"
    await page.click('[data-testid="badge-filter-stops"]')
    await page.click('[data-testid="badge-filter-gyms"]')      // Deseleccionar
    await page.click('[data-testid="badge-filter-community"]') // Deseleccionar
    await page.click('[data-testid="badge-filter-best"]')      // Deseleccionar

    // Contar pins visibles — debería ser < total
    const visiblePins = await page.locator('.mv-pin').count()
    const totalPins = 94 // Total ciudades en dataset

    expect(visiblePins).toBeLessThan(totalPins)

    // Seleccionar segundo badge — debería aumentar resultados (OR)
    await page.click('[data-testid="badge-filter-gyms"]')
    const visiblePinsAfter = await page.locator('.mv-pin').count()

    expect(visiblePinsAfter).toBeGreaterThan(visiblePins)
  })
})
```

### Flujo 2: Auto-scroll LocationFeed

```typescript
// tests/e2e/auto-scroll.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Auto-scroll on Pin Selection', () => {
  test('debería scroll suave al centro cuando selecciona pin', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.mv-pin')

    // Seleccionar un pin del final de la lista
    const pins = await page.locator('.mv-pin')
    const lastPin = pins.nth(pins.count - 1)
    await lastPin.click()

    // Esperar a que scroll ocurra (transition 0.5s)
    await page.waitForTimeout(600)

    // Verificar que la card activa está visible en LocationFeed
    const activeCard = await page.locator('[data-testid="location-card-active"]')
    const isInViewport = await activeCard.isVisible()

    expect(isInViewport).toBe(true)
  })
})
```

### Flujo 3: Z-index Fix (Popups Above Map)

```typescript
// tests/e2e/z-index-fix.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Z-index Stacking', () => {
  test('CustomSelect dropdown debería estar visible sobre el mapa', async ({ page }) => {
    await page.goto('http://localhost:5173')

    // Abrir FilterPanel → Dropdown "Continente"
    await page.click('[data-testid="filter-continents"]')

    // Esperar a que popup se abra
    const popup = await page.locator('[data-testid="custom-select-popup"]')
    await popup.waitFor({ state: 'visible' })

    // Obtener Z-index del popup vs mapa
    const popupZIndex = parseInt(
      await popup.evaluate(el => window.getComputedStyle(el).zIndex)
    )
    const mapZIndex = parseInt(
      await page.locator('.leaflet-container').evaluate(el =>
        window.getComputedStyle(el).zIndex
      )
    )

    expect(popupZIndex).toBeGreaterThan(mapZIndex)
  })
})
```

---

## CÓMO EJECUTAR

### Unit Tests
```bash
# Ejecutar todos
npm run test

# Watch mode (reload automático al cambiar)
npm run test -- --watch

# UI dashboard
npm run test:ui
```

### E2E Tests
```bash
# Primero: iniciar dev server en otra terminal
npm run dev

# Ejecutar tests
npm run test:e2e

# Modo visual (ver ejecución)
npm run test:e2e:ui

# Test un archivo específico
npm run test:e2e -- tests/e2e/badges-filter.spec.ts
```

---

## TEST DATA / FIXTURES

Crear `tests/fixtures/mock-cities.ts`:

```typescript
import { type City } from '../../src/data/useStore'

export const mockCity: Partial<City> = {
  id: 'test-city',
  name: 'Test City',
  country: 'Test Country',
  flag: '🧪',
  region: 'asia',
  lat: 35.0,
  lon: 139.0,
  density: 50,
  stops: 100,
  gyms: 20,
  rating: 4.0,
  tags: [],
  condition: 'sunny',
  isExtreme: false,
  tempC: 20,
  feelsLike: 18,
  boostedTypes: ['fire', 'ground'],
}

export const testCitiesForQuartiles = [
  { ...mockCity, id: 'c1', density: 10,  gyms: 5,  rating: 2.0 },
  { ...mockCity, id: 'c2', density: 50,  gyms: 25, rating: 3.5 },
  { ...mockCity, id: 'c3', density: 100, gyms: 50, rating: 4.5 },
  { ...mockCity, id: 'c4', density: 120, gyms: 60, rating: 4.8 }, // top 25%
]
```

---

## CHECKLIST DE TESTING

Antes de cada release:

- [ ] `npm run test` pasa sin errores
- [ ] `npm run test:e2e` pasa todos los flujos críticos
- [ ] Cobertura en módulos clave > 70%
- [ ] Tests corren en < 30s total
- [ ] Sin `skip()` o `todo()` pendientes
- [ ] Documentación actualizada si cambia lógica

---

## PRÓXIMOS PASOS

### Sprint 6 — Testing para AccuWeather Real
- Tests de mock vs API real
- Tests de caché (TTL 60 min)
- Tests de refresh automático

### Sprint 7 — Testing Responsive
- Playwright tests en breakpoints (768px, 1024px)
- Touch interactions en mobile
- Bottom sheet modal behavior

---

## REFERENCIAS

- **Vitest**: https://vitest.dev
- **Playwright**: https://playwright.dev
- **Testing Library**: https://testing-library.com
- **PNPM Monorepo**: Si en future escalamos a monorepo

