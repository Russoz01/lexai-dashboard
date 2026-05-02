'use client'

import {
  Layers,
  Brain,
  Flame,
  RefreshCcw,
  BookMarked,
  Target,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { AgentPreviewStage } from '@/components/ui/agent-preview-stage'
import { AgentHero } from '@/components/AgentHero'

/* /dashboard/flashcards — v1 preview stage · 2026-04-23
 * SM-2 spaced repetition igual Anki. Professor gera flashcard de
 * qualquer aula, aluno revisa, cartas difíceis voltam mais.
 * Feature matadora de produto de estudo. */

export default function FlashcardsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AgentHero
        edition="Nº XI"
        Icon={Layers}
        name="Flashcards"
        discipline="Repetição espaçada SM-2"
        description="Transforma qualquer aula ou súmula em deck de flashcards com algoritmo SM-2 (padrão Anki). Carta difícil volta no dia seguinte, carta dominada volta em 3 meses. Retenção 3–5x maior que releitura."
        accent="sand"
        meta={[
          { Icon: Clock, label: 'Revisão', value: '~15 min/dia' },
          { Icon: Brain, label: 'Algoritmo', value: 'SM-2 exato' },
          { Icon: ShieldCheck, label: 'Compatível', value: 'Export .apkg' },
        ]}
        steps={[
          { n: 'I', title: 'Escolha a fonte', desc: 'Aula do Professor, súmula ou texto colado no campo de matéria.' },
          { n: 'II', title: 'Agente gera o deck', desc: 'Cartas frente e verso criadas automaticamente por tópico e dificuldade.' },
          { n: 'III', title: 'Revise diariamente', desc: 'SM-2 calcula intervalos por carta. Streak e foco em fraqueza acompanham o progresso.' },
        ]}
      />
      <AgentPreviewStage
      Icon={Layers}
      kicker="Nº 027 · Agente Flashcards"
      name="Flashcards"
      tagline="SM-2 igual Anki. Carta que você erra volta amanhã. Carta que você domina volta em 3 meses. Memória que dura."
      description="Passar em OAB é decorar 2 mil súmulas sem morrer no meio. Releitura passiva é o método mais ineficiente que existe — a ciência é unânime. Flashcards aplica o algoritmo SM-2 (padrão ouro, usado pelo Anki há 30 anos): toda aula que o Professor dá vira deck automaticamente, você revisa N cartas por dia, as difíceis reaparecem até dominar. Retenção 3-5x maior que grifar resumo."
      statusLabel="Beta aberto · quota 40 cartas/dia"
      planBadge="Pro"
      glowTint="#c9956b"
      capabilities={[
        {
          Icon: Brain,
          title: 'SM-2 implementado',
          body: 'Algoritmo exato do SuperMemo-2. Intervalos calculados por dificuldade individual de cada carta.',
          featured: true,
        },
        {
          Icon: RefreshCcw,
          title: 'Auto-gera de qualquer aula',
          body: 'Professor dá aula de Direito Civil → aula vira 12 flashcards. Zero trabalho manual.',
        },
        {
          Icon: Flame,
          title: 'Streak diário',
          body: 'Dias consecutivos revisando. Meta padrão 20 cartas/dia. Produto de estudo sem streak morre.',
        },
        {
          Icon: BookMarked,
          title: 'Decks por matéria',
          body: 'Civil, Penal, Trabalhista, Constitucional, Empresarial. Tags livres pra subtópicos.',
        },
        {
          Icon: Target,
          title: 'Foco em fraqueza',
          body: '"Você errou 68% das cartas de competência em Const." Deck temporário focado em reforçar lacuna.',
        },
        {
          Icon: Layers,
          title: 'Export/import Anki',
          body: 'Export .apkg padrão Anki. Se você já usa, migra sem perder histórico.',
        },
      ]}
      example={{
        prompt:
          'Gera flashcards da aula de hoje sobre responsabilidade civil objetiva.',
        outputLabel: 'Deck criado · 8 cartas',
        response: `Deck "Resp. Civil Objetiva · 2026-04-23" · 8 cartas

[1] Frente: Art. 927, parágrafo único do CC fundamenta qual tipo
    de responsabilidade?
    Verso: Responsabilidade objetiva por atividade de risco (teoria
    do risco criado). Dispensa comprovação de culpa.

[2] Frente: 3 requisitos da responsabilidade objetiva.
    Verso: conduta + dano + nexo causal. (culpa dispensada)

[3] Frente: Diferença entre risco criado (art. 927§u) e risco
    proveito (CDC).
    Verso: Risco criado → quem cria a atividade perigosa responde.
    Risco proveito → quem lucra com a atividade responde, mesmo sem
    criá-la.

... +5 cartas

Programação SM-2:
  · hoje: 3 cartas pra aprender (novas)
  · amanhã: 3 pra revisão primeira
  · em 6 dias: 3 pra consolidar

Todas entram na fila de revisão · próximo study em 8h.`,
      }}
    />
    </div>
  )
}
