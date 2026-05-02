'use client'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

async function resolveUsuarioId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle()
  return data?.id || null
}

export interface DraftRow {
  id: string
  agente: string
  titulo: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conteudo: any
  versao: number
  parent_id: string | null
  created_at: string
}

export async function saveDraft(
  agente: 'redator' | 'negociador' | 'resumidor',
  titulo: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conteudo: any,
  parent_id?: string,
): Promise<DraftRow | null> {
  const usuario_id = await resolveUsuarioId()
  if (!usuario_id) return null

  // Get next versao number for this parent_id (or 1 if new)
  let versao = 1
  if (parent_id) {
    const { data } = await supabase
      .from('drafts')
      .select('versao')
      .eq('parent_id', parent_id)
      .order('versao', { ascending: false })
      .limit(1)
    versao = (data?.[0]?.versao || 0) + 1
  }

  const { data, error } = await supabase
    .from('drafts')
    .insert({
      usuario_id,
      agente,
      titulo,
      conteudo,
      versao,
      parent_id: parent_id || null,
    })
    .select()
    .single()

  if (error) {
    console.error('[saveDraft]', error)
    return null
  }
  return data as DraftRow
}

export async function listDrafts(
  agente: 'redator' | 'negociador' | 'resumidor',
  limit = 20,
): Promise<DraftRow[]> {
  const usuario_id = await resolveUsuarioId()
  if (!usuario_id) return []
  const { data } = await supabase
    .from('drafts')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('agente', agente)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []) as DraftRow[]
}

export async function deleteDraft(id: string): Promise<boolean> {
  const { error } = await supabase.from('drafts').delete().eq('id', id)
  return !error
}
