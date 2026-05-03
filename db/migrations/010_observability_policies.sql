-- ───────────────────────────────────────────────────────────────────
-- Migration 010 — RLS policies explicitas em tabelas observability
-- ───────────────────────────────────────────────────────────────────
-- Audit elite (2026-05-03): rate_limit_events e stripe_events tinham
-- RLS enabled SEM policy explicita. PG comportamento: RLS enabled +
-- nenhuma policy = ninguem (exceto roles BYPASSRLS) le/escreve.
-- Funciona via service_role (BYPASSRLS), mas eh implicit — risco que
-- um dev futuro adicione policy permissiva acidentalmente.
--
-- Esta migration adiciona policies EXPLICITAS service_role-only —
-- bloqueio claro, intencional, documentado. Bloqueia leitura
-- acidental futura por authenticated.
--
-- Idempotente.
-- ───────────────────────────────────────────────────────────────────

-- ─── rate_limit_events ───────────────────────────────────────────────
alter table if exists public.rate_limit_events enable row level security;

drop policy if exists rate_limit_events_service_only on public.rate_limit_events;
create policy rate_limit_events_service_only on public.rate_limit_events
  for all
  to service_role
  using (true)
  with check (true);

comment on policy rate_limit_events_service_only on public.rate_limit_events is
  'Tabela observability — apenas service_role grava/le. Bloqueio explicito impede leitura acidental futura via authenticated. Audit 2026-05-03 (migration 010).';

-- ─── stripe_events ───────────────────────────────────────────────────
alter table if exists public.stripe_events enable row level security;

drop policy if exists stripe_events_service_only on public.stripe_events;
create policy stripe_events_service_only on public.stripe_events
  for all
  to service_role
  using (true)
  with check (true);

comment on policy stripe_events_service_only on public.stripe_events is
  'Tabela observability — apenas service_role grava/le. Bloqueio explicito impede leitura acidental futura via authenticated. Audit 2026-05-03 (migration 010).';
