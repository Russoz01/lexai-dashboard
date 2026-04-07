/**
 * Feriados nacionais brasileiros + recesso forense
 *
 * Inclui feriados fixos e moveis (Pascoa, Carnaval, Sexta Santa, Corpus Christi)
 * para os anos 2025-2027. Inclui tambem o recesso forense (20/12 a 20/01)
 * conforme art. 220 do CPC.
 *
 * Funcoes utilitarias para calculo de prazos processuais e dias uteis forenses.
 */

export interface FeriadoCheck {
  isFeriado: boolean
  nome?: string
}

interface Feriado {
  data: string // formato YYYY-MM-DD
  nome: string
}

// ── Helpers internos ────────────────────────────────────────────────────────

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfDay(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return out
}

// ── Tabela de feriados nacionais 2025-2027 ──────────────────────────────────
//
// Datas moveis (Carnaval, Sexta Santa, Corpus Christi) calculadas a partir da
// Pascoa: 20/04/2025, 05/04/2026 e 28/03/2027 (algoritmo de Gauss).

export const FERIADOS_NACIONAIS: Feriado[] = [
  // ─── 2025 ───────────────────────────────────────────────────────────
  { data: '2025-01-01', nome: 'Confraternizacao Universal' },
  { data: '2025-03-03', nome: 'Carnaval (segunda)' },
  { data: '2025-03-04', nome: 'Carnaval (terca)' },
  { data: '2025-04-18', nome: 'Sexta-feira Santa' },
  { data: '2025-04-21', nome: 'Tiradentes' },
  { data: '2025-05-01', nome: 'Dia do Trabalho' },
  { data: '2025-06-19', nome: 'Corpus Christi' },
  { data: '2025-09-07', nome: 'Independencia do Brasil' },
  { data: '2025-10-12', nome: 'Nossa Senhora Aparecida' },
  { data: '2025-11-02', nome: 'Finados' },
  { data: '2025-11-15', nome: 'Proclamacao da Republica' },
  { data: '2025-12-08', nome: 'Nossa Senhora da Conceicao' },
  { data: '2025-12-25', nome: 'Natal' },

  // ─── 2026 ───────────────────────────────────────────────────────────
  { data: '2026-01-01', nome: 'Confraternizacao Universal' },
  { data: '2026-02-16', nome: 'Carnaval (segunda)' },
  { data: '2026-02-17', nome: 'Carnaval (terca)' },
  { data: '2026-04-03', nome: 'Sexta-feira Santa' },
  { data: '2026-04-21', nome: 'Tiradentes' },
  { data: '2026-05-01', nome: 'Dia do Trabalho' },
  { data: '2026-06-04', nome: 'Corpus Christi' },
  { data: '2026-09-07', nome: 'Independencia do Brasil' },
  { data: '2026-10-12', nome: 'Nossa Senhora Aparecida' },
  { data: '2026-11-02', nome: 'Finados' },
  { data: '2026-11-15', nome: 'Proclamacao da Republica' },
  { data: '2026-12-08', nome: 'Nossa Senhora da Conceicao' },
  { data: '2026-12-25', nome: 'Natal' },

  // ─── 2027 ───────────────────────────────────────────────────────────
  { data: '2027-01-01', nome: 'Confraternizacao Universal' },
  { data: '2027-02-08', nome: 'Carnaval (segunda)' },
  { data: '2027-02-09', nome: 'Carnaval (terca)' },
  { data: '2027-03-26', nome: 'Sexta-feira Santa' },
  { data: '2027-04-21', nome: 'Tiradentes' },
  { data: '2027-05-01', nome: 'Dia do Trabalho' },
  { data: '2027-05-27', nome: 'Corpus Christi' },
  { data: '2027-09-07', nome: 'Independencia do Brasil' },
  { data: '2027-10-12', nome: 'Nossa Senhora Aparecida' },
  { data: '2027-11-02', nome: 'Finados' },
  { data: '2027-11-15', nome: 'Proclamacao da Republica' },
  { data: '2027-12-08', nome: 'Nossa Senhora da Conceicao' },
  { data: '2027-12-25', nome: 'Natal' },
]

// Mapa para lookup O(1) por data ISO
const FERIADOS_MAP: Map<string, string> = new Map(
  FERIADOS_NACIONAIS.map(f => [f.data, f.nome])
)

// ── Verificacoes ────────────────────────────────────────────────────────────

/** Verifica se a data e um feriado nacional. */
export function isFeriadoNacional(date: Date): FeriadoCheck {
  const key = ymd(date)
  const nome = FERIADOS_MAP.get(key)
  return nome ? { isFeriado: true, nome } : { isFeriado: false }
}

