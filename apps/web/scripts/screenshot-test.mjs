import { chromium } from 'playwright';

async function takeScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Screenshot 1: Menu page initial state
  await page.goto('http://localhost:3000/menu');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '/tmp/menu-initial.png', fullPage: false });
  console.log('Screenshot 1: Menu initial state saved to /tmp/menu-initial.png');

  // Screenshot 2: Hover over first menu item to see peek modal
  const firstMenuItem = page.locator('button').filter({ hasText: /Hot & Sour Soup/ }).first();
  await firstMenuItem.hover();
  await page.waitForTimeout(500); // Wait for peek modal animation
  await page.screenshot({ path: '/tmp/menu-hover.png', fullPage: false });
  console.log('Screenshot 2: Menu hover state saved to /tmp/menu-hover.png');

  // Screenshot 3: Click to open full modal
  await firstMenuItem.click();
  await page.waitForTimeout(300); // Wait for modal animation
  await page.screenshot({ path: '/tmp/menu-modal.png', fullPage: false });
  console.log('Screenshot 3: Menu modal saved to /tmp/menu-modal.png');

  // Screenshot 4: Home page
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '/tmp/home.png', fullPage: false });
  console.log('Screenshot 4: Home page saved to /tmp/home.png');

  await browser.close();
  console.log('\nAll screenshots saved to /tmp/');
}

takeScreenshots().catch(console.error);
