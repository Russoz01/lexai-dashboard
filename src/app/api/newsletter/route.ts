import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/newsletter
 * Body: { email: string; source?: string }
 *
 * Captura emails do footer/landing em tabela `leads_newsletter` do Supabase.
 * Idempotente: email duplicado retorna 200 (silent success).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string; source?: string }
    const email = (body.email || '').trim().toLowerCase()
    const source = (body.source || 'footer').slice(0, 60)

    if (!email || !EMAIL_RE.test(email) || email.length > 180) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }

    const supabase = createClient()
    // upsert para evitar duplicatas sem vazar existência
    const { error } = await supabase
      .from('leads_newsletter')
      .upsert(
        { email, source, user_agent: req.headers.get('user-agent')?.slice(0, 240) ?? null },
        { onConflict: 'email', ignoreDuplicates: false },
      )

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[api/newsletter] upsert error:', error.message)
      // Mantém resposta neutra pro cliente — UX é sempre sucesso
      return NextResponse.json({ ok: true, queued: false })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    // eslint-disable-next-line no-console
    console.error('[api/newsletter] error:', msg)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
