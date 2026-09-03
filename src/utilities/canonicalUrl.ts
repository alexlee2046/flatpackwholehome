export const CANONICAL_SITE_URL = 'https://theflatset.com'

/**
 * Returns the canonical site URL for production SEO, robots.txt, sitemap, and OpenGraph.
 * Filters out development (localhost, 127.0.0.1) and staging (canbee.cn) hosts to guarantee
 * that canonical domain reference is always https://theflatset.com.
 */
export function getCanonicalSiteURL(): string {
  const envUrl = process.env.CANONICAL_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (
    !envUrl ||
    envUrl.includes('localhost') ||
    envUrl.includes('127.0.0.1') ||
    envUrl.includes('canbee.cn')
  ) {
    return CANONICAL_SITE_URL
  }

  return envUrl.replace(/\/$/, '')
}
