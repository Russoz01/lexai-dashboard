import { NextRequest, NextResponse } from 'next/server'

/* ════════════════════════════════════════════════════════════════════
 * /api/cnpj/[cnpj] — Server-side proxy pra consulta CNPJ Receita Federal.
 * ────────────────────────────────────────────────────────────────────
 * Bug fix: o fetch direto do browser pra brasilapi.com.br estava falhando
 * por CORS / rate limit / silently. Esse proxy:
 * - Roda server-side (sem CORS issue)
 * - Cache 24h pra reduzir hits no BrasilAPI
 * - Fallback pra ReceitaWS se BrasilAPI falhar
 * - Errors estruturados (404 vs 502 vs 500) pro client distinguir
 * - Cache no edge (Vercel CDN) por 24h
 * ═══════════════════════════════════════════════════════════════════ */

export const runtime = 'edge'

interface BrasilApiCnpj {
  cnpj: string
  razao_social: string
  nome_fantasia: string | null
  situacao_cadastral?: number
  descricao_situacao_cadastral?: string
  data_situacao_cadastral?: string | null
  cnae_fiscal?: number
  cnae_fiscal_descricao?: string
  logradouro?: string
  numero?: string
  complemento?: string | null
  bairro?: string
  municipio?: string
  uf?: string
  cep?: string
  ddd_telefone_1?: string | null
  email?: string | null
  capital_social?: number | null
}

interface ReceitaWsCnpj {
  cnpj: string
  nome: string
  fantasia: string
  situacao: string
  data_situacao: string
  cnae_fiscal: string
  atividade_principal: { code: string; text: string }[]
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  telefone: string
  email: string
  capital_social: string
  status?: string
  message?: string
}

function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

function isValidCnpj(cnpj: string): boolean {
  const c = cleanCnpj(cnpj)
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false
  const calc = (slice: string, weights: number[]) => {
    let sum = 0
    for (let i = 0; i < weights.length; i++) sum += Number(slice[i]) * weights[i]
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  const d1 = calc(c.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calc(c.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return d1 === Number(c[12]) && d2 === Number(c[13])
}

// P1 audit fix (2026-05-02): rate-limit IP-based in-memory pra evitar uso
// como proxy CNPJ gratuito (DDoS amplification + esgotamento rate-limit
// upstream BrasilAPI/ReceitaWS). Edge runtime = in-memory por instância,
// limitação imperfeita mas reduz superfície. Limite: 10 req/min por IP.
const ipRateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

function checkIpRateLimit(ip: string): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = ipRateLimit.get(ip)
  if (!entry || entry.resetAt < now) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS }
  }
  entry.count++
  return {
    ok: entry.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
    resetAt: entry.resetAt,
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ cnpj: string }> }) {
  // Rate-limit por IP (best-effort em edge runtime distribuído)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
  const rl = checkIpRateLimit(ip)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Muitas consultas CNPJ. Aguarde 1 minuto.', code: 'rate_limited' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      },
    )
  }

  const { cnpj: raw } = await ctx.params
  const cnpj = cleanCnpj(raw)

  if (!isValidCnpj(cnpj)) {
    return NextResponse.json(
      { error: 'CNPJ inválido — verifique os dígitos.', code: 'invalid' },
      { status: 400 },
    )
  }

  // PRIMARY: BrasilAPI (open, sem auth)
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 }, // 24h CDN cache
    })
    if (res.ok) {
      const data = (await res.json()) as BrasilApiCnpj
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      })
    }
    if (res.status === 404) {
      return NextResponse.json(
        { error: 'CNPJ não consta na Receita Federal.', code: 'not_found' },
        { status: 404 },
      )
    }
    // 5xx ou outro — tenta fallback abaixo
  } catch {
    // network err — tenta fallback
  }

  // FALLBACK: ReceitaWS (rate limit 3 req/min público, mas compre o premium)
  try {
    const res = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = (await res.json()) as ReceitaWsCnpj
      if (data.status === 'ERROR') {
        return NextResponse.json(
          { error: data.message || 'CNPJ não encontrado.', code: 'not_found' },
          { status: 404 },
        )
      }
      // Normaliza pro formato BrasilAPI pro client não precisar saber a fonte
      const normalized: BrasilApiCnpj = {
        cnpj: data.cnpj?.replace(/\D/g, '') || cnpj,
        razao_social: data.nome,
        nome_fantasia: data.fantasia || null,
        descricao_situacao_cadastral: data.situacao,
        data_situacao_cadastral: data.data_situacao || null,
        cnae_fiscal_descricao: data.atividade_principal?.[0]?.text,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento || null,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep?.replace(/\D/g, ''),
        ddd_telefone_1: data.telefone || null,
        email: data.email || null,
      }
      return NextResponse.json(normalized, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200' },
      })
    }
  } catch {
    // ignored
  }

  return NextResponse.json(
    { error: 'Receita Federal indisponível no momento. Tente em 30 segundos.', code: 'upstream_down' },
    { status: 502 },
  )
}
