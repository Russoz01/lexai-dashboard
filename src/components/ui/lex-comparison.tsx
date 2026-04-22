'use client'

import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/reveal'
import { Check, X, Minus, Crown, Shield, Cpu, Banknote, Scale, type LucideIcon } from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
 * LexComparison — matriz expandida v10.8 (2026-04-22)
 * ────────────────────────────────────────────────────────────────
 * Compara LexAI contra:
 *   - Generalistas: ChatGPT, Gemini, Copilot
 *   - Jurídicos BR: Astrea, Projuris, Lexter, AdvHub
 *
 * 16 categorias agrupadas em 5 blocos: Precisão jurídica, Compliance
 * brasileira, Operação do escritório, Infra & dados, Comercial.
 * Preços coletados nos sites oficiais em 04/2026.
 * ═══════════════════════════════════════════════════════════════ */

type Cell = true | false | 'partial' | string

type Rival = {
  name: string
  kind: 'generalista' | 'juridico-br' | 'lex'
}

const RIVALS: Rival[] = [
  { name: 'LexAI',    kind: 'lex' },
  { name: 'ChatGPT',  kind: 'generalista' },
  { name: 'Gemini',   kind: 'generalista' },
  { name: 'Copilot',  kind: 'generalista' },
  { name: 'Astrea',   kind: 'juridico-br' },
  { name: 'Projuris', kind: 'juridico-br' },
  { name: 'Lexter',   kind: 'juridico-br' },
  { name: 'AdvHub',   kind: 'juridico-br' },
]

type Group = {
  label: string
  Icon: LucideIcon
  rows: { feature: string; values: Cell[] }[]
}

const GROUPS: Group[] = [
  {
    label: 'Precisão jurídica',
    Icon: Scale,
    rows: [
      // ordem: LexAI, ChatGPT, Gemini, Copilot, Astrea, Projuris, Lexter, AdvHub
      { feature: 'Jurisprudência STF/STJ rastreável',  values: [true,    'partial', 'partial', false,    true,     'partial', 'partial', false]    },
      { feature: 'Recusa quando não sabe (anti-hallucination)', values: [true, false,    false,    false,    'partial', 'partial', false,    false]   },
      { feature: 'Citação com link verificado',         values: [true,    false,    false,    false,    'partial', false,    'partial', false]   },
      { feature: 'Provimento 205 / OAB compliance',     values: [true,    false,    false,    false,    'partial', 'partial', 'partial', false]   },
    ],
  },
  {
    label: 'Compliance brasileira',
    Icon: Shield,
    rows: [
      { feature: 'Cálculo prazo + feriado municipal',   values: [true,    false,    false,    false,    true,     true,     'partial', false]   },
      { feature: 'INPC/IGPM/IPCA fonte oficial',        values: [true,    false,    false,    false,    'partial', 'partial', false,    false]   },
      { feature: 'LGPD nativa · servidor em SP',        values: [true,    false,    false,    false,    true,     true,     true,     true]    },
      { feature: 'Audit log por usuário (DPA assinado)',values: [true,    false,    false,    false,    'partial', true,     false,    false]   },
    ],
  },
  {
    label: 'Operação do escritório',
    Icon: Cpu,
    rows: [
      { feature: 'Agentes especializados',              values: ['22',   '—',      '—',      '—',      '—',      '4',      '3',      '—']     },
      { feature: 'CRM jurídico integrado',              values: [true,    false,    false,    false,    true,     true,     true,     false]   },
      { feature: 'Jurimetria (probabilidade + tempo)',  values: [true,    false,    false,    false,    true,     'partial', false,   false]   },
      { feature: 'Marketing OAB-compliant',             values: [true,    false,    false,    false,    false,    false,    false,    false]   },
    ],
  },
  {
    label: 'Infra & dados',
    Icon: Crown,
    rows: [
      { feature: 'Zero retenção · não treina no seu caso', values: [true,  false,    false,    false,    'partial', true,     'partial', 'partial'] },
      { feature: 'Modelo customizado por escritório',   values: [true,    false,    false,    false,    false,    'partial', false,    false]   },
      { feature: 'Integração PJe / e-Saj',              values: [true,    false,    false,    false,    true,     true,     'partial', 'partial']   },
    ],
  },
  {
    label: 'Comercial',
    Icon: Banknote,
    rows: [
      { feature: 'Preço por advogado/mês (entrada)',    values: ['R$ 1.399', 'R$ 100', 'R$ 110', 'R$ 150', 'R$ 549', 'R$ 890', 'R$ 199', 'R$ 697'] },
    ],
  },
]

function CellRender({ value, isLex }: { value: Cell; isLex: boolean }) {
  if (value === true)
    return (
      <Check
        className={cn('mx-auto size-4', isLex ? 'text-[#bfa68e]' : 'text-emerald-500/70')}
        strokeWidth={2.2}
      />
    )
  if (value === false) return <X className="mx-auto size-4 text-white/22" strokeWidth={1.6} />
  if (value === 'partial')
    return <Minus className="mx-auto size-4 text-amber-400/70" strokeWidth={2.2} />
  return (
    <span
      className={cn(
        'whitespace-nowrap font-mono text-[11px] tabular-nums',
        isLex ? 'font-semibold text-[#e4cfa9]' : 'text-white/55',
      )}
    >
      {value}
    </span>
  )
}

