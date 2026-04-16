'use client'

/**
 * ReferralPanel — painel "Indique e ganhe" no dashboard.
 * Mostra codigo de indicacao, link copiavel, stats de indicacoes.
 *
 * Consome GET /api/referral.
 */

import { useEffect, useState } from 'react'
import { toast } from './Toast'

interface ReferralData {
  code: string
  shareUrl: string
  stats: { completed: number; pending: number; totalDaysEarned: number }
}

export function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/referral', { cache: 'no-store' })
        if (!res.ok) throw new Error('fetch_failed')
        const json = await res.json()
        if (json.ok && json.data) setData(json.data)
      } catch {
        // silent — don't break the dashboard
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function copyLink() {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data.shareUrl)
      setCopied(true)
      toast('success', 'Link copiado!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast('error', 'Nao foi possivel copiar.')
    }
  }

  if (loading) {
    return (
      <div className="ref-panel ref-loading" aria-busy="true">
        <div className="ref-skel" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="ref-panel">
      <div className="ref-header">
        <div>
          <div className="ref-serial">Programa de indicacao</div>
          <div className="ref-title">
            Indique um colega, <strong>ganhe 15 dias</strong>
          </div>
        </div>
        <div className="ref-badge">
          <i className="bi bi-gift" />
        </div>
      </div>

      <div className="ref-body">
        <p className="ref-desc">
          Compartilhe seu link. Quando seu colega criar a conta, voce ganha 15 dias
          adicionais no seu plano atual. Sem limite de indicacoes.
        </p>

        <div className="ref-link-row">
          <input
            type="text"
            readOnly
            value={data.shareUrl}
            className="ref-input"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button className="ref-copy" onClick={copyLink}>
            <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'}`} />
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        {(data.stats.completed > 0 || data.stats.pending > 0) && (
          <div className="ref-stats">
            <div className="ref-stat">
              <div className="ref-stat-n">{data.stats.completed}</div>
              <div className="ref-stat-label">Concluidas</div>
            </div>
            <div className="ref-stat">
              <div className="ref-stat-n">{data.stats.pending}</div>
              <div className="ref-stat-label">Pendentes</div>
            </div>
            <div className="ref-stat">
              <div className="ref-stat-n">+{data.stats.totalDaysEarned}d</div>
              <div className="ref-stat-label">Bonus ganho</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .ref-panel {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ref-loading { min-height: 100px; opacity: 0.5; }
        .ref-skel {
          height: 20px;
          border-radius: 4px;
          background: var(--hover);
          animation: ref-pulse 1.2s ease-in-out infinite;
        }
        @keyframes ref-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .ref-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .ref-serial {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .ref-title {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .ref-title strong {
          color: var(--accent);
          font-weight: 700;
        }
        .ref-badge {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: color-mix(in srgb, var(--accent, #BFA68E) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent, #BFA68E) 25%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: var(--accent);
        }
        .ref-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }
        .ref-link-row {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .ref-input {
          flex: 1;
          font-family: inherit;
          font-size: 12px;
          padding: 8px 12px;
          background: var(--hover);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: text;
          min-width: 0;
        }
        .ref-input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .ref-copy {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--accent);
          color: var(--bg-base);
          border: none;
          border-radius: 4px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.16s ease;
        }
        .ref-copy:hover { opacity: 0.9; }
        .ref-stats {
          display: flex;
          gap: 20px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .ref-stat-n {
          font-family: var(--font-playfair, Georgia), serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }
        .ref-stat-label {
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          margin-top: 3px;
        }
      `}</style>
    </div>
  )
}
