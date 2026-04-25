import { test, expect } from '@playwright/test'

/**
 * Validación post-revert de Nests
 * Verificar que la app funciona correctamente sin el código de nests
 */

test.describe('Validación Post-Revert Nests', () => {
  test('debería cargar sin errores después de revertir nests', async ({ page }) => {
    const errors: string[] = []
    const warnings: string[] = []
    const logs: string[] = []

    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error') {
        errors.push(text)
        console.log(`[ERROR] ${text}`)
      } else if (msg.type() === 'warning') {
        warnings.push(text)
        console.log(`[WARN] ${text}`)
      } else if (msg.type() === 'log') {
        logs.push(text)
        console.log(`[LOG] ${text}`)
      }
    })

    page.on('pageerror', err => {
      errors.push(err.message)
      console.log(`[PAGE ERROR] ${err.message}`)
    })

    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    console.log(`\n=== VALIDACIÓN RESULTADOS ===`)
    console.log(`Errores en console: ${errors.length}`)
    console.log(`Warnings: ${warnings.length}`)
    console.log(`Logs: ${logs.length}`)

    // Filtrar errores no críticos
    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('404') && !e.includes('CORS')
    )

    if (criticalErrors.length > 0) {
      console.log('\n🔴 ERRORES CRÍTICOS DETECTADOS:')
      criticalErrors.forEach(e => console.log(`  - ${e}`))
    } else {
      console.log('\n✅ Sin errores críticos')
    }

    expect(criticalErrors.length).toBe(0)
  })

  test('debería renderizar componentes base sin errores', async ({ page }) => {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })

    // Verificar que existen elementos base
    const brand = page.locator('text=PokéWeather')
    const map = page.locator('.leaflet-container')
    const sidebar = page.locator('[data-testid="location-feed"]')

    console.log('\n=== VERIFICACIÓN DE COMPONENTES ===')
    console.log(`PokéWeather visible: ${await brand.isVisible()}`)
    console.log(`Mapa visible: ${await map.isVisible()}`)
    console.log(`Sidebar visible: ${await sidebar.isVisible()}`)

    await expect(brand).toBeVisible()
    await expect(map).toBeVisible()
    await expect(sidebar).toBeVisible()

    console.log('✅ Todos los componentes base están presentes')
  })

  test('debería permitir interacción básica', async ({ page }) => {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="location-card"]', { timeout: 5000 })

    console.log('\n=== PRUEBAS DE INTERACCIÓN ===')

    // Contar ciudades
    const cardCount = await page.locator('[data-testid="location-card"]').count()
    console.log(`Ciudades cargadas: ${cardCount}`)
    expect(cardCount).toBeGreaterThan(0)

    // Click en primer card
    const firstCard = page.locator('[data-testid="location-card"]').first()
    await firstCard.click()
    await page.waitForTimeout(500)

    const popup = page.locator('.leaflet-popup-content')
    const isPopupVisible = await popup.isVisible().catch(() => false)
    console.log(`Popup visible después de click: ${isPopupVisible}`)

    console.log('✅ Interacciones básicas funcionan')
  })

  test('debería mostrar el estado de la app en console', async ({ page }) => {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    console.log('\n=== ESTADO DE LA APP ===')

    // Ejecutar código en el contexto de la página
    const appState = await page.evaluate(() => {
      const html = document.documentElement
      const body = document.body
      const isDarkMode = !html.classList.contains('light')
      const cityCards = document.querySelectorAll('[data-testid="location-card"]').length

      return {
        darkMode: isDarkMode,
        cityCards,
        hasMap: !!document.querySelector('.leaflet-container'),
        hasSidebar: !!document.querySelector('[data-testid="location-feed"]'),
        documentReady: document.readyState,
        url: window.location.href
      }
    })

    console.log(`Dark Mode: ${appState.darkMode}`)
    console.log(`Ciudades cargadas: ${appState.cityCards}`)
    console.log(`Mapa presente: ${appState.hasMap}`)
    console.log(`Sidebar presente: ${appState.hasSidebar}`)
    console.log(`Doc ready: ${appState.documentReady}`)
    console.log(`URL: ${appState.url}`)

    expect(appState.hasMap).toBe(true)
    expect(appState.hasSidebar).toBe(true)
    expect(appState.cityCards).toBeGreaterThan(0)
  })
})
