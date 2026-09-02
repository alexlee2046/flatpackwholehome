import commerceConfig from '@/data/odsai-commerce.json'

export const RETAIL_PRICE_MULTIPLIER = commerceConfig.retailPriceMultiplier
export const MADE_TO_ORDER_INVENTORY = commerceConfig.madeToOrderInventory
export const MAX_ITEM_QUANTITY = commerceConfig.maxItemQuantity
export const MADE_TO_ORDER_PRODUCTION_DAYS = { min: 3, max: 14 } as const

export type ODSaiDestinationCode =
  'AE' | 'AU' | 'CA' | 'CN' | 'DE' | 'FR' | 'GB' | 'HK' | 'IT' | 'JP' | 'NL' | 'SG' | 'US'

type DDPZone = {
  countries: readonly ODSaiDestinationCode[]
  deliveryDays: { min: number; max: number }
  label: string
  minFreightUSD: number
  ratePerCbmUSD: number
  reserveRate: number
  seasonalMultiplier: number
}

/**
 * Provisional direct-to-consumer DDP model, adapted from Klackjoy's CBM model.
 * Keep this server-authoritative at payment time. Rates must be replaced when
 * ODSai receives destination-specific quotes from its Indonesia forwarder.
 */
export const DDP_ZONES = {
  australia: {
    countries: ['AU'],
    deliveryDays: { min: 21, max: 45 },
    label: 'Australia',
    minFreightUSD: 450,
    ratePerCbmUSD: 650,
    reserveRate: 0.13,
    seasonalMultiplier: 1,
  },
  canada: {
    countries: ['CA'],
    deliveryDays: { min: 26, max: 55 },
    label: 'Canada',
    minFreightUSD: 700,
    ratePerCbmUSD: 900,
    reserveRate: 0.26,
    seasonalMultiplier: 1,
  },
  china: {
    countries: ['CN', 'HK'],
    deliveryDays: { min: 5, max: 19 },
    label: 'China and Hong Kong',
    minFreightUSD: 50,
    ratePerCbmUSD: 80,
    reserveRate: 0.13,
    seasonalMultiplier: 1,
  },
  europe: {
    countries: ['DE', 'FR', 'IT', 'NL'],
    deliveryDays: { min: 28, max: 44 },
    label: 'European Union',
    minFreightUSD: 500,
    ratePerCbmUSD: 700,
    reserveRate: 0.22,
    seasonalMultiplier: 1.05,
  },
  japanSingapore: {
    countries: ['JP', 'SG'],
    deliveryDays: { min: 10, max: 27 },
    label: 'Japan and Singapore',
    minFreightUSD: 180,
    ratePerCbmUSD: 250,
    reserveRate: 0.12,
    seasonalMultiplier: 1,
  },
  unitedArabEmirates: {
    countries: ['AE'],
    deliveryDays: { min: 31, max: 60 },
    label: 'United Arab Emirates',
    minFreightUSD: 650,
    ratePerCbmUSD: 900,
    reserveRate: 0.2,
    seasonalMultiplier: 1,
  },
  unitedKingdom: {
    countries: ['GB'],
    deliveryDays: { min: 28, max: 44 },
    label: 'United Kingdom',
    minFreightUSD: 500,
    ratePerCbmUSD: 650,
    reserveRate: 0.21,
    seasonalMultiplier: 1,
  },
  unitedStates: {
    countries: ['US'],
    deliveryDays: { min: 28, max: 56 },
    label: 'United States',
    minFreightUSD: 700,
    ratePerCbmUSD: 850,
    reserveRate: 0.28,
    seasonalMultiplier: 1,
  },
} as const satisfies Record<string, DDPZone>

export const ODSAI_DESTINATIONS = [
  { label: 'Australia', value: 'AU' },
  { label: 'Canada', value: 'CA' },
  { label: 'China', value: 'CN' },
  { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' },
  { label: 'Hong Kong SAR', value: 'HK' },
  { label: 'Italy', value: 'IT' },
  { label: 'Japan', value: 'JP' },
  { label: 'Netherlands', value: 'NL' },
  { label: 'Singapore', value: 'SG' },
  { label: 'United Arab Emirates', value: 'AE' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'United States', value: 'US' },
] as const satisfies readonly { label: string; value: ODSaiDestinationCode }[]

export type DDPQuote = {
  chargeableCbm: number
  countryCode: ODSaiDestinationCode
  deliveryDays: { min: number; max: number }
  freightInUSD: number
  importChargesInUSD: number
  landedTotalInUSD: number
  shippingAndImportInUSD: number
  zone: string
}

export function isODSaiDestination(
  value: string | null | undefined,
): value is ODSaiDestinationCode {
  if (!value) return false
  return ODSAI_DESTINATIONS.some((country) => country.value === value.toUpperCase())
}

export function getDDPZone(countryCode: ODSaiDestinationCode): DDPZone {
  const zone = Object.values(DDP_ZONES).find((candidate) =>
    candidate.countries.some((code) => code === countryCode),
  )

  if (!zone) throw new Error(`ODSai does not currently offer checkout delivery to ${countryCode}.`)
  return zone
}

/**
 * Returns USD values in cents. The goods subtotal must come from authoritative
 * product or variant prices, never from a client request.
 */
export function calculateDDPQuote(input: {
  countryCode: ODSaiDestinationCode
  packedCbm: number
  subtotalInUSD: number
}): DDPQuote {
  const { countryCode, packedCbm, subtotalInUSD } = input

  if (!Number.isInteger(subtotalInUSD) || subtotalInUSD <= 0) {
    throw new Error('A positive USD subtotal in cents is required.')
  }
  if (!Number.isFinite(packedCbm) || packedCbm < 0) {
    throw new Error('Packed volume must be a non-negative number.')
  }

  const zone = getDDPZone(countryCode)
  const chargeableCbm = Math.max(packedCbm, 0.5)
  const freightInUSD = Math.round(
    Math.max(zone.minFreightUSD, chargeableCbm * zone.ratePerCbmUSD) *
      zone.seasonalMultiplier *
      100,
  )
  const importChargesInUSD = Math.round((subtotalInUSD + freightInUSD) * zone.reserveRate)
  const shippingAndImportInUSD = freightInUSD + importChargesInUSD

  return {
    chargeableCbm,
    countryCode,
    deliveryDays: zone.deliveryDays,
    freightInUSD,
    importChargesInUSD,
    landedTotalInUSD: subtotalInUSD + shippingAndImportInUSD,
    shippingAndImportInUSD,
    zone: zone.label,
  }
}
