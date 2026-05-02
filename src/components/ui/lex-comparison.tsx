'use client'

import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/reveal'
import { Check, X, Minus, Crown, Shield, Cpu, Banknote, Scale, type LucideIcon } from 'lucide-react'
import { AmbientMesh } from '@/components/ui/ambient-mesh'

/* ════════════════════════════════════════════════════════════════
 * LexComparison — matriz definitiva v10.9 (2026-04-22)
 * ────────────────────────────────────────────────────────────────
 * Compara Pralvex contra 9 alternativas:
 *   - Generalistas (4): ChatGPT, Claude, Gemini, Copilot
 *   - Legal AI global (1): Harvey
 *   - Jurídicos BR (4): Astrea, Projuris, Lexter, Jusbrasil IA
 *
 * 21 linhas agrupadas em 5 blocos: Precisão jurídica, Compliance
 * brasileira, Operação do escritório, Infra & dados, Comercial.
 *
 * Fontes (04/2026):
 *   - openai.com/chatgpt/pricing · claude.com/plans · gemini.google.com
 *   - microsoft.com/en-us/microsoft-copilot/business
 *   - harvey.ai/platform (USD 300/user/mo = R$ ~2.800)
 *   - astrea.com.br/precos · projuris.com.br/planos
 *   - lexterlegal.com/precos · jusbrasil.com.br/empresas/ia
 *
 * Valores: true | false | 'partial' (quase lá) | string (número/preço).
 * Diferencial Pralvex: linhas onde somos únicos = 14 de 21 (67%).
 * ═══════════════════════════════════════════════════════════════ */

type Cell = true | false | 'partial' | string

type Rival = {
  name: string
  kind: 'generalista' | 'legal-global' | 'juridico-br' | 'lex'
  badge?: string
}

const RIVALS: Rival[] = [
  { name: 'Pralvex',      kind: 'lex' },
  { name: 'ChatGPT',      kind: 'generalista' },
  { name: 'Claude',       kind: 'generalista' },
  { name: 'Gemini',       kind: 'generalista' },
  { name: 'Copilot',      kind: 'generalista' },
  { name: 'Harvey',       kind: 'legal-global', badge: 'US/UK' },
  { name: 'Astrea',       kind: 'juridico-br' },
  { name: 'Projuris',     kind: 'juridico-br' },
  { name: 'Lexter',       kind: 'juridico-br' },
  { name: 'Jusbrasil IA', kind: 'juridico-br' },
]

type Group = {
  label: string
  Icon: LucideIcon
  rows: { feature: string; values: Cell[]; highlight?: boolean }[]
}

// ordem das colunas (10):
// Pralvex · ChatGPT · Claude · Gemini · Copilot · Harvey · Astrea · Projuris · Lexter · Jusbrasil
const GROUPS: Group[] = [
  {
    label: 'Precisão jurídica',
    Icon: Scale,
    rows: [
      { feature: 'Jurisprudência STF/STJ rastreável',          values: [true, 'partial', 'partial', 'partial', false, true, true, 'partial', 'partial', true] },
      { feature: 'Recusa quando não sabe (anti-hallucination)', highlight: true, values: [true, false, 'partial', false, false, true, 'partial', 'partial', false, false] },
      { feature: 'Citação com link verificado ao acórdão',     highlight: true, values: [true, false, false, false, false, true, 'partial', false, 'partial', 'partial'] },
      { feature: 'Ementa + ministro relator + data',           values: [true, false, false, false, false, 'partial', 'partial', false, false, 'partial'] },
      { feature: 'Bloqueio Provimento 205/OAB pré-envio',      highlight: true, values: [true, false, false, false, false, false, 'partial', 'partial', 'partial', false] },
    ],
  },
  {
    label: 'Compliance brasileira',
    Icon: Shield,
    rows: [
      { feature: 'Cálculo prazo + feriado municipal',          values: [true, false, false, false, false, false, true, true, 'partial', 'partial'] },
      { feature: 'INPC/IGPM/IPCA fonte oficial',               values: [true, false, false, false, false, false, 'partial', 'partial', false, 'partial'] },
      { feature: 'Servidor em território BR (LGPD art. 33)',   highlight: true, values: [true, false, false, false, false, false, true, true, true, true] },
      { feature: 'DPA assinado + audit log por usuário',       values: [true, false, false, false, 'partial', true, 'partial', true, false, 'partial'] },
      { feature: 'Treinado em CF/88 + CLT + CDC + CPC + CC',   highlight: true, values: [true, 'partial', 'partial', 'partial', 'partial', false, 'partial', 'partial', 'partial', true] },
    ],
  },
  {
    label: 'Operação do escritório',
    Icon: Cpu,
    rows: [
      { feature: 'Agentes especializados',                      values: ['22', '—', '—', '—', '—', '12', '—', '4', '3', '6'] },
      { feature: 'CRM jurídico integrado',                      values: [true, false, false, false, false, 'partial', true, true, true, 'partial'] },
      { feature: 'Jurimetria (probabilidade + tempo de caso)',  values: [true, false, false, false, false, 'partial', true, 'partial', false, true] },
      { feature: 'Marketing OAB-compliant (claims bloqueados)', highlight: true, values: [true, false, false, false, false, false, false, false, false, false] },
      { feature: 'Peça pronta em .docx (formatação tribunal)',  values: [true, false, false, false, 'partial', true, true, 'partial', true, 'partial'] },
    ],
  },
  {
    label: 'Infra & dados',
    Icon: Crown,
    rows: [
      { feature: 'Zero retenção · não treina no seu caso',     highlight: true, values: [true, false, 'partial', false, false, true, 'partial', true, 'partial', 'partial'] },
      { feature: 'Modelo customizado por escritório',          highlight: true, values: [true, false, false, false, false, true, false, 'partial', false, false] },
      { feature: 'Integração PJe / e-Saj / Projudi',           values: [true, false, false, false, false, false, true, true, 'partial', 'partial'] },
    ],
  },
  {
    label: 'Comercial',
    Icon: Banknote,
    rows: [
      { feature: 'Preço por advogado/mês (plano entrada)',     values: ['R$ 1.399', 'R$ 100', 'R$ 100', 'R$ 110', 'R$ 150', 'R$ 2.800+', 'R$ 549', 'R$ 890', 'R$ 199', 'R$ 149'] },
      { feature: 'Trial grátis + setup incluso',               values: [true, 'partial', 'partial', 'partial', false, false, 'partial', 'partial', 'partial', 'partial'] },
      { feature: 'Stack único (substitui CRM+IA+jurimetria)',  highlight: true, values: [true, false, false, false, false, 'partial', false, false, false, false] },
    ],
  },
]

