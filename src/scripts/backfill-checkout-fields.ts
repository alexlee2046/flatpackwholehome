import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * One-off backfill for the three product fields the DDP checkout adapter refuses
 * a cart without: a USD-enabled price, a positive packed volume, and integer
 * inventory. They were never set, so every checkout threw
 * CheckoutItemUnavailableError before reaching Stripe.
 *
 * Volume and weight are derived from boxCount at roughly 0.2 cbm and 17 kg per
 * flat box. DDP freight is charged by volume, so replace these with measured
 * carton dimensions before going live.
 *
 * Run with: pnpm tsx src/scripts/backfill-checkout-fields.ts
 */
async function main() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 500,
    overrideAccess: true,
  })

  for (const doc of docs) {
    const boxCount = typeof doc.boxCount === 'number' && doc.boxCount > 0 ? doc.boxCount : 1
    const data: Record<string, unknown> = {}

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
    console.log(`  ${doc.slug}: set ${Object.keys(data).join(', ')}`)
  }

  console.log('done')
  process.exit(0)
}

void main()
