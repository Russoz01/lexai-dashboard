'use client'

import { type ComponentType, type SVGProps } from 'react'

/**
 * AgentHero — hero editorial diferenciado por agente.
 *
 * Corrige o queixume: "muda de agente só muda o texto, resto é a mesma base".
 * Agora cada agente recebe:
 *  - accent (paleta champagne variada: gold, copper, rose, sand, bronze, pearl)
 *  - edition (Nº romano próprio — I..XXVII)
 *  - emblem (Icon + glow que pulsa em sua tonalidade)
 *  - discipline (Playfair italic, linha abaixo do nome)
 *  - meta chips (tempo médio, precisão, output)
 *  - steps pictográficos (3 passos numerados)
 *  - exemplos clicáveis (populam o input do agente)
 *
 * Padrão de uso:
 *   <AgentHero
 *     edition="Nº I"
 *     Icon={BookText}
 *     name="Estrategista"
 *     discipline="Pareceres fundamentados"
 *     description="..."
 *     accent="gold"
 *     meta={[{ Icon: Clock, label: 'Tempo médio', value: '~50s' }, ...]}
 *     steps={[{ n: 'I', title: 'Descreva a questão', desc: '...' }, ...]}
 *     examples={[{ label: 'Marketplace responde?', prompt: '...' }]}
 *     onExampleClick={setPergunta}
 *     shortcut="⌘⏎ gerar"
 *   />
 */

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>

type Accent = 'gold' | 'copper' | 'rose' | 'sand' | 'bronze' | 'pearl'

const ACCENTS: Record<
  Accent,
  { hue: string; glow: string; border: string; chipBg: string; titleGradient: string }
> = {
  gold: {
    hue: '#bfa68e',
    glow: 'rgba(191,166,142,0.35)',
    border: 'rgba(191,166,142,0.32)',
    chipBg: 'rgba(191,166,142,0.08)',
    titleGradient: 'linear-gradient(135deg, #e6d4bd 0%, #bfa68e 50%, #8a6f55 100%)',
  },
  copper: {
    hue: '#c78a61',
    glow: 'rgba(199,138,97,0.34)',
    border: 'rgba(199,138,97,0.32)',
    chipBg: 'rgba(199,138,97,0.08)',
    titleGradient: 'linear-gradient(135deg, #e2b18d 0%, #c78a61 50%, #8a5a3a 100%)',
  },
  rose: {
    hue: '#c99a92',
    glow: 'rgba(201,154,146,0.32)',
    border: 'rgba(201,154,146,0.30)',
    chipBg: 'rgba(201,154,146,0.08)',
    titleGradient: 'linear-gradient(135deg, #e6c5bd 0%, #c99a92 50%, #8c5f58 100%)',
  },
  sand: {
    hue: '#d4bfa0',
    glow: 'rgba(212,191,160,0.32)',
    border: 'rgba(212,191,160,0.32)',
    chipBg: 'rgba(212,191,160,0.08)',
    titleGradient: 'linear-gradient(135deg, #ecdcb9 0%, #d4bfa0 50%, #9a8564 100%)',
  },
  bronze: {
    hue: '#a8855c',
    glow: 'rgba(168,133,92,0.30)',
    border: 'rgba(168,133,92,0.30)',
    chipBg: 'rgba(168,133,92,0.08)',
    titleGradient: 'linear-gradient(135deg, #c6a479 0%, #a8855c 50%, #70502f 100%)',
  },
  pearl: {
    hue: '#e6d4bd',
    glow: 'rgba(230,212,189,0.40)',
    border: 'rgba(230,212,189,0.30)',
    chipBg: 'rgba(230,212,189,0.08)',
    titleGradient: 'linear-gradient(135deg, #f5e9d5 0%, #e6d4bd 50%, #b89a70 100%)',
  },
}

export interface AgentHeroMeta {
  Icon: IconType
  label: string
  value: string
}
export interface AgentHeroStep {
  n: string
  title: string
  desc: string
}
export interface AgentHeroExample {
  label: string
  prompt: string
}

interface AgentHeroProps {
  edition: string
  Icon: IconType
  name: string
  discipline: string
  description: string
  accent?: Accent
  meta?: AgentHeroMeta[]
  steps?: AgentHeroStep[]
  examples?: AgentHeroExample[]
  onExampleClick?: (prompt: string) => void
  shortcut?: string
}

