import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Brings a product catalogue up to what checkout requires. Safe to re-run.
 *
 * 1. Prices to cents. Every consumer of a price expects minor units — the
 *    ecommerce plugin's own admin input converts on the way in, ddp.ts demands
 *    "a positive USD subtotal in cents", and Stripe is charged cents. A
 *    catalogue holding 699 for a $699 sofa gets charged $6.99. Pass
 *    --scale-prices to multiply every price by 100; without it prices are left
 *    alone, so the rest of this script is safe to re-run at any time.
 *
 * 2. The three fields the DDP adapter refuses a cart without:
 *    priceInUSDEnabled, a positive packedVolumeCbm, and integer inventory.
 *    None were ever set, so every checkout threw CheckoutItemUnavailableError
 *    before reaching Stripe.
 *
 * Volume and weight are derived from boxCount at roughly 0.2 cbm and 17 kg per
 * flat box. DDP freight is charged by volume, so replace these with measured
 * carton dimensions before taking real orders.
 *
 * Run with: pnpm tsx src/scripts/backfill-checkout-fields.ts [--scale-prices]
 */

/**
 * Price scaling is opt-in, not inferred. A heuristic like "under 10000 means
 * dollars" would silently multiply a genuinely $50 add-on — correctly stored as
 * 5000 cents — by a hundred on a second run. Pass --scale-prices exactly once,
 * against a catalogue you have confirmed is still in dollars.
 */
const SCALE_PRICES = process.argv.includes('--scale-prices')

async function main() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 500,
    overrideAccess: true,
  })

  let changed = 0

  for (const doc of docs) {
    const boxCount = typeof doc.boxCount === 'number' && doc.boxCount > 0 ? doc.boxCount : 1
    const data: Record<string, unknown> = {}

    if (SCALE_PRICES && typeof doc.priceInUSD === 'number' && doc.priceInUSD > 0) {
      data.priceInUSD = doc.priceInUSD * 100
    }
    if (doc.priceInUSDEnabled !== true) data.priceInUSDEnabled = true
    if (!doc.packedVolumeCbm || doc.packedVolumeCbm <= 0) {
      data.packedVolumeCbm = Number((boxCount * 0.2).toFixed(2))
    }
    if (!doc.shippingWeightKg || doc.shippingWeightKg <= 0) {
      data.shippingWeightKg = boxCount * 17
    }
    if (!Number.isInteger(doc.inventory) || (doc.inventory ?? 0) <= 0) data.inventory = 100

    if (Object.keys(data).length === 0) {
      console.log(`  ${doc.slug}: already complete`)
      continue
    }

    await payload.update({ id: doc.id, collection: 'products', data, overrideAccess: true })
    changed += 1
    console.log(`  ${doc.slug}: set ${Object.keys(data).join(', ')}`)
  }

  console.log(`done — ${changed} of ${docs.length} product(s) updated`)
  process.exit(0)
}

void main()
