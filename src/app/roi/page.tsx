'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ArrowRight, Link2, Sparkles } from 'lucide-react'
import { heroContainer, heroItem, EASE_EDITORIAL } from '@/lib/motion-variants'
import { AmbientMesh } from '@/components/ui/ambient-mesh'
import { ScrollProgress } from '@/components/ui/scroll-progress'

/* ═════════════════════════════════════════════════════════════
 * /roi — calculadora pública (v10.8 Editorial · 2026-04-23)
 * ─────────────────────────────────────────────────────────────
 * Lead magnet da /empresas. Sem cadastro. Resultado sharable via
 * URL params pra prospect encaminhar ao decisor de orçamento.
 * Paleta Noir Atelier, grid 2-col (inputs + resultado destaque).
 * Motion variants + hero layers para premium editorial 3D.
 * ═════════════════════════════════════════════════════════════ */

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const PCT = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 })

const AUTOMATION_RATE = 0.6
const PLANS = [
  { key: 'escritorio', label: 'Escritório', pricePerAdv: 1399, minAdv: 1, maxAdv: 5 },
  { key: 'firma', label: 'Firma', pricePerAdv: 1459, minAdv: 6, maxAdv: 15 },
  { key: 'enterprise', label: 'Enterprise', pricePerAdv: 1599, minAdv: 16, maxAdv: Infinity },
] as const

function pickPlan(advogados: number) {
  return PLANS.find((p) => advogados >= p.minAdv && advogados <= p.maxAdv) || PLANS[2]
}

