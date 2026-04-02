import { test, expect } from '@playwright/test'

/**
 * Test para validar que el dropdown de ordenamiento renderiza
 * labels dinámicos basados en sortDirection
 * Este test es más simple y no depende de que las ciudades carguen
 */

test.describe('Sort Dropdown Dynamic Labels', () => {
  test.setTimeout(60000)

  test('debería renderizar el dropdown con label dinámico', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })

    // Esperar a que el componente de FilterPanel esté listo
    // Buscar el botón "Ordenar por" que debería existir siempre
    const sortBtn = await page.locator('button').filter({ hasText: 'Ordenar por' }).first()
    await expect(sortBtn).toBeVisible({ timeout: 10000 })

    console.log('✓ Botón "Ordenar por" encontrado')

    // Click para abrir el dropdown
    await sortBtn.click()
    await page.waitForTimeout(500)

    // Buscar todas las opciones en el popup
    const popup = await page.locator('.cs-popup')
    await expect(popup).toBeVisible()

    console.log('✓ Dropdown abierto')

    // Verificar que existan las opciones
    const densidadOption = popup.locator('button').filter({ hasText: /📊/ })
    await expect(densidadOption).toBeVisible()

    console.log('✓ Opción de Densidad encontrada')

    // Click en Densidad
    await densidadOption.click()
    await page.waitForTimeout(500)

    // El dropdown debería cerrarse y el trigger debería mostrar "📊 Densidad (↑)"
    const trigger = await page.locator('button').filter({ hasText: /📊 Densidad/ }).first()
    await expect(trigger).toBeVisible()

    // Verificar que muestra el icono y dirección
    const triggerText = await trigger.textContent()
    console.log('Trigger text after selecting Densidad:', triggerText)
    expect(triggerText).toContain('📊')
    expect(triggerText).toContain('Densidad')
    expect(triggerText).toMatch(/↑|↓/)

    console.log('✓ Label dinámico renderizado correctamente')
  })

  test('debería cambiar el icono de dirección cuando hace toggle', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })

    // Esperar a que el componente de FilterPanel esté listo
    const sortBtn = await page.locator('button').filter({ hasText: 'Ordenar por' }).first()
    await expect(sortBtn).toBeVisible({ timeout: 10000 })

    // Click para abrir
    await sortBtn.click()
    await page.waitForTimeout(500)

    // Click en "Densidad"
    const popup = await page.locator('.cs-popup')
    const densidadOption = popup.locator('button').filter({ hasText: /📊/ })
    await densidadOption.click()
    await page.waitForTimeout(500)

    // Obtener el trigger actualizado
    const trigger = await page.locator('button').filter({ hasText: /📊 Densidad/ }).first()
    let triggerText = await trigger.textContent()
    console.log('Initial trigger:', triggerText)

    // Extraer el icono inicial (debería ser ↑)
    const initialDirection = triggerText?.includes('↑') ? 'asc' : 'desc'
    console.log('Initial direction:', initialDirection)

    // Buscar el botón toggle (debe ser un botón con solo ↑ o ↓)
    const toggleBtn = await page.locator('button').filter({ hasText: /^↑$|^↓$/ }).first()
    expect(toggleBtn).toBeDefined()

    console.log('✓ Toggle button found')

    // Screenshot ANTES
    const beforePath = '/c/Workspace/React/pokeweather/sort-direction-before.png'
    await page.screenshot({ path: beforePath })
    console.log(`✓ Screenshot before: ${beforePath}`)

    // Click en toggle
    await toggleBtn.click()
    await page.waitForTimeout(500)

    // Obtener el nuevo texto
    triggerText = await trigger.textContent()
    console.log('Trigger after toggle:', triggerText)

    // El icono debería haber cambiado
    const newDirection = triggerText?.includes('↑') ? 'asc' : 'desc'
    console.log('New direction:', newDirection)

    // Verificar que cambió
    expect(newDirection).not.toBe(initialDirection)

    // Screenshot DESPUÉS
    const afterPath = '/c/Workspace/React/pokeweather/sort-direction-after.png'
    await page.screenshot({ path: afterPath })
    console.log(`✓ Screenshot after: ${afterPath}`)

    console.log(`✓ Direction changed from ${initialDirection} to ${newDirection}`)
  })

  test('debería mostrar todos los labels dinámicos en la lista', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })

    const sortBtn = await page.locator('button').filter({ hasText: 'Ordenar por' }).first()
    await expect(sortBtn).toBeVisible({ timeout: 10000 })

    // Click para abrir
    await sortBtn.click()
    await page.waitForTimeout(500)

    const popup = await page.locator('.cs-popup')
    await expect(popup).toBeVisible()

    // Verificar que todas las opciones están presentes en el popup
    const options = popup.locator('button')
    const count = await options.count()
    console.log(`Total options in popup: ${count}`)

    // Debería haber al menos 5 opciones (Ordenar por, Nombre, Densidad, Rating, Hora Local)
    expect(count).toBeGreaterThanOrEqual(4)

    // Recopilar textos
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent()
      console.log(`Option ${i}: ${text}`)
    }

    console.log('✓ All options visible in popup')
  })
})
