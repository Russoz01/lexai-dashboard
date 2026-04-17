'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Scale,
  Zap,
  Menu,
  X,
  Sparkles,
  Check,
  Minus,
} from 'lucide-react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ExitIntent } from '@/components/ExitIntent'
import { LexAgentsBento } from '@/components/ui/lex-agents-bento'
import { LexAreasMarquee } from '@/components/ui/lex-areas-marquee'
import { LexPricing } from '@/components/ui/lex-pricing'
import { LexFaq } from '@/components/ui/lex-faq'
import { LexFinalCta } from '@/components/ui/lex-final-cta'
import { RetroGrid } from '@/components/ui/retro-grid'
import { Reveal, WordReveal } from '@/components/ui/reveal'
import { TextRotate } from '@/components/ui/text-rotate'
import { AnimatedShaderBackground } from '@/components/ui/animated-shader-background'

/* ----------------------------------------------------------------------------
 * LexAI — Landing tech dark (v8)
 *
 * Fix round: hero inteiro estava invisivel por bug do framer-motion
 * (motion.create(Tag) dinamico). Reescrito Reveal + WordReveal + TextRotate.
 * Ajustes de contraste: /55 -> /70 em textos importantes; camadas do
 * shader reduzidas; conteudo acima de overlay; footer canonico.
 * -------------------------------------------------------------------------- */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* ═══ NAV ═══════════════════════════════════════════════════════════ */}
      <header
        className={
          'fixed inset-x-0 top-0 z-50 transition-all duration-300 ' +
          (scrolled
            ? 'border-b border-white/10 bg-black/75 backdrop-blur-xl'
            : 'bg-transparent')
        }
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-gradient-to-br from-[#bfa68e]/20 to-transparent">
              <Scale className="size-4 text-[#bfa68e]" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-medium tracking-tight">LexAI</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#agentes" className="text-sm text-white/70 transition-colors hover:text-white">Agentes</a>
            <a href="#diferencial" className="text-sm text-white/70 transition-colors hover:text-white">Porque LexAI</a>
            <a href="#precos" className="text-sm text-white/70 transition-colors hover:text-white">Planos</a>
            <a href="#faq" className="text-sm text-white/70 transition-colors hover:text-white">FAQ</a>
            <Link href="/empresas" className="text-sm text-white/70 transition-colors hover:text-white">Empresas</Link>
            <Link href="/login" className="text-sm text-white/70 transition-colors hover:text-white">Entrar</Link>
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-medium text-black transition hover:bg-white/90"
            >
              Agendar demo
              <ArrowRight className="size-3.5" />
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-md border border-white/10 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {/* mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl md:hidden"
          role="dialog"
        >
          <div className="flex h-16 items-center justify-between px-6">
            <span className="text-sm font-medium">LexAI</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex size-9 items-center justify-center rounded-md border border-white/10"
              aria-label="Fechar menu"
            >
              <X className="size-4" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-6 pt-6">
            {[
              { l: 'Agentes',  h: '#agentes' },
              { l: 'Porque LexAI', h: '#diferencial' },
              { l: 'Planos',   h: '#precos' },
              { l: 'FAQ',      h: '#faq' },
              { l: 'Empresas', h: '/empresas' },
              { l: 'Entrar',   h: '/login' },
            ].map((i) => (
              <a
                key={i.l}
                href={i.h}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/5 py-4 text-lg font-medium tracking-tight"
              >
                {i.l}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white text-sm font-medium text-black"
            >
              Agendar demo <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      )}

      {/* ═══ HERO — tech dark com shader + animações ═════════════════════ */}
      <section className="relative isolate overflow-hidden pt-36 pb-24 md:pt-44 md:pb-28">
        {/* WebGL shader com opacidade reduzida para nao competir com o texto */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-30">
          <AnimatedShaderBackground className="absolute inset-0 h-full w-full" opacity={0.35} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>
        {/* retro-grid floor */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 top-1/3 -z-20">
          <RetroGrid opacity={0.22} />
        </div>
        {/* radial champagne glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_0%,rgba(191,166,142,0.12)_0%,transparent_70%)]"
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Badge compliance — animate-ping dot */}
          <Reveal>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bfa68e] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#bfa68e]" />
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/80">
                LGPD · Provimento 205 · Infra BR
              </span>
            </div>
          </Reveal>

          {/* H1 — WordReveal na primeira linha, TextRotate rotacionando na segunda */}
          <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            <WordReveal
              text="O sistema operacional do"
              className="block"
              stagger={0.06}
            />
            <span className="mt-2 block">
              <TextRotate
                words={['escritorio moderno', 'advogado 10x', 'Direito digital', 'novo gabinete']}
                interval={2800}
                className="bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text text-transparent"
              />
              <span aria-hidden className="text-white">.</span>
            </span>
          </h1>

          <Reveal delay={0.45}>
            <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-white/75 md:text-lg">
              Vinte e três agentes treinados em Direito brasileiro. CRM jurídico,
              qualificação automática de leads, jurimetria e marketing compliant —
              um único contrato no lugar de cinco.
            </p>
          </Reveal>

          <Reveal delay={0.55}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
              <Link
                href="/login"
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 text-sm font-medium text-black shadow-[0_0_40px_rgba(191,166,142,0.25)] transition hover:bg-white/90"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(191,166,142,0.35)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer"
                />
                <span className="relative">Começar 7 dias grátis</span>
                <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#precos"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-7 text-sm font-medium text-white backdrop-blur transition hover:bg-white/[0.08]"
              >
                <CalendarCheck className="size-4" />
                Ver planos
              </Link>
            </div>
          </Reveal>

          {/* Stats — gradient branco→champagne */}
          <Reveal delay={0.65}>
            <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
              {[
                { v: '23',    k: 'agentes + CRM' },
                { v: '9',     k: 'áreas do Direito' },
                { v: '4min',  k: 'por documento' },
                { v: '+40',   k: 'escritórios em beta' },
              ].map((s) => (
                <div key={s.k} className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-white via-white to-[#bfa68e] bg-clip-text text-3xl font-medium tabular-nums text-transparent md:text-4xl">
                    {s.v}
                  </div>
                  <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/55">
                    {s.k}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Trust strip */}
        <div className="relative mx-auto mt-20 max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-white/10 py-6">
            {[
              'LGPD nativa',
              'Provimento 205 / OAB',
              'Infra no Brasil',
              'SSO + audit logs',
              'DPA incluso',
            ].map((t) => (
              <span
                key={t}
                className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/55"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AGENTES — bento 23 cards ═════════════════════════════════════ */}
      <LexAgentsBento />

      {/* ═══ AREAS — marquee ═════════════════════════════════════════════ */}
      <LexAreasMarquee />

      {/* ═══ DIFERENCIAIS — why not ChatGPT ══════════════════════════════ */}
      <section id="diferencial" className="relative bg-black py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal as="div" className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/70">
              <Zap className="size-3 text-[#bfa68e]" strokeWidth={2} />
              LexAI vs generalista
            </div>
            <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
              Por que{' '}
              <span className="bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text text-transparent">
                generalistas
              </span>{' '}
              falham em peça.
            </h2>
            <p className="mt-4 text-white/70">
              Um modelo genérico inventa citação para parecer útil. A LexAI recusa
              antes de fabricar.
            </p>
          </Reveal>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-950 to-black">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-white/10 bg-white/[0.03]">
              <div className="px-6 py-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/55">
                Comparativo
              </div>
              <div className="px-6 py-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/55">
                ChatGPT / Gemini
              </div>
              <div className="flex items-center gap-2 px-6 py-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#e6d4bd]">
                <Sparkles className="size-3" strokeWidth={2} />
                LexAI
              </div>
            </div>
            {[
              { k: 'Jurisprudência BR',   them: 'Inventa acórdão fake',            us: 'Link rastreável STF/STJ' },
              { k: 'Cálculo de prazo',    them: 'Ignora feriado local',            us: 'Estadual + municipal' },
              { k: 'Retenção de dados',   them: 'Treina modelo público',           us: 'Zero retenção' },
              { k: 'Modelos próprios',    them: 'Sem memória persistente',         us: 'Galeria por escritório' },
              { k: 'Correção monetária',  them: 'Aproximação errada',              us: 'INPC, IGPM, IPCA oficiais' },
              { k: 'Quando não sabe',     them: 'Inventa com confiança',           us: 'Recusa e pede fonte' },
              { k: 'Conformidade LGPD',   them: 'Servidor EUA, contrato genérico', us: 'BR + DPA assinado' },
            ].map((row, i) => (
              <Reveal key={row.k} delay={0.03 * i}>
                <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02]">
                  <div className="px-6 py-4 text-sm font-medium text-white">
                    {row.k}
                  </div>
                  <div className="flex items-start gap-2 px-6 py-4 text-sm text-white/60">
                    <Minus className="mt-0.5 size-3.5 shrink-0 text-red-400/70" strokeWidth={2.5} />
                    <span>{row.them}</span>
                  </div>
                  <div className="flex items-start gap-2 px-6 py-4 text-sm text-white/90">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[#bfa68e]" strokeWidth={2.5} />
                    <span>{row.us}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══════════════════════════════════════════════════════ */}
      <LexPricing />

      {/* ═══ FAQ ═══════════════════════════════════════════════════════════ */}
      <LexFaq />

      {/* ═══ FINAL CTA ════════════════════════════════════════════════════ */}
      <LexFinalCta />

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-gradient-to-br from-[#bfa68e]/20 to-transparent">
                  <Scale className="size-4 text-[#bfa68e]" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-medium tracking-tight">LexAI</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-white/60">
                Sistema operacional jurídico. 23 agentes + CRM + jurimetria em
                uma única plataforma.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/55">
                <ShieldCheck className="size-3 text-[#bfa68e]" strokeWidth={2} />
                Dados processados no Brasil
              </div>
            </div>

            {[
              {
                title: 'Produto',
                links: [
                  { l: 'Agentes',       h: '#agentes' },
                  { l: 'Por que LexAI', h: '#diferencial' },
                  { l: 'Planos',        h: '#precos' },
                  { l: 'Empresas',      h: '/empresas' },
                ],
              },
              {
                title: 'Recursos',
                links: [
                  { l: 'FAQ',          h: '#faq' },
                  { l: 'Documentação', h: '/empresas' },
                  { l: 'Sobre',        h: '/sobre' },
                  { l: 'Entrar',       h: '/login' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { l: 'Privacidade LGPD', h: '/privacidade' },
                  { l: 'Termos de uso',    h: '/termos' },
                  { l: 'DPA',              h: '/privacidade' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <div className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/60">
                  {col.title}
                </div>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.l}>
                      <Link
                        href={l.h}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {l.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/50">
            <div>© MMXXVI · LexAI — uma marca Vanix Corp</div>
            <div className="flex items-center gap-4">
              <span>contato@vanixcorp.com</span>
              <span className="size-1 rounded-full bg-white/20" />
              <span>Ituverava, SP · Brasil</span>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />
      <ExitIntent />
    </div>
  )
}
