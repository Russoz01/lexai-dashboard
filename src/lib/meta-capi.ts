/* ════════════════════════════════════════════════════════════════════
 * Meta Conversions API (CAPI) · server-side event tracking
 * ────────────────────────────────────────────────────────────────────
 * Audit business P0-2 (2026-05-03): pixel client-side perde 30-50% de
 * eventos por adblock/iOS-ITP. Conversions API server-side recupera
 * Purchase + signup com hashed PII (LGPD-safe — SHA256 IRREVERSIVEL).
 *
 * Eventos disparados aqui (server-only):
 *   - CompleteRegistration  → /auth/callback (signup confirmado)
 *   - Purchase              → /api/webhooks/stripe (charge succeeded)
 *
 * Dedup com pixel client-side via event_id determinístico — Meta cruza
 * client-side fbq + server-side capi e mantém um único evento.
 *
 * Env vars necessarias (sem nada => no-op silencioso):
 *   - META_CAPI_TOKEN          (token gerado em Events Manager)
 *   - NEXT_PUBLIC_META_PIXEL_ID (mesmo do client-side)
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 * ═══════════════════════════════════════════════════════════════════ */

import crypto from 'crypto'
import { safeLog } from './safe-log'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN
const API_VERSION = 'v18.0'

interface CapiEventInput {
  eventName: 'CompleteRegistration' | 'Purchase' | 'InitiateCheckout'
  eventId: string                  // dedup com pixel client-side
  email?: string                   // raw — sera SHA256 internamente
  externalId?: string              // user.id — opcional
  value?: number                   // BRL
  currency?: string                // default 'BRL'
  sourceUrl?: string
}

function sha256Lower(v: string): string {
  return crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex')
}

/**
 * Envia evento pra Meta CAPI. Silent no-op se env vars ausentes ou erro.
 * Sempre retorna void — analytics nunca pode quebrar fluxo.
 */
export async function sendMetaEvent(input: CapiEventInput): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return

  const userData: Record<string, unknown> = {}
  if (input.email) userData.em = sha256Lower(input.email)
  if (input.externalId) userData.external_id = sha256Lower(input.externalId)

  const customData: Record<string, unknown> = {
    currency: input.currency || 'BRL',
  }
  if (typeof input.value === 'number') customData.value = input.value

  const payload = {
    data: [{
      event_name: input.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,                       // dedup
      action_source: 'website',
      event_source_url: input.sourceUrl,
      user_data: userData,
      custom_data: customData,
    }],
  }

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '<no body>')
      safeLog.warn('[meta-capi] non-2xx', res.status, body.slice(0, 200))
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    safeLog.warn('[meta-capi] send failed', msg)
  }
}
