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
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const today = now.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="page-content">

      {/* Welcome — personalizado */}
      <div className="animate-in" style={{ marginBottom: 4 }}>
        <h1 className="page-title" style={{ fontSize: 30 }}>{greeting}!</h1>
        <p className="page-subtitle">{todayCapitalized}</p>
      </div>

      {/* Streak bar */}
      <div className="animate-in delay-1" style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 18px', borderRadius: 12,
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-fire" style={{ color: '#F5A623', fontSize: 18 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats.documentos > 0 ? `${stats.documentos} documentos analisados` : 'Comece sua jornada'}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="streak-bar">
            <div className="streak-bar-fill" style={{ width: `${Math.min(stats.documentos * 10, 100)}%` }} />
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          8 agentes ativos
        </span>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <Link href="/dashboard/resumidor" className="stat-card animate-in delay-1">
          <div className="stat-card-header">
            <span className="stat-card-label">Documentos</span>
            <div className="stat-card-icon docs"><i className="bi bi-file-earmark-text" /></div>
          </div>
          <div className="stat-card-value">{stats.documentos}</div>
          <div className="stat-card-footer">
            <span className="highlight">Analisados pela IA</span>
          </div>
        </Link>

        <Link href="/dashboard/prazos" className="stat-card animate-in delay-2">
          <div className="stat-card-header">
            <span className="stat-card-label">Prazos Urgentes</span>
            <div className="stat-card-icon deadline"><i className="bi bi-exclamation-triangle" /></div>
          </div>
          <div className="stat-card-value">{stats.prazosUrgentes}</div>
          <div className="stat-card-footer">
            <span className="warn">Próximos 7 dias</span>
          </div>
        </Link>

        <Link href="/dashboard/financeiro" className="stat-card animate-in delay-3">
          <div className="stat-card-header">
            <span className="stat-card-label">Financeiro</span>
            <div className="stat-card-icon finance"><i className="bi bi-wallet2" /></div>
          </div>
          <div className="stat-card-value" style={{ fontSize: '22px' }}>{fmt(stats.saldo)}</div>
          <div className="stat-card-footer">Saldo atual</div>
        </Link>

        <Link href="/dashboard/historico" className="stat-card animate-in delay-4">
          <div className="stat-card-header">
            <span className="stat-card-label">Agentes IA</span>
            <div className="stat-card-icon agents"><i className="bi bi-cpu" /></div>
          </div>
          <div className="stat-card-value">8</div>
          <div className="stat-card-footer">
            <span className="highlight">Powered by Claude</span>
          </div>
        </Link>
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
