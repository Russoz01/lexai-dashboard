'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Reveal, WordReveal } from '@/components/ui/reveal'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { Check } from 'lucide-react'

/* ═════════════════════════════════════════════════════════════
 * LexPricing — 3 planos LexAI com toggle mensal/anual.
 * Inspirado no pricing-section-4 (framer + NumberFlow + sparkles)
 * mas adaptado à paleta Noir Atelier e preços reais.
 * ─────────────────────────────────────────────────────────────
 * [NOTA PARA PRÓXIMA SESSÃO — 2026-04-17]
 * Seção usada na LANDING (src/app/page.tsx).
 *
 * Já implementado e funcionando:
 *   ✓ Toggle mensal/anual com pill único animado (sem double-click)
 *   ✓ SpotlightCard envolvendo cada plano (luz branca na borda)
 *   ✓ NumberFlow animando troca de preço
 *   ✓ WordReveal no título + Reveal em cada card
 *
 * NÃO replicar este visual no dashboard/planos diretamente — ali
 * o objetivo é mostrar qual plano o usuário tem (usePlan), botão
 * portal Stripe e comparativo. Ver catalog.ts para filtro por plano.
 * ═════════════════════════════════════════════════════════════ */

const plans = [
  {
    name: 'Escritório',
    description: 'Para advogados autônomos e escritórios até 3 profissionais.',
    price: 1399,
    yearlyPrice: 13990,
    tokens: '1,5M tokens/mês',
    buttonText: 'Começar trial',
    buttonVariant: 'outline' as const,
    replaces: 'Substitui: Lexter (R$199)',
    includes: [
      'Inclui:',
      '14 agentes especializados',
      'Leads & qualificação IA',
      'CRM básico de clientes',
      'Prazos + Financeiro',
      'Compliance OAB automático',
      'Suporte por e-mail',
    ],
  },
  {
    name: 'Firma',
    description: 'Mais vendido — escritórios médios com 4 a 10 advogados.',
    price: 1459,
    yearlyPrice: 14590,
    tokens: '5M tokens/mês',
    buttonText: 'Agendar demo',
    buttonVariant: 'default' as const,
    popular: true,
    replaces: 'Substitui: AdvHub + Lexter + PREVADS',
    includes: [
      'Tudo de Escritório, mais:',
      'Jurimetria (prob. êxito)',
      'Marketing jurídico Instagram',
      'WhatsApp integrado (Meta API)',
      'Monitoramento processual',
      'Multi-usuário (até 10)',
      'Suporte prioritário 24/7',
    ],
  },
  {
    name: 'Enterprise',
    description: 'Grandes bancas com necessidades customizadas e SSO.',
    price: 1599,
    yearlyPrice: 15990,
    tokens: '12M tokens/mês',
    buttonText: 'Falar com vendas',
    buttonVariant: 'outline' as const,
    replaces: 'Substitui: Harvey + Turivius + CRM',
    includes: [
      'Tudo de Firma, mais:',
      'Usuários ilimitados',
      'SAML SSO + audit logs',
      'Integração com tribunais',
      'Agentes custom treinados',
      'API dedicada + webhooks',
      'CSM dedicado + SLA',
    ],
  },
]

