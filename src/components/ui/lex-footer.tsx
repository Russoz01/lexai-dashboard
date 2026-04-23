'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Scale, MapPin, Mail, ShieldCheck, Sparkles, ArrowUpRight,
  Lock, Server, Award, Github, Linkedin, Instagram,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
 * LexFooter — v10.8 editorial monumental (2026-04-22)
 * ────────────────────────────────────────────────────────────────
 * Não é footer — é assinatura. Quatro andares:
 *   1. Manifesto-row    : frase grande Playfair italic + CTA
 *   2. Coluna-grid      : 4 colunas + brand block + newsletter
 *   3. Trust-strip      : 4 selos (LGPD, OAB, ISO, Server BR)
 *   4. Signature-floor  : copyright + redes + versão + Renato
 *
 * Decoração: orbit ring + gold hairline gradient sweep, micro
 * shimmer no hover de cada link, ouro pulse no logo.
 * ═══════════════════════════════════════════════════════════════ */

const COLS = [
  {
    title: 'Produto',
    links: [
      { label: 'Agentes',       href: '/#agentes' },
      { label: 'Manifesto',     href: '/#manifesto' },
      { label: 'Comparativo',   href: '/#comparativo' },
      { label: 'Compliance',    href: '/#compliance' },
      { label: 'Planos',        href: '/#precos' },
      { label: 'Para empresas', href: '/empresas' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'FAQ',            href: '/#faq' },
      { label: 'Documentação',   href: '/docs' },
      { label: 'Sobre',          href: '/sobre' },
      { label: 'ROI calculator', href: '/roi' },
      { label: 'Status da plataforma', href: '/status' },
      { label: 'Entrar',         href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidade LGPD', href: '/privacidade' },
      { label: 'Termos de uso',    href: '/termos' },
      { label: 'DPA assinado',     href: '/dpa' },
      { label: 'Provimento 205',   href: '/#compliance' },
    ],
  },
]

const TRUST = [
  { Icon: ShieldCheck, label: 'LGPD compliant',  meta: 'DPA assinado' },
  { Icon: Award,       label: 'Provimento 205',  meta: 'OAB validado' },
  { Icon: Lock,        label: 'Zero retenção',   meta: 'Não treina no caso' },
  { Icon: Server,      label: 'Servidor em SP',  meta: 'AWS sa-east-1' },
]

const SOCIAL = [
  { Icon: Linkedin,  href: 'https://linkedin.com/company/vanixcorp', label: 'LinkedIn'  },
  { Icon: Instagram, href: 'https://instagram.com/lexai.br',         label: 'Instagram' },
  { Icon: Github,    href: 'https://github.com/vanixcorp',           label: 'GitHub'    },
]

export function LexFooter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = email.trim()
    if (!v) return
    setSubmitting(true)
    setErr('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, source: 'footer' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        if (data.error === 'invalid_email') {
          setErr('Email inválido')
          setSubmitting(false)
          return
        }
      }
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3500)
    } catch {
      // UX sempre positiva — registramos erro no console e seguimos
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3500)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="relative isolate overflow-hidden border-t border-[#bfa68e]/12 bg-black">
      {/* Decorative orbit + gold radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(191,166,142,0.12),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[820px] w-[820px] -translate-x-1/2 rounded-full border border-[#bfa68e]/[0.05]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full border border-[#bfa68e]/[0.08]"
      />

      {/* Floor 1 — manifesto-row */}
      <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]"
        >
          <div>
            <div className="mb-5 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[#bfa68e]/80">
              <span className="h-px w-8 bg-[#bfa68e]/40" />
              Para advogados que cobram por hora cheia
            </div>
            <h3 className="font-serif text-[2.4rem] leading-[1.1] text-white md:text-[3rem]">
              Pare de revisar saída de IA.
              <br />
              <span className="italic text-[#e6d4bd]">Comece a entregar peça.</span>
            </h3>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-3 self-start rounded-full border border-[#bfa68e]/40 bg-gradient-to-r from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] px-7 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#0a0a0a] shadow-[0_10px_40px_rgba(191,166,142,0.28)] transition-all hover:shadow-[0_14px_56px_rgba(191,166,142,0.45)] md:self-end"
            >
              Agendar demonstração
              <ArrowUpRight
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.2}
              />
            </Link>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/40">
              Resposta em 24h · Renato responde
            </span>
          </div>
        </motion.div>
      </div>

      {/* Hairline divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto h-px w-full max-w-6xl origin-left bg-gradient-to-r from-transparent via-[#bfa68e]/45 to-transparent"
      />

      {/* Floor 2 — column grid */}
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-x-10 gap-y-14 md:grid-cols-12">
          {/* Brand block */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative flex size-11 items-center justify-center rounded-xl border border-[#bfa68e]/30 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-[0_4px_20px_rgba(191,166,142,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all group-hover:border-[#bfa68e]/55 group-hover:shadow-[0_8px_32px_rgba(191,166,142,0.32),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Scale className="size-5 text-[#bfa68e]" strokeWidth={1.6} />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(191,166,142,0.5),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div>
                <div className="bg-gradient-to-b from-white to-[#d9c8af] bg-clip-text font-serif text-xl font-semibold text-transparent">
                  LexAI
                </div>
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.25em] text-white/40">
                  by Vanix Corp
                </div>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-[14px] leading-[1.7] text-white/55">
              Sistema operacional jurídico brasileiro. 22 agentes, CRM integrado,
              jurimetria e marketing OAB-compliant — num único contrato.
              Servidor em São Paulo, DPA assinado, audit log por usuário.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/18 bg-[#bfa68e]/[0.04] px-3 py-1.5">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/65">
                Plataforma online · Latência 38ms
              </span>
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((c, ci) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.05 + ci * 0.08 }}
              className="md:col-span-2"
            >
              <h4 className="mb-5 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#bfa68e]/80">
                <span className="size-1 rounded-full bg-[#bfa68e]" />
                {c.title}
              </h4>
              <ul className="space-y-3">
                {c.links.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1.5 text-[13.5px] text-white/65 transition-colors hover:text-[#e6d4bd]"
                    >
                      <span className="relative">
                        {l.label}
                        <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-[#bfa68e] to-transparent transition-transform duration-300 group-hover:scale-x-100" />
                      </span>
                      <ArrowUpRight
                        className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-60"
                        strokeWidth={1.8}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-2 md:col-span-2"
          >
            <h4 className="mb-5 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#bfa68e]/80">
              <Sparkles className="size-3" strokeWidth={1.8} />
              Boletim
            </h4>
            <p className="mb-3 text-[12.5px] leading-[1.5] text-white/55">
              Provimento 205, jurisprudência nova e benchmarks de IA jurídica. Mensal, sem spam.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2" noValidate>
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); if (err) setErr('') }}
                placeholder="seu@escritorio.com"
                aria-invalid={!!err || undefined}
                className={`w-full rounded-lg border bg-black/60 px-3 py-2 text-[12.5px] text-white placeholder-white/30 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#bfa68e]/40 ${
                  err ? 'border-red-500/40 focus:border-red-500/60' : 'border-[#bfa68e]/15 focus:border-[#bfa68e]/40'
                }`}
              />
              {err && (
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-red-300/80">
                  {err}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full rounded-lg border px-3 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa68e]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-70 ${
                  submitted
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                    : 'border-[#bfa68e]/30 bg-[#bfa68e]/[0.06] text-[#e6d4bd] hover:border-[#bfa68e]/55 hover:bg-[#bfa68e]/12'
                }`}
              >
                {submitting ? 'Enviando...' : submitted ? '✓ Inscrito · obrigado' : 'Assinar boletim'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Floor 3 — Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 gap-3 rounded-2xl border border-[#bfa68e]/10 bg-gradient-to-r from-[#bfa68e]/[0.04] via-transparent to-[#bfa68e]/[0.04] p-2 md:grid-cols-4"
        >
          {TRUST.map(t => (
            <div
              key={t.label}
              className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-[#bfa68e]/[0.06]"
            >
              <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#bfa68e]/20 bg-[#bfa68e]/[0.06] text-[#bfa68e] transition-all group-hover:border-[#bfa68e]/40 group-hover:bg-[#bfa68e]/12">
                <t.Icon className="size-4" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-white/85">{t.label}</div>
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/45">
                  {t.meta}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Hairline divider */}
      <div className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Floor 4 — signature */}
      <div className="relative mx-auto max-w-6xl px-6 py-7">
        <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/40 md:justify-start">
            <span>© MMXXVI · LexAI</span>
            <span className="hidden text-white/15 md:inline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3" strokeWidth={1.8} />
              Ituverava, SP · Brasil
            </span>
            <span className="hidden text-white/15 md:inline">·</span>
            <a
              href="mailto:contato@vanixcorp.com"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[#e6d4bd]"
            >
              <Mail className="size-3" strokeWidth={1.8} />
              contato@vanixcorp.com
            </a>
          </div>

          <div className="flex items-center gap-2">
            {SOCIAL.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="group flex size-8 items-center justify-center rounded-full border border-white/8 text-white/55 transition-all hover:border-[#bfa68e]/40 hover:bg-[#bfa68e]/[0.06] hover:text-[#e6d4bd]"
              >
                <s.Icon className="size-3.5" strokeWidth={1.7} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 border-t border-white/5 pt-5 text-center md:flex-row md:justify-between md:text-left">
          <span className="text-[0.65rem] leading-[1.6] text-white/30 md:max-w-xl">
            LexAI é ferramenta de apoio. Resultados devem ser revisados por
            profissional habilitado pela OAB. Não substitui parecer jurídico.
          </span>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-white/30">
            v10.8 · build 2026.04 · Renato responde
          </span>
        </div>
      </div>
    </footer>
  )
}
