'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useRef } from 'react'

/**
 * Accessible Privacy Policy / Terms of Service dialogs.
 * Reads messages/policies/<locale>.json via useTranslations('Policies').
 *
 * Uses the native <dialog> element: showModal()/close() give us, for free,
 * background inert, a focus trap, Esc-to-close, and focus save/restore to
 * whatever triggered the dialog (see HTML spec, "dialog focusing steps").
 *
 * Mount this once anywhere in the tree (e.g. inside the footer). It opens
 * itself imperatively via window.modulivOpenPolicy(modalId), the same
 * bridge ModulivFooter's openPolicy() already calls — so no other file
 * needs to change to start using it. See PolicyModal notes for the exact
 * two accepted ids.
 */

declare global {
  interface Window {
    modulivOpenPolicy?: (modalId: string) => void
  }
}

type PolicyNamespace = 'Privacy' | 'Terms'

function PolicyDialog({
  dialogRef,
  namespace,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>
  namespace: PolicyNamespace
}) {
  const t = useTranslations(`Policies.${namespace}`)
  const tPolicies = useTranslations('Policies')
  const titleId = `moduliv-${namespace.toLowerCase()}-modal-title`

  return (
    <dialog
      aria-labelledby={titleId}
      className="moduliv-policy-dialog m-auto w-full max-w-2xl rounded-2xl border border-outline-variant/50 bg-surface-container-low p-0 text-on-surface shadow-2xl"
      data-moduliv-policy=""
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close()
      }}
      ref={dialogRef}
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between border-b border-outline-variant/40 bg-surface-container-lowest px-6 py-5">
          <h3 className="font-headline-sm text-xl text-on-surface" id={titleId}>
            {t('title')}
          </h3>
          <button
            aria-label={tPolicies('close')}
            className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl">
              close
            </span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
          <p className="mb-4 text-xs font-label-md uppercase tracking-wider text-outline">{t('updated')}</p>
          <p className="whitespace-pre-line font-body-md text-sm text-on-surface-variant">
            {t('body')}
          </p>
        </div>
      </div>
    </dialog>
  )
}

export function PolicyModal() {
  const privacyRef = useRef<HTMLDialogElement>(null)
  const termsRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const open = (modalId: string) => {
      const target = modalId === 'moduliv-terms-modal' ? termsRef.current : privacyRef.current
      if (!target || target.open) return
      target.showModal()
      document.body.style.overflow = 'hidden'
    }
    window.modulivOpenPolicy = open

    const restoreScroll = () => {
      if (!privacyRef.current?.open && !termsRef.current?.open) {
        document.body.style.overflow = ''
      }
    }
    const privacyEl = privacyRef.current
    const termsEl = termsRef.current
    privacyEl?.addEventListener('close', restoreScroll)
    termsEl?.addEventListener('close', restoreScroll)

    return () => {
      if (window.modulivOpenPolicy === open) delete window.modulivOpenPolicy
      privacyEl?.removeEventListener('close', restoreScroll)
      termsEl?.removeEventListener('close', restoreScroll)
    }
  }, [])

  return (
    <>
      <style>{`.moduliv-policy-dialog::backdrop { background: rgba(26, 28, 29, 0.6); backdrop-filter: blur(4px); }`}</style>
      <PolicyDialog dialogRef={privacyRef} namespace="Privacy" />
      <PolicyDialog dialogRef={termsRef} namespace="Terms" />
    </>
  )
}
