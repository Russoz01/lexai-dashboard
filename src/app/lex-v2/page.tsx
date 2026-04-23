'use client'

import { useEffect } from 'react'
import { LexHeader } from '@/components/ui/lex-header'
import { LexHero } from '@/components/ui/lex-hero'
import { LexFeatures } from '@/components/ui/lex-features'
import { LexComparison } from '@/components/ui/lex-comparison'
import { LexPricing } from '@/components/ui/lex-pricing'
import { Button } from '@/components/ui/button'
import { ArrowRight, CalendarCheck } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
 * /lex-v2 — Variante shadcn (hero-3 + pricing-section-4).
 * Tema dark forcado via data-theme. Paleta Noir Atelier.
 * Nao substitui / ; roda em paralelo para AB test.
 * ────────────────────────────────────────────────────────────── */

export default function LexV2Page() {
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme')
    document.documentElement.setAttribute('data-theme', 'dark')
    return () => {
      if (prev) document.documentElement.setAttribute('data-theme', prev)
      else document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <LexHeader />

      <main>
        <LexHero />
        <LexFeatures />
        <LexComparison />
        <LexPricing />

        {/* Closing CTA */}
        <section
          id="demo"
          className="relative mx-auto w-full overflow-hidden bg-black py-24"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_50%,#bfa68e22,transparent_70%)]"
          />
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-balance text-4xl font-medium text-white md:text-5xl">
              Pronto para substituir{' '}
              <span className="italic text-white/60">cinco ferramentas</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              15 minutos com um especialista jurídico. Mostramos o fluxo
              completo no seu caso real — do lead à sentença.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <a href="/login">
                  <CalendarCheck className="mr-2 size-4" />
                  Agendar demo · 15 min
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#precos">
                  Ver planos
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
            </div>
            <p className="mt-6 text-xs text-white/40">
              7 dias grátis · sem cartão · cancelamento em 1 clique
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black py-10 text-center text-xs text-white/40">
        © MMXXVI · LexAI — uma marca Vanix Corp · contato@vanixcorp.com
      </footer>
    </div>
  )
}
