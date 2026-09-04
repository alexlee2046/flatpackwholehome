import { chromium } from 'playwright';

async function testPlaywright() {
  console.log('--- Launching Playwright browser test for Next.js Storefront ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  try {
    // 1. Visit Kit Builder
    console.log('1. Testing Kit Builder page...');
    await page.goto(`${BASE_URL}/en/1-bedroom-kit-builder`, { waitUntil: 'domcontentloaded' });
    const heading = await page.textContent('h1');
    console.log('   Heading:', heading?.trim());

    // 2. Add when the operational catalog is ready; otherwise verify the
    // fail-closed purchase gate without mutating catalog data in E2E.
    const addButton = page.locator('#kit-add');
    const purchaseAvailable = (await addButton.count()) === 1;
    if (purchaseAvailable) {
      console.log('2. Clicking Add to Cart...');
      await addButton.click();
      await page.waitForURL(/\/cart$/);

      // 3. Verify on Cart page, including a hard reload so persisted cart state hydrates cleanly.
      console.log('3. Verifying Cart page and persisted state...');
      await page.goto(`${BASE_URL}/en/cart`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);
      const cartItemCount = await page.locator('#cart-items, article').count();
      console.log('   Cart articles count:', cartItemCount);
      if (cartItemCount < 1) {
        throw new Error('Added bundle did not persist on the cart page');
      }

      // 4. Public/static voucher strings must not be accepted without a paid swatch order.
      console.log('4. Testing unsigned promo code rejection...');
      const promoInput = page.locator('#promo-code-input');
      if (await promoInput.isVisible()) {
        await promoInput.fill('SWATCH50');
        await page.locator('#promo-code-submit').click();
        await page.waitForTimeout(500);
        const feedback = await page.locator('#promo-feedback').textContent();
        console.log('   Promo feedback:', feedback?.trim());
        if (!/invalid|not recognised|not recognized/i.test(feedback || '')) {
          throw new Error('Unsigned SWATCH50 code was not rejected');
        }
      }
    } else {
      console.log('2–4. Catalog checkout unavailable; verifying fail-closed state...');
      await page.locator('[data-kit-customizer]').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const unavailable = document.querySelector('[data-kit-purchase-unavailable]');
        return unavailable instanceof HTMLElement && unavailable.offsetParent !== null;
      });
      if (!(await page.locator('[data-kit-purchase-unavailable]').isVisible())) {
        throw new Error('Unavailable catalog must expose a purchase status instead of Add to Cart');
      }
      await page.goto(`${BASE_URL}/en/cart`, { waitUntil: 'domcontentloaded' });
      if (!(await page.getByText('Your Cart is Empty').isVisible())) {
        throw new Error('Fail-closed catalog must not create a cart line');
      }
    }

    // 5. A malformed v3 value must not hide a recoverable canonical v2 cart.
    console.log('5. Testing corrupt-cart recovery...');
    await page.goto(`${BASE_URL}/en`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('moduliv-cart-items-v3', '{malformed');
      localStorage.setItem('moduliv-cart-items-v2', JSON.stringify([{
        id: 'modusofa',
        name: 'Legacy ModuSofa',
        price: 69900,
        qty: 2,
        variantId: 11,
      }]));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.modulivCart?.items === 'function');
    const recoveredItems = await page.evaluate(() => window.modulivCart.items());
    if (recoveredItems.length !== 1 || recoveredItems[0].variantId !== 11 || recoveredItems[0].qty !== 2) {
      throw new Error(`Corrupt v3 cart did not recover canonical legacy items: ${JSON.stringify(recoveredItems)}`);
    }
    await page.evaluate(() => {
      localStorage.removeItem('moduliv-cart-items-v3');
      localStorage.removeItem('moduliv-cart-items-v2');
      localStorage.removeItem('moduliv-cart-count');
    });

    // 6. Test FAQ Live Search
    console.log('6. Testing FAQ search...');
    await page.goto(`${BASE_URL}/en/faq`, { waitUntil: 'domcontentloaded' });
    const faqInput = page.locator('input[placeholder*="Filter questions"]');
    await faqInput.fill('DDP');
    await page.waitForTimeout(300);
    const visibleDetails = await page.locator('details[open]').count();
    console.log('   Visible matching FAQ items:', visibleDetails);
    if (visibleDetails < 1) throw new Error('FAQ search did not return a DDP result');

    // 7. Test Language Switcher
    console.log('7. Testing Language Switcher to zh-CN...');
    await page.goto(`${BASE_URL}/en`, { waitUntil: 'domcontentloaded' });
    const langSelect = page.locator('header select[aria-label="Language selector"]');
    if (await langSelect.isVisible()) {
      await langSelect.selectOption('zh-CN');
      await page.waitForTimeout(1000);
      console.log('   Current URL:', page.url());
      const zhHero = await page.textContent('h1');
      console.log('   Chinese Hero Heading:', zhHero?.trim());
    }

    // 8. Test The Flat Set Brand Identity
    console.log('8. Verifying The Flat Set Brand Identity in Header...');
    const brandHeading = await page.locator('header a[aria-label="The Flat Set — Home"]').textContent();
    console.log('   Header Brand:', brandHeading?.replace(/\s+/g, ' ').trim());

    // 9. Test Visual Styles (Tailwind compilation & Fonts)
    console.log('9. Verifying Desktop Visual Styles & Tailwind compilation...');
    const styleAudit = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const btn = document.querySelector('.bg-on-background');
      return {
        h1Size: h1 ? window.getComputedStyle(h1).fontSize : null,
        btnBg: btn ? window.getComputedStyle(btn).backgroundColor : null
      };
    });
    console.log('   Visual Audit:', styleAudit);
    if (styleAudit.btnBg === 'rgba(0, 0, 0, 0)' || styleAudit.h1Size === '16px') {
      throw new Error(`Visual styles failed to compile: ${JSON.stringify(styleAudit)}`);
    }

    // 10. Test Mobile Drawer UX (390x844 viewport)
    console.log('10. Testing Mobile Drawer Navigation (390x844 viewport)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/en`, { waitUntil: 'domcontentloaded' });

    const mobileMenuTrigger = page.locator('#mobile-menu-trigger');
    const isTriggerVisible = await mobileMenuTrigger.isVisible();
    console.log('   Mobile menu trigger is visible:', isTriggerVisible);
    if (!isTriggerVisible) {
      throw new Error('Mobile menu trigger should be visible on 390px viewport');
    }

    // Open drawer
    await mobileMenuTrigger.click();
    await page.waitForTimeout(400);

    const drawer = page.locator('#mobile-nav-drawer');
    const isDrawerVisible = await drawer.isVisible();
    console.log('   Mobile drawer opened successfully:', isDrawerVisible);
    if (!isDrawerVisible) {
      throw new Error('Mobile drawer failed to open upon clicking menu trigger');
    }

    // Verify drawer links
    const kitLink = page.locator('#mobile-nav-drawer a[href*="kit-builder"]');
    const isKitLinkVisible = await kitLink.isVisible();
    console.log('   Drawer Move-In Bundles link is visible:', isKitLinkVisible);

    // Test close button
    const closeBtn = page.locator('#mobile-nav-drawer button[aria-label="Close navigation menu"]');
    await closeBtn.click();
    await page.waitForTimeout(400);
    const isDrawerClosed = !(await drawer.isVisible());
    console.log('   Mobile drawer closed successfully with close button:', isDrawerClosed);
    if (!isDrawerClosed) {
      throw new Error('Mobile drawer failed to close upon clicking close button');
    }

    // Re-open and test Escape key
    await mobileMenuTrigger.click();
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const isDrawerClosedByEsc = !(await drawer.isVisible());
    console.log('   Mobile drawer closed successfully with Escape key:', isDrawerClosedByEsc);
    if (!isDrawerClosedByEsc) {
      throw new Error('Mobile drawer failed to close upon pressing Escape key');
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
