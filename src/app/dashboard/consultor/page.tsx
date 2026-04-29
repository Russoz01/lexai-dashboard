'use client'

import { useState } from 'react'
import {
  RotateCcw,
  CheckCircle2,
  Check,
  Clipboard,
  Download,
  AlertTriangle,
  FileText,
  Info,
  XCircle,
  BookText,
  Clock,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { AgentHero } from '@/components/AgentHero'
import FontesCitadas, { type Fonte } from '@/components/FontesCitadas'

interface Parecer {
  titulo: string
  ementa: string
  questao_analisada: string
  fundamentacao_legal: string[]
  doutrina: string[]
  argumentos_favoraveis: string[]
  argumentos_contrarios: string[]
  conclusao: string
  recomendacoes: string[]
  ressalvas: string
}

const AREAS_DIREITO = [
  'Civil',
  'Penal',
  'Constitucional',
  'Trabalhista',
  'Tributário',
  'Administrativo',
  'Empresarial',
  'Ambiental',
  'Digital',
  'Internacional',
]

export default function ConsultorPage() {
  const [pergunta, setPergunta] = useState('')
  const [area, setArea] = useState('')
  const [contexto, setContexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [parecer, setParecer] = useState<Parecer | null>(null)
  const [fontes, setFontes] = useState<Fonte[]>([])
  const [groundingStats, setGroundingStats] = useState<{ topScore?: number; provisions?: number; sumulas?: number } | null>(null)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)

  async function gerarParecer() {
    if (!pergunta.trim() || loading) return
    setLoading(true)
    setErro('')
    setParecer(null)
    setFontes([])
    setGroundingStats(null)

    try {
      const res = await fetch('/api/consultor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta,
          area: area || undefined,
          contexto: contexto || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar parecer.')
      setParecer(data.parecer)
      if (Array.isArray(data.fontes)) setFontes(data.fontes)
      if (data.grounding_stats) setGroundingStats(data.grounding_stats)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar parecer')
    } finally {
      setLoading(false)
    }
  }

  function copiarParecer() {
    if (!parecer) return
    const lines: string[] = []
    lines.push(`PARECER JURÍDICO`)
    lines.push(``)
    lines.push(`${parecer.titulo}`)
    lines.push(``)
    lines.push(`EMENTA: ${parecer.ementa}`)
    lines.push(``)
    lines.push(`I. QUESTÃO ANALISADA`)
    lines.push(parecer.questao_analisada)
    lines.push(``)
    if (parecer.fundamentacao_legal?.length) {
      lines.push(`II. FUNDAMENTAÇÃO LEGAL`)
      parecer.fundamentacao_legal.forEach((f, i) => lines.push(`${i + 1}. ${f}`))
      lines.push(``)
    }
    if (parecer.doutrina?.length) {
      lines.push(`III. DOUTRINA`)
      parecer.doutrina.forEach((d, i) => lines.push(`${i + 1}. ${d}`))
      lines.push(``)
    }
    if (parecer.argumentos_favoraveis?.length) {
      lines.push(`IV. ARGUMENTOS FAVORÁVEIS`)
      parecer.argumentos_favoraveis.forEach((a, i) => lines.push(`${i + 1}. ${a}`))
      lines.push(``)
    }
    if (parecer.argumentos_contrarios?.length) {
      lines.push(`V. ARGUMENTOS CONTRÁRIOS`)
      parecer.argumentos_contrarios.forEach((a, i) => lines.push(`${i + 1}. ${a}`))
      lines.push(``)
    }
    lines.push(`VI. CONCLUSÃO`)
    lines.push(parecer.conclusao)
    lines.push(``)
    if (parecer.recomendacoes?.length) {
      lines.push(`VII. RECOMENDAÇÕES`)
      parecer.recomendacoes.forEach((r, i) => lines.push(`${i + 1}. ${r}`))
      lines.push(``)
    }
    if (parecer.ressalvas) {
      lines.push(`VIII. RESSALVAS`)
      lines.push(parecer.ressalvas)
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  function downloadParecer() {
    if (!parecer) return
    const lines: string[] = []
    lines.push(`PARECER JURÍDICO`)
    lines.push(`${'='.repeat(60)}`)
    lines.push(``)
    lines.push(`${parecer.titulo}`)
    lines.push(``)
    lines.push(`EMENTA`)
    lines.push(`${parecer.ementa}`)
    lines.push(``)
    lines.push(`${'─'.repeat(60)}`)
    lines.push(``)
    lines.push(`I. QUESTÃO ANALISADA`)
    lines.push(``)
    lines.push(parecer.questao_analisada)
    lines.push(``)
    if (parecer.fundamentacao_legal?.length) {
      lines.push(`II. FUNDAMENTAÇÃO LEGAL`)
      lines.push(``)
      parecer.fundamentacao_legal.forEach((f, i) => lines.push(`  ${i + 1}. ${f}`))
      lines.push(``)
    }
    if (parecer.doutrina?.length) {
      lines.push(`III. DOUTRINA`)
      lines.push(``)
      parecer.doutrina.forEach((d, i) => lines.push(`  ${i + 1}. ${d}`))
      lines.push(``)
    }
    if (parecer.argumentos_favoraveis?.length) {
      lines.push(`IV. ARGUMENTOS FAVORÁVEIS`)
      lines.push(``)
      parecer.argumentos_favoraveis.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`))
      lines.push(``)
    }
    if (parecer.argumentos_contrarios?.length) {
      lines.push(`V. ARGUMENTOS CONTRÁRIOS`)
      lines.push(``)
      parecer.argumentos_contrarios.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`))
      lines.push(``)
    }
    lines.push(`VI. CONCLUSÃO`)
    lines.push(``)
    lines.push(parecer.conclusao)
    lines.push(``)
    if (parecer.recomendacoes?.length) {
      lines.push(`VII. RECOMENDAÇÕES`)
      lines.push(``)
      parecer.recomendacoes.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`))
      lines.push(``)
    }
    if (parecer.ressalvas) {
      lines.push(`${'─'.repeat(60)}`)
      lines.push(``)
      lines.push(`VIII. RESSALVAS`)
      lines.push(``)
      lines.push(parecer.ressalvas)
    }
    lines.push(``)
    lines.push(`${'='.repeat(60)}`)
    lines.push(`Parecer gerado via Pralvex — Estrategista`)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parecer-${(parecer.titulo || 'juridico').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 60)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      <AgentHero
        edition="Nº I"
        Icon={BookText}
        name="Estrategista"
        discipline="Pareceres fundamentados"
        description="Análise multifacetada com legislação, doutrina, argumentos favoráveis e contrários. Ideal para responder consultas internas ou fundamentar posicionamento antes de uma peça."
        accent="gold"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~55s' },
          { Icon: Gauge, label: 'Profundidade', value: '8 blocos' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Provimento 205' },
        ]}
        steps={[
          { n: 'I', title: 'Descreva a questão', desc: 'Em 2-5 linhas, coloque a pergunta central e os fatos essenciais.' },
          { n: 'II', title: 'Opcional: contexto', desc: 'Anexe jurisprudência conhecida, documentos, prazos ou contratos envolvidos.' },
          { n: 'III', title: 'Receba o parecer', desc: 'Ementa, fundamentação, doutrina, argumentos e conclusão formatados.' },
        ]}
        examples={[
          { label: 'Marketplace responde por vendedor?', prompt: 'Uma empresa de e-commerce pode ser responsabilizada por danos causados por produto vendido por terceiro em seu marketplace?' },
          { label: 'Multa por mudança de regulamento', prompt: 'Condomínio pode aplicar multa com base em regulamento interno alterado depois da compra do imóvel?' },
          { label: 'Rescisão com justa causa remota', prompt: 'Empresa pode rescindir por justa causa funcionário 100% remoto que não cumpre horário? Quais os requisitos probatórios?' },
        ]}
        onExampleClick={setPergunta}
        shortcut="⌘⏎ gerar"
      />

      {/* Form */}
      {!parecer && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pergunta */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Questão Jurídica
            </label>
            <textarea
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              maxLength={50000}
              placeholder="Descreva a questão jurídica para o parecer. Ex: Uma empresa de e-commerce pode ser responsabilizada por danos causados por produto vendido por terceiro em seu marketplace?"
              className="form-input consultor-textarea"
              rows={5}
              style={{ resize: 'vertical', minHeight: 120 }}
            />
            <div style={{ fontSize: 11, color: pergunta.length > 45000 ? 'var(--danger)' : pergunta.length > 40000 ? '#f59e0b' : 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
              {pergunta.length.toLocaleString('pt-BR')} / 50.000
            </div>
          </div>

          {/* Area + Contexto row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }} className="consultor-form-grid">
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                Área do Direito
              </label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="form-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="">Detectar automaticamente</option>
                {AREAS_DIREITO.map(a => (
                  <option key={a} value={a}>Direito {a}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                Contexto Adicional <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span>
              </label>
              <textarea
                value={contexto}
                onChange={e => setContexto(e.target.value)}
                maxLength={30000}
                placeholder="Fatos relevantes, documentos envolvidos, jurisprudência conhecida..."
                className="form-input"
                rows={3}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
              <div style={{ fontSize: 11, color: contexto.length > 27000 ? 'var(--danger)' : contexto.length > 24000 ? '#f59e0b' : 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                {contexto.length.toLocaleString('pt-BR')} / 30.000
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={gerarParecer}
            disabled={!pergunta.trim() || loading}
            className="btn-primary"
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 14 }}
          >
            <FileText size={16} strokeWidth={1.75} aria-hidden /> Gerar parecer
          </button>
        </div>
      )}

      {/* Error */}
      {erro && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} strokeWidth={1.75} aria-hidden /> {erro}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ marginTop: 24 }}>
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', marginBottom: 24 }}>
            <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Elaborando parecer jurídico...</div>
            <div style={{ fontSize: 13 }}>Analisando legislação, doutrina e jurisprudência</div>
          </div>
          <div className="section-card" style={{ padding: '28px 32px' }}>
            <div className="skeleton-line" style={{ width: '65%', height: 24, marginBottom: 16 }} />
            <div className="skeleton-line" style={{ width: '90%', height: 14, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: '80%', height: 14, marginBottom: 24 }} />
            <div className="skeleton-line" style={{ width: '40%', height: 12, marginBottom: 12 }} />
            <div className="skeleton-line" style={{ width: '100%', height: 14, marginBottom: 6 }} />
            <div className="skeleton-line" style={{ width: '95%', height: 14, marginBottom: 6 }} />
            <div className="skeleton-line" style={{ width: '88%', height: 14, marginBottom: 24 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="skeleton-line" style={{ width: '50%', height: 12, marginBottom: 10 }} />
                <div className="skeleton-line" style={{ width: '100%', height: 14, marginBottom: 6 }} />
                <div className="skeleton-line" style={{ width: '90%', height: 14, marginBottom: 6 }} />
              </div>
              <div>
                <div className="skeleton-line" style={{ width: '50%', height: 12, marginBottom: 10 }} />
                <div className="skeleton-line" style={{ width: '100%', height: 14, marginBottom: 6 }} />
                <div className="skeleton-line" style={{ width: '85%', height: 14, marginBottom: 6 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parecer result */}
      {parecer && (
        <>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
            <button type="button" onClick={copiarParecer} className="consultor-action-btn" title="Copiar parecer">
              {copiado ? <Check size={14} strokeWidth={1.75} aria-hidden /> : <Clipboard size={14} strokeWidth={1.75} aria-hidden />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
            <button type="button" onClick={downloadParecer} className="consultor-action-btn" title="Baixar parecer">
              <Download size={14} strokeWidth={1.75} aria-hidden /> Baixar .txt
            </button>
          </div>

          {/* Main parecer card */}
          <div className="section-card consultor-parecer-card" style={{ padding: '32px 36px' }}>
            {/* Titulo */}
            {parecer.titulo && (
              <h2 className="consultor-parecer-titulo">{parecer.titulo}</h2>
            )}

            {/* Ementa */}
            {parecer.ementa && (
              <div className="consultor-ementa">
                <div className="consultor-section-label">Ementa</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, fontStyle: 'italic' }}>
                  {parecer.ementa}
                </p>
              </div>
            )}

            <div className="consultor-divider" />

            {/* Questao Analisada */}
            {parecer.questao_analisada && (
              <div style={{ marginBottom: 28 }}>
                <div className="consultor-section-label" style={{ color: 'var(--accent)' }}>
                  <span className="consultor-section-number">I</span> Questão Analisada
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8 }}>
                  {parecer.questao_analisada}
                </p>
              </div>
            )}

            {/* Fundamentacao Legal */}
            {Array.isArray(parecer.fundamentacao_legal) && parecer.fundamentacao_legal.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div className="consultor-section-label" style={{ color: '#44372b' }}>
                  <span className="consultor-section-number">II</span> Fundamentação Legal
                </div>
                <ol className="consultor-numbered-list">
                  {parecer.fundamentacao_legal.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Doutrina */}
            {Array.isArray(parecer.doutrina) && parecer.doutrina.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div className="consultor-section-label" style={{ color: '#8B5CF6' }}>
                  <span className="consultor-section-number">III</span> Doutrina
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {parecer.doutrina.map((d, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--hover)', borderLeft: '3px solid #8B5CF6', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Argumentos — two columns */}
            {((Array.isArray(parecer.argumentos_favoraveis) && parecer.argumentos_favoraveis.length > 0) ||
              (Array.isArray(parecer.argumentos_contrarios) && parecer.argumentos_contrarios.length > 0)) && (
              <div style={{ marginBottom: 28 }}>
                <div className="consultor-section-label" style={{ color: '#e67e22', marginBottom: 14 }}>
                  <span className="consultor-section-number">IV</span> Argumentos
                </div>
                <div className="consultor-args-grid">
                  {/* Favoraveis */}
                  <div className="consultor-args-col consultor-args-favor">
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2d8659', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden /> Favoráveis
                    </div>
                    {Array.isArray(parecer.argumentos_favoraveis) && parecer.argumentos_favoraveis.map((a, i) => (
                      <div key={i} className="consultor-arg-item" style={{ borderLeftColor: '#2d8659' }}>
                        {a}
                      </div>
                    ))}
                  </div>
                  {/* Contrarios */}
                  <div className="consultor-args-col consultor-args-contra">
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c0392b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <XCircle size={14} strokeWidth={1.75} aria-hidden /> Contrários
                    </div>
                    {Array.isArray(parecer.argumentos_contrarios) && parecer.argumentos_contrarios.map((a, i) => (
                      <div key={i} className="consultor-arg-item" style={{ borderLeftColor: '#c0392b' }}>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="consultor-divider" />

            {/* Conclusao */}
            {parecer.conclusao && (
              <div className="consultor-conclusao" style={{ marginBottom: 28 }}>
                <div className="consultor-section-label" style={{ color: 'var(--accent)' }}>
                  <span className="consultor-section-number">V</span> Conclusão
                </div>
                <div className="consultor-conclusao-box">
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, fontWeight: 500 }}>
                    {parecer.conclusao}
                  </p>
                </div>
              </div>
            )}

            {/* Recomendacoes */}
            {Array.isArray(parecer.recomendacoes) && parecer.recomendacoes.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div className="consultor-section-label" style={{ color: '#10B981' }}>
                  <span className="consultor-section-number">VI</span> Recomendações
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {parecer.recomendacoes.map((r, i) => (
                    <label key={i} className="consultor-checklist-item">
                      <input type="checkbox" className="consultor-checkbox" />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Ressalvas */}
            {parecer.ressalvas && (
              <div className="consultor-ressalvas">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Info size={14} strokeWidth={1.75} aria-hidden style={{ color: '#e67e22' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#e67e22' }}>Ressalvas</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {parecer.ressalvas}
                </p>
              </div>
            )}

            <FontesCitadas fontes={fontes} stats={groundingStats} title="Fundamentacao verificada" />
          </div>

          {/* Reset + branding */}
          <button type="button" onClick={() => { setParecer(null); setPergunta(''); setArea(''); setContexto('') }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 16 }}>
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Novo parecer
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <PoweredByPralvex />
          </div>
        </>
      )}

      {/* Empty state */}
      {!parecer && !loading && !erro && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <FileText size={48} strokeWidth={1.75} aria-hidden style={{ display: 'block', margin: '0 auto 16px', opacity: 0.25 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Elabore pareceres jurídicos fundamentados</div>
          <div style={{ fontSize: 13 }}>Descreva a questão e receba uma análise completa com legislação, doutrina e recomendações</div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .consultor-subtitle {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-size: 18px;
          color: var(--text-secondary);
          font-weight: 400;
          margin: 0;
          letter-spacing: 0.3px;
        }

        .consultor-textarea {
          font-size: 14px;
          line-height: 1.7;
        }

        .consultor-section-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .consultor-section-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: var(--hover);
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
        }

        .consultor-parecer-card {
          position: relative;
        }

        .consultor-parecer-titulo {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 16px 0;
          line-height: 1.4;
          letter-spacing: 0.2px;
        }

        .consultor-ementa {
          padding: 16px 20px;
          border-radius: 10px;
          background: var(--hover);
          border-left: 3px solid var(--accent);
          margin-bottom: 24px;
        }

        .consultor-ementa p {
          margin: 0;
        }

        .consultor-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 0 24px 0;
        }

        .consultor-numbered-list {
          list-style: none;
          counter-reset: item;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .consultor-numbered-list li {
          counter-increment: item;
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.7;
          padding: 10px 14px;
          border-radius: 8px;
          background: var(--hover);
        }

        .consultor-numbered-list li::before {
          content: counter(item) ".";
          font-weight: 700;
          color: var(--accent);
          min-width: 22px;
          font-size: 13px;
          flex-shrink: 0;
        }

        .consultor-args-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .consultor-args-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .consultor-arg-item {
          padding: 10px 14px;
          border-radius: 8px;
          background: var(--hover);
          border-left: 3px solid;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        .consultor-conclusao-box {
          padding: 18px 22px;
          border-radius: 10px;
          background: var(--accent-light);
          border: 1px solid var(--accent);
        }

        .consultor-conclusao-box p {
          margin: 0;
        }

        .consultor-checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          background: var(--hover);
          cursor: pointer;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.7;
          transition: background 0.15s ease;
        }

        .consultor-checklist-item:hover {
          background: var(--card-bg);
        }

        .consultor-checkbox {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          flex-shrink: 0;
          margin-top: 2px;
          position: relative;
          transition: all 0.15s ease;
        }

        .consultor-checkbox:checked {
          background: #10B981;
          border-color: #10B981;
        }

        .consultor-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 1px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .consultor-ressalvas {
          padding: 16px 20px;
          border-radius: 10px;
          background: rgba(230, 126, 34, 0.06);
          border: 1px solid rgba(230, 126, 34, 0.2);
        }

        .consultor-ressalvas p {
          margin: 0;
        }

        .consultor-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
        }

        .consultor-action-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .skeleton-line {
          background: var(--border);
          border-radius: 6px;
          animation: pulse-skeleton 1.4s ease-in-out infinite;
        }

        @keyframes pulse-skeleton {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @media (max-width: 768px) {
          .consultor-form-grid {
            grid-template-columns: 1fr !important;
          }
          .consultor-args-grid {
            grid-template-columns: 1fr !important;
          }
          .consultor-parecer-card {
            padding: 20px 18px !important;
          }
          .consultor-parecer-titulo {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}
