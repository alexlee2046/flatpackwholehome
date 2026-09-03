'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    // global-error must include html and body tags
    <html lang="en">
      <body
        style={{
          alignItems: 'center',
          background: '#F9F8F6',
          color: '#1a1c1d',
          display: 'flex',
          flexDirection: 'column',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          justifyContent: 'center',
          margin: 0,
          minHeight: '100vh',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            color: '#8a4725',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}
        >
          ERROR
        </span>
        <h1 style={{ fontSize: '32px', margin: '0 0 16px' }}>Something went wrong.</h1>
        <p style={{ color: '#5b5f61', margin: '0 0 32px', maxWidth: '420px' }}>
          An unexpected error occurred. Please try again, or return to the homepage.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => reset()}
            style={{
              background: '#1a1c1d',
              border: 'none',
              borderRadius: '9999px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '14px 28px',
              textTransform: 'uppercase',
            }}
            type="button"
          >
            Try Again
          </button>
          {/* global-error replaces the root layout, so there is no router to
              navigate with — a full document load is the right behaviour when
              the app shell itself has failed. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              border: '1px solid #1a1c1d',
              borderRadius: '9999px',
              color: '#1a1c1d',
              fontSize: '14px',
              padding: '14px 28px',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            Back to Homepage
          </a>
        </div>
      </body>
    </html>
  )
}
