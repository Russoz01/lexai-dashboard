import { ImageResponse } from 'next/og'

// Pralvex favicon — monograma dourado P + balança da justiça
// v2 (2026-05-02): substitui PX text pelo logo dourado gerado via SVG inline
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
        <svg width="44" height="44" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#fff3d6" />
              <stop offset="35%" stopColor="#e6d4bd" />
              <stop offset="65%" stopColor="#bfa68e" />
              <stop offset="100%" stopColor="#8a6f55" />
            </linearGradient>
          </defs>
          <path
            d="M 56 26 L 56 174 L 78 174 L 78 116 L 116 116 C 152 116 174 99 174 71 C 174 43 152 26 116 26 Z M 78 46 L 116 46 C 140 46 152 56 152 71 C 152 86 140 96 116 96 L 78 96 Z"
            fill="url(#g)"
          />
          <g transform="translate(112, 56) scale(0.32)" stroke="#8a6f55" strokeWidth="3" fill="url(#g)">
            <line x1="40" y1="0" x2="40" y2="80" />
            <line x1="6" y1="14" x2="74" y2="14" />
            <circle cx="40" cy="0" r="4" />
            <path d="M 4 32 L 24 32 L 20 44 L 8 44 Z" />
            <path d="M 56 32 L 76 32 L 72 44 L 60 44 Z" />
            <line x1="32" y1="80" x2="48" y2="80" strokeWidth="5" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  )
}
