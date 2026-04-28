'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, BarChart3, CalendarCheck, Circle, Clock, Lock,
  Sparkles, Timer, Crown, Flame,
  type LucideIcon,
} from 'lucide-react'
import { UsagePanel } from '@/components/UsagePanel'
import { ReferralPanel } from '@/components/ReferralPanel'
import { usePlan } from '@/hooks/usePlan'
import { CATALOG, agents, isUnlocked, type CatalogItem, type Plan } from '@/lib/catalog'
import s from './page.module.css'

/* ════════════════════════════════════════════════════════════════
 * AGENT_DETAILS — descrição rica + métrica de impacto + caso real
 * ────────────────────────────────────────────────────────────────
 * Cada agente do catálogo ganha 3 atributos extras pro card editorial:
 *   - longDesc : descrição enriquecida (1-2 linhas)
 *   - saves    : badge de impacto ("Economiza 4h/processo")
 *   - example  : caso real / exemplo de prompt
 * Categoria visual ('essencial' | 'avancado' | 'modulo') vem do
 * minPlan/kind do catalog (sem duplicar fonte de verdade).
 * ═══════════════════════════════════════════════════════════════ */
const AGENT_DETAILS: Record<string, { longDesc: string; saves: string; example: string; useCases?: string[] }> = {
  chat:         { longDesc: 'Orquestrador que lê sua intenção e chama o agente certo automaticamente.',         saves: 'Resposta em 8s',          example: 'Ex: "Calcule prazo de embargos de declaração"', useCases: ['Triagem', 'Orquestração'] },
  resumidor:    { longDesc: 'Lê contratos de 80 páginas e devolve sumário executivo com cláusulas críticas marcadas.', saves: 'Economiza 2h por contrato', example: 'Ex: M&A, locação comercial, prestação de serviço', useCases: ['Contratos', 'M&A', 'Due diligence'] },
  pesquisador:  { longDesc: 'Busca jurisprudência STF/STJ com link verificado e ementa rastreável — recusa quando não acha.', saves: 'Economiza 4h por caso',   example: 'Ex: "Súmula 231 STJ aplicada a furto qualificado"', useCases: ['STF/STJ', 'Fundamentação', 'Súmulas'] },
  redator:      { longDesc: 'Gera peças processuais com fundamentação correta, citação verificada e formato OAB.', saves: 'Economiza 6h por peça',    example: 'Ex: petição inicial, contestação, recurso especial', useCases: ['Petição inicial', 'Contestação', 'Recurso'] },
  calculador:   { longDesc: 'Prazos, juros, correção monetária INPC/IGPM/IPCA com feriado municipal e estadual.', saves: 'Zero erro de prazo',       example: 'Ex: prazo recursal CPC art. 1.003 + feriado SP', useCases: ['Prazos CPC', 'INPC/IGPM', 'Verbas rescisórias'] },
  legislacao:   { longDesc: 'Explica artigo de lei com doutrina, jurisprudência consolidada e enunciados FONAJE.', saves: 'Resposta em 12s',          example: 'Ex: "Explique art. 422 CC com Enunciado 26 CJF"', useCases: ['Artigos CC/CPP', 'Enunciados', 'Doutrina'] },
  rotina:       { longDesc: 'Agenda compromissos, audiências e fluxos do escritório com sync Google Calendar.',  saves: 'Zero conflito de agenda',  example: 'Ex: bloquear quintas pra audiência presencial', useCases: ['Agenda', 'Audiências', 'Fluxos'] },
  compliance:   { longDesc: 'Camada anti-claim proibido OAB · Provimento 205 + LGPD + audit log por usuário.',   saves: 'Zero infração ética',      example: 'Ex: bloqueio automático de "garantia de vitória"', useCases: ['Ético OAB', 'LGPD', 'Audit'] },

  negociador:   { longDesc: 'Calcula BATNA/ZOPA, mapeia cenários de acordo e sugere ancoragem com base em jurimetria.', saves: 'Acordos +28% mais altos', example: 'Ex: trabalhista CLT — ancoragem em 1,8x da causa', useCases: ['Trabalhista', 'Empresarial', 'Civil'] },
  professor:    { longDesc: 'Aulas sob medida sobre responsabilidade civil, contratos, direito digital e tributário.', saves: 'Aprende em 20min',     example: 'Ex: "Me explique culpa concorrente em acidente de trânsito"', useCases: ['Civil', 'Digital', 'Tributário'] },
  consultor:    { longDesc: 'Avalia risco processual e sugere linha estratégica com base em jurisprudência local.', saves: 'Decisão em 30min',       example: 'Ex: "Vale apostar em embargos infringentes neste caso?"', useCases: ['Risco processual', 'Estratégia', 'Jurimetria'] },
  simulado:     { longDesc: 'Treino OAB e provas objetivas com estatística de erro por matéria e ranking.',       saves: 'Aprovação +40%',           example: 'Ex: simulado adaptativo OAB 2ª fase Cível', useCases: ['OAB 1ª', 'OAB 2ª', 'Concursos'] },
  tradutor:     { longDesc: 'Tradução juramentada PT↔EN/ES com terminologia jurídica BR e formato cartorário.',  saves: 'Economiza R$ 380/lauda',  example: 'Ex: contrato internacional, sentença estrangeira', useCases: ['PT↔EN', 'PT↔ES', 'Cartorário'] },
  planilhas:    { longDesc: 'Timesheet, controle de honorários, repasse a sócio e relatório financeiro mensal.',  saves: 'Fechamento em 15min',      example: 'Ex: relatório de horas Q1 por cliente', useCases: ['Timesheet', 'Honorários', 'Fechamento'] },
  parecerista:  { longDesc: 'Pareceres jurídicos fundamentados com doutrina majoritária e jurisprudência consolidada.', saves: 'Parecer em 45min',  example: 'Ex: parecer sobre cláusula leonina em SCP', useCases: ['Societário', 'Regulatório', 'Empresarial'] },
  revisor:      { longDesc: 'Revisão fina de contratos, peças e pareceres — pega cláusula faltante, contradição, risco.', saves: 'Pega 94% dos erros', example: 'Ex: revisão de M&A 60p antes de assinatura', useCases: ['Contratos', 'M&A', 'Peças'] },
  contestador:  { longDesc: 'Gera contestação completa com preliminares, mérito, réplica antecipada e provas.',  saves: 'Economiza 8h',             example: 'Ex: contestação trabalhista verbas rescisórias', useCases: ['Civil', 'Trabalhista', 'Consumidor'] },
  recursos:     { longDesc: 'Apelação, agravo, embargos, recurso especial — escolhe o cabível e fundamenta.',    saves: 'Cabimento em 3min',        example: 'Ex: REsp por divergência jurisprudencial', useCases: ['Apelação', 'Agravo', 'REsp/RE'] },
  audiencia:    { longDesc: 'Sustentação oral, roteiro de audiência e perguntas de inquirição preparadas.',      saves: 'Roteiro em 20min',         example: 'Ex: sustentação no TJSP — recurso em apelação', useCases: ['Sustentação', 'Inquirição', 'Cível/Criminal'] },
  estrategista: { longDesc: 'Plano estratégico do caso com timeline, custo estimado, probabilidade e plano B.',  saves: 'Plano em 1h',              example: 'Ex: estratégia trabalhista para grande devedor', useCases: ['Plano de caso', 'Timeline', 'Plano B'] },
  atendimento:  { longDesc: 'Roteiro de entrevista inicial com cliente — colhe fatos, documentos e expectativas.', saves: 'Triagem em 25min',        example: 'Ex: primeiro atendimento de cível indenizatório', useCases: ['Triagem', 'Entrevista', 'Documentos'] },
  'marketing-ia': { longDesc: 'Conteúdo OAB-compliant pra Instagram, LinkedIn, blog — sem mercantilização nem promessa.', saves: '12 posts/mês', example: 'Ex: carrossel sobre prazo de devolução em e-commerce', useCases: ['Instagram', 'LinkedIn', 'Blog'] },

  // ───────── Novos agentes v10.8 (2026-04-23) ─────────
  cnj:         { longDesc: 'Consulta DataJud CNJ em 20 tribunais e monitora movimentação — alerta no WhatsApp em tempo real.', saves: 'Zero polling manual',    example: 'Ex: "puxa andamento do 0001234-56.2026.8.13.0702"', useCases: ['DataJud', 'STF/STJ', 'WhatsApp'] },
  comparador:  { longDesc: 'Diff v1 × v2 de contratos com análise IA do que mudou — exporta PDF colorido pra cliente revisar.', saves: 'Economiza 40min/revisão', example: 'Ex: "compara esses dois contratos de distribuição"',    useCases: ['Contratos', 'Diff', 'PDF export'] },
  risco:       { longDesc: 'Score 0-100 de risco jurídico com top 3 pontos e probabilidade de sucesso — disclaimer firme.',      saves: 'Análise em 30s',         example: 'Ex: "avalia risco desse contrato de distribuição"',   useCases: ['Executive summary', 'Probabilidade', 'Slide 1-page'] },
  flashcards:  { longDesc: 'SM-2 spaced repetition igual Anki — gera deck de qualquer aula do Professor.',                       saves: 'Retenção 3-5x maior',    example: 'Ex: flashcards de responsabilidade civil objetiva',  useCases: ['SM-2', 'OAB', 'Streak'] },
  plano:       { longDesc: 'Plano de estudos dia-a-dia até a data da prova, ajustando ao seu desempenho real.',                 saves: 'Fim da paralisia',       example: 'Ex: "plano de OAB em 83 dias, 3h/dia"',              useCases: ['Cronograma', 'OAB', 'Notificação'] },
  casos:       { longDesc: 'Pastas por cliente com processos CNJ, timeline, tags e busca semântica — o CRM-lite jurídico.',     saves: 'Dossiê em 1 clique',     example: 'Ex: "me mostra tudo do cliente Marina nos últimos 30d"', useCases: ['CRM jurídico', 'Timeline', 'Busca'] },
  jurimetria:  { longDesc: 'Estatística real por vara, relator, tipo de ação — fim do achismo sobre expectativa processual.',   saves: 'Expectativa com dado',   example: 'Ex: "jurimetria de dano moral em negativação no TJ-MG"', useCases: ['BI jurídico', 'Mediana', 'Benchmark'] },
  marketing:   { longDesc: 'Calendário editorial 30 dias pré-validado contra Provimento 205 — semáforo verde/amarelo/vermelho.', saves: '0 risco de representação', example: 'Ex: "calendário de família, tom editorial"',         useCases: ['Prov. 205', 'Instagram', 'LinkedIn'] },
}

