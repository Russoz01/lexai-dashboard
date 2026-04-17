'use client'

import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/reveal'
import { Check, X, Minus } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
 * LexComparison — matriz lado-a-lado vs concorrentes.
 * Derivada da pesquisa competitiva (AdvHub, Lexter, Turivius,
 * Harvey, ChatADV). Objetivo: justificar o premium.
 * ────────────────────────────────────────────────────────────── */

type Cell = true | false | 'partial' | string

const competitors = ['LexAI', 'AdvHub', 'Lexter', 'Turivius', 'ChatADV'] as const

const rows: { feature: string; values: Cell[] }[] = [
  { feature: 'Triagem de leads por prioridade',       values: [true,  true,  false, false, false] },
  { feature: 'Resposta automática WhatsApp (Meta)',   values: [true,  true,  false, false, 'partial'] },
  { feature: 'CRM jurídico integrado',                values: [true,  false, true,  false, false] },
  { feature: 'Jurimetria (prob. êxito + tempo)',      values: [true,  false, false, true,  false] },
  { feature: 'Marketing jurídico p/ Instagram',       values: [true,  false, false, false, false] },
  { feature: 'Agentes especializados (14)',           values: ['14', '—',   '3',   '—',   '1'] },
  { feature: 'Monitoramento processual (tribunais)',  values: [true,  'partial', true, true, false] },
  { feature: 'Compliance OAB (Provimento 205)',       values: [true,  false, 'partial', false, false] },
  { feature: 'Cálculo de prazos + correção',          values: [true,  false, true,  false, false] },
  { feature: 'SSO + audit logs (enterprise)',         values: [true,  false, false, 'partial', false] },
  { feature: 'Infra no Brasil (LGPD nativa)',         values: [true,  true,  true,  true,  'partial'] },
  { feature: 'Preço mensal por advogado',             values: ['R$ 1.399', 'R$ 697', 'R$ 199', 'R$ 890', 'R$ 149'] },
]

function CellRender({ value, isLex }: { value: Cell; isLex: boolean }) {
  if (value === true)
    return (
      <Check
        className={cn('mx-auto size-4', isLex ? 'text-[#bfa68e]' : 'text-emerald-500/70')}
      />
    )
  if (value === false) return <X className="mx-auto size-4 text-white/25" />
  if (value === 'partial')
    return <Minus className="mx-auto size-4 text-amber-400/60" />
  return (
    <span
      className={cn(
        'font-mono text-xs tabular-nums',
        isLex ? 'text-[#e4cfa9]' : 'text-white/55',
      )}
    >
      {value}
    </span>
  )
}

export function LexComparison() {
  return (
    <section
      id="comparativo"
      className="relative mx-auto w-full bg-black py-20"
    >
      <div className="mx-auto max-w-5xl px-4">
        <Reveal as="div" className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            Comparativo
          </div>
          <h2 className="text-balance text-4xl font-medium text-white">
            Tudo que as outras fazem.{' '}
            <span className="italic text-white/60">E o que nenhuma faz.</span>
          </h2>
          <p className="mt-3 text-white/60">
            Um único contrato substitui a soma de AdvHub + Lexter + Turivius.
            Sem pular de abas, sem dados espalhados em cinco ferramentas.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-950">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 text-left font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/45">
                    Recurso
                  </th>
                  {competitors.map((name, i) => (
                    <th
                      key={name}
                      className={cn(
                        'px-3 py-4 text-center text-xs font-medium tracking-tight',
                        i === 0
                          ? 'bg-[#bfa68e]/[0.04] text-[#e4cfa9]'
                          : 'text-white/55',
                      )}
                    >
                      {name}
                      {i === 0 && (
                        <div className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#bfa68e]/60">
                          incluído
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      'border-b border-white/[0.06] transition-colors hover:bg-white/[0.015]',
                      r === rows.length - 1 && 'border-b-0 bg-white/[0.02]',
                    )}
                  >
                    <td className="px-4 py-3 text-left text-sm text-white/75">
                      {row.feature}
                    </td>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className={cn(
                          'px-3 py-3 text-center',
                          i === 0 && 'bg-[#bfa68e]/[0.04]',
                        )}
                      >
                        <CellRender value={v} isLex={i === 0} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal
          as="p"
          delay={0.3}
          className="mt-6 text-center text-xs text-white/40"
        >
          Preços de concorrentes coletados nos sites oficiais em 04/2026.
          Comparativo feito por advogado/mês no plano de entrada.
        </Reveal>
      </div>
    </section>
  )
}
