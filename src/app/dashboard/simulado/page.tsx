'use client'

import { useState } from 'react'
import {
  FileText,
  Zap,
  ArrowRight,
  AlertTriangle,
  Clipboard,
  Check,
  RotateCcw,
  Info,
  Bookmark,
  ListChecks,
  HelpCircle,
  BookOpen,
  Book,
  Building2,
  CheckCircle2,
} from 'lucide-react'

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
  'Tributário',
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
  { value: 'Regulatorio', label: 'Regulatório' },
]

const EXEMPLOS = [
  { tema: 'Responsabilidade civil por vazamento de dados', area: 'Digital', contexto: 'Empresa de tecnologia sofreu incidente de segurança que expôs dados pessoais de 5.000 clientes. A empresa notificou a ANPD em 48h, mas não comunicou os titulares afetados. Um grupo de clientes acionou o Procon e ameaça ação coletiva.' },
  { tema: 'Rescisão indireta por assédio moral', area: 'Trabalhista', contexto: 'Funcionário com 8 anos de empresa relata situações reiteradas de humilhação pelo superior hierárquico, incluindo exposição pública de erros, ameaças veladas de demissão e isolamento da equipe. Possui prints de mensagens e duas testemunhas.' },
  { tema: 'Exclusão de sócio minoritário', area: 'Empresarial', contexto: 'Sociedade limitada com 3 sócios. Sócio minoritário (15%) descobriu que os majoritários desviaram R$ 400 mil em contratos simulados com empresa de fachada. O contrato social prevê cláusula de arbitragem, mas não há cláusula específica sobre exclusão.' },
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
        throw new Error('O parecer não foi gerado corretamente. Tente novamente.')
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
      '=== PARECER JURÍDICO ===',
      '',
      'EMENTA',
      parecer.ementa,
      '',
      'FATOS',
      parecer.fatos,
      '',
      'QUESTÃO JURÍDICA',
      parecer.questao_juridica,
      '',
      'FUNDAMENTAÇÃO LEGAL',
      parecer.fundamentacao_legal,
      '',
      'DOUTRINA APLICÁVEL',
      parecer.doutrina_aplicavel,
      '',
      'JURISPRUDÊNCIA RELEVANTE',
      parecer.jurisprudencia_relevante,
      '',
      'CONCLUSÃO E RECOMENDAÇÃO',
      parecer.conclusao_recomendacao,
      '',
      '---',
      parecer.disclaimer,
    ].join('\n')
    copiarSecao(texto, 'completo')
  }

  const secoesParecer = parecer ? [
    { id: 'ementa', titulo: 'Ementa', conteudo: parecer.ementa, Icon: Bookmark },
    { id: 'fatos', titulo: 'Fatos', conteudo: parecer.fatos, Icon: ListChecks },
    { id: 'questao', titulo: 'Questão jurídica', conteudo: parecer.questao_juridica, Icon: HelpCircle },
    { id: 'fundamentacao', titulo: 'Fundamentação legal', conteudo: parecer.fundamentacao_legal, Icon: BookOpen },
    { id: 'doutrina', titulo: 'Doutrina aplicável', conteudo: parecer.doutrina_aplicavel, Icon: Book },
    { id: 'jurisprudencia', titulo: 'Jurisprudência relevante', conteudo: parecer.jurisprudencia_relevante, Icon: Building2 },
    { id: 'conclusao', titulo: 'Conclusão e recomendação', conteudo: parecer.conclusao_recomendacao, Icon: CheckCircle2 },
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
          Pareceres jurídicos estruturados
        </p>
      </div>

      {/* Formulario */}
      {!parecer && !loading && (
        <>
          <div className="section-card" style={{ padding: '24px 28px', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} strokeWidth={1.75} aria-hidden />Configurar parecer
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="parecer-form-grid">
              {/* Area do Direito */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Área do Direito
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
                placeholder="Descreva a situação fática, as partes envolvidas, e os fatos relevantes para a análise jurídica..."
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
              style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600, opacity: (!tema.trim() || !contexto.trim()) ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <FileText size={16} strokeWidth={1.75} aria-hidden />
              Gerar Parecer
            </button>
          </div>

          {/* Exemplos rapidos */}
          <div className="section-card" style={{ padding: '20px 24px', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={13} strokeWidth={1.75} aria-hidden />Exemplos rápidos
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
                  <ArrowRight size={14} strokeWidth={1.75} aria-hidden style={{ color: 'var(--text-muted)', marginTop: 6 }} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Erro */}
      {erro && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} strokeWidth={1.75} aria-hidden /> {erro}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Elaborando parecer...</div>
          <div style={{ fontSize: 13 }}>Analisando {tema} na área de Direito {area}</div>
        </div>
      )}

      {/* Parecer gerado */}
      {parecer && (
        <>
          {/* Cabecalho do parecer */}
          <div className="section-card" style={{ padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
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
                style={{ fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {copied === 'completo'
                  ? <Check size={13} strokeWidth={1.75} aria-hidden />
                  : <Clipboard size={13} strokeWidth={1.75} aria-hidden />}
                {copied === 'completo' ? 'Copiado' : 'Copiar tudo'}
              </button>
              <button type="button" onClick={novoParecer} className="btn-secondary" style={{ fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={13} strokeWidth={1.75} aria-hidden />Novo parecer
              </button>
            </div>
          </div>

          {/* Secoes do parecer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {secoesParecer.map((secao) => {
              const SecaoIcon = secao.Icon
              return (
                <div key={secao.id} className="section-card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <SecaoIcon size={13} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
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
                      {copied === secao.id
                        ? <Check size={12} strokeWidth={1.75} aria-hidden />
                        : <Clipboard size={12} strokeWidth={1.75} aria-hidden />}
                      {copied === secao.id ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {secao.conteudo}
                  </div>
                </div>
              )
            })}

            {/* Disclaimer */}
            {parecer.disclaimer && (
              <div style={{
                padding: '14px 18px', borderRadius: 10,
                background: 'var(--accent-light)',
                borderLeft: '3px solid var(--accent)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Info size={13} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
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
            <button type="button" onClick={novoParecer} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
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
            marginBottom: 16,
          }}>
            <FileText size={32} strokeWidth={1.75} aria-hidden />
          </div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Gere pareceres jurídicos estruturados</div>
          <div style={{ fontSize: 13 }}>Preencha a área, o tema e o contexto acima para gerar seu parecer</div>
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
