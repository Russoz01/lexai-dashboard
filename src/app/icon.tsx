import { ImageResponse } from 'next/og'

// App icon — replaces the default Next.js favicon
export const runtime = 'edge'
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
          borderRadius: 14,
        }}
      >
        <svg width="40" height="34" viewBox="0 0 28 24" fill="none">
          <path d="M3 3 L3 21 L11 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 3 L25 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M25 3 L13 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
