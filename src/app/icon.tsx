import { ImageResponse } from 'next/og'
import { SITE_URL } from '@/lib/site-url'

// Pralvex favicon — usa logo Higgsfield real (logo-p.png) via URL absoluta
// v3 (2026-05-03): substitui SVG inline reconstruido pelo PNG real Higgsfield
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
          border: '1px solid rgba(191,166,142,0.38)',
          boxShadow: 'inset 0 1px 0 rgba(230,212,189,0.12)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${SITE_URL}/logo-p.png`} width="48" height="48" alt="Pralvex" />
      </div>
    ),
    { ...size }
  )
}
