import { ImageResponse } from 'next/og'
import { SITE_URL } from '@/lib/site-url'

// Apple touch icon — Pralvex Higgsfield real PNG
// v3 (2026-05-03): substitui SVG inline pela logo PNG real
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${SITE_URL}/logo-p.png`} width="140" height="140" alt="Pralvex" />
      </div>
    ),
    { ...size }
  )
}
