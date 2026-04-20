import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Sync]') || text.includes('[PredictionAnalytics]') || text.includes('[Firebase]')) {
      consoleLogs.push(text);
      console.log(`📋 ${text}`);
    }
  });

  try {
    console.log('🚀 US-1008 Cache Validation\n');

    // 1. Abrir app
    console.log('📱 Step 1: Opening app...');
    try {
      await page.goto('http://localhost:5178', { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (e) {
      console.log('⚠️ Dev server might not be running. Expected at http://localhost:5178');
      console.log('   Run: npm run dev');
    }

    // 2. Limpiar caché
    console.log('\n🧹 Step 2: Clearing browser cache...');
    await page.evaluate(() => {
      localStorage.removeItem('pwe-lastSync');
    });

    // 3. Refrescar
    console.log('🔄 Step 3: Refreshing page...');
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});

    // 4. Esperar
    console.log('⏳ Step 4: Waiting for sync (8 seconds)...');
    await page.waitForTimeout(8000);

    // 5. Verificar IndexedDB
    console.log('\n🔍 Step 5: Checking IndexedDB cache...\n');
    
    const cacheStatus = await page.evaluate(async () => {
      return new Promise((resolve) => {
        try {
          const req = indexedDB.open('keyval-store');
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction('keyval');
            const getReq = tx.objectStore('keyval').get('pwe-forecast-cache');
            
            getReq.onsuccess = () => {
              const data = getReq.result;
              if (!data) {
                resolve({ cached: 0, sample: null });
              } else {
                const doc = data[0];
                resolve({
                  cached: data.length,
                  sample: {
                    city: doc.city_id,
                    timezone: doc.timezone,
                    local_time_user: doc.local_time_user,
                    created_at_type: typeof doc.created_at
                  }
                });
              }
            };
          };
        } catch (e) {
          resolve({ error: e.message });
        }
      });
    });

    console.log(`✅ Cache Status:`);
    console.log(`   Documents cached: ${cacheStatus.cached}`);
    if (cacheStatus.sample) {
      console.log(`\n   Sample data:`);
      console.log(`   • City: ${cacheStatus.sample.city}`);
      console.log(`   • Timezone: ${cacheStatus.sample.timezone}`);
      console.log(`   • Local Time User: ${cacheStatus.sample.local_time_user}`);
      console.log(`   • created_at type: ${cacheStatus.sample.created_at_type}`);
    }

    console.log(`\n📊 Console logs (${consoleLogs.length}):`);
    consoleLogs.forEach((log, i) => console.log(`   [${i+1}] ${log}`));

    console.log('\n✅ Validation complete');

  } catch (error) {
    console.error('\n❌ Validation error:', error.message);
  } finally {
    await browser.close();
  }
})();
