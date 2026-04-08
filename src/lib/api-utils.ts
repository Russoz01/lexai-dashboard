// validateInput and safeError were previously used by the per-agent API
// routes, but those routes have been migrated to createAgentRoute which
// handles both concerns internally. Only validateAuth remains, used by
// non-agent routes (share/create) that don't need the full HOF.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function validateAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return {
      user: null,
      supabase,
      error: NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 }),
    }
  }
  return { user, supabase, error: null }
}
