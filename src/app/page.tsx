'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Scale,
  Menu,
  X,
  Check,
  Minus,
  Sparkles,
  Zap,
} from 'lucide-react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ExitIntent } from '@/components/ExitIntent'
import { LexAgentsBento } from '@/components/ui/lex-agents-bento'
import { LexAreasMarquee } from '@/components/ui/lex-areas-marquee'
import { LexPricing } from '@/components/ui/lex-pricing'
import { LexFaq } from '@/components/ui/lex-faq'
import { LexFinalCta } from '@/components/ui/lex-final-cta'
import { LexManifesto } from '@/components/ui/lex-manifesto'
import { LexProvimento } from '@/components/ui/lex-provimento'
import { LexHeroStage, GlyphReveal } from '@/components/ui/lex-hero-stage'
import { Reveal, WordReveal } from '@/components/ui/reveal'

/* ════════════════════════════════════════════════════════════════════
 * LexAI — Landing v9 "Editorial 3D" (2026-04-19)
 * ────────────────────────────────────────────────────────────────────
 * Reescrita completa baseada no brain VanixCorp:
 *
 * DIRECAO DE DESIGN (vault: 05-design/reference-library/, atelier-design-system)
 *  - Editorial-SaaS DNA · Cormorant/Playfair serif accent + DM Sans body
 *  - Champagne #bfa68e + warm stone sobre noir profundo
 *  - 40% MENOS densidade que competidor BR (silent software)
 *  - Hairline rules · big-number drama · serif italic editorial
 *
 * MOMENTO 3D (request explicito do operador "animacoes 3ds")
 *  - LexHeroStage: 6 cards de agentes em perspective real, mouse parallax
 *  - lex-tilt nos pricing cards — 3D rotateY/X em hover
 *  - lex-stage-float-in keyframe — entrada flutuante z-depth
 *
 * COPY (vault: 12-personas/socio-gestor-30-150 + renato-advogado)
 *  - Persona Renato (52, conservative, anti-hype): vocabulario "peca, Provimento"
 *  - Anti-positioning vs ChatGPT (compliance-first, nao hype-first)
 *  - Anchor competitivo: Astrea R$1.379 x usuario quebra a 9 advs
 *  - Numero correto: 22 agentes (14 prontos + 8 em onda), NAO 23
 *
 * ARQUITETURA (12 secoes, hierarquia validada pelo brain)
 *   1. Nav glass progressivo
 *   2. Hero 3D (stage + headline serif italic + CTAs magnetic)
 *   3. Trust strip
 *   4. Areas marquee (9 areas)
 *   5. Manifesto editorial (anti-positioning, 3 pilares)
 *   6. Agentes bento (catalog.ts: 22 agentes + 3 modulos)
 *   7. Comparativo vs ChatGPT (linhas honestas)
 *   8. Provimento 205 block (compliance-first big-number)
 *   9. Pricing (3 tiers + toggle anual)
 *  10. FAQ (7 questoes reais de socio-gestor)
 *  11. Final CTA (20h/semana economia, money-back)
 *  12. Footer institucional
 * ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white antialiased">
      {/* ═══ NAV ═══════════════════════════════════════════════════════ */}
      <header
        className={
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ' +
          (scrolled
            ? 'border-b border-white/[0.08] bg-black/80 backdrop-blur-2xl'
            : 'bg-transparent')
        }
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent transition-all group-hover:border-[#bfa68e]/40">
              <Scale
                className="size-4 text-[#e6d4bd]"
                strokeWidth={1.6}
              />
              {/* corner glints */}
              <span
                aria-hidden
                className="pointer-events-none absolute -left-px -top-px size-2 rounded-tl-lg border-l border-t border-[#bfa68e]/40"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-px -right-px size-2 rounded-br-lg border-b border-r border-[#bfa68e]/40"
              />
            </div>
            <span className="font-serif text-[15px] tracking-tight text-white">
              LexAI
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#agentes"
              className="text-[13px] text-white/60 transition-colors hover:text-white"
            >
              Agentes
            </a>
            <a
              href="#manifesto"
              className="text-[13px] text-white/60 transition-colors hover:text-white"
            >
              Manifesto
            </a>
            <a
              href="#provimento"
              className="text-[13px] text-white/60 transition-colors hover:text-white"
            >
              Compliance
            </a>
            <a
              href="#precos"
              className="text-[13px] text-white/60 transition-colors hover:text-white"
            >
              Planos
            </a>
            <a
              href="#faq"
              className="text-[13px] text-white/60 transition-colors hover:text-white"
            >
              FAQ
            </a>
            <Link
              href="/login"
              className="text-[13px] text-white/60 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-[#bfa68e]/30 bg-gradient-to-br from-[#bfa68e]/[0.18] to-transparent px-4 text-[12px] font-medium text-[#e6d4bd] transition hover:border-[#bfa68e]/60 hover:from-[#bfa68e]/[0.28]"
            >
              Agendar demo
              <ArrowRight
                className="size-3 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
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

      {/* mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl md:hidden"
          role="dialog"
        >
          <div className="flex h-16 items-center justify-between px-6">
            <span className="font-serif text-[15px] tracking-tight text-white">
              LexAI
            </span>
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
              { l: 'Agentes', h: '#agentes' },
              { l: 'Manifesto', h: '#manifesto' },
              { l: 'Compliance', h: '#provimento' },
              { l: 'Planos', h: '#precos' },
              { l: 'FAQ', h: '#faq' },
              { l: 'Empresas', h: '/empresas' },
              { l: 'Entrar', h: '/login' },
            ].map((i) => (
              <a
                key={i.l}
                href={i.h}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/5 py-4 font-serif text-xl tracking-tight"
              >
                {i.l}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] text-sm font-medium text-black"
            >
              Agendar demo <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      )}

      {/* ═══ HERO — 3D STAGE + EDITORIAL HEADLINE ════════════════════ */}
      <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-28">
        {/* dark gradient base */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-30 bg-gradient-to-b from-[#0a0f12] via-black to-black"
        />

        {/* 3D stage atras do conteudo */}
        <LexHeroStage />

        {/* radial overlay pra dar foco no centro */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(50%_45%_at_50%_45%,rgba(0,0,0,0.7)_0%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_40%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_70%)]"
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Eyebrow */}
          <Reveal>
            <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-4 py-1.5 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bfa68e] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#bfa68e]" />
              </span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-white/75">
                O sistema operacional do Direito brasileiro
              </span>
            </div>
          </Reveal>

          {/* Headline — editorial serif italic, anti-hype */}
          <h1 className="text-balance font-serif text-[3rem] leading-[1.02] tracking-[-0.02em] text-white md:text-[5rem] lg:text-[5.8rem]">
            <WordReveal text="O copiloto que" className="block" stagger={0.08} />
            <span className="mt-2 block italic text-[#e6d4bd]">
              <GlyphReveal text="recusa" delay={0.5} stagger={0.04} />
            </span>
            <span className="mt-2 block">
              <WordReveal
                text="antes de inventar."
                stagger={0.06}
              />
            </span>
          </h1>

          <Reveal delay={0.85}>
            <p className="mx-auto mt-9 max-w-2xl text-balance text-[16px] leading-[1.65] text-white/70 md:text-[17px]">
              Vinte e dois agentes treinados em PJe, Provimentos e rotina de
              escritório brasileiro. CRM jurídico, jurimetria e marketing
              OAB-compliant — no lugar de cinco contratos diferentes.
            </p>
          </Reveal>

          <Reveal delay={1.0}>
            <div className="mt-11 flex flex-col items-center justify-center gap-3 md:flex-row">
              <Link
                href="/login"
                className="lex-magnetic group relative inline-flex h-13 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] px-8 py-3.5 text-[14px] font-medium text-black transition hover:brightness-110"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.55)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer"
                />
                <span className="relative">Começar 7 dias grátis</span>
                <ArrowRight
                  className="relative size-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
              <Link
                href="#agentes"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-8 py-3.5 text-[14px] font-medium text-white backdrop-blur transition hover:border-white/35 hover:bg-white/[0.08]"
              >
                <CalendarCheck className="size-4" strokeWidth={1.75} />
                Ver os 22 agentes
              </Link>
            </div>
          </Reveal>

          {/* Stats — figure rise */}
          <Reveal delay={1.15}>
            <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
              {[
                { v: '22', k: 'agentes + 3 módulos' },
                { v: '9', k: 'áreas do Direito' },
                { v: '4min', k: 'por documento' },
                { v: '+40', k: 'escritórios em beta' },
              ].map((s, i) => (
                <div key={s.k} className="flex flex-col items-center">
                  <div
                    className="lex-figure bg-gradient-to-br from-white via-white to-[#bfa68e] bg-clip-text font-serif text-4xl font-semibold tabular-nums text-transparent md:text-5xl"
                    style={{
                      WebkitBackgroundClip: 'text',
                      animationDelay: `${1.2 + i * 0.08}s`,
                    }}
                  >
                    {s.v}
                  </div>
                  <div className="mt-2.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/45">
                    {s.k}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Trust strip */}
        <div className="relative mx-auto mt-20 max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3 border-y border-white/[0.06] py-7">
            {[
              'LGPD nativa',
              'Provimento 205 / OAB',
              'Servidor em São Paulo',
              'SSO + audit logs',
              'DPA assinado · zero retenção',
            ].map((t) => (
              <span
                key={t}
                className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/55"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AREAS MARQUEE ═════════════════════════════════════════════ */}
      <LexAreasMarquee />

      {/* ═══ MANIFESTO — editorial divider ═══════════════════════════ */}
      <div id="manifesto">
        <LexManifesto />
      </div>

      {/* ═══ AGENTES BENTO ═════════════════════════════════════════════ */}
      <LexAgentsBento />

      {/* ═══ DIFERENCIAIS — vs ChatGPT/Generalistas ══════════════════ */}
      <section
        id="diferencial"
        className="relative isolate overflow-hidden bg-black py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(50%_45%_at_50%_0%,rgba(191,166,142,0.07)_0%,transparent_70%)]"
        />

        <div className="mx-auto max-w-5xl px-6">
          <Reveal as="div" className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/65">
              <Zap className="size-3 text-[#bfa68e]" strokeWidth={2} />
              LexAI vs generalista
            </div>
            <h2 className="text-balance font-serif text-4xl text-white md:text-5xl">
              Por que generalistas{' '}
              <span className="italic text-[#e6d4bd]">falham em peça</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/65">
              Modelo genérico inventa citação para parecer útil. A LexAI recusa
              antes de fabricar.
            </p>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-neutral-950 to-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
          >
            <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-white/[0.08] bg-white/[0.02]">
              <div className="px-6 py-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/55">
                Comparativo
              </div>
              <div className="px-6 py-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/55">
                ChatGPT / Gemini
              </div>
              <div className="flex items-center gap-2 px-6 py-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#e6d4bd]">
                <Sparkles className="size-3" strokeWidth={2} />
                LexAI
              </div>
            </div>
            {[
              {
                k: 'Jurisprudência BR',
                them: 'Inventa acórdão fake',
                us: 'Link rastreável STF/STJ',
              },
              {
                k: 'Cálculo de prazo',
                them: 'Ignora feriado local',
                us: 'Estadual + municipal',
              },
              {
                k: 'Retenção de dados',
                them: 'Treina modelo público',
                us: 'Zero retenção',
              },
              {
                k: 'Modelos próprios',
                them: 'Sem memória persistente',
                us: 'Galeria por escritório',
              },
              {
                k: 'Correção monetária',
                them: 'Aproximação errada',
                us: 'INPC, IGPM, IPCA oficiais',
              },
              {
                k: 'Quando não sabe',
                them: 'Inventa com confiança',
                us: 'Recusa e pede fonte',
              },
              {
                k: 'Conformidade LGPD',
                them: 'Servidor EUA, contrato genérico',
                us: 'BR + DPA assinado',
              },
            ].map((row, i) => (
              <motion.div
                key={row.k}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.04 }}
                className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-white/[0.04] last:border-b-0 transition-colors hover:bg-white/[0.02]"
              >
                <div className="px-6 py-4 text-[14px] font-medium text-white">
                  {row.k}
                </div>
                <div className="flex items-start gap-2 px-6 py-4 text-[13.5px] text-white/55">
                  <Minus
                    className="mt-0.5 size-3.5 shrink-0 text-red-400/60"
                    strokeWidth={2.5}
                  />
                  <span>{row.them}</span>
                </div>
                <div className="flex items-start gap-2 px-6 py-4 text-[13.5px] text-white/90">
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-[#bfa68e]"
                    strokeWidth={2.5}
                  />
                  <span>{row.us}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ PROVIMENTO 205 — compliance-first ═══════════════════════ */}
      <div id="provimento">
        <LexProvimento />
      </div>

      {/* ═══ PRICING ═══════════════════════════════════════════════════ */}
      <LexPricing />

      {/* ═══ FAQ ═══════════════════════════════════════════════════════ */}
      <LexFaq />

      {/* ═══ FINAL CTA ═════════════════════════════════════════════════ */}
      <LexFinalCta />

      {/* ═══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.06] bg-black">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="relative flex size-9 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent">
                  <Scale
                    className="size-4 text-[#e6d4bd]"
                    strokeWidth={1.6}
                  />
                </div>
                <span className="font-serif text-[15px] tracking-tight text-white">
                  LexAI
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-[13.5px] leading-[1.6] text-white/55">
                Sistema operacional jurídico. 22 agentes + CRM + jurimetria em
                uma única plataforma — no lugar de cinco contratos.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/55">
                <ShieldCheck
                  className="size-3 text-[#bfa68e]"
                  strokeWidth={2}
                />
                Dados processados em São Paulo
              </div>
            </div>

            {[
              {
                title: 'Produto',
                links: [
                  { l: 'Agentes', h: '#agentes' },
                  { l: 'Manifesto', h: '#manifesto' },
                  { l: 'Compliance', h: '#provimento' },
                  { l: 'Planos', h: '#precos' },
                  { l: 'Empresas', h: '/empresas' },
                ],
              },
              {
                title: 'Recursos',
                links: [
                  { l: 'FAQ', h: '#faq' },
                  { l: 'Documentação', h: '/empresas' },
                  { l: 'Sobre', h: '/sobre' },
                  { l: 'Entrar', h: '/login' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { l: 'Privacidade LGPD', h: '/privacidade' },
                  { l: 'Termos de uso', h: '/termos' },
                  { l: 'DPA assinado', h: '/privacidade' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <div className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/55">
                  {col.title}
                </div>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.l}>
                      <Link
                        href={l.h}
                        className="text-[13px] text-white/60 transition-colors hover:text-white"
                      >
                        {l.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/45">
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
