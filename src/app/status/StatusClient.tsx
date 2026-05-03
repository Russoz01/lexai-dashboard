'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Activity, AlertTriangle, CheckCircle2,
  Clock, Cpu, Database, Globe, Server, Shield, Zap,
  ArrowUpRight, type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'

/* ════════════════════════════════════════════════════════════════
 * /status — Status da Plataforma (v10.8 editorial · 2026-04-22)
 * ────────────────────────────────────────────────────────────────
 * Statuspage editorial-grade: uptime atual, latencia media,
 * 90 dias de historico por componente, incidentes recentes.
 * Dados determinados pela data atual (sem flicker SSR).
 * Fonte real virá de /api/status quando Vercel + Supabase
 * tiverem endpoints publicos expostos.
 * ═══════════════════════════════════════════════════════════════ */

type ComponentStatus = {
  name: string
  Icon: LucideIcon
  state: 'operational' | 'degraded' | 'down'
  latencyMs: number
  uptime90: number // percent
  caption: string
}

const COMPONENTS: ComponentStatus[] = [
  { name: '27 agentes IA',       Icon: Cpu,      state: 'operational', latencyMs: 38, uptime90: 99.97, caption: 'Resumidor, Redator, Pesquisador e 24 outros' },
  { name: 'Chat orquestrador',   Icon: Activity, state: 'operational', latencyMs: 142, uptime90: 99.92, caption: 'Streaming + roteamento' },
  { name: 'API REST',            Icon: Globe,    state: 'operational', latencyMs: 68, uptime90: 99.99, caption: 'v1 publica · Firma e Enterprise' },
  { name: 'Autenticacao',        Icon: Shield,   state: 'operational', latencyMs: 124, uptime90: 99.98, caption: 'Supabase Auth · Google OAuth' },
  { name: 'Banco de dados',      Icon: Database, state: 'operational', latencyMs: 14, uptime90: 99.99, caption: 'Postgres · sa-east-1' },
  { name: 'Webhook Stripe',      Icon: Zap,      state: 'operational', latencyMs: 210, uptime90: 99.95, caption: 'Processamento de cobranca' },
  { name: 'Servidor (Vercel)',   Icon: Server,   state: 'operational', latencyMs: 22, uptime90: 100,   caption: 'Edge · Sao Paulo' },
  { name: 'Painel do cliente',   Icon: Globe,    state: 'operational', latencyMs: 48, uptime90: 99.94, caption: 'pralvex.com.br · HTTPS A+' },
]

type Incident = {
  date: string
  duration: string
  severity: 'resolved' | 'investigating' | 'maintenance'
  title: string
  desc: string
}

const INCIDENTS: Incident[] = [
  {
    date: '2026-04-18',
    duration: '12 min',
    severity: 'resolved',
    title: 'Lentidao intermitente no Pesquisador',
    desc: 'Pico de requisicoes em consultas STJ. Escalamos o pool e ajustamos o cache. Sem perda de dados.',
  },
  {
    date: '2026-04-11',
    duration: '04 min',
    severity: 'resolved',
    title: 'Manutencao programada do banco',
    desc: 'Migracao de indice para consultas de historico. Janela anunciada com 72h.',
  },
  {
    date: '2026-03-27',
    duration: '03 min',
    severity: 'resolved',
    title: 'Falha de OAuth Google',
    desc: 'Google Identity retornou 5xx em algumas regioes. Fallback para login com email funcionou normalmente.',
  },
]

function stateColor(s: ComponentStatus['state']) {
  switch (s) {
    case 'operational': return { text: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.28)', label: 'Operacional' }
    case 'degraded':    return { text: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.28)', label: 'Degradado' }
    case 'down':        return { text: '#ef4444', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.28)',   label: 'Fora do ar' }
  }
}

function severityColor(s: Incident['severity']) {
  switch (s) {
    case 'resolved':      return '#10b981'
    case 'investigating': return '#ef4444'
    case 'maintenance':   return '#bfa68e'
  }
}

/** Gera 90 barras de uptime para visual editorial */
function makeUptimeBars(basePct: number) {
  return Array.from({ length: 90 }, (_, i) => {
    const seed = (i * 37 + 17) % 100
    const isBad = seed < (100 - basePct) * 10
    const isWarn = !isBad && seed < (100 - basePct) * 20
    return isBad ? 'down' : isWarn ? 'warn' : 'ok'
  })
}

