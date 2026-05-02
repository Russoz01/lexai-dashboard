/**
 * Prompt builder - injeta dispositivos verificados no system prompt.
 *
 * Uso tipico nas rotas API:
 *   const grounded = buildGroundingContext(userInput, { area: 'trabalhista' })
 *   const system = `${BASE_SYSTEM_PROMPT}\n\n${grounded.contextBlock}`
 *
 * O bloco gerado lista artigos reais + sumulas reais que o agente DEVE
 * preferir citar, com instrucao explicita de nao inventar jurisprudencia.
 */

import { retrieve } from './retrieval'
import type { RetrievalResult } from './types'

export interface GroundingContext {
  contextBlock: string
  retrieval: RetrievalResult
  hasMatches: boolean
}

const GROUNDING_PREAMBLE = `
[FONTES VERIFICADAS - PRIORIZE ESTAS]

Os dispositivos abaixo sao extraidos de corpus juridico verificado (CF/88, CPC, CLT, CDC, CC, CP, Provimento CNJ 205, Sumulas STF/STJ/TST). Quando houver dispositivo aplicavel na lista abaixo, CITE-O pelo numero exato e diploma. NAO invente artigos, sumulas ou jurisprudencia nao listados.

Se precisar citar algo fora deste corpus (ex: jurisprudencia recente, acordao especifico), use a ferramenta web_search quando disponivel e inclua a URL na resposta. Se nao tiver certeza da existencia de um dispositivo, declare explicitamente a limitacao.

`.trim()

export function buildGroundingContext(
  userInput: string,
  opts?: { area?: string; topK?: number },
): GroundingContext {
  const retrieval = retrieve(userInput, { area: opts?.area, topK: opts?.topK ?? 8 })

  if (retrieval.matches.length === 0) {
    return {
      contextBlock: `${GROUNDING_PREAMBLE}\n\n[Nenhum dispositivo do corpus verificado teve match alto para esta consulta. Use web_search para fundamentar citacoes ou declare que precisa de mais contexto.]`,
      retrieval,
      hasMatches: false,
    }
  }

  const provisionLines: string[] = []
  const sumulaLines: string[] = []

  for (const match of retrieval.matches) {
    if (match.provision) {
      const p = match.provision
      const paragrafos = p.paragrafos
        ? Object.entries(p.paragrafos).map(([k, v]) => `     ${k}: ${v}`).join('\n')
        : ''
      const incisos = p.incisos
        ? Object.entries(p.incisos).map(([k, v]) => `     ${k}. ${v}`).join('\n')
        : ''
      const parts = [
        `- Art. ${p.artigo} do ${p.diploma} (${p.area}): ${p.caput}`,
        incisos && `   Incisos:\n${incisos}`,
        paragrafos && `   Paragrafos:\n${paragrafos}`,
        p.observacoes && `   Obs: ${p.observacoes}`,
      ].filter(Boolean)
      provisionLines.push(parts.join('\n'))
    } else if (match.sumula) {
      const s = match.sumula
      sumulaLines.push(
        `- Sumula ${s.vinculante ? 'Vinculante ' : ''}${s.numero} do ${s.tribunal} (${s.area}): ${s.texto}`,
      )
    }
  }

  const sections: string[] = [GROUNDING_PREAMBLE]

  if (provisionLines.length > 0) {
    sections.push(`DISPOSITIVOS LEGAIS APLICAVEIS:\n${provisionLines.join('\n\n')}`)
  }

  if (sumulaLines.length > 0) {
    sections.push(`SUMULAS APLICAVEIS:\n${sumulaLines.join('\n')}`)
  }

  sections.push(
    `INSTRUCAO DE CITACAO: Ao citar qualquer um destes dispositivos, use o formato exato "Art. X do [diploma]" ou "Sumula X do [tribunal]". Inclua o texto literal apenas quando a natureza da tarefa exigir (ex: parecer, peca processual). Em respostas curtas, apenas referencie. Para fontes fora deste corpus, use web_search e inclua URL.`,
  )

  return {
    contextBlock: sections.join('\n\n'),
    retrieval,
    hasMatches: true,
  }
}

/**
 * Helper para rotas API que querem logar estatisticas de grounding.
 */
export function groundingStats(ctx: GroundingContext) {
  const provisions = ctx.retrieval.matches.filter(m => m.provision).length
  const sumulas = ctx.retrieval.matches.filter(m => m.sumula).length
  const topScore = ctx.retrieval.matches[0]?.score ?? 0
  return { provisions, sumulas, topScore, totalMatches: ctx.retrieval.matches.length }
}
