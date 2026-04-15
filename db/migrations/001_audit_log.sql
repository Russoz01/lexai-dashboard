-- ───────────────────────────────────────────────────────────────────
-- Migration 001 — Audit Log (LGPD Art. 37 compliance)
-- ───────────────────────────────────────────────────────────────────
-- Apply via Supabase SQL Editor or `supabase db push`.
--
-- Records WHO did WHAT, WHEN, and FROM WHERE for sensitive actions.
-- This table is append-only: there is no UPDATE or DELETE policy.
-- Retention: keep indefinitely until legal team says otherwise (LGPD
-- does not cap audit retention; it's a compliance asset).
--
-- Actions we log today:
--   - user.data_export   (LGPD Art. 18 II)
--   - user.data_delete   (LGPD Art. 18 VI)
--   - user.login         (auth event mirror)
--   - user.plan_change   (upgrade / downgrade / cancel)
--   - user.oauth_connect (Google connected)
--   - user.oauth_revoke  (Google revoked)
--   - team.member_invite
--   - team.member_remove
--
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete set null,
  action text not null,
  entity_type text,            -- e.g. 'usuario', 'equipe', 'documento'
  entity_id text,              -- string-typed so we can log non-uuid refs
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_usuario_created_idx
  on public.audit_log (usuario_id, created_at desc);

create index if not exists audit_log_action_created_idx
  on public.audit_log (action, created_at desc);

-- RLS: every user sees only their OWN audit trail.
-- Writes happen through the service-role client on the server — RLS
-- does not block service role, so we only need SELECT policies here.
alter table public.audit_log enable row level security;

drop policy if exists audit_log_owner_read on public.audit_log;
create policy audit_log_owner_read
  on public.audit_log
  for select
  using (usuario_id = auth.uid());

-- NO insert/update/delete policies for anon/authenticated — only the
-- server (service_role) can write. This keeps the log tamper-resistant
-- from the client side.

comment on table  public.audit_log is 'LGPD-compliant append-only audit trail. Server-side writes only.';
comment on column public.audit_log.metadata is 'Free-form JSON payload per action type. NEVER store PII here (use entity_id references).';
