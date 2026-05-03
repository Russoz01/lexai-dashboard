'use client'

/* ═════════════════════════════════════════════════════════════
 * /dashboard/em-breve — placeholder universal para rotas não-implementadas
 * ─────────────────────────────────────────────────────────────
 * Lê ?feature=<slug> e resolve no CATALOG (src/lib/catalog.ts).
 * Use-o como destino dos agentes com implemented:false no catálogo.
 *
 * Exemplo de link: /dashboard/em-breve?feature=parecerista
 *
 * 2026-05-03: botao "Avisar quando lançar" agora chama POST
 * /api/notify-launch?feature=<slug> em vez de ser link fake pra
 * /dashboard. Versao "Pralvex v10.8" foi escondida (clutter).
 * ═════════════════════════════════════════════════════════════ */

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Bell, Sparkles, Clock, ArrowUpRight, Check, type LucideIcon } from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { CATALOG } from '@/lib/catalog'

function EmBreveContent() {
  const params = useSearchParams()
  const slug = params.get('feature') || ''
  const item = CATALOG.find(c => c.slug === slug)

  const Icon: LucideIcon = item?.Icon ?? Sparkles
  const label = item?.label ?? 'Nova ferramenta'
  const desc = item?.desc ?? 'Estamos finalizando os últimos detalhes desta ferramenta.'

  const [notifyState, setNotifyState] = useState<'idle' | 'loading' | 'done' | 'err'>('idle')
  const [notifyMsg, setNotifyMsg] = useState('')

  async function notifyLaunch() {
    if (notifyState === 'loading' || notifyState === 'done') return
    setNotifyState('loading')
    try {
      const res = await fetch(`/api/notify-launch?feature=${encodeURIComponent(slug || 'desconhecido')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const code = data?.code as string | undefined
        if (code === 'rate_limit') {
          setNotifyMsg('Você já avisou recentemente — calma aí.')
        } else if (code === 'unauthorized') {
          setNotifyMsg('Faça login pra ativar o aviso.')
        } else {
          setNotifyMsg('Não rolou. Tente em 30s.')
        }
        setNotifyState('err')
        return
      }
      setNotifyMsg('Avisaremos no e-mail cadastrado quando lançar.')
      setNotifyState('done')
    } catch {
      setNotifyMsg('Sem conexão. Tente em 30s.')
      setNotifyState('err')
    }
  }

  return (
    <div className="relative min-h-full surface-base">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-20" fill="#bfa68e" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(191,166,142,0.10),transparent)]" />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/dashboard"
            className="group mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs backdrop-blur transition-colors"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--hover)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft size={12} strokeWidth={1.75} className="transition-transform group-hover:-translate-x-0.5" />
            Voltar ao dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          // 2026-05-03 fix Leonardo: mb-8 (32px) era apertado demais em telas
          // medias — glow blur-3xl do icon (-inset-8 = 64px effective) tocava
          // visualmente a primeira linha do h1. Aumenta gap pra 56px.
          className="relative mb-14"
        >
          <div className="absolute -inset-8 rounded-full blur-3xl" style={{ background: 'var(--accent-light)' }} />
          <div
            className="relative flex size-20 items-center justify-center rounded-2xl"
            style={{
              border: '1px solid var(--stone-line)',
              background: 'var(--card-solid)',
              color: 'var(--accent)',
              boxShadow: '0 0 32px var(--glow)',
            }}
          >
            <Icon size={28} strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur"
          style={{
            border: '1px solid var(--stone-line)',
            background: 'var(--accent-light)',
          }}
        >
          <Clock size={11} strokeWidth={2} style={{ color: 'var(--accent)' }} />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
            Em breve · Construção final
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          // 2026-05-03 fix Leonardo: leading-[1.05] cortava primeira linha
          // visualmente (especialmente em italic <em>). Sobe pra 1.15.
          className="text-4xl font-light leading-[1.15] tracking-tight sm:text-5xl md:text-[3.5rem]"
          style={{ color: 'var(--text-primary)', paddingTop: '0.05em' }}
        >
          <em className="text-grad-accent italic">
            {label}
          </em>
          <span style={{ color: 'var(--text-muted)' }}> ·</span> em breve
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-lg text-sm leading-relaxed md:text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          {desc}. Estamos refinando cada detalhe para que esteja à altura do seu escritório.
          Enquanto isso, continue usando os agentes já disponíveis.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/dashboard/chat"
            className="press-scale group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#bfa68e]/40 bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-5 py-2.5 text-sm font-medium text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.28)] transition-editorial hover:shadow-[0_0_40px_rgba(191,166,142,0.5)]"
          >
            <Sparkles size={14} strokeWidth={2} />
            Usar Chat agora
            <ArrowUpRight size={14} strokeWidth={2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <button
            type="button"
            onClick={notifyLaunch}
            disabled={notifyState === 'loading' || notifyState === 'done'}
            className="press-scale inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm backdrop-blur transition-editorial hover:border-[var(--accent)] disabled:cursor-default"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--hover)',
              color: 'var(--text-primary)',
            }}
          >
            {notifyState === 'done'
              ? <Check size={13} strokeWidth={2} style={{ color: 'var(--success)' }} />
              : <Bell size={13} strokeWidth={1.75} />}
            {notifyState === 'loading'
              ? 'Avisando...'
              : notifyState === 'done'
                ? 'Aviso ativo'
                : 'Avisar quando lançar'}
          </button>
        </motion.div>

        <AnimatePresence>
          {notifyMsg && (
            <motion.div
              key="notify-msg"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              role="status"
              aria-live="polite"
              className="mt-4 text-xs"
              style={{ color: notifyState === 'err' ? 'var(--danger)' : 'var(--text-muted)' }}
            >
              {notifyMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function EmBrevePage() {
  return (
    <Suspense fallback={<div className="min-h-full surface-base" />}>
      <EmBreveContent />
    </Suspense>
  )
}
