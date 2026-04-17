'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

const planos = [
  {
    name: 'Escritorio',
    price: '1.399',
    seats: '1-5 advogados',
    headline: '5 agentes essenciais',
    features: [
      'Resumidor, Pesquisador, Redator, Calculador, Monitor',
      'CRM juridico (50 leads/mes)',
      'Historico de 45 dias',
      'Suporte por email em 24h',
    ],
    cta: 'Comecar 7 dias gratis',
  },
  {
    name: 'Firma',
    price: '1.459',
    seats: '6-15 advogados',
    headline: '23 agentes + CRM ilimitado',
    popular: true,
    features: [
      'Todos os 23 agentes especializados',
      'CRM juridico sem limite de leads',
      'Exportacao em PDF + historico 90 dias',
      'Suporte prioritario em 3h',
      'Onboarding dedicado',
      'Compra avulsa de tokens',
    ],
    cta: 'Agendar demonstracao',
  },
  {
    name: 'Enterprise',
    price: '1.599',
    seats: '16+ advogados',
    headline: 'Customizado + on-premise',
    features: [
      'Agentes customizados para o escritorio',
      'API privada + SLA de uptime',
      'Gerente de conta dedicado',
      'Historico ilimitado + opcao on-premise',
      'DPA assinado incluso',
    ],
    cta: 'Falar com vendas',
  },
]

export function LexPricing() {
  return (
    <section id="precos" className="relative bg-black py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal as="div" className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/70">
            Planos transparentes
          </div>
          <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
            Preço único por{' '}
            <span className="bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text text-transparent">
              assento
            </span>.
          </h2>
          <p className="mt-4 text-white/70">
            Todos os planos incluem 7 dias gratuitos. Sem fidelidade. Cancelamento
            em 1 clique.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {planos.map((p, i) => (
            <Reveal key={p.name} delay={0.1 + i * 0.1}>
              <SpotlightCard
                color={p.popular ? 'rgba(191,166,142,0.9)' : 'rgba(255,255,255,0.85)'}
                size={p.popular ? 420 : 360}
                className="h-full"
              >
                <div
                  className={cn(
                    'relative flex h-full flex-col overflow-hidden rounded-2xl border bg-neutral-950 p-7',
                    p.popular
                      ? 'border-[#bfa68e]/30 bg-gradient-to-b from-[#bfa68e]/[0.05] to-transparent'
                      : 'border-white/10',
                  )}
                >
                  {p.popular && (
                    <div className="absolute right-5 top-5 rounded-full border border-[#bfa68e]/30 bg-[#bfa68e]/10 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[#e6d4bd]">
                      Mais escolhido
                    </div>
                  )}

                  <div className="mb-1 text-sm font-medium tracking-tight text-white">
                    {p.name}
                  </div>
                  <div className="mb-6 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-white/40">
                    {p.seats}
                  </div>

                  <div className="mb-2 flex items-baseline gap-1">
                    <span className="text-xs text-white/45">R$</span>
                    <span
                      className={cn(
                        'text-5xl font-medium tracking-tight tabular-nums',
                        p.popular
                          ? 'bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text text-transparent'
                          : 'text-white',
                      )}
                    >
                      {p.price}
                    </span>
                  </div>
                  <div className="mb-6 text-xs text-white/45">
                    por advogado / mes
                  </div>

                  <div className="mb-6 border-y border-white/5 py-4 text-sm text-white/70">
                    {p.headline}
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-3 text-sm text-white/70">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-[#bfa68e]"
                          strokeWidth={2}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={cn(
                      'inline-flex h-11 w-full items-center justify-center rounded-full border text-sm font-medium transition',
                      p.popular
                        ? 'border-transparent bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] text-black hover:brightness-110'
                        : 'border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]',
                    )}
                  >
                    {p.cta}
                  </Link>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
