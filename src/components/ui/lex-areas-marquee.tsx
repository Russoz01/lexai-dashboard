'use client'

import { Marquee } from '@/components/ui/marquee'

/* LexAreasMarquee — strip com areas do Direito cobertas.
 * Substitui logos de customers (que nao temos publicamente). */

const areas = [
  'Civil',
  'Trabalhista',
  'Tributario',
  'Penal',
  'Empresarial',
  'Familia',
  'Previdenciario',
  'Consumidor',
  'Constitucional',
  'Administrativo',
  'Ambiental',
  'Imobiliario',
  'Bancario',
]

export function LexAreasMarquee() {
  return (
    <section className="relative border-y border-white/5 bg-black py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
          9 areas do Direito cobertas pelos agentes
        </div>
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <Marquee>
            {areas.map((a) => (
              <div
                key={a}
                className="flex items-center gap-2 whitespace-nowrap text-lg font-medium tracking-tight text-white/35 transition-colors hover:text-white/80"
              >
                <span className="size-1 rounded-full bg-[#bfa68e]/50" />
                {a}
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}
