'use client'

import { useState } from 'react'

interface Parecer {
  ementa: string
  fatos: string
  questao_juridica: string
  fundamentacao_legal: string
  doutrina_aplicavel: string
  jurisprudencia_relevante: string
  conclusao_recomendacao: string
  disclaimer: string
}

const AREAS_DIREITO = [
  'Civil',
  'Penal',
  'Trabalhista',
  'Tributario',
  'Empresarial',
  'Ambiental',
  'Digital',
  'Consumidor',
  'Administrativo',
  'Constitucional',
]

const TIPOS_PARECER = [
  { value: '', label: 'Selecionar (opcional)' },
  { value: 'Consultivo', label: 'Consultivo' },
  { value: 'Contencioso', label: 'Contencioso' },
  { value: 'Preventivo', label: 'Preventivo' },
  { value: 'Regulatorio', label: 'Regulatorio' },
]

const EXEMPLOS = [
  { tema: 'Responsabilidade civil por vazamento de dados', area: 'Digital', contexto: 'Empresa de tecnologia sofreu incidente de seguranca que expôs dados pessoais de 5.000 clientes. A empresa notificou a ANPD em 48h, mas nao comunicou os titulares afetados. Um grupo de clientes acionou o Procon e ameaca acao coletiva.' },
  { tema: 'Rescisao indireta por assedio moral', area: 'Trabalhista', contexto: 'Funcionario com 8 anos de empresa relata situacoes reiteradas de humilhacao pelo superior hierarquico, incluindo exposicao publica de erros, ameacas veladas de demissao e isolamento da equipe. Possui prints de mensagens e duas testemunhas.' },
  { tema: 'Exclusao de socio minoritario', area: 'Empresarial', contexto: 'Sociedade limitada com 3 socios. Socio minoritario (15%) descobriu que os majoritarios desviaram R$ 400 mil em contratos simulados com empresa de fachada. O contrato social preve clausula de arbitragem, mas nao ha clausula especifica sobre exclusao.' },
]

