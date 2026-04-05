'use client'

import { useState } from 'react'

const PLANOS = [
  {
    id: 'starter', nome: 'Starter', preco: 47, destaque: false,
    features: [
      { label: 'Agentes disponiveis', valor: '3 (Resumidor, Pesquisador, Professor)', disponivel: true },
      { label: 'Documentos/mes', valor: '50', disponivel: true },
      { label: 'Suporte', valor: 'FAQ apenas', disponivel: true },
      { label: 'API propria', valor: '', disponivel: false },
      { label: 'Exportacao PDF', valor: '', disponivel: false },
      { label: 'Historico', valor: '30 dias', disponivel: true },
      { label: 'Modelos customizados', valor: '', disponivel: false },
    ],
  },
  {
    id: 'pro', nome: 'Pro', preco: 97, destaque: true,
    features: [
      { label: 'Agentes disponiveis', valor: '6 (todos os basicos)', disponivel: true },
      { label: 'Documentos/mes', valor: '200', disponivel: true },
      { label: 'Suporte', valor: 'Email (48h)', disponivel: true },
      { label: 'API propria', valor: '', disponivel: false },
      { label: 'Exportacao PDF', valor: '', disponivel: true },
      { label: 'Historico', valor: '90 dias', disponivel: true },
      { label: 'Modelos customizados', valor: '', disponivel: false },
    ],
  },
  {
    id: 'enterprise', nome: 'Enterprise', preco: 197, destaque: false,
    features: [
      { label: 'Agentes disponiveis', valor: '8 (todos + exclusivos)', disponivel: true },
      { label: 'Documentos/mes', valor: 'Ilimitado', disponivel: true },
      { label: 'Suporte', valor: 'Prioritario (24h) + WhatsApp', disponivel: true },
      { label: 'API propria', valor: '', disponivel: true },
      { label: 'Exportacao PDF', valor: '', disponivel: true },
      { label: 'Historico', valor: 'Ilimitado', disponivel: true },
      { label: 'Modelos customizados', valor: '', disponivel: true },
    ],
  },
]

export default function PlanosPage() {
  const [planoAtual] = useState('pro')

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 className="page-title" style={{ fontSize: 32 }}>Planos LexAI</h1>
        <p className="page-subtitle" style={{ maxWidth: 500, margin: '8px auto 0' }}>
          Escolha o plano ideal para sua pratica juridica. Upgrade ou downgrade a qualquer momento.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        {PLANOS.map(plano => (
          <div key={plano.id} className="section-card animate-in" style={{
            padding: 0, overflow: 'hidden', position: 'relative',
            border: plano.destaque ? '2px solid var(--accent)' : '1px solid var(--border)',
            boxShadow: plano.destaque ? '0 8px 32px rgba(201,168,76,0.15)' : undefined,
          }}>
            {/* Popular badge */}
            {plano.destaque && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                background: 'linear-gradient(135deg, #c9a84c, #d4b86a)',
                padding: '6px 0', textAlign: 'center',
                fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                color: '#0f1923',
              }}>
                MAIS POPULAR
              </div>
            )}

            <div style={{ padding: plano.destaque ? '52px 24px 28px' : '28px 24px' }}>
              {/* Name + price */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{plano.nome}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>R$</span>
                  <span style={{ fontSize: 40, fontWeight: 800, color: plano.destaque ? 'var(--accent)' : 'var(--text-primary)', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{plano.preco}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/mes</span>
                </div>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {plano.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11,
                      background: f.disponivel ? 'var(--success-light)' : 'var(--hover)',
                      color: f.disponivel ? 'var(--success)' : 'var(--text-muted)',
                    }}>
                      <i className={`bi ${f.disponivel ? 'bi-check' : 'bi-x'}`} />
                    </span>
                    <span style={{ color: f.disponivel ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: f.disponivel ? 500 : 400 }}>
                      {f.label}{f.valor ? `: ${f.valor}` : ''}
                    </span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button style={{
                width: '100%', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: plano.id === planoAtual ? 'var(--hover)' : plano.destaque ? 'linear-gradient(135deg, #c9a84c, #d4b86a)' : 'var(--primary)',
                color: plano.id === planoAtual ? 'var(--text-muted)' : plano.destaque ? '#0f1923' : '#fff',
                border: plano.id === planoAtual ? '1px solid var(--border)' : 'none',
              }} disabled={plano.id === planoAtual}>
                {plano.id === planoAtual ? 'Plano Atual' : plano.preco > 97 ? 'Fazer Upgrade' : plano.preco < 97 ? 'Mudar Plano' : 'Assinar Pro'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="section-card" style={{ padding: '24px 28px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Perguntas Frequentes</div>
        {[
          { q: 'Posso trocar de plano a qualquer momento?', a: 'Sim, voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. A diferenca sera calculada proporcionalmente.' },
          { q: 'Como funciona o limite de documentos?', a: 'Cada analise de documento, pesquisa ou geracao de peca conta como 1 documento. O contador reseta no inicio de cada mes.' },
          { q: 'O que acontece quando atinjo o limite?', a: 'Voce recebera um aviso e podera fazer upgrade do plano ou aguardar o proximo ciclo mensal.' },
          { q: 'Os agentes IA sao diferentes entre os planos?', a: 'Sim. O plano Starter inclui 3 agentes basicos. O Pro inclui 6 agentes. O Enterprise inclui todos os 8 agentes atuais e acesso prioritario a novos agentes.' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{item.q}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ textAlign: 'center', marginTop: 24, padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        Duvidas? Entre em contato: luizfernandoleonardoleonardo@gmail.com | (34) 99302-6456
      </div>
    </div>
  )
}
