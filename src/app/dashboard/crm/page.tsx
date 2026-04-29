'use client'

/* ═════════════════════════════════════════════════════════════
 * CRM — modo DEMO
 * ─────────────────────────────────────────────────────────────
 * Módulo está em beta fechado. Esta página mostra a estrutura
 * completa com dados-exemplo para o escritório sentir a forma
 * antes do release. Ações CTA roteiam para /dashboard/planos.
 * ═════════════════════════════════════════════════════════════ */

import { useState } from 'react'
import {
  Users, Phone, Mail, MessageSquare, Calendar, Target,
  TrendingUp, Flame, Clock, CheckCircle2, Plus,
  Filter, ChevronRight, UserRound,
} from 'lucide-react'
import { toast } from '@/components/Toast'

type Stage = 'novo' | 'qualificacao' | 'proposta' | 'contrato' | 'fechado'

interface Lead {
  id: string
  nome: string
  empresa?: string
  tipo: 'PF' | 'PJ'
  origem: 'Indicação' | 'Site' | 'LinkedIn' | 'Google Ads' | 'Evento'
  estagio: Stage
  valor: number
  dias: number
  proximaAcao: string
  temperatura: 'quente' | 'morno' | 'frio'
}

const LEADS: Lead[] = [
  { id: 'l1', nome: 'Ricardo Menezes',      empresa: 'Menezes & Cia',   tipo: 'PJ', origem: 'Indicação',  estagio: 'novo',          valor: 18500, dias: 2,  proximaAcao: 'Primeira reunião · terça 14h',  temperatura: 'quente' },
  { id: 'l2', nome: 'Luiza Fontana',        empresa: undefined,          tipo: 'PF', origem: 'Site',        estagio: 'novo',          valor: 4800,  dias: 1,  proximaAcao: 'Enviar apresentação institucional', temperatura: 'morno' },
  { id: 'l3', nome: 'Takeda Indústria',     empresa: 'Takeda do Brasil', tipo: 'PJ', origem: 'LinkedIn',    estagio: 'qualificacao',  valor: 42000, dias: 6,  proximaAcao: 'Reunião com jurídico interno',      temperatura: 'quente' },
  { id: 'l4', nome: 'Paula Ferraz',         empresa: undefined,          tipo: 'PF', origem: 'Indicação',   estagio: 'qualificacao',  valor: 9200,  dias: 4,  proximaAcao: 'Aguardando documentação',           temperatura: 'morno' },
  { id: 'l5', nome: 'Orbis Construtora',    empresa: 'Orbis S.A.',       tipo: 'PJ', origem: 'Evento',      estagio: 'proposta',      valor: 68000, dias: 9,  proximaAcao: 'Follow-up pós-proposta · hoje',      temperatura: 'quente' },
  { id: 'l6', nome: 'Clarice Vasconcellos', empresa: undefined,          tipo: 'PF', origem: 'Google Ads',  estagio: 'proposta',      valor: 12500, dias: 7,  proximaAcao: 'Ajustar escopo de honorários',       temperatura: 'morno' },
  { id: 'l7', nome: 'Nexa Logística',       empresa: 'Nexa',             tipo: 'PJ', origem: 'Indicação',   estagio: 'contrato',      valor: 54000, dias: 14, proximaAcao: 'Assinatura eletrônica enviada',      temperatura: 'quente' },
  { id: 'l8', nome: 'Eduardo Siqueira',     empresa: 'Siqueira Ltda',    tipo: 'PJ', origem: 'LinkedIn',    estagio: 'fechado',       valor: 24000, dias: 18, proximaAcao: 'Onboarding concluído',               temperatura: 'quente' },
]

const STAGES: { id: Stage; label: string; caption: string }[] = [
  { id: 'novo',          label: 'Novo contato',   caption: '72h' },
  { id: 'qualificacao',  label: 'Qualificação',   caption: '7 dias' },
  { id: 'proposta',      label: 'Proposta',       caption: '14 dias' },
  { id: 'contrato',      label: 'Contrato',       caption: 'em trânsito' },
  { id: 'fechado',       label: 'Fechado · ganho',caption: 'este mês' },
]

const fmtBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const tempColor = (t: Lead['temperatura']) => {
  if (t === 'quente') return { bg: 'rgba(216,137,119,0.14)', bd: 'rgba(216,137,119,0.34)', fg: '#d88977' }
  if (t === 'morno')  return { bg: 'rgba(212,174,106,0.14)', bd: 'rgba(212,174,106,0.34)', fg: '#d4ae6a' }
  return { bg: 'rgba(191,166,142,0.10)', bd: 'rgba(191,166,142,0.28)', fg: '#bfa68e' }
}

