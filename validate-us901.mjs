import { chromium } from '@playwright/test'

async function validateUS901() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('🧪 Validación US-901: Code Splitting Firebase SDK\n')

  const consoleLogs = []
  const pageErrors = []
  const networkRequests = []

  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      message: msg.text(),
    })
  })

  page.on('pageerror', (error) => {
    pageErrors.push(error.toString())
  })

  page.on('request', (request) => {
    networkRequests.push(request.url())
  })

  try {
    // TEST 1: Load app
    console.log('📍 TEST 1: Loading app...')
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
    console.log('✅ App loaded\n')

    // TEST 2: Check console for Firebase errors
    console.log('📍 TEST 2: Validating console messages...')
    const firebaseErrors = consoleLogs.filter(
      (log) => log.type === 'error' && log.message.includes('Firebase')
    )

    if (firebaseErrors.length === 0) {
      console.log('✅ No Firebase errors in console')
    } else {
      console.log('❌ Firebase errors found:')
      firebaseErrors.forEach((log) => console.log(`   ${log.message}`))
    }

    const firebaseWarnings = consoleLogs.filter(
      (log) => log.type === 'warning' && log.message.includes('Firebase')
    )
    console.log(`⚠️  Firebase warnings: ${firebaseWarnings.length}`)
    console.log()

    // TEST 3: Wait for initial load
    console.log('📍 TEST 3: Waiting for app to stabilize...')
    await page.waitForTimeout(2000)
    console.log('✅ Page interactive\n')

    // TEST 4: Check for runtime errors
    console.log('📍 TEST 4: Checking for runtime errors...')
    if (pageErrors.length === 0) {
      console.log('✅ No page errors detected')
    } else {
      console.log('❌ Page errors found:')
      pageErrors.forEach((err) => console.log(`   ${err}`))
    }
    console.log()

    // TEST 5: Firebase initialization messages
    console.log('📍 TEST 5: Firebase initialization check...')
    const firebaseInitLogs = consoleLogs.filter(
      (log) =>
        log.message.includes('Firebase initialized') ||
        log.message.includes('Firestore')
    )

    if (firebaseInitLogs.length > 0) {
      console.log('ℹ️  Firebase messages:')
      firebaseInitLogs.forEach((log) => console.log(`   ${log.message}`))
    } else {
      console.log('⚠️  No Firebase init messages yet (lazy-loaded)')
    }
    console.log()

    // TEST 6: Network chunks
    console.log('📍 TEST 6: Network requests analysis...')
    const jsChunks = networkRequests
      .filter((url) => url.includes('/assets/') && url.endsWith('.js'))
      .map((url) => url.split('/').pop())

    console.log(`Total requests: ${networkRequests.length}`)
    if (jsChunks.length > 0) {
      console.log(`JS chunks: ${jsChunks.length}`)
      jsChunks.forEach((chunk) => console.log(`  - ${chunk}`))
    }
    console.log()

    // SUMMARY
    console.log('📊 VALIDATION SUMMARY\n')
    const errorLogs = consoleLogs.filter((l) => l.type === 'error')
    const warningLogs = consoleLogs.filter((l) => l.type === 'warning')

    console.log(`Console messages: ${consoleLogs.length} (${errorLogs.length} errors, ${warningLogs.length} warnings)`)
    console.log(`Page runtime errors: ${pageErrors.length}`)
    console.log(`Firebase-specific errors: ${firebaseErrors.length}`)
    console.log(`Network requests: ${networkRequests.length}`)
    console.log()

    // Verdict
    const hasErrors = firebaseErrors.length > 0 || pageErrors.length > 0
    if (hasErrors) {
      console.log('❌ VALIDATION FAILED — Errors detected')
    } else {
      console.log('✅ VALIDATION PASSED — No critical errors')
    }

  } catch (error) {
    console.error('❌ Validation error:', error)
  } finally {
    await browser.close()
  }
}

await validateUS901()
