import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors = { dark: [], light: [] };

  page.on('requestfailed', (req) => {
    if (req.url().includes('dark_matter')) {
      errors.dark.push(req.failure().errorText);
    } else if (req.url().includes('voyager')) {
      errors.light.push(req.failure().errorText);
    }
  });

  console.log('\n⚔️  COMPARATIVA: DARK_MATTER vs VOYAGER\n');

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Test 1: verificar tema actual y errores
  const theme = await page.evaluate(() => localStorage.getItem('pwe-theme') || 'dark');
  console.log(`✓ Tema actual: ${theme}`);
  console.log(`  Dark matter errors: ${errors.dark.length}`);
  console.log(`  Voyager errors: ${errors.light.length}`);

  // Cambiar a light mode
  console.log('\n→ Cambiando a LIGHT mode...');
  await page.evaluate(() => {
    localStorage.setItem('pwe-theme', 'light');
    window.dispatchEvent(new Event('storage'));
  });

  await page.waitForTimeout(3000);

  console.log(`  Dark matter errors: ${errors.dark.length}`);
  console.log(`  Voyager errors: ${errors.light.length}`);

  // Screenshot light
  await page.screenshot({ path: '/tmp/light-mode.png' });
  console.log('\n✓ Light mode screenshot guardado');

  // Cambiar back a dark
  console.log('\n→ Cambiando a DARK mode...');
  await page.evaluate(() => {
    localStorage.setItem('pwe-theme', 'dark');
    window.dispatchEvent(new Event('storage'));
  });

  await page.waitForTimeout(3000);

  console.log(`  Dark matter errors: ${errors.dark.length}`);
  console.log(`  Voyager errors: ${errors.light.length}`);

  await page.screenshot({ path: '/tmp/dark-mode.png' });
  console.log('\n✓ Dark mode screenshot guardado\n');

  if (errors.dark.length > 0) {
    console.log(`❌ Dark matter está BLOQUEADO por: ${errors.dark[0]}`);
  }
  if (errors.light.length > 0) {
    console.log(`⚠️  Voyager también tiene errores: ${errors.light[0]}`);
  } else {
    console.log(`✓ Voyager NO tiene errores de bloqueo`);
  }

  await browser.close();
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
