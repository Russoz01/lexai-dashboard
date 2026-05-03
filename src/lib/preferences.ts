/* ════════════════════════════════════════════════════════════════════
 * preferences · v1 (2026-05-03)
 * ────────────────────────────────────────────────────────────────────
 * CRUD de user_preferences + helper de memória cross-agent.
 *
 * Use:
 *   import { getUserPreferences, setUserPreferences, recordAgentMemory,
 *            getRecentMemory } from '@/lib/preferences'
 *
 * Server-side: chama com SupabaseClient autenticado (RLS aplica).
 * Client-side: usa hook useUserPreferences (ver hooks/usePreferences.ts).
 * ═══════════════════════════════════════════════════════════════════ */

import type { SupabaseClient } from '@supabase/supabase-js'

export type Tom = 'profissional' | 'parceiro' | 'casual'
export type Modelo = 'haiku' | 'sonnet'

export interface UserPreferences {
  usuario_id: string
  tom: Tom
  idioma: string
  modelo_padrao: Modelo
  area_juridica_padrao: string | null
  auto_save_delay_ms: number | null
  notif_push: boolean
  notif_email: boolean
  notif_prazos: boolean
  smart_suggestions: boolean
  memory_enabled: boolean
  atalhos: Record<string, string>
  created_at: string
  updated_at: string
}

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'usuario_id' | 'created_at' | 'updated_at'> = {
  tom: 'parceiro',
  idioma: 'pt-BR',
  modelo_padrao: 'haiku',
  area_juridica_padrao: null,
  auto_save_delay_ms: 1500,
  notif_push: true,
  notif_email: true,
  notif_prazos: true,
  smart_suggestions: true,
  memory_enabled: true,
  atalhos: {},
}

/** Busca preferências; retorna defaults se não existem. Cria row lazily na 1ª update. */
export async function getUserPreferences(
  supabase: SupabaseClient,
  usuarioId: string,
): Promise<UserPreferences> {
  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()

  if (data) return data as UserPreferences

  // Sem row — retorna defaults (não cria ainda; só cria no 1º setUserPreferences)
  const now = new Date().toISOString()
  return {
    usuario_id: usuarioId,
    ...DEFAULT_PREFERENCES,
    created_at: now,
    updated_at: now,
  }
}

/** Upsert preferências. Merge com defaults pra primeira gravação. */
export async function setUserPreferences(
  supabase: SupabaseClient,
  usuarioId: string,
  patch: Partial<Omit<UserPreferences, 'usuario_id' | 'created_at' | 'updated_at'>>,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      { usuario_id: usuarioId, ...DEFAULT_PREFERENCES, ...patch },
      { onConflict: 'usuario_id' },
    )

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/* ── Memória cross-agent ─────────────────────────────────────────── */

export interface AgentMemoryEntry {
  id: string
  usuario_id: string
  agente: string
  resumo: string
  fatos: Array<{ key: string; value: string }>
  tags: string[]
  historico_id: string | null
  created_at: string
  expires_at: string
}

/**
 * Salva uma entrada de memória pro user (após cada execução de agente).
 * Respeita memory_enabled — se off, no-op silencioso.
 *
 * Caller (route handler do agente) gera resumo curto via LLM ou heurística:
 *   - Resumir prompt+resposta em 1-2 frases (max 500 chars)
 *   - Extrair fatos: cliente, processo, valor, prazo, etc
 *   - Tags: ['contrato-aluguel', 'civel'] etc
 */
export async function recordAgentMemory(
  supabase: SupabaseClient,
  usuarioId: string,
  entry: {
    agente: string
    resumo: string
    fatos?: Array<{ key: string; value: string }>
    tags?: string[]
    historico_id?: string
  },
  opts?: { prefs?: UserPreferences | null },
): Promise<void> {
  // P1-1 fix (audit elite 2026-05-03): aceita prefs cacheado pelo caller
  // pra evitar N+1. Caller (route handler do agente) já chama getUserPreferences
  // antes pra montar prefsContext — passar aqui economiza 1 round-trip Supabase
  // por execução × 21 agentes.
  const prefs = opts?.prefs !== undefined
    ? opts.prefs
    : await getUserPreferences(supabase, usuarioId)
  if (!prefs || !prefs.memory_enabled) return

  // P0-2 LGPD fix (audit elite 2026-05-03): anonimiza resumo + fatos antes de
  // gravar. Antes inseriamos texto cru com nomes/CPF/CNPJ/email/telefone/CEP
  // — vazamento futuro = multa ANPD + churn. anonymize() ja existia mas estava
  // unused. Substitui PII por mascaras [CPF_1], [EMAIL_1] etc. Tags nao precisam
  // (heuristica sem PII).
  const { anonymize } = await import('@/lib/anonymizer')
  const resumoAnonimo = anonymize(entry.resumo.slice(0, 500)).text
  const fatosAnonimos = (entry.fatos || []).map((f) => ({
    key: f.key,
    value: anonymize(f.value).text,
  }))

  await supabase.from('agent_memory').insert({
    usuario_id: usuarioId,
    agente: entry.agente,
    resumo: resumoAnonimo,
    fatos: fatosAnonimos,
    tags: entry.tags || [],
    historico_id: entry.historico_id || null,
  })
}

/**
 * Busca últimas N entradas de memória do user (últimas 30 dias).
 * Usado pelo Chat orquestrador pra contextualizar nova consulta.
 *
 * @param agente Filtra por agente específico (opcional)
 * @param tags Filtra por overlap de tags (opcional)
 * @param limit Default 5 (pra não estourar context window)
 */
export async function getRecentMemory(
  supabase: SupabaseClient,
  usuarioId: string,
  opts: { agente?: string; tags?: string[]; limit?: number } = {},
): Promise<AgentMemoryEntry[]> {
  const limit = opts.limit ?? 5

  let query = supabase
    .from('agent_memory')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit)

  if (opts.agente) query = query.eq('agente', opts.agente)
  if (opts.tags && opts.tags.length > 0) query = query.overlaps('tags', opts.tags)

  const { data } = await query
  return (data as AgentMemoryEntry[]) || []
}

/** Purga TODA memória do user (LGPD Art. 18 — direito de exclusão). */
export async function purgeAgentMemory(
  supabase: SupabaseClient,
  usuarioId: string,
): Promise<{ ok: boolean; deleted?: number; error?: string }> {
  const { error, count } = await supabase
    .from('agent_memory')
    .delete({ count: 'exact' })
    .eq('usuario_id', usuarioId)

  if (error) return { ok: false, error: error.message }
  return { ok: true, deleted: count ?? 0 }
}

/**
 * Helper: format memory pra prompt LLM (compact + estruturado).
 * Inject no system prompt do chat/agente quando smart_suggestions=true.
 */
export function formatMemoryForPrompt(entries: AgentMemoryEntry[]): string {
  if (entries.length === 0) return ''
  const lines = entries.map((e, i) => {
    const fatosFmt = e.fatos.length
      ? ' · ' + e.fatos.slice(0, 3).map(f => `${f.key}=${f.value}`).join(', ')
      : ''
    return `${i + 1}. [${e.agente}] ${e.resumo}${fatosFmt}`
  })
  return `\n\nMEMÓRIA RECENTE DO USUÁRIO (últimas ${entries.length} interações):\n${lines.join('\n')}\n`
}
