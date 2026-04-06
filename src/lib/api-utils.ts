import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_INPUT_LENGTH = 50000 // 50k chars max

export async function validateAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, supabase, error: NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 }) }
  return { user, supabase, error: null }
}

export function validateInput(text: string | undefined, minLength: number, fieldName: string) {
  if (!text || text.trim().length < minLength) {
    return NextResponse.json({ error: `${fieldName} muito curto. Minimo ${minLength} caracteres.` }, { status: 400 })
  }
  if (text.length > MAX_INPUT_LENGTH) {
    return NextResponse.json({ error: `${fieldName} excede o limite de ${MAX_INPUT_LENGTH} caracteres.` }, { status: 400 })
  }
  return null
}

export function safeError(context: string, err: unknown) {
  const msg = err instanceof Error ? err.message : 'Erro interno'
  console.error(`[API ${context}]`, msg)
  // Never expose internal details to client
  return NextResponse.json({ error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }, { status: 500 })
}
