import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F1F1F1', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #141414, #2A2A2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(59,130,246,0.20)' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>LX</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>LexAI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500 }}>Entrar</Link>
          <Link href="/login" style={{ fontSize: 14, color: '#fff', background: '#2563EB', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            Comecar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#3B82F6', marginBottom: 20, padding: '6px 14px', borderRadius: 20, background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.15)' }}>
          2 dias gratis &middot; Sem cartao
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
          Seu escritorio juridico<br />
          <span style={{ color: '#3B82F6' }}>potencializado por IA</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
          10 agentes de inteligencia artificial especializados em Direito brasileiro. Analise documentos, pesquise jurisprudencia e gere pecas processuais em minutos.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/login" style={{ fontSize: 16, color: '#fff', background: '#2563EB', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, boxShadow: '0 4px 16px rgba(37,99,235,0.30)' }}>
            Comecar gratis por 2 dias
          </Link>
          <a href="#agentes" style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 500, border: '1px solid rgba(255,255,255,0.12)' }}>
            Ver agentes
          </a>
        </div>
      </section>

      {/* Stats */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: '40px 24px 60px' }}>
        {[
          { value: '10', label: 'Agentes IA' },
          { value: '200+', label: 'Documentos revisados' },
          { value: '99.9%', label: 'Disponibilidade' },
          { value: '2 dias', label: 'Trial gratuito' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#3B82F6', letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Agentes */}
      <section id="agentes" style={{ padding: '60px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>10 agentes especializados</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto' }}>Cada agente e treinado com prompts elite para Direito brasileiro</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { name: 'Resumidor', desc: 'Analise completa de documentos juridicos com riscos e fundamentacao', color: '#2563EB' },
            { name: 'Redator', desc: 'Gere peticoes, recursos, contestacoes e pareceres completos', color: '#F59E0B' },
            { name: 'Pesquisador', desc: 'Pesquise jurisprudencia do STF, STJ e tribunais estaduais', color: '#EC4899' },
            { name: 'Negociador', desc: 'Estrategia BATNA/ZOPA com cenarios e proposta de acordo', color: '#8B5CF6' },
            { name: 'Professor', desc: 'Aulas em 3 niveis com questoes estilo OAB/concursos', color: '#06B6D4' },
            { name: 'Calculador', desc: 'Prazos processuais, correcao monetaria, juros e custas', color: '#10B981' },
            { name: 'Legislacao', desc: 'Artigos de lei explicados com exemplos e jurisprudencia', color: '#6366F1' },
            { name: 'Rotina', desc: 'Organize sua agenda de aulas, estagios e compromissos', color: '#F97316' },
          ].map((ag, i) => (
            <div key={i} style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 10, height: 40, borderRadius: 5, background: ag.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{ag.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{ag.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12, color: '#fff' }}>O que nossos usuarios dizem</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>Resultados reais de quem ja usa LexAI</p>
        </div>
        <div className="depoimentos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            {
              name: 'Mariana Castro',
              cargo: 'Advogada Civil - SP',
              quote: 'Em 2 semanas economizei mais de 20 horas que eu gastava em pesquisa de jurisprudencia. O Pesquisador encontra acordaos que eu nem sabia que existiam.',
              color: '#2563EB',
              initials: 'MC',
            },
            {
              name: 'Lucas Ferreira',
              cargo: 'Estudante OAB - RJ',
              quote: 'O Professor explica conceitos juridicos como nenhum livro consegue. Passei na 1a fase da OAB de primeira usando os planos de estudo personalizados.',
              color: '#10B981',
              initials: 'LF',
            },
            {
              name: 'Renata Lima',
              cargo: 'Socia - Lima Advocacia',
              quote: 'Substituiu 2 estagiarios e ainda entrega mais rapido. O Redator gera peticoes que so precisam de pequenos ajustes. Investimento que se pagou em 1 mes.',
              color: '#8B5CF6',
              initials: 'RL',
            },
          ].map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[0,1,2,3,4].map((s) => (
                  <i key={s} className="bi bi-star-fill" style={{ color: '#F59E0B', fontSize: 14 }} />
                ))}
              </div>
              <p style={{
                fontStyle: 'italic',
                fontSize: 14,
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color}, ${t.color}CC)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{t.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 768px) {
            .depoimentos-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 48px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>Planos simples e transparentes</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)' }}>Comece gratis por 2 dias. Cancele quando quiser.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { name: 'Starter', price: '59', agents: '3 agentes', docs: '50 docs/mes', features: ['Resumidor, Pesquisador, Professor', 'Suporte FAQ', 'Historico 30 dias'] },
            { name: 'Pro', price: '119', agents: '6 agentes', docs: '200 docs/mes', popular: true, features: ['Todos os basicos', 'Exportacao PDF', 'Email 48h', 'Historico 90 dias'] },
            { name: 'Enterprise', price: '239', agents: '10 agentes', docs: 'Ilimitado', features: ['Todos + exclusivos', 'API propria', 'WhatsApp 24h', 'Historico ilimitado', 'Modelos customizados'] },
          ].map((plan, i) => (
            <div key={i} style={{
              padding: '32px 28px', borderRadius: 20, textAlign: 'center',
              background: plan.popular ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.03)',
              border: plan.popular ? '1px solid rgba(37,99,235,0.25)' : '1px solid rgba(255,255,255,0.06)',
            }}>
              {plan.popular && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#3B82F6', marginBottom: 12 }}>MAIS POPULAR</div>}
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>R$</span>
                <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-2px' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/mes</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 24 }}>{plan.agents} &middot; {plan.docs}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 24 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: '#10B981', fontSize: 14 }}>&#10003;</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/login" style={{
                display: 'block', padding: '12px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14,
                background: plan.popular ? '#2563EB' : 'transparent',
                color: plan.popular ? '#fff' : 'rgba(255,255,255,0.7)',
                border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.15)',
              }}>
                Comecar gratis
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px', marginBottom: 16 }}>Pronto para transformar sua pratica juridica?</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>Junte-se a advogados e estudantes que ja usam IA no dia a dia.</p>
        <Link href="/login" style={{ fontSize: 16, color: '#fff', background: '#2563EB', padding: '14px 36px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, boxShadow: '0 4px 16px rgba(37,99,235,0.30)' }}>
          Comecar agora &mdash; 2 dias gratis
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.30)' }}>2026 LexAI. Powered by LexAI</div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>luizfernandoleonardoleonardo@gmail.com</span>
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>(34) 99302-6456</span>
        </div>
      </footer>
    </div>
  )
}
