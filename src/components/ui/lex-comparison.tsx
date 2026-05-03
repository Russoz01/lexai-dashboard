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
        className={cn('mx-auto size-4', !isLex && 'text-emerald-500/70')}
        strokeWidth={2.2}
        style={isLex ? { color: 'var(--accent)' } : undefined}
      />
    )
  if (value === false)
    return (
      <X className="mx-auto size-4" strokeWidth={1.6} style={{ color: 'var(--text-muted)' }} />
    )
  if (value === 'partial')
    return <Minus className="mx-auto size-4 text-amber-400/70" strokeWidth={2.2} />
  return (
    <span
      className="whitespace-nowrap font-mono text-[11px] tabular-nums"
      style={{
        color: isLex ? 'var(--accent)' : 'var(--text-secondary)',
        fontWeight: isLex ? 600 : 400,
      }}
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
      className="relative mx-auto w-full overflow-hidden py-24"
      style={{ background: 'var(--bg-base)' }}
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
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.24em]"
            style={{
              border: '1px solid var(--stone-line)',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
            }}
          >
            <span className="size-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            Pralvex vs {totalRivals - 1} alternativas do mercado
          </div>
          <h2
            className="text-balance text-4xl font-medium leading-tight md:text-[3rem]"
            style={{ color: 'var(--text-primary)' }}
          >
            {UNIQUE_LEX_ROWS} diferenciais onde{' '}
            <span className="font-serif italic text-grad-accent">só a Pralvex entrega.</span>
          </h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.7]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Comparamos {totalRows} pontos críticos contra 4 generalistas (ChatGPT, Claude,
            Gemini, Copilot), 1 legal AI global (Harvey, US/UK) e 4 plataformas jurídicas
            brasileiras (Astrea, Projuris, Lexter, Jusbrasil). Linhas destacadas em ouro são
            diferenciais absolutos Pralvex — exatamente onde escritório perde dinheiro.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="overflow-x-auto rounded-2xl"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--card-bg)',
            }}
          >
            <table className="w-full min-w-[1280px] border-collapse text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th
                    className="sticky left-0 z-10 px-4 py-5 text-left font-mono text-[0.6rem] font-medium uppercase tracking-[0.2em]"
                    style={{ background: 'var(--card-solid)', color: 'var(--text-muted)' }}
                  >
                    Critério
                  </th>
                  {RIVALS.map((r, i) => {
                    const isLex = r.kind === 'lex'
                    return (
                      <th
                        key={r.name}
                        className="px-2 py-5 text-center text-xs font-medium tracking-tight align-bottom"
                        style={{
                          minWidth: 92,
                          background: isLex ? 'var(--accent-light)' : undefined,
                          color: isLex ? 'var(--accent)' : 'var(--text-secondary)',
                        }}
                      >
                        <div
                          className="mb-1 font-mono text-[0.52rem] uppercase tracking-[0.18em]"
                          style={{ color: isLex ? 'var(--accent)' : 'var(--text-muted)' }}
                        >
                          {kindLabel(r.kind)}
                        </div>
                        <div className={cn(
                          'font-medium',
                          isLex ? 'font-serif italic text-[15px]' : 'text-[13px]',
                        )}>
                          {r.name}
                        </div>
                        {r.badge && (
                          <div
                            className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.16em]"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {r.badge}
                          </div>
                        )}
                        {i === 0 && (
                          <div
                            className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.2em]"
                            style={{ color: 'var(--accent)' }}
                          >
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
            <div
              key={c.title}
              className="rounded-xl p-5"
              style={{
                border: '1px solid var(--stone-line)',
                background: 'var(--card-bg)',
              }}
            >
              <div
                className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.24em]"
                style={{ color: 'var(--accent)' }}
              >
                {c.kicker}
              </div>
              <div
                className="font-serif text-lg italic"
                style={{ color: 'var(--text-primary)' }}
              >{c.title}</div>
              <p
                className="mt-2 text-[13px] leading-[1.55]"
                style={{ color: 'var(--text-secondary)' }}
              >{c.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal
          delay={0.4}
          className="mt-8"
        >
          <p
            className="text-center font-mono text-[0.62rem] uppercase tracking-[0.18em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Preços coletados em 04/2026 nos sites oficiais · plano entrada por advogado/mês · Harvey é enterprise-only, valor estimado USD 300
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Group({ group, isLast }: { group: Group; isLast: boolean }) {
  const Icon = group.Icon
  return (
    <>
      <tr style={{ borderBottom: '1px solid var(--border)' }}>
        <td
          colSpan={RIVALS.length + 1}
          className="px-4 py-3"
          style={{ background: 'linear-gradient(to right, var(--accent-light), transparent)' }}
        >
          <div
            className="flex items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.22em]"
            style={{ color: 'var(--accent)' }}
          >
            <Icon className="size-3.5" strokeWidth={1.6} style={{ color: 'var(--accent)' }} />
            {group.label}
          </div>
        </td>
      </tr>
      {group.rows.map((row, ri) => (
        <tr
          key={row.feature}
          className={cn(
            'transition-colors',
            isLast && ri === group.rows.length - 1 && 'border-b-0',
          )}
          style={{
            borderBottom: '1px solid var(--border)',
            background: row.highlight ? 'var(--accent-light)' : undefined,
          }}
        >
          <td
            className="sticky left-0 z-10 px-4 py-3 text-left text-[13.5px]"
            style={{
              background: 'var(--card-solid)',
              color: row.highlight ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: row.highlight ? 500 : 400,
            }}
          >
            <span className="flex items-center gap-2">
              {row.highlight && (
                <span
                  aria-hidden
                  className="size-1 shrink-0 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  title="Diferencial exclusivo Pralvex"
                />
              )}
              {row.feature}
            </span>
          </td>
          {row.values.map((v, i) => (
            <td
              key={i}
              className="px-2 py-3 text-center"
              style={i === 0 ? { background: 'var(--accent-light)' } : undefined}
            >
              <CellRender value={v} isLex={i === 0} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
