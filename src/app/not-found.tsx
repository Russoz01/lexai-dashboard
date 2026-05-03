import Link from 'next/link'
import type { Metadata } from 'next'
import { AmbientMesh } from '@/components/ui/ambient-mesh'
import {
  ArrowRight,
  Home,
  LayoutDashboard,
  CreditCard,
  Mail,
  Phone,
  Search,
  Compass,
  type LucideIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pagina nao encontrada · Pralvex',
  robots: { index: false, follow: false },
}

interface QuickLink {
  href: string
  Icon: LucideIcon
  label: string
  desc: string
}

const QUICK_LINKS: QuickLink[] = [
  { href: '/', Icon: Home, label: 'Início', desc: 'Landing com 27 agentes' },
  { href: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard', desc: 'Seu gabinete jurídico' },
  { href: '/dashboard/planos', Icon: CreditCard, label: 'Planos', desc: 'Escritório · Firma · Enterprise' },
  { href: '/empresas', Icon: Compass, label: 'Para empresas', desc: 'B2B · ROI · casos de uso' },
]

const HOT_AGENTS: { href: string; label: string }[] = [
  { href: '/dashboard/consultor', label: 'Consultor' },
  { href: '/dashboard/redator', label: 'Redator' },
  { href: '/dashboard/pesquisador', label: 'Pesquisador' },
  { href: '/dashboard/risco', label: 'Risco' },
  { href: '/dashboard/contestador', label: 'Contestador' },
  { href: '/dashboard/parecerista', label: 'Parecerista' },
]

export default function NotFound() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden surface-base">
      {/* Ambient mesh — blobs champagne flutuando + dust dourado */}
      <AmbientMesh dust dustCount={14} intensity={0.85} />

      {/* Headline glow pulsing atras do titulo */}
      <div aria-hidden className="lex-headline-glow -z-10" style={{ top: '38%' }} />

      {/* Radial top — soma profundidade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(191,166,142,0.12), transparent 70%)',
        }}
      />

      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 md:py-24">
        {/* Serial editorial */}
        <div
          className="lex-figure inline-flex items-center gap-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.32em] text-[#bfa68e]/80"
          style={{ animationDelay: '0.05s' }}
        >
          <span className="h-px w-10 bg-[#bfa68e]/40" />
          Erro · MMXXVI · Nº 404
          <span className="h-px w-10 bg-[#bfa68e]/40" />
        </div>

        {/* Headline */}
        <h1
          className="lex-figure max-w-3xl text-balance text-center font-serif italic"
          style={{
            fontSize: 'clamp(36px, 6.5vw, 72px)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            animationDelay: '0.18s',
            textShadow: '0 0 60px var(--glow)',
          }}
        >
          Esta página{' '}
          <span className="text-grad-accent">não consta</span>
          {' '}no sumário.
        </h1>

        {/* hairline */}
        <div
          aria-hidden
          className="lex-figure h-px w-16"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(191,166,142,0.5), transparent)',
            animationDelay: '0.32s',
          }}
        />

        {/* Lede */}
        <p
          className="lex-figure max-w-xl text-balance text-center text-[15px] leading-[1.7] text-on-surface-muted"
          style={{ animationDelay: '0.42s' }}
        >
          O endereço que você tentou acessar não existe ou foi movido. Use os
          atalhos abaixo para navegar pelo gabinete ou entre em contato direto.
        </p>

        {/* CTAs principais */}
        <div
          className="lex-figure flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: '0.55s' }}
        >
          <Link
            href="/"
            className="lex-magnetic group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] px-7 text-[13px] font-medium text-[#0a0807] shadow-[0_8px_24px_rgba(191,166,142,0.28)] transition hover:shadow-[0_12px_36px_rgba(191,166,142,0.45)]"
          >
            Voltar ao início
            <ArrowRight size={14} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/dashboard"
            style={{ borderColor: 'var(--border)', background: 'var(--hover)', color: 'var(--text-primary)' }}
            className="inline-flex h-12 items-center gap-2 rounded-full border px-7 text-[13px] font-medium backdrop-blur transition hover:border-[#bfa68e]/40"
          >
            <LayoutDashboard size={14} strokeWidth={1.75} />
            Abrir dashboard
          </Link>
        </div>

        {/* Quick links cards */}
        <div className="mt-4 w-full max-w-3xl">
          <div className="mb-5 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
            <span className="h-px w-8" style={{ background: 'var(--border)' }} />
            Atalhos do atelier
            <span className="h-px w-8" style={{ background: 'var(--border)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {QUICK_LINKS.map((q, i) => {
              const Icon = q.Icon
              return (
                <Link
                  key={q.href}
                  href={q.href}
                  className="lex-figure group relative flex flex-col gap-2 rounded-xl border p-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#bfa68e]/30"
                  style={{ animationDelay: `${0.65 + i * 0.06}s`, borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                >
                  <div className="flex size-9 items-center justify-center rounded-lg border border-[#bfa68e]/25 bg-gradient-to-br from-[#bfa68e]/[0.14] to-transparent text-[#e6d4bd] transition-colors group-hover:border-[#bfa68e]/45 group-hover:from-[#bfa68e]/[0.22]">
                    <Icon size={15} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-on-surface">{q.label}</div>
                    <div className="mt-0.5 text-[11px] text-on-surface-muted">{q.desc}</div>
                  </div>
                  <ArrowRight
                    size={11}
                    strokeWidth={2}
                    className="absolute right-3 top-3 transition-all group-hover:translate-x-0.5 group-hover:text-[#bfa68e]/80"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Hot agents — chips clickable */}
        <div className="mt-2 w-full max-w-3xl">
          <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--text-muted)' }}>
            <Search size={11} strokeWidth={2} className="text-[#bfa68e]/60" />
            Talvez você esteja procurando
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {HOT_AGENTS.map((a, i) => (
              <Link
                key={a.href}
                href={a.href}
                className="lex-figure inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition hover:border-[#bfa68e]/35 hover:bg-[#bfa68e]/[0.08] hover:text-[#e6d4bd]"
                style={{ animationDelay: `${0.95 + i * 0.04}s`, borderColor: 'var(--border)', background: 'var(--hover)', color: 'var(--text-secondary)' }}
              >
                <span className="size-1 rounded-full bg-[#bfa68e]/40" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contato — telefone + email */}
        <div
          className="lex-figure mt-6 flex flex-wrap items-center justify-center gap-4 border-t pt-6 font-mono text-[11px] uppercase tracking-[0.22em]"
          style={{ animationDelay: '1.25s', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Atendimento direto</span>
          <a
            href="tel:+5534993026456"
            className="inline-flex items-center gap-2 text-[#bfa68e]/85 transition hover:text-[#e6d4bd]"
          >
            <Phone size={11} strokeWidth={2.2} />
            (34) 99302-6456
          </a>
          <span style={{ color: 'var(--text-muted)', opacity: 0.4 }}>·</span>
          <a
            href="mailto:contato@pralvex.com.br"
            className="inline-flex items-center gap-2 text-[#bfa68e]/85 transition hover:text-[#e6d4bd]"
          >
            <Mail size={11} strokeWidth={2.2} />
            contato@pralvex.com.br
          </a>
        </div>
      </main>
    </div>
  )
}
