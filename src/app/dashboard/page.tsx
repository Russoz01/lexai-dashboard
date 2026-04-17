'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'
import Link from 'next/link'
import {
  ArrowRight, BarChart3, CalendarCheck, Circle, Clock, Lock,
  type LucideIcon,
} from 'lucide-react'
import { UsagePanel } from '@/components/UsagePanel'
import { ReferralPanel } from '@/components/ReferralPanel'
import { usePlan } from '@/hooks/usePlan'
import { CATALOG, agents, isUnlocked, type CatalogItem, type Plan } from '@/lib/catalog'
import s from './page.module.css'

/* ═════════════════════════════════════════════════════════════
 * Dashboard — Gabinete LexAI (wired ao catalog em 2026-04-17)
 * ─────────────────────────────────────────────────────────────
 * Grid de agentes vem de agents() do catalog.
 * Locked → /dashboard/planos | !implemented → /dashboard/em-breve.
 * Editorial atelier: N° serial, Playfair italic, stone hairlines.
 * ═════════════════════════════════════════════════════════════ */

interface Stats {
  documentos: number
  prazosUrgentes: number
  saldo: number
  totalInteracoesSemana: number
  prazosList: { titulo: string; data_limite: string; status: string }[]
}

interface AgentCount {
  agente: string
  count: number
}

interface RecentItem {
  id: string
  agente: string
  mensagem_usuario: string
  created_at: string
}

/* Lookup O(1) por slug para resolver agente → CatalogItem */
const BY_SLUG = new Map(CATALOG.map(item => [item.slug, item]))

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

