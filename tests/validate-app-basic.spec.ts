import { test, expect } from '@playwright/test'

/**
 * Validación básica post-revert: ¿La app funciona en desktop?
 */

test.describe('Validación App Desktop — Post-Revert Nests', () => {
  test('debería cargar sin errores críticos', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
        console.log(`[ERROR] ${msg.text()}`)
      }
    })

    page.on('pageerror', err => {
      errors.push(err.message)
      console.log(`[PAGE ERROR] ${err.message}`)
    })

    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('404') && !e.includes('CORS')
    )

    console.log(`\n✅ Cargada sin ${criticalErrors.length} errores críticos`)
    expect(criticalErrors.length).toBe(0)
  })

  test('debería renderizar sidebar (desktop)', async ({ page }) => {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    // En desktop, el sidebar existe con clase .sb-root
    const sidebar = page.locator('.sb-root')
    const isVisible = await sidebar.isVisible().catch(() => false)

    console.log(`\nSidebar visible: ${isVisible}`)
    console.log(`Sidebar count: ${await sidebar.count()}`)

    // Verificar que exista al menos el sidebar container
    expect(await sidebar.count()).toBeGreaterThan(0)
  })

  test('debería renderizar location cards (cuando hay datos)', async ({ page }) => {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(4000) // Esperar a que AccuWeather cargue

    // Location cards usan clase .lc-root
    const cards = page.locator('.lc-root')
    const cardCount = await cards.count()

    console.log(`\nLocation cards encontradas: ${cardCount}`)

    // Si no hay cards después de 4s, algo está mal
    if (cardCount === 0) {
      // Investigar qué hay en el feed
      const feedContent = page.locator('.sb-feed')
      const feedVisible = await feedContent.isVisible().catch(() => false)
      console.log(`Feed container visible: ${feedVisible}`)

      // Revisar si hay mensaje de loading
      const loadingText = await page.locator('text=/cargando|loading/i').first().isVisible().catch(() => false)
      console.log(`Loading message visible: ${loadingText}`)
    }

    expect(cardCount).toBeGreaterThan(0)
  })

  test('debería permitir click en una city card', async ({ page }) => {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(4000)

    const cards = page.locator('.lc-root')
    const firstCard = cards.first()

    console.log(`\nHaciendo click en primer card...`)
    await firstCard.click()
    await page.waitForTimeout(500)

    // Debería haber un popup de Leaflet
    const popup = page.locator('.leaflet-popup-content')
    const popupVisible = await popup.isVisible().catch(() => false)

    console.log(`Popup visible después de click: ${popupVisible}`)
    expect(popupVisible).toBe(true)
  })

  test('debería mostrar mapa de Leaflet', async ({ page }) => {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const map = page.locator('.leaflet-container')
    const mapVisible = await map.isVisible()

    console.log(`\nMapa Leaflet visible: ${mapVisible}`)
    expect(mapVisible).toBe(true)
  })

  test('debería permitir cambiar tema (dark ↔️ light)', async ({ page }) => {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    const html = page.locator('html')

    // Obtener estado inicial
    const initialClasses = await html.evaluate(el => el.className)
    const isDark = !initialClasses.includes('light')

    console.log(`\nTema inicial: ${isDark ? 'dark' : 'light'}`)

    // Buscar botón de tema
    const themeBtn = page.locator('button').filter({ has: page.locator('.sb-theme-icon') }).first()
    const themeBtnExists = await themeBtn.isVisible().catch(() => false)

    if (themeBtnExists) {
      await themeBtn.click()
      await page.waitForTimeout(300)

      const newClasses = await html.evaluate(el => el.className)
      const isNowLight = newClasses.includes('light')

      console.log(`Tema después de click: ${isNowLight ? 'light' : 'dark'}`)
      expect(isDark !== isNowLight).toBe(true)
    } else {
      console.log('⚠️ Botón de tema no encontrado (puede estar en otro lugar)')
    }
  })
})
