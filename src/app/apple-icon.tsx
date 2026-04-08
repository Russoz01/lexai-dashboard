import { ImageResponse } from 'next/og'

// Apple touch icon (iOS home screen)
export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: 42,
        }}
      >
        <svg width="112" height="96" viewBox="0 0 28 24" fill="none">
          <path d="M3 3 L3 21 L11 21" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 3 L25 21" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M25 3 L13 21" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
