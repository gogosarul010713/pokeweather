import { test } from '@playwright/test'

test.describe('BottomSheet Visibility Debug (Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport BEFORE navigating
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('http://localhost:5173')

    // Wait for initial load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('DEBUG: Check if BottomSheet is rendered and visible', async ({ page }) => {
    console.log('\n=== TESTING BOTTOMSHEET VISIBILITY ===\n')

    // 1. Check if .bs-root exists in DOM
    const bsRoot = await page.locator('.bs-root')
    const bsExists = await bsRoot.count()
    console.log(`[DOM] .bs-root element exists: ${bsExists > 0 ? 'YES ✓' : 'NO ✗'}`)

    if (bsExists > 0) {
      // Get computed styles
      const bsDisplay = await bsRoot.evaluate(el =>
        window.getComputedStyle(el).display
      )
      const bsHeight = await bsRoot.evaluate(el =>
        window.getComputedStyle(el).height
      )
      const bsPosition = await bsRoot.evaluate(el =>
        window.getComputedStyle(el).position
      )
      const bsBottom = await bsRoot.evaluate(el =>
        window.getComputedStyle(el).bottom
      )
      const bsZIndex = await bsRoot.evaluate(el =>
        window.getComputedStyle(el).zIndex
      )
      const bsVisible = await bsRoot.evaluate(el =>
        window.getComputedStyle(el).visibility
      )

      console.log(`[STYLE] display: ${bsDisplay}`)
      console.log(`[STYLE] position: ${bsPosition}`)
      console.log(`[STYLE] bottom: ${bsBottom}`)
      console.log(`[STYLE] height: ${bsHeight}`)
      console.log(`[STYLE] z-index: ${bsZIndex}`)
      console.log(`[STYLE] visibility: ${bsVisible}`)

      // Check if visible
      const isVisible = await bsRoot.isVisible()
      console.log(`[VISIBLE] .bs-root isVisible(): ${isVisible ? 'YES ✓' : 'NO ✗'}`)

      // Check bounding box
      const box = await bsRoot.boundingBox()
      console.log(`[BOX] .bs-root boundingBox:`, box)
    } else {
      console.log('[ERROR] .bs-root not found in DOM')
    }

    // Take screenshot early (before processing .lf-root which might have multiple elements)
    try {
      await page.screenshot({ path: 'debug-bottomsheet-mobile.png', fullPage: false })
      console.log(`[SCREENSHOT] Saved to: debug-bottomsheet-mobile.png`)
    } catch (e) {
      console.log(`[SCREENSHOT] Error: ${e}`)
    }

    // 2. Check if .lf-root (LocationFeed) exists
    const lfRoot = await page.locator('.lf-root')
    const lfExists = await lfRoot.count()
    console.log(`\n[DOM] .lf-root element exists: ${lfExists > 0 ? 'YES ✓' : 'NO ✗'}`)

    if (lfExists > 0) {
      console.log(`[INFO] Found ${lfExists} .lf-root elements`)

      // Get the first one (inside BottomSheet)
      const lfRoot1 = await page.locator('.lf-root').first()
      const lfDisplay = await lfRoot1.evaluate(el =>
        window.getComputedStyle(el).display
      )
      const lfHeight = await lfRoot1.evaluate(el =>
        window.getComputedStyle(el).height
      )
      const lfVisible = await lfRoot1.evaluate(el =>
        window.getComputedStyle(el).visibility
      )
      const lfFlex = await lfRoot1.evaluate(el =>
        window.getComputedStyle(el).flex
      )

      console.log(`[STYLE] .lf-root display: ${lfDisplay}`)
      console.log(`[STYLE] .lf-root height: ${lfHeight}`)
      console.log(`[STYLE] .lf-root flex: ${lfFlex}`)
      console.log(`[STYLE] .lf-root visibility: ${lfVisible}`)

      const isLfVisible = await lfRoot1.isVisible()
      console.log(`[VISIBLE] .lf-root isVisible(): ${isLfVisible ? 'YES ✓' : 'NO ✗'}`)

      const lfBox = await lfRoot1.boundingBox()
      console.log(`[BOX] .lf-root boundingBox (first):`, lfBox)
    } else {
      console.log('[ERROR] .lf-root not found in DOM')
    }

    // 3. Check viewport dimensions
    const viewportSize = page.viewportSize()
    console.log(`\n[VIEWPORT] Size: ${viewportSize?.width}x${viewportSize?.height}`)

    // 4. Check if Sidebar exists
    const sbRoot = await page.locator('.sb-root')
    const sbExists = await sbRoot.count()
    console.log(`[DOM] .sb-root (Sidebar) exists: ${sbExists > 0 ? 'YES ✓' : 'NO ✗'}`)
    if (sbExists > 0) {
      const sbDisplay = await sbRoot.evaluate(el =>
        window.getComputedStyle(el).display
      )
      console.log(`[STYLE] .sb-root display: ${sbDisplay}`)
    }

    // 5. Check app-list-area
    const appListArea = await page.locator('.app-list-area')
    const appListExists = await appListArea.count()
    console.log(`[DOM] .app-list-area exists: ${appListExists > 0 ? 'YES ✓' : 'NO ✗'}`)
    if (appListExists > 0) {
      const appListDisplay = await appListArea.evaluate(el =>
        window.getComputedStyle(el).display
      )
      console.log(`[STYLE] .app-list-area display: ${appListDisplay}`)
    }

    // 6. Check app-body media query
    const appBody = await page.locator('.app-body')
    const appBodyDisplay = await appBody.evaluate(el =>
      window.getComputedStyle(el).display
    )
    const appBodyHeight = await appBody.evaluate(el =>
      window.getComputedStyle(el).height
    )
    const appBodyOverflow = await appBody.evaluate(el =>
      window.getComputedStyle(el).overflow
    )

    console.log(`\n[APP-BODY] display: ${appBodyDisplay}`)
    console.log(`[APP-BODY] height: ${appBodyHeight}`)
    console.log(`[APP-BODY] overflow: ${appBodyOverflow}`)

    // 8. Dump full HTML structure for .bs-root and surroundings
    const rootHtml = await page.locator('body').innerHTML()
    console.log(`\n[DOM DUMP] Checking if bs-root is in HTML...`)
    if (rootHtml.includes('bs-root')) {
      console.log('[DOM DUMP] bs-root found in HTML ✓')
    } else {
      console.log('[DOM DUMP] bs-root NOT found in HTML ✗')
    }

    // 9. Final assertion to fail test if BottomSheet not visible
    // 9. Check MapView and its z-index/overflow
    const mapArea = await page.locator('.app-map-area')
    const mapAreaDisplay = await mapArea.evaluate(el =>
      window.getComputedStyle(el).display
    )
    const mapAreaFlex = await mapArea.evaluate(el =>
      window.getComputedStyle(el).flex
    )
    const mapAreaZIndex = await mapArea.evaluate(el =>
      window.getComputedStyle(el).zIndex
    )
    const mapAreaOverflow = await mapArea.evaluate(el =>
      window.getComputedStyle(el).overflow
    )

    console.log(`\n[MAP-AREA] display: ${mapAreaDisplay}`)
    console.log(`[MAP-AREA] flex: ${mapAreaFlex}`)
    console.log(`[MAP-AREA] z-index: ${mapAreaZIndex}`)
    console.log(`[MAP-AREA] overflow: ${mapAreaOverflow}`)

    const mapAreaBox = await mapArea.boundingBox()
    console.log(`[MAP-AREA] boundingBox:`, mapAreaBox)

    // 10. Check if MapView leaf component exists
    const leafletContainer = await page.locator('.leaflet-container')
    const leafletExists = await leafletContainer.count()
    console.log(`\n[LEAFLET] Container exists: ${leafletExists > 0 ? 'YES' : 'NO'}`)
    if (leafletExists > 0) {
      const leafletBox = await leafletContainer.boundingBox()
      console.log(`[LEAFLET] BoundingBox:`, leafletBox)
      const leafletZIndex = await leafletContainer.evaluate(el =>
        window.getComputedStyle(el).zIndex
      )
      console.log(`[LEAFLET] z-index: ${leafletZIndex}`)
    }

    // 11. Viewport calculation
    console.log(`\n[VIEWPORT CALC]`)
    console.log(`  Total height: 812px`)
    console.log(`  Header: ~80px`)
    console.log(`  Remaining: ~732px`)
    console.log(`  BottomSheet y: 487px (should be visible)`)
    console.log(`  BottomSheet height: 324.797px`)
    console.log(`  BottomSheet bottom: 487 + 324.797 = 811.797px (fits in 812px viewport)`)

    // 12. Check z-index stacking context
    console.log(`\n[Z-INDEX STACKING]`)
    const stackingElements = [
      { selector: 'html', name: 'html' },
      { selector: 'body', name: 'body' },
      { selector: '#root', name: '#root' },
      { selector: '.app-root', name: '.app-root' },
      { selector: '.app-body', name: '.app-body' },
      { selector: '.app-map-area', name: '.app-map-area' },
      { selector: '.leaflet-container', name: '.leaflet-container' },
      { selector: '.bs-root', name: '.bs-root' },
    ]

    for (const elem of stackingElements) {
      const el = await page.locator(elem.selector).first()
      const exists = await el.count()
      if (exists > 0) {
        const zIndex = await el.evaluate(e =>
          window.getComputedStyle(e).zIndex
        )
        const position = await el.evaluate(e =>
          window.getComputedStyle(e).position
        )
        const overflow = await el.evaluate(e =>
          window.getComputedStyle(e).overflow
        )
        console.log(
          `  ${elem.name.padEnd(20)} | z-index: ${zIndex.padEnd(10)} | position: ${position.padEnd(8)} | overflow: ${overflow}`
        )
      }
    }

    console.log(`\n=== CONCLUSION ===`)
    if (bsExists > 0) {
      const isVisible = await bsRoot.isVisible()
      if (!isVisible) {
        console.log('❌ PROBLEM: .bs-root exists in DOM but is NOT visible')
        console.log('   Likely cause: hidden by display:none, height:0, or off-screen positioning')
      } else {
        console.log('✅ SUCCESS: .bs-root is visible in mobile viewport')
      }
    } else {
      console.log('❌ PROBLEM: .bs-root does not exist in DOM')
      console.log('   Likely cause: Sidebar is not rendering BottomSheet in mobile')
    }
  })
})