function PricingSwitch({ onSwitch }: { onSwitch: (value: string) => void }) {
  const [selected, setSelected] = useState('0')
  const handle = (v: string) => {
    setSelected(v)
    onSwitch(v)
  }
  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto grid w-fit grid-cols-2 rounded-full border border-white/10 bg-neutral-900 p-1">
        {/* pill único que translada */}
        <motion.span
          aria-hidden
          className="absolute left-1 top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full border border-white/15 bg-white/[0.06]"
          initial={false}
          animate={{ x: selected === '0' ? 0 : '100%' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
        <button
          type="button"
          onClick={() => handle('0')}
          className={cn(
            'relative z-10 h-10 rounded-full px-3 py-1 text-sm font-medium transition-colors sm:px-6 sm:py-2',
            selected === '0' ? 'text-white' : 'text-white/60',
          )}
        >
          <span className="relative">Mensal</span>
        </button>
        <button
          type="button"
          onClick={() => handle('1')}
          className={cn(
            'relative z-10 h-10 rounded-full px-3 py-1 text-sm font-medium transition-colors sm:px-6 sm:py-2',
            selected === '1' ? 'text-white' : 'text-white/60',
          )}
        >
          <span className="relative flex items-center gap-2">
            Anual
            <span className="rounded-full border border-white/15 bg-white/5 px-1.5 py-0.5 text-[0.6rem] tabular-nums text-white/70">
              2 meses grátis
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function LexPricing() {
  const [isYearly, setIsYearly] = useState(false)
  const toggle = (v: string) => setIsYearly(parseInt(v) === 1)

  return (
    <section
      id="precos"
      className="relative mx-auto overflow-x-hidden bg-black py-20"
    >
      {/* Grid sutil de fundo (Linear-style) */}
      <div
        className="pointer-events-none absolute top-0 h-[28rem] w-full overflow-hidden [mask-image:radial-gradient(60%_60%,white,transparent)]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(50%_50%_at_50%_100%,#bfa68e14,transparent_70%)]" />
      </div>

      {/* Header */}
      <article className="relative z-10 mx-auto mb-6 max-w-3xl space-y-2 px-4 pt-10 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <span className="size-1.5 rounded-full bg-[#bfa68e]" />
          Planos LexAI
        </div>
        <h2 className="text-balance text-4xl font-medium text-white">
          <WordReveal
            text="Por menos do que a soma dos concorrentes."
            stagger={0.1}
            reverse
            className="justify-center"
          />
        </h2>
        <Reveal as="p" delay={0.4} className="text-white/60">
          Cancelamento simples, suporte humano, sem pegadinha. Billing anual
          economiza dois meses.
        </Reveal>
        <Reveal delay={0.6}>
          <PricingSwitch onSwitch={toggle} />
        </Reveal>
      </article>

      {/* Cards */}
      <div className="relative z-10 mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <Reveal key={plan.name} delay={0.8 + i * 0.15}>
            <SpotlightCard
              className="h-full rounded-xl"
              color={plan.popular ? 'rgba(230,212,189,0.9)' : 'rgba(255,255,255,0.8)'}
              size={plan.popular ? 420 : 360}
            >
            <Card
              className={cn(
                'relative h-full border-white/10 bg-neutral-950 text-white',
                plan.popular &&
                  'z-20 border-white/20 bg-neutral-900 shadow-[0_0_0_1px_rgba(191,166,142,0.15),0_30px_80px_-20px_rgba(191,166,142,0.12)]',
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-black">
                  Mais vendido
                </div>
              )}
              <CardHeader className="text-left">
                <h3 className="mb-1 text-2xl font-medium tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline tabular-nums">
                  <span className="text-4xl font-semibold">
                    R$
                    <NumberFlow
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      format={{ useGrouping: true }}
                      className="text-4xl font-semibold tabular-nums"
                    />
                  </span>
                  <span className="ml-1 text-white/50">
                    /{isYearly ? 'ano' : 'mês'}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider text-[#bfa68e]/80">
                  {plan.tokens}
                </div>
                <p className="mt-3 text-sm text-white/60">{plan.description}</p>
                <div className="mt-2 text-[0.7rem] text-white/40">
                  {plan.replaces}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <button
                  className={cn(
                    'mb-6 w-full rounded-lg px-4 py-3 text-sm font-medium transition',
                    plan.popular
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'border border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]',
                  )}
                >
                  {plan.buttonText}
                </button>
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <h4 className="mb-2 text-sm font-medium">{plan.includes[0]}</h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feat, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check
                          className={cn(
                            'mt-0.5 size-4 flex-none',
                            plan.popular ? 'text-[#bfa68e]' : 'text-white/50',
                          )}
                        />
                        <span className="text-sm text-white/70">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={1.3} as="p" className="relative z-10 mx-auto mt-6 max-w-2xl px-4 text-center text-xs text-white/40">
        Todos os planos incluem LGPD + Provimento 205/2021 (OAB). Cancelamento
        a qualquer momento. Preço por advogado.
      </Reveal>
    </section>
  )
}
