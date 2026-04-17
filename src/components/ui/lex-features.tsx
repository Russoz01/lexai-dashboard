'use client'

import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/reveal'
import {
  Flame,
  Users,
  TrendingUp,
  Megaphone,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

type Feature = {
  icon: LucideIcon
  title: string
  blurb: string
  bullets: string[]
  badge?: string
  span?: 'wide' | 'normal'
}

const features: Feature[] = [
  {
    icon: Flame,
    title: 'Leads qualificados automaticamente',
    blurb:
      'IA responde em menos de 30 segundos no WhatsApp, Instagram e site. Triagem automatica por prioridade antes do advogado pegar o telefone.',
    bullets: [
      'Resposta automática 24/7 via Meta API',
      'Score de intenção por histórico',
      'Kanban com triagem inteligente',
    ],
    badge: 'O que a AdvHub faz',
    span: 'wide',
  },
  {
    icon: Users,
    title: 'CRM jurídico integrado',
    blurb:
      'Timeline de cada cliente cruzando processos, prazos, financeiro e documentos.',
    bullets: [
      'Monitoramento processual (todos os tribunais)',
      'Histórico unificado por cliente',
      'Financeiro + honorários + repasses',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Jurimetria',
    blurb:
      'Probabilidade de êxito, tempo médio até sentença e valor esperado — antes de aceitar o caso.',
    bullets: [
      'Benchmark contra milhões de acórdãos',
      'Recomendação de estratégia',
      'Simulação de cenários',
    ],
  },
  {
    icon: Megaphone,
    title: 'Marketing jurídico compliant',
    blurb:
      'Posts para Instagram, carrosséis, stories e newsletter — todos validados contra Provimento 205/2021.',
    bullets: [
      'Calendário editorial sugerido',
      'Bloqueio automático de claims proibidos',
      'Templates por área do Direito',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Compliance OAB nativo',
    blurb:
      'Cada saída da IA passa por camada de validação: Provimento 205, LGPD, sigilo profissional.',
    bullets: [
      'Audit log completo por usuário',
      'Revisão obrigatória por profissional habilitado',
      'DPA assinado · infra Brasil',
    ],
  },
  {
    icon: Sparkles,
    title: '14 agentes especializados',
    blurb:
      'Redator, Pesquisador, Estrategista, Negociador, Parecerista, Calculador, Tradutor Jurídico e mais 7 — cada um afinado para uma função específica.',
    bullets: [
      'Modelos treinados em direito BR',
      'Custom fine-tune para Enterprise',
      'API dedicada + webhooks',
    ],
    span: 'wide',
  },
]

export function LexFeatures() {
  return (
    <section
      id="features"
      className="relative mx-auto w-full bg-black py-20"
    >
      {/* halo champagne */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(50%_50%_at_50%_100%,#bfa68e22,transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <Reveal as="div" className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            Cinco ferramentas, um contrato
          </div>
          <h2 className="text-balance text-4xl font-medium text-white">
            Do primeiro lead{' '}
            <span className="italic text-white/60">à sentença</span>.
          </h2>
          <p className="mt-3 text-white/60">
            Uma plataforma ponta a ponta para o escritório moderno. Nada de
            planilhas, nada de abas abertas em dez lugares.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal
                key={f.title}
                delay={0.1 + i * 0.08}
                className={cn(f.span === 'wide' && 'md:col-span-2')}
              >
                <div
                  className={cn(
                    'group relative h-full overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-6 transition-colors hover:border-white/20',
                  )}
                >
                  <div className="relative flex items-start gap-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.02]">
                      <Icon className="size-4 text-[#bfa68e]" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {f.badge && (
                        <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-white/55">
                          {f.badge}
                        </div>
                      )}
                      <h3 className="text-lg font-medium tracking-tight text-white">
                        {f.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/55">{f.blurb}</p>
                    </div>
                  </div>
                  <ul className="relative mt-5 space-y-1.5 border-t border-white/5 pt-4">
                    {f.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-sm text-white/65"
                      >
                        <span className="mt-2 block size-1 shrink-0 rounded-full bg-[#bfa68e]/70" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
