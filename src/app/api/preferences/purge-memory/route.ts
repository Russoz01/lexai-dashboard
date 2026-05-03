import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveUsuarioIdServer } from '@/lib/api-utils'
import { purgeAgentMemory } from '@/lib/preferences'
import { audit } from '@/lib/audit'
import { safeLog } from '@/lib/safe-log'

/* ════════════════════════════════════════════════════════════════════
 * POST /api/preferences/purge-memory
 * ────────────────────────────────────────────────────────────────────
 * LGPD Art. 18 — direito de exclusão. Apaga TODA a memória cross-agent
 * do usuário autenticado e registra no audit_log.
 *
 * Antes (2026-05-03 audit elite): UI fazia DELETE direto via supabase
 * client → funcionava (RLS protege) mas sem audit trail. LGPD exige
 * registro de operações de exclusão de dados pessoais.
 *
 * Resposta: { ok: true, deleted: N } | { ok: false, error: string }
 * ════════════════════════════════════════════════════════════════════ */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }

    // Rate limit defensivo — purge é operação cara + auditável.
    // Usa janela padrão da plataforma (20 req/min) — suficiente pro caso humano.
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:purge_memory`)
    if (!rl.ok) return rateLimitResponse(rl)

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (!usuarioId) {
      return NextResponse.json({ error: 'Perfil nao encontrado.' }, { status: 403 })
    }

    const result = await purgeAgentMemory(supabase, usuarioId)
    if (!result.ok) {
      safeLog.error('[API /preferences/purge-memory] purge failed:', result.error)
      return NextResponse.json({ error: 'Falha ao apagar memoria.' }, { status: 500 })
    }

    // Audit trail LGPD — sempre logamos, mesmo se deleted=0
    audit({
      usuarioId,
      action: 'user.memory_purge',
      entityType: 'agent_memory',
      metadata: { deleted: result.deleted ?? 0 },
      request: req,
    }).catch(() => {})

    return NextResponse.json({ ok: true, deleted: result.deleted ?? 0 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    safeLog.error('[API /preferences/purge-memory] unhandled:', msg)
    return NextResponse.json({ error: 'Erro ao processar solicitacao.' }, { status: 500 })
  }
}
