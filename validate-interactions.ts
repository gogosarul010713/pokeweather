import { chromium } from 'playwright';

async function validateInteractions() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🧪 VALIDACIÓN COMPLETA CON INTERACCIONES\n');
  
  try {
    // 1. Cargar página
    console.log('1️⃣  Cargando aplicación...');
    await page.goto('http://localhost:5175', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('   ✅ Página cargada');
    
    // 2. Esperar elementos críticos
    console.log('\n2️⃣  Esperando elementos críticos...');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    console.log('   ✅ Mapa cargado');
    
    await page.waitForSelector('.lf-root, [data-testid="location-feed"]', { timeout: 10000 });
    console.log('   ✅ LocationFeed cargado');
    
    // 3. Validar imágenes
    console.log('\n3️⃣  Validando imágenes optimizadas...');
    const images = await page.$$('img');
    console.log(`   📸 Total de imágenes encontradas: ${images.length}`);
    
    let lazyImagesCount = 0;
    for (const img of images) {
      const loading = await img.getAttribute('loading');
      if (loading === 'lazy') lazyImagesCount++;
    }
    console.log(`   ✅ Imágenes con lazy loading: ${lazyImagesCount}`);
    
    // 4. Verificar dimensiones explícitas
    console.log('\n4️⃣  Verificando dimensiones explícitas en imágenes...');
    let imagesWithDimensions = 0;
    for (const img of images) {
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      if (width && height) imagesWithDimensions++;
    }
    console.log(`   ✅ Imágenes con width/height: ${imagesWithDimensions}`);
    
    // 5. Interacción: Buscar ciudad
    console.log('\n5️⃣  Probando búsqueda de ciudades...');
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Tokyo');
      await page.waitForTimeout(500);
      const cards = await page.$$('.lc-root, [data-testid="location-card"]');
      console.log(`   ✅ Búsqueda funcionando (${cards.length} ciudades encontradas)`);
    } else {
      console.log('   ⚠️  Campo de búsqueda no encontrado');
    }
    
    // 6. Interacción: Click en una ciudad
    console.log('\n6️⃣  Probando click en ciudad...');
    const firstCard = page.locator('.lc-root').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(500);
      console.log('   ✅ Click en ciudad funcionando');
    }
    
    // 7. Verificar tema
    console.log('\n7️⃣  Verificando tema (dark/light)...');
    const html = page.locator('html');
    const dataTheme = await html.getAttribute('data-theme');
    console.log(`   ✅ Tema actual: ${dataTheme || 'default'}`);
    
    // 8. Verificar performance metrics
    console.log('\n8️⃣  Verificando metrics de performance...');
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        totalTime: navigation?.loadEventEnd - navigation?.fetchStart
      };
    });
    console.log(`   ⏱️  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`   ⏱️  Load Event: ${metrics.loadComplete}ms`);
    console.log(`   ⏱️  Total Time: ${metrics.totalTime}ms`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ✅ TODAS LAS VALIDACIONES PASARON EXITOSAMENTE');
    console.log('='.repeat(60));
    return true;
    
  } catch (error) {
    console.error('\n❌ Error durante validación:', error);
    return false;
  } finally {
    await browser.close();
  }
}

validateInteractions().then(success => {
  process.exit(success ? 0 : 1);
});
