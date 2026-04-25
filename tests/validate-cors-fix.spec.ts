import { test, expect } from '@playwright/test'

test('debería cargar sin errores CORS', async ({ page }) => {
  const errors: string[] = []
  const corsErrors: string[] = []

  page.on('console', msg => {
    const text = msg.text()
    if (msg.type() === 'error') {
      errors.push(text)
      if (text.includes('CORS')) {
        corsErrors.push(text)
        console.log(`[CORS ERROR] ${text}`)
      }
    }
  })

  page.on('pageerror', err => {
    const msg = err.message
    errors.push(msg)
    if (msg.includes('CORS')) {
      corsErrors.push(msg)
    }
  })

  await page.goto('http://localhost:5175', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4000)

  console.log(`\n=== VALIDACIÓN CORS ===`)
  console.log(`Total errores: ${errors.length}`)
  console.log(`Errores CORS: ${corsErrors.length}`)
  console.log(`Location cards: ${await page.locator('.lc-root').count()}`)

  expect(corsErrors.length).toBe(0)
})