/* ═════════════════════════════════════════════════════════════
 * Dashboard — Gabinete Pralvex (wired ao catalog em 2026-04-17)
 * ─────────────────────────────────────────────────────────────
 * Grid de agentes vem de agents() do catalog.
 * Locked → /dashboard/planos | !implemented → /dashboard/em-breve.
 * Editorial atelier: N° serial, Playfair italic, stone hairlines.
 * ═════════════════════════════════════════════════════════════ */

interface Stats {
  documentos: number
  prazosUrgentes: number
  saldo: number
  totalInteracoesSemana: number
  prazosList: { titulo: string; data_limite: string; status: string }[]
}

interface AgentCount {
  agente: string
  count: number
}

interface RecentItem {
  id: string
  agente: string
  mensagem_usuario: string
  created_at: string
}

/* Lookup O(1) por slug para resolver agente → CatalogItem */
const BY_SLUG = new Map(CATALOG.map(item => [item.slug, item]))

/* Agentes novos introduzidos na v10.8 (2026-04-23) — ganham ribbon NOVO */
const NEW_V10_8 = new Set(['cnj', 'comparador', 'risco', 'flashcards', 'plano', 'casos'])

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/** Converte número em extenso português pra heading editorial. */
function numberToPt(n: number): string {
  const map: Record<number, string> = {
    20: 'Vinte', 21: 'Vinte e um', 22: 'Vinte e dois', 23: 'Vinte e três',
    24: 'Vinte e quatro', 25: 'Vinte e cinco', 26: 'Vinte e seis',
    27: 'Vinte e sete', 28: 'Vinte e oito', 29: 'Vinte e nove', 30: 'Trinta',
    31: 'Trinta e um', 32: 'Trinta e dois',
  }
  return map[n] ?? String(n)
}

