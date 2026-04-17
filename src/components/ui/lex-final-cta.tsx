'use client'

import Link from 'next/link'
import { ArrowRight, Scale } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { RetroGrid } from '@/components/ui/retro-grid'

export function LexFinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-black py-28">
      <div className="absolute inset-0 -z-10">
        <RetroGrid opacity={0.25} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(50%_60%_at_50%_50%,rgba(191,166,142,0.08)_0%,transparent_70%)]"
      />

      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur">
            <Scale className="size-6 text-[#bfa68e]" strokeWidth={1.5} />
          </div>
          <h2 className="text-balance text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-6xl">
            Pronto para escrever petições
            <br />
            <span className="bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text text-transparent">
              em minutos
            </span>?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-white/70">
            Sete dias grátis. Sem cartão. Cancele com um clique. Se não economizar
            vinte horas na primeira semana, a gente devolve tudo.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
            <Link
              href="/login"
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 text-sm font-medium text-black transition hover:bg-white/90"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(191,166,142,0.35)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer"
              />
              <span className="relative">Começar 7 dias grátis</span>
              <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/empresas"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-7 text-sm font-medium text-white transition hover:bg-white/[0.06]"
            >
              Falar com vendas
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
            <span>Infra no Brasil</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>LGPD nativa</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Provimento 205 / OAB</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>DPA incluso</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
