'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface Stats {
  documentos: number
  prazosUrgentes: number
  saldo: number
  prazosList: { titulo: string; data_limite: string; status: string }[]
}

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({ documentos: 0, prazosUrgentes: 0, saldo: 0, prazosList: [] })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [docs, prazos, financeiro] = await Promise.all([
        supabase.from('documentos').select('id', { count: 'exact' }).eq('usuario_id', user.id),
        supabase.from('prazos').select('titulo,data_limite,status').eq('usuario_id', user.id).order('data_limite'),
        supabase.from('financeiro').select('valor,tipo').eq('usuario_id', user.id),
      ])

      const hoje = new Date()
      const urgentes = (prazos.data ?? []).filter(p => {
        const diff = (new Date(p.data_limite + 'T00:00:00').getTime() - hoje.getTime()) / 86400000
        return diff >= 0 && diff <= 7 && p.status === 'pendente'
      })

      const saldo = (financeiro.data ?? []).reduce((acc, f) =>
        f.tipo === 'receita' ? acc + Number(f.valor) : acc - Number(f.valor), 0)

      setStats({
        documentos: docs.count ?? 0,
        prazosUrgentes: urgentes.length,
        saldo,
        prazosList: (prazos.data ?? []).slice(0, 3),
      })
    }
    load()
  }, [])

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

  const today = now.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1)

  // Onboarding — show once on first visit
  const [showOnboarding, setShowOnboarding] = useState(false)
  useEffect(() => {
    if (!localStorage.getItem('lexai-onboarded')) setShowOnboarding(true)
  }, [])
  function dismissOnboarding() {
    localStorage.setItem('lexai-onboarded', 'true')
    setShowOnboarding(false)
  }

  return (
    <div className="page-content">

      {/* Onboarding modal */}
      {showOnboarding && (
        <div className="modal-overlay" onClick={dismissOnboarding}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24, color: '#fff' }}>
                <i className="bi bi-cpu" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Bem-vindo ao LexAI
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Sua plataforma juridica com 10 agentes de inteligencia artificial. Analise documentos, pesquise jurisprudencia, gere pecas processuais e muito mais.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 24 }}>
                {[
                  { icon: 'bi-file-earmark-text', text: 'Cole um documento no Resumidor para analise completa' },
                  { icon: 'bi-pencil-square', text: 'Use o Redator para gerar pecas processuais' },
                  { icon: 'bi-journal-bookmark', text: 'Pesquise jurisprudencia com o Pesquisador' },
                  { icon: 'bi-calendar-check', text: 'Cadastre seus prazos para nao perder nenhum' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--hover)' }}>
                    <i className={`bi ${item.icon}`} style={{ fontSize: 16, color: 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={dismissOnboarding} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>
                Comecar a usar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="animate-in" style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ fontSize: 32 }}>{greeting}!</h1>
        <p className="page-subtitle">{todayCapitalized}</p>
      </div>

      {/* Hero Card */}
      <div className="section-card animate-in delay-1" style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', minHeight: 180 }}>
          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content',
              fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(16,185,129,0.10)', color: '#10B981',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
              SISTEMA ATIVO
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              Painel Juridico<br />Inteligente
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 400 }}>
              10 agentes de IA prontos para analisar documentos, pesquisar jurisprudencia e gerar pecas processuais.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Link href="/dashboard/resumidor" className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
                <i className="bi bi-cpu" /> Usar Agente
              </Link>
              <Link href="/dashboard/historico" className="btn-ghost" style={{ fontSize: 13, padding: '9px 18px' }}>
                Ver Historico
              </Link>
            </div>
          </div>
          <div style={{
            width: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16,
            padding: '24px 28px',
            background: 'rgba(15,23,42,0.04)', borderLeft: '1px solid rgba(0,0,0,0.04)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                DOCUMENTOS ANALISADOS
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                {stats.documentos}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginTop: 2 }}>
                LexAI · by Vanix Corp
              </div>
            </div>
            <div style={{ width: '100%', height: 1, background: 'rgba(0,0,0,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                AGENTES ATIVOS
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>10</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                Todos operacionais
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <Link href="/dashboard/resumidor" className="stat-card stat-card-lift stat-stagger" style={{ ['--stagger' as string]: '0' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Documentos</span>
            <div className="stat-card-icon docs"><i className="bi bi-file-earmark-text" /></div>
          </div>
          <div className="stat-card-value">{stats.documentos}</div>
          <div className="stat-trend up">
            <i className="bi bi-arrow-up-short" /> +12%
          </div>
          <div className="stat-card-footer">
            <span className="highlight">Analisados pela IA</span>
          </div>
        </Link>

        <Link href="/dashboard/prazos" className="stat-card stat-card-lift stat-stagger" style={{ ['--stagger' as string]: '1' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Prazos Urgentes</span>
            <div className="stat-card-icon deadline"><i className="bi bi-exclamation-triangle" /></div>
          </div>
          <div className="stat-card-value">{stats.prazosUrgentes}</div>
          <div className="stat-trend flat">
            <i className="bi bi-dash" /> —
          </div>
          <div className="stat-card-footer">
            <span className="warn">Próximos 7 dias</span>
          </div>
        </Link>

        <Link href="/dashboard/financeiro" className="stat-card stat-card-lift stat-stagger" style={{ ['--stagger' as string]: '2' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Financeiro</span>
            <div className="stat-card-icon finance"><i className="bi bi-wallet2" /></div>
          </div>
          <div className="stat-card-value" style={{ fontSize: '22px' }}>{fmt(stats.saldo)}</div>
          <div className="stat-trend up">
            <i className="bi bi-arrow-up-short" /> +8%
          </div>
          <div className="stat-card-footer">Saldo atual</div>
        </Link>

        <Link href="/dashboard/historico" className="stat-card stat-card-lift stat-stagger" style={{ ['--stagger' as string]: '3' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Agentes IA</span>
            <div className="stat-card-icon agents"><i className="bi bi-cpu" /></div>
          </div>
          <div className="stat-card-value">10</div>
          <div className="stat-trend flat">
            <i className="bi bi-dash" /> —
          </div>
          <div className="stat-card-footer">
            <span className="highlight">LexAI · by Vanix Corp</span>
          </div>
        </Link>
      </div>

      {/* Usage Analytics */}
      <div className="animate-in delay-5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginTop: 32, marginBottom: 32 }}>

        {/* Agent Usage Chart */}
        <div className="section-card analytics-chart-card analytics-card-lift">
          <div className="section-header">
            <div>
              <div className="section-title">Uso dos Agentes</div>
              <div className="section-subtitle">Interacoes desta semana</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 22px 22px' }}>
            {[
              { name: 'Resumidor', count: 47 },
              { name: 'Pesquisador', count: 38 },
              { name: 'Redator', count: 31 },
              { name: 'Professor', count: 28 },
              { name: 'Negociador', count: 22 },
              { name: 'Calculador', count: 19 },
              { name: 'Legislacao', count: 15 },
            ].map((agent, i) => (
              <div key={agent.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 90, flexShrink: 0, textAlign: 'right' }}>
                  {agent.name}
                </span>
                <div style={{ flex: 1, height: 22, borderRadius: 6, background: 'var(--hover)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(agent.count / 47) * 100}%`,
                    borderRadius: 6,
                    background: `linear-gradient(90deg, var(--accent), var(--accent))`,
                    opacity: 1 - i * 0.08,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', width: 28, flexShrink: 0 }}>
                  {agent.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="section-card analytics-activity-card analytics-card-lift">
          <div className="section-header">
            <div>
              <div className="section-title">Atividade Recente</div>
              <div className="section-subtitle">Ultimas interacoes</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 22px 14px' }}>
            {[
              { agent: 'Resumidor', action: 'Documento analisado', time: '2 min atras', icon: 'bi-text-paragraph', href: '/dashboard/resumidor' },
              { agent: 'Pesquisador', action: 'Jurisprudencia encontrada', time: '15 min atras', icon: 'bi-journal-bookmark', href: '/dashboard/pesquisador' },
              { agent: 'Professor', action: 'Aula sobre Direito Civil', time: '1h atras', icon: 'bi-mortarboard', href: '/dashboard/professor' },
              { agent: 'Redator', action: 'Peticao gerada', time: '3h atras', icon: 'bi-pencil-square', href: '/dashboard/redator' },
              { agent: 'Calculador', action: 'Prazo calculado', time: '5h atras', icon: 'bi-calculator', href: '/dashboard/calculador' },
            ].map((item, idx, arr) => (
              <Link key={item.agent} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 8px',
                marginInline: -8,
                borderRadius: 8,
                borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border)',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className={`bi ${item.icon}`} style={{ fontSize: 14, color: 'var(--accent)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.agent}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.action}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{item.time}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Two Column */}
      <div className="content-grid animate-in delay-5">

        {/* Agents */}
        <div className="section-card">
          <div className="section-header">
            <div>
              <div className="section-title">Agentes Inteligentes</div>
              <div className="section-subtitle">Clique para interagir com cada agente</div>
            </div>
            <Link href="/dashboard/resumidor" className="section-action">
              Gerenciar <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="agent-list">
            {[
              { href: '/dashboard/resumidor',   cls: 'resumidor',   icon: 'bi-text-paragraph',   name: 'Agente Resumidor',   desc: 'Analisa contratos, acórdãos e documentos jurídicos com IA' },
              { href: '/dashboard/redator',     cls: 'redator',     icon: 'bi-pencil-square',    name: 'Agente Redator',     desc: 'Gera petições, recursos e peças processuais completas' },
              { href: '/dashboard/pesquisador', cls: 'pesquisador', icon: 'bi-journal-bookmark', name: 'Agente Pesquisador', desc: 'Pesquisa jurisprudência no STJ, STF e tribunais' },
              { href: '/dashboard/prazos',      cls: 'prazos',      icon: 'bi-calendar-check',   name: 'Controle de Prazos', desc: 'Monitora e alerta sobre datas processuais críticas' },
              { href: '/dashboard/negociador',  cls: 'redator',     icon: 'bi-lightning',        name: 'Agente Negociador',  desc: 'Estrategia de negociacao e mediacao de conflitos' },
              { href: '/dashboard/professor',   cls: 'pesquisador', icon: 'bi-mortarboard',      name: 'Agente Professor',   desc: 'Ensino juridico em 3 niveis com questoes OAB' },
              { href: '/dashboard/financeiro',  cls: 'financeiro',  icon: 'bi-wallet2',          name: 'Financeiro',         desc: 'Controla receitas e despesas do escritorio' },
              { href: '/dashboard/rotina',      cls: 'rotina',      icon: 'bi-calendar-week',    name: 'Rotina Semanal',     desc: 'Organiza grade de aulas e compromissos' },
              { href: '/dashboard/calculador', cls: 'financeiro',  icon: 'bi-calculator',       name: 'Calculador Juridico', desc: 'Prazos, correcao monetaria, juros e custas' },
              { href: '/dashboard/legislacao', cls: 'resumidor',   icon: 'bi-book',             name: 'Legislacao',          desc: 'Artigos de lei, codigos e normas brasileiras' },
            ].map(ag => (
              <Link key={ag.name} href={ag.href} className="agent-item">
                <div className={`agent-icon ${ag.cls}`}><i className={`bi ${ag.icon}`} /></div>
                <div className="agent-info">
                  <div className="agent-name">{ag.name}</div>
                  <div className="agent-desc">{ag.desc}</div>
                </div>
                <div className="agent-status"><span className="dot" /> Ativo</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Deadlines */}
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Prazos Próximos</div>
                <div className="section-subtitle">Monitoramento ativo</div>
              </div>
              <Link href="/dashboard/prazos" className="section-action">
                Ver todos <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="deadline-list">
              {stats.prazosList.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <i className="bi bi-clock" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                  Nenhum prazo cadastrado
                </div>
              ) : stats.prazosList.map(p => {
                const dias = diasRestantes(p.data_limite)
                return (
                  <div key={p.titulo} className="deadline-item">
                    <div className={`deadline-bar ${barClass(dias)}`} />
                    <div className="deadline-info">
                      <div className="deadline-title">{p.titulo}</div>
                      <div className="deadline-meta">
                        {new Date(p.data_limite + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="deadline-days">
                      {dias < 0 ? 'Vencido' : dias === 0 ? 'Hoje!' : `${dias}d`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Finance */}
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Financeiro</div>
                <div className="section-subtitle">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            <div className="finance-content">
              <div className="finance-amount" style={{ color: stats.saldo >= 0 ? '#2d6a4f' : '#c0392b' }}>{fmt(stats.saldo)}</div>
              <div className="finance-label">Saldo atual</div>
              <Link href="/dashboard/financeiro" className="section-action" style={{ marginTop: '12px', display: 'inline-flex' }}>
                Ver detalhes <i className="bi bi-arrow-right" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Local styles — polish nivel hard */}
      <style jsx>{`
        .stat-stagger {
          opacity: 0;
          transform: translateY(14px);
          animation: stat-fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: calc(var(--stagger, 0) * 90ms + 80ms);
          position: relative;
        }
        .stat-card-lift {
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.28s ease;
        }
        .stat-card-lift:hover {
          transform: translateY(-4px);
          box-shadow:
            0 18px 48px rgba(15, 23, 42, 0.14),
            0 4px 14px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.35);
        }
        .stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          margin-top: 6px;
          letter-spacing: 0.01em;
          line-height: 1.4;
        }
        .stat-trend.up {
          color: var(--success);
          background: var(--success-light);
        }
        .stat-trend.flat {
          color: var(--text-muted);
          background: var(--hover);
        }
        .stat-trend :global(i) {
          font-size: 13px;
          margin-right: -1px;
        }
        .analytics-card-lift {
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .analytics-card-lift:hover {
          transform: translateY(-3px);
          box-shadow:
            0 16px 42px rgba(15, 23, 42, 0.12),
            0 3px 12px rgba(15, 23, 42, 0.05);
        }
        @keyframes stat-fade-up {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 640px) {
          .stat-trend {
            font-size: 10px;
            padding: 2px 6px;
          }
        }
      `}</style>

      {/* Quick Actions */}
      <div className="quick-actions animate-in delay-6">
        <div className="quick-actions-title">Ações Rápidas</div>
        <div className="actions-grid">
          <Link href="/dashboard/resumidor" className="action-card">
            <div className="action-icon"><i className="bi bi-share" /></div>
            <div className="action-name">Analisar Documento</div>
            <div className="action-desc">Cole um contrato, petição ou acórdão e obtenha um resumo completo com IA.</div>
            <div className="action-link">Abrir agente <i className="bi bi-arrow-right" /></div>
          </Link>
          <Link href="/dashboard/prazos" className="action-card">
            <div className="action-icon"><i className="bi bi-pause-circle" /></div>
            <div className="action-name">Gerenciar Prazos</div>
            <div className="action-desc">Visualize e adicione prazos processuais com alertas automáticos.</div>
            <div className="action-link">Ver prazos <i className="bi bi-arrow-right" /></div>
          </Link>
          <Link href="/dashboard/configuracoes" className="action-card">
            <div className="action-icon"><i className="bi bi-person-circle" /></div>
            <div className="action-name">Meu Perfil</div>
            <div className="action-desc">Atualize suas informações acadêmicas, preferências e dados de acesso.</div>
            <div className="action-link">Abrir perfil <i className="bi bi-arrow-right" /></div>
          </Link>
        </div>
      </div>

    </div>
  )
}
