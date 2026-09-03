import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theflatset.com'

const LOCALIZED_CATALOG: Record<
  string,
  Record<
    string,
    { name: string; category: string; description: string }
  >
> = {
  'zh-CN': {
    'bundle-1bed': {
      name: '一居室整套方案（Move-In 1-Bedroom Bundle）',
      category: '全屋整装套餐',
      description: '全套 6 个扁平箱交付，包含 3 人位模块沙发、极简床架、茶几、边几与入户挂架，60分钟免工具徒手拼装，DDP 完税包邮直达入户。',
    },
    'prod-modusofa': {
      name: 'ModuSofa 模块沙发 (3人位)',
      category: '客厅坐具系统',
      description: '模块化 3 人位沙发，纯实木底座搭配 HR45 高回弹海绵，15分钟免工具机械自锁拼装，轻松出入标准电梯与狭窄楼梯。',
    },
    'prod-snapbed': {
      name: 'SnapBed 极简床架',
      category: '卧室寝居系统',
      description: '北美白橡木/黑胡桃木实木床架，0 螺丝机械榫卯自锁架构，承重超过 500kg，20分钟单人徒手拼装。',
    },
  },
  'zh-TW': {
    'bundle-1bed': {
      name: '一居室整套方案（Move-In 1-Bedroom Bundle）',
      category: '全屋整裝套裝',
      description: '全套 6 個扁平箱交付，包含 3 人位模組沙發、極簡床架、茶几、邊几與玄關掛架，60分鐘免工具徒手組裝，DDP 完稅包郵直送到家。',
    },
    'prod-modusofa': {
      name: 'ModuSofa 模組沙發 (3人位)',
      category: '客廳坐具系統',
      description: '模組化 3 人位沙發，純實木底座搭配 HR45 高回彈海綿，15分鐘免工具機械自鎖組裝，輕鬆進出標準電梯與狹窄樓梯。',
    },
    'prod-snapbed': {
      name: 'SnapBed 極簡床架',
      category: '臥室寢居系統',
      description: '北美白橡木/黑胡桃木實木床架，0 螺絲機械榫卯自鎖架構，承重超過 500kg，20分鐘單人徒手組裝。',
    },
  },
  de: {
    'bundle-1bed': {
      name: 'Move-In 1-Zimmer-Bundle',
      category: 'Ganzhaus-Wohnsystem',
      description: 'Komplettes 6-Boxen-Möbelsystem inklusive 3-Sitzer-Modulsofa, Bettgestell, Couchtisch, Beistelltisch und Garderobe. 60 Minuten werkzeuglose Montage, DDP Zölle inklusive.',
    },
    'prod-modusofa': {
      name: 'The ModuSofa 3-Sitzer',
      category: 'Sitzmöbelsystem',
      description: 'Werkzeugloses modulares 3-Sitzer-Sofa mit massivem FSC®-Eichenrahmen und HR45-Kaltschaum. 15 Minuten Solo-Montage, aufzugtauglich.',
    },
    'prod-snapbed': {
      name: 'The SnapBed Bettgestell',
      category: 'Schlafzimmersystem',
      description: 'Massivholz-Bettgestell mit schraubenloser Klick-Architektur, 500 kg Tragkraft, 20 Minuten werkzeuglose Montage.',
    },
  },
  ja: {
    'bundle-1bed': {
      name: '1LDKまるごと家具セット (Move-In 1-Bedroom Bundle)',
      category: 'フルアパートメントシステム',
      description: 'わずか6箱の薄型フラットパックでお届け。3人掛けソファ、ベッド、コーヒーテーブル、サイドテーブル、玄関ラックを網羅。工具不要60分完成、DDP関税込み。',
    },
    'prod-modusofa': {
      name: 'ModuSofa 3人掛けモジュラーソファ',
      category: 'リビングソファシステム',
      description: 'ネジ0本・工具不要で15分組み立て。無垢ホワイトオーク材と高反発HR45ウレタン採用。エレベーターや狭い階段も楽々搬入。',
    },
    'prod-snapbed': {
      name: 'SnapBed ミニマルベッドフレーム',
      category: 'ベッドルームシステム',
      description: 'ネジ0本の日本の伝統木工に着想を得た噛み合わせ設計。耐荷重500kg、20分で完成する無垢材ベッドフレーム。',
    },
  },
  ar: {
    'bundle-1bed': {
      name: 'حزمة الشقة المكونة من غرفة نوم واحدة',
      category: 'نظام المعيشة الكامل للشقة',
      description: 'نظام أثاث منزلي متكامل في 6 صناديق مسطحة. تركيب بدون أي أدوات خلال 60 دقيقة مع شحن DDP شامل الجمارك.',
    },
    'prod-modusofa': {
      name: 'أريكة ModuSofa ثلاثية المقاعد',
      category: 'نظام الجلوس المعياري',
      description: 'أريكة معيارية تجمع بدون براغي خلال 15 دقيقة، خشب بلوط صلب وإسفنج HR45 عالي المرونة، مصممة للمصاعد والممرات الضيقة.',
    },
    'prod-snapbed': {
      name: 'إطار سرير SnapBed',
      category: 'نظام غرفة النوم',
      description: 'إطار سرير من خشب البلوط الصلب بتقنية التعشيق بدون مسامير، يتحمل حتى 500 كجم، تركيب فردي خلال 20 دقيقة.',
    },
  },
  ru: {
    'bundle-1bed': {
      name: 'Комплект мебели для 1-комнатной квартиры',
      category: 'Система меблировки всей квартиры',
      description: 'Полная меблировка квартиры всего в 6 плоских коробках. 100% сборка без инструментов за 60 минут, доставка DDP с включенными пошлинами.',
    },
    'prod-modusofa': {
      name: 'Модульный 3-местный диван ModuSofa',
      category: 'Система мягкой мебели',
      description: 'Безинструментальная сборка за 15 минут, массив белого дуба и пена HR45 высокой упругости. Идеально для стандартных лифтов.',
    },
    'prod-snapbed': {
      name: 'Каркас кровати SnapBed',
      category: 'Система для спальни',
      description: 'Кровать из массива дуба с самозащелкивающимся замковым соединением без винтов. Нагрузка до 500 кг, сборка за 20 минут.',
    },
  },
}

