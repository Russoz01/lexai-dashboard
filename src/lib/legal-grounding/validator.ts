/**
 * Validator de citacoes - pos-processamento.
 *
 * Extrai citacoes do texto/JSON gerado pelo agente e verifica contra:
 * 1. Corpus local (artigos de CF/88, CPC, CLT, CDC, CC, CP, Provimento 205)
 * 2. Sumulas locais (STF/STJ/TST)
 * 3. URLs presentes (marca como verified_web)
 *
 * Retorna fontes estruturadas + flags de alerta para citacoes nao verificadas.
 */

import type { CitedSource } from './types'
import { ALL_PROVISIONS, ALL_SUMULAS } from './corpus'

export interface ValidationReport {
  sources: CitedSource[]
  warnings: string[]
  stats: {
    total: number
    verified_corpus: number
    verified_web: number
    unverified_ai: number
  }
}

const ART_PATTERN = /[Aa]rt(?:igo|\.)?\s*(\d+(?:[-oA-Z]*)?)\s*(?:d[aoe]s?|,)?\s*(CF(?:\/\d{2})?|CPC|CLT|CDC|CC|CP|C[oó]digo\s+\w+|Constitui[cç][aã]o|Provimento\s*(?:CNJ\s*)?\d+)/gi

const SUMULA_PATTERN = /[Ss][uú]mula\s*(?:[Vv]inculante\s*)?(\d+)\s*(?:d[aoe]s?)?\s*(STF|STJ|TST|TSE|CNJ)/gi

const URL_PATTERN = /https?:\/\/[^\s"'<>)]+/gi

function matchDiploma(raw: string): string | null {
  const norm = raw.toLowerCase().replace(/[\s.]/g, '')
  if (norm.includes('cf') || norm.includes('constitui')) return 'CF/88'
  if (norm.includes('cpc')) return 'CPC'
  if (norm.includes('clt')) return 'CLT'
  if (norm.includes('cdc')) return 'CDC'
  if (norm.startsWith('cc') && !norm.includes('cdc')) return 'CC'
  if (norm.startsWith('cp') && !norm.includes('cpc')) return 'CP'
  if (norm.includes('provimento')) return 'Provimento CNJ 205'
  return null
}

function lookupProvision(artigo: string, diploma: string) {
  const artigoNorm = artigo.replace(/[-oaA-Z]/g, '').trim()
  return ALL_PROVISIONS.find(
    p => p.artigo.replace(/[-oaA-Z]/g, '').trim() === artigoNorm && p.diploma === diploma,
  )
}

function lookupSumula(numero: string, tribunal: string) {
  return ALL_SUMULAS.find(s => s.numero === numero && s.tribunal === tribunal.toUpperCase())
}

/**
 * Analisa o output do agente e devolve fontes verificadas + nao verificadas.
 */
export function validateCitations(rawOutput: string): ValidationReport {
  const sources: CitedSource[] = []
  const warnings: string[] = []
  const seen = new Set<string>()

  // 1. Artigos de lei
  for (const match of Array.from(rawOutput.matchAll(ART_PATTERN))) {
    const [full, artigo, diplomaRaw] = match
    const diploma = matchDiploma(diplomaRaw)
    if (!diploma) continue

    const id = `art-${artigo}-${diploma}`
    if (seen.has(id)) continue
    seen.add(id)

    const provision = lookupProvision(artigo, diploma)
    if (provision) {
      sources.push({
        tipo: 'lei',
        identificacao: `Art. ${provision.artigo} do ${provision.diploma}`,
        texto_citado: provision.caput,
        verificacao: 'verified_corpus',
        nota: provision.observacoes,
      })
    } else {
      sources.push({
        tipo: 'lei',
        identificacao: `Art. ${artigo} do ${diploma}`,
        verificacao: 'unverified_ai',
        nota: `Dispositivo nao encontrado no corpus verificado. Conferir em planalto.gov.br antes de usar.`,
      })
      warnings.push(`Citacao nao verificada: ${full.trim()}`)
    }
  }

  // 2. Sumulas
  for (const match of Array.from(rawOutput.matchAll(SUMULA_PATTERN))) {
    const [full, numero, tribunal] = match
    const id = `sum-${numero}-${tribunal}`
    if (seen.has(id)) continue
    seen.add(id)

    const sumula = lookupSumula(numero, tribunal)
    if (sumula) {
      sources.push({
        tipo: 'sumula',
        identificacao: `Sumula ${sumula.vinculante ? 'Vinculante ' : ''}${sumula.numero} do ${sumula.tribunal}`,
        texto_citado: sumula.texto,
        verificacao: 'verified_corpus',
      })
    } else {
      sources.push({
        tipo: 'sumula',
        identificacao: `Sumula ${numero} do ${tribunal}`,
        verificacao: 'unverified_ai',
        nota: `Sumula nao encontrada no corpus. Conferir no site oficial do ${tribunal}.`,
      })
      warnings.push(`Sumula nao verificada: ${full.trim()}`)
    }
  }

  // 3. URLs
  for (const match of Array.from(rawOutput.matchAll(URL_PATTERN))) {
    const url = match[0].replace(/[.,;)\]]+$/, '')
    const id = `url-${url}`
    if (seen.has(id)) continue
    seen.add(id)

    sources.push({
      tipo: 'web',
      identificacao: new URL(url).hostname,
      url,
      verificacao: 'verified_web',
    })
  }

  const stats = {
    total: sources.length,
    verified_corpus: sources.filter(s => s.verificacao === 'verified_corpus').length,
    verified_web: sources.filter(s => s.verificacao === 'verified_web').length,
    unverified_ai: sources.filter(s => s.verificacao === 'unverified_ai').length,
  }

  return { sources, warnings, stats }
}