export function AgentHero({
  edition,
  Icon,
  name,
  discipline,
  description,
  accent = 'gold',
  meta = [],
  steps = [],
  examples = [],
  onExampleClick,
  shortcut,
}: AgentHeroProps) {
  const palette = ACCENTS[accent]

  return (
    <section
      className="agent-hero"
      style={{
        position: 'relative',
        marginBottom: 28,
        padding: '28px 30px',
        borderRadius: 18,
        border: `1px solid ${palette.border}`,
        background: `
          radial-gradient(140% 60% at 0% 0%, ${palette.chipBg}, transparent 55%),
          linear-gradient(180deg, rgba(26,20,16,0.28) 0%, rgba(10,8,7,0.12) 100%),
          var(--card-bg)
        `,
        boxShadow: `inset 0 1px 0 ${palette.hue}22, 0 14px 40px -18px ${palette.glow}`,
        overflow: 'hidden',
      }}
    >
      {/* grid mask decorativo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(to right, ${palette.hue}14 1px, transparent 1px),
            linear-gradient(to bottom, ${palette.hue}14 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(circle at 100% 0%, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 100% 0%, black, transparent 70%)',
          opacity: 0.35,
        }}
      />

      {/* header row */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* emblem */}
        <div
          className="agent-hero-emblem"
          style={{
            width: 68,
            height: 68,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: `linear-gradient(135deg, ${palette.hue}1f 0%, ${palette.hue}08 100%)`,
            border: `1px solid ${palette.hue}4a`,
            boxShadow: `inset 0 1px 0 ${palette.hue}33, 0 0 28px -6px ${palette.glow}`,
            color: palette.hue,
            position: 'relative',
          }}
        >
          <Icon size={30} strokeWidth={1.6} aria-hidden />
          {/* glow pulsante */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 20,
              border: `1px solid ${palette.hue}30`,
              animation: 'agent-hero-pulse 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* title block — minWidth defensivo p/ mobile (era 260 fixo,
            estourava em <360px com emblem 68 + gap 20) */}
        <div style={{ flex: '1 1 220px', minWidth: 'min(220px, 100%)' }}>
          <div
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10.5,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: palette.hue,
              marginBottom: 8,
              opacity: 0.9,
            }}
          >
            {edition} · Pralvex · Agente IA
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 600,
              fontSize: 'clamp(28px, 3.6vw, 40px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              color: 'var(--text-primary)',
            }}
          >
            {name}{' '}
            <em
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                backgroundImage: palette.titleGradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              — {discipline}
            </em>
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14.5,
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              maxWidth: 680,
            }}
          >
            {description}
          </p>
        </div>

        {/* shortcut badge */}
        {shortcut && (
          <div
            aria-label={`Atalho: ${shortcut}`}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: palette.hue,
              padding: '6px 12px',
              border: `1px solid ${palette.hue}40`,
              borderRadius: 999,
              background: palette.chipBg,
              whiteSpace: 'nowrap',
            }}
          >
            {shortcut}
          </div>
        )}
      </div>

      {/* meta chips row */}
      {meta.length > 0 && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            marginTop: 22,
          }}
        >
          {meta.map((m, i) => {
            const MIcon = m.Icon
            return (
              <div
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 14px 8px 12px',
                  borderRadius: 12,
                  border: `1px solid ${palette.border}`,
                  background: palette.chipBg,
                }}
              >
                <MIcon size={14} strokeWidth={1.75} aria-hidden style={{ color: palette.hue }} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span
                    style={{
                      fontSize: 9.5,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      marginTop: 1,
                    }}
                  >
                    {m.value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* steps pictográficos */}
      {steps.length > 0 && (
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
            gap: 10,
            marginTop: 22,
          }}
          className="agent-hero-steps"
        >
          {steps.map((s, i) => (
            <div
              key={i}
              className="agent-hero-step"
              style={{
                position: 'relative',
                padding: '14px 16px',
                borderRadius: 12,
                border: `1px solid var(--border)`,
                background: 'var(--input-bg, rgba(0,0,0,0.18))',
                transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 18,
                  fontWeight: 600,
                  color: palette.hue,
                  marginBottom: 6,
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* exemplos clicáveis */}
      {examples.length > 0 && (
        <div style={{ position: 'relative', marginTop: 22 }}>
          <div
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 10,
            }}
          >
            Exemplos rápidos — clique p/ preencher
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onExampleClick?.(ex.prompt)}
                className="agent-hero-example"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: `1px dashed ${palette.hue}55`,
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ color: palette.hue, fontWeight: 700 }}>+</span>
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes agent-hero-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.04); }
        }
        .agent-hero-step:hover {
          transform: translateY(-2px);
          border-color: ${palette.hue}66 !important;
          background: ${palette.chipBg} !important;
        }
        .agent-hero-example:hover {
          border-style: solid !important;
          background: ${palette.chipBg} !important;
          color: var(--text-primary) !important;
          transform: translateY(-1px);
        }
        @media (max-width: 720px) {
          .agent-hero { padding: 22px 20px !important; }
          .agent-hero-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

export default AgentHero
