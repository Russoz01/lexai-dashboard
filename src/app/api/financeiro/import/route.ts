import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { isBelvoConfigured, listTransactions } from '@/lib/belvo'
import { resolveUsuarioIdServer } from '@/lib/api-utils'

/**
 * GET /api/financeiro/import
 * Returns whether Belvo is configured on the server. Used by the frontend
 * modal to show a "contact admin" message when credentials are missing.
 */
export async function GET() {
  return NextResponse.json({ configured: isBelvoConfigured() })
}

/**
 * POST /api/financeiro/import
 *
 * Body: { linkId: string; dateFrom?: string }
 *
 * Imports bank transactions from Belvo into the financeiro table.
 * Returns 503 with a friendly message when Belvo is not configured — the
 * frontend keeps working for manual entry.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }

    if (!isBelvoConfigured()) {
      return NextResponse.json(
        { error: 'Belvo nao configurado. Adicione BELVO_SECRET_ID e BELVO_SECRET_PASSWORD nas variaveis de ambiente.' },
        { status: 503 },
      )
    }

    // Quota enforcement — reuse planilhas slug until a dedicated one exists
    const quota = await checkAndIncrementQuota(supabase, user.id, 'planilhas')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const linkId = typeof body?.linkId === 'string' ? body.linkId.trim() : ''
    const dateFrom = typeof body?.dateFrom === 'string' ? body.dateFrom.trim() : undefined

    if (!linkId) {
      return NextResponse.json({ error: 'linkId obrigatorio.' }, { status: 400 })
    }
    // Belvo linkIds are UUIDs — enforce a sensible upper bound and format
    if (linkId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(linkId)) {
      return NextResponse.json({ error: 'linkId invalido.' }, { status: 400 })
    }
    // dateFrom must look like YYYY-MM-DD when provided
    if (dateFrom && (dateFrom.length > 10 || !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom))) {
      return NextResponse.json({ error: 'dateFrom invalido. Use formato YYYY-MM-DD.' }, { status: 400 })
    }

    const transactions = await listTransactions(linkId, dateFrom)

    if (transactions.length === 0) {
      return NextResponse.json({ imported: 0, skipped: 0 })
    }

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (!usuarioId) {
      return NextResponse.json(
        { error: 'Nao foi possivel identificar o usuario.' },
        { status: 500 },
      )
    }

    // Map Belvo categories to the financeiro categoria enum (best-effort)
    const categoriaMap: Record<string, string> = {
      income: 'honorarios',
      salary: 'salario',
      taxes: 'imposto',
      rent: 'aluguel',
      bills: 'outro',
      shopping: 'outro',
      food: 'outro',
      transport: 'outro',
      education: 'mensalidade',
    }

    const rows = transactions.map((tx) => ({
      usuario_id: usuarioId,
      descricao: (tx.description || 'Importado Belvo').slice(0, 200),
      valor: Number.isFinite(tx.amount) && tx.amount > 0 ? tx.amount : 0,
      tipo: tx.type === 'INFLOW' ? 'receita' : 'despesa',
      categoria: categoriaMap[tx.category.toLowerCase()] ?? 'outro',
      data: tx.date || new Date().toISOString().slice(0, 10),
    })).filter((r) => r.valor > 0)

    if (rows.length === 0) {
      return NextResponse.json({ imported: 0, skipped: transactions.length })
    }

    const { error: insertError } = await supabase.from('financeiro').insert(rows)
    if (insertError) {
      // eslint-disable-next-line no-console
      console.error('[financeiro/import] insert error:', insertError.message)
      return NextResponse.json(
        { error: 'Nao foi possivel salvar os lancamentos importados.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ imported: rows.length, skipped: transactions.length - rows.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    // eslint-disable-next-line no-console
    console.error('[API /financeiro/import]', message)
    return NextResponse.json(
      { error: 'Ocorreu um erro ao importar transacoes. Tente novamente.' },
      { status: 500 },
    )
  }
}
