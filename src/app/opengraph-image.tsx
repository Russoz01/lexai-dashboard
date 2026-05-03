import { ImageResponse } from 'next/og'
import { SITE_URL } from '@/lib/site-url'
import { AGENT_COUNT } from '@/lib/catalog'

// Next.js App Router native OG image generation
// Size recommended by social platforms: 1200x630
// edge runtime removido — AGENT_COUNT vem de catalog.ts que precisa node runtime
// pra Array.filter complexo (audit elite 2026-05-03 #9).
export const alt = 'Pralvex — Inteligencia juridica'
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
              background: 'linear-gradient(135deg, #1a1410 0%, #0a0807 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(191,166,142,0.48)',
              boxShadow: 'inset 0 1px 0 rgba(230,212,189,0.18), 0 10px 40px rgba(191,166,142,0.35)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${SITE_URL}/logo-p.png`} width="72" height="72" alt="Pralvex" />
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
              Pralvex
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
              Inteligencia juridica
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
            {AGENT_COUNT.implemented} agentes de IA prontos para escritorios de advocacia &mdash; analise de documentos,
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
              Demo 50 min gratis sem cartao
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
            pralvex.com.br
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
