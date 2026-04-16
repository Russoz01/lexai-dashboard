'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import s from './OnboardingModal.module.css'

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
      <p className={s.serial}>
        N&deg; 001 &middot; GABINETE &middot; MMXXVI
      </p>
      <h2 className={s.heading}>
        Bem-vindo ao LexAI
      </h2>
      <p className={s.desc}>
        Escolha um agente para experimentar. Voce pode explorar os demais depois.
      </p>

      <div className={s.agentList}>
        {AGENTS.map(agent => (
          <button
            key={agent.key}
            type="button"
            onClick={() => handleAgentPick(agent)}
            className={s.agentCard}
          >
            <div className={s.agentIcon}>
              <i
                className={`bi ${agent.icon} ${s.agentIconI}`}
              />
            </div>
            <div className={s.agentInfo}>
              <span className={s.agentLabel}>
                {agent.label}
              </span>
              <span className={s.agentDesc}>
                {agent.desc}
              </span>
            </div>
            <i className={`bi bi-chevron-right ${s.agentChevron}`} />
          </button>
        ))}
      </div>
    </>
  )

  const renderStep1 = () => {
    if (!selectedAgent) return null
    return (
      <>
        <p className={s.serial}>
          {selectedAgent.serial}
        </p>
        <h2 className={s.headingSm}>
          {selectedAgent.label}
        </h2>
        <p className={s.descSmGap}>
          Preparamos um exemplo para voce testar agora mesmo.
        </p>

        {/* Sample card */}
        <div className={s.sampleCard}>
          <span className={s.sampleTitle}>
            {selectedAgent.sampleTitle}
          </span>
          <p className={s.sampleBody}>
            {selectedAgent.sampleBody}
          </p>
        </div>

        <div className={s.btnRow}>
          <button
            type="button"
            onClick={() => goTo(0)}
            className={s.btnGhost}
          >
            <i className="bi bi-arrow-left" style={{ marginRight: 6 }} />
            Voltar
          </button>
          <button
            type="button"
            onClick={handleAction}
            className={s.btnPrimary}
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
      <div className={s.finishIcon}>
        <i className={`bi bi-check-lg ${s.finishIconI}`} />
      </div>
      <h2 className={s.headingSm}>
        Seu gabinete esta pronto.
      </h2>
      <p className={s.descMdGap}>
        Explore os demais agentes no menu lateral ou use o Chat para que o
        orquestrador direcione automaticamente.
      </p>

      <div className={s.tagRow}>
        {AGENTS.filter(a => a.key !== selectedAgent?.key).map(a => (
          <span key={a.key} className={s.tag}>
            <i className={`bi ${a.icon} ${s.tagIcon}`} />
            {a.label}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={handleFinish}
        className={s.btnPrimaryWide}
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
      className={s.backdrop}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={s.modal}
      >
        {/* Skip button */}
        <button
          type="button"
          onClick={handleSkip}
          className={s.skip}
        >
          Pular
        </button>

        {/* Animated step wrapper */}
        <div
          key={animKey}
          className={direction === 'forward' ? s.slideForward : s.slideBack}
        >
          {stepRenderers[step]()}
        </div>

        {/* Progress dots */}
        <div className={s.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`${s.dot} ${
                i === step
                  ? s.dotActive
                  : i < step
                    ? s.dotDone
                    : s.dotPending
              }`}
              aria-label={`Passo ${i + 1} de ${TOTAL_STEPS}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
