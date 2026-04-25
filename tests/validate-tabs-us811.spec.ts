import { test, expect } from '@playwright/test'

test.describe('US-811 — TabControl Funcionamiento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    // Esperar a que la app cargue (aumentar timeout)
    await page.waitForSelector('button:has-text("Clima")', { timeout: 15000 })
  })

  test('Tab Clima activo por defecto', async ({ page }) => {
    const tabActive = page.locator('.tab-button.tab-active')

    // Verificar que hay un tab activo
    await expect(tabActive).toHaveCount(1)

    // Verificar que es el tab Clima
    const activeText = await tabActive.textContent()
    expect(activeText).toContain('Clima')
  })

  test('Click en tab Nidos activa el tab', async ({ page }) => {
    const nidosButton = page.locator('.tab-button', { hasText: /Nidos/i }).first()
    const tabActive = page.locator('.tab-button.tab-active')

    // Click en Nidos
    await nidosButton.click()

    // Verificar que ahora Nidos es el activo
    await expect(tabActive).toContainText('Nidos')
  })

  test('Click en tab Todo activa el tab', async ({ page }) => {
    const todoButton = page.locator('.tab-button', { hasText: /Todo/i }).first()
    const tabActive = page.locator('.tab-button.tab-active')

    // Click en Todo
    await todoButton.click()

    // Verificar que ahora Todo es el activo
    await expect(tabActive).toContainText('Todo')
  })

  test('TabControl no tiene duplicación de contador', async ({ page }) => {
    // Verificar que el TabControl no tenga elemento .tab-counter
    const tabCounter = page.locator('.tab-counter')

    // No debe existir el contador en TabControl
    await expect(tabCounter).toHaveCount(0)
  })

  test('Tres tabs visibles', async ({ page }) => {
    const tabButtons = page.locator('.tab-button')

    // Debe haber exactamente 3 tabs
    await expect(tabButtons).toHaveCount(3)

    // Verificar que contienen los textos esperados
    const allText = await page.locator('.tab-buttons').textContent()
    expect(allText).toContain('Clima')
    expect(allText).toContain('Nidos')
    expect(allText).toContain('Todo')
  })
})
