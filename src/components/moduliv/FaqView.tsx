'use client'
import { FAQ_ITEMS, type FaqItem } from '@/data/faq'
import { Link } from '@/i18n/navigation'
import React, { useState } from 'react'

export { FAQ_ITEMS }

export function FaqView({ items = FAQ_ITEMS }: { items?: FaqItem[] }) {
  const [search, setSearch] = useState('')
  const activeItems = items && items.length > 0 ? items : FAQ_ITEMS

  const filtered = activeItems.filter((item) => {
    const q = search.toLowerCase()
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
  })

  return (
    <main
      className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
      id="main"
      tabIndex={-1}
    >
      <nav className="flex items-center gap-2 text-sm font-label-md text-on-surface-variant mb-8">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">FAQ</span>
      </nav>

      <header className="mb-12 max-w-2xl">
        <span className="block font-label-md text-label-md text-primary tracking-[0.1em] uppercase mb-4">
          THE PLAIN-LANGUAGE VERSION
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">
          Questions, Answered Without a Sales Call.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Shipping times, assembly, returns, materials, duties, and your $50 swatch voucher — the eight things people actually ask, answered the way we&apos;d answer a friend.
        </p>
      </header>

      <div className="max-w-md mb-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/60 bg-surface-container-low text-on-surface text-sm rounded focus:outline-none focus:border-primary"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter questions (e.g. shipping, duties, refund)..."
            type="search"
            value={search}
          />
        </div>
      </div>

      <div className="max-w-3xl border-t border-outline-variant/40" id="faq-accordion-container">
        {filtered.map((item, idx) => (
          <details
            className="group border-b border-outline-variant/40"
            key={item.q}
            open={idx === 0 || !!search}
          >
            <summary className="flex justify-between items-center py-6 cursor-pointer list-none gap-6">
              <span className="font-headline-sm text-[20px] text-on-surface">{item.q}</span>
              <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180">
                arrow_downward
              </span>
            </summary>
            <p className="font-body-md text-body-md text-on-surface-variant pb-6 pr-8">{item.a}</p>
          </details>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-on-surface-variant">
            No questions matching &ldquo;{search}&rdquo;. Feel free to email our studio directly at hello@moduliv.studio.
          </div>
        )}
      </div>
    </main>
  )
}
