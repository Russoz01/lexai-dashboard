/**
 * JusBrasil API integration — real jurisprudence lookup for Pesquisador.
 *
 * Degrades gracefully: when JUSBRASIL_API_KEY is not set, returns [] and the
 * caller falls back to the AI-generated jurisprudence already produced by the
 * Pesquisador. This module NEVER throws — all errors are swallowed and logged
 * so the main search flow keeps working.
 *
 * Env vars:
 *  - JUSBRASIL_API_KEY (required to activate)
 */

const JUSBRASIL_API_KEY = process.env.JUSBRASIL_API_KEY
const JUSBRASIL_BASE_URL = 'https://api.jusbrasil.com.br/v2'

export interface JurisprudenciaReal {
  id: string
  tribunal: string
  numero: string
  data: string
  ementa: string
  url: string
}

export async function buscarJurisprudenciaReal(
  query: string,
  tribunal?: string,
): Promise<JurisprudenciaReal[]> {
  if (!JUSBRASIL_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn('[jusbrasil] JUSBRASIL_API_KEY not set — using AI hallucination fallback')
    return []
  }
  try {
    const params = new URLSearchParams({ q: query })
    if (tribunal && tribunal !== 'Todos') params.append('tribunal', tribunal)

    const res = await fetch(`${JUSBRASIL_BASE_URL}/jurisprudencia/busca?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${JUSBRASIL_API_KEY}`,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 }, // cache for 1h
    })

    if (!res.ok) throw new Error(`JusBrasil HTTP ${res.status}`)

    const data = await res.json()
    const results: unknown[] = Array.isArray(data?.results) ? data.results : []
    return results.slice(0, 10).map((raw) => {
      const r = raw as Record<string, unknown>
      return {
        id: String(r.id ?? ''),
        tribunal: String(r.tribunal ?? ''),
        numero: String(r.numero ?? ''),
        data: String(r.data ?? ''),
        ementa: String(r.ementa ?? '').slice(0, 500),
        url: String(r.url ?? ''),
      }
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[jusbrasil] error:', e instanceof Error ? e.message : 'unknown')
    return []
  }
}

export function isJusBrasilConfigured(): boolean {
  return !!JUSBRASIL_API_KEY
}
