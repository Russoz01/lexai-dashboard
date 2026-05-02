/* ════════════════════════════════════════════════════════════════════
 * demo-fallback · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Cached responses por agente para usar quando Anthropic estiver fora
 * (429 persistente, 5xx, overloaded depois de 3 tentativas).
 *
 * Ativado via env var DEMO_FALLBACK_ENABLED=1. Default OFF em prod —
 * só liga durante demos críticos.
 *
 * Flag `demo_fallback: true` é incluída no payload pra UI mostrar badge
 * "Resposta de demo" e log Sentry pra rastrear quando foi acionado.
 *
 * Wave C5 (2026-05-02) — pre-demo last-resort safety net.
 * ═══════════════════════════════════════════════════════════════════ */

export interface DemoFallbackOptions {
  /** Razão do fallback — vai no log Sentry pra rastreio */
  reason?: string
  /** Input do user — usado para personalizar mock minimamente */
  hint?: string
}

export function isDemoFallbackEnabled(): boolean {
  return process.env.DEMO_FALLBACK_ENABLED === '1'
}

/** Detecta se o erro é candidato a fallback (transiente persistente) */
export function isRetryableError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return (
    msg.includes('429') ||
    msg.includes('rate_limit') ||
    msg.includes('overloaded') ||
    msg.includes('timeout') ||
    msg.includes('etimedout') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('econnreset')
  )
}

const FALLBACK_RESUMIDOR = {
  classificacao: { tipo: 'Contrato de Prestação de Serviços', jurisdicao: 'Cível' },
  ramo_direito: 'Contratual',
  partes: [
    { nome: 'Contratante', papel: 'Tomador dos serviços' },
    { nome: 'Contratada', papel: 'Prestadora dos serviços' },
  ],
  resumo_executivo: 'Análise temporariamente indisponível. Por favor, tente novamente em alguns minutos. Este é um exemplo de resposta padrão para demonstração.',
  pontos_chave: [
    { titulo: 'Cláusula de rescisão', descricao: 'Verificar antecedência mínima e multa' },
    { titulo: 'Confidencialidade', descricao: 'Prazo após término do contrato' },
    { titulo: 'Foro de eleição', descricao: 'Comarca definida no contrato' },
  ],
  prazos: [],
  riscos: [],
  obrigacoes: [],
  valores: [],
  confianca: { nivel: 'baixa', nota: 'Resposta de fallback — IA temporariamente indisponível' },
  demo_fallback: true,
}

const FALLBACK_REDATOR = {
  titulo: 'Petição Inicial — Modelo',
  documento: 'O serviço de IA está temporariamente indisponível. Tente novamente em alguns minutos.\n\nNa redação completa, esta peça incluiria: qualificação das partes, fatos, fundamentação jurídica com citação de artigos pertinentes, pedidos e requerimentos finais.',
  referencias_legais: ['Art. 319 CPC'],
  observacoes: ['Resposta de fallback — IA temporariamente indisponível'],
  tipo: 'peticao_inicial',
  confianca: { nivel: 'baixa' },
  demo_fallback: true,
}

const FALLBACK_CONTESTADOR = {
  contestacao: {
    titulo: 'Contestação — Modelo',
    preliminares: [
      { titulo: 'Inépcia da Inicial', fundamento: 'Art. 330 CPC', argumentacao: 'Resposta temporariamente indisponível.' },
    ],
    merito: {
      sintese_fatica: 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.',
      teses: [],
      pedidos_subsidiarios: [],
    },
    confianca: { nivel: 'baixa' },
  },
  demo_fallback: true,
}

const FALLBACK_PARECERISTA = {
  titulo: 'Parecer Jurídico — Indisponível',
  resumo_executivo: 'O serviço de IA está temporariamente indisponível. Tente novamente em alguns minutos.',
  fundamentacao: '',
  conclusao: '',
  recomendacoes: [],
  confianca: { nivel: 'baixa', nota: 'Resposta de fallback' },
  demo_fallback: true,
}

const FALLBACK_CONSULTOR = {
  parecer: {
    titulo: 'Consulta — Indisponível',
    resposta: 'O serviço de IA está temporariamente indisponível. Tente novamente em alguns minutos.',
    fundamentacao: '',
    conclusao: '',
    recomendacao_estrategica: '',
    confianca: { nivel: 'baixa' },
  },
  demo_fallback: true,
}

const FALLBACK_RISCO = {
  risco: {
    score_global: 50,
    nivel: 'MEDIO',
    recomendacao: 'Análise temporariamente indisponível. Tente novamente em alguns minutos.',
    top_3_pontos: [],
    confianca: { nivel: 'baixa', nota: 'Resposta de fallback' },
  },
  demo_fallback: true,
}

const FALLBACK_PESQUISADOR = {
  enquadramento: 'Pesquisa temporariamente indisponível. Tente novamente em alguns minutos.',
  resultados: [],
  resumo: 'Serviço de IA momentaneamente fora.',
  confianca: { nivel: 'baixa' },
  demo_fallback: true,
}

const FALLBACK_CHAT = {
  tipo: 'resposta' as const,
  mensagem: 'Estou com dificuldade temporária para processar sua solicitação. Por favor, tente novamente em alguns minutos. Se a urgência for alta, abra o agente especializado direto pelo menu lateral.',
  demo_fallback: true,
}

export const DEMO_FALLBACKS = {
  resumidor: FALLBACK_RESUMIDOR,
  redator: FALLBACK_REDATOR,
  contestador: FALLBACK_CONTESTADOR,
  parecerista: FALLBACK_PARECERISTA,
  consultor: FALLBACK_CONSULTOR,
  risco: FALLBACK_RISCO,
  pesquisador: FALLBACK_PESQUISADOR,
  chat: FALLBACK_CHAT,
} as const

export type DemoFallbackKey = keyof typeof DEMO_FALLBACKS

/**
 * Loga acionamento do fallback (Sentry + console) e retorna o mock.
 * Use apenas no catch block de routes IA, e SOMENTE se isRetryableError + isDemoFallbackEnabled.
 */
export function getDemoFallback<K extends DemoFallbackKey>(
  agente: K,
  options: DemoFallbackOptions = {},
): typeof DEMO_FALLBACKS[K] {
  // eslint-disable-next-line no-console
  console.warn(`[demo-fallback] Triggered for agente="${agente}" reason="${options.reason || 'unknown'}"`)
  // Sentry capture é feito no caller — aqui só logamos pra console
  return DEMO_FALLBACKS[agente]
}
