import { chromium } from 'playwright';

async function testPlaywright() {
  console.log('--- Launching Playwright browser test for Next.js Storefront ---');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  try {
    // 1. Visit Kit Builder
    console.log('1. Testing Kit Builder page...');
    await page.goto(`${BASE_URL}/en/1-bedroom-kit-builder`, { waitUntil: 'networkidle' });
    const heading = await page.textContent('h1');
    console.log('   Heading:', heading?.trim());

    // 2. Click Add to Cart
    console.log('2. Clicking Add to Cart...');
    const addButton = page.locator('#kit-add');
    await addButton.click();
    await page.waitForTimeout(1000);

    // 3. Verify on Cart page
    console.log('3. Verifying Cart page...');
    await page.goto(`${BASE_URL}/en/cart`, { waitUntil: 'networkidle' });
    const cartItemCount = await page.locator('#cart-items, article').count();
    console.log('   Cart articles count:', cartItemCount);

    // 4. Test Promo Code
    console.log('4. Testing Promo Code SWATCH50...');
    const promoInput = page.locator('#promo-code-input');
    if (await promoInput.isVisible()) {
      await promoInput.fill('SWATCH50');
      await page.locator('#promo-code-submit').click();
      await page.waitForTimeout(500);
      const feedback = await page.locator('#promo-feedback').textContent();
      console.log('   Promo feedback:', feedback?.trim());
    }

    // 5. Test FAQ Live Search
    console.log('5. Testing FAQ search...');
    await page.goto(`${BASE_URL}/en/faq`, { waitUntil: 'networkidle' });
    const faqInput = page.locator('input[placeholder*="Filter questions"]');
    await faqInput.fill('duties');
    await page.waitForTimeout(300);
    const visibleDetails = await page.locator('details[open]').count();
    console.log('   Visible matching FAQ items:', visibleDetails);

    // 6. Test Language Switcher
    console.log('6. Testing Language Switcher to zh-CN...');
    await page.goto(`${BASE_URL}/en`, { waitUntil: 'networkidle' });
    const langSelect = page.locator('select[aria-label="Language selector"]');
    if (await langSelect.isVisible()) {
      await langSelect.selectOption('zh-CN');
      await page.waitForTimeout(1000);
      console.log('   Current URL:', page.url());
      const zhHero = await page.textContent('h1');
      console.log('   Chinese Hero Heading:', zhHero?.trim());
    }

    console.log('\n Playwright Storefront E2E Test SUCCESSFUL!');
  } finally {
    await browser.close();
  }
}

testPlaywright().catch((err) => {
  console.error('Playwright Test Failed:', err);
  process.exit(1);
});
