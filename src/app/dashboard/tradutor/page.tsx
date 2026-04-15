'use client'

import { useState } from 'react'

interface TradutorResult {
  traducao: string
  notas: string
  alertas: string
  confianca: number
}

const IDIOMAS_ORIGEM = ['Inglês (EN)', 'Espanhol (ES)', 'Francês (FR)', 'Português (PT)']

const IDIOMAS_DESTINO = ['Português (PT)', 'Inglês (EN)', 'Espanhol (ES)', 'Francês (FR)']

const TIPOS_DOC = [
  'Contrato internacional',
  'Tratado',
  'Procuracao',
  'Decisao judicial estrangeira',
  'Parecer',
  'Outro',
]

const EXEMPLOS = [
  {
    label: 'Cláusula de confidencialidade',
    origem: 'Inglês (EN)',
    destino: 'Português (PT)',
    tipo: 'Contrato internacional',
    texto: 'The receiving party agrees to hold all Confidential Information in strict confidence and shall not disclose such information to any third party without the prior written consent of the disclosing party.',
  },
  {
    label: 'Cláusula de arbitragem',
    origem: 'Inglês (EN)',
    destino: 'Português (PT)',
    tipo: 'Contrato internacional',
    texto: 'Any dispute arising out of or in connection with this contract shall be referred to and finally resolved by arbitration under the ICC Rules. The seat of arbitration shall be São Paulo, Brazil.',
  },
  {
    label: 'Force Majeure',
    origem: 'Inglês (EN)',
    destino: 'Português (PT)',
    tipo: 'Contrato internacional',
    texto: "Neither party shall be liable for failure to perform its obligations if such failure is caused by circumstances beyond the party reasonable control, including acts of God, war, terrorism, or government actions.",
  },
]

type TabKey = 'traducao' | 'notas' | 'alertas'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'traducao', label: 'Traducao' },
  { key: 'notas', label: 'Notas Terminologicas' },
  { key: 'alertas', label: 'Alertas Juridicos' },
]

