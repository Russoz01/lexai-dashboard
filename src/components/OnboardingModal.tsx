'use client'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, type LucideIcon,
} from 'lucide-react'
import s from './OnboardingModal.module.css'
import { featuredAgents, type CatalogItem } from '@/lib/catalog'

/* ------------------------------------------------------------------ */
/*  Agent definitions                                                  */
/* ------------------------------------------------------------------ */

interface AgentDef {
  key: string
  Icon: LucideIcon
  label: string
  serial: string
  desc: string
  sampleTitle: string
  sampleBody: string
  cta: string
  href: string
}

/**
 * Sample-prompts canonicos por agente. Wave R3 (2026-05-03): em vez de
 * hardcoded AgentKey union, deriva de featuredAgents() do catalog. Quando
 * marcamos novo agente featured:true ele aparece aqui automatico.
 * Top 3 featured viram cards do step 0; sample-text aqui bate por slug.
 */
const AGENT_SAMPLES: Record<string, { sampleTitle: string; sampleBody: string; cta: string }> = {
  chat: {
    sampleTitle: 'Pergunta de exemplo',
    sampleBody: 'Tenho um cliente com prazo de embargos de declaracao vencendo terca, qual agente uso?',
    cta: 'Abrir chat',
  },
  resumidor: {
    sampleTitle: 'Clausula contratual de exemplo',
    sampleBody: 'O locatario obriga-se a devolver o imovel no estado em que o recebeu, ressalvado o desgaste natural, sob pena de multa equivalente a tres alugueis vigentes, sem prejuizo de perdas e danos.',
    cta: 'Analisar agora',
  },
  pesquisador: {
    sampleTitle: 'Consulta de exemplo',
    sampleBody: 'Jurisprudencia sobre dano moral em relacao de consumo',
    cta: 'Pesquisar agora',
  },
  redator: {
    sampleTitle: 'Modelo de exemplo',
    sampleBody: 'Peticao inicial de indenizacao por dano moral',
    cta: 'Redigir agora',
  },
  calculador: {
    sampleTitle: 'Calculo de exemplo',
    sampleBody: 'Calcule prazo de apelacao a partir de 03/04/2026 com feriado municipal SP',
    cta: 'Calcular agora',
  },
}

function buildAgentDefs(items: CatalogItem[]): AgentDef[] {
  return items.slice(0, 3).map((item, idx) => {
    const sample = AGENT_SAMPLES[item.slug] ?? {
      sampleTitle: 'Exemplo',
      sampleBody: item.desc,
      cta: 'Abrir agora',
    }
    return {
      key: item.slug,
      Icon: item.Icon,
      label: item.label,
      serial: `N° ${String(idx + 1).padStart(3, '0')} · GABINETE · MMXXVI`,
      desc: item.differentiation || item.desc,
      sampleTitle: sample.sampleTitle,
      sampleBody: sample.sampleBody,
      cta: sample.cta,
      href: `${item.href}?sample=1`,
    }
  })
}

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
  /* AGENTS deriva do catalog featuredAgents() — auto-syncs quando marcamos
     novo agente featured:true. Memoized pra nao recomputar a cada render.
     Pega top 3 featured implementados (chat, resumidor, pesquisador hoje). */
  const AGENTS = useMemo(() => {
    const featured = featuredAgents()
    // Garante que onboarding nunca abre vazio. Se nada featured, pega 3 primeiros
    // implementados como fallback. Slug 'chat' raramente eh feature, prefere
    // workflow agents (resumidor/pesquisador/redator) na ordem catalog.
    const picked = featured.length >= 3
      ? featured.filter(a => a.slug !== 'chat').slice(0, 3)
      : featured.slice(0, 3)
    return buildAgentDefs(picked)
  }, [])

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
      localStorage.setItem('pralvex-onboarded', '1')
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
        Bem-vindo a Pralvex
      </h2>
      <p className={s.desc}>
        Escolha um agente para experimentar. Voce pode explorar os demais depois.
      </p>

      <div className={s.agentList}>
        {AGENTS.map(agent => {
          const Icon = agent.Icon
          return (
            <button
              key={agent.key}
              type="button"
              onClick={() => handleAgentPick(agent)}
              className={s.agentCard}
            >
              <div className={s.agentIcon}>
                <Icon size={20} strokeWidth={1.75} className={s.agentIconI} aria-hidden />
              </div>
              <div className={s.agentInfo}>
                <span className={s.agentLabel}>
                  {agent.label}
                </span>
                <span className={s.agentDesc}>
                  {agent.desc}
                </span>
              </div>
              <ChevronRight size={16} strokeWidth={1.75} className={s.agentChevron} aria-hidden />
            </button>
          )
        })}
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
            <ArrowLeft size={14} strokeWidth={2} style={{ marginRight: 6 }} aria-hidden />
            Voltar
          </button>
          <button
            type="button"
            onClick={handleAction}
            className={s.btnPrimary}
          >
            {selectedAgent.cta}
            <ArrowRight size={14} strokeWidth={2} style={{ marginLeft: 6 }} aria-hidden />
          </button>
        </div>
      </>
    )
  }

  const renderStep2 = () => (
    <>
      <div className={s.finishIcon}>
        <Check size={26} strokeWidth={2.25} className={s.finishIconI} aria-hidden />
      </div>
      <h2 className={s.headingSm}>
        Seu gabinete está pronto.
      </h2>
      <p className={s.descMdGap}>
        Explore os demais agentes no menu lateral ou use o Chat para que o
        orquestrador direcione automaticamente.
      </p>

      <div className={s.tagRow}>
        {AGENTS.filter(a => a.key !== selectedAgent?.key).map(a => {
          const Icon = a.Icon
          return (
            <span key={a.key} className={s.tag}>
              <Icon size={12} strokeWidth={1.75} className={s.tagIcon} aria-hidden />
              {a.label}
            </span>
          )
        })}
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
