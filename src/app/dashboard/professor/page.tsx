'use client'

import { useState, useEffect } from 'react'

export default function ProfessorPage() {
  const [tema, setTema] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aula, setAula] = useState<any>(null)
  const [erro, setErro] = useState('')
  const [nivel, setNivel] = useState<'basico' | 'intermediario' | 'avancado' | 'questoes' | 'plano'>('basico')

  // Memory — save studied topics to localStorage
  const [studyHistory, setStudyHistory] = useState<string[]>([])
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lexai-study-history')
      if (saved) setStudyHistory(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  async function ensinar() {
    if (!tema.trim() || loading) return
    setLoading(true); setErro(''); setAula(null)

    // Build request with extra context
    const body: Record<string, string> = { tema }
    if (youtubeUrl.trim()) {
      body.videoContent = `YouTube URL: ${youtubeUrl} — Analise o conteudo deste video sobre o tema "${tema}". Extraia os pontos principais para estudo.`
    }
    if (instituicao.trim()) {
      body.instituicao = instituicao
    }
    if (studyHistory.length > 0) {
      body.historico = studyHistory.slice(-10).join(', ')
    }

    try {
      const res = await fetch('/api/ensinar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAula(data.aula)

      // Save to study history
      const updated = [...studyHistory.filter(t => t !== tema), tema].slice(-20)
      setStudyHistory(updated)
      localStorage.setItem('lexai-study-history', JSON.stringify(updated))
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro')
    } finally { setLoading(false) }
  }

  const NIVEIS = [
    { key: 'basico' as const, label: 'Basico', icon: 'bi-book', color: '#2d8659' },
    { key: 'intermediario' as const, label: 'Intermediario', icon: 'bi-journal-text', color: '#4f46e5' },
    { key: 'avancado' as const, label: 'Avancado', icon: 'bi-mortarboard', color: '#c0392b' },
    { key: 'questoes' as const, label: 'Questoes', icon: 'bi-patch-question', color: '#e67e22' },
    { key: 'plano' as const, label: 'Plano de Estudo', icon: 'bi-calendar-check', color: '#3B82F6' },
  ]

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Professor</h1>
        <p className="page-subtitle">Ensino juridico nivel Harvard com video analysis, padroes de prova e plano de estudo</p>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="bi bi-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input type="text" value={tema} onChange={e => setTema(e.target.value)}
            placeholder="Digite o tema juridico: ex. prescricao, responsabilidade civil, habeas corpus..."
            className="form-input" style={{ paddingLeft: 40 }}
            onKeyDown={e => e.key === 'Enter' && ensinar()} />
        </div>
        <button onClick={ensinar} disabled={!tema.trim() || loading} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Preparando aula...' : <><i className="bi bi-mortarboard" /> Ensinar</>}
        </button>
      </div>

      {/* Extra inputs — YouTube + Institution */}
      {!aula && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-youtube" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
            <input type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="Link do YouTube (opcional) — resumo do video"
              className="form-input" style={{ paddingLeft: 40, fontSize: 13 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-mortarboard" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
            <input type="text" value={instituicao} onChange={e => setInstituicao(e.target.value)}
              placeholder="Faculdade/Concurso (ex: OAB, TJSP, USP)"
              className="form-input" style={{ paddingLeft: 40, fontSize: 13 }} />
          </div>
        </div>
      )}

      {/* Study history memory */}
      {!aula && !loading && studyHistory.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <i className="bi bi-clock-history" style={{ fontSize: 12, color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Temas estudados recentemente</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {studyHistory.slice(-8).reverse().map((t, i) => (
              <button key={i} onClick={() => setTema(t)}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Study categories */}
      {!aula && !loading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Areas de Estudo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { area: 'Direito Civil', temas: ['Responsabilidade Civil', 'Contratos', 'Prescricao', 'Posse e Propriedade'], icon: 'bi-file-earmark-text', color: '#2563EB' },
              { area: 'Direito Penal', temas: ['Legitima Defesa', 'Crimes contra o patrimonio', 'Principio da Legalidade', 'Dosimetria da Pena'], icon: 'bi-shield-exclamation', color: '#EF4444' },
              { area: 'Direito Constitucional', temas: ['Direitos Fundamentais', 'Controle de Constitucionalidade', 'Remedio Constitucional', 'Separacao de Poderes'], icon: 'bi-building', color: '#8B5CF6' },
              { area: 'Direito do Trabalho', temas: ['Rescisao Indireta', 'Horas Extras', 'Acidente de Trabalho', 'FGTS'], icon: 'bi-briefcase', color: '#F59E0B' },
            ].map((cat, i) => (
              <div key={i} className="section-card" style={{ padding: '16px', cursor: 'pointer' }}
                onClick={() => { setTema(cat.temas[0]); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${cat.icon}`} style={{ color: cat.color, fontSize: 14 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.area}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cat.temas.map((t, j) => (
                    <button key={j} onClick={(e) => { e.stopPropagation(); setTema(t); }}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {erro && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-exclamation-triangle-fill" /> {erro}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Preparando aula completa...</div>
          <div style={{ fontSize: 13 }}>Elaborando conteudo em tres niveis</div>
        </div>
      ) : aula ? (
        <>
          {/* Level tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {NIVEIS.map(n => (
              <button key={n.key} onClick={() => setNivel(n.key)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
                border: nivel === n.key ? `2px solid ${n.color}` : '1px solid var(--border)',
                background: nivel === n.key ? `${n.color}12` : 'var(--card-bg)',
                color: nivel === n.key ? n.color : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s',
              }}>
                <i className={`bi ${n.icon}`} /> {n.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="section-card" style={{ padding: '24px 28px' }}>
            {nivel === 'basico' && aula.basico && (() => {
              const b = aula.basico as any
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2d8659', marginBottom: 8 }}>Definicao</div><p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{String(b.definicao)}</p></div>
                  {b.analogia && <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 6 }}>Analogia</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{String(b.analogia)}</p></div>}
                  {b.origem && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Origem Historica</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{String(b.origem)}</p></div>}
                </div>
              )
            })()}

            {nivel === 'intermediario' && aula.intermediario && (() => {
              const m = aula.intermediario as any
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4f46e5', marginBottom: 8 }}>Definicao Tecnica</div><p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{String(m.definicao_tecnica)}</p></div>
                  {Array.isArray(m.legislacao) && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Legislacao Aplicavel</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{m.legislacao.map((l: string, i: number) => <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--hover)', color: 'var(--text-secondary)', fontWeight: 500 }}>{l}</span>)}</div></div>}
                  {Array.isArray(m.exemplos) && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Exemplos Praticos</div>{m.exemplos.map((ex: string, i: number) => <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>{ex}</p>)}</div>}
                </div>
              )
            })()}

            {nivel === 'avancado' && aula.avancado && (() => {
              const a = aula.avancado as any
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {Array.isArray(a.controversias) && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c0392b', marginBottom: 8 }}>Controversias Doutrinarias</div>{a.controversias.map((c: string, i: number) => <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--danger)' }}>{c}</p>)}</div>}
                  {a.jurisprudencia_divergente && <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Jurisprudencia Divergente</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(a.jurisprudencia_divergente)}</p></div>}
                  {a.analise_critica && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Analise Critica</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{String(a.analise_critica)}</p></div>}
                </div>
              )
            })()}

            {nivel === 'questoes' && Array.isArray(aula.questoes) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {(aula.questoes as any[]).map((q, i) => (
                  <QuestaoCard key={i} questao={q} index={i} />
                ))}
              </div>
            )}

            {nivel === 'plano' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {aula.plano_estudo && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#3B82F6', marginBottom: 8 }}>Plano de Estudo Sugerido</div>
                    <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(aula.plano_estudo)}</p>
                  </div>
                )}
                {aula.analise_video && (
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 8 }}>Resumo do Video</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(aula.analise_video)}</p>
                  </div>
                )}
                {aula.padrao_provas && (
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)', borderLeft: '3px solid #F59E0B' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#F59E0B', marginBottom: 8 }}>Padrao de Provas</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(aula.padrao_provas)}</p>
                  </div>
                )}
                {!aula.plano_estudo && !aula.analise_video && !aula.padrao_provas && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: 13 }}>Informe uma faculdade ou link de video para ver o plano de estudo personalizado</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {aula.mapa_mental && (
            <div className="section-card" style={{ padding: '18px 20px', marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>Mapa Mental</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(aula.mapa_mental)}</p>
            </div>
          )}

          <button onClick={() => { setAula(null); setTema('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 16 }}>
            <i className="bi bi-arrow-counterclockwise" /> Novo tema
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <i className="bi bi-mortarboard" style={{ fontSize: 48, display: 'block', marginBottom: 16, opacity: 0.25 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Aprenda qualquer tema juridico</div>
          <div style={{ fontSize: 13 }}>Digite um tema e receba uma aula completa em 3 niveis com questoes OAB</div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuestaoCard({ questao: q, index: i }: { questao: any; index: number }) {
  const [mostrar, setMostrar] = useState(false)
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const alt = (q.alternativas || {}) as Record<string, string>
  const correta = String(q.resposta_correta || '').toLowerCase()

  return (
    <div style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--hover)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)' }}>Questao {i + 1}</span>
        {q.estilo_prova && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{String(q.estilo_prova)}</span>}
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 14 }}>{String(q.enunciado)}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(alt).map(([letra, texto]) => {
          const isCorreta = mostrar && letra === correta
          const isErrada = mostrar && selecionada === letra && letra !== correta
          return (
            <button key={letra} onClick={() => { setSelecionada(letra); setMostrar(true) }} disabled={mostrar} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, textAlign: 'left', cursor: mostrar ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif",
              background: isCorreta ? 'rgba(45,134,89,0.12)' : isErrada ? 'rgba(192,57,43,0.12)' : 'var(--card-bg)',
              border: isCorreta ? '1.5px solid var(--success)' : isErrada ? '1.5px solid var(--danger)' : '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 13, transition: 'all 0.15s',
            }}>
              <span style={{ fontWeight: 700, color: isCorreta ? 'var(--success)' : isErrada ? 'var(--danger)' : 'var(--text-muted)', minWidth: 18 }}>{letra.toUpperCase()})</span>
              <span style={{ lineHeight: 1.5 }}>{texto}</span>
            </button>
          )
        })}
      </div>
      {mostrar && q.justificativa && (
        <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 10, background: 'var(--card-bg)', borderLeft: '3px solid var(--accent)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 6 }}>Justificativa</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(q.justificativa)}</p>
        </div>
      )}
    </div>
  )
}
