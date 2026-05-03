'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type UserPreferences,
  DEFAULT_PREFERENCES,
} from '@/lib/preferences'

/* ════════════════════════════════════════════════════════════════════
 * usePreferences hook · v1 (2026-05-03)
 * ────────────────────────────────────────────────────────────────────
 * Client-side wrapper pra ler/escrever preferências persistidas.
 * Cached em localStorage como fallback offline + reduz roundtrip.
 *
 * Uso:
 *   const { prefs, loading, update } = usePreferences()
 *   const tom = prefs.tom // 'parceiro'
 *   await update({ tom: 'profissional' })
 * ═══════════════════════════════════════════════════════════════════ */

const CACHE_KEY = 'pralvex-prefs-cache'

export type UsePreferencesReturn = {
  prefs: Omit<UserPreferences, 'created_at' | 'updated_at'>
  loading: boolean
  update: (patch: Partial<typeof DEFAULT_PREFERENCES>) => Promise<{ ok: boolean; error?: string }>
  reload: () => Promise<void>
}

function readCached(): typeof DEFAULT_PREFERENCES | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as typeof DEFAULT_PREFERENCES
  } catch {
    return null
  }
}

function writeCache(p: typeof DEFAULT_PREFERENCES) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(p))
  } catch { /* noop */ }
}

export function usePreferences(): UsePreferencesReturn {
  const [supabase] = useState(() => createClient())
  const [prefs, setPrefs] = useState<typeof DEFAULT_PREFERENCES>(
    () => readCached() ?? DEFAULT_PREFERENCES,
  )
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPrefs = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPrefs(readCached() ?? DEFAULT_PREFERENCES)
        return
      }

      // Resolve usuario_id (não auth_user_id)
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!usuario) {
        setPrefs(DEFAULT_PREFERENCES)
        return
      }
      setUsuarioId(usuario.id)

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('usuario_id', usuario.id)
        .maybeSingle()

      const next = data
        ? {
            tom: data.tom,
            idioma: data.idioma,
            modelo_padrao: data.modelo_padrao,
            area_juridica_padrao: data.area_juridica_padrao,
            auto_save_delay_ms: data.auto_save_delay_ms,
            notif_push: data.notif_push,
            notif_email: data.notif_email,
            notif_prazos: data.notif_prazos,
            smart_suggestions: data.smart_suggestions,
            memory_enabled: data.memory_enabled,
            atalhos: data.atalhos || {},
          }
        : DEFAULT_PREFERENCES

      setPrefs(next)
      writeCache(next)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchPrefs()
  }, [fetchPrefs])

  const update = useCallback(
    async (patch: Partial<typeof DEFAULT_PREFERENCES>): Promise<{ ok: boolean; error?: string }> => {
      const next = { ...prefs, ...patch }
      setPrefs(next) // optimistic
      writeCache(next)

      if (!usuarioId) return { ok: false, error: 'usuario_id ausente' }

      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          { usuario_id: usuarioId, ...DEFAULT_PREFERENCES, ...next },
          { onConflict: 'usuario_id' },
        )

      if (error) {
        // Reverte optimistic update on error
        await fetchPrefs()
        return { ok: false, error: error.message }
      }
      return { ok: true }
    },
    [prefs, usuarioId, supabase, fetchPrefs],
  )

  return { prefs: { usuario_id: usuarioId || '', ...prefs }, loading, update, reload: fetchPrefs }
}
