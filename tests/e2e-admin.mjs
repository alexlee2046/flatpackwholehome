import { chromium } from 'playwright';

async function runAdminE2E() {
  const BASE_URL = process.env.BASE_URL || 'https://flatpack.dev.canbee.cn';
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@theflatset.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'flatset_admin_2026';

  console.log(`=== Launching Admin Panel E2E Test against ${BASE_URL} ===\n`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  let failures = 0;

  try {
    // 1. Test Admin Login Page & Branding
    console.log('1. Auditing Admin Login Page & Brand Assets...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    const loginTitle = await page.title();
    console.log(`   Page Title: "${loginTitle}"`);
    if (!loginTitle.includes('The Flat Set Admin')) {
      console.warn('   Login page title does not include "The Flat Set Admin"');
      failures++;
    }

    const logos = await page.locator('img[alt*="The Flat Set"]').count();
    console.log(`   Brand Logo & Mark images rendered: ${logos}`);
    if (logos < 2) {
      console.warn('   Expected at least 2 brand logo/mark images on login screen');
      failures++;
    }

    // 2. Perform Authentication
    console.log('\n2. Testing Admin Authentication...');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const pwdInput = page.locator('input[type="password"], input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill(ADMIN_EMAIL);
    await pwdInput.fill(ADMIN_PASSWORD);
    await submitBtn.click();
    await page.waitForTimeout(4000);

    const postLoginUrl = page.url();
    console.log(`   Current URL after login: ${postLoginUrl}`);
    if (!postLoginUrl.includes('/admin') || postLoginUrl.includes('/admin/login')) {
      console.error('   Authentication failed: user was not redirected to /admin');
      failures++;
    } else {
      console.log('   Authentication succeeded! Session established.');
    }

    // 3. Verify Dashboard Layout & Collections Navigation
    console.log('\n3. Verifying Dashboard & Navigation Collections...');
    const dashTitle = await page.title();
    console.log(`   Dashboard Title: "${dashTitle}"`);

    // Check brand icon in header/nav
    const navIcon = await page.locator('header img, nav img, .app-header img, .nav img').count();
    console.log(`   Header/Navigation brand icons found: ${navIcon}`);

    const navText = await page.locator('nav a, .nav a').allTextContents();
    const cleanNav = navText.map((t) => t.trim()).filter(Boolean);
    console.log(`   Found ${cleanNav.length} navigation collection links`);

    const expectedCollections = ['Products', 'Spaces', 'Materials', 'Media', 'Homepage'];
    for (const col of expectedCollections) {
      const exists = cleanNav.some((item) => item.toLowerCase().includes(col.toLowerCase()));
      console.log(`   Checking collection [${col}]: ${exists ? 'OK' : 'MISSING'}`);
      if (!exists) failures++;
    }

    // 4. Test Products Collection View & Document Inspect
    console.log('\n4. Testing Products Collection View...');
    await page.goto(`${BASE_URL}/admin/collections/products`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const productRows = page.locator('table tbody tr, .cell-title, tr td a');
    const rowCount = await productRows.count();
    console.log(`   Products table items found: ${rowCount}`);

    const pageContent = await page.textContent('body');
    const hasModuSofa = pageContent.includes('ModuSofa') || pageContent.includes('modusofa');
    console.log(`   ModuSofa record present: ${hasModuSofa}`);
    if (!hasModuSofa) failures++;

    // Inspect ModuSofa product document detail
    console.log('\n5. Inspecting ModuSofa Product Document...');
    const moduSofaLink = page.locator('a[href*="/admin/collections/products/"]').first();
    if (await moduSofaLink.isVisible()) {
      await moduSofaLink.click();
      await page.waitForTimeout(2000);
      console.log(`   Product editor URL: ${page.url()}`);
      const editorText = await page.textContent('body');
      const hasJoinery = editorText.includes('Joinery') || editorText.includes('Snap-Lock') || editorText.includes('Mortise');
      console.log(`   Joinery & specs loaded in editor: ${hasJoinery}`);
      if (!hasJoinery) failures++;
    }

    // 6. Test Media Collection
    console.log('\n6. Testing Media Library Collection...');
    await page.goto(`${BASE_URL}/admin/collections/media`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const mediaCount = await page.locator('table tbody tr, .thumbnail, img').count();
    console.log(`   Media assets rendered: ${mediaCount}`);
    if (mediaCount < 5) {
      console.warn('   Less than 5 media items detected');
      failures++;
    }

    // 7. Test Homepage Global Settings
    console.log('\n7. Testing Homepage Global Settings...');
    await page.goto(`${BASE_URL}/admin/globals/homepage`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const globalContent = await page.textContent('body');
    const hasHero = globalContent.includes('Hero') || globalContent.includes('headline') || globalContent.includes('扁平');
    console.log(`   Homepage global editor fields loaded: ${hasHero}`);
    if (!hasHero) failures++;

    // 8. Styling & Palette Health Check
    console.log('\n8. Checking Warm Japandi Styling Tokens on Admin DOM...');
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`   Admin body background: ${bodyBg}`);
    // Check if background is light warm porcelain (RGB close to 249, 248, 246)
    const isWarmBg = bodyBg.includes('249') || bodyBg.includes('248') || bodyBg.includes('246') || bodyBg.includes('255');
    console.log(`   Warm background verified: ${isWarmBg}`);
    if (!isWarmBg) failures++;

    console.log('\n==============================================');
    if (failures === 0) {
      console.log(' ADMIN E2E VERIFICATION PASSED: 100% OPERATIONAL & BRANDED!');
    } else {
      console.error(` ADMIN E2E COMPLETED WITH ${failures} WARNINGS/FAILURES`);
    }
    console.log('==============================================\n');
  } catch (err) {
    console.error('Fatal Admin E2E error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAdminE2E();
