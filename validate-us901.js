const { chromium } = require('@playwright/test')

async function validateUS901() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('🧪 Validación US-901: Code Splitting Firebase SDK\n')

  const consoleLogs = []
  const pageErrors = []

  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      message: msg.text(),
    })
  })

  page.on('pageerror', (error) => {
    pageErrors.push(error.toString())
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
    console.log('📍 TEST 3: Waiting for cities to load...')
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
        log.message.includes('Firestore not initialized')
    )

    if (firebaseInitLogs.length > 0) {
      console.log('ℹ️  Firebase messages:')
      firebaseInitLogs.forEach((log) => console.log(`   ${log.message}`))
    } else {
      console.log('⚠️  No Firebase init messages (lazy-loaded)')
    }
    console.log()

    // SUMMARY
    console.log('📊 SUMMARY\n')
    const errorLogs = consoleLogs.filter((l) => l.type === 'error')
    const warningLogs = consoleLogs.filter((l) => l.type === 'warning')
    console.log(
      `Total console messages: ${consoleLogs.length} (${errorLogs.length} errors, ${warningLogs.length} warnings)`
    )
    console.log(`Page runtime errors: ${pageErrors.length}`)
    console.log(`Firebase errors: ${firebaseErrors.length}`)
    console.log()

    // Verdict
    const hasErrors = firebaseErrors.length > 0 || pageErrors.length > 0
    if (hasErrors) {
      console.log('❌ VALIDATION FAILED')
    } else {
      console.log('✅ VALIDATION PASSED')
    }

  } catch (error) {
    console.error('Error during validation:', error)
  } finally {
    await browser.close()
  }
}

validateUS901()
