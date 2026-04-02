import { test, expect } from '@playwright/test'

/**
 * Test exhaustivo para validar que el fix de iconos dinámicos
 * en el dropdown de ordenamiento funciona correctamente.
 *
 * Incluye:
 * - Validación de labels dinámicos
 * - Toggling de dirección (↑ → ↓)
 * - Screenshots de cada estado
 * - Validación de todas las opciones de sort
 * - Logs detallados
 */

test.describe('Sort Direction Dynamic Labels - Comprehensive Validation', () => {
  test.setTimeout(60000)

  test('PASO 1: Validar que los labels dinámicos se renderizan correctamente', async ({ page }) => {
    console.log('========== PASO 1: LABELS DINÁMICOS ==========')

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })
    console.log('✓ Página cargada')

    // Esperar a que el botón "Ordenar por" esté listo
    const sortBtn = await page.locator('button').filter({ hasText: 'Ordenar por' }).first()
    await expect(sortBtn).toBeVisible({ timeout: 10000 })
    console.log('✓ Botón "Ordenar por" visible')

    // Screenshot ANTES de abrir dropdown
    await page.screenshot({ path: 'test-screenshots/step1-initial-state.png' })
    console.log('✓ Screenshot 1: Estado inicial')

    // Abre el dropdown
    await sortBtn.click()
    await page.waitForTimeout(500)
    console.log('✓ Dropdown abierto')

    // Buscar popup
    const popup = await page.locator('.cs-popup')
    await expect(popup).toBeVisible()

    // Screenshot del dropdown abierto
    await page.screenshot({ path: 'test-screenshots/step2-dropdown-opened.png' })
    console.log('✓ Screenshot 2: Dropdown abierto')

    // Listar todas las opciones
    const allOptions = popup.locator('button')
    const optionCount = await allOptions.count()
    console.log(`Total opciones en dropdown: ${optionCount}`)

    for (let i = 0; i < optionCount; i++) {
      const text = await allOptions.nth(i).textContent()
      console.log(`  Opción ${i}: "${text}"`)
    }

    // Seleccionar "Densidad" (📊)
    const densidadOption = popup.locator('button').filter({ hasText: /📊/ })
    await densidadOption.click()
    await page.waitForTimeout(500)
    console.log('✓ Seleccionado: Densidad')

    // Screenshot después de seleccionar Densidad
    await page.screenshot({ path: 'test-screenshots/step3-densidad-selected.png' })
    console.log('✓ Screenshot 3: Densidad seleccionada')

    // Verificar que el trigger muestra label dinámico "📊 Densidad (↑)"
    const trigger = await page.locator('button').filter({ hasText: /📊 Densidad/ }).first()
    const triggerText = await trigger.textContent()
    console.log(`Label en trigger: "${triggerText}"`)

    expect(triggerText).toContain('📊')
    expect(triggerText).toContain('Densidad')
    expect(triggerText).toMatch(/↑|↓/)
    console.log('✓ VALIDACIÓN PASO 1 EXITOSA: Label dinámico renderizado')
  })

  test('PASO 2: Validar toggle de dirección (↑ → ↓ → ↑)', async ({ page }) => {
    console.log('========== PASO 2: TOGGLE DE DIRECCIÓN ==========')

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })

    const sortBtn = await page.locator('button').filter({ hasText: 'Ordenar por' }).first()
    await expect(sortBtn).toBeVisible({ timeout: 10000 })

    // Abrir dropdown
    await sortBtn.click()
    await page.waitForTimeout(500)

    // Seleccionar "Nombre" (🔤)
    const popup = await page.locator('.cs-popup')
    const nombreOption = popup.locator('button').filter({ hasText: /🔤/ })
    await nombreOption.click()
    await page.waitForTimeout(500)
    console.log('✓ Seleccionado: Nombre')

    // Obtener estado inicial
    const trigger = await page.locator('button').filter({ hasText: /🔤 Nombre/ }).first()
    let triggerText = await trigger.textContent()
    console.log(`Estado inicial: "${triggerText}"`)
    await page.screenshot({ path: 'test-screenshots/step4-nombre-asc.png' })

    // Encontrar botón toggle
    const allButtons = page.locator('button')
    const toggleBtn = await allButtons.filter({ hasText: /^↑$/ }).first()

    if (!toggleBtn) {
      console.error('❌ No se encontró botón toggle con ↑')
      throw new Error('Toggle button not found')
    }
    console.log('✓ Botón toggle (↑) encontrado')

    // Hacer click en toggle
    await toggleBtn.click()
    await page.waitForTimeout(500)
    console.log('✓ Click en toggle button')

    // Verificar cambio a ↓
    triggerText = await trigger.textContent()
    console.log(`Después del toggle: "${triggerText}"`)
    await page.screenshot({ path: 'test-screenshots/step5-nombre-desc.png' })

    expect(triggerText).toContain('↓')
    expect(triggerText).not.toContain('↑')
    console.log('✓ VALIDACIÓN PASO 2A EXITOSA: Cambió a descendente (↓)')

    // Hacer toggle nuevamente (↓ → ↑)
    const toggleBtn2 = await allButtons.filter({ hasText: /^↓$/ }).first()
    await toggleBtn2.click()
    await page.waitForTimeout(500)
    console.log('✓ Click en toggle button de nuevo')

    triggerText = await trigger.textContent()
    console.log(`Después del segundo toggle: "${triggerText}"`)
    await page.screenshot({ path: 'test-screenshots/step6-nombre-asc-again.png' })

    expect(triggerText).toContain('↑')
    expect(triggerText).not.toContain('↓')
    console.log('✓ VALIDACIÓN PASO 2B EXITOSA: Volvió a ascendente (↑)')
  })

  test('PASO 3: Validar que todas las opciones muestran labels con iconos dinámicos', async ({ page }) => {
    console.log('========== PASO 3: VALIDAR TODAS LAS OPCIONES ==========')

    // Solo verificar las opciones disponibles en el dropdown sin cerrar/reabrir entre iteraciones
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })

    const sortBtn = await page.locator('button').filter({ hasText: 'Ordenar por' }).first()
    await expect(sortBtn).toBeVisible({ timeout: 10000 })

    // Abrir dropdown una sola vez
    await sortBtn.click()
    await page.waitForTimeout(500)

    const popup = await page.locator('.cs-popup')
    await expect(popup).toBeVisible()

    // Obtener todas las opciones disponibles
    const allOptions = popup.locator('button')
    const optionCount = await allOptions.count()

    console.log(`\nTotal opciones en dropdown: ${optionCount}`)

    // Verificar que al menos 4 opciones (Nombre, Densidad, Rating, Hora Local) tienen labels con dirección
    const optionsWithDirection = []

    for (let i = 1; i < optionCount; i++) {
      const text = await allOptions.nth(i).textContent()
      console.log(`Opción ${i}: "${text}"`)

      // Verificar que tiene icono y dirección
      if (text && /[📊🔤⭐🕐]/.test(text) && /↑|↓/.test(text)) {
        optionsWithDirection.push(text)
        console.log(`  ✓ Tiene label dinámico`)
      }
    }

    console.log(`\n✓ Total opciones con labels dinámicos: ${optionsWithDirection.length}`)
    expect(optionsWithDirection.length).toBeGreaterThanOrEqual(4)
    console.log('✓ VALIDACIÓN PASO 3 EXITOSA: Todas las opciones tienen labels dinámicos')
  })

  test('PASO 4: Validar que toggle button alterna dirección correctamente', async ({ page }) => {
    console.log('========== PASO 4: TOGGLE BUTTON BIDIRECCIONAL ==========')

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })

    const sortBtn = page.locator('button').filter({ hasText: 'Ordenar por' }).first()
    await expect(sortBtn).toBeVisible({ timeout: 10000 })

    // 1. Abrir y seleccionar Rating
    await sortBtn.click()
    await page.waitForTimeout(500)

    const popup = page.locator('.cs-popup')
    const ratingOption = popup.locator('button').filter({ hasText: /⭐/ })
    await ratingOption.click()
    await page.waitForTimeout(500)
    console.log('✓ Seleccionado: Rating')

    // 2. Captura inicial (↑)
    const trigger = page.locator('button').filter({ hasText: /⭐ Rating/ }).first()
    let triggerText = await trigger.textContent()
    console.log(`Estado inicial: "${triggerText}"`)
    expect(triggerText).toContain('↑')
    await page.screenshot({ path: 'test-screenshots/step7-rating-asc.png' })

    // 3. Click toggle (↑ → ↓)
    let toggleBtn = page.locator('button').filter({ hasText: /^↑$/ }).first()
    await toggleBtn.click()
    await page.waitForTimeout(300)
    console.log('✓ Toggle 1: ↑ → ↓')

    triggerText = await trigger.textContent()
    console.log(`Después del toggle 1: "${triggerText}"`)
    expect(triggerText).toContain('↓')
    await page.screenshot({ path: 'test-screenshots/step8-rating-desc.png' })

    // 4. Click toggle nuevamente (↓ → ↑)
    toggleBtn = page.locator('button').filter({ hasText: /^↓$/ }).first()
    await toggleBtn.click()
    await page.waitForTimeout(300)
    console.log('✓ Toggle 2: ↓ → ↑')

    triggerText = await trigger.textContent()
    console.log(`Después del toggle 2: "${triggerText}"`)
    expect(triggerText).toContain('↑')
    await page.screenshot({ path: 'test-screenshots/step9-rating-asc-again.png' })

    // 5. Click toggle tercera vez (↑ → ↓)
    toggleBtn = page.locator('button').filter({ hasText: /^↑$/ }).first()
    await toggleBtn.click()
    await page.waitForTimeout(300)
    console.log('✓ Toggle 3: ↑ → ↓')

    triggerText = await trigger.textContent()
    console.log(`Después del toggle 3: "${triggerText}"`)
    expect(triggerText).toContain('↓')

    console.log('✓ VALIDACIÓN PASO 4 EXITOSA: Toggle alterna correctamente')
  })

  test('PASO 5: Validar que opciones renderizadas tienen labels dinámicos correctos', async ({ page }) => {
    console.log('========== PASO 5: OPCIONES RENDERIZADAS CON LABELS DINÁMICOS ==========')

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })

    const sortBtn = page.locator('button').filter({ hasText: 'Ordenar por' }).first()
    await expect(sortBtn).toBeVisible({ timeout: 10000 })

    // 1. Abrir dropdown y captura inicial
    await sortBtn.click()
    await page.waitForTimeout(500)

    let popup = page.locator('.cs-popup')
    await expect(popup).toBeVisible()

    // Screenshot del popup abierto
    await page.screenshot({ path: 'test-screenshots/step10-popup-initial.png' })

    // 2. Listar opciones iniciales (todas con ↑)
    const allOptions = popup.locator('button')
    const optionCount = await allOptions.count()

    console.log(`\nOpciones en popup (estado inicial):`)
    const initialOptions = []
    for (let i = 0; i < optionCount; i++) {
      const text = await allOptions.nth(i).textContent()
      if (text && /[📊🔤⭐🕐]/.test(text)) {
        initialOptions.push(text)
        console.log(`  ${i}: "${text}"`)
      }
    }

    // 3. Seleccionar Hora Local
    const horaOption = popup.locator('button').filter({ hasText: /🕐/ })
    await horaOption.click()
    await page.waitForTimeout(500)
    console.log('\n✓ Seleccionado: Hora Local')

    // 4. Cambiar a descendente
    const toggleBtn = page.locator('button').filter({ hasText: /^↑$/ }).first()
    await toggleBtn.click()
    await page.waitForTimeout(300)
    console.log('✓ Toggle a descendente')

    // Screenshot después del toggle
    await page.screenshot({ path: 'test-screenshots/step11-after-toggle.png' })

    // 5. Verificar que el trigger muestra ↓
    const trigger = page.locator('button').filter({ hasText: /🕐 Hora/ }).first()
    const triggerText = await trigger.textContent()
    console.log(`Trigger después del toggle: "${triggerText}"`)
    expect(triggerText).toContain('↓')

    console.log('\n✓ VALIDACIÓN PASO 5 EXITOSA: Labels dinámicos se actualizan correctamente')
  })
})
