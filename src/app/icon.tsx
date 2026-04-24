import { ImageResponse } from 'next/og'

// App icon — favicon Pralvex (PX monograma em caixa champagne sobre noir)
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
          background: 'linear-gradient(135deg, #1a1410 0%, #0a0807 100%)',
          borderRadius: 14,
          border: '1px solid rgba(191,166,142,0.34)',
          boxShadow: 'inset 0 1px 0 rgba(230,212,189,0.12)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'monospace',
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 3,
            color: '#e6d4bd',
            paddingLeft: 3,
          }}
        >
          PX
        </div>
      </div>
    ),
    { ...size }
  )
}
