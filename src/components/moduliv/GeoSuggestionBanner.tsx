'use client'

import { localeDetails } from '@/i18n/routing'
import React, { useEffect, useState } from 'react'

type GeoBannerProps = {
  currentLocale: string
}

const LOCALE_PROMPTS: Record<
  string,
  {
    flag: string
    message: string
    switchText: string
    stayText: string
  }
> = {
  'zh-CN': {
    flag: '🇨🇳',
    message: '检测到您来自中国，是否切换至简体中文浏览？',
    switchText: '切换至简体中文',
    stayText: '保持当前语言',
  },
  'zh-TW': {
    flag: '🇭🇰',
    message: '偵測到您來自港台地區，是否切換至繁體中文？',
    switchText: '切換至繁體中文',
    stayText: '保持當前語言',
  },
  de: {
    flag: '🇩🇪',
    message: 'Sie besuchen The Flat Set. Möchten Sie zum deutschen Store wechseln?',
    switchText: 'Zu Deutsch wechseln',
    stayText: 'Auf Englisch bleiben',
  },
  ja: {
    flag: '🇯🇵',
    message: '日本からアクセスされています。日本語ストアに切り替えますか？',
    switchText: '日本語に切り替える',
    stayText: '英語のまま閲覧',
  },
  ar: {
    flag: '🇦🇪',
    message: 'يبدو أنك تتصفح من منطقة الشرق الأوسط. هل ترغب في التبديل إلى العربية؟',
    switchText: 'التبديل إلى العربية',
    stayText: 'البقاء بالإنجليزية',
  },
  ru: {
    flag: '🇷🇺',
    message: 'Вы зашли из русскоязычного региона. Переключить на русский язык?',
    switchText: 'Переключить на русский',
    stayText: 'Остаться на английском',
  },
}

/**
 * Smart Geo-Suggestion Soft Banner (SEO-friendly, zero forced redirect)
 * Follows Apple, Nike, and Google International SEO best practices.
 * Allows search engine crawlers 100% crawlability while elegantly guiding international shoppers.
 */
export function GeoSuggestionBanner({ currentLocale }: GeoBannerProps) {
  const [targetLocale, setTargetLocale] = useState<string | null>(null)
  // 'checking' reserves the banner's height so that showing it later never
  // shifts already-rendered content (CLS). It collapses to 'hidden' once we
  // know no suggestion is coming.
  const [status, setStatus] = useState<'checking' | 'hidden' | 'visible'>('checking')

  useEffect(() => {
    try {
      // 1. If user previously dismissed the geo banner, do not disturb
      if (localStorage.getItem('tfs_geo_dismissed') === 'true') {
        setStatus('hidden')
        return
      }

      // 2. Query lightweight Geo API
      fetch('/api/geo')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const rec = data?.recommendedLocale
          // Only suggest if recommended locale is different from current page locale
          if (rec && rec !== currentLocale && LOCALE_PROMPTS[rec]) {
            setTargetLocale(rec)
            setStatus('visible')
          } else {
            setStatus('hidden')
          }
        })
        .catch(() => {
          // Gracefully ignore geo check failures
          setStatus('hidden')
        })
    } catch {
      // LocalStorage or SSR security boundary
      setStatus('hidden')
    }
  }, [currentLocale])

  if (status === 'hidden') {
    return null
  }

  const prompt = targetLocale ? LOCALE_PROMPTS[targetLocale] : null
  const targetDir = targetLocale ? localeDetails[targetLocale as keyof typeof localeDetails]?.dir : undefined

  const handleSwitch = () => {
    try {
      localStorage.setItem('tfs_geo_dismissed', 'true')
      document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`

      // Replace current locale prefix in pathname
      const pathname = window.location.pathname
      let newPath = pathname

      const locales = ['zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru']
      let matchedCurrent = false
      for (const loc of locales) {
        if (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) {
          newPath = pathname.replace(`/${loc}`, `/${targetLocale}`)
          matchedCurrent = true
          break
        }
      }

      if (!matchedCurrent) {
        // Was at default locale / (or /en)
        newPath = `/${targetLocale}${pathname === '/' ? '' : pathname}`
      }

      window.location.href = newPath
    } catch {
      window.location.href = `/${targetLocale}`
    }
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem('tfs_geo_dismissed', 'true')
    } catch {}
    setStatus('hidden')
  }

  return (
    <aside
      aria-hidden={status === 'checking'}
      aria-label="Language and regional preference"
      className="min-h-[44px] bg-on-background text-on-primary py-2.5 px-4 text-xs font-label-md transition-all duration-300 relative z-50 border-b border-outline/20"
    >
      {prompt && (
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
          <div className="flex items-center justify-center gap-2">
            <span className="text-base leading-none" role="img" aria-label="Country flag">
              {prompt.flag}
            </span>
            <span className="tracking-wide text-surface-bright" dir={targetDir}>
              {prompt.message}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSwitch}
              className="bg-primary hover:bg-primary-container text-on-primary px-3.5 py-1 rounded-full text-xs font-medium transition-colors shadow-sm cursor-pointer"
              dir={targetDir}
            >
              {prompt.switchText}
            </button>
            <button
              onClick={handleDismiss}
              className="text-surface-variant hover:text-on-primary underline text-xs cursor-pointer ms-1"
              dir={targetDir}
            >
              {prompt.stayText}
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
