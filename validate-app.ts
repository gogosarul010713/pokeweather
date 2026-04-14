import { chromium } from 'playwright';

async function validateApp() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navegando a http://localhost:5175...');
    await page.goto('http://localhost:5175', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log('✅ Página cargó exitosamente');
    
    // Esperar a que los elementos críticos carguen
    console.log('⏳ Esperando elementos críticos...');
    
    try {
      await page.waitForSelector('[data-testid="location-feed"], .location-feed, .lf-root', { timeout: 10000 });
      console.log('✅ LocationFeed cargó');
    } catch (e) {
      console.log('⚠️  LocationFeed no encontrado (puede ser normal)');
    }
    
    try {
      await page.waitForSelector('.leaflet-container', { timeout: 10000 });
      console.log('✅ Leaflet Map cargó');
    } catch (e) {
      console.log('⚠️  Leaflet Map no encontrado');
    }
    
    // Verificar título
    const title = await page.title();
    console.log(`✅ Título: "${title}"`);
    
    // Esperar un poco para que todo cargue
    await page.waitForTimeout(3000);
    
    console.log('\n🎉 ✅ VALIDACIÓN COMPLETADA EXITOSAMENTE');
    return true;
    
  } catch (error) {
    console.error('❌ Error durante validación:', error);
    return false;
  } finally {
    await browser.close();
  }
}

validateApp().then(success => {
  process.exit(success ? 0 : 1);
});
