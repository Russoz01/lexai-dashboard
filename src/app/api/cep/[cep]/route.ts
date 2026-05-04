import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cep/<cep> — proxy server-side BrasilAPI + ViaCEP fallback.
 *
 * Bug-fix urgente cliente (2026-05-04): "CEP nao funciona". Cliente usa Brave
 * com Shields agressivo OU uBlock — bloqueia fetch direto pra brasilapi.com.br
 * e viacep.com.br no browser (visto net::ERR_BLOCKED_BY_CLIENT no console).
 *
 * Fix: proxy same-origin /api/cep/<digits>. Browser nunca bloqueia same-origin.
 * Server-side fetch tambem evita CORS + permite cache + rate limit central.
 *
 * Response shape (sucesso):
 *   { ok: true, cep, logradouro, bairro, cidade, uf, source }
 * Response shape (erro):
 *   { ok: false, error: string }
 *
 * Cache: 24h em CDN Vercel (CEPs sao estaveis, mudam raramente).
 */

interface CepData {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
  source: 'brasilapi' | 'viacep'
}

interface BrasilApiResponse {
  cep?: string
  street?: string
  neighborhood?: string
  city?: string
  state?: string
  errors?: unknown
}

interface ViaCepResponse {
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

async function fetchBrasilApi(digits: string, signal: AbortSignal): Promise<CepData | null> {
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`, {
      signal,
      next: { revalidate: 86400 }, // 24h cache
    })
    if (!r.ok) return null
    const data: BrasilApiResponse = await r.json()
    if (!data.city && !data.street) return null
    return {
      cep: data.cep ? `${data.cep.slice(0, 5)}-${data.cep.slice(5)}` : `${digits.slice(0, 5)}-${digits.slice(5)}`,
      logradouro: data.street || '',
      bairro: data.neighborhood || '',
      cidade: data.city || '',
      uf: data.state || '',
      source: 'brasilapi',
    }
  } catch {
    return null
  }
}

async function fetchViaCep(digits: string, signal: AbortSignal): Promise<CepData | null> {
  try {
    const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal,
      next: { revalidate: 86400 },
    })
    if (!r.ok) return null
    const data: ViaCepResponse = await r.json()
    if (data.erro || (!data.localidade && !data.logradouro)) return null
    return {
      cep: data.cep || `${digits.slice(0, 5)}-${digits.slice(5)}`,
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
      source: 'viacep',
    }
  } catch {
    return null
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { cep: string } },
) {
  const cepRaw = params.cep || ''
  const digits = cepRaw.replace(/\D/g, '')
  if (digits.length !== 8) {
    return NextResponse.json(
      { ok: false, error: 'CEP precisa ter 8 digitos.' },
      { status: 400 },
    )
  }

  // Timeout 5s pra cada API. Sem isso, request cliente trava 60s+ em DNS slow.
  const ac = new AbortController()
  const timeout = setTimeout(() => ac.abort(), 5000)

  try {
    // 1a tentativa: BrasilAPI v2 (mais rapido, mais completo)
    let data = await fetchBrasilApi(digits, ac.signal)
    // 2a tentativa: ViaCEP (Correios oficial) — fallback
    if (!data) data = await fetchViaCep(digits, ac.signal)

    if (!data) {
      return NextResponse.json(
        { ok: false, error: 'CEP nao encontrado. Verifique e tente novamente.' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { ok: true, ...data },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    )
  } finally {
    clearTimeout(timeout)
  }
}
