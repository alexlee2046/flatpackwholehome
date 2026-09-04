'use client'

import { Link } from '@/i18n/navigation'
import type { SearchIndexProduct } from '@/lib/data/storefront'
import { useTranslations } from 'next-intl'
import { ArrowRight, Search, X } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Global site search. Native <dialog> gives us background inert, Esc-to-close
 * and focus save/restore to the triggering element for free (see
 * PolicyModal.tsx for the same pattern). Open state is lifted to the parent
 * (ModulivHeader) since the header, drawer and this modal all need to agree
 * on it — see openSearch() there for why.
 */

type SearchResult = {
  title: string
  snippet: string
  category: string
  url: string
}

export function SearchModal({
  onClose,
  open,
  products,
}: {
  onClose: () => void
  open: boolean
  products: SearchIndexProduct[]
}) {
  const t = useTranslations('Pages.Search')
  const tNav = useTranslations('Navigation')
  const tHowItWorks = useTranslations('Pages.HowItWorks')
  const tFaq = useTranslations('Pages.FAQ')
  const tSwatch = useTranslations('Pages.Swatch')
  const tPolicies = useTranslations('Policies')

  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  const allResults = useMemo<SearchResult[]>(() => {
    const productResults: SearchResult[] = products.map((p) => ({
      category: t('categoryProduct'),
      snippet: p.subtitle || '',
      title: p.title,
      url: `/products/${p.slug}`,
    }))
    const pageResults: SearchResult[] = [
      {
        category: t('categoryGuide'),
        snippet: tHowItWorks('subtitle'),
        title: tHowItWorks('title'),
        url: '/how-it-works-craft-logistics',
      },
      {
        category: t('categoryGuide'),
        snippet: tSwatch('subtitle'),
        title: tSwatch('title'),
        url: '/free-swatch-box-material-discovery',
      },
      {
        category: t('categoryGuide'),
        snippet: tFaq('subtitle'),
        title: tFaq('title'),
        url: '/faq',
      },
    ]
    return [...productResults, ...pageResults]
  }, [products, t, tHowItWorks, tSwatch, tFaq])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allResults
    return allResults.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    )
  }, [allResults, query])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Esc and backdrop-driven native <dialog> closes need to sync back to the
  // lifted `open` state, not just close the DOM element.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [onClose])

  const handleArrowNav = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    // Browsers may consume the first Escape on <input type="search"> to clear
    // its value. Handle it at the dialog boundary so Escape always closes.
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      dialogRef.current?.close()
      return
    }

    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const focusables = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('input[type="search"], a[data-search-result]'),
    )
    if (!focusables.length) return
    e.preventDefault()
    const idx = focusables.indexOf(document.activeElement as HTMLElement)
    const nextIdx =
      e.key === 'ArrowDown' ? (idx + 1) % focusables.length : (idx - 1 + focusables.length) % focusables.length
    focusables[nextIdx]?.focus()
  }

  return (
    <>
      <style>{`.moduliv-search-dialog::backdrop { background: rgba(26, 28, 29, 0.6); backdrop-filter: blur(4px); }`}</style>
      <dialog
        aria-label={tNav('search')}
        className="moduliv-search-dialog m-auto w-full max-w-2xl rounded-2xl border border-outline-variant/50 bg-surface-container-low p-0 text-on-surface shadow-2xl"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close()
        }}
        onKeyDown={handleArrowNav}
        ref={dialogRef}
      >
        <div className="flex max-h-[70vh] flex-col">
          <div className="flex items-center gap-3 border-b border-outline-variant/40 bg-surface-container-lowest p-4 md:p-6">
            <Search aria-hidden="true" className="text-primary" size={24} />
            <input
              autoComplete="off"
              className="w-full bg-transparent font-body-md text-lg text-on-surface outline-none placeholder:text-on-surface-variant/60 md:text-xl"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tNav('searchPlaceholder')}
              ref={inputRef}
              type="search"
              value={query}
            />
            <button
              aria-label={tPolicies('close')}
              className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          <div aria-live="polite" className="sr-only">
            {t('resultsCount', { count: results.length })}
          </div>

          <div className="space-y-1 overflow-y-auto p-4 md:p-6">
            {results.length === 0 ? (
              <div className="py-8 text-center font-body-md text-on-surface-variant">
                <p className="text-base font-medium">{t('noResultsFor', { query })}</p>
                <p className="mt-1 text-xs text-outline">{t('noResultsHint')}</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {results.map((item) => (
                  <Link
                    className="group block rounded-xl p-3 transition-colors hover:bg-surface-container-highest focus-visible:bg-surface-container-highest focus-visible:outline-none"
                    data-search-result=""
                    href={item.url}
                    key={item.url}
                    onClick={() => dialogRef.current?.close()}
                  >
                    <div className="mb-1 flex items-center justify-between font-label-md text-xs uppercase tracking-wider text-primary">
                      <span>{item.category}</span>
                      <ArrowRight aria-hidden="true" className="opacity-0 transition-opacity group-hover:opacity-100" size={14} />
                    </div>
                    <h4 className="font-headline-sm text-base font-medium text-on-surface group-hover:text-primary">
                      {item.title}
                    </h4>
                    {item.snippet && (
                      <p className="mt-0.5 line-clamp-2 font-body-md text-xs text-on-surface-variant">{item.snippet}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
