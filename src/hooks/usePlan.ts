'use client'

import { useEffect, useState, useCallback } from 'react'

export interface PlanInfo {
  plano: 'free' | 'starter' | 'pro' | 'enterprise'
  realPlano: string
  authenticated: boolean
  subscription_status: string
  trial: { active: boolean; ends_at: string | null; days_left: number }
  stripe_customer_id: string | null
  loading: boolean
}

const DEFAULT: PlanInfo = {
  plano: 'free',
  realPlano: 'free',
  authenticated: false,
  subscription_status: 'trialing',
  trial: { active: false, ends_at: null, days_left: 0 },
  stripe_customer_id: null,
  loading: true,
}

/**
 * Hook for fetching the user's plan from the server (NOT localStorage).
 * Server-side verified, cannot be tampered with by the client.
 *
 * Cached in sessionStorage for 60 seconds to avoid refetching on every nav.
 */
export function usePlan(): PlanInfo & { refresh: () => Promise<void> } {
  const [info, setInfo] = useState<PlanInfo>(DEFAULT)

  const fetchPlan = useCallback(async () => {
    try {
      // Try cache first (60s freshness)
      const cached = sessionStorage.getItem('lexai-plan-cache')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (Date.now() - parsed.t < 60_000) {
            setInfo({ ...parsed.data, loading: false })
            return
          }
        } catch { /* ignore */ }
      }

      const res = await fetch('/api/user/plan', { cache: 'no-store' })
      if (!res.ok) {
        setInfo({ ...DEFAULT, loading: false })
        return
      }
      const data = await res.json()
      const result: PlanInfo = {
        plano: data.plano || 'free',
        realPlano: data.realPlano || 'free',
        authenticated: !!data.authenticated,
        subscription_status: data.subscription_status || 'trialing',
        trial: data.trial || { active: false, ends_at: null, days_left: 0 },
        stripe_customer_id: data.stripe_customer_id || null,
        loading: false,
      }
      setInfo(result)
      sessionStorage.setItem('lexai-plan-cache', JSON.stringify({ t: Date.now(), data: result }))
    } catch {
      setInfo({ ...DEFAULT, loading: false })
    }
  }, [])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  const refresh = useCallback(async () => {
    sessionStorage.removeItem('lexai-plan-cache')
    await fetchPlan()
  }, [fetchPlan])

  return { ...info, refresh }
}