export default function TradutorPage() {
  const [origem, setOrigem] = useState(IDIOMAS_ORIGEM[0])
  const [destino, setDestino] = useState(IDIOMAS_DESTINO[0])
  const [tipo, setTipo] = useState(TIPOS_DOC[0])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<TradutorResult | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('traducao')
  const [copied, setCopied] = useState(false)

  async function traduzir() {
    if (loading || !texto.trim()) return
    setLoading(true)
    setErro('')
    setResultado(null)

    try {
      const res = await fetch('/api/tradutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origem, destino, tipo, texto: texto.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (!data.parecer) {
        throw new Error('A tradução não foi gerada corretamente. Tente novamente.')
      }
      setResultado(data.parecer as TradutorResult)
      setActiveTab('traducao')
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao traduzir documento')
    } finally {
      setLoading(false)
    }
  }

  function novaTraducao() {
    setResultado(null)
    setErro('')
  }

  function preencherExemplo(ex: typeof EXEMPLOS[number]) {
    setOrigem(ex.origem)
    setDestino(ex.destino)
    setTipo(ex.tipo)
    setTexto(ex.texto)
    setResultado(null)
    setErro('')
  }

  function copiarResultado() {
    if (!resultado) return
    const conteudo = [
      '=== TRADUCAO JURIDICA ===',
      '',
      `${origem} → ${destino} | ${tipo}`,
      '',
      'TRADUCAO',
      resultado.traducao,
      '',
      'NOTAS TERMINOLOGICAS',
      resultado.notas,
      '',
      'ALERTAS JURIDICOS',
      resultado.alertas,
    ].join('\n')
    navigator.clipboard.writeText(conteudo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getTabContent(): string {
    if (!resultado) return ''
    if (activeTab === 'traducao') return resultado.traducao ?? ''
    if (activeTab === 'notas') return resultado.notas ?? ''
    if (activeTab === 'alertas') return resultado.alertas ?? ''
    return ''
  }

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
        <h1 className="page-title">Tradutor Juridico</h1>
        <p className="page-subtitle" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 16, color: 'var(--text-muted)' }}>
          Traducao tecnica de contratos, tratados e documentos internacionais
        </p>
      </div>

      {/* Formulario */}
      {!resultado && !loading && (
        <>
          <div className="section-card" style={{ padding: '24px 28px', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 20 }}>
              <i className="bi bi-translate" style={{ marginRight: 6 }} />Configurar traducao
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }} className="tradutor-form-grid">
              {/* Idioma de origem */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Idioma de origem
                </label>
                <select
                  value={origem}
                  onChange={e => setOrigem(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {IDIOMAS_ORIGEM.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              {/* Idioma de destino */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Idioma de destino
                </label>
                <select
                  value={destino}
                  onChange={e => setDestino(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {IDIOMAS_DESTINO.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de documento */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Tipo de documento
                </label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {TIPOS_DOC.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Texto a traduzir */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Cole o texto a traduzir
              </label>
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                maxLength={8000}
                rows={8}
                placeholder="Cole aqui o trecho ou documento juridico que deseja traduzir..."
                className="form-input"
                style={{ width: '100%', resize: 'vertical', minHeight: 180, lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                {texto.length}/8000
              </div>
            </div>

            <button
              onClick={traduzir}
              disabled={loading || !texto.trim()}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600, opacity: !texto.trim() ? 0.5 : 1 }}
            >
              <i className="bi bi-translate" style={{ marginRight: 8 }} />
              Traduzir documento
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
                  className="tradutor-exemplo-btn"
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
                      {ex.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {ex.origem} → {ex.destino} · {ex.tipo}
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
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Traduzindo documento...</div>
          <div style={{ fontSize: 13 }}>Processando {tipo} de {origem} para {destino}</div>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <>
          {/* Cabecalho do resultado */}
          <div className="section-card" style={{ padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-translate" style={{ fontSize: 18, color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{tipo}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {origem} → {destino}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={copiarResultado}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '8px 16px' }}
              >
                <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`} style={{ marginRight: 6 }} />
                {copied ? 'Copiado' : 'Copiar tudo'}
              </button>
              <button type="button" onClick={novaTraducao} className="btn-secondary" style={{ fontSize: 12, padding: '8px 16px' }}>
                <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 6 }} />Nova traducao
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="section-card" style={{ padding: 0, marginBottom: 32, overflow: 'hidden' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '12px 20px',
                    fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                    color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1, whiteSpace: 'nowrap',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'color 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {getTabContent() || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhuma informacao disponivel para esta secao.</span>}
              </div>
              {activeTab === 'traducao' && resultado.confianca != null && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                  Confianca da traducao: {Math.round(resultado.confianca * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Aviso */}
          <div style={{
            padding: '14px 18px', borderRadius: 10,
            background: 'var(--accent-light)',
            borderLeft: '3px solid var(--accent)',
            marginBottom: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <i className="bi bi-info-circle" style={{ fontSize: 13, color: 'var(--accent)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>
                Aviso importante
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Esta traducao foi gerada por inteligencia artificial para fins informativos. Documentos juridicos com efeitos legais devem ser revisados por tradutor juridico juramentado ou advogado habilitado nas jurisdicoes pertinentes.
            </p>
          </div>

          {/* Botao final */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button type="button" onClick={novaTraducao} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
              <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 8 }} />
              Nova traducao
            </button>
          </div>
        </>
      )}

      {/* Estado vazio */}
      {!resultado && !loading && !erro && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--accent-light)', color: 'var(--accent)',
            fontSize: 32, marginBottom: 16,
          }}>
            <i className="bi bi-translate" />
          </div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Traduza documentos juridicos com precisao tecnica</div>
          <div style={{ fontSize: 13 }}>Selecione os idiomas, o tipo de documento e cole o texto acima</div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .tradutor-exemplo-btn:hover {
          border-color: var(--accent) !important;
          background: var(--hover) !important;
        }
        @media (max-width: 900px) {
          .tradutor-form-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .tradutor-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
