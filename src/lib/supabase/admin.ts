import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client used by webhooks and trusted server-side jobs.
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
