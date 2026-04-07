/**
 * Belvo (Open Banking BR) integration — import bank transactions into Financeiro.
 *
 * Degrades gracefully: when BELVO_SECRET_ID / BELVO_SECRET_PASSWORD are missing,
 * isBelvoConfigured() returns false and all calls short-circuit to empty arrays
 * so the existing manual financeiro entry continues to work unchanged.
 *
 * Env vars:
 *  - BELVO_SECRET_ID       (required)
 *  - BELVO_SECRET_PASSWORD (required)
 *  - BELVO_URL             (optional, defaults to sandbox)
 */

const BELVO_SECRET_ID = process.env.BELVO_SECRET_ID
const BELVO_SECRET_PASSWORD = process.env.BELVO_SECRET_PASSWORD
const BELVO_URL = process.env.BELVO_URL || 'https://sandbox.belvo.com'

export interface BelvoTransaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: 'INFLOW' | 'OUTFLOW'
}

function authHeader(): string {
  if (!BELVO_SECRET_ID || !BELVO_SECRET_PASSWORD) return ''
  const credentials = Buffer.from(`${BELVO_SECRET_ID}:${BELVO_SECRET_PASSWORD}`).toString('base64')
  return `Basic ${credentials}`
}

export function isBelvoConfigured(): boolean {
  return !!(BELVO_SECRET_ID && BELVO_SECRET_PASSWORD)
}

export async function listTransactions(
  linkId: string,
  dateFrom?: string,
): Promise<BelvoTransaction[]> {
  if (!isBelvoConfigured()) {
    // eslint-disable-next-line no-console
    console.warn('[belvo] credentials not configured')
    return []
  }
  try {
    const url = `${BELVO_URL}/api/transactions/?link=${encodeURIComponent(linkId)}${dateFrom ? `&date_from=${encodeURIComponent(dateFrom)}` : ''}`
    const res = await fetch(url, {
      headers: {
        Authorization: authHeader(),
        Accept: 'application/json',
      },
    })

    if (!res.ok) throw new Error(`Belvo HTTP ${res.status}`)

    const data = await res.json()
    const results: unknown[] = Array.isArray(data?.results) ? data.results : []
    return results.map((raw) => {
      const tx = raw as Record<string, unknown>
      const rawAmount = Number(tx.amount ?? 0)
      const date = String(tx.value_date ?? tx.accounting_date ?? '')
      return {
        id: String(tx.id ?? ''),
        date,
        description: String(tx.description ?? ''),
        amount: Math.abs(rawAmount),
        category: String(tx.category ?? 'outro'),
        type: (rawAmount > 0 ? 'INFLOW' : 'OUTFLOW') as 'INFLOW' | 'OUTFLOW',
      }
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[belvo] error:', e instanceof Error ? e.message : 'unknown')
    return []
  }
}
