'use client'

import { createClient } from '@/lib/supabase'

/**
 * Resolves public.usuarios.id from the current auth.users.id.
 *
 * CRITICAL: Every FK in our schema (financeiro, historico, prazos, documentos,
 * drafts, flashcards, etc.) points to usuarios.id — NOT auth.users.id.
 * Never insert auth.users.id directly into a usuario_id column.
 *
 * A trigger (ensure_usuario_row) automatically creates the usuarios row on
 * signup, so this should always return a value for authenticated users.
 * The lazy insert below is a defensive fallback in case the trigger failed
 * or the row was deleted manually.
 *
 * Cached per-session in memory to avoid refetching on every call.
 */

let cachedUsuarioId: string | null = null
let cachedAuthId: string | null = null

export async function resolveUsuarioId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    cachedUsuarioId = null
    cachedAuthId = null
    return null
  }

  // Return cached value if same auth user
  if (cachedAuthId === user.id && cachedUsuarioId) {
    return cachedUsuarioId
  }

  const { data } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (data?.id) {
    cachedAuthId = user.id
    cachedUsuarioId = data.id
    return data.id
  }

  // Fallback: try match by email (legacy rows before auth_user_id column existed)
  if (user.email) {
    const { data: byEmail } = await supabase
      .from('usuarios')
      .select('id, auth_user_id')
      .eq('email', user.email)
      .maybeSingle()

    if (byEmail?.id) {
      // Backfill auth_user_id if it was null
      if (!byEmail.auth_user_id) {
        await supabase.from('usuarios').update({ auth_user_id: user.id }).eq('id', byEmail.id)
      }
      cachedAuthId = user.id
      cachedUsuarioId = byEmail.id
      return byEmail.id
    }
  }

  // Last resort: create a minimal usuarios row for this auth user
  const nome = (user.user_metadata?.nome as string) || user.email?.split('@')[0] || 'Usuario'
  const { data: created, error: insertError } = await supabase
    .from('usuarios')
    .insert({
      auth_user_id: user.id,
      email: user.email || '',
      nome,
      plano: 'free',
      subscription_status: 'trialing',
    })
    .select('id')
    .single()

  if (insertError || !created?.id) {
    // eslint-disable-next-line no-console
    console.error('[resolveUsuarioId] Failed to create usuarios row:', insertError?.message)
    return null
  }

  cachedAuthId = user.id
  cachedUsuarioId = created.id
  return created.id
}

/** Clear cached usuarios.id — call on logout */
export function clearUsuarioCache() {
  cachedUsuarioId = null
  cachedAuthId = null
}
