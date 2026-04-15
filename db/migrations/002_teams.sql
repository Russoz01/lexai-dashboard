-- ───────────────────────────────────────────────────────────────────
-- Migration 002 — Multi-seat teams (equipes / membros / convites)
-- ───────────────────────────────────────────────────────────────────
-- Apply AFTER 001_audit_log.sql.
--
-- Enables the "Firma" and "Enterprise" plan tiers (6-15 / 16+ advogados
-- on a single contract). The seat count is validated by application
-- code against the active Stripe subscription quantity — the DB just
-- enforces referential integrity and access control.
--
-- Model:
--   equipes           — the team / workspace (owned by 1 user)
--   equipe_membros    — join table with role (owner | admin | member)
--   equipe_convites   — pending invites by email, expire in 7 days
--
-- Each user can belong to MANY teams (useful for lawyers who advise
-- multiple firms) but only ONE team can be their "active context"
-- at any moment — stored client-side in `current_team_id` cookie.
-- ───────────────────────────────────────────────────────────────────

-- ── 1. Equipes ────────────────────────────────────────────────────
create table if not exists public.equipes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 120),
  slug text unique,
  owner_id uuid not null references public.usuarios(id) on delete restrict,
  plano text not null default 'starter'
    check (plano in ('starter', 'pro', 'enterprise')),
  stripe_subscription_id text,
  seats_paid int not null default 1 check (seats_paid >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists equipes_owner_idx on public.equipes (owner_id);

-- ── 2. Membros ────────────────────────────────────────────────────
create table if not exists public.equipe_membros (
  equipe_id uuid not null references public.equipes(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (equipe_id, usuario_id)
);

create index if not exists equipe_membros_usuario_idx
  on public.equipe_membros (usuario_id);

-- ── 3. Convites ───────────────────────────────────────────────────
create table if not exists public.equipe_convites (
  id uuid primary key default gen_random_uuid(),
  equipe_id uuid not null references public.equipes(id) on delete cascade,
  email text not null,
  role text not null default 'member'
    check (role in ('admin', 'member')),
  invited_by uuid not null references public.usuarios(id) on delete cascade,
  token text not null unique,  -- random opaque token for the accept URL
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists equipe_convites_equipe_idx
  on public.equipe_convites (equipe_id);
create index if not exists equipe_convites_email_idx
  on public.equipe_convites (lower(email));

-- ── 4. RLS ────────────────────────────────────────────────────────
alter table public.equipes          enable row level security;
alter table public.equipe_membros   enable row level security;
alter table public.equipe_convites  enable row level security;

-- SELECT policies: member-of-equipe can read; convites via service role
drop policy if exists equipes_member_read on public.equipes;
create policy equipes_member_read
  on public.equipes for select
  using (exists (
    select 1 from public.equipe_membros m
    where m.equipe_id = equipes.id and m.usuario_id = auth.uid()
  ));

drop policy if exists equipe_membros_member_read on public.equipe_membros;
create policy equipe_membros_member_read
  on public.equipe_membros for select
  using (exists (
    select 1 from public.equipe_membros self
    where self.equipe_id = equipe_membros.equipe_id
      and self.usuario_id = auth.uid()
  ));

drop policy if exists equipe_convites_admin_read on public.equipe_convites;
create policy equipe_convites_admin_read
  on public.equipe_convites for select
  using (exists (
    select 1 from public.equipe_membros m
    where m.equipe_id = equipe_convites.equipe_id
      and m.usuario_id = auth.uid()
      and m.role in ('owner', 'admin')
  ));

-- WRITE policies: only owner/admin can mutate equipe state. All mutations
-- are funneled through server-side API routes (service role) so the RLS
-- below is belt-and-suspenders for the rare direct client write.

drop policy if exists equipes_owner_write on public.equipes;
create policy equipes_owner_write
  on public.equipes for update
  using (owner_id = auth.uid());

drop policy if exists equipe_membros_admin_delete on public.equipe_membros;
create policy equipe_membros_admin_delete
  on public.equipe_membros for delete
  using (exists (
    select 1 from public.equipe_membros m
    where m.equipe_id = equipe_membros.equipe_id
      and m.usuario_id = auth.uid()
      and m.role in ('owner', 'admin')
  ));

comment on table public.equipes is 'Multi-seat workspaces (planos pagos). Um owner + N admins/members.';
comment on column public.equipes.seats_paid is 'Seats pagos via Stripe subscription quantity. Aplicacao valida contra essa coluna.';
comment on table public.equipe_convites is 'Convites abertos por email. Token opaco consumido via /api/equipe/aceitar.';
