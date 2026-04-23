'use client'

/* ═════════════════════════════════════════════════════════════
 * /dashboard/em-breve — placeholder universal para rotas não-implementadas
 * ─────────────────────────────────────────────────────────────
 * [NOTA PARA PRÓXIMA SESSÃO — 2026-04-17]
 * Lê ?feature=<slug> e resolve no CATALOG (src/lib/catalog.ts).
 * Use-o como destino dos agentes com implemented:false no catálogo.
 *
 * Exemplo de link: /dashboard/em-breve?feature=parecerista
 *
 * Quando o Sidebar/dashboard.tsx forem re-wirados ao catalog,
 * todos os itens com implemented:false devem apontar para cá.
 * ═════════════════════════════════════════════════════════════ */

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Sparkles, Clock, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { CATALOG } from '@/lib/catalog'

function EmBreveContent() {
  const params = useSearchParams()
  const slug = params.get('feature') || ''
  const item = CATALOG.find(c => c.slug === slug)

  const Icon: LucideIcon = item?.Icon ?? Sparkles
  const label = item?.label ?? 'Nova ferramenta'
  const desc = item?.desc ?? 'Estamos finalizando os últimos detalhes desta ferramenta.'

  return (
    <div className="relative min-h-full bg-black text-white antialiased">
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
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 backdrop-blur transition-colors hover:border-[#bfa68e]/40 hover:text-white"
          >
            <ArrowLeft size={12} strokeWidth={1.75} className="transition-transform group-hover:-translate-x-0.5" />
            Voltar ao dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          <div className="absolute -inset-8 rounded-full bg-[#bfa68e]/10 blur-3xl" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-[#bfa68e]/30 bg-gradient-to-br from-[#1a1410] via-[#0a0807] to-[#050403] text-[#bfa68e] shadow-[0_0_32px_rgba(191,166,142,0.25)]">
            <Icon size={28} strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/30 bg-gradient-to-r from-[#bfa68e]/[0.08] to-[#bfa68e]/[0.02] px-3 py-1.5 backdrop-blur"
        >
          <Clock size={11} strokeWidth={2} className="text-[#bfa68e]" />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#bfa68e]">
            Em breve · Construção final
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-light leading-[1.05] tracking-tight text-white sm:text-5xl md:text-[3.5rem]"
        >
          <em className="bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent">
            {label}
          </em>
          <span className="text-white/40"> ·</span> em breve
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/55 md:text-base"
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
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#bfa68e]/40 bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-5 py-2.5 text-sm font-medium text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.28)] transition-all hover:shadow-[0_0_40px_rgba(191,166,142,0.5)]"
          >
            <Sparkles size={14} strokeWidth={2} />
            Usar Chat agora
            <ArrowUpRight size={14} strokeWidth={2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm text-white/80 backdrop-blur transition-all hover:border-[#bfa68e]/40 hover:text-white"
          >
            <Bell size={13} strokeWidth={1.75} />
            Avisar quando lançar
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/30"
        >
          Pralvex v10.8 · roadmap ativo
        </motion.div>
      </div>
    </div>
  )
}

export default function EmBrevePage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-black" />}>
      <EmBreveContent />
    </Suspense>
  )
}
