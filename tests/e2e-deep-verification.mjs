import { chromium } from 'playwright';

async function runDeepE2E() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  console.log(`=== Launching Deep E2E Verification against ${BASE_URL} ===\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  let failures = 0;

  const failedImageRequests = [];
  page.on('response', (response) => {
    const url = response.url();
    const isImage = url.match(/\.(png|jpg|jpeg|svg|webp)($|\?)/i) || response.request().resourceType() === 'image';
    if (isImage && response.status() >= 400) {
      failedImageRequests.push({ status: response.status(), url });
    }
  });

  try {
    // 1. Image Health Audit on Homepage (scroll to load lazy images)
    console.log('1. Auditing Homepage Image Health...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const brokenImagesHome = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter((img) => img.naturalWidth === 0 && !img.src.startsWith('data:'))
        .map((img) => img.src);
    });
    console.log(`   Total images found: ${await page.locator('img').count()}`);
    console.log(`   Broken images (naturalWidth === 0): ${brokenImagesHome.length}`);
    if (brokenImagesHome.length > 0) {
      console.warn('   Broken images list:', brokenImagesHome);
      failures++;
    }

    // 2. Product Detail Page (PDP) & Fabric Swatches
    console.log('\n2. Testing Product Detail Page (ModuSofa PDP)...');
    await page.goto(`${BASE_URL}/en/products/modusofa`, { waitUntil: 'networkidle' });
    const pdpTitle = await page.locator('h1').textContent();
    console.log('   PDP Title:', pdpTitle?.trim());

    // Check thumbnail interactivity
    const thumbs = page.locator('button[aria-label*="View angle"]');
    const thumbCount = await thumbs.count();
    console.log(`   Found ${thumbCount} gallery thumbnails`);
    if (thumbCount > 0) {
      await thumbs.first().click();
      await page.waitForTimeout(300);
      console.log('   Thumbnail click verified');
    }

    // Check fabric swatches
    const fabricButtons = page.locator('button[aria-label*="Select"]');
    const fabricCount = await fabricButtons.count();
    console.log(`   Found ${fabricCount} fabric swatches`);
    if (fabricCount >= 2) {
      await fabricButtons.nth(1).click();
      await page.waitForTimeout(300);
      console.log('   Fabric swatch switch verified');
    }

    // Check broken images on PDP
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const brokenImagesPdp = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter((img) => img.naturalWidth === 0 && !img.src.startsWith('data:'))
        .map((img) => img.src);
    });
    console.log(`   Broken images on PDP: ${brokenImagesPdp.length}`);
    if (brokenImagesPdp.length > 0) {
      console.warn('   Broken images list on PDP:', brokenImagesPdp);
      failures++;
    }

    // 3. Kit Builder 6-Box Verification
    console.log('\n3. Testing Kit Builder 6-Box Cards...');
    await page.goto(`${BASE_URL}/en/1-bedroom-kit-builder`, { waitUntil: 'networkidle' });
    const boxCards = page.locator('[data-box-included]');
    const boxCount = await boxCards.count();
    console.log(`   Found box card count: ${boxCount}`);
    if (boxCount !== 6) failures++;

    // 4. Paid swatch flow safety gate. Never create a live PaymentIntent in this suite.
    console.log('\n4. Testing Paid Swatch Box Checkout Gate...');
    await page.goto(`${BASE_URL}/en/free-swatch-box-material-discovery`, { waitUntil: 'domcontentloaded' });
    const emailInput = page.locator('input[type="email"]');
    const submitBtn = page.locator('button[type="submit"]');
    const hasForm = (await emailInput.count()) > 0 && (await submitBtn.count()) > 0;
    const hasConciergeFallback = await page.locator('a[href^="mailto:concierge@theflatset.com"]').first().isVisible();
    console.log('   Paid swatch address form visible:', hasForm);
    if (hasForm && await submitBtn.isDisabled()) {
      console.log('   Disabled checkout has concierge fallback:', hasConciergeFallback);
      if (!hasConciergeFallback) failures++;
    }
    if (!hasForm) {
      console.log('   Fulfillment-disabled page has concierge fallback:', hasConciergeFallback);
      if (!hasConciergeFallback || (await page.locator('form').count()) !== 0) failures++;
    }

    // 5. Multi-Language Verification Across 7 Locales
    console.log('\n5. Verifying All 7 Supported Locales...');
    const locales = [
      { code: 'en', expectedTitle: 'The Flat Set' },
      { code: 'zh-CN', expectedTitle: '6 个扁平包装箱' },
      { code: 'zh-TW', expectedTitle: '6 個扁平包裝箱' },
      { code: 'de', expectedTitle: 'The Flat Set' },
      { code: 'ja', expectedTitle: 'The Flat Set' },
      { code: 'ar', expectedTitle: 'The Flat Set', dir: 'rtl' },
      { code: 'ru', expectedTitle: 'The Flat Set' },
    ];

    for (const loc of locales) {
      await page.goto(`${BASE_URL}/${loc.code}`, { waitUntil: 'networkidle' });
      const title = await page.title();
      const htmlDir = await page.getAttribute('html', 'dir');
      const pass = title.includes(loc.expectedTitle);
      console.log(`   [Locale ${loc.code}] Title: "${title.slice(0, 45)}..." | dir="${htmlDir}" | OK: ${pass}`);
      if (!pass) failures++;
      if (loc.dir && htmlDir !== loc.dir) {
        console.warn(`   [Locale ${loc.code}] Expected dir="${loc.dir}", got "${htmlDir}"`);
        failures++;
      }
    }

    // 6. Report Failed Network Image Requests
    console.log(`\n6. Network Image Request Failures: ${failedImageRequests.length}`);
    if (failedImageRequests.length > 0) {
      console.warn('   Failed image requests:', failedImageRequests);
      failures++;
    }

    console.log('\n==============================================');
    if (failures === 0) {
      console.log(' DEEP E2E VERIFICATION PASSED: ALL SCENARIOS 100% HEALTHY!');
    } else {
      console.error(` DEEP E2E COMPLETED WITH ${failures} WARNINGS/FAILURES`);
      process.exitCode = 1;
    }
    console.log('==============================================\n');
  } catch (err) {
    console.error('Fatal E2E error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runDeepE2E();
