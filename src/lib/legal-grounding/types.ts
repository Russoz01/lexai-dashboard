/**
 * Legal grounding type definitions.
 *
 * The goal of this module is simple: make it impossible for any agent to cite
 * a legal provision or court ruling that does not exist. Every citation in
 * the output of a Pralvex agent must either come from this curated corpus
 * (100% verified) or from a real-time web search tool result (verifiable URL).
 */

export type Diploma =
  | 'CF/88'
  | 'CPC'
  | 'CLT'
  | 'CDC'
  | 'CC'
  | 'CP'
  | 'CPP'
  | 'LINDB'
  | 'LGPD'
  | 'CTN'
  | 'Lei do Inquilinato'
  | 'Provimento CNJ 205'

export type Tribunal = 'STF' | 'STJ' | 'TST' | 'TSE' | 'CNJ'

export interface LegalProvision {
  /** Diploma legal (CF/88, CPC, CLT, etc). */
  diploma: Diploma
  /** Artigo. Ex: "5", "927", "477". */
  artigo: string
  /** Paragrafos. Keys sao "§1", "§2", "unico". */
  paragrafos?: Record<string, string>
  /** Incisos. Keys sao numeros romanos "I", "II", "III", etc. */
  incisos?: Record<string, string>
  /** Alineas. Keys sao letras minusculas "a", "b", etc. */
  alineas?: Record<string, string>
  /** Caput / texto principal do dispositivo. */
  caput: string
  /** Keywords para retrieval por tema. Lowercase, sem acento. */
  temas: string[]
  /** Area do direito: civel, penal, trabalhista, tributario, constitucional, etc. */
  area: string
  /** Observacoes sobre vigencia ou interpretacao consolidada. */
  observacoes?: string
}

export interface Sumula {
  tribunal: Tribunal
  numero: string
  /** Texto literal da sumula. */
  texto: string
  /** true para Sumulas Vinculantes do STF. */
  vinculante?: boolean
  /** Keywords para retrieval por tema. */
  temas: string[]
  area: string
  /** Data de aprovacao para disambiguacao historica. */
  aprovacao?: string
}

export interface CorpusMatch {
  score: number
  provision?: LegalProvision
  sumula?: Sumula
}

export interface RetrievalResult {
  matches: CorpusMatch[]
  totalSearched: number
  query: string
  area?: string
}

export interface CitedSource {
  /** Tipo da fonte citada. */
  tipo: 'lei' | 'sumula' | 'jurisprudencia' | 'doutrina' | 'web'
  /** Identificacao curta. Ex: "Art. 927, CC", "Sumula 297 STJ". */
  identificacao: string
  /** Texto literal citado (quando disponivel). */
  texto_citado?: string
  /** URL verificavel (quando disponivel). */
  url?: string
  /** Status da verificacao. */
  verificacao: 'verified_corpus' | 'verified_web' | 'unverified_ai' | 'failed_validation'
  /** Nota explicativa quando falha. */
  nota?: string
}
