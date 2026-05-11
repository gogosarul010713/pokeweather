import { test, expect } from '@playwright/test'

const TARGET_URL = process.env.PREVIEW_URL ?? 'http://localhost:5173'

test('BUG-021: Lookback panel muestra entradas reales (no 0)', async ({ page }) => {
  const consoleLogs: string[] = []
  const consoleErrors: string[] = []

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`
    consoleLogs.push(text)
    if (msg.type() === 'error') consoleErrors.push(text)
  })

  // 1. Cargar la app
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })

  // Esperar a que LoadingScreen desaparezca
  await page.waitForSelector('.ls-overlay', { state: 'detached', timeout: 45000 }).catch(() => {
    console.log('LoadingScreen no detectada, continuando...')
  })
  await page.waitForTimeout(2000)

  // 2. Abrir TestingTools
  const testingBtn = page.locator('button.testing-btn[title*="Testing"]')
  await testingBtn.click({ timeout: 15000 })
  await page.waitForTimeout(1000)

  // 3. Ir a tab Predicciones
  const predTab = page.locator('button, [role="tab"]').filter({ hasText: /Predicciones/i })
  await predTab.click({ timeout: 10000 })
  await page.waitForTimeout(2000)

  // 4. Verificar que hay filas en la tabla
  const rowCount = await page.locator('table tbody tr').count()
  console.log(`\n📊 Filas en tabla Predicciones: ${rowCount}`)

  if (rowCount === 0) {
    console.log('⚠️ Sin filas — no hay datos en Firestore para las últimas 24h')
    await page.screenshot({ path: 'tests/e2e/screenshots/bug-021-no-rows.png' })
    return
  }

  // 5. Hacer clic en el primer boton LOOKBACK
  const lookbackBtn = page.locator('button').filter({ hasText: /LOOKBACK/i }).first()
  const lookbackVisible = await lookbackBtn.isVisible()
  console.log(`Botón LOOKBACK visible: ${lookbackVisible}`)

  if (!lookbackVisible) {
    await page.screenshot({ path: 'tests/e2e/screenshots/bug-021-no-lookback-btn.png' })
    return
  }

  await lookbackBtn.click()
  // Esperar fetch a Firestore (puede tardar hasta 5s)
  await page.waitForTimeout(6000)

  // 6. Capturar screenshot ANTES de evaluar
  await page.screenshot({ path: 'tests/e2e/screenshots/bug-021-lookback-result.png' })
  console.log('📸 Screenshot: tests/e2e/screenshots/bug-021-lookback-result.png')

  // 7. Leer el texto del panel lookback
  const panelText = await page.locator('[class*="lp-header"], [class*="lp-title"]').first()
    .textContent({ timeout: 3000 }).catch(() => null)

  // Buscar "0 entradas" en el panel
  const zeroEntries = await page.locator('text=/0 entradas/i').isVisible().catch(() => false)
  const sinDatos = await page.locator('text=/Sin datos históricos/i').isVisible().catch(() => false)

  // Tarjetas con horas (lp-card)
  const cardCount = await page.locator('[class*="lp-card"]').count()

  // Logs de consola relevantes
  const lookbackLogs = consoleLogs.filter(l =>
    l.toLowerCase().includes('lookback') ||
    l.includes('[Lookback]') ||
    l.includes('fetchLookback') ||
    l.includes('computeOffset') ||
    l.includes('getDoc')
  )

  console.log(`
╔══════════════════════════════════════════════════╗
║         BUG-021 LOOKBACK — RESULTADO EMPIRICO    ║
╚══════════════════════════════════════════════════╝

Filas en tabla:      ${rowCount}
Panel header text:   ${panelText ?? '(no encontrado)'}
Tarjetas lp-card:   ${cardCount}
Muestra 0 entradas:  ${zeroEntries ? 'SI — BUG PRESENTE' : 'NO — OK'}
Muestra Sin datos:   ${sinDatos ? 'SI' : 'NO'}

Logs Lookback (${lookbackLogs.length} total):
${lookbackLogs.slice(0, 15).join('\n') || '  (ninguno)'}

TODOS los logs de consola (${consoleLogs.length}):
${consoleLogs.slice(0, 30).join('\n')}

Errores JS (${consoleErrors.length}):
${consoleErrors.join('\n') || '  (ninguno)'}
  `)

  // Assertion principal
  expect(zeroEntries, 'El panel NO debe mostrar "0 entradas" — BUG-021 fix incorrecto').toBe(false)
})
