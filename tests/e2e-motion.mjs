import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseURL = process.env.BASE_URL || 'http://localhost:3000'

const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({ viewport: { height: 900, width: 1440 } })
  const failedImages = []
  const consoleErrors = []
  const pageErrors = []
  page.on('response', (response) => {
    if (response.request().resourceType() === 'image' && !response.ok()) failedImages.push(response.url())
  })
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(`${baseURL}/en`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-home-hero]')?.getAttribute('data-motion-state') === 'complete')

  const hero = await page.locator('[data-home-hero-image] img').evaluate((image) => ({
    naturalWidth: image.naturalWidth,
    src: image.currentSrc,
  }))
  assert.ok(hero.naturalWidth > 0, 'Hero image must decode successfully')
  assert.match(decodeURIComponent(hero.src), /assets\/homepage\/hero-split\.png/, 'Seeded Hero media must use the deployed fallback')
  assert.equal(failedImages.length, 0, `Image requests failed: ${failedImages.join(', ')}`)

  const materialFontRequests = await page.evaluate(() =>
    performance.getEntriesByType('resource').filter((entry) => entry.name.includes('fonts-a39f5c6f')).length,
  )
  assert.equal(materialFontRequests, 0, 'Material Symbols stylesheet must not load')

  await page.locator('[data-home-comparison]').scrollIntoViewIfNeeded()
  await page.waitForTimeout(550)
  const comparisonTransform = await page.locator('[data-comparison-focus]').first().evaluate((el) => getComputedStyle(el).transform)
  assert.ok(comparisonTransform === 'none' || comparisonTransform.includes('matrix(1, 0, 0, 1, 0, 0)'))

  await page.goto(`${baseURL}/en/1-bedroom-kit-builder`, { waitUntil: 'domcontentloaded' })
  const roomButtons = page.locator('[aria-label][role="group"] button')
  const roomImageSwap = page.locator('[data-animated-image-swap]').first()
  const expectedRoomImages = [
    '/assets/homepage/hero-split.png',
    '/assets/1-bedroom-kit-builder/188581c175.png',
    '/assets/1-bedroom-kit-builder/da48e93272.png',
  ]
  for (let index = 0; index < expectedRoomImages.length; index += 1) {
    await roomButtons.nth(index).click()
    await page.waitForFunction(
      (expectedPath) =>
        document.querySelector('[data-animated-image-swap]')?.getAttribute('data-requested-src') === expectedPath &&
        !document.querySelector('[data-animated-image-swap] [data-image-layer="incoming"]'),
      expectedRoomImages[index],
    )
    assert.equal(await roomButtons.nth(index).getAttribute('aria-pressed'), 'true')
    assert.equal(await roomImageSwap.getAttribute('data-requested-src'), expectedRoomImages[index])
    assert.ok(await roomImageSwap.locator('img').evaluate((image) => image.naturalWidth > 0))
  }
  await roomButtons.nth(1).click()
  await roomButtons.nth(2).click()
  await roomButtons.nth(0).click()
  await page.waitForTimeout(500)
  assert.equal(await page.locator('[data-animated-image-swap] [data-image-layer="incoming"]').count(), 0)
  assert.equal(await roomButtons.nth(0).getAttribute('aria-pressed'), 'true')

  const continuity = await browser.newPage({ viewport: { height: 900, width: 1440 } })
  await continuity.route(/188581c175/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 120))
    await route.continue()
  })
  await continuity.goto(`${baseURL}/en/1-bedroom-kit-builder`, { waitUntil: 'domcontentloaded' })
  await continuity.locator('[aria-label][role="group"] button').nth(1).click()
  await continuity.waitForFunction(() => {
    const incoming = document.querySelector('[data-animated-image-swap] [data-image-layer="incoming"]')
    if (!incoming) return false
    const opacity = Number.parseFloat(getComputedStyle(incoming).opacity)
    return opacity > 0 && opacity < 1
  })
  const transitionState = await continuity.locator('[data-animated-image-swap]').evaluate((root) => {
    const current = root.querySelector('[data-image-layer="current"]')
    const image = current?.querySelector('img')
    return {
      currentOpacity: current ? getComputedStyle(current).opacity : null,
      currentReady: Boolean(image?.complete && image.naturalWidth > 0),
    }
  })
  assert.equal(transitionState.currentOpacity, '1', 'The current image must remain fully opaque while the next image enters')
  assert.equal(transitionState.currentReady, true, 'A decoded current image must cover the swap container throughout the transition')
  await continuity.waitForFunction(() => !document.querySelector('[data-animated-image-swap] [data-image-layer="incoming"]'))
  assert.ok(await continuity.locator('[data-animated-image-swap] img').evaluate((image) => image.naturalWidth > 0))
  await continuity.close()

  await page.goto(`${baseURL}/en/products/modusofa`, { waitUntil: 'domcontentloaded' })
  const thumbnails = page.locator('button[aria-label^="View angle"]')
  if ((await thumbnails.count()) > 1) {
    await thumbnails.nth(0).click()
    assert.equal(await thumbnails.nth(0).getAttribute('aria-pressed'), 'true')
    await thumbnails.nth(1).click()
    assert.equal(await thumbnails.nth(1).getAttribute('aria-pressed'), 'true')
    assert.equal(await thumbnails.nth(0).getAttribute('aria-pressed'), 'false')
    await thumbnails.nth(0).click()
    await page.waitForTimeout(500)
    assert.equal(await page.locator('[data-animated-image-swap] [data-image-layer="incoming"]').count(), 0)
  }

  const searchTrigger = page.getByRole('button', { name: 'Search', exact: true }).first()
  await searchTrigger.click()
  const searchDialog = page.getByRole('dialog', { name: 'Search' })
  const searchInput = searchDialog.locator('input[type="search"]')
  await searchInput.fill('sofa')
  await searchInput.press('Escape')
  await page.waitForTimeout(100)
  assert.equal(await searchDialog.isVisible(), false, 'The first Escape must close search even when the search input has a value')

  await page.goto(`${baseURL}/en/us-vs-ikea`, { waitUntil: 'domcontentloaded' })
  assert.equal(await page.locator('main#main').count(), 1, 'IKEA comparison must expose the global skip-link target')
  assert.equal(await page.title(), 'Vs IKEA | The Flat Set')

  await page.setViewportSize({ height: 844, width: 390 })
  await page.goto(`${baseURL}/en`, { waitUntil: 'domcontentloaded' })
  const menu = page.locator('#mobile-menu-trigger')
  await menu.click()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(350)
  assert.equal(await menu.evaluate((element) => document.activeElement === element), true)

  const reduced = await browser.newPage({ reducedMotion: 'reduce', viewport: { height: 844, width: 390 } })
  await reduced.goto(`${baseURL}/en`, { waitUntil: 'domcontentloaded' })
  const reducedTransform = await reduced.locator('[data-home-hero-copy]').first().evaluate((el) => getComputedStyle(el).transform)
  assert.equal(reducedTransform, 'none')
  await reduced.close()

  const rtl = await browser.newPage({ viewport: { height: 844, width: 390 } })
  await rtl.goto(`${baseURL}/ar`, { waitUntil: 'domcontentloaded' })
  assert.equal(await rtl.locator('html').getAttribute('dir'), 'rtl')
  assert.ok(await rtl.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1))
  await rtl.close()

  const chinese = await browser.newPage({ viewport: { height: 900, width: 1440 } })
  await chinese.goto(`${baseURL}/zh-CN`, { waitUntil: 'domcontentloaded' })
  await chinese.waitForFunction(() => document.querySelector('[data-home-hero]')?.getAttribute('data-motion-state') === 'complete')
  assert.equal(await chinese.locator('h1').isVisible(), true)
  assert.ok(await chinese.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1))
  await chinese.close()

  const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { height: 844, width: 390 } })
  await noJS.goto(`${baseURL}/en`, { waitUntil: 'load' })
  assert.equal(await noJS.locator('h1').isVisible(), true)
  assert.ok((await noJS.locator('[data-home-hero-image] img').evaluate((image) => image.naturalWidth)) > 0)
  await noJS.close()

  assert.equal(consoleErrors.length, 0, `Console errors: ${consoleErrors.join('\n')}`)
  assert.equal(pageErrors.length, 0, `Page errors: ${pageErrors.join('\n')}`)
  console.log('Motion, reduced-motion, image continuity, cart navigation, and no-JS checks passed.')
} finally {
  await browser.close()
}
