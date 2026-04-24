/**
 * Legal grounding - barrel export.
 *
 * Uso nas rotas API:
 *   import { buildGroundingContext, validateCitations, WEB_SEARCH_TOOL } from '@/lib/legal-grounding'
 */

export type { Diploma, Tribunal, LegalProvision, Sumula, CorpusMatch, RetrievalResult, CitedSource } from './types'
export { ALL_PROVISIONS, ALL_SUMULAS, CORPUS_STATS } from './corpus'
export { retrieve } from './retrieval'
export { buildGroundingContext, groundingStats } from './prompt-builder'
export { validateCitations } from './validator'
export type { GroundingContext } from './prompt-builder'
export type { ValidationReport } from './validator'

/**
 * Tool definition para Anthropic web_search (server-side tool).
 * Passe em tools: [WEB_SEARCH_TOOL] nas chamadas do SDK.
 */
export const WEB_SEARCH_TOOL = {
  type: 'web_search_20250305' as const,
  name: 'web_search' as const,
  max_uses: 3,
  allowed_domains: [
    'planalto.gov.br',
    'stf.jus.br',
    'stj.jus.br',
    'tst.jus.br',
    'cnj.jus.br',
    'oab.org.br',
    'jusbrasil.com.br',
    'conjur.com.br',
    'migalhas.com.br',
  ],
}
