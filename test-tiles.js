const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.createBrowserContext();

  // Captura requests para ver qué tiles se descargan
  const requests = [];

  const page = await context.newPage();
  page.on('request', (req) => {
    if (req.url().includes('cartocdn.com')) {
      requests.push({
        url: req.url(),
        time: new Date().toLocaleTimeString()
      });
    }
  });

  console.log('\n🌍 INICIANDO TEST DE TILES EN DARK MODE\n');

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('✓ App cargada');

  // Espera a que Leaflet termine de inicializar
  await page.waitForTimeout(2000);

  // Verifica el tema actual
  const theme = await page.evaluate(() => {
    const stored = localStorage.getItem('pwe-theme');
    return stored || 'dark';
  });
  console.log(`✓ Tema actual: ${theme}`);

  // Inspecciona si hay tiles en el DOM (elementos img de Leaflet)
  const tiles = await page.evaluate(() => {
    const images = document.querySelectorAll('img[alt="Tile for layer"]');
    return {
      count: images.length,
      visible: images.length > 0,
      urls: Array.from(images).slice(0, 3).map(img => img.src || img.getAttribute('src'))
    };
  });
  console.log(`✓ Tiles en DOM: ${tiles.count} imágenes`);
  console.log(`  URLs: ${tiles.urls.join(', ')}`);

  // Inspecciona el canvas de Leaflet
  const canvas = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return {
      exists: !!c,
      size: c ? `${c.width}x${c.height}` : null,
      backgroundColor: c ? window.getComputedStyle(c).backgroundColor : null
    };
  });
  console.log(`✓ Canvas Leaflet: ${canvas.exists ? 'presente' : 'NO ENCONTRADO'}`);

  // Verifica las capas de Leaflet en memoria
  const mapState = await page.evaluate(() => {
    if (!window.map) return { error: 'window.map no existe' };
    const layerCount = Object.keys(window.map._layers || {}).length;
    const layers = Object.values(window.map._layers || {})
      .filter(l => l instanceof window.L.TileLayer)
      .map(l => ({ url: l._url, zoomed: l._currentUrl ? 'YES' : 'NO' }));
    return { layerCount, tileLayers: layers };
  });
  console.log(`✓ Capas Leaflet en memoria: ${mapState.layerCount || 0}`);
  console.log(`  TileLayers: ${JSON.stringify(mapState.tileLayers, null, 2)}`);

  console.log(`\n📡 Requests a CartoDB detectados: ${requests.length}`);
  requests.slice(0, 5).forEach(r => console.log(`   ${r.time}: ${r.url}`));

  // Screenshot
  await page.screenshot({ path: '/tmp/dark-mode-tiles.png' });
  console.log('\n✓ Screenshot guardado: /tmp/dark-mode-tiles.png\n');

  await browser.close();
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
