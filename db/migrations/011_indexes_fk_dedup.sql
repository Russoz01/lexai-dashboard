-- ───────────────────────────────────────────────────────────────────
-- Migration 011 — Indexes em FKs faltando + drop duplicate
-- ───────────────────────────────────────────────────────────────────
-- Audit elite (2026-05-03): 4 FKs sem index causam seq scan em
-- DELETE/UPDATE cascade. Em tabelas que crescem (drafts, equipe_convites,
-- referrals, usuarios), isso vira N^2 em onboarding/team flows.
--
-- Tambem: user_quotas tem 2 unique constraints identicas (legacy de
-- migration mal feita). Drop a duplicada — mantem _key (formato Supabase
-- canonico).
--
-- NOTA: CREATE INDEX CONCURRENTLY nao roda em transaction (PG limitation).
-- Migrations Supabase rodam em transaction, entao usa CREATE INDEX comum.
-- Em tabelas pequenas (atualmente <1k rows todas), lock eh negligivel.
-- Pra rodar CONCURRENTLY em PROD futuro, fazer manualmente via psql.
--
-- Idempotente: CREATE INDEX IF NOT EXISTS + DROP IF EXISTS.
-- ───────────────────────────────────────────────────────────────────

-- ─── FK indexes faltando (4) ─────────────────────────────────────────
create index if not exists drafts_parent_id_idx
  on public.drafts (parent_id);

create index if not exists equipe_convites_invited_by_idx
  on public.equipe_convites (invited_by);

create index if not exists referrals_referred_id_idx
  on public.referrals (referred_id);

create index if not exists usuarios_referred_by_idx
  on public.usuarios (referred_by);

-- ─── Drop duplicate unique constraint em user_quotas ─────────────────
-- Antes: 2 unique constraints em (usuario_id, agente, mes) — 1 nomeada
-- _unique (legado), 1 nomeada _key (Supabase canonico). Mantem _key,
-- dropa _unique. O index nao pode ser dropado direto pq eh backed por
-- CONSTRAINT — usa ALTER TABLE DROP CONSTRAINT que dropa ambos.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'user_quotas_usuario_agente_mes_unique'
      and conrelid = 'public.user_quotas'::regclass
  ) then
    alter table public.user_quotas
      drop constraint user_quotas_usuario_agente_mes_unique;
  end if;
end $$;

comment on index public.drafts_parent_id_idx is
  'Index em FK drafts.parent_id pra evitar seq scan em DELETE cascade. Audit 2026-05-03 (migration 011).';

comment on index public.equipe_convites_invited_by_idx is
  'Index em FK equipe_convites.invited_by pra evitar seq scan em DELETE cascade. Audit 2026-05-03 (migration 011).';

comment on index public.referrals_referred_id_idx is
  'Index em FK referrals.referred_id pra evitar seq scan em DELETE cascade. Audit 2026-05-03 (migration 011).';

comment on index public.usuarios_referred_by_idx is
  'Index em FK usuarios.referred_by (self-FK) pra evitar seq scan em DELETE cascade. Audit 2026-05-03 (migration 011).';
