-- ───────────────────────────────────────────────────────────────────
-- Migration 006 — User preferences + cross-agent memory
-- ───────────────────────────────────────────────────────────────────
-- Reproduz o schema aplicado direto em PROD durante Wave brain-upgrade
-- (commits 8acad56 / 08b4c50 / ee71db6, 2026-05-03). Schema vivia só em
-- PROD — sem migration commitada = rollback impossível, dev novo não
-- consegue reproduzir o ambiente.
--
-- Esta migration é IDEMPOTENTE: roda múltiplas vezes sem erro.
--
-- Tables:
--  - user_preferences: 1 linha por usuario (tom IA, modelo padrao, toggles)
--  - agent_memory: cross-agent memory com TTL 90 dias (purge job em 007)
--
-- Acesso: RLS user-own via auth.uid() → usuarios.auth_user_id.
-- ───────────────────────────────────────────────────────────────────

-- ─── user_preferences ────────────────────────────────────────────────
create table if not exists public.user_preferences (
  usuario_id uuid primary key references public.usuarios(id) on delete cascade,
  tom text not null default 'parceiro',
  idioma text not null default 'pt-BR',
  modelo_padrao text not null default 'haiku',
  area_juridica_padrao text,
  auto_save_delay_ms integer default 1500,
  notif_push boolean not null default true,
  notif_email boolean not null default true,
  notif_prazos boolean not null default true,
  smart_suggestions boolean not null default true,
  memory_enabled boolean not null default true,
  atalhos jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CHECK constraints (idempotentes — só adiciona se não existir)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'user_preferences_tom_check') then
    alter table public.user_preferences
      add constraint user_preferences_tom_check
      check (tom in ('profissional', 'parceiro', 'casual'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'user_preferences_modelo_check') then
    alter table public.user_preferences
      add constraint user_preferences_modelo_check
      check (modelo_padrao in ('haiku', 'sonnet'));
  end if;
end $$;

comment on table public.user_preferences is
  'Preferencias por usuario (tom IA, modelo padrao, toggles memoria/notif). 1:1 com usuarios.';

-- ─── agent_memory ────────────────────────────────────────────────────
create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  agente text not null,
  resumo text not null,
  fatos jsonb default '[]'::jsonb,
  tags text[] default '{}'::text[],
  historico_id uuid references public.historico(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'agent_memory_resumo_length_check') then
    alter table public.agent_memory
      add constraint agent_memory_resumo_length_check
      check (length(resumo) <= 500);
  end if;
end $$;

comment on table public.agent_memory is
  'Cross-agent memory (TTL 90 dias). Lido por chat orquestrador para smart suggestions e por agentes para contextualizar. Purge automatico em 007_agent_memory_cron.sql.';

-- ─── Indexes ─────────────────────────────────────────────────────────
create index if not exists agent_memory_usuario_agente_created_idx
  on public.agent_memory (usuario_id, agente, created_at desc);

create index if not exists agent_memory_expires_idx
  on public.agent_memory (expires_at);

create index if not exists agent_memory_tags_gin
  on public.agent_memory using gin (tags);

-- ─── RLS ─────────────────────────────────────────────────────────────
alter table public.user_preferences enable row level security;
alter table public.agent_memory enable row level security;

-- Policies idempotentes via DROP IF EXISTS + CREATE
-- (CREATE POLICY IF NOT EXISTS só existe em PG ≥ 15, mas DROP+CREATE é portavel)

drop policy if exists user_preferences_select_own on public.user_preferences;
create policy user_preferences_select_own on public.user_preferences
  for select
  using (usuario_id in (select id from public.usuarios where auth_user_id = auth.uid()));

drop policy if exists user_preferences_insert_own on public.user_preferences;
create policy user_preferences_insert_own on public.user_preferences
  for insert
  with check (usuario_id in (select id from public.usuarios where auth_user_id = auth.uid()));

drop policy if exists user_preferences_update_own on public.user_preferences;
create policy user_preferences_update_own on public.user_preferences
  for update
  using (usuario_id in (select id from public.usuarios where auth_user_id = auth.uid()));

drop policy if exists agent_memory_select_own on public.agent_memory;
create policy agent_memory_select_own on public.agent_memory
  for select
  using (usuario_id in (select id from public.usuarios where auth_user_id = auth.uid()));

drop policy if exists agent_memory_insert_own on public.agent_memory;
create policy agent_memory_insert_own on public.agent_memory
  for insert
  with check (usuario_id in (select id from public.usuarios where auth_user_id = auth.uid()));

drop policy if exists agent_memory_delete_own on public.agent_memory;
create policy agent_memory_delete_own on public.agent_memory
  for delete
  using (usuario_id in (select id from public.usuarios where auth_user_id = auth.uid()));

-- Nao tem UPDATE policy em agent_memory (memorias sao append-only por design).
-- Nao tem DELETE policy em user_preferences (purge feito via cascade quando usuarios.delete).
