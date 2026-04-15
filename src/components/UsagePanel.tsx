'use client'

/**
 * UsagePanel — mostra o consumo do mes corrente e quanto falta ate o
 * reset. Consome /api/user/usage (fonte de verdade no server) e renderiza
 * uma barra de progresso editorial (hairline + accent fill).
 *
 * Emite um evento "lexai:usage-updated" que outras paginas podem ouvir
 * apos completar chamadas aos agentes, forcando um refetch sem precisar
 * de polling.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
    window.addEventListener('lexai:usage-updated', onUpdate)
    return () => {
      mounted = false
      window.removeEventListener('lexai:usage-updated', onUpdate)
    }
  }, [])

  if (loading) {
    return (
      <div className="usage-panel usage-loading" aria-busy="true">
        <div className="usage-bar" />
      </div>
    )
  }

  if (error || !data) return null // silent fail — don't break the dashboard

  const warn = data.percentUsed >= 80
  const urgent = data.percentUsed >= 95
  const isUnlimited = data.limit >= 100_000 // firma/enterprise pratico

  return (
    <div className={`usage-panel ${urgent ? 'is-urgent' : warn ? 'is-warn' : ''}`}>
      <div className="usage-header">
        <div>
          <div className="usage-serial">Consumo do mes</div>
          <div className="usage-plan">
            Plano <strong>{PLAN_LABEL[data.plan] || data.plan}</strong>
            {data.isTrialing && <span className="usage-trial-tag">trial</span>}
          </div>
        </div>
        <div className="usage-numbers">
          {isUnlimited ? (
            <>
              <div className="usage-count">{data.totalUsed}</div>
              <div className="usage-limit">documentos (ilimitado)</div>
            </>
          ) : (
            <>
              <div className="usage-count">
                {data.totalUsed}<span className="usage-of"> / {data.limit}</span>
              </div>
              <div className="usage-limit">documentos neste mes</div>
            </>
          )}
        </div>
      </div>

      {!isUnlimited && (
        <div className="usage-bar" aria-hidden>
          <div
            className="usage-fill"
            style={{ width: `${Math.min(100, data.percentUsed)}%` }}
          />
        </div>
      )}

      <div className="usage-footer">
        <span className="usage-reset">
          Reseta em <strong>{daysUntil(data.nextResetAt)}</strong> dia(s)
        </span>
        {warn && !isUnlimited && (
          <Link href="/dashboard/planos" className="usage-upgrade">
            Fazer upgrade &rarr;
          </Link>
        )}
      </div>

      <style jsx>{`
        .usage-panel {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: border-color .2s ease;
        }
        .usage-panel.is-warn { border-color: color-mix(in srgb, #f59e0b 50%, var(--border)); }
        .usage-panel.is-urgent { border-color: color-mix(in srgb, #dc2626 60%, var(--border)); }
        .usage-loading {
          min-height: 110px;
          opacity: 0.5;
        }
        .usage-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }
        .usage-serial {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .usage-plan {
          font-size: 13px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .usage-plan strong { color: var(--text-primary); font-weight: 600; }
        .usage-trial-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 2px 6px;
          background: color-mix(in srgb, var(--accent) 14%, transparent);
          color: var(--accent);
          border-radius: 2px;
        }
        .usage-numbers { text-align: right; }
        .usage-count {
          font-family: var(--font-playfair), serif;
          font-size: 26px;
          font-weight: 700;
          line-height: 1;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .usage-of {
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: var(--text-muted);
          letter-spacing: 0;
        }
        .usage-limit {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
          letter-spacing: 0.04em;
        }
        .usage-bar {
          position: relative;
          height: 6px;
          background: var(--hover);
          border-radius: 3px;
          overflow: hidden;
        }
        .usage-fill {
          position: absolute; inset: 0;
          width: 0%;
          background: var(--accent);
          border-radius: 3px;
          transition: width .4s cubic-bezier(.4, 0, .2, 1), background .2s ease;
        }
        .is-warn .usage-fill { background: #f59e0b; }
        .is-urgent .usage-fill { background: #dc2626; }
        .usage-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-muted);
        }
        .usage-reset strong { color: var(--text-primary); font-weight: 600; }
        .usage-upgrade {
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.03em;
          transition: transform .16s ease;
        }
        .usage-upgrade:hover { transform: translateX(2px); }
        @media (prefers-reduced-motion: reduce) {
          .usage-fill, .usage-upgrade { transition: none; }
        }
      `}</style>
    </div>
  )
}
