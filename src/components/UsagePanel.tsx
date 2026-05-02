'use client'

/**
 * UsagePanel — mostra o consumo do mes corrente e quanto falta ate o
 * reset. Consome /api/user/usage (fonte de verdade no server) e renderiza
 * uma barra de progresso editorial (hairline + accent fill).
 *
 * Emite um evento "pralvex:usage-updated" que outras paginas podem ouvir
 * apos completar chamadas aos agentes, forcando um refetch sem precisar
 * de polling.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import s from './UsagePanel.module.css'

interface UsageResponse {
  plan: string
  isTrialing: boolean
  limit: number
  totalUsed: number
  remaining: number
  percentUsed: number
  byAgent: Record<string, number>
  month: string
  nextResetAt: string
}

const PLAN_LABEL: Record<string, string> = {
  free: 'Demonstracao',
  starter: 'Escritorio',
  escritorio: 'Escritorio',
  pro: 'Firma',
  firma: 'Firma',
  enterprise: 'Enterprise',
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

export function UsagePanel() {
  const [data, setData] = useState<UsageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    async function fetchUsage() {
      try {
        const res = await fetch('/api/user/usage', { cache: 'no-store' })
        if (!res.ok) throw new Error('fetch_failed')
        const json = await res.json()
        if (!mounted) return
        if (json.ok === false) {
          setError(true)
        } else {
          setData(json.data ?? json) // support envelope + legacy
          setError(false)
        }
      } catch {
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchUsage()
    const onUpdate = () => fetchUsage()
    window.addEventListener('pralvex:usage-updated', onUpdate)
    return () => {
      mounted = false
      window.removeEventListener('pralvex:usage-updated', onUpdate)
    }
  }, [])

  if (loading) {
    return (
      <div className={`${s.usagePanel} ${s.usageLoading}`} aria-busy="true">
        <div className={s.usageBar} />
      </div>
    )
  }

  if (error || !data) return null // silent fail — don't break the dashboard

  const warn = data.percentUsed >= 80
  const urgent = data.percentUsed >= 95
  const isUnlimited = data.limit >= 100_000 // firma/enterprise pratico

  return (
    <div className={`${s.usagePanel} ${urgent ? s.isUrgent : warn ? s.isWarn : ''}`}>
      <div className={s.usageHeader}>
        <div>
          <div className={s.usageSerial}>Consumo do mes</div>
          <div className={s.usagePlan}>
            Plano <strong className={s.usagePlanStrong}>{PLAN_LABEL[data.plan] || data.plan}</strong>
            {data.isTrialing && <span className={s.usageTrialTag}>trial</span>}
          </div>
        </div>
        <div className={s.usageNumbers}>
          {isUnlimited ? (
            <>
              <div className={s.usageCount}>{data.totalUsed}</div>
              <div className={s.usageLimit}>documentos (ilimitado)</div>
            </>
          ) : (
            <>
              <div className={s.usageCount}>
                {data.totalUsed}<span className={s.usageOf}> / {data.limit}</span>
              </div>
              <div className={s.usageLimit}>documentos neste mes</div>
            </>
          )}
        </div>
      </div>

      {!isUnlimited && (
        <div className={s.usageBar} aria-hidden>
          <div
            className={s.usageFill}
            style={{ width: `${Math.min(100, data.percentUsed)}%` }}
          />
        </div>
      )}

      <div className={s.usageFooter}>
        <span>
          Reseta em <strong className={s.usageResetStrong}>{daysUntil(data.nextResetAt)}</strong> dia(s)
        </span>
        {warn && !isUnlimited && (
          <Link href="/dashboard/planos" className={s.usageUpgrade}>
            Fazer upgrade &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}
