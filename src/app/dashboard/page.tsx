'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'
import Link from 'next/link'

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

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 5 ? 'Boa noite' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const todayStr = now.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const todayCapitalized = todayStr.charAt(0).toUpperCase() + todayStr.slice(1)

  const maxAgentCount = useMemo(
    () => agentCounts.reduce((m, a) => Math.max(m, a.count), 0) || 1,
    [agentCounts]
  )

  return (
    <div className="page-content dash-atelier">

      {/* ═════ HEADER EDITORIAL ═════ */}
      <header className="dash-header">
        <div className="dash-serial">
          <span className="dash-serial-dot" />
          <span>N° 001 · GABINETE · MMXXVI</span>
        </div>
        <h1 className="dash-atelier-h1">
          {greeting}, <em>advogado</em>.
        </h1>
        <p className="dash-header-sub">{todayCapitalized}</p>
        <div className="dash-hairline" aria-hidden />
      </header>

      {/* ═════ PROVAS — 4 COLUNAS EDITORIAIS ═════ */}
      <section className="dash-provas" aria-label="Indicadores do gabinete">
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

      {/* ═════ GABINETE — USO + ATIVIDADE ═════ */}
      <section className="dash-grid-usage" aria-label="Uso dos agentes e atividade recente">

        {/* Uso dos Agentes — DADOS REAIS */}
        <article className="dash-card">
          <div className="dash-card-head">
            <div>
              <div className="dash-card-cap">CAPITULO I · ATELIER</div>
              <h2 className="dash-card-title">Uso dos <em>agentes</em></h2>
              <p className="dash-card-sub">
                {dataLoading
                  ? 'Contando interacoes dos ultimos 7 dias...'
                  : stats.totalInteracoesSemana === 0
                    ? 'Nenhuma interacao registrada esta semana'
                    : `${stats.totalInteracoesSemana} interacao${stats.totalInteracoesSemana === 1 ? '' : 'oes'} nos ultimos 7 dias`}
              </p>
            </div>
            <Link href="/dashboard/historico" className="dash-card-action">
              Ver tudo <i className="bi bi-arrow-right" />
            </Link>
          </div>

          <div className="dash-bars">
            {dataLoading ? (
              <div className="dash-empty">
                <div className="dash-skel" />
                <div className="dash-skel" />
                <div className="dash-skel" />
              </div>
            ) : agentCounts.length === 0 ? (
              <div className="dash-empty-state">
                <i className="bi bi-bar-chart" />
                <div className="dash-empty-title">Nenhum uso nesta semana</div>
                <div className="dash-empty-sub">Comece pelo chat ou por um dos agentes ao lado. Seu uso aparecera aqui.</div>
                <Link href="/dashboard/chat" className="dash-empty-cta">
                  Abrir chat <i className="bi bi-arrow-right" />
                </Link>
              </div>
            ) : (
              agentCounts.map((a, i) => {
                const meta = AGENT_META[a.agente] ?? { label: a.agente, href: '#', icon: 'bi-circle' }
                const pct = (a.count / maxAgentCount) * 100
                return (
                  <Link key={a.agente} href={meta.href} className="dash-bar-row">
                    <span className="dash-bar-num">{pad2(i + 1)}</span>
                    <span className="dash-bar-label">{meta.label}</span>
                    <div className="dash-bar-track">
                      <div className="dash-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="dash-bar-count">{a.count}</span>
                  </Link>
                )
              })
            )}
          </div>
        </article>

        {/* Atividade Recente — DADOS REAIS */}
        <article className="dash-card">
          <div className="dash-card-head">
            <div>
              <div className="dash-card-cap">CAPITULO II · DIARIO</div>
              <h2 className="dash-card-title">Atividade <em>recente</em></h2>
              <p className="dash-card-sub">
                {dataLoading
                  ? 'Carregando...'
                  : recent.length === 0
                    ? 'Sem registros ainda'
                    : 'Ultimas cinco interacoes'}
              </p>
            </div>
            <Link href="/dashboard/historico" className="dash-card-action">
              Historico <i className="bi bi-arrow-right" />
            </Link>
          </div>

          <div className="dash-activity">
            {dataLoading ? (
              <>
                <div className="dash-skel-row" />
                <div className="dash-skel-row" />
                <div className="dash-skel-row" />
              </>
            ) : recent.length === 0 ? (
              <div className="dash-empty-state">
                <i className="bi bi-journal" />
                <div className="dash-empty-title">Nenhuma atividade ainda</div>
                <div className="dash-empty-sub">Cada interacao com um agente fica registrada aqui.</div>
              </div>
            ) : (
              recent.map((r, i) => {
                const meta = AGENT_META[r.agente.toLowerCase()] ?? { label: r.agente, href: '/dashboard/historico', icon: 'bi-circle' }
                const snippet = (r.mensagem_usuario || '').slice(0, 64)
                return (
                  <Link key={r.id} href={meta.href} className="dash-activity-row">
                    <span className="dash-activity-num">{ROMAN[i] ?? (i+1)}</span>
                    <div className="dash-activity-icon">
                      <i className={`bi ${meta.icon}`} />
                    </div>
                    <div className="dash-activity-info">
                      <div className="dash-activity-name">{meta.label}</div>
                      <div className="dash-activity-snippet">{snippet || '—'}</div>
                    </div>
                    <span className="dash-activity-time">{relativeTime(r.created_at)}</span>
                  </Link>
                )
              })
            )}
          </div>
        </article>

      </section>

      {/* ═════ GABINETE — AGENTES + PRAZOS/FINANCEIRO ═════ */}
      <section className="dash-grid-main">

        {/* Agentes do gabinete */}
        <article className="dash-card">
          <div className="dash-card-head">
            <div>
              <div className="dash-card-cap">CAPITULO III · ATELIER</div>
              <h2 className="dash-card-title">Doze <em>agentes</em></h2>
              <p className="dash-card-sub">Clique para abrir o atelier do especialista</p>
            </div>
            <Link href="/dashboard/chat" className="dash-card-action">
              Chat <i className="bi bi-arrow-right" />
            </Link>
          </div>

          <div className="dash-agents-grid">
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
              <Link key={ag.name} href={ag.href} className="dash-agent">
                <span className="dash-agent-num">{pad2(i + 1)}</span>
                <div className="dash-agent-icon">
                  <i className={`bi ${ag.icon}`} />
                </div>
                <div className="dash-agent-info">
                  <div className="dash-agent-name">{ag.name}</div>
                  <div className="dash-agent-desc">{ag.desc}</div>
                </div>
                <i className="bi bi-arrow-right dash-agent-arrow" />
              </Link>
            ))}
          </div>
        </article>

        {/* Coluna direita: Prazos + Financeiro */}
        <div className="dash-side-col">

          {/* Prazos */}
          <article className="dash-card">
            <div className="dash-card-head">
              <div>
                <div className="dash-card-cap">CAPITULO IV · AGENDA</div>
                <h2 className="dash-card-title">Prazos <em>proximos</em></h2>
                <p className="dash-card-sub">Monitoramento ativo</p>
              </div>
              <Link href="/dashboard/prazos" className="dash-card-action">
                Ver todos <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="dash-prazos">
              {stats.prazosList.length === 0 ? (
                <div className="dash-empty-state compact">
                  <i className="bi bi-clock" />
                  <div className="dash-empty-title">Nenhum prazo</div>
                  <div className="dash-empty-sub">Cadastre seus prazos processuais para receber alertas.</div>
                </div>
              ) : (
                stats.prazosList.map((p, i) => {
                  const dias = diasRestantes(p.data_limite)
                  const cls = barClass(dias)
                  return (
                    <div key={p.titulo + i} className={`dash-prazo-row ${cls}`}>
                      <span className="dash-prazo-bar" />
                      <div className="dash-prazo-info">
                        <div className="dash-prazo-title">{p.titulo}</div>
                        <div className="dash-prazo-meta">
                          {new Date(p.data_limite + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="dash-prazo-days">
                        {dias < 0 ? 'Vencido' : dias === 0 ? 'Hoje' : `${dias}d`}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </article>

          {/* Financeiro */}
          <article className="dash-card">
            <div className="dash-card-head">
              <div>
                <div className="dash-card-cap">CAPITULO V · LIVRO-CAIXA</div>
                <h2 className="dash-card-title">Saldo <em>atual</em></h2>
                <p className="dash-card-sub">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="dash-finance">
              <div className="dash-finance-value" style={{ color: stats.saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {fmt(stats.saldo)}
              </div>
              <Link href="/dashboard/financeiro" className="dash-finance-cta">
                Ver detalhes <i className="bi bi-arrow-right" />
              </Link>
            </div>
          </article>

        </div>
      </section>

      {/* ═════ STYLES ═════ */}
      <style jsx>{`
        .dash-atelier {
          position: relative;
        }

        /* ── Serial label ─────────────────────────────────── */
        .dash-serial {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }
        .dash-serial-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--stone);
          box-shadow: 0 0 0 0 rgba(191, 166, 142, 0.5);
          animation: dash-pulse 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* ── Header ──────────────────────────────────────── */
        .dash-header {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 40px;
          padding-top: 4px;
        }
        .dash-atelier-h1 {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 44px;
          font-weight: 500;
          line-height: 1.08;
          letter-spacing: -1.2px;
          color: var(--text-primary);
          margin: 0;
        }
        .dash-atelier-h1 em {
          font-style: italic;
          font-weight: 400;
          color: var(--accent);
        }
        .dash-header-sub {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
          letter-spacing: 0.1px;
        }
        .dash-hairline {
          height: 1px;
          background: linear-gradient(90deg, var(--stone) 0%, var(--stone-line) 24%, transparent 100%);
          margin-top: 10px;
        }

        /* ── Provas (4 Roman columns) ────────────────────── */
        .dash-provas {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-top: 40px;
          margin-bottom: 56px;
          border: 1px solid var(--stone-line);
          background: var(--glass);
          backdrop-filter: blur(var(--blur)) saturate(160%);
          -webkit-backdrop-filter: blur(var(--blur)) saturate(160%);
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 1px 0 rgba(255,255,255,0.24) inset, 0 18px 50px rgba(19,32,37,0.06);
        }

        /* ── Grid layouts ────────────────────────────────── */
        .dash-grid-usage {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 48px;
          margin-bottom: 56px;
        }
        .dash-grid-main {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .dash-side-col {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        /* ── Cards ──────────────────────────────────────── */
        .dash-card {
          background: var(--glass);
          backdrop-filter: blur(var(--blur)) saturate(160%);
          -webkit-backdrop-filter: blur(var(--blur)) saturate(160%);
          border: 1px solid var(--stone-line);
          border-radius: 18px;
          padding: 28px 30px 26px;
          position: relative;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.35s ease;
          box-shadow: 0 1px 0 rgba(255,255,255,0.24) inset, 0 18px 50px rgba(19,32,37,0.06);
        }
        .dash-card:hover {
          transform: translateY(-3px);
          border-color: var(--stone);
          box-shadow: 0 1px 0 rgba(255,255,255,0.32) inset, 0 28px 64px rgba(19,32,37,0.10);
        }
        .dash-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--stone-line);
        }
        .dash-card-cap {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2.2px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .dash-card-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 24px;
          font-weight: 500;
          line-height: 1.15;
          letter-spacing: -0.6px;
          color: var(--text-primary);
          margin: 0 0 6px;
        }
        .dash-card-title em {
          font-style: italic;
          font-weight: 400;
          color: var(--accent);
        }
        .dash-card-sub {
          font-size: 12.5px;
          color: var(--text-muted);
          margin: 0;
          letter-spacing: 0.1px;
        }
        .dash-card-action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: var(--accent);
          text-decoration: none;
          transition: gap 0.22s ease, color 0.22s ease;
          white-space: nowrap;
        }
        .dash-card-action:hover {
          gap: 11px;
          color: var(--text-primary);
        }

        /* ── Uso dos Agentes — bars ──────────────────────── */
        .dash-bars {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .dash-bar-row {
          display: grid;
          grid-template-columns: 28px 100px 1fr 36px;
          align-items: center;
          gap: 16px;
          padding: 8px 10px;
          margin-inline: -10px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.22s ease;
        }
        .dash-bar-row:hover {
          background: var(--hover);
        }
        .dash-bar-num {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: var(--text-muted);
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .dash-bar-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          text-align: right;
          letter-spacing: 0.1px;
        }
        .dash-bar-track {
          height: 4px;
          border-radius: 2px;
          background: var(--stone-soft);
          overflow: hidden;
          position: relative;
        }
        .dash-bar-fill {
          position: absolute;
          inset: 0 auto 0 0;
          background: linear-gradient(90deg, var(--accent), var(--stone));
          border-radius: 2px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dash-bar-count {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 18px;
          font-style: italic;
          color: var(--accent);
          text-align: right;
          font-variant-numeric: tabular-nums;
          font-weight: 500;
        }

        /* ── Atividade recente ───────────────────────────── */
        .dash-activity {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .dash-activity-row {
          display: grid;
          grid-template-columns: 24px 36px 1fr auto;
          align-items: center;
          gap: 14px;
          padding: 14px 10px;
          margin-inline: -10px;
          border-bottom: 1px solid var(--stone-line);
          text-decoration: none;
          transition: background 0.22s ease, padding 0.22s ease;
        }
        .dash-activity-row:last-child {
          border-bottom: none;
        }
        .dash-activity-row:hover {
          background: var(--hover);
          padding-left: 14px;
        }
        .dash-activity-num {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: var(--text-muted);
          text-align: center;
          letter-spacing: 0.3px;
        }
        .dash-activity-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--accent-bg);
          border: 1px solid var(--stone-line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--accent);
          flex-shrink: 0;
        }
        .dash-activity-info {
          min-width: 0;
          overflow: hidden;
        }
        .dash-activity-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.1px;
        }
        .dash-activity-snippet {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dash-activity-time {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
        }

        /* ── Agentes grid ─────────────────────────────────── */
        .dash-agents-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .dash-agent {
          display: grid;
          grid-template-columns: 26px 38px 1fr 16px;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid var(--stone-line);
          border-radius: 12px;
          text-decoration: none;
          background: transparent;
          transition: background 0.28s ease, border-color 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .dash-agent::before {
          content: '';
          position: absolute;
          inset: 0 auto 0 0;
          width: 3px;
          background: linear-gradient(180deg, var(--accent), var(--stone));
          opacity: 0;
          transition: opacity 0.28s ease;
        }
        .dash-agent:hover {
          background: var(--hover);
          border-color: var(--stone);
          transform: translateX(3px);
        }
        .dash-agent:hover::before {
          opacity: 1;
        }
        .dash-agent-num {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
          text-align: right;
        }
        .dash-agent-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--accent-bg);
          border: 1px solid var(--stone-line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: var(--accent);
          flex-shrink: 0;
          transition: background 0.28s ease, color 0.28s ease;
        }
        .dash-agent:hover .dash-agent-icon {
          background: var(--accent);
          color: var(--bg-base);
        }
        .dash-agent-info {
          min-width: 0;
        }
        .dash-agent-name {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.1px;
        }
        .dash-agent-desc {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dash-agent-arrow {
          font-size: 13px;
          color: var(--text-muted);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.28s ease, transform 0.28s ease, color 0.28s ease;
        }
        .dash-agent:hover .dash-agent-arrow {
          opacity: 1;
          transform: translateX(0);
          color: var(--accent);
        }

        /* ── Prazos ──────────────────────────────────────── */
        .dash-prazos {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .dash-prazo-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border: 1px solid var(--stone-line);
          border-radius: 10px;
          background: var(--hover);
        }
        .dash-prazo-bar {
          width: 3px;
          height: 36px;
          border-radius: 2px;
          background: var(--stone);
        }
        .dash-prazo-row.critical .dash-prazo-bar { background: var(--danger); }
        .dash-prazo-row.warning .dash-prazo-bar { background: var(--warning); }
        .dash-prazo-row.normal .dash-prazo-bar { background: var(--success); }
        .dash-prazo-info { flex: 1; min-width: 0; }
        .dash-prazo-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dash-prazo-meta {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .dash-prazo-days {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 17px;
          font-style: italic;
          color: var(--accent);
          font-variant-numeric: tabular-nums;
          font-weight: 500;
          flex-shrink: 0;
        }
        .dash-prazo-row.critical .dash-prazo-days { color: var(--danger); }

        /* ── Finance ─────────────────────────────────────── */
        .dash-finance {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .dash-finance-value {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 36px;
          font-weight: 500;
          letter-spacing: -1px;
          font-variant-numeric: tabular-nums;
        }
        .dash-finance-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: var(--accent);
          text-decoration: none;
          transition: gap 0.22s ease, color 0.22s ease;
        }
        .dash-finance-cta:hover {
          gap: 11px;
          color: var(--text-primary);
        }

        /* ── Empty / skeleton states ─────────────────────── */
        .dash-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 38px 20px 10px;
          text-align: center;
          gap: 6px;
        }
        .dash-empty-state.compact { padding: 22px 12px 6px; }
        .dash-empty-state i {
          font-size: 28px;
          color: var(--stone);
          margin-bottom: 4px;
        }
        .dash-empty-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
          font-size: 16px;
          color: var(--text-primary);
        }
        .dash-empty-sub {
          font-size: 12.5px;
          color: var(--text-muted);
          max-width: 280px;
          line-height: 1.55;
        }
        .dash-empty-cta {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          background: var(--accent);
          color: var(--bg-base);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-decoration: none;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .dash-empty-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(19,32,37,0.18);
        }
        .dash-skel, .dash-skel-row {
          height: 38px;
          border-radius: 8px;
          background: linear-gradient(90deg, var(--hover), var(--stone-soft), var(--hover));
          background-size: 200% 100%;
          animation: dash-shimmer 1.6s ease-in-out infinite;
          margin-bottom: 12px;
        }
        .dash-skel-row:last-child { margin-bottom: 0; }

        @keyframes dash-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes dash-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(191, 166, 142, 0.55); }
          50% { box-shadow: 0 0 0 6px rgba(191, 166, 142, 0); }
        }

        /* ── Responsive ──────────────────────────────────── */
        @media (max-width: 1100px) {
          .dash-grid-usage,
          .dash-grid-main {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .dash-agents-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 760px) {
          .dash-atelier-h1 { font-size: 34px; }
          .dash-provas {
            grid-template-columns: 1fr 1fr;
          }
          .dash-card { padding: 22px 20px; }
          .dash-card-title { font-size: 20px; }
          .dash-bar-row {
            grid-template-columns: 22px 80px 1fr 30px;
            gap: 10px;
          }
          .dash-bar-count { font-size: 15px; }
          .dash-finance-value { font-size: 30px; }
        }
      `}</style>
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
    <Link href={href} className="prova-cell">
      <span className="prova-roman">{roman}</span>
      {moneyValue !== undefined ? (
        <div className="prova-value money">{moneyValue}</div>
      ) : (
        <div className="prova-value">{value ?? 0}</div>
      )}
      <div className="prova-label">{label}</div>
      <div className={`prova-caption ${warning ? 'warn' : ''}`}>{caption}</div>

      <style jsx>{`
        .prova-cell {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
          padding: 44px 44px 40px;
          text-decoration: none;
          border-right: 1px solid var(--stone-line);
          transition: background 0.28s ease;
          position: relative;
        }
        .prova-cell:last-child {
          border-right: none;
        }
        .prova-cell:hover {
          background: var(--hover);
        }
        .prova-roman {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: var(--text-muted);
          letter-spacing: 1.6px;
          margin-bottom: 20px;
        }
        .prova-value {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 48px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -1.4px;
          font-variant-numeric: tabular-nums;
        }
        .prova-value.money {
          font-size: 28px;
          letter-spacing: -0.6px;
          line-height: 1.1;
          padding-top: 6px;
        }
        .prova-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-top: 20px;
        }
        .prova-caption {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 6px;
        }
        .prova-caption.warn {
          color: var(--warning);
          font-weight: 600;
        }
        @media (max-width: 760px) {
          .prova-cell { padding: 32px 28px 28px; }
          .prova-value { font-size: 38px; }
          .prova-value.money { font-size: 22px; }
          .prova-cell:nth-child(2) { border-right: none; }
        }
      `}</style>
    </Link>
  )
}
