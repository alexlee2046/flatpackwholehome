import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { Link } from '@/i18n/navigation'
import React from 'react'

export default function NotFound() {
  return (
    <>
      <ModulivHeader />
      <main className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-24 text-center">
        <span className="font-label-md text-sm uppercase tracking-widest text-primary mb-3 block">
          404 — PAGE NOT FOUND
        </span>
        <h1 className="font-display-lg text-[48px] md:text-[64px] text-on-surface mb-6">
          This piece didn&apos;t fit the room.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto mb-8">
          The page you requested may have moved or doesn&apos;t exist. Return to our curated flat-pack collections.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            className="bg-on-background text-on-primary py-4 px-8 font-label-md text-label-md uppercase tracking-wider rounded-full hover:bg-primary transition-colors"
            href="/"
          >
            Back to Homepage
          </Link>
          <Link
            className="border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase tracking-wider rounded-full hover:bg-surface-container-low transition-colors"
            href="/1-bedroom-kit-builder"
          >
            Build 1-Bedroom Kit
          </Link>
        </div>
      </main>
      <ModulivFooter />
    </>
  )
}
