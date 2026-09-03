import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import '../globals.css'

import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd'
import { getOpenGraphLocales } from '@/i18n/metadata'
import { localeDetails, locales, routing, type AppLocale } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import Script from 'next/script'
import React from 'react'

import { getCanonicalSiteURL } from '@/utilities/canonicalUrl'
import { EcommerceRoot } from '@/components/moduliv/EcommerceRoot'
import { PolicyModal } from '@/components/moduliv/PolicyModal'
import { readStripeServerConfig } from '@/lib/commerce/stripeConfig'

const siteURL = getCanonicalSiteURL()

type LayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const viewport: Viewport = {
  // Required for env(safe-area-inset-*) (iOS notch/home-indicator padding, e.g. KitBuilder) to resolve to non-zero values.
  viewportFit: 'cover',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: requestedLocale } = await params
  if (!hasLocale(routing.locales, requestedLocale)) notFound()

  const locale = requestedLocale as AppLocale
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    description: t('description'),
    metadataBase: new URL(siteURL),
    openGraph: {
      description: t('openGraphDescription'),
      images: ['/assets/homepage/hero-split.png'],
      title: t('homeTitle'),
      type: 'website',
      ...getOpenGraphLocales(locale),
    },
    robots: {
      follow: true,
      index: true,
    },
    title: {
      default: t('defaultTitle'),
      template: '%s | The Flat Set',
    },
    twitter: {
      card: 'summary_large_image',
      description: t('openGraphDescription'),
      images: ['/assets/homepage/hero-split.png'],
      title: t('homeTitle'),
    },
  }
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale: requestedLocale } = await params
  if (!hasLocale(routing.locales, requestedLocale)) notFound()

  const locale = requestedLocale as AppLocale
  setRequestLocale(locale)

  const messages = await getMessages()

  // Resolved server-side: the publishable key only reaches the client when the
  // secret key and webhook secret are present and in the same mode.
  const stripeConfig = readStripeServerConfig()
  const stripePublishableKey =
    stripeConfig.status === 'configured' ? stripeConfig.publishableKey : ''

  return (
    <html
      dir={localeDetails[locale].dir}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <OrganizationJsonLd locale={locale} />
        <WebSiteJsonLd locale={locale} />
        {/* latin subset (unicode-range U+0000-00FF) of each family — what English body copy actually renders with */}
        <link rel="preload" href="/vendor/fonts/fbe25729b3d.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/vendor/fonts/f9deeae7719.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link href="/vendor/fonts/fonts-a39f5c6f.css" rel="stylesheet" />
        <link href="/vendor/fonts/fonts-7cdb80a7.css" rel="stylesheet" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/assets/brand/favicon.svg"
        />
        <Script src="/moduliv-core.js" strategy="afterInteractive" />
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
          .text-underline-hover { position: relative; display: inline-block; }
          .text-underline-hover::after { content: ''; position: absolute; width: 100%; transform: scaleX(0); height: 1px; bottom: 0; left: 0; background-color: currentColor; transform-origin: bottom right; transition: transform 0.25s ease-out; }
          .text-underline-hover:hover::after { transform: scaleX(1); transform-origin: bottom left; }
          body { background-color: #F9F8F6; color: #1a1c1d; }
          button:focus-visible, a:focus-visible { outline: 2px solid #8a4725; outline-offset: 2px; }
          .cart-badge { position: absolute; top: -6px; right: -8px; min-width: 16px; height: 16px; padding: 0 4px; background: #8a4725; color: #ffffff; font: 600 10px/16px "Plus Jakarta Sans", sans-serif; text-align: center; border-radius: 9999px; }
          @keyframes cart-pulse { 0% { transform: scale(.4); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
          .cart-badge--pulse { animation: cart-pulse .5s ease-out; }
          .reveal { opacity: 0; transform: translateY(20px); transition: opacity .7s ease-out, transform .7s ease-out; }
          .reveal--in { opacity: 1; transform: translateY(0); }
          .skip-link { position: absolute; left: -9999px; top: 0; z-index: 100; background: #8a4725; color: #fff; padding: 12px 20px; font: 600 14px 'Plus Jakarta Sans',sans-serif; }
          .skip-link:focus { left: 0; }
          :is(html[lang^="zh"], html[lang="ja"], html[lang="ar"]) .font-label-md,
          :is(html[lang^="zh"], html[lang="ja"], html[lang="ar"]) .tracking-wider,
          :is(html[lang^="zh"], html[lang="ja"], html[lang="ar"]) .tracking-widest {
            letter-spacing: normal;
            text-transform: none;
          }
          html[lang="ar"] { line-height: 1.8; }
          .latin-meta { letter-spacing: 0.05em; text-transform: uppercase; }
          @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto !important; }
            .reveal { opacity: 1; transform: none; transition: none; }
            .cart-badge--pulse { animation: none; }
          }
        ` }} />
      </head>
      <body className="bg-background text-on-background font-body-md antialiased overflow-x-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <EcommerceRoot publishableKey={stripePublishableKey}>
            {children}
            <PolicyModal />
          </EcommerceRoot>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
