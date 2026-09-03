'use client'

import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const t = useTranslations('Transaction')

  return (
    <>
      <ModulivHeader />
      <main className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-24 text-center">
        <span className="font-label-md text-sm uppercase tracking-widest text-primary mb-3 block">
          ERROR
        </span>
        <h1 className="font-display-lg text-[48px] md:text-[64px] text-on-surface mb-6">
          Something didn&apos;t fit together.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto mb-8">
          An unexpected error occurred while loading this page. Please try again, or return to our
          curated flat-pack collections.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="bg-on-background text-on-primary py-4 px-8 font-label-md text-label-md uppercase tracking-wider rounded-full hover:bg-primary transition-colors"
            onClick={() => reset()}
            type="button"
          >
            Try Again
          </button>
          <Link
            className="border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase tracking-wider rounded-full hover:bg-surface-container-low transition-colors"
            href="/"
          >
            {t('backHome')}
          </Link>
        </div>
      </main>
      <ModulivFooter />
    </>
  )
}
