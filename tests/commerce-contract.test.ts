import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CheckoutItemUnavailableError,
  createCheckoutQuote,
  resolveStorefrontItems,
} from '../src/lib/commerce/checkoutQuote'
import { expectedOptionTypesForProduct } from '../src/lib/commerce/catalogEligibility'
import { calculateDDPQuote } from '../src/lib/commerce/ddp'
import {
  parseCheckoutQuoteResponse,
  verifyCanonicalCheckoutCart,
} from '../src/lib/commerce/checkoutPaymentClient'
import { isVerifiedVoucherCode } from '../src/lib/commerce/voucherServer'
import {
  findStorefrontVariant,
  migrateLegacyCartItems,
} from '../src/lib/commerce/storefrontCart'

const products = [
  {
    _status: 'published',
    enableVariants: true,
    id: 1,
    inventory: 100,
    packedVolumeCbm: 0.37,
    priceInUSD: 69900,
    priceInUSDEnabled: true,
    slug: 'modusofa',
    variantTypes: ['upholstery', 'wood-finish'],
  },
  {
    _status: 'published',
    enableVariants: false,
    id: 2,
    inventory: 100,
    packedVolumeCbm: 0.1,
    priceInUSD: 15000,
    priceInUSDEnabled: true,
    slug: 'king-bed-upgrade',
  },
]
const variants = [
  {
    _status: 'published',
    id: 11,
    inventory: 100,
    priceInUSD: 69900,
    priceInUSDEnabled: true,
    product: 1,
    options: [
      { id: 1, label: 'Cream Bouclé', type: 'upholstery', value: 'boucle' },
      { id: 2, label: 'Smoked Walnut', type: 'wood-finish', value: 'walnut' },
    ],
  },
]
const payload = {
  async find({ where }: any) {
    const requested = where.and?.find((clause: any) => clause.slug)?.slug?.in || []
    return { docs: products.filter((product) => requested.includes(product.slug)) }
  },
  async findByID({ collection, id }: any) {
    return collection === 'products'
      ? products.find((product) => product.id === id)
      : variants.find((variant) => variant.id === id)
  },
} as any

test('legacy bundle carts migrate to the real product slug', () => {
  assert.equal(
    migrateLegacyCartItems([
      { id: 'bundle-1bed', name: 'Old bundle', price: 149900, qty: 1, variant: '' },
    ])[0]?.id,
    '1-bedroom-kit',
  )
})

test('non-configurable products do not inherit furniture controls from their product category', () => {
  assert.deepEqual(
    expectedOptionTypesForProduct({ slug: 'mattress', variantTypes: [] }),
    [],
  )
  assert.deepEqual(
    expectedOptionTypesForProduct({ slug: 'king-bed-upgrade', variantTypes: [] }),
    [],
  )
})

test('variant selection resolves by stable option values', () => {
  const selected = findStorefrontVariant(
    [
      {
        id: 11,
        price: 69900,
        options: [
          { id: 1, label: 'Cream Bouclé', type: 'upholstery', value: 'boucle' },
          { id: 2, label: 'Smoked Walnut', type: 'wood-finish', value: 'walnut' },
        ],
      },
    ],
    { upholstery: 'boucle', 'wood-finish': 'walnut' },
  )
  assert.equal(selected?.id, 11)
})

test('server quote is derived from catalog and includes DDP components', async () => {
  const items = await resolveStorefrontItems({
    lines: [
      { productSlug: 'modusofa', quantity: 1, variant: 11 },
      { productSlug: 'king-bed-upgrade', quantity: 1 },
    ],
    payload,
  })
  const quote = await createCheckoutQuote({ countryCode: 'US', items, payload })
  const expected = calculateDDPQuote({ countryCode: 'US', packedCbm: 0.47, subtotalInUSD: 84900 })

  assert.equal(quote.subtotalCents, 84900)
  assert.equal(quote.shippingAndImportCents, expected.shippingAndImportInUSD)
  assert.equal(quote.totalCents, expected.landedTotalInUSD)
  assert.deepEqual(quote.items, [
    { product: 1, quantity: 1, variant: 11 },
    { product: 2, quantity: 1 },
  ])
  assert.deepEqual(parseCheckoutQuoteResponse(quote), quote)
  assert.equal(parseCheckoutQuoteResponse({ ...quote, deliveryDays: undefined }), null)
  assert.equal(parseCheckoutQuoteResponse({ ...quote, totalCents: quote.totalCents + 1 }), null)

  const historicalVoucherCode = 'SWATCH50-AAAAAAAAAA-BBBBBBBBBB'
  assert.equal(isVerifiedVoucherCode(historicalVoucherCode), false)

  const voucherQuote = await createCheckoutQuote({
    countryCode: 'US',
    items,
    payload,
    voucherCode: historicalVoucherCode,
  })
  assert.equal(voucherQuote.discountCents, 0)
  assert.equal(voucherQuote.totalCents, quote.totalCents)
})

test('checkout cart verification rejects every malformed returned line', () => {
  const expectedItems = [{ product: 1, quantity: 1, variant: 11 }]
  assert.equal(
    verifyCanonicalCheckoutCart(
      {
        id: 9,
        items: [
          ...expectedItems,
          { product: 'invalid', quantity: 1 },
        ],
        subtotal: 69900,
      },
      expectedItems,
      69900,
    ),
    null,
  )
})

test('variant-enabled products cannot be quoted without a real variant ID', async () => {
  await assert.rejects(
    createCheckoutQuote({
      countryCode: 'US',
      items: [{ product: 1, quantity: 1 }],
      payload,
    }),
    (error: unknown) =>
      error instanceof CheckoutItemUnavailableError && error.code === 'VARIANT_REQUIRED',
  )
})
