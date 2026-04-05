'use client'

import { useState } from 'react'

const TEMPLATES = [
  { id: 'peticao',      label: 'Petição Inicial',  icon: 'bi-file-earmark-text',  desc: 'Petição inicial para distribuição de ação' },
  { id: 'recurso',      label: 'Recurso',           icon: 'bi-arrow-counterclockwise', desc: 'Apelação, Agravo ou Recurso Especial' },
  { id: 'contestacao',  label: 'Contestação',       icon: 'bi-shield-check',       desc: 'Defesa do réu em resposta à petição' },
  { id: 'parecer',      label: 'Parecer Jurídico',  icon: 'bi-journal-text',       desc: 'Análise técnica de questão jurídica' },
  { id: 'contrato',     label: 'Contrato',          icon: 'bi-file-earmark-ruled', desc: 'Minutas e modelos contratuais' },
  { id: 'notificacao',  label: 'Notificação',       icon: 'bi-envelope-paper',     desc: 'Notificação extrajudicial' },
]

export default function RedatorPage() {
  const [template, setTemplate] = useState('')
  const [instrucoes, setInstrucoes] = useState('')
  const [gerando, setGerando] = useState(false)
  const [resultado, setResultado] = useState('')

  async function gerar() {
    if (!template || !instrucoes.trim()) return
    setGerando(true); setResultado('')
    // Simulação — quando a API estiver integrada, chamar /api/redator
    await new Promise(r => setTimeout(r, 1800))
    setResultado(`[Prévia gerada por IA]\n\nTemplate: ${TEMPLATES.find(t=>t.id===template)?.label}\n\nInstruções recebidas:\n${instrucoes}\n\n— Este recurso estará disponível em breve com integração completa ao Gemini.`)
    setGerando(false)
  }

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Banner */}
      <div className="agent-banner">
        <i className="bi bi-stars" />
        Agente em desenvolvimento — prévia disponível. Integração completa com IA em breve.
      </div>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 className="page-title">Redator Jurídico</h1>
        <p className="page-subtitle">Gere peças processuais com auxílio de inteligência artificial</p>
      </div>

      <div className="redator-main-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Painel esquerdo */}
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {/* Seletor de template */}
          <div className="section-card" style={{ padding:'18px 20px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>
              Tipo de Peça
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                  padding:'10px 12px', borderRadius:8, textAlign:'left', cursor:'pointer',
                  border: template === t.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: template === t.id ? 'var(--accent-light)' : 'var(--card-bg)',
                  transition:'all 0.15s',
                }}>
                  <i className={`bi ${t.icon}`} style={{ fontSize:16, color: template===t.id ? 'var(--accent)' : 'var(--text-muted)', display:'block', marginBottom:6 }} />
                  <div style={{ fontSize:12, fontWeight:600, color: template===t.id ? 'var(--accent)' : 'var(--text-primary)', marginBottom:2 }}>{t.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.3 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Instruções */}
          <div className="section-card" style={{ padding:'18px 20px', flex:1 }}>
            <label className="form-label">Instruções e Fatos</label>
            <textarea
              value={instrucoes}
              onChange={e => setInstrucoes(e.target.value)}
              placeholder={`Descreva os fatos relevantes, partes envolvidas, pedidos e qualquer informação necessária para a elaboração da peça...\n\nEx: Autor: João Silva, CPF 123.456.789-00. Réu: Empresa XYZ Ltda. Fato: inadimplemento contratual desde jan/2024...`}
              className="form-input"
              style={{ resize:'vertical', minHeight:180, fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.6 }}
            />
            <button
              onClick={gerar}
              disabled={!template || !instrucoes.trim() || gerando}
              className="btn-primary"
              style={{ width:'100%', justifyContent:'center', marginTop:12 }}
            >
              {gerando
                ? <><i className="bi bi-hourglass-split" style={{ animation:'spin 1s linear infinite' }} /> Gerando peça...</>
                : <><i className="bi bi-magic" /> Gerar Peça</>
              }
            </button>
          </div>
        </div>

        {/* Painel direito — Preview */}
        <div className="section-card" style={{ padding:'18px 20px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Prévia da Peça
            </div>
            {resultado && (
              <button className="btn-ghost" style={{ fontSize:12, padding:'5px 10px', display:'flex', alignItems:'center', gap:5 }}
                onClick={() => navigator.clipboard.writeText(resultado)}>
                <i className="bi bi-clipboard" /> Copiar
              </button>
            )}
          </div>
          {gerando ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'var(--text-muted)' }}>
              <i className="bi bi-hourglass-split" style={{ fontSize:28 }} />
              <span style={{ fontSize:13 }}>Gerando documento...</span>
            </div>
          ) : resultado ? (
            <textarea readOnly value={resultado} style={{
              flex:1, minHeight:400, resize:'none', border:'none', outline:'none',
              background:'var(--input-bg)', borderRadius:8, padding:14,
              fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'var(--text-primary)',
              lineHeight:1.7,
            }} />
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'var(--text-muted)', minHeight:300 }}>
              <i className="bi bi-file-earmark-text" style={{ fontSize:40, opacity:0.3 }} />
              <span style={{ fontSize:13, textAlign:'center' }}>
                Selecione um template, informe os detalhes<br />e clique em "Gerar Peça"
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
