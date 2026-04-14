import { chromium, expect } from '@playwright/test'

async function validateUS901() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('🧪 Validación US-901: Code Splitting Firebase SDK\n')

  // Collect console messages
  const consoleLogs: { type: string; message: string }[] = []
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      message: msg.text(),
    })
  })

  // Listen for page errors
  const pageErrors: string[] = []
  page.on('pageerror', (error) => {
    pageErrors.push(error.toString())
  })

  try {
    // ──────────────────────────────────────────────────────────────────────
    // TEST 1: Load app
    // ──────────────────────────────────────────────────────────────────────
    console.log('📍 TEST 1: Loading app...')
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
    console.log('✅ App loaded\n')

    // ──────────────────────────────────────────────────────────────────────
    // TEST 2: Check console for Firebase errors
    // ──────────────────────────────────────────────────────────────────────
    console.log('📍 TEST 2: Validating console messages...')
    const firebaseErrors = consoleLogs.filter(
      (log) =>
        log.type === 'error' &&
        log.message.includes('Firebase')
    )

    if (firebaseErrors.length === 0) {
      console.log('✅ No Firebase errors in console')
    } else {
      console.log('❌ Firebase errors found:')
      firebaseErrors.forEach((log) => console.log(`   ${log.message}`))
    }

    // Check for warnings (should be minimal)
    const firebaseWarnings = consoleLogs.filter(
      (log) =>
        log.type === 'warning' &&
        log.message.includes('Firebase')
    )
    console.log(`⚠️  Firebase warnings: ${firebaseWarnings.length}`)
    if (firebaseWarnings.length > 0) {
      firebaseWarnings.forEach((log) => console.log(`   ${log.message}`))
    }
    console.log()

    // ──────────────────────────────────────────────────────────────────────
    // TEST 3: Check if app has initialized (cities loaded)
    // ──────────────────────────────────────────────────────────────────────
    console.log('📍 TEST 3: Waiting for cities to load...')
    await page.waitForTimeout(3000) // Wait for initial load

    // Check if map is rendered
    const mapElement = await page.locator('[class*="leaflet"]').first()
    if (await mapElement.isVisible()) {
      console.log('✅ Map loaded and visible')
    } else {
      console.log('⚠️  Map not immediately visible (might be loading)')
    }
    console.log()

    // ──────────────────────────────────────────────────────────────────────
    // TEST 4: Verify network requests (check chunks loaded)
    // ──────────────────────────────────────────────────────────────────────
    console.log('📍 TEST 4: Checking network requests...')
    const responses = await page.context().requests
    const jsRequests = responses.filter((req) =>
      req.url().includes('/assets/') &&
      req.url().endsWith('.js')
    )

    console.log('JavaScript chunks loaded:')
    let totalSize = 0
    jsRequests.forEach((req) => {
      const url = req.url()
      const filename = url.split('/').pop()
      console.log(`  - ${filename}`)
    })
    console.log()

    // ──────────────────────────────────────────────────────────────────────
    // TEST 5: Verify app doesn't crash with Firebase operations
    // ──────────────────────────────────────────────────────────────────────
    console.log('📍 TEST 5: Checking for runtime errors...')
    if (pageErrors.length === 0) {
      console.log('✅ No page errors detected')
    } else {
      console.log('❌ Page errors found:')
      pageErrors.forEach((err) => console.log(`   ${err}`))
    }
    console.log()

    // ──────────────────────────────────────────────────────────────────────
    // TEST 6: Try Firebase operations (if needed)
    // ──────────────────────────────────────────────────────────────────────
    console.log('📍 TEST 6: Firebase SDK initialization check...')

    // Check console for Firebase init message
    const firebaseInitLogs = consoleLogs.filter(
      (log) =>
        log.message.includes('Firebase initialized') ||
        log.message.includes('Firestore') ||
        log.message.includes('firebase/firestore')
    )

    if (firebaseInitLogs.length > 0) {
      console.log('✅ Firebase messages found:')
      firebaseInitLogs.forEach((log) => console.log(`   ${log.message}`))
    } else {
      console.log('⚠️  No Firebase init messages yet (might be lazy-loaded)')
    }
    console.log()

    // ──────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ──────────────────────────────────────────────────────────────────────
    console.log('📊 SUMMARY\n')
    console.log(
      `Total console messages: ${consoleLogs.length} (${consoleLogs.filter((l) => l.type === 'error').length} errors, ${consoleLogs.filter((l) => l.type === 'warning').length} warnings)`
    )
    console.log(`Page errors: ${pageErrors.length}`)
    console.log(`Firebase errors: ${firebaseErrors.length}`)
    console.log(`JS chunks loaded: ${jsRequests.length}`)
    console.log()

    // Final verdict
    const hasErrors = firebaseErrors.length > 0 || pageErrors.length > 0
    if (hasErrors) {
      console.log('❌ VALIDATION FAILED — Errors detected')
    } else {
      console.log('✅ VALIDATION PASSED — No critical errors')
    }

  } catch (error) {
    console.error('Error during validation:', error)
  } finally {
    await browser.close()
  }
}

validateUS901().catch(console.error)
