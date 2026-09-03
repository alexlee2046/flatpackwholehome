import { FAQ_ITEMS } from '@/data/faq'
import type { Payload } from 'payload'

/**
 * Automatically seeds initial content into Payload CMS for FAQs, HowItWorks,
 * Homepage extended blocks, and Navigation if they haven't been seeded yet.
 * Safe and idempotent.
 */
export async function seedInitialContent(payload: Payload): Promise<void> {
  const p: any = payload
  try {
    // 1. Seed FAQs collection
    const existingFaqs = await p.find({
      collection: 'faqs',
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })

    if (existingFaqs.totalDocs === 0) {
      p.logger.info('[seedContent] Seeding initial FAQs into CMS...')
      for (let i = 0; i < FAQ_ITEMS.length; i++) {
        const item = FAQ_ITEMS[i]
        let category: 'general' | 'assembly' | 'shipping' | 'materials' | 'returns' = 'general'
        if (item.q.toLowerCase().includes('delivery') || item.q.toLowerCase().includes('ddp') || item.q.toLowerCase().includes('shipping')) {
          category = 'shipping'
        } else if (item.q.toLowerCase().includes('tool') || item.q.toLowerCase().includes('assemble')) {
          category = 'assembly'
        } else if (item.q.toLowerCase().includes('made of') || item.q.toLowerCase().includes('swatch')) {
          category = 'materials'
        } else if (item.q.toLowerCase().includes('return') || item.q.toLowerCase().includes('trial')) {
          category = 'returns'
        }

        await p.create({
          collection: 'faqs',
          data: {
            question: item.q,
            answer: item.a,
            category,
            order: (i + 1) * 10,
            isFeatured: true,
          },
          overrideAccess: true,
        })
      }
      p.logger.info(`[seedContent] Seeded ${FAQ_ITEMS.length} FAQs.`)
    }

    // 2. Seed HowItWorks global
    const currentHiw = await p.findGlobal({
      slug: 'how-it-works',
      depth: 0,
      overrideAccess: true,
    })

    if (!currentHiw?.steps || currentHiw.steps.length === 0) {
      p.logger.info('[seedContent] Seeding HowItWorks global steps...')
      await p.updateGlobal({
        slug: 'how-it-works',
        data: {
          hero: {
            eyebrow: 'CRAFT & LOGISTICS',
            title: 'From Workshop to Living Room in 6 Flat Boxes.',
            subtitle:
              'Every piece is made-to-order, compressed fresh, and shipped carbon-offset directly to your door with zero middleman markups and guaranteed DDP delivery.',
          },
          steps: [
            {
              stepNumber: '01',
              title: 'Made-to-Order & Fresh-Pressed',
              description:
                'We don’t warehouse dusty inventory. Your pieces are cut, tailored and fresh-pressed in our dedicated workshop within 48 hours of order confirmation. High-resilience HR45 foam is vacuum-sealed immediately upon curing to eliminate warehouse mold and fatigue.',
              badge: 'Direct Craft',
              metric: '48 Hrs',
              icon: 'precision_manufacturing',
            },
            {
              stepNumber: '02',
              title: '6 Flat Boxes Whole Apartment',
              description:
                'Your entire living, dining and bedroom solution is packed into 6 ultra-dense flat parcels (< 24 kg each, < 20 cm thick). Engineered to slip through the narrowest stairwells and small passenger elevators with ease.',
              badge: 'Compact Packaging',
              metric: '6 Boxes',
              icon: 'inventory_2',
            },
            {
              stepNumber: '03',
              title: 'Standard Couriers, No Freight Surcharges',
              description:
                'By keeping every box under standard carrier thresholds, your shipment travels via regular express parcel services (FedEx / UPS / DPD). No freight truck appointments, no 4-hour delivery windows, no $150+ walk-up fees.',
              badge: 'Small Parcel Express',
              metric: '0 Surprises',
              icon: 'local_shipping',
            },
            {
              stepNumber: '04',
              title: 'Zero-Drama DDP Doorstep Delivery',
              description:
                'Delivered Duty Paid (DDP). All international ocean freight, customs clearance, import tariffs and local taxes are 100% prepaid. The price you see at checkout is the absolute final price.',
              badge: 'Duties & Taxes Prepaid',
              metric: '14–18 Days',
              icon: 'verified_user',
            },
            {
              stepNumber: '05',
              title: '100% Tool-Free 60-Minute Snap Assembly',
              description:
                'Zero screws, zero Allen keys, zero loose hardware bags. Heavy-duty pre-installed stainless-steel Snap-Lock brackets click together by hand. ModuSofa assembles in 15 minutes; the whole apartment kit in 60 minutes solo.',
              badge: 'Snap-Lock Joint',
              metric: '0 Screws',
              icon: 'build_circle',
            },
            {
              stepNumber: '06',
              title: '100-Night Trial with Donation-Over-Return',
              description:
                'Live with it for 100 nights. If it doesn’t fit your lifestyle, we don’t ship heavy furniture back across oceans to landfills. We arrange free pickup by a vetted local charity and issue a 100% full refund on donation receipt.',
              badge: 'Sustainable Return',
              metric: '100 Nights',
              icon: 'volunteer_activism',
            },
          ],
        },
        overrideAccess: true,
      })
      p.logger.info('[seedContent] HowItWorks global seeded successfully.')
    }

    // 3. Seed Homepage comparison matrix & pillars if empty
    const currentHome = await p.findGlobal({
      slug: 'homepage',
      depth: 0,
      overrideAccess: true,
    })

    if (!currentHome?.trustPillars || currentHome.trustPillars.length === 0) {
      p.logger.info('[seedContent] Seeding Homepage trust pillars, comparison matrix, and testimonials...')
      await p.updateGlobal({
        slug: 'homepage',
        data: {
          trustPillars: [
            { metric: '6 Flat Boxes', label: 'Whole Apartment Suite', icon: 'package_2' },
            { metric: '60 Minutes', label: 'Tool-Free Solo Build', icon: 'timer' },
            { metric: '0 Screws', label: 'Mechanical Snap-Lock', icon: 'handyman' },
            { metric: 'DDP Included', label: 'Duties & Taxes Prepaid', icon: 'local_shipping' },
          ],
          comparisonMatrix: {
            eyebrow: 'THE DIFFERENCE',
            title: 'Flat Set Engineering vs. Traditional Retail',
            subtitle:
              'Why shipping flat boxes directly from modern workshops beats traditional furniture showrooms and complex flat-packs.',
            rows: [
              {
                label: 'Assembly Process',
                flatSetValue: '15–60 min solo build · 0 screws · Pre-installed snap brackets',
                traditionalValue: '3–6 hours · 120+ screws · Allen keys & power drills required',
              },
              {
                label: 'Lead Time & Delivery',
                flatSetValue: '14–18 days carbon-offset ocean express · DDP all duties included',
                traditionalValue: '8–16 weeks showroom backlog · Expensive freight delivery windows',
              },
              {
                label: 'Cushion Freshness',
                flatSetValue: 'Fresh-pressed within 48 hrs of order · Zero warehouse sag',
                traditionalValue: 'Stored 6–12 months in overseas containers · Foam fatigue',
              },
              {
                label: '1-Bedroom Cost',
                flatSetValue: '$1,499 complete move-in suite · Free swatch box with $50 voucher',
                traditionalValue: '$3,800+ piecemeal markup · Heavy delivery surcharges',
              },
            ],
          },
          bundlePromo: {
            eyebrow: 'COMPLETE LIVING SYSTEM',
            title: 'Move-In 1-Bedroom Bundle',
            subtitle:
              'ModuSofa 3-Seater + SnapBed Frame + FlatCoffee Table + SnapSide Table + EntryRack. 6 boxes delivered together.',
            discountCallout: 'Save $300 vs individual pieces',
            ctaLabel: 'Configure Your Move-In Kit',
          },
          testimonials: [
            {
              author: 'Elena R.',
              location: 'Brooklyn, NY',
              apartmentType: '4th Floor Walkup',
              quote:
                'Getting a 3-seater sofa into my 4th-floor brownstone with a 65cm doorway was impossible until The Flat Set. 2 boxes went right up the stairs. Snapped it together in under 15 minutes without looking at a manual.',
              rating: 5,
            },
            {
              author: 'Marcus T.',
              location: 'London, UK',
              apartmentType: 'Modern 1-Bed Flat',
              quote:
                'The DDP promise is real — no customs bills arrived weeks later. The white oak feels solid like heirloom furniture, and the corduroy has zero wrinkles.',
              rating: 5,
            },
            {
              author: 'Kenji S.',
              location: 'Tokyo, JP',
              apartmentType: 'Studio Apartment',
              quote:
                'Minimalist, extremely sturdy, and fits compact elevators perfectly. The donation return policy gave me 100% confidence to order.',
              rating: 5,
            },
          ],
        },
        overrideAccess: true,
      })
      p.logger.info('[seedContent] Homepage extended blocks seeded.')
    }

    // 4. Seed Header and Footer globals if empty
    const currentHeader = await p.findGlobal({
      slug: 'header',
      depth: 0,
      overrideAccess: true,
    })

    if (!currentHeader?.navItems || currentHeader.navItems.length === 0) {
      await p.updateGlobal({
        slug: 'header',
        data: {
          showAnnouncement: true,
          navItems: [
            { label: '1-Bedroom Kit', url: '/1-bedroom-kit-builder', badge: 'Popular' },
            { label: 'The ModuSofa', url: '/products/modusofa' },
            { label: 'Craft & Logistics', url: '/how-it-works-craft-logistics' },
            { label: 'Swatch Box', url: '/free-swatch-box-material-discovery', badge: '$0 Free' },
            { label: 'FAQ', url: '/faq' },
          ],
        },
        overrideAccess: true,
      })
    }

    const currentFooter = await p.findGlobal({
      slug: 'footer',
      depth: 0,
      overrideAccess: true,
    })

    if (!currentFooter?.navItems || currentFooter.navItems.length === 0) {
      await p.updateGlobal({
        slug: 'footer',
        data: {
          brandSlogan: '6 Boxes · 60 Minutes · 0 Screws · DDP Duties Included',
          copyrightText: 'The Flat Set. All rights reserved.',
          navItems: [
            { label: '1-Bedroom Kit', url: '/1-bedroom-kit-builder' },
            { label: 'The ModuSofa', url: '/products/modusofa' },
            { label: 'The SnapBed', url: '/products/snapbed' },
            { label: 'Craft & Logistics', url: '/how-it-works-craft-logistics' },
            { label: 'Free Swatch Box', url: '/free-swatch-box-material-discovery' },
            { label: 'FAQ', url: '/faq' },
          ],
          socialLinks: [
            { platform: 'Instagram', url: 'https://instagram.com/theflatset' },
            { platform: 'Twitter / X', url: 'https://twitter.com/theflatset' },
            { platform: 'Pinterest', url: 'https://pinterest.com/theflatset' },
          ],
        },
        overrideAccess: true,
      })
    }
  } catch (error) {
    p.logger.warn(`[seedContent] Skipped auto-seed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
