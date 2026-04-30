'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import {
  CalendarCheck, Check, X, Briefcase, Hammer, Building2,
} from 'lucide-react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ExitIntent } from '@/components/ExitIntent'
import { LexPricingGrid } from '@/components/ui/lex-pricing-grid'
import { AmbientMesh } from '@/components/ui/ambient-mesh'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { agents } from '@/lib/catalog'

/* ═════════════════════════════════════════════════════════════════════
 * /empresas — Página B2B Pralvex (v10.8 Editorial · 2026-04-23)
 * ─────────────────────────────────────────────────────────────────────
 * Usa:
 *   · Paleta Noir Atelier em Tailwind (#bfa68e champagne + neutrals)
 *   · 27 agentes do catalog.ts (8 essenciais + 14 pro + 5 novos v10.8)
 *   · lucide-react em todo o icon set
 *   · AtelierBg + motion-variants para premium Editorial 3D
 * ════════════════════════════════════════════════════════════════════ */

const CASOS = [
  {
    Icon: Briefcase,
    persona: 'Banca de Direito Civil',
    size: '5–15 advogados',
    accent: '#bfa68e',
    pains: 'Alto volume de contratos, revisão lenta e risco de cláusulas abusivas passando despercebidas.',
    solution: 'Resumidor analisa o contrato em 30 segundos apontando cláusulas sensíveis. Redator gera minutas padronizadas. Pesquisador fundamenta com jurisprudência atual.',
  },
  {
    Icon: Hammer,
    persona: 'Advocacia Trabalhista',
    size: '3–10 advogados',
    accent: '#D4A853',
    pains: 'Cálculos de verbas rescisórias complexos, prazos apertados e grande volume de audiências simultâneas.',
    solution: 'Calculador apura verbas com correção e juros automáticos. Rotina organiza pautas e prazos. Negociador prepara estratégias para acordos em audiência.',
  },
  {
    Icon: Building2,
    persona: 'Departamento Jurídico',
    size: 'Empresas médias e grandes',
    accent: '#6B8F71',
    pains: 'Alto volume de demandas internas, padronização entre áreas e compliance regulatório contínuo.',
    solution: 'Compliance monitora mudanças regulatórias. Modelos customizados garantem padronização entre times. Parecerista entrega análises prontas para assinatura.',
  },
]

// PLANOS agora vêm do componente canônico <LexPricingGrid />
// (single source of truth em src/components/ui/lex-pricing-grid.tsx)

const COMPARATIVO = [
  { k: 'Jurisprudência brasileira',        them: 'Inventa acórdão com número falso',      us: 'Cada citação com link rastreável' },
  { k: 'Cálculo de prazo com feriado',     them: 'Não considera feriado local',            us: 'Estadual + municipal + recesso forense' },
  { k: 'LGPD e retenção de dados',         them: 'Treina modelo público com seu caso',     us: 'Dado do cliente nunca treina modelo público' },
  { k: 'Modelo de peça padrão',            them: 'Impossível — memória limitada',          us: 'Galeria própria, glossário por cliente' },
  { k: 'Correção INPC / IGPM / SELIC',     them: 'Aproximação errada',                     us: 'Série histórica oficial integrada' },
  { k: 'Quando não sabe',                  them: 'Inventa resposta confiante',             us: 'Recusa e pede fonte adicional' },
  { k: 'Suporte em português',             them: 'Fórum em inglês, fila infinita',         us: 'WhatsApp < 4h úteis, operador jurídico' },
  { k: 'Conformidade LGPD',                them: 'Servidor nos EUA, cláusula genérica',    us: 'Processamento BR, contrato DPA' },
]

function useScrollReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (prefersReduced) {
      nodes.forEach((n) => n.setAttribute('data-revealed', 'true'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', 'true')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}

const NEW_V108 = new Set(['cnj', 'comparador', 'risco', 'flashcards', 'plano', 'casos'])

export default function EmpresasPage() {
  useScrollReveal()
  const AGENTS = agents()

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <style jsx global>{`
        [data-reveal] { opacity: 0; transform: translateY(16px); transition: opacity .7s ease, transform .7s ease; transition-delay: var(--reveal-delay, 0ms); }
        [data-reveal][data-revealed="true"] { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="group flex items-center gap-2 text-white">
            <span className="flex size-8 items-center justify-center rounded-md border border-[#bfa68e]/30 bg-gradient-to-br from-[#1a1410] to-black font-mono text-xs tracking-widest text-[#bfa68e] shadow-[0_0_16px_rgba(191,166,142,0.2)] transition-all group-hover:border-[#bfa68e]/50 group-hover:shadow-[0_0_24px_rgba(191,166,142,0.35)]">PX</span>
            <span className="text-sm font-medium tracking-tight">Pralvex</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/" className="hidden text-sm text-white/70 transition hover:text-white sm:inline">Início</Link>
            <Link href="/#precos" className="hidden text-sm text-white/70 transition hover:text-white sm:inline">Planos</Link>
            <Link href="/login" className="text-sm text-white/70 transition hover:text-white">Entrar</Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              Demo 30 min grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="main-content" className="relative overflow-hidden">
        {/* Ambient mesh + scroll progress — soma movimento ao radial estatico */}
        <ScrollProgress />
        <AmbientMesh dust dustCount={10} intensity={0.6} />
        <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(60%_50%_at_50%_0%,#bfa68e1a,transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-20 text-center sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#bfa68e]">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            Pralvex para escritórios e bancas
          </div>

          <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl" data-reveal>
            Seu escritório.<br />
            <em className="bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent">27 especialistas.</em><br />
            Uma assinatura.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-white/60" data-reveal>
            27 agentes de IA calibrados para o Direito brasileiro — 6 novos na v10.8 (CNJ, Comparador, Risco, Flashcards, Plano, Casos). Cada um com conhecimento profundo da sua área, disponível agora — sem contratação, sem onboarding de meses.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3" data-reveal>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              <CalendarCheck size={16} />
              Demo 30 min grátis
            </Link>
            <Link
              href="#casos"
              className="rounded-lg border border-white/15 bg-white/[0.02] px-5 py-3 text-sm text-white/80 transition hover:bg-white/[0.06]"
            >
              Ver casos de uso
            </Link>
          </div>

          {/* Stats editoriais */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4" data-reveal>
            {[
              { roman: 'I',   value: '27',      label: 'Agentes especializados' },
              { roman: 'II',  value: '11',      label: 'Áreas do Direito' },
              { roman: 'III', value: '4 min',   label: 'Por análise' },
              { roman: 'IV',  value: '<24h',    label: 'Setup completo' },
            ].map((st) => (
              <div key={st.roman} className="text-center">
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/30">{st.roman}</div>
                <div className="mt-2 text-3xl font-medium tabular-nums text-white">{st.value}</div>
                <div className="mt-1 text-xs text-white/50">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto h-px max-w-6xl bg-white/10" />

      {/* AGENTES — vem do catalog.ts (27 agentes pós v10.8) */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#bfa68e]">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            Capítulo I · Atelier
          </div>
          <h2 className="mt-4 text-balance text-4xl font-medium leading-tight text-white">
            O gabinete completo,<br />
            <em className="italic text-[#bfa68e]/90">já disponível</em>
          </h2>
          <p className="mt-4 text-white/60">
            Todos os especialistas que seu escritório precisaria contratar — em uma única plataforma, com custo por advogado, sem mensalidade extra por agente.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AGENTS.map((a, i) => {
            const Icon = a.Icon
            const isNew = NEW_V108.has(a.slug)
            return (
              <div
                key={a.slug}
                className={`group relative overflow-hidden rounded-xl border p-5 transition ${
                  isNew
                    ? 'border-[#bfa68e]/35 bg-gradient-to-br from-[#1a1410]/80 via-neutral-950 to-black hover:border-[#bfa68e]/55 hover:shadow-[0_0_28px_rgba(191,166,142,0.25)]'
                    : 'border-white/10 bg-neutral-950 hover:border-white/20 hover:bg-neutral-900'
                }`}
                data-reveal
                style={{ '--reveal-delay': `${Math.min(i * 30, 300)}ms` } as React.CSSProperties}
              >
                {isNew && (
                  <span className="pointer-events-none absolute -right-8 top-3 rotate-[35deg] bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-8 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#0a0807] shadow-[0_0_10px_rgba(191,166,142,0.45)]">
                    Novo
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg border text-[#bfa68e] transition ${
                      isNew
                        ? 'border-[#bfa68e]/35 bg-[#bfa68e]/[0.08] group-hover:border-[#bfa68e]/55 group-hover:shadow-[0_0_12px_rgba(191,166,142,0.3)]'
                        : 'border-white/10 bg-white/5 group-hover:border-[#bfa68e]/30'
                    }`}
                  >
                    <Icon size={18} aria-hidden />
                  </div>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-medium text-white">{a.label}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50">{a.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="mx-auto h-px max-w-6xl bg-white/10" />

      {/* CASOS DE USO */}
      <section id="casos" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#bfa68e]">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            Capítulo II · Perfis
          </div>
          <h2 className="mt-4 text-balance text-4xl font-medium leading-tight text-white">
            Feito para<br />
            <em className="italic text-[#bfa68e]/90">seu perfil</em>
          </h2>
          <p className="mt-4 text-white/60">
            O mesmo sistema de agentes se adapta a bancas de nicho, advocacia de massa e departamentos jurídicos corporativos.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {CASOS.map((c, i) => {
            const Icon = c.Icon
            return (
              <div
                key={c.persona}
                className="rounded-xl border border-white/10 bg-neutral-950 p-6"
                data-reveal
                style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
              >
                <div
                  className="flex size-12 items-center justify-center rounded-lg border"
                  style={{ borderColor: `${c.accent}30`, background: `${c.accent}0d`, color: c.accent }}
                >
                  <Icon size={22} aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-medium text-white">{c.persona}</h3>
                <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">{c.size}</div>

                <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
                  <div>
                    <div className="mb-1.5 inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-red-400">
                      Dor
                    </div>
                    <p className="text-sm text-white/60">{c.pains}</p>
                  </div>
                  <div>
                    <div className="mb-1.5 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-emerald-400">
                      Solução Pralvex
                    </div>
                    <p className="text-sm text-white/80">{c.solution}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="mx-auto h-px max-w-6xl bg-white/10" />

      {/* PLANOS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#bfa68e]">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            Capítulo III · Investimento
          </div>
          <h2 className="mt-4 text-balance text-4xl font-medium leading-tight text-white">
            Valor por advogado,<br />
            <em className="italic text-[#bfa68e]/90">não por feature</em>
          </h2>
          <p className="mt-4 text-white/60">
            Preço único por assento. Sem cobrança extra por agente, sem limite de documentos no Firma e Enterprise. Plano escolhido pelo tamanho da equipe.
          </p>
        </div>

        <div className="mt-12" data-reveal>
          <LexPricingGrid />
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs text-white/40" data-reveal>
          Todos os planos incluem demo de 30 min grátis · Cancelamento a qualquer momento · Sem taxa de setup
        </p>
      </section>

      <div className="mx-auto h-px max-w-6xl bg-white/10" />

      {/* COMPARATIVO */}
      <section className="mx-auto max-w-5xl px-4 py-20" data-reveal>
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#bfa68e]">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            Capítulo IV · Comparativo
          </div>
          <h2 className="mt-4 text-balance text-4xl font-medium leading-tight text-white">
            Por que <em className="italic text-[#bfa68e]/90">não</em> usar ChatGPT para peça?
          </h2>
          <p className="mt-4 text-white/60">
            Um modelo generalista não foi treinado para jurisprudência brasileira.
            Pior: ele inventa citação para parecer útil. A Pralvex recusa antes de fabricar.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-neutral-950">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-0 border-b border-white/10 bg-neutral-900 px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.2em]">
            <div />
            <div className="text-white/40">ChatGPT / Gemini</div>
            <div className="text-[#bfa68e]">Pralvex</div>
          </div>
          {COMPARATIVO.map((row) => (
            <div
              key={row.k}
              className="grid grid-cols-[1.2fr_1fr_1fr] gap-0 border-b border-white/5 px-4 py-4 text-sm last:border-b-0"
            >
              <div className="pr-3 text-white/70">{row.k}</div>
              <div className="flex items-start gap-2 pr-3 text-red-400/80">
                <X size={14} className="mt-0.5 flex-none" aria-hidden />
                <span className="text-white/50">{row.them}</span>
              </div>
              <div className="flex items-start gap-2 text-emerald-400/90">
                <Check size={14} className="mt-0.5 flex-none" aria-hidden />
                <span className="text-white/80">{row.us}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto h-px max-w-6xl bg-white/10" />

      {/* CTA FINAL */}
      <section className="mx-auto max-w-5xl px-4 py-20" data-reveal>
        <div className="relative overflow-hidden rounded-2xl border border-[#bfa68e]/20 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,#bfa68e1f,transparent_60%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#bfa68e]">
              <span className="size-1.5 rounded-full bg-[#bfa68e]" />
              Capítulo V · Próximo Passo
            </div>
            <h2 className="mt-4 text-balance text-4xl font-medium leading-tight text-white sm:text-5xl">
              Pronto para conhecer<br />a Pralvex <em className="italic text-[#bfa68e]/90">na prática?</em>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Demonstração ao vivo de 30 minutos. Nenhum compromisso de assinatura. Proposta no mesmo dia.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                <CalendarCheck size={16} />
                Demo 30 min grátis
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-white/15 bg-white/[0.02] px-6 py-3 text-sm text-white/80 transition hover:bg-white/[0.06]"
              >
                Ver a plataforma completa
              </Link>
            </div>
            <div className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/40">
              30 minutos &nbsp;·&nbsp; Sem compromisso &nbsp;·&nbsp; Proposta em até 24h
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded border border-[#bfa68e]/30 bg-gradient-to-br from-[#1a1410] to-black font-mono text-[0.6rem] tracking-widest text-[#bfa68e]">PX</span>
            <span className="text-xs text-white/50">
              © MMXXVI Pralvex
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
            <Link href="/" className="transition hover:text-white">Início</Link>
            <Link href="/#precos" className="transition hover:text-white">Planos</Link>
            <Link href="/empresas" className="transition hover:text-white">Para Empresas</Link>
            <Link href="/privacidade" className="transition hover:text-white">Privacidade (LGPD)</Link>
            <Link href="/termos" className="transition hover:text-white">Termos de Uso</Link>
            <a href="tel:+5534993026456" className="text-[#bfa68e]/80 transition hover:text-[#e6d4bd]">
              (34) 99302-6456
            </a>
          </div>
        </div>
      </footer>

      <WhatsAppFloat message="Olá! Vim do site da Pralvex Empresas e gostaria de uma demonstração." />
      <ExitIntent />
    </div>
  )
}