function pad2(n: number) { return n.toString().padStart(2, '0') }

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `${min} min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function resolveHref(item: CatalogItem, userPlan: Plan): string {
  if (!isUnlocked(item, userPlan)) return '/dashboard/planos'
  if (!item.implemented) return `/dashboard/em-breve?feature=${item.slug}`
  return item.href
}

export default function DashboardPage() {
  const supabase = createClient()
  const { plano } = usePlan()
  const userPlan = (plano || 'free') as Plan

  const [stats, setStats] = useState<Stats>({
    documentos: 0, prazosUrgentes: 0, saldo: 0, totalInteracoesSemana: 0, prazosList: [],
  })
  const [agentCounts, setAgentCounts] = useState<AgentCount[]>([])
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const usuarioId = await resolveUsuarioId()
      if (!usuarioId) { setDataLoading(false); return }

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

      const [docs, prazos, financeiro, historicoSemana, historicoRecente] = await Promise.all([
        supabase.from('documentos').select('id', { count: 'exact' }).eq('usuario_id', usuarioId),
        supabase.from('prazos').select('titulo,data_limite,status').eq('usuario_id', usuarioId).order('data_limite'),
        supabase.from('financeiro').select('valor,tipo').eq('usuario_id', usuarioId),
        supabase.from('historico')
          .select('agente')
          .eq('usuario_id', usuarioId)
          .gte('created_at', sevenDaysAgo),
        supabase.from('historico')
          .select('id,agente,mensagem_usuario,created_at')
          .eq('usuario_id', usuarioId)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const hoje = new Date()
      const urgentes = (prazos.data ?? []).filter(p => {
        const diff = (new Date(p.data_limite + 'T00:00:00').getTime() - hoje.getTime()) / 86400000
        return diff >= 0 && diff <= 7 && p.status === 'pendente'
      })

      const saldo = (financeiro.data ?? []).reduce((acc, f) =>
        f.tipo === 'receita' ? acc + Number(f.valor) : acc - Number(f.valor), 0)

      const counter = new Map<string, number>()
      for (const row of historicoSemana.data ?? []) {
        const key = (row.agente || '').toLowerCase().trim()
        if (!key) continue
        counter.set(key, (counter.get(key) ?? 0) + 1)
      }
      const agentArr: AgentCount[] = Array.from(counter.entries())
        .map(([agente, count]) => ({ agente, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      setStats({
        documentos: docs.count ?? 0,
        prazosUrgentes: urgentes.length,
        saldo,
        totalInteracoesSemana: (historicoSemana.data ?? []).length,
        prazosList: (prazos.data ?? []).slice(0, 3),
      })
      setAgentCounts(agentArr)
      setRecent((historicoRecente.data ?? []) as RecentItem[])
      setDataLoading(false)
    }
    load()
  }, [supabase])

  function diasRestantes(data: string) {
    const diff = Math.ceil((new Date(data + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    return diff
  }
  function barClass(dias: number) {
    if (dias <= 7)  return 'critical'
    if (dias <= 30) return 'warning'
    return 'normal'
  }
  function fmt(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const [greeting, setGreeting] = useState('Olá')
  const [todayCapitalized, setTodayCapitalized] = useState('')
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    setGreeting(hour < 5 ? 'Boa noite' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite')
    const todayStr = now.toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    setTodayCapitalized(todayStr.charAt(0).toUpperCase() + todayStr.slice(1))
  }, [])

  const maxAgentCount = useMemo(
    () => agentCounts.reduce((m, a) => Math.max(m, a.count), 0) || 1,
    [agentCounts],
  )

  const agentList = useMemo(() => agents(), [])
  const totalAgents = agentList.length

  /* Agrupa por categoria pra render editorial: novos primeiro (hype), essenciais, avançados */
  const agentGroups = useMemo(() => {
    const novos = agentList.filter(a => NEW_V10_8.has(a.slug))
    const essenciais = agentList.filter(a => !NEW_V10_8.has(a.slug) && (a.minPlan === 'free' || a.minPlan === 'starter'))
    const avancados = agentList.filter(a => !NEW_V10_8.has(a.slug) && (a.minPlan === 'pro' || a.minPlan === 'enterprise'))
    return [
      { key: 'novos',       label: 'Novos · v10.8', caption: 'Recém-lançados · beta aberto', Icon: Flame,    items: novos,      highlight: true  },
      { key: 'essenciais',  label: 'Essenciais',    caption: 'Disponíveis a partir do Escritório',  Icon: Sparkles, items: essenciais, highlight: false },
      { key: 'avancados',   label: 'Avançados',     caption: 'Liberados na Firma e Enterprise',     Icon: Crown,    items: avancados,  highlight: false },
    ].filter(g => g.items.length > 0)
  }, [agentList])

  return (
    <div className={`page-content ${s.dashAtelier}`}>

      <motion.header
        className={s.dashHeader}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className={s.dashSerial}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
        >
          <span className={s.dashSerialDot} />
          <span>N° 001 · GABINETE · MMXXVI</span>
        </motion.div>
        <motion.h1
          className={s.dashAtelierH1}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {greeting}, <em>advogado</em>.
        </motion.h1>
        <motion.p
          className={s.dashHeaderSub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          {todayCapitalized}
        </motion.p>
        <motion.div
          className={s.dashHairline}
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.85 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left center' }}
        />
      </motion.header>

      <section className={s.dashProvas} aria-label="Indicadores do gabinete">
        <ProvaCell
          roman="I"
          value={stats.totalInteracoesSemana}
          label="Interações"
          caption="Últimos 7 dias"
          href="/dashboard/historico"
        />
        <ProvaCell
          roman="II"
          value={stats.documentos}
          label="Documentos"
          caption="Analisados pela IA"
          href="/dashboard/resumidor"
        />
        <ProvaCell
          roman="III"
          value={stats.prazosUrgentes}
          label="Prazos"
          caption="Próximos 7 dias"
          warning={stats.prazosUrgentes > 0}
          href="/dashboard/prazos"
        />
        <ProvaCell
          roman="IV"
          moneyValue={fmt(stats.saldo)}
          label="Saldo"
          caption={stats.saldo >= 0 ? 'Positivo' : 'Negativo'}
          warning={stats.saldo < 0}
          href="/dashboard/financeiro"
        />
      </section>

      <section className={s.dashPanelsRow} aria-label="Consumo e indicação">
        <UsagePanel />
        <ReferralPanel />
      </section>

      <section className={s.dashGridUsage} aria-label="Uso dos agentes e atividade recente">

        <article className={s.dashCard}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPÍTULO I · ATELIER</div>
              <h2 className={s.dashCardTitle}>Uso dos <em>agentes</em></h2>
              <p className={s.dashCardSub}>
                {dataLoading
                  ? 'Contando interações dos últimos 7 dias...'
                  : stats.totalInteracoesSemana === 0
                    ? 'Semana em silêncio — o atelier ainda não abriu'
                    : `${stats.totalInteracoesSemana} interação${stats.totalInteracoesSemana === 1 ? '' : 'ões'} nos últimos 7 dias`}
              </p>
            </div>
            <Link href="/dashboard/historico" className={s.dashCardAction}>
              Ver tudo <ArrowRight size={12} strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <div className={s.dashBars}>
            {dataLoading ? (
              <div>
                <div className={s.dashSkel} />
                <div className={s.dashSkel} />
                <div className={s.dashSkel} />
              </div>
            ) : agentCounts.length === 0 ? (
              <div className={s.dashEmptyState}>
                <BarChart3 size={22} strokeWidth={1.5} aria-hidden />
                <div className={s.dashEmptyTitle}>O atelier ainda não girou</div>
                <div className={s.dashEmptySub}>Cada consulta a um agente vira linha aqui, ordenada por volume.</div>
                <Link href="/dashboard/chat" className={s.dashEmptyCta}>
                  Abrir chat <ArrowRight size={12} strokeWidth={2} aria-hidden />
                </Link>
              </div>
            ) : (
              agentCounts.map((a, i) => {
                const meta = BY_SLUG.get(a.agente)
                const label = meta?.label ?? a.agente
                const href = meta ? resolveHref(meta, userPlan) : '#'
                const pct = (a.count / maxAgentCount) * 100
                return (
                  <Link key={a.agente} href={href} className={s.dashBarRow}>
                    <span className={s.dashBarNum}>{pad2(i + 1)}</span>
                    <span className={s.dashBarLabel}>{label}</span>
                    <div className={s.dashBarTrack}>
                      <div className={s.dashBarFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={s.dashBarCount}>{a.count}</span>
                  </Link>
                )
              })
            )}
          </div>
        </article>

        <article className={s.dashCard}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPÍTULO II · DIÁRIO</div>
              <h2 className={s.dashCardTitle}>Atividade <em>recente</em></h2>
              <p className={s.dashCardSub}>
                {dataLoading
                  ? 'Carregando...'
                  : recent.length === 0
                    ? 'Diário em branco'
                    : 'Últimas cinco interações'}
              </p>
            </div>
            <Link href="/dashboard/historico" className={s.dashCardAction}>
              Histórico <ArrowRight size={12} strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <div className={s.dashActivity}>
            {dataLoading ? (
              <>
                <div className={s.dashSkelRow} />
                <div className={s.dashSkelRow} />
                <div className={s.dashSkelRow} />
              </>
            ) : recent.length === 0 ? (
              <div className={s.dashEmptyState}>
                <Clock size={22} strokeWidth={1.5} aria-hidden />
                <div className={s.dashEmptyTitle}>O diário abre em branco</div>
                <div className={s.dashEmptySub}>Toda consulta vira linha do arquivo, em ordem cronológica.</div>
              </div>
            ) : (
              recent.map((r, i) => {
                const meta = BY_SLUG.get(r.agente.toLowerCase())
                const label = meta?.label ?? r.agente
                const href = meta ? resolveHref(meta, userPlan) : '/dashboard/historico'
                const Icon: LucideIcon = meta?.Icon ?? Circle
                const snippet = (r.mensagem_usuario || '').slice(0, 64)
                return (
                  <Link key={r.id} href={href} className={s.dashActivityRow}>
                    <span className={s.dashActivityNum}>{ROMAN[i] ?? (i+1)}</span>
                    <div className={s.dashActivityIcon}>
                      <Icon size={15} strokeWidth={1.75} aria-hidden />
                    </div>
                    <div className={s.dashActivityInfo}>
                      <div className={s.dashActivityName}>{label}</div>
                      <div className={s.dashActivitySnippet}>{snippet || '—'}</div>
                    </div>
                    <span className={s.dashActivityTime}>{relativeTime(r.created_at)}</span>
                  </Link>
                )
              })
            )}
          </div>
        </article>

      </section>

      <section className={s.dashGridMain}>

        <article className={s.dashCard} style={{
          background: 'radial-gradient(140% 110% at 50% 0%, rgba(191,166,142,0.07), transparent 60%), rgba(15,15,15,0.85)',
        }}>
          <div className={s.dashCardHead}>
            <div>
              <div className={s.dashCardCap}>CAPÍTULO III · ATELIER · {totalAgents} ESPECIALISTAS</div>
              <h2 className={s.dashCardTitle}>{numberToPt(totalAgents)} <em>agentes</em></h2>
              <p className={s.dashCardSub}>
                Cada um treinado num recorte específico do Direito BR · <span style={{ color: '#d4ae6a', fontWeight: 600 }}>6 novos na v10.8</span> · clique pra abrir o atelier
              </p>
            </div>
            <Link href="/dashboard/chat" className={s.dashCardAction}>
              Chat orquestrador <ArrowRight size={12} strokeWidth={2} aria-hidden />
            </Link>
          </div>

          {/* Categorias com Framer Motion stagger */}
          {agentGroups.map((group, gi) => {
            const GroupIcon = group.Icon
            return (
              <div key={group.key} style={{ marginTop: gi === 0 ? 8 : 28 }}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginBottom: 16, paddingBottom: 12,
                    borderBottom: '1px solid rgba(191,166,142,0.10)',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: group.highlight
                      ? 'linear-gradient(135deg, rgba(245,232,211,0.22), rgba(191,166,142,0.14))'
                      : 'linear-gradient(135deg, rgba(212,174,106,0.14), rgba(122,95,72,0.08))',
                    border: group.highlight
                      ? '1px solid rgba(245,232,211,0.45)'
                      : '1px solid rgba(212,174,106,0.30)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: group.highlight ? '#f5e8d3' : '#e6d4bd', flexShrink: 0,
                    boxShadow: group.highlight
                      ? 'inset 0 0 0 1px rgba(245,232,211,0.15), 0 0 12px rgba(245,232,211,0.2)'
                      : 'none',
                  }}>
                    <GroupIcon size={15} strokeWidth={1.75} aria-hidden />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono, ui-monospace), monospace',
                      fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                      color: '#bfa68e', fontWeight: 700,
                    }}>
                      {group.label} · {group.items.length} agentes
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--text-muted)', marginTop: 2,
                    }}>
                      {group.caption}
                    </div>
                  </div>
                </motion.div>

                <div style={{
                  display: 'grid',
                  // minmax(min(100%, 270px), 1fr) é safe pattern — antes 270px fixo
                  // gerava overflow em viewports <340px (devices ultra-small).
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
                  gap: 22,
                }}>
                  {group.items.map((ag, i) => {
                    const Icon = ag.Icon
                    const locked = !isUnlocked(ag, userPlan)
                    const href = resolveHref(ag, userPlan)
                    const detail = AGENT_DETAILS[ag.slug] || { longDesc: ag.desc, saves: '', example: '', useCases: [] as string[] }
                    const isNew = NEW_V10_8.has(ag.slug)
                    return (
                      <motion.div
                        key={ag.slug}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{
                          duration: 0.45,
                          delay: Math.min(i * 0.04, 0.4),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileHover={{ y: -3 }}
                      >
                        <Link
                          href={href}
                          title={locked ? `Disponível no plano ${ag.minPlan}` : detail.longDesc}
                          aria-disabled={locked || undefined}
                          style={{
                            display: 'flex', flexDirection: 'column', gap: 12,
                            padding: 16, borderRadius: 14, height: '100%',
                            background: locked
                              ? 'rgba(10,10,10,0.55)'
                              : 'linear-gradient(180deg, rgba(20,20,20,0.85), rgba(10,10,10,0.85))',
                            border: locked
                              ? '1px solid rgba(191,166,142,0.06)'
                              : '1px solid rgba(191,166,142,0.12)',
                            opacity: locked ? 0.62 : 1,
                            textDecoration: 'none', color: 'inherit',
                            position: 'relative', overflow: 'hidden',
                            transition: 'border-color 0.25s, box-shadow 0.25s',
                          }}
                          onMouseEnter={e => {
                            if (locked) return
                            e.currentTarget.style.borderColor = 'rgba(212,174,106,0.35)'
                            e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,174,106,0.08)'
                          }}
                          onMouseLeave={e => {
                            if (locked) return
                            e.currentTarget.style.borderColor = 'rgba(191,166,142,0.12)'
                            e.currentTarget.style.boxShadow = ''
                          }}
                        >
                          {/* Spotlight gold no hover (decorativo) */}
                          {!locked && (
                            <span aria-hidden style={{
                              position: 'absolute', top: -50, right: -50,
                              width: 140, height: 140, borderRadius: '50%',
                              background: isNew
                                ? 'radial-gradient(circle, rgba(245,232,211,0.18), transparent 70%)'
                                : 'radial-gradient(circle, rgba(212,174,106,0.12), transparent 70%)',
                              pointerEvents: 'none',
                            }} />
                          )}

                          {/* Ribbon NOVO — canto superior direito, gradient champagne */}
                          {isNew && (
                            <span
                              aria-label="Novo agente"
                              style={{
                                position: 'absolute', top: 12, right: -34,
                                transform: 'rotate(35deg)',
                                padding: '2px 36px',
                                fontFamily: 'var(--font-mono, ui-monospace), monospace',
                                fontSize: 9, letterSpacing: '0.28em',
                                fontWeight: 700, textTransform: 'uppercase',
                                background: 'linear-gradient(90deg, #f5e8d3, #bfa68e, #8a6f55)',
                                color: '#1a1410',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                                zIndex: 2,
                              }}
                            >
                              Novo
                            </span>
                          )}

                          {/* Top row: icon + nº + lock/arrow */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            position: 'relative', zIndex: 1,
                          }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 11,
                              background: locked
                                ? 'rgba(191,166,142,0.04)'
                                : 'linear-gradient(135deg, rgba(212,174,106,0.18), rgba(122,95,72,0.08))',
                              border: '1px solid rgba(212,174,106,0.30)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: locked ? 'var(--text-muted)' : '#e6d4bd',
                              boxShadow: locked ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 14px rgba(212,174,106,0.18)',
                            }}>
                              <Icon size={17} strokeWidth={1.7} aria-hidden />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                fontFamily: 'var(--font-mono, ui-monospace), monospace',
                                fontSize: 9, letterSpacing: '0.22em', color: 'var(--text-muted)',
                                fontWeight: 700,
                              }}>
                                {String(gi * 100 + i + 1).padStart(3, '0').slice(-2)}
                              </span>
                              {locked
                                ? <Lock size={13} strokeWidth={2} style={{ color: 'var(--text-muted)' }} aria-hidden />
                                : <ArrowRight size={13} strokeWidth={1.75} style={{ color: '#bfa68e' }} aria-hidden />
                              }
                            </div>
                          </div>

                          {/* Nome + descrição */}
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                              fontFamily: "'Playfair Display', Georgia, serif",
                              fontStyle: 'italic', fontWeight: 500,
                              fontSize: 19, letterSpacing: '-0.01em',
                              color: locked ? 'var(--text-secondary)' : 'var(--text-primary)',
                              marginBottom: 4,
                            }}>
                              {ag.label}
                            </div>
                            <div style={{
                              fontSize: 12.5, lineHeight: 1.55,
                              color: 'var(--text-muted)',
                            }}>
                              {detail.longDesc}
                            </div>
                          </div>

                          {/* Footer: useCases pills + saves badge + example */}
                          <div style={{
                            marginTop: 'auto', position: 'relative', zIndex: 1,
                            display: 'flex', flexDirection: 'column', gap: 8,
                            paddingTop: 10,
                            borderTop: '1px dashed rgba(191,166,142,0.12)',
                          }}>
                            {detail.useCases && detail.useCases.length > 0 && (
                              <div style={{
                                display: 'flex', flexWrap: 'wrap', gap: 5,
                                marginBottom: 2,
                              }}>
                                {detail.useCases.map((uc, ui) => (
                                  <span key={ui} style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '2px 7px', borderRadius: 5,
                                    background: locked ? 'rgba(120,110,100,0.06)' : 'rgba(212,174,106,0.08)',
                                    border: `1px solid ${locked ? 'rgba(120,110,100,0.18)' : 'rgba(212,174,106,0.22)'}`,
                                    fontFamily: 'var(--font-mono, ui-monospace), monospace',
                                    fontSize: 9.5, letterSpacing: '0.08em',
                                    color: locked ? 'var(--text-muted)' : '#bfa68e',
                                    fontWeight: 600, whiteSpace: 'nowrap',
                                  }}>
                                    {uc}
                                  </span>
                                ))}
                              </div>
                            )}
                            {detail.saves && (
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                fontFamily: 'var(--font-mono, ui-monospace), monospace',
                                fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                                fontWeight: 700,
                                color: locked ? 'var(--text-muted)' : '#9ec28b',
                              }}>
                                <Timer size={11} strokeWidth={2} aria-hidden />
                                {detail.saves}
                              </div>
                            )}
                            {detail.example && (
                              <div style={{
                                fontSize: 11, lineHeight: 1.45,
                                color: 'var(--text-muted)',
                                fontStyle: 'italic',
                              }}>
                                {detail.example}
                              </div>
                            )}
                            {locked && (
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                fontFamily: 'var(--font-mono, ui-monospace), monospace',
                                fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
                                fontWeight: 700, color: '#d4ae6a',
                                marginTop: 2,
                              }}>
                                <Crown size={10} strokeWidth={2} aria-hidden />
                                Libera no plano {ag.minPlan}
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </article>

        <div className={s.dashSideCol}>

          <article className={s.dashCard}>
            <div className={s.dashCardHead}>
              <div>
                <div className={s.dashCardCap}>CAPÍTULO IV · AGENDA</div>
                <h2 className={s.dashCardTitle}>Prazos <em>próximos</em></h2>
                <p className={s.dashCardSub}>Monitoramento ativo</p>
              </div>
              <Link href="/dashboard/prazos" className={s.dashCardAction}>
                Ver todos <ArrowRight size={12} strokeWidth={2} aria-hidden />
              </Link>
            </div>
            <div className={s.dashPrazos}>
              {stats.prazosList.length === 0 ? (
                <div className={`${s.dashEmptyState} ${s.compact}`}>
                  <CalendarCheck size={20} strokeWidth={1.5} aria-hidden />
                  <div className={s.dashEmptyTitle}>Agenda em silêncio</div>
                  <div className={s.dashEmptySub}>Sem prazo no radar. Cadastre o primeiro e o alerta começa a rodar.</div>
                </div>
              ) : (
                stats.prazosList.map((p, i) => {
                  const dias = diasRestantes(p.data_limite)
                  const cls = barClass(dias)
                  return (
                    <div key={p.titulo + i} className={`${s.dashPrazoRow} ${s[cls]}`}>
                      <span className={s.dashPrazoBar} />
                      <div className={s.dashPrazoInfo}>
                        <div className={s.dashPrazoTitle}>{p.titulo}</div>
                        <div className={s.dashPrazoMeta}>
                          {new Date(p.data_limite + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className={s.dashPrazoDays}>
                        {dias < 0 ? 'Vencido' : dias === 0 ? 'Hoje' : `${dias}d`}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </article>

          <article className={s.dashCard}>
            <div className={s.dashCardHead}>
              <div>
                <div className={s.dashCardCap}>CAPÍTULO V · LIVRO-CAIXA</div>
                <h2 className={s.dashCardTitle}>Saldo <em>atual</em></h2>
                <p className={s.dashCardSub} suppressHydrationWarning>{typeof window === 'undefined' ? '' : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className={s.dashFinance}>
              <div className={s.dashFinanceValue} style={{ color: stats.saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {fmt(stats.saldo)}
              </div>
              <Link href="/dashboard/financeiro" className={s.dashFinanceCta}>
                Ver detalhes <ArrowRight size={12} strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </article>

        </div>
      </section>

    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 * ProvaCell (v10 editorial · count-up + scroll reveal + ambient glow)
 * ───────────────────────────────────────────────────────────────────────── */
function useCountUp(target: number, active: boolean, durationMs = 900): number {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    if (target === 0) { setN(0); return }
    const start = performance.now()
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    let raf: number
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs)
      setN(Math.round(target * ease(p)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, durationMs])
  return n
}

function ProvaCell({
  roman, value, moneyValue, label, caption, href, warning,
}: {
  roman: string
  value?: number
  moneyValue?: string
  label: string
  caption: string
  href: string
  warning?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const counted = useCountUp(value ?? 0, visible)
  const displayValue = moneyValue !== undefined ? moneyValue : counted.toLocaleString('pt-BR')

  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onViewportEnter={() => setVisible(true)}
      style={{ height: '100%' }}
    >
      <Link href={href} className={s.provaCell} onMouseMove={onMouseMove}>
        <span className={s.provaRoman}>{roman}</span>
        {moneyValue !== undefined ? (
          <div className={s.provaValueMoney}>{displayValue}</div>
        ) : (
          <div className={s.provaValue}>{displayValue}</div>
        )}
        <div className={s.provaLabel}>{label}</div>
        <div className={warning ? s.provaCaptionWarn : s.provaCaption}>{caption}</div>
      </Link>
    </motion.div>
  )
}