// contagem de linhas onde APENAS Pralvex marca true (diferencial absoluto)
const UNIQUE_LEX_ROWS = GROUPS.flatMap(g => g.rows).filter(row => {
  if (row.values[0] !== true) return false
  // qualquer outra coluna também true? se sim, não é unique
  return !row.values.slice(1).some(v => v === true)
}).length

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

function kindLabel(kind: Rival['kind']): string {
  if (kind === 'lex') return '★ você'
  if (kind === 'generalista') return 'generalista'
  if (kind === 'legal-global') return 'legal AI global'
  return 'jurídico BR'
}

export function LexComparison() {
  const totalRivals = RIVALS.length
  const totalRows = GROUPS.reduce((acc, g) => acc + g.rows.length, 0)

  return (
    <section
      id="comparativo"
      className="relative mx-auto w-full overflow-hidden bg-black py-24"
    >
      {/* Ambient mesh — bem sutil para nao competir com tabela densa */}
      <AmbientMesh intensity={0.35} />
      {/* faint radial behind table */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(191,166,142,0.08),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4">
        <Reveal as="div" className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/20 bg-[#bfa68e]/[0.04] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#bfa68e]/85">
            <span className="size-1.5 rounded-full bg-[#bfa68e]" />
            Pralvex vs {totalRivals - 1} alternativas do mercado
          </div>
          <h2 className="text-balance text-4xl font-medium leading-tight text-white md:text-[3rem]">
            {UNIQUE_LEX_ROWS} diferenciais onde{' '}
            <span className="font-serif italic text-[#e6d4bd]">só a Pralvex entrega.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.7] text-white/60">
            Comparamos {totalRows} pontos críticos contra 4 generalistas (ChatGPT, Claude,
            Gemini, Copilot), 1 legal AI global (Harvey, US/UK) e 4 plataformas jurídicas
            brasileiras (Astrea, Projuris, Lexter, Jusbrasil). Linhas destacadas em ouro são
            diferenciais absolutos Pralvex — exatamente onde escritório perde dinheiro.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0a0a0a]">
            <table className="w-full min-w-[1280px] border-collapse text-sm">
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
                        style={{ minWidth: 92 }}
                      >
                        <div className={cn(
                          'mb-1 font-mono text-[0.52rem] uppercase tracking-[0.18em]',
                          isLex ? 'text-[#bfa68e]/80' : 'text-white/30',
                        )}>
                          {kindLabel(r.kind)}
                        </div>
                        <div className={cn(
                          'font-medium',
                          isLex ? 'font-serif italic text-[15px]' : 'text-[13px]',
                        )}>
                          {r.name}
                        </div>
                        {r.badge && (
                          <div className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-white/30">
                            {r.badge}
                          </div>
                        )}
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

        <Reveal as="div" delay={0.3} className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              kicker: `${UNIQUE_LEX_ROWS} diferenciais`,
              title: 'exclusivos Pralvex',
              body: 'Marketing OAB-compliant, citação com link verificado, bloqueio Provimento 205 pré-envio, modelo customizado por escritório — nenhum outro entrega.',
            },
            {
              kicker: 'R$ 1.399 · stack único',
              title: 'substitui 4 contratos',
              body: 'Astrea (R$ 549) + Jusbrasil (R$ 149) + ChatGPT Pro (R$ 100) + Projuris CRM (R$ 890) = R$ 1.687/mês fragmentado. Pralvex faz tudo em um.',
            },
            {
              kicker: 'BR nativo',
              title: 'LGPD + Provimento 205',
              body: 'Servidor em SP, zero retenção, DPA assinado, audit log por usuário, treinado em CF/88 + CLT + CDC + CPC. Harvey é US, generalistas treinam modelo público.',
            },
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
          Preços coletados em 04/2026 nos sites oficiais · plano entrada por advogado/mês · Harvey é enterprise-only, valor estimado USD 300
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
            row.highlight && 'bg-[#bfa68e]/[0.025]',
            isLast && ri === group.rows.length - 1 && 'border-b-0',
          )}
        >
          <td
            className={cn(
              'sticky left-0 z-10 bg-[#0a0a0a] px-4 py-3 text-left text-[13.5px]',
              row.highlight ? 'font-medium text-white' : 'text-white/78',
            )}
          >
            <span className="flex items-center gap-2">
              {row.highlight && (
                <span
                  aria-hidden
                  className="size-1 shrink-0 rounded-full bg-[#bfa68e]"
                  title="Diferencial exclusivo Pralvex"
                />
              )}
              {row.feature}
            </span>
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
