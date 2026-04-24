/**
 * Retrieval engine - keyword match no corpus juridico.
 *
 * Dado um input de usuario + area opcional, retorna top-K dispositivos
 * e sumulas mais relevantes para injetar no system prompt do agente.
 *
 * Algoritmo:
 * 1. Normaliza query (lowercase, sem acentos, sem stopwords)
 * 2. Extrai tokens significativos (>= 3 chars)
 * 3. Pontua cada provision/sumula por:
 *    - Match em temas: +3 por token
 *    - Match em area: +5
 *    - Match em caput/texto: +1 por token
 *    - Match em diploma/artigo explicito (ex: "art. 5 cf"): +10
 * 4. Retorna top-K com score >= threshold
 */

import type { LegalProvision, Sumula, CorpusMatch, RetrievalResult } from './types'
import { ALL_PROVISIONS, ALL_SUMULAS } from './corpus'

const STOPWORDS = new Set([
  'a', 'o', 'e', 'de', 'da', 'do', 'das', 'dos', 'para', 'com', 'em', 'um', 'uma',
  'que', 'qual', 'como', 'por', 'sobre', 'ate', 'quando', 'onde', 'se', 'nao',
  'sim', 'mais', 'menos', 'muito', 'pouco', 'todo', 'toda', 'entre', 'seu', 'sua',
  'meu', 'minha', 'este', 'esta', 'isso', 'aquilo', 'the', 'and', 'or', 'to', 'of',
])

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(' ')
    .filter(t => t.length >= 3 && !STOPWORDS.has(t))
}

function scoreProvision(p: LegalProvision, tokens: string[], area?: string): number {
  let score = 0
  const temasNorm = p.temas.map(normalize)
  const areaNorm = normalize(p.area)
  const caputNorm = normalize(p.caput)

  for (const tok of tokens) {
    for (const tema of temasNorm) {
      if (tema.includes(tok)) score += 3
    }
    if (areaNorm.includes(tok)) score += 5
    if (caputNorm.includes(tok)) score += 1
  }

  if (area && normalize(area) === areaNorm) score += 5

  return score
}

function scoreSumula(s: Sumula, tokens: string[], area?: string): number {
  let score = 0
  const temasNorm = s.temas.map(normalize)
  const textoNorm = normalize(s.texto)
  const areaNorm = normalize(s.area)

  for (const tok of tokens) {
    for (const tema of temasNorm) {
      if (tema.includes(tok)) score += 3
    }
    if (textoNorm.includes(tok)) score += 1
    if (areaNorm.includes(tok)) score += 5
  }

  if (s.vinculante) score += 2
  if (area && normalize(area) === areaNorm) score += 5

  return score
}

/**
 * Retorna top-K dispositivos e sumulas relevantes para a query.
 */
export function retrieve(query: string, opts?: { area?: string; topK?: number; threshold?: number }): RetrievalResult {
  const topK = opts?.topK ?? 8
  const threshold = opts?.threshold ?? 3
  const tokens = tokenize(query)

  if (tokens.length === 0) {
    return { matches: [], totalSearched: ALL_PROVISIONS.length + ALL_SUMULAS.length, query, area: opts?.area }
  }

  const matches: CorpusMatch[] = []

  for (const p of ALL_PROVISIONS) {
    const score = scoreProvision(p, tokens, opts?.area)
    if (score >= threshold) {
      matches.push({ score, provision: p })
    }
  }

  for (const s of ALL_SUMULAS) {
    const score = scoreSumula(s, tokens, opts?.area)
    if (score >= threshold) {
      matches.push({ score, sumula: s })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  return {
    matches: matches.slice(0, topK),
    totalSearched: ALL_PROVISIONS.length + ALL_SUMULAS.length,
    query,
    area: opts?.area,
  }
}
