import { ImageResponse } from 'next/og'

// Apple touch icon — PX Pralvex p/ iOS home screen
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
          background: 'linear-gradient(135deg, #1a1410 0%, #0a0807 100%)',
          borderRadius: 42,
          border: '1px solid rgba(191,166,142,0.38)',
          boxShadow: 'inset 0 2px 0 rgba(230,212,189,0.14)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'monospace',
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: 8,
            color: '#e6d4bd',
            paddingLeft: 8,
          }}
        >
          PX
        </div>
      </div>
    ),
    { ...size }
  )
}
