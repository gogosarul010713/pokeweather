const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.text().includes('[Sync]') || msg.text().includes('[PredictionAnalytics]') || msg.text().includes('[Firebase]')) {
      consoleLogs.push(msg.text());
      console.log(`📋 ${msg.text()}`);
    }
  });

  try {
    console.log('🚀 Starting validation...\n');

    // 1. Abrir app
    console.log('📱 Opening app at http://localhost:5178...');
    await page.goto('http://localhost:5178', { waitUntil: 'networkidle', timeout: 30000 });

    // 2. Limpiar caché
    console.log('🧹 Clearing cache (IndexedDB + localStorage)...');
    await page.evaluate(() => {
      localStorage.clear();
      // Limpiar IndexedDB
      indexedDB.databases().then(dbs => {
        dbs.forEach(db => indexedDB.deleteDatabase(db.name));
      });
    });

    // 3. Refrescar
    console.log('🔄 Refreshing page...');
    await page.reload({ waitUntil: 'networkidle' });

    // 4. Esperar a que se ejecute sync
    console.log('⏳ Waiting for sync to complete (10 seconds)...');
    await page.waitForTimeout(10000);

    // 5. Buscar PredictionAnalysisTable (si existe)
    console.log('\n🔍 Checking for prediction data...');
    
    // Buscar si hay datos en la tabla
    const hasTableData = await page.evaluate(() => {
      // Buscar tabla con clase pat- (PredictionAnalysisTable)
      const table = document.querySelector('[class*="pat-"]');
      if (!table) return 'table_not_found';
      
      const rows = table.querySelectorAll('tr');
      return rows.length > 1 ? `found_${rows.length}_rows` : 'table_empty';
    });

    console.log(`\n📊 Table status: ${hasTableData}`);

    // 6. Verificar si hay "Hora Local" en la tabla
    const timeData = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td, th'));
      const horaLocalCells = cells.filter(c => c.textContent.includes('Hora Local'));
      
      return {
        found: horaLocalCells.length > 0,
        samples: horaLocalCells.slice(0, 3).map(c => c.textContent.trim())
      };
    });

    console.log(`\n🕐 "Hora Local" detection: ${timeData.found ? '✅ Found' : '❌ Not found'}`);
    if (timeData.samples.length > 0) {
      console.log('   Samples:', timeData.samples);
    }

    // 7. Capturar screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: '/tmp/validation-screenshot.png' });
    console.log('Screenshot saved to /tmp/validation-screenshot.png');

    console.log('\n✅ Validation complete');
    console.log(`\nConsole logs captured: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      console.log('Key logs:');
      consoleLogs.forEach(log => console.log(`  → ${log}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
