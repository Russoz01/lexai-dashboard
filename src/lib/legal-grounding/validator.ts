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

/**
 * Padrao pra detectar citacoes de jurisprudencia tipo:
 *   "REsp 1.234.567/SP", "RE 987.654", "HC 333.221", "AgRg 555.444",
 *   "RHC 222.111", "AREsp 789.456", opcionalmente seguido por tribunal.
 *
 * Captura: [tipo, numero, tribunal-opcional]
 *
 * Audit elite IA P1-4: antes validator so detectava artigo/sumula/URL — citacoes
 * tipo "REsp 1.234.567" passavam batido (verificacao=null), saiam sem badge no
 * UI. Agora marca como 'unverified_ai' + URL templated de busca no tribunal.
 */
const JURISPRUDENCIA_PATTERN = /\b(REsp|RE|HC|AgRg|RHC|AREsp|MS|MI|ADI|ADC|ADPF|RR|RO|AIRR|ED)\s*[nN]?[oº°.]?\s*([\d.\\/-]+)(?:\s*[\\/-]\s*([A-Z]{2}))?/g

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
 * Tribunal por tipo de recurso/acao.
 * - REsp, AREsp → STJ
 * - RE, HC, MS, MI, ADI, ADC, ADPF → STF (HC tambem STJ, mas STF mais comum em ementa)
 * - RR, RO, AIRR, ED → TST (na pratica TST tambem usa REsp via Lei 7.701/88)
 * - AgRg, RHC → contexto-dependente (default STJ)
 */
function inferTribunalFromTipo(tipo: string, hint?: string): 'STF' | 'STJ' | 'TST' | null {
  const t = tipo.toUpperCase()
  if (hint) {
    const h = hint.toUpperCase()
    if (h === 'STF' || h === 'STJ' || h === 'TST') return h
  }
  if (t === 'RESP' || t === 'ARESP') return 'STJ'
  if (t === 'RE' || t === 'ADI' || t === 'ADC' || t === 'ADPF' || t === 'MS' || t === 'MI') return 'STF'
  if (t === 'RR' || t === 'RO' || t === 'AIRR') return 'TST'
  if (t === 'HC' || t === 'AGRG' || t === 'RHC') return 'STJ'  // mais comum em STJ
  if (t === 'ED') return 'STJ'
  return null
}

/**
 * Gera URL de busca no repositorio oficial do tribunal.
 * Nao confirma existencia do acordao — so leva o usuario pra interface
 * de pesquisa pra verificar manualmente.
 */
function buildJurisprudenciaUrl(tribunal: 'STF' | 'STJ' | 'TST', tipo: string, numero: string): string {
  // Normaliza numero: remove pontos/barras, mantem digitos
  const numeroNorm = numero.replace(/[^\d]/g, '')
  switch (tribunal) {
    case 'STJ':
      // Pesquisa por palavra-chave + numero
      return `https://scon.stj.jus.br/SCON/pesquisar.jsp?b=ACOR&livre=${encodeURIComponent(`${tipo}+${numeroNorm}`)}`
    case 'STF':
      // STF nao tem deep-link confiavel por numero — usa busca geral
      return `https://jurisprudencia.stf.jus.br/pages/search?searchType=advanced&queryString=${encodeURIComponent(`${tipo} ${numeroNorm}`)}`
    case 'TST':
      // TST consultaProcessual padrao
      return `https://jurisprudencia.tst.jus.br/?words=${encodeURIComponent(`${tipo} ${numeroNorm}`)}`
  }
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

  // 3. Jurisprudencia (REsp/RE/HC/etc.) — audit P1-4
  // Nao confirma existencia, mas linka pra busca no tribunal correto.
  for (const match of Array.from(rawOutput.matchAll(JURISPRUDENCIA_PATTERN))) {
    const [full, tipo, numero, ufHint] = match
    if (!tipo || !numero) continue
    // Skip se numero for muito curto (false positive em "RE 5" tipo numero linha)
    if (numero.replace(/[^\d]/g, '').length < 4) continue

    const id = `juris-${tipo}-${numero}`
    if (seen.has(id)) continue
    seen.add(id)

    const tribunal = inferTribunalFromTipo(tipo, ufHint)
    if (!tribunal) {
      // Tipo desconhecido, registra como unverified sem URL
      sources.push({
        tipo: 'jurisprudencia',
        identificacao: full.trim(),
        verificacao: 'unverified_ai',
        nota: 'Citacao de jurisprudencia detectada mas tribunal nao identificado. Verifique manualmente.',
      })
      warnings.push(`Jurisprudencia nao verificada: ${full.trim()}`)
      continue
    }

    const url = buildJurisprudenciaUrl(tribunal, tipo, numero)
    sources.push({
      tipo: 'jurisprudencia',
      identificacao: `${tipo} ${numero}${ufHint ? `/${ufHint}` : ''} (${tribunal})`,
      url,
      verificacao: 'unverified_ai',
      nota: `Citacao gerada pela IA — clique no link pra confirmar a existencia do acordao no repositorio oficial do ${tribunal}.`,
    })
    warnings.push(`Jurisprudencia gerada por IA (verificar): ${full.trim()}`)
  }

  // 4. URLs
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
