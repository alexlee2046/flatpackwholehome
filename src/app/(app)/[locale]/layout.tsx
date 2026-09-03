import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd'
import { getOpenGraphLocales } from '@/i18n/metadata'
import { localeDetails, locales, routing, type AppLocale } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import Script from 'next/script'
import React from 'react'

import { getCanonicalSiteURL } from '@/utilities/canonicalUrl'

const siteURL = getCanonicalSiteURL()

type LayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
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

  return (
    <html
      dir={localeDetails[locale].dir}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <OrganizationJsonLd locale={locale} />
        <WebSiteJsonLd locale={locale} />
        <link rel="preload" href="/vendor/fonts/f305d441dc1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/vendor/fonts/f49e0be9626.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/vendor/tailwind.js" as="script" />
        <link href="/vendor/fonts/fonts-a39f5c6f.css" rel="stylesheet" />
        <link href="/vendor/fonts/fonts-7cdb80a7.css" rel="stylesheet" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/assets/brand/favicon.svg"
        />
        <script src="/vendor/tailwind.js" />
        <script
          id="tailwind-config"
          dangerouslySetInnerHTML={{
            __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "surface-container-highest": "#e2e2e3",
                  "surface-dim": "#dadadb",
                  "on-background": "#1a1c1d",
                  "on-tertiary-fixed": "#00201f",
                  "surface-bright": "#f9f9fa",
                  "on-secondary-fixed": "#161d14",
                  "primary-container": "#a85f3b",
                  "primary-fixed": "#ffdbcc",
                  "on-primary": "#ffffff",
                  "on-secondary-container": "#5d6559",
                  "secondary": "#596155",
                  "outline-variant": "#d9c2b8",
                  "inverse-on-surface": "#f1f1f1",
                  "error-container": "#ffdad6",
                  "on-tertiary-fixed-variant": "#00504d",
                  "on-error-container": "#93000a",
                  "on-primary-fixed-variant": "#733515",
                  "surface": "#f9f9fa",
                  "inverse-surface": "#2f3132",
                  "secondary-fixed-dim": "#c1c9ba",
                  "surface-container-lowest": "#ffffff",
                  "tertiary": "#006562",
                  "surface-container": "#eeeeef",
                  "outline": "#86736b",
                  "surface-container-low": "#f3f3f4",
                  "on-tertiary-container": "#e2fffc",
                  "on-tertiary": "#ffffff",
                  "on-primary-fixed": "#351000",
                  "on-error": "#ffffff",
                  "background": "#F9F8F6",
                  "tertiary-fixed-dim": "#78d6d1",
                  "primary": "#8a4725",
                  "tertiary-container": "#07807c",
                  "on-secondary": "#ffffff",
                  "inverse-primary": "#ffb694",
                  "error": "#ba1a1a",
                  "primary-fixed-dim": "#ffb694",
                  "surface-tint": "#904c2a",
                  "surface-container-high": "#e8e8e9",
                  "secondary-fixed": "#dde5d6",
                  "on-surface": "#1a1c1d",
                  "surface-variant": "#e2e2e3",
                  "tertiary-fixed": "#94f3ed",
                  "on-surface-variant": "#54433c",
                  "on-secondary-fixed-variant": "#41493e",
                  "secondary-container": "#dae2d3",
                  "on-primary-container": "#fff7f4"
                },
                borderRadius: {
                  DEFAULT: "0.125rem",
                  lg: "0.25rem",
                  xl: "0.5rem",
                  full: "9999px"
                },
                spacing: {
                  "margin-mobile": "20px",
                  "gutter": "24px",
                  "section-gap": "120px",
                  "margin-desktop": "64px",
                  "base": "8px"
                },
                fontFamily: {
                  "headline-md": ["Playfair Display", "Georgia", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Microsoft YaHei", "serif"],
                  "headline-lg-mobile": ["Playfair Display", "Georgia", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Microsoft YaHei", "serif"],
                  "headline-sm": ["Playfair Display", "Georgia", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Microsoft YaHei", "serif"],
                  "body-md": ["Plus Jakarta Sans", "system-ui", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Microsoft YaHei", "sans-serif"],
                  "display-lg": ["Playfair Display", "Georgia", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Microsoft YaHei", "serif"],
                  "headline-lg": ["Playfair Display", "Georgia", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Microsoft YaHei", "serif"],
                  "body-lg": ["Plus Jakarta Sans", "system-ui", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Microsoft YaHei", "sans-serif"],
                  "label-md": ["Plus Jakarta Sans", "system-ui", "PingFang SC", "Hiragino Sans", "Yu Gothic", "Microsoft YaHei", "sans-serif"]
                },
                fontSize: {
                  "headline-md": ["32px", { lineHeight: "1.3", fontWeight: "500" }],
                  "headline-lg-mobile": ["36px", { lineHeight: "1.2", fontWeight: "500" }],
                  "headline-sm": ["24px", { lineHeight: "1.4", fontWeight: "500" }],
                  "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                  "display-lg": ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
                  "headline-lg": ["48px", { lineHeight: "1.2", fontWeight: "500" }],
                  "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
                  "label-md": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }]
                }
              }
            }
          };
          `,
          }}
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
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
