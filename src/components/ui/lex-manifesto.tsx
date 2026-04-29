'use client'

import { motion } from 'framer-motion'
import { Quote, Compass, Scale, MapPin } from 'lucide-react'
import { AmbientMesh } from '@/components/ui/ambient-mesh'

/* ════════════════════════════════════════════════════════════════════
 * LexManifesto (v9 · 2026-04-19)
 * ────────────────────────────────────────────────────────────────────
 * O "anti-positioning" da landing — em vez de listar features, declara
 * principio: generalistas inventam, modelos juridicos recusam.
 *
 * Editorial tipografia: serif italica grande (Playfair Display loaded
 * em layout.tsx via --font-playfair). Quote oversized + tres pilares
 * curtos abaixo, com hairline animado entre eles.
 *
 * Diferente de tudo no resto do site (que usa DM Sans). Esta secao
 * funciona como pausa visual — o "dieresis" entre o hero (denso) e
 * o bento (denso). Densidade 40% menor proposital.
 * ═══════════════════════════════════════════════════════════════════ */

export function LexManifesto() {
  return (
    <section className="relative isolate overflow-hidden bg-[#080606] py-32">
      {/* Ambient mesh sutil — adiciona movimento orgânico atrás da tipografia */}
      <AmbientMesh intensity={0.45} />

      {/* Decorative orbit ring */}
      <div
        aria-hidden
        className="lex-orbit pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#bfa68e]/[0.06]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]"
      />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex items-center justify-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.32em] text-white/40"
        >
          <span className="h-px w-10 bg-white/15" />
          <span>Manifesto</span>
          <span className="h-px w-10 bg-white/15" />
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Quote
            className="mx-auto mb-6 size-7 text-[#bfa68e]/60"
            strokeWidth={1.4}
          />
          <h2 className="font-serif text-3xl leading-[1.15] text-white md:text-5xl lg:text-[3.4rem]">
            Generalistas inventam acórdão.
            <br />
            <span className="italic text-[#e6d4bd]">
              Modelos jurídicos recusam quando não sabem.
            </span>
          </h2>
          <p className="mx-auto mt-10 max-w-2xl text-balance text-[15px] leading-[1.7] text-white/65">
            ChatGPT cita STJ que não existe porque foi treinado pra parecer útil.
            A Pralvex passa por uma camada de validação que bloqueia citação sem
            fonte rastreável <span className="text-white/85">antes</span> da peça
            chegar na sua mesa.
          </p>
        </motion.div>

        {/* Hairline divider */}
        <div className="my-20">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto h-px w-full max-w-2xl origin-left bg-gradient-to-r from-transparent via-[#bfa68e]/40 to-transparent"
          />
        </div>

        {/* 3 pillars — editorial column */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {[
            {
              Icon: Compass,
              eyebrow: 'Precisão',
              title: 'Cada citação rastreável',
              body: 'Toda jurisprudência retorna com tribunal, ementa, ministro relator, data e link. Sem ementas inventadas, sem artigos fantasma.',
            },
            {
              Icon: Scale,
              eyebrow: 'Conformidade',
              title: 'Provimento 205 validado',
              body: 'Camada automática bloqueia claims proibidos pela OAB — garantia de resultado, mercantilização, promessa de êxito. Audit log por usuário.',
            },
            {
              Icon: MapPin,
              eyebrow: 'Brasilidade',
              title: 'Treinado em Brasil',
              body: 'CF/88, CLT, CDC, CPC, CC. Calendários estaduais, feriados municipais. INPC, IGPM e IPCA da fonte oficial. Servidor em São Paulo.',
            },
          ].map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.55,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-center"
            >
              <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full border border-[#bfa68e]/20 bg-[#bfa68e]/[0.04]">
                <p.Icon className="size-5 text-[#e6d4bd]" strokeWidth={1.5} />
              </div>
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[#bfa68e]/80">
                {p.eyebrow}
              </div>
              <h3 className="mt-3 font-serif text-xl text-white md:text-[1.4rem]">
                {p.title}
              </h3>
              <p className="mx-auto mt-3 max-w-[260px] text-[13.5px] leading-[1.65] text-white/55">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
