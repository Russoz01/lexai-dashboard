'use client'

import {
  CalendarDays,
  Goal,
  ListChecks,
  TrendingDown,
  BellRing,
  Gauge,
} from 'lucide-react'
import { AgentPreviewStage } from '@/components/ui/agent-preview-stage'

/* /dashboard/plano — v1 preview stage · 2026-04-23
 * Plano de Estudos IA. Wizard: tempo até prova + horas/dia → cronograma
 * detalhado por disciplina + ajuste dinâmico conforme desempenho. Fim
 * da paralisia 'por onde começar'. */

export default function PlanoPage() {
  return (
    <AgentPreviewStage
      Icon={CalendarDays}
      kicker="Nº 028 · Módulo Plano"
      name="Plano"
      tagline="Você diz a prova e o tempo. O agente devolve o mapa diário. Ajusta quando você fura — e adapta ao seu ritmo real."
      description="A paralisia do 'por onde começar' mata mais preparação de OAB do que dificuldade de matéria. Plano pega a data da prova, suas horas disponíveis, seu nível atual (via simulado diagnóstico) e gera cronograma dia-a-dia: 'segunda 14h-16h Constitucional arts. 1-12 + 20 questões'. Se você fura 2 dias, o agente realoca. Se está detonando Civil mas travando Trabalhista, ele rebalanceia."
      statusLabel="Beta fechado · Release 2026-06"
      planBadge="Pro"
      glowTint="#e8c896"
      capabilities={[
        {
          Icon: Goal,
          title: 'Cronograma até a data',
          body: 'Prova 15 de julho, 4h/dia disponíveis → plano de 85 dias dia-a-dia, matéria por matéria.',
          featured: true,
        },
        {
          Icon: ListChecks,
          title: 'Blocos de 50min',
          body: 'Pomodoro embutido. Cada bloco tem objetivo específico: ler X, resolver Y questões, revisar flashcards.',
        },
        {
          Icon: TrendingDown,
          title: 'Ajuste por desempenho',
          body: 'Errou 70% de tributário? Próxima semana tem 1h a mais de tributário. Dominou civil? Corta ritmo.',
        },
        {
          Icon: BellRing,
          title: 'Notificação diária',
          body: 'WhatsApp 6h da manhã: "hoje é Const arts 5-10 + 30 questões + 20 flashcards". Sem abrir app.',
        },
        {
          Icon: Gauge,
          title: 'Barra de progresso real',
          body: 'Não é porcentagem fake. Soma cartas dominadas + questões acertadas vs total da prova.',
        },
        {
          Icon: CalendarDays,
          title: 'Replanejamento ilimitado',
          body: 'Furou semana inteira por doença? Um clique e o plano redistribui as horas restantes. Sem culpa.',
        },
      ]}
      example={{
        prompt:
          'Faz um plano de OAB pra mim. Prova dia 15 de julho, tenho 3 horas por dia, sou fraco em tributário e forte em civil.',
        outputLabel: 'Plano diagnóstico · 83 dias',
        response: `Plano "OAB 41 Unificada · Marina Dias" · 83 dias · 249h

Diagnóstico
  Civil           85% dominado  · 8h alocadas (revisão)
  Constitucional  62% dominado  · 24h alocadas
  Penal           58% dominado  · 28h alocadas
  Tributário      34% dominado  · 42h alocadas ← prioridade
  Trabalhista     51% dominado  · 32h alocadas
  Processo Civil  47% dominado  · 38h alocadas
  Empresarial     45% dominado  · 28h alocadas
  Ética/ECA/Amb   60% dominado  · 18h alocadas
  Revisão final   ----          · 30h alocadas (últimos 10d)

Semana 1 (começa segunda 2026-04-24)
  Seg 14h-17h  Tributário · art 145-156 CTN + 20 questões FGV
  Ter 14h-17h  Tributário · art 157-168 CTN + 20 questões
  Qua 14h-17h  Constitucional · arts 1-14 + revisão flashcards
  Qui 14h-17h  Tributário · imunidades + 25 questões
  Sex 14h-17h  Penal · crimes contra pessoa + 20 questões
  Sáb 9h-12h   Simulado 40 questões (mix semana)
  Dom          FOLGA · reload mental

Notificação WhatsApp ativada às 6h.
Plano visível em /dashboard/plano/atual.`,
      }}
    />
  )
}
