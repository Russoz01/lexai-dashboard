'use client'

/* ════════════════════════════════════════════════════════════════════
 * LexFoundingMember · v1.1 (2026-04-30)
 * ────────────────────────────────────────────────────────────────────
 * Banner pre-pricing pros primeiros 10 escritórios — 35% off vitalício
 * em troca de testimonial + case study + logo wall.
 *
 * Pricing:
 *   Plano Escritório base:  R$ 1.399/mês
 *   Founding Member (-35%): R$   909/mês (trava pra sempre)
 *
 * Contrapartida do cliente:
 *   - Aparece como cliente na landing (logo wall)
 *   - Grava 1 vídeo testimonial 1-2 min
 *   - Responde pesquisa mensal de produto
 *   - Aceita case study escrito sobre seu uso
 *
 * Estado:
 *   - Cupom Stripe FOUNDING35 (a criar quando Stripe LIVE for ativado)
 *   - Por enquanto: CTA via mailto pra discussão personalizada
 *   - Quando LIVE ativo, mudar CTA pra /login com ref=founding
 *
 * Visual: padrão atelier dark — champagne em fundo noir, urgência
 * com counter dos slots restantes (manual por enquanto).
 * ═══════════════════════════════════════════════════════════════════ */

import { Reveal } from '@/components/ui/reveal'
import { Sparkles, Trophy, MessageCircle, FileSearch, ArrowRight } from 'lucide-react'

const SLOTS_TOTAL = 10
const SLOTS_TAKEN = 0 // ← atualiza manualmente conforme fechar
const SLOTS_LEFT = SLOTS_TOTAL - SLOTS_TAKEN

const TROCAS = [
  { Icon: Trophy,       title: 'Logo na landing',          desc: 'Aparece como cliente fundador na home pública.' },
  { Icon: MessageCircle, title: 'Vídeo testimonial',        desc: '1-2 min sobre como Pralvex muda seu fluxo.' },
  { Icon: FileSearch,   title: 'Case study escrito',       desc: 'Estudo público sobre ROI do seu escritório.' },
]

export function LexFoundingMember() {
  const subject = 'Founding Member Pralvex - quero aplicar'
  const body = `Olá,

Vi a oferta Founding Member no site (35% off vitalício, R$ 909/mês) e quero aplicar pro meu escritório.

Nome:
Escritório:
Nº de advogados:
OAB:
Como me encontrou:

Aguardo retorno.`

  const mailto = `mailto:contato@pralvex.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return (
    <section
      id="founding-member"
      className="relative isolate overflow-hidden border-y border-[#bfa68e]/15 bg-gradient-to-b from-black via-[#0d0a06] to-black py-24"
    >
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_0%,rgba(212,174,106,0.08)_0%,transparent_70%)]"
      />
      {/* hairline ornament */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-72 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#bfa68e]/40 to-transparent"
      />

      <div className="mx-auto max-w-5xl px-6">
        <Reveal as="div" className="text-center">
          {/* badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/40 bg-gradient-to-r from-[#bfa68e]/[0.16] to-[#bfa68e]/[0.06] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#e6d4bd]">
            <Sparkles className="size-3" strokeWidth={2} />
            Programa Founding Member · {SLOTS_LEFT} de {SLOTS_TOTAL} vagas
          </div>

          {/* headline */}
          <h2 className="text-balance font-serif text-4xl text-white md:text-5xl lg:text-[3.4rem]">
            Os{' '}
            <span className="italic text-[#e6d4bd]">primeiros 10 escritórios</span>
            <br />
            <span className="text-white/65">economizam 35% pra sempre.</span>
          </h2>

          {/* subhead */}
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-white/65">
            R$ 909/mês trava por toda a vida da assinatura — em vez dos R$ 1.399 do plano Escritório.
            Em troca, você nos ajuda a construir o caso de uso público da Pralvex no Direito brasileiro.
          </p>
        </Reveal>

        {/* trocas — 3 colunas */}
        <Reveal delay={0.15}>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {TROCAS.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm transition hover:border-[#bfa68e]/30 hover:bg-white/[0.04]"
              >
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg border border-[#bfa68e]/30 bg-[#bfa68e]/[0.08]">
                  <t.Icon className="size-4 text-[#e6d4bd]" strokeWidth={1.6} />
                </div>
                <div className="mb-1.5 text-[14px] font-medium text-white">{t.title}</div>
                <div className="text-[13px] leading-relaxed text-white/55">{t.desc}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* preço comparativo */}
        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px]">
            <div className="flex items-baseline gap-2">
              <span className="text-white/40">Preço público:</span>
              <span className="font-mono text-white/40 line-through">R$ 1.399/mês</span>
            </div>
            <div className="hidden h-4 w-px bg-white/10 sm:block" />
            <div className="flex items-baseline gap-2">
              <span className="text-[#bfa68e]">Founding Member:</span>
              <span className="font-serif text-2xl text-[#e6d4bd]">R$ 909</span>
              <span className="text-white/50">/mês para sempre</span>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={0.35}>
          <div className="mt-10 flex flex-col items-center gap-3">
            <a
              href={mailto}
              className="group inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/50 bg-gradient-to-r from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a] shadow-[0_12px_40px_rgba(191,166,142,0.28)] transition-all hover:shadow-[0_16px_56px_rgba(191,166,142,0.45)]"
            >
              Aplicar como fundador
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
            </a>
            <p className="text-center text-[12px] text-white/40">
              Programa fecha em 60 dias ou ao bater 10 escritórios — o que vier antes.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
