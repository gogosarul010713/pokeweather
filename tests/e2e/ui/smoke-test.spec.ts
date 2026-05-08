import { test, expect } from '@playwright/test'

/**
 * Smoke test — Verificar que la app carga sin errores
 * Este es un test E2E básico para validar que la aplicación funciona
 */

test.describe('Smoke Tests', () => {
  test('debería cargar la app sin errores', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })

    // Verificar que el título/header está visible
    const brand = await page.locator('text=PokéWeather')
    await expect(brand).toBeVisible()
  })

  test('debería renderizar el mapa', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })

    // Esperar a que Leaflet cargue
    const mapContainer = await page.locator('.leaflet-container')
    await expect(mapContainer).toBeVisible()
  })

  test('debería renderizar la sidebar', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })

    // Verificar LocationFeed está visible
    const feed = await page.locator('[data-testid="location-feed"]')
    await expect(feed).toBeVisible()
  })

  test('debería permitir cambiar tema', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })

    // Obtener tema inicial
    const html = page.locator('html')
    const isDark = !(await html.evaluate(el => el.classList.contains('light')))

    // Click en botón tema
    await page.click('[data-testid="theme-toggle"]')

    // Esperar a que el cambio se refleje
    await page.waitForTimeout(300)

    // Verificar que cambió
    const isNowLight = await html.evaluate(el => el.classList.contains('light'))
    expect(isDark === !isNowLight).toBe(true)
  })

  test('debería sin errores en console', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })

    // Dar tiempo a que cargue todo
    await page.waitForTimeout(2000)

    // No debería haber errores críticos
    expect(errors.filter(e => !e.includes('favicon'))).toEqual([])
  })
})

test.describe('Basic Interactions', () => {
  test('debería filtrar ciudades cuando busca', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="location-card"]')

    // Contar cards antes
    const cardsBefore = await page.locator('[data-testid="location-card"]').count()

    // Escribir en search
    await page.fill('[data-testid="search-input"]', 'tokyo')

    // Esperar a que filtre
    await page.waitForTimeout(500)

    // Contar cards después — debería ser menos
    const cardsAfter = await page.locator('[data-testid="location-card"]').count()
    expect(cardsAfter).toBeLessThan(cardsBefore)
  })

  test('debería seleccionar una ciudad al hacer click', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="location-card"]')

    // Click en primer card
    const firstCard = await page.locator('[data-testid="location-card"]').first()
    await firstCard.click()

    // Verificar que se muestra el popup
    const popup = await page.locator('.leaflet-popup-content')
    await expect(popup).toBeVisible()
  })
})
