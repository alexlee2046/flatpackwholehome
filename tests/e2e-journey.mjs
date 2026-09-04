import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseURL = process.env.BASE_URL || 'http://localhost:3000'
const browser = await chromium.launch({ headless: true })

async function open(page, path) {
  await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.setItem('tfs_geo_dismissed', 'true'))
}

try {
  const page = await browser.newPage({ viewport: { height: 900, width: 1440 } })
  const consoleErrors = []
  const failedImages = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.request().resourceType() === 'image' && response.status() >= 400) {
      failedImages.push(`${response.status()} ${response.url()}`)
    }
  })

  await open(page, '/en')
  await page.keyboard.press('Tab')
  assert.equal(await page.locator('.skip-link').evaluate((node) => node === document.activeElement), true)

  const trustStrip = (await page.locator('[data-home-stat]').allTextContents()).join(' ')
  assert.match(trustStrip, /6/)
  assert.match(trustStrip, /0/)
  assert.doesNotMatch(trustStrip.toLowerCase(), /verified reviews/)

  await open(page, '/en/1-bedroom-kit-builder')
  const builderImage = page.locator('[data-animated-image-swap] img').first()
  await builderImage.waitFor({ state: 'visible' })
  await page.waitForFunction(() => {
    const image = document.querySelector('[data-animated-image-swap] img')
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
  })
  assert.ok((await page.locator('[data-animated-image-swap]').first().boundingBox()).height > 200)

  const roomButtons = page.locator('[role="group"][aria-label] button')
  await roomButtons.nth(1).click()
  await roomButtons.nth(2).click()
  await roomButtons.nth(0).click()
  await page.waitForTimeout(500)
  assert.equal(await page.locator('[data-image-layer="incoming"]').count(), 0)
  assert.ok(await builderImage.evaluate((image) => image.naturalWidth > 0))

  await open(page, '/en/products/modusofa')
  const displayedPrice = (await page.locator('[data-product-price]').textContent()).trim()
  const addButton = page.locator('[data-pdp-add]')
  const purchaseAvailable = (await addButton.count()) === 1
  const structuredProductPrice = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => {
        try { return JSON.parse(script.textContent || '{}') } catch { return null }
      })
      .find((value) => value?.['@type'] === 'Product')?.offers?.price,
  )
  if (purchaseAvailable) {
    assert.ok((await addButton.textContent()).includes(displayedPrice), 'PDP price and CTA amount must match')
    assert.equal(structuredProductPrice, 699, 'Product structured data must expose dollars, not cents')
  } else {
    assert.equal(await page.locator('[data-pdp-purchase-unavailable]').isVisible(), true)
    assert.equal(structuredProductPrice, undefined, 'Unavailable catalog data must not emit a live offer')
  }

  const fabricButtons = page.locator('button[aria-label^="Select "]')
  assert.equal(await fabricButtons.count(), 4)
  const fabricLabels = (await fabricButtons.allTextContents()).join(' ').toLowerCase()
  assert.doesNotMatch(fabricLabels, /walnut|oak/)
  await fabricButtons.first().scrollIntoViewIfNeeded()
  await page.waitForFunction(() =>
    [...document.querySelectorAll('button[aria-label^="Select "] img')]
      .every((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0),
  )
  for (const image of await fabricButtons.locator('img').all()) {
    assert.ok(await image.evaluate((node) => node.complete && node.naturalWidth > 0))
  }

  await fabricButtons.nth(1).click()
  await page.getByRole('button', { name: 'Smoked Walnut', exact: true }).click()
  const visualConfiguration = page.locator('[data-product-visual-configuration]')
  const configurationSummary = page.locator('[data-pdp-configuration-summary]')
  assert.match(await visualConfiguration.innerText(), /Cream Bouclé/)
  assert.match(await visualConfiguration.innerText(), /Smoked Walnut/)
  assert.match(await configurationSummary.innerText(), /Cream Bouclé/)
  assert.match(await configurationSummary.innerText(), /Smoked Walnut/)

  if (purchaseAvailable) await addButton.click()
  await open(page, '/en/cart')
  await page.waitForTimeout(250)
  if (purchaseAvailable) {
    const checkout = page.locator('#checkout-btn')
    if (await checkout.isDisabled()) {
      assert.equal(await page.locator('a[href^="mailto:concierge@theflatset.com"]').isVisible(), true)
      assert.equal(await page.getByText(/Apple Pay and Google Pay/).count(), 0)
    }
  } else {
    assert.equal(await page.getByText('Your Cart is Empty').isVisible(), true)
  }

  await open(page, '/en/free-swatch-box-material-discovery')
  const swatchCopy = (await page.locator('main').innerText()).toLowerCase()
  assert.match(swatchCopy, /\$5/)
  assert.doesNotMatch(swatchCopy, /ships free|free ddp delivery/)
  const swatchHoneypot = page.locator('input[name="website"]')
  if ((await swatchHoneypot.count()) === 1) {
    assert.equal(await swatchHoneypot.getAttribute('type'), 'hidden')
  } else {
    assert.equal(await page.locator('form').count(), 0, 'Disabled swatch fulfillment must not collect an address')
    assert.equal(await page.locator('a[href^="mailto:concierge@theflatset.com"]').first().isVisible(), true)
  }

  await page.setViewportSize({ height: 844, width: 390 })
  await open(page, '/en/1-bedroom-kit-builder')
  const kitAdd = page.locator('#kit-add')
  if ((await kitAdd.count()) === 1) {
    assert.equal(await kitAdd.isVisible(), false)
    await page.locator('[data-kit-customizer]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    assert.equal(await kitAdd.isVisible(), true)
    const purchaseBar = await kitAdd.locator('xpath=ancestor::div[contains(@class,"fixed")]').boundingBox()
    assert.ok(purchaseBar && purchaseBar.height < 120, `Mobile purchase bar is too tall: ${purchaseBar?.height}`)
  } else {
    await page.locator('[data-kit-customizer]').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => {
      const unavailable = document.querySelector('[data-kit-purchase-unavailable]')
      return unavailable instanceof HTMLElement && unavailable.offsetParent !== null
    })
    assert.equal(await page.locator('[data-kit-purchase-unavailable]').isVisible(), true)
  }

  await open(page, '/en/products/modusofa')
  assert.equal(await page.locator('[data-mobile-purchase-bar]').count(), 0)
  if ((await page.locator('#pdp-add').count()) === 1) {
    await page.locator('[data-pdp-configurator-start]').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelector('[data-mobile-purchase-bar]'))
    await page.locator('#pdp-add').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => !document.querySelector('[data-mobile-purchase-bar]'))
  } else {
    assert.equal(await page.locator('[data-pdp-purchase-unavailable]').isVisible(), true)
  }

  await open(page, '/en')
  await page.locator('#mobile-menu-trigger').click()
  assert.equal(await page.locator('#mobile-nav-drawer').getAttribute('aria-modal'), 'true')
  assert.equal(await page.locator('main').evaluate((node) => node.inert), true)
  for (let index = 0; index < 20; index += 1) await page.keyboard.press('Tab')
  assert.equal(
    await page.evaluate(() => document.querySelector('#mobile-nav-drawer')?.contains(document.activeElement)),
    true,
    'Keyboard focus must stay inside the mobile drawer',
  )
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('main').evaluate((node) => node.inert), false)

  await page.locator('[data-home-comparison]').scrollIntoViewIfNeeded()
  assert.ok((await page.locator('[data-home-comparison] article').count()) >= 4)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1))

  await open(page, '/ar')
  const announcement = page.locator('aside[aria-label]').filter({ hasText: /./ }).first()
  assert.ok((await announcement.innerText()).trim().length > 10)
  assert.equal(await page.locator('header a[aria-label="The Flat Set — Home"]').getAttribute('dir'), 'ltr')
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl')

  for (const locale of ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru']) {
    await open(page, `/${locale}`)
    await page.waitForFunction(() => document.querySelector('[data-home-hero]')?.getAttribute('data-motion-state') === 'complete')
    assert.equal(await page.locator('h1').isVisible(), true, `${locale} homepage must have a visible h1`)
  }

  assert.equal(failedImages.length, 0, `Failed image requests:\n${failedImages.join('\n')}`)
  assert.equal(consoleErrors.length, 0, `Console errors:\n${consoleErrors.join('\n')}`)
  console.log('Critical purchase journey, responsive UX, localization, and accessibility checks passed.')
} finally {
  await browser.close()
}
