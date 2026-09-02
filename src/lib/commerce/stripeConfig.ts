export const STRIPE_ENV_KEYS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOKS_SIGNING_SECRET',
] as const

export type StripeConfigStatus = 'configured' | 'disabled' | 'misconfigured'

type StripeEnvironment = { [key: string]: string | undefined }

export type StripeServerConfig = {
  publishableKey: string
  secretKey: string
  status: StripeConfigStatus
  webhookSecret: string
}

const readValue = (environment: StripeEnvironment, key: (typeof STRIPE_ENV_KEYS)[number]) =>
  environment[key]?.trim() || ''

export function readStripeServerConfig(
  environment: StripeEnvironment = process.env,
): StripeServerConfig {
  const secretKey = readValue(environment, 'STRIPE_SECRET_KEY')
  const publishableKey = readValue(environment, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
  const webhookSecret = readValue(environment, 'STRIPE_WEBHOOKS_SIGNING_SECRET')
  const configuredValues = [secretKey, publishableKey, webhookSecret].filter(Boolean).length
  const secretMode = /^(?:rk|sk)_(live|test)_/.exec(secretKey)?.[1]
  const publishableMode = /^pk_(live|test)_/.exec(publishableKey)?.[1]
  const hasValidFormats =
    Boolean(secretMode) &&
    secretMode === publishableMode &&
    /^whsec_/.test(webhookSecret)

  return {
    publishableKey,
    secretKey,
    status:
      configuredValues === 0
        ? 'disabled'
        : configuredValues === STRIPE_ENV_KEYS.length && hasValidFormats
          ? 'configured'
          : 'misconfigured',
    webhookSecret,
  }
}

export type PublicStripeConfig =
  { status: 'configured'; publishableKey: string } | { status: 'disabled' | 'misconfigured' }

export function getPublicStripeConfig(
  environment: StripeEnvironment = process.env,
): PublicStripeConfig {
  const config = readStripeServerConfig(environment)

  return config.status === 'configured'
    ? { publishableKey: config.publishableKey, status: config.status }
    : { status: config.status }
}
