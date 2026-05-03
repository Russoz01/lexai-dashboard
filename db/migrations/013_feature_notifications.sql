-- ───────────────────────────────────────────────────────────────────
-- Migration 013 — feature_notifications (avise-me quando lançar)
-- ───────────────────────────────────────────────────────────────────
-- Suporta /api/notify-launch — quando user clica "Avisar quando lançar"
-- na pagina /dashboard/em-breve, gravamos a inscricao aqui pra disparar
-- email transacional via Resend quando a feature for lancada.
--
-- Policies: cada user so le/insere seus proprios registros (RLS via
-- auth.uid() join em usuarios). Insercao idempotente — duplicate (user,
-- feature_slug) returna no-op.
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.feature_notifications (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  feature_slug text not null check (length(feature_slug) between 1 and 60),
  notified boolean not null default false,
  created_at timestamptz not null default now(),
  notified_at timestamptz null
);

-- Dedup: mesmo user nao pode pedir aviso 2x pra mesma feature
create unique index if not exists feature_notifications_user_feature_uniq
  on public.feature_notifications (usuario_id, feature_slug);

-- Indice pra worker que enviar emails (filter por feature pendente)
create index if not exists feature_notifications_feature_pending_idx
  on public.feature_notifications (feature_slug)
  where notified = false;

alter table public.feature_notifications enable row level security;

-- Self-read
drop policy if exists feature_notifications_self_read on public.feature_notifications;
create policy feature_notifications_self_read on public.feature_notifications
  for select to authenticated
  using (
    usuario_id in (select id from public.usuarios where auth_user_id = auth.uid())
  );

-- Self-insert
drop policy if exists feature_notifications_self_insert on public.feature_notifications;
create policy feature_notifications_self_insert on public.feature_notifications
  for insert to authenticated
  with check (
    usuario_id in (select id from public.usuarios where auth_user_id = auth.uid())
  );

-- (sem update/delete por user — admin only via service role)

comment on table public.feature_notifications is
  'Inscricoes "avise-me quando lancar" — disparadas em /dashboard/em-breve.';
