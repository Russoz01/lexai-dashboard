'use client'

/* ════════════════════════════════════════════════════════════════════
 * LexPricing · v10.12 (2026-04-23)
 * ────────────────────────────────────────────────────────────────────
 * Wrapper da landing sobre o LexPricingGrid canônico.
 * Mantém o hero editorial "Um preço por escritório / Não por advogado"
 * que vive acima do grid de planos na home.
 * ═══════════════════════════════════════════════════════════════════ */

import { Reveal } from '@/components/ui/reveal'
import { LexPricingGrid } from '@/components/ui/lex-pricing-grid'

export function LexPricing() {
  return (
    <section id="precos" className="relative isolate overflow-hidden bg-black py-28">
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_45%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl px-6">
        <Reveal as="div" className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/65">
            Sem contar token · sem cobrar consulta
          </div>
          <h2 className="text-balance font-serif text-4xl text-white md:text-5xl lg:text-[3.4rem]">
            Um preço{' '}
            <span className="italic text-[#e6d4bd]">por advogado</span>.
            <br />
            <span className="text-white/60">Transparente do Escritório ao Enterprise.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/65">
            Astrea cobra R$ 1.379 por usuário com limite de documentos. A Pralvex cobra entre{' '}
            <span className="font-mono tabular-nums text-white/85">R$ 1.399 e R$ 1.599</span>{' '}
            por advogado registrado — com documentos ilimitados a partir do Firma e 7 dias grátis.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <LexPricingGrid />
        </Reveal>

        {/* trust footer */}
        <Reveal delay={0.35}>
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
