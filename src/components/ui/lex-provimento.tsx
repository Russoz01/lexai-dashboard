'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight, FileSearch, Lock, ScanLine } from 'lucide-react'
import { AmbientMesh } from '@/components/ui/ambient-mesh'

/* ════════════════════════════════════════════════════════════════════
 * LexProvimento (v9 · 2026-04-19)
 * ────────────────────────────────────────────────────────────────────
 * Bloco "compliance-first" — endereca a duvida #1 de socio-gestor BR:
 * "isso aqui me poe em risco com OAB?"
 *
 * Big number "205" pulsa em champagne. Card glass com 3 chips do que
 * a camada de validacao bloqueia. Footnote citando CNJ Resolucao
 * 615/2025 (precedente de supervisao humana).
 *
 * Brain context: vault tem nota
 *   00-inbox/LEGAL-2026-04-19-cnj-615-2025-ia-judiciario-iajus-2026
 * que confirma que CNJ 615 nao vincula advogados privados mas cria
 * precedente de mercado. Aqui usamos como argumento de venda.
 * ═══════════════════════════════════════════════════════════════════ */

export function LexProvimento() {
  return (
    <section
      className="relative isolate overflow-hidden py-28"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient mesh leve pra dar respiração visual */}
      <AmbientMesh intensity={0.55} dust dustCount={8} />
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_50%,rgba(191,166,142,0.07)_0%,transparent_70%)]"
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[1fr_1.05fr]">
        {/* ═══ Left: Big number + claim ═══ */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em]"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--hover)',
              color: 'var(--text-secondary)',
            }}
          >
            <Lock className="size-3" strokeWidth={2} style={{ color: 'var(--accent)' }} />
            OAB · Provimento 205/2021
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="leading-[0.85]"
          >
            <span
              className="lex-digit-pulse bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] bg-clip-text font-serif text-[8rem] font-bold tracking-[-0.05em] text-transparent md:text-[12rem]"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              205
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-2 text-balance font-serif text-2xl md:text-[2rem]"
            style={{ color: 'var(--text-primary)' }}
          >
            O único Provimento que sua publicidade precisa atender
            <span className="italic text-grad-accent"> em 2026</span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-5 max-w-md text-[15px] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            A OAB ainda não publicou sucessor ao Provimento 205/2021. Toda saída
            de qualquer agente da Pralvex passa por validação automática — claims
            proibidos são bloqueados antes da entrega.
          </motion.p>
        </div>

        {/* ═══ Right: Glass card com checklist ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="relative overflow-hidden rounded-2xl p-7 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--card-bg)',
            }}
          >
            {/* card header */}
            <div
              className="mb-6 flex items-center justify-between pb-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex size-7 items-center justify-center rounded-md"
                  style={{ background: 'var(--accent-light)' }}
                >
                  <ScanLine className="size-3.5" strokeWidth={2} style={{ color: 'var(--accent)' }} />
                </div>
                <span
                  className="font-mono text-[0.65rem] uppercase tracking-[0.18em]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Camada de validação · ativa
                </span>
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-emerald-400/80">
                <span className="size-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                Online
              </span>
            </div>

            {/* checklist */}
            <ul className="space-y-3.5">
              {[
                {
                  block: 'Garantia de resultado',
                  why: '"Vamos vencer a causa" — bloqueado',
                },
                {
                  block: 'Mercantilização do serviço',
                  why: '"De R$ 5.000 por R$ 2.500" — bloqueado',
                },
                {
                  block: 'Captação indevida de cliente',
                  why: 'Mensagem ativa não solicitada — bloqueado',
                },
                {
                  block: 'Sensacionalismo',
                  why: 'Linguagem populista, urgência fabricada — bloqueado',
                },
                {
                  block: 'Citação sem fonte rastreável',
                  why: 'STJ/STF sem ementa + link — bloqueado',
                },
              ].map((item, i) => (
                <motion.li
                  key={item.block}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="mt-[3px] flex size-4 shrink-0 items-center justify-center rounded-full"
                    style={{
                      border: '1px solid var(--stone-line)',
                      background: 'var(--accent-light)',
                    }}
                  >
                    <span className="size-1 rounded-full" style={{ background: 'var(--accent)' }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[13.5px] font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.block}
                    </div>
                    <div
                      className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {item.why}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* card footer — audit log */}
            <div
              className="mt-7 flex items-center justify-between pt-5"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <FileSearch className="size-3.5" strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
                <span
                  className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Audit log por usuário
                </span>
              </div>
              <Link
                href="/empresas#compliance"
                className="group inline-flex items-center gap-1 text-[12px] font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                Ver protocolo
                <ArrowUpRight
                  className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>

          {/* footnote CNJ */}
          <p
            className="mt-4 text-center text-[11px] lg:text-left"
            style={{ color: 'var(--text-muted)' }}
          >
            Referência cruzada: CNJ Resolução 615/2025 (vigente desde 14/jul/2025)
            estabelece padrões de supervisão humana para uso de IA no judiciário.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