function pad2(n: number) { return n.toString().padStart(2, '0') }

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `${min} min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function resolveHref(item: CatalogItem, userPlan: Plan): string {
  if (!isUnlocked(item, userPlan)) return '/dashboard/planos'
  if (!item.implemented) return `/dashboard/em-breve?feature=${item.slug}`
  return item.href
}

export default function DashboardPage() {
  const supabase = createClient()
  const { plano } = usePlan()
  const userPlan = (plano || 'free') as Plan

  const [stats, setStats] = useState<Stats>({
    documentos: 0, prazosUrgentes: 0, saldo: 0, totalInteracoesSemana: 0, prazosList: [],
  })
  const [agentCounts, setAgentCounts] = useState<AgentCount[]>([])
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const usuarioId = await resolveUsuarioId()
      if (!usuarioId) { setDataLoading(false); return }

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

      const [docs, prazos, financeiro, historicoSemana, historicoRecente] = await Promise.all([
        supabase.from('documentos').select('id', { count: 'exact' }).eq('usuario_id', usuarioId),
        supabase.from('prazos').select('titulo,data_limite,status').eq('usuario_id', usuarioId).order('data_limite'),
        supabase.from('financeiro').select('valor,tipo').eq('usuario_id', usuarioId),
        supabase.from('historico')
          .select('agente')
          .eq('usuario_id', usuarioId)
          .gte('created_at', sevenDaysAgo),
        supabase.from('historico')
          .select('id,agente,mensagem_usuario,created_at')
          .eq('usuario_id', usuarioId)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const hoje = new Date()
      const urgentes = (prazos.data ?? []).filter(p => {
        const diff = (new Date(p.data_limite + 'T00:00:00').getTime() - hoje.getTime()) / 86400000
        return diff >= 0 && diff <= 7 && p.status === 'pendente'
      })

      const saldo = (financeiro.data ?? []).reduce((acc, f) =>
        f.tipo === 'receita' ? acc + Number(f.valor) : acc - Number(f.valor), 0)

      const counter = new Map<string, number>()
      for (const row of historicoSemana.data ?? []) {
        const key = (row.agente || '').toLowerCase().trim()
        if (!key) continue
        counter.set(key, (counter.get(key) ?? 0) + 1)
      }
      const agentArr: AgentCount[] = Array.from(counter.entries())
        .map(([agente, count]) => ({ agente, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      setStats({
        documentos: docs.count ?? 0,
        prazosUrgentes: urgentes.length,
        saldo,
        totalInteracoesSemana: (historicoSemana.data ?? []).length,
        prazosList: (prazos.data ?? []).slice(0, 3),
      })
      setAgentCounts(agentArr)
      setRecent((historicoRecente.data ?? []) as RecentItem[])
      setDataLoading(false)
    }
    load()
  }, [supabase])

  function diasRestantes(data: string) {
    const diff = Math.ceil((new Date(data + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    return diff
  }
  function barClass(dias: number) {
    if (dias <= 7)  return 'critical'
    if (dias <= 30) return 'warning'
    return 'normal'
  }
  function fmt(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const [greeting, setGreeting] = useState('Olá')
  const [todayCapitalized, setTodayCapitalized] = useState('')
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    setGreeting(hour < 5 ? 'Boa noite' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite')
    const todayStr = now.toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    setTodayCapitalized(todayStr.charAt(0).toUpperCase() + todayStr.slice(1))
  }, [])

  const maxAgentCount = useMemo(
    () => agentCounts.reduce((m, a) => Math.max(m, a.count), 0) || 1,
    [agentCounts],
  )

  const agentList = useMemo(() => agents(), [])
  const totalAgents = agentList.length

  return (
    <div className={`page-content ${s.dashAtelier}`}>

      <header className={s.dashHeader}>
        <div className={s.dashSerial}>
          <span className={s.dashSerialDot} />
          <span>N° 001 · GABINETE · MMXXVI</span>
        </div>
        <h1 className={s.dashAtelierH1}>
          {greeting}, <em>advogado</em>.
        </h1>
        <p className={s.dashHeaderSub}>{todayCapitalized}</p>
        <div className={s.dashHairline} aria-hidden />
      </header>

      <section className={s.dashProvas} aria-label="Indicadores do gabinete">
        <ProvaCell
          roman="I"
          value={stats.totalInteracoesSemana}
          label="Interações"
          caption="Últimos 7 dias"
          href="/dashboard/historico"
        />
        <ProvaCell
          roman="II"
          value={stats.documentos}
          label="Documentos"
          caption="Analisados pela IA"
          href="/dashboard/resumidor"
        />
        <ProvaCell
          roman="III"
          value={stats.prazosUrgentes}
          label="Prazos"
          caption="Próximos 7 dias"
          warning={stats.prazosUrgentes > 0}
          href="/dashboard/prazos"
        />
        <ProvaCell
          roman="IV"
          moneyValue={fmt(stats.saldo)}
          label="Saldo"
          caption={stats.saldo >= 0 ? 'Positivo' : 'Negativo'}
          warning={stats.saldo < 0}
          href="/dashboard/financeiro"
        />
      </section>

      <section className={s.dashPanelsRow} aria-label="Consumo e indicação">
        <UsagePanel />
        <ReferralPanel />
      </section>

      <section className={s.dashGridUsage} aria-label="Uso dos agentes e atividade recente">

        <article className={s.dashCard}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPÍTULO I · ATELIER</div>
              <h2 className={s.dashCardTitle}>Uso dos <em>agentes</em></h2>
              <p className={s.dashCardSub}>
                {dataLoading
                  ? 'Contando interações dos últimos 7 dias...'
                  : stats.totalInteracoesSemana === 0
                    ? 'Nenhuma interação registrada esta semana'
                    : `${stats.totalInteracoesSemana} interação${stats.totalInteracoesSemana === 1 ? '' : 'ões'} nos últimos 7 dias`}
              </p>
            </div>
            <Link href="/dashboard/historico" className={s.dashCardAction}>
              Ver tudo <ArrowRight size={12} strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <div className={s.dashBars}>
            {dataLoading ? (
              <div>
                <div className={s.dashSkel} />
                <div className={s.dashSkel} />
                <div className={s.dashSkel} />
              </div>
            ) : agentCounts.length === 0 ? (
              <div className={s.dashEmptyState}>
                <BarChart3 size={22} strokeWidth={1.5} aria-hidden />
                <div className={s.dashEmptyTitle}>Nenhum uso nesta semana</div>
                <div className={s.dashEmptySub}>Comece pelo chat ou por um dos agentes ao lado. Seu uso aparecerá aqui.</div>
                <Link href="/dashboard/chat" className={s.dashEmptyCta}>
                  Abrir chat <ArrowRight size={12} strokeWidth={2} aria-hidden />
                </Link>
              </div>
            ) : (
              agentCounts.map((a, i) => {
                const meta = BY_SLUG.get(a.agente)
                const label = meta?.label ?? a.agente
                const href = meta ? resolveHref(meta, userPlan) : '#'
                const pct = (a.count / maxAgentCount) * 100
                return (
                  <Link key={a.agente} href={href} className={s.dashBarRow}>
                    <span className={s.dashBarNum}>{pad2(i + 1)}</span>
                    <span className={s.dashBarLabel}>{label}</span>
                    <div className={s.dashBarTrack}>
                      <div className={s.dashBarFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={s.dashBarCount}>{a.count}</span>
                  </Link>
                )
              })
            )}
          </div>
        </article>

        <article className={s.dashCard}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPÍTULO II · DIÁRIO</div>
              <h2 className={s.dashCardTitle}>Atividade <em>recente</em></h2>
              <p className={s.dashCardSub}>
                {dataLoading
                  ? 'Carregando...'
                  : recent.length === 0
                    ? 'Sem registros ainda'
                    : 'Últimas cinco interações'}
              </p>
            </div>
            <Link href="/dashboard/historico" className={s.dashCardAction}>
              Histórico <ArrowRight size={12} strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <div className={s.dashActivity}>
            {dataLoading ? (
              <>
                <div className={s.dashSkelRow} />
                <div className={s.dashSkelRow} />
                <div className={s.dashSkelRow} />
              </>
            ) : recent.length === 0 ? (
              <div className={s.dashEmptyState}>
                <Clock size={22} strokeWidth={1.5} aria-hidden />
                <div className={s.dashEmptyTitle}>Nenhuma atividade ainda</div>
                <div className={s.dashEmptySub}>Cada interação com um agente fica registrada aqui.</div>
              </div>
            ) : (
              recent.map((r, i) => {
                const meta = BY_SLUG.get(r.agente.toLowerCase())
                const label = meta?.label ?? r.agente
                const href = meta ? resolveHref(meta, userPlan) : '/dashboard/historico'
                const Icon: LucideIcon = meta?.Icon ?? Circle
                const snippet = (r.mensagem_usuario || '').slice(0, 64)
                return (
                  <Link key={r.id} href={href} className={s.dashActivityRow}>
                    <span className={s.dashActivityNum}>{ROMAN[i] ?? (i+1)}</span>
                    <div className={s.dashActivityIcon}>
                      <Icon size={15} strokeWidth={1.75} aria-hidden />
                    </div>
                    <div className={s.dashActivityInfo}>
                      <div className={s.dashActivityName}>{label}</div>
                      <div className={s.dashActivitySnippet}>{snippet || '—'}</div>
                    </div>
                    <span className={s.dashActivityTime}>{relativeTime(r.created_at)}</span>
                  </Link>
                )
              })
            )}
          </div>
        </article>

      </section>

      <section className={s.dashGridMain}>

        <article className={s.dashCard}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPÍTULO III · ATELIER</div>
              <h2 className={s.dashCardTitle}>Vinte e dois <em>agentes</em></h2>
              <p className={s.dashCardSub}>Clique para abrir o atelier do especialista</p>
            </div>
            <Link href="/dashboard/chat" className={s.dashCardAction}>
              Chat <ArrowRight size={12} strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <div className={s.dashAgentsGrid}>
            {agentList.map((ag, i) => {
              const Icon = ag.Icon
              const locked = !isUnlocked(ag, userPlan)
              const href = resolveHref(ag, userPlan)
              return (
                <Link
                  key={ag.slug}
                  href={href}
                  className={s.dashAgent}
                  title={locked ? `Disponível no plano ${ag.minPlan}` : ag.desc}
                  aria-disabled={locked || undefined}
                >
                  <span className={s.dashAgentNum}>{pad2(i + 1)}</span>
                  <div className={s.dashAgentIcon}>
                    <Icon size={16} strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className={s.dashAgentInfo}>
                    <div className={s.dashAgentName}>{ag.label}</div>
                    <div className={s.dashAgentDesc}>{ag.desc}</div>
                  </div>
                  {locked
                    ? <Lock size={14} strokeWidth={2} className={s.dashAgentArrow} aria-hidden />
                    : <ArrowRight size={14} strokeWidth={1.75} className={s.dashAgentArrow} aria-hidden />}
                </Link>
              )
            })}
          </div>
        </article>

        <div className={s.dashSideCol}>

          <article className={s.dashCard}>
            <div className={s.dashCardHead}>
              <div>
                <div className={s.dashCardCap}>CAPÍTULO IV · AGENDA</div>
                <h2 className={s.dashCardTitle}>Prazos <em>próximos</em></h2>
                <p className={s.dashCardSub}>Monitoramento ativo</p>
              </div>
              <Link href="/dashboard/prazos" className={s.dashCardAction}>
                Ver todos <ArrowRight size={12} strokeWidth={2} aria-hidden />
              </Link>
            </div>
            <div className={s.dashPrazos}>
              {stats.prazosList.length === 0 ? (
                <div className={`${s.dashEmptyState} ${s.compact}`}>
                  <CalendarCheck size={20} strokeWidth={1.5} aria-hidden />
                  <div className={s.dashEmptyTitle}>Nenhum prazo</div>
                  <div className={s.dashEmptySub}>Cadastre seus prazos processuais para receber alertas.</div>
                </div>
              ) : (
                stats.prazosList.map((p, i) => {
                  const dias = diasRestantes(p.data_limite)
                  const cls = barClass(dias)
                  return (
                    <div key={p.titulo + i} className={`${s.dashPrazoRow} ${s[cls]}`}>
                      <span className={s.dashPrazoBar} />
                      <div className={s.dashPrazoInfo}>
                        <div className={s.dashPrazoTitle}>{p.titulo}</div>
                        <div className={s.dashPrazoMeta}>
                          {new Date(p.data_limite + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className={s.dashPrazoDays}>
                        {dias < 0 ? 'Vencido' : dias === 0 ? 'Hoje' : `${dias}d`}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </article>

          <article className={s.dashCard}>
            <div className={s.dashCardHead}>
              <div>
                <div className={s.dashCardCap}>CAPÍTULO V · LIVRO-CAIXA</div>
                <h2 className={s.dashCardTitle}>Saldo <em>atual</em></h2>
                <p className={s.dashCardSub} suppressHydrationWarning>{typeof window === 'undefined' ? '' : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className={s.dashFinance}>
              <div className={s.dashFinanceValue} style={{ color: stats.saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {fmt(stats.saldo)}
              </div>
              <Link href="/dashboard/financeiro" className={s.dashFinanceCta}>
                Ver detalhes <ArrowRight size={12} strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </article>

        </div>
      </section>

    </div>
  )
}

function ProvaCell({
  roman, value, moneyValue, label, caption, href, warning,
}: {
  roman: string
  value?: number
  moneyValue?: string
  label: string
  caption: string
  href: string
  warning?: boolean
}) {
  return (
    <Link href={href} className={s.provaCell}>
      <span className={s.provaRoman}>{roman}</span>
      {moneyValue !== undefined ? (
        <div className={s.provaValueMoney}>{moneyValue}</div>
      ) : (
        <div className={s.provaValue}>{value ?? 0}</div>
      )}
      <div className={s.provaLabel}>{label}</div>
      <div className={warning ? s.provaCaptionWarn : s.provaCaption}>{caption}</div>
    </Link>
  )
}
