import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveUsuarioIdServer } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/historico/sessao?id=<UUID>
 *
 * Retorna todas as exchanges (mensagem_usuario + resposta_agente) de uma sessao
 * de chat agrupadas por session_id, ordenadas por created_at ASC.
 *
 * Audit elite v4 (2026-05-04): cliente reportou "aparece chat no historico mas
 * n tem como acessar". Migration 016 adicionou session_id em historico.
 * Frontend chat agora gera UUID por conversa e envia em todas requests.
 *
 * Security:
 *  - Auth via Supabase session (middleware ja valida cookies)
 *  - RLS Postgres + filtro explicito usuario_id (defense-in-depth)
 *  - Validacao UUID v4 — input invalido retorna 400 sem hit DB
 *
 * Response shape:
 *  { ok: true, session_id, messages: [{role, content, agente, timestamp}], total }
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('id')
  if (!sessionId || !UUID_RE.test(sessionId)) {
    return NextResponse.json(
      { ok: false, error: 'session_id invalido (precisa UUID v4).' },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'Nao autenticado.' }, { status: 401 })
  }

  const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, null)
  if (!usuarioId) {
    return NextResponse.json({ ok: false, error: 'Usuario nao encontrado.' }, { status: 404 })
  }

  // Filtro defensivo: usuario_id no WHERE (RLS ja protege, mas explicit-deny e
  // mais auditavel). Limit 200 rows = ~100 trocas pra cobrir conversas longas
  // sem estourar response.
  const { data, error } = await supabase
    .from('historico')
    .select('id, mensagem_usuario, resposta_agente, created_at, agente')
    .eq('session_id', sessionId)
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) {
    return NextResponse.json(
      { ok: false, error: 'Erro ao carregar sessao.' },
      { status: 500 },
    )
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Sessao nao encontrada ou sem mensagens.' },
      { status: 404 },
    )
  }

  // Reconstroi pares user/assistant em sequencia. Cada row da tabela = 1 troca.
  // Frontend chat espera array Message[] com {id, role, content, timestamp}.
  type ChatMsg = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
  }
  const messages: ChatMsg[] = []
  for (const row of data) {
    const ts = new Date(row.created_at).getTime()
    if (row.mensagem_usuario && typeof row.mensagem_usuario === 'string') {
      messages.push({
        id: `${row.id}-u`,
        role: 'user',
        content: row.mensagem_usuario,
        timestamp: ts,
      })
    }
    if (row.resposta_agente && typeof row.resposta_agente === 'string') {
      messages.push({
        id: `${row.id}-a`,
        role: 'assistant',
        content: row.resposta_agente,
        timestamp: ts + 1,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    session_id: sessionId,
    messages,
    total: messages.length,
    first_at: data[0]?.created_at,
    last_at: data[data.length - 1]?.created_at,
  })
}
