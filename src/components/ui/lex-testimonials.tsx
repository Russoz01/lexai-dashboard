'use client'

import { Quote } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const testimonials = [
  {
    initials: 'RL',
    name: 'Renata Lima',
    cargo: 'Socia · Lima Advocacia',
    quote:
      'Substituiu dois estagiarios e ainda entrega mais rapido. O investimento se pagou no primeiro mes de uso.',
    stat: { v: '2x', k: 'produtividade' },
  },
  {
    initials: 'MC',
    name: 'Mariana Castro',
    cargo: 'Advogada Civil · SP',
    quote:
      'Em duas semanas economizei mais de vinte horas de pesquisa. O Pesquisador encontra acordaos que eu nem sabia que existiam.',
    stat: { v: '20h', k: 'economizadas / 2 sem.' },
  },
  {
    initials: 'FG',
    name: 'Fernando Gomes',
    cargo: 'Tributarista · BH',
    quote:
      'O Calculador e o Compliance viraram essenciais. Nunca mais errei um prazo e a analise LGPD vem completa.',
    stat: { v: '0', k: 'prazos perdidos' },
  },
]

export function LexTestimonials() {
  return (
    <section className="relative bg-black py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal as="div" className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/55">
            Em producao desde 2024
          </div>
          <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
            Escritorios que ja{' '}
            <span className="italic text-white/50">fazem mais</span>.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={0.1 + i * 0.1}>
              <figure className="relative flex h-full flex-col rounded-xl border border-white/10 bg-neutral-950 p-6 transition-colors hover:border-white/20">
                <Quote className="mb-4 size-5 text-[#bfa68e]/60" strokeWidth={1.75} />
                <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-white/75">
                  {t.quote}
                </blockquote>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <figcaption className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] font-mono text-xs text-[#e4cfa9]">
                      {t.initials}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white">{t.name}</div>
                      <div className="text-xs text-white/45">{t.cargo}</div>
                    </div>
                  </figcaption>
                  <div className="text-right">
                    <div className="font-mono text-lg font-medium tabular-nums text-[#e4cfa9]">
                      {t.stat.v}
                    </div>
                    <div className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-white/40">
                      {t.stat.k}
                    </div>
                  </div>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
