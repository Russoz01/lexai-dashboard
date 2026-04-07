'use client'
import { createClient } from '@/lib/supabase'
import { sm2Update } from '@/lib/spaced-repetition'

const supabase = createClient()

async function resolveUsuarioId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  return data?.id || null
}

// ---------------------------------------------------------------------------
// Quiz attempts
// ---------------------------------------------------------------------------

export interface QuizAttemptRow {
  id: string
  usuario_id: string
  tema: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questao: any
  resposta_dada: string
  resposta_correta: string
  acertou: boolean
  tempo_segundos: number
  created_at: string
}

export async function recordQuizAttempt(
  tema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questao: any,
  respostaDada: string,
  respostaCorreta: string,
  acertou: boolean,
  tempoSeg: number,
): Promise<QuizAttemptRow | null> {
  const usuario_id = await resolveUsuarioId()
  if (!usuario_id) return null

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      usuario_id,
      tema,
      questao,
      resposta_dada: respostaDada,
      resposta_correta: respostaCorreta,
      acertou,
      tempo_segundos: tempoSeg,
    })
    .select()
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[recordQuizAttempt]', error)
    return null
  }
  return data as QuizAttemptRow
}

export async function listMyAttempts(tema?: string, limit = 50): Promise<QuizAttemptRow[]> {
  const usuario_id = await resolveUsuarioId()
  if (!usuario_id) return []

  let query = supabase
    .from('quiz_attempts')
    .select('*')
    .eq('usuario_id', usuario_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (tema) query = query.eq('tema', tema)

  const { data, error } = await query
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[listMyAttempts]', error)
    return []
  }
  return (data || []) as QuizAttemptRow[]
}

export interface QuizStats {
  total: number
  acertos: number
  taxa: number // 0..1
  porTema: { tema: string; total: number; acertos: number }[]
}

export async function getQuizStats(): Promise<QuizStats> {
  const usuario_id = await resolveUsuarioId()
  if (!usuario_id) return { total: 0, acertos: 0, taxa: 0, porTema: [] }

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('tema, acertou')
    .eq('usuario_id', usuario_id)

  if (error || !data) {
    // eslint-disable-next-line no-console
    if (error) console.error('[getQuizStats]', error)
    return { total: 0, acertos: 0, taxa: 0, porTema: [] }
  }

  const total = data.length
  const acertos = data.filter(r => r.acertou).length
  const taxa = total === 0 ? 0 : acertos / total

  const map = new Map<string, { tema: string; total: number; acertos: number }>()
  for (const row of data) {
    const key = row.tema || '(sem tema)'
    const cur = map.get(key) || { tema: key, total: 0, acertos: 0 }
    cur.total += 1
    if (row.acertou) cur.acertos += 1
    map.set(key, cur)
  }
  const porTema = Array.from(map.values()).sort((a, b) => b.total - a.total)

  return { total, acertos, taxa, porTema }
}

// ---------------------------------------------------------------------------
// Flashcards (SM-2 spaced repetition)
// ---------------------------------------------------------------------------

export interface FlashcardRow {
  id: string
  usuario_id: string
  tema: string
  pergunta: string
  resposta: string
  facilidade: number
  intervalo_dias: number
  proxima_revisao: string // YYYY-MM-DD
  total_revisoes: number
  created_at: string
}

export async function createFlashcard(
  tema: string,
  pergunta: string,
  resposta: string,
): Promise<FlashcardRow | null> {
  const usuario_id = await resolveUsuarioId()
  if (!usuario_id) return null

  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      usuario_id,
      tema,
      pergunta,
      resposta,
      // facilidade, intervalo_dias, total_revisoes follow column defaults (2.5, 1, 0)
      proxima_revisao: today,
    })
    .select()
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[createFlashcard]', error)
    return null
  }
  return data as FlashcardRow
}

export async function listDueFlashcards(limit = 20): Promise<FlashcardRow[]> {
  const usuario_id = await resolveUsuarioId()
  if (!usuario_id) return []

  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('usuario_id', usuario_id)
    .lte('proxima_revisao', today)
    .order('proxima_revisao', { ascending: true })
    .limit(limit)

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[listDueFlashcards]', error)
    return []
  }
  return (data || []) as FlashcardRow[]
}

export interface FlashcardStats {
  total: number
  due: number
  facilidadeMedia: number
}

export async function getFlashcardStats(): Promise<FlashcardStats> {
  const usuario_id = await resolveUsuarioId()
  if (!usuario_id) return { total: 0, due: 0, facilidadeMedia: 0 }

  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('flashcards')
    .select('facilidade, proxima_revisao')
    .eq('usuario_id', usuario_id)

  if (error || !data) {
    // eslint-disable-next-line no-console
    if (error) console.error('[getFlashcardStats]', error)
    return { total: 0, due: 0, facilidadeMedia: 0 }
  }

  const total = data.length
  const due = data.filter(c => (c.proxima_revisao || '') <= today).length
  const facilidadeMedia = total === 0
    ? 0
    : data.reduce((sum, c) => sum + (Number(c.facilidade) || 0), 0) / total

  return { total, due, facilidadeMedia }
}

export async function reviewFlashcard(id: string, quality: number): Promise<FlashcardRow | null> {
  // Fetch current state first so SM-2 can compute the next interval
  const { data: current, error: fetchErr } = await supabase
    .from('flashcards')
    .select('facilidade, intervalo_dias, total_revisoes')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr || !current) {
    // eslint-disable-next-line no-console
    console.error('[reviewFlashcard] fetch', fetchErr)
    return null
  }

  const updated = sm2Update(
    Number(current.facilidade) || 2.5,
    Number(current.intervalo_dias) || 1,
    Number(current.total_revisoes) || 0,
    quality,
  )

  const { data, error } = await supabase
    .from('flashcards')
    .update(updated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[reviewFlashcard] update', error)
    return null
  }
  return data as FlashcardRow
}

export async function deleteFlashcard(id: string): Promise<boolean> {
  const { error } = await supabase.from('flashcards').delete().eq('id', id)
  return !error
}
