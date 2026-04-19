'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Reveal } from '@/components/ui/reveal'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

/* ════════════════════════════════════════════════════════════════════
 * LexPricing (v9 · 2026-04-19)
 * ────────────────────────────────────────────────────────────────────
 * Reescrito com:
 *  · Numeros corretos: 22 agentes (14 prontos + 8 em onda), nao 23
 *  · Anchor competitivo: Astrea cobra R$1.379/usuario - quebramos isso
 *    com tier flat (decisao validada pelo brain — competitor analysis)
 *  · Pricing alinhado com tiers do catalog.ts: starter/pro/enterprise
 *  · Toggle anual/mensal (10% off na anual = 2 meses gratis)
 *  · Copy mais direto: "no lugar de 5 contratos", break-even claro
 *  · Hover tilt 3D nos cards (lex-tilt em globals.css)
 *
 * Ranges de tier alinhados com o catalog.ts:
 *  Escritorio (starter): 1-5 advs, 8 essenciais
 *  Firma (pro): 6-15 advs, 22 agentes + CRM + jurimetria
 *  Enterprise: 16+, custom + SSO + on-premise
 * ═══════════════════════════════════════════════════════════════════ */

interface Plano {
  name: string
  seats: string
  monthly: number
  annual: number
  pitch: string
  features: string[]
  cta: string
  popular?: boolean
}

const planos: Plano[] = [
  {
    name: 'Escritório',
    seats: '1 a 5 advogados',
    monthly: 1290,
    annual: 1075,
    pitch: '8 agentes essenciais para começar a economizar tempo na primeira semana.',
    features: [
      'Chat, Resumidor, Pesquisador, Redator',
      'Calculador, Legislação, Rotina, Compliance',
      'Histórico de 45 dias',
      'Suporte por email em 24 h',
      '7 dias grátis · cancela com um clique',
    ],
    cta: 'Começar 7 dias grátis',
  },
  {
    name: 'Firma',
    seats: '6 a 15 advogados',
    monthly: 1890,
    annual: 1575,
    pitch: 'Os 22 agentes + CRM + jurimetria. No lugar de 5 contratos diferentes.',
    popular: true,
    features: [
      'Todos os 22 agentes (14 prontos + 8 em onda)',
      'CRM jurídico sem limite de leads',
      'Jurimetria · taxa de êxito por tribunal',
      'Histórico 90 dias + exportação .docx',
      'Onboarding dedicado em 3-5 dias',
      'Suporte prioritário em 3 h',
    ],
    cta: 'Agendar demonstração',
  },
  {
    name: 'Enterprise',
    seats: '16+ advogados',
    monthly: 3490,
    annual: 2908,
    pitch: 'SSO, agentes customizados ao nicho do escritório e API privada.',
    features: [
      'Agentes customizados ao seu nicho',
      'SSO via SAML + audit log avançado',
      'API privada com webhooks',
      'Marketing IA · agenda OAB-compliant',
      'Gerente de conta + SLA de uptime',
      'On-premise opcional · DPA assinado',
    ],
    cta: 'Falar com vendas',
  },
]

function formatBRL(n: number) {
  return n.toLocaleString('pt-BR')
}

