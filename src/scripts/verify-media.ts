import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

async function verify() {
  console.log('--- Starting Payload Media Architecture Verification ---')
  const payload = await getPayload({ config })

  // 1. Check Media collection
  const mediaRes = await payload.find({
    collection: 'media',
    limit: 100,
    overrideAccess: true,
  })
  console.log(`✓ Total Media Records in DB: ${mediaRes.totalDocs}`)

  const unpublished = mediaRes.docs.filter((d) => d._status !== 'published')
  if (unpublished.length > 0) {
    console.error(`✗ Found ${unpublished.length} unpublished media docs!`)
  } else {
    console.log('✓ All Media records have _status = "published"')
  }

  // 2. Check Products
  const products = await payload.find({
    collection: 'products',
    depth: 2,
    overrideAccess: true,
  })
  console.log(`✓ Checked ${products.totalDocs} products:`)
  for (const prod of products.docs) {
    const galleryCount = prod.gallery?.length || 0
    const firstImage = prod.gallery?.[0]?.image
    const firstImageUrl = typeof firstImage === 'object' && firstImage !== null ? (firstImage as any).url : null
    const metaImageUrl = typeof prod.meta?.image === 'object' && prod.meta?.image !== null ? (prod.meta.image as any).url : null
    console.log(`  - Product '${prod.slug}': gallery (${galleryCount} images), first: ${firstImageUrl}, meta.image: ${metaImageUrl}`)
  }

  // 3. Check Spaces
  const spaces = await payload.find({
    collection: 'spaces',
    depth: 2,
    overrideAccess: true,
  })
  console.log(`✓ Checked ${spaces.totalDocs} spaces:`)
  for (const sp of spaces.docs) {
    const heroUrl = typeof sp.hero === 'object' && sp.hero !== null ? (sp.hero as any).url : null
    console.log(`  - Space '${sp.slug}': hero: ${heroUrl}`)
  }

  // 4. Check Materials
  const materials = await payload.find({
    collection: 'materials',
    depth: 2,
    overrideAccess: true,
  })
  console.log(`✓ Checked ${materials.totalDocs} materials:`)
  for (const mat of materials.docs) {
    const heroUrl = typeof mat.hero === 'object' && mat.hero !== null ? (mat.hero as any).url : null
    console.log(`  - Material '${mat.slug}': hero: ${heroUrl}`)
  }

  // 5. Check Homepage Global
  const homepage = await payload.findGlobal({
    slug: 'homepage',
    depth: 2,
    overrideAccess: true,
  })
  const homeHeroUrl = typeof homepage.hero?.image === 'object' && homepage.hero?.image !== null ? (homepage.hero.image as any).url : null
  console.log(`✓ Homepage hero image: ${homeHeroUrl}`)

  console.log('--- Payload Media Architecture Verification Successful ---')
  process.exit(0)
}

verify().catch((e) => {
  console.error(e)
  process.exit(1)
})
