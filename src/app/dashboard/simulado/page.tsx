'use client'

import { useState } from 'react'

interface Questao {
  enunciado: string
  alternativas: { a: string; b: string; c: string; d: string; e: string }
  gabarito: string
  justificativa: string
  artigos_relacionados?: string[]
  dica_estudo?: string
}

const MATERIAS = [
  'Direito Civil',
  'Direito Penal',
  'Direito Constitucional',
  'Direito Processual Civil',
  'Direito Processual Penal',
  'Direito do Trabalho',
  'Direito Administrativo',
  'Direito Tributario',
  'Direito Empresarial',
  'Etica Profissional',
  'Direitos Humanos',
  'Filosofia do Direito',
]

const BANCAS = ['OAB', 'CESPE', 'FGV', 'FCC', 'VUNESP']

export default function SimuladoPage() {
  const [materia, setMateria] = useState(MATERIAS[0])
  const [nivel, setNivel] = useState<'facil' | 'medio' | 'dificil'>('medio')
  const [quantidade, setQuantidade] = useState<number>(5)
  const [banca, setBanca] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [respostas, setRespostas] = useState<Record<number, string>>({})
  const [reveladas, setReveladas] = useState<Record<number, boolean>>({})

  const acertos = Object.entries(reveladas)
    .filter(([, rev]) => rev)
    .filter(([idx]) => {
      const i = Number(idx)
      return questoes[i] && respostas[i] === questoes[i].gabarito
    }).length

  const totalRespondidas = Object.keys(reveladas).length

  async function gerarSimulado() {
    if (loading) return
    setLoading(true)
    setErro('')
    setQuestoes([])
    setRespostas({})
    setReveladas({})

    try {
      const res = await fetch('/api/simulado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materia, nivel, quantidade, banca: banca || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (!Array.isArray(data.questoes) || data.questoes.length === 0) {
        throw new Error('Nenhuma questao foi gerada. Tente novamente.')
      }
      setQuestoes(data.questoes)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar simulado')
    } finally {
      setLoading(false)
    }
  }

  function selecionarResposta(idx: number, letra: string) {
    if (reveladas[idx]) return
    setRespostas(prev => ({ ...prev, [idx]: letra }))
  }

  function verificarResposta(idx: number) {
    setReveladas(prev => ({ ...prev, [idx]: true }))
  }

  function novoSimulado() {
    setQuestoes([])
    setRespostas({})
    setReveladas({})
    setErro('')
  }

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Simulado</h1>
        <p className="page-subtitle" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 16, color: 'var(--text-muted)' }}>
          OAB &amp; Concursos
        </p>
      </div>

      {/* Formulario */}
      {questoes.length === 0 && !loading && (
        <div className="section-card" style={{ padding: '24px 28px', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 20 }}>
            <i className="bi bi-gear" style={{ marginRight: 6 }} />Configurar simulado
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="simulado-form-grid">
            {/* Materia */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Materia
              </label>
              <select
                value={materia}
                onChange={e => setMateria(e.target.value)}
                className="form-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                {MATERIAS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Nivel */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Nivel de dificuldade
              </label>
              <select
                value={nivel}
                onChange={e => setNivel(e.target.value as 'facil' | 'medio' | 'dificil')}
                className="form-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="facil">Facil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Dificil</option>
              </select>
            </div>

            {/* Quantidade */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Quantidade de questoes
              </label>
              <select
                value={quantidade}
                onChange={e => setQuantidade(Number(e.target.value))}
                className="form-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value={5}>5 questoes</option>
                <option value={10}>10 questoes</option>
              </select>
            </div>

            {/* Banca */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Banca <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
              </label>
              <select
                value={banca}
                onChange={e => setBanca(e.target.value)}
                className="form-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="">Sem preferencia</option>
                {BANCAS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={gerarSimulado}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600 }}
          >
            <i className="bi bi-play-circle" style={{ marginRight: 8 }} />
            Gerar simulado
          </button>
        </div>
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
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Elaborando questoes...</div>
          <div style={{ fontSize: 13 }}>Gerando {quantidade} questoes de {materia} ({nivel})</div>
        </div>
      )}

      {/* Questoes */}
      {questoes.length > 0 && (
        <>
          {/* Cabecalho do simulado */}
          <div className="section-card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-journal-check" style={{ fontSize: 18, color: 'var(--accent)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{materia}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {questoes.length} questoes &middot; {nivel} {banca ? `\u00B7 ${banca}` : ''}
                  </div>
                </div>
              </div>
              {totalRespondidas > 0 && (
                <>
                  <div style={{ height: 32, width: 1, background: 'var(--border)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: acertos === totalRespondidas && totalRespondidas > 0 ? 'var(--success)' : acertos / Math.max(totalRespondidas, 1) >= 0.6 ? '#e67e22' : 'var(--danger)', lineHeight: 1 }}>
                      {acertos}/{totalRespondidas}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>acertos</div>
                  </div>
                </>
              )}
            </div>
            <button onClick={novoSimulado} className="btn-secondary" style={{ fontSize: 12, padding: '8px 16px' }}>
              <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 6 }} />Novo simulado
            </button>
          </div>

          {/* Lista de questoes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {questoes.map((q, idx) => {
              const revelada = reveladas[idx]
              const selecionada = respostas[idx]
              const acertou = revelada && selecionada === q.gabarito

              return (
                <div key={idx} className="section-card" style={{ padding: '20px 24px' }}>
                  {/* Numero + enunciado */}
                  <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: revelada
                        ? acertou ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'
                        : 'var(--accent-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700,
                      color: revelada
                        ? acertou ? '#22C55E' : '#EF4444'
                        : 'var(--accent)',
                    }}>
                      {revelada
                        ? acertou
                          ? <i className="bi bi-check-lg" />
                          : <i className="bi bi-x-lg" />
                        : idx + 1}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, flex: 1 }}>
                      {q.enunciado}
                    </p>
                  </div>

                  {/* Alternativas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {(['a', 'b', 'c', 'd', 'e'] as const).map(letra => {
                      const texto = q.alternativas[letra]
                      if (!texto) return null

                      const isSelecionada = selecionada === letra
                      const isCorreta = q.gabarito === letra
                      let borderColor = 'var(--border)'
                      let bgColor = 'transparent'
                      let textColor = 'var(--text-secondary)'
                      let letraColor = 'var(--text-muted)'

                      if (revelada) {
                        if (isCorreta) {
                          borderColor = '#22C55E'
                          bgColor = 'rgba(34,197,94,0.06)'
                          textColor = 'var(--text-primary)'
                          letraColor = '#22C55E'
                        } else if (isSelecionada && !isCorreta) {
                          borderColor = '#EF4444'
                          bgColor = 'rgba(239,68,68,0.06)'
                          textColor = 'var(--text-primary)'
                          letraColor = '#EF4444'
                        }
                      } else if (isSelecionada) {
                        borderColor = 'var(--accent)'
                        bgColor = 'var(--accent-light)'
                        textColor = 'var(--text-primary)'
                        letraColor = 'var(--accent)'
                      }

                      return (
                        <button
                          key={letra}
                          onClick={() => selecionarResposta(idx, letra)}
                          disabled={revelada}
                          className="simulado-alternativa"
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '12px 16px', borderRadius: 10,
                            border: `1px solid ${borderColor}`,
                            background: bgColor, cursor: revelada ? 'default' : 'pointer',
                            textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{
                            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${letraColor}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: letraColor,
                            background: isSelecionada && !revelada ? 'var(--accent-light)' : 'transparent',
                            transition: 'all 0.15s ease',
                          }}>
                            {revelada && isCorreta ? <i className="bi bi-check-lg" style={{ fontSize: 14 }} /> : letra.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 13, color: textColor, lineHeight: 1.6, paddingTop: 2 }}>
                            {texto}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Botao verificar */}
                  {!revelada && (
                    <button
                      onClick={() => verificarResposta(idx)}
                      disabled={!selecionada}
                      className="btn-primary"
                      style={{
                        fontSize: 12, padding: '8px 20px',
                        opacity: selecionada ? 1 : 0.5,
                      }}
                    >
                      <i className="bi bi-check2-circle" style={{ marginRight: 6 }} />
                      Verificar resposta
                    </button>
                  )}

                  {/* Resultado revelado */}
                  {revelada && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                      {/* Status */}
                      <div style={{
                        padding: '10px 14px', borderRadius: 8,
                        background: acertou ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                        borderLeft: `3px solid ${acertou ? '#22C55E' : '#EF4444'}`,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: acertou ? '#22C55E' : '#EF4444' }}>
                          {acertou ? 'Correto!' : `Incorreto \u2014 Gabarito: ${q.gabarito.toUpperCase()}`}
                        </span>
                      </div>

                      {/* Justificativa */}
                      {q.justificativa && (
                        <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                            Justificativa
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {q.justificativa}
                          </p>
                        </div>
                      )}

                      {/* Artigos relacionados */}
                      {Array.isArray(q.artigos_relacionados) && q.artigos_relacionados.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                            Artigos relacionados
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {q.artigos_relacionados.map((art, j) => (
                              <span key={j} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 500 }}>
                                {art}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dica de estudo */}
                      {q.dica_estudo && (
                        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 6 }}>
                            <i className="bi bi-lightbulb" style={{ marginRight: 4 }} />Dica de estudo
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {q.dica_estudo}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Placar final */}
          {totalRespondidas === questoes.length && questoes.length > 0 && (
            <div className="section-card" style={{ padding: '24px 28px', marginTop: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12 }}>
                Resultado Final
              </div>
              <div style={{
                fontSize: 48, fontWeight: 800, lineHeight: 1,
                color: acertos / questoes.length >= 0.7 ? '#22C55E' : acertos / questoes.length >= 0.4 ? '#e67e22' : '#EF4444',
                marginBottom: 8,
                fontFamily: "'Playfair Display', serif",
              }}>
                {acertos}/{questoes.length}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {Math.round((acertos / questoes.length) * 100)}% de aproveitamento
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                {acertos / questoes.length >= 0.7
                  ? 'Excelente! Voce esta no caminho certo.'
                  : acertos / questoes.length >= 0.4
                    ? 'Bom resultado. Continue praticando para melhorar.'
                    : 'Precisa revisar este conteudo. Nao desanime!'}
              </div>

              {/* Barra de progresso */}
              <div style={{ maxWidth: 300, margin: '0 auto 20px', height: 8, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((acertos / questoes.length) * 100)}%`,
                  background: acertos / questoes.length >= 0.7 ? '#22C55E' : acertos / questoes.length >= 0.4 ? '#e67e22' : '#EF4444',
                  borderRadius: 999,
                  transition: 'width 0.6s ease',
                }} />
              </div>

              <button onClick={novoSimulado} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
                <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 8 }} />
                Novo simulado
              </button>
            </div>
          )}
        </>
      )}

      {/* Estado vazio */}
      {questoes.length === 0 && !loading && !erro && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <i className="bi bi-journal-check" style={{ fontSize: 48, display: 'block', marginBottom: 16, opacity: 0.25 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Pratique para OAB e concursos</div>
          <div style={{ fontSize: 13 }}>Configure a materia, nivel e quantidade acima para gerar seu simulado</div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .simulado-alternativa:not(:disabled):hover {
          border-color: var(--accent) !important;
          background: var(--hover) !important;
        }
        @media (max-width: 768px) {
          .simulado-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
