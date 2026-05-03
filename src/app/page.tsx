'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Scale,
  Menu,
  X,
} from 'lucide-react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ExitIntent } from '@/components/ExitIntent'
import { LexAgentsBento } from '@/components/ui/lex-agents-bento'
import { PralvexAreasMarquee } from '@/components/ui/pralvex-areas-marquee'
import { LexPricing } from '@/components/ui/lex-pricing'
import { LexFaq } from '@/components/ui/lex-faq'
import { LexFinalCta } from '@/components/ui/lex-final-cta'
import { LexComparison } from '@/components/ui/lex-comparison'
import { LexManifesto } from '@/components/ui/lex-manifesto'
import { LexProvimento } from '@/components/ui/lex-provimento'
import { LexHeroStage, GlyphReveal } from '@/components/ui/lex-hero-stage'
import { Reveal, WordReveal } from '@/components/ui/reveal'
import { AmbientMesh } from '@/components/ui/ambient-mesh'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { EditorialDivider } from '@/components/ui/editorial-divider'
import { ThemeToggle } from '@/components/ThemeToggle'

/* ════════════════════════════════════════════════════════════════════
 * Pralvex — Landing v9 "Editorial 3D" (2026-04-19)
 * ────────────────────────────────────────────────────────────────────
 * Reescrita completa baseada no brain Pralvex:
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
 *  - Numero correto: 27 agentes (v10.8, 6 novos: CNJ/Comparador/Risco/Flashcards/Plano/Casos)
 *
 * ARQUITETURA (12 secoes, hierarquia validada pelo brain)
 *   1. Nav glass progressivo
 *   2. Hero 3D (stage + headline serif italic + CTAs magnetic)
 *   3. Trust strip
 *   4. Areas marquee (9 areas)
 *   5. Manifesto editorial (anti-positioning, 3 pilares)
 *   6. Agentes bento (catalog.ts: 27 agentes + 4 modulos)
 *   7. Comparativo vs ChatGPT (linhas honestas)
 *   8. Provimento 205 block (compliance-first big-number)
 *   9. Pricing (3 tiers + toggle anual)
 *  10. FAQ (7 questoes reais de socio-gestor)
 *  11. Final CTA (20h/semana economia, money-back)
 *  12. Footer institucional
 * ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // Bloqueia render da landing ate decidir se vai pra /intro
  const [introCheck, setIntroCheck] = useState<'pending' | 'show'>('pending')

  // Intro gate (2026-05-02 — Leonardo):
  // - Primeira visita da sessao: redireciona pra /intro (cinematografica)
  // - Visitas seguintes na mesma sessao: vai direto pra landing
  // - sessionStorage zera quando user fecha o browser/tab — proxima
  //   abertura ve intro de novo
  // - Bypass via ?skip=1 ou referrer == /intro (evita loop)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const skipFlag = params.get('skip') === '1'
      const seen = sessionStorage.getItem('pralvex-intro-seen') === '1'
      const cameFromIntro = document.referrer.includes('/intro')

      if (!seen && !skipFlag && !cameFromIntro) {
        // Marca antes de redirect pra evitar loop em caso de back-button
        sessionStorage.setItem('pralvex-intro-seen', '1')
        router.replace('/intro')
        return
      }
      setIntroCheck('show')
    } catch {
      // sessionStorage indisponivel (private mode etc) — mostra landing direto
      setIntroCheck('show')
    }
  }, [router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Render placeholder bem leve enquanto decide redirect — evita flash da
  // landing antes do router.replace('/intro') executar.
  if (introCheck === 'pending') {
    return <div className="min-h-screen surface-base" aria-hidden />
  }

  return (
    <div className="min-h-screen overflow-x-hidden surface-base lex-landing-shell">
      {/* Scroll progress — barra fina dourada no topo */}
      <ScrollProgress />

      {/* ═══ NAV ═══════════════════════════════════════════════════════ */}
      <header
        className={
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ' +
          (scrolled
            ? 'lex-landing-nav-scrolled'
            : 'bg-transparent')
        }
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div
              className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent transition-all overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-p.svg"
                alt="Pralvex"
                className="size-6 object-contain"
                style={{ filter: 'drop-shadow(0 0 6px rgba(191,166,142,0.35))' }}
              />
              {/* corner glints — usa var(--stone-line) pra ficar visivel
                  em light mode (era border-[#bfa68e]/40 hardcoded, sumia
                  no cream bg). */}
              <span
                aria-hidden
                className="pointer-events-none absolute -left-px -top-px size-2 rounded-tl-lg border-l border-t"
                style={{ borderColor: 'var(--stone-line)' }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-px -right-px size-2 rounded-br-lg border-b border-r"
                style={{ borderColor: 'var(--stone-line)' }}
              />
            </div>
            <span
              className="font-serif text-[15px] tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Pralvex
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#agentes"
              className="text-[13px] transition-colors hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              Agentes
            </a>
            <a
              href="#manifesto"
              className="text-[13px] transition-colors hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              Manifesto
            </a>
            <a
              href="#provimento"
              className="text-[13px] transition-colors hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              Compliance
            </a>
            <a
              href="#precos"
              className="text-[13px] transition-colors hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              Planos
            </a>
            <a
              href="#faq"
              className="text-[13px] transition-colors hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              FAQ
            </a>
            <Link
              href="/login"
              className="text-[13px] transition-colors hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              Entrar
            </Link>
            <ThemeToggle variant="landing" />
            <Link
              href="/login"
              className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-br from-[#bfa68e]/[0.18] to-transparent px-4 text-[12px] font-medium transition hover:from-[#bfa68e]/[0.28]"
              style={{
                border: '1px solid var(--stone-line)',
                color: 'var(--accent)',
              }}
            >
              Demo 50 min grátis
              <ArrowRight
                className="size-3 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-md md:hidden"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            aria-label="Abrir menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {/* mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] backdrop-blur-2xl md:hidden"
          role="dialog"
          style={{ background: 'var(--bg-base)' }}
        >
          <div className="flex h-16 items-center justify-between px-6">
            <span
              className="font-serif text-[15px] tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Pralvex
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex size-9 items-center justify-center rounded-md"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
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
                className="py-4 font-serif text-xl tracking-tight"
                style={{
                  borderBottom: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {i.l}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] text-sm font-medium text-black"
            >
              Demo 50 min grátis <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      )}

      {/* ═══ HERO — 3D STAGE + EDITORIAL HEADLINE ════════════════════ */}
      <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-28 lex-hero-bg">
        {/* gradient base — só renderiza em dark via CSS rule */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-30 lex-hero-gradient"
        />

        {/* Ambient mesh — 3 blobs champagne flutuando lento + dust dourado.
            Anima sempre, mesmo sem mouse (mobile-friendly). Intensity boosted
            de 0.85 → 1.1 pra blobs aparecerem visiveis em wide screen. */}
        <AmbientMesh dust dustCount={18} intensity={1.1} />

        {/* 3D stage atras do conteudo */}
        <LexHeroStage />

        {/* radial overlay pra dar foco no centro — opacity reduzida pra
            0.20 (era 0.45) pra deixar os cards do stage e blobs respirarem */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 lex-hero-radial-dark"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_40%_at_50%_0%,rgba(191,166,142,0.18)_0%,transparent_70%)]"
        />

        {/* Headline glow — pulsa sutil por tras do titulo */}
        <div aria-hidden className="lex-headline-glow -z-10" style={{ top: '32%' }} />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Eyebrow */}
          <Reveal>
            <div
              className="mb-9 inline-flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--hover)',
              }}
            >
              <span className="relative flex size-2">
                {/* ping dot — antes bg-[#bfa68e] hardcoded, agora var(--accent)
                    pra cobrir light/dark sem hard-coded hex. */}
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ background: 'var(--accent)' }}
                />
                <span
                  className="relative inline-flex size-2 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              </span>
              <span
                className="font-mono text-[0.62rem] uppercase tracking-[0.24em]"
                style={{ color: 'var(--text-secondary)' }}
              >
                O sistema operacional do Direito brasileiro
              </span>
            </div>
          </Reveal>

          {/* Headline — editorial serif italic, anti-hype */}
          <h1
            className="text-balance font-serif text-[3rem] leading-[1.02] tracking-[-0.02em] md:text-[5rem] lg:text-[5.8rem]"
            style={{ color: 'var(--text-primary)' }}
          >
            <WordReveal text="O copiloto que" className="block" stagger={0.08} />
            <span className="mt-2 block italic text-grad-accent">
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
            <p
              className="mx-auto mt-9 max-w-2xl text-balance text-[16px] leading-[1.65] md:text-[17px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Vinte e sete agentes treinados em PJe, Provimentos e rotina de
              escritório brasileiro. CRM jurídico, jurimetria e marketing
              OAB-compliant — no lugar de cinco contratos diferentes.
            </p>
          </Reveal>

          <Reveal delay={1.0}>
            <div className="mt-11 flex flex-col items-center justify-center gap-3 md:flex-row">
              <Link
                href="/login"
                className="lex-magnetic lex-cta-shimmer press-scale group relative inline-flex h-13 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] px-8 py-3.5 text-[14px] font-medium text-black transition-editorial hover:brightness-110"
              >
                <span className="relative z-10">Demo 50 min grátis</span>
                <ArrowRight
                  className="relative z-10 size-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
              <Link
                href="#agentes"
                className="press-scale hover-lift inline-flex h-13 items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[14px] font-medium backdrop-blur transition-editorial"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--hover)',
                  color: 'var(--text-primary)',
                }}
              >
                <CalendarCheck className="size-4" strokeWidth={1.75} />
                Ver os 27 agentes
              </Link>
            </div>
          </Reveal>

          {/* Stats — figure rise */}
          <Reveal delay={1.15}>
            <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
              {[
                { v: '27', k: 'agentes + 4 módulos' },
                { v: '13', k: 'áreas do Direito' },
                { v: '4min', k: 'por documento' },
                { v: '+40', k: 'escritórios em beta' },
              ].map((s, i) => (
                <div key={s.k} className="flex flex-col items-center">
                  <div
                    className="lex-figure lex-figure-grad font-serif text-4xl font-semibold tabular-nums md:text-5xl"
                    style={{
                      animationDelay: `${1.2 + i * 0.08}s`,
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    className="mt-2.5 font-mono text-[0.6rem] uppercase tracking-[0.22em]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {s.k}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Trust strip */}
        <div className="relative mx-auto mt-20 max-w-5xl px-6">
          <div
            className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3 py-7"
            style={{
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {[
              'LGPD nativa',
              'Provimento 205 / OAB',
              'Servidor em São Paulo',
              'SSO + audit logs',
              'DPA assinado · zero retenção',
            ].map((t) => (
              <span
                key={t}
                className="font-mono text-[0.6rem] uppercase tracking-[0.22em]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AREAS MARQUEE ═════════════════════════════════════════════ */}
      <PralvexAreasMarquee />

      {/* ═══ MANIFESTO — editorial divider ═══════════════════════════ */}
      <div id="manifesto">
        <LexManifesto />
      </div>

      <EditorialDivider variant="numeral" numeral="II · Vinte e sete agentes" />

      {/* ═══ AGENTES BENTO ═════════════════════════════════════════════ */}
      <LexAgentsBento />

      <EditorialDivider variant="numeral" numeral="III · Vs mercado" />

      {/* ═══ COMPARATIVO — 10 rivais × 21 critérios ═══════════════════ */}
      <LexComparison />

      <EditorialDivider variant="numeral" numeral="IV · Compliance" />

      {/* ═══ PROVIMENTO 205 — compliance-first ═══════════════════════ */}
      <div id="provimento">
        <LexProvimento />
      </div>

      <EditorialDivider variant="numeral" numeral="V · Planos" />

      {/* ═══ PRICING ═══════════════════════════════════════════════════ */}
      <LexPricing />

      <EditorialDivider variant="ornament" />

      {/* ═══ FAQ ═══════════════════════════════════════════════════════ */}
      <LexFaq />

      {/* ═══ FINAL CTA ═════════════════════════════════════════════════ */}
      <LexFinalCta />

      {/* ═══ FOOTER ════════════════════════════════════════════════════ */}
      <footer
        className="relative"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-base)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div
                  className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent overflow-hidden"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-p.svg"
                    alt="Pralvex"
                    className="size-6 object-contain"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(191,166,142,0.35))' }}
                  />
                </div>
                <span
                  className="font-serif text-[15px] tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Pralvex
                </span>
              </Link>
              <p
                className="mt-4 max-w-xs text-[13.5px] leading-[1.6]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sistema operacional jurídico. 27 agentes + CRM + jurimetria em
                uma única plataforma — no lugar de cinco contratos.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <div
                  className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.22em]"
                  style={{
                    border: '1px solid var(--border)',
                    background: 'var(--hover)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ShieldCheck className="size-3" strokeWidth={2} style={{ color: 'var(--accent)' }} />
                  Dados processados em São Paulo
                </div>
                <a
                  href="tel:+5534993026456"
                  className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] transition"
                  style={{
                    border: '1px solid var(--stone-line)',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                  Contato (34) 99302-6456
                </a>
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
                  { l: 'Sobre', h: '/sobre' },
                  { l: 'Suporte', h: '/suporte' },
                  { l: 'Status', h: '/status' },
                  { l: 'Entrar', h: '/login' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { l: 'Privacidade LGPD', h: '/privacidade' },
                  { l: 'Termos de uso', h: '/termos' },
                  { l: 'DPA assinado', h: '/dpa' },
                  { l: 'Suporte', h: '/suporte' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <div
                  className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.22em]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {col.title}
                </div>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.l}>
                      <Link
                        href={l.h}
                        className="text-[13px] transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {l.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="mt-14 flex flex-wrap items-center justify-between gap-4 pt-6 font-mono text-[0.6rem] uppercase tracking-[0.18em]"
            style={{
              borderTop: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <div>© MMXXVI · Pralvex</div>
            <div className="flex items-center gap-4">
              <span>contato@pralvex.com.br</span>
              <span className="size-1 rounded-full" style={{ background: 'var(--border)' }} />
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
