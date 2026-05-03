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
    <section
      id="precos"
      className="relative isolate overflow-hidden py-28"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_45%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl px-6">
        <Reveal as="div" className="mx-auto mb-10 max-w-2xl text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em]"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--hover)',
              color: 'var(--text-secondary)',
            }}
          >
            Sem contar token · sem cobrar consulta
          </div>
          <h2
            className="text-balance font-serif text-4xl md:text-5xl lg:text-[3.4rem]"
            style={{ color: 'var(--text-primary)' }}
          >
            Um preço{' '}
            <span className="italic text-grad-accent">por advogado</span>.
            <br />
            <span style={{ color: 'var(--text-secondary)' }}>Transparente do Escritório ao Enterprise.</span>
          </h2>
          <p
            className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Astrea cobra R$ 1.379 por usuário com limite de documentos. A Pralvex cobra entre{' '}
            <span className="font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>R$ 599 e R$ 1.599</span>{' '}
            por advogado registrado — Solo entry-tier, Firma com documentos ilimitados, Enterprise com agentes customizados. Demo grátis de 50 min, sem cartão.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <LexPricingGrid />
        </Reveal>

        {/* trust footer — atualizado pós-audit pra remover claims falsos
            (PIX não implementado em subscription Stripe; NFS-e em roadmap) */}
        <Reveal delay={0.35}>
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.18em]"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>Cartão · boleto</span>
            <span className="size-1 rounded-full" style={{ background: 'var(--border)' }} />
            <span>Recibo eletrônico</span>
            <span className="size-1 rounded-full" style={{ background: 'var(--border)' }} />
            <span>Sem fidelidade</span>
            <span className="size-1 rounded-full" style={{ background: 'var(--border)' }} />
            <span>Cancela com 1 clique</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
