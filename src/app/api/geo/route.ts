import { NextRequest, NextResponse } from 'next/server'

const COUNTRY_TO_LOCALE: Record<string, { locale: string; countryName: string; nativeName: string }> = {
  CN: { locale: 'zh-CN', countryName: 'China', nativeName: '中国' },
  TW: { locale: 'zh-TW', countryName: 'Taiwan', nativeName: '台灣' },
  HK: { locale: 'zh-TW', countryName: 'Hong Kong', nativeName: '香港' },
  MO: { locale: 'zh-TW', countryName: 'Macau', nativeName: '澳門' },
  DE: { locale: 'de', countryName: 'Germany', nativeName: 'Deutschland' },
  AT: { locale: 'de', countryName: 'Austria', nativeName: 'Österreich' },
  CH: { locale: 'de', countryName: 'Switzerland', nativeName: 'Schweiz' },
  JP: { locale: 'ja', countryName: 'Japan', nativeName: '日本' },
  AE: { locale: 'ar', countryName: 'United Arab Emirates', nativeName: 'الإمارات' },
  SA: { locale: 'ar', countryName: 'Saudi Arabia', nativeName: 'المملكة العربية السعودية' },
  QA: { locale: 'ar', countryName: 'Qatar', nativeName: 'قطر' },
  KW: { locale: 'ar', countryName: 'Kuwait', nativeName: 'الكويت' },
  EG: { locale: 'ar', countryName: 'Egypt', nativeName: 'مصر' },
  OM: { locale: 'ar', countryName: 'Oman', nativeName: 'عمان' },
  BH: { locale: 'ar', countryName: 'Bahrain', nativeName: 'البحرين' },
  RU: { locale: 'ru', countryName: 'Russia', nativeName: 'Россия' },
  BY: { locale: 'ru', countryName: 'Belarus', nativeName: 'Беларусь' },
  KZ: { locale: 'ru', countryName: 'Kazakhstan', nativeName: 'Казахстан' },
}

export const dynamic = 'force-dynamic'

/**
 * Lightweight GeoIP & Location Intelligence API (/api/geo)
 * Reads reverse-proxy CDN geo headers (Cloudflare, Vercel, Traefik, Nginx)
 * Returns country code and recommended locale for non-intrusive soft suggestion.
 */
export async function GET(request: NextRequest) {
  const headers = request.headers

  // 1. Check standard CDN Geo headers
  let country =
    headers.get('cf-ipcountry') ||
    headers.get('x-country-code') ||
    headers.get('x-vercel-ip-country') ||
    headers.get('geoip-country-code') ||
    ''

  country = country.trim().toUpperCase()

  // 2. If valid 2-letter country code detected
  if (country && country.length === 2 && country !== 'XX' && country !== 'T1') {
    const match = COUNTRY_TO_LOCALE[country]
    return NextResponse.json({
      country,
      recommendedLocale: match ? match.locale : 'en',
      countryName: match ? match.countryName : country,
      nativeName: match ? match.nativeName : country,
    })
  }

  // 3. Fallback: Parse Accept-Language header if country not in proxy headers
  const acceptLanguage = headers.get('accept-language') || ''
  if (acceptLanguage) {
    if (acceptLanguage.includes('zh-CN') || acceptLanguage.includes('zh-Hans')) {
      return NextResponse.json({ country: 'CN', recommendedLocale: 'zh-CN', countryName: 'China', nativeName: '中国' })
    }
    if (acceptLanguage.includes('zh-TW') || acceptLanguage.includes('zh-Hant') || acceptLanguage.includes('zh-HK')) {
      return NextResponse.json({ country: 'TW', recommendedLocale: 'zh-TW', countryName: 'Taiwan', nativeName: '台灣' })
    }
    if (acceptLanguage.startsWith('de') || acceptLanguage.includes(',de')) {
      return NextResponse.json({ country: 'DE', recommendedLocale: 'de', countryName: 'Germany', nativeName: 'Deutschland' })
    }
    if (acceptLanguage.startsWith('ja') || acceptLanguage.includes(',ja')) {
      return NextResponse.json({ country: 'JP', recommendedLocale: 'ja', countryName: 'Japan', nativeName: '日本' })
    }
    if (acceptLanguage.startsWith('ar') || acceptLanguage.includes(',ar')) {
      return NextResponse.json({ country: 'AE', recommendedLocale: 'ar', countryName: 'UAE', nativeName: 'الإمارات' })
    }
    if (acceptLanguage.startsWith('ru') || acceptLanguage.includes(',ru')) {
      return NextResponse.json({ country: 'RU', recommendedLocale: 'ru', countryName: 'Russia', nativeName: 'Россия' })
    }
  }

  return NextResponse.json({
    country: 'UNKNOWN',
    recommendedLocale: 'en',
    countryName: 'Global',
    nativeName: 'International',
  })
}
