'use client'

import { useState, useEffect, type ComponentType, type SVGProps } from 'react'
import {
  FileText, FileSignature, ShieldCheck, Mail, BookText, ScrollText,
  Users, UserSquare, Folder, Package, Settings, MailWarning, HelpCircle, ClipboardList,
  Clock, Search, ArrowRight, ArrowLeft, AlertTriangle, Sparkles, Wand2, Info,
  CheckCircle2, Check, Clipboard, RotateCcw, Pencil, PenSquare, Trash2, X, Inbox,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { useDraft, clearDraft } from '@/hooks/useDraft'
import { generateDocx, downloadBlob } from '@/lib/word-export'
import { saveDraft, listDrafts, deleteDraft, type DraftRow } from '@/lib/drafts'
import { SkeletonResult } from '@/components/Skeleton'
import { AgentProgress, AGENT_STEPS } from '@/components/AgentProgress'
import { toast } from '@/components/Toast'
import { AgentHero } from '@/components/AgentHero'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>

const LEGAL_TEMPLATES_WITH_CNPJ = new Set(['peticao', 'contestacao', 'contrato', 'notificacao', 'recurso', 'parecer'])

const TEMPLATES: Array<{ id: string; label: string; Icon: IconType; desc: string }> = [
  { id: 'peticao',      label: 'Petição Inicial',  Icon: FileText,      desc: 'Petição inicial para distribuição de ação' },
  { id: 'recurso',      label: 'Recurso',           Icon: RotateCcw,     desc: 'Apelação, Agravo ou Recurso Especial' },
  { id: 'contestacao',  label: 'Contestação',       Icon: ShieldCheck,   desc: 'Defesa do réu em resposta à petição' },
  { id: 'parecer',      label: 'Parecer Jurídico',  Icon: BookText,      desc: 'Análise técnica de questão jurídica' },
  { id: 'contrato',     label: 'Contrato',          Icon: ScrollText,    desc: 'Minutas e modelos contratuais' },
  { id: 'notificacao',  label: 'Notificação',       Icon: Mail,          desc: 'Notificação extrajudicial' },
]

interface WizardField {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'money'
  required?: boolean
  options?: string[]
  hint?: string
}

interface WizardSection {
  titulo: string
  Icon: IconType
  fields: WizardField[]
}

const WIZARD_FIELDS: Record<string, WizardSection[]> = {
  peticao: [
    {
      titulo: 'Partes', Icon: Users,
      fields: [
        { key: 'autor_nome', label: 'Nome do autor', placeholder: 'Ex: João Silva', type: 'text', required: true },
        { key: 'autor_qualificacao', label: 'Qualificação do autor', placeholder: 'Ex: brasileiro, casado, engenheiro, CPF 123.456.789-00, residente...', type: 'textarea', required: true },
        { key: 'reu_nome', label: 'Nome do réu', placeholder: 'Ex: Empresa XYZ Ltda', type: 'text', required: true },
        { key: 'reu_qualificacao', label: 'Qualificação do réu', placeholder: 'Ex: CNPJ 00.000.000/0000-00, sede em...', type: 'textarea', required: true, hint: 'Você pode usar o widget de consulta CNPJ acima para preencher automaticamente' },
      ],
    },
    {
      titulo: 'Fatos', Icon: FileText,
      fields: [
        { key: 'fatos', label: 'Narrativa dos fatos', placeholder: 'Descreva em ordem cronológica o que aconteceu, com datas, valores, documentos...', type: 'textarea', required: true },
      ],
    },
    {
      titulo: 'Direito', Icon: BookText,
      fields: [
        { key: 'area', label: 'Área do Direito', placeholder: '', type: 'select', options: ['Civil', 'Consumidor', 'Trabalhista', 'Tributário', 'Administrativo', 'Empresarial', 'Outro'], required: true },
        { key: 'valor_causa', label: 'Valor da causa', placeholder: '10.000,00', type: 'money', required: true },
      ],
    },
    {
      titulo: 'Pedidos', Icon: ClipboardList,
      fields: [
        { key: 'pedidos', label: 'Pedidos (um por linha)', placeholder: '1. Condenação ao pagamento de R$...\n2. Danos morais...\n3. Honorários advocatícios...', type: 'textarea', required: true },
      ],
    },
  ],

  contestacao: [
    {
      titulo: 'Processo', Icon: Folder,
      fields: [
        { key: 'numero_processo', label: 'Número do processo', placeholder: '0000000-00.0000.0.00.0000', type: 'text', required: true },
        { key: 'vara', label: 'Vara/Comarca', placeholder: 'Ex: 3ª Vara Cível de Uberlândia/MG', type: 'text', required: true },
      ],
    },
    {
      titulo: 'Réu (seu cliente)', Icon: UserSquare,
      fields: [
        { key: 'reu_nome', label: 'Nome', placeholder: '', type: 'text', required: true },
        { key: 'reu_qualificacao', label: 'Qualificação', placeholder: '', type: 'textarea', required: true },
      ],
    },
    {
      titulo: 'Tese de defesa', Icon: ShieldCheck,
      fields: [
        { key: 'preliminares', label: 'Preliminares (opcional)', placeholder: 'Ex: ilegitimidade passiva, prescrição, incompetência...', type: 'textarea' },
        { key: 'merito', label: 'Razões de mérito', placeholder: 'Por que o pedido do autor deve ser rejeitado?', type: 'textarea', required: true },
        { key: 'provas', label: 'Provas que pretende produzir', placeholder: 'Ex: depoimento pessoal, testemunhas, perícia...', type: 'textarea' },
      ],
    },
  ],

  recurso: [
    {
      titulo: 'Decisão recorrida', Icon: FileText,
      fields: [
        { key: 'tipo_recurso', label: 'Tipo de recurso', placeholder: '', type: 'select', options: ['Apelação', 'Agravo de Instrumento', 'Recurso Especial', 'Recurso Extraordinário', 'Embargos de Declaração'], required: true },
        { key: 'numero_processo', label: 'Número do processo', placeholder: '0000000-00.0000.0.00.0000', type: 'text', required: true },
        { key: 'data_decisao', label: 'Data da decisão', placeholder: '', type: 'date', required: true },
        { key: 'resumo_decisao', label: 'Resumo da decisão recorrida', placeholder: 'O que foi decidido?', type: 'textarea', required: true },
      ],
    },
    {
      titulo: 'Razões do recurso', Icon: PenSquare,
      fields: [
        { key: 'erros_decisao', label: 'Onde a decisão errou?', placeholder: 'Aponte os pontos específicos em que a sentença/acórdão se equivocou', type: 'textarea', required: true },
        { key: 'pedidos_recurso', label: 'O que pede no recurso?', placeholder: 'Reformar? Anular? Qual o provimento desejado?', type: 'textarea', required: true },
      ],
    },
  ],

  contrato: [
    {
      titulo: 'Tipo de contrato', Icon: ScrollText,
      fields: [
        { key: 'tipo_contrato', label: 'Tipo', placeholder: '', type: 'select', options: ['Prestação de serviços', 'Compra e venda', 'Locação', 'Representação comercial', 'Confidencialidade (NDA)', 'Outro'], required: true },
      ],
    },
    {
      titulo: 'Partes', Icon: Users,
      fields: [
        { key: 'contratante', label: 'Contratante (quem contrata)', placeholder: 'Nome completo + qualificação + CPF/CNPJ + endereço', type: 'textarea', required: true },
        { key: 'contratado', label: 'Contratado (quem executa)', placeholder: 'Nome completo + qualificação + CPF/CNPJ + endereço', type: 'textarea', required: true },
      ],
    },
    {
      titulo: 'Objeto e condições', Icon: Package,
      fields: [
        { key: 'objeto', label: 'Objeto do contrato', placeholder: 'O que será prestado/vendido/alugado?', type: 'textarea', required: true },
        { key: 'valor', label: 'Valor', placeholder: '10.000,00', type: 'money', required: true },
        { key: 'forma_pagamento', label: 'Forma e prazo de pagamento', placeholder: 'Ex: à vista via Pix, parcelado em 12x no cartão...', type: 'textarea', required: true },
        { key: 'prazo_vigencia', label: 'Prazo de vigência', placeholder: 'Ex: 12 meses, até 31/12/2026, indeterminado...', type: 'text', required: true },
      ],
    },
    {
      titulo: 'Condições especiais', Icon: Settings,
      fields: [
        { key: 'multa_rescisoria', label: 'Multa rescisória (%)', placeholder: 'Ex: 10% do valor restante', type: 'text' },
        { key: 'foro', label: 'Foro eleito', placeholder: 'Ex: Uberlândia/MG', type: 'text', required: true },
        { key: 'observacoes', label: 'Observações adicionais', placeholder: 'Cláusulas extras que você quer incluir', type: 'textarea' },
      ],
    },
  ],

  notificacao: [
    {
      titulo: 'Partes', Icon: Users,
      fields: [
        { key: 'notificante', label: 'Notificante (quem envia)', placeholder: 'Nome + qualificação + CPF/CNPJ', type: 'textarea', required: true },
        { key: 'notificado', label: 'Notificado (quem recebe)', placeholder: 'Nome + qualificação + endereço completo', type: 'textarea', required: true },
      ],
    },
    {
      titulo: 'Notificação', Icon: MailWarning,
      fields: [
        { key: 'motivo', label: 'Motivo da notificação', placeholder: 'Ex: cobrança de dívida, exigência de cumprimento de contrato, denúncia de locação...', type: 'textarea', required: true },
        { key: 'exigencia', label: 'O que exige do notificado?', placeholder: 'Ex: pagamento do valor X em 10 dias, entrega de documento...', type: 'textarea', required: true },
        { key: 'prazo', label: 'Prazo concedido', placeholder: 'Ex: 10 dias a partir do recebimento', type: 'text', required: true },
        { key: 'consequencia', label: 'Consequência do descumprimento', placeholder: 'Ex: ação judicial com pedido de multa, rescisão contratual...', type: 'textarea', required: true },
      ],
    },
  ],

  parecer: [
    {
      titulo: 'Consulta', Icon: HelpCircle,
      fields: [
        { key: 'consulente', label: 'Consulente', placeholder: 'Quem pediu o parecer', type: 'text', required: true },
        { key: 'questao', label: 'Questão jurídica', placeholder: 'Qual é a dúvida jurídica a ser respondida?', type: 'textarea', required: true },
      ],
    },
    {
      titulo: 'Contexto fático', Icon: ClipboardList,
      fields: [
        { key: 'fatos', label: 'Fatos relevantes', placeholder: 'Descreva o contexto factual', type: 'textarea', required: true },
        { key: 'documentos', label: 'Documentos analisados', placeholder: 'Contratos, decisões, pareceres anteriores...', type: 'textarea' },
      ],
    },
  ],
}

function wizardValuesToInstrucoes(template: string, values: Record<string, string>): string {
  const sections = WIZARD_FIELDS[template] || []
  const parts: string[] = []

  for (const section of sections) {
    parts.push(`== ${section.titulo.toUpperCase()} ==`)
    for (const field of section.fields) {
      const val = values[field.key]?.trim()
      if (val) {
        parts.push(`${field.label}: ${val}`)
      }
    }
    parts.push('')
  }

  return parts.join('\n').trim()
}

function formatMoneyBR(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10)
  return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface PecaResponse {
  titulo: string
  documento: string
  referencias_legais: string[]
  observacoes: string[]
  tipo: string
  confianca?: { nivel?: string; nota?: string }
}

export default function RedatorPage() {
  const [template, setTemplate]     = useState('')
  const [instrucoes, setInstrucoes] = useState('')
  const [gerando, setGerando]       = useState(false)
  const [peca, setPeca]             = useState<PecaResponse | null>(null)
  const [erro, setErro]             = useState('')
  const [copied, setCopied]         = useState(false)
  const [exportandoWord, setExportandoWord] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [savedBadge, setSavedBadge]         = useState(false)
  const [showDraftsModal, setShowDraftsModal] = useState(false)
  const [draftsList, setDraftsList]           = useState<DraftRow[]>([])
  const [loadingDrafts, setLoadingDrafts]     = useState(false)

  // CNPJ lookup state
  const [cnpjLookup, setCnpjLookup]   = useState('')
  const [cnpjLoading, setCnpjLoading] = useState(false)
  const [cnpjError, setCnpjError]     = useState('')

  // Wizard mode state
  const [modo, setModo] = useState<'livre' | 'guiado'>('livre')
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardValues, setWizardValues] = useState<Record<string, string>>({})

  const wizardSections = WIZARD_FIELDS[template] || []

  // Reset wizard when template or mode changes
  useEffect(() => {
    setCurrentStep(0)
    setWizardValues({})
  }, [template, modo])

  useDraft('pralvex-draft-redator', instrucoes, setInstrucoes)

  useEffect(() => {
    if (!showDraftsModal) return
    let cancelled = false
    setLoadingDrafts(true)
    listDrafts('redator')
      .then(rows => { if (!cancelled) setDraftsList(rows) })
      .finally(() => { if (!cancelled) setLoadingDrafts(false) })
    return () => { cancelled = true }
  }, [showDraftsModal])

  async function gerar(instrucoesOverride?: string) {
    const payloadInstrucoes = (instrucoesOverride ?? instrucoes).trim()
    if (!template || !payloadInstrucoes) return
    setGerando(true); setPeca(null); setErro(''); setSavedBadge(false)

    try {
      const res = await fetch('/api/redigir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, instrucoes: payloadInstrucoes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar documento')
      setPeca(data.peca)
      clearDraft('pralvex-draft-redator')

      // Fire-and-forget: save draft without blocking UI
      saveDraft('redator', data.peca?.titulo || 'Peça sem título', data.peca)
        .then(row => {
          if (row) {
            setCurrentDraftId(row.id)
            setSavedBadge(true)
            setTimeout(() => setSavedBadge(false), 3500)
          }
        })
        .catch(err => console.error('[redator/saveDraft]', err))
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar peça')
    } finally {
      setGerando(false)
    }
  }

  function wizardRequiredMissing(): string[] {
    const missing: string[] = []
    for (const section of wizardSections) {
      for (const field of section.fields) {
        if (field.required && !wizardValues[field.key]?.trim()) {
          missing.push(field.label)
        }
      }
    }
    return missing
  }

  async function gerarComWizard() {
    if (!template) return
    const missing = wizardRequiredMissing()
    if (missing.length > 0) {
      setErro(`Preencha os campos obrigatórios: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '...' : ''}`)
      return
    }
    const built = wizardValuesToInstrucoes(template, wizardValues)
    await gerar(built)
  }

  function loadDraft(d: DraftRow) {
    try {
      // Validar shape antes de cast — rascunhos antigos podem ter schema
      // diferente. Se conteudo nao tem `documento` (string), o render quebra
      // depois com peca.documento undefined.
      const c = d.conteudo as Partial<PecaResponse> | null | undefined
      if (!c || typeof c.documento !== 'string') {
        setErro('Rascunho corrompido — schema antigo. Crie uma peça nova.')
        return
      }
      setPeca(c as PecaResponse)
      setCurrentDraftId(d.id)
      setShowDraftsModal(false)
      setErro('')
    } catch {
      setErro('Não foi possível carregar o rascunho')
    }
  }

  async function handleDeleteDraft(id: string) {
    const ok = await deleteDraft(id)
    if (ok) {
      setDraftsList(list => list.filter(d => d.id !== id))
      if (currentDraftId === id) setCurrentDraftId(null)
    }
  }

  function fmtDate(iso: string) {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  function copiarDocumento() {
    if (!peca) return
    navigator.clipboard.writeText(peca.documento)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExportarWord() {
    if (!peca || exportandoWord) return
    setExportandoWord(true)
    try {
      const paragraphs = peca.documento.split(/\n\n+/).filter(p => p.trim())
      const sections = [{ paragraphs }]
      const blob = await generateDocx(peca.titulo || 'Peça Jurídica', sections)
      const safeTitle = (peca.titulo || 'peca').replace(/[^\w\s-]/g, '').trim().slice(0, 60) || 'peca'
      downloadBlob(blob, `${safeTitle}.docx`)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao exportar Word')
    } finally {
      setExportandoWord(false)
    }
  }

  async function handleCnpjLookup() {
    if (!cnpjLookup.trim()) return
    setCnpjLoading(true); setCnpjError('')
    try {
      const { lookupCNPJStrict, formatCnpj } = await import('@/lib/brasil-api')
      const result = await lookupCNPJStrict(cnpjLookup)
      if (!result.ok) {
        // Mensagem especifica por codigo (era 'CNPJ não encontrado' generico)
        setCnpjError(result.error)
        setCnpjLoading(false)
        return
      }
      const data = result.data
      const qualificacao = `${data.razao_social}${data.nome_fantasia ? ` (${data.nome_fantasia})` : ''}, CNPJ ${formatCnpj(data.cnpj)}, com sede em ${data.logradouro || '[INFORMACAO A COMPLETAR]'}, ${data.numero || 's/n'}${data.complemento ? `, ${data.complemento}` : ''}, ${data.bairro || ''}, ${data.municipio || ''}/${data.uf || ''}, CEP ${data.cep || ''}`.replace(/\s+/g, ' ').replace(/, ,/g, ',').trim()
      setInstrucoes(prev => prev ? `${prev}\n\n${qualificacao}` : qualificacao)
      setCnpjLookup('')
      toast('success', `${data.razao_social} adicionado às instruções`)
    } catch {
      setCnpjError('Erro ao consultar CNPJ. Tente novamente.')
    } finally {
      setCnpjLoading(false)
    }
  }

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      <AgentHero
        edition="Nº II"
        Icon={FileSignature}
        name="Redator"
        discipline="Peças processuais"
        description="Petição, recurso, contestação, parecer, contrato ou notificação. Modo guiado (wizard campo-a-campo) ou livre (instruções abertas). Export .docx pronto pra protocolar."
        accent="copper"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~90s' },
          { Icon: FileText, label: '6 templates', value: 'Petição · Recurso · Contestação · Parecer · Contrato · Notificação' },
          { Icon: ShieldCheck, label: 'Export', value: '.docx OAB-ready' },
        ]}
        steps={[
          { n: 'I', title: 'Escolha o template', desc: 'Petição inicial, contestação, recurso, contrato, notificação ou parecer.' },
          { n: 'II', title: 'Guiado ou livre', desc: 'Wizard campo-a-campo (seguro) ou instruções abertas (rápido).' },
          { n: 'III', title: 'Revise e exporte', desc: 'Preview em tela, confiança aferida, download .docx formatado.' },
        ]}
        shortcut="⌘S salvar"
      />
      {/* Header — controles de rascunhos */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedBadge && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, padding: '6px 12px',
              borderRadius: 20, background: 'var(--success-light)', color: 'var(--success)',
              border: '1px solid var(--success)',
            }}>
              <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden /> Salvo como rascunho
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowDraftsModal(true)}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <Clock size={14} strokeWidth={1.75} aria-hidden /> Meus rascunhos
          </button>
        </div>
      </div>

      <div className="redator-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Painel esquerdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Seletor de template */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Tipo de Peça
              </div>
              <div style={{ display: 'inline-flex', gap: 0, padding: 3, background: 'var(--hover)', borderRadius: 12 }}>
                <button
                  type="button"
                  onClick={() => setModo('livre')}
                  style={{
                    padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: modo === 'livre' ? 'var(--card-bg)' : 'transparent',
                    color: modo === 'livre' ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: modo === 'livre' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s ease',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Pencil size={14} strokeWidth={1.75} aria-hidden />Modo livre
                </button>
                <button
                  type="button"
                  onClick={() => setModo('guiado')}
                  style={{
                    padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: modo === 'guiado' ? 'var(--card-bg)' : 'transparent',
                    color: modo === 'guiado' ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: modo === 'guiado' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s ease',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Sparkles size={14} strokeWidth={1.75} aria-hidden />Modo guiado
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TEMPLATES.map(t => {
                const isActive = template === t.id
                const TIcon = t.Icon
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`template-card${isActive ? ' is-active' : ''}`}
                  >
                    {isActive && (
                      <CheckCircle2
                        size={15}
                        strokeWidth={1.75}
                        aria-hidden
                        className="template-card-check"
                        style={{ color: 'var(--accent)' }}
                      />
                    )}
                    <TIcon
                      size={16}
                      strokeWidth={1.75}
                      aria-hidden
                      className="template-card-icon"
                      style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                    />
                    <div
                      className="template-card-label"
                      style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}
                    >
                      {t.label}
                    </div>
                    <div className="template-card-desc">{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Instruções — Modo livre */}
          {modo === 'livre' && (
          <div className="section-card" style={{ padding: '18px 20px', flex: 1 }}>
            <label className="form-label">Instruções e Fatos</label>

            {/* CNPJ lookup helper — visível apenas para templates jurídicos */}
            {LEGAL_TEMPLATES_WITH_CNPJ.has(template) && (
              <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--accent-light)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Search size={12} strokeWidth={1.75} aria-hidden />Consultar CNPJ na Receita Federal
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={cnpjLookup}
                    onChange={e => setCnpjLookup(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCnpjLookup() } }}
                    placeholder="00.000.000/0000-00"
                    className="form-input"
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  <button
                    type="button"
                    onClick={handleCnpjLookup}
                    disabled={cnpjLoading}
                    className="btn-ghost"
                    style={{ whiteSpace: 'nowrap', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    {cnpjLoading ? 'Buscando...' : <><ArrowRight size={14} strokeWidth={1.75} aria-hidden /> Buscar</>}
                  </button>
                </div>
                {cnpjError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{cnpjError}</div>}
              </div>
            )}

            <textarea
              value={instrucoes}
              onChange={e => setInstrucoes(e.target.value)}
              placeholder={`Descreva os fatos relevantes, partes envolvidas, pedidos e qualquer informação necessária para a elaboração da peça...\n\nEx: Autor: João Silva, CPF 123.456.789-00. Réu: Empresa XYZ Ltda. Fato: inadimplemento contratual desde jan/2024...`}
              className="form-input"
              style={{ resize: 'vertical', minHeight: 180, fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{instrucoes.length > 0 ? `${instrucoes.length} caracteres` : 'Aguardando instruções...'}</span>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} strokeWidth={1.75} aria-hidden /> {erro}
              </div>
            )}

            <button
              onClick={() => gerar()}
              disabled={!template || !instrucoes.trim() || gerando}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {gerando
                ? <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" /></svg> Gerando peça com IA...</>
                : <><Wand2 size={14} strokeWidth={1.75} aria-hidden /> Gerar Peça</>
              }
            </button>
          </div>
          )}

          {/* Modo guiado — Wizard */}
          {modo === 'guiado' && (
          <div className="section-card" style={{ padding: '18px 20px', flex: 1 }}>
            {!template ? (
              <div style={{ padding: '36px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Sparkles size={32} strokeWidth={1.75} aria-hidden style={{ opacity: 0.35, display: 'block', margin: '0 auto 10px' }} />
                <div style={{ fontSize: 13 }}>Selecione um tipo de peça acima para começar.</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>O modo guiado vai te ajudar a preencher os campos passo a passo.</div>
              </div>
            ) : wizardSections.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Este template não tem campos guiados. Use o modo livre.
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Passo {currentStep + 1} de {wizardSections.length}: {wizardSections[currentStep].titulo}
                  </div>
                  <div style={{ height: 4, background: 'var(--hover)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${((currentStep + 1) / wizardSections.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>

                {/* CNPJ lookup helper (visível em todas as etapas que possam precisar) */}
                {LEGAL_TEMPLATES_WITH_CNPJ.has(template) && (
                  <div style={{ marginBottom: 14, padding: '10px 12px', background: 'var(--accent-light)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Search size={12} strokeWidth={1.75} aria-hidden />Consultar CNPJ na Receita Federal
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={cnpjLookup}
                        onChange={e => setCnpjLookup(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCnpjLookup() } }}
                        placeholder="00.000.000/0000-00"
                        className="form-input"
                        style={{ flex: 1, fontSize: 13 }}
                      />
                      <button
                        type="button"
                        onClick={handleCnpjLookup}
                        disabled={cnpjLoading}
                        className="btn-ghost"
                        style={{ whiteSpace: 'nowrap', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      >
                        {cnpjLoading ? 'Buscando...' : <><ArrowRight size={14} strokeWidth={1.75} aria-hidden /> Buscar</>}
                      </button>
                    </div>
                    {cnpjError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{cnpjError}</div>}
                  </div>
                )}

                {/* Current section fields */}
                {(() => {
                  const SectionIcon = wizardSections[currentStep].Icon
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <SectionIcon size={20} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {wizardSections[currentStep].titulo}
                      </h3>
                    </div>
                  )
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {wizardSections[currentStep].fields.map(field => {
                    const val = wizardValues[field.key] || ''
                    const setVal = (v: string) => setWizardValues(prev => ({ ...prev, [field.key]: v }))
                    return (
                      <div key={field.key}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                          {field.label}{field.required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
                        </label>
                        {field.type === 'text' && (
                          <input
                            type="text"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            placeholder={field.placeholder}
                            className="form-input"
                            style={{ fontSize: 13 }}
                          />
                        )}
                        {field.type === 'textarea' && (
                          <textarea
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            placeholder={field.placeholder}
                            rows={4}
                            className="form-input"
                            style={{ resize: 'vertical', minHeight: 90, fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.55 }}
                          />
                        )}
                        {field.type === 'select' && (
                          <select
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            className="form-input"
                            style={{ fontSize: 13 }}
                          >
                            <option value="">Selecione...</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                        {field.type === 'date' && (
                          <input
                            type="date"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            className="form-input"
                            style={{ fontSize: 13 }}
                          />
                        )}
                        {field.type === 'money' && (
                          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', padding: '0 12px',
                              background: 'var(--hover)', border: '1px solid var(--border)',
                              borderRight: 'none', borderTopLeftRadius: 8, borderBottomLeftRadius: 8,
                              fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
                            }}>R$</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={val}
                              onChange={e => setVal(e.target.value)}
                              onBlur={e => setVal(formatMoneyBR(e.target.value))}
                              placeholder={field.placeholder || '0,00'}
                              className="form-input"
                              style={{ fontSize: 13, flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                            />
                          </div>
                        )}
                        {field.hint && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Info size={11} strokeWidth={1.75} aria-hidden />{field.hint}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Erro */}
                {erro && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} strokeWidth={1.75} aria-hidden /> {erro}
                  </div>
                )}

                {/* Nav buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                    disabled={currentStep === 0}
                    className="btn-ghost"
                    style={{ fontSize: 13, opacity: currentStep === 0 ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <ArrowLeft size={14} strokeWidth={1.75} aria-hidden /> Anterior
                  </button>

                  {currentStep < wizardSections.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(s => s + 1)}
                      className="btn-primary"
                      style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      Próximo <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={gerarComWizard}
                      disabled={gerando}
                      className="btn-primary"
                      style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      {gerando
                        ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" /></svg> Gerando...</>
                        : <><Wand2 size={14} strokeWidth={1.75} aria-hidden /> Gerar peça</>
                      }
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          )}
        </div>

        {/* Painel direito — Preview */}
        <div className="section-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {peca ? peca.titulo : 'Prévia da Peça'}
              </div>
              {peca && <ConfidenceBadge confianca={peca?.confianca} />}
            </div>
            {peca && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={copiarDocumento}>
                {copied ? <Check size={14} strokeWidth={1.75} aria-hidden /> : <Clipboard size={14} strokeWidth={1.75} aria-hidden />} {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
            {peca && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5, opacity: exportandoWord ? 0.7 : 1, cursor: exportandoWord ? 'default' : 'pointer' }}
                disabled={exportandoWord}
                onClick={handleExportarWord}>
                <FileText size={14} strokeWidth={1.75} aria-hidden /> {exportandoWord ? 'Exportando...' : 'Exportar Word'}
              </button>
            )}
            {peca && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={() => window.print()}>
                <FileText size={14} strokeWidth={1.75} aria-hidden /> PDF
              </button>
            )}
          </div>

          {gerando ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AgentProgress loading steps={[...AGENT_STEPS.redator]} />
              <SkeletonResult />
            </div>
          ) : peca ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Documento */}
              <textarea readOnly value={peca.documento} style={{
                flex: 1, minHeight: 400, resize: 'none', border: 'none', outline: 'none',
                background: 'var(--input-bg)', borderRadius: 8, padding: 14,
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'var(--text-primary)',
                lineHeight: 1.7,
              }} />

              {/* Referências legais */}
              {peca.referencias_legais?.length > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 8 }}>
                    Referências Legais Citadas
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {peca.referencias_legais.map((ref, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--card-bg)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              {peca.observacoes?.length > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--warning-light)', borderLeft: '3px solid var(--warning)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--warning)', marginBottom: 8 }}>
                    Pontos para Revisão
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {peca.observacoes.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nova peça */}
              <button
                onClick={() => { setPeca(null); setInstrucoes(''); setTemplate(''); setWizardValues({}); setCurrentStep(0) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, width: '100%', padding: 11,
                  background: 'none', border: '1px dashed var(--border)',
                  borderRadius: 10, color: 'var(--text-muted)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s ease',
                }}
              >
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Nova peça
              </button>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PoweredByPralvex />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 300 }}>
              <FileText size={40} strokeWidth={1.75} aria-hidden style={{ opacity: 0.3 }} />
              <span style={{ fontSize: 13, textAlign: 'center' }}>
                Selecione um template, informe os detalhes<br />e clique em &quot;Gerar Peça&quot;
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Meus rascunhos */}
      {showDraftsModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDraftsModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <span className="modal-title">Meus rascunhos</span>
              <button className="modal-close" onClick={() => setShowDraftsModal(false)}><X size={16} strokeWidth={1.75} aria-hidden /></button>
            </div>
            <div className="modal-body">
              {loadingDrafts ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30, color: 'var(--text-muted)', gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" />
                  </svg>
                  Carregando rascunhos...
                </div>
              ) : draftsList.length === 0 ? (
                <div style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Inbox size={40} strokeWidth={1.75} aria-hidden style={{ opacity: 0.4, display: 'block', margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 13 }}>O rol de rascunhos está vazio.</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Cada peça gerada entra aqui como rascunho.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 460, overflowY: 'auto' }}>
                  {draftsList.map(d => (
                    <div key={d.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      transition: 'all 0.15s',
                    }}>
                      <button
                        type="button"
                        onClick={() => loadDraft(d)}
                        style={{
                          flex: 1, textAlign: 'left', background: 'none', border: 'none',
                          cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {d.titulo || 'Sem título'}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                            background: 'var(--accent-light)', color: 'var(--accent)',
                          }}>v{d.versao}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} strokeWidth={1.75} aria-hidden />
                          {fmtDate(d.created_at)}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(d.id)}
                        title="Excluir rascunho"
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: '1px solid var(--border)',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--danger-light)'
                          e.currentTarget.style.color = 'var(--danger)'
                          e.currentTarget.style.borderColor = 'var(--danger)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'none'
                          e.currentTarget.style.color = 'var(--text-muted)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                        }}
                      >
                        <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .redator-main-grid { grid-template-columns: 1fr !important; }
        }
        .template-card {
          position: relative;
          padding: 12px 14px;
          border-radius: 10px;
          text-align: left;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--card-bg);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.2s ease,
                      background 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .template-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(19, 32, 37, 0.10),
                      0 2px 6px rgba(19, 32, 37, 0.05);
          border-color: var(--accent);
        }
        .template-card.is-active {
          transform: scale(1.02);
          border: 2.5px solid var(--accent);
          background: var(--accent-light);
          padding: 10px 12px;
          box-shadow: 0 6px 20px rgba(191, 166, 142, 0.18);
        }
        .template-card.is-active:hover {
          transform: scale(1.02) translateY(-1px);
        }
        .template-card-check {
          position: absolute;
          top: 8px;
          right: 10px;
          color: var(--accent);
          line-height: 1;
        }
        .template-card-icon {
          display: block;
          margin-bottom: 6px;
          line-height: 1;
        }
        .template-card-label {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .template-card-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.35;
        }
        @media (max-width: 640px) {
          .template-card { padding: 10px 12px; }
          .template-card.is-active { padding: 8px 10px; }
          .template-card-check { top: 6px; right: 8px; }
        }
      `}</style>
    </div>
  )
}
