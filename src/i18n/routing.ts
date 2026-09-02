import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru'] as const

export type AppLocale = (typeof locales)[number]

export const defaultLocale: AppLocale = 'en'

export const localeDetails: Record<
  AppLocale,
  { dir: 'ltr' | 'rtl'; label: string; openGraphLocale: string }
> = {
  en: { dir: 'ltr', label: 'English', openGraphLocale: 'en_US' },
  'zh-CN': { dir: 'ltr', label: '简体中文', openGraphLocale: 'zh_CN' },
  'zh-TW': { dir: 'ltr', label: '繁體中文', openGraphLocale: 'zh_TW' },
  de: { dir: 'ltr', label: 'Deutsch', openGraphLocale: 'de_DE' },
  ja: { dir: 'ltr', label: '日本語', openGraphLocale: 'ja_JP' },
  ar: { dir: 'rtl', label: 'العربية', openGraphLocale: 'ar_AE' },
  ru: { dir: 'ltr', label: 'Русский', openGraphLocale: 'ru_RU' },
}

export const routing = defineRouting({
  defaultLocale,
  localeDetection: false,
  localePrefix: 'as-needed',
  locales,
})
