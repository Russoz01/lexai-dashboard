'use client'

import { Marquee } from '@/components/ui/marquee'

/* PralvexAreasMarquee — strip com áreas do Direito cobertas pelos 27 agentes.
 * v2 (2026-04-29): paragens editoriais entre items (rombus champagne) +
 * tipografia serif italic + mask gradient pra fade nas bordas. */

const areas = [
  'Civil',
  'Trabalhista',
  'Tributário',
  'Penal',
  'Empresarial',
  'Família',
  'Previdenciário',
  'Consumidor',
  'Constitucional',
  'Administrativo',
  'Ambiental',
  'Imobiliário',
  'Bancário',
]

export function PralvexAreasMarquee() {
  return (
    <section className="relative border-y border-[#bfa68e]/[0.08] bg-black py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#bfa68e]/30" />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#bfa68e]/65">
            13 áreas do Direito brasileiro
          </span>
          <span className="h-px w-10 bg-[#bfa68e]/30" />
        </div>
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <Marquee>
            {areas.map((a) => (
              <div
                key={a}
                className="group flex items-center gap-5 whitespace-nowrap font-serif text-[1.4rem] italic tracking-tight text-white/40 transition-colors duration-500 hover:text-[#e6d4bd]"
              >
                <span>{a}</span>
                {/* Rombus champagne separador editorial */}
                <span
                  aria-hidden
                  className="size-1.5 rotate-45 border border-[#bfa68e]/40 bg-[#bfa68e]/10 transition-colors duration-500 group-hover:border-[#bfa68e]/80 group-hover:bg-[#bfa68e]/30"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}
