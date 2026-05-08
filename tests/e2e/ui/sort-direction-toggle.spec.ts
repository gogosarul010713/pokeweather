import { test, expect } from '@playwright/test'

/**
 * Test para validar que el toggle de dirección de ordenamiento
 * actualiza dinámicamente los labels del dropdown
 */

test.describe('Sort Direction Toggle', () => {
  test.setTimeout(60000)

  test('debería mostrar y actualizar dinámicamente el label de Densidad', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="location-card"]', { timeout: 30000 })

    // Abrir dropdown de ordenamiento
    const sortDropdown = await page.locator('button').filter({ hasText: /Ordenar por/ }).first()
    await sortDropdown.click()

    // Esperar a que el dropdown esté visible
    await page.waitForSelector('.cs-popup')

    // Click en "Densidad"
    const densityOption = await page.locator('.cs-popup button').filter({ hasText: /📊 Densidad/ }).first()
    await densityOption.click()

    // Esperar a que se cierre el dropdown
    await page.waitForTimeout(300)

    // Verificar que el label ahora muestra "📊 Densidad (↑)" — asc por defecto
    const trigger = await page.locator('button').filter({ hasText: /📊 Densidad/ }).first()
    await expect(trigger).toContainText('↑')

    // Screenshot ANTES de toggle
    await page.screenshot({ path: '/c/Workspace/React/pokeweather/sort-before.png' })

    // Buscar botón toggle (↑ o ↓)
    const toggleBtn = await page.locator('button').filter({ hasText: /^↑$|^↓$/ }).first()
    expect(toggleBtn).toBeDefined()

    // Click en toggle para cambiar a descendente
    await toggleBtn.click()

    // Esperar a que se actualice
    await page.waitForTimeout(300)

    // Verificar que ahora muestra "📊 Densidad (↓)"
    await expect(trigger).toContainText('↓')

    // Screenshot DESPUÉS de toggle
    await page.screenshot({ path: '/c/Workspace/React/pokeweather/sort-after.png' })

    // Click de nuevo para volver a ascendente
    await toggleBtn.click()

    // Esperar a que se actualice
    await page.waitForTimeout(300)

    // Verificar que volvió a "📊 Densidad (↑)"
    await expect(trigger).toContainText('↑')
  })

  test('debería mostrar y actualizar dinámicamente el label de Nombre', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="location-card"]')

    // Abrir dropdown de ordenamiento
    const sortDropdown = await page.locator('button').filter({ hasText: /Ordenar por/ }).first()
    await sortDropdown.click()

    // Esperar a que el dropdown esté visible
    await page.waitForSelector('.cs-popup')

    // Click en "Nombre"
    const nameOption = await page.locator('.cs-popup button').filter({ hasText: /🔤 Nombre/ }).first()
    await nameOption.click()

    // Esperar a que se cierre el dropdown
    await page.waitForTimeout(300)

    // Verificar que el label muestra "🔤 Nombre (↑)"
    const trigger = await page.locator('button').filter({ hasText: /🔤 Nombre/ }).first()
    await expect(trigger).toContainText('↑')

    // Buscar botón toggle
    const toggleBtn = await page.locator('button').filter({ hasText: /^↑$|^↓$/ }).first()

    // Click para cambiar a descendente
    await toggleBtn.click()

    // Esperar a que se actualice
    await page.waitForTimeout(300)

    // Verificar que ahora muestra "🔤 Nombre (↓)"
    await expect(trigger).toContainText('↓')
  })

  test('debería mostrar y actualizar dinámicamente el label de Rating', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="location-card"]')

    // Abrir dropdown de ordenamiento
    const sortDropdown = await page.locator('button').filter({ hasText: /Ordenar por/ }).first()
    await sortDropdown.click()

    // Esperar a que el dropdown esté visible
    await page.waitForSelector('.cs-popup')

    // Click en "Rating"
    const ratingOption = await page.locator('.cs-popup button').filter({ hasText: /⭐ Rating/ }).first()
    await ratingOption.click()

    // Esperar a que se cierre el dropdown
    await page.waitForTimeout(300)

    // Verificar que el label muestra "⭐ Rating (↑)"
    const trigger = await page.locator('button').filter({ hasText: /⭐ Rating/ }).first()
    await expect(trigger).toContainText('↑')

    // Buscar botón toggle
    const toggleBtn = await page.locator('button').filter({ hasText: /^↑$|^↓$/ }).first()

    // Click para cambiar a descendente
    await toggleBtn.click()

    // Esperar a que se actualice
    await page.waitForTimeout(300)

    // Verificar que ahora muestra "⭐ Rating (↓)"
    await expect(trigger).toContainText('↓')
  })

  test('debería mostrar y actualizar dinámicamente el label de Hora Local', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="location-card"]')

    // Abrir dropdown de ordenamiento
    const sortDropdown = await page.locator('button').filter({ hasText: /Ordenar por/ }).first()
    await sortDropdown.click()

    // Esperar a que el dropdown esté visible
    await page.waitForSelector('.cs-popup')

    // Click en "Hora Local"
    const timeOption = await page.locator('.cs-popup button').filter({ hasText: /🕐 Hora Local/ }).first()
    await timeOption.click()

    // Esperar a que se cierre el dropdown
    await page.waitForTimeout(300)

    // Verificar que el label muestra "🕐 Hora Local (↑)"
    const trigger = await page.locator('button').filter({ hasText: /🕐 Hora Local/ }).first()
    await expect(trigger).toContainText('↑')

    // Buscar botón toggle
    const toggleBtn = await page.locator('button').filter({ hasText: /^↑$|^↓$/ }).first()

    // Click para cambiar a descendente
    await toggleBtn.click()

    // Esperar a que se actualice
    await page.waitForTimeout(300)

    // Verificar que ahora muestra "🕐 Hora Local (↓)"
    await expect(trigger).toContainText('↓')
  })

  test('debería verificar que sortDirection realmente cambia en el estado', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="location-card"]')

    // Interceptar logs de console para ver el cambio de estado
    const logs: string[] = []
    page.on('console', msg => {
      logs.push(msg.text())
    })

    // Abrir dropdown de ordenamiento
    const sortDropdown = await page.locator('button').filter({ hasText: /Ordenar por/ }).first()
    await sortDropdown.click()

    // Esperar a que el dropdown esté visible
    await page.waitForSelector('.cs-popup')

    // Click en "Densidad"
    const densityOption = await page.locator('.cs-popup button').filter({ hasText: /📊 Densidad/ }).first()
    await densityOption.click()

    // Esperar a que se cierre el dropdown
    await page.waitForTimeout(300)

    // Buscar botón toggle
    const toggleBtn = await page.locator('button').filter({ hasText: /^↑$|^↓$/ }).first()

    // Click para cambiar
    await toggleBtn.click()

    // Esperar a que se registre el log
    await page.waitForTimeout(500)

    // Verificar que hubo un log con 🔄 toggleSortDirection
    const toggleLog = logs.find(log => log.includes('toggleSortDirection'))
    expect(toggleLog).toBeDefined()
    expect(toggleLog).toContain('newDirection')
  })
})
