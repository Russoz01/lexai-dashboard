'use client'

/**
 * BrasilAPI + ViaCEP + Banco Central integration helpers.
 * All endpoints are PUBLIC and require NO authentication.
 * No API keys, no signup, no cost.
 *
 * Sources:
 * - brasilapi.com.br (open source, community-driven)
 * - viacep.com.br (Correios)
 * - bcb.gov.br (Banco Central — SELIC)
 *
 * These are used throughout the dashboard to enrich user inputs with
 * real-time Brazilian data (CNPJ info, addresses, rates, holidays).
 */

// ============================================================================
// CNPJ — Consulta Receita Federal via BrasilAPI
// ============================================================================

export interface CnpjData {
  cnpj: string
  razao_social: string
  nome_fantasia: string | null
  situacao_cadastral: number
  descricao_situacao_cadastral: string
  data_situacao_cadastral: string | null
  motivo_situacao_cadastral: number
  data_inicio_atividade: string | null
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  logradouro: string
  numero: string
  complemento: string | null
  bairro: string
  municipio: string
  uf: string
  cep: string
  ddd_telefone_1: string | null
  email: string | null
  capital_social: number | null
  porte: number
  descricao_porte: string
}

function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

export function formatCnpj(cnpj: string): string {
  const clean = cleanCnpj(cnpj)
  if (clean.length !== 14) return cnpj
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`
}

export function isValidCnpj(cnpj: string): boolean {
  const clean = cleanCnpj(cnpj)
  if (clean.length !== 14) return false
  if (/^(\d)\1+$/.test(clean)) return false // All same digit

  // Validate check digits
  const calc = (slice: string, weights: number[]) => {
    let sum = 0
    for (let i = 0; i < weights.length; i++) sum += Number(slice[i]) * weights[i]
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const d1 = calc(clean.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calc(clean.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return d1 === Number(clean[12]) && d2 === Number(clean[13])
}

/**
 * Result type pro client distinguir entre erros (CNPJ inexistente vs upstream down).
 */
export type CnpjLookupResult =
  | { ok: true; data: CnpjData }
  | { ok: false; error: string; code: 'invalid' | 'not_found' | 'upstream_down' | 'network' }

/**
 * Consulta CNPJ via /api/cnpj/[cnpj] (proxy server-side com fallback BrasilAPI -> ReceitaWS).
 * Retorna null se algo deu errado (compat com codigo antigo) — use lookupCNPJStrict
 * pra mensagem de erro especifica.
 */
export async function lookupCNPJ(cnpj: string): Promise<CnpjData | null> {
  const r = await lookupCNPJStrict(cnpj)
  return r.ok ? r.data : null
}

export async function lookupCNPJStrict(cnpj: string): Promise<CnpjLookupResult> {
  const clean = cleanCnpj(cnpj)
  if (!isValidCnpj(clean)) {
    return { ok: false, error: 'CNPJ inválido — verifique os dígitos.', code: 'invalid' }
  }

  try {
    // Proxy server-side: sem CORS, com cache 24h, fallback BrasilAPI -> ReceitaWS
    const res = await fetch(`/api/cnpj/${clean}`, {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = (await res.json()) as CnpjData
      return { ok: true, data }
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
    if (res.status === 404) {
      return { ok: false, error: body.error || 'CNPJ não consta na Receita Federal.', code: 'not_found' }
    }
    if (res.status === 502) {
      return { ok: false, error: body.error || 'Receita Federal fora do ar. Tente em 30s.', code: 'upstream_down' }
    }
    return { ok: false, error: body.error || 'Erro ao consultar CNPJ.', code: 'upstream_down' }
  } catch {
    return { ok: false, error: 'Sem conexão. Verifique sua internet.', code: 'network' }
  }
}

// ============================================================================
// CEP — Consulta via ViaCEP (primary) + BrasilAPI fallback
// ============================================================================

export interface CepData {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
  ibge?: string
  ddd?: string
}

function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '')
}

export function formatCep(cep: string): string {
  const clean = cleanCep(cep)
  if (clean.length !== 8) return cep
  return `${clean.slice(0, 5)}-${clean.slice(5)}`
}

export async function lookupCEP(cep: string): Promise<CepData | null> {
  const clean = cleanCep(cep)
  if (clean.length !== 8) return null

  // Primary: BrasilAPI (faster, cleaner schema)
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`)
    if (res.ok) {
      const data = await res.json()
      return {
        cep: data.cep,
        logradouro: data.street || '',
        bairro: data.neighborhood || '',
        cidade: data.city || '',
        uf: data.state || '',
      }
    }
  } catch { /* fall through */ }

  // Fallback: ViaCEP (Correios official)
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    if (res.ok) {
      const data = await res.json()
      if (data.erro) return null
      return {
        cep: data.cep,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
        ibge: data.ibge,
        ddd: data.ddd,
      }
    }
  } catch { /* ignore */ }

  return null
}

