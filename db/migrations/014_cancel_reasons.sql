-- 013_cancel_reasons.sql (audit business P1-2 · 2026-05-03)
-- Save flow de cancelamento: antes de redirecionar pro Stripe Customer Portal,
-- pergunta "por que esta cancelando" e oferece counter-offer baseado no motivo.
--
-- Tabela armazena motivos pra:
--   1. Analise de churn (qual motivo mais frequente?)
--   2. A/B test de counter-offers (cupom 30% vs onboarding 1:1?)
--   3. Audit LGPD Art. 18 — usuario tem direito a saber por que cancelou.

create table if not exists public.cancel_reasons (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null references public.usuarios(id) on delete cascade,
  reason        text not null check (reason in ('caro', 'nao_usei', 'falta_feature', 'mudei_sistema', 'outro')),
  detail        text,                                -- texto livre opcional
  offered       text,                                -- counter-offer feita (cupom_30, onboarding, beta, pause)
  accepted      boolean,                             -- aceitou a counter-offer?
  proceeded     boolean not null default false,      -- foi pro Stripe Portal mesmo assim?
  created_at    timestamptz not null default now()
);

create index if not exists idx_cancel_reasons_usuario on public.cancel_reasons(usuario_id);
create index if not exists idx_cancel_reasons_reason on public.cancel_reasons(reason);

alter table public.cancel_reasons enable row level security;

-- RLS: usuario so ve as proprias razoes
create policy "cancel_reasons_own_read"
  on public.cancel_reasons for select
  using (usuario_id = (
    select id from public.usuarios where auth_user_id = auth.uid()
  ));

create policy "cancel_reasons_own_insert"
  on public.cancel_reasons for insert
  with check (usuario_id = (
    select id from public.usuarios where auth_user_id = auth.uid()
  ));

-- Coluna em usuarios pra rastrear ultimo cancelamento attempt (analytics)
alter table public.usuarios
  add column if not exists last_cancel_attempt_at timestamptz,
  add column if not exists last_cancel_reason text;

-- ===========================================================================
-- Audit business P2-4 (2026-05-03): signup_attribution JSONB pra UTM capture.
-- Coluna referred_by ja existe (migration 004), mas referred_by_code NAO —
-- adicionamos pra audit/debug (qual codigo foi usado, mesmo se row deletado).
-- ===========================================================================
alter table public.usuarios
  add column if not exists signup_attribution jsonb,
  add column if not exists referred_by_code text;
