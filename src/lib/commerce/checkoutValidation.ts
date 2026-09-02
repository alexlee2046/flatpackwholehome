import { isODSaiDestination, type ODSaiDestinationCode } from './ddp'

const addressKeys = [
  'title',
  'firstName',
  'lastName',
  'company',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
  'phone',
] as const

type AddressKey = (typeof addressKeys)[number]

const requiredAddressKeys = [
  'firstName',
  'lastName',
  'addressLine1',
  'city',
  'postalCode',
  'country',
] as const

const addressLabels: Partial<Record<AddressKey, string>> = {
  addressLine1: 'street address',
  firstName: 'first name',
  lastName: 'last name',
  postalCode: 'postal code',
}

const countriesRequiringState = new Set(['AU', 'CA', 'US'])

export type CheckoutAddress = Record<AddressKey, string | null>
export type CheckoutAddressKind = 'billing' | 'shipping'

export class CheckoutValidationError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'CheckoutValidationError'
    this.code = code
  }
}

export function normalizeCheckoutAddress(
  value: unknown,
  kind: CheckoutAddressKind,
): CheckoutAddress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CheckoutValidationError(
      `INVALID_${kind.toUpperCase()}_ADDRESS`,
      `A complete ${kind} address is required.`,
    )
  }

  const source = value as Record<string, unknown>
  const normalized = Object.fromEntries(
    addressKeys.map((key) => [
      key,
      typeof source[key] === 'string' ? source[key].trim() || null : null,
    ]),
  ) as CheckoutAddress

  for (const key of requiredAddressKeys) {
    if (!normalized[key]) {
      throw new CheckoutValidationError(
        `INVALID_${kind.toUpperCase()}_ADDRESS`,
        `The ${kind} address is missing ${addressLabels[key] ?? key}.`,
      )
    }
  }

  const country = normalized.country!.toUpperCase()
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new CheckoutValidationError(
      `INVALID_${kind.toUpperCase()}_ADDRESS`,
      `The ${kind} country code is invalid.`,
    )
  }
  if (countriesRequiringState.has(country) && !normalized.state) {
    throw new CheckoutValidationError(
      `INVALID_${kind.toUpperCase()}_ADDRESS`,
      `The ${kind} address is missing a state or province.`,
    )
  }
  if (kind === 'shipping' && !isODSaiDestination(country)) {
    throw new CheckoutValidationError(
      'UNSUPPORTED_SHIPPING_DESTINATION',
      'This delivery country is not currently available at checkout.',
    )
  }

  normalized.country = country
  return normalized
}

export function getShippingDestination(address: CheckoutAddress): ODSaiDestinationCode {
  if (!isODSaiDestination(address.country)) {
    throw new CheckoutValidationError(
      'UNSUPPORTED_SHIPPING_DESTINATION',
      'This delivery country is not currently available at checkout.',
    )
  }

  return address.country
}

export function isCompleteCheckoutAddress(value: unknown, kind: CheckoutAddressKind): boolean {
  try {
    normalizeCheckoutAddress(value, kind)
    return true
  } catch {
    return false
  }
}
