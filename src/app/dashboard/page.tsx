'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'
import Link from 'next/link'
import { UsagePanel } from '@/components/UsagePanel'
import { ReferralPanel } from '@/components/ReferralPanel'
import s from './page.module.css'

/* ─────────────────────────────────────────────────────────────────────────────
 * Dashboard — Gabinete LexAI
 *
 * Editorial atelier layout (N° serial, Playfair italic, stone hairlines)
 * com dados REAIS vindos da tabela historico nos ultimos 7 dias.
 * ──────────────────────────────────────────────────────────────────────────── */

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

/* Catalogo canonico dos agentes — nome de exibicao + rota + icone */
const AGENT_META: Record<string, { label: string; href: string; icon: string }> = {
  resumidor:    { label: 'Resumidor',   href: '/dashboard/resumidor',   icon: 'bi-file-earmark-text' },
  redator:      { label: 'Redator',     href: '/dashboard/redator',     icon: 'bi-pencil-square' },
  pesquisador:  { label: 'Pesquisador', href: '/dashboard/pesquisador', icon: 'bi-journal-bookmark' },
  negociador:   { label: 'Negociador',  href: '/dashboard/negociador',  icon: 'bi-lightning' },
  professor:    { label: 'Monitor Legislativo', href: '/dashboard/professor', icon: 'bi-bell' },
  calculador:   { label: 'Calculador',  href: '/dashboard/calculador',  icon: 'bi-calculator' },
  legislacao:   { label: 'Legislacao',  href: '/dashboard/legislacao',  icon: 'bi-book' },
  rotina:       { label: 'Rotina',      href: '/dashboard/rotina',      icon: 'bi-calendar-week' },
  planilhas:    { label: 'Planilhas',   href: '/dashboard/planilhas',   icon: 'bi-file-earmark-spreadsheet' },
  simulado:     { label: 'Parecerista', href: '/dashboard/simulado',    icon: 'bi-file-earmark-check' },
  consultor:    { label: 'Estrategista', href: '/dashboard/consultor',  icon: 'bi-shield-check' },
  chat:         { label: 'Chat',        href: '/dashboard/chat',        icon: 'bi-chat-square-dots' },
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

function pad2(n: number) { return n.toString().padStart(2, '0') }

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `${min} min atras`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atras`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d atras`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function DashboardPage() {
  const supabase = createClient()
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

      /* Agrega historico da semana por agente */
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

  // Time-dependent strings only on client to avoid hydration mismatch (#425)
  const [greeting, setGreeting] = useState('Ola')
  const [todayCapitalized, setTodayCapitalized] = useState('')
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    setGreeting(hour < 5 ? 'Boa noite' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite')
    const todayStr = now.toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    setTodayCapitalized(todayStr.charAt(0).toUpperCase() + todayStr.slice(1))
  }, [])

  const maxAgentCount = useMemo(
    () => agentCounts.reduce((m, a) => Math.max(m, a.count), 0) || 1,
    [agentCounts]
  )

  return (
    <div className={`page-content ${s.dashAtelier}`}>

      {/* ═════ HEADER EDITORIAL ═════ */}
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

      {/* ═════ PROVAS — 4 COLUNAS EDITORIAIS ═════ */}
      <section className={s.dashProvas} aria-label="Indicadores do gabinete">
        <ProvaCell
          roman="I"
          value={stats.totalInteracoesSemana}
          label="Interacoes"
          caption="Ultimos 7 dias"
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
          caption="Proximos 7 dias"
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

      {/* ═════ PAINEL DE CONSUMO + INDICACAO ═════ */}
      <section className={s.dashPanelsRow} aria-label="Consumo e indicacao">
        <UsagePanel />
        <ReferralPanel />
      </section>

      {/* ═════ GABINETE — USO + ATIVIDADE ═════ */}
      <section className={s.dashGridUsage} aria-label="Uso dos agentes e atividade recente">

        {/* Uso dos Agentes — DADOS REAIS */}
        <article className={s.dashCard}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPITULO I · ATELIER</div>
              <h2 className={s.dashCardTitle}>Uso dos <em>agentes</em></h2>
              <p className={s.dashCardSub}>
                {dataLoading
                  ? 'Contando interacoes dos ultimos 7 dias...'
                  : stats.totalInteracoesSemana === 0
                    ? 'Nenhuma interacao registrada esta semana'
                    : `${stats.totalInteracoesSemana} interacao${stats.totalInteracoesSemana === 1 ? '' : 'oes'} nos ultimos 7 dias`}
              </p>
            </div>
            <Link href="/dashboard/historico" className={s.dashCardAction}>
              Ver tudo <i className="bi bi-arrow-right" />
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
                <i className="bi bi-bar-chart" />
                <div className={s.dashEmptyTitle}>Nenhum uso nesta semana</div>
                <div className={s.dashEmptySub}>Comece pelo chat ou por um dos agentes ao lado. Seu uso aparecera aqui.</div>
                <Link href="/dashboard/chat" className={s.dashEmptyCta}>
                  Abrir chat <i className="bi bi-arrow-right" />
                </Link>
              </div>
            ) : (
              agentCounts.map((a, i) => {
                const meta = AGENT_META[a.agente] ?? { label: a.agente, href: '#', icon: 'bi-circle' }
                const pct = (a.count / maxAgentCount) * 100
                return (
                  <Link key={a.agente} href={meta.href} className={s.dashBarRow}>
                    <span className={s.dashBarNum}>{pad2(i + 1)}</span>
                    <span className={s.dashBarLabel}>{meta.label}</span>
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

        {/* Atividade Recente — DADOS REAIS */}
        <article className={s.dashCard}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPITULO II · DIARIO</div>
              <h2 className={s.dashCardTitle}>Atividade <em>recente</em></h2>
              <p className={s.dashCardSub}>
                {dataLoading
                  ? 'Carregando...'
                  : recent.length === 0
                    ? 'Sem registros ainda'
                    : 'Ultimas cinco interacoes'}
              </p>
            </div>
            <Link href="/dashboard/historico" className={s.dashCardAction}>
              Historico <i className="bi bi-arrow-right" />
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
                <i className="bi bi-journal" />
                <div className={s.dashEmptyTitle}>Nenhuma atividade ainda</div>
                <div className={s.dashEmptySub}>Cada interacao com um agente fica registrada aqui.</div>
              </div>
            ) : (
              recent.map((r, i) => {
                const meta = AGENT_META[r.agente.toLowerCase()] ?? { label: r.agente, href: '/dashboard/historico', icon: 'bi-circle' }
                const snippet = (r.mensagem_usuario || '').slice(0, 64)
                return (
                  <Link key={r.id} href={meta.href} className={s.dashActivityRow}>
                    <span className={s.dashActivityNum}>{ROMAN[i] ?? (i+1)}</span>
                    <div className={s.dashActivityIcon}>
                      <i className={`bi ${meta.icon}`} />
                    </div>
                    <div className={s.dashActivityInfo}>
                      <div className={s.dashActivityName}>{meta.label}</div>
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

      {/* ═════ GABINETE — AGENTES + PRAZOS/FINANCEIRO ═════ */}
      <section className={s.dashGridMain}>

        {/* Agentes do gabinete */}
        <article className={s.dashCard}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPITULO III · ATELIER</div>
              <h2 className={s.dashCardTitle}>Doze <em>agentes</em></h2>
              <p className={s.dashCardSub}>Clique para abrir o atelier do especialista</p>
            </div>
            <Link href="/dashboard/chat" className={s.dashCardAction}>
              Chat <i className="bi bi-arrow-right" />
            </Link>
          </div>

          <div className={s.dashAgentsGrid}>
            {[
              { href: '/dashboard/chat',        icon: 'bi-chat-square-dots',         name: 'Chat',         desc: 'Orquestrador · roteia para o agente certo' },
              { href: '/dashboard/resumidor',   icon: 'bi-file-earmark-text',        name: 'Resumidor',    desc: 'Analisa contratos, acordaos e peticoes' },
              { href: '/dashboard/redator',     icon: 'bi-pencil-square',            name: 'Redator',      desc: 'Pecas processuais com fundamentacao' },
              { href: '/dashboard/pesquisador', icon: 'bi-journal-bookmark',         name: 'Pesquisador',  desc: 'Jurisprudencia STF, STJ e tribunais' },
              { href: '/dashboard/negociador',  icon: 'bi-lightning',                name: 'Negociador',   desc: 'BATNA, ZOPA e cenarios de acordo' },
              { href: '/dashboard/professor',   icon: 'bi-bell',                     name: 'Monitor Legislativo', desc: 'Mudancas normativas e precedentes' },
              { href: '/dashboard/calculador',  icon: 'bi-calculator',               name: 'Calculador',   desc: 'Prazos, juros, correcao, custas' },
              { href: '/dashboard/legislacao',  icon: 'bi-book',                     name: 'Legislacao',   desc: 'Artigos de lei explicados' },
              { href: '/dashboard/simulado',    icon: 'bi-file-earmark-check',       name: 'Parecerista',  desc: 'Pareceres com fundamentacao legal' },
              { href: '/dashboard/consultor',   icon: 'bi-shield-check',             name: 'Estrategista', desc: 'Risco processual e linha de atuacao' },
              { href: '/dashboard/rotina',      icon: 'bi-calendar-week',            name: 'Rotina',       desc: 'Agenda, compromissos, fluxos' },
              { href: '/dashboard/planilhas',   icon: 'bi-file-earmark-spreadsheet', name: 'Planilhas',    desc: 'Timesheet, controle, honorarios' },
            ].map((ag, i) => (
              <Link key={ag.name} href={ag.href} className={s.dashAgent}>
                <span className={s.dashAgentNum}>{pad2(i + 1)}</span>
                <div className={s.dashAgentIcon}>
                  <i className={`bi ${ag.icon}`} />
                </div>
                <div className={s.dashAgentInfo}>
                  <div className={s.dashAgentName}>{ag.name}</div>
                  <div className={s.dashAgentDesc}>{ag.desc}</div>
                </div>
                <i className={`bi bi-arrow-right ${s.dashAgentArrow}`} />
              </Link>
            ))}
          </div>
        </article>

        {/* Coluna direita: Prazos + Financeiro */}
        <div className={s.dashSideCol}>

          {/* Prazos */}
          <article className={s.dashCard}>
            <div className={s.dashCardHead}>
              <div>
                <div className={s.dashCardCap}>CAPITULO IV · AGENDA</div>
                <h2 className={s.dashCardTitle}>Prazos <em>proximos</em></h2>
                <p className={s.dashCardSub}>Monitoramento ativo</p>
              </div>
              <Link href="/dashboard/prazos" className={s.dashCardAction}>
                Ver todos <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className={s.dashPrazos}>
              {stats.prazosList.length === 0 ? (
                <div className={`${s.dashEmptyState} ${s.compact}`}>
                  <i className="bi bi-clock" />
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

          {/* Financeiro */}
          <article className={s.dashCard}>
            <div className={s.dashCardHead}>
              <div>
                <div className={s.dashCardCap}>CAPITULO V · LIVRO-CAIXA</div>
                <h2 className={s.dashCardTitle}>Saldo <em>atual</em></h2>
                <p className={s.dashCardSub} suppressHydrationWarning>{typeof window === 'undefined' ? '' : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className={s.dashFinance}>
              <div className={s.dashFinanceValue} style={{ color: stats.saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {fmt(stats.saldo)}
              </div>
              <Link href="/dashboard/financeiro" className={s.dashFinanceCta}>
                Ver detalhes <i className="bi bi-arrow-right" />
              </Link>
            </div>
          </article>

        </div>
      </section>

    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ProvaCell — celula editorial de indicador (I, II, III, IV)
 * ──────────────────────────────────────────────────────────────────────────── */
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
