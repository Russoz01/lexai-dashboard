'use client'

import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Users,
  Inbox,
  FileText,
  Calendar,
  Sparkles,
  LineChart,
  Megaphone,
  ShieldCheck,
  Wallet,
  Settings,
  type LucideIcon,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
 * DashboardPreview
 * Estetica: Linear/Cursor — dados densos, mono nos numeros,
 * paleta neutra, pontos coloridos no lugar de emojis.
 * ────────────────────────────────────────────────────────────── */

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-md border border-white/[0.08] bg-[#0b0b0c] text-[#ededed] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]',
        className,
      )}
      style={{
        aspectRatio: '16/10',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
      aria-label="Pre-visualizacao do dashboard LexAI"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-[#0a0a0b] px-2.5 py-1.5">
        <span className="size-2 rounded-full bg-white/10" />
        <span className="size-2 rounded-full bg-white/10" />
        <span className="size-2 rounded-full bg-white/10" />
        <div className="ml-3 flex h-4 flex-1 items-center rounded-sm border border-white/[0.06] bg-white/[0.02] px-2 text-[0.5rem] text-white/40">
          app.lexai.com.br / dashboard
        </div>
      </div>

      <div className="flex h-[calc(100%-28px)] w-full">
        {/* Sidebar */}
        <aside className="flex w-[19%] min-w-[128px] flex-col border-r border-white/[0.06] bg-[#08080a] p-2 text-[0.6rem]">
          <div className="mb-3 flex items-center gap-2 px-1 py-1">
            <div className="flex size-5 items-center justify-center rounded-[4px] bg-white text-[0.5rem] font-semibold text-black">
              L
            </div>
            <div className="flex flex-1 items-center justify-between">
              <span className="font-medium tracking-tight">LexAI</span>
              <span className="text-[0.5rem] text-white/30">v4.2</span>
            </div>
          </div>

          <SideLabel>Workspace</SideLabel>
          <SideItem icon={LayoutGrid} label="Overview" active />
          <SideItem icon={Inbox} label="Leads" meta="23" />
          <SideItem icon={Users} label="Clientes" />
          <SideItem icon={FileText} label="Processos" />
          <SideItem icon={Calendar} label="Prazos" />

          <SideLabel className="mt-3">Inteligencia</SideLabel>
          <SideItem icon={Sparkles} label="Agentes" meta="14" />
          <SideItem icon={LineChart} label="Jurimetria" />
          <SideItem icon={Megaphone} label="Marketing" />
          <SideItem icon={ShieldCheck} label="Compliance" />

          <SideLabel className="mt-3">Conta</SideLabel>
          <SideItem icon={Wallet} label="Faturamento" />
          <SideItem icon={Settings} label="Ajustes" />

          <div className="mt-auto rounded-sm border border-white/[0.06] bg-white/[0.015] p-2 text-[0.5rem]">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Firma</span>
              <span className="text-[0.45rem] text-white/30">5M tok/mes</span>
            </div>
            <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[62%] bg-white/60" />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-hidden bg-[#0b0b0c] p-3">
          {/* Top bar */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[0.48rem] uppercase tracking-[0.18em] text-white/35">
                Overview / Segunda, 17 abril
              </div>
              <div className="mt-0.5 text-[0.78rem] font-medium leading-tight text-white/90">
                Bom dia, Dr. Leonardo
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 rounded-sm border border-white/[0.06] bg-white/[0.015] px-1.5 py-0.5 text-[0.5rem] text-white/60">
                <span className="size-1 rounded-full bg-[#e74c3c]" />
                3 leads prioritarios
              </div>
              <div className="size-5 rounded-full bg-gradient-to-br from-white/20 to-white/5" />
            </div>
          </div>

          {/* Metrics row */}
          <div className="mb-2.5 grid grid-cols-4 gap-1.5">
            <Metric value="23"      label="Novos leads"     delta="+4" direction="up" />
            <Metric value="68%"     label="Conversao"       delta="+12%" direction="up" highlight />
            <Metric value="R$ 8.4k" label="Ticket medio"    delta="+3%" direction="up" />
            <Metric value="87%"     label="Prob. exito"     delta="caso #4912" mono />
          </div>

          {/* Pipeline + Side */}
          <div className="grid grid-cols-[1.5fr_1fr] gap-2">
            {/* Kanban */}
            <section className="rounded-sm border border-white/[0.06] bg-white/[0.01] p-2">
              <div className="mb-1.5 flex items-center justify-between">
                <div>
                  <div className="text-[0.48rem] uppercase tracking-[0.16em] text-white/35">
                    Pipeline de leads
                  </div>
                  <div className="mt-0.5 text-[0.65rem] font-medium text-white/85">
                    23 ativos · 14 sem triagem
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[0.5rem] text-white/40">
                  <span>Esta semana</span>
                  <span className="size-2.5 rounded-sm border border-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <KanbanCol title="Novo" count={8} hint="triagem automatica">
                  <LeadCard name="M. Silva"  priority="high" area="Trabalhista" />
                  <LeadCard name="J. Costa"  priority="med"  area="Previdenciario" />
                  <LeadCard name="R. Alves"  priority="low"  area="Civil" />
                </KanbanCol>
                <KanbanCol title="Triado" count={6}>
                  <LeadCard name="P. Souza"  priority="high" area="Criminal" />
                  <LeadCard name="L. Dias"   priority="med"  area="Empresarial" />
                </KanbanCol>
                <KanbanCol title="Reuniao" count={4}>
                  <LeadCard name="F. Neves"  priority="high" area="Previdenciario" />
                  <LeadCard name="C. Rocha"  priority="med"  area="Trabalhista" />
                </KanbanCol>
                <KanbanCol title="Cliente" count={5} hint="contrato ativo">
                  <LeadCard name="A. Mendes" priority="med"  area="Tributario"   paid />
                  <LeadCard name="B. Lima"   priority="med"  area="Civil"        paid />
                </KanbanCol>
              </div>
            </section>

            {/* Side column */}
            <section className="flex flex-col gap-2">
              {/* Agentes chart */}
              <div className="rounded-sm border border-white/[0.06] bg-white/[0.01] p-2">
                <div className="mb-1.5">
                  <div className="text-[0.48rem] uppercase tracking-[0.16em] text-white/35">
                    Uso · ultimos 7 dias
                  </div>
                  <div className="mt-0.5 text-[0.65rem] font-medium text-white/85">
                    163 execucoes de agentes
                  </div>
                </div>
                <AgentBar name="Redator"      count={47} pct={100} />
                <AgentBar name="Pesquisador"  count={38} pct={81} />
                <AgentBar name="Resumidor"    count={29} pct={62} />
                <AgentBar name="Estrategista" count={22} pct={47} />
                <AgentBar name="Compliance"   count={17} pct={36} />
              </div>

              {/* Jurimetria */}
              <div className="rounded-sm border border-white/[0.06] bg-white/[0.01] p-2">
                <div className="flex items-center justify-between">
                  <div className="text-[0.48rem] uppercase tracking-[0.16em] text-white/35">
                    Jurimetria
                  </div>
                  <span className="rounded-sm border border-white/[0.06] px-1 text-[0.45rem] text-white/50">
                    beta
                  </span>
                </div>
                <div className="mt-1 text-[0.55rem] text-white/55">
                  Caso #4912 · Trabalhista
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-lg font-medium tabular-nums text-white/95">
                    87%
                  </span>
                  <span className="text-[0.5rem] text-white/40">
                    prob. exito
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-[0.5rem] text-white/50">
                  <span>~14 meses</span>
                  <span className="font-mono tabular-nums">R$ 42.000</span>
                </div>
                <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-[87%] bg-white/70" />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Subcomponentes ───────────────────────────────────────── */

function SideLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'px-1 pb-1 pt-0.5 text-[0.45rem] font-medium uppercase tracking-[0.18em] text-white/30',
        className,
      )}
    >
      {children}
    </div>
  )
}

