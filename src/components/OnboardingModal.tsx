'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/* ------------------------------------------------------------------ */
/*  Agent definitions                                                  */
/* ------------------------------------------------------------------ */

type AgentKey = 'resumidor' | 'pesquisador' | 'redator'

interface AgentDef {
  key: AgentKey
  icon: string
  label: string
  serial: string
  desc: string
  sampleTitle: string
  sampleBody: string
  cta: string
  href: string
}

const AGENTS: AgentDef[] = [
  {
    key: 'resumidor',
    icon: 'bi-text-paragraph',
    label: 'Resumidor',
    serial: 'N\u00b0 001 \u00b7 GABINETE \u00b7 MMXXVI',
    desc: 'Analise estruturada de contratos, peticoes e acordaos com clausulas criticas e prazos.',
    sampleTitle: 'Clausula contratual de exemplo',
    sampleBody:
      'O locatario obriga-se a devolver o imovel no estado em que o recebeu, ressalvado o desgaste natural, sob pena de multa equivalente a tres alugueis vigentes, sem prejuizo de perdas e danos.',
    cta: 'Analisar agora',
    href: '/dashboard/resumidor?sample=1',
  },
  {
    key: 'pesquisador',
    icon: 'bi-journal-bookmark',
    label: 'Pesquisador',
    serial: 'N\u00b0 002 \u00b7 GABINETE \u00b7 MMXXVI',
    desc: 'Jurisprudencia do STF, STJ, TRFs e TJs com ementa, tribunal e data verificados.',
    sampleTitle: 'Consulta de exemplo',
    sampleBody: 'Jurisprudencia sobre dano moral em relacao de consumo',
    cta: 'Pesquisar agora',
    href: '/dashboard/pesquisador?sample=1',
  },
  {
    key: 'redator',
    icon: 'bi-pencil-square',
    label: 'Redator',
    serial: 'N\u00b0 003 \u00b7 GABINETE \u00b7 MMXXVI',
    desc: 'Peticoes, recursos e contestacoes com fundamentacao doutrinaria e jurisprudencial.',
    sampleTitle: 'Modelo de exemplo',
    sampleBody: 'Peticao inicial de indenizacao por dano moral',
    cta: 'Redigir agora',
    href: '/dashboard/redator?sample=1',
  },
]