/**
 * Verifica se a data esta no recesso forense (20/12 ate 20/01 do ano seguinte).
 * Conforme art. 220 do CPC: nao corre prazo no periodo de 20/12 a 20/01.
 */
export function isRecessoForense(date: Date): boolean {
  const m = date.getMonth() + 1
  const d = date.getDate()
  // Dezembro a partir do dia 20 OU Janeiro ate o dia 20
  if (m === 12 && d >= 20) return true
  if (m === 1 && d <= 20) return true
  return false
}

/** Sabado ou Domingo. */
export function isFinalDeSemana(date: Date): boolean {
  const dow = date.getDay()
  return dow === 0 || dow === 6
}

/**
 * Dia util forense: nao e final de semana, nao e feriado nacional, nao esta
 * em recesso forense.
 */
export function isDiaUtilForense(date: Date): boolean {
  if (isFinalDeSemana(date)) return false
  if (isFeriadoNacional(date).isFeriado) return false
  if (isRecessoForense(date)) return false
  return true
}

// ── Operacoes em prazos ─────────────────────────────────────────────────────

/**
 * Adiciona N dias uteis forenses a uma data inicial.
 *
 * Pula finais de semana, feriados nacionais e dias de recesso forense.
 * O dia inicial NAO conta como dia util (regra do CPC: prazo comeca a contar
 * do primeiro dia util seguinte).
 */
export function addDiasUteisForenses(start: Date, dias: number): Date {
  if (dias < 0) {
    throw new Error('Quantidade de dias deve ser positiva')
  }
  const cursor = startOfDay(start)
  let count = 0
  // Maximo de iteracoes para evitar loop infinito (1000 dias uteis = ~4 anos)
  const MAX_ITER = 10_000
  let i = 0
  while (count < dias && i < MAX_ITER) {
    cursor.setDate(cursor.getDate() + 1)
    if (isDiaUtilForense(cursor)) {
      count++
    }
    i++
  }
  return cursor
}

/**
 * Calcula a quantidade de dias uteis forenses entre duas datas (exclusivo
 * a partir de start, inclusivo ate end).
 *
 * Retorna 0 se end <= start.
 */
export function diferencaDiasUteis(start: Date, end: Date): number {
  const a = startOfDay(start)
  const b = startOfDay(end)
  if (b.getTime() <= a.getTime()) return 0
  let count = 0
  const cursor = new Date(a)
  const MAX_ITER = 100_000
  let i = 0
  while (cursor.getTime() < b.getTime() && i < MAX_ITER) {
    cursor.setDate(cursor.getDate() + 1)
    if (isDiaUtilForense(cursor)) count++
    i++
  }
  return count
}

// ── Breakdown para UI ───────────────────────────────────────────────────────

export interface BreakdownDias {
  diasCorridos: number
  diasUteis: number
  feriados: number
  finaisDeSemana: number
  diasRecesso: number
}

/**
 * Retorna breakdown detalhado do periodo entre duas datas, separando os
 * dias por categoria. Util para mostrar ao usuario por que o calculo deu
 * X dias uteis.
 */
export function breakdownPeriodo(start: Date, end: Date): BreakdownDias {
  const a = startOfDay(start)
  const b = startOfDay(end)
  if (b.getTime() <= a.getTime()) {
    return { diasCorridos: 0, diasUteis: 0, feriados: 0, finaisDeSemana: 0, diasRecesso: 0 }
  }
  let diasCorridos = 0
  let diasUteis = 0
  let feriados = 0
  let finaisDeSemana = 0
  let diasRecesso = 0
  const cursor = new Date(a)
  const MAX_ITER = 100_000
  let i = 0
  while (cursor.getTime() < b.getTime() && i < MAX_ITER) {
    cursor.setDate(cursor.getDate() + 1)
    diasCorridos++
    const fimDeSemana = isFinalDeSemana(cursor)
    const feriado = isFeriadoNacional(cursor).isFeriado
    const recesso = isRecessoForense(cursor)
    if (fimDeSemana) finaisDeSemana++
    // Contar feriados que NAO sao final de semana e NAO sao recesso (para nao duplicar)
    if (feriado && !fimDeSemana && !recesso) feriados++
    // Contar dias de recesso que nao sao final de semana
    if (recesso && !fimDeSemana) diasRecesso++
    if (isDiaUtilForense(cursor)) diasUteis++
    i++
  }
  return { diasCorridos, diasUteis, feriados, finaisDeSemana, diasRecesso }
}