function SideItem({
  icon: Icon,
  label,
  active,
  meta,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  meta?: string
}) {
  return (
    <div
      className={cn(
        'mb-0.5 flex items-center gap-2 rounded-[3px] px-1.5 py-1 text-[0.55rem]',
        active
          ? 'bg-white/[0.06] text-white/95'
          : 'text-white/55 hover:text-white/80',
      )}
    >
      <Icon className="size-2.5 shrink-0" strokeWidth={1.5} />
      <span className="flex-1 truncate">{label}</span>
      {meta && (
        <span className="font-mono text-[0.45rem] tabular-nums text-white/40">
          {meta}
        </span>
      )}
    </div>
  )
}

function Metric({
  value,
  label,
  delta,
  direction,
  highlight,
  mono,
}: {
  value: string
  label: string
  delta?: string
  direction?: 'up' | 'down'
  highlight?: boolean
  mono?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-sm border border-white/[0.06] bg-white/[0.01] p-2',
        highlight && 'border-white/[0.12] bg-white/[0.03]',
      )}
    >
      <div className="text-[0.45rem] uppercase tracking-[0.16em] text-white/35">
        {label}
      </div>
      <div
        className={cn(
          'mt-1 font-mono text-base font-medium leading-none tabular-nums text-white/95',
          !mono && 'font-sans',
        )}
      >
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-[0.48rem]',
            direction === 'up' && 'text-emerald-400/80',
            direction === 'down' && 'text-red-400/80',
            !direction && 'text-white/40',
          )}
        >
          {direction === 'up' && <span>▲</span>}
          {direction === 'down' && <span>▼</span>}
          <span>{delta}</span>
        </div>
      )}
    </div>
  )
}

function KanbanCol({
  title,
  count,
  hint,
  children,
}: {
  title: string
  count: number
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1 text-[0.5rem]">
          <span className="font-medium text-white/75">{title}</span>
          <span className="font-mono text-[0.45rem] tabular-nums text-white/35">
            {count}
          </span>
        </div>
      </div>
      {hint && (
        <div className="px-0.5 text-[0.4rem] text-white/30">{hint}</div>
      )}
      {children}
    </div>
  )
}

const priorityDot: Record<'high' | 'med' | 'low', string> = {
  high: 'bg-[#e74c3c]',
  med: 'bg-[#e0b96f]',
  low: 'bg-white/30',
}

function LeadCard({
  name,
  priority,
  area,
  paid,
}: {
  name: string
  priority: 'high' | 'med' | 'low'
  area: string
  paid?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-sm border border-white/[0.06] bg-white/[0.02] p-1.5 text-[0.5rem]">
      <div className="flex items-center gap-1">
        <span className={cn('size-1 rounded-full', priorityDot[priority])} />
        <span className="truncate text-white/85">{name}</span>
      </div>
      <div className="flex items-center justify-between text-[0.45rem] text-white/45">
        <span>{area}</span>
        {paid && (
          <span className="font-mono tabular-nums text-emerald-400/80">R$</span>
        )}
      </div>
    </div>
  )
}

function AgentBar({
  name,
  count,
  pct,
}: {
  name: string
  count: number
  pct: number
}) {
  return (
    <div className="mb-1 flex items-center gap-2 text-[0.52rem]">
      <span className="w-[4.5rem] truncate text-white/65">{name}</span>
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-white/70"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 text-right font-mono tabular-nums text-white/45">
        {count}
      </span>
    </div>
  )
}
