/**
 * Audit log helper — LGPD Art. 37 compliance layer.
 *
 * Centralizes all writes to `public.audit_log`. Uses the service-role
 * admin client because RLS blocks client-side writes by design (the
 * table is append-only from the server).
 *
 * Design notes:
 * - Fire-and-forget by default (errors are logged but never thrown).
 *   An audit failure MUST NOT block the primary action (e.g. a user
 *   deleting their account shouldn't fail because the log write failed).
 * - NEVER pass raw PII into `metadata`. Use `entity_id` references
 *   and `action` taxonomy instead.
 * - IP + User-Agent extraction is opt-in via the `request` param —
 *   callers inside API routes should pass it; webhooks/cron can skip.
 */

import { createAdminClient } from './supabase/admin'
import * as Sentry from '@sentry/nextjs'
import type { NextRequest } from 'next/server'

export type AuditAction =
  | 'user.login'
  | 'user.data_export'
  | 'user.data_delete'
  | 'user.plan_change'
  | 'user.oauth_connect'
  | 'user.oauth_revoke'
  | 'team.member_invite'
  | 'team.member_accept'
  | 'team.member_remove'
  | 'team.role_change'
  | 'document.share'
  | 'document.unshare'

export interface AuditEntry {
  usuarioId: string | null
  action: AuditAction
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  request?: NextRequest | Request
}

/**
 * Extract IP + User-Agent from a request without leaking them downstream.
 * Vercel populates `x-forwarded-for`; local dev will return undefined.
 */
function extractRequestContext(req: NextRequest | Request | undefined) {
  if (!req) return { ip: null as string | null, userAgent: null as string | null }
  const headers = req.headers
  const fwd = headers.get('x-forwarded-for') || ''
  const ip = fwd.split(',')[0]?.trim() || headers.get('x-real-ip') || null
  const userAgent = headers.get('user-agent') || null
  return { ip, userAgent }
}

/**
 * Log an audited action. Non-blocking — errors go to Sentry but
 * never bubble up to the caller.
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    const { ip, userAgent } = extractRequestContext(entry.request)
    const admin = createAdminClient()
    const { error } = await admin.from('audit_log').insert({
      usuario_id: entry.usuarioId,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
      ip_address: ip,
      user_agent: userAgent,
    })
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[audit] insert failed', error)
      Sentry.captureMessage('audit_log_insert_failed', {
        level: 'warning',
        tags: { action: entry.action },
        extra: { error: error.message },
      })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[audit] unexpected error', err)
    Sentry.captureException(err, {
      tags: { source: 'audit_log', action: entry.action },
    })
  }
}