export default function RoiCalculator() {
  const [advogados, setAdvogados] = useState(5)
  const [horasMes, setHorasMes] = useState(40)
  const [valorHora, setValorHora] = useState(250)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const adv = Number(sp.get('adv'))
    const hrs = Number(sp.get('hrs'))
    const vh = Number(sp.get('vh'))
    if (adv > 0) setAdvogados(adv)
    if (hrs > 0) setHorasMes(hrs)
    if (vh > 0) setValorHora(vh)
  }, [])

  const computed = useMemo(() => {
    const horasEconomizadasMes = horasMes * AUTOMATION_RATE * advogados
    const economiaMes = horasEconomizadasMes * valorHora
    const economiaAno = economiaMes * 12

    const plan = pickPlan(advogados)
    const custoMes = plan.pricePerAdv * advogados
    const custoAno = custoMes * 12

    const ganhoLiquidoAno = economiaAno - custoAno
    const roiPct = custoAno > 0 ? ganhoLiquidoAno / custoAno : 0
    const paybackDias = custoMes > 0 && economiaMes > 0 ? Math.max(1, Math.round(30 * (custoMes / economiaMes))) : 0

    return {
      horasEconomizadasMes,
      economiaMes,
      economiaAno,
      custoMes,
      custoAno,
      ganhoLiquidoAno,
      roiPct,
      paybackDias,
      plan,
    }
  }, [advogados, horasMes, valorHora])

  const copyShareLink = async () => {
    const url = `${window.location.origin}/roi?adv=${advogados}&hrs=${horasMes}&vh=${valorHora}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  // Input class — usa CSS vars via inline style do parent (CSS Tailwind nao acessa
  // var() inline, entao deixamos placeholder e color via parent inline style).
  const inputCls =
    'w-full rounded-lg border border-on-surface bg-[var(--hover)] px-3 py-2.5 text-sm text-on-surface outline-none transition placeholder:opacity-50 focus:border-[#bfa68e]/50'
  const rangeCls =
    'mt-3 w-full accent-[#bfa68e]'

  return (
    <div className="surface-base relative isolate min-h-screen overflow-hidden antialiased">
      <ScrollProgress />
      <AmbientMesh dust dustCount={9} intensity={0.55} />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[620px] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_0%,rgba(191,166,142,0.13),transparent_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent_75%)]" />
      </div>

      <header className="lex-landing-nav-scrolled sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-md md:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-p.png" alt="Pralvex" className="size-6 object-contain" style={{ filter: 'drop-shadow(0 0 6px rgba(191,166,142,0.35))' }} />
          </div>
          <span className="font-serif text-[15px] tracking-tight" style={{ color: 'var(--text-primary)' }}>Pralvex</span>
        </Link>
        <Link
          href="/empresas"
          style={{ borderColor: 'var(--border)', background: 'var(--hover)', color: 'var(--text-primary)' }}
          className="rounded-full border px-4 py-1.5 text-sm transition hover:border-[#bfa68e]/40"
        >
          Ver planos
        </Link>
      </header>

      <main id="main-content" className="relative z-10 mx-auto max-w-5xl px-6 py-14 md:py-20">
        <motion.div initial="hidden" animate="visible" variants={heroContainer}>
          <motion.div variants={heroItem} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/30 bg-gradient-to-r from-[#bfa68e]/[0.08] to-transparent px-3 py-1.5 backdrop-blur">
            <Sparkles size={11} strokeWidth={2} className="text-[#bfa68e]" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[#bfa68e]">
              Nº 004 · ROI · MMXXVI
            </span>
          </motion.div>

          <motion.h1 variants={heroItem} className="text-balance text-4xl font-light leading-[1.08] tracking-tight text-on-surface sm:text-5xl md:text-[3.25rem]">
            Quanto seu escritório{' '}
            <em className="text-grad-accent italic">
              economiza
            </em>{' '}
            com a Pralvex?
          </motion.h1>
          <motion.p variants={heroItem} className="mt-5 max-w-2xl text-base leading-relaxed text-on-surface-muted md:text-lg">
            Resultado em 30 segundos. Nenhum cadastro. Compartilhe o link com quem
            decide o orçamento.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: EASE_EDITORIAL }}
          className="my-10 h-px w-full origin-left bg-gradient-to-r from-transparent via-[#bfa68e]/40 to-transparent"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <section
            className="rounded-2xl border border-on-surface p-6 md:p-7"
            style={{ background: 'var(--card-bg)' }}
            aria-label="Parâmetros"
          >
            <div className="mb-6">
              <label htmlFor="roi-adv" className="mb-1 block text-sm font-medium text-on-surface">
                Número de advogados no escritório
              </label>
              <div className="relative">
                <input
                  id="roi-adv"
                  type="number"
                  min={1}
                  max={500}
                  value={advogados}
                  onChange={(e) => setAdvogados(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                  className={`${inputCls} pr-14 tabular-nums`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[0.7rem] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  advs
                </span>
              </div>
              <input
                aria-label="Número de advogados — slider"
                type="range"
                min={1}
                max={50}
                value={Math.min(50, advogados)}
                onChange={(e) => setAdvogados(Number(e.target.value))}
                className={rangeCls}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="roi-hrs" className="mb-1 block text-sm font-medium text-on-surface">
                Horas/mês por adv. em tarefas repetitivas
              </label>
              <p className="mb-2 text-xs text-on-surface-muted">
                Resumo de processos, pesquisa de jurisprudência, primeira versão de peças.
              </p>
              <div className="relative">
                <input
                  id="roi-hrs"
                  type="number"
                  min={1}
                  max={200}
                  value={horasMes}
                  onChange={(e) => setHorasMes(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                  className={`${inputCls} pr-16 tabular-nums`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[0.7rem] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  horas
                </span>
              </div>
              <input
                aria-label="Horas/mês — slider"
                type="range"
                min={5}
                max={120}
                value={Math.min(120, horasMes)}
                onChange={(e) => setHorasMes(Number(e.target.value))}
                className={rangeCls}
              />
            </div>

            <div>
              <label htmlFor="roi-vh" className="mb-1 block text-sm font-medium text-on-surface">
                Valor/hora faturado por advogado
              </label>
              <p className="mb-2 text-xs text-on-surface-muted">
                Valor médio de billing. Se você não cobra por hora, use o custo/hora carregado.
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  R$
                </span>
                <input
                  id="roi-vh"
                  type="number"
                  min={50}
                  max={3000}
                  step={10}
                  value={valorHora}
                  onChange={(e) => setValorHora(Math.max(50, Math.min(3000, Number(e.target.value) || 50)))}
                  className={`${inputCls} pl-9 tabular-nums`}
                />
              </div>
              <input
                aria-label="Valor/hora — slider"
                type="range"
                min={50}
                max={1000}
                step={10}
                value={Math.min(1000, valorHora)}
                onChange={(e) => setValorHora(Number(e.target.value))}
                className={rangeCls}
              />
            </div>

            <p className="mt-6 border-t border-on-surface pt-4 text-xs leading-relaxed text-on-surface-muted">
              Premissa: <strong className="text-on-surface">{PCT.format(AUTOMATION_RATE)}</strong> do tempo
              repetitivo é automatizado por advogado (base: pilotos em 60+ escritórios).
            </p>
          </section>

          <section
            className="relative overflow-hidden rounded-2xl border border-[#bfa68e]/30 p-6 shadow-[0_30px_90px_-40px_rgba(191,166,142,0.35)] md:p-7"
            style={{ background: 'var(--card-bg)' }}
            aria-label="Resultado"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[#bfa68e]/10 blur-3xl" />

            <div className="relative">
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-[#bfa68e]">
                Ganho líquido no primeiro ano
              </div>
              <div className="mt-2 text-balance text-5xl font-light tabular-nums leading-none text-on-surface sm:text-6xl">
                {BRL.format(Math.max(0, computed.ganhoLiquidoAno))}
              </div>
              <div className="mt-3 text-sm text-on-surface-muted">
                ROI: <strong className="text-on-surface">{PCT.format(Math.max(0, computed.roiPct))}</strong> ·
                Payback em <strong className="text-on-surface">{computed.paybackDias} dias</strong>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-on-surface pt-5">
                <div>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Horas economizadas/mês
                  </dt>
                  <dd className="mt-1 text-lg font-medium tabular-nums text-on-surface">
                    {computed.horasEconomizadasMes.toFixed(0)}h
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Economia/mês
                  </dt>
                  <dd className="mt-1 text-lg font-medium tabular-nums text-on-surface">
                    {BRL.format(computed.economiaMes)}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Plano indicado
                  </dt>
                  <dd className="mt-1 text-lg font-medium text-on-surface">{computed.plan.label}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Investimento/mês
                  </dt>
                  <dd className="mt-1 text-lg font-medium tabular-nums text-on-surface">
                    {BRL.format(computed.custoMes)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/empresas"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-5 py-2.5 text-sm font-medium text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.3)] transition hover:shadow-[0_0_40px_rgba(191,166,142,0.55)]"
                >
                  Ver o plano {computed.plan.label}
                  <ArrowRight size={14} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <button
                  onClick={copyShareLink}
                  style={{ borderColor: 'var(--border)', background: 'var(--hover)', color: 'var(--text-primary)' }}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm backdrop-blur transition hover:border-[#bfa68e]/40"
                >
                  <Link2 size={13} strokeWidth={1.75} />
                  {copied ? 'Link copiado!' : 'Copiar link do resultado'}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
          <Link href="/empresas" className="transition hover:text-on-surface">
            Página B2B
          </Link>
          <span>·</span>
          <Link href="/" className="transition hover:text-on-surface">
            Início
          </Link>
          <span>·</span>
          <Link href="/privacidade" className="transition hover:text-on-surface">
            Privacidade
          </Link>
        </div>
      </main>

      <WhatsAppFloat message="Olá! Usei a calculadora de ROI da Pralvex e gostaria de conversar sobre os planos." />
    </div>
  )
}
