import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/api-utils'
import { events } from '@/lib/analytics'
import { logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// 1MB max JSON payload for shared conteudo
const MAX_CONTEUDO_BYTES = 1024 * 1024
const MAX_TITULO_LENGTH = 200
const MIN_TITULO_LENGTH = 1

/**
 * POST /api/share/create
 * Creates a public shareable link for a document analysis.
 * Protected by auth + RLS. Returns a tokenized URL valid for N days.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, supabase, error: authError } = await validateAuth()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }

    let body: { titulo?: string; conteudo?: unknown; tipo?: string; days?: number }
    try {
      body = await req.json()
    } catch (err) {
      logError(err, { where: 'share.create.parseBody' })
      return NextResponse.json({ error: 'JSON invalido.' }, { status: 400 })
    }

    const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
    const conteudo = body.conteudo
    const tipo = typeof body.tipo === 'string' ? body.tipo : 'analise'
    const days = typeof body.days === 'number' && body.days > 0 && body.days <= 365
      ? Math.floor(body.days)
      : 7

    // Validate titulo length
    if (titulo.length < MIN_TITULO_LENGTH || titulo.length > MAX_TITULO_LENGTH) {
      return NextResponse.json(
        { error: `Titulo invalido. Deve ter entre ${MIN_TITULO_LENGTH} e ${MAX_TITULO_LENGTH} caracteres.` },
        { status: 400 }
      )
    }

    // Validate conteudo presence
    if (conteudo === undefined || conteudo === null) {
      return NextResponse.json({ error: 'Conteudo obrigatorio.' }, { status: 400 })
    }

    // Enforce 1MB JSON limit
    let conteudoJsonString: string
    try {
      conteudoJsonString = JSON.stringify(conteudo)
    } catch (err) {
      logError(err, { where: 'share.create.stringify' })
      return NextResponse.json({ error: 'Conteudo nao serializavel.' }, { status: 400 })
    }
    const conteudoBytes = Buffer.byteLength(conteudoJsonString, 'utf8')
    if (conteudoBytes > MAX_CONTEUDO_BYTES) {
      return NextResponse.json(
        { error: 'Conteudo excede o limite de 1 MB.' },
        { status: 413 }
      )
    }

    // Resolve usuarios.id from auth_user_id
    const { data: usuario, error: userErr } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (userErr || !usuario) {
      return NextResponse.json(
        { error: 'Usuario nao encontrado.' },
        { status: 404 }
      )
    }

    // Generate secure random token (24 chars, URL-safe hex)
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 24)

    // Calculate expires_at
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    // Insert into shared_documents (RLS protects access)
    const { error: insertErr } = await supabase
      .from('shared_documents')
      .insert({
        usuario_id: usuario.id,
        token,
        titulo,
        conteudo,
        tipo,
        views: 0,
        expires_at: expiresAt,
      })

    if (insertErr) {
      logError(insertErr, { where: 'share.create.insert' })
      return NextResponse.json(
        { error: 'Falha ao criar link de compartilhamento.' },
        { status: 500 }
      )
    }

    // Fire-and-forget analytics event
    events.shareCreated(user.id, tipo).catch((err) =>
      logError(err, { where: 'share.create.analytics' }),
    )

    return NextResponse.json({
      token,
      url: `https://lexai.com.br/share/${token}`,
      expires_at: expiresAt,
    })
  } catch (err) {
    logError(err, { where: 'share.create' })
    return NextResponse.json(
      { error: 'Erro ao processar solicitacao.' },
      { status: 500 }
    )
  }
}