// ============================================================================
// Bancos — Lista todos os bancos brasileiros
// ============================================================================

export interface BancoBR {
  ispb: string
  name: string
  code: number | null
  fullName: string
}

export async function listarBancos(): Promise<BancoBR[]> {
  try {
    const res = await fetch('https://brasilapi.com.br/api/banks/v1')
    if (!res.ok) return []
    const data = await res.json()
    return (data as BancoBR[]).filter(b => b.code !== null).sort((a, b) => (a.code || 0) - (b.code || 0))
  } catch {
    return []
  }
}

// ============================================================================
// Feriados Nacionais — Dinamico por ano via BrasilAPI
// ============================================================================

export interface FeriadoBR {
  date: string // ISO YYYY-MM-DD
  name: string
  type: 'national' | 'religious'
}

export async function listarFeriadosNacionais(ano: number): Promise<FeriadoBR[]> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
    if (!res.ok) return []
    return (await res.json()) as FeriadoBR[]
  } catch {
    return []
  }
}

// ============================================================================
// DDD — Lookup de estado + cidades por DDD
// ============================================================================

export interface DddData {
  state: string
  cities: string[]
}

export async function lookupDDD(ddd: string | number): Promise<DddData | null> {
  const clean = String(ddd).replace(/\D/g, '')
  if (clean.length !== 2) return null
  try {
    const res = await fetch(`https://brasilapi.com.br/api/ddd/v1/${clean}`)
    if (!res.ok) return null
    return (await res.json()) as DddData
  } catch {
    return null
  }
}

// ============================================================================
// Tabela FIPE — Consulta valor de mercado de veiculos
// ============================================================================

export interface FipeMarca {
  nome: string
  valor: string // codigo FIPE
}

export async function listarMarcasFIPE(tipo: 'carros' | 'motos' | 'caminhoes' = 'carros'): Promise<FipeMarca[]> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/fipe/marcas/v1/${tipo}`)
    if (!res.ok) return []
    return (await res.json()) as FipeMarca[]
  } catch {
    return []
  }
}

// ============================================================================
// Taxa SELIC — Banco Central (publico, sem autenticacao)
// ============================================================================

export interface SelicData {
  data: string // DD/MM/YYYY
  valor: number // diaria em %
  anual?: number // estimado
}

/**
 * Fetches the latest SELIC rate from Banco Central's public API.
 * SGS (Sistema Gerenciador de Series Temporais) series 11 = Selic diaria.
 */
export async function getTaxaSELIC(): Promise<SelicData | null> {
  try {
    const res = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json')
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    const ultimo = data[0]
    const diaria = Number(ultimo.valor)
    // Annualize: (1 + daily/100)^252 - 1
    const anual = (Math.pow(1 + diaria / 100, 252) - 1) * 100
    return {
      data: ultimo.data,
      valor: diaria,
      anual: Math.round(anual * 100) / 100,
    }
  } catch {
    return null
  }
}

/**
 * Fetches the latest CDI rate (daily) from Banco Central.
 * SGS series 12 = CDI diaria.
 */
export async function getTaxaCDI(): Promise<SelicData | null> {
  try {
    const res = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json')
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    const ultimo = data[0]
    const diaria = Number(ultimo.valor)
    const anual = (Math.pow(1 + diaria / 100, 252) - 1) * 100
    return {
      data: ultimo.data,
      valor: diaria,
      anual: Math.round(anual * 100) / 100,
    }
  } catch {
    return null
  }
}

/**
 * Fetches IPCA (inflation index) for the last 12 months.
 * SGS series 433 = IPCA mensal.
 */
export async function getIPCA12m(): Promise<number | null> {
  try {
    const res = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json')
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    // Accumulate: (1 + m1/100)(1 + m2/100)... - 1
    const acumulado = data.reduce((acc: number, m: { valor: string }) => acc * (1 + Number(m.valor) / 100), 1) - 1
    return Math.round(acumulado * 10000) / 100 // as percentage with 2 decimals
  } catch {
    return null
  }
}
