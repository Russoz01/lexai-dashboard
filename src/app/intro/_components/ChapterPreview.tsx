'use client'

/* ─────────────────────────────────────────────────────────────
 * Ato II — Dashboard preview (mostra UI real do produto, 3.5s)
 * Mockup minimalista de cards flutuando + stats reais.
 * ───────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion'
import { MessageSquare, FileText, PenLine, Search, CheckCircle2, Sparkles } from 'lucide-react'

interface ChapterPreviewProps {
  reduced: boolean
}

export function ChapterPreview({ reduced }: ChapterPreviewProps) {
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]
  const dur = reduced ? 0.01 : 0.7

  // Stagger pra cards entrarem em cascata — 4 cards, 100ms cada
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: dur,
        ease,
        delay: reduced ? 0 : 0.3 + i * 0.12,
      },
    }),
  }

  return (
    <motion.section
      key="ato-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease } }}
      transition={{ duration: 0.6, ease }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      aria-label="Visualizacao do produto"
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, ease, delay: reduced ? 0 : 0.1 }}
        className="mb-8 font-mono text-[11px] uppercase tracking-[0.4em] text-[#bfa68e]/65"
      >
        Capitulo · 02
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.01 : 1, ease, delay: reduced ? 0 : 0.2 }}
        className="mb-12 max-w-3xl text-center font-serif text-[clamp(28px,4.6vw,52px)] font-semibold leading-[1.05] text-white"
      >
        Seu proximo escritorio.
        <br />
        <span className="italic text-[#bfa68e]">Agora pensa com voce.</span>
      </motion.h2>

      {/* Mockup grid — 4 cards mostram UI real */}
      <div className="relative mx-auto grid w-full max-w-[820px] grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-5">
        {/* Card 1 — Lista de agentes (col-span 5) */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={cardVariants}
          className="rounded-2xl border border-[#bfa68e]/20 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:col-span-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfa68e]/75">
              Agentes
            </span>
            <span className="text-[10px] text-white/45">33 ativos</span>
          </div>
          <ul className="space-y-2.5">
            {[
              { Icon: MessageSquare, name: 'Consultor', desc: 'Raciocinio juridico' },
              { Icon: FileText, name: 'Analista', desc: 'Leitura de documentos' },
              { Icon: PenLine, name: 'Redator', desc: 'Pecas com citacao' },
              { Icon: Search, name: 'Jurimetria', desc: 'Jurisprudencia rastreavel' },
            ].map(({ Icon, name, desc }) => (
              <li key={name} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#bfa68e]/10 text-[#bfa68e]">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-white">{name}</span>
                  <span className="block truncate text-[11px] text-white/45">{desc}</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Card 2 — Stats reais (col-span 7) */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="show"
          variants={cardVariants}
          className="rounded-2xl border border-[#bfa68e]/20 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:col-span-7"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#bfa68e]" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfa68e]/75">
              Sobre o produto
            </span>
          </div>
          {/* Stats reais — UX P1.3: nao inventar metricas. */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '33', label: 'agentes IA' },
              { value: '50min', label: 'demo gratuita' },
              { value: '7d', label: 'garantia' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-white/5 bg-black/20 p-3">
                <div className="font-serif text-[clamp(22px,3vw,32px)] font-semibold leading-none text-[#f5e8d3]">
                  {s.value}
                </div>
                <div className="mt-2 text-[10.5px] uppercase tracking-wider text-white/45">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 3 — Chat preview (col-span 12) */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="show"
          variants={cardVariants}
          className="rounded-2xl border border-[#bfa68e]/20 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:col-span-12"
        >
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-[#bfa68e]" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfa68e]/75">
              Consultor
            </span>
          </div>
          <div className="space-y-3">
            <div className="ml-auto max-w-[75%] rounded-lg rounded-tr-sm bg-white/[0.07] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/90">
              Analise o contrato anexo sob a otica do art. 422 CC.
            </div>
            <div className="max-w-[78%] rounded-lg rounded-tl-sm border border-[#bfa68e]/20 bg-[#bfa68e]/[0.06] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/85">
              Clausula 7a desequilibra a boa-fe objetiva. Proponho redacao alternativa
              alinhada ao precedente do REsp 1.854.404/RS.
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/45">
              <CheckCircle2 className="h-3 w-3 text-emerald-300" strokeWidth={1.5} />
              <span>3 fontes rastreaveis · jurisprudencia verificada</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default ChapterPreview
