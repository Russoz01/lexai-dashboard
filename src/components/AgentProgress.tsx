'use client'

/* ════════════════════════════════════════════════════════════════════
 * AgentProgress · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Status progress visual durante chamada de agente IA.
 *
 * Por que existe: streaming JSON é complexo (Pralvex retorna JSON
 * estruturado, não texto livre). Em vez de implementar streaming JSON
 * parcial (mais 12-15h de refactor), mostramos uma barra de progresso
 * com etapas que rotacionam — UX premium do mesmo jeito.
 *
 * Inspirado em: Linear (jobs), Stripe (payment processing), Anthropic
 * (claude.ai com etapas reasoning).
 *
 * Uso:
 *   const [loading, setLoading] = useState(false)
 *   ...
 *   <AgentProgress loading={loading} steps={[
 *     'Lendo documento...',
 *     'Identificando partes e cláusulas...',
 *     'Avaliando riscos jurídicos...',
 *     'Estruturando análise final...',
 *   ]} />
 *
 * Etapas rotacionam a cada ~7s (cobrindo o tempo médio de resposta IA
 * de ~30s). Quando IA responde, parent component seta loading=false.
 * ═══════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

interface AgentProgressProps {
  loading: boolean
  steps: string[]
  /** Tempo entre rotação de etapas em ms. Default 7000ms (7s). */
  stepIntervalMs?: number
  /** Texto a mostrar quando loading=false. Se omitido, componente some. */
  idleText?: string
  /** Cor de destaque. Default champagne #bfa68e. */
  accent?: string
  /** Variante compacta sem barra de progresso. */
  compact?: boolean
}

export function AgentProgress({
  loading,
  steps,
  stepIntervalMs = 7000,
  idleText,
  accent = '#bfa68e',
  compact = false,
}: AgentProgressProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (!loading) {
      setStepIdx(0)
      setElapsedMs(0)
      return
    }

    const stepTimer = setInterval(() => {
      setStepIdx(idx => Math.min(idx + 1, steps.length - 1))
    }, stepIntervalMs)

    const elapsedTimer = setInterval(() => {
      setElapsedMs(ms => ms + 1000)
    }, 1000)

    return () => {
      clearInterval(stepTimer)
      clearInterval(elapsedTimer)
    }
  }, [loading, steps.length, stepIntervalMs])

  if (!loading) {
    if (!idleText) return null
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 8,
        background: 'var(--accent-light, rgba(191,166,142,0.06))',
        border: '1px solid var(--border, rgba(191,166,142,0.16))',
        fontSize: 13, color: 'var(--text-muted)',
      }}>
        <Sparkles size={14} strokeWidth={1.75} style={{ color: accent }} aria-hidden />
        <span>{idleText}</span>
      </div>
    )
  }

  const currentStep = steps[stepIdx] || steps[steps.length - 1] || 'Processando...'
  const progress = Math.min(95, ((stepIdx + 1) / steps.length) * 90 + (elapsedMs / 60000) * 5)
  const elapsedSec = Math.floor(elapsedMs / 1000)

  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 999,
          background: `${accent}14`,
          border: `1px solid ${accent}30`,
          fontSize: 12, color: accent, fontWeight: 500,
        }}
      >
        <Loader2 size={12} strokeWidth={2} className="animate-spin" aria-hidden />
        <span>{currentStep}</span>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: '14px 16px', borderRadius: 12,
        background: 'var(--card-bg, #fff)',
        border: '1px solid var(--border, rgba(191,166,142,0.18))',
        boxShadow: `0 4px 16px ${accent}10`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Loader2 size={14} strokeWidth={2} className="animate-spin" style={{ color: accent }} aria-hidden />
        <span style={{
          flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
        }}>
          {currentStep}
        </span>
        <span style={{
          fontSize: 11, fontVariantNumeric: 'tabular-nums',
          color: 'var(--text-muted)', fontFamily: 'var(--font-mono, ui-monospace), monospace',
        }}>
          {elapsedSec}s
        </span>
      </div>
      <div
        aria-hidden
        style={{
          width: '100%', height: 4, borderRadius: 999,
          background: 'var(--border, rgba(191,166,142,0.12))',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`, height: '100%',
            background: `linear-gradient(90deg, ${accent}, ${accent}dd)`,
            borderRadius: 999,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  )
}

/** Presets de etapas por tipo de agente — uso direto sem digitar steps */
export const AGENT_STEPS = {
  resumidor: [
    'Lendo documento...',
    'Identificando partes e cláusulas...',
    'Avaliando riscos e prazos...',
    'Estruturando resumo final...',
  ],
  redator: [
    'Analisando contexto e fundamentos...',
    'Estruturando peça processual...',
    'Citando jurisprudência relevante...',
    'Refinando linguagem técnica...',
  ],
  contestador: [
    'Analisando tese da inicial...',
    'Levantando preliminares (Art. 337 CPC)...',
    'Construindo impugnação específica...',
    'Estruturando teses defensivas...',
  ],
  parecerista: [
    'Examinando questão jurídica...',
    'Pesquisando legislação aplicável...',
    'Considerando posições doutrinárias...',
    'Estruturando parecer fundamentado...',
  ],
  consultor: [
    'Analisando a consulta...',
    'Identificando teses favoráveis e contrárias...',
    'Avaliando jurisprudência aplicável...',
    'Formulando recomendação estratégica...',
  ],
  pesquisador: [
    'Buscando jurisprudência aplicável...',
    'Filtrando STF, STJ e tribunais...',
    'Avaliando relevância dos precedentes...',
    'Estruturando síntese final...',
  ],
  audiencia: [
    'Analisando tipo de audiência...',
    'Estruturando roteiro estratégico...',
    'Antecipando pontos críticos...',
    'Preparando linha de questionamento...',
  ],
  recursos: [
    'Analisando decisão recorrida...',
    'Identificando vícios processuais...',
    'Construindo razões recursais...',
    'Estruturando peça final...',
  ],
  estrategista: [
    'Mapeando cenário processual...',
    'Avaliando opções estratégicas...',
    'Estruturando plano em fases...',
    'Refinando recomendação final...',
  ],
  risco: [
    'Lendo documento...',
    'Mapeando cláusulas críticas...',
    'Calculando exposição financeira...',
    'Estruturando análise de risco...',
  ],
  calculador: [
    'Validando dados de entrada...',
    'Aplicando correção monetária...',
    'Calculando juros e multas...',
    'Estruturando memorial de cálculo...',
  ],
  legislacao: [
    'Localizando dispositivo legal...',
    'Buscando jurisprudência aplicável...',
    'Compilando explicação técnica...',
    'Estruturando consulta final...',
  ],
  compliance: [
    'Analisando operação...',
    'Verificando Provimento 205 OAB...',
    'Avaliando riscos LGPD...',
    'Estruturando relatório...',
  ],
  tradutor: [
    'Lendo texto original...',
    'Identificando termos técnicos...',
    'Adaptando para linguagem-alvo...',
    'Refinando precisão jurídica...',
  ],
  negociador: [
    'Analisando situação...',
    'Calculando BATNA e ZOPA...',
    'Estruturando estratégia...',
    'Preparando script de negociação...',
  ],
  marketing: [
    'Analisando tópico...',
    'Verificando Provimento 205 OAB...',
    'Gerando variações de copy...',
    'Refinando linguagem...',
  ],
  default: [
    'Processando...',
    'Analisando dados...',
    'Estruturando resposta...',
    'Refinando saída...',
  ],
} as const