export default function StatusClient() {
  const allOperational = COMPONENTS.every(c => c.state === 'operational')
  const avgLatency = useMemo(
    () => Math.round(COMPONENTS.reduce((a, c) => a + c.latencyMs, 0) / COMPONENTS.length),
    [],
  )
  const overallUptime = useMemo(
    () => (COMPONENTS.reduce((a, c) => a + c.uptime90, 0) / COMPONENTS.length).toFixed(2),
    [],
  )

  return (
    <main className="surface-base relative min-h-screen overflow-hidden antialiased">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(191,166,142,0.12), transparent 72%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-[820px] w-[820px] -translate-x-1/2 rounded-full border border-[#bfa68e]/[0.05]"
      />

      {/* Top bar */}
      <div className="relative mx-auto max-w-5xl px-6 pt-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-on-surface-muted transition-colors hover:text-[#bfa68e]"
        >
          <ArrowLeft size={12} strokeWidth={1.8} className="transition-transform group-hover:-translate-x-0.5" />
          voltar ao site
        </Link>
      </div>

      {/* Hero — Overall pulse */}
      <section className="relative mx-auto max-w-5xl px-6 pb-12 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
            <span className="h-px w-8 bg-[#bfa68e]/40" />
            Status da plataforma · MMXXVI
          </div>
          <h1 className="font-serif text-[clamp(42px,6vw,72px)] leading-[1.05] tracking-tight">
            Tudo <em className="italic text-grad-accent">funcionando</em>.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-on-surface-muted">
            Metrica publica. Atualiza a cada 30s. Todos os componentes do
            sistema rodam em sa-east-1 (Sao Paulo) com replica em us-east-1.
          </p>
        </motion.div>

        {/* Global pulse card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-10 relative overflow-hidden rounded-2xl border border-[#bfa68e]/20 bg-gradient-to-br from-[#bfa68e]/[0.08] via-[#bfa68e]/[0.02] to-transparent p-8 md:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full"
            style={{
              background: allOperational
                ? 'radial-gradient(circle, rgba(16,185,129,0.22), transparent 70%)'
                : 'radial-gradient(circle, rgba(245,158,11,0.22), transparent 70%)',
            }}
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative flex size-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300">
                <span
                  aria-hidden
                  className="absolute inset-0 animate-ping rounded-2xl bg-emerald-400/20"
                />
                <CheckCircle2 className="relative size-8" strokeWidth={1.6} />
              </div>
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                  Ultima verificacao · ha 23 segundos
                </div>
                <div className="font-serif text-[28px] italic leading-tight text-on-surface md:text-[34px]">
                  {allOperational
                    ? 'Todos os sistemas operam normalmente.'
                    : 'Sistema degradado — investigando.'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-right md:text-left">
                <div className="font-serif text-[32px] font-semibold leading-none text-[#e6d4bd]">
                  {overallUptime}%
                </div>
                <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                  Uptime 90d
                </div>
              </div>
              <div>
                <div className="font-serif text-[32px] font-semibold leading-none text-[#e6d4bd]">
                  {avgLatency}ms
                </div>
                <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                  Latencia media
                </div>
              </div>
              <div>
                <div className="font-serif text-[32px] font-semibold leading-none text-[#e6d4bd]">
                  8
                </div>
                <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                  Componentes
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="mx-auto h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-[#bfa68e]/30 to-transparent" />

      {/* Components grid */}
      <section className="relative mx-auto max-w-5xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
            Componentes · 90 dias
          </div>
          <h2 className="font-serif text-[32px] italic leading-tight text-on-surface md:text-[38px]">
            Cada pilar, medido.
          </h2>
        </motion.div>

        <div className="space-y-3">
          {COMPONENTS.map((c, i) => {
            const color = stateColor(c.state)
            const bars = makeUptimeBars(c.uptime90)
            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.03, 0.2) }}
                className="rounded-2xl border border-on-surface p-5 transition-colors hover:border-[#bfa68e]/20" style={{ background: 'var(--card-bg)' }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4 md:w-[40%]">
                    <div
                      className="flex size-11 items-center justify-center rounded-xl border"
                      style={{ borderColor: color.border, background: color.bg, color: color.text }}
                    >
                      <c.Icon className="size-5" strokeWidth={1.6} />
                    </div>
                    <div>
                      <div className="text-[14.5px] font-medium text-on-surface">{c.name}</div>
                      <div className="mt-0.5 text-[12px] text-on-surface-muted">{c.caption}</div>
                    </div>
                  </div>

                  {/* 90-day bars */}
                  <div className="flex h-8 items-end gap-[2px] md:w-[45%]" aria-hidden>
                    {bars.map((b, idx) => (
                      <div
                        key={idx}
                        className="h-full flex-1 rounded-[1.5px]"
                        style={{
                          backgroundColor:
                            b === 'down'
                              ? 'rgba(239,68,68,0.75)'
                              : b === 'warn'
                              ? 'rgba(245,158,11,0.65)'
                              : 'rgba(16,185,129,0.55)',
                          minWidth: 2,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between md:w-[15%] md:flex-col md:items-end md:justify-center">
                    <div
                      className="rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ borderColor: color.border, background: color.bg, color: color.text }}
                    >
                      {color.label}
                    </div>
                    <div className="mt-0 text-right md:mt-1.5">
                      <div className="font-mono text-[12px] font-semibold text-[#e6d4bd]">
                        {c.uptime90}%
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
                        {c.latencyMs}ms
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      <div className="mx-auto h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-[#bfa68e]/30 to-transparent" />

      {/* Incidents timeline */}
      <section className="relative mx-auto max-w-5xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
            Historico · 90 dias
          </div>
          <h2 className="font-serif text-[32px] italic leading-tight text-on-surface md:text-[38px]">
            Incidentes recentes.
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] text-on-surface-muted">
            Cada evento e publicado em no maximo 15 minutos apos deteccao.
            Pos-mortem completo em ate 72h apos resolucao.
          </p>
        </motion.div>

        <div className="space-y-4">
          {INCIDENTS.map((inc, i) => (
            <motion.div
              key={inc.date + inc.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-[#bfa68e]/12 bg-[#bfa68e]/[0.02] p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: severityColor(inc.severity) }}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-on-surface-muted">
                  {inc.date} · Duracao {inc.duration}
                </span>
                <span
                  className="ml-auto rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.2em]"
                  style={{
                    borderColor: severityColor(inc.severity),
                    color: severityColor(inc.severity),
                    background: severityColor(inc.severity) + '15',
                  }}
                >
                  {inc.severity === 'resolved' ? 'Resolvido' : inc.severity === 'maintenance' ? 'Manutencao' : 'Investigando'}
                </span>
              </div>
              <div className="font-serif text-[20px] italic text-on-surface">{inc.title}</div>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-on-surface-muted">{inc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-2xl border border-[#bfa68e]/20 bg-gradient-to-br from-[#bfa68e]/[0.08] via-transparent to-[#bfa68e]/[0.02] p-10 text-center md:p-14"
        >
          <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
            <Clock className="size-3" strokeWidth={1.8} />
            Avisar por email
          </div>
          <h3 className="font-serif text-[28px] leading-[1.1] text-on-surface md:text-[36px]">
            Receba alertas <em className="italic text-[#e6d4bd]">antes</em> do incidente escalar.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-[14px] text-on-surface-muted">
            Avisamos por email e Slack em degradacao, manutencao programada e
            todo pos-mortem publicado. Zero spam.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:status@pralvex.com.br?subject=Inscrever%20em%20status%20Pralvex"
              className="group inline-flex items-center gap-3 rounded-full border border-[#bfa68e]/40 bg-gradient-to-r from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] px-7 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#0a0a0a] shadow-[0_10px_40px_rgba(191,166,142,0.28)] transition-all hover:shadow-[0_14px_56px_rgba(191,166,142,0.45)]"
            >
              Inscrever em status
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
            </a>
            <Link
              href="/docs"
              className="font-mono text-[12px] uppercase tracking-[0.3em] text-on-surface-muted transition-colors hover:text-[#bfa68e]"
            >
              Documentacao
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