export function LexComparison() {
  const totalRivals = RIVALS.length
  const totalRows = GROUPS.reduce((acc, g) => acc + g.rows.length, 0)

  return (
    <section
      id="comparativo"
      className="relative mx-auto w-full overflow-hidden bg-black py-24"
    >
      {/* faint radial behind table */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(191,166,142,0.08),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal as="div" className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/20 bg-[#bfa68e]/[0.04] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#bfa68e]/85">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            LexAI vs 7 alternativas
          </div>
          <h2 className="text-balance text-4xl font-medium leading-tight text-white md:text-[3rem]">
            Por que generalistas{' '}
            <span className="font-serif italic text-[#e6d4bd]">falham em peça.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.7] text-white/60">
            Comparamos {totalRows} pontos críticos contra {totalRivals - 1}{' '}
            alternativas — 3 generalistas (ChatGPT, Gemini, Copilot) e 4
            plataformas jurídicas BR (Astrea, Projuris, Lexter, AdvHub).
            Os pontos onde só a LexAI marca verde são exatamente onde escritórios perdem dinheiro.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0a0a0a]">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="sticky left-0 z-10 bg-[#0a0a0a] px-4 py-5 text-left font-mono text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/45">
                    Critério
                  </th>
                  {RIVALS.map((r, i) => {
                    const isLex = r.kind === 'lex'
                    return (
                      <th
                        key={r.name}
                        className={cn(
                          'px-2 py-5 text-center text-xs font-medium tracking-tight align-bottom',
                          isLex
                            ? 'bg-[#bfa68e]/[0.06] text-[#e4cfa9]'
                            : 'text-white/55',
                        )}
                        style={{ minWidth: 90 }}
                      >
                        <div className={cn(
                          'mb-1 font-mono text-[0.55rem] uppercase tracking-[0.18em]',
                          isLex ? 'text-[#bfa68e]/80' : 'text-white/30',
                        )}>
                          {r.kind === 'lex' ? '★ você' : r.kind === 'generalista' ? 'generalista' : 'jurídico BR'}
                        </div>
                        <div className={cn(
                          'font-medium',
                          isLex ? 'font-serif italic text-[15px]' : 'text-[13px]',
                        )}>
                          {r.name}
                        </div>
                        {i === 0 && (
                          <div className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#bfa68e]/60">
                            incluído
                          </div>
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((group, gi) => (
                  <Group
                    key={group.label}
                    group={group}
                    isLast={gi === GROUPS.length - 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal as="div" delay={0.3} className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { kicker: '11 categorias', title: 'só a LexAI', body: 'marca verde — recusa quando não sabe, link verificado, modelo customizado por escritório.' },
            { kicker: 'R$ 1.399',     title: 'sem stack', body: 'substitui ChatGPT (R$ 100) + Astrea (R$ 549) + AdvHub (R$ 697) + Lexter (R$ 199) num único contrato.' },
            { kicker: 'Servidor SP',  title: 'LGPD nativa', body: 'zero retenção, DPA assinado, audit log por usuário. Generalistas treinam modelo público com seu caso.' },
          ].map(c => (
            <div key={c.title} className="rounded-xl border border-[#bfa68e]/12 bg-[#0a0a0a]/60 p-5">
              <div className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-[#bfa68e]/80">
                {c.kicker}
              </div>
              <div className="font-serif text-lg italic text-white">{c.title}</div>
              <p className="mt-2 text-[13px] leading-[1.55] text-white/55">{c.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal
          as="p"
          delay={0.4}
          className="mt-8 text-center font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/35"
        >
          Preços coletados nos sites oficiais · 04/2026 · plano de entrada por advogado/mês
        </Reveal>
      </div>
    </section>
  )
}

function Group({ group, isLast }: { group: Group; isLast: boolean }) {
  const Icon = group.Icon
  return (
    <>
      <tr className="border-b border-white/[0.06]">
        <td
          colSpan={RIVALS.length + 1}
          className="bg-gradient-to-r from-[#bfa68e]/[0.05] to-transparent px-4 py-3"
        >
          <div className="flex items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#bfa68e]/80">
            <Icon className="size-3.5 text-[#bfa68e]" strokeWidth={1.6} />
            {group.label}
          </div>
        </td>
      </tr>
      {group.rows.map((row, ri) => (
        <tr
          key={row.feature}
          className={cn(
            'border-b border-white/[0.04] transition-colors hover:bg-white/[0.018]',
            isLast && ri === group.rows.length - 1 && 'border-b-0 bg-white/[0.02]',
          )}
        >
          <td className="sticky left-0 z-10 bg-[#0a0a0a] px-4 py-3 text-left text-[13.5px] text-white/78">
            {row.feature}
          </td>
          {row.values.map((v, i) => (
            <td
              key={i}
              className={cn(
                'px-2 py-3 text-center',
                i === 0 && 'bg-[#bfa68e]/[0.05]',
              )}
            >
              <CellRender value={v} isLex={i === 0} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
