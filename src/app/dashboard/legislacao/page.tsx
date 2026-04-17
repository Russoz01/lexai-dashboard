'use client'
import { useState } from 'react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { Search, BookOpen, Landmark, ShieldAlert, FileText, NotebookText, Gavel, Briefcase, ShoppingBag, Coins, CheckSquare, ShieldCheck, Globe, Bookmark, ExternalLink, RotateCcw } from 'lucide-react'

export default function LegislacaoPage() {
  const [consulta, setConsulta] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  async function pesquisar() {
    if (!consulta.trim() || loading) return
    setLoading(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/legislacao', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultado(data.resultado)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro na pesquisa')
    } finally { setLoading(false) }
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
        <h1 className="page-title">Legislação</h1>
        <p className="page-subtitle">Pesquise e entenda artigos de lei, códigos e normas brasileiras</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} strokeWidth={1.75} aria-hidden style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" value={consulta} onChange={e => setConsulta(e.target.value)}
            maxLength={1000}
            placeholder="Ex: Art. 5 CF/88, Art. 927 CC, Art. 300 CPC, Lei 8.078/90..."
            className="form-input" style={{ paddingLeft: 40 }}
            onKeyDown={e => e.key === 'Enter' && pesquisar()} />
        </div>
        <button type="button" onClick={pesquisar} disabled={!consulta.trim() || loading} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Pesquisando...' : <><BookOpen size={14} strokeWidth={1.75} aria-hidden /> Pesquisar</>}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>Exemplos rápidos</span>
        {['Art. 5 CF/88', 'Art. 927 Código Civil', 'Art. 300 CPC', 'Lei 8.078/90 CDC'].map((ex, i) => (
          <button key={i} type="button" onClick={() => setConsulta(ex)}
            style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
            {ex}
          </button>
        ))}
      </div>

      {/* Códigos e Apostilas Oficiais — fontes confiáveis */}
      {!resultado && !loading && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} strokeWidth={1.75} aria-hidden />Códigos e Apostilas Oficiais
            </div>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.3px' }}>
              FONTES OFICIAIS
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="study-grid">
            {[
              { nome: 'Constituição Federal 1988', desc: 'Texto integral atualizado no Planalto', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm', Icon: Landmark, color: '#c9a84c' },
              { nome: 'Código Penal (Decreto-Lei 2.848/40)', desc: 'CP brasileiro — texto consolidado', url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm', Icon: ShieldAlert, color: '#EF4444' },
              { nome: 'Código Civil (Lei 10.406/02)', desc: 'CC brasileiro — texto consolidado', url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm', Icon: FileText, color: '#44372b' },
              { nome: 'Código de Processo Civil (Lei 13.105/15)', desc: 'CPC/2015 atualizado', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm', Icon: NotebookText, color: '#6366F1' },
              { nome: 'Código de Processo Penal (DL 3.689/41)', desc: 'CPP brasileiro consolidado', url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm', Icon: Gavel, color: '#8B5CF6' },
              { nome: 'CLT (DL 5.452/43)', desc: 'Consolidação das Leis do Trabalho', url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm', Icon: Briefcase, color: '#F59E0B' },
              { nome: 'CDC (Lei 8.078/90)', desc: 'Código de Defesa do Consumidor', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm', Icon: ShoppingBag, color: '#10B981' },
              { nome: 'CTN (Lei 5.172/66)', desc: 'Código Tributário Nacional', url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm', Icon: Coins, color: '#06B6D4' },
              { nome: 'Código Eleitoral (Lei 4.737/65)', desc: 'Texto consolidado eleitoral', url: 'https://www.planalto.gov.br/ccivil_03/leis/l4737compilado.htm', Icon: CheckSquare, color: '#EC4899' },
              { nome: 'LGPD (Lei 13.709/18)', desc: 'Lei Geral de Proteção de Dados', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm', Icon: ShieldCheck, color: '#22C55E' },
              { nome: 'Marco Civil da Internet (Lei 12.965/14)', desc: 'Direitos no ambiente digital', url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm', Icon: Globe, color: '#0EA5E9' },
              { nome: 'Súmulas STF/STJ', desc: 'Índice de súmulas dos tribunais superiores', url: 'https://portal.stf.jus.br/jurisprudencia/sumarioSumulas.asp', Icon: Bookmark, color: '#D97706' },
            ].map((rec, i) => {
              const RecIcon = rec.Icon
              return (
                <a key={i} href={rec.url} target="_blank" rel="noopener noreferrer"
                  className="section-card"
                  style={{ padding: '14px 16px', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = rec.color }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${rec.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <RecIcon size={14} strokeWidth={1.75} aria-hidden style={{ color: rec.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.3 }}>
                        {rec.nome}
                        <ExternalLink size={10} strokeWidth={1.75} aria-hidden style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{rec.desc}</div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {erro && <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{erro}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Pesquisando legislação...</div>
        </div>
      ) : resultado ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {resultado.dispositivo && <div className="section-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>Dispositivo Legal</div>
              <ConfidenceBadge confianca={resultado?.confianca} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{resultado.dispositivo}</div>
          </div>}

          {resultado.texto_legal && <div className="section-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Texto Legal</div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic', padding: '12px 16px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-light)', borderRadius: '0 8px 8px 0' }}>{resultado.texto_legal}</p>
          </div>}

          {resultado.explicacao && <div className="section-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Explicação</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{resultado.explicacao}</p>
          </div>}

          {Array.isArray(resultado.exemplos_praticos) && resultado.exemplos_praticos.length > 0 && <div className="section-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Exemplos Práticos</div>
            {resultado.exemplos_praticos.map((ex: string, i: number) => <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>{ex}</p>)}
          </div>}

          <button type="button" onClick={() => { setResultado(null); setConsulta('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Nova pesquisa
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <PoweredByLexAI />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <BookOpen size={48} strokeWidth={1.75} aria-hidden style={{ display: 'block', marginBottom: 16, opacity: 0.25, marginLeft: 'auto', marginRight: 'auto' }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Pesquise qualquer dispositivo legal</div>
          <div style={{ fontSize: 13 }}>Digite um artigo de lei, código ou norma para obter explicação detalhada</div>
        </div>
      )}
    </div>
  )
}