export default function PareceristaPage() {
  const [area, setArea] = useState(AREAS_DIREITO[0])
  const [tema, setTema] = useState('')
  const [contexto, setContexto] = useState('')
  const [tipoParecer, setTipoParecer] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [parecer, setParecer] = useState<Parecer | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function gerarParecer() {
    if (loading || !tema.trim() || !contexto.trim()) return
    setLoading(true)
    setErro('')
    setParecer(null)

    try {
      const res = await fetch('/api/simulado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          tema: tema.trim(),
          contexto: contexto.trim(),
          tipo_parecer: tipoParecer || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (!data.parecer) {
        throw new Error('O parecer nao foi gerado corretamente. Tente novamente.')
      }
      setParecer(data.parecer)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar parecer')
    } finally {
      setLoading(false)
    }
  }

  function novoParecer() {
    setParecer(null)
    setErro('')
  }

  function preencherExemplo(exemplo: typeof EXEMPLOS[number]) {
    setArea(exemplo.area)
    setTema(exemplo.tema)
    setContexto(exemplo.contexto)
    setTipoParecer('')
    setParecer(null)
    setErro('')
  }

  function copiarSecao(texto: string, id: string) {
    navigator.clipboard.writeText(texto)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function copiarParecerCompleto() {
    if (!parecer) return
    const texto = [
      '=== PARECER JURIDICO ===',
      '',
      'EMENTA',
      parecer.ementa,
      '',
      'FATOS',
      parecer.fatos,
      '',
      'QUESTAO JURIDICA',
      parecer.questao_juridica,
      '',
      'FUNDAMENTACAO LEGAL',
      parecer.fundamentacao_legal,
      '',
      'DOUTRINA APLICAVEL',
      parecer.doutrina_aplicavel,
      '',
      'JURISPRUDENCIA RELEVANTE',
      parecer.jurisprudencia_relevante,
      '',
      'CONCLUSAO E RECOMENDACAO',
      parecer.conclusao_recomendacao,
      '',
      '---',
      parecer.disclaimer,
    ].join('\n')
    copiarSecao(texto, 'completo')
  }

  const secoesParecer = parecer ? [
    { id: 'ementa', titulo: 'Ementa', conteudo: parecer.ementa, icone: 'bi-bookmark' },
    { id: 'fatos', titulo: 'Fatos', conteudo: parecer.fatos, icone: 'bi-list-check' },
    { id: 'questao', titulo: 'Questao juridica', conteudo: parecer.questao_juridica, icone: 'bi-question-circle' },
    { id: 'fundamentacao', titulo: 'Fundamentacao legal', conteudo: parecer.fundamentacao_legal, icone: 'bi-journal-text' },
    { id: 'doutrina', titulo: 'Doutrina aplicavel', conteudo: parecer.doutrina_aplicavel, icone: 'bi-book' },
    { id: 'jurisprudencia', titulo: 'Jurisprudencia relevante', conteudo: parecer.jurisprudencia_relevante, icone: 'bi-building' },
    { id: 'conclusao', titulo: 'Conclusao e recomendacao', conteudo: parecer.conclusao_recomendacao, icone: 'bi-check-circle' },
  ] : []

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Parecerista</h1>
        <p className="page-subtitle" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 16, color: 'var(--text-muted)' }}>
          Pareceres juridicos estruturados
        </p>
      </div>

      {/* Formulario */}
      {!parecer && !loading && (
        <>
          <div className="section-card" style={{ padding: '24px 28px', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 20 }}>
              <i className="bi bi-file-earmark-text" style={{ marginRight: 6 }} />Configurar parecer
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="parecer-form-grid">
              {/* Area do Direito */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Area do Direito
                </label>
                <select
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {AREAS_DIREITO.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de parecer */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Tipo de parecer <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
                </label>
                <select
                  value={tipoParecer}
                  onChange={e => setTipoParecer(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {TIPOS_PARECER.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tema do parecer */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Tema do parecer
              </label>
              <input
                type="text"
                value={tema}
                onChange={e => setTema(e.target.value)}
                maxLength={500}
                placeholder="Ex: Responsabilidade civil por vazamento de dados"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            {/* Contexto e fatos relevantes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Contexto e fatos relevantes
              </label>
              <textarea
                value={contexto}
                onChange={e => setContexto(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="Descreva a situacao fatica, as partes envolvidas, e os fatos relevantes para a analise juridica..."
                className="form-input"
                style={{ width: '100%', resize: 'vertical', minHeight: 120, lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                {contexto.length}/5000
              </div>
            </div>

            <button
              onClick={gerarParecer}
              disabled={loading || !tema.trim() || !contexto.trim()}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600, opacity: (!tema.trim() || !contexto.trim()) ? 0.5 : 1 }}
            >
              <i className="bi bi-file-earmark-text" style={{ marginRight: 8 }} />
              Gerar Parecer
            </button>
          </div>

          {/* Exemplos rapidos */}
          <div className="section-card" style={{ padding: '20px 24px', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 14 }}>
              <i className="bi bi-lightning" style={{ marginRight: 6 }} />Exemplos rapidos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {EXEMPLOS.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => preencherExemplo(ex)}
                  className="parecer-exemplo-btn"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {ex.tema}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Direito {ex.area}
                    </div>
                  </div>
                  <i className="bi bi-arrow-right" style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Erro */}
      {erro && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-exclamation-triangle-fill" /> {erro}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Elaborando parecer...</div>
          <div style={{ fontSize: 13 }}>Analisando {tema} na area de Direito {area}</div>
        </div>
      )}

      {/* Parecer gerado */}
      {parecer && (
        <>
          {/* Cabecalho do parecer */}
          <div className="section-card" style={{ padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-file-earmark-text" style={{ fontSize: 18, color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{tema}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Direito {area} {tipoParecer ? `\u00B7 ${tipoParecer}` : ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={copiarParecerCompleto}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '8px 16px' }}
              >
                <i className={`bi ${copied === 'completo' ? 'bi-check2' : 'bi-clipboard'}`} style={{ marginRight: 6 }} />
                {copied === 'completo' ? 'Copiado' : 'Copiar tudo'}
              </button>
              <button type="button" onClick={novoParecer} className="btn-secondary" style={{ fontSize: 12, padding: '8px 16px' }}>
                <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 6 }} />Novo parecer
              </button>
            </div>
          </div>

          {/* Secoes do parecer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {secoesParecer.map((secao) => (
              <div key={secao.id} className="section-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: 'var(--accent-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={`bi ${secao.icone}`} style={{ fontSize: 13, color: 'var(--accent)' }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      {secao.titulo}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copiarSecao(secao.conteudo, secao.id)}
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <i className={`bi ${copied === secao.id ? 'bi-check2' : 'bi-clipboard'}`} />
                    {copied === secao.id ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {secao.conteudo}
                </div>
              </div>
            ))}

            {/* Disclaimer */}
            {parecer.disclaimer && (
              <div style={{
                padding: '14px 18px', borderRadius: 10,
                background: 'var(--accent-light)',
                borderLeft: '3px solid var(--accent)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <i className="bi bi-info-circle" style={{ fontSize: 13, color: 'var(--accent)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>
                    Aviso importante
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {parecer.disclaimer}
                </p>
              </div>
            )}
          </div>

          {/* Botao final */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button type="button" onClick={novoParecer} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
              <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 8 }} />
              Gerar novo parecer
            </button>
          </div>
        </>
      )}

      {/* Estado vazio */}
      {!parecer && !loading && !erro && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--accent-light)', color: 'var(--accent)',
            fontSize: 32, marginBottom: 16,
          }}>
            <i className="bi bi-file-earmark-text" />
          </div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Gere pareceres juridicos estruturados</div>
          <div style={{ fontSize: 13 }}>Preencha a area, o tema e o contexto acima para gerar seu parecer</div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .parecer-exemplo-btn:hover {
          border-color: var(--accent) !important;
          background: var(--hover) !important;
        }
        @media (max-width: 768px) {
          .parecer-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
