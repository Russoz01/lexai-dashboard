import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LexAI para Escritorios e Bancas | Solucoes B2B',
  description: 'Transforme seu escritorio em uma maquina de eficiencia juridica. Acesso ilimitado a 10 agentes IA, API propria, suporte WhatsApp 24h e onboarding dedicado. A partir de R$ 239/mes.',
  keywords: 'lexai empresas, ia para escritorios, b2b direito, bancas juridicas, api juridica',
  alternates: { canonical: 'https://lexai.com.br/empresas' },
}

const CALENDLY_URL = 'https://calendly.com/lexai/demo'

export default function EmpresasPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#132025', color: '#F3EEE4', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#F1F1F1' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #132025, #18282e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(191,166,142,0.22)' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>LX</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>LexAI</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500 }}>Inicio</Link>
          <Link href="/login" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500 }}>Entrar</Link>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#132025', background: '#bfa68e', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            Agendar demo
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 60px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#bfa68e', marginBottom: 20, padding: '6px 14px', borderRadius: 20, background: 'rgba(191,166,142,0.12)', border: '1px solid rgba(191,166,142,0.18)' }}>
          <i className="bi bi-building" />LexAI para escritorios e bancas
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
          Transforme seu escritorio em uma<br />
          <span style={{ color: '#bfa68e' }}>maquina de eficiencia juridica</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 36px' }}>
          Acesso ilimitado a 10 agentes IA especializados, API propria, integracao por webhooks e onboarding dedicado. Feito para escritorios, bancas e departamentos juridicos que querem escalar sem abrir mao da qualidade.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 16, color: '#132025', background: '#bfa68e', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, boxShadow: '0 4px 16px rgba(191,166,142,0.32)' }}>
            <i className="bi bi-calendar-check" style={{ marginRight: 8 }} />Agendar demonstracao
          </a>
          <a href="#casos" style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 500, border: '1px solid rgba(255,255,255,0.12)' }}>
            Ver casos de uso
          </a>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { value: '10x', label: 'mais rapido', icon: 'bi-lightning-charge-fill', color: '#bfa68e' },
            { value: '20h', label: 'economizadas/semana por advogado', icon: 'bi-clock-history', color: '#10B981' },
            { value: '8x', label: 'ROI medio em 12 meses', icon: 'bi-graph-up-arrow', color: '#F59E0B' },
            { value: '24h', label: 'Setup completo', icon: 'bi-rocket-takeoff', color: '#EC4899' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '28px 24px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, margin: '0 auto 14px',
                background: `${s.color}15`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 20 }} />
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12, color: '#fff' }}>Recursos exclusivos Enterprise</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto' }}>
            Tudo que um escritorio precisa para escalar com seguranca e controle total sobre o fluxo de trabalho.
          </p>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            {
              icon: 'bi-stars',
              title: 'Acesso ilimitado a 10 agentes',
              desc: 'Todos os agentes especializados disponiveis sem limite de uso: Resumidor, Redator, Pesquisador, Negociador, Professor, Calculador, Legislacao, Rotina, Financeiro e Compliance.',
              color: '#bfa68e',
            },
            {
              icon: 'bi-code-slash',
              title: 'API propria + webhooks',
              desc: 'Integre a LexAI aos seus sistemas internos: CRM juridico, SAJ, Projuris, Astrea. Webhooks para automacao de fluxos e endpoints REST documentados.',
              color: '#8B5CF6',
            },
            {
              icon: 'bi-whatsapp',
              title: 'Suporte WhatsApp 24h',
              desc: 'Canal direto com nossa equipe de suporte tecnico via WhatsApp Business, 7 dias por semana. SLA de resposta em ate 30 minutos em horario comercial.',
              color: '#25D366',
            },
            {
              icon: 'bi-person-video3',
              title: 'Onboarding dedicado',
              desc: 'Sessoes de treinamento ao vivo com sua equipe, customizacao inicial dos agentes para seu nicho e acompanhamento nos primeiros 30 dias por gerente de conta.',
              color: '#EC4899',
            },
            {
              icon: 'bi-sliders2',
              title: 'Modelos customizados',
              desc: 'Prompts e fluxos personalizados com base nos padroes do seu escritorio: modelos de peticao, teses recorrentes, jurisprudencia favorita e glossario interno.',
              color: '#F59E0B',
            },
            {
              icon: 'bi-shield-check',
              title: 'SLA garantido',
              desc: 'Contrato com SLA de 99,9% de disponibilidade, backup diario, criptografia em repouso e em transito, alem de compliance LGPD com DPO dedicado.',
              color: '#10B981',
            },
          ].map((f, i) => (
            <div key={i} style={{
              padding: '28px 24px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                background: `${f.color}15`, border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: 20 }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.3px' }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Casos de uso */}
      <section id="casos" style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12, color: '#fff' }}>Feito para seu perfil</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>Tres personas que ja transformaram a rotina com a LexAI.</p>
        </div>
        <div className="cases-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            {
              icon: 'bi-briefcase-fill',
              persona: 'Banca de Direito Civil',
              size: '5-15 advogados',
              color: '#bfa68e',
              pains: 'Alto volume de contratos, revisao lenta, risco de passar clausulas abusivas.',
              solution: 'Resumidor analisa contratos em 30s apontando clausulas sensiveis. Redator gera minutas padronizadas. Pesquisador encontra jurisprudencia atual para fundamentar.',
            },
            {
              icon: 'bi-hammer',
              persona: 'Advocacia Trabalhista',
              size: '3-10 advogados',
              color: '#F59E0B',
              pains: 'Calculos de verbas rescisorias complexos, prazos apertados e grande volume de audiencias.',
              solution: 'Calculador apura verbas com correcao e juros automaticos. Rotina organiza pautas e prazos. Negociador prepara estrategias BATNA/ZOPA para acordos.',
            },
            {
              icon: 'bi-building-fill',
              persona: 'Departamento Juridico',
              size: 'Empresas medias/grandes',
              color: '#10B981',
              pains: 'Alto volume de demandas internas, padronizacao entre areas, compliance regulatorio.',
              solution: 'API integrada ao SLA interno. Compliance monitora mudancas regulatorias. Modelos customizados garantem padronizacao entre times de contratos, trabalhista e contencioso.',
            },
          ].map((c, i) => (
            <div key={i} style={{
              padding: '32px 28px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${c.color}15`, border: `1px solid ${c.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`bi ${c.icon}`} style={{ color: c.color, fontSize: 24 }} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.3px' }}>{c.persona}</h3>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{c.size}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Dor</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{c.pains}</p>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Solucao LexAI</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>{c.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ padding: '80px 48px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          padding: '48px 40px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(191,166,142,0.12), rgba(68,55,43,0.08))',
          border: '1px solid rgba(191,166,142,0.22)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#bfa68e', marginBottom: 12 }}>
            Plano Enterprise
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginBottom: 12 }}>
            A partir de <span style={{ color: '#bfa68e' }}>R$ 239/mes</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Personalizado para o tamanho e as necessidades do seu escritorio. Desconto progressivo por volume de usuarios e condicoes especiais para parceiros.
          </p>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 16, color: '#132025', background: '#bfa68e', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 600,
            boxShadow: '0 4px 16px rgba(191,166,142,0.32)',
          }}>
            <i className="bi bi-calendar-check" />Agendar demonstracao gratuita
          </a>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 14 }}>
            Call de 30 minutos &middot; Sem compromisso &middot; Proposta em ate 24h
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16, color: '#fff' }}>
          Pronto para conhecer a LexAI na pratica?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 32, lineHeight: 1.6 }}>
          Agende uma demonstracao ao vivo e veja como os 10 agentes podem acelerar sua operacao juridica. Sem compromisso de assinatura.
        </p>
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 17, color: '#132025', background: '#bfa68e', padding: '16px 40px', borderRadius: 12, textDecoration: 'none', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(191,166,142,0.32)',
        }}>
          <i className="bi bi-calendar-check" />Agendar demonstracao
        </a>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.30)' }}>© 2026 LexAI · uma marca <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Vanix Corp</strong></div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Inicio</Link>
            <Link href="/empresas" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Para Empresas</Link>
            <Link href="/privacidade" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Privacidade (LGPD)</Link>
            <Link href="/termos" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Termos de Uso</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>luizfernandoleonardoleonardo@gmail.com</span>
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>(34) 99302-6456</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cases-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          nav { padding: 16px 20px !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
          h1 { font-size: 36px !important; }
          h2 { font-size: 28px !important; }
        }
      `}</style>
    </div>
  )
}