const TOTAL_STEPS = 3

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OnboardingModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedAgent, setSelectedAgent] = useState<AgentDef | null>(null)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  /* key forces re-mount of the animated wrapper so the CSS animation replays */
  const [animKey, setAnimKey] = useState(0)

  /* Reset when re-opened */
  useEffect(() => {
    if (open) {
      setStep(0)
      setSelectedAgent(null)
      setDirection('forward')
      setAnimKey(k => k + 1)
    }
  }, [open])

  /* Escape to close */
  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const markOnboarded = useCallback(() => {
    try {
      localStorage.setItem('lexai-onboarded', '1')
    } catch {
      /* SSR / privacy mode — silently ignore */
    }
  }, [])

  const handleSkip = useCallback(() => {
    markOnboarded()
    onClose()
  }, [markOnboarded, onClose])

  const goTo = useCallback(
    (target: number) => {
      setDirection(target > step ? 'forward' : 'back')
      setStep(target)
      setAnimKey(k => k + 1)
    },
    [step],
  )

  const handleAgentPick = useCallback(
    (agent: AgentDef) => {
      setSelectedAgent(agent)
      goTo(1)
    },
    [goTo],
  )

  const handleAction = useCallback(() => {
    if (!selectedAgent) return
    markOnboarded()
    onClose()
    router.push(selectedAgent.href)
  }, [selectedAgent, markOnboarded, onClose, router])

  const handleFinish = useCallback(() => {
    markOnboarded()
    onClose()
  }, [markOnboarded, onClose])

  if (!open) return null

  /* ---------------------------------------------------------------- */
  /*  Render helpers per step                                          */
  /* ---------------------------------------------------------------- */

  const renderStep0 = () => (
    <>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          color: 'var(--accent, #BFA68E)',
          marginBottom: 6,
        }}
      >
        N&deg; 001 &middot; GABINETE &middot; MMXXVI
      </p>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text-primary, #F3EEE4)',
          marginBottom: 8,
          lineHeight: 1.25,
        }}
      >
        Bem-vindo ao LexAI
      </h2>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-secondary, #a8a8a0)',
          lineHeight: 1.6,
          marginBottom: 32,
          maxWidth: 420,
          marginInline: 'auto',
        }}
      >
        Escolha um agente para experimentar. Voce pode explorar os demais depois.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {AGENTS.map(agent => (
          <button
            key={agent.key}
            type="button"
            onClick={() => handleAgentPick(agent)}
            className="onb-agent-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border, rgba(255,255,255,0.08))',
              borderRadius: 14,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--accent-light, rgba(191,166,142,0.12))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <i
                className={`bi ${agent.icon}`}
                style={{ fontSize: 20, color: 'var(--accent, #BFA68E)' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary, #F3EEE4)',
                  display: 'block',
                  marginBottom: 2,
                }}
              >
                {agent.label}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: 'var(--text-secondary, #a8a8a0)',
                  lineHeight: 1.45,
                  display: 'block',
                }}
              >
                {agent.desc}
              </span>
            </div>
            <i
              className="bi bi-chevron-right"
              style={{ fontSize: 14, color: 'var(--text-secondary, #a8a8a0)', flexShrink: 0 }}
            />
          </button>
        ))}
      </div>
    </>
  )

  const renderStep1 = () => {
    if (!selectedAgent) return null
    return (
      <>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase' as const,
            color: 'var(--accent, #BFA68E)',
            marginBottom: 6,
          }}
        >
          {selectedAgent.serial}
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-primary, #F3EEE4)',
            marginBottom: 8,
            lineHeight: 1.25,
          }}
        >
          {selectedAgent.label}
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'var(--text-secondary, #a8a8a0)',
            lineHeight: 1.6,
            marginBottom: 24,
            maxWidth: 420,
            marginInline: 'auto',
          }}
        >
          Preparamos um exemplo para voce testar agora mesmo.
        </p>

        {/* Sample card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            borderRadius: 14,
            padding: '20px 22px',
            textAlign: 'left',
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: 'var(--accent, #BFA68E)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            {selectedAgent.sampleTitle}
          </span>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: 'var(--text-primary, #F3EEE4)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {selectedAgent.sampleBody}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => goTo(0)}
            className="onb-btn-ghost"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: 'var(--text-secondary, #a8a8a0)',
              background: 'none',
              border: '1px solid var(--border, rgba(255,255,255,0.08))',
              borderRadius: 10,
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <i className="bi bi-arrow-left" style={{ marginRight: 6 }} />
            Voltar
          </button>
          <button
            type="button"
            onClick={handleAction}
            className="onb-btn-primary"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--bg-base, #0C1B20)',
              background: 'var(--accent, #BFA68E)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {selectedAgent.cta}
            <i className="bi bi-arrow-right" style={{ marginLeft: 6 }} />
          </button>
        </div>
      </>
    )
  }

  const renderStep2 = () => (
    <>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--accent-light, rgba(191,166,142,0.12))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <i
          className="bi bi-check-lg"
          style={{ fontSize: 28, color: 'var(--accent, #BFA68E)' }}
        />
      </div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text-primary, #F3EEE4)',
          marginBottom: 8,
          lineHeight: 1.25,
        }}
      >
        Seu gabinete esta pronto.
      </h2>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-secondary, #a8a8a0)',
          lineHeight: 1.6,
          marginBottom: 28,
          maxWidth: 420,
          marginInline: 'auto',
        }}
      >
        Explore os demais agentes no menu lateral ou use o Chat para que o
        orquestrador direcione automaticamente.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          marginBottom: 28,
        }}
      >
        {AGENTS.filter(a => a.key !== selectedAgent?.key).map(a => (
          <span
            key={a.key}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: 'var(--accent, #BFA68E)',
              border: '1px solid var(--border, rgba(255,255,255,0.08))',
              borderRadius: 8,
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className={`bi ${a.icon}`} style={{ fontSize: 13 }} />
            {a.label}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={handleFinish}
        className="onb-btn-primary"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--bg-base, #0C1B20)',
          background: 'var(--accent, #BFA68E)',
          border: 'none',
          borderRadius: 10,
          padding: '10px 28px',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        Fechar
      </button>
    </>
  )

  const stepRenderers = [renderStep0, renderStep1, renderStep2]

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'max(80px, 14vh)',
        paddingInline: 24,
        paddingBottom: 24,
        animation: 'onb-fadeIn 0.25s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg, #11252B)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
          borderRadius: 20,
          maxWidth: 560,
          width: '100%',
          padding: '40px 36px 32px',
          textAlign: 'center',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Skip button */}
        <button
          type="button"
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: 'var(--text-secondary, #a8a8a0)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            letterSpacing: '0.06em',
            transition: 'color 0.2s',
          }}
          className="onb-skip"
        >
          Pular
        </button>

        {/* Animated step wrapper */}
        <div
          key={animKey}
          style={{
            animation:
              direction === 'forward'
                ? 'onb-slideInRight 0.3s ease both'
                : 'onb-slideInLeft 0.3s ease both',
          }}
        >
          {stepRenderers[step]()}
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginTop: 28,
          }}
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              style={{
                width: i === step ? 10 : 8,
                height: i === step ? 10 : 8,
                borderRadius: '50%',
                background:
                  i === step
                    ? 'var(--accent, #BFA68E)'
                    : i < step
                      ? 'rgba(191,166,142,0.4)'
                      : 'var(--border, rgba(255,255,255,0.08))',
                transition: 'all 0.25s ease',
                display: 'block',
              }}
              aria-label={`Passo ${i + 1} de ${TOTAL_STEPS}`}
            />
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Scoped CSS animations + hover states                         */}
      {/* ------------------------------------------------------------ */}
      <style jsx>{`
        @keyframes onb-fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes onb-slideInRight {
          from {
            opacity: 0;
            transform: translateX(32px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes onb-slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-32px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      {/* Global hover styles — styled-jsx global block */}
      <style jsx global>{`
        .onb-agent-card:hover {
          border-color: var(--accent, #BFA68E) !important;
          background: rgba(191, 166, 142, 0.06) !important;
        }
        .onb-btn-primary:hover {
          opacity: 0.88;
        }
        .onb-btn-ghost:hover {
          border-color: var(--accent, #BFA68E) !important;
        }
        .onb-skip:hover {
          color: var(--text-primary, #F3EEE4) !important;
        }
      `}</style>
    </div>
  )
}