export function LexPricing() {
  const [annual, setAnnual] = useState(true)

  return (
    <section id="precos" className="relative isolate overflow-hidden bg-black py-28">
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_45%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl px-6">
        <Reveal as="div" className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/65">
            Sem contar token · sem cobrar consulta
          </div>
          <h2 className="text-balance font-serif text-4xl text-white md:text-5xl lg:text-[3.4rem]">
            Um preço{' '}
            <span className="italic text-[#e6d4bd]">por escritório</span>.
            <br />
            <span className="text-white/60">Não por advogado.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/65">
            Astrea cobra R$ 1.379 por usuário. A 9 advogados, isso vira{' '}
            <span className="font-mono tabular-nums text-white/85">R$ 12.411</span>{' '}
            por mês. A LexAI cobra pelo escritório — você cresce sem renegociar contrato.
          </p>
        </Reveal>

        {/* Toggle mensal / anual */}
        <Reveal delay={0.1}>
          <div className="mx-auto mb-12 flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                !annual
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white',
              )}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                annual
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white',
              )}
            >
              Anual
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-wider',
                  annual
                    ? 'bg-emerald-500/15 text-emerald-700'
                    : 'bg-emerald-500/10 text-emerald-300/80',
                )}
              >
                -2 meses
              </span>
            </button>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {planos.map((p, i) => {
            const price = annual ? p.annual : p.monthly
            return (
              <Reveal key={p.name} delay={0.15 + i * 0.08}>
                <SpotlightCard
                  color={p.popular ? 'rgba(191,166,142,0.85)' : 'rgba(255,255,255,0.6)'}
                  size={p.popular ? 460 : 360}
                  className="h-full"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                    className={cn(
                      'lex-tilt relative flex h-full flex-col overflow-hidden rounded-2xl border p-7',
                      p.popular
                        ? 'border-[#bfa68e]/40 bg-gradient-to-b from-[#bfa68e]/[0.06] via-neutral-950 to-neutral-950'
                        : 'border-white/10 bg-neutral-950/80',
                    )}
                  >
                    {p.popular && (
                      <>
                        <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full border border-[#bfa68e]/30 bg-[#bfa68e]/10 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[#e6d4bd]">
                          <Sparkles className="size-2.5" strokeWidth={2.5} />
                          Mais escolhido
                        </div>
                        {/* gold rim */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bfa68e]/60 to-transparent"
                        />
                      </>
                    )}

                    <div className="mb-1 text-sm font-medium tracking-tight text-white">
                      {p.name}
                    </div>
                    <div className="mb-7 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                      {p.seats}
                    </div>

                    {/* price */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-white/45">R$</span>
                      <motion.span
                        key={`${p.name}-${annual}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          'font-serif text-[3.2rem] font-semibold leading-none tracking-tight tabular-nums',
                          p.popular
                            ? 'bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] bg-clip-text text-transparent'
                            : 'text-white',
                        )}
                        style={p.popular ? { WebkitBackgroundClip: 'text' } : undefined}
                      >
                        {formatBRL(price)}
                      </motion.span>
                    </div>
                    <div className="mt-1.5 text-[12.5px] text-white/45">
                      por mês · escritório inteiro
                      {annual && (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
                          economiza R${formatBRL((p.monthly - p.annual) * 12)}/ano
                        </span>
                      )}
                    </div>

                    {/* pitch */}
                    <div className="my-6 border-y border-white/[0.06] py-4 text-[13.5px] leading-relaxed text-white/75">
                      {p.pitch}
                    </div>

                    {/* features */}
                    <ul className="mb-8 flex-1 space-y-2.5">
                      {p.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2.5 text-[13px] text-white/70"
                        >
                          <Check
                            className={cn(
                              'mt-[3px] size-3.5 shrink-0',
                              p.popular ? 'text-[#bfa68e]' : 'text-white/55',
                            )}
                            strokeWidth={2.4}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/login"
                      className={cn(
                        'group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border text-[13px] font-medium transition',
                        p.popular
                          ? 'border-transparent bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] text-black shadow-[0_8px_24px_-8px_rgba(191,166,142,0.5)] hover:brightness-110'
                          : 'border-white/15 bg-white/[0.02] text-white hover:border-white/30 hover:bg-white/[0.06]',
                      )}
                    >
                      {p.cta}
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        strokeWidth={2}
                      />
                    </Link>
                  </motion.div>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </div>

        {/* trust footer */}
        <Reveal delay={0.45}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/40">
            <span>Pix · cartão · boleto</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>NF emitida</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Sem fidelidade</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Cancela com 1 clique</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
