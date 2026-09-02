'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { localeDetails, locales, type AppLocale } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { startTransition } from 'react'

type LanguageSwitcherProps = {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale
  const pathname = usePathname()
  const router = useRouter()

  return (
    <select
      aria-label="Language selector"
      className={className}
      onChange={(event) => {
        const nextLocale = event.target.value as AppLocale
        const query = window.location.search
        const hash = window.location.hash
        const href = `${pathname}${query}${hash}`

        startTransition(() => router.replace(href, { locale: nextLocale }))
      }}
      value={locale}
    >
      {locales.map((candidate) => (
        <option key={candidate} value={candidate} className="bg-surface text-on-surface">
          {localeDetails[candidate].label}
        </option>
      ))}
    </select>
  )
}