export default function CrmPage() {
  const [filtro, setFiltro] = useState<'todos' | 'PF' | 'PJ'>('todos')

  const leads = LEADS.filter(l => filtro === 'todos' ? true : l.tipo === filtro)
  const byStage = (s: Stage) => leads.filter(l => l.estagio === s)

  const total    = LEADS.reduce((s, l) => s + l.valor, 0)
  const abertos  = LEADS.filter(l => l.estagio !== 'fechado').length
  const fechados = LEADS.filter(l => l.estagio === 'fechado')
  const ticket   = fechados.length ? fechados.reduce((s, l) => s + l.valor, 0) / fechados.length : 0
  const conv     = LEADS.length ? (fechados.length / LEADS.length) * 100 : 0

  const blockAction = () => toast('info', 'Modo demonstração · funcionalidade completa libera no release oficial')

  return (
    <div className="agent-page" style={{ maxWidth: 1400 }}>
      {/* DEMO ribbon */}
      <div className="demo-ribbon" style={{ position: 'relative', top: 'auto', borderRadius: 12, marginBottom: 28 }}>
        <strong style={{ fontWeight: 700, letterSpacing: '0.22em' }}>Modo demonstração</strong>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'none', fontFamily: 'var(--font-sans, system-ui)' }}>
          CRM em beta fechado · dados-exemplo para você sentir a forma antes do release
        </span>
        <a href="/dashboard/planos" className="demo-ribbon-link">Solicitar acesso antecipado</a>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'radial-gradient(120% 120% at 30% 20%, rgba(212,174,106,0.22), rgba(191,166,142,0.06) 70%)',
            border: '1px solid rgba(212,174,106,0.34)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            <Users size={26} style={{ color: 'var(--accent)' }} aria-hidden />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono, ui-monospace), monospace', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>
              Módulo · plataforma
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, color: 'var(--text-primary)', margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>
              CRM
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '6px 0 0', maxWidth: 560 }}>
              Funil de atendimento sob medida pro escritório — leads, qualificação, proposta, contrato. Uma peça por lead, sem ruído.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={blockAction}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Filter size={13} /> Filtros avançados
          </button>
          <button
            onClick={blockAction}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10,
              background: 'linear-gradient(135deg, #f5e8d3, var(--accent))',
              border: '1px solid rgba(212,174,106,0.5)', color: '#0a0a0a',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 24px rgba(212,174,106,0.22)',
            }}
          >
            <Plus size={14} /> Novo lead
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="kpi-grid">
        {[
          { icon: Flame,        label: 'Leads em aberto',        value: abertos.toString(),          caption: 'Últimos 30 dias' },
          { icon: TrendingUp,   label: 'Pipeline aberto',        value: fmtBRL(LEADS.filter(l => l.estagio !== 'fechado').reduce((s,l)=>s+l.valor,0)), caption: `${LEADS.filter(l => l.estagio !== 'fechado').length} casos` },
          { icon: CheckCircle2, label: 'Ticket médio fechado',   value: fmtBRL(ticket),              caption: `${fechados.length} contratos` },
          { icon: Target,       label: 'Conversão',              value: `${conv.toFixed(0)}%`,       caption: 'Lead → contrato' },
        ].map(({ icon: I, label, value, caption }, i) => (
          <div key={i} style={{
            padding: 18, borderRadius: 14,
            background: 'rgba(15,15,15,0.85)',
            border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-mono, ui-monospace), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {label}
              </div>
              <I size={14} style={{ color: 'var(--accent)' }} aria-hidden />
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{caption}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: 8 }}>
          Tipo
        </div>
        {(['todos', 'PF', 'PJ'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${filtro === t ? 'rgba(212,174,106,0.55)' : 'var(--border)'}`,
              background: filtro === t ? 'rgba(212,174,106,0.14)' : 'transparent',
              color: filtro === t ? 'var(--accent)' : 'var(--text-secondary)',
              fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'all 0.18s ease',
            }}
          >
            {t === 'todos' ? 'Todos' : t}
          </button>
        ))}
      </div>

      {/* Kanban pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }} className="kanban-grid">
        {STAGES.map(stage => {
          const items = byStage(stage.id)
          const total = items.reduce((s, l) => s + l.valor, 0)
          return (
            <div key={stage.id} style={{
              padding: 14, borderRadius: 12,
              background: 'rgba(10,10,10,0.5)',
              border: '1px solid var(--border)',
              minHeight: 420,
            }}>
              <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(191,166,142,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{stage.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, background: 'rgba(212,174,106,0.12)', padding: '2px 7px', borderRadius: 10 }}>
                    {items.length}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'var(--font-mono, ui-monospace), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {stage.caption}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmtBRL(total)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.length === 0 && (
                  <div style={{ padding: 18, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 11 }}>
                    Vazio
                  </div>
                )}
                {items.map(lead => {
                  const temp = tempColor(lead.temperatura)
                  return (
                    <button
                      key={lead.id}
                      onClick={blockAction}
                      style={{
                        textAlign: 'left', cursor: 'pointer',
                        padding: 12, borderRadius: 10,
                        background: 'rgba(18,18,18,0.92)',
                        border: '1px solid rgba(191,166,142,0.14)',
                        fontFamily: 'inherit',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(212,174,106,0.4)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(191,166,142,0.14)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {lead.nome}
                        </div>
                        <span style={{
                          fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                          background: temp.bg, border: `1px solid ${temp.bd}`, color: temp.fg,
                          letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0,
                        }}>
                          {lead.temperatura}
                        </span>
                      </div>
                      {lead.empresa && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{lead.empresa}</div>
                      )}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: 'rgba(191,166,142,0.08)', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                          {lead.tipo}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 500, padding: '2px 6px', borderRadius: 6, background: 'rgba(191,166,142,0.06)', color: 'var(--text-muted)' }}>
                          {lead.origem}
                        </span>
                      </div>
                      <div style={{
                        fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
                        fontSize: 18, color: 'var(--accent)', fontWeight: 600,
                        marginBottom: 8, letterSpacing: '-0.01em',
                      }}>
                        {fmtBRL(lead.valor)}
                      </div>
                      <div style={{
                        fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5,
                        padding: '6px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <Clock size={10} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{lead.proximaAcao}</span>
                        <ChevronRight size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </div>
                      <div style={{ marginTop: 8, fontFamily: 'var(--font-mono, ui-monospace), monospace', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                        {lead.dias}d no funil
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent activity */}
      <div style={{
        marginTop: 32, padding: 22, borderRadius: 14,
        background: 'rgba(15,15,15,0.85)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono, ui-monospace), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>
              Atividade recente
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 20, color: 'var(--text-primary)', fontWeight: 500 }}>
              últimas 24h no funil
            </div>
          </div>
          <button
            onClick={blockAction}
            style={{
              padding: '8px 14px', borderRadius: 10, background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--text-secondary)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Ver histórico completo →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: Phone,         text: 'Ligação agendada com Ricardo Menezes', meta: 'terça-feira · 14h', time: 'há 12 min' },
            { icon: Mail,          text: 'Proposta enviada para Orbis Construtora', meta: 'honorários R$ 68.000', time: 'há 1h' },
            { icon: MessageSquare, text: 'WhatsApp respondido por Luiza Fontana', meta: 'pediu apresentação', time: 'há 2h' },
            { icon: CheckCircle2,  text: 'Contrato assinado · Eduardo Siqueira',    meta: 'Siqueira Ltda · R$ 24.000', time: 'há 4h' },
            { icon: Calendar,      text: 'Reunião com Takeda Indústria concluída',  meta: 'jurídico aprovou escopo', time: 'há 6h' },
            { icon: UserRound,     text: 'Novo lead cadastrado · Clarice Vasconcellos', meta: 'origem: Google Ads', time: 'há 8h' },
          ].map((a, i) => {
            const I = a.icon
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(10,10,10,0.4)',
                border: '1px solid rgba(191,166,142,0.08)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(212,174,106,0.12)',
                  border: '1px solid rgba(212,174,106,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <I size={13} style={{ color: 'var(--accent)' }} aria-hidden />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2, lineHeight: 1.3 }}>
                    {a.text}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.meta}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono, ui-monospace), monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {a.time}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA footer */}
      <div style={{
        marginTop: 32, padding: 26, borderRadius: 14,
        background: 'radial-gradient(120% 140% at 20% 0%, rgba(212,174,106,0.14), transparent 60%), linear-gradient(180deg, rgba(18,14,6,0.88), rgba(10,10,10,0.92))',
        border: '1px solid rgba(212,174,106,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ fontFamily: 'var(--font-mono, ui-monospace), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
            Liberação prioritária · beta fechado
          </div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 24, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3, marginBottom: 8 }}>
            O CRM do escritório não é genérico. É um funil que fala jurídico.
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Importa contatos do seu email, conecta com WhatsApp Business, dispara follow-up por etapa, mede conversão por origem. Cada peça pensada pra quem vive de honorários.
          </div>
        </div>
        <a
          href="/dashboard/planos"
          style={{
            padding: '14px 22px', borderRadius: 12,
            background: 'linear-gradient(135deg, #f5e8d3, var(--accent), #7a5f48)',
            color: '#0a0a0a', textDecoration: 'none',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            boxShadow: '0 12px 32px rgba(212,174,106,0.24)',
            border: '1px solid rgba(212,174,106,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          Solicitar acesso
        </a>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .kanban-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .kpi-grid    { grid-template-columns: repeat(2, 1fr) !important; }
          .kanban-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
