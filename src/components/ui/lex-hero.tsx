'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { AnimatedShaderBackground } from '@/components/ui/animated-shader-background'
import { DashboardPreview } from '@/components/ui/dashboard-preview'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
 * LexHero — estilo hero-section-1 (tailark) adaptado para LexAI.
 * Radial glows em angulo + AnimatedGroup com blur-slide stagger.
 * Sem emojis. Tipografia Inter precisa. Dark-first.
 * ────────────────────────────────────────────────────────────── */

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { type: 'spring' as const, bounce: 0.3, duration: 1.5 },
    },
  },
}

export function LexHero() {
  return (
    <main className="relative overflow-hidden">
      {/* WebGL shader background (nebula champagne/noir) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[min(100vh,1100px)]">
        <AnimatedShaderBackground
          className="absolute inset-0 h-full w-full"
          opacity={0.55}
        />
        {/* Fade the shader into the page bg at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(var(--lex-bg))]" />
      </div>

      {/* Rotated radial tints (very subtle, on top of shader) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 isolate -z-10 hidden contain-strict opacity-40 lg:block"
      >
        <div className="absolute left-0 top-0 h-[80rem] w-[35rem] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(32,35%,78%,0.05)_0,hsla(32,35%,58%,0.015)_50%,hsla(32,35%,45%,0)_80%)]" />
      </div>

      <section>
        <div className="relative pt-24 md:pt-36">
          {/* Vignette from bottom */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,hsl(var(--lex-bg))_75%)]"
          />

          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
              <AnimatedGroup variants={transitionVariants}>
                {/* Pill badge */}
                <Link
                  href="#features"
                  className="group mx-auto flex w-fit items-center gap-4 rounded-full border bg-muted p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 hover:bg-background dark:border-t-white/5 dark:shadow-zinc-950"
                >
                  <span className="text-sm text-foreground">
                    Disponivel: jurimetria + marketing compliant
                  </span>
                  <span className="block h-4 w-0.5 border-l bg-white dark:bg-zinc-700 dark:border-background" />
                  <div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>

                <h1 className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-medium leading-[1.02] tracking-tight text-foreground md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                  O sistema operacional do escritorio moderno
                </h1>
                <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
                  Qualificacao automatica de leads, CRM juridico, jurimetria,
                  marketing compliant e catorze agentes treinados no direito
                  brasileiro. Um unico contrato no lugar de cinco.
                </p>
              </AnimatedGroup>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
              >
                <div
                  key={1}
                  className="rounded-[14px] border bg-foreground/10 p-0.5"
                >
                  <Button asChild size="lg" className="rounded-xl px-5 text-base">
                    <Link href="#demo">
                      <span className="text-nowrap">Agendar demo</span>
                    </Link>
                  </Button>
                </div>
                <Button
                  key={2}
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-11 rounded-xl px-5"
                >
                  <Link href="#precos">
                    <span className="text-nowrap">Ver planos</span>
                  </Link>
                </Button>
              </AnimatedGroup>
            </div>
          </div>

          {/* Dashboard preview */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
          >
            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
              <div
                aria-hidden
                className="absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35% to-[hsl(var(--lex-bg))]"
              />
              <div
                className={cn(
                  'relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-3 shadow-lg shadow-zinc-950/15 ring-1 ring-background',
                  'dark:shadow-[inset_0_0_0_1px_hsl(var(--lex-fg)/0.06)]',
                )}
              >
                <DashboardPreview />
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </section>

      {/* Trust strip (substituindo logos de customers) */}
      <section className="bg-background pb-16 pt-20 md:pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-y-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-4">
            <span>LGPD nativa</span>
            <span>Provimento 205 / 2021</span>
            <span>Infra no Brasil</span>
            <span>SSO + audit logs</span>
          </div>
        </div>
      </section>
    </main>
  )
}
