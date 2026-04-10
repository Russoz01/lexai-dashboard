import { ImageResponse } from 'next/og'

// Next.js App Router native OG image generation
// Size recommended by social platforms: 1200x630
export const runtime = 'edge'
export const alt = 'LexAI — Inteligencia Juridica · uma marca Vanix Corp'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0e181c 0%, #132025 50%, #0e181c 100%)',
          padding: 80,
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: 120,
            right: -80,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(191,166,142,0.22) 0%, rgba(191,166,142,0) 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: -40,
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(68,55,43,0.18) 0%, rgba(68,55,43,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Header: logo + brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              background: 'linear-gradient(135deg, #bfa68e, #a08970)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(191,166,142,0.42)',
            }}
          >
            <svg width="52" height="44" viewBox="0 0 28 24" fill="none">
              <path d="M3 3 L3 21 L11 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 3 L25 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M25 3 L13 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#F1F1F1',
                letterSpacing: '-1px',
                lineHeight: 1,
              }}
            >
              LexAI
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.50)',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginTop: 6,
              }}
            >
              by Vanix Corp
            </div>
          </div>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 2, maxWidth: 960 }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: '#F1F1F1',
              letterSpacing: '-2.5px',
              lineHeight: 1.02,
              marginBottom: 24,
            }}
          >
            Inteligencia juridica
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #d4c1a7, #bfa68e, #a08970)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-2.5px',
              lineHeight: 1.02,
              marginBottom: 36,
              display: 'flex',
            }}
          >
            que pensa com voce.
          </div>

          <div
            style={{
              fontSize: 26,
              color: 'rgba(255,255,255,0.58)',
              lineHeight: 1.4,
              maxWidth: 820,
              display: 'flex',
            }}
          >
            12 agentes de IA para advogados e estudantes &mdash; analise de documentos,
            jurisprudencia, pecas processuais, calculos e mais.
          </div>
        </div>

        {/* Footer strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
            paddingTop: 32,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 28,
              alignItems: 'center',
              fontSize: 18,
              color: 'rgba(255,255,255,0.50)',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 12px rgba(16,185,129,0.6)',
                  display: 'flex',
                }}
              />
              2 dias gratis sem cartao
            </div>
            <div style={{ color: 'rgba(255,255,255,0.20)', display: 'flex' }}>·</div>
            <div style={{ display: 'flex' }}>LGPD compliant</div>
            <div style={{ color: 'rgba(255,255,255,0.20)', display: 'flex' }}>·</div>
            <div style={{ display: 'flex' }}>Cancele quando quiser</div>
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#F1F1F1',
              letterSpacing: '0.3px',
              display: 'flex',
            }}
          >
            lexai.com.br
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