/**
 * Machine-Readable JSON Catalog Endpoint for AI Shopping Agents & Search Crawlers (/api/catalog)
 * Supports query parameter ?locale= (e.g. /api/catalog?locale=de)
 */
export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const baseUrl = host ? `${proto}://${host}` : SITE_URL.replace(/\/$/, '')

  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const localizedItems = LOCALIZED_CATALOG[locale] || {}

  let products = [
    {
      id: 'bundle-1bed',
      slug: '1-bedroom-kit',
      name: localizedItems['bundle-1bed']?.name || 'Move-In 1-Bedroom Bundle',
      category: localizedItems['bundle-1bed']?.category || 'Whole-Home Suite',
      priceUSD: 1499,
      boxCount: 6,
      assemblyMinutes: 60,
      joineryType: '100% Tool-Free Snap-Lock',
      toolsRequired: 'None (0 Screws, 0 Allen Keys)',
      shippingType: 'DDP Doorstep Express (Duties & Taxes Included)',
      trialPeriodDays: 100,
      returnPolicy: 'Donation-Over-Return (Full refund on charity pickup receipt)',
      url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/1-bedroom-kit-builder`,
      description:
        localizedItems['bundle-1bed']?.description ||
        'Complete 6-box whole-home flat-pack system including 3-seater sofa, bed, coffee table, side table, and entry rack.',
    },
    {
      id: 'prod-modusofa',
      slug: 'modusofa',
      name: localizedItems['prod-modusofa']?.name || 'The ModuSofa 3-Seater',
      category: localizedItems['prod-modusofa']?.category || 'Seating System',
      priceUSD: 699,
      boxCount: 2,
      assemblyMinutes: 15,
      dimensions: '210cm W × 90cm D × 78cm H',
      joineryType: 'Pre-Mounted Stainless Snap-Lock',
      toolsRequired: 'None (0 Screws)',
      cushionSpecs: 'HR45 High-Resilience Fresh-Pressed Foam',
      covers: 'Removable, OEKO-TEX® certified, machine washable',
      shippingType: 'DDP Doorstep Express',
      trialPeriodDays: 100,
      url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/products/modusofa`,
      description:
        localizedItems['prod-modusofa']?.description ||
        'Tool-free modular 3-seater sofa engineered for deep comfort, narrow stairwell navigation, and 15-minute solo assembly.',
    },
    {
      id: 'prod-snapbed',
      slug: 'snapbed',
      name: localizedItems['prod-snapbed']?.name || 'The SnapBed',
      category: localizedItems['prod-snapbed']?.category || 'Bedroom System',
      priceUSD: 499,
      boxCount: 2,
      assemblyMinutes: 20,
      joineryType: 'CNC Mortise-and-Tenon + Snap-Lock',
      toolsRequired: 'None (0 Screws)',
      material: 'Solid FSC®-Certified White Oak',
      shippingType: 'DDP Doorstep Express',
      trialPeriodDays: 100,
      url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/products/snapbed`,
      description:
        localizedItems['prod-snapbed']?.description ||
        'Solid oak bed frame with tool-free interlocking slat architecture and integrated nightstand brackets.',
    },
  ]

  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 20,
      overrideAccess: true,
      locale: (locale as any) || 'en',
    })
    if (res?.docs?.length) {
      const validDocs = res.docs.filter((doc: any) => Boolean(doc.slug))
      if (validDocs.length > 0) {
        products = validDocs.map((doc: any) => ({
          id: String(doc.id),
          slug: doc.slug,
          name: doc.title || doc.name,
          category: doc.productCollection?.title || 'Modular Furniture',
          priceUSD: doc.priceInUSD || 699,
          boxCount: doc.boxCount || 2,
          assemblyMinutes: doc.assemblyMinutes || 15,
          joineryType: doc.joineryType || 'Tool-Free Mechanical Snap-Lock',
          toolsRequired: 'None (0 Screws, 0 Allen Keys)',
          shippingType: 'DDP Doorstep Express (Duties & Taxes Included)',
          trialPeriodDays: 100,
          returnPolicy: 'Donation-Over-Return (Full refund on charity pickup receipt)',
          url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/products/${doc.slug}`,
          description: doc.subtitle || 'Whole-Home flat-pack living piece engineered for tool-free assembly.',
        }))
      }
    }
  } catch {
    // Return localized static fallbacks if DB unreachable
  }

  return NextResponse.json(
    {
      brand: 'The Flat Set',
      slogan: 'Your entire home. Delivered in 6 flat boxes.',
      website: baseUrl,
      locale,
      supportedLocales: ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru'],
      catalogVersion: '2026.2',
      totalItems: products.length,
      currency: 'USD',
      ddpGuaranteed: true,
      trialGuarantee: '100-Night In-Home Trial with Donation-Over-Return',
      items: products,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
