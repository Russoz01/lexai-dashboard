'use client'

/**
 * ReferralPanel — painel "Indique e ganhe" no dashboard.
 * Mostra codigo de indicacao, link copiavel, stats de indicacoes.
 *
 * Consome GET /api/referral.
 */

import { useEffect, useState } from 'react'
import { Check, Clipboard, Gift } from 'lucide-react'
import { toast } from './Toast'
import s from './ReferralPanel.module.css'

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
      <div className={`${s.refPanel} ${s.refLoading}`} aria-busy="true">
        <div className={s.refSkel} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className={s.refPanel}>
      <div className={s.refHeader}>
        <div>
          <div className={s.refSerial}>Programa de indicacao</div>
          <div className={s.refTitle}>
            Indique um colega, <strong className={s.refTitleStrong}>ganhe 15 dias</strong>
          </div>
        </div>
        <div className={s.refBadge}>
          <Gift size={18} strokeWidth={1.75} aria-hidden />
        </div>
      </div>

      <div>
        <p className={s.refDesc}>
          Compartilhe seu link. Quando seu colega criar a conta, voce ganha 15 dias
          adicionais no seu plano atual. Sem limite de indicacoes.
        </p>

        <div className={s.refLinkRow}>
          <input
            type="text"
            readOnly
            value={data.shareUrl}
            className={s.refInput}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button className={s.refCopy} onClick={copyLink}>
            {copied
              ? <Check size={14} strokeWidth={2} aria-hidden />
              : <Clipboard size={14} strokeWidth={1.75} aria-hidden />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        {(data.stats.completed > 0 || data.stats.pending > 0) && (
          <div className={s.refStats}>
            <div>
              <div className={s.refStatN}>{data.stats.completed}</div>
              <div className={s.refStatLabel}>Concluidas</div>
            </div>
            <div>
              <div className={s.refStatN}>{data.stats.pending}</div>
              <div className={s.refStatLabel}>Pendentes</div>
            </div>
            <div>
              <div className={s.refStatN}>+{data.stats.totalDaysEarned}d</div>
              <div className={s.refStatLabel}>Bonus ganho</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
