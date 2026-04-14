import { chromium } from '@playwright/test'

async function validateUS901Detailed() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('🧪 Validación Detallada US-901\n')

  const consoleLogs = []

  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      message: msg.text(),
      location: msg.location(),
    })
  })

  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log('📋 ALL CONSOLE MESSAGES:\n')
    consoleLogs.forEach((log, idx) => {
      console.log(`[${idx + 1}] ${log.type.toUpperCase()}: ${log.message}`)
    })

    console.log('\n📊 BREAKDOWN:')
    console.log(`Errors: ${consoleLogs.filter(l => l.type === 'error').length}`)
    console.log(`Warnings: ${consoleLogs.filter(l => l.type === 'warning').length}`)
    console.log(`Logs: ${consoleLogs.filter(l => l.type === 'log').length}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await browser.close()
  }
}

await validateUS901Detailed()
