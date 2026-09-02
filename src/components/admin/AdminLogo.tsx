import React from 'react'

export const AdminLogo: React.FC = () => {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 0',
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', gap: '14px' }}>
        <img
          alt="The Flat Set Mark"
          src="/assets/brand/mark.svg"
          style={{ height: '38px', width: 'auto' }}
        />
        <img
          alt="The Flat Set"
          src="/assets/brand/wordmark.svg"
          style={{ height: '26px', width: 'auto' }}
        />
      </div>
      <span
        style={{
          color: '#545C50',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        Whole-Home Commerce Control
      </span>
    </div>
  )
}
